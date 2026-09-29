export const meta = {
  name: 'liuxin-and-rulings-b',
  description: '留信 6 條＋五原障兩件裁示（撤射馬分歧、補回程轉場）：每場三名起草、三名審稿駁回、綜合定稿、兩名複核，再改進 md 並稽核',
  phases: [
    { title: 'Scout', detail: '每場整理情境包：原句、JSON 連線、每條路的前後文、孿生格、聲口' },
    { title: 'Draft', detail: '每場三名起草者：照單／接戲／另一條路' },
    { title: 'Review', detail: '每場三名審稿者：文風／連續性／審稿單，逐條通過或駁回' },
    { title: 'Synthesize', detail: '綜合勝出版本與嫁接；全被駁回的重寫' },
    { title: 'Verify', detail: '兩名懷疑者複核定稿，不過就退回重寫（最多兩輪）' },
    { title: 'Apply', detail: '每個檔一名編輯改進 md、寫 ✏ 註記' },
    { title: 'Audit', detail: '每個檔獨立稽核 diff，有錯就修再稽核' },
  ],
}

const ITEMS = 'C:/Users/user/AppData/Local/Temp/claude/d--QilinStory/90185aca-633d-4b94-9884-c66314379f5f/scratchpad/items_b.json'
const FW = '劇情/呂信/05 五原障.md'
const JW = 'Json/呂信線/五原障.json'
const WX = '本檔是呂信線第五支的創作稿，已轉成 Json/呂信線/五原障.json（還沒進 Unity，作者說審完稿再一起匯入），md 沒有 entryID：改 md，✏ 註記寫出對應的 JSON entryID。呂信的口吻照文風指南呂信卡與既有台詞（他愛馬、只演動作）；檔頭高概念與各 ⚠ 註記是設計紅線（答案不在別人身上、三個對照都不是解答）。md 裡有些格掛著 Script／Sequence，刪格要照 JSON 搬。'
const FB = '劇情/蕭靈犀/01 儺隊過街.md'
const JB = 'Json/蕭靈犀線/01儺隊過街.json'
const FQ = '劇情/英豪府/英豪府遴選/06 對話氣泡.md'
const JQ = 'Json/英豪府遴選/對話氣泡.json'
const FL = '劇情/呂信/06 留信.md'
const JL = 'Json/呂信線/留信.json'
const LX = '本檔是呂信線第六支〈留信〉的創作稿，已有對應 JSON（Json/呂信線/留信.json，查實後再下筆；若 md 沒 entryID，✏ 註記寫出對應的 JSON entryID）。本檔已有同日上一輪的改動（§2-D 整段刪除、✏ 2026-09-25 T1 註記），稽核時不算範圍外。呂信的口吻照文風指南呂信卡與既有台詞；這是他留信離開前最後一場，檔頭與 ⚠ 註記是設計紅線（不點破、不解釋「五原沒有江」）。'
const UW = [
  { key: '五原障-撤射馬分歧與補轉場', file: FW, json: [JW], ids: ['T8','T9'], cells: '§2 #123、§8 #3005／#3105、附錄一；§8 結尾補轉場、#442', extra: WX + ' 本檔已有同日審稿單那批與 T1–T6 的改動與 ✏ 註記，稽核時不算範圍外。' },
]
const UB = [
  { key: '留信', file: FL, json: [JL], ids: ['N0335','N0336','N0337','N0339','N0340','N0341','N0338'], cells: '§2-A 尾格、§2-C 老兵的話、§2-附一「跟五原那幾次一樣的手勁」、§3「五原沒有江」、結尾「小子，替我看著」', extra: LX },
]
const COMMON = `你在做《異麒麟》審稿單「要改」條目的改稿（這一輪有兩種：審稿單條目 N0335–N0341，全在 劇情/呂信/06 留信.md；以及作者 2026-09-25 對五原障的兩件裁示 T8、T9，明細檔裡的 why 是作者裁示原話，fix 是建議做法。N0338 所在的 §2-D 上一輪已整段刪除，不用再改）。背景：
- 審稿單是一份雲端頁面，每條是一位代理人找出、另一位懷疑者回原檔反駁後留下的「描述通病」，作者看過按了「要改」。條目明細（原句 quote、毛病 why、建議改法 fix、類別 cls、錨點 entry）在 ${ITEMS}，是從審稿單原樣匯出的。類別：A 動作鏈、B 假精確／編出來的細節、C 巧句收尾／翻轉判語、D 旁白搶台詞／重述、G 括號選項預寫結果、H 對話邏輯。建議改法只是建議，作者圈的是「毛病要治」。
- 檔案有兩種，看各場的「注意」：①文案總覽稿（檔頭寫由 Json/ 回讀產生，或 md 帶 entryID）：直接把 md 那一格的字換成新句，緊接那一格下面加「> ✏ 2026-09-25 改稿（N編號）：原句 …。理由…」；整格刪除用「> ✏ 2026-09-25 **刪除 #N**（N編號）：原句 …。連線：…。 指令：…。 理由：…」取代那一格。②已轉過 JSON 的創作稿（md 沒有 entryID，但 Json/ 裡有對應檔）：同樣直接改 md、加 ✏ 註記，註記裡要寫出對應的 JSON entryID（用原句去 JSON 找），刪格時連線與指令也寫 JSON 的實況。之後另有代理人照 ✏ 註記去改 JSON，所以連線與指令要從 JSON 查實。作者已收下的前例：劇情/180年事件/07月(主)七夕.md、劇情/黑鐵嶺礦坑/黑鐵嶺礦坑.md、劇情/張角/02 黃巾村.md 裡的「✏ 2026-09-24」「✏ 2026-09-25」註記（grep 得到），照它們的寫法與判斷尺度。
- 只治作者圈的這 24 條。同一區審稿單還有作者沒圈的條目，它們點到的毛病不在範圍，不要順手改。
- 本案作者的規矩（違反即退）：
  1. 旁白看得見你做什麼、看不見你想什麼：不寫主角內心話、不替玩家下感受或結論、不替角色斷定心裡怎樣（「倒像」「像是」可以，那是觀察）。
  2. 寫結果和狀態，不寫過程；一格裡同一個人的動作最多兩拍；不編精確數目、距離和純造景小細節（數字要有用才寫）。
  3. 作者退過的句型，改稿時不得換個樣子再寫出來：「不是 X，是 Y」翻轉句；否定句收尾造氣氛（「誰也沒有再開口」「從頭到尾沒有動過」「沒有人收」）；「像……」比喻巧句收尾（「像有人替他們排過」）；收尾加新判語；旁白先把下一格台詞要講的事講掉；選項已經講過的事旁白再講一遍；同一件事隔幾格又講一遍。
  4. 句子寫完整，不斷碎句：旁白一格兩三句、每句大約十九到二十五字、不留五字以下的句子；刪到只剩一句短話撐不起一格，就併進隔壁那格或整格刪。角色台詞一句十五字上下，照那個角色既有的口吻。
  5. 旁白裡不寫「」引號；改到的旁白格有破折號就順手拿掉。[em7] 省著用：一格至多一個、同一人不連掛，只掛立繪演不出來又非交代不可的那一下。
  6. 玩家看得到的字不自創單字名詞（天機盤不縮成盤、帳冊不縮成帳）；東漢稱謂與用詞，不用現代詞；硬紅線詞（五胡亂華、司馬、篡魏、三國歸晉、輪迴、重來、前世）永不進文本。
  7. 只動條目點名的格子；為了接得上非動不可的鄰格可以動，但要講明。不新增節點、不動 title、不自取變數名或任務代號。Sequence／Script／Conditions 不動，除非整格刪除時要搬到下一格（照前例）。
  8. 一格可能被好幾條路播到：查 JSON 的 links（誰連進來、連去哪），新句要在每條路上都讀得通；07 月檔有「有娜娜／沒娜娜」兩套逐字幾乎相同的節點，改一套要查另一套該不該一起改。
- 給作者看的理由用白話短句，講玩家會讀到什麼，不用自創術語。`

