# Markdown 腳本轉 JSON 對話格式指南 (根據最新立繪與擲骰規則修訂)

本文件旨在說明如何將 Markdown 格式的遊戲腳本（例如 `初出茅廬.md`）轉換為遊戲引擎可讀取的 JSON 格式，並整合最新的 `立繪指令轉換規則.md` 和 `擲骰指令轉換規則.md`。

## JSON 結構

每個 JSON 物件代表一個對話節點或事件步驟，包含以下主要欄位：

-   `entryID` (Number): 唯一的節點 ID，按順序遞增。
-   `actorID` (Number): 說話者的 ID。
    -   `MC1`: 少年燕不凡 (主角)
    -   `MC8`: 蕭靈犀
    -   `actorID` 為 `2`: 通常代表旁白 (若旁白有特定功能或格式)。
    -   其他NPC ID根據實際表格 (如 `actor01 - actor01.csv`) 對照。例如：`3` 可能為茶攤老伯，`4` 為村長，`89` 為雍仔。
    -   `actorID` 為 `0` or `-1`: 通常用於系統提示、場景描述、檢定觸發等非角色發言的特殊節點。
-   `text` (String): 對話文字內容。
-   `Sequence` (String): 特殊指令序列，用於觸發立繪變化、表情特效、擲骰等。如果沒有指令，則為空字串 `""`。
-   `links` (Array<Number>): 指向下一個或多個可能的對話節點的 `entryID` 列表。如果是對話終點，則為空陣列 `[]`。
-   `Description` (String, 僅用於特定節點): 此欄位僅用於標註特殊功能節點，不應用於普通對話。只有以下情況需要添加此欄位：
    1. 自動檢定節點 (例如："自動洞悉檢定觸發點")
    2. 手動擲骰節點 (例如："魅力檢定擲骰節點")
    3. 任務觸發節點 (例如："任務『初出茅廬』觸發點")
    4. 物品交互節點 (例如："給予黃金魚的對話分支")
    5. 選項節點 (例如："選擇使用魅力的選項")
    6. 空內容緩衝節點 (例如："空內容緩衝節點，用於連接檢定結果")
    
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

### 3. Sequence 指令生成 (核心規則依據 `立繪指令轉換規則.md`)

-   **始終包含 `Sequence` 欄位**: 每個 JSON 物件都必須有 `Sequence` 欄位，即使為空 `""`。
-   **指令組成**: 主要包含 `SetPortrait` (換立繪), `EnableCharacterExpression` (啟用表情), `DisableCharacterExpression` (停用表情), 以及可能的擲骰相關指令如 `BeginDiceRoll` 和 `ModifyData`。

#### 3.1 `SetPortrait` (換立繪)
-   **觸發條件**: 每個包含主角 (`MC1`) 或蕭靈犀 (`MC8`) 的對話行，都**必須**包含 `SetPortrait` 指令。
-   **規則**: 根據對話行中 `[...]` 內的立繪描述文字，查閱 `立繪指令轉換規則.md` 中的「立繪描述與`pic`參數對照表」，確定對應的 `角色ID` (MC1/MC8) 和 `pic` 值。
-   **格式**: `SetPortrait(角色ID,pic=圖片名稱);`
    *   例如：`燕不凡` `[尷尬/臉紅]` -> `SetPortrait(MC1,pic=Shy);`

#### 3.2 `EnableCharacterExpression` (啟用表情特效)
-   **觸發條件**: 如果對話情境需要額外的表情特效，在 `SetPortrait` 後緊跟 `EnableCharacterExpression`。
-   **規則**: 參考 `立繪指令轉換規則.md` 中的「情緒描述與`表情ID`對照表」，根據上下文和描述文字選擇合適的 `表情ID`。
-   **格式**: `EnableCharacterExpression(位置,角色ID,表情ID);`
    -   `位置`: `角色ID`為 `MC1` 時，位置固定為 `0`。其他角色（如 `MC8`）作為當前發言者時，位置慣用 `1`。
    -   `角色ID`: `MC1` 或 `MC8`。
    -   例如：`蕭靈犀` `[震驚/垮臉立繪]` -> `SetPortrait(MC8,pic=surprise);EnableCharacterExpression(1,MC8,Shock);`

