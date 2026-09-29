export const meta = {
  name: 'guojia-reconcile-2',
  description: '郭嘉線收尾第二輪：照驗收意見修 md 與待拍板清單，交出最終附對話的決策題',
  phases: [{ title: 'Fix', detail: '每份檔一名，照驗收意見修' }, { title: 'Check', detail: '每份檔一名驗收' }],
}
const PREV = 'C:/Users/user/AppData/Local/Temp/claude/d--QilinStory/90185aca-633d-4b94-9884-c66314379f5f/scratchpad/gj_reconcile.json'
const FILES = ['劇情/郭嘉/01 逝者無聲.md','劇情/郭嘉/02 藥渣.md','劇情/郭嘉/03 欠條.md','劇情/郭嘉/04 其所不見.md','劇情/郭嘉/06 那種東西.md','劇情/郭嘉/07 看診.md','劇情/郭嘉/08 開春.md']
const SCHEMA = {
  type: 'object',
  properties: {
    fixed: { type: 'array', items: { type: 'string' } },
    decisions: { type: 'array', items: { type: 'object', properties: {
      id: { type: 'string' }, question: { type: 'string' }, dialogue: { type: 'string' },
      options: { type: 'array', items: { type: 'string' } },
    }, required: ['id','question','dialogue','options'] } },
  },
  required: ['fixed','decisions'],
}
const BG = `背景：郭嘉線八份初稿（劇情/郭嘉/01–08，未轉 JSON）剛改完 143 條審稿單條目。上一輪收尾（結果存在 ${PREV}，一個檔一筆：fixed、decisions、dropped、check）由驗收挑出了問題（check 欄的 problems）。作者只看得懂對話原文：每題 decision 的 dialogue 要照 md 現況逐字、照播放順序列出前後格（說話者：台詞），改前改後都寫；options 要能直接套用（寫清楚每一處要改成什麼字、連帶要改的註記或設計表也寫出來），第一個是建議，選項本身不能再犯作者退過的毛病（內心話、判語、否定句收尾、翻轉句、比喻收尾、主角無從得知的事）。跨檔牽連的題（例如 01 N0854 與 06 N0956 是同一件事）合成一題，放在編號較小那個檔，另一個檔不要重複出題。`
async function one(file) {
  const rep = await agent(`${BG}

你負責 ${file}。讀 ${PREV} 裡這個檔的上一輪結果與 check。逐條處理 check 的 problems：
- 是 md 的毛病（這次改寫的句子仍有毛病、註記指錯、稱謂錯如「師父」應為「賈先生」、該問作者卻寫成「看作者」的註記）→ 直接照規矩修好，✏ 註記同步，寫進 fixed。
- 是決策題的毛病（對話引錯、選項不能直接套用、漏題、該合題）→ 改好後放進 decisions。
- 把上一輪沒被挑毛病的 decisions 也一併帶上（照 md 現況再核一次原文）。
最後 decisions 是這個檔的完整最終清單。改完跑 python -X utf8 給AI看的指南/文風節奏檢查.py "${file}"。不動 Json/；必要時可動同線另一份郭嘉檔的註記，寫進 fixed。`, { label: `fix:${file.split('/').pop()}`, phase: 'Fix', schema: SCHEMA })
  if (!rep) return { file, error: 'fix failed' }
  const chk = await agent(`${BG}

你是 ${file} 的驗收，只讀不改。這一輪結果：
<<<
${JSON.stringify(rep, null, 1)}
>>>
查 fixed 是否真的做了、做對了（git diff -- "${file}"）；decisions 的 dialogue 與 md 現況逐字相符且照播放順序；options 可直接套用、本身沒犯作者退過的毛病。回傳 JSON 字串 {"ok":true/false,"problems":["…"]}，只列真的錯，不挑口味。`, { label: `check:${file.split('/').pop()}`, phase: 'Check' })
  return { file, ...rep, check: chk }
}
const out = await parallel(FILES.map(f => () => one(f)))
return out.filter(Boolean)
