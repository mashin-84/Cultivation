#!/usr/bin/env python3
"""最終版129:女主四套外觀(o2–o5)戰鬥背影 9 動作、本命特寫 4 流派、選招半身(戰意/負傷);
特寫與半身改為依外觀取圖(缺圖退回原本只分性別的圖)"""
import os
R = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
def rep(p, old, new):
    p = os.path.join(R, p); s = open(p, encoding='utf-8', newline='').read()
    assert s.count(old) == 1, (p, old[:40], s.count(old)); open(p, 'w', encoding='utf-8', newline='').write(s.replace(old, new))
def ent(d, ks): return ', '.join(f'"{k}": "data:image/webp;base64,@@IMG:{d}/{k}@@"' for k in ks)
L = ['o2', 'o3', 'o4', 'o5']
bp = [f'F_{o}_{i}' for o in L for i in range(1, 10)]
uc = [f'F_{o}_{s}' for o in L for s in ('sword', 'magic', 'body', 'pill')]
cp = [f'F_{o}_{h}' for o in L for h in ('n', 'h')]
for d, ks in (('BP', bp), ('UC', uc), ('CP', cp)):
    for k in ks: assert os.path.exists(os.path.join(R, 'src/assets', d, k + '.webp')), k
rep('src/js/34b_v115_主角戰鬥動作.js', '"F_o1_9": "data:image/webp;base64,@@IMG:BP/F_o1_9@@"', '"F_o1_9": "data:image/webp;base64,@@IMG:BP/F_o1_9@@", ' + ent('BP', bp))
rep('src/js/34c_v122_絕學特寫.js', '"F_pill": "data:image/webp;base64,@@IMG:UC/F_pill@@"', '"F_pill": "data:image/webp;base64,@@IMG:UC/F_pill@@", ' + ent('UC', uc))
rep('src/js/34d_v124_戰鬥半身.js', '"F_h": "data:image/webp;base64,@@IMG:CP/F_h@@"', '"F_h": "data:image/webp;base64,@@IMG:CP/F_h@@", ' + ent('CP', cp))
tips = {'o2': ([.969, .167], [.445, .39], [.421, .208]), 'o3': ([.968, .167], [.445, .39], [.421, .208]),
        'o4': ([.967, .168], [.445, .39], [.421, .208]), 'o5': ([.981, .168], [.445, .39], [.421, .208])}
add = ''.join(f', F_{o}_2: {t[0]}, F_{o}_3: {t[1]}, F_{o}_8: {t[2]}' for o, t in tips.items()).replace('0.', '.')
for f in ('src/js/35_v113_重要戰鬥.js', 'tools/patches/p48_bf.js'):
    rep(f, 'M_o2_8: [.908, .25] };', 'M_o2_8: [.908, .25]' + add + ' };')
    rep(f, "const src = UCUT[g + '_' + sch] || UCUT[g] || playerArt()",
        "const src = UCUT[g + '_' + (state.look || 'o1') + '_' + sch] || UCUT[g + '_' + sch] || UCUT[g] || playerArt()")
    rep(f, "const src = CP[g + '_' + h] || CP[g + '_n']",
        "const lk = state.look || 'o1', src = CP[g + '_' + lk + '_' + h] || CP[g + '_' + lk + '_n'] || CP[g + '_' + h] || CP[g + '_n']")
print('p56 ok')
