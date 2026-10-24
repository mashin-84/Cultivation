#!/usr/bin/env python3
"""最終版142:重要戰鬥依主流派換動作與出招方式(目前只有新手服男款有流派圖,其他外觀沿用劍修)
- 圖鍵:BP/{性別}_{外觀}_{流派}_{1..9}(流派 = magic/body/pill;劍修沿用原本 {性別}_{外觀}_{n})
- 法修:原地施法。普攻 = 甩出符咒飛向敵人;攻擊神通 = 指天召喚,天降一擊;絕學 = 符咒環身 → 雙手舉符,群符飛起 → 天降轟擊
- 體修:同劍修(衝上前),拳掌出擊
- 丹修:攻擊神通與絕學出手前先開爐服丹(動作 4);輔助神通本身就是服丹"""
import os
R = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
def rep(s, old, new, f):
    assert s.count(old) == 1, (f, old[:60], s.count(old)); return s.replace(old, new)
# 圖檔登記
p = os.path.join(R, 'src/js/34b_v115_主角戰鬥動作.js'); s = open(p, encoding='utf-8', newline='').read()
keys = [f'M_o1_{sc}_{i}' for sc in ('magic', 'body', 'pill') for i in range(1, 10)] + ['talisman']
for k in keys: assert os.path.exists(os.path.join(R, 'src/assets/BP', k + '.webp')), k
s = rep(s, '"M_o2_9": "data:image/webp;base64,@@IMG:BP/M_o2_9@@"', '"M_o2_9": "data:image/webp;base64,@@IMG:BP/M_o2_9@@", ' + ', '.join(f'"{k}": "data:image/webp;base64,@@IMG:BP/{k}@@"' for k in keys), p)
open(p, 'w', encoding='utf-8', newline='').write(s)

E = []
E.append(("  const pose = n => { const g = state.gender === 'f' ? 'F_' : 'M_', lk = state.look || 'o1'; return BPX[g + lk + '_' + n] || BPX[g + 'o1_' + n] || ''; };",
"""  /* v142 主流派(練氣期尚未分流派 → 劍修)。流派圖只在「該外觀有該流派圖」時使用,否則沿用該外觀的劍修圖 */
  const SCM = () => { try { const m = (state.realmIdx || 0) >= 1 && window.SCH19 ? SCH19.SCH().main : ''; return m && m !== 'sword' ? m : ''; } catch (e) { return ''; } };
  const pkey = n => { const g = state.gender === 'f' ? 'F_' : 'M_', lk = state.look || 'o1', sc = SCM(); if (sc && BPX[g + lk + '_' + sc + '_' + n]) return g + lk + '_' + sc + '_' + n; return BPX[g + lk + '_' + n] ? g + lk + '_' + n : g + 'o1_' + n; };
  const STY = () => { const k = pkey(2); return /_magic_/.test(k) ? 'magic' : /_body_/.test(k) ? 'body' : /_pill_/.test(k) ? 'pill' : 'sword'; };
  const pose = n => BPX[pkey(n)] || '';"""))
E.append(("  const tip = n => { const g = state.gender === 'f' ? 'F_' : 'M_'; return TIPS[g + (state.look || 'o1') + '_' + n] || TIPS[g + 'o1_' + n] || [.6, .35]; };",
"  const tip = n => { const g = state.gender === 'f' ? 'F_' : 'M_'; return TIPS[pkey(n)] || TIPS[g + (state.look || 'o1') + '_' + n] || TIPS[g + 'o1_' + n] || [.6, .35]; };"))
E.append(("M_o5_8: [.998, .097]", "M_o5_8: [.998, .097], M_o1_magic_2: [.798, .232], M_o1_magic_3: [.763, .143], M_o1_magic_8: [.825, .051], M_o1_body_2: [.77, .235], M_o1_body_3: [.727, .199], M_o1_body_8: [.716, .386], M_o1_pill_2: [.795, .322], M_o1_pill_3: [.729, .202], M_o1_pill_8: [.835, .245]"))
# 特效:飛符、天降、服丹
E.append(("  function fxBolt(col, n) {",
"""  /* v142 流派特效 */
  function handAt(n) { const p = $('bf-pi'), s = $('bf-stg'); const r = p.getBoundingClientRect(), q = s.getBoundingClientRect(), t = tip(n); return [r.left - q.left + r.width * t[0], r.top - q.top + r.height * t[1]]; }
  function fxTal(col, from, to, ms, delay) {
    return new Promise(res => setTimeout(() => {
      const [sx, sy] = from, [ex, ey] = to, d = fxEl('fx-tal', sx, sy, { '--c': col || '#fde68a', backgroundImage: `url(${BPX.talisman || ''})` });
      const a = d.animate([{ transform: 'translate(0,0) rotate(-20deg) scale(.7)', opacity: 1 }, { transform: `translate(${ex - sx}px,${ey - sy}px) rotate(${340 + Math.random() * 60}deg) scale(1.05)`, opacity: 1 }], { duration: ms || 300, easing: 'cubic-bezier(.4,0,.8,.6)' });
      a.onfinish = () => { d.remove(); res(); };
    }, delay || 0));
  }
  function fxSky(col, big) {
    const [x, y] = center('bf-ei'), d = fxEl('fx-sky' + (big ? ' big' : ''), x, 0, { '--c': col || '#c4b5fd', height: y + 'px' });
    setTimeout(() => { d.remove(); fxArc(col); }, big ? 520 : 380);
  }
  function fxPill() { const [x, y] = center('bf-pi'); const d = fxEl('fx-aura bf', x, y - 40); setTimeout(() => d.remove(), 800); num('p', '服丹', 'tx'); }
  async function swallow() { setPose(4); fxPill(); sfx('sfx_skill'); await sleep(520); }
  function fxBolt(col, n) {"""))
