#if UNITY_EDITOR

using UnityEngine;
using UnityEditor;
using PixelCrushers.DialogueSystem;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;

/// <summary>
/// JSON ⇄ DialogueDatabase 雙向橋接工具。
///
/// 設計前提：Json檔/ 是文案的唯一事實來源，AI 在 IDE（Cursor / Claude Code）裡修改 JSON、
/// 使用者在 IDE 核准 diff 之後，用本工具把變更同步進 Unity。
///
/// 對話名與檔案路徑：
///   - 對話名中的「/」代表子層（Dialogue System 的子選單），對應到磁碟上的子資料夾：
///     對話「小溪村後山/赫連娜娜、張寧」 ⇄ 「&lt;根資料夾&gt;/小溪村後山/赫連娜娜、張寧.json」。
///   - 匯入時以「相對於根資料夾的路徑（去副檔名）」當對話名；沒設根資料夾就只用檔名。
///   - 相容舊扁平檔：以前匯出把「/」換成「_」（小溪村後山_赫連娜娜、張寧.json），
///     匯入時會用「對話名把 / 換成 _」的方式比對，舊檔不用改名也對得到。
///
/// 匯入（同步）：
///   - 對話不存在 → 依 JSON 建立新對話，並在對話上蓋 JsonSource 印記。
///   - 對話已存在 → 依每個節點的 JsonEntryID 印記精準對應，更新欄位、新增節點、
///     移除 JSON 中已刪的節點、依 JSON 重建連線（跨對話的連線會保留）。
///   - 有差異才跳確認視窗，支援 Ctrl+Z 復原；整個資料夾同步時，內容一致的檔案自動略過不問。
///   - 舊資料（沒有 JsonEntryID 印記）：節點數與 JSON 相同時依建立順序對應並補印記；
///     數量不同則中止並提示先「匯出」重建基準檔。
///
/// 匯出：把對話現況倒回 JSON（給 AI 讀取 Unity 目前內容、或替舊對話重建基準檔）。
///   對話名含「/」時寫進對應子資料夾；若同資料夾還留著舊扁平檔會在完成視窗提醒。
///
/// 翻譯：JSON 節點可帶選填欄位 zh_TW / zh_CN / en，匯入時寫入同名多語欄位
///  （zh-TW / zh-CN / en，Localization 型別）；JSON 沒帶時不會清掉資料庫既有翻譯。
///
/// 節點標題（title）：匯出時把節點的 Title 欄位寫成選填欄位 "title"（空的不寫）；
///   匯入時 JSON 有帶 title 才寫入，沒帶不會清掉 Unity 既有標題。
///
/// 自動排版：匯入時新建的節點會自動排進畫布——整段新對話依 START 起的層級由上往下排；
///   既有對話新增的節點排在「連到它的節點」下方，位置被占走就往右挪，不會全部疊在原點。
///   舊版工具建的節點全疊在原點 (0,0)：同步時會連同這些一起排；也可用匯入頁的
///   「把疊在原點的節點排進畫布」一次處理整個資料庫（只改位置、不碰文案）。
/// </summary>
public class DialogueJsonBridge : EditorWindow
{
    private const string JSON_ENTRY_ID_FIELD = "JsonEntryID";
    private const string JSON_SOURCE_FIELD = "JsonSource";

    // 自動排版用：節點大小與間距（對齊 Dialogue Editor 預設節點尺寸）
    private const float NODE_WIDTH = 160f;
    private const float NODE_HEIGHT = 30f;
    private const float NODE_H_SPACING = 200f;
    private const float NODE_V_SPACING = 80f;
    private const float CANVAS_MARGIN = 20f;

    private const string PREF_ROOT = "DialogueJsonBridge.RootPath";
    private const string PREF_EXPORT = "DialogueJsonBridge.ExportPath";

    private DialogueDatabase database;
    private int tabIndex = 0;

    // 文案根資料夾（Json檔/）：子資料夾 = 對話名中的「/」子層；匯入單檔時用它算出相對路徑
    private string jsonRootPath = "";

    // 匯入
    private string importFilePath = "";

    // 匯出
    private int exportConversationIndex = 0;
    private string exportFolderPath = "";

    private Vector2 scrollPos;

    // 舊版文案用表情名稱、新版直接用數字；名稱在此轉成 ID（與 DialogueGenerator.PicKey 相同）
    private static readonly Dictionary<string, int> picStringToID = new Dictionary<string, int>
    {
        { "proud", 1 }, { "Shy", 2 }, { "serious", 3 }, { "hurt", 4 },
        { "mindpain", 5 }, { "tired", 6 }, { "Meditate", 7 }, { "bodypain", 8 },
        { "surprise", 9 }, { "anger", 10 }, { "pain2", 11 }, { "pain", 12 },
        { "expect", 13 }, { "happy", 14 }, { "sad", 15 }, { "angry", 16 },
    };

    // ── JSON 結構（欄位名對齊 Json檔 格式；zh_TW/zh_CN/en 為翻譯選填欄位）──
    [System.Serializable]
    private class JsonEntry
    {
        public int entryID;
        public string actorID = "";
        public string title = "";
        public string text = "";
        public string Sequence = "";
        public string Conditions = "";
        public string Script = "";
        public string Description = "";
        public string zh_TW = "";
        public string zh_CN = "";
        public string en = "";
        public List<int> links = new List<int>();
    }

    [System.Serializable]
    private class JsonEntryList
    {
        public List<JsonEntry> items;
    }

    [MenuItem("Tools/對話輔助工具/JSON 匯入匯出（文案同步）")]
    public static void ShowWindow()
    {
        var window = GetWindow<DialogueJsonBridge>("文案同步");
        window.minSize = new Vector2(560, 400);
    }

    private void OnEnable()
    {
        jsonRootPath = EditorPrefs.GetString(PREF_ROOT, "");
        exportFolderPath = EditorPrefs.GetString(PREF_EXPORT, "");
    }

    private void OnGUI()
    {
        EditorGUILayout.Space(10);
        EditorGUILayout.LabelField("JSON ⇄ 對話資料庫 同步工具", EditorStyles.boldLabel);
        EditorGUILayout.Space(5);

        database = (DialogueDatabase)EditorGUILayout.ObjectField("對話資料庫:", database, typeof(DialogueDatabase), false);
        if (database == null)
        {
            EditorGUILayout.HelpBox("請選擇一個 Dialogue Database", MessageType.Info);
            return;
        }

        EditorGUILayout.Space(6);
        DrawRootFolderField();

        EditorGUILayout.Space(8);
        tabIndex = GUILayout.Toolbar(tabIndex, new[] { "匯入 / 同步", "匯出" });
        EditorGUILayout.Space(8);

        scrollPos = EditorGUILayout.BeginScrollView(scrollPos);
        if (tabIndex == 0) DrawImportTab();
        else DrawExportTab();
        EditorGUILayout.EndScrollView();
    }

    private void DrawRootFolderField()
    {
        EditorGUILayout.BeginHorizontal();
        EditorGUILayout.LabelField("文案根資料夾:", GUILayout.Width(90));
        string newRoot = EditorGUILayout.TextField(jsonRootPath);
        if (GUILayout.Button("瀏覽", GUILayout.Width(55)))
        {
            string picked = EditorUtility.OpenFolderPanel("選擇文案根資料夾（Json檔）", GetDefaultBrowseDir(jsonRootPath), "");
            if (!string.IsNullOrEmpty(picked)) newRoot = picked;
            GUI.FocusControl(null);
        }
        EditorGUILayout.EndHorizontal();
        if (newRoot != jsonRootPath)
        {
            jsonRootPath = newRoot;
            EditorPrefs.SetString(PREF_ROOT, jsonRootPath);
        }
        EditorGUILayout.LabelField("對話名中的「/」= 子資料夾（小溪村後山/赫連娜娜、張寧 ⇄ 小溪村後山/赫連娜娜、張寧.json）。", EditorStyles.miniLabel);
    }

    // ────────────────────────────── 匯入 ──────────────────────────────

