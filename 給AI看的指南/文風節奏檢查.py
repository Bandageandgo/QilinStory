# -*- coding: utf-8 -*-
"""文風節奏檢查：抓碎句、縮寫名詞、超長台詞、結尾旁白短促，並報 em7 與表情特效的用量。
用法：python 給AI看的指南/文風節奏檢查.py <檔或資料夾>...   （.md 創作稿、.json 對話檔都吃）
      --建專名表   掃全部 Json/**/*.json 的 text，印出還沒進 專名表.txt 的專名候選（只印不寫，作者挑）
      --hook-post／--hook-stop 是給 .claude/settings.json 的 hook 用的，從 stdin 讀 JSON。
規矩出處：武俠文風創作指南 第四節旁白卡第 4 條、娜娜卡〈節奏〉、乙類〈不縮名詞〉、自檢 4a；
台詞長度上限見 文本創作指南 2.1b（2026-09-04 作者定：可見字數 50 內、紅線 60）；
表情特效不得零、偏低要補見 文本創作指南 2.3（2026-09-16 作者指正；作者舊稿基準每百格立繪 32 個）；
縮寫對照 給AI看的指南/專名表.txt（全名三字以上，首字＋末字的兩字縮寫一律禁，2026-09-29）；
每條分支最後一格旁白至少兩句、可見字三十以上（2026-09-29 作者定）。
"""
import sys, os, re, json, statistics as st

ACTOR = {'MC1': '你', 'MC2': '呂信', 'MC3': '子羽', 'MC4': '賈詡', 'MC5': '徐榮', 'MC6': '張寧', 'MC7': '郭嘉',
         'MC8': '蕭靈犀', 'MC9': '甄筠', 'MC10': '褚人飛', 'MC12': '董卓', 'MC13': '張仲景',
         'MC20': '雍仔', 'MC22': '赫連娜娜', 'MC23': '蔡琰', 'MC24': '蔡邕', 'role2': '旁白', '2': '旁白', '0': '(空)'}
EXEMPT = ('郭嘉', '狗頭人', 'Kobold')          # 話少或語言能力特例：碎句不計（子羽 2026-09-05 作者裁示移出：他話少是格少，開口是整句）
COMPOUND_BEFORE = '天機羅棋地命算磨石托圓一幾整半銅玉這那面'
COMPOUND_AFTER = '纏算問查點腿起子踞根桓龍旋繞'
EXPR_MIN_PORTRAITS, EXPR_LOW_PER_100 = 8, 10   # 立繪不到 8 格的小段不評；每百格立繪的表情少於 10 個算偏低（文本創作指南 2.3）
LIMIT_WARN, LIMIT_HARD = 50, 60   # 台詞可見字數：過 50 要拆格、60 是紅線（文本創作指南 2.1b，2026-09-04 作者定）
TAIL_MIN_SENT, TAIL_MIN_CHARS = 2, 30   # 每條分支最後一格旁白：至少兩句、可見字三十以上（2026-09-29 作者定）
NAMES_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), '專名表.txt')   # 縮寫檢查對照的專名表
NAME_SUFFIX = '府幫寨村洞潭澤嶺塢障道盟骰盤訣篇經會場鋪店坊莊寺廟觀家氏軍營關城郡縣'   # --建專名表 抓候選用的結尾字
TAG_RE = r'\[/?em\d\]|\[panel=\d+\]|\[PANEL=\d+\]|\[var=[^\]]*\]'


def visible_len(t):
    """可見字數：[panel]/[em2]/[em7]/[var] 標籤本身不算；em7 中間的動作字有顯示、要算；
    [var=…] 會代入姓名，以 2 字估。引號與標點都算。旁白（panel=6）不歸這條管。"""
    t = re.sub(r'\[var=[^\]]*\]', '〇〇', t)
    t = re.sub(r'\[/?em\d\]|\[panel=\d+\]|\[PANEL=\d+\]', '', t)
    return len(t.strip())


def strip_tags(t):
    t = re.sub(r'\[/?em\d\]|\[panel=\d\]|\[PANEL=\d\]', '', t)
    return re.sub(r'[「」『』＊（）()\s]', '', t)


def speech_only(t):
    """拿掉 [em7]舞台指示[/em7]，只留說出口的話（旁白則整段）。"""
    return re.sub(r'\[em7\].*?\[/em7\]', '', t)


