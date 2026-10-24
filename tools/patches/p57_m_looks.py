#!/usr/bin/env python3
"""最終版133:男主四套外觀(o2–o5)戰鬥背影(o2 換新圖、第 3 格左右翻轉)、本命特寫、選招半身"""
import os
R = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
def rep(p, old, new):
    p = os.path.join(R, p); s = open(p, encoding='utf-8', newline='').read()
    assert s.count(old) == 1, (p, old[:50], s.count(old)); open(p, 'w', encoding='utf-8', newline='').write(s.replace(old, new))
def ent(d, ks): return ', '.join(f'"{k}": "data:image/webp;base64,@@IMG:{d}/{k}@@"' for k in ks)
bp = [f'M_{o}_{i}' for o in ('o3', 'o4', 'o5') for i in range(1, 10)]
uc = [f'M_{o}_{s}' for o in ('o2', 'o3', 'o4', 'o5') for s in ('sword', 'magic', 'body', 'pill')]
cp = [f'M_{o}_{h}' for o in ('o2', 'o3', 'o4', 'o5') for h in ('n', 'h')]
for d, ks in (('BP', bp), ('UC', uc), ('CP', cp)):
    for k in ks: assert os.path.exists(os.path.join(R, 'src/assets', d, k + '.webp')), k
rep('src/js/34b_v115_主角戰鬥動作.js', '"M_o2_9": "data:image/webp;base64,@@IMG:BP/M_o2_9@@"', '"M_o2_9": "data:image/webp;base64,@@IMG:BP/M_o2_9@@", ' + ent('BP', bp))
rep('src/js/34c_v122_絕學特寫.js', '"M_pill": "data:image/webp;base64,@@IMG:UC/M_pill@@"', '"M_pill": "data:image/webp;base64,@@IMG:UC/M_pill@@", ' + ent('UC', uc))
rep('src/js/34d_v124_戰鬥半身.js', '"M_h": "data:image/webp;base64,@@IMG:CP/M_h@@"', '"M_h": "data:image/webp;base64,@@IMG:CP/M_h@@", ' + ent('CP', cp))
T = {'o2': ([.942, .207], [.584, .263], [.998, .107]), 'o3': ([.949, .198], [.618, .257], [.998, .098]),
     'o4': ([.949, .199], [.588, .257], [.998, .095]), 'o5': ([.948, .199], [.619, .26], [.998, .097])}
new = ', '.join(f'M_{o}_2: {t[0]}, M_{o}_3: {t[1]}, M_{o}_8: {t[2]}' for o, t in T.items()).replace('0.', '.')
for f in ('src/js/35_v113_重要戰鬥.js', 'tools/patches/p48_bf.js'):
    rep(f, 'M_o2_2: [.998, .159], M_o2_3: [.379, .263], M_o2_8: [.908, .25]', new)
print('p57 ok')
