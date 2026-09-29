export const meta = {
  name: 'hard-check-v3',
  description: '創作流程母版第三級（2026-09-29）：產生器情境包、串行起草（乙丙須與前版不同）、差異判定、審修只管結構、文風審∥邏輯審（只列不改）、終審套表並用腳本組提案檔',
  phases: [
    { title: 'Scout', detail: '一素材範圍一名（high）：先跑情境包產生器與指南摘錄，再補來路條件、兌現處候選、坑' },
    { title: 'Draft', detail: '每場三名串行（xhigh）：甲先寫；乙讀甲的對話、必須不同；丙讀甲乙、必須都不同；乙丙附差異表' },
    { title: 'Diff', detail: '一名差異判定（medium）：三版兩兩對照，太近的退回重寫一次' },
    { title: 'Revise', detail: '每版一名審修（high）：只管結構八項，直接修，記錄改動' },
    { title: 'Style', detail: '每版一名文風審（max）：逐格填表、對專名表與審校清單、直接改字，腳本零警告' },
    { title: 'Logic', detail: '每版一名邏輯審（max）：只列不改，回一張「哪一格、什麼問題、建議改法」的表' },
    { title: 'Final', detail: '每場一名終審（high）：套邏輯表、重查結構、挑建議版、用組裝腳本寫提案檔、跑檢查' },
  ],
}

// 用法：Workflow({scriptPath: '.claude/wf/hard-check-v3.js', args: {date: '2026-09-29', only: [...], have: {醉漢: {packet: true, drafts: ['甲']}}}})
// args.date 必填；args.only 只跑幾場；args.have 沿用舊 run 的情境包／起草稿；args.hc 換暫存目錄；args.model 換模型（預設 opus）。
// 新用途照本檔改：換 GUIDE、COMMON 的規則摘要、UNITS_ALL（每場的 json／anchors／speakers／spec／lenses／checks）；流程與各步驟提示不動。
const A = Object.assign({ date: '＿＿＿＿-＿＿-＿＿', only: null, have: {}, hc: 'C:/Users/user/AppData/Local/Temp/claude/d--QilinStory/2763cd3e-a10e-42a0-a37e-d3d36ccb7999/scratchpad/hc' }, args || {})
const DATE = A.date
const MODEL = A.model || 'opus'   // 作者 2026-09-26：子 agent 一律 Opus 5.5
const HC = A.hc
const GUIDE = '給AI看的指南/高難度檢定走向指南.md'
const FLOW = '給AI看的指南/多Agent創作流程.md'
const GEN = '給AI看的指南/情境包產生器.py'
const ASSEMBLE = '給AI看的指南/提案檔組裝.py'
const RHYTHM = '給AI看的指南/文風節奏檢查.py'
const FORMATCHK = '給AI看的指南/高難度檢定檢查.py'
const EXCERPT = `${HC}/common/指南摘錄.md`

