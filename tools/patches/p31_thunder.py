#!/usr/bin/env python3
"""最終版102:雷劫音效
- 雷劫視窗開著時循環播放雷雨背景音 amb_thunder(淡入淡出,無縫循環)
- 每一重雷劈下:sfx_thunder(檔案沒有時沿用合成雷聲)
"""
import os
SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src')
def sub(path, old, new, n=1):
    p = os.path.join(SRC, path); s = open(p, encoding='utf-8', newline='').read()
    assert s.count(old) == n, (path, old[:60], s.count(old)); s = s.replace(old, new); open(p, 'w', encoding='utf-8', newline='').write(s)
J = 'js/29_v101_音效.js'
sub(J, "sfx_hurt: .6 };", "sfx_hurt: .6, sfx_thunder: 1, amb_thunder: .7 };")
sub(J, "  const _init = audio.init.bind(audio);", r"""  /* 循環背景音:loop(名稱, 開/關) */
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
  const _init = audio.init.bind(audio);""")
sub(J, "return { play, preload,", "return { play, loop, preload,")
sub('js/02_main/007_6_CORE_GAMEPLAY_ACTIONS_FIX-.js', "  function strike() {\n    audio.playThunder();", "  function strike() {\n    if (!SFX.play('sfx_thunder')) audio.playThunder();")
print('p31 ok')
