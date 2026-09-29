export const meta = {
  name: 'hard-check-batch4',
  description: '高難度檢定第四批（廂房出謀、七夕娜娜、七夕張寧、董卓認子）第二級流程：一箱庭一情境包（走檔案）、每場三起草、三審修（一人審一版並修）、一終審挑錯並寫提案檔；不再有審稿團、定稿、複核、稽核四層',
  phases: [
    { title: 'Scout', model: 'opus', detail: '一箱庭一名：情境包寫成檔案，只回一頁摘要' },
    { title: 'Draft', detail: '每場三名起草，各寫一版進檔案' },
    { title: 'Revise', detail: '每版一名審修：逐項查、能修就修、記錄改動' },
    { title: 'Logic', detail: '每版一名邏輯審（2026-09-28 作者要求加）：誰知道什麼、先後因果、人在哪、東西去哪、前後場接口；直接修，記「邏輯審」' },
    { title: 'Final', detail: '每場一名終審：再挑錯、標建議版、寫提案檔、跑兩支檢查腳本' },
  ],
}

// 用法：Workflow({scriptPath: '.claude/wf/hard-check-batch3.js', args: {date: '2026-09-26', only: [...], have: {村長: {packet: true, drafts: ['甲','乙','丙']}}}})
// args.date 必填；args.only 只跑幾場；args.have 標記哪些場的情境包／起草稿已在 hc 目錄裡（沿用舊 run 的成果，不再花 agent）；args.hc 可換暫存目錄。
const A = Object.assign({ date: '＿＿＿＿-＿＿-＿＿', only: null, have: {}, hc: 'C:/Users/user/AppData/Local/Temp/claude/d--QilinStory/4acb5323-b153-440b-8c80-a1d714f7ce95/scratchpad/hc4' }, args || {})
const DATE = A.date
const MODEL = A.model || 'opus'   // 作者 2026-09-26：子 agent 一律 Opus 5.5
const HC = A.hc
const GUIDE = '給AI看的指南/高難度檢定走向指南.md'

const LESSONS = `
【前三批學到的，違反即退（作者 2026-09-27 退過的稿）】
- 一個選單一定有兩個檢定選項：一般檢定＋同一種的高難度檢定（轉機除外）。選單原本沒有檢定的，先補一個一般檢定（難度照同場一般值，作者填）。
- 福禍的「禍」不能跟同選單一般檢定的失敗結果相近，也不能跟一般成功相近；三版的禍要三種不同類的後果，不要三版同骨架只換演法；不重複已用過的：嚇昏（碰瓷）、嚇跑丟同伴（狗頭人）、對方撲上來／開打、聯手、讓開、倒采嗤笑、扔東西。先把一般檢定成功、失敗各走到哪查清楚寫進情境包，起草時照著避開。
- 給作者看的待決事項，每一條都寫成「問題｜建議做法｜替代做法」，方便作者用選單點選。`

