export const meta = {
  name: 'butterfly-tanshihuai-box-v3',
  description: '鮮卑王帳第三版（作者 2026-09-29 重做主帳、作亂三點、黑狼兩級價）：一份箱庭情境包、一個單位三起草三審修三邏輯審一終審，箱庭寫法十一個入口、只有主角一人、對話置頂',
  phases: [
    { title: 'Scout', detail: '一名：箱庭情境包寫成檔案（第三版施工圖、第一版定稿原文、範本、聲口、指南摘錄、常犯十條）' },
    { title: 'Draft', detail: '三名起草，各寫一版十一個入口進檔案（1、3、4、5、6 照定稿原字抄）' },
    { title: 'Revise', detail: '每版一名審修：逐項查、能修就修、旁白逐格表' },
    { title: 'Logic', detail: '每版一名邏輯審：誰知道什麼、先後因果、狀態與分支、點換順序也通' },
    { title: 'Final', detail: '一名終審：再挑錯、標建議版、寫提案檔（對話置頂）、跑檢查腳本' },
  ],
}

const A = Object.assign({ date: '＿＿＿＿-＿＿-＿＿', have: {}, bf: 'C:/Users/user/AppData/Local/Temp/claude/d--QilinStory/1ddf8b7f-8270-48d3-b27d-a5e5e30f3f7a/scratchpad/bf3' }, args || {})
const DATE = A.date
const MODEL = A.model || 'opus'
const BF = A.bf
const SPEC = '劇情/雲中/@設定_雲中.md'
const DUNGEON = '劇情/鮮卑王帳/@設定_鮮卑王帳.md'
const BASE = '劇情/鮮卑王帳/鮮卑王帳.md'
const PREV = '劇情/181年事件/02月(支)老兵的委託.md'
const RULES = '劇情/蝴蝶效應_素材與設計.md'
const BOX = '鮮卑王帳v3'
const OUT = '劇情/檀石槐線_06王帳第二版.md'
const PACKET = `${BF}/${BOX}/packet.md`
const draftPath = tag => `${BF}/06王帳第二版/draft-${tag}.md`
const revisedPath = tag => `${BF}/06王帳第二版/revised-${tag}.md`