#### 3.3 `DisableCharacterExpression` (停用表情特效)
-   **觸發條件**: 若前一個對話節點的 `Sequence` 中包含了針對某角色的 `EnableCharacterExpression`。
-   **執行位置**: 該 `DisableCharacterExpression` 指令必須放置在**緊隨**啟用該表情特效的對話節點之後的**下一個對話節點**的 `Sequence` 字符串的**最開頭**。
-   **格式**: `DisableCharacterExpression(位置);`
    -   `位置`: 應與其配對的 `EnableCharacterExpression` 指令中的 `位置` 參數一致。
    -   例如：如果節點A中蕭靈犀 (MC8) 啟用了表情 (位置1)，則節點A指向的下一個節點B的 `Sequence` 開頭應為 `DisableCharacterExpression(1);`。

#### 3.4 指令合併
-   同一個節點的多個指令用分號 `;` 連接。
    *   例如: `SetPortrait(MC1,pic=Shy);EnableCharacterExpression(0,MC1,Nervous);`
    *   包含狀態恢復的下一個節點: `DisableCharacterExpression(0);SetPortrait(MC1,pic=NewPicForThisLine);` (注意：根據`立繪指令轉換規則.md`，每行都會重新`SetPortrait`，所以不一定會恢復到`pic=1`，而是該行對應的新立繪。)

### 4. 擲骰相關指令 (依據 `擲骰指令轉換規則.md`)

#### 4.1 系統擲骰 (自動檢定)
-   Markdown 中的 `[自動<檢定類型>檢定]` 或類似的文字提示（例如 `[自動洞悉檢定] (難度 2)`），其文字內容**本身應放在一個常規的旁白或對話節點中**，或者如果不需要在遊戲中明確顯示此文字，則在生成JSON時可以忽略此文字。
-   觸發實際的自動擲骰指令 `BeginDiceRoll(Auto,FeatID,難度);`，應遵循以下兩步驟結構：
    1.  **檢定觸發節點**: 創建一個節點，其 `actorID` 通常為 `"MC0"` (或代表系統的ID)，`text` 欄位為**空字串 `""`**。`Sequence` 欄位包含 `BeginDiceRoll(Auto,FeatID,難度);` 指令。此節點必須包含 `Description` 說明其為檢定觸發點。
        -   `links`: 此節點的 `links` 應指向緊隨其後的「空內容緩衝節點」。
    2.  **空內容緩衝節點**: 緊隨「檢定觸發節點」之後，必須插入一個**新的節點**。此節點的 `actorID` 為 `"MC0"`，`text` 和 `Sequence` 均為**空字串 `""`**。此節點必須包含 `Description` 說明其用途。
        -   `links`: 此「空內容緩衝節點」的 `links` 才指向檢定成功和失敗的實際劇情分支節點（或教學提示等）。
-   `FeatID` 參考 `擲骰指令轉換規則.md` 中的「常用檢定項目ID對照」。
-   檢定成功後，在描述成功的旁白節點或下一個合適節點的 `Sequence` 中加入獎勵指令 `ModifyData(AbilityExp/FeatExp,MC1,獎勵用ID,10);`。
-   **FeatID與獎勵ID的對應**: 擲骰時使用的`FeatID`（例如`InsightCheck`）與檢定成功後獎勵時使用的`獎勵用ID`（例如`Insight`）是相關聯但不同的ID。轉換時必須仔細查閱本指南末尾的「檢定ID與獎勵ID完整對照表」以確保使用正確的ID配對，避免錯誤。

#### 4.1.1 擲骰成功/失敗分支條件標識
-   **成功分支標識**: 在檢定成功分支的第一個節點的`Sequence`中，應添加條件標識`IsPassDice() == true`。例如：
    ```
    "Sequence": "IsPassDice() == true;DisableCharacterExpression(0);ModifyData(FeatExp,MC1,Insight,10);"
    ```
-   **失敗分支標識**: 在檢定失敗分支的第一個節點的`Sequence`中，應添加條件標識`IsPassDice() == false`。例如：
    ```
    "Sequence": "IsPassDice() == false;DisableCharacterExpression(0);"
    ```
