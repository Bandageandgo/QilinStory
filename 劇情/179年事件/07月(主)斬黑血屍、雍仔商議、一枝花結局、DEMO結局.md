# 179年 7月事件（養成模式）

> **本檔由 `Json/` 回讀產生，不是創作稿；遊戲內文案的唯一事實來源是各章節對應的 JSON。**
> 改字請指名錨點（例：「`主線事件/179年/7月.json` #N 這句改成…」）→ AI 改 JSON → Unity 同步 → 重新回讀本檔對應章節。直接編輯本檔的文字**不會進遊戲**。
> **本檔＝這個月的全部戲**：`## 主線｜` 是主動觸發的主線事件，`## 支線｜` 是選「探險」指令後才觸發的支線事件，兩者各自對應一份 JSON。
> 讀法、年表、說話者對照（actorID）、本年收錄的全部 JSON 見 `00 總覽.md`；本章在其他總覽稿的收錄關係見 `劇情/索引.md`。

---

## 主線｜5. 主線事件/179年/7月.json

> 對應 JSON：`Json/主線事件/179年/7月.json`｜節點 316（有文案 280）｜entryID 61 – 2415｜zh_CN：有｜回讀：2026-08-26（2026-08-26 修正錯字 1 處後重讀）
> 內容：序章壓軸。再探古墓斬黑血屍、屍丹四選一（信義／通達／仁心／機略，決定雲龍繞日或塚虎踏骨命盤）、雍仔道別、茶博士的臨別評語、馬車上的車廂閒談、饕餮夢（屍丹的去留）、并州客棧說書人的「第一回」，以及 DEMO 結局蒙太奇。
> 入口：本檔有 5 個無連入的起點：`#2049`（進墓決戰＝主線）、`#2050`（出發前與雍仔商議，含「不去」的放棄線）、`#273`（後山洞口找雍仔的另一版本）、`#346`（一枝花結婚結局）、`#2339`（DEMO 結局蒙太奇）。
> ⚠ **本檔有大量「同一場戲兩份節點」**：整條結局依「有沒有遇到赫連娜娜」（`CurrentQuestState("CF08")`）拆成兩套幾乎逐字相同的節點（例：`#331` 一線 vs `#258` 一線、車廂閒談 `#2292–#2301` vs `#2259–#2268`、命盤評語 `#2069/#2071/#2073/#2076` vs `#2234/#2235/#2061/#2064`）。改字時**兩套都要改**，詳見章末疑點。

### 5-1　入口 `#2049`：再探古墓，斬黑血屍

**燕不凡:**`#2049`　「...」
- Sequence: `SetPortrait(MC1,pic=1); Continue();`

**旁白:**`#215`　[panel=6]＊（輕車熟路地進入古墓，墓道內依舊陰森。很快，你們便回到了那間寬敞的主墓室。）＊
- Sequence: `SetPortrait(MC1,pic=13);`
- 分流：有遇到娜娜（`CF08` 已完成）→ `#298`；否則直接 → `#237`

**▶ 有娜娜同行**

**燕不凡:**`#298`　「呼…又來到這鬼地方了…上次的教訓還歷歷在目，這次可不能再大意了…」
- Sequence: `SetPortrait(MC1,pic=11); EnableCharacterExpression(0,Player,Nervous_2);`
- Conditions: `CurrentQuestState("CF08") == "success"`

**雍仔:**`#299`　[panel=2]「兄弟放心！上次是貧道大意了，這次定不會再犯同樣的錯誤！」
- Sequence: `DisableCharacterExpression(0);`

**赫連娜娜:**`#300`　[panel=1]「別唉聲嘆氣的了！牠越兇，就說明身後的寶貝越珍貴！快點解決牠，我們好進去尋寶！」
- Sequence: `SetPortrait(MC22,pic=5); EnableCharacterExpression(0,MC22,Proud);`

**◆ 合流**

**旁白:**`#237`　[panel=6]＊（只見主墓室中央，那黑血屍果然還在，它身上的黑氣比之上次稀薄了不少，氣息也萎靡了許多，但眼神中的怨毒卻絲毫不減。）＊
- Sequence: `DisableCharacterExpression(5);`

**黑血屍:**`#216`　「又是…你們…還敢回來送死…咳咳…」

**燕不凡:**`#217`　「呔！妖孽！休得張狂！上次讓你苟延殘喘！今日我便是來收你這孽障，為民除害！！」
- Sequence: `SetPortrait(MC1,pic=2);`

**雍仔:**`#218`　[panel=2]「老妖！納命來！」
- Sequence: `DisableCharacterExpression(0);`
- 分流：有娜娜 → `#302`；否則 → `#219`

**赫連娜娜:**`#302`　[panel=1]「喂！醜八怪！識相的就趕緊讓開，別擋著本姑娘尋寶的路！」
- Sequence: `SetPortrait(MC22,pic=2);`
- Conditions: `CurrentQuestState("CF08") == "success"`

**◆ 合流**

**旁白:**`#219`　[panel=6]＊（黑血屍怒吼一聲，再次撲了上來！）＊
- Sequence: `AudioControl(StopSFX);`

> ⚔ `#238` 進入戰鬥（Combat 23）
> - Sequence: `SetContinueMode(false); BeginFight(Combat,23); SetContinueMode(original)@Message(EndFight); Continue()@Message(EndFight);`
> - 註記：進入戰鬥

> ⚙ `#239` 戰鬥結果分流
> - Sequence: `Continue();`
> - 分流：勝 → `#220`；敗 → `#240`

**▶ 戰敗**

> ⚙ `#240` 敗北（無文案）
> - Sequence: `Continue();`
> - Conditions: `IsPassFight()  == false;`

> ⚙ `#269` 播放結局 Ending_1（對話結束）
> - Sequence: `Continue(); ShowEnding(Ending_1);`

**▶ 戰勝**

**旁白:**`#220`　[panel=6]＊（本已元氣大傷的黑血屍漸漸不支，在你與雍仔的聯手攻擊下，終於發出一聲不甘的哀嚎，最終化為一灘黑水，只留下一枚閃爍着奇異光芒的黑色珠子。）＊
- Sequence: `ModifyData(Valuable,Player,BlackSkull,1);`
- Conditions: `IsPassFight()  == true`
- 註記：獲得無名人頭骨

**燕不凡:**`#221`　「呼…呼…妖…妖孽…終於…授首了！ 」
- Sequence: `SetPortrait(MC1,pic=11);`
- Script: `SetQuestState("CF05", "active")`
- 註記：觸發靜觀其變任務
- 分流：有娜娜 → `#303`（下方 5-1-A）；否則 → `#222`（下方 5-1-B）

#### 5-1-A　有娜娜線：屍丹的四種處置

**旁白:**`#303`　[panel=6]＊（你話音未落，一道身影已經從你身邊竄了過去，直奔那枚黑色珠子。）＊
- Conditions: `CurrentQuestState("CF08") == "success"`

**赫連娜娜:**`#304`　[panel=1]「哇！快看！我就說有寶貝吧！這趟果然沒白來！」
- Sequence: `SetPortrait(MC22,pic=1);`

**燕不凡:**`#306`　「我的老天爺啊…腿肚子還在轉筋…總算是…贏了…咕…不行，打完架怎麼更餓了…」

**雍仔:**`#223`　[panel=3]「這是…屍丹？看來是這老妖修煉多年的精華所在。」
- Sequence: `EnableCharacterExpression(3,MC20,Idea);`

**赫連娜娜:**`#305`　[panel=1]「屍丹？你這道士真沒見識！這、這是我爹筆記裡提過的[em2]血河舍利[/em2]！是凝聚地脈陰氣的至寶！」
- Sequence: `DisableCharacterExpression(3); SetPortrait(MC22,pic=13);`

**雍仔:**`#307`　[panel=3]「血河舍利？沒聽過。我們茅山都叫它玄冥之核。」

**赫連娜娜:**`#2364`　「茅山茅山——你們茅山是不是管什麼都叫玄冥之核啊？」
- Sequence: `SetPortrait(MC22,pic=2);`

**旁白:**`#2365`　[panel=6]＊（在他倆還在為名稱而爭論不休時，你懷裡的麒麟骰忽然發燙，熱得像剛從火裡撈出來，骰子上一次燙成這樣，還是在墓裡。）＊

**雍仔:**`#2363`　[panel=3]「[em7]清了清嗓子，決定不接這句[/em7]……名字是小事。此物陰氣極重，若運用不當，恐有奇禍。兄弟，還是由貧道暫為保管，再行定奪如何？」
- Sequence: `EnableCharacterExpression(3,MC20,Question);`

**赫連娜娜:**`#308`　[panel=1]「交給你？暴殄天物！少俠，這可是我們拼死得來的彩頭，可不能隨便給人！」
- Sequence: `DisableCharacterExpression(3); SetPortrait(MC22,pic=9);`

**◆ 玩家選擇（屍丹怎麼處置）**

1. `#309`　[em2][信義][/em2]「此等邪物非我輩正道俠士所宜沾染，便由道長全權處置吧。」 → **分支 A**
2. `#310`　[em2][通達][/em2]「不如我們找個識貨之人看看？說不定能換些盤纏？」 → **分支 B**
3. `#311`　[em2][仁心][/em2]「此物乃妖邪精氣所凝，我等應合力將其徹底銷毀，以絕後患！」 → **分支 C**
4. `#312`　[em2][機略][/em2]「給我。我自己收著。」 → **分支 D**

**▶ 分支 A：交給雍仔（信義）**

**燕不凡:**`#313`　「屍丹…聽起來就很邪門…還是讓道長你拿著吧，我現在只想找地方歇歇腳，順便看看有沒有吃的…」
- Sequence: `SetPortrait(MC1,pic=3); DisableCharacterExpression(1); ModifyData(DnDAlignment,Player,LawChaos,0.15); EnableCharacterExpression(0,Player,Meditate);`

**燕不凡:**`#314`　「且聽說書先生說的武林話本，也沒聽過哪個大俠吃屍丹的，唉，怎不是留下個甚麼千年靈芝之類的，這玩意兒黑不溜秋的，看著就倒胃口…」
- Sequence: `SetPortrait(MC1,pic=3);`

**雍仔:**`#315`　[panel=3]「兄弟果然高義！貧道定會妥善處置此物，絕不讓其為禍人間。」
- Sequence: `DisableCharacterExpression(0); ModifyData(FavorabilityExp,MC20,20);`
- Script: `Variable["FatFriendDie"] = false; SetQuestEntryState("CF05", 1, "active")`（原檔分兩行）
- 註記：雍仔好感度提升、觸發任務"靜觀其變-1"、雍仔死亡變數更新

**赫連娜娜:**`#316`　[panel=1]「嗚，你、你這個不識貨的呆頭鵝！把寶貝往外推！氣死我了！」
- Sequence: `SetPortrait(MC22,pic=10); ModifyData(FavorabilityExp,MC22,-20);`
- 註記：娜娜好感度降低
- → 接 `#331`

**▶ 分支 B：留著找行家鑑定（通達）**

**燕不凡:**`#317`　「道長、赫連姑娘，我看這樣，此物既然奇特，不如我們先帶上，日後到了大城鎮，找個行家鑑定一番，再決定如何處置？」
- Sequence: `SetPortrait(MC1,pic=12); EnableCharacterExpression(0,Player,Meditate); ModifyData(DnDAlignment,Player,LawChaos,-0.15);`

**雍仔:**`#318`　[panel=3]「嗯…此法倒也穩妥。」
- Sequence: `DisableCharacterExpression(0);`
- Script: `SetQuestEntryState("CF05", 2, "active")`
- 註記：觸發任務"靜觀其變-2"