const COMMON = `你在做《異麒麟》蝴蝶效應第三案「檀石槐線」的箱庭「鮮卑王帳」**第二次提案**（作者 2026-09-29 看過第一版定稿後重做主帳與作亂：單挑不能喊一喊他就出來）。規格：${DUNGEON}〈箱庭寫法（第三版）〉是本單位的骨架（整條流程、十一個入口表、殺了他收尾、收尾包、狀態表），另有〈誰在〉〈紅線〉〈未定〉；${SPEC} §四-1 第 18–36 條是作者裁示原文；第一版定稿 ${BASE}（1 坡上開場、3 望營地、4 回去的路、5 哨騎、6 進營開場這五個入口**照原字抄**，不重寫）；前一場 ${PREV} 第一節（玩家進箱庭前看過什麼）；${RULES} 第一節規矩。本提示只摘要。
- 這條線是什麼：武道大會奪冠的玩家，181/2 被城門口的老兵託付替兒子報仇；追查出動手的是鮮卑西部一部、檀石槐五月會巡到那一部；老兵等不及自己北上死在半路，你埋了他、認下這件事，在塞外等到五月他來。箱庭＝那座營：坡上黑狼王的獵隊盯著同一個營；營地邊有哨騎；營裡路上的小兵是場景敵人（Unity 的，沒有 ID，稿裡不寫）；三個作亂點（放馬、放火、下毒）是場景物件自帶背景檢定（騎術 12、謀略 14、巧手 ＿＿），成功才跳對話，所以這三個入口只寫成功之後；主帳・檀石槐照施工圖分三條（沒亂＝Combat 101；亂了＝兩波小兵＋口才激將→過 Combat 100／不過 Combat 101；下毒成功＝直接 Combat 100）；100、101 打贏都算你殺了他，同一場接著演黑狼衝進營、你上坡、黑狼王數雙倍的錢、回英豪府；只作亂沒殺人的上坡再點黑狼拿作亂價、看他的人衝下坡、回府；不去＝坡口回去或主帳前轉身。檀石槐正當盛年、沒病、不邪；鮮卑是尋常外邦人，全線人打人。
- **箱庭寫法：** 一份 JSON、十一個互不相連的入口，每個入口是場景裡一個互動點——走進某區強制觸發一次，或點擊某人某物、可重複點（第二次起播短句）。玩家自己走、自己選先點哪個，所以每個入口都要能獨立成立、順序不定；入口格不掛 Conditions、不寫 title，Description 寫「入口：〈點名〉；條件作者設」（作者准的例外）；要分流的在入口格下一格用 Conditions 分。
- **只有主角一個人**：沒有任何同伴的台詞、立繪、在隊條件；旁白不提同伴。黑狼王、檀石槐、哨騎是線裡的人物。
- 引擎硬紅線：不新建變數、不新建任務、不自取名字（任務號、entry 以外的號、地圖點、哨騎與兩波小兵的戰鬥 ID、巧手難度、口才難度、兩級錢數、檀石槐與哨騎的 actorID 一律留 ＿＿）；Combat 100（單挑）、Combat 101（他帶小兵）是作者給的，不留白；SetFlag／GetFlag 禁用；只讀既有的 IsHidden4、本任務 entry 5（營亂）；新格不編號、不寫 title；Description 只寫 劇情/轉成json指南.md §1 詞表標籤（入口格那一句例外）；四軸照施工圖第三節寫（數值標 ⏳）。
- 人：沒有一個人替主角下結論——黑狼王不評論、旁白不評論任何一條路；「最好」是玩家的最好，不是俠的最好。
- 內容三道線：世界觀第八節禁詞（五胡亂華、司馬、篡魏、三國歸晉、輪迴、重來、前世）；角色口中不出「凶戾」「人祭」；檀石槐可以不開口，若開口只有幾個字或經通譯，不發明鮮卑語詞；不寫他的內心、來歷、對漢人的看法；不寫戰況數字、不寫朝廷；不去那兩條不提他死；黑狼衝進營只寫看得見的，不寫戰果。
- 共同事實（不得另定）：老兵沒有名字、兒子 180 冬死、他自己北上死在半路（箱庭不再提）；檀石槐的名字玩家已聽過；黑狼王 MC11 親領、玩家第一次見他（不分認識不認識）、開價兩級；營亂 entry 5 由放馬、放火、下毒三點寫；殺了他 entry 2；只作亂拿錢 entry 4；每條收尾＝四段轉場只淡黑（不開英豪府背景）＋黑幕裡 ModifyData(GameDate,181,6,Early); MapLock(＿＿, lock); LoadLevel(Command_HallOfHeroes); 尾格照規矩；不寫 GameDate 以外的日期。
- 稿的寫法（創作稿）：說話者行 **旁白:**／**你:**／**〈角色〉:**（主角一律「你」），旁白 [panel=6]＊（…）＊，台詞「…」；每格底下 - actorID: / - Sequence: / - Conditions: / - Script: / - Description: 有才寫，各一行；新格用【A】【B】…標，不編號；每個入口自成一節；選單照 劇情/轉成json指南.md §4.2；擲骰四段、戰鬥四件套、轉場、尾格照固定寫法（情境包有抄）；沒有立繪的角色不寫 SetPortrait。不動 Json/、不動 Unity、不動 ${BASE}、不動設定檔。
- 文風規矩（違反即退）：先讀情境包最前面的〈常犯十條〉錯例對改例。1. 旁白看得見你做什麼、看不見你想什麼：不寫內心話、不替玩家下感受或結論、不替角色斷定心裡怎樣（「倒像」「像是」可以）。2. 寫結果和狀態，不寫過程；一格裡同一個人的動作最多兩拍；不編精確數目、距離和純造景小細節。3. 作者退過的句型不得再犯：「不是 X，是 Y」翻轉句；否定句收尾造氣氛；「像……」比喻巧句收尾；收尾加新判語；旁白先把下一格台詞要講的事講掉；選項已經講過的事旁白再講一遍；同一件事隔幾格又講一遍。4. 句子寫完整，不斷碎句：旁白一格兩三句、每句十九到二十五字、不留五字以下的句子；角色台詞一句十五字上下，照那個角色既有的口吻。5. 旁白裡不寫「」引號；**全篇不用破折號「——」，台詞也不用**（打斷用「……」）。[em7] 每十格至多一個、同一人不連掛、[/em7] 後必接標點。6. 玩家看得到的字不自創單字名詞；東漢稱謂與用詞。
- **檔案體例（作者 09-28 裁示）：對話文字置頂、給 AI 看的放後面。** 提案檔＝三版的純對話在前，三版的逐格稿、待作者定、審修紀錄在後。
- 省回合：情境包已收好施工圖原文、第一版定稿原文、範本格、聲口、指南摘錄，先讀它；只在拿不準時回原檔查那一段。日期一律寫 ${DATE}。給作者看的話用白話短句。`

