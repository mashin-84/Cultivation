#!/usr/bin/env python3
"""最終版143(測試用):拿掉換流派(冷卻、靈石)與更換道體(男女)的限制。
開關:src/js/02_main/003_… 之前的全域 window.FREE143 = true;要恢復限制時改成 false 即可"""
import os
R = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
def rep(p, old, new):
    p = os.path.join(R, p); s = open(p, encoding='utf-8', newline='').read()
    assert s.count(old) == 1, (p, old[:50]); open(p, 'w', encoding='utf-8', newline='').write(s.replace(old, new))
rep('src/js/02_main/038_v9_0-A_流派_輔修_心法_共鳴.js', "  const free = () => { const s = SCH(); return !s.main || s.rc !== rcNow(); };",
    "  const free = () => { if (window.FREE143) return true; const s = SCH(); return !s.main || s.rc !== rcNow(); };   /* FREE143:測試期間換流派免費、無冷卻 */")
rep('src/js/02_main/038_v9_0-A_流派_輔修_心法_共鳴.js', "    const c = s.sub ? Math.floor(swCost() / 2) : 0;",
    "    const c = s.sub && !window.FREE143 ? Math.floor(swCost() / 2) : 0;")
rep('src/js/02_main/033_v8_2_性別_形象換裝_洞府立繪微動_女修戰鬥立繪.js', "  const lockG14 = () => !!(state.story27",
    "  const lockG14 = () => !window.FREE143 && !!(state.story27")
rep('src/js/02_main/000_0_UTILS_FIX-B12_mem.js' if os.path.exists(os.path.join(R, 'src/js/02_main/000_0_UTILS_FIX-B12_mem.js')) else 'src/js/37_v138_圖示補完.js', '', '') if False else None
print('p65 ok')