**赫連娜娜:**`#319`　[panel=1]「算你有點腦子！不過得由我保管！交給這道士，天曉得他會不會拿去當夜明珠賣了！」
- Sequence: `SetPortrait(MC22,pic=1); ModifyData(FavorabilityExp,MC20,-20);`
- Script: `Variable["NanaChose1"] = true; Variable["NanaDemon"] = Variable["NanaDemon"] + 1`（原檔分兩行）
- 註記：娜娜變數更新
- → 接 `#331`

**▶ 分支 C：合力銷毀（仁心）**

**燕不凡:**`#320`　「雍仔，萬萬不可！此物乃集那黑血屍畢生怨毒邪氣所化，留在世間，難保不會被歹人利用，或再生禍端！」
- Sequence: `SetPortrait(MC1,pic=2); EnableCharacterExpression(0,Player,Meditate); ModifyData(DnDAlignment,Player,GoodEvil,0.15);`

**燕不凡:**`#323`　「依我看，為絕後患，不如我等立刻合力，將此邪物徹底摧毀！」
- Sequence: `SetPortrait(MC1,pic=2);EnableCharacterExpression(0,Player,Meditate);`

**雍仔:**`#321`　[panel=3]「兄弟此言，深合天道！是貧道著相了。此等邪物，確不該留存於世！」
- Sequence: `DisableCharacterExpression(0); ModifyData(FavorabilityExp,MC20,20);`
- 註記：雍仔好感度提升

**赫連娜娜:**`#324`　[panel=1]「[em7]愣了一愣，發出驚天動地的哀嚎[/em7]，啊——！你、你們兩個敗家子！暴殄天物啊！」
- Sequence: `SetPortrait(MC22,pic=9); ModifyData(FavorabilityExp,MC22,-20);`
- 註記：降低娜娜好感度

**旁白:**`#322`　[panel=6]＊（你與雍仔運起內力，費了好一番功夫，終於將那屍丹徹底化為飛灰。）＊
- Script: `Variable["HeroDestiny"] = true; SetQuestState("CF05", "success")`（原檔分兩行）
- 註記：解鎖雲龍繞日命盤、完成靜觀其變任務
- → 接 `#331`

**▶ 分支 D：自己收著（機略）**

**燕不凡:**`#325`　「道長此言差矣。富貴險中求，赫連姑娘，這血河舍利既是至寶，想必有不凡之處吧？」
- Sequence: `SetPortrait(MC1,pic=12); EnableCharacterExpression(0,Player,Meditate); ModifyData(DnDAlignment,Player,GoodEvil,-0.15);`

**赫連娜娜:**`#330`　[panel=1]「那是自然！此等寶物當然需要物盡其用！」
- Sequence: `SetPortrait(MC22,pic=1); ModifyData(FavorabilityExp,MC22,20); EnableCharacterExpression(1,MC20,Proud);`
- 註記：娜娜好感度提升

**雍仔:**`#326`　[panel=3]「兄弟，此物非同小可…」
- Sequence: `DisableCharacterExpression(1); EnableCharacterExpression(3,MC20,Meditate);`

**燕不凡:**`#327`　「安啦！我自有分寸！瞻前顧後，豈能成就大事？若能藉此突破，日後行走江湖，你我也多一分底氣！」
- Sequence: `SetPortrait(MC1,pic=1); DisableCharacterExpression(3);`

**雍仔:**`#328`　「也罷！[var=PlayerLastName]兄弟你福緣深厚，非同常人，或許真有過人之法。既然你執意如此，貧道便將此物交予你。」
- Sequence: `ModifyData(FavorabilityExp,MC20,-20);`
- Script: `Variable["DarkHeroDestiny"] = true`
- 註記：雍仔好感度下降、塚虎枯骨命盤

**旁白:**`#2367`　[panel=6]＊（珠子入手。懷裡麒麟骰熱了一下，像是應了你。）＊
- Script: `SetQuestEntryState("CF05", 3, "active");`
- 註記：觸發任務"靜觀其變-3"

**◆ 合流（四分支同回 `#331`）**

**旁白:**`#331`　[panel=6]＊（三人檢查一番，確認再無其他異常，便一同離開了古墓。陽光灑在身上，驅散了墓中的陰寒，也洗去了連日的陰霾。）＊
- Sequence: `AudioControl(PauseLowerMusic); AudioControl(PlayMusic,BGM_32); EnableDialogueBG(Farmland); ModifyData(IsInTeam,MC20,false); ModifyData(IsAbleToJoinTeam,MC20,false);`
- Script: `SetQuestState("C0M2", "success")`
- 註記：雍仔離開隊伍、關閉地圖音樂、開啟序章結局音樂、任務更新

**旁白:**`#350`　[panel=6]＊（回到小溪村後，你們總算鬆了口氣。經過一番休整，雍仔嘻皮笑臉的找到了你。）
- Sequence: `SetPortrait(MC22,pic=1);`

**雍仔:**`#332`　[panel=1]「兄弟、赫連姑娘，如今黑血屍已除，貧道心中的一塊大石也算落地了。此番與二位共歷患難，也算是一段難得的緣分。」

**雍仔:**`#342`　[panel=1]「天下無不散的筵席，貧道也該繼續我的雲遊之路，前往那[em2]雲中英豪府[/em2]見識一番了。」

**燕不凡:**`#352`　「青山不改，綠水長流，他日江湖再見，定要與你痛飲三百杯，不醉不歸！」
- Sequence: `SetPortrait(MC1,pic=1);EnableCharacterExpression(0,Player,Proud);`

**赫連娜娜:**`#351`　[panel=2]「英豪府？好名子啊！我爹的筆記裡說了，英雄豪傑聚集的地方，往往也藏著秘密和寶藏！說不定下一個尋寶的線索就在那裡等著我們呢！」
- Sequence: `EnableCharacterExpression(2,MC22,Idea); DisableCharacterExpression(0); SetPortrait(MC22,pic=1);`

**雍仔:**`#353`　[panel=1]「哈哈哈，赫連姑娘所言甚是！英雄與寶物，自古便是絕配！看來此去英豪府，定然是熱鬧非凡！貧道就先去為各位探探路了！」
- Sequence: `DisableCharacterExpression(2);`

**旁白:**`#355`　[panel=6]＊（雍仔重重一抱拳，隨即轉身，腳步輕快地瀟灑離去。）＊

**蕭靈犀:**`#356`　[panel=1]「表哥，雍仔道長走了，現在加上赫連姐姐，我們就有三個人了！去雲中英豪府的馬車錢也要三份，路上的伙食費更不是小數目…我們剩下的盤纏夠嗎？」
- Sequence: `DisableCharacterExpression(0); SetPortrait(MC8,pic=2);`

**赫連娜娜:**`#357`　[panel=1]「盤纏乃身外之物，何足掛齒？江湖路遠，獨行不易。我也正好要去北方，與你們正好順路，不如搭個夥，路上也好有個照應，嘿嘿。」
- Sequence: `EnableCharacterExpression(1,MC22,Idea)@0.5; SetPortrait(MC22,pic=5);`

**燕不凡:**`#358`　「沒錯！小犀，志氣要大！行俠仗義，豈能只看眼前幾個錢而畏畏縮縮的！」
- Sequence: `SetPortrait(MC1,pic=1); EnableCharacterExpression(0,Player,Proud); DisableCharacterExpression(1);`

**燕不凡:**`#359`　「[em7]對蕭靈犀小聲嘀咕[/em7]…盤纏的事…路上我們再想想辦法…總不能在新人面前丟了面子…」
- Sequence: `SetPortrait(MC1,pic=11); DisableCharacterExpression(0); EnableCharacterExpression(0,Player,Meditate);`

**蕭靈犀:**`#340`　「我只希望到時候別又餓肚子了。」
- Sequence: `SetPortrait(MC8,pic=6);DisableCharacterExpression(0);`

**蕭靈犀:**`#344`　「還有…你別再受傷了…」
- Sequence: `SetPortrait(MC8,pic=13); SetPortrait(MC1,pic=1);`

**旁白:**`#341`　[panel=6]＊（這日晨曦微露，你與蕭靈犀收拾好行囊，在客棧門口與眾人揮別後登上了馬車。就在車輪即將轉動之際，原本在門前忙活的茶博士忽然抬起頭來。）＊

**茶博士:**`#2067`　「這就要去這天下闖蕩了？」

**茶博士:**`#2068`　「後山垢氣已散，你這步子踏得倒也穩當。身外之物我這兒沒有，唯有幾句閒語送你伴身。這幾個月，觀你為人：」
- 註記：如果打敗黑血屍
- 分流（依命盤變數四選一）：`HeroDestiny` → `#2069`；`DarkHeroDestiny` → `#2071`；`FatFriendDie == false` → `#2073`；`NanaChose1` → `#2076`

**▶▶ 評語一：雲龍繞日（毀掉屍丹）**

**茶博士:**`#2069`　「[em3]其志如雲，不與群芳爭艷；其心如龍，唯願繞日而行。[/em3]。」
- Conditions: `Variable["HeroDestiny"] == true`
- 註記：毀掉屍丹(英雄命盤為True)

**茶博士:**`#2118`　「那玩意雖然是人人想要的寶貝，但在你眼裡卻比不上一口清爽氣。能捨得下這等邪力，求一個問心無愧，這份骨氣配得上英豪府。」

**旁白:**`#2070`　[panel=6]＊（那一刻，你心中如撥雲見日般透徹。你明白大俠的路雖苦，但唯有不假外力、不染塵埃，才能在這渾濁江湖中活得問心無愧。這份清正之氣在你體內共鳴，一股浩然正氣油然而生。）＊

**旁白:**`#2074`　[panel=6]＊（冥冥之中，你的命格已發生轉變，正式踏上[em3]雲龍繞日[/em3]之路。）＊
- Sequence: `SetPortrait(MC1,pic=13);`
- → 接 `#345`

**▶▶ 評語二：塚虎踏骨（自己留著）**

**茶博士:**`#2071`　「[em3]其思如淵，不與百鳥爭鳴；其行如虎，唯願踏骨而興。[/em3]。」
- Conditions: `Variable["DarkHeroDestiny"] == true`
- 註記：留者屍丹(梟雄命盤=True)

**茶博士:**`#2119`　「你這人，為了變強連燙手的刀刃都敢往懷裡揣。這世道，唯有抓得住力量的人才能活下去，但也得小心，別反被這股力量給吞了。」

**旁白:**`#2072`　[panel=6]＊（你下意識地緊了緊包袱。你深知這世界只講強弱。既然注定要在刀尖上起舞，那就得比任何人都要狠、都要強。你感受著懷中那一絲冰冷的邪力，眼中閃過一抹對權力與力量的絕對渴望。）＊

**旁白:**`#2075`　[panel=6]＊（自此風雲變色，你的命格已轉向更為深沉的[em3]塚虎踏骨[/em3]。）＊
- Sequence: `SetPortrait(MC1,pic=13);`
- → 接 `#345`

**▶▶ 評語三：輕裝快馬（屍丹給了雍仔）**

**茶博士:**`#2073`　「[em3]輕裝快馬，不繫名韁[/em3]。」
- Sequence: `ModifyData(ChancePoint,5);`
- Conditions: `Variable["FatFriendDie"] == false`
- 註記：屍丹給了雍仔、獲得機會點

**茶博士:**`#2120`　「寶物也好，累贅也罷，你一撒手就全給了旁人，落得個逍遙自在。這份隨遇而安的勁兒，我看著最順眼。江湖路長，你這份逍遙，才是真正能保命的東西。」
- → 接 `#345`

**▶▶ 評語四：輕裝快馬（屍丹給了娜娜）**

**茶博士:**`#2076`　「[em3]輕裝快馬，不繫名韁[/em3]。」
- Sequence: `ModifyData(ChancePoint,5);`
- Conditions: `Variable["NanaChose1"] == true`
- 註記：屍丹給了娜娜、獲得機會點
- → 接 `#2120`（與評語三共用下半句）

**◆ 合流**

