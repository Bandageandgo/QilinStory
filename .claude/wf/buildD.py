# -*- coding: utf-8 -*-
import io
s=io.open('june-349.js',encoding='utf8').read()
s=s.replace("name: 'review-sheet-19-june-349'","name: 'review-sheet-29-yxf-jx-casino'")
s=s.replace("審稿單 19 條（179 年 6 月、呂信〈第三百四十九次〉）","審稿單 29 條（英豪府開場、賈詡〈兩卷〉、雲中吉祥賭場）")
s=s.replace("items19.json","items29.json")
s=s.replace("（2026-09-25 作者圈選的一批描述通病：179 年 6 月 7 條、呂信〈第三百四十九次〉12 條；同檔審稿單另有 N0018–N0021 作者沒圈，不在範圍）","（2026-09-26 作者圈選的一批描述通病：英豪府遴選〈開場、子羽、呂信〉10 條、賈詡〈兩卷〉10 條、雲中〈吉祥賭場〉9 條；同檔審稿單另有 N0677、N1025 作者沒圈，不在範圍；N1033 明細另列了 劇情/赫連娜娜/06 那份舊創作稿，不管它，只改吉祥賭場）")
s=s.replace("✏ 2026-09-25","✏ 2026-09-26")
a=s.index("const F6 ="); b=s.index("const COMMON")
units='''const FA = '劇情/英豪府/英豪府遴選/01 開場、子羽、呂信.md'
const JA = ['Json/英豪府遴選/開場、子羽、呂信.json']
const XA = '文案總覽稿（回讀產物），md 帶 entryID。子羽、呂信、娜娜的口吻照聲口卡與既有台詞（子羽話少但整句，不碎句；呂信愛馬，只演動作）。同檔 N0677（#527）作者沒圈，不在範圍。'
const FJ = '劇情/賈詡/01 兩卷.md'
const JJ = ['Json/賈詡線/01兩卷.json']
const XJ = '賈詡線第一支〈兩卷〉（暫名），md 帶 entryID，已有 Json/賈詡線/01兩卷.json（先查 md 與 JSON 是否一致，不一致以 JSON 為準並在 ✏ 註記寫明）。動筆前必讀 @角色設定/賈詡.md 末節〈設定拍板進度〉與本檔檔頭紅線（不自陳重建英豪府的理由、不解釋九黎、不寫成萬能 NPC、不宣布怪物變多了）。賈詡、蔡邕口吻照聲口卡與既有台詞。'
const FC = '劇情/雲中/02 吉祥賭場.md'
const JC = ['Json/大地圖/雲中/吉祥賭場.json']
const XC = '文案總覽稿（回讀產物），md 帶 entryID。娜娜、褚人飛口吻照聲口卡與既有台詞。同檔 N1025（#4057）作者沒圈，不在範圍。'
const U6 = [
  { key: '英豪府-開場與子羽', file: FA, json: JA, ids: ['N0678','N0679','N0680','N0681'], cells: '#3984、#4050、#4060（N0680 與 N0681 同一格）', extra: XA },
  { key: '英豪府-呂信喝酒', file: FA, json: JA, ids: ['N0682','N0683','N0684','N0685','N0686','N0687'], cells: '#4065、#4066（N0683 與 N0684 同一格）、#4081、#4086（N0686 與 N0687 同一格）', extra: XA },
]
const U3 = [
  { key: '兩卷-剖妖', file: FJ, json: JJ, ids: ['N0728','N0729','N0730','N0731'], cells: '#8、#12、#38（選項）、#40（發言）', extra: XJ },
  { key: '兩卷-蔡邕竹林', file: FJ, json: JJ, ids: ['N0732','N0733','N0734','N0735','N0736','N0737'], cells: '#43、#46、#55、#58、#74、#77', extra: XJ },
]
const UC = [
  { key: '吉祥賭場', file: FC, json: JC, ids: ['N1026','N1027','N1028','N1029','N1030','N1031','N1032','N1033','N1034'], cells: '#4058、#4072（N1027 與 N1028 同一格）、#3996、#4236、#4014、#4016、#4038（N1033 與 N1034 同一格）', extra: XC },
]
'''
s=s[:a]+units+s[b:]
i=s.index("const out = await parallel(")
s=s[:i]+"const out = await parallel([() => runFile(FA, U6), () => runFile(FJ, U3), () => runFile(FC, UC)])\nreturn { files: out }\n"
s=s.replace('\r','')
io.open('yxf-jx-casino.js','w',encoding='utf8',newline='\n').write(s)
print('ok')
