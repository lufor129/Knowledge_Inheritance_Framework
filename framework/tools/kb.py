"""知識庫的共用解析：知識庫、簡報的章檔和頁、自我檢查、頁序、術語、圖片清單。

framework/tools/ 的工具都用這裡的函式讀檔案。只用 Python 標準函式庫。
"""
import hashlib
import io
import json
import os
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
SNAP = ROOT / '.kif/snapshot'        # 某一版知識庫的快照（正式內容、分支的起點）

ANCHOR = re.compile(r'^<a name="([^"]*)"></a>\s*$')
ID_OK = re.compile(r'^[a-z][a-z0-9]*$')
PART_DIR = re.compile(r'^(\d+)-[a-z0-9-]+$')
CHAP_FILE = re.compile(r'^(\d+)-[a-z0-9-]+\.md$')
FOOTREF = re.compile(r'\[\^([^\]\s]+)\](?!:)')
FOOTDEF = re.compile(r'^\[\^([^\]\s]+)\]:\s*(.*)$')
IMG = re.compile(r'assets/(img/[\w.-]+\.(?:jpe?g|png|gif|svg|webp)|video/[\w.-]+\.(?:mp4|webm))')
REL = re.compile(r'^\s*相關[：:]\s*(.+?)\s*$')
REF = re.compile(r'^(?:([a-z0-9-]+)/)?([A-Za-z0-9_-]+)$')   # 「相關：」的一個頁 id（別的知識庫寫成 知識庫/頁id）
CHECK_HEAD = '## 自我檢查'


@dataclass
class Section:
    """章檔裡一個「錨點＋## 標題」的區塊，也就是一頁簡報頁的原文。"""
    id: str
    title: str
    file: pathlib.Path
    line: int            # 錨點所在的行（從 1 起算）
    lines: list          # 原文，從錨點到下一個錨點或「## 自我檢查」之前
    chapter: 'Chapter' = None

    @property
    def fp(self):
        return fingerprint('\n'.join(self.lines))


@dataclass
class Faq:
    """自我檢查的一題。"""
    q: str
    deep: bool
    rel: list            # 「相關：」：[(知識庫名稱或 None, 頁 id, 行號)]
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
class KB:
    name: str
    dir: pathlib.Path
    title: str
    intro: str
    maintainers: list    # [(名字, 帳號或 None)]
    problems: list = field(default_factory=list)   # 解析時就發現的結構錯誤 [(檔案, 行, 訊息)]

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

SNAP_FILES = re.compile(r'^kb/[^/]+/(?:README\.md|terms\.md|deck/order\.md|deck/\d+-[^/]+/[^/]+\.md)$')


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


def base_ref(fetch=True):
    """這個分支是從正式內容的哪一版開出來的（比較「這次改了什麼」用）。fetch=False 不先抓遠端（檢查程式每次改都跑，要快）。"""
    if os.environ.get('KIF_BASE'):  # 提案疊在另一個還沒合併的提案上，或測試時，指定比較的起點
        return git('rev-parse', os.environ['KIF_BASE'])
    return git('merge-base', main_ref(fetch), 'HEAD')


def snapshot(ref, name):
    """把 ref 那一版的知識庫（各知識庫的 README、terms、頁序、簡報章檔）放到 .kif/snapshot/<name>/kb/。

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
    if (d / 'handbook').exists():  # 手冊已經拿掉（ADR-0007）：內容要搬成簡報頁或深入頁
        problems.append((d / 'handbook', 0, '知識庫不再有手冊（ADR-0007）：handbook/ 的內容要搬成簡報頁或深入頁（framework/guide/deck.md），再刪掉這個資料夾'))
    return KB(d.name, d, title, intro, maint, problems)


def _num(name):
    m = re.match(r'^(\d+)', name)
    return int(m.group(1)) if m else 999


def load_chapter(path, problems, faq_head=CHECK_HEAD):
    """簡報的一個章檔（deck/<部分>/<章>.md）：每一頁的原文，和「## 自我檢查」的題目。"""
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
                problems.append((path, i, f'頁的錨點「{m.group(1)}」的下一行要是「## 頁標題」'))
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
    # 自我檢查：<details><summary>題目</summary> … 相關：頁id、頁id </details>
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
                        problems.append((path, i + 1, f'「相關：」裡的「{tok}」不是頁 id'))
            if l.strip() == '</details>':
                q = None
    ch = Chapter(path, _num(path.name), title, overview, sections, faqs, text)
    for s in sections:
        s.chapter = ch
    return ch


