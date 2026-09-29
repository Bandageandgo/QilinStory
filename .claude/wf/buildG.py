# -*- coding: utf-8 -*-
import io,json
items=json.load(open(r'C:/Users/user/AppData/Local/Temp/claude/d--QilinStory/90185aca-633d-4b94-9884-c66314379f5f/scratchpad/items143.json',encoding='utf8'))
byf={}
for x in items: byf.setdefault(x['file'][0],[]).append(x)
s=io.open('mixed50.js',encoding='utf8').read()
s=s.replace("name: 'review-sheet-50-mixed'","name: 'review-sheet-143-guojia'")
s=s.replace("審稿單 50 條（179 年 3 月、12 月、董卓認子、宗緯家、娜娜林中、乞丐結局等）","審稿單 143 條（郭嘉線八支初稿）")
s=s.replace("items50.json","items143.json")
s=s.replace("（2026-09-26 作者圈選的一批描述通病，共 50 條，分七場；明細檔裡條目的 file 欄是審稿時找到的檔，但有些是舊創作稿，遊戲裡的現行文案在別的 md／JSON，看各場的「注意」）",
 "（2026-09-27 作者圈選郭嘉線八支初稿的全部 143 條描述通病，每份檔依行號切成幾場）")
X=('本檔是郭嘉線的創作初稿（還沒轉 JSON，沒有 entryID）：格子用「行號＋開頭幾字」指，直接改稿，✏ 註記照黃巾村初稿的寫法（> ✏ 2026-09-27 改稿（N編號）：原句 …。理由…；整格刪用 > ✏ 2026-09-27 刪除一格（N編號）：原句…。指令：…。理由：…），放在那一格底下掛的 **Sequence**／**Condition** 行之後。'
   '動筆前讀 劇情/郭嘉/郭嘉.md（設計端）、@角色設定/郭嘉.md、文風指南郭嘉聲口卡（⚠ 高危）與本檔檔頭所有 ⚠ 紅線；郭嘉、賈詡、徐榮、張寧等口吻跑既有台詞.py 對。同一份檔會被好幾場同時起草，只改自己這場點名的格子；同一份檔其他場的條目不是你的。')
units_js=[]; runs=[]
fi=0
for f,its in byf.items():
    fi+=1
    n=len(its); k=max(1,(n+7)//8); size=(n+k-1)//k
    var='FG%d'%fi; uvar='UG%d'%fi
    units=[]
    for c in range(k):
        grp=its[c*size:(c+1)*size]
        if not grp: continue
        ids=[g['id'] for g in grp]
        lines=[str(g['line'][0]) for g in grp]
        key='%s-%d'%(f.split('/')[-1].replace('.md',''),c+1)
        units.append("{ key: %s, file: %s, json: [], ids: %s, cells: %s, extra: GX }"%(json.dumps(key,ensure_ascii=False),var,json.dumps(ids),json.dumps('審稿單記的行號（初稿現況可能已位移，以原句去找）：第 '+'、'.join(lines)+' 行',ensure_ascii=False)))
    units_js.append("const %s = %s\nconst %s = [\n  %s,\n]\n"%(var,json.dumps('劇情/'+f,ensure_ascii=False),uvar,',\n  '.join(units)))
    runs.append("() => runFile(%s, %s)"%(var,uvar))
a=s.index("const F03 ="); b=s.index("const COMMON")
s=s[:a]+"const GX = %s\n"%json.dumps(X,ensure_ascii=False)+''.join(units_js)+s[b:]
i=s.index("const out = await parallel(")
s=s[:i]+"const out = await parallel([%s])\nreturn { files: out }\n"%', '.join(runs)
s=s.replace('✏ 2026-09-26','✏ 2026-09-27')
io.open('guojia143.js','w',encoding='utf8',newline='\n').write(s.replace('\r',''))
print(len(runs), sum(1 for _ in s.split('key: ')) -1)
