# -*- coding: utf-8 -*-
"""JSON 複核（腳本版，2026-09-30 起取代複核 agent）：稿的逐格節 vs JSON 逐格比對，加順序檢查、簡體齊不齊、留白、禁詞。

用法：
    python -X utf8 給AI看的指南/json複核.py "劇情/赫連娜娜/19 張寧把脈.md" --json "Json/赫連娜娜線/19張寧把脈.json"
    python -X utf8 給AI看的指南/json複核.py <稿> --json <json> --節 "#### 逐格稿"        # 稿裡有好幾節逐格時指定
    python -X utf8 給AI看的指南/json複核.py <稿> --json <json> --續號 --改連 "155:156→【A】"  # 既有檔加格的那種，參數同 逐格轉json.py

做什麼：
1. 用 逐格轉json.py 同一套規則把稿重轉一遍（不寫檔），跟 JSON 逐格比 actorID、text、Sequence、Conditions、Script、Description、links、zh_TW；有差就列出來（差＝JSON 被手改過，或稿改了沒重轉）。
2. 跑 json順序檢查.py。
3. zh_CN：每一格 text 非空的都要有；zh_CN 裡的 [panel]／[em]／【】標籤要跟 text 一樣多；長度差超過三成的列出來。
4. 留白：text、Sequence、Conditions、Script 裡還有「＿＿」的列出來（作者要填的）。
5. 禁詞：世界觀第八節那七個詞；饕餮那幾個字（燙熱顫震）只在骰子格報。
全部乾淨印「✅ 複核乾淨」，否則列問題並以非零碼結束。
"""
import argparse
import io
import json
import os
import re
import subprocess
import sys

sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
HARD_WORDS = ('五胡亂華', '司馬', '篡魏', '三國歸晉', '輪迴', '重來', '前世')
TAGS = re.compile(r'\[panel=\d+\]|\[/?em\d\]|【[^】]*】')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('稿')
    ap.add_argument('--json', required=True)
    ap.add_argument('--節', default='')
    ap.add_argument('--續號', action='store_true')
    ap.add_argument('--改連', action='append', default=[])
    a = ap.parse_args()
    problems = []

    # 1. 重轉比對：把 逐格轉json.py 當模組用
    sys.path.insert(0, HERE)
    import importlib.util
    spec = importlib.util.spec_from_file_location('zg', os.path.join(HERE, '逐格轉json.py'))
    zg = importlib.util.module_from_spec(spec); spec.loader.exec_module(zg)
    lines = zg.read(a.稿).split('\n')
    sec = zg.pick_section(lines, a.節)
    if not sec:
        print('找不到逐格節'); sys.exit(2)
    blocks = zg.parse_blocks(lines[sec[0]:sec[1]])
    names = zg.load_names()
    data = json.load(io.open(a.json, encoding='utf-8-sig'))
    byid = {n['entryID']: n for n in data}
    start = 1
    if a.續號:
        start = max(n['entryID'] for n in data) - len(blocks) + 1
    ids = {b['tag']: start + i for i, b in enumerate(blocks)}

    def resolve(tok):
        return tok if isinstance(tok, int) else ids.get(tok)

    for i, b in enumerate(blocks):
        eid = ids[b['tag']]
        n = byid.get(eid)
        if n is None:
            problems.append('%s＝#%d：JSON 裡沒有這一格' % (b['tag'], eid)); continue
        f = b['fields']
        actor = f.get('actorID', '').strip().strip('`') or names.get(b['speaker'] or '', '0' if b['text'] == '' else '')
        exp = {
            'actorID': actor, 'text': b['text'], 'Sequence': zg.norm_seq(f.get('Sequence', '')),
            'Conditions': f.get('Conditions', '').strip().strip('`'), 'Script': f.get('Script', '').strip().strip('`'),
            'Description': f.get('Description', '').strip(),
        }
        if b['links'] is None:
            exp['links'] = [start + i + 1] if i + 1 < len(blocks) else []
        else:
            exp['links'] = [x for x in (resolve(t) for t in b['links']) if x is not None]
        for k, v in exp.items():
            got = n.get(k, '' if k != 'links' else [])
            if k == 'Sequence':
                got = zg.norm_seq(got.replace('\n', '')) if got else ''
            if v != got:
                problems.append('%s＝#%d %s 不一致：稿 %r ／ JSON %r' % (b['tag'], eid, k, v if not isinstance(v, str) else v[:60], got if not isinstance(got, str) else got[:60]))
        if 'zh_TW' in n and n['zh_TW'] != n.get('text'):
            problems.append('#%d zh_TW ≠ text' % eid)

    # 2. 順序檢查
    r = subprocess.run([sys.executable, '-X', 'utf8', os.path.join(HERE, 'json順序檢查.py'), a.json], capture_output=True, text=True, encoding='utf-8', errors='replace')
    out = (r.stdout or '') + (r.stderr or '')
    bad = [l for l in out.split('\n') if l.strip() and not l.startswith('==') and ('✅' not in l and '乾淨' not in l and '沒有' not in l)]
    if r.returncode != 0 or any(('⚠' in l or '錯' in l) for l in bad):
        problems.append('json順序檢查：\n    ' + '\n    '.join(l for l in bad if l.strip())[:800])

    # 3. 簡體
    for n in data:
        t = n.get('text') or ''
        c = n.get('zh_CN') or ''
        if t and not c:
            problems.append('#%d 沒有 zh_CN' % n['entryID'])
        elif t and c:
            if TAGS.findall(t) != TAGS.findall(c):
                problems.append('#%d zh_CN 的標籤跟 text 對不上' % n['entryID'])
            elif abs(len(c) - len(t)) > max(6, len(t) * 0.3):
                problems.append('#%d zh_CN 長度跟 text 差太多（%d vs %d）' % (n['entryID'], len(c), len(t)))

    # 4. 留白
    for n in data:
        for k in ('text', 'Sequence', 'Conditions', 'Script'):
            if '＿＿' in (n.get(k) or ''):
                problems.append('#%d %s 還有 ＿＿（作者要填）' % (n['entryID'], k))

    # 5. 禁詞
    for n in data:
        t = (n.get('text') or '')
        for w in HARD_WORDS:
            if w in t:
                problems.append('#%d 有禁詞「%s」' % (n['entryID'], w))
        if 'BeginDiceRoll' in (n.get('Sequence') or ''):
            pass
        if '麒麟骰' in t and any(w in t for w in ('燙', '熱', '顫', '震')):
            problems.append('#%d 骰子格寫了燙熱顫震' % n['entryID'])

    if problems:
        print('⚠ 複核有 %d 條：' % len(problems))
        for p in problems:
            print('  - ' + p)
        sys.exit(1)
    print('✅ 複核乾淨：%d 格，稿與 JSON 一致、順序連號、簡體齊、無留白、無禁詞' % len(data))


if __name__ == '__main__':
    main()
