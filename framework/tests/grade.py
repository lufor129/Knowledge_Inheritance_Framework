"""評分：先收集測試 repo 上的結果，再逐條檢查。

能用程式判斷的（有沒有開 issue、標籤、提案說明、檔案內容、檢查有沒有過）由 CHECKS 處理；
要看內容才能判斷的（回答有沒有只根據手冊、有沒有先問使用者）交給評分模型。
每一條都輸出 {text, passed, evidence}，格式和 skill-creator 的 grading.json 一樣。
"""
import json
import re
import shutil
import subprocess

import sandbox as S

PROMPTS = S.ROOT / 'framework/tests/prompts'


# ---------- 收集結果 ----------

def collect(clone, start, before):
    """這個情境建立的 issue 和提案（編號大於 start），以及哪些是對話中新開的（編號大於 before）。

    一次列出所有提案的留言和 commit 會超過 GitHub 的查詢上限，所以逐一讀取。
    """
    S.sh(['git', 'fetch', '--quiet', 'origin', '+refs/heads/*:refs/remotes/origin/*', '+refs/pull/*/head:refs/remotes/pr/*'], cwd=clone)
    issues, prs = [], []
    for n, is_pr in S.recent(start):
        if is_pr:
            prs.append(json.loads(S.gh('pr', 'view', str(n), '--json',
                                       'number,title,body,state,labels,headRefName,comments,commits,files,reviews')))
        else:
            issues.append(json.loads(S.gh('issue', 'view', str(n), '--json',
                                          'number,title,body,state,labels,assignees,comments')))
    for x in issues + prs:
        x['labels'] = [l['name'] for l in x.get('labels', [])]
        x['new'] = x['number'] > before
    return {'issues': issues, 'prs': prs}


def state_md(state):
    out = ['# 測試 repo 的結果', '']
    for kind, items in (('issue', state['issues']), ('變更提案', state['prs'])):
        for x in sorted(items, key=lambda x: x['number']):
            tag = '（這次新開）' if x['new'] else ''
            out.append(f'## {kind} #{x["number"]} {x["state"]}{tag}：{x["title"]}')
            out.append(f'標籤：{"、".join(x["labels"]) or "（無）"}')
            if 'headRefName' in x:
                out.append(f'分支：{x["headRefName"]}；commit 數：{len(x.get("commits", []))}；'
                           f'改到的檔案：{"、".join(f["path"] for f in x.get("files", []))}')
            out += ['', (x.get('body') or '').strip(), '']
            for c in x.get('comments', []):
                out += [f'> 留言：{c["body"].strip()[:1500]}', '']
    return '\n'.join(out)


# ---------- 程式檢查 ----------

def _ref(clone, ref, state, vars):
    """'main'、'pr:{變數}' 或 'pr:new'（這次新開的第一個提案）轉成 git 參照。"""
    if ref == 'main':
        return 'origin/main'
    key = ref.split(':', 1)[1]
    if key == 'new':
        new = [p for p in state['prs'] if p['new']]
        return f'pr/{new[0]["number"]}' if new else None
    return f'pr/{vars[key]}'


def _show(clone, ref, path):
    r = subprocess.run(['git', 'show', f'{ref}:{path}'], cwd=clone, capture_output=True, text=True)
    return r.stdout if r.returncode == 0 else None


def _labels_ok(x, want):
    return all(l in x['labels'] for l in want)


