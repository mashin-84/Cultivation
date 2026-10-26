# v173:大境界突破前須看完該境界(含之前)所有劇情;遊學可補做;鎖住的劇情寫明條件並可前往
import glob
def rep(f, old, new, n=1):
    s = open(f, encoding='utf8').read(); c = s.count(old); assert c == n, (f, old[:50], c)
    open(f, 'w', encoding='utf8').write(s.replace(old, new)); print(f.split('/')[-1], '比對', c, '次')
G = lambda p: glob.glob(p)[0]
# 1. 遊學:過了該境界仍可補做(新進度有突破門檻擋著,不會再錯過;舊存檔可救回)
rep(G('src/js/08_v10_1_*.js'),
    "at: () => (state.realmIdx || 0) === r && (state.subRealm || 1) >= need && !inGrad(r),",
    "at: Object.assign(() => ((state.realmIdx || 0) > r || ((state.realmIdx || 0) === r && (state.subRealm || 1) >= need)) && !inGrad(r), { _yx: [r, need] }),   /* v173 過了該境界仍可補做 */")
f = G('src/js/02_main/055_*.js')
# 2. 必看清單 + 前往目標
rep(f, "  /* ---------- 效果 ---------- */\n",
"""  /* v173 大境界突破前必看:該境界(含之前)尚未看過的支線/機緣/遊學,只列現在就能看的(避免卡死) */
  const realmOf = n => { const q = n.at && n.at._rq, y = n.at && n.at._yx; return y ? y[0] : q ? q[0] : null; };
  const canNow = n => !seen(n.id) && safe(n.at) && (!n.after || seen(n.after)) && (n.opt || nextMain() === n);
  function reqList() {
    const r = state.realmIdx || 0;
    return NODES.filter(n => n.opt && n.id !== 's.cycle' && !seen(n.id) && realmOf(n) != null && realmOf(n) <= r)
      .sort((a, b) => realmOf(a) - realmOf(b)).filter(canNow);
  }
  ST.req = reqList;
  /* 鎖住的劇情:往前追到現在就能看的那一段 */
  function goTo(n, d) {
    if (!n || (d || 0) > 12 || seen(n.id)) return null;
    if (canNow(n)) return n;
    if (n.after && !seen(n.after)) return goTo(BY[n.after], (d || 0) + 1);
    if (!n.opt) { const m = nextMain(); if (m && m !== n) return goTo(m, (d || 0) + 1); }
    return null;
  }
  /* ---------- 效果 ---------- */
""")
# 3. 鎖住原因寫明
rep(f, """    if (!realmOk && q) return q[2]""", """    const y = n.at && n.at._yx;
    if (!realmOk && y) return `${rn(y[0])}${y[1] > 1 ? `第 ${y[1]} 層` : ''}後開啟`;
    if (!realmOk && !q) { const W = { '1.4b': '在洞府打坐修煉片刻後開啟', '5.1': '看完〈神識通天〉後開啟', '5.7': '飛升時開啟', 's.cycle': '看完結局後開啟' }; if (W[n.id]) return W[n.id]; }
    if (!realmOk && q) return q[2]""")
rep(f, "    if (n.after && !seen(n.after)) return '看完前一段劇情後開啟';",
       "    if (n.after && !seen(n.after)) return BY[n.after] && (seen(BY[n.after].id) || canNow(BY[n.after]) || goTo(BY[n.after])) ? `看完〈${BY[n.after].title}〉後開啟` : '看完前一段劇情後開啟';")
# 4. 劇情總覽:鎖住的加「前往」;頂端列出突破前必看
rep(f, "${sn ? `<button class=\"x5-btn gy\" data-x5=\"st28.play\" data-id=\"${n.id}\">重看</button>` : ok ? `<button class=\"x5-btn am\" data-x5=\"st28.play\" data-id=\"${n.id}\">觀看</button>` : ''}",
       "${sn ? `<button class=\"x5-btn gy\" data-x5=\"st28.play\" data-id=\"${n.id}\">重看</button>` : ok ? `<button class=\"x5-btn am\" data-x5=\"st28.play\" data-id=\"${n.id}\">觀看</button>` : (() => { const g = goTo(n); return g && g !== n ? `<button class=\"x5-btn am\" data-x5=\"st28.play\" data-id=\"${g.id}\">前往</button>` : ''; })()}")
rep(f, "    if (window.SJ172) h += SJ172.card();   /* v172 生死交鋒預告 */\n",
"""    { const L = reqList(), nx = REALM_DATA[(state.realmIdx || 0) + 1];   /* v173 突破前必看 */
      if (L.length && nx) h += `<div class="x5-cd" style="margin-bottom:8px"><b style="color:#fcd34d;font-size:14px">📖 突破【${nx.name}】前還需看完 ${L.length} 段</b>` + L.map(n => `<div class="x5-row" style="margin-top:6px;gap:8px"><div style="flex:1;min-width:0">${n.sys ? '<span class="x5-sub">[機緣]</span> ' : '<span class="x5-sub">[支線]</span> '}${n.title}</div><button class="x5-btn am" data-x5="st28.play" data-id="${n.id}">觀看</button></div>`).join('') + `</div>`; }
    if (window.SJ172) h += SJ172.card();   /* v172 生死交鋒預告 */
""")
# 5. 渡劫門檻:主線補完之後、章末之前,先看完必看劇情(一次播一段)
rep(f, "    if (g && safe(g.at)) { play(g.id, { then: () => (g.id === '8.6' ? daoLuo() : o.apply(self, args)) }); return; }",
"""    { const L = reqList();   /* v173 本境界(含之前)的支線/機緣/遊學要先看完 */
      if (L.length) { play(L[0].id, { then: () => { const k = reqList().length; try { showToast(k ? `📖 突破前還有 ${k} 段劇情未看,再按一次渡劫繼續。` : '📖 前塵已了,再按一次渡劫。'); } catch (e) { } } }); return; } }
    if (g && safe(g.at)) { play(g.id, { then: () => (g.id === '8.6' ? daoLuo() : o.apply(self, args)) }); return; }""")
# 6. 指引列:大境界圓滿但還有必看劇情
rep('src/js/39_v160_體驗修正.js', "    /* 3. 可以突破 */\n",
"""    /* v173 大境界圓滿、仍有必看劇情 */
    try { const ri = getRealmInfo(); if (state.qi >= ri.maxQi && (state.subRealm || 1) >= ri.realm.subMax && window.ST28 && ST28.req) { const L = ST28.req(); if (L.length) return { k: 'req', ic: '卷', t: `突破前還有 ${L.length} 段劇情未看:〈${L[0].title}〉`, go: () => playStory(L[0].id) }; } } catch (e) { }
    /* 3. 可以突破 */
""")

# 修正:境界未到的不給前往
rep(f, '    if (!n || (d || 0) > 12 || seen(n.id)) return null;\n    if (canNow(n)) return n;', '    if (!n || (d || 0) > 12 || seen(n.id) || !safe(n.at)) return null;   /* 境界未到:只寫條件,不給前往 */\n    if (canNow(n)) return n;')
