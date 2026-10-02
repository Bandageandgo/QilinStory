export const meta = {
  name: 'luxin-review',
  description: '呂信線五份已轉 JSON、未進 Unity 的稿（英布、渡江、五原障、留信、改名）多 agent 審稿：一名整理事實與指南摘錄 → 每檔四個面向各一名找問題（對話邏輯／劇情與設定／文風與聲口／引擎與轉檔）→ 每檔一名合併、逐條回 JSON 查證、去掉誤報 → 一名總整理寫審稿報告；只寫報告，不改 JSON、不改稿',
  phases: [
    { title: 'Scout', model: 'opus', detail: '一名：五檔的連線與欄位事實（程式掃）、設計端與角色檔摘錄、指南摘錄、已知問題清單，寫成情境包' },
    { title: 'Find', detail: '每檔四名，各看一個面向，讀整份 JSON 與創作稿，回傳結構化問題清單' },
    { title: 'Verify', detail: '每檔一名：合併四份、去重、逐條回 JSON 對原句與規矩，判定錯／該改／可留，寫該檔一節' },
    { title: 'Report', detail: '一名：五節合成 劇情/呂信/審稿_〈日期〉.md，加總覽、已知問題、建議處理順序；另出 findings.json 給審稿頁用' },
  ],
}

// 用法：Workflow({scriptPath: '.claude/wf/luxin-review.js', args: {date: '2026-09-29', only: ['英布'], have: {packet: true}}})
// args.date 必填；args.only 只審幾檔；args.have.packet 沿用既有情境包；args.hc 換暫存目錄。所有 agent git 只准讀，只准寫 scratchpad 與最後那一份報告。
const A = Object.assign({ date: '＿＿＿＿-＿＿-＿＿', only: null, have: {}, hc: 'C:/Users/user/AppData/Local/Temp/claude/d--QilinStory/cd880680-3698-44da-ace1-d31280b60af3/scratchpad/hc' }, args || {})
const DATE = A.date
const MODEL = A.model || 'opus'
const HC = A.hc
const DIR = `${HC}/呂信審`
const PACKET = `${DIR}/packet.md`
const REPORT = `劇情/呂信/審稿_${DATE}.md`
const DESIGN = '劇情/呂信/呂信.md'
const CHAR = '@角色設定/呂信.md'

const FILES_ALL = [
  { key: '英布', json: 'Json/呂信線/英布.json', md: '劇情/呂信/03 英布.md', note: '第 3 支。書房→演武場：賈詡說他像英布，你講不講；§3-2 推正 +1（說實話，好感 −30）／推反 −2（挑好聽的，好感 +30）／不動（反問他）。[panel] 13 格全缺（已知）。' },
  { key: '霸王渡江', json: 'Json/呂信線/04霸王渡江.json', md: '劇情/呂信/04 霸王渡江.md', note: '第 4 支（2026-10-01 定稿，86 格；舊渡江.json 已刪）。前廳日／夜：褚人飛來下委託，談完開口要他；白天有背景武藝檢定與背景洞悉（沒有選單）。夜裡問「霸王渡了江還是霸王嗎」，§6 三個回答都不被採納：「當然是」+1（好感 −10）／「不是了」−2（好感 +20）／「沒人知道」不動。暗對位（項羽／劉邦／英布）全關不得說破。' },
  { key: '五原障', json: 'Json/呂信線/五原障.json', md: '劇情/呂信/05 五原障.md', note: '第 5 支，箱庭，三個入口（#1 書房派差事、#40 廣場可重複點、#100 進箱庭）；外圍→塢牆→水井三區；弓術失敗接強化版戰鬥二，中段複製兩份（#1000 起一般版、#2000 起強化版）；§7-1 老兵殺不殺：放過／帶走 +1、一起殺 −2、賞錢 1500／500；整支跑完好感 +50。佔位最多（LoadLevel、戰鬥二強化版／戰鬥三、CF42 entry 21 處）。馬賊 role57、頭目 role142、老兵 role143。09-28 加了回音 #3131（呂信，LiangzhouHorse）。設定檔 劇情/呂信/@設定_五原障.md。' },
  { key: '留信', json: 'Json/呂信線/留信.json', md: '劇情/呂信/06 留信.md', note: '第 6 支。府散前夜、演武場，最後一次能選：LuxianChose > 3 那句才出現（2026-10-02 改，等於 3 不算），選了還要好感 Lv4 他才答（不到頂回去「跟你信哥喝過幾罈酒，就問這個」落反乙）；三個落點 正／反甲／反乙。讀五原障 entry（算／放／帶 #7／#11）、打輸 #23 附一、雙世冥劍 #26 附二（那支未轉 JSON）。9 個 entry 佔位。' },
  { key: '改名', json: 'Json/呂信線/改名.json', md: '劇情/呂信/07 改名.md', note: '結局，無選項：門口一拍＋近況（正／反甲／反乙讀留信落點 #10／#14／#35）＋結局圖（＿＿）與後日談兩版（四句公評只差最後一句；赤兔只准出現在後日談那一句）。ShowEnding 編號 ＿＿。' },
]
const FILES = A.only ? FILES_ALL.filter(f => A.only.includes(f.key)) : FILES_ALL

