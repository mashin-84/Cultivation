#!/usr/bin/env python3
"""最終版153:墨羽玄袍女款三流派"""
import os
R = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
def rep(p, old, new):
    p = os.path.join(R, p); s = open(p, encoding='utf-8', newline='').read()
    assert s.count(old) == 1, (p, old[:60]); open(p, 'w', encoding='utf-8', newline='').write(s.replace(old, new))
keys = [f'M_o5_{sc}_{i}' for sc in ('magic', 'body', 'pill') for i in range(1, 10)]
for k in keys: assert os.path.exists(os.path.join(R, 'src/assets/BP', k + '.webp')), k
rep('src/js/34b_v115_主角戰鬥動作.js', '"talisman": "data:image/webp;base64,@@IMG:BP/talisman@@"', '"talisman": "data:image/webp;base64,@@IMG:BP/talisman@@", ' + ', '.join(f'"{k}": "data:image/webp;base64,@@IMG:BP/{k}@@"' for k in keys))
T = "M_o5_magic_2: [.89, .208], M_o5_magic_3: [.71, .108], M_o5_magic_8: [.8, .028], M_o5_body_2: [.792, .254], M_o5_body_3: [.725, .169], M_o5_body_8: [.561, .034], M_o5_pill_2: [.886, .361], M_o5_pill_3: [.738, .244], M_o5_pill_8: [.845, .293], "
for f in ('src/js/35_v113_重要戰鬥.js', 'tools/patches/p48_bf.js'): rep(f, 'M_o1_magic_2: [.798, .232]', T + 'M_o1_magic_2: [.798, .232]')
print('p72 ok')
