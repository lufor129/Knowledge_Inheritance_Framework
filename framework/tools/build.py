"""建置：把每個知識庫的簡報做成離線能開的單一 HTML 檔，再全部放進入口網站。

用法：
  python3 framework/tools/build.py                    建置全部知識庫
  python3 framework/tools/build.py semiconductor      只建置一個（寫 kb/semiconductor 也可以）
  python3 framework/tools/build.py --readme           更新首頁 README 的知識庫清單
  python3 framework/tools/build.py --portal <資料夾>  建置入口網站：<資料夾>/index.html，每個知識庫的簡報在 <資料夾>/<名稱>/deck.html
  python3 framework/tools/build.py --release-dir out  建置全部，放到 out/（CI 發布用）：每個知識庫的單一檔案，和入口網站的壓縮檔 portal.zip

產出：kb/<名稱>/dist/deck.html（簡報還沒有頁的知識庫先不建）。
"""
import base64
import datetime
import html
import json
import re
import shutil
import pathlib
import sys
import zipfile

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import kb as K  # noqa: E402

ENGINE = K.ROOT / 'framework/engine'
FONTS = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&family=Source+Serif+4:ital@1&display=swap">'
MIME = {'.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.webp': 'image/webp',
        '.mp4': 'video/mp4', '.webm': 'video/webm'}
CIRC = '①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳'


def read(p):
    return p.read_text(encoding='utf-8')


def script(code):
    return '<script>' + code.replace('</script', '<\\/script') + '</script>'


def inline_images(kb, text):
    """把 assets/img/xxx、assets/video/xxx 換成 data URI，單一檔案才能離線顯示圖片、播放影片。"""
    def uri(m):
        f = kb.dir / 'assets' / m.group(1)
        if not f.exists():
            return m.group(0)
        return f'data:{MIME[f.suffix.lower()]};base64,' + base64.b64encode(f.read_bytes()).decode()
    return re.sub(r'(?:\.\./)*' + K.IMG.pattern, uri, text)


def page(title, head, body):
    return (f'<!doctype html>\n<html lang="zh-Hant">\n<head>\n<meta charset="utf-8">\n'
            f'<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
            f'<title>{title}</title>\n{FONTS}\n{head}\n</head>\n<body>\n{body}\n</body>\n</html>\n')


def inline(text, fns=None):
    """簡報頁的行內寫法轉成 HTML：**粗體**、`程式`、[文字](網址)、[文字](#頁id)（跳到那一頁）、[^註腳]。也可以直接寫 HTML。
    fns 是 {註腳名稱: 編號}，照第一次出現的順序編號；不給就拿掉註腳標號。"""
    text = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', text)
    text = re.sub(r'`([^`]+)`', r'<code>\1</code>', text)
    text = re.sub(r'\[([^\]^][^\]]*)\]\((https?://[^)\s]+)\)', r'<a href="\2" target="_blank" rel="noopener">\1</a>', text)
    text = re.sub(r'\[([^\]^][^\]]*)\]\(#([A-Za-z0-9_-]+)\)', r'<a href="#\2" class="go">\1</a>', text)

    def fn(m):
        if fns is None:
            return ''
        n = fns.setdefault(m.group(1), len(fns) + 1)
        return f'<sup class="fn" data-fn="{m.group(1)}">[{n}]</sup>'
    return K.FOOTREF.sub(fn, text)


def paras(text):
    """多段文字：空行分段，每段一個 <p>。"""
    return ''.join(f'<p>{inline(p.strip())}</p>' for p in re.split(r'\n\s*\n', text) if p.strip())


LI = re.compile(r'^\s*([-*]|\d+\.)\s+(.*)$')
TABLE_SEP = re.compile(r'^\s*\|?[\s:|-]+\|?\s*$')


def _join(lines):
    """同一段的幾行接起來：中文直接接，英文字之間補一個空白。"""
    out = ''
    for x in lines:
        out += (' ' if out and re.match(r'[A-Za-z0-9]', x) and re.search(r'[A-Za-z0-9,.;:]$', out) else '') + x
    return out


