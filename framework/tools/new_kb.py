"""建立新知識庫的骨架：README（介紹、維護者、全景圖草稿）、術語表、簡報的頁序和每一章的章檔、手冊每個部分的 README 和每一章只有標題的檔案、圖片清單，並更新首頁的知識庫清單。

用法：
  python3 framework/tools/new_kb.py .kif/tmp/new-kb.json

new-kb.json 寫訪談的結果：
  {
    "name": "mlops",                       英文短名，當資料夾名稱
    "title": "MLOps",
    "intro": "給……的知識庫：讀完會懂……",
    "maintainers": [{"name": "lufor129", "login": "lufor129"}],
    "parts": [
      {"dir": "1-foundations", "title": "基礎", "intro": "一兩句話介紹這個部分",
       "chapters": [{"file": "01-what-is-mlops", "title": "什麼是 MLOps"}]}
    ],
    "terms": [{"zh": "模型漂移", "en": "Model Drift", "desc": "一句話解釋"}]
  }

kb/<短名>/ 已經存在就不建。建好之後跑 check.py。
"""
import json
import pathlib
import re
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import kb as K  # noqa: E402

NAME_OK = re.compile(r'^[a-z][a-z0-9-]*$')
TEMPLATES = K.ROOT / 'framework/templates'


def problems(plan):
    out = []
    if not NAME_OK.match(plan.get('name', '')):
        out.append(f'name「{plan.get("name", "")}」要是小寫英文開頭，只用小寫英文、數字和 -')
    for key in ('title', 'intro'):
        if not plan.get(key, '').strip():
            out.append(f'{key} 不能是空的')
    if not plan.get('maintainers'):
        out.append('maintainers 至少要有一位')
    if not plan.get('parts'):
        out.append('parts 至少要有一個部分')
    for p in plan.get('parts', []):
        if not K.PART_DIR.match(p.get('dir', '')):
            out.append(f'部分的 dir「{p.get("dir", "")}」要像 1-foundations：數字-小寫英文')
        if not p.get('chapters'):
            out.append(f'部分「{p.get("title", p.get("dir", ""))}」至少要有一章')
        for c in p.get('chapters', []):
            if not K.CHAP_FILE.match(c.get('file', '') + '.md'):
                out.append(f'章的 file「{c.get("file", "")}」要像 01-what-is-mlops：兩位數字-小寫英文')
    return out


def readme(plan):
    host = 'GitLab' if K.CONFIG.get('host') == 'gitlab' else 'GitHub'
    people = [f'- {m["name"]}（{host}: {m["login"]}）' if m.get('login') else f'- {m["name"]}'
              for m in plan['maintainers']]
    nodes = [f'{chr(65 + i)}[{p["title"]}]' for i, p in enumerate(plan['parts'])]
    chain = ' --> '.join(nodes) if len(nodes) > 1 else nodes[0]
    return '\n'.join([f'# {plan["title"]}', '', plan['intro'].strip(), '', '## 維護者', '', *people, '',
                      '## 全景圖', '', '```mermaid', 'flowchart LR', f'  {chain}', '```', '',
                      '（草稿）各部分、各章之間的關係。', ''])


def order(plan):
    """簡報的頁序：設定、部分；頁面等第一筆知識進來時再加。"""
    head = (TEMPLATES / 'order.md').read_text(encoding='utf-8').split('## 設定')[0].rstrip('\n')
    zh = '零一二三四五六七八九十'
    parts = []
    for p in plan['parts']:
        n = int(K.PART_DIR.match(p['dir']).group(1))
        parts.append(f'- {n}：第{zh[n] if n < len(zh) else n}部分 · {p["title"]}')
    return '\n'.join([head, '', '## 設定', f'- 標題：{plan["title"]}', '- 浮水印：', '', '## 部分', *parts, '', '## 頁面', ''])


def terms(plan):
    head = (TEMPLATES / 'terms.md').read_text(encoding='utf-8').rstrip('\n')
    rows = [f'| {t["zh"]} | {t.get("en", "")} | {t.get("desc", "")} | {t.get("first", "")} |'
            for t in plan.get('terms', [])]
    return '\n'.join([head, *rows]) + '\n'


def main(argv):
    if len(argv) != 1:
        print(__doc__)
        return 1
    plan = json.loads(pathlib.Path(argv[0]).read_text(encoding='utf-8'))
    bad = problems(plan)
    if bad:
        print('\n'.join(f'✗ {b}' for b in bad))
        return 1
    d = K.KB_DIR / plan['name']
    if d.exists():
        print(f'✗ kb/{plan["name"]}/ 已經存在')
        return 1
    files = {d / 'README.md': readme(plan), d / 'terms.md': terms(plan),
             d / 'assets/SOURCES.md': (TEMPLATES / 'SOURCES.md').read_text(encoding='utf-8')}
    files[d / 'deck/order.md'] = order(plan)
    for p in plan['parts']:
        files[d / 'handbook' / p['dir'] / 'README.md'] = f'# {p["title"]}\n\n{p.get("intro", "").strip()}\n'
        for c in p['chapters']:
            # 部分和章由簡報決定，手冊用同樣的編號；新人主要看簡報，手冊放一頁放不下的細節
            files[d / 'deck' / p['dir'] / f'{c["file"]}.md'] = f'# {c["title"]}\n'
            files[d / 'handbook' / p['dir'] / f'{c["file"]}.md'] = f'# {c["title"]}\n'
    for f, text in files.items():
        f.parent.mkdir(parents=True, exist_ok=True)
        f.write_text(text, encoding='utf-8')
        print(f'建立 {K.rel(f)}')
    home = K.ROOT / 'README.md'
    home.write_text(K.readme_with_kb_list(home.read_text(encoding='utf-8')), encoding='utf-8')
    print('更新 README.md 的知識庫清單')
    print('接著：python3 framework/tools/check.py')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
