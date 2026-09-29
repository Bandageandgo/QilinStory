export const meta = {
  name: 'hard-check-xiaoxicun',
  description: '高難度檢定第一、二批：小溪村碰瓷（福禍）、村長（未卜）、河童第二戰（轉機）、破廟狗頭人打劫（福禍）、阿佑（未卜）、阿傑（轉機）；每場三名起草、三名審稿、三版都留並標建議、兩名複核，再寫提案檔並稽核',
  phases: [
    { title: 'Scout', detail: '每場一名：規則原文、掛點前後連線、每條來路、既有台詞、骰子亮既有句、兌現處節點' },
    { title: 'Draft', detail: '每場三名起草：福禍／轉機＝最省／接戲／另一種演法；未卜＝三個不同的秘密與兌現處' },
    { title: 'Review', detail: '每場三名審稿：文風／連續性／規格，逐項通過或駁回' },
    { title: 'Synthesize', detail: '三版都留、接上審稿嫁接、標一版建議；全被駁回的那版重寫' },
    { title: 'Verify', detail: '兩名懷疑者複核三版，駁回就退回重寫（最多兩輪），過不了列待作者定' },
    { title: 'Apply', detail: '每場一名編輯新建提案檔 劇情/<箱庭>/高難度檢定_<場>.md' },
    { title: 'Audit', detail: '每場一名稽核對照定稿並跑節奏檢查，有錯送修再查一次' },
  ],
}

// 用法：Workflow({scriptPath: '.claude/wf/hard-check-xiaoxicun.js', args: {date: '2026-09-25'}})
// args.date 必填（腳本裡不能用 new Date）；args.only 可只跑幾場，例如 ['碰瓷']。
// 2026-09-26 改版：碰瓷的提示一字未動（沿用快取）；村長換取向與檢查、加 update；新增河童第二戰、狗頭人打劫、阿佑、阿傑四場；分兩組跑。
const A = Object.assign({ date: '＿＿＿＿-＿＿-＿＿', only: null }, args || {})
const DATE = A.date
const GUIDE = '給AI看的指南/高難度檢定走向指南.md'

const COMMON = `你在做《異麒麟》高難度檢定第一批（小溪村；作者 2026-09-25 拍板：碰瓷＝福禍、村長＝未卜）。規矩全在 ${GUIDE}：第一節三個分類、第四節引擎寫法、第五節走向細則、第六節規則十三條、第七節碰瓷骨架、第七之二節指引（骰子亮）、第十一節任務單；動筆前必讀，本提示只摘要。
- 什麼叫高難度檢定：在既有選單旁邊加一個高難度擲骰選項，過或不過至少有一邊跟原本的分支不同。標記寫在選項上：[em2][威嚇檢定・福禍][/em2]「…」。難度作者填，本批暫填 18。
- 福禍：過＝加倍獎勵或新分支；不過＝禍，一條新分支（極端結果＋代價），不是原本的失敗。禍不死人（嚇死要救回）、不留殘、不關線；代價只落好感、錢、面子。
- 未卜：過＝情報（你本來不知道的事，在別處兌現）或捷徑（通過別的關卡的另一條路），不是給東西；不過＝回到原本檢定失敗那條，不再給第二次骰。秘密只能指向已存在的東西；兌現處那格掛 Conditions: Variable["＿＿"] == true;。
- 引擎寫法（第四節，違反即退）：一個選項一顆骰，高難度是另加一個選項、自己接一個擲骰格，不跟普通選項共用擲骰格。結構照 劇情/轉成json指南.md §4.2：選項格（actorID MC1，Description「選項N」）→ 擲骰格（actorID 0、text 空、Description「〈名〉檢定」、Sequence 四段：SetContinueMode(false);SetContinueMode(original)@Message(EndRoll);Continue()@Message(EndRoll);BeginDiceRoll(Manual,〈FeatID〉,18);）→ 主角發言格（MC1，把選項那句講完整，過不過共用）→ 成功分支首格 Conditions: IsPassDice() == true; ／失敗分支首格 Conditions: IsPassDice() == false;。IsPassDice 不掛在緊接擲骰格的那一格。FeatID 只能用 給AI看的指南/擲骰指令轉換規則.md〈常用檢定項目ID對照〉裡的（威嚇 IntimidationCheck、口才 PersuasionCheck、洞悉 InsightCheck、學識 KnowledgeCheck、魅力 CharismaCheck 等）。選項格 Sequence 掛 ShowNoviceTeaching(＿＿);（教學 ID 作者建）。
- 獎勵（第四節第 5 條）：福禍過＝普通的兩倍（威嚇 ModifyData(FeatExp,Player,Intimidation,20);）；未卜過＝+10 給對應 ID。錢、物、把柄是走向的一部分，不算檢定獎勵。禍的代價用既有指令 ModifyData(FavorabilityExp,MC8,-20); 之類，不做新數值。
- 指引（第七之二節）：麒麟骰亮＝預示福禍的指引。出處 Json/小溪村後山/赫連娜娜、張寧.json #784／#785 與 Json/主線事件/180年/2月.json #4054，措辭貼那幾句。只寫亮，不寫燙、熱、顫、震（那些是饕餮的字）；不解釋為何亮、亮了代表什麼。
- 硬紅線：不自取變數名、任務號、教學 ID（一律留 ＿＿）；SetFlag／GetFlag 禁用；不新建變數、任務、地點、道具、NPC；已進 Unity 的節點不改號、不動 title；新格不編號；Description 只寫 劇情/轉成json指南.md §1 詞表的標籤（選項1、威嚇檢定、變數更新、蕭靈犀好感度下降 之類），不寫說明、不寫數值。
- 內容三道線：給AI看的指南/世界觀.md 第八節禁詞（五胡亂華、司馬、篡魏、三國歸晉、輪迴、重來、前世）；給AI看的指南/文本創作指南.md 0.6 揭露節奏（序章任何人不碰骰子來歷、張角、太平道）；@角色設定/饕餮.md 第十節廢案清單。用東漢的價值觀寫：把柄和嚇死不需要道德評語，旁人怎麼看他才是反應。
- 產物是「創作稿／提案」（.md），照 劇情/轉成json指南.md 的寫法：說話者行 **旁白:**／**你:**／**蛋頭:**／**張仲景:**／**蕭靈犀:**／**村長:**（主角一律「你」），旁白 [panel=6]＊（…）＊，台詞「…」；每格底下用 - actorID: / - Sequence: / - Conditions: / - Script: / - Description: / - 註記: 各一行，有才寫；立繪與表情寫在 Sequence（照 給AI看的指南/立繪指令轉換規則.md）。分岔用 ▶，合流寫「→ 接 #N」，新節點不寫 entryID，只寫「插在 #N 之後」「#N 的 links 加一個」「接回 #N」。不動 Json/、不動 Unity、不動總覽稿（劇情/小溪村/0N ….md 是回讀稿，一個字不改）、不動 ${GUIDE}。
- 選項規矩（轉成json指南 §4.2）：選項一律是短版選單句＋底下那格完整發言，選項比發言格短、同一件事、是他第一人稱說出口的話；選單前那一格不掛表情特效。
- 文風規矩（違反即退）：
  1. 旁白看得見你做什麼、看不見你想什麼：不寫主角內心話、不替玩家下感受或結論、不替角色斷定心裡怎樣（「倒像」「像是」可以）。
  2. 寫結果和狀態，不寫過程；一格裡同一個人的動作最多兩拍；不編精確數目、距離和純造景小細節；數字要有用才寫。
  3. 作者退過的句型不得再犯：「不是 X，是 Y」翻轉句；否定句收尾造氣氛；「像……」比喻巧句收尾；收尾加新判語；旁白先把下一格台詞要講的事講掉；選項已經講過的事旁白再講一遍；同一件事隔幾格又講一遍。
  4. 句子寫完整，不斷碎句：旁白一格兩三句、每句十九到二十五字、不留五字以下的句子；角色台詞一句十五字上下、可見字數 50 內，照那個角色既有的口吻。
  5. 旁白裡不寫「」引號、不用破折號。[em7] 每十格至多一個、同一人不連掛，只掛立繪演不出來又非交代不可的那一下；[/em7] 後必接標點。
  6. 玩家看得到的字不自創單字名詞；東漢稱謂與用詞（不用「老爺子」那類）；硬紅線詞永不進文本。
- 給作者看的話用白話短句，不用自創術語。日期一律寫 ${DATE}。`

// 2026-09-26 指南改版：只加給村長與新場次（碰瓷的提示不動，沿用快取；碰瓷的選項格式在 Apply 階段改）。
const UPDATE = `【2026-09-26 指南更新，與上面摘要衝突時以本段為準】
- 選項格式（第一節〈選項格式〉，已定）：檢定標籤＋題語，選單上沒有主角的話、不加引號、不出現分類名（福禍／未卜／轉機三個詞不進選項）：
  福禍 [em2][威嚇檢定][/em2][em3]禍兮福倚，福兮禍伏[/em3]
  未卜 [em2][洞悉檢定][/em2][em3]知其一，不知其二[/em3]
  轉機 [em2][厚黑檢定][/em2][em3]置之死地，而後生[/em3]
  檢定名照實際用的寫，且只用遊戲裡既有的標籤（口才檢定＝PersuasionCheck；全案沒有「說服檢定」這個標籤，指南寫「說服」就是口才）。題語一類一句、全案不改字；不冠「麒麟骰：」、不加「兆」。真正的話在擲骰之後的主角發言格才講，照文風指南寫完整。同一選單優先用普通選項那一種檢定，選單裡沒有合適的才另選；轉機用那一場說法最順的檢定。
- 未卜的定義收緊（第一節、第五節）：過＝額外的情報，而那條情報帶來額外的獎勵（沒有這一骰就不存在的錢、物、把柄、或一條原本沒有的路）。把玩家本來就會拿到的東西提早給（例：阿佑直接交出名冊）、把本來要走的關跳過（例：跳過挖井、直接給謎底），都不算未卜。兌現處要是既有內容，新選項照 [em2][隱藏選項][/em2] 寫、掛 Conditions: Variable["＿＿"] == true;。
- 轉機不變：只在打輸之後；過＝另一種戰鬥勝利（任務照成功、進度變數照勝利線走、對話裡的獎勵照拿、沒有引擎戰鬥獎勵），接回勝利線的無條件格，之後不動；不過＝回原失敗線，不再骰第二次。序章轉機難度暫 20。
- 第十一節的 11-A／11-B 詳表已改成〈已定場次清單〉一張表（骨架同前）。執筆通用規則：先跑既有台詞；台詞過文風指南與審校清單；不寫內心話；主角標籤用「你」；不自取變數名、任務號、教學 ID；不新增不改 title；Description 只准詞表標籤；引擎寫法照第四節；每格附 actorID。
- Json/主線事件/180年/2月.json #4054 已改成「見眾人困惑，你便簡單說了麒麟骰能預示福禍的來歷。」（後半句已刪）；骰子亮的措辭貼 #784／#785 與七之二的固定句。
- 提案檔一律三版，放 劇情/<箱庭>/高難度檢定_<場>.md，檔頭第一行寫「創作稿／提案，尚未進 JSON」。`

