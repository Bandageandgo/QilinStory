export const meta = {
  name: 'finalize-and-convert',
  description: '作者挑版之後的收尾：每件一名定稿（max，可把幾份提案的選定版合成一份、對話置頂）→ 一名轉 JSON（max）→ 一名獨立複核（max），有錯送修再核一次；同一份 JSON 的幾件依序寫、不同 JSON 同時跑',
  phases: [
    { title: 'Finalize', detail: '每件一名：照作者裁示把選定版合成定稿檔（對話置頂、給 AI 的放後面），跑兩支檢查' },
    { title: 'Convert', detail: '每件一名：把定稿逐格稿寫進對應 JSON（新檔從 1 編、既有檔續號），補 zh_CN' },
    { title: 'Verify', detail: '每份 JSON 一名獨立複核：對話段、逐格稿、JSON 三處文字一致、來路全走、無自創變數；有錯送修再核一次' },
  ],
}

// 用法（2026-09-28 第二版，可合幾份提案、對話置頂）：Workflow({script: <本檔全文>, args: {date: '2026-09-28', jobs: [
//   { key: '委託與半路', title: '老兵的委託（181/2 探索事件・支線）',
//     proposals: [{file: '劇情/檀石槐線_01委託.md', chosen: '版三（丙｜另一種演法）'}, {file: '劇情/檀石槐線_02半路.md', chosen: '版三（丙｜另一種演法）'}],
//     out: '劇情/181年事件/02月(支)老兵的委託.md',
//     json: 'Json/探索事件/181年/2月.json', newjson: true, template: 'Json/探索事件/180年/3月.json',
//     rules: '作者裁示逐條', extra: '（選填）設計端連帶' },
// ]}})
// 舊寫法 {proposal, chosen} 仍可用（單檔、定稿寫回提案檔）。同一份 json 的 jobs 依序轉；不同 json 同時跑。
// ⚠ scriptPath 會被權限層擋（2026-09-28），要把本檔全文用 script 參數 inline 傳。所有 agent git 只准讀。
const A = Object.assign({ date: '＿＿＿＿-＿＿-＿＿', jobs: [], model: 'opus' }, args || {})
const DATE = A.date
const MODEL = A.model
const JOBS = (Array.isArray(A.jobs) ? A.jobs : []).map(j => {
  const proposals = j.proposals || (j.proposal ? [{ file: j.proposal, chosen: j.chosen }] : [])
  const out = j.out || (proposals[0] && proposals[0].file)
  return Object.assign({ title: j.key, newjson: false, template: null, rules: '', extra: '' }, j, { proposals, out })
})
if (!JOBS.length) return { error: 'args.jobs 是空的' }

