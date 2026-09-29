# -*- coding: utf-8 -*-
"""逐格轉 JSON：把稿裡的逐格節（【A】【B】…一格一塊）機械地轉成對話 JSON（多 Agent 創作流程 第 5 步，2026-09-30 起不派 agent 轉）。

用法：
    # 新檔：從 #1 編
    python -X utf8 給AI看的指南/逐格轉json.py "劇情/赫連娜娜/19 張寧把脈.md" --json "Json/赫連娜娜線/19張寧把脈.json"
    # 既有檔加格（高難度檢定那種）：新格接在目前最大號之後、放在陣列尾；既有格只改 links
    python -X utf8 給AI看的指南/逐格轉json.py "劇情/高難度檢定_醉漢.md" --json "Json/張寧線/02蠶女白馬.json" --續號 --改連 "155:156→【A】"
    # 只看不寫、印對照表
    python -X utf8 給AI看的指南/逐格轉json.py <稿> --json <json> --乾跑
    # 稿裡有好幾節逐格（定稿節＋過程稿），指定用哪一節的標題前綴
    python -X utf8 給AI看的指南/逐格轉json.py <稿> --json <json> --節 "#### 逐格稿"

逐格節的寫法（起草稿、審修稿、定稿節都一樣；組裝腳本與三選一套入靠同一套）：
    【A】                         ← 一格開始；後面可帶（擲骰格）之類的說明，不影響
    **旁白:** [panel=6]＊（…）＊    ← 說話者行；空格寫 **（空格）:** 或 - text: （空）
    - actorID: role2
    - Sequence: EnableDialogueBG(Clinic);AudioControl(PlayMusic,BGM_19);   ← 分號隔開，轉檔時一條一行
    - Conditions: IsPassDice() == true;
    - Script: Variable["IsHidden1"] = true;
    - Description: 選項1
    - links: 【F】、【G】          ← 明寫連到哪（發言格接成敗兩支、選單格接各選項）；「- links: 空」＝結尾
    → 接【AC】 或 → 接 #25          ← 也可以用這一行寫這一格接到哪（合流、接回既有格）
    ▶ 選單（【T】→【U】、【V】）      ← 也可以這樣宣告某格的 links
沒明寫的格，links 就是陣列裡的下一格；最後一格沒明寫就是 []。
`>` 註解、##### 小標、*斜體註*、「（完。…）」一律略過。actorID 沒寫的：旁白 role2、你 MC1、其他照 既有台詞.py 的名字表，查不到就報錯。
"""
import argparse
import datetime
import importlib.util
import io
import json
import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

HERE = os.path.dirname(os.path.abspath(__file__))
TAG = r'【[A-Za-z]+\d*】'
TAG_RE = re.compile(TAG)
BLOCK_RE = re.compile(r'^\s*(' + TAG + r')')
SPK_RE = re.compile(r'^\*\*([^*]+?):\*\*\s*(.*)$')
FIELD_RE = re.compile(r'^-\s*(actorID|Sequence|Conditions|Script|Description|links|text)\s*[:：]\s*(.*)$')
GOTO_RE = re.compile(r'^→\s*接\s*(.+)$')
MENU_RE = re.compile(r'^▶.*?(' + TAG + r')\s*→\s*(.+?)[）)]?\s*$')
HASH_RE = re.compile(r'#(\d+)')


def load_names():
    p = os.path.join(HERE, '既有台詞.py')
    spec = importlib.util.spec_from_file_location('jyts', p)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    by_name = {v: k for k, v in mod.NAMES.items()}
    by_name.update({'旁白': 'role2', '你': 'MC1', '主角': 'MC1', '燕不凡': 'MC1'})
    for alias, aid in mod.ALIAS.items():
        by_name.setdefault(alias, aid)
    return by_name


def read(p):
    return io.open(p, encoding='utf-8-sig').read().replace('\r\n', '\n')


def pick_section(lines, prefix):
    """找逐格節：--節 給前綴就用它；否則優先 `#### 逐格稿`（定稿），再 `#### 戲`，再 `## 逐格`。回 (s, e)。"""
    cands = [prefix] if prefix else ['#### 逐格稿', '#### 戲', '## 逐格']
    for pre in cands:
        for i, l in enumerate(lines):
            if l.startswith(pre):
                lvl = len(l) - len(l.lstrip('#'))
                for j in range(i + 1, len(lines)):
                    m = re.match(r'^(#{1,6})\s', lines[j])
                    if m and len(m.group(1)) <= lvl:
                        return i, j
                return i, len(lines)
    return None