const DIMS = [
  { key: 'dialog', name: '對話邏輯', brief: `只看事理通不通（多Agent創作流程.md 3b 那六件事，加兩件）：
1. 誰知道什麼：每一格說話的人、主角、旁白此刻知道的事，是不是前面已經看見或聽見的；沒看見的不能認出、沒聽見的不能回答；同一件事不能認第二次、不能講第二次。跨支也算：這一支假定玩家知道的事，前一支（含已在 Unity 的 01、02、遴選、武道大會、呂之門路）真的演過嗎。
2. 先後因果：先看見才能叫人、先問才有答、先做才有結果；轉場前後時辰、天色、地點接得上；人在哪、誰在場前後一致（尤其五原障三個入口、兩份複製段；留信誰在演武場）。
3. 東西的去向：酒、錢、刀、信、馬、簡牘、家書、贓錢、技能卡——拿出來的有收回或交代，沒有憑空多出來的。
4. 旁白與台詞不打架：旁白不重講台詞剛講的事、不比台詞晚一步才交代台詞已用到的事實；選項文字跟後面的戲對得上；選項是主角的話（actorID MC1）而樞紐格不是。
5. 分支前提：每條分支的前提在那條路上真的成立（讀某個 entry 的那格，那條路上真的寫過）；合流之後的話對每條來路都成立；兩份複製段（五原障）內容是否真的一致、該不一致的地方（強化版）有沒有不一致。
6. 前後支接口：渡江三個回答「都不被採納」，後面有沒有偷偷採納；五原障三個答案「都是真的、不得調解」有沒有被調解；留信讀的東西前面真的寫了；改名讀的落點留信真的寫了。
7. 稱呼與人稱一致：主角喚「信哥」（「師兄」全案只准呂之門路他自嘴臭屁、留信 §3 疏遠選項兩處）；他自稱、他叫主角什麼前後一致；主角標籤 MC1。
8. 重複與空轉：同一句話隔幾格又講一遍；一格什麼都沒推進。` },
  { key: 'story', name: '劇情與設定', brief: `對設計端與設定檔逐條核：
1. ${DESIGN} 第四節結局算法：LuxianChose 初始 2，推正 +1、推反 −2，各支落點是不是寫在對的那格、數值對不對（英布 §3-2、渡江 §6、五原障 §7-1；留信門檻 >3（2026-10-02 改，等於 3 不算）、好感 Lv4 IsFavorabilityLevelPass("MC2", 4)）；有沒有寫在會重複觸發的格（五原障可重複點的樞紐）。
2. 第五節好感：每支的數值與位置對不對（英布 +30／−30、渡江 +20／−10、五原障整支跑完 +50 且關內選項一律不動、留信改名 0）；有沒有多給或漏給；「好感反著給」的方向對不對。
3. 第七節 entry：五原障寫的算／放／帶、打輸、留信讀的，指令與留白 ＿＿ 對得上；不用旗標、不用新變數（SetFlag 禁）。
4. ${CHAR} 與 ${DESIGN} 第九節紅線八條：稱呼信哥；不寫內心話；他不自陳（「我這麼做是為了英豪府」永遠不說）；愛馬只演動作不宣稱、當面弄死馬他話變少不翻臉、不得寫成把馬看得比人重；赤兔只准出現在改名後日談那一句，其餘各支不得提、不得暗示他在等一匹馬；大勢不改（三條結局都府散、都改名呂布、都立取天下之志、世人評價一模一樣，後日談四句一字不差只差最後一句）；隱藏設定（匡扶漢室）本線不揭；title 是作者的。
5. 世界觀第八節禁詞（五胡亂華、司馬、篡魏、三國歸晉、輪迴、重來、前世）；饕餮廢案清單；角色口中不出「凶戾」「人祭」；渡江的暗對位（項羽／劉邦／英布）不得說破。
6. 時代：漢代稱謂與器物（不用「老爺子」那類、不用現代詞），東漢價值觀寫、不加道德評語；五原障設定檔（劇情/呂信/@設定_五原障.md）的地理、戍卒、烽燧與稿子對不對。
7. 高概念：0.1「每一手都管用，沒有一手是俠該用的」——他每一手是不是仍管用；帳上正反（重建英豪府 vs 出人頭地）從戲裡看得出來、沒有旁白替他解釋。
8. 與已在 Unity 的段落接口：01 仗義疏財、02 第三百四十九次（LuxianVar 分四岔）、遴選、武道大會、呂之門路裡他說過的事、給過的東西，這五支有沒有前後矛盾。` },
  { key: 'style', name: '文風與聲口', brief: `逐格過文風規矩（給AI看的指南/武俠文風創作指南.md〈零、常犯十條〉、旁白卡、呂信卡、你卡、7.1a–7.1c、7.3、第八節自檢；給AI看的指南/武俠文風審校清單.md 逐詞查表）：
1. 旁白看得見你做什麼、看不見你想什麼：內心話、替玩家下感受或結論、替角色斷定心裡怎樣。
2. 寫結果和狀態不寫過程；同一人一格最多兩拍；純造景細節、精確數目（數字要有用才寫）。
3. 作者退過的句型：「不是 X，是 Y」翻轉句；否定句收尾造氣氛；「像……」比喻巧句收尾；收尾加新判語；旁白先講掉下一格台詞要講的事；同一件事隔幾格又講一遍。
4. 句子：旁白一格兩三句、每句十九到二十五字、不留五字以下的碎句（呂信線 09-05 起也不碎，碎句只給郭嘉老兵那類——五原障的老兵可碎）；台詞一句十五字上下、可見字數 50 內。
5. 旁白不寫「」引號；全篇不用破折號「——」，台詞也不用（09-28 新規，這五份轉檔時還沒有，會很多，**列出每一處並給改法**）；[em7] 每十格至多一個、同一人不連掛、[/em7] 後必接標點、結論句要接上一句（09-04 起 em7 省著用）；[em2] 用法照既有。
6. 聲口：呂信卡（聽到重點便足矣、臭屁、豪爽、不自陳、只有馬這個題目會囉嗦）與他已在 Unity 的既有句對照；主角卡；老兵、馬賊頭目、褚人飛、賈詡各自的既有句與卡；翻譯腔、現代詞、單字自創名詞、「不縮名詞」（乙類）。
7. 審校清單裡的詞彙紅綠燈逐詞查（把每一處紅燈詞列出，附替換）。
8. 蔡琰旁白寫蔡琰不寫文姬（若出現）；主角說話者標籤一律 MC1 對應「你」。` },
  { key: 'engine', name: '引擎與轉檔', brief: `對 劇情/轉成json指南.md、給AI看的指南/Unity對話同步流程.md、立繪／畫面／音樂／擲骰／戰鬥／貴重品指令轉換規則逐格核：
1. 欄位：entryID 不重複；links 沒有斷鏈（指到不存在的號）、沒有孤兒（沒人指到又不是入口）、沒有兩邊都會播的格；入口格無 Conditions（三個入口的五原障各自）；尾格照 §3（OpenPanel 收面板、DisableAllCharacterExpression、DisableDialogueBG、Continue，links 空）；轉場格照畫面規則 §2.7 在黑幕裡收面板換背景。
2. Description 只准詞表標籤（把不在詞表的逐格列出）；title 不動（AI 不得新增修改刪除，只記錄）。
3. 選項：選項格 actorID MC1、Description「選項N」、文字是主角的話；樞紐格 actorID 0；選項文字照 §4.2；短版選項的發言格把話講完整。
4. 立繪：SetPortrait 的 pic 格號在表裡（MC1 4.1 表 1–19 且 10＝腹黑壓火、15＝調情、14＝累；MC2 呂信五立繪只有 1–5；MC4 賈詡 1–5；role131 之類沒有立繪的不掛 SetPortrait；role142／143／57 未定立繪不掛）；[panel=N] 與 SetPortrait 位置一致（呂信線 五原障 缺 68、留信 29、英布 13、改名 2 全缺是已知，**只數不逐格列**，但錯位的要列）；EnableCharacterExpression 第二參數主角用 Player、其餘用 actorID；表情特效有開有關、下一格關；特效名在表裡。
5. 擲骰：四段包裝（SetContinueMode(false)…BeginDiceRoll(Manual／Auto,〈FeatID〉,難度)）、FeatID 在對照表、IsPassDice 掛分支首格不掛緊接擲骰格那一格、成敗兩邊齊、專長經驗 ModifyData(FeatExp,Player,〈項〉,n) 只給對應項。
6. 戰鬥：BeginFight(Combat,ID) 四段寫法、IsPassFight() 成敗兩邊、打輸走法、戰鬥前後關特效收面板；留白 ＿＿ 照留不自填。
7. 貴重品與錢：ModifyData(Valuable,Player,〈ID〉,〈數量〉) 格式（五原障技能卡 WuYuanHorsemanship、家書 UnsentLetter）、ModifyData(Coin,…) 金額、Description 對應「獲得…」；ID 是既有或已登記待建的。
8. 變數與任務：LuxianChose 寫法 Variable["LuxianChose"] = Variable["LuxianChose"] + 1／- 2 照既有格式；讀的地方寫法（> 3，2026-10-02 由 >= 3 改）；留白 ＿＿（CF42 entry、LoadLevel、戰鬥 ID、結局圖、ShowEnding）照留且不自取名；SetFlag／GetFlag 禁；沒有自創變數；LuxianVar 只在 02 用；回音 #3131 讀 LiangzhouHorse 對不對得上（那是 09-28 加的）。
9. 音樂與畫面：AudioControl 只用音樂規則表既有 ID、PauseLowerMusic／BGM 開關成對；EnableDialogueBG 用既有背景 ID、有開有關；StopAllParticle；@1 槽位用法。
10. 語系：zh_TW＝text 鏡像（缺是已知，只數）、zh_CN（缺是已知，只數）；actorID "2" 應為 role2（已知，只數不逐格列）。
11. 跑 python -X utf8 給AI看的指南/json順序檢查.py <檔> 與 python -X utf8 給AI看的指南/文風節奏檢查.py <檔>，把報的分類記進清單（哪些是真問題、哪些是已知或誤報）。` },
]

