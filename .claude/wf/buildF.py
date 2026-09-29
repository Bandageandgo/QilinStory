# -*- coding: utf-8 -*-
import io
s=io.open('mixed50.js',encoding='utf8').read()
s=s.replace("name: 'review-sheet-50-mixed'","name: 'review-sheet-6-yunzhong-street'")
s=s.replace("審稿單 50 條（179 年 3 月、12 月、董卓認子、宗緯家、娜娜林中、乞丐結局等）","審稿單 6 條（雲中街道）")
s=s.replace("items50.json","items6.json")
s=s.replace("（2026-09-26 作者圈選的一批描述通病，共 50 條，分七場；明細檔裡條目的 file 欄是審稿時找到的檔，但有些是舊創作稿，遊戲裡的現行文案在別的 md／JSON，看各場的「注意」）","（2026-09-26 作者圈選的 6 條描述通病，全在雲中街道；同檔另有 N0350、N0352、N1012、N1014、N1018、N1020–N1024 等作者沒圈，不在範圍）")
a=s.index("const F03 ="); b=s.index("const COMMON")
units='''const FYZ = '劇情/雲中/01 街道.md'
const UYZ = [{ key: '雲中街道', file: FYZ, json: ['Json/大地圖/雲中/街道.json'], ids: ['N1011','N1013','N1015','N1016','N1017','N1019'], cells: '#1、#110、#4148、#37（N1016 與 N1017 同一格）、#4100', extra: '文案總覽稿（回讀產物），md 帶 entryID。本檔可能已有前幾批的 ✏ 註記，稽核時不算範圍外。娜娜、蒲元口吻照聲口卡與既有台詞。#4148 那句跟 劇情/小溪村後山/01 赫連娜娜、張寧.md #63／#2060 同型，那兩格 09-26 已改成「你看著這個死要面子、得了便宜還賣乖的丫頭，嘆了口氣。」，可參考。' }]
'''
s=s[:a]+units+s[b:]
i=s.index("const out = await parallel(")
s=s[:i]+"const out = await parallel([() => runFile(FYZ, UYZ)])\nreturn { files: out }\n"
io.open('yunzhong6.js','w',encoding='utf8',newline='\n').write(s.replace('\r',''))
print('ok')
