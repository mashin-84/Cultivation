/* ===== v7.8 戰力曲線:境界乘數、怪物校準、突破見證、戰力回饋 ===== */
(function () {
  const C = (typeof CAL9 !== 'undefined') ? CAL9 : { R: [1, 1.4, 2, 2.9, 4.3, 6.2, 9, 12.5, 17], F: [1, 1, 1, 1, 1, 1, 1, 1], REC: [0, 0, 0, 0, 0, 0, 0, 0] };
  window.REALM_R = C.R;
  /* 境界乘數:套用在「基礎+裝備+加成」的總屬性上;小層最多 +12% */
  function realmPow(i, sub) { const r = REALM_DATA[i] || REALM_DATA[0], sm = Math.max(1, r.subMax - 1); return (C.R[i] || 1) * (1 + .12 * Math.min(1, Math.max(0, sub - 1) / sm)); }
  window.realmPow = realmPow;
  XT.stats78Realm = function (s) {   // 由 calculateTotalStats 呼叫
    const m = realmPow(state.realmIdx, state.subRealm);
    s.hp = Math.floor(s.hp * m); s.atk = Math.floor(s.atk * m); s.def = Math.floor(s.def * m);
    s.combatPower = Math.floor(s.atk * (1 + s.crit * 0.005) + s.def * 1.2 + s.hp * 0.1);
  };
  /* 區域怪物校準(只做一次) */
  AREAS_DATA.forEach((a, i) => { if (a._f9) return; a._f9 = 1; const f = C.F[i] || 1; if (f === 1) return; a.monsters.forEach(m => { m.hp = Math.floor(m.hp * f); m.atk = Math.floor(m.atk * f); m.def = Math.floor(m.def * f); }); });
  /* 突破見證:大境界圓滿後須先通關該境界區域的境主 */
  function gate9() {
    const i = state.realmIdx, a = AREAS_DATA[i];
    if (!a || !REALM_DATA[i + 1] || state.subRealm < REALM_DATA[i].subMax) return null;
    if (state.areaFirstClear && state.areaFirstClear[a.id]) return null;
    return a;
  }
  const bossOf = a => a.monsters.find(m => m.isBoss) || a.monsters[a.monsters.length - 1];
  const gateMsg = a => `須先於【${a.name}】斬殺境主【${bossOf(a).name}】,證明你已立足此境,方可引動天劫。`;
  const _cab = checkAndTriggerBreakthrough;
  checkAndTriggerBreakthrough = function () {
    const info = getRealmInfo(); if (state.qi < info.maxQi) return;
    const g = gate9(); if (g) { showToast(gateMsg(g)); return; }
    const r0 = state.realmIdx, s0 = state.subRealm, p0 = calculateTotalStats().combatPower;
    _cab.apply(this, arguments);
    if (state.realmIdx === r0 && state.subRealm > s0) { const p1 = calculateTotalStats().combatPower; showToast(`突破成功!【${getRealmInfo().title}】戰力 ${formatNum(p0)} → ${formatNum(p1)}`); setTimeout(() => window.ST28 && ST28.now && ST28.now(), 700); }
  };
  const _otm = openTribulationModal;
  openTribulationModal = function () { const g = gate9(); if (g) { showToast(gateMsg(g)); return; } return _otm.apply(this, arguments); };
  /* 戰力評級 */
  function grade(p, rec) {
    if (!rec) return ['', '#94a3b8'];
    const r = p / rec;
    return r >= 2.5 ? ['橫掃', '#4ade80'] : r >= 1.2 ? ['穩妥', '#86efac'] : r >= .8 ? ['勢均力敵', '#fbbf24'] : r >= .5 ? ['吃力', '#fb923c'] : ['兇險', '#f87171'];
  }
  window.areaGrade9 = (i, p) => grade(p, C.REC[i]);
  /* UI 注入 */
  const st = document.createElement('style');
  st.textContent = '#pw9{position:fixed;inset:0;z-index:80;background:rgba(2,6,23,.86);display:flex;align-items:center;justify-content:center;padding:20px;animation:pw9i .35s ease-out}@keyframes pw9i{from{opacity:0}to{opacity:1}}#pw9 .card{width:100%;max-width:320px;text-align:center;border:1px solid #f59e0b99;border-radius:14px;background:linear-gradient(160deg,#1e1b13,#0f172a);padding:22px 16px;box-shadow:0 0 40px #f59e0b44}#pw9 .t{font-weight:900;color:#fcd34d;font-size:18px;letter-spacing:.2em}#pw9 .rr{margin:10px 0;color:#e2e8f0;font-size:14px}#pw9 .nums{font-family:ui-monospace,monospace;font-size:26px;font-weight:900;color:#fde68a;text-shadow:0 0 12px #f59e0b}#pw9 .x{display:inline-block;margin-top:6px;padding:2px 12px;border-radius:99px;background:#f59e0b22;border:1px solid #f59e0b77;color:#fbbf24;font-weight:800;font-size:15px}#pw9 .n{margin-top:12px;font-size:11px;color:#94a3b8;line-height:1.6}#area-rec9{font-size:11px;margin:2px 0 4px}';
  document.head.appendChild(st);
  function showUp(r0, r1, p0, p1) {
    const old = document.getElementById('pw9'); if (old) old.remove();
    const a = AREAS_DATA[r1], rec = a ? C.REC[r1] : 0;
    const d = document.createElement('div'); d.id = 'pw9';
    d.innerHTML = `<div class="card"><div class="t">境 界 突 破</div><div class="rr">${REALM_DATA[r0].name} → <b style="color:#fcd34d">${REALM_DATA[r1].name}</b></div><div class="nums"><span id="pw9n">${formatNum(p0)}</span></div><div style="font-size:11px;color:#94a3b8">戰力 ${formatNum(p0)} → ${formatNum(p1)}</div><div class="x">戰力 ×${(p1 / Math.max(1, p0)).toFixed(2)}</div>${a ? `<div class="n">新的歷練之地:<b style="color:#e2e8f0">${a.name}</b>${rec ? `<br>建議戰力 ${formatNum(rec)}` : ''}<br>氣血已為你回滿。</div>` : ''}<div class="n" style="color:#64748b">(點擊任意處繼續)</div></div>`;
    document.body.appendChild(d);
    const t0 = performance.now(), el = d.querySelector('#pw9n');
    (function tick(t) { const k = Math.min(1, (t - t0) / 1400), e = 1 - Math.pow(1 - k, 3); if (el.isConnected) { el.textContent = formatNum(Math.floor(p0 + (p1 - p0) * e)); if (k < 1) requestAnimationFrame(tick); } })(t0);
    const close = () => d.remove(); d.addEventListener('click', close); setTimeout(close, 9000);
    try { audio.init(); audio.playFanfare(); } catch (e) { }
  }
  let last = null;
  function recLine() {
    const host = document.getElementById('current-area-desc'); if (!host) return;
    let el = document.getElementById('area-rec9'); if (!el) { el = document.createElement('div'); el.id = 'area-rec9'; host.insertAdjacentElement('afterend', el); }
    const i = state.currentArea || 0, rec = C.REC[i], p = calculateTotalStats().combatPower;
    if (!rec) { el.textContent = ''; return; }
    const [g, col] = grade(p, rec);
    el.innerHTML = `<span style="color:#94a3b8">建議戰力 ${formatNum(rec)}</span> · <span style="color:${col};font-weight:700">你的戰力 ${formatNum(p)}(${g})</span>`;
  }
  function hook() {
    const p = calculateTotalStats().combatPower, r = state.realmIdx;
    if (!state.calib9) { state.calib9 = 1; state.hp = null; saveGame(); }
    if (last && r > last.r) { state.hp = null; showUp(last.r, r, last.p, p); }
    last = { r, p }; recLine();
  }
  XT.topBar78Hook = function () { try { hook(); } catch (e) { } };   // 由 updateTopBar 呼叫
  /* 突破卡片:被「見證」擋住時改顯示提示 */
  XT.topBar78Gate = function () {   // 由 updateTopBar 呼叫
    try {
      const g = gate9(), btn = document.getElementById('btn-trigger-breakthrough'); if (!g || !btn) return;
      const info = getRealmInfo(); if (state.qi < info.maxQi) return;
      btn.disabled = true; btn.className = 'w-full py-2.5 rounded-lg bg-slate-800 text-slate-400 font-serif-tc font-bold text-sm border border-amber-800/60 cursor-not-allowed';
      document.getElementById('breakthrough-status-badge').innerText = '須先通過試煉';
      document.getElementById('breakthrough-title').innerText = `境界見證:通關【${g.name}】`;
      document.getElementById('breakthrough-desc').innerText = `修為雖已圓滿,仍須於${g.name}斬殺境主【${bossOf(g).name}】,方可引動天劫。${C.REC[state.realmIdx] ? `(建議戰力 ${formatNum(C.REC[state.realmIdx])})` : ''}`;
    } catch (e) { }
  };
})();


