# -*- coding: utf-8 -*-
"""提案檔組裝：把三版審修／文風審過的稿組成一份提案檔（對話置頂、逐格與紀錄在後、待作者定合併）。

用法：
    python -X utf8 給AI看的指南/提案檔組裝.py --場 醉漢 --用途 高難度檢定提案 --分類 福禍 --日期 2026-09-29 \
        --建議 甲 --理由 "二十格最省，禍四格交代完" \
        --版 甲=<hc>/醉漢/style-甲.md 乙=<hc>/醉漢/style-乙.md 丙=<hc>/醉漢/style-丙.md \
        --out 劇情/高難度檢定_醉漢.md
    選填：--掛點 "一句"（不給就抄版甲〈掛點與接回〉第一行）；--規矩 "一句"（檔頭引用區塊多一行）。

版檔的節名靠 `## ` 前綴切（`## 戲`、`## 掛點與接回`、`## 待作者定`、`## 審修紀錄`、`## 文風審紀錄`、`## 文風逐格表`、`## 差異表`、`## 兌現處`、`## 起草者自檢`、`## 給文風審`），
括號後綴不影響。多 Agent 創作流程 §二第 4 步的版面就是這一支輸出的。終審組完要再讀一遍，掛點、待作者填不對就直接改提案檔。
"""
import argparse
import io
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

HEAD_RE = re.compile(r'^(#{1,6})\s*(.+?)\s*$')
TAG_RE = re.compile(r'\[/?em\d\]|\[panel=\d+\]')


def read(p):
    return io.open(p, encoding='utf-8-sig').read().replace('\r\n', '\n')


def split_sections(text):
    """回 (title_line, [(name, body_lines)])：name 是 `## ` 標題去掉括號後綴的前綴字。"""
    title = ''
    secs = []
    cur = None
    for line in text.split('\n'):
        m = HEAD_RE.match(line)
        if m and m.group(1) == '#' and not title:
            title = m.group(2)
            continue
        if m and m.group(1) == '##':
            name = re.split(r'[（(]', m.group(2))[0].strip()
            cur = (name, m.group(2), [])
            secs.append(cur)
            continue
        if cur is None:
            cur = ('_前言', '', [])
            secs.append(cur)
        cur[2].append(line)
    return title, secs


def get(secs, prefix):
    for name, full, body in secs:
        if name.startswith(prefix):
            return full, body
    return None, []


def strip_body(lines):
    out = list(lines)
    while out and not out[0].strip():
        out.pop(0)
    while out and not out[-1].strip():
        out.pop()
    return out


def lens_of(title):
    """`# 起草稿｜醉漢｜甲（照清單最省）` → 取向名；`# 審修稿｜醉漢（福禍）｜甲（照清單最省）` 也行。"""
    m = re.search(r'[｜|]\s*[甲乙丙]\s*[（(](.+?)[）)]', title)
    return m.group(1) if m else ''


def render_dialogue(lines):
    """把〈戲〉轉成純對話：說話者：話；選項前加 ◆；分岔 ▶ 與「→ 接」保留；附註行拿掉。"""
    out = []
    i = 0
    n = len(lines)
    while i < n:
        raw = lines[i]
        s = raw.strip()
        i += 1
        if not s:
            if out and out[-1] != '':
                out.append('')
            continue
        if s.startswith('- '):
            key = s[2:].split(':', 1)[0].split('：', 1)[0].strip()
            if key == 'Sequence':
                m = re.search(r'BeginDiceRoll\((\w+),(\w+),([^)]*)\)', s)
                if m:
                    out.append('　擲骰：%s 難度 %s' % (m.group(2), m.group(3).strip() or '＿＿'))
                m = re.search(r'BeginFight\(Combat,([^)]*)\)', s)
                if m:
                    out.append('　戰鬥：Combat %s' % m.group(1).strip())
            continue
        if s.startswith('>'):
            continue
        m = re.match(r'^\*\*(.+?):\*\*\s*(.*)$', s)
        if m:
            spk, text = m.group(1), m.group(2)
            is_option = text.startswith('[em2][') or ('[em2]' in text and '檢定' in text)
            # 看下一個附註行有沒有 Description: 選項
            j = i
            while j < n and lines[j].strip().startswith('- '):
                if re.search(r'Description[:：]\s*選項', lines[j]):
                    is_option = True
                j += 1
            text = TAG_RE.sub('', text).strip()
            out.append(('◆ ' if is_option else '') + spk + '：' + text)
            continue
        # 【A】、▶、→ 接、數字清單、前情 等原樣保留（去掉 markdown 粗體）
        out.append(s.replace('**', ''))
    return strip_body(out)


