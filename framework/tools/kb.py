"""知識庫的共用解析：知識庫、部分、章、小節、常見問題、頁序、圖片清單。

framework/tools/ 的工具都用這裡的函式讀檔案。只用 Python 標準函式庫。
"""
import hashlib
import io
import json
import pathlib
import re
import shutil
import subprocess
import tarfile
from dataclasses import dataclass, field

ROOT = pathlib.Path(__file__).resolve().parents[2]
KB_DIR = ROOT / 'kb'
CONFIG = json.loads((ROOT / 'framework/config.json').read_text(encoding='utf-8'))
LOCAL = ROOT / '.kif/local.json'     # 使用者的名字、帳號、關心的知識庫；只存在本機
TMP = ROOT / '.kif/tmp'              # Agent 的暫存檔（issue 內文、提案說明、讀者測試）
SNAP = ROOT / '.kif/snapshot'        # 某一版手冊的快照（正式內容、分支的起點）

ANCHOR = re.compile(r'^<a name="([^"]*)"></a>\s*$')
ID_OK = re.compile(r'^[a-z][a-z0-9]*$')
PART_DIR = re.compile(r'^(\d+)-[a-z0-9-]+$')
CHAP_FILE = re.compile(r'^(\d+)-[a-z0-9-]+\.md$')
FOOTREF = re.compile(r'\[\^([^\]\s]+)\](?!:)')
FOOTDEF = re.compile(r'^\[\^([^\]\s]+)\]:\s*(.*)$')
IMG = re.compile(r'assets/(img/[\w.-]+\.(?:jpe?g|png|gif|svg|webp)|video/[\w.-]+\.(?:mp4|webm))')
REL = re.compile(r'^\s*相關[：:]\s*(.+?)\s*$')
REF = re.compile(r'^(?:([a-z0-9-]+)/)?([A-Za-z0-9_-]+)(?:@([0-9a-f]+))?$')
FAQ_HEAD = '## 常見問題'


@dataclass
class Section:
    id: str
    title: str
    file: pathlib.Path
    line: int            # 錨點所在的行（從 1 起算）
    lines: list          # 小節的原文，從錨點到下一個錨點或常見問題之前
    chapter: 'Chapter' = None

    @property
    def fp(self):
        return fingerprint('\n'.join(self.lines))


@dataclass
class Faq:
    q: str
    deep: bool
    rel: list            # [(知識庫名稱或 None, 小節 id, 行號)]
    line: int
    topic: str = ''      # 前面最近的「### 主題」（簡報的自我檢查用來分組）


@dataclass
class Chapter:
    file: pathlib.Path
    num: int
    title: str
    overview: str
    sections: list
    faqs: list
    text: str
    part: 'Part' = None


@dataclass
class Part:
    dir: pathlib.Path
    num: int
    title: str
    chapters: list


@dataclass
class KB:
    name: str
    dir: pathlib.Path
    title: str
    intro: str
    maintainers: list    # [(名字, 帳號或 None)]
    bigpicture: str      # README 裡「全景圖」那一節的 Mermaid 原文
    parts: list
    problems: list = field(default_factory=list)   # 解析時就發現的結構錯誤 [(檔案, 行, 訊息)]

    @property
    def sections(self):
        return [s for p in self.parts for c in p.chapters for s in c.sections]

    @property
    def chapters(self):
        return [c for p in self.parts for c in p.chapters]

    @property
    def has_deck(self):
        return (self.dir / 'deck/order.md').exists()


def fingerprint(text):
    norm = '\n'.join(l.rstrip() for l in text.strip('\n').splitlines()).strip()
    return hashlib.sha1(norm.encode('utf-8')).hexdigest()[:6]


def rel(path):
    """相對於 repo 的路徑；快照裡的檔案寫成它在 repo 裡的位置（kb/…）。"""
    p = pathlib.Path(path).resolve()
    if SNAP.resolve() in p.parents:
        return str(pathlib.Path(*p.relative_to(SNAP.resolve()).parts[1:]))
    return str(p.relative_to(ROOT))


def all_kbs(base=None):
    base = base or KB_DIR
    return [load_kb(d) for d in sorted(base.iterdir()) if (d / 'README.md').exists()]