const COMMON = `你在做《異麒麟》高難度檢定的提案（第四批，2026-09-27 規則）。規矩全在 ${GUIDE}：第一節三個分類與〈選項格式〉、第四節引擎寫法、第五節走向細則、第六節規則、第七之二節指引（骰子亮）、第九節各箱庭素材盤點、第十一節〈已定場次清單〉與〈執筆 agent 通用規則〉。本提示只摘要，拿不準翻指南那一節；指南與本摘要衝突以指南為準。前兩批（小溪村、破廟）的定稿可當範例：劇情/舊創作稿/高難度檢定_碰瓷.md、_村長.md、_河童第二戰.md、_狗頭人打劫.md、_阿佑.md、_阿傑.md 的〈✅ 定稿〉節（未選原稿各節不要看）。
- 什麼叫高難度檢定：在既有選單旁邊加一個高難度擲骰選項，過或不過至少有一邊跟原本的分支不同。難度作者填，稿裡寫暫定值（各場另註）。
- 選項格式（已定）：檢定標籤＋題語，選單上沒有主角的話、不加引號、不出現分類名：福禍 [em2][威嚇檢定][/em2][em3]禍兮福倚，福兮禍伏[/em3]；未卜 [em2][洞悉檢定][/em2][em3]知其一，不知其二[/em3]；轉機 [em2][厚黑檢定][/em2][em3]置之死地，而後生[/em3]。檢定名照實際用的寫、只用遊戲既有標籤（口才檢定＝PersuasionCheck）。真正的話在擲骰之後的主角發言格才講。同一選單優先用普通選項那一種檢定。
- 福禍：過＝三倍經驗（該對話一般檢定給多少就三倍）＋福（加倍獎勵或新分支）；不過＝禍，一條新分支（極端結果＋代價），不是原本的失敗。禍不死人、不留殘、不關線；代價只落好感、錢、面子；極端結果不得跟前兩批重複（碰瓷已用過「嚇昏」、狗頭人用過「嚇跑丟下同伴」）。
- 未卜：過＝額外的情報，帶來額外的獎勵；經驗跟該對話一般檢定一樣。把本來就會拿到的東西提早給、把本來要走的關跳過、直接給謎底，都不算。不過＝回到原本檢定失敗那條，不再給第二次骰。變數用作者給的 IsHiddenN（各場另註）。
- 轉機：只在打輸（或作者指定的檢定失敗）之後；選單＝轉機選項＋「離開」（離開直接接回原失敗線）；過＝接回勝利線的無條件格、之後不動；不過＝扣二百錢 ModifyData(Coin,-200)，掛在不過那條第一格空格、不寫解釋台詞，接回原失敗線；轉機不需要配一般檢定。
- 引擎寫法（違反即退）：一個選項一顆骰，自己接一個擲骰格，不跟普通選項共用。結構照 劇情/轉成json指南.md §4.2（含第 7 項底下 ⚠ 高難度例外）：選項格（actorID MC1，Description「選項N」，**不掛教學**：教學只在碰瓷）→ 擲骰格（actorID 0、text 空、Description「〈名〉檢定」、Sequence 四段：SetContinueMode(false);SetContinueMode(original)@Message(EndRoll);Continue()@Message(EndRoll);BeginDiceRoll(Manual,〈FeatID〉,〈難度〉);）→ 主角發言格（MC1，把話講完整，過不過共用）→ 成功分支首格 Conditions: IsPassDice() == true; ／失敗分支首格 Conditions: IsPassDice() == false;。FeatID 只能用 給AI看的指南/擲骰指令轉換規則.md〈常用檢定項目ID對照〉裡的。
- Description 照 劇情/轉成json指南.md §1 詞表：選項格「選項N」、好感帶角色名（例「蕭靈犀好感度下降」）、經驗「〈項目〉經驗增加」，不寫數值、不寫說明。
- 指引（骰子亮）：帶高難度選項的選單之前、選單前最後一格，放固定旁白一字不改：[panel=6]＊（懷裡的麒麟骰亮了一亮。光隔著衣襟透出來，隨即又暗了。）＊，actorID role2；這一格只有骰子和主角，不寫同伴、不寫判語、不寫燙熱顫震；主角立繪可切 SetPortrait(MC1,pic=12);，不掛表情特效。不另寫介紹、不掛教學。
- 硬紅線：不自取變數名、任務號、教學 ID（作者沒給的一律留 ＿＿）；SetFlag／GetFlag 禁用；不新建地點、道具、NPC；已進 Unity 的節點不改號、不改字、不動 title（改 links 可以；各場另註准改的除外）；新格不編號；不寫 title。
- 內容三道線：給AI看的指南/世界觀.md 第八節禁詞（五胡亂華、司馬、篡魏、三國歸晉、輪迴、重來、前世）；給AI看的指南/文本創作指南.md 0.6 揭露節奏；@角色設定/饕餮.md 第十節廢案清單與第四、五節（燙＝她醒，高難度檢定的格子不得寫燙熱顫震）。用東漢的價值觀寫，不加道德評語，旁人怎麼看他才是反應。
- 稿的寫法（創作稿）：說話者行 **旁白:**／**你:**／**〈角色〉:**（主角一律「你」），旁白 [panel=6]＊（…）＊，台詞「…」；每格底下 - actorID: / - Sequence: / - Conditions: / - Script: / - Description: / - 註記: 各一行，有才寫；立繪與表情寫在 Sequence（照 給AI看的指南/立繪指令轉換規則.md；選單前那一格不掛表情特效；開了的特效下一格要關）。分岔用 ▶，合流寫「→ 接 #N」，新格用【A】【B】…標，不寫 entryID。不動 Json/、不動 Unity、不動回讀稿、不動 ${GUIDE}。
- 文風規矩（違反即退）：1. 旁白看得見你做什麼、看不見你想什麼：不寫內心話、不替玩家下感受或結論、不替角色斷定心裡怎樣。2. 寫結果和狀態，不寫過程；一格裡同一個人的動作最多兩拍；不編精確數目、距離和純造景小細節。3. 作者退過的句型不得再犯：「不是 X，是 Y」翻轉句；否定句收尾造氣氛；「像……」比喻巧句收尾；收尾加新判語；旁白先把下一格台詞要講的事講掉；同一件事隔幾格又講一遍。4. 句子寫完整，不斷碎句：旁白一格兩三句、每句十九到二十五字、不留五字以下的句子；角色台詞一句十五字上下、可見字數 50 內，照那個角色既有的口吻。5. 旁白裡不寫「」引號；**全篇不用破折號「——」，台詞也不用**（打斷、沒說完用「……」；文風指南旁白卡第 9 條）；[em7] 每十格至多一個、同一人不連掛，[/em7] 後必接標點。6. 不自創單字名詞；東漢稱謂與用詞（「縣衙」不用，寫「官府」）；硬紅線詞永不進文本。
- 省回合的規矩：情境包已收好本場的規則原文、掛點連線、每條來路、既有台詞、兌現處候選、指南摘錄，先讀它；只在拿不準時回原檔查那一段，不要整本重讀。檢查腳本各跑一次就好。給作者看的話用白話短句。日期一律寫 ${DATE}。
${LESSONS}`

