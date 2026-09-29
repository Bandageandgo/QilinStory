export const meta = {
  name: 'butterfly-tanshihuai-box-v4',
  description: '鮮卑王帳第三版劇本（施工圖第四版：一個計亂變數、滿三跳強制營亂、黑狼獎勵最後；作者點名的句子與選項改成話語）：一份情境包、三起草三審修三邏輯審一終審，十三個入口、只有主角一人、對話置頂',
  phases: [
    { title: 'Scout', detail: '一名：箱庭情境包寫成檔案（施工圖第四版、第二版定稿原文與其 JSON、變數與文化分支範本、聲口、指南摘錄、常犯十條）' },
    { title: 'Draft', detail: '三名起草，各寫一版十三個入口進檔案（第二版沒被點名要改的格照原字抄）' },
    { title: 'Revise', detail: '每版一名審修：逐項查、能修就修、旁白逐格表' },
    { title: 'Logic', detail: '每版一名邏輯審：誰知道什麼、先後因果、變數與分支、點換順序也通' },
    { title: 'Final', detail: '一名終審：再挑錯、標建議版、寫提案檔（對話置頂）、跑檢查腳本' },
  ],
}

const A = Object.assign({ date: '＿＿＿＿-＿＿-＿＿', have: {}, bf: 'C:/Users/user/AppData/Local/Temp/claude/d--QilinStory/1ddf8b7f-8270-48d3-b27d-a5e5e30f3f7a/scratchpad/bf4' }, args || {})
const DATE = A.date
const MODEL = A.model || 'opus'
const BF = A.bf
const SPEC = '劇情/雲中/@設定_雲中.md'
const DUNGEON = '劇情/鮮卑王帳/@設定_鮮卑王帳.md'
const BASE = '劇情/鮮卑王帳/鮮卑王帳.md'
const BASEJSON = 'Json/大地圖/鮮卑王帳.json'
const PREV = '劇情/181年事件/02月(支)老兵的委託.md'
const RULES = '劇情/蝴蝶效應_素材與設計.md'
const BOX = '鮮卑王帳v4'
const KEY = '07王帳第三版'
const OUT = '劇情/檀石槐線_07王帳第三版.md'
const PACKET = `${BF}/${BOX}/packet.md`
const draftPath = tag => `${BF}/${KEY}/draft-${tag}.md`
const revisedPath = tag => `${BF}/${KEY}/revised-${tag}.md`
const VAR = 'XianbeiCampChaos'

