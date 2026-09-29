export const meta = {
  name: 'butterfly-tanshihuai-box',
  description: '蝴蝶效應第三案・檀石槐線的箱庭（塞外營地）：一份箱庭情境包、一個單位三起草三審修一終審，箱庭寫法（九個互動點各自入口）、只有主角一人、對話置頂',
  phases: [
    { title: 'Scout', detail: '一名：箱庭情境包寫成檔案（箱庭範本、固定寫法、聲口、指南摘錄）' },
    { title: 'Draft', detail: '三名起草，各寫一版九個互動點進檔案' },
    { title: 'Revise', detail: '每版一名審修：逐項查、能修就修' },
    { title: 'Logic', detail: '每版一名邏輯審（2026-09-28 作者要求加）：誰知道什麼、先後因果、人在哪、東西去哪、前後場接口；直接修，記「邏輯審」' },
    { title: 'Final', detail: '一名終審：再挑錯、標建議版、寫提案檔（對話置頂）、跑檢查腳本' },
  ],
}

const A = Object.assign({ date: '＿＿＿＿-＿＿-＿＿', have: {}, bf: 'C:/Users/user/AppData/Local/Temp/claude/d--QilinStory/1ddf8b7f-8270-48d3-b27d-a5e5e30f3f7a/scratchpad/bf3' }, args || {})
const DATE = A.date
const MODEL = A.model || 'opus'
const BF = A.bf
const SPEC = '劇情/雲中/@設定_雲中.md'
const DUNGEON = '劇情/鮮卑王帳/@設定_鮮卑王帳.md'
const RULES = '劇情/蝴蝶效應_素材與設計.md'
const BOX = '塞外營地'
const OUT = '劇情/檀石槐線_05營地箱庭.md'
const PACKET = `${BF}/${BOX}/packet.md`
const draftPath = tag => `${BF}/05營地箱庭/draft-${tag}.md`
const revisedPath = tag => `${BF}/05營地箱庭/revised-${tag}.md`

