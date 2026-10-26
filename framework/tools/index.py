"""查找用的索引：列出每個簡報頁、小節、常見問題、自我檢查和術語在哪裡。Agent 先讀索引，再打開對應的檔案。

用法：
  python3 framework/tools/index.py                  全部知識庫
  python3 framework/tools/index.py semiconductor    一個知識庫（寫 kb/semiconductor 也可以）
  python3 framework/tools/index.py --main semiconductor
                                                    正式內容的索引（查找、帶讀用；分支上還沒合併的不算）
  python3 framework/tools/index.py semiconductor --todo
                                                    簡報裡數字還沒有出處的頁（傳承者可以慢慢補）

不加 --main 時讀目前的工作目錄（新增、修改時用）。
"""
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import kb as K  # noqa: E402
import check as C  # noqa: E402


def todo(kb):
    if not kb.has_deck:
        print(f'{kb.title} 還沒有簡報。')
        return
    pages = [(p, C.unsourced(p)) for p in K.load_deck(kb).pages if p.md]
    pages = [(p, bare) for p, bare in pages if bare]
    print(f'# {kb.title}：數字還沒有出處的簡報頁（{len(pages)} 頁）\n')
    for p, bare in pages:
        print(f'{p.id}\t{p.title}\t{K.rel(p.file)}:{p.line}')
        for label, text in bare:
            print(f'  {label}：{K.plain(text)[:60]}')


def main(argv):
    base = K.snapshot(K.main_ref(), 'main') if '--main' in argv else None
    if '--todo' in argv:
        for kb in [K.find_kb(a, base) for a in argv if not a.startswith('--')] or K.all_kbs(base):
            todo(kb)
        return 0
    argv = [a for a in argv if a != '--main']
    kbs = [K.find_kb(a, base) for a in argv] if argv else K.all_kbs(base)
    for kb in kbs:
        print(f'# {kb.title}（kb/{kb.name}{"，正式內容" if base else ""}）')
        if kb.has_deck:
            deck = K.load_deck(kb)
            maps = {p.id: p.maps for p in deck.order.pages}
            print('\n## 簡報頁：頁 id　部分 › 章 › 標題　→ 對應小節　位置')
            for p in deck.pages:
                where = ' › '.join(x for x in (deck.order.parts.get(p.part, ''), deck.titles.get((p.part, p.chap), '') if p.chap else '') if x)
                ids = '、'.join((f'{k}/' if k else '') + sid for k, sid, _ in maps.get(p.id, []))
                deep = f'（深入頁，接在 {p.deep} 後面）' if p.deep else ''
                print(f'{p.id}\t{where} › {K.plain(p.title)}{deep}\t→ {ids or "（沒有對應小節）"}\t{K.rel(p.file)}:{p.line}')
            if deck.checks:
                print('\n## 自我檢查（簡報）：題目　→ 相關的頁　位置')
                for qs in deck.checks.values():
                    for ch, q in qs:
                        ids = '、'.join(pid for _, pid, _ in q.rel)
                        print(f'{"【深入】" if q.deep else ""}{q.q}\t→ {ids}\t{K.rel(ch.file)}:{q.line}')
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