def faq_block(ch, q):
    """一題自我檢查的原文：從 <details> 到 </details>。"""
    lines = ch.text.splitlines()
    start = q.line - 1
    if start > 0 and lines[start - 1].strip() == '<details>':
        start -= 1
    end = next((i for i in range(q.line - 1, len(lines)) if lines[i].strip() == '</details>'), len(lines) - 1)
    return '\n'.join(lines[start:end + 1])


def faq_answer(ch, q):
    """一題自我檢查的答案：<summary> 之後、「相關：」之前。"""
    body = []
    for l in faq_block(ch, q).splitlines()[1:]:
        if '<summary>' in l or l.strip() in ('<details>', '</details>') or REL.match(l):
            continue
        body.append(l)
    return '\n'.join(body).strip()


# ---------- 這次改了什麼 ----------

@dataclass
class Changes:
    terms_added: list    # terms.md 新增的列
    deck_added: list = field(default_factory=list)      # [DeckPage]
    deck_modified: list = field(default_factory=list)
    deck_deleted: list = field(default_factory=list)    # [DeckPage]（舊的那一版）
    deck_chapters: list = field(default_factory=list)   # 簡報頁或自我檢查有變的章檔（新的這一版的路徑）


def changes(old, new):
    """比較同一個知識庫的兩版（old 可以是 None，表示新的知識庫）。"""
    def term_rows(kb):
        f = kb.dir / 'terms.md' if kb else None
        if not f or not f.exists():
            return []
        return [l for l in f.read_text(encoding='utf-8').splitlines() if l.startswith('|') and not set(l) <= set('|-: ')]
    o_terms = set(term_rows(old))
    terms_added = [l for l in term_rows(new)[1:] if l not in o_terms]
    od = load_deck(old).md_pages if old and old.has_deck else {}
    nd = load_deck(new).md_pages if new.has_deck else {}
    d_added = [p for i, p in nd.items() if i not in od]
    d_mod = [p for i, p in nd.items() if i in od and od[i].fp != p.fp]
    d_del = [p for i, p in od.items() if i not in nd]

    def pages_part(f):  # 只比第一頁之後：章檔開頭的速覽、先修改了，不算簡報頁或自我檢查有變
        text = f.read_text(encoding='utf-8')
        m = re.search(r'^<a name="', text, re.M)
        return text[m.start():] if m else ''
    o_files = {rel(f): pages_part(f) for f in deck_files(old)} if old and old.has_deck else {}
    d_chaps = [f for f in deck_files(new) if o_files.get(rel(f)) != pages_part(f)] if new.has_deck else []
    return Changes(terms_added, d_added, d_mod, d_del, d_chaps)


def base_kb(name, fetch=True):
    """這個分支起點那一版的知識庫；起點還沒有這個知識庫時是 None。"""
    base = snapshot(base_ref(fetch), 'base')
    return load_kb(base / name) if (base / name / 'README.md').exists() else None


# ---------- 頁序 ----------

@dataclass
class Page:
    id: str
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
PAGE_LINE = re.compile(r'^- ([A-Za-z0-9_-]+)\s*$')


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
                problems.append((f, i, f'看不懂這一行，頁序裡的簡報頁寫成「- 頁 id」：{l}'))
                continue
            groups[-1][1].append(Page(m.group(1), i))
    return Order(f, settings, parts, chaps, groups, problems)


