# Markdown 腳本轉 JSON 對話格式指南 (根據最新立繪、擲骰、戰鬥、貴重品與畫面規則修訂)

本文件旨在說明如何將 Markdown 格式的遊戲腳本（例如 `劇情/舊創作稿/初出茅廬之一.md`）轉換為遊戲引擎可讀取的 JSON 格式，並整合最新的 `給AI看的指南/立繪指令轉換規則.md`、`給AI看的指南/擲骰指令轉換規則.md`、`給AI看的指南/戰鬥指令轉換規則.md`、`給AI看的指南/貴重品指令轉換規則.md` 與 `給AI看的指南/畫面指令轉換規則.md`。

## JSON 結構

每個 JSON 物件代表一個對話節點或事件步驟，包含以下主要欄位：

-   `entryID` (Number): 唯一的節點 ID，按順序遞增。
-   `actorID` (String/Number): 說話者的 ID。
    -   `MC1`: 主角（燕不凡）
    -   `MC2`: 呂信
    -   `MC3`: 子羽
    -   `MC4`: 賈詡
    -   `MC5`: 徐榮
    -   `MC6`: 張寧
    -   `MC7`: 郭嘉
    -   `MC8`: 蕭靈犀
    -   `MC9`: 甄筠
    -   `MC10`: 褚人飛
    -   `MC11`: 黑狼王
    -   `MC12`: 董卓
    -   `MC13`: 張角（江湖身份亦作張仲景；立繪切換用 MC13）
    -   `MC14`: 絲蒂娜
    -   `MC15`: 曹操
    -   `MC16`: 張遼
    -   `MC17`: 高順
    -   `MC18`: 典韋
    -   `MC19`: 菈沙（舊稱／暱稱：阿SA、阿莎；立繪切換統一用 MC19）
    -   `MC20`: 雍仔
    -   `MC21`: 饕餮
    -   `MC22`: 赫連娜娜
    -   `MC23`: 蔡琰（蔡文姬）
    -   `MC24`: 蔡邕
    -   `role105`: 茶博士
    -   `role113`: 張仲景（舊 role ID；新劇本／立繪請改用 `MC13`）
    -   `role127`: 廖淳 (廖醇)
    -   `role131`: 浦元 (蒲元)
    -   `role133`: 大樹守衛
    -   `role5`: 老婆婆 (賣糖炒栗子的阿婆)
    -   `actorID` 為 `2`: 通常代表旁白 (若旁白有特定功能或格式)。
    -   其他未列出的NPC ID根據實際表格對照。
    -   `actorID` 為 `0` or `-1`: 通常用於系統提示、場景描述、檢定觸發等非角色發言的特殊節點。
-   `title` (String, 選填): Unity 對話圖上的節點標題，**只由作者在 Unity 命名、由匯出帶回**。**⚠ AI 不可自行創作、不可修改、不可刪除（已定，2026-08-28 作者拍板）**：轉檔產出的新節點一律不寫此欄位；既有節點若已有 `title`，任何改動都要原樣保留。詳見 `給AI看的指南/Unity對話同步流程.md` 鐵則 8。
-   `text` (String): 對話文字內容。
-   `Sequence` (String): 特殊指令序列，用於觸發立繪變化、表情特效、擲骰、戰鬥等。如果沒有指令，則為空字串 `""`。**不要**把分支條件寫進 `Sequence`。
-   `Conditions` (String, 僅用於條件分支節點): 節點成立條件。擲骰成功／失敗用 `"IsPassDice() == true;"`／`"IsPassDice() == false;"`；戰鬥勝利／失敗用 `"IsPassFight() == true;"`／`"IsPassFight() == false;"`。一般對話節點不需要此欄位。**禁止**把這些條件寫進 `Sequence`。
    -   **⚠ `Conditions` 與 `Script` 一律以分號 `;` 結尾（已定，2026-08-27 作者拍板）**：`"IsPassDice() == false;"` ✅／`"IsPassDice() == false"` ❌；`Script` 多行時**最後一行也要**（`SetQuestEntryState("C0F1", 2, "active");` ✅）。Unity 套件會替最後一個指令自動補分號，所以少寫不會壞（棋局小遊戲那組 `Conditions` 全帶分號、分流正常，即為實證），但**全案體例統一寫上**，不要兩種混用。2026-08-27 已把 `Json/` 全部 744 條 `Conditions` 與 368 條 `Script` 補齊。
    -   **⚠ 兩路分流的 else 不寫 `Conditions`（已定，2026-08-28 作者說明）**：同一個父節點分出兩條時，體例是**前一條掛條件、後一條留空**，留空的那條就是 `else`——條件不成立時才走它。這**不是漏寫**，回讀與稽核時不要列為疑點。例：`大地圖/翠影潭.json` `#36`（有條件）／`#2054`（空），`108蛙.json` `#4`／`#5`、`#8`／`#9`。
    -   **⚠ `Conditions`／`Script` 寫的是 Lua 語法（已定，2026-08-27 作者指出）**：「不等於」一律 **`~=`**，**禁止 `!=`**；連接詞用 `and`／`or`／`not`，**不是 `&&`／`||`／`!`**。寫成 `!=` 引擎解析不了，那條分支等於永遠不成立（例：`CurrentQuestEntryState("CF40", 6) ~= "success"` ✅／`… != "success"` ❌）。舊創作稿裡有 `!=` 的寫法，**那些是錯的，轉檔時一律改成 `~=`**。
    -   **⚠ 多條件串接：第二段起一律用小括號包住整段比較式（已定，2026-08-27 作者指出）。** 體例是 `A == x and (B == y)`、三段以上 `A == x and (B == y) and (C == z)`——**第一段不加括號，第二段起每一段都要**。少了括號引擎判不出來，那條分支等於永遠不成立（和 `!=` 一樣是「悄悄失效」，遊戲不會報錯）。
        -   ✅ `CurrentQuestEntryState("CF40", 6) == "success" and (IsValuablesObtained("Player", "FadedTearstone") == true);`
        -   ❌ `CurrentQuestEntryState("CF40", 6) == "success" and IsValuablesObtained("Player", "FadedTearstone") == true`
        -   `or`／`not` 同理。**這是全案體例，不是 Lua 文法問題**——`Json/` 現有 59 條串接條件，Unity 條件編輯器產出的那 56 條全長這樣，照抄它就對了。
    -   **⚠ 字串常量一定要帶引號**：`CurrentQuestState("C0F2") == "success";` ✅／`CurrentQuestState("C0F2") == success` ❌。沒引號在 Lua 是「未定義的變數」＝`nil`，永遠不相等，那條分支同樣永遠不成立。只有 `true`／`false`／`nil` 與數字不加引號。
-   `links` (Array<Number>): 指向下一個或多個可能的對話節點的 `entryID` 列表。如果是對話終點，則為空陣列 `[]`。
-   `Description` (String, 僅用於特定節點): 此欄位僅用於標註特殊功能節點，不應用於普通對話。只有以下情況需要添加此欄位：
    1. 自動檢定節點 (例如："自動洞悉檢定觸發點")
    2. 手動擲骰節點 (例如："魅力檢定擲骰節點")
    3. 戰鬥觸發節點／戰鬥緩衝節點 (例如："戰鬥觸發節點：藍焰巨蛇"、"戰鬥緩衝節點")
    4. 任務觸發節點 (例如："任務『初出茅廬』觸發點")
    5. 物品交互節點 (例如："給予黃金魚的對話分支")
    6. 選項節點 (例如："選擇使用魅力的選項")
    7. 空內容緩衝節點 (例如："空內容緩衝節點，用於連接檢定結果")
    
    所有一般對話、旁白、角色反應等普通節點都不應包含Description欄位。

## Markdown 轉換規則

### 1. 對話與發言者

