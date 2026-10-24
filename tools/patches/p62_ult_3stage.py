#!/usr/bin/env python3
"""最終版140:本命絕學三段:蓄力(7) → 爆發(8:躍出約一半距離並騰空,光閃+速度線+招式大字,停 0.25 秒) → 突刺(2:劍尖命中,命中瞬間光爆+震畫面+傷害)"""
import os
R = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
OLD_FN_HEAD = """  function thrust(t, ms) {
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
NEW_FN = """  /* 目標位移/縮放(須在原位、未位移時量) */
  function thrustT(t) {
    const i = $('bf-pi'), s = $('bf-stg'); if (!i || !s) return null;
    const r = i.getBoundingClientRect(), q = s.getBoundingClientRect(), L = r.left - q.left, Tp = r.top - q.top, w = r.width, h = r.height, ox = L + w / 2, oy = Tp + h;
    const px = L + t[0] * w, py = Tp + t[1] * h, [ex, ey] = center('bf-ei');
    let sc = px - ox > 1 ? (q.width * .34) / (px - ox) : .62; sc = Math.max(.3, Math.min(.85, sc));
    return { dx: ex - ox - sc * (px - ox), dy: ey - oy - sc * (py - oy), sc, H: q.height };
  }
  /* 由目前位置移到 to = {dx,dy,sc} */
  function mvTo(to, ms, ease) {
    const i = $('bf-pi'); if (!i || !to) return Promise.resolve();
    let from = { translate: '0px 0px', scale: '1' };
    if (i._mv) { const kf = i._mv.effect.getKeyframes(), l = kf[kf.length - 1]; from = { translate: l.translate, scale: String(l.scale) }; i._mv.cancel(); }
    i.style.transition = 'none';
    const a = i.animate([from, { translate: `${to.dx}px ${to.dy}px`, scale: String(to.sc) }], { duration: ms, easing: ease || 'cubic-bezier(.3,.0,.4,1)', fill: 'forwards' });
    i._mv = a; return a.finished.catch(() => { });
  }
  function thrust(t, ms) { return mvTo(thrustT(t), ms || 220); }
"""
OLD_ULT = """    pi.classList.remove('chg'); setPose(2); await thrust(tip(2), 240); fxBurst(uc); B.fxc = uc; speed(uc);
    sfx('sfx_ult'); shake(); skName(B.ult.n);"""
NEW_ULT = """    pi.classList.remove('chg'); B.fxc = uc;
    const T = thrustT(tip(2));
    /* 爆發:躍出約一半距離並騰空 */
    setPose(8); if (T) await mvTo({ dx: T.dx * .45, dy: T.dy * .45 - T.H * .07, sc: 1 + (T.sc - 1) * .5 }, 200, 'cubic-bezier(.2,.8,.3,1)');
    { const fl = fxEl('fx-flash', 0, 0, { '--c': uc }); setTimeout(() => fl.remove(), 900); } speed(uc); sfx('sfx_ult'); skName(B.ult.n);
    await sleep(250);
    /* 突刺:劍尖命中 */
    setPose(2); if (T) await mvTo(T, 150, 'cubic-bezier(.5,0,.9,.6)');
    fxBurst(uc); shake();"""
for f in ('src/js/35_v113_重要戰鬥.js', 'tools/patches/p48_bf.js'):
    p = os.path.join(R, f); s = open(p, encoding='utf-8', newline='').read()
    assert s.count(OLD_FN_HEAD) == 1 and s.count(OLD_ULT) == 1, f
    s = s.replace(OLD_FN_HEAD, NEW_FN).replace(OLD_ULT, NEW_ULT)
    open(p, 'w', encoding='utf-8', newline='').write(s)
print('p62 ok')
