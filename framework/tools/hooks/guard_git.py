"""PreToolUse hook：擋下很難救回的 git 指令。

Agent 會替不懂 Git 的同仁操作 Git，下面這幾種一出錯就救不回來，所以一律擋：
強制推送、直接推主線、reset --hard、git branch -D。推分支照常可以。
"""
import json
import pathlib
import re
import shlex
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parents[3]
MAIN = json.loads((ROOT / 'framework/config.json').read_text(encoding='utf-8')).get('main', 'main')


def block(msg):
    print(f'框架的 hook 擋下了這個指令：{msg}', file=sys.stderr)
    sys.exit(2)


def git_args(tokens):
    """回傳 git 子指令和它的參數；跳過 git 本身的選項（-C 路徑、-c 設定）。"""
    i = 1
    while i < len(tokens) and tokens[i].startswith('-'):
        i += 2 if tokens[i] in ('-C', '-c') else 1
    return (tokens[i], tokens[i + 1:]) if i < len(tokens) else (None, [])


def current_branch(cwd):
    r = subprocess.run(['git', 'rev-parse', '--abbrev-ref', 'HEAD'], cwd=cwd, capture_output=True, text=True)
    return r.stdout.strip()


def check_push(args, cwd):
    if any(a in ('-f', '--force') or a.startswith('--force') for a in args) or any(a.startswith('+') for a in args):
        block('強制推送會蓋掉別人的歷史。請改用一般的 git push；推不上去時先 git pull --rebase。')
    if any(a in ('--all', '--mirror') for a in args):
        block('--all／--mirror 會連主線一起推。請只推自己的分支：git push -u origin <分支>。')
    pos = [a for a in args if not a.startswith('-')]
    refspecs = pos[1:]
    for r in refspecs:
        dst = r.split(':')[-1]
        if dst in (MAIN, f'refs/heads/{MAIN}'):
            block(f'不能直接推到主線 {MAIN}：所有變更都要經過變更提案。請推自己的分支，再開變更提案。')
    if not refspecs and current_branch(cwd) == MAIN:
        block(f'你現在在主線 {MAIN} 上，不能直接推。請先開分支：git switch -c <分支>，再推分支、開變更提案。')


def main():
    data = json.load(sys.stdin)
    cmd = (data.get('tool_input') or {}).get('command', '')
    cwd = data.get('cwd') or str(ROOT)
    for part in re.split(r'&&|\|\||;|\||\n', cmd):
        try:
            tokens = shlex.split(part)
        except ValueError:
            tokens = part.split()
        while tokens and re.match(r'^\w+=', tokens[0]):   # 開頭的環境變數設定
            tokens = tokens[1:]
        if not tokens or pathlib.Path(tokens[0]).name != 'git':
            continue
        sub, args = git_args(tokens)
        if sub == 'push':
            check_push(args, cwd)
        elif sub == 'reset' and '--hard' in args:
            block('reset --hard 會丟掉還沒提交的修改。要放棄修改，先跟使用者確認，再用 git stash 收起來。')
        elif sub == 'branch' and ('-D' in args or ('--delete' in args and ('--force' in args or '-f' in args))):
            block('git branch -D 會刪掉還沒合併的分支。合併過的分支用 git branch -d；沒合併的先跟使用者確認。')
    sys.exit(0)


if __name__ == '__main__':
    main()