    private void DrawImportTab()
    {
        EditorGUILayout.HelpBox(
            "以 JSON 檔為準同步進資料庫：\n" +
            "• 對話名 = 相對於根資料夾的路徑（去副檔名）。找不到同名（或 JsonSource 印記相符）的對話就建立新對話。\n" +
            "• 舊扁平檔（把 / 寫成 _ 的檔名）仍能對到原對話，不必改名。\n" +
            "• 已存在的對話：更新欄位、新增節點、移除 JSON 已刪的節點、依 JSON 重建連線。\n" +
            "• 新建的節點會自動排進畫布（新對話整段分層排；既有對話的新節點排在上游節點下方）。\n" +
            "• 有差異才會列出摘要讓你確認，套用後可 Ctrl+Z 復原；整個資料夾同步時內容一致的檔案自動略過。",
            MessageType.Info);

        EditorGUILayout.Space(4);

        EditorGUILayout.BeginHorizontal();
        EditorGUILayout.LabelField("JSON 檔:", GUILayout.Width(70));
        importFilePath = EditorGUILayout.TextField(importFilePath);
        if (GUILayout.Button("瀏覽", GUILayout.Width(55)))
        {
            string picked = EditorUtility.OpenFilePanel("選擇文案 JSON",
                GetDefaultBrowseDir(string.IsNullOrEmpty(importFilePath) ? jsonRootPath : importFilePath), "json");
            if (!string.IsNullOrEmpty(picked)) importFilePath = picked;
            GUI.FocusControl(null);
        }
        EditorGUILayout.EndHorizontal();

        if (!string.IsNullOrEmpty(importFilePath))
        {
            string key = ResolveConversationKey(importFilePath);
            EditorGUILayout.LabelField($"→ 對話名：{key}", EditorStyles.miniLabel);
            if (!IsUnderRoot(importFilePath))
                EditorGUILayout.LabelField("（檔案不在根資料夾內，只用檔名當對話名；有子層的對話請先設定根資料夾）", EditorStyles.miniLabel);
        }

        GUI.enabled = !string.IsNullOrEmpty(importFilePath);
        if (GUILayout.Button("同步此檔", GUILayout.Height(28)))
        {
            ImportFile(importFilePath);
            AssetDatabase.SaveAssets();
        }
        GUI.enabled = true;

        EditorGUILayout.Space(10);

        GUI.enabled = !string.IsNullOrEmpty(jsonRootPath);
        if (GUILayout.Button("同步整個根資料夾（含子資料夾，有差異才確認）", GUILayout.Height(28)))
        {
            ImportFolder(jsonRootPath);
        }
        GUI.enabled = true;

        EditorGUILayout.Space(10);
        EditorGUILayout.LabelField("舊版工具建的節點會全疊在畫布原點 (0,0)；這顆只改節點位置，不碰任何文案欄位。", EditorStyles.miniLabel);
        if (GUILayout.Button("把疊在原點 (0,0) 的節點排進畫布（整個資料庫）", GUILayout.Height(24)))
        {
            LayoutUnplacedInDatabase();
        }

        EditorGUILayout.Space(6);
        EditorGUILayout.LabelField("舊版工具匯出時沒補印記，來回同步會多長重複節點；原本那個沒有連入、走不到。", EditorStyles.miniLabel);
        if (GUILayout.Button("清掉沒有印記、也沒有連入的死節點（整個資料庫）", GUILayout.Height(24)))
        {
            RemoveUnreachableOrphans();
        }
    }

    /// <summary>
    /// 掃整個資料庫，刪掉「沒有 JsonEntryID 印記」且「沒有任何節點連到它」的節點。
    /// 這些是舊版匯出不補印記造成的死副本（見 AssignJsonIds）：活的那一份帶著印記與連線，
    /// 這一份走不到、也不在 JSON 裡。START（id 0）與任何有連入的節點都不動。
    /// </summary>
    private void RemoveUnreachableOrphans()
    {
        var victims = new Dictionary<Conversation, List<DialogueEntry>>();
        foreach (var c in database.conversations)
        {
            var linked = new HashSet<int>();
            foreach (var e in c.dialogueEntries)
                foreach (var l in e.outgoingLinks)
                    if (l.destinationConversationID == c.id) linked.Add(l.destinationDialogueID);

            var dead = c.dialogueEntries
                .Where(e => e.id != 0
                            && Field.Lookup(e.fields, JSON_ENTRY_ID_FIELD) == null
                            && !linked.Contains(e.id))
                .ToList();
            if (dead.Count > 0) victims[c] = dead;
        }

        if (victims.Count == 0)
        {
            EditorUtility.DisplayDialog("不用清", "資料庫裡沒有「無印記又無連入」的節點。", "確定");
            return;
        }

        int total = victims.Sum(kv => kv.Value.Count);
        string detail = string.Join("\n", victims.Select(kv =>
            $"• {kv.Key.Title}：Entry {string.Join("、", kv.Value.Select(e => e.id))}"));
        if (!EditorUtility.DisplayDialog("刪掉死節點",
            $"{victims.Count} 段對話、共 {total} 個節點沒有印記也沒有連入，要刪掉嗎？\n\n{detail}\n\n" +
            "⚠ 刪掉前請先確認這些不是你自己排在旁邊、還沒接線的草稿。套用後可 Ctrl+Z 復原。", "刪掉", "取消"))
        {
            return;
        }

        Undo.RecordObject(database, "刪掉無印記死節點");
        foreach (var kv in victims)
            foreach (var e in kv.Value)
            {
                kv.Key.dialogueEntries.Remove(e);
                Debug.Log($"  - [{kv.Key.Title}] 移除 Entry {e.id}（無印記、無連入）");
            }
        EditorUtility.SetDirty(database);
        AssetDatabase.SaveAssets();
        Debug.Log($"✓ 已刪掉 {victims.Count} 段對話共 {total} 個死節點。");
    }

    /// <summary>整個資料庫裡疊在原點的節點一次排好；不改任何文案欄位。</summary>
    private void LayoutUnplacedInDatabase()
    {
        var targets = database.conversations.Where(c => c.dialogueEntries.Any(IsUnplaced)).ToList();
        if (targets.Count == 0)
        {
            EditorUtility.DisplayDialog("不用排", "資料庫裡沒有疊在原點 (0,0) 的節點。", "確定");
            return;
        }
        int nodes = targets.Sum(c => c.dialogueEntries.Count(IsUnplaced));
        if (!EditorUtility.DisplayDialog("重排節點座標",
            $"{targets.Count} 段對話、共 {nodes} 個節點疊在原點 (0,0)，要排進畫布嗎？\n\n" +
            string.Join("\n", targets.Take(15).Select(c => "• " + c.Title)) + (targets.Count > 15 ? "\n…" : "") +
            "\n\n只改節點位置，不動文案。套用後可 Ctrl+Z 復原。", "排", "取消"))
        {
            return;
        }

        Undo.RecordObject(database, "重排原點節點");
        foreach (var c in targets) LayoutUnplacedEntries(c, null);
        EditorUtility.SetDirty(database);
        AssetDatabase.SaveAssets();
        Debug.Log($"✓ 已重排 {targets.Count} 段對話、{nodes} 個原點節點。Dialogue Editor 若開著，切換一次對話即可看到新位置。");
    }

    private void ImportFolder(string folder)
    {
        if (!Directory.Exists(folder))
        {
            EditorUtility.DisplayDialog("找不到資料夾", folder, "確定");
            return;
        }

        var files = Directory.GetFiles(folder, "*.json", SearchOption.AllDirectories).OrderBy(f => f).ToList();
        int done = 0, skipped = 0, unchanged = 0;
        foreach (var file in files)
        {
            // 先靜默比對：內容一致的檔案直接略過，不用逐檔確認
            var plan = BuildSyncPlan(file);
            if (plan == null) { skipped++; continue; }
            if (plan.IsUpToDate)
            {
                unchanged++;
                Debug.Log($"「{plan.conversation.Title}」與 {plan.key}.json 一致，自動略過。");
                continue;
            }

            int choice = EditorUtility.DisplayDialogComplex(
                "同步檔案",
                $"要同步「{plan.key}」嗎？\n{file}\n\n{DescribePlan(plan)}",
                "同步", "全部取消", "略過此檔");
            if (choice == 1) break;           // 取消
            if (choice == 2) { skipped++; continue; }

            if (ApplySyncPlan(plan)) done++;
            else skipped++;
        }
        AssetDatabase.SaveAssets();
        EditorUtility.DisplayDialog("完成",
            $"已同步 {done} 檔，略過 {skipped} 檔。\n另有 {unchanged} 檔內容一致，已自動略過。", "確定");
    }

    /// <returns>是否有實際套用變更</returns>
    private bool ImportFile(string path)
    {
        var plan = BuildSyncPlan(path);
        if (plan == null) return false;
        if (plan.IsUpToDate)
        {
            Debug.Log($"「{plan.conversation.Title}」與 {plan.key}.json 一致，無需同步。");
            return false;
        }
        return ApplySyncPlan(plan);
    }

    // ── 同步計畫：先分析差異（不動資料庫），再決定要不要問使用者 ──
    private class SyncPlan
    {
        public string path;
        public string key;
        public List<JsonEntry> jsonEntries;
        public Conversation conversation;   // null = 資料庫沒有這段對話，要新建

