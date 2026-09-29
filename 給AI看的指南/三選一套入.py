# -*- coding: utf-8 -*-
"""三選一套入：把作者在〈標記與三選一〉表裡點的候選，機械地套進同一份稿的〈對話〉與〈逐格〉，記〈改動紀錄〉，跑一次節奏檢查。
（多 Agent 創作流程 第 3 步「套入」，2026-09-30 起用腳本，不派 agent。）

用法：
    python -X utf8 給AI看的指南/三選一套入.py "劇情/赫連娜娜/19 張寧把脈.md"            # 就地套
    python -X utf8 給AI看的指南/三選一套入.py <稿> --out <另存路徑>                        # 套到另一份，不動原檔
    python -X utf8 給AI看的指南/三選一套入.py <稿> --輪 2                                  # 只套第 2 張表（預設：全部有「作者選」而還沒 ✅ 的列）
    python -X utf8 給AI看的指南/三選一套入.py <稿> --不跑檢查

表的格式（第一列是表頭，欄名靠名字認，順序不拘）：
    | 標記 | … | 甲 | 乙 | 丙 | 作者選 |
    | 【D】 | … | 「…」（貼〈…〉） | 「…」 | 「…」 | 乙 |
    | 【E】–【H】整段 | … | 【E】娜娜：「…」<br>【F】張寧：「…」<br>（兩格，【G】【H】刪） | … | … | 乙 |
「作者選」：甲／乙／丙 → 套那一欄；刪 → 刪那一格；空白、「都不要…」→ 不動（留給下一輪）；已含 ✅ → 跳過。
候選格子裡「」或＊（）＊之後的括號註解不會套進去。整段候選少掉的格視同刪，並在改動紀錄標 ⚠ 提醒 Sequence 要不要併進鄰格。
只動 `## 對話`（或定稿節裡的「### 一、對話」）與 `#### 戲` 底下的那一格：對話段換「說話者：」後面的字，逐格段換 `**說話者:**`（含 [panel=N]）後面的字。
"""
import argparse
import datetime
import io
import os
import re
import subprocess
import sys

sys.stdout.reconfigure(encoding='utf-8')

TAG_RE = re.compile(r'【[A-Z]+\d*】')
ROW_RE = re.compile(r'^\|')
HEAD_RE = re.compile(r'^(#{1,6})\s+(.+?)\s*$')


def read(p):
    return io.open(p, encoding='utf-8-sig').read().replace('\r\n', '\n')


def cells_of(line):
    return [c.strip() for c in line.strip().strip('|').split('|')]


def clean_candidate(cell):
    """一格的候選：去掉開頭 ◆、去掉最後一個「」或 ＊（）＊ 之後的註解。回 (text, is_option)。"""
    s = cell.strip()
    is_option = s.startswith('◆')
    s = s.lstrip('◆ ').strip()
    # 去 markdown 粗體
    s = s.replace('**', '')
    # 先剝掉結尾的括號註解（可能套一層括號、裡面還有「」），可能不只一組
    for _ in range(3):
        s2 = re.sub(r'\s*（(?:[^（）]|（[^（）]*）)*）\s*$', '', s)
        if s2 == s:
            break
        s = s2
    end = max(s.rfind('」'), s.rfind('＊'))
    if end >= 0:
        s = s[:end + 1]
    return s.strip(), is_option


def parse_segment(cell):
    """整段候選：`【E】娜娜：「…」<br>【F】張寧：「…」<br>（兩格，【G】【H】刪）` → [(tag, speaker, text)]"""
    out = []
    for piece in re.split(r'<br\s*/?>|\n', cell):
        piece = piece.strip()
        m = re.match(r'^(【[A-Z]+\d*】)\s*([^：:]+?)\s*[：:]\s*(.+)$', piece)
        if not m:
            continue
        text, _ = clean_candidate(m.group(3))
        out.append((m.group(1), m.group(2).strip(), text))
    return out


def find_sections(lines):
    """回 {'對話': (s, e), '戲': (s, e), '表': [(s, e)…], '改動紀錄': (s, e) or None}（行號區間，e 不含）。"""
    heads = [(i, len(m.group(1)), m.group(2)) for i, l in enumerate(lines) if (m := HEAD_RE.match(l))]

    def span(i0):
        lvl = [h for h in heads if h[0] == i0][0][1]
        for i, l, _ in heads:
            if i > i0 and l <= lvl:
                return (i0, i)
        return (i0, len(lines))

    sec = {'對話': None, '戲': None, '表': [], '改動紀錄': None, '標記': None}
    for i, lvl, title in heads:
        t = title.strip()
        if sec['對話'] is None and (t.startswith('對話') or re.match(r'^[一二三四五六七八九十]+、對話', t)):
            sec['對話'] = span(i)
        if sec['戲'] is None and t.startswith('戲'):
            sec['戲'] = span(i)
        if t.startswith('標記與三選一'):
            sec['標記'] = span(i)
        if t.startswith('改動紀錄'):
            sec['改動紀錄'] = span(i)
    return sec


