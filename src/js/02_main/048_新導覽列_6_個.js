/* ============ 新導覽列(6 個) ============ */
  const NAVS = [['tab-abode', '洞府', ['tab-abode']], ['tab-techniques', '人物', ['tab-techniques']], ['tab-adventure', '歷練', ['tab-adventure']], ['tab-crafting', '丹器', ['tab-crafting']], ['tab-inventory', '行囊', ['tab-inventory']], ['tab-records', '仙途', ['tab-records', 'tab-sect']]];
  const legacy = t => document.querySelector(`.nav-tab-btn[data-tab="${t}"]`);
  function navInit() {
    if (navInit.done) return; const old = document.querySelector('#game-app>nav'); if (!old) return; navInit.done = 1;
    let n = $('nav25'); if (!n) { n = document.createElement('nav'); n.id = 'nav25';
    n.innerHTML = NAVS.map(([t, nm]) => `<button data-n25="${t}"><img class="s n46" alt="" draggable="false" src="${(window.NAV46||{})[t]||''}"><span>${nm}</span><i class="dot25"></i></button>`).join('');
    old.insertAdjacentElement('afterend', n); }
    n.addEventListener('click', e => { const b = e.target.closest('[data-n25]'); if (!b) return; const lb = legacy(b.dataset.n25); if (lb) lb.click(); });
    /* 仙途分頁的上方切換:紀錄 / 宗門 */
    const rec = $('tab-records'); if (rec) { let s = $('seg25'); if (!s) { s = document.createElement('div'); s.id = 'seg25'; s.innerHTML = '<button data-g25="tab-records">📜 仙途紀錄</button><button data-g25="tab-sect">🏛 宗門</button>'; rec.parentNode.insertBefore(s, rec); } s.addEventListener('click', e => { const b = e.target.closest('[data-g25]'); if (!b) return; const lb = legacy(b.dataset.g25); if (lb) lb.click(); }); }
  }
  /* v84:分頁裡任何顯示中的紅點都算(分頁本身隱藏時,只看分頁內部有沒有被藏起來的區塊) */
  const BOX = { 'tab-abode': ['tab-abode', 'ab53r'], 'tab-techniques': ['tab-techniques', 'ch51', 'pc44', 'bk51'], 'tab-adventure': ['tab-adventure'], 'tab-crafting': ['tab-crafting'], 'tab-inventory': ['tab-inventory'], 'tab-records': ['tab-records', 'tab-sect'] };
  function domDot(t) {
    return (BOX[t] || []).some(id => { const c = $(id); if (!c) return false;
      return [...c.querySelectorAll('i.rd,.x5-dot,.rd14,[data-dot="1"]')].some(d => { for (let e = d; e && e !== c; e = e.parentElement) { if (e.style.display === 'none' || getComputedStyle(e).display === 'none') return false; } return true; }); });
  }
  function navSync() {
    const n = $('nav25'); if (!n) return;
    const act = (document.querySelector('.nav-tab-btn.text-amber-400') || {}).dataset ? document.querySelector('.nav-tab-btn.text-amber-400').dataset.tab : 'tab-abode';
    NAVS.forEach(([t, nm, grp]) => {
      const b = n.querySelector(`[data-n25="${t}"]`); if (!b) return;
      b.classList.toggle('on', grp.includes(act));
      const im = b.querySelector('img'), lg = legacy(t), li = lg && lg.querySelector('img.nvi');
      if (im && li && !(window.NAV46 && NAV46[t]) && im.getAttribute('src') !== li.getAttribute('src')) { im.src = li.src; im.className = li.classList.contains('rd-c') ? 'c' : 's'; }
      /* 紅點:任一對應的舊分頁有紅點;洞府另含命格 */
      const ids = grp;
      const red = ids.some(id => { const l = legacy(id), d = l && l.querySelector('.rd'); return d && d.style.display !== 'none'; }) || domDot(t);
      const dot = b.querySelector('.dot25'); if (dot) dot.style.display = red ? 'block' : 'none';
      b.classList.toggle('lk', !!(lg && lg.classList.contains('lock9') && t !== 'tab-records'));
    });
    const seg = $('seg25'); if (seg) {
      seg.classList.toggle('on', act === 'tab-records' || act === 'tab-sect');
      seg.querySelectorAll('button').forEach(b => { b.classList.toggle('on', b.dataset.g25 === act); const l = legacy(b.dataset.g25); b.classList.toggle('lk', !!(l && l.classList.contains('lock9'))); });
    }
  }
  navInit(); setTimeout(navInit, 500);
  new MutationObserver(() => navSync()).observe(document.querySelector('#game-app') || document.body, { subtree: true, attributes: true, attributeFilter: ['class'] });
  setInterval(() => { navInit(); navSync(); headerInit(); }, 700); setTimeout(navSync, 900);
})();


