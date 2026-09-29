export const meta = {
  name: 'hard-check-jail2',
  description: '越獄另開一案（禍要跟一般口才的成功與失敗都不同）；沿用第三批（猴群、血池、菈沙、越獄、擂台炒場、釣魚叟、洞口對峙）第二級流程：一箱庭一情境包（走檔案）、每場三起草、三審修（一人審一版並修）、一終審挑錯並寫提案檔；不再有審稿團、定稿、複核、稽核四層',
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
const A = Object.assign({ date: '＿＿＿＿-＿＿-＿＿', only: null, have: {}, hc: 'C:/Users/user/AppData/Local/Temp/claude/d--QilinStory/4acb5323-b153-440b-8c80-a1d714f7ce95/scratchpad/hc3' }, args || {})
const DATE = A.date
const MODEL = A.model || 'opus'   // 作者 2026-09-26：子 agent 一律 Opus 5.5
const HC = A.hc
const GUIDE = '給AI看的指南/高難度檢定走向指南.md'

const COMMON = `你在做《異麒麟》高難度檢定的提案（第三批，2026-09-27 規則）。規矩全在 ${GUIDE}：第一節三個分類與〈選項格式〉、第四節引擎寫法、第五節走向細則、第六節規則、第七之二節指引（骰子亮）、第九節各箱庭素材盤點、第十一節〈已定場次清單〉與〈執筆 agent 通用規則〉。本提示只摘要，拿不準翻指南那一節；指南與本摘要衝突以指南為準。前兩批（小溪村、破廟）的定稿可當範例：劇情/舊創作稿/高難度檢定_碰瓷.md、_村長.md、_河童第二戰.md、_狗頭人打劫.md、_阿佑.md、_阿傑.md 的〈✅ 定稿〉節（未選原稿各節不要看）。
- 什麼叫高難度檢定：在既有選單旁邊加一個高難度擲骰選項，過或不過至少有一邊跟原本的分支不同。難度作者填，稿裡寫暫定值（各場另註）。
- 選項格式（已定）：檢定標籤＋題語，選單上沒有主角的話、不加引號、不出現分類名：福禍 [em2][威嚇檢定][/em2][em3]禍兮福倚，福兮禍伏[/em3]；未卜 [em2][洞悉檢定][/em2][em3]知其一，不知其二[/em3]；轉機 [em2][厚黑檢定][/em2][em3]置之死地，而後生[/em3]。檢定名照實際用的寫、只用遊戲既有標籤（口才檢定＝PersuasionCheck）。真正的話在擲骰之後的主角發言格才講。同一選單優先用普通選項那一種檢定。
- 福禍：過＝三倍經驗（該對話一般檢定給多少就三倍）＋福（加倍獎勵或新分支）；不過＝禍，一條新分支（極端結果＋代價），不是原本的失敗。禍不死人、不留殘、不關線；代價只落好感、錢、面子；極端結果不得跟前兩批重複（碰瓷已用過「嚇昏」、狗頭人用過「嚇跑丟下同伴」）。
- 未卜：過＝額外的情報，帶來額外的獎勵；經驗跟該對話一般檢定一樣。把本來就會拿到的東西提早給、把本來要走的關跳過、直接給謎底，都不算。不過＝回到原本檢定失敗那條，不再給第二次骰。變數用作者給的 IsHiddenN（各場另註）。
- 轉機（本批沒有）：略。
- 引擎寫法（違反即退）：一個選項一顆骰，自己接一個擲骰格，不跟普通選項共用。結構照 劇情/轉成json指南.md §4.2（含第 7 項底下 ⚠ 高難度例外）：選項格（actorID MC1，Description「選項N」，**不掛教學**：教學只在碰瓷）→ 擲骰格（actorID 0、text 空、Description「〈名〉檢定」、Sequence 四段：SetContinueMode(false);SetContinueMode(original)@Message(EndRoll);Continue()@Message(EndRoll);BeginDiceRoll(Manual,〈FeatID〉,〈難度〉);）→ 主角發言格（MC1，把話講完整，過不過共用）→ 成功分支首格 Conditions: IsPassDice() == true; ／失敗分支首格 Conditions: IsPassDice() == false;。FeatID 只能用 給AI看的指南/擲骰指令轉換規則.md〈常用檢定項目ID對照〉裡的。
- Description 照 劇情/轉成json指南.md §1 詞表：選項格「選項N」、好感帶角色名（例「蕭靈犀好感度下降」）、經驗「〈項目〉經驗增加」，不寫數值、不寫說明。
- 指引（骰子亮）：帶高難度選項的選單之前、選單前最後一格，放固定旁白一字不改：[panel=6]＊（懷裡的麒麟骰亮了一亮。光隔著衣襟透出來，隨即又暗了。）＊，actorID role2；這一格只有骰子和主角，不寫同伴、不寫判語、不寫燙熱顫震；主角立繪可切 SetPortrait(MC1,pic=12);，不掛表情特效。不另寫介紹、不掛教學。
- 硬紅線：不自取變數名、任務號、教學 ID（作者沒給的一律留 ＿＿）；SetFlag／GetFlag 禁用；不新建地點、道具、NPC；已進 Unity 的節點不改號、不改字、不動 title（改 links 可以；各場另註准改的除外）；新格不編號；不寫 title。
- 內容三道線：給AI看的指南/世界觀.md 第八節禁詞（五胡亂華、司馬、篡魏、三國歸晉、輪迴、重來、前世）；給AI看的指南/文本創作指南.md 0.6 揭露節奏；@角色設定/饕餮.md 第十節廢案清單與第四、五節（燙＝她醒，高難度檢定的格子不得寫燙熱顫震）。用東漢的價值觀寫，不加道德評語，旁人怎麼看他才是反應。
- 稿的寫法（創作稿）：說話者行 **旁白:**／**你:**／**〈角色〉:**（主角一律「你」），旁白 [panel=6]＊（…）＊，台詞「…」；每格底下 - actorID: / - Sequence: / - Conditions: / - Script: / - Description: / - 註記: 各一行，有才寫；立繪與表情寫在 Sequence（照 給AI看的指南/立繪指令轉換規則.md；選單前那一格不掛表情特效；開了的特效下一格要關）。分岔用 ▶，合流寫「→ 接 #N」，新格用【A】【B】…標，不寫 entryID。不動 Json/、不動 Unity、不動回讀稿、不動 ${GUIDE}。
- 文風規矩（違反即退）：1. 旁白看得見你做什麼、看不見你想什麼：不寫內心話、不替玩家下感受或結論、不替角色斷定心裡怎樣。2. 寫結果和狀態，不寫過程；一格裡同一個人的動作最多兩拍；不編精確數目、距離和純造景小細節。3. 作者退過的句型不得再犯：「不是 X，是 Y」翻轉句；否定句收尾造氣氛；「像……」比喻巧句收尾；收尾加新判語；旁白先把下一格台詞要講的事講掉；同一件事隔幾格又講一遍。4. 句子寫完整，不斷碎句：旁白一格兩三句、每句十九到二十五字、不留五字以下的句子；角色台詞一句十五字上下、可見字數 50 內，照那個角色既有的口吻。5. 旁白裡不寫「」引號；**全篇不用破折號「——」，台詞也不用**（打斷、沒說完用「……」；文風指南旁白卡第 9 條）；[em7] 每十格至多一個、同一人不連掛，[/em7] 後必接標點。6. 不自創單字名詞；東漢稱謂與用詞（「縣衙」不用，寫「官府」）；硬紅線詞永不進文本。
- 省回合的規矩：情境包已收好本場的規則原文、掛點連線、每條來路、既有台詞、兌現處候選、指南摘錄，先讀它；只在拿不準時回原檔查那一段，不要整本重讀。檢查腳本各跑一次就好。給作者看的話用白話短句。日期一律寫 ${DATE}。`

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

const UNITS_ALL = [
  {
    key: '猴群霸凌', box: '179年9月探索', group: 1, kind: '福禍',
    out: '劇情/高難度檢定_猴群霸凌.md',
    json: 'Json/探索事件/179年/9月.json',
    overview: '劇情/179年事件/09月(主)瘋老人與少年郎(支)猴群霸凌、小猴送酒、小犀說家用.md 的支線〈猴群霸凌〉',
    voices: '猴群與小猴（照 JSON 的 actorID；情境包撈全部句子）；蕭靈犀 MC8；赫連娜娜 MC22（在隊與否照 JSON 條件）；你 MC1；旁白 role2',
    anchors: '任務 CF19〈猴群霸凌〉：威嚇 12／戰鬥（Combat 43，軟輸）／不管 那個選單加一項。情境包要查清選單格、三條路各接去哪、CF19 怎麼記、小猴（拔猴相助線起點）在每條路的狀態。',
    spec: `- 掛點：威嚇 12／戰鬥／不管 那個選單加一項；選單前最後一格放固定旁白。
- 檢定：威嚇 IntimidationCheck，難度暫 20（第一章 20～22，作者填）。
- 過：三倍經驗（本場一般威嚇給多少就三倍，查 JSON）＋福（各版提）→ 接回原本威嚇成功那條或合流格，寫明理由；CF19 照原成功線記。
- 不過：禍（各版提一案）；禍不死人、不關 CF19；**小猴是拔猴相助線的起點，禍不得動到牠**（不能讓牠受傷、跑掉、改變後續能不能相遇）；禍之後接回哪一條既有的路寫明。`,
    lenses: LENS_ACT('猴群霸凌'),
    checks: CHECKS_FUHUO('小猴與拔猴相助線不受影響；CF19 不關'),
  },
  {
    key: '血池', box: '黑鐵嶺', group: 1, kind: '福禍',
    out: '劇情/高難度檢定_血池.md',
    json: 'Json/大地圖/黑鐵嶺礦坑.json',
    overview: '劇情/黑鐵嶺礦坑/黑鐵嶺礦坑.md',
    voices: '赫連娜娜 MC22、蕭靈犀 MC8 等在場同伴（照 JSON）；你 MC1；旁白 role2',
    anchors: '血池：洞悉 10 → 內功 10／15／仁心 那個選單加一項。⚠ 作者只說「黑鐵嶺的」，指南依盤點表指血池；情境包先確認血池那個選單在哪、內功 10／15／仁心各接去哪、內功成功給什麼。',
    spec: `- 掛點：洞悉 10 之後那個內功 10／15／仁心 選單加一項；選單前最後一格放固定旁白。
- 檢定：內功 QiCheck，難度暫 20（作者填）。
- 過：三倍經驗（本場一般內功檢定給多少就三倍）＋福（各版提）→ 接回原成功線或合流格，寫明理由。
- 不過：禍（各版提一案）。
- **紅線：血池連著祭壇的邪神。禍不得寫成她（饕餮）醒、不得寫燙熱顫震、不進凶戾那本帳（@角色設定/饕餮.md 第四、五節，動筆前讀）；祭壇那場（李大山、惡神碎片、骰子燙）照舊不放、不碰。** 禍的代價落在身體外的東西（錢、面子、同伴好感），不寫邪氣入體、不寫內功受損永久化。
- 在稿頭記一句「⚠ 作者只說黑鐵嶺的，依盤點表寫血池，請確認」。`,
    lenses: LENS_ACT('血池'),
    checks: CHECKS_FUHUO('饕餮紅線：不寫她醒、不寫燙熱顫震、不進凶戾帳；祭壇不碰'),
  },
  {
    key: '菈沙', box: '雲中', group: 1, kind: '未卜',
    out: '劇情/高難度檢定_菈沙.md',
    json: 'Json/大地圖/雲中/街道.json',
    overview: '劇情/雲中/01 街道.md 菈沙的攤子那段',
    voices: '菈沙 MC19（西域女商，主要是為了收東西；先跑 python -X utf8 給AI看的指南/既有台詞.py MC19）；蕭靈犀 MC8；赫連娜娜 MC22；你 MC1；旁白 role2',
    anchors: '菈沙的攤子：現在沒有選單，**新開一個**（作者選的丙案）。情境包要查清菈沙攤子那段對話的全部格、在哪一格之後能開選單、她現在說的「先帶來給我過目」在哪一格；惡神碎片的貴重品 ID（grep Json 找）；趙王洞 遺跡.json #4351 那場夢怎麼遞紅眼、計 HungryDesire；世界觀.md L242 前後對那顆東西三種稱呼的規矩。',
    spec: `- 掛點：在菈沙攤子那段對話裡新開一個選單：一個高難度選項＋一個「離開」（或照原對話該接的格），選單前最後一格放固定旁白。
- 檢定：口才 PersuasionCheck 或洞悉 InsightCheck（各版提、說明理由），難度暫 20（作者填）。
- 過：她說出她真正在收的那樣東西＝**惡神碎片**；她怎麼稱呼它要照 給AI看的指南/世界觀.md L242 前後三種稱呼的規矩（先讀）。該格 Script: Variable["IsHidden3"] = true;；經驗同一般檢定。→ 開啟任務或探險事件（任務號作者建：SetQuestState("＿＿", "active") 之類留 ＿＿），拿惡神碎片回報給她＝額外獎勵（給什麼作者定，留 ＿＿）。回報那段（主角帶著碎片再來、她收下）也要寫出來：掛 Variable["IsHidden3"] == true 且持有惡神碎片（IsValuablesObtained 照 JSON 既有寫法，ID 查出來）的隱藏選項。
- 不過：原本沒有檢定：不過＝她照舊只說「先帶來給我過目」那條。
- ⚠ 惡神碎片同時是趙王洞遺跡那場夢的東西（遺跡.json #4351 遞不遞紅眼，計 HungryDesire），**那格現在沒有持有判斷**：賣給菈沙之後那場夢會出現遞不出去的東西。**不要改遺跡.json**，在稿頭〈待作者定〉寫清楚這個衝突與幾種處理法（夢加持有判斷、任務時序排在夢之後…），作者定。
- 不寫饕餮、不碰碎片的來歷與凶戾；菈沙只當它是值錢的稀罕貨。`,
    lenses: LENS_ACT('菈沙'),
    checks: CHECKS_WEIBU('惡神碎片的稱呼照世界觀 L242；不改遺跡.json，衝突列待作者定；不碰碎片來歷、饕餮'),
  },
  {
    key: '越獄', box: '趙王洞', group: 1, kind: '福禍',
    out: '劇情/高難度檢定_越獄.md',
    json: 'Json/趙王洞/山賊窩.json',
    overview: '劇情/趙王洞/ 裡山賊窩那份總覽稿（查 劇情/索引.md）',
    voices: '廖淳 role127、看守的山賊（照 JSON）、在場同伴；你 MC1；旁白 role2',
    anchors: '山賊窩牢房越獄：口才 10／巧手 12／動手 那個選單加一項。情境包查清三條路各接去哪、三場戰鬥（輸了都是遊戲結束）在哪、廖淳在場的狀態。',
    spec: `- 掛點：選單 #22（口才 10 #23／巧手 12 #27／動手 #31）加一項；選單前最後一格放固定旁白。
- 檢定：口才或巧手（同選單同檢定；各版選一個並說明；巧手線本場一般經驗是 0，三倍仍是 0，選巧手就只剩福那一半），難度暫 20（作者填）。本對話口才一般成功給 +10（#26），三倍＝30。
- 過：三倍經驗＋福（各版提）→ 接回原成功線或合流格 #46，寫明理由。
- **不過＝禍，作者 2026-09-27 退回第一案：跟猴群、血池同樣的問題，禍和一般檢定的結果太接近。** 一般口才成功是：看守被大話嚇住，留下鑰匙逃走（#26 → #43 → #44）；一般失敗是：看守識破、進看守戰 Combat 66（#36 → #4124，輸＝遊戲結束）；巧手失敗與動手也進同一場戰鬥。第一案三版的禍都是「看守拿走你的錢、丟下鑰匙、自己走人」，跟一般口才成功幾乎一樣，**全部作廢**。
- **新的禍不得是：** 看守留下或丟下鑰匙後離開／逃走（＝一般成功）；看守識破你、動手、進任何一場戰鬥（＝一般失敗，而且三場輸了都是遊戲結束）；也不得是嚇昏（碰瓷）、嚇跑丟同伴（狗頭人）。要的是「出乎預料的另一種後果」。
- 禍不死人、不留殘、不關線，最後仍要讓你出得了牢房、接回合流格 #46（廖淳照舊入隊、之後宿舍 #53 與大廳照舊）；代價只落好感、錢、面子。**廖淳在場，白波軍與趙王洞祭壇的事不從這裡挖**；卞喜不能提前現身。
- 第一案存檔在 C:/Users/user/AppData/Local/Temp/claude/d--QilinStory/4acb5323-b153-440b-8c80-a1d714f7ce95/scratchpad/hc3/越獄_第一案.md，看它是為了**避開**，不是沿用。`,
    lenses: [
      { tag: '甲', name: '禍落在看守怎麼對你', brief: '看守的反應出乎預料，但不是留鑰匙走人、也不是動手：例如他信得太過頭，換了一種你不想要的方式對待你，讓你破財或丟臉，最後你還是出得了牢。' },
      { tag: '乙', name: '禍落在廖淳或牢裡的人', brief: '後果落在在場的廖淳（照他既有口吻與設定）或牢裡已存在的人身上：被牽連、誤會、看輕你，代價是好感與面子；不動廖淳入隊、不從他嘴裡挖白波軍與祭壇。' },
      { tag: '丙', name: '另一種出乎預料', brief: '跟甲、乙都不同的第三種禍，仍不是留鑰匙走人、不是打起來，也不是嚇昏、嚇跑丟同伴；自己想一個讓作者眼睛一亮的後果。' },
    ],
    checks: CHECKS_FUHUO('禍不推進會遊戲結束的戰鬥；白波軍、祭壇不從這裡挖；禍不得是看守留鑰匙走人（像一般成功）或識破動手（像一般失敗），三版的禍要三種不同的後果；最後仍接回 #46'),
  },
  {
    key: '擂台炒場', box: '武道大會', group: 1, kind: '福禍',
    out: '劇情/高難度檢定_擂台炒場.md',
    json: 'Json/大地圖/天下第一武道大會.json',
    overview: '劇情/天下第一武道大會/ 那份總覽稿（查 劇情/索引.md）',
    voices: '擂台主持、觀眾、各陣對手（照 JSON）；在場同伴；你 MC1；旁白 role2',
    anchors: '擂台每陣前的炒場（八陣）：各陣「炒場 口才／直接上」那個選單各加一項。**八陣是同一個設計重複，作者定為一處**。情境包列出八陣各自的選單格、口才炒場的成功失敗各接去哪、§4.2.1 口才炒場特例（劇情/轉成json指南.md）。',
    spec: `- 一個設計、套進八陣：稿裡先寫一份通用的戲（選項、擲骰、發言、福、禍），再寫一張「八陣套用表」：每陣的掛點選單格、接回格、要不要換掉哪一兩個字（例如對手名）。能不改字就不改字。
- 選單前最後一格放固定旁白（八陣各一格，文字相同）。
- 檢定：口才 PersuasionCheck（同選單同檢定），難度暫 25（第二章，作者填）；照 §4.2.1 口才炒場特例（先讀）。
- 過：三倍經驗（口才一般 +25 → +75，照本場實際一般值）＋福（滿堂彩之類，各版提）→ 接回原炒場成功線。
- 不過：禍（各版提一案，倒采一路）；不推進會遊戲結束的戰鬥（武道大會輸了是任務標失敗，禍不得直接造成出局）。
- 壓軸讓賽、奪魁那兩段不動。`,
    lenses: LENS_ACT('擂台炒場'),
    checks: CHECKS_FUHUO('八陣套用表完整、每陣接回格正確；§4.2.1 口才炒場特例；壓軸讓賽、奪魁不動'),
  },
  {
    key: '釣魚叟', box: '翠影潭', group: 1, kind: '未卜',
    out: '劇情/高難度檢定_釣魚叟.md',
    json: 'Json/大地圖/翠影潭.json',
    overview: '劇情/翠影潭/翠影潭.md',
    voices: '釣魚叟（照 JSON 的 actorID，句子全撈）；在場同伴；你 MC1；旁白 role2',
    anchors: '釣魚叟：口才 15／厚黑 10 那組選單加一項。情境包查清那組選單、兩條檢定成功失敗各接去哪、釣魚叟的設定（查 @角色設定 與 劇情/翠影潭/ 的 @設定 檔）；劇情/雲中/@設定_雲中.md 第四節（檀石槐）只當背景讀，不寫進戲。',
    spec: `- 掛點：口才 15／厚黑 10 那組選單加一項；選單前最後一格放固定旁白。
- 檢定：口才或厚黑（同選單同檢定；各版選一個並說明），難度暫 25（第二章，作者填）。
- 過：額外情報（三版三個不同的情報，每版一句話說清他藏什麼、為何藏）；該格 Script: Variable["IsHidden4"] = true;；經驗同一般檢定 → 接回原線。
- **兌現處作者自己接**：IsHidden4 之後要當「討伐鮮卑首領」事件的觸發條件。**不寫後續事件、不猜情報內容跟鮮卑的關係**；情報本身仍要是既有內容能兜住的（對得上翠影潭、雲中、已存在的人物地點）。
- 不過：接回原本失敗那條。`,
    lenses: [
      { tag: '甲', name: '一個人', brief: '他知道的是一個人的事（行蹤、底細、欠了誰什麼），這個人要是遊戲裡已存在的人物或已存在的一類人；不點明跟鮮卑的關係。' },
      { tag: '乙', name: '一個地方', brief: '他知道的是一個地方的事（哪條路、哪個渡口、哪裡有人出沒），地點要是已存在的；不點明跟鮮卑的關係。' },
      { tag: '丙', name: '一件事', brief: '他知道的是一件正在發生或剛發生的事（一筆交易、一次聚集、一個約），能用既有設定兜住；不點明跟鮮卑的關係。' },
    ],
    checks: CHECKS_WEIBU('不寫後續事件、不猜情報跟鮮卑的關係；情報能被既有內容兜住'),
  },
  {
    key: '洞口對峙', box: '水濂洞', group: 1, kind: '福禍',
    out: '劇情/高難度檢定_洞口對峙.md',
    json: 'Json/大地圖/水濂洞.json',
    overview: '劇情/水濂洞/ 裡水濂洞那份總覽稿（查 劇情/索引.md）',
    voices: '洞口對峙的兩撥人（照 JSON）；在場同伴；你 MC1；旁白 role2',
    anchors: '洞口對峙：**既有選項 #17 威嚇 15「兩邊都給我讓開」直接改成福禍**，不另加。擲骰格 #27；成功線 #29–#31（兩撥人讓開）；原失敗線 #32–#33（兩撥聯手開打 Combat 76，輸＝遊戲結束）。情境包逐格抄 #17、#27 前後、#29–#33、選單其餘三個選項。',
    spec: `- 本場特准改既有格：#17 的 text 改成 [em2][威嚇檢定][/em2][em3]禍兮福倚，福兮禍伏[/em3]（zh_TW／zh_CN 同改）；#27 擲骰格難度改（暫 25，作者填）；#17 原本那句台詞若選單後的發言格沒有，就挪進發言格（查 JSON 的結構；若 #17 之後直接接 #27，需要新增一格發言格接在擲骰格之後）。其餘三個選項不動。
- 選單前最後一格放固定旁白（新格，插在原選單前一格與選單之間）。
- 過：原本的成功線（兩撥人讓開 #29–#31）＋三倍經驗（原本威嚇成功給多少就三倍，改在成功首格）＋福（各版提）。
- 不過：禍＝**新分支**（各版提一案）；**禍不得直接推進 Combat 76**。原失敗線 #32–#33 怎麼處置（留給禍接、或作廢不再有人連進去），各版提、作者定，在〈待作者定〉寫清楚。`,
    lenses: LENS_ACT('洞口對峙'),
    checks: CHECKS_FUHUO('只准改 #17 text 與 #27 難度；禍不推進 Combat 76；原失敗線 #32–#33 的處置寫清楚'),
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
