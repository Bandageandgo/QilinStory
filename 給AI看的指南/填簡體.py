# -*- coding: utf-8 -*-
"""填簡體：把 JSON 裡缺 zh_CN 的格出成一張表給翻譯 agent，翻好再填回去（多 Agent 創作流程 第 5 步；翻譯派一名 high，agent 不碰 JSON）。

用法：
    python -X utf8 給AI看的指南/填簡體.py --json <json> --出表 <表.md>      # 出表：| entryID | 繁體 | 簡體 |，簡體欄空著
    python -X utf8 給AI看的指南/填簡體.py --json <json> --填 <表.md>        # 讀回表、填 zh_CN、檢查標籤一致
翻譯 agent 的規矩（寫在派它的提示裡）：只填「簡體」欄；[panel=N]、[em7]…[/em7]、[em2]、【】、標點一字不動；不改內容、不潤色；用大陸用語（「妳」→「你」、「臺」→「台」、「甚麼」→「什么」）。
"""
import argparse
import io
import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')
TAGS = re.compile(r'\[panel=\d+\]|\[/?em\d\]|【[^】]*】')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--json', required=True)
    ap.add_argument('--出表', default='')
    ap.add_argument('--填', default='')
    ap.add_argument('--全部', action='store_true', help='出表時連已有 zh_CN 的也出（重翻）')
    a = ap.parse_args()
    data = json.load(io.open(a.json, encoding='utf-8-sig'))

    if a.出表:
        rows = [n for n in data if (n.get('text') or '') and (a.全部 or not n.get('zh_CN'))]
        L = ['# 簡體翻譯表：`%s`' % a.json, '', '> 只填「簡體」欄；標籤、標點一字不動；不改內容、不潤色；大陸用語。填完跑 `填簡體.py --填`。', '',
             '| entryID | 繁體 | 簡體 |', '| --: | :-- | :-- |']
        for n in rows:
            L.append('| %d | %s | |' % (n['entryID'], n['text'].replace('|', '｜')))
        io.open(a.出表, 'w', encoding='utf-8', newline='\n').write('\n'.join(L) + '\n')
        print('出表 %s：%d 格待翻' % (a.出表, len(rows)))
        return

    if a.填:
        byid = {n['entryID']: n for n in data}
        filled = 0; problems = []
        for line in io.open(a.填, encoding='utf-8-sig'):
            if not line.startswith('|'):
                continue
            cells = [c.strip() for c in line.strip().strip('|').split('|')]
            if len(cells) < 3 or not cells[0].isdigit():
                continue
            eid = int(cells[0]); zh = cells[2]
            if not zh:
                continue
            n = byid.get(eid)
            if n is None:
                problems.append('#%d 不在 JSON 裡' % eid); continue
            if TAGS.findall(n['text']) != TAGS.findall(zh):
                problems.append('#%d 標籤對不上，沒填：%s' % (eid, zh[:40])); continue
            n['zh_CN'] = zh; filled += 1
        io.open(a.json, 'w', encoding='utf-8', newline='\n').write(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
        print('填了 %d 格 → %s' % (filled, a.json))
        for p in problems:
            print('  ⚠ ' + p)
        missing = [n['entryID'] for n in data if (n.get('text') or '') and not n.get('zh_CN')]
        if missing:
            print('  還缺 zh_CN：%s' % missing)
        return
    print('要 --出表 或 --填')


if __name__ == '__main__':
    main()