const COMMON = `你在做《異麒麟》蝴蝶效應第三案「檀石槐線」的箱庭提案（作者 2026-09-27 定形十四條、09-28 補十一條並選定九個互動點）。規格：${SPEC} §四-1（二十五條裁示表、段落表）、${DUNGEON}（**〈箱庭寫法〉施工圖是本單位的骨架**：整條流程、九個互動點表、拿得到的東西、防止提早離開；另有〈誰在〉、〈任務與狀態〉、〈紅線〉、〈未定〉）、${RULES} 第一節規矩。本提示只摘要。
- 這條線是什麼：武道大會壓軸堂堂正正打贏的玩家，181/2 在雲中被城門口少一條腿的老兵委託替死在鮮卑手上的兒子報仇；追查出動手的是西部一部、今春紮在北邊、檀石槐本人也在；老兵等不及自己北上死在半路，你埋了他，這件事是你自己認的（以上都在探索事件〈老兵的委託〉裡演完，**箱庭不重講**）。箱庭＝那座春天的鮮卑營地：坡上有黑狼王的獵隊盯著同一個營；營地邊有哨騎；營裡有他。最後由玩家自己選：陣前挑戰（唯一算董卓放行第一層功績的路，戰鬥 ID 100）／點他的酒囊下毒（主角自己備的毒，不提張寧；得手不算功績）／回坡上把路與時辰賣給黑狼拿錢／回去（不去；遊戲裡不提他死了）。檀石槐正當盛年、沒病、不邪，全線人打人。
- **箱庭寫法（作者 09-28 退回線性寫法後定）：** 一份 JSON、九個互不相連的入口，每個入口是場景裡一個互動點——走進某區強制觸發一次，或點擊某人某物、可重複點（第二次起播短句）。玩家自己走、自己選先點誰，所以每個入口都要能獨立成立、順序不定；入口格不掛 Conditions、不寫 title（title 與綁定作者在 Unity 做；要分流的在入口格下一格用 Conditions 分）。範本：Json/呂信線/五原障.json、Json/大地圖/水濂洞.json、劇情/呂信/05 五原障.md（情境包有抄）。
- **只有主角一個人**（作者 09-28）：沒有任何同伴的台詞、立繪、在隊條件；旁白不提同伴。黑狼王、檀石槐、哨騎是線裡的人物，不算同伴。
- 引擎硬紅線：不新建變數、不新建任務、不自取名字（任務號、entry 以外的號、箱庭名、地圖點、哨騎戰鬥 ID、巧手難度、錢數、檀石槐與哨騎的 actorID 一律留 ＿＿）；SetFlag／GetFlag 禁用；只讀既有的 IsHidden4、C2M1 entry 3、本任務 entry 1；新格不編號、不寫 title；Description 只寫 劇情/轉成json指南.md §1 詞表標籤（每個入口格可寫一句「入口：〈點名〉；條件作者設」提醒，作者准的例外）；四軸 DnDAlignment 不寫。
- 人：沒有一個人替主角下結論——黑狼王不評論、旁白不評論四條路；「最好」是玩家的最好，不是俠的最好。
- 內容三道線：世界觀第八節禁詞（五胡亂華、司馬、篡魏、三國歸晉、輪迴、重來、前世）；角色口中不出「凶戾」「人祭」；檀石槐可以不開口，若開口只有幾個字或經通譯，不發明鮮卑語詞；不寫他的內心、來歷、對漢人的看法；不寫戰況數字、不寫朝廷；不去那條不提他死；賣給黑狼不演他動不動手。
- 共同事實（跟探索事件〈老兵的委託〉一致，起草者不得另定）：老兵沒有名字、兒子 180 冬死、他自己北上死在半路（箱庭裡不再提屍首與埋）；線索三件已知；檀石槐的名字玩家已經聽過；黑狼王 MC11 親領獵隊、奪冠玩家多半第一次見他（走過舌戰三家的認識他，讀 CurrentQuestEntryState("C2M1", 3) == "success";）；賣給黑狼要進過營（本任務 entry 1 success）才有；每條收尾＝四段轉場＋MapLock(＿＿, lock);＋LoadLevel(Command_HallOfHeroes); 回英豪府；不寫 GameDate。
- 稿的寫法（創作稿）：說話者行 **旁白:**／**你:**／**〈角色〉:**（主角一律「你」），旁白 [panel=6]＊（…）＊，台詞「…」；每格底下 - actorID: / - Sequence: / - Conditions: / - Script: / - Description: 有才寫，各一行；新格用【A】【B】…標，不編號；每個入口自成一節；選單照 劇情/轉成json指南.md §4.2；擲骰、戰鬥、轉場、尾格照固定寫法（情境包有抄）；沒有立繪的角色不寫 SetPortrait。不動 Json/、不動 Unity、不動回讀稿與設定檔的文字。
- 文風規矩（違反即退）：1. 旁白看得見你做什麼、看不見你想什麼：不寫內心話、不替玩家下感受或結論、不替角色斷定心裡怎樣（「倒像」「像是」可以）。2. 寫結果和狀態，不寫過程；一格裡同一個人的動作最多兩拍；不編精確數目、距離和純造景小細節。3. 作者退過的句型不得再犯：「不是 X，是 Y」翻轉句；否定句收尾造氣氛；「像……」比喻巧句收尾；收尾加新判語；旁白先把下一格台詞要講的事講掉；選項已經講過的事旁白再講一遍；同一件事隔幾格又講一遍。4. 句子寫完整，不斷碎句：旁白一格兩三句、每句十九到二十五字、不留五字以下的句子；角色台詞一句十五字上下，照那個角色既有的口吻。5. 旁白裡不寫「」引號；**全篇不用破折號「——」，台詞也不用**（打斷、沒說完用「……」；文風指南旁白卡第 9 條）。[em7] 每十格至多一個、同一人不連掛、[/em7] 後必接標點。6. 玩家看得到的字不自創單字名詞；東漢稱謂與用詞。
- **檔案體例（作者 09-28 裁示）：對話文字置頂、給 AI 看的放後面。** 提案檔＝三版的純對話在前（作者只讀這一段），三版的逐格稿、待作者定、審修紀錄在後。
- 省回合：情境包已收好規格原文、範本格、聲口、指南摘錄，先讀它；只在拿不準時回原檔查那一段。日期一律寫 ${DATE}。給作者看的話用白話短句。`