**旁白:**`#345`　[panel=6]＊（三人登上了前往[em2]雲中[/em2]的馬車，車輪滾滾，江湖路遠，但路在前方，沒有理由不繼續前進。）＊
- Sequence: `SetPortrait(MC1,pic=1); DisableCharacterExpression(0);`
- 註記：有娜娜的結局

> ⚙ `#2320` 轉場、切換音樂（切馬車全螢幕背景）
> - Sequence: `SetContinueMode(false); PlayFeelFeedback(FadeInOut,1,0.5,1,#000000,1); AudioControl(StopMusic); AudioControl(PlayMusic,Others_Carriage); OpenPanel(1,close)@1; DisableDialogueBG()@1; EnableEventBG(CarriageWithPeople,FullScreen)@1; SetContinueMode(original)@2.5; Continue()@2.5;`
> - 註記：轉場,切換音樂

**旁白:**`#2292`　[panel=6]＊（馬車隨著山道輕輕顛簸。車廂角落坐著一名穿著浮誇、正唾沫橫飛吹著牛的市井混混，以及一名語氣陰陽怪氣的工漢。兩人正有一搭沒一搭地對聊著。）＊

**市井混混:**`#2293`　[panel=1]「嘿！我說哥們，我瞧這附近倒是還算安穩。」

**市井混混:**`#2307`　[panel=1]「聽說現在洛陽那頭連官位都能明碼標價，只要手裡有錢，想當個官不過是點點頭的事！等老子在城裡富了，回頭也去買個官當當，到時候看誰還敢叫我癩子！」

**工漢:**`#2294`　[panel=1]「那您得趕緊抓緊了，不然看大門的這個缺就搶不到囉。」

**市井混混:**`#2313`　[panel=1]「...」

**工漢:**`#2295`　[panel=1]「再說了，安穩？在這龍蛇混雜、山頭林立的并州地界，您還想做官夢？」

**工漢:**`#2314`　[panel=1]「現在別說盜匪了，即使那些個長毛的狗頭人，還有那些披鱗片的怪胎，在咱這地界上都賴了快二十年了。」

**工漢:**`#2296`　[panel=1]「雖然這些雜碎現在會說人話、會做生意，甚至還想裝得跟人一樣……但在我眼裡，畜生就是畜生！真不知道當年是從哪個地縫鑽出來的晦氣東西。」

**市井混混:**`#2297`　[panel=1]「那倒也是，前兩天我還看見個狗頭人想進武館習武，被館主一腳踹出大門，那畫面真是笑死人了，哈哈！」

**市井混混:**`#2298`　[panel=1]「不過話說回來，這年頭多虧有那位[em2]張神仙[/em2]。聽說他那手段當真神了！隨手畫張黃紙符，往碗裡一燒一化，給那病入膏肓的人喝下去，沒一會兒工夫，人竟然就能下地走路了！」

**市井混混:**`#2308`　[panel=1]「且還分文不取，咱們這些平頭百姓全指望這神仙符水了。那可真是救命的大恩人啊！」

**工漢:**`#2299`　[panel=1]「大恩人？呵呵，符水泡灰就能治病？不過是些唬人的把戲，收買人心的小恩小惠罷了。」

**工漢:**`#2312`　[panel=1]「現在大家跟著他喊神仙，以後要是出了亂子，說不定全都要跟著掉腦袋囉。」

**旁白:**`#2300`　[panel=6]＊（兩人的閒談漸漸成了馬車顛簸的背景音。無論是流民、怪物還是神仙，在你眼裡都顯得遙遠而無關緊要。你望著窗外起伏的群山，嘴角掛著志得意滿的微笑。）＊
- Sequence: `SetPortrait(MC1,pic=8); OpenPanel(1, close);`

**旁白:**`#2301`　[panel=6]＊（在那規律的馬蹄聲中，你側頭看了看身旁早已熟睡的蕭靈犀，終於也抵擋不住睏意，帶著對未來的無限憧憬，緩緩墜入了夢鄉。）＊
- Sequence: `SetPortrait(MC1,pic=3);`
- 分流：靜觀其變-3 進行中（屍丹還在身上）→ `#2371`（饕餮夢）；否則 → `#2349`（說書場）

#### 5-1-B　沒娜娜線：屍丹的四種處置（與 5-1-A 幾乎逐字相同的另一套節點）

**燕不凡:**`#222`　「我的老天爺啊…腿肚子還在轉筋…總算是…贏了…咕…不行，打完架怎麼更餓了…」

**雍仔:**`#241`　「這是…屍丹？看來是這老妖修煉多年的精華所在。兄弟，此物雖是妖物所留，但若運用得當，或許也有奇效。」
- Sequence: `SetPortrait(MC20,pic=1);`

**旁白:**`#2366`　[panel=6]＊（在雍仔說話時，你懷裡的麒麟骰忽然發燙，熱得像剛從火裡撈出來，骰子上一次燙成這樣，還是在墓裡。）＊

**雍仔:**`#225`　「此物陰氣極重，若運用不當，恐有奇禍。兄弟，還是由貧道暫為保管，再行定奪如何？」
- Sequence: `SetPortrait(MC20,pic=1);`

**◆ 玩家選擇（屍丹怎麼處置）**

1. `#242`　[em2][信義][/em2]「此等邪物非我輩正道俠士所宜沾染，便由道長全權處置吧。」 → **分支 A**
2. `#246`　[em2][通達][/em2]「不如我們找個識貨之人看看？說不定能換些盤纏？」 → **分支 B**
3. `#249`　[em2][仁心][/em2]「此物乃妖邪精氣所凝，我等應合力將其徹底銷毀，以絕後患！」 → **分支 C**
4. `#253`　[em2][機略][/em2]「給我。我自己收著。」 → **分支 D**

**▶ 分支 A：交給雍仔（信義）**

**燕不凡:**`#243`　「屍丹…聽起來就很邪門…還是讓道長你拿著吧，我現在只想找地方歇歇腳，順便看看有沒有吃的…」
- Sequence: `SetPortrait(MC1,pic=3); ModifyData(DnDAlignment,MC1,LawChaos,0.15); EnableCharacterExpression(0,Player,Meditate);`

**燕不凡:**`#244`　「且聽說書先生說的武林話本，也沒聽過哪個大俠吃屍丹的，唉，怎不是留下個甚麼千年靈芝之類的，這玩意兒黑不溜秋的，看著就倒胃口…」
- Sequence: `SetPortrait(MC1,pic=3);`

**雍仔:**`#245`　「兄弟果然高義！貧道定會妥善處置此物，絕不讓其為禍人間。放心，待貧道研究一番，若真有能化解其陰氣、化害為利之法，也定不會忘了兄弟你今日之功。」
- Sequence: `ModifyData(FavorabilityExp,MC20,20);`
- Script: `Variable["FatFriendDie"] = false; SetQuestEntryState("CF05", 1, "active")`（原檔分兩行）
- 註記：雍仔好感度提升、觸發任務"靜觀其變-1"、雍仔死亡變數更新
- → 接 `#258`

**▶ 分支 B：留著找行家鑑定（通達）**

**燕不凡:**`#247`　「這屍丹聽著是邪門，但咱們辛辛苦苦打生打死才得了這麼個玩意兒，直接扔了豈不可惜？」
- Sequence: `SetPortrait(MC1,pic=12); EnableCharacterExpression(0,Player,Meditate); ModifyData(DnDAlignment,MC1,LawChaos,-0.15);`

**燕不凡:**`#259`　「萬一能賣個好價錢呢？盤纏啊盤纏，行走江湖什麼都要錢，不如這樣，我們找個大城鎮，尋個見多識廣的行家鑑定鑑定？」
- Sequence: `SetPortrait(MC1,pic=17);`

**雍仔:**`#248`　「兄弟所言，倒也不失為一個法子。貧道對此物也是一知半解，若能尋得高人指點，確能更好地處置。也罷，便依兄弟之見，待日後到了繁華之地，我等再設法探尋其奧秘與價值。」
- Sequence: `DisableCharacterExpression(0);`
- Script: `SetQuestEntryState("CF05", 3, "active"); Variable["DarkHeroDestiny"] = true`（原檔分兩行）
- 註記：觸發任務"靜觀其變-3"、梟雄命盤
- → 接 `#258`

**▶ 分支 C：合力銷毀（仁心）**

**燕不凡:**`#250`　「雍仔，萬萬不可！此物乃集那黑血屍畢生怨毒邪氣所化，留在世間，難保不會被歹人利用，或再生禍端！」
- Sequence: `SetPortrait(MC1,pic=2); EnableCharacterExpression(0,Player,Meditate); ModifyData(DnDAlignment,MC1,GoodEvil,0.15);`

**燕不凡:**`#260`　「依我看，為絕後患，不如我等立刻合力，將此邪物徹底摧毀！」
- Sequence: `SetPortrait(MC1,pic=2);EnableCharacterExpression(0,Player,Meditate);`

**雍仔:**`#251`　「兄弟此言，深合天道！是貧道著相了。此等邪物，確不該留存於世。好！就依兄弟之見，我等這便設法將其銷毀！」
- Sequence: `DisableCharacterExpression(0); ModifyData(FavorabilityExp,MC20,20);`
- 註記：雍仔好感度提升

**旁白:**`#252`　[panel=6]＊（你與雍仔運起內力，費了好一番功夫，終於將那屍丹徹底化為飛灰。）＊
- Script: `Variable["HeroDestiny"] = true; SetQuestState("CF05", "success")`（原檔分兩行）
- 註記：解鎖雲龍繞日命盤，完成靜觀其變任務
- → 接 `#258`

**▶ 分支 D：自己收著（機略）**

**燕不凡:**`#254`　「此言差矣！這屍丹雖陰邪，但所謂[em2]孤陰不長，孤陽不生[/em2]，或許我正能以自身之長生經化解其戾氣，取其精華！」
- Sequence: `SetPortrait(MC1,pic=12); EnableCharacterExpression(0,Player,Meditate); ModifyData(DnDAlignment,MC1,GoodEvil,-0.15);`

**燕不凡:**`#261`　「雍仔，你我九死一生得此奇物，豈能因其『陰氣頗重』便束之高閣？不如…讓我來試試看？若真有不妥，再由你處置不遲！」
- Sequence: `SetPortrait(MC1,pic=1);`

**雍仔:**`#255`　「兄弟…你當真要親身一試？此物非同小可，內含妖邪之力，長生經雖正大光明，但你修習日淺…萬一…」
- Sequence: `DisableCharacterExpression(0);`

**燕不凡:**`#256`　「安啦！我自有分寸！瞻前顧後，豈能成就大事？若能藉此突破，日後行走江湖，你我也多一分底氣！」
- Sequence: `SetPortrait(MC1,pic=1);`

**雍仔:**`#257`　「也罷！[var=PlayerLastName]兄弟你福緣深厚，非同常人，或許真有過人之法。既然你執意如此，貧道便將此物交予你。」
- Sequence: `ModifyData(FavorabilityExp,MC20,-20);`
- Script: `Variable["DarkHeroDestiny"] = true`
- 註記：雍仔好感度下降、塚虎枯骨命盤

**旁白:**`#2368`　[panel=6]＊（珠子入手。懷裡麒麟骰熱了一下，像是應了你。）＊
- Script: `SetQuestEntryState("CF05", 3, "active");`
- 註記：觸發任務"靜觀其變-3"

**◆ 合流（四分支同回 `#258`）**

**旁白:**`#258`　[panel=6]＊（二人檢查一番，確認再無其他異常，便一同離開了古墓。陽光灑在身上，驅散了墓中的陰寒，也洗去了連日的陰霾。）＊
- Sequence: `AudioControl(PauseLowerMusic); AudioControl(PlayMusic,BGM_32); EnableDialogueBG(Farmland);`
- Script: `SetQuestState("C0M2", "success")`
- 註記：關閉地圖音樂、開啟序章結局音樂、任務更新

