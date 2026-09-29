export const meta = {
  name: 'butterfly-fangqi',
  description: '蝴蝶效應第二案・放棄線與梟雄命盤（第二級流程）：兩場（序章臨走兩句、大廳開命盤），一箱庭一情境包走檔案、每場三起草只讀情境包、三審修一人一版並修、一終審寫提案檔',
  phases: [
    { title: 'Scout', model: 'opus', detail: '一箱庭一名：情境包寫成檔案，只回一頁摘要' },
    { title: 'Draft', detail: '每場三名起草，各寫一版進檔案' },
    { title: 'Revise', detail: '每場一名審修一版：逐項查、能修就修、記錄改動' },
    { title: 'Logic', detail: '每版一名邏輯審（2026-09-28 作者要求加）：誰知道什麼、先後因果、人在哪、東西去哪、前後場接口；直接修，記「邏輯審」' },
    { title: 'Final', detail: '每場一名終審：再挑錯、標建議版、寫提案檔、跑檢查腳本' },
  ],
}

// 用法：Workflow({scriptPath: '.claude/wf/butterfly-fangqi.js', args: {date: '2026-09-27'}})
// args.date 必填；args.only 只跑某場（'序章臨走'／'大廳開命盤'）；args.have 沿用已有的情境包／起草稿；args.bf 可換暫存目錄。
// 形狀照 butterfly-shidan.js（作者 2026-09-26 第二級）；規格照 劇情/蝴蝶效應_素材與設計.md 第八節。
const A = Object.assign({ date: '＿＿＿＿-＿＿-＿＿', only: null, have: {}, bf: 'C:/Users/user/AppData/Local/Temp/claude/d--QilinStory/1ddf8b7f-8270-48d3-b27d-a5e5e30f3f7a/scratchpad/bf2' }, args || {})
const DATE = A.date
const MODEL = A.model || 'opus'
const BF = A.bf
const SPEC = '劇情/蝴蝶效應_素材與設計.md'
const COUPLET = '其思如淵，不與百鳥爭鳴；其行如虎，唯願踏骨而興。'