const CHECKS_FUHUO = (extra) => [
  '分類與走向：福禍。過＝三倍經驗（該對話一般檢定的三倍）＋福；不過＝禍的新分支（極端結果＋代價），不是原本的失敗；至少一邊跟原分支不同',
  '引擎寫法：自己的擲骰格四段包裝、隔一格、IsPassDice 掛分支首格；選項格式 [em2][〈名〉檢定][/em2][em3]禍兮福倚，福兮禍伏[/em3]，無引號、無分類名；選項格不掛教學；Description 只准詞表（選項N、好感帶角色名）',
  '禍的紅線：不死人、不留殘、不關線；代價只落好感、錢、面子；極端結果不跟碰瓷（嚇昏）、狗頭人（嚇跑丟下同伴）重複；不推進本來輸了會遊戲結束的戰鬥',
  '指引：選單前最後一格是固定旁白一字不改；不寫燙熱顫震；選單前一格不掛表情特效',
  '連續性：掛點每條來路都接得通；過與不過接回的既有格對得上（誰在場、誰拿著什麼、任務與變數狀態）；有娜娜／沒娜娜等同伴分流都通',
  '變數與編號：不自取名、不新建東西、不動 title、不改既有格的字（本場另准的除外）',
  '內容三道線與價值觀；' + extra,
  '文風規矩 1–6 與聲口：對方貼既有句；主角；同伴照聲口卡；台詞可見字數 50 內；em7 每十格至多一個',
]
const CHECKS_WEIBU = (extra) => [
  '分類與走向：未卜。過＝額外的情報帶來額外的獎勵＋記變數；經驗同一般檢定；不是提早給、不是跳關、不是給謎底；不過＝接回原本失敗那條、不再骰第二次',
  '引擎寫法：自己的擲骰格四段包裝、隔一格、IsPassDice 掛分支首格；選項格式 [em2][〈名〉檢定][/em2][em3]知其一，不知其二[/em3]，無引號、無分類名；選項格不掛教學；Description 只准詞表',
  '兌現：照本場規格；不新建地點道具 NPC；作者要建的留 ＿＿',
  '指引：選單前最後一格是固定旁白一字不改；不寫燙熱顫震；選單前一格不掛表情特效',
  '連續性：掛點每條來路都接得通；過與不過接回的既有格對得上；同伴分流都通',
  '變數與編號：變數用作者給的名字，其餘留 ＿＿；不動 title、不改既有格的字',
  '內容三道線與價值觀；' + extra,
  '文風規矩 1–6 與聲口：對方貼既有句；主角；同伴照聲口卡；台詞可見字數 50 內',
]
const LENS_ACT = (scene) => [
  { tag: '甲', name: '照清單最省', brief: `貼著第十一節已定場次清單 ${scene} 那一列，格數最少、差別最集中；福與禍各給最直接的一種。` },
  { tag: '乙', name: '接戲', brief: `先把總覽稿 ${scene} 那場從頭讀到尾，寫出唸起來最順、最像這場戲原本嗓子的版本；格數可以比甲多一兩格。` },
  { tag: '丙', name: '另一種演法', brief: '刻意換一種福、一種禍、或換誰先開口、換一個看得見的動作或物件，讓作者有真的不一樣的選擇；仍守全部規矩。' },
]


const CHECKS_FUHUO2 = (extra) => CHECKS_FUHUO(extra + '；禍不像同選單一般檢定的成功或失敗，三版三種不同的禍')

