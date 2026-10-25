"""變更提案的草稿：比較目前的分支和它的起點，寫好說明、標題和標籤，印出開提案的指令和開好之後要做的事。

用法：
  python3 framework/tools/proposal.py semiconductor --source 研究 [--closes 12] [--reader 5/5]
  python3 framework/tools/proposal.py --framework

--source 是來歷：研究、整理或訪談。--closes 是這次回答的待回答或修正的勘誤（可以寫好幾次）。
--reader 是讀者測試的結果，例如 5/5。

會先跑檢查；有 ✗ 就停下來，不產生草稿。
說明的草稿寫在 .kif/tmp/proposal.md，「（……）」的地方換成你的話之後才開提案。
"""
import pathlib
import re
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import kb as K  # noqa: E402
import check as C  # noqa: E402
import who as W  # noqa: E402

BODY = K.TMP / 'proposal.md'
SOURCES = ('研究', '整理', '訪談')


def opt(argv, name, many=False):
    vals = [argv[i + 1] for i, a in enumerate(argv) if a == name and i + 1 < len(argv)]
    return vals if many else (vals[0] if vals else None)


def changed_files(base):
    files = K.git('diff', '--name-only', base).splitlines() + K.git('ls-files', '--others', '--exclude-standard').splitlines()
    return sorted({f for f in files if f and not f.startswith('.kif/')})


def changed_spans(ch):
    """改過的小節和常見問題在哪幾行：[(檔案, 第一行, 最後一行)]。"""
    out = [(K.rel(x.file), x.line, x.line + len(x.lines) - 1) for x in ch.added + ch.modified]
    for c, q in ch.faq_added + ch.faq_changed:
        out.append((K.rel(c.file), q.line - 1, q.line - 1 + len(K.faq_block(c, q).splitlines())))
    return out


def in_spans(warn, spans):
    m = re.match(r'^△ (.+?):(\d+)\s', warn)
    return bool(m) and any(m.group(1) == f and a <= int(m.group(2)) <= b for f, a, b in spans)


def kb_body(kb, ch, source, closes, reader, warns, files):
    out = ['🤖 由 Agent 產生', '', '## 改了什麼']
    out += [f'- 新增 `{x.id}`「{x.title}」：（一句話說這一節講什麼）' for x in ch.added]
    out += [f'- 修改 `{x.id}`「{x.title}」：（一句話說改了什麼、為什麼改）' for x in ch.modified]
    out += [f'- 刪除 `{x.id}`「{x.title}」：（一句話說為什麼刪）' for x in ch.deleted]
    for label, items in (('新增', ch.faq_added), ('修改', ch.faq_changed), ('刪除', ch.faq_deleted)):
        if items:
            out.append(f'- 常見問題{label}：' + '、'.join(f'「{q.q}」（{c.title}）' for c, q in items))
    if ch.terms_added:
        out.append(f'- 術語表新增 {len(ch.terms_added)} 個：' + '、'.join(l.strip('|').split('|')[0].strip() for l in ch.terms_added))
    if len(out) == 3:
        out.append('- （這個分支沒有改到小節、常見問題或術語；寫出改了什麼）')
    if source == '研究':  # 研究來的說法沒有人親身確認過，維護者要知道哪些只是報導
        origin = ['研究：', '- 第一手：（原廠文件、論文、官方網頁，各支持哪些說法）',
                  '- 報導：（新聞、業界媒體，各支持哪些說法；沒有就寫「沒有」）']
    else:
        origin = [f'{source}：（內容從哪裡來：整理了哪份資料／誰口述的）']
    out += ['', '## 來歷', *origin, '', '## 影響']
    out.append(f'- 簡報頁：{"、".join(ch.pages) + "（重看過，寫出哪些改了文字）" if ch.pages else "沒有對應的簡報頁要改"}')
    chap_files = {K.rel(c.file) for c in kb.chapters}
    others = [f for f in files if f not in chap_files and not f.startswith(f'kb/{kb.name}/deck/')
              and f != f'kb/{kb.name}/terms.md']
    out.append(f'- 一起改的檔案：{"、".join(others) if others else "沒有"}')
    out.append(f'- 讀者測試：{reader + " 題答對" if reader else "（n/n 題答對）"}')
    if warns:
        out.append(f'- 檢查的提醒（{len(warns)} 個，在這次改的小節和常見問題裡；補不了出處的寫原因，由維護者決定）：')
        out += [f'  - {w[2:]}' for w in warns]
    if closes:
        out += [''] + [f'Closes #{n}' for n in closes]
    return out


