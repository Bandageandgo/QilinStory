export const meta = {
  name: 'butterfly-shidan',
  description: '蝴蝶效應第一案・屍丹（第二級流程）：一箱庭一情境包走檔案、每版三起草只讀情境包、三審修一人一版並修、一終審寫提案檔；趙王洞兩版最後一名合流檢查',
  phases: [
    { title: 'Scout', model: 'opus', detail: '一箱庭一名：情境包寫成檔案，只回一頁摘要' },
    { title: 'Draft', detail: '每版三名起草，各寫一版進檔案' },
    { title: 'Revise', detail: '每版一名審修：逐項查、能修就修、記錄改動' },
    { title: 'Logic', detail: '每版一名邏輯審（2026-09-28 作者要求加）：誰知道什麼、先後因果、人在哪、東西去哪、前後場接口；直接修，記「邏輯審」' },
    { title: 'Final', detail: '每版一名終審：再挑錯、標建議版、寫提案檔、跑檢查腳本' },
    { title: 'Merge', detail: '趙王洞兩版一名合流檢查：條件互斥、錨點與接回一致、現行那條沒被動' },
  ],
}

// 用法：Workflow({scriptPath: '.claude/wf/butterfly-shidan.js', args: {date: '2026-09-26', only: ['娜娜版'], have: {娜娜版: {packet: true, drafts: ['甲']}}}})
// args.date 必填（腳本裡不能用 new Date）；args.only 只跑幾版；args.have 標記哪版的情境包／起草稿已在 bf 目錄裡可沿用；args.bf 可換暫存目錄；
// args.mergeWith 傳先前跑完的趙王洞提案檔路徑（分批跑時合流檢查才有兩份可對）。
// 形狀照 hard-check-v2.js（作者 2026-09-26 第二級）；規格照 劇情/蝴蝶效應_素材與設計.md 第一、三、六、七節。
const A = Object.assign({ date: '＿＿＿＿-＿＿-＿＿', only: null, have: {}, mergeWith: null, bf: 'C:/Users/user/AppData/Local/Temp/claude/d--QilinStory/1ddf8b7f-8270-48d3-b27d-a5e5e30f3f7a/scratchpad/bf' }, args || {})
const DATE = A.date
const MODEL = A.model || 'opus'   // 作者 2026-09-26：子 agent 一律 Opus 5.5
const BF = A.bf
const SPEC = '劇情/蝴蝶效應_素材與設計.md'

const COMMON = `你在做《異麒麟》蝴蝶效應第一案「屍丹」的新戲提案（作者 2026-09-25 拍板規格、2026-09-26 定流程）。規格全在 ${SPEC}：第一節規矩、第三節屍丹規格（3-1 四條路、3-2 讀法、3-3 娜娜版、3-4 雍仔版、3-5 主角版、3-7 狀態寫法、3-8 不准做的）、第六節已定的事、第七節流程。本提示只摘要。
- 什麼叫蝴蝶效應：序章的一票，讓第一章原本就有的一場戲走另一條路。不是幾句回憶、不是新事件、不接鏈。屍丹在誰手上，就在那個人自己的第一章大場用掉，別人的場不讀它。每條路只讀一次，讀完就完。
- 形狀（違反即退）：一個選擇一場戲讀一次；在那個人自己的場用掉；不接鏈；序章那票就是選擇，那場戲不再問玩家第二次；出口合流（那場戲的出口不變、主線不分岔，差別留在人身上）；毀了那條照現行不寫；先給動機再給機制（戲裡看得出來為什麼，不用旁白解釋）。
- 作者已定（2026-09-26）：珠子用掉那一格收 SetQuestState("CF05", "success"); 加該項 SetQuestEntryState("CF05", n, "success");（娜娜版 n=2、雍仔版 n=1、主角版 n=3，跟夢裡給饕餮 #2399 同一套）；兩個出口都沒給、珠子留在主角身上的，後面不補讀；鬼門天賦樹在康復那一格開，變數名留 ＿＿ 作者定稿時填；入門考那條寫一行 ModifyData(DnDAlignment,Player,GoodEvil,-0.15); 並標「⏳ 定稿時可改」；飲煞在畫面上只寫一個最小的看得見的動作，作者看稿再定。
- 引擎硬紅線：不新建變數、不新建任務、不自取名字，要作者建的留 ＿＿；SetFlag／GetFlag 禁用；只讀既有的四個序章變數與 CF05 的 entry；已進 Unity 的節點不改號、不改字、不動 title（改 links 可以）；新格不編號；Description 只寫詞表標籤（劇情/轉成json指南.md §1）。
- 人：累積的是人，各自結算，沒有總分；症狀不給數字；DnDAlignment 可寫不可讀；饕餮三條紅線（不當眾開口要、醒了不等於吃得到、要吃到得他親手遞）——她在趙王洞醒著（#4243），本案她一個字不加。
- 不准做的（${SPEC} §3-8）：讓幾條路流進同一個人；再問一次珠子怎麼辦；新建變數任務 entry；讓饕餮為珠子開口或評論；給鬼門寫來歷、寫雍仔變妖；給娜娜寫她知道邪脈、寫飲煞功法細節；改序章 7 月 JSON 任何節點；改白虎再起、必敗、開口那一段。
- 稿的寫法（創作稿）：說話者行 **旁白:**／**你:**／**〈角色〉:**（主角一律「你」），旁白 [panel=6]＊（…）＊，台詞「…」；每格底下 - actorID: / - Sequence: / - Conditions: / - Script: / - Description: 有才寫，各一行；新格用【A】【B】…標，不編號；分岔用「▶ 本版（條件）」開頭，寫完寫「→ 接 #N」；既有格只寫「#N 不動」或「#N 的 links 改指【A】」。不動 Json/、不動 Unity、不動回讀稿的文字。
- 內容三道線：給AI看的指南/世界觀.md 第八節禁詞（五胡亂華、司馬、篡魏、三國歸晉、輪迴、重來、前世）；角色口中不出「凶戾」「人祭」，只講看得見的；@角色設定/饕餮.md 第十節廢案清單與停用術語。
- 文風規矩（違反即退）：1. 旁白看得見你做什麼、看不見你想什麼：不寫內心話、不替玩家下感受或結論、不替角色斷定心裡怎樣（「倒像」「像是」可以）。2. 寫結果和狀態，不寫過程；一格裡同一個人的動作最多兩拍；不編精確數目、距離和純造景小細節。3. 作者退過的句型不得再犯：「不是 X，是 Y」翻轉句；否定句收尾造氣氛；「像……」比喻巧句收尾；收尾加新判語；旁白先把下一格台詞要講的事講掉；選項已經講過的事旁白再講一遍；同一件事隔幾格又講一遍。4. 句子寫完整，不斷碎句：旁白一格兩三句、每句十九到二十五字、不留五字以下的句子；角色台詞一句十五字上下，照那個角色既有的口吻。5. 旁白裡不寫「」引號；**全篇不用破折號「——」，台詞也不用**（打斷、沒說完用「……」；文風指南旁白卡第 9 條）。[em7] 每十格至多一個、同一人不連掛、[/em7] 後必接標點。6. 玩家看得到的字不自創單字名詞；東漢稱謂與用詞。
- 省回合的規矩：情境包已收好規格原文、現行拍子、連線、每條來路、既有台詞、指南摘錄，先讀它；只在拿不準時回原檔查那一段，不要整本重讀。日期一律寫 ${DATE}。給作者看的話用白話短句，不用自創術語。`