def find_tables(lines, s, e):
    """在區間裡找所有表：回 [(header_idx, [row_idx…])]，只收表頭含「作者選」的。"""
    tables = []
    i = s
    while i < e:
        if ROW_RE.match(lines[i]) and '作者選' in lines[i]:
            hdr = i
            rows = []
            j = i + 1
            while j < e and ROW_RE.match(lines[j]):
                if not re.match(r'^\|\s*:?-', lines[j]):
                    rows.append(j)
                j += 1
            tables.append((hdr, rows))
            i = j
        else:
            i += 1
    return tables


def locate_tag(lines, s, e, tag):
    """在區間裡找 `【X】` 開頭的那一行；回行號或 None。"""
    for i in range(s, e):
        if lines[i].strip().startswith(tag):
            return i
    return None


def next_content(lines, i, e):
    for j in range(i + 1, e):
        if lines[j].strip():
            return j
    return None


def replace_dialogue(lines, sec, tag, new_text, log):
    s, e = sec['對話']
    i = locate_tag(lines, s, e, tag)
    if i is None:
        log.append('⚠ 對話段找不到 %s' % tag)
        return None
    j = next_content(lines, i, e)
    if j is None or ('：' not in lines[j] and ':' not in lines[j]):
        log.append('⚠ 對話段 %s 底下沒有「說話者：」行' % tag)
        return None
    line = lines[j]
    m = re.match(r'^(\s*◆\s*)?([^：:]+?)\s*[：:]\s*(.*)$', line)
    old = m.group(3)
    lines[j] = '%s%s：%s' % (m.group(1) or '', m.group(2), new_text)
    return old


def replace_grid(lines, sec, tag, new_text, log):
    s, e = sec['戲']
    i = locate_tag(lines, s, e, tag)
    if i is None:
        log.append('⚠ 逐格段找不到 %s' % tag)
        return None
    j = next_content(lines, i, e)
    if j is None or not lines[j].lstrip().startswith('**'):
        log.append('⚠ 逐格段 %s 底下沒有 **說話者:** 行' % tag)
        return None
    m = re.match(r'^(\s*\*\*[^*]+:\*\*\s*(?:\[panel=\d+\]\s*)?)(.*)$', lines[j])
    old = m.group(2)
    lines[j] = m.group(1) + new_text
    return old


def delete_dialogue(lines, sec, tag, log):
    s, e = sec['對話']
    i = locate_tag(lines, s, e, tag)
    if i is None:
        log.append('⚠ 對話段找不到 %s（要刪）' % tag)
        return
    j = next_content(lines, i, e)
    end = j + 1 if j is not None else i + 1
    while end < e and not lines[end].strip():
        end += 1
    del lines[i:end]
    # 區間縮短，後面的區間要跟著挪
    shift_sections(sec, i, end - i)


def delete_grid(lines, sec, tag, log):
    s, e = sec['戲']
    i = locate_tag(lines, s, e, tag)
    if i is None:
        log.append('⚠ 逐格段找不到 %s（要刪）' % tag)
        return
    end = i + 1
    seq = ''
    while end < e:
        t = lines[end].strip()
        if t.startswith('- '):
            if t.startswith('- Sequence'):
                seq = t[2:]
            end += 1
        elif t.startswith('**'):
            end += 1
        elif not t:
            end += 1
            break
        else:
            break   # → 接、▶ 之類的流程行保留
    del lines[i:end]
    shift_sections(sec, i, end - i)
    if seq:
        log.append('⚠ 已刪 %s，它原本的 %s；表情、立繪要不要併進鄰格，作者或定稿人決定' % (tag, seq))