-   Markdown 中的 `**發言者**：對話內容` 格式應轉換為一個 JSON 物件。
-   `**發言者**` 需要轉換為對應的 `actorID` (如 `MC1`, `MC8` 或其他NPC的數字ID)。
-   `對話內容` (包含括號內的描述，這些描述將用於生成 `Sequence`) 放入 `text` 欄位。

#### 1.1 對話引號「」的統一處理
-   所有角色對話在轉換為JSON時，其 `text` 欄位的值應統一格式化為**僅包含一對最外層的標準中文引號**，即 `「對話內容」` 的形式。
    -   若原始 Markdown 對話無引號 (例如：`純文字`)，則轉換為 `「純文字」`。
    -   若原始 Markdown 對話已有一層引號 (例如：`「引號文字」`)，則轉換後保持為 `「引號文字」`。
    -   若原始 Markdown 對話有多層引號 (例如：`「「雙引號文字」」` 或 `「「「多層引號」」」`)，應將其處理為標準的單層引號，即 `「雙引號文字」` 或 `「多層引號」`。
-   **選項文字的處理**：
    -   **選項節點**的`text`欄位：
        -   若選項不涉及檢定，則遵循單層引號原則，例如 `「我們再想想辦法。」`。
        -   若選項涉及檢定，則格式為 `[em2][XX檢定][/em2]「原本的選項文字」`，其中 `XX` 是檢定的中文名稱（例如：魅力、洞悉）。例如：`[em2][魅力檢定][/em2]「區區三百文，何足掛齒！」`。
-   **一致性原則**：所有對話節點的 `text` 欄位，無論是主角、NPC、旁白還是選項，都應遵循相同規則，確保整個JSON文件風格統一。

### 2. 特殊格式轉換

-   對話文字中（不包括人名）的 `**重點文字**` 應轉換為 `[em2]重點文字[/em2]`。

### 3. Sequence 指令生成 (核心規則依據 `給AI看的指南/立繪指令轉換規則.md`)

-   **始終包含 `Sequence` 欄位**: 每個 JSON 物件都必須有 `Sequence` 欄位，即使為空 `""`。
-   **指令組成**: 主要包含 `SetPortrait` (換立繪), `EnableCharacterExpression` (啟用表情), `DisableCharacterExpression` (停用表情), 以及可能的擲骰 `BeginDiceRoll`、戰鬥 `BeginFight` 和 `ModifyData`。**好感度**用 `ModifyData(FavorabilityExp,角色ID,數值);`（例如 `ModifyData(FavorabilityExp,MC22,10);`），**禁止**寫 `AddAffection(...)`。**物品一律是貴重品**：`ModifyData(Valuable,Player,ValuablesID,數值);`（例如 `ModifyData(Valuable,Player,DragonHorn,1);`）。目前沒有一般道具，**禁止** `Inventory,AddItem` 與 `AddItem(...)`。

#### 3.1 `SetPortrait` (換立繪)
-   **觸發條件**: 每個包含主角 (`MC1`)、蕭靈犀 (`MC8`) 或甄筠 (`MC9`) 的對話行，都**必須**包含 `SetPortrait` 指令。
-   **規則**: 根據對話行中 `[...]` 內的立繪描述文字，查閱 `給AI看的指南/立繪指令轉換規則.md` 中的「立繪描述與`pic`參數對照表」，確定對應的 `角色ID` 和 `pic` 值。**⚠ 每個角色的 `pic` 有效值都不一樣，動筆前先查該角色專屬表**：`MC1` 1–19（§3、§4.1、§4.1.1）；`MC8` 只有 1–6、9–11、13、14（§4.2.1，**7／8／12 沒圖、沒有 15**）；`MC22` 1–15 但 **6 沒圖**、且 4／11／12／15 與名目不符（§4.4）；甄筠 `MC9` 等五立繪角色只能用 1～5（§4.3）。**不要拿第 3 節名目總表直接套。**
-   **格式**: `SetPortrait(角色ID,pic=圖片名稱);`
    *   例如：`燕不凡` `[尷尬/臉紅]` -> `SetPortrait(MC1,pic=7);`
    *   例如：`甄筠` `[似笑非笑，語氣輕鬆]` -> `SetPortrait(MC9,pic=1);`（一般，配合表情特效表達語氣，見 3.2）
    *   例如：`甄筠` `[搖頭拒絕／不屑]` -> `SetPortrait(MC9,pic=3);`（閉眼無奈）

> **⛔ 沒有立繪的角色，不寫 `SetPortrait`／`EnableCharacterExpression`（已定，2026-08-27 作者確認）。** 有立繪的只有 `給AI看的指南/立繪指令轉換規則.md` §2 總表登記的角色（`MC1`–`MC24` 再加**茶博士 `role105`**，有立繪不等於 `MC` 開頭）；`role127`、`NPC33`、`NPC_Thug`、`Monster` 這類代號**不會有立繪切換**，替他們寫這兩個指令是空轉。他們說話那格 `Sequence` 只寫別的事，沒有就留 `""`。

#### 3.2 `EnableCharacterExpression` (啟用表情特效)
-   **觸發條件**: 如果對話情境需要額外的表情特效，在 `SetPortrait` 後緊跟 `EnableCharacterExpression`。
-   **規則**: 參考 `給AI看的指南/立繪指令轉換規則.md` 中的「情緒描述與表情名稱對照表」（§5.2），根據上下文和描述文字選擇合適的角色版本ID與表情名稱。**不要從立繪檔名拆表情名稱**——立繪與表情特效是兩套資源。
-   **格式**: `EnableCharacterExpression(位置,角色版本ID,表情名稱);`
    -   `位置`: `角色ID`為 `MC1` 時，位置固定為 `0`。其他角色作為當前發言者時，位置必須對應 `[panel=N]`（例如甄筠 `[panel=1]` → 位置 `1`；蕭靈犀開口時 `[panel=2]` → 位置 `2`）。NPC 說話者 panel **只用 1～3**：換人時在 1 ↔ 2 輪替（先 1、再 2 或取代 2、再回到 1）；同一人連說維持原位。**蕭靈犀自己開口永遠用 2**（即使她先開口也不標 1），但 **2 號位不是整場鎖給她**——下一個換人的 NPC 該站 2 就把她換掉。**只有三人同場、1 和 2 都不能讓時才上 3，不要用 4**。詳見 `給AI看的指南/文本創作指南.md` 2.1 節。
    -   `角色版本ID`: 用於區分角色不同時期或服裝的ID，例如 `MC1-1`, `MC8`, `MC9`。
    -   `表情名稱`: **只能是這 13 個之一**（已定，2026-08-27 作者提供對照表）：`Anger`（紅色生氣）、`Anger_2`（黃色圓圈生氣）、`Anger_3`（白色怒吼）、`Nervous`（一滴汗）、`Nervous_2`（滿頭大汗）、`Pain`（紫色痛苦）、`Proud`（閃星星自豪）、`Shock`（打雷震驚）、`Surprise`（不規則驚嘆號）、`Surprise_2`（圓形驚嘆號）、`Meditate`（點點點）、`Idea`（燈泡）、`Question`（圓形問號）。
        **⛔ 這 13 個以外都不存在**，引擎掛不出特效：`Happy`、`Angry`、`Talk`、`Sad`、`Shy`、`Cry`、`Laugh`、`Sigh`、`Mindpain`、`Forbearance`、`Hopeful`、`Confused`、`Provocative`… 這類名字多半是**立繪檔名**或自創，不是特效 ID。**大小寫要一致**（`proud` ✗ → `Proud` ✓），**也不可以填數字**（數字只屬於 `SetPortrait` 的 `pic=`）。錯名怎麼改，查 `給AI看的指南/立繪指令轉換規則.md` §5.1.1a 對照表。
        平淡、沒有明顯情緒的句子，**正解是整條 `EnableCharacterExpression` 不要寫**，不要硬塞一個特效。
    -   例如：`蕭靈犀` `[震驚/垮臉立繪]` -> `SetPortrait(MC8,pic=4);EnableCharacterExpression(1,MC8,Surprise);`
    -   例如：`甄筠` `[似笑非笑]` -> `SetPortrait(MC9,pic=1);EnableCharacterExpression(1,MC9,Proud);`（甄筠 pic 僅 1～5，表情特效不受立繪張數限制，仍可用完整的 13 種通用圖示）

