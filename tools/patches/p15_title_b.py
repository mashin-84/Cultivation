#!/usr/bin/env python3
"""最終版86:標題頁 B 方案——分層動態
- 背景換成新生成的空景(高解析 1438x2576),主角與仙鶴改為獨立圖層
- 主角:身體不動;長髮與衣帶(預先切成「飄動層」)每列以身體邊緣為支點左右伸縮,呈現隨風擺動
- 仙鶴:三隻成群,6 格振翅輪播,每隔一段時間從右飛到左
- A 方案的雲海、光點、月暈(位置改對新背景)、標題入場、點擊轉場保留
圖檔:assets/css/title_bg(新空景)、t86_cs(主角身體)、t86_cf(髮與衣帶)、t86_cr(仙鶴 6 格);邊界資料 tools/patches/t86_bnd.json
"""
import os, json, re
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..', '..', 'src')
B = json.load(open(os.path.join(HERE, 't86_bnd.json')))
p = os.path.join(ROOT, 'index.html'); s = open(p, encoding='utf-8', newline='').read()
old = '<div class="t34-cl a"></div><div class="t34-cl b"></div></div></div>'
assert s.count(old) == 1
s = s.replace(old, '<div class="t34-cl a"></div><div class="t34-cl b"></div><canvas class="t34-ch"></canvas><i class="t34-cr"></i><i class="t34-cr"></i><i class="t34-cr"></i></div></div>')
i = s.index('<script>/* v85 標題頁動態 */'); j = s.index('</script>', i) + len('</script>')
s = s[:i] + r"""<script>/* v86 標題頁動態(分層) */
(function () {
  var T = document.getElementById('title34'); if (!T) return;
  var RM = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  var bg = T.querySelector('.t34-bg'), moon = T.querySelector('.t34-moon'), sun = T.querySelector('.t34-sun'), cv = T.querySelector('canvas.t34-pt'), cc = T.querySelector('canvas.t34-ch'), CR = T.querySelectorAll('.t34-cr');
  var IW = 1438, IH = 2576, BND = """ + json.dumps(B['b']) + r""";
  var cg = cc.getContext('2d');
  function img(u) { var i = new Image(); i.src = u; return i; }
  var CS = img('data:image/webp;base64,@@IMG:css/t86_cs@@'), CF = img('data:image/webp;base64,@@IMG:css/t86_cf@@');
  for (var q = 0; q < CR.length; q++) CR[q].style.backgroundImage = 'url(data:image/webp;base64,@@IMG:css/t86_cr@@)';
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
  /* 背景圖座標換算(cover,水平置中、垂直 40%) */
  var G = { sc: 1, ox: 0, oy: 0 }, dpr = Math.min(2, window.devicePixelRatio || 1);
  var CH = { x: 860, y: 1800, h: 770, fx: .25 };   /* 主角腳底位置、身高(背景圖像素)、腳底在主角圖寬度的比例 */
  function place() {
    var W = bg.clientWidth, H = bg.clientHeight; if (!W) return;
    var sc = Math.max(W / IW, H / IH); G.sc = sc; G.ox = (W - IW * sc) / 2; G.oy = (H - IH * sc) * .4;
    function at(el, x, y, w, h) { el.style.left = (G.ox + x * sc) + 'px'; el.style.top = (G.oy + y * sc) + 'px'; el.style.width = (w * sc) + 'px'; el.style.height = (h * sc) + 'px'; }
    at(moon, 1150, 180, 260, 260); at(sun, 980, 930, 620, 260);
    var hh = CH.h * sc, ww = hh * 494 / 800;
    cc.style.height = hh + 'px'; cc.style.width = ww + 'px'; cc.style.left = (G.ox + CH.x * sc - CH.fx * ww) + 'px'; cc.style.top = (G.oy + CH.y * sc - hh * .985) + 'px';
    cc.width = Math.round(ww * dpr); cc.height = Math.round(hh * dpr);
  }
  place(); addEventListener('resize', place);
  if (RM) { var once = function () { drawChar(0); }; CS.onload = CF.onload = once; addEventListener('resize', once); setTimeout(once, 50); return; }   /* 減少動態:主角靜止顯示 */
  requestAnimationFrame(function () { T.classList.add('fx'); });
  /* 主角:身體靜止,髮與衣帶每列以身體邊緣為支點伸縮 */
  function drawChar(t) {
    if (!CS.complete || !CF.complete || !CS.naturalWidth) return;
    var w = cc.width, h = cc.height, sw = CF.naturalWidth, sh = CF.naturalHeight, k = h / sh;
    cg.clearRect(0, 0, w, h); cg.drawImage(CS, 0, 0, w, h);
    for (var y = 0; y < sh; y += 2) {
      var b = BND[Math.min(BND.length - 1, y >> 3)]; if (b >= 1) continue;
      var bx = b * sw, amp = .075 * (1 - y / sh * .5), s = 1 + amp * Math.sin(t * 1.9 - y * .016) + .025 * Math.sin(t * 3.3 - y * .05);
      cg.drawImage(CF, bx, y, sw - bx, 2, bx * k, y * k, (sw - bx) * k * s, 2 * k + .6);
    }
  }
  /* 仙鶴:三隻一群,振翅 6 格,從右飛到左 */
  var FL = [{ dx: 0, dy: 0, s: 1, ph: 0 }, { dx: 150, dy: 70, s: .85, ph: 2 }, { dx: 290, dy: 20, s: .75, ph: 4 }], cyc = 22, t0 = performance.now() / 1000 - 15;
  function drawCranes(t) {
    var u = ((t - t0) % cyc) / 14, sc = G.sc;
    for (var i = 0; i < CR.length; i++) {
      var f = FL[i], e = CR[i]; if (u > 1.25) { e.style.opacity = 0; continue; }
      var x = IW + 120 - u * (IW + 700) + f.dx, y = 560 + f.dy + Math.sin(u * 6 + i) * 25, hgt = 95 * f.s;
      e.style.opacity = 1; e.style.height = (hgt * sc) + 'px'; e.style.width = (hgt * 699 / 6 / 120 * sc) + 'px';
      e.style.left = (G.ox + x * sc) + 'px'; e.style.top = (G.oy + y * sc) + 'px';
      var fr = Math.floor(t * 8 + f.ph) % 6; e.style.backgroundPosition = (fr * 20) + '% 0';
    }
  }
  /* 靈光光點 */
  var g = cv.getContext('2d'), P = [], W0 = 0, H0 = 0;
  function size() { W0 = cv.clientWidth; H0 = cv.clientHeight; cv.width = W0 * dpr; cv.height = H0 * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0); }
  function spawn(init) { return { x: Math.random() * W0, y: init ? H0 * (.45 + Math.random() * .55) : H0 * (.75 + Math.random() * .3), r: .8 + Math.random() * 1.8, vy: .12 + Math.random() * .25, sw: Math.random() * 6.28, life: 0, max: 380 + Math.random() * 420 }; }
  size(); addEventListener('resize', size);
  for (var i = 0; i < 26; i++) P.push(spawn(true));
  function tick(ms) {
    if (!T.isConnected) return;
    var t = ms / 1000; drawChar(t); drawCranes(t);
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
</script>""" + s[j:]
open(p, 'w', encoding='utf-8', newline='').write(s)
css = os.path.join(ROOT, 'css', '02_title34-css.css'); c = open(css, encoding='utf-8', newline='').read(); assert '/* v86 */' not in c
c = c.replace('#title34 .t34-bg{position:absolute;inset:0;background:url(data:image/webp;base64,@@IMG:css/title_bg@@) center 40%/cover no-repeat;', '#title34 .t34-bg{position:absolute;inset:0;background:#dfe9f2 url(data:image/webp;base64,@@IMG:css/title_bg@@) center 40%/cover no-repeat;')
c += """/* v86 */
#title34 canvas.t34-ch{position:absolute;pointer-events:none}
#title34 .t34-cr{position:absolute;background-repeat:no-repeat;background-size:600% 100%;opacity:0;pointer-events:none;transition:opacity .8s}
@media (prefers-reduced-motion:reduce){#title34 .t34-cr{display:none}}
"""
open(css, 'w', encoding='utf-8', newline='').write(c)
print('p15 ok')