const UNITS_ALL = [
  {
    key: '廂房出謀', box: '180年3月', group: 1, kind: '未卜',
    out: '劇情/高難度檢定_廂房出謀.md',
    json: 'Json/主線事件/180年/3月.json',
    overview: '劇情/180年事件/ 裡 03 月那份月檔的主線〈廂房出謀〉那段（查 劇情/索引.md）',
    voices: '赫連娜娜 MC22（先跑 python -X utf8 給AI看的指南/既有台詞.py MC22；聲口卡照武俠文風創作指南第四節）；在場其他人照 JSON；你 MC1；旁白 role2',
    anchors: '180/3 主線〈廂房出謀〉：現在沒有選單，**新開一個**（作者選的丙案）。情境包查清廂房出謀那段每一格、在哪一格之後能開選單、娜娜原本怎麼講完；雲中三雄〈危險平衡〉路線（劇情/雲中/@結局_雲中三雄.md）寫了什麼、跟舌戰三家的關係；甄家、赤龍幫、黑狼氏族在這段怎麼被介紹。',
    spec: `- 掛點：在廂房出謀那段新開一個選單：**一般檢定＋同種高難度檢定**（口才 PersuasionCheck 或洞悉 InsightCheck，各版選一種並說明；一般難度暫 15、高難度暫 25，作者填）＋一個不檢定的選項（接回原本的下一格）。選單前最後一格放固定旁白。
- 一般檢定：過＝娜娜多講一點原本就會講的東西（不點破可以同時拿），經驗照一般；不過＝接回她照原本講完那條。
- 高難度：過＝**娜娜點破：兩家的投資可以同時拿；介紹黑狼氏族時判斷「兩家都拿，黑狼不會只在旁邊看，反而有機會平衡」**；該格 Script: Variable["IsHidden5"] = true;（作者定名）；經驗同一般。不過＝接回她照原本講完那條，不再骰第二次。
- 情報指向既有的雲中三雄〈危險平衡〉路線，**不新造路**；IsHidden5 之後要不要接事件作者自定，**不寫後續**；不寫舌戰三家的具體檢定。
- 娜娜聲口照卡（一句十五字上下、不碎句、自稱本姑娘等照既有句）。`,
    lenses: [
      { tag: '甲', name: '照清單最省', brief: '格數最少：娜娜兩三格把點破講完，其餘照原戲。' },
      { tag: '乙', name: '接戲', brief: '先把月檔廂房出謀那段從頭讀到尾，照娜娜原本的嗓子與這場的節奏，讓點破從她正在講的某一家自然帶出來；格數可比甲多一兩格。' },
      { tag: '丙', name: '另一種演法', brief: '換一種帶法：例如她先反問主角、或拿桌上的東西比劃三方，讓主角自己說出一半、她補另一半；仍是同一條情報、仍守全部規矩。' },
    ],
    checks: CHECKS_WEIBU('情報是「兩家投資可並拿、黑狼會入局而有機會平衡」，指向既有〈危險平衡〉路線、不新造路、不寫後續、不寫舌戰三家的檢定；選單有一般＋同種高難度'),
  },
  {
    key: '七夕娜娜', box: '180年7月', group: 1, kind: '福禍',
    out: '劇情/高難度檢定_七夕娜娜.md',
    json: 'Json/主線事件/180年/7月.json',
    overview: '劇情/180年事件/ 裡 07 月那份月檔的主線〈七夕〉娜娜那段（查 劇情/索引.md）',
    voices: '赫連娜娜 MC22（先跑 既有台詞.py MC22、讀她的聲口卡與 @角色設定/赫連娜娜.md）；你 MC1；旁白 role2',
    anchors: '180/7 七夕・娜娜：調情 12 那個選單加一項。情境包查清那個選單、調情 12 成功與失敗各接去哪（一般檢定的結果，禍要避開）、`CrossOverLover` 那條分流在哪（不動）、這段給多少好感。',
    spec: `- 掛點：調情 12 那個選單加一項高難度調情（同種並排）；選單前最後一格放固定旁白。
- 檢定：調情 FlirtingCheck，難度暫 25（作者填）。
- 過：三倍經驗（本場一般調情成功給多少就三倍）＋ ModifyData(FavorabilityExp,MC22,50);（作者定）＋福（各版提）→ 接回原成功線的合適格（不重領一般成功的經驗與好感，寫明理由）。
- 不過：禍（各版提一案，三版三種不同後果）；不死人、不留殘、不關線；代價只落好感、錢、面子；**不得像一般調情失敗**。
- \`CrossOverLover\` 那條分流不動。娜娜聲口照卡；不碰她的血脈與身世揭露（文本創作指南 0.6）。`,
    lenses: [
      { tag: '甲', name: '禍落在娜娜怎麼看你', brief: '她的反應出乎預料，但不是一般調情失敗那種：例如她當真了、反將你一軍、把你的話拿去做別的用，讓你當場下不了台。' },
      { tag: '乙', name: '禍落在旁人', brief: '後果落在七夕這場在場的旁人或既有的人事上（照 JSON 誰在場）：被聽見、被誤會、被傳出去，代價是面子或別人的好感。不新建 NPC。' },
      { tag: '丙', name: '另一種出乎預料', brief: '跟甲、乙都不同的第三種禍，仍不是一般調情失敗、不是嚇昏嚇跑、不碰她的身世；自己想一個讓作者眼睛一亮的後果。' },
    ],
    checks: CHECKS_FUHUO2('CrossOverLover 分流不動；好感 +50 照作者定；娜娜身世不揭'),
  },
  {
    key: '七夕張寧', box: '180年7月', group: 1, kind: '福禍',
    out: '劇情/高難度檢定_七夕張寧.md',
    json: 'Json/主線事件/180年/7月.json',
    overview: '劇情/180年事件/ 裡 07 月那份月檔的主線〈七夕〉張寧那段（查 劇情/索引.md）',
    voices: '張寧 MC6（先跑 既有台詞.py MC6、讀她的聲口卡與 @角色設定/張寧.md）；你 MC1；旁白 role2',
    anchors: '180/7 七夕・張寧：同檔，調情 12 那個選單加一項。情境包查清那個選單、調情 12 成功與失敗各接去哪、這段給多少好感。',
    spec: `- 掛點：調情 12 那個選單加一項高難度調情（同種並排）；選單前最後一格放固定旁白。
- 檢定：調情 FlirtingCheck，難度暫 25（作者填）。
- 過：三倍經驗＋ ModifyData(FavorabilityExp,MC6,50);（作者定）＋福（各版提）→ 接回原成功線的合適格（不重領）。
- 不過：禍（各版提一案，三版三種不同後果）；不死人、不留殘、不關線；代價只落好感、錢、面子；**不得像一般調情失敗**。
- **0.6：不碰符水、太平道、張角；張寧不表態**（不說喜歡、不承諾）。同檔娜娜那場也在寫，兩場的福禍不要撞。`,
    lenses: [
      { tag: '甲', name: '禍落在張寧怎麼看你', brief: '她的反應出乎預料，但不是一般調情失敗那種，也不表態：例如她把你的話當成病症來看、認真替你診起來，讓你下不了台。' },
      { tag: '乙', name: '禍落在旁人', brief: '後果落在七夕這場在場的旁人或既有的人事上：被聽見、被誤會、被傳出去，代價是面子或別人的好感。不新建 NPC、不碰太平道。' },
      { tag: '丙', name: '另一種出乎預料', brief: '跟甲、乙都不同的第三種禍，仍不是一般調情失敗、不讓她表態、不碰符水太平道；自己想一個讓作者眼睛一亮的後果。' },
    ],
    checks: CHECKS_FUHUO2('0.6：不碰符水、太平道、張角；張寧不表態；好感 +50 照作者定；不跟同檔七夕娜娜撞'),
  },
  {
    key: '董卓認子', box: '180年12月', group: 1, kind: '轉機',
    out: '劇情/高難度檢定_董卓認子.md',
    json: 'Json/主線事件/180年/12月.json',
    overview: '劇情/180年事件/ 裡 12 月那份月檔的主線〈董卓認子〉（查 劇情/索引.md）',
    voices: '董卓 MC12、徐榮 MC5（先跑 既有台詞.py MC12、MC5，讀聲口卡與 @角色設定/董卓.md、徐榮.md）；在場其他人照 JSON；你 MC1；旁白 role2',
    anchors: '180/12 〈董卓認子〉：口才（#74 → #768 失敗）與武藝（#75 → #868 失敗）兩條失敗線；現況 #84 董卓「換來這麼一句胡話？」→ #85 徐榮「徐某擔著」→ #86 董卓「罷了」（徐榮救場、主角留下）；「留下」那條勝利線（#81 之後的無條件格）。情境包逐格抄這幾段、Ending_1 的寫法（全案 ShowEnding(Ending_1) 先例）、兩條失敗線目前各接去哪。',
    spec: `**作者指定例外：轉機接在檢定失敗之後。作者 2026-09-27 裁示：兩條失敗線一併新寫成「董卓把你帶走 → Ending_1」**；現況 #84–#86（徐榮救場、主角留下）**不再是失敗線的結局**。
- ① 新寫失敗線：口才失敗、武藝失敗兩個入口匯流成一條：董卓帶走你（寫成看得見的動作與一兩句台詞），收在 ShowEnding(Ending_1)（照全案先例的格式）。
- ② 在帶走定局之前插轉機選單：**轉機選項＋「離開」**（離開＝功能鈕，不接發言格，直接接回新寫的失敗線往下走到 Ending_1）。轉機選項格式 [em2][〈名〉檢定][/em2][em3]置之死地，而後生[/em3]；**口才、武藝已用過，另選一種**（各版選一種並說明，例如厚黑、威嚇、魅力、內功）；難度暫 27（第二章轉機，作者填）。
- 過＝接回「留下」那條勝利線的無條件格（#81 之後，查清哪一格），之後一格不動；經驗照該檢定一般值。
- 不過＝**扣二百錢 ModifyData(Coin,-200);，掛在不過那條第一格（空格：actorID 0、text 空、Continue(); 開頭），不寫任何解釋的台詞**，接回新寫的失敗線 → Ending_1。
- ③ 舊的 #84–#86 那組怎麼處置（改接到哪、或不再有人連進去當孤兒）寫進〈待作者定〉，給建議與替代做法；**AI 不刪既有格**。
- 轉機是打輸（這裡是檢定輸）之後的一把，選單前最後一格放固定旁白（打輸之後、轉機選單之前）。
- 董卓、徐榮聲口照卡；不碰董卓後續野心的揭露節奏（0.6）；翻盤的說法要配董卓這個人（他服的是什麼）。`,
    lenses: [
      { tag: '甲', name: '照清單最省', brief: '格數最少：失敗線兩三格、轉機選單、過的尾巴一兩格接回勝利線。' },
      { tag: '乙', name: '接戲', brief: '先把月檔董卓認子那段從頭讀到尾，照董卓與徐榮原本的嗓子，讓帶走與翻盤都像這場戲原本的一部分；格數可比甲多一兩格。' },
      { tag: '丙', name: '另一種翻盤', brief: '換一種檢定與翻盤的說法（跟甲、乙不同），讓作者有真的不一樣的選擇；仍接回同一格勝利線、仍守全部規矩。' },
    ],
    checks: [
      '分類與走向：轉機（作者指定例外：接在檢定失敗後）。過＝接回「留下」勝利線的無條件格、之後不動；不過＝扣二百錢空格、不解釋，接回新寫的失敗線 → Ending_1',
      '引擎寫法：轉機選單＝轉機選項＋離開（離開不接發言格）；擲骰四段包裝、隔一格、IsPassDice 掛分支首格；選項格式 [em2][〈名〉檢定][/em2][em3]置之死地，而後生[/em3]；檢定不是口才也不是武藝；選項格不掛教學；Description 只准詞表',
      '新寫的失敗線：口才、武藝兩個失敗入口都匯流進來、收在 ShowEnding(Ending_1)（照全案先例）；#84–#86 不刪、處置寫進待作者定',
      '翻盤的說法配董卓；尾巴真的翻盤，不是他放你走或徐榮救場',
      '指引：打輸之後、轉機選單之前最後一格是固定旁白，一字不改；不寫燙熱顫震',
      '變數與編號：不自取名、不新建變數任務、不動 title、不改既有格的字（改 links 可以）',
      '內容三道線與價值觀：禁詞、0.6（董卓後續、骰子、張角）、饕餮廢案；東漢價值觀',
      '文風規矩 1–6 與聲口：董卓、徐榮貼既有句；主角；台詞可見字數 50 內；em7 每十格至多一個',
    ],
  },
]

