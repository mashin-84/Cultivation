#!/usr/bin/env python3
"""v158 選招半身依流派:CP124 依資料夾重產鍵表;選招面板先取 {g}_{look}_{流派}_{n|h},沒有再退回劍修鏈。可重複執行(鍵表每次重產)。"""
import os, re, json
R = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
# 1) 鍵表:CP 資料夾裡所有 webp
f = os.path.join(R, 'src/js/34d_v124_戰鬥半身.js'); t = open(f, encoding='utf-8').read()
keys = sorted(x[:-5] for x in os.listdir(os.path.join(R, 'src/assets/CP')) if x.endswith('.webp'))
line = 'window.CP124 = ' + json.dumps({k: f'data:image/webp;base64,@@IMG:CP/{k}@@' for k in keys}, ensure_ascii=False) + ';'
t2, n = re.subn(r'^window\.CP124 = .*;$', lambda m: line, t, flags=re.M); assert n == 1
open(f, 'w', encoding='utf-8').write(t2)
# 2) 取圖順序(兩份戰鬥模組)
OLD = "const lk = state.look || 'o1', src = (B.A && B.A.cp && B.A.cp(h)) || CP[g + '_' + lk + '_' + h] || CP[g + '_' + lk + '_n'] || CP[g + '_' + h] || CP[g + '_n'] || U[g + '_sword'] || playerArt(); if (cp.getAttribute('src') !== src) cp.src = src; cp.classList.toggle('cp', !!(CP[g + '_' + h] || CP[g + '_n'])); cp.classList.toggle('hurt', h === 'h' && !CP[g + '_h']); }"
NEW = ("const lk = state.look || 'o1', sc = STY(), sk = sc !== 'sword' ? g + '_' + lk + '_' + sc + '_' : '', "
       "hk = sk && CP[sk + h] ? sk + h : sk && CP[sk + 'n'] ? sk + 'n' : '', "
       "src = (B.A && B.A.cp && B.A.cp(h)) || (hk && CP[hk]) || CP[g + '_' + lk + '_' + h] || CP[g + '_' + lk + '_n'] || CP[g + '_' + h] || CP[g + '_n'] || U[g + '_sword'] || playerArt(); "
       "if (cp.getAttribute('src') !== src) cp.src = src; cp.classList.toggle('cp', !!(CP[g + '_' + h] || CP[g + '_n'])); "
       "cp.classList.toggle('hurt', h === 'h' && (hk ? !hk.endsWith('_h') : !CP[g + '_h'])); }")
for p in ['src/js/35_v113_重要戰鬥.js', 'tools/patches/p48_bf.js']:
    f = os.path.join(R, p); t = open(f, encoding='utf-8').read()
    if NEW in t: print(p, '已套用'); continue
    assert t.count(OLD) == 1, p; open(f, 'w', encoding='utf-8').write(t.replace(OLD, NEW)); print(p, 'OK')
print(len(keys), '個 CP 鍵')