def block_md(text, fns=None):
    """深入頁「說明：」的 Markdown 轉成 HTML：段落、### 小標題、清單（- 或 1.）、表格、引言（> 開頭，例如公式）、圖片（自己一行的 ![說明](assets/img/…)）；
    行內寫法照 inline()，註腳和這一頁一起編號。"""
    out, buf, kind = [], [], None   # kind：p、quote、ul、ol、table

    def flush():
        nonlocal buf, kind
        if kind in ('p', 'quote'):
            tag = '<p>{}</p>' if kind == 'p' else '<blockquote>{}</blockquote>'
            out.append(tag.format(inline(_join(buf), fns)))
        elif kind in ('ul', 'ol'):
            out.append(f'<{kind}>' + ''.join(f'<li>{inline(_join(x), fns)}</li>' for x in buf) + f'</{kind}>')
        elif kind == 'table':
            rows = [[c.strip() for c in r.strip().strip('|').split('|')] for r in buf if not TABLE_SEP.match(r)]
            cell = lambda tag, c: f'<{tag}>{inline(c, fns)}</{tag}>'
            out.append('<table><thead><tr>' + ''.join(cell('th', c) for c in rows[0]) + '</tr></thead><tbody>'
                       + ''.join('<tr>' + ''.join(cell('td', c) for c in r) + '</tr>' for r in rows[1:]) + '</tbody></table>')
        buf, kind = [], None

    for l in text.splitlines():
        h, m = re.match(r'^#{2,6}\s+(.*)$', l), LI.match(l)
        img = re.match(r'^!\[([^\]]*)\]\(([^)\s]+)\)(.*)$', l.strip())
        if not l.strip():
            flush()
        elif img:
            flush()
            out.append(f'<figure><img src="{img.group(2)}" alt="{html.escape(img.group(1))}"><figcaption>{inline(img.group(1) + img.group(3), fns)}</figcaption></figure>')
        elif h:
            flush()
            out.append(f'<h4>{inline(h.group(1), fns)}</h4>')
        elif l.startswith('>'):
            if kind != 'quote':
                flush()
                kind = 'quote'
            buf.append(l[1:].strip())
        elif l.lstrip().startswith('|'):
            if kind != 'table':
                flush()
                kind = 'table'
            buf.append(l)
        elif m:
            k = 'ol' if m.group(1)[0].isdigit() else 'ul'
            if kind != k:
                flush()
                kind = k
            buf.append([m.group(2).strip()])
        elif kind in ('ul', 'ol') and l[:1] in (' ', '\t'):  # 清單項目的下一行縮排：接在同一項
            buf[-1].append(l.strip())
        else:
            if kind != 'p':
                flush()
                kind = 'p'
            buf.append(l.strip())
    flush()
    return ''.join(out)


def first_table(text):
    """Markdown 裡第一個表格的原文（「圖：表格」用）。"""
    rows = []
    for l in text.splitlines():
        if l.lstrip().startswith('|'):
            rows.append(l)
        elif rows:
            break
    return '\n'.join(rows)


def linkify(text):
    return re.sub(r'(https?://[^\s<）)]+)', r'<a href="\1" target="_blank" rel="noopener">\1</a>', html.escape(text, quote=False))


# ---------- 簡報的章：學習路徑、自我檢查 ----------

def chapter_bar(deck):
    """章節列：[編號, 章名, 第一頁 id, 部分]。頁序寫了「章節列」就照它；沒寫就照簡報章檔的「# 章名」，每個部分各自編號。"""
    part_of = {p.id: p.part for p in deck.pages}
    if deck.order.chaps:
        return [[n, name, first, part_of.get(first, 0)] for n, name, first in deck.order.chaps]
    first = {}
    for p in deck.pages:
        if p.chap:
            first.setdefault((p.part, p.chap), p.id)
    return [[c, deck.titles.get((part, c), ''), pid, part] for (part, c), pid in first.items()]