def find_kb(arg, base=None):
    name = pathlib.Path(arg).name
    d = (base or KB_DIR) / name
    if not (d / 'README.md').exists():
        raise SystemExit(f'找不到知識庫「{arg}」：kb/{name}/README.md 不存在')
    return load_kb(d)


def people(block):
    """「維護者」清單的每一列「- 名字（GitHub: 帳號）」→ [(名字, 帳號或 None)]。"""
    out = []
    for l in (block or '').splitlines():
        m = re.match(r'^\s*[-*]\s+(.+?)\s*$', l)
        if not m:
            continue
        h = re.search(r'(?:GitHub|GitLab)[:：]\s*@?([\w-]+)', m.group(1))
        name = re.sub(r'[（(].*?[)）]', '', m.group(1)).strip()
        out.append((name, h.group(1) if h else None))
    return out


def framework_maintainers():
    return people(_block((ROOT / 'README.md').read_text(encoding='utf-8'), '框架維護者'))


def load_local():
    try:
        return json.loads(LOCAL.read_text(encoding='utf-8'))
    except (OSError, json.JSONDecodeError):
        return {}


def save_local(data):
    LOCAL.parent.mkdir(parents=True, exist_ok=True)
    LOCAL.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


# ---------- 正式內容和分支的起點 ----------

SNAP_FILES = re.compile(r'^kb/[^/]+/(?:README\.md|terms\.md|handbook/.+|deck/order\.md)$')


def git(*args, check=True):
    r = subprocess.run(['git', *args], cwd=ROOT, capture_output=True, text=True)
    if check and r.returncode:
        raise SystemExit(f'git {" ".join(args)} 失敗：{r.stderr.strip()}')
    return r.stdout.strip()


def main_ref(fetch=True):
    """正式內容的 git 參照：有遠端就先抓最新的，用 origin/main；沒有遠端（手動模式）用本機的 main。"""
    main = CONFIG.get('main', 'main')
    if git('remote', check=False):
        if fetch:
            git('fetch', '--quiet', 'origin', main, check=False)
        if git('rev-parse', '--verify', '--quiet', f'origin/{main}', check=False):
            return f'origin/{main}'
    return main


def base_ref():
    """這個分支是從正式內容的哪一版開出來的（比較「這次改了什麼」用）。"""
    return git('merge-base', main_ref(), 'HEAD')


def snapshot(ref, name):
    """把 ref 那一版的手冊（各知識庫的 README、terms、handbook、頁序）放到 .kif/snapshot/<name>/kb/。

    回傳那個 kb 資料夾，可以直接給 all_kbs()、find_kb() 當 base。
    """
    sha = git('rev-parse', ref)
    dest = SNAP / name
    stamp = dest / 'COMMIT'
    if stamp.exists() and stamp.read_text().strip() == sha:
        return dest / 'kb'
    if dest.exists():
        shutil.rmtree(dest)
    (dest / 'kb').mkdir(parents=True)
    listing = subprocess.run(['git', 'ls-tree', '-r', '-z', '--name-only', sha, 'kb'], cwd=ROOT,
                             capture_output=True, check=True).stdout.decode('utf-8')
    files = [f for f in listing.split('\0') if SNAP_FILES.match(f)]
    if files:
        data = subprocess.run(['git', 'archive', '--format=tar', sha, '--', *files], cwd=ROOT,
                              capture_output=True, check=True).stdout
        with tarfile.open(fileobj=io.BytesIO(data)) as t:
            t.extractall(dest, filter='data')
    stamp.write_text(sha + '\n')
    return dest / 'kb'


def _h1(text):
    m = re.search(r'^# (.+)$', text, re.M)
    return m.group(1).strip() if m else ''


def _block(text, heading):
    """取出「## heading」底下、下一個 ## 之前的原文。"""
    m = re.search(rf'^## {re.escape(heading)}\s*$(.*?)(?=^## |\Z)', text, re.M | re.S)
    return m.group(1).strip('\n') if m else None


