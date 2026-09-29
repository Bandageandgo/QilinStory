export const meta = {
  name: 'hard-check-zuihan',
  description: '張寧 02 醉漢（福禍）：一情境包、三起草、三審修（一人一版）、一終審寫提案檔；提案檔對話置頂',
  phases: [
    { title: 'Scout', model: 'opus', detail: '情境包寫成檔案，只回一頁摘要' },
    { title: 'Draft', detail: '三名起草，各寫一版進檔案' },
    { title: 'Revise', detail: '每版一名審修：逐項查、能修就修、記錄改動' },
    { title: 'Final', detail: '終審：再挑錯、標建議版、寫提案檔（對話置頂）、跑兩支檢查腳本' },
  ],
}

const A = Object.assign({ date: '＿＿＿＿-＿＿-＿＿', have: {}, hc: 'C:/Users/user/AppData/Local/Temp/claude/d--QilinStory/4acb5323-b153-440b-8c80-a1d714f7ce95/scratchpad/hc5' }, args || {})
const DATE = A.date
const MODEL = 'opus'
const HC = A.hc
const GUIDE = '給AI看的指南/高難度檢定走向指南.md'

const LESSONS = `
【前四批學到的，違反即退（作者 2026-09-27／28 退過的稿）】
- 一個選單一定有兩個檢定選項：一般檢定＋同一種的高難度檢定（轉機除外）。本場選單是新開的，一般威嚇與福禍威嚇並排。
- 福禍的「禍」不能跟同選單一般檢定的失敗結果相近，也不能跟一般成功相近。本場一般威嚇失敗＝開打（Combat 14），禍＝失手把他打死（作者定），禍分支不得進戰鬥。
- 代價不只落在錢、面子、好感，也可以落在路線或後續機會（作者 2026-09-27）。
- 給作者看的待決事項，每一條都寫成「問題｜建議做法｜替代做法」，方便作者用選單點選。
- 不自創單字名詞；東漢稱謂與用詞（「縣衙」不用，寫「官府」）。`