def next_steps(kb, title, labels, branch):
    host = K.CONFIG.get('host')
    main = K.CONFIG.get('main', 'main')
    me = W.login()
    lab = ' '.join(f'--label "{l}"' for l in labels)
    print('\n下一步：')
    if host == 'github':
        print(f'1. 推分支：git push -u origin {branch}')
        print(f'2. 開提案：gh pr create --base {main} --title "{title}" {lab} --body-file {K.rel(BODY)}')
    elif host == 'gitlab':
        print(f'1. 推分支：git push -u origin {branch}')
        print(f'2. 開提案：glab mr create --target-branch {main} --title "{title}" {lab} '
              f'--description "$(cat {K.rel(BODY)})"（GitLab 還沒有實測）')
    else:
        print(f'1. 手動模式：請使用者把分支 {branch} 交給維護者，附上 {K.rel(BODY)} 的內容；由維護者合併。')
        return
    if kb is None:
        fw = [a for _, a in K.framework_maintainers() if a and a != me]
        print('3. 開好之後：' + (f'請框架維護者審：gh pr edit <N> --add-reviewer {",".join(fw)}' if fw
                                else '使用者就是框架維護者：等 CI 通過（gh pr checks <N> --watch），使用者說好就合併'))
        return
    if W.is_maintainer(me, kb):
        print('3. 開好之後：使用者是這個知識庫的維護者，這是自己的提案。等 CI 通過（gh pr checks <N> --watch），'
              '把研究來的段落列出來讓使用者再看一眼，使用者說好就合併：gh pr merge <N> --squash --delete-branch')
    else:
        accounts = ','.join(a for _, a in kb.maintainers if a)
        print(f'3. 開好之後：請維護者審：gh pr edit <N> --add-reviewer {accounts}；告訴使用者提案在等維護者審核。')


def main(argv):
    framework = '--framework' in argv
    args = [a for a in argv if not a.startswith('--')]
    if not framework and not args:
        print(__doc__)
        return 1
    branch = K.git('rev-parse', '--abbrev-ref', 'HEAD')
    if branch == K.CONFIG.get('main', 'main'):
        print('現在在主線上。先開分支（git switch -c <分支> origin/main），在分支上改。')
        return 1
    base = K.base_ref()
    files = changed_files(base)
    if K.git('status', '--porcelain', check=False):
        print('提醒：還有沒 commit 的改動。commit 之後再推分支、開提案。')
    kb = None if framework else K.find_kb(args[0])
    r = C.Report()
    secs = K.section_index()
    for k in ([kb] if kb else K.all_kbs()):
        C.check_kb(k, secs, r)
    if framework:
        C.check_readme(r)
    if r.errors:
        print('檢查沒過，先修好這些 ✗ 再開提案：')
        print('\n'.join(r.errors))
        return 1
    BODY.parent.mkdir(parents=True, exist_ok=True)
    if framework:
        title = '框架：（改了什麼）'
        labels = []
        body = ['🤖 由 Agent 產生', '', '## 改了什麼', '- （一句話說改了什麼、為什麼改）', '',
                '## 改到的檔案'] + [f'- {f}' for f in files] + ['', '## 影響',
                '- （哪些 skill、規則或工具的行為會變；跑過情境測試的話，寫結果）',
                '- CI 會建置每一個知識庫，全部成功才能合併']
    else:
        source = opt(argv, '--source')
        if source not in SOURCES:
            print(f'--source 要寫來歷：{"、".join(SOURCES)}')
            return 1
        ch = K.changes(K.base_kb(kb.name), kb)
        warns = [w for w in r.warns if in_spans(w, changed_spans(ch))]
        body = kb_body(kb, ch, source, opt(argv, '--closes', many=True), opt(argv, '--reader'), warns, files)
        title = f'{kb.title}：（改了什麼）'
        labels = [f'kb:{kb.name}', f'來歷:{source}']
        if not opt(argv, '--reader') and ch.chapters:
            print('提醒：還沒寫讀者測試的結果。先跑 reader_test.py，再用 --reader n/n 重跑這個指令。')
    BODY.write_text('\n'.join(body) + '\n', encoding='utf-8')
    print(f'說明的草稿：{K.rel(BODY)}（把「（……）」換成你的話）')
    print(f'標題：{title}（把「（改了什麼）」換成一句話）')
    print(f'標籤：{"、".join(labels) or "（改框架不貼標籤）"}')
    print(f'改到的檔案：{"、".join(files) or "（沒有）"}')
    next_steps(kb, title, labels, branch)
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
