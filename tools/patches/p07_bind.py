#!/usr/bin/env python3
"""凍結後修正:原本「建立元素時才順便掛點擊」的地方,元素已寫在 HTML 裡就不會掛 → 改為「沒有才建立,點擊一律掛一次」。
導覽列 nav25、仙途/宗門切換 seg25、坊市 x32-mk-btn、離線後繼續歷練、倍速鈕、戰鬥中停止自動歷練鈕。
"""
import glob, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src', 'js')
def F(p):
    g = glob.glob(os.path.join(ROOT, '02_main', p + '_*.js')) or glob.glob(os.path.join(ROOT, p + '_*.js')); assert len(g) == 1, p; return g[0]
def rep(pre, old, new):
    p = F(pre); t = open(p, encoding='utf-8', newline='').read(); assert t.count(old) == 1, (pre, t.count(old), old[:70])
    open(p, 'w', encoding='utf-8', newline='').write(t.replace(old, new))

# 048 導覽列
rep('048', """    if ($('nav25')) return; const old = document.querySelector('#game-app>nav'); if (!old) return;
    const n = document.createElement('nav'); n.id = 'nav25';
    n.innerHTML = NAVS.map(([t, nm]) => `<button data-n25="${t}"><img class="s n46" alt="" draggable="false" src="${(window.NAV46||{})[t]||''}"><span>${nm}</span><i class="dot25"></i></button>`).join('');
    old.insertAdjacentElement('afterend', n);
    n.addEventListener(""",
"""    if (navInit.done) return; const old = document.querySelector('#game-app>nav'); if (!old) return; navInit.done = 1;
    let n = $('nav25'); if (!n) { n = document.createElement('nav'); n.id = 'nav25';
    n.innerHTML = NAVS.map(([t, nm]) => `<button data-n25="${t}"><img class="s n46" alt="" draggable="false" src="${(window.NAV46||{})[t]||''}"><span>${nm}</span><i class="dot25"></i></button>`).join('');
    old.insertAdjacentElement('afterend', n); }
    n.addEventListener(""")
rep('048', """if (rec && !$('seg25')) { const s = document.createElement('div'); s.id = 'seg25'; s.innerHTML = '<button data-g25="tab-records">📜 仙途紀錄</button><button data-g25="tab-sect">🏛 宗門</button>'; rec.parentNode.insertBefore(s, rec); s.addEventListener(""",
"""if (rec) { let s = $('seg25'); if (!s) { s = document.createElement('div'); s.id = 'seg25'; s.innerHTML = '<button data-g25="tab-records">📜 仙途紀錄</button><button data-g25="tab-sect">🏛 宗門</button>'; rec.parentNode.insertBefore(s, rec); } s.addEventListener(""")
# 074 坊市
rep('074', """    if (!$('x32-mk-btn')) {
      const bt = document.createElement('button'); bt.id = 'x32-mk-btn'; bt.className = 'font-serif-tc'; bt.textContent = '🏮 萬寶坊市';
      f.parentNode.appendChild(bt);
      bt.addEventListener(""",
"""    let bt = $('x32-mk-btn'); if (!bt || !bt.__b77) {
      if (!bt) { bt = document.createElement('button'); bt.id = 'x32-mk-btn'; bt.className = 'font-serif-tc'; bt.textContent = '🏮 萬寶坊市';
      f.parentNode.appendChild(bt); } bt.__b77 = 1;
      bt.addEventListener(""")
# 019 離線後繼續歷練
rep('019', """  if (cb && !document.getElementById('btn-offline-resume')) {
    cb.insertAdjacentHTML('beforebegin', '<button id="btn-offline-resume" class="hidden w-full py-2 mb-2 bg-gradient-to-r from-amber-600 to-amber-500 text-white font-bold text-xs rounded-lg shadow">⚔️ 出關並繼續自動歷練</button>');
""", """  if (cb) {
    if (!document.getElementById('btn-offline-resume')) cb.insertAdjacentHTML('beforebegin', '<button id="btn-offline-resume" class="hidden w-full py-2 mb-2 bg-gradient-to-r from-amber-600 to-amber-500 text-white font-bold text-xs rounded-lg shadow">⚔️ 出關並繼續自動歷練</button>');
""")
# 023 倍速
rep('023', """  if (ae && !document.getElementById('btn-speed-out')) {
    ae.insertAdjacentHTML('afterend', '<button id="btn-speed-out" class="tap-effect col-span-2 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-serif-tc text-xs rounded-lg border border-slate-700"></button>');
""", """  if (ae) {
    if (!document.getElementById('btn-speed-out')) ae.insertAdjacentHTML('afterend', '<button id="btn-speed-out" class="tap-effect col-span-2 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-serif-tc text-xs rounded-lg border border-slate-700"></button>');
""")
# 06 戰鬥中停止自動歷練
rep('06', """    if ($('btn-astop43')) return; const bm = $('battle-modal'); if (!bm) return;
    const b = document.createElement('button'); b.id = 'btn-astop43'; b.textContent = '⏹ 自動歷練中・點此於本場結束後停止';
    b.addEventListener('click', () => { if (!state.autoExplore) return; try { stopAutoExplore(''); } catch (e) { } b.classList.remove('on'); try { showToast('本場戰鬥結束後,不再繼續自動歷練。'); } catch (e) { } });
    bm.insertBefore(b, bm.children[1] || null);""",
"""    let b = $('btn-astop43'); if (b && b.__b77) return; const bm = $('battle-modal'); if (!bm) return;
    const nw = !b; if (nw) { b = document.createElement('button'); b.id = 'btn-astop43'; b.textContent = '⏹ 自動歷練中・點此於本場結束後停止'; } b.__b77 = 1;
    b.addEventListener('click', () => { if (!state.autoExplore) return; try { stopAutoExplore(''); } catch (e) { } b.classList.remove('on'); try { showToast('本場戰鬥結束後,不再繼續自動歷練。'); } catch (e) { } });
    if (nw) bm.insertBefore(b, bm.children[1] || null);""")
print('p07 ok')
