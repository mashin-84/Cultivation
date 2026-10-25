/* ===== v160 介面:字級下限 12px・小按鈕加大點擊區・紅點分「新出現/可操作」兩種・歷練區域標題同步・多餘材料・卡關時的修為丹・離線資源下載 ===== */
(() => {
  const $ = id => document.getElementById(id), X = window.X5, fmt = n => formatNum(Math.floor(n));
  const css = document.createElement('style');
  css.textContent = `
#btn-story28,#btn-menu25{min-width:42px!important;min-height:40px!important}
#btn-edit-name{min-width:36px!important;min-height:40px!important}
#btn-clear-log,[data-log13]{min-height:40px!important;min-width:44px!important;font-size:13px!important}
#btn-use-heal,#btn-auto-pill{min-height:40px!important}
.inv13-chips button,#cr52 .chips button,[data-k52],[data-s52],[data-c13]{min-height:38px!important}
/* 紅點:淡色 = 早就在那、可以做但不急;亮紅 = 新出現 */
.rd.f160,.dot25.f160,.x5-dot.f160,.rd14.f160{background:#f59e0b!important;opacity:.55;transform:scale(.8);box-shadow:none!important;animation:none!important}
#btn-story28.dot.f160::after{background:#f59e0b!important;opacity:.55}
`;
  document.head.appendChild(css);

  /* ---------- 1. 字級下限:畫面上小於 12px 的文字一律放大到 12px(戰鬥畫面、劇情、標題頁、圖示數字除外) ---------- */
  const SKIP = '#bf113,#st28,#title34,#thu160,#tut160,svg,.ct,.bx,.dot25,.rd,.x5-dot,i.ii,.em,#battle-stage,.bf-num';
  const seen = new WeakSet();
  function bump(root) {
    const list = root.querySelectorAll ? root.querySelectorAll('*') : [];
    for (const e of list) {
      if (seen.has(e)) continue; seen.add(e);
      if (!e.firstChild || e.closest(SKIP)) continue;
      let txt = false; for (const n of e.childNodes) if (n.nodeType === 3 && n.textContent.trim()) { txt = true; break; }
      if (!txt) continue;
      const f = parseFloat(getComputedStyle(e).fontSize); if (f > 0 && f < 12) e.style.setProperty('font-size', '12px', 'important');
    }
  }
  let pend = new Set(), tm = 0;
  new MutationObserver(ms => { for (const m of ms) m.addedNodes.forEach(n => { if (n.nodeType === 1) pend.add(n); }); if (!tm) tm = setTimeout(() => { tm = 0; const L = [...pend]; pend.clear(); L.forEach(n => { if (document.contains(n)) { seen.delete(n); bump(n.parentElement || n); } }); }, 400); }).observe(document.body, { childList: true, subtree: true });
  setTimeout(() => bump(document.body), 1500);

  /* ---------- 2. 紅點兩種:玩家看過的位置上一直亮著的紅點改成淡色;新出現的維持亮紅 ---------- */
  const RD = '.rd,.x5-dot,.rd14,[data-dot="1"]';
  const SN = () => { if (!Array.isArray(state.rd160)) state.rd160 = []; return state.rd160; };
  const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight; };
  function keyOf(d) {
    const h = d.closest('button,[data-x5],[data-a51],[data-a53],[data-a54],[data-c52],[data-m6],[data-n25]') || d.parentElement; if (!h) return '';
    const a = [...h.attributes].filter(x => /^data-(x5|a51|a53|a54|c52|m6|k|id|s51|n25|i13|r52)$/.test(x.name)).map(x => x.name + '=' + x.value).join('&');
    return (h.closest('[id^=tab-],[id^=x5s-],#ch51,#ab53r,#nav25') || {}).id + '|' + (a || (h.textContent || '').trim().slice(0, 8));
  }
  let lastTab = '', tabT = 0;
  const MAP = { 'tab-abode': ['tab-abode', 'ab53r'], 'tab-techniques': ['tab-techniques', 'ch51', 'pc44', 'bk51'], 'tab-adventure': ['tab-adventure'], 'tab-crafting': ['tab-crafting'], 'tab-inventory': ['tab-inventory'], 'tab-records': ['tab-records', 'tab-sect'] };
  const TAB = {}; Object.keys(MAP).forEach(t => MAP[t].forEach(c => { TAB[c] = t; }));
  function dots() {
    const S = SN(), set = new Set(S), tab = (document.querySelector('.tab-panel:not(.hidden)') || {}).id || '';
    if (tab !== lastTab) { lastTab = tab; tabT = Date.now(); }
    const settled = Date.now() - tabT > 2500, unseen = {}, live = new Set();
    document.querySelectorAll(RD).forEach(d => {
      if (d.closest('#nav25') || getComputedStyle(d).display === 'none') return;
      const k = keyOf(d); if (!k) return; live.add(k);
      const c = k.split('|')[0], t = TAB[c] || (c && c.indexOf('x5s-') === 0 ? 'sheet' : '');
      const onPage = d.getClientRects().length > 0 && (t === tab || t === 'sheet');
      if (onPage && settled && !set.has(k)) { S.push(k); set.add(k); }   /* 所在頁面開著超過 2.5 秒 = 看過 */
      const old = set.has(k); d.classList.toggle('f160', old);
      if (!old && t) unseen[t] = 1;
    });
    /* 看過但已經消失的紅點從清單移除,之後再出現就又是「新的」 */
    for (let i = S.length - 1; i >= 0; i--) if (!live.has(S[i])) S.splice(i, 1);
    if (S.length > 400) S.splice(0, S.length - 400);
    /* 底部分頁:裡面有新的紅點 → 亮紅;只剩看過的 → 淡色 */
    document.querySelectorAll('#nav25 [data-n25]').forEach(b => { const d = b.querySelector('.dot25'); if (d) d.classList.toggle('f160', !unseen[b.dataset.n25]); });
  }
  setInterval(() => { try { dots(); } catch (e) { } }, 1200);

  /* ---------- 3. 歷練頁區域標題:跟著目前區域走 ---------- */
  setInterval(() => {
    try {
      if (state.towerMode) return; const a = AREAS_DATA[state.currentArea || 0], el = $('current-area-title'); if (!a || !el) return;
      const want = `${a.name} (${(REALM_DATA[a.realmReq] || {}).name || ''})`; if (el.innerText !== want) { el.innerText = want; const d = $('current-area-desc'); if (d) d.innerText = a.desc; }
    } catch (e) { }
  }, 700);

  /* ---------- 4. 多餘材料:行囊的「賣材」—— 有乾坤熔爐就開熔爐(可設保留量、自動煉化),否則把每種超過 30 個的材料賣成靈石 ---------- */
  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('[data-a54="smat"]'); if (!b) return;
    e.stopImmediatePropagation(); e.preventDefault();
    if (window.UNLOCK9 && UNLOCK9.on('forge')) { X.open('fn'); return; }
    const inv = state.inventory || {}; let n = 0, st = 0;
    Object.keys(inv).forEach(k => { const it = ITEMS[k]; if (!it || it.type !== 'material' || k === 'rn_1' || !(it.price > 0)) return; const x = inv[k] - 30; if (x > 0) { n += x; st += x * it.price; inv[k] -= x; } });
    if (!n) { showToast('每種材料都還不到 30 個,先留著吧。'); return; }
    state.stones += st; try { audio.playQiChime(); } catch (er) { } showToast(`賣出多餘材料 ${fmt(n)} 件(每種保留 30),靈石 +${fmt(st)}`);
    try { updateTopBar(); renderInventory(); } catch (er) { } saveGame();
  }, true);
  /* 行囊頁頂端:材料堆太多時給一行提示 */
  setInterval(() => {
    try {
      const hd = document.querySelector('#tab-inventory .hd'); if (!hd) return; let tip = $('mt160');
      const inv = state.inventory || {}, over = Object.keys(inv).filter(k => { const it = ITEMS[k]; return it && it.type === 'material' && k !== 'rn_1' && inv[k] >= 200; }).length;
      if (!tip) { tip = document.createElement('div'); tip.id = 'mt160'; tip.style.cssText = 'font-size:12px;color:#8a5a12;margin:4px 2px 0;display:none'; hd.insertAdjacentElement('afterend', tip); }
      const h = over ? `有 ${over} 種材料堆了上百個——點右上「賣材」${window.UNLOCK9 && UNLOCK9.on('forge') ? '送進乾坤熔爐煉化' : '換成靈石'}。` : '';
      if (tip.textContent !== h) tip.textContent = h; tip.style.display = h ? '' : 'none';
    } catch (e) { }
  }, 3000);

  /* ---------- 5. 氣海已滿時服修為丹:藥力化入經脈,換成道行與器紋石(與溢出靈氣同一套換算) ---------- */
  {
    const og = qiPillUse;
    qiPillUse = function (key, all, quiet) {
      const info = getRealmInfo(), item = ITEMS[key];
      if (quiet || !item || !(state.inventory[key] > 0) || state.qi < info.maxQi - 0.5) return og.apply(this, arguments);
      const n = all ? state.inventory[key] : 1, v = qiPillVal(key) * .5 / Math.max(1, info.maxQi) * n;
      if (!state.ovf160 || typeof state.ovf160 !== 'object') state.ovf160 = { q: 0, dao: 0, rn: 0 };
      state.ovf160.q += v; state.inventory[key] -= n; if (state.inventory[key] <= 0) delete state.inventory[key];
      const g = window.G160 ? G160.convert() : { dao: 0, rn: 0, st: 0 };
      showToast(`氣海已盈,${item.name} ×${n} 的藥力化入經脈${g.dao || g.rn || g.st ? ':' + [g.dao ? '道行 +' + g.dao : '', g.rn ? '器紋石 +' + g.rn : '', g.st ? '靈石 +' + formatNum(g.st) : ''].filter(Boolean).join('、') : '(積蓄中,攢夠了會化為道行與器紋石)'}`);
      try { audio.playQiChime(); renderInventory(); updateTopBar(); } catch (e) { } saveGame();
      return n;
    };
  }

  /* ---------- 6. 離線資源:只在 Wi-Fi 時背景下載;設定裡看得到進度,也能手動下載 ---------- */
  const swPost = m => { try { navigator.serviceWorker && navigator.serviceWorker.controller && navigator.serviceWorker.controller.postMessage(m); } catch (e) { } };
  setInterval(() => swPost('warm'), 90000); setTimeout(() => swPost('warm'), 8000);
  async function progress() {
    try { if (!window.caches) return null; const list = await (await fetch('assets/list.json', { cache: 'no-store' })).json(); const c = await caches.open('yinian-media-v1'), ks = new Set((await c.keys()).map(r => r.url)); const base = new URL('./', location.href).href; const have = list.filter(u => ks.has(new URL(u, base).href)).length; return [have, list.length]; } catch (e) { return null; }
  }
  async function dlRow() {
    const b = $('x5b-mn'); if (!b || !X.isOpen('mn')) return; let r = $('dl160');
    if (!r) { r = document.createElement('div'); r.id = 'dl160'; r.className = 'x5-card'; r.style.cssText = 'margin-bottom:8px;display:flex;align-items:center;gap:10px'; b.appendChild(r); }
    const p = await progress(); if (!p) { r.style.display = 'none'; return; }
    const done = p[0] >= p[1];
    r.innerHTML = `<span style="flex:1"><b style="font-size:14px">離線資源</b><br><span style="font-size:12px">${done ? '圖片已全部存在手機裡,沒網路也能玩。' : `已下載 ${p[0]}/${p[1]} 張圖。用 Wi-Fi 時會自動在背景下載;行動網路下可手動下載(約 50MB)。`}</span></span>${done ? '' : '<button class="x5-btn am" data-x5="dl160.go" style="flex:none">下載</button>'}`;
  }
  X.act('dl160.go', () => { swPost('warm!'); showToast('開始下載離線資源,可以繼續玩。'); setTimeout(dlRow, 3000); });
  { const o = X.open; X.open = function (id) { const r = o.apply(this, arguments); if (id === 'mn') setTimeout(dlRow, 50); return r; }; }
  setInterval(() => { if (X.isOpen && X.isOpen('mn')) dlRow(); }, 5000);
})();