const LENSES = [
  { tag: '甲', name: '照施工圖最少', brief: '每個點只做施工圖點名的事，格數最少；旁白不造景、不加物件；第一版沒改的五個入口一字照抄。偏離施工圖處在自檢講明。' },
  { tag: '乙', name: '接戲', brief: '先把情境包裡黑狼王的既有句、第一版定稿五個不動入口的嗓子讀順，再寫出唸起來最順、最像同一座營的版本；主帳三條與殺了他收尾可以比甲多一兩格，但一定要守施工圖與共同事實。' },
  { tag: '丙', name: '另一種演法', brief: '在施工圖範圍內刻意換一種演法：換誰先開口、換一個看得見的動作或物件、換兩波小兵與激將之間的拍子、換黑狼衝進營那一格怎麼拍；仍守全部規矩。若另一種演法明顯更差，照樣給出最好的不同版本並在自檢說明。' },
]

const UNIT = {
  key: '06王帳第二版', box: BOX, out: OUT,
  json: 'Json/大地圖/鮮卑王帳.json（第一版 72 格作廢，定稿後整檔重出、從 1 連號；十一個入口格都不掛條件、不寫 title）',
  overview: `${DUNGEON} 全檔（〈箱庭寫法（第三版）〉是骨架）；${BASE}（第一版定稿：1、3、4、5、6 照抄，其餘只當素材）；${SPEC} §四-1 第 33–36 條；${PREV} 第一節`,
  anchors: `十一個入口（照 ${DUNGEON}〈箱庭寫法（第三版）〉第二節那張表，逐點）：
1 坡上開場（強制一次）：照第一版定稿原字。
2a 黑狼的營火・第一次點：自報「朔方黑狼」→ 他盯著這座營、人摸不進去 → 兩級開價一句收（亂＝出錢、腦袋＝雙倍）。不逼不勸、不問你為什麼來。無條件、無選單。
2b 黑狼的營火・再點：短句一格 → 分兩條：營亂（CurrentQuestEntryState("＿＿", 5) == "success";）→ 選單「亂已經起了，錢先給我」／「先擱著，我再下去」；付錢那格 ModifyData(Coin,Player,＿＿); SetQuestEntryState("＿＿", 4, "success"); SetQuestState("＿＿", "success"); ModifyData(DnDAlignment,Player,LawChaos,-0.15); → 一格旁白坡頂那排皮袍站起來往坡下衝 → 收尾包；沒亂（~= "success"）→ 只有短句、關掉。
3 望營地、4 回去的路、5 哨騎、6 進營開場：照第一版定稿原字（含指令）。
7 放馬（成功後才跳）：旁白一到兩格馬群炸開、營亂；Script SetQuestEntryState("＿＿", 5, "success");。可重複點：第二次短句（用條件讀 entry 5，入口格本身無條件）。
7b 放火（成功後才跳）：旁白一到兩格火起、營亂；同上寫 entry 5。
8 主帳・檀石槐（點擊、可重複）：入口旁白（他坐在大帳前，人不少）→ 選單：叫陣／（再等一等，先不動手）／（轉身回英豪府）。叫陣之後分兩條：
   甲 沒亂（entry 5 ~= "success"）：他帶著身邊的人一起提刀出來 → BeginFight(Combat,101) → 勝：接【殺了他】；敗：ShowEnding(Ending_1)。
   乙 亂了（entry 5 == "success"）：第一波小兵 BeginFight(Combat,＿＿) → 勝 → 第二波（更多）BeginFight(Combat,＿＿) → 勝，他還坐著沒動 → 口才激將選項格 [em2][口才檢定][/em2] → BeginDiceRoll(Manual,PersuasionCheck,＿＿) 四段 → 過：他一個人提刀出來 → BeginFight(Combat,100) → 勝：接【殺了他】；不過：他帶著人一起衝過來 → BeginFight(Combat,101) → 勝：接【殺了他】；任一場敗：ShowEnding(Ending_1)。
   轉身回英豪府：一到兩格旁白、SetQuestState("＿＿", "failure"); → 收尾包。先不動手：關掉。
9 酒囊・下毒（成功後才跳）：旁白毒下進去了、帳裡先亂起來 → Script SetQuestEntryState("＿＿", 5, "success"); Sequence ModifyData(FeatExp,Player,SleightOfHand,10); → 他提著刀出了帳、盯著你 → BeginFight(Combat,100) → 勝：接【殺了他】；敗：ShowEnding(Ending_1)。
【殺了他】收尾（8 的三條勝、9 的勝共用，同一場接著演）：旁白他倒下（只寫看得見的）→ Script/Sequence：SetQuestEntryState("＿＿", 2, "success"); SetQuestState("＿＿", "success"); ModifyData(Skill,Player,WordOfHonor); ModifyData(DnDAlignment,Player,LawChaos,0.15);（Description：任務更新、完成任務：＿＿、獲得技能卡、信義提升）→ 旁白營裡那邊：坡頂那排皮袍衝進營來，營裡的人朝他們湧過去 → 旁白你逆著人往營外走、上了坡 → 黑狼王：「本王說雙倍，就一個錢也不少你。」（照他的口吻寫，可加 em7 數錢）ModifyData(Coin,Player,＿＿);（給錢）→ 收尾包。
收尾包（每條一樣）：四段轉場只淡黑（SetContinueMode(false);PlayFeelFeedback(FadeOut,1,#000000,1);OpenPanel(0,close)@1;OpenPanel(1,close)@1;SetContinueMode(original)@1;Continue()@1; 照第一版定稿的寫法）＋尾格 ModifyData(GameDate,181,6,Early);DisableAllCharacterExpression();MapLock(＿＿, lock);LoadLevel(Command_HallOfHeroes);Continue();（Description 時間前進、清除立繪、地圖鎖定、切換場景，照第一版定稿）。`,
  cond: '只讀：Variable["IsHidden4"]（5 哨騎，照第一版）、CurrentQuestEntryState("＿＿", 5)（營亂：2b、7、7b 再點、8）、IsPassFight／IsPassDice；入口格一律無條件',
  voices: '你 MC1；旁白 role2；黑狼王 MC11（本王、小子、哼哈哈、腳翹案上那一路；52 句既有台詞；不評論）；檀石槐 role＿＿（無立繪；可以不開口）；哨騎與小兵無立繪、可以不開口；沒有同伴',
  checks: [
    '箱庭形狀：十一個入口各自一節、各自成立、順序不定也通；入口格無 Conditions 無 title；點擊型的有再訪短句；1、3、4、5、6 跟第一版定稿逐字相同（含指令）',
    '只有主角一個人：沒有同伴台詞、立繪、IsInTeam；旁白不提同伴',
    '施工圖第三版：作亂三點只寫成功之後、不寫擲骰；主帳三條（沒亂 101／亂了兩波＋口才激將→100 或 101／下毒→100）；100、101 勝都接同一個【殺了他】收尾；黑狼兩級價、第一次點不分認識不認識；只作亂的上坡再點拿作亂價',
    '讀法與狀態：只讀 IsHidden4、entry 5、IsPassFight／IsPassDice；entry 1／2／4／5 與 failure 照施工圖第五節；技能卡、四軸、巧手經驗、兩級錢照第三節；留白 ＿＿ 沒被取名（100、101 不留白）；沒有新變數、title；Description 在詞表內（入口格例外）',
    '固定寫法：戰鬥四件套、擲骰四段、選項格、尾格、只淡黑的轉場逐字照情境包；敗＝ShowEnding(Ending_1)',
    '旁白不評論：沒有一條路被寫成對或錯；沒有人替主角下結論；殺了他那一格看得見結果、看不見感受；黑狼衝進營只寫看得見的',
    '文風規矩 1–6、常犯十條與聲口：黑狼王既有句、旁白卡、主角卡；檀石槐不開口或只幾個字；em7 每十格至多一個；全篇不用破折號',
    '設計端連帶：無（故事大綱與索引第一版已補；定稿時再對），design_notes 寫（無）',
  ],
}

