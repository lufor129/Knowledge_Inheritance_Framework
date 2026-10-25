"""查找用的索引：列出每個小節、常見問題和術語在哪裡。Agent 先讀索引，再打開對應的檔案。

用法：
  python3 framework/tools/index.py                  全部知識庫
  python3 framework/tools/index.py semiconductor    一個知識庫（寫 kb/semiconductor 也可以）
  python3 framework/tools/index.py --main semiconductor
                                                    正式內容的索引（查找、帶讀用；分支上還沒合併的不算）

不加 --main 時讀目前的工作目錄（新增、修改時用）。
"""
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import kb as K  # noqa: E402


def main(argv):
    base = K.snapshot(K.main_ref(), 'main') if '--main' in argv else None
    argv = [a for a in argv if a != '--main']
    kbs = [K.find_kb(a, base) for a in argv] if argv else K.all_kbs(base)
    for kb in kbs:
        print(f'# {kb.title}（kb/{kb.name}{"，正式內容" if base else ""}）')
        print('\n## 小節：id　部分 › 章 › 小節　位置')
        for p in kb.parts:
            for c in p.chapters:
                for s in c.sections:
                    print(f'{s.id}\t{p.title} › {c.title} › {s.title}\t{K.rel(s.file)}:{s.line}')
        print('\n## 常見問題：題目　→ 相關小節　位置')
        for c in kb.chapters:
            for q in c.faqs:
                ids = '、'.join((f'{k}/' if k else '') + sid for k, sid, _ in q.rel)
                print(f'{"【深入】" if q.deep else ""}{q.q}\t→ {ids}\t{K.rel(c.file)}:{q.line}')
        terms = kb.dir / 'terms.md'
        if terms.exists():
            print('\n## 術語（terms.md）')
            for l in terms.read_text(encoding='utf-8').splitlines():
                if l.startswith('|') and not set(l) <= set('|-: '):
                    print(l)
        print()
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