const COMMON = `你在做《異麒麟》呂信線五份 JSON 的審稿（作者 ${DATE} 交辦：這五份已轉 JSON、還沒進 Unity，全是作者還沒過稿的，要一次查完對話邏輯、劇情邏輯與各種指南）。**這一輪只找問題、寫報告，不改任何 JSON、不改任何稿、不動設計端與指南**；git 只准讀（status／show／diff），絕對不准 stash、checkout、restore、add、commit、reset。暫存檔只寫在 ${DIR}/ 底下；最後只有總整理那一名寫 ${REPORT}。
- 事實來源：遊戲文案的唯一事實來源是 Json/，審的是 JSON 本身；創作稿 md（劇情/呂信/03–07）只當設計意圖與段落註記的參考，md 與 JSON 不一致時以 JSON 為現況、把不一致列出來。
- 設計端 ${DESIGN}（第二節一句話、第三節七支、第四節結局算法、第五節好感、第七節 entry、第八節 JSON 施工進度與佔位一覽、第九節紅線八條、第十節還沒做的）與人物 ${CHAR} 是判準；設定牴觸時順位：世界觀.md ＞ 角色／地點檔 ＞ 腳本。
- 已知問題（情境包〈已知問題〉一節有全文）不要再當新發現逐格列：旁白 actorID 寫成 "2"（全案是 role2）、[panel] 四檔缺、zh_CN 全缺、zh_TW 缺、佔位 ＿＿ 清單（CF42 entry、戰鬥二強化版／戰鬥三、LoadLevel、結局圖、ShowEnding）、好結局 0% 與各支門重排（設計題 D1／D2）、留信觸發時點、雙世冥劍未轉。這些在報告裡各記一條「已知」加數量即可。
- 每一條問題都要：檔名、entryID（區間也可）、原句（逐字，含標記）、問題一句、建議改法（改字就給新句，改結構就寫怎麼接）、依據（哪份指南哪一節或設計端哪一條）、嚴重度：**錯**（硬紅線、引擎會壞、事理不通、設定矛盾）／**該改**（文風規矩、口吻、句型、破折號、em7）／**可留**（建議、兩可）。不確定的標「疑」，不要硬判。
- 給作者看的話用白話短句，不用自創術語；日期一律寫 ${DATE}。`

