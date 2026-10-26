"""檢查：開變更提案之前一定要通過的關卡。本機每改一次就跑，CI 在每個變更提案上再跑一次。

用法：
  python3 framework/tools/check.py                      檢查全部
  python3 framework/tools/check.py semiconductor        只檢查一個知識庫（寫 kb/semiconductor 也可以）

✗ 是錯誤，結束碼 1，不能開變更提案、不能合併；△ 是提醒，由維護者決定。
"""
import re
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import kb as K  # noqa: E402

# 數字：12、0.9、「幾百」「數千」「上百」、「七到九」
NUM = r'(?:\d(?:[\d,.]*\d)?|[幾數上][十百千萬]|[一二兩三四五六七八九十]+\s*到\s*[一二兩三四五六七八九十]+)'
UNIT = re.compile(NUM + r'\s*(?:nm|奈米|µm|μm|微米|mm|毫米|吋|%|％|倍|億|萬|°C|℃|美元|台幣|小時|分鐘|V|伏特|顆|點)')
YEAR = re.compile(r'(?:19|20)\d{2}\s*年')


class Report:
    def __init__(self):
        self.errors, self.warns = [], []

    def err(self, f, line, msg):
        self.errors.append(f'✗ {K.rel(f)}{":" + str(line) if line else ""}  {msg}')

    def warn(self, f, line, msg):
        self.warns.append(f'△ {K.rel(f)}{":" + str(line) if line else ""}  {msg}')


def check_kb(kb, r):
    for f, line, msg in kb.problems:
        r.err(f, line, msg)
    readme = kb.dir / 'README.md'
    if not kb.title:
        r.err(readme, 1, 'README 第一行要寫「# 知識庫名稱」')
    if not kb.intro:
        r.err(readme, 0, 'README 要在標題下寫一句話介紹這個知識庫')
    if not kb.maintainers:
        r.err(readme, 0, 'README 的「## 維護者」底下至少要列一位維護者')
    if not (kb.dir / 'terms.md').exists():
        r.err(kb.dir / 'terms.md', 0, '每個知識庫都要有術語表 terms.md（可以先只有表頭）')
    check_images(kb, r)
    if not kb.has_deck:
        r.err(kb.dir / 'deck/order.md', 0, '每個知識庫都要有簡報：頁序 deck/order.md 和章檔 deck/<部分>/<章>.md（framework/guide/deck.md）')
        return
    check_deck(kb, r)
    check_terms(kb, r)


def check_terms(kb, r):
    """術語表的「第一次出現」要指到這份簡報裡的頁；還沒有頁的術語寫「（待補）」或空著。"""
    ids = {p.id for p in K.load_order(kb).pages}
    for t in K.load_terms(kb):
        first = t.first.strip()
        if first and first not in ('（待補）', '(待補)') and first not in ids:
            r.err(kb.dir / 'terms.md', t.line, f'術語「{t.zh}」的「第一次出現」寫的是「{first}」，但頁序裡沒有這一頁；寫頁 id，還沒有頁就寫「（待補）」')


def check_footnotes(ch, r):
    """出處註腳：用到的都要有定義，定義了要有出處、要有地方用到。"""
    lines = ch.text.splitlines()
    defs = {}
    for i, l in enumerate(lines, 1):
        m = K.FOOTDEF.match(l)
        if m:
            defs[m.group(1)] = i
            if not m.group(2).strip():
                r.err(ch.file, i, f'出處註腳 [^{m.group(1)}] 沒有寫出處')
    used = set()
    for i, l in enumerate(lines, 1):
        if K.FOOTDEF.match(l):
            continue
        for name in K.FOOTREF.findall(l):
            used.add(name)
            if name not in defs:
                r.err(ch.file, i, f'用了出處註腳 [^{name}]，但這一章沒有寫「[^{name}]: 出處」')
    for name, i in defs.items():
        if name not in used:
            r.warn(ch.file, i, f'出處註腳 [^{name}] 沒有被任何地方用到')


