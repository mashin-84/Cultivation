#!/usr/bin/env python3
"""最終版139:本命絕學爆發改用「劍朝前突刺」動作(動作 2),並依劍尖位置換算縮放與位移,讓劍尖正好刺在敵人身上
(一般 aim 為了不讓腳步往左退會壓縮放,劍很長時劍尖會刺過頭;絕學另外算:腳站在敵人左下約 1/3 畫面寬處)"""
import os
R = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
old = "pi.classList.remove('chg'); setPose(8); await go(1, .58, 230, 0, tip(8));"
new = "pi.classList.remove('chg'); setPose(2); await thrust(tip(2), 240);"
fn_anchor = "  function back(ms) {"
fn = """  /* v139 絕學突刺:劍尖落在敵人身上(腳站在敵人左下約 1/3 畫面寬) */
  function thrust(t, ms) {
    const i = $('bf-pi'), s = $('bf-stg'); if (!i || !s) return Promise.resolve();
    const r = i.getBoundingClientRect(), q = s.getBoundingClientRect(), L = r.left - q.left, Tp = r.top - q.top, w = r.width, h = r.height, ox = L + w / 2, oy = Tp + h;
    const px = L + t[0] * w, py = Tp + t[1] * h, [ex, ey] = center('bf-ei');
    let sc = px - ox > 1 ? (q.width * .34) / (px - ox) : .62; sc = Math.max(.3, Math.min(.85, sc));
    const dx = ex - ox - sc * (px - ox), dy = ey - oy - sc * (py - oy);
    i.style.transition = 'none';
    const a = i.animate([{ translate: '0 0', scale: '1' }, { translate: `${dx}px ${dy}px`, scale: String(sc) }], { duration: ms || 220, easing: 'cubic-bezier(.3,.0,.4,1)', fill: 'forwards' });
    i._mv = a; return a.finished.catch(() => { });
  }
"""
for f in ('src/js/35_v113_重要戰鬥.js', 'tools/patches/p48_bf.js'):
    p = os.path.join(R, f); s = open(p, encoding='utf-8', newline='').read()
    assert s.count(old) == 1 and s.count(fn_anchor) == 1, f
    s = s.replace(old, new).replace(fn_anchor, fn + fn_anchor)
    open(p, 'w', encoding='utf-8', newline='').write(s)
print('p61 ok')
