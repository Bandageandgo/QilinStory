export const meta = {
  name: 'luxin-yingbu-v3',
  description: '呂信線第 3 支〈英布〉整份重寫提案（作者 2026-09-29：探索事件、最早 181/4、無黑幕旁白、不跳時間不回憶），照 hard-check-v3.js 第三級形狀：產生器底稿＋沿用已寫好的情境包、串行起草（乙丙須與前版不同）、差異判定、審修只管結構、文風審∥邏輯審（只列不改）、終審套表並用組裝腳本寫提案檔',
  phases: [
    { title: 'Scout', detail: '情境包沿用（第二級整理員 09-29 已寫成 5516 行；底稿與指南摘錄由主對話跑產生器補齊）' },
    { title: 'Draft', detail: '三名串行（xhigh）：甲三景一線先寫；乙先知後問讀甲、必須不同；丙一場到底讀甲乙、必須都不同；乙丙附差異表' },
    { title: 'Diff', detail: '一名差異判定（medium）：三版兩兩對照，太近的退回重寫一次' },
    { title: 'Revise', detail: '每版一名審修（high）：只管結構八項（探索事件體例、無黑幕、轉場數、三個拍子、變數與好感、擲骰、選單、Description），直接修' },
    { title: 'Style', detail: '每版一名文風審（max）：逐格填表、對專名表與審校清單、口吻對既有句與退稿實例、直接改字，腳本零警告' },
    { title: 'Logic', detail: '每版一名邏輯審（max）：只列不改，回一張「哪一格、什麼問題、建議改法」的表' },
    { title: 'Final', detail: '一名終審（high）：套邏輯表、重查結構、挑建議版、用提案檔組裝.py 寫回 劇情/呂信/03 英布.md、跑檢查' },
  ],
}

// 用法：Workflow({script: <本檔>, args: {date: '2026-09-29', have: {英布: {packet: true}}}})
// 第二級腳本 luxin-yingbu.js 的 COMMON／LENSES／規格照搬；流程與各步驟提示改成 hard-check-v3.js 的形狀（多Agent創作流程.md 2026-09-29）。
const A = Object.assign({ date: '＿＿＿＿-＿＿-＿＿', have: {}, hc: 'C:/Users/user/AppData/Local/Temp/claude/d--QilinStory/cd880680-3698-44da-ace1-d31280b60af3/scratchpad/hc' }, args || {})
const DATE = A.date
const MODEL = A.model || 'opus'   // 作者 2026-09-26：子 agent 一律 Opus 5.5
const HC = A.hc
const DESIGN = '劇情/呂信/呂信.md'
const CHAR = '@角色設定/呂信.md'
const JIAXU = '@角色設定/賈詡.md'
const OLD = '劇情/舊創作稿/呂信線_03英布（2026-09-27改稿版）.md'
const REVIEW = '劇情/呂信/審稿_2026-09-29.md'
const PREV = '劇情/呂信/02 第三百四十九次.md'
const NEXT = '劇情/呂信/04 霸王渡江.md'
const LAST = '劇情/呂信/06 留信.md'
const EXAMPLE_MD = '劇情/181年事件/02月(支)老兵的委託.md'
const EXAMPLE_JSON = 'Json/探索事件/181年/2月.json'
const FLOW = '給AI看的指南/多Agent創作流程.md'
const GEN = '給AI看的指南/情境包產生器.py'
const ASSEMBLE = '給AI看的指南/提案檔組裝.py'
const RHYTHM = '給AI看的指南/文風節奏檢查.py'
const FORMATCHK = '給AI看的指南/高難度檢定檢查.py'
const EXCERPT = `${HC}/common/指南摘錄.md`

