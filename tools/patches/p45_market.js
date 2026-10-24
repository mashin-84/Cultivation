/* ===== v111 萬寶坊市:隨機貨架、品質機率、定時補貨、手動刷新;清心化毒丹 ===== */
(() => {
  const $ = id => document.getElementById(id), X = window.X5;
  /* ---------- 新道具 ---------- */
  ITEMS.tox_mat = { id: 'tox_mat', name: '淨塵蓮子', icon: '🪷', type: 'material', quality: 'epic', price: 0, desc: '生於無垢靈池的蓮子,可煉【清心化毒丹】。坊市偶有販售。' };
  ITEMS.pill_dt = { id: 'pill_dt', name: '清心化毒丹', icon: '🍵', type: 'consumable', quality: 'immortal', price: 0, desc: '服下後清除當層所積丹毒,修為丹重得全效。取得:萬寶坊市、九重劫、天地異種寶箱,或以淨塵蓮子煉製。' };
  if (!ALCHEMY_RECIPES.some(r => r.id === 'pill_dt')) ALCHEMY_RECIPES.push({ id: 'pill_dt', name: '清心化毒丹', tier: 0, kind: 'qi', need: [{ item: 'tox_mat', name: '淨塵蓮子', count: 3 }, { item: 'herb_2', name: '洗髓花', count: 5 }], giveId: 'pill_dt', desc: '清除當層丹毒。' });
  const _use = useItem;
  useItem = function (key, all, quiet) {
    if (key !== 'pill_dt') return _use.apply(this, arguments);
    if (!(state.inventory.pill_dt > 0)) return 0;
    if (!(state.pillTox > 0)) { if (!quiet) showToast('體內並無丹毒,無須服用。'); return 0; }
    state.inventory.pill_dt--; if (state.inventory.pill_dt <= 0) delete state.inventory.pill_dt;
    state.pillTox = 0;
    if (!quiet) { showToast('服下清心化毒丹,一縷清涼走遍經脈,丹毒盡化!修為丹重得全效。'); audio.playQiChime(); renderInventory(); updateTopBar(); saveGame(); }
    return 1;
  };
  /* ---------- 坊市 ---------- */
  const QS = [['凡品', .55, '#6b5f4f'], ['良品', .27, '#2f855a'], ['上品', .12, '#2563eb'], ['極品', .05, '#b7791f'], ['仙品', .01, '#c026d3']];
  const SLOTS = 6, AUTO_MS = 2 * 3600e3;
  const T = () => Math.min(7, Math.max(0, state.realmIdx || 0));
  const SB = t => Math.max(60, Math.floor(X.sb(t) || 0));
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const today = () => { const d = new Date(); return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); };
  const MS = () => { let m = state.mk111; if (!m || typeof m !== 'object') m = state.mk111 = { s: [], t: 0, d: 0, n: 0 }; if (!Array.isArray(m.s)) m.s = []; if (m.d !== today()) { m.d = today(); m.n = 0; } return m; };
  const it = (id, n, mult) => ITEMS[id] ? { id, n, p: Math.max(10, Math.ceil((ITEMS[id].price || 10) * n * mult)) } : null;
  const POOL = [
    [t => it('hb_' + t, rnd(3, 6), 3), t => it(TIER_ORE[t], rnd(2, 4), 3), t => it('pill_4', 3, 3), t => it('herb_1', rnd(4, 8), 3)],
    [t => it('bp_' + t, rnd(2, 4), 3), t => it('pill_3', 1, 3), t => it('pill_2', 2, 3), t => it('herb_2', rnd(2, 4), 3), t => it('herb_3', 2, 3)],
    [t => t >= 1 ? it('yq_' + t, 1, 2.5) : it('pill_1', 5, 3), t => it(t >= 5 ? 'sp_5' : t >= 3 ? 'sp_3' : 'sp_1', 1, 2.5),
     t => (window.treOK && treOK()) ? { id: '$tfrag', n: 10, p: Math.floor(SB(t) * .5) } : null, t => ({ id: 'rn_1', n: 3, p: Math.floor(SB(t) * .4) })],
    [t => { const u = state.pillUse || {}, ks = ['pp_hp', 'pp_atk', 'pp_def'].filter(k => (u[{ pp_hp: 'hp', pp_atk: 'atk', pp_def: 'def' }[k]] || 0) + (state.inventory[k] || 0) < 20); return ks.length ? { id: ks[rnd(0, ks.length - 1)], n: 1, p: SB(t) * 2 } : null; },
     t => ({ id: 'tox_mat', n: 1, p: SB(t) * 3 })],
    [t => ({ id: 'pill_dt', n: 1, p: SB(t) * 8 }), t => (window.petOK && petOK()) ? { id: '$egg', n: 1, p: SB(t) * 5 } : null]
  ];
  function rollOne(t) {
    const r = Math.random(); let q = 0, acc = 0; for (let i = 0; i < QS.length; i++) { acc += QS[i][1]; if (r < acc) { q = i; break; } q = i; }
    for (let qq = q; qq >= 0; qq--) { const P = POOL[qq].slice(); while (P.length) { const f = P.splice(rnd(0, P.length - 1), 1)[0], o = f(t); if (o) return Object.assign(o, { q: qq }); } }
    return Object.assign(it('hb_' + t, 3, 3), { q: 0 });
  }
  function reroll() { const m = MS(), t = T(); m.s = Array.from({ length: SLOTS }, () => rollOne(t)); m.tr = t; }
  function tick() { const m = MS(); const now = Date.now(); if (!m.s.length || now - (m.t || 0) >= AUTO_MS || m.tr !== T()) { reroll(); m.t = now; return true; } return false; }
  const refreshCost = () => Math.floor(SB(T()) * .5 * Math.pow(1.3, MS().n));
  const nameOf = o => o.id === '$tfrag' ? '法寶殘片' : o.id === '$egg' ? '靈寵蛋' : (ITEMS[o.id] || {}).name || o.id;
  const icoOf = o => o.id === '$tfrag' ? '🧩' : o.id === '$egg' ? '🥚' : (ITEMS[o.id] || {}).icon || '📦';
  const left = () => { const ms = Math.max(0, AUTO_MS - (Date.now() - (MS().t || 0))), h = Math.floor(ms / 3600e3), mi = Math.floor(ms / 60e3) % 60, s = Math.floor(ms / 1e3) % 60; return `${h}:${String(mi).padStart(2, '0')}:${String(s).padStart(2, '0')}`; };
  const st = document.createElement('style');
  st.textContent = `.mk111-top{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:11px;color:#6b5f4f;margin:2px 0 6px}
.mk111-r{display:flex;align-items:center;gap:8px;padding:8px;border-radius:10px;background:rgba(255,252,244,.92);border:1px solid #d8c9a8;margin-bottom:6px}
.mk111-r .ic{width:34px;height:34px;flex:none;display:flex;align-items:center;justify-content:center;font-size:22px;border-radius:8px;background:#f3ead6;border:2px solid var(--q)}
.mk111-r .ic .ii,.mk111-r .ic .a45i{width:26px!important;height:26px!important}
.mk111-r>div:nth-child(2){flex:1}
.mk111-r .nm{font-weight:800;font-size:13px;color:#2a241c}.mk111-r .qq{font-size:10px;font-weight:800;color:var(--q);margin-right:4px}
.mk111-r .pr{font-size:11px;color:#8a6a22}.mk111-r.sold{opacity:.45}
.mk111-r button{margin-left:auto;flex:none;padding:6px 12px;border-radius:9px;font-weight:800;font-size:12px;background:linear-gradient(135deg,#fbf1d8,#efd9a8);border:1px solid #b07d1a;color:#6e3a0c}
.mk111-r button[disabled]{filter:grayscale(1);opacity:.6}
#mk111-ref{padding:5px 10px;border-radius:9px;font-weight:800;font-size:11px;background:linear-gradient(135deg,#fbf1d8,#efd9a8);border:1px solid #b07d1a;color:#6e3a0c;white-space:nowrap}
#cr52 [data-c52="mk"]{position:relative}#cr52 [data-c52="mk"]>i.rd{display:block!important;position:absolute;top:2px;right:6px;width:10px;height:10px;border-radius:50%;background:#d13b2f;box-shadow:0 0 0 2px #f6efe0}`;
  document.head.appendChild(st);
  renderMarket = function () {
    const c = $('market-items-list'); if (!c) return;
    tick(); const m = MS(), rc = refreshCost();
    let h = `<div class="mk111-top"><span>下次免費補貨 <b id="mk111-cd">${left()}</b>・今日已手動刷新 ${m.n} 次</span><button id="mk111-ref" ${state.stones >= rc ? '' : 'disabled'}>刷新 💎${formatNum(rc)}</button></div>`;
    m.s.forEach((o, i) => {
      const q = QS[o.q] || QS[0], can = !o.sold && state.stones >= o.p;
      h += `<div class="mk111-r ${o.sold ? 'sold' : ''}" style="--q:${q[2]}"><div class="ic">${icoOf(o)}</div><div style="min-width:0"><div class="nm"><span class="qq">${q[0]}</span>${nameOf(o)}${o.n > 1 ? ' ×' + o.n : ''}</div><div class="pr">💎 ${formatNum(o.p)} 靈石</div></div><button data-mk111="${i}" ${can ? '' : 'disabled'}>${o.sold ? '售罄' : '購買'}</button></div>`;
    });
    c.innerHTML = h;
  };
  buyMarketItem = function (i) {
    const m = MS(), o = m.s[i]; if (!o || o.sold) return;
    if (state.stones < o.p) { showToast('靈石不足!'); return; }
    state.stones -= o.p; o.sold = true;
    if (o.id === '$tfrag') state.tfrag = (state.tfrag || 0) + o.n; else if (o.id === '$egg') state.eggs = (state.eggs || 0) + o.n; else state.inventory[o.id] = (state.inventory[o.id] || 0) + o.n;
    audio.playQiChime(); showToast(`購得【${nameOf(o)}${o.n > 1 ? ' ×' + o.n : ''}】!`);
    renderMarket(); try { renderInventory(); } catch (e) { } updateTopBar(); saveGame();
  };
  function manual() {
    const c = refreshCost(); if (state.stones < c) { showToast(`靈石不足,刷新需 ${formatNum(c)}。`); return; }
    state.stones -= c; MS().n++; reroll(); audio.playQiChime(); showToast('貨架已換上一批新貨!'); renderMarket(); updateTopBar(); saveGame();
  }
  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('#market-items-list [data-mk111],#mk111-ref'); if (!b || b.disabled) return;
    e.stopPropagation(); if (b.id === 'mk111-ref') manual(); else buyMarketItem(+b.dataset.mk111);
  }, true);
  /* 舊的「整理貨架」按鈕藏起來(刷新改在清單上方) */
  { const ob = $('btn-refresh-market'); if (ob) ob.style.display = 'none'; }
  const hot = () => { try { const m = MS(); return m.s.some(o => !o.sold && o.q >= 3 && state.stones >= o.p); } catch (e) { return false; } };
  window.MK111 = { alert: hot, reroll, tick };
  setInterval(() => {
    try {
      const vis = $('market-items-list') && $('market-items-list').offsetParent;
      if (tick() && vis) renderMarket();
      else if (vis) { const cd = $('mk111-cd'); if (cd) cd.textContent = left(); }
      const sb = document.querySelector('#cr52 [data-c52="mk"]'); if (sb) { let d = sb.querySelector(':scope>i.rd'); const w = hot(); if (w && !d) { d = document.createElement('i'); d.className = 'rd'; sb.appendChild(d); } else if (!w && d) d.remove(); }
    } catch (e) { }
  }, 1000);
  if (window.CR52 && CR52.alert) { const a0 = CR52.alert; CR52.alert = () => a0() || hot(); }
})();