def sentences(t):
    t = strip_tags(speech_only(t))
    out = []
    for m in re.finditer(r'([^。！？!?]+)([。！？!?]*)', t):
        raw, end = m.group(1), m.group(2)
        if not end and re.search(r'(——|……|…)\s*$', raw):
            end = '—'   # 被打斷／拖尾的話
        body = raw.strip('，、；：…—')
        if body:
            out.append((body, end))
    return out


def noun_hits(t):
    raw = re.sub(r'\[/?em\d\]|\[panel=\d\]', '', t)
    hits = []
    # 專名不縮成末一字（乙類〈不縮名詞〉2026-09-12 改通則）：新專名進文本時在這裡加一列
    PROPER = {'盤': ('天機盤', '羅盤'), '訣': ('斬心訣',), '篇': ('養煞篇',)}
    for tail, fulls in PROPER.items():
        for m in re.finditer(r'[這那該]面?' + tail, raw):
            before = raw[:m.start()]
            if not any(f in before for f in fulls):
                hits.append(m.group())
    hits += re.findall(r'(?<![一兩三四五六七八九十幾這那半])[這那]面(?=[，。！？」；、]|$)', raw)
    hits += [m.group() for m in re.finditer(r'(?<![' + COMPOUND_BEFORE + r'])盤(?![' + COMPOUND_AFTER + r'])', raw)]
    hits += re.findall(r'那把秤|那把尺|[這那]本帳(?!冊)', raw)
    return hits


# ---------- 縮寫對照專名表（2026-09-29） ----------
_NAMES = None


def load_names():
    """讀 專名表.txt，回 {'full': [全名…], 'forbid': {縮寫: 全名}, 'allow': 准用簡稱, 'white': 白名單}。
    一行一個：全名｜禁：簡稱1,簡稱2｜准：簡稱3（禁、准都可省略；# 是註解；[白名單] 段底下一行一個短稱）。
    全名三字以上，首字＋末字的兩字縮寫自動當禁用，除非列在准或白名單；縮寫若本身是全名或白名單就不算。
    檔案不在就當空表，hook 不能因此掛掉。"""
    global _NAMES
    if _NAMES is not None:
        return _NAMES
    try:
        lines = open(NAMES_FILE, encoding='utf-8').read().splitlines()
    except Exception:
        lines = []
    full, entries, allow, white = [], [], set(), set()
    section = 'names'
    for line in lines:
        s = line.strip()
        if not s or s.startswith('#'):
            continue
        if s.startswith('[') and s.endswith(']'):
            section = 'white' if '白名單' in s else 'names'
            continue
        if section == 'white':
            white.add(s)
            continue
        parts = [x.strip() for x in re.split(r'[｜|]', s)]
        name = parts[0]
        if not name:
            continue
        fb, al = [], []
        for x in parts[1:]:
            m = re.match(r'^(禁|准)\s*[：:]\s*(.*)$', x)
            if m:
                items = [y.strip() for y in re.split(r'[,，、]', m.group(2)) if y.strip()]
                (fb if m.group(1) == '禁' else al).extend(items)
        if len(name) >= 3 and (name[0] + name[-1]) not in al:
            fb.append(name[0] + name[-1])
        full.append(name); allow.update(al); entries.append((name, fb))
    forbid = {}
    for name, fb in entries:
        for a in fb:
            if a and a != name and a not in full and a not in white and a not in allow:
                forbid.setdefault(a, name)
    _NAMES = {'full': full, 'forbid': forbid, 'allow': allow, 'white': white}
    return _NAMES


def abbr_hits(t):
    """對照專名表找禁用縮寫：先把文本裡的全名、准用簡稱、白名單整段拿掉（免得「英豪府」裡的字被誤抓），再找禁用的。
    回 [(縮寫, 全名)…]，照出現順序。"""
    N = load_names()
    if not N['forbid']:
        return []
    raw = re.sub(TAG_RE, '', t)
    for w in sorted(set(N['full']) | N['allow'] | N['white'], key=len, reverse=True):
        raw = raw.replace(w, '\x00' * len(w))
    hits = []
    for a in sorted(N['forbid'], key=len, reverse=True):
        for m in re.finditer(re.escape(a), raw):
            hits.append((m.start(), a, N['forbid'][a]))
        raw = raw.replace(a, '\x00' * len(a))
    return [(a, f) for _, a, f in sorted(hits)]