const LENSES = [
  { tag: '甲', name: '照施工圖最少', brief: '九個點每個只做施工圖點名的事，格數最少；旁白不造景、不加物件。偏離施工圖處在自檢講明。' },
  { tag: '乙', name: '接戲', brief: '先把情境包裡黑狼王的既有句、五原障與水濂洞箱庭的嗓子讀順，再寫出唸起來最順、最像這個遊戲原本箱庭的版本；每個點可以比甲多一兩格，但一定要守施工圖與共同事實。' },
  { tag: '丙', name: '另一種演法', brief: '在施工圖範圍內刻意換一種演法，讓作者有真的不一樣的選擇：換誰先開口、換一個看得見的動作或物件、換點與點之間的呼應（例如坡上看見的東西進營再看見）；仍守全部規矩。若另一種演法明顯更差，照樣給出最好的不同版本並在自檢說明。' },
]

const UNIT = {
  key: '05營地箱庭', box: BOX, out: OUT,
  json: 'Json/大地圖/塞外營地.json（暫名，新檔；箱庭名、地圖點 ID 作者定；九個入口格都不掛條件、不寫 title）',
  overview: `${DUNGEON} 全檔（〈箱庭寫法〉是骨架）；${SPEC} §四-1；探索事件〈老兵的委託〉定稿 劇情/181年事件/02月(支)老兵的委託.md（若還沒生成，讀 劇情/檀石槐線_01委託.md 版三與 劇情/檀石槐線_02半路.md 版三）；作廢的 劇情/檀石槐線_03營地外圍.md、_04誅.md 只當素材，形狀不照它`,
  anchors: `九個入口（照 ${DUNGEON}〈箱庭寫法〉第二節那張表，逐點）：
1 坡上開場（強制一次）：看見營，旁白一兩格，不報數目。
2 黑狼的營火（點擊、可重複）：入口格下一格分兩條——認識（CurrentQuestEntryState("C2M1", 3) == "success";）他不自報名號、照九月「小子」那一路接話；不認識（~= "success"）他自報朔方黑狼。開價只到「你要是進去看清楚了，本王出錢買」一句，不逼不勸、不問你為什麼來。再點：短句一格。進過營之後（CurrentQuestEntryState("CF＿＿", 1) == "success";）多一條選項「賣」：你講的是路與時辰、不講老兵的事 → 他數錢那一格收 → ModifyData(Coin,Player,＿＿); SetQuestEntryState("CF＿＿", 4, "success"); SetQuestState("CF＿＿", "success"); → 收尾包。
3 望營地（點擊、可重複、可跳過）：一格旁白，只寫看得見的。
4 回去的路（坡口點擊）：選單 回英豪府／再看看。回＝不去：一到兩格旁白你轉身，SetQuestState("CF＿＿", "failure"); → 收尾包。再看看＝關掉對話。
5 哨騎（走到營地邊界強制）：入口格下一格分兩條——有 IsHidden4（Variable["IsHidden4"] == true;）：選單 打／混進去（照釣魚叟那套替他們放馬、放到看慣了你；旁白概括結果）；沒有（Variable["IsHidden4"] ~= true;）：旁白後直接進戰鬥。打＝戰鬥一 BeginFight(Combat,＿＿) 固定四件套，勝→進營格，敗→ShowEnding(Ending_1)。進營那格（兩條合流）：SetQuestEntryState("CF＿＿", 1, "success");。
6 進營開場（強制一次）：看見他，正當盛年，只寫看得見的（人、馬、弓、身邊的人怎麼讓路），旁白點出這就是那個人；一到兩格。
7 馬群（點擊、可重複、可跳過）：一格旁白。
8 檀石槐（點擊、可重複）：選單 ①陣前挑戰：叫陣一兩格、他可以不答 → BeginFight(Combat,100) → 勝：你殺了他，一到兩格旁白寫結果不寫感受，SetQuestEntryState("CF＿＿", 2, "success"); SetQuestState("CF＿＿", "success"); → 收尾包；敗：ShowEnding(Ending_1)。②先不動：關掉對話。③轉身回去＝不去：failure → 收尾包。
9 他的酒囊（點擊）：下毒，毒是主角自己備的、一句帶過、不提張寧、不取毒名 → 巧手擲骰 BeginDiceRoll(Manual,SleightOfHandCheck,＿＿) 四段寫法 → 過：旁白結果（夜裡、他死了、營裡沒人知道是你）SetQuestEntryState("CF＿＿", 3, "success"); SetQuestState("CF＿＿", "success"); → 收尾包；不過：被察覺 → BeginFight(Combat,＿＿)（哨騎那組）→ 勝：逃回，SetQuestState("CF＿＿", "failure"); → 收尾包；敗：ShowEnding(Ending_1)。
收尾包（每條一樣）：四段轉場（照五原障 #3123 那組，背景 HallOfHeroes）＋ MapLock(＿＿, lock); ＋ LoadLevel(Command_HallOfHeroes); → 尾格。`,
  cond: '只讀四樣：Variable["IsHidden4"]、CurrentQuestEntryState("C2M1", 3)、CurrentQuestEntryState("CF＿＿", 1)、IsPassFight／IsPassDice；其餘無條件；入口格一律無條件',
  voices: '你 MC1；旁白 role2；黑狼王 MC11（本王、小子、哼哈哈、腳翹案上那一路；52 句既有台詞；不評論四條路）；檀石槐 role＿＿（無立繪；可以不開口）；哨騎 role＿＿（無立繪，可以只有一兩句）；沒有同伴',
  checks: [
    '箱庭形狀：九個入口各自一節、各自成立、順序不定也通；入口格無 Conditions 無 title；點擊型的有再訪短句；強制型的只播一次的寫法照範本',
    '只有主角一個人：沒有同伴台詞、立繪、IsInTeam；旁白不提同伴',
    '共同事實與二十五條：黑狼王親領、開價一句、認識／不認識兩條；哨騎有 IsHidden4 才出選單；檀石槐盛年不開口或只幾個字、Combat 100；酒囊下毒不提張寧、不算功績；只有陣前打贏算功績（entry 2）；不去不提他死；賣要進過營',
    '讀法與狀態：只讀那四樣；每條收尾的 SetQuestState／SetQuestEntryState 照設定檔〈任務與狀態〉；收尾包＝四段轉場＋MapLock(＿＿, lock)＋LoadLevel(Command_HallOfHeroes)；留白 ＿＿ 沒被取名；沒有新變數、title；Description 在詞表內（入口格那句例外）',
    '固定寫法：戰鬥四件套、擲骰四段、選項格、尾格、轉場逐字照情境包第 3 節；敗＝ShowEnding(Ending_1)',
    '旁白不評論：沒有一條路被寫成對或錯；沒有人替主角下結論；殺了他那一格看得見結果、看不見感受',
    '文風規矩 1–6 與聲口：黑狼王既有句、旁白卡、主角卡；em7 每十格至多一個；不重講探索事件裡演過的事',
    '設計端連帶：一句給 劇情/故事大綱.md §5-5 廣 1：董卓放行第一層讀 CurrentQuestEntryState("CF＿＿", 2) == "success"；不進遊戲文本',
  ],
}

