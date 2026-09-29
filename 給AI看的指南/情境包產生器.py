# -*- coding: utf-8 -*-
"""情境包產生器：把多 agent 創作流程「整理情境」那一步的機械部分做掉，產出情境包底稿。

只抄事實、不寫建議；出場角色、角色檔、聲口卡、既有台詞、退稿實例、掛點前後、來路、
變數與任務全由腳本從 Json/ 與 劇情/ 抓出來，agent 只補判斷（兌現處候選、這場戲的取向等）。

用法一（情境包底稿）：
    python -X utf8 給AI看的指南/情境包產生器.py --json "Json/張寧線/02蠶女白馬.json" --anchors 155,156 \
        --overview "劇情/張寧/02 蠶女白馬.md" --speakers role62,MC6 --out <路徑> [--extra-json <路徑> ...]

    --json        主 JSON（utf-8-sig）。
    --anchors     掛點 entryID，逗號分隔。沒給就略過第 2、3 節。
    --overview    對應回讀稿（劇情/…/NN 名.md）。用來把 JSON 裡沒名字的 actorID 對到名字；沒給就只靠既有台詞.py 的表。
    --speakers    要一併列進名單的 actorID（逗號分隔），JSON 裡沒出現也列。
    --extra-json  參考用的其他 JSON，可多個；只印它的第 4、5 節。
    --out         輸出 markdown 路徑。

用法二（指南摘錄，全部場次共用）：
    python -X utf8 給AI看的指南/情境包產生器.py --摘錄 --out <路徑> [--高難度]

    依標題切段、逐字抄；每段前印來源檔與行號範圍；找不到的標題印警告不中斷。
    --高難度  另附高難度檢定走向指南第一、四、五、六、七之二節。

Windows 主控台一律加 -X utf8。
"""
import argparse
import collections
import datetime
import glob
import importlib.util
import io
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
PROJ = os.path.abspath(os.path.join(HERE, ".."))
JSON_ROOT = os.path.join(PROJ, "Json")
STORY_ROOT = os.path.join(PROJ, "劇情")
CHAR_ROOT = os.path.join(PROJ, "@角色設定")
STYLE_GUIDE = os.path.join(HERE, "武俠文風創作指南.md")

BUILTIN_NAMES = {"role2": "旁白", "0": "（系統節點）"}
UNKNOWN = "（未知，請補）"

# 第 4 節要抓的關鍵字
SCENE_KEYWORDS = ["BeginDiceRoll", "IsPassDice", "BeginFight", "IsPassFight", "ShowNoviceTeaching", "[em2]"]
# 第 3 節祖先表要抓的關鍵字（text／Sequence 裡）
ANCESTOR_KEYWORDS = ["BeginDiceRoll", "BeginFight", "IsInTeam"]
# 第 5 節變數與任務
VAR_PATTERNS = [
    ("Variable", re.compile(r'Variable\["[^"]*"\]')),
    ("SetQuestState", re.compile(r"SetQuestState\([^)]*\)")),
    ("SetQuestEntryState", re.compile(r"SetQuestEntryState\([^)]*\)")),
    ("CurrentQuestState", re.compile(r"CurrentQuestState\([^)]*\)")),
    ("CurrentQuestEntryState", re.compile(r"CurrentQuestEntryState\([^)]*\)")),
    ("IsInTeam", re.compile(r"IsInTeam\([^)]*\)")),
    ("ModifyData", re.compile(r"ModifyData\([^)]*\)")),
]

# 回讀稿說話者行：**名:**`#N`　text ／ **名:**`#N`（承 `#M`）　text ／ **名:** text ／ **名:**：text
SPEAKER_RE = re.compile(
    r"^\*\*(?P<name>[^*]+?):\*\*(?:`#(?P<id>\d+)`)?(?:（[^）]*）)?[：:]?\s*(?P<text>.*)$"
)
# 改稿註記：> ✏ 2026-09-26 改稿（N0293，`#32`）：原句 …
ANNOT_RE = re.compile(
    r"^> ✏ (?P<date>\d{4}-\d{2}-\d{2}) 改稿（(?P<tag>[^）]*)）：原(?P<kind>句|選項) (?P<rest>.*)$"
)
# 00 總覽.md 說話者對照表的列：| `role105` | 茶博士 | … |
TABLE_ROW_RE = re.compile(r"^\|\s*`?(?P<aid>(?:MC\d+(?:-\d+)?|role\d+|\d+))`?\s*\|\s*(?P<name>[^|]*?)\s*\|")


# ---------------------------------------------------------------- 共用小工具
def load_jiyou():
    """依路徑載入 既有台詞.py（NAMES／ALIAS／resolve／collect），不複製一份。"""
    p = os.path.join(HERE, "既有台詞.py")
    spec = importlib.util.spec_from_file_location("jiyou_taici", p)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def resolve_path(p):
    if not p:
        return p
    if os.path.isabs(p):
        return os.path.normpath(p)
    cand = os.path.abspath(p)
    if os.path.exists(cand):
        return cand
    cand2 = os.path.normpath(os.path.join(PROJ, p))
    if os.path.exists(cand2):
        return cand2
    return cand