const COMMON = `你在做《異麒麟》高難度檢定的提案（第五批，${DATE} 規則，走向指南第二十二版）。規矩全在 ${GUIDE}：第一節三個分類與〈選項格式〉、第四節引擎寫法、第五節走向細則、第六節規則、第七之二節指引（骰子亮）、第十一節〈已定場次清單〉最後一列（張寧線／02蠶女白馬.json 醉漢掄巴掌）與〈執筆 agent 通用規則〉。本提示只摘要，拿不準翻指南那一節；指南與本摘要衝突以指南為準。前幾批的定稿可當範例：劇情/舊創作稿/高難度檢定_碰瓷.md、_狗頭人打劫.md、_洞口對峙.md 的〈✅ 定稿〉節（未選原稿各節不要看）。
- 選項格式（已定）：檢定標籤＋題語，選單上沒有主角的話、不加引號、不出現分類名：福禍 [em2][威嚇檢定][/em2][em3]禍兮福倚，福兮禍伏[/em3]。真正的話在擲骰之後的主角發言格才講。一般檢定選項照 [em2][威嚇檢定][/em2]「短版選單句」。不檢定的選項是短版選單句，後面接主角發言格。
- 福禍：過＝三倍經驗（該對話一般檢定 +10 → +30）＋福；不過＝禍，一條新分支，不是原本的失敗。
- 引擎寫法（違反即退）：一個選項一顆骰，自己接一個擲骰格，不跟別的選項共用。結構照 劇情/轉成json指南.md §4.2（含第 7 項底下 ⚠ 高難度例外）：選項格（actorID MC1，Description「選項N」，不掛教學：教學只在碰瓷）→ 擲骰格（actorID 0、text 空、Description「威嚇檢定」、Sequence 四段：SetContinueMode(false);SetContinueMode(original)@Message(EndRoll);Continue()@Message(EndRoll);BeginDiceRoll(Manual,IntimidationCheck,〈難度〉);）→ 主角發言格（MC1，把話講完整，過不過共用）→ 成功分支首格 Conditions: IsPassDice() == true; ／失敗分支首格 Conditions: IsPassDice() == false;。
- Description 照 劇情/轉成json指南.md §1 詞表：選項格「選項N」、擲骰格「威嚇檢定」、成功首格「檢定成功、威嚇經驗增加」、失敗首格「檢定失敗」、好感帶角色名（「張寧好感度下降」）、戰鬥格照詞表，不寫數值、不寫說明。
- 指引（骰子亮）：帶高難度選項的選單之前、選單前最後一格，放固定旁白一字不改：[panel=6]＊（懷裡的麒麟骰亮了一亮。光隔著衣襟透出來，隨即又暗了。）＊，actorID role2；這一格只有骰子和主角，不寫同伴、不寫判語、不寫燙熱顫震；主角立繪可切 SetPortrait(MC1,pic=12);，不掛表情特效。不另寫介紹、不掛教學。
- 硬紅線：不自取變數名、任務號、教學 ID（作者沒給的一律留 ＿＿）；SetFlag／GetFlag 禁用；不新建變數、任務、地點、道具、NPC；已進 Unity 的節點不改號、不改字、不動 title（改 links 可以）；新格不編號；不寫 title。
- 內容三道線：給AI看的指南/世界觀.md 第八節禁詞（五胡亂華、司馬、篡魏、三國歸晉、輪迴、重來、前世）；給AI看的指南/文本創作指南.md 0.6 揭露節奏（張寧是張角之女不揭；不碰符水、太平道、張角）；@角色設定/饕餮.md 第十節廢案清單與第四、五節（燙＝她醒，高難度檢定的格子不得寫燙熱顫震）。用東漢的價值觀寫，不加道德評語，旁人怎麼看他才是反應。
- 稿的寫法（創作稿）：說話者行 **旁白:**／**你:**／**〈角色〉:**（主角一律「你」），旁白 [panel=6]＊（…）＊，台詞「…」；每格底下 - actorID: / - Sequence: / - Conditions: / - Script: / - Description: / - 註記: 各一行，有才寫；立繪與表情寫在 Sequence（照 給AI看的指南/立繪指令轉換規則.md；蠶兒 role61、醉漢 role62 無立繪，不寫他們的 SetPortrait；選單前那一格不掛表情特效；開了的特效下一格要關）。分岔用 ▶，合流寫「→ 接 #N」，新格用【A】【B】…標，不寫 entryID。不動 Json/、不動 Unity、不動回讀稿、不動 ${GUIDE}。
- 文風規矩（違反即退）：1. 旁白看得見你做什麼、看不見你想什麼：不寫內心話、不替玩家下感受或結論、不替角色斷定心裡怎樣。2. 寫結果和狀態，不寫過程；一格裡同一個人的動作最多兩拍；不編精確數目、距離和純造景小細節。3. 作者退過的句型不得再犯：「不是 X，是 Y」翻轉句；否定句收尾造氣氛；「像……」比喻巧句收尾；收尾加新判語；旁白先把下一格台詞要講的事講掉；同一件事隔幾格又講一遍。4. 句子寫完整，不斷碎句：旁白一格兩三句、每句十九到二十五字、不留五字以下的句子；角色台詞一句十五字上下、可見字數 50 內，照那個角色既有的口吻。5. 旁白裡不寫「」引號；**全篇不用破折號「——」，台詞也不用**（打斷、沒說完用「……」；文風指南旁白卡第 9 條）；[em7] 每十格至多一個、同一人不連掛，[/em7] 後必接標點。6. 不自創單字名詞；東漢稱謂與用詞；硬紅線詞永不進文本。
- 省回合的規矩：情境包已收好本場的規則原文、掛點連線、每條來路、既有台詞、指南摘錄，先讀它；只在拿不準時回原檔查那一段，不要整本重讀。檢查腳本各跑一次就好。給作者看的話用白話短句。日期一律寫 ${DATE}。
${LESSONS}`

