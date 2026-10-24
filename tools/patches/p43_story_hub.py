#!/usr/bin/env python3
"""最終版109:劇情總覽
- 未開啟的劇情顯示開啟條件(例:🔒 金丹期第 3 層後開啟 / 🔒 元嬰期圓滿後開啟 / 🔒 看完「…」後開啟)
- 同一章內依開啟境界排序(條件相同維持原順序)
做法:ST28.R / ST28.E 產生的條件函式附上境界資訊(_rq),總覽據此排序與說明;播放順序不變。
"""
import os, glob
p = glob.glob(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src', 'js', '02_main', '055_*.js'))[0]
s = open(p, encoding='utf-8', newline='').read()
def rep(old, new):
    global s; assert s.count(old) == 1, old[:60]; s = s.replace(old, new)
rep("    R: (r, sub) => () => (state.realmIdx || 0) > r || ((state.realmIdx || 0) === r && (state.subRealm || 1) >= (sub || 1)),",
    "    R: (r, sub) => Object.assign(() => (state.realmIdx || 0) > r || ((state.realmIdx || 0) === r && (state.subRealm || 1) >= (sub || 1)), { _rq: [r, sub || 1, 0] }),")
rep("    E: r => () => { if ((state.realmIdx || 0) > r) return true; if ((state.realmIdx || 0) < r) return false; const i = getRealmInfo(); return (state.subRealm || 1) >= i.realm.subMax && state.qi >= i.maxQi * 0.999; }",
    "    E: r => Object.assign(() => { if ((state.realmIdx || 0) > r) return true; if ((state.realmIdx || 0) < r) return false; const i = getRealmInfo(); return (state.subRealm || 1) >= i.realm.subMax && state.qi >= i.maxQi * 0.999; }, { _rq: [r, 99, 1] })")
rep("      const list = NODES.filter(n => n.ch === c), done = list.filter(n => s.",
    """      const list0 = NODES.filter(n => n.ch === c); let lk = [-1, 0];   /* v109 依開啟境界排序;沒有境界資訊者沿用前一節的位置 */
      const list = list0.map((n, i) => { const q = n.at && n.at._rq; if (q) lk = [q[0], q[1]]; return { n, k: lk, i }; }).sort((a, b) => a.k[0] - b.k[0] || a.k[1] - b.k[1] || a.i - b.i).map(x => x.n), done = list.filter(n => s.""")
rep("${sn || ok ? n.title : '？？？'}</div>",
    "${sn || ok ? n.title : '？？？'}${!sn && !ok ? `<div class=\"x5-sub\" style=\"margin-top:2px\">🔒 ${lockWhy(n)}</div>` : ''}</div>")
rep("  /* ---------- 劇情總覽 ---------- */",
    """  /* v109 未開啟原因 */
  function lockWhy(n) {
    const q = n.at && n.at._rq, rn = r => (REALM_DATA[r] || {}).name || '';
    const realmOk = !n.at || safe(n.at);
    if (!realmOk && q) return q[2] ? `${rn(q[0])}圓滿後開啟` : `${rn(q[0])}${q[1] > 1 && (REALM_DATA[q[0]] || {}).subMax > 1 ? `第 ${q[1]} 層` : ''}後開啟`;
    if (n.after && !seen(n.after)) return '看完前一段劇情後開啟';
    if (!n.opt) { const m = nextMain(); if (m && m.id !== n.id) return '依序看完前面的主線後開啟'; }
    return realmOk ? '條件達成後開啟' : '特定條件達成後開啟';
  }
  /* ---------- 劇情總覽 ---------- */""")
open(p, 'w', encoding='utf-8', newline='').write(s); print('p43 ok')
