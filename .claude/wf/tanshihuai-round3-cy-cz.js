export const meta = {
  name: 'tanshihuai-round3-cy-cz',
  description: '第四級第 3 步第三輪：營亂段【CY】【CZ】各三個候選寫回全稿〈標記與三選一〉；【CX】照作者指示直接拿掉末句；一名 agent',
  phases: [{ title: 'Round3', detail: '一名：兩格各三候選、一格照改、跑腳本' }],
}
const A = Object.assign({ date: '＿＿＿＿-＿＿-＿＿' }, args || {})
const DATE = A.date
const FILE = '劇情/檀石槐線_08王帳全稿.md'

const PROMPT = `你在做《異麒麟》蝴蝶效應第三案「檀石槐線」箱庭「鮮卑王帳」全稿 ${FILE} 的**標句三選一・第三輪**（第四級第 3 步；先讀 給AI看的指南/多Agent創作流程.md 第一、二節）。作者已看完第二輪，說「除了這三句，文字定了」。他的三條：
1. 【CX】（10 營亂第二格旁白）：「拿掉『站在了帳門口』這句」。**照做、不出候選**：原句 ＊（帳前守著的那一圈人，都朝喊聲那頭跑了過去。檀石槐提著刀從大帳裡出來，站在了帳門口。）＊ → ＊（帳前守著的那一圈人，都朝喊聲那頭跑了過去。檀石槐提著刀從大帳裡出來。）＊。〈對話〉與逐格稿同步，記進〈改動紀錄〉（作者親改）。
2. 【CY】（10 營亂，你叫陣；沒有選單，說完直接單挑 100）：「改」，沒寫方向。原句「檀石槐，我受人之託，今天特地來取你這條命！你的人都顧不上你了，是好漢就跟我拚個生死！」
3. 【CZ】（10 營亂末格旁白，接著進單挑）：「改」，沒寫方向。原句 ＊（檀石槐聽完沒有答話，提著那把刀朝你走了過來。帳前那片空地上，站著的就只剩你跟他。）＊
先讀：${FILE} 的〈對話〉10 營亂整節（【BX】演出、【CX】改後、【CY】、【CZ】，接 8 底下〈戰鬥：檀石槐〉，打贏接〈殺了他〉【BH】「檀石槐手裡那把刀掉在了草上，人跟著倒在大帳前頭…」）、8 主帳裡作者已定的叫陣【BA】【BD】（「檀石槐，我受人之託，找你報仇來了！」「檀石槐！我受人之託，一路找到你帳前來報仇。今天你這條命，我是非取不可！」）與隱藏選項【CU】【CV】【CW】（別跟它們撞句）；〈標記與三選一〉前兩輪的表（作者的口味：受人之託、不講老兵故事、少年武人嘴直、不文縐縐、不說書腔、鮮卑那句他挑了「馬背上長大的、兩個漢子的事」）；給AI看的指南/武俠文風創作指南.md〈零、常犯十條〉、第四節主角卡與旁白卡；主角既有句 python -X utf8 給AI看的指南/既有台詞.py MC1（挑帶「！」與對敵的看一百句）。
三選一怎麼給：【CY】【CZ】各一列，寫進〈標記與三選一〉節末尾「### 第三輪（${DATE}）」表（| 標記 | 原句 | 甲 | 乙 | 丙 | 作者選 |）。甲＝貼主角既有句的嗓子／旁白貼第二版定稿裡作者過過的旁白；乙＝更省字；丙＝換一個看得見的動作或換一種說法。三個要真的不同。【CY】：一到兩句、一句十五字上下、是衝著他喊的話、要跟「他身邊沒人了、你一句就開打」接得上、不重講【BD】那句、不用「好漢」「拚個生死」那種話本腔也不文縐縐；【CZ】：一格兩句、每句十九到二十五字、只寫看得見的（他怎麼動、空地上剩誰）、不替玩家下結論、不用「聽完沒有答話」那種現成句、收尾要能接下一格戰鬥。都不用破折號、不寫內心話、不自創單字名詞、禁詞照 CLAUDE.md、em7 不加（全場只留【CM】一個）。
「作者選」欄留空。正文除了【CX】那一處一個字不動。寫完把候選抄成純文字跑 python -X utf8 給AI看的指南/文風節奏檢查.py <臨時檔>，報了只修候選。git 只准讀；只改 ${FILE}。日期寫 ${DATE}。
回傳 JSON：file、cx_done（一句）、rows（表列數）、candidates（物件：CY 與 CZ 各一個陣列 [甲, 乙, 丙] 全文）、rhythm、summary（兩三句）。`

log('第三輪：【CY】【CZ】三選一')
const r = await agent(PROMPT, { label: 'round3:王帳CYCZ', phase: 'Round3', effort: 'xhigh', model: 'opus', schema: { type: 'object', properties: {
  file: { type: 'string' }, cx_done: { type: 'string' }, rows: { type: 'integer' },
  candidates: { type: 'object', properties: { CY: { type: 'array', items: { type: 'string' } }, CZ: { type: 'array', items: { type: 'string' } } }, required: ['CY', 'CZ'] },
  rhythm: { type: 'string' }, summary: { type: 'string' },
}, required: ['file', 'cx_done', 'rows', 'candidates', 'rhythm', 'summary'] } })
return r ? { date: DATE, ...r } : { date: DATE, error: 'round3 failed' }