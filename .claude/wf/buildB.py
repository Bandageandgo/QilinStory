# -*- coding: utf-8 -*-
import io
s=io.open('author-rulings-0925.js',encoding='utf8').read()
s=s.replace("name: 'author-rulings-0925'","name: 'liuxin-and-rulings-b'")
s=s.replace("作者 09-25 裁示七件（五原障拿掉三家分支等、儺隊鼓聲）","留信 6 條＋五原障兩件裁示（撤射馬分歧、補回程轉場）")
s=s.replace("tasks_0925.json","items_b.json")
s=s.replace("（這一輪不是審稿單條目，是作者 2026-09-25 對上一批改稿的七件裁示，編號 T1–T7；明細檔裡的 why 就是作者的裁示原話，fix 是建議做法）","（這一輪有兩種：審稿單條目 N0335–N0341，全在 劇情/呂信/06 留信.md；以及作者 2026-09-25 對五原障的兩件裁示 T8、T9，明細檔裡的 why 是作者裁示原話，fix 是建議做法。N0338 所在的 §2-D 上一輪已整段刪除，不用再改）")
a=s.index("const UW = ["); b=s.index("const COMMON")
units='''const FL = '劇情/呂信/06 留信.md'
const JL = 'Json/呂信線/留信.json'
const LX = '本檔是呂信線第六支〈留信〉的創作稿，已有對應 JSON（Json/呂信線/留信.json，查實後再下筆；若 md 沒 entryID，✏ 註記寫出對應的 JSON entryID）。本檔已有同日上一輪的改動（§2-D 整段刪除、✏ 2026-09-25 T1 註記），稽核時不算範圍外。呂信的口吻照文風指南呂信卡與既有台詞；這是他留信離開前最後一場，檔頭與 ⚠ 註記是設計紅線（不點破、不解釋「五原沒有江」）。'
const UW = [
  { key: '五原障-撤射馬分歧與補轉場', file: FW, json: [JW], ids: ['T8','T9'], cells: '§2 #123、§8 #3005／#3105、附錄一；§8 結尾補轉場、#442', extra: WX + ' 本檔已有同日審稿單那批與 T1–T6 的改動與 ✏ 註記，稽核時不算範圍外。' },
]
const UB = [
  { key: '留信', file: FL, json: [JL], ids: ['N0335','N0336','N0337','N0339','N0340','N0341','N0338'], cells: '§2-A 尾格、§2-C 老兵的話、§2-附一「跟五原那幾次一樣的手勁」、§3「五原沒有江」、結尾「小子，替我看著」', extra: LX },
]
'''
s=s[:a]+units+s[b:]
s=s.replace("const out = await parallel([() => runFile(FW, UW), () => runFile(FB, UB)])","const out = await parallel([() => runFile(FW, UW), () => runFile(FL, UB)])")
s=s.replace('\r','')
io.open('liuxin-b.js','w',encoding='utf8',newline='\n').write(s)
print('ok')