        // 以下只在 conversation != null 時有值
        public bool hasStamps;
        public Dictionary<int, DialogueEntry> dbByJsonId;
        public List<JsonEntry> toAdd;
        public List<DialogueEntry> toRemove;
        public List<DialogueEntry> orphans;
        public List<KeyValuePair<JsonEntry, DialogueEntry>> changedPairs;
        public bool linksDiffer;
        /// <summary>對不到印記、但靠 Unity id 認領到的節點；同步時要補印記。</summary>
        public List<int> adopted = new List<int>();

        /// <summary>對話已存在且 JSON 與資料庫完全一致。沒印記的舊資料一律視為需要同步（要補印記）。</summary>
        public bool IsUpToDate =>
            conversation != null && hasStamps && adopted.Count == 0 &&
            changedPairs.Count == 0 && toAdd.Count == 0 && toRemove.Count == 0 && !linksDiffer;
    }

    /// <summary>讀檔、找對話、算差異；只分析不改資料庫。出錯會跳訊息並回傳 null。</summary>
    private SyncPlan BuildSyncPlan(string path)
    {
        if (!File.Exists(path))
        {
            EditorUtility.DisplayDialog("找不到檔案", path, "確定");
            return null;
        }

        List<JsonEntry> jsonEntries = ParseJson(path);
        if (jsonEntries == null) return null;

        string key = ResolveConversationKey(path);
        Conversation conversation = FindConversation(key, out string ambiguity);
        if (ambiguity != null)
        {
            EditorUtility.DisplayDialog("無法判斷對應的對話", ambiguity, "確定");
            return null;
        }

        var plan = new SyncPlan { path = path, key = key, jsonEntries = jsonEntries, conversation = conversation };
        if (conversation == null) return plan;   // 新對話：沒有差異可算
        return AnalyzeUpdate(plan) ? plan : null;
    }

    /// <summary>依計畫套用（新建或更新）；內部會跳確認視窗。</summary>
    private bool ApplySyncPlan(SyncPlan plan)
    {
        if (plan.conversation == null)
            return CreateConversationFromJson(plan.key, plan.jsonEntries);
        return UpdateConversationFromJson(plan);
    }

    /// <summary>資料夾同步的逐檔確認視窗用：一行說明這檔會做什麼。</summary>
    private static string DescribePlan(SyncPlan plan)
    {
        if (plan.conversation == null) return $"（新對話，{plan.jsonEntries.Count} 個節點）";
        if (!plan.hasStamps) return "（首次同步：補 JsonEntryID 印記）";
        var parts = new List<string>();
        if (plan.changedPairs.Count > 0) parts.Add($"更新 {plan.changedPairs.Count}");
        if (plan.toAdd.Count > 0) parts.Add($"新增 {plan.toAdd.Count}");
        if (plan.toRemove.Count > 0) parts.Add($"移除 {plan.toRemove.Count}");
        if (plan.adopted.Count > 0) parts.Add($"認領 {plan.adopted.Count}");
        if (plan.linksDiffer) parts.Add("連線有變");
        return "（" + string.Join("、", parts) + "）";
    }

    private List<JsonEntry> ParseJson(string path)
    {
        try
        {
            string jsonText = File.ReadAllText(path);
            var list = JsonUtility.FromJson<JsonEntryList>("{\"items\":" + jsonText + "}");
            if (list == null || list.items == null || list.items.Count == 0)
            {
                EditorUtility.DisplayDialog("解析失敗", $"JSON 內容為空或格式不符:\n{path}", "確定");
                return null;
            }
            // entryID 重複是文案錯誤，直接擋下
            var dup = list.items.GroupBy(e => e.entryID).FirstOrDefault(g => g.Count() > 1);
            if (dup != null)
            {
                EditorUtility.DisplayDialog("文案錯誤", $"entryID {dup.Key} 重複出現，請先修正 JSON:\n{path}", "確定");
                return null;
            }

            // 文案硬規則：擋下來讓人先修 JSON（JSON 是唯一事實來源，工具不自己動文字）
            var warnings = new List<string>();
            foreach (var e in list.items) CheckEntry(warnings, e.entryID, e.text, e.Sequence);
            if (warnings.Count > 0)
            {
                EditorUtility.DisplayDialog("文案錯誤",
                    $"{Path.GetFileName(path)} 有 {warnings.Count} 處要先修：\n\n" +
                    string.Join("\n", warnings.Take(12)) +
                    (warnings.Count > 12 ? $"\n…另有 {warnings.Count - 12} 處，見 Console" : ""),
                    "確定");
                Debug.LogError($"[{path}] 文案檢查未過：\n  " + string.Join("\n  ", warnings));
                return null;
            }
            return list.items;
        }
        catch (System.Exception e)
        {
            EditorUtility.DisplayDialog("解析失敗", $"{path}\n{e.Message}", "確定");
            return null;
        }
    }

    // ── 檔案路徑 ⇄ 對話名 ──

    /// <summary>
    /// 檔案 → 對話名：在根資料夾內就用相對路徑（去副檔名、分隔符統一成「/」），否則只用檔名。
    /// </summary>
    private string ResolveConversationKey(string filePath)
    {
        string fileName = Path.GetFileNameWithoutExtension(filePath);
        if (!IsUnderRoot(filePath)) return fileName;

        string root = NormalizedRoot();
        string full = Path.GetFullPath(filePath);
        string rel = full.Substring(root.Length);
        string ext = Path.GetExtension(rel);
        if (!string.IsNullOrEmpty(ext)) rel = rel.Substring(0, rel.Length - ext.Length);
        return rel.Replace('\\', '/');
    }

    private bool IsUnderRoot(string filePath)
    {
        if (string.IsNullOrEmpty(jsonRootPath)) return false;
        try
        {
            string root = NormalizedRoot();
            string full = Path.GetFullPath(filePath);
            return full.StartsWith(root, System.StringComparison.OrdinalIgnoreCase);
        }
        catch { return false; }
    }

    private string NormalizedRoot()
    {
        return Path.GetFullPath(jsonRootPath).TrimEnd('\\', '/') + Path.DirectorySeparatorChar;
    }

    /// <summary>
    /// 依對話名找對話：JsonSource 印記 → 標題 → 舊扁平檔相容（對話名把 / 換成 _）→
    /// 沒設根資料夾時，只憑檔名對到唯一的「…/檔名」對話。
    /// 對應到多個對話時回傳 null 並填 ambiguity（呼叫端要中止）。
    /// </summary>
    private Conversation FindConversation(string key, out string ambiguity)
    {
        ambiguity = null;

        foreach (var conv in database.conversations)
            if (Field.LookupValue(conv.fields, JSON_SOURCE_FIELD) == key) return conv;
        var byTitle = database.conversations.FirstOrDefault(c => c.Title == key);
        if (byTitle != null) return byTitle;

        // 含「/」表示已經是完整子層路徑，找不到就是新對話
        if (key.Contains("/")) return null;

        // 舊扁平檔：以前匯出把「/」換成「_」（小溪村後山/赫連娜娜、張寧 → 小溪村後山_赫連娜娜、張寧.json）
        var legacy = database.conversations.Where(c =>
            (c.Title ?? "").Replace('/', '_') == key ||
            (Field.LookupValue(c.fields, JSON_SOURCE_FIELD) ?? "").Replace('/', '_') == key).ToList();
        if (legacy.Count == 1)
        {
            Debug.Log($"「{key}」以舊扁平檔名對應到對話「{legacy[0].Title}」。");
            return legacy[0];
        }
        if (legacy.Count > 1)
        {
            ambiguity = $"檔名「{key}」同時對到多個對話：\n" +
                        string.Join("\n", legacy.Select(c => "• " + c.Title)) +
                        "\n\n請把檔案放進對應的子資料夾（對話名的「/」= 子資料夾）再同步。";
            return null;
        }

        // 檔案放在子資料夾但沒設根資料夾：只憑檔名對到唯一的「…/檔名」對話
        var bySuffix = database.conversations.Where(c => (c.Title ?? "").EndsWith("/" + key)).ToList();
        if (bySuffix.Count == 1)
        {
            Debug.Log($"「{key}」只憑檔名對應到對話「{bySuffix[0].Title}」（建議設定文案根資料夾）。");
            return bySuffix[0];
        }
        if (bySuffix.Count > 1)
        {
            ambiguity = $"檔名「{key}」同時對到多個子層對話：\n" +
                        string.Join("\n", bySuffix.Select(c => "• " + c.Title)) +
                        "\n\n請先設定「文案根資料夾」，讓工具用相對路徑判斷子層。";
            return null;
        }

        return null;
    }