const COMMON = `你在做《異麒麟》呂信線第 3 支〈英布〉的**整份重寫提案**。作者 2026-09-29 裁示（原話）：「這份 MD 文件要重寫，因為裡面不符合寫作規則的部分實在太多。沒有什麼黑幕旁白。這個事件是探索事件，最早會發生在 181 年 4 月。這個事件跳來跳去的，還用回憶的方式去寫，實際上做不到、很難表現得出來，所以整份文件重寫。」規則在他的設計端 ${DESIGN}（§二用一句話說、§三七支表與節奏形狀、§四結局怎麼算、§五好感、§九紅線）、人物 ${CHAR}（他人評語、稱呼、性格特質、結算線）、${JIAXU}（對外話術克制、慣用物件、與呂信）；舊稿全文已搬到 ${OLD}（只當素材：設計核心、四條紅線、作者 09-27 裁示或選定過的句子優先沿用原字，其餘重寫）；流程照 ${FLOW}（2026-09-29 第三級）。本提示只摘要，拿不準翻情境包裡抄的原文。
- 設計核心（不變）：賈詡評過呂信「與其說像項羽，更像英布」，那句話落到主角手上，不落到呂信臉上。三個拍子：①他問你英布是什麼樣的人（問得像在問今天吃什麼）；②你去打聽：賈詡給一份英布履歷加一句比較，「你是替誰問的」「不必答」，不承認也不否認那句話是他說的，說完就不再理你（邊界到此、責任推回執行者）；③你回到他身邊（石墩、兩罈酒開了一罈、他先講三遍霸王，結尾那一幕永遠是烏江邊上有一條船、項羽沒有上），你三選一：**說實話**（名將、也換過邊、最後謀反被殺；他把碗慢慢喝完、「哈，聽起來倒挺熱鬧」「那不就是個牆頭草」「這種人，能打有什麼用」「霸王當年寧可自刎，也沒渡那條江。那才叫人」，站起來把沒開的那罈塞給你「這罈你拿去，我今天喝夠了」走人）＝ LuxianChose +1、好感 −30；**挑好聽的**（最能打、破秦入關、後來還封了王，換邊謀反一字不露；他過一息輕輕呼出一口氣、「……哦，封了王啊」「那也是條漢子」，把碗滿上喝到夜深）＝ LuxianChose −2、好感 +30；**反問**（「信哥，你問這個做什麼？」；他「沒什麼，隨口問問」「怎麼，隨口不行？」、把碗裡的酒一口灌完往地上一頓「喝酒喝酒，今晚不談死人」）＝ 不動。三選一前一個**背景洞悉（難度 12）**：過了才看見他那碗酒一口沒喝、等得很穩像早知道你要說什麼（洞悉改變的是性質不是結果：沒看穿＝你騙了他，看穿＝你們合謀）；挑好聽的那條路洞悉過的多一格「他沒有問英布後來怎麼了，那後半段他一個字沒提，也沒給你提的空隙」，轉 JSON 用 links 接、不記狀態。賈詡那段一個**背景洞悉（難度 6）**：「你是替誰問的」那一句他手上的東西一下也沒停（過了才播；沒過直接接「不必答」）。開頭可有一個**背景學識（難度 6）**讓主角自己答得出一半（只給名字與「項王帳下的將」之類，換邊、謀反不得在賈詡之前講出；學識失敗的主角後面不得知道「項王帳下」）。檢定過了給 ModifyData(FeatExp,Player,Insight,10)／ModifyData(FeatExp,Player,Knowledge,10)。
- 作者 09-29 三條硬規（違反即退）：(1) **這是探索事件**：一份 JSON、一個入口，觸發時間與條件（最早 181/4、完成〈第三百四十九次〉、好感門檻）由作者在 Unity 事件系統設，入口格不掛 Conditions、Description 寫一句「入口條件作者設：…」（09-28 准的例外）；首格 Sequence 開頭 EnableDialogueBG(ID);，每條路的結尾都要走到一個尾格 actorID "0"、text ""、關背景（寫法照情境包裡抄的 02第三百四十九次.json 六個尾格與 ${EXAMPLE_JSON} 尾格，Description「清除立繪、關閉背景」或「關閉背景」）。(2) **沒有黑幕旁白**：不寫回憶、不寫「後來」「半個月後」「偶爾夜裡」那種跳到日後的收尾、不寫「你當時答了」那種回頭補演；三條路都收在當晚同一場、螢幕上看得見的最後一個動作或一句話；戲從第一格到尾格時間只往前走。(3) **不跳來跳去**：地點與時間的變動只用該版規定的轉場數（甲兩次、乙一次、丙零次），轉場照畫面規則四段、@1 槽換景並收面板；不插敘、不倒敘。
- 寫法紅線（舊稿四條，繼續有效）：1. 呂信不承認這件事扎到他：他問得像隨口問，聽完像沒事人；全關不得說「賈先生是不是覺得我……」這種話，也不得說出他聽過那句評語、不得自陳「我這麼做是為了英豪府」。2. 賈詡不承認那句話是他說的，也不否認；不評論呂信好壞、不解釋自己為什麼這樣看；他只給履歷和一句比較，說完就不再理你。3. 不得有人提「呂布」「三姓家奴」「日後背主」，那是玩家的知識。4. 不得讓任何人替呂信辯護或定罪；主角不勸他、不點破、不把烏江跟他扯在一起。另：不得說破項羽／英布／渡江的對位（那是〈渡江〉的效果）；烏江那個路標句（「烏江邊上有一條船，項羽沒有上」）全關只一處；石墩要在（全線母題：第 2 支等人、第 3 支講三遍霸王、第 6 支酒不開）；選項 1 講壞的那半（換邊）、選項 2 講好的那半（封王），並排一眼分得出；「牆頭草」「那才叫人」留給呂信說實話那條說；他不生氣、不追問、不失態，說實話那條他做的唯一一件事是把酒留下、把自己帶走，代價只寫沒有酒，不寫疏遠、不寫受傷。
- 誰知道什麼（審稿 09-29 抓到的，重寫不得再犯）：學識失敗的主角不知道英布是「項王帳下」的，問賈詡的問法要兩條路都說得通；**賈詡的履歷史實要對**：英布六縣人、臉上有黥，先從番君起兵，歸項梁、再隨項羽，鉅鹿破秦、新安坑降卒、入關，項羽封他九江王（在先），與項羽生隙後隨何來說，歸漢，漢四年立淮南王（在後），高祖十一年謀反、兵敗被殺；「羽之神勇千古無二」是後世的話，光和二年引不到，要引就引《史記・項羽本紀》項羽自己的話「七十餘戰，所當者破，所擊者服，未嘗敗北」或太史公「近古以來未嘗有也」；忠不忠不是項羽與英布的軸（弒義帝兩人是同謀），軸是「悲劇英雄式的純粹」對「更懂得在亂世裡為自己找位置」；呂信沒講過的話不能當講過（舊稿「說了隨口問問」錯，他先前沒說過隨口）；「每一次都換得很準」若把謀反也算換邊就跟「兵敗被殺」打架，要寫就寫「前頭那幾次」或另寫；碗裡的酒與兩罈酒的去向（一口沒喝、慢慢喝完、一口灌完、重新滿上、沒開的那罈塞給你）前後要對得上；主角夜裡才到的地方不寫「今天第一次」。
- 接口：前一場〈第三百四十九次〉收在演武場石墩酒局（「這罈還沒見底呢」「兩個空罈，石墩上兩個人」）；181/1 年關他在府裡（「喝酒喝酒，今晚不算帳！」）、賈詡也在府裡。後一場〈渡江〉最早 181/6，他問「霸王要是渡了那條江，他還是霸王嗎」，直接扣本場「烏江邊上有一條船，項羽沒有上」；〈渡江〉黑幕「每次講到霸王，他都會在烏江那裡停半息」；〈留信〉#54 他親口說「賈先生說我像英布」、#541「英布後來封了王。項羽呢？」。所以本場結尾不得寫「他往後再沒提過那兩個字」這類把日後封死的句子（反正也沒有黑幕）；封王那半句有沒有人跟他講過，本場不必交代。
- 引擎硬紅線：只寫既有變數 LuxianChose（Script 寫 Variable["LuxianChose"] = Variable["LuxianChose"] + 1; 與 Variable["LuxianChose"] = Variable["LuxianChose"] - 2;，照 02第三百四十九次.json #286／#287）；好感 ModifyData(FavorabilityExp,MC2,-30)／ModifyData(FavorabilityExp,MC2,30)（設計端 §五數字警告提到「英布 −30 減成 −10」是解法之一、未拍板，稿內照 −30 寫、列待作者定）；不新建變數；SetFlag／GetFlag 禁用；任務號、entry 一律 ＿＿（本場要不要留完成記號給〈渡江〉讀，列待作者定，不自己寫 SetQuestState）；title 不寫；Description 只寫 劇情/轉成json指南.md §1 詞表的標籤（入口格那句例外）；音樂 ID 不得自創，稿內只寫「音樂：作者填」；背景圖只用 給AI看的指南/畫面指令轉換規則.md §2 表裡既有的（演武場 TrainingGround、書房 StudyRoom）；擲骰照 給AI看的指南/擲骰指令轉換規則.md 四段寫法（擲骰格 text 空、Sequence 就是四段不多不少、只指一個緩衝格；成敗 Conditions IsPassDice() == true／false 寫在再下一層；緩衝格 text 空要 Continue();，有台詞不加）；選項格 actorID MC1、Description「選項N」、選項比底下那句短（文風指南 7.3、轉成json指南 §4.2）；立繪照 給AI看的指南/立繪指令轉換規則.md（MC1 4.1 表；MC2 五立繪 1 一般／2 生氣／3 閉眼無奈／4 驚訝／5 傻眼；MC4 五立繪，賈詡不下 pic=4 驚訝，他的情緒在手上的東西不在臉上）；表情特效照 5.2（Proud 只給自誇，讚別人不掛；不要六個全 Proud；賈詡那段至少一個；有開就有關）；NPC 台詞加 [panel=1]（MC2、MC4 都用位置 1，兩人不同時在場）。這是新 JSON 檔（定稿後進 Json/探索事件/181年/4月.json，新檔，檔位作者確認；舊 Json/呂信線/英布.json 107 格作廢，去留作者定），提案期新格用【A】【B】…標、不編號。
- 稿的寫法（創作稿，組裝腳本會把〈戲〉轉成對話置頂給作者讀）：每格一行說話者行 **旁白:**／**你:**／**呂信:**／**賈詡:**（主角一律「你」），旁白 [panel=6]＊（…）＊，台詞「…」；每格底下 - actorID: / - Sequence: / - Conditions: / - Script: / - Description: 各一行，有才寫；新格用【A】【B】…標在說話者行前一行，不寫 entryID；分岔用 ▶、合流寫「→ 接【X】」；選項格的 Description 寫「選項N」（組裝腳本靠它標 ◆）；轉場格、擲骰格、緩衝格、尾格是空 text 的格，說話者行寫 **（空格）:** 並在前一行加一行斜體提示如 *（轉場：換 StudyRoom，收面板）*、*（背景洞悉 難度 12）*、*（尾格：關背景）*。不動 Json/、不動 Unity、不動回讀稿、不動設計端、不動角色檔；git 只准讀（不 stash、不 checkout、不 reset）。
- 文風規矩（違反即退）：1. 旁白看得見你做什麼、看不見你想什麼：不寫內心話、不替玩家下感受或結論、不替角色斷定心裡怎樣（「像早知道你要說什麼」這種整串推理的收束可以，單獨一格的判語如「他要的不是答案」不行）。2. 寫結果和狀態，不寫過程；一格裡同一個人的動作最多兩拍；不編精確數目、距離和純造景小細節。3. 作者退過的句型不得再犯：「不是 X，是 Y」翻轉句；否定句收尾造氣氛（「什麼也沒做」）；「像……」比喻巧句收尾；頂真巧句（「停得很短，短到……」）；收尾加新判語；旁白先把下一格台詞要講的事講掉；同一件事隔幾格又講一遍；「你們兩個都知道」那型對稱句；「你一直以為……」那型替沒看穿的玩家偷偷點破。4. 句子寫完整，不斷碎句：旁白一格兩三句、每句十九到二十五字、不留五字以下的句子；每條分支最後一格旁白至少兩句、三十字；角色台詞一句十五字上下、可見字數 50 內（賈詡的帳房腔短句「說。」「不必答。」是他的聲口，可留，但不連掛、不多用）。5. 旁白裡不把整句台詞包進「」（引一兩個字可以）；**全篇不用破折號「——」，台詞也不用**（打斷用「……」）；[em7] 每十格至多一個、同一人不連掛、[/em7] 後必接標點；說話者自己的動作與語氣進他那句的 [em7]，不佔旁白格。6. 玩家看得到的字不自創單字名詞、不縮專名（對照 給AI看的指南/專名表.txt）；東漢稱謂與用詞（主角喚信哥、喚賈詡先生、對賈詡自稱弟子；呂信叫主角小子／好小子／兄弟／喂、自稱我／老子／你信哥；不互稱師兄師弟；「重點」這類現代抽象名詞不進旁白）。
- 出場的人：只准情境包名單表上的四人（主角 MC1、呂信 MC2、賈詡 MC4、旁白 role2）開口；府裡旁人可以在旁白裡一句帶過，不開口、不下立繪。
- 動機先於機制：他為什麼問、為什麼裝隨口，要從戲裡看得出來（不用旁白解釋、不替他編心事、玩家看不見是允許的結果）；三選一是選擇不是考題，三條都寫得像個人會做的事，「反問」不是逃避的懲罰版、是把選擇權還給他。「主角當工具」那種太方便的寫法不要。
- 省回合的規矩：情境包已收好設計端原文、舊稿全文（含作者裁示句標記）、探索事件體例、前後場接口、181 年時序、兩人既有句、審稿清單、指南摘錄；底稿有名單表、各角色聲口卡、角色檔前段、既有台詞、退稿實例；指南摘錄 ${EXCERPT} 收了三份指南與各轉換規則用得到的節。先讀它們；只在拿不準時回原檔查那一段，不要整本重讀。日期一律寫 ${DATE}。給作者看的話用白話短句，不用自創術語。`

