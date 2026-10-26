"""重新評分：評分標準或評分模型看到的資料改了之後，用已經跑完的對話重評，不用重跑 Agent。

用法：
  python3 framework/tests/rejudge.py .kif/test-results/iteration-1 --config old_skill --ref skills-v1 [--only s02-ask]

只重評 judge 的項目；checks（程式檢查）的結果照舊。
提案的 diff 從測試 repo 重新讀（關掉的提案也讀得到）；judge_context 的簡報原文從 --ref 那一版讀。
原本的評分留在 grading.orig.json。
"""
import argparse
import json
import pathlib
import re
import subprocess
import sys
import tempfile

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import sandbox as S  # noqa: E402
import grade as G  # noqa: E402


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('iteration')
    ap.add_argument('--config', required=True)
    ap.add_argument('--ref', required=True)
    ap.add_argument('--only', default='')
    ap.add_argument('--judge-model')
    args = ap.parse_args()
    only = set(filter(None, args.only.split(',')))
    work = pathlib.Path(tempfile.mkdtemp(prefix='kif-rejudge-'))
    for ev in sorted(pathlib.Path(args.iteration).glob('eval-*')):
        cid = ev.name[5:]
        run = ev / args.config / 'run-1'
        if (only and cid not in only) or not (run / 'grading.json').exists():
            continue
        case = json.loads((S.ROOT / f'framework/tests/scenarios/{cid}.json').read_text(encoding='utf-8'))
        if not case.get('judge'):
            continue
        g = json.loads((run / 'grading.json').read_text(encoding='utf-8'))
        orig = run / 'grading.orig.json'
        if not orig.exists():
            orig.write_text(json.dumps(g, ensure_ascii=False, indent=2), encoding='utf-8')
        transcript = (run / 'outputs/transcript.md').read_text(encoding='utf-8').split('\n', 2)[-1]
        state = (run / 'outputs/state.md').read_text(encoding='utf-8')
        if 'diff）' not in state:
            for n in re.findall(r'^## 變更提案 #(\d+)', state, re.M):
                state += f'\n## 變更提案 #{n} 改了什麼（diff）\n\n```diff\n{G.pr_diff(int(n)).rstrip()}\n```\n'
            (run / 'outputs/state.md').write_text(state, encoding='utf-8')
        context = []
        for path in case.get('judge_context', []):
            r = subprocess.run(['git', 'show', f'{args.ref}:{path}'], cwd=S.ROOT, capture_output=True, text=True)
            context += [f'### {path}', '', r.stdout.rstrip(), '']
        checks = g['expectations'][:len(case.get('checks', []))]  # run.py 先寫 checks，再寫 judge
        judged = G.judge(case['judge'], transcript, state, {}, args.judge_model, work,
                         '\n'.join(context) or '（沒有指定）')
        exps = checks + judged
        passed = sum(e['passed'] for e in exps)
        g['expectations'] = exps
        g['summary'] = {'passed': passed, 'failed': len(exps) - passed, 'total': len(exps),
                        'pass_rate': round(passed / len(exps), 2) if exps else 0}
        (run / 'grading.json').write_text(json.dumps(g, ensure_ascii=False, indent=2), encoding='utf-8')
        before = json.loads(orig.read_text(encoding='utf-8'))['summary']['passed']
        print(f'{cid}：{before} → {passed}/{len(exps)}', flush=True)


if __name__ == '__main__':
    main()