#### 3.3 `DisableCharacterExpression` (停用表情特效)
-   **觸發條件**: 若前一個對話節點的 `Sequence` 中包含了針對某角色的 `EnableCharacterExpression`。
-   **執行位置**: 該 `DisableCharacterExpression` 指令必須放置在**緊隨**啟用該表情特效的對話節點之後的**下一個對話節點**的 `Sequence` 字符串的**最開頭**。
-   **格式**: `DisableCharacterExpression(位置);`
    -   `位置`: 應與其配對的 `EnableCharacterExpression` 指令中的 `位置` 參數一致。
    -   例如：如果節點A中蕭靈犀 (MC8) 啟用了表情 (位置1)，則節點A指向的下一個節點B的 `Sequence` 開頭應為 `DisableCharacterExpression(1);`。

#### 3.4 指令合併
-   同一個節點的多個指令用分號 `;` 連接。
    *   例如: `SetPortrait(MC1,pic=7);EnableCharacterExpression(0,MC1-1,Nervous);`
    *   包含狀態恢復的下一個節點: `DisableCharacterExpression(0);SetPortrait(MC1,pic=NewPicForThisLine);` (注意：根據`給AI看的指南/立繪指令轉換規則.md`，每行都會重新`SetPortrait`，所以不一定會恢復到`pic=1`，而是該行對應的新立繪。)
-   **`BeginDiceRoll`／`BeginFight` 不得與立繪／表情寫在同一條 Sequence。** 擲骰與戰鬥必須各自獨立空對話節點（見 §4、§4.3）。

#### 3.5 `ModifyData` 好感度
-   **正確寫法**: `ModifyData(FavorabilityExp,角色ID,數值);`
    -   例如：`ModifyData(FavorabilityExp,MC22,10);`（赫連娜娜好感經驗 +10）
    -   數值可為負：`ModifyData(FavorabilityExp,MC20,-5);`（雍仔好感經驗 -5）
-   **禁止**: `AddAffection(MC22,5)` 不是引擎指令，轉換時不可原樣寫入 `Sequence`。
-   可與立繪／表情寫在同一條 `Sequence`（放在 `SetPortrait`／`EnableCharacterExpression` 之後）。

#### 3.6 `ModifyData` 貴重品
-   **目前沒有一般道具**。劇情裡給玩家的東西一律是貴重品，詳細規則見 `給AI看的指南/貴重品指令轉換規則.md`。
-   **獲得／增加**: `ModifyData(Valuable,Player,ValuablesID,數值);`
    -   例如：`ModifyData(Valuable,Player,DragonHorn,1);`（獲得貴重品「蛟龍角」）
    -   `Player`：主角（CSV 範例有時寫 `MC1`，劇本慣例用 `Player`）。
    -   `ValuablesID`：貴重品 ID，必須是引擎已有的英文 ID（如 `DragonHorn`），不可寫中文名。
    -   `數值`：獲得數量（或該貴重品系統要求的數值）。
-   **Markdown**：獲得當句旁白標 `**【獲得貴重品：中文名】**`，同一句 `Sequence` 寫上列指令（可與 `DisableCharacterExpression` 合併）。
-   **禁止**：`ModifyData(Inventory,AddItem,...)`、`AddItem(...)`。沒有「一般道具」這條路徑，眼淚、信物、遺物等也一律用 `Valuable`。
-   **特殊標籤**（CSV 另一欄，無數量參數）：`ModifyData(Valuable,MC1,SwordProficiency);` —— 不是「獲得物品」，不要拿來發蛟龍角。
-   可與立繪／表情寫在同一條 `Sequence`。開啟貴重品便籤用 `ShowValuableMemo(ValuablesID);`，與獲得指令分開。

#### 3.7 對話背景圖（養成任務首格開、尾格關）
-   詳細規則與 ID 表見 `給AI看的指南/畫面指令轉換規則.md` §1。適用 `Json/主線事件/`、`Json/探索事件/` 的主線／支線任務對話；箱庭對話平常不開。
-   **首格**：對話第一個節點的 `Sequence` **開頭**加 `EnableDialogueBG(背景ID);`，放在 `SetPortrait` 之前。
    -   例如：`EnableDialogueBG(TrainingGround);SetPortrait(MC1,pic=1);AudioControl(PlayMusic,BGM_19);`
-   **尾格**：對話**每一條**結尾（`links: []`）之前補一個獨立空節點：`actorID "0"`、`text ""`、`Sequence "DisableDialogueBG();Continue();"`。空節點所以 `Continue();` 必寫；`DisableDialogueBG()` 在 `Continue()` 之前。有幾個結尾就補幾個。
-   **禁止**：漏關（回到養成介面時背景圖會蓋住 UI）；中途裸寫 `EnableDialogueBG(新ID)` 硬切（要走 §3.8 轉場、掛 `@1`）。
-   Markdown：首句底下 `**Sequence EnableDialogueBG(ID);SetPortrait(...);**`；全篇最後獨立一行 `**Sequence DisableDialogueBG();Continue();**`。

#### 3.8 轉場（固定複合指令）
-   詳細規則見 `給AI看的指南/畫面指令轉換規則.md` §2。**畫面要切就轉場**：換對話背景圖、背景圖⇄事件圖、時間跳躍、`LoadLevel`、`ShowEnding`。
-   **固定寫法，四段不多不少**（獨立空節點：`actorID "0"`、`text ""`；不得摻台詞、立繪、擲骰、戰鬥）：
    `SetContinueMode(false);PlayFeelFeedback(FadeInOut,1,0.5,1,#000000,1);［換景指令］@1;SetContinueMode(original)@2.5;Continue()@2.5;`
    -   ①禁止點擊 ②淡黑 0.5 秒後淡回（共 2.5 秒，參數照抄）③要換的東西全掛 `@1`（畫面全黑那一刻）④恢復點擊 `@2.5`（**`original`，不寫 `true`**）⑤`Continue()@2.5`。
    -   例如換景：`SetContinueMode(false);PlayFeelFeedback(FadeInOut,1,0.5,1,#000000,1);EnableDialogueBG(Forest)@1;SetContinueMode(original)@2.5;Continue()@2.5;`
    -   只淡黑：`SetContinueMode(false);PlayFeelFeedback(FadeOut,1,#000000,1);SetContinueMode(original)@1;Continue()@1;`；從黑淡入：`SetContinueMode(false);PlayFeelFeedback(FadeIn,1,#000000,1);Continue()@1;`。
-   Markdown：轉場獨立一行 `**Sequence SetContinueMode(false);PlayFeelFeedback(...);...;Continue()@2.5;**`，上面沒有台詞，轉 JSON 自成一格。

#### 3.9 畫面特效（有開就有關）
-   詳細規則與 ID 表見 `給AI看的指南/畫面指令轉換規則.md` §3。
-   **開**：`PlayOrStopParticle(特效ID,Play);` 掛在特效發生那句（可與 `SetPortrait`／表情同格）。
-   **關**：**下一格** `Sequence` 開頭 `PlayOrStopParticle(同ID,Stop);`（比照 `DisableCharacterExpression`）；特效需跨數句時延到該結束的那格關，**不得不關**。清場用 `StopAllParticle();`（轉場格 `SetContinueMode(false);` 之後，或尾格 `DisableDialogueBG();StopAllParticle();Continue();`）。
-   既有 JSON 有些打擊特效沒關，**轉新稿時不要照抄**。ID 不在表上的不得使用。