def collect_open_items(secs, tag):
    """〈待作者定〉：表格列或條列，各轉成一行 `⚠ …（版）`。"""
    full, body = get(secs, '待作者定')
    items = []
    for line in body:
        s = line.strip()
        if not s or s.startswith('|') and set(s.replace('|', '').replace(':', '').replace('-', '').strip()) <= {' '}:
            continue
        if s.startswith('|'):
            cells = [c.strip() for c in s.strip('|').split('|')]
            if cells and (cells[0] in ('#', '序', '編號') or re.fullmatch(r'\d+', cells[0])):
                cells = cells[1:]                 # 丟掉序號欄
            if cells and cells[0] in ('問題', '項目', '事項', '待定'):
                continue
            if len(cells) >= 3:
                items.append('%s｜建議：%s｜替代：%s' % (cells[0], cells[1], cells[2]))
            elif len(cells) == 2:
                items.append('%s｜%s' % (cells[0], cells[1]))
            elif cells:
                items.append(cells[0])
        elif s.startswith(('- ', '* ')) or re.match(r'^\d+[.、．]', s):
            items.append(re.sub(r'^(- |\* |\d+[.、．]\s*)', '', s))
        elif s.startswith('⚠'):
            items.append(s.lstrip('⚠ ').strip())
    return [(it, tag) for it in items]


def strip_brackets(q):
    """去掉【】、（）、() 裡的格標與補充（先拿【】，再拿括號，括號裡可能還有【】）。"""
    q = re.sub(r'【[^】]*】', '', q)
    for _ in range(3):
        q = re.sub(r'（[^（）]*）', '', q)
        q = re.sub(r'\([^()]*\)', '', q)
    q = re.sub(r'`[^`]*`', '', q)
    return q.strip(' ：:、，,）)')


def question_key(text):
    q = strip_brackets(text.split('｜')[0])
    q = re.sub(r'[\s＿_，,。；;：:？?！!]', '', q)
    return q[:12]


def merge_open_items(all_items):
    """同一個問題（去括號後前十二字相同）併成一條，底下列各版的建議。回 [(問題, [(版, 建議與替代)])]。"""
    groups = {}
    order = []
    for text, tag in all_items:
        key = question_key(text)
        q, _, rest = text.partition('｜')
        q = strip_brackets(q) or text
        if key not in groups:
            groups[key] = [q, []]
            order.append(key)
        groups[key][1].append((tag, rest.strip() or text))
    return [(groups[k][0], groups[k][1]) for k in order]


def demote(lines, by=2):
    out = []
    for line in lines:
        m = HEAD_RE.match(line)
        if m:
            out.append('#' * (len(m.group(1)) + by) + ' ' + m.group(2))
        else:
            out.append(line)
    return out


