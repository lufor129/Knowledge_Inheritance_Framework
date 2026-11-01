"""材料裡的圖：從 pptx、docx、pdf 取出圖片讓傳承者挑；挑好的縮小後放進知識庫，同時寫進圖片清單。

用法：
  python3 framework/tools/image.py extract <材料檔>
      把圖片取到 .kif/tmp/images/<材料檔名>/，列出每張的大小。pdf 需要 pdfimages（poppler）；流程圖是向量圖時取不到，
      改用 pdftoppm 把那一頁轉成圖片再裁切。
  python3 framework/tools/image.py add <知識庫> <圖檔> --name <英文檔名> --desc <說明> --source <出處> --license <授權>
      縮小到最長邊 1600 像素，放到 assets/img/，在 assets/SOURCES.md 加一列。

授權照原圖標示，例如 CC BY 4.0、CC BY-SA 4.0、CC0、公有領域；傳承者自己的圖寫「作者同意以 CC BY-SA 公開」；
查不到授權的論文或原廠圖寫「版權屬原作者（未取得授權）」。公司內部資料不放進知識庫。
"""
import pathlib
import re
import shutil
import subprocess
import sys
import zipfile

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import kb as K  # noqa: E402

OUT = K.TMP / 'images'
MAX_SIDE = 1600
IMAGE = re.compile(r'\.(?:png|jpe?g|gif|webp|svg)$', re.I)


def opt(argv, name):
    return next((argv[i + 1] for i, a in enumerate(argv) if a == name and i + 1 < len(argv)), '')


def extract(src):
    if not src.exists():
        print(f'找不到檔案：{src}')
        return 1
    dest = OUT / src.stem
    if dest.exists():
        shutil.rmtree(dest)
    dest.mkdir(parents=True)
    kind = src.suffix.lower()
    if kind in ('.pptx', '.docx'):
        with zipfile.ZipFile(src) as z:
            for n in z.namelist():
                if '/media/' in n and IMAGE.search(n):
                    (dest / pathlib.PurePosixPath(n).name).write_bytes(z.read(n))
    elif kind == '.pdf':
        if not shutil.which('pdfimages'):
            print('需要 pdfimages（poppler）才能取出 pdf 的圖片；沒有的話，請傳承者把圖另存成檔案。')
            return 1
        subprocess.run(['pdfimages', '-png', str(src), str(dest / 'image')], check=True)
    else:
        print(f'不支援 {kind or "沒有副檔名的檔案"}：可以取 pptx、docx、pdf。圖片檔直接用 add。')
        return 1
    files = sorted(dest.iterdir())
    if not files:
        print('這份材料裡沒有取得出來的圖片。流程圖如果是向量圖，用 pdftoppm 把那一頁轉成圖片。')
        return 0
    print(f'取出 {len(files)} 張，放在 {K.rel(dest)}：')
    for f in files:
        print(f'  {f.name}\t{f.stat().st_size // 1024} KB')
    print('一張一張看，挑新人一看就懂的，給傳承者選；再用 image.py add 放進知識庫。')
    return 0


def shrink(src, dest):
    """縮小到最長邊 MAX_SIDE；工具都沒有時原樣複製。回傳是否有縮小。"""
    shutil.copyfile(src, dest)
    if src.suffix.lower() == '.svg':
        return True
    try:
        from PIL import Image
        with Image.open(dest) as im:
            if max(im.size) > MAX_SIDE:
                im.thumbnail((MAX_SIDE, MAX_SIDE))
                im.save(dest)
        return True
    except ImportError:
        pass
    if shutil.which('sips'):
        subprocess.run(['sips', '-Z', str(MAX_SIDE), str(dest)], capture_output=True, check=True)
        return True
    return False


def add(argv):
    args = [a for a in argv if not a.startswith('--')]
    name, desc, source, lic = (opt(argv, x) for x in ('--name', '--desc', '--source', '--license'))
    if len(args) < 2 or not all((name, desc, source, lic)):
        print(__doc__)
        return 1
    kb, src = K.find_kb(args[0]), pathlib.Path(args[1])
    if not src.exists():
        print(f'找不到檔案：{src}')
        return 1
    if not K.IMG.fullmatch(f'assets/img/{name}'):
        print(f'檔名要用英文、數字、連字號，加上圖片副檔名（jpg、png、gif、svg、webp）：{name}')
        return 1
    dest = kb.dir / 'assets/img' / name
    if dest.exists():
        print(f'{K.rel(dest)} 已經有了；換一個檔名。')
        return 1
    table = kb.dir / 'assets/SOURCES.md'
    dest.parent.mkdir(parents=True, exist_ok=True)
    done = shrink(src, dest)
    cell = lambda s: s.replace('|', '／').replace('\n', ' ').strip()
    text = table.read_text(encoding='utf-8').rstrip('\n')
    table.write_text(f'{text}\n| img/{name} | {cell(desc)} | {cell(source)} | {cell(lic)} |\n', encoding='utf-8')
    print(f'放好了：{K.rel(dest)}（{dest.stat().st_size // 1024} KB{"" if done else "；沒有縮圖工具，原樣放進來"}），圖片清單加了一列。')
    print(f'頁面上寫：- 圖：assets/img/{name}｜<說明>。圖裡的文字和步驟，寫進「圖說：」或重點，查找和讀者測試才讀得到。')
    return 0


def main(argv):
    if len(argv) >= 2 and argv[0] == 'extract':
        return extract(pathlib.Path(argv[1]))
    if len(argv) >= 2 and argv[0] == 'add':
        return add(argv[1:])
    print(__doc__)
    return 1


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