def groups(kb, deck):
    """照頁序把連續、同一章的頁分成一組：入口網站的學習路徑，和章末自我檢查放在哪裡。
    深入頁另外記在 deep，不算進 pages 和 minutes（學習路徑的時間和進度只算主頁）；last 是這一組最後一頁，深入頁也算。"""
    order = deck.order
    names = {(part, n): name for n, name, _, part in chapter_bar(deck)}
    out, seen_part = [], set()
    for p in deck.pages:
        key = f'{p.part}-{p.chap}'
        if out and out[-1]['key'] == key:
            g = out[-1]
        else:
            if p.chap:
                name = f'{CIRC[p.chap - 1] if p.chap <= len(CIRC) else p.chap} {names.get((p.part, p.chap), deck.titles.get((p.part, p.chap), ""))}'
            elif p.part not in seen_part:
                name = order.parts.get(p.part, deck.titles.get((p.part, 0), ''))
            else:
                name = p.short or p.title
            g = {'key': key, 'part': p.part, 'chap': p.chap, 'name': name, 'pages': [], 'minutes': 0, 'deep': [], 'deepMinutes': 0}
            out.append(g)
        seen_part.add(p.part)
        if p.deep:
            g['deep'].append(p.id)
            g['deepMinutes'] += p.minutes
        else:
            g['pages'].append(p.id)
            g['minutes'] += p.minutes
        g['last'] = p.id
    for g in out:
        g['minutes'], g['deepMinutes'] = round(g['minutes'], 1), round(g['deepMinutes'], 1)
    return out


def checks(kb, deck):
    """每一章的自我檢查題目（簡報章檔的「## 自我檢查」）：自動產生一頁，放在那一章最後一頁後面。"""
    titles = {p.id: p.title for p in deck.pages}
    out = {}
    for (part, chap), qs in deck.checks.items():
        for ch, q in qs:
            out.setdefault(f'{part}-{chap}', []).append({
                'q': q.q, 'deep': q.deep, 'a': paras(K.faq_answer(ch, q)),
                'pages': [[pid, titles[pid]] for kn, pid, _ in q.rel if not kn and pid in titles]})
    return out


def qa_appendix(deck):
    """簡報章檔的自我檢查題目，照部分、主題分組：給問答附錄頁（window.QA）用。全是【深入】題的主題歸在「進階」。"""
    groups, n = [], 0
    for (part, chap), qs in sorted(deck.checks.items()):
        for ch, q in qs:
            label = '進階' if q.deep else deck.order.parts.get(part, '').split(' · ')[0]
            if not groups or (groups[-1]['part'], groups[-1]['topic']) != (label, q.topic):
                groups.append({'part': label, 'topic': q.topic, 'items': []})
            n += 1
            groups[-1]['items'].append({'n': n, 'q': q.q, 'a': inline(K.plain(K.faq_answer(ch, q))), 'go': [pid for kn, pid, _ in q.rel if not kn]})
    return groups


# ---------- 簡報 ----------

SHELL = '''<div id="viewport"><div id="stage"></div></div>
<div id="progress"></div>
<div id="help">←/→ 翻頁 · N 講稿 · P 講者視窗 · O 總覽 · B 跳回 · F 全螢幕 · L 醒目游標</div>
<div id="hud"><button id="btn-prev" type="button" aria-label="上一頁">◀</button><span id="hud-num"></span><button id="btn-next" type="button" aria-label="下一頁">▶</button><button id="btn-notes" type="button">講稿</button><button id="btn-pv" type="button">講者視窗</button><button id="btn-ov" type="button">總覽</button></div>
<aside id="notes" hidden></aside>
<div id="overview" hidden></div>'''

START = '''(function () {
  /* 依頁序排列；不在頁序裡的頁不播放 */
  const ORDER = %s;
  const pos = new Map(ORDER.map((id, i) => [id, i]));
  const extra = Deck.slides.filter(s => !pos.has(s.id)).map(s => s.id);
  if (extra.length) console.warn('這些簡報頁不在頁序裡，不會播放：' + extra.join(', '));
  Deck.slides = Deck.slides.filter(s => pos.has(s.id)).sort((a, b) => pos.get(a.id) - pos.get(b.id));
  Deck.addGenerated();
  Deck.start();
})();'''