STOP_HEAD = ('的了在去到是這那你我他她們個來回從往進出上下把被與和跟有沒不也都就又再還才很太最給對為以於之而且及或等'
             '向朝離經過走看說想問要能會可得地著叫讓使令連隨同像比更愈越已曾正將先後便即則什麼怎哪誰每各某另整半兩幾')
STOP_IN = '不已了嗎呢吧的著把被就也都又再才給讓叫使令連跟隨到去來回是沒能可要想說看'   # 名字裡不會有的虛字、動詞：候選含這些就丟
HUI_BEFORE = '大盟法廟集宴'   # 結尾「會」太常當動詞（該不會、一定會），只收「大會」「盟會」這幾種


def build_names():
    """--建專名表：掃全部 Json/**/*.json 的 text，印出 3–6 個中文字、以 NAME_SUFFIX 收尾、出現三次以上、
    還沒進專名表的候選，附次數；只印不寫，作者挑了再貼進 專名表.txt。"""
    N = load_names()
    known = set(N['full']) | N['allow'] | N['white'] | set(N['forbid'])
    cnt = {}; files = 0
    for root, _, fs in os.walk(os.path.join(ROOT, 'Json')):
        for f in sorted(fs):
            if not f.endswith('.json'):
                continue
            try:
                nodes = json.load(open(os.path.join(root, f), encoding='utf-8'))
            except Exception:
                continue
            files += 1
            for n in nodes:
                t = re.sub(TAG_RE, '', n.get('text', '') or '')
                for m in re.finditer('[' + NAME_SUFFIX + ']', t):
                    e = m.end()
                    for L in range(3, 7):
                        w = t[e - L:e] if e - L >= 0 else ''
                        if len(w) < L or not re.fullmatch(r'[一-鿿]+', w):
                            break
                        cnt[w] = cnt.get(w, 0) + 1
    # 「們英豪府」是前面黏了字的英豪府，不是新名：長的比短的少很多就丟長的；短的幾乎都躲在長的裡面就丟短的。
    drop = set()
    for w in sorted(cnt, key=len):
        if len(w) < 4 or cnt[w] < 3:
            continue
        x = w[1:]
        if x in cnt:
            if x in drop or cnt[w] < 0.8 * cnt[x]:
                drop.add(w)
            else:
                drop.add(x)
    out = []
    for w, c in cnt.items():
        if c < 3 or w in drop or w[0] in STOP_HEAD or w in known:
            continue
        if any(ch in STOP_IN for ch in w[:-1]) or (w[-1] == '會' and w[-2] not in HUI_BEFORE):
            continue
        if any(w.endswith(k) or k.startswith(w) for k in N['full']):   # 「你們英豪府」前面黏字、「黑狼氏」是已知名的頭
            continue
        if any(k in w and (not w.startswith(k) or w[len(k)] in STOP_HEAD) for k in N['full'] if len(k) < len(w)):
            continue   # 「英豪府的會」：已知名後面黏了虛字；「英豪府遴選會」這種實字接的留著
        out.append((c, w))
    out.sort(key=lambda x: (-x[0], x[1]))
    print('掃了 %d 個 JSON，候選 %d 個（3–6 個中文字、結尾是 %s 之一、出現三次以上、不在專名表；只印不寫，作者挑）：'
          % (files, len(out), NAME_SUFFIX))
    for c, w in out:
        print('%5d  %s' % (c, w))


def lines_from_json(p):
    for n in json.load(open(p, encoding='utf-8')):
        t = n.get('text', '')
        if not t.strip():
            continue
        # 選單句本來就該比底下那格發言短（轉成json指南 §4.2 通則），不算碎句 2026-09-12
        if str(n.get('Description', '')).startswith('選項'):
            continue
        spk = ACTOR.get(n.get('actorID'), n.get('actorID'))
        if 'panel=6' in t.lower():
            spk = '旁白'
        yield spk, '#%s' % n.get('entryID'), t


MD_LINE = re.compile(r'^\*\*([^*]+?)(?:\s*\(MC\d+\))?:\*\*\s*：?\s*(?:`#(\d+)`\s*)?(.*)$')