const COMMON = `你在做《異麒麟》高難度檢定的提案（${DATE} 規則，走向指南現行版）。規矩全在 ${GUIDE}：第一節三個分類與〈選項格式〉、第四節引擎寫法、第五節走向細則、第六節規則十三條、第七之二節指引（骰子亮）、第十一節〈已定場次清單〉與〈執筆 agent 通用規則〉。本提示只摘要，拿不準翻指南那一節（情境包與指南摘錄裡都有原文）。
- 什麼叫高難度檢定：在既有選單旁邊加一個高難度擲骰選項，過或不過至少有一邊跟原本的分支不同。難度作者填，稿內留 ＿＿ 或用清單給的暫定值。
- 選項格式（已定）：檢定標籤＋題語，選單上沒有主角的話、不加引號、不出現分類名：福禍 [em2][威嚇檢定][/em2][em3]禍兮福倚，福兮禍伏[/em3]；未卜 [em2][洞悉檢定][/em2][em3]知其一，不知其二[/em3]；轉機 [em2][厚黑檢定][/em2][em3]置之死地，而後生[/em3]。檢定名只用遊戲既有標籤（口才檢定＝PersuasionCheck，沒有「說服檢定」）。題語一類一句、全案不改字。真正的話在擲骰之後的主角發言格才講。
- 同種並排（作者 2026-09-27）：福禍、未卜一定跟同一種的一般檢定並排在同一個選單；選單裡沒有的，連一般難度那一項一起加；沒有選單的場新開一個選單。轉機除外。
- 福禍：過＝該對話一般檢定的三倍專長經驗（一般 +10 → +30）＋福（新分支）；不過＝禍，一條新分支，不是原本的失敗換說法，也不能像同選單一般檢定的失敗；三版的禍是三種（甲 對方怎麼看你／乙 同伴或旁人／丙 出乎意料）；代價可落好感、錢、面子、路線或後續機會。禍不死人、不留殘、不關線，除非已定場次清單那一列寫明作者破例。
- 未卜：過＝額外的情報帶來額外的獎勵（沒有這一骰就不存在的錢、物、把柄、或一條原本沒有的路）＋一個機會點 ModifyData(ChancePoint,1)；把本來就會拿到的東西提早給、跳過本來要走的關、直接給謎底，都不算。不過＝回到原本檢定失敗那條。變數用作者給的 IsHiddenN，兌現＝探險事件或 [em2][隱藏選項][/em2] 掛 Conditions: Variable["IsHiddenN"] == true;。
- 轉機：只在打輸會關門的戰鬥之後；選單至少兩項：轉機選項＋「離開」（接回原失敗線）。過＝另一種戰鬥勝利（任務照成功、進度變數照勝利線走、對話裡的獎勵照拿、沒有引擎戰鬥獎勵），接回勝利線的無條件格，之後一格不動；不過＝先 ModifyData(Coin,-200)、不寫解釋台詞，再接回原失敗線。
- 引擎寫法（違反即退）：一個選項一顆骰，自己接一個擲骰格。結構照 劇情/轉成json指南.md §4.2：選項格（actorID MC1，Description「選項N」）→ 擲骰格（actorID 0、text 空、Description「〈名〉檢定」、Sequence 四段：SetContinueMode(false);SetContinueMode(original)@Message(EndRoll);Continue()@Message(EndRoll);BeginDiceRoll(Manual,〈FeatID〉,〈難度〉);）→ 主角發言格（MC1，把話講完整，過不過共用）→ 成功分支首格 Conditions: IsPassDice() == true; ／失敗分支首格 Conditions: IsPassDice() == false;。IsPassDice 不掛在緊接擲骰格的那一格。FeatID 只能用 給AI看的指南/擲骰指令轉換規則.md〈常用檢定項目ID對照〉裡的。
- 指引：帶高難度選項的選單之前、選單前最後一格放固定旁白一字不改：[panel=6]＊（懷裡的麒麟骰亮了一亮。光隔著衣襟透出來，隨即又暗了。）＊。只寫亮，不寫燙、熱、顫、震；不解釋為何亮。教學彈窗只在碰瓷出現過一次，其他場不掛。
- 硬紅線：不自取變數名、任務號、教學 ID（一律留 ＿＿）；SetFlag／GetFlag 禁用；不新建變數、任務、地點、道具、NPC；已進 Unity 的節點不改號、不改字、不動 title（改 links 可以）；新格不編號；Description 只寫 劇情/轉成json指南.md §1 詞表的標籤，不寫說明、不寫數值。
- 內容三道線：給AI看的指南/世界觀.md 第八節禁詞（五胡亂華、司馬、篡魏、三國歸晉、輪迴、重來、前世）；給AI看的指南/文本創作指南.md 0.6 揭露節奏；@角色設定/饕餮.md 第十節廢案清單。用東漢的價值觀寫，不加道德評語，旁人怎麼看他才是反應。
- 稿的寫法（創作稿）：說話者行 **旁白:**／**你:**／**〈角色〉:**（主角一律「你」），旁白 [panel=6]＊（…）＊，台詞「…」；每格底下 - actorID: / - Sequence: / - Conditions: / - Script: / - Description: / - 註記: 各一行，有才寫；立繪與表情寫在 Sequence（照 給AI看的指南/立繪指令轉換規則.md；選單前那一格不掛表情特效）。分岔用 ▶，合流寫「→ 接 #N」，新格用【A】【B】…標，不寫 entryID。不動 Json/、不動 Unity、不動回讀稿、不動 ${GUIDE}。
- 文風規矩（違反即退）：1. 旁白看得見你做什麼、看不見你想什麼：不寫內心話、不替玩家下感受或結論、不替角色斷定心裡怎樣。2. 寫結果和狀態，不寫過程；一格裡同一個人的動作最多兩拍；不編精確數目、距離和純造景小細節。3. 作者退過的句型不得再犯：「不是 X，是 Y」翻轉句；否定句收尾造氣氛；「像……」比喻巧句收尾；收尾加新判語；旁白先把下一格台詞要講的事講掉；同一件事隔幾格又講一遍。4. 句子寫完整，不斷碎句：旁白一格兩三句、每句十九到二十五字、不留五字以下的句子；每條分支最後一格旁白至少兩句、三十字；角色台詞一句十五字上下、可見字數 50 內，照那個角色既有的口吻（狗頭人是碎句豁免）。5. 旁白裡不寫「」引號；全篇不用破折號「——」，台詞也不用（打斷、沒說完用「……」）。6. 不自創單字名詞、不縮專名（對照 給AI看的指南/專名表.txt）；東漢稱謂與用詞；硬紅線詞永不進文本。
- 出場的人：只准情境包〈出場名單表〉上有的角色開口；名單表標 ⚠ 沒聲口卡的，照〈路人與配角通則〉寫，並在自檢記一筆。
- 省回合的規矩：情境包已收好本場的規則原文、掛點連線、每條來路、既有台詞、退稿實例；指南摘錄 ${EXCERPT} 收了三份指南與各轉換規則用得到的節。先讀它們；只在拿不準時回原檔查那一段，不要整本重讀。git 只准讀。給作者看的話用白話短句。日期一律寫 ${DATE}。`