const LENSES = [
  { tag: '甲', name: '照規格最少', brief: '貼著規格與現行拍子，格數最少、差別最集中：只在規格點名的位置分岔，其餘一字不動。偏離規格處在自檢講明。' },
  { tag: '乙', name: '接戲', brief: '先把情境包裡從插入點前十格到接回點後十格（含兩條康復線）讀順，再寫出唸起來最順、最像這場戲原本嗓子的版本；格數可以比甲多一兩格，但一定要守規格與形狀。' },
  { tag: '丙', name: '另一種演法', brief: '在規格範圍內刻意換一種演法，讓作者有真的不一樣的選擇：差別放在別的拍子上、換誰先開口、換一個看得見的動作或物件；仍守全部規矩與規格。若另一種演法明顯更差，照樣給出最好的不同版本並在自檢說明。' },
]

const UNITS_ALL = [
  {
    key: '娜娜版', box: '趙王洞',
    out: '劇情/屍丹分支_娜娜版.md',
    json: 'Json/趙王洞/遺跡.json（秘籍場 #4378–#4401 已轉 JSON、未進 Unity，可直接改；其餘已進 Unity）',
    overview: '劇情/趙王洞/03 遺跡.md §3-8；創作稿 劇情/赫連娜娜/07 趙王洞・秘籍與白虎再起.md',
    merge: '作者看過後：本版的秘籍場那段合併進 劇情/赫連娜娜/07 趙王洞・秘籍與白虎再起.md 同檔，康復兩線那幾格隨 JSON 續號後回讀進 03 遺跡.md；合併完本提案檔刪除',
    voices: '赫連娜娜 MC22（她的聲口卡；本檔既有句）；雍仔 MC20（立繪只有 pic=1／2；本檔既有句）；你 MC1；旁白 role2',
    anchors: '秘籍場 #4378–#4401（插在 #4164 之後、#2062 之前）：在她念到「飲煞要拿屍丹一類」那一拍分出去，做完接回 #4401 牠撐著站起來；康復開口線 #70→#71–#78、拒絕線 #4377→#4361–#4376 各加兩三格',
    cond: 'Variable["NanaChose1"] == true;',
    spec: `- 讀法：只讀 Variable["NanaChose1"] == true;。
- 加什麼：她把珠子掏出來，雍仔攔（他現行就有「妖人的路數，快擱下」），她照帛上寫的做了。不給玩家選項。做完接回 #4401；白虎再起、必敗、開口／不開口那一整段一個字不動。
- 動機：她爹的筆記提過血河舍利；她當初留下珠子就是要「找識貨的看看」；帛上寫的正是這顆珠子的用法。她不是被引誘，是找到了說明書。這要從戲裡看得出來，不用旁白講。
- 飲煞在畫面上：只寫一個最小的看得見的動作，不發光、不寫她變強、不發明功法細節（作者看稿再定）。
- 康復兩線都要寫，各兩三格，條件同上：她線上設計的階段一症狀「無鋒忽然輕了、羅盤轉得更靈」，她自己的說法「我就說筆記裡的法子管用！」（她檔裡本來就有的兩句）。不寫她變壞、不寫她知道自己有邪脈：血脈與這門功「有感應、不同源」，誰都不解釋。
- 狀態：不新建。NanaDemon 序章 #319 已 +1，這一場不再加。她練完那格寫 SetQuestState("CF05", "success"); SetQuestEntryState("CF05", 2, "success");（作者已准）。
- 設計端連帶：給 赫連娜娜.md〈本曲事件骨架〉第 3 列的一句：珠子在趙王洞用掉＝第一層已練，「五件用四件、一件保險」的保險少一件，後面每件都得找到。這句不進遊戲文本。`,
    checks: [
      '形狀：只在她念到飲煞那一拍分一次；不給玩家選項；做完接回 #4401；白虎再起、必敗、開口那段一字不動',
      '讀法與狀態：只讀 Variable["NanaChose1"] == true;；練完那格收 CF05 success 加第 2 項 success；NanaDemon 不再加；沒有新變數、新任務、title；Description 在詞表內',
      '不准做的：不寫她知道邪脈、不寫飲煞功法細節、不發光不變強；饕餮不開口不評論；不改序章 JSON',
      '動機先於機制：她爹的筆記、她本來就要找識貨的、帛上就是說明書，從戲裡看得出來，沒有旁白替她解釋',
      '每條路：秘籍場現行拍子前後接得通；康復開口線 #71–#78 與拒絕線 #4361–#4376 都有本版的格、各自通、在場人數與誰扶誰對得上',
      '症狀：只用她檔裡那兩句（無鋒輕了、羅盤更靈；「我就說筆記裡的法子管用！」），不加新症狀、不給數字',
      '文風規矩 1–6 與聲口：娜娜卡與既有句；雍仔既有句、立繪只有 pic=1／2；em7 每十格至多一個',
      '設計端連帶：只有那一句（保險少一件），標明寫給 赫連娜娜.md 骨架第 3 列；不進遊戲文本',
    ],
  },
  {
    key: '雍仔版', box: '趙王洞',
    out: '劇情/屍丹分支_雍仔版.md',
    json: 'Json/趙王洞/遺跡.json（祭壇前廳、倒下、康復皆已進 Unity，新格不編號、不改既有格的字、不動 title）；Json/趙王洞/野外.json 只讀，#3774 不改',
    overview: '劇情/趙王洞/03 遺跡.md §3-8；劇情/趙王洞/02 野外.md（#3774）；秘籍場創作稿 劇情/赫連娜娜/07 趙王洞・秘籍與白虎再起.md',
    merge: '作者看過後：直接轉 JSON 續號、走同步流程、回讀進 03 遺跡.md；秘籍場那一格若落在 #4378–#4401 之間，一併合進 07 檔；合併完本提案檔刪除',
    voices: '雍仔 MC20（自稱道爺我／本道長，喜劇腔；立繪只有 pic=1／2；本檔既有句）；赫連娜娜 MC22；張寧 MC6（康復拒絕線在場）；你 MC1；旁白 role2；饕餮 MC21 在場但一字不加',
    anchors: '祭壇前廳 #2060→#37（他被綁著喊）→#2061→#38→#39 娜娜擲銅錢→#40→#41 你割繩：在 #37 之前分出去，換 #37–#41 那幾拍，合流回 #41 之後；秘籍場一格（娜娜念到飲煞要屍丹一類時）；拒絕線倒下 #4281 一格（開口線 #4256 不動）；康復開口線 #71–#78、拒絕線 #4371–#4376 各兩三格（#4375 掐訣沒東西是現成接點）',
    cond: 'Variable["FatFriendDie"] == false;',
    spec: `- 讀法：只讀 Variable["FatFriendDie"] == false;。
- 甲（作者選定）：教眾拿珠子堵他的嘴。他被綁在祭壇上還在「萬事好商量」，教眾搜出珠子塞進去堵他。白虎一吼、銅錢一響、你割繩他一嗆，嚥下去了。不是他選的，也不是純意外，是敵人做的。信義那個玩家沒對不起他：珠子是好意給的，害了他的是洞裡的人。喜劇腔那一句（「道爺我剛才嚥了什麼」那一類）要有。
- 野外 #3774「那個胖子一身精氣旺得很，是絕佳的祭品」不改，抓他的理由本來就成立。
- 後面三處各一格（條件同上）：①秘籍場娜娜念到「飲煞要拿屍丹一類」，他臉色一變；②拒絕線他倒下 #4281（現行「符紙散了滿廳、撞在石壁上」），鬼門版倒法可以不同，一格旁白，不寫發光、不寫變妖；③康復兩線都要寫鬼門版：他從那天起畫的符不一樣了，拒絕線 #4375 那格是現成接點。天賦樹在康復那一格開：Variable["＿＿"] = true; 留給作者填，不取名。
- 鬼門是什麼（作者定）：道門的一種而已。不進世界觀、不寫來歷、台詞裡不解釋為什麼吞了會開門；他自己的講法只能是道士那一套（茅山、符、行氣），不出「凶戾」「人祭」二詞。
- 狀態：他嚥下去那格寫 SetQuestState("CF05", "success"); SetQuestEntryState("CF05", 1, "success");（作者已准）。四個序章變數一律不動。
- 設計端連帶：給 @角色設定/雍仔.md 的一段「鬼門」：道門的一種、趙王洞誤吞屍丹後開、天賦樹由變數開；不寫來歷。這段不進遊戲文本。`,
    checks: [
      '形狀：在 #37 之前分一次，換 #37–#41 那幾拍，合流回 #41 之後；野外 #3774 不改；白虎再起、必敗、開口那段一字不動',
      '甲：教眾拿珠子堵他的嘴、他嚥下去；不是他選的、不是純意外；有喜劇腔那一句；娜娜擲銅錢、你割繩兩拍還在',
      '後面三處各一格：秘籍場他臉色一變；拒絕線 #4281 倒法可不同、開口線 #4256 不動；康復兩線都有鬼門版、拒絕線 #4375 接得上',
      '讀法與狀態：只讀 Variable["FatFriendDie"] == false;；嚥下去那格收 CF05 success 加第 1 項 success；天賦樹 Variable["＿＿"] = true; 留白、開在康復那一格；四個序章變數不動；沒有新變數、新任務、title；Description 在詞表內',
      '鬼門：道門的一種；不寫來歷、不解釋為何吞了會開門；台詞只用道士那一套；不出「凶戾」「人祭」；不寫他變壞、不寫變妖；鬼門不上臉（立繪只有兩張，只用旁白和符）',
      '每條路：祭壇前廳的人數與誰在做什麼對得上；開口線與拒絕線的康復各自通；饕餮醒著（#4243）但一字不加',
      '文風規矩 1–6 與聲口：雍仔自稱道爺我／本道長、喜劇腔、既有句；娜娜卡；張寧既有句；em7 每十格至多一個',
      '設計端連帶：只有給 @角色設定/雍仔.md 的那一段，不寫來歷；不進遊戲文本',
    ],
  },
  {
    key: '主角版', box: '英豪府遴選(後)',
    out: '劇情/屍丹分支_主角版.md',
    json: 'Json/英豪府遴選(後)/賈之嗜好.json（37 節點已進 Unity，新格不編號、不改既有格的字、不動 title）',
    overview: '劇情/英豪府/英豪府遴選(後)/08 賈之嗜好.md（全檔）',
    merge: '作者看過後：直接轉 JSON 續號、走同步流程、回讀進 08 賈之嗜好.md；合併完本提案檔刪除',
    voices: '賈詡 MC4（本劇不揭；本檔既有句：賈某、閣下）；蕭靈犀 MC8（若開口照她的聲口卡）；你 MC1；旁白 role2',
    anchors: '#572 再訪（CF29 第 3 項 active）→ 現行分流：有兩千 #531→納貢 #532／離開 #534；不夠 #573。納貢之後 #536 起（心比金堅那段）→#544 收徒、《呂氏春秋》→#545→#562→#563→#564（CF29 success、第 3 項 success、C1M1 第 4 項 success、專長經驗）。新條在 #572 再訪、看錢之前分出，接回 #544',
    cond: 'CurrentQuestEntryState("CF05", 3) == "active";',
    spec: `- 讀法：在 #572 再訪、看錢之前，先讀 CurrentQuestEntryState("CF05", 3) == "active";。有珠子的玩家多一條選項：把珠子放桌上。錢夠不夠都出這條（所以放在錢的分流之前）。夢裡給了饕餮的玩家 CF05 已 success，自然不出。沒珠子的玩家看到的跟現在一模一樣。
- 加什麼：賈詡收下，不解釋那是什麼。三四格之後接回 #544 收徒、《呂氏春秋》，#564 的任務收尾照跑，兩千錢不扣。
- 動機：他桌上正剖著怪物屍體，考題是投其所好；屍丹是黑血屍的精華。用邪物買門路，是管用的手（文本創作指南 0.1）。從戲裡看得出來，不用旁白講。
- 四軸：寫一行 ModifyData(DnDAlignment,Player,GoodEvil,-0.15);（機略），標「⏳ 定稿時可改」。
- 狀態：賈詡收下那格寫 SetQuestState("CF05", "success"); SetQuestEntryState("CF05", 3, "success");。DarkHeroDestiny 不動。
- 選項：這不是高難度檢定，沒有題語、沒有擲骰；選項文字照 劇情/轉成json指南.md §4.2 的規矩，是主角的話。
- 之後不讀：180/2 揭「誅怪是門生意」那場不加東西。
- 設計端連帶：無。`,
    checks: [
      '形狀：在 #572 再訪、看錢之前分一次；錢夠不夠都出這條；接回 #544，#564 任務收尾照跑；兩千不扣；沒珠子的玩家看到的跟現在一樣',
      '讀法與狀態：只讀 CurrentQuestEntryState("CF05", 3) == "active";；收下那格收 CF05 success 加第 3 項 success；DarkHeroDestiny 不動；四軸一行標 ⏳；沒有新變數、新任務、title；Description 在詞表內',
      '賈詡：本劇不揭；不說珠子是什麼、不說要拿去做什麼；收下不解釋；口吻照既有句',
      '動機先於機制：剖怪物、投其所好、管用的手，從戲裡看得出來，沒有旁白替他解釋',
      '選項：主角的話、沒有題語沒有擲骰；照 §4.2 選項文字規矩；選單裡原本兩條（納貢、離開）不動',
      '每條路：#572 → 有兩千／不夠兩條原線一字不動；新條只在有珠子時出現；接回 #544 之後一格不動；之後不加任何回聲',
      '文風規矩 1–6 與聲口：賈詡、蕭靈犀、主角卡；em7 每十格至多一個',
      '設計端連帶：無，design_notes 寫（無）',
    ],
  },
]
const UNITS = A.only ? UNITS_ALL.filter(u => A.only.includes(u.key)) : UNITS_ALL
const OUTS = UNITS_ALL.map(u => u.out)

