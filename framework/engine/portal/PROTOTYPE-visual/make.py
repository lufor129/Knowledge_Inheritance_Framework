"""PROTOTYPE（用完就丟，不進主線）：入口網站「用圖示與互動講學習流程和各主題」的三種做法。

用法：python3 framework/engine/portal/PROTOTYPE-visual/make.py [--open]
先照常把入口網站建置到 .kif/portal-prototype/，再在旁邊寫 prototype.html，讀同一份資料（各章的速覽、先修、頁數、進度）。
網址加 ?variant=A、B、C 切換；畫面下方的切換列和 ← → 鍵也可以。
"""
import pathlib
import re
import subprocess
import sys
import webbrowser

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parents[3]
dest = ROOT / '.kif/portal-prototype'
subprocess.run([sys.executable, str(ROOT / 'framework/tools/build.py'), '--portal', str(dest)], check=True, cwd=ROOT)
index = (dest / 'index.html').read_text(encoding='utf-8')
data = re.search(r'window\.PORTAL = (.*?);</script>', index, re.S).group(1)
css = (ROOT / 'framework/engine/portal/portal.css').read_text(encoding='utf-8') + (HERE / 'variants.css').read_text(encoding='utf-8')
js = (HERE / 'variants.js').read_text(encoding='utf-8')
html = ('<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width, initial-scale=1">'
        f'<title>入口網站：圖示與互動（原型）</title><style>{css}</style></head>'
        f'<body><div id="app"></div><script>window.PORTAL = {data};</script><script>{js}</script></body></html>')
out = dest / 'prototype.html'
out.write_text(html, encoding='utf-8')
print(out)
if '--open' in sys.argv:
    webbrowser.open(out.as_uri() + '?variant=A')