const U = {
  key: '醉漢', box: '張寧02', kind: '福禍',
  out: '劇情/高難度檢定_醉漢.md',
  json: 'Json/張寧線/02蠶女白馬.json',
  overview: '劇情/張寧/02 蠶女白馬.md（回讀稿，只讀不改）',
  voices: '醉漢 role62（無立繪、[panel=3]、只出這一趟；本檔 #152、#154、#157、#159 是他全部的話）；蠶兒 role61（無立繪、[panel=1]）；張寧 MC6（先跑 python -X utf8 給AI看的指南/既有台詞.py MC6，讀她的聲口卡與 @角色設定/張寧.md）；你 MC1；旁白 role2',
  anchors: '#151 蠶兒訴苦 → #152 醉漢「臭婆娘，妳在跟誰說話！」→ #153 旁白 → #154 醉漢「男的？賤人，妳敢背著我偷人！」→ #155 旁白「他一巴掌掄過去，你伸手把那隻手腕扣住了。」→ #156 你「聽好，我們是她爹請來的。還有——放尊重些。」→ #157 醉漢「……嘖！那個多事的老東西。」→ #158 → #159 → #160（OpenPanel(3, close)）→ #161 → #162–#164 → #165 四選一：#166 委託是委託 → #170…#177（如實回報，ModifyData(Coin,Player,400)）→ #213；#167 替妳瞞著 → #178…#184（說她死了，一個錢沒有）→ #213；#168 走遠一點 → #185–#187 → 回四選一；#169 張姑娘 → #188…#204 → #205…#212（CF47 entry 1 success）→ #213。#213 是空格，關背景關音樂（parents #177、#184、#212）。全檔 213 節點已進 Unity；本檔既有戰鬥格 #98／#117（Combat 87）是戰鬥包法的範本。',
  spec: `- 掛點（作者 2026-09-28 定）：#155 之後、#156 之前新開一個選單。#155 的 links 改成接固定旁白格，固定旁白格再接選單；#155 的字不改。⚠ #155 原文已寫「你伸手把那隻手腕扣住了」，所以選單發生在手腕已經扣住之後：三個選項是扣住之後你怎麼做。
- 選單三項：
  ① 現況，不檢定：短版選單句的選項格 → 接既有發言格 #156 → #157 原線，#156 以後一格不動。
  ② 一般威嚇 IntimidationCheck，難度暫 15（作者填）：過＝他縮手，ModifyData(FeatExp,Player,Intimidation,10); → 接回 #157；不過＝直接進戰鬥，用碰瓷那場的 ID BeginFight(Combat,14)，包法照本檔既有戰鬥格 #98／#117 與走向指南第四節（戰鬥格＋緩衝格＋IsPassFight 成敗分支首格；碰瓷那格開頭的 ControlStage(TriggerEvent,fight01,All) 是碰瓷場景專用，不照抄，寫進待作者定）。打贏接回 #157（前面可加一兩格收住打完的局面）；打輸走哪裡由各版提一案，三版三種（參考：碰瓷打輸是軟輸 #2043，他要錢）。
  ③ 福禍威嚇 IntimidationCheck，難度暫 25（作者填）：過＝三倍威嚇經驗 ModifyData(FeatExp,Player,Intimidation,30); ＋福（各版提一種，三版三種）→ 接回 #157 原線；不過＝禍：失手把他打死（作者 2026-09-28 定）。
- 接回 #157 的條件：#157 醉漢「那個多事的老東西」指的是蠶兒的爹，所以 ②③ 走到 #157 之前，「我們是她爹請來的」這件事一定要已經說出口（寫在發言格或過的那一格），不然接不上。
- 禍分支：人死了就接不回 #157–#212（四選一「離開這個人」、張寧「方才那個人跟妳爹哪裡不一樣」都以他活著為前提）→ 禍分支自己收尾，最後接 #213。四選一與張寧勸蠶兒那段在禍分支不播，也不要改寫成另一版。要寫：
  1. 他怎麼死：看得見的結果，不寫過程細節、不血腥、不寫內心話、不渲染。
  2. 蠶兒的反應：貼她的既有句與處境（#162「是他肯陪著我」）。
  3. 張寧：扣好感 ModifyData(FavorabilityExp,MC6,-＿＿);（數字作者填，碰瓷是 −20；Description「張寧好感度下降」），可配她一句話，但不表態、不碰 0.6（符水、太平道、張角、她的來歷）；聲口照卡（冷、損人）。
  4. 委託怎麼回報：各版提一案，三版三種（商人那頭怎麼交代、錢給不給；參考 #177 如實回報給 400、#184 說她死了一個錢沒有）。
  不關 CF47、不動 CF47 的狀態；禍分支不得進戰鬥。
- ⚠ 文本創作指南 0.2.3「檢定失敗不得寫成有人死亡」在這一場由作者 2026-09-28 破例（醉漢 role62 無名、只出一趟、無設定檔）；其他人不得死、不得留殘。
- 選單前固定旁白照七之二；不掛教學。張寧在這場的立場見 #163、#174–#176、#189–#203。
- 走向指南第八節本場待作者填四件：威嚇難度（第二章暫 25）、張寧扣多少好感、一般威嚇打輸走哪裡、禍分支的委託怎麼回報。各版都要給自己的一案，終審合併成「問題｜建議｜替代」。`,
  lenses: [
    { tag: '甲', name: '照清單最省', brief: '格數最少、差別最集中：福給最直接的一種；禍幾格交代完（死、蠶兒一句、張寧一句、委託一句旁白）。' },
    { tag: '乙', name: '接戲', brief: '先把總覽稿 02 蠶女白馬 從 #141 讀到 #213，照這場原本的嗓子寫；蠶兒與張寧的反應要跟她們原本會說的話是同一個人；格數可比甲多一兩格。' },
    { tag: '丙', name: '另一種演法', brief: '刻意換一種福、換禍之後的收法（誰先開口、蠶兒做了什麼、委託換一種交代），讓作者有真的不一樣的選擇；仍守全部規矩。' },
  ],
  checks: [
    '分類與走向：福禍。過＝三倍威嚇經驗（+30）＋福 → 接回 #157；不過＝失手打死（作者定）→ 禍分支自己收尾到 #213',
    '選單三項齊（① 現況接 #156、② 一般威嚇、③ 福禍威嚇）；兩顆骰各自的擲骰格四段、隔一格、IsPassDice 掛分支首格；選項格式與題語；選項格不掛教學；Description 只准詞表',
    '一般威嚇不過進戰鬥：BeginFight(Combat,14) 包法照本檔 #98／#117、緩衝格、IsPassFight 分支；打贏接 #157；打輸的走向（本版一案）寫清',
    '禍的線：只有醉漢死、其他人不死不殘；不進戰鬥；不播四選一與勸蠶兒；不動 CF47；張寧扣好感留 -＿＿ 並帶角色名 Description；委託回報寫清；最後接 #213',
    '指引：選單前最後一格是固定旁白一字不改；不寫燙熱顫震；選單前一格不掛表情特效',
    '連續性：#155 字不改只改 links；②③ 到 #157 之前「她爹請來的」已說出口；每條路都接得通（誰在場、誰說過什麼）',
    '內容三道線與價值觀：禁詞、0.6（張寧不表態、不碰符水太平道張角）、饕餮廢案；東漢價值觀；死亡不渲染、不加道德評語',
    '文風規矩 1–6 與聲口：醉漢、蠶兒貼既有句；張寧照卡；主角；台詞可見字數 50 內；em7 每十格至多一個',
  ],
}