### 4. 擲骰相關指令 (依據 `給AI看的指南/擲骰指令轉換規則.md`)

#### 4.1 系統擲骰 (自動檢定)
-   Markdown 中的 `[自動<檢定類型>檢定]` 或類似的文字提示（例如 `[自動洞悉檢定] (難度 2)`），其文字內容**本身應放在一個常規的旁白或對話節點中**，或者如果不需要在遊戲中明確顯示此文字，則在生成JSON時可以忽略此文字。
-   觸發實際的自動擲骰時，`Sequence` **不是**只寫 `BeginDiceRoll(Auto,FeatID,難度);`，更**沒有** `DiceRoll(...)` 這個指令。必須依 `給AI看的指南/擲骰指令轉換規則.md` 使用完整四段包裝，例如自動洞悉難度 12：
    ```
    SetContinueMode(false);
    SetContinueMode(original)@Message(EndRoll);
    Continue()@Message(EndRoll);
    BeginDiceRoll(Auto,InsightCheck,12);
    ```
    應遵循以下兩步驟結構：
    1.  **檢定觸發節點**: 創建一個節點，其 `actorID` 通常為 `"MC0"` (或代表系統的ID)，`text` 欄位為**空字串 `""`**。`Sequence` 欄位**不能只寫** `BeginDiceRoll(Auto,FeatID,難度);`，必須依 `給AI看的指南/擲骰指令轉換規則.md`「擲骰節點的 Sequence 固定寫法」使用完整包裝：`SetContinueMode(false);SetContinueMode(original)@Message(EndRoll);Continue()@Message(EndRoll);BeginDiceRoll(Auto,FeatID,難度);`。此節點必須包含 `Description` 說明其為檢定觸發點。
        -   `links`: 此節點的 `links` 應指向緊隨其後的「空內容緩衝節點」。
    2.  **空內容緩衝節點**: 緊隨「檢定觸發節點」之後，必須插入一個**新的節點**（擲骰節點與成功／失敗分支之間**固定隔這一個節點**，`Conditions` 不可掛在這裡）。此節點的 `actorID` 為 `"MC0"`，`text` 為**空字串 `""`**；因為沒有對話可讓玩家點擊推進，`Sequence` **開頭必須為 `Continue();`**（否則擲骰結束後畫面會卡住、無法繼續），若無其他指令則 `Sequence` 僅為 `"Continue();"`。此節點必須包含 `Description` 說明其用途。
        -   `links`: 此「空內容緩衝節點」的 `links` 才指向檢定成功和失敗的實際劇情分支節點（或教學提示等）。
-   `FeatID` 參考 `給AI看的指南/擲骰指令轉換規則.md` 中的「常用檢定項目ID對照」。
-   檢定成功後，在描述成功的旁白節點或下一個合適節點的 `Sequence` 中加入獎勵指令 `ModifyData(AbilityExp/FeatExp,Player,獎勵用ID,數值);`。**通用標準為 +10**；**口才檢定成功為 +25**（見 §4.2.1）。
-   **FeatID與獎勵ID的對應**: 擲骰時使用的`FeatID`（例如`InsightCheck`）與檢定成功後獎勵時使用的`獎勵用ID`（例如`Insight`）是相關聯但不同的ID。轉換時必須仔細查閱本指南末尾的「檢定ID與獎勵ID完整對照表」以確保使用正確的ID配對，避免錯誤。

#### 4.1.1 擲骰成功/失敗分支條件標識（`Conditions` 欄位）
-   **重要**：`IsPassDice() == true` / `IsPassDice() == false` 必須寫在節點的 **`Conditions`** 欄位，**禁止**寫進 `Sequence`。
-   **成功分支標識**: 在檢定成功分支的第一個節點加入：
    ```json
    "Conditions": "IsPassDice() == true;",
    "Sequence": "DisableCharacterExpression(0);ModifyData(FeatExp,Player,Insight,10);"
    ```
-   **失敗分支標識**: 在檢定失敗分支的第一個節點加入：
    ```json
    "Conditions": "IsPassDice() == false;",
    "Sequence": "DisableCharacterExpression(0);"
    ```
-   **欄位分工**: `Conditions` 只負責「這條分支能不能走」；`Sequence` 只負責立繪、表情、`BeginDiceRoll`、`BeginFight`、`ModifyData` 等指令。

#### 4.2 手動擲骰 (選項回應)
-   **關鍵規則**: 當玩家需要從多個選項中選擇，並且某些選項涉及屬性/專長檢定時，處理流程如下：
    1.  **提示選擇節點 (可選，但強烈建議省略)**: 一個節點 (通常 `actorID:0`) 用於展示「玩家（選擇回應）：」或類似的提示文字。**注意：此『提示選擇節點』（即用於展示「玩家（選擇回應）：」的節點）通常應省略。遊戲UI應設計為能夠在沒有此類節點的情況下直接呈現選項。因此，前一個劇情節點的 `links` 應直接指向各個選項節點 (即下述的『選項節點』) 的 `entryID`。僅在遊戲引擎或UI框架有特殊要求，無法自動觸發選項界面時，才考慮創建此提示節點。**
    2.  **教學提示節點 (可選)**: 在實際選項之前，可以有一個節點（例如 `actorID:0`, `text: "[TUTORIAL：對話選項檢定]..."`) 用於提供上下文或教學。其 `links` 指向每一個**選項節點**的 `entryID`。如果省略此節點，則「提示選擇節點」（如果存在且未被省略）或前一劇情節點將直接鏈接到各個「選項節點」。
    3.  **選項節點**: **每個玩家選項本身都是一個獨立的JSON節點**，擁有自己的 `entryID`。
        -   `actorID`: 通常為 `0` (代表系統呈現選項) 或與玩家角色ID (如 `MC1`) 一致，取決於遊戲如何呈現選項發起者。
        -   `text`: 包含該選項的文字。若選項不涉及檢定，則為 `「原本的選項文字」`。若選項涉及檢定，則格式為 `[em2][XX檢定][/em2]「原本的選項文字」`，例如 `[em2][魅力檢定][/em2]「區區三百文，何足掛齒！」`。
        -   `Sequence`: 通常為空字串 `""`。
        -   `Description`: 應包含描述此選項用途的文字，例如："選項1：魅力檢定"。
        -   `links`: **指向一個緊隨其後的、專用於觸發該選項檢定的「空對話擲骰節點」**。如果該選項無檢定，則直接指向選擇後的劇情分支。
    4.  **空對話擲骰節點 (手動擲骰觸發)**: **緊隨在帶檢定的『選項節點』之後**，必須插入一個特殊的「空對話」JSON節點。此節點的 `text` 欄位為空字串 (`""`)，其 `Sequence` 欄位**不能只寫** `BeginDiceRoll(Manual,FeatID,難度);`，必須依 `給AI看的指南/擲骰指令轉換規則.md` 使用完整包裝：`SetContinueMode(false);SetContinueMode(original)@Message(EndRoll);Continue()@Message(EndRoll);BeginDiceRoll(Manual,FeatID,難度);`。
        -   `actorID`: 通常為 `0` 或 `-1` (系統執行)。
        -   `text`: `""` (空字串)。
        -   `Description`: 應包含描述此節點用途的文字，例如："選項1的空對話擲骰節點"。
        -   `links`: 指向**角色實際執行該選項動作/發言的節點**。
    5.  **角色行動/發言節點（通用）**: 此節點代表玩家選擇選項、擲骰之後，角色（如 `MC1`）實際說出對應的話或執行動作——**成功／失敗共用同一句發言**。
        -   `text`: 包含原始 Markdown 中角色在該選項下的完整發言。
        -   `Sequence`: 此節點**有對話內容**，所以**不要**寫 `Continue();`（台詞本身就會等玩家點擊推進，多寫只會拉長指令、甚至把這句台詞跳過）；直接依發言的立繪/表情描述生成即可（**不含** `IsPassDice`）。**只有**當這個位置沒有台詞、要放純空白緩衝節點時，才在 `Sequence` 開頭補 `Continue();`。
        -   `links`: 此節點的 `links` 陣列通常包含**兩個 `entryID`**：一個指向檢定成功後的劇情分支，另一個指向檢定失敗後的劇情分支。遊戲引擎根據前一步驟 `BeginDiceRoll` 的結果，再配合分支節點的 `Conditions` 選擇其中一個鏈接。
    6.  **檢定成功獎勵**: 檢定成功後，在進入成功分支的**第一個合適節點** (通常是NPC的回應或主角的確認發言之後的旁白，或該NPC回應節點本身) 的 `Sequence` 中加入獎勵指令 `ModifyData(...)`。
    7.  **選項文本中的檢定標籤**: 如 `[魅力 難度6]`，主要用於提示編寫者此選項關聯哪個 `BeginDiceRoll` 指令以及後續分支 logique。轉換時，檢定的中文名稱（如「魅力」）應提取並用於格式化選項文本為 `[em2][魅力檢定][/em2]「原本的選項文字」`，原始的檢定標籤（包括難度數字和方括號）則從「原本的選項文字」中移除。
    8.  **手動擲骰的成功/失敗分支條件標識**: 同自動檢定一樣，在成功／失敗分支的**第一個節點**設置 `Conditions` 為 `IsPassDice() == true` 或 `IsPassDice() == false`（見 §4.1.1），**不要**寫入 `Sequence`。**僅允許成功、失敗兩條分支**，勿再拆分「大成功」第三分支（除非 Markdown 明確標註且引擎支援對應 API）。