**雍仔:**`#226`　「[var=PlayerLastName]兄弟，如今黑血屍已除，貧道心中的一塊大石也算落地了。此番與你共歷患難，也算是一段難得的緣分。」

**雍仔:**`#262`　「天下無不散的筵席，貧道也該繼續我的雲遊之路，前往那[em2]雲中英豪府[/em2]見識一番了。」

**燕不凡:**`#227`　「青山不改，綠水長流，他日江湖再見，定要與你痛飲三百杯，不醉不歸！」
- Sequence: `SetPortrait(MC1,pic=1);EnableCharacterExpression(0,Player,Proud);`

**蕭靈犀:**`#228`　「你這一串江湖話，和前幾天我們聽說書先生說的話本根本一模一樣…再說了希望到時候你有錢請客！」
- Sequence: `DisableCharacterExpression(0);SetPortrait(MC8,pic=6);`

**雍仔:**`#229`　「哈哈哈，好！一言為定！[var=PlayerLastName]兄弟，保重！咱們[em2]英豪府[/em2]見！」

**燕不凡:**`#230`　「雍仔保重！」

**旁白:**`#231`　[panel=6]＊（雍仔再次深深看了你一眼，重重一抱拳，隨即轉身，腳步輕快地踏上了前往雲中府的路途。）＊

**旁白:**`#263`　[panel=6]＊（這位雍仔道長，初識之時只覺其言辭誇張、行事略顯毛躁，甚至有些不大牢靠；然幾經患難，方知其本性純良，非但勇於承擔過錯，在大是大非面前亦能挺身而出，實乃一位重情重義、值得結交的江湖同道。）＊

**蕭靈犀:**`#232`　「表哥，雍仔道長走了，我們…也該準備準備了。下個月初，前往雲中的馬車隊就要出發了，我們可不能再耽擱了！」
- Sequence: `SetPortrait(MC8,pic=5);EnableCharacterExpression(1,MC8,Meditate);`

**燕不凡:**`#233`　「嗯！妳說的對！男兒志在四方！是更廣闊的江湖！待我將長生經融會貫通，定要在英豪府的遴選中拔得頭籌，揚名立萬！」
- Sequence: `DisableCharacterExpression(1);SetPortrait(MC1,pic=1);EnableCharacterExpression(0,Player,Proud);`

**蕭靈犀:**`#234`　「我只希望到時候別又餓肚子了。」
- Sequence: `SetPortrait(MC8,pic=9);`

**蕭靈犀:**`#264`　「還有…你別再受傷了…」
- Sequence: `SetPortrait(MC8,pic=13);`

**旁白:**`#2077`　[panel=6]＊（這日晨曦微露，你與蕭靈犀收拾好行囊，在客棧門口與眾人揮別後登上了馬車。就在車輪即將轉動之際，原本在門前忙活的茶博士忽然抬起頭來。）＊

**茶博士:**`#2079`　「這就要去這天下闖蕩了？」

**茶博士:**`#2054`　「後山垢氣已散，你這步子踏得倒也穩當。身外之物我這兒沒有，唯有幾句閒語送你伴身。這幾個月，觀你為人：」
- 註記：如果打敗黑血屍
- 分流（依命盤變數四選一）：`HeroDestiny` → `#2234`；`DarkHeroDestiny` → `#2235`；`FatFriendDie == false` → `#2061`；`NanaChose1` → `#2064`

**▶▶ 評語一：雲龍繞日（毀掉屍丹）**

**茶博士:**`#2234`　「[em3]其志如雲，不與群芳爭艷；其心如龍，唯願繞日而行。[/em3]。」
- Conditions: `Variable["HeroDestiny"] == true`
- 註記：毀掉屍丹(英雄命盤為True)

**茶博士:**`#2236`　「那玩意雖然是人人想要的寶貝，但在你眼裡卻比不上一口清爽氣。能捨得下這等邪力，求一個問心無愧，這份骨氣配得上英豪府。」

**旁白:**`#2058`　[panel=6]＊（那一刻，你心中如撥雲見日般透徹。你明白大俠的路雖苦，但唯有不假外力、不染塵埃，才能在這渾濁江湖中活得問心無愧。這份清正之氣在你體內共鳴，一股浩然正氣油然而生。）＊

**旁白:**`#2062`　[panel=6]＊（冥冥之中，你的命格已發生轉變，正式踏上[em3]雲龍繞日[/em3]之路。）＊
- Sequence: `SetPortrait(MC1,pic=13);`
- → 接 `#265`

**▶▶ 評語二：塚虎踏骨（自己留著）**

**茶博士:**`#2235`　「[em3]其思如淵，不與百鳥爭鳴；其行如虎，唯願踏骨而興。[/em3]。」
- Conditions: `Variable["DarkHeroDestiny"] == true`
- 註記：留者屍丹(梟雄命盤=True)

**茶博士:**`#2237`　「你這人，為了變強連燙手的刀刃都敢往懷裡揣。這世道，唯有抓得住力量的人才能活下去，但也得小心，別反被這股力量給吞了。」

**旁白:**`#2060`　[panel=6]＊（你下意識地緊了緊包袱。你深知這世界只講強弱。既然注定要在刀尖上起舞，那就得比任何人都要狠、都要強。你感受著懷中那一絲冰冷的邪力，眼中閃過一抹對權力與力量的絕對渴望。）＊

**旁白:**`#2063`　[panel=6]＊（自此風雲變色，你的命格已轉向更為深沉的[em3]塚虎踏骨[/em3]。）＊
- Sequence: `SetPortrait(MC1,pic=13);`
- → 接 `#265`

**▶▶ 評語三：輕裝快馬（屍丹給了雍仔）**

**茶博士:**`#2061`　「[em3]輕裝快馬，不繫名韁[/em3]。寶物也好，累贅也罷，你一撒手就全給了旁人，落得個逍遙自在。這份隨遇而安的勁兒，我看著最順眼。江湖路長，你這份逍遙，才是真正能保命的東西。」
- Sequence: `ModifyData(ChancePoint,5);`
- Conditions: `Variable["FatFriendDie"] == false`
- 註記：屍丹給了雍仔、獲得機會點
- → 接 `#265`

**▶▶ 評語四：輕裝快馬（屍丹給了娜娜）**

**茶博士:**`#2064`　「[em3]輕裝快馬，不繫名韁[/em3]。寶物也好，累贅也罷，你一撒手就全給了旁人，落得個逍遙自在。這份隨遇而安的勁兒，我看著最順眼。江湖路長，你這份逍遙，才是真正能保命的東西。」
- Sequence: `ModifyData(ChancePoint,5);`
- Conditions: `Variable["NanaChose1"] == true`
- 註記：屍丹給了娜娜、獲得機會點

**◆ 合流**

**旁白:**`#265`　[panel=6]＊（二人登上了前往[em2]雲中[/em2]的馬車，車輪滾滾，江湖路遠，但路在前方，沒有理由不繼續前進。）＊
- Sequence: `SetPortrait(MC1,pic=1);`
- 註記：沒有娜娜的結局

> ⚙ `#2228` 轉場、切換音樂（切馬車全螢幕背景）
> - Sequence: `SetContinueMode(false); PlayFeelFeedback(FadeInOut,1,0.5,1,#000000,1); AudioControl(StopMusic); AudioControl(PlayMusic,Others_Carriage); OpenPanel(1,close)@1; DisableDialogueBG()@1; EnableEventBG(CarriageWithPeople,FullScreen)@1; SetContinueMode(original)@2.5; Continue()@2.5;`
> - 註記：轉場,切換音樂

**旁白:**`#2259`　[panel=6]＊（馬車隨著山道輕輕顛簸。車廂角落坐著一名穿著浮誇、正唾沫橫飛吹著牛的市井混混，以及一名語氣陰陽怪氣的工漢。兩人正有一搭沒一搭地對聊著。）＊

**市井混混:**`#2260`　[panel=1]「嘿！我說哥們，我瞧這附近倒是還算安穩。」

**市井混混:**`#2274`　[panel=1]「聽說現在洛陽那頭連官位都能明碼標價，只要手裡有錢，想當個官不過是點點頭的事！等老子在城裡富了，回頭也去買個官當當，到時候看誰還敢叫我癩子！」

**工漢:**`#2261`　[panel=1]「那您得趕緊抓緊了，不然看大門的這個缺就搶不到囉。」

**市井混混:**`#2279`　[panel=1]「...」

**工漢:**`#2262`　[panel=1]「再說了，安穩？在這龍蛇混雜、山頭林立的并州地界，您還想做官夢？」

**工漢:**`#2280`　[panel=1]「現在別說盜匪了，即使那些個長毛的狗頭人，還有那些披鱗片的怪胎，在咱這地界上都賴了快二十年了。」

**工漢:**`#2263`　[panel=1]「雖然這些雜碎現在會說人話、會做生意，甚至還想裝得跟人一樣……但在我眼裡，畜生就是畜生！真不知道當年是從哪個地縫鑽出來的晦氣東西。」

**市井混混:**`#2264`　[panel=1]「那倒也是，前兩天我還看見個狗頭人想進武館習武，被館主一腳踹出大門，那畫面真是笑死人了，哈哈！」

**市井混混:**`#2265`　[panel=1]「不過話說回來，這年頭多虧有那位[em2]張神仙[/em2]。聽說他那手段當真神了！隨手畫張黃紙符，往碗裡一燒一化，給那病入膏肓的人喝下去，沒一會兒工夫，人竟然就能下地走路了！」

**市井混混:**`#2275`　[panel=1]「且還分文不取，咱們這些平頭百姓全指望這神仙符水了。那可真是救命的大恩人啊！」

**工漢:**`#2266`　[panel=1]「大恩人？呵呵，符水泡灰就能治病？不過是些唬人的把戲，收買人心的小恩小惠罷了。」

**工漢:**`#2278`　[panel=1]「現在大家跟著他喊神仙，以後要是出了亂子，說不定全都要跟著掉腦袋囉。」

**旁白:**`#2267`　[panel=6]＊（兩人的閒談漸漸成了馬車顛簸的背景音。無論是流民、怪物還是神仙，在你眼裡都顯得遙遠而無關緊要。你望著窗外起伏的群山，嘴角掛著志得意滿的微笑。）＊
- Sequence: `SetPortrait(MC1,pic=8); OpenPanel(1, close);`

**旁白:**`#2268`　[panel=6]＊（在那規律的馬蹄聲中，你側頭看了看身旁早已熟睡的蕭靈犀，終於也抵擋不住睏意，帶著對未來的無限憧憬，緩緩墜入了夢鄉。）＊
- Sequence: `SetPortrait(MC1,pic=3);`
- 分流：靜觀其變-3 進行中（屍丹還在身上）→ `#2371`（饕餮夢）；否則 → `#2349`（說書場）

#### 5-1-C　共通：夢裡的饕餮（屍丹還在身上才會播）

> ⚙ `#2371` 進入夢境的轉場（關面板、停音樂、骰子特效）
> - Sequence: `OpenPanel(1, close); OpenPanel(2, close); OpenPanel(4, close); DisableEventBG(FullScreen); AudioControl(StopMusic); SetContinueMode(false); PlayFeelFeedback(FadeOut,0.5,#000000,1); PlayOrStopParticle(Meditate,Stop)@0.5; PlayOrStopParticle(DiceTransition_Normal,Play); AudioControl(PlaySFX,Fight_TransitionIn); Continue()@2;`
> - Conditions: `CurrentQuestEntryState("CF05", 3) == "active"`
> - 註記：如果是靜觀其變3

> ⚙ `#2372` 轉場續播
> - Sequence: `SetContinueMode(original)@0.5; Continue()@0.5;`

> ⚙ `#2375` 開啟冥想特效
> - Sequence: `DisableDialogueBG(); PlayFeelFeedback(FadeOut,0.5,#000000,1); PlayOrStopParticle(Meditate,Play); Continue();`
> - 註記：開啟冥想

