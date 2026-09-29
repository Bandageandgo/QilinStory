export const meta = {
  name: 'hard-check-v2',
  description: '高難度檢定第二級流程：一箱庭一情境包（走檔案）、每場三起草、三審修（一人審一版並修）、一終審挑錯並寫提案檔；不再有審稿團、定稿、複核、稽核四層',
  phases: [
    { title: 'Scout', model: 'opus', detail: '一箱庭一名：情境包寫成檔案，只回一頁摘要' },
    { title: 'Draft', detail: '每場三名起草，各寫一版進檔案' },
    { title: 'Revise', detail: '每版一名審修：逐項查、能修就修、記錄改動' },
    { title: 'Logic', detail: '每版一名邏輯審（2026-09-28 作者要求加）：誰知道什麼、先後因果、人在哪、東西去哪、前後場接口；直接修，記「邏輯審」' },
    { title: 'Final', detail: '每場一名終審：再挑錯、標建議版、寫提案檔、跑兩支檢查腳本' },
  ],
}

// 用法：Workflow({scriptPath: '.claude/wf/hard-check-v2.js', args: {date: '2026-09-26', only: [...], have: {村長: {packet: true, drafts: ['甲','乙','丙']}}}})
// args.date 必填；args.only 只跑幾場；args.have 標記哪些場的情境包／起草稿已在 hc 目錄裡（沿用舊 run 的成果，不再花 agent）；args.hc 可換暫存目錄。
const A = Object.assign({ date: '＿＿＿＿-＿＿-＿＿', only: null, have: {}, hc: 'C:/Users/user/AppData/Local/Temp/claude/d--QilinStory/4acb5323-b153-440b-8c80-a1d714f7ce95/scratchpad/hc' }, args || {})
const DATE = A.date
const MODEL = A.model || 'opus'   // 作者 2026-09-26：子 agent 一律 Opus 5.5
const HC = A.hc
const GUIDE = '給AI看的指南/高難度檢定走向指南.md'