const lensName = tag => { const l = LENSES.find(x => x.tag === tag); return l ? l.name : '' }
const packetPath = box => `${BF}/${box}/packet.md`
const draftPath = (u, tag) => `${BF}/${u.key}/draft-${tag}.md`
const revisedPath = (u, tag) => `${BF}/${u.key}/revised-${tag}.md`

function unitHead(u) {
  return `版：${u.key}｜箱庭情境包：${packetPath(u.box)}
JSON：${u.json}
回讀稿與創作稿（只讀不改）：${u.overview}
錨點：${u.anchors}
讀的條件：${u.cond}
聲口：${u.voices}
規格：
${u.spec}
本版八項檢查：
${u.checks.map((c, i) => `${i + 1}. ${c}`).join('\n')}
合併去處（提案檔要寫進檔頭，給作者看）：${u.merge}`
}

const DRAFT_FILE_FORMAT = `檔案結構（每節都要有，沒有內容寫「（無）」）：
# 起草稿｜〈版〉｜〈甲乙丙〉（〈取向名〉）
## 取向（一句）
## 讀的條件（逐行）
## 插入點與接回（逐條：插在哪一格之後／哪一格的 links 改指哪個新格 → 接回哪一格：做什麼、幾格）
## 寫的指令（Script／ModifyData 逐行，含收 CF05 那兩行與留白的 ＿＿）
## 戲（創作稿本體：每格 說話者行＋全文，底下 actorID／Sequence／Conditions／Script／Description 有才寫；新格用【A】【B】…標；分岔 ▶；合流「→ 接 #N」；康復兩線各一段）
## 設計端連帶（那一句或那一段，寫給哪個檔；主角版寫（無））
## 起草者自檢（逐條對照八項檢查與文風規矩 1–6；節奏檢查的結果貼這裡）`