def load_kb(d):
    readme = (d / 'README.md').read_text(encoding='utf-8')
    problems = []
    title = _h1(readme)
    intro = ''
    after = readme.split('\n', 1)[1] if title else readme
    for para in re.split(r'\n\s*\n', after):
        para = para.strip()
        if para and not para.startswith(('#', '<!--', '```')):
            intro = ' '.join(l.strip() for l in para.splitlines())
            break
    maint = people(_block(readme, '維護者'))
    big = _block(readme, '全景圖') or ''
    mm = re.search(r'```mermaid\n(.*?)```', big, re.S)
    parts = []
    hb = d / 'handbook'
    if hb.exists():
        for pd in sorted(hb.iterdir(), key=lambda p: (_num(p.name), p.name)):
            if not pd.is_dir():
                continue
            if not PART_DIR.match(pd.name):
                problems.append((pd, 0, f'部分的資料夾名稱要是「數字-英文」，例如 2-manufacturing：{pd.name}'))
            pr = pd / 'README.md'
            ptitle = _h1(pr.read_text(encoding='utf-8')) if pr.exists() else ''
            if not ptitle:
                problems.append((pr, 0, '部分要有 README.md，第一行寫「# 部分名稱」'))
            part = Part(pd, _num(pd.name), ptitle or pd.name, [])
            for cf in sorted(pd.glob('*.md'), key=lambda p: (_num(p.name), p.name)):
                if cf.name == 'README.md':
                    continue
                if not CHAP_FILE.match(cf.name):
                    problems.append((cf, 0, f'章的檔名要是「兩位數字-英文.md」，例如 05-gate.md：{cf.name}'))
                ch = load_chapter(cf, problems)
                ch.part = part
                part.chapters.append(ch)
            parts.append(part)
    return KB(d.name, d, title, intro, maint, mm.group(1).strip() if mm else '', parts, problems)


def _num(name):
    m = re.match(r'^(\d+)', name)
    return int(m.group(1)) if m else 999


def load_chapter(path, problems, faq_head=FAQ_HEAD):
    """手冊的一章；簡報的章檔（deck/）也用這個讀，題目的標題是「## 自我檢查」。"""
    text = path.read_text(encoding='utf-8')
    lines = text.splitlines()
    title = _h1(text)
    if not title:
        problems.append((path, 1, '章的第一行要寫「# 章名」'))
    ov = re.search(r'^> 速覽[：:]\s*(.*(?:\n>.*)*)', text, re.M)
    overview = re.sub(r'\n>\s?', '', ov.group(1)).strip() if ov else ''
    sections, faqs = [], []
    cur = None
    in_faq = False
    in_code = False
    for i, l in enumerate(lines, 1):
        if l.startswith('```'):
            in_code = not in_code
        m = None if in_code else ANCHOR.match(l)
        if m:
            nxt = lines[i] if i < len(lines) else ''
            if not nxt.startswith('## '):
                problems.append((path, i, f'小節錨點「{m.group(1)}」的下一行要是「## 小節標題」'))
            cur = Section(m.group(1), nxt[3:].strip() if nxt.startswith('## ') else '', path, i, [l])
            sections.append(cur)
            in_faq = False
            continue
        if not in_code and l.strip() == faq_head:
            cur, in_faq = None, True
            continue
        if cur is not None:
            cur.lines.append(l)
    for s in sections:
        while s.lines and not s.lines[-1].strip():
            s.lines.pop()
    # 常見問題：<details><summary>題目</summary> … 相關：id、id </details>
    if faq_head in lines:
        start = lines.index(faq_head)
        q = None
        topic = ''
        for i in range(start + 1, len(lines)):
            l = lines[i]
            if l.startswith('### '):
                topic = l[4:].strip()
            sm = re.search(r'<summary>(.*?)</summary>', l)
            if sm:
                t = sm.group(1).strip()
                q = Faq(re.sub(r'^【深入】\s*', '', t), t.startswith('【深入】'), [], i + 1, topic)
                faqs.append(q)
            rm = REL.match(l)
            if rm and q is not None:
                for tok in re.split(r'[、,，\s]+', rm.group(1)):
                    tok = tok.strip()
                    if not tok:
                        continue
                    r = REF.match(tok)
                    if r:
                        q.rel.append((r.group(1), r.group(2), i + 1))
                    else:
                        problems.append((path, i + 1, f'「相關：」裡的「{tok}」不是小節 id'))
            if l.strip() == '</details>':
                if q is not None and not q.rel and faq_head == FAQ_HEAD:  # 簡報的自我檢查可以不指向任何一頁
                    problems.append((path, q.line, f'常見問題「{q.q}」沒有寫「相關：」指向任何小節'))
                q = None
    ch = Chapter(path, _num(path.name), title, overview, sections, faqs, text)
    for s in sections:
        s.chapter = ch
    return ch