def check(c, ctx):
    """回傳 (passed, evidence)。"""
    t, st, vars, clone, tr = c['type'], ctx['state'], ctx['vars'], ctx['clone'], ctx['transcript']
    f = lambda s: S.fill(s, vars) if isinstance(s, str) else s
    bash = [x['input'].get('command', '') for x in tr['tools'] if x['name'] == 'Bash']
    if t == 'skill':
        names = c.get('names') or [c['name']]
        used = [x['input'].get('skill') for x in tr['tools'] if x['name'] == 'Skill']
        slash = any(m.strip().startswith('/' + n) for m in tr['user'] for n in names)
        ok = any(n in used for n in names) or slash
        return ok, f'用到的 skill：{used or "（無）"}' + ('；使用者直接輸入了指令' if slash else '')
    if t == 'ran':
        hit = [b for b in bash if re.search(f(c['pattern']), b)]
        return bool(hit), (hit[0][:200] if hit else f'沒有執行過符合 {c["pattern"]} 的指令')
    if t == 'ran_before':
        a = [i for i, b in enumerate(bash) if re.search(f(c['first']), b)]
        b = [i for i, x in enumerate(bash) if re.search(f(c['then']), x)]
        ok = bool(a) and bool(b) and a[0] < b[0]
        return ok, f'先：{"第 %d 個指令" % (a[0] + 1) if a else "沒有"}；後：{"第 %d 個指令" % (b[0] + 1) if b else "沒有"}'
    if t == 'reply':
        hit = [r for r in tr['agent'] if re.search(f(c['pattern']), r)]
        return bool(hit), (re.search(f(c['pattern']), hit[0]).group(0) if hit else '回覆裡找不到')
    if t == 'issue':
        cand = [i for i in st['issues'] if i['new'] and _labels_ok(i, c.get('labels', []))
                and re.search(f(c.get('title', '')), i['title']) and re.search(f(c.get('body', '')), i['body'] or '')]
        return bool(cand), (f'#{cand[0]["number"]}：{cand[0]["title"]}（{"、".join(cand[0]["labels"])}）' if cand
                            else f'這次新開的 issue：{[(i["number"], i["labels"]) for i in st["issues"] if i["new"]] or "（無）"}')
    if t == 'issue_state':
        n = int(f(c['issue']))
        i = next((i for i in st['issues'] if i['number'] == n), None)
        return bool(i) and i['state'] == c['state'], f'#{n} 現在是 {i["state"] if i else "找不到"}'
    if t == 'pr':
        cand = [p for p in st['prs'] if p['new'] and _labels_ok(p, c.get('labels', []))
                and re.search(f(c.get('body', '')), p['body'] or '') and re.search(f(c.get('head', '')), p['headRefName'])
                and (not c.get('state') or p['state'] == c['state'])
                and not any(l.startswith(c.get('no_label_prefix', '\0')) for l in p['labels'])]
        new = [(p['number'], p['state'], p['labels']) for p in st['prs'] if p['new']]
        return bool(cand), (f'#{cand[0]["number"]} {cand[0]["state"]}：{cand[0]["title"]}' if cand else f'這次新開的提案：{new or "（無）"}')
    if t == 'no_new_pr':
        new = [p['number'] for p in st['prs'] if p['new']]
        return not new, f'這次新開的提案：{new or "（無）"}'
    if t == 'pr_state':
        n = int(f(c['pr']))
        p = next((p for p in st['prs'] if p['number'] == n), None)
        return bool(p) and p['state'] == c['state'], f'#{n} 現在是 {p["state"] if p else "找不到"}'
    if t == 'pr_comment':
        n = int(f(c['pr']))
        p = next((p for p in st['prs'] if p['number'] == n), {'comments': [], 'reviews': []})
        bodies = [x['body'] for x in p.get('comments', [])] + [x.get('body', '') for x in p.get('reviews', [])]
        hit = [b for b in bodies if re.search(f(c['pattern']), b)]
        return bool(hit), (hit[0][:200] if hit else f'#{n} 的留言裡找不到 {c["pattern"]}')
    if t == 'pr_new_commits':
        n = int(f(c['pr']))
        p = next((p for p in st['prs'] if p['number'] == n), {'commits': []})
        k = len(p.get('commits', []))
        return k > vars.get(c['pr'].strip('{}') + '_commits', 1), f'#{n} 有 {k} 個 commit'
    if t == 'file':
        ref = _ref(clone, c.get('ref', 'main'), st, vars)
        text = _show(clone, ref, f(c['path'])) if ref else None
        if text is None:
            return bool(c.get('absent')) and c.get('missing_ok', False), f'{c.get("ref", "main")} 上沒有 {c["path"]}'
        m = re.search(f(c['pattern']), text, re.M)
        ok = (m is None) if c.get('absent') else (m is not None)
        return ok, (f'找到：{m.group(0)[:120]}' if m else f'{c["path"]} 裡沒有 {c["pattern"]}')
    if t == 'check_ok':
        ref = _ref(clone, c.get('ref', 'main'), st, vars)
        if not ref:
            return False, '沒有可以檢查的提案'
        wt = ctx['work'] / 'check-wt'
        if wt.exists():
            shutil.rmtree(wt)
        S.sh(['git', 'worktree', 'add', '--quiet', '--detach', str(wt), ref], cwd=clone)
        r = subprocess.run(['python3', 'framework/tools/check.py'], cwd=wt, capture_output=True, text=True)
        S.sh(['git', 'worktree', 'remove', '--force', str(wt)], cwd=clone)
        last = r.stdout.strip().splitlines()[-1] if r.stdout.strip() else r.stderr.strip()[:200]
        return r.returncode == 0, f'{ref}：{last}'
    if t == 'local_file':
        p = clone / c['path']
        text = p.read_text(encoding='utf-8') if p.exists() else ''
        m = re.search(f(c.get('pattern', '.')), text) if text else None
        return bool(m), (text.strip()[:150] if text else f'{c["path"]} 不存在')
    if t == 'changed_files':
        p = next((p for p in st['prs'] if p['new']), None)
        files = [x['path'] for x in p.get('files', [])] if p else []
        ok = bool(p) and any(re.search(c['includes'], x) for x in files) and not any(re.search(c.get('excludes', '\0'), x) for x in files)
        return ok, f'改到的檔案：{files or "（沒有新提案）"}'
    raise ValueError(f'不認得的檢查：{t}')


