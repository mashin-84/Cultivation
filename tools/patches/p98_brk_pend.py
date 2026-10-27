# 最終版188:突破後若正在戰鬥,記下待播,這場打完、下一場開打前立刻播(不套間隔)
import glob
def P(pat, pairs):
    f = glob.glob('src/js/' + pat)[0]; t = open(f, encoding='utf8').read()
    for a, b in pairs:
        n = t.count(a); assert n == 1, (f, a[:40], n); t = t.replace(a, b)
    open(f, 'w', encoding='utf8').write(t); print('OK', f, len(pairs))
P('02_main/055_v11_0*.js', [(
 "  ST.now = () => { try { if (!NODES.length || blocked() || !state.gender) return; const m = nextMain(); if (m && m.auto && !declined[m.id] && safe(m.at)) play(m.id); } catch (e) { } };   /* v186 突破後立刻播 */",
 "  let nowPend = 0;   /* v188 突破時正在戰鬥:待播,這場打完立刻播 */\n"
 "  ST.now = () => { try { if (!NODES.length || !state.gender) return; const m = nextMain(); if (!(m && m.auto && !declined[m.id] && safe(m.at))) { nowPend = 0; return; } if (blocked()) { if (!run) nowPend = Date.now(); return; } nowPend = 0; play(m.id); } catch (e) { } };   /* v186 突破後立刻播 */\n"
 "  ST.pend = () => !!nowPend && Date.now() - nowPend < 60000;\n"
 "  setInterval(() => { if (!nowPend) return; if (Date.now() - nowPend >= 60000) { nowPend = 0; return; } if (!blocked()) ST.now(); }, 150);")])
P('02_main/009_*.js', [(
 "function stepAdventure() {\n  if (eventModalOpen()) return; // 奇遇進行中,歷練暫停",
 "function stepAdventure() {\n  if (eventModalOpen()) return; // 奇遇進行中,歷練暫停\n  if (!currentBattle && window.ST28 && ST28.pend && ST28.pend()) return; // v188 突破劇情待播,先不開下一場")])
