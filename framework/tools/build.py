"""建置：把每個知識庫做成離線能開的單一 HTML 檔。

用法：
  python3 framework/tools/build.py                    建置全部知識庫
  python3 framework/tools/build.py semiconductor      只建置一個（寫 kb/semiconductor 也可以）
  python3 framework/tools/build.py --readme           更新首頁 README 的知識庫清單
  python3 framework/tools/build.py --release-dir out  建置全部，並把結果複製到 out/（CI 發布用）

產出：kb/<名稱>/dist/handbook.html（手冊網站）、kb/<名稱>/dist/deck.html（有 deck/ 才有）。
"""
import base64
import json
import re
import shutil
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import kb as K  # noqa: E402

ENGINE = K.ROOT / 'framework/engine'
FONTS = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&family=Source+Serif+4:ital@1&display=swap">'
MIME = {'.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.webp': 'image/webp'}


def read(p):
    return p.read_text(encoding='utf-8')


def script(code):
    return '<script>' + code.replace('</script', '<\\/script') + '</script>'


def inline_images(kb, text):
    """把 assets/img/xxx 換成 data URI，單一檔案才能離線顯示圖片。"""
    def uri(m):
        f = kb.dir / 'assets' / m.group(1)
        if not f.exists():
            return m.group(0)
        return f'data:{MIME[f.suffix.lower()]};base64,' + base64.b64encode(f.read_bytes()).decode()
    return re.sub(r'(?:\.\./)*assets/(img/[\w.-]+\.(?:jpe?g|png|gif|svg|webp))', uri, text)


def page(title, head, body):
    return (f'<!doctype html>\n<html lang="zh-Hant">\n<head>\n<meta charset="utf-8">\n'
            f'<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
            f'<title>{title}</title>\n{FONTS}\n{head}\n</head>\n<body>\n{body}\n</body>\n</html>\n')


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


def build_handbook(kb):
    data = {
        'kb': {'name': kb.name, 'title': kb.title, 'intro': kb.intro,
               'maintainers': [n for n, _ in kb.maintainers], 'bigpicture': kb.bigpicture},
        'parts': [{'title': p.title, 'chapters': [
            {'slug': c.file.stem, 'title': c.title, 'overview': c.overview,
             'ids': [s.id for s in c.sections], 'md': inline_images(kb, handbook_md(c.text))}
            for c in p.chapters]} for p in kb.parts],
        'terms': read(kb.dir / 'terms.md') if (kb.dir / 'terms.md').exists() else '',
    }
    v = ENGINE / 'vendor'
    head = '<style>' + read(ENGINE / 'handbook/handbook.css') + '</style>'
    body = ('<nav id="nav"></nav><main id="main"></main>\n'
            + script('window.HB = ' + json.dumps(data, ensure_ascii=False) + ';')
            + script(read(v / 'markdown-it.min.js')) + script(read(v / 'markdown-it-footnote.min.js'))
            + script(read(v / 'mermaid.min.js')) + script(read(ENGINE / 'handbook/handbook.js')))
    return page(f'{kb.title} · 手冊', head, body)


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
  Deck.start();
})();'''


def build_deck(kb):
    order = K.load_order(kb)
    cfg = {'title': order.settings.get('標題', kb.title), 'watermark': order.settings.get('浮水印', ''),
           'parts': order.parts, 'chaps': [list(c) for c in order.chaps]}
    w = kb.dir / 'widgets'
    files = (sorted((w / 'vendor').glob('*.js')) + [ENGINE / 'deck/engine.js', ENGINE / 'widgets/core.js', ENGINE / 'widgets/anim.js']
             + sorted(w.glob('*.js')) + sorted((kb.dir / 'deck/data').glob('*.js')) + sorted((kb.dir / 'deck/slides').glob('*.js')))
    code = [script('window.DECK_CONFIG = ' + json.dumps(cfg, ensure_ascii=False) + ';')]
    code += [script(inline_images(kb, read(f))) for f in files]
    code.append(script(START % json.dumps([p.id for p in order.pages])))
    head = '<style>' + read(ENGINE / 'deck/deck.css') + '</style>'
    return page(cfg['title'], head, SHELL + '\n' + '\n'.join(code))


def build(kb):
    dist = kb.dir / 'dist'
    dist.mkdir(exist_ok=True)
    out = []
    (dist / 'handbook.html').write_text(build_handbook(kb), encoding='utf-8')
    out.append(dist / 'handbook.html')
    if kb.has_deck:
        (dist / 'deck.html').write_text(build_deck(kb), encoding='utf-8')
        out.append(dist / 'deck.html')
    for f in out:
        print(f'已建置 {K.rel(f)}（{f.stat().st_size // 1024} KB）')
    return out


def main(argv):
    if argv == ['--readme']:
        f = K.ROOT / 'README.md'
        text = read(f)
        new = K.readme_with_kb_list(text)
        f.write_text(new, encoding='utf-8')
        print('首頁的知識庫清單' + ('已更新' if new != text else '本來就是最新的'))
        return 0
    release = None
    if argv[:1] == ['--release-dir']:
        release, argv = K.ROOT / argv[1], argv[2:]
        release.mkdir(parents=True, exist_ok=True)
    kbs = [K.find_kb(a) for a in argv] if argv else K.all_kbs()
    for kb in kbs:
        for f in build(kb):
            if release:
                shutil.copy(f, release / f'{kb.name}-{f.stem}.html')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