const COMMON = `你在做《異麒麟》高難度檢定的提案（第二批，2026-09-26 規則）。規矩全在 ${GUIDE}：第一節三個分類與〈選項格式〉、第四節引擎寫法、第五節走向細則、第六節規則十三條、第七之二節指引（骰子亮）、第九節本箱庭素材盤點、第十一節〈已定場次清單〉與〈執筆 agent 通用規則〉。本提示只摘要，拿不準翻指南那一節。
- 什麼叫高難度檢定：在既有選單旁邊加一個高難度擲骰選項，過或不過至少有一邊跟原本的分支不同。難度作者填：福禍、未卜暫 18，轉機暫 20。
- 選項格式（已定）：檢定標籤＋題語，選單上沒有主角的話、不加引號、不出現分類名：福禍 [em2][威嚇檢定][/em2][em3]禍兮福倚，福兮禍伏[/em3]；未卜 [em2][洞悉檢定][/em2][em3]知其一，不知其二[/em3]；轉機 [em2][厚黑檢定][/em2][em3]置之死地，而後生[/em3]。檢定名照實際用的寫、只用遊戲既有標籤（口才檢定＝PersuasionCheck，沒有「說服檢定」）。題語一類一句、全案不改字；不冠「麒麟骰：」、不加「兆」。真正的話在擲骰之後的主角發言格才講。同一選單優先用普通選項那一種檢定，沒有合適的才另選；轉機用那一場說法最順的檢定。
- 福禍：過＝加倍獎勵或新分支；不過＝禍，一條新分支（極端結果＋代價），不是原本的失敗。禍不死人、不留殘、不關線；代價只落好感、錢、面子。
- 未卜：過＝額外的情報，帶來額外的獎勵（沒有這一骰就不存在的錢、物、把柄、或一條原本沒有的路）；把玩家本來就會拿到的東西提早給、把本來要走的關跳過、直接給謎底，都不算。不過＝回到原本檢定失敗那條，不再給第二次骰。兌現處要是既有內容，新選項照 [em2][隱藏選項][/em2] 寫、掛 Conditions: Variable["＿＿"] == true;。
- 轉機：只在打輸之後；過＝另一種戰鬥勝利（任務照成功、進度變數照勝利線走、對話裡的獎勵照拿、沒有引擎戰鬥獎勵），接回勝利線的無條件格，之後一格不動；不過＝回原失敗線。翻盤的說法配對象，尾巴要真的翻盤，不能寫成對方放你走。
- 引擎寫法（違反即退）：一個選項一顆骰，自己接一個擲骰格，不跟普通選項共用。結構照 劇情/轉成json指南.md §4.2：選項格（actorID MC1，Description「選項N」，Sequence 掛 ShowNoviceTeaching(＿＿);）→ 擲骰格（actorID 0、text 空、Description「〈名〉檢定」、Sequence 四段：SetContinueMode(false);SetContinueMode(original)@Message(EndRoll);Continue()@Message(EndRoll);BeginDiceRoll(Manual,〈FeatID〉,〈難度〉);）→ 主角發言格（MC1，把話講完整，過不過共用）→ 成功分支首格 Conditions: IsPassDice() == true; ／失敗分支首格 Conditions: IsPassDice() == false;。IsPassDice 不掛在緊接擲骰格的那一格。FeatID 只能用 給AI看的指南/擲骰指令轉換規則.md〈常用檢定項目ID對照〉裡的。
- 獎勵：福禍過＝普通的兩倍（威嚇 ModifyData(FeatExp,Player,Intimidation,20);）；未卜過、轉機過＝+10 給對應 ID。錢、物、把柄是走向的一部分，不算檢定獎勵。禍的代價用既有指令 ModifyData(FavorabilityExp,MC8,-20); 之類，不做新數值。
- 指引：麒麟骰亮＝預示福禍。第一次介紹只在碰瓷；往後每一次在選單前一格放固定句旁白 [panel=6]＊（懷裡的麒麟骰亮了一下。）＊（或特效，作者定，稿內註）；轉機放在打輸之後、選單之前。只寫亮，不寫燙、熱、顫、震；不解釋為何亮。措辭出處 Json/小溪村後山/赫連娜娜、張寧.json #784／#785。
- 硬紅線：不自取變數名、任務號、教學 ID（一律留 ＿＿）；SetFlag／GetFlag 禁用；不新建變數、任務、地點、道具、NPC；已進 Unity 的節點不改號、不改字、不動 title（改 links 可以）；新格不編號；Description 只寫 劇情/轉成json指南.md §1 詞表的標籤，不寫說明、不寫數值。
- 內容三道線：給AI看的指南/世界觀.md 第八節禁詞（五胡亂華、司馬、篡魏、三國歸晉、輪迴、重來、前世）；給AI看的指南/文本創作指南.md 0.6 揭露節奏（序章任何人不碰骰子來歷、張角、太平道）；@角色設定/饕餮.md 第十節廢案清單。用東漢的價值觀寫，不加道德評語，旁人怎麼看他才是反應。
- 稿的寫法（創作稿）：說話者行 **旁白:**／**你:**／**〈角色〉:**（主角一律「你」），旁白 [panel=6]＊（…）＊，台詞「…」；每格底下 - actorID: / - Sequence: / - Conditions: / - Script: / - Description: / - 註記: 各一行，有才寫；立繪與表情寫在 Sequence（照 給AI看的指南/立繪指令轉換規則.md；選單前那一格不掛表情特效）。分岔用 ▶，合流寫「→ 接 #N」，新格用【A】【B】…標，不寫 entryID。不動 Json/、不動 Unity、不動回讀稿、不動 ${GUIDE}。
- 文風規矩（違反即退）：1. 旁白看得見你做什麼、看不見你想什麼：不寫內心話、不替玩家下感受或結論、不替角色斷定心裡怎樣。2. 寫結果和狀態，不寫過程；一格裡同一個人的動作最多兩拍；不編精確數目、距離和純造景小細節。3. 作者退過的句型不得再犯：「不是 X，是 Y」翻轉句；否定句收尾造氣氛；「像……」比喻巧句收尾；收尾加新判語；旁白先把下一格台詞要講的事講掉；同一件事隔幾格又講一遍。4. 句子寫完整，不斷碎句：旁白一格兩三句、每句十九到二十五字、不留五字以下的句子；角色台詞一句十五字上下、可見字數 50 內，照那個角色既有的口吻（狗頭人是碎句豁免）。5. 旁白裡不寫「」引號；**全篇不用破折號「——」，台詞也不用**（打斷、沒說完用「……」；文風指南旁白卡第 9 條）。6. 不自創單字名詞；東漢稱謂與用詞；硬紅線詞永不進文本。
- 省回合的規矩：情境包已收好本場的規則原文、掛點連線、每條來路、既有台詞、兌現處候選，先讀它；只在拿不準時回原檔查那一段，不要整本重讀。三份指南照 CLAUDE.md 要讀，但只讀情境包點名的節。檢查腳本各跑一次就好。給作者看的話用白話短句。日期一律寫 ${DATE}。`

const CHECKS_TURN = (winBack, loseBack, who) => [
  `分類與走向：轉機。只在打輸之後出現；過＝另一種戰鬥勝利（任務照成功、進度變數照勝利線、對話裡的獎勵照拿、沒有引擎戰鬥獎勵）→ 接 ${winBack}；不過＝接回 ${loseBack} 原失敗線、不再骰第二次`,
  '引擎寫法：敗首格之後加選單（轉機選項＋認輸選項）、自己的擲骰格四段包裝（Manual,〈ID〉,20）、隔一格、IsPassDice 掛分支首格；選項格式 [em2][〈名〉檢定][/em2][em3]置之死地，而後生[/em3]，無引號、無分類名；選項格掛 ShowNoviceTeaching(＿＿)；Description 只准詞表',
  `翻盤的說法配對象（${who}）；同一場普通選項已用過的檢定不重複；尾巴要真的翻盤，不能寫成對方放你走或以為你完了就走`,
  `接回點：接回勝利線的無條件格 ${winBack}，之後一格不動；勝利線上的獎勵與進度沒漏沒重；沒有多給引擎戰鬥獎勵`,
  '指引：打輸之後、選單之前骰子亮，只寫亮，不寫燙熱顫震；不解釋為何亮',
  '變數與編號：不自取名、不新建變數、不動 title、不改既有格的字（改 links 可以）；經驗 +10 給對應 ID',
  '內容三道線與價值觀：世界觀第八節禁詞、0.6 揭露、饕餮廢案；東漢價值觀；不編精確數目與小細節',
  '文風規矩 1–6 與聲口：對方貼既有句；主角；小犀若開口照她；台詞可見字數 50 內；em7 每十格至多一個',
]

