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

## Markdown 轉換規則

### 1. 對話與發言者

-   Markdown 中的 `**發言者**：對話內容` 格式應轉換為一個 JSON 物件。
-   `**發言者**` 需要轉換為對應的 `actorID` (如 `MC1`, `MC8` 或其他NPC的數字ID)。
-   `對話內容` (包含括號內的描述，這些描述將用於生成 `Sequence`) 放入 `text` 欄位。

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
-   Markdown 中的 `[自動<檢定類型>檢定]` 或類似觸發，應在對應的JSON節點 (通常是 `actorID: 0` 或 `-1`) 的 `Sequence` 中加入 `BeginDiceRoll(Auto,FeatID,難度);`。
-   `FeatID` 參考 `擲骰指令轉換規則.md` 中的「常用檢定項目ID對照」。
-   檢定成功後，在描述成功的旁白節點或下一個合適節點的 `Sequence` 中加入獎勵指令 `ModifyData(AbilityExp/FeatExp,MC1,獎勵用ID,10);`。

#### 4.2 手動擲骰 (選項回應)
-   **關鍵規則**: 當玩家需要從多個選項中選擇，並且某些選項涉及屬性/專長檢定時，處理流程如下：
    1.  **提示選擇節點**: 一個節點 (通常 `actorID:0`) 用於展示「玩家（選擇回應）：」或類似的提示文字。其 `links` 指向每一個選項的獨立 `entryID`。
    2.  **手動擲骰觸發節點 (空節點)**: **在緊鄰第一個涉及檢定的選項節點之前**，必須插入一個特殊的「空對話」JSON節點。此節點用於放置 `BeginDiceRoll(Manual,FeatID,難度);` 指令。如果多個選項都有檢定，每個檢定選項前理論上可以有各自的 `BeginDiceRoll` 觸發（如果檢定類型或難度不同），或者遊戲設計上可能只觸發一次，然後根據選擇的選項判斷。指南的範例將展示針對特定選項的檢定觸發。
        -   **JSON格式範例** (空節點，觸發特定選項的檢定):
            ```json
            {
              "entryID": 103, // 假設的ID
              "actorID": 0,   // 或 -1，代表系統
              "text": "",      // 無對話內容
              "Sequence": "BeginDiceRoll(Manual,CharismaCheck,6);", // 假設接下來的選項是魅力6檢定
              "links": [104]  // 指向該魅力檢定選項的entryID
            }
            ```
    3.  **選項節點**: **每個玩家選項本身都是一個獨立的JSON節點**，擁有自己的 `entryID`。
        -   `actorID`: 通常為 `0` 或 `-1`。
        -   `text`: 包含該選項的文字，例如 `「三百文？小意思！」` (可能已去除檢定標籤)。
        -   `links`: 指向選擇此選項後，劇情應跳轉到的下一個節點的 `entryID`。
        -   **選項文本中的檢定標籤**: 如 `[魅力 難度6]`，主要用於提示編寫者此選項關聯到哪個 `BeginDiceRoll` 指令以及後續分支邏輯，在最終的選項 `text` 中可以選擇性保留或去除以簡化顯示。
    4.  **檢定成功獎勵**: 檢定成功後，在進入成功分支的**第一個節點** (通常是NPC的回應或主角的確認發言) 的 `Sequence` 中加入獎勵指令 `ModifyData(...)`。

### 5. 連結 (`links`)

-   根據 Markdown 中的對話流向和玩家選項確定 `links` 陣列。
-   線性對話：`links` 指向下一個 `entryID`。
-   **玩家選項情境**:
    -   一個**提示選擇的節點** (例如 `actorID:0`, `text: "玩家（選擇回應）："`) 的 `links` 陣列應包含**每一個選項節點各自的 `entryID`**。
    -   **每一個選項節點** (例如 `actorID:0`, `text: "選項一的文字"`) 的 `links` 則指向選擇該選項後對應的劇情分支的起始 `entryID`。
-   檢定節點 (`BeginDiceRoll` 所在節點):
    -   系統擲骰: `links` 可能指向成功和失敗兩個分支的 `entryID`。
    -   手動擲骰: `BeginDiceRoll` 的空節點 `links` 指向其關聯的具體**選項節點**。該選項節點的 `links` 再指向後續分支。
-   對話結束/離開互動：`links` 為空陣列 `[]`。

### 6. 非對話元素處理

