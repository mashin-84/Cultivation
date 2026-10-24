/* v123 標題讀取條(緊接在標題畫面後執行,才能在大段程式載入時就開始跑) */
(function () {
  const t = document.getElementById('title34'); if (!t) return; window.T123 = { ready: false };
  /* v123 讀取條:實際載入進度(圖片)+ 讀檔完成才可進入 */
  const bar = t.querySelector('.t34-ld .bar i'), tx = t.querySelector('.t34-ld .tx'), t0 = Date.now(); let shown = 0;
  const TX = ['凝神聚氣…', '感應天地靈氣…', '開啟洞府…'];
  function prog() {
    if (window.T123.ready) return;
    const im = [...document.images], done = im.filter(i => i.complete).length, p = im.length ? done / im.length : 0;
    const tp = Math.min(.92, Math.max(p * .9, Math.min(.6, (Date.now() - t0) / 4000)));   /* 圖片進度為主,時間緩慢補位,讀檔完成前最多 92% */
    shown = Math.max(shown, tp); if (bar) bar.style.width = (shown * 100) + '%'; if (tx) tx.textContent = TX[Math.min(2, Math.floor(shown * 3))] + ' ' + Math.floor(shown * 100) + '%';
    setTimeout(prog, 120);
  }
  prog();
  window.addEventListener('load', () => setTimeout(() => {   /* 014 的 load 監聽(讀檔)在後面註冊;延後一拍確保已讀完存檔 */
    if (!window.__LOADED112) return; window.T123.ready = true; if (bar) bar.style.width = '100%'; if (tx) tx.textContent = '靈台清明 100%';
    setTimeout(() => t.classList.remove('ld'), 350);
  }, 0));
})();
