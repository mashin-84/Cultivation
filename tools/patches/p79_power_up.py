#!/usr/bin/env python3
"""v160 戰力提升:破局建議擴充為「戰力提升」面板——加入鍛造/神通/流派,列出全部可做項目與未開放途徑,對外提供 BK160。"""
import os
R = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
f = os.path.join(R, 'src/js/02_main/042_破局建議.js')
t = open(f, encoding='utf-8').read()
def rep(old, new, n=1):
    global t
    assert t.count(old) == n, (old[:60], t.count(old)); t = t.replace(old, new)

# 1. 解鎖判斷工具
rep("  let CUR = [];\n", """  let CUR = [];
  const unl = k => { try { return !window.UNLOCK9 || !UNLOCK9.on || UNLOCK9.on(k); } catch (e) { return true; } };
  const gsc = it => (it.atk || 0) * 2 + (it.def || 0) * 1.5 + (it.hp || 0) * .3;
""")
# 2. 鍛造(插在強化之前)
rep("    /* 2. 強化佩戴裝備 */", """    /* 1b. v160 鍛造:材料已足、且比身上與袋中都強的裝備(每個部位取最強一件) */
    if (unl('forge')) {
      const best = {};
      FORGE_RECIPES.forEach((r, idx) => {
        const it = ITEMS[r.giveItem]; if (!it || !it.slot || (r.tier || 0) > (state.realmIdx || 0) + 1) return;
        if (!r.need.every(n => (inv[n.item] || 0) >= n.count)) return;
        const cur = state.equipment[it.slot], cs = cur && ITEMS[cur] ? gsc(ITEMS[cur]) : -1;
        const bagBest = Object.keys(inv).reduce((m, k) => { const b = ITEMS[k]; return b && b.type === 'equipment' && b.slot === it.slot && inv[k] > 0 ? Math.max(m, gsc(b)) : m; }, -1);
        if (gsc(it) <= Math.max(cs, bagBest)) return;
        if (!best[it.slot] || gsc(it) > gsc(ITEMS[FORGE_RECIPES[best[it.slot]].giveItem])) best[it.slot] = idx;
      });
      Object.keys(best).forEach(slot => {
        const idx = best[slot], r = FORGE_RECIPES[idx], it = ITEMS[r.giveItem], cur = state.equipment[slot];
        const g = sim(() => { state.equipment[slot] = r.giveItem; }, () => { state.equipment[slot] = cur; });
        if (g <= 0) return;
        const cost = r.need.reduce((s, n) => s + n.count * price(n.item), 0);
        L.push({ ic: it.icon || '🔨', n: `鍛造【${it.name}】`, d: `${SLOT_INFO[slot] ? SLOT_INFO[slot].n : ''}・材料已備齊,鍛成後自動穿上`, gain: g, cost, res: r.need.map(n => `${(ITEMS[n.item] || {}).name || n.item}×${n.count}`).join('、'), ok: true, btn: '鍛造', run: () => craftForge(idx) });
      });
    }
    /* 2. 強化佩戴裝備 */""")
# 3. 天賦/煉體需已開放
rep("    TALENTS_DATA.forEach(tal => {", "    if (unl('talent')) TALENTS_DATA.forEach(tal => {")
rep("      const b0 = state.body || 0;\n      if (b0 < bodyCap()) {", "      const b0 = state.body || 0;\n      if (unl('body') && b0 < bodyCap()) {")
# 4. 神通、流派(無法精算戰力,列為前往項目)
rep("    const c0 = Math.max(1, cpNow());\n    L.forEach(x => { x.pct", """    /* v160 神通、流派心法:影響出招,戰力數字算不出,列為前往 */
    const G = [];
    try { if (skAnyAlert()) G.push({ ic: '⚡', n: '領悟/升級神通', d: '有可新學、可升級或可裝上的神通——戰鬥時的出手威力會變強', btn: '前往', ok: true, go: () => { goToTab('tab-techniques'); setTimeout(() => { const b = document.querySelector('[data-a51=sec][data-k=sk]'); if (b) b.click(); }, 150); } }); } catch (e) { }
    try { if (window.SC38 && SC38.alert()) G.push({ ic: '☯', n: '參悟流派心法', d: '道行足夠,流派心法可再參悟一層', btn: '前往', ok: true, go: () => X.open('school') }); } catch (e) { }
    const c0 = Math.max(1, cpNow());
    L.forEach(x => { x.pct""")
