"""測試用 repo：重置、建立情境需要的前置狀態（issue、分支、變更提案、留言、合併）。

只操作 framework/tests/sandbox.json 指定的測試 repo；指定成正式 repo（framework/config.json）會直接拒絕。
重置時把要測的那一版框架接在測試 repo 的 main 後面推上去（一般推送，不強制），
所以測試 repo 的歷史會一直變長，但內容每次都是乾淨的。issue 每次全部刪掉；提案刪不掉，只會關掉。
"""
import json
import pathlib
import re
import shlex
import shutil
import subprocess
import time

ROOT = pathlib.Path(__file__).resolve().parents[2]
OFFICIAL = json.loads((ROOT / 'framework/config.json').read_text(encoding='utf-8')).get('repo')
SANDBOX = json.loads((ROOT / 'framework/tests/sandbox.json').read_text(encoding='utf-8'))['repo']
if SANDBOX == OFFICIAL:
    raise SystemExit(f'測試 repo 不能是正式 repo（{OFFICIAL}）；請改 framework/tests/sandbox.json')

# 測試 repo 需要的標籤（和正式 repo 一樣）
LABELS = [
    ('待回答', 'a8660a', '手冊沒寫到的問題'), ('勘誤', 'b3261e', '手冊可能寫錯'),
    ('來歷:研究', 'b3541e', 'Agent 用自己的知識和找到的資料寫'), ('來歷:整理', '1f7a4d', '改寫自參考資料'),
    ('來歷:訪談', '6a4bb5', '傳承者口述'),
]


def sh(cmd, cwd=None, check=True, input=None):
    r = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, input=input)
    if check and r.returncode:
        raise RuntimeError(f'指令失敗：{" ".join(map(str, cmd))}\n{r.stderr.strip()}')
    return r.stdout.strip()


def gh(*args, check=True):
    return sh(['gh', *args, '-R', SANDBOX], check=check)


def api(path, method='GET', check=True):
    return sh(['gh', 'api', '-X', method, f'repos/{SANDBOX}/{path}'], check=check)


def latest():
    """測試 repo 目前最大的 issue／提案編號（兩者共用編號）。"""
    out = api('issues?state=all&per_page=1', check=False)
    items = json.loads(out or '[]')
    return items[0]['number'] if items else 0


def recent(start):
    """編號大於 start 的 issue 和提案：[(編號, 是不是提案)]，由小到大。"""
    items = json.loads(api('issues?state=all&per_page=100') or '[]')
    return sorted((x['number'], 'pull_request' in x) for x in items if x['number'] > start)


def clone(dest):
    """從測試 repo 拉一份乾淨的工作目錄。"""
    if dest.exists():
        shutil.rmtree(dest)
    sh(['gh', 'repo', 'clone', SANDBOX, str(dest), '--', '--quiet'])
    return dest


