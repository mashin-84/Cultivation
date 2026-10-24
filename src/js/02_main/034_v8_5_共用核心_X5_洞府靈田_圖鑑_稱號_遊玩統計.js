/* ===== v8.5:共用核心(X5)· 洞府靈田 · 圖鑑 · 稱號 · 遊玩統計 · 省電模式 ===== */
(function () {
  const $ = id => document.getElementById(id);
  const fmt = n => formatNum(n);
  const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const X5 = window.X5 = {};
  X5.$ = $; X5.ri = ri;
  X5.pick = a => a[Math.floor(Math.random() * a.length)];
  function css(t) { const s = document.createElement('style'); s.textContent = t; document.head.appendChild(s); }
  /* ---------- 狀態保險 ---------- */
  const ST = () => { if (!state.st15 || typeof state.st15 !== 'object') state.st15 = {}; const s = state.st15; ['kills', 'boss', 'harvest', 'craft', 'forge', 'deaths', 'play', 'taps', 'wb', 'sr', 'arena', 'arenaBest', 'plant'].forEach(k => { if (typeof s[k] !== 'number' || !isFinite(s[k])) s[k] = 0; }); return s; };
  const GD = () => { if (!state.garden || typeof state.garden !== 'object') state.garden = {}; const g = state.garden; if (!Array.isArray(g.plots)) g.plots = []; if (typeof g.lv !== 'number') g.lv = 0; if (typeof g.auto !== 'boolean') g.auto = true; if (typeof g.goal !== 'string') g.goal = ''; if (typeof g.ac !== 'boolean') g.ac = false; return g; };
  const DX = () => { if (!state.dex || typeof state.dex !== 'object') state.dex = {}; if (!state.dex.m) state.dex.m = {}; if (!state.dex.i) state.dex.i = {}; if (!state.dex.c) state.dex.c = {}; return state.dex; };
  const TT = () => { if (!state.titles || typeof state.titles !== 'object') state.titles = {}; const t = state.titles; if (!t.got) t.got = {}; if (!t.seen) t.seen = {}; if (t.eq === undefined) t.eq = null; return t; };
  X5.ST = ST; X5.GD = GD; X5.DX = DX; X5.TT = TT;
  /* ---------- 效果來源登記 ---------- */
  const SRC = []; let ecache = null, ect = 0;
  X5.reg = (n, f) => SRC.push({ n, f });
  X5.dirty = () => { ecache = null; };
  const CAP = { hpP: .8, atkP: .8, defP: .8, qiP: 1.5, crit: 30, critD: 1, ls: .15, dodge: .3, dmg: 1, skAll: 1, stoneP: 1, dropP: .6 };
  X5.E = function () {
    const t = Date.now(); if (ecache && t - ect < 350) return ecache;
    const E = {}; SRC.forEach(s => { let o = null; try { o = s.f(); } catch (e) { } if (o) for (const k in o) E[k] = (E[k] || 0) + o[k]; });
    for (const k in CAP) if (E[k] > CAP[k]) E[k] = CAP[k];
    ecache = E; ect = t; return E;
  };
  X5.bust = () => { ecache = null; ect = 0; };
  X5.parts = () => SRC.map(s => { let o = null; try { o = s.f(); } catch (e) { } return { n: s.n, o: o || {} }; });
  const EN = Object.assign({}, SECT_EFF_NAME, { hpP: '氣血', atkP: '攻擊', defP: '防禦', qiP: '吐納', crit: '會心率', critD: '會心傷害', ls: '吸血', dodge: '閃避', dmg: '總傷害', skAll: '神通傷害', stoneP: '靈石收益', dropP: '掉落', acd: '神通冷卻縮短', aspd: '閃避' });
  X5.fxText = o => Object.keys(o).filter(k => o[k]).map(k => { const n = ef45(k) + (EN[k] || k), v = o[k]; return k === 'crit' ? `${n}+${Math.round(v * 10) / 10}%` : k === 'cdr' || k === 'ctrl' ? `${n}${k === 'cdr' ? '-' : '+'}${v}回合` : k === 'revive' ? `戰鬥中${n}一次` : `${n}+${Math.round(v * 1000) / 10}%`; }).join('、') || '—';
  X5.EN = EN;
  XT.stats85X5 = function (s) {   // 由 calculateTotalStats 呼叫
    const E = X5.E();
    if (E.hpP) s.hp = Math.floor(s.hp * (1 + E.hpP)); if (E.atkP) s.atk = Math.floor(s.atk * (1 + E.atkP)); if (E.defP) s.def = Math.floor(s.def * (1 + E.defP));
    if (E.crit) s.crit += E.crit; if (E.qiP) s.qiRate = Math.max(1, Math.floor(s.qiRate * (1 + E.qiP)));
    s.combatPower = Math.floor(s.atk * (1 + s.crit * 0.005) + s.def * 1.2 + s.hp * 0.1);
  };
  { const o = window.sectDmgMult; window.sectDmgMult = function (sk) { let m = o ? o.apply(this, arguments) : 1; const E = X5.E(); m *= 1 + (E.dmg || 0); if (sk) m *= 1 + (E.skAll || 0); return m; }; }
  { const o = window.sectCritMult; window.sectCritMult = function () { return (o ? o.apply(this, arguments) : 1.5) + (X5.E().critD || 0); }; }
  { const o = window.sectLS; window.sectLS = function () { return (o ? o.apply(this, arguments) : 0) + (X5.E().ls || 0); }; }
  { const o = window.sectDodge; window.sectDodge = function () { return Math.min(.5, (o ? o.apply(this, arguments) : 0) + (X5.E().dodge || 0)); }; }
  /* ---------- 階層基準:該境界區域境主的靈石掉落(用於換算獎勵) ---------- */
  X5.tier = () => Math.min(7, Math.max(0, state.realmIdx || 0));
  X5.sb = t => { t = Math.min(7, Math.max(0, t == null ? X5.tier() : t)); const a = AREAS_DATA[t]; const b = a.monsters.find(m => m.isBoss) || a.monsters[a.monsters.length - 1]; const d = (b.drops || []).find(x => x.item === 'stone'); return d ? d.count : 1000; };
  /* ---------- 器紋石(通用素材) ---------- */
  ITEMS.rn_1 = { id: 'rn_1', name: '器紋石', icon: '🪨', type: 'material', price: 0, desc: '蘊含天地紋路的靈石,可用於重洗裝備的「器紋」詞條。無法出售。' };
  /* ---------- 發獎 ---------- */
  X5.give = function (o, quiet) {
    const L = [];
    if (o.stones) { state.stones += Math.floor(o.stones); L.push(`💎 靈石 +${fmt(Math.floor(o.stones))}`); }
    if (o.tfrag && treOK()) { state.tfrag = (state.tfrag || 0) + o.tfrag; L.push(`🧩 殘片 ×${o.tfrag}`); }
    if (o.eggs && petOK()) { state.eggs = (state.eggs || 0) + o.eggs; L.push(`🥚 靈寵蛋 ×${o.eggs}`); }
    if (o.dao) { state.daoPoints = (state.daoPoints || 0) + o.dao; L.push(`☯ 道心點 ×${o.dao}`); }
    if (o.xian) { state.xian = (state.xian || 0) + o.xian; state.xianTot = (state.xianTot || 0) + o.xian; L.push(`🌸 仙緣 ×${o.xian}`); }
    if (o.items) Object.keys(o.items).forEach(k => { const n = o.items[k]; if (!n || !ITEMS[k]) return; state.inventory[k] = (state.inventory[k] || 0) + n; L.push(`${ITEMS[k].icon || ''} ${ITEMS[k].name} ×${n}`); });
    if (!quiet) { try { updateTopBar(); renderInventory(); } catch (e) { } }
    return L;
  };
  /* ---------- 底部彈窗(共用) ---------- */
  css(`
.x5-ov{position:fixed;inset:0;z-index:70;background:rgba(2,6,23,.8);display:flex;align-items:flex-end;justify-content:center}
.x5-ov.x5-h{display:none}
.x5-pn{width:100%;max-width:448px;max-height:88dvh;background:#0b1220;border:1px solid #334155;border-bottom:0;border-radius:16px 16px 0 0;display:flex;flex-direction:column;overflow:hidden;color:#e2e8f0;box-shadow:0 -8px 30px rgba(0,0,0,.6)}
.x5-hd{display:flex;justify-content:space-between;align-items:center;padding:10px 14px;border-bottom:1px solid #1e293b;font-weight:800;color:#fcd34d;font-family:'Noto Serif TC',serif;font-size:15px}
.x5-hd button{width:30px;height:30px;border-radius:15px;background:#1e293b;color:#cbd5e1;font-size:14px}
.x5-bd{overflow-y:auto;padding:10px 12px 22px;-webkit-overflow-scrolling:touch;font-size:12px;line-height:1.5}
.x5-tabs{display:flex;gap:4px;margin-bottom:8px}
.x5-tabs button{flex:1;padding:6px 2px;border-radius:8px;background:#1e293b;color:#94a3b8;font-size:12px;font-weight:700;position:relative}
.x5-tabs button.on{background:#d97706;color:#fff}
.x5-cd{background:#0f172a;border:1px solid #1e293b;border-radius:10px;padding:8px}
.x5-btn{padding:6px 10px;border-radius:8px;background:#0f766e;color:#fff;font-weight:700;font-size:12px;border:1px solid #14b8a6;cursor:pointer}
.x5-btn.am{background:#b45309;border-color:#f59e0b}.x5-btn.x5rd{background:#9f1239;border-color:#fb7185}.x5-btn.gy{background:#334155;border-color:#475569;color:#cbd5e1}
.x5-btn[disabled]{opacity:.4;cursor:default}
.x5-row{display:flex;gap:6px;align-items:center}
.x5-sub{color:#94a3b8;font-size:11px}
.x5-bar{height:6px;border-radius:3px;background:#020617;overflow:hidden;border:1px solid #1e293b}.x5-bar>i{display:block;height:100%;background:linear-gradient(90deg,#14b8a6,#fbbf24)}
.x5-dot{position:absolute;top:2px;right:6px;width:8px;height:8px;border-radius:4px;background:#ef4444;box-shadow:0 0 6px #ef4444}
.x5-card{background:linear-gradient(135deg,rgba(15,23,42,.9),rgba(2,6,23,.9));border:1px solid #1e293b;border-radius:12px;padding:10px}
.x5-card .t{font-family:'Noto Serif TC',serif;font-weight:800;font-size:12px;border-bottom:1px solid #1e293b;padding-bottom:6px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center}
body.lite15 *{animation:none!important;transition:none!important}
`);
  const SH = {};
  X5.sheet = function (id, title, render) {
    let m = $('x5s-' + id);
    if (!m) {
      m = document.createElement('div'); m.id = 'x5s-' + id; m.className = 'x5-ov x5-h';
      m.innerHTML = `<div class="x5-pn"><div class="x5-hd"><span id="x5t-${id}"></span><button data-x5="close" data-id="${id}" aria-label="關閉">✕</button></div><div class="x5-bd" id="x5b-${id}"></div></div>`;
      document.body.appendChild(m);
    }
    SH[id] = { render, title };
    return m;
  };
  X5.open = function (id) { const s = SH[id]; if (!s) return; const m = $('x5s-' + id); m.classList.remove('x5-h'); $('x5t-' + id).innerHTML = typeof s.title === 'function' ? s.title() : s.title; s.render($('x5b-' + id)); };
  X5.close = id => { const m = $('x5s-' + id); if (m) m.classList.add('x5-h'); };
  X5.isOpen = id => { const m = $('x5s-' + id); return !!m && !m.classList.contains('x5-h'); };
  X5.refresh = id => { if (!X5.isOpen(id)) return; const s = SH[id], b = $('x5b-' + id), top = b.scrollTop; $('x5t-' + id).innerHTML = typeof s.title === 'function' ? s.title() : s.title; s.render(b); b.scrollTop = top; };
  const ACT = {};
  X5.act = (name, fn) => { ACT[name] = fn; };
  document.addEventListener('click', e => {
    const t = e.target.closest && e.target.closest('[data-x5]');
    if (t) { if (t.disabled) return; const a = t.dataset.x5; if (a === 'close') { X5.close(t.dataset.id); return; } if (ACT[a]) { ACT[a](t, e); } return; }
    if (e.target && e.target.classList && e.target.classList.contains('x5-ov')) e.target.classList.add('x5-h');
  });
  /* ---------- 遊玩統計 ---------- */
  const _tap = tapCultivate; tapCultivate = function () { ST().taps++; return _tap.apply(this, arguments); };
  XT.winBattle85 = _wb => function () {
    const B = currentBattle, m = B && B.monster, normal = !!B && !B.isDemonTrib && !B.isWB && !B.isTower && !B.isSect && !B.special, s0 = state.stones;
    const r = _wb.apply(this, arguments);
    if (normal && m) {
      const s = ST(); s.kills++; if (m.isBoss) s.boss++; const d = DX(); d.m[m.id] = (d.m[m.id] || 0) + 1;
      const E = X5.E(); if (E.stoneP) { const g = state.stones - s0; if (g > 0) state.stones += Math.floor(g * E.stoneP); }
    }
    return r;
  };
  XT.wbWin85 = _ww => function () { const c = wbState().cur; const r = _ww.apply(this, arguments); if (c) { ST().wb++; DX().m['wb_' + c.name] = (DX().m['wb_' + c.name] || 0) + 1; } return r; };
  XT.towerWin85 = _tw => function () { const B = currentBattle, nm = B && B.monster ? B.monster.name.replace('守塔·', '') : null; const r = _tw.apply(this, arguments); if (nm) DX().m['twn_' + nm] = (DX().m['twn_' + nm] || 0) + 1; return r; };
  XT.loseBattle85 = _lb => function () { const B = currentBattle; if (B && !B.isSect && !B.special) ST().deaths++; return _lb.apply(this, arguments); };
  const _ca = craftAlchemy; craftAlchemy = function (idx, all) { const rec = ALCHEMY_RECIPES[idx], b = state.inventory[rec.giveId] || 0; const r = _ca.apply(this, arguments); if ((state.inventory[rec.giveId] || 0) > b) ST().craft++; return r; };
  const _cf = craftForge; craftForge = function (idx) { const rec = FORGE_RECIPES[idx], gid = rec && rec.giveItem, b = gid ? (state.inventory[gid] || 0) : 0; const r = _cf.apply(this, arguments); if (gid && (state.inventory[gid] || 0) > b) ST().forge++; return r; };
  let lastPlay = Date.now();
  function playTick() { const n = Date.now(), dt = (n - lastPlay) / 1000; lastPlay = n; if (!document.hidden && dt > 0 && dt < 5) ST().play += dt; }
  /* ---------- 洞府靈田 ---------- */
  const CROPS = X5.CROPS = [];
  [['herb_1', 3, [3, 5], 0], ['herb_2', 8, [2, 4], 0], ['herb_3', 15, [2, 3], 1], ['herb_4', 30, [1, 3], 2], ['herb_5', 60, [1, 2], 5]].forEach(x => CROPS.push({ id: x[0], mins: x[1], y: x[2], r: x[3] }));
  for (let t = 0; t < 8; t++) CROPS.push({ id: 'hb_' + t, mins: [10, 18, 25, 35, 50, 70, 100, 140][t], y: [2, 4], r: t });
  CROPS.forEach(c => { c.cost = Math.max(4, Math.ceil((ITEMS[c.id].price || 5) * 1.4)); });
  const CBY = {}; CROPS.forEach(c => CBY[c.id] = c);
  const plotN = () => Math.min(8, 3 + (state.realmIdx || 0));
  const growMs = c => c.mins * 60000 * (1 - Math.min(.3, .03 * GD().lv));
  const lvCost = () => Math.floor(300 * Math.pow(1.7, GD().lv));
  function gdInit() { const g = GD(); while (g.plots.length < 8) g.plots.push({ c: null, t0: 0, d: 0, w: 0, last: null }); }
  function plantAt(i, cid, quiet) {
    gdInit(); const g = GD(), p = g.plots[i], c = CBY[cid]; if (!p || p.c || !c || i >= plotN()) return false;
    if ((state.realmIdx || 0) < c.r) { if (!quiet) showToast(`需修至【${REALM_DATA[c.r].name}】方可種植。`); return false; }
    if (state.stones < c.cost) { if (!quiet) showToast(`靈石不足,種子需 ${fmt(c.cost)} 靈石。`); return false; }
    state.stones -= c.cost; p.c = cid; p.t0 = Date.now(); p.d = growMs(c); p.w = 0; p.last = cid; ST().plant++; return true;
  }
  const ready = p => !!p.c && Date.now() >= p.t0 + p.d;
  function harvestAt(i, quiet) {
    const g = GD(), p = g.plots[i]; if (!p || !p.c || !ready(p)) return null;
    const c = CBY[p.c], base = ri(c.y[0], c.y[1]) * (1 + .08 * g.lv) * (window.GDM43 ? GDM43(c.id) : 1); let n = Math.floor(base) + (Math.random() < base % 1 ? 1 : 0); const mut = Math.random() < .06; if (mut) n *= 2;
    state.inventory[c.id] = (state.inventory[c.id] || 0) + n; ST().harvest++;
    const res = { id: c.id, n, mut }; p.c = null; p.t0 = 0; p.d = 0; p.w = 0;
    if (g.auto && p.last) plantAt(i, p.last, true);
    return res;
  }
  function harvestAll() {
    gdInit(); const sum = {}; let any = 0, mut = 0;
    for (let i = 0; i < plotN(); i++) { const r = harvestAt(i); if (r) { any++; sum[r.id] = (sum[r.id] || 0) + r.n; if (r.mut) mut++; } }
    if (!any) { showToast('靈田尚無成熟的靈藥。'); return; }
    audio.init(); audio.playQiChime();
    showToast('🌿 收成:' + Object.keys(sum).map(k => `${ITEMS[k].name}×${sum[k]}`).join('、') + (mut ? `(${mut} 株靈氣異變,收成加倍!)` : ''));
    try { renderInventory(); } catch (e) { } autoCraft(); renderGarden(true); saveGame();
  }
  harvestGarden = harvestAll;
  function replantAll() {
    gdInit(); let n = 0, miss = 0; for (let i = 0; i < plotN(); i++) { const p = GD().plots[i]; if (!p.c && p.last) { if (plantAt(i, p.last, true)) n++; else miss++; } }
    if (n) showToast(`補種 ${n} 塊靈田。`); else showToast(miss ? '靈石不足,無法補種。' : '沒有可補種的空地(請先點空地選擇作物)。');
    renderGarden(true); saveGame();
  }
  let _gsig = '';
  function fmtT(ms) { const s = Math.max(0, Math.ceil(ms / 1000)), m = Math.floor(s / 60); return m >= 60 ? `${Math.floor(m / 60)}時${m % 60}分` : `${m}:${String(s % 60).padStart(2, '0')}`; }
  function mountGarden() {
    let card = $('garden15'); if (card) return card;
    const b = $('btn-harvest-garden'); if (!b) return null;
    const host = b.closest('.space-y-2'); if (!host) return null;
    host.id = 'garden15'; host.className = 'x5-card'; host.innerHTML = '';
    return host;
  }
  const gdFold = () => { try { return localStorage.getItem('gd19fold') !== '0'; } catch (e) { return true; } };
  function renderGarden(force) {
    const host = mountGarden(); if (!host || !host.offsetParent) return; gdInit(); const g = GD(), n = plotN(), now = Date.now();
    const sig = JSON.stringify([g.plots.slice(0, n).map(p => [p.c, p.w, p.c ? Math.max(0, Math.ceil((p.t0 + p.d - now) / 1000)) : 0]), g.lv, g.auto, n, Math.floor(state.stones / 10), gdFold()]);
    if (!force && sig === _gsig) return; _gsig = sig;
    let rdy = 0, emp = 0; let tiles = '';
    for (let i = 0; i < n; i++) {
      const p = g.plots[i];
      if (!p.c) { emp++; tiles += `<button class="gd-t em" data-x5="gd.tap" data-i="${i}"><div class="ic">＋</div><div class="nm">空地</div><div class="st">${p.last ? '點此選擇' : '點此播種'}</div></button>`; continue; }
      const c = CBY[p.c], it = ITEMS[c.id], left = p.t0 + p.d - now, done = left <= 0, pr = Math.min(100, Math.max(0, (1 - left / p.d) * 100)); if (done) rdy++;
      tiles += `<button class="gd-t ${done ? 'rdy' : ''}" data-x5="gd.tap" data-i="${i}"><div class="ic">${it.icon}</div><div class="nm">${it.name}</div><div class="st">${done ? '可收成!' : fmtT(left) + (p.w ? '' : ' 💧')}</div><div class="x5-bar"><i style="width:${pr}%"></i></div></button>`;
    }
    for (let i = n; i < 8; i++) tiles += `<div class="gd-t lk"><div class="ic">🔒</div><div class="nm">未開墾</div><div class="st">${REALM_DATA[Math.min(8, i - 2)] ? REALM_DATA[i - 2].name + '開放' : ''}</div></div>`;
    const fold = gdFold(); host.classList.toggle('gd-fold', fold);
    host.innerHTML = `<div class="t" data-x5="gd.fold" style="cursor:pointer"><span style="color:#34d399">🌱 洞府靈田 <span class="x5-sub">${n} 塊・田力 Lv.${g.lv}</span></span><span class="x5-row" style="gap:6px">${rdy ? `<b style="color:#fbbf24;font-size:11px">${rdy} 塊可收</b>${fold ? '<button class="x5-btn am" data-x5="gd.all" style="padding:3px 8px">收成</button>' : ''}` : '<span class="x5-sub">生長中</span>'}${fold && emp ? `<button class="x5-btn" data-x5="gd.sow" style="padding:3px 8px">播種</button>` : ''}<b style="color:#64748b">${fold ? '▸' : '▾'}</b></span></div>
<div class="gd-g">${tiles}</div>
<button class="x5-btn" data-x5="gd.sow" style="width:100%;margin-top:8px;padding:8px">🌾 一鍵播種・依丹藥目標${g.goal && ALCHEMY_RECIPES.find(r => r.id === g.goal) ? '(目前:' + ALCHEMY_RECIPES.find(r => r.id === g.goal).name + (g.ac ? '・自動煉丹' : '') + ')' : ''}</button>
<div class="gd-bt" style="margin-top:6px"><button class="x5-btn am" data-x5="gd.all" style="flex:1">🧺 全部收成${rdy ? `(${rdy})` : ''}</button><button class="x5-btn" data-x5="gd.re" style="flex:1">🌰 補種</button><button class="x5-btn gy" data-x5="gd.auto">${g.auto ? '✅' : '⬜'} 收成後自動補種</button><button class="x5-btn gy" data-x5="gd.up" ${g.lv >= 10 ? 'disabled' : ''}>⬆ 田力(${g.lv >= 10 ? '滿' : fmt(lvCost()) + '靈石'})</button></div>
<div class="x5-sub" style="margin-top:6px">後山那片荒廢的藥圃,被你重新翻土播種。點生長中的田可澆灌(縮時 25%);離線照常生長,回來再收。</div>`;
  }
  X5.act('gd.fold', () => { try { localStorage.setItem('gd19fold', gdFold() ? '0' : '1'); } catch (e) { } renderGarden(true); });
  css(`
.gd-fold>:not(.t){display:none}.gd-fold>.t{border-bottom:0;margin-bottom:0;padding-bottom:0}
.gd-bt{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:8px}.gd-bt .x5-btn{padding:8px 4px;white-space:nowrap;text-align:center}
.gd-g{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}
.gd-t{position:relative;background:#0b1220;border:1px solid #1e3a2f;border-radius:10px;padding:6px 2px 6px;text-align:center;color:#d1fae5;min-height:68px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px}
.gd-t .ic{font-size:22px;line-height:26px;min-height:26px}.gd-t .nm{font-size:10px;font-weight:700}.gd-t .st{font-size:10px;color:#94a3b8}.gd-t .x5-bar{width:80%;height:4px}
.gd-t.em{border-style:dashed;color:#64748b}.gd-t.lk{opacity:.4;border-style:dotted}
.gd-t.rdy{border-color:#fbbf24;box-shadow:0 0 10px rgba(251,191,36,.35);animation:gdp 1.4s ease-in-out infinite}.gd-t.rdy .st{color:#fbbf24;font-weight:800}
@keyframes gdp{50%{box-shadow:0 0 16px rgba(251,191,36,.7)}}
.gd-pk{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.gd-pk button{text-align:left;background:#0f172a;border:1px solid #334155;border-radius:10px;padding:6px 8px;color:#e2e8f0}.gd-pk button[disabled]{opacity:.4}
.gd-pk b{font-size:12px}.gd-pk span{display:block;font-size:10px;color:#94a3b8}
.cx-row{display:flex;gap:6px}.cx-row button{flex:1;position:relative;padding:8px 4px;border-radius:10px;background:#0f172a;border:1px solid #334155;color:#fcd34d;font-weight:800;font-size:12px}
.cx-g{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}
.cx-i{background:#0f172a;border:1px solid #1e293b;border-radius:10px;padding:6px 4px;text-align:center;min-height:78px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px}
.cx-i .ic{font-size:24px;min-height:28px;line-height:28px}.cx-i .nm{font-size:11px;font-weight:700;color:#e2e8f0}.cx-i .sb{font-size:9px;color:#94a3b8}.cx-i.lk{opacity:.45}.cx-i.lk .nm{color:#64748b}
.tt-r{display:flex;align-items:center;gap:8px;background:#0f172a;border:1px solid #1e293b;border-radius:10px;padding:8px;margin-bottom:6px}.tt-r.on{border-color:#fbbf24;background:#1c1917}
.tt-r .n{font-weight:800;font-size:13px}.tt-r .d{font-size:10px;color:#94a3b8}.tt-r .e{font-size:10px;color:#34d399}
#title15{font-size:10px;font-weight:800;padding:0 5px;border-radius:4px;border:1px solid;margin-right:4px;vertical-align:1px}
`);
  X5.act('gd.tap', t => {
    gdInit(); const i = +t.dataset.i, p = GD().plots[i]; if (!p) return;
    if (!p.c) { pickCrop(i); return; }
    if (ready(p)) { const r = harvestAt(i); if (r) { audio.init(); audio.playQiChime(); showToast(`🌿 收成【${ITEMS[r.id].name}】×${r.n}${r.mut ? ' ✨靈氣異變,加倍!' : ''}`); try { renderInventory(); } catch (e) { } autoCraft(); } renderGarden(true); saveGame(); return; }
    if (!p.w) { p.w = 1; p.t0 -= p.d * .25; showToast('💧 澆灌靈泉,生長加快了。'); renderGarden(true); saveGame(); }
    else showToast(`【${ITEMS[p.c].name}】還需 ${fmtT(p.t0 + p.d - Date.now())}(已澆灌)`);
  });
  /* ---------- 一鍵播種(依丹藥目標)+ 收成後自動煉丹 ---------- */
  const CBY0 = {}; CROPS.forEach(c => { CBY0[c.id] = c; });
  const PILL_TAG = { pill_1: '修為', pill_2: '吐納', pill_3: '突破', pill_4: '療傷', pill_5: '延壽', pill_6: '修為' };
  const goalList = () => ALCHEMY_RECIPES.filter(r => r.need.every(n => CBY0[n.item]));
  function autoCraft() {
    const g = GD(); if (!g.ac || !g.goal) return; const idx = ALCHEMY_RECIPES.findIndex(r => r.id === g.goal); if (idx < 0) return;
    try { if (maxAlchemyBatch(ALCHEMY_RECIPES[idx]) >= 1) craftAlchemy(idx, true); } catch (e) { }
  }
  function allocate(plan, n, usable) {
    const L = plan.filter(x => usable(x[0])); if (!L.length || n < 1) return [];
    const tot = L.reduce((a, x) => a + x[1], 0), out = L.map(x => ({ c: x[0], k: Math.floor(n * x[1] / tot), f: n * x[1] / tot - Math.floor(n * x[1] / tot) }));
    let left = n - out.reduce((a, o) => a + o.k, 0); out.slice().sort((a, b) => b.f - a.f).forEach(o => { if (left > 0) { o.k++; left--; } });
    return out.filter(o => o.k > 0);
  }
  function sow(plan, goal) {
    gdInit(); const g = GD(), n = plotN(), now0 = g.auto;
    const rdyN = g.plots.slice(0, n).filter(p => p.c && ready(p)).length;
    if (rdyN) { g.auto = false; harvestAll(); g.auto = now0; }
    const empty = []; for (let i = 0; i < n; i++) if (!g.plots[i].c) empty.push(i);
    if (!empty.length) { showToast('沒有空地(生長中的田不受影響,待成熟後再播種)。'); return; }
    const usable = c => CBY0[c] && (state.realmIdx || 0) >= CBY0[c].r;
    const al = allocate(plan, empty.length, usable); if (!al.length) { showToast('境界不足,尚無法種植此丹藥所需的靈草。'); return; }
    let k = 0, ok = 0, poor = 0; al.forEach(o => { for (let j = 0; j < o.k; j++) { if (plantAt(empty[k++], o.c, true)) ok++; else poor++; } });
    if (goal !== undefined) g.goal = goal;
    showToast(ok ? `🌱 已播種 ${ok} 塊${poor ? `(${poor} 塊靈石不足)` : ''}` : '靈石不足,無法播種。'); updateTopBar(); renderGarden(true); saveGame(); X5.refresh('sow');
  }
  X5.sheet('sow', '🌾 一鍵播種', b => {
    const g = GD(), n = plotN(), emp = g.plots.slice(0, n).filter(p => !p.c).length, rd = g.plots.slice(0, n).filter(p => p.c && ready(p)).length, R = state.realmIdx || 0;
    let h = `<div class="x5-sub" style="margin-bottom:8px">選一種想煉的丹,系統會把空地(及已成熟的田,先收成)依配方比例種好。目前空地 <b>${emp}</b>、可收成 <b>${rd}</b>;生長中的田不受影響。</div>`;
    h += goalList().map(r => {
      const lock = r.need.filter(x => CBY0[x.item].r > R).map(x => REALM_DATA[CBY0[x.item].r].name), on = g.goal === r.id;
      const cost = r.need.reduce((a, x) => a + CBY0[x.item].cost * x.count, 0);
      return `<div class="x5-cd" style="margin-bottom:6px;${on ? 'border-color:#f59e0b' : ''};${lock.length ? 'opacity:.55' : ''}"><div class="x5-row" style="justify-content:space-between"><b style="color:#fcd34d">${r.name} <span class="x5-sub">${PILL_TAG[r.id] || ''}</span>${on ? ' <span style="color:#4ade80;font-size:11px">目前目標</span>' : ''}</b><button class="x5-btn ${lock.length ? 'gy' : 'am'}" data-x5="gd.sowg" data-id="${r.id}" ${lock.length ? 'disabled' : ''}>${lock.length ? '🔒' + lock[0] : '🌱 播種'}</button></div><div class="x5-sub">${r.desc}</div><div class="x5-sub" style="margin-top:2px">靈草:${r.need.map(x => `${x.name}×${x.count}(存${state.inventory[x.item] || 0})`).join('、')}</div></div>`;
    }).join('');
    h += `<div class="x5-cd" style="margin-top:8px"><div class="x5-row" style="justify-content:space-between"><div><b>🔥 收成後自動煉丹</b><div class="x5-sub">每次收成後,若材料足夠就自動開爐煉「目前目標」的丹藥。</div></div><button class="x5-btn ${g.ac ? 'am' : 'gy'}" data-x5="gd.ac" ${g.goal ? '' : 'disabled'}>${g.ac ? '已開啟' : '關閉'}</button></div>${g.goal ? '' : '<div class="x5-sub" style="margin-top:4px">請先選一種丹藥作為目標。</div>'}</div>`;
    h += `<div class="x5-sub" style="margin:10px 0 4px"><b>或:全田種單一作物</b></div><div class="gd-pk">${CROPS.map(c => { const it = ITEMS[c.id], lock = R < c.r; return `<button data-x5="gd.sowc" data-c="${c.id}" ${lock ? 'disabled' : ''}><b>${it.name}</b><span>${lock ? REALM_DATA[c.r].name + '開放' : c.mins + '分・' + fmt(c.cost) + '靈石/塊'}</span></button>`; }).join('')}</div>`;
    b.innerHTML = h;
  });
  X5.act('gd.sow', () => X5.open('sow'));
  X5.act('gd.sowg', t => { const r = ALCHEMY_RECIPES.find(x => x.id === t.dataset.id); if (r) sow(r.need.map(x => [x.item, x.count]), r.id); });
  X5.act('gd.sowc', t => sow([[t.dataset.c, 1]]));
  X5.act('gd.ac', () => { const g = GD(); g.ac = !g.ac; saveGame(); X5.refresh('sow'); renderGarden(true); });
  X5.act('gd.all', () => harvestAll());
  X5.act('gd.re', () => replantAll());
  X5.act('gd.auto', () => { const g = GD(); g.auto = !g.auto; renderGarden(true); saveGame(); });
  X5.act('gd.up', () => { const g = GD(), c = lvCost(); if (g.lv >= 10) return; if (state.stones < c) { showToast(`靈石不足,需 ${fmt(c)}。`); return; } state.stones -= c; g.lv++; audio.playFanfare(); showToast(`靈田田力提升至 Lv.${g.lv}!`); updateTopBar(); renderGarden(true); saveGame(); });
  let pickI = 0;
  X5.sheet('crop', '選擇播種作物', b => {
    const g = GD(), p = g.plots[pickI]; if (!p) return;
    b.innerHTML = `<div class="x5-sub" style="margin-bottom:6px">第 ${pickI + 1} 塊靈田・種子費用以靈石計。田力 Lv.${g.lv}:產量 +${g.lv * 8}%。</div><div class="gd-pk">${CROPS.map(c => { const it = ITEMS[c.id], lock = (state.realmIdx || 0) < c.r, poor = state.stones < c.cost, ms = growMs(c); return `<button data-x5="gd.pick" data-c="${c.id}" ${lock || poor ? 'disabled' : ''}><b>${it.icon} ${it.name}</b><span>${lock ? '需 ' + REALM_DATA[c.r].name : fmtT(ms) + ' · 產 ' + Math.round(c.y[0] * (window.GDM43 ? GDM43(c.id) : 1)) + '~' + Math.round(c.y[1] * (window.GDM43 ? GDM43(c.id) : 1)) + (window.GDX43 && GDX43[c.id] ? ' · 靈田專產' : '')}</span><span>${lock ? '' : '種子 ' + fmt(c.cost) + ' 靈石'}</span></button>`; }).join('')}</div>`;
  });
  function pickCrop(i) { pickI = i; X5.open('crop'); }
  X5.act('gd.pick', t => { if (plantAt(pickI, t.dataset.c)) { X5.close('crop'); showToast(`已播種【${ITEMS[t.dataset.c].name}】`); updateTopBar(); renderGarden(true); saveGame(); } });
  { XT.flags85Garden = function (f) { try { gdInit(); const n = plotN(); let r = 0; for (let i = 0; i < n; i++) if (ready(GD().plots[i])) r++; f['tab-abode'] = r > 0 || cxAlert(); } catch (e) { } }; }   // 由 redFlags 呼叫
  /* ---------- 圖鑑 ---------- */
  function monList() {
    const L = [];
    AREAS_DATA.forEach((a, i) => a.monsters.forEach(m => L.push({ id: m.id, n: m.name, e: m.emoji || '👹', el: m.element, boss: !!m.isBoss, area: a.name })));
    TOWER_MON.forEach(t => L.push({ id: 'twn_' + t[0], n: t[0], e: t[1], el: t[2], boss: false, area: '九九登天塔' }));
    WB_POOL.forEach(p => L.push({ id: 'wb_' + p[0], n: p[0], e: p[1], el: null, boss: true, area: '天地異種' }));
    return L;
  }
  function itemLists() {
    const mat = [], con = [], eq = [];
    Object.keys(ITEMS).forEach(id => { const it = ITEMS[id]; if (!it || id === 'stone') return; if (it.type === 'equipment') eq.push(id); else if (it.type === 'material') mat.push(id); else con.push(id); });
    return { mat, con, eq };
  }
  function colList() {
    const L = [];
    TREASURES.forEach(t => L.push({ k: 'treasure:' + t.id, n: t.n, i: (window.col46 ? col46('t', t) : '') || t.i, got: !!(state.treasures || {})[t.id], g: '法寶' }));
    PETS.forEach(p => L.push({ k: 'pet:' + p.id, n: p.n, i: (window.col46 ? col46('p', p) : '') || p.i, got: !!(state.pets || {})[p.id], g: '靈寵' }));
    SKILLS.forEach(s => L.push({ k: 'skill:' + s.id, n: s.name, i: (window.col46 ? col46('s', s) : '') || '📘', got: !!((state.skills || {}).learned || {})[s.id], g: '神通' }));
    (window.LOOK14 ? LOOK14.OUT : []).forEach(o => L.push({ k: 'look:' + o.id, n: o.name, i: '👘', got: (state.wardrobe || []).includes(o.id), g: '外觀' }));
    return L;
  }
  X5.colHook = []; // 其他版本可註冊額外收藏
  function dexCounts() {
    const d = DX(), ML = monList(), IL = itemLists(), CL = colList().concat(...X5.colHook.map(f => { try { return f(); } catch (e) { return []; } }));
    const c = { mon: [ML.filter(m => d.m[m.id] > 0).length, ML.length], mat: [IL.mat.filter(k => d.i[k]).length, IL.mat.length], con: [IL.con.filter(k => d.i[k]).length, IL.con.length], eq: [IL.eq.filter(k => d.i[k]).length, IL.eq.length], col: [CL.filter(x => x.got).length, CL.length] };
    c.got = c.mon[0] + c.mat[0] + c.con[0] + c.eq[0] + c.col[0]; c.tot = c.mon[1] + c.mat[1] + c.con[1] + c.eq[1] + c.col[1]; return c;
  }
  let _dc = null, _dct = 0;
  function dexMemo() { const t = Date.now(); if (!_dc || t - _dct > 2500) { _dc = dexCounts(); _dct = t; } return _dc; }
  function dexPct() { const c = dexMemo(); return c.tot ? Math.floor(c.got / c.tot * 100) : 0; }
  X5.dexPct = dexPct;
  X5.reg('圖鑑', () => { const v = Math.min(.1, dexMemo().got * .0004); return v ? { hpP: v, atkP: v, defP: v } : null; });
  function dexScan() {
    const d = DX(); let n = 0;
    Object.keys(state.inventory || {}).forEach(k => { if (state.inventory[k] > 0 && !d.i[k]) { d.i[k] = 1; n++; } });
    Object.keys(state.equipment || {}).forEach(s => { const k = state.equipment[s]; if (k && !d.i[k]) { d.i[k] = 1; n++; } });
    if (n) _dc = null;
  }
  const MS = [[10, '初窺萬象'], [25, '見多識廣'], [50, '博聞強識'], [75, '學究天人'], [100, '萬象森羅']];
  function msReward(p) {
    const t = X5.tier(), sb = X5.sb(t), k = p / 100;
    return { stones: Math.floor(sb * (3 + 120 * k * k)), items: { rn_1: Math.round(5 + 55 * k) }, tfrag: Math.round(30 * k * k), eggs: p >= 50 ? Math.round(p / 25) : 0, dao: p >= 75 ? Math.round(p / 25) : 0 };
  }
  window.CX15 = { alert: () => cxAlert() };   /* v84:仙途分頁紅點用 */
  function cxAlert() { const d = DX(), t = TT(); const pc = dexPct(); if (MS.some(m => pc >= m[0] && !d.c[m[0]])) return true; return TL.some(x => t.got[x.id] && !t.seen[x.id]); }
  let dexTab = 'mon';
  const itCell = (id, got) => { const it = ITEMS[id]; return `<div class="cx-i ${got ? '' : 'lk'}"><div class="ic">${got ? it.icon : '<i class="ii ui ii-u_help" style="opacity:.5"></i>'}</div><div class="nm">${got ? it.name : '？？？'}</div><div class="sb">${got ? (it.quality ? Q_NAME[it.quality] || '' : '') : '尚未獲得'}</div></div>`; };
  X5.sheet('dex', () => `📚 萬象圖鑑 <span style="font-size:11px;color:#94a3b8;font-weight:600">完成 ${dexPct()}%・全屬性+${Math.round(Math.min(.1, dexMemo().got * .0004) * 1000) / 10}%</span>`, b => {
    const c = dexMemo(), d = DX(), pc = dexPct(), tabs = [['mon', '妖魔', c.mon], ['mat', '靈材', c.mat], ['con', '丹藥', c.con], ['eq', '裝備', c.eq], ['col', '收藏', c.col], ['ms', '獎勵']];
    let h = `<div class="x5-tabs" style="flex-wrap:wrap">${tabs.map(x => `<button class="${dexTab === x[0] ? 'on' : ''}" data-x5="dx.tab" data-k="${x[0]}">${x[1]}${x[2] ? `<br><span style="font-size:10px;font-weight:600">${x[2][0]}/${x[2][1]}</span>` : (MS.some(m => pc >= m[0] && !d.c[m[0]]) ? '<i class="x5-dot"></i>' : '')}</button>`).join('')}</div>`;
    if (dexTab === 'mon') { h += `<div class="cx-g">${monList().map(m => { const k = d.m[m.id] || 0, got = k > 0; return `<div class="cx-i ${got ? '' : 'lk'}"><div class="ic">${got ? (window.dx46 ? dx46(m) : m.e) : '❔'}</div><div class="nm">${got ? m.n : '？？？'}</div><div class="sb">${got ? `${m.area}${m.boss ? '·首領' : ''}<br>擊殺 ${k}` : '尚未遭遇'}</div></div>`; }).join('')}</div>`; }
    else if (dexTab === 'col') { h += `<div class="cx-g">${colList().concat(...X5.colHook.map(f => { try { return f(); } catch (e) { return []; } })).map(x => `<div class="cx-i ${x.got ? '' : 'lk'}"><div class="ic">${x.got ? x.i : '❔'}</div><div class="nm">${x.got ? x.n : '？？？'}</div><div class="sb">${x.g}</div></div>`).join('')}</div>`; }
    else if (dexTab === 'ms') {
      h += MS.map(m => { const r = msReward(m[0]), got = !!d.c[m[0]], can = pc >= m[0] && !got; return `<div class="x5-cd" style="margin-bottom:6px"><div class="x5-row" style="justify-content:space-between"><b style="color:#fcd34d">${m[1]}(${m[0]}%)</b><button class="x5-btn ${can ? 'am' : 'gy'}" data-x5="dx.claim" data-p="${m[0]}" ${can ? '' : 'disabled'}>${got ? '已領取' : can ? '領取' : `尚差 ${m[0] - pc}%`}</button></div><div class="x5-sub">靈石 ${fmt(r.stones)}、器紋石 ×${r.items.rn_1}${r.tfrag ? `、殘片 ×${r.tfrag}` : ''}${r.eggs ? `、靈寵蛋 ×${r.eggs}` : ''}${r.dao ? `、道心 ×${r.dao}` : ''}</div></div>`; }).join('') + `<div class="x5-sub">每收錄 1 項,全屬性 +0.04%(上限 +10%)。妖魔靠擊殺、物品靠入手、收藏靠法寶/靈寵/神通/外觀。</div>`;
    } else { const L = itemLists()[dexTab]; h += `<div class="cx-g">${L.map(k => itCell(k, !!d.i[k])).join('')}</div>`; }
    b.innerHTML = h;
  });
  X5.act('dx.tab', t => { dexTab = t.dataset.k; X5.refresh('dex'); });
  X5.act('dx.claim', t => { const p = +t.dataset.p, d = DX(); if (d.c[p] || dexPct() < p) return; d.c[p] = 1; const L = X5.give(msReward(p)); audio.playFanfare(); showToast('📚 圖鑑獎勵:' + L.slice(0, 3).join('、') + '…'); saveGame(); X5.refresh('dex'); refreshCx(); });
  /* ---------- 稱號 ---------- */
  const TL = [];
  const T = (id, n, d, p, fx, col) => { TL.push({ id, n, d, p, fx: fx || {}, col: col || '#fbbf24' }); };
  X5.addTitle = T;
  const A3 = v => ({ hpP: v, atkP: v, defP: v });
  T('t_lian', '聞道者', '踏上仙途', () => [1, 1], {}, '#94a3b8');
  T('t_ji', '築基修士', '修至築基期', () => [state.realmIdx, 1], { hpP: .02 }, '#4ade80');
  T('t_dan', '金丹真人', '修至金丹期', () => [state.realmIdx, 2], { atkP: .02 }, '#fbbf24');
  T('t_ying', '元嬰老祖', '修至元嬰期', () => [state.realmIdx, 3], A3(.02), '#fb923c');
  T('t_hua', '化神尊者', '修至化神期', () => [state.realmIdx, 4], Object.assign(A3(.02), { crit: 1 }), '#f472b6');
  T('t_fei', '羽化登仙', '飛升仙界', () => [(state.realmIdx >= 5 || state.ascended) ? 1 : 0, 1], { qiP: .05 }, '#67e8f9');
  T('t_luo', '大羅金仙', '證道大羅', () => [state.realmIdx, 8], A3(.05), '#f0abfc');
  T('t_k1', '斬妖衛道', '累計擊殺 300 隻妖魔', () => [ST().kills, 300], { atkP: .02 });
  T('t_k2', '屠魔勇士', '累計擊殺 2000 隻妖魔', () => [ST().kills, 2000], { atkP: .03, crit: 1 }, '#f87171');
  T('t_b1', '境主剋星', '累計擊殺境主 40 次', () => [ST().boss, 40], { defP: .03 });
  T('t_tw1', '登塔客', '九九登天塔最高 30 層', () => [(state.tower || {}).best || 0, 30], { hpP: .03 }, '#a5b4fc');
  T('t_tw2', '鎮塔人', '通關九九登天塔(第 100 層)', () => [(state.tower || {}).best || 0, 100], A3(.03), '#a5b4fc');
  T('t_wb', '弒神者', '擊殺天地異種 10 次', () => [ST().wb, 10], { atkP: .04 }, '#e879f9');
  T('t_g1', '靈田農夫', '靈田收成 100 次', () => [ST().harvest, 100], { stoneP: .03 }, '#86efac');
  T('t_g2', '藥王', '靈田收成 1000 次', () => [ST().harvest, 1000], { stoneP: .05, qiP: .03 }, '#86efac');
  T('t_a1', '丹道新秀', '煉丹 100 爐', () => [ST().craft, 100], { qiP: .03 }, '#fdba74');
  T('t_f1', '煉器匠人', '鍛造 50 件', () => [ST().forge, 50], { defP: .03 }, '#cbd5e1');
  T('t_r1', '輪迴客', '轉世 1 次', () => [state.reincarnationCount || 0, 1], { qiP: .03 }, '#c4b5fd');
  T('t_r3', '三世之身', '轉世 3 次', () => [state.reincarnationCount || 0, 3], A3(.03), '#c4b5fd');
  const RT = k => (((state.story27 || {}).score || {})[k] || 0);
  T('t_z', '順天應命', '劇情順天抉擇 ≥ 3', () => [RT('t'), 3], { defP: .03, hpP: .02 }, '#4ade80');
  T('t_x', '逆天而行', '劇情逆天抉擇 ≥ 3', () => [RT('r'), 3], { atkP: .04 }, '#f87171');
  T('t_y', '超脫物外', '劇情超脫抉擇 ≥ 3', () => [RT('y'), 3], { qiP: .03, hpP: .02 }, '#c4b5fd');
  T('t_sg', '出師弟子', '自宗門出師', () => [Object.keys(state.sectGrad || {}).length, 1], A3(.02), '#7dd3fc');
  T('t_d1', '圖鑑初成', '圖鑑完成度 25%', () => [dexPct(), 25], { qiP: .02 });
  T('t_d2', '博物君子', '圖鑑完成度 50%', () => [dexPct(), 50], A3(.03));
  T('t_d3', '萬象通曉', '圖鑑完成度 100%', () => [dexPct(), 100], A3(.06), '#f0abfc');
  T('t_p1', '久修', '累計修行 10 小時', () => [ST().play / 3600, 10], { qiP: .02 }, '#94a3b8');
  T('t_p2', '歲月無痕', '累計修行 100 小時', () => [ST().play / 3600, 100], { qiP: .04, hpP: .02 }, '#94a3b8');
  T('t_dead', '愈挫愈勇', '敗北 30 次', () => [ST().deaths, 30], { defP: .02 }, '#fca5a5');
  T('t_tap', '心如止水', '吐納 2000 次', () => [ST().taps, 2000], { qiP: .02 }, '#94a3b8');
  const TBY = {}; function reTBY() { TL.forEach(t => TBY[t.id] = t); } reTBY();
  X5.titles = TL; X5.reTBY = reTBY;
  X5.reg('稱號', () => { const t = TT(), d = TBY[t.eq]; return d && t.got[t.eq] ? d.fx : null; });
  function titleCheck() {
    const t = TT(); let any = null;
    TL.forEach(x => { if (t.got[x.id]) return; let p; try { p = x.p(); } catch (e) { return; } if (p[0] >= p[1]) { t.got[x.id] = 1; any = x; if (!t.eq && x.id !== 't_lian') t.eq = x.id; } });
    if (any) { showToast(`🏅 獲得稱號【${any.n}】`); saveGame(); X5.dirty(); refreshCx(); X5.refresh('title'); }
    if (!t.got.t_lian) { t.got.t_lian = 1; if (!t.eq) t.eq = 't_lian'; }
  }
  const NEWT = new Set();   /* v83:本次遊玩新獲得的稱號(標「新」) */
  X5.sheet('title', '🏅 稱號', b => {
    const t = TT(); let n = 0;
    const rows = TL.map(x => { const p = (() => { try { return x.p(); } catch (e) { return [0, 1]; } })(), got = !!t.got[x.id], on = t.eq === x.id; if (got) n++; if (got && !t.seen[x.id]) { t.seen[x.id] = 1; NEWT.add(x.id); } const pr = Math.min(1, p[0] / p[1]), nw = NEWT.has(x.id);
      return [nw, `<div class="tt-r ${on ? 'on' : ''}" style="${got ? '' : 'opacity:.7'}${nw ? ';box-shadow:0 0 0 2px #d13b2f inset' : ''}"><div style="flex:1;min-width:0"><div class="n" style="color:${got ? x.col : '#64748b'}">${nw ? '<span style="display:inline-block;font-size:10px;line-height:15px;padding:0 5px;margin-right:4px;border-radius:8px;background:#d13b2f;color:#fff;vertical-align:1px">新</span>' : ''}${got ? x.n : '？？？'} ${on ? '<span style="font-size:10px;color:#fbbf24">(佩戴中)</span>' : ''}</div><div class="d">${x.d}${got ? '' : `(${Math.floor(Math.min(p[0], p[1]) * 10) / 10 === Math.floor(Math.min(p[0], p[1])) ? Math.floor(Math.min(p[0], p[1])) : (Math.round(Math.min(p[0], p[1]) * 10) / 10)}/${p[1]})`}</div><div class="e">${X5.fxText(x.fx)}</div>${got ? '' : `<div class="x5-bar" style="margin-top:3px"><i style="width:${pr * 100}%"></i></div>`}</div>${got ? `<button class="x5-btn ${on ? 'gy' : 'am'}" data-x5="tt.eq" data-id="${x.id}">${on ? '卸下' : '佩戴'}</button>` : ''}</div>`]; }).sort((a, b) => b[0] - a[0]).map(r => r[1]).join('');
    b.innerHTML = `<div class="x5-sub" style="margin-bottom:6px">已獲得 ${n}/${TL.length}。同時只能佩戴一個稱號,效果即時生效。</div>${rows}`; saveGame(); refreshCx();
  });
  X5.act('tt.eq', t => { const s = TT(), id = t.dataset.id; s.eq = s.eq === id ? null : id; X5.dirty(); updateTopBar(); saveGame(); X5.refresh('title'); });
  /* ---------- 入口按鈕與統計面板 ---------- */
  function mountCx() {
    if (!$('cx15')) {
      const g = $('garden15'); if (!g) return;
      const d = document.createElement('div'); d.id = 'cx15'; d.className = 'cx-row';
      d.innerHTML = '<button data-x5="cx.dex">📚 萬象圖鑑</button><button data-x5="cx.title">🏅 稱號</button><button data-x5="cx.stat">📈 統計</button>';
      g.parentNode.insertBefore(d, g.nextSibling);
    }
    const root = $('ext-root');
    let s15 = $('stat15');
    if (root && !s15) {
      const d = document.createElement('details'); d.className = 'bg-slate-900 p-3 rounded-xl border border-slate-800';
      d.innerHTML = '<summary class="font-serif-tc font-bold text-amber-300 text-xs"><i class="ii ui ii-a47_stat"></i> 遊玩統計與設定</summary><div id="stat15" class="mt-2"></div>';
      root.insertBefore(d, root.firstChild); s15 = $('stat15');
    }
    const d15 = s15 && s15.closest('details'); if (d15 && !d15.__t15) { d15.__t15 = 1; d15.addEventListener('toggle', () => { if (d15.open) renderStat(); }); }
  }
  function refreshCx() {
    const d = $('cx15'); if (!d) return; const a = cxAlert(); const bs = d.querySelectorAll('button');
    [[0, DX().c && MS.some(m => dexPct() >= m[0] && !DX().c[m[0]])], [1, TL.some(x => TT().got[x.id] && !TT().seen[x.id])]].forEach(([i, f]) => { const b = bs[i]; if (!b) return; let dot = b.querySelector('.x5-dot'); if (f && !dot) b.insertAdjacentHTML('beforeend', '<i class="x5-dot"></i>'); else if (!f && dot) dot.remove(); });
  }
  X5.act('cx.dex', () => X5.open('dex')); X5.act('cx.title', () => X5.open('title'));
  X5.act('cx.stat', () => X5.open('stat'));
  function hms(s) { s = Math.floor(s); const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60; return h ? `${h} 小時 ${m} 分` : `${m} 分`; }
  function statHtml() {
    const s = ST(), c = dexMemo(), row = (n, v) => `<div style="display:flex;justify-content:space-between;padding:2px 0;border-bottom:1px dashed #1e293b"><span style="color:#94a3b8">${n}</span><b style="color:#e2e8f0">${v}</b></div>`;
    const t = TT(), tn = Object.keys(t.got).length;
    return row('累計修行時間', hms(s.play)) + row('吐納次數', fmt(s.taps)) + row('擊殺妖魔', fmt(s.kills) + `(境主 ${s.boss})`) + row('敗北次數', s.deaths) + row('天地異種 擊殺', s.wb) + row('九九登天塔最高', (state.tower || {}).best || 0) + row('靈田收成', fmt(s.harvest) + ' 次') + row('煉丹／鍛造', `${s.craft} ／ ${s.forge}`) + row('秘境完成', s.sr || 0) + row('轉世次數', state.reincarnationCount || 0) + row('圖鑑完成度', `${dexPct()}%(${c.got}/${c.tot})`) + row('稱號', `${tn}/${TL.length}`);
  }
  X5.sheet('stat', '<i class="ii ui ii-a47_stat"></i> 遊玩統計', b => { b.innerHTML = statHtml() + `<div style="margin-top:10px">${liteBtn()}</div>`; });
  const liteBtn = () => `<button class="x5-btn ${window.LITE15 ? 'am' : 'gy'}" data-x5="lite" style="width:100%"><i class="ii ui ii-a47_save"></i> 省電模式:${window.LITE15 ? '開(關閉立繪動畫與特效)' : '關'}</button><div class="x5-sub" style="margin-top:4px">開啟後洞府立繪停止擺動、停用裝飾動畫,手機較省電、較不發熱。</div>`;
  function renderStat() { const el = $('stat15'); if (!el) return; el.innerHTML = statHtml() + `<div style="margin-top:8px">${liteBtn()}</div>`; }
  X5.act('lite', () => { state.lite = !state.lite; applyLite(); renderStat(); X5.refresh('stat'); saveGame(); });
  function applyLite() { window.LITE15 = !!state.lite; document.body.classList.toggle('lite15', !!state.lite); }
  /* ---------- 標題列稱號 ---------- */
  function showTitle() {
    const nm = $('player-name-display'); if (!nm) return; let s = $('title15');
    if (!s) { s = document.createElement('span'); s.id = 'title15'; nm.parentNode.insertBefore(s, nm); }
    const t = TT(), d = TBY[t.eq]; const h = d && t.got[t.eq] && t.eq !== 't_lian' ? d.n : '';
    if (s.dataset.h !== h) { s.dataset.h = h; s.textContent = h; s.style.display = h ? '' : 'none'; if (d) { s.style.color = d.col; s.style.borderColor = d.col + '88'; } }
  }
  { const _rb = renderBreakdown; renderBreakdown = function () { _rb.apply(this, arguments); const el = $('stat-breakdown'); if (!el || !el.offsetParent) return; const rows = X5.parts().filter(p => Object.keys(p.o).some(k => p.o[k])).map(p => `<div class="flex justify-between"><span class="text-slate-400">${p.n}</span><span class="text-slate-200">${X5.fxText(p.o)}</span></div>`).join(''); if (rows) el.insertAdjacentHTML('beforeend', `<div class="border-t border-slate-800 mt-1 pt-1"><div class="text-[10px] text-amber-300">進階加成來源</div>${rows}</div>`); }; }
  /* ---------- 輪詢 ---------- */
  function tick() {
    ST(); GD(); DX(); TT(); playTick(); applyLite();
    try { mountGarden(); mountCx(); renderGarden(false); dexScan(); titleCheck(); showTitle(); refreshCx(); } catch (e) { console.warn('x15', e); }
    if (X5.isOpen('stat')) X5.refresh('stat');
  }
  setTimeout(tick, 400); setInterval(tick, 1000);
  document.addEventListener('visibilitychange', () => { lastPlay = Date.now(); });
  X5.ready = fn => setTimeout(fn, 600);
})();