const FIND_SCHEMA = { type: 'object', properties: {
  file: { type: 'string' }, dim: { type: 'string' },
  findings: { type: 'array', items: { type: 'object', properties: {
    entry: { type: 'string' }, severity: { type: 'string', enum: ['錯', '該改', '可留', '疑'] },
    quote: { type: 'string' }, problem: { type: 'string' }, fix: { type: 'string' }, basis: { type: 'string' },
  }, required: ['entry', 'severity', 'quote', 'problem', 'fix', 'basis'] } },
  known_counts: { type: 'string' }, summary: { type: 'string' },
}, required: ['file', 'dim', 'findings', 'known_counts', 'summary'] }
const VERIFY_SCHEMA = { type: 'object', properties: {
  file: { type: 'string' }, section: { type: 'string' },
  kept: { type: 'integer' }, dropped: { type: 'integer' },
  by_severity: { type: 'object', properties: { 錯: { type: 'integer' }, 該改: { type: 'integer' }, 可留: { type: 'integer' }, 疑: { type: 'integer' } }, required: ['錯', '該改', '可留', '疑'] },
  top: { type: 'array', items: { type: 'string' } }, summary: { type: 'string' },
}, required: ['file', 'section', 'kept', 'dropped', 'by_severity', 'top', 'summary'] }
const REPORT_SCHEMA = { type: 'object', properties: {
  report: { type: 'string' }, findings_json: { type: 'string' }, total: { type: 'integer' },
  by_file: { type: 'array', items: { type: 'string' } }, order: { type: 'array', items: { type: 'string' } }, summary: { type: 'string' },
}, required: ['report', 'findings_json', 'total', 'by_file', 'order', 'summary'] }