#### 4.2.1 口才檢定（擂台炒場等）

-   **結果分級**：僅 **成功**／**失敗** 兩級，**沒有「大成功」**。Markdown 若寫「氣氛三級／大成功」，轉 JSON 時合併為成功、失敗兩條旁白分支即可。
-   **成功獎勵**：`ModifyData(FeatExp,Player,Persuasion,25);`（口才經驗 **+25**）。
-   **失敗獎勵**：無經驗；`Sequence` 通常僅 `DisableCharacterExpression(0);` 等演出指令。
-   **分支條件**（必寫於旁白或回應節點的 `Conditions` 欄位）：
    - 成功：`"Conditions": "IsPassDice() == true;"`
    - 失敗：`"Conditions": "IsPassDice() == false;"`
-   **角色發言節點的 `links`**：指向 **2 個** `entryID`（成功旁白、失敗旁白），**不是 3 個**。
-   **已廢棄指令**：勿使用 `ModifyData(RangerFame,...)` 作為口才檢定獎勵；名氣／聲望改由其他系統或劇情節點處理。
-   **即時訊息區範例**：成功寫 `[即時訊息區]: 口才成功！`；失敗寫 `[即時訊息區]: 口才失敗。`（勿寫「大成功」或「名氣提升」類舊文案）。

**口才檢定成功分支範例：**
```json
{
  "entryID": 110,
  "actorID": 2,
  "text": "[panel=6]＊（台下叫好四起。[即時訊息區]: 口才成功！）＊",
  "Sequence": "DisableCharacterExpression(0);ModifyData(FeatExp,Player,Persuasion,25);",
  "links": [120],
  "Conditions": "IsPassDice() == true;"
}
```

**口才檢定失敗分支範例：**
```json
{
  "entryID": 111,
  "actorID": 2,
  "text": "[panel=6]＊（底下稀稀落落，夾了幾聲嗤笑。[即時訊息區]: 口才失敗。）＊",
  "Sequence": "DisableCharacterExpression(0);",
  "links": [120],
  "Conditions": "IsPassDice() == false;"
}
```

### 4.3 戰鬥相關指令 (依據 `給AI看的指南/戰鬥指令轉換規則.md`)

> **⚠ 2026-08-27 更正**：本節與 §4.1 的四段包裝一律用 **`SetContinueMode(original)`**，不是 `true`（全案 `Json/` 戰鬥 60 處、擲骰 132 處皆為 `original`，零處 `true`）。本檔範例已全數改正。

⚠️ **禁止**只寫 `BeginFight(Combat,ID);` 或舊指令 `BeginCombat(...)`。戰鬥與擲骰一樣必須用 `SetContinueMode` 包住，否則打完畫面會卡住。**一場戰鬥固定四個對話節點**。細節與場次表見 `給AI看的指南/戰鬥指令轉換規則.md`。

-   Markdown 的 `**Sequence SetContinueMode(false);BeginFight(...)...**` 轉成一個**獨立空對話節點**（`text: ""`），**不得**與上一句的 `SetPortrait`／表情合併。
-   `BeginFight` 在包裝裡的位置與擲骰**不同**：擲骰是 `BeginDiceRoll` 放最後、等的是 `EndRoll`；戰鬥是 `BeginFight` 放在 `SetContinueMode(false)` 之後、等的是 **`EndFight`**。
-   勝負條件與擲骰相同，寫在 **`Conditions`**：`"IsPassFight() == true"`／`"IsPassFight() == false"`。**禁止**寫進 `Sequence`，也**禁止**省略失敗分支。

#### 4.3.1 單場戰鬥（四個節點）

1.  **戰鬥觸發節點**: `actorID` 為 `"MC0"`（或 `0`），`text` 為 `""`。`Sequence` 必須寫滿四段：
    `SetContinueMode(false);BeginFight(Combat,場次ID);SetContinueMode(original)@Message(EndFight);Continue()@Message(EndFight);`
    -   `Description`: 例如 `"戰鬥觸發節點：藍焰巨蛇"`。
    -   `links`: **只指向**緊隨其後的緩衝節點（不要在這裡分叉勝／敗）。
2.  **緩衝節點**: `actorID` `"MC0"`，`text` `""`，`Sequence` **只有** `"Continue();"`。
    -   `Description`: 例如 `"戰鬥緩衝節點"`。
    -   `links`: 指向勝利與失敗兩個分支的第一個 `entryID`。
3.  **勝利分支第一個節點**: `"Conditions": "IsPassFight() == true;"`。Markdown 的 `**(戰鬥勝利)**` 對應此節點。Sequence **不必**再寫 `Continue();`。
4.  **失敗分支第一個節點**: `"Conditions": "IsPassFight() == false;"`。Markdown 的 `**(戰鬥失敗)**` 對應此節點。Sequence **不必**再寫 `Continue();`。戰敗可重試時，`links` 可指回戰鬥觸發節點或重試選項。

**四節點範例：**
```json
{
  "entryID": 201,
  "actorID": "MC0",
  "text": "",
  "Sequence": "SetContinueMode(false);BeginFight(Combat,77);SetContinueMode(original)@Message(EndFight);Continue()@Message(EndFight);",
  "Description": "戰鬥觸發節點：藍焰巨蛇",
  "links": [202]
}
```
```json
{
  "entryID": 202,
  "actorID": "MC0",
  "text": "",
  "Sequence": "Continue();",
  "Description": "戰鬥緩衝節點",
  "links": [203, 210]
}
```
```json
{
  "entryID": 203,
  "actorID": "2",
  "text": "[panel=6]＊（……勝利描述……）＊",
  "Sequence": "",
  "Conditions": "IsPassFight() == true;",
  "links": [204]
}
```
```json
{
  "entryID": 210,
  "actorID": "2",
  "text": "[panel=6]＊（……失敗描述……）＊",
  "Sequence": "",
  "Conditions": "IsPassFight() == false;",
  "links": [211]
}
```

#### 4.3.2 連續兩場（洞口兩邊一起上）

