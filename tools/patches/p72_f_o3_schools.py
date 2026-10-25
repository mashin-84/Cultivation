#!/usr/bin/env python3
"""最終版153:墨羽玄袍女款三流派"""
import os
R = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
def rep(p, old, new):
    p = os.path.join(R, p); s = open(p, encoding='utf-8', newline='').read()
    assert s.count(old) == 1, (p, old[:60]); open(p, 'w', encoding='utf-8', newline='').write(s.replace(old, new))
keys = [f'F_o3_{sc}_{i}' for sc in ('magic', 'body', 'pill') for i in range(1, 10)]
for k in keys: assert os.path.exists(os.path.join(R, 'src/assets/BP', k + '.webp')), k
rep('src/js/34b_v115_主角戰鬥動作.js', '"talisman": "data:image/webp;base64,@@IMG:BP/talisman@@"', '"talisman": "data:image/webp;base64,@@IMG:BP/talisman@@", ' + ', '.join(f'"{k}": "data:image/webp;base64,@@IMG:BP/{k}@@"' for k in keys))
T = "F_o3_magic_2: [.836, .189], F_o3_magic_3: [.648, .073], F_o3_magic_8: [.744, .022], F_o3_body_2: [.743, .269], F_o3_body_3: [.755, .196], F_o3_body_8: [.685, .35], F_o3_pill_2: [.763, .317], F_o3_pill_3: [.759, .207], F_o3_pill_8: [.82, .192], "
for f in ('src/js/35_v113_重要戰鬥.js', 'tools/patches/p48_bf.js'): rep(f, 'M_o1_magic_2: [.798, .232]', T + 'M_o1_magic_2: [.798, .232]')
print('p72 ok')
