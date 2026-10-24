#!/usr/bin/env python3
"""最終版99:
1. 標題頁「安裝到主畫面」按鈕:瀏覽器允許安裝時才出現(已是 App 開啟、或本機檔案時不顯示);iPhone Safari 顯示操作說明
2. 劇情打字音改「輕敲木魚」音色並可調音量:設定「劇情打字音」點一下循環 關→輕→中→重(預設中,state.typeVol;舊的 typeSnd=false 視為關)
"""
import glob, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src')
def F(p): g = glob.glob(os.path.join(ROOT, 'js', '02_main', p + '_*.js')); assert len(g) == 1, p; return g[0]
def rep(pre, old, new):
    p = F(pre); t = open(p, encoding='utf-8', newline='').read(); assert t.count(old) == 1, (pre, old[:60])
    open(p, 'w', encoding='utf-8', newline='').write(t.replace(old, new))
# ---- 1 安裝按鈕 ----
p = os.path.join(ROOT, 'index.html'); s = open(p, encoding='utf-8', newline='').read()
old = '<div class="t34-go">點擊畫面,踏入仙途</div></div>'; assert s.count(old) == 1
s = s.replace(old, '<div class="t34-go">點擊畫面,踏入仙途</div><button id="t99-inst" type="button" hidden>📲 安裝到主畫面</button><div id="t99-ios" hidden>iPhone:點 Safari 下方「分享」→「加入主畫面」</div></div>' + r"""<script>/* v99 安裝到主畫面 */
(function () {
  var b = document.getElementById('t99-inst'), ios = document.getElementById('t99-ios'), ev = null;
  var standalone = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone;
  if (standalone || !/^https?:$/.test(location.protocol)) return;
  addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); ev = e; b.hidden = false; });
  addEventListener('appinstalled', function () { b.hidden = true; });
  b.addEventListener('click', function (e) { e.stopPropagation(); if (!ev) return; ev.prompt(); ev.userChoice.then(function () { ev = null; b.hidden = true; }); });
  if (/iphone|ipad|ipod/i.test(navigator.userAgent)) ios.hidden = false;
  ios.addEventListener('click', function (e) { e.stopPropagation(); });
})();
</script>""")
open(p, 'w', encoding='utf-8', newline='').write(s)
css = os.path.join(ROOT, 'css', '02_title34-css.css'); c = open(css, encoding='utf-8', newline='').read(); assert '/* v99 */' not in c
c += """/* v99 */
#title34 #t99-inst{position:relative;z-index:3;margin:-4% 0 calc(6% + env(safe-area-inset-bottom));padding:9px 20px;border-radius:999px;border:1px solid rgba(138,75,28,.45);background:rgba(255,250,238,.88);color:#7a3e12;font:700 14px 'Noto Serif TC',serif;letter-spacing:.12em;box-shadow:0 2px 10px rgba(90,60,20,.18);opacity:0;animation:t34fade 1s ease-out 3.6s forwards}
#title34 #t99-inst[hidden],#title34 #t99-ios[hidden]{display:none}
#title34 #t99-ios{position:relative;z-index:3;margin:-4% 16px calc(6% + env(safe-area-inset-bottom));padding:6px 12px;border-radius:10px;background:rgba(255,250,238,.85);color:#5a3a12;font-size:12px}
"""
open(css, 'w', encoding='utf-8', newline='').write(c)
# ---- 2 打字音 ----
p = F('001'); t = open(p, encoding='utf-8', newline='').read()
i = t.index('  /* v95/v96 劇情打字音'); j = t.index('  vibrate(ms = 40) {')
t = t[:i] + r"""  /* v95/v96/v99 劇情打字音:輕敲木魚音色;kind = low / mid / high / dark / nar;vol = state.typeVol(1 輕 / 2 中 / 3 重) */
  playType(kind) {
    if (!this.enabled || !this.ctx || this.ctx.state !== 'running') return;
    const c = this.ctx, now = c.currentTime, lv = [0, .45, .8, 1.25][(typeof state !== 'undefined' && state.typeVol) || 2] || .8, v = this.volume * lv;
    if (!this._tf) { this._tf = c.createBiquadFilter(); this._tf.type = 'lowpass'; this._tf.frequency.value = 2400; this._tf.connect(c.destination); }
    const out = this._tf;
    if (!this._nb) { const n = Math.floor(c.sampleRate * .03), bf = c.createBuffer(1, n, c.sampleRate), d = bf.getChannelData(0); for (let k = 0; k < n; k++) d[k] = (Math.random() * 2 - 1) * Math.pow(1 - k / n, 3); this._nb = bf; }
    const tap = (freq, q, g) => { const s = c.createBufferSource(), f = c.createBiquadFilter(), gg = c.createGain(); s.buffer = this._nb; f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q; gg.gain.value = g * v; s.connect(f); f.connect(gg); gg.connect(out); s.start(now); };
    if (kind === 'nar') { tap(1500 + Math.random() * 300, 1.2, .16); return; }
    const base = { low: 330, mid: 480, high: 680, dark: 240 }[kind] || 480, f0 = base * (1 + (Math.random() - .5) * .06);
    const o = c.createOscillator(), g = c.createGain(); o.type = 'sine';
    o.frequency.setValueAtTime(f0 * 1.5, now); o.frequency.exponentialRampToValueAtTime(f0, now + .025);
    g.gain.setValueAtTime(.0001, now); g.gain.exponentialRampToValueAtTime(.09 * v, now + .004); g.gain.exponentialRampToValueAtTime(.0001, now + .085);
    o.connect(g); g.connect(out); o.start(now); o.stop(now + .1);
    tap(f0 * 3, 3, .2);
    if (kind === 'dark') { const o2 = c.createOscillator(), g2 = c.createGain(); o2.type = 'sine'; o2.frequency.setValueAtTime(base / 2, now); g2.gain.setValueAtTime(.0001, now); g2.gain.exponentialRampToValueAtTime(.06 * v, now + .01); g2.gain.exponentialRampToValueAtTime(.0001, now + .16); o2.connect(g2); g2.connect(out); o2.start(now); o2.stop(now + .18); }
  }
""" + t[j:]
open(p, 'w', encoding='utf-8', newline='').write(t)
rep('046', "row('mn.tsnd', '🎐', '劇情打字音', state.typeSnd !== false ? '目前:開(對話逐字出現時的輕響)' : '目前:關')",
    "row('mn.tsnd', '🎐', '劇情打字音', state.typeSnd === false ? '目前:關(點一下切換 關→輕→中→重)' : '目前:' + ['', '輕', '中', '重'][state.typeVol || 2] + '(點一下切換,會試播一聲)')")
rep('046', "X.act('mn.tsnd', () => { state.typeSnd = state.typeSnd === false; saveGame();",
    "X.act('mn.tsnd', () => { if (state.typeSnd === false) { state.typeSnd = true; state.typeVol = 1; } else if ((state.typeVol || 2) >= 3) state.typeSnd = false; else state.typeVol = (state.typeVol || 2) + 1; saveGame();")
rep('046', "X.refresh('mn'); try { audio.init(); audio.playType('mid'); } catch (e) { } });", "X.refresh('mn'); try { audio.init(); if (state.typeSnd !== false) audio.playType('mid'); } catch (e) { } });")
print('p28 ok')