function unitHead(u) {
  return `單位：${u.key}｜箱庭情境包：${PACKET}
JSON 去處：${u.json}
要讀的設定與範本（只讀不改）：${u.overview}
骨架（九個入口）：
${u.anchors}
讀的條件：${u.cond}
聲口：${u.voices}
本單位八項檢查：
${u.checks.map((c, i) => `${i + 1}. ${c}`).join('\n')}`
}

const DRAFT_FILE_FORMAT = `檔案結構（每節都要有，沒有內容寫「（無）」；**對話在前、給 AI 的在後**）：
# 起草稿｜05營地箱庭｜〈甲乙丙〉（〈取向名〉）
## 一、對話（給作者讀）：九個入口各一小節，純對話——**旁白:** ＊（…）＊／**你:**／**〈角色〉:**「…」，一層一層縮排，分岔「▶ 〈條件白話〉」，選項「◆ 玩家選擇」，轉場、戰鬥、擲骰只寫一行斜體提示
## 二、給 AI 的
### 取向（一句）
### 節首（表：入口清單、每個入口讀的條件、寫的指令逐行含 ＿＿、戰鬥／擲骰／收尾包、格數）
### 逐格稿（九個入口各一節；每格 說話者行＋全文，底下 actorID／Sequence／Conditions／Script／Description 有才寫；新格用【A】【B】…標；分岔 ▶；合流「→ 接【X】」）——每一句要跟第一節逐字相同
### 設計端連帶
### 起草者自檢（逐條對照八項檢查與文風規矩 1–6；節奏檢查的結果貼這裡）`