const packetPath = `${HC}/${U.box}/packet.md`
const draftPath = tag => `${HC}/${U.key}/draft-${tag}.md`
const revisedPath = tag => `${HC}/${U.key}/revised-${tag}.md`
const lensName = tag => { const l = U.lenses.find(x => x.tag === tag); return l ? l.name : '' }

function unitHead() {
  return `場：${U.key}（${U.kind}）｜情境包：${packetPath}
JSON：${U.json}（已進 Unity，新格不編號、不改既有格的字、不動 title）
總覽稿：${U.overview}
錨點：${U.anchors}
聲口：${U.voices}
規格：
${U.spec}
本場八項檢查：
${U.checks.map((c, i) => `${i + 1}. ${c}`).join('\n')}`
}

const DRAFT_FILE_FORMAT = `檔案結構（每節都要有，沒有內容寫「（無）」）：
# 起草稿｜醉漢｜〈甲乙丙〉（〈取向名〉）
## 取向（一句）
## 福與禍（各一句：福是什麼；禍之後蠶兒、張寧、委託各怎麼收）
## 檢定（兩顆骰：一般威嚇、福禍威嚇的 FeatID 與暫定難度）
## 掛點與接回（逐條：插在哪一格的 links／哪一格之後 → 接回哪一格：做什麼、幾格）
## 讀的條件（逐行）
## 寫的指令（Script／ModifyData／BeginFight 逐行）
## 戲（創作稿本體：每格 說話者行＋全文，底下 actorID／Sequence／Conditions／Script／Description 有才寫；新格用【A】【B】…標；分岔 ▶；合流「→ 接 #N」）
## 本版對四件待作者填的提案（威嚇難度、張寧扣多少好感、一般威嚇打輸走哪裡、禍分支委託怎麼回報）
## 起草者自檢（逐條對照八項檢查與文風規矩 1–6；節奏檢查的結果貼這裡）`