const UNITS_ALL = [
  {
    key: '村長', box: '村長', group: 1, kind: '未卜',
    out: '劇情/高難度檢定_村長.md',
    json: 'Json/小溪村/棋局殘譜、村長.json',
    overview: '劇情/小溪村/03 棋局殘譜、村長.md',
    voices: '村長 role112（本檔 26 句都在情境包；他叫主角小兄弟、自稱老哥）；你 MC1；蕭靈犀 MC8；旁白 role2',
    anchors: '掛點①：#30 你「正是那局。小弟僥倖參破其中變化。」→ #31 村長「踏破鐵鞋無覓處啊！…你可願將此解法告知於我？或是有何想法？」→ 選單 links [#52 經濟 14 談價, #32 雙手奉上, #46 看著給, #63 不了自己研究]，第五個選項加在 #31 的 links。現有經濟流：#52 → #53 擲骰格 → #54 主角發言 → #2054 → [#55 過 → #56…, #59 不過「最多出一百五十錢」→ #60…]。到 #31 的來路帶條件：MyTime、ChessGame == true（#28）、C0M1 第 2 項。全檔 86 節點已進 Unity。',
    spec: `- 掛點：#31 的 links 加第五個選項格。指引：固定句旁白格插在 #30 與 #31 之間（#30 改接它、它接 #31），稿內註「若作者選特效，刪此格，改在 #31 的 Sequence 掛 PlayOrStopParticle(＿＿,Play)」；教學 ID 照掛（玩家可能先到村長）。
- 選項：[em2][〈名〉檢定][/em2][em3]知其一，不知其二[/em3]；檢定從 口才 PersuasionCheck、洞悉 InsightCheck、學識 KnowledgeCheck、魅力 CharismaCheck 裡選，說明為什麼；Sequence: ShowNoviceTeaching(＿＿);，Description: 選項5。形狀是「拿棋譜換他一句實話」。
- 擲骰格：BeginDiceRoll(Manual,〈FeatID〉,18)，四段包裝。主角發言格把選項那句講完整（過不過共用）。
- 過：村長吐實兩三格（該線第一格 Script: Variable["＿＿"] = true;，Description: 變數更新；經驗 +10 給對應 ID）→ 接回原線。棋譜與錢怎麼算要說清楚：拿棋譜換實話，建議接回 #59 起那條（他照低價收、你拿到的是話）或 #32 奉上線，寫明接哪裡、為什麼。
- 不過：村長一句擋回 → 接回原本經濟檢定失敗那條（#59 起）。
- 秘密：一句話說清 他藏的是什麼、為什麼藏、玩家拿到後去哪兌現。必須是額外的：直接給謎底、免打免錢過關、把童淵本來會找到的鐵木提早說、把本來就釣得到的河童提早指出來，都不算。量級是村子的事，不改主線；不編精確數目。兌現處要是既有內容（小溪村資料夾、後山的樹下刀客與攔路匪、大地圖的小溪村、探索事件裡的童淵線都算；作者仍准樹下刀客當兌現處，前提是那條路帶來的東西是原本沒有的），新選項照 [em2][隱藏選項][/em2] 寫、掛 Conditions: Variable["＿＿"] == true;，兌現處的格子寫進〈兌現處〉；埋物只能是錢或既有道具（ModifyData(Coin,＿＿) 數字作者填）。
- 不能碰：河伯娶親（作廢）；小花與阿婆的動機（未定）；骰子、饕餮、張角、太平道（0.6）；一枝花的真身（茶博士是她堂哥，不可爆）；逆流河與異舟的來歷；古墓入口。
- 村長聲口貼他既有 26 句（豪爽、愛棋、叫小兄弟）；不寫內心話；東漢價值觀。`,
    lenses: [
      { tag: '甲', name: '一條原本沒有的路・後山', brief: '秘密開出一條原本沒有的路：村長知道後山樹下刀客或攔路匪那裡有一樣別人拿不到的東西或一段別人聽不到的話，玩家報上村長的名字（或說出村長給的那句），那一場多一個 [隱藏選項]，帶來原本沒有的收穫。不是給謎底、不是免打免錢過關。' },
      { tag: '乙', name: '把柄・村裡某人', brief: '秘密是一個把柄：村長知道村裡某個有戲的人一件不想讓人知道的事（老學究、茶博士、賭鬼兄妹、有間客棧的人都可以；不可碰一枝花的真身、小花與阿婆的動機），玩家拿去對那人用，那人的場多一個 [隱藏選項]，帶來原本沒有的好處。被抓把柄的人要過他的既有台詞與設定。' },
      { tag: '丙', name: '藏寶・埋物', brief: '秘密是村裡埋著或藏著的一樣東西：廢屋或河邊釣點可挖的埋物（Json/小溪村/釣魚、廢棄的屋子.json），他為什麼知道、為什麼不自己拿，一句話講得通。東西只能是錢或既有道具，數字留 ＿＿；兌現處多一個 [隱藏選項]「挖」。' },
    ],
    checks: [
      '分類與走向：未卜。過＝額外的情報帶來額外的獎勵＋記變數；不是提早給、不是跳關、不是給謎底；不過＝接回原本經濟檢定失敗那條、不再骰第二次；一句話講清藏什麼、為何藏、去哪兌現',
      '引擎寫法：第五個選項、自己的擲骰格四段包裝（Manual,〈ID〉,18；ID 在對照表裡）、隔一格、IsPassDice 掛分支首格、不共用 #53；選項格式 [em2][〈名〉檢定][/em2][em3]知其一，不知其二[/em3]，無引號、無分類名；選項格掛 ShowNoviceTeaching(＿＿)；Description 只准詞表；兌現處新選項照 [em2][隱藏選項][/em2]、掛 Conditions: Variable["＿＿"] == true;',
      '兌現處是既有內容：那一場多的選項或格子寫出來、接回點正確；不新建地點道具 NPC；被抓把柄的人過他的既有台詞與設定',
      '不能碰的清單：河伯娶親、小花阿婆動機、骰子饕餮張角太平道、一枝花真身、逆流河異舟、古墓入口；量級是村子的事、不改主線',
      '連續性：#31 選單的每條來路（MyTime、ChessGame、C0M1 第 2 項）都接得通；過與不過之後棋譜與錢怎麼算清楚；#31 前一格不掛表情特效；指引在選單前、只寫亮',
      '變數與編號：變數只留 ＿＿、不新建任務、不動 title、不改既有格的字；經驗 +10 給對應 ID',
      '內容三道線與價值觀：禁詞、0.6、饕餮廢案；東漢價值觀；不編精確數目與小細節',
      '文風規矩 1–6 與聲口：村長貼他既有句；主角；小犀若開口照她；發言格把話講完整；台詞可見字數 50 內',
    ],
  },
  {
    key: '河童第二戰', box: '河童第二戰', group: 1, kind: '轉機',
    out: '劇情/高難度檢定_河童第二戰.md',
    json: 'Json/大地圖的小溪村.json',
    overview: '劇情/大地圖的小溪村/大地圖的小溪村.md',
    voices: '河童大哥 role120、三弟 role121、二哥 role122（句子都在情境包）；蕭靈犀 MC8；你 MC1；旁白 role2',
    anchors: '第二戰：#320 → #321 戰鬥格（Combat 26）→ #378 緩衝 → [#322 勝首格（大哥「英雄饒命！我們兄弟倆徹底服了！」，Sequence 帶 ModifyData(Coin,150)）→ #379 三弟「大哥，你何必跟這小子求饒！」→ #380 → #324 → … → #325 → #381 FlokMonster = 2；#326 敗首格（三弟「大哥，我們走。看來這小子也不過如此。」）→ #327 大哥「哈哈哈！看到沒！俺三弟一出手，你就變成軟腳蝦了！」→ #328 FlokMonster = -1 → #329]。第三戰 #337 旁白「之前被你擊敗的妖怪大哥和三弟衝了出來」。全檔 142 節點已進 Unity。',
    spec: `- 掛點：#326（原格不動）之後、#327 之前。#326 的 links 改指新格：骰子亮的固定句旁白（或特效掛 #326，作者定，稿內註）→ 選單 [轉機選項, 認輸選項]。
- 轉機選項：[em2][口才檢定][/em2][em3]置之死地，而後生[/em3]（暫口才 PersuasionCheck；別的檢定更順就寫明理由）；Sequence: ShowNoviceTeaching(＿＿);；Description: 選項1。認輸選項一句短話 → 主角發言格 → 接 #327。
- 擲骰格：BeginDiceRoll(Manual,PersuasionCheck,20)，四段包裝；單骰（連骰與否作者定，稿內記一筆）。主角發言格把翻盤的話說出口（讓牠們信你留了手、或服你有種；妖怪服狠）。
- 過：扭轉尾巴兩三格（大哥將信將疑、三弟不服、大哥壓住三弟）→ 該線第一格 Sequence: ModifyData(Coin,150);ModifyData(FeatExp,Player,Persuasion,10); → 接 #379 原勝利線（之後照原線走到 #381 FlokMonster = 2，一格不動）。尾巴收在大哥服軟，#379 三弟那句才接得上。
- 不過：小犀一句（可有可無）→ 接 #327 原線 → #328 關線。
- 只放第二戰；#337「之前被你擊敗的」改不改一字作者定，稿內記一筆。河童聲口貼既有句；不解釋牠們是什麼、不碰逆流河與異舟的來歷。`,
    lenses: [
      { tag: '甲', name: '照清單最省', brief: '貼著已定場次清單那一列與第七節河童那段骨架，格數最少：選單、擲骰、發言、過的尾巴兩格、不過一格。' },
      { tag: '乙', name: '接戲', brief: '先把總覽稿裡河童三場從頭讀到尾，再寫出唸起來最順、最像這幾隻妖怪原本嗓子的版本；格數可以比甲多一兩格。' },
      { tag: '丙', name: '另一種演法', brief: '刻意換一種翻盤說法：換一種檢定（魅力、厚黑、武藝之類，寫明理由）、換誰先開口、換一個看得見的動作；仍接回 #379、仍守全部規矩。' },
    ],
    checks: CHECKS_TURN('#379', '#327', '妖怪服狠：讓牠們信你留了手，或服你有種'),
  },
  {
    key: '狗頭人打劫', box: '破廟', group: 2, kind: '福禍',
    out: '劇情/高難度檢定_狗頭人打劫.md',
    json: 'Json/破廟/開場、蕭靈犀.json',
    overview: '劇情/破廟/01 開場、蕭靈犀.md',
    voices: '狗頭人首領 role123（本檔另有 role105、role107 兩處疑為誤植）、小弟 role106（覆誦首領語尾；狗頭人是碎句豁免，照牠們既有的腔）；赫連娜娜 MC22（在隊與否掛 IsInTeam("MC22")）；蕭靈犀 MC8；你 MC1；旁白 role2',
    anchors: '#3586 → #3588 小犀「表哥表哥，別愣著啦！他們是想搶我們的錢！…」→ 選單 links [#3587 娜娜「等等！」（Conditions IsInTeam("MC22") == true;）→ #3589 娜娜獻計 → [#3590 經濟 10 契約, #3597 [隱藏選項] 經濟 1 級, #3581 開打]；#3616 [花費500錢]「拿去，然後滾。」→ [#3642, #3643]（→ #3618 小犀「哇啊！那是……！」→ #3619 首領「哈！上道！上道！你，好人！是兄弟！」→ #3620 小弟「好兄弟！讓道！」）；#3581「嘿！要錢沒有，要命，自己來拿！」→ #3640 開打]。開打輸＝#3636 ShowEnding(Ending_1) 遊戲結束。契約那條記 CallingDogBrother（情境包查它是變數還是道具、在哪一格記、鍋子怎麼給、之後接到哪）。全檔 131 節點已進 Unity。',
    spec: `- 掛點：#3588 的 links 加第四個選項格（不需娜娜在隊）。指引：固定句旁白格插在 #3586 與 #3588 之間（或特效掛 #3588，作者定，稿內註）；#3588 不掛表情特效。
- 選項：[em2][威嚇檢定][/em2][em3]禍兮福倚，福兮禍伏[/em3]；Sequence: ShowNoviceTeaching(＿＿);；Description: 選項4。
- 擲骰格：BeginDiceRoll(Manual,IntimidationCheck,18)，四段包裝。主角發言格把威嚇的話說出口（過不過共用）。
- 過（福）：狗頭人被鎮住，錢一文不少，還把召喚的鍋子（契約）獻出來：拿到的東西與娜娜獻計那條一樣，照抄那條記 CallingDogBrother 與給鍋子的同一套指令；該線第一格 Sequence 另加 ModifyData(FeatExp,Player,Intimidation,20); → 接回契約線的合流格（寫明接哪一格）。
- 不過（禍）：各版提一案。硬限制：不死人、不留殘；不比「開打輸了＝遊戲結束」重；不直接推進戰鬥（不接 #3581／#3640）；代價落在錢、面子、好感、或把契約那條門關掉（宗緯家另有一次機會；門怎麼關要查清變數，作者建的留 ＿＿）；不新建東西；禍之後接回哪一條既有的路寫明。
- 狗頭人來歷只講既有台詞講過的（此山我開、好兄弟、讓道）。娜娜在隊與否兩套都要通：新分支裡娜娜若開口，那格掛 Conditions: IsInTeam("MC22") == true; 並給沒娜娜的路一條等價的格。
- 要不要另加普通威嚇選項（過＝跑掉）作者定，本批不加，稿內記一筆。`,
    lenses: [
      { tag: '甲', name: '禍落在錢與門', brief: '禍＝五百錢照搶、契約那條門關掉：牠們被吼得更凶，搜走錢，鍋子這輩子別想；查清 CallingDogBrother 與 500 錢那條的指令，禍線用同一套。格數最省。' },
      { tag: '乙', name: '禍落在人與面子', brief: '禍＝代價落在人身上：錢照付或照搶，但重點是旁人怎麼看你（小犀被嚇著、娜娜一句、狗頭人反把你們當肥羊記住），扣好感用 ModifyData(FavorabilityExp,MC8,-20)；不關契約門也可以，寫明。整段要接得上這場戲原本的喜劇腔。' },
      { tag: '丙', name: '另一種演法', brief: '在硬限制內刻意換一種禍，跟甲、乙都不同（例如威嚇太過，狗頭人嚇得砸了東西、跑了，錢沒搶走但契約與鍋子一起沒了；或牠們反而纏上你們）；也換一種福的演法（牠們怎麼把鍋子交出來）。' },
    ],
    checks: [
      '分類與走向：福禍。過＝錢一文不少＋得召喚的鍋子（與契約線同一套記法）＋威嚇經驗兩倍→接回契約線合流格；不過＝禍的新分支，不是原本的失敗',
      '引擎寫法：#3588 加第四選項、自己的擲骰格四段包裝（Manual,IntimidationCheck,18）、隔一格、IsPassDice 掛分支首格；選項格式 [em2][威嚇檢定][/em2][em3]禍兮福倚，福兮禍伏[/em3]，無引號、無分類名；選項格掛 ShowNoviceTeaching(＿＿)；Description 只准詞表；#3588 不掛表情特效',
      '禍的紅線：不死人、不留殘；不比開打輸了（遊戲結束）重；不直接推進戰鬥；代價只落錢、面子、好感、契約門；不新建東西；作者要建的留 ＿＿',
      '契約與門：CallingDogBrother 怎麼記、鍋子怎麼給、門怎麼關，跟既有那條一字不差；宗緯家那次機會沒被禍線一起關掉',
      '連續性：有娜娜／沒娜娜兩套都接得通（娜娜開口的格掛 IsInTeam）；接回點之後的格對得上（誰在場、錢在誰手上）；指引在選單前、只寫亮',
      '變數與編號：不自取名、不新建變數、不動 title、不改既有格的字；獎勵照第四節第 5 條',
      '內容三道線與價值觀：狗頭人來歷只講既有台詞講過的；不碰逆流河來歷；禁詞、0.6、饕餮廢案；東漢價值觀',
      '文風規矩 1–6 與聲口：狗頭人碎句腔照舊；小犀、娜娜、主角照卡；旁白不下判斷；台詞可見字數 50 內；em7 每十格至多一個',
    ],
  },
  {
    key: '阿佑', box: '破廟', group: 3, kind: '未卜',
    out: '劇情/高難度檢定_阿佑.md',
    json: 'Json/破廟/阿傑、阿佑、阿偉、水井.json',
    overview: '劇情/破廟/02 阿傑、阿佑、阿偉、水井.md',
    voices: '阿佑 role98（膽怯）、阿傑 role99、宗緯 role97、卞喜 role125、廖淳 role127（句子都在情境包）；赫連娜娜 MC22（在隊與否查條件）；蕭靈犀 MC8；你 MC1；旁白 role2',
    anchors: '#3608 → 選單 links [#3597 [口才檢定]「你若真不想幹，不如把實情告訴我，或許還能有生路。」→ #3599 …；#3598 [威嚇檢定]「你以為跟著他就有活路？我看他分明是拿你當替死鬼！」→ #3603 …；其他選項見情境包]。名冊：#3256 井（MyTime_Temple < 3 且未持有 Oddlist）→ #3272 拿到名冊；#3712 掛 IsValuablesObtained Oddlist。詰問：AjieLiar_1–_4 在 #3785／#3794／#3799／#3645 等格記 true，#3757、#3980、#3995、#3996 讀四個全 true。廖淳 #3980 送 WingedBeastHelmet。全檔 405 節點已進 Unity。',
    spec: `- 掛點：#3608 那個選單（口才 14／威嚇 10）加一項。指引：固定句旁白格插在 #3608 與它前一格之間（或特效，作者定，稿內註）；選單前一格不掛表情特效。
- 選項：[em2][〈名〉檢定][/em2][em3]知其一，不知其二[/em3]；同選單已有口才與威嚇，優先洞悉 InsightCheck，或另選（學識、魅力），說明；Sequence: ShowNoviceTeaching(＿＿);；Description: 選項N。
- 擲骰格：BeginDiceRoll(Manual,〈ID〉,18)，四段包裝。主角發言格把問話講完整（過不過共用）。
- 過：阿佑吐出一條額外的情報（兩三格；該線第一格 Script: Variable["＿＿"] = true;、Description: 變數更新；經驗 +10 給對應 ID）→ 接回原線（寫明接回哪一格、為什麼）。情報必須是額外的：不是名冊、不是名冊在井裡、不是跳過挖井、不是把後面本來會揭的事提早講、不是趙王洞的事。兌現處在破廟資料夾四份 JSON 的既有互動點，新選項照 [em2][隱藏選項][/em2] 寫、掛 Conditions: Variable["＿＿"] == true;，帶來原本沒有的錢、物、把柄或一條原本沒有的路；兌現處的格子寫進〈兌現處〉。
- 不過：阿佑一句擋回 → 接回原本口才 14 失敗那條。
- 不動 AjieLiar_1–_4 的結構與條件；不碰趙王洞（祭壇、白虎）、饕餮、卞喜的祭壇；宗緯家先不動（兌現處不放那裡）。阿佑聲口膽怯；阿傑此刻在哪、醒著沒查清，新格不能吵醒他或改變他的狀態。`,
    lenses: [
      { tag: '甲', name: '藏寶', brief: '秘密是一樣藏起來的東西：阿佑知道阿傑或卞喜在破廟裡外藏了錢或東西（不是名冊），玩家去既有的互動點多一個 [隱藏選項] 把它取出來；東西只能是錢或既有道具，數字留 ＿＿。他為什麼知道、為什麼不自己拿，一句話講得通。' },
      { tag: '乙', name: '把柄', brief: '秘密是一個把柄：阿佑說出阿傑或卞喜一件見不得人的事（不是拐賣本身，那是主線會揭的），玩家之後在本檔既有的場（攤牌、卞喜進門、廖淳收場）多一個 [隱藏選項] 拿它來用，帶來原本沒有的好處；不動 AjieLiar 結構、不碰祭壇與趙王洞。' },
      { tag: '丙', name: '一條原本沒有的路', brief: '秘密開出一條原本沒有的小路：阿佑知道這座破廟或這一夜的一件事，玩家在破廟資料夾的既有互動點多一個 [隱藏選項]，走進去是一兩格原本沒有的戲，帶一點原本沒有的收穫；不是跳過挖井、不是名冊、不是提早揭主線。' },
    ],
    checks: [
      '分類與走向：未卜。過＝額外的情報帶來額外的獎勵＋記變數；不是名冊、不是名冊在井裡、不是跳過挖井、不是提早揭主線；不過＝接回原本口才 14 失敗那條、不再骰第二次',
      '引擎寫法：選單加一項、自己的擲骰格四段包裝（Manual,〈ID〉,18；ID 在對照表裡、跟同選單的口才威嚇不同）、隔一格、IsPassDice 掛分支首格；選項格式 [em2][〈名〉檢定][/em2][em3]知其一，不知其二[/em3]，無引號、無分類名；選項格掛 ShowNoviceTeaching(＿＿)；Description 只准詞表；兌現處新選項照 [em2][隱藏選項][/em2]、掛 Conditions: Variable["＿＿"] == true;',
      '兌現處是既有內容：在破廟資料夾四份 JSON 的既有互動點；那一場多的選項或格子寫出來、接回點正確；不新建地點道具 NPC；不放宗緯家',
      '不能碰：AjieLiar_1–_4 的結構與條件不動；趙王洞、白虎、饕餮、卞喜的祭壇不碰；阿傑的狀態不被新格改變',
      '連續性：#3608 的每條來路都接得通；過與不過之後接回點對得上（誰在場、名冊在誰手上、MyTime_Temple）；有娜娜／沒娜娜兩套都通；指引在選單前、只寫亮',
      '變數與編號：變數只留 ＿＿、不新建任務、不動 title、不改既有格的字；經驗 +10 給對應 ID',
      '內容三道線與價值觀：禁詞、0.6、饕餮廢案；東漢價值觀，不加道德評語；不編精確數目與小細節',
      '文風規矩 1–6 與聲口：阿佑膽怯、阿傑粗口、卞喜廖淳照既有句；主角；小犀娜娜若開口照卡；台詞可見字數 50 內；em7 每十格至多一個',
    ],
  },
  {
    key: '阿傑', box: '破廟', group: 3, kind: '轉機',
    out: '劇情/高難度檢定_阿傑.md',
    json: 'Json/破廟/阿傑、阿佑、阿偉、水井.json',
    overview: '劇情/破廟/02 阿傑、阿佑、阿偉、水井.md',
    voices: '阿傑 role99（老子、混口飯吃、欺軟怕硬）、阿佑 role98；赫連娜娜 MC22（在隊與否查條件）；蕭靈犀 MC8；你 MC1；旁白 role2',
    anchors: '#3825 戰鬥格（Combat 6，阿傑＋阿佑；parent #3821 與 #3928 兩條來路）→ #3977 緩衝 → [#3826 勝首格 → #3830 你「如何，服氣了？」→ #3831 阿傑「呸！服？老子服你個鳥！…」→ #3832 …；#3827 敗首格（IsPassFight()==false，Sequence Continue();）→ #3865 ShowEnding(Ending_1) 遊戲結束]。全檔 405 節點已進 Unity。',
    spec: `- 掛點：#3827（原格不動）之後、#3865 之前。#3827 的 links 改指新格：骰子亮的固定句旁白（或特效，作者定，稿內註）→ 選單 [轉機選項, 認輸選項]。打輸時你倒在地上，旁白只寫看得見的。
- 轉機選項：[em2][厚黑檢定][/em2][em3]置之死地，而後生[/em3]（厚黑 RealpolitikCheck，詐敗）；Sequence: ShowNoviceTeaching(＿＿);；Description: 選項1。認輸選項一句短話 → 主角發言格 → 接 #3865（原樣，遊戲結束；前面可有旁白一格）。
- 擲骰格：BeginDiceRoll(Manual,RealpolitikCheck,20)，四段包裝；單骰。主角發言格是詐敗的那一句（裝死、裝服、裝傷，看得見的動作放旁白）。
- 過：真的翻盤，你放倒他：兩三格（他鬆懈、你反手一下、他倒地；阿佑的反應一格可有可無）→ 該線第一格 Sequence: ModifyData(FeatExp,Player,Realpolitik,10); → 接 #3830「如何，服氣了？」原勝利線；#3830 以後一格不動；卞喜之後的話接著你贏了寫，尾巴不能寫成「他以為你完了就走」。
- 不過：接 #3865 原樣（人是被戰鬥打倒的，不是被骰子打倒的）。
- 兩條進戰鬥的來路（#3821、#3928）都要通；娜娜在隊與否兩套都通（她若開口掛 IsInTeam）。阿傑聲口貼既有句；阿佑膽怯；詐敗不需要道德評語。`,
    lenses: [
      { tag: '甲', name: '照清單最省', brief: '貼著已定場次清單那一列，格數最少：選單、擲骰、發言、過的翻盤兩格、不過接 #3865。' },
      { tag: '乙', name: '接戲', brief: '先把總覽稿從攤牌讀到卞喜進門、廖淳收場，再寫出唸起來最順、最像阿傑原本嗓子的版本，翻盤之後 #3830「如何，服氣了？」與 #3831 他的回嘴要接得天衣無縫；格數可以比甲多一兩格。' },
      { tag: '丙', name: '另一種演法', brief: '刻意換一種詐敗的演法：換你裝的是什麼（死、服、傷、討饒）、換誰先動（阿佑先放鬆、阿傑先俯身）、換一個看得見的物件；仍用厚黑、仍接回 #3830、仍守全部規矩。' },
    ],
    checks: CHECKS_TURN('#3830', '#3865', '詐敗：厚黑，高概念點名的管用手；阿傑吃這一套（欺軟怕硬）'),
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
## 寫的指令（Script／ModifyData／ShowNoviceTeaching 逐行）
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
4. 指引既有句：Json/小溪村後山/赫連娜娜、張寧.json #784、#785 全文；Json/小溪村/主線起始.json #75／#76 的 Sequence（ShowNoviceTeaching 掛法）；本箱庭既有 [em2][隱藏選項][/em2] 的寫法各一例（entryID、text、Conditions）。
5. 聲口：本批每個會開口的角色，把本箱庭 JSON 裡他的每一句都撈出來（grep -n '"actorID": "<ID>"' -A2），另跑 python -X utf8 給AI看的指南/既有台詞.py 撈 MC8、MC22 各十五句代表句；狗頭人把 role123／role105／role107／role106 全撈。
6. 設定：本箱庭 @設定 檔與 00 總覽的說話者對照、疑點；@角色設定/蕭靈犀.md、赫連娜娜.md 的聲口段；給AI看的指南/文本創作指南.md 0.2.3 全節與 0.6 序章那幾條。
7. 兌現處（未卜的場才做）：本箱庭資料夾每份 JSON 裡有選單的既有互動點（entryID、text、links、Conditions、前後三格），與那一場已經揭露了什麼。
8. 每一場特別要查的事實：契約線 CallingDogBrother 是變數還是道具、在哪一格記、鍋子怎麼給、之後接到哪、門怎麼關；阿傑在阿佑那段時在哪、醒著沒；#3608 的前一格；口才 14 的成功線與失敗線各接哪裡；兩條進 #3825 戰鬥的來路。只寫事實。
9. 指南摘錄（作者 2026-09-26 裁示：起草者只讀情境包，視同讀過三份指南，所以這一節要抄齊）：逐字抄出 給AI看的指南/文本創作指南.md 第零層高概念那幾段、0.2.3 全節、0.6 序章那幾條、2.1a 全節；給AI看的指南/世界觀.md 第八節全節；給AI看的指南/武俠文風創作指南.md〈零、常犯十條〉整節（**放在情境包最前面，起草者先看錯例再動筆**）、第四節開頭通則、旁白卡、你（主角）卡、本批每個出場角色的聲口卡（沒有卡的角色註明「無卡，照第 5 項既有句」）、7.1a–7.1c、7.3、第八節自檢清單；@角色設定/饕餮.md 第十節廢案清單與停用術語；劇情/轉成json指南.md §1 Description 詞表與 §4.2 開頭的通則與選項文字規矩；給AI看的指南/擲骰指令轉換規則.md〈擲骰節點的 Sequence 固定寫法〉第 1、2 條與〈常用檢定項目ID對照〉表；給AI看的指南/立繪指令轉換規則.md 裡本批出場角色可用的 pic 格號與表情特效名稱。
寫完檔案後，回傳一頁摘要（兩千字內）：每場的掛點、接回點、來路條件、會開口的角色與 ID、兌現處候選清單、你發現起草者一定要知道的坑。摘要是給下游看的目錄，細節都在檔案裡。`
}

function draftPrompt(u, lens) {
  return `${COMMON}

你是起草者（${lens.tag}｜${lens.name}）。你的取向：${lens.brief}
${unitHead(u)}

做法（作者 2026-09-26 裁示，省回合）：只讀情境包 ${packetPath(u.box)}。**先把它最前面的〈常犯十條〉錯例對改例讀一遍再動筆**（作者 2026-09-28）。它的〈指南摘錄〉一節已逐字收了三份指南與各轉換規則裡寫這場戲用得到的節，**讀情境包即視同讀過 CLAUDE.md 要求的三份指南，不必再開指南原檔**。起草只管寫戲：**不回 JSON、總覽稿查連線與來路**，接不接得通、既有格有沒有被動，交給下一步的審修。只有情境包真的缺了寫戲非要不可的東西（某個角色的句子、某格原文）時，才去原檔讀那一段，並在〈起草者自檢〉記一筆缺了什麼。不要改任何專案檔。
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
      : agent(scoutPrompt(box, UNITS.filter(u => u.box === box)), { label: `scout:${box}`, phase: 'Scout', effort: 'xhigh', model: MODEL }).then(r => !!r)
  }
  return scoutJobs[box]
}

async function runScene(u) {
  const had = (A.have[u.key] && A.have[u.key].drafts) || []
  const drafts = (await parallel(u.lenses.map(l => async () => {
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

// 作者 2026-09-26：六場同時跑；同一箱庭的場等同一份情境包。
log(`同時開跑：${UNITS.map(u => u.key).join('、')}`)
const results = (await parallel(UNITS.map(u => async () => {
  const ok = await ensurePacket(u.box)
  if (!ok) return { unit: u.key, error: 'scout failed' }
  return await runScene(u)
}))).filter(Boolean)
return { date: DATE, units: results }