const SCOUT_ITEM1_NEW = `1. 規則原文：從 ${GUIDE} 逐字抄出：第一節整節（含〈選項格式〉與三句題語）、第五節本類那一小節、第六節規則十三條、第七之二節「第一次」與「往後每一次」兩段、第九節本箱庭素材盤點裡本場那幾列與那段的說明文字、第十一節〈已定場次清單〉本場那一列與〈執筆 agent 通用規則〉。`

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
    key: '碰瓷',
    group: 1,
    kind: '福禍',
    task: '11-A',
    out: '劇情/小溪村/高難度檢定_碰瓷.md',
    json: 'Json/小溪村/碰瓷.json',
    overview: '劇情/小溪村/09 碰瓷.md',
    reads: [GUIDE + ' 第十一節 11-A 任務單、第五節福禍、第七節碰瓷骨架、第七之二節第一次', '劇情/小溪村/09 碰瓷.md 全檔', '劇情/小溪村/00 總覽.md 說話者對照', '劇情/小溪村/@設定_小溪村.md', '@角色設定/蕭靈犀.md（聲口）', '給AI看的指南/武俠文風創作指南.md 第四節旁白卡、你（主角）卡、蕭靈犀卡'],
    voices: '蛋頭 role87（既有台詞.py 不認得，本檔 8 句用 grep 撈；⚠ Json/呂信線/01仗義疏財.json 也有 role87，那是清風寨的人借用同一個 ID，不是蛋頭，蛋頭之後不再出場）；張仲景：本檔說話者 actorID 是 role42、立繪 MC13（00 總覽說話者對照有說明），新格沿用 role42 ＋ SetPortrait(MC13,pic=N)；既有台詞.py 跑 MC13 與 role113 兩個都讀，再 grep role42 撈小溪村的句子；蕭靈犀 MC8（既有台詞.py）；你 MC1；旁白 role2',
    anchors: '打贏緩衝 #2035（Conditions IsPassFight() == true;，Sequence Continue();）→ 選單 links [#2036 威嚇 6「把你騙來的錢給我留下！」, #2032 賠罪]，第三個選項就加在 #2035 的 links。現有威嚇流：#2036 → #2037 擲骰格（IntimidationCheck 6）→ #2039 主角發言 → [#2033 過（Conditions IsPassDice()==true;，Sequence 威嚇經驗 10 ＋ Coin）→ #2047, #2041 不過 → #2047]。#2047 郎中出現旁白（Sequence SetPortrait(MC1,pic=12)）→ #2052 張仲景「唉唷，這裡還挺熱鬧的啊」→ #2048 外貌描寫旁白 → #2051「蛋頭！我不是跟你說過」→ #2053 → #2055 → #2054 → #2056 → #2057 → #2050 任務更新。賠罪線 #2032 → #2058 → #2038 → #2047；戰敗線 #2042 → #2043 → #2044（Coin -50）→ #2047。全檔 29 節點已進 Unity。',
    spec: `- 掛點：#2035 的 links 加第三個選項格。
- 選項：[em2][威嚇檢定・福禍][/em2]「…」（骨架給的例句是「這套把戲，誰教你的？」，可換）；選項格 Sequence: ShowNoviceTeaching(＿＿);，Description: 選項3。
- 第一次介紹（第七之二節；這一場是全遊戲第一次高難度檢定）：選項之後、擲骰格之前：旁白一格 懷裡的麒麟骰亮了一下（貼 #784／#4054 既有句）→ 主角一句（娘留下的這顆，但凡要涉險就亮一亮；他早就知道，玩家第一次知道）→ 小犀一句（可有可無）→ 擲骰格 → 主角發言格（把選項那句對蛋頭講完整）→ 分支。⚠ 擲骰格因此不緊接選項格，稿內記一句「⚠ 待作者確認引擎是否允許選項與擲骰格之間隔格」。
- 擲骰格：BeginDiceRoll(Manual,IntimidationCheck,18)，四段包裝；Description: 威嚇檢定。
- 過（福）：蛋頭一句（服軟）→ 該格 Sequence 加 ModifyData(Coin,50);ModifyData(FeatExp,Player,Intimidation,20); → 接 #2047 原線。Description 照詞表。
- 不過（禍）：你吼得太狠，蛋頭兩眼一翻倒地（旁白）→ 小犀一句 → 新格取代 #2047 的位置：張仲景不知何時出現，先蹲下探鼻息（#2047 原格不動，禍線不走它）→ 救活兩三格（看得見的動作，不寫醫理）→ 張仲景看你一句（不是好話）→ 該格或旁白格 Sequence: ModifyData(FavorabilityExp,MC8,-20);ModifyData(FavorabilityExp,MC13,-20);，Description: 蕭靈犀好感度下降、張仲景好感度下降 → 接回 #2051「蛋頭！我不是跟你說過」原線。⚠ #2048 是張仲景唯一的外貌描寫、#2052 是他第一句話，禍線繞過它們的話要自己交代或改接法，稿內說明你怎麼處理。
- 張仲景在這場不提骰子、太平道、張角（0.6）。蛋頭不死。旁白不替主角下判斷。
- 意義（寫戲時記著，不寫進文本）：玩家先看見張仲景把人從鬼門關拉回來，之後古墓他救主角那一場才有分量；小犀和張仲景怎麼看你，就是 0.2.2 那份名單。`,
    lenses: [
      { tag: '甲', name: '照任務單最省', brief: '貼著任務單 11-A 與第七節骨架，格數最少、差別最集中：只寫任務單點名的那幾格，禍線接回 #2051 前的交代用最少的字。偏離任務單處在 self_check 講明。' },
      { tag: '乙', name: '接戲', brief: '先把 09 碰瓷.md 整場從 #2026 讀到 #2050，再寫出唸起來最順、最像這場戲原本嗓子的版本：蛋頭的市井腔、張仲景的疏懶、小犀的嘴快都要接得上；格數可以比甲多一兩格，但守任務單。' },
      { tag: '丙', name: '另一種演法', brief: '在任務單範圍內刻意換一種演法，讓作者有真的不一樣的選擇：差別放在禍那一邊怎麼演（誰先發現他倒了、張仲景怎麼救、那句不是好話怎麼說）、小犀那句放不放、選項句換一種問法。仍守全部規矩與任務單。' },
    ],
    checks: [
      '分類與走向：福禍。過＝加倍＋接 #2047 原線；不過＝禍的新分支（嚇死→救活→扣好感→接回 #2051）；至少一邊跟原分支不同',
      '引擎寫法：另加第三選項、自己的擲骰格四段包裝（Manual,IntimidationCheck,18）、擲骰格與分支間隔一格、IsPassDice 掛在分支首格、不共用 #2037；選項格 Sequence 掛 ShowNoviceTeaching(＿＿)；Description 只准詞表',
      '禍的紅線：蛋頭救回、不留殘、不關線；代價只有好感 -20×2（MC8、MC13）與面子，不扣任務、不死人；張仲景不提骰子、太平道、張角',
      '第一次介紹：選項之後、擲骰之前有 骰子亮旁白＋主角一句（小犀可有可無）；措辭貼 #784／#785／#4054；只寫亮，不寫燙熱顫震；不解釋為何亮',
      '連續性：禍線走到 #2051 時張仲景的外貌描寫（#2048）與「唉唷」（#2052）有沒有交代；#2047 原格不動、禍線用新格；接回點的立繪與 Sequence 對得上；過線接 #2047 不多不少',
      '變數與編號：不自取名、不新建變數、不動 title、不改既有格；獎勵照第四節第 5 條（威嚇 20、Coin 50）',
      '內容三道線與價值觀：世界觀第八節禁詞、0.6 揭露、饕餮廢案；嚇死不加道德評語，旁人怎麼看他才是反應',
      '文風規矩 1–6 與聲口：蛋頭、張仲景（role42 既有句＋MC13）、小犀、主角；旁白不下判斷；選項比發言格短且同一件事；em7 每十格至多一個；台詞可見字數 50 內',
    ],
  },
  {
    key: '村長',
    group: 1,
    kind: '未卜',
    task: '11-B',
    out: '劇情/小溪村/高難度檢定_村長.md',
    json: 'Json/小溪村/棋局殘譜、村長.json',
    overview: '劇情/小溪村/03 棋局殘譜、村長.md',
    reads: [GUIDE + ' 第十一節 11-B 任務單、第五節未卜、第七之二節往後每一次、第九節小溪村素材盤點', '劇情/小溪村/03 棋局殘譜、村長.md 全檔', '劇情/小溪村/00 總覽.md 說話者對照', '劇情/小溪村/@設定_小溪村.md（村長只有一句：外表豪爽，但似乎隱藏著秘密；沒有角色檔）', '兌現處那一場的總覽稿與 JSON（見各版取向；哪份 JSON 在哪份總覽稿查 劇情/索引.md）', '給AI看的指南/武俠文風創作指南.md 第四節旁白卡、你（主角）卡'],
    voices: '村長 role112（既有台詞.py 不認得，本檔 26 句用 grep 撈；他叫主角小兄弟、自稱老哥）；你 MC1；蕭靈犀 MC8（若開口，既有台詞.py）；旁白 role2',
    anchors: '掛點①（任務單建議，本批照它）：#30 你「正是那局。小弟僥倖參破其中變化。」→ #31 村長「踏破鐵鞋無覓處啊！…你可願將此解法告知於我？或是有何想法？」→ 選單 links [#52 經濟 14 談價, #32 雙手奉上, #46 看著給, #63 不了自己研究]，第五個選項加在 #31 的 links。現有經濟流：#52 → #53 擲骰格（EconomicDevelopmentCheck 14）→ #54 主角發言 → #2054 → [#55 過（IsPassDice()==true）→ #56…, #59 不過「最多出一百五十錢」→ #60…]。到 #31 的來路帶條件：MyTime、ChessGame == true（#28）、C0M1 第 2 項；Scout 逐路列。全檔 86 節點已進 Unity。',
    spec: `- 掛點：#31 的 links 加第五個選項格（若某版認為任務單的掛點②更順，寫明理由，但本批預設①）。
- 選項：[em2][〈名〉檢定・未卜][/em2]「…」，形狀是「拿棋譜換他一句實話」；檢定從 口才 PersuasionCheck（任務單寫「說服」，引擎對照表沒有說服這個 ID，口才就是它）、洞悉 InsightCheck、學識 KnowledgeCheck、魅力 CharismaCheck 裡選，每版說明選哪個、為什麼；選項格 Sequence: ShowNoviceTeaching(＿＿);，Description: 選項5。
- 指引（第七之二節往後每一次）：選單之前骰子亮。本批寫成固定一句旁白格 [panel=6]＊（懷裡的麒麟骰亮了一下。）＊ 插在 #30 與 #31 之間（#30 改接它、它接 #31），並在稿內註「若作者選特效，刪此格，改在 #31 的 Sequence 掛 PlayOrStopParticle(＿＿,Play)」。這場不演第一次介紹（那在碰瓷）；但玩家可能先到村長，所以教學 ID 照掛，稿內註明。
- 擲骰格：BeginDiceRoll(Manual,〈FeatID〉,18)，四段包裝；Description: 〈名〉檢定。
- 主角發言格：把選項那句講完整（過不過共用）。
- 過：村長吐實兩三格（該線第一格 Script: Variable["＿＿"] = true;，Description: 變數更新；經驗 ModifyData(FeatExp,Player,〈ID〉,10); 或 AbilityExp）→ 接回原線。要說清楚棋譜與錢怎麼算：既然是拿棋譜換實話，建議接回 #59 起那條（他照低價收、你拿到的是話）或 #32 奉上線，各版寫明接哪裡、為什麼。
- 不過：村長一句擋回 → 接回原本經濟檢定失敗那條（#59 起）。
- 秘密內容：每版一句話說清 他藏的是什麼、為什麼藏、玩家拿到後去哪兌現。量級是村子的事，不是天下的事；配得上「藏」，但不改變任何主線；不編精確數目。
- 兌現處只能是任務單列的五處之一：後山樹下刀客的謎底（Json/小溪村後山/攔路匪、樹下刀客1.json，四選一多一個「我知道謎底」）；攔路匪的規矩或名號（同檔）；童淵要找的百年鐵木在哪（Json/探索事件/179年/3月.json 童淵線）；河童釣點（Json/大地圖的小溪村.json）；廢屋或河邊釣點可挖的埋物（Json/小溪村/釣魚、廢棄的屋子.json）。兌現處那格掛 Conditions: Variable["＿＿"] == true;，新選項與後續一兩格要寫出來（redeem_md）；埋物只能是錢或既有道具（ModifyData(Coin,＿＿) 數字作者填）。捷徑跳過的那一關不能是必看的揭露。
- 不能碰：河伯娶親（作廢）；小花與阿婆的動機（未定）；骰子、饕餮、張角、太平道（0.6）；一枝花的真身（她的線在 179/5–7；茶博士是她堂哥，不可爆）；逆流河與異舟的來歷；古墓入口（娜娜線的鉤子）。
- 村長聲口貼他既有 26 句（豪爽、愛棋、叫小兄弟）；不寫內心話；東漢價值觀。`,
    update: UPDATE + `
【本場 2026-09-26 補充】
- 上面任務單摘要裡「兌現處只能是五處之一」與「謎底」「捷徑跳過」那幾句，以收緊後的未卜定義為準：兌現處仍要是既有內容（小溪村資料夾、後山的樹下刀客與攔路匪、大地圖的小溪村、探索事件裡的童淵線都算），但拿到的必須是額外的：直接給謎底、免打免錢過關、把童淵本來會找到的鐵木提早告訴他、把本來就釣得到的河童提早指出來，都不算。作者 2026-09-26 仍准樹下刀客當村長那條路的兌現處，前提是那條路帶來的東西是原本沒有的。
- 選項寫 [em2][〈名〉檢定][/em2][em3]知其一，不知其二[/em3]；名稱用既有標籤（口才／洞悉／學識／魅力檢定）。
- 三版三個不同的秘密（見各自取向），不要三個版本寫同一個秘密。`,
    lenses: [
      { tag: '甲', name: '一條原本沒有的路・後山', brief: '秘密開出一條原本沒有的路：村長知道後山樹下刀客或攔路匪那裡有一樣別人拿不到的東西或一段別人聽不到的話，玩家報上村長的名字（或說出村長給的那句），那一場多一個 [隱藏選項]，帶來原本沒有的收穫（額外的錢、物、一段江湖見聞、或一個新的去處指引）。不是給謎底、不是免打免錢過關。先把 Json/小溪村後山/攔路匪、樹下刀客1.json 與它的總覽稿讀完，兌現處的新選項與後續格子寫進 redeem_md。' },
      { tag: '乙', name: '把柄・村裡某人', brief: '秘密是一個把柄：村長知道村裡某個有戲的人一件不想讓人知道的事（老學究、茶博士、賭鬼兄妹、有間客棧的人都可以；不可碰一枝花的真身、小花與阿婆的動機），玩家拿去對那人用，那人的場多一個 [隱藏選項]，帶來原本沒有的好處（額外的錢、物、或一句原本問不到的話）。被抓把柄的人要過他的既有台詞與設定；東漢價值觀，不加道德評語。先把那一場的 JSON 與總覽稿讀完，兌現處寫進 redeem_md。' },
      { tag: '丙', name: '藏寶・埋物', brief: '秘密是村裡埋著或藏著的一樣東西：廢屋或河邊釣點可挖的埋物（Json/小溪村/釣魚、廢棄的屋子.json），他為什麼知道、為什麼不自己拿，一句話講得通。東西只能是錢或既有道具，數字留 ＿＿；兌現處多一個 [隱藏選項]「挖」與後續格子寫進 redeem_md。' },
    ],
    checks: [
      '分類與走向：未卜。過＝額外的情報，帶來額外的獎勵（沒有這一骰就不存在的錢、物、把柄、或一條原本沒有的路）＋記變數；不是提早給本來會拿到的東西、不是跳過本來要走的關、不是給謎底；不過＝接回原本經濟檢定失敗那條、不再給第二次骰；一句話講清藏什麼、為何藏、去哪兌現',
      '引擎寫法：第五個選項、自己的擲骰格四段包裝（Manual,〈ID〉,18；ID 只能是對照表裡的）、隔一格、IsPassDice 掛分支首格、不共用 #53；選項格式 [em2][〈名〉檢定][/em2][em3]知其一，不知其二[/em3]，無引號、無分類名，檢定名是既有標籤；選項格掛 ShowNoviceTeaching(＿＿)；Description 只准詞表；兌現處新選項照 [em2][隱藏選項][/em2] 寫、掛 Conditions: Variable["＿＿"] == true;',
      '兌現處是既有內容：那一場多的選項或格子寫出來、接回點正確；不新建地點道具 NPC；被抓把柄的人過他的既有台詞與設定',
      '不能碰的清單：河伯娶親、小花阿婆動機、骰子饕餮張角太平道、一枝花真身、逆流河異舟、古墓入口；量級是村子的事、不改主線',
      '連續性：#31 選單的每條來路（MyTime、ChessGame、C0M1 第 2 項）都接得通；過與不過之後棋譜與錢怎麼算清楚；#31 前一格不掛表情特效；指引（骰子亮）放在選單前，只寫亮',
      '變數與編號：變數只留 ＿＿、不新建任務、不動 title、不改既有格的字；經驗 +10 給對應 ID',
      '內容三道線與價值觀：禁詞、0.6、饕餮廢案；東漢價值觀；不編精確數目與小細節',
      '文風規矩 1–6 與聲口：村長貼他既有 26 句（豪爽、叫小兄弟、自稱老哥）；主角；小犀若開口照她；發言格把話講完整；台詞可見字數 50 內',
    ],
  },
  {
    key: '河童第二戰',
    group: 1,
    kind: '轉機',
    task: '已定場次清單・大地圖的小溪村／河童第二戰',
    scoutItem1: SCOUT_ITEM1_NEW,
    out: '劇情/大地圖的小溪村/高難度檢定_河童第二戰.md',
    json: 'Json/大地圖的小溪村.json',
    overview: '劇情/大地圖的小溪村/大地圖的小溪村.md',
    reads: [GUIDE + ' 第一節（含選項格式）、第五節轉機、第六節、第七節河童三兄弟那段（含 2026-09-26 只放第二戰的裁示）、第七之二節、第十一節已定場次清單', '劇情/大地圖的小溪村/大地圖的小溪村.md 河童三場全部', '劇情/小溪村/@設定_小溪村.md 河童那段（若有）', '@角色設定/蕭靈犀.md（聲口）', '給AI看的指南/武俠文風創作指南.md 第四節旁白卡、你（主角）卡、蕭靈犀卡'],
    voices: '河童大哥 role120、三弟 role121、二哥 role122（既有台詞.py 不認得，用 grep 撈本檔每一句；說話者對照看總覽稿檔頭）；蕭靈犀 MC8；你 MC1；旁白 role2',
    anchors: '第二戰：#320 → #321 戰鬥格（Combat 26）→ #378 緩衝 → [#322 勝首格（IsPassFight()==true；大哥 role120「英雄饒命！我們兄弟倆徹底服了！」，Sequence 帶 ModifyData(Coin,150)）→ #379 三弟「大哥，你何必跟這小子求饒！」→ #380 大哥「你懂什麼，留得青山在…」→ #324 → … → #325 → #381 旁白 Script FlokMonster = 2；#326 敗首格（IsPassFight()==false；三弟 role121「大哥，我們走。看來這小子也不過如此。」）→ #327 大哥「哈哈哈！看到沒！俺三弟一出手，你就變成軟腳蝦了！」→ #328 旁白 Script FlokMonster = -1（關線）→ #329]。第三戰 #337 旁白「之前被你擊敗的妖怪大哥和三弟衝了出來」。全檔 142 節點已進 Unity。',
    spec: `- 掛點：#326（原格不動）之後、#327 之前。#326 的 links 改指新格：骰子亮的固定句旁白 [panel=6]＊（懷裡的麒麟骰亮了一下。）＊（或特效掛 #326，作者定，稿內註）→ 選單 [轉機選項, 認輸選項]。
- 轉機選項：[em2][口才檢定][/em2][em3]置之死地，而後生[/em3]（暫口才 PersuasionCheck；若某版認為別的檢定更順，寫明理由；同場普通選項用過的檢定不重複）；Sequence: ShowNoviceTeaching(＿＿);；Description: 選項1。
- 認輸選項：一句短話（「……認了。」之類）→ 主角發言格 → 接 #327。
- 擲骰格：BeginDiceRoll(Manual,PersuasionCheck,20)，四段包裝；單骰（要不要連骰作者定，稿內記一筆）。
- 主角發言格：把翻盤的話說出口（讓牠們信你方才留了手、或服你有種；妖怪服狠）。
- 過：扭轉尾巴兩三格（大哥將信將疑、三弟不服、大哥壓住三弟）→ 該線第一格 Sequence: ModifyData(Coin,150);ModifyData(FeatExp,Player,Persuasion,10); → 接 #379「大哥，你何必跟這小子求饒！」原勝利線（之後 #380 → … → #381 FlokMonster = 2 照原線走，一格不動）。尾巴收在大哥服軟，#379 三弟那句才接得上。
- 不過：小犀一句（可有可無）→ 接 #327 原線 → #328 關線。
- 只放第二戰；第一戰、第三戰輸了照原樣關線。#337「之前被你擊敗的」改不改一字作者定，稿內記一筆。
- 河童聲口貼既有句（俺、英雄、大哥三弟）；不解釋牠們是什麼、不碰逆流河與異舟的來歷；不寫饕餮的字。`,
    update: UPDATE,
    lenses: [
      { tag: '甲', name: '照清單最省', brief: '貼著已定場次清單那一列與第七節河童那段骨架，格數最少：選單、擲骰、發言、過的尾巴兩格、不過一格。偏離處在 self_check 講明。' },
      { tag: '乙', name: '接戲', brief: '先把總覽稿裡河童三場從頭讀到尾（含第一戰輸贏、第三戰怎麼提起前兩戰），再寫出唸起來最順、最像這幾隻妖怪原本嗓子的版本；格數可以比甲多一兩格。' },
      { tag: '丙', name: '另一種演法', brief: '在規則範圍內刻意換一種翻盤說法：換一種檢定（魅力、厚黑、武藝之類，寫明理由）、換誰先開口、換一個看得見的動作，讓作者有真的不一樣的選擇；仍要接回 #379、仍守全部規矩。' },
    ],
    checks: CHECKS_TURN('#379', '#327', '妖怪服狠：讓牠們信你留了手，或服你有種'),
  },
  {
    key: '狗頭人打劫',
    group: 2,
    kind: '福禍',
    task: '已定場次清單・破廟／開場、蕭靈犀',
    scoutItem1: SCOUT_ITEM1_NEW,
    out: '劇情/破廟/高難度檢定_狗頭人打劫.md',
    json: 'Json/破廟/開場、蕭靈犀.json',
    overview: '劇情/破廟/01 開場、蕭靈犀.md',
    reads: [GUIDE + ' 第一節（含選項格式）、第五節福禍、第六節、第七之二節、第九節破廟素材盤點、第十一節已定場次清單', '劇情/破廟/01 開場、蕭靈犀.md 打劫那整段（從狗頭人出現到三條路各自收尾）', '劇情/破廟/00 總覽.md 說話者對照與疑點（role105／role107 疑為 role123 誤植）', '劇情/破廟/@設定_破廟.md（若有）與狗頭人相關設定；宗緯家那份總覽稿裡狗頭人契約那段（只讀，確認「另有一次機會」是什麼）', '@角色設定/蕭靈犀.md、@角色設定/赫連娜娜.md（聲口）', '給AI看的指南/武俠文風創作指南.md 第四節旁白卡、你（主角）卡、蕭靈犀卡、娜娜卡'],
    voices: '狗頭人首領 role123（本檔另有 role105、role107 兩處疑為誤植，一併撈）、小弟 role106（覆誦首領語尾；狗頭人是碎句豁免，照牠們既有的腔）；赫連娜娜 MC22（在隊與否掛 IsInTeam("MC22")）；蕭靈犀 MC8；你 MC1；旁白 role2',
    anchors: '#3586 → #3588 小犀「表哥表哥，別愣著啦！他們是想搶我們的錢！…」→ 選單 links [#3587 娜娜「等等！」（Conditions IsInTeam("MC22") == true;）→ #3589 娜娜獻計 → [#3590 經濟 10 契約, #3597 [隱藏選項] 經濟 1 級, #3581 開打]；#3616 [花費500錢]「拿去，然後滾。」→ [#3642, #3643]（→ #3618 小犀「哇啊！那是……！」→ #3619 首領「哈！上道！上道！你，好人！是兄弟！」→ #3620 小弟「好兄弟！讓道！」）；#3581「嘿！要錢沒有，要命，自己來拿！」→ #3640 開打]。開打輸＝#3636 ShowEnding(Ending_1) 遊戲結束。契約那條記 CallingDogBrother（Scout 查它是變數還是道具、在哪一格記、鍋子怎麼給、之後接到哪）。全檔 131 節點已進 Unity。',
    spec: `- 掛點：#3588 的 links 加第四個選項格（不需娜娜在隊）。指引：選單前骰子亮：固定句旁白格插在 #3586 與 #3588 之間（#3586 改接它、它接 #3588），或特效掛 #3588，作者定，稿內註；#3588 不掛表情特效。
- 選項：[em2][威嚇檢定][/em2][em3]禍兮福倚，福兮禍伏[/em3]；Sequence: ShowNoviceTeaching(＿＿);；Description: 選項4。
- 擲骰格：BeginDiceRoll(Manual,IntimidationCheck,18)，四段包裝；Description: 威嚇檢定。
- 主角發言格：把威嚇的話說出口（過不過共用）。
- 過（福）：狗頭人被鎮住，錢一文不少，還把召喚的鍋子（契約）獻出來：拿到的東西與娜娜獻計那條一樣，照抄那條記 CallingDogBrother 與給鍋子的同一套指令（Scout 查）；該線第一格 Sequence 另加 ModifyData(FeatExp,Player,Intimidation,20); → 接回契約線的合流格（Scout 查那條之後接到哪，各版寫明接哪一格）。
- 不過（禍）：三版各提一案。硬限制：不死人、不留殘；不比「開打輸了＝遊戲結束」重；不直接推進戰鬥（不接 #3581／#3640）；代價落在錢、面子、好感、或把契約那條門關掉（宗緯家另有一次機會；門怎麼關要查清變數，作者建的留 ＿＿）；不新建東西；禍之後要接回哪一條既有的路寫明。
- 狗頭人來歷只講既有台詞講過的（此山我開、好兄弟、讓道）；牠們的話照既有碎句腔。娜娜在隊與否兩套都要通：新分支裡娜娜若開口，那格掛 Conditions: IsInTeam("MC22") == true; 並給沒娜娜的路一條等價的格。
- 要不要另加普通威嚇選項（過＝跑掉）作者定，本批不加，稿內記一筆。`,
    update: UPDATE,
    lenses: [
      { tag: '甲', name: '禍落在錢與門', brief: '禍＝五百錢照搶、契約那條門關掉（照第九節盤點的提案）：牠們被吼得更凶，搜走錢，鍋子這輩子別想；查清 CallingDogBrother 與 500 錢那條的指令，禍線用同一套。格數最省。' },
      { tag: '乙', name: '禍落在人與面子', brief: '禍＝代價落在人身上：錢照付或照搶，但重點是旁人怎麼看你（小犀被嚇著、娜娜一句、狗頭人反把你們當肥羊記住），扣好感用既有指令 ModifyData(FavorabilityExp,MC8,-20)；不關契約門也可以，各自寫明。整段要接得上這場戲原本的喜劇腔。' },
      { tag: '丙', name: '另一種演法', brief: '在硬限制內刻意換一種禍：跟甲、乙都不同（例如威嚇太過，狗頭人嚇得砸了東西、跑了，錢沒搶走但契約與鍋子一起沒了；或牠們反而纏上你們）；不死人、不重過遊戲結束、不推進戰鬥、不新建東西。也換一種福的演法（牠們怎麼把鍋子交出來）。' },
    ],
    checks: [
      '分類與走向：福禍。過＝錢一文不少＋得召喚的鍋子（與契約線同一套記法）＋威嚇經驗兩倍→接回契約線合流格；不過＝禍的新分支，不是原本的失敗；至少一邊跟原分支不同',
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
    key: '阿佑',
    group: 2,
    kind: '未卜',
    task: '已定場次清單・破廟／阿傑、阿佑、阿偉、水井（阿佑）',
    scoutItem1: SCOUT_ITEM1_NEW,
    out: '劇情/破廟/高難度檢定_阿佑.md',
    json: 'Json/破廟/阿傑、阿佑、阿偉、水井.json',
    overview: '劇情/破廟/02 阿傑、阿佑、阿偉、水井.md',
    reads: [GUIDE + ' 第一節（含選項格式與收緊後的未卜定義）、第五節未卜、第六節、第七之二節、第九節破廟素材盤點、第十一節已定場次清單', '劇情/破廟/02 阿傑、阿佑、阿偉、水井.md 全檔（§2 的 AjieLiar_1–_4 結構要讀熟）', '劇情/破廟/00 總覽.md 說話者對照與疑點', '劇情/破廟/ 另外三份總覽稿裡可當兌現處的互動點（開場的 [隱藏選項] #3597、黑衣武者 #3389、老和尚墳墓供桌）', '@角色設定/蕭靈犀.md、@角色設定/赫連娜娜.md（聲口）', '給AI看的指南/武俠文風創作指南.md 第四節旁白卡、你（主角）卡'],
    voices: '阿佑 role98（膽怯；既有台詞.py 不認得，用 grep 撈本檔每一句）、阿傑 role99、宗緯 role97、卞喜 role125、廖淳 role127（都用 grep 撈）；赫連娜娜 MC22（在隊與否 Scout 查條件）；蕭靈犀 MC8；你 MC1；旁白 role2',
    anchors: '#3608 → 選單 links [#3597 [口才檢定]「你若真不想幹，不如把實情告訴我，或許還能有生路。」→ #3599 …；#3598 [威嚇檢定]「你以為跟著他就有活路？我看他分明是拿你當替死鬼！」→ #3603 …；其他選項 Scout 列]。名冊：#3256 井（Variable MyTime_Temple < 3 且未持有 Oddlist）→ #3272 拿到名冊 ModifyData(Valuable,Player,Oddlist,1)；#3712「傑大哥，你可識得此物？」掛 IsValuablesObtained Oddlist。詰問：AjieLiar_1–_4 在 #3785／#3794／#3799／#3645 等格記 true，#3757、#3980、#3995、#3996 讀四個全 true。廖淳 #3980 送 WingedBeastHelmet。全檔 405 節點已進 Unity。',
    spec: `- 掛點：#3608 那個選單（口才 14／威嚇 10）加一項。指引：選單前骰子亮：固定句旁白格插在 #3608 與它前一格之間（Scout 查前一格；或特效，作者定，稿內註）；選單前一格不掛表情特效。
- 選項：[em2][〈名〉檢定][/em2][em3]知其一，不知其二[/em3]；同選單已有口才與威嚇，優先洞悉 InsightCheck，或另選（學識、魅力），各版說明；Sequence: ShowNoviceTeaching(＿＿);；Description: 選項N。
- 擲骰格：BeginDiceRoll(Manual,〈ID〉,18)，四段包裝。
- 主角發言格：把問話講完整（過不過共用）。
- 過：阿佑吐出一條額外的情報（兩三格；該線第一格 Script: Variable["＿＿"] = true;、Description: 變數更新；經驗 +10 給對應 ID）→ 接回原線（Scout 查口才 14 成功線接哪裡；各版寫明本選項的過接回哪一格、為什麼）。情報必須是額外的：不是名冊、不是名冊在井裡、不是跳過挖井、不是把後面本來會揭的事提早講、不是趙王洞的事。兌現處在破廟資料夾四份 JSON 的既有互動點，新選項照 [em2][隱藏選項][/em2] 寫、掛 Conditions: Variable["＿＿"] == true;，帶來原本沒有的錢、物、把柄或一條原本沒有的路；兌現處的格子寫進 redeem_md。
- 不過：阿佑一句擋回 → 接回原本口才 14 失敗那條（Scout 查 #3599 之後的失敗格）。
- 不動 AjieLiar_1–_4 的結構與條件；不碰趙王洞（祭壇、白虎）、饕餮、卞喜的祭壇；不從阿佑嘴裡挖趙王洞或卞喜祭壇的事；宗緯家先不動（兌現處不放那裡）。
- 阿佑聲口：膽怯，貼既有句；阿傑此刻在哪、醒著沒 Scout 查清，新格不能吵醒他或改變他的狀態（那是 AjieLiar 的戲）。`,
    update: UPDATE,
    lenses: [
      { tag: '甲', name: '藏寶', brief: '秘密是一樣藏起來的東西：阿佑知道阿傑或卞喜在破廟裡外藏了錢或東西（不是名冊），玩家去既有的互動點（供桌、墳墓、井以外的角落、黑衣武者那一帶，看哪裡有現成的選單）多一個 [隱藏選項] 把它取出來；東西只能是錢或既有道具，數字留 ＿＿。他為什麼知道、為什麼不自己拿，一句話講得通。' },
      { tag: '乙', name: '把柄', brief: '秘密是一個把柄：阿佑說出阿傑或卞喜一件見不得人的事（不是拐賣本身，那是主線會揭的），玩家之後在本檔既有的場（攤牌、卞喜進門、廖淳收場）多一個 [隱藏選項] 拿它來用，帶來原本沒有的好處（額外的錢、物、或一句原本問不到的話）；不動 AjieLiar 結構、不碰祭壇與趙王洞。' },
      { tag: '丙', name: '一條原本沒有的路', brief: '秘密開出一條原本沒有的小路：阿佑知道這座破廟或這一夜的一件事（一個沒人注意的地方、一個人的來歷裡不撞主線的那一段），玩家在破廟資料夾的既有互動點多一個 [隱藏選項]，走進去是一兩格原本沒有的戲，帶一點原本沒有的收穫；不是跳過挖井、不是名冊、不是提早揭主線。' },
    ],
    checks: [
      '分類與走向：未卜。過＝額外的情報，帶來額外的獎勵（沒有這一骰就不存在的錢、物、把柄、或一條原本沒有的路）＋記變數；不是名冊、不是名冊在井裡、不是跳過挖井、不是提早揭主線；不過＝接回原本口才 14 失敗那條、不再骰第二次',
      '引擎寫法：選單加一項、自己的擲骰格四段包裝（Manual,〈ID〉,18；ID 只能是對照表裡的、跟同選單的口才威嚇不同）、隔一格、IsPassDice 掛分支首格；選項格式 [em2][〈名〉檢定][/em2][em3]知其一，不知其二[/em3]，無引號、無分類名；選項格掛 ShowNoviceTeaching(＿＿)；Description 只准詞表；兌現處新選項照 [em2][隱藏選項][/em2]、掛 Conditions: Variable["＿＿"] == true;',
      '兌現處是既有內容：在破廟資料夾四份 JSON 的既有互動點；那一場多的選項或格子寫出來、接回點正確；不新建地點道具 NPC；不放宗緯家',
      '不能碰：AjieLiar_1–_4 的結構與條件不動；趙王洞、白虎、饕餮、卞喜的祭壇不碰；阿傑的狀態（在哪、醒著沒）不被新格改變',
      '連續性：#3608 的每條來路都接得通；過與不過之後接回點對得上（誰在場、名冊在誰手上、時間 MyTime_Temple）；有娜娜／沒娜娜兩套都通；指引在選單前、只寫亮',
      '變數與編號：變數只留 ＿＿、不新建任務、不動 title、不改既有格的字；經驗 +10 給對應 ID',
      '內容三道線與價值觀：禁詞、0.6、饕餮廢案；東漢價值觀，不加道德評語；不編精確數目與小細節',
      '文風規矩 1–6 與聲口：阿佑膽怯、阿傑粗口、卞喜廖淳照既有句；主角；小犀娜娜若開口照卡；台詞可見字數 50 內；em7 每十格至多一個',
    ],
  },
  {
    key: '阿傑',
    group: 2,
    kind: '轉機',
    task: '已定場次清單・破廟／阿傑、阿佑、阿偉、水井（阿傑戰鬥）',
    scoutItem1: SCOUT_ITEM1_NEW,
    out: '劇情/破廟/高難度檢定_阿傑.md',
    json: 'Json/破廟/阿傑、阿佑、阿偉、水井.json',
    overview: '劇情/破廟/02 阿傑、阿佑、阿偉、水井.md',
    reads: [GUIDE + ' 第一節（含選項格式）、第五節轉機、第六節、第七之二節、第九節破廟素材盤點、第十一節已定場次清單', '劇情/破廟/02 阿傑、阿佑、阿偉、水井.md 攤牌到卞喜進門那整段（含兩條進戰鬥的來路）', '劇情/破廟/00 總覽.md 說話者對照', '@角色設定/蕭靈犀.md、@角色設定/赫連娜娜.md（聲口）', '給AI看的指南/文本創作指南.md 0.1（管用但不俠的手；詐敗是高概念點名的）', '給AI看的指南/武俠文風創作指南.md 第四節旁白卡、你（主角）卡'],
    voices: '阿傑 role99（老子、混口飯吃、欺軟怕硬；用 grep 撈本檔每一句）、阿佑 role98；赫連娜娜 MC22（在隊與否 Scout 查）；蕭靈犀 MC8；你 MC1；旁白 role2',
    anchors: '#3825 戰鬥格（Combat 6，阿傑＋阿佑；parent #3821 與 #3928 兩條來路）→ #3977 緩衝 → [#3826 勝首格（IsPassFight()==true）→ #3830 你「如何，服氣了？」→ #3831 阿傑「呸！服？老子服你個鳥！…」→ #3832 …；#3827 敗首格（IsPassFight()==false，Sequence Continue();）→ #3865 ShowEnding(Ending_1) 遊戲結束]。全檔 405 節點已進 Unity。',
    spec: `- 掛點：#3827（原格不動）之後、#3865 之前。#3827 的 links 改指新格：骰子亮的固定句旁白 [panel=6]＊（懷裡的麒麟骰亮了一下。）＊（或特效，作者定，稿內註）→ 選單 [轉機選項, 認輸選項]。打輸時你倒在地上，旁白只寫看得見的。
- 轉機選項：[em2][厚黑檢定][/em2][em3]置之死地，而後生[/em3]（厚黑 RealpolitikCheck，詐敗）；Sequence: ShowNoviceTeaching(＿＿);；Description: 選項1。
- 認輸選項：一句短話 → 主角發言格 → 接 #3865（原樣，遊戲結束；前面可有旁白一格）。
- 擲骰格：BeginDiceRoll(Manual,RealpolitikCheck,20)，四段包裝；單骰。
- 主角發言格：詐敗的那一句（裝死、裝服、裝傷，看得見的動作放旁白）。
- 過：真的翻盤，你放倒他：兩三格（他鬆懈、你反手一下、他倒地；阿佑的反應一格可有可無）→ 該線第一格 Sequence: ModifyData(FeatExp,Player,Realpolitik,10); → 接 #3830「如何，服氣了？」原勝利線；#3830 以後一格不動；卞喜之後的話接著你贏了寫，所以尾巴不能寫成「他以為你完了就走」。
- 不過：接 #3865 原樣（人是被戰鬥打倒的，不是被骰子打倒的）。
- 兩條進戰鬥的來路（#3821、#3928）都要通；娜娜在隊與否兩套都通（她若開口掛 IsInTeam）。
- 阿傑聲口貼既有句；阿佑膽怯；詐敗不需要道德評語，旁人怎麼看才是反應。`,
    update: UPDATE,
    lenses: [
      { tag: '甲', name: '照清單最省', brief: '貼著已定場次清單那一列，格數最少：選單、擲骰、發言、過的翻盤兩格、不過接 #3865。偏離處在 self_check 講明。' },
      { tag: '乙', name: '接戲', brief: '先把總覽稿從攤牌讀到卞喜進門、廖淳收場，再寫出唸起來最順、最像阿傑原本嗓子的版本，翻盤之後 #3830「如何，服氣了？」與 #3831 他的回嘴要接得天衣無縫；格數可以比甲多一兩格。' },
      { tag: '丙', name: '另一種演法', brief: '在規則範圍內刻意換一種詐敗的演法：換你裝的是什麼（死、服、傷、討饒）、換誰先動（阿佑先放鬆、阿傑先俯身）、換一個看得見的物件；仍用厚黑、仍接回 #3830、仍守全部規矩。' },
    ],
    checks: CHECKS_TURN('#3830', '#3865', '詐敗：厚黑，高概念點名的管用手；阿傑吃這一套（欺軟怕硬）'),
  },
]
const UNITS = A.only ? UNITS_ALL.filter(u => A.only.includes(u.key)) : UNITS_ALL
const OUTS = UNITS_ALL.map(u => u.out)

