export const meta = {
  name: 'review-sheet-22-huangjin',
  description: '審稿單 N0509–N0530（黃巾村初稿）：每場三名起草、三名審稿駁回、綜合定稿、兩名複核，再改進初稿並稽核',
  phases: [
    { title: 'Scout', detail: '每段整理情境包：原句、分支走向、設計紅線、聲口' },
    { title: 'Draft', detail: '每段三名起草者：照單／接戲／另一條路' },
    { title: 'Review', detail: '每段三名審稿者：文風／連續性／審稿單，逐條通過或駁回' },
    { title: 'Synthesize', detail: '綜合勝出版本與嫁接；全被駁回的重寫' },
    { title: 'Verify', detail: '兩名懷疑者複核定稿，不過就退回重寫（最多兩輪）' },
    { title: 'Apply', detail: '一名編輯改進初稿、寫 ✏ 註記' },
    { title: 'Audit', detail: '獨立稽核 diff，有錯就修再稽核' },
  ],
}

const ITEMS = 'C:/Users/user/AppData/Local/Temp/claude/d--QilinStory/90185aca-633d-4b94-9884-c66314379f5f/scratchpad/items22.json'
const FILE = '劇情/張角/02 黃巾村.md'

const UNITS = [
  { key: '黃巾村§1神樹下', ids: ['N0509', 'N0510', 'N0511', 'N0512', 'N0513', 'N0514', 'N0515', 'N0516'],
    cells: '第 49 行（樹下三口缸）、第 57 行（旗進村版）、第 61 行（其餘版，N0511 與 N0512 同一格）、第 65 行（匯合後張寧看瓢）、第 81 行（漢子捲袖，N0514 與 N0515 同一格）、第 85 行（張寧看疤搭脈）',
    extra: '第 57、61 行是依 01 entry 2 分流的兩格，擇一播放後在第 65 行匯合：兩格改完各自接第 49 行與第 65 行都要通。第 85 行底下接「你：張姑娘？」與張寧「脈是好的」，檔內 ⚠ 註記要求不得讓人解釋符水為什麼有效、也不得說那是騙人的。' },
  { key: '黃巾村§2病舍', ids: ['N0517', 'N0518', 'N0519', 'N0520', 'N0521', 'N0522', 'N0523', 'N0524'],
    cells: '第 117 行（你「窗開了，還要做什麼？」）、第 123 行（她分兩邊搭脈）、第 139 行（第一到第三天）、第 143 行（捲草席）、第 195 行（醫術檢定失敗支）、第 203 行（選擇 2 支）、第 207 行（三條匯合後第五天）、第 215 行（搭你的腕）',
    extra: '選單（第 153 行起）三條路：選 1 檢定成功（第 171–185 行）、選 1 檢定失敗（第 191–195 行）、選 2（第 199–203 行），在第 205 行匯合進第 207 行。第 195、203 行各自是一條路的最後一格，都要接得上第 207 行。第 149 行（選單前一格）不掛表情特效。' },
  { key: '黃巾村§3最裡那一戶', ids: ['N0525', 'N0526', 'N0527', 'N0528', 'N0529', 'N0530'],
    cells: '第 269 行（她端碗、你想坐起來）、第 279 行（她喝一口、搭自己的脈，N0526 與 N0527 同一格）、第 283 行（門口站著程寶）、第 295 行（一刻之後又秤藥）、第 301 行（你喝完昏過去）',
    extra: '這是張寧線的結算點，檔頭寫法紅線 1、2、5 全適用：她死不死不揭、她不說謝不說軟話不哭、旁白只寫她做了什麼算了什麼、主角不勸她。第 289 行是她線收句（暫定，作者可改），不在範圍。第 301 行「比那一碗還苦」回呼 劇情/張寧/01 那一碗.md。附錄二：程寶不在村裡的版本，第 283 行門口站的改成村正，新句要兩個版本都能換人成立。' },
]