const COMMON = `你在做《異麒麟》多 agent 流程的收尾（作者已挑版）。規矩：
- **git 只准讀**（status／diff／diff --stat／show）。**絕對不准** stash、checkout、restore、add、commit、reset 或任何會動工作區的 git 指令；要比對改前改後，先把檔複製到 scratchpad 再比。工作區本來就有很多別人的未提交改動，不是你的，不要碰。
- 硬紅線：不新建變數、任務號、教學 ID、地圖點、戰鬥 ID，要作者建的一律留 ＿＿；SetFlag／GetFlag 禁用；已進 Unity 的節點不改號、不動 title、不改字（作者裁示點名的除外）；新格不寫 title；Description 只寫 劇情/轉成json指南.md §1 詞表的標籤（作者 2026-09-28 准的例外：探索事件與箱庭對話的**入口格**寫一句「入口：…；條件作者設」提醒）；zh_TW 是 text 的鏡像，改了 text 就補 zh_CN（只轉簡體字，不改句，標記原樣）。
- 文風規矩（違反即退）：先讀 給AI看的指南/武俠文風創作指南.md〈零、常犯十條〉的錯例對改例。旁白看得見你做什麼、看不見你想什麼；寫結果和狀態不寫過程、同一人一格最多兩拍；不用作者退過的句型（翻轉句、否定句收尾、比喻巧句收尾、收尾加判語、旁白搶台詞、同一件事講兩遍）；不編純造景細節與精確數目；不斷碎句（旁白一格兩三句、每句十九到二十五字；台詞一句十五字上下照角色口吻）；旁白不寫「」；**全篇不用破折號「——」，台詞也不用**（打斷用「……」）；[em7] 每十格至多一個、同一人不連掛、[/em7] 後必接標點；不自創單字名詞；禁詞（五胡亂華、司馬、篡魏、三國歸晉、輪迴、重來、前世）；角色口中不出「凶戾」「人祭」。
- **檔案體例（作者 2026-09-28 裁示）：對話文字置頂、給 AI 看的放後面。** 定稿檔的結構固定是：
  # 〈標題〉（✅ 定稿 ${DATE}）
  > 短檔頭三到六行：這是什麼（哪一年月、主線／支線／箱庭）、來源提案與選定版、對應 JSON、入口規矩、待作者填（留白清單）
  ## 一、對話（給作者讀）
  純對話，不放任何指令與 ID：**旁白:** ＊（…）＊／**你:**／**〈角色〉:**「…」；箱庭則每個入口一小節；一層一層縮排；分岔用「▶ 〈條件白話〉」開頭；選項用「◆ 玩家選擇」列出各條；轉場、戰鬥、擲骰只寫一行斜體提示；作者裁示改過的句子前面加 ★。
  ## 二、給 AI 的
  ### 節首（表：對應 JSON、入口格與尾格、讀的條件、寫的指令逐行含 ＿＿、MapLock／戰鬥／擲骰、設計端連帶、格數、陣列順序）
  ### 逐格稿（每格：說話者行＋全文，底下 - actorID: / - Sequence: / - Conditions: / - Script: / - Description: 有才寫；新格用【A】【B】…標；分岔 ▶；合流「→ 接【X】」）——這一節的每一句要跟第一節逐字相同
  ### 定稿改動（每處：原句→新句→依作者哪一條）
  ### 待作者定（只列定稿後仍有效的，每條前加 ⚠）
  ### 審修紀錄（從提案檔搬來，只留選定版那幾條，簡短）
- 只動任務指名的檔。日期一律寫 ${DATE}。給作者看的話用白話短句。`

function jobHead(j) {
  return `件：${j.key}｜標題：${j.title}
來源提案與選定版：
${j.proposals.map(p => `- ${p.file} → ${p.chosen}`).join('\n')}
定稿檔：${j.out}${j.out === (j.proposals[0] && j.proposals[0].file) ? '（＝提案檔本身，定稿寫進「## ✅ 定稿」一節；體例仍是對話置頂）' : '（新檔或整檔覆寫）'}
對應 JSON：${j.json}${j.newjson ? `（**新檔或整檔重出**：從 entryID 1 起編，檔案格式照範本 ${j.template}）` : '（既有檔，新格從最大 entryID 加一起續號；已進 Unity 的格不改號、不動 title）'}
作者裁示（全部要套進定稿）：
${j.rules || '（無）'}
${j.extra ? '設計端連帶：\n' + j.extra : ''}`
}

