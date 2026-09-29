export const meta = {
  name: 'apply-review-edits-to-json',
  description: '把本輪審稿單改稿與作者裁示（md 的 ✏ 註記）套進 13 份 JSON：每檔一名施工、一名驗收，有錯就修再驗',
  phases: [
    { title: 'Apply', detail: '每份 JSON 一名施工，照 md 的 ✏ 註記改 text／zh_TW／zh_CN、連線、刪格、新增格' },
    { title: 'Verify', detail: '每份 JSON 一名驗收，逐條對 md 與 git diff' },
    { title: 'Fix', detail: '驗收有問題就修，修完再驗一次' },
  ],
}

const PRE = 'C:/Users/user/AppData/Local/Temp/claude/d--QilinStory/90185aca-633d-4b94-9884-c66314379f5f/scratchpad/prediff/'

const GROUPS = [
  { key: '179-7月', json: ['Json/主線事件/179年/7月.json'], md: ['劇情/179年事件/07月(主)斬黑血屍、雍仔商議、一枝花結局、DEMO結局.md'],
    scope: '審稿單 N0025、N0031、N0033、N0036、N0037、N0038、N0039、N0040、N0041、N0043、N0044 的 ✏ 2026-09-24 註記（含 #341、#2301／#2268 孿生、刪 #263、#2373 併格並刪 #2374、#2394、#2384、#2409、#2411、#2347、#370），以及其後 ✏ 2026-09-25 作者裁示改寫的註記（#2373 點明「那個小姑娘」等）。劇情/DEMO結局.md 不是 JSON，不管。' },
  { key: '180-3月主線', json: ['Json/主線事件/180年/3月.json'], md: ['劇情/180年事件/03月(主)師徒交底、三萬六千錢、并州棋局(支)蔡琰木鳥、機關人殘骸、赤龍幫出資、甄家出資.md'],
    scope: '只管 md「## 主線｜」那一節裡的 ✏ 註記：N0073、N0074（#119、#130）、N0075、N0076（刪 #157）。' },
  { key: '180-3月支線', json: ['Json/探索事件/180年/3月.json'], md: ['劇情/180年事件/03月(主)師徒交底、三萬六千錢、并州棋局(支)蔡琰木鳥、機關人殘骸、赤龍幫出資、甄家出資.md'],
    scope: '只管 md「## 支線｜」那一節裡的 ✏ 註記：N0077（#2113）、N0078、N0079（#2116，另有 2026-09-25 作者裁示「文姬」改「蔡琰」）、N0080（#4122）、N0081、N0082（#4128）、N0083（#4148）、N0085（#4163）、N0086（#4171，另有 2026-09-25 作者裁示改成較短那版）。' },
  { key: '179-10月支線', json: ['Json/探索事件/179年/10月.json'], md: ['劇情/179年事件/10月(主)蕭靈犀雲中開張、馬市(支)小犀採藥、赤龍幫五百錢、蒲元寒鐵.md'],
    scope: '只有一格：#3694 旁白的「文姬」改「蔡琰」（md 裡 ✏ 2026-09-25 改字註記）。⚠ 這份 JSON 另一個對話已經改過、還沒 commit（改動前的 diff 存在 ' + PRE + 'Json_探索事件_179年_10月.json.diff），那些改動一個字都不要碰，只動 #3694。' },
  { key: '黑鐵嶺礦坑', json: ['Json/大地圖/黑鐵嶺礦坑.json'], md: ['劇情/黑鐵嶺礦坑/黑鐵嶺礦坑.md'],
    scope: '審稿單 N1049–N1056、N1058–N1064、N1066、N1067 的 ✏ 2026-09-24／2026-09-25 註記（#19、#23、#17、#3971、#3919、#3927、#3936 與複本 #3960、#3937 與複本 #3961、#43、#3883 併格並刪 #3884（#3883 改接 #3885）、#3886、#57、#3878、#72、#3890）。md 裡說話者對照表、審校對照表的改動不是 JSON，不管。' },
  { key: '觀心', json: ['Json/觀心.json'], md: ['劇情/觀心/觀心.md'],
    scope: '審稿單 N0709、N0710、N0714–N0722、N0724–N0727 的註記（#2、#48、#52、#65、#69、#71、#72、#73、#83、#85、#89、#398、#358、#372、#419），以及 2026-09-25 作者裁示：#334、#339、#345、#350「鐵門」改「木門」；#52、#73 改回「正是——」收尾；#71「她爹手札上那套強者的氣勢」；#321、#77「強者氣勢那套」「說她牢靠吧」。' },
  { key: '五原障', json: ['Json/呂信線/五原障.json'], md: ['劇情/呂信/05 五原障.md'],
    scope: '全部 ✏ 2026-09-25 註記：審稿單 N0297–N0334（md 無 entryID，註記寫明 JSON entryID）；作者裁示 T1（刪 §0 #3–#24、#131–#133，#2 改接 #30，#30 撤回刪除改寫成呂信進場句）、T3（只改 md 註記，JSON 不動）、T4（#442 背景圖已是 Wilderness；#441／#442 指令）、T5（#735、#736 改問「其他十六個」）、T8（射馬分歧撤回，#123、#3005、#3105 維持原樣）、T9 與後續指正（§8 結尾轉場 #3123／#3125 換 HallOfHeroes，不用 LoadLevel；#442 補 OpenPanel(0,close)@1）；另外三件 2026-09-25 補的：§0 新增你「好，我這幾日就動身。」一格（#2 與 #30 之間，號碼照註記或從現有最大號續編，避開 #3123–#3129）、§8 開頭轉場 #3127／#3128 開 Wilderness、#956 之後尾格 #3129。這份還沒進 Unity：新格照閱讀順序插在陣列裡；刪格後不重編號。' },
  { key: '留信', json: ['Json/呂信線/留信.json'], md: ['劇情/呂信/06 留信.md'],
    scope: '先套 ✏ 2026-09-25（T1）：刪 2-D #19、#20、#21、#211，#10／#14／#18 的 links 由 [19, 22] 改 [22]；再套審稿單 N0335–N0341：刪 #10（原本連 #10 的格改接照註記）、刪 #16、#23 改寫並刪 #24、#36、#464；再套作者裁示 #2、#36「門板」改「刀／大刀」。N0338 已隨 2-D 刪掉。這份還沒進 Unity，刪格後不重編號。' },
  { key: '儺隊過街', json: ['Json/蕭靈犀線/01儺隊過街.json'], md: ['劇情/蕭靈犀/01 儺隊過街.md'],
    scope: '審稿單 N0696–N0702（#15、#16、#19、#20、#38、刪 #33：#32 改接 #34）與作者裁示 T7（#32 句尾併進「外頭的鼓聲到很晚才停。」）。md 檔頭統計那兩行是 md 的事，不管。' },
  { key: '對話氣泡', json: ['Json/英豪府遴選/對話氣泡.json'], md: ['劇情/英豪府/英豪府遴選/06 對話氣泡.md'],
    scope: '只有 N0695：#4240 菈沙。' },
  { key: '179-6月', json: ['Json/主線事件/179年/6月.json', 'Json/探索事件/179年/6月.json'], md: ['劇情/179年事件/06月(主)娜娜再訪、傷癒出門(支)佳人笑返真草、真容之夜.md'],
    scope: '審稿單 N0013（#2100）、N0014、N0015（#2078、#2079）、N0016（md #82 那格，JSON 只改 #2076，#82 不動）、N0017（#174）、N0022（#101）、N0023（#106），以及 2026-09-25 作者裁示 #2099。每格先查在主線還是探索那份 JSON。' },
  { key: '第三百四十九次', json: ['Json/呂信線/02第三百四十九次.json'], md: ['劇情/呂信/02 第三百四十九次.md'],
    scope: '審稿單 N0251–N0262（#6、#20、#26、#44、#4007、#4058、#4064、刪 #4097（#4065 改接 #292）、#471、#50、#77）與 2026-09-25 作者裁示 #461。md 與 JSON 原本就有不一致的格（例如 #4096），註記沒叫改的不動。' },
]