def check_images(kb, r):
    src = K.load_sources(kb)
    files = []
    for f in sorted(kb.dir.rglob('*')):
        if f.suffix in ('.md', '.js') and 'dist' not in f.parts and 'vendor' not in f.parts and f.name != 'SOURCES.md':
            files.append(f)
    for f in files:
        for i, l in enumerate(f.read_text(encoding='utf-8').splitlines(), 1):
            for img in K.IMG.findall(l):
                if not (kb.dir / 'assets' / img).exists():
                    r.err(f, i, f'{kind(img)} assets/{img} 不存在')
                elif img not in src:
                    r.err(f, i, f'{kind(img)} assets/{img} 沒有列在圖片清單 assets/SOURCES.md；不在清單上的{kind(img)}不能用')
    for img, (desc, origin) in src.items():
        if not (kb.dir / 'assets' / img).exists():
            r.err(kb.dir / 'assets/SOURCES.md', 0, f'圖片清單列了 {img}，但檔案不存在')
        if not origin:
            r.err(kb.dir / 'assets/SOURCES.md', 0, f'{kind(img)} {img} 沒有寫出處')


def kind(asset):
    return '影片' if asset.startswith('video/') else '圖片'


def check_deck(kb, r):
    of = kb.dir / 'deck/order.md'
    order = K.load_order(kb)
    for f, line, msg in order.problems:
        r.err(f, line, msg)
    ids = K.slide_ids(kb)
    seen = set()
    for p in order.pages:
        if p.id not in ids:
            r.err(of, p.line, f'頁序裡的簡報頁「{p.id}」在章檔和 deck/slides/ 裡都找不到')
        if p.id in seen:
            r.err(of, p.line, f'簡報頁「{p.id}」在頁序裡出現兩次')
        seen.add(p.id)
    for n, name, first in order.chaps:
        if first not in seen:
            r.err(of, 0, f'章節列第 {n} 章「{name}」的第一頁「{first}」不在頁序裡')
    check_deck_md(kb, seen, r)


FIG_ADD = re.compile(r"Fig\.add\(\s*'([^']+)'")
PAGE_LINK = re.compile(r'\]\(#([A-Za-z0-9_-]+)\)')
PAGE_REF = re.compile(r'\[\[頁:([A-Za-z0-9_-]+)\]\]')


def check_deck_md(kb, in_order, r):
    """Markdown 寫的簡報頁（deck/<部分>/<章>.md）：格式、互動圖、註腳、自我檢查的「相關：」，和所有簡報檔裡的頁碼引用。"""
    deck = K.load_deck(kb)
    for f, line, msg in deck.problems:
        r.err(f, line, msg)
    figs = set()
    for f in sorted((K.ROOT / 'framework/engine/figures').glob('*.js')) + sorted((kb.dir / 'deck/figures').glob('*.js')):
        figs.update(FIG_ADD.findall(f.read_text(encoding='utf-8')))
    changed = changed_pages(kb)
    check_deep(deck, r)
    check_pre(kb, deck, r)
    for key, ch in deck.chapters.items():
        if not ch.overview:
            r.err(ch.file, 1, f'章檔「{ch.title}」開頭沒有速覽：在「# 章名」下面寫「- 速覽：」兩三句，學完會知道什麼、為什麼排在這裡')
    todo = []
    for p in deck.md_pages.values():
        if p.id not in in_order:
            r.warn(p.file, p.line, f'簡報頁「{p.id}」不在頁序 deck/order.md 裡，不會播放')
        name = p.fig.partition('｜')[0].strip()
        if not name:
            r.err(p.file, p.line, f'簡報頁「{p.id}」沒有圖：寫「- 圖：」，放互動圖、圖片或影片')
        elif p.deep and name in (K.SAME_FIG, K.TABLE_FIG):
            pass  # 深入頁沿用主頁的圖、或用表格當圖：check_deep 檢查
        elif not name.startswith('assets/') and name not in figs:
            r.err(p.file, p.line, f'簡報頁「{p.id}」的「圖：{name}」找不到；互動圖要在 deck/figures/*.js 用 Fig.add(\'{name}\', …) 註冊')
        # 數字要附出處：這次新寫或改到的說法擋下來；原本就有的列成可以做的工作
        bare = unsourced(p)
        before = changed.get(p.id) if changed else None
        new = [(label, t) for label, t in bare if before is not None and t not in before]
        for label, text in new:
            r.err(p.file, p.line, f'{"深入頁" if p.deep else "簡報頁"}「{p.id}」的{label}有數字，沒有出處註腳：「{re.sub(chr(10), " ", K.plain(text))[:40]}」；補出處或改成不帶數字的說法')
        if len(new) < len(bare):
            todo.append(p.id)
    if todo:
        r.warn(kb.dir / 'deck', 0, f'簡報裡有 {len(todo)} 頁的數字還沒有出處，可以慢慢補：python3 framework/tools/index.py {kb.name} --todo')
    for f in K.deck_files(kb):
        check_footnotes(K.load_chapter(f, [], K.CHECK_HEAD), r)
    for ch, q in [x for qs in deck.checks.values() for x in qs]:
        for kname, pid, line in q.rel:
            if kname or pid not in in_order:
                r.err(ch.file, line, f'自我檢查「{q.q}」的「相關：」指向「{pid}」，但頁序裡沒有這一頁')
    d = kb.dir / 'deck'
    for f in sorted(d.rglob('*.js')) + K.deck_files(kb):
        for i, l in enumerate(f.read_text(encoding='utf-8').splitlines(), 1):
            for pid in PAGE_REF.findall(l):
                if pid not in in_order:
                    r.err(f, i, f'頁碼引用 [[頁:{pid}]] 指到的頁不在頁序裡')
            for pid in PAGE_LINK.findall(l):
                if pid not in in_order:
                    r.err(f, i, f'連結 (#{pid}) 指到的頁不在頁序裡；跳到另一頁寫成 [文字](#頁id)')


