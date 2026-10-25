#!/usr/bin/env python3
"""最終版153:墨羽玄袍女款三流派"""
import os
R = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
def rep(p, old, new):
    p = os.path.join(R, p); s = open(p, encoding='utf-8', newline='').read()
    assert s.count(old) == 1, (p, old[:60]); open(p, 'w', encoding='utf-8', newline='').write(s.replace(old, new))
keys = [f'F_o4_{sc}_{i}' for sc in ('magic', 'body', 'pill') for i in range(1, 10)]
for k in keys: assert os.path.exists(os.path.join(R, 'src/assets/BP', k + '.webp')), k
rep('src/js/34b_v115_主角戰鬥動作.js', '"talisman": "data:image/webp;base64,@@IMG:BP/talisman@@"', '"talisman": "data:image/webp;base64,@@IMG:BP/talisman@@", ' + ', '.join(f'"{k}": "data:image/webp;base64,@@IMG:BP/{k}@@"' for k in keys))
T = "F_o4_magic_2: [.817, .229], F_o4_magic_3: [.661, .132], F_o4_magic_8: [.714, .06], F_o4_body_2: [.747, .251], F_o4_body_3: [.768, .225], F_o4_body_8: [.572, .031], F_o4_pill_2: [.799, .35], F_o4_pill_3: [.786, .223], F_o4_pill_8: [.812, .189], "
for f in ('src/js/35_v113_重要戰鬥.js', 'tools/patches/p48_bf.js'): rep(f, 'M_o1_magic_2: [.798, .232]', T + 'M_o1_magic_2: [.798, .232]')
print('p72 ok')