沒有合成場次。**每一場都是完整的四個節點**；第一場勝利才開第二場。第二場觸發節點的 Sequence **不要**再加開頭的 `Continue();`（第一場緩衝句已經 `Continue();` 過了）。

1.  **第一場（例如黑狼 `76`）**: 觸發 → 緩衝。緩衝的 `links` 指向「第二場觸發（帶 `IsPassFight() == true;`）」與「失敗」。
2.  **第二場觸發**: 此節點同時是第一場的勝利分支：`"Conditions": "IsPassFight() == true;"`，`Sequence` 為 `SetContinueMode(false);BeginFight(Combat,64);SetContinueMode(original)@Message(EndFight);Continue()@Message(EndFight);`。`links` 只指向第二場緩衝。
3.  **第二場緩衝**: `Sequence` 為 `"Continue();"`。`links` 指向「兩場都贏」與「失敗」。
4.  **兩場都贏**: `"Conditions": "IsPassFight() == true;"`。
5.  **失敗**: `"Conditions": "IsPassFight() == false;"`（第一場或第二場戰敗皆可指向同一失敗節點，或各自寫失敗旁白）。

《水濂洞的眼淚.md》場次：藍焰巨蛇 `77`；黑狼氏族 `76`；太平道 `64`。其他劇本以該場實際數字 ID 為準，**禁止** `BeginFight(Combat,雍仔)` 這類角色名。

### 5. 連結 (`links`)

-   根據 Markdown 中的對話流向和玩家選項確定 `links` 陣列。
-   線性對話：`links` 指向下一個 `entryID`。
-   **玩家選項情境**:
    -   一個**提示選擇的節點** (例如 `actorID:0`, `text: "玩家（選擇回應）："`) 的 `links` 陣列應包含**每一個選項節點各自的 `entryID`**。 (此提示節點本身是可選的)
    -   **每一個選項節點** (例如 `actorID:0`, `text: "選項一的文字"`) 的 `links` 則指向其對應的**空對話擲骰節點** (如果需要檢定) 或直接指向後續劇情分支的起始 `entryID` (如果無檢定)。
-   檢定節點 (`BeginDiceRoll` 所在節點):
    -   系統擲骰: `links` 可能指向成功和失敗兩個分支的 `entryID`。
    -   手動擲骰:
        -   `選項節點` 的 `links` 指向其對應的 `空對話擲骰節點`。
        -   `空對話擲骰節點` 的 `links` 指向 `角色行動/發言節點`。
        -   `角色行動/發言節點` 的 `links` 指向成功和失敗兩個分支。
-   戰鬥節點 (`BeginFight` 所在節點):
    -   觸發節點的 `links` **只指向**緩衝節點。
    -   緩衝節點（`Sequence` 僅 `Continue();`）的 `links` 指向勝利與失敗兩個分支。
    -   勝利／失敗第一個節點分別設 `Conditions` 為 `IsPassFight() == true;`／`IsPassFight() == false;`。
    -   連打兩場：第一場緩衝指向「第二場觸發（帶勝利條件）」與失敗；第二場再走一輪「觸發 → 緩衝 → 勝／敗」。
-   對話結束/離開互動：`links` 為空陣列 `[]`。

### 6. 非對話元素處理

-   Markdown 中的表格、大部分列表、標題、分隔線、任務提示 `[系統提示]`、獲得物品 `△獲得...△` 等，若不直接構成對話或帶有特殊指令的事件節點，則在生成對話JSON時**通常被忽略**或另外處理。
-   **演出描述與音效提示**: 類似「**演出**：跑進村口(茶攤)」或「`[音效：特大聲的咕嚕——！]`」的行，這些主要用於場景或氛圍指導，**不應**為其創建獨立的 `entryID` 和對話節點。它們的內容通常不會直接作為 `text` 顯示。
-   **旁白**: `旁白: [panel=6]＊...＊` 或單獨的 `[panel=6]＊...＊` 行，轉換為 `actorID: 2` (或其他旁白ID) 的節點，`text` 包含 `[panel=6]` 和星號內的內容。
-   **`[即時訊息區]` 和 `[系統提示]` 的處理**: 這類內容，**不應**為其創建獨立的對話節點。如果需要在遊戲中顯示這些信息，其內容應整合到緊鄰的旁白節點的 `text` 中（例如，作為旁白的一部分，或在旁白文字後另起一行），或由遊戲UI通過非對話方式（如彈出提示、日誌更新等）專門處理，以避免打斷對話流。
-   **玩家選項的特殊處理 (`給AI看的指南/立繪指令轉換規則.md` 5.1節)**:
    -   選項節點的 `text` 應為格式化後的選項文字。若不涉及檢定，則為 `「原本的選項文字」`。若涉及檢定，則為 `[em2][XX檢定][/em2]「原本的選項文字」`。例如，原始 Markdown 選項為 `[魅力 難度5]` `[嘗試英雄式站姿，眺望遠方立繪]`：「區區三百文，何足掛齒！」，則選項節點的 `text` 變為 `[em2][魅力檢定][/em2]「區區三百文，何足掛齒！」`。
    -   如果原始Markdown選項中帶有角色發言的立繪描述 (如 `[魅力 難度6]` `[尷尬/臉紅]`：「咳咳！...」)，則：
        1.  **選項節點**的 `text` 變為上述格式化後的文本。
        2.  當玩家選擇該選項後，進入的分支的**第一個節點**將是該角色實際說出完整話語的節點。此節點的 `text` 包含原始完整對話 (不含 `[em2]` 標籤和檢定類型)，其 `Sequence` 則根據 `[尷尬/臉紅]` 生成對應的 `SetPortrait` 和 `EnableCharacterExpression`。

### 6.1 觸發任務/獲得線索的處理

-   當 Markdown 中出現明確指示觸發任務、更新任務狀態或獲得關鍵線索的標記時（例如 `[觸發主線任務：任務名稱]`、`[獲得隱藏線索：線索說明]`、`[任務更新：狀態說明]` 等），應為其創建一個獨立的 JSON 對話節點。
-   **目的**：此節點主要作為一個遊戲邏輯的「鉤子 (hook)」，其 `Sequence` 欄位預期後續會被人力或特定工具填入觸發遊戲內任務系統的具體指令。
-   **JSON 結構建議**：
    -   `entryID`: (Number) 唯一的節點 ID，按順序遞增。
    -   `actorID`: (String/Number) 通常建議使用代表「系統」或「旁白」的 ID，例如 `"MC0"`。
    -   `text`: (String) 可以直接使用 Markdown 中的任務/線索描述文字，例如 `"觸發主線任務：初出茅廬"`。這有助於理解該節點的用途。
    -   `Sequence`: (String) 初始可以為空字串 `""`，或一個註解式的佔位符，例如 `"// TODO: Add TaskTriggerCommand for '任務名稱' here"`。**此欄位是預留給後續添加實際遊戲指令用的。**
    -   `Description`: (String) 必須添加，用於描述此節點的任務觸發功能，例如 "任務觸發節點：初出茅廬"。
    -   `links`: (Array<Number>) 指向下一個常規對話節點或事件節點的 `entryID`。如果觸發任務後沒有立即的後續對話（例如，任務觸發後直接結束當前互動分支），則 `links` 可以為空陣列 `[]`。

-   **範例**：
    **原始 Markdown 行**:
    `[離開茶攤，觸發主線任務：拜訪村長]`

    **轉換後 JSON 節點 (示意)**:
    ```json
    {
        "entryID": 200, // 假設的 ID
        "actorID": "MC0",
        "text": "觸發主線任務：拜訪村長",
        "Sequence": "// TODO: Add TaskTriggerCommand for '拜訪村長' here",
        "Description": "任務觸發節點：拜訪村長",
        "links": [201]  // 指向離開茶攤後的下一個對話或事件
    }
    ```
