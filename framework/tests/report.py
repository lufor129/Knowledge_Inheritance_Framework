"""整理一次測試的結果：每個情境、每一版的通過數、花費、時間、要按幾次「允許」，以及沒過的項目。

用法：
  python3 framework/tests/report.py .kif/test-results/iteration-1 --ref old_skill=skills-v1 --ref new_skill=<分支>

--ref 指定每一版（--config 的名稱）是哪個 git 參照，用來讀那一版的 .claude/settings.json 和 skill，
重新估計要按幾次「允許」（估計方式見 grade.py 的 would_prompt）。沒給 --ref 就用 metrics.json 裡記的。
結果印出來，也寫進 <iteration>/report.md。
"""
import json
import pathlib
import re
import subprocess
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import sandbox as S  # noqa: E402
import grade as G  # noqa: E402


def git_show(ref, path):
    r = subprocess.run(['git', 'show', f'{ref}:{path}'], cwd=S.ROOT, capture_output=True, text=True)
    return r.stdout if r.returncode == 0 else None


def version_rules(ref):
    settings = json.loads(git_show(ref, '.claude/settings.json') or '{}')
    names = subprocess.run(['git', 'ls-tree', '--name-only', f'{ref}:.claude/skills'], cwd=S.ROOT,
                           capture_output=True, text=True).stdout.split()
    skills = {}
    for n in names:
        m = re.search(r'^allowed-tools:\s*(.+)$', git_show(ref, f'.claude/skills/{n}/SKILL.md') or '', re.M)
        skills[n] = re.findall(r'[A-Za-z]+(?:\([^)]*\))?', m.group(1)) if m else []
    return settings, skills


def user_msgs(transcript):
    return [b.strip() for b in re.findall(r'### 使用者\n(.*?)(?=\n### |\Z)', transcript, re.S)]


def main(argv):
    if not argv:
        print(__doc__)
        return 1
    it = pathlib.Path(argv[0])
    refs = dict(a.split('=', 1) for i, a in enumerate(argv) if i and argv[i - 1] == '--ref')
    rules = {c: version_rules(r) for c, r in refs.items()}
    evals = sorted(p for p in it.glob('eval-*') if p.is_dir())
    configs = sorted({d.name for e in evals for d in e.iterdir() if d.is_dir()}, key=lambda c: (c != 'old_skill', c))
    rows, totals, fails = [], {c: [0, 0, 0.0, 0.0, 0] for c in configs}, []
    for e in evals:
        meta = json.loads((e / 'eval_metadata.json').read_text(encoding='utf-8'))
        cells = []
        for c in configs:
            run = e / c / 'run-1'
            if not (run / 'grading.json').exists():
                cells.append('—')
                continue
            g = json.loads((run / 'grading.json').read_text(encoding='utf-8'))
            t = json.loads((run / 'timing.json').read_text(encoding='utf-8'))
            tools = json.loads((run / 'outputs/tools.json').read_text(encoding='utf-8')) if (run / 'outputs/tools.json').exists() else []
            if c in rules:
                tr = (run / 'outputs/transcript.md').read_text(encoding='utf-8')
                ap = G.would_prompt(tools, rules[c][0], rules[c][1], user_msgs(tr))
            else:
                ap = json.loads((run / 'outputs/metrics.json').read_text(encoding='utf-8')).get('approvals', {})
            asks = ap.get('tool_calls_needing_approval', 0)
            p, n = g['summary']['passed'], g['summary']['total']
            tot = totals[c]
            tot[0] += p; tot[1] += n; tot[2] += t.get('cost_usd', 0); tot[3] += t.get('total_duration_seconds', 0); tot[4] += asks
            cells.append(f'{p}/{n}・${t.get("cost_usd", 0):.2f}・{t.get("total_duration_seconds", 0) / 60:.1f} 分・問 {asks} 次')
            for x in g['expectations']:
                if not x['passed']:
                    fails.append((meta['eval_name'], c, x['text'], x['evidence']))
        rows.append(f'| {meta["eval_name"]} | ' + ' | '.join(cells) + ' |')
    out = ['# 情境測試結果', '', '每格：通過／總條數・Agent 花費・時間・估計要按「允許」的次數', '',
           '| 情境 | ' + ' | '.join(configs) + ' |', '|---|' + '---|' * len(configs), *rows,
           '| **合計** | ' + ' | '.join(f'**{t[0]}/{t[1]}**・${t[2]:.2f}・{t[3] / 60:.0f} 分・問 {t[4]} 次'
                                       for t in totals.values()) + ' |', '', '## 沒過的項目', '']
    for name, c, text, ev in fails:
        out.append(f'- **{name}**（{c}）：{text}\n  - {ev}')
    md = '\n'.join(out) + '\n'
    (it / 'report.md').write_text(md, encoding='utf-8')
    print(md)
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