const COMMON = `你在做《異麒麟》審稿單「要改」條目的改稿（2026-09-24 作者圈選 N0509–N0530，共 22 條，全在同一份初稿）。背景：
- 審稿單是一份雲端頁面，每條是一位代理人找出、另一位懷疑者回原檔反駁後留下的「描述通病」，作者看過按了「要改」。條目明細（原句 quote、毛病 why、建議改法 fix、類別 cls、行號 line）在 ${ITEMS}，是從審稿單原樣匯出的。類別：A 動作鏈、B 假精確／編出來的細節、C 巧句收尾／翻轉判語、D 旁白搶台詞／重述、H 對話邏輯。建議改法只是建議，作者圈的是「毛病要治」。
- 要改的檔 ${FILE} 是創作初稿（張角線第 2 支／張寧線第 6 支共用，2026-09-23 交稿），還沒轉 JSON，沒有 entryID。格子用「行號＋開頭幾個字」指。改法：直接把初稿那一格的字換成新句，在那一格底下（它掛的 **Sequence …** 或 **Condition …** 行之後）空一行加「> ✏ 2026-09-24 改稿（N編號）：原句 …。理由…」，讓作者看得到改了什麼。這份稿之後整份轉 JSON。前一批作者收下的改稿前例：劇情/180年事件/07月(主)七夕.md、劇情/180年事件/09月(主)填補赤字結算、重陽.md 裡所有「✏ 2026-09-24」註記（grep 得到），照它們的判斷尺度。
- 設計紅線：初稿檔頭〈寫法紅線〉1–6 與檔內各條 ⚠ 註記；劇情/張寧/張寧.md 第六、七、十二節；劇情/張角/張角.md 第二、三節。前一支是 劇情/張角/01 護送.md，後一支是 劇情/張角/03 聚落.md。
- 本案作者的規矩（違反即退）：
  1. 旁白看得見你做什麼、看不見你想什麼：不寫主角內心話、不替玩家下感受或結論、不替角色斷定心裡怎樣（「倒像」「像是」可以，那是觀察）。
  2. 寫結果和狀態，不寫過程；一格裡同一個人的動作最多兩拍；不編精確數目、距離和純造景小細節（數字要有用才寫：下一格會接、機制要算、設定定了、玩家要用的留）。
  3. 作者退過的句型，改稿時不得換個樣子再寫出來：「不是 X，是 Y」翻轉句；否定句收尾造氣氛（「誰也沒有再開口」「從頭到尾沒有動過」「沒有人接話」）；「像……」比喻巧句收尾；收尾加新判語；旁白先把下一格台詞要講的事講掉；選項已經講過的事旁白再講一遍；同一件事隔幾格又講一遍。
  4. 句子寫完整，不斷碎句：旁白一格兩三句、每句大約十九到二十五字、不留五字以下的句子；刪到只剩一句短話撐不起一格，就併進隔壁那格或整格刪。角色台詞一句十五字上下，照那個角色既有的口吻（張寧的口吻見文風指南聲口卡與 既有台詞.py）。
  5. 旁白裡不寫「」引號；改到的旁白格有破折號就順手拿掉。[em7] 省著用：一格至多一個、同一人不連掛。選單前一格不掛表情特效。
  6. 玩家看得到的字不自創單字名詞，東漢稱謂與用詞，不用現代詞；硬紅線詞（五胡亂華、司馬、篡魏、三國歸晉、輪迴、重來、前世）永不進文本。
  7. 只動條目點名的格子；為了接得上非動不可的鄰格可以動，但要講明。不新增角色、不自取變數名或任務代號（稿內留 ＿＿ 的照留）。**Sequence**／**Condition** 行不動，除非整格刪除或併格時要搬到下一格。
  8. 一格可能被好幾條路播到：初稿裡的分流（若 01 entry 2 success／其餘→匯合；選擇 1 檢定成功／失敗、選擇 2→三條匯合）要逐條走，新句在每條路上都讀得通；附錄二那個「程寶、韓梁不在村裡」的版本也要還能照附錄二的換法成立。
- 給作者看的理由用白話短句，講玩家會讀到什麼，不用自創術語。`