def rel_proj(p):
    try:
        return os.path.relpath(p, PROJ).replace("\\", "/")
    except ValueError:
        return p.replace("\\", "/")


def read_lines(p):
    with io.open(p, encoding="utf-8-sig") as f:
        return f.read().split("\n")


def load_json_list(p):
    data = json.load(io.open(p, encoding="utf-8-sig"))
    if not isinstance(data, list):
        raise ValueError("不是節點陣列（list）：%s" % p)
    return [n for n in data if isinstance(n, dict)]


def fld(n, k):
    v = n.get(k)
    if v is None:
        return ""
    if isinstance(v, (list, dict)):
        return json.dumps(v, ensure_ascii=False)
    return str(v)


def oneline(s):
    s = s.replace("\r\n", "\n").replace("\n", " ⏎ ")
    return s if s.strip() else "—"


def aid(n):
    return str(n.get("actorID"))


HEADING_RE = re.compile(r"^(#{1,6}) ")


def demote(lines, n):
    """把抄進來的段落標題降 n 級（只動 # 的個數，內文一字不改；程式碼圍欄裡的不動）。"""
    out, fence = [], False
    for l in lines:
        s = l.lstrip()
        if s.startswith("```") or s.startswith("~~~"):
            fence = not fence
            out.append(l)
            continue
        m = HEADING_RE.match(l) if not fence else None
        if m:
            k = min(6, len(m.group(1)) + n)
            out.append("#" * k + l[len(m.group(1)):])
        else:
            out.append(l)
    return out


# ---------------------------------------------------------------- 名單與名字解析
class Roster:
    def __init__(self, jy, nodes, speakers, overview_path, warn):
        self.jy = jy
        self.nodes = nodes
        self.warn = warn
        self.by_id = {n.get("entryID"): n for n in nodes}
        self.overview_names = collections.defaultdict(collections.Counter)  # aid -> Counter(name)
        self.table_names = {}  # aid -> name（00 總覽）
        self.table_path = None
        order = []
        for n in nodes:
            a = aid(n)
            if a not in order:
                order.append(a)
        for a in speakers:
            if a and a not in order:
                order.append(a)
        self.actors = order
        if overview_path:
            if os.path.exists(overview_path):
                self._scan_overview(overview_path)
            # 回讀稿本身找不到也照樣看同資料夾的 00 總覽.md
            t = os.path.join(os.path.dirname(overview_path), "00 總覽.md")
            if os.path.exists(t):
                self.table_path = t
                self._scan_table(t)
        self.names = {}
        self.sources = {}
        for a in self.actors:
            self.names[a], self.sources[a] = self._resolve(a)

    def _scan_overview(self, p):
        for line in read_lines(p):
            m = SPEAKER_RE.match(line)
            if not m or not m.group("id"):
                continue
            n = self.by_id.get(int(m.group("id")))
            if n is None:
                continue
            self.overview_names[aid(n)][m.group("name").strip()] += 1

    def _scan_table(self, p):
        for line in read_lines(p):
            m = TABLE_ROW_RE.match(line)
            if m and m.group("aid") not in self.table_names:
                self.table_names[m.group("aid")] = m.group("name").strip()

    def _resolve(self, a):
        if a in BUILTIN_NAMES:
            return BUILTIN_NAMES[a], "慣例"
        if a in self.jy.NAMES:
            return self.jy.NAMES[a], "既有台詞.py"
        if a in self.overview_names:
            name, _ = self.overview_names[a].most_common(1)[0]
            return name, "回讀稿"
        if a in self.table_names:
            return self.table_names[a], "00 總覽"
        return UNKNOWN, "—"

    def name(self, a):
        a = str(a)
        if a in self.names:
            return self.names[a]
        if a in BUILTIN_NAMES:
            return BUILTIN_NAMES[a]
        return self.jy.NAMES.get(a, a)

    def candidates(self, a):
        """這個 actorID 可能用的名字（找角色檔、聲口卡、退稿註記用）。"""
        out = []
        if a == "MC1":
            out += ["你", "燕不凡", "主角"]
        if a == "role2":
            out += ["旁白"]
        if a in self.jy.NAMES:
            out.append(self.jy.NAMES[a])
        out += [k for k, v in self.jy.ALIAS.items() if v == a]
        out += [k for k, _ in self.overview_names.get(a, collections.Counter()).most_common()]
        if a in self.table_names:
            out.append(self.table_names[a])
        seen, res = set(), []
        for x in out:
            x = x.strip()
            if x and x != UNKNOWN and x not in seen:
                seen.add(x)
                res.append(x)
        return res