const COMMON = `你在做《異麒麟》蝴蝶效應第三案「檀石槐線」的箱庭「鮮卑王帳」**第三版劇本**（作者 2026-09-29 深夜看過第二版定稿後，把機制再簡化、並點名了幾句不合寫作規格的字）。規格：${DUNGEON}〈箱庭寫法（第四版）〉是本單位的骨架（整條流程、十三個入口表、殺了他收尾、狀態表；它底下留著第三版只當對照，**照第四版寫**），另有〈ID〉〈誰在〉〈紅線〉〈未定〉；${SPEC} §四-1 第 18–43 條是作者裁示原文（第 40–43 條是這一版的）；第二版定稿 ${BASE}（**沒被第四版點名要改的格照原字抄**，含指令；被點名的重寫）；第二版 JSON ${BASEJSON}（95 格，格式與固定寫法照它）；前一場 ${PREV} 第一節；${RULES} 第一節規矩。本提示只摘要。
- 這條線是什麼：武道大會奪冠的玩家，181/2 被城門口的老兵託付替兒子報仇；追查出動手的是鮮卑西部一部、檀石槐五月會巡到那一部；老兵等不及自己北上死在半路，你埋了他、認下這件事，在塞外等到五月他來。箱庭＝那座營：坡上黑狼王的獵隊盯著同一個營；營地邊有哨騎；營裡路上的小兵是場景敵人（Unity 的，沒有 ID，稿裡不寫）；放馬、放火、下毒三點是場景物件自帶背景檢定（騎術 12、謀略 14、巧手 ＿＿），成功才跳對話；奴隸造反在對話裡擲口才。檀石槐正當盛年、沒病、不邪；鮮卑是尋常外邦人，全線人打人。
- **第四版機制（作者 09-29 深夜定，違反即退）：** ①作亂**不分支**：每個作亂點只寫成功那一段，不寫「已亂／沒亂」兩條；成功一次就在 Script 寫 \`Variable["${VAR}"] = Variable["${VAR}"] + 1;\`（Description「變數更新」；變數名是作者准 AI 取的，就用這個，不留白）。②**變數 ≥ 3 營才亂**：由 Unity 讀，**直接跳強制劇情〈營亂〉**（新入口 10，玩家在營裡時觸發）：演出 → 檀石槐帶人出帳 → 兩波小兵（103、104）→ 口才激將／直接動手／鮮卑文化單挑 → Combat 100 或 101 → 殺了他。③**黑狼的獎勵一律放到最後**（殺了他之後、上坡、他給賞）；**沒有「賣亂拿錢就回府」那條**，也沒有 entry 4、5。④**黑狼的營火・再點**（Unity 設變數 ≥ 1 才能點）：請他派手下下去添亂，派一次 +1，可重複；這裡不付錢。⑤**主帳（還沒亂）**：叫陣 → 他帶人出來 101／鮮卑文化 → 草原規矩單挑 100／「再等一等」（說出口的話）→ 完；營亂了以後 Unity 關掉主帳點。⑥下毒成功也只是 +1（不再直接單挑）。
- **作者點名要改的字（違反即退）：** 坡上開場第一格造景太多（帳、旗、馬群、哨騎繞），重寫成兩句；**選項一律是說出口的話，不准用（）括號動作**（「（替他們把散開的馬攏起來）」「（再等一等，先不動手）」「（先不驚動他們）」都要改成話）；「先擱著，我再下去。」「亂已經起了，錢先給我。」那種逗號後只剩短尾的句子不要；哨騎那點沒有 IsHidden4 時只剩一項、不能當選單，要補第二項；主帳與〈營亂〉的選單，鮮卑文化背景多一項也是單挑（\`IsCultureFit("Player", "Xianbei") == true;\` 掛在那一個選項格上，寫法照 劇情/轉成json指南.md §4.4，情境包有抄）。**每個選單至少兩項**，掛條件的那一項不算在兩項裡。
- **箱庭寫法：** 一份 JSON、十三個互不相連的入口，每個入口是場景裡一個互動點——走進某區強制觸發一次，或點擊某人某物、可重複點。玩家自己走、自己選先點哪個，所以每個入口都要能獨立成立、順序不定；入口格不掛 Conditions、不寫 title，Description 寫「入口：〈點名〉；條件作者設」（作者准的例外）；要分流的在入口格下一格用 Conditions 分。**箱庭裡沒有回頭路**：不給「回英豪府」「轉身走」的選項；除了打輸進結局，只有殺了他一條收尾。
- **只有主角一個人**：沒有任何同伴的台詞、立繪、在隊條件；旁白不提同伴。黑狼王、檀石槐、哨騎、奴隸是線裡的人物。
- 引擎硬紅線：除了 ${VAR} 不新建變數、不新建任務、不自取名字（口才難度、巧手難度、黑狼最後那筆賞錢、檀石槐 actorID、配樂留 ＿＿）；CF49（entry 1 進營、entry 2 殺了他）、XianbeiRoyalTent、Combat 100／101／103／104、role84（奴隸）、WordOfHonor、LawChaos,1 是作者給的（見 ${DUNGEON}〈ID〉），不留白；SetFlag／GetFlag 禁用；只讀既有的 IsHidden4、IsCultureFit、IsPassFight／IsPassDice；新格不編號、不寫 title；Description 只寫 劇情/轉成json指南.md §1 詞表標籤（入口格那一句例外）；變數寫 Script 不寫 Sequence。
- 人：沒有一個人替主角下結論——黑狼王不評論、旁白不評論任何一條路；「最好」是玩家的最好，不是俠的最好。
- 內容三道線：世界觀第八節禁詞（五胡亂華、司馬、篡魏、三國歸晉、輪迴、重來、前世）；角色口中不出「凶戾」「人祭」；檀石槐可以不開口，若開口只有幾個字或經通譯，不發明鮮卑語詞；不寫他的內心、來歷、對漢人的看法；不寫戰況數字、不寫朝廷；黑狼衝進營只寫看得見的，不寫戰果。**〈營亂〉的演出不點名是哪一樣作亂弄出來的**（可能是放馬、放火、奴隸、下毒、黑狼派的人任三樣，順序不定，甚至全是黑狼派的人），只寫營裡亂了、看得見的樣子。
- 共同事實（不得另定）：老兵沒有名字、兒子 180 冬死、他自己北上死在半路（箱庭不再提）；檀石槐的名字玩家已聽過；奴隸是去年冬天從雲中擄來的漢人；黑狼王 MC11 親領、玩家第一次見他；收尾＝四段轉場只淡黑（不開英豪府背景）＋黑幕裡 ModifyData(GameDate,181,6,Early); MapLock(XianbeiRoyalTent, lock); LoadLevel(Command_HallOfHeroes); 尾格照規矩；不寫 GameDate 以外的日期。
- 稿的寫法（創作稿）：說話者行 **旁白:**／**你:**／**〈角色〉:**（主角一律「你」），旁白 [panel=6]＊（…）＊，台詞「…」；每格底下 - actorID: / - Sequence: / - Conditions: / - Script: / - Description: 有才寫，各一行；新格用【A】【B】…標，不編號；每個入口自成一節；選單照 劇情/轉成json指南.md §4.2（選項格是短的一句話，選了之後下一格是主角把話說全）；文化分支照 §4.4；擲骰四段、戰鬥四件套、轉場、尾格照固定寫法（情境包有抄）；沒有立繪的角色不寫 SetPortrait。不動 Json/、不動 Unity、不動 ${BASE}、不動設定檔。
- 文風規矩（違反即退）：先讀情境包最前面的〈常犯十條〉錯例對改例。1. 旁白看得見你做什麼、看不見你想什麼：不寫內心話、不替玩家下感受或結論、不替角色斷定心裡怎樣（「倒像」「像是」可以）。2. 寫結果和狀態，不寫過程；一格裡同一個人的動作最多兩拍；不編精確數目、距離和純造景小細節。3. 作者退過的句型不得再犯：「不是 X，是 Y」翻轉句；否定句收尾造氣氛；「像……」比喻巧句收尾；收尾加新判語；旁白先把下一格台詞要講的事講掉；選項已經講過的事旁白再講一遍；同一件事隔幾格又講一遍。4. 句子寫完整，不斷碎句：旁白一格兩三句、每句十九到二十五字、不留五字以下的句子；角色台詞一句十五字上下，照那個角色既有的口吻；**選項那一句也要是完整的一句話，不要逗號後只剩三四個字的短尾**。5. 旁白裡不寫「」引號；**全篇不用破折號「——」，台詞也不用**（打斷用「……」）。[em7] 每十格開口的格至多一個、同一人不連掛、[/em7] 後必接標點。6. 玩家看得到的字不自創單字名詞；東漢稱謂與用詞。
- **檔案體例（作者 09-28 裁示）：對話文字置頂、給 AI 看的放後面。** 提案檔＝三版的純對話在前，三版的逐格稿、待作者定、審修紀錄在後。
- 省回合：情境包已收好施工圖原文、第二版定稿與其 JSON、範本格、聲口、指南摘錄，先讀它；只在拿不準時回原檔查那一段。日期一律寫 ${DATE}。給作者看的話用白話短句。`