def md_page(p, main=None):
    """一頁 Markdown 簡報頁 → 給 pages.js 的資料。註腳照第一次出現的順序編號。
    深入頁的「圖：同主頁」沿用主頁（main）的圖，自己沒寫圖說就用主頁的；「圖：表格」把說明裡的第一個表格放在圖的位置。"""
    fns = {}
    fig, _, cap = p.fig.partition('｜')
    fig, same = fig.strip(), bool(main) and fig.strip() == K.SAME_FIG
    if same:
        mfig, _, mcap = main.fig.partition('｜')
        fig, cap = mfig.strip(), cap or mcap
    kind = ('table' if fig == K.TABLE_FIG else 'img' if re.match(r'assets/img/', fig) else 'video' if re.match(r'assets/video/', fig)
            else 'name' if fig else '')
    captions = p.captions or (main.captions if same else [])
    d = {'id': p.id, 'part': p.part, 'chap': p.chap, 'title': inline(p.title), 'short': p.short, 'en': p.en,
         'minutes': p.minutes, 'fig': fig, 'figKind': kind, 'cap': cap.strip(),
         'thesis': inline(p.thesis, fns), 'points': [inline(x, fns) for x in p.points],
         'captions': [[inline(t, fns), inline(d, fns)] for t, d in captions],
         'fact': [inline(p.fact[0], fns), inline(p.fact[1], fns)] if p.fact else None,
         'analogy': [p.analogy[0], inline(p.analogy[1], fns), p.analogy[2]] if p.analogy else None,
         'badge': p.badge, 'src': inline(p.src), 'deep': p.deep,
         'notes': inline(p.notes)}
    d['more'] = block_md(p.body, fns) if p.body else ''
    d['figHtml'] = block_md(first_table(p.body), fns) if kind == 'table' else ''
    for name in p.footnotes:  # 只在旁白或沒用到的註腳，也照順序編號
        fns.setdefault(name, len(fns) + 1)
    d['fns'] = [[n, name, linkify(p.footnotes.get(name, ''))] for name, n in fns.items()]
    return d


def build_deck(kb):
    deck = K.load_deck(kb)
    order = deck.order
    cfg = {'title': order.settings.get('標題', kb.title), 'watermark': order.settings.get('浮水印', ''),
           'parts': order.parts, 'chaps': chapter_bar(deck),
           'kb': {'name': kb.name, 'title': kb.title}, 'groups': groups(kb, deck), 'checks': checks(kb, deck)}
    w, d = kb.dir / 'widgets', kb.dir / 'deck'
    # 互動圖都註冊好之後才加入 Markdown 頁；deck/slides/ 裡的頁面設定（例如 hub）要在那之後才找得到頁
    figs = (sorted((w / 'vendor').glob('*.js'))
            + [ENGINE / 'deck/engine.js', ENGINE / 'widgets/core.js', ENGINE / 'widgets/anim.js', ENGINE / 'deck/pages.js', ENGINE / 'deck/learn.js']
            + sorted(w.glob('*.js')) + sorted((d / 'data').glob('*.js')) + sorted((ENGINE / 'figures').glob('*.js')) + sorted((d / 'figures').glob('*.js')))
    code = [script('window.DECK_CONFIG = ' + json.dumps(cfg, ensure_ascii=False) + ';'),
            script(inline_images(kb, 'window.DECK_MD = ' + json.dumps([md_page(p, deck.md_pages.get(p.deep)) for p in deck.md_pages.values()], ensure_ascii=False) + ';')),
            script('window.QA = ' + json.dumps(qa_appendix(deck), ensure_ascii=False) + ';')]
    code += [script(inline_images(kb, read(f))) for f in figs]
    code.append(script('Deck.addMarkdown(window.DECK_MD);'))
    code += [script(inline_images(kb, read(f))) for f in sorted((d / 'slides').glob('*.js'))]
    code.append(script(START % json.dumps([p.id for p in order.pages])))
    head = '<style>' + read(ENGINE / 'deck/deck.css') + '</style>'
    return page(cfg['title'], head, SHELL + '\n' + '\n'.join(code))


def build(kb, dest=None, name='deck.html'):
    """建置一個知識庫的簡報；dest 沒給就放在 kb/<名稱>/dist/。剛建好骨架、還沒有頁的簡報先不建。"""
    if not (kb.has_deck and K.load_deck(kb).pages):
        return None
    dest = dest or kb.dir / 'dist'
    dest.mkdir(parents=True, exist_ok=True)
    f = dest / name
    f.write_text(build_deck(kb), encoding='utf-8')
    print(f'已建置 {display(f)}（{f.stat().st_size // 1024} KB）')
    return f


def display(f):
    try:
        return K.rel(f)
    except ValueError:
        return str(f)


# ---------- 入口網站 ----------

def last_change(kb):
    """這個知識庫最近一次合併的變更：日期和標題（拿掉開頭的知識庫名稱和結尾的編號）。"""
    out = K.git('log', '-1', '--format=%cs%x09%s', '--', f'kb/{kb.name}', check=False)
    if not out:
        return None
    date, _, subject = out.partition('\t')
    subject = re.sub(r'\s*\(#\d+\)$', '', re.sub(rf'^{re.escape(kb.name)}[：:]\s*', '', subject))
    return {'date': date, 'subject': subject}