def lines_from_md(p):
    raw = open(p, encoding='utf-8').read().splitlines()
    for i, line in enumerate(raw, 1):
        m = MD_LINE.match(line.strip())
        if not m:
            continue
        spk, eid, t = m.group(1).strip(), m.group(2), m.group(3)
        if not t.strip() or spk in ('Sequence', 'Script'):
            continue
        # 回讀稿的選單句底下就是「- 註記：選項N：…」，選項本來就該短，不算碎句 2026-09-12
        # （只認「選項N：」，不可連「選項N收尾」那種收束格的註記一起吃掉）
        if any(re.match(r'- 註記：選項[一二三四五六七八九十\d]+[：:]', raw[j].strip())
               for j in range(i, min(i + 3, len(raw)))):
            continue
        yield spk, ('#%s' % eid if eid else 'L%d' % i), t


TAIL_MARK = re.compile(r'^(→\s*接|\*\*▶|▶|#{2,4} )')   # 這些行之前的那格旁白，就是一條分支的結尾


def md_tails(p):
    """回 .md 裡每條分支最後一格旁白 [(格號, 文)…]（創作稿、回讀稿都吃）：說話者是旁白的那一格，
    往下找第一個不是空行、不是「- 」附註（actorID／Sequence 之類）的行，若是 → 接、**▶、▶、##／###／#### 開頭或已到檔尾，就算分支結尾。"""
    raw = open(p, encoding='utf-8').read().splitlines()
    out = []
    for i, line in enumerate(raw):
        m = MD_LINE.match(line.strip())
        if not m:
            continue
        spk, eid, t = m.group(1).strip(), m.group(2), m.group(3)
        if not t.strip() or not (spk == '旁白' or 'panel=6' in t.lower()):
            continue
        nxt = None
        for j in range(i + 1, len(raw)):
            s = raw[j].strip()
            if s and not s.startswith('- '):
                nxt = s
                break
        is_menu = nxt is not None and nxt.lstrip('*').startswith('▶') and any(k in nxt for k in ('選單', '玩家選擇', '選項'))
        if nxt is None or (TAIL_MARK.match(nxt) and not is_menu):   # ▶ 選單／玩家選擇 是選單前，不是分支結尾（2026-09-29）
            out.append(('#%s' % eid if eid else 'L%d' % (i + 1), t))
    return out


def json_tails(p):
    """回 .json 裡每條分支最後一格旁白 [(格號, 文)…]：actorID 是 role2 且 links 為空的節點。"""
    return [('#%s' % n.get('entryID'), n.get('text', ''))
            for n in json.load(open(p, encoding='utf-8'))
            if n.get('actorID') == 'role2' and not n.get('links') and (n.get('text') or '').strip()]


def expr_stats(p):
    """回 (立繪格數, 表情特效格數)：.md 數 Sequence 行、.json 數節點。"""
    if p.endswith('.json'):
        seqs = [n.get('Sequence') or '' for n in json.load(open(p, encoding='utf-8'))]
    else:
        seqs = [l for l in open(p, encoding='utf-8').read().splitlines() if 'Sequence' in l]
    return (sum('SetPortrait(' in s for s in seqs), sum('EnableCharacterExpression(' in s for s in seqs))


