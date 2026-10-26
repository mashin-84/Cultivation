#!/usr/bin/env python3
"""v168 重要戰鬥補上流派被動(與一般歷練同規則;劇情腳本戰不套用):
劍修第 5 次出手 ×1.8、法修施放神通後三枚靈球追擊(基礎 ×1.2)、體修開戰護盾 15% 與殘血(<30%)再一次、丹修每次出手回 2% 氣血。
本命絕學「按住蓄力」按太短不算失誤,重來並提示。劇情戰開場提示「依你當下能力演算」。35_v113 與 p48_bf.js 同步。"""
import os
R = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
P = [
 ("  function base(mult) { return baseOf(B, mult, B.p.buff); }",
  "  function base(mult) { return baseOf(B, mult, B.p.buff) * (B.swX || 1); }\n  const SCHM = () => { try { return (state.realmIdx || 0) >= 1 && window.SCH19 ? SCH19.SCH().main || '' : ''; } catch (e) { return ''; } };"),
 ("      if (a[0] === 'atk') await doAtk(); else if (a[0] === 'sk') await doSkill(a[1]);",
  """      const sc5 = B.A ? '' : SCHM();   /* v168 流派被動 */
      if (sc5 === 'pill' && a[0] !== 'pill') { const h = Math.floor(B.p.max * .02); if (h > 0 && B.p.hp < B.p.max) { B.p.hp = Math.min(B.p.max, B.p.hp + h); num('p', '+' + fm(h), 'hl'); } }
      if (sc5 === 'sword' && a[0] !== 'pill') { B.swN = (B.swN || 0) + 1; if (B.swN % 5 === 0) { B.swX = 1.8; num('p', '劍氣貫穿', 'tx'); } }
      if (a[0] === 'atk') await doAtk(); else if (a[0] === 'sk') await doSkill(a[1]);"""),
 ("      if (a[0] !== 'pill' && !B.A) await petHit();",
  """      if (B.swX) { B.swX = 0; log('劍意凝聚,這一擊化為劍氣貫穿(傷害 ×1.8)!'); }
      if (sc5 === 'magic' && a[0] === 'sk' && B.e.hp > 0) { await sleep(250); const d = Math.floor(base(1.2)); B.e.hp = Math.max(0, B.e.hp - d); impact('#c4b5fd', false); num('e', fm(d), ''); log(`三枚靈球追射,再造成 ${fm(d)} 傷害。`); ui(); await sleep(300); }
      if (a[0] !== 'pill' && !B.A) await petHit();"""),
 ("      if (B.p.hp <= 0) return end(false);\n      Object.keys(B.cd)",
  "      if (B.p.hp <= 0) return end(false);\n      if (sc5 === 'body' && !B.bodyLow && B.p.hp / B.p.max < .3) { B.bodyLow = true; B.p.sh = Math.max(B.p.sh, Math.floor(B.p.max * .15)); num('p', '🛡' + fm(B.p.sh), 'hl'); log('金身護體,危急之際再得護盾。'); ui(); }\n      Object.keys(B.cd)"),
 ("    ui(); log('');\n    await cut(",
  "    if (!B.A && SCHM() === 'body') B.p.sh = Math.max(B.p.sh || 0, Math.floor(B.p.max * .15));   /* v168 體修開戰護盾 */\n    ui(); log('');\n    await cut("),
 ("    goBurst(); log(B.A && B.A.who ? `輪到${B.A.who}出手。` : '輪到道友出手。');",
  "    goBurst(); log(B.A && B.A.who ? `輪到${B.A.who}出手。` : cfg.story160 ? '輪到道友出手。<br><span style=\"font-size:12px;opacity:.85\">〔劇情戰:對手依你當下的能力而定,無法單靠數值碾壓——看準時機、善用神通與絕學才是勝負關鍵〕</span>' : '輪到道友出手。');"),
 ("      window.BF113.start(Object.assign({}, cfg)).then(win => { try { saveGame(); updateTopBar(); }",
  "      window.BF113.start(Object.assign({}, cfg, { story160: true })).then(win => { try { saveGame(); updateTopBar(); }"),
 ("      q.onpointerup = () => { if (holding) fin(); };",
  "      q.onpointerup = () => { if (!holding) return; if (performance.now() - t0 < 250) { holding = false; v = 0; h.style.setProperty('--v', '0%'); h.querySelector('span').innerHTML = '要按住<br>不要放'; return; } fin(); };   /* v168 點一下不算失誤 */"),
]
for p in ['src/js/35_v113_重要戰鬥.js', 'tools/patches/p48_bf.js']:
    f = os.path.join(R, p); t = open(f, encoding='utf-8').read()
    if 'v168 流派被動' in t: print(p, '已套用'); continue
    for o, n in P:
        if o not in t and 'TB26.story' in o: continue
        if t.count(o) != 1:
            if 'BF113.start(Object.assign({}, cfg)).then' in o and p.endswith('p48_bf.js'): continue
            raise SystemExit(f'{p} 找不到: {o[:60]}')
        t = t.replace(o, n)
    open(f, 'w', encoding='utf-8').write(t); print(p, 'OK')
