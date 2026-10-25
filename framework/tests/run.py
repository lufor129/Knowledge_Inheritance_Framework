"""情境測試：用全新的 Claude Code 跑 docs/design.md 的情境，另一個模型扮演使用者回話，最後評分。

用法：
  python3 framework/tests/run.py --ref main --config with_skill --iteration .kif/test-results/iteration-1
  python3 framework/tests/run.py --ref main --only s02-ask,s03-gap

選項：
  --ref          要測哪一版框架（git 參照，預設 HEAD）
  --config       結果資料夾的名稱，例如 with_skill、old_skill、new_skill
  --iteration    結果放哪裡（預設 .kif/test-results/iteration-1，不進版控）
  --only         只跑這些情境（逗號分隔）
  --model        Agent 用的模型（預設照 claude 的設定）
  --user-model   扮演使用者的模型（預設 sonnet）
  --judge-model  評分模型（預設照 claude 的設定）
  --work         暫存資料夾，一定要在 repo 外面（預設系統暫存資料夾）

每個情境開始前會重置測試 repo（framework/tests/sandbox.json），然後在測試 repo 開 issue、開提案、合併。
正式 repo 不會被碰到。結果的格式和 skill-creator 一樣，可以用它的 aggregate_benchmark.py 和 generate_review.py 看。
"""
import argparse
import json
import pathlib
import subprocess
import sys
import tempfile
import time

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import sandbox as S  # noqa: E402
import grade as G  # noqa: E402

TESTS = S.ROOT / 'framework/tests'
# Agent 可以用的工具：和一般同仁差不多，只是不用每次按「允許」
ALLOWED = ['Read', 'Edit', 'Write', 'Glob', 'Grep', 'Agent', 'Skill', 'WebSearch', 'WebFetch', 'TodoWrite',
           'Bash(git:*)', 'Bash(gh:*)', 'Bash(python3:*)', 'Bash(grep:*)', 'Bash(ls:*)', 'Bash(cat:*)',
           'Bash(mkdir:*)', 'Bash(head:*)', 'Bash(tail:*)', 'Bash(wc:*)', 'Bash(find:*)', 'Bash(echo:*)',
           'Bash(date:*)', 'Bash(sort:*)']


def agent_turn(clone, msg, sid, model):
    cmd = ['claude', '-p', msg, '--output-format', 'stream-json', '--verbose', '--setting-sources', 'project',
           '--strict-mcp-config', '--permission-mode', 'acceptEdits', '--disallowedTools', 'AskUserQuestion',
           '--allowedTools', *ALLOWED]
    if sid:
        cmd += ['--resume', sid]
    if model:
        cmd += ['--model', model]
    t0 = time.time()
    r = subprocess.run(cmd, cwd=clone, capture_output=True, text=True, timeout=3600)
    out = {'tools': [], 'result': '', 'sid': sid, 'cost': 0.0, 'tokens': 0, 'denials': [], 'seconds': time.time() - t0}
    for line in r.stdout.splitlines():
        try:
            e = json.loads(line)
        except json.JSONDecodeError:
            continue
        if e.get('type') == 'assistant':
            for c in e['message'].get('content', []):
                if c.get('type') == 'tool_use':
                    out['tools'].append({'name': c['name'], 'input': c.get('input', {})})
        elif e.get('type') == 'result':
            u = e.get('usage', {})
            out.update(result=e.get('result', ''), sid=e.get('session_id'), cost=e.get('total_cost_usd', 0.0),
                       tokens=sum(u.get(k, 0) for k in ('input_tokens', 'output_tokens', 'cache_read_input_tokens',
                                                        'cache_creation_input_tokens')),
                       denials=[str(x.get('tool_input', {}))[:200] for x in e.get('permission_denials', [])])
    if not out['result'] and r.returncode:
        out['result'] = f'（Agent 沒有正常結束：{r.stderr.strip()[:300]}）'
    return out


