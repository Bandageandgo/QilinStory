export const meta = {
  name: 'tanshihuai-zhcn',
  description: '第四級第 5 步第 3 小步：鮮卑王帳 JSON 的簡體翻譯表，一名 high 只填「簡體」欄（標籤標點一字不動、不改內容、大陸用語）；agent 不碰 JSON',
  phases: [{ title: 'Translate', detail: '一名 high：填 75 格簡體' }],
}
const A = Object.assign({ date: '＿＿＿＿-＿＿-＿＿' }, args || {})
const TABLE = 'C:/Users/user/AppData/Local/Temp/claude/d--QilinStory/1ddf8b7f-8270-48d3-b27d-a5e5e30f3f7a/scratchpad/hc/王帳全稿/簡體表.md'

const PROMPT = `你是《異麒麟》對話 JSON 的簡體翻譯（多Agent創作流程 §二 第 5 步第 3 小步；先讀 給AI看的指南/填簡體.py 檔頭那幾行規矩）。**只改這一個檔：${TABLE}**，只填表裡「簡體」那一欄；不碰任何 JSON、不碰專案裡任何檔；git 只准讀。
規矩：
- 每一列的「繁體」欄逐字轉成簡體填進「簡體」欄：**只轉字，不改內容、不潤色、不改語序、不加減字**。
- [panel=6]、[em7]…[/em7]、[em2]…[/em2]、[em3]…[/em3]、【】、＊（ ）＊、「」、標點、空格**一字不動**，位置不變。
- 用大陸用語與簡體規範字：妳→你、臺→台、甚麼→什么、麼→么、裡→里、後→后、髮→发、鬆→松、幾→几、隻→只、麵→面、鬥→斗、乾→干（乾肉→干肉；「乾」當「乾坤」讀 qián 時才留）、著→着（動詞助詞「著」在大陸簡體寫「着」：拴著→拴着、看著→看着、提著→提着；「著名」才用「著」）、於→于、鞍→鞍、氈→毡、韁→缰、繩→绳、劍→剑、雲中→云中、檀石槐→檀石槐（人名不變）、鮮卑→鲜卑、朔方→朔方。
- 一列一列填，75 列都要填；不要漏、不要合併列、不要動表頭與說明行、不要改「entryID」「繁體」兩欄。
- 填完自己再掃一遍：每列的標籤數（[panel]／[em]／【】）跟繁體那欄一樣多；沒有一列留空。
用 Read 讀檔、用 Edit 或 Write 寫回同一個路徑（保留原本的換行）。回傳 JSON：file、filled（填了幾列）、checked（一句：標籤數都對、沒有空列）。`

log('簡體翻譯：一名 high')
const r = await agent(PROMPT, { label: 'zhcn:王帳', phase: 'Translate', effort: 'high', model: 'opus', schema: { type: 'object', properties: {
  file: { type: 'string' }, filled: { type: 'integer' }, checked: { type: 'string' },
}, required: ['file', 'filled', 'checked'] } })
return r ? { date: A.date, ...r } : { date: A.date, error: 'translate failed' }