def slide_ids(kb):
    ids = set(load_deck(kb).md_pages) if kb.has_deck else set()
    for f in sorted((kb.dir / 'deck/slides').glob('*.js')):
        ids.update(re.findall(r"\bid:\s*'([A-Za-z0-9_-]+)'", f.read_text(encoding='utf-8')))
    return ids


# ---------- 簡報頁 ----------
# 新的簡報頁寫在 deck/<部分>/<章>.md：一頁一個「錨點＋## 標題」，底下是欄位；互動圖寫在 deck/figures/*.js。
# 深入頁也是簡報頁：寫「- 深入：<主頁 id>」，接在主頁後面，長說明寫在「說明：」。
# 章檔開頭（「# 章名」到第一頁之前）寫「- 速覽：」和「- 先修：」，入口網站的學習路徑和全景圖用。
# 舊的簡報頁寫在 deck/slides/*.js，文字和動畫混在一起；搬到 Markdown 之前，只抓得到標題、結論、講稿這些欄位。

DECK_META = {'短標題': 'short', '英文': 'en', '建議': 'minutes', '圖': 'fig', '標籤': 'badge', '資料': 'src', '深入': 'deep'}
DECK_FIELD = re.compile(r'^(結論|重點|圖說|數字卡|比喻|說明|旁白)(?:（([a-z]+)(?:｜([^）]+))?）)?[：:]\s*(.*)$')
SAME_FIG, TABLE_FIG = '同主頁', '表格'   # 深入頁的「圖：」可以沿用主頁的圖，或把說明裡的第一個表格當圖


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
    fig: str = ''        # 互動圖名稱，或 assets/img/…、assets/video/…（後面可以接「｜說明」）；深入頁還可以寫「同主頁」「表格」
    badge: str = ''      # 標題旁的標籤，例如「新技術」
    src: str = ''        # 頁尾的「資料：」
    thesis: str = ''
    points: list = field(default_factory=list)
    captions: list = field(default_factory=list)   # 圖說：[(標題, 說明)]，樣板的每一步、每個零件
    fact: tuple = None       # (數字, 說明)
    analogy: tuple = None    # (圖示名稱, 文字, 卡片標題)
    notes: str = ''
    deep: str = ''           # 深入頁：接在哪一頁後面（主頁 id）；一般的頁是空的
    body: str = ''           # 深入頁的「說明：」，Markdown（段落、### 小標題、清單、表格、註腳）
    footnotes: dict = field(default_factory=dict)  # 註腳名稱 → 出處
    lines: list = field(default_factory=list)      # 原文：從錨點到下一頁之前
    md: bool = True          # False：舊的程式頁

    @property
    def fp(self):
        return fingerprint('\n'.join(self.lines))

    @property
    def text(self):
        """這一頁的純文字：給搜尋、讀者測試用。"""
        parts = [self.title, self.thesis, *self.points, *('：'.join(c) for c in self.captions)]
        if self.fact:
            parts.append('：'.join(self.fact))
        if self.analogy:
            parts.append(self.analogy[1])
        parts += [self.body, self.notes]
        return plain('\n'.join(p for p in parts if p))


def plain(text):
    """去掉 HTML 標籤、Markdown 粗體、註腳標號和頁碼引用。"""
    text = re.sub(r'<[^>]+>', '', text)
    text = FOOTREF.sub('', text)
    text = re.sub(r'\[\[頁:[^\]]+\]\]', '另一頁', text)
    return re.sub(r'\*\*(.+?)\*\*', r'\1', text).strip()


def deck_page_text(p):
    """簡報頁給讀者看的文字：標題、結論、重點、圖說、數字卡、比喻、旁白（讀者測試的題目卷用）。"""
    out = [f'## {plain(p.title)}']
    if p.thesis:
        out.append(plain(p.thesis))
    out += [f'- {plain(x)}' for x in p.points] + [f'- {plain(t)}：{plain(d)}' for t, d in p.captions]
    if p.fact:
        out.append(f'{plain(p.fact[0])}：{plain(p.fact[1])}')
    if p.analogy:
        out.append(f'比喻：{plain(p.analogy[1])}')
    if p.body:
        out += ['', '說明：', plain(p.body)]
    if p.notes:
        out += ['', '講解：', plain(p.notes)]
    return '\n'.join(out)


