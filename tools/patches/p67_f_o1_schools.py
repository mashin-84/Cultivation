#!/usr/bin/env python3
"""最終版146:新手服女款三流派戰鬥動作(法/體/丹);丹修第 4 格(服丹)原圖下半被切掉,暫用第 7 格(舉爐仰頭飲下)"""
import os
R = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
def rep(p, old, new):
    p = os.path.join(R, p); s = open(p, encoding='utf-8', newline='').read()
    assert s.count(old) == 1, (p, old[:60]); open(p, 'w', encoding='utf-8', newline='').write(s.replace(old, new))
keys = [f'F_o1_{sc}_{i}' for sc in ('magic', 'body', 'pill') for i in range(1, 10)]
for k in keys: assert os.path.exists(os.path.join(R, 'src/assets/BP', k + '.webp')), k
rep('src/js/34b_v115_主角戰鬥動作.js', '"talisman": "data:image/webp;base64,@@IMG:BP/talisman@@"', '"talisman": "data:image/webp;base64,@@IMG:BP/talisman@@", ' + ', '.join(f'"{k}": "data:image/webp;base64,@@IMG:BP/{k}@@"' for k in keys))
T = "F_o1_magic_2: [.8, .149], F_o1_magic_3: [.652, .173], F_o1_magic_8: [.739, .065], F_o1_body_2: [.741, .293], F_o1_body_3: [.744, .299], F_o1_body_8: [.739, .412], F_o1_pill_2: [.848, .387], F_o1_pill_3: [.753, .262], F_o1_pill_8: [.871, .198], "
for f in ('src/js/35_v113_重要戰鬥.js', 'tools/patches/p48_bf.js'): rep(f, 'M_o1_magic_2: [.798, .232]', T + 'M_o1_magic_2: [.798, .232]')
print('p67 ok')