def check(p):
    gen = lines_from_json(p) if p.endswith('.json') else lines_from_md(p)
    per = {}; frags = []; nouns = []; flagged = []; longs = []; tails = []; dashes = []; cands = []
    abbrs = []; short_tails = []
    em_lines = 0; talk_lines = 0; em_consec = []; prev_em = None
    for spk, eid, t in gen:
        if spk != '旁白':
            talk_lines += 1
            vl = visible_len(t)
            if vl > LIMIT_WARN:
                longs.append((spk, eid, vl))
            if '[em7]' in t:
                em_lines += 1
                if prev_em == spk:
                    em_consec.append((spk, eid))
                prev_em = spk
            else:
                prev_em = None
        S = sentences(t)
        d = per.setdefault(spk, {'n': 0, 'chars': [], 'frag': 0})
        for body, end in S:
            d['n'] += 1; d['chars'].append(len(body))
            if len(body) <= 5 and end in ('', '。'):   # 驚呼、問句、被打斷的話不算碎句
                d['frag'] += 1
                if not any(x in spk for x in EXEMPT):
                    frags.append((spk, eid, body + end))
            elif end in ('', '。') and re.search(r'[，、；：]', body):
                # 逗號後短尾（2026-09-05 作者裁示）：「船備好，我過河」「這一趟，我去」——逗號後只掛兩三個字的「人＋動作」，
                # 是動作前停頓，算碎句，要用「就／便」連成一氣。否定的決斷可以停（「我不下」「我不回來」），含否定字就不抓；
                # 「站久了，腳會麻」「他看的不是河，是對岸」「臨水而絜，去宿垢」不是人在動作，不抓。
                tail = re.split(r'[，、；：]', body)[-1]
                if (1 < len(tail) <= 3 and re.match(r'^(我|你|他|她|咱|我們|你們|他們)', tail)
                        and not re.search(r'[不沒別莫未無非]', tail) and not any(x in spk for x in EXEMPT)):
                    tails.append((spk, eid, body + end))
        for h in noun_hits(t):
            nouns.append((spk, eid, h))
        for h, full in abbr_hits(t):   # 對照專名表的縮寫（2026-09-29）
            abbrs.append((spk, eid, h, full))
        if spk == '旁白':   # 旁白卡候選（第 3 條判語／心事、第 7 條造景／數字／收尾巧句；作者 2026-09-28 要的：只列出來，留不留由審的人說理由）
            for body, end in S:
                last = re.split(r'[，、；：]', body)[-1]
                if re.search(r'不是[^，。；]{1,14}，(而|卻|倒)?是', body):
                    cands.append((spk, eid, '翻轉句', body + end))
                elif re.match(r'^(像|彷彿|好似|如同|倒像|像是|恍如|宛如)', last) and len(last) >= 4:
                    cands.append((spk, eid, '比喻收尾', body + end))
                elif re.match(r'^(沒有|沒人|沒一|再也沒|再沒|誰也沒|誰也不|一個也沒|什麼也沒|並未|並沒|並不|不再)', last):
                    cands.append((spk, eid, '否定收尾', body + end))
                elif re.match(r'^(只剩|只有|唯有|四下裡|四下|滿地|滿天|一片|到處|處處)', last):
                    cands.append((spk, eid, '造景收尾', body + end))
                if re.search(r'(你知道|你明白|不是你多心|顯然|分明|果然|終於|不由得|不免|似乎|看來|想必|心頭|心裡|心中|心底|不禁|忍不住)', body):
                    cands.append((spk, eid, '判語／心事', body + end))
                if re.search(r'[二三四五六七八九十百千]{1,3}(丈|步|尺|里|匹|名|騎|盞|支|根|條|片|層|回|遍|次|聲|個|隻|頂|桿|道|排|家|間|口|把|張|串|枚)', body):
                    cands.append((spk, eid, '精確數目', body + end))
        if '——' in t:   # 全篇不用破折號（作者慣例，2026-09-28 收進文風指南旁白卡第 9 條）：旁白、台詞都抓
            dashes.append((spk, eid, strip_tags(t)[:40]))
    for eid, t in (json_tails(p) if p.endswith('.json') else md_tails(p)):   # 每條分支最後一格旁白（2026-09-29 作者定）
        ns, vl = len(sentences(t)), visible_len(t)
        if ns < TAIL_MIN_SENT or vl < TAIL_MIN_CHARS:
            short_tails.append((eid, ns, vl, strip_tags(speech_only(t))[:30]))
    print('=' * 8, p)
    print('%-10s %6s %8s %8s' % ('說話者', '句數', '每句字數', '碎句比'))
    for spk, d in per.items():
        if not d['n']:
            continue
        if any(x in spk for x in EXEMPT):
            tag = '（特例，不計）'
        elif st.mean(d['chars']) < 10 or d['frag'] / d['n'] > 0.25:
            tag = '⚠ 太碎'; flagged.append(spk)
        else:
            tag = ''
        print('%-10s %6d %8.1f %7.0f%% %s' % (spk, d['n'], st.mean(d['chars']), 100 * d['frag'] / d['n'], tag))
    if frags:
        print('-- 碎句（五字以下、句號收尾；驚呼、問句不算）：')
        for spk, eid, s in frags:
            print('   %s %s 「%s」' % (spk, eid, s))
    if tails:
        print('-- 逗號後短尾（動作前停頓：兩三字的肯定動作要用「就／便」連成一氣，如「船備好我就過河」）：')
        for spk, eid, s in tails:
            print('   %s %s 「%s」' % (spk, eid, s))
    if nouns:
        print('-- 縮寫／隱喻名詞（「那本帳」若是真帳本可留）：')
        for spk, eid, h in nouns:
            print('   %s %s 「%s」' % (spk, eid, h))
    if abbrs:
        print('-- 縮寫（對照專名表；准用的與白名單不報）：')
        for spk, eid, h, full in abbrs:
            print('   %s %s 「%s」（%s）' % (spk, eid, h, full))
    if cands:
        print('-- 旁白卡候選（第 3 條判語／心事、第 7 條造景／精確數目／收尾巧句；只列不判，留的要說理由；文風指南〈常犯十條〉）：')
        for spk, eid, kind, t in cands:
            print('   %s %s ［%s］「%s」' % (spk, eid, kind, t))
    if dashes:
        print('-- 破折號（全篇不用「——」，被打斷用「……」；文風指南旁白卡第 9 條）：')
        for spk, eid, t in dashes:
            print('   %s %s 「%s」' % (spk, eid, t))
    if longs:
        print('-- 台詞超長（可見字數過 %d 要拆格、%d 是紅線；標籤不計）：' % (LIMIT_WARN, LIMIT_HARD))
        for spk, eid, vl in longs:
            print('   %s %s %d 字%s' % (spk, eid, vl, '  ⚠ 紅線' if vl > LIMIT_HARD else ''))
    if short_tails:
        print('-- 結尾旁白短促（每條分支最後一格旁白至少兩句、三十字；文風審要交代）：')
        for eid, ns, vl, s in short_tails:
            print('   旁白 %s %d 句、%d 字 「%s」' % (eid, ns, vl, s))
    allowed = max(1, talk_lines // 10)
    em_bad = em_lines > allowed or bool(em_consec)
    if talk_lines:
        print('-- em7：%d／%d 格台詞（每十格至多一個，上限 %d）%s' % (em_lines, talk_lines, allowed, '  ⚠ 太多' if em_lines > allowed else ''))
    if em_consec:
        print('-- 同一人連續兩格都掛 em7：' + '、'.join('%s %s' % x for x in em_consec))
    sp, ex = expr_stats(p)
    expr_low = sp >= EXPR_MIN_PORTRAITS and (ex == 0 or 100 * ex < EXPR_LOW_PER_100 * sp)
    if sp:
        print('-- 表情特效：%d／%d 格立繪（作者舊稿每百格 32 個；零＝漏了、低於 %d 要回頭補，文本創作指南 2.3）%s'
              % (ex, sp, EXPR_LOW_PER_100, '  ⚠ 零表情' if (expr_low and ex == 0) else ('  ⚠ 偏低' if expr_low else '')))
    if (not frags and not tails and not nouns and not em_bad and not longs and not expr_low and not dashes and not cands
            and not abbrs and not short_tails):
        print('-- 乾淨。')
    return {'file': p, 'flagged': flagged, 'frags': len(frags), 'tails': len(tails), 'nouns': len(nouns), 'em7_bad': em_bad, 'longs': len(longs), 'expr_low': expr_low, 'dashes': len(dashes), 'cands': len(cands),
            'abbr': len(abbrs), 'short_tails': len(short_tails)}


def walk(paths):
    for p in paths:
        if os.path.isdir(p):
            for root, _, fs in os.walk(p):
                for f in sorted(fs):
                    if f.endswith(('.md', '.json')):
                        yield os.path.join(root, f)
        else:
            yield p


# ---------- 給 Claude Code hook 用 ----------
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))   # 倉庫根目錄


