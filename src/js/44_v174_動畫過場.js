/* ===== v174 動畫過場:MOV174.play(名稱) → Promise(true 播過 / false 沒有影片) =====
   影片放 src/pwa/movie/名稱.mp4(只在網站版);沒有檔案、單檔版、載入失敗都回傳 false,由呼叫端沿用原本演出 */
window.MOV174 = (() => {
  const MAP = @@MOVMAP@@;
  const ok = n => !!MAP[n] && /^https?:$/.test(location.protocol);
  function play(n) {
    if (!ok(n)) return Promise.resolve(false);
    return new Promise(res => {
      const o = document.createElement('div');
      o.style.cssText = 'position:fixed;inset:0;z-index:2147483000;background:#000;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .35s';
      o.innerHTML = '<video playsinline webkit-playsinline preload="auto" style="width:100%;height:100%;object-fit:cover"></video>'
        + '<div style="position:absolute;right:14px;bottom:calc(14px + env(safe-area-inset-bottom));color:rgba(255,255,255,.75);font-size:13px;letter-spacing:2px;text-shadow:0 1px 3px #000;pointer-events:none">點擊跳過</div>';
      const v = o.querySelector('video'); let done = false, played = false;
      const fin = () => { if (done) return; done = true; clearTimeout(to); o.style.opacity = '0'; setTimeout(() => { try { v.pause(); } catch (e) { } o.remove(); }, 380); res(played); };
      try { const A = typeof audio !== 'undefined' ? audio : null; v.volume = Math.max(0, Math.min(1, (A && A.volume) || .8)); v.muted = !!(A && A.enabled === false); } catch (e) { }
      v.onplaying = () => { played = true; o.style.opacity = '1'; };
      v.onended = fin; v.onerror = fin; o.onclick = () => { played = true; fin(); };
      const to = setTimeout(() => { if (!played) fin(); }, 6000);   /* 6 秒還沒開始播(網路慢)就放棄,改用原本演出 */
      v.src = 'movie/' + n + '.mp4?v=' + MAP[n];
      document.body.appendChild(o);
      const p = v.play(); if (p && p.catch) p.catch(() => { v.muted = true; v.play().catch(fin); });   /* 有聲自動播放被擋就改靜音 */
    });
  }
  return { play, has: ok };
})();