const U = {
  key: '英布', box: '呂信英布', kind: '探索事件 181/4',
  out: '劇情/呂信/03 英布.md',
  json: 'Json/探索事件/181年/4月.json（新檔，檔位作者確認；單一入口；提案期不編號；舊 Json/呂信線/英布.json 作廢與否作者定）',
  overview: '前一場：' + PREV + ' 與 Json/呂信線/02第三百四十九次.json（已進 Unity；收在石墩酒局）；後一場：' + NEXT + '（181/6 起；「霸王要是渡了那條江」）、' + LAST + ' 與 Json/呂信線/留信.json（#54、#541 他親口提英布）；探索事件前例：' + EXAMPLE_MD + '、' + EXAMPLE_JSON + '（首格開背景、入口提醒句、轉場、尾格）、Json/主線事件/181年/1月.json（年關，呂信與賈詡都在府裡）；舊稿：' + OLD + '（含 09-26、09-27 兩輪改稿註記）；審稿：' + REVIEW + ' §四〈英布〉72 條。全部只讀不改。',
  voices: '呂信 MC2（五立繪 1 一般／2 生氣／3 閉眼無奈／4 驚訝／5 傻眼；聲口卡；181/1 年關、〈第三百四十九次〉、舊稿的既有句）；賈詡 MC4（五立繪；聲口卡是全案語域天花板、帳房腔短句、情緒在手不在臉、不下 pic=4；〈兩卷〉〈舌戰三家〉〈五原障〉§0 的既有句）；你 MC1（4.1 表）；旁白 role2。名單表只有這四人。',
  anchors: '本場開頭假定：〈第三百四十九次〉演過（他在石墩上等人、酒局收尾）；作者在事件系統設的門（最早 181/4、完成前一支、好感門檻）；農曆四月初夏，夜裡在外頭喝酒不冷；褚人飛還沒來買人（〈渡江〉181/6 起）。本場結尾留下：LuxianChose +1／−2／0、好感 −30／+30／0、三條路都在當晚收；不留旗標、不開新點、不寫日後；〈渡江〉要讀「完成英布」由作者在事件系統設或建任務（稿內 ＿＿、列待作者定）。',
  lenses: [
    { tag: '甲', name: '三景一線', brief: '照設計端那句話「他問你、你去問、你回來答」直著演：白天演武場他扛著刀停下來問你（學識檢定放這裡）→ 轉場（黑幕換 StudyRoom、收面板）你去書房問先生（小刀裁紙邊、「你是替誰問的」洞悉 6、履歷、比較、「不必答」、不再理你）→ 轉場（回 TrainingGround、天黑了）石墩上他等著，兩罈酒開了一罈，三遍霸王，洞悉 12，三選一。兩次轉場、兩個背景。最接近舊稿去掉回憶之後的樣子，是最省的一版。' },
    { tag: '乙', name: '先知後問', brief: '順序倒過來，玩家帶著刀進酒局：書房開場，你為別的事在先生那裡（交差、取東西之類，一兩句帶過、不新開任務、不編差事細節），他問起呂信近況或評點府裡的人，把那句比較和英布的履歷放到你手上，責任照樣推回（洞悉 6 放這裡看他的手）→ 一次轉場到夜裡演武場（TrainingGround），石墩上他叫住你「喂，你讀過書吧」問英布是什麼樣的人 → 三遍霸王、洞悉 12、三選一。一次轉場。學識檢定可以省，或改成讓你在書房接得上先生的話。他問的時候你已經知道那句話從哪來，戲的分量在你怎麼接。' },
    { tag: '丙', name: '一場到底', brief: '全在演武場，傍晚到夜裡，零轉場、一個背景（TrainingGround），時間連續、天色只在旁白裡由亮到暗。他問完說「等著，老子去拿酒」走開 → 先生打場邊經過（兩手籠在袖子裡、不坐、不停腳太久），你追上兩步問，他站著把履歷和那句比較講完就走（洞悉 6 改看他的手或腳步）→ 呂信提著兩罈酒回來坐上石墩，開了一罈，三遍霸王、洞悉 12、三選一。這一版連背景都不換，Unity 最好做；難在先生出了書房怎麼還是他（茶碗、小刀都不在，只剩袖子與短句）。' },
  ],
  spec: `- 形狀：一份 JSON、一個入口、一條線往前走，整場 45–80 格。首格開背景（甲 TrainingGround、乙 StudyRoom、丙 TrainingGround）；轉場數照該版；三選一之後三條路各自收尾，每條路最後一格 links 到尾格（可共用一個尾格，也可各一個）。
- 他問：他扛著刀（或提著什麼）停下來，「喂，你讀過書吧」「英布，是什麼樣的人」；問得像在問今天吃什麼；旁白只寫看得見的（停下、回頭看你一眼）。學識檢定（若有）成功只給名字與他是項王帳下的將，成敗兩條匯合後主角知道的範圍要一致。
- 賈詡：地點與姿勢照該版；他手上要有一件東西（書房：小刀裁紙邊；場邊：兩手籠在袖子裡或別的），情緒全在那件東西上；「你是替誰問的」→ 背景洞悉 6（過：那一句他手上的東西一下也沒停；不過：直接接下一句）→「不必答」→ 履歷（史實對、語域高、帳房腔）→ 你一句（「……他換過邊，還不只一次」之類）→ 他的比較（項羽的難得在沒敗過、沒人比得上；英布也驍勇絕倫，更懂得在亂世裡替自己找位置）→ 說完就不再理你（一格收）。他從頭到尾不點呂信的名字、不承認不否認。
- 酒局：石墩、兩罈酒開了一罈、他把兩隻碗都倒得很滿；你還沒開口他先說起項羽，垓下、二十八騎、力拔山兮，一連講了三遍；「每一遍講的都不太一樣，只有結尾那一幕沒變：烏江邊上有一條船，項羽沒有上。」（全關唯一的路標，只此一句）；你開口「信哥，你白天問的那個人，我去打聽過了」（乙、丙照該版改字）；他「嗯」一聲沒有轉頭、也不問你查到什麼；背景洞悉 12（過：他那碗酒端在手裡一口都沒喝，等得很穩，像早知道你要說什麼；不過：空緩衝格直接接選單）→ 選單三項（短句、選項比底下那句短、actorID MC1、Description 選項1／2／3；後台名 1 說實話／2 挑好聽的／3 反問；四軸不當標題）。
- 三條路（各四到八格，都收在當晚）：說實話→他慢慢把碗喝完→「哈，聽起來倒挺熱鬧」→「那不就是個牆頭草」→你「……」→「這種人，能打有什麼用」→「霸王當年寧可自刎，也沒渡那條江。那才叫人」→站起來把沒開的那罈往你懷裡一塞「這罈你拿去，我今天喝夠了」→他走了，你在石墩上（最後一格寫看得見的：人走了、那罈酒在你懷裡；不寫半個月）→尾格；指令 好感 −30、LuxianChose +1。挑好聽的→過一息輕輕呼出一口氣→「……哦，封了王啊」→「那也是條漢子」→（洞悉過的那條多一格「他沒有問英布後來怎麼了……也沒給你提的空隙」）→他把碗滿上，這一晚講霸王講到夜深（現在式，不寫「後來」）→尾格；指令 好感 +30、LuxianChose −2，洞悉成敗兩條都寫。反問→「信哥，你問這個做什麼？故事都是幾百年前的了」→他轉過頭來看你，看了很久→「沒什麼，隨口問問」→「隨口問一個四百年前的人？」→「怎麼，隨口不行？」（立繪 1 不用生氣臉）→「[em7]把碗裡的酒一口灌完，往地上一頓[/em7]，喝酒喝酒，今晚不談死人。」→一格收在當晚（不寫「往後再沒提過」）→尾格；不動變數不動好感。
- 沿用的作者句（09-27 裁示或選定，優先原字）：「來得正好，陪你信哥喝兩碗。」「你坐下來，看他把兩隻碗都倒上酒，倒得很滿，滿到碗沿。」「你還沒開口，他先說起了項羽，垓下、二十八騎、力拔山兮，一連講了三遍。」「信哥，你白天問的那個人，我去打聽過了。」「他問這一句的時候，手上那把小刀一下也沒停。」「……他換過邊，還不只一次。」「哈，聽起來倒挺熱鬧。」「這罈你拿去，我今天喝夠了。」「破秦、入關，哪一樁都少不了他，後來還封了王。」「……哦，封了王啊。」「他轉過頭來看你，看了很久。」「[em7]把碗裡的酒一口灌完，往地上一頓[/em7]，喝酒喝酒，今晚不談死人。」各版依自己的場合可改字，改了要在〈起草者自檢〉的「沿用的作者句」小節記下為什麼。
- 立繪與背景：MC1 4.1 表；MC2、MC4 各自 [panel=1]；背景只用 TrainingGround、StudyRoom；轉場四段＋@1 收面板換景；擲骰四段；尾格關背景；音樂作者填。
- 設計端連帶（寫在〈起草者自檢〉末小節，不進遊戲文本）：給 ${DESIGN} §三第 3 列（地點欄）、§八「位置是暫置的」那段（探索事件 181/4）與 §十待辦的一兩句。`,
  checks: [
    '設計端對得上：三個拍子都在（他問／你去打聽：履歷＋比較＋不承認不否認＋推回／你回來三選一）；LuxianChose +1／−2／0 與好感 −30／+30／0 的位置與寫法照 #286／#287；洞悉 12 改變性質不改結果、挑好聽的洞悉過多一格用 links 接；洞悉 6 只在賈詡那一句；不記狀態、無旗標、無新變數',
    '作者 09-29 三條硬規：探索事件體例（首格開背景、入口格提醒句、每條路走到尾格關背景、不掛 Conditions 在入口）；沒有黑幕旁白（沒有回憶、沒有「後來」「半個月後」「偶爾夜裡」「你當時答了」、三條路都收在當晚）；時間只往前、轉場數等於該版規定（甲 2、乙 1、丙 0）且每個轉場四段＋@1 收面板換景',
    '四條紅線與接口：呂信不說「賈先生是不是覺得我」、不承認扎到、不自陳；賈詡不承認不否認、不評好壞、不點呂信名字；無人提呂布／三姓家奴／日後背主；無人替他辯護或定罪、主角不勸不點破；不說破項羽／英布／渡江對位；烏江路標句只一處；石墩在；選項 1 換邊／選項 2 封王分得出；結尾不封死日後（〈留信〉他會親口提英布）',
    '誰知道什麼與史實：學識成敗後主角知道的範圍一致（失敗不說「項王帳下」）；賈詡履歷九江王在先、淮南王在後、隨何來說在生隙之後、不引「千古無二」；「換得很準」不跟「兵敗被殺」打架；呂信沒講過的話不當講過；碗與兩罈酒的去向前後一致；轉場前後天色、地點接得上',
    '引擎與留白：擲骰四段＋緩衝格＋IsPassDice 成敗齊＋FeatExp 10；選項格 actorID MC1、Description 選項N、選項比底下那句短；轉場四段＋收面板；尾格寫法照前例；Description 只准詞表（入口句例外）；無 title、無 SetFlag、只寫 LuxianChose；任務號 ＿＿；音樂作者填；背景只用 TrainingGround、StudyRoom；立繪格號在表裡；賈詡不下 pic=4',
    '聲口與文風規矩 1–6（文風審主查）：呂信卡（臭屁、大哥氣、自稱你信哥／老子、叫小子／兄弟／喂）、賈詡卡（語域天花板、短句帳房腔、情緒在手不在臉）、主角卡、旁白卡；破折號零；碎句（節奏檢查）；em7 每十格至多一個；表情特效不全 Proud、賈詡段至少一個、有開有關；台詞可見字數 50 內；不編精確數目；旁白不包整句台詞；專名不縮',
    '動機先於機制：他為什麼問、為什麼裝隨口從戲裡看得出來；三條路都像人會做的事、反問不是懲罰版；沒有主角當工具；洞悉成功那格只寫看得見的、單獨一格的判語一個都沒有',
    '場的形狀：一份 JSON、一個入口、45–80 格；三條路各自收在當晚並走到尾格；作者裁示句沿用或改字有記錄；只有名單表上的四人開口；三版是三種真的不同的場的形狀（景數、轉場數、先知還是先問）',
  ],
}
const OUTS = [U.out]