# ---------- 權限：同仁實際用的時候要按幾次「允許」 ----------

# Claude Code 本來就不會問的唯讀指令（估計值，不是 Claude Code 的完整清單）
READ_ONLY = ('ls', 'cat', 'head', 'tail', 'wc', 'grep', 'rg', 'find', 'pwd', 'echo', 'sort', 'date', 'cd', 'which',
             'sed -n', 'git status', 'git diff', 'git log', 'git show', 'git branch', 'git grep', 'git rev-parse',
             'git ls-files')


def _rules(settings):
    allow = settings.get('permissions', {}).get('allow', []) if settings else []
    bash = [r[5:-1] for r in allow if r.startswith('Bash(') and r.endswith(')')]
    return [(b[:-2].rstrip(), True) if b.endswith(':*') else (b, False) for b in bash], allow


def _covered(part, rules):
    for prefix, wild in rules:
        if part == prefix or (wild and part.startswith(prefix)):
            return True
    return any(part == r or part.startswith(r + ' ') for r in READ_ONLY)


def would_prompt(tools, settings):
    """照被測版本的 .claude/settings.json，估計同仁會被問幾次。

    一個 Bash 指令用 &&、||、;、| 拆開，每段都要被允許（Claude Code 的做法）；
    同一種指令（前三個字）同仁按過「不再詢問」就不會再問，所以也算不重複的種類數。
    """
    import shlex
    rules, allow = _rules(settings)
    asks, kinds = 0, set()
    for t in tools:
        if t['name'] == 'Bash':
            parts = [p.strip() for p in re.split(r'&&|\|\||;|\|', t['input'].get('command', '')) if p.strip()]
            parts = [re.sub(r'^(\w+=\S+\s+)+', '', p) for p in parts]  # 開頭的環境變數
            miss = [p for p in parts if not _covered(p, rules)]
        elif t['name'] in ('WebFetch', 'WebSearch'):
            miss = [] if t['name'] in allow or any(r.startswith(t['name'] + '(') for r in allow) else [t['name']]
        else:
            continue
        if miss:
            asks += 1
            for p in miss:
                try:
                    words = shlex.split(p)[:3]
                except ValueError:
                    words = p.split()[:3]
                kinds.add(' '.join(words))
    return {'tool_calls_needing_approval': asks, 'distinct_commands_needing_approval': len(kinds),
            'examples': sorted(kinds)[:30]}


# ---------- 評分模型 ----------

def judge(criteria, transcript_md, state, vars, model, work):
    if not criteria:
        return []
    items = '\n'.join(f'{i + 1}. {S.fill(c, vars)}' for i, c in enumerate(criteria))
    prompt = (PROMPTS / 'judge.md').read_text(encoding='utf-8').replace('{criteria}', items) \
        .replace('{transcript}', transcript_md).replace('{state}', state_md(state))
    out = ask(prompt, model, work)
    m = re.search(r'\[\s*\{.*\}\s*\]', out, re.S)
    try:
        res = json.loads(m.group(0)) if m else []
    except json.JSONDecodeError:
        res = []
    graded = []
    for i, c in enumerate(criteria):
        r = next((x for x in res if x.get('id') == i + 1), None)
        graded.append({'text': S.fill(c, vars), 'passed': bool(r and r.get('passed')),
                       'evidence': (r or {}).get('evidence', '評分模型沒有回答這一條')})
    return graded


def ask(prompt, model, work):
    """叫一個不帶任何工具、不載入 repo 設定的模型回答。"""
    d = work / 'plain'
    d.mkdir(parents=True, exist_ok=True)
    cmd = ['claude', '-p', prompt, '--output-format', 'json', '--setting-sources', 'local', '--strict-mcp-config',
           '--max-turns', '1', '--disallowedTools', 'Bash', 'Read', 'Edit', 'Write', 'Glob', 'Grep', 'Agent', 'Skill',
           'WebSearch', 'WebFetch', 'TodoWrite']
    if model:
        cmd += ['--model', model]
    r = subprocess.run(cmd, cwd=d, capture_output=True, text=True, timeout=900)
    try:
        return json.loads(r.stdout).get('result', '')
    except json.JSONDecodeError:
        return r.stdout
