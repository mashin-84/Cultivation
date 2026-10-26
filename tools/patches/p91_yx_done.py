# v178:已取得該境界宗門功法(sectGrad)的遊學,自動標為看過,不再永遠鎖著
import glob
f = glob.glob('src/js/08_v10_1_*.js')[0]; s = open(f, encoding='utf8').read()
old = "  for (let r = 0; r <= 7; r++) {\n    const list = SE.SECTS.filter(x => x.r === r); if (!list.length) continue;"
assert s.count(old) == 1
new = "  /* v178 遊學已完成(功法已拿到)但劇情沒標看過 → 補標,避免永遠鎖住 */\n  setInterval(() => { try { const sn = state.story27 && state.story27.seen; if (!sn) return; for (let r = 0; r <= 7; r++) if (!sn['yx.' + r] && inGrad(r)) sn['yx.' + r] = 1; } catch (e) { } }, 2000);\n" + old
open(f, 'w', encoding='utf8').write(s.replace(old, new)); print(f.split('/')[-1], '比對 1 次')