rep("    L.sort((a, b) => (b.ok - a.ok) || (b.eff - a.eff));\n    return L;", "    L.sort((a, b) => (b.ok - a.ok) || (b.eff - a.eff));\n    G.forEach(g => { g.gain = 0; g.pct = 0; g.res = ''; g.nav = true; L.push(g); });\n    return L;")
# 5. 面板改版
s0 = t.index("  X.sheet('bk', '💡 破局建議', b => {"); s1 = t.index("  X.act('bk.open', () => X.open('bk'));")
t = t[:s0] + """  /* v160 「還能從哪裡提升」:尚未隨劇情開放的系統,以及開放了但效果看運氣的途徑 */
  function moreHtml() {
    const lock = ((window.UNLOCK9 && UNLOCK9.U) || []).filter(u => ['forge', 'talent', 'body', 'pet', 'treasure', 'school', 'sub', 'xian', 'tower'].includes(u.k) && !unl(u.k));
    let h = '<div class="bk-h">還能從哪裡提升</div>';
    h += `<div class="x5-row" style="flex-wrap:wrap;gap:6px"><button class="x5-btn gy" data-x5="bk.go" data-t="root" style="flex:1 1 30%">靈根洗髓</button>${unl('forge') ? '<button class="x5-btn gy" data-x5="bk.go" data-t="aff" style="flex:1 1 30%">器紋重洗</button>' : ''}<button class="x5-btn gy" data-x5="bk.go" data-t="tab-crafting" style="flex:1 1 30%">淬體丹</button></div>`;
    if (lock.length) h += '<div class="x5-sub" style="margin:8px 0 4px">之後隨劇情開放:</div>' + lock.map(u => `<div class="bk-lk">🔒 <b>${u.name}</b><span>${u.hint || ''}</span></div>`).join('');
    return h;
  }
  X.sheet('bk', '⚡ 戰力提升', b => {
    const T = target(), rec = REC(T.t), cp = cpNow(), a = AREAS_DATA[T.t], gr = window.areaGrade9 ? areaGrade9(T.t, cp) : ['', '#94a3b8'];
    let h = `<div class="x5-card" style="margin-bottom:8px"><div class="x5-row" style="justify-content:space-between"><b style="color:#fcd34d">${a ? a.name : ''}${T.gate ? '・境主見證' : ''}</b><b style="color:${gr[1]}">${gr[0] || ''}</b></div><div class="x5-sub" style="margin-top:4px">你的戰力 <b style="color:#e2e8f0">${fmt(cp)}</b> ／ 建議 <b style="color:#e2e8f0">${fmt(rec)}</b>${rec && cp < rec * 1.2 ? `・距離「穩妥」還差約 <b style="color:#fbbf24">${fmt(Math.max(0, Math.ceil(rec * 1.2 - cp)))}</b>` : ''}</div>${farmAdvice(cp)}</div>`;
    CUR = cands(); const okL = CUR.filter(x => x.ok), noL = CUR.filter(x => !x.ok && !x.nav).slice(0, 3);
    const row = x => { const i = CUR.indexOf(x); return `<div class="bk-row ${x.ok ? '' : 'no'}"><div class="ic">${x.ic}</div><div class="mid"><div class="nm">${x.n}</div><div class="x5-sub">${x.d || ''}</div>${x.nav ? '' : `<div class="x5-sub"><span class="g">+${fmt(Math.floor(x.gain))} 戰力(+${x.pct.toFixed(1)}%)</span>・${x.res}</div>`}${x.ok ? '' : `<div class="bk-no">${x.why || ''}</div>`}</div><button class="x5-btn ${x.ok ? 'am' : 'gy'}" data-x5="bk.run" data-i="${i}" ${x.ok ? '' : 'disabled'} style="flex:none">${x.btn}</button></div>`; };
    h += '<div class="bk-h">現在就能做</div>';
    if (!okL.length) h += `<div class="x5-card" style="text-align:center;color:#94a3b8">目前沒有可直接執行的提升。<br>多修煉、多歷練累積靈石與材料後再來看看。</div>`;
    else { h += `<div class="x5-sub" style="margin-bottom:6px">依「花費換到的戰力」排序,由上往下做最划算:</div>`; okL.forEach(x => { h += row(x); }); }
    if (noL.length) { h += '<div class="bk-h">差一點就能做</div>'; noL.forEach(x => { h += row(x); }); }
    h += moreHtml();
    b.innerHTML = h;
  });
""" + t[s1:]
rep("  X.act('bk.go', t => { X.close('bk'); try { goToTab(t.dataset.t); } catch (e) { } });",
    """  X.act('bk.go', t => { X.close('bk'); const k = t.dataset.t;
    try {
      if (k === 'root') { goToTab('tab-techniques'); setTimeout(() => { const b = document.querySelector('[data-a51=sec][data-k=root]'); if (b) b.click(); }, 150); }
      else if (k === 'aff') { goToTab('tab-techniques'); setTimeout(() => { try { AFF16.openSlot('weapon'); } catch (e) { } }, 150); }
      else goToTab(k);
    } catch (e) { } });""")