const LENSES = [
  { tag: '甲', name: '照施工圖最少', brief: '每個點只做施工圖點名的事，格數最少；旁白不造景、不加物件；第二版沒被點名的格一字照抄。偏離施工圖處在自檢講明。' },
  { tag: '乙', name: '接戲', brief: '先把情境包裡黑狼王的既有句、第二版定稿保留那些格的嗓子讀順，再寫出唸起來最順、最像同一座營的版本；〈營亂〉演出與殺了他收尾可以比甲多一兩格，但一定要守施工圖與共同事實。' },
  { tag: '丙', name: '另一種演法', brief: '在施工圖範圍內刻意換一種演法：換誰先開口、換一個看得見的動作或物件、換兩波小兵與激將之間的拍子、換黑狼派人那一格怎麼拍、換黑狼給賞那一句怎麼講；仍守全部規矩。若另一種演法明顯更差，照樣給出最好的不同版本並在自檢說明。' },
]

const UNIT = {
  key: KEY, box: BOX, out: OUT,
  json: `${BASEJSON}（第二版 95 格作廢、檔未進 Unity，定稿後整檔重出、從 1 連號；十三個入口格都不掛條件、不寫 title）`,
  overview: `${DUNGEON} 全檔（〈箱庭寫法（第四版）〉是骨架、〈ID〉是已給的號）；${BASE}（第二版定稿：沒被點名的格照抄，其餘只當素材）；${BASEJSON}（格式範本）；${SPEC} §四-1 第 33–43 條；${PREV} 第一節`,
  anchors: `十三個入口（照 ${DUNGEON}〈箱庭寫法（第四版）〉第二節那張表，逐點；「照抄」＝跟第二版定稿 ${BASE} 第二節逐格稿那一格逐字相同，含 actorID／Sequence／Description）：
1 坡上開場（強制一次）：第一格【A】**重寫**成兩句（你在塞外等到五月他來了、坡下就是那座營；不數帳、不數旗、不寫哨騎怎麼繞、不寫馬群吃草）；第二格照抄第二版【B】（坡頂草裡伏著一排穿皮袍的人、窪地裡生著火）。
2a 黑狼的營火・第一次（強制一次，排在下坡以前）：第二版【C】–【G】照抄（旁白、你問、他自報、你問盯多久、他說摸不進去）；最後一格【H】**改寫**成：底下那座營先鬧起來，本王的人才摸得下去添亂；小子要是能把檀石槐的腦袋留在營裡，本王重賞（不講兩級價、不講「亂＝出錢」、不講雙倍）。無選單、無條件。
2b 黑狼的營火・再點（點擊；Unity 設變數 ≥ 1 才能點；可重複）：入口旁白一格（他還坐在馬鞍上；不重講坡頂那排人）→ 選單兩項、都是話：請大王派幾個人下去，再給營裡添一把亂／這回先不勞大王，我自己再下去一趟（各自寫成完整一句）→ 派：你把話說全 → 黑狼王一句（照口吻；不評論你、不問你為什麼）→ 旁白一格：他朝坡頂一揮手，幾騎溜下坡去（Script Variable["${VAR}"] = Variable["${VAR}"] + 1; Description 變數更新）→ 收（links 空）；不用：你一句 → 收。**這裡不付錢、不寫任何 Coin、不寫 entry。**
3 望營地、4 回去的路、6 進營開場：照抄第二版【T】【U】【AJ】【AK】（含指令）。
5 哨騎（強制一次）：入口【V】照抄 → 分流：IsHidden4 == true →【W】照抄（馬散到營邊）；IsHidden4 ~= true →【AI】照抄（哨騎圍上來、刀拔出）→ 兩條都接**同一個選單**（照 §4.4 的形，條件掛在選項格上）：①「要進營，先過你們這一關。」（照抄）→【Z】照抄 → Combat 103 四件套（【AA】【AB】照抄）→ 勝【AC】照抄 →【AD】照抄（entry 1）；敗【AE】【AF】照抄；②新的第二項（話）：例如「我一個人來，是來見你們大人的。」→ 你把話說全 → 旁白一格：哨騎不信，刀照樣過來 → 接同一場 103；③（Conditions: Variable["IsHidden4"] == true;）攏馬那一項**改成話**，例如「這些馬散成這樣，我替你們把牠們攏回去。」→【AG】【AH】照抄 → 接【AD】。哨騎那場暫用 103（作者要分開再改，稿內照 103）。
7 放馬（騎術 12 過了才跳）、7b 放火（謀略 14 過了才跳）：各兩格旁白，只寫成功那一段（第二版【AM】【AP】可照抄當第一格，第二格新寫或拆句）；**不分亂沒亂、不寫再點短句**（Unity 每點只准成功一次）；+1 掛第二格 Script；沒有 entry 5。
7c 奴隸造反（點擊，可重複，對話裡擲口才）：入口旁白照抄第二版【AS】的字 → 選單兩項、都是話：[em2][口才檢定][/em2]「想回家的，跟我鬧一場！」（照抄）／第二項把「（先不驚動他們）」改成話（例如「再忍一忍，我先去看看四下。」）→ 擲骰四段（BeginDiceRoll(Manual,PersuasionCheck,＿＿)）→ 你把話說全（照抄【AW】）→ 過：奴隸一句（照抄【AX】的字，role84；Sequence ModifyData(FeatExp,Player,Persuasion,25);）→ 旁白他們起事（照抄【AY】的字；Script +1）→ 收；不過：旁白縮回去（照抄【AZ】）→ 收（可再點再試）。**不寫「已亂再點」那條。**
8 主帳・檀石槐（點擊；營亂了以後 Unity 關掉；可重複）：入口旁白照抄第二版【BB】的字（他坐在大帳前氈子上，刀橫在膝頭，身邊一圈佩刀的人）→ 選單：①「檀石槐，起來跟我打一場！」（照抄）→ 你把話說全（照抄【BD】）→ 旁白他起身、那一圈人跟著拔刀（照抄）→ Combat 101 四件套 → 勝 → 接【殺了他】；敗 → 旁白（照抄「刀從前後一起砍過來」那格）→ 戰敗包 ShowEnding(Ending_1)；②（Conditions: IsCultureFit("Player", "Xianbei") == true;）鮮卑文化那一項，照 §4.4 的形寫：「我也是草原上的人，按草原的規矩，你我單挑。」之類 → 你把話說全 → 旁白他提刀起身、朝身後擺手、四下的人退開 → Combat 100 四件套 → 勝 → 接【殺了他】；敗 → 旁白（照抄「那把刀快了你半步」那格）→ 戰敗包；③「再等一等」改成話（例如「這筆帳先記著，我再去營裡走一趟。」）→ 收。**沒有「轉身回英豪府」。**
9 酒囊・下毒（巧手 ＿＿ 過了才跳）：兩格旁白：酒囊讓人提進大帳、帳裡亂起來、有人倒出帳門（第二版【CN】可照抄）；第二格新寫帳前的人湧過去之類，**檀石槐不出帳、不打**；Sequence ModifyData(FeatExp,Player,SleightOfHand,10);ModifyData(DnDAlignment,Player,GoodEvil,-0.15); Script +1 → 收。
10 營亂（**強制劇情**；Unity 讀 Variable["${VAR}"] >= 3、玩家在營裡時觸發一次）：入口旁白一到兩格演出（營裡亂了：喊聲、人亂跑、馬；**不點名是哪一樣弄出來的**）→ 旁白：檀石槐提刀出了大帳，身邊的人跟著拔刀朝你圍過來（可用第二版【BQ】那格的字）→ Combat 103 四件套 → 勝：旁白第二撥人湧出來（照抄【BT】的字）→ Combat 104 四件套 → 勝：旁白他還沒動（照抄【BW】）→ 檀石槐：「你是一個人殺進來的？」（照抄【BX】；role＿＿）→ 選單：①[em2][口才檢定][/em2]「就我一個人，你自己拿起刀來！」（照抄）→ 擲骰四段（口才 ＿＿）→ 你把話說全（照抄【CB】，em7 可留可拿）→ 過：旁白他一個人提刀站起、四下的人退開（照抄【CC】；Sequence Persuasion,25）→ Combat 100 → 勝接【殺了他】／敗 → 「那把刀快了你半步」→ 戰敗包；不過：旁白他帶人衝過來（照抄【CG】）→ Combat 101 → 勝接【殺了他】／敗 → 「刀從前後一起砍過來」→ 戰敗包；②「不跟你廢話，一起上！」（照抄）→ 你把話說全（照抄【CK】）→ 接同一場 101；③（Conditions: IsCultureFit("Player", "Xianbei") == true;）鮮卑文化：草原規矩單挑 → 你把話說全 → 旁白他朝身後擺手、四下的人退開 → 接同一場 100。兩波小兵任一敗 → 旁白（照抄【CL】）→ 戰敗包。
【殺了他】收尾（8 的兩場勝、10 的三場勝共用，同一場接著演）：旁白他倒下（照抄第二版【BI】；Script SetQuestEntryState("CF49", 2, "success"); SetQuestState("CF49", "success"); Sequence ModifyData(Skill,Player,WordOfHonor);ModifyData(DnDAlignment,Player,LawChaos,1); Description 任務更新、完成任務：＿＿、獲得技能卡、信義提升）→ 旁白坡上那排皮袍騎馬衝進營（照抄【BJ】的字）→ 旁白你逆著人出營上坡、火邊只剩他（照抄【BK】的字）→ 黑狼王給賞一句（**改寫**：不講雙倍、不講兩級；照他的口吻，本王說重賞就重賞之類）Sequence ModifyData(Coin,Player,＿＿); Description 給錢 → 收尾包。
收尾包（一份）：轉場格只淡黑 SetContinueMode(false);PlayFeelFeedback(FadeOut,1,#000000,1);OpenPanel(0,close)@1;OpenPanel(1,close)@1;SetContinueMode(original)@1;Continue()@1;（Description 轉場、清除立繪）＋尾格 ModifyData(GameDate,181,6,Early);DisableAllCharacterExpression();MapLock(XianbeiRoyalTent, lock);LoadLevel(Command_HallOfHeroes);Continue();（Description 時間前進、清除立繪、地圖鎖定、切換場景；links 空）。戰敗包照第二版【AF】【BP】。`,
  cond: `只讀：Variable["IsHidden4"]（5 哨騎：分流兩格與攏馬那一個選項格）、IsCultureFit("Player", "Xianbei") == true;（8、10 各一個選項格）、IsPassFight／IsPassDice；入口格一律無條件。只寫：Variable["${VAR}"] +1（2b、7、7b、7c、9 各一處，Script）、CF49 entry 1（哨騎合流）、entry 2＋任務 success（殺了他）。沒有 entry 4、5，沒有 failure，沒有 Coin 以外的錢。`,
  voices: '你 MC1；旁白 role2；黑狼王 MC11（本王、小子、哼哈哈、腳翹案上那一路；52 句既有台詞；不評論）；檀石槐 role＿＿（無立繪；只那一句）；奴隸 role84（無立繪；只那一句）；哨騎與小兵無立繪、不開口；沒有同伴',
  checks: [
    '箱庭形狀：十三個入口各自一節、各自成立、順序不定也通；入口格無 Conditions 無 title；沒有回頭路（沒有回英豪府、轉身走的選項）；照抄的格跟第二版定稿逐字相同（含指令）',
    '只有主角一個人：沒有同伴台詞、立繪、IsInTeam；旁白不提同伴',
    `第四版機制：作亂五處（放馬、放火、奴隸、下毒、黑狼派人）各只寫成功、不分亂沒亂、各在 Script 寫一次 Variable["${VAR}"] +1；沒有 entry 4、5；黑狼第一次不講兩級價、再點不付錢；獎勵只在殺了他之後那一格；主帳（沒亂）三項＝101／鮮卑 100／說出口的再等；〈營亂〉＝演出（不點名哪一樣）→ 103 → 104 → 激將／一起上／鮮卑 → 100 或 101；下毒不打；100、101 勝都接同一個【殺了他】`,
    '讀法與狀態：只讀 IsHidden4、IsCultureFit、IsPassFight／IsPassDice；變數寫 Script、Description 變數更新；文化分支那一格照 §4.4 的形；留白 ＿＿ 沒被取名（口才難度兩處、巧手難度、賞錢、檀石槐 actorID、配樂），已給的 ID 沒留白；沒有新變數、title；Description 在詞表內（入口格例外）',
    '固定寫法：戰鬥四件套、擲骰四段、選項格、文化分支選項格、尾格、只淡黑的轉場逐字照情境包；敗＝ShowEnding(Ending_1)',
    '作者點名的字：坡上開場第一格兩句、不造景；全檔選項沒有一個是（）括號動作、每一句是完整的話、沒有逗號後短尾；哨騎選單沒 IsHidden4 也有兩項；主帳與營亂都有鮮卑文化那一項；每個選單至少兩項（條件項不算）',
    '文風規矩 1–6、常犯十條與聲口：黑狼王既有句、旁白卡、主角卡；檀石槐只那一句；旁白不評論任何一條路；殺了他那格看得見結果、看不見感受；黑狼衝進營只寫看得見的；em7 每十格開口的格至多一個；全篇不用破折號',
    '設計端連帶：無（定稿時再對索引與待辦），design_notes 寫（無）',
  ],
}

