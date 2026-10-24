/* ===== v101 真實音效檔:SFX.play(名稱) → true 已播放 / false 改用合成音效 ===== */
window.SFX = (() => {
  const MAP = @@SFXMAP@@, buf = {}, busy = {};
  const GAIN = { sfx_hit: .7, sfx_skill: .8, sfx_ult: 1, sfx_hurt: .6, sfx_thunder: 1, amb_thunder: .7 };
  const ok = () => location.protocol.startsWith('http') && audio && audio.ctx;
  function load(n) {
    if (buf[n] || busy[n] || !MAP[n] || !ok()) return; busy[n] = 1;
    fetch('sfx/' + n + '.mp3?v=' + MAP[n]).then(r => r.arrayBuffer()).then(a => new Promise((y, x) => audio.ctx.decodeAudioData(a, y, x))).then(b => { buf[n] = b; }).catch(() => { }).finally(() => { busy[n] = 0; });
  }
  function preload() { Object.keys(MAP).forEach(load); }
  function play(n) {
    if (!MAP[n] || !ok()) return false;
    if (!audio.enabled) return true;            // 音效關閉:視為已處理,不再改播合成音
    const b = buf[n]; if (!b) { load(n); return false; }
    try {
      const c = audio.ctx, s = c.createBufferSource(), g = c.createGain();
      s.buffer = b; s.playbackRate.value = 1 + (Math.random() - .5) * .06;   // 微幅變調,連續普攻不死板
      g.gain.value = (GAIN[n] || .8) * audio.volume * 1.2; s.connect(g); g.connect(c.destination); s.start();
      return true;
    } catch (e) { return false; }
  }
  /* 循環背景音:loop(名稱, 開/關) */
  const lp = {};
  function loop(n, on) {
    const L = lp[n];
    if (!on) { if (L) { const c = audio.ctx, t = c.currentTime; L.g.gain.cancelScheduledValues(t); L.g.gain.setValueAtTime(L.g.gain.value, t); L.g.gain.linearRampToValueAtTime(0, t + 1.2); L.s.stop(t + 1.3); delete lp[n]; } return; }
    if (L || !MAP[n] || !ok() || !audio.enabled) return;
    const b = buf[n]; if (!b) { load(n); return; }
    try {
      const c = audio.ctx, s = c.createBufferSource(), g = c.createGain(), t = c.currentTime;
      s.buffer = b; s.loop = true; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime((GAIN[n] || .6) * audio.volume * 1.2, t + 1.5);
      s.connect(g); g.connect(c.destination); s.start(); lp[n] = { s, g };
    } catch (e) { }
  }
  /* 雷劫視窗開著 → 雷雨背景音 */
  setInterval(() => { const m = document.getElementById('modal-tribulation'); loop('amb_thunder', !!(m && !m.classList.contains('hidden') && document.visibilityState === 'visible')); }, 400);
  const _init = audio.init.bind(audio);
  audio.init = function () { const r = _init.apply(this, arguments); preload(); return r; };
  return { play, loop, preload, has: n => !!MAP[n] };
})();