def shown_text(p):
    """簡報頁上看得到的文字（不含旁白）：主題索引用。"""
    parts = [p.title, p.thesis, *p.points, *('：'.join(c) for c in p.captions), *(p.fact or ()), p.analogy[1] if p.analogy else '', p.body]
    return K.plain('\n'.join(x for x in parts if x))


def topics(kb, deck):
    """主題索引：術語表的每個術語，和講到它的頁。「第一次出現」那一頁排最前，再來是主頁，深入頁在後；旁白不算。"""
    ids = {p.id: p for p in deck.pages}
    out = []
    for t in K.load_terms(kb):
        pat = K.term_patterns(t)
        hits = [p for p in deck.pages if pat.search(shown_text(p))]
        first = ids.get(t.first)
        pages = {p.id: p for p in ([first] if first else []) + [p for p in hits if not p.deep] + [p for p in hits if p.deep]}
        out.append({'zh': t.zh, 'en': t.en, 'desc': t.desc, 'pages': [[p.id, K.plain(p.title), bool(p.deep)] for p in pages.values()]})
    return out


def chapter_keys(deck, gs):
    """章名 → 學習路徑上那一章的 key（「部分-章」）：章檔的「# 章名」和學習路徑上的名稱都算，比對時拿掉圈號和「第一部分 · 」。"""
    out = {}
    for (part, chap), t in deck.titles.items():
        out.setdefault(K.chapter_name(t), f'{part}-{chap}')
    for g in gs:
        out.setdefault(K.chapter_name(g['name']), g['key'])
    return out


def portal_data():
    kbs, index, decks = [], [], {}
    for kb in K.all_kbs():
        deck = K.load_deck(kb) if kb.has_deck else None
        gs = groups(kb, deck) if deck else []
        decks[kb.name] = (deck, gs)
        kbs.append({'name': kb.name, 'title': kb.title, 'intro': kb.intro, 'maintainers': [n for n, _ in kb.maintainers],
                    'deck': bool(deck and deck.pages),
                    'pages': sum(len(g['pages']) for g in gs), 'minutes': round(sum(g['minutes'] for g in gs)),
                    'deep': sum(len(g['deep']) for g in gs), 'parts': deck.order.parts if deck else {},
                    'path': gs, 'topics': topics(kb, deck) if deck else [], 'updated': last_change(kb)})
        for p in (deck.pages if deck else []):
            index.append(['深' if p.deep else '頁', kb.name, p.id, p.title, p.text[len(p.title):].strip()[:600]])
        tf = kb.dir / 'terms.md'
        for l in (read(tf).splitlines() if tf.exists() else []):
            c = [x.strip() for x in l.strip().strip('|').split('|')]
            if l.startswith('|') and len(c) >= 3 and c[0] and c[0] != '中文' and not set(c[0]) <= set('-: '):
                index.append(['詞', kb.name, '', f'{c[0]}（{c[1]}）' if c[1] else c[0], c[2]])
    # 還沒有頁的章（剛建好的骨架）也列出來，全景圖才看得到整個知識庫的樣子
    for name, (deck, gs) in decks.items():
        for (part, chap), ch in sorted(deck.chapters.items()) if deck else []:
            if any((g['part'], g['chap']) == (part, chap) for g in gs):
                continue
            label = f'{CIRC[chap - 1] if chap <= len(CIRC) else chap} {ch.title}' if chap else deck.order.parts.get(part, ch.title)
            at = next((i for i, g in enumerate(gs) if (g['part'], g['chap']) > (part, chap)), len(gs))
            gs.insert(at, {'key': f'{part}-{chap}', 'part': part, 'chap': chap, 'name': label, 'pages': [], 'minutes': 0, 'deep': [], 'deepMinutes': 0, 'last': None})
    # 每章的速覽和先修（先修可以是別的知識庫的章）；同一章分成好幾段時，只寫在第一段
    keys = {name: chapter_keys(d, gs) for name, (d, gs) in decks.items() if d}
    for name, (deck, gs) in decks.items():
        done = set()
        for g in gs:
            ch = deck.chapters.get((g['part'], g['chap']))
            if ch:
                g['icon'] = ch.icon   # 圖示每一段都畫（例如導讀和總整理是同一個章檔）
            if g['key'] in done or not ch:
                continue
            done.add(g['key'])
            g['overview'] = ch.overview
            g['pre'] = [[kn or name, keys[kn or name][K.chapter_name(n)], n] for kn, n, _ in ch.pre
                        if K.chapter_name(n) in keys.get(kn or name, {})]
    host, repo = K.CONFIG.get('host'), K.CONFIG.get('repo', '')
    # 傳承者分頁「現在可以做的事」：數字還沒附出處的頁（同 index.py --todo），和 Git 主機上待回答、勘誤的連結
    import check as C
    from urllib.parse import quote
    for k in kbs:
        deck = decks[k['name']][0]
        k['todo'] = [[p.id, K.plain(p.title), deck.titles.get((p.part, p.chap), ''), K.plain(bare[0][1])[:50], bool(p.deep)]
                     for p in (deck.pages if deck else []) if p.md for bare in [C.unsourced(p)] if bare]
        gl = K.CONFIG.get('gitlab_url', 'https://gitlab.com')
        k['issues'] = {lab: (f'https://github.com/{repo}/issues?q={quote(f"is:issue is:open label:{lab} label:kb:{k["name"]}")}' if host == 'github'
                             else f'{gl}/{repo}/-/issues?label_name[]={quote(lab)}&label_name[]={quote("kb:" + k["name"])}' if host == 'gitlab' else '')
                       for lab in ('待回答', '勘誤')}
    latest = (f'https://github.com/{repo}/releases/latest' if host == 'github'
              else f'{K.CONFIG.get("gitlab_url", "https://gitlab.com")}/{repo}/-/releases' if host == 'gitlab' else '')
    commit = K.git('rev-parse', '--short', 'HEAD', check=False)
    return {'built': datetime.date.today().isoformat(), 'commit': commit, 'latest': latest,
            'kbs': kbs, 'roles': K.load_paths(), 'index': index}


