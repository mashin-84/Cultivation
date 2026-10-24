
/* ===== v10.1:戰鬥接續 —— 別處發起戰鬥時暫停自動歷練,打完詢問是否繼續;戰鬥中可預約停止 ===== */
(function () {
  const $ = id => document.getElementById(id), X = window.X5;
  let resume = null, asking = false;
  const normalBattle = B => B && !B.special && !B.tb26 && !B.isSect && !B.isWB && !B.isTower && !B.isDemonTrib && !B.isJie;
  window.HO43 = {
    /* 讓出目前的一般歷練戰鬥(不扣任何東西),回傳是否已讓出 */
    yieldBattle() {
      const B = currentBattle; if (!normalBattle(B)) return false;
      if (battleLock) { try { clearTimeout(battleAutoTimer); } catch (e) { } }
      const wasAuto = !!state.autoExplore;
      try { if (wasAuto) stopAutoExplore(''); } catch (e) { }
      try { endBattle(); } catch (e) { currentBattle = null; battleLock = false; }
      try { logAdventure('<span class="text-sky-300">↪ 道友暫且收劍,先赴另一場約戰。</span>'); } catch (e) { }
      if (wasAuto) resume = { t: Date.now() };
      return !currentBattle;
    },
    mark(cfg) { resume = { t: Date.now(), kind: cfg && cfg.kind }; }
  };
  X.sheet('ra43', '⚔ 歷練', b => {
    const J = window.JIE49;
    if (J && J.show) {
      const nm = '一二三四五六七八九'[J.n - 1] || J.n;
      let h = `<div class="x5-sub" style="margin-bottom:10px;font-size:13px;color:#e2e8f0">${J.win ? `第${nm}重劫已渡過。接下來?` : `第${nm}重劫渡劫失敗。接下來?`}</div><div style="display:flex;flex-direction:column;gap:8px">`;
      if (J.win && J.first && J.n < 9) h += `<button class="x5-btn am" data-x5="ra43.jn">⚡ 挑戰第${'一二三四五六七八九'[J.n]}重劫</button>`;
      if (!J.win) h += `<button class="x5-btn am" data-x5="ra43.jr">⚡ 再戰第${nm}重劫</button>`;
      if (J.was) h += `<button class="x5-btn am" data-x5="ra43.go">繼續自動歷練</button>`;
      b.innerHTML = h + `<button class="x5-btn gy" data-x5="ra43.no">先不用</button></div>`; return;
    }
    b.innerHTML = `<div class="x5-sub" style="margin-bottom:10px;font-size:13px;color:#e2e8f0">這一戰已了結。要繼續先前的自動歷練嗎?</div><div class="x5-row" style="gap:8px"><button class="x5-btn am" data-x5="ra43.go" style="flex:1">繼續自動歷練</button><button class="x5-btn gy" data-x5="ra43.no" style="flex:1">先不用</button></div>`;
  });
  const jclose = () => { if (window.JIE49) JIE49.show = false; };
  X.act('ra43.jn', () => { X.close('ra43'); asking = false; resume = null; const J = window.JIE49; jclose(); J.chain = true; if (window.startJie49) startJie49(J.n + 1); });
  X.act('ra43.jr', () => { X.close('ra43'); asking = false; resume = null; const J = window.JIE49; jclose(); J.chain = true; if (window.startJie49) startJie49(J.n); });
  X.act('ra43.go', () => { jclose(); X.close('ra43'); asking = false; resume = null; if (!state.autoExplore && !currentBattle) { const b = $('btn-auto-explore'); if (b) b.click(); try { showToast('自動歷練繼續。'); } catch (e) { } } });
  X.act('ra43.no', () => { jclose(); X.close('ra43'); asking = false; resume = null; });
  const busy = () => !!currentBattle || !!(window.ST28 && ST28.run) || [...document.querySelectorAll('[id^=modal]')].some(m => !m.classList.contains('hidden') && m.offsetParent !== null && m.id !== 'modal-offline');
  XT.endBattle101 = _eb => function () {
    const B = currentBattle, sp = !!(B && !normalBattle(B));
    const r = _eb.apply(this, arguments);
    if (sp && resume && !asking) {
      asking = true;
      const t0 = Date.now();
      const tick = () => {
        if (!resume) { asking = false; return; }
        if (state.autoExplore) { resume = null; asking = false; return; }
        if (Date.now() - t0 > 10 * 60000) { resume = null; asking = false; return; }
        if (busy()) { setTimeout(tick, 1000); return; }
        X.open('ra43');
      };
      setTimeout(tick, 1200);
    }
    return r;
  };
  /* 戰鬥中也能關掉自動歷練(本場打完就停) */
  const st = document.createElement('style');
  st.textContent = '#btn-astop43{display:none;width:100%;margin:6px 0 2px;padding:7px 4px;border-radius:10px;border:1px solid #b45309;background:#451a03;color:#fde68a;font-weight:800;font-size:12px}#btn-astop43.on{display:block}';
  document.head.appendChild(st);
  function mount() {
    let b = $('btn-astop43'); if (b && b.__b77) return; const bm = $('battle-modal'); if (!bm) return;
    const nw = !b; if (nw) { b = document.createElement('button'); b.id = 'btn-astop43'; b.textContent = '⏹ 自動歷練中・點此於本場結束後停止'; } b.__b77 = 1;
    b.addEventListener('click', () => { if (!state.autoExplore) return; try { stopAutoExplore(''); } catch (e) { } b.classList.remove('on'); try { showToast('本場戰鬥結束後,不再繼續自動歷練。'); } catch (e) { } });
    if (nw) bm.insertBefore(b, bm.children[1] || null);
  }
  setInterval(() => { mount(); const b = $('btn-astop43'); if (b) b.classList.toggle('on', !!(state.autoExplore && currentBattle)); }, 600);
})();