function scoutPrompt(box, units) {
  return `${COMMON}

你是箱庭「${box}」的情境整理，只讀不改專案檔。本箱庭這一批要寫的版：
${units.map(u => '\n---\n' + unitHead(u)).join('\n')}

請把情境包寫成檔案 ${packetPath(box)}（用 Write；目錄不存在就建）。內容（純事實、逐字原文，不提改法）：
1. 規格原文：從 ${SPEC} 逐字抄出第一節 1-1 到 1-4、§3-1 四條路表與那兩條 ⚠、§3-2 兩張表、本箱庭各版那一小節（3-3／3-4／3-5）、§3-7、§3-8、第六節已定的事。
2. 現行拍子：每一版從插入點前十格到每個接回點後十格的每一格（說話者、entryID、[panel=N]、全文、Sequence／Script／Conditions／註記／分流），逐字。趙王洞要把秘籍場 #4378–#4401 全段、白虎再起到開口／不開口的選單、康復開口線（#70 起到 #80 眾人探望）與拒絕線（#4377 起到 #80）都抄齊；英豪府要把 #572 分流兩邊到 #564 全抄。
3. JSON 事實：插入點與接回點的 actorID、text、Conditions、Sequence、Script、Description、links，與所有指向它們的 parent；哪些節點已進 Unity、哪些沒有（秘籍場 #4378–#4401 未進，其餘查回讀稿檔頭與 劇情/索引.md）。
4. 每一條會播到插入點的來路與條件：有娜娜／沒娜娜、開口／拒絕、壓得住／壓不住、有兩千／不夠。
5. 序章寫下的：Json/主線事件/179年/7月.json 本箱庭各版那條路的選項格與落點格（全文、Script），有娜娜 §5-1-A 與沒娜娜 §5-1-B 兩套都抄；夢裡給饕餮 #2397–#2405 那幾格的 Script 與 Sequence（收 CF05 的寫法照它）。
6. 聲口：本批每個會開口的角色，把本箱庭 JSON 裡他的每一句都撈出來（grep -n '"actorID": "<ID>"' -A2），另跑 python -X utf8 給AI看的指南/既有台詞.py 撈 ${box === '趙王洞' ? '雍仔、赫連娜娜、張寧' : '賈詡、蕭靈犀'} 各十五句代表句。趙王洞另把饕餮在 #4243 前後的旁白抄出，標明她一字不加。
7. 設定：${box === '趙王洞' ? '劇情/赫連娜娜/赫連娜娜.md〈邪派內功四層〉表、〈本曲事件骨架〉第 3 列、〈主角在她線裡能做的〉第 1 條；@角色設定/赫連娜娜.md 聲口段與屍丹那張表；@角色設定/雍仔.md 全檔（立繪限制、性格、代表對白）；' : '@角色設定/賈詡.md 末節〈設定拍板進度〉與「本劇不揭」那幾條；@角色設定/蕭靈犀.md 聲口段；給AI看的指南/文本創作指南.md 0.1 與第一層第 3 條四軸指令對照表；'}@角色設定/饕餮.md 第十節廢案清單。
8. 每一版特別要查的事實：${box === '趙王洞' ? '康復兩線各自誰在場、誰扶誰、雍仔傷了根本那幾句原文；#4281 現行倒法；#37–#41 每格的 Sequence（音樂、特效、立繪）；秘籍場每格的 Sequence；#4164 與 #2062 的 links；野外 #3774 原文。' : '#572 的 links 與 Conditions 原文；#531、#573 全文；#544 的 links 與 Sequence；#564 的 Script 全文；#532 納貢格的 Sequence（扣錢寫法）；蕭靈犀在本檔的每一句。'}只寫事實。
9. 指南摘錄（作者 2026-09-26 准：起草者只讀情境包，視同讀過三份指南，所以這一節要抄齊）：逐字抄出 給AI看的指南/文本創作指南.md 第零層高概念那幾段、0.1、0.6、2.1a 全節；給AI看的指南/世界觀.md 第八節全節；給AI看的指南/武俠文風創作指南.md〈零、常犯十條〉整節（**放在情境包最前面，起草者先看錯例再動筆**）、第四節開頭通則、旁白卡、你（主角）卡、本批每個出場角色的聲口卡（沒有卡的角色註明「無卡，照第 6 項既有句」）、7.1a–7.1c、7.3、第八節自檢清單；@角色設定/饕餮.md 第十節廢案清單與停用術語；劇情/轉成json指南.md §1 Description 詞表與 §4.2 開頭的通則與選項文字規矩；給AI看的指南/立繪指令轉換規則.md 裡本批出場角色可用的 pic 格號與表情特效名稱。
寫完檔案後，回傳一頁摘要（兩千字內）：每版的插入點、接回點、來路條件、會開口的角色與 ID、你發現起草者一定要知道的坑。摘要是給下游看的目錄，細節都在檔案裡。`
}