# ---------------------------------------------------------------- 文風指南第四節聲口卡
class VoiceCards:
    def __init__(self):
        self.lines = read_lines(STYLE_GUIDE) if os.path.exists(STYLE_GUIDE) else []
        self.cards = []  # (heading_text, start_idx, end_idx)
        s = e = None
        for i, l in enumerate(self.lines):
            if s is None and l.startswith("## 四、"):
                s = i
            elif s is not None and l.startswith("## 四之二"):
                e = i
                break
        if s is None:
            return
        e = e if e is not None else len(self.lines)
        heads = [i for i in range(s, e) if self.lines[i].startswith("### ")]
        for k, h in enumerate(heads):
            nxt = heads[k + 1] if k + 1 < len(heads) else e
            self.cards.append((self.lines[h][4:].strip(), h, nxt))

    def find(self, names):
        for name in names:
            for h, s, e in self.cards:
                if h == name or (h.startswith(name) and h[len(name):len(name) + 1] in " （(⚠　"):
                    return h, s, e
        return None

    def generic(self):
        return self.find(["路人與配角通則"])

    def text(self, card):
        _, s, e = card
        body = self.lines[s:e]
        while body and not body[-1].strip():
            body.pop()
        return body


# ---------------------------------------------------------------- 退稿實例（改稿註記）
def scan_annotations():
    """掃 劇情/**/*.md 的改稿註記，回傳 list of dict。"""
    out = []
    unmatched = 0
    for p in sorted(glob.glob(os.path.join(STORY_ROOT, "**", "*.md"), recursive=True)):
        try:
            lines = read_lines(p)
        except Exception:
            continue
        sp = []  # (idx, name, id, text)
        for i, l in enumerate(lines):
            m = SPEAKER_RE.match(l)
            if m:
                sp.append((i, m.group("name").strip(), int(m.group("id")) if m.group("id") else None, m.group("text")))
        if not sp:
            continue
        for i, l in enumerate(lines):
            m = ANNOT_RE.match(l)
            if not m:
                continue
            tag = m.group("tag")
            idm = re.search(r"#(\d+)", tag)
            target = None
            if idm:
                nid = int(idm.group(1))
                before = [x for x in sp if x[0] < i and x[2] == nid]
                after = [x for x in sp if x[0] > i and x[2] == nid]
                target = before[-1] if before else (after[0] if after else None)
            if target is None:
                before = [x for x in sp if i - 15 <= x[0] < i]
                target = before[-1] if before else None
            if target is None:
                unmatched += 1
                continue
            rest = m.group("rest")
            sm = re.search(r"(?<=[」＊』）\]])。", rest)
            if sm:
                orig, reason = rest[:sm.start()], rest[sm.end():]
            elif "。" in rest:
                k = rest.find("。")
                orig, reason = rest[:k], rest[k + 1:]
            else:
                orig, reason = rest, ""
            reason = reason.strip()
            if len(reason) > 200:
                reason = reason[:200] + "…"
            out.append({
                "file": rel_proj(p), "line": i + 1, "date": m.group("date"), "tag": tag,
                "kind": m.group("kind"), "orig": orig.strip(), "reason": reason,
                "speaker": target[1], "id": target[2], "new": target[3].strip(),
            })
    return out, unmatched


# ---------------------------------------------------------------- 圖：parents、祖先、來路
def build_parents(nodes):
    parents = collections.defaultdict(list)
    for n in nodes:
        for l in n.get("links") or []:
            parents[l].append(n.get("entryID"))
    return parents


def ancestors_bfs(anchor, parents, max_depth=12):
    depth = {anchor: 0}
    q = collections.deque([anchor])
    while q:
        x = q.popleft()
        if depth[x] >= max_depth:
            continue
        for p in parents.get(x, []):
            if p not in depth:
                depth[p] = depth[x] + 1
                q.append(p)
    depth.pop(anchor, None)
    return depth


def root_paths(anchor, parents, max_paths=20, step_cap=200000):
    """由 anchor 往上走到根（沒有 parents 的節點）的路徑，最多 max_paths 條；回傳 (paths, too_many, capped)。"""
    paths, capped, too_many = [], False, False
    steps = 0
    stack = [(anchor, [anchor], {anchor})]
    while stack:
        node, path, seen = stack.pop()
        steps += 1
        if steps > step_cap:
            capped = True
            break
        ps = sorted(parents.get(node, []), key=lambda v: (v is None, v))
        if not ps:
            if len(paths) >= max_paths:
                too_many = True
                break
            paths.append(list(reversed(path)))
            continue
        for p in reversed(ps):
            if p in seen:
                continue
            stack.append((p, path + [p], seen | {p}))
    return paths, too_many, capped