rep("  X.act('bk.run', t => { const x = CUR[+t.dataset.i]; if (!x || !x.ok) return; try { x.run(); }",
    "  X.act('bk.run', t => { const x = CUR[+t.dataset.i]; if (!x || !x.ok) return; if (x.go) { X.close('bk'); try { x.go(); } catch (e) { } return; } try { x.run(); }")
rep("const show = need && (!g || T.gate), html = show ? `<button class=\"x5-btn am\" data-x5=\"bk.open\">💡 破局建議</button>",
    "const show = need && (!g || T.gate), html = show ? `<button class=\"x5-btn am\" data-x5=\"bk.open\">⚡ 戰力提升</button>")
# 6. 樣式與對外介面
STYLE = ".bk-h{font-weight:900;font-size:13px;color:#8a5a12;margin:10px 0 6px}.bk-lk{display:flex;justify-content:space-between;gap:8px;font-size:12.5px;padding:6px 10px;border-radius:8px;background:rgba(201,169,107,.14)!important;border:1px solid rgba(201,169,107,.45);color:#5a3a0c!important;margin-bottom:4px}.bk-lk span{opacity:.8}.bk-row{background:#fffaf0!important;border:1px solid #e0cfa8!important;color:#3a2e1c}.bk-row .nm{color:#8a5a12!important}.bk-row .g{color:#15803d!important}"
t = t.rstrip()
if 'window.BK160' not in t:
    t = t.replace("  setInterval(upd, 1500); setTimeout(upd, 800);", "  setInterval(upd, 1500); setTimeout(upd, 800);\n  { const s160 = document.createElement('style'); s160.textContent = '" + STYLE + "'; document.head.appendChild(s160); }\n  window.BK160 = { cands: () => cands(), ok: () => cands().filter(x => x.ok), target, cp: cpNow, rec: () => REC(target().t), open: () => X.open('bk') };", 1)
    assert 'window.BK160' in t
open(f, 'w', encoding='utf-8').write(t + '\n'); print('OK')

# v160b 淺色化與建議值為 0 時隱藏(已直接套用於 src)