// ---------- 場次（每批改這裡；下面是範例，照第十一節已定場次清單那一列填） ----------
const UNITS_ALL = [
  {
    key: '醉漢', box: '張寧02', kind: '福禍',
    out: '劇情/高難度檢定_醉漢.md',
    json: 'Json/張寧線/02蠶女白馬.json',
    overview: '劇情/張寧/02 蠶女白馬.md',
    anchors: '155,156',                       // 產生器 --anchors
    speakers: 'role62,MC6,MC1,role2,role61',  // 產生器 --speakers：本場會開口的每一個（含旁白、主角、新開口的路人）
    extraJson: ['Json/小溪村/碰瓷.json'],     // 產生器 --extra-json：參考用（例：戰鬥格寫法）
    voices: '醉漢 role62（無立繪、只出一趟）；張寧 MC6（0.6 紅線最緊，本場不表態）；蠶兒（見名單表）；你 MC1；旁白 role2',
    spec: `- 掛點：#155 他一巴掌掄過去之後、#156 你扣住手腕之前，新開選單三項：①現況「扣住手腕」（無檢定 → #156 → #157 原線）；②一般威嚇（過 → #157；不過 → 直接進戰鬥 BeginFight(Combat,14)，四段包法照第四節；打贏接回 #157，打輸走哪裡列進〈待作者定〉，碰瓷那場打輸是軟輸 #2043 他要錢）；③福禍威嚇。選單前一格放固定旁白。
- 福禍過：三倍威嚇經驗＋福（三版各提）→ 接回 #157 原線。
- 福禍不過：失手把他打死（作者 2026-09-28 定，0.2.3 在本場破例）→ 張寧扣好感 ModifyData(FavorabilityExp,MC6,-＿＿)（數字作者填，碰瓷是 −20）→ 禍分支自己收尾到 #213；四選一與張寧勸蠶兒那段在禍分支不播。
- 硬限制：禍不得替蠶兒決定人生（不得把醉漢嚇跑不回、不得讓主角替她解決那個男人）；不關 CF47；張寧 #163 照樣一句沒說、不表態 0.6 的事；#157 以後原線一格不動；蠶兒的反應、委託怎麼回報三版各提並列進〈待作者定〉。`,
    lenses: [
      { tag: '甲', name: '禍落在對方怎麼看你', brief: '禍的代價落在對方或在場的人怎麼看你；福＝他當眾服軟賠禮，不給東西。格數最省。' },
      { tag: '乙', name: '禍落在同伴或旁人', brief: '禍的代價落在張寧或蠶兒身上（她怎麼看你、後面那趟差事）；福可落在張寧一句話或一隻手。' },
      { tag: '丙', name: '出乎意料', brief: '禍與福都換一種出乎意料的後果，跟甲乙都不同；仍守全部硬限制。' },
    ],
    checks: [
      '分類與走向：福禍。過＝三倍威嚇經驗＋福 → 接回 #157；不過＝失手打死（作者破例）→ 張寧扣好感 → 禍分支自己收尾到 #213',
      '引擎寫法：新開選單三項、一般威嚇與福禍威嚇並排、各自的擲骰格四段包裝（Manual,IntimidationCheck,＿＿）、隔一格、IsPassDice 掛分支首格；一般威嚇不過進 BeginFight(Combat,14) 四段包法、IsPassFight 兩邊都有',
      '選項格式：[em2][威嚇檢定][/em2][em3]禍兮福倚，福兮禍伏[/em3]，無引號、無分類名；選單前固定旁白一字不改；不掛教學',
      '接回點：福線接 #157 且 #157 以後一格不動；禍線收到 #213 且不播四選一與張寧勸蠶兒；戰鬥打贏接 #157',
      '硬限制：不替蠶兒決定人生、不關 CF47、張寧不表態 0.6、醉漢之後不再出場',
      '變數與編號：不自取名、不新建變數、不動 title、不改既有格的字（改 links 可以）；好感數字留 ＿＿',
      '內容三道線與價值觀：禁詞、0.6、饕餮廢案；東漢價值觀；人死了不加道德評語，旁人怎麼看才是反應',
      '出場的人：只有名單表上的人開口；沒聲口卡的照路人通則',
    ],
  },
]
const UNITS = A.only ? UNITS_ALL.filter(u => A.only.includes(u.key)) : UNITS_ALL
const OUTS = UNITS_ALL.map(u => u.out)

// ---------- 路徑 ----------
const packetPath = box => `${HC}/${box}/packet.md`
const packetBasePath = box => `${HC}/${box}/packet-base.md`
const draftPath = (u, tag) => `${HC}/${u.key}/draft-${tag}.md`
const revisedPath = (u, tag) => `${HC}/${u.key}/revised-${tag}.md`
const stylePath = (u, tag) => `${HC}/${u.key}/style-${tag}.md`
const logicPath = (u, tag) => `${HC}/${u.key}/logic-${tag}.md`
const diffPath = u => `${HC}/${u.key}/diff.md`
const lensName = (u, tag) => { const l = u.lenses.find(x => x.tag === tag); return l ? l.name : '' }

function unitHead(u) {
  return `場：${u.key}（${u.kind}）｜情境包：${packetPath(u.box)}（底稿 ${packetBasePath(u.box)}）｜指南摘錄：${EXCERPT}
JSON：${u.json}（已進 Unity，新格不編號、不改既有格的字、不動 title）
總覽稿（回讀稿，只讀不改）：${u.overview}
掛點格號：${u.anchors}
聲口：${u.voices}
規格：
${u.spec}
本場結構八項檢查：
${u.checks.map((c, i) => `${i + 1}. ${c}`).join('\n')}`
}

