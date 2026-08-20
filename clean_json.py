import json
import re

file_path = r'c:\QilinStoryV\QilinStory\趙王洞(山賊窩).json'
with open(file_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

for entry in data:
    if entry.get('actorID') != 'MC0':
        text = entry.get('text', '')
        # Remove markdown code blocks around brackets if any
        text = re.sub(r'^\`\[(.*?)\]\`\s*[：:]?\s*', '', text)
        # Remove normal brackets at the start
        text = re.sub(r'^\[(.*?)\]\s*[：:]?\s*', '', text)
        # Sometime the colon is before the quote but no brackets
        text = re.sub(r'^[：:]\s*', '', text)
        entry['text'] = text

with open(file_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=4)
