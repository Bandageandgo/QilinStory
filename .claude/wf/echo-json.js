export const meta = {
  name: 'echo-json',
  description: '有人記得・回音 10 列轉 JSON：每份 JSON 一名施工（加新格、上一格 links、回讀進總覽稿）、一名驗收，有錯就修再驗',
  phases: [
    { title: 'Apply', detail: '每份 JSON 一名施工：照提案檔 ✅ 定稿節加格、改上一格 links、補 zh_CN、回讀進總覽稿' },
    { title: 'Verify', detail: '每份 JSON 一名驗收：逐格對提案檔與 git diff' },
    { title: 'Fix', detail: '驗收有問題就修，修完再驗一次' },
  ],
}

const DATE = (args && args.date) || '＿＿＿＿-＿＿-＿＿'

const GROUPS = [
  { key: '一百錢', rows: 'e108', json: 'Json/赫連娜娜線/14一百錢.json', prop: '劇情/赫連娜娜/回音_一百錢.md', md: '劇情/赫連娜娜/14 一百錢.md' },
  { key: '五原障', rows: 'e81', json: 'Json/呂信線/五原障.json', prop: '劇情/呂信/回音_五原障.md', md: '劇情/呂信/05 五原障.md' },
  { key: '武道大會', rows: 'e66、e40', json: 'Json/大地圖/天下第一武道大會.json', prop: '劇情/天下第一武道大會/回音_天下第一武道大會.md', md: '劇情/天下第一武道大會/ 底下對應這份 JSON 的總覽稿（查 劇情/索引.md）' },
  { key: '山賊窩', rows: 'e46', json: 'Json/趙王洞/山賊窩.json', prop: '劇情/趙王洞/回音_山賊窩.md', md: '劇情/趙王洞/ 底下對應這份 JSON 的總覽稿（查 劇情/索引.md）' },
  { key: '黑鐵嶺', rows: 'e48', json: 'Json/大地圖/黑鐵嶺礦坑.json', prop: '劇情/黑鐵嶺礦坑/回音_黑鐵嶺礦坑.md', md: '劇情/黑鐵嶺礦坑/黑鐵嶺礦坑.md' },
  { key: '宗緯家', rows: 'e52', json: 'Json/大地圖/宗緯家.json', prop: '劇情/宗緯家/回音_宗緯家.md', md: '劇情/宗緯家/宗緯家.md' },
  { key: '水濂洞', rows: 'e41', json: 'Json/大地圖/水濂洞.json', prop: '劇情/水濂洞/回音_水濂洞.md', md: '劇情/水濂洞/ 底下對應這份 JSON 的總覽稿（查 劇情/索引.md）' },
  { key: '遴選張仲景', rows: 'e61', json: 'Json/英豪府遴選/蔡邕、蔡琰、張仲景、張寧.json', prop: '劇情/英豪府/英豪府遴選/回音_蔡邕、蔡琰、張仲景、張寧.md', md: '劇情/英豪府/英豪府遴選/ 底下對應這份 JSON 的總覽稿（查 劇情/索引.md）' },
  { key: '179年12月', rows: 'e63', json: 'Json/探索事件/179年/12月.json', prop: '劇情/179年事件/回音_12月.md', md: '劇情/179年事件/12月(主)遴選之日(支)赤龍幫信物、甄家信物、呂之門路.md 的支線那一節' },
]

const RULES = `你在把《異麒麟》〈有人記得〉回音清單已定稿的回音轉進 JSON（作者 ${DATE} 說「轉」）。專案 D:/QilinStory，全繁中；先讀 CLAUDE.md、劇情/蝴蝶效應_素材與設計.md 第九節（規矩第 7、8 條是作者 09-28 新定的）、劇情/轉成json指南.md（§1 詞表、節點順序與編號）、給AI看的指南/Unity對話同步流程.md 的鐵則。
施工單是提案檔開頭的「## ✅ 定稿（作者 2026-09-28 選定）」一節：它寫了新格的 actorID、text、Sequence、Conditions、links、掛在哪一格之後、上一格 links 怎麼改。**只照這一節做**；後面的三版、備選、審修紀錄是留存，不施工。⚠ 提案檔若在別處還寫著 [em3] 前情標籤或「不寫 Description」，以第九節第 7 條為準：台詞不掛 em3；回音新加的每一格（台詞格與無字條件空格）Description 都寫「回音」。
規矩（違反即錯）：
1. 只加新格和它的 Conditions；既有格只准改上一格的 links：在陣列最前面加上新格的號，原連結一個不刪、不換順序（作者已准）。既有格的 text、Sequence、Conditions、Script、title、Description、entryID 一律不動。
2. 新格 entryID 從該檔「現在的最大 entryID＋1」續號（施工當下自己算，提案檔寫的號只是參考）；一列兩格的照提案順序連號。新格物件放在陣列裡緊接上一格之後（陣列順序＝閱讀順序）。新格不寫 title。
3. 新格欄位照同檔既有格的欄位與順序（先看同檔一格有 Conditions 的格照抄鍵名與寫法）：text 照定稿逐字（保留 [panel=N]、「」、[em7]…[/em7]、[var=…]）；zh_TW＝text；zh_CN 翻成簡體（標記、全形標點照留）；同檔有 en 欄的，新格照慣例（該檔其他格有 en 就補英譯，沒有就不加）。無字條件空格照提案（text ""、zh_TW／zh_CN 照同檔空格慣例、Sequence 照提案如 Continue();）。Conditions 逐字照提案，並用 grep 在 Json/ 找同一種讀法的現成格確認寫法。Description 寫「回音」。
4. 格式：這些 JSON 是 2 格縮排、links 寫在同一行（例如 "links": [2]），換行符照原檔（CRLF 或 LF 先檢查）。**不得整份重新序列化**。用 Python 讀原始文字、在上一格物件結尾後插入新物件的字串、對上一格的 "links" 那一行做精準替換，原樣寫回（newline='' 保留換行）。改完 json.load 確認合法，git diff 只看得到上一格 links 一行與新增物件。
5. 回讀：把新格補進該 JSON 的總覽稿（${'md 欄指的檔'}），照該稿既有格式（說話者、\`#N\`、Sequence／Conditions 行、註記），放在上一格之後；另加一行「- ✏ ${DATE} 新增：〈有人記得〉回音 eNN（提案檔已刪，定稿見 echoes 頁）」。總覽稿檔頭若有節點數、entryID 範圍、回讀日期，照實更新。呂信線〈五原障〉的 md 是創作稿不是回讀稿，同樣把新格補進對應位置並加 ✏ 註記。
6. 跑 python -X utf8 給AI看的指南/json順序檢查.py "<json>"（舊檔原有的警告不管，新格不得被報；「回音」已在詞表、沒有指令的回音格已放行）與 python -X utf8 給AI看的指南/文風節奏檢查.py "<json>"。
7. 不動提案檔、不刪任何檔、不改 劇情/索引.md 與 給AI看的指南/跨機待辦.md（主流程統一登記）、不動其他 JSON；Json/主線事件/ 底下絕對不碰。另一個對話可能同時改別的檔。`