function unitHead(u) {
  return `單位：${u.key}｜箱庭情境包：${PACKET}
JSON 去處：${u.json}
要讀的設定與範本（只讀不改）：${u.overview}
骨架（十三個入口）：
${u.anchors}
讀的條件與寫的狀態：${u.cond}
聲口：${u.voices}
本單位八項檢查：
${u.checks.map((c, i) => `${i + 1}. ${c}`).join('\n')}`
}

const DRAFT_FILE_FORMAT = `檔案結構（每節都要有，沒有內容寫「（無）」；**對話在前、給 AI 的在後**）：
# 起草稿｜${KEY}｜〈甲乙丙〉（〈取向名〉）
## 一、對話（給作者讀）：十三個入口各一小節，純對話——**旁白:** ＊（…）＊／**你:**／**〈角色〉:**「…」，一層一層縮排，分岔「▶ 〈條件白話〉」，選項「◆ 玩家選擇」（條件項標「（鮮卑文化才有）」「（聽過釣魚叟往事才有）」），轉場、戰鬥、擲骰只寫一行斜體提示；照抄的格也要放，標「（照第二版）」
## 二、給 AI 的
### 取向（一句）
### 節首（表：入口清單、每個入口讀的條件、寫的指令逐行含 ＿＿、戰鬥／擲骰／收尾包、格數、陣列順序）
### 逐格稿（十三個入口各一節；每格 說話者行＋全文，底下 actorID／Sequence／Conditions／Script／Description 有才寫；新格用【A】【B】…標；分岔 ▶；合流「→ 接【X】」）——每一句要跟第一節逐字相同
### 設計端連帶
### 起草者自檢（逐條對照八項檢查與文風規矩 1–6；節奏檢查的結果貼這裡）`