def parse_targets(s):
    """`【U】、【V】` / `#25` / `【AC】` / `空` → list of tokens（tag 字串或 int）。"""
    s = s.strip().strip('`')
    if s in ('空', '[]', '無', '（無）'):
        return []
    out = []
    for m in re.finditer(TAG + r'|#\d+', s):
        t = m.group(0)
        out.append(int(t[1:]) if t.startswith('#') else t)
    return out


def parse_blocks(lines):
    blocks = []      # dict(tag, speaker, text, fields{}, links(list or None))
    cur = None
    pending_menu = {}
    for raw in lines:
        s = raw.strip()
        if not s or s.startswith('>') or s.startswith('#') or (s.startswith('*') and not s.startswith('**')):
            continue
        if s.startswith('（完') or s.startswith('(完'):
            if cur is not None and cur['links'] is None:
                cur['links'] = []
            continue
        m = MENU_RE.match(s)
        if m:
            pending_menu[m.group(1)] = parse_targets(m.group(2))
            continue
        m = BLOCK_RE.match(s)
        if m:
            cur = {'tag': m.group(1), 'speaker': None, 'text': '', 'fields': {}, 'links': None}
            blocks.append(cur)
            continue
        if cur is None:
            continue
        m = GOTO_RE.match(s)
        if m:
            cur['links'] = parse_targets(m.group(1))
            continue
        m = SPK_RE.match(s)
        if m and cur['speaker'] is None:
            cur['speaker'] = m.group(1).strip()
            cur['text'] = m.group(2).strip()
            continue
        m = FIELD_RE.match(s)
        if m:
            k, v = m.group(1), m.group(2).strip()
            if k == 'links':
                cur['links'] = parse_targets(v)
            elif k == 'text':
                cur['text'] = '' if v in ('（空）', '(空)', '空', '') else v
            else:
                cur['fields'][k] = v
            continue
        # 其他行（例如選項底下的說明）略過
    for tag, targets in pending_menu.items():
        for b in blocks:
            if b['tag'] == tag:
                b['links'] = targets
    return blocks