def reset(ref, work):
    """把測試 repo 的 main 換成 ref 那一版框架，刪掉所有 issue，關掉所有提案，刪掉其他分支。回傳新的 main commit。"""
    src = work / 'src'
    if src.exists():
        shutil.rmtree(src)
    sh(['git', 'clone', '--quiet', str(ROOT), str(src)])
    sh(['git', 'checkout', '--quiet', ref], cwd=src)
    label = sh(['git', 'log', '-1', '--format=%h %s', ref], cwd=src)
    # 測試用設定：主機指向測試 repo，首頁清單跟著重產
    cfg_path = src / 'framework/config.json'
    cfg = json.loads(cfg_path.read_text(encoding='utf-8'))
    cfg['repo'] = SANDBOX
    cfg_path.write_text(json.dumps(cfg, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    sh(['python3', 'framework/tools/build.py', '--readme'], cwd=src)
    # 情境檔寫著目標和評分標準，被測的 Agent 不能看到
    shutil.rmtree(src / 'framework/tests', ignore_errors=True)
    sh(['git', 'add', '-A'], cwd=src)
    tree = sh(['git', 'write-tree'], cwd=src)
    sh(['git', 'remote', 'add', 'sandbox', f'https://github.com/{SANDBOX}.git'], cwd=src)
    parent = []
    if sh(['git', 'ls-remote', 'sandbox', 'refs/heads/main'], cwd=src):
        sh(['git', 'fetch', '--quiet', 'sandbox', 'main'], cwd=src)
        parent = ['-p', sh(['git', 'rev-parse', 'FETCH_HEAD'], cwd=src)]
    commit = sh(['git', 'commit-tree', tree, *parent, '-m', f'測試：重置成 {label}'], cwd=src)
    sh(['git', 'push', '--quiet', 'sandbox', f'{commit}:refs/heads/main'], cwd=src)
    for n in json.loads(gh('pr', 'list', '--state', 'open', '--json', 'number', '--limit', '200') or '[]'):
        gh('pr', 'close', str(n['number']), '--delete-branch', check=False)
    # issue 全部刪掉：之前的情境留下的同一個問題，會被 Agent 當成重複的 issue（提案刪不掉，只關掉）
    for n in json.loads(gh('issue', 'list', '--state', 'all', '--json', 'number', '--limit', '1000') or '[]'):
        gh('issue', 'delete', str(n['number']), '--yes', check=False)
    for b in json.loads(api('branches?per_page=100') or '[]'):
        if b['name'] != 'main':
            api(f'git/refs/heads/{b["name"]}', 'DELETE', check=False)
    kbs = sorted(p.name for p in (src / 'kb').iterdir() if (p / 'README.md').exists())
    for name, color, desc in LABELS + [(f'kb:{k}', '1f4fb5', k) for k in kbs]:
        gh('label', 'create', name, '--color', color, '--description', desc, '--force')
    return commit


def fill(text, vars):
    """把 {變數} 換成前置步驟產生的值（issue、提案編號）。"""
    return re.sub(r'\{(\w+)\}', lambda m: str(vars.get(m.group(1), m.group(0))), text)


def apply_edit(root, e, vars):
    f = root / e['file']
    s = f.read_text(encoding='utf-8')
    text = fill(e.get('text', ''), vars)
    if 'before' in e:
        i = s.index(e['before'])
        s = s[:i] + text + s[i:]
    elif 'append' in e:
        s = s.rstrip('\n') + '\n' + fill(e['append'], vars)
    elif 'replace' in e:
        old, new = e['replace']
        assert old in s, f'{e["file"]} 找不到要取代的文字：{old[:30]}'
        s = s.replace(old, fill(new, vars), 1)
    f.write_text(s, encoding='utf-8')


def wait_checks(pr, timeout=600):
    end = time.time() + timeout
    while time.time() < end:
        out = gh('pr', 'checks', str(pr), check=False)
        if out and 'pending' not in out:
            return 'fail' not in out
        time.sleep(10)
    return False


def setup(steps, work, vars):
    """照情境的 setup 建立前置狀態。vars 會被填入 issue 和提案編號。"""
    fx = None
    for step in steps:
        if 'issue' in step:
            s = step['issue']
            args = ['issue', 'create', '--title', fill(s['title'], vars), '--body', fill(s.get('body', ''), vars)]
            for l in s.get('labels', []):
                args += ['--label', l]
            url = gh(*args)
            vars[s['var']] = int(url.rstrip('/').split('/')[-1])
        elif 'branch' in step:
            s = step['branch']
            fx = clone(work / 'fixture')
            sh(['git', 'switch', '--quiet', '-c', s['name']], cwd=fx)
            for e in s['edits']:
                apply_edit(fx, e, vars)
            for cmd in s.get('run', []):  # 例如更新簡報頁的指紋，讓前置提案本身通過檢查
                sh(shlex.split(cmd), cwd=fx)
            sh(['git', 'commit', '--quiet', '-am', fill(s['commit'], vars)], cwd=fx)
            sh(['git', 'push', '--quiet', '-u', 'origin', s['name']], cwd=fx)
            if 'pr' in s:
                p = s['pr']
                args = ['pr', 'create', '--base', 'main', '--head', s['name'], '--title', fill(p['title'], vars),
                        '--body', fill(p.get('body', ''), vars)]
                for l in p.get('labels', []):
                    args += ['--label', l]
                url = gh(*args)
                vars[p['var']] = int(url.rstrip('/').split('/')[-1])
                vars[p['var'] + '_commits'] = 1
        elif 'comment' in step:
            s = step['comment']
            gh('pr', 'comment', str(vars[s['pr']]), '--body', fill(s['body'], vars))
        elif 'merge' in step:
            pr = vars[step['merge']]
            wait_checks(pr)
            gh('pr', 'merge', str(pr), '--squash', '--delete-branch')
        elif 'wait_release' in step:
            sha = step['wait_release'][:7] if isinstance(step['wait_release'], str) else vars.get('reset_sha', '')[:7]
            end = time.time() + 600
            while time.time() < end:
                rel = gh('release', 'list', '--limit', '1', check=False)
                if sha and sha in rel:
                    break
                time.sleep(15)
    return vars