function scoutPrompt() {
  return `${COMMON}

你是箱庭「鮮卑王帳」第三版劇本的情境整理，只讀不改專案檔。本箱庭這一批要寫的單位：
${unitHead(UNIT)}

請把情境包寫成檔案 ${PACKET}（用 Write；目錄不存在就建）。內容（純事實、逐字原文，不提改法），**第一節先放** 給AI看的指南/武俠文風創作指南.md〈零、常犯十條〉整節：
1. 規格原文：逐字抄出 ${DUNGEON} 全檔（第四版與底下留作對照的第三版都抄，標清楚哪個是現行）；${SPEC} §四-1 全節（含第 33–43 條）；${RULES} 第一節 1-2、1-3、1-4。
2. 第二版定稿 ${BASE} 全檔逐字（第一節對話與第二節逐格稿都要）：起草者要照抄很多格，也要拿其餘當素材、看收尾包、戰敗包與只淡黑轉場的固定寫法。
3. 前一場 ${PREV} 第一節逐字（玩家進箱庭前看過什麼）。
4. 箱庭與格式範本（逐字，含 Sequence／Script／Conditions／Description／links）：${BASEJSON} 全檔（第二版 95 格，就是第二版定稿的 JSON，格式與固定寫法都照它）；Json/大地圖/水濂洞.json 任一個可重複點的互動點；**變數範本**：Json/主線事件/180年/11月.json 裡 Script 有 Variable["BreakAlliance"] = Variable["BreakAlliance"] + 1; 的三格全欄位（看 Script 欄、Description「變數更新」或「破局變數+1」那種寫法），與 Json/ 裡 Conditions 有 Variable["MyTime"] >= 6; 的一格；**文化分支範本**：劇情/轉成json指南.md §4.4 整節逐字，加 Json/破廟/阿傑、阿佑、阿偉、水井.json #3214–#3221 那幾格全欄位（選項格掛條件的形；文化那一格的 text 標籤怎麼寫）；grep 全 Json 有沒有 IsCultureFit("Player", "Xianbei") 的實例，有就抄一格。
5. 固定寫法各抄一次（含出處）：入口格、尾格、只淡黑的四段轉場、戰鬥四件套（含 IsPassFight 兩格）、擲骰四段（BeginDiceRoll(Manual,PersuasionCheck,N) 那一組與 IsPassDice 兩格，出處 給AI看的指南/擲骰指令轉換規則.md）、選項格（§4.2）、ShowEnding(Ending_1) 戰敗收尾與其前一格、SetQuestState／SetQuestEntryState、ModifyData(Coin,Player,N)、ModifyData(Skill,Player,X)、ModifyData(DnDAlignment,Player,LawChaos,N)、ModifyData(FeatExp,Player,SleightOfHand,10) 實例。
6. 聲口：跑 python -X utf8 給AI看的指南/既有台詞.py 撈 黑狼王 全部 52 句；主角 MC1 十句（選有動作的）。檀石槐、哨騎、小兵、奴隸只有第二版那兩句，註明。
7. 設定：@角色設定/黑狼王.md 若存在則全檔；劇情/故事大綱.md §5-5 廣 1 那一列；給AI看的指南/世界觀.md 第 275 行前後。
8. 要查的事實：黑狼王 MC11 立繪格號與可用表情特效；主角 MC1 可用 pic；${VAR} 全 Json 沒用過（確認沒撞名）；Combat 100、101、103、104 全 Json 用過沒；WordOfHonor 全 Json 用過沒。只寫事實。
9. 指南摘錄（作者准：起草者只讀情境包，視同讀過三份指南）：逐字抄出 給AI看的指南/文本創作指南.md 第零層高概念那幾段、0.1、0.2.2、0.6、2.1a、第一層第 3 條四軸對照表、「箱庭手法」那幾段；給AI看的指南/世界觀.md 第八節；給AI看的指南/武俠文風創作指南.md 第四節開頭通則、旁白卡（含第 9 條）、你（主角）卡、7.1a–7.1c、7.3、第八節自檢清單；劇情/轉成json指南.md §1 Description 詞表全表、§3 尾格與轉場、§4.2、§4.4、〈注意事項〉變數三條、〈節點順序與編號〉；給AI看的指南/擲骰指令轉換規則.md 四段寫法與常用檢定 ID 表；給AI看的指南/戰鬥指令轉換規則.md 若存在則全檔；給AI看的指南/立繪指令轉換規則.md 2.1 與本批出場角色的格號。
寫完檔案後，回傳一頁摘要（兩千字內）：十三個入口的骨架、固定寫法在情境包哪一節、第二版哪些格照抄、變數與文化分支怎麼寫、起草者一定要知道的坑。`
}