def count_records(body, keyword=None):
    n = 0
    for line in body:
        s = line.strip()
        if re.match(r'^(\d+[.、．]|- |\* )', s) and (keyword is None or keyword in s):
            n += 1
    return n


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--場', required=True)
    ap.add_argument('--用途', default='高難度檢定提案')
    ap.add_argument('--分類', default='')
    ap.add_argument('--日期', required=True)
    ap.add_argument('--建議', default='＿')
    ap.add_argument('--理由', default='（終審填）')
    ap.add_argument('--掛點', default='')
    ap.add_argument('--規矩', default='')
    ap.add_argument('--版', nargs='+', required=True, help='甲=path 乙=path 丙=path')
    ap.add_argument('--out', required=True)
    a = ap.parse_args()

    versions = []
    for spec in a.版:
        tag, _, path = spec.partition('=')
        text = read(path)
        title, secs = split_sections(text)
        versions.append({'tag': tag, 'path': path, 'title': title, 'secs': secs, 'lens': lens_of(title)})

    num = {'甲': '一', '乙': '二', '丙': '三'}
    hook = a.掛點
    if not hook:
        _, body = get(versions[0]['secs'], '掛點與接回')
        body = strip_body(body)
        hook = re.sub(r'^(\d+[.、．]\s*|- )', '', body[0].strip()).replace('**', '') if body else '（見各版逐格〈掛點與接回〉）'
        hook = re.sub(r'^掛點[：:]\s*', '', hook)

    L = []
    kind = '（%s）' % a.分類 if a.分類 else ''
    L.append('# %s　%s%s｜創作稿／提案，尚未進 JSON' % (a.場, a.用途, kind))
    L.append('')
    L.append('> 📝 %s 三版待作者挑一版' % a.日期)
    L.append('> 建議版：%s，%s' % (a.建議, a.理由))
    L.append('> 掛點：%s' % hook)
    L.append('> 新格不編號，作者續號；已進 Unity 的節點不改字、不動 title；作者要填的一律留 ＿＿。')
    if a.規矩:
        L.append('> %s' % a.規矩)
    L.append('')
    L.append('## 對話')
    L.append('')
    for v in versions:
        L.append('### 版%s（%s｜%s）' % (num.get(v['tag'], v['tag']), v['tag'], v['lens']))
        L.append('')
        _, body = get(v['secs'], '戲')
        L.extend(render_dialogue(body))
        L.append('')

    L.append('## 待作者定')
    L.append('')
    L.append('（三版合併去重；括號是哪幾版提的。每條寫成「問題｜建議做法｜替代做法」，方便作者點選。）')
    L.append('')
    merged = merge_open_items(sum((collect_open_items(v['secs'], v['tag']) for v in versions), []))
    if merged:
        for q, entries in merged:
            if len(entries) == 1:
                tag, rest = entries[0]
                L.append('- ⚠ %s｜%s（%s）' % (q, rest, tag))
            else:
                L.append('- ⚠ %s' % q)
                for tag, rest in entries:
                    L.append('  - %s：%s' % (tag, rest))
    else:
        L.append('（無）')
    L.append('')

    L.append('## 逐格（給 AI）')
    L.append('')
    front = ('取向', '秘密', '福與禍', '檢定', '掛點與接回', '讀的條件', '寫的指令')
    back = ('兌現處', '差異表', '審修紀錄', '文風審紀錄', '文風逐格表', '給文風審', '起草者自檢', '本版對')
    for v in versions:
        L.append('### 版%s（%s｜%s）' % (num.get(v['tag'], v['tag']), v['tag'], v['lens']))
        L.append('')
        L.append('來源：`%s`' % v['path'])
        L.append('')
        for name, full, body in v['secs']:
            if name.startswith(front):
                L.append('#### ' + full)
                L.extend(demote(strip_body(body)))
                L.append('')
        full, body = get(v['secs'], '戲')
        L.append('#### ' + (full or '戲'))
        L.extend(demote(strip_body(body)))
        L.append('')
        for name, full2, body2 in v['secs']:
            if name.startswith(back) and not name.startswith('待作者定'):
                L.append('#### ' + full2)
                L.extend(demote(strip_body(body2)))
                L.append('')

    L.append('## 審修摘要')
    L.append('')
    L.append('| 版 | 審修改動 | 其中邏輯審 | 文風審改動 | 待作者定 |')
    L.append('| :-- | :-- | :-- | :-- | :-- |')
    for v in versions:
        _, rec = get(v['secs'], '審修紀錄')
        _, sty = get(v['secs'], '文風審紀錄')
        L.append('| %s | %d | %d | %d | %d |' % (v['tag'], count_records(rec), count_records(rec, '邏輯審'), count_records(sty), len(collect_open_items(v['secs'], v['tag']))))
    L.append('')

    io.open(a.out, 'w', encoding='utf-8', newline='\n').write('\n'.join(L))
    print('ok %s：%d 行；對話 %s 版；待作者定 %d 條' % (a.out, len(L), '、'.join(v['tag'] for v in versions), len(merged)))


if __name__ == '__main__':
    main()