-   **條件標識位置**: 這些條件標識應位於`Sequence`字串的最開頭，在任何其他指令（如`DisableCharacterExpression`）之前。

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
    4.  **空對話擲骰節點 (手動擲骰觸發)**: **緊隨在帶檢定的『選項節點』之後**，必須插入一個特殊的「空對話」JSON節點。此節點的 `text` 欄位為空字串 (`""`)，其 `Sequence` 欄位用於放置 `BeginDiceRoll(Manual,FeatID,難度);` 指令。
        -   `actorID`: 通常為 `0` 或 `-1` (系統執行)。
        -   `text`: `""` (空字串)。
        -   `Description`: 應包含描述此節點用途的文字，例如："選項1的空對話擲骰節點"。
        -   `links`: 指向**角色實際執行該選項動作/發言的節點**。
    5.  **角色行動/發言節點**: 此節點代表玩家選擇選項後，角色（如 `MC1`）實際說出對應的話或執行動作。
        -   `text`: 包含原始 Markdown 中角色在該選項下的完整發言。
        -   `Sequence`: 根據發言的立繪/表情描述生成。
        -   `links`: 此節點的 `links` 陣列通常包含**兩個 `entryID`**：一個指向檢定成功後的劇情分支，另一個指向檢定失敗後的劇情分支。遊戲引擎根據前一步驟 `BeginDiceRoll` 的結果來選擇其中一個鏈接。
    6.  **檢定成功獎勵**: 檢定成功後，在進入成功分支的**第一個合適節點** (通常是NPC的回應或主角的確認發言之後的旁白，或該NPC回應節點本身) 的 `Sequence` 中加入獎勵指令 `ModifyData(...)`。
    7.  **選項文本中的檢定標籤**: 如 `[魅力 難度6]`，主要用於提示編寫者此選項關聯哪個 `BeginDiceRoll` 指令以及後續分支 logique。轉換時，檢定的中文名稱（如「魅力」）應提取並用於格式化選項文本為 `[em2][魅力檢定][/em2]「原本的選項文字」`，原始的檢定標籤（包括難度數字和方括號）則從「原本的選項文字」中移除。
    8.  **手動擲骰的成功/失敗分支條件標識**: 同自動檢定一樣，在成功分支的第一個節點中添加`IsPassDice() == true`，在失敗分支的第一個節點中添加`IsPassDice() == false`。

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
-   對話結束/離開互動：`links` 為空陣列 `[]`。

### 6. 非對話元素處理

-   Markdown 中的表格、大部分列表、標題、分隔線、任務提示 `[系統提示]`、獲得物品 `△獲得...△` 等，若不直接構成對話或帶有特殊指令的事件節點，則在生成對話JSON時**通常被忽略**或另外處理。
-   **演出描述與音效提示**: 類似「**演出**：跑進村口(茶攤)」或「`[音效：特大聲的咕嚕——！]`」的行，這些主要用於場景或氛圍指導，**不應**為其創建獨立的 `entryID` 和對話節點。它們的內容通常不會直接作為 `text` 顯示。
-   **旁白**: `旁白: [panel=6]＊...＊` 或單獨的 `[panel=6]＊...＊` 行，轉換為 `actorID: 2` (或其他旁白ID) 的節點，`text` 包含 `[panel=6]` 和星號內的內容。
-   **`[即時訊息區]` 和 `[系統提示]` 的處理**: 這類內容，**不應**為其創建獨立的對話節點。如果需要在遊戲中顯示這些信息，其內容應整合到緊鄰的旁白節點的 `text` 中（例如，作為旁白的一部分，或在旁白文字後另起一行），或由遊戲UI通過非對話方式（如彈出提示、日誌更新等）專門處理，以避免打斷對話流。
-   **玩家選項的特殊處理 (`立繪指令轉換規則.md` 5.1節)**:
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
-   **特別注意FeatID和獎勵ID的對應關係**: 在檢定和獎勵流程中，擲骰(`BeginDiceRoll`)使用的FeatID與獎勵(`ModifyData`)使用的ID是有對應關係的不同ID。必須查閱最新的對照表確保正確匹配。例如：
    - 擲骰檢定使用: `InsightCheck`
    - 對應的獎勵使用: `Insight`
    - 擲骰檢定使用: `Ability_CHA` (魅力屬性檢定)
    - 對應的獎勵使用: `AbilityExp,MC1,Ability_CHA` (經驗值獎勵)