function unitHead(u) {
  return `單位：${u.key}｜箱庭情境包：${PACKET}
JSON 去處：${u.json}
要讀的設定與範本（只讀不改）：${u.overview}
骨架（十一個入口）：
${u.anchors}
讀的條件：${u.cond}
聲口：${u.voices}
本單位八項檢查：
${u.checks.map((c, i) => `${i + 1}. ${c}`).join('\n')}`
}

const DRAFT_FILE_FORMAT = `檔案結構（每節都要有，沒有內容寫「（無）」；**對話在前、給 AI 的在後**）：
# 起草稿｜06王帳第二版｜〈甲乙丙〉（〈取向名〉）
## 一、對話（給作者讀）：十一個入口各一小節，純對話——**旁白:** ＊（…）＊／**你:**／**〈角色〉:**「…」，一層一層縮排，分岔「▶ 〈條件白話〉」，選項「◆ 玩家選擇」，轉場、戰鬥、擲骰只寫一行斜體提示；照抄的五個入口也要放，標「（照第一版）」
## 二、給 AI 的
### 取向（一句）
### 節首（表：入口清單、每個入口讀的條件、寫的指令逐行含 ＿＿、戰鬥／擲骰／收尾包、格數、陣列順序）
### 逐格稿（十一個入口各一節；每格 說話者行＋全文，底下 actorID／Sequence／Conditions／Script／Description 有才寫；新格用【A】【B】…標；分岔 ▶；合流「→ 接【X】」）——每一句要跟第一節逐字相同
### 設計端連帶
### 起草者自檢（逐條對照八項檢查與文風規矩 1–6；節奏檢查的結果貼這裡）`

