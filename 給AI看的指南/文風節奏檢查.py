# -*- coding: utf-8 -*-
"""文風節奏檢查：抓碎句與縮寫名詞。
用法：python 給AI看的指南/文風節奏檢查.py <檔或資料夾>...   （.md 創作稿、.json 對話檔都吃）
      --hook-post／--hook-stop 是給 .claude/settings.json 的 hook 用的，從 stdin 讀 JSON。
規矩出處：武俠文風創作指南 第四節旁白卡第 4 條、娜娜卡〈節奏〉、乙類〈不縮名詞〉、自檢 4a。
"""
import sys, os, re, json, statistics as st

ACTOR = {'MC1': '你', 'MC2': '呂信', 'MC3': '子羽', 'MC4': '賈詡', 'MC5': '徐榮', 'MC6': '張寧', 'MC7': '郭嘉',
         'MC8': '蕭靈犀', 'MC9': '甄筠', 'MC10': '褚人飛', 'MC12': '董卓', 'MC13': '張仲景',
         'MC20': '雍仔', 'MC22': '赫連娜娜', 'MC23': '蔡琰', 'MC24': '蔡邕', 'role2': '旁白', '2': '旁白', '0': '(空)'}
EXEMPT = ('子羽', '郭嘉', '狗頭人', 'Kobold')          # 話少或語言能力特例：碎句不計
COMPOUND_BEFORE = '天機羅棋地命算磨石托圓一幾整半銅玉這那面'
COMPOUND_AFTER = '纏算問查點腿起子踞根桓龍旋繞'


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
    for m in re.finditer(r'[這那]面盤|[這那]盤', raw):
        before = raw[:m.start()]
        if not ('天機盤' in before or '羅盤' in before):
            hits.append(m.group())
    hits += re.findall(r'(?<![一兩三四五六七八九十幾這那半])[這那]面(?=[，。！？」；、]|$)', raw)
    hits += [m.group() for m in re.finditer(r'(?<![' + COMPOUND_BEFORE + r'])盤(?![' + COMPOUND_AFTER + r'])', raw)]
    hits += re.findall(r'那把秤|那把尺|[這那]本帳(?!冊)', raw)
    return hits


def lines_from_json(p):
    for n in json.load(open(p, encoding='utf-8')):
        t = n.get('text', '')
        if not t.strip():
            continue
        spk = ACTOR.get(n.get('actorID'), n.get('actorID'))
        if 'panel=6' in t.lower():
            spk = '旁白'
        yield spk, '#%s' % n.get('entryID'), t


MD_LINE = re.compile(r'^\*\*([^*]+?)(?:\s*\(MC\d+\))?:\*\*\s*：?\s*(?:`#(\d+)`\s*)?(.*)$')


def lines_from_md(p):
    for i, line in enumerate(open(p, encoding='utf-8'), 1):
        m = MD_LINE.match(line.strip())
        if not m:
            continue
        spk, eid, t = m.group(1).strip(), m.group(2), m.group(3)
        if not t.strip() or spk in ('Sequence', 'Script'):
            continue
        yield spk, ('#%s' % eid if eid else 'L%d' % i), t


def check(p):
    gen = lines_from_json(p) if p.endswith('.json') else lines_from_md(p)
    per = {}; frags = []; nouns = []; flagged = []
    em_lines = 0; talk_lines = 0; em_consec = []; prev_em = None
    for spk, eid, t in gen:
        if spk != '旁白':
            talk_lines += 1
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
        for h in noun_hits(t):
            nouns.append((spk, eid, h))
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
    if nouns:
        print('-- 縮寫／隱喻名詞（「那本帳」若是真帳本可留）：')
        for spk, eid, h in nouns:
            print('   %s %s 「%s」' % (spk, eid, h))
    allowed = max(1, talk_lines // 10)
    em_bad = em_lines > allowed or bool(em_consec)
    if talk_lines:
        print('-- em7：%d／%d 格台詞（每十格至多一個，上限 %d）%s' % (em_lines, talk_lines, allowed, '  ⚠ 太多' if em_lines > allowed else ''))
    if em_consec:
        print('-- 同一人連續兩格都掛 em7：' + '、'.join('%s %s' % x for x in em_consec))
    if not frags and not nouns and not em_bad:
        print('-- 乾淨。')
    return {'file': p, 'flagged': flagged, 'frags': len(frags), 'nouns': len(nouns), 'em7_bad': em_bad}


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
        if r['flagged'] or r['frags'] or r['nouns'] or r.get('em7_bad'):
            bits = []
            if r['flagged']:
                bits.append('太碎：' + '、'.join(r['flagged']))
            if r['frags']:
                bits.append('碎句 %d' % r['frags'])
            if r['nouns']:
                bits.append('縮寫名詞 %d' % r['nouns'])
            if r.get('em7_bad'):
                bits.append('em7 過量或連掛')
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
    s = summary(results)
    if s:
        out['systemMessage'] = '文風節奏檢查 ' + '；'.join(s) + '（已回饋給 Claude）'
    print(json.dumps(out, ensure_ascii=True))


def hook_stop():
    import subprocess
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
    if not files:
        return
    _, results = run_quiet(files)
    s = summary(results)
    if s:
        print(json.dumps({'systemMessage': '文風節奏檢查（本輪改過、還沒 commit 的檔）：' + '；'.join(s)}, ensure_ascii=True))


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
    for p in walk(sys.argv[1:]):
        check(p)