const UNITS = A.only ? UNITS_ALL.filter(u => A.only.includes(u.key)) : UNITS_ALL
const OUTS = UNITS_ALL.map(u => u.out)

const lensName = (u, tag) => { const l = u.lenses.find(x => x.tag === tag); return l ? l.name : '' }
const packetPath = box => `${HC}/${box}/packet.md`
const draftPath = (u, tag) => `${HC}/${u.key}/draft-${tag}.md`
const revisedPath = (u, tag) => `${HC}/${u.key}/revised-${tag}.md`

function unitHead(u) {
  return `場：${u.key}（${u.kind}）｜箱庭情境包：${packetPath(u.box)}
JSON：${u.json}（已進 Unity，新格不編號、不改既有格的字、不動 title）
總覽稿（回讀稿，只讀不改）：${u.overview}
錨點：${u.anchors}
聲口：${u.voices}
規格：
${u.spec}
本場八項檢查：
${u.checks.map((c, i) => `${i + 1}. ${c}`).join('\n')}`
}

const DRAFT_FILE_FORMAT = `檔案結構（每節都要有，沒有內容寫「（無）」）：
# 起草稿｜〈場〉｜〈甲乙丙〉（〈取向名〉）
## 取向（一句）
## 秘密（未卜才有：藏什麼、為何藏、去哪兌現，一句話）
## 檢定（檢定名與 FeatID、難度）
## 掛點與接回（逐條：插在哪一格的 links／哪一格之後 → 接回哪一格：做什麼、幾格）
## 讀的條件（逐行）
## 寫的指令（Script／ModifyData 逐行）
## 戲（創作稿本體：每格 說話者行＋全文，底下 actorID／Sequence／Conditions／Script／Description 有才寫；新格用【A】【B】…標；分岔 ▶；合流「→ 接 #N」）
## 兌現處（未卜才有：哪份 JSON、插在哪一格的 links、新選項格與其後一兩格、Conditions、接回哪一格）
## 起草者自檢（逐條對照八項檢查與文風規矩 1–6；節奏檢查的結果貼這裡）`