function scoutPrompt() {
  return `${COMMON}

你是箱庭「鮮卑王帳」第二次提案的情境整理，只讀不改專案檔。本箱庭這一批要寫的單位：
${unitHead(UNIT)}

請把情境包寫成檔案 ${PACKET}（用 Write；目錄不存在就建）。內容（純事實、逐字原文，不提改法），**第一節先放** 給AI看的指南/武俠文風創作指南.md〈零、常犯十條〉整節：
1. 規格原文：逐字抄出 ${DUNGEON} 全檔；${SPEC} §四-1 全節（含 09-29 晚的第 33–36 條）；${RULES} 第一節 1-2、1-3、1-4。
2. 第一版定稿 ${BASE} 全檔逐字（第一節對話與第二節逐格稿都要）：起草者要照抄五個入口，也要拿其餘入口當素材、看收尾包與只淡黑轉場的固定寫法。
3. 前一場 ${PREV} 第一節逐字（玩家進箱庭前看過什麼）。
4. 箱庭範本（逐字，含 Sequence／Script／Conditions／Description／links）：Json/呂信線/五原障.json #100 起到第一場戰鬥勝敗合流後十格、#3123–#3129；Json/大地圖/水濂洞.json 入口清單與任一個可重複點的互動點與再訪短句；Json/大地圖/鮮卑王帳.json（第一版，72 格）全檔——它就是第一版定稿的 JSON，格式與固定寫法都照它。
5. 固定寫法各抄一次（含出處）：入口格、尾格、只淡黑的四段轉場、戰鬥四件套（含 IsPassFight 兩格）、擲骰四段（BeginDiceRoll(Manual,PersuasionCheck,N) 那一組與 IsPassDice 兩格，出處 給AI看的指南/擲骰指令轉換規則.md）、選項格（§4.2）、ShowEnding(Ending_1) 戰敗收尾與其前一格、SetQuestState／SetQuestEntryState、CurrentQuestEntryState 的 == 與 ~= 兩種原樣字串（去 Json/ grep 實例）、ModifyData(Coin,Player,N)、ModifyData(Skill,Player,X)、ModifyData(DnDAlignment,Player,LawChaos,N) 實例。
6. 聲口：跑 python -X utf8 給AI看的指南/既有台詞.py 撈 黑狼王 全部 52 句；主角 MC1 十句（選有動作的）。檀石槐、哨騎、小兵沒有既有句，註明「新寫」。
7. 設定：@角色設定/黑狼王.md 若存在則全檔；劇情/故事大綱.md §5-5 廣 1 那一列；給AI看的指南/世界觀.md 第 275 行前後。
8. 要查的事實：黑狼王 MC11 立繪格號與可用表情特效；主角 MC1 可用 pic；Combat 100、101 全 Json 用過沒；WordOfHonor 全 Json 用過沒。只寫事實。
9. 指南摘錄（作者准：起草者只讀情境包，視同讀過三份指南）：逐字抄出 給AI看的指南/文本創作指南.md 第零層高概念那幾段、0.1、0.2.2、0.6、2.1a、第一層第 3 條四軸對照表、「箱庭手法」那幾段；給AI看的指南/世界觀.md 第八節；給AI看的指南/武俠文風創作指南.md 第四節開頭通則、旁白卡（含第 9 條）、你（主角）卡、7.1a–7.1c、7.3、第八節自檢清單；劇情/轉成json指南.md §1 Description 詞表全表、§3 尾格與轉場、§4.2、〈節點順序與編號〉；給AI看的指南/擲骰指令轉換規則.md 四段寫法與常用檢定 ID 表；給AI看的指南/戰鬥指令轉換規則.md 若存在則全檔；給AI看的指南/立繪指令轉換規則.md 2.1 與本批出場角色的格號。
寫完檔案後，回傳一頁摘要（兩千字內）：十一個入口的骨架、固定寫法在情境包哪一節、第一版哪些入口照抄、起草者一定要知道的坑。`
}

