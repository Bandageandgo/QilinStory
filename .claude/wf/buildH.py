# -*- coding: utf-8 -*-
import io,json
items=json.load(open(r'C:/Users/user/AppData/Local/Temp/claude/d--QilinStory/90185aca-633d-4b94-9884-c66314379f5f/scratchpad/items32.json',encoding='utf8'))
s=io.open('guojia143.js',encoding='utf8').read()
s=s.replace("name: 'review-sheet-143-guojia'","name: 'review-sheet-32-yangqu'")
s=s.replace("審稿單 143 條（郭嘉線八支初稿）","審稿單 32 條（子羽〈陽曲塢〉初稿）")
s=s.replace("items143.json","items32.json")
s=s.replace("（2026-09-27 作者圈選郭嘉線八支初稿的全部 143 條描述通病，每份檔依行號切成幾場）","（2026-09-27 作者圈選子羽線〈陽曲塢〉初稿的全部 32 條描述通病，依行號切成四場）")
X=('本檔是子羽線第五支〈陽曲塢〉的創作初稿（還沒轉 JSON，沒有 entryID）：格子用「行號＋開頭幾字」指，直接改稿，✏ 註記照黃巾村初稿的寫法（> ✏ 2026-09-27 改稿（N編號）：原句 …。理由…；整格刪用 > ✏ 2026-09-27 刪除一格（N編號）：原句…。指令：…。理由：…），放在那一格底下掛的 **Sequence**／**Condition** 行之後。'
   '動筆前讀 劇情/子羽/子羽.md（設計端）、@角色設定/子羽.md、文風指南子羽聲口卡與本檔檔頭所有 ⚠ 紅線。子羽口吻已定：規矩腔、話少是格少不是字少、接了就是八到二十字的整句、不碎句、自稱「我」、只講事不講心；妹妹的事不揭。台詞一律跑既有台詞.py 子羽 對口吻。稱謂照文風指南〈稱謂與關係〉（賈詡稱先生、只有徐榮是師父）。'
   '同一份檔會被四場同時起草，只改自己這場點名的格子；別場條目不是你的，同一格若也被別場點到，在 unresolved 註明要合寫一條 ✏ 註記。')
a=s.index("const GX ="); b=s.index("const COMMON")
n=len(items); k=4; size=(n+k-1)//k
units=[]
for c in range(k):
    grp=items[c*size:(c+1)*size]
    ids=[g['id'] for g in grp]; lines=[str(g['line'][0]) for g in grp]
    units.append("{ key: %s, file: FY, json: [], ids: %s, cells: %s, extra: GX }"%(json.dumps('陽曲塢-%d'%(c+1),ensure_ascii=False),json.dumps(ids),json.dumps('審稿單記的行號（以原句去找）：第 '+'、'.join(lines)+' 行',ensure_ascii=False)))
blk="const GX = %s\nconst FY = '劇情/子羽/03 陽曲塢.md'\nconst UY = [\n  %s,\n]\n"%(json.dumps(X,ensure_ascii=False),',\n  '.join(units))
s=s[:a]+blk+s[b:]
i=s.index("const out = await parallel(")
s=s[:i]+"const out = await parallel([() => runFile(FY, UY)])\nreturn { files: out }\n"
io.open('yangqu32.js','w',encoding='utf8',newline='\n').write(s.replace('\r',''))
print('ok', s.count("key: '陽曲塢") + s.count('key: "陽曲塢'))
