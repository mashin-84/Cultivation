#!/usr/bin/env python3
"""最終版101:真實音效檔(src/pwa/sfx/*.mp3)
- 網站版:build 把 @@SFXMAP@@ 換成 {名稱: 檔案雜湊};單檔版換成 {} → 全部沿用合成音效
- SFX.play(名稱) 成功回傳 true;檔案沒有或還沒載好回傳 false,呼叫端改播合成音效
- 本批:普攻 sfx_hit、神通 sfx_skill、本命絕學 sfx_ult、受擊 sfx_hurt(自動歷練不在歷練分頁時一律靜音,同原本規則)
"""
import os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
SRC = os.path.join(ROOT, 'src')
def sub(path, old, new, n=1):
    p = os.path.join(SRC, path); s = open(p, encoding='utf-8', newline='').read()
    assert s.count(old) == n, (path, old[:60], s.count(old)); s = s.replace(old, new); open(p, 'w', encoding='utf-8', newline='').write(s)
# 1. build.py
p = os.path.join(ROOT, 'build.py'); s = open(p, encoding='utf-8').read()
old = "    html = re.sub(r'@@IMG:([^@]+)@@', img, html)\n"; assert s.count(old) == 1
s = s.replace(old, old + "    html = html.replace('@@SFXMAP@@', json.dumps(sfxmap() if site else {}))\n")
old = "def build(site=False):"; assert s.count(old) == 1
s = s.replace(old, '''def sfxmap():   # 網站版音效清單 {名稱: 雜湊}
    d = os.path.join(SRC, 'pwa', 'sfx')
    if not os.path.isdir(d): return {}
    return {f[:-4]: hashlib.md5(open(os.path.join(d, f), 'rb').read()).hexdigest()[:8] for f in sorted(os.listdir(d)) if f.endswith('.mp3')}

''' + old)
old = "    json.dump(['./' + u for u in urls]"; assert s.count(old) == 1
s = s.replace(old, "    urls += ['sfx/%s.mp3?v=%s' % kv for kv in sfxmap().items()]\n" + old)
if '\nimport json' not in s and 'import json' not in s.split('def ')[0]:
    s = s.replace('import ', 'import json, ', 1)
open(p, 'w', encoding='utf-8').write(s)
# 2. sw:音效也走快取優先
sub('pwa/sw.js', "/\\/(assets|music)\\//", "/\\/(assets|music|sfx)\\//")
# 3. 音效模組
sub('index.html', '@@INC:js/28_v100_存檔診斷.js@@', '@@INC:js/28_v100_存檔診斷.js@@\n@@INC:js/29_v101_音效.js@@')
js = os.path.join(SRC, 'js', '29_v101_音效.js'); assert not os.path.exists(js)
open(js, 'w', encoding='utf-8', newline='').write(r"""/* ===== v101 真實音效檔:SFX.play(名稱) → true 已播放 / false 改用合成音效 ===== */
window.SFX = (() => {
  const MAP = @@SFXMAP@@, buf = {}, busy = {};
  const GAIN = { sfx_hit: .7, sfx_skill: .8, sfx_ult: 1, sfx_hurt: .6 };
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
  const _init = audio.init.bind(audio);
  audio.init = function () { const r = _init.apply(this, arguments); preload(); return r; };
  return { play, preload, has: n => !!MAP[n] };
})();
""")
# 4. 接上戰鬥
sub('js/02_main/018_v6-B_戰鬥_多神通_與動畫舞台.js', "  audio.init(); if (!isQuietAuto()) audio.playSlash();\n",
    "  audio.init(); if (!isQuietAuto() && !SFX.play(sk ? 'sfx_skill' : 'sfx_hit')) audio.playSlash();\n")
sub('js/02_main/018_v6-B_戰鬥_多神通_與動畫舞台.js', "    if (dmg > 0) { fx.num('-' + formatNum(dmg), 'pdmg', 'p'); fx.playerHit(); }\n",
    "    if (dmg > 0) { fx.num('-' + formatNum(dmg), 'pdmg', 'p'); fx.playerHit(); if (!isQuietAuto()) SFX.play('sfx_hurt'); }\n")
sub('js/02_main/051_流派_回合制中的心法加成與本命絕學.js', "battleLock = true; updateBattleUI(); audio.init(); if (!isQuietAuto()) audio.playSlash();",
    "battleLock = true; updateBattleUI(); audio.init(); if (!isQuietAuto() && !SFX.play('sfx_ult')) audio.playSlash();")
print('p30 ok')