const STYLE_BRIEF = '讀 給AI看的指南/武俠文風創作指南.md 第四節旁白卡與本場角色的聲口卡、7.1a–7.1c、7.3 選項、第八節自檢清單，以及 給AI看的指南/武俠文風審校清單.md。逐句查規矩 1–6：內心話、判語、動作鏈、假精確、翻轉句、否定句收尾、比喻巧句收尾、碎句與句長、旁白「」、破折號、em7、單字名詞、時代錯置、口吻像不像這個角色。把候選照 md 格式寫進 scratchpad 暫存檔，跑 python -X utf8 給AI看的指南/文風節奏檢查.py <暫存檔> 看碎句與超長台詞；台詞對照情境包裡的既有句，不夠就自己跑 既有台詞.py 或 grep。'
const LOGIC_BRIEF = '打開對應 JSON，查掛點與接回點：誰連進來（所有 parent）、連去哪、Conditions、Sequence、Script、Description。沿每一條會播到掛點的路把前後十格讀一遍，確認新格在每條路上都接得通、不跟前後矛盾（誰在場、誰倒著、錢與棋譜在誰手上、張仲景出場過沒有、外貌描寫有沒有丟）。擲骰格四段包裝、隔一格、IsPassDice 掛對格、選項格與發言格的關係、合流點、沒有節點被跳過或重播。兌現處那一場（村長）也要打開 JSON 查新選項掛得上、條件寫對。饕餮廢案清單與硬紅線詞。'
const SPEC_BRIEF = '逐條對照 ' + GUIDE + ' 第一節三類定義、第四節引擎寫法七條、第五節本類細則、第六節規則十三條、第七之二節指引、第十一節本場任務單（含禁忌與不能碰）：分類走向對不對、過不過哪一邊跟原分支不同、獎勵數字、代價指令、變數是否留 ＿＿、有沒有新建東西、有沒有動到不該動的格、指引只寫亮、量級是不是村子的事、秘密是否指向既有內容。'
const REVIEW_LENSES = [
  { key: 'style', name: '文風', brief: STYLE_BRIEF },
  { key: 'logic', name: '連續性', brief: LOGIC_BRIEF },
  { key: 'spec', name: '規格', brief: SPEC_BRIEF },
]
const VERIFY_LENSES = [
  { key: 'style', name: '文風與規格', brief: STYLE_BRIEF + ' 也要對照規格：' + SPEC_BRIEF },
  { key: 'logic', name: '連續性', brief: LOGIC_BRIEF },
]

