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
///   挑對話用「搜尋框＋依資料夾分組的勾選樹」：對話名的「/」就是資料夾，
///   「大地圖/對話」「大地圖/白鹵澤」都收在「大地圖」底下，和磁碟上的 Json/ 一致。
///   每段對話旁邊會標出它和磁碟上那份 JSON 是否一致（● 不同、○ 磁碟還沒有這份檔）；
///   匯出完成時若還有「不同但沒勾」的對話，完成視窗會點名，免得漏匯。
///
/// 匯入確認視窗：除了「幾處不同」，會逐格列出 entryID 與變動的欄位（#12 文字、#40 Sequence…），
///   方便對回 JSON 查問題；同步整個根資料夾時每檔各問一次（套用／略過此檔／全部停止），
///   內容一致的檔案自動略過不問。
///
/// 翻譯：JSON 節點可帶選填欄位 zh_TW / zh_CN / en，匯入時寫入同名多語欄位
///  （zh-TW / zh-CN / en，Localization 型別）；JSON 沒帶時不會清掉資料庫既有翻譯。
///
/// 節點標題（title）：匯出時把節點的 Title 欄位寫成選填欄位 "title"（空的不寫）；
///   匯入時 JSON 有帶 title 才寫入，沒帶不會清掉 Unity 既有標題。
///
/// 自動排版：匯入時新建的節點會自動排進畫布——整段新對話：主線一直線（每格第一條連線接下去的格子
///   排在正下方）、第二條起的連線往右開一欄、匯合的格子排在最長那條分支下面；
///   既有對話預設一格都不動，只把新增的節點排在「連到它的節點」下方，位置被占走就往右挪；
///   匯入頁勾「同步時整段重排畫布」才會把既有對話整段重排（只改座標，可 Ctrl+Z）。
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
    // 同步既有對話時整段重排畫布（只改座標）。預設關：已完成的對話一格都不動，要重排得自己勾起來再匯入。
    private bool relayoutOnSync = false;

    // 匯出：搜尋、勾選、資料夾展開狀態
    private string exportFolderPath = "";
    private string exportSearch = "";
    private readonly HashSet<int> exportSelected = new HashSet<int>();
    private readonly Dictionary<string, bool> exportFoldouts = new Dictionary<string, bool>();

    // 匯出：每段對話與磁碟上那份 JSON 的比對結果（conv.id → 狀態）；null = 還沒比對過
    private enum DiskState { Same, Differs, NoFile, Unreadable }
    private Dictionary<int, DiskState> diskStates;
    private Dictionary<int, string> diskDetails = new Dictionary<int, string>();
    private string diskStatesFolder;

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
            "• 有差異才會列出摘要讓你確認（逐格列出 entryID 與變動的欄位），套用後可 Ctrl+Z 復原。\n" +
            "• 同步整個根資料夾：每檔各問一次「套用／略過此檔／全部停止」，內容一致的檔案自動略過不問。",
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

        relayoutOnSync = EditorGUILayout.ToggleLeft(
            "同步既有對話時整段重排畫布（只改座標、可 Ctrl+Z；預設關，已完成的對話一格都不動）", relayoutOnSync);
        EditorGUILayout.LabelField("新建的對話一律用新排法：主線一直線、分支往右開、匯合格排在最長分支下面。", EditorStyles.miniLabel);
        EditorGUILayout.Space(4);

        GUI.enabled = !string.IsNullOrEmpty(importFilePath);
        if (GUILayout.Button("同步此檔", GUILayout.Height(28)))
        {
            ImportFile(importFilePath);
            AssetDatabase.SaveAssets();
            InvalidateDiskStates();
        }
        GUI.enabled = true;

        EditorGUILayout.Space(10);

        GUI.enabled = !string.IsNullOrEmpty(jsonRootPath);
        if (GUILayout.Button("全部匯入：同步整個根資料夾（含子資料夾；每檔可套用或略過，內容一致的不問）", GUILayout.Height(28)))
        {
            ImportFolder(jsonRootPath);
            InvalidateDiskStates();
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
        var applied = new List<string>();
        var skipped = new List<string>();
        var failed = new List<string>();
        int unchanged = 0;
        bool stopped = false;

        for (int i = 0; i < files.Count; i++)
        {
            string file = files[i];
            // 先靜默比對：內容一致的檔案直接略過，不用逐檔確認
            var plan = BuildSyncPlan(file);
            if (plan == null) { failed.Add(Path.GetFileName(file)); continue; }
            if (plan.IsUpToDate)
            {
                unchanged++;
                Debug.Log($"「{plan.conversation.Title}」與 {plan.key}.json 一致，自動略過。");
                continue;
            }

            // 每檔只問這一次：這裡列出完整摘要（含 entryID），套用時不再跳第二個視窗
            int choice = EditorUtility.DisplayDialogComplex(
                $"同步檔案（{i + 1}/{files.Count}）",
                $"{BuildSyncSummary(plan)}\n\n檔案：{file}",
                "套用", "全部停止", "略過此檔");
            if (choice == 1) { stopped = true; break; }
            if (choice == 2) { skipped.Add(plan.key); continue; }

            if (ApplySyncPlan(plan, confirmed: true)) applied.Add(plan.key);
            else failed.Add(plan.key);
        }
        AssetDatabase.SaveAssets();

        string msg = $"已套用 {applied.Count} 檔，略過 {skipped.Count} 檔，另有 {unchanged} 檔內容一致自動略過。" +
                     (stopped ? "\n（中途按了「全部停止」，後面的檔案沒看。）" : "");
        if (applied.Count > 0) msg += "\n\n已套用：\n" + ListLines(applied, 15);
        if (skipped.Count > 0) msg += "\n\n略過：\n" + ListLines(skipped, 15);
        if (failed.Count > 0) msg += "\n\n⚠ 無法同步（見 Console）：\n" + ListLines(failed, 10);
        Debug.Log($"全部匯入完成：套用 {applied.Count}、略過 {skipped.Count}、一致 {unchanged}、失敗 {failed.Count}。");
        EditorUtility.DisplayDialog("全部匯入完成", msg, "確定");
    }

    /// <summary>「• a\n• b\n…另有 N 項」；視窗塞不下的部分請看 Console。</summary>
    private static string ListLines(IEnumerable<string> items, int max)
    {
        var list = items.ToList();
        string s = string.Join("\n", list.Take(max).Select(x => "• " + x));
        if (list.Count > max) s += $"\n…另有 {list.Count - max} 項，見 Console";
        return s;
    }

    /// <returns>是否有實際套用變更</returns>
    private bool ImportFile(string path)
    {
        var plan = BuildSyncPlan(path);
        if (plan == null) return false;
        if (plan.IsUpToDate)
        {
            Debug.Log($"「{plan.conversation.Title}」與 {plan.key}.json 一致，無需同步。");
            EditorUtility.DisplayDialog("無需同步", $"「{plan.conversation.Title}」與 {plan.key}.json 內容一致。", "確定");
            return false;
        }
        return ApplySyncPlan(plan, confirmed: false);
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
        /// <summary>每個變動節點的 entryID → 變動的欄位名（文字、Sequence、說話者…），給確認視窗列出來對照。</summary>
        public Dictionary<int, List<string>> changedFields = new Dictionary<int, List<string>>();
        /// <summary>連線有變的節點 entryID。</summary>
        public List<int> linkChanged = new List<int>();
        public bool linksDiffer => linkChanged.Count > 0;
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

    /// <summary>依計畫套用（新建或更新）。confirmed=false 時內部會先跳確認視窗；true 表示呼叫端已經問過了。</summary>
    private bool ApplySyncPlan(SyncPlan plan, bool confirmed)
    {
        if (plan.conversation == null)
            return CreateConversationFromJson(plan.key, plan.jsonEntries, confirmed);
        return UpdateConversationFromJson(plan, confirmed);
    }

    /// <summary>
    /// 確認視窗用的完整摘要：新對話／首次同步／更新，更新時逐格列出 entryID 與變動的欄位，
    /// 新增、移除、認領、連線有變的節點也都點名，方便回 JSON 對照。
    /// 視窗塞不下的部分截斷，全文在 Console。
    /// </summary>
    private string BuildSyncSummary(SyncPlan plan)
    {
        if (plan.conversation == null)
        {
            return $"新對話：{plan.key}\n（資料庫沒有這段對話，將建立 {plan.jsonEntries.Count} 個節點）" +
                   (plan.key.Contains("/") ? "" : "\n\n⚠ 對話名取自檔名；若這段對話應該在某個子層底下，請先設定文案根資料夾並把檔案放進對應子資料夾。");
        }

        var conversation = plan.conversation;
        var sb = new StringBuilder();
        sb.Append($"對話：{conversation.Title}\n檔案：{plan.key}.json\n");

        if (!plan.hasStamps)
            sb.Append("\n（首次同步：依順序對應並補上 JsonEntryID 印記）\n");

        // 內容更新：逐格列 entryID＋欄位
        sb.Append($"\n• 內容更新：{plan.changedPairs.Count} 個節點");
        if (plan.changedPairs.Count > 0)
        {
            const int max = 20;
            int shown = 0;
            foreach (var pair in plan.changedPairs)
            {
                if (shown++ >= max) { sb.Append($"\n    …另有 {plan.changedPairs.Count - max} 格，見 Console"); break; }
                int jid = pair.Key.entryID;
                string fields = plan.changedFields.TryGetValue(jid, out var names) ? string.Join("、", names) : "？";
                sb.Append($"\n    #{jid}（{fields}）");
            }
        }

        sb.Append($"\n• 新增節點：{plan.toAdd.Count} 個");
        if (plan.toAdd.Count > 0) sb.Append($"\n    {IdList(plan.toAdd.Select(x => x.entryID), 30)}");

        sb.Append($"\n• 移除節點：{plan.toRemove.Count} 個");
        if (plan.toRemove.Count > 0)
            sb.Append($"\n    {IdList(plan.toRemove.Select(x => StampOf(x)), 30)}（括號內是 Unity Entry id）");

        if (plan.adopted.Count > 0)
            sb.Append($"\n• 認領無印記節點：{plan.adopted.Count} 個，補上印記\n    {IdList(plan.adopted, 30)}");

        if (plan.linksDiffer)
            sb.Append($"\n• 連線有變：{plan.linkChanged.Count} 個節點\n    {IdList(plan.linkChanged, 30)}");
        else
            sb.Append("\n• 連線：無變動（仍會依 JSON 重建一次）");

        int unplaced = conversation.dialogueEntries.Count(IsUnplaced);
        if (relayoutOnSync)
            sb.Append("\n• 整段重排畫布（已勾「同步時整段重排」；只改座標，主線一直線、分支往右開）");
        else if (unplaced > 0)
            sb.Append($"\n• 疊在原點 (0,0) 的舊節點 {unplaced} 個，順便排進畫布（只改位置）");

        if (plan.orphans.Count > 0)
            sb.Append($"\n\n⚠ 有 {plan.orphans.Count} 個無印記節點不會被更動（Unity Entry: {string.Join(", ", plan.orphans.Take(30).Select(x => x.id))}{(plan.orphans.Count > 30 ? "…" : "")}）");

        sb.Append("\n\n套用後可 Ctrl+Z 復原。");
        return sb.ToString();
    }

    /// <summary>「#12、#40、#77…」；超過 max 個就截斷。</summary>
    private static string IdList(IEnumerable<int> ids, int max)
    {
        var list = ids.ToList();
        string s = string.Join("、", list.Take(max).Select(i => "#" + i));
        if (list.Count > max) s += $"…另有 {list.Count - max} 個";
        return s;
    }

    private static string IdList(IEnumerable<string> ids, int max)
    {
        var list = ids.ToList();
        string s = string.Join("、", list.Take(max));
        if (list.Count > max) s += $"…另有 {list.Count - max} 個";
        return s;
    }

    /// <summary>移除清單用：「#印記(Entry id)」，沒印記就只有 Entry id。</summary>
    private static string StampOf(DialogueEntry e)
    {
        var f = Field.Lookup(e.fields, JSON_ENTRY_ID_FIELD);
        return f != null && !string.IsNullOrEmpty(f.value) ? $"#{f.value}({e.id})" : $"Entry {e.id}";
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
    private bool CreateConversationFromJson(string title, List<JsonEntry> jsonEntries, bool confirmed)
    {
        if (!confirmed && !EditorUtility.DisplayDialog(
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
        var diffLog = new StringBuilder();
        foreach (var je in jsonEntries)
        {
            if (!dbByJsonId.TryGetValue(je.entryID, out var entry)) continue;
            var diffs = FieldDiffs(entry, je);
            if (diffs.Count == 0) continue;
            changedPairs.Add(new KeyValuePair<JsonEntry, DialogueEntry>(je, entry));
            plan.changedFields[je.entryID] = diffs.Select(d => d.name).ToList();
            // 確認視窗只放得下欄位名；舊值／新值全文印在 Console，點開就能逐字比對（只印訊息，不改資料）
            diffLog.Append($"\nJSON #{je.entryID}（Unity Entry {entry.id}）\n{DescribeDiff(diffs)}");
        }
        if (changedPairs.Count > 0)
            Debug.Log($"[{conversation.Title}] {changedPairs.Count} 格有變更（JSON 與 Unity 逐欄比對）：{diffLog}");

        plan.hasStamps = hasStamps;
        plan.dbByJsonId = dbByJsonId;
        plan.toAdd = toAdd;
        plan.toRemove = toRemove;
        plan.orphans = orphans;
        plan.changedPairs = changedPairs;
        // 欄位都沒變時連線仍可能有變；有變才算需要同步
        plan.linkChanged = LinkDiffIds(conversation, jsonEntries, dbByJsonId);
        if (plan.linkChanged.Count > 0)
            Debug.Log($"[{conversation.Title}] 連線有變的節點：{IdList(plan.linkChanged, 50)}");
        return true;
    }

    /// <summary>列出摘要讓使用者確認（confirmed=true 表示呼叫端已問過），確認後套用 plan。</summary>
    private bool UpdateConversationFromJson(SyncPlan plan, bool confirmed)
    {
        var conversation = plan.conversation;
        string key = plan.key;
        var jsonEntries = plan.jsonEntries;
        bool hasStamps = plan.hasStamps;
        var dbByJsonId = plan.dbByJsonId;
        var toAdd = plan.toAdd;
        var toRemove = plan.toRemove;
        var changedPairs = plan.changedPairs;

        if (!confirmed && !EditorUtility.DisplayDialog("確認同步", BuildSyncSummary(plan), "套用", "取消")) return false;

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

        // 5. 排版（連線建好之後才知道上游在哪）
        //    預設：只排這次新增的節點與舊版工具留在原點 (0,0) 的節點，使用者排過的一格都不動。
        //    勾了「同步時整段重排」才整段重排（只改座標）。
        if (relayoutOnSync)
        {
            AutoLayoutConversation(conversation);
            Debug.Log($"  ↳ 依「同步時整段重排」把「{conversation.Title}」整段重排畫布（只改座標）。");
        }
        else
        {
            var added = toAdd.Where(a => dbByJsonId.ContainsKey(a.entryID)).Select(a => dbByJsonId[a.entryID]);
            int relaid = LayoutUnplacedEntries(conversation, added) - toAdd.Count;
            if (relaid > 0) Debug.Log($"  ↳ 另有 {relaid} 個原本疊在原點的舊節點一併排進畫布。");
        }

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

    // ── 差異判斷：規則只寫在 FieldDiffs 一處（文字、說話者、Sequence、Conditions、Script、Description；
    //    title／zh_TW／zh_CN／en 只在 JSON 有帶時才比，沒帶不算不同、匯入也不會清掉）──
    private bool EntryDiffers(DialogueEntry entry, JsonEntry je)
    {
        return FieldDiffs(entry, je).Count > 0;
    }

    // ── 逐欄差異：確認視窗列欄位名，Console 印舊值／新值 ──
    private class FieldDiff
    {
        public string name;   // 文字、說話者、Sequence…
        public string unity;  // Unity 現值（顯示用）
        public string json;   // JSON 值（顯示用）
    }

    private List<FieldDiff> FieldDiffs(DialogueEntry entry, JsonEntry je)
    {
        var diffs = new List<FieldDiff>();
        void Cmp(string name, string db, string js)
        {
            if (Norm(db) != Norm(js))
                diffs.Add(new FieldDiff { name = name, unity = Visible(db), json = Visible(js) });
        }

        Cmp("文字", entry.DialogueText, je.text);
        if (TryResolveActorID(je.actorID, out int actorID) && actorID != entry.ActorID)
        {
            string key = (je.actorID ?? "").Trim();
            int sameName = database.actors.Count(a => a.Name == key);
            diffs.Add(new FieldDiff
            {
                name = "說話者",
                unity = $"id {entry.ActorID}（{GetActorExportName(entry.ActorID)}）",
                json = $"'{je.actorID}' → 查到 id {actorID}；資料庫裡叫「{key}」的角色共 {sameName} 個",
            });
        }
        Cmp("Sequence", entry.Sequence, ProcessSequence(je.Sequence));
        Cmp("Conditions", entry.conditionsString, je.Conditions);
        Cmp("Script", entry.userScript, je.Script);
        Cmp("Description", Field.LookupValue(entry.fields, "Description"), je.Description);
        if (!string.IsNullOrEmpty(je.title)) Cmp("title", Field.LookupValue(entry.fields, "Title"), je.title);
        if (!string.IsNullOrEmpty(je.zh_TW)) Cmp("zh_TW", Field.LookupValue(entry.fields, "zh-TW"), je.zh_TW);
        if (!string.IsNullOrEmpty(je.zh_CN)) Cmp("zh_CN", Field.LookupValue(entry.fields, "zh-CN"), je.zh_CN);
        if (!string.IsNullOrEmpty(je.en)) Cmp("en", Field.LookupValue(entry.fields, "en"), je.en);
        return diffs;
    }

    private static string DescribeDiff(List<FieldDiff> diffs)
    {
        if (diffs.Count == 0) return "  （逐欄找不到差異）";
        return string.Join("\n", diffs.Select(d => $"  · {d.name}\n      Unity：{d.unity}\n      JSON ：{d.json}"));
    }

    /// <summary>把看不見的控制字元標出來，診斷用。</summary>
    private static string Visible(string s)
    {
        if (s == null) return "(null)";
        return "「" + s.Replace("\r", "⟨CR⟩").Replace("\n", "⟨LF⟩").Replace("\t", "⟨TAB⟩") + "」";
    }

    private void LogEntryChange(Conversation conv, DialogueEntry entry, JsonEntry je)
    {
        if (Norm(entry.DialogueText) != Norm(je.text))
            Debug.Log($"  ~ [{conv.Title}] Entry {entry.id} 文本:\n    舊: {Preview(entry.DialogueText)}\n    新: {Preview(je.text)}");
        else
            Debug.Log($"  ~ [{conv.Title}] Entry {entry.id} 欄位更新（Sequence/Conditions/Script/Description/title/翻譯/說話者）");
    }

    /// <summary>連線與 JSON 不同的節點 entryID（空清單 = 連線全部一致）。</summary>
    private List<int> LinkDiffIds(Conversation conversation, List<JsonEntry> jsonEntries, Dictionary<int, DialogueEntry> dbByJsonId)
    {
        var changed = new List<int>();
        var entryToJsonId = dbByJsonId.ToDictionary(kv => kv.Value.id, kv => kv.Key);
        foreach (var je in jsonEntries)
        {
            if (!dbByJsonId.TryGetValue(je.entryID, out var entry)) continue;
            var current = entry.outgoingLinks
                .Where(l => l.destinationConversationID == conversation.id && entryToJsonId.ContainsKey(l.destinationDialogueID))
                .Select(l => entryToJsonId[l.destinationDialogueID]).OrderBy(x => x).ToList();
            var target = (je.links ?? new List<int>()).OrderBy(x => x).ToList();
            if (!current.SequenceEqual(target)) changed.Add(je.entryID);
        }
        return changed;
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
    /// 整段對話重排（新建對話、整段疊在原點的舊對話、以及勾了「同步時整段重排」的既有對話）：
    ///   · 主線一直線：每格「第一條連線」接下去的格子排在同一欄正下方，第二條起的連線各自往右開一欄，
    ///     每條分支保留自己子樹的寬度，鄰近的分支不會交錯。
    ///   · 高度用「從 START 算起的最長路徑」，分支匯合的格子會排在最長那條分支的下面，箭頭不往上跑。
    ///   · 往回指的連線（迴圈）不參與定位。
    ///   · 沒有任何連入的格子是另一個入口（箱庭對話常由遊戲直接跳進某一格），各自成一塊往下排、往右並列，
    ///     不會全堆在最底下一列（五原障 378 格只有 3 個入口，主體掛在 #40、#100 下面）。
    /// 只改座標，不動任何文案欄位。既有對話預設不走這條（見 relayoutOnSync）。
    /// </summary>
    private void AutoLayoutConversation(Conversation conversation)
    {
        var byId = conversation.dialogueEntries.ToDictionary(e => e.id);
        var start = conversation.GetFirstDialogueEntry();
        if (start == null) return;

        // 1. DFS：往前的連線（去掉迴圈邊與跨對話）、第一次走到的格子歸誰（DFS 樹）、完成順序
        var forward = new Dictionary<int, List<int>>();
        var tree = new Dictionary<int, List<int>>();
        var state = new Dictionary<int, int>();          // 0 未訪、1 進行中、2 完成
        var finish = new List<int>();                    // 完成順序：子先於父
        void Dfs(DialogueEntry e)
        {
            state[e.id] = 1;
            var next = new List<int>();
            var kids = new List<int>();
            foreach (var link in e.outgoingLinks)
            {
                if (link.destinationConversationID != conversation.id) continue;
                if (!byId.TryGetValue(link.destinationDialogueID, out var t)) continue;
                state.TryGetValue(t.id, out int s);
                if (s == 1) continue;                    // 往回指：不參與定位
                if (next.Contains(t.id)) continue;
                next.Add(t.id);
                if (s == 0) { kids.Add(t.id); Dfs(t); }
            }
            forward[e.id] = next;
            tree[e.id] = kids;
            state[e.id] = 2;
            finish.Add(e.id);
        }
        // 根：START 之外，沒有任何連入的格子也是入口（箱庭對話常由遊戲直接跳進某一格），
        //     各自成一塊往下排、往右並列；最後只剩迴圈裡互相連的格子，也各挑一格當根。
        var hasIncoming = new HashSet<int>();
        foreach (var e in conversation.dialogueEntries)
            foreach (var link in e.outgoingLinks)
                if (link.destinationConversationID == conversation.id) hasIncoming.Add(link.destinationDialogueID);
        var roots = new List<int> { start.id };
        Dfs(start);
        foreach (var e in conversation.dialogueEntries)
            if (!state.ContainsKey(e.id) && !hasIncoming.Contains(e.id)) { roots.Add(e.id); Dfs(e); }
        foreach (var e in conversation.dialogueEntries)
            if (!state.ContainsKey(e.id)) { roots.Add(e.id); Dfs(e); }

        // 2. 深度 = 從各自的根算起的最長路徑（完成順序反過來就是拓樸序，跨根的邊也成立）
        var depth = new Dictionary<int, int>();
        foreach (int r in roots) depth[r] = 0;
        for (int i = finish.Count - 1; i >= 0; i--)
        {
            int id = finish[i];
            if (!depth.TryGetValue(id, out int d)) continue;
            foreach (int c in forward[id])
                if (!depth.TryGetValue(c, out int cd) || cd < d + 1) depth[c] = d + 1;
        }

        // 3. 欄：每格的子樹寬度 = 各子樹寬度相加（至少 1）；第一個孩子接在同一欄，之後的孩子各往右挪前面子樹的寬度
        var width = new Dictionary<int, int>();
        foreach (int id in finish)
            width[id] = Mathf.Max(1, tree[id].Sum(c => width[c]));
        var column = new Dictionary<int, int>();
        void Assign(int id, int col)
        {
            column[id] = col;
            foreach (int c in tree[id])
            {
                Assign(c, col);
                col += width[c];
            }
        }
        int nextCol = 0;
        foreach (int r in roots)
        {
            Assign(r, nextCol);
            nextCol += width[r];
        }

        // 4. 保險：理論上每格都有座標了；萬一漏了就放最底下一列
        int maxDepth = depth.Values.Max();
        foreach (var e in conversation.dialogueEntries)
        {
            if (depth.ContainsKey(e.id) && column.ContainsKey(e.id)) continue;
            depth[e.id] = maxDepth + 1;
            column[e.id] = nextCol++;
        }

        foreach (var e in conversation.dialogueEntries)
        {
            e.canvasRect = new Rect(
                CANVAS_MARGIN + column[e.id] * NODE_H_SPACING,
                CANVAS_MARGIN + depth[e.id] * NODE_V_SPACING,
                NODE_WIDTH, NODE_HEIGHT);
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
            "• 對話名的「/」= 資料夾：清單依資料夾分組，「大地圖/對話」「大地圖/白鹵澤」都收在「大地圖」底下，和磁碟上的 Json/ 一致。\n" +
            "• ● = 這段對話和磁碟上的 JSON 不同（還沒匯出）；○ = 磁碟上還沒有這份檔。匯出完成時會點名「不同但沒勾」的對話。\n" +
            "• 節點的 Title 會寫成選填欄位 \"title\"（空的不寫）；同資料夾若還有舊扁平檔（/ 寫成 _）會提醒你刪除。",
            MessageType.Info);

        EditorGUILayout.Space(4);

        if (database.conversations.Count == 0)
        {
            EditorGUILayout.HelpBox("此資料庫沒有任何對話", MessageType.Warning);
            return;
        }

        // 沒填輸出資料夾時預設用文案根資料夾
        if (string.IsNullOrEmpty(exportFolderPath) && !string.IsNullOrEmpty(jsonRootPath))
            exportFolderPath = jsonRootPath;

        DrawExportFolderField();
        EnsureDiskStates();

        EditorGUILayout.Space(6);
        DrawExportToolbar();
        EditorGUILayout.Space(4);
        DrawExportTree();
        EditorGUILayout.Space(8);
        DrawExportButtons();
    }

    private void DrawExportFolderField()
    {
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
    }

    // ── 匯出：搜尋、批次勾選、狀態列 ──

    private void DrawExportToolbar()
    {
        EditorGUILayout.BeginHorizontal();
        EditorGUILayout.LabelField("搜尋:", GUILayout.Width(40));
        exportSearch = EditorGUILayout.TextField(exportSearch);
        if (GUILayout.Button("清除", GUILayout.Width(45))) { exportSearch = ""; GUI.FocusControl(null); }
        EditorGUILayout.EndHorizontal();
        EditorGUILayout.LabelField("關鍵字用空白隔開、要全部命中（打「主線 9月」即可）；也可直接打對話 ID。搜尋時資料夾全部展開。", EditorStyles.miniLabel);

        var visible = FilteredConversations().ToList();
        int dirtyAll = database.conversations.Count(c => IsDirty(c.id));
        int dirtyUnselected = database.conversations.Count(c => IsDirty(c.id) && !exportSelected.Contains(c.id));

        EditorGUILayout.BeginHorizontal();
        if (GUILayout.Button($"全選符合的（{visible.Count}）"))
            foreach (var c in visible) exportSelected.Add(c.id);
        if (GUILayout.Button("全部清除")) exportSelected.Clear();
        GUI.enabled = dirtyAll > 0;
        if (GUILayout.Button($"勾選有變動的（{dirtyAll}）"))
            foreach (var c in database.conversations) if (IsDirty(c.id)) exportSelected.Add(c.id);
        GUI.enabled = true;
        if (GUILayout.Button("重新比對磁碟", GUILayout.Width(95))) RefreshDiskStates();
        EditorGUILayout.EndHorizontal();

        string status;
        if (diskStates == null || diskStates.Count == 0) status = "（輸出資料夾不存在，無法和磁碟上的 JSON 比對）";
        else if (dirtyAll == 0) status = "✓ 所有對話都和磁碟上的 JSON 一致";
        else status = $"● {dirtyAll} 段對話和磁碟上的 JSON 不同（含磁碟還沒有檔的），其中 {dirtyUnselected} 段還沒勾。";
        var style = new GUIStyle(EditorStyles.miniLabel);
        if (dirtyUnselected > 0) style.normal.textColor = DirtyColor;
        EditorGUILayout.LabelField(status, style);
    }

    /// <summary>搜尋：關鍵字用空白隔開、全部要命中對話名（不分大小寫），或剛好等於對話 ID。</summary>
    private IEnumerable<Conversation> FilteredConversations()
    {
        var keywords = (exportSearch ?? "").Split(new[] { ' ', '　' }, System.StringSplitOptions.RemoveEmptyEntries);
        foreach (var c in database.conversations)
        {
            if (keywords.Length == 0) { yield return c; continue; }
            string title = c.Title ?? "";
            string id = c.id.ToString();
            if (keywords.All(k => title.IndexOf(k, System.StringComparison.OrdinalIgnoreCase) >= 0 || id == k))
                yield return c;
        }
    }

    // ── 匯出：依資料夾分組的勾選樹（對話名的「/」= 一層資料夾）──

    private class ExportNode
    {
        public string name;                                         // 這一層的名字（顯示用）
        public string path;                                         // 從根到這層的完整路徑（記展開狀態用）
        public List<ExportNode> folders = new List<ExportNode>();
        public List<Conversation> convs = new List<Conversation>();
        public IEnumerable<Conversation> AllConvs => convs.Concat(folders.SelectMany(f => f.AllConvs));
    }

    private ExportNode BuildExportTree(IEnumerable<Conversation> conversations)
    {
        var root = new ExportNode { name = "", path = "" };
        foreach (var c in conversations)
        {
            var segs = (c.Title ?? "").Split('/');
            var node = root;
            for (int i = 0; i < segs.Length - 1; i++)
            {
                string seg = segs[i];
                var child = node.folders.FirstOrDefault(f => f.name == seg);
                if (child == null)
                {
                    child = new ExportNode { name = seg, path = node.path.Length == 0 ? seg : node.path + "/" + seg };
                    node.folders.Add(child);
                }
                node = child;
            }
            node.convs.Add(c);
        }
        SortTree(root);
        return root;
    }

    /// <summary>資料夾與對話都照檔案總管的自然排序（01、02…10）。</summary>
    private static void SortTree(ExportNode node)
    {
        node.folders.Sort((a, b) => EditorUtility.NaturalCompare(a.name, b.name));
        node.convs.Sort((a, b) => EditorUtility.NaturalCompare(a.Title ?? "", b.Title ?? ""));
        foreach (var f in node.folders) SortTree(f);
    }

    private void DrawExportTree()
    {
        var visible = FilteredConversations().ToList();
        if (visible.Count == 0)
        {
            EditorGUILayout.HelpBox("沒有符合的對話", MessageType.None);
            return;
        }
        var root = BuildExportTree(visible);
        bool searching = !string.IsNullOrWhiteSpace(exportSearch);
        foreach (var f in root.folders) DrawFolder(f, 0, searching);
        if (root.convs.Count > 0)
        {
            // 對話名沒有「/」的放最下面，自成一組
            var flat = new ExportNode { name = "（根層：對話名沒有「/」）", path = "root", convs = root.convs };
            DrawFolder(flat, 0, searching);
        }
    }

    private void DrawFolder(ExportNode node, int depth, bool forceOpen)
    {
        var all = node.AllConvs.ToList();
        int selected = all.Count(c => exportSelected.Contains(c.id));
        int dirty = all.Count(c => IsDirty(c.id));

        EditorGUILayout.BeginHorizontal();
        GUILayout.Space(depth * 16);
        bool open = forceOpen || (exportFoldouts.TryGetValue(node.path, out bool remembered) && remembered);
        string label = $"{node.name}   （勾 {selected} / {all.Count}{(dirty > 0 ? $"，● {dirty}" : "")}）";
        bool newOpen = EditorGUILayout.Foldout(open, label, true);
        if (!forceOpen && newOpen != open) exportFoldouts[node.path] = newOpen;
        GUILayout.FlexibleSpace();
        if (GUILayout.Button("整組勾選", EditorStyles.miniButtonLeft, GUILayout.Width(64)))
            foreach (var c in all) exportSelected.Add(c.id);
        if (GUILayout.Button("整組取消", EditorStyles.miniButtonRight, GUILayout.Width(64)))
            foreach (var c in all) exportSelected.Remove(c.id);
        EditorGUILayout.EndHorizontal();

        if (!newOpen) return;
        foreach (var f in node.folders) DrawFolder(f, depth + 1, forceOpen);
        foreach (var c in node.convs) DrawConversationRow(c, depth + 1);
    }

    private void DrawConversationRow(Conversation c, int depth)
    {
        EditorGUILayout.BeginHorizontal();
        GUILayout.Space(depth * 16 + 4);
        bool was = exportSelected.Contains(c.id);
        bool now = EditorGUILayout.Toggle(was, GUILayout.Width(18));
        if (now != was)
        {
            if (now) exportSelected.Add(c.id);
            else exportSelected.Remove(c.id);
        }

        string title = c.Title ?? "";
        string leaf = title.Contains("/") ? title.Substring(title.LastIndexOf('/') + 1) : title;
        EditorGUILayout.LabelField($"[{c.id}] {leaf}");
        DrawDiskMarker(c.id);
        EditorGUILayout.EndHorizontal();
    }

    private static readonly Color DirtyColor = new Color(0.95f, 0.55f, 0.1f);

    /// <summary>對話旁的磁碟狀態標記；滑鼠停在上面會列出是哪幾格不同。</summary>
    private void DrawDiskMarker(int convId)
    {
        if (diskStates == null || !diskStates.TryGetValue(convId, out var state) || state == DiskState.Same) return;
        diskDetails.TryGetValue(convId, out string detail);
        string mark;
        Color color;
        switch (state)
        {
            case DiskState.Differs: mark = "● 與磁碟不同"; color = DirtyColor; break;
            case DiskState.NoFile: mark = "○ 磁碟還沒有"; color = Color.gray; break;
            default: mark = "✕ 讀不了"; color = new Color(0.9f, 0.25f, 0.25f); break;
        }
        var style = new GUIStyle(EditorStyles.miniLabel);
        style.normal.textColor = color;
        EditorGUILayout.LabelField(new GUIContent(mark, detail ?? ""), style, GUILayout.Width(92));
    }

    private void DrawExportButtons()
    {
        var selected = database.conversations.Where(c => exportSelected.Contains(c.id)).ToList();
        bool canExport = !string.IsNullOrEmpty(exportFolderPath);

        GUI.enabled = canExport && selected.Count > 0;
        if (GUILayout.Button($"匯出勾選的 {selected.Count} 段對話", GUILayout.Height(28)))
        {
            bool go = selected.Count == 1 || EditorUtility.DisplayDialog("匯出勾選的對話",
                $"將 {selected.Count} 段對話匯出到:\n{exportFolderPath}\n\n{ListLines(selected.Select(c => c.Title), 20)}\n\n同名檔案會被覆蓋。",
                "匯出", "取消");
            if (go) ExportConversations(selected, exportFolderPath, "匯出勾選的對話");
        }
        GUI.enabled = canExport;
        if (GUILayout.Button("匯出全部對話", GUILayout.Height(24)))
        {
            if (EditorUtility.DisplayDialog("匯出全部",
                $"將 {database.conversations.Count} 段對話全部匯出到:\n{exportFolderPath}\n\n同名檔案會被覆蓋。", "匯出", "取消"))
            {
                ExportConversations(database.conversations.ToList(), exportFolderPath, "匯出全部對話");
            }
        }
        GUI.enabled = true;
    }

    // ── 匯出：與磁碟上的 JSON 比對（只讀不寫）──

    private bool IsDirty(int convId)
    {
        return diskStates != null && diskStates.TryGetValue(convId, out var s) && (s == DiskState.Differs || s == DiskState.NoFile);
    }

    /// <summary>匯入或匯出過後呼叫：下次畫匯出頁時重新比對。</summary>
    private void InvalidateDiskStates()
    {
        diskStates = null;
    }

    private void EnsureDiskStates()
    {
        if (diskStates != null && diskStatesFolder == exportFolderPath) return;
        RefreshDiskStates();
    }

    /// <summary>整個資料庫逐段和輸出資料夾裡的 JSON 比一遍（約百段對話，一瞬間）；資料夾不存在就全部沒狀態。</summary>
    private void RefreshDiskStates()
    {
        diskStates = new Dictionary<int, DiskState>();
        diskDetails = new Dictionary<int, string>();
        diskStatesFolder = exportFolderPath;
        if (string.IsNullOrEmpty(exportFolderPath) || !Directory.Exists(exportFolderPath)) return;

        foreach (var conv in database.conversations)
        {
            try
            {
                diskStates[conv.id] = CompareWithDisk(conv, exportFolderPath, out string detail);
                diskDetails[conv.id] = detail;
            }
            catch (System.Exception ex)
            {
                diskStates[conv.id] = DiskState.Unreadable;
                diskDetails[conv.id] = ex.Message;
            }
        }
    }

    /// <summary>
    /// 這段對話「現在匯出會寫出什麼」和磁碟上那份 JSON 比：以 entryID 對應、逐格比欄位與連線，
    /// 不比節點排列順序、不比 JSON 排版，所以 AI 在 IDE 重排格式不會被當成不同。
    /// 不寫任何東西、不補印記（印記用試算的）。
    /// </summary>
    private DiskState CompareWithDisk(Conversation conv, string folder, out string detail)
    {
        detail = "";
        string title = conv.Title ?? "";
        if (string.IsNullOrWhiteSpace(title))
        {
            detail = "對話沒有標題，匯出時會被略過";
            return DiskState.Unreadable;
        }

        string path = Path.Combine(folder, TitleToRelativePath(title) + ".json");
        if (!File.Exists(path))
        {
            detail = "磁碟上還沒有這份 JSON：\n" + path;
            return DiskState.NoFile;
        }

        var dbEntries = conv.dialogueEntries.Where(e => e.id != 0).ToList();
        var entryToJsonId = new Dictionary<int, int>();
        AssignJsonIds(conv, dbEntries, entryToJsonId, write: false);
        string exportText = BuildExportText(conv, dbEntries, entryToJsonId, quiet: true);

        List<JsonEntry> unity, disk;
        try
        {
            unity = JsonUtility.FromJson<JsonEntryList>("{\"items\":" + exportText + "}")?.items;
            disk = JsonUtility.FromJson<JsonEntryList>("{\"items\":" + File.ReadAllText(path) + "}")?.items;
        }
        catch (System.Exception ex)
        {
            detail = "磁碟上的 JSON 讀不了：" + ex.Message;
            return DiskState.Unreadable;
        }
        if (unity == null || disk == null)
        {
            detail = "磁碟上的 JSON 讀不了（格式不符）";
            return DiskState.Unreadable;
        }

        var diffs = EntryListDiffs(unity, disk);
        if (diffs.Count == 0) return DiskState.Same;
        detail = $"{diffs.Count} 處不同：\n" + string.Join("\n", diffs.Take(15)) + (diffs.Count > 15 ? $"\n…另有 {diffs.Count - 15} 處" : "");
        return DiskState.Differs;
    }

    /// <summary>兩份節點清單的差異（以 entryID 對應，不看順序）；每一處一行「#id 欄位」。比對規則對齊 EntryDiffers。</summary>
    private List<string> EntryListDiffs(List<JsonEntry> unity, List<JsonEntry> disk)
    {
        var diffs = new List<string>();
        var diskById = new Dictionary<int, JsonEntry>();
        foreach (var e in disk) if (!diskById.ContainsKey(e.entryID)) diskById[e.entryID] = e;
        var unityIds = new HashSet<int>(unity.Select(e => e.entryID));

        foreach (var u in unity)
        {
            if (!diskById.TryGetValue(u.entryID, out var d))
            {
                diffs.Add($"#{u.entryID} 磁碟沒有這格（Unity 多出來的）");
                continue;
            }
            var fields = new List<string>();
            if (!SameActor(u.actorID, d.actorID)) fields.Add("說話者");
            if (Norm(u.title) != Norm(d.title)) fields.Add("title");
            if (Norm(u.text) != Norm(d.text)) fields.Add("文字");
            if (Norm(u.Sequence) != Norm(ProcessSequence(d.Sequence))) fields.Add("Sequence");
            if (Norm(u.Conditions) != Norm(d.Conditions)) fields.Add("Conditions");
            if (Norm(u.Script) != Norm(d.Script)) fields.Add("Script");
            if (Norm(u.Description) != Norm(d.Description)) fields.Add("Description");
            if (Norm(u.zh_TW) != Norm(d.zh_TW)) fields.Add("zh_TW");
            if (Norm(u.zh_CN) != Norm(d.zh_CN)) fields.Add("zh_CN");
            if (Norm(u.en) != Norm(d.en)) fields.Add("en");
            var ul = (u.links ?? new List<int>()).OrderBy(x => x);
            var dl = (d.links ?? new List<int>()).OrderBy(x => x);
            if (!ul.SequenceEqual(dl)) fields.Add("連線");
            if (fields.Count > 0) diffs.Add($"#{u.entryID} {string.Join("、", fields)}");
        }
        foreach (var d in disk)
            if (!unityIds.Contains(d.entryID)) diffs.Add($"#{d.entryID} Unity 沒有這格（磁碟多出來的）");
        return diffs;
    }

    /// <summary>說話者：兩邊都能對到資料庫角色就比 id，否則比字串（「role119」與數字 id 這種寫法差異不算不同）。</summary>
    private bool SameActor(string a, string b)
    {
        if (TryResolveActorID(a, out int ia) && TryResolveActorID(b, out int ib)) return ia == ib;
        return (a ?? "").Trim() == (b ?? "").Trim();
    }

    // ── 匯出：批次執行 ──

    private void ExportConversations(List<Conversation> conversations, string folder, string jobName)
    {
        if (!Directory.Exists(folder))
        {
            EditorUtility.DisplayDialog("找不到資料夾", folder, "確定");
            return;
        }

        int n = 0;
        var failed = new List<string>();
        var legacy = new List<string>();
        var exportedIds = new HashSet<int>();

        // 每段各自 try/catch：一段出錯不能讓整批中斷（之前任何一段丟例外就整個沒反應）
        for (int i = 0; i < conversations.Count; i++)
        {
            var conv = conversations[i];
            string title = conv.Title ?? $"(ID {conv.id})";
            EditorUtility.DisplayProgressBar(jobName, $"{i + 1}/{conversations.Count}  {title}", (float)i / conversations.Count);
            try
            {
                if (ExportConversation(conv, folder, legacy) != null) { n++; exportedIds.Add(conv.id); }
                else failed.Add($"{title}：略過（見 Console）");
            }
            catch (System.Exception ex)
            {
                Debug.LogException(ex);
                failed.Add($"{title}：{ex.GetType().Name}: {ex.Message}");
            }
        }
        EditorUtility.ClearProgressBar();
        AssetDatabase.SaveAssets();

        // 匯出完重新比對；有變動但這次沒匯的，點名提醒
        if (folder == exportFolderPath) RefreshDiskStates();
        var missed = folder == exportFolderPath
            ? database.conversations.Where(c => !exportedIds.Contains(c.id) && IsDirty(c.id)).ToList()
            : new List<Conversation>();

        string msg = $"共匯出 {n} / {conversations.Count} 檔到:\n{folder}";
        if (failed.Count > 0)
        {
            msg += $"\n\n⚠ 失敗 {failed.Count} 檔：\n" + ListLines(failed, 10);
        }
        if (missed.Count > 0)
        {
            msg += $"\n\n● 另有 {missed.Count} 段對話和磁碟上的 JSON 不同，這次沒匯出：\n" +
                   ListLines(missed.Select(c => c.Title + (diskStates[c.id] == DiskState.NoFile ? "（磁碟還沒有檔）" : "")), 12) +
                   "\n（清單上有 ● 標記；要一起匯的話按「勾選有變動的」。）";
            Debug.LogWarning($"{jobName}：有變動但沒匯出的對話 {missed.Count} 段：\n  " +
                             string.Join("\n  ", missed.Select(c => $"{c.Title}\n    {diskDetails[c.id].Replace("\n", "\n    ")}")));
        }
        msg += LegacyNote(legacy);
        Debug.Log($"{jobName}完成：成功 {n}，失敗 {failed.Count}，有變動未匯 {missed.Count}。");
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

        // jsonID：優先用印記，否則用 DB entry.id（舊對話首次匯出會以此為準）；缺的印記這時寫回資料庫
        var entryToJsonId = new Dictionary<int, int>();
        AssignJsonIds(conversation, dbEntries, entryToJsonId, write: true);

        string text = BuildExportText(conversation, dbEntries, entryToJsonId, quiet: false);

        // 對話名的「/」= 子資料夾；每一層各自清掉檔名不允許的字元
        string path = Path.Combine(folder, TitleToRelativePath(title) + ".json");
        Directory.CreateDirectory(Path.GetDirectoryName(path));
        File.WriteAllText(path, text, new UTF8Encoding(false));
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
    /// 把對話組成 JSON 文字（格式與從前完全相同，舊檔不會因此多出差異）。
    /// quiet=true 給磁碟比對用：不印文案檢查與跨對話連線的警告。
    /// </summary>
    private string BuildExportText(Conversation conversation, List<DialogueEntry> dbEntries,
                                   Dictionary<int, int> entryToJsonId, bool quiet)
    {
        string title = conversation.Title ?? "";

        // 文案硬規則：匯出照實寫出來，但在 Console 點名，讓文案端修 JSON 再同步回來
        if (!quiet)
        {
            var checkWarnings = new List<string>();
            foreach (var e in dbEntries) CheckEntry(checkWarnings, entryToJsonId[e.id], e.DialogueText, e.Sequence);
            if (checkWarnings.Count > 0)
                Debug.LogWarning($"[{title}] 文案檢查有 {checkWarnings.Count} 處（已照實匯出，請在 JSON 修好再同步回來）：\n  " +
                                 string.Join("\n  ", checkWarnings));
        }

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
                    if (!quiet)
                        Debug.LogWarning($"[{title}] Entry {e.id} 有跨對話連線（→ Conv {link.destinationConversationID}），未寫入 JSON。");
                    continue;
                }
                if (entryToJsonId.TryGetValue(link.destinationDialogueID, out int jid)) links.Add(jid);
            }
            sb.Append($"    \"links\": [{string.Join(", ", links)}]\n");

            sb.Append(i < dbEntries.Count - 1 ? "  },\n" : "  }\n");
        }
        sb.Append("]\n");
        return sb.ToString();
    }

    /// <summary>
    /// 決定每個節點在 JSON 裡的 entryID，並（write=true 時）把缺的印記補寫回資料庫。
    ///
    /// ①**有印記的，印記說了算。** 印記自己重複時（Unity 裡複製貼上節點會連印記一起複製），
    ///   後出現的那個配新號。
    /// ②**沒印記的**（多半是在 Unity 裡手動加的節點）先沿用自己的 Unity id，被占走才配新號，
    ///   **然後一定把決定的號寫回印記**。
    ///
    /// ⚠ ②的「寫回印記」是重點：以前只算號不寫印記，於是匯出的 JSON 有這一格、Unity 那個節點卻
    /// 沒有印記，下次匯入時對不到任何節點，工具就再建一個新的——原節點變成沒有連入的死節點留在圖上，
    /// **每匯出匯入來回一次就多長一份**。2026-09-01 修（水濂洞 349→358→369、武道大會 503→504 即此）。
    ///
    /// write=false 只試算不寫（磁碟比對用），算出來的號和真正匯出時一模一樣。
    /// </summary>
    private void AssignJsonIds(Conversation conversation, List<DialogueEntry> dbEntries, Dictionary<int, int> entryToJsonId, bool write)
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
            if (write) Field.SetValue(e.fields, JSON_ENTRY_ID_FIELD, fresh.ToString());
            notes.Add($"Entry {e.id}：印記 {jid} 與別的節點重複 → 改為 {fresh}");
        }
        foreach (var e in unstamped)                     // ② 沒印記 → 補上
        {
            int jid = used.Contains(e.id) ? next++ : e.id;
            entryToJsonId[e.id] = jid;
            used.Add(jid);
            if (write) Field.SetValue(e.fields, JSON_ENTRY_ID_FIELD, jid.ToString());
            notes.Add($"Entry {e.id}：原本沒有印記 → 補上 {jid}");
        }
        if (notes.Count == 0 || !write) return;
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