def faq_block(ch, q):
    """一題常見問題的原文：從 <details> 到 </details>。"""
    lines = ch.text.splitlines()
    start = q.line - 1
    if start > 0 and lines[start - 1].strip() == '<details>':
        start -= 1
    end = next((i for i in range(q.line - 1, len(lines)) if lines[i].strip() == '</details>'), len(lines) - 1)
    return '\n'.join(lines[start:end + 1])


def faq_answer(ch, q):
    """一題常見問題的答案：<summary> 之後、「相關：」之前。"""
    body = []
    for l in faq_block(ch, q).splitlines()[1:]:
        if '<summary>' in l or l.strip() in ('<details>', '</details>') or REL.match(l):
            continue
        body.append(l)
    return '\n'.join(body).strip()


def chapter_body(ch):
    """章的內文，不含常見問題（讀者測試給外行讀者看的部分）。"""
    lines = ch.text.splitlines()
    if FAQ_HEAD in lines:
        lines = lines[:lines.index(FAQ_HEAD)]
    return '\n'.join(lines).rstrip() + '\n'


# ---------- 這次改了什麼 ----------

@dataclass
class Changes:
    chapters: list       # 內容有變的章（新的這一版）
    added: list          # [Section]
    modified: list       # [Section]
    deleted: list        # [Section]（舊的那一版）
    faq_added: list      # [(Chapter, Faq)]
    faq_changed: list
    faq_deleted: list
    terms_added: list    # terms.md 新增的列
    pages: list          # 頁序裡對應或指紋改過的簡報頁 id


def changes(old, new):
    """比較同一個知識庫的兩版（old 可以是 None，表示新的知識庫）。"""
    o_secs = {x.id: x for x in old.sections} if old else {}
    n_secs = {x.id: x for x in new.sections}
    o_chaps = {rel(c.file): c for c in old.chapters} if old else {}
    chapters = [c for c in new.chapters if rel(c.file) not in o_chaps or o_chaps[rel(c.file)].text != c.text]
    added = [x for i, x in n_secs.items() if i not in o_secs]
    modified = [x for i, x in n_secs.items() if i in o_secs and (o_secs[i].fp != x.fp or o_secs[i].title != x.title)]
    deleted = [x for i, x in o_secs.items() if i not in n_secs]

    def faqs(kb):
        return {(rel(c.file), q.q): (c, q, faq_block(c, q)) for c in kb.chapters for q in c.faqs} if kb else {}
    of, nf = faqs(old), faqs(new)
    faq_added = [(c, q) for k, (c, q, _) in nf.items() if k not in of]
    faq_changed = [(c, q) for k, (c, q, b) in nf.items() if k in of and of[k][2] != b]
    faq_deleted = [(c, q) for k, (c, q, _) in of.items() if k not in nf]

    def term_rows(kb):
        f = kb.dir / 'terms.md' if kb else None
        if not f or not f.exists():
            return []
        return [l for l in f.read_text(encoding='utf-8').splitlines() if l.startswith('|') and not set(l) <= set('|-: ')]
    o_terms = set(term_rows(old))
    terms_added = [l for l in term_rows(new)[1:] if l not in o_terms]

    def page_maps(kb):
        return {p.id: p.maps for p in load_order(kb).pages} if kb and kb.has_deck else {}
    op, np_ = page_maps(old), page_maps(new)
    pages = [i for i, m in np_.items() if op.get(i) != m]
    return Changes(chapters, added, modified, deleted, faq_added, faq_changed, faq_deleted, terms_added, pages)


def base_kb(name):
    """這個分支起點那一版的知識庫；起點還沒有這個知識庫時是 None。"""
    base = snapshot(base_ref(), 'base')
    return load_kb(base / name) if (base / name / 'README.md').exists() else None


# ---------- 頁序 ----------

@dataclass
class Page:
    id: str
    maps: list           # [(知識庫名稱或 None, 小節 id, 指紋或 None)]
    line: int


@dataclass
class Order:
    file: pathlib.Path
    settings: dict
    parts: dict
    chaps: list          # [(編號, 名稱, 第一頁 id)]
    groups: list         # [(場次名稱, [Page])]
    problems: list

    @property
    def pages(self):
        return [p for _, ps in self.groups for p in ps]


