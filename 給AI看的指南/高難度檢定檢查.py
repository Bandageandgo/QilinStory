# -*- coding: utf-8 -*-
"""高難度檢定提案檔的格式檢查：選項格式、擲骰四段、成敗分支、留白與禁用、Description 詞表、em7、新格編號、禁詞。
用法：python -X utf8 給AI看的指南/高難度檢定檢查.py <提案檔.md>...
規矩出處：給AI看的指南/高難度檢定走向指南.md 第一節〈選項格式〉、第四節引擎寫法、第六節、第七之二節；
        劇情/轉成json指南.md §1 Description 詞表、§4.2；給AI看的指南/擲骰指令轉換規則.md〈常用檢定項目ID對照〉；CLAUDE.md 硬紅線。
只管格式與留白，不管文風（文風跑 文風節奏檢查.py）。有「錯誤」就 exit 1。
"""
import sys, os, re, glob

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

MOTTO = {'禍兮福倚，福兮禍伏': '福禍', '知其一，不知其二': '未卜', '置之死地，而後生': '轉機'}
CLASSES = ('福禍', '未卜', '轉機')
CHECK_LABELS = {'統率檢定', '武力檢定', '智力檢定', '政治檢定', '魅力檢定', '梟雄檢定', '英雄檢定', '弓術檢定', '武藝檢定',
                '內功檢定', '騎術檢定', '威嚇檢定', '洞悉檢定', '謀略檢定', '學識檢定', '醫術檢定', '厚黑檢定', '經濟檢定',
                '口才檢定', '調情檢定', '酒量檢定', '巧手檢定', '奪寶檢定'}
FEAT_IDS = {'LeadershipCheck', 'StrengthCheck', 'IntelligenceCheck', 'PoliticsCheck', 'CharismaCheck', 'OverlordCheck',
            'HeroCheck', 'ArcheryCheck', 'MartialArtsCheck', 'QiCheck', 'HorsemanshipCheck', 'IntimidationCheck',
            'InsightCheck', 'StrategyCheck', 'KnowledgeCheck', 'MedicalExpertiseCheck', 'RealpolitikCheck',
            'EconomicDevelopmentCheck', 'PersuasionCheck', 'FlirtingCheck', 'AlcoholToleranceCheck', 'SleightOfHandCheck',
            'TreasureHuntingCheck'}
HARD_WORDS = ('五胡亂華', '司馬', '篡魏', '三國歸晉', '輪迴', '重來', '前世')
TAOTIE_WORDS = ('燙', '熱', '顫', '震')
DESC_EXACT = {'任務更新', '變數更新', '超級大漢人', '信義提升', '通達提升', '仁心提升', '機略提升', '給錢', '扣錢', '開啟便籤',
              '獲得技能卡', '獲得機會點', '時間前進', '加入隊伍', '離隊', '場上人物更換', '擲骰緩衝節點', '檢定成功', '檢定失敗',
              '戰鬥緩衝節點', '戰鬥成功', '戰鬥失敗', '播放音樂', '切換音樂', '關閉音樂', '轉場', '事件圖', '關閉事件圖',
              '開啟背景', '關閉背景', '清除立繪', '結局', '開啟商店', '地圖鎖定', '提示', '教學', '小遊戲', '切換場景'}
DESC_PATTERNS = [r'^選項：(福禍|未卜|轉機)$', r'^好感度(提升|下降)$', r'^觸發任務：.+', r'^完成任務：.+', r'^任務失敗：.+', r'^.+好感度(提升|下降)$', r'^.+經驗(增加|減少)$',
                 r'^獲得.+', r'^失去.+', r'^選項\d+$', r'^.+檢定$', r'^(文化|背景)分支：.+', r'^進入戰鬥(：.+)?$']
AUTHOR_TEACH = {'ManualDiceRollEX'}   # 作者 2026-09-26 定：高難度檢定教學，只掛在碰瓷骰子亮之後那一格空格
AUTHOR_VARS = {'IsHidden1', 'XianbeiCampChaos'}   # 作者親自取名或准 AI 取名、還沒進 Json 的變數；未卜一律 IsHiddenN（走向指南第四節第 8 條）；XianbeiCampChaos＝鮮卑王帳計亂（作者 2026-09-29 准）
GLOW = '[panel=6]＊（懷裡的麒麟骰亮了一亮。光隔著衣襟透出來，隨即又暗了。）＊'   # 七之二固定句，一字不改
PUNCT = '，。！？、；：…—」』）'


def existing_names():
    """從 Json/ 撈既有的變數名、任務號、教學 ID，判斷提案有沒有自創名字。"""
    vars_, quests, teach = set(), set(), set()
    for f in glob.glob(os.path.join(ROOT, 'Json', '**', '*.json'), recursive=True):
        try:
            s = open(f, encoding='utf-8').read()
        except Exception:
            continue
        vars_.update(re.findall(r'Variable\[\\"([^\\"]+)\\"\]', s))
        quests.update(re.findall(r'(?:SetQuestState|SetQuestEntryState|CurrentQuestState|CurrentQuestEntryState)\(\\"([^\\"]+)\\"', s))
        teach.update(re.findall(r'ShowNoviceTeaching\(([^)]+)\)', s))
    return vars_, quests, teach