const RULES = `你在把《異麒麟》這一輪審稿單改稿套進 JSON。md 裡每一條「> ✏ 2026-09-24／2026-09-25」註記就是施工單：它寫了原句、新句（就是 md 那一格現在的文字）、連線怎麼改、指令怎麼搬、新增格的欄位。只做本組範圍列出的註記，其他註記（前幾批已進 Unity 的、別的對話寫的）不管。
規矩（違反即錯）：
1. 改 text：text 換成 md 那一格現在的文字（去掉 md 的說話者標籤、entryID，保留 [panel=N]、＊（）＊、「」、[em2]／[em7]、[var=…] 等標記，逐字照抄；md 若用 <br> 代表換行，JSON 用 \\n）。zh_TW 與 text 完全相同。zh_CN 一律重翻成簡體（標記、[var=…]、全形標點照留，只轉字與用詞），不得沿用舊譯。原本有 en 的也重翻；原本沒有的欄位不新增。
2. 刪格：整個物件拿掉；照註記改上游的 links（先查 JSON 實況，跟註記不符就以 JSON 為準做對、並在回報寫出）；註記說要搬的 Sequence／Script 照搬。entryID 不重編，其他格不改號。
3. 新增格：照註記給的 entryID、actorID、text、Sequence、Description、links；不寫 title；照註記說的位置插進陣列。空格 text 為 ""、zh_TW／zh_CN 照同檔空格慣例。
4. title 一律不碰；Description 只有註記叫改才改；Conditions、Sequence、Script 只有註記叫改才改。不得自取變數名或任務代號。
5. 格式：這些 JSON 是 2 格縮排、CRLF 換行、links 寫在同一行（例如 "links": [2]）。**不得整份重新序列化**（json.dump 會把 links 拆成多行、改掉換行）。一律做精準的字串替換：用 Edit 工具，或用 Python 讀原始文字、對單一物件做 str.replace 後原樣寫回（newline='' 保留 CRLF）。改完用 json.load 確認合法，再看 git diff 只動到該動的物件。
6. 改完：對每份 JSON 跑 python -X utf8 給AI看的指南/文風節奏檢查.py "<檔>"，改到的格被報的在回報裡說明；本組若有新增格，再跑 python -X utf8 給AI看的指南/json順序檢查.py "<檔>" 並回報結果（舊檔不為了它改號）。
7. 另一個對話可能同時改別的檔；只動本組的 JSON。`