-   **與其他節點的關係**：如果這類觸發標記緊跟在某個角色的對話之後，那麼該角色對話節點的 `links` 就應該指向這個新創建的任務觸發節點。然後，這個任務觸發節點的 `links` 再指向真正的下一個對話或流程。如果該標記獨立存在，則它按正常流程插入。

## 注意事項

-   仔細核對所有 `actorID`、`角色ID` (指令內)、`pic` 值、`表情ID`、`FeatID` (擲骰)、`獎勵用ID` (ModifyData) 是否參照最新的規則文檔且正確無誤。
-   **特別注意FeatID和獎勵ID的對應關係**: 在檢定和獎勵流程中，擲骰(`BeginDiceRoll`)使用的`FeatID`與獎勵(`ModifyData`)使用的`ID`是有對應關係的不同ID。必須查閱最新的對照表確保正確匹配。例如：
    - 專長檢定使用: `InsightCheck` -> 對應的獎勵ID: `Insight`
    - 五維檢定使用: `CharismaCheck` -> 對應的獎勵ID: `Charisma`

-   **檢定ID與獎勵ID完整對照表**:
    
    | 檢定名稱 (Check Name)        | 檢定用ID (`BeginDiceRoll` 中的 `FeatID`) | 獎勵用ID (`ModifyData`中的 `ID`)   | 獎勵類型 (`ModifyData` 指令) |
    |---------------------------|-------------------------------------------|-----------------------------|------------------------------|
    | 統率檢定                  | `LeadershipCheck`                         | `Leadership`                | 五維 (`AbilityExp`)          |
    | 武力檢定                  | `StrengthCheck`                           | `Strength`                  | 五維 (`AbilityExp`)          |
    | 智力檢定                  | `IntelligenceCheck`                       | `Intelligence`              | 五維 (`AbilityExp`)          |
    | 政治檢定                  | `PoliticsCheck`                           | `Politics`                  | 五維 (`AbilityExp`)          |
    | 魅力檢定                  | `CharismaCheck`                           | `Charisma`                  | 五維 (`AbilityExp`)          |
    | 梟雄檢定                  | `OverlordCheck`                           | `Overlord`                  | 專長 (`FeatExp`)             |
    | 英雄檢定                  | `HeroCheck`                               | `Hero`                      | 專長 (`FeatExp`)             |
    | 弓術檢定                  | `ArcheryCheck`                            | `Archery`                   | 專長 (`FeatExp`)             |
    | 武藝檢定                  | `MartialArtsCheck`                        | `MartialArts`               | 專長 (`FeatExp`)             |
    | 內功檢定                  | `QiCheck`                                 | `Qi`                        | 專長 (`FeatExp`)             |
    | 騎術檢定                  | `HorsemanshipCheck`                       | `Horsemanship`              | 專長 (`FeatExp`)             |
    | 威嚇檢定                  | `IntimidationCheck`                       | `Intimidation`              | 專長 (`FeatExp`)             |
    | 洞悉檢定                  | `InsightCheck`                            | `Insight`                   | 專長 (`FeatExp`)             |
    | 謀略檢定                  | `StrategyCheck`                           | `Strategy`                  | 專長 (`FeatExp`)             |
    | 學識檢定                  | `KnowledgeCheck`                          | `Knowledge`                 | 專長 (`FeatExp`)             |
    | 醫術檢定                  | `MedicalExpertiseCheck`                   | `MedicalExpertise`          | 專長 (`FeatExp`)             |
    | 厚黑檢定                  | `RealpolitikCheck`                        | `Realpolitik`               | 專長 (`FeatExp`)             |
    | 經濟檢定                  | `EconomicDevelopmentCheck`                | `EconomicDevelopment`       | 專長 (`FeatExp`)             |
    | 口才檢定                  | `PersuasionCheck`                         | `Persuasion`                | 專長 (`FeatExp`)，成功 **+25** |
    | 調情檢定                  | `FlirtingCheck`                           | `Flirting`                  | 專長 (`FeatExp`)             |
    | 酒量檢定                  | `AlcoholToleranceCheck`                   | `AlcoholTolerance`          | 專長 (`FeatExp`)             |
    | 巧手檢定                  | `SleightOfHandCheck`                      | `SleightOfHand`             | 專長 (`FeatExp`)             |
    | 奪寶檢定                  | `TreasureHuntingCheck`                    | `TreasureHunting`           | 專長 (`FeatExp`)             |
 
    **注意**: 在編寫JSON時，必須嚴格按照上表使用正確的ID。例如，當使用`BeginDiceRoll(Manual,InsightCheck,7);`進行檢定時，對應的獎勵必須是`ModifyData(FeatExp,Player,Insight,10);`，絕不能混用ID。**口才檢定**成功則為 `ModifyData(FeatExp,Player,Persuasion,25);`。**勿使用已廢棄的 `ModifyData(RangerFame,...)`。好感度勿使用 `AddAffection(...)`，應寫 `ModifyData(FavorabilityExp,角色ID,數值);`。物品一律貴重品，勿使用 `Inventory,AddItem`／`AddItem(...)`，應寫 `ModifyData(Valuable,Player,ValuablesID,數值);`。**

-   確保 `entryID` 連續且唯一。
-   `Sequence` 指令的 `actorID` (如 `MC1`, `MC8`) 和 `位置` 參數務必正確。
-   **表情特效的禁用 (`DisableCharacterExpression`) 必須準確地放在下一個節點的 `Sequence` 開頭。**
-   `links` 的指向必須準確，以保證對話流程的正確性。
-   最終生成的JSON中，`Sequence` 字符串內的指令順序也很重要：一般對話節點通常是 `Disable...` (如果有) -> `SetPortrait` -> `Enable...` (如果有) -> `ModifyData` (如果適用)。**`BeginDiceRoll`／`BeginFight` 不得夾在立繪／表情同一條 Sequence 裡**，必須各自單獨放在空對話節點，並使用完整包裝。擲骰成敗用 `IsPassDice()`、戰鬥勝負用 `IsPassFight()`，皆寫在獨立的 `Conditions` 欄位，不要混入 `Sequence`。
-   **⛔ `SetFlag`／`GetFlag` 不是引擎指令，一律禁用（已定，2026-08-27 作者指出）。** 對話**不能有旗標**。要記住「玩家做過什麼」只有兩條合法途徑：
    1.  **變數**：寫在 **`Script`** 欄位——`Variable["名稱"] = true;`／`Variable["名稱"] = Variable["名稱"] + 1;`（結尾帶 `;`）；讀在 **`Conditions`** 欄位——`Variable["名稱"] == true;`、`Variable["名稱"] >= 2;`，多條件用 `and (…)` 串接（結尾同樣帶 `;`）。
        **⚠ 變數走 `Script`，不走 `Sequence`。** `Sequence` 只放立繪、表情、音效、演出、`ModifyData`、`BeginDiceRoll`／`BeginFight`。
    2.  **任務狀態**：`SetQuestState("代號","active"／"success");`、`SetQuestEntryState("代號", N, "…");` 寫在 `Script`（結尾帶 `;`）；讀用 `CurrentQuestState("代號") == "…";`、`CurrentQuestEntryState("代號", N) == "…";` 寫在 `Conditions`（**否定寫 `~=`，不是 `!=`**，見 §2 `Conditions` 欄位說明）。
        **⚠ 任務 entry 是玩家在任務日誌看得到的東西**，不要為了記一個內部狀態去多開 entry（`劇情/水濂洞/水濂洞.md` 2026-08-26 拍板：這種情形改用層層推導的分岔）。
    -   **⛔ AI 不得自創變數（已定，2026-08-27 作者指出）。** 變數名不是隨手取的字串——**要先在 Unity 的變數表裡存在**，JSON 才讀得到。轉檔時：**①優先沿用既有變數**（全案現有 44 個，可用 `grep -o 'Variable\["[^"]*"\]' Json/ -r` 列出）；**②真的需要新的，就留 `＿＿` 佔位並列進待辦，由作者命名並建好，不得自己編一個寫進 JSON。**
    -   **能用純樹狀分岔解決的，不要記狀態。** 子羽線六支已於 2026-08-25 拍板改為零旗標（見 `@角色設定/子羽.md`、`劇情/歸姓.md`）。
    -   **⚠ 大量舊創作稿仍寫著 `SetFlag(...)`**（24 份 .md、258 處）。**那些是錯的，轉檔時一律改寫成上面兩種寫法**，不要照抄。現行 `Json/` 裡唯一殘留的是 `大地圖/水濂洞.json` 的 `ZhenFamily_*` 一組（10 個節點），待處理。

