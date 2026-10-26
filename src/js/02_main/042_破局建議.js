/* =====================  破局建議  ===================== */
  const REC = t => (typeof CAL9 !== 'undefined' && CAL9.REC && CAL9.REC[t]) || 0;
  const cpNow = () => calculateTotalStats().combatPower;
  const price = k => (ITEMS[k] && ITEMS[k].price) || 0;
  function gateTier() {
    try { const i = state.realmIdx || 0, a = AREAS_DATA[i]; if (a && REALM_DATA[i + 1] && state.subRealm >= REALM_DATA[i].subMax && !(state.areaFirstClear && state.areaFirstClear[a.id])) return i; } catch (e) { }
    return -1;
  }
  const target = () => { const g = gateTier(); return g >= 0 ? { t: g, gate: true } : { t: Math.min(7, Math.max(0, state.currentArea || 0)), gate: false }; };
  /* 暫時改動 → 量戰力差 → 還原(純試算,不留痕跡) */
  function sim(fn, undo) { const c0 = cpNow(); let c1 = c0; try { fn(); c1 = cpNow(); } catch (e) { } finally { try { undo(); } catch (e) { } } return c1 - c0; }
  let CUR = [];
  const unl = k => { try { return !window.UNLOCK9 || !UNLOCK9.on || UNLOCK9.on(k); } catch (e) { return true; } };
  const gsc = it => (it.atk || 0) * 2 + (it.def || 0) * 1.5 + (it.hp || 0) * .3;
  function cands() {
    const L = [], inv = state.inventory || {}, sc = it => (it.atk || 0) * 2 + (it.def || 0) * 1.5 + (it.hp || 0) * .3;
    /* 1. 換上背包裡更強的裝備(免費) */
    const sw = [];
    EQUIP_SLOTS.forEach(slot => {
      const cur = state.equipment[slot]; let best = null, bs = cur && ITEMS[cur] ? sc(ITEMS[cur]) : -1;
      Object.keys(inv).forEach(k => { const it = ITEMS[k]; if (it && it.type === 'equipment' && it.slot === slot && inv[k] > 0 && sc(it) > bs) { bs = sc(it); best = k; } });
      if (best) sw.push([slot, cur, best]);
    });
    if (sw.length) {
      const g = sim(() => sw.forEach(([s, c, b]) => { state.equipment[s] = b; }), () => sw.forEach(([s, c]) => { state.equipment[s] = c; }));
      L.push({ ic: '⚔️', n: '換上更強的裝備', d: `儲物袋裡有 ${sw.length} 件比身上更強`, gain: g, cost: 0, res: '免費', ok: true, btn: '一鍵換裝', run: () => autoEquipBest() });
    }
    /* 1b. v160 鍛造:材料已足、且比身上與袋中都強的裝備(每個部位取最強一件) */
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
    /* 2. 強化佩戴裝備 */
    let be = null;
    EQUIP_SLOTS.forEach(slot => {
      const id = state.equipment[slot]; if (!id || !ITEMS[id]) return; const cur = (state.enhance || {})[slot] || 0; if (cur >= enhCap()) return;
      const c = enhCost(cur), ok = state.stones >= c.stone && (inv[c.oreKey] || 0) >= c.ore, [a, b] = cpIfEnh(slot), ch = enhChance(cur) / 100, gain = (b - a) * ch, cost = c.stone + c.ore * price(c.oreKey);
      const e = { slot, cur, c, ok, gain, cost, eff: gain / Math.max(1, cost), ch };
      if (!be || (e.ok && !be.ok) || (e.ok === be.ok && e.eff > be.eff)) be = e;
    });
    if (be && be.gain > 0) {
      const ot = ITEMS[be.c.oreKey];
      L.push({ ic: '🔨', n: `強化【${SLOT_INFO[be.slot].n}】+${be.cur} → +${be.cur + 1}`, d: `成功率 ${Math.round(be.ch * 100)}%・按鈕會從最低的部位開始連續強化`, gain: be.gain, cost: be.cost, res: `💎${fmt(be.c.stone)} + ${ot ? ot.name : be.c.oreKey}×${be.c.ore}`, ok: be.ok, why: '靈石或靈礦不足', btn: '一鍵強化', run: () => enhanceAll() });
    }
    /* 3. 功法:新參悟 / 升重 */
    TECHNIQUES_DATA.forEach(def => {
      if ((def.realmReq || 0) > (state.realmIdx || 0)) return;
      const ut = (state.techniques || []).find(t => t.id === def.id); let cost, g, act, name;
      if (ut && ut.learned && ut.level > 0) {
        if (ut.level >= def.maxLevel) return; cost = Math.floor(def.cost * Math.pow(1.6, ut.level)); const l0 = ut.level;
        g = sim(() => { ut.level = l0 + 1; }, () => { ut.level = l0; }); act = () => upgradeTechnique(def.id); name = `${def.name} 升至第 ${l0 + 1} 重`;
      } else {
        cost = def.cost; const had = !!ut, o = ut ? { l: ut.learned, v: ut.level } : null;
        g = sim(() => { if (ut) { ut.learned = true; ut.level = 1; } else state.techniques.push({ id: def.id, level: 1, learned: true }); }, () => { if (had) { ut.learned = o.l; ut.level = o.v; } else state.techniques = state.techniques.filter(t => t.id !== def.id); });
        act = () => learnTechnique(def.id); name = `參悟${def.name}`;
      }
      if (g > 0) L.push({ ic: '📜', n: name, d: def.desc, gain: g, cost, res: `💎${fmt(cost)}`, ok: state.stones >= cost, why: `靈石差 ${fmt(Math.max(0, cost - state.stones))}`, btn: '修習', run: act });
    });
    /* 4. 先天天賦(道心點) */
    if (unl('talent')) TALENTS_DATA.forEach(tal => {
      state.talents = state.talents || {}; const lv = state.talents[tal.id] || 0; if (lv >= tal.maxLevel || tal.stat === 'maxAge') return; const nc = talCost(tal, lv), had = tal.id in state.talents;
      const g = sim(() => { state.talents[tal.id] = lv + 1; }, () => { if (had) state.talents[tal.id] = lv; else delete state.talents[tal.id]; });
      if (g > 0) L.push({ ic: '🌿', n: `天賦【${tal.name}】${lv + 1} 重`, d: lv >= 3 ? '第 4 重起每重效果較小' : tal.desc || '', gain: g, cost: 0, res: `☯ 道心點 ×${nc}`, ok: (state.daoPoints || 0) >= nc, why: '道心點不足', btn: '點天賦', run: () => upgradeTalent(tal.id) });
    });
    /* 5. 命格:煉體 1 層(靈石) */
    try {
      const b0 = state.body || 0;
      if (unl('body') && b0 < bodyCap()) {
        const cost = bodyCost(), g = sim(() => { state.body = b0 + 1; }, () => { state.body = b0; });
        if (g > 0) L.push({ ic: '🦴', n: `煉體至第 ${b0 + 1} 層`, d: '氣血、防禦、攻擊小幅提升', gain: g, cost, res: `💎${fmt(cost)}`, ok: state.stones >= cost, why: `靈石差 ${fmt(Math.max(0, cost - state.stones))}`, btn: '錘鍊',
          run: () => { const c = bodyCost(); if (state.stones < c || (state.body || 0) >= bodyCap()) return; state.stones -= c; state.body = (state.body || 0) + 1; showToast('錘鍊肉身,筋骨更勝往昔!'); } });
      }
    } catch (e) { }
    /* 6. 靈寵:出戰靈寵升 1 級(靈石) */
    try {
      const pid = state.activePet, ap = state.pets && state.pets[pid], pd = ap && PETS.find(x => x.id === pid);
      if (ap && pd && ap.lv < petCap()) {
        const l0 = ap.lv, cost = petUpCost(l0), g = sim(() => { ap.lv = l0 + 1; }, () => { ap.lv = l0; });
        if (g > 0) L.push({ ic: pd.i || '🐾', n: `${pd.n} 升至 ${l0 + 1} 級`, d: '出戰靈寵加成提升', gain: g, cost, res: `💎${fmt(cost)}`, ok: state.stones >= cost, why: `靈石差 ${fmt(Math.max(0, cost - state.stones))}`, btn: '餵養',
          run: () => { const o = state.pets[pid]; if (!o) return; const c = petUpCost(o.lv); if (state.stones < c || o.lv >= petCap()) return; state.stones -= c; o.lv++; showToast(`${pd.n} 升級!`); } });
      }
    } catch (e) { }
    /* v160 神通、流派心法:影響出招,戰力數字算不出,列為前往 */
    const G = [];
    try { if (skAnyAlert()) G.push({ ic: '⚡', n: '領悟/升級神通', d: '有可新學、可升級或可裝上的神通——戰鬥時的出手威力會變強', btn: '前往', ok: true, go: () => { goToTab('tab-techniques'); setTimeout(() => { const b = document.querySelector('[data-a51=sec][data-k=sk]'); if (b) b.click(); }, 150); } }); } catch (e) { }
    try { if (window.SC38 && SC38.alert()) G.push({ ic: '☯', n: '參悟流派心法', d: '道行足夠,流派心法可再參悟一層', btn: '前往', ok: true, go: () => X.open('school') }); } catch (e) { }
    const c0 = Math.max(1, cpNow());
    L.forEach(x => { x.pct = x.gain / c0 * 100; x.eff = x.cost > 0 ? x.gain / x.cost : 1e12 + x.gain; });
    L.sort((a, b) => (b.ok - a.ok) || (b.eff - a.eff));
    G.forEach(g => { g.gain = 0; g.pct = 0; g.res = ''; g.nav = true; L.push(g); });
    return L;
  }
  function farmAdvice(cp) {
    const T = target(); if (T.gate) return ''; const i = T.t, r = REC(i); if (!r || cp / r >= .8) return '';
    for (let j = Math.min(7, state.realmIdx || 0); j >= 0; j--) if (REC(j) && cp / REC(j) >= 1.2 && j !== i) return `<div class="x5-sub" style="margin-top:6px;color:#fbbf24">⛏ 目前這區對你太吃力了——建議先到【${AREAS_DATA[j].name}】穩穩刷靈石與材料,等戰力補上來再回來。</div>`;
    return '';
  }
  /* v160 「還能從哪裡提升」:尚未隨劇情開放的系統,以及開放了但效果看運氣的途徑 */
  function moreHtml() {
    const lock = ((window.UNLOCK9 && UNLOCK9.U) || []).filter(u => ['forge', 'talent', 'body', 'pet', 'treasure', 'school', 'sub', 'xian', 'tower'].includes(u.k) && !unl(u.k));
    let h = '<div class="bk-h">還能從哪裡提升</div>';
    h += `<div class="x5-row" style="flex-wrap:wrap;gap:6px"><button class="x5-btn gy" data-x5="bk.go" data-t="root" style="flex:1 1 30%">靈根洗髓</button>${unl('forge') ? '<button class="x5-btn gy" data-x5="bk.go" data-t="aff" style="flex:1 1 30%">器紋重洗</button>' : ''}<button class="x5-btn gy" data-x5="bk.go" data-t="tab-crafting" style="flex:1 1 30%">淬體丹</button></div>`;
    if (lock.length) h += '<div class="x5-sub" style="margin:8px 0 4px">之後隨劇情開放:</div>' + lock.map(u => `<div class="bk-lk">🔒 <b>${u.name}</b><span>${u.hint || ''}</span></div>`).join('');
    return h;
  }
  X.sheet('bk', '⚡ 戰力提升', b => {
    const T = target(), rec = REC(T.t), cp = cpNow(), a = AREAS_DATA[T.t], gr = window.areaGrade9 ? areaGrade9(T.t, cp) : ['', '#94a3b8'];
    let h = `<div class="x5-card" style="margin-bottom:8px"><div class="x5-row" style="justify-content:space-between"><b style="color:#fcd34d">${a ? a.name : ''}${T.gate ? '・境主見證' : ''}</b><b style="color:${gr[1]}">${gr[0] || ''}</b></div><div class="x5-sub" style="margin-top:4px">你的戰力 <b style="color:#e2e8f0">${fmt(cp)}</b> ${rec ? `／ 建議 <b style="color:#e2e8f0">${fmt(rec)}</b>` : ''}${rec && cp < rec * 1.2 ? `・距離「穩妥」還差約 <b style="color:#fbbf24">${fmt(Math.max(0, Math.ceil(rec * 1.2 - cp)))}</b>` : ''}</div>${farmAdvice(cp)}</div>`;
    CUR = cands(); const okL = CUR.filter(x => x.ok), noL = CUR.filter(x => !x.ok && !x.nav).slice(0, 3);
    const row = x => { const i = CUR.indexOf(x); return `<div class="bk-row ${x.ok ? '' : 'no'}"><div class="ic">${x.ic}</div><div class="mid"><div class="nm">${x.n}</div><div class="x5-sub">${x.d || ''}</div>${x.nav ? '' : `<div class="x5-sub"><span class="g">+${fmt(Math.floor(x.gain))} 戰力(+${x.pct.toFixed(1)}%)</span>・${x.res}</div>`}${x.ok ? '' : `<div class="bk-no">${x.why || ''}</div>`}</div><button class="x5-btn ${x.ok ? 'am' : 'gy'}" data-x5="bk.run" data-i="${i}" ${x.ok ? '' : 'disabled'} style="flex:none">${x.btn}</button></div>`; };
    h += '<div class="bk-h">現在就能做</div>';
    if (!okL.length) h += `<div class="x5-card" style="text-align:center;color:#94a3b8">目前沒有可直接執行的提升。<br>多修煉、多歷練累積靈石與材料後再來看看。</div>`;
    else { h += `<div class="x5-sub" style="margin-bottom:6px">依「花費換到的戰力」排序,由上往下做最划算:</div>`; okL.forEach(x => { h += row(x); }); }
    if (noL.length) { h += '<div class="bk-h">差一點就能做</div>'; noL.forEach(x => { h += row(x); }); }
    h += moreHtml();
    b.innerHTML = h;
  });
  X.act('bk.open', () => X.open('bk'));
  X.act('bk.go', t => { X.close('bk'); const k = t.dataset.t;
    try {
      if (k === 'root') { goToTab('tab-techniques'); setTimeout(() => { const b = document.querySelector('[data-a51=sec][data-k=root]'); if (b) b.click(); }, 150); }
      else if (k === 'aff') { goToTab('tab-techniques'); setTimeout(() => { try { AFF16.openSlot('weapon'); } catch (e) { } }, 150); }
      else goToTab(k);
    } catch (e) { } });
  X.act('bk.run', t => { const x = CUR[+t.dataset.i]; if (!x || !x.ok) return; if (x.go) { X.close('bk'); try { x.go(); } catch (e) { } return; } try { x.run(); } catch (e) { } try { updateTopBar(); renderInventory(); } catch (e) { } saveGame(); X.refresh('bk'); upd(); });
  let sig = {};
  function upd() {
    try {
      const T = target(), rec = REC(T.t), cp = cpNow(), need = rec && cp / rec < 1.2;
      [['bk23', 'area-rec9', false], ['bk23g', 'breakthrough-desc', true]].forEach(([id, an, g]) => {
        const a = $(an); if (!a) return; let el = $(id);
        if (!el) { el = document.createElement('div'); el.id = id; el.style.cssText = 'margin-top:6px'; a.insertAdjacentElement('afterend', el); }
        const show = need && (!g || T.gate), html = show ? `<button class="x5-btn am" data-x5="bk.open">⚡ 戰力提升</button> <span class="x5-sub">戰力為建議值的 ${Math.round(cp / rec * 100)}%・點開看最划算的提升</span>` : '';
        if (sig[id] !== html) { sig[id] = html; el.innerHTML = html; }
        el.style.display = show ? '' : 'none';
      });
    } catch (e) { }
  }
  setInterval(upd, 1500); setTimeout(upd, 800);
  { const s160 = document.createElement('style'); s160.textContent = '.bk-h{font-weight:900;font-size:13px;color:#8a5a12;margin:10px 0 6px}.bk-lk{display:flex;justify-content:space-between;gap:8px;font-size:12.5px;padding:6px 10px;border-radius:8px;background:rgba(201,169,107,.14)!important;border:1px solid rgba(201,169,107,.45);color:#5a3a0c!important;margin-bottom:4px}.bk-lk span{opacity:.8}.bk-row{background:#fffaf0!important;border:1px solid #e0cfa8!important;color:#3a2e1c}.bk-row .nm{color:#8a5a12!important}.bk-row .g{color:#15803d!important}'; document.head.appendChild(s160); }
  /* v168 效能:指引列與紅點只要「能不能做」,狀態沒變就沿用上次的試算(最多 20 秒) */
  let memo = null, memoSig = '', memoT = 0;
  const sigNow = () => { const inv = state.inventory || {}; let n = 0, s = 0; for (const k in inv) { n++; s += inv[k] * (k.length + 1); }
    return [state.realmIdx, state.subRealm, Math.floor(Math.log2((state.stones || 0) + 1) * 6), state.daoPoints || 0, state.body || 0, n, s, JSON.stringify(state.equipment || {}), JSON.stringify(state.enhance || {}), (state.techniques || []).map(t => t.level).join(','), JSON.stringify(state.talents || {}), Object.keys((state.skills || {}).learned || {}).length].join('|'); };
  const okMemo = () => { const g = sigNow(); if (!memo || g !== memoSig || Date.now() - memoT > 20000) { memo = cands().filter(x => x.ok); memoSig = g; memoT = Date.now(); } return memo; };
  window.BK160 = { cands: () => cands(), ok: okMemo, target, cp: cpNow, rec: () => REC(target().t), open: () => X.open('bk') };
