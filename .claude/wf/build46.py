# -*- coding: utf-8 -*-
import io
s=io.open('review-sheet-17-heitieling.js',encoding='utf8').read()
s=s.replace("name: 'review-sheet-17-heitieling'","name: 'review-sheet-46-wuyuan'")
s=s.replace("審稿單 17 條（黑鐵嶺礦坑）","審稿單 46 條（五原障、儺隊過街、對話氣泡）")
s=s.replace("items17.json","items54.json")
s=s.replace("（2026-09-25 作者圈選的 17 條描述通病，全在黑鐵嶺礦坑，分成三場處理）","（2026-09-25 作者圈選的一批描述通病：五原障 38 條、儺隊過街 7 條、英豪府對話氣泡 1 條；條目明細檔裡另有 N0749–N0756 八條不在本次範圍，不要動）")
old_para=s[s.index("- 要改的檔是「文案總覽稿」"):s.index("- 只治作者圈的")]
new_para="""- 檔案有兩種，看各場的「注意」：①文案總覽稿（檔頭寫由 Json/ 回讀產生，或 md 帶 entryID）：直接把 md 那一格的字換成新句，緊接那一格下面加「> ✏ 2026-09-25 改稿（N編號）：原句 …。理由…」；整格刪除用「> ✏ 2026-09-25 **刪除 #N**（N編號）：原句 …。連線：…。 指令：…。 理由：…」取代那一格。②已轉過 JSON 的創作稿（md 沒有 entryID，但 Json/ 裡有對應檔）：同樣直接改 md、加 ✏ 註記，註記裡要寫出對應的 JSON entryID（用原句去 JSON 找），刪格時連線與指令也寫 JSON 的實況。之後另有代理人照 ✏ 註記去改 JSON，所以連線與指令要從 JSON 查實。作者已收下的前例：劇情/180年事件/07月(主)七夕.md、劇情/黑鐵嶺礦坑/黑鐵嶺礦坑.md、劇情/張角/02 黃巾村.md 裡的「✏ 2026-09-24」「✏ 2026-09-25」註記（grep 得到），照它們的寫法與判斷尺度。
"""
s=s.replace(old_para,new_para)
a=s.index("const FH ="); b=s.index("const COMMON")
units='''const FW = '劇情/呂信/05 五原障.md'
const JW = 'Json/呂信線/五原障.json'
const WX = '本檔是呂信線第五支的創作稿，已轉成 Json/呂信線/五原障.json（還沒進 Unity，作者說審完稿再一起匯入），md 沒有 entryID：改 md，✏ 註記寫出對應的 JSON entryID。呂信的口吻照文風指南呂信卡與既有台詞（他愛馬、只演動作）；檔頭高概念與各 ⚠ 註記是設計紅線（答案不在別人身上、三個對照都不是解答）。md 裡有些格掛著 Script／Sequence，刪格要照 JSON 搬。'
const FB = '劇情/蕭靈犀/01 儺隊過街.md'
const JB = 'Json/蕭靈犀線/01儺隊過街.json'
const FQ = '劇情/英豪府/英豪府遴選/06 對話氣泡.md'
const JQ = 'Json/英豪府遴選/對話氣泡.json'
const UW = [
  { key: '五原障-開場與路上', file: FW, json: [JW], ids: ['N0297','N0298','N0299','N0300','N0301','N0302'], cells: '§0-4 他先開口、§0-5 廣場、§1 路上（md 第 232–356 行）', extra: WX },
  { key: '五原障-外圍哨騎', file: FW, json: [JW], ids: ['N0303','N0304','N0305','N0306','N0307','N0308','N0309','N0310'], cells: '§2 外圍・哨騎（戰鬥一，md 第 357–507 行），含勝敗分支', extra: WX },
  { key: '五原障-探索與塢牆', file: FW, json: [JW], ids: ['N0311','N0312','N0313'], cells: '§2-探1 燧樓殘骸、§2-出 想走的時候、§3 塢牆（md 第 508–702 行）', extra: WX },
  { key: '五原障-戍舍北屋', file: FW, json: [JW], ids: ['N0314','N0315','N0316','N0317','N0318','N0319'], cells: '§4 戍舍開頭、§4-4 塌了半邊的北屋（武力檢定成敗，md 第 703–855 行）', extra: WX },
  { key: '五原障-戍舍燧樓', file: FW, json: [JW], ids: ['N0320','N0321','N0322','N0323'], cells: '§4-5 燧樓的梯子（武藝檢定成敗，md 第 856–916 行）', extra: WX },
  { key: '五原障-水井與老頭', file: FW, json: [JW], ids: ['N0324','N0325','N0326','N0327','N0328','N0329','N0330','N0331'], cells: '§5 塢底水井（戰鬥三，勝敗分支）、§6 那個老頭、§6-2 十七個名字（md 第 917–1080 行）', extra: WX },
  { key: '五原障-處置與收尾', file: FW, json: [JW], ids: ['N0332','N0333','N0334'], cells: '§7-1 你的決定、§9 收尾（md 第 1081 行以後）', extra: WX + ' §7-1 是本關引擎，處置老兵的分支與附錄一留給人物結局的樁不得改動。' },
]
const UB = [
  { key: '儺隊過街', file: FB, json: [JB], ids: ['N0696','N0697','N0698','N0699','N0700','N0701','N0702'], cells: '#15、#33、#18、#19、#20（N0700 與 N0701 同一格）、#38', extra: '本檔是已匯入 Unity 的蕭靈犀線第一支（Json/蕭靈犀線/01儺隊過街.json，36 節點），md 帶 entryID，照回讀稿方式改。檔頭有作者裁示與待辦，先讀。蕭靈犀的口吻照聲口卡與既有台詞。' },
]
const UQ = [
  { key: '對話氣泡', file: FQ, json: [JQ], ids: ['N0695'], cells: '#4240（菈沙的對話氣泡）', extra: '回讀稿。菈沙是波斯商人，口吻照既有台詞；對話氣泡是單句，看檔內這個氣泡掛在哪、什麼時候冒出來。' },
]
'''
s=s[:a]+units+s[b:]
i=s.index("const out = await runFile(FH, UNITSH)")
s=s[:i]+"const out = await parallel([() => runFile(FW, UW), () => runFile(FB, UB), () => runFile(FQ, UQ)])\nreturn { files: out }\n"
for k in ('apply','audit-1','fix','audit-2'):
    s=s.replace("label: '%s:黑鐵嶺'" % k, "label: `%s:${file.split('/').pop()}`" % k)
s=s.replace('\r','')
pass
io.open('review-sheet-46-wuyuan.js','w',encoding='utf8',newline='\n').write(s)
print('ok')