const DRAFT_FILE_FORMAT = `檔案結構（每節都要有，沒有內容寫「（無）」；節名一字不改，組裝腳本靠它切）：
# 起草稿｜〈場〉｜〈甲乙丙〉（〈取向名〉）
## 取向（一句）
## 秘密（未卜才有：藏什麼、為何藏、去哪兌現，一句話）
## 檢定（檢定名與 FeatID、難度）
## 掛點與接回（逐條：插在哪一格的 links／哪一格之後 → 接回哪一格：做什麼、幾格）
## 讀的條件（逐行）
## 寫的指令（Script／ModifyData 逐行）
## 戲（創作稿本體：每格 說話者行＋全文，底下 actorID／Sequence／Conditions／Script／Description 有才寫；新格用【A】【B】…標；分岔 ▶；合流「→ 接 #N」；選單的選項格底下寫 - Description: 選項N）
## 兌現處（未卜才有：哪份 JSON、插在哪一格的 links、新選項格與其後一兩格、Conditions、接回哪一格）
## 差異表（乙、丙才有：對照前一版，哪幾拍、哪個結果、誰先開口、關鍵動作、接回各換成什麼；甲寫「（無）」）
## 起草者自檢（逐條對照八項檢查與文風規矩 1–6；名單表上沒聲口卡的人怎麼處理；節奏檢查的結果貼這裡）`

// ---------- 提示 ----------
function scoutPrompt(box, units) {
  return `${COMMON}

你是「${box}」的情境整理，只讀不改專案檔。本範圍這一批要寫的場：
${units.map(u => '\n---\n' + unitHead(u)).join('\n')}

做法（機械的部分交腳本，你只補判斷）：
1. 先跑產生器做底稿（每場一次，同一 JSON 的幾場合併 anchors）：
   python -X utf8 ${GEN} --json "<json>" --anchors <anchors> --overview "<overview>" --speakers <speakers>${units.some(u => u.extraJson && u.extraJson.length) ? ' --extra-json "<extraJson 各一個>"' : ''} --out "${packetBasePath(box)}"
   再跑指南摘錄（若 ${EXCERPT} 不存在或今天沒做過）：python -X utf8 ${GEN} --摘錄 --高難度 --out "${EXCERPT}"
2. 讀底稿。它有：出場名單表、掛點前後十格、來路、既有擲骰／戰鬥格、變數與任務、各角色的聲口卡／角色檔前段／既有台詞／退稿實例。
3. 寫情境包 ${packetPath(box)}（用 Write；目錄不存在就建），內容（純事實、逐字，不提改法）：
   a. 第一行寫「底稿：${packetBasePath(box)}（名單表、來路、既有句都在那裡）；指南摘錄：${EXCERPT}」。
   b. 規則原文：從 ${GUIDE} 逐字抄第十一節〈已定場次清單〉本批那幾列與〈執筆 agent 通用規則〉、第九節本範圍那幾列與說明文字（其餘規則節在指南摘錄裡，不重抄）。
   c. 每場的現行拍子：底稿第 2 節之外還需要的格（例如禍線要收到的結尾格、接回點之後十格）逐字補齊。
   d. 每條來路：把底稿第 3 節的路徑逐條寫成人話（走哪條路的玩家是誰、隊上有誰、手上有什麼、知道什麼），有娜娜／沒娜娜（IsInTeam("MC22")）分開列。
   e. 每場特別要查的事實（規格裡點名的：某變數是不是道具、某人此刻在哪、某戰鬥打輸走哪裡）：回 JSON 查清楚，只寫事實。
   f. 兌現處候選（未卜的場才做）：本範圍每份 JSON 裡有選單的既有互動點（entryID、text、links、Conditions、前後三格）。
   g. 名單表核對：底稿名單表標 ⚠ 的角色，你判斷他在本場會不會開口；會開口而沒聲口卡的，把他在全案的既有句全部撈齊放進來（底稿只抽了三十句），並註明「照路人通則」。
4. 回傳一頁摘要（兩千字內）：每場的掛點、接回點、來路條件、會開口的角色與 ID（照名單表，標出沒卡的）、兌現處候選、起草者一定要知道的坑。摘要是給下游看的目錄，細節都在檔案裡。`
}