function draftPrompt(lens) {
  return `${COMMON}

你是起草者（${lens.tag}｜${lens.name}）。你的取向：${lens.brief}
${unitHead(UNIT)}

做法：只讀情境包 ${PACKET}。**先把它最前面的〈常犯十條〉錯例對改例讀一遍再動筆**。它的〈指南摘錄〉已逐字收了三份指南與各轉換規則裡寫這個箱庭用得到的節，讀情境包即視同讀過 CLAUDE.md 要求的三份指南。起草只管寫戲：不回 JSON、回讀稿查連線，固定寫法照情境包第 5 節抄；照抄的格從情境包第 2 節逐字抄。只有情境包真的缺了寫戲非要不可的東西時，才去原檔讀那一段，並在〈起草者自檢〉記一筆。不要改任何專案檔。
把稿寫成檔案 ${draftPath(lens.tag)}（用 Write；目錄不存在就建）。
${DRAFT_FILE_FORMAT}
寫完只跑一次 python -X utf8 給AI看的指南/文風節奏檢查.py <檔>，照報告修一次就交（它列的「旁白卡候選」每條要改掉或在自檢說理由），不再重跑；報告和你修了什麼貼進〈起草者自檢〉。
回傳 JSON：file、approach（一句取向）、cells（格數）、self_check（三五句）。`
}