ORDER_FIXED = ('設定', '部分', '章節列')
PAGE_LINE = re.compile(r'^- ([A-Za-z0-9_-]+)(?:\s*→\s*(.+?))?\s*$')


def load_order(kb):
    f = kb.dir / 'deck/order.md'
    text = f.read_text(encoding='utf-8')
    settings, parts, chaps, groups, problems = {}, {}, [], [], []
    head = None
    for i, l in enumerate(text.splitlines(), 1):
        if l.startswith('## '):
            head = l[3:].strip()
            if head not in ORDER_FIXED:
                groups.append((head, []))
            continue
        if not l.startswith('- ') or head is None:
            continue
        if head == '設定':
            k, _, v = l[2:].partition('：')
            settings[k.strip()] = v.strip()
        elif head == '部分':
            k, _, v = l[2:].partition('：')
            if k.strip().isdigit():
                parts[int(k.strip())] = v.strip()
            else:
                problems.append((f, i, f'「部分」要寫成「- 編號：名稱」：{l}'))
        elif head == '章節列':
            m = re.match(r'^- (\d+)：(.+?)\s*→\s*([A-Za-z0-9_-]+)\s*$', l)
            if m:
                chaps.append((int(m.group(1)), m.group(2).strip(), m.group(3)))
            else:
                problems.append((f, i, f'「章節列」要寫成「- 編號：章名 → 第一頁 id」：{l}'))
        else:
            m = PAGE_LINE.match(l)
            if not m:
                problems.append((f, i, f'看不懂這一行，簡報頁要寫成「- 頁 id」或「- 頁 id → 小節@指紋, 小節@指紋」：{l}'))
                continue
            maps = []
            for tok in re.split(r'\s*[,，、]\s*', m.group(2) or ''):
                if not tok:
                    continue
                r = REF.match(tok.strip())
                if r:
                    maps.append((r.group(1), r.group(2), r.group(3)))
                else:
                    problems.append((f, i, f'「{tok}」要寫成「小節 id@指紋」'))
            groups[-1][1].append(Page(m.group(1), maps, i))
    return Order(f, settings, parts, chaps, groups, problems)


def update_fingerprints(kb, page_ids):
    """把頁序裡這些簡報頁的對應指紋，更新成小節現在的指紋。回傳更新了哪些。"""
    secs = section_index()
    f = kb.dir / 'deck/order.md'
    out, done = [], []
    for l in f.read_text(encoding='utf-8').splitlines():
        m = PAGE_LINE.match(l)
        if m and m.group(2) and m.group(1) in page_ids:
            toks = []
            for tok in re.split(r'\s*[,，、]\s*', m.group(2)):
                r = REF.match(tok.strip())
                if not r:
                    toks.append(tok)
                    continue
                kname, sid = r.group(1) or kb.name, r.group(2)
                s = secs.get((kname, sid))
                prefix = f'{r.group(1)}/' if r.group(1) else ''
                toks.append(f'{prefix}{sid}@{s.fp}' if s else tok)
            l = f'- {m.group(1)} → ' + ', '.join(toks)
            done.append(m.group(1))
        out.append(l)
    f.write_text('\n'.join(out) + '\n', encoding='utf-8')
    return done


def section_index():
    return {(k.name, s.id): s for k in all_kbs() for s in k.sections}


def slide_ids(kb):
    ids = set(load_deck(kb).md_pages) if kb.has_deck else set()
    for f in sorted((kb.dir / 'deck/slides').glob('*.js')):
        ids.update(re.findall(r"\bid:\s*'([A-Za-z0-9_-]+)'", f.read_text(encoding='utf-8')))
    return ids


# ---------- 簡報頁 ----------
# 新的簡報頁寫在 deck/<部分>/<章>.md：一頁一個「錨點＋## 標題」，底下是欄位；互動圖寫在 deck/figures/*.js。
# 舊的簡報頁寫在 deck/slides/*.js，文字和動畫混在一起；搬到 Markdown 之前，只抓得到標題、結論、講稿這些欄位。

CHECK_HEAD = '## 自我檢查'
DECK_META = {'短標題': 'short', '英文': 'en', '建議': 'minutes', '圖': 'fig', '標籤': 'badge', '資料': 'src'}
DECK_FIELD = re.compile(r'^(結論|重點|圖說|數字卡|比喻|旁白)(?:（([a-z]+)(?:｜([^）]+))?）)?[：:]\s*(.*)$')


