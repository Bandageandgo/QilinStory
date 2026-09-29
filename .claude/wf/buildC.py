# -*- coding: utf-8 -*-
import io
s=io.open('review-sheet-46-wuyuan.js',encoding='utf8').read()
s=s.replace("name: 'review-sheet-46-wuyuan'","name: 'review-sheet-19-june-349'")
s=s.replace("審稿單 46 條（五原障、儺隊過街、對話氣泡）","審稿單 19 條（179 年 6 月、呂信〈第三百四十九次〉）")
s=s.replace("items54.json","items19.json")
s=s.replace("（2026-09-25 作者圈選的一批描述通病：五原障 38 條、儺隊過街 7 條、英豪府對話氣泡 1 條；條目明細檔裡另有 N0749–N0756 八條不在本次範圍，不要動）","（2026-09-25 作者圈選的一批描述通病：179 年 6 月 7 條、呂信〈第三百四十九次〉12 條；同檔審稿單另有 N0018–N0021 作者沒圈，不在範圍）")
a=s.index("const FW ="); b=s.index("const COMMON")
units='''const F6 = '劇情/179年事件/06月(主)娜娜再訪、傷癒出門(支)佳人笑返真草、真容之夜.md'
const J6 = ['Json/主線事件/179年/6月.json', 'Json/探索事件/179年/6月.json']
const X6 = '文案總覽稿（回讀產物），md 帶 entryID；主線與支線各對應一份 JSON，先查這格在哪一份。娜娜的口吻照聲口卡與既有台詞。同檔 N0018–N0021（#180、#187）作者沒圈，不在範圍。'
const F3 = '劇情/呂信/02 第三百四十九次.md'
const J3 = ['Json/呂信線/02第三百四十九次.json']
const X3 = '呂信線第二支，md 帶 entryID，已有 Json/呂信線/02第三百四十九次.json（先查這份 md 與 JSON 是否一致；不一致時以 JSON 為準並在 ✏ 註記寫明）。呂信、子羽口吻照聲口卡與既有台詞（子羽話少但整句，不碎句）。檔頭各條 ⚠ 是設計紅線（三百四十九這個數字、與〈雙世冥劍〉第三百五十次的接點不得動）。'
const U6 = [
  { key: '六月-娜娜再訪', file: F6, json: J6, ids: ['N0013','N0014','N0015'], cells: '#2100（燕不凡恭維，擲骰失敗句）、#2079（娜娜看羅盤，N0014 與 N0015 同一格；N0015 牽涉 #2053、#2078、#2111）', extra: X6 },
  { key: '六月-佳人笑返真草', file: F6, json: J6, ids: ['N0016','N0017','N0022','N0023'], cells: '#82（店小二）、#174（一枝花接返真草）、#101、#106（佳人笑收尾旁白）', extra: X6 },
]
const U3 = [
  { key: '三百四十九-開場與過招', file: F3, json: J3, ids: ['N0251','N0252','N0253','N0254'], cells: '#6、#20、#26、#44', extra: X3 },
  { key: '三百四十九-子羽回來', file: F3, json: J3, ids: ['N0255','N0256','N0257','N0258','N0259'], cells: '#4007（N0255 與 N0256 同一格）、#4058、#4064、#4097', extra: X3 },
  { key: '三百四十九-另一路與收尾', file: F3, json: J3, ids: ['N0260','N0261','N0262'], cells: '#471、#50、#77', extra: X3 },
]
'''
s=s[:a]+units+s[b:]
i=s.index("const out = await parallel(")
s=s[:i]+"const out = await parallel([() => runFile(F6, U6), () => runFile(F3, U3)])\nreturn { files: out }\n"
s=s.replace('\r','')
io.open('june-349.js','w',encoding='utf8',newline='\n').write(s)
print('ok')
