"""讀正式內容：印出簡報頁（主頁、深入頁）、整章、自我檢查，或找某些字寫在哪裡。

預設讀正式內容（主線上最新的簡報）：分支上還沒合併的內容不算。
查找和帶讀用這個；要讀目前分支上改到一半的內容，加 --here。

用法：
  python3 framework/tools/read.py semiconductor hk1 hk3-d            印出這些簡報頁（文字、說明、旁白、出處）；主頁會列出後面的深入頁
  python3 framework/tools/read.py semiconductor --find OPC 光罩       這些字出現在哪些簡報頁、自我檢查
  python3 framework/tools/read.py semiconductor --faq OPC            題目或答案有這個字的自我檢查（含答案）
  python3 framework/tools/read.py semiconductor --chapter 01-litho   簡報的整章（章檔的原文，含自我檢查）

每一段開頭都標出處：「知識庫 › 簡報 › 章 › 〈頁標題〉（頁 id）」，回答時照抄。
"""
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import kb as K  # noqa: E402


def load(name, here):
    if here:
        return K.find_kb(name), '目前的分支'
    return K.find_kb(name, K.snapshot(K.main_ref(), 'main')), '正式內容'


def chapter_name(deck, p):
    return deck.titles.get((p.part, p.chap), '') if p.chap else deck.order.parts.get(p.part, '')


def page_where(kb, deck, p):
    return f'{kb.name} › 簡報 › {chapter_name(deck, p)} › 〈{K.plain(p.title)}〉（頁 {p.id}）'


def print_page(kb, deck, p):
    print(f'\n## 出處：{page_where(kb, deck, p)}（{K.rel(p.file)}:{p.line}）\n')
    print('\n'.join(p.lines))
    if p.deep:
        print(f'\n這是深入頁，接在主頁 {p.deep} 後面。')
    deep = [x.id for x in deck.pages if x.deep == p.id]
    if deep:
        print(f'\n這一頁後面的深入頁：{"、".join(deep)}（讀：python3 framework/tools/read.py {kb.name} {" ".join(deep)}）')


def main(argv):
    here = '--here' in argv
    argv = [a for a in argv if a != '--here']
    if not argv:
        print(__doc__)
        return 1
    kb, label = load(argv[0], here)
    args = argv[1:]
    print(f'（{label}：{kb.title}）')
    if not kb.has_deck:
        print('這個知識庫還沒有簡報。')
        return 1
    deck = K.load_deck(kb)
    if args and args[0] == '--find':
        words = args[1:]
        hits = 0
        for p in deck.pages:
            found = [w for w in words if w.lower() in '\n'.join(p.lines).lower()]
            if found:
                hits += 1
                print(f'{"深入頁" if p.deep else "頁"} {p.id}\t{page_where(kb, deck, p)}\t有：{"、".join(found)}')
        for qs in deck.checks.values():
            for ch, q in qs:
                found = [w for w in words if w.lower() in K.faq_block(ch, q).lower()]
                if found:
                    hits += 1
                    print(f'自我檢查\t{kb.name} › 簡報 › {ch.title} › {"【深入】" if q.deep else ""}{q.q}\t有：{"、".join(found)}')
        if not hits:
            print(f'簡報裡找不到：{"、".join(words)}。換個說法（中文、英文、縮寫）再找一次；還是沒有，就是沒寫。')
        return 0
    if args and args[0] == '--faq':
        words = args[1:]
        n = 0
        for qs in deck.checks.values():
            for ch, q in qs:
                block = K.faq_block(ch, q)
                if any(w.lower() in block.lower() for w in words):
                    n += 1
                    print(f'\n## 出處：{kb.name} › 簡報 › {ch.title} › 自我檢查\n\n{block}')
        if not n:
            print(f'自我檢查裡沒有：{"、".join(words)}')
        return 0
    if args and args[0] == '--chapter':
        key = args[1] if len(args) > 1 else ''
        files = K.deck_files(kb)
        f = next((x for x in files if key in (x.stem, x.name) or K.chapter_name(K.load_chapter(x, []).title) == K.chapter_name(key)), None)
        if not f:
            print(f'找不到章「{key}」。有的章：{"、".join(x.stem + " " + K.load_chapter(x, []).title for x in files)}')
            return 1
        print(f'## 出處：{kb.name} › 簡報 › {K.load_chapter(f, []).title}（{K.rel(f)}）\n')
        print(f.read_text(encoding='utf-8'))
        return 0
    if args and args[0] == '--page':  # 舊的寫法：read.py <知識庫> --page <頁id>
        args = args[1:]
    pages = {p.id: p for p in deck.pages if p.md}
    missing = [a for a in args if a not in pages]
    for pid in args:
        if pid in pages:
            print_page(kb, deck, pages[pid])
    if missing:
        print(f'\n簡報裡沒有這些頁：{"、".join(missing)}（用 index.py 看有哪些）')
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