def shift_sections(sec, at, n):
    for k, v in list(sec.items()):
        if v is None:
            continue
        if k == '表':
            continue
        s, e = v
        if s > at:
            s -= n
        if e > at:
            e -= n
        sec[k] = (s, e)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('稿')
    ap.add_argument('--out', default='')
    ap.add_argument('--輪', type=int, default=0, help='只套第幾張表（1 起算）；0＝全部')
    ap.add_argument('--不跑檢查', action='store_true')
    a = ap.parse_args()

    text = read(a.稿)
    lines = text.split('\n')
    sec = find_sections(lines)
    if not sec['對話'] or not sec['戲'] or not sec['標記']:
        print('找不到需要的節（對話／戲／標記與三選一）：', {k: v for k, v in sec.items() if k != '表'})
        sys.exit(1)

    tables = find_tables(lines, *sec['標記'])
    if not tables:
        print('〈標記與三選一〉裡沒有帶「作者選」欄的表'); sys.exit(1)
    if a.輪:
        tables = [tables[a.輪 - 1]]

    today = datetime.date.today().isoformat()
    records = []
    log = []
    applied_rows = []   # (row_idx, choice)

    # 先收集要做的事（行號在改表之前都有效；刪格會動行號，所以刪的放最後、由後往前）
    todo = []
    for hdr, rows in tables:
        cols = cells_of(lines[hdr])
        idx = {name: k for k, name in enumerate(cols)}
        for need in ('標記', '甲', '乙', '丙', '作者選'):
            if need not in idx:
                print('表頭缺「%s」欄：%s' % (need, lines[hdr])); sys.exit(1)
        for r in rows:
            c = cells_of(lines[r])
            if len(c) <= idx['作者選']:
                continue
            choice = c[idx['作者選']].strip()
            tags = TAG_RE.findall(c[idx['標記']])
            if not tags or not choice or '✅' in choice or choice.startswith('都不要'):
                continue
            todo.append((r, tags, choice, c, idx))

    for r, tags, choice, c, idx in todo:
        head = choice[0]
        if head in ('甲', '乙', '丙'):
            cell = c[idx[head]]
            seg = parse_segment(cell) if len(tags) > 1 or cell.lstrip('◆ ').startswith('【') else []
            if seg:
                kept = {t for t, _, _ in seg}
                for t, spk, newt in seg:
                    old = replace_dialogue(lines, sec, t, newt, log)
                    old2 = replace_grid(lines, sec, t, newt, log)
                    records.append('- %s｜%s→%s｜%s（整段）' % (t, old2 if old2 is not None else old, newt, head))
                for t in tags:
                    if t not in kept:
                        records.append('- %s｜（刪）｜%s（整段收格）' % (t, head))
                        delete_dialogue(lines, sec, t, log)
                        delete_grid(lines, sec, t, log)
                # 整段標記可能寫成【E】–【H】只列首尾：把中間的字母補齊
                if len(tags) == 2 and '–' in c[idx['標記']] or '-' in c[idx['標記']]:
                    a0, b0 = tags[0][1:-1], tags[1][1:-1]
                    if len(a0) == 1 and len(b0) == 1 and a0 < b0:
                        for ch in range(ord(a0) + 1, ord(b0)):
                            t = '【%s】' % chr(ch)
                            if t not in kept and locate_tag(lines, sec['戲'][0], sec['戲'][1], t) is not None:
                                records.append('- %s｜（刪）｜%s（整段收格）' % (t, head))
                                delete_dialogue(lines, sec, t, log)
                                delete_grid(lines, sec, t, log)
            else:
                newt, _ = clean_candidate(cell)
                if not newt:
                    log.append('⚠ %s 的候選 %s 是空的' % (tags[0], head)); continue
                old = replace_dialogue(lines, sec, tags[0], newt, log)
                old2 = replace_grid(lines, sec, tags[0], newt, log)
                records.append('- %s｜%s→%s｜%s' % (tags[0], old2 if old2 is not None else old, newt, head))
            applied_rows.append(r)
        elif head == '刪':
            for t in tags:
                records.append('- %s｜（刪）｜作者：%s' % (t, choice))
                delete_dialogue(lines, sec, t, log)
                delete_grid(lines, sec, t, log)
            applied_rows.append(r)
        else:
            log.append('看不懂的「作者選」：%s（%s）' % (choice, tags[0]))

    if not records:
        print('沒有可套的列（作者選是空的、都不要、或已 ✅）。');
        for l in log: print(l)
        sys.exit(0)

    # 表裡標 ✅（刪格之後行號會變，所以用內容重新找列）
    for r0 in applied_rows:
        pass
    for i, l in enumerate(lines):
        if ROW_RE.match(l):
            c = cells_of(l)
            if len(c) >= 2 and TAG_RE.search(c[0]) and c[-1] and '✅' not in c[-1] and not c[-1].startswith('都不要'):
                # 只標這次真的套了的（比對標記）
                tags = TAG_RE.findall(c[0])
                if any(('- %s｜' % t) in ''.join(records) for t in tags):
                    lines[i] = l.rstrip().rstrip('|').rstrip() + ' ✅ 已套 %s |' % today

    # 改動紀錄
    block = ['', '第 %s 輪套入（%s，腳本 三選一套入.py；格式：格｜原句→新句｜作者選）：' % (len(tables) if not a.輪 else a.輪, today), ''] + records + ['']
    if log:
        block += ['提醒：'] + ['- ' + l for l in log] + ['']
    if sec['改動紀錄']:
        s, e = sec['改動紀錄']
        lines[e:e] = block
    else:
        s, e = sec['標記']
        lines[e:e] = ['## 改動紀錄'] + block

    out = a.out or a.稿
    io.open(out, 'w', encoding='utf-8', newline='\n').write('\n'.join(lines))
    print('套了 %d 條 → %s' % (len(records), out))
    for rec in records:
        print('  ' + rec[:120])
    for l in log:
        print('  ' + l)
    if not a.不跑檢查:
        chk = os.path.join(os.path.dirname(os.path.abspath(__file__)), '文風節奏檢查.py')
        r = subprocess.run([sys.executable, '-X', 'utf8', chk, out], capture_output=True, text=True, encoding='utf-8', errors='replace')
        tail = (r.stdout or '').strip().split('\n')
        print('\n節奏檢查（最後幾行）：')
        for l in tail[-8:]:
            print('  ' + l)


if __name__ == '__main__':
    main()