function draftPrompt(u, lens, priors) {
  const priorText = priors.length
    ? `\n**串行起草（作者 2026-09-29 定）：** 前面已有 ${priors.map(p => `版${p.label}（${lensName(u, p.label)}）：${p.file}`).join('、')}。只讀它們的「## 戲」那一節（不讀逐格附註與自檢）。你這一版**必須跟前面每一版都不同**：拍子、結果、誰先開口、關鍵動作至少三項不一樣，不得只是換句話說。寫完在「## 差異表」逐版列出你換掉了什麼；沒有差異表不收。`
    : '\n你是第一版，不必看別人；「## 差異表」寫「（無）」。'
  return `${COMMON}

你是起草者（${lens.tag}｜${lens.name}）。你的取向：${lens.brief}
${unitHead(u)}
${priorText}

做法（作者 2026-09-26 裁示，省回合）：只讀情境包 ${packetPath(u.box)}、底稿 ${packetBasePath(u.box)} 與指南摘錄 ${EXCERPT}。**先把指南摘錄最前面的〈常犯十條〉錯例對改例讀一遍，再讀底稿裡本場角色的〈退稿實例〉，然後才動筆**。讀了這三份即視同讀過 CLAUDE.md 要求的三份指南，不必再開指南原檔。起草只管寫戲：**不回 JSON、總覽稿查連線與來路**，接不接得通交給審修。
出場的人只准〈出場名單表〉上有的；沒聲口卡的照〈路人與配角通則〉。
把稿寫成檔案 ${draftPath(u, lens.tag)}（用 Write；目錄不存在就建）。
${DRAFT_FILE_FORMAT}
寫完只跑一次 python -X utf8 ${RHYTHM} <檔>，照報告修一次就交，不再重跑；報告和你修了什麼貼進〈起草者自檢〉，沒修完的交給文風審。
回傳 JSON：file（檔案路徑）、approach（一句取向）、check_id、secret（未卜才有，否則空字串）、diff（乙丙：差異表的三句摘要；甲：空字串）、self_check（三五句：八項檢查哪幾項你自己拿不準、節奏檢查結果）。`
}

function diffPrompt(u, drafts) {
  return `你是差異判定，只讀不寫戲。場：${u.key}（${u.kind}）。三版起草稿：
${drafts.map(d => `- 版${d.label}（${lensName(u, d.label)}）：${d.file}`).join('\n')}
只讀每份的「## 戲」與「## 差異表」兩節。作者的規矩（2026-09-29）：乙必須跟甲不同、丙必須跟甲乙都不同；「不同」看四樣：拍子（發生了什麼事、順序）、結果（過與不過各落在哪裡）、誰先開口、關鍵動作或物件。只是換句話說、換個形容，不算不同。
判法：三組兩兩對照（甲乙、甲丙、乙丙），每組列出四樣裡相同的有幾樣、相同的是什麼；四樣裡有兩樣以上相同就算「太近」。
把判定寫成檔案 ${diffPath(u)}（用 Write）：一張三列的表（組｜相同幾樣｜相同的是什麼｜太近與否），底下每個「太近」的組寫一段「後面那版重寫時不准再用的拍子」清單。
回傳 JSON：pairs（每筆：pair 例「甲乙」、same_count 整數、same_items 字串、too_close 布林）、redo（要重寫的版標，甲乙太近退乙、與丙有關的退丙；沒有就空陣列）、forbid（給重寫者的「不准再用」清單，一句一條）。`
}

function revisePrompt(u, d) {
  return `${COMMON}

你是審修（版${d.label}）。一人審一版，**只管結構，不管文風**（文風另有文風審）：逐項查，能修的直接修進稿裡，修不了的列出來。
${unitHead(u)}

起草稿：${d.file}（先讀）；情境包：${packetPath(u.box)}（先讀本場那幾段）；底稿：${packetBasePath(u.box)}；起草者的自檢：${d.self_check || '（無）'}

查什麼：
1. 本場結構八項逐項：回原 JSON、原總覽稿查證掛點、接回點、每條來路、既有格的字有沒有被改、變數與任務號是不是留 ＿＿、擲骰格四段、IsPassDice 掛位、獎勵與代價指令、選項格式與題語、Description 詞表（劇情/轉成json指南.md §1）、固定旁白一字不差、名單表外的人有沒有開口。
2. 分類專查：未卜查「額外」（拿到的東西是不是沒有這一骰就不存在；兌現處掛得上、條件寫對）；轉機查真的翻盤、接回勝利線之後一格沒被動、選單有「離開」、不過有 ModifyData(Coin,-200)；福禍查禍的紅線與三倍經驗、禍不像一般失敗。
怎麼修：指令、接法、格的增刪能修就直接修；**不改台詞的字句**（那是文風審的活；發現文風問題記在〈給文風審〉一節）；修完仍要守取向（版${d.label}是「${lensName(u, d.label)}」），不要把它修成別的版；該作者定的不要替作者定，留 ＿＿ 並記下來。**不改動格的順序與【A】【B】標號**（後面文風審與邏輯審並行，靠標號對格）。
寫成檔案 ${revisedPath(u, d.label)}（結構同起草稿），檔尾加三節：
## 審修紀錄（每一處改動：第幾格、原句→新句、依哪條規矩）
## 待作者定（修不了或不該由 AI 定的）
## 給文風審（你順眼看到的文風問題，只列格與一句話，不改）
修完跑一次 python -X utf8 ${FORMATCHK} <檔>（檔頭沒分類會警告，不管它；其他報的要處理）。不要改任何專案檔。
回傳 JSON：file、verdicts（八項各一筆：check、verdict 是 pass／fixed／unresolved、note 一句）、changes（改了幾處）、summary（三五句：這版最大的問題是什麼、修了什麼、還剩什麼）。`
}