    // ── 建立新對話 ──
    private bool CreateConversationFromJson(string title, List<JsonEntry> jsonEntries)
    {
        if (!EditorUtility.DisplayDialog(
            "建立新對話",
            $"資料庫中沒有「{title}」，將建立新對話（{jsonEntries.Count} 個節點）。" +
            (title.Contains("/") ? "" : "\n\n（對話名取自檔名；若這段對話應該在某個子層底下，請取消、設定文案根資料夾並把檔案放進對應子資料夾。）"),
            "建立", "取消"))
        {
            return false;
        }

        Undo.RecordObject(database, "建立對話：" + title);

        var template = Template.FromDefault();
        int conversationID = template.GetNextConversationID(database);
        Conversation conversation = template.CreateConversation(conversationID, title);
        conversation.ActorID = 1;
        conversation.ConversantID = 2;
        Field.SetValue(conversation.fields, JSON_SOURCE_FIELD, title);
        database.conversations.Add(conversation);

        // START 節點（id 0）
        DialogueEntry startEntry = template.CreateDialogueEntry(0, conversationID, "START");
        startEntry.ActorID = conversation.ActorID;
        startEntry.DialogueText = "開始對話";
        Field.SetValue(startEntry.fields, "Sequence", "");
        conversation.dialogueEntries.Add(startEntry);

        // 依 JSON 順序建節點
        var entryMap = new Dictionary<int, DialogueEntry>();
        foreach (var je in jsonEntries)
        {
            int id = template.GetNextDialogueEntryID(conversation);
            DialogueEntry entry = template.CreateDialogueEntry(id, conversationID, "");
            conversation.dialogueEntries.Add(entry);
            entryMap[je.entryID] = entry;
            WriteEntryFields(entry, je);
        }

        // START 連到 JSON 陣列的第一個節點（不管它的 entryID 從 0 還是 1 起跳）
        ConnectEntries(startEntry, entryMap[jsonEntries[0].entryID]);
        RebuildLinks(conversation, jsonEntries, entryMap);
        AutoLayoutConversation(conversation);

        EditorUtility.SetDirty(database);
        Debug.Log($"✓ 已建立對話「{title}」（ID {conversationID}，{jsonEntries.Count} 個節點）");
        return true;
    }

    // ── 更新既有對話 ──

    /// <summary>算出既有對話與 JSON 的差異填進 plan（不改資料庫）。無法安全對應時跳訊息並回傳 false。</summary>
    private bool AnalyzeUpdate(SyncPlan plan)
    {
        var conversation = plan.conversation;
        var jsonEntries = plan.jsonEntries;
        var dbEntries = conversation.dialogueEntries.Where(e => e.id != 0).ToList();

        // 依 JsonEntryID 印記對應；舊資料沒有印記時退回「依順序」（數量必須一致才安全）
        var dbByJsonId = new Dictionary<int, DialogueEntry>();
        bool hasStamps = dbEntries.Any(e => Field.Lookup(e.fields, JSON_ENTRY_ID_FIELD) != null);

        if (hasStamps)
        {
            var dupStamps = new List<string>();
            foreach (var e in dbEntries)
            {
                var f = Field.Lookup(e.fields, JSON_ENTRY_ID_FIELD);
                if (f == null || !int.TryParse(f.value, out int jid)) continue;
                if (!dbByJsonId.ContainsKey(jid)) dbByJsonId.Add(jid, e);
                else dupStamps.Add($"Entry {e.id}（印記 {jid} 已被 Entry {dbByJsonId[jid].id} 用掉）");
            }
            // 印記重複的副本（Unity 裡複製貼上來的）對不到 JSON，會被當成無印記節點放著不動；
            // 匯出一次會替它們改配新號，之後 JSON 才管得到它們。
            if (dupStamps.Count > 0)
                Debug.LogWarning($"[{conversation.Title}] {dupStamps.Count} 個節點的 JsonEntryID 印記重複，這次同步不會動它們：\n  " +
                                 string.Join("\n  ", dupStamps) + "\n  請先「匯出」這段對話一次，工具會替副本改配新號，再由文案端決定去留。");

            // 認領：JSON 裡對不到印記的 entryID，若剛好等於某個「沒有印記」節點的 Unity id，
            // 那就是補印記之前匯出的那一格——直接認領它並補上印記，不要另外建新節點
            //（另建就是「每來回一次多長一份」的來源，見 AssignJsonIds 的說明）。
            var unstampedById = new Dictionary<int, DialogueEntry>();
            foreach (var e in dbEntries)
                if (Field.Lookup(e.fields, JSON_ENTRY_ID_FIELD) == null) unstampedById[e.id] = e;
            foreach (var je in jsonEntries)
            {
                if (dbByJsonId.ContainsKey(je.entryID)) continue;
                DialogueEntry adopt;
                if (!unstampedById.TryGetValue(je.entryID, out adopt)) continue;
                dbByJsonId[je.entryID] = adopt;
                plan.adopted.Add(je.entryID);
            }
            if (plan.adopted.Count > 0)
                Debug.Log($"[{conversation.Title}] 認領了 {plan.adopted.Count} 個沒有印記的節點（JSON entryID = 該節點的 Unity id）：" +
                          string.Join("、", plan.adopted) + "，同步時會補上印記。");
        }
        else
        {
            if (dbEntries.Count != jsonEntries.Count)
            {
                EditorUtility.DisplayDialog(
                    "無法安全對應",
                    $"「{conversation.Title}」的節點沒有 JsonEntryID 印記（舊資料），且節點數不一致\n" +
                    $"（對話 {dbEntries.Count} vs JSON {jsonEntries.Count}），依順序對應會錯位。\n\n" +
                    "請先用「匯出」把這個對話倒回 JSON 重建基準檔，讓 AI 把修改內容合併到匯出檔後再同步。",
                    "確定");
                return false;
            }
            for (int i = 0; i < dbEntries.Count; i++)
                dbByJsonId[jsonEntries[i].entryID] = dbEntries[i];
        }

        // 分類：更新 / 新增 / 移除
        var toAdd = jsonEntries.Where(je => !dbByJsonId.ContainsKey(je.entryID)).ToList();
        var jsonIds = new HashSet<int>(jsonEntries.Select(je => je.entryID));
        var toRemove = dbByJsonId.Where(kv => !jsonIds.Contains(kv.Key)).Select(kv => kv.Value).ToList();
        // 沒有印記的 DB 節點（手動加的孤兒）不動它，只提醒
        var orphans = dbEntries.Where(e => !dbByJsonId.ContainsValue(e)).ToList();

        var changedPairs = new List<KeyValuePair<JsonEntry, DialogueEntry>>();
        foreach (var je in jsonEntries)
        {
            if (dbByJsonId.TryGetValue(je.entryID, out var entry) && EntryDiffers(entry, je))
                changedPairs.Add(new KeyValuePair<JsonEntry, DialogueEntry>(je, entry));
        }

        plan.hasStamps = hasStamps;
        plan.dbByJsonId = dbByJsonId;
        plan.toAdd = toAdd;
        plan.toRemove = toRemove;
        plan.orphans = orphans;
        plan.changedPairs = changedPairs;
        // 欄位都沒變時連線仍可能有變；有變才算需要同步
        plan.linksDiffer = LinksDiffer(conversation, jsonEntries, dbByJsonId);
        return true;
    }