@dataclass
class DeckChapter:
    file: pathlib.Path
    title: str           # 「# 章名」
    overview: str = ''   # 「- 速覽：」
    pre: list = field(default_factory=list)   # 「- 先修：」：[(知識庫名稱或 None, 章名, 行號)]


@dataclass
class DeckInfo:
    order: Order
    pages: list          # 照頁序排列的 [DeckPage]；頁序裡有、但找不到的頁不在這裡
    md_pages: dict       # 頁 id → DeckPage（只有 Markdown 頁）
    checks: dict         # (部分, 章) → [(Chapter, Faq)]：簡報章檔裡的自我檢查題目
    titles: dict         # (部分, 章) → 章檔的「# 標題」
    problems: list
    chapters: dict = field(default_factory=dict)   # (部分, 章) → DeckChapter


def deck_files(kb):
    """deck/ 底下的章檔：deck/<數字-英文>/<兩位數字-英文>.md。"""
    d = kb.dir / 'deck'
    return sorted((f for f in d.glob('*/*.md') if PART_DIR.match(f.parent.name)),
                  key=lambda f: (_num(f.parent.name), _num(f.name), f.name))


def load_deck(kb):
    order = load_order(kb)
    problems = []
    md_pages, checks, titles, chapters = {}, {}, {}, {}
    for f in deck_files(kb):
        if not CHAP_FILE.match(f.name):
            problems.append((f, 0, f'簡報的章檔名稱要是「兩位數字-英文.md」，例如 05-gate.md；部分的開場用 00：{f.name}'))
        key = (_num(f.parent.name), _num(f.name))
        ch = load_chapter(f, problems, CHECK_HEAD)
        titles[key] = ch.title
        chapters[key] = _deck_head(f, ch, problems)
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
    return DeckInfo(order, pages, md_pages, checks, titles, problems, chapters)


@dataclass
class Term:
    zh: str
    en: str
    desc: str
    first: str           # 「第一次出現」：頁 id；還沒有頁的術語寫「（待補）」或空著
    line: int


def load_terms(kb):
    """術語表 terms.md 的每一列（跳過表頭和分隔線）。"""
    f = kb.dir / 'terms.md'
    out = []
    for i, l in enumerate(f.read_text(encoding='utf-8').splitlines() if f.exists() else [], 1):
        c = [x.strip() for x in l.strip().strip('|').split('|')]
        if l.startswith('|') and c[0] and c[0] != '中文' and not set(l) <= set('|-: '):
            c += [''] * (4 - len(c))
            out.append(Term(c[0], c[1], c[2], c[3], i))
    return out


def term_patterns(t):
    """比對術語用的寫法：中文、英文全名（不分大小寫），和括號裡的縮寫（前後不能接英文字母）。"""
    pats = [re.escape(t.zh)]
    full, _, abbr = t.en.partition('(')
    if full.strip():
        pats.append('(?i:' + re.escape(full.strip()) + ')')
    abbr = abbr.rstrip(') ').strip()
    if abbr:
        pats.append(rf'(?<![A-Za-z]){re.escape(abbr)}(?![A-Za-z])')
    return re.compile('|'.join(pats))


PRE_REF = re.compile(r'^(?:([a-z0-9-]+)\s*›\s*)?(.+)$')