function finalizePrompt(j) {
  return `${COMMON}

你是「${j.key}」的定稿人。**只寫 ${j.out}**（目錄不存在就建；作者裁示若要先備份舊檔到舊創作稿，照做），另外只在每份來源提案檔的檔頭引用區塊加一行（見第 8 步）；設計端連帶若任務有寫也做；其他檔一律不動。
${jobHead(j)}

先讀：給AI看的指南/武俠文風創作指南.md〈零、常犯十條〉；每份提案檔的檔頭、選定版那一節全部（第一節對話、第二節節首、逐格稿、旁白逐格表、審修紀錄含邏輯審）、〈待作者定〉、〈審修摘要〉；作者裁示點名要讀的設定檔與舊定稿；定稿格式看本提示〈檔案體例〉。台詞若要改字或新寫，先跑 python -X utf8 給AI看的指南/既有台詞.py <角色> 對口吻，聲口卡在 給AI看的指南/武俠文風創作指南.md 第四節。

做法：
1. 把選定版搬成定稿：逐條套作者裁示（換句、刪格、刪分支、加格、加指令、留白），不套的字一個都不動；作者裁示要新寫的段落照施工圖寫、照規矩過；不多問玩家一次、每個選單至少兩項。
2. 寫 ${j.out}：照〈檔案體例〉——短檔頭、第一節純對話、第二節給 AI 的。第一節與第二節逐格稿的每一句必須逐字相同（你自己抄完再比一次）。
3. 節首表要能讓轉 JSON 的人不回提案檔：每個入口格與尾格、每個分岔的條件、每條 Script／Sequence 指令（含 ＿＿）、MapLock／戰鬥／擲骰／轉場的固定寫法、格數、陣列順序。
4. **邏輯過一遍**：逐格查誰知道什麼、先後因果、轉場前後時辰地點、東西的去向、旁白不重講也不晚一步交代台詞已用到的事、每條分支的前提在那條路上成立、跟前後場的接口、箱庭的點換順序也通。發現就改，記進〈定稿改動〉標「邏輯」。
5. **旁白逐格過一遍**：照〈常犯十條〉第 3 條與第 7 條看每一個旁白格；跑 python -X utf8 給AI看的指南/文風節奏檢查.py "${j.out}"，它列的「旁白卡候選」每一條要改掉，或在〈定稿改動〉寫明為什麼留。
6. 〈定稿改動〉逐處記：原句→新句→依作者第幾條。〈待作者定〉只留定稿後仍有效的。
7. 跑 python -X utf8 給AI看的指南/文風節奏檢查.py "${j.out}" 與 python -X utf8 給AI看的指南/高難度檢定檢查.py "${j.out}"，定稿必須乾淨（後者「沒寫分類」與入口格提醒句那幾條警告不管）。
8. 每份來源提案檔的檔頭引用區塊第一行改成「**創作稿／提案，已定稿。** ✅ ${DATE} 作者選定**〈版〉**，定稿合進 ${j.out}；本檔留存不改，回讀後歸檔」；其餘字不動。
9. git status 只讀，確認只有 ${j.out}、那幾份提案檔、備份檔與設計端連帶點名的檔有新改動。
回傳 JSON：ok（作者裁示全部套進去、兩節逐字一致、檢查乾淨才 true）、changes（每處原句→新句一行一筆）、unresolved（仍要作者定的，字串陣列；有任何一條會擋住轉 JSON 的就把 ok 設 false）、cells（格數）、rhythm、format、summary（三五句）。`
}