    /// <summary>列出摘要讓使用者確認，確認後套用 plan。</summary>
    private bool UpdateConversationFromJson(SyncPlan plan)
    {
        var conversation = plan.conversation;
        string key = plan.key;
        var jsonEntries = plan.jsonEntries;
        bool hasStamps = plan.hasStamps;
        var dbByJsonId = plan.dbByJsonId;
        var toAdd = plan.toAdd;
        var toRemove = plan.toRemove;
        var orphans = plan.orphans;
        var changedPairs = plan.changedPairs;

        int unplaced = conversation.dialogueEntries.Count(IsUnplaced);
        string summary =
            $"對話：{conversation.Title}\n檔案：{key}.json\n\n" +
            $"• 內容更新：{changedPairs.Count} 個節點\n" +
            $"• 新增節點：{toAdd.Count} 個{(toAdd.Count > 0 ? $"（entryID: {string.Join(", ", toAdd.Select(x => x.entryID))}）" : "")}\n" +
            $"• 移除節點：{toRemove.Count} 個{(toRemove.Count > 0 ? $"（Entry: {string.Join(", ", toRemove.Select(x => x.id))}）" : "")}\n" +
            $"• 依 JSON 重建連線\n" +
            (plan.adopted.Count > 0 ? $"• 認領無印記節點：{plan.adopted.Count} 個（entryID: {string.Join(", ", plan.adopted)}），補上印記\n" : "") +
            (unplaced > 0 ? $"• 疊在原點 (0,0) 的舊節點 {unplaced} 個，順便排進畫布（只改位置）\n" : "") +
            (orphans.Count > 0 ? $"\n⚠ 有 {orphans.Count} 個無印記節點（Entry: {string.Join(", ", orphans.Select(x => x.id))}）不會被更動。\n" : "") +
            (!hasStamps ? "\n（首次同步：將依順序對應並補上 JsonEntryID 印記）\n" : "") +
            "\n套用後可 Ctrl+Z 復原。";

        if (!EditorUtility.DisplayDialog("確認同步", summary, "套用", "取消")) return false;

        Undo.RecordObject(database, "同步對話：" + conversation.Title);

        var template = Template.FromDefault();

        // 1. 更新既有節點
        foreach (var pair in changedPairs)
        {
            LogEntryChange(conversation, pair.Value, pair.Key);
            WriteEntryFields(pair.Value, pair.Key);
        }
        // 首次同步：所有配對節點補印記
        if (!hasStamps)
            foreach (var je in jsonEntries)
                if (dbByJsonId.TryGetValue(je.entryID, out var e))
                    Field.SetValue(e.fields, JSON_ENTRY_ID_FIELD, je.entryID.ToString());
        // 認領到的節點補印記（內容沒變就不會走 WriteEntryFields，得在這裡補）
        foreach (int jid in plan.adopted)
            if (dbByJsonId.TryGetValue(jid, out var e))
                Field.SetValue(e.fields, JSON_ENTRY_ID_FIELD, jid.ToString());

        // 2. 新增節點
        foreach (var je in toAdd)
        {
            int id = template.GetNextDialogueEntryID(conversation);
            DialogueEntry entry = template.CreateDialogueEntry(id, conversation.id, "");
            conversation.dialogueEntries.Add(entry);
            dbByJsonId[je.entryID] = entry;
            WriteEntryFields(entry, je);
            Debug.Log($"  + 新增 Entry {id}（JSON #{je.entryID}）");
        }

        // 3. 移除節點（其他節點指向它的連線，會在重建連線時一併消失）
        foreach (var entry in toRemove)
        {
            conversation.dialogueEntries.Remove(entry);
            var k = dbByJsonId.FirstOrDefault(kv => kv.Value == entry).Key;
            dbByJsonId.Remove(k);
            Debug.Log($"  - 移除 Entry {entry.id}");
        }

        // 4. 重建連線（保留指向其他對話的連線）
        var startEntry = conversation.GetFirstDialogueEntry();
        RebuildEntryLinks(startEntry, new List<int> { jsonEntries[0].entryID }, dbByJsonId, conversation.id);
        RebuildLinks(conversation, jsonEntries, dbByJsonId);

        // 5. 排版：這次新增的節點，加上舊版工具留在原點 (0,0) 的既有節點，一起排進畫布
        //    （連線建好之後才知道它們的上游在哪）
        var added = toAdd.Where(a => dbByJsonId.ContainsKey(a.entryID)).Select(a => dbByJsonId[a.entryID]);
        int relaid = LayoutUnplacedEntries(conversation, added) - toAdd.Count;
        if (relaid > 0) Debug.Log($"  ↳ 另有 {relaid} 個原本疊在原點的舊節點一併排進畫布。");

        // 對話補上來源印記（= 這次用來對應的檔案路徑鍵）
        Field.SetValue(conversation.fields, JSON_SOURCE_FIELD, key);

        EditorUtility.SetDirty(database);
        Debug.Log($"✓ 已同步「{conversation.Title}」：更新 {changedPairs.Count}、新增 {toAdd.Count}、移除 {toRemove.Count}。");
        return true;
    }

    // ── 節點欄位寫入（匯入共用）──
    private void WriteEntryFields(DialogueEntry entry, JsonEntry je)
    {
        entry.DialogueText = Norm(je.text);

        if (TryResolveActorID(je.actorID, out int actorID)) entry.ActorID = actorID;
        else if (!string.IsNullOrEmpty(je.actorID))
            Debug.LogWarning($"JSON #{je.entryID}: 資料庫找不到角色 '{je.actorID}'，說話者維持原值。");

        entry.Sequence = ProcessSequence(je.Sequence);
        entry.conditionsString = Norm(je.Conditions);
        entry.userScript = Norm(je.Script);

        // 節點標題：JSON 有帶才寫，沒帶不清掉 Unity 既有標題
        if (!string.IsNullOrEmpty(je.title))
            Field.SetValue(entry.fields, "Title", Norm(je.title));

        if (!string.IsNullOrEmpty(je.Description))
            Field.SetValue(entry.fields, "Description", Norm(je.Description));
        else
            entry.fields.RemoveAll(f => f.title == "Description");

        // 翻譯欄位：JSON 有值才寫入，沒帶不清掉既有翻譯
        WriteLocalizedField(entry, "zh-TW", je.zh_TW);
        WriteLocalizedField(entry, "zh-CN", je.zh_CN);
        WriteLocalizedField(entry, "en", je.en);

        Field.SetValue(entry.fields, JSON_ENTRY_ID_FIELD, je.entryID.ToString());
    }

    private void WriteLocalizedField(DialogueEntry entry, string fieldTitle, string value)
    {
        if (string.IsNullOrEmpty(value)) return;
        Field.SetValue(entry.fields, fieldTitle, Norm(value), FieldType.Localization);
    }

    // ── 差異判斷 ──
    private bool EntryDiffers(DialogueEntry entry, JsonEntry je)
    {
        if (Norm(entry.DialogueText) != Norm(je.text)) return true;
        if (TryResolveActorID(je.actorID, out int actorID) && actorID != entry.ActorID) return true;
        if (Norm(entry.Sequence) != Norm(ProcessSequence(je.Sequence))) return true;
        if (Norm(entry.conditionsString) != Norm(je.Conditions)) return true;
        if (Norm(entry.userScript) != Norm(je.Script)) return true;
        if (Norm(Field.LookupValue(entry.fields, "Description")) != Norm(je.Description)) return true;
        if (!string.IsNullOrEmpty(je.title) && Norm(Field.LookupValue(entry.fields, "Title")) != Norm(je.title)) return true;
        if (!string.IsNullOrEmpty(je.zh_TW) && Norm(Field.LookupValue(entry.fields, "zh-TW")) != Norm(je.zh_TW)) return true;
        if (!string.IsNullOrEmpty(je.zh_CN) && Norm(Field.LookupValue(entry.fields, "zh-CN")) != Norm(je.zh_CN)) return true;
        if (!string.IsNullOrEmpty(je.en) && Norm(Field.LookupValue(entry.fields, "en")) != Norm(je.en)) return true;
        return false;
    }

    private void LogEntryChange(Conversation conv, DialogueEntry entry, JsonEntry je)
    {
        if (Norm(entry.DialogueText) != Norm(je.text))
            Debug.Log($"  ~ [{conv.Title}] Entry {entry.id} 文本:\n    舊: {Preview(entry.DialogueText)}\n    新: {Preview(je.text)}");
        else
            Debug.Log($"  ~ [{conv.Title}] Entry {entry.id} 欄位更新（Sequence/Conditions/Script/Description/title/翻譯/說話者）");
    }

    private bool LinksDiffer(Conversation conversation, List<JsonEntry> jsonEntries, Dictionary<int, DialogueEntry> dbByJsonId)
    {
        var entryToJsonId = dbByJsonId.ToDictionary(kv => kv.Value.id, kv => kv.Key);
        foreach (var je in jsonEntries)
        {
            if (!dbByJsonId.TryGetValue(je.entryID, out var entry)) continue;
            var current = entry.outgoingLinks
                .Where(l => l.destinationConversationID == conversation.id && entryToJsonId.ContainsKey(l.destinationDialogueID))
                .Select(l => entryToJsonId[l.destinationDialogueID]).OrderBy(x => x).ToList();
            var target = (je.links ?? new List<int>()).OrderBy(x => x).ToList();
            if (!current.SequenceEqual(target)) return true;
        }
        return false;
    }

    // ── 連線 ──
    private void RebuildLinks(Conversation conversation, List<JsonEntry> jsonEntries, Dictionary<int, DialogueEntry> dbByJsonId)
    {
        foreach (var je in jsonEntries)
        {
            if (!dbByJsonId.TryGetValue(je.entryID, out var entry)) continue;
            RebuildEntryLinks(entry, je.links, dbByJsonId, conversation.id);
        }
    }

