/* ===== v8.6:裝備「器紋」詞條 · 階位套裝 · 器紋石 ===== */
(function () {
  const $ = id => document.getElementById(id), fmt = n => formatNum(n), E5 = window.X5;
  const rf = Math.random;
  /* ---------- 詞條定義:[key, 名稱, 基礎值(0 階、品質 1.0)] ---------- */
  const AF = [['atkP', '攻擊', .012], ['hpP', '氣血', .012], ['defP', '防禦', .012], ['crit', '會心率', .7], ['critD', '會心傷害', .03], ['ls', '吸血', .005], ['dodge', '閃避', .005], ['qiP', '吐納', .015], ['skAll', '神通傷害', .015], ['dmg', '總傷害', .01], ['stoneP', '靈石收益', .02], ['dropP', '掉落', .02]];
  const AB = {}; AF.forEach((a, i) => { AB[a[0]] = { n: a[1], b: a[2], i }; });
  const W = {
    weapon: [5, 1, 0, 3, 3, 2, 0, 0, 2, 3, 0, 0], armor: [0, 4, 5, 0, 0, 1, 3, 1, 0, 0, 0, 0], helm: [1, 3, 2, 1, 0, 0, 1, 2, 4, 1, 0, 1],
    boots: [1, 1, 1, 2, 0, 0, 5, 3, 0, 0, 0, 1], artifact: [3, 0, 0, 1, 2, 0, 0, 1, 5, 4, 0, 0], pendant: [0, 3, 3, 0, 0, 1, 1, 1, 0, 0, 3, 3], ring: [2, 0, 0, 4, 4, 3, 0, 0, 0, 1, 2, 1]
  };
  const scale = t => 1 + .2 * Math.max(0, t);
  const AFF = () => { if (!state.aff || typeof state.aff !== 'object') state.aff = {}; return state.aff; };
  const itemOf = slot => { const id = state.equipment && state.equipment[slot]; return id && ITEMS[id] ? ITEMS[id] : null; };
  const tierOf = slot => { const it = itemOf(slot); return it ? (it.tier != null ? it.tier : 0) : -1; };
  const capOf = slot => { const it = itemOf(slot); if (!it) return 0; const enh = (state.enhance && state.enhance[slot]) || 0; return 1 + (enh >= 5 ? 1 : 0) + (enh >= 10 ? 1 : 0) + ((it.quality === 'mythic' || /^st_/.test(it.id)) ? 1 : 0); };
  const val = (l, t) => AB[l.k].b * l.q * scale(t);
  const showV = (k, v) => k === 'crit' ? `+${(Math.round(v * 10) / 10)}%` : `+${(Math.round(v * 1000) / 10)}%`;
  const qTier = q => q >= 1.25 ? ['極品', '#f0abfc'] : q >= 1.05 ? ['上品', '#fbbf24'] : q >= .85 ? ['中品', '#38bdf8'] : ['下品', '#94a3b8'];
  function rollLine(slot, used) {
    const w = W[slot].map((x, i) => used.includes(AF[i][0]) ? 0 : x), sum = w.reduce((a, b) => a + b, 0);
    let r = rf() * sum, k = AF[0][0]; for (let i = 0; i < w.length; i++) { r -= w[i]; if (r <= 0 && w[i] > 0) { k = AF[i][0]; break; } }
    return { k, q: Math.round((0.6 + 0.8 * ((rf() + rf()) / 2)) * 100) / 100, l: 0 };
  }
  function slotEnsure(slot) {
    const A = AFF(), cap = capOf(slot); if (!cap) return;
    const o = A[slot] = A[slot] || { L: [], u: null }; if (!Array.isArray(o.L)) o.L = [];
    while (o.L.length < cap) o.L.push(rollLine(slot, o.L.map(x => x.k)));
  }
  E5.reg('器紋', () => {
    const A = AFF(), E = {};
    EQUIP_SLOTS.forEach(s => { const o = A[s], t = tierOf(s); if (!o || t < 0) return; o.L.slice(0, capOf(s)).forEach(l => { if (AB[l.k]) E[l.k] = (E[l.k] || 0) + val(l, t); }); });
    return E;
  });
  /* ---------- 套裝 ---------- */
  const SN = ['青雲守山', '萬妖獵影', '焚天烈陽', '雷崖驚霆', '縹緲凌虛', '九重天威', '太虛無相', '混沌歸一'];
  const A3 = v => ({ hpP: v, atkP: v, defP: v });
  const SB0 = [
    [{ hpP: .03 }, { defP: .04 }, { hpP: .05, defP: .06, dodge: .02 }],
    [{ atkP: .03 }, { ls: .01 }, { atkP: .05, dmg: .04 }],
    [{ atkP: .03 }, { critD: .08 }, { crit: 3, critD: .12 }],
    [{ crit: 2 }, { skAll: .05 }, { skAll: .07, crit: 3, dmg: .04 }],
    [{ qiP: .04 }, { dodge: .025 }, { qiP: .06, dodge: .03, hpP: .05 }],
    [{ hpP: .02, atkP: .02, defP: .02 }, { dmg: .05 }, { hpP: .04, atkP: .04, defP: .04, dmg: .05, critD: .1 }],
    [{ dodge: .02, ls: .008 }, { skAll: .07 }, { skAll: .09, dodge: .03, ls: .012, dmg: .04 }],
    [A3(.03), { skAll: .06, dmg: .05 }, { hpP: .06, atkP: .06, defP: .06, dmg: .07, skAll: .08, crit: 4, critD: .15 }]
  ];
  const TH = [2, 4, 7];
  function setFx(t, i) { const o = SB0[t][i], k = 1 + .12 * t, r = {}; Object.keys(o).forEach(x => r[x] = x === 'crit' ? Math.round(o[x] * k * 10) / 10 : o[x] * k); return r; }
  function setCounts() { const c = Array(8).fill(0); EQUIP_SLOTS.forEach(s => { const it = itemOf(s); if (!it || it.tier == null) return; for (let t = 0; t <= Math.min(7, it.tier); t++) c[t]++; }); return c; }
  function setActive() { const c = setCounts(), r = [-1, -1, -1]; TH.forEach((th, i) => { for (let t = 7; t >= 0; t--) if (c[t] >= th) { r[i] = t; break; } }); return { c, r }; }
  E5.reg('套裝', () => { const a = setActive(), E = {}; a.r.forEach((t, i) => { if (t < 0) return; const f = setFx(t, i); for (const k in f) E[k] = (E[k] || 0) + f[k]; }); return E; });
  /* ---------- 器紋石:掉落 / 購買 ---------- */
  const _eow = extOnWin;
  extOnWin = function (m, items) {
    _eow.apply(this, arguments);
    const E = E5.E();
    if (Math.random() < (m.isBoss ? .22 : .035) * (1 + (E.dropP || 0))) { const n = m.isBoss ? 1 + Math.floor(Math.random() * 2) : 1; state.inventory.rn_1 = (state.inventory.rn_1 || 0) + n; items.push(`🪨器紋石×${n}`); }
    if (E.dropP && m.drops) m.drops.forEach(d => { if (d.item === 'stone' || !ITEMS[d.item]) return; if (Math.random() < (d.chance || .5) * E.dropP) { state.inventory[d.item] = (state.inventory[d.item] || 0) + 1; items.push((ITEMS[d.item].name || d.item) + '(機緣)'); } });
  };
  { XT.towerWin86 = _t => function () { const f = currentBattle && currentBattle.floor; const r = _t.apply(this, arguments); if (f && (f % 5 === 0 || f % 9 === 0 || f === 100)) { const n = (f % 9 === 0 || f === 100) ? 3 : 1; state.inventory.rn_1 = (state.inventory.rn_1 || 0) + n; logAdventure(`🪨 塔中拾得器紋石 ×${n}`); } return r; }; }
  { XT.wbWin86 = _w => function () { const r = _w.apply(this, arguments); state.inventory.rn_1 = (state.inventory.rn_1 || 0) + 6; logAdventure('🪨 天地異種 遺落器紋石 ×6'); return r; }; }
  const today = () => { const d = new Date(); return `${d.getFullYear()}${d.getMonth() + 1}${d.getDate()}`; };
  const BUYCAP = 12;
  const rnPrice = () => Math.max(50, Math.floor(E5.sb() * .3));
  function buyLeft() { const b = state.affBuy = state.affBuy && state.affBuy.d === today() ? state.affBuy : { d: today(), n: 0 }; return BUYCAP - b.n; }
  /* ---------- 洗練 ---------- */
  const rrCost = slot => { const o = AFF()[slot]; if (!o) return null; const cap = capOf(slot), L = o.L.slice(0, cap), lk = L.filter(x => x.l).length, un = L.length - lk; return { un, lk, rn: un + lk * 2, st: un * Math.floor(E5.sb(Math.max(0, tierOf(slot))) * .08) }; };
  function reroll(slot) {
    const o = AFF()[slot], c = rrCost(slot); if (!o || !c) return; if (c.un < 1) { showToast('所有詞條都已鎖定,無可洗練。'); return; }
    if ((state.inventory.rn_1 || 0) < c.rn) { showToast(`器紋石不足,需要 ${c.rn} 枚。`); return; } if (state.stones < c.st) { showToast(`靈石不足,需要 ${fmt(c.st)}。`); return; }
    state.inventory.rn_1 -= c.rn; if (state.inventory.rn_1 <= 0) delete state.inventory.rn_1; state.stones -= c.st;
    o.u = JSON.parse(JSON.stringify(o.L)); const cap = capOf(slot);
    for (let i = 0; i < cap; i++) { if (o.L[i].l) continue; const used = o.L.map((x, j) => j === i ? null : x.k).filter(Boolean); o.L[i] = rollLine(slot, used); }
    E5.dirty(); audio.playQiChime(); try { updateTopBar(); renderInventory(); } catch (e) { } saveGame();
  }
  function cpWith(fn) { const c0 = calculateTotalStats().combatPower; fn(); E5.dirty(); const c1 = calculateTotalStats().combatPower; return [c0, c1]; }
  /* ---------- 介面 ---------- */
  let tab = 'af', selSlot = 'weapon';
  E5.sheet('aff', '🔮 器紋 · 套裝', b => {
    EQUIP_SLOTS.forEach(slotEnsure);
    const rn = state.inventory.rn_1 || 0;
    let h = `<div class="x5-tabs"><button class="${tab === 'af' ? 'on' : ''}" data-x5="af.tab" data-k="af">器紋詞條</button><button class="${tab === 'set' ? 'on' : ''}" data-x5="af.tab" data-k="set">階位套裝</button></div><div class="x5-sub" style="margin:6px 0">獨臂老匠傳下的古修銘紋術:於兵甲之上刻下器紋,借天地之力加持。</div>`;
    if (tab === 'af') {
      h += `<div class="x5-row" style="justify-content:space-between;margin-bottom:6px"><span>🪨 器紋石 <b style="color:#fcd34d">${rn}</b></span><button class="x5-btn" data-x5="af.buy" ${buyLeft() <= 0 ? 'disabled' : ''} style="padding:4px 8px;font-size:11px">＋1 枚・💎${fmt(rnPrice())}(餘${Math.max(0, buyLeft())})</button></div>`;
      h += `<div class="af-sl">${EQUIP_SLOTS.map(s => { const it = itemOf(s), L = (AFF()[s] || { L: [] }).L; return `<button class="${selSlot === s ? 'on' : ''}" data-x5="af.slot" data-s="${s}" style="${it ? '' : 'opacity:.45'}">${SLOT_INFO[s].n}<i>${it ? Math.min(capOf(s), L.length) + '/' + capOf(s) : '—'}</i></button>`; }).join('')}</div>`;
      const it = itemOf(selSlot), o = AFF()[selSlot], t = tierOf(selSlot);
      if (!it) h += '<div class="x5-cd" style="text-align:center;color:#94a3b8">該部位尚未穿戴裝備,穿上後會獲得器紋。</div>';
      else {
        const cap = capOf(selSlot), c = rrCost(selSlot), enh = (state.enhance && state.enhance[selSlot]) || 0;
        h += `<div class="x5-cd"><div style="font-weight:800;color:${Q_COL[it.quality] || '#e2e8f0'}">${it.icon} ${it.name} <span class="x5-sub">+${enh}・${TIER_NAME[Math.min(7, t)]}階</span></div><details class="af-dt"><summary>詞條 ${cap}/4・說明</summary>基礎 1 條,強化 +5、+10 各多 1 條,古仙遺品/出師寶物再 +1。數值隨裝備階位提升。</details>`;
        o.L.slice(0, cap).forEach((l, i) => { const q = qTier(l.q); h += `<div class="x5-row" style="margin-top:4px;background:#020617;border:1px solid ${l.l ? '#f59e0b' : '#1e293b'};border-radius:8px;padding:4px 8px"><b style="width:64px;color:${q[1]}"><i class="ii ui ii-n6_${String(AB[l.k].i + 1).padStart(2, '0')}" style="margin-right:3px"></i>${AB[l.k].n}</b><b style="flex:1;color:#34d399">${showV(l.k, val(l, t))}</b><span style="color:${q[1]};font-size:11px">${q[0]}</span><button class="x5-btn ${l.l ? 'am' : 'gy'}" data-x5="af.lock" data-i="${i}" style="padding:3px 8px">${l.l ? '🔒' : '🔓'}</button></div>`; });
        if (cap < 4) h += `<div class="x5-sub" style="margin-top:6px">🔒 另有 ${4 - cap} 條紋路待解鎖(強化 +5 / +10、古仙遺品或出師寶物)</div>`;
        h += `<div class="x5-row" style="margin-top:8px"><button class="x5-btn am" data-x5="af.roll" style="flex:1" ${c && c.un > 0 && rn >= c.rn && state.stones >= c.st ? '' : 'disabled'}>🔮 洗練(🪨${c ? c.rn : 0}・${c ? fmt(c.st) : 0}靈石)</button><button class="x5-btn gy" data-x5="af.undo" ${o.u ? '' : 'disabled'}>↩ 還原上次</button></div><details class="af-dt"><summary>洗練說明</summary>只重洗未鎖定的詞條;每條鎖定的詞條額外多花 2 枚器紋石。不滿意可「還原上次」一次。</details></div>`;
      }
    } else {
      const a = setActive(), cnt = a.c;
      h += `<details class="af-dt" style="margin-bottom:6px"><summary>套裝規則</summary>以「穿戴裝備的階位 ≥ 該階」的件數計算,高階裝備也能湊低階套裝;2/4/7 件各取你能啟動的最高階套裝。</details>`;
      h += `<div class="x5-cd" style="margin-bottom:8px"><b style="color:#fcd34d">目前啟動</b>${TH.map((th, i) => `<div class="x5-row" style="justify-content:space-between;padding:3px 0;border-bottom:1px dashed #1e293b"><span>${th} 件</span><span style="color:${a.r[i] >= 0 ? '#34d399' : '#64748b'}">${a.r[i] >= 0 ? `【${SN[a.r[i]]}】` + E5.fxText(setFx(a.r[i], i)) : '未達成'}</span></div>`).join('')}</div>`;
      for (let t = 0; t < 8; t++) h += `<details class="x5-cd af-dt" style="margin-bottom:6px;${cnt[t] >= 2 ? '' : 'opacity:.75'}" ${cnt[t] >= 2 ? 'open' : ''}><summary class="x5-row" style="justify-content:space-between;color:#e2e8f0"><b style="color:${Q_COL[TIER_Q[t]]}">${TIER_PRE[t]}・${SN[t]}</b><span class="x5-sub">${cnt[t]}/7 件</span></summary>${TH.map((th, i) => `<div style="font-size:11px;color:${cnt[t] >= th ? '#34d399' : '#64748b'}">${th} 件:${E5.fxText(setFx(t, i))}</div>`).join('')}</details>`;
    }
    b.innerHTML = h;
  });
  E5.act('af.tab', t => { tab = t.dataset.k; E5.refresh('aff'); });
  E5.act('af.slot', t => { selSlot = t.dataset.s; E5.refresh('aff'); });
  E5.act('af.lock', t => { const o = AFF()[selSlot], l = o && o.L[+t.dataset.i]; if (!l) return; const cap = capOf(selSlot), un = o.L.slice(0, cap).filter(x => !x.l).length; if (!l.l && un <= 1) { showToast('至少保留一條不鎖定。'); return; } l.l = l.l ? 0 : 1; saveGame(); E5.refresh('aff'); });
  E5.act('af.roll', () => { reroll(selSlot); E5.refresh('aff'); renderBar(); });
  E5.act('af.undo', () => { const o = AFF()[selSlot]; if (!o || !o.u) return; o.L = o.u; o.u = null; E5.dirty(); saveGame(); E5.refresh('aff'); renderBar(); showToast('已還原上一次洗練結果。'); });
  E5.act('af.buy', () => {
    if (buyLeft() <= 0) return; const p = rnPrice(); if (state.stones < p) { showToast(`靈石不足,需 ${fmt(p)}。`); return; }
    state.stones -= p; state.affBuy.n++; state.inventory.rn_1 = (state.inventory.rn_1 || 0) + 1; updateTopBar(); try { renderInventory(); } catch (e) { } saveGame(); E5.refresh('aff');
  });
  /* ---------- 儲物頁入口列 ---------- */
  const st = document.createElement('style');
  st.textContent = `#aff16{display:flex;gap:6px;align-items:center;background:linear-gradient(135deg,#1e1b4b,#0f172a);border:1px solid #4338ca;border-radius:10px;padding:6px 8px;margin-top:8px;font-size:11px;color:#c7d2fe}#aff16 .s{flex:1;min-width:0;line-height:1.4}#aff16 b{color:#fcd34d}#aff16 button{position:relative}`;
  st.textContent += `.af-sl{display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin-bottom:8px}.af-sl button{padding:6px 2px;border-radius:8px;background:#1e293b;color:#94a3b8;font-size:12px;font-weight:700}.af-sl button.on{background:#d97706;color:#fff}.af-sl i{font-style:normal;font-size:10px;margin-left:3px;opacity:.8}.af-dt{font-size:11px;color:#94a3b8;margin:4px 0}.af-dt summary{cursor:pointer;color:#94a3b8}`;
  document.head.appendChild(st);
  function renderBar() {
    const grid = $('equip-grid'); if (!grid) return; let bar = $('aff16');
    if (!bar) { bar = document.createElement('div'); bar.id = 'aff16'; bar.innerHTML = '<div class="s"></div><button class="x5-btn am" data-x5="af.open">🔮 器紋・套裝</button>'; grid.parentNode.insertBefore(bar, grid.nextSibling); }
    const a = setActive(), act = a.r.map((t, i) => t >= 0 ? `${TH[i]}件【${SN[t]}】` : null).filter(Boolean);
    const o = AFF(); let lines = 0; EQUIP_SLOTS.forEach(s => { lines += itemOf(s) ? Math.min(capOf(s), (o[s] || { L: [] }).L.length) : 0; });
    const h = `器紋 <b>${lines}</b> 條生效・套裝:${act.length ? act.join('、') : '尚未達成'}・🪨<b>${state.inventory.rn_1 || 0}</b>`;
    const s = bar.firstChild; if (s.dataset.h !== h) { s.dataset.h = h; s.innerHTML = h; }
  }
  E5.act('af.open', () => E5.open('aff'));
  function tick() { try { EQUIP_SLOTS.forEach(slotEnsure); renderBar(); } catch (e) { console.warn('x16', e); } }
  setTimeout(tick, 700); setInterval(tick, 1500);
  { const _eq = equipItem; equipItem = function () { const r = _eq.apply(this, arguments); E5.dirty(); tick(); return r; }; }
  { const _en = enhanceEquippedGear; enhanceEquippedGear = function () { const r = _en.apply(this, arguments); E5.dirty(); tick(); return r; }; }
  window.AFF16 = { AF, AB, capOf, val, setActive, setFx, SN, rollLine, reroll, open: () => E5.open('aff'), openSlot: sl => { selSlot = sl; tab = 'af'; E5.open('aff'); }, lines: sl => { const it = itemOf(sl), o = AFF()[sl]; if (!it || !o) return []; return o.L.slice(0, capOf(sl)).map(l => ({ k: l.k, v: val(l, tierOf(sl)), l: !!l.l })); } };
})();


