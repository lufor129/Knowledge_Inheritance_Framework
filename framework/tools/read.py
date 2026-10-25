"""讀正式內容：印出簡報頁、小節、整章、常見問題，或找某些字寫在哪裡。

預設讀正式內容（主線上最新的簡報和手冊）：分支上還沒合併的內容不算。
查找和帶讀用這個；要讀目前分支上改到一半的內容，加 --here。

用法：
  python3 framework/tools/read.py semiconductor litho6 cmask       印出這些小節（含註腳）；不是小節 id 就找同名的簡報頁
  python3 framework/tools/read.py semiconductor --page hk1 wat2     印出這些簡報頁（文字、旁白、出處）和它們對應的小節
  python3 framework/tools/read.py semiconductor --find OPC 光罩      這些字出現在哪些簡報頁、小節、常見問題、自我檢查
  python3 framework/tools/read.py semiconductor --faq OPC           題目或答案有這個字的常見問題和自我檢查（含答案）
  python3 framework/tools/read.py semiconductor --chapter 01-litho  手冊整章（含常見問題）

每一段開頭都標出處：小節是「知識庫 › 章 › 小節 id」，簡報頁是「知識庫 › 簡報 › 章 › 〈頁標題〉（頁 id）」，回答時照抄。
"""
import pathlib
import re
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import kb as K  # noqa: E402


def load(name, here):
    if here:
        return K.find_kb(name), '目前的分支'
    return K.find_kb(name, K.snapshot(K.main_ref(), 'main')), '正式內容'


def faq_blocks(ch):
    return [(q, K.faq_block(ch, q)) for q in ch.faqs]


def where(kb, ch, sid=None):
    return f'{kb.name} › {ch.title}' + (f' › {sid}' if sid else '')


def deck_of(kb):
    return K.load_deck(kb) if kb.has_deck else None


def page_where(kb, deck, p):
    ch = deck.titles.get((p.part, p.chap), '') if p.chap else deck.order.parts.get(p.part, '')
    return f'{kb.name} › 簡報 › {ch} › 〈{K.plain(p.title)}〉（頁 {p.id}）'


def print_page(kb, deck, p):
    maps = next((x.maps for x in deck.order.pages if x.id == p.id), [])
    print(f'\n## 出處：{page_where(kb, deck, p)}（{K.rel(p.file)}:{p.line}）\n')
    print('\n'.join(p.lines))
    if maps:
        ids = ' '.join((f'{k}/' if k else '') + sid for k, sid, _ in maps)
        print(f'\n對應的小節：{ids}（讀：python3 framework/tools/read.py {kb.name} {ids}）')


def main(argv):
    here = '--here' in argv
    argv = [a for a in argv if a != '--here']
    if not argv:
        print(__doc__)
        return 1
    kb, label = load(argv[0], here)
    args = argv[1:]
    print(f'（{label}：{kb.title}）')
    deck = deck_of(kb)
    if args and args[0] == '--page':
        pages = {p.id: p for p in (deck.pages if deck else []) if p.md}
        missing = [a for a in args[1:] if a not in pages]
        for pid in args[1:]:
            if pid in pages:
                print_page(kb, deck, pages[pid])
        if missing:
            print(f'\n簡報裡沒有這些頁：{"、".join(missing)}（用 index.py 看有哪些）')
            return 1
        return 0
    if args and args[0] == '--find':
        words = args[1:]
        hits = 0
        for p in (deck.pages if deck else []):
            found = [w for w in words if w.lower() in '\n'.join(p.lines).lower()]
            if found:
                hits += 1
                print(f'頁 {p.id}\t{page_where(kb, deck, p)}\t有：{"、".join(found)}')
        for qs in (deck.checks.values() if deck else []):
            for ch, q in qs:
                found = [w for w in words if w.lower() in K.faq_block(ch, q).lower()]
                if found:
                    hits += 1
                    print(f'自我檢查\t{kb.name} › 簡報 › {ch.title} › {"【深入】" if q.deep else ""}{q.q}\t有：{"、".join(found)}')
        for ch in kb.chapters:
            for s in ch.sections:
                body = '\n'.join(s.lines)
                found = [w for w in words if w.lower() in body.lower()]
                if found:
                    hits += 1
                    print(f'{s.id}\t{where(kb, ch)} › {s.title}\t有：{"、".join(found)}')
            for q, block in faq_blocks(ch):
                found = [w for w in words if w.lower() in block.lower()]
                if found:
                    hits += 1
                    print(f'常見問題\t{where(kb, ch)} › {"【深入】" if q.deep else ""}{q.q}\t有：{"、".join(found)}')
        if not hits:
            print(f'簡報和手冊裡都找不到：{"、".join(words)}。換個說法（中文、英文、縮寫）再找一次；還是沒有，就是沒寫。')
        return 0
    if args and args[0] == '--faq':
        words = args[1:]
        n = 0
        for ch in kb.chapters:
            for q, block in faq_blocks(ch):
                if any(w.lower() in block.lower() for w in words):
                    n += 1
                    print(f'\n## 出處：{where(kb, ch)} › 常見問題\n\n{block}')
        for qs in (deck.checks.values() if deck else []):
            for ch, q in qs:
                block = K.faq_block(ch, q)
                if any(w.lower() in block.lower() for w in words):
                    n += 1
                    print(f'\n## 出處：{kb.name} › 簡報 › {ch.title} › 自我檢查\n\n{block}')
        if not n:
            print(f'常見問題和自我檢查裡沒有：{"、".join(words)}')
        return 0
    if args and args[0] == '--chapter':
        key = args[1] if len(args) > 1 else ''
        ch = next((c for c in kb.chapters if c.file.stem == key or c.file.name == key or c.title == key), None)
        if not ch:
            print(f'找不到章「{key}」。有的章：{"、".join(c.file.stem + " " + c.title for c in kb.chapters)}')
            return 1
        print(f'## 出處：{where(kb, ch)}（{K.rel(ch.file)}）\n')
        print(ch.text)
        return 0
    secs = {s.id: (s, ch) for ch in kb.chapters for s in ch.sections}
    pages = {p.id: p for p in (deck.pages if deck else []) if p.md}
    missing = [a for a in args if a not in secs and a not in pages]
    for sid in args:
        if sid in secs:
            s, ch = secs[sid]
            print(f'\n## 出處：{where(kb, ch, sid)}（{K.rel(s.file)}:{s.line}）\n')
            print('\n'.join(s.lines))
        elif sid in pages:
            print_page(kb, deck, pages[sid])
    if missing:
        print(f'\n沒有這些小節或簡報頁：{"、".join(missing)}（用 index.py 看有哪些）')
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