const DRAFT_LENSES = [
  { tag: '甲', name: '照單', brief: '以審稿單建議改法（fix）為底，改動越少越好；只有建議會出新毛病、接不上某條路、或撞到規矩與紅線時才偏離，偏離處在 self_check 講明。' },
  { tag: '乙', name: '接戲', brief: '先沿每一條會播到的路，把這一段從目標格前五格讀到後五格，再寫出唸起來最順、最像這場戲原本嗓子的版本；不必照建議的字面，但一定要治好 why 講的毛病。' },
  { tag: '丙', name: '另一條路', brief: '刻意找一個和審稿單建議不同的解法，讓作者有真的不一樣的選擇：建議改寫的，考慮整格刪或併進鄰格；建議刪的，考慮留一個有用的細節或把資訊交給台詞；台詞格換一個角度或語氣。仍須守全部規矩與紅線；若另一條路明顯更差，照樣給出最好的不同版本並在 self_check 說明。' },
]
const STYLE_BRIEF = '讀 給AI看的指南/武俠文風創作指南.md 第四節旁白卡（約第 174–201 行）與張寧、你、雍仔以外相關角色的聲口卡、7.1a–7.1c（約第 490–600 行）、第八節自檢清單，以及 給AI看的指南/武俠文風審校清單.md。逐句查規矩 1–6：內心話、判語、動作鏈、假精確、翻轉句、否定句收尾、比喻巧句收尾、碎句與句長、旁白「」、破折號、em7、單字名詞、時代錯置、口吻像不像這個角色。可把候選句照 md 格式（**旁白:**　句子）寫進 scratchpad 暫存 md，跑 python -X utf8 給AI看的指南/文風節奏檢查.py <暫存檔> 看碎句；台詞格跑 python -X utf8 給AI看的指南/既有台詞.py <角色> 對口吻。'
const LOGIC_BRIEF = '沿初稿的每一條分流把改動格前後五格讀一遍，確認新句在每條路上都接得通、不跟前後矛盾（誰在場、誰說過什麼、東西在不在、第幾天、時間先後、誰做了什麼動作）；附錄二的替換版本（程寶、韓梁不在村裡；第 283 行換成村正）是否還成立。整格刪除或併格的：掛在底下的 **Sequence**／**Condition** 要搬去哪、會不會讓立繪或表情特效狀態出錯、分流標記是否還對。對照檔頭寫法紅線 1–6、檔內 ⚠ 註記、張寧.md 第六、七、十二節與張角.md 第二、三節，確認沒有碰紅線（例如解釋符水、說她是他女兒、她說軟話、揭她生死、主角勸她）。硬紅線詞。'
const BRIEF_BRIEF = '逐條對照審稿單的 why：候選有沒有真的治好那個毛病；有沒有換個樣子又犯同一類或別類毛病（A 動作鏈、B 假精確、C 巧句收尾／翻轉判語、D 旁白搶台詞／重述、H 對話邏輯）；有沒有動到範圍外或不必要的字；有沒有把作者刻意埋的樁弄丟（例如那株草、窗台上那碗符水、靠門靠牆兩排、那孩子、門口的程寶）；理由寫得對不對、白不白、作者看得懂嗎。對照前一批作者收下的 ✏ 2026-09-24 註記（七夕、填補赤字結算重陽兩檔）的判斷尺度。'
const REVIEW_LENSES = [
  { key: 'style', name: '文風', brief: STYLE_BRIEF },
  { key: 'logic', name: '連續性', brief: LOGIC_BRIEF },
  { key: 'brief', name: '審稿單', brief: BRIEF_BRIEF },
]
const VERIFY_LENSES = [
  { key: 'style', name: '文風', brief: STYLE_BRIEF + ' 也要對照審稿單 why，確認毛病治好了、沒有換個樣子再犯。' },
  { key: 'logic', name: '連續性', brief: LOGIC_BRIEF },
]

