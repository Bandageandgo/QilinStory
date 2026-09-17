# -*- coding: utf-8 -*-
"""JSON 節點順序與編號檢查（轉成json指南〈節點順序與編號〉，2026-09-17 作者裁示）。

用法：python 給AI看的指南/json順序檢查.py <檔或資料夾>...

只針對**新寫、尚未進 Unity** 的 JSON（已同步的檔不能重編號，舊檔跑出來的警告不要去改）。檢查：
  1. entryID 沿陣列嚴格遞增、從 1 起、不留空號
  2. 陣列順序＝劇本閱讀順序：從第一格沿 links 走——主線一路往下；遇到選項（一格連到多個有文案的格），
     各選項格連號排在一起，接著先寫完第一個選項的整段分支，再寫第二個；條件分支（成功／失敗）先寫完第一條再寫第二條。
     事後補的格子（號碼接在最大號之後、放在陣列尾端的那一塊）不算進比對。
  3. 沒有重號、沒有斷鏈
1 與 3 是硬規則（有就要改）；2 只印提示——作者舊檔在條件路由格有時一層一層排，兩種都讀得順。
Bridge 建新對話時照陣列順序發 Unity 流水號、畫布也照陣列排，陣列亂＝Unity 裡亂。
"""
import io, json, os, sys


def load(p):
    return json.load(io.open(p, encoding='utf-8-sig'))


def reading_order(nodes):
    by = {n['entryID']: n for n in nodes}
    seen, order = set(), []

    def is_option_fanout(n):
        ch = [by[l] for l in (n.get('links') or []) if l in by]
        return len(ch) >= 2 and all((c.get('text') or '').strip() and not (c.get('Conditions') or '').strip() for c in ch)

    def walk(eid):
        if eid in seen or eid not in by:
            return
        seen.add(eid); order.append(eid)
        n = by[eid]
        links = [l for l in (n.get('links') or []) if l in by]
        if is_option_fanout(n):
            for l in links:                      # 選項格先連號排在一起
                if l not in seen:
                    seen.add(l); order.append(l)
            for l in links:                      # 再各自走完整段分支
                for m in (by[l].get('links') or []):
                    walk(m)
        else:
            for l in links:
                walk(l)

    sys.setrecursionlimit(max(10000, len(nodes) * 4))
    walk(nodes[0]['entryID'])
    incoming = {l for n in nodes for l in (n.get('links') or [])}
    for n in nodes:                              # 其他入口
        if n['entryID'] not in seen and n['entryID'] not in incoming:
            walk(n['entryID'])
    for n in nodes:                              # 孤兒
        walk(n['entryID'])
    return order


def trim_appended(ids):
    """陣列尾端「號碼都大於前面最大號」的那一塊視為事後補格，回傳主體長度。"""
    k = len(ids)
    while k > 1 and ids[k - 1] > max(ids[:k - 1]) and ids[k - 1] != ids[k - 2] + 1:
        k -= 1
    return k


def check(p):
    nodes = load(p)
    if not isinstance(nodes, list) or not nodes:
        print('========', p, '\n-- 不是節點陣列，略過'); return False
    ids = [n['entryID'] for n in nodes]
    bad = []
    dup = sorted({i for i in ids if ids.count(i) > 1})
    if dup:
        bad.append('重號：' + '、'.join('#%d' % i for i in dup[:10]))
    idset = set(ids)
    dangling = sorted({l for n in nodes for l in (n.get('links') or []) if l not in idset})
    if dangling:
        bad.append('斷鏈（links 指到不存在的號）：' + '、'.join('#%d' % i for i in dangling[:10]))
    if ids[0] != 1:
        bad.append('首格不是 #1（是 #%d）' % ids[0])
    dec = [(ids[i - 1], ids[i]) for i in range(1, len(ids)) if ids[i] <= ids[i - 1]]
    if dec:
        bad.append('陣列裡號碼不遞增 %d 處：' % len(dec) + '、'.join('#%d→#%d' % x for x in dec[:6]))
    body = trim_appended(ids)
    gaps = [(ids[i - 1], ids[i]) for i in range(1, body) if ids[i] > ids[i - 1] + 1]
    if gaps:
        bad.append('留空號 %d 處：' % len(gaps) + '、'.join('#%d→#%d' % x for x in gaps[:6]))
    mism = None
    if not dup and not dangling:
        order = [e for e in reading_order(nodes) if e in set(ids[:body])]
        arr = ids[:body]
        mism = next(((i, arr[i], order[i]) for i in range(min(len(arr), len(order))) if arr[i] != order[i]), None)
    hint = None
    if not dup and not dangling:
        if mism:
            hint = '提示：陣列順序和「照 links 走」的順序在第 %d 格分岔（陣列 #%d、照 links 該是 #%d）——選項各分支要先寫完一條再寫下一條；作者舊檔在條件路由格有時一層一層排，這條只提示不算錯' % (mism[0] + 1, mism[1], mism[2])
    print('========', p, '（%d 格%s）' % (len(nodes), '，尾端 %d 格視為事後補格' % (len(nodes) - body) if body < len(nodes) else ''))
    for b in bad:
        print('  ⚠', b)
    if hint:
        print('  ·', hint)
    if not bad:
        print('  -- 乾淨：#1 起連號遞增、無重號斷鏈。')
    return not bad


def walk_paths(paths):
    for p in paths:
        if os.path.isdir(p):
            for dp, _, fs in os.walk(p):
                for fn in sorted(fs):
                    if fn.endswith('.json'):
                        yield os.path.join(dp, fn)
        elif p.endswith('.json'):
            yield p


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(__doc__); sys.exit(0)
    ok = True
    for p in walk_paths(sys.argv[1:]):
        try:
            ok = check(p) and ok
        except Exception as e:
            print('========', p, '\n  ⚠ 讀不了：', e); ok = False
    sys.exit(0 if ok else 1)