function scoutPrompt() {
  return `${COMMON}

你是箱庭「${BOX}」的情境整理，只讀不改專案檔。本箱庭這一批要寫的單位：
${unitHead(UNIT)}

請把情境包寫成檔案 ${PACKET}（用 Write；目錄不存在就建）。內容（純事實、逐字原文，不提改法）：
1. 規格原文：逐字抄出 ${DUNGEON} 全檔；${SPEC} §二、§四-1 全節（二十五條表、段落表）；${RULES} 第一節 1-2、1-3、1-4。
2. 探索事件〈老兵的委託〉：若 劇情/181年事件/02月(支)老兵的委託.md 已存在，逐字抄它第一節〈對話〉；否則抄 劇情/檀石槐線_01委託.md 版三〈戲〉與 劇情/檀石槐線_02半路.md 版三〈戲〉。起草者要知道玩家進箱庭前已經看過什麼、名字聽過沒。
3. 箱庭範本（逐字，含 Sequence／Script／Conditions／Description／links）：Json/呂信線/五原障.json 從 #100 起到第一場戰鬥勝敗合流後十格、#3123–#3129 收尾那組、三個入口格；Json/大地圖/水濂洞.json 的入口清單（每個入口格 entryID、title、第一句）、「點擊太平道人 #4127」「點擊黑狼氏族 #4126」那兩小段全抄、任一個可重複點的互動點與它的再訪短句；Json/大地圖/翠影潭.json #2052 點擊釣魚叟那段前十格；劇情/呂信/05 五原障.md 檔頭、〈⚠ 任務流程與箱庭規劃〉全節、§2 外圍・哨騎（戰鬥一）全段、§2-探 三個點全段、§2-出 想走的時候全段（這是箱庭創作稿的樣子）；劇情/水濂洞/水濂洞.md〈怎麼讀本檔〉。
4. 固定寫法各抄一次（含出處 entryID）：入口格、尾格（actorID 0、text ""、DisableDialogueBG();Continue();）、四段轉場（五原障 #3123 那組）、LoadLevel 與 MapLock(…, lock) 的原樣字串（去 Json/ grep 實例）、戰鬥四件套（含 IsPassFight 兩格）、擲骰四段（BeginDiceRoll(Manual,SleightOfHandCheck,N) 那一組與 IsPassDice 兩格，出處 給AI看的指南/擲骰指令轉換規則.md）、選項格（§4.2 的形、Description 選項1…）、ShowEnding(Ending_1) 戰敗收尾與其前一格、SetQuestState／SetQuestEntryState、Variable["IsHidden4"] == true; 與 ~= true; 的實例、CurrentQuestEntryState("C2M1", 3) 在 9月.json #325 的寫法、ModifyData(Coin,Player,N) 實例一則。
5. 聲口：跑 python -X utf8 給AI看的指南/既有台詞.py 撈 黑狼王 全部 52 句；主角 MC1 十句（選有動作的）。檀石槐、哨騎沒有既有句，註明「新寫」。
6. 設定：@角色設定/黑狼王.md 若存在則全檔；主線事件/180年/3月.json #146、#147、#182（娜娜介紹黑狼氏族與黑狼王，只當事實，她不出場）；劇情/舊創作稿/高難度檢定_釣魚叟.md〈✅ 定稿〉的〈戲〉【D】–【H】原話；劇情/故事大綱.md §5-5 廣 1 那一列；給AI看的指南/世界觀.md 第 275 行前後。
7. 要查的事實：對話背景圖 ID 野外那一列（Grassland、Wilderness）與英豪府 HallOfHeroes；黑狼王 MC11 立繪格號與可用表情特效；主角 MC1 可用 pic；Json/大地圖/ 底下有沒有叫塞外營地的檔（沒有就寫沒有）；Combat,100 全 Json 用過沒。只寫事實。
8. 指南摘錄（作者准：起草者只讀情境包，視同讀過三份指南）：逐字抄出 給AI看的指南/文本創作指南.md 第零層高概念那幾段、0.1、0.2.2、0.6、2.1a、第一層 1「箱庭手法」那幾段；給AI看的指南/世界觀.md 第八節；給AI看的指南/武俠文風創作指南.md〈零、常犯十條〉整節（**放在情境包最前面，起草者先看錯例再動筆**）、第四節開頭通則、旁白卡、你（主角）卡、7.1a–7.1c、7.3、第八節自檢清單；劇情/轉成json指南.md §1 Description 詞表全表、§3 尾格與轉場、§4.2 開頭通則與選項文字規矩、〈節點順序與編號〉；給AI看的指南/擲骰指令轉換規則.md 四段寫法與常用檢定 ID 表；給AI看的指南/戰鬥指令轉換規則.md 若存在則全檔；給AI看的指南/立繪指令轉換規則.md 2.1 與本批出場角色的格號。
寫完檔案後，回傳一頁摘要（兩千字內）：九個入口的骨架、固定寫法在情境包哪一節、探索事件已演過什麼、起草者一定要知道的坑。`
}