const CELL = {
  type: 'object',
  properties: {
    entry: { type: 'string', description: '行號＋開頭幾字，如 L49「樹下擺了三口缸」' },
    md_file: { type: 'string' },
    action: { type: 'string', enum: ['replace', 'delete', 'none'] },
    old_text: { type: 'string', description: '初稿那一格現在的文字，逐字，含說話者與 [panel=N]' },
    new_text: { type: 'string', description: 'replace 時整格新文字（含說話者、[panel=N] 與＊（）＊或「」）；delete 留空' },
    rewiring: { type: 'string', description: 'delete／併格時分流標記要不要動、怎麼動；否則空字串' },
    sequence_move: { type: 'string', description: 'delete／併格時底下的 Sequence/Condition 要不要搬、搬去哪；否則空字串' },
  },
  required: ['entry', 'md_file', 'action', 'old_text', 'new_text', 'rewiring', 'sequence_move'],
}
const DRAFT_SCHEMA = {
  type: 'object',
  properties: {
    items: { type: 'array', items: { type: 'object', properties: {
      id: { type: 'string' }, cells: { type: 'array', items: CELL }, reason: { type: 'string' },
    }, required: ['id', 'cells', 'reason'] } },
    approach: { type: 'string' },
    self_check: { type: 'string' },
  },
  required: ['items', 'approach', 'self_check'],
}
const REVIEW_SCHEMA = {
  type: 'object',
  properties: {
    candidates: { type: 'array', items: { type: 'object', properties: {
      label: { type: 'string' },
      items: { type: 'array', items: { type: 'object', properties: {
        id: { type: 'string' }, verdict: { type: 'string', enum: ['pass', 'reject'] }, reason: { type: 'string' },
      }, required: ['id', 'verdict', 'reason'] } },
      overall_rank: { type: 'integer' },
    }, required: ['label', 'items', 'overall_rank'] } },
    grafts: { type: 'string' },
    notes: { type: 'string' },
  },
  required: ['candidates', 'grafts', 'notes'],
}
const SYNTH_SCHEMA = {
  type: 'object',
  properties: {
    items: { type: 'array', items: { type: 'object', properties: {
      id: { type: 'string' },
      cells: { type: 'array', items: CELL },
      reason: { type: 'string' },
      source: { type: 'string', description: '甲／乙／丙／嫁接／重寫' },
      changed_from_reviewed: { type: 'boolean' },
      alternates: { type: 'array', items: { type: 'object', properties: {
        text: { type: 'string' }, angle: { type: 'string' },
      }, required: ['text', 'angle'] } },
    }, required: ['id', 'cells', 'reason', 'source', 'changed_from_reviewed', 'alternates'] } },
    unresolved: { type: 'array', items: { type: 'object', properties: {
      id: { type: 'string' }, issue: { type: 'string' },
    }, required: ['id', 'issue'] } },
    summary: { type: 'string' },
  },
  required: ['items', 'unresolved', 'summary'],
}
const VERIFY_SCHEMA = {
  type: 'object',
  properties: {
    items: { type: 'array', items: { type: 'object', properties: {
      id: { type: 'string' }, verdict: { type: 'string', enum: ['pass', 'reject'] }, reason: { type: 'string' },
    }, required: ['id', 'verdict', 'reason'] } },
  },
  required: ['items'],
}
const AUDIT_SCHEMA = {
  type: 'object',
  properties: {
    ok: { type: 'boolean' },
    issues: { type: 'array', items: { type: 'object', properties: {
      id: { type: 'string' }, problem: { type: 'string' }, fix: { type: 'string' },
    }, required: ['id', 'problem', 'fix'] } },
    summary: { type: 'string' },
  },
  required: ['ok', 'issues', 'summary'],
}

function unitHead(u) {
  return `段落：${u.key}
條目：${u.ids.join('、')}
目標格：${u.cells}
檔案：${FILE}
注意：${u.extra}`
}