@dataclass
class DeckPage:
    id: str
    title: str
    file: pathlib.Path
    line: int
    part: int = 0
    chap: int = 0        # 0：不屬於任何一章（部分的開場、總覽）
    short: str = ''
    en: str = ''
    minutes: float = 0
    fig: str = ''        # 互動圖名稱，或 assets/img/…、assets/video/…（後面可以接「｜說明」）
    badge: str = ''      # 標題旁的標籤，例如「新技術」
    src: str = ''        # 頁尾的「資料：」
    thesis: str = ''
    points: list = field(default_factory=list)
    captions: list = field(default_factory=list)   # 圖說：[(標題, 說明)]，樣板的每一步、每個零件
    fact: tuple = None       # (數字, 說明)
    analogy: tuple = None    # (圖示名稱, 文字, 卡片標題)
    notes: str = ''
    footnotes: dict = field(default_factory=dict)  # 註腳名稱 → 出處
    md: bool = True          # False：舊的程式頁

    @property
    def text(self):
        """這一頁的純文字：給搜尋、讀者測試用。"""
        parts = [self.title, self.thesis, *self.points, *('：'.join(c) for c in self.captions)]
        if self.fact:
            parts.append('：'.join(self.fact))
        if self.analogy:
            parts.append(self.analogy[1])
        parts.append(self.notes)
        return plain('\n'.join(p for p in parts if p))


def plain(text):
    """去掉 HTML 標籤、Markdown 粗體和註腳標號。"""
    text = re.sub(r'<[^>]+>', '', text)
    text = FOOTREF.sub('', text)
    return re.sub(r'\*\*(.+?)\*\*', r'\1', text).strip()


@dataclass
class DeckInfo:
    order: Order
    pages: list          # 照頁序排列的 [DeckPage]；頁序裡有、但找不到的頁不在這裡
    md_pages: dict       # 頁 id → DeckPage（只有 Markdown 頁）
    checks: dict         # (部分, 章) → [(Chapter, Faq)]：簡報章檔裡的自我檢查題目
    titles: dict         # (部分, 章) → 章檔的「# 標題」
    problems: list


def deck_files(kb):
    """deck/ 底下的章檔：deck/<數字-英文>/<兩位數字-英文>.md。"""
    d = kb.dir / 'deck'
    return sorted((f for f in d.glob('*/*.md') if PART_DIR.match(f.parent.name)),
                  key=lambda f: (_num(f.parent.name), _num(f.name), f.name))


def load_deck(kb):
    order = load_order(kb)
    problems = []
    md_pages, checks, titles = {}, {}, {}
    for f in deck_files(kb):
        if not CHAP_FILE.match(f.name):
            problems.append((f, 0, f'簡報的章檔名稱要是「兩位數字-英文.md」，例如 05-gate.md；部分的開場用 00：{f.name}'))
        key = (_num(f.parent.name), _num(f.name))
        ch = load_chapter(f, problems, CHECK_HEAD)
        titles[key] = ch.title
        if ch.faqs:
            checks[key] = [(ch, q) for q in ch.faqs]
        for s in ch.sections:
            if s.id in md_pages:
                o = md_pages[s.id]
                problems.append((f, s.line, f'簡報頁 id「{s.id}」重複，{rel(o.file)}:{o.line} 已經用過'))
                continue
            md_pages[s.id] = _deck_page(s, key, problems)
    legacy = _legacy_pages(kb, {p.id for p in order.pages} - set(md_pages))
    pages = []
    for p in order.pages:
        page = md_pages.get(p.id) or legacy.get(p.id)
        if page:
            pages.append(page)
    return DeckInfo(order, pages, md_pages, checks, titles, problems)


