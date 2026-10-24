#!/usr/bin/env python3
"""最終版95:劇情字幕打字音效
- 每 3 個字輕響一聲(標點、空白不響,遇標點重新計數);音高每聲隨機微調
- 依說話者分音色:長者低沉、少女/白澤清脆、天道/心魔帶低頻壓迫、旁白是輕柔的紙筆沙沙聲,其餘中音
- 跳過/快轉不響;受「音效」總開關控制;設定裡另有「劇情打字音」開關(預設開,存在 state.typeSnd,舊存檔自動視為開)
"""
import glob, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src')
def F(p): g = glob.glob(os.path.join(ROOT, 'js', '02_main', p + '_*.js')); assert len(g) == 1, p; return g[0]
def rep(pre, old, new):
    p = F(pre); t = open(p, encoding='utf-8', newline='').read(); assert t.count(old) == 1, (pre, old[:60])
    open(p, 'w', encoding='utf-8', newline='').write(t.replace(old, new))
# 1. 音色
rep('001', "  vibrate(ms = 40) {", r"""  /* v95 劇情打字音:kind = low / mid / high / dark / nar */
  playType(kind) {
    if (!this.enabled || !this.ctx || this.ctx.state !== 'running') return;
    const c = this.ctx, now = c.currentTime, v = this.volume, out = c.destination;
    if (kind === 'nar') {   /* 紙筆沙沙:極短帶通噪音 */
      if (!this._nb) { const n = Math.floor(c.sampleRate * .06), bf = c.createBuffer(1, n, c.sampleRate), d = bf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n); this._nb = bf; }
      const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); s.buffer = this._nb;
      f.type = 'bandpass'; f.frequency.value = 2600 + Math.random() * 900; f.Q.value = 1.4; g.gain.setValueAtTime(.05 * v, now);
      s.connect(f); f.connect(g); g.connect(out); s.start(now); return;
    }
    const base = { low: 330, mid: 620, high: 1180, dark: 220 }[kind] || 620, o = c.createOscillator(), g = c.createGain();
    o.type = kind === 'high' ? 'sine' : 'triangle'; o.frequency.setValueAtTime(base * (1 + (Math.random() - .5) * .1), now);
    g.gain.setValueAtTime(.0001, now); g.gain.exponentialRampToValueAtTime((kind === 'high' ? .035 : .045) * v, now + .006); g.gain.exponentialRampToValueAtTime(.0001, now + (kind === 'low' || kind === 'dark' ? .09 : .055));
    o.connect(g); g.connect(out); o.start(now); o.stop(now + .1);
    if (kind === 'dark') { const o2 = c.createOscillator(), g2 = c.createGain(); o2.type = 'sawtooth'; o2.frequency.setValueAtTime(base / 2, now); g2.gain.setValueAtTime(.02 * v, now); g2.gain.exponentialRampToValueAtTime(.0001, now + .12); o2.connect(g2); g2.connect(out); o2.start(now); o2.stop(now + .13); }
  }
  vibrate(ms = 40) {""")
# 2. 劇情打字時觸發
rep('055', "    let i = 0;\n    typeT = setInterval(() => { i++; tx.textContent = chars.slice(0, i).join(''); if (i >= chars.length) { clearInterval(typeT); typeDone(); } }, per);",
    "    let i = 0, tc = 0; const PUN = /[\\s,.!?;:、,。!?;:…「」『』()()—~〜]/;\n    typeT = setInterval(() => { i++; tx.textContent = chars.slice(0, i).join(''); const ch = chars[i - 1]; if (PUN.test(ch)) tc = 0; else if (tc++ % 3 === 0 && state.typeSnd !== false && SD().spd !== 3) { try { audio.playType(VOICE95); } catch (e) { } } if (i >= chars.length) { clearInterval(typeT); typeDone(); } }, per);")
rep('055', "    const nm = $('st28nm'), tx = $('st28tx');\n    if (nar) {",
    "    const nm = $('st28nm'), tx = $('st28tx');\n    VOICE95 = nar ? 'nar' : voiceOf(w, name);\n    if (nar) {")
rep('055', "  function showLine(b) {",
    """  /* v95:說話者音色 */
  let VOICE95 = 'nar';
  function voiceOf(w, name) {
    if (w === 'tian' || /心魔|魔將|魔道/.test(name || '')) return 'dark';
    if (w === 'su' || w === 'ba' || /村民|師弟/.test(name || '') || (w === 'ye' && yeG() === 'f')) return 'high';
    if (['lr', 'tl', 'yh', 'situ'].includes(w) || /長老|老|管事|統領|仙人/.test(name || '')) return 'low';
    return 'mid';
  }
  function showLine(b) {""")
# 3. 設定開關
rep('046', "row('mn.help', '❓', '仙經・玩法說明',",
    "row('mn.tsnd', '🎐', '劇情打字音', state.typeSnd !== false ? '目前:開(對話逐字出現時的輕響)' : '目前:關') + row('mn.help', '❓', '仙經・玩法說明',")
rep('046', "  X.act('mn.help',", "  X.act('mn.tsnd', () => { state.typeSnd = state.typeSnd === false; saveGame(); X.refresh('mn'); try { audio.init(); audio.playType('mid'); } catch (e) { } });\n  X.act('mn.help',")
print('p24 ok')