function scoutPrompt(u) {
  return `${COMMON}

你是本段的「情境整理」，只讀不改檔。
${unitHead(u)}

請產出一份給起草者與審稿者共用的情境包（markdown，純事實，不提改法），內容：
1. 審稿單條目原文：從 ${ITEMS} 把這幾條的 id、cls、speaker、line、quote、why、fix 逐字抄出。
2. 本段全文：把這一段（含前後段交界各五格）從初稿逐字抄出，保留行號，含 **Sequence**、**Condition**、分流標記與 > 註記。
3. 每一條會播到目標格的路：按分流逐條列出閱讀順序（哪幾格、接哪幾格），註明分流條件；附錄二替換版本會換掉哪些格。
4. 設計紅線與樁：檔頭〈寫法紅線〉與高概念表、檔內跟本段有關的 ⚠ 註記、附錄一的樁、劇情/張寧/張寧.md 第六、七、十二節與 劇情/張角/張角.md 第二、三節裡跟本段有關的條文，逐字抄上（附出處）。前一支 01 護送.md 的結尾、後一支 03 聚落.md 的開頭，與本段有接點的抄上。
5. 口吻：跑 python -X utf8 給AI看的指南/既有台詞.py 張寧，挑十五句最能代表她口吻的原句；本段有台詞被點名的其他角色（你、韓梁、程寶）也各挑幾句（附出處）。再抄 給AI看的指南/武俠文風創作指南.md 張寧聲口卡全文。
6. 其他檔有沒有逐字引用本段被點名的句子：grep 劇情/ 與 @角色設定/（排除 劇情/舊創作稿/），列檔名行號。
7. 同類前例：從 劇情/180年事件/07月(主)七夕.md 與 劇情/180年事件/09月(主)填補赤字結算、重陽.md 的 ✏ 2026-09-24 註記裡，挑三條跟本段毛病同類的，連同改後那一格逐字抄上。
8. 其他起草者一定要知道的事實（例如某個數字或細節後面會被接到；某格底下掛著表情特效、好感或檢定指令）。只寫事實，不下改稿建議。`
}

function draftPrompt(u, packet, lens) {
  return `${COMMON}

你是起草者（${lens.tag}｜${lens.name}）。你的取向：${lens.brief}
${unitHead(u)}

動筆前：依 CLAUDE.md 讀三份指南（至少：給AI看的指南/文本創作指南.md 第零層與 2.1a；給AI看的指南/世界觀.md 第八節；給AI看的指南/武俠文風創作指南.md 第四節旁白卡與張寧等角色聲口卡、7.1a–7.1c、第八節自檢清單）。台詞格先看情境包裡的既有台詞，不夠就自己跑既有台詞.py。有疑問回原檔與設計檔查，不要只信情境包。不要改任何檔案，只交提案。

情境包：
<<<
${packet}
>>>

交件要求：
- 每一條審稿單編號各一筆 items；兩條指同一格時，兩筆的格子改法寫成同一個 new_text，reason 各寫各的。
- cells 裡每個要動的格子一筆：entry（行號＋開頭字）、md_file、action（replace／delete／none）、old_text（初稿那一格現在的文字，逐字）、new_text（replace 時整格新文字，含說話者與 [panel=N]；delete 留空）、rewiring（delete／併格時分流標記怎麼動；否則空字串）、sequence_move（delete／併格時底下的 Sequence／Condition 搬去哪；否則空字串）。
- 為了接得上而動的鄰格也列進 cells，reason 講為什麼。
- reason：寫給作者看的白話理由，一兩句，講改了什麼、為什麼，照前例 ✏ 註記的口氣（不必重抄原句）。
- approach：一句話講你這版的取向。
- self_check：逐條對照規矩 1–8 與設計紅線自檢的結果，以及每條會播到的路讀起來是否通順。`
}

