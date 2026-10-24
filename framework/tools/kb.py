"""知識庫的共用解析：知識庫、部分、章、小節、常見問題、頁序、圖片清單。

check.py、build.py、index.py 都用這裡的函式讀檔案。只用 Python 標準函式庫。
"""
import hashlib
import json
import pathlib
import re
from dataclasses import dataclass, field

ROOT = pathlib.Path(__file__).resolve().parents[2]
KB_DIR = ROOT / 'kb'
CONFIG = json.loads((ROOT / 'framework/config.json').read_text(encoding='utf-8'))

ANCHOR = re.compile(r'^<a name="([^"]*)"></a>\s*$')
ID_OK = re.compile(r'^[a-z][a-z0-9]*$')
PART_DIR = re.compile(r'^(\d+)-[a-z0-9-]+$')
CHAP_FILE = re.compile(r'^(\d+)-[a-z0-9-]+\.md$')
FOOTREF = re.compile(r'\[\^([^\]\s]+)\](?!:)')
FOOTDEF = re.compile(r'^\[\^([^\]\s]+)\]:\s*(.*)$')
IMG = re.compile(r'assets/(img/[\w.-]+\.(?:jpe?g|png|gif|svg|webp))')
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
    return str(pathlib.Path(path).resolve().relative_to(ROOT))


def all_kbs():
    return [load_kb(d) for d in sorted(KB_DIR.iterdir()) if (d / 'README.md').exists()]


def find_kb(arg):
    name = pathlib.Path(arg).name
    d = KB_DIR / name
    if not (d / 'README.md').exists():
        raise SystemExit(f'找不到知識庫「{arg}」：kb/{name}/README.md 不存在')
    return load_kb(d)


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
    maint = []
    blk = _block(readme, '維護者')
    for l in (blk or '').splitlines():
        m = re.match(r'^\s*[-*]\s+(.+?)\s*$', l)
        if not m:
            continue
        h = re.search(r'(?:GitHub|GitLab)[:：]\s*@?([\w-]+)', m.group(1))
        name = re.sub(r'[（(].*?[)）]', '', m.group(1)).strip()
        maint.append((name, h.group(1) if h else None))
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


def load_chapter(path, problems):
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
        if not in_code and l.strip() == FAQ_HEAD:
            cur, in_faq = None, True
            continue
        if cur is not None:
            cur.lines.append(l)
    for s in sections:
        while s.lines and not s.lines[-1].strip():
            s.lines.pop()
    # 常見問題：<details><summary>題目</summary> … 相關：id、id </details>
    if FAQ_HEAD in lines:
        start = lines.index(FAQ_HEAD)
        q = None
        for i in range(start + 1, len(lines)):
            l = lines[i]
            sm = re.search(r'<summary>(.*?)</summary>', l)
            if sm:
                t = sm.group(1).strip()
                q = Faq(re.sub(r'^【深入】\s*', '', t), t.startswith('【深入】'), [], i + 1)
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
                if q is not None and not q.rel:
                    problems.append((path, q.line, f'常見問題「{q.q}」沒有寫「相關：」指向任何小節'))
                q = None
    ch = Chapter(path, _num(path.name), title, overview, sections, faqs, text)
    for s in sections:
        s.chapter = ch
    return ch


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
    ids = set()
    for f in sorted((kb.dir / 'deck/slides').glob('*.js')):
        ids.update(re.findall(r"\bid:\s*'([A-Za-z0-9_-]+)'", f.read_text(encoding='utf-8')))
    return ids


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


# ---------- 首頁的知識庫清單 ----------

KB_LIST_START = '<!-- 知識庫清單：由 build.py --readme 產生，請勿手改 -->'
KB_LIST_END = '<!-- 知識庫清單結束 -->'


def download_url(kbname, kind):
    host, repo = CONFIG.get('host'), CONFIG.get('repo', '')
    fname = f'{kbname}-{kind}.html'
    if host == 'github':
        return f'https://github.com/{repo}/releases/latest/download/{fname}'
    if host == 'gitlab':
        base = CONFIG.get('gitlab_url', 'https://gitlab.com')
        return f'{base}/{repo}/-/releases/permalink/latest/downloads/{fname}'
    return None


def kb_list_block():
    rows = ['| 知識庫 | 介紹 | 維護者 | 簡報 | 下載 |', '|---|---|---|---|---|']
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