    private void RebuildEntryLinks(DialogueEntry entry, List<int> targetJsonIds,
                                   Dictionary<int, DialogueEntry> dbByJsonId, int conversationID)
    {
        // 指向其他對話的連線不歸 JSON 管，原樣保留
        var crossLinks = entry.outgoingLinks
            .Where(l => l.destinationConversationID != conversationID).ToList();

        entry.outgoingLinks.Clear();
        foreach (int jid in targetJsonIds ?? new List<int>())
        {
            if (dbByJsonId.TryGetValue(jid, out var target))
                ConnectEntries(entry, target);
            else
                Debug.LogWarning($"Entry {entry.id} 的連線目標 JSON #{jid} 不存在，已略過。");
        }
        entry.outgoingLinks.AddRange(crossLinks);
    }

    private void ConnectEntries(DialogueEntry source, DialogueEntry destination)
    {
        source.outgoingLinks.Add(new Link(source.conversationID, source.id,
                                          destination.conversationID, destination.id));
    }

    // ── 自動排版 ──

    /// <summary>節點還沒被排過：舊版工具建的節點全疊在原點，寬度 0 則是從沒進過畫布。</summary>
    private static bool IsUnplaced(DialogueEntry e)
    {
        return e.canvasRect.width == 0 || (e.canvasRect.x == 0 && e.canvasRect.y == 0);
    }

    /// <summary>
    /// 整段對話重排：從 START 沿連線做 BFS 分層，同層由左到右、層與層由上往下；
    /// 連不到的節點放在最底層。用在新建對話、以及整段節點全疊在原點的舊對話
    ///（有節點是使用者排過的對話不走這條，改用 LayoutUnplacedEntries 只補沒位置的）。
    /// </summary>
    private void AutoLayoutConversation(Conversation conversation)
    {
        var byId = conversation.dialogueEntries.ToDictionary(e => e.id);
        var depth = new Dictionary<int, int>();
        var queue = new Queue<DialogueEntry>();

        var start = conversation.GetFirstDialogueEntry();
        if (start == null) return;
        depth[start.id] = 0;
        queue.Enqueue(start);
        while (queue.Count > 0)
        {
            var e = queue.Dequeue();
            foreach (var link in e.outgoingLinks)
            {
                if (link.destinationConversationID != conversation.id) continue;
                if (depth.ContainsKey(link.destinationDialogueID)) continue;
                if (!byId.TryGetValue(link.destinationDialogueID, out var target)) continue;
                depth[target.id] = depth[e.id] + 1;
                queue.Enqueue(target);
            }
        }

        int maxDepth = depth.Count > 0 ? depth.Values.Max() : 0;
        foreach (var e in conversation.dialogueEntries)
            if (!depth.ContainsKey(e.id)) depth[e.id] = maxDepth + 1;

        // 同層保留建立順序（= JSON 順序），各層置中對齊最寬的一層
        var layers = conversation.dialogueEntries.GroupBy(e => depth[e.id]).OrderBy(g => g.Key).ToList();
        int widest = layers.Max(g => g.Count());
        float totalWidth = widest * NODE_H_SPACING;
        foreach (var layer in layers)
        {
            var list = layer.ToList();
            float offset = (totalWidth - list.Count * NODE_H_SPACING) / 2f;
            for (int i = 0; i < list.Count; i++)
            {
                list[i].canvasRect = new Rect(
                    CANVAS_MARGIN + offset + i * NODE_H_SPACING,
                    CANVAS_MARGIN + layer.Key * NODE_V_SPACING,
                    NODE_WIDTH, NODE_HEIGHT);
            }
        }
    }

    /// <summary>
    /// 補排沒位置的節點：對話裡疊在原點 (0,0) 的節點，加上 extra（這次新增的），
    /// 各放在第一個連到它的已定位節點正下方，該位置被占就往右挪；每輪先排「上游已定位」的，
    /// 串在一起的新節點會由上往下接著排；全都找不到上游時，拿列表最前面那個放到畫布最底下。
    /// 整段對話全部沒位置時改走 AutoLayoutConversation 整段重排。沿資料庫連線找上游，不靠 JSON。
    /// </summary>
    /// <returns>實際排了幾個節點</returns>
    private int LayoutUnplacedEntries(Conversation conversation, IEnumerable<DialogueEntry> extra)
    {
        var pending = new HashSet<DialogueEntry>(conversation.dialogueEntries.Where(IsUnplaced));
        if (extra != null) foreach (var e in extra) pending.Add(e);
        if (pending.Count == 0) return 0;
        int total = pending.Count;

        if (pending.Count >= conversation.dialogueEntries.Count)
        {
            AutoLayoutConversation(conversation);
            return total;
        }

        var start = conversation.GetFirstDialogueEntry();
        var order = conversation.dialogueEntries.Where(pending.Contains).ToList();

        while (pending.Count > 0)
        {
            DialogueEntry entry = null, parent = null;
            foreach (var candidate in order)
            {
                if (!pending.Contains(candidate)) continue;
                parent = FindPlacedParent(conversation, candidate, pending);
                if (parent != null) { entry = candidate; break; }
            }
            if (entry == null) entry = order.First(pending.Contains);

            Rect rect;
            if (parent != null)
            {
                rect = new Rect(parent.canvasRect.x, parent.canvasRect.y + NODE_V_SPACING, NODE_WIDTH, NODE_HEIGHT);
            }
            else if (entry == start)
            {
                rect = new Rect(CANVAS_MARGIN, CANVAS_MARGIN, NODE_WIDTH, NODE_HEIGHT);   // START 沒上游，放左上
            }
            else
            {
                float bottom = conversation.dialogueEntries
                    .Where(e => !pending.Contains(e))
                    .Select(e => e.canvasRect.y)
                    .DefaultIfEmpty(CANVAS_MARGIN).Max();
                rect = new Rect(CANVAS_MARGIN, bottom + NODE_V_SPACING, NODE_WIDTH, NODE_HEIGHT);
            }

            // 位置被占就往右挪，最多挪 200 格以防萬一
            for (int guard = 0; guard < 200 && IsSpotTaken(conversation, entry, pending, rect); guard++)
                rect.x += NODE_H_SPACING;

            entry.canvasRect = rect;
            pending.Remove(entry);
        }
        return total;
    }

    /// <summary>第一個連到 entry、且已經有位置（不在待排名單）的節點；沒有就回 null。</summary>
    private static DialogueEntry FindPlacedParent(Conversation conversation, DialogueEntry entry, HashSet<DialogueEntry> pending)
    {
        foreach (var e in conversation.dialogueEntries)
        {
            if (e == entry || pending.Contains(e)) continue;
            if (e.outgoingLinks.Any(l => l.destinationConversationID == conversation.id &&
                                         l.destinationDialogueID == entry.id))
                return e;
        }
        return null;
    }

    /// <summary>rect 是否與畫布上任何已定位的節點重疊（待排的新節點還沒位置，不算）。</summary>
    private static bool IsSpotTaken(Conversation conversation, DialogueEntry self, HashSet<DialogueEntry> pending, Rect rect)
    {
        foreach (var e in conversation.dialogueEntries)
        {
            if (e == self || pending.Contains(e)) continue;
            if (Mathf.Abs(e.canvasRect.x - rect.x) < NODE_H_SPACING * 0.9f &&
                Mathf.Abs(e.canvasRect.y - rect.y) < NODE_V_SPACING * 0.9f) return true;
        }
        return false;
    }

    // ── Sequence 處理 ──
    private string ProcessSequence(string input)
    {
        input = Norm(input);
        if (string.IsNullOrEmpty(input)) return input;

        // 舊格式：BeginDiceRoll 沒帶完整包裝才補（新版文案已含 SetContinueMode 四段，不可重複加）
        if (input.Contains("BeginDiceRoll") && !input.Contains("SetContinueMode"))
        {
            input = "SetContinueMode(false);\nSetContinueMode(true)@Message(EndRoll);\nContinue()@Message(EndRoll);\n" + input;
        }

        // 舊格式：pic=表情名稱 → pic=ID（新版文案直接寫數字，查無此鍵時不變動）
        var regex = new System.Text.RegularExpressions.Regex(@"SetPortrait\([^,]+,\s*pic=([^)]+)\)");
        foreach (System.Text.RegularExpressions.Match match in regex.Matches(input))
        {
            string picString = match.Groups[1].Value.Trim();
            if (picStringToID.TryGetValue(picString, out int picID))
                input = input.Replace(match.Value, match.Value.Replace($"pic={picString}", "pic=" + picID));
        }
        return input;
    }