function scoutPrompt() {
  return `${COMMON}

你是情境整理，只讀不改專案檔。把後面二十幾名審稿 agent 都需要的東西寫成一份情境包 ${PACKET}（用 Write；目錄不存在就建）。內容（純事實、逐字原文，不提改法）：
1. 五檔事實（用 Python 掃每一份 JSON，逐檔一張表）：${FILES.map(f => f.json).join('、')}——節點數、entryID 區間與號段（五原障 #1000／#2000 複製段）、入口格（沒有 parent 的）、尾格（links 空的）、斷鏈、孤兒、重複 ID、兩邊都會播的格（同一 parent 底下多個無 Conditions 的子格）、每個 actorID 的格數與 [panel] 覆蓋率、Conditions 全列（原文＋格號）、Script 全列（原文＋格號）、Sequence 裡的 SetPortrait 每個 actor 用到的 pic 號、表情特效名稱清單、AudioControl／EnableDialogueBG／MapLock／LoadLevel／BeginFight／BeginDiceRoll／ModifyData 全列（原文＋格號）、title 有值的格、Description 不在詞表的格、text 含「——」的格數、[em7] 數與每十格密度、zh_TW／zh_CN 覆蓋數、可見字數超過 50 的台詞格、五字以下句號收尾的旁白句（碎句）。另跑 python -X utf8 給AI看的指南/json順序檢查.py 與 python -X utf8 給AI看的指南/文風節奏檢查.py 各檔一次，把輸出全文貼進來。
2. 設計端原文：${DESIGN} 第二、三、四、五、七、八、九、十節整節逐字；劇情/呂信/@設定_五原障.md 全檔；${CHAR} 全檔（性格特質、說話風格、稱呼與愛馬紅線、結算線正式版、代表對白）。
3. 已在 Unity 的呂信既有句：python -X utf8 給AI看的指南/既有台詞.py 呂信 全部輸出（或 MC2 全撈），另把 Json/呂信線/01仗義疏財.json、02第三百四十九次.json 裡他與主角的每一句列出（含 entryID），Json/英豪府遴選/開場、子羽、呂信.json、Json/大地圖/天下第一武道大會.json 酒館夜話段、Json/探索事件/179年/12月.json 呂之門路段他的句子；主角在這些段落叫他什麼。
4. 這五支會碰到的其他角色既有句：賈詡 MC4（英布那場）、褚人飛（渡江；查他的 actorID 與既有句）、老兵 role143／馬賊頭目 role142／馬賊 role57（五原障，這三個 ID 在 Unity 未建、立繪未定）、雍仔 MC20 若出場；各人在立繪規則表裡有幾張圖。
5. 已知問題全文：${DESIGN} 第八節〈＿＿ 佔位一覽〉〈進 Unity 之前一定要先做〉與 ⚠ 各條（actorID "2"、[panel]、zh_CN、檔名／key）、第十節清單；給AI看的指南/跨機待辦.md 裡提到呂信線的條目（grep 呂信）；劇情/索引.md 裡呂信線那幾列。
6. 指南摘錄（逐字）：給AI看的指南/文本創作指南.md 第零層 0.1、0.2.2、0.2.3、2.1a、第一層第 3 條四軸對照；給AI看的指南/世界觀.md 第八節、第十一節；給AI看的指南/武俠文風創作指南.md〈零、常犯十條〉、第四節開頭通則、旁白卡、你卡、呂信卡、賈詡卡（若有）、7.1a–7.1c、7.3、第八節自檢、乙類〈不縮名詞〉；給AI看的指南/武俠文風審校清單.md 全檔的詞彙表（紅燈詞與替換）；劇情/轉成json指南.md §1（含 Description 詞表）、§3、§4.2、§4.4、〈注意事項〉、〈節點順序與編號〉；給AI看的指南/立繪指令轉換規則.md 4.1 MC1 表、4.3 五立繪、角色 ID 總表裡 MC2／MC4／MC20 那幾列、表情特效名稱表、§2.1 沒有立繪的角色；給AI看的指南/畫面指令轉換規則.md §2 背景表、§2.7；給AI看的指南/音樂指令轉換規則.md 檔頭規矩與 ID 表；給AI看的指南/擲骰指令轉換規則.md〈固定寫法〉與 ID 對照表；給AI看的指南/戰鬥指令轉換規則.md 全檔；給AI看的指南/貴重品指令轉換規則.md 寫法；@角色設定/饕餮.md 第十節廢案清單；給AI看的指南/多Agent創作流程.md 3b 六件事。
7. 稱呼與時代：漢代稱謂表若指南有（審校清單或文風指南裡的稱謂節）逐字抄。
寫完回傳一頁摘要（兩千字內）：五檔各自最顯眼的結構事實（入口、尾格、斷鏈孤兒數、破折號數、em7 密度、佔位處）、已知問題清單、審稿人一定要知道的坑。`
}