const packetPath = box => `${HC}/${box}/packet.md`
const packetBasePath = box => `${HC}/${box}/packet-base.md`
const draftPath = (u, tag) => `${HC}/${u.key}/draft-${tag}.md`
const revisedPath = (u, tag) => `${HC}/${u.key}/revised-${tag}.md`
const stylePath = (u, tag) => `${HC}/${u.key}/style-${tag}.md`
const logicPath = (u, tag) => `${HC}/${u.key}/logic-${tag}.md`
const diffPath = u => `${HC}/${u.key}/diff.md`
const lensName = (u, tag) => { const l = u.lenses.find(x => x.tag === tag); return l ? l.name : '' }

function unitHead(u) {
  return `場：${u.key}（呂信線第 3 支，整份重寫；${u.kind}）｜情境包：${packetPath(u.box)}（底稿 ${packetBasePath(u.box)}）｜指南摘錄：${EXCERPT}
JSON：${u.json}
前後場與前例（只讀不改）：${u.overview}
接口：${u.anchors}
聲口：${u.voices}
規格：
${u.spec}
本場八項檢查（1–5、7、8 是結構與事理，審修查；6 是字句，文風審查）：
${u.checks.map((c, i) => `${i + 1}. ${c}`).join('\n')}`
}

const DRAFT_FILE_FORMAT = `檔案結構（每節都要有，沒有內容寫「（無）」；**節名一字不改，組裝腳本靠 ## 前綴切**）：
# 起草稿｜英布｜〈甲乙丙〉（〈取向名〉）
## 取向（一句取向，加一段「場的形狀」：幾景、幾次轉場、背景圖、時間怎麼走、為什麼這樣排最做得出來）
## 檢定（學識 6、洞悉 6、洞悉 12 各在哪一格、FeatID、給的經驗；沒有的寫沒有）
## 掛點與接回（第一行寫一句「探索事件單一入口：〈首格是什麼〉→〈幾條路〉→尾格關背景」；然後逐條：入口格 Description 那句提醒、每個轉場在哪兩格之間、三條路各收到哪個尾格）
## 讀的條件（逐行：IsPassDice 各在哪一格；入口不掛 Conditions）
## 寫的指令（逐行：EnableDialogueBG、轉場四段、LuxianChose、好感、FeatExp、表情特效、尾格；音樂寫「作者填」）
## 戲（創作稿本體：每格 【A】標號一行＋說話者行＋全文，底下 actorID／Sequence／Conditions／Script／Description 有才寫；空 text 的格說話者行寫 **（空格）:**、前一行加斜體提示；分岔 ▶；合流「→ 接【X】」；選項格 Description 寫 選項N）
## 差異表（乙、丙才有：對照前一版，哪幾拍、哪個結果、誰先開口、關鍵動作或物件各換成什麼；甲寫「（無）」）
## 起草者自檢（逐條對照八項檢查與文風規矩 1–6；另兩個小節：「沿用的作者句」哪些照原字、哪些改了為什麼；「設計端連帶」給 呂信.md 的一兩句；節奏檢查的結果貼這裡）`

