export const meta = {
  name: 'butterfly-tanshihuai',
  description: '蝴蝶效應第三案・檀石槐線（第二級流程）：兩個箱庭各一份情境包、四個單位各三起草三審修一終審、最後一名連貫檢查',
  phases: [
    { title: 'Scout', detail: '一箱庭一名：情境包寫成檔案，只回一頁摘要' },
    { title: 'Draft', detail: '每單位三名起草，各寫一版進檔案' },
    { title: 'Revise', detail: '每版一名審修：逐項查、能修就修、記錄改動' },
    { title: 'Logic', detail: '每版一名邏輯審（2026-09-28 作者要求加）：誰知道什麼、先後因果、人在哪、東西去哪、前後場接口；直接修，記「邏輯審」' },
    { title: 'Final', detail: '每單位一名終審：再挑錯、標建議版、寫提案檔、跑檢查腳本' },
    { title: 'Merge', detail: '一名連貫檢查：四個單位的共同事實、狀態寫法、接口一致' },
  ],
}

// 用法：Workflow({scriptPath: '.claude/wf/butterfly-tanshihuai.js', args: {date: '2026-09-28'}})
// args.only 只跑幾個單位；args.have 標記哪個箱庭的情境包／哪個單位的起草稿已在 bf3 目錄可沿用；args.mergeWith 傳先前跑完的提案檔路徑。
// 規格：劇情/雲中/@設定_雲中.md §四-1（十四條＋09-28 三條）、劇情/鮮卑王帳/@設定_鮮卑王帳.md、劇情/蝴蝶效應_素材與設計.md 第一節規矩。
const A = Object.assign({ date: '＿＿＿＿-＿＿-＿＿', only: null, have: {}, mergeWith: null, bf: 'C:/Users/user/AppData/Local/Temp/claude/d--QilinStory/1ddf8b7f-8270-48d3-b27d-a5e5e30f3f7a/scratchpad/bf3' }, args || {})
const DATE = A.date
const MODEL = A.model || 'opus'
const BF = A.bf
const SPEC = '劇情/雲中/@設定_雲中.md'
const DUNGEON = '劇情/鮮卑王帳/@設定_鮮卑王帳.md'
const RULES = '劇情/蝴蝶效應_素材與設計.md'

const COMMON = `你在做《異麒麟》蝴蝶效應第三案「檀石槐線」的新戲提案（作者 2026-09-27 定形十四條、2026-09-28 補三條並准開工）。規格：${SPEC} §四與 §四-1（十四條、段落表、寫之前要對的牽扯）、${DUNGEON}（箱庭結構、誰在、任務狀態提案、紅線、未定）、${RULES} 第一節規矩（1-2 引擎硬紅線、1-3 人、1-4 交件前）。本提示只摘要。
- 這條線是什麼：武道大會壓軸堂堂正正打贏（奪冠，拒了褚人飛讓拳、沒拿赤龍幫的錢）的玩家，181 年 2 月起在雲中城門口被那個少一條腿的老兵攔下——家裡的人死在鮮卑手上，官府沒人管，他走不了塞外，聽說你是天下第一，要你替他報仇；沒有錢，你白接。你在城裡追查，查出動手的是哪一部、他們今春紮在北邊、檀石槐本人也在那裡。回頭找老兵，他等不及，自己北上了。你出塞，在半路追到的是他的屍首；沒有人在場，這件事是你自己認下的。到了營地，四選一：陣前挑戰（唯一算董卓放行第一層功績的路）／下毒（張寧在隊才有）／賣給黑狼拿錢／不去。檀石槐正當盛年、沒病；鮮卑是尋常外邦人，全線人打人；娜娜不表態只認星；IsHidden4（釣魚叟那顆未卜）只在營地外圍開一條混進去、不打的路。
- 形狀：第二章的一票開一條線；入口只讀一次，而且不進 JSON（作者在 Unity 事件系統設奪冠條件、自己調用入口 title），所以**每個對話的入口格都不掛 Conditions、不寫 title**，入口格的 Description 只寫一句給作者的提醒「入口條件作者設：武道大會奪冠、181/2 起、支線」（作者 2026-09-28 准的例外，只限入口格；其餘格 Description 照詞表）。線裡靠自己的任務號走，不回頭再讀奪冠。
- 引擎硬紅線：不新建變數、不新建任務、不自取名字（任務號、entry、箱庭名、地圖點、戰鬥 ID、檢定難度、老兵與檀石槐的 actorID 一律留 ＿＿ 給作者）；SetFlag／GetFlag 禁用；只讀既有的 IsHidden4、IsInTeam；新格不編號、不寫 title；Description 只寫 劇情/轉成json指南.md §1 詞表標籤（入口格那一句例外）；四軸 DnDAlignment 不寫（作者定稿時定）。
- 人：累積的是人，各自結算，沒有總分；症狀不給數字；沒有一個人替主角下結論——娜娜不表態、張寧不勸、黑狼不評論、旁白不評論四條路；「最好」是玩家的最好，不是俠的最好。
- 內容三道線：世界觀第八節禁詞（五胡亂華、司馬、篡魏、三國歸晉、輪迴、重來、前世）；角色口中不出「凶戾」「人祭」；雲中的路人不講首領名字、不講戰況、不講朝廷敗績、不講「天下要亂了」（邊患是天氣）——本線的人物（老兵、娜娜、黑狼、你）可以講檀石槐的名字，因為他是題目。檀石槐不病、不老、不邪，不寫他的內心、來歷、對漢人的看法；老兵的屍首不寫死狀、不寫誰動的手、不寫遺言；不去的玩家遊戲裡不提他死了。
- 共同事實（四個單位都照這個寫，作者定稿時可改；起草者不得另定）：老兵＝城門口收過路錢、少一條腿的那個（街道 #1），177 年那一萬騎回來的幾十個之一，沒有名字，說話者行寫「老兵」、actorID 留 role＿＿；家裡死的是他兒子，180 年冬鮮卑寇邊那一回死的（遊戲裡沒演，一句帶到，不寫怎麼死的）；線索＝動手的是西部一部的人、今春紮在北邊幾日路的草原、檀石槐本人也在；老兵自己北上、死在半路；黑狼獵隊在營地外圍那片坡上、暫定黑狼王 MC11 親領（奪冠玩家第一次見他）；娜娜在隊才出現、只認星認路；張寧在隊才有下毒。
- 稿的寫法（創作稿）：說話者行 **旁白:**／**你:**／**〈角色〉:**（主角一律「你」），旁白 [panel=6]＊（…）＊，台詞「…」；每格底下 - actorID: / - Sequence: / - Conditions: / - Script: / - Description: 有才寫，各一行；新格用【A】【B】…標，不編號；選單照 劇情/轉成json指南.md §4.2；擲骰、戰鬥、轉場、尾格照 劇情/轉成json指南.md 與 給AI看的指南/擲骰指令轉換規則.md 的固定寫法（情境包有抄）；沒有立繪的角色不寫 SetPortrait。不動 Json/、不動 Unity、不動回讀稿與設定檔的文字。
- 文風規矩（違反即退）：1. 旁白看得見你做什麼、看不見你想什麼：不寫內心話、不替玩家下感受或結論、不替角色斷定心裡怎樣（「倒像」「像是」可以）。2. 寫結果和狀態，不寫過程；一格裡同一個人的動作最多兩拍；不編精確數目、距離和純造景小細節。3. 作者退過的句型不得再犯：「不是 X，是 Y」翻轉句；否定句收尾造氣氛；「像……」比喻巧句收尾；收尾加新判語；旁白先把下一格台詞要講的事講掉；選項已經講過的事旁白再講一遍；同一件事隔幾格又講一遍。4. 句子寫完整，不斷碎句：旁白一格兩三句、每句十九到二十五字、不留五字以下的句子；角色台詞一句十五字上下，照那個角色既有的口吻。5. 旁白裡不寫「」引號；**全篇不用破折號「——」，台詞也不用**（打斷、沒說完用「……」；文風指南旁白卡第 9 條）。[em7] 每十格至多一個、同一人不連掛、[/em7] 後必接標點。6. 玩家看得到的字不自創單字名詞；東漢稱謂與用詞（不用「老爺子」）。
- 省回合的規矩：情境包已收好規格原文、範本格、每條來路、既有台詞、指南摘錄，先讀它；只在拿不準時回原檔查那一段，不要整本重讀。日期一律寫 ${DATE}。給作者看的話用白話短句，不用自創術語。`