def claims(p):
    """簡報頁上看得到的說法：結論、重點、圖說、數字卡，和深入頁說明的每一段：[(欄位, 文字)]。比喻和旁白不算。"""
    items = [('結論', p.thesis)] + [('重點', x) for x in p.points] + [('圖說', '：'.join(c)) for c in p.captions]
    if p.fact:
        items.append(('數字卡', '｜'.join(p.fact)))
    items += [('說明', b) for b in body_blocks(p.body)]
    return [(label, t) for label, t in items if t]


def body_blocks(text):
    """說明拆成一段一段（空行分段；小標題不算，清單和表格的每一列各算一段）。"""
    out = []
    for block in re.split(r'\n\s*\n', text or ''):
        lines = [l for l in block.splitlines() if l.strip() and not l.startswith('#') and not K.FOOTDEF.match(l)]
        if lines and all(l.lstrip().startswith(('|', '- ', '* ')) or re.match(r'^\s*\d+\.\s', l) for l in lines):
            out += [l.strip() for l in lines if not set(l.strip()) <= set('|-: ')]
        elif lines:
            out.append(' '.join(l.strip() for l in lines))
    return out


def check_deep(deck, r):
    """深入頁：「深入：」指到的主頁要在頁序裡、在同一個章檔；深入頁要緊接在主頁後面（中間只能是同一個主頁的深入頁）。
    「圖：同主頁」主頁要有圖，「圖：表格」說明裡要有表格；「說明：」只用在深入頁。"""
    order = [p.id for p in deck.order.pages]
    pages = {p.id: p for p in deck.pages}
    for p in deck.md_pages.values():
        if not p.deep:
            if p.body:
                r.err(p.file, p.line, f'簡報頁「{p.id}」寫了「說明：」；說明只用在深入頁（加上「- 深入：<主頁 id>」），一般的頁放旁白')
            continue
        main = pages.get(p.deep)
        if not main:
            r.err(p.file, p.line, f'深入頁「{p.id}」的「深入：{p.deep}」指到的頁不在頁序裡')
            continue
        if main.deep:
            r.err(p.file, p.line, f'深入頁「{p.id}」接在「{p.deep}」後面，但「{p.deep}」本身也是深入頁；深入頁要接在主頁後面')
        if main.file != p.file:
            r.err(p.file, p.line, f'深入頁「{p.id}」要寫在主頁「{p.deep}」同一個章檔（{K.rel(main.file)}）')
        if p.id in order:
            i, j = order.index(main.id), order.index(p.id)
            between = order[i + 1:j]
            if j < i or any((pages.get(x) and pages[x].deep) != p.deep for x in between):
                r.err(deck.order.file, next(x.line for x in deck.order.pages if x.id == p.id), f'頁序裡，深入頁「{p.id}」要緊接在主頁「{p.deep}」後面（中間只能是「{p.deep}」的其他深入頁）')
        name = p.fig.partition('｜')[0].strip()
        if name == K.SAME_FIG and not main.fig.partition('｜')[0].strip():
            r.err(p.file, p.line, f'深入頁「{p.id}」寫了「圖：同主頁」，但主頁「{p.deep}」沒有圖')
        if name == K.TABLE_FIG and not any(l.lstrip().startswith('|') for l in p.body.splitlines()):
            r.err(p.file, p.line, f'深入頁「{p.id}」寫了「圖：表格」，但「說明：」裡沒有表格')


