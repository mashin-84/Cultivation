#!/usr/bin/env python3
"""v160 本命絕學前期差異:劍修純爆發最高(保底 6.5、係數 2.0);法修維持(灼燒+定身);體修略低(護盾 40%);丹修補強(保底 3→4、係數 1→1.2、冷卻 6→5)。
重要戰鬥的難度依「自動」模擬校準,模擬已涵蓋絕學,所以勝率不受影響。35_v113 與 p48_bf.js 同步。"""
import os
R = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
OLD = "const ULT = { sword: { k: 'sword', n: '劍氣縱橫', ic: '🌬️', cd: 5, f: 1.6, fl: 5 }, magic: { k: 'magic', n: '五行法陣', ic: '🔯', cd: 6, f: 1.6, fl: 5 }, body: { k: 'body', n: '金身怒目', ic: '🪬', cd: 6, f: 1.6, fl: 5 }, pill: { k: 'pill', n: '丹爐煉化', ic: '♨️', cd: 6, f: 1, fl: 3 } };"
NEW = "const ULT = { sword: { k: 'sword', n: '劍氣縱橫', ic: '🌬️', cd: 5, f: 2.0, fl: 6.5 }, magic: { k: 'magic', n: '五行法陣', ic: '🔯', cd: 6, f: 1.6, fl: 5 }, body: { k: 'body', n: '金身怒目', ic: '🪬', cd: 6, f: 1.4, fl: 4.5 }, pill: { k: 'pill', n: '丹爐煉化', ic: '♨️', cd: 5, f: 1.2, fl: 4 } };"
for p in ['src/js/35_v113_重要戰鬥.js', 'tools/patches/p48_bf.js']:
    f = os.path.join(R, p); t = open(f, encoding='utf-8').read()
    if NEW in t: print(p, '已套用'); continue
    assert t.count(OLD) == 1, p; open(f, 'w', encoding='utf-8').write(t.replace(OLD, NEW)); print(p, 'OK')
# v160 一般戰鬥的本命絕學也同步:劍 max(4,m×2.0)、法 max(2.5,m×1.6)、體 max(2.5,m×1.4)、丹 max(2,m×1.2) 冷卻 5(已直接改 051)