function draftPrompt(u, lens) {
  return `${COMMON}

你是起草者（${lens.tag}｜${lens.name}）。你的取向：${lens.brief}
${unitHead(u)}

做法（作者 2026-09-26 裁示，省回合）：只讀情境包 ${packetPath(u.box)}。**先把它最前面的〈常犯十條〉錯例對改例讀一遍再動筆**（作者 2026-09-28）。它的〈指南摘錄〉一節已逐字收了三份指南與各轉換規則裡寫這場戲用得到的節，**讀情境包即視同讀過 CLAUDE.md 要求的三份指南，不必再開指南原檔**。起草只管寫戲：**不回 JSON、回讀稿查連線與來路**，接不接得通、既有格有沒有被動，交給下一步的審修。只有情境包真的缺了寫戲非要不可的東西（某個角色的句子、某格原文）時，才去原檔讀那一段，並在〈起草者自檢〉記一筆缺了什麼。不要改任何專案檔。
把稿寫成檔案 ${draftPath(u, lens.tag)}（用 Write；目錄不存在就建）。
${DRAFT_FILE_FORMAT}
寫完只跑一次 python -X utf8 給AI看的指南/文風節奏檢查.py <檔>，照報告修一次就交，不再重跑；報告和你修了什麼貼進〈起草者自檢〉，沒修完的交給審修。
回傳 JSON：file（檔案路徑）、approach（一句取向）、cells（新格幾格）、self_check（三五句：八項檢查哪幾項你自己拿不準、節奏檢查結果）。`
}