**旁白:**`#2373`　[panel=6]＊（這一沉，人已到了那片無窮大的空裡。沒有溫度，沒有光，也分不出上下。）＊
- Sequence: `AudioControl(PlayMusic,BGM_5);`
- 註記：饕餮主題曲

**旁白:**`#2374`　[panel=6]＊（她已經坐在那裡了。上一回她打了個呵欠，這一回沒有。）＊

**饕餮:**`#2376`　「你身上有東西。」

**旁白:**`#2393`　[panel=6]＊（她望著你懷裡的方向，望了很久。）＊

**旁白:**`#2394`　[panel=6]＊（懷裡熱了一下。你伸手去按，按到的不是骰子，是旁邊那顆從黑血屍身上得來的屍丹。）＊

**燕不凡:**`#2377`　「這個？」
- Sequence: `SetPortrait(MC1,pic=12);EnableCharacterExpression(0,Player,Question);`

**饕餮:**`#2378`　「你留著也吃不了。」
- Sequence: `DisableCharacterExpression(0);`

**◆ 玩家選擇**

1. `#2380`　「墓裡那一回，是妳出手救了我。」 → **分支 A（信義）**
2. `#2381`　「妳說過，我也有會有處。」 → **分支 B（機略）**

**▶ 分支 A**

**燕不凡:**`#2395`　「墓裡那一回，要不是妳出手，我早沒了。這事我一直記著。」
- Sequence: `SetPortrait(MC1,pic=1); ModifyData(DnDAlignment,Player,LawChaos,0.15); EnableCharacterExpression(0,Player,Proud);`
- 註記：信義提升

**▶ 分支 B**

**燕不凡:**`#2396`　「給了妳……我倒想知道，這玩意兒到底值多少。」
- Sequence: `SetPortrait(MC1,pic=18); ModifyData(DnDAlignment,Player,GoodEvil,-0.15); EnableCharacterExpression(0,Player,Proud);`
- 註記：機略提升

**◆ 合流**

**旁白:**`#2384`　[panel=6]＊（她還是一個字也沒有說。只是默默看著你。）＊
- Sequence: `DisableCharacterExpression(0);`

**◆ 玩家選擇（屍丹給不給）**

1. `#2397`　「便給妳罷。」 → **分支 甲：給**
2. `#2398`　「吃不了，也是我的。」 → **分支 乙：不給**

**▶ 分支 甲：給**

**燕不凡:**`#2399`　「便給妳罷。妳既看著它，若我還捨不得，那可顯得太吝嗇了。」
- Sequence: `SetPortrait(MC1,pic=1); ModifyData(DnDAlignment,Player,LawChaos,0.15); EnableCharacterExpression(0,Player,Proud);`
- Script: `SetQuestState("CF05", "success"); SetQuestEntryState("CF05", 3, "success")`（原檔分兩行）
- 註記：完成任務

**旁白:**`#2401`　[panel=6]＊（你探手入懷。那顆珠子已在掌心，還帶著體溫。）＊
- Sequence: `DisableCharacterExpression(0);`

**旁白:**`#2402`　[panel=6]＊（她伸手拿了過去，倒像拿回一件本來就屬於她的東西。你的手還停在原處，掌心已經空了，珠子在她手裡也沒了。）＊
- Sequence: `DisableCharacterExpression(0);`

**饕餮:**`#2385`　「吾不白拿。好處你也有。」
- Sequence: `DisableCharacterExpression(0);`

**旁白:**`#2403`　[panel=6]＊（她轉身走進空裡。你還待再問——忽然往上一提，人已醒了。）＊
- Sequence: `OpenPanel(1,close);`

> ⚙ `#2392` 過場特效
> - Sequence: `SetContinueMode(false); StopAllParticle(); PlayFeelFeedback(FadeInOut,1,0.5,1,#000000,1); SetContinueMode(original)@2.5; Continue()@2.5;`
> - 註記：過場特效

**旁白:**`#2404`　[panel=6]＊（天尚未亮，伸手往懷中一摸，珠子已不知去向，惟餘那顆骰子，冰涼抵著肋骨。）＊
- Sequence: `AudioControl(StopMusic); AudioControl(PlayMusic,Others_Carriage); EnableEventBG(CarriageWithPeople,FullScreen);`

**旁白:**`#2405`　[panel=6]＊（腹中卻空得厲害。昨夜明明用過兩大碗，此時竟如三日未曾進食。）＊
- Sequence: `ModifyData(AbilityMaxLevel,Player,Leadership,5); ModifyData(AbilityMaxLevel,Player,Strength,5); ModifyData(AbilityMaxLevel,Player,Intelligence,5); ModifyData(AbilityMaxLevel,Player,Politics,5); ModifyData(AbilityMaxLevel,Player,Charisma,5);`
- 註記：超級大漢人

**蕭靈犀:**`#2407`　[panel=2]「[em7]被你翻身的動靜吵醒，揉著眼睛[/em7]，表哥？天還黑著呢……還是你又餓啦？」
- Sequence: `SetPortrait(MC8,pic=3); EnableCharacterExpression(0,Player,Nervous); AudioControl(PlaySFXOneShot,Others_Growling);`

**燕不凡:**`#2406`　「……沒有。快睡罷。」
- Sequence: `DisableCharacterExpression(0); SetPortrait(MC1,pic=8);`
- → 接 `#2349`

**▶ 分支 乙：不給**

**燕不凡:**`#2400`　「這是我拼命換來的。吃不了，那也是我的。」
- Sequence: `SetPortrait(MC1,pic=18); EnableCharacterExpression(0,Player,Proud);`
- 註記：不給屍丹

**旁白:**`#2409`　[panel=6]＊（她看了你一會兒，把目光挪開了。不是動怒——倒像是把一件本就沒興趣的東西，隨手放回了原處。）＊
- Sequence: `DisableCharacterExpression(0);`

**旁白:**`#2411`　[panel=6]＊（她轉身走進空裡，這一次連第二句也沒留下。你站在那裡張著嘴，像個把話說給空屋子聽的人。）＊
- Sequence: `OpenPanel(1,close);`

> ⚙ `#2410` 過場特效
> - Sequence: `SetContinueMode(false); StopAllParticle(); PlayFeelFeedback(FadeInOut,1,0.5,1,#000000,1); SetContinueMode(original)@2.5; Continue()@2.5;`
> - 註記：過場特效

**旁白:**`#2412`　[panel=6]＊（你醒過來，天還沒亮。珠子還在懷裡，貼著骰子。）＊
- Sequence: `AudioControl(StopMusic); AudioControl(PlayMusic,Others_Carriage); EnableEventBG(CarriageWithPeople,FullScreen);`

**蕭靈犀:**`#2415`　[panel=2]「[em7]翻了個身，含糊地[/em7]……表哥？做惡夢了？」
- Sequence: `SetPortrait(MC8,pic=3); EnableCharacterExpression(0,Player,Nervous);`

**燕不凡:**`#2414`　「……沒有。快睡罷。」
- Sequence: `DisableCharacterExpression(0); SetPortrait(MC1,pic=8);`

#### 5-1-D　共通：并州客棧，說書人的第一回

> ⚙ `#2349` 轉場（切客棧背景）
> - Sequence: `PlayFeelFeedback(FadeInOut,1,0.5,1,#000000,1); OpenPanel(1, close); OpenPanel(2, close); SetContinueMode(false); EnableDialogueBG(Lnn)@1; DisableEventBG(FullScreen); SetContinueMode(original)@2.5; Continue()@2.5;`
> - 註記：轉場

**旁白:**`#2342`　[panel=6]＊（并州某一客棧燈火昏黃。說書人將醒木往案上一拍，滿堂漸靜。）＊
- Sequence: `SetContinueMode(false); SetPortrait(MC1,pic=3); AudioControl(StopMusic); AudioControl(PlayMusic,BGM_37); SetContinueMode(original)@1;`
- 註記：換音樂、換場景

**role24:**`#2343`　「先生，今兒講的可是我們并州那位英雄的事蹟？」

**旁白:**`#2344`　旁白的聲音：「客官耳聞不差！我今日所說的，正是《天下見聞錄》，第一回：并州乍現麒麟兒　妖氛忽起試鋒芒。」
- Sequence: `SetPortrait(MC1,pic=3);`

**role56:**`#2345`　[panel=6]「麒麟兒？哪來的麒麟？」

**旁白:**`#2346`　旁白的聲音：「呵呵，是不是麒麟，聽完便知。且莫多言——」
- Sequence: `SetPortrait(MC1,pic=3);`

**role56:**`#2347`　[panel=6]「先上茶！醒木響了還堵著門做甚？」

**旁白:**`#2348`　旁白的聲音：「正是。列位看官，且聽好啦，第一回——」
- Sequence: `SetPortrait(MC1,pic=3);`

**旁白:**`#2340`　[panel=6]＊（[em2]天下見聞錄：<br>第一回　并州乍現麒麟兒　妖氛忽起試鋒芒[/em2]）＊（原檔為真正的換行）

**旁白:**`#2338`　[panel=6]＊（[em2]正是：<br>後山既安人安業，佳名空留道途中。<br>欲知後事如何，且聽下回分解。[/em2]）＊（原檔為真正的換行）

> ⚙ `#2362` 播放回憶 M_006
> - Sequence: `SetContinueMode(false); ShowMemory(M_006); SetContinueMode(original)@Message(EndMemory); Continue()@Message(EndMemory);`
> - 註記：回憶

> ⚙ `#2350` 轉場
> - Sequence: `SetContinueMode(false); PlayFeelFeedback(FadeInOut,1,0.5,1,#000000,1); OpenPanel(1, close)@1; SetContinueMode(original)@2.5; Continue()@2.5;`
> - 註記：轉場

**旁白:**`#2351`　[panel=6]＊（說書人將醒木往案上再一拍，滿堂寂然。）＊
- Sequence: `SetPortrait(MC1,pic=3);`
- 註記：換音樂

**旁白:**`#2352`　旁白的聲音：「第一回，說到這裡便罷。」
- Sequence: `SetPortrait(MC1,pic=3);`

**老學究:**`#2353`　「呵呵，天下人皆知那位英雄出身於英豪府，那接下來想必要說英豪府的故事了？」

**role24:**`#2354`　「快說第二回！」

**旁白:**`#2355`　旁白的聲音：「呵呵，列位看官莫急。驛路尚遠，雲中未至——今日且聽到這裡。」
- Sequence: `SetPortrait(MC1,pic=3);`

**role56:**`#2356`　[panel=6]「又吊胃口！」

**role24:**`#2357`　「下回講甚？」

**旁白:**`#2358`　旁白的聲音：「下回自有分曉。且聽回目——」
- Sequence: `SetPortrait(MC1,pic=3);`

**旁白:**`#2359`　[panel=6]＊（[em2]第二回　驛路揚鞭赴雲中　英豪開府試麒麟[/em2]<br>欲知後事如何，且聽下回分解。）＊（原檔為真正的換行）
- Sequence: `SetPortrait(MC1,pic=3);`

> ⚙ `#2361` 轉場
> - Sequence: `SetContinueMode(false); PlayFeelFeedback(FadeInOut,1,0.5,1,#000000,1); OpenPanel(1, close)@1; SetContinueMode(original)@2.5; Continue()@2.5;`
> - 註記：轉場

> ⚙ `#2341` 轉到破廟、獲得機會點、關閉根據地（對話結束）
> - Sequence: `LoadLevel(AbandonedTemple,AbandonedTemple); ModifyData(ChancePoint,2); MapLock(Command_XiaoxiVillageInn, lock); DisableEventBG(FullScreen); Continue();`
> - 註記：轉到破廟、獲得機會點、關閉根據地

### 5-2　入口 `#2050`：出發前與雍仔商議（含「不去」的放棄線）

