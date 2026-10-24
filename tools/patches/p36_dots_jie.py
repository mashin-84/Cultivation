#!/usr/bin/env python3
"""最終版108:
1. 人物頁下排「流派、煉體、天機」補紅點(並算進底部「人物」分頁紅點)
   - 流派:本命或輔修有可點的心法(境界夠、道行夠)
   - 煉體:未達上限且靈石夠
   - 天機:神識可升(未達上限、靈石夠)或道果可吃(仙緣夠)
2. 九重劫/心魔/宗門試煉:自動歷練中的一般戰鬥會自動收劍讓出,不再擋「正在戰鬥中」
"""
import os
SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src')
def sub(path, old, new, n=1):
    import glob
    p = glob.glob(os.path.join(SRC, path))[0]; s = open(p, encoding='utf-8', newline='').read()
    assert s.count(old) == n, (path, old[:60], s.count(old)); open(p, 'w', encoding='utf-8', newline='').write(s.replace(old, new))
J = 'js/02_main/037_*.js'
sub(J, "  /* ---------- 介面 ---------- */", """  window.XJ37 = { alert: () => { try { if (!open0()) return false; const s = SH(), cap = shenCap(); if (BR.some(b => s[b.k] < cap && state.stones >= shenCost(s[b.k]))) return true; const g = GU(); return GO.some(o => g[o.k] < GMAX && (state.xian || 0) >= gCost(g[o.k])); } catch (e) { return false; } } };   /* v108 天機紅點 */
  /* ---------- 介面 ---------- */""")
sub(J, "    if (currentBattle) { showToast('正在戰鬥中。'); return; }\n", "")
sub(J, "    const st = calculateTotalStats(); if (hpGate(st)) return;\n    window.JIE49 = { show: false, n, was: !!state.autoExplore ||",
       "    const st = calculateTotalStats(); if (hpGate(st)) return;\n    const wasA108 = !!state.autoExplore; if (currentBattle && !(window.HO43 && HO43.yieldBattle())) { showToast('正在戰鬥中。'); return; }   /* v108 一般歷練戰鬥自動讓出 */\n    window.JIE49 = { show: false, n, was: wasA108 ||")
sub('js/02_main/038_*.js', "  /* ---------- 介面 ---------- */", """  window.SC38 = { alert: () => { try { if (!schOK()) return false; const s = SCH(); return [s.main, s.sub].filter(Boolean).some(sc => SC[sc] && SC[sc].nodes.some((nd, i) => { const L = nodeLv(sc, i); return L < 3 && R() >= tierOf(i) && s.dao >= nCost(i, L + 1); })); } catch (e) { return false; } } };   /* v108 流派紅點 */
  /* ---------- 介面 ---------- */""")
sub('js/02_main/007_*.js', "  if (currentBattle) { showToast('戰鬥中，無法引動心魔！'); return; }", "  if (currentBattle && !(window.HO43 && HO43.yieldBattle())) { showToast('戰鬥中，無法引動心魔！'); return; }")
sub('js/02_main/031_*.js', "if (currentBattle) { showToast('戰鬥中無法接受試煉。'); return; }", "if (currentBattle && !(window.HO43 && HO43.yieldBattle())) { showToast('戰鬥中無法接受試煉。'); return; }")
C = 'js/16_v12_0_*.js'
sub(C, "  window.CH51 = { alert: () => { try { return ORDER.some(slotDot) || techDot() || talDot(); } catch (e) { return false; } } };",
       "  const xDot = { sch: () => !!(window.SC38 && SC38.alert()), body: () => { try { return (state.body || 0) < bodyCap() && state.stones >= bodyCost(); } catch (e) { return false; } }, xian: () => !!(window.XJ37 && XJ37.alert()) };   /* v108 */\n  window.CH51 = { alert: () => { try { return ORDER.some(slotDot) || techDot() || talDot() || xDot.sch() || xDot.body() || xDot.xian(); } catch (e) { return false; } } };")
sub(C, "${xlBtn('派', '流派', 'data-m6=\"0\"')}${xlBtn('體', '煉體', 'data-m6=\"5\"')}${xlBtn('機', '天機', 'data-m6=\"1\"')}",
       "${xlBtn('派', '流派', 'data-m6=\"0\"', xDot.sch() ? '<i class=\"rd\"></i>' : '')}${xlBtn('體', '煉體', 'data-m6=\"5\"', xDot.body() ? '<i class=\"rd\"></i>' : '')}${xlBtn('機', '天機', 'data-m6=\"1\"', xDot.xian() ? '<i class=\"rd\"></i>' : '')}")
print('p36 ok')