function draftPrompt(lens) {
  return `${COMMON}

你是起草者（${lens.tag}｜${lens.name}）。你的取向：${lens.brief}
${unitHead(UNIT)}

做法：只讀情境包 ${PACKET}。**先把它最前面的〈常犯十條〉錯例對改例讀一遍再動筆**（作者 2026-09-28）。它的〈指南摘錄〉已逐字收了三份指南與各轉換規則裡寫這個箱庭用得到的節，**讀情境包即視同讀過 CLAUDE.md 要求的三份指南，不必再開指南原檔**。起草只管寫戲：**不回 JSON、回讀稿查連線**，固定寫法照情境包第 4 節抄。只有情境包真的缺了寫戲非要不可的東西時，才去原檔讀那一段，並在〈起草者自檢〉記一筆。不要改任何專案檔。
把稿寫成檔案 ${draftPath(lens.tag)}（用 Write；目錄不存在就建）。
${DRAFT_FILE_FORMAT}
寫完只跑一次 python -X utf8 給AI看的指南/文風節奏檢查.py <檔>，照報告修一次就交，不再重跑；報告和你修了什麼貼進〈起草者自檢〉，沒修完的交給審修。
回傳 JSON：file、approach（一句取向）、cells（格數）、self_check（三五句）。`
}

