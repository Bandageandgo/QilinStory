export const meta = {
  name: 'tanshihuai-logic-review',
  description: '第四級第 4 步：鮮卑王帳全稿文字定了之後的邏輯審，只列不改，六件事，每個問題開成三選一；寫到 scratchpad 不碰全稿（另一名 agent 同時在改全稿的兩格）；一名 agent，max',
  phases: [{ title: 'Logic', detail: '一名：六件事逐格查、問題開三選一、寫到 scratchpad' }],
}
const A = Object.assign({ date: '＿＿＿＿-＿＿-＿＿' }, args || {})
const DATE = A.date
const FILE = '劇情/檀石槐線_08王帳全稿.md'
const OUT = 'C:/Users/user/AppData/Local/Temp/claude/d--QilinStory/1ddf8b7f-8270-48d3-b27d-a5e5e30f3f7a/scratchpad/hc/王帳全稿/logic.md'
const PREV = '劇情/181年事件/02月(支)老兵的委託、工坊.md'
const DUNGEON = '劇情/鮮卑王帳/@設定_鮮卑王帳.md'

const PROMPT = `你是《異麒麟》蝴蝶效應第三案「檀石槐線」箱庭「鮮卑王帳」全稿 ${FILE} 的**邏輯審**（第四級第 4 步；先讀 給AI看的指南/多Agent創作流程.md 第一、二節，尤其第 4 步）。作者 2026-09-30 已說「文字定了」，只剩 10 營亂的【CY】【CZ】兩格另一名 agent 正在給候選（那兩格你只看它們的位置與功能，不審字）。**你只列不改**：規矩、格式、口吻不歸你；任何檔都不動，只寫 ${OUT}（目錄不存在就建）。
先讀：${FILE} 全檔（檔頭「Unity 要設」、〈對話〉十二個入口、〈逐格（給 AI）〉節首與逐格稿、〈改動紀錄〉）；前一場 ${PREV} 第一節（玩家進箱庭前看過什麼：老兵、他兒子、他自己北上死在半路、你埋了他照北邊那顆星走）；${DUNGEON}〈箱庭寫法（第五版）〉與〈ID〉〈任務與狀態〉；Json/大地圖/翠影潭.json 裡 IsHidden4 那段（釣魚叟：替他們放馬一個冬天、人看慣了眼睛就滑過去；作者改成「等他落單」）。
**只看六件事**，逐格、每個入口單獨進、點的順序不定（先黑狼再進營、先進營再回坡上、放火放馬奴隸下毒任何順序、黑狼派人湊數、計亂由任三樣湊出、還沒亂就殺進主帳、走缺口進營沒見過哨騎、口才放行進營、隱藏選項等他落單、營亂時他身邊沒人）都要通：
1. 誰知道什麼：每一格說話的人、主角、旁白此刻知道的事，是不是前面已經看見或聽見的；沒看見的不能認出，沒聽見的不能回答，同一件事不能認第二次、講第二次（例：黑狼第一次已自報，再點不再自報；主角第一次見黑狼王時還不知道他是誰）。
2. 先後因果：先看見才能叫人、先問才有答、先做才有結果；轉場前後時辰、天色、地點接得上（例：隱藏選項那條「天黑以後」跟其他點的時辰；營亂演出「好幾處一齊亂了起來」跟計亂湊法）；人在哪、誰在場前後一致（例：主帳兩波打完檀石槐還坐著；營亂他身邊沒人；殺了他之後黑狼衝進營、你上坡、窪地裡只剩黑狼王）。
3. 東西的去向：刀、劍、酒囊、繩子、馬、錢袋、馬鞍，有拿出來就有交代；沒有憑空多出來的東西。
4. 旁白和台詞不打架：旁白不重講台詞剛講的事，也不比台詞晚一步才交代台詞已用到的事；選項文字跟後面的戲對得上（例：哨騎「受人之託來見你們大人」放行後，進營開場「一隊騎手…喊的正是檀石槐」接不接得上；【BC】「等營裡亂了我再來取」跟營亂強制劇情）。
5. 每條分支的前提在那條路上真的成立：條件格（IsHidden4、IsCultureFit、IsPassDice、IsPassFight）、計亂 +1 五處、entry 1 在進營開場、entry 2 在殺了他、Unity 端的門檻（≥1 開 2b、≥3 跳營亂、亂後關主帳、奴隸成功後關點）；缺口進營那條沒有對話、會不會漏掉什麼。
6. 前後場接口：入口開場假定的事前一場真的演過；收尾留下的狀態（entry 2、任務 success、日曆 181/6、地圖鎖）跟設定檔一致。
怎麼寫 ${OUT}：
# 鮮卑王帳全稿　邏輯審（${DATE}）
> 只列不改。每一條寫成三選一，作者挑；沒問題的項目也要寫「過」讓他知道查過。
## 問題（表：| 編號 | 哪一件 | 格名 | 問題（一句） | 甲 | 乙 | 丙 | 作者選 |）——三個候選都要修掉那個問題、都只動那一格或那幾格、都過文風規矩（一句十五字上下、旁白一格兩三句、不破折號、不內心話）；能用 Unity 設定解決的候選寫「Unity：…」也算一個候選。
## 查過沒問題的（六件事各幾行，寫查了哪些路）
回傳 JSON：out、issues（每筆：no、which、cells、problem、options [甲, 乙, 丙] 全文）、passed（一句）、summary（兩三句）。git 只准讀。`

log('邏輯審：一名 agent，只列不改')
const r = await agent(PROMPT, { label: 'logic:王帳全稿', phase: 'Logic', effort: 'max', model: 'opus', schema: { type: 'object', properties: {
  out: { type: 'string' },
  issues: { type: 'array', items: { type: 'object', properties: { no: { type: 'integer' }, which: { type: 'string' }, cells: { type: 'string' }, problem: { type: 'string' }, options: { type: 'array', items: { type: 'string' } } }, required: ['no', 'which', 'cells', 'problem', 'options'] } },
  passed: { type: 'string' }, summary: { type: 'string' },
}, required: ['out', 'issues', 'passed', 'summary'] } })
return r ? { date: DATE, ...r } : { date: DATE, error: 'logic failed' }