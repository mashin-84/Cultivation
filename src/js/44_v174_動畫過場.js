/* ===== v174 動畫過場:MOV174.play(名稱) → Promise(true 播過 / false 沒有影片) =====
   影片放 src/pwa/movie/名稱.mp4(只在網站版);沒有檔案、單檔版、載入失敗都回傳 false,由呼叫端沿用原本演出 */
window.MOV174 = (() => {
  const MAP = @@MOVMAP@@;
  const ok = n => !!MAP[n] && /^https?:$/.test(location.protocol);
  /* v176 字幕:[開始比例, 結束比例, 文字] */
  const SUBS = {
    opening: [[.03, .23, '天地有靈,萬物皆可修。'], [.28, .48, '凡人求長生,修士爭機緣。'], [.53, .73, '傳說九天之上有一道天門——<br>過門者,即為仙。'], [.78, .97, '而這個故事,<br>始於一個無名的小村。']]
  };
  let on = false;
  function play(n) {
    if (!ok(n)) return Promise.resolve(false);
    on = true;
    return new Promise(res0 => {
      const res = r => { on = false; res0(r); };
      const o = document.createElement('div');
      o.style.cssText = 'position:fixed;inset:0;z-index:2147483000;background:#000;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .35s';
      o.innerHTML = '<video playsinline webkit-playsinline preload="auto" style="width:100%;height:100%;object-fit:cover"></video>'
        + '<div class="sub" style="position:absolute;left:8%;right:8%;bottom:22%;text-align:center;color:#fff8e6;font-size:20px;line-height:1.7;letter-spacing:3px;font-family:serif;text-shadow:0 0 8px #000,0 2px 4px #000;opacity:0;transition:opacity .6s;pointer-events:none"></div>'
        + '<div style="position:absolute;right:14px;bottom:calc(14px + env(safe-area-inset-bottom));color:rgba(255,255,255,.75);font-size:13px;letter-spacing:2px;text-shadow:0 1px 3px #000;pointer-events:none">點擊跳過</div>';
      const v = o.querySelector('video'); let done = false, played = false;
      const fin = () => { if (done) return; done = true; clearTimeout(to); o.style.opacity = '0'; setTimeout(() => { try { v.pause(); } catch (e) { } o.remove(); }, 380); res(played); };
      try { const A = typeof audio !== 'undefined' ? audio : null; v.volume = Math.max(0, Math.min(1, (A && A.volume) || .8)); v.muted = !!(A && A.enabled === false); } catch (e) { }
      v.onplaying = () => { played = true; o.style.opacity = '1'; };
      const sb = o.querySelector('.sub'), SL = SUBS[n] || []; let si = -1;
      v.ontimeupdate = () => { if (!SL.length || !v.duration) return; const f = v.currentTime / v.duration, i = SL.findIndex(x => f >= x[0] && f < x[1]); if (i === si) return; si = i; if (i < 0) sb.style.opacity = '0'; else { sb.innerHTML = SL[i][2]; sb.style.opacity = '1'; } };
      v.onended = fin; v.onerror = fin; o.onclick = () => { played = true; fin(); };
      const to = setTimeout(() => { if (!played) fin(); }, 6000);   /* 6 秒還沒開始播(網路慢)就放棄,改用原本演出 */
      v.src = 'movie/' + n + '.mp4?v=' + MAP[n];
      document.body.appendChild(o);
      const p = v.play(); if (p && p.catch) p.catch(() => { v.muted = true; v.play().catch(fin); });   /* 有聲自動播放被擋就改靜音 */
    });
  }
  return { play, has: ok, on: () => on };
})();
