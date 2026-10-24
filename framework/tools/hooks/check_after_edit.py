"""PostToolUse hook：改了 kb/ 底下的檔案，就檢查那個知識庫；有錯誤就告訴 Agent。"""
import json
import pathlib
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parents[3]


def main():
    data = json.load(sys.stdin)
    f = (data.get('tool_input') or {}).get('file_path', '')
    try:
        rel = pathlib.Path(f).resolve().relative_to(ROOT)
    except ValueError:
        return 0
    if len(rel.parts) < 3 or rel.parts[0] != 'kb' or 'dist' in rel.parts:
        return 0
    r = subprocess.run([sys.executable, str(ROOT / 'framework/tools/check.py'), rel.parts[1]],
                       capture_output=True, text=True, cwd=ROOT)
    if r.returncode == 0:
        return 0
    errs = [l for l in r.stdout.splitlines() if l.startswith(('✗', '  →'))]
    print('檢查沒過。還在改的話可以先繼續，開變更提案之前一定要全部修好：\n' + '\n'.join(errs[:30]), file=sys.stderr)
    return 2


if __name__ == '__main__':
    sys.exit(main())