function reviewPrompt(u, packet, drafts, lens) {
  return `${COMMON}

你是審稿者（${lens.name}）。你的關注面：${lens.brief}
${unitHead(u)}

情境包：
<<<
${packet}
>>>

三位起草者的候選（甲＝照單、乙＝接戲、丙＝另一條路）：
<<<
${JSON.stringify(drafts, null, 1)}
>>>

請回原檔與設計檔查證，不要只信情境包或起草者的說法。對每位候選的每一條編號給 verdict：pass 或 reject（駁回）。只要有一個具體毛病就駁回，理由要指出是哪一句哪幾個字、違反哪條規矩或紅線、跟哪一格矛盾；拿不準時偏向駁回，並寫明疑慮。overall_rank 1 最好。grafts：如果某條取甲、某條取乙會更好，或某版的某半句該換成另一版的，具體寫到句子。notes：其他定稿人該知道的事。不要改任何檔案。`
}

function synthPrompt(u, packet, drafts, reviews, prior) {
  const priorBlock = prior ? `
上一版定稿被複核駁回，這次要修：
上一版：
<<<
${JSON.stringify(prior.final.items, null, 1)}
>>>
駁回意見：
<<<
${JSON.stringify(prior.rejects, null, 1)}
>>>
只修被駁回的條目；其餘沿用上一版，除非修改牽動它們。修過的條目 changed_from_reviewed 填 true、source 填「重寫」或「嫁接」。` : ''
  return `${COMMON}

你是本段的定稿人。
${unitHead(u)}

情境包：
<<<
${packet}
>>>

起草候選（甲＝照單、乙＝接戲、丙＝另一條路）：
<<<
${JSON.stringify(drafts, null, 1)}
>>>

審稿意見（文風／連續性／審稿單）：
<<<
${JSON.stringify(reviews, null, 1)}
>>>
${priorBlock}

做法：
1. 每一條編號，取審稿通過票最多的候選（同票看 overall_rank）；審稿者建議的嫁接若合理就接上。接完確定同一段的幾條彼此一致：同一格被兩條編號指到時合成一個 new_text；前後格不互相打架；整段唸起來節奏對。
2. 某條三版都被兩位以上駁回，就依駁回理由自己重寫一版，source 填「重寫」。
3. 自己回原檔把每條路核一次，刪格或併格的 Sequence 搬移要查實。
4. alternates：每條有新寫字的條目（不是純刪字、純刪格），從其他候選挑至多兩個「真的不一樣」的版本（整格新文字＋一句取向），給作者換用；沒有像樣的留空陣列。純刪除的條目留空陣列。
5. unresolved：需要作者拍板、AI 不該自己決定的（例如牽動設計檔、牽動範圍外的戲、設定未定），列出來；沒有就空陣列。定稿仍要給出你建議的做法。
6. changed_from_reviewed：這條定稿跟某位候選一字不差就 false，有嫁接或重寫就 true。
7. summary：三五句白話，講這段怎麼定的、駁回了什麼。
不要改任何檔案。`
}

function verifyPrompt(u, packet, final, lens) {
  return `${COMMON}

你是懷疑者（${lens.name}），任務是想辦法駁倒這份定稿。關注面：${lens.brief}
${unitHead(u)}

情境包：
<<<
${packet}
>>>

定稿：
<<<
${JSON.stringify(final.items, null, 1)}
>>>

對每一條編號給 verdict：pass 或 reject。回原檔與設計檔查證。只駁真的毛病：違反規矩或紅線、接不上某條路、跟前後格矛盾、沒治好 why、換個樣子又犯同類病、刪格或併格的指令搬移錯漏、old_text 跟初稿現況對不上。不駁純個人口味；拿不準的寫進 reason 但給 pass。不要改任何檔案。`
}

