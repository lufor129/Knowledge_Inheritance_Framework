"""讀者測試：找出這個分支改過的章，產生給外行讀者的題目卷，和你對答案用的答案卷。

用法：
  python3 framework/tools/reader_test.py semiconductor
  python3 framework/tools/reader_test.py semiconductor --ask "hk9：背面供電為什麼能省下晶片面積？"

改過的章：和分支的起點比，內容有變的章。每一章產生兩個檔案，放在 .kif/tmp/reader-test/：
  <章>.questions.md   題目卷，給子 agent：章的內文（拿掉常見問題）和題目
  <章>.answers.md     答案卷，給你：每題的參考答案和相關小節
題目是那一章的常見問題（深入題除外），加上 --ask 補的題目（寫成「小節 id：題目」）。
改過的小節沒有題目對應時，會列出來並停下；用 --ask 替它們各補一題，再跑一次。
"""
import pathlib
import re
import shutil
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import kb as K  # noqa: E402

OUT = K.TMP / 'reader-test'
INSTRUCTIONS = '''你是完全沒有這個領域背景的新人。下面是手冊的一章，請只根據這一章回答最後的題目：

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
    if not ch.chapters:
        print(f'這個分支沒有改到 {new.title} 的任何一章，不用做讀者測試。')
        return 2
    changed = {x.id for x in ch.added + ch.modified}
    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir(parents=True)
    missing, papers = [], []
    for c in ch.chapters:
        ids = {x.id for x in c.sections}
        qs = [(q.q, K.faq_answer(c, q), [sid for _, sid, _ in q.rel]) for q in c.faqs if not q.deep]
        qs += [(q, f'（自己出的題目：對照小節 {sid} 的內文）', [sid]) for sid, q in asks if sid in ids]
        covered = {sid for _, _, rel in qs for sid in rel}
        missing += [x.id for x in c.sections if x.id in changed and x.id not in covered]
        mine = [x.id for x in c.sections if x.id in changed]
        if not qs:
            missing.append(f'{c.file.stem}（這一章沒有題目）')
        papers.append((c, qs, mine))
    if missing:
        print('這些改過的小節還沒有題目，用 --ask 各補一題「讀完這一節應該答得出來」的題目，再跑一次：')
        print('  ' + '、'.join(missing))
        print(f'  例如：python3 framework/tools/reader_test.py {new.name} --ask "{missing[0].split("（")[0]}：<題目>"')
        return 1
    for c, qs, mine in papers:
        stem = c.file.stem
        paper = [f'# 讀者測試：{c.title}', '', INSTRUCTIONS, '', '---', '', K.chapter_body(c).rstrip(), '', '---', '',
                 '## 題目', '']
        paper += [f'{i}. {q}' for i, (q, _, _) in enumerate(qs, 1)]
        (OUT / f'{stem}.questions.md').write_text('\n'.join(paper) + '\n', encoding='utf-8')
        ans = [f'# 讀者測試的答案：{c.title}', '',
               '答不出來、答錯、或用了章裡沒有的知識，都算沒過。', '']
        for i, (q, a, rel) in enumerate(qs, 1):
            ans += [f'## {i}. {q}', '', f'參考答案：{a}', '', f'相關小節：{"、".join(rel)}', '']
        (OUT / f'{stem}.answers.md').write_text('\n'.join(ans), encoding='utf-8')
        print(f'{stem}（{c.title}）：{len(qs)} 題；改過的小節：{"、".join(mine) or "（只改了常見問題或其他地方）"}')
        print(f'  題目卷：{K.rel(OUT / f"{stem}.questions.md")}')
        print(f'  答案卷：{K.rel(OUT / f"{stem}.answers.md")}')
    print('\n下一步：每一章開一個子 agent（Agent 工具），只跟它說「讀 <題目卷>，照裡面的指示作答」，不要多給別的資料。')
    print('拿它的回答對照答案卷；全部答對才算通過，在提案說明寫「讀者測試：n/n 題答對」。')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