def format_path(path, by_id, max_len=40):
    """`#a → #b → …`；帶 Conditions 的格加粗；超過 max_len 格只印頭一格與最後幾格，中間註明略了幾格、略掉的裡面哪些帶條件。"""
    def cell(eid):
        n = by_id.get(eid)
        return ("**#%s**" % eid) if (n is not None and fld(n, "Conditions").strip()) else ("#%s" % eid)
    if len(path) <= max_len:
        return " → ".join(cell(e) for e in path), ""
    head, tail = path[:1], path[-(max_len - 2):]
    mid = path[1:-(max_len - 2)]
    cond = [cell(e) for e in mid if by_id.get(e) is not None and fld(by_id[e], "Conditions").strip()]
    note = "…（略 %d 格%s）…" % (len(mid), ("，其中帶條件的：" + "、".join(cond)) if cond else "")
    return " → ".join([cell(e) for e in head] + [note] + [cell(e) for e in tail]), "超過 40 格，中段略"


# ---------------------------------------------------------------- 各節輸出
def node_line(n, roster, parents, star=False):
    eid = n.get("entryID")
    cells = [
        ("★" if star else "") + "#%s" % eid,
        roster.name(aid(n)),
        oneline(fld(n, "text")),
        oneline(fld(n, "Sequence")),
        oneline(fld(n, "Conditions")),
        oneline(fld(n, "Script")),
        oneline(fld(n, "Description")),
        "links=" + json.dumps(n.get("links") or [], ensure_ascii=False),
        "parents=" + json.dumps(parents.get(eid, []), ensure_ascii=False),
    ]
    return "- " + "｜".join(cells)


def node_block(n):
    d = {k: v for k, v in n.items() if k not in ("zh_CN", "zh_TW")}
    return "```json\n" + json.dumps(d, ensure_ascii=False, indent=1) + "\n```"


def section_scene_nodes(nodes, label):
    out = ["### 既有擲骰／戰鬥／教學格：%s" % label, ""]
    hits = 0
    for n in nodes:
        blob = fld(n, "text") + "\n" + fld(n, "Sequence") + "\n" + fld(n, "Conditions")
        keys = [k for k in SCENE_KEYWORDS if k in blob]
        if not keys:
            continue
        hits += 1
        out.append("- #%s（%s）" % (n.get("entryID"), "、".join(keys)))
        out.append(node_block(n))
        out.append("")
    if not hits:
        out.append("（無）")
        out.append("")
    return out


def section_vars(nodes, label):
    out = ["### 變數與任務：%s" % label, ""]
    found = collections.OrderedDict()
    for n in nodes:
        blob = "\n".join(fld(n, k) for k in ("text", "Sequence", "Conditions", "Script"))
        for kind, pat in VAR_PATTERNS:
            for m in pat.findall(blob):
                key = (kind, m)
                found.setdefault(key, []).append(n.get("entryID"))
    if not found:
        out.append("（無）")
    for (kind, m), ids in found.items():
        shown = ", ".join("#%s" % i for i in ids[:12]) + ("…" if len(ids) > 12 else "")
        out.append("- `%s`｜%d 次｜%s" % (m, len(ids), shown))
    out.append("")
    return out


def excerpt(lines, start_re, end_re, path, label, warn):
    """從第一個符合 start_re 的行抄到（不含）第一個符合 end_re 的行；end_re 為 None 抄到檔尾。"""
    out = []
    s = None
    for i, l in enumerate(lines):
        if re.match(start_re, l):
            s = i
            break
    if s is None:
        msg = "找不到標題 %s（%s）" % (label, rel_proj(path))
        warn.append(msg)
        return ["> ⚠ " + msg, ""]
    e = len(lines)
    if end_re:
        for j in range(s + 1, len(lines)):
            if re.match(end_re, lines[j]):
                e = j
                break
    body = lines[s:e]
    while body and not body[-1].strip():
        body.pop()
    out.append("> 來源：`%s` L%d–L%d" % (rel_proj(path), s + 1, s + len(body)))
    out.append("")
    out.extend(demote(body, 1))
    out.append("")
    return out


def excerpt_from_top(lines, end_re, path, label, warn):
    e = len(lines)
    for j, l in enumerate(lines):
        if re.match(end_re, l):
            e = j
            break
    body = lines[:e]
    while body and not body[-1].strip():
        body.pop()
    return ["> 來源：`%s` L1–L%d" % (rel_proj(path), len(body)), ""] + demote(body, 1) + [""]