function convertPrompt(j, startNote) {
  return `${COMMON}

你是「${j.key}」的轉 JSON 編輯。**只改 ${j.json}**，外加定稿檔 ${j.out} 檔頭一行；設計端連帶若任務有寫也做；其他檔一律不動。
${jobHead(j)}
${startNote}

先讀：定稿檔 ${j.out} 第二節（節首表、逐格稿）；劇情/轉成json指南.md 全檔（§1 欄位與 Description 詞表、§3 尾格與轉場、§4.2 選項、〈節點順序與編號〉）；給AI看的指南/Unity對話同步流程.md；給AI看的指南/立繪指令轉換規則.md；${j.newjson ? `範本 ${j.template}（頂層是陣列還是物件、欄位順序、縮排、換行、檔尾）與它裡面一格有 Conditions 與 Script 的節點；箱庭多入口的樣子另看 Json/大地圖/水濂洞.json 的入口格` : `同檔既有格的欄位順序與寫法`}；同類前例 Json/探索事件/181年/2月.json（Sequence 與 Script 以「;\\n」分隔、空格寫法、Continue();）。

規矩：
1. ${j.newjson ? `新檔或整檔重出：寫 ${j.json}（作者裁示說整檔覆寫就覆寫，先把舊檔複製到 scratchpad），entryID 從 1 起連號、陣列順序＝閱讀順序（箱庭照定稿節首寫的入口順序，每個入口的子樹連著排）、不寫 title；格式（縮排、ensure_ascii=False、CRLF 或 LF、檔尾換行）跟範本一模一樣。` : '既有節點只改定稿節首表點名的那幾格，其餘一個欄位都不動；新格接在陣列檔尾、續號、不寫 title。'}
2. text 照定稿逐格稿原字，zh_TW 同 text，zh_CN 只轉字；Conditions／Sequence／Script／Description 逐字照定稿；留白 ＿＿ 原樣保留；不得自創變數、任務號、actorID。
3. 寫檔：Python 讀、改、寫回；先拿範本驗證同一套寫法能逐位元組重現，再去產檔。改完 git status／git diff -- "${j.json}" 確認只有預期改動。
4. 跑 python -X utf8 給AI看的指南/json順序檢查.py "${j.json}"：要乾淨（入口格那一句提醒是作者准的例外；箱庭多入口、再點入口回接選單造成的順序提示，在回報裡說明）。
5. 每條來路走一遍（程式照 links 與 Conditions 模擬：每個入口單獨進、每個選項、戰鬥勝敗、擲骰過不過、每個變數與任務狀態 true／false／從沒寫過，Lua 裡 nil 跟 false 不相等）：沒有斷鏈、沒有格子兩邊都會播、表情特效有開有關、每條都走到尾格或關掉對話；每個選單至少兩項。
6. 定稿檔檔頭引用區塊補一行「✅ ${DATE} 已轉 JSON（${j.json} #起–#迄），待匯入 Unity、待回讀」。
7. 設計端連帶：照任務寫的做，其他字不動。
回傳 JSON：range、cells（每格號對【】字母與一句內容）、changed、diff_stat、order_check、walk、deviations（沒有寫 "無"）。`
}

function verifyPrompt(j, conv) {
  return `${COMMON}

你是「${j.key}」轉 JSON 的獨立複核，只讀不改（git 只讀）。
${jobHead(j)}

轉 JSON 編輯的回報：
<<<
${JSON.stringify(conv, null, 1)}
>>>

自己回 ${j.json} 與定稿檔 ${j.out} 逐項查，不要只信回報：
1. 三處文字一致：定稿第一節、第二節逐格稿、JSON 的 text 逐字相同；zh_TW 同 text，zh_CN 是簡體且標記原樣；沒有 title；Conditions／Sequence／Script／Description 逐字對；Description 在詞表內（入口格例外）；沒有自創變數、任務號、actorID；＿＿ 有留住。
2. ${j.newjson ? '整檔：entryID 從 1 連號、陣列順序＝閱讀順序、檔案格式跟範本一致、能 json.load。' : '既有格：只改了定稿點名的那幾格與欄位。'}
3. 連線：每個入口單獨進、每條來路走一遍，沒有斷鏈、沒有格子兩邊都會播、表情特效沒有開了不關、每條都到尾格或關掉對話；入口格無 Conditions；尾格照規矩；每個選單至少兩項。
4. 作者裁示逐條回頭對定稿：每一條都套了、沒套的字沒被動。
4b. 邏輯與旁白：逐格查誰知道什麼、先後因果、東西去向、旁白與台詞不打架、分支前提成立、前後場接口、點換順序也通；旁白照〈常犯十條〉第 3、7 條再掃一遍；有問題列進 issues。
5. 設計端連帶若任務有寫，查它做了沒、字對不對。
回傳 JSON：ok、issues（每筆 where、problem、fix，具體到格號與欄位）、summary。`
}

function fixPrompt(j, verify) {
  return `${COMMON}

你是「${j.key}」轉 JSON 的修正編輯。複核找到下列問題，逐條照 fix 修（若查證後 fix 本身錯了，照規矩修對並說明）。只改 ${j.json} 與 ${j.out}（與任務點名的設計端檔），其他不動；git 只讀。
<<<
${JSON.stringify(verify.issues, null, 1)}
>>>
修完重跑 python -X utf8 給AI看的指南/json順序檢查.py "${j.json}" 與 python -X utf8 給AI看的指南/文風節奏檢查.py "${j.out}" 與 git diff --stat。回傳 JSON：fixed（每條怎麼修）、diff_stat。`
}

