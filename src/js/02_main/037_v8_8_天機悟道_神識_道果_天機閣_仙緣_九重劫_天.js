/* ===== v8.8:天機悟道 —— 神識 · 道果 · 天機閣(仙緣)· 九重劫 · 天機奇遇 ===== */
(function () {
  const $ = id => document.getElementById(id), fmt = n => formatNum(n), X = window.X5;
  const R = () => state.realmIdx || 0;
  const open0 = () => R() >= 4 && !!(window.UNLOCK9 && UNLOCK9.on('xian'));
  const jieOK = () => !!(window.UNLOCK9 && UNLOCK9.on('jie'));
  const today = () => { const d = new Date(); return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); };
  const SH = () => { if (!state.shen || typeof state.shen !== 'object') state.shen = {}; const s = state.shen; ['s', 'h', 'q', 't'].forEach(k => { if (typeof s[k] !== 'number') s[k] = 0; }); return s; };
  const GU = () => { if (!state.guo || typeof state.guo !== 'object') state.guo = {}; const g = state.guo; ['hp', 'atk', 'def', 'qi', 'sk', 'crit'].forEach(k => { if (typeof g[k] !== 'number') g[k] = 0; }); return g; };
  const JI = () => { if (!state.jie || typeof state.jie !== 'object') state.jie = {}; const j = state.jie; if (typeof j.cleared !== 'number') j.cleared = 0; if (!j.d) j.d = 0; if (typeof j.n !== 'number') j.n = 0; return j; };
  const XS = () => { if (!state.xshop || typeof state.xshop !== 'object') state.xshop = {}; const x = state.xshop; if (x.d !== today()) { x.d = today(); x.n = {}; } if (!x.n) x.n = {}; return x; };
  /* ---------- 神識 ---------- */
  const BR = [
    { k: 's', n: '洞察', ic: '👓', d: '會心率、會心傷害', per: { crit: .6, critD: .012 } },
    { k: 'h', n: '凝魂', ic: '🧿', d: '氣血、防禦', per: { hpP: .012, defP: .01 } },
    { k: 'q', n: '御器', ic: '🔱', d: '攻擊、神通傷害', per: { atkP: .012, skAll: .008 } },
    { k: 't', n: '通玄', ic: '🔰', d: '吐納、靈石、機緣', per: { qiP: .015, stoneP: .008, dropP: .005 } }
  ];
  const shenCap = () => R() < 4 ? 0 : Math.min(30, 10 + 4 * (R() - 4));
  const shenCost = lv => Math.floor(X.sb(Math.max(4, Math.min(7, R()))) * .5 * Math.pow(1.2, lv));
  X.reg('神識', () => { const s = SH(), cap = shenCap(), E = {}; BR.forEach(b => { const lv = Math.min(s[b.k], cap); for (const k in b.per) E[k] = (E[k] || 0) + b.per[k] * lv; }); return E; });
  /* ---------- 道果 ---------- */
  const GO = [
    { k: 'hp', n: '氣血道果', ic: '🍎', per: { hpP: .01 }, d: '氣血 +1%/枚' }, { k: 'atk', n: '攻伐道果', ic: '🍒', per: { atkP: .01 }, d: '攻擊 +1%/枚' },
    { k: 'def', n: '護體道果', ic: '🍐', per: { defP: .01 }, d: '防禦 +1%/枚' }, { k: 'qi', n: '悟道道果', ic: '🍇', per: { qiP: .015 }, d: '吐納 +1.5%/枚' },
    { k: 'sk', n: '神通道果', ic: '🍊', per: { skAll: .01 }, d: '神通傷害 +1%/枚' }, { k: 'crit', n: '會心道果', ic: '🍋', per: { crit: .5 }, d: '會心率 +0.5%/枚' }
  ];
  const GMAX = 20, gCost = n => 3 + n;
  X.reg('道果', () => { const g = GU(), E = {}; GO.forEach(o => { for (const k in o.per) E[k] = (E[k] || 0) + o.per[k] * g[o.k]; }); return E; });
  const SHOP = [
    { id: 'rn_1', n: 1, c: 1, lim: 20 }, { id: 'pill_3', n: 3, c: 5, lim: 3 }, { id: 'pill_5', n: 1, c: 12, lim: 2 }, { id: 'yq_5', n: 1, c: 10, lim: 3 }, { id: 'sp_5', n: 1, c: 8, lim: 3 }, { id: 'EGG', n: 1, c: 10, lim: 2 }, { id: 'TF', n: 30, c: 8, lim: 3 }
  ];
  const shName = s => s.id === 'EGG' ? '🥚 靈寵蛋' : s.id === 'TF' ? '🧩 法寶殘片' : `${ITEMS[s.id].icon} ${ITEMS[s.id].name}`;
  /* ---------- 九重劫 ---------- */
  const JN = [['風劫', '🌪️', 'wood', '罡風蝕骨'], ['火劫', '☄️', 'fire', '三昧真火'], ['雷劫', '⛈️', 'metal', '九霄神雷'], ['水劫', '🌊', 'water', '弱水三千'], ['心魔劫', '👿', 'fire', '照見本心'], ['金劫', '🔪', 'metal', '庚金劍氣'], ['木劫', '🌳', 'wood', '萬木歸寂'], ['天罰劫', '☁️', 'earth', '天罰降世'], ['混沌劫', '🕳️', 'earth', '混沌歸墟']];
  function jieMon(n, st) {
    const g = Math.pow(1.22, n - 1), tpl = JN[n - 1], f = 0.05 * g;
    const atkForHit = (hpP, defP, frac) => { const t = hpP * frac; return Math.floor((t + Math.sqrt(t * t + 4 * t * defP)) / 2); };
    return { id: 'jie_' + n, name: `第${'一二三四五六七八九'[n - 1]}重·${tpl[0]}`, emoji: tpl[1], element: tpl[2], skillName: tpl[3], isBoss: true, drops: [], hp: Math.floor(st.atk * 7 * Math.pow(g, 1.15) * (1 + .15 * n)), atk: atkForHit(st.hp, st.def, f), def: Math.floor(st.atk * .3 * Math.sqrt(g)) };
  }
  const jieRw = (n, first) => first ? { xian: 6 + 4 * n, items: { ['yq_' + Math.min(7, Math.max(1, R()))]: n, rn_1: 2 + n }, tfrag: 4 * n, dao: n >= 5 ? n - 3 : 0 } : { xian: 1 + Math.floor(n / 3), items: { rn_1: 1 } };
  function startJie(n) {
    if (!open0() || !jieOK()) { showToast('【九重劫】劫印未傳——隨劇情開啟。'); return; }
    const J = JI(); if (n > J.cleared + 1) { showToast('須先渡過前一重劫。'); return; }
    const first = n > J.cleared; if (!first) { if (J.d !== today()) { J.d = today(); J.n = 0; } if (J.n >= 5) { showToast('今日重修次數已滿(5 次)。'); return; } }
    const st = calculateTotalStats(); if (hpGate(st)) return;
    const wasA108 = !!state.autoExplore; if (currentBattle && !(window.HO43 && HO43.yieldBattle())) { showToast('正在戰鬥中。'); return; }   /* v108 一般歷練戰鬥自動讓出 */
    window.JIE49 = { show: false, n, was: wasA108 || !!(window.JIE49 && JIE49.chain && JIE49.was) }; try { HO43.mark({ kind: 'jie' }); } catch (e) { }
    if (state.autoExplore) stopAutoExplore('九重劫降臨,自動歷練暫停。');
    const mon = jieMon(n, st); X.close('xian'); goToTab('tab-adventure');
    startMonsterBattle({ id: 98, name: '九重劫', maxSteps: 9999, element: mon.element, monsters: [mon] }, true);
    if (currentBattle) { currentBattle.isJie = n; currentBattle.special = true; currentBattle.jieFirst = first; }
  }
  window.startJie49 = startJie;
  XT.winBattle88 = _wb => function () {
    const B = currentBattle; if (!(B && B.isJie)) return _wb.apply(this, arguments);
    const n = B.isJie, J = JI(), m = B.monster, rw = jieRw(n, B.jieFirst);
    if (B.jieFirst) { J.cleared = Math.max(J.cleared, n); } else { J.n++; }
    window.JIE49 = Object.assign(window.JIE49 || {}, { show: true, win: true, first: !!B.jieFirst, n, chain: false });
    audio.playFanfare(); const L = X.give(rw, true);
    { const k = B.jieFirst ? 1 : (Math.random() < .35 ? 1 : 0); if (k && ITEMS.pill_dt) { addItem('pill_dt', k); L.push(`${ITEMS.pill_dt.name} ×${k}`); } }   /* v111 清心化毒丹 */
    logAdventure(`<span class="text-fuchsia-300 font-bold">⚡ 渡過【${m.name}】!${L.join('、')}</span>`);
    showBattleResultModal(true, m.name, 0, L); endBattle(); updateTopBar(); saveGame(); X.refresh('xian'); return;
  };
  XT.loseBattle88 = _lb => function () {
    const B = currentBattle; if (!(B && B.isJie)) return _lb.apply(this, arguments);
    window.JIE49 = Object.assign(window.JIE49 || {}, { show: true, win: false, n: B.isJie, chain: false });
    state.hp = Math.max(1, Math.floor(calculateTotalStats().hp * .5)); logAdventure(`<span class="text-rose-400 font-bold">💀 於【${B.monster.name}】道消身殞,劫雲散去。</span>`);
    showBattleResultModal(false, B.monster.name, 0, []); endBattle(); if (state.autoExplore) stopAutoExplore('渡劫失敗。'); updateTopBar(); saveGame(); X.refresh('xian');
  };
  /* ---------- 仙緣來源 ---------- */
  X.srHooks.push((out, r, c) => { if (r.t >= 4) { const x = Math.round((r.t - 3) * (1 + r.d) * c.m * .8); if (x > 0) out.xian = (out.xian || 0) + x; } });
  { XT.towerWin88 = _t => function () { const f = currentBattle && currentBattle.floor; const r = _t.apply(this, arguments); if (f && (f % 9 === 0 || f === 100) && open0()) { const x = 2 + Math.floor(f / 20); X.give({ xian: x }, true); logAdventure(`🌸 塔頂仙氣縈繞,獲得仙緣 ×${x}`); } return r; }; }
  { XT.wbWin88 = _w => function () { const r = _w.apply(this, arguments); if (open0()) { X.give({ xian: 4 }, true); logAdventure('🌸 天地異種 遺落仙緣 ×4'); } return r; }; }
  window.XJ37 = { alert: () => { try { if (!open0()) return false; const s = SH(), cap = shenCap(); if (BR.some(b => s[b.k] < cap && state.stones >= shenCost(s[b.k]))) return true; const g = GU(); return GO.some(o => g[o.k] < GMAX && (state.xian || 0) >= gCost(g[o.k])); } catch (e) { return false; } } };   /* v108 天機紅點 */
  /* ---------- 介面 ---------- */
  const st = document.createElement('style');
  st.textContent = `#xr18{display:flex;gap:6px;margin-top:6px}#xr18 button{flex:1;padding:9px 6px;border-radius:10px;background:linear-gradient(135deg,#312e81,#0f172a);border:1px solid #6366f1;color:#e0e7ff;font-weight:800;font-size:12px;position:relative}#xr18 button.lk{opacity:.55;background:#0f172a;border-color:#334155;color:#94a3b8}
.xb-r{display:flex;align-items:center;gap:8px;background:#0f172a;border:1px solid #1e293b;border-radius:10px;padding:8px;margin-bottom:6px}.xb-r .ic{font-size:24px;width:32px;text-align:center}.xb-r .n{font-weight:800;font-size:13px}.xb-r .d{font-size:10px;color:#94a3b8}`;
  document.head.appendChild(st);
  let tab = 'shen';
  X.sheet('xian', () => `🎐 天機悟道 <span style="font-size:12px;color:#f9a8d4;font-weight:700">🌸 仙緣 ${fmt(state.xian || 0)}</span>`, b => {
    const cap = shenCap(), s = SH(), g = GU(), J = JI(), xs = XS();
    let h = `<div class="x5-tabs"><button class="${tab === 'shen' ? 'on' : ''}" data-x5="xj.tab" data-k="shen">神識</button><button class="${tab === 'shop' ? 'on' : ''}" data-x5="xj.tab" data-k="shop">天機閣</button><button class="${tab === 'jie' ? 'on' : ''}" data-x5="xj.tab" data-k="jie">九重劫</button></div>`;
    if (!open0()) { b.innerHTML = h + '<div class="x5-cd" style="text-align:center;color:#94a3b8">' + (R() >= 4 ? '神識已能通天,只是天機尚未向你敞開。<br>點右上 📖 繼續劇情,時機一到便會開啟。' : '化神之境,神識通天,可窺一線天機。<br>修至【化神期】後,隨劇情開啟天機悟道:<br>神識淬鍊、道果兌換、九重雷劫。') + '</div>'; return; }
    h += `<div class="x5-sub" style="margin:6px 0">化神之境,神識通天,可窺一線天機;所凝仙緣,可於天機閣兌換。</div>`;
    if (tab === 'shen') {
      h += `<div class="x5-sub" style="margin-bottom:6px">以靈石淬鍊神識,四條路各自獨立。目前境界上限 <b style="color:#fcd34d">${cap}</b> 層(每突破一個大境界 +4,至多 30)。</div>`;
      BR.forEach(o => { const lv = s[o.k], c = shenCost(lv), full = lv >= cap, poor = state.stones < c; const eff = {}; for (const k in o.per) eff[k] = o.per[k] * Math.min(lv, cap);
        h += `<div class="xb-r"><div class="ic">${o.ic}</div><div style="flex:1;min-width:0"><div class="n">${o.n} <span style="color:#fcd34d">Lv.${lv}</span></div><div class="d">${o.d}</div><div class="d" style="color:#34d399">${X.fxText(eff)}</div></div><button class="x5-btn ${full || poor ? 'gy' : 'am'}" data-x5="xj.shen" data-k="${o.k}" ${full ? 'disabled' : ''} style="min-width:76px">${full ? '已達上限' : `淬鍊<br><span style="font-size:10px">${fmt(c)}</span>`}</button></div>`; });
    } else if (tab === 'shop') {
      h += `<div class="x5-cd" style="margin-bottom:8px"><b style="color:#f9a8d4">🍑 道果(永久,轉世保留)</b><div class="x5-sub">每種最多 ${GMAX} 枚,越吃越貴。仙緣來自仙界秘境、九九登天塔守塔(每九層)、天地異種、九重劫。</div></div>`;
      GO.forEach(o => { const n = g[o.k], c = gCost(n), full = n >= GMAX; h += `<div class="xb-r"><div class="ic">${o.ic}</div><div style="flex:1"><div class="n">${o.n} <span style="color:#fcd34d">×${n}</span></div><div class="d">${o.d}</div></div><button class="x5-btn ${full || (state.xian || 0) < c ? 'gy' : 'am'}" data-x5="xj.guo" data-k="${o.k}" ${full ? 'disabled' : ''} style="min-width:76px">${full ? '已滿' : `🌸 ${c}`}</button></div>`; });
      h += `<div class="x5-cd" style="margin:10px 0 8px"><b style="color:#f9a8d4">🏮 天機閣兌換(每日限量)</b></div>`;
      SHOP.forEach(sp => { const left = sp.lim - (xs.n[sp.id] || 0); h += `<div class="xb-r"><div style="flex:1"><div class="n">${shName(sp)} ×${sp.n}</div><div class="d">今日餘 ${left}/${sp.lim}</div></div><button class="x5-btn ${left <= 0 || (state.xian || 0) < sp.c ? 'gy' : 'am'}" data-x5="xj.buy" data-id="${sp.id}" ${left <= 0 ? 'disabled' : ''} style="min-width:76px">🌸 ${sp.c}</button></div>`; });
    } else if (!jieOK()) {
      h += '<div class="x5-cd" style="text-align:center;color:#94a3b8">九重劫印尚未傳授。<br>' + (R() >= 4 ? '點右上 📖 繼續劇情,飛升之前,墨塵自有交代。' : '化神期後,隨劇情開啟。') + '</div>';
    } else {
      h += `<div class="x5-sub" style="margin-bottom:6px">九重天劫,一重強過一重;敵人強度隨你的屬性而定。首次渡過獲大量仙緣,已渡過者每日可重修 5 次(今日 ${J.d === today() ? J.n : 0}/5)。</div>`;
      for (let n = 1; n <= 9; n++) { const done = n <= J.cleared, can = n <= J.cleared + 1, rw = jieRw(n, !done), tpl = JN[n - 1]; h += `<div class="xb-r" style="${can ? '' : 'opacity:.5'}"><div class="ic">${tpl[1]}</div><div style="flex:1;min-width:0"><div class="n">第${'一二三四五六七八九'[n - 1]}重・${tpl[0]} ${done ? '<span style="color:#4ade80;font-size:11px">✓已渡</span>' : ''}</div><div class="d">${done ? '重修' : '首渡'}:🌸 仙緣 ×${rw.xian}${done ? '' : `、丹藥×${n}、殘片×${4 * n}`}</div></div><button class="x5-btn ${can ? 'x5rd' : 'gy'}" data-x5="xj.jie" data-n="${n}" ${can ? '' : 'disabled'}>${done ? '重修' : '渡劫'}</button></div>`; }
    }
    b.innerHTML = h;
  });
  X.act('xj.tab', t => { tab = t.dataset.k; X.refresh('xian'); });
  X.act('xj.shen', t => { const s = SH(), k = t.dataset.k, lv = s[k], c = shenCost(lv); if (lv >= shenCap()) return; if (state.stones < c) { showToast(`靈石不足,需 ${fmt(c)}。`); return; } state.stones -= c; s[k]++; X.dirty(); audio.playFanfare(); showToast('神識淬鍊,心念通透了幾分。'); updateTopBar(); saveGame(); X.refresh('xian'); });
  X.act('xj.guo', t => { const g = GU(), k = t.dataset.k, n = g[k], c = gCost(n); if (n >= GMAX) return; if ((state.xian || 0) < c) { showToast(`仙緣不足,需 ${c}。`); return; } state.xian -= c; g[k]++; X.dirty(); X.bust && X.bust(); audio.playFanfare(); showToast('道果入腹,大道又近一步。'); saveGame(); try { updateTopBar(); renderProfile(); } catch (e) { } X.refresh('xian'); });
  X.act('xj.buy', t => { const sp = SHOP.find(x => x.id === t.dataset.id), xs = XS(); if (!sp) return; if ((xs.n[sp.id] || 0) >= sp.lim) return; if ((state.xian || 0) < sp.c) { showToast(`仙緣不足,需 ${sp.c}。`); return; } state.xian -= sp.c; xs.n[sp.id] = (xs.n[sp.id] || 0) + 1; if (sp.id === 'EGG') X.give({ eggs: sp.n }, true); else if (sp.id === 'TF') X.give({ tfrag: sp.n }, true); else X.give({ items: { [sp.id]: sp.n } }, true); showToast(`兌換成功:${shName(sp)} ×${sp.n}`); try { updateTopBar(); renderInventory(); } catch (e) { } saveGame(); X.refresh('xian'); });
  X.act('xj.jie', t => startJie(+t.dataset.n));
  X.act('xj.open', () => X.open('xian'));
  function mount() {
    if ($('xr18')) return; const a = $('cx15'); if (!a) return;
    const d = document.createElement('div'); d.id = 'xr18'; d.innerHTML = '<button data-x5="xj.open"></button>'; a.parentNode.insertBefore(d, a.nextSibling);
  }
  function renderBtn() { const b = document.querySelector('#xr18 button'); if (!b) return; const o = open0(), h = o ? `✨ 天機悟道・🌸${fmt(state.xian || 0)}` : (R() >= 4 ? '🔒 天機悟道(隨劇情開啟)' : '🔒 天機悟道(化神期開放)'); if (b.dataset.h !== h) { b.dataset.h = h; b.textContent = h; b.classList.toggle('lk', !o); } }
  /* ---------- 稱號 ---------- */
  X.addTitle('t_j9', '九劫不滅', '渡過九重劫', () => [JI().cleared, 9], { hpP: .05, atkP: .05, defP: .05 }, '#f0abfc');
  X.addTitle('t_j5', '劫中行者', '渡過五重劫', () => [JI().cleared, 5], { hpP: .03, defP: .03 }, '#c4b5fd');
  X.addTitle('t_sh', '神識通明', '神識總層數達 40', () => [SH().s + SH().h + SH().q + SH().t, 40], { crit: 2, qiP: .04 }, '#a5b4fc');
  X.addTitle('t_xg', '仙緣深厚', '累計獲得仙緣 500', () => [state.xianTot || 0, 500], { stoneP: .05, dropP: .05 }, '#f9a8d4');
  X.reTBY();
  /* ---------- 天機奇遇(化神期起) ---------- */
  const gam = (p, W, L) => Math.random() < p ? Object.assign({ ok: true }, W()) : Object.assign({ ok: false }, L());
  const mk = (icon, title, desc, A, B) => {
    const wrap = f => () => { const r = f(); return { ok: r.ok === undefined ? true : r.ok, icon, title: r.title || title, story: r.story, gains: r.gains || [] }; };
    CHOICE_EVENTS.push({ minRealm: 4, xian: true, icon, title, desc, choiceA: A[0], choiceB: B[0], actionA: wrap(A[1]), actionB: wrap(B[1]) });
  };
  const xg = n => { X.give({ xian: n }, true); return `🌸 仙緣 +${n}`; };
  const sg = n => { const v = Math.floor(n * eventRewardMult()); state.stones += v; return `💎 靈石 +${fmt(v)}`; };
  const lg = p => { const v = Math.floor(state.stones * p); state.stones -= v; return `💎 靈石 -${fmt(v)}`; };
  const tk = () => Math.min(7, Math.max(4, R()));
  mk('🌌', '天河垂釣', '雲海之上,一位白鬚仙翁手持釣竿,竿頭無鉤,見你到來笑而不語。', ['坐下同釣 (55%成功)', () => gam(.55, () => ({ title: '願者上鉤', story: '你與仙翁相對而坐,不知過了多久,竿頭微沉,釣起一尾泛光的錦鯉。', gains: [xg(3 + (R() - 4))] }), () => ({ title: '空竿而歸', story: '你枯坐良久,一無所獲,仙翁笑道:「心未靜。」', gains: [] }))], ['行禮而去 (穩健)', () => ({ title: '拱手致意', story: '你拱手作別,仙翁微微頷首,拋來一枚靈石。', gains: [sg(900 * Math.pow(2, tk() - 4))] })]);
  mk('🍑', '瑤池蟠桃會', '瑤池畔仙樂縹緲,眾仙正在赴宴,一名侍女向你遞出請柬。', ['獻禮赴宴 (耗靈石)', () => { const c = Math.floor(state.stones * .03); state.stones -= c; return { title: '赴宴結緣', story: '你獻上薄禮,與仙君們論道半日,臨別每人贈你一縷仙氣。', gains: [`💎 靈石 -${fmt(c)}`, xg(4 + (R() - 4))] }; }], ['在席外聽曲 (穩健)', () => ({ title: '遠聽仙樂', story: '你立於桃林外聽了一曲,神識通透,修為略有精進。', gains: [`修為 +${fmt(Math.floor(getRealmInfo().maxQi * .05))}`, (() => { state.qi += Math.floor(getRealmInfo().maxQi * .05); return ''; })()].filter(Boolean) })]);
  mk('🛡️', '天兵巡營', '前方一隊天兵列陣而過,為首的將軍目光如電,似在盤查可疑之人。', ['上前示令 (50%成功)', () => gam(.5, () => ({ title: '得將軍賞識', story: '你出示身份,將軍見你氣度不凡,贈你一枚軍功令。', gains: [xg(3), sg(1200 * Math.pow(2, tk() - 4))] }), () => ({ title: '被當作可疑之人', story: '將軍冷哼一聲,罰你繳了些靈石才放行。', gains: [lg(.04)] }))], ['繞道避開 (穩健)', () => ({ title: '避其鋒芒', story: '你悄然繞道,避開了這場麻煩。', gains: [sg(500 * Math.pow(2, tk() - 4))] })]);
  mk('🕳️', '九幽裂隙', '虛空中裂開一道漆黑縫隙,隱有鬼哭神號,縫隙深處閃著暗金光芒。', ['探入裂隙 (45%成功)', () => gam(.45, () => ({ title: '幽冥取寶', story: '你在裂隙中取走一件遺落的仙器碎片,轉身時裂隙悄然閉合。', gains: [xg(5), `🪨 器紋石 ×3`, (() => { X.give({ items: { rn_1: 3 } }, true); return ''; })()].filter(Boolean) }), () => ({ title: '陰氣侵體', story: '裂隙中陰風呼嘯,你匆忙退出,損失了不少靈石。', gains: [lg(.06)] }))], ['以符封印 (穩健)', () => ({ title: '封印裂隙', story: '你以符籙封住裂隙,一縷浩然之氣反哺己身。', gains: [`修為 +${fmt(Math.floor(getRealmInfo().maxQi * .06))}`, (() => { state.qi += Math.floor(getRealmInfo().maxQi * .06); return ''; })()].filter(Boolean) })]);
  mk('🏯', '仙帝遺府', '雲端沉浮著一座半塌的宮闕,殿前石獸雙目泛紅,似在守護著什麼。', ['闖殿取寶 (40%成功)', () => gam(.4, () => ({ title: '遺府有緣', story: '你破開禁制,殿中玉案上靜靜躺著一枚道果。', gains: [xg(6 + (R() - 4) * 2)] }), () => ({ title: '石獸護府', story: '石獸暴起,你拼盡全力才脫身,身上財物遺失不少。', gains: [lg(.07)] }))], ['叩拜離去 (穩健)', () => ({ title: '恭敬而退', story: '你整衣叩拜後離開,殿中降下一縷靈光。', gains: [xg(1)] })]);
  mk('☁️', '雲海渡口', '雲海渡口,一名擺渡老者撐著竹筏,說只收「來路」為渡資。', ['講述來路 (免費)', () => ({ title: '以故事為資', story: '你講起一路修行的點滴,老者靜聽落淚,將你渡過雲海,並贈你一壺仙露。', gains: [xg(2), `修為 +${fmt(Math.floor(getRealmInfo().maxQi * .04))}`, (() => { state.qi += Math.floor(getRealmInfo().maxQi * .04); return ''; })()].filter(Boolean) })], ['付靈石過渡 (穩健)', () => { const c = Math.floor(state.stones * .02); state.stones -= c; return { title: '一筏過雲', story: '你付了渡資,平穩渡過雲海。', gains: [`💎 靈石 -${fmt(c)}`, xg(1)] }; }]);
  mk('', '星君棋局', '一位星君於星河間獨坐對弈,棋盤上星辰流轉,他邀你落子。', ['落子應戰 (50%成功)', () => gam(.5, () => ({ title: '一子動星河', story: '你落子如飛,星君撫掌大笑,送你一枚星砂。', gains: [xg(4), sg(1500 * Math.pow(2, tk() - 4))] }), () => ({ title: '錯失一著', story: '你落錯一子,星君搖頭收了棋局。', gains: [] }))], ['觀棋學藝 (穩健)', () => ({ title: '觀棋有悟', story: '你默默觀棋,領悟了幾分運籌之道。', gains: [`修為 +${fmt(Math.floor(getRealmInfo().maxQi * .05))}`, (() => { state.qi += Math.floor(getRealmInfo().maxQi * .05); return ''; })()].filter(Boolean) })]);
  mk('🪞', '因果輪迴碑', '荒原中立著一座古碑,碑面映出你過往的種種因果。', ['直面因果 (50%成功)', () => gam(.5, () => ({ title: '因果自明', story: '你直視碑上舊事,心魔散去,道心更堅。', gains: [xg(4), (() => { state.daoPoints = (state.daoPoints || 0) + 1; return '☯ 道心點 +1'; })()] }), () => ({ title: '心神震盪', story: '往事湧上心頭,你神識震盪,調息良久。', gains: [lg(.03)] }))], ['拓印碑文 (穩健)', () => ({ title: '拓印而歸', story: '你拓下碑文,細細參研。', gains: [xg(1), sg(600 * Math.pow(2, tk() - 4))] })]);
  { const _p = window.pickEventIdx; window.pickEventIdx = function () { for (let i = 0; i < 12; i++) { const k = _p.apply(this, arguments), e = CHOICE_EVENTS[k]; if (!e || !e.minRealm || (R() >= e.minRealm && (!e.xian || open0()))) return k; } return 0; }; }
  function tick() { try { mount(); renderBtn(); XS(); } catch (e) { console.warn('x18', e); } }
  setTimeout(tick, 900); setInterval(tick, 1500);
  window.XJ18 = { SH, GU, JI, shenCap, startJie, jieMon, BR, GO };
})();