const COMMON = `你在做《異麒麟》蝴蝶效應第二案「放棄線與梟雄命盤」的新戲提案（作者 2026-09-26 選案、09-27 定形）。規格全在 ${SPEC} 第八節（8-1 一句話、8-2 現況、8-3 序章要動的、8-4 大廳新戲、8-5 連帶、8-6 要寫的話），規矩在第一節；本提示只摘要。
- 一句話：茶博士的梟雄評語搬家。序章臨走，他把對子「${COUPLET}」說給**沒再進古墓**的人（不開命盤、不寫變數）；到第一章英豪府大廳，雍仔說小溪村不妙，主角**聽完消息之後**想起這副對子，旁白宣布命格轉向塚虎踏骨，那一格才寫 Variable["DarkHeroDestiny"] = true; 開梟雄命盤。留屍丹的人臨走另有一句新評語，不開命盤。英雄那條（毀了屍丹）與「輕裝快馬」兩條一字不動。臨走評語總共三個：英雄、梟雄、留屍丹。
- 形狀（違反即退）：一個選擇一場戲讀一次；不接鏈；那場戲不再問玩家第二次；出口合流（臨走照樣上車，大廳照樣入隊、雍仔照樣入隊）；差別留在人身上；先給動機再給機制。
- 引擎硬紅線：不新建變數、不新建任務、不自取名字；SetFlag／GetFlag 禁用；只用既有變數（HeroDestiny、DarkHeroDestiny）與既有任務狀態（C0M2 failure、CF05 第 3 項）；已進 Unity 的節點不改號、不改字、不動 title（改 links、拿掉一行 Script 可以，要逐格列出）；新格不編號；Description 只寫詞表標籤（劇情/轉成json指南.md §1）。
- 人：累積的是人，各自結算；症狀不給數字；DnDAlignment 可寫不可讀。饕餮不出場。
- 不准做的：讓任何人解釋命盤或說出「梟雄」「英雄命盤」這類字；把「避雨失傘」拿來當梟雄的由頭（作者 09-27 否掉）；讓茶博士對留屍丹的人說「輕裝快馬」（作者說不搭）或把他寫成梟雄；改英雄那條與輕裝快馬那兩條的任何字；在大廳多問玩家一次；讓雍仔罵或追問；出「凶戾」「人祭」二詞。
- 稿的寫法（創作稿）：說話者行 **旁白:**／**你:**／**〈角色〉:**（主角一律「你」），旁白 [panel=6]＊（…）＊，台詞「…」；每格底下 - actorID: / - Sequence: / - Conditions: / - Script: / - Description: 有才寫；新格用【A】【B】…標，不編號；分岔用「▶ 本版（條件）」開頭，寫完寫「→ 接 #N」；既有格只寫「#N 不動」「#N 的 links 改指…」「#N 的 Script 拿掉 …」。不動 Json/、不動 Unity、不動回讀稿的文字。
- 內容三道線：給AI看的指南/世界觀.md 第八節禁詞（五胡亂華、司馬、篡魏、三國歸晉、輪迴、重來、前世）；角色口中不出「凶戾」「人祭」；@角色設定/饕餮.md 第十節廢案清單。
- 文風規矩（違反即退）：1. 旁白看得見你做什麼、看不見你想什麼：不寫內心話、不替玩家下感受或結論、不替角色斷定心裡怎樣（「倒像」「像是」可以）。「想起那句話」只寫他想起了，不寫他心裡怎麼想。2. 寫結果和狀態，不寫過程；一格裡同一個人的動作最多兩拍；不編精確數目、距離和純造景小細節。3. 作者退過的句型不得再犯：「不是 X，是 Y」翻轉句；否定句收尾造氣氛；「像……」比喻巧句收尾；收尾加新判語；旁白先把下一格台詞要講的事講掉；同一件事隔幾格又講一遍。4. 句子寫完整，不斷碎句：旁白一格兩三句、每句十九到二十五字、不留五字以下的句子；角色台詞一句十五字上下，照那個角色既有的口吻。5. 旁白裡不寫「」引號；**全篇不用破折號「——」，台詞也不用**（打斷、沒說完用「……」；文風指南旁白卡第 9 條）。[em7] 每十格至多一個、同一人不連掛、[/em7] 後必接標點。6. 玩家看得到的字不自創單字名詞；東漢稱謂與用詞。
- 省回合的規矩：情境包已收好規格原文、現行拍子、連線、每條來路、既有台詞、指南摘錄，先讀它；只在拿不準時回原檔查那一段。日期一律寫 ${DATE}。給作者看的話用白話短句。`

const LENSES = [
  { tag: '甲', name: '照規格最少', brief: '貼著規格與現行拍子，格數最少、差別最集中：只在規格點名的位置分岔或改字，其餘一字不動。' },
  { tag: '乙', name: '接戲', brief: '先把情境包裡從插入點前十格到接回點後十格讀順，再寫出唸起來最順、最像這場戲原本嗓子的版本；格數可以比甲多一兩格，但一定要守規格與形狀。' },
  { tag: '丙', name: '另一種演法', brief: '在規格範圍內刻意換一種演法，讓作者有真的不一樣的選擇：換誰先開口、換一個看得見的動作或物件、換一種收法；仍守全部規矩與規格。若另一種演法明顯更差，照樣給出最好的不同版本並在自檢說明。' },
]

