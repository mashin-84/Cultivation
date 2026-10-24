#!/usr/bin/env python3
"""最終版85:標題頁動態效果(純程式,不用新圖)
1. 雲海流動:程式畫出兩層半透明雲霧,一左一右緩慢飄移(只在下半部雲海)
2. 靈光飄升:少量發光光點從雲海緩緩上浮淡出
3. 月暈呼吸:月亮柔光與地平線日出光緩慢明暗起伏(位置依背景圖縮放計算,跟著背景一起放大縮小)
4. 標題入場:「一念飛仙」逐字如墨暈開浮現 → 副標淡入 → 「點擊畫面」出現後閃爍
5. 點擊轉場:鏡頭穿雲而入(背景放大變亮、雲霧湧上、整頁淡出)
系統開啟「減少動態效果」時只保留淡入;進入遊戲後動畫全部停止。
"""
import os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src')
css = os.path.join(ROOT, 'css', '02_title34-css.css')
t = open(css, encoding='utf-8', newline='').read(); assert '/* v85 */' not in t
t = t.replace('#title34 .t34-hd{position:absolute;left:0;right:0;top:calc(5% + env(safe-area-inset-top));z-index:2;text-align:center;animation:t34in 2.2s ease-out both}',
              '#title34 .t34-hd{position:absolute;left:0;right:0;top:calc(5% + env(safe-area-inset-top));z-index:2;text-align:center}')
t = t.replace('animation:t34blink 2.4s ease-in-out 1.6s infinite both}', 'opacity:0;animation:t34fade 1s ease-out 3.2s forwards,t34blink 2.4s ease-in-out 4.2s infinite}')
t += r"""
/* v85 */
#title34 .t34-bg{transform-origin:50% 45%}
#title34 .t34-fx{position:absolute;inset:0;pointer-events:none}
#title34 .t34-cl{position:absolute;left:-50%;width:200%;background-repeat:repeat-x;background-size:50% 100%;opacity:0;transition:opacity 2.5s}
#title34 .t34-cl.a{top:52%;height:30%;animation:t34dl 70s linear infinite}
#title34 .t34-cl.b{top:66%;height:36%;animation:t34dr 52s linear infinite}
#title34.fx .t34-cl.a{opacity:.55}#title34.fx .t34-cl.b{opacity:.7}
#title34 .t34-moon,#title34 .t34-sun{position:absolute;border-radius:50%;transform:translate(-50%,-50%);pointer-events:none;opacity:0;transition:opacity 2s}
#title34 .t34-moon{background:radial-gradient(circle,rgba(255,255,255,.85) 0%,rgba(255,255,255,.35) 35%,rgba(220,232,255,0) 70%);animation:t34br 6s ease-in-out infinite}
#title34 .t34-sun{background:radial-gradient(ellipse,rgba(255,236,214,.75) 0%,rgba(255,226,200,.3) 40%,rgba(255,226,200,0) 72%);animation:t34br 9s ease-in-out 1.5s infinite}
#title34.fx .t34-moon,#title34.fx .t34-sun{opacity:1}
#title34 canvas.t34-pt{position:absolute;inset:0;width:100%;height:100%;z-index:1;pointer-events:none}
#title34 h1 span{display:inline-block;opacity:0;animation:t34ink 1.6s cubic-bezier(.2,.7,.3,1) both}
#title34 h1 span:nth-child(1){animation-delay:.2s}#title34 h1 span:nth-child(2){animation-delay:.6s}#title34 h1 span:nth-child(3){animation-delay:1s}#title34 h1 span:nth-child(4){animation-delay:1.4s}
#title34 .t34-sub{opacity:0;animation:t34fade 1.4s ease-out 2.3s forwards}
#title34.out{transition:opacity 1.1s ease-in .25s}
#title34.out .t34-bg{animation:none;transform:scale(1.22);filter:brightness(1.18) blur(2px);transition:transform 1.3s cubic-bezier(.5,0,.8,.4),filter 1.3s}
#title34.out .t34-cl{opacity:1!important;transform:scale(1.6) translateY(-12%);transition:transform 1.3s ease-in,opacity .4s}
#title34.out .t34-hd,#title34.out .t34-go{opacity:0!important;transform:scale(1.08);transition:opacity .5s,transform .8s}
@keyframes t34dl{from{transform:translateX(0)}to{transform:translateX(25%)}}
@keyframes t34dr{from{transform:translateX(0)}to{transform:translateX(-25%)}}
@keyframes t34br{0%,100%{opacity:.55;transform:translate(-50%,-50%) scale(.92)}50%{opacity:1;transform:translate(-50%,-50%) scale(1.08)}}
@keyframes t34ink{0%{opacity:0;filter:blur(10px);transform:scale(1.35)}55%{opacity:.85;filter:blur(2px)}100%{opacity:1;filter:none;transform:none}}
@keyframes t34fade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){#title34 .t34-cl,#title34 .t34-moon,#title34 .t34-sun,#title34 canvas.t34-pt{display:none}#title34 h1 span{animation:t34fade 1s both}}
"""
open(css, 'w', encoding='utf-8', newline='').write(t)