function revisePrompt(u, d) {
  return `${COMMON}

你是審修（版${d.label}）。一人審一版：逐項查，能修的直接修進稿裡，修不了的列出來。
${unitHead(u)}

起草稿：${d.file}（先讀）；情境包：${packetPath(u.box)}（先讀本版那幾段）；起草者的自檢：${d.self_check || '（無）'}

查什麼：
1. 本版八項檢查逐項：回原 JSON、原回讀稿查證插入點、接回點、每條來路、既有格的字有沒有被改、變數與任務號是不是既有的或留 ＿＿、收 CF05 那兩行、Description 詞表（劇情/轉成json指南.md §1）。
2. 文風規矩 1–6 逐句：內心話、判語、動作鏈、假精確、翻轉句、否定句收尾、比喻巧句收尾、碎句與句長、旁白「」與破折號、em7、單字名詞、時代錯置；口吻對照情境包裡那個角色的既有句（讀 給AI看的指南/武俠文風創作指南.md 第四節旁白卡與本版角色卡、給AI看的指南/武俠文風審校清單.md）。
3. 本版另查（見八項裡的那幾條）：娜娜版「不給選項、不寫邪脈、症狀只用那兩句」；雍仔版「不是他選的、鬼門不寫來歷、天賦樹留白開在康復」；主角版「在錢的分流之前、接回 #544、兩千不扣、四軸標 ⏳」。
怎麼修：句子、指令、接法能修就直接修，修完那一格仍要守取向（版${d.label}是「${lensName(d.label)}」），不要把它修成別的版；該作者定的不要替作者定，留 ＿＿ 並記下來。
寫成檔案 ${revisedPath(u, d.label)}（結構同起草稿），檔尾加三節：
## 旁白逐格表（作者 2026-09-28 要求：每一個旁白格一行——格名｜第 3 條判語、心事、替玩家下感受：過或改｜第 7 條造景細節、精確數目、動作鏈超過兩拍、收尾巧句：過或改｜改了什麼。不准整段打勾，一格一格重讀；文風節奏檢查.py 列的「旁白卡候選」每一條都要在這張表裡有交代）
## 審修紀錄（每一處改動：第幾格、原句→新句、依哪條規矩）
## 待作者定（修不了或不該由 AI 定的）
修完跑一次 python -X utf8 給AI看的指南/文風節奏檢查.py <檔> 與 python -X utf8 給AI看的指南/高難度檢定檢查.py <檔>。後者是給有檢定的稿寫的：檔頭沒分類、沒有題語、沒有擲骰那幾條的警告不管；它報的留白、禁詞、Description、em7、title、SetFlag 要處理。不要改任何專案檔。
回傳 JSON：file、verdicts（八項各一筆：check、verdict 是 pass／fixed／unresolved、note 一句）、changes（改了幾處）、summary（三五句：這版最大的問題是什麼、修了什麼、還剩什麼）。`
}

function finalPrompt(u, revs) {
  return `${COMMON}

你是本版的終審兼編輯。三版已各經一名審修。你的工作：再挑一次錯、標一版建議、寫成提案檔、跑兩支檢查腳本。
${unitHead(u)}

三版審修稿（先全部讀完）：
${revs.map(r => `- 版${r.label}（${lensName(r.label)}）：${r.file}；審修結論：${r.summary}；verdicts：${JSON.stringify(r.verdicts)}`).join('\n')}
情境包：${packetPath(u.box)}

做法：
1. 挑錯：重點放審修最容易漏的：每條來路從插入點前十格讀到接回點後十格接不接得通（趙王洞含兩條康復線）、收 CF05 那兩行有沒有寫對項、留白有沒有被人取了名、既有格有沒有被改字、三版是不是三個真的不一樣的選擇、有沒有偷偷多問玩家一次。發現就直接改，並記進該版的〈審修紀錄〉（標「終審」）。
2. 建議版：挑一版，理由一句（通過項最多、接戲最順、最合規格）。
3. 寫提案檔 ${u.out}（用 Write；已存在就整檔覆寫）：
   第一行「# 屍丹分支・${u.key}　提案｜創作稿／提案，尚未進 JSON；作者看過合併後本檔刪除」；
   引用區塊：「📝 ${DATE} 三版待作者挑一版；規矩與規格見 ${SPEC} 第一、三節，本檔只放戲。」、讀的條件、插入點與接回（既有 entryID）、「新格不編號，作者續號；已進 Unity 的節點不改字、不動 title」、「**合併去處：**${u.merge}」、「**建議版：**」＋理由、「**待作者填：**」（${u.key === '雍仔版' ? '鬼門變數名 ＿＿；' : ''}${u.key === '主角版' ? '四軸那一行用不用；' : ''}${u.key === '娜娜版' ? '飲煞畫面那一個動作可不可以；' : ''}其他留白）；
   三版各一節「## 版一（甲｜照規格最少）」「## 版二（乙｜接戲）」「## 版三（丙｜另一種演法）」：節首列取向、讀的條件、插入點與接回、寫的指令、設計端連帶；「### 戲」放審修稿的〈戲〉；「### 審修紀錄」放該版的紀錄（含你終審的改動）；
   「## 待作者定」：三版的〈待作者定〉合併去重，每條前加 ⚠；
   「## 審修摘要」：每版八項 pass／fixed／unresolved 的數目與剩下的 unresolved 項。
4. 跑 python -X utf8 給AI看的指南/文風節奏檢查.py "${u.out}" 與 python -X utf8 給AI看的指南/高難度檢定檢查.py "${u.out}"（後者沒分類、沒題語、沒擲骰的警告不管），報的照規矩修到不報（改了要同步改該版〈戲〉並記進審修紀錄），或在〈待作者定〉說明為何留。
5. 跑 git status：本流程只該動這些提案檔：${OUTS.join('、')}（別版的終審可能同時在寫別的檔）。不動 Json/、回讀稿、創作稿、${SPEC}、角色檔。
回傳 JSON：out、recommended（label、reason）、unresolved（字串陣列）、rhythm（節奏檢查最後一行）、format（格式檢查最後一行）、summary（三五句：三版各是什麼、你改了什麼、為什麼建議那版）。`
}