function stylePrompt(u, r) {
  return `${COMMON}

你是文風審（版${r.label}）。審修已經修過結構，你**只管字句**：逐格填表、對照專名表與審校清單、直接改字。邏輯審跟你同時在看同一份審修稿（他只列不改），所以你**不得改動格的順序、增刪格、改【A】【B】標號**，只改字句與 Sequence 裡的表情。
${unitHead(u)}

先讀：指南摘錄 ${EXCERPT} 最前面的〈常犯十條〉、〈審校清單第一部分〉甲到辛、旁白卡、本場角色的聲口卡；底稿 ${packetBasePath(u.box)} 裡每個角色的〈既有台詞〉與〈退稿實例〉；審修稿 ${r.file}（含它檔尾的〈給文風審〉）。
把審修稿整檔複製成 ${stylePath(u, r.label)}（用 Write），在這份上改。逐格做：
1. 每一格一行填進「## 文風逐格表」：格｜甲到辛詞表（過／改）｜常犯十條（過／改，第幾條）｜縮寫與自創名詞（對照 給AI看的指南/專名表.txt；過／改）｜稱謂（過／改）｜節奏（句數、每句字數；旁白一格兩三句、每句十九到二十五字；台詞一句十五字上下、可見字 50 內；過／改）｜結尾旁白（分支最後一格至少兩句三十字；過／改／不適用）｜em7（每十格至多一個；過／改）｜改了什麼。**不准整段打勾，一格一格重讀，唸出聲。**
2. 口吻：每個角色的句子對照他在底稿裡的既有句與退稿實例，不像他的改到像他；主角照主角卡；沒聲口卡的路人照〈路人與配角通則〉。
3. 改字仍守取向（版${r.label}是「${lensName(u, r.label)}」）與規格；不動指令、不動接法（那是審修的活，發現問題記進〈待作者定〉）。
4. 每一處改動記進「## 文風審紀錄」：第幾格、原句→新句、依哪條（詞表哪一類／常犯第幾條／旁白卡第幾條）。
5. 跑 python -X utf8 ${RHYTHM} <檔>，報的每一條都處理或在逐格表交代為何留，**最多跑三次，交出去時腳本零警告**（未選各版的舊句不算）。
不要改任何專案檔。
回傳 JSON：file、rows（逐格表幾列）、changes（改了幾處）、rhythm（腳本最後一次的結果一句）、summary（三五句：這版文風最大的毛病、改了什麼、還剩什麼）。`
}

function logicPrompt(u, r) {
  return `${COMMON}

你是邏輯審（版${r.label}）。**只列不改**（作者 2026-09-29：文風審同時在改字，兩人不能同時改一份檔；你的表由終審套進去）。先讀情境包 ${packetPath(u.box)} 裡這一場的現行拍子與來路、底稿 ${packetBasePath(u.box)} 第 2、3 節，再逐格讀審修稿 ${r.file}。
${unitHead(u)}

只看六件事（規矩、格式、口吻不歸你）：
1. 誰知道什麼：每一格說話的人、主角、旁白此刻知道的事，是不是前面已經看見或聽見的。沒看見的不能認出，沒聽見的不能回答，同一件事不能認第二次、不能講第二次。
2. 先後因果：先看見才能叫人、先問才有答、先做才有結果；轉場前後的時辰、天色、地點接得上；人在哪、誰在場，前後一致。
3. 東西的去向：拿出來的東西有收回或交代；沒有憑空多出來的東西。
4. 旁白和台詞不打架：旁白不重講台詞剛講的事，也不比台詞晚一步才交代台詞已經用到的事實；選項文字跟後面的戲對得上。
5. 每條分支的前提在那條路上真的成立：寫「認識某人」的那條，玩家在那條路上真的見過他；寫「拿到某物」的那條，前面真的給過。
6. 前後場的接口：這一場開頭假定的事，前一場真的演過；這一場結尾留下的狀態，後一場用得上。
把結果寫成檔案 ${logicPath(u, r.label)}（用 Write）：一張表，每列「格（用【A】標號或說話者＋前幾個字）｜哪一件（1–6）｜問題｜建議改成什麼（給出可以直接套的句子或接法）｜確定／存疑」。沒問題就寫「（無）」。不改任何檔。
回傳 JSON：file、issues（每筆：where、item 整數 1–6、problem、fix、sure 布林）、summary（兩三句：最大的邏輯問題是什麼、幾條確定、幾條存疑）。`
}