p = os.path.join(ROOT, 'index.html'); s = open(p, encoding='utf-8', newline='').read()
old = '<div class="t34-bg"></div><div class="t34-hd"><h1>一念飛仙</h1>'
assert s.count(old) == 1
new = '<div class="t34-bg"><div class="t34-fx"><i class="t34-sun"></i><i class="t34-moon"></i><div class="t34-cl a"></div><div class="t34-cl b"></div></div></div><canvas class="t34-pt"></canvas><div class="t34-hd"><h1><span>一</span><span>念</span><span>飛</span><span>仙</span></h1>'
s = s.replace(old, new)
# 標題頁動態:緊接在標題畫面之後執行(檔案還在讀取時就開始播)
i = s.index('<div id="title34"'); j = s.index('</div>\n', i) if False else None
marker = '<div class="t34-go">點擊畫面,踏入仙途</div></div>'
assert s.count(marker) == 1
script = r"""<script>/* v85 標題頁動態 */
(function () {
  var T = document.getElementById('title34'); if (!T) return;
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var bg = T.querySelector('.t34-bg'), moon = T.querySelector('.t34-moon'), sun = T.querySelector('.t34-sun'), cv = T.querySelector('canvas.t34-pt');
  /* 雲霧貼圖:程式畫出柔軟的雲團(左右可無縫接續) */
  function cloudTex(w, h, n, seed) {
    var c = document.createElement('canvas'); c.width = w; c.height = h; var g = c.getContext('2d'), r = seed;
    function rnd() { r = (r * 16807) % 2147483647; return r / 2147483647; }
    for (var k = 0; k < n; k++) {
      var x = rnd() * w, y = h * (.35 + rnd() * .5), rad = h * (.18 + rnd() * .32), a = .18 + rnd() * .25;
      for (var dx = -w; dx <= w; dx += w) { var gr = g.createRadialGradient(x + dx, y, 0, x + dx, y, rad); gr.addColorStop(0, 'rgba(255,255,255,' + a + ')'); gr.addColorStop(.6, 'rgba(255,255,255,' + a * .45 + ')'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(x + dx - rad, y - rad, rad * 2, rad * 2); }
    }
    return c.toDataURL('image/png');
  }
  var cl = T.querySelectorAll('.t34-cl');
  cl[0].style.backgroundImage = 'url(' + cloudTex(512, 160, 26, 7) + ')';
  cl[1].style.backgroundImage = 'url(' + cloudTex(512, 180, 30, 99) + ')';
  /* 月亮、日出光位置:依背景圖(467x976,cover,水平置中、垂直 40%)換算 */
  function place() {
    var W = bg.clientWidth, H = bg.clientHeight; if (!W) return;
    var sc = Math.max(W / 467, H / 976), ox = (W - 467 * sc) / 2, oy = (H - 976 * sc) * .4;
    function at(el, x, y, d) { el.style.left = (ox + x * sc) + 'px'; el.style.top = (oy + y * sc) + 'px'; el.style.width = el.style.height = (d * sc) + 'px'; }
    at(moon, 314, 269, 150); at(sun, 206, 448, 260); sun.style.height = (110 * sc) + 'px';
  }
  place(); addEventListener('resize', place);
  requestAnimationFrame(function () { T.classList.add('fx'); });
  /* 靈光光點 */
  var g = cv.getContext('2d'), P = [], dpr = Math.min(2, window.devicePixelRatio || 1), alive = true, W0 = 0, H0 = 0;
  function size() { W0 = cv.clientWidth; H0 = cv.clientHeight; cv.width = W0 * dpr; cv.height = H0 * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0); }
  function spawn(init) { return { x: Math.random() * W0, y: init ? H0 * (.45 + Math.random() * .55) : H0 * (.75 + Math.random() * .3), r: .8 + Math.random() * 1.8, vy: .12 + Math.random() * .25, sw: Math.random() * 6.28, life: 0, max: 380 + Math.random() * 420 }; }
  size(); addEventListener('resize', size);
  for (var i = 0; i < 26; i++) P.push(spawn(true));
  function tick() {
    if (!alive) return; if (!T.isConnected) { alive = false; return; }
    g.clearRect(0, 0, W0, H0);
    for (var i = 0; i < P.length; i++) {
      var p = P[i]; p.life++; p.y -= p.vy; p.sw += .012; var x = p.x + Math.sin(p.sw) * 10;
      var a = Math.min(1, p.life / 90) * Math.max(0, 1 - p.life / p.max);
      if (p.life > p.max || p.y < H0 * .15) { P[i] = spawn(false); continue; }
      var gr = g.createRadialGradient(x, p.y, 0, x, p.y, p.r * 5); gr.addColorStop(0, 'rgba(255,250,230,' + .9 * a + ')'); gr.addColorStop(.35, 'rgba(255,236,180,' + .35 * a + ')'); gr.addColorStop(1, 'rgba(255,236,180,0)');
      g.fillStyle = gr; g.beginPath(); g.arc(x, p.y, p.r * 5, 0, 6.283); g.fill();
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
</script>"""
s = s.replace(marker, marker + script)
open(p, 'w', encoding='utf-8', newline='').write(s)
j = os.path.join(ROOT, 'js', '03_title34_標題畫面點擊進入.js'); u = open(j, encoding='utf-8', newline='').read()
o = "setTimeout(() => { try { t.remove(); } catch (e) { } }, 1000);"; assert u.count(o) == 1
open(j, 'w', encoding='utf-8', newline='').write(u.replace(o, o.replace('1000', '1450')))
print('p14 ok')