const INSERT = {
  type: 'object',
  properties: {
    after_entry: { type: 'string', description: '插在哪一格之後或哪一格的 links 加，如 #2035；沒有就空字串' },
    before_entry: { type: 'string', description: '接回哪一格，如 #2047；沒有就空字串' },
    what: { type: 'string', description: '這一段在做什麼、幾格' },
  },
  required: ['after_entry', 'before_entry', 'what'],
}
const DRAFT_SCHEMA = {
  type: 'object',
  properties: {
    scene_md: { type: 'string', description: '整節創作稿（md）：節首列掛點、接回點、檢定與 FeatID、難度（暫 18）、獎勵、狀態寫法（變數留 ＿＿）、指引怎麼放；然後是戲，每格帶 actorID／Sequence／Conditions／Script／Description' },
    redeem_md: { type: 'string', description: '兌現處那一場要加的格子（村長用；碰瓷填空字串）：哪份 JSON、插在哪、新選項與後續格子、Conditions' },
    secret: { type: 'string', description: '一句話：他藏的是什麼、為什麼藏、玩家拿到後去哪兌現（村長用；碰瓷填空字串）' },
    check_id: { type: 'string', description: '檢定名與 FeatID，如「威嚇 IntimidationCheck」' },
    inserts: { type: 'array', items: INSERT },
    reads: { type: 'array', items: { type: 'string' }, description: '用到的 Conditions，逐行' },
    writes: { type: 'array', items: { type: 'string' }, description: '用到的 Script／ModifyData／Sequence 指令，逐行' },
    approach: { type: 'string' },
    self_check: { type: 'string' },
  },
  required: ['scene_md', 'redeem_md', 'secret', 'check_id', 'inserts', 'reads', 'writes', 'approach', 'self_check'],
}
const REVIEW_SCHEMA = {
  type: 'object',
  properties: {
    candidates: { type: 'array', items: { type: 'object', properties: {
      label: { type: 'string' },
      checks: { type: 'array', items: { type: 'object', properties: {
        check: { type: 'string' },
        verdict: { type: 'string', enum: ['pass', 'reject'] },
        reason: { type: 'string' },
      }, required: ['check', 'verdict', 'reason'] } },
      overall_rank: { type: 'integer' },
    }, required: ['label', 'checks', 'overall_rank'] } },
    grafts: { type: 'string' },
    notes: { type: 'string' },
  },
  required: ['candidates', 'grafts', 'notes'],
}
const VERSION = {
  type: 'object',
  properties: {
    label: { type: 'string', description: '甲／乙／丙' },
    angle: { type: 'string', description: '一句取向' },
    secret: { type: 'string' },
    check_id: { type: 'string' },
    scene_md: { type: 'string' },
    redeem_md: { type: 'string' },
    inserts: { type: 'array', items: INSERT },
    reads: { type: 'array', items: { type: 'string' } },
    writes: { type: 'array', items: { type: 'string' } },
    source: { type: 'string', description: '原稿／嫁接／重寫' },
    changed_from_draft: { type: 'boolean' },
  },
  required: ['label', 'angle', 'secret', 'check_id', 'scene_md', 'redeem_md', 'inserts', 'reads', 'writes', 'source', 'changed_from_draft'],
}
const SYNTH_SCHEMA = {
  type: 'object',
  properties: {
    versions: { type: 'array', items: VERSION, description: '三版都要在，順序甲乙丙' },
    recommended: { type: 'object', properties: {
      label: { type: 'string' }, reason: { type: 'string' },
    }, required: ['label', 'reason'] },
    unresolved: { type: 'array', items: { type: 'object', properties: {
      issue: { type: 'string' },
    }, required: ['issue'] } },
    summary: { type: 'string' },
  },
  required: ['versions', 'recommended', 'unresolved', 'summary'],
}
const VERIFY_SCHEMA = {
  type: 'object',
  properties: {
    items: { type: 'array', items: { type: 'object', properties: {
      version: { type: 'string', description: '甲／乙／丙' },
      check: { type: 'string' },
      verdict: { type: 'string', enum: ['pass', 'reject'] },
      reason: { type: 'string' },
    }, required: ['version', 'check', 'verdict', 'reason'] } },
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
  return `場：${u.key}（${u.kind}，任務單 ${u.task}）
JSON：${u.json}（已進 Unity，新節點續號、不動 title）
總覽稿（回讀稿，只讀不改）：${u.overview}
錨點：${u.anchors}
必讀：${u.reads.join('；')}
聲口：${u.voices}
任務單摘要：
${u.spec}`
}

function upd(u) {
  return u.update ? '\n\n' + u.update : ''
}

function lensList(u) {
  return u.lenses.map(l => `${l.tag}＝${l.name}`).join('、')
}

function scoutPrompt(u) {
  const item1 = u.scoutItem1 || `1. 任務單原文：從 ${GUIDE} 把第十一節「執筆 agent 動筆前必讀」與 ${u.task} 那張表逐字抄出；再抄第五節本類（${u.kind}）那一小節、第六節規則十三條、第七之二節「第一次」與「往後每一次」兩段。`
  return `${COMMON}

你是本場的「情境整理」，只讀不改檔。
${unitHead(u)}

請產出一份給起草者與審稿者共用的情境包（markdown，純事實，不提改法），內容：
${item1}
2. 現行拍子：回讀稿裡從掛點前十格到接回點後十格的每一格（說話者、entryID、[panel=N]、全文，以及底下的 Sequence／Script／Conditions／註記／分流各行），逐字。碰瓷要從 #2026 抄到 #2050 整場；村長要抄 #28 起到談價選單四條線各自的結尾。
3. JSON 事實：掛點與接回點在 JSON 裡的 actorID、text、Conditions、Sequence、Script、Description、links；所有 links 指向它們的 parent 格。既有擲骰流那幾格（選項格、擲骰格四段包裝原文、發言格、成敗首格）逐字抄，起草者要照著寫。碰瓷另抄 #2033 Sequence 裡 Coin 的數字。
4. 每一條會播到掛點的路：沿 JSON 往前讀，遇到分流就分路列，註明條件（村長：MyTime、ChessGame、C0M1 第 2 項各是哪幾格）。
5. 指引的既有句：逐字抄 Json/小溪村後山/赫連娜娜、張寧.json #784、#785 與 Json/主線事件/180年/2月.json #4054 的全文；再抄 Json/小溪村/主線起始.json #75／#76 的 Sequence（ShowNoviceTeaching 的掛法）。
6. 聲口：本場每個會開口的角色，各挑十到十五句最能代表口吻的原句抄上（附出處）。既有台詞.py 不認得的 ID 用 grep -n '"actorID": "<ID>"' -A2 <JSON> 撈；蛋頭與村長把本檔的每一句都抄。張仲景要分清 role42（小溪村）、role113、MC13 三個 ID 各在哪些檔說了什麼。
7. 設定：劇情/小溪村/@設定_小溪村.md 裡本場角色與地點的段落逐字抄；@角色設定/蕭靈犀.md 聲口段；碰瓷另抄 給AI看的指南/文本創作指南.md 0.2.3 全節與 0.6 揭露節奏裡序章那幾條。
8. 兌現處（村長才做）：任務單列的五處各打開 JSON 與總覽稿，抄出可掛新選項的那個選單格（entryID、text、links、Conditions）與前後三格，以及那一場已經揭露了什麼（謎底是什麼、攔路匪怎麼放行、鐵木在哪、釣點怎麼算、廢屋能挖什麼）。哪份 JSON 在哪份總覽稿查 劇情/索引.md。
9. 其他起草者一定要知道的事實（某格掛著任務、好感、音樂、立繪切換；選單前一格有沒有表情特效；哪些 Description 已在用；檔末疑點表提過的相關格）。只寫事實，不下改稿建議。${u.scoutItem1 ? `
以上第 2、6、7、8 項裡點名小溪村、碰瓷、村長的字樣，換成本場對應的東西：第 2 項抄本場從掛點前十格到每個接回點後十格（轉機要連勝利線與失敗線都抄到底）；第 6 項本場每個會開口的角色每一句都撈；第 7 項抄本箱庭的 @設定 檔與 00 總覽說話者對照、疑點；第 8 項未卜才做，兌現處候選是本箱庭資料夾裡每一個有選單的既有互動點（列出 entryID、text、links、Conditions，以及既有 [隱藏選項] 的寫法）；轉機另抄勝利線從接回點到收尾的每一格（含變數、獎勵），與另外兩條來路。有娜娜／沒娜娜（IsInTeam("MC22")）的分流全部列出。` : ''}`
}

function draftPrompt(u, packet, lens) {
  return `${COMMON}

你是起草者（${lens.tag}｜${lens.name}）。你的取向：${lens.brief}
${unitHead(u)}${upd(u)}

動筆前：依 CLAUDE.md 讀三份指南（至少：給AI看的指南/文本創作指南.md 第零層 0.2.3 與 2.1a；給AI看的指南/世界觀.md 第八節；給AI看的指南/武俠文風創作指南.md 第四節旁白卡與本場角色聲口卡、7.1a–7.1c、7.3、第八節自檢清單）；再讀 ${GUIDE} 第一、四、五、六、七、七之二、十一節。先看情境包裡的既有台詞，不夠就自己跑既有台詞.py 或 grep。有疑問回原檔、原 JSON 查，不要只信情境包。不要改任何檔案，只交提案。

情境包：
<<<
${packet}
>>>

交件要求：
- scene_md：一整節創作稿。節首先列：掛點（哪一格的 links 加選項）、接回點、檢定名與 FeatID、難度（暫 18，作者填）、獎勵指令、狀態寫法（變數留 ＿＿，逐行）、指引怎麼放。然後是戲：選項格 → （碰瓷：骰子亮旁白、主角一句、小犀一句）→ 擲骰格（四段包裝逐字寫出）→ 主角發言格 → ▶ 過（Conditions: IsPassDice() == true;）… → 接 #N ／ ▶ 不過（Conditions: IsPassDice() == false;）… → 接 #N。每格底下 actorID、Sequence（含立繪 SetPortrait 與表情）、Conditions、Script、Description 有才寫。新格不編號。
- redeem_md：村長才寫。兌現處那一場：哪份 JSON、插在哪一格的 links、新選項格與其後一兩格、Conditions: Variable["＿＿"] == true;、接回哪一格。碰瓷填空字串。
- secret：村長才寫。一句話：他藏的是什麼、為什麼藏、玩家拿到後去哪兌現。碰瓷填空字串。
- check_id：檢定名與 FeatID。
- inserts：每一處插入或接回一筆。
- reads／writes：用到的 Conditions 與 Script／ModifyData／ShowNoviceTeaching 逐行列出，一行不多。
- approach：一句話講你這版的取向。
- self_check：逐條對照本場八項檢查（${u.checks.join('／')}）與文風規矩 1–6 的自檢結果，以及每條來路讀起來是否通順；把 scene_md（與 redeem_md）寫進 scratchpad 暫存檔跑過 python -X utf8 給AI看的指南/文風節奏檢查.py，把結果寫在這裡。${u.update ? `
- 上面「村長才寫」「碰瓷」的字樣照本場對應：未卜的場（村長、阿佑）要寫 redeem_md 與 secret；福禍、轉機的場填空字串。轉機的場：選單在敗首格之後，含轉機選項與認輸選項；難度暫 20。` : ''}`
}

function reviewPrompt(u, packet, drafts, lens) {
  return `${COMMON}

你是審稿者（${lens.name}）。你的關注面：${lens.brief}
${unitHead(u)}${upd(u)}

情境包：
<<<
${packet}
>>>

三位起草者的候選（${lensList(u)}）：
<<<
${JSON.stringify(drafts, null, 1)}
>>>

請回原檔、原 JSON 查證，不要只信情境包或起草者的說法。對每位候選，照這八項各給 verdict：${u.checks.join('／')}。只要有一個具體毛病就駁回那一項，理由要指出是哪一格哪一句哪幾個字、違反哪條規矩或跟哪一格矛盾；拿不準時偏向駁回，並寫明疑慮。overall_rank 1 最好。grafts：如果某版的某句該換成另一版的、某版的接法該借給另一版，具體寫到句子；三版是給作者挑的，不要建議把三版併成一版。notes：其他定稿人該知道的事。不要改任何檔案。`
}

function synthPrompt(u, packet, drafts, reviews, prior) {
  const priorBlock = prior ? `
上一輪定稿被複核駁回，這次要修：
上一輪三版：
<<<
${JSON.stringify(prior.versions, null, 1)}
>>>
駁回意見（哪一版、哪一項、為什麼）：
<<<
${JSON.stringify(prior.rejects, null, 1)}
>>>
只修被駁回的那幾版、那幾處；其餘沿用上一輪，除非修改牽動它們。修過的版 changed_from_draft 填 true、source 填「重寫」或「嫁接」。` : ''
  return `${COMMON}

你是本場的定稿人。三版都要留下來給作者挑，你的工作是把每一版修到能交，並標一版建議。
${unitHead(u)}${upd(u)}

情境包：
<<<
${packet}
>>>

起草候選（${lensList(u)}）：
<<<
${JSON.stringify(drafts, null, 1)}
>>>

審稿意見（文風／連續性／規格）：
<<<
${JSON.stringify(reviews, null, 1)}
>>>
${priorBlock}

做法：
1. 每一版逐條看三位審稿者駁回的項，照理由修；審稿者建議的嫁接若合理就接上。修完自己回原檔、原 JSON 把每條來路核一次。三版仍要是三個真的不一樣的選擇（碰瓷：演法不同；村長：秘密與兌現處不同），不要把它們修成同一版。
2. 某一版被兩位以上審稿者在同一項駁回、而且那一項是分類走向、引擎寫法、紅線或不能碰的清單，就依駁回理由重寫那一版的那一段，source 填「重寫」。
3. recommended：從三版挑一版建議作者用，理由一句（通過項最多、接戲最順、最合任務單）。
4. unresolved：需要作者拍板、AI 不該自己決定的（難度、教學 ID、變數名、指引用特效或旁白、村長掛點、檢定用哪個、棋譜與錢怎麼算、任何你新發現的），列出來；每一版仍要給出你建議的寫法。
5. summary：三五句白話，講三版各修了什麼、駁回了什麼、為什麼建議那一版。
不要改任何檔案。`
}

function verifyPrompt(u, packet, final, lens) {
  return `${COMMON}

你是懷疑者（${lens.name}），任務是想辦法駁倒這三版定稿。關注面：${lens.brief}
${unitHead(u)}${upd(u)}

情境包：
<<<
${packet}
>>>

三版定稿：
<<<
${JSON.stringify(final.versions, null, 1)}
>>>
建議版：${final.recommended.label}（${final.recommended.reason}）

對每一版、照這八項各給 verdict（items 裡每筆帶 version）：${u.checks.join('／')}。回原檔、原 JSON 查證。只駁真的毛病：違反規矩或任務單、接不上某條路、跟前後格矛盾、擲骰格寫錯、獎勵或代價指令不對、新建了東西或自取了名字、秘密指向不存在的東西、換個樣子又犯同類病。不駁純個人口味；拿不準的寫進 reason 但給 pass。不要改任何檔案。`
}

const APPLY_UPDATE = `${UPDATE}

【Apply 階段特別規則】定稿裡若還有舊格式的選項格（[em2][〈名〉檢定・福禍／未卜／轉機][/em2]「…」），一律改成新格式：拿掉「・分類名」、拿掉引號裡那句，題語照類別掛在 [em3] 裡；引號裡那句本來就該在擲骰之後的主角發言格講，若發言格已經有等價的話就不動發言格，若發言格的話跟選項那句差太多、少了選項那句才有的內容，把選項那句併進發言格（發言格仍是一句完整的話、可見字數 50 內）。改了要在檔頭「待作者定」記一筆「選項格式已照 2026-09-26 規則改；原選項句：…」，每版一筆。其餘定稿的字一個不改。`

function applyPrompt(u, final, reviewBrief, verifyHistory) {
  return `${COMMON}

${APPLY_UPDATE}

你是提案檔 ${u.out} 的編輯。下面是這一場的三版定稿（每版經過三名起草、三名審稿、兩名複核），把它們寫成提案檔。
${unitHead(u)}

三版定稿：
<<<
${JSON.stringify(final, null, 1)}
>>>

審稿票數：
<<<
${JSON.stringify(reviewBrief, null, 1)}
>>>

複核紀錄：
<<<
${JSON.stringify(verifyHistory, null, 1)}
>>>

做法：
1. 新建 ${u.out}（若已存在，它是本流程的舊產物，整檔覆寫；資料夾不存在就建）。檔頭：
   第一行標題「# ${u.key}　高難度檢定提案（${u.kind}）」；
   引用區塊第一句「**創作稿／提案，尚未進 JSON、未進 Unity。** 📝 ${DATE} 三版待作者挑一版；規矩見 ${GUIDE} 第一、四、五、六、七之二節與第十一節已定場次清單，本檔只放戲。」；
   再一句寫掛點與接回（用既有 entryID）、「新格不編號，作者續號；已進 Unity 的節點不動 title」；
   再一句「**建議版：**」＋ recommended 的 label 與理由；
   再一句「**待作者填：**」列 難度（暫 18 或 20）、教學 ID、變數名、指引用特效或固定旁白、檢定用哪個等。
2. 三版各一節「## 版一（甲｜取向）」「## 版二（乙｜取向）」「## 版三（丙｜取向）」。節首列：一句取向；secret（未卜的場）；檢定與 FeatID；掛點與接回；狀態寫法（reads／writes 逐行）；source。然後「### 戲」放 scene_md 原樣；未卜的場另有「### 兌現處」放 redeem_md 原樣。除了 Apply 階段特別規則允許的選項格式修正，定稿的字一個不改；你只加結構。
3. 「## 待作者定」：unresolved 逐條，前面加 ⚠。「## 審稿與複核摘要」：每版審稿幾過幾駁、駁了哪幾項、複核幾輪、最後還剩什麼。
4. 跑 python -X utf8 給AI看的指南/文風節奏檢查.py "${u.out}"，被報的句子照規矩改到不報（改了要在回報裡列出原句與新句），或說明為何留。
5. 跑 git status，確認本流程只動了這些提案檔：${OUTS.join('、')}（其他場的編輯可能同時在寫別的檔，那不是你的）。不動 Json/、不動回讀稿、不動 ${GUIDE}、不動其他檔。
回報：寫進了哪幾節、每版幾格；選項格式有沒有改、改了什麼；節奏檢查結果與改動；任何沒照定稿做的地方與原因。`
}

function auditPrompt(u, final, applyReport, round) {
  return `${COMMON}

${APPLY_UPDATE}

你是 ${u.out} 的稽核（第 ${round} 輪），只讀不改檔。編輯已照定稿寫進提案檔。
${unitHead(u)}

三版定稿：
<<<
${JSON.stringify(final, null, 1)}
>>>

編輯回報：
<<<
${applyReport}
>>>

查：
1. git status：改動只在這些提案檔：${OUTS.join('、')}；沒有動到 Json/、回讀稿、${GUIDE}、其他檔。
2. ${u.out}：三版的 scene_md（與 redeem_md）是否一字不差寫進去（Apply 階段特別規則允許的選項格式修正、與編輯因節奏檢查改的句子除外，那些要在回報裡列出）；選項格是不是新格式（檢定標籤＋[em3]題語，無引號、無分類名，題語一字不差）；檔頭、節首（取向、secret、檢定、掛點接回、狀態寫法）、建議版、待作者定、審稿與複核摘要齊不齊；新格有沒有被誤編號；有沒有自取了變數名、教學 ID。
3. 把每一版沿每條來路從掛點前十格讀到接回點後十格，確認接得通、沒有新矛盾、沒有描述通病、擲骰格四段包裝寫對、IsPassDice 掛對格、獎勵與代價指令對。未卜的場另查兌現處那一場掛得上、拿到的是額外的東西；轉機的場另查接回勝利線的格與之後一格沒被動。
4. 跑 python -X utf8 給AI看的指南/文風節奏檢查.py "${u.out}"，不得有未說明的報告。
ok：沒有問題時 true。issues：每個問題一筆（id 填版本名或「格式」、problem、fix：具體改法）。summary：兩三句。`
}

function fixPrompt(u, final, audit) {
  return `${COMMON}

${APPLY_UPDATE}

你是 ${u.out} 的修正編輯。稽核找到下列問題，逐條照 fix 修（若你查證後認為 fix 本身錯了，照規矩修對並說明）。其他字不動，不動 Json/、不動其他檔。

稽核問題：
<<<
${JSON.stringify(audit.issues, null, 1)}
>>>

三版定稿（對照用）：
<<<
${JSON.stringify(final, null, 1)}
>>>

修完跑 python -X utf8 給AI看的指南/文風節奏檢查.py "${u.out}" 與 git status。回報每條怎麼修的。`
}

async function runUnit(u) {
  // args.finals[key] = {final, reviewBrief, history}：這一場已在別的 run 定稿過，直接從 Apply 開始（用來把舊 run 的碰瓷收尾）。
  if (A.finals && A.finals[u.key]) return await applyOnly(u, A.finals[u.key])
  const packet = await agent(scoutPrompt(u), { label: `scout:${u.key}`, phase: 'Scout' })
  if (!packet) return { unit: u.key, error: 'scout failed' }
  const drafts = (await parallel(u.lenses.map(l => () =>
    agent(draftPrompt(u, packet, l), { label: `draft-${l.tag}:${u.key}`, phase: 'Draft', schema: DRAFT_SCHEMA })
      .then(r => r ? { label: l.tag, lens: l.name, ...r } : null)))).filter(Boolean)
  if (!drafts.length) return { unit: u.key, error: 'all drafts failed' }
  log(`${u.key}：起草 ${drafts.length} 版完成，送審`)
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
      final.unresolved = [...(final.unresolved || []), ...rejects.map(r => ({ issue: `複核三輪仍駁回（版${r.version}／${r.lens}／${r.check}）：${r.reason}` }))]
      break
    }
    log(`${u.key}：複核第 ${round + 1} 輪駁回 ${rejects.length} 項（${[...new Set(rejects.map(r => '版' + r.version))].join('、')}），退回重寫`)
    const revised = await agent(synthPrompt(u, packet, drafts, reviews, { versions: final.versions, rejects }), { label: `resynth-r${round + 1}:${u.key}`, phase: 'Synthesize', schema: SYNTH_SCHEMA })
    if (revised) final = revised
  }
  const reviewBrief = reviews.map(r => ({
    lens: r.lens,
    tally: (r.candidates || []).map(c => `${c.label}:${(c.checks || []).filter(i => i.verdict === 'pass').length}過/${(c.checks || []).filter(i => i.verdict === 'reject').length}駁`).join(' '),
  }))
  log(`${u.key}：三版定稿完成（建議 ${final.recommended && final.recommended.label}；待作者定 ${(final.unresolved || []).length} 件），寫提案檔`)
  return await finishUnit(u, final, reviewBrief, history)
}