const DRAFT_LENSES = [
  { tag: '甲', name: '照單', brief: '以審稿單建議改法（fix）為底，改動越少越好；只有建議會出新毛病、接不上某條路、或撞到規矩時才偏離，偏離處在 self_check 講明。' },
  { tag: '乙', name: '接戲', brief: '先沿每一條會播到的路，把這場戲從目標格前五格讀到後五格，再寫出唸起來最順、最像這場戲原本嗓子的版本；不必照建議的字面，但一定要治好 why 講的毛病。' },
  { tag: '丙', name: '另一條路', brief: '刻意找一個和審稿單建議不同的解法，讓作者有真的不一樣的選擇：建議改寫的，考慮整格刪或併進鄰格；建議刪的，考慮留一個有用的細節或把資訊交給台詞；台詞格換一個角度或語氣。仍須守全部規矩；若另一條路明顯更差，照樣給出最好的不同版本並在 self_check 說明。' },
]
const STYLE_BRIEF = '讀 給AI看的指南/武俠文風創作指南.md 第四節旁白卡（約第 174–201 行）與本場角色的聲口卡、7.1a–7.1c（約第 490–600 行）、7.3 選項、第八節自檢清單，以及 給AI看的指南/武俠文風審校清單.md。逐句查規矩 1–6：內心話、判語、動作鏈、假精確、翻轉句、否定句收尾、比喻巧句收尾、碎句與句長、旁白「」、破折號、em7、單字名詞、時代錯置、口吻像不像這個角色。可把候選句照 md 格式（**旁白:**`#N`　句子）寫進 scratchpad 暫存 md，跑 python -X utf8 給AI看的指南/文風節奏檢查.py <暫存檔> 看碎句；台詞格跑 python -X utf8 給AI看的指南/既有台詞.py <角色> 對口吻。'
const LOGIC_BRIEF = '打開對應 JSON，查每個被動到的格子：誰連進來（所有 parent）、連去哪、Conditions、Sequence、Script、Description。沿每一條會播到這格的路把前後五格讀一遍，確認新句在每條路上都接得通、不跟前後矛盾（人數、誰在場、誰說過什麼、東西在不在、時間先後）。孿生格有沒有一起處理、該不該一起處理。整格刪除的：連線改法是否正確完整、Sequence／Script／Description 有沒有東西要搬、搬去哪會不會出事（例如收背景、收立繪、任務、好感指令）。饕餮段查 @角色設定/饕餮.md 第十節廢案清單與停用術語；硬紅線詞。'
const BRIEF_BRIEF = '逐條對照審稿單的 why：候選有沒有真的治好那個毛病；有沒有換個樣子又犯同一類或別類毛病（A 動作鏈、B 假精確、C 巧句收尾／翻轉判語、D 旁白搶台詞／重述、G 括號選項預寫結果、H 對話邏輯）；有沒有動到範圍外或不必要的字；理由寫得對不對、白不白、作者看得懂嗎。對照前一批作者收下的 ✏ 2026-09-24 註記（七夕、填補赤字結算重陽兩檔）的判斷尺度。'
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
    entry: { type: 'string', description: '如 #341' },
    md_file: { type: 'string' },
    action: { type: 'string', enum: ['replace', 'delete', 'none'] },
    old_text: { type: 'string', description: 'md 那一格現在的文字，逐字，含 [panel=N] 前綴' },
    new_text: { type: 'string', description: 'replace 時整格新文字（含 [panel=N] 前綴與＊（）＊或「」）；delete 留空' },
    rewiring: { type: 'string', description: 'delete 時從 JSON 查實的連線改法；否則空字串' },
    sequence_move: { type: 'string', description: 'delete 時 Sequence/Script/Description 要不要搬、搬去哪；否則空字串' },
  },
  required: ['entry', 'md_file', 'action', 'old_text', 'new_text', 'rewiring', 'sequence_move'],
}
const DRAFT_SCHEMA = {
  type: 'object',
  properties: {
    items: { type: 'array', items: { type: 'object', properties: {
      id: { type: 'string' },
      cells: { type: 'array', items: CELL },
      reason: { type: 'string' },
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
        id: { type: 'string' },
        verdict: { type: 'string', enum: ['pass', 'reject'] },
        reason: { type: 'string' },
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
      id: { type: 'string' },
      verdict: { type: 'string', enum: ['pass', 'reject'] },
      reason: { type: 'string' },
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
  return `場次：${u.key}
條目：${u.ids.join('、')}
目標格：${u.cells}
md：${u.file}
JSON：${u.json.join('、')}
${u.extra ? '注意：' + u.extra : ''}`
}

function scoutPrompt(u) {
  return `${COMMON}

你是本場的「情境整理」，只讀不改檔。
${unitHead(u)}

請產出一份給起草者與審稿者共用的情境包（markdown，純事實，不提改法），內容：
1. 審稿單條目原文：從 ${ITEMS} 把這幾條的 id、cls、entry、speaker、quote、why、fix 逐字抄出。
2. 每個目標格：md 裡的行號與整格原文（說話者行、entryID、[panel=N]、以及底下的 Sequence／Script／Conditions／註記／分流各行，逐字）。
3. JSON 事實：每個目標格在 JSON 裡的 actorID、text、Conditions、Sequence、Script、Description、links；以及所有 links 指向它的 parent 格（entryID、說話者、text 全文）。
4. 每一條會播到目標格的路：沿 JSON 往前讀至少五格、往後讀至少五格（遇到分流就分路列，註明分流條件），按閱讀順序列出每格的 entryID、說話者與全文。這是判斷「接不接得上」的依據，要完整。
5. 孿生格：同一份 JSON 裡 text 相同或幾乎相同的其他格（07 月檔有有娜娜／沒娜娜兩套），列 entryID、差別、它自己的前後文。另外 grep 劇情/（排除 劇情/舊創作稿/）看有沒有別的 md 也有同一句，列檔名與行號。
6. 台詞格（說話者不是旁白）：跑 python -X utf8 給AI看的指南/既有台詞.py <角色名或 actorID>，挑十到十五句最能代表他口吻的原句抄上（附出處）。role 開頭的路人列出他在本檔說過的每一句。
7. 同類前例：從 劇情/180年事件/07月(主)七夕.md 與 劇情/180年事件/09月(主)填補赤字結算、重陽.md 的 ✏ 2026-09-24 註記裡，挑兩三條跟本場毛病同類的，連同改後的那一格逐字抄上。
8. 其他起草者一定要知道的事實（例如某格掛著任務、好感、收背景指令不能隨便刪；某件東西後面會用到；檔末疑點表提過這格；設定檔對這段的要求）。只寫事實，不下改稿建議。`
}

function draftPrompt(u, packet, lens) {
  return `${COMMON}

你是起草者（${lens.tag}｜${lens.name}）。你的取向：${lens.brief}
${unitHead(u)}

動筆前：依 CLAUDE.md 讀三份指南（至少：給AI看的指南/文本創作指南.md 第零層與 2.1a；給AI看的指南/世界觀.md 第八節；給AI看的指南/武俠文風創作指南.md 第四節旁白卡與本場角色聲口卡、7.1a–7.1c、第八節自檢清單）。台詞格先看情境包裡的既有台詞，不夠就自己跑既有台詞.py。有疑問回原檔、原 JSON 查，不要只信情境包。不要改任何檔案，只交提案。

情境包：
<<<
${packet}
>>>

交件要求：
- 每一條審稿單編號各一筆 items；兩條指同一格時，兩筆的格子改法寫成同一個 new_text，reason 各寫各的。
- cells 裡每個要動的格子一筆：entry、md_file、action（replace／delete／none）、old_text（md 那一格現在的文字，逐字，含 [panel=N] 前綴）、new_text（replace 時是整格新文字，含 [panel=N] 前綴與＊（）＊或「」；delete 留空）、rewiring（delete 時從 JSON 查實：誰原本連到它、改連誰，有條件分流要講明；否則空字串）、sequence_move（delete 時：它的 Sequence／Script／Description 有什麼、要不要搬、搬去哪；否則空字串）。
- 為了接得上而動的鄰格、要一起改的孿生格、其他 md 裡的同一句，也列進 cells，reason 講為什麼。
- reason：寫給作者看的白話理由，一兩句，講改了什麼、為什麼，照前例 ✏ 註記的口氣（不必重抄原句）。
- approach：一句話講你這版的取向。
- self_check：逐條對照規矩 1–8 自檢的結果，以及每條會播到的路讀起來是否通順。`
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

請回原檔、原 JSON 查證，不要只信情境包或起草者的說法。對每位候選的每一條編號給 verdict：pass 或 reject（駁回）。只要有一個具體毛病就駁回，理由要指出是哪一句哪幾個字、違反哪條規矩或跟哪一格矛盾；拿不準時偏向駁回，並寫明你的疑慮。overall_rank 1 最好。grafts：如果某條取甲、某條取乙會更好，或某版的某半句該換成另一版的，具體寫到句子。notes：其他定稿人該知道的事。不要改任何檔案。`
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

你是本場的定稿人。
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
1. 每一條編號，取審稿通過票最多的候選（同票看 overall_rank）；審稿者建議的嫁接若合理就接上。接完確定同一場的幾條彼此一致：同一格被兩條編號指到時合成一個 new_text；前後格不互相打架；孿生格與其他 md 的同一句跟著一致。
2. 某條三版都被兩位以上駁回，就依駁回理由自己重寫一版，source 填「重寫」。
3. 自己回原檔、原 JSON 把每條路核一次，刪格的連線與指令搬移要查實。
4. alternates：每條有新寫字的條目（不是純刪字、純刪格），從其他候選挑至多兩個「真的不一樣」的版本（整格新文字＋一句取向），給作者換用；沒有像樣的留空陣列。純刪除的條目留空陣列。
5. unresolved：需要作者拍板、AI 不該自己決定的（例如要不要點出某人、牽動範圍外的戲、設定未定），列出來；沒有就空陣列。定稿仍要給出你建議的做法。
6. changed_from_reviewed：這條定稿跟某位候選一字不差就 false，有嫁接或重寫就 true。
7. summary：三五句白話，講這場怎麼定的、駁回了什麼。
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

對每一條編號給 verdict：pass 或 reject。回原檔、原 JSON 查證。只駁真的毛病：違反規矩、接不上某條路、跟前後格矛盾、沒治好 why、換個樣子又犯同類病、刪格的連線或指令搬移錯漏、old_text 跟 md 現況對不上。不駁純個人口味；拿不準的寫進 reason 但給 pass。不要改任何檔案。`
}

function applyPrompt(file, finals) {
  return `${COMMON}

你是 ${file} 的編輯。下面是本檔所有場次的定稿（每場經過三名起草、三名審稿、兩名複核）。把它們改進 md，其他字一個都不動。

定稿：
<<<
${JSON.stringify(finals, null, 1)}
>>>

做法：
1. 先 grep「✏ 2026-09-24」看 劇情/180年事件/07月(主)七夕.md 與 劇情/180年事件/09月(主)填補赤字結算、重陽.md 的改稿與刪除寫法，完全照做。
2. 改字（replace）：用 Edit 把那一格那一行的文字換成 new_text（說話者、\`#N\`、全形空白照舊）。在這一格所有附屬行（- Sequence／- Script／- Conditions／- 註記／- 分流 等）之後空一行，加「> ✏ 2026-09-25 改稿（N編號）：原句 <舊文字，逐字，含 [panel=N]>。<reason>」。同一格有兩條編號就合成一條註記（編號用頓號連）。
3. 整格刪除（delete）：先打開 JSON 核對 rewiring 與 sequence_move。把那一格整塊（說話者行加附屬行）換成「> ✏ 2026-09-25 **刪除 \`#N\`**（N編號）：原句 …。連線：…。 指令：…。 理由：…」。有指令搬到下一格的：把下一格的 - Sequence 行改成搬過去後的樣子（搬來的放開頭），並在它附屬行最後加「- ✏ 2026-09-25：原 \`#N\` 的…搬到這格開頭（\`#N\` 已刪）」。md 裡其他寫著「→ 接 \`#N\`」或「分流 … → \`#N\`」指向被刪格的行，改成新的去處。
4. 某格有文字併進鄰格（例如把一句併進上一格）：鄰格照 replace 寫法改字並加 ✏ 註記，被併掉的格照 delete 寫法。
5. 孿生格、其他 md（例如 劇情/DEMO結局.md）照定稿一起改；其他 md 也在那一句下面加一行同格式的 ✏ 註記。
6. 不動 Json/（另有代理人轉 JSON）、不動檔頭統計、不動檔末疑點表（除非定稿點名）。
7. unresolved 裡的條目：照定稿的建議做法改進去，但在該條 ✏ 註記末尾加「⚠ 待作者定：…」一句。
8. 改完跑 python -X utf8 給AI看的指南/文風節奏檢查.py "<檔>"（有動 劇情/DEMO結局.md 也跑它），只看你動到的格子有沒有被報；被報的要處理（照規矩改到不報，或在回報裡說明為何留）。
9. 跑 git diff --stat 與 git diff -- "<檔>"，確認只有預期的改動。
回報：每條編號改了哪一行、刪了哪一格、搬了什麼指令；節奏檢查對改動格的結果；任何沒照定稿做的地方與原因。`
}

function auditPrompt(file, finals, applyReport, round) {
  return `${COMMON}

你是 ${file} 的稽核（第 ${round} 輪），只讀不改檔。編輯已照定稿改進 md。

定稿：
<<<
${JSON.stringify(finals, null, 1)}
>>>

編輯回報：
<<<
${applyReport}
>>>

查：
1. git diff -- "${file}"：每條定稿是否一字不差改進去；有沒有範圍外的改動；✏ 註記格式是否跟前例（七夕、填補赤字結算重陽兩檔）一致：原句逐字、編號、位置、刪除格的連線與指令寫法。
2. 刪除格：對 JSON 核 rewiring 是否正確完整、指令搬移是否寫到下一格、md 裡指向被刪格的「→ 接」「分流」是否改好。
3. 把每個改動過的場面沿每條路從前五格讀到後五格，確認讀起來通、沒有新矛盾、沒有新的描述通病。
4. 跑 python -X utf8 給AI看的指南/文風節奏檢查.py "${file}"，改動格不得有未說明的報告。
ok：沒有問題時 true。issues：每個問題一筆（id 填條目編號或「格式」、problem、fix：具體改法）。summary：兩三句。`
}

function fixPrompt(file, finals, audit) {
  return `${COMMON}

你是 ${file} 的修正編輯。稽核在 md 裡找到下列問題，逐條照 fix 修（若你查證後認為 fix 本身錯了，照規矩修對並說明）。其他字不動，不動 Json/。

稽核問題：
<<<
${JSON.stringify(audit.issues, null, 1)}
>>>

定稿（對照用）：
<<<
${JSON.stringify(finals, null, 1)}
>>>

修完跑 python -X utf8 給AI看的指南/文風節奏檢查.py "${file}" 與 git diff -- "${file}"。回報每條怎麼修的。`
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
  let verdicts = []
  const history = []
  for (let round = 0; round < 3; round++) {
    verdicts = (await parallel(VERIFY_LENSES.map(l => () =>
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
  return { unit: u.key, file: u.file, final, reviewBrief, verifyHistory: history }
}

async function runFile(file, units) {
  const results = (await parallel(units.map(u => () => runUnit(u)))).filter(Boolean)
  const good = results.filter(r => r.final)
  const finals = good.map(r => ({ unit: r.unit, items: r.final.items, unresolved: r.final.unresolved }))
  if (!finals.length) return { file, results, error: 'no finals' }
  const applyReport = await agent(applyPrompt(file, finals), { label: `apply:${file.split('/').pop()}`, phase: 'Apply' })
  let audit = await agent(auditPrompt(file, finals, applyReport || '（編輯沒有回報）', 1), { label: `audit-1:${file.split('/').pop()}`, phase: 'Audit', schema: AUDIT_SCHEMA })
  let fixReport = null, audit2 = null
  if (audit && !audit.ok && audit.issues && audit.issues.length) {
    log(`${file}：稽核找到 ${audit.issues.length} 個問題，送修`)
    fixReport = await agent(fixPrompt(file, finals, audit), { label: `fix:${file.split('/').pop()}`, phase: 'Audit' })
    audit2 = await agent(auditPrompt(file, finals, (applyReport || '') + '\n\n修正回報：\n' + (fixReport || ''), 2), { label: `audit-2:${file.split('/').pop()}`, phase: 'Audit', schema: AUDIT_SCHEMA })
  }
  return {
    file,
    units: results.map(r => ({ unit: r.unit, error: r.error, final: r.final, reviewBrief: r.reviewBrief, verifyHistory: r.verifyHistory })),
    applyReport, audit, fixReport, audit2,
  }
}

const out = await parallel([() => runFile(FW, UW), () => runFile(FL, UB)])
return { files: out }
