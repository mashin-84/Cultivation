/* ===== v8.0 宗門系統 + 正邪傾向 ===== */
(function () {
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const G5 = (typeof GEN5 !== 'undefined') ? GEN5 : {};
  const gi = (k, c) => G5[k] ? `<i class="s5 s5-${k}${c ? ' ' + c : ''}"></i>` : '';
  const tg = (al, extra) => `<span class="tag ${al}">${gi('sb_' + al, 'sm')}${SECT_AL[al]}${extra || ''}</span>`;
  const rk = r => gi(r >= 4 ? 'sb_grad' : 'sb_r' + r, 'sm');
  const emb = (s, c) => gi('sc_' + s.id.slice(2), c);
  { let c = '.s5{display:inline-block;background:center/contain no-repeat;vertical-align:middle;width:18px;height:18px;flex:none}.s5.sm{width:16px;height:16px;margin-right:3px;vertical-align:-3px}.s5.md{width:36px;height:36px;margin-right:6px}.s5.bl{width:56px;height:56px;display:block;margin:0 auto 2px}.s5.xl{width:86px;height:86px;display:block;margin:0 auto 4px;filter:drop-shadow(0 2px 6px #000)}'; Object.keys(G5).forEach(k => { c += `.s5-${k}{background-image:url(${G5[k]})}`; }); const e = document.createElement('style'); e.textContent = c; document.head.appendChild(e); }
  const fmt = n => (typeof formatNum === 'function' ? formatNum(n) : String(n));
  /* ---------- 狀態 ---------- */
  function init() { if (typeof state.align !== 'number' || !isFinite(state.align)) state.align = 0; if (!state.sectGrad || typeof state.sectGrad !== 'object') state.sectGrad = {}; if (!state.sectSk || typeof state.sectSk !== 'object') state.sectSk = {}; }
  const cur = () => (state.sect && SECT_BY[state.sect.id]) || null;
  const rankIdx = () => { const t = (state.sect && state.sect.total) || 0; let r = 0; for (let i = 0; i < 4; i++) if (t >= SECT_RANK_NEED[i]) r = i; return r; };
  const canGrad = () => !!state.sect && (state.sect.total || 0) >= SECT_RANK_NEED[4];
  const equipCap = () => 1 + Math.floor((state.realmIdx || 0) / 2);
  function alLabel(a) { return a >= 60 ? '正道魁首' : a >= 25 ? '正道' : a > -25 ? '中立' : a > -60 ? '邪道' : '魔道巨擘'; }
  const alCol = a => a >= 25 ? '#4ade80' : a > -25 ? '#fbbf24' : '#f87171';
  function addAlign(d) { init(); const b = state.align; state.align = Math.max(-100, Math.min(100, Math.round(state.align + d))); return `☯ 正邪傾向 ${d >= 0 ? '+' : ''}${d}(現為 ${alLabel(state.align)}・${state.align})`; }
  /* ---------- 出師寶物 ---------- */
  SECTS.forEach(s => {
    const t = Math.min(7, s.r), src = ITEMS[`eg_${s.tr.slot}_${t}`]; if (!src) return;
    const k = n => Math.floor(n * 1.6);
    ITEMS['st_' + s.id] = { id: 'st_' + s.id, name: s.tr.n, icon: (typeof ICO !== 'undefined' ? ICO.tag(`eg_${s.tr.slot}_${t}`, 'ii-x') : src.icon), type: 'equipment', slot: s.tr.slot, quality: 'immortal', tier: t, atk: k(src.atk), def: k(src.def), hp: k(src.hp), price: src.price * 3, desc: `【${s.n}・出師寶物】${s.tr.d}` };
  });
  /* ---------- 效果彙總 ---------- */
  function effects() {
    const E = {}, add = o => { for (const k in o) { if (k === 'all') { ['hpP', 'atkP', 'defP'].forEach(x => E[x] = (E[x] || 0) + o[k]); } else E[k] = (E[k] || 0) + o[k]; } };
    const s = cur(); if (s) add(s.P);
    Object.keys(state.sectSk || {}).forEach(id => { if (state.sectSk[id] && state.sectSk[id].eq && SECT_BY[id]) add(SECT_BY[id].sk.E); });
    return E;
  }
  function effText(o) { return Object.keys(o).map(k => { const n = ef45(k) + (SECT_EFF_NAME[k] || k), v = o[k]; return k === 'crit' ? `${n}+${v}%` : k === 'cdr' || k === 'ctrl' ? `${n}${k === 'cdr' ? '-' : '+'}${v}回合` : k === 'revive' ? `戰鬥中${n}一次` : `${n}+${Math.round(v * 100)}%`; }).join('、'); }
  window.sectEffects = effects;
  window.sectDmgMult = sk => { const E = effects(); let m = 1; if (!sk) m *= 1 + (E.atkN || 0); else { m *= 1 + (E.skAll || 0); if (sk.el && E['el_' + sk.el]) m *= 1 + E['el_' + sk.el]; } if (E.rage && currentBattle) { const r = 1 - currentBattle.playerHp / Math.max(1, currentBattle.playerMaxHp); m *= 1 + E.rage * Math.max(0, r); } return m; };
  window.sectCritMult = () => 1.5 + (effects().critD || 0);
  window.sectLS = () => effects().ls || 0;
  window.sectDodge = () => Math.min(.5, effects().dodge || 0);
  /* ---------- 屬性 ---------- */
  XT.stats80Sect = function (s) {   // 由 calculateTotalStats 呼叫
    const E = effects();
    if (E.bodyP && state.body) { const b = state.body * E.bodyP; s.hp = Math.floor(s.hp * (1 + b * .03)); s.def = Math.floor(s.def * (1 + b * .02)); s.atk = Math.floor(s.atk * (1 + b * .005)); }
    s.hp = Math.floor(s.hp * (1 + (E.hpP || 0))); s.atk = Math.floor(s.atk * (1 + (E.atkP || 0))); s.def = Math.floor(s.def * (1 + (E.defP || 0)));
    s.crit += (E.crit || 0); s.qiRate = Math.max(1, Math.floor(s.qiRate * (1 + (E.qiP || 0))));
    s.combatPower = Math.floor(s.atk * (1 + s.crit * 0.005) + s.def * 1.2 + s.hp * 0.1);
  };
  /* ---------- 戰鬥/系統掛勾 ---------- */
  const _skCalc = skCalc;
  skCalc = function (sk, lv) {
    const o = _skCalc.apply(this, arguments), E = effects();
    if (E.cdr && o.cd != null) o.cd = Math.max(1, o.cd - E.cdr);
    if (E.ctrl && o.stun) o.stun += E.ctrl;
    if (E.healP && o.pct && (sk.type === 'heal' || sk.type === 'shield')) o.pct = Math.min(.9, o.pct * (1 + E.healP));
    return o;
  };
  const _ps = petStrike;
  petStrike = function () { const d = _ps.apply(this, arguments); return d ? Math.floor(d * (1 + (effects().petP || 0))) : d; };
  const _sge = skGainExp;
  skGainExp = function (id) { _sge(id); const p = effects().skExp; if (p && Math.random() < p) _sge(id); };
  XT.loseBattle80 = _lb => function () {
    const B = currentBattle;
    if (B && effects().revive && !B.revived && !B.isSect) {
      B.revived = true; B.playerHp = Math.floor(B.playerMaxHp * .5); showToast('輪迴之力流轉,你死而復生!');
      logAdventure('<span class="text-fuchsia-300 font-bold">☯ 輪迴之力發動,道友死而復生!</span>');
      try { updateBattleUI(); } catch (e) { } if (state.autoBattle || state.autoExplore) scheduleAutoBattleTurn(); return;
    }
    if (B && B.isSect) {
      state.hp = Math.max(1, Math.floor(calculateTotalStats().hp * .5)); logAdventure('<span class="text-rose-400 font-bold">💀 出師試煉失利,守山長老收劍而立:「再去精進吧。」</span>');
      showBattleResultModal(false, B.monster.name, 0, []); endBattle(); showToast('出師試煉失敗,休整後可再次挑戰。'); updateTopBar(); saveGame(); return;
    }
    return _lb.apply(this, arguments);
  };
  XT.winBattle80 = _wb => function () {
    const B = currentBattle;
    if (B && B.isSect) { const s = SECT_BY[B.isSect]; logAdventure(`<span class="text-amber-300 font-bold">🏆 通過【${s.n}】出師試煉!</span>`); endBattle(); graduate(s); updateTopBar(); return; }
    const normal = B && !B.isDemonTrib && !B.isWB && !B.isTower, boss = !!(B && B.monster && B.monster.isBoss);
    const s0 = state.stones, f0 = state.tfrag || 0, inv0 = Object.assign({}, state.inventory), E = effects();
    _wb.apply(this, arguments);
    if (!normal) return;
    const bern = p => Math.floor(p) + (Math.random() < p - Math.floor(p) ? 1 : 0);
    if (E.stoneP) { const d = state.stones - s0; if (d > 0) state.stones += Math.floor(d * E.stoneP); }
    if (E.tfragP) { const d = (state.tfrag || 0) - f0; if (d > 0) state.tfrag += bern(d * E.tfragP); }
    if (E.matP) Object.keys(state.inventory).forEach(k => { const d = state.inventory[k] - (inv0[k] || 0); if (d > 0 && ITEMS[k] && ITEMS[k].type === 'material') state.inventory[k] += bern(d * E.matP); });
    prog('kill', 1); if (boss) prog('boss', 1);
    renderSectCard();
  };
  const _ca = craftAlchemy;
  craftAlchemy = function (idx, all) {
    const rec = ALCHEMY_RECIPES[idx], b = state.inventory[rec.giveId] || 0, E = effects();
    _ca.apply(this, arguments);
    const d = (state.inventory[rec.giveId] || 0) - b;
    if (d > 0) { if (E.alchP) { let x = 0; for (let i = 0; i < d; i++) if (Math.random() < E.alchP) x++; if (x) { state.inventory[rec.giveId] += x; showToast(`宗門秘法加持,額外煉出【${rec.name}】×${x}!`); renderInventory(); } } prog('alch', d); }
  };
  const _sa = stepAdventure;
  stepAdventure = function () { const e0 = state.exploreStep, a0 = state.currentArea; _sa.apply(this, arguments); if (state.currentArea === a0 && (state.exploreStep !== e0)) prog('explore', 1); };
  /* ---------- 任務 ---------- */
  function mkTask(kind) {
    const r = state.realmIdx || 0, f = 1 + rankIdx() * .15, t = Math.min(7, r);
    if (kind === 'kill') return { k: 'kill', need: 8 + Math.min(12, r * 2), got: 0, rw: Math.round(30 * f) };
    if (kind === 'explore') return { k: 'explore', need: 12 + Math.min(8, r), got: 0, rw: Math.round(25 * f) };
    if (kind === 'boss') return { k: 'boss', need: 1, got: 0, rw: Math.round(60 * f) };
    if (kind === 'alch') return { k: 'alch', need: 3, got: 0, rw: Math.round(35 * f) };
    return { k: 'mat', item: pick([`hb_${t}`, `bp_${t}`]), need: 3 + Math.floor(Math.random() * 3), got: 0, rw: Math.round(40 * f) };
  }
  function prog(kind, n) { if (!state.sect) return; (state.sect.tasks || []).forEach(t => { if (t.k === kind) t.got += n; }); }
  const TK = { kill: '討伐妖魔', explore: '外出歷練', boss: '斬殺境主', alch: '煉製丹藥', mat: '繳交靈材' };
  function addContrib(n) {
    const s = state.sect; if (!s) return; const r0 = rankIdx(); s.total += n; s.bal += n;
    if (rankIdx() > r0) showToast(`恭喜晉升為【${SECT_RANKS[rankIdx()]}】!`);
    if (canGrad() && !s._gradNote) { s._gradNote = 1; showToast('貢獻已足,可於宗門殿堂接受「出師試煉」!'); }
  }
  function claim(i) {
    const s = state.sect; if (!s) return; const t = s.tasks[i]; if (!t) return;
    if (t.k === 'mat') { if ((state.inventory[t.item] || 0) < t.need) { showToast('材料不足。'); return; } state.inventory[t.item] -= t.need; if (state.inventory[t.item] <= 0) delete state.inventory[t.item]; try { renderInventory(); } catch (e) { } }
    else if (t.got < t.need) return;
    const over = t.k === 'mat' ? 0 : Math.max(0, t.got - t.need); addContrib(t.rw); showToast(`宗門貢獻 +${t.rw}${over ? `(溢出進度 ${over} 帶入下一任務)` : ''}`); const nt = mkTask(cur().tasks[i] || 'kill'); if (nt.k !== 'mat') nt.got = over; s.tasks[i] = nt; saveGame(); render();
  }
  /* ---------- 加入/叛離/學功法/出師 ---------- */
  function joinCheck(s) {
    init(); if (state.sect) return '已在宗門中,須先出師或辭別';
    if (state.sectGrad[s.id]) return '你已自此門出師';
    if ((state.realmIdx || 0) < s.r) return `需達【${REALM_DATA[s.r].name}】`;
    return '';
  }
  function join(id) { const s = SECT_BY[id], bad = joinCheck(s); if (bad) { showToast(bad); return; } state.sect = { id, total: 0, bal: 0, tasks: s.tasks.map(mkTask), bought: {}, joined: Date.now() }; showToast(`你持青雲令牌,掛單【${s.n}】門下,以外門弟子身分遊學!`);
    if (!state.sectGift) { state.sectGift = true; const gf = [0, 100, 200, 350, 440, 440, 440, 440][Math.min(7, state.realmIdx || 0)]; if (gf) { state.sect.total = gf; state.sect.bal = gf; } let gl = []; try { if (window.X5) gl = X5.give({ stones: X5.sb(X5.tier()) * 4, items: { pill_1: 3 } }, true); } catch (e) { } showToast(`🎁 入門見面禮:${gf ? '宗門貢獻 +' + gf + '、' : ''}${gl.join('、')}`); } saveGame(); view = 'gate'; render(); updateTopBar(); }
  function leave() { const s = cur(); if (!s) return; if (!window.confirm(`確定辭別【${s.n}】嗎?將失去職位與未領的貢獻(已學功法保留)。`)) return; state.sect = null; view = 'gate'; showToast(`你辭別了【${s.n}】,攜令牌歸返青雲。`); saveGame(); render(); updateTopBar(); }
  function learn(id) {
    const s = SECT_BY[id]; if (!state.sect || state.sect.id !== id) return; if (rankIdx() < 1) { showToast('須晉升為內門弟子方可習得獨門功法。'); return; }
    if (s.sk.root && ((state.root || {})[s.sk.root[0]] || 0) < s.sk.root[1]) { showToast(`靈根不足:需${SECT_EL_CN[s.sk.root[0]]}靈根 ≥ ${s.sk.root[1]}`); return; }
    if (state.sect.bal < 250) { showToast('貢獻不足(需 250)。'); return; }
    state.sect.bal -= 250; state.sectSk[id] = { eq: equippedCount() < equipCap() }; showToast(`習得${s.sk.n}!`); saveGame(); render(); updateTopBar();
  }
  const equippedCount = () => Object.keys(state.sectSk).filter(k => state.sectSk[k] && state.sectSk[k].eq).length;
  function toggleEq(id) { const e = state.sectSk[id]; if (!e) return; if (!e.eq && equippedCount() >= equipCap()) { showToast(`功法欄已滿(上限 ${equipCap()})`); return; } e.eq = !e.eq; saveGame(); render(); updateTopBar(); }
  function trial() {
    const s = cur(); if (!s || !canGrad()) return; if (currentBattle && !(window.HO43 && HO43.yieldBattle())) { showToast('戰鬥中無法接受試煉。'); return; }
    const base = AREAS_DATA[Math.min(7, s.r)], b = base.monsters.find(m => m.isBoss) || base.monsters[base.monsters.length - 1];
    const mon = Object.assign({}, b, { name: `${s.n}守山長老`, emoji: '🧙', hp: Math.floor(b.hp * 1.4), atk: Math.floor(b.atk * 1.15), def: Math.floor(b.def * 1.15), isBoss: true, drops: [], skillName: '鎮山掌' });
    const area = { id: 'sect9', name: `${s.n}・出師試煉`, maxSteps: 10, realmReq: 0, monsters: [mon] };
    close(); try { stopAutoExplore(''); } catch (e) { }
    startMonsterBattle(area, true); if (currentBattle) currentBattle.isSect = s.id;
  }
  function graduate(s) {
    init(); state.sectGrad[s.id] = 1; if (!state.sectSk[s.id]) state.sectSk[s.id] = { eq: equippedCount() < equipCap() };
    const tid = 'st_' + s.id; state.inventory[tid] = (state.inventory[tid] || 0) + 1; state.sect = null; saveGame();
    try { renderInventory(); } catch (e) { }
    playCinematic({ icon: '🏯', title: `${s.n}・學成出師`, lines: [`你通過了守山長老的最後一關,山門之下,同門齊聚相送。`, `掌門親授:「${s.sk.n}」,為本門不傳之秘。`, `又贈【${s.tr.n}】——${s.tr.d}`, `從今往後,山高水長。你的道,在更遠的地方。`], rewards: [`獨門功法 ${s.sk.n}`, `出師寶物 ${s.tr.n}`], continueText: '辭別山門' });
    render();
  }
  /* ---------- UI:獨立分頁「宗門」 ---------- */
  let view = 'gate', bld = null; // gate=山門總覽, 或建築 id
  const st = document.createElement('style');
  st.textContent = '#tab-sect{color:#e2e8f0;font-size:14px}#tab-sect .box{border:1px solid #334155;border-radius:10px;background:#0b1220;padding:8px 10px;margin-bottom:8px}#tab-sect .nm{font-weight:900;font-size:14px;color:#fde68a}#tab-sect .tag{display:inline-block;padding:0 6px;border-radius:99px;font-size:10px;font-weight:800;margin-left:6px}#tab-sect .tag.z{background:#14532d;color:#86efac}#tab-sect .tag.n{background:#713f12;color:#fde68a}#tab-sect .tag.x{background:#7f1d1d;color:#fca5a5}#tab-sect .dim{color:#94a3b8;font-size:12.5px;line-height:1.55}#tab-sect .btn{padding:4px 12px;border-radius:8px;border:0;background:#d97706;color:#1c1917;font-weight:800;font-size:14px;white-space:nowrap;min-height:38px}#tab-sect .btn[disabled]{background:#334155;color:#64748b}#tab-sect .btn.g{background:#334155;color:#e2e8f0}#tab-sect .bar{height:7px;border-radius:99px;background:#1e293b;overflow:hidden;margin:4px 0}#tab-sect .bar i{display:block;height:100%;background:linear-gradient(90deg,#f59e0b,#fde047)}#tab-sect .row{display:flex;justify-content:space-between;align-items:center;gap:8px}#tab-sect .al{position:relative;height:8px;border-radius:99px;background:linear-gradient(90deg,#b91c1c,#a16207 50%,#15803d);margin:6px 0}#tab-sect .al i{position:absolute;top:-3px;width:4px;height:14px;background:#fff;border-radius:2px;box-shadow:0 0 6px #fff}#tab-sect .subs{display:flex;gap:6px;margin:6px 0}#tab-sect .subs button{flex:1;padding:6px 0;border-radius:8px;border:1px solid #475569;background:#0f172a;color:#94a3b8;font-weight:700}#tab-sect .subs button.on{background:#78350f;color:#fde68a;border-color:#f59e0b}'
    + '#tab-sect .gate{position:relative;border-radius:14px;overflow:hidden;padding:16px 14px 12px;margin-bottom:10px;border:1px solid #92400e99;background:radial-gradient(ellipse at 50% 0,#5b3a1466,transparent 70%),linear-gradient(180deg,#1c1410,#0b1220)}#tab-sect .gate .big{font-size:22px;font-weight:900;letter-spacing:.3em;color:#fcd34d;text-align:center;text-shadow:0 2px 10px #000}#tab-sect .gate .sub{text-align:center;color:#94a3b8;font-size:11px;margin-top:2px}#tab-sect .grid2{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px}#tab-sect .bd9{position:relative;border:1px solid #92400e88;border-radius:12px;padding:12px 8px 8px;text-align:center;background:linear-gradient(160deg,#1f1710,#0f172a);cursor:pointer}#tab-sect .bd9 b{display:block;font-size:30px;line-height:1;color:#fcd34d;font-family:serif;text-shadow:0 0 10px #f59e0b66}#tab-sect .bd9 span{display:block;font-weight:800;margin-top:4px;color:#fde68a}#tab-sect .bd9 em{display:block;font-style:normal;font-size:10px;color:#94a3b8;margin-top:2px}#tab-sect .bd9.lk{opacity:.5}#tab-sect .bd9 u{position:absolute;top:5px;right:7px;min-width:16px;height:16px;border-radius:99px;background:#dc2626;color:#fff;font-size:10px;font-weight:800;text-decoration:none;line-height:16px}#tab-sect .back{margin-bottom:8px}.nvi-sect{width:30px;height:30px;border-radius:26%;display:flex;align-items:center;justify-content:center;background:#1c1410;border:1px solid #92400e;color:#fcd34d;font-weight:900;font-size:15px;opacity:.8;font-family:serif}.nav-tab-btn.text-amber-400 .nvi-sect{opacity:1;box-shadow:0 0 0 1.5px #f59e0b,0 0 8px rgba(245,158,11,.55)}';
  document.head.appendChild(st);
  const panel = () => document.getElementById('tab-sect');
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function alBar() { return ''; }
  function alBar_old() { const a = state.align || 0; return `<div class="box"><div class="row"><b style="color:${alCol(a)}">${gi(a >= 25 ? 'sb_z' : a > -25 ? 'sb_n' : 'sb_x', 'sm')}${alLabel(a)}・${a}</b><span class="dim">正邪傾向(由「道途抉擇」累積)</span></div><div class="al"><i style="left:calc(${(a + 100) / 2}% - 2px)"></i></div><div class="row dim"><span>魔道</span><span>中立</span><span>正道</span></div></div>`; }
  const BLD = [
    ['hall', '山門大殿', '殿', r => '宗門概覽・在門被動'],
    ['task', '任務堂', '令', r => { const n = claimable(); return n ? `${n} 項可領` : '接取宗門任務'; }],
    ['lib', '藏經閣', '經', r => r < 1 ? '晉升內門後開放' : '習得・裝備功法', 1],
    ['shop', '藏寶閣', '寶', r => '貢獻兌換寶物'],
    ['arena', '演武場', '武', r => canGrad() ? '可接受出師試煉' : `累計貢獻達 ${SECT_RANK_NEED[4]} 開放`, 99]
  ];
  function claimable() { if (!state.sect) return 0; return state.sect.tasks.filter(t => t.k === 'mat' ? (state.inventory[t.item] || 0) >= t.need : t.got >= t.need).length; }
  function head(s) {
    const r = rankIdx(), tot = state.sect.total, nx = SECT_RANK_NEED[Math.min(4, r + 1)], pr = canGrad() ? 100 : Math.min(100, Math.floor(tot / nx * 100));
    return `<div class="gate">${emb(s, 'xl')}<div class="big">${s.n}</div><div class="sub">${tg(s.al)} ・ ${rk(canGrad() ? 4 : r)}${canGrad() ? '可出師' : SECT_RANKS[r]}</div><div class="bar" style="margin-top:10px"><i style="width:${pr}%"></i></div><div class="row dim"><span>累計貢獻 ${fmt(tot)} / ${canGrad() ? '已圓滿' : fmt(nx)}</span><span>${gi('sb_ct', 'sm')}可用貢獻 <b style="color:#fde68a">${fmt(state.sect.bal)}</b></span></div></div>`;
  }
  const backBtn = '<button class="btn g back" data-s9="back">← 返回山門</button>';
  function vGate(s) {
    const r = rankIdx();
    return head(s) + '<div class="grid2">' + BLD.map(([id, n, g, sub, need]) => { const lk = (need === 1 && r < 1) || (need === 99 && !canGrad()); const bd = id === 'task' ? claimable() : 0; return `<div class="bd9${lk ? ' lk' : ''}" data-s9="go" data-id="${id}">${bd ? `<u>${bd}</u>` : ''}${gi('sb_' + id, 'bl') || `<b>${g}</b>`}<span>${n}</span><em>${sub(r)}</em></div>`; }).join('') + '</div>';
  }
  function vHall(s) {
    return backBtn + `<div class="box"><div class="nm">${emb(s, 'sm')}${s.n}・山門大殿</div><div class="dim" style="margin-top:4px">${esc(s.d)}</div></div><div class="box"><div class="nm">在門被動</div><div class="dim">${effText(s.P)}</div></div><div class="box"><div class="nm">${gi('sb_grad', 'sm')}出師可得</div><div class="dim">獨門功法:${s.sk.n}<br>出師寶物:【${s.tr.n}】${esc(s.tr.d)}</div></div><div class="box"><div class="nm">職位階梯</div><div class="dim">${SECT_RANKS.map((n, i) => `${rk(i)}${i === rankIdx() ? '▶ ' : ''}${n}(累計 ${SECT_RANK_NEED[i]})`).join('<br>')}</div></div><button class="btn g" data-s9="leave" style="width:100%">${gi('sb_leave', 'sm')}辭別宗門</button>`;
  }
  function vTask(s) {
    let h = backBtn + '<div class="dim" style="margin:0 2px 6px">完成任務領取貢獻;進度會持續累積,超出的部分帶入下一個任務。</div>';
    state.sect.tasks.forEach((t, i) => {
      const ok = t.k === 'mat' ? (state.inventory[t.item] || 0) >= t.need : t.got >= t.need;
      const lab = t.k === 'mat' ? `${TK.mat}:${ITEMS[t.item] ? ITEMS[t.item].name : t.item} ×${t.need}(持有 ${state.inventory[t.item] || 0})` : `${TK[t.k]} ${t.got}/${t.need}${t.got > t.need ? ' ✓' : ''}`;
      h += `<div class="box row"><div><div style="font-weight:700">${lab}</div><div class="dim">${gi('sb_ct', 'sm')}貢獻 +${t.rw}</div></div><button class="btn" data-s9="claim" data-i="${i}" ${ok ? '' : 'disabled'}>${t.k === 'mat' ? '繳交' : '領取'}</button></div>`;
    });
    return h;
  }
  function vLib(s) {
    const r = rankIdx(), L = state.sectSk[s.id], rootBad = s.sk.root && ((state.root || {})[s.sk.root[0]] || 0) < s.sk.root[1];
    let h = backBtn + `<div class="box"><div class="row"><div class="nm">${sk45(s.id)}${s.sk.n}</div>${L ? '<span class="dim">已習得</span>' : `<button class="btn" data-s9="learn" data-id="${s.id}" ${r >= 1 && !rootBad && state.sect.bal >= 250 ? '' : 'disabled'}>習得(250貢獻)</button>`}</div><div class="dim">${esc(s.sk.d)}<br>效果:${effText(s.sk.E)}${s.sk.root ? `<br>靈根要求:${SECT_EL_CN[s.sk.root[0]]} ≥ ${s.sk.root[1]}${rootBad ? '(未達)' : ''}` : ''}</div></div>`;
    return h + skList();
  }
  function skList() {
    const ids = Object.keys(state.sectSk || {}).filter(k => SECT_BY[k]);
    let h = `<div class="nm" style="margin:4px 2px">已學宗門功法</div><div class="box dim">裝備欄 ${equippedCount()}/${equipCap()}(隨境界增加)<br>合計加成:${effText(effects()) || '無'}</div>`;
    ids.forEach(id => { const s = SECT_BY[id], e = state.sectSk[id]; h += `<div class="box"><div class="row"><div class="nm">${sk45(id)}${s.sk.n}${tg(s.al,"・"+s.n)}</div><button class="btn ${e.eq ? '' : 'g'}" data-s9="eq" data-id="${id}">${e.eq ? '已裝備' : '裝備'}</button></div><div class="dim">${esc(s.sk.d)}<br>${effText(s.sk.E)}</div></div>`; });
    if (!ids.length) h += '<div class="dim" style="padding:4px 2px">尚未習得任何宗門功法。</div>';
    return h;
  }
  /* 藏寶閣:貢獻兌換 */
  function catalog(s) {
    const t = Math.min(7, s.r), nm = id => (ITEMS[id] ? ITEMS[id].name : id), un = k => window.UNLOCK9 && UNLOCK9.on(k);
    const C = [
      { id: 'hb', n: `${nm('hb_' + t)} ×5`, give: ['hb_' + t, 5], cost: 60, lim: 4, rk: 0 },
      { id: 'bp', n: `${nm('bp_' + t)} ×5`, give: ['bp_' + t, 5], cost: 60, lim: 4, rk: 0 },
      { id: 'heal', n: `${nm('pill_4')} ×5`, give: ['pill_4', 5], cost: 40, lim: 3, rk: 0 },
      { id: 'xp', n: t ? `${nm('yq_' + t)} ×2` : `${nm('pill_1')} ×5`, give: t ? ['yq_' + t, 2] : ['pill_1', 5], cost: 120, lim: 3, rk: 1 },
      { id: 'trib', n: `${nm('pill_3')} ×1`, give: ['pill_3', 1], cost: 200, lim: 2, rk: 1 },
      { id: 'hp', n: `${nm('pp_hp')} ×1`, give: ['pp_hp', 1], cost: 300, lim: 1, rk: 2 },
      { id: 'atk', n: `${nm('pp_atk')} ×1`, give: ['pp_atk', 1], cost: 300, lim: 1, rk: 2 },
      { id: 'def', n: `${nm('pp_def')} ×1`, give: ['pp_def', 1], cost: 300, lim: 1, rk: 2 }
    ];
    if (un('treasure')) C.push({ id: 'tf', n: '法寶殘片 ×10', tfrag: 10, cost: 150, lim: 3, rk: 2 });
    if (un('pet')) C.push({ id: 'egg', n: '靈寵蛋 ×1', egg: 1, cost: 400, lim: 1, rk: 2 });
    ['weapon', 'armor', 'boots', 'ring'].forEach(sl => { const id = `eg_${sl}_${t}`; if (ITEMS[id]) C.push({ id: 'eq_' + sl, n: ITEMS[id].name, give: [id, 1], cost: 600, lim: 1, rk: 3 }); });
    return C;
  }
  function vShop(s) {
    const r = rankIdx(), B = state.sect.bought || (state.sect.bought = {});
    let h = backBtn + `<div class="box row"><span class="dim">${gi('sb_ct', 'sm')}可用貢獻</span><b style="color:#fde68a">${fmt(state.sect.bal)}</b></div><div class="dim" style="margin:0 2px 6px">好物隨職位開放;每件限購,辭別宗門後重置。</div>`;
    catalog(s).forEach(c => {
      const n = B[c.id] || 0, left = c.lim - n, lock = r < c.rk;
      h += `<div class="box row"><div><div style="font-weight:700">${c.n}</div><div class="dim">${c.cost} 貢獻・限購 ${left}/${c.lim}${lock ? `・需【${SECT_RANKS[c.rk]}】` : ''}</div></div><button class="btn" data-s9="buy" data-id="${c.id}" ${lock || left <= 0 || state.sect.bal < c.cost ? 'disabled' : ''}>兌換</button></div>`;
    });
    return h;
  }
  function buy(id) {
    const s = cur(); if (!s) return; const c = catalog(s).find(x => x.id === id); if (!c) return;
    const B = state.sect.bought || (state.sect.bought = {});
    if (rankIdx() < c.rk) { showToast(`需晉升為【${SECT_RANKS[c.rk]}】`); return; } if ((B[id] || 0) >= c.lim) { showToast('已達限購。'); return; } if (state.sect.bal < c.cost) { showToast('貢獻不足。'); return; }
    if ((c.egg && !petOK()) || (c.tfrag && !treOK())) { showToast('此物現下用不上,待修為到了再來兌換。'); return; }
    state.sect.bal -= c.cost; B[id] = (B[id] || 0) + 1;
    if (c.give) addItem(c.give[0], c.give[1]); if (c.tfrag) state.tfrag = (state.tfrag || 0) + c.tfrag; if (c.egg) state.eggs = (state.eggs || 0) + c.egg;
    try { renderInventory(); } catch (e) { } showToast(`兌換成功:${c.n}`); saveGame(); render(); updateTopBar();
  }
  function vArena(s) {
    return backBtn + `<div class="box"><div class="nm">${gi('sb_arena', 'sm')}演武場・出師試煉</div><div class="dim" style="margin-top:4px">守山長老鎮守演武場,以${REALM_DATA[Math.min(7, s.r)].name}境主為本、再添三分殺意。勝則出師,敗則無損,可再挑戰。<br>出師可得:${s.sk.n}・【${s.tr.n}】</div><button class="btn" data-s9="trial" style="width:100%;margin-top:8px" ${canGrad() ? '' : 'disabled'}>接受試煉${canGrad() ? '' : `(需累計 ${SECT_RANK_NEED[4]} 貢獻)`}</button></div>`;
  }
  function vList() {
    let h = '', maxR = (state.realmIdx || 0) + 1;
    for (let r = 0; r <= 8; r++) {
      const L = SECTS.filter(s => s.r === r); if (!L.length) continue;
      if (r > maxR) { h += `<div class="dim" style="margin:6px 2px">▸ ${REALM_DATA[r].name} 的宗門:達到前一境界後顯現</div>`; continue; }
      const opn = openR[r] !== undefined ? openR[r] : r === Math.min(maxR - 1, state.realmIdx || 0);
      h += `<button class="fb13" data-s9="rg" data-id="${r}" style="margin:6px 0"><span>${REALM_DATA[r].name}</span><span class="sm">${L.length} 家${L.some(s => !joinCheck(s)) ? '・可拜入' : ''}</span><span class="cv">${opn ? '▾' : '▸'}</span></button>`;
      if (!opn) continue;
      L.forEach(s => {
        const bad = joinCheck(s), grad = state.sectGrad[s.id];
        h += `<div class="box"><div class="row"><div class="nm" style="display:flex;align-items:center">${emb(s, 'md')}${s.n}${tg(s.al)}</div>${grad ? '<span class="dim">已出師</span>' : `<button class="btn" data-s9="join" data-id="${s.id}" ${bad ? 'disabled' : ''}>拜入</button>`}</div><div class="dim">${esc(s.d)}<br>在門被動:${effText(s.P)}<br>獨門功法:${s.sk.n}(${effText(s.sk.E)})${s.sk.root ? `・需${SECT_EL_CN[s.sk.root[0]]}靈根≥${s.sk.root[1]}` : ''}<br>出師寶物:${s.tr.n}${bad && !grad ? `<br><span style="color:#fca5a5">× ${bad}</span>` : ''}</div></div>`;
      });
    }
    return h;
  }
  let outTab = 'list'; const openR = {};
  function render() {
    const el = panel(); if (!el) return; init();
    const un = window.UNLOCK9 && UNLOCK9.on('sect');
    if (!un) { el.innerHTML = '<div class="box"><div class="nm">宗門</div><div class="dim">練氣第3層開放。</div></div>'; return; }
    const s = cur();
    if (!s) { el.innerHTML = alBar() + `<div class="subs">${[['list', '宗門名錄'], ['sk', '已學功法']].map(([k, n]) => `<button data-s9="otab" data-id="${k}" class="${outTab === k ? 'on' : ''}">${n}</button>`).join('')}</div>` + (outTab === 'list' ? '<div class="box dim">你仍是青雲弟子,下山遊學時可掛單一家宗門(同時只能一處)。修到長老、通過出師試煉,方可帶走獨門功法與寶物,再入下一家。</div>' + vList() : skList()); return; }
    const V = { gate: vGate, hall: vHall, task: vTask, lib: vLib, shop: vShop, arena: vArena };
    el.innerHTML = (view === 'gate' ? alBar() : '') + (V[view] || vGate)(s);
  }
  function open() { if (!(window.UNLOCK9 && UNLOCK9.on('sect'))) { showToast('【宗門】尚未開啟:練氣第3層可開'); return; } document.querySelector('.nav-tab-btn[data-tab="tab-sect"]')?.click(); }
  function close() { }
  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('#tab-sect [data-s9]'); if (!b || b.disabled) return; const a = b.dataset.s9, id = b.dataset.id;
    if (a === 'otab') { outTab = id; render(); } else if (a === 'rg') { const r = +id, cur_ = openR[r] !== undefined ? openR[r] : r === Math.min((state.realmIdx || 0) + 1 - 1, state.realmIdx || 0); openR[r] = !cur_; render(); } else if (a === 'go') { view = id; const s = cur(), r = rankIdx(); if ((id === 'lib' && r < 1)) { showToast('晉升內門弟子後,藏經閣方對你開放。'); view = 'gate'; } else if (id === 'arena' && !canGrad()) { showToast(`累計貢獻達 ${SECT_RANK_NEED[4]} 方可進入演武場。`); view = 'gate'; } render(); }
    else if (a === 'back') { view = 'gate'; render(); } else if (a === 'join') { join(id); } else if (a === 'leave') leave(); else if (a === 'claim') claim(+b.dataset.i); else if (a === 'learn') learn(id); else if (a === 'eq') toggleEq(id); else if (a === 'buy') buy(id); else if (a === 'trial') trial();
  });
  /* 導覽列:新增「宗門」分頁 */
  function renderSectCard() { const el = panel(); if (el && !el.classList.contains('hidden')) render(); }
  document.querySelectorAll('.nav-tab-btn').forEach(b => b.addEventListener('click', () => { if (b.getAttribute('data-tab') === 'tab-sect') { setTimeout(render, 0); } }));
  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('.nav-tab-btn[data-tab="tab-sect"]'); if (!b) return;
    if (!(window.UNLOCK9 && UNLOCK9.on('sect'))) { e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); showToast('【宗門】尚未開啟:練氣第3層可開'); }
  }, true);
  { const sp = document.querySelector('.nav-tab-btn[data-tab="tab-sect"] .nvi-sect'); if (sp && G5.sb_gate) { const im = document.createElement('img'); im.src = G5.sb_gate; im.className = 'nvi rd-s'; im.alt = ''; im.draggable = false; sp.replaceWith(im); } }
  function navLock() { const b = document.querySelector('.nav-tab-btn[data-tab="tab-sect"]'); if (b) b.classList.toggle('lock9', !(window.UNLOCK9 && UNLOCK9.on('sect'))); }
  /* 開放與檢查 */
  if (window.UNLOCK9) {
    UNLOCK9.U.push({ k: 'sect', name: '宗門', hint: '練氣第3層', ok: () => (state.realmIdx || 0) >= 1 || ((state.realmIdx || 0) === 0 && (state.subRealm || 1) >= 3), icon: '🏯', title: '山門招徒・拜入道門',
      lines: ['你修至練氣三層,一縷靈氣已能在體內自行流轉。', '山下鐘聲遠遠傳來——各路宗門開山收徒,正邪各有門庭。', '底部【宗門】分頁已開啟。入宗後進入山門,於任務堂接任務、藏經閣習功法、藏寶閣兌寶物,晉升長老後出師,再去下一家。'], rew: [], rewT: ['解鎖【宗門】分頁'] });
    if (!STORIES.find(x => x.k === 'xsect')) STORIES.push({ k: 'xsect', icon: '🏯', title: '山門招徒・拜入道門', lines: ['你修至練氣三層,一縷靈氣已能在體內自行流轉。', '山下鐘聲遠遠傳來——各路宗門開山收徒,正邪各有門庭。', '底部【宗門】分頁已開啟。'], skip: false });
  }
  XT.topBar80Sect = function () {   // 由 updateTopBar 呼叫
    try {
      init(); const s = cur();
      if (s && false) { state.sect = null; showToast(`你的所作所為與【${s.n}】背道而馳,被逐出師門!`); logAdventure(`<span class="text-rose-400 font-bold">📜 因行徑與門規相悖,你被【${s.n}】逐出師門。</span>`); saveGame(); }
      navLock(); renderSectCard();
    } catch (e) { }
  };
  /* ---------- 道途抉擇(正邪傾向事件) ---------- */
  const M = () => eventRewardMult();
  const gt = () => `hb_${Math.min(7, state.realmIdx || 0)}`;
  function EV(icon, title, desc, A, B) {
    const wrap = f => () => { const r = f(); const g = (r.gains || []).slice(); return { ok: r.ok === undefined ? true : r.ok, icon, title: r.title || title, story: r.story, gains: g }; };
    CHOICE_EVENTS.push({ isAl: true, icon, title, desc, choiceA: A[0], choiceB: B[0], actionA: wrap(A[1]), actionB: wrap(B[1]) });
  }
  const st$ = n => { const v = Math.floor(n * M()); state.stones += v; return `💎 靈石 +${fmt(v)}`; };
  const it$ = (id, n) => { addItem(id, n); return `${ITEMS[id] ? ITEMS[id].name : id} ×${n}`; };
  const qi$ = p => { const v = Math.floor(getRealmInfo().maxQi * p); state.qi += v; return `修為 +${fmt(v)}`; };
  EV('🏮', '荒徑求救', '山道旁,一名受傷散修倒地呻吟,懷中隱有靈光閃動。', ['出手相救', () => ({ al: 8, title: '助人為樂', story: '你為他渡入一縷靈氣,散修感激涕零,臨別贈你謝禮。', gains: [st$(120)] })], ['趁火打劫', () => ({ al: -10, title: '趁火打劫', story: '你冷眼上前,將他懷中之物盡數取走。', gains: [st$(320)] })]);
  EV('🏮', '商隊遇襲', '遠處一支商隊被妖獸圍攻,護衛節節敗退。', ['拔劍相助', () => ({ al: 6, title: '仗義出手', story: '你斬退妖獸,商隊首領千恩萬謝。', gains: [st$(150), it$('pill_4', 1)] })], ['袖手旁觀', () => ({ al: 0, title: '冷眼旁觀', story: '你轉身離去,身後慘叫聲漸漸遠了。', gains: [] })]);
  EV('🏮', '血色祭壇', '林間一座染血的祭壇,壇上符文散發陰寒氣息,似可汲取血氣修煉。', ['毀去祭壇', () => ({ al: 8, title: '破邪除穢', story: '你一劍劈碎祭壇,封印的怨魂得以超脫,向你合掌致謝。', gains: [it$(gt(), 2)] })], ['汲取血氣', () => ({ al: -10, title: '以血養道', story: '血氣湧入經脈,修為暴漲,但識海中似有低語縈繞。', gains: [qi$(.08)] })]);
  EV('🏮', '童子失藥', '一個採藥童子哭著說,靈草被妖獸搶走了,而妖獸正啃食著它。', ['奪回歸還', () => ({ al: 6, title: '還藥於童', story: '你擊退妖獸,把靈草還給童子,他送你一束。', gains: [it$(gt(), 1), st$(60)] })], ['據為己有', () => ({ al: -6, title: '奪藥自用', story: '你嚇跑了童子,將靈草收入囊中。', gains: [it$(gt(), 3)] })]);
  EV('🏮', '垂死魔修', '一名魔道修士重傷倒地,哀求你賜他一枚丹藥續命。', ['賜他丹藥', () => { const c = Math.floor(60 * M()); state.stones = Math.max(0, state.stones - c); return { al: 4, title: '慈悲為懷', story: '你給了他丹藥。他望了你一眼,默默離去。', gains: [`💎 靈石 -${fmt(c)}`] }; }], ['送他上路', () => ({ al: -8, title: '斬盡殺絕', story: '你補上一劍,取走他的儲物袋。', gains: [st$(280), it$(gt(), 1)] })]);
  EV('🏮', '逃犯求庇', '一名自稱被宗門冤枉的修士跪地求你庇護,身後追兵已近。', ['出手庇護', () => ({ al: -4, title: '包庇逃犯', story: '你放走了他,追兵怒視著你。', gains: [st$(150)] })], ['交給宗門', () => ({ al: 6, title: '大義滅親', story: '你把他交了出去,宗門贈你賞金。', gains: [st$(220)] })]);
  EV('🏮', '無主洞府', '山腹中一座久無人跡的洞府,石桌上留著一份遺書。', ['取走全部', () => ({ al: 0, title: '無主之物', story: '你將洞府搜刮一空。', gains: [st$(380)] })], ['留一半給後人', () => ({ al: 5, title: '義取不貪', story: '你只取一半,餘下留在原地,並在石桌前拜了拜。', gains: [st$(190), qi$(.03)] })]);
  EV('🏮', '黑市禁藥', '黑市攤主偷偷向你兜售一種能迷人心智的禁藥,聲稱獲利極豐。', ['拒絕並舉報', () => ({ al: 5, title: '嫉惡如仇', story: '你拒絕交易並向巡查修士舉報,獲得賞銀。', gains: [st$(120)] })], ['低價收購轉賣', () => ({ al: -6, title: '發不義之財', story: '你轉手賣給了更有錢的買家。', gains: [st$(360)] })]);
  EV('🏮', '凡間旱情', '途經凡人村落,赤地千里,村民跪地求雨。', ['施法降雨', () => { const c = Math.floor(80 * M()); state.stones = Math.max(0, state.stones - c); return { al: 8, title: '施雨濟世', story: '你耗費靈力降下甘霖,村民奉上自家糧食,更有一股功德之氣湧入識海。', gains: [`💎 靈石 -${fmt(c)}`, qi$(.06)] }; }], ['視若無睹', () => ({ al: 0, title: '紅塵不顧', story: '你搖搖頭,繼續趕路。', gains: [] })]);
  EV('🏮', '山道劫匪', '一夥劫匪正在劫殺行人,領頭的一眼認出你是修士,眼神閃爍。', ['出劍斬匪', () => ({ al: 5, title: '除暴安良', story: '你出劍如電,劫匪四散而逃,行人拜謝。', gains: [st$(140)] })], ['與其分贓', () => ({ al: -8, title: '同流合污', story: '劫匪大喜,將贓物分了你一大份。', gains: [st$(420)] })]);
  EV('🏮', '妖窟遺孤', '妖獸窩中,一隻幼小的靈獸蜷縮在母獸屍體旁,望著你瑟瑟發抖。', ['帶回撫養', () => { if (!petOK()) { state.stones += 200; return { al: 8, title: '仁心結緣', story: '幼獸舔了舔你的手,蹭著你的衣角,才依依不捨地跑回林中。臨走前,牠銜來一枚閃亮的靈石。', gains: ['靈石 ×200'] }; } state.eggs = (state.eggs || 0) + 1; return { al: 8, title: '仁心結緣', story: '幼獸舔了舔你的手,留下一枚溫熱的卵。', gains: ['靈寵蛋 ×1'] }; }], ['棄之不顧', () => ({ al: -5, title: '無情', story: '你轉身離開,身後傳來微弱的嗚咽。', gains: [] })]);
  EV('🏮', '仇敵稚子', '一名魔修遺下的稚子誤闖你面前,尚不知父輩的恩怨。', ['放他一馬', () => ({ al: 3, title: '冤冤相報何時了', story: '你揮手讓他離開,心中似乎輕了一些。', gains: [qi$(.04)] })], ['斬草除根', () => ({ al: -8, title: '斬草除根', story: '你一劍了結,心頭卻多了一層陰影。', gains: [qi$(.06)] })]);
  EV('🏮', '魔道邀約', '一名黑袍人攔住你:「天資如此,何不入我魔道?只需一滴心頭血。」', ['拒絕', () => ({ al: 5, title: '道心不移', story: '你冷然拒絕,黑袍人嘿然消失。', gains: [qi$(.04)] })], ['接受魔功', () => { state.permQiRate = (state.permQiRate || 0) + 2; return { al: -12, title: '受傳魔功', story: '黑袍人傳你一篇魔功,體內真元運行速度驟升。', gains: ['永久吐納 +2/秒'] }; }]);
  EV('🏮', '兩派爭鋒', '兩個宗門的弟子在前方鬥法,一方自稱正道,一方是魔修,雙方都向你求援。', ['助正道', () => ({ al: 6, title: '匡扶正道', story: '你出手相助,正道弟子分你戰利品。', gains: [st$(180)] })], ['助魔道', () => ({ al: -6, title: '與魔同行', story: '魔修大笑,分你一份搜刮來的財物。', gains: [st$(260)] })]);
  /* ---- 擴充:奇遇(風險/穩健)與更多道途抉擇 ---- */
  const T$ = () => Math.min(7, state.realmIdx || 0), bpk = () => `bp_${T$()}`, yqk = () => (T$() ? `yq_${T$()}` : 'pill_1');
  const lose$ = p => { const v = Math.floor(state.stones * p); state.stones -= v; return `💎 靈石 -${fmt(v)}`; };
  const gam = (p, W, L) => Math.random() < p ? Object.assign({ ok: true }, W()) : Object.assign({ ok: false }, L());
  const un$ = k => window.UNLOCK9 && UNLOCK9.on(k);
  function EC(icon, title, desc, A, B) {
    const wrap = f => () => { const r = f(); return { ok: r.ok === undefined ? true : r.ok, icon, title: r.title || title, story: r.story, gains: r.gains || [] }; };
    CHOICE_EVENTS.push({ icon, title, desc, choiceA: A[0], choiceB: B[0], actionA: wrap(A[1]), actionB: wrap(B[1]) });
  }
  EC('🏮', '靈泉秘境', '山谷深處湧出一汪靈泉,水霧間靈氣濃得化不開,但泉底似有暗流。', ['潛入泉底修煉 (60%成功)', () => gam(.6, () => ({ title: '泉底悟道', story: '你沉入泉底,靈氣如潮水灌入經脈。', gains: [qi$(.15)] }), () => ({ title: '暗流捲走', story: '暗流驟起,你狼狽爬上岸,身上財物被沖走了些。', gains: [lose$(.05)] }))], ['岸邊取水 (穩健)', () => ({ title: '取水而歸', story: '你小心灌了幾瓶靈泉水,在坊市換了些錢。', gains: [st$(180)] })]);
  EC('🏮', '殘缺丹方', '路邊攤販手中有一張殘缺丹方,紙面隱現靈光,真偽難辨。', ['買下研習 (50%成功)', () => gam(.5, () => ({ title: '丹道有成', story: '你悟出半張丹方的玄機,配出一爐好丹。', gains: [it$(yqk(), 1), it$(`hb_${T$()}`, 2)] }), () => ({ title: '買到贗品', story: '丹方是假的,錢白花了。', gains: [lose$(.06)] }))], ['轉手賣給坊市 (穩健)', () => ({ title: '倒賣丹方', story: '你轉手賣給了識貨的行家。', gains: [st$(160)] })]);
  EC('🏮', '雷劫餘波', '遠處天劫剛過,殘餘雷電仍在山間遊走,雷中隱有大道氣息。', ['引雷入體感悟 (45%成功)', () => gam(.45, () => ({ title: '雷中悟道', story: '雷光洗鍊經脈,修為大漲。', gains: [qi$(.2)] }), () => ({ title: '雷火灼身', story: '你被餘雷轟飛,衣袍盡焦,需靜養調息。', gains: [lose$(.04)] }))], ['拾取焦木雷石 (穩健)', () => ({ title: '拾得雷石', story: '你撿到幾塊被雷劫淬過的靈石。', gains: [st$(200)] })]);
  EC('🏮', '古戰場遺跡', '荒原上殘劍斷戟林立,陰風呼號,似有百戰英魂徘徊。', ['深入搜刮 (55%成功)', () => gam(.55, () => ({ title: '拾得遺寶', story: '你在白骨間拾得不少上古兵器碎片與靈材。', gains: [it$(bpk(), 3), st$(260)] }), () => ({ title: '陰魂纏身', story: '英魂不願被驚擾,你倉皇退走。', gains: [lose$(.05)] }))], ['敬酒祭拜英魂 (穩健)', () => ({ title: '祭英魂', story: '你灑酒三杯,心神寧靜,似有所悟。', gains: [qi$(.05)] })]);
  EC('🏮', '隱世棋局', '林中兩位老者對弈,棋盤上黑白交錯,隱含天地至理。老者邀你落一子。', ['落子破局 (50%成功)', () => gam(.5, () => ({ title: '一子定乾坤', story: '你落子如神,老者撫掌大笑,傳你一段心法。', gains: [qi$(.18)] }), () => ({ title: '一子錯', story: '你落錯一子,老者搖頭,你羞愧離去。', gains: [] }))], ['觀棋不語 (穩健)', () => ({ title: '觀棋有得', story: '你靜觀良久,略有感悟。', gains: [qi$(.06)] })]);
  EC('🏮', '妖獸巢穴', '山崖上一處妖獸巢穴,母獸似乎外出覓食,巢中有寶光。', ['趁機入巢 (45%成功)', () => gam(.45, () => { const g = [it$(bpk(), 4), st$(180)]; if (un$('pet')) { state.eggs = (state.eggs || 0) + 1; g.push('靈寵蛋 ×1'); } return { title: '巢中得寶', story: '你手腳麻利,趁母獸未歸取走寶物。', gains: g }; }, () => ({ title: '母獸歸巢', story: '母獸提早歸來,你狼狽逃竄。', gains: [lose$(.05)] }))], ['採集巢外靈草 (穩健)', () => ({ title: '巢外採藥', story: '你只採了巢外靈草便悄然退去。', gains: [it$(`hb_${T$()}`, 2)] })]);
  EC('🏮', '星隕之地', '昨夜流星墜地,砸出一個冒煙大坑,坑底隱隱有星輝。', ['下坑取隕鐵 (55%成功)', () => gam(.55, () => { const g = [it$(bpk(), 4)]; if (un$('treasure')) { state.tfrag = (state.tfrag || 0) + 6; g.push('法寶殘片 ×6'); } return { title: '星辰隕鐵', story: '你取得一塊蘊含星力的隕鐵。', gains: g }; }, () => ({ title: '星火灼傷', story: '坑中殘餘的星火灼傷了你,你只得退出。', gains: [lose$(.04)] }))], ['撿拾坑邊碎石 (穩健)', () => ({ title: '撿拾碎石', story: '你拾了些散落的星石。', gains: [st$(150)] })]);
  EC('🏮', '迷霧幻境', '山間忽起濃霧,霧中光影變幻,似有仙府幻象,也可能是陷阱。', ['闖入幻境 (50%成功)', () => gam(.5, () => ({ title: '破幻得寶', story: '你心如明鏡,破開層層幻象,尋得機緣。', gains: [st$(320), qi$(.06)] }), () => ({ title: '困於幻境', story: '你被幻象所惑,繞了許久才走出。', gains: [lose$(.05)] }))], ['繞道而行 (穩健)', () => ({ title: '明哲保身', story: '你繞道而行,順手撿了些靈石。', gains: [st$(90)] })]);
  EC('🏮', '沉劍深潭', '一潭碧水幽深,潭底似有劍光閃爍,傳說是古劍修葬劍之地。', ['潛水尋劍 (50%成功)', () => gam(.5, () => ({ title: '尋得古劍', story: '你在泥沙間摸到一柄古劍,雖已鏽蝕,仍有劍意殘存。', gains: [it$(bpk(), 3), qi$(.08)] }), () => ({ title: '潭水奇寒', story: '潭水寒冷刺骨,你只得上岸。', gains: [lose$(.03)] }))], ['潭邊靜坐感悟 (穩健)', () => ({ title: '潭邊悟劍', story: '你靜坐潭邊,感受劍意流轉。', gains: [qi$(.05)] })]);
  EC('🏮', '丹爐遺跡', '斷壁殘垣中,一尊半毀的丹爐仍有餘溫,爐底似乎殘留丹藥。', ['重燃爐火 (55%成功)', () => gam(.55, () => ({ title: '爐中有丹', story: '爐火復燃,你取出幾粒尚能服用的丹藥。', gains: [it$(yqk(), 1), it$('pill_4', 3)] }), () => ({ title: '炸爐', story: '爐火失控炸開,你被熏得灰頭土臉。', gains: [lose$(.04)] }))], ['刮取爐灰 (穩健)', () => ({ title: '刮灰成珍', story: '丹爐灰燼中也有些許藥力殘留。', gains: [it$(`hb_${T$()}`, 1), st$(80)] })]);
  EC('🏮', '劍塚迴響', '一座荒塚上插滿斷劍,風過時劍鳴如泣,似在召喚持劍之人。', ['拔劍問道 (45%成功)', () => gam(.45, () => ({ title: '劍意入體', story: '你拔出一柄斷劍,劍意流入識海。', gains: [qi$(.16)] }), () => ({ title: '劍意反噬', story: '劍意凌厲,你被震退數步。', gains: [lose$(.04)] }))], ['行禮而去 (穩健)', () => ({ title: '敬劍而別', story: '你對著劍塚拜了三拜。', gains: [qi$(.04)] })]);
  EC('🏮', '雲中集市', '雲端飄著一座仙家集市,攤位上各色靈物琳瑯滿目,攤主笑著招呼你。', ['以物易物 (豪賭)', () => gam(.5, () => ({ title: '撿漏', story: '你以一塊普通石頭換到了一件寶貝。', gains: [it$(yqk(), 2), st$(220)] }), () => ({ title: '被坑', story: '攤主笑容可掬,卻坑走了你不少靈石。', gains: [lose$(.08)] }))], ['逛逛長見識 (穩健)', () => ({ title: '開眼界', story: '你看了個遍,心境開闊。', gains: [qi$(.05)] })]);
  EC('🏮', '殘破傳送陣', '野外一座殘破傳送陣,仍有靈光閃爍,似乎還能再用一次。', ['啟動傳送 (50%成功)', () => gam(.5, () => ({ title: '落入寶地', story: '傳送後你落在一片靈氣濃郁之地。', gains: [qi$(.12), st$(200)] }), () => ({ title: '傳送失控', story: '傳送陣崩壞,你被拋了回來,丟了些財物。', gains: [lose$(.05)] }))], ['拆下陣眼靈石 (穩健)', () => ({ title: '拆石變賣', story: '你拆下陣眼的靈石帶走。', gains: [st$(170)] })]);
  /* 更多道途抉擇 */
  EV('🏮', '陷阱靈獸', '一頭受傷的靈獸被獵人陷阱夾住,哀鳴不止,獵人尚未現身。', ['放它走', () => ({ al: 6, title: '放生靈獸', story: '你拆了陷阱,靈獸蹭了蹭你,叼來一株靈草。', gains: [it$(gt(), 2)] })], ['剝皮取丹', () => ({ al: -8, title: '殺生取利', story: '你取走了靈獸的內丹與毛皮。', gains: [st$(300), it$(`bp_${Math.min(7, state.realmIdx || 0)}`, 1)] })]);
  EV('🏮', '迷路孩童', '山道上,一個凡人孩童哭著找不到家,身上掛著一塊玉佩。', ['護送回家', () => ({ al: 6, title: '送子歸家', story: '孩子父母感激不盡,奉上謝禮。', gains: [st$(140)] })], ['奪玉棄之', () => ({ al: -7, title: '奪玉棄童', story: '你取走玉佩,轉身離開。', gains: [st$(280)] })]);
  EV('🏮', '瀕死老道', '路邊一位老道人將死,顫抖著遞出一枚儲物戒:「替我……完成遺願。」', ['承諾遺願', () => ({ al: 7, title: '一諾千金', story: '你應下遺願,老道含笑而逝,戒中留有一份心意。', gains: [qi$(.07), st$(120)] })], ['奪戒走人', () => ({ al: -9, title: '趁人之危', story: '你取下儲物戒,留他獨自死去。', gains: [st$(360)] })]);
  EV('🏮', '山賊寨', '前方山寨旗幟張揚,寨主眼放精光,似想拉攏你入夥。', ['剿滅山賊', () => ({ al: 7, title: '剿匪安民', story: '你一劍破寨,救出被擄的村民。', gains: [st$(240)] })], ['入夥分贓', () => ({ al: -8, title: '落草為寇', story: '你與山賊同流合污,分了一大份贓物。', gains: [st$(460)] })]);
  EV('🏮', '假仙師', '集市上,一名自稱「仙師」的騙子正在騙取凡人錢財,你一眼看穿。', ['當眾揭穿', () => ({ al: 5, title: '揭穿騙局', story: '騙子灰溜溜逃走,眾人向你致謝。', gains: [st$(100)] })], ['合夥分成', () => ({ al: -6, title: '合夥行騙', story: '你與他分贓離去。', gains: [st$(300)] })]);
  EV('🏮', '追殺正道弟子', '一名正道弟子被魔修追殺,慌不擇路躲在你身後。', ['出手護住', () => ({ al: 7, title: '護道同門', story: '你擊退魔修,弟子贈你一份傳訊玉簡與靈石。', gains: [st$(200)] })], ['交出弟子', () => ({ al: -9, title: '獻人邀功', story: '魔修大笑,賞了你一件寶物。', gains: [st$(380), it$(yqk(), 1)] })]);
  EV('🏮', '傳功邀請', '兩位修士分別向你遞出名帖:一位自稱名門正派長老,一位是來歷不明的邪修。', ['接正派心法', () => ({ al: 6, title: '正道心法', story: '你修習一段清正平和的心法,真元更加凝練。', gains: [qi$(.08)] })], ['接邪派秘術', () => ({ al: -8, title: '邪術速成', story: '邪修教你一段速成秘術,代價是心頭陰影。', gains: [qi$(.12)] })]);
  EV('🏮', '獸母護子', '一頭妖獸母親護著幼崽,滿身傷痕地盯著你,你若動手,可得獸丹。', ['悄然離開', () => ({ al: 5, title: '不傷母子', story: '你悄然離去,母獸目送你遠去。', gains: [qi$(.04)] })], ['殺母奪丹', () => ({ al: -8, title: '殺母奪丹', story: '你取走獸丹,幼崽哀鳴不止。', gains: [st$(340), it$(`bp_${Math.min(7, state.realmIdx || 0)}`, 1)] })]);
  EV('🏮', '丹師求材', '一位丹師急需一味靈材救人,而你恰好有一份。', ['慷慨相贈', () => { const c = Math.floor(70 * M()); state.stones = Math.max(0, state.stones - c); return { al: 6, title: '雪中送炭', story: '丹師感激,贈你一枚自煉丹藥。', gains: [`💎 靈石 -${fmt(c)}`, it$(yqk(), 1)] }; }], ['趁機抬價', () => ({ al: -4, title: '奇貨可居', story: '你漫天要價,丹師咬牙買下。', gains: [st$(320)] })]);
  EV('🏮', '古墓守墓人', '一座荒墳前,守墓老人懇求你不要驚擾逝者,墓中似有陪葬寶物。', ['替他祭掃', () => ({ al: 5, title: '祭掃亡魂', story: '你燒了香、清了雜草,老人感激不盡。', gains: [qi$(.05)] })], ['盜墓取寶', () => ({ al: -8, title: '驚擾亡者', story: '你破墓而入,取走陪葬靈物。', gains: [st$(400)] })]);
  EV('🏮', '疫病村莊', '一座村莊爆發疫病,村民面黃肌瘦,求你施以援手。', ['施丹救人', () => { const c = Math.floor(100 * M()); state.stones = Math.max(0, state.stones - c); return { al: 9, title: '懸壺濟世', story: '疫病漸退,村民叩首相謝,一縷功德之氣融入識海。', gains: [`💎 靈石 -${fmt(c)}`, qi$(.08)] }; }], ['封村隔絕', () => ({ al: -6, title: '棄之不顧', story: '你布下禁制將村莊隔絕,自己趕路離去。', gains: [] })]);
  EV('🏮', '懸賞通緝', '告示牆上貼著一張通緝令,賞金豐厚。你在酒肆中恰好撞見通緝犯。', ['出手擒拿', () => ({ al: 5, title: '緝拿要犯', story: '你將要犯送官,領得賞金。', gains: [st$(260)] })], ['暗中放走', () => ({ al: -5, title: '與犯同路', story: '要犯塞給你一袋靈石,匆匆離去。', gains: [st$(340)] })]);
  EV('🏮', '落單的敵派弟子', '你遇見一名與你有過節的宗門弟子獨自一人,身上帶傷。', ['放他離去', () => ({ al: 5, title: '不趁人危', story: '你收劍轉身,他羞愧地行了一禮。', gains: [qi$(.04)] })], ['偷襲搶奪', () => ({ al: -8, title: '暗箭傷人', story: '你偷襲得手,搜刮了他的財物。', gains: [st$(380)] })]);
  EV('🏮', '賭坊老千', '你發現賭坊裡有人出千,賭客輸得傾家蕩產,莊家與你對視一眼。', ['出面揭發', () => ({ al: 5, title: '拆穿千術', story: '你戳破千術,賭客拿回了錢,有人給你一份謝禮。', gains: [st$(180)] })], ['入局分紅', () => ({ al: -6, title: '同流合污', story: '莊家笑著分給你一成分紅。', gains: [st$(360)] })]);
  EV('🏮', '王侯聘請', '凡間一位王侯重金聘你入府為客卿,代價是替他鎮壓不聽話的百姓。', ['婉拒', () => ({ al: 5, title: '不事權貴', story: '你揮袖離去,連禮物都未收。', gains: [qi$(.05)] })], ['應下聘約', () => ({ al: -8, title: '為虎作倀', story: '你替他壓下了民怨,拿走報酬。', gains: [st$(480)] })]);
  EV('🏮', '墮落修士', '一名曾入正道的修士如今淪為魔修,跪在你面前,求你給他一條出路。', ['勸其回頭', () => ({ al: 6, title: '渡人向善', story: '他痛哭流涕,答應洗心革面,送你一件舊物。', gains: [it$(gt(), 1), qi$(.04)] })], ['與他同行', () => ({ al: -7, title: '與魔同路', story: '你與他把酒言歡,他分你一份魔道秘藏。', gains: [st$(300), qi$(.05)] })]);
  EV('🏮', '活人祭陣', '你發現一座邪陣,陣中困著數名凡人,陣中濃烈血氣足以助你修行。', ['破陣救人', () => ({ al: 9, title: '破邪救人', story: '你破開邪陣,救出所有人,他們感激叩首。', gains: [it$(gt(), 2), qi$(.04)] })], ['借陣修行', () => ({ al: -14, title: '血陣修行', story: '血氣灌頂,修為大漲,但你不敢回頭看。', gains: [qi$(.2)] })]);
  EV('🏮', '神兵爭奪', '兩名修士為一件靈器大打出手,你恰好從旁路過,雙方都警惕地望向你。', ['勸架調停', () => ({ al: 4, title: '息事寧人', story: '你出面調停,兩人各退一步,分你謝禮。', gains: [st$(180)] })], ['坐收漁利', () => ({ al: -6, title: '漁翁得利', story: '兩人兩敗俱傷,你取走了靈器碎片。', gains: [st$(420)] })]);
  EV('🏮', '乞兒拜師', '一個資質平平的乞兒跪在你面前,要拜你為師,只求學一口飯吃。', ['收為記名弟子', () => { const c = Math.floor(120 * M()); state.stones = Math.max(0, state.stones - c); return { al: 8, title: '有教無類', story: '你贈他盤纏與入門功法,他叩頭三響。', gains: [`💎 靈石 -${fmt(c)}`, qi$(.06)] }; }], ['一腳踢開', () => ({ al: -5, title: '冷血', story: '你拂袖而去,身後傳來哽咽。', gains: [] })]);
  EV('🏮', '破敗山神廟', '山神廟年久失修,香火斷絕,廟中供桌下藏著前人遺留的香火錢。', ['出資修繕', () => { const c = Math.floor(90 * M()); state.stones = Math.max(0, state.stones - c); return { al: 7, title: '修廟積德', story: '廟宇煥然一新,山神似有靈應,賜你一縷福緣。', gains: [`💎 靈石 -${fmt(c)}`, qi$(.1)] }; }], ['取走香火錢', () => ({ al: -6, title: '褻瀆神明', story: '你取走了所有香火錢,風吹過,廟門吱呀作響。', gains: [st$(300)] })]);
  EV('🏮', '入魔修士', '一位路遇的落魄修士眼泛血光,他說只要你與他並肩,魔道也能成仙。', ['苦勸其歸', () => ({ al: 6, title: '以情動人', story: '你的話讓他怔了許久,他最終離去,卻留下一封信。', gains: [qi$(.05)] })], ['與他並肩', () => ({ al: -10, title: '同赴魔道', story: '你與他共修魔功,實力暴增。', gains: [qi$(.13)] })]);
  EV('🏮', '洞府禁制', '一座無主洞府外設著禁制,門前石碑刻著「勿強入」。', ['留名叩門', () => ({ al: 4, title: '守禮而入', story: '禁制感應你的誠意,為你開了一道縫隙。', gains: [it$(gt(), 2), st$(120)] })], ['強行破禁', () => ({ al: -6, title: '破禁闖入', story: '你強破禁制,洞中靈物盡數被你搜刮。', gains: [st$(420)] })]);
  EV('🏮', '河畔亡魂', '河畔一縷亡魂不肯離去,似有執念未了。', ['替他超度', () => ({ al: 7, title: '度亡魂', story: '你誦經超度,亡魂化光離去,一縷清氣入體。', gains: [qi$(.07)] })], ['煉化為己用', () => ({ al: -10, title: '煉魂奪力', story: '你將亡魂煉化,魂力入體,卻聽見它最後的哀嚎。', gains: [qi$(.14)] })]);
  EV('🏮', '義莊屍變', '深夜義莊,一具屍體突然坐起,眼冒綠光,一個年輕道士驚慌求救。', ['出手鎮屍', () => ({ al: 5, title: '鎮屍護人', story: '你一道符籙鎮住屍體,道士千恩萬謝。', gains: [st$(150)] })], ['收屍煉傀', () => ({ al: -8, title: '煉屍為傀', story: '你將屍體收為己用,道士嚇得逃走。', gains: [st$(300), it$(`bp_${Math.min(7, state.realmIdx || 0)}`, 1)] })]);
  EV('🏮', '欠債修士', '一名低階修士欠了你的錢,如今他母親病重,他跪地求你寬限。', ['免去債務', () => ({ al: 6, title: '寬厚待人', story: '他感激涕零,硬塞給你一株他珍藏的草藥。', gains: [it$(gt(), 1)] })], ['逼他還債', () => ({ al: -6, title: '冷面催債', story: '你扣了他僅有的家當。', gains: [st$(340)] })]);

  window.pickEventIdx = () => { const A = [], C = []; CHOICE_EVENTS.forEach((e, i) => (e.isAl ? A : C).push(i)); const L = (Math.random() < .5 && A.length) ? A : C; return pick(L.length ? L : A); };
  window.SECT9 = { open, close, join, claim, learn, toggleEq, trial, leave, effects, SECTS, cur, rankIdx, addAlign, render };
  navLock(); render();
})();