function draftPrompt(lens) {
  return `${COMMON}

你是起草者（${lens.tag}｜${lens.name}）。你的取向：${lens.brief}
${unitHead(UNIT)}

做法：只讀情境包 ${PACKET}。**先把它最前面的〈常犯十條〉錯例對改例讀一遍再動筆**。它的〈指南摘錄〉已逐字收了三份指南與各轉換規則裡寫這個箱庭用得到的節，讀情境包即視同讀過 CLAUDE.md 要求的三份指南。起草只管寫戲：不回 JSON、回讀稿查連線，固定寫法照情境包第 5 節抄；1、3、4、5、6 五個入口從情境包第 2 節逐字抄。只有情境包真的缺了寫戲非要不可的東西時，才去原檔讀那一段，並在〈起草者自檢〉記一筆。不要改任何專案檔。
把稿寫成檔案 ${draftPath(lens.tag)}（用 Write；目錄不存在就建）。
${DRAFT_FILE_FORMAT}
寫完只跑一次 python -X utf8 給AI看的指南/文風節奏檢查.py <檔>，照報告修一次就交（它列的「旁白卡候選」每條要改掉或在自檢說理由），不再重跑；報告和你修了什麼貼進〈起草者自檢〉。
回傳 JSON：file、approach（一句取向）、cells（格數）、self_check（三五句）。`
}

function revisePrompt(d) {
  return `${COMMON}

你是審修（版${d.label}）。一人審一版：逐項查，能修的直接修進稿裡，修不了的列出來。
${unitHead(UNIT)}

起草稿：${d.file}（先讀）；情境包：${PACKET}（先讀施工圖、第一版定稿、第 5 節固定寫法）；起草者的自檢：${d.self_check || '（無）'}

查什麼：
1. 八項檢查逐項：十一個入口各自成立、順序不定也通；五個照抄的入口跟第一版逐字相同（含指令）；固定寫法對不對；留白有沒有被人取了名；有沒有新變數；Description 詞表（入口格那句例外）；共同事實有沒有走樣；第一節對話與第二節逐格稿逐字一致。
2. 文風規矩 1–6 逐句與〈常犯十條〉；口吻對照情境包裡黑狼王的既有句（讀 給AI看的指南/武俠文風創作指南.md 第四節旁白卡與主角卡、給AI看的指南/武俠文風審校清單.md）。
3. 另查：只有主角一個人；作亂三點沒寫擲骰、寫了 entry 5；主帳三條的條件與戰鬥 ID 對；殺了他收尾共用且指令齊；黑狼兩級價、付錢那格的指令；旁白沒評論任何一條。
怎麼修：句子、指令、接法能修就直接修，修完那一格仍守取向（版${d.label}是「${LENSES.find(l => l.tag === d.label).name}」）；該作者定的不要替作者定，留 ＿＿ 並記下來。第一節與第二節要同步改。
寫成檔案 ${revisedPath(d.label)}（結構同起草稿），檔尾加三節：
## 旁白逐格表（每一個旁白格一行——格名｜第 3 條判語、心事、替玩家下感受：過或改｜第 7 條造景細節、精確數目、動作鏈超過兩拍、收尾巧句：過或改｜改了什麼。不准整段打勾；文風節奏檢查.py 列的「旁白卡候選」每一條都要在這張表裡有交代）
## 審修紀錄（每一處改動：哪個入口第幾格、原句→新句、依哪條規矩）
## 待作者定（修不了或不該由 AI 定的）
修完跑一次 python -X utf8 給AI看的指南/文風節奏檢查.py <檔> 與 python -X utf8 給AI看的指南/高難度檢定檢查.py <檔>（後者檔頭沒分類那幾條警告不管；它報的留白、禁詞、Description、em7、title、SetFlag 要處理）。不要改任何專案檔。
回傳 JSON：file、verdicts（八項各一筆：check、verdict 是 pass／fixed／unresolved、note）、changes（改了幾處）、summary（三五句）。`
}