def norm_seq(s):
    s = s.strip().strip('`')
    if not s:
        return ''
    parts = [p.strip() for p in s.split(';')]
    parts = [p for p in parts if p]
    return ';\n'.join(parts) + ';'


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('稿')
    ap.add_argument('--json', required=True)
    ap.add_argument('--節', default='')
    ap.add_argument('--續號', action='store_true', help='既有檔加格：新格接在最大號之後、放陣列尾')
    ap.add_argument('--改連', action='append', default=[], help='既有格改 links：`155:156→【A】`（把 #155 的 156 換成新格【A】）或 `155:+【A】`（加一個）')
    ap.add_argument('--乾跑', action='store_true')
    ap.add_argument('--no-zh_TW', action='store_true', help='不寫 zh_TW（預設寫，內容＝text）')
    a = ap.parse_args()

    lines = read(a.稿).split('\n')
    sec = pick_section(lines, a.節)
    if not sec:
        print('找不到逐格節'); sys.exit(1)
    blocks = parse_blocks(lines[sec[0]:sec[1]])
    if not blocks:
        print('逐格節裡沒有【A】這種格'); sys.exit(1)
    names = load_names()

    existing = []
    if a.續號 or (os.path.exists(a.json) and a.改連):
        existing = json.load(io.open(a.json, encoding='utf-8-sig'))
    start = (max(n['entryID'] for n in existing) + 1) if existing else 1
    ids = {b['tag']: start + i for i, b in enumerate(blocks)}
    errors = []

    def resolve(tok, where):
        if isinstance(tok, int):
            if existing and not any(n['entryID'] == tok for n in existing) and tok not in ids.values():
                errors.append('%s 接到 #%d，但 JSON 裡沒有這一格' % (where, tok))
            return tok
        if tok not in ids:
            errors.append('%s 接到 %s，但逐格節裡沒有這一格' % (where, tok))
            return None
        return ids[tok]

    nodes = []
    for i, b in enumerate(blocks):
        f = b['fields']
        actor = f.get('actorID', '').strip().strip('`')
        if not actor:
            actor = names.get(b['speaker'] or '', '')
            if b['speaker'] in ('（空格）', '(空格)', '空格', '系統') or (b['text'] == '' and not b['speaker']):
                actor = actor or '0'
            if not actor:
                errors.append('%s 沒寫 actorID，說話者「%s」也查不到' % (b['tag'], b['speaker']))
        if b['links'] is None:
            links = [start + i + 1] if i + 1 < len(blocks) else []
        else:
            links = [x for x in (resolve(t, b['tag']) for t in b['links']) if x is not None]
        node = {'entryID': ids[b['tag']], 'actorID': actor, 'text': b['text'], 'Sequence': norm_seq(f.get('Sequence', ''))}
        if f.get('Conditions'):
            node['Conditions'] = f['Conditions'].strip().strip('`')
        if f.get('Script'):
            node['Script'] = f['Script'].strip().strip('`')
        if f.get('Description', '').strip():
            node['Description'] = f['Description'].strip()      # 空的不寫這個鍵（全案慣例）
        if b['text']:
            if not a.no_zh_TW:
                node['zh_TW'] = b['text']
            node['zh_CN'] = ''                                    # 之後 填簡體.py 填；空格（text 空）不寫
        node['links'] = links
        nodes.append(node)

    # 既有格改 links
    for spec in a.改連:
        m = re.match(r'^\s*#?(\d+)\s*[:：]\s*(.+)$', spec)
        if not m:
            errors.append('看不懂 --改連 %s' % spec); continue
        eid = int(m.group(1)); rule = m.group(2).strip()
        node = next((n for n in existing if n['entryID'] == eid), None)
        if node is None:
            errors.append('--改連：JSON 裡沒有 #%d' % eid); continue
        if rule.startswith('+'):
            for t in parse_targets(rule[1:]):
                r = resolve(t, '#%d 的 links' % eid)
                if r is not None and r not in node['links']:
                    node['links'].append(r)
        else:
            old, _, new = rule.partition('→')
            olds = parse_targets(old); news = parse_targets(new)
            newids = [x for x in (resolve(t, '#%d 的 links' % eid) for t in news) if x is not None]
            node['links'] = [x for x in node['links'] if x not in olds] + newids

    print('對照表（%s）：' % ('接在 #%d 之後' % (start - 1) if existing else '新檔從 #1'))
    print('  ' + '、'.join('%s＝#%d' % (b['tag'], ids[b['tag']]) for b in blocks))
    for n in nodes:
        tag = next(t for t, v in ids.items() if v == n['entryID'])
        print('  #%-3d %-6s %-8s links=%-14s %s' % (n['entryID'], tag, n['actorID'], n['links'], (n['text'] or '（空）')[:26]))
    if errors:
        print('\n⚠ 錯誤：'); [print('  - ' + e) for e in errors]
        if not a.乾跑:
            print('沒有寫檔。'); sys.exit(1)
    if a.乾跑:
        print('\n（乾跑，沒有寫檔）'); return
    out = existing + nodes
    os.makedirs(os.path.dirname(os.path.abspath(a.json)) or '.', exist_ok=True)
    io.open(a.json, 'w', encoding='utf-8', newline='\n').write(json.dumps(out, ensure_ascii=False, indent=2) + '\n')
    print('\n已寫 %s：新格 %d（#%d–#%d），共 %d 格；zh_CN 空著，之後跑 填簡體.py' % (a.json, len(nodes), start, start + len(nodes) - 1, len(out)))
    # 稿檔頭記一行
    stamp = '> ✅ %s 已由 逐格轉json.py 轉出 `%s`（#%d–#%d）；對照表：%s' % (datetime.date.today().isoformat(), a.json, start, start + len(nodes) - 1, '、'.join('%s＝#%d' % (b['tag'], ids[b['tag']]) for b in blocks))
    lines.insert(1, stamp)
    io.open(a.稿, 'w', encoding='utf-8', newline='\n').write('\n'.join(lines))


if __name__ == '__main__':
    main()