def _deck_head(f, ch, problems):
    """章檔開頭的「- 速覽：」（可以換行，下一行縮排兩格接著寫）和「- 先修：章名、章名」；別的知識庫的章寫成「cv › 影像分類」。"""
    out, cur = DeckChapter(f, ch.title), None
    ov = []
    for i, l in enumerate(ch.text.splitlines(), 1):
        if ANCHOR.match(l):
            break
        m = re.match(r'^- (速覽|先修)[：:]\s*(.*?)\s*$', l)
        if m:
            cur = m.group(1)
            if cur == '速覽':
                ov.append(m.group(2))
            else:
                for tok in (t.strip() for t in re.split(r'[、,，]', m.group(2))):
                    if tok:
                        r = PRE_REF.match(tok)
                        out.pre.append((r.group(1), r.group(2).strip(), i))
            continue
        if cur == '速覽' and l.startswith('  ') and l.strip():
            ov.append(l.strip())
            continue
        cur = None
    out.overview = ''.join(ov).strip()
    return out


def chapter_names(deck):
    """這份簡報裡可以當先修的章名（比對用）：章檔的「# 章名」、頁序的部分名稱和章節列的章名。"""
    names = list(deck.titles.values()) + list(deck.order.parts.values()) + [n for _, n, _ in deck.order.chaps]
    return {chapter_name(x) for x in names if x}


def chapter_name(name):
    """比對先修用的章名：拿掉開頭的圈號（①）和「第一部分 · 」。"""
    return re.sub(r'^(?:[①-⑳]\s*|第.+?部分\s*·\s*)', '', name.strip()).strip()


def _deck_page(s, key, problems):
    p = DeckPage(s.id, s.title, s.file, s.line, key[0], key[1], lines=s.lines)
    mode, meta = None, True
    notes, body = [], []
    for k, l in enumerate(s.lines[2:], s.line + 2):
        fm = FOOTDEF.match(l)
        if fm:
            p.footnotes[fm.group(1)] = fm.group(2).strip()
            mode = 'fn'
            continue
        if mode == '說明' and not re.match(r'^旁白[：:]', l):  # 說明到「旁白：」或註腳之前，原文照收（Markdown）
            body.append(l.rstrip())
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
            elif name in ('旁白', '說明') and rest:
                (notes if name == '旁白' else body).append(rest)
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
            problems.append((s.file, k, f'簡報頁「{s.id}」看不懂這一行，欄位要寫成「結論：」「重點：」「圖說：」「數字卡：」「比喻：」「說明：」「旁白：」：{l[:40]}'))
    p.notes = re.sub(r'\n{3,}', '\n\n', '\n'.join(notes)).strip()
    p.body = re.sub(r'\n{3,}', '\n\n', '\n'.join(body)).strip()
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
    head = (f'**入口網站**：[下載 portal.zip]({portal})，解開後用 Chrome 或 Edge 打開裡面的 index.html。所有知識庫的簡報、全景圖、學習路徑、主題索引和搜尋都在裡面。'
            if portal else '**入口網站**：請 Agent 建置，或執行 `python3 framework/tools/get.py portal --open`。')
    rows = [head, '', '| 知識庫 | 介紹 | 維護者 | 簡報 | 單一檔案 |', '|---|---|---|---|---|']
    for k in all_kbs():
        who = '、'.join(n for n, _ in k.maintainers) or '（還沒有）'
        pages = k.has_deck and bool(load_deck(k).pages)   # 剛建好骨架、還沒有頁的簡報不建置，也不列連結
        url = download_url(k.name, 'deck')
        dl = (f'[簡報]({url})' if pages else '還沒有') if url else '請 Agent 現場建置'
        rows.append(f'| [{k.title}](kb/{k.name}/) | {k.intro} | {who} | {"有" if pages else "還沒有"} | {dl} |')
    return '\n'.join([KB_LIST_START, *rows, KB_LIST_END])


def readme_with_kb_list(text):
    block = kb_list_block()
    if KB_LIST_START in text and KB_LIST_END in text:
        a = text.index(KB_LIST_START)
        b = text.index(KB_LIST_END) + len(KB_LIST_END)
        return text[:a] + block + text[b:]
    return text.rstrip('\n') + '\n\n' + block + '\n'