function revisePrompt(d) {
  return `${COMMON}

你是審修（版${d.label}）。一人審一版：逐項查，能修的直接修進稿裡，修不了的列出來。
${unitHead(UNIT)}

起草稿：${d.file}（先讀）；情境包：${PACKET}（先讀施工圖與第 4 節固定寫法）；起草者的自檢：${d.self_check || '（無）'}

查什麼：
1. 八項檢查逐項：九個入口各自成立、順序不定也通；固定寫法對不對（收尾包、戰鬥四件套、擲骰四段、選項格、尾格）；留白有沒有被人取了名；有沒有新變數；Description 詞表（入口格那句例外）；共同事實有沒有走樣；第一節對話與第二節逐格稿逐字一致。
2. 文風規矩 1–6 逐句；口吻對照情境包裡黑狼王的既有句（讀 給AI看的指南/武俠文風創作指南.md 第四節旁白卡與主角卡、給AI看的指南/武俠文風審校清單.md）。
3. 另查：只有主角一個人；沒 IsHidden4 的哨騎不出選單；賣要進過營；酒囊不提張寧；不去不提他死；旁白沒評論任何一條。
怎麼修：句子、指令、接法能修就直接修，修完那一格仍要守取向（版${d.label}是「${LENSES.find(l => l.tag === d.label).name}」）；該作者定的不要替作者定，留 ＿＿ 並記下來。第一節與第二節要同步改。
寫成檔案 ${revisedPath(d.label)}（結構同起草稿），檔尾加三節：
## 旁白逐格表（作者 2026-09-28 要求：每一個旁白格一行——格名｜第 3 條判語、心事、替玩家下感受：過或改｜第 7 條造景細節、精確數目、動作鏈超過兩拍、收尾巧句：過或改｜改了什麼。不准整段打勾，一格一格重讀；文風節奏檢查.py 列的「旁白卡候選」每一條都要在這張表裡有交代）
## 審修紀錄（每一處改動：哪個入口第幾格、原句→新句、依哪條規矩）
## 待作者定（修不了或不該由 AI 定的）
修完跑一次 python -X utf8 給AI看的指南/文風節奏檢查.py <檔> 與 python -X utf8 給AI看的指南/高難度檢定檢查.py <檔>（後者檔頭沒分類那幾條警告不管；它報的留白、禁詞、Description、em7、title、SetFlag 要處理）。不要改任何專案檔。
回傳 JSON：file、verdicts（八項各一筆：check、verdict 是 pass／fixed／unresolved、note）、changes（改了幾處）、summary（三五句）。`
}

function finalPrompt(revs) {
  return `${COMMON}

你是本單位的終審兼編輯。三版已各經一名審修。你的工作：再挑一次錯、標一版建議、寫成提案檔、跑兩支檢查腳本。
${unitHead(UNIT)}

三版審修稿（先全部讀完）：
${revs.map(r => `- 版${r.label}（${LENSES.find(l => l.tag === r.label).name}）：${r.file}；審修結論：${r.summary}；verdicts：${JSON.stringify(r.verdicts)}`).join('\n')}
情境包：${PACKET}

做法：
1. 挑錯：每個入口從入口格讀到尾格或關掉對話，每條路都通（選單每一條、戰鬥勝敗、擲骰過不過、認識不認識、有沒有 IsHidden4、進過營沒有）；固定寫法有沒有抄錯一個字；留白有沒有被取名；共同事實有沒有走樣；三版是不是三個真的不一樣的選擇；有沒有人替主角下結論；第一節與第二節逐字一致。發現就直接改，記進該版〈審修紀錄〉（標「終審」）。
2. 建議版：挑一版，理由一句。
3. 寫提案檔 ${OUT}（用 Write；已存在就整檔覆寫），**對話置頂**：
   第一行「# 檀石槐線・05營地箱庭　提案｜創作稿／提案，尚未進 JSON；作者挑版、定稿、轉 JSON 後本檔歸檔」；
   短檔頭引用區塊（六行內）：「📝 ${DATE} 三版待作者挑一版；規格見 ${DUNGEON}〈箱庭寫法〉與 ${SPEC} §四-1，本檔只放戲。」、JSON 去處、「九個入口格都不掛條件、不寫 title；新格不編號」、「**建議版：**」＋理由、「**待作者填：**」（任務號與 entry、箱庭名與地圖點 ID、哨騎戰鬥 ID、巧手難度、錢數、檀石槐與哨騎的 actorID、配樂）；
   「## 一、對話（給作者讀）」底下三節「### 版一（甲｜照施工圖最少）」「### 版二（乙｜接戲）」「### 版三（丙｜另一種演法）」，各放該版第一節的純對話（九個入口各一小節）；
   「## 二、給 AI 的」底下三節「### 版一」「### 版二」「### 版三」，各放：取向、節首表、逐格稿、設計端連帶、審修紀錄（含你終審的改動）；再「### 待作者定」（三版合併去重，每條前加 ⚠）與「### 審修摘要」（每版八項 pass／fixed／unresolved 的數目）。
4. 跑 python -X utf8 給AI看的指南/文風節奏檢查.py "${OUT}" 與 python -X utf8 給AI看的指南/高難度檢定檢查.py "${OUT}"（後者沒分類那幾條與入口格提醒句的警告不管），報的照規矩修到不報（改了要同步改該版兩節並記進審修紀錄），或在〈待作者定〉說明為何留。
5. git status（只讀）：本流程只該動 ${OUT}。不動 Json/、回讀稿、創作稿、設定檔、角色檔。git 只准讀，不准 stash、checkout、restore、add、commit。
回傳 JSON：out、recommended（label、reason）、unresolved（字串陣列）、rhythm、format、summary（三五句：三版各是什麼、你改了什麼、為什麼建議那版）。`
}