function findPrompt(f, d) {
  return `${COMMON}

你是「${f.key}」的審稿人，只看一個面向：**${d.name}**。
檔：${f.json}（整份逐格讀，這是審的對象）；創作稿：${f.md}（讀段落註記與設計意圖）；這一支是什麼：${f.note}
情境包：${PACKET}（先讀〈已知問題〉、設計端摘錄、本面向用得到的指南摘錄、本檔事實表）。

你要查的：
${d.brief}

做法：逐格讀 JSON（別跳），每發現一處就記一條（檔名、entryID、原句逐字、問題、建議改法、依據、嚴重度）。同一類問題重複出現（例如破折號、某個口頭禪）**每一處都列**，但在 summary 說明總數。已知問題不列（只在 known_counts 寫數量）。拿不準的標「疑」。不要為了湊數硬找；也不要因為多而漏。最多 60 條，超過就照嚴重度取前 60 並在 summary 說明還有幾條同類。
不改任何專案檔；不寫暫存檔也可以，要寫只寫在 ${DIR}/find-${f.key}-${d.key}.md。
回傳 JSON：file、dim、findings（陣列）、known_counts（一句：本檔已知問題各幾處）、summary（三五句：這一面向最大的問題是什麼、共幾條、哪幾條最該先改）。`
}