// 舊 run 已定稿的場：定稿放在檔案裡（腳本讀不到檔，交給編輯與稽核自己 Read），只跑 Apply／Audit。
async function applyOnly(u, f) {
  const final = f.final || { 注意: `三版定稿不在本提示裡：先用 Read 讀 ${f.file}，取「${u.key}」底下的 final（含 versions 三版、recommended、unresolved），reviewBrief 與 history（複核紀錄）也在同一個檔裡；下面的審稿票數與複核紀錄若是空的，一樣以檔案為準。` }
  log(`${u.key}：沿用既有定稿（${f.file || '隨 args 傳入'}），直接寫提案檔`)
  return await finishUnit(u, final, f.reviewBrief || [], f.history || [])
}

async function finishUnit(u, final, reviewBrief, history) {
  const applyReport = await agent(applyPrompt(u, final, reviewBrief, history), { label: `apply:${u.key}`, phase: 'Apply' })
  let audit = await agent(auditPrompt(u, final, applyReport || '（編輯沒有回報）', 1), { label: `audit-1:${u.key}`, phase: 'Audit', schema: AUDIT_SCHEMA })
  let fixReport = null, audit2 = null
  if (audit && !audit.ok && audit.issues && audit.issues.length) {
    log(`${u.key}：稽核找到 ${audit.issues.length} 個問題，送修`)
    fixReport = await agent(fixPrompt(u, final, audit), { label: `fix:${u.key}`, phase: 'Audit' })
    audit2 = await agent(auditPrompt(u, final, (applyReport || '') + '\n\n修正回報：\n' + (fixReport || ''), 2), { label: `audit-2:${u.key}`, phase: 'Audit', schema: AUDIT_SCHEMA })
  }
  return {
    unit: u.key, out: u.out,
    recommended: final.recommended, unresolved: final.unresolved,
    versions: (final.versions || []).map(v => ({ label: v.label, angle: v.angle, secret: v.secret, check_id: v.check_id, source: v.source })),
    reviewBrief, verifyHistory: history,
    applyReport, audit, fixReport, audit2,
  }
}

// 分兩組跑：第一組小溪村三場（碰瓷多半吃快取），第二組破廟三場；一組跑完再開下一組，撞到用量上限時 resume 就從斷點續。
const results = []
for (const g of [1, 2]) {
  const units = UNITS.filter(u => u.group === g)
  if (!units.length) continue
  log(`第 ${g} 組開跑：${units.map(u => u.key).join('、')}`)
  results.push(...(await parallel(units.map(u => () => runUnit(u)))).filter(Boolean))
}
return { date: DATE, units: results }
