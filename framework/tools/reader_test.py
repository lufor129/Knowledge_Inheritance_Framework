"""讀者測試：找出這個分支改過的簡報章，產生給外行讀者的題目卷，和你對答案用的答案卷。

用法：
  python3 framework/tools/reader_test.py semiconductor
  python3 framework/tools/reader_test.py semiconductor --ask "hk3-d：二氧化鉿為什麼要最後才鋪？"

改過的章：和分支的起點比，簡報頁或自我檢查有變的章檔（只改了開頭的速覽、先修不算）。每一章產生兩個檔案，放在 .kif/tmp/reader-test/：
  <章>.questions.md   題目卷，給子 agent：那一章每一頁的文字、深入頁的說明和旁白；後面接題目
  <章>.answers.md     答案卷，給你：每題的參考答案和相關的頁
題目是那一章的自我檢查（深入題除外），加上 --ask 補的題目（寫成「頁 id：題目」）。
互動圖外行讀者看不到，所以測的是文字、說明和旁白講不講得清楚。
改過的簡報頁沒有題目對應時，會列出來並停下；用 --ask 替它們各補一題，再跑一次。
"""
import pathlib
import re
import shutil
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import kb as K  # noqa: E402

OUT = K.TMP / 'reader-test'
INSTRUCTIONS = '''你是完全沒有這個領域背景的新人。下面是簡報的一章：每一頁的標題、重點、說明（深入頁的長說明）和講解（旁白）。請只根據這一章回答最後的題目：

- 章裡沒寫的，回答「這章沒寫」，不要用你自己的知識補。
- 每題用一兩句話回答，標上題號。
- 只讀這個檔案，不要打開其他檔案。'''


def main(argv):
    if not argv:
        print(__doc__)
        return 1
    asks = []
    for i, a in enumerate(argv):
        if a == '--ask' and i + 1 < len(argv):
            sid, _, q = argv[i + 1].partition('：')
            if not q:
                sid, _, q = argv[i + 1].partition(':')
            asks.append((sid.strip(), q.strip()))
    new = K.find_kb(argv[0])
    ch = K.changes(K.base_kb(new.name), new)
    if not ch.deck_chapters:
        print(f'這個分支沒有改到 {new.title} 的簡報頁或自我檢查，不用做讀者測試。')
        return 2
    changed = {p.id for p in ch.deck_added + ch.deck_modified}
    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir(parents=True)
    missing, papers = [], []

    def paper(stem, title, how, body, ids, qs):
        """qs：[(題目, 參考答案, 相關的頁 id)]；ids：這一章的簡報頁。"""
        qs = qs + [(q, f'（自己出的題目：對照 {sid} 的內容）', [sid]) for sid, q in asks if sid in ids]
        covered = {sid for _, _, rel in qs for sid in rel}
        missing.extend(i for i in ids if i in changed and i not in covered)
        if not qs:
            missing.append(f'{stem}（這一章沒有題目）')
        papers.append((stem, title, how, body, qs, [i for i in ids if i in changed]))

    deck = K.load_deck(new)
    for f in ch.deck_chapters:
        dc = K.load_chapter(f, [], K.CHECK_HEAD)
        pages = [deck.md_pages[s.id] for s in dc.sections if s.id in deck.md_pages]
        paper(f'deck-{f.parent.name}-{f.stem}', f'簡報：{dc.title}', INSTRUCTIONS,
              '\n\n'.join(K.deck_page_text(p) for p in pages) + '\n', [p.id for p in pages],
              [(q.q, K.faq_answer(dc, q), [pid for _, pid, _ in q.rel]) for q in dc.faqs if not q.deep])
    if missing:
        print('這些改過的簡報頁還沒有題目，用 --ask 各補一題「讀完應該答得出來」的題目，再跑一次：')
        print('  ' + '、'.join(missing))
        print(f'  例如：python3 framework/tools/reader_test.py {new.name} --ask "{missing[0].split("（")[0]}：<題目>"')
        return 1
    for stem, title, how, body, qs, mine in papers:
        doc = [f'# 讀者測試：{title}', '', how, '', '---', '', body.rstrip(), '', '---', '', '## 題目', '']
        doc += [f'{i}. {q}' for i, (q, _, _) in enumerate(qs, 1)]
        (OUT / f'{stem}.questions.md').write_text('\n'.join(doc) + '\n', encoding='utf-8')
        ans = [f'# 讀者測試的答案：{title}', '',
               '答不出來、答錯、或用了章裡沒有的知識，都算沒過。', '']
        for i, (q, a, rel) in enumerate(qs, 1):
            ans += [f'## {i}. {q}', '', f'參考答案：{a}', '', f'相關：{"、".join(rel)}', '']
        (OUT / f'{stem}.answers.md').write_text('\n'.join(ans), encoding='utf-8')
        print(f'{stem}（{title}）：{len(qs)} 題；改過的：{"、".join(mine) or "（只改了題目或其他地方）"}')
        print(f'  題目卷：{K.rel(OUT / f"{stem}.questions.md")}')
        print(f'  答案卷：{K.rel(OUT / f"{stem}.answers.md")}')
    print('\n下一步：每一章開一個子 agent（Agent 工具），只跟它說「讀 <題目卷>，照裡面的指示作答」，不要多給別的資料。')
    print('拿它的回答對照答案卷；全部答對才算通過，在提案說明寫「讀者測試：n/n 題答對」。')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
