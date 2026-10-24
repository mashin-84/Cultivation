/* ==========================================================================
   1. WEB AUDIO API SYNTHESIZER & VIBRATION (FIX-B12, OPT-O10)
   ========================================================================== */
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.volume = 0.5; // OPT-O10: 支援音量控制
  }
  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }
  /* v95/v96/v99 劇情打字音:輕敲木魚音色;kind = low / mid / high / dark / nar;vol = state.typeVol(1 輕 / 2 中 / 3 重) */
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
  vibrate(ms = 40) {
    // OPT-O10: 震動回饋
    if (this.enabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(ms); } catch (e) {}
    }
  }
  playQiChime() {
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    const freqs = [523.25, 587.33, 659.25, 783.99, 880.00];
    osc.frequency.setValueAtTime(freqs[Math.floor(Math.random() * freqs.length)], now);
    gain.gain.setValueAtTime(0.12 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  }
  playThunder() {
    if (!this.enabled || !this.ctx) return;
    this.vibrate(80); // OPT-O10
    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.8;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, now);
    filter.frequency.linearRampToValueAtTime(50, now + 0.8);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(now);
  }
  playSlash() {
    if (!this.enabled || !this.ctx) return;
    this.vibrate(30); // OPT-O10
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.18);
    gain.gain.setValueAtTime(0.2 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.18);
  }
  playFanfare() {
    if (!this.enabled || !this.ctx) return;
    this.vibrate(50);
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      const now = this.ctx.currentTime + idx * 0.11;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.18 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.38);
    });
  }
}
const audio = new SoundEngine();

