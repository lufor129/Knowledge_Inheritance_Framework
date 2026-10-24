"""把 index.html 與所有本機 css/js/圖片內嵌成單一檔案，供 Artifact 發布。"""
import re, base64, pathlib
root = pathlib.Path(__file__).parent
html = (root / 'index.html').read_text()
title = re.search(r'<title>(.*?)</title>', html).group(1)
css = (root / 'css/deck.css').read_text()
body = re.search(r'<body>(.*)</body>', html, re.S).group(1)
def inline_script(m):
    src = m.group(1)
    code = (root / src).read_text()
    def uri(mm):
        name = mm.group(1)
        mime = 'image/png' if name.endswith('.png') else 'image/jpeg'
        return f'data:{mime};base64,' + base64.b64encode((root / 'assets/img' / name).read_bytes()).decode()
    code = re.sub(r'assets/img/([\w.-]+\.(?:jpg|png))', uri, code)
    return '<script>' + code.replace('</script>', '<\\/script>') + '</script>'
body = re.sub(r'<script src="([^"]+)"></script>', inline_script, body)
fonts = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&family=Source+Serif+4:ital@1&display=swap">'
out = f'<title>{title}</title>\n{fonts}\n<style>{css}</style>\n{body}'
dist = root / 'dist'; dist.mkdir(exist_ok=True)
(dist / 'index.html').write_text(out)
print('wrote', dist / 'index.html', round(len(out) / 1024), 'KB')
