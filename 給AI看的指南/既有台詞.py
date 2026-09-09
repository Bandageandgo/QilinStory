# -*- coding: utf-8 -*-
"""列出某個角色在 Json/ 裡的全部既有台詞，寫這個角色之前先讀一遍（文風指南第四節開頭）。

用法：
    python 給AI看的指南/既有台詞.py 張寧
    python 給AI看的指南/既有台詞.py MC6
    python 給AI看的指南/既有台詞.py 張寧 --files      只列檔名與句數，不印台詞
    python 給AI看的指南/既有台詞.py                    列出有幾個角色可查

輸出依檔案分組，每句前面帶 #entryID，方便回頭對 JSON。
"""
import io
import json
import os
import sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "Json")

NAMES = {
    "MC1": "主角", "MC2": "呂信", "MC3": "子羽", "MC4": "賈詡", "MC5": "徐榮",
    "MC6": "張寧", "MC7": "郭嘉", "MC8": "蕭靈犀", "MC9": "甄筠", "MC10": "褚人飛",
    "MC11": "黑狼王", "MC12": "董卓", "MC13": "張角", "MC14": "絲蒂娜", "MC15": "曹操",
    "MC16": "張遼", "MC17": "高順", "MC18": "典韋", "MC19": "菈沙", "MC20": "雍仔",
    "MC21": "饕餮", "MC22": "赫連娜娜", "MC23": "蔡琰", "MC24": "蔡邕",
    "role105": "茶博士", "role113": "張仲景", "role127": "廖淳", "role131": "浦元",
    "role133": "大樹守衛", "role5": "老婆婆",
}
ALIAS = {"燕不凡": "MC1", "張仲景": "MC13", "蔡文姬": "MC23", "娜娜": "MC22", "小犀": "MC8"}


def resolve(arg):
    if arg in NAMES:
        return arg
    if arg in ALIAS:
        return ALIAS[arg]
    for k, v in NAMES.items():
        if v == arg:
            return k
    return None


def collect(actor):
    out = []
    for dp, _, fs in os.walk(ROOT):
        for fn in sorted(fs):
            if not fn.endswith(".json"):
                continue
            p = os.path.join(dp, fn)
            rel = os.path.relpath(p, ROOT).replace("\\", "/")
            try:
                data = json.load(io.open(p, encoding="utf-8-sig"))
            except Exception:
                continue
            if not isinstance(data, list):
                continue
            lines = [(n.get("entryID"), n["text"].strip())
                     for n in data if isinstance(n, dict)
                     and str(n.get("actorID")) == actor and (n.get("text") or "").strip()]
            if lines:
                out.append((rel, lines))
    out.sort(key=lambda x: -len(x[1]))
    return out


def main():
    if len(sys.argv) < 2:
        print("可查的角色：")
        for k, v in NAMES.items():
            print(f"  {k:8} {v}")
        return
    actor = resolve(sys.argv[1])
    if not actor:
        print(f"不認得「{sys.argv[1]}」，可查的名字見不帶參數執行的清單。")
        sys.exit(1)
    files_only = "--files" in sys.argv
    groups = collect(actor)
    total = sum(len(l) for _, l in groups)
    print(f"## {NAMES[actor]}（{actor}）既有台詞：{total} 句／{len(groups)} 檔\n")
    for rel, lines in groups:
        print(f"### {rel}（{len(lines)} 句）")
        if not files_only:
            for eid, text in lines:
                print(f"  #{eid}  {text}")
            print()


if __name__ == "__main__":
    main()
