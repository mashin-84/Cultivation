/* ===== v168 從 LINE / Facebook / Instagram 等 App 內建瀏覽器開啟時:自動改用手機瀏覽器開啟;打不開就顯示大提示 =====
   內建瀏覽器的存檔可能被清掉、也無法加入主畫面,所以盡量不讓玩家在裡面玩。 */
(function () {
  var ua = navigator.userAgent || '', url = location.href;
  var isLine = /\bLine\//i.test(ua), isFB = /FBAN|FBAV|FB_IAB|FBIOS|FB4A|Messenger|Instagram|MicroMessenger|Threads/i.test(ua);
  /* v170 已跳到外部瀏覽器:把 openExternalBrowser 參數從網址擦掉 */
  if (!isLine && /[?&]openExternalBrowser=1/.test(url)) { try { history.replaceState(history.state, '', url.replace(/([?&])openExternalBrowser=1(&|$)/, function (m, p, q) { return q ? p : ''; })); } catch (e) { } }
  if (!isLine && !isFB) return;
  var android = /Android/i.test(ua), ios = /iPhone|iPad|iPod/i.test(ua);
  try { if (sessionStorage.getItem('iab168') === 'stay') return; } catch (e) { }
  /* 1. 自動跳出:LINE 支援 openExternalBrowser=1;Android 用 intent 直接叫 Chrome */
  var tried = false; try { tried = sessionStorage.getItem('iab168') === 'tried'; sessionStorage.setItem('iab168', 'tried'); } catch (e) { }
  if (!tried) {
    if (isLine && !/[?&]openExternalBrowser=1/.test(url)) { location.replace(url + (url.indexOf('?') < 0 ? '?' : '&') + 'openExternalBrowser=1'); return; }
    if (isFB && android) { location.href = 'intent://' + url.replace(/^https?:\/\//, '') + '#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=' + encodeURIComponent(url) + ';end'; }
  }
  /* 2. 還在內建瀏覽器裡 → 全畫面大提示 */
  function show() {
    if (document.getElementById('iab168')) return;
    var app = isLine ? 'LINE' : /Instagram/i.test(ua) ? 'Instagram' : /MicroMessenger/i.test(ua) ? '微信' : 'Facebook';
    var how = ios ? '請點右下角(或右上角)的 <b>「⋯」或分享鈕</b>,選 <b>「在 Safari 中開啟」</b>。' : '請點右上角的 <b>「⋮」</b>,選 <b>「在 Chrome 中開啟」</b>或<b>「以預設瀏覽器開啟」</b>。';
    var d = document.createElement('div'); d.id = 'iab168';
    d.style.cssText = 'position:fixed;inset:0;z-index:2147483647;background:rgba(20,14,8,.94);color:#fdf6e3;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:28px;text-align:center;font-family:serif';
    d.innerHTML = '<div style="font-size:30px;font-weight:900;letter-spacing:.1em;margin-bottom:14px;color:#fde68a">請換個瀏覽器開啟</div>'
      + '<div style="font-size:18px;line-height:1.7;margin-bottom:10px">你正在 <b>' + app + '</b> 的內建瀏覽器裡。<br>在這裡玩,<b style="color:#fca5a5">存檔可能會不見</b>,<br>也無法安裝到主畫面。</div>'
      + '<div style="font-size:17px;line-height:1.7;margin:6px 0 20px;padding:12px 14px;border-radius:12px;background:rgba(253,230,138,.12);border:1px solid rgba(253,230,138,.5)">' + how + '</div>'
      + '<button id="iab168c" style="min-height:52px;min-width:220px;border-radius:12px;border:1px solid #fde68a;background:#b45309;color:#fff;font-size:18px;font-weight:900;margin-bottom:12px">複製遊戲網址</button>'
      + '<div style="font-size:14px;opacity:.8;margin-bottom:22px">複製後貼到 ' + (ios ? 'Safari' : 'Chrome') + ' 的網址列即可。</div>'
      + '<button id="iab168s" style="background:none;border:0;color:#cbd5e1;font-size:14px;text-decoration:underline;min-height:40px">我知道風險,仍在這裡玩</button>';
    document.body.appendChild(d);
    var clean = url.replace(/[?&]openExternalBrowser=1/, '');
    document.getElementById('iab168c').onclick = function () {
      var b = this; function ok() { b.textContent = '已複製!去瀏覽器貼上'; }
      try { navigator.clipboard.writeText(clean).then(ok, function () { prompt('請長按複製這個網址:', clean); }); } catch (e) { prompt('請長按複製這個網址:', clean); }
    };
    document.getElementById('iab168s').onclick = function () { try { sessionStorage.setItem('iab168', 'stay'); } catch (e) { } d.remove(); };
  }
  if (document.body) show(); else document.addEventListener('DOMContentLoaded', show);
})();