**燕不凡:**`#2050`　「...」
- Sequence: `SetPortrait(MC1,pic=1); Continue();`

**旁白:**`#61`　[panel=6]＊（自張大叔瀟灑離去，轉眼又過月餘，你傷勢不僅痊癒，功力亦小有精進。然而，古墓中那黑血屍的身影，以及張大叔臨行前的囑託，始終縈繞在你心頭，如芒在背。）＊
- Sequence: `SetPortrait(MC1,pic=12);EnableCharacterExpression(0,Player,Meditate);`
- 註記：在養成模式中時間到時自動觸發

**燕不凡:**`#62`　「嗯，張大叔言道，那妖物雖已元氣大傷，但放任不管，終非俠義所為。如今我傷勢已癒，長生經亦初窺門徑…咳，該去了結這樁恩怨，以慰蒼生…」
- Sequence: `DisableCharacterExpression(0); SetPortrait(MC1,pic=13);`

**燕不凡:**`#63`　「唉，也不知道那黑乎乎的傢伙現在怎麼樣了，可別比上次還難纏…咕嚕嚕…唉，肚子又叫了，行俠仗義也得填飽肚子啊！」
- Sequence: `DisableCharacterExpression(0); SetPortrait(MC1,pic=6);`

**旁白:**`#64`　[panel=6]＊（你打定主意，便去尋找雍仔。這段時日，雍仔因先前古墓之事心懷愧疚，時常來探望你，二人關係倒也親近了不少。）＊

**雍仔:**`#65`　「兄弟，你來啦。看你氣色，這長生經果然神妙，恢復得真快！」
- Sequence: `SetPortrait(MC20,pic=1);`

**燕不凡:**`#66`　「好了啦，雍仔。開門說亮話，我今日來，是有一樁關乎武林安危…」
- Sequence: `SetPortrait(MC1,pic=8);`

**燕不凡:**`#213`　「…呃…至少是小溪村安危的大事，想跟你商量下。」
- Sequence: `SetPortrait(MC1,pic=12);`

**雍仔:**`#67`　「哦？[var=PlayerLastName]兄弟但說無妨。」
- Sequence: `EnableCharacterExpression(1,MC20,Question);`

**燕不凡:**`#68`　「雍仔，想必你也未曾忘記那古墓中的黑血屍。張大叔雖已重創之，然此獠兇焰未滅，恐其日後再生事端，荼毒生靈！」
- Sequence: `SetPortrait(MC1,pic=13); EnableCharacterExpression(0,Player,Meditate); DisableCharacterExpression(1);`

**燕不凡:**`#212`　「我意欲…再探龍潭虎穴，將此妖物徹底正法！以絕後患！你…以為如何？」
- Sequence: `DisableCharacterExpression(0); SetPortrait(MC1,pic=8);`

**雍仔:**`#69`　「兄弟！你…你真打算再去？！」
- Sequence: `DisableCharacterExpression(0); EnableCharacterExpression(1,MC20,Nervous_2);`

**蕭靈犀:**`#72`　[panel=2]「表哥！你們…你們又要去那鬼地方？太危險了！」
- Sequence: `SetPortrait(MC8,pic=14); DisableCharacterExpression(1);`

**◆ 玩家選擇**

1. `#74`　「不把它了結，我…我們睡覺都不安穩啊！」 → **分支 A：去**
2. `#362`　「多一事不如少一事，英豪府要緊。」 → **分支 B：不去（放棄線）**

**▶ 分支 A：去**

**燕不凡:**`#73`　「靈犀莫慌！有表哥在此，咳咳…此次我與道長同往，定會小心行事，再說了那妖物已是強弩之末，這個便宜不撿太虧了！」
- Sequence: `SetPortrait(MC1,pic=1);`

**燕不凡:**`#363`　「探險尋寶，哪有不濕鞋的道理！張大叔已言明那妖物元氣大傷，如今你我二人聯手，又有準備，未必沒有勝算。」
- Sequence: `SetPortrait(MC1,pic=13);`

**雍仔:**`#121`　「唉！罷了罷了，說來慚愧，那日若非貧道財迷心竅，也不會害你身陷險境！」
- Sequence: `DisableCharacterExpression(0); EnableCharacterExpression(1,MC20,Nervous_2);`

**雍仔:**`#122`　「這些日子貧道是寢食難安，總想著如何彌補…只是那妖物實在厲害，貧道…貧道怕又拖累了你。」
- Sequence: `DisableCharacterExpression(0); SetPortrait(MC20,pic=1);`

**燕不凡:**`#211`　「你我既已結伴，自當同舟共濟，斬妖除魔！」
- Sequence: `DisableCharacterExpression(1);`

**雍仔:**`#76`　「兄弟放心！吃一塹長一智，上次是貧道大意了，這次定不會再犯同樣的錯誤！今日定要讓那老妖知道茅山道法的厲害！」

**燕不凡:**`#75`　「這次可得打起十二分精神，可不能再像上次一樣狼狽了…麒麟骰啊麒麟骰，保佑保佑！」
- Sequence: `SetPortrait(MC1,pic=4);`

**雍仔:**`#2051`　「好吧！氣氛都烘托到這了，不去也不行了，我們這就走吧！」
- Sequence: `DisableCharacterExpression(0); ModifyData(FavorabilityExp,MC20,50); ModifyData(IsInTeam,MC20,true); ModifyData(IsAbleToJoinTeam,MC20,true);`
- 註記：雍仔好感度、加入隊伍

> ⚙ `#2052` 載入古墓深處（對話結束）
> - Sequence: `LoadLevel(XiaoxiVillageTomb,XiaoxiVillageTomb_TombDeep); ModifyData(Rest); Continue();`

**▶ 分支 B：不去（放棄線）**

**燕不凡:**`#364`　「[em7]眉頭一皺，手按舊傷[/em7]，那怪物……當真還要再去招惹？上回的教訓還不夠麼。我這條命，是從鬼門關前爬回來的。」
- Sequence: `SetPortrait(MC1,pic=12);`

**燕不凡:**`#365`　「再來一回，未必還有這般運氣。這禍事又不是我惹出來的，沒道理要我去拼命。我的路在英豪府，不能在這裡橫生枝節。」
- Sequence: `SetPortrait(MC1,pic=4);`

**燕不凡:**`#366`　「靈犀的擔憂不無道理。上次一戰，我元氣未復，如今的確不宜再與那怪物硬拼。留得青山在，不怕沒柴燒。我們先往英豪府，待他日神功大成，再回來收拾它也不遲。」
- Sequence: `SetPortrait(MC1,pic=10);`

**雍仔:**`#367`　「...兄弟！」

**雍仔:**`#368`　「……我明白了。既然你已做了決定，那就這樣吧。」

**旁白:**`#2078`　[panel=6]＊（這日晨曦微露，你與蕭靈犀收拾好行囊，在客棧門口與眾人揮別後登上了馬車。就在車輪即將轉動之際，原本在門前忙活的茶博士忽然抬起頭來。）＊

**茶博士:**`#2080`　「這就要去這天下闖蕩了？」

**茶博士:**`#2055`　「後山那物還在呢，你這就打算拍拍屁股走人了？[em3]避雨失傘，泥濘滿身[/em3]。這世上的禍害，你現在躲了，沒了迎頭而上的膽氣，到那英豪府，那風浪怕是會把你這條小船給掀翻了。」
- 註記：沒打敗黑血屍

**旁白:**`#370`　[panel=6]＊（茶博士沒再應聲，低頭繼續抹他那張油光發亮的茶桌。馬車的轆轆聲在山道間迴盪，這番評語伴隨你駛向那片更廣闊、也更險惡的江湖。）＊
- 註記：任務更新
- 分流：有遇到娜娜 → `#371`；否則 → `#372`

**旁白:**`#371`　[panel=6]＊（序章 - 完）＊
- Sequence: `DisableDialogueBG(); DisableCharacterExpression(0); AudioControl(PauseLowerMusic);`
- Conditions: `CurrentQuestState("CF08") == "success"`
- Script: `SetQuestState("C0M2", "failure")`
- 註記：有遇到娜娜,關閉音樂、任務更新
- → 接 `#2320`（5-1-A 的車廂段）

**旁白:**`#372`　[panel=6]＊（序章 - 完）＊
- Sequence: `DisableDialogueBG(); DisableCharacterExpression(0); AudioControl(PauseLowerMusic);`
- Script: `SetQuestState("C0M2", "failure"); SetQuestState("CF08", "failure");`（原檔分兩行）
- 註記：沒遇到娜娜,關閉音樂、任務更新
- → 接 `#2228`（5-1-B 的車廂段）

### 5-3　入口 `#273`：後山洞口找雍仔（另一版本的邀約）

**燕不凡:**`#273`　「那老妖怪還在後山，真的要進去嗎？」
- Sequence: `SetPortrait(MC1,pic=4);`
- 註記：跟後山的雍仔對話

**雍仔:**`#283`　「哦？[var=PlayerLastName]兄弟，你怎麼來這？？」
- Sequence: `SetPortrait(MC20,pic=1);`

**雍仔:**`#281`　「兄弟，你來啦。看你氣色，這長生經果然神妙，恢復得真快！」
- Sequence: `SetPortrait(MC20,pic=1);`

**燕不凡:**`#284`　「雍仔，想必你也未曾忘記那古墓中的黑血屍。張大叔雖已重創之，然此獠兇焰未滅，恐其日後再生事端，荼毒生靈！」
- Sequence: `SetPortrait(MC1,pic=8);EnableCharacterExpression(0,Player,Question);`

**燕不凡:**`#294`　「我意欲…再探龍潭虎穴，將此妖物徹底正法！以絕後患！你…以為如何？」

**雍仔:**`#291`　「唉！罷了罷了，說來慚愧，那日若非貧道財迷心竅，也不會害你身陷險境！」
- Sequence: `DisableCharacterExpression(0); SetPortrait(MC20,pic=1); EnableCharacterExpression(1,MC20,Nervous_2);`

**雍仔:**`#292`　「這些日子貧道是寢食難安，總想著如何彌補…只是那妖物實在厲害，貧道…貧道這幾日一直在這洞口守著就是怕這妖物跑出來危害小溪村的大家。」
- Sequence: `DisableCharacterExpression(0);SetPortrait(MC20,pic=1);EnableCharacterExpression(1,MC20,Nervous_2);`

**燕不凡:**`#286`　「探險尋寶，哪有不濕鞋的道理！張大叔已言明那妖物元氣大傷，如今你我二人聯手，又有準備，未必沒有勝算。」
- Sequence: `DisableCharacterExpression(1); SetPortrait(MC1,pic=1); EnableCharacterExpression(0,Player,Proud);`

**雍仔:**`#296`　「好吧！氣氛都烘托到這了，不去也不行了，我們這就走吧！」
- Sequence: `DisableCharacterExpression(0); ModifyData(FavorabilityExp,MC20,50); ModifyData(IsInTeam,MC20,true); ModifyData(IsAbleToJoinTeam,MC20,true); ModifyData(Rest);`
- 註記：雍仔好感度、加入隊伍

### 5-4　入口 `#346`：一枝花結婚結局（BD）

**一枝花:**`#346`　「我最近好想吃酸的哦，嘻嘻！」
- Sequence: `DisableCharacterExpression(0);`
- Conditions: `CurrentQuestState("CF04") == "success"`
- 註記：一枝花結婚結局

**茶博士:**`#347`　「小子你手腳真快，竟然能抱得美人歸！」

**蕭靈犀:**`#348`　「表哥你..天啊，這都什麼跟什麼啊！？」
- Sequence: `SetPortrait(MC8,pic=10);`

> ⚙ `#360` 播放結局 Ending_1（對話結束）
> - Sequence: `ShowEnding(Ending_1); Continue();`
> - 註記：BD

### 5-5　入口 `#2339`：DEMO 結局蒙太奇