function scoutPrompt(box, units) {
  return `${COMMON}

你是箱庭「${box}」的情境整理，只讀不改專案檔。本箱庭這一批要寫的場：
${units.map(u => '\n---\n' + unitHead(u)).join('\n')}

請把情境包寫成檔案 ${packetPath(box)}（用 Write；目錄不存在就建）。內容（純事實、逐字原文，不提改法）：
1. 規則原文：從 ${GUIDE} 逐字抄出第一節整節（含〈選項格式〉與三句題語）、第五節本批用到的類別那幾小節、第六節規則十三條、第七之二節「往後每一次」、第九節本箱庭素材盤點裡本批場次那幾列與說明文字、第十一節〈已定場次清單〉本批那幾列與〈執筆 agent 通用規則〉。
2. 現行拍子：每一場從掛點前十格到每個接回點後十格的每一格（說話者、entryID、[panel=N]、全文、Sequence／Script／Conditions／註記／分流），逐字；轉機要把勝利線與失敗線都抄到收尾（含變數、獎勵）。
3. JSON 事實：掛點與接回點的 actorID、text、Conditions、Sequence、Script、Description、links，與所有指向它們的 parent；既有擲骰流那幾格（選項格、擲骰格四段包裝原文、發言格、成敗首格）逐字抄；有娜娜／沒娜娜（IsInTeam("MC22")）的分流全部列出；每一場會播到掛點的每條來路與條件。
4. 指引既有句：Json/小溪村後山/赫連娜娜、張寧.json #784、#785 全文；本箱庭既有 [em2][隱藏選項][/em2] 的寫法各一例（entryID、text、Conditions）。
5. 聲口：本批每個會開口的角色，把本箱庭 JSON 裡他的每一句都撈出來（grep -n '"actorID": "<ID>"' -A2），另跑 python -X utf8 給AI看的指南/既有台詞.py 撈 MC8、MC22 各十五句代表句；狗頭人把 role123／role105／role107／role106 全撈。
6. 設定：本箱庭 @設定 檔與 00 總覽的說話者對照、疑點；@角色設定/蕭靈犀.md、赫連娜娜.md 的聲口段；給AI看的指南/文本創作指南.md 0.2.3 全節與 0.6 序章那幾條。
7. 兌現處（未卜的場才做）：本箱庭資料夾每份 JSON 裡有選單的既有互動點（entryID、text、links、Conditions、前後三格），與那一場已經揭露了什麼。
8. 每一場特別要查的事實：各場「錨點」裡點名要查的每一件事都查清楚寫進來（選單格、各條路接去哪、任務與變數、同伴條件、道具 ID、相關設定檔段落）。只寫事實。
9. 指南摘錄（作者 2026-09-26 裁示：起草者只讀情境包，視同讀過三份指南，所以這一節要抄齊）：逐字抄出 給AI看的指南/文本創作指南.md 第零層高概念那幾段、0.2.3 全節、0.6 序章那幾條、2.1a 全節；給AI看的指南/世界觀.md 第八節全節；給AI看的指南/武俠文風創作指南.md〈零、常犯十條〉整節（**放在情境包最前面，起草者先看錯例再動筆**）、第四節開頭通則、旁白卡、你（主角）卡、本批每個出場角色的聲口卡（沒有卡的角色註明「無卡，照第 5 項既有句」）、7.1a–7.1c、7.3、第八節自檢清單；@角色設定/饕餮.md 第十節廢案清單與停用術語；劇情/轉成json指南.md §1 Description 詞表與 §4.2 開頭的通則與選項文字規矩；給AI看的指南/擲骰指令轉換規則.md〈擲骰節點的 Sequence 固定寫法〉第 1、2 條與〈常用檢定項目ID對照〉表；給AI看的指南/立繪指令轉換規則.md 裡本批出場角色可用的 pic 格號與表情特效名稱。
寫完檔案後，回傳一頁摘要（兩千字內）：每場的掛點、接回點、來路條件、會開口的角色與 ID、兌現處候選清單、你發現起草者一定要知道的坑。摘要是給下游看的目錄，細節都在檔案裡。`
}

function draftPrompt(u, lens) {
  return `${COMMON}

你是起草者（${lens.tag}｜${lens.name}）。你的取向：${lens.brief}
${unitHead(u)}

做法（作者 2026-09-26 裁示，省回合）：只讀情境包 ${packetPath(u.box)}。它的〈指南摘錄〉一節已逐字收了三份指南與各轉換規則裡寫這場戲用得到的節，**讀情境包即視同讀過 CLAUDE.md 要求的三份指南，不必再開指南原檔**。起草只管寫戲：**不回 JSON、總覽稿查連線與來路**，接不接得通、既有格有沒有被動，交給下一步的審修。只有情境包真的缺了寫戲非要不可的東西（某個角色的句子、某格原文）時，才去原檔讀那一段，並在〈起草者自檢〉記一筆缺了什麼。不要改任何專案檔。
把稿寫成檔案 ${draftPath(u, lens.tag)}（用 Write；目錄不存在就建）。
${DRAFT_FILE_FORMAT}
寫完只跑一次 python -X utf8 給AI看的指南/文風節奏檢查.py <檔>，照報告修一次就交，不再重跑；報告和你修了什麼貼進〈起草者自檢〉，沒修完的交給審修。
回傳 JSON：file（檔案路徑）、approach（一句取向）、check_id、secret（未卜才有，否則空字串）、self_check（三五句：八項檢查哪幾項你自己拿不準、節奏檢查結果）。`
}

