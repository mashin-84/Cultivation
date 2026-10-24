#!/usr/bin/env python3
"""最終版96:背景音樂 + 打字音改柔和
音樂(src/pwa/music/*.webm,需與 index.html 一起上傳到 music 資料夾;直接開本機單檔時找不到就靜默不播):
  dongfu 洞府靜修(洞府/人物/丹器/行囊/仙途)、lilian 歷練行旅(歷練一般戰)、zhandou 生死交鋒(登天塔/劇情戰/天地異種/秘境)、
  tianjie 天劫降世(境主/九重劫/心魔/塔頂)、wenqing 故人溫情、libie 一念成殤、weiju 暗流危局(劇情依場景切換)
  換曲 1.5 秒淡入淡出;曲尾 3 秒交叉淡化接回開頭無縫循環;切到背景暫停;設定新增「背景音樂」開關(state.bgmOn,舊存檔視為開)
打字音:改純正弦、降音高、加低通、音量降到約 40%,旁白沙沙聲更輕
"""
import glob, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src')
def F(p): g = glob.glob(os.path.join(ROOT, 'js', '02_main', p + '_*.js')); assert len(g) == 1, p; return g[0]
def rep(pre, old, new):
    p = F(pre); t = open(p, encoding='utf-8', newline='').read(); assert t.count(old) == 1, (pre, old[:60])
    open(p, 'w', encoding='utf-8', newline='').write(t.replace(old, new))
# ---- 打字音柔和化 ----
p = F('001'); t = open(p, encoding='utf-8', newline='').read()
i = t.index('  /* v95 劇情打字音'); j = t.index('  vibrate(ms = 40) {')
t = t[:i] + r"""  /* v95/v96 劇情打字音(柔和版):kind = low / mid / high / dark / nar */
  playType(kind) {
    if (!this.enabled || !this.ctx || this.ctx.state !== 'running') return;
    const c = this.ctx, now = c.currentTime, v = this.volume;
    if (!this._tf) { this._tf = c.createBiquadFilter(); this._tf.type = 'lowpass'; this._tf.frequency.value = 1500; this._tf.Q.value = .5; this._tf.connect(c.destination); }
    const out = this._tf;
    if (kind === 'nar') {
      if (!this._nb) { const n = Math.floor(c.sampleRate * .05), bf = c.createBuffer(1, n, c.sampleRate), d = bf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * i / n); this._nb = bf; }
      const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); s.buffer = this._nb;
      f.type = 'bandpass'; f.frequency.value = 1300 + Math.random() * 400; f.Q.value = .9; g.gain.setValueAtTime(.018 * v, now);
      s.connect(f); f.connect(g); g.connect(out); s.start(now); return;
    }
    const base = { low: 260, mid: 440, high: 700, dark: 196 }[kind] || 440, o = c.createOscillator(), g = c.createGain(), dur = kind === 'low' || kind === 'dark' ? .13 : .09;
    o.type = 'sine'; o.frequency.setValueAtTime(base * (1 + (Math.random() - .5) * .06), now);
    g.gain.setValueAtTime(.0001, now); g.gain.exponentialRampToValueAtTime(.018 * v, now + .012); g.gain.exponentialRampToValueAtTime(.0001, now + dur);
    o.connect(g); g.connect(out); o.start(now); o.stop(now + dur + .02);
    if (kind === 'dark') { const o2 = c.createOscillator(), g2 = c.createGain(); o2.type = 'sine'; o2.frequency.setValueAtTime(base / 2, now); g2.gain.setValueAtTime(.0001, now); g2.gain.exponentialRampToValueAtTime(.014 * v, now + .015); g2.gain.exponentialRampToValueAtTime(.0001, now + .16); o2.connect(g2); g2.connect(out); o2.start(now); o2.stop(now + .18); }
  }
""" + t[j:]
open(p, 'w', encoding='utf-8', newline='').write(t)
# ---- 劇情場景 → 音樂 ----
rep('055', "  function setBg(full) {\n    const pr = String(full).split(':'), name = pr[0], vr = pr[1];",
    "  function setBg(full) {\n    const pr = String(full).split(':'), name = pr[0], vr = pr[1];\n    try { window.BGM96 && BGM96.story(name); } catch (e) { }")
# ---- 設定開關 ----
rep('046', "row('mn.tsnd', '🎐', '劇情打字音',",
    "row('mn.bgm', '🎵', '背景音樂', state.bgmOn !== false ? '目前:開' : '目前:關') + row('mn.tsnd', '🎐', '劇情打字音',")