function draftPrompt(u, lens, priors) {
  const priorText = priors.length
    ? `\n**串行起草（作者 2026-09-29 定）：** 前面已有 ${priors.map(p => `版${p.label}（${lensName(u, p.label)}）：${p.file}`).join('、')}。只讀它們的「## 戲」那一節（不讀逐格附註與自檢）。你這一版**必須跟前面每一版都不同**：拍子、結果、誰先開口、關鍵動作至少三項不一樣，不得只是換句話說。三個拍子與三選一的數值是規格、不能動；不同要落在場的形狀（景數、轉場、誰先在場）、他問的方式、賈詡手上的東西與站的地方、酒局的開法、三條路各自收尾的最後一個動作。寫完在「## 差異表」逐版列出你換掉了什麼；沒有差異表不收。`
    : '\n你是第一版，不必看別人；「## 差異表」寫「（無）」。'
  return `${COMMON}

你是起草者（${lens.tag}｜${lens.name}）。你的取向：${lens.brief}
${unitHead(u)}
${priorText}

做法（作者 2026-09-26 裁示，省回合）：只讀情境包 ${packetPath(u.box)}、底稿 ${packetBasePath(u.box)} 與指南摘錄 ${EXCERPT}。**先把指南摘錄最前面的〈常犯十條〉錯例對改例讀一遍，再讀底稿裡呂信、賈詡、主角的〈退稿實例〉與〈既有台詞〉，再讀情境包裡舊稿全文（1-D，標「作者裁示」的句子優先沿用）與探索事件體例（二），然後才動筆**。讀了這三份即視同讀過 CLAUDE.md 要求的三份指南，不必再開指南原檔。起草只管寫戲：**不回 JSON、回讀稿查連線**，接不接得通交給審修。
出場的人只准名單表上的四人。
把稿寫成檔案 ${draftPath(u, lens.tag)}（用 Write；目錄不存在就建）。
${DRAFT_FILE_FORMAT}
寫完只跑一次 python -X utf8 ${RHYTHM} <檔>，照報告修一次就交，不再重跑；報告和你修了什麼貼進〈起草者自檢〉，沒修完的交給文風審。
回傳 JSON：file（檔案路徑）、approach（一句取向）、scenes（幾景、幾次轉場、背景各是什麼）、cells（格數）、diff（乙丙：差異表的三句摘要；甲：空字串）、self_check（三五句：八項檢查哪幾項你自己拿不準、節奏檢查結果）。`
}

function diffPrompt(u, drafts) {
  return `你是差異判定，只讀不寫戲。場：${u.key}（呂信線第 3 支整份重寫，${u.kind}）。三版起草稿：
${drafts.map(d => `- 版${d.label}（${lensName(u, d.label)}）：${d.file}`).join('\n')}
只讀每份的「## 戲」與「## 差異表」兩節。作者的規矩（2026-09-29）：乙必須跟甲不同、丙必須跟甲乙都不同；「不同」看四樣：拍子（發生了什麼事、順序、幾景幾次轉場）、結果（三條路各自收尾的最後一個動作與畫面）、誰先開口（每一景第一句是誰、賈詡在哪裡怎麼開口）、關鍵動作或物件（他扛的東西、賈詡手上的東西、酒怎麼開、碗怎麼處理）。只是換句話說、換個形容，不算不同。⚠ 三個拍子的骨架、三選一與數值、幾句作者裁示句是規格，三版本來就會相同，**不算在四樣裡**。
判法：三組兩兩對照（甲乙、甲丙、乙丙），每組列出四樣裡相同的有幾樣、相同的是什麼；四樣裡有兩樣以上相同就算「太近」。
把判定寫成檔案 ${diffPath(u)}（用 Write）：一張三列的表（組｜相同幾樣｜相同的是什麼｜太近與否），底下每個「太近」的組寫一段「後面那版重寫時不准再用的拍子」清單。
回傳 JSON：pairs（每筆：pair 例「甲乙」、same_count 整數、same_items 字串、too_close 布林）、redo（要重寫的版標，甲乙太近退乙、與丙有關的退丙；沒有就空陣列）、forbid（給重寫者的「不准再用」清單，一句一條）。`
}