def _deck_page(s, key, problems):
    p = DeckPage(s.id, s.title, s.file, s.line, key[0], key[1])
    mode, meta = None, True
    notes = []
    for k, l in enumerate(s.lines[2:], s.line + 2):
        fm = FOOTDEF.match(l)
        if fm:
            p.footnotes[fm.group(1)] = fm.group(2).strip()
            mode = 'fn'
            continue
        if mode == '旁白':  # 旁白是最後一個欄位：之後到註腳之前都是旁白
            notes.append(l.rstrip())
            continue
        mm = re.match(r'^- (\S+?)[：:]\s*(.*?)\s*$', l)
        if meta and mm and mm.group(1) in DECK_META:
            key_, v = DECK_META[mm.group(1)], mm.group(2)
            if key_ == 'minutes':
                n = re.search(r'\d+(?:\.\d+)?', v)
                v = float(n.group(0)) if n else 0
            setattr(p, key_, v)
            continue
        fm2 = DECK_FIELD.match(l)
        if fm2:
            meta = False
            name, icon, atitle, rest = fm2.groups()
            mode = name
            if name == '結論':
                p.thesis = rest
            elif name == '數字卡':
                v, _, d = rest.partition('｜')
                p.fact = (v.strip(), d.strip())
                mode = None
            elif name == '比喻':
                p.analogy = (icon or 'chip', rest, atitle or '比喻')
            elif name == '旁白' and rest:
                notes.append(rest)
            continue
        if not l.strip():
            if mode in ('結論', '比喻', '重點', '圖說'):
                mode = None
            continue
        if mode == '重點' and l.startswith('- '):
            p.points.append(l[2:].strip())
        elif mode == '圖說' and l.startswith('- '):
            t, _, d = l[2:].strip().partition('：')
            p.captions.append((t.strip(), d.strip()))
        elif mode == '結論':
            p.thesis += l.strip()
        elif mode == '比喻':
            p.analogy = (p.analogy[0], p.analogy[1] + l.strip(), p.analogy[2])
        else:
            problems.append((s.file, k, f'簡報頁「{s.id}」看不懂這一行，欄位要寫成「結論：」「重點：」「圖說：」「數字卡：」「比喻：」「旁白：」：{l[:40]}'))
    p.notes = re.sub(r'\n{3,}', '\n\n', '\n'.join(notes)).strip()
    return p


def _legacy_pages(kb, wanted):
    """舊的程式頁：從原始碼抓 id、部分、章、建議分鐘、標題、短標題、結論、講稿。只看頁序裡有的頁。"""
    out = {}
    esc = {'n': '\n', 't': '\t'}

    def field_(block, name):
        m = re.search(rf"\b{name}:\s*(?:'((?:[^'\\]|\\.)*)'|`((?:[^`\\]|\\.)*)`)", block)
        if not m:
            return ''
        raw = m.group(1) if m.group(1) is not None else m.group(2)
        return re.sub(r'\\(.)', lambda e: esc.get(e.group(1), e.group(1)), raw)

    def num(text, name):
        m = re.search(rf'\b{name}:\s*(\d+(?:\.\d+)?)', text or '')
        return float(m.group(1)) if m else None

    for f in sorted((kb.dir / 'deck/slides').glob('*.js')):
        src = f.read_text(encoding='utf-8')
        # 只用頁序裡的頁切段：render 裡的資料也可能寫 id: '…'
        starts = [m for m in re.finditer(r"\bid:\s*'([A-Za-z0-9_-]+)'", src) if m.group(1) in wanted]
        for i, m in enumerate(starts):
            sid = m.group(1)
            block = src[m.start(): starts[i + 1].start() if i + 1 < len(starts) else len(src)]
            if sid in out or 'title:' not in block:
                continue
            # Object.assign({ … }, F, { chap: 4 })：後面的物件蓋過前面的，部分和章也可能寫在共用的 F 裡
            ends = list(re.finditer(r'\}\s*,\s*(\w+)\s*(?:,\s*\{([^}]*)\})?\s*\)\s*\)\s*;', block))
            a = ends[-1] if ends else None  # 註冊的結尾是這一段最後一個「}, F));」
            d = a and re.search(rf'\b{a.group(1)}\s*=\s*\{{([^}}]*)\}}', src)
            layers = [a.group(2) if a else '', d.group(1) if d else '', block[:400]]

            def pick(name):
                return next((v for v in (num(t, name) for t in layers) if v is not None), None)
            line = src.count('\n', 0, m.start()) + 1
            out[sid] = DeckPage(sid, plain(field_(block, 'title')), f, line, int(pick('part') or 0), int(pick('chap') or 0),
                                short=plain(field_(block, 'short')), en=field_(block, 'en'),
                                minutes=pick('minutes') or 0, thesis=field_(block, 'thesis'),
                                notes=field_(block, 'notes'), md=False)
    return out