function mergePrompt(outs) {
  return `${COMMON}

你是趙王洞兩版的合流檢查（作者 2026-09-26 定的甲案：兩版各自跑，最後一名檢查）。只讀 Json/ 與回讀稿，只改下列提案檔。
提案檔：${outs.join('、')}
情境包：${packetPath('趙王洞')}
若某份提案檔已經有「## ✅ 定稿」一節（作者已挑版），**以那一節為準**，其餘版本不看、不改；還沒定稿的那份，三版都查，但只修戲、不動它的檔頭。

娜娜版與雍仔版互斥（序章只可能一條為真），但插在同一份 Json/趙王洞/遺跡.json 的同幾個錨點：秘籍場（娜娜版整段分岔、雍仔版一格）、拒絕線倒下 #4281（雍仔版）、康復開口線與拒絕線（兩版都有）。逐版、逐錨點查：
1. 條件：每個新格的 Conditions 只讀自己那個變數（NanaChose1 == true／FatFriendDie == false），沒有寫成會同時為真或同時為假的東西；沒有一格兩版都會播。
2. 錨點與接回：兩版在同一錨點各自從哪一格分出、接回哪一格，一致且不互相蓋掉；「現行」那條（兩個變數都不成立的玩家，例如毀了、或主角自己收著）從頭到尾一格沒被動，照原 links 走得通。
3. 秘籍場：娜娜版改了 #4378–#4401 之間的接法時，雍仔版那一格（他臉色一變）插的位置在娜娜版與現行兩種走法下都還接得上。
4. 康復：兩線各自三種走法（現行／娜娜版／雍仔版）都通，在場人數、誰扶誰、誰開口沒有打架。
5. 收 CF05 的寫法兩版一致（success 加各自那一項 success）。
小錯直接修進提案檔對應版的〈戲〉，記進該版〈審修紀錄〉（標「合流」）；牽動取向或要作者定的列進兩檔的〈待作者定〉。修完對兩檔各跑一次 python -X utf8 給AI看的指南/文風節奏檢查.py。git status 確認只動了這兩份提案檔。
回傳 JSON：ok（沒有問題時 true）、issues（每筆：where、problem、fix、fixed 是 true／false）、summary（三五句）。`
}

function logicPrompt(u, r) {
  return `${COMMON}

你是邏輯審（版${r.label}）。審修已經修過規矩與口吻，你只看這場戲的事理通不通：先讀情境包裡這一場的現行拍子與來路，再逐格讀 ${r.file}。
${unitHead(u)}

查什麼（只管事理，規矩、格式、口吻前面的審修管過了）：
1. 誰知道什麼：每一格說話的人、主角、旁白此刻知道的事，是不是前面已經看見或聽見的。沒看見的不能認出，沒聽見的不能回答，同一件事不能認第二次、不能講第二次。
2. 先後因果：先看見才能叫人、先問才有答、先做才有結果；轉場前後的時辰、天色、地點接得上；人在哪、誰在場，前後一致。
3. 東西的去向：拿出來的東西有收回或交代（碗、杖、弓、錢、旗）；沒有憑空多出來的東西。
4. 台詞與旁白不打架：旁白不重講台詞剛講的事，也不比台詞晚一步才交代台詞已經用到的事實；選項文字跟後面的戲對得上。
5. 條件與分支：每條分支的前提在那條路上真的成立（例如寫認識某人的那條，玩家真的見過他；寫拿到某物的那條，前面真的給過）。
6. 前後場接口：這一場開頭假定的事，前一場真的演過；這一場結尾留下的狀態，後一場用得上。
怎麼修：能修就直接修進同一份檔（有兩節的第一節與第二節同步改），修完那一格仍守該版取向與文風規矩 1–6；拿不準是不是問題的列出來不改。檔尾〈審修紀錄〉續加，每條標「邏輯審」；〈待作者定〉續加。修完跑一次 python -X utf8 給AI看的指南/文風節奏檢查.py <檔>。不動任何專案檔。
回傳 JSON：file、issues（每筆：where、problem、fix、fixed 是 true／false）、summary（兩三句：最大的邏輯問題是什麼、修了幾處、還剩什麼）。`
}
const LOGIC_SCHEMA = { type: 'object', properties: {
  file: { type: 'string' },
  issues: { type: 'array', items: { type: 'object', properties: {
    where: { type: 'string' }, problem: { type: 'string' }, fix: { type: 'string' }, fixed: { type: 'boolean' },
  }, required: ['where', 'problem', 'fix', 'fixed'] } },
  summary: { type: 'string' },
}, required: ['file', 'issues', 'summary'] }
const DRAFT_SCHEMA = { type: 'object', properties: {
  file: { type: 'string' }, approach: { type: 'string' }, cells: { type: 'integer' }, self_check: { type: 'string' },
}, required: ['file', 'approach', 'cells', 'self_check'] }
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
const MERGE_SCHEMA = { type: 'object', properties: {
  ok: { type: 'boolean' },
  issues: { type: 'array', items: { type: 'object', properties: {
    where: { type: 'string' }, problem: { type: 'string' }, fix: { type: 'string' }, fixed: { type: 'boolean' },
  }, required: ['where', 'problem', 'fix', 'fixed'] } },
  summary: { type: 'string' },
}, required: ['ok', 'issues', 'summary'] }

