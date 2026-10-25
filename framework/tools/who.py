"""誰是誰：使用者的帳號、名字、關心和維護的知識庫；或某個知識庫的維護者是誰。

用法：
  python3 framework/tools/who.py                 使用者自己
  python3 framework/tools/who.py semiconductor   這個知識庫的維護者，以及使用者是不是其中一位
  python3 framework/tools/who.py --set name=老王 watch=semiconductor,cv
                                                 記下使用者的名字和關心的知識庫

帳號第一次向 Git 主機查（GitHub 用 gh，GitLab 用 glab），之後記在 .kif/local.json。
"""
import json
import pathlib
import subprocess
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import kb as K  # noqa: E402


def login():
    """使用者在 Git 主機上的帳號；手動模式或查不到時是 None。"""
    local = K.load_local()
    if local.get('login'):
        return local['login']
    host = K.CONFIG.get('host')
    cmd = {'github': ['gh', 'api', 'user', '--jq', '.login'], 'gitlab': ['glab', 'api', 'user']}.get(host)
    if not cmd:
        return None
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode:
        return None
    out = r.stdout.strip()
    name = json.loads(out).get('username') if host == 'gitlab' else out
    if name:
        local['login'] = name
        K.save_local(local)
    return name


def is_maintainer(who, kb):
    return bool(who) and any(acc == who for _, acc in kb.maintainers)


def main(argv):
    if argv and argv[0] == '--set':
        local = K.load_local()
        for kv in argv[1:]:
            k, _, v = kv.partition('=')
            local[k] = [x for x in v.split(',') if x] if k == 'watch' else v
        K.save_local(local)
        print(f'記在 {K.rel(K.LOCAL)}：{json.dumps(local, ensure_ascii=False)}')
        return 0
    me = login()
    if argv:
        kb = K.find_kb(argv[0])
        names = '、'.join(f'{n}（帳號 {a}）' if a else n for n, a in kb.maintainers) or '（還沒有）'
        print(f'{kb.title}（kb/{kb.name}）的維護者：{names}')
        print(f'使用者（{me or "帳號查不到"}）{"是" if is_maintainer(me, kb) else "不是"}這個知識庫的維護者')
        return 0
    local = K.load_local()
    fw = K.framework_maintainers()
    mine = [f'{k.title}（{k.name}）' for k in K.all_kbs() if is_maintainer(me, k)]
    print(f'帳號：{me or "（查不到：手動模式，或還沒登入 Git 主機）"}')
    print(f'名字：{local.get("name") or "（還沒記：問使用者怎麼稱呼，用 --set name=… 記下來）"}')
    watch = '、'.join(local.get('watch', [])) or '（還沒記：問使用者關心哪些知識庫，用 --set watch=… 記下來）'
    print(f'關心的知識庫：{watch}')
    print(f'維護的知識庫：{"、".join(mine) or "（沒有）"}')
    print(f'框架維護者：{"是" if me and any(a == me for _, a in fw) else "不是"}'
          f'（{"、".join(a or n for n, a in fw) or "還沒有"}）')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