> **✅ 已結案（作者拍板 2026-08-26）：DEMO 結局不再使用，本節不再修。** 下方兩套蒙太奇（`#2322` 起 30 節點、`#2284` 起 19 節點）的重複、`#2339` 兩條連線沒有 Conditions 導致第二套播不到、以及 `#2303`／`#2272` 的半形星號與「！。」重複標點，都**不列為待修**，保留現狀供查閱。

> ⚙ `#2339` DEMO 用入口
> - Sequence: `Continue();`
> - 註記：DEMO用
> - 連往 `#2322` 與 `#2284` 兩套內容幾乎相同的蒙太奇（兩條連線都沒有 Conditions，見章末疑點）

#### 5-5-A　第一套（`#2322` 起）

> ⚙ `#2322` 淡入轉場、關閉音樂
> - Sequence: `SetContinueMode(false); PlayFeelFeedback(FadeIn,1,#000000,1); AudioControl(StopMusic); Continue()@1.5;`
> - 註記：淡入轉場,關閉音樂

**雍仔:**`#2337`　[panel=1]「……」
- Sequence: `SetPortrait(MC20,pic=1); Continue();`
- 註記：雍仔換表情
- 分流：`FatFriendDie == false` → `#2323`（雍仔畫符）；否則 → `#2324`（某夜對飲）

**▶ 雍仔畫符**

> ⚙ `#2323` 淡出轉場（切民居背景）
> - Sequence: `DisableEventBG(FullScreen); EnableDialogueBG(Houses); PlayFeelFeedback(FadeOut,1,#000000,1); Continue()@1;`
> - Conditions: `Variable["FatFriendDie"] == false`
> - 註記：淡出轉場

**旁白:**`#2316`　[panel=6]＊（某日...）＊
- Sequence: `EnableDialogueBG(Houses); ShowHint(Location,Demo3); SetContinueMode(original)@Message(EndHintLocation); Continue()@Message(EndHintLocation);`

**旁白:**`#2302`　[panel=6]＊（某日，在一間簡陋的小屋中。雍仔正全神貫注地練習畫符。）＊

**旁白:**`#2315`　[panel=6]＊（一名身著隱有補釘痕跡華服的青年推門而入，他像個相識多年的老友般，自然地坐到雍仔對面，兩人一邊指點著符咒，一邊開懷大笑。突然間，這簡陋的屋子，竟有了一種能包容天下的氣勢。）＊

**▶ 某夜對飲（另一支，末尾與上支合流於 `#2321`）**

> ⚙ `#2324` 淡出轉場（切書房背景）
> - Sequence: `DisableEventBG(FullScreen); EnableDialogueBG(StudyRoom); PlayFeelFeedback(FadeOut,1,#000000,1); Continue()@1;`
> - 註記：淡出轉場

**旁白:**`#2317`　[panel=6]＊（某夜...）＊
- Sequence: `EnableDialogueBG(StudyRoom); ShowHint(Location,Demo2); SetContinueMode(original)@Message(EndHintLocation); Continue()@Message(EndHintLocation);`

**旁白:**`#2303`　[panel=6]＊（某夜。你與雍仔對飲，他大笑著拍你的肩膀：*[em2]兄弟！這杯酒，敬咱們的天下！。[/em2]你笑著舉杯，可當杯中酒入喉，卻是刺骨的血腥。）＊

**燕不凡:**`#2325`　「……」
- Sequence: `SetContinueMode(false); SetPortrait(MC1,pic=19); SetContinueMode(original); Continue();`

**旁白:**`#2306`　[panel=6]＊（你低頭，看見自己的劍不知何時已貫穿了雍仔的胸膛。他那雙總是帶著笑意的眼，此刻寫滿了悲涼：兄弟……為什麼……？）＊
- Sequence: `PlayOrStopParticle(Sword_Single_ScreenRed,Play);`

**◆ 合流**

> ⚙ `#2321` 淡入轉場
> - Sequence: `PlayOrStopParticle(Sword_Single_ScreenRed,Stop); SetContinueMode(false); PlayFeelFeedback(FadeIn,1,#000000,1); Continue()@1.5;`
> - 註記：淡入轉場

**燕不凡:**`#2335`　「……」
- Sequence: `SetPortrait(MC1,pic=1); Continue();`
- 註記：主角換表情

**赫連娜娜:**`#2336`　[panel=1]「……」
- Sequence: `SetPortrait(MC22,pic=3); Continue();`
- 註記：娜娜換表情
- 分流：`NanaChose1 == true` → `#2309`（荒原）；否則 → `#2326`（遺跡）

**▶ 荒原**

> ⚙ `#2309` 淡出轉場（切荒野背景）
> - Sequence: `EnableDialogueBG(Wilderness); PlayFeelFeedback(FadeOut,1,#000000,1); Continue()@1;`
> - Conditions: `Variable["NanaChose1"] == true`
> - 註記：淡出轉場

**旁白:**`#2318`　[panel=6]＊（周遭的溫暖瞬間冷卻...）＊
- Sequence: `ShowHint(Location,Demo5); PlayOrStopParticle(DarkCloud,Play); SetContinueMode(original)@Message(EndHintLocation); Continue()@Message(EndHintLocation);`

**旁白:**`#2304`　[panel=6]＊（赫連娜娜立於荒原，手中那柄沉重的漆黑大劍在地上拖出刺耳的聲響。）＊

**旁白:**`#2311`　[panel=6]＊（原本用來束髮的絲帶不知何時已斷，在那飛揚的亂髮間，隱約露出了某些不屬於常識的、尖銳且猙獰的暗影。她用一種冰冷、嘲弄且陌生的眼神俯視著你，彷彿在宣告某種沉睡已久的災厄，已全然覺醒。）＊
- Sequence: `PlayOrStopParticle(DarkCloud,Stop);`

**▶ 遺跡**

> ⚙ `#2326` 淡出轉場（切洞窟背景）
> - Sequence: `EnableDialogueBG(Cave); PlayFeelFeedback(FadeOut,1,#000000,1); Continue()@1;`
> - 註記：淡出轉場

**旁白:**`#2319`　[panel=6]＊（某處遺跡...）＊
- Sequence: `ShowHint(Location,Demo4); SetContinueMode(original)@Message(EndHintLocation); Continue()@Message(EndHintLocation);`

**旁白:**`#2305`　[panel=6]＊（最後的碎片是塞外的斷壁殘垣。赫連娜娜正靈活地在亂石堆中攀爬，指甲縫裡雖沾滿泥土，卻依舊死死攥著懷中那具不知傳自何處的古舊羅盤。）＊

**旁白:**`#2310`　[panel=6]＊（突然間，當她終於找出某件塵封的舊物時，那雙眸子瞬間綻放出前所未有的狂喜。）

**◆ 合流（結局二選一的轉場）**

> ⚙ `#2332` 草芥轉場、播放音樂
> - Sequence: `SetContinueMode(false); PlayFeelFeedback(FadeInOut,1,0.5,1,#000000,1); AudioControl(StopMusic); AudioControl(PlayMusic,BGM_18)@1; DisableDialogueBG()@1; EnableEventBG(Rhino,FullScreen)@1; OpenPanel(1,close)@1; OpenPanel(0,close)@1; SetContinueMode(original)@2.5; Continue()@2.5;`
> - Conditions: `CurrentQuestState("C0F1") == "success" and (Variable["HeroDestiny"] == true)`
> - 註記：草芥轉場,播放音樂

> ⚙ `#2334` 一將功成轉場、播放音樂
> - Sequence: `SetContinueMode(false); PlayFeelFeedback(FadeInOut,1,0.5,1,#000000,1); AudioControl(StopMusic); AudioControl(PlayMusic,BGM_28)@1; DisableDialogueBG()@1; EnableEventBG(Rhino,FullScreen)@1; OpenPanel(1,close)@1; OpenPanel(0,close)@1; SetContinueMode(original)@2.5; Continue()@2.5;`
> - 註記：一將功成轉場,播放音樂

**旁白:**`#2329`　[panel=6]＊（若干年後...）＊
- Sequence: `SetContinueMode(false); ShowHint(Location,Demo1); SetContinueMode(original)@Message(EndHintLocation); Continue()@Message(EndHintLocation);`
- 分流：草芥 → `#2331`；一將功成 → `#2328`

**▶ 主角結局・草芥**

**role124:**`#2331`　[panel=1]＊（你頭繫黃巾，手中握著一把捲刃的柴刀，正與無數面容枯槁的農民一起衝向城牆。你只是一股巨大、瘋狂的浪潮中，最卑微的一粒微塵。你奮力嘶吼著，向著那些你曾嚮往的曾經發起決死的衝鋒。）＊
- Sequence: `SetPortrait(MC1,pic=3); PlayOrStopParticle(Smoke_Dust,Play);`
- Conditions: `CurrentQuestState("C0F1") == "success" and (Variable["HeroDestiny"] == true)`
- 註記：主角結局-草芥

**▶ 主角結局・一將功成**

**role124:**`#2328`　[panel=1]＊（你身披重甲，坐鎮在熊熊燃燒的洛陽城頭。你身後是萬千漢軍的旌旗，你是平定黃巾的功臣，是權傾朝野的[em2]大人物[/em2]。）＊
- Sequence: `PlayOrStopParticle(Smoke_Dust,Play);`
- 註記：主角結局-一將功成

**role124:**`#2330`　[panel=1]＊（然而，城下哀鴻遍野，你手中握著象徵權力的印璽，卻發現那印璽正滲出腥紅的鮮血。你擁有了一切，卻站在了一片死寂的荒原之上。）＊

**◆ 合流**

> ⚙ `#2333` 播放影片、關閉音樂
> - Sequence: `SetContinueMode(false); AudioControl(StopMusic); PlayOrStopParticle(Smoke_Dust,Stop); PlayFeelFeedback(FadeInOut,1,3,1,#000000,1); OpenPanel(1,close)@1; DisableEventBG(FullScreen)@4; PlayVideo(DemoEnd)@4; SetContinueMode(original)@Message(EndVideo); Continue()@Message(EndVideo);`
> - 註記：播放影片,關閉音樂

> ⚙ `#2327` 播放結局 Ending_2（對話結束）
> - Sequence: `ShowEnding(Ending_2); Continue();`
> - 註記：序章 - 完

#### 5-5-B　第二套（`#2284` 起；比第一套少了赫連娜娜的兩幕）

> ⚙ `#2284` 淡入轉場、關閉音樂
> - Sequence: `SetContinueMode(false); PlayFeelFeedback(FadeIn,1,#000000,1); AudioControl(StopMusic); Continue()@1.5;`
> - 註記：淡入轉場,關閉音樂

**雍仔:**`#2291`　[panel=1]「……」
- Sequence: `SetPortrait(MC20,pic=1); Continue();`
- 註記：雍仔換表情
- 分流：`FatFriendDie == false` → `#2287`；否則 → `#2288`

**▶ 雍仔畫符**

> ⚙ `#2287` 淡出轉場（切民居背景）
> - Sequence: `DisableEventBG(FullScreen); EnableDialogueBG(Houses); PlayFeelFeedback(FadeOut,1,#000000,1); Continue()@1;`
> - Conditions: `Variable["FatFriendDie"] == false`
> - 註記：淡出轉場

**旁白:**`#2282`　[panel=6]＊（某日...）＊
- Sequence: `ShowHint(Location,Demo3); SetContinueMode(original)@Message(EndHintLocation); Continue()@Message(EndHintLocation);`

**旁白:**`#2271`　[panel=6]＊（某日，在一間簡陋的小屋中。雍仔正全神貫注地練習畫符。）＊

**旁白:**`#2281`　[panel=6]＊（一名身著隱有補釘痕跡華服的青年推門而入，他像個相識多年的老友般，自然地坐到雍仔對面，兩人一邊指點著符咒，一邊開懷大笑。突然間，這簡陋的屋子，竟有了一種能包容天下的氣勢。）＊

