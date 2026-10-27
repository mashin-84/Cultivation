/* ===== v160 體驗修正:戰力提升入口・卡關時的離線收益・指引列改版・奇遇當場處理 ===== */
(() => {
  const $ = id => document.getElementById(id), X = window.X5, fmt = n => formatNum(Math.floor(n));
  const vis = e => { if (!e) return false; const r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.display !== 'none' && s.visibility !== 'hidden'; };
  const css = document.createElement('style');
  css.textContent = `
/* 指引列(取代原本的新手氣泡條與自動歷練狀態列) */
#tutorial-guide-banner.g160{display:flex!important;align-items:center;gap:8px;margin-top:6px;padding:7px 8px 7px 10px!important;border-radius:12px!important;
  background:linear-gradient(90deg,#fff1cf,#f6dfa8)!important;border:1.5px solid #c9962f!important;box-shadow:0 2px 6px rgba(120,80,20,.18);color:#5a3a0c!important;cursor:pointer}
#tutorial-guide-banner.g160.hidden{display:none!important}
#tutorial-guide-banner.g160 .gi{flex:none;width:30px;height:30px;border-radius:50%;background:#b45309;color:#fff;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:900;box-shadow:0 0 0 2px #fde68a}
#tutorial-guide-banner.g160 .gm{flex:1;min-width:0}
#tutorial-guide-banner.g160 .gt{font-size:13.5px;font-weight:800;line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
#tutorial-guide-banner.g160 .ga{font-size:12px;color:#0f766e;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:1px}
#tutorial-guide-banner.g160 .ga:empty{display:none}
#tutorial-guide-banner.g160 .gb{flex:none;min-height:44px;min-width:56px;padding:0 12px;border-radius:10px;background:#b45309;color:#fff;font-weight:900;font-size:14px;border:1px solid #f59e0b}
#tutorial-guide-banner.g160.fl{animation:g160f 1.4s ease-out}
@keyframes g160f{0%{box-shadow:0 0 0 0 rgba(245,158,11,.9)}30%{transform:scale(1.02)}100%{box-shadow:0 0 0 14px rgba(245,158,11,0)}}
#auto-explore-status-bar,#btn-pending-events,#btn-events-batch{display:none!important}
/* 人物頁「戰力提升」 */
.pu160{position:relative;display:inline-flex;align-items:center;gap:3px;margin-top:4px;min-height:34px;padding:0 10px;border-radius:9px;background:linear-gradient(180deg,#d97706,#b45309);color:#fff;font-weight:900;font-size:12.5px;border:1px solid #f59e0b;box-shadow:0 1px 3px rgba(0,0,0,.25)}
.pu160 .rd{position:absolute;top:-4px;right:-4px;width:10px;height:10px;border-radius:50%;background:#ef4444;box-shadow:0 0 0 2px #fff}
.lb160{display:block;width:100%;margin-top:8px;min-height:44px;border-radius:10px;font-weight:900;font-size:14px;background:#b45309;color:#fff;border:1px solid #f59e0b}
.ofg160{margin-top:8px;padding:8px;border-radius:10px;background:rgba(180,83,9,.08);border:1px solid rgba(180,83,9,.35);font-size:12.5px;text-align:left;line-height:1.5}`;
  document.head.appendChild(css);

  /* ================= 1. 溢出修為不白費:超過氣海上限的部分化為道行與器紋石 ================= */
  const OV = () => { if (!state.ovf160 || typeof state.ovf160 !== 'object') state.ovf160 = { q: 0, dao: 0, rn: 0 }; return state.ovf160; };
  {
    const og = QG.govern; let ref = null, L = 0;
    QG.govern = function () {
      try {
        if (ref === state && Number.isFinite(state.qi)) {
          const d = state.qi - L;
          if (d > 0) {
            const max = getRealmInfo().maxQi, cap = max * QI_RESERVE_MULT, full = Math.min(d, Math.max(0, max - L));
            const v = L + full + (d - full) * QI_OVERFLOW_RATE, kept = Math.min(v, Math.max(cap, L));
            if (v > kept) {   /* 以「本層氣海」為單位累計;每小時最多累計 2 份,避免低境界時一晚換到一大堆 */
              const o = OV(), now = Date.now(); if (typeof o.b !== 'number') { o.b = 2; o.bt = now; }
              o.b = Math.min(24, o.b + (now - (o.bt || now)) / 36e5 * 2); o.bt = now;
              const add = Math.min(o.b, (v - kept) / Math.max(1, max)); o.q += add; o.b -= add;
            }
          }
        }
      } catch (e) { }
      const r = og.apply(this, arguments); ref = state; L = state.qi; return r;
    };
  }
  /* 每累計 0.5 份氣海 → 道行 +1(築基後才有道行);每 1.5 份 → 器紋石 +1 */
  function convert() {
    const o = OV(); let dao = 0, rn = 0, st = 0;
    if (o.q >= .5) {
      const u = Math.floor(o.q / .5); o.q -= u * .5;
      /* 道行在築基、器紋石在煉器開啟後才用得上;之前一律折成靈石 */
      if ((state.realmIdx || 0) >= 1 && window.SCH19 && SCH19.gainDao) { SCH19.gainDao(u); dao = u; } else st += u * Math.max(20, Math.floor(X.sb() * .5));
      o.rq = (o.rq || 0) + u; const r = Math.floor(o.rq / 3); o.rq -= r * 3;
      if (r) { if (window.UNLOCK9 && UNLOCK9.on('forge')) { state.inventory.rn_1 = (state.inventory.rn_1 || 0) + r; rn = r; } else st += r * Math.max(20, Math.floor(X.sb() * .5)); }
      if (st) state.stones += st;
      o.dao += dao; o.rn += rn; o.st = (o.st || 0) + st;
    }
    return { dao, rn, st };
  }
  setInterval(() => { try { const g = convert(); if (g.dao || g.rn) { try { X.dirty && X.dirty(); } catch (e) { } } } catch (e) { } }, 5000);

  /* ================= 2. 戰力提升:卡在哪、差多少 ================= */
  function gateInfo() {
    try {
      if (!window.BK160) return null; const T = BK160.target(); if (!T.gate) return null;
      const a = AREAS_DATA[T.t]; if (!a) return null; const b = a.monsters.find(m => m.isBoss) || a.monsters[a.monsters.length - 1];
      return { i: T.t, area: a.name, boss: b ? b.name : '境主', cp: BK160.cp(), rec: BK160.rec() };
    } catch (e) { return null; }
  }
  /* 離線結算:修為已滿時說清楚卡在哪,並給「戰力提升」入口;溢出部分顯示換到了什麼 */
  {
    const og = checkOfflineGains;
    checkOfflineGains = function () {
      const o0 = Object.assign({}, OV()), m = $('modal-offline'), was = m && !m.classList.contains('hidden');
      const r = og.apply(this, arguments);
      try {
        if (!m || m.classList.contains('hidden') || was) return r;
        const g = convert(), o1 = OV(), dao = (o1.dao - (o0.dao || 0)), rn = (o1.rn - (o0.rn || 0)), st2 = ((o1.st || 0) - (o0.st || 0));
        const qiEl = $('offline-gain-qi'); let box = $('ofg160');
        if (!box) { box = document.createElement('div'); box.id = 'ofg160'; box.className = 'ofg160'; const ref = qiEl && qiEl.closest('.space-y-1, .rounded-lg, div'); (ref && ref.parentElement ? ref.parentElement : m.firstElementChild).appendChild(box); }
        let h = '';
        if (qiEl && /^\+0$/.test(qiEl.innerText.trim())) qiEl.innerText = '氣海已滿';
        const parts = [dao ? `<b>道行 +${dao}</b>` : '', rn ? `<b>器紋石 +${rn}</b>` : '', st2 ? `<b>靈石 +${fmt(st2)}</b>` : ''].filter(Boolean);
        if (parts.length) h += `<div>溢出的靈氣沉入經脈,化為:${parts.join('、')}</div>`;
        const G = gateInfo();
        if (G && state.qi >= getRealmInfo().maxQi) h += `<div style="margin-top:4px">修為已圓滿,但仍須在【${G.area}】斬殺境主【${G.boss}】才能突破。<br>你的戰力 <b>${fmt(G.cp)}</b>${G.rec ? ` ／ 建議 <b>${fmt(G.rec)}</b>` : ''}</div>${G.rec && G.cp < G.rec ? '<button class="lb160" data-x5="of160.bk">⚡ 查看戰力提升</button>' : ''}`;
        box.innerHTML = h; box.style.display = h ? '' : 'none';
      } catch (e) { }
      return r;
    };
    X.act('of160.bk', () => { const m = $('modal-offline'); if (m) m.classList.add('hidden'); setTimeout(() => { try { BK160.open(); } catch (e) { } }, 120); });
  }
  /* 人物頁的「戰力提升」按鈕(有可做的提升時亮紅點,紅點也會傳到底部「人物」分頁) */
  let okN = 0, okT = 0;
  function okCount() {
    if (Date.now() - okT < 4000) return okN; okT = Date.now();
    try { const c0 = Math.max(1, BK160.cp()); okN = BK160.ok().filter(x => x.nav || x.gain / c0 >= .02).length; } catch (e) { okN = 0; }
    return okN;
  }
  function puBtn() {
    const hd = document.querySelector('#ch51 .hd'), cp = hd && hd.querySelector('.cp'); if (!cp) return;
    let b = $('pu160');
    if (!b) { b = document.createElement('button'); b.id = 'pu160'; b.className = 'pu160'; b.dataset.x5 = 'bk.open'; cp.insertAdjacentElement('afterend', b); }
    const n = window.BK160 ? okCount() : 0, h = `⚡ 戰力提升${n ? '<i class="rd"></i>' : ''}`;
    if (b.dataset.h !== h) { b.dataset.h = h; b.innerHTML = h; }
  }
  setInterval(() => { try { puBtn(); } catch (e) { } }, 1500);
  /* 歷練打輸:結果視窗多一顆「查看戰力提升」 */
  {
    const og = showBattleResultModal;
    showBattleResultModal = function (isWin) {
      const B = currentBattle;
      const r = og.apply(this, arguments);
      try {
        let b = $('lb160');
        if (!b) { const box = $('battle-result-loot-box'); if (box) { box.insertAdjacentHTML('afterend', '<button id="lb160" class="lb160" data-x5="lb160.go">⚡ 打不過?看看怎麼變強</button>'); b = $('lb160'); } }
        if (b) b.style.display = !isWin && B && !B.isTower && !B.isWB && !B.isDemonTrib && !B.isJie ? '' : 'none';
      } catch (e) { }
      return r;
    };
    X.act('lb160.go', () => { const c = $('btn-close-battle-result'); if (c) c.click(); else { const m = $('modal-battle-result'); if (m) m.classList.add('hidden'); } setTimeout(() => { try { BK160.open(); } catch (e) { } }, 150); });
  }

  /* ================= 3. 指引列:跟著實際進度走,卡太久就換成「現在最該做的事」 ================= */
  const GS = () => { if (!state.g160 || typeof state.g160 !== 'object') state.g160 = { k: '', s: 0 }; return state.g160; };
  function storyNext() {
    try {
      const A = window.ST28; if (!A || !A.nodes) return null; const s = A.S(), seen = id => !!s.seen[id];
      const ok = f => { try { return !f || f(); } catch (e) { return false; } };
      const m = A.nodes.find(n => !n.opt && !seen(n.id)); if (m && ok(m.at)) return (A.before && A.before(m)) || m;   /* v189 依層數 */
      return A.nodes.find(n => n.opt && !seen(n.id) && (!n.after || seen(n.after)) && ok(n.at)) || null;
    } catch (e) { return null; }
  }
  const NEWBIE = ['點洞府中央的【吐納聚氣】,累積修為', '點【聚】升級聚靈陣,吐納會更快', '到【歷練】打第一場仗:青雲後山', '到【丹器】煉第一爐聚氣丹'];
  function goTab(t, after) { try { goToTab(t); } catch (e) { } if (after) setTimeout(after, 180); }
  /* 看劇情:正在戰鬥中(自動歷練)就等這一場打完再開始 */
  let wantStory = null;
  function playStory(id) {
    if (currentBattle && !(window.HO43 && HO43.yieldBattle())) { wantStory = id; try { showToast('這一場打完,劇情就開始。'); } catch (e) { } return; }
    $('btn-story28').click(); setTimeout(() => { const b = document.querySelector(`[data-x5="st28.play"][data-id="${id}"]`); if (b) b.click(); }, 200);
  }
  setInterval(() => { if (wantStory && !currentBattle && !(window.ST28 && ST28.busy())) { const id = wantStory; wantStory = null; playStory(id); } }, 400);
  function pick() {
    const brkB = $('btn-trigger-breakthrough');
    /* 1. 新劇情 */
    const sn = !(window.ST28 && ST28.busy()) && storyNext();
    if (sn && $('btn-story28') && $('btn-story28').classList.contains('dot')) return { k: 'st:' + sn.id, ic: '卷', t: `${window.SJ172 && SJ172.has(sn) ? '生死交鋒將至' : '新的劇情'}:〈${sn.title}〉`, go: () => playStory(sn.id) };
    /* 2. 新手四步 */
    /* 新手四步:實際做過就算完成(劇情引導裡可能先做了後面的步驟) */
    try { const S = X.ST(); let s = state.tutorialStep || 0;
      if (s === 0 && (S.taps || 0) > 0) s = 1; if (s === 1 && (state.arrayLevel || 1) > 1) s = 2; if (s === 2 && (S.kills || 0) > 0) s = 3; if (s === 3 && (S.craft || 0) > 0) s = 4;
      if (s !== (state.tutorialStep || 0) && (state.tutorialStep || 0) < 4) state.tutorialStep = s; } catch (e) { }
    const ts = state.tutorialStep || 0;
    if (ts < 4) {
      if (ts === 3 && window.UNLOCK9 && !UNLOCK9.on('alch')) return { k: 'nb3', ic: '修', t: '修煉到【練氣第5層】,煉丹閣就會開啟', go: () => goTab('tab-abode') };
      return { k: 'nb' + ts, ic: String(ts + 1), t: NEWBIE[ts], go: () => goTab(['tab-abode', 'tab-abode', 'tab-adventure', 'tab-crafting'][ts], () => { const e = ts === 0 ? $('btn-tap-cultivate') : ts === 1 ? document.querySelector('[data-a53=arr]') : null; if (e) e.scrollIntoView({ block: 'center' }); }) };
    }
    /* v173 大境界圓滿、仍有必看劇情 */
    try { const ri = getRealmInfo(); if (state.qi >= ri.maxQi && (state.subRealm || 1) >= ri.realm.subMax && window.ST28 && ST28.req) { const L = ST28.req(); if (L.length) return { k: 'req', ic: '卷', t: `突破前還有 ${L.length} 段劇情未看:〈${L[0].title}〉`, go: () => playStory(L[0].id) }; } } catch (e) { }
    /* 3. 可以突破 */
    if (brkB && !brkB.disabled && state.qi >= getRealmInfo().maxQi && !gateInfo()) return { k: 'brk', ic: '破', t: '修為圓滿,可以突破了!', go: () => goTab('tab-abode', () => { const b = $('btn-trigger-breakthrough'); if (b) b.scrollIntoView({ block: 'center' }); }) };
    /* 4. 卡在境界見證 */
    const G = gateInfo();
    if (G && state.qi >= getRealmInfo().maxQi) {
      if (G.cp < G.rec) return { k: 'gate', ic: '力', t: `斬殺【${G.boss}】才能突破・戰力 ${fmt(G.cp)}/${fmt(G.rec)},先變強`, go: () => BK160.open() };
      return { k: 'gate2', ic: '戰', t: `生死交鋒:前往【${G.area}】斬殺境主【${G.boss}】`, go: () => goTab('tab-adventure', () => { const b = document.querySelector(`[data-area="${G.i}"]`); if (b) b.click(); }) };
    }
    /* 5. 修行指引任務鏈(同一步卡超過 15 分鐘,改指向最划算的戰力提升) */
    const g = GS(), n = window.GD9X && GD9X.next();
    let top = null; try { const c0 = Math.max(1, BK160.cp()); top = BK160.ok().find(x => !x.nav && x.gain / c0 >= .03) || null; } catch (e) { }
    if (n && !(g.k === 'gd:' + n.id && g.s > 900 && top)) return { k: 'gd:' + n.id, ic: '引', t: n.d, go: () => { try { n.go(); } catch (e) { } } };
    /* 6. 現在最划算的戰力提升 */
    if (top) return { k: 'bk', ic: '力', t: `可以變強:${top.n.replace(/<[^>]+>/g, '')}`, go: () => BK160.open() };
    return null;
  }
  let curG = null;
  function render() {
    const bn = $('tutorial-guide-banner'); if (!bn) return;
    if (!bn.classList.contains('g160')) {
      bn.className = 'g160'; bn.innerHTML = '<div class="gi"></div><div class="gm"><div class="gt"></div><div class="ga"></div></div><button class="gb" id="tut-go">前往</button>';
      bn.addEventListener('click', e => {
        if (e.target.closest('.ga')) { goTab('tab-adventure'); return; }
        if (curG && curG.go) curG.go();
      });
    }
    curG = pick();
    const ga = bn.querySelector('.ga'), at = state.autoExplore ? (typeof autoStatusLine === 'function' ? autoStatusLine() : '自動歷練中') : '';
    if (ga.textContent !== at) ga.textContent = at;
    if (!curG) { bn.classList.toggle('hidden', !at); bn.querySelector('.gt').textContent = at ? '' : ''; bn.querySelector('.gi').textContent = '歷'; bn.querySelector('.gb').style.display = at ? 'none' : ''; if (at) { curG = { go: () => goTab('tab-adventure') }; } return; }
    bn.classList.remove('hidden'); bn.querySelector('.gb').style.display = '';
    const gt = bn.querySelector('.gt'); if (gt.textContent !== curG.t) { gt.textContent = curG.t; bn.classList.remove('fl'); void bn.offsetWidth; bn.classList.add('fl'); }
    bn.querySelector('.gi').textContent = curG.ic;
    const g = GS(); if (g.k !== curG.k) { g.k = curG.k; g.s = 0; }
  }
  updateTutorialBanner = function () { try { render(); } catch (e) { } };
  setInterval(() => { try { if (document.visibilityState === 'visible') GS().s += 2; render(); } catch (e) { } }, 2000);
  setTimeout(() => { try { render(); } catch (e) { } }, 600);

  /* ================= 4. 奇遇:不再存進奇遇簿,遇到時當場處理 ================= */
  function autoResolve(entry, quiet) {
    const ev = CHOICE_EVENTS[entry.idx]; if (!ev) return null;
    const area = AREAS_DATA[entry.areaId] || AREAS_DATA[state.currentArea] || AREAS_DATA[0];
    let res = null; try { res = ev.actionB(area); } catch (e) { res = null; }
    res = res || { ok: null, title: '機緣已逝', gains: [] };
    if (!quiet) { try { logAdventure(`<span class="text-amber-300">🏮 奇遇【${ev.title}】:${ev.choiceB} → ${res.title || ''}${res.gains && res.gains.length ? '(' + res.gains.join('、') + ')' : ''}</span>`); } catch (e) { } }
    return res;
  }
  triggerEventChoice = function (area) {
    const idx = window.pickEventIdx ? pickEventIdx() : Math.floor(Math.random() * CHOICE_EVENTS.length);
    /* 手動歷練且就在歷練頁:當場跳出事件卡讓玩家選;自動歷練中:照穩妥的選項自動處理,寫進紀事 */
    if (!state.autoExplore && isOnAdventureTab() && !eventModalOpen()) { presentChoiceEvent(idx, state.currentArea, null); return; }
    const res = autoResolve({ idx, areaId: state.currentArea });
    if (res) { try { adventureNotice(`🏮 奇遇【${CHOICE_EVENTS[idx].title}】已自動處理`); } catch (e) { } }
    try { updateTopBar(); renderInventory(); } catch (e) { } saveGame();
  };
  /* 舊存檔裡排隊的奇遇:讀檔後一次處理完 */
  setTimeout(() => {
    try {
      const L = (state.pendingEvents || []).slice(); if (!L.length) return; state.pendingEvents = [];
      let n = 0; L.forEach(e => { if (autoResolve(e)) n++; });
      try { updateTopBar(); renderInventory(); } catch (e) { } saveGame();
      if (n) showToast(`🏮 奇遇簿已收起:舊奇遇 ${n} 件已自動處理,收穫已入袋(詳見歷練紀事)。`);
    } catch (e) { }
  }, 2500);
  { const og = renderAutoStatusBar; renderAutoStatusBar = function () { try { return og.apply(this, arguments); } catch (e) { } }; }
  /* v168 點壽元:說明主線未了之前不會壽盡 */
  document.addEventListener('click', e => { const a = e.target.closest && e.target.closest('#res-lifespan'); if (!a) return;
    try { showToast((window.ST28 && ST28.S().ending) ? '壽元:真實時間每 10 分鐘長一歲,壽盡則坐化輪迴。' : '壽元:每突破大境界都會增加。主線未了之前,灰珠會護住你的真靈——不會壽盡坐化,安心修煉。'); } catch (er) { } });
  { const s = document.createElement('style'); s.textContent = '#res-lifespan{cursor:pointer;text-decoration:underline dotted;text-underline-offset:3px}'; document.head.appendChild(s); }
  window.G160 = { pick, render, convert, gateInfo };
})();