const UNITS_ALL = [
  {
    key: '序章臨走', box: '小溪村7月',
    out: '劇情/放棄線_序章臨走.md',
    json: 'Json/主線事件/179年/7月.json（已進 Unity：只改 links、拿掉指定的 Script 行、新格續號；不改既有格的字、不動 title）',
    overview: '劇情/179年事件/07月(主)斬黑血屍、雍仔商議、一枝花結局、DEMO結局.md §5-1-A／§5-1-B 茶博士評語段、§5-2 放棄線',
    merge: '作者看過後：直接改 JSON（三格 Script、兩格 links、#2055 改字、新格續號）、走同步流程、回讀進 07 月總覽稿；合併完本提案檔刪除',
    voices: '茶博士 role105（本檔既有句：#2055、#2067、#2068、#2118、#2119、#2120、#2054、#2079 等，全撈）；你 MC1；旁白 role2',
    anchors: '放棄線臨走 #2078→#2079→#2055（「後山那物還在呢…避雨失傘，泥濘滿身…」）→#370→#371／#372（寫 C0M2 failure）；斬屍線臨走分流 #2068（有娜娜，links [2069, 2071, 2073, 2076]）與 #2054（沒娜娜，links [2234, 2235, 2061, 2064]）；梟雄舊串 #2071→#2119→#2072→#2075 與 #2235→#2237→#2060→#2063；序章寫 DarkHeroDestiny 的三格 #328、#253、#248；上車 #345（有娜娜）／#265（沒娜娜）',
    cond: '放棄線：本來就只有沒再進古墓的人走到 #2055，不用另加條件；留屍丹：CurrentQuestEntryState("CF05", 3) == "active";',
    spec: `- 要寫的兩句：
  ① **放棄線 #2055 改寫（梟雄評語小改）**：對子「${COUPLET}」一字不改；後面接一句讀放棄的人（原 #2119「為了變強連燙手的刀刃都敢往懷裡揣」是講留屍丹的，不能照搬）。開頭「後山那物還在呢，你這就打算拍拍屁股走人了？」留不留、罵完再接對子還是直接接，三版各自決定並說明。這一格**不開命盤、不寫變數**；links 照舊接 #370。
  ② **留屍丹臨走的新評語**：#2068 與 #2054 各補一條新格（續號），條件 CurrentQuestEntryState("CF05", 3) == "active";，茶博士一句短的評語，接回 #345／#265。他看見的是這人斬了妖、卻把那顆邪物揣著走；不是梟雄、不是輕裝快馬；不提命盤；不寫新旁白宣布命格。有娜娜／沒娜娜兩線各一格，字可以一樣。
- 既有格要動的（只列清單，戲裡不重寫）：#328、#253、#248 各拿掉 Script 裡的 Variable["DarkHeroDestiny"] = true;（其餘保留）；#2068 的 links 把 2071 換成留屍丹新格、#2054 的 links 把 2235 換成新格；梟雄舊串留著不刪、不再有路進去。英雄 #2069→#2118→#2070→#2074 與 #2234→…、輕裝快馬 #2073／#2076／#2061／#2064 一字不動。
- 大廳那場（另一份提案）想起的就是這副對子，所以對子本身不能改字。`,
    checks: [
      '形狀：臨走評語三個（英雄、梟雄、留屍丹）；英雄那條與輕裝快馬兩條一字不動；每條路照樣上車',
      '對子一字不改；放棄線後一句讀的是放棄的人（不是留屍丹）；這一格不開命盤、不寫變數',
      '留屍丹那句：不是梟雄、不是輕裝快馬、不提命盤；有娜娜／沒娜娜兩線各一格、各接回 #345／#265',
      '讀法與狀態：留屍丹讀 CF05 第 3 項 active；#328、#253、#248 只拿掉 DarkHeroDestiny 那一行；沒有新變數、新任務、title；Description 在詞表內',
      '每條路：放棄線有娜娜（#371）／沒娜娜（#372）都經過 #2055；斬屍線四選一每一條在 #2068／#2054 都有一條接得到；沒有一條會卡在「觀你為人：」',
      '茶博士聲口：對照本檔他的既有句（俗、短、帶一點市井的看人眼光）；不說教',
      '文風規矩 1–6；em7 每十格至多一個',
      '設計端連帶：無（8-5 的檔案改動在合併時做）',
    ],
  },
  {
    key: '大廳開命盤', box: '英豪府大廳',
    out: '劇情/放棄線_大廳開命盤.md',
    json: 'Json/英豪府遴選/大廳.json（已進 Unity：只改 links、新格續號；不改既有格的字、不動 title）',
    overview: '劇情/英豪府/英豪府遴選/02 大廳.md（#557–#562 雍仔重逢入隊那段與前後）',
    merge: '作者看過後：直接轉 JSON 續號、走同步流程、回讀進 02 大廳.md；合併完本提案檔刪除',
    voices: '雍仔 MC20（自稱道爺我／本道長，喜劇腔、隨遇而安；立繪只有 pic=1／2；本檔既有句 #557、#560、#562 與 7月.json 放棄線 #367、#368）；你 MC1；旁白 role2；赫連娜娜 MC22 若在場只一句',
    anchors: '雍仔重逢 #560「果然在這裡見到你啦…多個幫手總是好的」→ #562「我雍仔別的沒有，就是有一身的義氣！咱們組個隊」→ #561 旁白（雍仔加入隊伍）。本版在 #560 之後分出，接回 #562',
    cond: 'CurrentQuestState("C0M2") == "failure";',
    spec: `- 讀法：只讀 CurrentQuestState("C0M2") == "failure";，在雍仔 #560 打招呼那一拍之後分出去；斬過屍的玩家照現行。
- 拍子（順序作者定）：雍仔照現行 #560 打招呼 → 他說小溪村不妙（村子出了事，他路上聽的；**他不罵、不追問**，照他隨遇而安的樣子）→ **聽完消息之後**主角才想起茶博士臨走說的那副對子「${COUPLET}」（旁白只寫他想起那句話，不寫他心裡怎麼想）→ 接一格「自此風雲變色，你的命格已轉向更為深沉的[em3]塚虎踏骨[/em3]」那一型的宣布（可照 7月.json #2075 原句）→ 這一格 Script: Variable["DarkHeroDestiny"] = true;，Description「變數更新」→ 接回 #562「組個隊」、#561 入隊。
- 雍仔照樣入隊；趙王洞不動；「永失雍仔」那句設定不做。
- 娜娜：情境包會查她這時在不在隊上（沒遇到她的在雲中街道補入隊）。在場可以有一句，不搶戲；不在就沒有。
- 不准做的：不讓雍仔或任何人解釋命盤；不出「梟雄」二字；不改 #560、#562 的字；不新建變數（DarkHeroDestiny 是既有的）；不寫村子怎麼死的細節（他路上聽的一句就夠，世界觀沒寫的不發明）。`,
    checks: [
      '形狀：只讀 C0M2 failure、只分一次；接回 #562、#561 入隊；雍仔照樣入隊；斬過屍的玩家照現行',
      '順序：打招呼 → 雍仔說小溪村不妙 → 聽完消息才想起對子 → 命格轉向宣布 → 變數 → 入隊',
      '對子一字不改，想起的就是臨走那句；宣布那格照 #2075 那一型；不解釋命盤、不出「梟雄」',
      '雍仔口吻：不罵、不追問、隨遇而安、喜劇腔；立繪只有 pic=1／2',
      '狀態：只在宣布那格寫 Variable["DarkHeroDestiny"] = true;，Description「變數更新」；沒有新變數、新任務、title；Description 在詞表內',
      '每條路：娜娜在／不在兩種都通；在場人數與立繪對得上；#560、#562 一字不動',
      '文風規矩 1–6：旁白只寫他想起那句話，不寫內心；em7 每十格至多一個',
      '設計端連帶：無',
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
  return `場：${u.key}｜箱庭情境包：${packetPath(u.box)}
JSON：${u.json}
回讀稿（只讀不改）：${u.overview}
錨點：${u.anchors}
讀的條件：${u.cond}
聲口：${u.voices}
規格：
${u.spec}
本場八項檢查：
${u.checks.map((c, i) => `${i + 1}. ${c}`).join('\n')}
合併去處（提案檔要寫進檔頭，給作者看）：${u.merge}`
}

const DRAFT_FILE_FORMAT = `檔案結構（每節都要有，沒有內容寫「（無）」）：
# 起草稿｜〈場〉｜〈甲乙丙〉（〈取向名〉）
## 取向（一句）
## 讀的條件（逐行）
## 既有格要動的（逐格：#N 的 links 改成…／#N 的 Script 拿掉哪一行／#N 改字：原句→新句）
## 插入點與接回（逐條）
## 寫的指令（Script／ModifyData 逐行）
## 戲（創作稿本體：每格 說話者行＋全文，底下 actorID／Sequence／Conditions／Script／Description 有才寫；新格用【A】【B】…標；分岔 ▶；合流「→ 接 #N」）
## 起草者自檢（逐條對照八項檢查與文風規矩 1–6；節奏檢查的結果貼這裡）`

function scoutPrompt(box, units) {
  const isXiaoxi = box === '小溪村7月'
  return `${COMMON}

你是箱庭「${box}」的情境整理，只讀不改專案檔。本箱庭這一批要寫的場：
${units.map(u => '\n---\n' + unitHead(u)).join('\n')}

請把情境包寫成檔案 ${packetPath(box)}（用 Write；目錄不存在就建）。內容（純事實、逐字原文，不提改法）：
1. 規格原文：從 ${SPEC} 逐字抄出第一節 1-1 到 1-4、第八節全節（8-1 到 8-6）、第六節第 21、29–32 條。
2. 現行拍子：${isXiaoxi ? '有娜娜線 #341→#2067→#2068→四條評語各自到 #345 的每一格、沒娜娜線 #2077→#2079→#2054→四條評語各自到 #265 的每一格、放棄線 §5-2 從 #362 到 #371／#372 的每一格（含 #2078、#2079、#2055、#370）' : '#557 到 #561 的每一格與前後十格，含 #560、#562、#561 的 Sequence（入隊指令）'}，逐字（說話者、entryID、[panel=N]、全文、Sequence／Script／Conditions／Description／links）。
3. JSON 事實：上述每格的 actorID、text、Conditions、Sequence、Script、Description、links 與所有指向它們的 parent；${isXiaoxi ? '#328、#253、#248 三格的 Script 全文；#2071→#2119→#2072→#2075 與 #2235→#2237→#2060→#2063 兩串全文（大廳那場要借「其思如淵」對子與 #2075 的宣布句）；#2118／#2236、#2070／#2058、#2074／#2062 英雄那串全文' : 'C0M2 在全案哪幾格寫 failure（Json/主線事件/179年/7月.json #371、#372）與寫 success 的格；娜娜入隊的兩個點（Json/小溪村後山/赫連娜娜、張寧.json #64／#2061；Json/大地圖/雲中/街道.json #4149）與大廳.json 裡有沒有讀 IsInTeam("MC22")；7月.json #2071 對子原文與 #2075 宣布句原文'}。哪些節點已進 Unity（查回讀稿檔頭與 劇情/索引.md）。
4. 每一條會播到插入點的來路與條件（${isXiaoxi ? '有娜娜／沒娜娜、四選一各條、放棄線有娜娜／沒娜娜' : '斬過屍／放棄、娜娜在不在隊上'}）。
5. 聲口：跑 python -X utf8 給AI看的指南/既有台詞.py ${isXiaoxi ? '茶博士（role105）：他全案每一句都抄，另把 7月.json 裡 role105 的每一句撈出來' : '雍仔（MC20）：抄二十句代表句，另把 英豪府遴選/ 各檔與 7月.json 放棄線 #367、#368 他的每一句撈出來；赫連娜娜 MC22 十句'}。
6. 設定：${isXiaoxi ? '劇情/小溪村/@結局_小溪村.md 第四節「茶博士的江湖落款」；劇情/小溪村/@結局_章回體.md 提到茶博士的行；給AI看的指南/文本創作指南.md 第一層第 3 條（四軸只在結局讀）' : '@角色設定/雍仔.md 全檔；劇情/英豪府/@設定_英豪府.md 提到大廳與雍仔的行；劇情/小溪村/@結局_小溪村.md 結局 1「被遺忘的災厄」那段（村子怎麼了、不得發明細節）'}；@角色設定/饕餮.md 第十節廢案清單。
7. 每一場特別要查的事實：${isXiaoxi ? '#2055 的 links 與它的 parent（哪些格接進它）；#2068／#2054 四條分流各自的 Conditions 原文；CF05 第 3 項在 #2367／#248 之後到上車之前有沒有被改成 success（饕餮夢在上車之後才播，確認順序）；#345／#265 之後接什麼' : '#560 的 links 與 parent；#562 的 Sequence；#561 入隊指令；娜娜到遴選時是否一定在隊上；大廳.json 裡有沒有別的格讀 C0M2'}。只寫事實。
8. 指南摘錄（作者 2026-09-26 准：起草者只讀情境包，視同讀過三份指南，所以這一節要抄齊）：逐字抄出 給AI看的指南/文本創作指南.md 第零層高概念那幾段、0.1、0.6、2.1a 全節；給AI看的指南/世界觀.md 第八節全節；給AI看的指南/武俠文風創作指南.md〈零、常犯十條〉整節（**放在情境包最前面，起草者先看錯例再動筆**）、第四節開頭通則、旁白卡、你（主角）卡、本批出場角色的聲口卡（茶博士、雍仔、娜娜；沒有卡的註明「無卡，照第 5 項既有句」）、7.1a–7.1c、7.3、第八節自檢清單；劇情/轉成json指南.md §1 Description 詞表與 §4.2 開頭通則；給AI看的指南/立繪指令轉換規則.md 裡本批出場角色可用的 pic 格號與表情特效名稱。
寫完檔案後，回傳一頁摘要（兩千字內）：每場的插入點、接回點、來路條件、會開口的角色與 ID、你發現起草者一定要知道的坑。`
}

function draftPrompt(u, lens) {
  return `${COMMON}

你是起草者（${lens.tag}｜${lens.name}）。你的取向：${lens.brief}
${unitHead(u)}

做法（作者 2026-09-26 裁示，省回合）：只讀情境包 ${packetPath(u.box)}。**先把它最前面的〈常犯十條〉錯例對改例讀一遍再動筆**（作者 2026-09-28）。它的〈指南摘錄〉一節已逐字收了三份指南與各轉換規則裡寫這場戲用得到的節，**讀情境包即視同讀過 CLAUDE.md 要求的三份指南，不必再開指南原檔**。起草只管寫戲：**不回 JSON、回讀稿查連線與來路**，交給審修。只有情境包真的缺了非要不可的東西時，才去原檔讀那一段，並在〈起草者自檢〉記一筆。不要改任何專案檔。
把稿寫成檔案 ${draftPath(u, lens.tag)}（用 Write；目錄不存在就建）。
${DRAFT_FILE_FORMAT}
寫完只跑一次 python -X utf8 給AI看的指南/文風節奏檢查.py <檔>，照報告修一次就交；報告和你修了什麼貼進〈起草者自檢〉。
回傳 JSON：file、approach、cells（新格幾格）、self_check（三五句：八項哪幾項拿不準、節奏檢查結果）。`
}

function revisePrompt(u, d) {
  return `${COMMON}

你是審修（版${d.label}）。一人審一版：逐項查，能修的直接修進稿裡，修不了的列出來。
${unitHead(u)}

起草稿：${d.file}（先讀）；情境包：${packetPath(u.box)}；起草者的自檢：${d.self_check || '（無）'}

查什麼：
1. 本場八項檢查逐項：回原 JSON、原回讀稿查證插入點、接回點、每條來路、既有格的字有沒有被改、拿掉的 Script 行對不對、變數是既有的、Description 詞表。
2. 文風規矩 1–6 逐句；口吻對照情境包裡那個角色的既有句（讀 給AI看的指南/武俠文風創作指南.md 第四節旁白卡與本場角色卡、給AI看的指南/武俠文風審校清單.md）。
3. 本場另查：${u.key === '序章臨走' ? '對子一字不改；放棄線後一句讀的是放棄的人；留屍丹那句不是梟雄不是輕裝快馬；三個評語像同一個人臨走說的三種話' : '順序（打招呼→消息→想起→宣布→變數→入隊）；雍仔不罵不追問；旁白只寫想起那句話；不解釋命盤、不出「梟雄」'}。
怎麼修：句子、指令、接法能修就直接修，修完仍要守取向（版${d.label}是「${lensName(d.label)}」），不要修成別的版；該作者定的留 ＿＿ 並記下來。
寫成檔案 ${revisedPath(u, d.label)}（結構同起草稿），檔尾加三節：
## 旁白逐格表（作者 2026-09-28 要求：每一個旁白格一行——格名｜第 3 條判語、心事、替玩家下感受：過或改｜第 7 條造景細節、精確數目、動作鏈超過兩拍、收尾巧句：過或改｜改了什麼。不准整段打勾，一格一格重讀；文風節奏檢查.py 列的「旁白卡候選」每一條都要在這張表裡有交代）
## 審修紀錄（每一處改動：第幾格、原句→新句、依哪條規矩）
## 待作者定
修完跑一次 python -X utf8 給AI看的指南/文風節奏檢查.py <檔> 與 python -X utf8 給AI看的指南/高難度檢定檢查.py <檔>（後者是給有檢定的稿寫的：沒分類、沒題語、沒擲骰那幾條的警告不管；它報的留白、禁詞、Description、em7、title、SetFlag 要處理）。不要改任何專案檔。
回傳 JSON：file、verdicts（八項各一筆：check、verdict 是 pass／fixed／unresolved、note）、changes、summary。`
}

function finalPrompt(u, revs) {
  return `${COMMON}

你是本場的終審兼編輯。三版已各經一名審修。你的工作：再挑一次錯、標一版建議、寫成提案檔、跑兩支檢查腳本。
${unitHead(u)}

三版審修稿（先全部讀完）：
${revs.map(r => `- 版${r.label}（${lensName(r.label)}）：${r.file}；審修結論：${r.summary}；verdicts：${JSON.stringify(r.verdicts)}`).join('\n')}
情境包：${packetPath(u.box)}

做法：
1. 挑錯：重點放審修最容易漏的：每條來路從插入點前十格讀到接回點後十格接不接得通、既有格改動清單對不對（links、拿掉的 Script 行、#2055 改字）、留白有沒有被人取了名、既有格有沒有被改字、三版是不是三個真的不一樣的選擇、有沒有多問玩家一次、對子有沒有被改字。發現就直接改，記進該版〈審修紀錄〉（標「終審」）。
2. 建議版：挑一版，理由一句。
3. 寫提案檔 ${u.out}（用 Write；已存在就整檔覆寫）：
   第一行「# 放棄線・${u.key}　提案｜創作稿／提案，尚未進 JSON；作者看過合併後本檔刪除」；
   引用區塊：「📝 ${DATE} 三版待作者挑一版；規矩與規格見 ${SPEC} 第一、八節，本檔只放戲。」、讀的條件、既有格要動的清單、插入點與接回、「新格不編號，作者續號；已進 Unity 的節點不改字、不動 title」、「**合併去處：**${u.merge}」、「**建議版：**」＋理由、「**待作者填：**」；
   三版各一節「## 版一（甲｜照規格最少）」「## 版二（乙｜接戲）」「## 版三（丙｜另一種演法）」：節首列取向、讀的條件、既有格要動的、插入點與接回、寫的指令；「### 戲」放審修稿的〈戲〉；「### 審修紀錄」；
   「## 待作者定」：三版合併去重，每條前加 ⚠；「## 審修摘要」。
4. 跑 python -X utf8 給AI看的指南/文風節奏檢查.py "${u.out}" 與 python -X utf8 給AI看的指南/高難度檢定檢查.py "${u.out}"（後者沒分類、沒題語、沒擲骰的警告不管），報的照規矩修到不報或在〈待作者定〉說明。
5. git status：本流程只該動這些提案檔：${OUTS.join('、')}。不動 Json/、回讀稿、創作稿、${SPEC}、角色檔。
回傳 JSON：out、recommended（label、reason）、unresolved（字串陣列）、rhythm、format、summary。`
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

log(`同時開跑：${UNITS.map(u => u.key).join('、')}`)
const results = (await parallel(UNITS.map(u => async () => {
  const ok = await ensurePacket(u.box)
  if (!ok) return { unit: u.key, error: 'scout failed' }
  return await runScene(u)
}))).filter(Boolean)
return { date: DATE, units: results }
