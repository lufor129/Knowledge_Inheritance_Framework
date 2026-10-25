"""取得入口網站、手冊網站或簡報：先從 Git 主機下載最新發布的；下載不到（手動模式、沒網路、還沒發布）就在本機建置。

用法：
  python3 framework/tools/get.py portal                      入口網站（所有知識庫的簡報、手冊網站、學習路徑、搜尋）
  python3 framework/tools/get.py semiconductor deck          簡報
  python3 framework/tools/get.py semiconductor handbook      手冊網站
  加 --open 順便用瀏覽器打開

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
    args = [a for a in argv if a != '--open']
    if args == ['portal']:
        f = portal()
        if not f:
            return 1
        if '--open' in argv:
            webbrowser.open(f.resolve().as_uri())
        print(K.rel(f))
        return 0
    if len(args) != 2 or args[1] not in ('deck', 'handbook'):
        print(__doc__)
        return 1
    kb = K.find_kb(args[0])
    kind = args[1]
    if kind == 'deck' and not kb.has_deck:
        print(f'{kb.title} 還沒有簡報，可以看手冊網站：python3 framework/tools/get.py {kb.name} handbook')
        return 1
    f, why = download_file(f'{kb.name}-{kind}.html')
    if f:
        print(f'從 Git 主機下載了最新發布的{"簡報" if kind == "deck" else "手冊網站"}')
    else:
        print(f'下載不到（{why}），改在本機建置')
        r = subprocess.run([sys.executable, str(K.ROOT / 'framework/tools/build.py'), kb.name], cwd=K.ROOT,
                           capture_output=True, text=True)
        f = kb.dir / 'dist' / f'{kind}.html'
        if r.returncode or not f.exists():
            print(r.stdout.strip()[-500:] or r.stderr.strip()[-500:])
            return 1
    if '--open' in argv:
        webbrowser.open(f.resolve().as_uri())
    print(K.rel(f))
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