function logicPrompt(r) {
  return `${COMMON}

你是邏輯審（版${r.label}）。審修已經修過規矩與口吻，你只看這場戲的事理通不通：先讀情境包 ${PACKET} 的施工圖、第一版定稿與前一場那一段，再逐格讀 ${r.file}（十一個入口每個都要讀，順序不定也要通）。
${unitHead(UNIT)}

查什麼（只管事理）：
1. 誰知道什麼：每一格說話的人、主角、旁白此刻知道的事，是不是前面已經看見或聽見的。沒看見的不能認出，沒聽見的不能回答，同一件事不能認第二次、不能講第二次（前一場已演過老兵死、名字聽過；箱庭裡不再「認出」他是誰）。
2. 先後因果：先看見才能叫人、先問才有答、先做才有結果；轉場前後的時辰、天色、地點接得上；人在哪、誰在場，前後一致。箱庭的點順序不定：先點黑狼再進營、先進營再回坡上、先放火再放馬、下毒之後、殺進主帳沒作亂，都要通。
3. 東西的去向：酒囊、錢、弓、旗、馬、火，有拿出來就有交代；沒有憑空多出來的東西。
4. 台詞與旁白不打架：旁白不重講台詞剛講的事，也不比台詞晚一步才交代台詞已經用到的事實；選項文字跟後面的戲對得上。
5. 條件與分支：每條分支的前提在那條路上真的成立：營亂（entry 5）由誰寫、在哪讀；沒亂就叫陣的 101；下毒的 100；激將過不過；賣亂那條要營亂；殺了他之後黑狼衝進營與付錢；再點短句的條件。
6. 前後場接口：入口開場假定的事前一場真的演過；四條收尾留下的狀態跟設定檔第五節一致；不去那兩條沒提他死。
怎麼修：能修就直接修進兩節（第一節與第二節同步、逐字相同），修完那一格仍守該版取向與文風規矩；拿不準的列出來不改。每一處改動記進該版〈審修紀錄〉末尾，標「邏輯審」；該作者定的記進〈待作者定〉。改完跑一次 python -X utf8 給AI看的指南/文風節奏檢查.py "${r.file}"。不動任何專案檔。
回傳 JSON：file、issues（每筆：where、problem、fix、fixed 是 true／false）、summary（兩三句）。`
}

function finalPrompt(revs) {
  return `${COMMON}

你是本單位的終審兼編輯。三版已各經一名審修、一名邏輯審。你的工作：再挑一次錯、標一版建議、寫成提案檔、跑兩支檢查腳本。
${unitHead(UNIT)}

三版審修、邏輯審過的稿（先全部讀完）：
${revs.map(r => `- 版${r.label}（${LENSES.find(l => l.tag === r.label).name}）：${r.file}；審修結論：${r.summary}；verdicts：${JSON.stringify(r.verdicts)}`).join('\n')}
情境包：${PACKET}

做法：
1. 挑錯：每個入口從入口格讀到尾格或關掉對話，每條路都通（選單每一條、三場戰鬥勝敗、擲骰過不過、營亂沒亂、有沒有 IsHidden4）；五個照抄入口跟第一版逐字相同；固定寫法有沒有抄錯一個字；留白有沒有被取名；共同事實有沒有走樣；三版是不是三個真的不一樣的選擇；有沒有人替主角下結論；第一節與第二節逐字一致。發現就直接改，記進該版〈審修紀錄〉（標「終審」）。
2. 建議版：挑一版，理由一句。
3. 寫提案檔 ${OUT}（用 Write；已存在就整檔覆寫），**對話置頂**：
   第一行「# 檀石槐線・06王帳第二版　提案｜創作稿／提案，尚未進 JSON；作者挑版、定稿、轉 JSON 後本檔歸檔」；
   短檔頭引用區塊（六行內）：「📝 ${DATE} 三版待作者挑一版；規格見 ${DUNGEON}〈箱庭寫法（第三版）〉與 ${SPEC} §四-1 第 33–36 條，本檔只放戲。第一版定稿 ${BASE} 與其 JSON 待本版定稿後整檔取代。」、JSON 去處、「十一個入口格都不掛條件、不寫 title；新格不編號」、「**建議版：**」＋理由、「**待作者填：**」（任務號與 entry、地圖點 ID、哨騎與兩波小兵戰鬥 ID、巧手與口才難度、兩級錢數、檀石槐與哨騎 actorID、配樂）；
   「## 一、對話（給作者讀）」底下三節「### 版一（甲｜照施工圖最少）」「### 版二（乙｜接戲）」「### 版三（丙｜另一種演法）」，各放該版第一節的純對話（十一個入口各一小節；照抄的五個入口每版只放一次，寫「（照第一版，三版相同）」不重複三遍）；
   「## 二、給 AI 的」底下三節「### 版一」「### 版二」「### 版三」，各放：取向、節首表、逐格稿、設計端連帶、旁白逐格表、審修紀錄（含邏輯審與你終審的改動）；再「### 待作者定」（三版合併去重，每條前加 ⚠）與「### 審修摘要」（每版八項 pass／fixed／unresolved 的數目）。
4. 跑 python -X utf8 給AI看的指南/文風節奏檢查.py "${OUT}" 與 python -X utf8 給AI看的指南/高難度檢定檢查.py "${OUT}"（後者沒分類那幾條與入口格提醒句的警告不管），報的照規矩修到不報（改了要同步改該版兩節並記進審修紀錄），或在〈待作者定〉說明為何留。
5. git status（只讀）：本流程只該動 ${OUT}。不動 Json/、${BASE}、設定檔、角色檔。git 只准讀，不准 stash、checkout、restore、add、commit。
回傳 JSON：out、recommended（label、reason）、unresolved（字串陣列）、rhythm、format、summary（三五句）。`
}

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
const LOGIC_SCHEMA = { type: 'object', properties: {
  file: { type: 'string' },
  issues: { type: 'array', items: { type: 'object', properties: {
    where: { type: 'string' }, problem: { type: 'string' }, fix: { type: 'string' }, fixed: { type: 'boolean' },
  }, required: ['where', 'problem', 'fix', 'fixed'] } },
  summary: { type: 'string' },
}, required: ['file', 'issues', 'summary'] }
const FINAL_SCHEMA = { type: 'object', properties: {
  out: { type: 'string' },
  recommended: { type: 'object', properties: { label: { type: 'string' }, reason: { type: 'string' } }, required: ['label', 'reason'] },
  unresolved: { type: 'array', items: { type: 'string' } },
  rhythm: { type: 'string' }, format: { type: 'string' }, summary: { type: 'string' },
}, required: ['out', 'recommended', 'unresolved', 'rhythm', 'format', 'summary'] }

