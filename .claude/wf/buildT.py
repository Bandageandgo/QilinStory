# -*- coding: utf-8 -*-
import io
s=io.open('review-sheet-46-wuyuan.js',encoding='utf8').read()
s=s.replace("name: 'review-sheet-46-wuyuan'","name: 'author-rulings-0925'")
s=s.replace("審稿單 46 條（五原障、儺隊過街、對話氣泡）","作者 09-25 裁示七件（五原障拿掉三家分支等、儺隊鼓聲）")
s=s.replace("items54.json","tasks_0925.json")
s=s.replace("（2026-09-25 作者圈選的一批描述通病：五原障 38 條、儺隊過街 7 條、英豪府對話氣泡 1 條；條目明細檔裡另有 N0749–N0756 八條不在本次範圍，不要動）","（這一輪不是審稿單條目，是作者 2026-09-25 對上一批改稿的七件裁示，編號 T1–T7；明細檔裡的 why 就是作者的裁示原話，fix 是建議做法）")
a=s.index("const UW = ["); b=s.index("const COMMON")
units='''const UW = [
  { key: '五原障-拿掉三家分支', file: FW, json: [JW], ids: ['T1'], cells: '§0 全段、流程表、§7-1 與附錄提到三家的地方，外加 劇情/呂信/06 留信.md §2-D 與第 463 行', extra: WX + ' 本檔已有同日審稿單那批的改動與 ✏ 註記，稽核時不算範圍外。這件會動到第二個檔 劇情/呂信/06 留信.md，cells 的 md_file 要寫清楚是哪一檔。' },
  { key: '五原障-註記與一致性', file: FW, json: [JW], ids: ['T2','T3','T4','T5','T6'], cells: '第 935 行設計註記、§0-5 #48 回圈、第 315 行背景圖、§6-2 #735／#736、§8 射馬分歧', extra: WX + ' 本檔已有同日審稿單那批的改動與 ✏ 註記，稽核時不算範圍外。T2–T4、T6 大多是改 md 註記或指令，不是台詞；T5 是台詞。T6 碰到任務 entry，嚴守「作者建、稿內留 ＿＿」。' },
]
const UB = [
  { key: '儺隊過街-鼓聲', file: FB, json: [JB], ids: ['T7'], cells: '#32、已刪 #33 的註記', extra: '本檔已有同日審稿單那批的改動與 ✏ 註記，稽核時不算範圍外。本檔是已匯入 Unity 的蕭靈犀線第一支，md 帶 entryID，照回讀稿方式改。' },
]
'''
s=s[:a]+units+s[b:]
s=s.replace("const out = await parallel([() => runFile(FW, UW), () => runFile(FB, UB), () => runFile(FQ, UQ)])","const out = await parallel([() => runFile(FW, UW), () => runFile(FB, UB)])")
s=s.replace('\r','')
io.open('author-rulings-0925.js','w',encoding='utf8',newline='\n').write(s)
print('UQ' in s.split('const out')[1])