function revisePrompt(u, d) {
  return `${COMMON}

你是審修（版${d.label}）。一人審一版：逐項查，能修的直接修進稿裡，修不了的列出來。
${unitHead(u)}

起草稿：${d.file}（先讀）；情境包：${packetPath(u.box)}（先讀本場那幾段）；起草者的自檢：${d.self_check || '（無）'}

查什麼：
1. 本場八項檢查逐項：回原 JSON、原總覽稿查證掛點、接回點、每條來路、既有格的字有沒有被改、變數與任務號是不是留 ＿＿、擲骰格四段、IsPassDice 掛位、獎勵與代價指令、選項格式、Description 詞表（劇情/轉成json指南.md §1）。
2. 文風規矩 1–6 逐句：內心話、判語、動作鏈、假精確、翻轉句、否定句收尾、比喻巧句收尾、碎句與句長、旁白「」與破折號、em7、單字名詞、時代錯置；口吻對照情境包裡那個角色的既有句（讀 給AI看的指南/武俠文風創作指南.md 第四節旁白卡與本場角色卡、給AI看的指南/武俠文風審校清單.md）。
3. 未卜的場另查「額外」：拿到的東西是不是沒有這一骰就不存在；兌現處掛得上、條件寫對。轉機的場另查翻盤是真的翻盤、接回勝利線之後一格沒被動。福禍的場另查禍的紅線。
怎麼修：句子、指令、接法能修就直接修，修完那一格仍要守取向（版${d.label}是「${lensName(u, d.label)}」），不要把它修成別的版；該作者定的不要替作者定，留 ＿＿ 並記下來。
寫成檔案 ${revisedPath(u, d.label)}（結構同起草稿），檔尾加三節：
## 旁白逐格表（作者 2026-09-28 要求：每一個旁白格一行——格名｜第 3 條判語、心事、替玩家下感受：過或改｜第 7 條造景細節、精確數目、動作鏈超過兩拍、收尾巧句：過或改｜改了什麼。不准整段打勾，一格一格重讀；文風節奏檢查.py 列的「旁白卡候選」每一條都要在這張表裡有交代）
## 審修紀錄（每一處改動：第幾格、原句→新句、依哪條規矩）
## 待作者定（修不了或不該由 AI 定的）
修完跑一次 python -X utf8 給AI看的指南/文風節奏檢查.py <檔> 與 python -X utf8 給AI看的指南/高難度檢定檢查.py <檔>（後者檔頭沒分類會警告，不管它；其他報的要處理）。不要改任何專案檔。
回傳 JSON：file、verdicts（八項各一筆：check、verdict 是 pass／fixed／unresolved、note 一句）、changes（改了幾處）、summary（三五句：這版最大的問題是什麼、修了什麼、還剩什麼）。`
}

function finalPrompt(u, revs) {
  return `${COMMON}

你是本場的終審兼編輯。三版已各經一名審修。你的工作：再挑一次錯、標一版建議、寫成提案檔、跑兩支檢查腳本。
${unitHead(u)}

三版審修稿（先全部讀完）：
${revs.map(r => `- 版${r.label}（${lensName(u, r.label)}）：${r.file}；審修結論：${r.summary}；verdicts：${JSON.stringify(r.verdicts)}`).join('\n')}
情境包：${packetPath(u.box)}

做法：
1. 挑錯：重點放審修最容易漏的：每條來路從掛點前十格讀到接回點後十格接不接得通、擲骰結構、獎勵與代價指令、變數與教學 ID 留白、選項格式與題語、未卜的「額外」、轉機的「真的翻盤」與接回點之後一格沒動、福禍的禍不死人不關線、三版是不是三個真的不一樣的選擇。發現就直接改，並記進該版的〈審修紀錄〉（標「終審」）。
2. 建議版：挑一版，理由一句（通過項最多、接戲最順、最合規格）。
3. 寫提案檔 ${u.out}（用 Write；資料夾不存在就建；已存在就整檔覆寫）：
   第一行「# ${u.key}　高難度檢定提案（${u.kind}）｜創作稿／提案，尚未進 JSON」；
   引用區塊：「📝 ${DATE} 三版待作者挑一版；規矩見 ${GUIDE} 第一、四、五、六、七之二節與第十一節已定場次清單，本檔只放戲。」、掛點與接回（既有 entryID）、「新格不編號，作者續號；已進 Unity 的節點不改字、不動 title」、「**建議版：**」＋理由、「**待作者填：**」（難度、教學 ID、變數名、指引用特效或固定旁白、檢定用哪個等）；
   三版各一節「## 版一（甲｜取向）」「## 版二（乙｜取向）」「## 版三（丙｜取向）」：節首列取向、秘密（未卜）、檢定與 FeatID、掛點與接回、讀的條件、寫的指令；「### 戲」放審修稿的〈戲〉；未卜另有「### 兌現處」；「### 審修紀錄」放該版的紀錄（含你終審的改動）；
   「## 待作者定」：三版的〈待作者定〉合併去重，每條前加 ⚠；
   「## 審修摘要」：每版八項 pass／fixed／unresolved 的數目與剩下的 unresolved 項。
4. 跑 python -X utf8 給AI看的指南/文風節奏檢查.py "${u.out}" 與 python -X utf8 給AI看的指南/高難度檢定檢查.py "${u.out}"，報的照規矩修到不報（改了要同步改該版〈戲〉並記進審修紀錄），或在〈待作者定〉說明為何留。
5. 跑 git status：本流程只該動這些提案檔（作者 2026-09-26：提案檔一律放 劇情/ 根層）：${OUTS.join('、')}（別場的終審可能同時在寫別的檔）。不動 Json/、回讀稿、${GUIDE}、其他檔。
回傳 JSON：out、recommended（label、reason）、unresolved（字串陣列）、rhythm（節奏檢查最後一行）、format（格式檢查最後一行）、summary（三五句：三版各是什麼、你改了什麼、為什麼建議那版）。`
}