function logicPrompt(r) {
  return `${COMMON}

你是邏輯審（版${r.label}）。審修已經修過規矩與口吻，你只看這場戲的事理通不通：先讀情境包 ${PACKET} 的施工圖與探索事件那一段，再逐格讀 ${r.file}（九個入口每個都要讀，順序不定也要通）。
${unitHead(UNIT)}

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

log('箱庭：整理情境包')
const havePacket = A.have && A.have.packet
const ok = havePacket ? true : !!(await agent(scoutPrompt(), { label: `scout:${BOX}`, phase: 'Scout', effort: 'xhigh', model: MODEL }))
if (!ok) return { date: DATE, error: 'scout failed' }
const had = (A.have && A.have.drafts) || []
const drafts = (await parallel(LENSES.map(l => async () => {
  if (had.includes(l.tag)) return { label: l.tag, file: draftPath(l.tag), self_check: '（沿用舊 run 的起草稿）' }
  const r = await agent(draftPrompt(l), { label: `draft-${l.tag}:05營地箱庭`, phase: 'Draft', effort: 'xhigh', model: MODEL, schema: DRAFT_SCHEMA })
  return r ? { label: l.tag, ...r, file: draftPath(l.tag) } : null
}))).filter(Boolean)
if (!drafts.length) return { date: DATE, error: 'all drafts failed' }
log(`${drafts.length} 版起草稿就位，送審修`)
const revs = (await parallel(drafts.map(d => () =>
  agent(revisePrompt(d), { label: `revise-${d.label}:05營地箱庭`, phase: 'Revise', effort: 'max', model: MODEL, schema: REVISE_SCHEMA })
    .then(r => r ? { label: d.label, ...r, file: revisedPath(d.label) } : null)))).filter(Boolean)
if (!revs.length) return { date: DATE, error: 'all revisions failed', drafts }
const logics = (await parallel(revs.map(r => () =>
  agent(logicPrompt(r), { label: `logic-${r.label}:05營地箱庭`, phase: 'Logic', effort: 'max', model: MODEL, schema: LOGIC_SCHEMA })
    .then(x => x ? { ...r, logic: x, summary: r.summary + '｜邏輯審：' + x.summary } : r)))).filter(Boolean)
log(`邏輯審完成，送終審`)
const fin = await agent(finalPrompt(logics), { label: 'final:05營地箱庭', phase: 'Final', effort: 'max', model: MODEL, schema: FINAL_SCHEMA })
if (!fin) return { date: DATE, error: 'final failed', revs }
log(`提案檔完成，建議版 ${fin.recommended.label}，待作者定 ${fin.unresolved.length} 件`)
return { date: DATE, unit: UNIT.key, out: fin.out, recommended: fin.recommended, unresolved: fin.unresolved, rhythm: fin.rhythm, format: fin.format, summary: fin.summary,
  revisions: revs.map(r => ({ label: r.label, changes: r.changes, unresolved: r.verdicts.filter(v => v.verdict === 'unresolved').length, summary: r.summary })) }