# ---------------------------------------------------------------- 用法一
def build_packet(args):
    warn = []
    unresolved = []
    jy = load_jiyou()
    json_path = resolve_path(args.json)
    overview_path = resolve_path(args.overview) if args.overview else None
    overview_missing = bool(overview_path) and not os.path.exists(overview_path)
    if overview_missing:
        unresolved.append("找不到回讀稿 %s（只用了同資料夾的 00 總覽.md，若有）" % args.overview)
    nodes = load_json_list(json_path)
    json_rel = os.path.relpath(json_path, JSON_ROOT).replace("\\", "/")
    speakers = [s.strip() for s in (args.speakers or "").split(",") if s.strip()]
    anchors = [int(a) for a in re.findall(r"\d+", args.anchors or "")]
    roster = Roster(jy, nodes, speakers, overview_path, warn)
    parents = build_parents(nodes)
    by_id = roster.by_id
    cards = VoiceCards()
    annots, annot_unmatched = scan_annotations()

    L = []
    # 0
    L += ["# 情境包底稿：%s" % json_rel, ""]
    L += ["- 產生時間：%s" % datetime.datetime.now().strftime("%Y-%m-%d %H:%M")]
    L += ["- 參數：--json `%s`｜--anchors %s｜--overview `%s`｜--speakers %s｜--extra-json %s" % (
        rel_proj(json_path), ",".join(str(a) for a in anchors) or "—",
        (rel_proj(overview_path) + ("（⚠ 找不到）" if overview_missing else "")) if overview_path else "—", ",".join(speakers) or "—",
        ", ".join("`%s`" % rel_proj(resolve_path(x)) for x in (args.extra_json or [])) or "—")]
    L += ["- 節點數：%d｜entryID 範圍：#%s–#%s" % (
        len(nodes), min(by_id) if by_id else "—", max(by_id) if by_id else "—")]
    L += ["- 本檔全部逐字抄事實，不含建議。空欄印 —；多行欄位以 ⏎ 接。第 4 節整格印時略去 zh_CN／zh_TW。抄進來的段落只把標題降級，內文一字不改。", ""]

    # 1 名單表
    L += ["## 1. 出場名單表", ""]
    L += ["| 角色 | actorID | 本檔句數 | 角色檔 | 聲口卡 | 全案既有台詞句數 |", "| :-- | :-- | :-- | :-- | :-- | :-- |"]
    roster_info = {}
    no_file, no_card, unknown = [], [], []
    for a in roster.actors:
        name = roster.name(a)
        cands = roster.candidates(a)
        cnt_text = sum(1 for n in nodes if aid(n) == a and fld(n, "text").strip())
        cnt_all = sum(1 for n in nodes if aid(n) == a)
        char_file = None
        for c in cands:
            p = os.path.join(CHAR_ROOT, c + ".md")
            if os.path.exists(p):
                char_file = p
                break
        card = cards.find(["你"]) if a == "MC1" else cards.find(["旁白"]) if a == "role2" else cards.find(cands)
        groups = jy.collect(a)
        total = sum(len(l) for _, l in groups)
        roster_info[a] = dict(name=name, cands=cands, char_file=char_file, card=card, groups=groups, total=total)
        if name == UNKNOWN:
            unknown.append(a)
        if char_file is None and a not in ("role2", "0"):
            no_file.append("%s（%s）" % (name, a))
        if card is None and a not in ("0",):
            no_card.append("%s（%s）" % (name, a))
        if a == "0":
            cf, cc = "—", "—"
        else:
            cf = "`%s`" % rel_proj(char_file) if char_file else ("—" if a == "role2" else "⚠ 無")
            cc = ("L%d" % (card[1] + 1)) if card else ("路人與配角通則（L%d）" % (cards.generic()[1] + 1) if cards.generic() else "⚠ 無")
        src = roster.sources.get(a, "—")
        L.append("| %s | `%s` | %d 句／%d 格 | %s | %s | %d |" % (
            name + ("" if src in ("既有台詞.py", "慣例", "—") else "（%s）" % src), a, cnt_text, cnt_all, cf, cc, total))
    L += [""]
    L += ["沒角色檔：%s。沒聲口卡（用路人與配角通則）：%s。名字未解析：%s。" % (
        "、".join(no_file) or "無", "、".join(no_card) or "無", "、".join(unknown) or "無")]
    if roster.table_path:
        L += ["名字來源：既有台詞.py 的表 → 回讀稿 `**名:**`#N`` 行 → `%s` 說話者對照表。" % rel_proj(roster.table_path)]
    else:
        L += ["名字來源：既有台詞.py 的表 → 回讀稿 `**名:**`#N`` 行（同資料夾沒有 `00 總覽.md`）。"]
    L += [""]

    # 2 掛點前後
    L += ["## 2. 掛點前後（陣列順序前十格到後十格；★＝掛點）", ""]
    L += ["每格：`#id｜說話者｜text｜Sequence｜Conditions｜Script｜Description｜links｜parents`（parents＝links 指到它的節點）", ""]
    if not anchors:
        L += ["（未給 --anchors，略）", ""]
    idx_of = {n.get("entryID"): i for i, n in enumerate(nodes)}
    for a in anchors:
        if a not in idx_of:
            unresolved.append("掛點 #%d 不在 JSON 裡" % a)
            L += ["### 掛點 #%d" % a, "", "> ⚠ 不在本 JSON 裡", ""]
            continue
        i = idx_of[a]
        L += ["### 掛點 #%d（陣列第 %d 格）" % (a, i + 1), ""]
        for n in nodes[max(0, i - 10):min(len(nodes), i + 11)]:
            L.append(node_line(n, roster, parents, star=(n.get("entryID") == a)))
        L += [""]

    # 3 來路
    L += ["## 3. 來路", ""]
    if not anchors:
        L += ["（未給 --anchors，略）", ""]
    for a in anchors:
        if a not in by_id:
            continue
        L += ["### 掛點 #%d 的祖先（深度 12 以內，只列帶條件／Script／擲骰／戰鬥／IsInTeam 的）" % a, ""]
        depth = ancestors_bfs(a, parents)
        rows = []
        for eid, d in sorted(depth.items(), key=lambda kv: (kv[1], kv[0])):
            n = by_id.get(eid)
            if n is None:
                continue
            for col in ("Conditions", "Script"):
                if fld(n, col).strip():
                    rows.append((d, eid, roster.name(aid(n)), col, oneline(fld(n, col))))
            for col in ("Sequence", "text"):
                v = fld(n, col)
                if any(k in v for k in ANCESTOR_KEYWORDS):
                    rows.append((d, eid, roster.name(aid(n)), col, oneline(v)))
        if rows:
            L += ["| 深度 | #id | 說話者 | 欄 | 原文 |", "| :-- | :-- | :-- | :-- | :-- |"]
            for d, eid, nm, col, v in rows:
                L.append("| %d | #%s | %s | %s | %s |" % (d, eid, nm, col, v.replace("|", "\\|")))
        else:
            L += ["（祖先裡沒有帶條件／Script／擲骰／戰鬥／IsInTeam 的格）"]
        L += ["", "### 掛點 #%d 從根到掛點的路徑（最多 20 條、每條印 40 格以內，更長的中段略；帶 Conditions 的格加粗）" % a, ""]
        paths, too_many, capped = root_paths(a, parents)
        if not paths:
            L += ["（掛點本身就是根）"]
        printed = collections.OrderedDict()  # 印出來一樣的（只差在略掉的中段）合併成一條
        for path in paths:
            s, note = format_path(path, by_id)
            key = (s, len(path), note)
            printed[key] = printed.get(key, 0) + 1
        for k, ((s, ln, note), cnt) in enumerate(printed.items(), 1):
            extra = ("；另 %d 條印出來相同，只差在略掉的中段" % (cnt - 1)) if cnt > 1 else ""
            L.append("%d. %s（%d 格%s%s）" % (k, s, ln, ("；" + note) if note else "", extra))
        notes = []
        if too_many:
            notes.append("超過 20 條上限，未全列")
        if capped:
            notes.append("搜尋步數達上限，結果不完整")
        if notes:
            L.append("> ⚠ " + "；".join(notes))
        L += [""]

    # 4 擲骰／戰鬥／教學格
    L += ["## 4. 既有擲骰／戰鬥／教學格", ""]
    L += section_scene_nodes(nodes, "`%s`" % rel_proj(json_path))
    extra_lists = []
    for x in (args.extra_json or []):
        xp = resolve_path(x)
        if not os.path.exists(xp):
            unresolved.append("找不到 --extra-json %s" % x)
            continue
        try:
            xn = load_json_list(xp)
        except Exception as e:
            unresolved.append("--extra-json %s 讀不了：%s" % (x, e))
            continue
        extra_lists.append((rel_proj(xp), xn))
        L += section_scene_nodes(xn, "`%s`（參考用）" % rel_proj(xp))

    # 5 變數與任務
    L += ["## 5. 變數與任務", ""]
    L += section_vars(nodes, "`%s`" % rel_proj(json_path))
    for xr, xn in extra_lists:
        L += section_vars(xn, "`%s`（參考用）" % xr)

    # 6 各角色
    L += ["## 6. 各角色", ""]
    for a in roster.actors:
        info = roster_info[a]
        name = info["name"]
        L += ["### %s（%s）" % (name, a), ""]
        if a == "0":
            L += ["（系統節點，不是說話者）", ""]
            continue
        # (a) 聲口卡
        card = info["card"]
        if card is None:
            card = cards.generic()
            L += ["#### (a) 聲口卡：本人無卡，抄〈路人與配角通則〉", ""]
        else:
            L += ["#### (a) 聲口卡", ""]
        if card:
            L += ["> 來源：`%s` L%d–L%d" % (rel_proj(STYLE_GUIDE), card[1] + 1, card[1] + len(cards.text(card))), ""]
            L += demote(cards.text(card), 2)
            L += [""]
        else:
            L += ["> ⚠ 讀不到文風指南第四節", ""]
        # (b) 角色檔前段
        L += ["#### (b) 角色檔前 80 行", ""]
        if info["char_file"]:
            cl = read_lines(info["char_file"])[:80]
            L += ["> 來源：`%s` L1–L%d（全檔 %d 行）" % (rel_proj(info["char_file"]), len(cl), len(read_lines(info["char_file"]))), ""]
            L += demote(cl, 4)
            L += [""]
        else:
            L += ["（%s）" % ("旁白無角色檔" if a == "role2" else "⚠ 無角色檔：試過 " + "、".join("`@角色設定/%s.md`" % c for c in info["cands"]) if info["cands"] else "⚠ 無角色檔（名字未知）"), ""]
        # (c) 既有台詞
        this_lines = [(n.get("entryID"), fld(n, "text").strip()) for n in nodes if aid(n) == a and fld(n, "text").strip()]
        others = []
        for rel, lines in info["groups"]:
            if rel == json_rel:
                continue
            for eid, t in lines:
                others.append((rel, eid, t))
        L += ["#### (c) 既有台詞：本檔 %d 句；全案其他檔共 %d 句，均勻抽 %d 句" % (
            len(this_lines), len(others), min(30, len(others))), ""]
        L += ["本檔（`%s`）：" % json_rel, ""]
        for eid, t in this_lines:
            L.append("- #%s　%s" % (eid, oneline(t)))
        if not this_lines:
            L.append("（本檔無台詞）")
        L += [""]
        if others:
            step = len(others) / 30.0
            picks = [others[int(i * step)] for i in range(30)] if len(others) > 30 else others
            L += ["其他檔（抽樣，依 既有台詞.collect 的檔序，句數多的檔在前）：", ""]
            for rel, eid, t in picks:
                L.append("- `%s` #%s　%s" % (rel, eid, oneline(t)))
            L += [""]
        # (d) 退稿實例
        cands = set(info["cands"])
        mine = [r for r in annots if r["speaker"] in cands]
        L += ["#### (d) 退稿實例（改稿註記，說話者是本角色的；全案 %d 條，本人 %d 條，列前 %d 條）" % (
            len(annots), len(mine), min(12, len(mine))), ""]
        for r in mine[:12]:
            L.append("- `%s` L%d（%s，%s，說話者行 `#%s`）：原%s %s → 新句 %s｜理由 %s" % (
                r["file"], r["line"], r["date"], r["tag"], r["id"] if r["id"] is not None else "—",
                r["kind"], oneline(r["orig"]), oneline(r["new"]), r["reason"] or "—"))
        if not mine:
            L.append("（無）")
        L += [""]

    # 7 未解決
    if unknown:
        unresolved.append("名字未解析的 actorID：" + "、".join(unknown))
    if no_file:
        unresolved.append("沒角色檔：" + "、".join(no_file))
    if annot_unmatched:
        unresolved.append("改稿註記找不到說話者行的有 %d 條（未計入任何人）" % annot_unmatched)
    unresolved += warn
    L += ["## 7. 未解決", ""]
    L += ["- " + ("；".join(unresolved) if unresolved else "無"), ""]
    return L