# 普攻
E.append(("""    for (let k = 0; k < n && B.e.hp > 0; k++) {   /* 每一斬:衝上去 → 命中 → 退回(像 Pokémon GO 連打) */""",
"""    if (STY() === 'magic') {   /* 法修:原地連甩符咒 */
      for (let k = 0; k < n && B.e.hp > 0; k++) {
        setPose(2); await fxTal(q === 'pf' ? '#fff3b0' : '#fde68a', handAt(2), center('bf-ei'), k ? 230 : 300); fxArc('#fde68a');
        await dealE(tot / n, 1, cr && k === n - 1); setPose(1); await sleep(k === n - 1 ? 160 : 60);
      }
      return;
    }
    for (let k = 0; k < n && B.e.hp > 0; k++) {   /* 每一斬:衝上去 → 命中 → 退回(像 Pokémon GO 連打) */"""))
E.append(("    log(q === 'pf' ? '劍光如虹,三連斬命中要害!' : q === 'gd' ? '道友連斬兩劍。' : '劍勢一偏,只削到衣角。');",
"""    { const L = { sword: ['劍光如虹,三連斬命中要害!', '道友連斬兩劍。', '劍勢一偏,只削到衣角。'], magic: ['三張符咒接連炸開,張張命中!', '兩張符咒破空而去。', '符咒偏了準頭,只擦過一角。'], body: ['拳如崩山,三連擊結結實實打中!', '兩拳接連轟出。', '拳勢落空,只擦過衣角。'], pill: ['丹爐連砸三記,砸得對手踉蹌!', '丹爐砸中兩下。', '丹爐只擦過對手。'] }[STY()]; log(q === 'pf' ? L[0] : q === 'gd' ? L[1] : L[2]); }"""))
E.append(("setPose(1); const q = await qTiming('⚔ 仙劍普攻');", "setPose(1); const q = await qTiming('⚔ ' + ATKN()[0]);"))
E.append(("    rs += row('atk', 'data-bf=\"atk\"', '<b>⚔</b>', '仙劍普攻', '看準時機・最多三連斬', 0, lock);",
"    rs += row('atk', 'data-bf=\"atk\"', '<b>⚔</b>', ATKN()[0], ATKN()[1], 0, lock);"))
E.append(("  const pose = n => BPX[pkey(n)] || '';",
"  const pose = n => BPX[pkey(n)] || '';\n  const ATKN = () => ({ sword: ['仙劍普攻', '看準時機・最多三連斬'], magic: ['飛符術', '看準時機・最多三張連發'], body: ['崩山拳', '看準時機・最多三連擊'], pill: ['丹爐撞擊', '看準時機・最多三連擊'] })[STY()];"))
# 攻擊神通
E.append(("    B.fxc = sk.el && window.SK_EL_COLOR ? SK_EL_COLOR[sk.el] : '#bfe3ff'; go(.22, .9, 160); setPose(3); setTimeout(() => { if (B && !B.over) { setPose(1); back(240); } }, 900); fxBolt(sk.el && window.SK_EL_COLOR ? SK_EL_COLOR[sk.el] : '#bfe3ff', Math.min(3, sk.type === 'atk' ? c.hits : 1)); await sleep(280);",
"""    B.fxc = sk.el && window.SK_EL_COLOR ? SK_EL_COLOR[sk.el] : '#bfe3ff'; const sty = STY(), nb = Math.min(3, sk.type === 'atk' ? c.hits : 1);
    if (sty === 'pill') await swallow();
    if (sty === 'magic') { setPose(3); setTimeout(() => { if (B && !B.over) setPose(1); }, 1000); for (let j = 0; j < nb; j++) setTimeout(() => fxSky(B.fxc), 140 + j * 150); await sleep(420); }
    else { go(.22, .9, 160); setPose(3); setTimeout(() => { if (B && !B.over) { setPose(1); back(240); } }, 900); fxBolt(B.fxc, nb); await sleep(280); }"""))