def rel_of(p):
    return os.path.relpath(os.path.abspath(p), ROOT).replace(os.sep, '/')


def watched(p):
    """劇情/ 或 Json/ 底下的 .md／.json 才檢查；舊創作稿不管。"""
    try:
        rel = rel_of(p)
    except ValueError:
        return None
    if rel.startswith(('劇情/', 'Json/')) and rel.endswith(('.md', '.json')) and '舊創作稿' not in rel and os.path.isfile(p):
        return rel
    return None


def run_quiet(paths):
    import io, contextlib
    buf = io.StringIO(); results = []
    with contextlib.redirect_stdout(buf):
        for p in paths:
            try:
                results.append(check(p))
            except Exception as e:
                print('（%s 讀不了：%s）' % (p, e))
    return buf.getvalue(), results


def summary(results):
    lines = []
    for r in results:
        if (r['flagged'] or r['frags'] or r.get('tails') or r['nouns'] or r.get('em7_bad') or r.get('longs') or r.get('expr_low')
                or r.get('abbr') or r.get('short_tails')):
            bits = []
            if r['flagged']:
                bits.append('太碎：' + '、'.join(r['flagged']))
            if r['frags']:
                bits.append('碎句 %d' % r['frags'])
            if r.get('tails'):
                bits.append('逗號後短尾 %d' % r['tails'])
            if r['nouns']:
                bits.append('縮寫名詞 %d' % r['nouns'])
            if r.get('abbr'):
                bits.append('縮寫（專名表）%d' % r['abbr'])
            if r.get('short_tails'):
                bits.append('結尾旁白短促 %d' % r['short_tails'])
            if r.get('em7_bad'):
                bits.append('em7 過量或連掛')
            if r.get('longs'):
                bits.append('台詞超長 %d' % r['longs'])
            if r.get('expr_low'):
                bits.append('表情特效零或偏低')
            lines.append('%s ⇒ %s' % (rel_of(r['file']), '；'.join(bits)))
    return lines