def tool_line(t):
    i = t['input']
    d = i.get('command') or i.get('skill') or i.get('file_path') or i.get('pattern') or i.get('description') or i.get('query') or ''
    return f'{t["name"]}：{str(d).splitlines()[0][:160] if d else ""}'


def transcript_md(turns, with_tools=True):
    out = []
    for t in turns:
        if t['role'] == 'user':
            out += [f'### 使用者', t['text'], '']
        else:
            if with_tools and t['tools']:
                out += ['<details><summary>Agent 用了 %d 個工具</summary>' % len(t['tools']), '',
                        *[f'- {tool_line(x)}' for x in t['tools']], '', '</details>', '']
            if t['denials']:
                out += [f'（權限被擋 {len(t["denials"])} 次）', '']
            out += ['### Agent', t['text'], '']
    return '\n'.join(out)


def run_case(case, args, work, run_dir):
    vars = {}
    t0 = time.time()
    vars['reset_sha'] = S.reset(args.ref, work)
    clone = S.clone(work / 'agent')
    if case.get('local'):
        (clone / '.kif').mkdir(exist_ok=True)
        (clone / '.kif/local.json').write_text(json.dumps(case['local'], ensure_ascii=False) + '\n', encoding='utf-8')
    start = S.latest()
    S.setup(case.get('setup', []), work, vars)
    before = S.latest()
    S.sh(['git', 'pull', '--quiet', '--ff-only'], cwd=clone, check=False)
    turns, cost, tokens = [], 0.0, 0
    for sess in case['sessions']:
        msg, sid = S.fill(sess['first'], vars), None
        for _ in range(sess.get('max_turns', 4)):
            turns.append({'role': 'user', 'text': msg})
            res = agent_turn(clone, msg, sid, args.model)
            sid, cost, tokens = res['sid'], cost + res['cost'], tokens + res['tokens']
            turns.append({'role': 'agent', 'text': res['result'], 'tools': res['tools'], 'denials': res['denials']})
            prompt = (TESTS / 'prompts/user.md').read_text(encoding='utf-8') \
                .replace('{persona}', S.fill(sess['persona'], vars)).replace('{goal}', S.fill(sess['goal'], vars)) \
                .replace('{transcript}', transcript_md(turns, with_tools=False))
            msg = G.ask(prompt, args.user_model, work).strip()
            if not msg or '（結束）' in msg:
                break
        if sess.get('after') == 'newest_pr':
            prs = json.loads(S.gh('pr', 'list', '--state', 'all', '--limit', '1', '--json', 'number') or '[]')
            vars['pr_new'] = prs[0]['number'] if prs else 0
    run_secs = time.time() - t0
    md = transcript_md(turns)
    out = run_dir / 'outputs'
    out.mkdir(parents=True, exist_ok=True)
    (out / 'transcript.md').write_text(f'# {case["id"]}：{case["title"]}\n\n' + md, encoding='utf-8')  # 評分出錯也留得住對話
    state = G.collect(clone, start, before)
    (out / 'state.md').write_text(G.state_md(state), encoding='utf-8')
    tr = {'tools': [x for t in turns if t['role'] == 'agent' for x in t['tools']],
          'user': [t['text'] for t in turns if t['role'] == 'user'],
          'agent': [t['text'] for t in turns if t['role'] == 'agent']}
    ctx = {'state': state, 'vars': vars, 'clone': clone, 'transcript': tr, 'work': work}
    exps = []
    for c in case.get('checks', []):
        try:
            ok, ev = G.check(c, ctx)
        except Exception as e:  # 檢查本身出錯也記下來，不中斷
            ok, ev = False, f'檢查出錯：{e}'
        exps.append({'text': S.fill(c['text'], vars), 'passed': bool(ok), 'evidence': ev})
    exps += G.judge(case.get('judge', []), md, state, vars, args.judge_model, work)
    counts = {}
    for x in tr['tools']:
        counts[x['name']] = counts.get(x['name'], 0) + 1
    denials = sum(len(t['denials']) for t in turns if t['role'] == 'agent')
    sp = clone / '.claude/settings.json'
    approvals = G.would_prompt(tr['tools'], json.loads(sp.read_text(encoding='utf-8')) if sp.exists() else {})
    (out / 'tools.json').write_text(json.dumps(tr['tools'], ensure_ascii=False, indent=1), encoding='utf-8')
    (out / 'metrics.json').write_text(json.dumps({
        'tool_calls': counts, 'total_tool_calls': len(tr['tools']), 'total_steps': len(tr['agent']),
        'files_created': [], 'errors_encountered': denials, 'output_chars': sum(len(a) for a in tr['agent']),
        'transcript_chars': len(md), 'cost_usd': round(cost, 2), 'approvals': approvals}, ensure_ascii=False, indent=2),
        encoding='utf-8')
    passed = sum(e['passed'] for e in exps)
    (run_dir / 'grading.json').write_text(json.dumps({
        'expectations': exps,
        'summary': {'passed': passed, 'failed': len(exps) - passed, 'total': len(exps),
                    'pass_rate': round(passed / len(exps), 2) if exps else 0},
        'execution_metrics': {'tool_calls': counts, 'total_tool_calls': len(tr['tools']), 'errors_encountered': denials},
        'timing': {'executor_duration_seconds': round(run_secs, 1), 'total_duration_seconds': round(time.time() - t0, 1)},
    }, ensure_ascii=False, indent=2), encoding='utf-8')
    (run_dir / 'timing.json').write_text(json.dumps({
        'total_tokens': tokens, 'duration_ms': int(run_secs * 1000), 'total_duration_seconds': round(run_secs, 1),
        'cost_usd': round(cost, 2)}, indent=2), encoding='utf-8')
    return passed, len(exps), cost


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument('--ref', default='HEAD')
    ap.add_argument('--config', default='with_skill')
    ap.add_argument('--iteration', default=str(S.ROOT / '.kif/test-results/iteration-1'))
    ap.add_argument('--only', default='')
    ap.add_argument('--model')
    ap.add_argument('--user-model', default='sonnet')
    ap.add_argument('--judge-model')
    ap.add_argument('--work', default=str(pathlib.Path(tempfile.gettempdir()) / 'kif-tests'))
    args = ap.parse_args()
    work = pathlib.Path(args.work).resolve()
    if S.ROOT in work.parents or work == S.ROOT:
        raise SystemExit('--work 要在 repo 外面，不然測試用的 Claude 會讀到這個 repo 的設定')
    work.mkdir(parents=True, exist_ok=True)
    args.ref = S.sh(['git', 'rev-parse', args.ref], cwd=S.ROOT)
    only = set(filter(None, args.only.split(',')))
    cases = [json.loads(p.read_text(encoding='utf-8')) for p in sorted((TESTS / 'scenarios').glob('*.json'))]
    cases = [c for c in cases if not only or c['id'] in only]
    it = pathlib.Path(args.iteration)
    total_cost = 0.0
    for k, case in enumerate(cases):
        ev = it / f'eval-{case["id"]}'
        ev.mkdir(parents=True, exist_ok=True)
        (ev / 'eval_metadata.json').write_text(json.dumps({
            'eval_id': k, 'eval_name': f'{case["id"]} {case["role"]}：{case["title"]}',
            'prompt': case['sessions'][0]['first'],
            'assertions': [c['text'] for c in case.get('checks', [])] + case.get('judge', [])}, ensure_ascii=False, indent=2),
            encoding='utf-8')
        print(f'[{k + 1}/{len(cases)}] {case["id"]} {case["role"]}：{case["title"]} …', flush=True)
        try:
            p, n, cost = run_case(case, args, work, ev / args.config / 'run-1')
            total_cost += cost
            print(f'    {p}/{n} 條通過，Agent 花費 ${cost:.2f}', flush=True)
        except Exception as e:
            print(f'    情境本身出錯：{e}', flush=True)
    print(f'完成。Agent 總花費約 ${total_cost:.2f}（不含扮演使用者和評分）。結果在 {it}')


if __name__ == '__main__':
    main()