    private bool TryResolveActorID(string actorKey, out int actorID)
    {
        actorID = 0;
        if (string.IsNullOrEmpty(actorKey)) return false;
        actorKey = actorKey.Trim();
        if (int.TryParse(actorKey, out actorID)) return true;
        Actor actor = database.GetActor(actorKey);
        if (actor == null) return false;
        actorID = actor.id;
        return true;
    }

    // ────────────────────────────── 匯出 ──────────────────────────────

    private void DrawExportTab()
    {
        EditorGUILayout.HelpBox(
            "把對話現況倒回 JSON：\n" +
            "• 給 AI 讀取 Unity 目前的實際內容（例如曾在 Unity 內手動改過文字時）。\n" +
            "• 替沒有印記的舊對話重建基準檔（之後的修改都以匯出檔為底）。\n" +
            "• 節點的 Title 會寫成選填欄位 \"title\"（空的不寫）。\n" +
            "• 對話名含「/」會寫進對應子資料夾；若同資料夾還有舊扁平檔（/ 寫成 _）會提醒你刪除。",
            MessageType.Info);

        EditorGUILayout.Space(4);

        var convTitles = database.conversations.Select(c => $"[{c.id}] {c.Title}").ToArray();
        if (convTitles.Length == 0)
        {
            EditorGUILayout.HelpBox("此資料庫沒有任何對話", MessageType.Warning);
            return;
        }
        exportConversationIndex = Mathf.Clamp(exportConversationIndex, 0, convTitles.Length - 1);
        exportConversationIndex = EditorGUILayout.Popup("對話:", exportConversationIndex, convTitles);

        // 沒填輸出資料夾時預設用文案根資料夾
        if (string.IsNullOrEmpty(exportFolderPath) && !string.IsNullOrEmpty(jsonRootPath))
            exportFolderPath = jsonRootPath;

        EditorGUILayout.BeginHorizontal();
        EditorGUILayout.LabelField("輸出資料夾:", GUILayout.Width(80));
        string newExport = EditorGUILayout.TextField(exportFolderPath);
        if (GUILayout.Button("瀏覽", GUILayout.Width(55)))
        {
            string picked = EditorUtility.OpenFolderPanel("選擇輸出資料夾", GetDefaultBrowseDir(exportFolderPath), "");
            if (!string.IsNullOrEmpty(picked)) newExport = picked;
            GUI.FocusControl(null);
        }
        EditorGUILayout.EndHorizontal();
        if (newExport != exportFolderPath)
        {
            exportFolderPath = newExport;
            EditorPrefs.SetString(PREF_EXPORT, exportFolderPath);
        }

        GUI.enabled = !string.IsNullOrEmpty(exportFolderPath);
        if (GUILayout.Button("匯出選取的對話", GUILayout.Height(28)))
        {
            var conv = database.conversations[exportConversationIndex];
            var legacy = new List<string>();
            try
            {
                string path = ExportConversation(conv, exportFolderPath, legacy);
                if (path != null)
                    EditorUtility.DisplayDialog("匯出完成", path + LegacyNote(legacy), "確定");
            }
            catch (System.Exception ex)
            {
                Debug.LogException(ex);
                EditorUtility.DisplayDialog("匯出失敗", $"「{conv.Title}」\n{ex.GetType().Name}: {ex.Message}", "確定");
            }
        }
        if (GUILayout.Button("匯出全部對話", GUILayout.Height(24)))
        {
            if (EditorUtility.DisplayDialog("匯出全部",
                $"將 {database.conversations.Count} 段對話全部匯出到:\n{exportFolderPath}\n\n同名檔案會被覆蓋。", "匯出", "取消"))
            {
                ExportAll(exportFolderPath);
            }
        }
        GUI.enabled = true;
    }

    private void ExportAll(string folder)
    {
        if (!Directory.Exists(folder))
        {
            EditorUtility.DisplayDialog("找不到資料夾", folder, "確定");
            return;
        }

        int n = 0;
        var failed = new List<string>();
        var legacy = new List<string>();
        var conversations = database.conversations.ToList();

        // 每段各自 try/catch：一段出錯不能讓整批中斷（之前任何一段丟例外就整個沒反應）
        for (int i = 0; i < conversations.Count; i++)
        {
            var conv = conversations[i];
            string title = conv.Title ?? $"(ID {conv.id})";
            EditorUtility.DisplayProgressBar("匯出全部對話", $"{i + 1}/{conversations.Count}  {title}", (float)i / conversations.Count);
            try
            {
                if (ExportConversation(conv, folder, legacy) != null) n++;
                else failed.Add($"{title}：略過（見 Console）");
            }
            catch (System.Exception ex)
            {
                Debug.LogException(ex);
                failed.Add($"{title}：{ex.GetType().Name}: {ex.Message}");
            }
        }
        EditorUtility.ClearProgressBar();

        string msg = $"共匯出 {n} / {conversations.Count} 檔到:\n{folder}";
        if (failed.Count > 0)
        {
            msg += $"\n\n⚠ 失敗 {failed.Count} 檔：\n" + string.Join("\n", failed.Take(10).Select(f => "• " + f));
            if (failed.Count > 10) msg += $"\n…另有 {failed.Count - 10} 檔，詳見 Console。";
        }
        msg += LegacyNote(legacy);
        Debug.Log($"匯出全部完成：成功 {n}，失敗 {failed.Count}。");
        EditorUtility.DisplayDialog("匯出完成", msg, "確定");
    }

    private static string LegacyNote(List<string> legacy)
    {
        if (legacy == null || legacy.Count == 0) return "";
        string note = $"\n\n⚠ 有 {legacy.Count} 個舊扁平檔（/ 寫成 _）仍留在資料夾，內容已改寫到子資料夾，請手動刪除舊檔以免重複：\n" +
                      string.Join("\n", legacy.Take(10).Select(p => "• " + Path.GetFileName(p)));
        if (legacy.Count > 10) note += $"\n…另有 {legacy.Count - 10} 檔，詳見 Console。";
        return note;
    }

    /// <returns>輸出檔路徑；失敗回傳 null。legacyFound 會收集同資料夾內殘留的舊扁平檔路徑。</returns>
    private string ExportConversation(Conversation conversation, string folder, List<string> legacyFound = null)
    {
        if (!Directory.Exists(folder))
        {
            EditorUtility.DisplayDialog("找不到資料夾", folder, "確定");
            return null;
        }

        string title = conversation.Title ?? "";
        if (string.IsNullOrWhiteSpace(title))
        {
            Debug.LogWarning($"對話 ID {conversation.id} 沒有標題，無法決定檔名，已略過。");
            return null;
        }

        var dbEntries = conversation.dialogueEntries.Where(e => e.id != 0).ToList();

        // jsonID：優先用印記，否則用 DB entry.id（舊對話首次匯出會以此為準）
        var entryToJsonId = new Dictionary<int, int>();
        AssignJsonIds(conversation, dbEntries, entryToJsonId);

        // 文案硬規則：匯出照實寫出來，但在 Console 點名，讓文案端修 JSON 再同步回來
        var checkWarnings = new List<string>();
        foreach (var e in dbEntries) CheckEntry(checkWarnings, entryToJsonId[e.id], e.DialogueText, e.Sequence);
        if (checkWarnings.Count > 0)
            Debug.LogWarning($"[{title}] 文案檢查有 {checkWarnings.Count} 處（已照實匯出，請在 JSON 修好再同步回來）：\n  " +
                             string.Join("\n  ", checkWarnings));

        var sb = new StringBuilder();
        sb.Append("[\n");
        for (int i = 0; i < dbEntries.Count; i++)
        {
            var e = dbEntries[i];
            sb.Append("  {\n");
            sb.Append($"    \"entryID\": {entryToJsonId[e.id]},\n");
            sb.Append($"    \"actorID\": {JsonStr(GetActorExportName(e.ActorID))},\n");
            AppendIfNotEmpty(sb, "title", Field.LookupValue(e.fields, "Title"));
            sb.Append($"    \"text\": {JsonStr(e.DialogueText)},\n");
            sb.Append($"    \"Sequence\": {JsonStr(e.Sequence)},\n");

            AppendIfNotEmpty(sb, "Conditions", e.conditionsString);
            AppendIfNotEmpty(sb, "Script", e.userScript);
            AppendIfNotEmpty(sb, "Description", Field.LookupValue(e.fields, "Description"));
            AppendIfNotEmpty(sb, "zh_TW", Field.LookupValue(e.fields, "zh-TW"));
            AppendIfNotEmpty(sb, "zh_CN", Field.LookupValue(e.fields, "zh-CN"));
            AppendIfNotEmpty(sb, "en", Field.LookupValue(e.fields, "en"));

            var links = new List<int>();
            foreach (var link in e.outgoingLinks)
            {
                if (link.destinationConversationID != conversation.id)
                {
                    Debug.LogWarning($"[{title}] Entry {e.id} 有跨對話連線（→ Conv {link.destinationConversationID}），未寫入 JSON。");
                    continue;
                }
                if (entryToJsonId.TryGetValue(link.destinationDialogueID, out int jid)) links.Add(jid);
            }
            sb.Append($"    \"links\": [{string.Join(", ", links)}]\n");

            sb.Append(i < dbEntries.Count - 1 ? "  },\n" : "  }\n");
        }
        sb.Append("]\n");

        // 對話名的「/」= 子資料夾；每一層各自清掉檔名不允許的字元
        string path = Path.Combine(folder, TitleToRelativePath(title) + ".json");
        Directory.CreateDirectory(Path.GetDirectoryName(path));
        File.WriteAllText(path, sb.ToString(), new UTF8Encoding(false));
        Debug.Log($"✓ 已匯出「{title}」→ {path}（{dbEntries.Count} 個節點）");

        // 舊版工具把整個標題當檔名、「/」被換成「_」；若那個檔還在就提醒（不主動刪）
        if (title.Contains("/"))
        {
            string legacyPath = Path.Combine(folder, SanitizeSegment(title) + ".json");
            if (File.Exists(legacyPath))
            {
                Debug.LogWarning($"[{title}] 舊扁平檔仍在：{legacyPath}\n  新內容已寫到 {path}，請手動刪除舊檔以免兩份重複。");
                legacyFound?.Add(legacyPath);
            }
        }
        return path;
    }

