#!/usr/bin/env python3
"""最終版147:素白宗門服男款三流派戰鬥動作(丹修第 6 格左右翻轉)"""
import os
R = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
def rep(p, old, new):
    p = os.path.join(R, p); s = open(p, encoding='utf-8', newline='').read()
    assert s.count(old) == 1, (p, old[:60]); open(p, 'w', encoding='utf-8', newline='').write(s.replace(old, new))
keys = [f'M_o2_{sc}_{i}' for sc in ('magic', 'body', 'pill') for i in range(1, 10)]
for k in keys: assert os.path.exists(os.path.join(R, 'src/assets/BP', k + '.webp')), k
rep('src/js/34b_v115_主角戰鬥動作.js', '"talisman": "data:image/webp;base64,@@IMG:BP/talisman@@"', '"talisman": "data:image/webp;base64,@@IMG:BP/talisman@@", ' + ', '.join(f'"{k}": "data:image/webp;base64,@@IMG:BP/{k}@@"' for k in keys))
T = "M_o2_magic_2: [.825, .18], M_o2_magic_3: [.593, .155], M_o2_magic_8: [.783, .293], M_o2_body_2: [.764, .266], M_o2_body_3: [.707, .245], M_o2_body_8: [.713, .45], M_o2_pill_2: [.82, .346], M_o2_pill_3: [.756, .224], M_o2_pill_8: [.85, .254], "
for f in ('src/js/35_v113_重要戰鬥.js', 'tools/patches/p48_bf.js'): rep(f, 'M_o1_magic_2: [.798, .232]', T + 'M_o1_magic_2: [.798, .232]')
print('p68 ok')