def check_pre(kb, deck, r):
    """章檔開頭的「先修：」要指到存在的章；別的知識庫的章寫成「cv › 影像分類」。"""
    names = {kb.name: K.chapter_names(deck)}
    for key, ch in deck.chapters.items():
        for kname, name, line in ch.pre:
            other = kname or kb.name
            if other not in names:
                o = next((x for x in K.all_kbs() if x.name == other), None)
                names[other] = K.chapter_names(K.load_deck(o)) if o and o.has_deck else None
            if names[other] is None:
                r.err(ch.file, line, f'「先修：」的「{kname} › {name}」：沒有「{kname}」這個知識庫，或它還沒有簡報')
            elif K.chapter_name(name) not in names[other]:
                where = f'知識庫「{other}」' if kname else '這份簡報'
                r.err(ch.file, line, f'「先修：」的「{name}」在{where}裡找不到這一章；寫章檔的「# 章名」，別的知識庫寫成「cv › 影像分類」')


def unsourced(p):
    """有數字卻沒有出處註腳的說法：[(欄位, 文字)]。"""
    return [(label, t) for label, t in claims(p) if UNIT.search(YEAR.sub('', K.plain(t))) and '[^' not in t]


def changed_pages(kb):
    """這個分支新增或改過的 Markdown 簡報頁：{頁 id: 起點上這一頁的說法}，新頁是空集合；判斷不了（沒有 Git、找不到起點）時是 None。"""
    try:
        old = K.base_kb(kb.name, fetch=False)
    except (SystemExit, Exception):  # 手動模式、沒有遠端、找不到起點：判斷不了就不擋
        return None
    od = K.load_deck(old).md_pages if old and old.has_deck else {}
    return {i: {t for _, t in claims(od[i])} if i in od else set()
            for i, p in K.load_deck(kb).md_pages.items() if i not in od or od[i].fp != p.fp}


def check_paths(r):
    """入口網站的角色路徑（framework/paths.md）：每一步要指到存在的知識庫和頁。"""
    pages = {}
    for kb in K.all_kbs():
        if kb.has_deck:
            pages[kb.name] = {p.id for p in K.load_order(kb).pages}
    for role in K.load_paths():
        for kname, pid, _, line in role['steps']:
            if kname is None:
                r.err(K.PATHS, line, f'角色路徑「{role["name"]}」這一步要寫成「- 知識庫/頁 id」：{pid}')
            elif kname not in pages:
                r.err(K.PATHS, line, f'角色路徑「{role["name"]}」的「{kname}/{pid}」：知識庫「{kname}」不存在，或還沒有簡報')
            elif pid not in pages[kname]:
                r.err(K.PATHS, line, f'角色路徑「{role["name"]}」的「{kname}/{pid}」：{kname} 的頁序裡沒有這一頁')


def check_readme(r):
    f = K.ROOT / 'README.md'
    if not f.exists():
        r.err(f, 0, '框架首頁 README.md 不存在')
        return
    text = f.read_text(encoding='utf-8')
    if K.readme_with_kb_list(text) != text:
        r.err(f, 0, '首頁的知識庫清單跟各知識庫的 README 對不上；請執行 python3 framework/tools/build.py --readme')


def main(argv):
    if any(a.startswith('--') for a in argv):
        print(__doc__)
        return 1
    kbs = [K.find_kb(a) for a in argv] if argv else K.all_kbs()
    r = Report()
    for kb in kbs:
        check_kb(kb, r)
    if not argv:
        check_readme(r)
        check_paths(r)
    for l in r.errors + r.warns:
        print(l)
    names = '、'.join(k.name for k in kbs)
    print(f'檢查 {names}：{len([e for e in r.errors if e.startswith("✗")])} 個錯誤、{len(r.warns)} 個提醒')
    return 1 if r.errors else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