# 輔助神通:丹修本身就是服丹(動作 4),加個服丹字樣
E.append(("      setPose(4, 900); fxAura(sk.type === 'shield' ? 'sh' : sk.type === 'heal' ? 'hl' : 'bf');",
"      setPose(4, 900); fxAura(sk.type === 'shield' ? 'sh' : sk.type === 'heal' ? 'hl' : 'bf'); if (STY() === 'pill') num('p', '服丹', 'tx');"))
# 絕學
E.append(("    await ultCut();\n    const uc = ULTC[B.ult.n] || '#bfe3ff', pi = $('bf-pi'); pi.style.setProperty('--uc', uc); setPose(7); pi.classList.add('chg');",
"    await ultCut();\n    const sty = STY(); if (sty === 'pill') await swallow();\n    const uc = ULTC[B.ult.n] || '#bfe3ff', pi = $('bf-pi'); pi.style.setProperty('--uc', uc); setPose(7); pi.classList.add('chg');"))
E.append(("""    const T = thrustT(tip(2));
    /* 爆發:躍出約一半距離並騰空 */""",
"""    if (sty === 'magic') {   /* 法修:原地舉符,群符飛起 → 天降轟擊 */
      setPose(8); { const fl = fxEl('fx-flash', 0, 0, { '--c': uc }); setTimeout(() => fl.remove(), 900); } speed(uc); sfx('sfx_ult'); skName(B.ult.n);
      const [hx, hy] = handAt(8), [ex, ey] = center('bf-ei');
      await Promise.all([0, 1, 2, 3, 4].map(j => fxTal(uc, [hx + (j - 2) * 22, hy], [ex + (j - 2) * 34, Math.max(20, ey - 150 - (j % 2) * 30)], 380, j * 60)));
      fxSky(uc, true); await sleep(200); fxBurst(uc); shake();
    } else {
    const T = thrustT(tip(2));
    /* 爆發:躍出約一半距離並騰空 */"""))
E.append(("    setPose(2); if (T) await mvTo(T, 150, 'cubic-bezier(.5,0,.9,.6)');\n    fxBurst(uc); shake();",
"    setPose(2); if (T) await mvTo(T, 150, 'cubic-bezier(.5,0,.9,.6)');\n    fxBurst(uc); shake();\n    }"))
# CSS
E.append((".fx-bolt{", ".fx-tal{width:30px;height:52px;margin:-26px 0 0 -15px;background:center/contain no-repeat;filter:drop-shadow(0 0 6px var(--c)) drop-shadow(0 0 2px #fff)}\n.fx-sky{top:0!important;width:64px;margin-left:-32px;transform-origin:50% 0;background:linear-gradient(90deg,transparent,color-mix(in srgb,var(--c) 55%,transparent) 30%,#fff 47%,#fff 53%,color-mix(in srgb,var(--c) 55%,transparent) 70%,transparent);-webkit-mask-image:linear-gradient(180deg,transparent,#000 35%,#000 92%,transparent);mask-image:linear-gradient(180deg,transparent,#000 35%,#000 92%,transparent);filter:blur(1.5px) drop-shadow(0 0 12px var(--c));mix-blend-mode:screen;animation:fxSky .38s ease-in forwards}\n.fx-sky.big{width:150px;margin-left:-75px;animation-duration:.52s}\n@keyframes fxSky{0%{transform:scaleY(0);opacity:1}55%{transform:scaleY(1);opacity:1}100%{transform:scaleY(1);opacity:0}}\n.fx-bolt{"))
for f in ('src/js/35_v113_重要戰鬥.js', 'tools/patches/p48_bf.js'):
    p = os.path.join(R, f); s = open(p, encoding='utf-8', newline='').read()
    for o, n in E: s = rep(s, o, n, f)
    open(p, 'w', encoding='utf-8', newline='').write(s)
print('p64 ok')