def is_line_dialogue(line):
    s = line.strip()
    return s.startswith('**') and ':**' in s or s.startswith('「') or '[panel=' in s


def check_file(path, names):
    vars_, quests, teach = names
    errs, warns = [], []
    text = open(path, encoding='utf-8').read()
    lines = text.split('\n')
    head = '\n'.join(lines[:5])
    file_class = next((c for c in CLASSES if f'（{c}）' in head), None)
    if not file_class:
        warns.append((1, '檔頭沒寫分類（福禍／未卜／轉機），題語與分類的對照沒法查'))
    if '創作稿／提案' not in head:
        errs.append((1, '檔頭第一行要有「創作稿／提案，尚未進 JSON」'))

    n_dice = 0
    has_plain_check = False; has_hard = False
    n_true = text.count('IsPassDice() == true')
    n_false = text.count('IsPassDice() == false')
    n_cell = 0
    n_em7 = 0
    for i, line in enumerate(lines, 1):
        s = line.strip()
        if re.match(r'^\*\*[^*]+:\*\*', s):
            n_cell += 1
            if re.match(r'^\*\*[^*]+:\*\*\s*`#\d+`', s):
                warns.append((i, '這格帶了 entryID，若是新格不該編號（作者續號）'))
        n_em7 += line.count('[em7]')
        for m in re.finditer(r'\[/em7\](.)', line):
            if m.group(1) not in PUNCT:
                errs.append((i, f'[/em7] 後面要接標點，現在接的是「{m.group(1)}」'))

        # 選項格式（反引號裡引用格式的說明文字不算）
        for m in re.finditer(r'\[em2\]\[([^\]]+)\]\[/em2\]', line):
            if line[:m.start()].count('`') % 2 == 1:
                continue
            label = m.group(1)
            if '・' in label or any(c in label for c in CLASSES):
                errs.append((i, f'選項標籤「{label}」是舊格式：分類名不進標籤，題語另放 [em3]'))
                continue
            if label.endswith('檢定') and label not in CHECK_LABELS:
                errs.append((i, f'「{label}」不是遊戲既有的檢定標籤（沒有「說服檢定」這類，口才即 PersuasionCheck）'))
            tail = line[m.end():]
            m3 = re.match(r'\s*\[em3\]([^\[]+)\[/em3\](.*)$', tail)
            is_diff = re.match(r'^難度[：:]\s*(\d+|＿＿)$', label)
            if label.startswith('難度') and (not is_diff or '：' not in label):
                errs.append((i, f'難度標籤「{label}」要寫成 [難度：N]（全形冒號，N 是數字或 ＿＿）'))
            if label.endswith('檢定'):
                has_plain_check = True
            if m3:
                has_hard = True
                # 2026-10-01 作者以碰瓷定樁：高難度選項標籤寫 [難度：N]，題語帶「」和句號
                if not label.startswith('難度'):
                    errs.append((i, f'高難度選項的標籤是舊格式「{label}」：改成 [em2][難度：N][/em2]，檢定名不上選單（2026-10-01）'))
                raw_motto = m3.group(1).strip()
                if not (raw_motto.startswith('「') and raw_motto.endswith('。」')):
                    errs.append((i, f'題語要帶「」和句號，寫成 [em3]「{raw_motto.strip("「」。")}。」[/em3]（2026-10-01）'))
                motto, rest = raw_motto.strip('「」。'), m3.group(2)
                if motto not in MOTTO:
                    errs.append((i, f'題語「{motto}」不在三句已定題語裡'))
                elif file_class and MOTTO[motto] != file_class:
                    errs.append((i, f'題語「{motto}」是{MOTTO[motto]}的，本檔是{file_class}'))
                if rest.strip().strip('*').strip():
                    errs.append((i, '高難度選項 [/em3] 後面不再接字：選單上不放主角的話，話留給擲骰後的發言格'))
                if any(c in rest for c in CLASSES):
                    errs.append((i, '選項上不出現福禍／未卜／轉機三個詞'))
                if '麒麟骰：' in line or '[em3]兆' in line:
                    warns.append((i, '題語前的「麒麟骰：」或「兆」字，指南建議不冠（作者定）'))

        # 擲骰格
        if 'DiceRoll(' in line:
            if 'BeginDiceRoll(' not in line:
                errs.append((i, '沒有 DiceRoll 這個指令，要寫 BeginDiceRoll'))
            for m in re.finditer(r'BeginDiceRoll\(\s*(\w+)\s*,\s*(\w+)\s*,\s*([^)]+)\)', line):
                n_dice += 1
                mode, feat, diff = m.group(1), m.group(2), m.group(3).strip()
                if mode != 'Manual':
                    errs.append((i, f'高難度只做手動檢定，這格是 {mode}'))
                if feat not in FEAT_IDS:
                    errs.append((i, f'FeatID「{feat}」不在擲骰指令轉換規則的對照表裡'))
                if not re.fullmatch(r'\d+|＿＿', diff):
                    errs.append((i, f'難度「{diff}」要是數字或 ＿＿'))
                for seg in ('SetContinueMode(false)', 'SetContinueMode(original)@Message(EndRoll)', 'Continue()@Message(EndRoll)'):
                    if seg not in line:
                        errs.append((i, f'擲骰格的 Sequence 少了「{seg}」（四段包裝）'))

        # 禁用與留白
        if 'SetFlag' in line or 'GetFlag' in line:
            errs.append((i, 'SetFlag／GetFlag 不是引擎指令，禁用'))
        for m in re.finditer(r'Variable\["([^"]+)"\]', line):
            v = m.group(1)
            if v != '＿＿' and v not in vars_ and v not in AUTHOR_VARS and not re.fullmatch(r'IsHidden\d+', v):
                errs.append((i, f'變數「{v}」不是既有變數，新變數一律留 ＿＿ 給作者建'))
        for m in re.finditer(r'(?:SetQuestState|SetQuestEntryState|CurrentQuestState|CurrentQuestEntryState)\("([^"]+)"', line):
            q = m.group(1)
            if q != '＿＿' and q not in quests:
                errs.append((i, f'任務號「{q}」不是既有任務，新任務一律留 ＿＿'))
        for m in re.finditer(r'ShowNoviceTeaching\(([^)]+)\)', line):
            t = m.group(1).strip()
            if t != '＿＿' and t not in teach and t not in AUTHOR_TEACH:
                errs.append((i, f'教學 ID「{t}」不是既有 ID，新 ID 留 ＿＿'))
        if re.match(r'^\s*-\s*title\s*:', line):
            errs.append((i, 'title 是作者的欄位，新格不寫'))

        # Description 詞表
        m = re.match(r'^\s*-\s*Description\s*[:：]\s*(.+)$', line)
        if m:
            raw = m.group(1).strip().strip('`').strip()
            for tok in [t.strip() for t in re.split(r'[、,，]', raw) if t.strip()]:
                if tok in DESC_EXACT or any(re.match(p, tok) for p in DESC_PATTERNS):
                    if re.search(r'\d', tok) and not re.match(r'^選項\d+$', tok):
                        (errs.append((i, f'Description「{tok}」帶數字，數值不進這欄')) if not re.match(r'^(觸發任務|完成任務|任務失敗)：CF\d+$', tok) else None)  # 任務號 CF 帶數字不算數值（2026-09-30）
                    continue
                if tok in ('無', '（無）', '不寫', '—', '-'):
                    continue
                warns.append((i, f'Description「{tok}」不在 §1 詞表，確認是不是說明文'))

        # 骰子亮的旁白要是固定句
        if '麒麟骰' in line and '亮' in line and '[panel=6]' in line and GLOW not in line and line.count('`') == 0:
            warns.append((i, '骰子亮的旁白不是七之二固定句（一字不改）'))

        # 禁詞與饕餮的字
        if is_line_dialogue(line):
            for w in HARD_WORDS:
                if w in line:
                    errs.append((i, f'硬紅線詞「{w}」不得進文本'))
            if '骰' in line and any(w in line for w in TAOTIE_WORDS):
                errs.append((i, '骰子的格只寫亮，不寫燙、熱、顫、震（那是饕餮的字）'))

    if n_dice and (n_true == 0 or n_false == 0):
        errs.append((0, f'有 {n_dice} 個擲骰格，但 IsPassDice() == true／false 分支首格不齊（true {n_true}、false {n_false}）'))
    if n_dice == 0:
        warns.append((0, '整檔沒有 BeginDiceRoll，高難度提案至少要有一個擲骰格'))
    if has_hard and has_plain_check:
        warns.append((0, '有高難度檢定的選單，同選單的一般檢定也要寫 [em2][難度：N][/em2]、不寫檢定名（2026-10-01 碰瓷定樁）；別的選單的 [XX檢定] 不受影響，確認這幾個標籤屬於哪個選單'))
    if n_cell and n_em7 > max(1, -(-n_cell // 10)):
        warns.append((0, f'em7 {n_em7} 個／{n_cell} 格，超過每十格至多一個'))
    return errs, warns


def main(paths):
    names = existing_names()
    total_err = 0
    for p in paths:
        if os.path.isdir(p):
            files = sorted(glob.glob(os.path.join(p, '高難度檢定_*.md')))
        else:
            files = [p]
        for f in files:
            errs, warns = check_file(f, names)
            print(f'== {f}')
            for ln, msg in errs:
                print(f'  [錯誤] 第 {ln} 行：{msg}')
            for ln, msg in warns:
                print(f'  [警告] 第 {ln} 行：{msg}')
            print(f'  -- 錯誤 {len(errs)}、警告 {len(warns)}' + ('，乾淨。' if not errs and not warns else ''))
            total_err += len(errs)
    return 1 if total_err else 0


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(2)
    sys.exit(main(sys.argv[1:]))