# ---------------------------------------------------------------- 用法二
def build_excerpts(args):
    warn = []
    G = HERE
    H2 = r"^#{1,2} "
    H3 = r"^#{1,3} "
    H4 = r"^#{1,4} "
    specs = [
        # (檔, 標題, start_re, end_re)
        ("武俠文風創作指南.md", "零、常犯十條", r"^## 零、常犯十條", H2),
        ("文本創作指南.md", "第零層（整節）", r"^### \*\*第零層", H3),
        ("文本創作指南.md", "0.2.3 檢定／門檻", r"^#### 0\.2\.3", H4),
        ("文本創作指南.md", "0.6 他什麼時候知道多少", r"^#### 0\.6", H4),
        ("文本創作指南.md", "2.1a 不寫內心話", r"^#### 2\.1a", H4),
        ("文本創作指南.md", "2.1b 台詞長度上限", r"^#### 2\.1b", H4),
        ("文本創作指南.md", "2.3 表情特效不是選配", r"^#### 2\.3", H4),
        ("世界觀.md", "八、本劇不揭（寫作紅線）", r"^## 八", H2),
        ("武俠文風創作指南.md", "四、角色聲口卡（通則）", r"^## 四、", r"^### "),
        ("武俠文風創作指南.md", "旁白（說書人）", r"^### 旁白（說書人）", H3),
        ("武俠文風創作指南.md", "黑幕旁白", r"^### 黑幕旁白", H3),
        ("武俠文風創作指南.md", "你（主角）", r"^### 你（主角）", H3),
        ("武俠文風創作指南.md", "路人與配角通則", r"^### 路人與配角通則", H3),
        ("武俠文風創作指南.md", "四之二、稱謂與關係", r"^## 四之二", H2),
        ("武俠文風創作指南.md", "7.1a 旁白與 [em7] 怎麼分", r"^### 7\.1a", H3),
        ("武俠文風創作指南.md", "7.1b 旁白怎麼寫才對", r"^### 7\.1b", H3),
        ("武俠文風創作指南.md", "7.1c 一場多人進場怎麼寫", r"^### 7\.1c", H3),
        ("武俠文風創作指南.md", "7.3 選項文字", r"^### 7\.3", H3),
        ("武俠文風創作指南.md", "八、寫完自檢清單", r"^## 八、寫完自檢清單", H2),
        ("武俠文風審校清單.md", "第一部分：全案高頻替換詞表（甲到辛）", r"^## 第一部分", H2),
        ("武俠文風審校清單.md", "第二部分：口吻守則", r"^## 第二部分", H2),
        (os.path.join(CHAR_ROOT, "饕餮.md"), "饕餮 十、廢案清單", r"^## 十、廢案清單", H2),
        (os.path.join(STORY_ROOT, "轉成json指南.md"), "轉成json指南 §1 對話與發言者", r"^### 1\. 對話與發言者", r"^### 2\."),
        (os.path.join(STORY_ROOT, "轉成json指南.md"), "轉成json指南 §4.2 手動擲骰", r"^#{2,4} 4\.2", r"^### 4\.3"),
        (os.path.join(STORY_ROOT, "轉成json指南.md"), "轉成json指南 節點順序與編號", r"^## ⚠ 節點順序與編號", H2),
        ("立繪指令轉換規則.md", "立繪 §1 目標指令格式", r"^## 1\.", r"^## "),
        ("立繪指令轉換規則.md", "立繪 §2 角色ID定義", r"^## 2\.", r"^## 3\."),
        ("擲骰指令轉換規則.md", "擲骰指令轉換規則（檔頭到範例之前）", None, r"^## 範例"),
    ]
    if args.hard:
        specs += [
            ("高難度檢定走向指南.md", "高難度 一、三個分類", r"^## 一、", H2),
            ("高難度檢定走向指南.md", "高難度 四、引擎寫法", r"^## 四、", H2),
            ("高難度檢定走向指南.md", "高難度 五、三個分類的走向細則", r"^## 五、", H2),
            ("高難度檢定走向指南.md", "高難度 六、規則", r"^## 六、", H2),
            ("高難度檢定走向指南.md", "高難度 七之二、提示流程", r"^## 七之二", H2),
        ]
    L = ["# 指南摘錄（全部場次共用）", ""]
    L += ["- 產生時間：%s" % datetime.datetime.now().strftime("%Y-%m-%d %H:%M")]
    L += ["- 參數：--摘錄%s" % ("　--高難度" if args.hard else "")]
    L += ["- 每段逐字抄；段前一行是來源檔與行號範圍。抄進來的段落只把標題降一級，內文一字不改。", ""]
    cache = {}
    for f, label, s_re, e_re in specs:
        p = f if os.path.isabs(f) else os.path.join(G, f)
        L += ["## 〈%s〉" % label, ""]
        if not os.path.exists(p):
            msg = "找不到檔案 %s（%s）" % (rel_proj(p), label)
            warn.append(msg)
            L += ["> ⚠ " + msg, ""]
            continue
        if p not in cache:
            cache[p] = read_lines(p)
        lines = cache[p]
        if s_re is None:
            L += excerpt_from_top(lines, e_re, p, label, warn)
        else:
            L += excerpt(lines, s_re, e_re, p, label, warn)
    L += ["## 找不到的標題", ""]
    L += ["- " + ("；".join(warn) if warn else "無"), ""]
    return L, warn


