/* ===== v8.7:每日秘境(派遣版)· 本尊/化身 · 戰報 · 連日圓滿 ===== */
(function () {
  const $ = id => document.getElementById(id), fmt = n => formatNum(n), X = window.X5, ri = X.ri, pick = X.pick;
  const TPL = [
    { id: 'ruin', n: '上古遺府', ic: '🗿', el: 'metal', mod: '禁制未散・器紋石與殘片加成', hook: ['古修遺府的禁制被你一一破解,石室中塵封的玉匣緩緩開啟。', '壁畫上的陣紋忽明忽暗,你循跡而行,在丹房殘爐下尋得遺澤。'] },
    { id: 'herb', n: '藥靈谷', ic: '🍃', el: 'wood', mod: '靈藥遍地・草藥材料翻倍', hook: ['谷中藥香馥郁,靈氣凝成薄霧,百年靈藥隨手可採。', '你循著靈蝶指引,在谷底寒潭邊發現成片靈芝。'] },
    { id: 'mine', n: '玄晶礦脈', ic: '⛏️', el: 'earth', mod: '地脈深處・礦材與靈石加成', hook: ['地火翻湧的礦道盡頭,玄晶閃著幽藍冷光。', '你以神識探路,避開崩塌的坑道,鑿下一整塊晶髓。'] },
    { id: 'beast', n: '妖獸巢穴', ic: '🐲', el: 'wood', mod: '獸潮洶湧・妖獸材料翻倍、易得靈寵蛋', hook: ['巢穴深處獸吼震天,你獨闖獸群,斬妖奪寶。', '母獸護著幼崽不肯退讓,你出手有度,只取了散落的卵與獸骨。'] },
    { id: 'thunder', n: '雷劫荒原', ic: '🌩️', el: 'metal', mod: '殘雷未散・法寶殘片翻倍', hook: ['荒原上殘雷遊走,焦土中埋著上古渡劫者留下的法寶碎片。', '你借天雷淬體,在雷坑中挖出數枚泛著紫光的碎片。'] },
    { id: 'pool', n: '靈泉秘窟', ic: '💧', el: 'water', mod: '靈泉汩汩・修為丹加成', hook: ['洞天之中靈泉成池,你盤坐其畔吐納半日,氣海充盈。', '泉眼噴湧著乳白靈液,你取瓶盛了數瓶帶走。'] },
    { id: 'demon', n: '魔窟血池', ic: '👺', el: 'fire', mod: '血氣沖天・道心點加成', hook: ['血池翻湧,殘魂哀嚎,你守住道心,從魔氣中淬出一線清明。', '魔窟盡頭有一塊斷碑,字跡殘缺,卻讓你對大道多了一分領悟。'] },
    { id: 'sea', n: '幻海蜃樓', ic: '🏝️', el: 'water', mod: '蜃樓幻影・靈石翻倍', hook: ['海市蜃樓中珠光璀璨,你分辨真幻,撈起沉船遺寶。', '潮退之時海底浮現古城,你趁天明前取走了滿袋珠玉。'] }
  ];
  const DIFF = [{ n: '普通', c: '#4ade80', p: .65, min: 12, f: 1 }, { n: '困難', c: '#fbbf24', p: .95, min: 24, f: 1.7 }, { n: '絕境', c: '#f87171', p: 1.4, min: 40, f: 2.6 }];
  const SRs = () => { if (!state.sr || typeof state.sr !== 'object') state.sr = {}; const s = state.sr; if (!s.runs) s.runs = {}; if (typeof s.streak !== 'number') s.streak = 0; if (!s.d) s.d = ''; if (!s.full) s.full = ''; if (!s.last) s.last = ''; return s; };
  const today = () => { const d = new Date(); return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); };
  const dstr = n => String(n);
  function yesterday() { const d = new Date(); d.setDate(d.getDate() - 1); return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); }
  function rng(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
  const unlocked = () => (state.realmIdx || 0) >= 1 && !!(window.UNLOCK9 && UNLOCK9.on('secret'));
  const avatarOn = () => (state.realmIdx || 0) >= 3 && !!(window.UNLOCK9 && UNLOCK9.on('avatar'));
  const tierNow = () => Math.min(7, Math.max(1, state.realmIdx || 1));
  function defs() {
    const d = today(), r = rng(d * 2654435761), ids = []; const bag = TPL.map((x, i) => i);
    while (ids.length < 3) { const k = Math.floor(r() * bag.length); ids.push(bag.splice(k, 1)[0]); }
    return ids.map((ti, i) => ({ key: d + ':' + i, i, ti, d: i, day: d }));
  }
  const rp = (t, d) => Math.floor(((CAL9 && CAL9.REC && CAL9.REC[t]) || 2300) * DIFF[d].p);
  const dur = (d, mode) => Math.round(DIFF[d].min * (mode === 'av' ? .6 : 1) * 60000);
  const pOK = (cp, need) => Math.max(.05, Math.min(.98, .75 + (cp / need - 1) * .8));
  function effStreak() { const s = SRs(); return (s.last === today() || s.last === yesterday()) ? (s.streak || 0) : 0; }
  function newDay() {
    const s = SRs(), d = today(); if (s.d === d) return;
    s.d = d; Object.keys(s.runs).forEach(k => { if (s.runs[k].s === 'claimed') delete s.runs[k]; });
  }
  const running = mode => Object.values(SRs().runs).filter(r => r.s === 'run' && r.mode === mode).length;
  function start(key, mode) {
    const s = SRs(), df = defs().find(x => x.key === key); if (!df || s.runs[key]) return;
    if (!unlocked()) { showToast('【秘境派遣】築基期開放。'); return; }
    if (mode === 'av' && !avatarOn()) { showToast('【化身】元嬰期開放。'); return; }
    if (running(mode) >= 1) { showToast(mode === 'av' ? '化身尚在外出,請等待歸來。' : '本尊尚在外出,請等待歸來。'); return; }
    const t = tierNow(), cp = calculateTotalStats().combatPower * (mode === 'av' ? .6 : 1);
    s.runs[key] = { s: 'run', t0: Date.now(), dur: dur(df.d, mode), cp, mode, ti: df.ti, d: df.d, t, roll: Math.random(), day: df.day };
    audio.init(); audio.playQiChime(); showToast(`${mode === 'av' ? '化身' : '本尊'}已前往【${TPL[df.ti].n}】`); saveGame(); render(true);
  }
  function outcome(r) { const need = rp(r.t, r.d), p = pOK(r.cp, need); return r.roll < p * .3 ? 'big' : r.roll < p ? 'ok' : 'fail'; }
  const bern = x => Math.floor(x) + (Math.random() < x - Math.floor(x) ? 1 : 0);
  X.srHooks = [];
  function rewards(r, extra) {
    const t = r.t, d = r.d, tp = TPL[r.ti], sb = X.sb(t), oc = outcome(r), om = oc === 'big' ? 1.6 : oc === 'ok' ? 1 : .3, m = (r.mode === 'av' ? .7 : 1) * om * (1 + Math.min(.5, .1 * effStreak())) * (r.arena ? 1.5 : 1) * (extra || 1);
    const R = { stones: sb * (6 + 6 * d), items: {}, tfrag: 2 + 2 * d, eggs: 0, dao: 0, rn: 0 };
    const addI = (k, n) => { if (ITEMS[k]) R.items[k] = (R.items[k] || 0) + n; };
    addI('hb_' + t, 3 + 3 * d); addI('bp_' + t, 2 + 2 * d);
    if (tp.id === 'ruin') { R.rn += 2 + d; R.tfrag *= 1.5; }
    else if (tp.id === 'herb') { R.items['hb_' + t] *= 2; addI('herb_' + Math.min(5, Math.max(1, t >= 5 ? 5 : t >= 2 ? 4 : t + 1)), 2 + d); }
    else if (tp.id === 'mine') { R.stones *= 1.5; addI(t >= 5 ? 'ore_4' : t >= 3 ? 'ore_3' : t >= 2 ? 'ore_2' : 'ore_1', 4 + 3 * d); }
    else if (tp.id === 'beast') { R.items['bp_' + t] *= 2; R.eggChance = .3 + .15 * d; }
    else if (tp.id === 'thunder') R.tfrag *= 2;
    else if (tp.id === 'pool') addI(t >= 1 ? 'yq_' + t : 'pill_1', 1 + d);
    else if (tp.id === 'demon') R.dao = 1 + d;
    else if (tp.id === 'sea') R.stones *= 2;
    R.rn += d >= 1 ? 1 : 0;
    const out = { stones: Math.floor(R.stones * m), tfrag: bern(R.tfrag * m), items: {}, eggs: 0, dao: bern(R.dao * m) };
    Object.keys(R.items).forEach(k => { const n = bern(R.items[k] * m); if (n) out.items[k] = n; });
    const rn = bern(R.rn * m); if (rn) out.items.rn_1 = (out.items.rn_1 || 0) + rn;
    if (Math.random() < ((R.eggChance || .12 + .06 * d) * (oc === 'fail' ? .3 : 1))) out.eggs = 1;
    if (d >= 1 && oc !== 'fail' && Math.random() < (d === 2 ? .6 : .25)) { const sl = pick(EQUIP_SLOTS), id = `eg_${sl}_${t}`; if (ITEMS[id]) out.items[id] = (out.items[id] || 0) + 1; }
    X.srHooks.forEach(f => { try { f(out, r, { oc, m }); } catch (e) { } });
    return { out, oc };
  }
  function story(r, oc) {
    const tp = TPL[r.ti], L = [pick(tp.hook)];
    if (oc === 'big') L.push('機緣巧合,你竟尋得隱藏的寶庫,滿載而歸!');
    else if (oc === 'ok') L.push('一路有驚無險,諸般收穫皆在預料之中。');
    else L.push('秘境兇險遠超預期,你負傷突圍,只帶回少許戰利品。');
    if (r.mode === 'av') L.push('(化身代行,神識分化,收穫略減。)');
    return L;
  }
  function claim(key) {
    const s = SRs(), r = s.runs[key]; if (!r || r.s !== 'done') return;
    const rw = rewards(r), lines = X.give(rw.out, true); r.s = 'claimed'; X.ST().sr++;
    if (rw.oc === 'fail') { state.hp = Math.max(1, Math.floor(calculateTotalStats().hp * .6)); }
    let bonus = null;
    const allDone = defs().every(d => s.runs[d.key] && s.runs[d.key].s === 'claimed');
    if (allDone && s.full !== today()) { s.streak = s.last === yesterday() ? (s.streak || 0) + 1 : 1; s.full = today(); s.last = today(); const sb = X.sb(r.t), b = { stones: sb * 12, items: { rn_1: 5 }, tfrag: 6, eggs: (state.realmIdx || 0) >= 3 ? 2 : 1, dao: 2, xian: r.t >= 4 ? (r.t - 3) * 2 : 0 }; bonus = X.give(b, true); }
    saveGame(); try { updateTopBar(); renderInventory(); } catch (e) { }
    window._srReport = { r, oc: rw.oc, lines, story: story(r, rw.oc), bonus, streak: effStreak() };
    X.open('srrep'); render(true);
  }
  X.sheet('srrep', '📜 秘境戰報', b => {
    const R = window._srReport; if (!R) return; const tp = TPL[R.r.ti], ocn = { big: ['大成功', '#f0abfc'], ok: ['成功', '#4ade80'], fail: ['負傷而歸', '#f87171'] }[R.oc];
    b.innerHTML = `<div style="text-align:center;font-size:34px">${tp.ic}</div><div style="text-align:center;font-weight:800;font-size:15px;color:#fcd34d">${tp.n}・${DIFF[R.r.d].n}</div><div style="text-align:center;font-weight:800;color:${ocn[1]};margin:4px 0 8px">${R.r.mode === 'av' ? '化身' : '本尊'} · ${ocn[0]}</div>
<div class="x5-cd" style="margin-bottom:8px">${R.story.map(x => `<p style="margin-bottom:4px">${x}</p>`).join('')}</div>
<div class="x5-cd"><b style="color:#fcd34d">戰利品</b>${R.lines.map(x => `<div>${x}</div>`).join('') || '<div class="x5-sub">空手而歸……</div>'}</div>
${R.bonus ? `<div class="x5-cd" style="margin-top:8px;border-color:#f59e0b"><b style="color:#fbbf24">🎊 今日三境圓滿!</b>${R.bonus.map(x => `<div>${x}</div>`).join('')}<div class="x5-sub">連日圓滿加成:每連續一天 +10% 收益(上限 +50%)。</div></div>` : ''}
<button class="x5-btn am" data-x5="close" data-id="srrep" style="width:100%;margin-top:10px">收下</button>`;
  });
  function speedCost(r) { const rem = Math.max(0, r.t0 + r.dur - Date.now()) / 60000; return Math.ceil(rem * Math.max(5, Math.floor(X.sb(r.t) * .25))); }
  function speed(key) { const r = SRs().runs[key]; if (!r || r.s !== 'run') return; const c = speedCost(r); if (state.stones < c) { showToast(`靈石不足,催動需 ${fmt(c)}。`); return; } state.stones -= c; r.t0 -= r.dur; tick(); showToast('靈符催動,探索瞬間完成!'); saveGame(); }
  /* ---------- 介面 ---------- */
  const st = document.createElement('style');
  st.textContent = `#sr17{background:linear-gradient(160deg,#0c1a2b,#0b1220);border:1px solid #155e75;border-radius:12px;padding:10px}
#sr17 .h{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;font-family:'Noto Serif TC',serif;font-weight:800;font-size:13px;color:#67e8f9}
.sr-c{background:#0f172a;border:1px solid #1e293b;border-radius:10px;padding:8px;margin-bottom:6px;font-size:11px;color:#cbd5e1}
.sr-c .r1{display:flex;gap:8px;align-items:center}.sr-c .ic{font-size:26px;width:34px;text-align:center}.sr-c .nm{font-weight:800;font-size:13px;color:#e2e8f0}
.sr-c .bd{font-size:10px;font-weight:800;padding:0 5px;border-radius:4px;border:1px solid;margin-left:4px}
.sr-c .bt{display:flex;gap:6px;margin-top:6px}.sr-c .bt button{flex:1}
.sr-c.dn{border-color:#f59e0b;box-shadow:0 0 10px rgba(245,158,11,.25)}`;
  document.head.appendChild(st);
  let _sig = '';
  const mm = ms => { const s = Math.max(0, Math.ceil(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
  function mount() {
    let c = $('sr17'); if (c) return c; const bm = $('battle-modal'); if (!bm) return null;
    c = document.createElement('div'); c.id = 'sr17'; bm.parentNode.insertBefore(c, bm.nextSibling); return c;
  }
  function render(force) {
    const c = mount(); if (!c || !c.offsetParent) return; const s = SRs(), now = Date.now(), cp = calculateTotalStats().combatPower;
    const sig = JSON.stringify([s.d, Object.keys(s.runs).map(k => [k, s.runs[k].s, s.runs[k].s === 'run' ? Math.ceil((s.runs[k].t0 + s.runs[k].dur - now) / 1000) : 0]), effStreak(), unlocked(), avatarOn(), Math.floor(cp / 50), !!window.TB26]);
    if (!force && sig === _sig) return; _sig = sig;
    if (!unlocked()) { const lk = (state.realmIdx || 0) >= 1; c.innerHTML = '<div class="h"><span>🚪 每日秘境</span><span class="x5-sub">' + (lk ? '機緣未到' : '築基期開放') + '</span></div><div class="x5-sub">' + (lk ? '山門外的靈潮已有異動,隨劇情推進,三處小洞天便會為你開啟。(點右上 📖)' : '修至築基期後,可每日派遣本尊(元嬰期起另有化身)探索三處秘境,離線也會繼續。') + '</div>'; return; }
    const df = defs(), t = tierNow(); let done = 0; df.forEach(d => { if (s.runs[d.key] && s.runs[d.key].s === 'claimed') done++; });
    const olds = Object.keys(s.runs).filter(k => !df.some(d => d.key === k) && s.runs[k].s !== 'claimed');
    const card = (key, ti, d, r, tt) => {
      const tp = TPL[ti], dd = DIFF[d], need = rp(tt, d), p = pOK(cp, need), pc = p >= .75 ? '#4ade80' : p >= .45 ? '#fbbf24' : '#f87171';
      let body = '';
      if (!r) {
        body = `<div class="bt"><button class="x5-btn" data-x5="sr.go" data-k="${key}" data-m="self">🧘 本尊派遣 ${dd.min}分</button><button class="x5-btn ${avatarOn() ? 'am' : 'gy'}" data-x5="sr.go" data-k="${key}" data-m="av" ${avatarOn() ? '' : 'disabled'}>${avatarOn() ? `🌀 化身 ${Math.round(dd.min * .6)}分` : '🔒 化身(元嬰)'}</button>${window.TB26 ? `<button class="x5-btn x5rd" data-x5="sr.arena" data-k="${key}">⚔ 親征</button>` : ''}</div>`;
      } else if (r.s === 'run') {
        const left = r.t0 + r.dur - now, pr = Math.min(100, (1 - left / r.dur) * 100);
        body = `<div class="x5-bar" style="margin-top:6px"><i style="width:${pr}%"></i></div><div class="x5-row" style="justify-content:space-between;margin-top:4px"><span>${r.mode === 'av' ? '🌀化身' : '🧘本尊'}探索中 剩 <b style="color:#fcd34d">${mm(left)}</b></span><button class="x5-btn gy" data-x5="sr.fast" data-k="${key}" style="padding:3px 8px">⚡催動(${fmt(speedCost(r))})</button></div>`;
      } else if (r.s === 'done') body = `<div class="bt"><button class="x5-btn am" data-x5="sr.claim" data-k="${key}">📜 領取戰報</button></div>`;
      else body = '<div class="x5-sub" style="margin-top:4px;color:#4ade80">✅ 今日已完成</div>';
      return `<div class="sr-c ${r && r.s === 'done' ? 'dn' : ''}"><div class="r1"><div class="ic">${tp.ic}</div><div style="flex:1;min-width:0"><div class="nm">${tp.n}<span class="bd" style="color:${dd.c};border-color:${dd.c}88">${dd.n}</span></div><div class="x5-sub">${tp.mod}</div><div class="x5-sub">建議戰力 <b>${fmt(need)}</b>・你的 <b style="color:${pc}">${fmt(cp)}</b>(成功率約 ${Math.round(p * 100)}%)</div></div></div>${body}</div>`;
    };
    let h = `<div class="h"><span>🚪 每日秘境・派遣</span><span class="x5-sub">今日 ${done}/3・連日圓滿 ${effStreak()} 天(+${Math.min(50, effStreak() * 10)}%)</span></div>`;
    h += olds.map(k => { const r = s.runs[k], tp = TPL[r.ti]; return card(k, r.ti, r.d, r, r.t); }).join('');
    h += df.map(d => card(d.key, d.ti, d.d, s.runs[d.key], t)).join('');
    h += `<div class="x5-sub">山門外的地脈隨靈潮每日開闔,化作三處小洞天;元嬰出竅後,更可遣化身代行。每日 0 點刷新三處秘境。派遣期間離線也會繼續;失敗不會損失物品,但會負傷並減少收益。三境全數完成有額外大禮。</div>`;
    c.innerHTML = h;
  }
  X.act('sr.go', t => start(t.dataset.k, t.dataset.m));
  X.act('sr.fast', t => speed(t.dataset.k));
  X.act('sr.claim', t => claim(t.dataset.k));
  X.act('sr.arena', t => { if (window.TB26) TB26.startSecret(t.dataset.k); });
  function tick() {
    try {
      newDay(); const s = SRs(), now = Date.now();
      Object.keys(s.runs).forEach(k => { const r = s.runs[k]; if (r.s === 'run' && now >= r.t0 + r.dur) { r.s = 'done'; showToast(`🗺️ ${r.mode === 'av' ? '化身' : '本尊'}自【${TPL[r.ti].n}】歸來,可領取戰報!`); try { audio.playQiChime(); } catch (e) { } saveGame(); } });
      render(false);
    } catch (e) { console.warn('x17', e); }
  }
  { XT.flags87Secret = function (f) { try { if (Object.values(SRs().runs).some(r => r.s === 'done')) f['tab-adventure'] = true; } catch (e) { } }; }   // 由 redFlags 呼叫
  X.addTitle('t_s1', '秘境行者', '完成秘境探索 30 次', () => [X.ST().sr, 30], { dropP: .03, stoneP: .02 }, '#67e8f9');
  X.addTitle('t_s2', '洞天福地', '完成秘境探索 200 次', () => [X.ST().sr, 200], { dropP: .06, stoneP: .04, qiP: .03 }, '#67e8f9');
  X.addTitle('t_s3', '日日精進', '連日三境圓滿 7 天', () => [effStreak(), 7], { atkP: .03, defP: .03 }, '#4ade80');
  X.reTBY();
  X.act('x17.noop', () => { });
  setTimeout(tick, 800); setInterval(tick, 1000);
  window.SR17 = { TPL, DIFF, defs, rp, pOK, rewards, claim, start, outcome, TIER: tierNow, arenaDone: (key, win) => { const s = SRs(), df = defs().find(x => x.key === key); if (!df || s.runs[key]) return false; s.runs[key] = { s: 'done', t0: Date.now(), dur: 0, cp: calculateTotalStats().combatPower, mode: 'self', ti: df.ti, d: df.d, t: tierNow(), roll: win ? .01 : .99, day: df.day, arena: 1 }; saveGame(); render(true); return true; } };
})();