function applyPrompt(finals) {
  return `${COMMON}

你是 ${FILE} 的編輯。下面是本檔三段的定稿（每段經過三名起草、三名審稿、兩名複核）。把它們改進初稿，其他字一個都不動。

定稿：
<<<
${JSON.stringify(finals, null, 1)}
>>>

做法：
1. 先 grep「✏ 2026-09-24」看 劇情/180年事件/07月(主)七夕.md 的改稿註記寫法。本檔是初稿、沒有 entryID，註記寫法照它，但不寫 entryID。
2. 改字（replace）：用 Edit 把那一格的文字換成 new_text（說話者標籤與全形空白照舊）。在這一格底下掛的 **Sequence …**／**Condition …** 行之後空一行，加「> ✏ 2026-09-24 改稿（N編號）：原句 <舊文字，逐字，含 [panel=N]>。<reason>」。同一格有兩條編號就合成一條註記（編號用頓號連）。
3. 整格刪除（delete）或併格：刪掉那一格的文字行；它底下的 **Sequence …** 若有指令要保留，照 sequence_move 併進下一格的 **Sequence** 行開頭（下一格沒有就在下一格底下新增一行 **Sequence …**）；在原位置留「> ✏ 2026-09-24 刪除一格（N編號）：原句 …。指令：…。理由：…」。分流標記照 rewiring 調整。
4. 其他檔逐字引用了被改的句子：不動設計檔（@角色設定/、張寧.md、張角.md），列進回報，由作者決定。
5. unresolved 裡的條目：照定稿的建議做法改進去，但在該條 ✏ 註記末尾加「⚠ 待作者定：…」一句。
6. 改完跑 python -X utf8 給AI看的指南/文風節奏檢查.py "${FILE}"，只看你動到的格子有沒有被報；被報的要處理（照規矩改到不報，或在回報裡說明為何留）。
7. 跑 git diff --stat 與 git diff -- "${FILE}"，確認只有預期的改動（注意：另一批代理人同時在改 劇情/179年事件/07月… 與 劇情/180年事件/03月… 兩檔，那兩檔不是你的，不要碰）。
回報：每條編號改了哪一行、刪了哪一格、搬了什麼指令；節奏檢查對改動格的結果；任何沒照定稿做的地方與原因。`
}

function auditPrompt(finals, applyReport, round) {
  return `${COMMON}

你是 ${FILE} 的稽核（第 ${round} 輪），只讀不改檔。編輯已照定稿改進初稿。

定稿：
<<<
${JSON.stringify(finals, null, 1)}
>>>

編輯回報：
<<<
${applyReport}
>>>

查：
1. git diff -- "${FILE}"：每條定稿是否一字不差改進去；有沒有範圍外的改動；✏ 註記格式是否一致（原句逐字、編號、位置在 Sequence／Condition 之後）。
2. 刪格或併格：指令搬移是否正確、立繪與表情特效狀態是否連得上、分流標記是否還對。
3. 把整份初稿沿每一條分流從頭讀到尾（含附錄二的替換版本），確認讀起來通、沒有新矛盾、沒有新的描述通病、沒有碰檔頭寫法紅線。
4. 跑 python -X utf8 給AI看的指南/文風節奏檢查.py "${FILE}"，改動格不得有未說明的報告。
ok：沒有問題時 true。issues：每個問題一筆（id 填條目編號或「格式」、problem、fix：具體改法）。summary：兩三句。`
}

function fixPrompt(finals, audit) {
  return `${COMMON}

你是 ${FILE} 的修正編輯。稽核在初稿裡找到下列問題，逐條照 fix 修（若你查證後認為 fix 本身錯了，照規矩修對並說明）。其他字不動；另兩份月檔不是你的，不要碰。

稽核問題：
<<<
${JSON.stringify(audit.issues, null, 1)}
>>>

定稿（對照用）：
<<<
${JSON.stringify(finals, null, 1)}
>>>

修完跑 python -X utf8 給AI看的指南/文風節奏檢查.py "${FILE}" 與 git diff -- "${FILE}"。回報每條怎麼修的。`
}

