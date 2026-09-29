export const meta = {
  name: 'apply-review-edits-to-json-d',
  description: '把本輪審稿單改稿與作者裁示（md 的 ✏ 註記）套進雲中街道 JSON：每檔一名施工、一名驗收，有錯就修再驗',
  phases: [
    { title: 'Apply', detail: '每份 JSON 一名施工，照 md 的 ✏ 註記改 text／zh_TW／zh_CN、連線、刪格、新增格' },
    { title: 'Verify', detail: '每份 JSON 一名驗收，逐條對 md 與 git diff' },
    { title: 'Fix', detail: '驗收有問題就修，修完再驗一次' },
  ],
}

const PRE = 'C:/Users/user/AppData/Local/Temp/claude/d--QilinStory/90185aca-633d-4b94-9884-c66314379f5f/scratchpad/prediff3/'

const GROUPS = [
  { key: '雲中街道', json: ['Json/大地圖/雲中/街道.json'], md: ['劇情/雲中/01 街道.md'],
    scope: '✏ 2026-09-26 註記：N1011（#1，以 md 現在的字為準：作者裁示用「在一片依山而建的聚落前停下」；老兵、門板兩句 JSON 本來就有，不要刪）、N1013（#110）、N1015（#4148，作者裁示保留不刪格，改成 md 現在的字；Sequence 與連線不動）、N1016／N1017（#37，JSON 沒有 zh_TW 欄就不補）、N1019（#4100）。' },
]

const RULES = `你在把《異麒麟》這一輪審稿單改稿套進 JSON。md 裡每一條「> ✏ 2026-09-26」註記就是施工單：它寫了原句、新句（就是 md 那一格現在的文字）、連線怎麼改、指令怎麼搬、新增格的欄位。只做本組範圍列出的註記，其他註記（前幾批已進 Unity 的、別的對話寫的）不管。
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