def build_portal(dest):
    """入口網站：dest/index.html，每個知識庫一個資料夾放簡報。"""
    if dest.exists():
        shutil.rmtree(dest)
    dest.mkdir(parents=True)
    for kb in K.all_kbs():
        build(kb, dest / kb.name)
    head = '<style>' + read(ENGINE / 'portal/portal.css') + '</style>'
    body = ('<div id="app"></div>\n' + script('window.PORTAL = ' + json.dumps(portal_data(), ensure_ascii=False) + ';')
            + script(read(ENGINE / 'portal/icons.js')) + script(read(ENGINE / 'portal/portal.js')))
    (dest / 'index.html').write_text(page('知識傳承入口', head, body), encoding='utf-8')
    print(f'已建置 {display(dest / "index.html")}')
    return dest


def release(out):
    """CI 發布用：每個知識庫的簡報單一檔案（<名稱>-deck.html），和入口網站的壓縮檔 portal.zip。"""
    out.mkdir(parents=True, exist_ok=True)
    for kb in K.all_kbs():
        build(kb, out, f'{kb.name}-deck.html')
    site = build_portal(out / 'portal')
    with zipfile.ZipFile(out / 'portal.zip', 'w', zipfile.ZIP_DEFLATED) as z:
        for f in sorted(site.rglob('*')):
            if f.is_file():
                z.write(f, pathlib.Path('knowledge-portal') / f.relative_to(site))
    shutil.rmtree(site)
    print(f'已打包 {display(out / "portal.zip")}（{(out / "portal.zip").stat().st_size // 1024} KB）')


def main(argv):
    if argv == ['--readme']:
        f = K.ROOT / 'README.md'
        text = read(f)
        new = K.readme_with_kb_list(text)
        f.write_text(new, encoding='utf-8')
        print('首頁的知識庫清單' + ('已更新' if new != text else '本來就是最新的'))
        return 0
    if argv[:1] == ['--release-dir'] and len(argv) == 2:
        release(K.ROOT / argv[1])
        return 0
    if argv[:1] == ['--portal'] and len(argv) == 2:
        build_portal(pathlib.Path(argv[1]).resolve())
        return 0
    if any(a.startswith('--') for a in argv):
        print(__doc__)
        return 1
    for kb in ([K.find_kb(a) for a in argv] if argv else K.all_kbs()):
        build(kb)
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