const scoutPrompt = `${COMMON}

你是本場的情境整理，只讀不改專案檔。本批只有一場：
${unitHead()}

請把情境包寫成檔案 ${packetPath}（用 Write；目錄不存在就建）。內容（純事實、逐字原文，不提改法）：
1. 規則原文：從 ${GUIDE} 逐字抄出第一節整節（含〈選項格式〉與三句題語）、第四節引擎寫法（含戰鬥包法、擲骰四段）、第五節福禍那幾小節、第六節規則、第七之二節「往後每一次」、第八節本場那條待作者填、第九節張寧 02 那幾列、第十一節〈已定場次清單〉最後一列（醉漢）與〈執筆 agent 通用規則〉。
2. 現行拍子：${U.json} 從 #141 到 #213 的每一格（說話者、entryID、[panel=N]、全文、Sequence／Script／Conditions／Description／links），逐字。
3. JSON 事實：#155、#156、#157、#213 的所有 parent；本檔既有戰鬥格 #98／#117 與其緩衝格、IsPassFight 成敗首格逐字抄（包法範本）；Json/小溪村/碰瓷.json 的 Combat 14 那組戰鬥格（#2035 前後、#2042–#2044 打輸那條）逐字抄；CF47 在全案哪幾格設了什麼狀態（grep）；這一支從哪裡調用（Json/探索事件/180年/6月.json #3）、同伴條件。
4. 指引既有句：${GUIDE} 七之二那句固定旁白；前幾批定稿（劇情/舊創作稿/高難度檢定_碰瓷.md、_洞口對峙.md）的〈✅ 定稿〉節各抄一段選單前固定旁白＋選單＋擲骰格＋發言格＋成敗首格，當格式範例。
5. 聲口：醉漢 role62、蠶兒 role61 在本檔每一句；跑 python -X utf8 給AI看的指南/既有台詞.py MC6 撈張寧二十句代表句（含本檔全部）；主角在本檔的句子。
6. 設定：@角色設定/張寧.md 的聲口段與 0.6 相關紅線；劇情/張寧/張寧.md 裡本支（02）的設計段；給AI看的指南/文本創作指南.md 0.2.3 全節與 0.6。
7. 一般檢定的結果：一般威嚇失敗＝進 Combat 14；禍＝失手打死。把兩者寫清，讓起草者避開「禍像一般失敗」。
8. 指南摘錄（作者 2026-09-26 裁示：起草者只讀情境包，視同讀過三份指南，所以這一節要抄齊）：逐字抄出 給AI看的指南/文本創作指南.md 第零層高概念那幾段、0.2.3 全節、0.6、2.1a 全節；給AI看的指南/世界觀.md 第八節全節；給AI看的指南/武俠文風創作指南.md〈零、常犯十條〉整節（**放在情境包最前面，起草者先看錯例再動筆**）、第四節開頭通則、旁白卡、你（主角）卡、張寧卡（醉漢、蠶兒無卡，註明照第 5 項既有句）、7.1a–7.1c、7.3、第八節自檢清單；@角色設定/饕餮.md 第十節廢案清單與停用術語；劇情/轉成json指南.md §1 Description 詞表、§4.2 開頭通則與選項文字規矩、戰鬥節點那一節；給AI看的指南/擲骰指令轉換規則.md〈擲骰節點的 Sequence 固定寫法〉第 1、2 條與〈常用檢定項目ID對照〉表；給AI看的指南/戰鬥指令轉換規則.md 的包法；給AI看的指南/立繪指令轉換規則.md 裡 MC1、MC6 可用的 pic 格號與表情特效名稱。
寫完檔案後，回傳一頁摘要（兩千字內）：掛點、接回點、來路條件、會開口的角色與 ID、戰鬥包法範本、你發現起草者一定要知道的坑。`