-   **擲骰節點固定寫法（必守）**：任何 `BeginDiceRoll(...)`（不論 `Auto` 或 `Manual`）**都不能單獨出現**，其所在節點的 `Sequence` 必須**就是這四段、不多不少**：`SetContinueMode(false);SetContinueMode(original)@Message(EndRoll);Continue()@Message(EndRoll);BeginDiceRoll(...);`（此節點 `text` 為 `""`，不得再摻立繪、表情、`ModifyData`，也不得掛 `Script`）。擲骰節點的 `links` **只指向一個緩衝節點**，成功／失敗的 `Conditions` 寫在再下一層。緩衝節點要不要 `Continue();` **看它有沒有對話**：`text` 為 `""` 時**必須**在 `Sequence` 開頭加 `Continue();`（否則畫面會卡住）；`text` 有台詞時（例如主角把選項那句話說出來）**不要加**。詳見 `給AI看的指南/擲骰指令轉換規則.md`「擲骰節點的 Sequence 固定寫法」一節，本指南 §4.1、§4.2 的步驟已同步此規則。
-   **戰鬥節點固定寫法（必守）**：一場戰鬥**固定四個對話節點**——①完整包裝 `SetContinueMode(false);BeginFight(Combat,場次ID);SetContinueMode(original)@Message(EndFight);Continue()@Message(EndFight);`（注意：`BeginFight` 在第二段，等的是 **`EndFight`**）；②獨立緩衝，`Sequence` 僅 `Continue();`；③勝利 `"Conditions": "IsPassFight() == true;"`；④失敗 `"Conditions": "IsPassFight() == false;"`。`IsPassFight()` **禁止**寫進 `Sequence`。禁止 `BeginCombat(...)`。詳見 `給AI看的指南/戰鬥指令轉換規則.md`，本指南 §4.3 已同步此規則。
-   **養成任務對話背景圖（必守）**：`Json/主線事件/`、`Json/探索事件/` 的每段對話，第一格 `Sequence` 開頭 `EnableDialogueBG(ID);`，每條結尾補獨立空格 `DisableDialogueBG();Continue();`（`actorID "0"`、`text ""`）。漏關＝回養成介面看不到 UI。詳見 `給AI看的指南/畫面指令轉換規則.md` §1，本指南 §3.7。
-   **轉場固定寫法（必守）**：`SetContinueMode(false);PlayFeelFeedback(FadeInOut,1,0.5,1,#000000,1);［換景@1］;SetContinueMode(original)@2.5;Continue()@2.5;`，獨立空格、四段不多不少、換景一律掛 `@1`、恢復點擊一律 `original`。裸寫 `EnableDialogueBG`／`PlayFeelFeedback` 不包四段都是錯。詳見 `給AI看的指南/畫面指令轉換規則.md` §2，本指南 §3.8。
-   **畫面特效有開就有關（必守）**：每個 `PlayOrStopParticle(X,Play)` 往下必須找得到 `PlayOrStopParticle(X,Stop)` 或 `StopAllParticle()`，預設放下一格開頭。詳見 `給AI看的指南/畫面指令轉換規則.md` §3，本指南 §3.9。
-   **只有特定類型的節點才應包含Description欄位**，包括檢定、擲骰、戰鬥、任務、選項等功能性節點。普通對話節點不應包含Description欄位。
-   **對話文本統一性**: 確保所有對話文本的引號「」處理一致。根據1.1節規則，標準角色對話應包含引號。

## 範例 (片段示意，非完整劇情)

**原始 Markdown (假設片段):**
```markdown
**燕不凡** `[尷尬/臉紅]`：「這...這個嘛...」
**蕭靈犀:** `[眼睛一亮立繪]`：「三百文！有三百文我們就能去京城了！」
**旁白:**：[panel=6]＊（此時，一個選項出現了。）＊
**玩家**（選擇回應）：
    1.  `[魅力 難度5]` `[嘗試英雄式站姿，眺望遠方立繪]`：「區區三百文，何足掛齒！」 // 假設此選項需要魅力檢定
    2.  「我們再想想辦法。」 // 假設此選項無檢定
```

**轉換後 JSON (片段示意，重點演示選項處理 - 最新修訂流程):**
```json
[
  {
    "entryID": 100,
    "actorID": "MC1",
    "text": "「這...這個嘛...」",
    "Sequence": "SetPortrait(MC1,pic=7);EnableCharacterExpression(0,MC1-1,Nervous);",
    "links": [101]
  },
  {
    "entryID": 101,
    "actorID": "MC8",
    "text": "「三百文！有三百文我們就能去京城了！」",
    "Sequence": "DisableCharacterExpression(0);SetPortrait(MC8,pic=5);EnableCharacterExpression(1,MC8,Surprise);",
    "links": [102]
  },
  {
    "entryID": 102,
    "actorID": "MC0",
    "text": "[panel=6]＊（此時，一個選項出現了。）＊",
    "Sequence": "DisableCharacterExpression(1);",
    "links": [104, 107]
  },
  {
    "entryID": 104,
    "actorID": "MC1",
    "text": "[em2][魅力檢定][/em2]「區區三百文，何足掛齒！」",
    "Sequence": "",
    "links": [105],
    "Description": "選項1：魅力檢定"
  },
  {
    "entryID": 105,
    "actorID": "MC0",
    "text": "",
    "Sequence": "SetContinueMode(false);SetContinueMode(original)@Message(EndRoll);Continue()@Message(EndRoll);BeginDiceRoll(Manual,CharismaCheck,5);",
    "links": [106],
    "Description": "選項1的空對話擲骰節點"
  },
  {
    "entryID": 106,
    "actorID": "MC1",
    "text": "「區區三百文，何足掛齒！」",
    "Sequence": "SetPortrait(MC1,pic=5);EnableCharacterExpression(0,MC1-1,Anger_2);",
    "links": [110, 111]
  },
  {
    "entryID": 110,
    "actorID": "NPC1",
    "text": "「不愧是年輕人，有魄力！」",
    "Sequence": "DisableCharacterExpression(0);ModifyData(AbilityExp,Player,Charisma,10);",
    "links": [120],
    "Conditions": "IsPassDice() == true;"
  },
  {
    "entryID": 111,
    "actorID": "NPC1",
    "text": "「口氣不小，希望你的錢包也像嘴巴一樣大...」",
    "Sequence": "DisableCharacterExpression(0);",
    "links": [121],
    "Conditions": "IsPassDice() == false;"
  },
  {
    "entryID": 107,
    "actorID": "MC1",
    "text": "「我們再想想辦法。」",
    "Sequence": "",
    "links": [108],
    "Description": "選項2：無檢定"
  },
  {
    "entryID": 108,
    "actorID": "MC1",
    "text": "「我們再想想辦法。」",
    "Sequence": "SetPortrait(MC1,pic=12);",
    "links": [109]
  }
  // ... 其他後續分支節點 ...
]
```

本指南旨在提供一個標準化的轉換基礎，可根據實際項目需求進行調整和擴充。 