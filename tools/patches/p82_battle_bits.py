#!/usr/bin/env python3
"""v160 重要戰鬥細節(35_v113 與 p48_bf.js 同步):劇情角色的普攻戰報用角色自己的文字(B.A.alog);孩童揮鋤不再寫「劍光如虹」;
勝敗畫面時主角背影縮小淡出,不再蓋住半個畫面。"""
import os
R = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
OLD1 = "log(q === 'pf' ? L[0] : q === 'gd' ? L[1] : L[2]); }"
NEW1 = "const L2 = (B.A && B.A.alog) || L; log(q === 'pf' ? L2[0] : q === 'gd' ? L2[1] : L2[2]); }"
OLD2 = "        who: '你', atk: ['揮鋤', '看準時機・用盡全力砸下去'],"
NEW2 = "        who: '你', atk: ['揮鋤', '看準時機・用盡全力砸下去'], alog: ['鋤頭結結實實砸中三下,妖狼痛得一縮!', '鋤頭砸中兩下。', '鋤頭只擦過妖狼的皮毛。'],"
for p in ['src/js/35_v113_重要戰鬥.js', 'tools/patches/p48_bf.js']:
    f = os.path.join(R, p); t = open(f, encoding='utf-8').read()
    if NEW1 in t: print(p, '已套用'); continue
    assert t.count(OLD1) == 1, (p, 1); t = t.replace(OLD1, NEW1)
    if OLD2 in t: t = t.replace(OLD2, NEW2)
    open(f, 'w', encoding='utf-8').write(t); print(p, 'OK')
# 勝敗畫面:主角背影淡出(下一場開始時恢復)
OLD3 = "    const box = $('bf-end');\n    box.innerHTML = `<div class=\"stamp"
NEW3 = "    { const pi = $('bf-pi'); if (pi) { pi.style.transition = 'opacity .8s'; pi.style.opacity = '.28'; } }\n    const box = $('bf-end');\n    box.innerHTML = `<div class=\"stamp"
OLD4 = "    $('bf-pi').src = pose(1) || playerArt(); const ei = $('bf-ei');"
NEW4 = "    $('bf-pi').src = pose(1) || playerArt(); $('bf-pi').style.opacity = ''; const ei = $('bf-ei');"
for p in ['src/js/35_v113_重要戰鬥.js', 'tools/patches/p48_bf.js']:
    f = os.path.join(R, p); t = open(f, encoding='utf-8').read()
    if NEW3 in t: print(p, '背影已套用'); continue
    assert t.count(OLD3) == 1 and t.count(OLD4) == 1, p
    t = t.replace(OLD3, NEW3).replace(OLD4, NEW4); open(f, 'w', encoding='utf-8').write(t); print(p, '背影 OK')