const draftPrompt = lens => `${COMMON}

你是起草者（${lens.tag}｜${lens.name}）。你的取向：${lens.brief}
${unitHead()}

做法（作者 2026-09-26 裁示，省回合）：只讀情境包 ${packetPath}。它的〈指南摘錄〉一節已逐字收了三份指南與各轉換規則裡寫這場戲用得到的節，讀情境包即視同讀過 CLAUDE.md 要求的三份指南，不必再開指南原檔。起草只管寫戲：不回 JSON、總覽稿查連線與來路，接不接得通交給審修。只有情境包真的缺了寫戲非要不可的東西時，才去原檔讀那一段，並在〈起草者自檢〉記一筆。不要改任何專案檔。
把稿寫成檔案 ${draftPath(lens.tag)}（用 Write；目錄不存在就建）。
${DRAFT_FILE_FORMAT}
寫完只跑一次 python -X utf8 給AI看的指南/文風節奏檢查.py <檔>，照報告修一次就交；報告和你修了什麼貼進〈起草者自檢〉。
回傳 JSON：file、approach（一句取向）、fu（一句：福是什麼）、huo（一句：禍之後怎麼收）、self_check（三五句：八項檢查哪幾項你自己拿不準、節奏檢查結果）。`

const revisePrompt = d => `${COMMON}

你是審修（版${d.label}）。一人審一版：逐項查，能修的直接修進稿裡，修不了的列出來。
${unitHead()}

起草稿：${d.file}（先讀）；情境包：${packetPath}；起草者的自檢：${d.self_check || '（無）'}

查什麼：
1. 本場八項檢查逐項：回原 JSON、原總覽稿查證掛點、接回點、每條來路、既有格的字有沒有被改、擲骰格四段、戰鬥包法、IsPassDice／IsPassFight 掛位、獎勵與代價指令、選項格式、Description 詞表（劇情/轉成json指南.md §1）。
2. 文風規矩 1–6 逐句；口吻對照情境包裡那個角色的既有句（讀 給AI看的指南/武俠文風創作指南.md 第四節旁白卡與張寧卡、給AI看的指南/武俠文風審校清單.md）。
3. 福禍另查：禍不像一般失敗、不進戰鬥、只有醉漢死、死亡不渲染；福跟一般成功不一樣。
怎麼修：句子、指令、接法能修就直接修，修完仍要守取向（版${d.label}是「${lensName(d.label)}」），不要修成別的版；該作者定的留 ＿＿ 並記下來。
寫成檔案 ${revisedPath(d.label)}（結構同起草稿），檔尾加三節：
## 旁白逐格表（作者 2026-09-28 要求：每一個旁白格一行——格名｜第 3 條判語、心事、替玩家下感受：過或改｜第 7 條造景細節、精確數目、動作鏈超過兩拍、收尾巧句：過或改｜改了什麼。不准整段打勾，一格一格重讀；文風節奏檢查.py 列的「旁白卡候選」每一條都要在這張表裡有交代）
## 審修紀錄（每一處改動：第幾格、原句→新句、依哪條規矩）
## 待作者定（每條寫成「問題｜建議做法｜替代做法」）
修完跑一次 python -X utf8 給AI看的指南/文風節奏檢查.py <檔> 與 python -X utf8 給AI看的指南/高難度檢定檢查.py <檔>（後者檔頭沒分類會警告，不管它；其他報的要處理）。不要改任何專案檔。
回傳 JSON：file、verdicts（八項各一筆：check、verdict 是 pass／fixed／unresolved、note 一句）、changes（改了幾處）、summary（三五句：這版最大的問題是什麼、修了什麼、還剩什麼）。`

