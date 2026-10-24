#!/usr/bin/env python3
"""最終版84:底部分頁紅點 = 該分頁裡任何一個紅點
1. 底部導覽:除了原本的判斷,只要該分頁(含人物頁上方區塊、洞府場景、仙途格子等)裡有任何顯示中的紅點,分頁就亮紅點。
2. 補判斷(不必先切到該頁也會亮):人物 → 功法可升級、天賦可點;仙途 → 新稱號、圖鑑里程碑可領。
"""
import glob, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src', 'js')
def F(p):
    g = glob.glob(os.path.join(ROOT, '02_main', p + '_*.js')) or glob.glob(os.path.join(ROOT, p + '_*.js')); assert len(g) == 1, p; return g[0]
def rep(pre, old, new):
    p = F(pre); t = open(p, encoding='utf-8', newline='').read(); assert t.count(old) == 1, (pre, t.count(old), old[:70])
    open(p, 'w', encoding='utf-8', newline='').write(t.replace(old, new))
rep('048', "      const red = ids.some(id => { const l = legacy(id), d = l && l.querySelector('.rd'); return d && d.style.display !== 'none'; });",
    "      const red = ids.some(id => { const l = legacy(id), d = l && l.querySelector('.rd'); return d && d.style.display !== 'none'; }) || domDot(t);")
rep('048', "  function navSync() {",
    """  /* v84:分頁裡任何顯示中的紅點都算(分頁本身隱藏時,只看分頁內部有沒有被藏起來的區塊) */
  const BOX = { 'tab-abode': ['tab-abode', 'ab53r'], 'tab-techniques': ['tab-techniques', 'ch51', 'pc44', 'bk51'], 'tab-adventure': ['tab-adventure'], 'tab-crafting': ['tab-crafting'], 'tab-inventory': ['tab-inventory'], 'tab-records': ['tab-records', 'tab-sect'] };
  function domDot(t) {
    return (BOX[t] || []).some(id => { const c = $(id); if (!c) return false;
      return [...c.querySelectorAll('i.rd,.x5-dot,.rd14,[data-dot="1"]')].some(d => { for (let e = d; e && e !== c; e = e.parentElement) { if (e.style.display === 'none' || getComputedStyle(e).display === 'none') return false; } return true; }); });
  }
  function navSync() {""")
rep('16', "  window.CH51 = { alert: () => { try { return ORDER.some(slotDot); } catch (e) { return false; } } };",
    "  window.CH51 = { alert: () => { try { return ORDER.some(slotDot) || techDot() || talDot(); } catch (e) { return false; } } };")
rep('034', "  function cxAlert() {", "  window.CX15 = { alert: () => cxAlert() };   /* v84:仙途分頁紅點用 */\n  function cxAlert() {")
rep('19', "  window.RC54 = { alert: () => hasBtn('achievements-list') || hasBtn('daily-quests-list') };",
    "  window.RC54 = { alert: () => hasBtn('achievements-list') || hasBtn('daily-quests-list') || !!(window.CX15 && CX15.alert()) };")
print('p13 ok')