    /// <summary>
    /// 決定每個節點在 JSON 裡的 entryID，並把缺的印記補寫回資料庫。
    ///
    /// ①**有印記的，印記說了算。** 印記自己重複時（Unity 裡複製貼上節點會連印記一起複製），
    ///   後出現的那個配新號。
    /// ②**沒印記的**（多半是在 Unity 裡手動加的節點）先沿用自己的 Unity id，被占走才配新號，
    ///   **然後一定把決定的號寫回印記**。
    ///
    /// ⚠ ②的「寫回印記」是重點：以前只算號不寫印記，於是匯出的 JSON 有這一格、Unity 那個節點卻
    /// 沒有印記，下次匯入時對不到任何節點，工具就再建一個新的——原節點變成沒有連入的死節點留在圖上，
    /// **每匯出匯入來回一次就多長一份**。2026-09-01 修（水濂洞 349→358→369、武道大會 503→504 即此）。
    /// </summary>
    private void AssignJsonIds(Conversation conversation, List<DialogueEntry> dbEntries, Dictionary<int, int> entryToJsonId)
    {
        var stamped = new List<DialogueEntry>();
        var unstamped = new List<DialogueEntry>();
        foreach (var e in dbEntries)
        {
            var f = Field.Lookup(e.fields, JSON_ENTRY_ID_FIELD);
            if (f != null && int.TryParse(f.value, out int jid)) { entryToJsonId[e.id] = jid; stamped.Add(e); }
            else unstamped.Add(e);
        }
        // 新號要避開既有印記，也要避開沒印記節點會沿用的 Unity id
        int next = entryToJsonId.Values.Concat(dbEntries.Select(e => e.id)).DefaultIfEmpty(0).Max() + 1;

        var used = new HashSet<int>();
        var notes = new List<string>();
        foreach (var e in stamped)                       // ① 印記重複 → 後出現的配新號
        {
            int jid = entryToJsonId[e.id];
            if (used.Add(jid)) continue;
            int fresh = next++;
            entryToJsonId[e.id] = fresh;
            used.Add(fresh);
            Field.SetValue(e.fields, JSON_ENTRY_ID_FIELD, fresh.ToString());
            notes.Add($"Entry {e.id}：印記 {jid} 與別的節點重複 → 改為 {fresh}");
        }
        foreach (var e in unstamped)                     // ② 沒印記 → 補上
        {
            int jid = used.Contains(e.id) ? next++ : e.id;
            entryToJsonId[e.id] = jid;
            used.Add(jid);
            Field.SetValue(e.fields, JSON_ENTRY_ID_FIELD, jid.ToString());
            notes.Add($"Entry {e.id}：原本沒有印記 → 補上 {jid}");
        }
        if (notes.Count == 0) return;
        EditorUtility.SetDirty(database);
        Debug.LogWarning($"[{conversation.Title}] 補寫了 {notes.Count} 個 JsonEntryID 印記：\n  " +
                         string.Join("\n  ", notes) +
                         "\n  沒有印記的節點多半是在 Unity 裡手動加的；補上之後 JSON 才對得回同一個節點。");
    }

    /// <summary>「小溪村後山/赫連娜娜、張寧」→「小溪村後山\赫連娜娜、張寧」（依平台分隔符）。</summary>
    private static string TitleToRelativePath(string title)
    {
        var segments = title.Split('/')
            .Select(SanitizeSegment)
            .Where(s => s.Length > 0)
            .ToArray();
        return string.Join(Path.DirectorySeparatorChar.ToString(), segments);
    }

    /// <summary>單一層檔名：不允許的字元一律換成「_」（與舊版檔名規則一致，不去頭尾空白）。</summary>
    private static string SanitizeSegment(string s)
    {
        var invalid = Path.GetInvalidFileNameChars();
        var sb = new StringBuilder(s.Length);
        foreach (char c in s) sb.Append(invalid.Contains(c) ? '_' : c);
        return sb.ToString();
    }

    private void AppendIfNotEmpty(StringBuilder sb, string key, string value)
    {
        if (string.IsNullOrEmpty(value)) return;
        sb.Append($"    \"{key}\": {JsonStr(value)},\n");
    }

    private string GetActorExportName(int actorID)
    {
        var actor = database.actors.FirstOrDefault(a => a.id == actorID);
        return actor != null ? actor.Name : actorID.ToString();
    }

    // ── 工具 ──
    private static string Norm(string s)
    {
        if (string.IsNullOrEmpty(s)) return "";
        return s.Replace("\r\n", "\n").Replace("\r", "\n");
    }

    private static string JsonStr(string s)
    {
        if (s == null) s = "";
        var sb = new StringBuilder("\"");
        foreach (char c in s)
        {
            switch (c)
            {
                case '"': sb.Append("\\\""); break;
                case '\\': sb.Append("\\\\"); break;
                case '\n': sb.Append("\\n"); break;
                case '\r': break;
                case '\t': sb.Append("\\t"); break;
                default:
                    if (c < 0x20) sb.Append("\\u").Append(((int)c).ToString("x4"));
                    else sb.Append(c);
                    break;
            }
        }
        return sb.Append('"').ToString();
    }

    // ── 文案硬規則檢查（匯入匯出共用）──

    /// <summary>
    /// 兩條規則，違反就記一行警告：
    ///   ①對話開頭不得有空白——遊戲內排版會多吃一次換行。
    ///   ②`LoadLevel(...)` 的下一句一定要是 `Continue()`——換場之後同一格剩下的指令不保證跑得到。
    ///     寫法是讓 LoadLevel 自己占一格（`LoadLevel(X);Continue();`），轉場四段留在前一格。
    /// </summary>
    private static void CheckEntry(List<string> warnings, int entryID, string text, string sequence)
    {
        if (!string.IsNullOrEmpty(text) && char.IsWhiteSpace(text[0]))
            warnings.Add($"#{entryID} 對話開頭有空白：「{Preview(text)}」");

        var cmds = (sequence ?? "").Split(';').Select(c => c.Trim()).Where(c => c.Length > 0).ToList();
        for (int i = 0; i < cmds.Count; i++)
        {
            if (!cmds[i].StartsWith("LoadLevel")) continue;
            string next = i + 1 < cmds.Count ? cmds[i + 1] : "（沒有下一句）";
            if (!next.StartsWith("Continue()"))
                warnings.Add($"#{entryID} LoadLevel 後面必須接 Continue()，現在接的是「{next}」");
        }
    }

    private static string Preview(string s)
    {
        if (string.IsNullOrEmpty(s)) return "（空）";
        s = s.Replace("\n", "⏎");
        return s.Length <= 80 ? s : s.Substring(0, 80) + "...";
    }

    private static string GetDefaultBrowseDir(string current)
    {
        if (!string.IsNullOrEmpty(current))
        {
            try
            {
                string dir = File.Exists(current) ? Path.GetDirectoryName(current) : current;
                if (Directory.Exists(dir)) return dir;
            }
            catch { }
        }
        return Application.streamingAssetsPath;
    }
}

#endif
