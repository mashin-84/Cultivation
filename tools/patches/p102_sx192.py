# 最終版192:神通命中特效與持續狀態(火焰燃燒、落雷、冰封、地裂、劍雨、噬血、虛空…)
import glob
def P(pat, pairs):
    fs = glob.glob(pat); assert len(fs) == 1, (pat, fs); f = fs[0]; t = open(f, encoding='utf8').read()
    for a, b in pairs:
        n = t.count(a); assert n == 1, (f, a[:50], n); t = t.replace(a, b)
    open(f, 'w', encoding='utf8').write(t); print('OK', f.split('/')[-1], len(pairs))
P('src/index.html', [("@@INC:js/44_v174_動畫過場.js@@\n", "@@INC:js/44_v174_動畫過場.js@@\n@@INC:js/45_v192_神通特效.js@@\n")])
# 一般歷練:記下灼燒/定身是哪個神通造成(決定火焰/冥火/中毒、冰封/暈眩/束縛)
P('src/js/02_main/018_*.js', [
 ("B.dot = { dmg: Math.max(1, Math.floor(base * c.dot)), turns: c.turns }; logAdventure(", "B.dot = { dmg: Math.max(1, Math.floor(base * c.dot)), turns: c.turns }; B.dotFx = sk.id; logAdventure("),
 ("B.stun = m.isBoss ? Math.min(1, c.stun) : c.stun; fx.stunned();", "B.stun = m.isBoss ? Math.min(1, c.stun) : c.stun; B.stunFx = sk.id; fx.stunned();"),
])
P('src/js/02_main/051_*.js', [
 ("m.curHp = Math.max(0, m.curHp - d); fx.hit(d, cr, k, 0);", "m.curHp = Math.max(0, m.curHp - d); fx._sk = 'ult_' + sc; fx.hit(d, cr, k, 0);"),
 ("B.dot = { dmg: Math.max(1, Math.floor(base * .35)), turns: 3 }; logAdventure(", "B.dot = { dmg: Math.max(1, Math.floor(base * .35)), turns: 3 }; B.dotFx = 'ult_magic'; logAdventure("),
 ("else { B.stun = 1; fx.stunned(); }", "else { B.stun = 1; B.stunFx = 'ult_magic'; fx.stunned(); }"),
])
# 重要戰鬥(兩份同步)
for f in ['src/js/35_v113_重要戰鬥.js', 'tools/patches/p48_bf.js']:
    P(f, [
     ("impact(B.fxc || '#ffffff', crit); num('e', fm(v), crit ? 'cr' : '');",
      "impact(B.fxc || '#ffffff', crit); try { if (window.SX192 && key) SX192.hit('b', key, (window.SK_BY_ID && SK_BY_ID[key] || {}).fx, { i, n: hits, crit }); } catch (e) { } num('e', fm(v), crit ? 'cr' : '');"),
     ("    await dealE(total, hits, cr);\n    if (sk.type === 'burn') { B.e.dot = { dmg: Math.floor(base(c.dot) * f), turns: c.turns };",
      "    await dealE(total, hits, cr, sk.id);\n    if (sk.type === 'burn') { B.e.dot = { dmg: Math.floor(base(c.dot) * f), turns: c.turns }; B.e.dotFx = sk.id;"),
     ("B.e.stun = 1; B.e.charge = 0; num('e', '暈眩', 'tx');", "B.e.stun = 1; B.e.stunFx = sk.id; B.e.charge = 0; num('e', '暈眩', 'tx');"),
     ("* ultDm(B), 5, ucr);", "* ultDm(B), 5, ucr, 'ult_' + ((B.ult && B.ult.k) || 'sword'));"),
     ("if (uk === 'magic' && B.e.hp > 0) { B.e.dot = { dmg: Math.max(1, Math.floor(base(.35))), turns: 3 };", "if (uk === 'magic' && B.e.hp > 0) { B.e.dotFx = B.e.stunFx = 'ult_magic'; B.e.dot = { dmg: Math.max(1, Math.floor(base(.35))), turns: 3 };"),
     ("$('bf-es').textContent = s.join(' '); $('bf-ei').classList.toggle('charge', !!B.e.charge);",
      "$('bf-es').textContent = s.join(' '); $('bf-ei').classList.toggle('charge', !!B.e.charge); try { if (window.SX192) SX192.sync('b', SX192.stOf(B.e, B.e.dotFx, B.e.stunFx)); } catch (e) { }"),
     ("num('e', '🔥' + fm(E.dot.dmg), 'pd');", "num('e', '🔥' + fm(E.dot.dmg), 'pd'); try { if (window.SX192) SX192.tick('b', E.dotFx); } catch (e) { }"),
    ])
