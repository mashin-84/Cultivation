# v186:引導高亮前若目標被面板擋住就先收起所有面板;突破成功立刻播該層劇情(不等輪詢間隔)
import glob
def rep(f, old, new):
    s = open(f, encoding='utf8').read(); c = s.count(old); assert c == 1, (f, old[:50], c)
    open(f, 'w', encoding='utf8').write(s.replace(old, new)); print(f.split('/')[-1], '比對 1 次')
G = lambda p: glob.glob(p)[0]
f38 = 'src/js/38_v160_劇情引導教學.js'
# 收面板範圍擴大:一般彈窗 modal-*(劇情/建角/渡劫相關除外)也收
rep(f38, "  function closeSheets() {",
"""  const KEEP186 = /^(modal-(gender14|tribulation|death-reincarnate|ascension))$/;
  function closeAll186() { closeSheets(); try { document.querySelectorAll('[id^=modal-]').forEach(m => { if (!KEEP186.test(m.id) && !m.classList.contains('hidden') && vis(m)) m.classList.add('hidden'); }); } catch (e) { } }
  /* 目標中心點被別的東西蓋住(不是自己、不是引導層)→ 被面板擋住 */
  function covered(e) { try { const r = e.getBoundingClientRect(); const t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!t && t !== e && !e.contains(t) && !t.closest('#tut160'); } catch (x) { return false; } }
  function closeSheets() {""")
rep(f38, "    closeSheets();   /* v166 先收起開著的面板(例如從道心閣轉世時道心閣還開著) */",
         "    closeAll186();   /* v166 先收起開著的面板;v186 一般彈窗也收 */")
rep(f38, "      if (e) { cur.el = e; try { e.scrollIntoView({ block: 'center', behavior: 'instant' }); } catch (er) { } show(step); return; }",
         "      if (e) { try { e.scrollIntoView({ block: 'center', behavior: 'instant' }); } catch (er) { } if (covered(e) && tries < 20) { closeAll186(); tries += 5; return setTimeout(look, 250); } cur.el = e; show(step); return; }   /* v186 被擋住先收面板再高亮 */")
# 突破後立刻播劇情
f55 = G('src/js/02_main/055_*.js')
rep(f55, "  function scan() {", "  ST.now = () => { try { if (!NODES.length || blocked() || !state.gender) return; const m = nextMain(); if (m && m.auto && !declined[m.id] && safe(m.at)) play(m.id); } catch (e) { } };   /* v186 突破後立刻播 */\n  function scan() {")
rep(G('src/js/02_main/028_*.js'), "showToast(`突破成功!【${getRealmInfo().title}】戰力 ${formatNum(p0)} → ${formatNum(p1)}`); }",
         "showToast(`突破成功!【${getRealmInfo().title}】戰力 ${formatNum(p0)} → ${formatNum(p1)}`); setTimeout(() => window.ST28 && ST28.now && ST28.now(), 700); }")
f40 = 'src/js/40_v160_雷劫過場.js'
rep(f40, "      try { showToast(`渡劫功成!踏入【${REALM_DATA[state.realmIdx].name}】`); updateTopBar(); } catch (e) { }\n      return;",
         "      try { showToast(`渡劫功成!踏入【${REALM_DATA[state.realmIdx].name}】`); updateTopBar(); } catch (e) { }\n      setTimeout(() => window.ST28 && ST28.now && ST28.now(), 700);\n      return;")
rep(f40, "    busy = false; window.THU160.on = false;\n    try { updateTopBar(); } catch (e) { }",
         "    busy = false; window.THU160.on = false;\n    try { updateTopBar(); } catch (e) { }\n    setTimeout(() => window.ST28 && ST28.now && ST28.now(), 700);")