function revisePrompt(u, d) {
  return `${COMMON}

你是審修（版${d.label}）。一人審一版，**只管結構與事理的規格，不管文風**（文風另有文風審）：逐項查，能修的直接修進稿裡，修不了的列出來。
${unitHead(u)}

起草稿：${d.file}（先讀）；情境包：${packetPath(u.box)}（先讀設計端、舊稿裡的作者裁示句、探索事件體例、接口、審稿清單那幾節）；底稿：${packetBasePath(u.box)}；起草者的自檢：${d.self_check || '（無）'}

查什麼（八項裡的 1–5、7、8）：回 ${DESIGN}、${CHAR}、${JIAXU}、${EXAMPLE_JSON}、Json/呂信線/02第三百四十九次.json 尾格與 #286／#287、留信.json #54／#541 查證三個拍子、變數與好感寫法、探索事件體例（首格、入口句、轉場四段收面板、尾格）、無黑幕、轉場數、四條紅線、史實、留白（＿＿）有沒有被人取了名、Description 詞表、背景圖與立繪格號在不在表裡、擲骰四段與緩衝格、選項格式、只有名單表上的四人開口、審稿清單 72 條裡的結構與事理毛病有沒有換個樣子又出現。
怎麼修：指令、接法、格的增刪能修就直接修；**不改台詞的字句**（那是文風審的活；發現文風問題記在〈給文風審〉一節）；修完仍要守取向（版${d.label}是「${lensName(u, d.label)}」），不要把它修成別的版；該作者定的不要替作者定，留 ＿＿ 並記下來。**不改動格的順序與【A】【B】標號**（後面文風審與邏輯審並行，靠標號對格；非加格不可就用【A1】這種夾號）。
寫成檔案 ${revisedPath(u, d.label)}（結構同起草稿，節名不改），檔尾加三節：
## 審修紀錄（每一處改動：第幾格、原句→新句、依哪條規矩）
## 待作者定（修不了或不該由 AI 定的；每條寫成「問題｜建議做法｜替代做法」）
## 給文風審（你順眼看到的文風問題，只列格與一句話，不改）
修完跑一次 python -X utf8 ${FORMATCHK} <檔>（這支是給高難度檢定寫的：檔頭沒分類、沒題語的警告不管；它報的留白、禁詞、Description、em7、title、SetFlag、一般擲骰四段要處理）。不要改任何專案檔；git 只准讀。
回傳 JSON：file、verdicts（八項各一筆：check、verdict 是 pass／fixed／unresolved、note 一句；第 6 項寫 pass 並註「交文風審」）、changes（改了幾處）、summary（三五句：這版最大的問題是什麼、修了什麼、還剩什麼）。`
}

function stylePrompt(u, r) {
  return `${COMMON}

你是文風審（版${r.label}）。審修已經修過結構，你**只管字句**：逐格填表、對照專名表與審校清單、直接改字。邏輯審跟你同時在看同一份審修稿（他只列不改），所以你**不得改動格的順序、增刪格、改【A】【B】標號**，只改字句與 Sequence 裡的表情。
${unitHead(u)}

先讀：指南摘錄 ${EXCERPT} 最前面的〈常犯十條〉、〈審校清單第一部分〉甲到辛、旁白卡、呂信卡、賈詡卡、主角卡；底稿 ${packetBasePath(u.box)} 裡呂信、賈詡、主角的〈既有台詞〉與〈退稿實例〉；情境包 ${packetPath(u.box)} 1-D 舊稿全文裡標「作者裁示」的句子（沿用的要跟原字對）；審修稿 ${r.file}（含它檔尾的〈給文風審〉）。
把審修稿整檔複製成 ${stylePath(u, r.label)}（用 Write），在這份上改。逐格做：
1. 每一格一行填進「## 文風逐格表」：格｜甲到辛詞表（過／改）｜常犯十條（過／改，第幾條）｜縮寫與自創名詞（對照 給AI看的指南/專名表.txt；過／改）｜稱謂（信哥／先生／弟子／小子／你信哥；過／改）｜節奏（句數、每句字數；旁白一格兩三句、每句十九到二十五字；台詞一句十五字上下、可見字 50 內；過／改）｜結尾旁白（三條路各自最後一格至少兩句三十字；過／改／不適用）｜em7（每十格至多一個；過／改）｜改了什麼。**不准整段打勾，一格一格重讀，唸出聲。**
2. 口吻：呂信的句子對照他的既有句（181/1 年關、〈第三百四十九次〉、舊稿）與退稿實例，臭屁、大哥氣、老子、你信哥；賈詡對照〈兩卷〉〈舌戰三家〉那種語域天花板與帳房腔短句，情緒在手不在臉；主角照主角卡；旁白照旁白卡（不寫「你見過」「今天第一次」這類替玩家定經歷的話）。
3. 特別查：破折號零；旁白不包整句台詞；選項比底下那句短；「重點」這類現代抽象名詞；賈詡履歷那幾句唸出聲順不順、史實字眼對不對（九江王／淮南王／隨何）。
4. 改字仍守取向（版${r.label}是「${lensName(u, r.label)}」）與規格；不動指令、不動接法（那是審修的活，發現問題記進〈待作者定〉）。作者裁示句沿用的不改字，除非該版場合非改不可，改了記理由。
5. 每一處改動記進「## 文風審紀錄」：第幾格、原句→新句、依哪條（詞表哪一類／常犯第幾條／旁白卡第幾條／哪句既有句）。
6. 跑 python -X utf8 ${RHYTHM} <檔>，報的每一條都處理或在逐格表交代為何留，**最多跑三次，交出去時腳本零警告**。
不要改任何專案檔；git 只准讀。
回傳 JSON：file、rows（逐格表幾列）、changes（改了幾處）、rhythm（腳本最後一次的結果一句）、summary（三五句：這版文風最大的毛病、改了什麼、還剩什麼）。`
}

