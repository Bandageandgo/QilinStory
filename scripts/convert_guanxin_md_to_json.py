# -*- coding: utf-8 -*-
"""Convert 觀心.md dialogue sections to 觀心.json per 轉成json指南.md"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MD_PATH = ROOT / "觀心.md"
OUT_PATH = ROOT / "Json檔" / "觀心.json"

ACTOR_MAP = {
    "旁白": 2,
    "燕不凡": "MC1",
    "燕不凡（內心）": "MC1",
    "蕭靈犀": "MC8",
    "赫連娜娜": "MC22",
    "黑血師 (NPC11)": "NPC11",
    "黑血師": "NPC11",
    "雍仔 (MC20)": "MC20",
    "雍仔": "MC20",
    "徐榮": "MC5",
    "短命二郎 (青蛙NPC)": "短命二郎",
    "李四": "李四",
}

EVENTS = [
    {
        "trigger": "觀心：籌措住宿費（初出茅廬之一）",
        "trigger_desc": "觀心觸發：完成初出茅廬之一籌措住宿費",
        "recall": [
            ("旁白", "[panel=6]＊（茶博士那句「長租一個月，約莫三百錢」，跟錢袋裡怎麼數都數不夠的銅板，又一起叮噹作響地冒了出來。）＊", ""),
            ("蕭靈犀", "[panel=2]「三……三百錢？！表哥！我們身上哪有這許多錢！」", "SetPortrait(MC8,pic=4);EnableCharacterExpression(2,MC8,Surprise_2);"),
        ],
        "transition": ("[panel=6]＊（你盤膝靜坐，膝上擺著麒麟骰。茶博士的報價在腦中反覆響著。）＊", "DisableCharacterExpression(2);SetPortrait(MC1,pic=12);EnableCharacterExpression(0,MC1-1,Meditate);"),
        "dice_disable": "DisableCharacterExpression(2);",
        "inner": [
            ("「話本裡的大俠，下山就是行俠仗義、揚名立萬。誰寫過……還得為住宿去煩惱？」", "SetPortrait(MC1,pic=12);EnableCharacterExpression(0,MC1-1,Meditate);"),
            ("「為錢發愁？我跟靈犀流浪這些年，哪天不是在想今天睡哪、明天吃啥。這不算什麼新鮮事。」", "DisableCharacterExpression(0);SetPortrait(MC1,pic=12);EnableCharacterExpression(0,MC1-1,Meditate);"),
            ("「結果馬車要等一個月，客棧一開口——三百錢，還是得照掏照湊。」", "DisableCharacterExpression(0);SetPortrait(MC1,pic=12);EnableCharacterExpression(0,MC1-1,Meditate);"),
            ("「只要一擺個俠客的派頭，甚麼都得花錢，旁人也樂得揩你錢。」", "DisableCharacterExpression(0);SetPortrait(MC1,pic=12);EnableCharacterExpression(0,MC1-1,Meditate);"),
        ],
        "options": [
            ("信義", "「成為大俠這條路雖然辛苦但絕不能退。」", "「三百錢是掏了，床也有了。英豪府還在前頭——大俠的路，總得一步一步走，不能因為窮就退。」", "DisableCharacterExpression(0);SetPortrait(MC1,pic=8);EnableCharacterExpression(0,MC1-1,Meditate);ModifyData(DnDAlignment,Player,LawChaos,0.05);"),
            ("仁心", "「靈犀不能跟著我睡野地。」", "「三百錢是掏了，床也有了。靈犀能睡個安穩覺，比什麼都值。」", "DisableCharacterExpression(0);SetPortrait(MC1,pic=8);EnableCharacterExpression(0,MC1-1,Pain);ModifyData(DnDAlignment,Player,GoodEvil,0.05);"),
            ("通達", "「遊民哪日不為錢愁，有床就好。」", "「三百錢是掏了，床也有了。……算了，明天的事明天再想。哈哈。」", "DisableCharacterExpression(0);SetPortrait(MC1,pic=15);EnableCharacterExpression(0,MC1-1,Meditate);ModifyData(DnDAlignment,Player,LawChaos,-0.05);"),
            ("機略", "「英豪府還遠，這些以後都是小錢。」", "「三百錢是掏了，床也有了。……等我到了英豪府、變成大俠，這些都是小錢啦。哈哈。」", "DisableCharacterExpression(0);SetPortrait(MC1,pic=5);EnableCharacterExpression(0,MC1-1,Proud);ModifyData(DnDAlignment,Player,GoodEvil,-0.05);"),
        ],
    },
    {
        "trigger": "觀心：短命二郎任務",
        "trigger_desc": "觀心觸發：完成短命二郎任務",
        "recall": [
            ("旁白", "[panel=6]＊（你剛推門進房，窗台便傳來接連三聲「噗通」——三隻戴著不同小配件的青蛙排成一列，神氣十足地昂著頭。）＊", ""),
            ("短命二郎 (青蛙NPC)", "「呱哈哈！小子，算你辦事不拖泥帶水！爺的兩位兄弟都找齊了，這筆人情，我們兄弟記下了！」", ""),
            ("蕭靈犀", "[panel=2]「表哥你看！三位都到齊了耶！真的好有排場喔！」", "SetPortrait(MC8,pic=5);EnableCharacterExpression(2,MC8,Surprise_2);"),
            ("短命二郎 (青蛙NPC)", "「咱兄弟不怕天、不怕地，不怕官司；大碗吃酒、大塊吃肉。貪官髒吏撞到爺們，照樣掀個底朝天！」", ""),
            ("燕不凡", "「倒是痛快。」", "DisableCharacterExpression(2);SetPortrait(MC1,pic=14);EnableCharacterExpression(0,MC1-1,Question);"),
            ("短命二郎 (青蛙NPC)", "「打魚一世蓼兒洼，不種青苗不種麻；酷吏贓官都殺盡…罷！罷！！」", ""),
        ],
        "transition": ("[panel=6]＊（[em2]打魚一世蓼兒洼，不種青苗不種麻；酷吏贓官都殺盡。罷！罷！[/em2]）＊", "DisableCharacterExpression(0);SetPortrait(MC1,pic=12);EnableCharacterExpression(0,MC1-1,Meditate);"),
        "dice_disable": "DisableCharacterExpression(0);",
        "inner": [
            ("「[em2]打魚一世蓼兒洼[/em2]：……靠水吃水，風浪裡討活，不求人憐。」", "SetPortrait(MC1,pic=12);EnableCharacterExpression(0,MC1-1,Meditate);"),
            ("「[em2]不種青苗不種麻[/em2]：……不靠田產、不靠門第。」", "DisableCharacterExpression(0);SetPortrait(MC1,pic=12);EnableCharacterExpression(0,MC1-1,Meditate);"),
            ("「[em2]酷吏贓官都殺盡[/em2]：……斬盡欺民害民的貪官惡吏。」", "DisableCharacterExpression(0);SetPortrait(MC1,pic=12);EnableCharacterExpression(0,MC1-1,Meditate);"),
            ("「[em2]罷！罷！[/em2]：……原本他是想說什麼呢？」", "DisableCharacterExpression(0);SetPortrait(MC1,pic=14);EnableCharacterExpression(0,MC1-1,Question);"),
        ],
        "options": [
            ("信義", "「貪官不除，還算什麼俠？」", "「若朝廷縱著貪官惡吏，我等視而不見，還算什麼俠？……但這樣，會不會也算逆賊呢？」", "DisableCharacterExpression(0);SetPortrait(MC1,pic=8);EnableCharacterExpression(0,MC1-1,Meditate);ModifyData(DnDAlignment,Player,LawChaos,0.05);"),
            ("仁心", "「底下百姓受苦，不能視而不見。」", "「酷吏贓官害的是尋常百姓。我若有能力，豈能裝作沒看見？」", "DisableCharacterExpression(0);SetPortrait(MC1,pic=8);EnableCharacterExpression(0,MC1-1,Pain);ModifyData(DnDAlignment,Player,GoodEvil,0.05);"),
            ("通達", "「青蛙唱他的，我先顧好眼前。」", "「歌是好歌，事是難事。……罷了罷了，先顧好靈犀，別的以後再說。」", "DisableCharacterExpression(0);SetPortrait(MC1,pic=15);EnableCharacterExpression(0,MC1-1,Meditate);ModifyData(DnDAlignment,Player,LawChaos,-0.05);"),
            ("機略", "「若能揚名，英豪府說不定也會留意。」", "「話本裡斬奸除惡的大俠，哪個不是名動天下？我若也走這條路……嘿嘿，說不定英豪府那邊也會高看一眼。」", "DisableCharacterExpression(0);SetPortrait(MC1,pic=5);EnableCharacterExpression(0,MC1-1,Proud);ModifyData(DnDAlignment,Player,GoodEvil,-0.05);"),
        ],
    },
    {
        "trigger": "觀心：黑血屍戰鬥",
        "trigger_desc": "觀心觸發：完成初出茅廬之二黑血屍戰鬥",
        "recall": [
            ("旁白", "[panel=6]＊（霧重、墓深、鐵鍊刺耳。你又看見那被鎖在地上的枯瘦身影，和那口被拿起的一瞬間就震動的主墓室。）＊", ""),
            ("黑血師 (NPC11)", "[panel=1]「封印……終於破了……擾吾長眠者，都得死！」", "SetPortrait(NPC11,pic=ferocious);"),
            ("雍仔 (MC20)", "[panel=2]「不……不好！觸動機關了！」", "DisableCharacterExpression(1);SetPortrait(MC20,pic=2);EnableCharacterExpression(2,MC20,Nervous_2);"),
            ("旁白", "[panel=6]＊（黑氣翻湧、血筋暴起，你和雍仔節節敗退。胸口那一下重擊，直到現在想起來，還像悶在骨縫裡。）＊", "DisableCharacterExpression(2);"),
        ],
        "transition": ("[panel=6]＊（你盤膝靜坐，胸口舊傷隱隱發悶。墓中種種又凝成幾句，在心底一字一字浮起——[em2]霧深墓冷，鐵鍊猶鳴。封印既破，長眠者怒。黑氣翻湧，退至骨縫。死裡得生，反強於昔。福禍未卜，心下難安。[/em2]）＊", "DisableCharacterExpression(2);SetPortrait(MC1,pic=11);EnableCharacterExpression(0,MC1-1,Pain);"),
        "dice_disable": "",
        "inner": [
            ("「……好險。張大叔要是晚來半步，我今天就交代在墓裡了。」", "DisableCharacterExpression(0);SetPortrait(MC1,pic=12);EnableCharacterExpression(0,MC1-1,Meditate);"),
            ("「要是真完了……靈犀怎麼辦？她還在客棧裡等著我回來呢。」", "DisableCharacterExpression(0);SetPortrait(MC1,pic=12);EnableCharacterExpression(0,MC1-1,Pain);"),
            ("「……算了，反正沒事。人還活著，別自己嚇自己。」", "DisableCharacterExpression(0);SetPortrait(MC1,pic=15);EnableCharacterExpression(0,MC1-1,Meditate);"),
            ("「可張大叔明明說，旁人受了這傷，十個有九個挺不住。我怎麼覺得……身子反而比以前更輕快？反應靈了，力氣大了，連腦子好像也轉得快些。」", "DisableCharacterExpression(0);SetPortrait(MC1,pic=14);EnableCharacterExpression(0,MC1-1,Question);"),
        ],
        "options": [
            ("信義", "「大俠怎能倒在這種地方。」", "「……張大叔把我拉回來，不是讓我躺在客棧發抖的。」", "DisableCharacterExpression(0);SetPortrait(MC1,pic=8);EnableCharacterExpression(0,MC1-1,Meditate);ModifyData(DnDAlignment,Player,LawChaos,0.05);"),
            ("仁心", "「變強了，才好護住靈犀。」", "「……若是真能變強，也好。靈犀還在客棧等我，我得有本事護她周全。」", "DisableCharacterExpression(0);SetPortrait(MC1,pic=8);EnableCharacterExpression(0,MC1-1,Pain);ModifyData(DnDAlignment,Player,GoodEvil,0.05);"),
            ("通達", "「人還活著就行，怪事以後再說。」", "「……怪事。算了，就當我天生命好。人還活著，別自己嚇自己。哈哈。」", "DisableCharacterExpression(0);SetPortrait(MC1,pic=15);EnableCharacterExpression(0,MC1-1,Meditate);ModifyData(DnDAlignment,Player,LawChaos,-0.05);"),
            ("機略", "「力氣靈了、腦子快了，以後總用得上。」", "「……管他什麼屍氣不屍氣，力氣大了、腦子轉快了，打架能多幾分便宜，就不虧。」", "DisableCharacterExpression(0);SetPortrait(MC1,pic=12);EnableCharacterExpression(0,MC1-1,Idea);ModifyData(DnDAlignment,Player,GoodEvil,-0.05);"),
        ],
    },
    {
        "trigger": "觀心：救赫連娜娜",
        "trigger_desc": "觀心觸發：完成赫連娜娜林中奇遇",
        "recall": [
            ("旁白", "[panel=6]＊（後山深處，三個狗頭人圍著樹上籠子手舞足蹈。籠裡的赫連娜娜一還指揮你擺高手架勢、一邊嘀咕她爹筆記裡的「王霸之氣」怎麼沒用——場面荒唐得不像話。）＊", ""),
            ("赫連娜娜", "[panel=1]「少俠！？你來得正好！……咱倆聯手把它給取了，保證你吃不了虧！」", "SetPortrait(MC22,pic=5);EnableCharacterExpression(1,MC22,Happy);"),
            ("旁白", "[panel=6]＊（繩索斬斷，她拍著灰爬出籠子，張口便是「算無遺策」、「孺子可教」。）＊", "DisableCharacterExpression(1);"),
        ],
        "transition": ("[panel=6]＊（你盤膝靜坐，想起赫連姑娘時靈時不靈的羅盤，和她掛在籠子裡還指揮你擺架勢的模樣。這人，你怎麼看？）＊", "SetPortrait(MC1,pic=12);EnableCharacterExpression(0,MC1-1,Meditate);"),
        "dice_disable": "DisableCharacterExpression(1);",
        "inner": [
            ("「赫連姑娘的主意，時靈時不靈。王霸之氣那套，狗頭人可不買帳。說她靠譜吧，人掛在籠子裡；說她胡扯吧，又總像知道點什麼。」", "SetPortrait(MC1,pic=12);EnableCharacterExpression(0,MC1-1,Meditate);"),
            ("「可當初說後山妖氣沖天、近日宜往一行……這塊她倒沒說錯。後山確實不太對勁。或許，還真有兩下子？」", "DisableCharacterExpression(0);SetPortrait(MC1,pic=14);EnableCharacterExpression(0,MC1-1,Question);"),
        ],
        "options": [
            ("信義", "「見人有難，大俠哪能袖手旁觀。」", "「掛在籠子裡還指揮我擺架勢……但我若轉身就走那也不用在江湖上混了。」", "DisableCharacterExpression(0);SetPortrait(MC1,pic=8);EnableCharacterExpression(0,MC1-1,Meditate);ModifyData(DnDAlignment,Player,LawChaos,0.05);"),
            ("仁心", "「她一個人亂闖後山，放著不管過意不去。」", "「嘴上逞強，人卻掛在籠子裡。後山妖氣又邪，她一個人亂闖，遲早出事。」", "DisableCharacterExpression(0);SetPortrait(MC1,pic=8);EnableCharacterExpression(0,MC1-1,Pain);ModifyData(DnDAlignment,Player,GoodEvil,0.05);"),
            ("通達", "「羅盤時靈時不靈，隨她折騰吧。」", "「救也救了，隨她去吧。……反正閒著也是閒著，多個人也挺熱鬧的。」", "DisableCharacterExpression(0);SetPortrait(MC1,pic=15);EnableCharacterExpression(0,MC1-1,Meditate);ModifyData(DnDAlignment,Player,LawChaos,-0.05);"),
            ("機略", "「妖氣那塊她沒說錯，跟著瞧瞧不吃虧。」", "「妖氣她說中了，羅盤說不定還真有用。救都救了，說不定還能蹭點寶……嘻嘻，英雄救美，說出去也好聽。」", "DisableCharacterExpression(0);SetPortrait(MC1,pic=5);EnableCharacterExpression(0,MC1-1,Proud);ModifyData(DnDAlignment,Player,GoodEvil,-0.05);"),
        ],
    },
    {
        "trigger": "觀心：宗緯家石刻",
        "trigger_desc": "觀心觸發：完成宗緯家瀑布秘境",
        "recall": [
            ("旁白", "[panel=6]＊（雷鳴般的瀑布、水霧裡縱身一躍。你以為要粉身碎骨，卻被水流送入水簾洞——洞中央立着一尊身披戰甲、手持長矛的女神像，與中原女子的溫婉截然不同。）＊", ""),
            ("燕不凡", "「乖乖……這姐姐長得真彪悍！這身裝備，這肌肉線條……嘖嘖，要是活著，怕是一拳能打死我。」", "SetPortrait(MC1,pic=4);EnableCharacterExpression(0,MC1-1,Shock);"),
            ("旁白", "[panel=6]＊（神像基座上刻滿篆文。你湊近細讀——）＊", ""),
            ("旁白", "[panel=6]＊（[em2]吾族本居極西之地，受神諭指引，跨越「逆流之河」來到中土。時值戰國亂世，吾族助秦王掃六合，統天下。然秦王欲求長生，窺視吾族血脈之力。吾族不願為奴，遂隱於深山，封印逆流河口，以此神像鎮之。後世有緣人，若得吾族傳承，當以此力守護蒼生，勿蹈秦王覆轍。[/em2]）＊", ""),
            ("燕不凡", "「極西之地？逆流河？助秦統一？這……這可是驚天大祕密啊！原來歷史書上沒寫的都在這兒呢！」", "DisableCharacterExpression(0);SetPortrait(MC1,pic=4);EnableCharacterExpression(0,MC1-1,Shock);"),
        ],
        "transition": ("[panel=6]＊（你盤膝靜坐，水聲在洞外轟鳴。石刻上的字句，一句一句又浮了上來。）＊", "DisableCharacterExpression(0);SetPortrait(MC1,pic=12);EnableCharacterExpression(0,MC1-1,Meditate);"),
        "dice_disable": "DisableCharacterExpression(0);",
        "inner": [
            ("「[em2]極西之地[/em2]、[em2]逆流之河[/em2]……他們不是尋常中原人，是從別處來的。」", "SetPortrait(MC1,pic=12);EnableCharacterExpression(0,MC1-1,Meditate);"),
            ("「[em2]助秦王掃六合[/em2]……幫過皇帝打天下，功勞不小；可[em2]秦王欲求長生[/em2]，要的不是感恩，是血脈。」", "DisableCharacterExpression(0);SetPortrait(MC1,pic=12);EnableCharacterExpression(0,MC1-1,Meditate);"),
            ("「[em2]不願為奴[/em2]……所以躲進深山，[em2]封印河口[/em2]，用這神像鎮著。不是逃，是守。」", "DisableCharacterExpression(0);SetPortrait(MC1,pic=12);EnableCharacterExpression(0,MC1-1,Meditate);"),
            ("「最後那句——[em2]守護蒼生，勿蹈秦王覆轍[/em2]……是留給後來人的。……留給我？」", "DisableCharacterExpression(0);SetPortrait(MC1,pic=14);EnableCharacterExpression(0,MC1-1,Question);"),
        ],
        "options": [
            ("信義", "「守護蒼生、勿蹈秦王覆轍——這是託付。」", "「石刻託的不是尋寶，是守護蒼生。我既然讀到了，往後行走江湖，總不能只管自己撈好處——大俠的路，也得配得上這幾個字。」", "DisableCharacterExpression(0);SetPortrait(MC1,pic=8);EnableCharacterExpression(0,MC1-1,Meditate);ModifyData(DnDAlignment,Player,LawChaos,0.05);"),
            ("仁心", "「助了秦，卻仍不肯為奴……這部族太難。」", "「幫人打天下，換來的卻是窺視血脈、逼人為奴。到頭來只能躲在山裡……這世道，對誰都不寬容。」", "DisableCharacterExpression(0);SetPortrait(MC1,pic=8);EnableCharacterExpression(0,MC1-1,Pain);ModifyData(DnDAlignment,Player,GoodEvil,0.05);"),
            ("通達", "「幾百年前的舊帳，想破頭也沒用。」", "「幾百年前的恩怨，我想破頭也想不全。……罷了，字看過了，人還活著，回去跟宗緯大哥討塊烤肉壓壓驚。哈哈。」", "DisableCharacterExpression(0);SetPortrait(MC1,pic=15);EnableCharacterExpression(0,MC1-1,Meditate);ModifyData(DnDAlignment,Player,LawChaos,-0.05);"),
            ("機略", "「極西、逆流河、助秦……哪條都是驚天消息。」", "「極西之地、逆流之河、助秦統一……隨便拎一條出去，都够說書先生講上三天。這祕密，說不定哪天用得上。」", "DisableCharacterExpression(0);SetPortrait(MC1,pic=12);EnableCharacterExpression(0,MC1-1,Idea);ModifyData(DnDAlignment,Player,GoodEvil,-0.05);"),
        ],
    },
    {
        "trigger": "觀心：黑鐵嶺礦坑",
        "trigger_desc": "觀心觸發：完成黑鐵嶺深淵祭壇",
        "recall": [
            ("旁白", "[panel=6]＊（雲中廣場上，李四額頭磕得流血，哭喊著：黑鐵嶺吃人了——而三十里外的礦坑裡，符咒剝落的鐵門後，是腐爛與硫磺的濁氣。）＊", ""),
            ("李四", "「救命啊！救救大山！救救我家媳婦！黑鐵嶺……黑鐵嶺吃人了啊！」", ""),
            ("旁白", "[panel=6]＊（告示板上寫著——[em2]鹽鐵之利，國之大柄[/em2]；[em2]私吞礦石者，斬；私鑄兵器者，族誅[/em2]。）＊", ""),
            ("旁白", "[panel=6]＊（監工日記上寫著——深層岩壁裡挖到[em2]紅色水晶[/em2]，大山說那是「[em2]神[/em2]」的眼睛；工人們在膜拜；最後一頁：[em2]逃不掉了…門被鎖了…大山說，我們都是祭品…[/em2]）＊", ""),
            ("旁白", "[panel=6]＊（祭壇中央，泥塑小人像額頭嵌著第三隻眼——妖異紅光，像活物般跳動。李大山滿身黑筋，喃喃要獻血給神。）＊", ""),
        ],
        "transition": ("[panel=6]＊（你盤膝靜坐，礦坑裡讀過的字句，又一句一句浮了上來。）＊", "SetPortrait(MC1,pic=12);EnableCharacterExpression(0,MC1-1,Meditate);"),
        "dice_disable": "",
        "inner": [
            ("「[em2]鹽鐵專賣[/em2]……礦工連私藏分毫都是死罪。官府鎮壓不住，便封門了事。」", "SetPortrait(MC1,pic=12);EnableCharacterExpression(0,MC1-1,Meditate);"),
            ("「[em2]紅色水晶[/em2]……大山說是神的眼睛，工人跟著膜拜。人瘋了，不是一夜之間。」", "DisableCharacterExpression(0);SetPortrait(MC1,pic=12);EnableCharacterExpression(0,MC1-1,Meditate);"),
            ("「日記最後寫：[em2]我們都是祭品[/em2]。門從外頭鎖死，裡頭的人出不去。」", "DisableCharacterExpression(0);SetPortrait(MC1,pic=11);EnableCharacterExpression(0,MC1-1,Pain);"),
            ("「李四在村口磕頭……大山、媳婦，還有那些失蹤的礦工。這礦坑吃的，恐怕不只是人。」", "DisableCharacterExpression(0);SetPortrait(MC1,pic=12);EnableCharacterExpression(0,MC1-1,Meditate);"),
        ],
        "options": [
            ("信義", "「妖邪作祟，大俠不能裝作沒聽見。」", "「黑鐵嶺鬧鬼也好、有神也好，既然來了，就不能只惦記寶貝。行俠仗義，總要有人出手。」", "DisableCharacterExpression(0);SetPortrait(MC1,pic=8);EnableCharacterExpression(0,MC1-1,Meditate);ModifyData(DnDAlignment,Player,LawChaos,0.05);"),
            ("仁心", "「李四一家，還有那些被鎖在礦裡的人。」", "「大山被紅光迷了心智，媳婦還在暗室裡撐著。李四在村口哭到額頭流血……這不是傳聞，是活生生的人。」", "DisableCharacterExpression(0);SetPortrait(MC1,pic=8);EnableCharacterExpression(0,MC1-1,Pain);ModifyData(DnDAlignment,Player,GoodEvil,0.05);"),
            ("通達", "「官府都封了，我們僥倖活著就好。」", "「礦坑裡的事，我想破頭也想不全。……罷了，人還活著，回雲中喝口熱茶壓壓驚。哈哈。」", "DisableCharacterExpression(0);SetPortrait(MC1,pic=15);EnableCharacterExpression(0,MC1-1,Meditate);ModifyData(DnDAlignment,Player,LawChaos,-0.05);"),
            ("機略", "「不祥之物、赤眼水晶……這裡頭必有緣由。」", "「挖到不祥之物才封礦，紅水晶還能控人……這種東西，說不定跟江湖上那些『惡神』的傳聞有關。」", "DisableCharacterExpression(0);SetPortrait(MC1,pic=12);EnableCharacterExpression(0,MC1-1,Idea);ModifyData(DnDAlignment,Player,GoodEvil,-0.05);"),
        ],
    },
    {
        "trigger": "觀心：趙王洞血煞",
        "trigger_desc": "觀心觸發：完成趙王洞祭壇前廳戰鬥",
        "recall": [
            ("旁白", "[panel=6]＊（血色與黑霧吞沒視線。胸口那股飢餓如野火竄起——想吞掉倒地的妖物，甚至想吞掉一旁的同伴。）＊", ""),
            ("旁白", "[panel=6]＊（腦中有個聲音步步進逼：[em2]吃掉牠們[/em2]。指甲掐進掌心，五臟六腑像要裂開。）＊", ""),
            ("旁白", "[panel=6]＊（最後一關——是徹底屈服，還是咬牙說：[em2]去他的，沒有人可以控制我[/em2]。）＊", ""),
            ("旁白", "「總有一天，你會心甘情願祈求吾的。」", ""),
            ("旁白", "[panel=6]＊（飢餓驟退。你撐不住昏死過去。迷濛中，一雙寬大的手把你從地上拉起——）＊", ""),
            ("徐榮", "「……小子，你能撐到現在，是個漢子。剩下的交給我吧！」", "SetPortrait(MC5,pic=8);"),
        ],
        "transition": ("[panel=6]＊（你盤膝靜坐，趙王洞裡那股腥甜氣息，又像貼著喉嚨爬了上來。）＊", "SetPortrait(MC1,pic=11);EnableCharacterExpression(0,MC1-1,Pain);"),
        "dice_disable": "",
        "inner": [
            ("「戰後倒在地上，滿腦子只剩[em2]吃[/em2]。妖物是肉，同伴……竟也變成了散發香氣的血肉。」", "DisableCharacterExpression(0);SetPortrait(MC1,pic=11);EnableCharacterExpression(0,MC1-1,Pain);"),
            ("「那股意志勒住喉嚨——[em2]吞噬[/em2]，或者[em2]被吞噬[/em2]。我記不得自己是撐住了，還是已經讓步了半寸。」", "DisableCharacterExpression(0);SetPortrait(MC1,pic=12);EnableCharacterExpression(0,MC1-1,Meditate);"),
            ("「洞裡有個聲音說，總有一天我會心甘情願祈求牠。……連是人是鬼都說不清。」", "DisableCharacterExpression(0);SetPortrait(MC1,pic=14);EnableCharacterExpression(0,MC1-1,Question);"),
            ("「醒來人在英豪府，傷口包好了，靈犀哭過一場。……可那股飢餓，真的走了嗎？」", "DisableCharacterExpression(0);SetPortrait(MC1,pic=12);EnableCharacterExpression(0,MC1-1,Meditate);"),
        ],
        "options": [
            ("信義", "「說我總有一天會祈求牠——我絕對不信。」", "「我好不容易走出那窮山溝，是要闖出一條俠名的——不是讓洞裡那股餓意替我做主。[em2]去他的，沒有人可以控制我[/em2]……那個聲音說的[em2]總有一天[/em2]？我絕對不信。」", "DisableCharacterExpression(0);SetPortrait(MC1,pic=8);EnableCharacterExpression(0,MC1-1,Meditate);ModifyData(DnDAlignment,Player,LawChaos,0.05);"),
            ("仁心", "「娜娜、雍仔就在旁邊……差一點，我就傷到他們了。」", "「最駭人的不是妖物，是腦子裡把同伴當成[em2]食物[/em2]的那一瞬。靈犀還在府裡等我……我怎麼能讓她再哭一次。」", "DisableCharacterExpression(0);SetPortrait(MC1,pic=11);EnableCharacterExpression(0,MC1-1,Pain);ModifyData(DnDAlignment,Player,GoodEvil,0.05);"),
            ("通達", "「醒來人沒事，徐大哥還誇我是漢子。想太多，晚上睡不著。」", "「昏過去，醒過來，傷好了，茶也喝了。……哈哈，命大就好。洞裡的事，想破頭也想不全。」", "DisableCharacterExpression(0);SetPortrait(MC1,pic=15);EnableCharacterExpression(0,MC1-1,Meditate);ModifyData(DnDAlignment,Player,LawChaos,-0.05);"),
            ("機略", "「那個聲音、血煞、麒麟骰……賈詡好像早知道什麼。」", "「賈詡扔來的竹簡寫[em2]貪念若熾，必反噬其主[/em2]……這趟趙王洞，說不定從頭到尾都在試那顆骰子。」", "DisableCharacterExpression(0);SetPortrait(MC1,pic=12);EnableCharacterExpression(0,MC1-1,Idea);ModifyData(DnDAlignment,Player,GoodEvil,-0.05);"),
        ],
    },
]

ENDING_TEXT = "[panel=6]＊（你睜開眼，膝上的麒麟骰靜靜躺著。方才不論怎麼想，心裡那股亂念，總算沉了下去。）＊"
ENDING_SEQ = "DisableCharacterExpression(0);SetPortrait(MC1,pic=8);"


class Builder:
    def __init__(self):
        self.nodes = []
        self.eid = 0
        self.event_roots = {}

    def add(self, actor, text, sequence="", links=None, description=None):
        node = {
            "entryID": self.eid,
            "actorID": ACTOR_MAP.get(actor, actor if actor != "旁白" else 2),
            "text": text,
            "Sequence": sequence,
            "links": links if links is not None else [],
        }
        if description:
            node["Description"] = description
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
        self.event_roots[event["trigger"]] = root
        prev = root
        for i, (actor, text, seq) in enumerate(event["recall"]):
            nid = self.add(actor, text, seq, [])
            self.nodes[prev]["links"] = [nid]
            prev = nid

        trans_id = self.add(2, event["transition"][0], event["transition"][1], [])
        self.nodes[prev]["links"] = [trans_id]

        dice_seq = event.get("dice_disable", "") + "BeginDiceRoll(Auto,InsightCheck,2);"
        dice_id = self.add("MC0", "", dice_seq, [], "自動洞悉檢定觸發點 (難度2)")
        self.nodes[trans_id]["links"] = [dice_id]

        buffer_id = self.add("MC0", "", "", [], "自動檢定後的空緩衝節點")
        self.nodes[dice_id]["links"] = [buffer_id]

        inner_start = self.add("MC1", event["inner"][0][0], event["inner"][0][1], [])
        fail_id = self.add(
            2,
            "[panel=6]＊（骰子溫溫的，沒什麼動靜——念頭還得你自己理。）＊",
            "IsPassDice() == false;",
            [inner_start],
        )
        success_id = self.add(
            2,
            "[panel=6]＊（骰子在掌心跳了跳，像是有回音應了你的念頭。[即時訊息區]: 洞悉檢定成功！洞悉經驗+10。）＊",
            "IsPassDice() == true;ModifyData(FeatExp,Player,Insight,10);",
            [inner_start],
        )
        self.nodes[buffer_id]["links"] = [success_id, fail_id]

        prev = inner_start
        for text, seq in event["inner"][1:]:
            nid = self.add("MC1", text, seq, [])
            self.nodes[prev]["links"] = [nid]
            prev = nid

        option_ids = []
        branch_end_ids = []
        ending_id = self.add(2, ENDING_TEXT, ENDING_SEQ, [])

        for idx, (axis, opt_text, branch_text, branch_seq) in enumerate(event["options"], 1):
            opt_id = self.add("MC1", opt_text, "", [], f"選項{idx}：[{axis}]")
            option_ids.append(opt_id)
            branch_id = self.add("MC1", branch_text, branch_seq, [ending_id])
            self.nodes[opt_id]["links"] = [branch_id]
            branch_end_ids.append(branch_id)

        self.nodes[prev]["links"] = option_ids
        self.nodes[ending_id]["links"] = []


def main():
    b = Builder()
    for ev in EVENTS:
        b.build_event(ev)
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(b.nodes, f, ensure_ascii=False, indent=2)
    print(f"Wrote {len(b.nodes)} nodes to {OUT_PATH}")
    print("Event roots:", b.event_roots)


if __name__ == "__main__":
    main()