const LENSES = [
  { tag: '甲', name: '照規格最少', brief: '貼著規格與共同事實，格數最少、差別最集中：每一拍只做規格點名的事，不加人物、不加物件。偏離規格處在自檢講明。' },
  { tag: '乙', name: '接戲', brief: '先把情境包裡本箱庭的既有句、前後場的嗓子讀順，再寫出唸起來最順、最像這個遊戲原本嗓子的版本；格數可以比甲多兩三格，但一定要守規格與共同事實。' },
  { tag: '丙', name: '另一種演法', brief: '在規格與共同事實範圍內刻意換一種演法，讓作者有真的不一樣的選擇：換誰先開口、換一個看得見的動作或物件、換拍子的順序；仍守全部規矩。若另一種演法明顯更差，照樣給出最好的不同版本並在自檢說明。' },
]

const UNITS_ALL = [
  {
    key: '01委託', box: '雲中',
    out: '劇情/檀石槐線_01委託.md',
    json: 'Json/探索事件/181年/2月.json（新檔，一個對話；入口格無條件、無 title；181 年探索事件資料夾目前不存在）；稿件之後落在 劇情/181年事件/02月(支)老兵的委託.md（暫名）',
    overview: '劇情/雲中/@設定_雲中.md 全檔（§一 177 那一仗、§二 三條、§四 舊案、§四-1 十四條與段落表）；劇情/179年事件/11月(主)北邊起煙.md（鮮卑當天氣的寫法）；劇情/180年事件/09月(主)填補赤字結算、重陽.md §4 呂信望北',
    anchors: '新對話。入口格（旁白，城門口）→ 老兵攔你 → 委託 → 選項接／不接（不接＝收尾、線收）→ 接了：SetQuestState("CF＿＿", "active"); → 轉場（幾日）→ 追查（旁白概括結果，不寫過程；線索三件：西部一部、今春紮在北邊、檀石槐本人也在；誰講出名字由起草定，路人不講）→ 回頭找老兵，城門口沒人，一句帶到他自己往北去了 → 你出北門 → 尾格 MapLock(＿＿, unlock); 解鎖箱庭',
    cond: '（無。入口條件在 Unity 事件系統。）',
    voices: '老兵（新寫，role＿＿，無立繪；口吻＝邊城老卒，短句可以但不碎，不哭不求）；你 MC1；旁白 role2；在隊同伴可各一句掛 IsInTeam（娜娜 MC22、呂信 MC2、張寧 MC6、郭嘉 MC7 擇一二，不必全上）；雲中路人若開口照 街道.json 既有句的嗓子、不講首領名字',
    spec: `- 這一場做三件事：委託、追查、他走了。三件事在同一個對話裡，用轉場分開。
- 委託：他知道你是天下第一（武道大會 #657 褚人飛「名號明日響遍并州」是來由，戲裡一句帶到即可，不重講大會）。家裡死的是兒子，180 年冬那一回；官府沒人管（街道 #4175 那句世道）；他走不了塞外；要你替他報仇。沒有錢，這一點要從戲裡看得出來（他給不起，或他拿出來的東西你不收——版本可不同）。
- 選項：接／不接。接＝任務 active；不接＝一兩格收尾，線收在這，之後不再問。選項文字是主角的話，照 §4.2。
- 追查：接了之後轉場。旁白寫結果不寫過程（問了誰、走了幾家不寫）。線索三件寫清楚；檀石槐的名字在這一場第一次出現，由誰說出來起草定（娜娜、呂信、馬販、老兵都可以，路人不行）。
- 他走了：你回頭要跟他說線索或要出發，城門口沒人；一句帶到他前兩天自己往北去了（誰說的起草定）。你出北門。尾格 MapLock(＿＿, unlock);。
- 文化分支可加一格（IsCultureFit("Player", "Xianbei") == true;，照 §4.4 的形、Description 寫「文化分支：鮮卑」）：主角自己是鮮卑人時老兵那一眼；不做主線分岔，不加也可以。
- 入口格 Description：「入口條件作者設：武道大會奪冠、181/2 起、支線」。其餘格照詞表。
- 設計端連帶：無。`,
    checks: [
      '形狀：一個對話三件事（委託、追查、他走了），轉場分開；入口格無 Conditions、無 title、Description 只有那一句提醒；尾格 MapLock(＿＿, unlock)',
      '共同事實：老兵＝街道 #1 那個、沒名字、兒子 180 冬死；線索三件；他自己北上；沒有錢',
      '選項：接／不接是主角的話；不接有收尾、之後不再問；接了寫 SetQuestState("CF＿＿", "active");',
      '讀法與狀態：沒有新變數、新任務名、title；只可能讀 IsInTeam／IsCultureFit；Description 在詞表內（入口格例外）',
      '雲中三條：路人不講首領名字、不講戰況、不講朝廷敗績、沒有人說天下要亂；老兵不哭不求、不講朝廷',
      '動機先於機制：他為什麼找你（天下第一、官府沒人管、他走不了）、你為什麼接（戲裡看得出來，不用旁白解釋）',
      '文風規矩 1–6 與聲口：旁白卡、主角卡、老兵新嗓子、同伴既有句；em7 每十格至多一個',
      '設計端連帶：無，design_notes 寫（無）',
    ],
  },
  {
    key: '02半路', box: '塞外',
    out: '劇情/檀石槐線_02半路.md',
    json: '塞外箱庭第一個對話（新檔，檔名與入口 title 作者定；入口格無條件）',
    overview: `${DUNGEON} 段一；劇情/雲中/@設定_雲中.md §四-1；七夕 主線事件/180年/7月.json #39、#48、#52（娜娜認星原話）`,
    anchors: '新對話。入口（草原，出塞第幾日不寫數）→ 路邊的屍首是老兵 → 你做的事（埋、帶走什麼或不帶）→ 沒有人在場、你自己認的（旁白只寫動作；可以有你對死人說的一句，不是內心話）→ 娜娜在隊：認星一格（IsInTeam("MC22") == true;）；沒帶她：旁白一句你照北邊那顆不動的星走 → 尾格',
    cond: 'IsInTeam("MC22") == true; 只用在娜娜那一格；其餘無條件',
    voices: '你 MC1；旁白 role2；娜娜 MC22（在隊才出現；只認星認路、不表態；口吻照她的聲口卡與七夕既有句）；其他同伴在隊可各一句掛 IsInTeam，不評論',
    spec: `- 這一場只做一件事：他死了，你把這件事認下來。短，六到十格。
- 屍首：不寫死狀、不寫誰動的手、不寫遺言、不寫他帶了什麼武器；寫你認出是他（少一條腿是現成的認法）。
- 你做了什麼：埋，或別的看得見的動作；一格最多兩拍。沒有人在場的意思是沒有委託人、沒有他的家人，同伴可以在，但沒有一個人替你說「你要替他去」；你也不宣布。
- 娜娜認星：她七夕那句「就那顆不動的」是原話，這裡不重講故事，只認路。她不問你要不要去、不講鮮卑。
- 沒帶娜娜：旁白一句你照北邊那顆不動的星走，不解釋你怎麼會認。
- 尾格照規矩（DisableDialogueBG、Continue）。不寫任務狀態。
- 設計端連帶：無。`,
    checks: [
      '形狀：六到十格；只做「他死了、你認下」一件事；入口格無條件無 title；尾格照規矩',
      '共同事實：是那個老兵（少一條腿）、他自己北上死在半路；不寫死狀、誰動的手、遺言',
      '你自己認的：旁白只寫你做了什麼；沒有內心話；沒有人替你下結論；你不宣布',
      '娜娜：只在 IsInTeam("MC22") == true; 那一格；只認星認路；不表態；沒帶她的旁白版有',
      '讀法與狀態：沒有新變數、新任務、title；不寫任務狀態；Description 在詞表內',
      '文風規矩 1–6 與聲口：旁白卡、主角卡、娜娜卡與七夕既有句；em7 每十格至多一個',
      '每條路：有娜娜／沒娜娜兩條都接到同一個尾格',
      '設計端連帶：無，design_notes 寫（無）',
    ],
  },
  {
    key: '03營地外圍', box: '塞外',
    out: '劇情/檀石槐線_03營地外圍.md',
    json: '塞外箱庭第二個對話（新檔，檔名與入口 title 作者定；入口格無條件）；戰鬥一場次 ID 留 ＿＿',
    overview: `${DUNGEON} 段二與〈誰在〉；劇情/舊創作稿/高難度檢定_釣魚叟.md〈✅ 定稿〉（IsHidden4 那段的原話）；主線事件/180年/3月.json #146、#147（娜娜介紹黑狼氏族與黑狼王）；黑狼王 52 句既有台詞`,
    anchors: '新對話。入口（坡上，看見營：帳、馬群、旗、哨騎；不報數目）→ 黑狼獵隊在同一片坡上（黑狼王 MC11 暫定親領；他的話只到「你要是進去看清楚了，本王出錢買」，不逼不勸）→ 進營地選單：打哨騎（戰鬥一 BeginFight(Combat,＿＿)；勝→進；敗→ShowEnding(Ending_1)）／混進去（選項掛 Variable["IsHidden4"] == true;，照釣魚叟那套：替他們放馬、放到看慣了你；旁白寫結果不寫過程，不打）→ 進了營：SetQuestEntryState("CF＿＿", 1, "success"); → 看見他（盛年；旁白只寫看得見的：他在人群裡、在馬上或在弓前；不寫他是什麼樣的人）→ 尾格',
    cond: 'Variable["IsHidden4"] == true; 只用在混進去那個選項；IsInTeam("…") 只用在同伴的一句',
    voices: '你 MC1；旁白 role2；黑狼王 MC11（本王、小子、哼哈哈、腳翹案上那一路；52 句既有台詞；他不替主角做決定、不評論四條路）；鮮卑哨騎無立繪、可以不開口；同伴在隊可各一句掛 IsInTeam；檀石槐這一場不開口',
    spec: `- 這一場做三件事：看見營、遇黑狼、進去。
- 黑狼王：奪冠玩家第一次見他，要讓沒見過他的玩家知道他是誰（他自報「朔方黑狼」或旁白一句塞外皮袍，照他 9 月 #4353 那句的樣子）。他跟鮮卑世仇，盯著這個營；他開價只到一句，不解釋要拿去做什麼；他不問你為什麼來。
- 進法兩條：打哨騎是一般路；混進去只給 IsHidden4 的玩家，選項文字是主角的話，做法照釣魚叟講的（放馬、放到看慣了），旁白概括結果，不寫幾天、不寫怎麼混。兩條都接到「進了營」那一格。
- 戰鬥一照固定寫法：SetContinueMode(false);BeginFight(Combat,＿＿);SetContinueMode(original)@Message(EndFight);Continue()@Message(EndFight); 勝敗兩格 IsPassFight；敗＝ShowEnding(Ending_1)。
- 看見他：一到兩格旁白。正當盛年，看得見的東西（人、馬、弓、身邊的人怎麼讓路）；不寫年紀數字、不寫他的眼神在想什麼、不寫他的來歷。名字這一場可以由旁白點出（你認出這就是那個人），也可以留到下一場。
- 尾格照規矩。
- 設計端連帶：無。`,
    checks: [
      '形狀：看見營、遇黑狼、進去三件事；兩條進法都接到「進了營」；入口格無條件無 title；尾格照規矩',
      '共同事實：黑狼王親領（暫定）、開價只到一句、不逼不勸；哨騎不報數目；檀石槐盛年、不開口',
      'IsHidden4：混進去那個選項掛 Variable["IsHidden4"] == true;，照釣魚叟原話那套，不打；沒有 IsHidden4 的玩家看不到這條',
      '戰鬥一：固定寫法、場次 ID 留 ＿＿、勝敗兩格、敗＝ShowEnding(Ending_1)',
      '讀法與狀態：進了營寫 SetQuestEntryState("CF＿＿", 1, "success");；沒有新變數、新任務名、title；Description 在詞表內',
      '看見他：只寫看得見的；不寫內心、來歷、對漢人的看法；不病不老不邪',
      '文風規矩 1–6 與聲口：黑狼王既有句、旁白卡、主角卡；em7 每十格至多一個',
      '設計端連帶：無，design_notes 寫（無）',
    ],
  },
  {
    key: '04誅', box: '塞外',
    out: '劇情/檀石槐線_04誅.md',
    json: '塞外箱庭第三個對話（新檔，檔名與入口 title 作者定；入口格無條件）；戰鬥二場次 ID、巧手難度、錢數留 ＿＿',
    overview: `${DUNGEON} 段三、〈任務與狀態〉、〈紅線〉；劇情/雲中/@設定_雲中.md §四 ④ 那一格（「最好」是玩家的最好，旁白不評論）與 §四-1 第 10、13、14 條；@角色設定/張寧.md 毒草那兩行；黑狼王既有台詞`,
    anchors: '新對話。入口（營裡，你到了能看見他、也能走到他跟前的地方）→ 四選一選單（§4.2；下毒那條掛 IsInTeam("MC6") == true;）→ ①陣前挑戰：叫陣一兩格 → 戰鬥二 BeginFight(Combat,＿＿) → 勝：你殺了他，SetQuestEntryState("CF＿＿", 2, "success"); SetQuestState("CF＿＿", "success"); → 轉場回雲中 → 尾格；敗：ShowEnding(Ending_1) → ②下毒：張寧給草一格（不勸不攔）→ 巧手擲骰 BeginDiceRoll(Manual,SleightOfHandCheck,＿＿) → 過：他夜裡死了、沒有人知道是你，SetQuestEntryState("CF＿＿", 3, "success"); SetQuestState("CF＿＿", "success"); → 回雲中；不過：被察覺，戰鬥一那組 BeginFight(Combat,＿＿)，勝→逃回雲中 SetQuestState("CF＿＿", "failure");，敗→ShowEnding(Ending_1) → ③賣給黑狼：回坡上，把路與時辰講了，ModifyData(Coin,Player,＿＿); SetQuestEntryState("CF＿＿", 4, "success"); SetQuestState("CF＿＿", "success"); → 回雲中（黑狼動不動手暫定不演）→ ④不去：轉身一兩格，SetQuestState("CF＿＿", "failure"); → 回雲中；遊戲裡不提他死了',
    cond: 'IsInTeam("MC6") == true; 只用在下毒那個選項；IsPassFight／IsPassDice 照固定寫法；其餘無條件',
    voices: '你 MC1；旁白 role2；檀石槐 role＿＿（無立繪；可以不開口；若開口只有幾個字或經通譯，不發明鮮卑語詞）；張寧 MC6（在隊才有；給草那格不勸不攔，口吻照她的聲口卡）；黑狼王 MC11（賣那條回坡上見他；數錢、不評論）；同伴在隊可各一句掛 IsInTeam，沒有一個人替主角下結論',
    spec: `- 這一場做一件事：四選一，四條各自收尾。旁白不評論任何一條；沒有一條寫成對的或錯的。
- 選單四條選項文字都是主角的話，照 §4.2；順序：挑戰、下毒、賣給黑狼、不去。下毒那條掛 IsInTeam("MC6") == true;。
- 挑戰：叫陣的話由你說，他可以不答（讓路、下馬、拿兵器都是回答）；戰鬥二固定寫法；勝了之後一到兩格旁白寫結果（他倒了、營裡的人怎麼動），不寫你的感受；你殺了他這件事要看得見。
- 下毒：張寧給草一格，她不勸不攔、不問你為什麼；巧手擲骰固定四段寫法，難度 ＿＿；過了旁白寫結果（夜裡、他死了、營裡沒人知道是你），不寫過程；不過＝被察覺，打哨兵那組，勝了逃回、任務 failure。
- 賣給黑狼：回坡上找他；你講的是路與時辰，不講老兵的事；他數錢那一格收；錢數 ＿＿；不演他動不動手。
- 不去：轉身；一到兩格；沒有人問你為什麼；任務 failure；遊戲裡不提他死了。
- 四條都轉場回雲中（四段轉場固定寫法），各自尾格；不寫 GameDate。
- 四軸 DnDAlignment 一律不寫（作者定稿時定），在〈待作者定〉列一條。
- 設計端連帶：一句給 劇情/故事大綱.md §5-5 廣 1：董卓放行第一層讀 CurrentQuestEntryState("CF＿＿", 2) == "success"（陣前打贏那一項）。這句不進遊戲文本。`,
    checks: [
      '形狀：四選一在同一個選單；四條各自收尾、各自轉場回雲中；入口格無條件無 title',
      '共同事實與十四條：檀石槐盛年不病；只有陣前打贏算功績（entry 2）；下毒得手不算（entry 3）；賣給黑狼拿錢（entry 4）；不去＝failure、不提他死；娜娜不表態、張寧不勸、黑狼不評論',
      '選項：四條都是主角的話；下毒掛 IsInTeam("MC6") == true;；順序挑戰、下毒、賣、不去',
      '戰鬥與擲骰：戰鬥二與哨兵戰鬥固定寫法、場次 ID 留 ＿＿、敗＝ShowEnding(Ending_1)；巧手擲骰四段寫法、難度 ＿＿、IsPassDice 兩格',
      '讀法與狀態：任務號與 entry 全留 ＿＿；每條收尾的 SetQuestState／SetQuestEntryState 照設定檔〈任務與狀態〉；沒有新變數、title；四軸不寫；Description 在詞表內',
      '旁白不評論：沒有一條路被寫成對或錯；沒有人替主角下結論；殺了他那一格看得見結果、看不見感受',
      '文風規矩 1–6 與聲口：張寧卡、黑狼王既有句、旁白卡、主角卡；檀石槐不開口或只幾個字；em7 每十格至多一個',
      '設計端連帶：只有給故事大綱 §5-5 廣 1 的那一句；不進遊戲文本',
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
  return `單位：${u.key}｜箱庭情境包：${packetPath(u.box)}
JSON 去處：${u.json}
要讀的設定與範本（只讀不改）：${u.overview}
骨架（錨點）：${u.anchors}
讀的條件：${u.cond}
聲口：${u.voices}
規格：
${u.spec}
本單位八項檢查：
${u.checks.map((c, i) => `${i + 1}. ${c}`).join('\n')}`
}

const DRAFT_FILE_FORMAT = `檔案結構（每節都要有，沒有內容寫「（無）」）：
# 起草稿｜〈單位〉｜〈甲乙丙〉（〈取向名〉）
## 取向（一句）
## 讀的條件（逐行；沒有寫（無：入口條件在 Unity 事件系統））
## 骨架（逐拍：這一拍做什麼、幾格；選單在哪、分岔在哪、各條接到哪）
## 寫的指令（Script／Sequence 裡的任務狀態、MapLock、戰鬥、擲骰、轉場逐行，含留白的 ＿＿）
## 戲（創作稿本體：每格 說話者行＋全文，底下 actorID／Sequence／Conditions／Script／Description 有才寫；新格用【A】【B】…標；分岔 ▶；合流「→ 接【X】」）
## 設計端連帶（那一句，寫給哪個檔；沒有寫（無））
## 起草者自檢（逐條對照八項檢查與文風規矩 1–6；節奏檢查的結果貼這裡）`

function scoutPrompt(box, units) {
  const yun = box === '雲中'
  return `${COMMON}

你是箱庭「${box}」的情境整理，只讀不改專案檔。本箱庭這一批要寫的單位：
${units.map(u => '\n---\n' + unitHead(u)).join('\n')}

請把情境包寫成檔案 ${packetPath(box)}（用 Write；目錄不存在就建）。內容（純事實、逐字原文，不提改法）：
1. 規格原文：逐字抄出 ${SPEC} §一、§二、§四（含 ⚠ 兩件事別混、鮮卑尋常外邦人）、§四-1 全節（十四條、段落表、委託人、寫之前要對的牽扯）；${DUNGEON} 全檔；${RULES} 第一節 1-2、1-3、1-4。
2. 範本格（逐字，含 Sequence／Script／Conditions／Description／links）：${yun
    ? 'Json/探索事件/180年/3月.json 甄家投資那一段 #4157 起到 #4218（一個探索事件從入口到 MapLock 解鎖、開任務的完整樣子）與赤龍幫 #4148 起到 #4147；Json/主線事件/179年/11月.json 全場 14 格（北邊起煙：鮮卑當天氣的寫法、音樂音效怎麼掛）；Json/大地圖/雲中/街道.json #1、#4175、#4106、#4108 與 對話氣泡.json 全部；Json/主線事件/180年/9月.json #4391–#4394（重陽呂信望北）；Json/大地圖/天下第一武道大會.json #652–#659 與 #794、#802（奪冠的說法）；Json/主線事件/181年/1月.json 最後五格（年關怎麼收、GameDate 跳 181/2 那格）。'
    : 'Json/呂信線/五原障.json 的 #442、#70、#3120、#1005–#1008、#608–#611、#3127、#3123（轉場、LoadLevel、戰鬥固定寫法、勝敗兩格）；Json/主線事件/180年/7月.json #36–#52（七夕娜娜認星整段）；Json/主線事件/180年/9月.json #4353–#4357、#212–#272（黑狼王出場與對質整段）；Json/主線事件/180年/3月.json #146、#147、#182（娜娜介紹黑狼氏族與黑狼王）；Json/大地圖/翠影潭.json 釣魚叟 #49 一帶，並整段抄 劇情/舊創作稿/高難度檢定_釣魚叟.md〈✅ 定稿〉的〈戲〉（【D】–【H】原話）；任一份有 ShowEnding(Ending_1) 的戰敗收尾格與其前一格；任一份四段轉場的四格原文。'}
3. 每個範本裡的固定寫法各抄一次：入口格、尾格（actorID 0、text ""、DisableDialogueBG();Continue();）、四段轉場、戰鬥四件套、擲骰四段（BeginDiceRoll(Manual,<Check>,N) 那一組與 IsPassDice 兩格）、選項格（§4.2 的形、Description 選項1…）、MapLock、SetQuestState／SetQuestEntryState、IsInTeam 條件的原樣字串（去 Json/ 裡 grep 一個實例逐字抄，含引號與空格）、IsCultureFit 的原樣字串（劇情/轉成json指南.md §4.4）。
4. 聲口：本批每個會開口的角色，跑 python -X utf8 給AI看的指南/既有台詞.py 撈 ${yun ? '赫連娜娜、呂信、張寧、郭嘉 各十五句代表句（優先撈 181 年與雲中街上的）；茶博士不用' : '黑狼王 全部 52 句、赫連娜娜 十五句（含七夕整段）、張寧 十五句（含她講藥草的）、呂信 十五句（含五原障 #953、#36、重陽 #4392、#4393）'}；主角 MC1 十句（選有動作的）。老兵與檀石槐沒有既有句，註明「新寫」。
5. 設定：@角色設定/赫連娜娜.md 聲口段與〈稱謂〉那條；@角色設定/張寧.md 全檔前段與毒草那兩行；@角色設定/呂信.md 177 年那一條；${yun ? '@角色設定/郭嘉.md 口癖那條（先講在場的是什麼人）；' : '@角色設定/黑狼王.md 若存在則全檔；'}劇情/故事大綱.md §5-5 廣 1 那一列原文（董卓放行兩層）；給AI看的指南/世界觀.md 第 275 行前後（尋常外邦人）。
6. 每個單位特別要查的事實：${yun
    ? 'Json/探索事件/ 底下有沒有 181年 資料夾（沒有就寫沒有）；探索事件 JSON 的頂層是陣列還是物件、第一格欄位順序；街道 #1 那句老兵的原文；#4175 的 role15 是誰（路人）；雲中對話背景圖 ID（給AI看的指南/畫面指令轉換規則.md 城鎮那一列）；BGM 對照表裡北邊起煙用的 BGM_23 與 Others_HeavyColdWind 那兩行原文。'
    : '對話背景圖 ID 野外那一列原文（Grassland、Wilderness）；擲骰指令轉換規則 巧手那一列（SleightOfHandCheck、SleightOfHand）與四段寫法原文；ModifyData(Coin,Player,N) 的實例一則；黑狼王 MC11 立繪格號與可用表情特效；娜娜 MC22 與 MC22-2 的規矩（2026-09-21 起露角版寫法）；張寧 MC6 立繪格號。'}只寫事實。
7. 指南摘錄（作者 2026-09-26 准：起草者只讀情境包，視同讀過三份指南，所以這一節要抄齊）：逐字抄出 給AI看的指南/文本創作指南.md 第零層高概念那幾段、0.1、0.2.2、0.6、2.1a 全節；給AI看的指南/世界觀.md 第八節全節；給AI看的指南/武俠文風創作指南.md〈零、常犯十條〉整節（**放在情境包最前面，起草者先看錯例再動筆**）、第四節開頭通則、旁白卡、你（主角）卡、本批每個出場角色的聲口卡（沒有卡的角色註明「無卡，照第 4 項既有句」）、7.1a–7.1c、7.3、第八節自檢清單；劇情/轉成json指南.md §1 Description 詞表全表、§3 尾格與轉場那幾條、§4.2 開頭的通則與選項文字規矩、§4.4；給AI看的指南/擲骰指令轉換規則.md 四段寫法與常用檢定 ID 表；給AI看的指南/立繪指令轉換規則.md 裡本批出場角色可用的 pic 格號與表情特效名稱、2.1 沒有立繪的角色不寫 SetPortrait。
寫完檔案後，回傳一頁摘要（兩千字內）：每個單位的骨架、會開口的角色與 ID、固定寫法在情境包哪一節、你發現起草者一定要知道的坑。摘要是給下游看的目錄，細節都在檔案裡。`
}

function draftPrompt(u, lens) {
  return `${COMMON}

你是起草者（${lens.tag}｜${lens.name}）。你的取向：${lens.brief}
${unitHead(u)}

做法（作者 2026-09-26 裁示，省回合）：只讀情境包 ${packetPath(u.box)}。**先把它最前面的〈常犯十條〉錯例對改例讀一遍再動筆**（作者 2026-09-28）。它的〈指南摘錄〉一節已逐字收了三份指南與各轉換規則裡寫這場戲用得到的節，**讀情境包即視同讀過 CLAUDE.md 要求的三份指南，不必再開指南原檔**。起草只管寫戲：**不回 JSON、回讀稿查連線**，固定寫法照情境包第 3 節抄。只有情境包真的缺了寫戲非要不可的東西時，才去原檔讀那一段，並在〈起草者自檢〉記一筆缺了什麼。不要改任何專案檔。
把稿寫成檔案 ${draftPath(u, lens.tag)}（用 Write；目錄不存在就建）。
${DRAFT_FILE_FORMAT}
寫完只跑一次 python -X utf8 給AI看的指南/文風節奏檢查.py <檔>，照報告修一次就交，不再重跑；報告和你修了什麼貼進〈起草者自檢〉，沒修完的交給審修。
回傳 JSON：file（檔案路徑）、approach（一句取向）、cells（新格幾格）、self_check（三五句：八項檢查哪幾項你自己拿不準、節奏檢查結果）。`
}

function revisePrompt(u, d) {
  return `${COMMON}

你是審修（版${d.label}）。一人審一版：逐項查，能修的直接修進稿裡，修不了的列出來。
${unitHead(u)}

起草稿：${d.file}（先讀）；情境包：${packetPath(u.box)}（先讀本單位那幾段與第 3 節固定寫法）；起草者的自檢：${d.self_check || '（無）'}

查什麼：
1. 本單位八項檢查逐項：固定寫法對不對（尾格、轉場、戰鬥四件套、擲骰四段、選項格、MapLock、任務狀態）、留白有沒有被人取了名、有沒有新變數、Description 詞表（劇情/轉成json指南.md §1；入口格那一句例外）、共同事實有沒有走樣。
2. 文風規矩 1–6 逐句：內心話、判語、動作鏈、假精確、翻轉句、否定句收尾、比喻巧句收尾、碎句與句長、旁白「」與破折號、em7、單字名詞、時代錯置；口吻對照情境包裡那個角色的既有句（讀 給AI看的指南/武俠文風創作指南.md 第四節旁白卡與本單位角色卡、給AI看的指南/武俠文風審校清單.md）。
3. 本單位另查：${u.key === '01委託' ? '入口格 Description 只有那一句提醒；不接那條有收尾；路人不講首領名字；老兵不哭不求' : u.key === '02半路' ? '沒有內心話；沒有人替你下結論；娜娜只在 IsInTeam 那格、只認星；沒帶她的旁白版有' : u.key === '03營地外圍' ? '混進去只給 IsHidden4；黑狼王開價只一句、不逼不勸；看見他只寫看得見的' : '四條都收尾、都回雲中；只有 entry 2 那條算功績；旁白沒評論任何一條；下毒掛 IsInTeam("MC6")；四軸沒寫'}。
怎麼修：句子、指令、接法能修就直接修，修完那一格仍要守取向（版${d.label}是「${lensName(d.label)}」），不要把它修成別的版；該作者定的不要替作者定，留 ＿＿ 並記下來。
寫成檔案 ${revisedPath(u, d.label)}（結構同起草稿），檔尾加三節：
## 旁白逐格表（作者 2026-09-28 要求：每一個旁白格一行——格名｜第 3 條判語、心事、替玩家下感受：過或改｜第 7 條造景細節、精確數目、動作鏈超過兩拍、收尾巧句：過或改｜改了什麼。不准整段打勾，一格一格重讀；文風節奏檢查.py 列的「旁白卡候選」每一條都要在這張表裡有交代）
## 審修紀錄（每一處改動：第幾格、原句→新句、依哪條規矩）
## 待作者定（修不了或不該由 AI 定的）
修完跑一次 python -X utf8 給AI看的指南/文風節奏檢查.py <檔> 與 python -X utf8 給AI看的指南/高難度檢定檢查.py <檔>。後者是給有檢定的稿寫的：檔頭沒分類、沒有題語那幾條的警告不管；它報的留白、禁詞、Description、em7、title、SetFlag 要處理。不要改任何專案檔。
回傳 JSON：file、verdicts（八項各一筆：check、verdict 是 pass／fixed／unresolved、note 一句）、changes（改了幾處）、summary（三五句：這版最大的問題是什麼、修了什麼、還剩什麼）。`
}

function finalPrompt(u, revs) {
  return `${COMMON}

你是本單位的終審兼編輯。三版已各經一名審修。你的工作：再挑一次錯、標一版建議、寫成提案檔、跑兩支檢查腳本。
${unitHead(u)}

三版審修稿（先全部讀完）：
${revs.map(r => `- 版${r.label}（${lensName(r.label)}）：${r.file}；審修結論：${r.summary}；verdicts：${JSON.stringify(r.verdicts)}`).join('\n')}
情境包：${packetPath(u.box)}

做法：
1. 挑錯：重點放審修最容易漏的：每條路從入口讀到尾格接不接得通（選單每一條、戰鬥勝敗兩邊、擲骰過不過兩邊、有娜娜沒娜娜）、固定寫法有沒有抄錯一個字、留白有沒有被人取了名、共同事實有沒有走樣、三版是不是三個真的不一樣的選擇、有沒有偷偷多問玩家一次、有沒有人替主角下結論。發現就直接改，並記進該版的〈審修紀錄〉（標「終審」）。
2. 建議版：挑一版，理由一句（通過項最多、接戲最順、最合規格）。
3. 寫提案檔 ${u.out}（用 Write；已存在就整檔覆寫）：
   第一行「# 檀石槐線・${u.key}　提案｜創作稿／提案，尚未進 JSON；作者挑版、定稿、轉 JSON 後本檔歸檔」；
   引用區塊：「📝 ${DATE} 三版待作者挑一版；規格見 ${SPEC} §四-1 與 ${DUNGEON}，本檔只放戲。」、JSON 去處、「入口格不掛條件、不寫 title；新格不編號，作者續號」、「**建議版：**」＋理由、「**待作者填：**」（任務號與 entry、${u.key === '01委託' ? '箱庭地圖點 ID（MapLock）、老兵 actorID' : u.key === '02半路' ? '對話檔名與 title' : u.key === '03營地外圍' ? '戰鬥一場次 ID、黑狼是不是黑狼王親領' : '戰鬥二場次 ID、巧手難度、錢數、檀石槐 actorID、四軸寫不寫、賣給黑狼要不要演結果'}，其他留白）；
   三版各一節「## 版一（甲｜照規格最少）」「## 版二（乙｜接戲）」「## 版三（丙｜另一種演法）」：節首列取向、讀的條件、骨架、寫的指令、設計端連帶；「### 戲」放審修稿的〈戲〉；「### 審修紀錄」放該版的紀錄（含你終審的改動）；
   「## 待作者定」：三版的〈待作者定〉合併去重，每條前加 ⚠；
   「## 審修摘要」：每版八項 pass／fixed／unresolved 的數目與剩下的 unresolved 項。
4. 跑 python -X utf8 給AI看的指南/文風節奏檢查.py "${u.out}" 與 python -X utf8 給AI看的指南/高難度檢定檢查.py "${u.out}"（後者沒分類、沒題語的警告不管），報的照規矩修到不報（改了要同步改該版〈戲〉並記進審修紀錄），或在〈待作者定〉說明為何留。
5. 跑 git status（只讀）：本流程只該動這些提案檔：${OUTS.join('、')}（別單位的終審可能同時在寫別的檔）。不動 Json/、回讀稿、創作稿、設定檔、角色檔。git 只准讀，不准 stash、checkout、restore、add、commit。
回傳 JSON：out、recommended（label、reason）、unresolved（字串陣列）、rhythm（節奏檢查最後一行）、format（格式檢查最後一行）、summary（三五句：三版各是什麼、你改了什麼、為什麼建議那版）。`
}

function mergePrompt(outs) {
  return `${COMMON}

你是檀石槐線四個單位的連貫檢查。只讀 Json/、設定檔與情境包，只改下列提案檔。
提案檔：${outs.join('、')}
情境包：${packetPath('雲中')}、${packetPath('塞外')}
若某份提案檔已經有「## ✅ 定稿」一節（作者已挑版），**以那一節為準**，其餘版本不看、不改；還沒定稿的那份，三版都查，但只修戲、不動它的檔頭。

四個單位是一條線，作者會各挑一版，任何組合都要接得起來。逐單位、逐版查：
1. 共同事實：老兵（街道 #1 那個、沒名字、兒子 180 冬死、自己北上）、線索三件、黑狼王親領、娜娜只認星、張寧在隊才有下毒、檀石槐盛年不開口或只幾個字——十二個版本裡有沒有哪一版寫歪、互相打架（例如 01 說是兒子、04 說成女兒；02 已經埋了、03 又提屍首在路邊）。
2. 狀態寫法：01 開任務 active；03 進營 entry 1；04 四條各自的 SetQuestEntryState／SetQuestState 照 ${DUNGEON}〈任務與狀態〉；留白 ＿＿ 沒有被誰取名；沒有新變數；入口格都無 Conditions 無 title；01 尾格 MapLock(＿＿, unlock)。
3. 接口：01 收尾（你出北門）→ 02 入口（草原）；02 尾格 → 03 入口（坡上）；03 尾格（看見他）→ 04 入口（營裡）——場景、天色、在場的人接得上，沒有一場把下一場要做的事先做了。
4. IsHidden4 只在 03 出現；IsInTeam 條件的原樣字串四份一致；固定寫法（尾格、轉場、戰鬥、擲骰）四份一致。
5. 沒有一個人替主角下結論；旁白沒有評論四條路；不去那條沒提他死。
小錯直接修進提案檔對應版的〈戲〉，記進該版〈審修紀錄〉（標「連貫」）；牽動取向或要作者定的列進該檔〈待作者定〉。修完對四檔各跑一次 python -X utf8 給AI看的指南/文風節奏檢查.py。git status 只讀，確認只動了這四份提案檔；不准 stash、checkout、restore、add、commit。
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
    const haveIt = units.some(u => A.have[u.key] && A.have[u.key].packet) || (A.have[box] && A.have[box].packet)
    scoutJobs[box] = haveIt
      ? Promise.resolve(true).then(() => { log(`${box}：情境包沿用 ${packetPath(box)}`); return true })
      : agent(scoutPrompt(box, UNITS.filter(u => u.box === box)), { label: `scout:${box}`, phase: 'Scout', effort: 'xhigh', model: MODEL }).then(r => !!r)
  }
  return scoutJobs[box]
}

async function runUnit(u) {
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

log(`同時開跑：${UNITS.map(u => u.key).join('、')}`)
const results = (await parallel(UNITS.map(u => async () => {
  const ok = await ensurePacket(u.box)
  if (!ok) return { unit: u.key, error: 'scout failed' }
  return await runUnit(u)
}))).filter(Boolean)

let merge = null
const doneOuts = results.filter(r => r.out).map(r => r.out)
const extraOuts = Array.isArray(A.mergeWith) ? A.mergeWith : []
const mergeOuts = [...extraOuts, ...doneOuts]
if (mergeOuts.length >= 2) {
  merge = await agent(mergePrompt(mergeOuts), { label: 'merge:檀石槐線四單位', phase: 'Merge', effort: 'max', model: MODEL, schema: MERGE_SCHEMA })
  if (merge) log(`連貫檢查：${merge.ok ? '沒有問題' : merge.issues.length + ' 個問題（已修 ' + merge.issues.filter(i => i.fixed).length + '）'}`)
} else {
  log('連貫檢查略過：提案檔不到兩份')
}
return { date: DATE, units: results, merge }