async function runUnit(u) {
  const packet = await agent(scoutPrompt(u), { label: `scout:${u.key}`, phase: 'Scout' })
  if (!packet) return { unit: u.key, error: 'scout failed' }
  const drafts = (await parallel(DRAFT_LENSES.map(l => () =>
    agent(draftPrompt(u, packet, l), { label: `draft-${l.tag}:${u.key}`, phase: 'Draft', schema: DRAFT_SCHEMA })
      .then(r => r ? { label: l.tag, lens: l.name, ...r } : null)))).filter(Boolean)
  if (!drafts.length) return { unit: u.key, error: 'all drafts failed' }
  const reviews = (await parallel(REVIEW_LENSES.map(l => () =>
    agent(reviewPrompt(u, packet, drafts, l), { label: `review-${l.key}:${u.key}`, phase: 'Review', schema: REVIEW_SCHEMA })
      .then(r => r ? { lens: l.name, ...r } : null)))).filter(Boolean)
  let final = await agent(synthPrompt(u, packet, drafts, reviews, null), { label: `synth:${u.key}`, phase: 'Synthesize', schema: SYNTH_SCHEMA })
  if (!final) return { unit: u.key, error: 'synth failed', drafts, reviews }
  const history = []
  for (let round = 0; round < 3; round++) {
    const verdicts = (await parallel(VERIFY_LENSES.map(l => () =>
      agent(verifyPrompt(u, packet, final, l), { label: `verify-${l.key}-r${round + 1}:${u.key}`, phase: 'Verify', schema: VERIFY_SCHEMA })
        .then(r => r ? { lens: l.name, ...r } : null)))).filter(Boolean)
    const rejects = verdicts.flatMap(v => (v.items || []).filter(i => i.verdict === 'reject').map(i => ({ ...i, lens: v.lens })))
    history.push({ round: round + 1, rejects })
    if (!rejects.length) break
    if (round === 2) {
      final.unresolved = [...(final.unresolved || []), ...rejects.map(r => ({ id: r.id, issue: `複核三輪仍駁回（${r.lens}）：${r.reason}` }))]
      break
    }
    log(`${u.key}：複核第 ${round + 1} 輪駁回 ${rejects.length} 條（${[...new Set(rejects.map(r => r.id))].join('、')}），退回重寫`)
    const revised = await agent(synthPrompt(u, packet, drafts, reviews, { final, rejects }), { label: `resynth-r${round + 1}:${u.key}`, phase: 'Synthesize', schema: SYNTH_SCHEMA })
    if (revised) final = revised
  }
  const reviewBrief = reviews.map(r => ({
    lens: r.lens,
    tally: (r.candidates || []).map(c => `${c.label}:${(c.items || []).filter(i => i.verdict === 'pass').length}過/${(c.items || []).filter(i => i.verdict === 'reject').length}駁`).join(' '),
  }))
  log(`${u.key}：定稿完成（${final.items.map(i => i.id + '←' + i.source).join('、')}）`)
  return { unit: u.key, final, reviewBrief, verifyHistory: history }
}

const results = (await parallel(UNITS.map(u => () => runUnit(u)))).filter(Boolean)
const finals = results.filter(r => r.final).map(r => ({ unit: r.unit, items: r.final.items, unresolved: r.final.unresolved }))
let applyReport = null, audit = null, fixReport = null, audit2 = null
if (finals.length) {
  applyReport = await agent(applyPrompt(finals), { label: 'apply:黃巾村', phase: 'Apply' })
  audit = await agent(auditPrompt(finals, applyReport || '（編輯沒有回報）', 1), { label: 'audit-1:黃巾村', phase: 'Audit', schema: AUDIT_SCHEMA })
  if (audit && !audit.ok && audit.issues && audit.issues.length) {
    log(`黃巾村：稽核找到 ${audit.issues.length} 個問題，送修`)
    fixReport = await agent(fixPrompt(finals, audit), { label: 'fix:黃巾村', phase: 'Audit' })
    audit2 = await agent(auditPrompt(finals, (applyReport || '') + '\n\n修正回報：\n' + (fixReport || ''), 2), { label: 'audit-2:黃巾村', phase: 'Audit', schema: AUDIT_SCHEMA })
  }
}
return {
  file: FILE,
  units: results.map(r => ({ unit: r.unit, error: r.error, final: r.final, reviewBrief: r.reviewBrief, verifyHistory: r.verifyHistory })),
  applyReport, audit, fixReport, audit2,
}
