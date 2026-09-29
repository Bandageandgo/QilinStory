export const meta = {
  name: 'tanshihuai-cmd-tidy',
  description: '第四級第 5 步前的例外派人（多Agent創作流程 §二 5 第 6 條）：一名 high 把鮮卑王帳全稿的逐格節整理成轉檔腳本的規矩寫法、依定稿台詞重配立繪與表情、對齊指令與 Description；不准動台詞與旁白',
  phases: [{ title: 'Tidy', detail: '一名 high：逐格節整理、立繪表情重配、指令對齊、乾跑轉檔' }],
}
const A = Object.assign({ date: '＿＿＿＿-＿＿-＿＿' }, args || {})
const DATE = A.date
const FILE = '劇情/檀石槐線_08王帳全稿.md'
const DUNGEON = '劇情/鮮卑王帳/@設定_鮮卑王帳.md'
const DRY = 'C:/Users/user/AppData/Local/Temp/claude/d--QilinStory/1ddf8b7f-8270-48d3-b27d-a5e5e30f3f7a/scratchpad/hc/王帳全稿/dry.json'

const PROMPT = `你在做《異麒麟》蝴蝶效應第三案「檀石槐線」箱庭「鮮卑王帳」全稿 ${FILE} 轉 JSON 前的**逐格節整理**（給AI看的指南/多Agent創作流程.md §二 第 5 步第 6 條「例外才派人」；先讀該檔第一、二節）。**文字是作者一句一句定的：〈對話〉節一個字不動，〈逐格（給 AI）〉裡每格的台詞與旁白一個字不動；你只動指令（actorID、Sequence、Conditions、Script、Description、links）、節首表與檔頭。** 覺得哪句非改不可，寫進〈待作者定〉，不改。
先讀：${FILE} 全檔；${DUNGEON}〈箱庭寫法（第五版）〉〈ID〉〈任務與狀態〉；給AI看的指南/逐格轉json.py 檔頭（逐格節寫法：說話者行、- 欄位、- links: 空、→ 接【X】、▶ 選單（【T】→【U】、【V】））；給AI看的指南/立繪指令轉換規則.md 全檔；給AI看的指南/文本創作指南.md 2.3（表情特效：一場戲不得零表情、轉折格必掛、每十格至少一個）；劇情/轉成json指南.md §1（欄位與 Description 詞表）、§3（尾格與轉場）、§4.2、§4.4；給AI看的指南/擲骰指令轉換規則.md（四段寫法）；Json/大地圖/翠影潭.json 與 Json/探索事件/181年/2月.json 各看幾格（Sequence 多條用「;」接、指令實例）。
做什麼（只在〈逐格（給 AI）〉節、節首表、檔頭）：
1. **立繪與表情整檔重配**：台詞經過三輪三選一與結構對調，現在的 Sequence 是照舊句配的。逐格重看主角 MC1 的 pic 與表情特效、黑狼王 MC11 的 pic 與特效：豪氣叫陣、撂狠話、激將用 Anger／Anger_2／Anger_3／Proud 自己判，對奴隸壓低聲音的仍 Nervous；選單前一格只切主角 pic=12、不掛特效；特效開了要在下一格開頭 DisableCharacterExpression 或轉場裡關；戰鬥格中間不摻表情，勝敗首格開頭關；一場戲不得零表情、每十格至少一個；沒有立繪的角色（檀石槐 actorID 0、奴隸 role84、哨騎）不寫 SetPortrait。第 2 節「立繪與表情」那列同步改。
2. **指令對齊第五版**：計亂 Variable["XianbeiCampChaos"] = Variable["XianbeiCampChaos"] + 1; 五處在 Script（2b 派人旁白、7 第二格、7b 第二格、7c 過的旁白、9 第二格），Description「變數更新」；entry 1 在 6 末格【AL】 Script SetQuestEntryState("CF49", 1, "success"); Description「任務更新」；殺了他【BH】 Script SetQuestEntryState("CF49", 2, "success"); SetQuestState("CF49", "success");、Sequence 裡 ModifyData(Skill,Player,WordOfHonor);ShowHint(Skill,WordOfHonor);ModifyData(DnDAlignment,Player,LawChaos,1);（ShowHint 緊接在 ModifyData(Skill…) 後，照全案 grep 到的寫法）、Description「戰鬥成功、獲得技能卡、信義提升、任務更新、完成任務：CF49」；【BK】ModifyData(Coin,Player,1000); Description「給錢」；下毒第二格 Sequence ModifyData(FeatExp,Player,SleightOfHand,10);ModifyData(DnDAlignment,Player,GoodEvil,-0.15); 與 +1；口才過三處 ModifyData(FeatExp,Player,Persuasion,25);；擲骰四段三處（哨騎【CS】15、奴隸【AT】15、激將【CL】20）逐字照擲骰規則；戰鬥四件套（哨騎 103、兩波 103／104、單挑 100、帶護衛 101）與緩衝格 Continue();；戰敗包 ShowEnding(Ending_1) 那串、收尾包只淡黑那兩格逐字照第二版定稿 劇情/舊創作稿/鮮卑王帳_第二版定稿（2026-09-29）.md 的寫法；隱藏選項格【CU】 Conditions Variable["IsHidden4"] == true;、鮮卑選項格【CK】 Conditions IsCultureFit("Player", "Xianbei") == true;；IsPassDice／IsPassFight 兩格互斥；入口格（12 個）不掛 Conditions、Description「入口：〈點名〉；條件作者設」；其餘 Description 只用 §1 詞表標籤（沒有詞表項的普通格不寫）；沒有 title、沒有別的變數、沒有 entry 4／5、沒有 failure、不掛 BGM、不開背景。
3. **逐格節寫法照轉檔腳本**：每格「【X】」開頭、說話者行、- 欄位各一行；分岔用「▶ 選單（【T】→【U】、【V】）」或「- links: 【U】、【V】」明寫；合流「→ 接【X】」；結尾「- links: 空」；空格寫 **（空格）:**。刪掉腳本讀不懂的殘句。
4. **節首表與檔頭**：格數 93、十二個入口＋缺口物件、陣列順序（1、2a、2b、3、5、6、7、7b、7c、8、9、10）、入口格與尾格、讀的條件、寫的指令、戰鬥擲骰收尾、共用格、連線；檔頭「待作者填」改成：只剩檀石槐 actorID 先掛 0（作者：匯出後回讀再補）；口才 15／15／20、賞錢 1000 已填；配樂不掛。「Unity 要設」那行照第五版與現有寫法留。
5. 跑 python -X utf8 給AI看的指南/逐格轉json.py "${FILE}" --json "${DRY}" --乾跑，要能整份轉出、每個入口單獨進、每條路走到「- links: 空」的格或戰敗包尾格；再跑 python -X utf8 給AI看的指南/文風節奏檢查.py "${FILE}" 與 python -X utf8 給AI看的指南/高難度檢定檢查.py "${FILE}"（只准剩已知照留的：檀石槐 9 字那句、入口格提醒句、檔頭沒分類）。
6. 〈改動紀錄〉加一節「${DATE} 指令整理」：每處格名｜欄位｜原→新｜依哪條規矩。
git 只准讀；只改 ${FILE}（改之前複製一份到 scratchpad hc/王帳全稿/tidy_before.md）。日期寫 ${DATE}。
回傳 JSON：file、changes（幾處）、expressions（表情特效幾個／立繪幾格）、dry_run（一句：轉出幾格、收尾幾格、有沒有錯）、rhythm、format、pending（〈待作者定〉幾條）、summary（三五句）。`

log('逐格節整理：一名 high')
const r = await agent(PROMPT, { label: 'tidy:王帳指令', phase: 'Tidy', effort: 'high', model: 'opus', schema: { type: 'object', properties: {
  file: { type: 'string' }, changes: { type: 'integer' }, expressions: { type: 'string' }, dry_run: { type: 'string' }, rhythm: { type: 'string' }, format: { type: 'string' }, pending: { type: 'integer' }, summary: { type: 'string' },
}, required: ['file', 'changes', 'expressions', 'dry_run', 'rhythm', 'format', 'pending', 'summary'] } })
return r ? { date: DATE, ...r } : { date: DATE, error: 'tidy failed' }