#!/usr/bin/env python3
"""最終版109:丹器頁切換部位/種類時,橫向那排不再跳回最前面(重畫前記住每一排的捲動位置)"""
import os, glob
p = glob.glob(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src', 'js', '17_v12_1_*.js'))[0]
s = open(p, encoding='utf-8', newline='').read()
old = """      const st = root.querySelector('.strip'), sl = st ? st.scrollLeft : 0;
      sig = h; root.innerHTML = h;
      const s2 = root.querySelector('.strip'); if (s2) { s2.scrollLeft = sl;"""
new = """      const st = root.querySelector('.strip'), sl = st ? st.scrollLeft : 0;
      const keep = [], cnt = {}; root.querySelectorAll('*').forEach(e => { const c = e.className; if (typeof c !== 'string') return; const k = cnt[c] = (cnt[c] || 0) + 1; if (e.scrollLeft > 0) keep.push([c, k, e.scrollLeft]); });   /* v109 記住每一排橫向捲動(以 class + 第幾個 對應) */
      sig = h; root.innerHTML = h;
      if (keep.length) { const c2 = {}, want = {}; keep.forEach(([c, k, x]) => { want[c + '|' + k] = x; }); root.querySelectorAll('*').forEach(e => { const c = e.className; if (typeof c !== 'string') return; const k = c2[c] = (c2[c] || 0) + 1, x = want[c + '|' + k]; if (x) e.scrollLeft = x; }); }
      const s2 = root.querySelector('.strip'); if (s2) { s2.scrollLeft = sl;"""
assert s.count(old) == 1; open(p, 'w', encoding='utf-8', newline='').write(s.replace(old, new)); print('p42 ok')