def hook_post():
    d = json.loads(sys.stdin.buffer.read().decode('utf-8', 'replace') or '{}')
    fp = (d.get('tool_input') or {}).get('file_path') or (d.get('tool_response') or {}).get('filePath')
    rel = watched(fp) if fp else None
    if not rel:
        return
    report, results = run_quiet([fp])
    out = {'hookSpecificOutput': {'hookEventName': 'PostToolUse',
                                  'additionalContext': '【文風節奏檢查】列出來的每一句都要處理掉，或說明為什麼留。\n' + report}}
    out['suppressOutput'] = True
    print(json.dumps(out, ensure_ascii=True))


STOP_LOG = os.path.join(ROOT, '.claude', '文風節奏檢查報告.txt')   # Stop hook 的結果寫這裡，畫面上不印（2026-09-26 作者裁示）


def hook_stop():
    """掃 git 裡改過、還沒 commit 的檔，結果整份寫進 STOP_LOG（每次覆蓋）；stdout 什麼都不印。"""
    import subprocess, time
    try:
        a = subprocess.run(['git', '-c', 'core.quotepath=false', 'diff', '--name-only', 'HEAD'], cwd=ROOT, capture_output=True).stdout
        b = subprocess.run(['git', '-c', 'core.quotepath=false', 'ls-files', '--others', '--exclude-standard'], cwd=ROOT, capture_output=True).stdout
    except Exception:
        return
    files = []
    for line in (a + b).decode('utf-8', 'replace').splitlines():
        line = line.strip()
        if line and watched(os.path.join(ROOT, line)):
            files.append(os.path.join(ROOT, line))
    stamp = time.strftime('%Y-%m-%d %H:%M')
    if not files:
        body = '%s  沒有改過、還沒 commit 的劇情／Json 檔。\n' % stamp
    else:
        report, results = run_quiet(files)
        s = summary(results)
        head = '%s  掃了 %d 個改過、還沒 commit 的檔' % (stamp, len(files))
        if s:
            body = (head + '，%d 個有待處理：\n\n' % len(s) + '\n'.join(s) + '\n\n'
                    + '=' * 30 + ' 逐句 ' + '=' * 30 + '\n' + report)
        else:
            body = head + '，全部乾淨。\n'
    try:
        os.makedirs(os.path.dirname(STOP_LOG), exist_ok=True)
        with open(STOP_LOG, 'w', encoding='utf-8') as f:
            f.write(body)
    except Exception:
        pass


if __name__ == '__main__':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass
    if len(sys.argv) < 2:
        print(__doc__); sys.exit(0)
    if sys.argv[1] == '--hook-post':
        hook_post(); sys.exit(0)
    if sys.argv[1] == '--hook-stop':
        hook_stop(); sys.exit(0)
    if sys.argv[1] == '--建專名表':
        build_names(); sys.exit(0)
    for p in walk(sys.argv[1:]):
        check(p)
