#!/usr/bin/env python3
"""最終版83:紅點看得到、知道是哪一個
1. 新介面(仙途格子、人物頁按鈕/印章、返回列)裡的紅點其實一直被舊樣式 `.rd{display:none}` 藏起來 → 改為顯示。
   仙途底部導覽有紅點時(里程碑/每日課業可領),對應的格子現在也會出現紅點。
2. 稱號:新獲得(還沒看過)的稱號在清單裡標「新」並排到最上面(本次遊玩期間保留標示)。
"""
import glob, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src')
css = os.path.join(ROOT, 'css', '04_ui74.css')
t = open(css, encoding='utf-8', newline='').read(); assert '/* v83 */' not in t
t += "/* v83 */\nbody:not(#z74) i.rd{display:block}\n"
open(css, 'w', encoding='utf-8', newline='').write(t)
p = glob.glob(os.path.join(ROOT, 'js', '02_main', '034_*.js'))[0]
s = open(p, encoding='utf-8', newline='').read()
def rep(old, new):
    global s; assert s.count(old) == 1, old[:60]; s = s.replace(old, new)
rep("""    const rows = TL.map(x => { const p = (() => { try { return x.p(); } catch (e) { return [0, 1]; } })(), got = !!t.got[x.id], on = t.eq === x.id; if (got) n++; if (got && !t.seen[x.id]) t.seen[x.id] = 1; const pr = Math.min(1, p[0] / p[1]);
      return `<div class="tt-r ${on ? 'on' : ''}" style="${got ? '' : 'opacity:.7'}"><div style="flex:1;min-width:0"><div class="n" style="color:${got ? x.col : '#64748b'}">${got ? x.n : '？？？'} ${on ? '<span style="font-size:10px;color:#fbbf24">(佩戴中)</span>' : ''}</div>""",
    """    const rows = TL.map(x => { const p = (() => { try { return x.p(); } catch (e) { return [0, 1]; } })(), got = !!t.got[x.id], on = t.eq === x.id; if (got) n++; if (got && !t.seen[x.id]) { t.seen[x.id] = 1; NEWT.add(x.id); } const pr = Math.min(1, p[0] / p[1]), nw = NEWT.has(x.id);
      return [nw, `<div class="tt-r ${on ? 'on' : ''}" style="${got ? '' : 'opacity:.7'}${nw ? ';box-shadow:0 0 0 2px #d13b2f inset' : ''}"><div style="flex:1;min-width:0"><div class="n" style="color:${got ? x.col : '#64748b'}">${nw ? '<span style="display:inline-block;font-size:10px;line-height:15px;padding:0 5px;margin-right:4px;border-radius:8px;background:#d13b2f;color:#fff;vertical-align:1px">新</span>' : ''}${got ? x.n : '？？？'} ${on ? '<span style="font-size:10px;color:#fbbf24">(佩戴中)</span>' : ''}</div>""")
rep("""${got ? `<button class="x5-btn ${on ? 'gy' : 'am'}" data-x5="tt.eq" data-id="${x.id}">${on ? '卸下' : '佩戴'}</button>` : ''}</div>`; }).join('');""",
    """${got ? `<button class="x5-btn ${on ? 'gy' : 'am'}" data-x5="tt.eq" data-id="${x.id}">${on ? '卸下' : '佩戴'}</button>` : ''}</div>`]; }).sort((a, b) => b[0] - a[0]).map(r => r[1]).join('');""")
rep("""  X5.sheet('title', '🏅 稱號', b => {""", """  const NEWT = new Set();   /* v83:本次遊玩新獲得的稱號(標「新」) */
  X5.sheet('title', '🏅 稱號', b => {""")
open(p, 'w', encoding='utf-8', newline='').write(s)
print('p12 ok')
