"""取得入口網站或簡報：先從 Git 主機下載最新發布的；下載不到（手動模式、沒網路、還沒發布）就在本機建置。

用法：
  python3 framework/tools/get.py portal                      入口網站（所有知識庫的簡報、全景圖、學習路徑、主題索引、搜尋）
  python3 framework/tools/get.py semiconductor deck          簡報
  加 --open 順便用瀏覽器打開；加 --page <頁id> 直接打開那一頁（深入頁也可以）
  加 --here 不下載，用目前分支的內容在本機建置：傳承者確認、維護者審核時看改過的頁

下載的放在 .kif/downloads/（入口網站解開在 .kif/downloads/portal/），本機建置的在 kb/<知識庫>/dist/、.kif/portal/。
最後一行印出檔案的路徑。
"""
import pathlib
import shutil
import subprocess
import sys
import webbrowser
import zipfile

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import kb as K  # noqa: E402

DOWNLOADS = K.ROOT / '.kif/downloads'


def download_file(fname):
    host = K.CONFIG.get('host')
    if host == 'github':
        cmd = ['gh', 'release', 'download', '--pattern', fname, '--dir', str(DOWNLOADS), '--clobber']
    elif host == 'gitlab':  # 還沒有實測
        cmd = ['glab', 'release', 'download', '--asset-name', fname, '--dir', str(DOWNLOADS)]
    else:
        return None, '手動模式，沒有 Git 主機'
    DOWNLOADS.mkdir(parents=True, exist_ok=True)
    r = subprocess.run(cmd, cwd=K.ROOT, capture_output=True, text=True)
    f = DOWNLOADS / fname
    if r.returncode or not f.exists():
        return None, (r.stderr.strip().splitlines() or ['下載不到'])[-1]
    return f, None


def portal():
    """入口網站：下載 portal.zip 解開；下載不到就在本機建置。回傳 index.html。"""
    z, why = download_file('portal.zip')
    if z:
        dest = DOWNLOADS / 'portal'
        shutil.rmtree(dest, ignore_errors=True)
        with zipfile.ZipFile(z) as f:
            f.extractall(dest)
        index = next(dest.glob('*/index.html'), dest / 'index.html')
        if index.exists():
            print('從 Git 主機下載了最新發布的入口網站')
            return index
        why = '壓縮檔裡沒有 index.html'
    print(f'下載不到（{why}），改在本機建置')
    dest = K.ROOT / '.kif/portal'
    r = subprocess.run([sys.executable, str(K.ROOT / 'framework/tools/build.py'), '--portal', str(dest)], cwd=K.ROOT,
                       capture_output=True, text=True)
    if r.returncode or not (dest / 'index.html').exists():
        print(r.stdout.strip()[-500:] or r.stderr.strip()[-500:])
        return None
    return dest / 'index.html'


def main(argv):
    page = next((argv[i + 1] for i, a in enumerate(argv) if a == '--page' and i + 1 < len(argv)), None)
    argv = [a for i, a in enumerate(argv) if a != '--page' and (i == 0 or argv[i - 1] != '--page')]
    here = '--here' in argv
    args = [a for a in argv if a not in ('--open', '--here')]
    if args == ['portal']:
        f = portal()
        if not f:
            return 1
        if '--open' in argv:
            webbrowser.open(f.resolve().as_uri())
        print(K.rel(f))
        return 0
    if len(args) != 2 or args[1] != 'deck':
        print(__doc__)
        return 1
    kb = K.find_kb(args[0])
    if not (kb.has_deck and K.load_deck(kb).pages):
        print(f'{kb.title} 的簡報還沒有頁；每一章要講什麼，可以在入口網站的全景圖點開來看：python3 framework/tools/get.py portal --open')
        return 1
    f, why = (None, '用目前分支的內容') if here else download_file(f'{kb.name}-deck.html')
    if f:
        print('從 Git 主機下載了最新發布的簡報')
    else:
        print(f'在本機建置（{why}）' if here else f'下載不到（{why}），改在本機建置')
        r = subprocess.run([sys.executable, str(K.ROOT / 'framework/tools/build.py'), kb.name], cwd=K.ROOT,
                           capture_output=True, text=True)
        f = kb.dir / 'dist' / 'deck.html'
        if r.returncode or not f.exists():
            print(r.stdout.strip()[-500:] or r.stderr.strip()[-500:])
            return 1
    if '--open' in argv:
        webbrowser.open(f.resolve().as_uri() + (f'#{page}' if page else ''))
    print(K.rel(f) + (f'#{page}' if page else ''))
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