function verifyPrompt(f, finds) {
  return `${COMMON}

你是「${f.key}」的合併與查證人。四個面向的審稿人各交了一份清單，你要合成一份可信的：
${finds.map(x => `- ${x.dim}：${x.findings.length} 條；${x.summary}`).join('\n')}
四份清單全文如下（JSON）：
<<<
${JSON.stringify(finds.map(x => ({ dim: x.dim, findings: x.findings })), null, 1)}
>>>
檔：${f.json}；創作稿：${f.md}；情境包：${PACKET}。

做法：
1. 去重：同一格同一問題只留一條（保留寫得最清楚的那條，依據合併）。
2. 逐條回 JSON 查證：原句是不是逐字存在於那個 entryID（不在就找對格號或刪掉）；問題是不是真的（照情境包裡的指南原文對，不憑印象）；建議改法合不合規矩（改字的新句要過文風規矩：句長、不破折號、口吻）。查證不過的刪掉，在 dropped 計數並在 summary 說明主要刪了哪類。
3. 定嚴重度（錯／該改／可留／疑），同類問題合成一條「系列」也可以（例如「破折號 23 處：#a、#b、…各改成…」），但每一處的格號與改法都要列出。
4. 寫該檔一節到 ${DIR}/section-${f.key}.md（用 Write）：
   # 〈${f.key}〉（${f.json}，N 格）
   一段三五句總評（這一支能不能過、最該先處理的三件）
   ## 錯 ／ ## 該改 ／ ## 可留 ／ ## 疑 四小節，每條格式：
   - **#entryID**［面向］原句：「…」→ 問題：… → 改法：… ｜依據：…
   ## 已知（不逐格）：本檔 actorID "2" N 格、[panel] 缺 N 格、zh_CN 缺 N 格、佔位 ＿＿ 幾處在哪。
   ## 跑腳本：json順序檢查.py 與 文風節奏檢查.py 的結果分類（真問題／已知／誤報）。
5. 另把查證後的清單寫成 ${DIR}/verified-${f.key}.json（陣列，每筆 id、file、entry、dim、severity、quote、problem、fix、basis；id 寫成 LX-${f.key}-001 起連號）。
不改任何專案檔。
回傳 JSON：file、section（檔案路徑）、kept、dropped、by_severity（錯／該改／可留／疑 各幾條）、top（最該先改的五條，一句一條含格號）、summary（三五句）。`
}

