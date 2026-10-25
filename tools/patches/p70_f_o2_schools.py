#!/usr/bin/env python3
"""最終版149:素白宗門服女款三流派(法修第 4、9 格暫用第 1 格;丹修第 1 格暫用第 9、第 7 格暫用第 5,原圖正面)"""
import os
R = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
def rep(p, old, new):
    p = os.path.join(R, p); s = open(p, encoding='utf-8', newline='').read()
    assert s.count(old) == 1, (p, old[:60]); open(p, 'w', encoding='utf-8', newline='').write(s.replace(old, new))
keys = [f'F_o2_{sc}_{i}' for sc in ('magic', 'body', 'pill') for i in range(1, 10)]
for k in keys: assert os.path.exists(os.path.join(R, 'src/assets/BP', k + '.webp')), k
rep('src/js/34b_v115_主角戰鬥動作.js', '"talisman": "data:image/webp;base64,@@IMG:BP/talisman@@"', '"talisman": "data:image/webp;base64,@@IMG:BP/talisman@@", ' + ', '.join(f'"{k}": "data:image/webp;base64,@@IMG:BP/{k}@@"' for k in keys))
T = "F_o2_magic_2: [.862, .174], F_o2_magic_3: [.832, .04], F_o2_magic_8: [.778, .097], F_o2_body_2: [.743, .238], F_o2_body_3: [.744, .198], F_o2_body_8: [.706, .35], F_o2_pill_2: [.775, .323], F_o2_pill_3: [.768, .177], F_o2_pill_8: [.813, .211], "
for f in ('src/js/35_v113_重要戰鬥.js', 'tools/patches/p48_bf.js'): rep(f, 'M_o1_magic_2: [.798, .232]', T + 'M_o1_magic_2: [.798, .232]')
print('p70 ok')