function applyPrompt(g) {
  return `${RULES}

本組：${g.key}
JSON：${g.json.join('、')}
md（施工單所在）：${g.md.join('、')}
範圍：${g.scope}

做法：先 grep md 裡的「✏ 2026-09-2」列出本組範圍內的每一條註記，逐條對照 JSON 實況施工。回報：每條註記（編號）動了 JSON 哪一格、改了哪些欄位、刪了／新增了哪幾格、連線怎麼改；zh_CN 的新譯文；檢查腳本的結果；任何跟註記不符、你照 JSON 實況調整或沒做的地方。`
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

function verifyPrompt(g, report, round) {
  return `${RULES}

你是驗收（第 ${round} 輪），只讀不改。本組：${g.key}
JSON：${g.json.join('、')}
md：${g.md.join('、')}
範圍：${g.scope}
改動前這些 JSON 的未 commit diff 存在 ${PRE}（檔名是路徑把 / 換成 _ 再加 .diff；空檔＝改動前沒有未 commit 的改動）。

施工回報：
<<<
${report}
>>>

查：
1. git diff 每份 JSON：跟改動前的 diff 比，新多出來的改動是否都對得上本組範圍的某條註記；有沒有範圍外的改動、整份重排、換行被改。
2. 範圍內每條註記：text 是否與 md 那一格現在的文字逐字相同（標記、換行照規矩轉）；zh_TW＝text；zh_CN 是新譯、忠於新句、簡體正確、標記齊全；刪格是否真的刪了、上游 links 是否改對、沒有 links 指向不存在的 entryID、沒有新的孤兒；搬的指令是否在對的格；新增格欄位與位置是否照註記、沒寫 title。
3. json.load 合法；跑 文風節奏檢查.py，本組改到的格若被報，施工回報要有說明。
ok：沒有問題才 true。issues：每個問題一筆（id 寫條目編號或 entryID、problem、fix：具體怎麼修）。summary：三五句。`
}

function fixPrompt(g, audit) {
  return `${RULES}

你是修正施工。本組：${g.key}（JSON：${g.json.join('、')}；md：${g.md.join('、')}；範圍：${g.scope}）
驗收找到下列問題，逐條修（你查證後認為 fix 本身錯了，照規矩修對並說明）：
<<<
${JSON.stringify(audit.issues, null, 1)}
>>>
修完 json.load 確認、看 git diff、跑檢查腳本。回報每條怎麼修的。`
}

const results = await pipeline(
  GROUPS,
  g => agent(applyPrompt(g), { label: `apply:${g.key}`, phase: 'Apply' }),
  (report, g) => agent(verifyPrompt(g, report || '（施工沒有回報）', 1), { label: `verify:${g.key}`, phase: 'Verify', schema: AUDIT_SCHEMA })
    .then(a => ({ report, audit: a })),
  async (r, g) => {
    if (!r.audit || r.audit.ok || !(r.audit.issues || []).length) return { key: g.key, ...r }
    log(`${g.key}：驗收找到 ${r.audit.issues.length} 個問題，送修`)
    const fixReport = await agent(fixPrompt(g, r.audit), { label: `fix:${g.key}`, phase: 'Fix' })
    const audit2 = await agent(verifyPrompt(g, (r.report || '') + '\n\n修正回報：\n' + (fixReport || ''), 2), { label: `verify2:${g.key}`, phase: 'Fix', schema: AUDIT_SCHEMA })
    return { key: g.key, ...r, fixReport, audit2 }
  },
)
return results.filter(Boolean).map(r => ({ key: r.key, audit: r.audit, audit2: r.audit2, report: (r.report || '').slice(0, 3000), fixReport: (r.fixReport || '').slice(0, 1500) }))