function reportPrompt(vers) {
  return `${COMMON}

你是總整理。五檔的查證清單與各節已經寫好：
${vers.map(v => `- ${v.file}：節 ${v.section}；留 ${v.kept}、刪 ${v.dropped}；錯 ${v.by_severity.錯}、該改 ${v.by_severity.該改}、可留 ${v.by_severity.可留}、疑 ${v.by_severity.疑}；${v.summary}`).join('\n')}
verified 清單在 ${DIR}/verified-〈檔〉.json；情境包 ${PACKET}。

寫 ${REPORT}（用 Write；這是本流程唯一寫進專案的檔）：
# 呂信線審稿（英布、渡江、五原障、留信、改名）｜${DATE}｜只是報告，一字未改
> 引用區塊：這五份是已轉 JSON、未進 Unity、作者未過稿的；審的是 JSON；報告怎麼用（作者在審稿頁按要改／不改，或直接在本檔條號旁批；之後 AI 照勾的改進 JSON、補 zh_CN、走同步流程）；審稿頁網址欄留「（主對話補）」。
## 一、總覽：一張表（檔｜格數｜錯｜該改｜可留｜疑｜一句話能不能過）；再一段「五檔共通的問題」（破折號、em7、[panel]、actorID "2"、口吻上反覆出現的某幾種毛病），每項給全案一次性的改法。
## 二、建議處理順序：先哪一檔、先哪一類（引擎會壞的 → 事理不通的 → 設定矛盾 → 文風），與哪些要等作者裁示（D1 好結局數字、門重排、留信觸發、雙世冥劍）。
## 三、已知問題（不逐格）：從情境包〈已知問題〉整理成一節，附各檔數量。
## 四～八：五檔各一節，直接把 ${DIR}/section-〈檔〉.md 的內容搬進來（照原文，可統一格式），順序：英布、渡江、五原障、留信、改名。
## 九、要作者定的（合併去重，每條前加 ⚠）。
另把五份 verified JSON 合成一份 ${DIR}/findings.json（陣列，保留 id）給審稿頁用。
跑 python -X utf8 給AI看的指南/文風節奏檢查.py "${REPORT}" 一次，它報的碎句多半是引用原句，不用改，但看一眼有沒有你自己寫的句子被報。git status 確認只多了 ${REPORT}。
回傳 JSON：report、findings_json、total（查證後總條數）、by_file（每檔一句：檔名、錯／該改／可留／疑）、order（建議處理順序，一句一條）、summary（三五句給作者看的結論）。`
}

log(`呂信線審稿開跑：${FILES.map(f => f.key).join('、')}`)
let packetOk = true
if (A.have && A.have.packet) { log(`情境包沿用 ${PACKET}`) }
else {
  const r = await agent(scoutPrompt(), { label: 'scout:呂信五檔', phase: 'Scout', effort: 'xhigh', model: MODEL })
  packetOk = !!r
}
if (!packetOk) return { date: DATE, error: 'scout failed' }

const vers = (await pipeline(FILES,
  async f => {
    const finds = (await parallel(DIMS.map(d => () =>
      agent(findPrompt(f, d), { label: `find-${d.key}:${f.key}`, phase: 'Find', effort: 'xhigh', model: MODEL, schema: FIND_SCHEMA })
        .then(r => r ? { ...r, dim: d.name } : null)))).filter(Boolean)
    if (!finds.length) return null
    log(`${f.key}：四面向共 ${finds.reduce((n, x) => n + x.findings.length, 0)} 條，送查證`)
    return { f, finds }
  },
  async x => {
    if (!x) return null
    const v = await agent(verifyPrompt(x.f, x.finds), { label: `verify:${x.f.key}`, phase: 'Verify', effort: 'max', model: MODEL, schema: VERIFY_SCHEMA })
    if (v) log(`${x.f.key}：查證後留 ${v.kept}（錯 ${v.by_severity.錯}、該改 ${v.by_severity.該改}）、刪 ${v.dropped}`)
    return v
  })).filter(Boolean)

if (!vers.length) return { date: DATE, error: 'no verified sections' }
const rep = await agent(reportPrompt(vers), { label: 'report:呂信線審稿', phase: 'Report', effort: 'max', model: MODEL, schema: REPORT_SCHEMA })
if (rep) log(`報告完成：${rep.report}，共 ${rep.total} 條`)
return { date: DATE, files: vers, report: rep }