**▶ 某夜對飲**

> ⚙ `#2288` 淡出轉場（切書房背景）
> - Sequence: `DisableEventBG(FullScreen); EnableDialogueBG(StudyRoom); PlayFeelFeedback(FadeOut,1,#000000,1); Continue()@1;`
> - 註記：淡出轉場

**旁白:**`#2283`　[panel=6]＊（某夜...）＊
- Sequence: `ShowHint(Location,Demo2); SetContinueMode(original)@Message(EndHintLocation); Continue()@Message(EndHintLocation);`

**旁白:**`#2272`　[panel=6]＊（某夜。你與雍仔對飲，他大笑著拍你的肩膀：*[em2]兄弟！這杯酒，敬咱們的天下！。[/em2]你笑著舉杯，可當杯中酒入喉，卻是刺骨的血腥。）＊

**燕不凡:**`#2290`　「……」
- Sequence: `SetContinueMode(false); SetPortrait(MC1,pic=19); SetContinueMode(original); Continue();`

**旁白:**`#2273`　[panel=6]＊（你低頭，看見自己的劍不知何時已貫穿了雍仔的胸膛。他那雙總是帶著笑意的眼，此刻寫滿了悲涼：兄弟……為什麼……？）＊
- Sequence: `PlayOrStopParticle(Sword_Single_ScreenRed,Play);`

**◆ 合流（結局二選一的轉場）**

> ⚙ `#2285` 草芥轉場、播放音樂
> - Sequence: `SetContinueMode(false); PlayFeelFeedback(FadeInOut,1,0.5,1,#000000,1); AudioControl(StopMusic); AudioControl(PlayMusic,BGM_18)@1; DisableDialogueBG()@1; EnableEventBG(Rhino,FullScreen)@1; OpenPanel(1,close)@1; OpenPanel(0,close)@1; SetContinueMode(original)@2.5; Continue()@2.5;`
> - Conditions: `CurrentQuestState("C0F1") == "success" and (Variable["HeroDestiny"] == true)`
> - 註記：草芥轉場,播放音樂

> ⚙ `#2289` 一將功成轉場、播放音樂
> - Sequence: `SetContinueMode(false); PlayFeelFeedback(FadeInOut,1,0.5,1,#000000,1); AudioControl(StopMusic); AudioControl(PlayMusic,BGM_28)@1; DisableDialogueBG()@1; EnableEventBG(Rhino,FullScreen)@1; OpenPanel(1,close)@1; OpenPanel(0,close)@1; SetContinueMode(original)@2.5; Continue()@2.5;`
> - 註記：一將功成轉場,播放音樂

**旁白:**`#2270`　[panel=6]＊（若干年後...）＊
- Sequence: `SetContinueMode(false); ShowHint(Location,Demo1); SetContinueMode(original)@Message(EndHintLocation); Continue()@Message(EndHintLocation);`
- 分流：草芥 → `#2277`；一將功成 → `#2269`

**role124:**`#2277`　[panel=1]＊（你頭繫黃巾，手中握著一把捲刃的柴刀，正與無數面容枯槁的農民一起衝向城牆。你只是一股巨大、瘋狂的浪潮中，最卑微的一粒微塵。你奮力嘶吼著，向著那些你曾嚮往的曾經發起決死的衝鋒。）＊
- Sequence: `SetPortrait(MC1,pic=3); PlayOrStopParticle(Smoke_Dust,Play);`
- Conditions: `CurrentQuestState("C0F1") == "success" and (Variable["HeroDestiny"] == true)`
- 註記：主角結局-草芥

**role124:**`#2269`　[panel=1]＊（你身披重甲，坐鎮在熊熊燃燒的洛陽城頭。你身後是萬千漢軍的旌旗，你是平定黃巾的功臣，是權傾朝野的[em2]大人物[/em2]。）＊
- Sequence: `PlayOrStopParticle(Smoke_Dust,Play);`
- 註記：主角結局-一將功成

**role124:**`#2276`　[panel=1]＊（然而，城下哀鴻遍野，你手中握著象徵權力的印璽，卻發現那印璽正滲出腥紅的鮮血。你擁有了一切，卻站在了一片死寂的荒原之上。）＊

> ⚙ `#2286` 播放影片、關閉音樂
> - Sequence: `SetContinueMode(false); AudioControl(StopMusic); PlayOrStopParticle(Smoke_Dust,Stop); PlayFeelFeedback(FadeInOut,1,3,1,#000000,1); OpenPanel(1,close)@1; DisableEventBG(FullScreen)@4; PlayVideo(DemoEnd)@4; SetContinueMode(original)@Message(EndVideo); Continue()@Message(EndVideo);`
> - 註記：播放影片,關閉音樂

> ⚙ `#2258` 播放結局 Ending_2（對話結束）
> - Sequence: `ShowEnding(Ending_2); Continue();`
> - 註記：序章 - 完

**回讀時發現的疑點（只記錄，未動 JSON；要改請指名）**

**一、整段重複（改字時最容易漏掉的地方）**

- 序章結局依「有沒有遇到赫連娜娜」拆成**兩套逐字幾乎相同的節點**：屍丹四選一（`#308`–`#331` vs `#225`–`#258`）、雍仔道別（`#332`–`#344` vs `#226`–`#264`）、茶博士評語（`#2068`/`#2069`/`#2071`/`#2073`/`#2076`/`#2118`/`#2119`/`#2070`/`#2072`/`#2074`/`#2075`/`#2120` vs `#2054`/`#2234`/`#2235`/`#2061`/`#2064`/`#2236`/`#2237`/`#2058`/`#2060`/`#2062`/`#2063`）、車廂閒談（`#2292`–`#2301` vs `#2259`–`#2268`，13 句一字不差）。**任何一句要改，兩套都得改。**
- **✅ 已結案（作者拍板 2026-08-26）**：DEMO 蒙太奇有兩套（5-5-A `#2322` 起 30 個節點 vs 5-5-B `#2284` 起 19 個節點，後者少了赫連娜娜的荒原與遺跡兩幕），入口 `#2339` 連往兩者的連線都沒有 Conditions，第二套（含 `#2258` 的 Ending_2）等於播不到——**作者確認 DEMO 結局不再使用，播不到是正常的，不修**。
- `#2073`／`#2076` 把評語拆成兩個節點（下半句共用 `#2120`），對應的 `#2061`／`#2064` 卻各自把整段寫在一個節點裡——同一段話兩種切法，改字時極易只改到一邊。

**二、標點與標記錯誤（客觀錯誤，建議直接修）**

- ~~**引號缺失**：`#2071`、`#2235` 開頭是 `[`（應為「）；`#2119`、`#2237` 開頭同樣是 `[`。四處都變成「左方括號起、右引號收」。~~ → **已修正（2026-08-26）**：四個節點的 `text`／`zh_TW`／`zh_CN` 開頭 `[` 全改為 `「`（純標點訂正，用字未動，故未重翻）。**待 Unity 同步。** 同批全案掃描另修 12 個節點的引號缺漏，明細見 `劇情/索引.md`〈已移除的 JSON〉上方的修正紀錄。
- **重複句號**：`#2069`、`#2071`、`#2234`、`#2235` 結尾都是「…而行。[/em3]。」／「…而興。[/em3]。」，句號出現兩次。**四句寫法一致，判為既有體例而非單點錯字，2026-08-26 只記錄未改**；要統一（刪掉 `[/em3]` 之後那個句號）請指示。
- **✅ 2026-08-26 順手修正**：`#2067`、`#2073` 的 `zh_TW` 停在更早的長版舊稿（`#2067` 舊 zh_TW 多了「我這也沒什麼值錢的寶貝送你…」一整段；`#2073` 舊 zh_TW 尾端斷在「寶物也好，」），而 `text` 與 `zh_CN` 都已是現行短版。依同步流程鐵則 5（`zh_TW` 是 `text` 的鏡像）已重新鏡像——若 Unity 讀的是 zh-TW 語系欄位，這兩句原本會在遊戲裡顯示舊稿。
- **✅ 已結案（作者拍板 2026-08-26）**：`#2303`、`#2272`「他大笑著拍你的肩膀：*[em2]兄弟！這杯酒，敬咱們的天下！。[/em2]」——落單的半形 `*` 是 `**…**` 轉 `[em2]` 時沒清乾淨的殘留（轉檔規則見 `劇情/轉成json指南.md` 第 80 行），另有「！。」重複標點；因屬 DEMO 結局，**不修**。
- **旁白缺收尾星號**：`#350`（「…找到了你。）」）、`#2310`（「…前所未有的狂喜。）」）都少了結尾的 `＊`。
- **半形標點**：`#2344`「第一回:并州乍現麒麟兒」是半形冒號；`#221`「終於…授首了！ 」句末多一個半形空格；`#367`「...兄弟！」、`#348`「表哥你..天啊」、`#2313`／`#2279`／`#2337`／`#2335`／`#2336`／`#2291`／`#2325`／`#2290`／`#2050`／`#2049` 皆為半形省略號（部分是刻意的「空台詞換表情」節點）。
- `#2411` 的文案末尾多一個換行（原檔如此）。
- `#2340`、`#2338`、`#2359` 的文案含真正的換行字元（本檔以 `<br>` 示意）。

**三、病句與用詞**

- `#2381`「妳說過，我也有會有處。」——**明顯病句**，疑為「我也會有好處」（對照饕餮 `#2385`「吾不白拿。好處你也有。」）。
- **✅ 錯字已於 2026-08-26 修正**：`#292`「一直在這洞口守**者**」→「守**著**」（`text` ＋ `zh_TW` ＋ `zh_CN`）。
- `#2298`／`#2265`「連官位都能明碼標價」——「明碼標價」是現代商業語，東漢賣官可寫「開了價碼」「標了價」；列出供作者定奪。
- `#2331`／`#2277`、`#2328`／`#2269`、`#2330`／`#2276` 是結局旁白，卻掛在 `role124` 名下而非全案通用的旁白 `role2`。

**四、引擎欄位與 actorID**

- ~~`#346` 的 actorID 是 `role 119`（中間有一個半形空白）~~ → **2026-08-26 已改成 `role119`**（作者拍板；同型錯誤在 `探索事件/179年/6月.json` 有 7 個節點，已一併改正）。
- **立繪版本 ID 不一致**：`#317`、`#320`、`#323`、`#325`、`#227`、`#233`、`#243`、`#247`、`#250`、`#254`、`#260` 用 `EnableCharacterExpression(0,MC1-1,…)`，本檔其餘各處皆為 `MC1-1`。
- `#330` 是赫連娜娜（MC22）的台詞，Sequence 卻寫 `EnableCharacterExpression(1,MC20,Proud)`（雍仔）。
- **ModifyData 目標不一致**：有娜娜版 `#313`/`#317`/`#320`/`#325` 寫 `ModifyData(DnDAlignment,Player,…)`，沒娜娜版 `#243`/`#247`/`#250`/`#254` 寫 `ModifyData(DnDAlignment,MC1,…)`。
- `#237` 的 `DisableCharacterExpression(5)` 關閉位置 5，但位置 5 是在 `#300` 用 `EnableCharacterExpression(0,MC22,Proud)` 開的（開的是位置 0）——開關位置對不上。
- `#220`、`#240` 的 Conditions `IsPassFight()  == true` / `== false;` 有雙空格，後者還多了分號。
- `#216` 的說話者 `role116` 在全檔只出現這一句（黑血屍）。
- `#2353` 用 `role111`（小溪村村東的老學究）當并州客棧裡的聽客——若非同一人，等於借用了別人的立繪／名牌。
- `#2343`、`#2354`、`#2357`（`role24`）與 `#2345`、`#2347`、`#2356`（`role56`）在文案裡沒有任何可據以命名的線索，本檔依規定保留 `roleNNN` 原樣。

---

