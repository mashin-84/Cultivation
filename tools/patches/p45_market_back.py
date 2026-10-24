#!/usr/bin/env python3
"""最終版111:
1. 萬寶坊市改版:6 格隨機貨架,商品隨境界提升;品質 凡55%/良27%/上12%/極5%/仙1%
   每 2 小時免費補貨;手動刷新花靈石,同日每次 ×1.3(不設上限,隔日恢復)
2. 新道具:淨塵蓮子(極品材料)、清心化毒丹(仙品,清除當層丹毒)
   取得:坊市;九重劫(首次渡過必得 1,重修 35%);天地異種寶箱(必得 1,15% 得 2,3% 得 3);煉丹(蓮子 ×3 + 洗髓花 ×5)
3. 手機返回鍵 = 遊戲返回鍵:關最上層視窗 → 回洞府 → 在洞府提示「再按一次離開」
"""
import os, glob
SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src')
def sub(path, old, new, n=1):
    p = glob.glob(os.path.join(SRC, path))[0]; s = open(p, encoding='utf-8', newline='').read()
    assert s.count(old) == n, (path, old[:60], s.count(old)); open(p, 'w', encoding='utf-8', newline='').write(s.replace(old, new))
sub('index.html', '@@INC:js/31_v108_洞府紅點.js@@', '@@INC:js/31_v108_洞府紅點.js@@\n@@INC:js/32_v111_萬寶坊市.js@@\n@@INC:js/33_v111_返回鍵.js@@')
# 九重劫、天地異種掉落
sub('js/02_main/037_*.js', "    audio.playFanfare(); const L = X.give(rw, true);",
    "    audio.playFanfare(); const L = X.give(rw, true);\n    { const k = B.jieFirst ? 1 : (Math.random() < .35 ? 1 : 0); if (k && ITEMS.pill_dt) { addItem('pill_dt', k); L.push(`${ITEMS.pill_dt.name} ×${k}`); } }   /* v111 清心化毒丹 */")
sub('js/02_main/022_*.js', "    else { const sp = t >= 5 ? 'sp_5' : t >= 3 ? 'sp_3' : 'sp_1'; give(sp, 1); }\n  }\n  return out;",
    "    else { const sp = t >= 5 ? 'sp_5' : t >= 3 ? 'sp_3' : 'sp_1'; give(sp, 1); }\n  }\n  if (ITEMS.pill_dt) { const r3 = Math.random(); give('pill_dt', r3 < .03 ? 3 : r3 < .18 ? 2 : 1, '解毒聖藥'); }   /* v111 */\n  return out;")
for name, body in [('32_v111_萬寶坊市.js', open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'p45_market.js'), encoding='utf-8').read()),
                   ('33_v111_返回鍵.js', open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'p45_back.js'), encoding='utf-8').read())]:
    js = os.path.join(SRC, 'js', name); assert not os.path.exists(js); open(js, 'w', encoding='utf-8', newline='').write(body)
print('p45 ok')