log('鮮卑王帳第二版：整理情境包')
const havePacket = A.have && A.have.packet
const ok = havePacket ? true : !!(await agent(scoutPrompt(), { label: `scout:${BOX}`, phase: 'Scout', effort: 'xhigh', model: MODEL }))
if (!ok) return { date: DATE, error: 'scout failed' }
const had = (A.have && A.have.drafts) || []
const drafts = (await parallel(LENSES.map(l => async () => {
  if (had.includes(l.tag)) return { label: l.tag, file: draftPath(l.tag), self_check: '（沿用舊 run 的起草稿）' }
  const r = await agent(draftPrompt(l), { label: `draft-${l.tag}:06王帳第二版`, phase: 'Draft', effort: 'xhigh', model: MODEL, schema: DRAFT_SCHEMA })
  return r ? { label: l.tag, ...r, file: draftPath(l.tag) } : null
}))).filter(Boolean)
if (!drafts.length) return { date: DATE, error: 'all drafts failed' }
log(`${drafts.length} 版起草稿就位，送審修`)
const revs = (await parallel(drafts.map(d => () =>
  agent(revisePrompt(d), { label: `revise-${d.label}:06王帳第二版`, phase: 'Revise', effort: 'max', model: MODEL, schema: REVISE_SCHEMA })
    .then(r => r ? { label: d.label, ...r, file: revisedPath(d.label) } : null)))).filter(Boolean)
if (!revs.length) return { date: DATE, error: 'all revisions failed', drafts }
const logics = (await parallel(revs.map(r => () =>
  agent(logicPrompt(r), { label: `logic-${r.label}:06王帳第二版`, phase: 'Logic', effort: 'max', model: MODEL, schema: LOGIC_SCHEMA })
    .then(x => x ? { ...r, logic: x, summary: r.summary + '｜邏輯審：' + x.summary } : r)))).filter(Boolean)
log('邏輯審完成，送終審')
const fin = await agent(finalPrompt(logics), { label: 'final:06王帳第二版', phase: 'Final', effort: 'max', model: MODEL, schema: FINAL_SCHEMA })
if (!fin) return { date: DATE, error: 'final failed', revs }
log(`提案檔完成，建議版 ${fin.recommended.label}，待作者定 ${fin.unresolved.length} 件`)
return { date: DATE, unit: UNIT.key, out: fin.out, recommended: fin.recommended, unresolved: fin.unresolved, rhythm: fin.rhythm, format: fin.format, summary: fin.summary,
  revisions: revs.map(r => ({ label: r.label, changes: r.changes, unresolved: r.verdicts.filter(v => v.verdict === 'unresolved').length, summary: r.summary })) }
