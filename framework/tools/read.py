"""讀手冊：印出小節、整章或常見問題，或找某些字寫在哪幾節。

預設讀正式內容（主線上最新的手冊）：分支上還沒合併的內容不算，簡報不算。
查找和帶讀用這個；要讀目前分支上改到一半的內容，加 --here。

用法：
  python3 framework/tools/read.py semiconductor litho6 cmask       印出這些小節（含註腳）
  python3 framework/tools/read.py semiconductor --find OPC 光罩      這些字出現在哪些小節、常見問題
  python3 framework/tools/read.py semiconductor --faq OPC           題目或答案有這個字的常見問題（含答案）
  python3 framework/tools/read.py semiconductor --chapter 01-litho  整章（含常見問題）

每一段開頭都標出處「知識庫 › 章 › 小節 id」，回答時照抄。
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


def main(argv):
    here = '--here' in argv
    argv = [a for a in argv if a != '--here']
    if not argv:
        print(__doc__)
        return 1
    kb, label = load(argv[0], here)
    args = argv[1:]
    print(f'（{label}：{kb.title}）')
    if args and args[0] == '--find':
        words = args[1:]
        hits = 0
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
            print(f'手冊裡找不到：{"、".join(words)}。換個說法（中文、英文、縮寫）再找一次；還是沒有，就是手冊沒寫。')
        return 0
    if args and args[0] == '--faq':
        words = args[1:]
        n = 0
        for ch in kb.chapters:
            for q, block in faq_blocks(ch):
                if any(w.lower() in block.lower() for w in words):
                    n += 1
                    print(f'\n## 出處：{where(kb, ch)} › 常見問題\n\n{block}')
        if not n:
            print(f'常見問題裡沒有：{"、".join(words)}')
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
    missing = [a for a in args if a not in secs]
    for sid in args:
        if sid in secs:
            s, ch = secs[sid]
            print(f'\n## 出處：{where(kb, ch, sid)}（{K.rel(s.file)}:{s.line}）\n')
            print('\n'.join(s.lines))
    if missing:
        print(f'\n沒有這些小節：{"、".join(missing)}（用 index.py 看有哪些）')
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
