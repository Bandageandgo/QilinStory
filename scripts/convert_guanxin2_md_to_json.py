# -*- coding: utf-8 -*-
"""Convert 觀心.md (lines 585-891) sections to 觀心2.json per 轉成json指南.md"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT_PATH = ROOT / "Json檔" / "觀心2.json"

ACTOR_MAP = {
    "旁白": 2,
    "燕不凡": "MC1",
    "燕不凡（內心）": "MC1",
    "李四": "李四",
    "徐榮": "MC5",
    "大樹守衛": "role133",
}

ENDING_TEXT = "[panel=6]＊（你睜開眼，膝上的麒麟骰靜靜躺著。方才不論怎麼想，心裡那股亂念，總算沉了下去。）＊"
ENDING_SEQ = "DisableCharacterExpression(0);SetPortrait(MC1,pic=8);"

DICE_SUCCESS_TEXT = "[panel=6]＊（骰子在掌心跳了跳，像是有回音應了你的念頭。）＊"
DICE_SUCCESS_SEQ = (
    "DisableDialogueBG();DisableEventBG();EnableDialogueBG(Ye);"
    "OpenPanel(1, close);OpenPanel(2, close);Continue();"
)

EVENTS = [
    {
        "trigger": "觀心：黑鐵嶺礦坑",
        "trigger_desc": "觀心觸發：完成黑鐵嶺深淵祭壇",
        "recall": [
            (
                "旁白",
                "[panel=6]＊（礦坑入口的告示板上寫著——[em2]鹽鐵之利，國之大柄[/em2]；[em2]私吞礦石者，斬；私鑄兵器者，族誅[/em2]。）＊",
                "",
            ),
            (
                "旁白",
                "[panel=6]＊（雲中廣場上，李四額頭磕得流血，哭喊著：黑鐵嶺吃人了——三十里外的礦坑裡，符咒剝落的鐵門後，是腐爛與硫磺的濁氣。）＊",
                "",
            ),
            (
                "李四",
                "「救命啊！救救大山！救救我家媳婦！黑鐵嶺……黑鐵嶺吃人了啊！」",
                "",
            ),
            (
                "旁白",
                "[panel=6]＊（監工日記上寫著——深層岩壁裡挖到[em2]紅色水晶[/em2]，大山說那是「[em2]神[/em2]」的眼睛；工人們在膜拜；最後一頁：[em2]逃不掉了…門被鎖了…大山說，我們都是祭品…[/em2]）＊",
                "",
            ),
            (
                "旁白",
                "[panel=6]＊（祭壇中央，泥塑小人像額頭嵌著第三隻眼——妖異紅光，像活物般跳動。李大山滿身黑筋，喃喃要獻血給神。）＊",
                "",
            ),
        ],
        "transition": (
            "[panel=6]＊（你盤膝靜坐，礦坑裡讀過的字句，在心底一字一字凝成幾句——）＊",
            "",
        ),
        "transition_echo": (
            "[panel=6]＊（[em2]恰如裸身臥荒丘，潛伏爪牙只忍受；飄蓬江海謾嗟吁。鐵門一鎖！難逃脫！[/em2]）＊",
            "SetPortrait(MC1,pic=12);EnableCharacterExpression(0,MC1-1,Meditate);",
        ),
        "dice_disable": "",
        "inner": [
            (
                "「告示上寫著[em2]鹽鐵之利，國之大柄[/em2]，私吞者斬。這些礦工挖了一輩子，到頭來連一塊礦渣都換不了一頓飽飯。」",
                "SetPortrait(MC1,pic=12);EnableCharacterExpression(0,MC1-1,Meditate);",
            ),
            (
                "「出事了，官府不查，只會把鐵門一鎖。對上面來說，這礦坑裡埋的哪是人，不過是幾斤[em2]鹽鐵之利[/em2]罷了。」",
                "DisableCharacterExpression(0);SetPortrait(MC1,pic=12);EnableCharacterExpression(0,MC1-1,Meditate);",
            ),
            (
                "「大山說[em2]我們都是祭品[/em2]……人在這種叫天不應的絕境裡，看見顆會發光的紅水晶，哪能不把它當神拜？」",
                "DisableCharacterExpression(0);SetPortrait(MC1,pic=11);EnableCharacterExpression(0,MC1-1,Pain);",
            ),
            (
                "「可李四在村口磕破了頭，他只知道黑鐵嶺吃人。誰又在乎是官逼的，還是這蒼天要的呢？」",
                "DisableCharacterExpression(0);SetPortrait(MC1,pic=14);EnableCharacterExpression(0,MC1-1,Question);",
            ),
        ],
        "options": [
            (
                "信義",
                "「管他官府封不封，人命不能這樣填進去。」",
                "「官府鐵門一鎖，就想把這筆爛帳埋了。但若由著他們把人當祭品填進去，這天下還有什麼俠義可言？」",
                "DisableCharacterExpression(0);SetPortrait(MC1,pic=8);EnableCharacterExpression(0,MC1-1,Meditate);ModifyData(DnDAlignment,Player,LawChaos,0.05);",
            ),
            (
                "仁心",
                "「李大山他們……其實只是想活下去吧。」",
                "「人被逼到絕路竟至到拜一塊來路不明的神像。而李四額頭上的血…人命才是這黑鐵嶺最該看重的事情。」",
                "DisableCharacterExpression(0);SetPortrait(MC1,pic=8);EnableCharacterExpression(0,MC1-1,Pain);ModifyData(DnDAlignment,Player,GoodEvil,0.05);",
            ),
            (
                "通達",
                "「官老爺的刀，地底下的神……」",
                "「上面有國之大柄壓著，下面有吃人的紅水晶等著。換作是我，也只能跟他們一樣潛伏忍受嗎？」",
                "DisableCharacterExpression(0);SetPortrait(MC1,pic=15);EnableCharacterExpression(0,MC1-1,Meditate);ModifyData(DnDAlignment,Player,LawChaos,-0.05);",
            ),
            (
                "機略",
                "「借神鬼之名掩蓋人禍，這水深得很。」",
                "「[em2]鹽鐵之利[/em2]才是根源。這所謂的妖邪，怕是有人巴不得它鬧大，好掩蓋下面見不得光的勾當。」",
                "DisableCharacterExpression(0);SetPortrait(MC1,pic=12);EnableCharacterExpression(0,MC1-1,Idea);ModifyData(DnDAlignment,Player,GoodEvil,-0.05);",
            ),
        ],
    },
    {
        "trigger": "觀心：趙王洞血煞",
        "trigger_desc": "觀心觸發：完成趙王洞祭壇前廳戰鬥",
        "recall": [
            (
                "旁白",
                "[panel=6]＊（血色與黑霧吞沒視線。胸口那股飢餓如野火竄起——不只是妖物與同伴，那是一股想要[em2]吞噬天下[/em2]的狂妄衝動。）＊",
                "",
            ),
            (
                "旁白",
                "[panel=6]＊（腦中有個聲音步步進逼：[em2]吞噬這一切[/em2]。指甲掐進掌心，五臟六腑像要裂開。）＊",
                "",
            ),
            ("旁白", "「總有一天，你會心甘情願祈求吾的。」", ""),
            (
                "旁白",
                "[panel=6]＊（飢餓驟退。你撐不住昏死過去。迷濛中，一雙寬大的手把你從地上拉起——）＊",
                "",
            ),
            (
                "徐榮",
                "「……小子，你能撐到現在，是個漢子。剩下的交給我吧！」",
                "SetPortrait(MC5,pic=8);",
            ),
        ],
        "transition": (
            "[panel=6]＊（你盤膝靜坐，趙王洞裡那股腥甜氣息，又像貼著喉嚨爬了上來。種種邪念，在心底一字一字凝成幾句——）＊",
            "",
        ),
        "transition_echo": (
            "[panel=6]＊（[em2]突生吞噬天下意，此念原非吾本心；咬牙拒作吞噬奴。誰為主！還未知曉！[/em2]）＊",
            "DisableCharacterExpression(1);SetPortrait(MC1,pic=11);EnableCharacterExpression(0,MC1-1,Pain);",
        ),
        "dice_disable": "",
        "inner": [
            (
                "「戰後倒在地上，滿腦子只剩[em2]吞噬[/em2]。那一瞬，不管是妖物、同伴，還是這天地萬物……竟都成了我想一口吞下的微塵。」",
                "DisableCharacterExpression(0);SetPortrait(MC1,pic=11);EnableCharacterExpression(0,MC1-1,Pain);",
            ),
            (
                "「那股飢火勒住喉嚨，逼著我在[em2]吞噬[/em2]與[em2]被吞噬[/em2]之間選一個。[em2]此念原非吾本心[/em2]……但我記不得自己是撐住了，還是已經讓步了半寸。」",
                "DisableCharacterExpression(0);SetPortrait(MC1,pic=12);EnableCharacterExpression(0,MC1-1,Meditate);",
            ),
            (
                "「洞裡那個聲音說，[em2]總有一天你會心甘情願祈求吾[/em2]。……連是人是鬼都說不清，卻像是在我心底扎了根。」",
                "DisableCharacterExpression(0);SetPortrait(MC1,pic=14);EnableCharacterExpression(0,MC1-1,Question);",
            ),
            (
                "「這副身子裡，[em2]誰為主[/em2]？……醒來時人在英豪府，賈詡卻留了卷竹簡。這一切，難道不是巧合？」",
                "DisableCharacterExpression(0);SetPortrait(MC1,pic=12);EnableCharacterExpression(0,MC1-1,Meditate);",
            ),
        ],
        "options": [
            (
                "信義",
                "「祈求牠？……就算死，我也不答應。」",
                "「沒有人可以控制我。我手裡的刀，劈的是我自己選的路。那個聲音想讓我當[em2]吞噬奴[/em2]？我死也不認這命。」",
                "DisableCharacterExpression(0);SetPortrait(MC1,pic=8);EnableCharacterExpression(0,MC1-1,Meditate);ModifyData(DnDAlignment,Player,LawChaos,0.05);",
            ),
            (
                "仁心",
                "「這股力量太邪……絕不能讓它傷了自己人。」",
                "「最駭人的不是那怪聲，是我竟把娜娜、雍仔當成了微塵肉塊。這力量再強，若是會傷了同伴、傷了靈犀，我拼死也得把它死死按住。」",
                "DisableCharacterExpression(0);SetPortrait(MC1,pic=11);EnableCharacterExpression(0,MC1-1,Pain);ModifyData(DnDAlignment,Player,GoodEvil,0.05);",
            ),
            (
                "通達",
                "「管它什麼力量，現在沒事就好。」",
                "「是人是鬼、誰做主……想破頭也沒用。反正這股力量現在安分了，人也活著回來了。是福是禍，走一步看一步吧。哈哈。」",
                "DisableCharacterExpression(0);SetPortrait(MC1,pic=15);EnableCharacterExpression(0,MC1-1,Meditate);ModifyData(DnDAlignment,Player,LawChaos,-0.05);",
            ),
            (
                "機略",
                "「若是這『吞噬』之力能為我所用……」",
                "「[em2]吞噬天下[/em2]……這力量若是能被我駕馭，還有什麼成不了的事？只要能讓我變強，管它是妖是魔。誰為主？自然是我來做它的主！」",
                "DisableCharacterExpression(0);SetPortrait(MC1,pic=12);EnableCharacterExpression(0,MC1-1,Idea);ModifyData(DnDAlignment,Player,GoodEvil,-0.05);",
            ),
        ],
    },
    {
        "trigger": "觀心：大樹守衛三才門",
        "trigger_desc": "觀心觸發：完成英豪府遴選大樹守衛大澈大悟",
        "recall": [
            (
                "旁白",
                "[panel=6]＊（大樹守衛摘下那頂可笑的水桶，露出一張滄桑的臉龐。他眼神清明，再無半分瘋癲。）＊",
                "",
            ),
            (
                "大樹守衛",
                "「我本是『三才門』的三師弟。當年為了湊齊三絕，我與大師兄聯手，將二師哥逼上了絕路。」",
                "",
            ),
            (
                "大樹守衛",
                "「我苦尋『四神拳』不得，執念深種入骨。最終走火入魔……」",
                "",
            ),
        ],
        "transition": (
            "[panel=6]＊（你盤膝靜坐，看著他牽驢遠去的背影。這百年的恩怨糾葛，在心底一字一字凝成幾句——）＊",
            "",
        ),
        "transition_echo": (
            "[panel=6]＊（[em2]手足相煎爭殘篇，執念入魔守空樹；一敗夢醒傳三才。恩怨散盡隱山林！[/em2]）＊",
            "DisableCharacterExpression(0);SetPortrait(MC1,pic=12);EnableCharacterExpression(0,MC1-1,Meditate);",
        ),
        "dice_disable": "",
        "inner": [
            (
                "「為了三絕合一[em2]逼死同門[/em2]……那無字碑下的二師哥，到死只盼著來生能做個普通兄弟。」",
                "SetPortrait(MC1,pic=12);EnableCharacterExpression(0,MC1-1,Meditate);",
            ),
            (
                "「大樹哥[em2]執念深種[/em2]，瘋瘋癲癲守了半輩子樹……這天下第一的武功，竟能把人折磨成這副鬼樣子。」",
                "DisableCharacterExpression(0);SetPortrait(MC1,pic=12);EnableCharacterExpression(0,MC1-1,Meditate);",
            ),
        ],
        "options": [
            (
                "信義",
                "「同門這份情分，怎能說扔就扔。」",
                "「大師兄和他先壞了規矩，才把二師哥逼上絕路。要是換成我，寧可不要這[em2]三絕合一[/em2]，也絕不幹這種[em2]逼死同門[/em2]的勾當。」",
                "DisableCharacterExpression(0);SetPortrait(MC1,pic=8);EnableCharacterExpression(0,MC1-1,Meditate);ModifyData(DnDAlignment,Player,LawChaos,0.05);",
            ),
            (
                "仁心",
                "「那句只盼來生做兄弟……聽著真讓人心酸。」",
                "「無字碑下那位前輩，到死只盼來生能做個普通兄弟……要是換成我，光是想到這句話，這拳譜再怎麼天下無敵，拿在手裡也嫌燙手。」",
                "DisableCharacterExpression(0);SetPortrait(MC1,pic=11);EnableCharacterExpression(0,MC1-1,Pain);ModifyData(DnDAlignment,Player,GoodEvil,0.05);",
            ),
            (
                "通達",
                "「爭不到的東西，一開始就不該惦記。」",
                "「為了湊齊絕學把自己逼瘋，真是何苦來哉。要是換成我，這[em2]三絕合一[/em2]不要便是了，帶著自己本來的功夫下山逍遙，不比在這荒郊野外守半輩子樹強？哈哈。」",
                "DisableCharacterExpression(0);SetPortrait(MC1,pic=15);EnableCharacterExpression(0,MC1-1,Meditate);ModifyData(DnDAlignment,Player,LawChaos,-0.05);",
            ),
            (
                "機略",
                "「逼死同門又把自己逼瘋，這條路也太虧了。」",
                "「跟人聯手鬧出人命，又為了一本拳法把自己逼成瘋子。這盤棋怎麼算怎麼賠本。要是換成我，[em2]三絕合一[/em2]總有別的法子，犯不著把自己搭進去。」",
                "DisableCharacterExpression(0);SetPortrait(MC1,pic=12);EnableCharacterExpression(0,MC1-1,Idea);ModifyData(DnDAlignment,Player,GoodEvil,-0.05);",
            ),
        ],
    },
]


class Builder:
    def __init__(self):
        self.nodes = []
        self.eid = 0

    def add(self, actor, text, sequence="", links=None, description=None, condition=None):
        node = {
            "entryID": self.eid,
            "actorID": ACTOR_MAP.get(actor, actor if actor != "旁白" else 2),
            "text": text,
            "Sequence": sequence,
            "links": links if links is not None else [],
        }
        if description:
            node["Description"] = description
        if condition is not None:
            node["Condition"] = condition
        self.nodes.append(node)
        self.eid += 1
        return node["entryID"]

    def build_event(self, event):
        root = self.add(
            "MC0",
            event["trigger_desc"],
            "// TODO: SetQuestState or觀心觸發條件",
            [],
            f"觀心事件入口：{event['trigger']}",
        )
        prev = root
        for actor, text, seq in event["recall"]:
            nid = self.add(actor, text, seq, [])
            self.nodes[prev]["links"] = [nid]
            prev = nid

        trans_id = self.add(2, event["transition"][0], event["transition"][1], [])
        self.nodes[prev]["links"] = [trans_id]
        prev = trans_id

        if event.get("transition_echo"):
            echo_id = self.add(2, event["transition_echo"][0], event["transition_echo"][1], [])
            self.nodes[prev]["links"] = [echo_id]
            prev = echo_id

        dice_seq = event.get("dice_disable", "") + "BeginDiceRoll(Auto,InsightCheck,2);"
        dice_id = self.add("MC0", "", dice_seq, [], "自動洞悉檢定觸發點 (難度2)")
        self.nodes[prev]["links"] = [dice_id]

        buffer_id = self.add("MC0", "", "", [], "自動檢定後的空緩衝節點")
        self.nodes[dice_id]["links"] = [buffer_id]

        inner0_text, inner0_seq = event["inner"][0]

        # 失敗：直接接第一句內心；成功：骰子旁白 → 同一句內心
        inner_start_fail = self.add(
            "MC1",
            inner0_text,
            inner0_seq,
            [],
            condition="IsPassDice() == false",
        )
        inner_start_pass = self.add("MC1", inner0_text, inner0_seq, [])
        success_id = self.add(
            2,
            DICE_SUCCESS_TEXT,
            DICE_SUCCESS_SEQ,
            [inner_start_pass],
            condition="IsPassDice() == true",
        )
        self.nodes[buffer_id]["links"] = [success_id, inner_start_fail]

        if len(event["inner"]) > 1:
            inner_merge = self.add("MC1", event["inner"][1][0], event["inner"][1][1], [])
            self.nodes[inner_start_fail]["links"] = [inner_merge]
            self.nodes[inner_start_pass]["links"] = [inner_merge]
            prev = inner_merge
            for text, seq in event["inner"][2:]:
                nid = self.add("MC1", text, seq, [])
                self.nodes[prev]["links"] = [nid]
                prev = nid
        else:
            prev = None

        ending_id = self.add(2, ENDING_TEXT, ENDING_SEQ, [])

        option_ids = []
        for idx, (axis, opt_text, branch_text, branch_seq) in enumerate(event["options"], 1):
            opt_id = self.add("MC1", opt_text, "", [], f"選項{idx}：[{axis}]")
            option_ids.append(opt_id)
            branch_id = self.add("MC1", branch_text, branch_seq, [ending_id])
            self.nodes[opt_id]["links"] = [branch_id]

        self.nodes[prev]["links"] = option_ids if prev is not None else []
        if prev is None:
            self.nodes[inner_start_fail]["links"] = option_ids
            self.nodes[inner_start_pass]["links"] = option_ids


def main():
    b = Builder()
    for ev in EVENTS:
        b.build_event(ev)
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(b.nodes, f, ensure_ascii=False, indent=2)
    print(f"Wrote {len(b.nodes)} nodes to {OUT_PATH}")


if __name__ == "__main__":
    main()