function logicPrompt(u, r) {
  return `${COMMON}

你是邏輯審（版${r.label}）。**只列不改**（作者 2026-09-29：文風審同時在改字，兩人不能同時改一份檔；你的表由終審套進去）。先讀情境包 ${packetPath(u.box)} 裡前後場接口、探索事件體例、史實、審稿清單那幾節，底稿 ${packetBasePath(u.box)} 第 6 節兩人的既有台詞，再逐格讀審修稿 ${r.file}。
${unitHead(u)}

只看六件事（規矩、格式、口吻不歸你）：
1. 誰知道什麼：每一格說話的人、主角、旁白此刻知道的事，是不是前面已經看見或聽見的。學識失敗的主角不知道「項王帳下」；主角不知道賈詡那句比較直到他說；呂信全場沒聽見賈詡那段（乙、丙尤其要看他在不在聽得見的地方）；同一件事不認第二次、不講第二次；沒講過的話不當講過。
2. 先後因果：先問才有答、先倒酒才有碗、先講三遍才有「結尾那一幕」；轉場前後的天色、時辰、地點接得上（甲白天→書房→夜；乙書房→夜；丙傍晚→夜連續）；賈詡出書房（丙）站在哪、往哪去、走了沒。
3. 東西的去向：兩罈酒（開了一罈、沒開的那罈塞給你）、兩隻碗（一口沒喝／慢慢喝完／一口灌完／重新滿上）、他扛的刀、賈詡手上的東西；沒有憑空多出來的。
4. 旁白和台詞不打架：旁白不重講台詞剛講的事，也不比台詞晚一步才交代台詞已經用到的事實；選項文字跟後面那兩句對得上（選項 1 換邊、選項 2 封王）。
5. 條件與分支：洞悉 12 過與不過兩條路各自通；挑好聽的洞悉過多的那格只在洞悉過那條；三條路各自走得到尾格；擲骰格只指一個緩衝格、成敗 Conditions 在再下一層；沒有一條路漏掉變數或好感指令、也沒有一條路加兩次。
6. 前後場接口：開頭假定的事前一場真的演過（〈第三百四十九次〉石墩酒局）；結尾留下的狀態後一場用得上（〈渡江〉「霸王要是渡了那條江」扣本場烏江那句、〈留信〉他會親口說「賈先生說我像英布」「英布後來封了王」，本場沒有把日後封死）；探索事件重進會不會重複加減（列出來給作者，不自己加記號）。
把結果寫成檔案 ${logicPath(u, r.label)}（用 Write）：一張表，每列「格（用【A】標號或說話者＋前幾個字）｜哪一件（1–6）｜問題｜建議改成什麼（給出可以直接套的句子或接法）｜確定／存疑」。沒問題就寫「（無）」。不改任何檔；git 只准讀。
回傳 JSON：file、issues（每筆：where、item 整數 1–6、problem、fix、sure 布林）、summary（兩三句：最大的邏輯問題是什麼、幾條確定、幾條存疑）。`
}

function finalPrompt(u, versions, diff) {
  return `${COMMON}

你是本場的終審兼編輯。三版各經審修、文風審、邏輯審。你的工作：把邏輯審的表套進文風審過的稿、重查結構、標一版建議、用組裝腳本寫提案檔、跑檢查。
${unitHead(u)}

三版（先全部讀完）：
${versions.map(v => `- 版${v.label}（${lensName(u, v.label)}）：文風審後的稿 ${v.styleFile}；邏輯審的表 ${v.logicFile}；審修結論：${v.summary}；verdicts：${JSON.stringify(v.verdicts)}；邏輯審摘要：${v.logicSummary}`).join('\n')}
情境包：${packetPath(u.box)}；底稿：${packetBasePath(u.box)}；差異判定：${diffPath(u)}${diff ? `（判定：${JSON.stringify(diff.pairs)}）` : '（沒跑）'}

做法：
1. 套邏輯表：邏輯審標「確定」的每一條，套進該版的文風審稿（${versions.map(v => v.styleFile).join('、')}），套的時候守該版取向與文風規矩，記進該檔「## 審修紀錄」並標「邏輯審」；標「存疑」的你判：成立就套，不成立就在該檔〈待作者定〉說明。
2. 重查結構（審修最容易漏的）：作者三條硬規有沒有哪一版破了（黑幕、跳時間、轉場數、探索事件首尾格）；三個拍子有沒有漏；四條紅線；史實；學識成敗後誰知道什麼；三條路各自走到尾格、變數與好感各一次；留白有沒有被人取了名；作者裁示句有沒有無故改字；只有四人開口；三版是不是三種真的不一樣的場的形狀（對照 ${diffPath(u)}）。發現就直接改該版的文風審稿，並記進〈審修紀錄〉（標「終審」）。
3. 建議版：挑一版，理由一句（通過項最多、最做得出來、動機最看得出來、最合設計端）。
4. 組提案檔：跑
   python -X utf8 ${ASSEMBLE} --場 "英布" --用途 "呂信線第 3 支提案（整份重寫）" --分類 "${u.kind}" --日期 "${DATE}" --建議 <甲乙丙> --理由 "<一句>" --掛點 "探索事件，單一入口，最早 181/4；觸發條件（完成〈第三百四十九次〉、好感門檻）作者在 Unity 事件系統設；三條路各收到尾格關背景" --規矩 "作者 09-29 裁示：整份重寫，探索事件、最早 181 年 4 月、沒有黑幕旁白、不跳時間不回憶。規矩見 ${DESIGN} §三第 3 列、§四、§五、§九 與 ${CHAR}；舊稿（2026-09-27 改稿版，含兩輪 ✏ 註）在 ${OLD}；審稿 72 條在 ${REVIEW} §四。定稿後 JSON 進 Json/探索事件/181年/4月.json（新檔，檔位作者確認）；舊 Json/呂信線/英布.json（107 格）作廢與否作者定。待作者填：好感 −30 要不要改 −10、要不要完成記號與任務號 ＿＿、音樂、JSON 檔位、舊 JSON 去留。" --版 甲="${stylePath(u, '甲')}" 乙="${stylePath(u, '乙')}" 丙="${stylePath(u, '丙')}" --out "${u.out}"
   它會把三版的〈戲〉轉成純對話置頂、逐格與紀錄放後面、合併〈待作者定〉。組完讀一遍：檔頭那幾行、每版對話裡轉場與擲骰的提示行、待作者定，不對就直接改提案檔；提案檔第一行後面加一行「> 三版：甲三景一線（兩次轉場）／乙先知後問（一次轉場）／丙一場到底（零轉場）」。
5. 跑 python -X utf8 ${RHYTHM} "${u.out}" 與 python -X utf8 ${FORMATCHK} "${u.out}"（後者沒分類、沒題語的警告不管），報的照規矩修到不報（改了要同步改該版的文風審稿並記進審修紀錄），或在〈待作者定〉說明為何留。
6. 跑 git -c core.quotepath=false status：本流程只該新增這一份提案檔：${OUTS.join('、')}。${OLD} 與 劇情/舊創作稿/README.md 是主對話開跑前搬的，git status 裡其他已有的改動也不是你的，不要碰、不要「還原」。不動 Json/、回讀稿、${DESIGN}、${CHAR}、${JIAXU}、指南；git 只准讀。
回傳 JSON：out、recommended（label、reason）、unresolved（字串陣列）、rhythm（節奏檢查最後一行）、format（格式檢查最後一行）、summary（三五句：三版各是什麼形狀、你套了幾條邏輯、為什麼建議那版）。`
}