function finalPrompt(u, versions) {
  return `${COMMON}

你是本場的終審兼編輯。三版各經審修、文風審、邏輯審。你的工作：把邏輯審的表套進文風審過的稿、重查結構、標一版建議、用組裝腳本寫提案檔、跑檢查。
${unitHead(u)}

三版（先全部讀完）：
${versions.map(v => `- 版${v.label}（${lensName(u, v.label)}）：文風審後的稿 ${v.styleFile}；邏輯審的表 ${v.logicFile}；審修結論：${v.summary}；verdicts：${JSON.stringify(v.verdicts)}；邏輯審摘要：${v.logicSummary}`).join('\n')}
情境包：${packetPath(u.box)}；底稿：${packetBasePath(u.box)}；差異判定：${diffPath(u)}

做法：
1. 套邏輯表：邏輯審標「確定」的每一條，套進該版的文風審稿（${versions.map(v => v.styleFile).join('、')}），套的時候守該版取向與文風規矩，記進該檔「## 審修紀錄」並標「邏輯審」；標「存疑」的你判：成立就套，不成立就在〈待作者定〉說明。
2. 重查結構（審修最容易漏的）：每條來路從掛點前十格讀到接回點後十格接不接得通、擲骰結構、獎勵與代價指令、變數與教學 ID 留白、選項格式與題語、固定旁白、未卜的「額外」、轉機的「真的翻盤」與「離開」「-200」、福禍的禍不像一般失敗、三版是不是三個真的不同的選擇（對照 ${diffPath(u)}）。發現就直接改該版的文風審稿，並記進〈審修紀錄〉。
3. 建議版：挑一版，理由一句（通過項最多、接戲最順、最合規格）。
4. 組提案檔：跑
   python -X utf8 ${ASSEMBLE} --場 "${u.key}" --用途 "高難度檢定提案" --分類 "${u.kind}" --日期 "${DATE}" --建議 <甲乙丙> --理由 "<一句>" --版 甲="${stylePath(u, '甲')}" 乙="${stylePath(u, '乙')}" 丙="${stylePath(u, '丙')}" --out "${u.out}"
   它會把三版的〈戲〉轉成純對話置頂、逐格與紀錄放後面、合併〈待作者定〉。組完讀一遍，掛點與接回那幾行、待作者填那幾條不對就直接改提案檔。
5. 跑 python -X utf8 ${RHYTHM} "${u.out}" 與 python -X utf8 ${FORMATCHK} "${u.out}"，報的照規矩修到不報（改了要同步改該版的文風審稿並記進審修紀錄），或在〈待作者定〉說明為何留。
6. 跑 git status：本流程只該動這些提案檔：${OUTS.join('、')}（別場的終審可能同時在寫別的檔）。不動 Json/、回讀稿、${GUIDE}、其他檔。
回傳 JSON：out、recommended（label、reason）、unresolved（字串陣列）、rhythm（節奏檢查最後一行）、format（格式檢查最後一行）、summary（三五句：三版各是什麼、你套了幾條邏輯、為什麼建議那版）。`
}

// ---------- 回傳結構 ----------
const DRAFT_SCHEMA = { type: 'object', properties: {
  file: { type: 'string' }, approach: { type: 'string' }, check_id: { type: 'string' }, secret: { type: 'string' }, diff: { type: 'string' }, self_check: { type: 'string' },
}, required: ['file', 'approach', 'check_id', 'secret', 'diff', 'self_check'] }
const DIFF_SCHEMA = { type: 'object', properties: {
  pairs: { type: 'array', items: { type: 'object', properties: {
    pair: { type: 'string' }, same_count: { type: 'integer' }, same_items: { type: 'string' }, too_close: { type: 'boolean' },
  }, required: ['pair', 'same_count', 'same_items', 'too_close'] } },
  redo: { type: 'array', items: { type: 'string' } },
  forbid: { type: 'array', items: { type: 'string' } },
}, required: ['pairs', 'redo', 'forbid'] }
const REVISE_SCHEMA = { type: 'object', properties: {
  file: { type: 'string' },
  verdicts: { type: 'array', items: { type: 'object', properties: {
    check: { type: 'string' }, verdict: { type: 'string', enum: ['pass', 'fixed', 'unresolved'] }, note: { type: 'string' },
  }, required: ['check', 'verdict', 'note'] } },
  changes: { type: 'integer' }, summary: { type: 'string' },
}, required: ['file', 'verdicts', 'changes', 'summary'] }
const STYLE_SCHEMA = { type: 'object', properties: {
  file: { type: 'string' }, rows: { type: 'integer' }, changes: { type: 'integer' }, rhythm: { type: 'string' }, summary: { type: 'string' },
}, required: ['file', 'rows', 'changes', 'rhythm', 'summary'] }
const LOGIC_SCHEMA = { type: 'object', properties: {
  file: { type: 'string' },
  issues: { type: 'array', items: { type: 'object', properties: {
    where: { type: 'string' }, item: { type: 'integer' }, problem: { type: 'string' }, fix: { type: 'string' }, sure: { type: 'boolean' },
  }, required: ['where', 'item', 'problem', 'fix', 'sure'] } },
  summary: { type: 'string' },
}, required: ['file', 'issues', 'summary'] }
const FINAL_SCHEMA = { type: 'object', properties: {
  out: { type: 'string' },
  recommended: { type: 'object', properties: { label: { type: 'string' }, reason: { type: 'string' } }, required: ['label', 'reason'] },
  unresolved: { type: 'array', items: { type: 'string' } },
  rhythm: { type: 'string' }, format: { type: 'string' }, summary: { type: 'string' },
}, required: ['out', 'recommended', 'unresolved', 'rhythm', 'format', 'summary'] }

// ---------- 管線 ----------
const scoutJobs = {}
function ensurePacket(box) {
  if (!scoutJobs[box]) {
    const units = UNITS_ALL.filter(u => u.box === box)
    const haveIt = units.some(u => A.have[u.key] && A.have[u.key].packet)
    scoutJobs[box] = haveIt
      ? Promise.resolve(true).then(() => { log(`${box}：情境包沿用 ${packetPath(box)}`); return true })
      : agent(scoutPrompt(box, UNITS.filter(u => u.box === box)), { label: `scout:${box}`, phase: 'Scout', effort: 'high', model: MODEL }).then(r => !!r)
  }
  return scoutJobs[box]
}

