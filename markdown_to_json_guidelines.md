# Markdown 腳本轉 JSON 對話格式指南

本文件旨在說明如何將 Markdown 格式的遊戲腳本（例如 `初出茅廬.md`）轉換為遊戲引擎可讀取的 JSON 格式（參考 `EventsExample.json` 和 `初出茅廬.json`）。

## JSON 結構

每個 JSON 物件代表一個對話節點或事件步驟，包含以下主要欄位：

-   `entryID` (Number): 唯一的節點 ID，按順序遞增。
-   `actorID` (Number): 說話者的 ID。參考 `actor01 - actor01.csv` 對照表。
    -   `1`: 你 (主角，MC1)
    -   `6`: 蕭靈犀 (MC8)
    -   `2`: 旁白 (若旁白有特定功能或格式，否則可能用 `0` 或 `-1`)
    -   `3`: 茶攤老伯 (根據範例)
    -   `4`: 村長 (根據範例)
    -   `89`: 雍仔 (簡雍_雍仔型態)
    -   `0` or `-1`: 系統提示、場景描述、檢定觸發等非角色發言。
-   `text` (String): 對話文字內容。
-   `Sequence` (String): 特殊指令序列，用於觸發表情、立繪變化等。如果沒有指令，則為空字串 `""`。
-   `links` (Array<Number>): 指向下一個或多個可能的對話節點的 `entryID` 列表。如果是對話終點，則為空陣列 `[]`。

## Markdown 轉換規則

### 1. 對話與發言者

-   Markdown 中的 `**發言者**：對話內容` 格式應轉換為一個 JSON 物件。
-   `**發言者**` 需要對照 `actor01 - actor01.csv` 找到對應的 `actorID`。
-   `對話內容` (包含括號內的描述) 放入 `text` 欄位。

### 2. 特殊格式轉換

-   對話文字中（不包括人名）的 `**重點文字**` 應轉換為 `[em2]重點文字[/em2]`。

### 3. Sequence 指令生成

-   **始終包含 `Sequence` 欄位**: 每個 JSON 物件都必須有 `Sequence` 欄位，即使為空 `""`。
-   **判斷條件**:
    -   僅當發言者為 `你 (actorID: 1)` 或 `蕭靈犀 (actorID: 6)` 時，檢查其 `text` 中 **括號 `()` 內的描述文字**。
    -   根據描述文字判斷情緒或狀態，生成對應指令。
-   **情緒指令**: `EnableCharacterExpression(actorId, emotion);`
    -   `actorId`: `1` (你) 或 `6` (蕭靈犀)。
    -   `emotion`:
        -   紅色生氣: `Anger`
        -   黃色圓圈生氣(道具靈氣): `Anger_2`
        -   白色怒吼生氣(怪物吼叫): `Anger_3`
        -   滴汗緊張(一滴汗): `Nervous`
        -   大量滴汗緊張(滿頭大汗): `Nervous_2`
        -   紫色痛苦/難過/臉色垮: `Pain`
        -   閃星星自豪/得意: `Proud`
        -   打雷震驚: `Shock`
        -   不規則驚嘆號(外框不規則)/驚訝: `Surprise`
        -   圓形驚嘆號(外框是圓的): `Surprise_2`
        -   點點點驚嘆號(外框裡是點點點/思考: `Meditate`
        -   燈泡/靈光一閃: `Idea`
        -   圓形問號/疑惑: `Question`
        -   開心/眼睛一亮/笑: `Happy`
        -   尷尬/被說中心事: `Nervous`
        -   悄聲/擔心: `Nervous`
        -   叉腰: (可能是 `Anger`，視情況)
        -   歪頭: (可能是 `Question` 或 `Meditate`)
        -   小聲: (通常不觸發表情，除非結合其他情緒詞)
-   **立繪指令**: `SetPortrait(actorId, pic=X);`
    -   當生成 `EnableCharacterExpression` 時，根據情緒 **追加** `SetPortrait`：
        -   `Anger` -> `pic=2`
        -   `Pain` -> `pic=3`
        -   `Surprise` -> `pic=4`
        -   `Happy` -> `pic=5`
        -   `Dislike` (若有對應情緒詞) -> `pic=6`
        -   其他情緒 (如 `Nervous`, `Meditate`, `Question`, `Idea`, `Proud`) 通常 **不** 改變立繪，除非特別標註。
-   **指令合併**: 多個指令用分號 `;` 連接，例如 `"EnableCharacterExpression(6,Happy);SetPortrait(6,pic=5);"`。

### 4. 狀態恢復

-   **觸發條件**: 如果一個節點 (節點 A) 的 `Sequence` 包含了 `EnableCharacterExpression` 或 `SetPortrait(pic>1)`。
-   **執行位置**: 在所有 `links` 指向的 **下一個節點** (節點 B, C, ...) 的 `Sequence` **開頭** 加入恢復指令。
-   **恢復指令**:
    -   `DisableCharacterExpression(actorId);` (對應節點 A 的 `EnableCharacterExpression`)
    -   `SetPortrait(actorId, pic=1);` (對應節點 A 的 `SetPortrait(pic>1)`)
-   **合併**: 將恢復指令加在下一個節點 `Sequence` 的最前面，用分號與該節點原有的指令（如果有的話）連接。
    *範例*: 若節點 A 是 `{"entryID": 5, "actorID": 6, ..., "Sequence": "EnableCharacterExpression(6,Pain);SetPortrait(6,pic=3);", "links": [6]}`，則節點 6 的 `Sequence` 應為 `"DisableCharacterExpression(6);SetPortrait(6,pic=1);[節點6原有的指令]"`。

### 5. 連結 (links)

-   根據 Markdown 中的對話流向和玩家選項確定 `links` 陣列。
-   線性對話：`links` 指向下一個 `entryID`。
-   玩家選項：`links` 包含所有選項對應的 `entryID`。
-   對話分支匯合：多個節點的 `links` 可以指向同一個 `entryID`。
-   對話結束/離開互動：`links` 為空陣列 `[]`。

### 6. 非對話元素處理

-   Markdown 中的表格、列表、標題、分隔線、任務提示 `[系統提示]`、獲得物品 `△獲得...△`、旁白 `[panel=5]*...*`、演出描述 `（...）` 等，如果不需要直接轉換為對話節點，則**應忽略**。
-   **檢定提示**: `[自動洞悉檢定]` 或 `[魅力檢定]` 等可以轉換為 `actorID: -1` 的節點，`text` 包含檢定資訊，`links` 指向成功和失敗的分支 `entryID`。
-   **場景描述/旁白**: 可以用 `actorID: 0` 或 `2` (根據旁白定義) 來表示，`text` 包含描述內容。

## 注意事項

-   仔細核對 `actorID` 是否正確。
-   確保 `entryID` 連續且唯一。
-   `Sequence` 指令的 `actorId` 務必正確。
-   狀態恢復指令 (`Disable...`, `SetPortrait(pic=1)`) 要加在 **下一個** 節點。
-   `links` 的指向必須準確，避免流程中斷。
-   對於 Markdown 中無法直接對應 JSON 結構的元素（如複雜的條件分支、任務狀態設置），可能需要在 JSON 中添加額外欄位或使用特定指令（需與開發者確認）。 