const finalPrompt = revs => `${COMMON}

你是本場的終審兼編輯。三版已各經一名審修。你的工作：再挑一次錯、標一版建議、寫成提案檔、跑兩支檢查腳本。
${unitHead()}

三版審修稿（先全部讀完）：
${revs.map(r => `- 版${r.label}（${lensName(r.label)}）：${r.file}；審修結論：${r.summary}；verdicts：${JSON.stringify(r.verdicts)}`).join('\n')}
情境包：${packetPath}

做法：
1. 挑錯：重點放審修最容易漏的：每條路從 #154 讀到接回點後十格接不接得通、兩顆骰與戰鬥的結構、獎勵與代價指令、選項格式與題語、禍只死醉漢且自己收尾到 #213、#157 之前「她爹請來的」已說出口、三版是不是三個真的不一樣的選擇。發現就直接改，並記進該版的〈審修紀錄〉（標「終審」）。
2. 建議版：挑一版，理由一句。
3. 寫提案檔 ${U.out}（用 Write；已存在就整檔覆寫）。⚠ 作者 2026-09-28 裁示的排法：對話文字放置頂（作者只讀這一段），給 AI 看的東西全放後面。
   第一行「# 醉漢　高難度檢定提案（福禍）｜創作稿／提案，尚未進 JSON」；
   第二段短引用區塊：「📝 ${DATE} 三版待作者挑一版」、「建議版：」＋一句理由、掛點一句（#155 之後新開選單，接回 #157／禍收在 #213）。
   「## 對話」：三版各一小節「### 版一（甲｜取向）」「### 版二（乙｜取向）」「### 版三（丙｜取向）」，每小節只放純對話，一層一層往下：一行一格「說話者：台詞」（主角寫「你」；旁白寫「旁白：」、括號照原文），選單寫「◆ 選擇」後逐項編號，選項照原標記寫（例 [em2][威嚇檢定][/em2][em3]禍兮福倚，福兮禍伏[/em3]），分岔寫「▶ 過」「▶ 不過」「▶ 打贏」「▶ 打輸」並縮排，接回既有戲寫「（接回原本的戲：#N）」；空格、擲骰格、戰鬥格不寫出來；不放任何指令、註記、說明。
   「## 待作者定」：三版的待作者定合併去重，每條「⚠ 問題｜建議做法｜替代做法」；四件待作者填（威嚇難度、張寧扣多少好感、一般威嚇打輸走哪裡、禍分支委託怎麼回報）各一條，建議取自建議版、替代取自別版。
   「## 逐格（給 AI）」：三版各一小節，節首列取向、福與禍、檢定、掛點與接回、讀的條件、寫的指令；「#### 戲」放審修稿的〈戲〉（含 actorID／Sequence／Conditions／Script／Description）；「#### 審修紀錄」放該版紀錄（含終審改動）。
   「## 審修摘要」：每版八項 pass／fixed／unresolved 的數目與剩下的 unresolved 項。
4. 跑 python -X utf8 給AI看的指南/文風節奏檢查.py "${U.out}" 與 python -X utf8 給AI看的指南/高難度檢定檢查.py "${U.out}"，報的照規矩修到不報（改了要同步改〈對話〉與〈逐格〉兩處並記進審修紀錄），或在〈待作者定〉說明為何留。
5. 跑 git -c core.quotepath=false status：本流程只該新增 ${U.out}；不動 Json/、回讀稿、${GUIDE}、其他檔。
回傳 JSON：out、recommended（label、reason）、unresolved（字串陣列，每條「問題｜建議｜替代」）、rhythm（節奏檢查最後一行）、format（格式檢查最後一行）、summary（三五句：三版各是什麼、你改了什麼、為什麼建議那版）。`

