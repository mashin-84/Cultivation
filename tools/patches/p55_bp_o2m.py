#!/usr/bin/env python3
"""最終版128:素白宗門服(o2)男款戰鬥背影 9 動作(第 4、7 格用補圖),登記圖片與出招位置 TIPS"""
import os
R = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
def rep(p, old, new):
    p = os.path.join(R, p); s = open(p, encoding='utf-8', newline='').read()
    assert s.count(old) == 1, (p, s.count(old)); open(p, 'w', encoding='utf-8', newline='').write(s.replace(old, new))
keys = [f'M_o2_{i}' for i in range(1, 10)]
for k in keys: assert os.path.exists(os.path.join(R, 'src/assets/BP', k + '.webp')), k
rep('src/js/34b_v115_主角戰鬥動作.js', '"M_o1_9": "data:image/webp;base64,@@IMG:BP/M_o1_9@@"',
    '"M_o1_9": "data:image/webp;base64,@@IMG:BP/M_o1_9@@", ' + ', '.join(f'"{k}": "data:image/webp;base64,@@IMG:BP/{k}@@"' for k in keys))
old = 'M_o1_8: [.966, .053] };'
new = 'M_o1_8: [.966, .053], M_o2_2: [.998, .159], M_o2_3: [.379, .263], M_o2_8: [.908, .25] };'
for f in ('src/js/35_v113_重要戰鬥.js', 'tools/patches/p48_bf.js'): rep(f, old, new)
print('p55 ok')