const DRAFT_SCHEMA = { type: 'object', properties: {
  file: { type: 'string' }, approach: { type: 'string' }, scenes: { type: 'string' }, cells: { type: 'integer' }, diff: { type: 'string' }, self_check: { type: 'string' },
}, required: ['file', 'approach', 'scenes', 'cells', 'diff', 'self_check'] }
const DIFF_SCHEMA = { type: 'object', properties: {
  pairs: { type: 'array', items: { type: 'object', properties: {
    pair: { type: 'string' }, same_count: { type: 'integer' }, same_items: { type: 'string' }, too_close: { type: 'boolean' },
  }, required: ['pair', 'same_count', 'same_items', 'too_close'] } },
  redo: { type: 'array', items: { type: 'string' } },
  forbid: { type: 'array', items: { type: 'string' } },
}, required: ['pairs', 'redo', 'forbid'] }
const REVISE_SCHEMA = { type: 'object', properties: {
  file: { type: 'string' },
  verdicts: { type: 'array', items: { type: 'object', properties: {
    check: { type: 'string' }, verdict: { type: 'string', enum: ['pass', 'fixed', 'unresolved'] }, note: { type: 'string' },
  }, required: ['check', 'verdict', 'note'] } },
  changes: { type: 'integer' }, summary: { type: 'string' },
}, required: ['file', 'verdicts', 'changes', 'summary'] }
const STYLE_SCHEMA = { type: 'object', properties: {
  file: { type: 'string' }, rows: { type: 'integer' }, changes: { type: 'integer' }, rhythm: { type: 'string' }, summary: { type: 'string' },
}, required: ['file', 'rows', 'changes', 'rhythm', 'summary'] }
const LOGIC_SCHEMA = { type: 'object', properties: {
  file: { type: 'string' },
  issues: { type: 'array', items: { type: 'object', properties: {
    where: { type: 'string' }, item: { type: 'integer' }, problem: { type: 'string' }, fix: { type: 'string' }, sure: { type: 'boolean' },
  }, required: ['where', 'item', 'problem', 'fix', 'sure'] } },
  summary: { type: 'string' },
}, required: ['file', 'issues', 'summary'] }
const FINAL_SCHEMA = { type: 'object', properties: {
  out: { type: 'string' },
  recommended: { type: 'object', properties: { label: { type: 'string' }, reason: { type: 'string' } }, required: ['label', 'reason'] },
  unresolved: { type: 'array', items: { type: 'string' } },
  rhythm: { type: 'string' }, format: { type: 'string' }, summary: { type: 'string' },
}, required: ['out', 'recommended', 'unresolved', 'rhythm', 'format', 'summary'] }

async function draftOne(u, lens, priors, extraNote) {
  const prompt = draftPrompt(u, lens, priors) + (extraNote ? `\n\n**差異判定退回重寫：** 上一稿跟前面的版太近。這些拍子不准再用：\n${extraNote}\n重寫整份 ${draftPath(u, lens.tag)}（整檔覆寫），差異表重填。` : '')
  const r = await agent(prompt, { label: `draft-${lens.tag}:${u.key}${extraNote ? '(重寫)' : ''}`, phase: 'Draft', effort: 'xhigh', model: MODEL, schema: DRAFT_SCHEMA })
  return r ? { label: lens.tag, ...r, file: draftPath(u, lens.tag) } : null
}

async function runScene(u) {
  const had = (A.have[u.key] && A.have[u.key].drafts) || []
  const drafts = []
  for (const l of u.lenses) {
    if (had.includes(l.tag)) { drafts.push({ label: l.tag, file: draftPath(u, l.tag), self_check: '（沿用舊 run 的起草稿，自檢見檔尾）' }); continue }
    const d = await draftOne(u, l, drafts, '')
    if (d) drafts.push(d)
    log(`${u.key}：版${l.tag} ${d ? (d.scenes + '，' + d.cells + ' 格') : '失敗'}`)
  }
  if (!drafts.length) return { unit: u.key, error: 'all drafts failed' }
  log(`${u.key}：${drafts.length} 版起草稿就位，送差異判定`)
  let diff = null
  if (drafts.length === 3) {
    diff = await agent(diffPrompt(u, drafts), { label: `diff:${u.key}`, phase: 'Diff', effort: 'medium', model: MODEL, schema: DIFF_SCHEMA })
    if (diff && diff.redo && diff.redo.length) {
      const forbid = (diff.forbid || []).map(s => '- ' + s).join('\n')
      for (const tag of diff.redo) {
        const l = u.lenses.find(x => x.tag === tag); if (!l) continue
        const idx = drafts.findIndex(d => d.label === tag)
        const priors = drafts.filter(d => d.label !== tag && u.lenses.findIndex(x => x.tag === d.label) < u.lenses.findIndex(x => x.tag === tag))
        log(`${u.key}：版${tag} 與前版太近，退回重寫一次`)
        const d = await draftOne(u, l, priors, forbid)
        if (d && idx >= 0) drafts[idx] = d
      }
    }
  }
  log(`${u.key}：送審修（只管結構）`)
  const revs = (await parallel(drafts.map(d => () =>
    agent(revisePrompt(u, d), { label: `revise-${d.label}:${u.key}`, phase: 'Revise', effort: 'high', model: MODEL, schema: REVISE_SCHEMA })
      .then(r => r ? { label: d.label, ...r, file: revisedPath(u, d.label) } : null)))).filter(Boolean)
  if (!revs.length) return { unit: u.key, error: 'all revisions failed', drafts }
  log(`${u.key}：文風審與邏輯審並行`)
  const versions = (await parallel(revs.map(r => async () => {
    const [st, lg] = await parallel([
      () => agent(stylePrompt(u, r), { label: `style-${r.label}:${u.key}`, phase: 'Style', effort: 'max', model: MODEL, schema: STYLE_SCHEMA }),
      () => agent(logicPrompt(u, r), { label: `logic-${r.label}:${u.key}`, phase: 'Logic', effort: 'max', model: MODEL, schema: LOGIC_SCHEMA }),
    ])
    if (!st) return null
    return { label: r.label, verdicts: r.verdicts, summary: r.summary, styleFile: stylePath(u, r.label), style: st,
      logicFile: lg ? logicPath(u, r.label) : '（邏輯審失敗，無表）', logicSummary: lg ? lg.summary : '（邏輯審失敗）', logic: lg }
  }))).filter(Boolean)
  if (!versions.length) return { unit: u.key, error: 'all style passes failed', revs }
  log(`${u.key}：送終審`)
  const fin = await agent(finalPrompt(u, versions, diff), { label: `final:${u.key}`, phase: 'Final', effort: 'high', model: MODEL, schema: FINAL_SCHEMA })
  if (!fin) return { unit: u.key, error: 'final failed', versions }
  log(`${u.key}：提案檔完成，建議版 ${fin.recommended.label}，待作者定 ${fin.unresolved.length} 件`)
  return { unit: u.key, out: fin.out, recommended: fin.recommended, unresolved: fin.unresolved, rhythm: fin.rhythm, format: fin.format, summary: fin.summary,
    diff: diff ? { pairs: diff.pairs, redo: diff.redo } : null,
    versions: versions.map(v => ({ label: v.label, revise_unresolved: v.verdicts.filter(x => x.verdict === 'unresolved').length, style_changes: v.style.changes, logic_issues: v.logic ? v.logic.issues.length : null })) }
}

const haveIt = A.have[U.key] && A.have[U.key].packet
if (!haveIt) return { date: DATE, units: [{ unit: U.key, error: '本腳本假定情境包已就位（have.英布.packet），沒有就先跑第二級的整理或手動跑產生器' }] }
log(`開跑：${U.key}（呂信線第 3 支整份重寫，第三級流程）；情境包沿用 ${packetPath(U.box)}`)
const result = await runScene(U)
return { date: DATE, units: [result] }