-   **檢定ID與獎勵ID完整對照表**:
    
    | 檢定名稱 (Check Name)        | 檢定用ID (`BeginDiceRoll` 中的 `FeatID`) | 獎勵用ID (`ModifyData`中的 `FeatID`) | 獎勵類型 (`ModifyData` 指令) |
    |---------------------------|-------------------------------------------|-----------------------------|------------------------------|
    | 統率檢定                  | `LeadershipCheck`                         | `Ability_LDR`               | 五維 (`AbilityExp`)          |
    | 武力檢定                  | `StrengthCheck`                           | `Ability_STR`               | 五維 (`AbilityExp`)          |
    | 智力檢定                  | `IntelligenceCheck`                       | `Ability_INT`               | 五維 (`AbilityExp`)          |
    | 政治檢定                  | `PoliticsCheck`                           | `Ability_POL`               | 五維 (`AbilityExp`)          |
    | 魅力檢定                  | `CharismaCheck`                           | `Ability_CHA`               | 五維 (`AbilityExp`)          |
    | 步兵檢定                  | `InfantryCheck`                           | `Infantry`                  | 專長 (`FeatExp`)             |
    | 兵法檢定                  | `MilitaryTacticsCheck`                    | `MilitaryTactics`           | 專長 (`FeatExp`)             |
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
    | 口才檢定                  | `PersuasionCheck`                         | `Persuasion`                | 專長 (`FeatExp`)             |
    | 調情檢定                  | `FlirtingCheck`                           | `Flirting`                  | 專長 (`FeatExp`)             |
    | 酒量檢定                  | `AlcoholToleranceCheck`                   | `AlcoholTolerance`          | 專長 (`FeatExp`)             |
    | 巧手檢定                  | `SleightOfHandCheck`                      | `SleightOfHand`             | 專長 (`FeatExp`)             |
    | 奪寶檢定                  | `TreasureHuntingCheck`                    | `TreasureHunting`           | 專長 (`FeatExp`)             |

    **注意**: 在編寫JSON時，必須嚴格按照上表使用正確的ID。例如，當使用`BeginDiceRoll(Manual,InsightCheck,7);`進行檢定時，對應的獎勵必須是`ModifyData(FeatExp,MC1,Insight,10);`，絕不能混用ID。

-   確保 `entryID` 連續且唯一。
-   `Sequence` 指令的 `actorID` (如 `MC1`, `MC8`) 和 `位置` 參數務必正確。
-   **表情特效的禁用 (`DisableCharacterExpression`) 必須準確地放在下一個節點的 `Sequence` 開頭。**
-   `links` 的指向必須準確，以保證對話流程的正確性。
-   最終生成的JSON中，`Sequence` 字符串內的指令順序也很重要：通常是 `IsPassDice()` (如果有) -> `Disable...` (如果有) -> `SetPortrait` -> `Enable...` (如果有) -> `BeginDiceRoll` / `ModifyData` (如果適用於該節點)。
-   **只有特定類型的節點才應包含Description欄位**，包括檢定、擲骰、任務、選項等功能性節點。普通對話節點不應包含Description欄位。
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
    "Sequence": "SetPortrait(MC1,pic=Shy);EnableCharacterExpression(0,MC1,Nervous);",
    "links": [101]
  },
  {
    "entryID": 101,
    "actorID": "MC8",
    "text": "「三百文！有三百文我們就能去京城了！」",
    "Sequence": "DisableCharacterExpression(0);SetPortrait(MC8,pic=expect);EnableCharacterExpression(1,MC8,Surprise_2);",
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
    "Sequence": "BeginDiceRoll(Manual,Ability_CHA,5);",
    "links": [106],
    "Description": "選項1的空對話擲骰節點"
  },
  {
    "entryID": 106,
    "actorID": "MC1",
    "text": "「區區三百文，何足掛齒！」",
    "Sequence": "SetPortrait(MC1,pic=proud);EnableCharacterExpression(0,MC1,Proud);",
    "links": [110, 111]
  },
  {
    "entryID": 110,
    "actorID": "NPC1",
    "text": "「不愧是年輕人，有魄力！」",
    "Sequence": "IsPassDice() == true;DisableCharacterExpression(0);ModifyData(AbilityExp,MC1,Ability_CHA,10);",
    "links": [120]
  },
  {
    "entryID": 111,
    "actorID": "NPC1",
    "text": "「口氣不小，希望你的錢包也像嘴巴一樣大...」",
    "Sequence": "IsPassDice() == false;DisableCharacterExpression(0);",
    "links": [121]
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
    "Sequence": "SetPortrait(MC1,pic=meditate);",
    "links": [109]
  }
  // ... 其他後續分支節點 ...
]
```

本指南旨在提供一個標準化的轉換基礎，可根據實際項目需求進行調整和擴充。 