async function draftOne(u, lens, priors, extraNote) {
  const prompt = draftPrompt(u, lens, priors) + (extraNote ? `\n\n**差異判定退回重寫：** 上一稿跟前面的版太近。這些拍子不准再用：\n${extraNote}\n重寫整份 ${draftPath(u, lens.tag)}（整檔覆寫），差異表重填。` : '')
  const r = await agent(prompt, { label: `draft-${lens.tag}:${u.key}${extraNote ? '(重寫)' : ''}`, phase: 'Draft', effort: 'xhigh', model: MODEL, schema: DRAFT_SCHEMA })
  return r ? { label: lens.tag, ...r, file: draftPath(u, lens.tag) } : null
}

async function runScene(u) {
  const had = (A.have[u.key] && A.have[u.key].drafts) || []
  // 起草：串行（作者 2026-09-29）——甲先寫，乙讀甲，丙讀甲乙
  const drafts = []
  for (const l of u.lenses) {
    if (had.includes(l.tag)) { drafts.push({ label: l.tag, file: draftPath(u, l.tag), self_check: '（沿用舊 run 的起草稿，自檢見檔尾）' }); continue }
    const d = await draftOne(u, l, drafts, '')
    if (d) drafts.push(d)
  }
  if (!drafts.length) return { unit: u.key, error: 'all drafts failed' }
  log(`${u.key}：${drafts.length} 版起草稿就位，送差異判定`)
  // 差異判定（medium）：太近的退回重寫一次
  let diff = null
  if (drafts.length === 3) {
    diff = await agent(diffPrompt(u, drafts), { label: `diff:${u.key}`, phase: 'Diff', effort: 'medium', model: MODEL, schema: DIFF_SCHEMA })
    if (diff && diff.redo && diff.redo.length) {
      const forbid = (diff.forbid || []).map(s => '- ' + s).join('\n')
      for (const tag of diff.redo) {
        const l = u.lenses.find(x => x.tag === tag); if (!l) continue
        const idx = drafts.findIndex(d => d.label === tag)
        const priors = drafts.filter(d => d.label !== tag && u.lenses.findIndex(x => x.tag === d.label) < u.lenses.findIndex(x => x.tag === tag))
        log(`${u.key}：版${tag} 與前版太近，退回重寫一次`)
        const d = await draftOne(u, l, priors, forbid)
        if (d && idx >= 0) drafts[idx] = d
      }
    }
  }
  log(`${u.key}：送審修（只管結構）`)
  const revs = (await parallel(drafts.map(d => () =>
    agent(revisePrompt(u, d), { label: `revise-${d.label}:${u.key}`, phase: 'Revise', effort: 'high', model: MODEL, schema: REVISE_SCHEMA })
      .then(r => r ? { label: d.label, ...r, file: revisedPath(u, d.label) } : null)))).filter(Boolean)
  if (!revs.length) return { unit: u.key, error: 'all revisions failed', drafts }
  log(`${u.key}：文風審與邏輯審並行`)
  // 文風審（改字，寫 style-X）∥ 邏輯審（只列，寫 logic-X）
  const versions = (await parallel(revs.map(r => async () => {
    const [st, lg] = await parallel([
      () => agent(stylePrompt(u, r), { label: `style-${r.label}:${u.key}`, phase: 'Style', effort: 'max', model: MODEL, schema: STYLE_SCHEMA }),
      () => agent(logicPrompt(u, r), { label: `logic-${r.label}:${u.key}`, phase: 'Logic', effort: 'max', model: MODEL, schema: LOGIC_SCHEMA }),
    ])
    if (!st) return null
    return { label: r.label, verdicts: r.verdicts, summary: r.summary, styleFile: stylePath(u, r.label), style: st,
      logicFile: lg ? logicPath(u, r.label) : '（邏輯審失敗，無表）', logicSummary: lg ? lg.summary : '（邏輯審失敗）', logic: lg }
  }))).filter(Boolean)
  if (!versions.length) return { unit: u.key, error: 'all style passes failed', revs }
  log(`${u.key}：送終審`)
  const fin = await agent(finalPrompt(u, versions), { label: `final:${u.key}`, phase: 'Final', effort: 'high', model: MODEL, schema: FINAL_SCHEMA })
  if (!fin) return { unit: u.key, error: 'final failed', versions }
  log(`${u.key}：提案檔完成，建議版 ${fin.recommended.label}，待作者定 ${fin.unresolved.length} 件`)
  return { unit: u.key, out: fin.out, recommended: fin.recommended, unresolved: fin.unresolved, rhythm: fin.rhythm, format: fin.format, summary: fin.summary,
    diff: diff ? { pairs: diff.pairs, redo: diff.redo } : null,
    versions: versions.map(v => ({ label: v.label, revise_unresolved: v.verdicts.filter(x => x.verdict === 'unresolved').length, style_changes: v.style.changes, logic_issues: v.logic ? v.logic.issues.length : null })) }
}

log(`同時開跑：${UNITS.map(u => u.key).join('、')}`)
const results = (await parallel(UNITS.map(u => async () => {
  const ok = await ensurePacket(u.box)
  if (!ok) return { unit: u.key, error: 'scout failed' }
  return await runScene(u)
}))).filter(Boolean)
return { date: DATE, units: results }
