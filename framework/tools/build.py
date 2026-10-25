"""建置：把每個知識庫做成離線能開的單一 HTML 檔，再全部放進入口網站。

用法：
  python3 framework/tools/build.py                    建置全部知識庫
  python3 framework/tools/build.py semiconductor      只建置一個（寫 kb/semiconductor 也可以）
  python3 framework/tools/build.py --readme           更新首頁 README 的知識庫清單
  python3 framework/tools/build.py --portal <資料夾>  建置入口網站：<資料夾>/index.html，每個知識庫的簡報和手冊網站在 <資料夾>/<名稱>/
  python3 framework/tools/build.py --release-dir out  建置全部，放到 out/（CI 發布用）：每個知識庫的單一檔案，和入口網站的壓縮檔 portal.zip

產出：kb/<名稱>/dist/handbook.html（手冊網站）、kb/<名稱>/dist/deck.html（有 deck/ 才有）。
簡報和手冊網站互相連結：簡報頁「看詳細和出處」打開手冊的小節，手冊的小節連回簡報頁。
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

# 簡報和手冊網站互相連結的檔名：{kb} 換成知識庫名稱。三種放法各有自己的相對位置。
DIST = {'handbook': '../../{kb}/dist/handbook.html', 'deck': '../../{kb}/dist/deck.html'}
PORTAL = {'handbook': '../{kb}/handbook.html', 'deck': '../{kb}/deck.html'}
SINGLE = {'handbook': '{kb}-handbook.html', 'deck': '{kb}-deck.html'}


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
    """簡報頁的行內寫法轉成 HTML：**粗體**、`程式`、[文字](網址)、[^註腳]。也可以直接寫 HTML。
    fns 是 {註腳名稱: 編號}，照第一次出現的順序編號；不給就拿掉註腳標號。"""
    text = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', text)
    text = re.sub(r'`([^`]+)`', r'<code>\1</code>', text)
    text = re.sub(r'\[([^\]^][^\]]*)\]\((https?://[^)\s]+)\)', r'<a href="\2" target="_blank" rel="noopener">\1</a>', text)

    def fn(m):
        if fns is None:
            return ''
        n = fns.setdefault(m.group(1), len(fns) + 1)
        return f'<sup class="fn" data-fn="{m.group(1)}">[{n}]</sup>'
    return K.FOOTREF.sub(fn, text)


def paras(text):
    """多段文字：空行分段，每段一個 <p>。"""
    return ''.join(f'<p>{inline(p.strip())}</p>' for p in re.split(r'\n\s*\n', text) if p.strip())


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
    """照頁序把連續、同一章的頁分成一組：入口網站的學習路徑，和章末自我檢查放在哪裡。"""
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
            g = {'key': key, 'part': p.part, 'chap': p.chap, 'name': name, 'pages': [], 'minutes': 0}
            out.append(g)
        seen_part.add(p.part)
        g['pages'].append(p.id)
        g['minutes'] += p.minutes
    for g in out:
        g['minutes'] = round(g['minutes'], 1)
    return out


def page_maps(kb, deck, secs):
    """頁 id → [(知識庫, 小節 id, 小節標題, 章名)]：簡報頁的「看詳細和出處」。"""
    out = {}
    for p in deck.order.pages:
        rows = []
        for kname, sid, _ in p.maps:
            s = secs.get((kname or kb.name, sid))
            if s:
                rows.append([kname or kb.name, sid, s.title, s.chapter.title])
        if rows:
            out[p.id] = rows
    return out


def section_pages(kb, deck):
    """小節 id → [(頁 id, 頁標題)]：手冊的小節連回簡報頁。"""
    titles = {p.id: p.title for p in deck.pages}
    out = {}
    for p in deck.order.pages:
        for kname, sid, _ in p.maps:
            if (kname or kb.name) == kb.name and p.id in titles:
                out.setdefault(sid, []).append([p.id, titles[p.id]])
    return out


def checks(kb, deck, secs):
    """每一章的自我檢查題目：手冊那一章的常見問題（部分和章的編號跟簡報一樣），加上簡報章檔的「## 自我檢查」。"""
    back = section_pages(kb, deck)
    titles = {p.id: p.title for p in deck.pages}
    out = {}
    for ch in kb.chapters:
        for q in ch.faqs:
            sids = [(kn or kb.name, sid) for kn, sid, _ in q.rel]
            pages = list(dict.fromkeys(tuple(x) for kn, sid in sids if kn == kb.name for x in back.get(sid, [])))
            out.setdefault(f'{ch.part.num}-{ch.num}', []).append({
                'q': q.q, 'deep': q.deep, 'a': paras(K.faq_answer(ch, q)), 'pages': [list(x) for x in pages],
                'secs': [[kn, sid, secs[(kn, sid)].title] for kn, sid in sids if (kn, sid) in secs]})
    for (part, chap), qs in deck.checks.items():
        have = {x['q'] for x in out.get(f'{part}-{chap}', [])}
        for ch, q in qs:
            if q.q in have:  # 手冊的常見問題已經有同一題
                continue
            out.setdefault(f'{part}-{chap}', []).append({
                'q': q.q, 'deep': q.deep, 'a': paras(K.faq_answer(ch, q)), 'secs': [],
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


def md_page(p):
    """一頁 Markdown 簡報頁 → 給 pages.js 的資料。註腳照第一次出現的順序編號。"""
    fns = {}
    fig, _, cap = p.fig.partition('｜')
    fig = fig.strip()
    kind = 'img' if re.match(r'assets/img/', fig) else 'video' if re.match(r'assets/video/', fig) else 'name' if fig else ''
    d = {'id': p.id, 'part': p.part, 'chap': p.chap, 'title': inline(p.title), 'short': p.short, 'en': p.en,
         'minutes': p.minutes, 'fig': fig, 'figKind': kind, 'cap': cap.strip(),
         'thesis': inline(p.thesis, fns), 'points': [inline(x, fns) for x in p.points],
         'captions': [[inline(t, fns), inline(d, fns)] for t, d in p.captions],
         'fact': [inline(p.fact[0], fns), inline(p.fact[1], fns)] if p.fact else None,
         'analogy': [p.analogy[0], inline(p.analogy[1], fns), p.analogy[2]] if p.analogy else None,
         'badge': p.badge, 'src': inline(p.src),
         'notes': inline(p.notes)}
    for name in p.footnotes:  # 只在旁白或沒用到的註腳，也照順序編號
        fns.setdefault(name, len(fns) + 1)
    d['fns'] = [[n, name, linkify(p.footnotes.get(name, ''))] for name, n in fns.items()]
    return d


def build_deck(kb, links):
    deck = K.load_deck(kb)
    secs = K.section_index()
    order = deck.order
    cfg = {'title': order.settings.get('標題', kb.title), 'watermark': order.settings.get('浮水印', ''),
           'parts': order.parts, 'chaps': chapter_bar(deck),
           'kb': {'name': kb.name, 'title': kb.title}, 'links': links,
           'maps': page_maps(kb, deck, secs), 'groups': groups(kb, deck), 'checks': checks(kb, deck, secs)}
    w, d = kb.dir / 'widgets', kb.dir / 'deck'
    # 互動圖都註冊好之後才加入 Markdown 頁；deck/slides/ 裡的頁面設定（例如 hub）要在那之後才找得到頁
    figs = (sorted((w / 'vendor').glob('*.js'))
            + [ENGINE / 'deck/engine.js', ENGINE / 'widgets/core.js', ENGINE / 'widgets/anim.js', ENGINE / 'deck/pages.js', ENGINE / 'deck/learn.js']
            + sorted(w.glob('*.js')) + sorted((d / 'data').glob('*.js')) + sorted((ENGINE / 'figures').glob('*.js')) + sorted((d / 'figures').glob('*.js')))
    code = [script('window.DECK_CONFIG = ' + json.dumps(cfg, ensure_ascii=False) + ';'),
            script(inline_images(kb, 'window.DECK_MD = ' + json.dumps([md_page(p) for p in deck.md_pages.values()], ensure_ascii=False) + ';')),
            script('window.QA = ' + json.dumps(qa_appendix(deck), ensure_ascii=False) + ';')]
    code += [script(inline_images(kb, read(f))) for f in figs]
    code.append(script('Deck.addMarkdown(window.DECK_MD);'))
    code += [script(inline_images(kb, read(f))) for f in sorted((d / 'slides').glob('*.js'))]
    code.append(script(START % json.dumps([p.id for p in order.pages])))
    head = '<style>' + read(ENGINE / 'deck/deck.css') + '</style>'
    return page(cfg['title'], head, SHELL + '\n' + '\n'.join(code))


# ---------- 手冊網站 ----------

def handbook_md(text):
    """常見問題的「相關：hk1、wat」換成可以點的連結（<details> 裡是原始 HTML，要直接寫 <a>）。"""
    out = []
    for l in text.splitlines():
        m = K.REL.match(l)
        if m:
            toks = [t for t in re.split(r'[、,，\s]+', m.group(1)) if t]
            links = [f'<a href="#{t}">{t}</a>' if '/' not in t else t for t in toks]
            l = f'<div class="rel">相關：{"、".join(links)}</div>'
        out.append(l)
    return '\n'.join(out)


def build_handbook(kb, links):
    deck = {'href': links['deck'].replace('{kb}', kb.name), 'pages': section_pages(kb, K.load_deck(kb))} if kb.has_deck else None
    data = {
        'kb': {'name': kb.name, 'title': kb.title, 'intro': kb.intro,
               'maintainers': [n for n, _ in kb.maintainers], 'bigpicture': kb.bigpicture},
        'parts': [{'title': p.title, 'chapters': [
            {'slug': c.file.stem, 'title': c.title, 'overview': c.overview,
             'ids': [s.id for s in c.sections], 'md': inline_images(kb, handbook_md(c.text))}
            for c in p.chapters]} for p in kb.parts],
        'terms': read(kb.dir / 'terms.md') if (kb.dir / 'terms.md').exists() else '',
        'deck': deck,
    }
    v = ENGINE / 'vendor'
    head = '<style>' + read(ENGINE / 'handbook/handbook.css') + '</style>'
    body = ('<nav id="nav"></nav><main id="main"></main>\n'
            + script('window.HB = ' + json.dumps(data, ensure_ascii=False) + ';')
            + script(read(v / 'markdown-it.min.js')) + script(read(v / 'markdown-it-footnote.min.js'))
            + script(read(v / 'mermaid.min.js')) + script(read(ENGINE / 'handbook/handbook.js')))
    return page(f'{kb.title} · 手冊', head, body)


def build(kb, dest=None, links=DIST, names=('handbook.html', 'deck.html')):
    """建置一個知識庫；dest 沒給就放在 kb/<名稱>/dist/。"""
    dest = dest or kb.dir / 'dist'
    dest.mkdir(parents=True, exist_ok=True)
    out = [dest / names[0]]
    out[0].write_text(build_handbook(kb, links), encoding='utf-8')
    if kb.has_deck and K.load_deck(kb).pages:  # 剛建好骨架、還沒有頁的簡報先不建
        out.append(dest / names[1])
        out[1].write_text(build_deck(kb, links), encoding='utf-8')
    for f in out:
        print(f'已建置 {display(f)}（{f.stat().st_size // 1024} KB）')
    return out


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


def portal_data():
    kbs, index = [], []
    for kb in K.all_kbs():
        deck = K.load_deck(kb) if kb.has_deck else None
        gs = groups(kb, deck) if deck else []
        kbs.append({'name': kb.name, 'title': kb.title, 'intro': kb.intro, 'maintainers': [n for n, _ in kb.maintainers],
                    'deck': bool(deck and deck.pages), 'sections': len(kb.sections),
                    'pages': sum(len(g['pages']) for g in gs), 'minutes': round(sum(g['minutes'] for g in gs)),
                    'path': gs, 'updated': last_change(kb)})
        for p in (deck.pages if deck else []):
            index.append(['頁', kb.name, p.id, p.title, p.text[len(p.title):].strip()[:600]])
        for s in kb.sections:
            body = K.plain('\n'.join(l for l in s.lines[2:] if not K.FOOTDEF.match(l)))
            index.append(['節', kb.name, s.id, s.title, re.sub(r'\s+', ' ', body)[:600]])
        tf = kb.dir / 'terms.md'
        for l in (read(tf).splitlines() if tf.exists() else []):
            c = [x.strip() for x in l.strip().strip('|').split('|')]
            if l.startswith('|') and len(c) >= 3 and c[0] and c[0] != '中文' and not set(c[0]) <= set('-: '):
                index.append(['詞', kb.name, '', f'{c[0]}（{c[1]}）' if c[1] else c[0], c[2]])
    host, repo = K.CONFIG.get('host'), K.CONFIG.get('repo', '')
    latest = (f'https://github.com/{repo}/releases/latest' if host == 'github'
              else f'{K.CONFIG.get("gitlab_url", "https://gitlab.com")}/{repo}/-/releases' if host == 'gitlab' else '')
    commit = K.git('rev-parse', '--short', 'HEAD', check=False)
    return {'built': datetime.date.today().isoformat(), 'commit': commit, 'latest': latest,
            'kbs': kbs, 'roles': K.load_paths(), 'index': index}


def build_portal(dest):
    """入口網站：dest/index.html，每個知識庫一個資料夾放簡報和手冊網站。"""
    if dest.exists():
        shutil.rmtree(dest)
    dest.mkdir(parents=True)
    for kb in K.all_kbs():
        build(kb, dest / kb.name, PORTAL)
    head = '<style>' + read(ENGINE / 'portal/portal.css') + '</style>'
    body = ('<div id="app"></div>\n' + script('window.PORTAL = ' + json.dumps(portal_data(), ensure_ascii=False) + ';')
            + script(read(ENGINE / 'portal/portal.js')))
    (dest / 'index.html').write_text(page('知識傳承入口', head, body), encoding='utf-8')
    print(f'已建置 {display(dest / "index.html")}')
    return dest


def release(out):
    """CI 發布用：每個知識庫的單一檔案（<名稱>-handbook.html、<名稱>-deck.html），和入口網站的壓縮檔 portal.zip。"""
    out.mkdir(parents=True, exist_ok=True)
    for kb in K.all_kbs():
        build(kb, out, SINGLE, (f'{kb.name}-handbook.html', f'{kb.name}-deck.html'))
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
