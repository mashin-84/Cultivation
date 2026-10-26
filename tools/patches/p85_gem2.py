#!/usr/bin/env python3
"""v170 Gemini 第二輪評論修正"""
import glob, os
R = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
def P(pat, pairs):
    fs = glob.glob(os.path.join(R, pat)); assert len(fs) == 1, (pat, fs); f = fs[0]
    s = open(f, encoding='utf-8').read()
    for a, b, n in pairs:
        c = s.count(a); assert c == n, (f, a[:60], c); s = s.replace(a, b)
    open(f, 'w', encoding='utf-8').write(s); print('ok', os.path.basename(f))
# 1 多周目說明文字
P('src/js/14_v48*.js', [("妖魔再增 ${cyc*20}%", "妖魔再增 ${cyc*5}%", 1)])
P('src/js/02_main/055_*.js', [
 ("每一周目吞納 +5%(至多 +15%),但突破所需修為 ×1.25。", "每一周目吐納 +30%(至多 +90%),突破所需修為不變,妖魔每世強 5%。", 1),
 # 7 遊學試煉不可帶過
 ("<button data-s28=\"fskip\">以劇情帶過(視為險勝)</button>`;", "${cfg.noskip ? '<button data-s28=\"exitok\">改日再來</button>' : '<button data-s28=\"fskip\">以劇情帶過(視為險勝)</button>'}`;", 1)])
P('src/js/08_v10_1*.js', [("target: 1.5, skill: '鎮山之威' })", "target: 1.5, skill: '鎮山之威', noskip: 1 })", 1)])
# 2/4/6 重要戰鬥(兩檔同步)
for f in ('src/js/35_v113_重要戰鬥.js', 'tools/patches/p48_bf.js'):
    P(f, [
     ("if (sc5 === 'sword' && a[0] !== 'pill') {", "if (sc5 === 'sword' && (a[0] === 'atk' || a[0] === 'ult' || (a[0] === 'sk' && B.sk[a[1]] && !/^(shield|heal|buff)$/.test(B.sk[a[1]].sk.type)))) {", 1),
     ("B.cd[k.id] = c.cd + 1; skName(sk.name); sfx('sfx_skill');", "B.cd[k.id] = c.cd + 1; skName(sk.name); sfx('sfx_skill'); if (!B.A && typeof skGainExp === 'function') try { skGainExp(k.id); } catch (e) { }", 1),
     ("const T = 1300, tStart = performance.now();", "const T = 1300; let tStart = performance.now();", 1),
     ("holding = false; v = 0; h.style.setProperty('--v', '0%');", "holding = false; v = 0; tStart = performance.now(); h.style.setProperty('--v', '0%');", 1)])
# 3 戰力提升快取
P('src/js/02_main/042*.js', [
 ("Object.keys((state.skills || {}).learned || {}).length].join('|'); };",
  "JSON.stringify((state.skills || {}).learned || {}), (state.sch || {}).dao || 0, JSON.stringify((state.sch || {}).nodes || {}), JSON.stringify(state.pets || {}), state.tfrag || 0, JSON.stringify(state.eggs || 0)].join('|'); };", 1),
 ("try { x.run(); } catch (e) { } try { updateTopBar();", "try { x.run(); } catch (e) { } memo = null; try { updateTopBar();", 1)])