function logicPrompt(u, r) {
  return `${COMMON}

你是邏輯審（版${r.label}）。審修已經修過規矩與口吻，你只看這場戲的事理通不通：先讀情境包裡這一場的現行拍子與來路，再逐格讀 ${r.file}。
${unitHead(u)}

查什麼（只管事理，規矩、格式、口吻前面的審修管過了）：
1. 誰知道什麼：每一格說話的人、主角、旁白此刻知道的事，是不是前面已經看見或聽見的。沒看見的不能認出，沒聽見的不能回答，同一件事不能認第二次、不能講第二次。
2. 先後因果：先看見才能叫人、先問才有答、先做才有結果；轉場前後的時辰、天色、地點接得上；人在哪、誰在場，前後一致。
3. 東西的去向：拿出來的東西有收回或交代；沒有憑空多出來的東西。
4. 台詞與旁白不打架：旁白不重講台詞剛講的事，也不比台詞晚一步才交代台詞已經用到的事實；選項文字跟後面的戲對得上。
5. 條件與分支：每條分支的前提在那條路上真的成立。
6. 前後場接口：這一場開頭假定的事，前一場真的演過；這一場結尾留下的狀態，後一場用得上。
怎麼修：能修就直接修進同一份檔，修完那一格仍守該版取向與文風規矩 1–6；拿不準的列出來不改。檔尾〈審修紀錄〉續加，每條標「邏輯審」；〈待作者定〉續加。修完跑一次 python -X utf8 給AI看的指南/文風節奏檢查.py <檔>。不動任何專案檔。
回傳 JSON：file、issues（每筆：where、problem、fix、fixed 是 true／false）、summary（兩三句）。`
}
const LOGIC_SCHEMA = { type: 'object', properties: {
  file: { type: 'string' },
  issues: { type: 'array', items: { type: 'object', properties: {
    where: { type: 'string' }, problem: { type: 'string' }, fix: { type: 'string' }, fixed: { type: 'boolean' },
  }, required: ['where', 'problem', 'fix', 'fixed'] } },
  summary: { type: 'string' },
}, required: ['file', 'issues', 'summary'] }
const DRAFT_SCHEMA = { type: 'object', properties: {
  file: { type: 'string' }, approach: { type: 'string' }, check_id: { type: 'string' }, secret: { type: 'string' }, self_check: { type: 'string' },
}, required: ['file', 'approach', 'check_id', 'secret', 'self_check'] }
const REVISE_SCHEMA = { type: 'object', properties: {
  file: { type: 'string' },
  verdicts: { type: 'array', items: { type: 'object', properties: {
    check: { type: 'string' }, verdict: { type: 'string', enum: ['pass', 'fixed', 'unresolved'] }, note: { type: 'string' },
  }, required: ['check', 'verdict', 'note'] } },
  changes: { type: 'integer' }, summary: { type: 'string' },
}, required: ['file', 'verdicts', 'changes', 'summary'] }
const FINAL_SCHEMA = { type: 'object', properties: {
  out: { type: 'string' },
  recommended: { type: 'object', properties: { label: { type: 'string' }, reason: { type: 'string' } }, required: ['label', 'reason'] },
  unresolved: { type: 'array', items: { type: 'string' } },
  rhythm: { type: 'string' }, format: { type: 'string' }, summary: { type: 'string' },
}, required: ['out', 'recommended', 'unresolved', 'rhythm', 'format', 'summary'] }

const scoutJobs = {}
function ensurePacket(box) {
  if (!scoutJobs[box]) {
    const units = UNITS_ALL.filter(u => u.box === box)
    const haveIt = units.some(u => A.have[u.key] && A.have[u.key].packet)
    scoutJobs[box] = haveIt
      ? Promise.resolve(true).then(() => { log(`${box}：情境包沿用 ${packetPath(box)}`); return true })
      : agent(scoutPrompt(box, UNITS.filter(u => u.box === box)), { label: `scout:${box}`, phase: 'Scout', effort: 'medium', model: MODEL }).then(r => !!r)
  }
  return scoutJobs[box]
}

async function runScene(u) {
  const had = (A.have[u.key] && A.have[u.key].drafts) || []
  const drafts = (await parallel(u.lenses.map(l => async () => {
    if (had.includes(l.tag)) return { label: l.tag, file: draftPath(u, l.tag), self_check: '（沿用舊 run 的起草稿，自檢見檔尾）' }
    const r = await agent(draftPrompt(u, l), { label: `draft-${l.tag}:${u.key}`, phase: 'Draft', effort: 'high', model: MODEL, schema: DRAFT_SCHEMA })
    return r ? { label: l.tag, ...r, file: draftPath(u, l.tag) } : null
  }))).filter(Boolean)
  if (!drafts.length) return { unit: u.key, error: 'all drafts failed' }
  log(`${u.key}：${drafts.length} 版起草稿就位，送審修`)
  const revs = (await parallel(drafts.map(d => () =>
    agent(revisePrompt(u, d), { label: `revise-${d.label}:${u.key}`, phase: 'Revise', effort: 'high', model: MODEL, schema: REVISE_SCHEMA })
      .then(r => r ? { label: d.label, ...r, file: revisedPath(u, d.label) } : null)))).filter(Boolean)
  if (!revs.length) return { unit: u.key, error: 'all revisions failed', drafts }
  const logics = (await parallel(revs.map(r => () =>
    agent(logicPrompt(u, r), { label: `logic-${r.label}:${u.key}`, phase: 'Logic', effort: 'max', model: MODEL, schema: LOGIC_SCHEMA })
      .then(x => x ? { ...r, logic: x, summary: r.summary + '｜邏輯審：' + x.summary } : r)))).filter(Boolean)
  log(`${u.key}：邏輯審完成，送終審`)
  const fin = await agent(finalPrompt(u, logics), { label: `final:${u.key}`, phase: 'Final', effort: 'high', model: MODEL, schema: FINAL_SCHEMA })
  if (!fin) return { unit: u.key, error: 'final failed', revs }
  log(`${u.key}：提案檔完成，建議版 ${fin.recommended.label}，待作者定 ${fin.unresolved.length} 件`)
  return { unit: u.key, out: fin.out, recommended: fin.recommended, unresolved: fin.unresolved, rhythm: fin.rhythm, format: fin.format, summary: fin.summary,
    revisions: revs.map(r => ({ label: r.label, changes: r.changes, unresolved: r.verdicts.filter(v => v.verdict === 'unresolved').length, summary: r.summary })) }
}

// 作者 2026-09-26：六場同時跑；同一箱庭的場等同一份情境包。
log(`同時開跑：${UNITS.map(u => u.key).join('、')}`)
const results = (await parallel(UNITS.map(u => async () => {
  const ok = await ensurePacket(u.box)
  if (!ok) return { unit: u.key, error: 'scout failed' }
  return await runScene(u)
}))).filter(Boolean)
return { date: DATE, units: results }