const FIN_SCHEMA = { type: 'object', properties: {
  ok: { type: 'boolean' }, changes: { type: 'array', items: { type: 'string' } }, unresolved: { type: 'array', items: { type: 'string' } },
  cells: { type: 'integer' }, rhythm: { type: 'string' }, format: { type: 'string' }, summary: { type: 'string' },
}, required: ['ok', 'changes', 'unresolved', 'cells', 'rhythm', 'format', 'summary'] }
const CONV_SCHEMA = { type: 'object', properties: {
  range: { type: 'string' }, cells: { type: 'array', items: { type: 'string' } }, changed: { type: 'array', items: { type: 'string' } },
  diff_stat: { type: 'string' }, order_check: { type: 'string' }, walk: { type: 'string' }, deviations: { type: 'string' },
}, required: ['range', 'cells', 'changed', 'diff_stat', 'order_check', 'walk', 'deviations'] }
const VER_SCHEMA = { type: 'object', properties: {
  ok: { type: 'boolean' }, issues: { type: 'array', items: { type: 'object', properties: {
    where: { type: 'string' }, problem: { type: 'string' }, fix: { type: 'string' },
  }, required: ['where', 'problem', 'fix'] } }, summary: { type: 'string' },
}, required: ['ok', 'issues', 'summary'] }
const FIX_SCHEMA = { type: 'object', properties: {
  fixed: { type: 'array', items: { type: 'string' } }, diff_stat: { type: 'string' },
}, required: ['fixed', 'diff_stat'] }

log(`定稿：${JOBS.map(j => j.key).join('、')}`)
const fins = await parallel(JOBS.map(j => () =>
  agent(finalizePrompt(j), { label: `finalize:${j.key}`, phase: 'Finalize', effort: 'max', model: MODEL, schema: FIN_SCHEMA })
    .then(r => ({ job: j, fin: r }))))

const groups = {}
for (const x of fins) { (groups[x.job.json] = groups[x.job.json] || []).push(x) }
const results = await parallel(Object.values(groups).map(g => async () => {
  const out = []
  let lastRange = null
  for (const { job, fin } of g) {
    if (!fin) { out.push({ key: job.key, error: 'finalize failed' }); continue }
    if (!fin.ok) { out.push({ key: job.key, error: 'finalize not ok', unresolved: fin.unresolved, summary: fin.summary }); log(`${job.key}：定稿有擋住的待定，跳過轉 JSON`); continue }
    const startNote = lastRange ? `同一份 JSON 前一件剛寫到 ${lastRange}，你的新格接著往下編。` : ''
    const conv = await agent(convertPrompt(job, startNote), { label: `convert:${job.key}`, phase: 'Convert', effort: 'max', model: MODEL, schema: CONV_SCHEMA })
    if (!conv) { out.push({ key: job.key, fin, error: 'convert failed' }); continue }
    lastRange = conv.range
    let ver = await agent(verifyPrompt(job, conv), { label: `verify:${job.key}`, phase: 'Verify', effort: 'max', model: MODEL, schema: VER_SCHEMA })
    let fix = null, ver2 = null
    if (ver && !ver.ok && ver.issues.length) {
      log(`${job.key}：複核找到 ${ver.issues.length} 個問題，送修`)
      fix = await agent(fixPrompt(job, ver), { label: `fix:${job.key}`, phase: 'Verify', effort: 'max', model: MODEL, schema: FIX_SCHEMA })
      ver2 = await agent(verifyPrompt(job, { ...conv, fixed: fix }), { label: `verify2:${job.key}`, phase: 'Verify', effort: 'max', model: MODEL, schema: VER_SCHEMA })
    }
    log(`${job.key}：轉好 ${conv.range}，複核 ${((ver2 || ver) && (ver2 || ver).ok) ? '過' : '仍有問題'}`)
    out.push({ key: job.key, fin: { changes: fin.changes, unresolved: fin.unresolved, cells: fin.cells }, conv, ver, fix, ver2 })
  }
  return out
}))
return { date: DATE, jobs: results.flat() }
