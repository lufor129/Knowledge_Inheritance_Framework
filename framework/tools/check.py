"""檢查：開變更提案之前一定要通過的關卡。本機每改一次就跑，CI 在每個變更提案上再跑一次。

用法：
  python3 framework/tools/check.py                      檢查全部
  python3 framework/tools/check.py semiconductor        只檢查一個知識庫（寫 kb/semiconductor 也可以）
  python3 framework/tools/check.py --fp semiconductor 頁id [頁id …]
                                                        重看並改好這些簡報頁之後，更新頁序裡的指紋

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


def check_kb(kb, secs, r):
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

    # 小節 id：格式、不重複
    seen = {}
    for s in kb.sections:
        if not K.ID_OK.match(s.id):
            r.err(s.file, s.line, f'小節 id「{s.id}」只能用小寫英文開頭、後面接小寫英文或數字，例如 hk1')
        if s.id in seen:
            o = seen[s.id]
            r.err(s.file, s.line, f'小節 id「{s.id}」重複，{K.rel(o.file)}:{o.line} 已經用過；請換一個 id')
        else:
            seen[s.id] = s

    for ch in kb.chapters:
        # 常見問題的「相關：」要指到存在的小節
        for q in ch.faqs:
            for kname, sid, line in q.rel:
                if (kname or kb.name, sid) not in secs:
                    where = f'知識庫「{kname}」裡' if kname else '這個知識庫裡'
                    r.err(ch.file, line, f'常見問題「{q.q}」的「相關：」指向「{sid}」，但{where}沒有這個小節')
        # 出處註腳
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
        # 數字沒附出處：只提醒
        for s in ch.sections:
            for para, line in paragraphs(s):
                if UNIT.search(YEAR.sub('', para)) and '[^' not in para:
                    snippet = re.sub(r'\s+', ' ', para)[:40]
                    r.warn(ch.file, line, f'小節「{s.id}」這段有數字，但沒有出處註腳：「{snippet}…」')
        for q, ans, line in faq_answers(ch):
            if UNIT.search(YEAR.sub('', ans)) and '[^' not in ans:
                snippet = re.sub(r'\s+', ' ', ans)[:40]
                r.warn(ch.file, line, f'常見問題「{q}」的答案有數字，但沒有出處註腳：「{snippet}…」')

    check_images(kb, r)
    if (kb.dir / 'deck').exists():
        check_deck(kb, secs, r)


def paragraphs(s):
    """小節裡的一般段落（跳過標題、錨點、程式碼、註解、註腳定義），回傳 (文字, 起始行號)。"""
    out, buf, start, code = [], [], 0, False
    for k, l in enumerate(s.lines):
        ln = s.line + k
        if l.startswith('```'):
            code = not code
            continue
        skip = code or l.startswith(('#', '<a ', '<!--', '[^')) or K.ANCHOR.match(l)
        if skip or not l.strip():
            if buf:
                out.append((' '.join(buf), start))
            buf = []
            continue
        if not buf:
            start = ln
        buf.append(l.strip())
    if buf:
        out.append((' '.join(buf), start))
    return out


def faq_answers(ch):
    """常見問題的答案（跳過題目和「相關：」），回傳 (題目, 答案文字, 起始行號)。"""
    lines = ch.text.splitlines()
    if K.FAQ_HEAD not in lines:
        return []
    out, q, buf, start = [], None, [], 0
    for i in range(lines.index(K.FAQ_HEAD) + 1, len(lines)):
        l = lines[i]
        sm = re.search(r'<summary>(.*?)</summary>', l)
        if sm:
            q, buf = sm.group(1).strip(), []
            continue
        if l.strip() == '</details>':
            if q and buf:
                out.append((q, ' '.join(buf), start))
            q = None
            continue
        if q is None or not l.strip() or K.REL.match(l) or l.startswith('[^'):
            continue
        if not buf:
            start = i + 1
        buf.append(l.strip())
    return out


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


def check_deck(kb, secs, r):
    of = kb.dir / 'deck/order.md'
    if not of.exists():
        r.err(of, 0, '有 deck/ 資料夾就要有頁序 deck/order.md')
        return
    order = K.load_order(kb)
    for f, line, msg in order.problems:
        r.err(f, line, msg)
    ids = K.slide_ids(kb)
    seen = set()
    stale = []
    for p in order.pages:
        if p.id not in ids:
            r.err(of, p.line, f'頁序裡的簡報頁「{p.id}」在 deck/slides/ 裡找不到')
        if p.id in seen:
            r.err(of, p.line, f'簡報頁「{p.id}」在頁序裡出現兩次')
        seen.add(p.id)
        for kname, sid, fp in p.maps:
            s = secs.get((kname or kb.name, sid))
            if s is None:
                r.err(of, p.line, f'簡報頁「{p.id}」對應的小節「{sid}」不存在')
            elif fp is None:
                r.err(of, p.line, f'簡報頁「{p.id}」對應的小節「{sid}」還沒有指紋')
                stale.append(p.id)
            elif fp != s.fp:
                r.err(of, p.line, f'簡報頁「{p.id}」對應的小節「{sid}」改過了（記錄的指紋 {fp}，現在是 {s.fp}），要重看這一頁')
                stale.append(p.id)
    for n, name, first in order.chaps:
        if first not in seen:
            r.err(of, 0, f'章節列第 {n} 章「{name}」的第一頁「{first}」不在頁序裡')
    if stale:
        pages = ' '.join(dict.fromkeys(stale))
        r.errors.append(f'  → 重看並改好上面點名的簡報頁之後，執行：python3 framework/tools/check.py --fp {kb.name} {pages}')


def check_readme(r):
    f = K.ROOT / 'README.md'
    if not f.exists():
        r.err(f, 0, '框架首頁 README.md 不存在')
        return
    text = f.read_text(encoding='utf-8')
    if K.readme_with_kb_list(text) != text:
        r.err(f, 0, '首頁的知識庫清單跟各知識庫的 README 對不上；請執行 python3 framework/tools/build.py --readme')


def main(argv):
    if argv[:1] == ['--fp']:
        if len(argv) < 3:
            raise SystemExit('用法：check.py --fp 知識庫 頁id [頁id …]')
        kb = K.find_kb(argv[1])
        done = K.update_fingerprints(kb, set(argv[2:]))
        missing = set(argv[2:]) - set(done)
        print(f'已更新指紋：{"、".join(done) or "（沒有）"}')
        if missing:
            print(f'這些頁在頁序裡沒有對應小節，沒有更新：{"、".join(sorted(missing))}')
        return 0
    kbs = [K.find_kb(a) for a in argv] if argv else K.all_kbs()
    secs = K.section_index()
    r = Report()
    for kb in kbs:
        check_kb(kb, secs, r)
    if not argv:
        check_readme(r)
    for l in r.errors + r.warns:
        print(l)
    names = '、'.join(k.name for k in kbs)
    print(f'檢查 {names}：{len([e for e in r.errors if e.startswith("✗")])} 個錯誤、{len(r.warns)} 個提醒')
    return 1 if r.errors else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