const scoutJobs = {}
function ensurePacket(box) {
  if (!scoutJobs[box]) {
    const units = UNITS_ALL.filter(u => u.box === box)
    const haveIt = units.some(u => A.have[u.key] && A.have[u.key].packet)
    scoutJobs[box] = haveIt
      ? Promise.resolve(true).then(() => { log(`${box}：情境包沿用 ${packetPath(box)}`); return true })
      : agent(scoutPrompt(box, UNITS.filter(u => u.box === box)), { label: `scout:${box}`, phase: 'Scout', effort: 'xhigh', model: MODEL }).then(r => !!r)
  }
  return scoutJobs[box]
}

async function runScene(u) {
  const had = (A.have[u.key] && A.have[u.key].drafts) || []
  const drafts = (await parallel(LENSES.map(l => async () => {
    if (had.includes(l.tag)) return { label: l.tag, file: draftPath(u, l.tag), self_check: '（沿用舊 run 的起草稿，自檢見檔尾）' }
    const r = await agent(draftPrompt(u, l), { label: `draft-${l.tag}:${u.key}`, phase: 'Draft', effort: 'xhigh', model: MODEL, schema: DRAFT_SCHEMA })
    return r ? { label: l.tag, ...r, file: draftPath(u, l.tag) } : null
  }))).filter(Boolean)
  if (!drafts.length) return { unit: u.key, error: 'all drafts failed' }
  log(`${u.key}：${drafts.length} 版起草稿就位，送審修`)
  const revs = (await parallel(drafts.map(d => () =>
    agent(revisePrompt(u, d), { label: `revise-${d.label}:${u.key}`, phase: 'Revise', effort: 'max', model: MODEL, schema: REVISE_SCHEMA })
      .then(r => r ? { label: d.label, ...r, file: revisedPath(u, d.label) } : null)))).filter(Boolean)
  if (!revs.length) return { unit: u.key, error: 'all revisions failed', drafts }
  const logics = (await parallel(revs.map(r => () =>
    agent(logicPrompt(u, r), { label: `logic-${r.label}:${u.key}`, phase: 'Logic', effort: 'max', model: MODEL, schema: LOGIC_SCHEMA })
      .then(x => x ? { ...r, logic: x, summary: r.summary + '｜邏輯審：' + x.summary } : r)))).filter(Boolean)
  log(`${u.key}：邏輯審完成，送終審`)
  const fin = await agent(finalPrompt(u, logics), { label: `final:${u.key}`, phase: 'Final', effort: 'max', model: MODEL, schema: FINAL_SCHEMA })
  if (!fin) return { unit: u.key, error: 'final failed', revs }
  log(`${u.key}：提案檔完成，建議版 ${fin.recommended.label}，待作者定 ${fin.unresolved.length} 件`)
  return { unit: u.key, out: fin.out, recommended: fin.recommended, unresolved: fin.unresolved, rhythm: fin.rhythm, format: fin.format, summary: fin.summary,
    revisions: revs.map(r => ({ label: r.label, changes: r.changes, unresolved: r.verdicts.filter(v => v.verdict === 'unresolved').length, summary: r.summary })) }
}

// 三版同時跑；同一箱庭的版等同一份情境包。
log(`同時開跑：${UNITS.map(u => u.key).join('、')}`)
const results = (await parallel(UNITS.map(u => async () => {
  const ok = await ensurePacket(u.box)
  if (!ok) return { unit: u.key, error: 'scout failed' }
  return await runScene(u)
}))).filter(Boolean)

// 甲案：趙王洞兩版都有提案檔才做合流檢查。分批跑的話，先跑完那版的提案檔用 args.mergeWith 傳進來。
let merge = null
const zhaoOuts = results.filter(r => r.out && UNITS_ALL.find(u => u.key === r.unit && u.box === '趙王洞')).map(r => r.out)
const extraOuts = Array.isArray(A.mergeWith) ? A.mergeWith : []
const mergeOuts = [...extraOuts, ...zhaoOuts]
if (zhaoOuts.length >= 1 && mergeOuts.length >= 2) {
  merge = await agent(mergePrompt(mergeOuts), { label: 'merge:趙王洞兩版', phase: 'Merge', effort: 'max', model: MODEL, schema: MERGE_SCHEMA })
  if (merge) log(`合流檢查：${merge.ok ? '沒有問題' : merge.issues.length + ' 個問題（已修 ' + merge.issues.filter(i => i.fixed).length + '）'}`)
} else {
  log('合流檢查略過：趙王洞兩版的提案檔沒有都到位')
}
return { date: DATE, units: results, merge }