# ---------- 圖片清單 ----------

def load_sources(kb):
    """assets/SOURCES.md 的表格：檔名 → (說明, 出處)。"""
    f = kb.dir / 'assets/SOURCES.md'
    rows = {}
    if not f.exists():
        return rows
    for l in f.read_text(encoding='utf-8').splitlines():
        c = [x.strip() for x in l.strip().strip('|').split('|')]
        if l.startswith('|') and len(c) >= 3 and c[0] not in ('檔名', '') and not set(c[0]) <= set('-: '):
            rows[c[0].strip('`')] = (c[1], c[2])
    return rows


# ---------- 入口網站的角色路徑 ----------

PATHS = ROOT / 'framework/paths.md'


def load_paths():
    """framework/paths.md 的角色路徑：[{name, intro, steps: [[知識庫, 頁 id, 說明, 行號]]}]（HTML 註解裡的範例不算）。"""
    if not PATHS.exists():
        return []
    text = re.sub(r'<!--.*?-->', lambda m: '\n' * m.group(0).count('\n'), PATHS.read_text(encoding='utf-8'), flags=re.S)
    roles = []
    for i, l in enumerate(text.splitlines(), 1):
        if l.startswith('## '):
            roles.append({'name': l[3:].strip(), 'intro': '', 'steps': []})
        elif roles and l.startswith('- '):
            m = re.match(r'^- ([a-z0-9-]+)/([A-Za-z0-9_-]+)\s*(?:[：:]\s*(.*))?$', l.strip())
            roles[-1]['steps'].append([m.group(1), m.group(2), (m.group(3) or '').strip(), i] if m else [None, l, '', i])
        elif roles and l.strip() and not roles[-1]['steps']:
            roles[-1]['intro'] = (roles[-1]['intro'] + ' ' + l.strip()).strip()
    return roles


# ---------- 首頁的知識庫清單 ----------

KB_LIST_START = '<!-- 知識庫清單：由 build.py --readme 產生，請勿手改 -->'
KB_LIST_END = '<!-- 知識庫清單結束 -->'


def download_url(kbname, kind):
    return release_url(f'{kbname}-{kind}.html')


def release_url(fname):
    """最新發布裡某個檔案的下載網址；手動模式（沒有 Git 主機）是 None。"""
    host, repo = CONFIG.get('host'), CONFIG.get('repo', '')
    if host == 'github':
        return f'https://github.com/{repo}/releases/latest/download/{fname}'
    if host == 'gitlab':
        base = CONFIG.get('gitlab_url', 'https://gitlab.com')
        return f'{base}/{repo}/-/releases/permalink/latest/downloads/{fname}'
    return None


def kb_list_block():
    portal = release_url('portal.zip')
    head = (f'**入口網站**：[下載 portal.zip]({portal})，解開後用 Chrome 或 Edge 打開裡面的 index.html。所有知識庫的簡報、手冊網站、學習路徑和搜尋都在裡面。'
            if portal else '**入口網站**：請 Agent 建置，或執行 `python3 framework/tools/get.py portal --open`。')
    rows = [head, '', '| 知識庫 | 介紹 | 維護者 | 簡報 | 單一檔案 |', '|---|---|---|---|---|']
    for k in all_kbs():
        who = '、'.join(n for n, _ in k.maintainers) or '（還沒有）'
        links = []
        if download_url(k.name, 'handbook'):
            links.append(f'[手冊網站]({download_url(k.name, "handbook")})')
            if k.has_deck:
                links.append(f'[簡報]({download_url(k.name, "deck")})')
        dl = '・'.join(links) or '請 Agent 現場建置'
        rows.append(f'| [{k.title}](kb/{k.name}/) | {k.intro} | {who} | {"有" if k.has_deck else "還沒有"} | {dl} |')
    return '\n'.join([KB_LIST_START, *rows, KB_LIST_END])


def readme_with_kb_list(text):
    block = kb_list_block()
    if KB_LIST_START in text and KB_LIST_END in text:
        a = text.index(KB_LIST_START)
        b = text.index(KB_LIST_END) + len(KB_LIST_END)
        return text[:a] + block + text[b:]
    return text.rstrip('\n') + '\n\n' + block + '\n'