rep('046', "  X.act('mn.tsnd',", "  X.act('mn.bgm', () => { state.bgmOn = state.bgmOn === false; saveGame(); X.refresh('mn'); try { BGM96.sync(true); } catch (e) { } });\n  X.act('mn.tsnd',")
# ---- 音樂引擎 ----
js = os.path.join(ROOT, 'js', '26_v96_背景音樂.js'); assert not os.path.exists(js)
open(js, 'w', encoding='utf-8', newline='').write(r"""/* ===== v96 背景音樂 ===== */
(() => {
  const VOL = .38, FADE = 1500, XF = 3;   /* 音量、換曲淡化毫秒、循環交叉秒數 */
  const STORY = { battle: 'weiju', demon: 'weiju', night: 'weiju', ruin: 'weiju', village_fire: 'weiju', void: 'weiju', grave: 'libie', dream: 'libie' };
  let cur = null, want = null, storyMood = 'wenqing', battleHold = 0, failed = {};
  const P = [];   /* 每首兩個播放器輪流,做循環交叉淡化 */
  function el(name) {
    const a = new Audio('music/' + name + '.webm'); a.preload = 'auto'; a.volume = 0; a._n = name;
    a.addEventListener('error', () => { failed[name] = 1; });
    return a;
  }
  const tracks = {};
  function tr(name) { return tracks[name] || (tracks[name] = { a: el(name), b: null, on: null, v: 0 }); }
  function ramp(a, to, ms) {
    clearInterval(a._r); const from = a.volume, t0 = performance.now();
    a._r = setInterval(() => { const k = Math.min(1, (performance.now() - t0) / ms); a.volume = Math.max(0, Math.min(1, from + (to - from) * k)); if (k >= 1) { clearInterval(a._r); if (to === 0) a.pause(); } }, 50);
  }
  function enabled() { return state && state.bgmOn !== false && !document.hidden && !location.protocol.startsWith('file') && !location.protocol.startsWith('content'); }
  function pick() {
    const st = document.getElementById('st28');
    if (st && window.ST28 && ST28.busy() && getComputedStyle(st).display !== 'none') return storyMood;
    const B = typeof currentBattle !== 'undefined' ? currentBattle : null;
    if (B && B.monster) {
      const m = B.monster, id = String(m.id || '');
      const big = m.isBoss || B.isJie || /^jie_/.test(id) || id === 'mind_demon' || id === 'tw_100' || (B.isTower && /boss/i.test(String(m.tier || m.name || '')));
      const tab = (document.querySelector('.tab-panel:not(.hidden)') || {}).id;
      battleHold = Date.now() + 4000;
      return big ? 'tianjie' : (B.isTower || B.isWB || B.tb26 || tab !== 'tab-adventure') ? 'zhandou' : 'lilian';
    }
    if (cur && /tianjie|zhandou/.test(cur) && Date.now() < battleHold) return cur;
    const tab = (document.querySelector('.tab-panel:not(.hidden)') || {}).id;
    return tab === 'tab-adventure' ? 'lilian' : 'dongfu';
  }
  function play(name) {
    if (failed[name]) return;
    const T = tr(name), a = T.on || T.a; T.on = a;
    if (a.paused) { a.play().catch(() => { }); }
    ramp(a, VOL, FADE);
  }
  function stop(name) { const T = tracks[name]; if (!T) return; [T.a, T.b].forEach(a => a && !a.paused && ramp(a, 0, FADE)); }
  function sync(force) {
    if (!enabled()) { Object.keys(tracks).forEach(stop); cur = null; return; }
    want = pick();
    if (want !== cur || force) { if (cur && cur !== want) stop(cur); cur = want; play(cur); }
    /* 循環:曲尾 XF 秒時,另一個播放器從頭淡入 */
    const T = tracks[cur]; if (!T || !T.on) return;
    const a = T.on;
    if (a.duration && a.currentTime > a.duration - XF - .3 && !a._xf) {
      a._xf = 1; if (!T.b) T.b = el(cur);
      const nb = a === T.a ? T.b : T.a; nb._xf = 0; nb.currentTime = 0; nb.volume = 0; nb.play().catch(() => { }); ramp(nb, VOL, XF * 1000); ramp(a, 0, XF * 1000); T.on = nb;
    }
  }
  setInterval(() => { try { sync(); } catch (e) { } }, 400);
  document.addEventListener('visibilitychange', () => { try { sync(); } catch (e) { } });
  window.BGM96 = { sync, story(bg) { storyMood = STORY[bg] || 'wenqing'; }, cur: () => cur };
})();
""")
p = os.path.join(ROOT, 'index.html'); s = open(p, encoding='utf-8', newline='').read()
old = '@@INC:js/25_v90_存檔檔案.js@@'; assert s.count(old) == 1
s = s.replace(old, old + '\n@@INC:js/26_v96_背景音樂.js@@'); open(p, 'w', encoding='utf-8', newline='').write(s)
# sw.js 已直接更新(音樂改為先用快取、單首缺檔不影響安裝)
print('p25 ok')
