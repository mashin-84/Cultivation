#!/usr/bin/env python3
"""最終版122:本命絕學過場換上專屬特寫(男女 × 劍/法/體/丹 四流派),下緣淡出"""
import os, glob
SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src')
p = os.path.join(SRC, 'index.html'); s = open(p, encoding='utf-8', newline='').read()
old = '@@INC:js/35_v113_重要戰鬥.js@@'; assert s.count(old) == 1
s = s.replace(old, '@@INC:js/34c_v122_絕學特寫.js@@\n' + old); open(p, 'w', encoding='utf-8', newline='').write(s)
keys = [f'{g}_{k}' for g in 'FM' for k in ('sword', 'magic', 'body', 'pill')]
for k in keys: assert os.path.exists(os.path.join(SRC, 'assets', 'UC', k + '.webp')), k
open(os.path.join(SRC, 'js', '34c_v122_絕學特寫.js'), 'w', encoding='utf-8', newline='').write('/* v122 本命絕學過場特寫 */\nwindow.UC121 = {' + ', '.join(f'"{k}": "data:image/webp;base64,@@IMG:UC/{k}@@"' for k in keys) + '};\n')
for f in [os.path.join(SRC, 'js', '35_v113_重要戰鬥.js'), os.path.join(os.path.dirname(os.path.abspath(__file__)), 'p48_bf.js')]:
    t = open(f, encoding='utf-8').read(); o = "#bf-ucut img{position:absolute;left:-6%;top:12%;height:66%;max-width:none;filter:drop-shadow(0 0 16px var(--uc));"
    assert t.count(o) == 1, f
    t = t.replace(o, "#bf-ucut img{position:absolute;left:-16%;top:20%;height:44%;max-width:none;filter:drop-shadow(0 0 16px var(--uc));-webkit-mask-image:linear-gradient(to bottom,#000 72%,transparent 98%);mask-image:linear-gradient(to bottom,#000 72%,transparent 98%);")
    open(f, 'w', encoding='utf-8').write(t)
print('p51 ok')