const DRAFT_SCHEMA = { type: 'object', properties: {
  file: { type: 'string' }, approach: { type: 'string' }, fu: { type: 'string' }, huo: { type: 'string' }, self_check: { type: 'string' },
}, required: ['file', 'approach', 'fu', 'huo', 'self_check'] }
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

phase('Scout')
const had = A.have || {}
let scoutOk = true
if (!had.packet) {
  const s = await agent(scoutPrompt, { label: 'scout:張寧02', phase: 'Scout', effort: 'xhigh', model: MODEL })
  scoutOk = !!s
}
if (!scoutOk) return { error: 'scout failed' }

const draftsHad = had.drafts || []
const drafts = (await parallel(U.lenses.map(l => async () => {
  if (draftsHad.includes(l.tag)) return { label: l.tag, file: draftPath(l.tag), self_check: '（沿用舊稿）' }
  const r = await agent(draftPrompt(l), { label: `draft-${l.tag}:醉漢`, phase: 'Draft', effort: 'xhigh', model: MODEL, schema: DRAFT_SCHEMA })
  return r ? { label: l.tag, ...r, file: draftPath(l.tag) } : null
}))).filter(Boolean)
if (!drafts.length) return { error: 'all drafts failed' }
log(`醉漢：${drafts.length} 版起草稿就位，送審修`)

const revs = (await parallel(drafts.map(d => () =>
  agent(revisePrompt(d), { label: `revise-${d.label}:醉漢`, phase: 'Revise', effort: 'max', model: MODEL, schema: REVISE_SCHEMA })
    .then(r => r ? { label: d.label, ...r, file: revisedPath(d.label) } : null)))).filter(Boolean)
if (!revs.length) return { error: 'all revisions failed', drafts }

const fin = await agent(finalPrompt(revs), { label: 'final:醉漢', phase: 'Final', effort: 'max', model: MODEL, schema: FINAL_SCHEMA })
if (!fin) return { error: 'final failed', revs }
log(`醉漢：提案檔完成，建議版 ${fin.recommended.label}，待作者定 ${fin.unresolved.length} 件`)
return { date: DATE, out: fin.out, recommended: fin.recommended, unresolved: fin.unresolved, rhythm: fin.rhythm, format: fin.format, summary: fin.summary,
  drafts: drafts.map(d => ({ label: d.label, fu: d.fu, huo: d.huo })),
  revisions: revs.map(r => ({ label: r.label, changes: r.changes, unresolved: r.verdicts.filter(v => v.verdict === 'unresolved').length, summary: r.summary })) }