function revisePrompt(d) {
  return `${COMMON}

你是審修（版${d.label}）。一人審一版：逐項查，能修的直接修進稿裡，修不了的列出來。
${unitHead(UNIT)}

起草稿：${d.file}（先讀）；情境包：${PACKET}（先讀施工圖第四版、第二版定稿、第 4 節變數與文化分支範本、第 5 節固定寫法）；起草者的自檢：${d.self_check || '（無）'}

查什麼：
1. 八項檢查逐項：十三個入口各自成立、順序不定也通；照抄的格跟第二版逐字相同（含指令）；固定寫法對不對；變數寫在 Script、五處各一次、名字是 ${VAR}；文化分支選項格的形；留白有沒有被人取了名、已給的 ID 有沒有反而留白；沒有 entry 4、5、沒有中途給錢；Description 詞表（入口格那句例外）；共同事實有沒有走樣；第一節對話與第二節逐格稿逐字一致。
2. 文風規矩 1–6 逐句與〈常犯十條〉；口吻對照情境包裡黑狼王的既有句（讀 給AI看的指南/武俠文風創作指南.md 第四節旁白卡與主角卡、給AI看的指南/武俠文風審校清單.md）。
3. 作者點名的字逐條驗：坡上開場第一格兩句不造景；全檔選項沒有（）動作、沒有逗號後短尾；哨騎選單沒 IsHidden4 也有兩項；主帳與營亂各有鮮卑那一項；每個選單至少兩項；〈營亂〉演出沒點名是哪一樣作亂。
4. 另查：只有主角一個人；作亂五處沒寫分支、沒寫再點短句；主帳（沒亂）與營亂的戰鬥 ID 對；殺了他收尾共用且指令齊（entry 2、任務 success、技能卡、LawChaos,1、賞錢）；旁白沒評論任何一條。
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

你是邏輯審（版${r.label}）。審修已經修過規矩與口吻，你只看這場戲的事理通不通：先讀情境包 ${PACKET} 的施工圖第四版、第二版定稿與前一場那一段，再逐格讀 ${r.file}（十三個入口每個都要讀，順序不定也要通）。
${unitHead(UNIT)}

查什麼（只管事理）：
1. 誰知道什麼：每一格說話的人、主角、旁白此刻知道的事，是不是前面已經看見或聽見的。沒看見的不能認出，沒聽見的不能回答，同一件事不能認第二次、不能講第二次（前一場已演過老兵死、名字聽過；箱庭裡不再「認出」他是誰；黑狼第一次已自報，再點不再自報）。
2. 先後因果：先看見才能叫人、先問才有答、先做才有結果；轉場前後的時辰、天色、地點接得上；人在哪、誰在場，前後一致。箱庭的點順序不定：先點黑狼再進營、先進營再回坡上、放火放馬奴隸下毒任何順序、黑狼派人湊數、營亂由任三樣湊出（甚至全是黑狼派的人）、還沒亂就殺進主帳，都要通；〈營亂〉演出不能點名是哪一樣弄的；〈營亂〉在營裡觸發，開場那格得是營裡的視角。
3. 東西的去向：酒囊、錢、弓、旗、馬、火、繩子，有拿出來就有交代；沒有憑空多出來的東西。
4. 台詞與旁白不打架：旁白不重講台詞剛講的事，也不比台詞晚一步才交代台詞已經用到的事實；選項文字跟後面的戲對得上；哨騎第二項說了話之後的戲跟那句話對得上。
5. 條件與分支：每條分支的前提在那條路上真的成立：變數五處 +1 都在成功那格之後；主帳（沒亂）101 與鮮卑 100；營亂兩波之後的三項；激將過不過；殺了他之後黑狼衝進營與給賞在同一場接得上（主帳那條營沒亂、黑狼的人也衝進來，寫法要通）。
6. 前後場接口：入口開場假定的事前一場真的演過；收尾留下的狀態跟設定檔〈任務與狀態〉一致（entry 1、entry 2、任務 success、地圖鎖、日曆）。
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
1. 挑錯：每個入口從入口格讀到尾格或關掉對話，每條路都通（選單每一條、每場戰鬥勝敗、擲骰過不過、有沒有 IsHidden4、是不是鮮卑文化）；照抄的格跟第二版逐字相同；固定寫法有沒有抄錯一個字；變數五處與名字；留白有沒有被取名；共同事實有沒有走樣；作者點名的字每一條都改到了；三版是不是三個真的不一樣的選擇；有沒有人替主角下結論；第一節與第二節逐字一致。發現就直接改，記進該版〈審修紀錄〉（標「終審」）。
2. 建議版：挑一版，理由一句。
3. 寫提案檔 ${OUT}（用 Write；已存在就整檔覆寫），**對話置頂**：
   第一行「# 檀石槐線・07王帳第三版　提案｜創作稿／提案，尚未進 JSON；作者挑版、定稿、轉 JSON 後本檔歸檔」；
   短檔頭引用區塊（六行內）：「📝 ${DATE} 三版待作者挑一版；規格見 ${DUNGEON}〈箱庭寫法（第四版）〉與 ${SPEC} §四-1 第 40–43 條，本檔只放戲。第二版定稿 ${BASE} 與其 JSON 待本版定稿後整檔取代。」、JSON 去處、「十三個入口格都不掛條件、不寫 title；新格不編號；計亂變數 ${VAR} 作者要建進 Unity」、「**建議版：**」＋理由、「**待作者填：**」（口才難度兩處、巧手難度、黑狼最後那筆賞錢、檀石槐 actorID、哨騎戰鬥 ID 要不要跟 103 分開、配樂）；
   「## 一、對話（給作者讀）」底下三節「### 版一（甲｜照施工圖最少）」「### 版二（乙｜接戲）」「### 版三（丙｜另一種演法）」，各放該版第一節的純對話（十三個入口各一小節；整個入口都照抄第二版的 3、4、6 每版只放一次，寫「（照第二版，三版相同）」不重複三遍）；
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

log('鮮卑王帳第三版：整理情境包')
const havePacket = A.have && A.have.packet
const ok = havePacket ? true : !!(await agent(scoutPrompt(), { label: `scout:${BOX}`, phase: 'Scout', effort: 'xhigh', model: MODEL }))
if (!ok) return { date: DATE, error: 'scout failed' }
const had = (A.have && A.have.drafts) || []
const drafts = (await parallel(LENSES.map(l => async () => {
  if (had.includes(l.tag)) return { label: l.tag, file: draftPath(l.tag), self_check: '（沿用舊 run 的起草稿）' }
  const r = await agent(draftPrompt(l), { label: `draft-${l.tag}:${KEY}`, phase: 'Draft', effort: 'xhigh', model: MODEL, schema: DRAFT_SCHEMA })
  return r ? { label: l.tag, ...r, file: draftPath(l.tag) } : null
}))).filter(Boolean)
if (!drafts.length) return { date: DATE, error: 'all drafts failed' }
log(`${drafts.length} 版起草稿就位，送審修`)
const revs = (await parallel(drafts.map(d => () =>
  agent(revisePrompt(d), { label: `revise-${d.label}:${KEY}`, phase: 'Revise', effort: 'max', model: MODEL, schema: REVISE_SCHEMA })
    .then(r => r ? { label: d.label, ...r, file: revisedPath(d.label) } : null)))).filter(Boolean)
if (!revs.length) return { date: DATE, error: 'all revisions failed', drafts }
const logics = (await parallel(revs.map(r => () =>
  agent(logicPrompt(r), { label: `logic-${r.label}:${KEY}`, phase: 'Logic', effort: 'max', model: MODEL, schema: LOGIC_SCHEMA })
    .then(x => x ? { ...r, logic: x, summary: r.summary + '｜邏輯審：' + x.summary } : r)))).filter(Boolean)
log('邏輯審完成，送終審')
const fin = await agent(finalPrompt(logics), { label: `final:${KEY}`, phase: 'Final', effort: 'max', model: MODEL, schema: FINAL_SCHEMA })
if (!fin) return { date: DATE, error: 'final failed', revs }
log(`提案檔完成，建議版 ${fin.recommended.label}，待作者定 ${fin.unresolved.length} 件`)
return { date: DATE, unit: UNIT.key, out: fin.out, recommended: fin.recommended, unresolved: fin.unresolved, rhythm: fin.rhythm, format: fin.format, summary: fin.summary,
  revisions: revs.map(r => ({ label: r.label, changes: r.changes, unresolved: r.verdicts.filter(v => v.verdict === 'unresolved').length, summary: r.summary })) }