-   Markdown 中的表格、大部分列表、標題、分隔線、任務提示 `[系統提示]`、獲得物品 `△獲得...△` 等，若不直接構成對話或帶有特殊指令的事件節點，則在生成對話JSON時**通常被忽略**或另外處理。
-   **演出描述與音效提示**: 類似「**演出**：跑進村口(茶攤)」或「`[音效：特大聲的咕嚕——！]`」的行，這些主要用於場景或氛圍指導，**不應**為其創建獨立的 `entryID` 和對話節點。它們的內容通常不會直接作為 `text` 顯示。
-   **旁白**: `旁白: [panel=5]＊...＊` 或單獨的 `[panel=5]＊...＊` 行，轉換為 `actorID: 2` (或其他旁白ID) 的節點，`text` 包含 `[panel=5]` 和星號內的內容。
-   **玩家選項的特殊處理 (`立繪指令轉換規則.md` 5.1節)**:
    -   選項節點的 `text` 應為純淨的選項文字，例如 `「三百文？小意思！」`。
    -   如果原始Markdown選項中帶有角色發言的立繪描述 (如 `[魅力 難度6]` `[尷尬/臉紅]`：「咳咳！...」)，則：
        1.  **選項節點**的 `text` 只包含精簡後的選項文字。
        2.  當玩家選擇該選項後，進入的分支的**第一個節點**將是該角色實際說出完整話語的節點。此節點的 `text` 包含原始完整對話，其 `Sequence` 則根據 `[尷尬/臉紅]` 生成對應的 `SetPortrait` 和 `EnableCharacterExpression`。

## 注意事項

-   仔細核對所有 `actorID`、`角色ID` (指令內)、`pic` 值、`表情ID`、`FeatID` (擲骰)、`獎勵用ID` (ModifyData) 是否參照最新的規則文檔且正確無誤。
-   確保 `entryID` 連續且唯一。
-   `Sequence` 指令的 `actorID` (如 `MC1`, `MC8`) 和 `位置` 參數務必正確。
-   **表情特效的禁用 (`DisableCharacterExpression`) 必須準確地放在下一個節點的 `Sequence` 開頭。**
-   `links` 的指向必須準確，以保證對話流程的正確性。
-   最終生成的JSON中，`Sequence` 字符串內的指令順序也很重要：通常是 `Disable...` (如果有) -> `SetPortrait` -> `Enable...` (如果有) -> `BeginDiceRoll` / `ModifyData` (如果適用於該節點)。

## 範例 (片段示意，非完整劇情)

**原始 Markdown (假設片段):**
```markdown
**燕不凡** `[尷尬/臉紅]`：「這...這個嘛...」
**蕭靈犀:** `[眼睛一亮立繪]`：「三百文！有三百文我們就能去京城了！」
**旁白:**：[panel=5]＊（此時，一個選項出現了。）＊
**玩家**（選擇回應）：
    1.  `[魅力 難度5]` `[嘗試英雄式站姿，眺望遠方立繪]`：「區區三百文，何足掛齒！」 // 假設此選項需要魅力檢定
    2.  「我們再想想辦法。」 // 假設此選項無檢定
```

**轉換後 JSON (片段示意，重點演示選項處理):**
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
    "actorID": 2, 
    "text": "[panel=5]＊（此時，一個選項出現了。）＊",
    "Sequence": "DisableCharacterExpression(1);",
    "links": [103] // 指向玩家選擇提示節點
  },
  {
    "entryID": 103,
    "actorID": 0, 
    "text": "玩家（選擇回應）：", // 提示玩家選擇
    "Sequence": "",
    "links": [104, 107] // 指向兩個選項各自的entryID (104為選項1的BeginDiceRoll前置節點, 107為選項2)
  },
  // 處理選項1: `[魅力 難度5]` `[嘗試英雄式站姿，眺望遠方立繪]`：「區區三百文，何足掛齒！」
  {
    "entryID": 104, // 空節點，用於觸發選項1的魅力檢定
    "actorID": 0,
    "text": "",
    "Sequence": "BeginDiceRoll(Manual,CharismaCheck,5);",
    "links": [105] // 指向選項1的實際節點
  },
  {
    "entryID": 105,
    "actorID": 0, // 選項1本身的節點
    "text": "「區區三百文，何足掛齒！」", // 純選項文字
    "Sequence": "",
    "links": [106] // 指向選擇此選項後的劇情分支 (假設是成功或MC1發言節點)
  },
  // 若選擇選項1後，MC1實際發言 (包含立繪描述) 且檢定成功
  {
    "entryID": 106,
    "actorID": "MC1",
    "text": "「區區三百文，何足掛齒！」", // 完整發言
    "Sequence": "SetPortrait(MC1,pic=proud);EnableCharacterExpression(0,MC1,Proud);ModifyData(AbilityExp,MC1,Ability_CHA,10);", // 應用立繪表情，並給予獎勵
    "links": [108] // 指向NPC的反應或其他後續
  },
  // 處理選項2: 「我們再想想辦法。」
  {
    "entryID": 107,
    "actorID": 0, // 選項2本身的節點
    "text": "「我們再想想辦法。」",
    "Sequence": "",
    "links": [109] // 指向選擇此選項後的劇情分支
  },
  {
    "entryID": 108, // NPC對選項1的回應示例
    "actorID": "3", 
    "text": "「哦？小哥兒好口氣！」",
    "Sequence": "DisableCharacterExpression(0);",
    "links": []
  }
  // ... 其他分支和節點 ...
]
```

本指南旨在提供一個標準化的轉換基礎，可根據實際項目需求進行調整和擴充。 