function applyPrompt(g) {
  return `${RULES}

本組：${g.key}（回音 ${g.rows}）
JSON：${g.json}
提案檔（施工單）：${g.prop}
總覽稿：${g.md}

回報：新格的 entryID、actorID、text、zh_CN、Conditions、Description、links；上一格 links 改前改後；總覽稿補在哪；兩支檢查腳本結果；任何跟提案不符、你照 JSON 實況調整的地方。`
}

const AUDIT_SCHEMA = {
  type: 'object',
  properties: {
    ok: { type: 'boolean' },
    issues: { type: 'array', items: { type: 'object', properties: {
      id: { type: 'string' }, problem: { type: 'string' }, fix: { type: 'string' },
    }, required: ['id', 'problem', 'fix'] } },
    newIds: { type: 'string' },
    summary: { type: 'string' },
  },
  required: ['ok', 'issues', 'newIds', 'summary'],
}

function verifyPrompt(g, report, round) {
  return `${RULES}

你是驗收（第 ${round} 輪），只讀不改。本組：${g.key}（回音 ${g.rows}）
JSON：${g.json}；提案檔：${g.prop}；總覽稿：${g.md}
施工前這份 JSON 沒有未 commit 的改動，所以 git diff 就是這次的全部改動。

施工回報：
<<<
${report}
>>>

查：
1. git diff JSON：只有上一格 links（新號加在最前、原連結不刪不換序）與新增物件；沒有整份重排、換行沒被改；json.load 合法。
2. 新格：entryID 是施工前最大號＋1 起連號、沒撞號；陣列位置緊接上一格；text 與 ✅ 定稿節逐字相同、沒有 [em3] 標籤；zh_TW＝text；zh_CN 簡體正確、標記齊全；Conditions 與提案相同且寫法跟 Json/ 現成格一致；Description「回音」；links 指向提案說的接回格且那格存在；沒寫 title；兩格的空格＋台詞順序對。
3. 讀一遍上一格到接回格：條件成立與不成立兩種都走得通（NPC 格多條連結時引擎走第一條成立的）。
4. 總覽稿補得對、位置對、檔頭數字照實。
5. 兩支檢查腳本新格沒被報。
ok：沒有問題才 true。issues 每個問題一筆（id、problem、fix 具體怎麼修）。newIds：新格的 entryID，逗號分隔。summary 三五句。`
}

function fixPrompt(g, audit) {
  return `${RULES}

你是修正施工。本組：${g.key}（JSON：${g.json}；提案檔：${g.prop}；總覽稿：${g.md}）
驗收找到下列問題，逐條修（查證後認為 fix 本身錯了，照規矩修對並說明）：
<<<
${JSON.stringify(audit.issues, null, 1)}
>>>
修完 json.load 確認、看 git diff、跑兩支檢查腳本。回報每條怎麼修的。`
}

const results = await pipeline(
  GROUPS,
  g => agent(applyPrompt(g), { label: `apply:${g.key}`, phase: 'Apply', model: 'opus', effort: 'high' }),
  (report, g) => agent(verifyPrompt(g, report || '（施工沒有回報）', 1), { label: `verify:${g.key}`, phase: 'Verify', model: 'opus', effort: 'high', schema: AUDIT_SCHEMA })
    .then(a => ({ report, audit: a })),
  async (r, g) => {
    if (!r.audit || r.audit.ok || !(r.audit.issues || []).length) return { key: g.key, ...r }
    log(`${g.key}：驗收找到 ${r.audit.issues.length} 個問題，送修`)
    const fixReport = await agent(fixPrompt(g, r.audit), { label: `fix:${g.key}`, phase: 'Fix', model: 'opus', effort: 'high' })
    const audit2 = await agent(verifyPrompt(g, (r.report || '') + '\n\n修正回報：\n' + (fixReport || ''), 2), { label: `verify2:${g.key}`, phase: 'Fix', model: 'opus', effort: 'high', schema: AUDIT_SCHEMA })
    return { key: g.key, ...r, fixReport, audit2 }
  },
)
return results.filter(Boolean).map(r => ({ key: r.key, audit: r.audit, audit2: r.audit2, report: (r.report || '').slice(0, 2500), fixReport: (r.fixReport || '').slice(0, 1500) }))