# ---------------------------------------------------------------- main
def main():
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass
    ap = argparse.ArgumentParser(description="情境包產生器（見檔頭說明）")
    ap.add_argument("--json", help="主 JSON")
    ap.add_argument("--anchors", default="", help="掛點 entryID，逗號分隔")
    ap.add_argument("--overview", help="對應回讀稿 .md")
    ap.add_argument("--speakers", default="", help="一併列進名單的 actorID，逗號分隔")
    ap.add_argument("--extra-json", action="append", dest="extra_json", help="參考用 JSON，可多個；只印第 4、5 節")
    ap.add_argument("--out", required=True, help="輸出路徑")
    ap.add_argument("--摘錄", action="store_true", dest="excerpt", help="用法二：指南摘錄")
    ap.add_argument("--高難度", action="store_true", dest="hard", help="摘錄時另附高難度檢定走向指南")
    args = ap.parse_args()

    if args.excerpt:
        L, warn = build_excerpts(args)
    else:
        if not args.json:
            ap.error("用法一要給 --json（或改用 --摘錄）")
        L = build_packet(args)
        warn = []
    out = os.path.abspath(args.out)
    d = os.path.dirname(out)
    if d and not os.path.isdir(d):
        os.makedirs(d)
    with io.open(out, "w", encoding="utf-8", newline="\n") as f:
        f.write("\n".join(L))
        if not L or L[-1] != "":
            f.write("\n")
    print("已寫 %s（%d 行）" % (out, len(L)))
    for w in warn:
        print("⚠ " + w)


if __name__ == "__main__":
    main()
