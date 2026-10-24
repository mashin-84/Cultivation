#!/usr/bin/env python3
"""最終版109:煉體在最後一個大境界(大羅金仙)不設上限
- 價格照舊每重 ×1.3,自然只能慢慢煉
- 文字:未到最後境界仍顯示「每個大境界可多煉 5 重」,到了改為「再無上限」說明
- 煉血之後進度條每 8 重一段
"""
import os, glob
SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src')
def sub(path, old, new, n=1):
    p = glob.glob(os.path.join(SRC, path))[0]; s = open(p, encoding='utf-8', newline='').read()
    assert s.count(old) == n, (path, old[:60], s.count(old)); open(p, 'w', encoding='utf-8', newline='').write(s.replace(old, new))
F = 'js/02_main/019_*.js'
sub(F, "function bodyCap() { return ((state.realmIdx || 0) + 1) * 5; }",
       "function bodyUnl() { return (state.realmIdx || 0) >= REALM_DATA.length - 1; }   /* v109 大羅金仙:煉體無上限 */\nfunction bodyCap() { return bodyUnl() ? 1e9 : ((state.realmIdx || 0) + 1) * 5; }")
sub(F, "const lo = s * 8, hi = s === 5 ? Math.max(cap, 48) : lo + 8,",
       "const lo = s < 5 ? s * 8 : 40 + Math.floor((b - 40) / 8) * 8, hi = lo + 8,")
sub(F, "<div class=\"text-[10px] text-slate-500 mt-1\">每個大境界可多煉 5 重,轉世後需重新錘鍊。</div>",
       "<div class=\"text-[10px] text-slate-500 mt-1\">${bodyUnl() ? '已至大羅金仙,肉身錘鍊再無上限,唯每重所耗靈石倍增。轉世後需重新錘鍊。' : '每個大境界可多煉 5 重,轉世後需重新錘鍊。'}</div>")
print('p40 ok')
