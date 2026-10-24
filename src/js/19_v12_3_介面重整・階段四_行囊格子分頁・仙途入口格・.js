
/* ===== v12.3 介面重整・階段四:行囊格子分頁・仙途入口格・彈窗淺色 ===== */
(function () {
  const $ = id => document.getElementById(id);
  const css = document.createElement('style');
  css.textContent = `
/* —— 共用彈窗淺色 —— */
#sheet13{background:rgba(30,24,16,.55)!important}
#sheet13 .pn{background:radial-gradient(ellipse at 50% 0,#fbf8ef,#efe6d2 70%,#e5d9bd)!important;border-color:#cdbf9f!important;color:#2a241c!important}
#sheet13 .pn .ttl{text-shadow:none!important}
#sheet13 .pn .sub,#sheet13 .pn .ds{color:#6b5f4f!important}
#sheet13 .pn .st{background:rgba(255,252,244,.75)!important;border-color:#d6c9ab!important;color:#2a241c!important}
.x5-ov{background:rgba(30,24,16,.55)!important}
.x5-pn{background:radial-gradient(ellipse at 50% 0,#fbf8ef,#efe6d2 70%,#e5d9bd)!important;border-color:#cdbf9f!important;color:#2a241c!important}
.x5-hd{color:#2a241c!important;border-bottom-color:#d6c9ab!important}
.x5-hd button{background:transparent!important;border:1px solid #b9a98c!important;color:#6b5f4f!important}
.x5-cd{background:rgba(255,252,244,.72)!important;border-color:#d6c9ab!important;color:#2a241c}
.x5-sub{color:#6b5f4f!important}
.x5-tabs button{background:rgba(255,252,244,.6)!important;color:#6b5f4f!important;border:1px solid #c9b994}
.x5-tabs button.on{background:#2b2620!important;color:#f3ead6!important;border-color:#2b2620}
/* —— 行囊 —— */
#tab-inventory>:not(#iv54){display:none!important}
#iv54{display:flex;flex-direction:column;gap:6px;padding:8px 10px 10px;border-radius:14px;color:#2a241c;font-family:'Noto Serif TC',serif;background:radial-gradient(ellipse at 50% 30%,#faf6ec,#efe6d2 62%,#e2d5b8);box-shadow:inset 0 0 0 1px #cdbf9f,inset 0 0 40px rgba(120,100,60,.18)}
#iv54 .hd{display:flex;align-items:center;gap:6px}
#iv54 .hd b{font-size:16px;font-weight:900;letter-spacing:1px}
#iv54 .hd .ct{font-size:11px;color:#6b5f4f;margin-right:auto}
#iv54 .hd button{min-height:34px;padding:0 10px;border-radius:17px;background:linear-gradient(180deg,#3a3229,#211c16);color:#f3ead6;font-weight:800;font-size:11.5px}
#iv54 #inv13-chips{display:flex;gap:4px;margin:0!important;flex-wrap:nowrap;overflow-x:auto}
#iv54 #inv13-chips button{flex:none;min-height:30px!important;padding:2px 10px!important;border-radius:15px!important;border:1px solid #c9b994!important;background:rgba(255,252,244,.6)!important;color:#6b5f4f!important;font-size:11.5px!important}
#iv54 #inv13-chips button.on{background:#9e2b25!important;color:#fbf4e4!important;border-color:#9e2b25!important}
#iv54 .pg{flex:1;min-height:0;display:flex;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none}
#iv54 .pg::-webkit-scrollbar{display:none}
#iv54 .pg>.pp{flex:0 0 100%;scroll-snap-align:start;display:grid;grid-template-columns:repeat(4,1fr);grid-auto-rows:var(--rh,86px);gap:6px;align-content:start}
#iv54 .inv13-cell{background:linear-gradient(160deg,#fbf7ee,#e9dfc9)!important;border:1.5px solid #c9b994;border-radius:10px!important;color:#2a241c!important;margin:0!important;height:100%!important;min-height:0!important}
.ink53 [style*="color:#94a3b8"],.ink53 [style*="color:#64748b"]{color:#6b5f4f!important}
.ink53 .xb-r,.ink53 [style*="background:#020617"],.ink53 [style*="background:#0f172a"]{background:rgba(255,252,244,.72)!important;border-color:#d6c9ab!important}
.ink53 .xb-r .n{color:#2a241c}
#iv54 .inv13-cell .nm{text-shadow:none!important;font-weight:800}
#iv54 .inv13-cell .ct{color:#fff!important;background:rgba(42,36,28,.72)!important;border-radius:6px;padding:0 3px}
#iv54 .dots{display:flex;justify-content:center;gap:6px;min-height:10px}
#iv54 .dots i{width:7px;height:7px;border-radius:50%;background:#c9b994}
#iv54 .dots i.on{background:#9e2b25}
#iv54 .emp{flex:1;display:flex;align-items:center;justify-content:center;color:#6b5f4f;font-size:12px}
/* —— 仙途 —— */
#tab-records>:not(#rc54){display:none!important}
#rc54{display:flex;flex-direction:column;gap:10px;padding:12px 12px 14px;border-radius:14px;color:#2a241c;font-family:'Noto Serif TC',serif;background:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 200' preserveAspectRatio='none'><path d='M0 150 Q70 95 140 135 T270 115 T400 130 V200 H0Z' fill='%23544a3c' opacity='.08'/></svg>") bottom/100% 38% no-repeat,radial-gradient(ellipse at 50% 30%,#faf6ec,#efe6d2 62%,#e2d5b8);box-shadow:inset 0 0 0 1px #cdbf9f,inset 0 0 40px rgba(120,100,60,.18)}
#rc54 .tt{font-size:17px;font-weight:900;letter-spacing:2px}
#rc54 .tt span{font-size:11px;color:#6b5f4f;font-weight:500;letter-spacing:0;margin-left:6px}
#rc54 .gr{display:grid;grid-template-columns:repeat(3,1fr);gap:12px 8px}
#rc54 .gr button{position:relative;display:flex;flex-direction:column;align-items:center;gap:4px;background:none;border:0;padding:0}
#rc54 .gr button i.sl{width:62px;height:62px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-style:normal;font-weight:900;font-size:22px;color:#f3ead6;background:radial-gradient(circle at 40% 35%,#4a4036,#17130e);box-shadow:0 0 0 2px #efe6d2,0 0 0 3.5px #3a3128,0 3px 6px rgba(40,30,10,.3)}
#rc54 .gr button b{font-size:12.5px}
#rc54 .gr button small{font-size:10.5px;color:#6b5f4f;min-height:14px}
#rc54 .gr button.lk{opacity:.4}
#rc54 .rd,#rc54 .x5-dot{position:absolute;top:0;right:calc(50% - 32px);width:11px;height:11px;border-radius:50%;background:#d13b2f;box-shadow:0 0 0 2px #f6efe0}
#ov54{position:fixed;inset:0;z-index:72;background:rgba(30,24,16,.55);display:flex;align-items:flex-end;justify-content:center}
#ov54.h{display:none}
#ov54 .pn{width:100%;max-width:448px;max-height:86dvh;overflow-y:auto;border-radius:16px 16px 0 0;padding:12px 14px 20px;color:#2a241c;background:radial-gradient(ellipse at 50% 0,#fbf8ef,#efe6d2 70%,#e5d9bd);box-shadow:0 -6px 24px rgba(0,0,0,.35)}
#ov54 .hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
#ov54 .hd b{font-family:'Noto Serif TC',serif;font-size:16px;font-weight:900}
#ov54 .hd button{width:30px;height:30px;border-radius:50%;border:1px solid #b9a98c;color:#6b5f4f}
#ov54 .bd>*{display:block!important}
#ov54 .bd>.fb13{display:none!important}
#iv54 .inv13-cell .nm{color:#2a241c!important}
#sheet13 .ttl{color:#2a241c!important}
.ink53 [style*="color:#e2e8f0"],.ink53 [style*="color:#f1f5f9"],.ink53 [style*="color:#cbd5e1"],.ink53 [style*="color:#fff"]:not(button):not(button *){color:#2a241c!important}
.ink53 [style*="color:#fde68a"],.ink53 [style*="color:#fcd34d"],.ink53 [style*="color:#fbbf24"]{color:#8a5a12!important}
.ink53 [style*="color:#86efac"],.ink53 [style*="color:#34d399"],.ink53 [style*="color:#4ade80"]{color:#2f7a3e!important}
.ink53 [style*="color:#e0e7ff"],.ink53 [style*="color:#c7d2fe"],.ink53 [style*="color:#a5b4fc"],.ink53 [style*="color:#c4b5fd"]{color:#4b3f9a!important}
.ink53 [style*="color:#f9a8d4"],.ink53 [style*="color:#fca5a5"]{color:#a3352b!important}
.ink53 [style*="color:#67e8f9"],.ink53 [style*="color:#7dd3fc"]{color:#2f6fa8!important}
#ov54 .bd .hidden:not(.f13c *){display:revert}
#ov54 details>summary{font-weight:800;color:#9e2b25}
`;
  document.head.appendChild(css);
  ['sheet13'].forEach(id => { const e = $(id); if (e && e.firstChild) e.firstChild.classList.add('ink53'); });
  const markX5 = () => document.querySelectorAll('.x5-pn').forEach(p => p.classList.add('ink53'));
  const fitH = el => { const nav = $('nav25'); const top = (e => { let s = 0, p = e.parentElement; while (p) { s += p.scrollTop || 0; p = p.parentElement; } return e.getBoundingClientRect().top + s; })(el); const nh = nav ? nav.getBoundingClientRect().height : 64; return Math.max(480, Math.floor(window.innerHeight - Math.max(0, top) - nh - 10)); };

  /* ---------- 行囊 ---------- */
  const inv = $('tab-inventory');
  let iv = $('iv54'); if (!iv) { iv = document.createElement('div'); iv.id = 'iv54';
  iv.innerHTML = '<div class="hd"><b>儲物袋</b><span class="ct"></span><button data-a54="pill">服丹</button><button data-a54="seq">賣裝</button><button data-a54="smat">賣材</button></div><div class="chh"></div><div class="pg"></div><div class="dots"></div>';
  if (inv) inv.insertBefore(iv, inv.firstChild); }
  const pg = iv.querySelector('.pg'), dots = iv.querySelector('.dots');
  let page = 0;
  function layout() {
    if (!inv || inv.classList.contains('hidden')) return;
    const h = fitH(iv); if (iv.style.height !== h + 'px') iv.style.height = h + 'px';
    const chips = $('inv13-chips'), slot = iv.querySelector('.chh'); if (chips && chips.parentNode !== slot) slot.appendChild(chips);
    const grid = $('inventory-grid'); if (!grid) return;
    const cells = [...grid.querySelectorAll('.inv13-cell')];
    const empty = grid.querySelector('.inv13-empty');
    if (!cells.length && !empty) { cnt(); return; }
    const ph = pg.clientHeight || (h - 120); const rh = 86, gap = 6, rows = Math.max(3, Math.floor((ph + gap) / (rh + gap))), per = rows * 4;
    pg.style.setProperty('--rh', Math.floor((ph - gap * (rows - 1)) / rows) + 'px');
    const sig = cells.map(c => c.dataset.i13 + (c.querySelector('.ct') || {}).textContent).join('|') + '#' + per + (empty ? empty.textContent : '');
    if (pg.dataset.s === sig) { cnt(); return; }
    pg.dataset.s = sig; const sl = pg.scrollLeft; pg.innerHTML = '';
    if (!cells.length) { pg.innerHTML = `<div class="emp">${empty ? empty.textContent : '儲物袋內空空如也'}</div>`; dots.innerHTML = ''; cnt(); return; }
    for (let i = 0; i < cells.length; i += per) { const p = document.createElement('div'); p.className = 'pp'; cells.slice(i, i + per).forEach(c => p.appendChild(c)); pg.appendChild(p); }
    const n = Math.ceil(cells.length / per); dots.innerHTML = n > 1 ? Array.from({ length: n }, (_, i) => `<i class="${i === page ? 'on' : ''}"></i>`).join('') : '';
    pg.scrollLeft = sl; cnt();
  }
  function cnt() { const c = iv.querySelector('.ct'); const tot = Object.keys(state.inventory || {}).filter(k => state.inventory[k] > 0 && ITEMS[k]).length; let cap = ''; try { const m = (document.body.innerText.match(/格數[::]\s*\d+\s*\/\s*(\d+)/) || [])[1]; cap = m ? '/' + m : ''; } catch (e) { } const t = `${tot}${cap} 格`; if (c.textContent !== t) c.textContent = t; }
  pg.addEventListener('scroll', () => { const n = pg.children.length; if (!n) return; const p = Math.round(pg.scrollLeft / Math.max(1, pg.clientWidth)); if (p !== page) { page = p; dots.querySelectorAll('i').forEach((d, i) => d.classList.toggle('on', i === p)); } }, { passive: true });
  XT.inv54Page = function () { try { pg.dataset.s = ''; layout(); } catch (e) { } };   // 由 renderInventory 呼叫
  /* 舊的 grid 仍是資料來源:讓它的內容渲染完就搬進分頁 */
  const ID = { pill: 'btn-use-all-pills', seq: 'btn-sell-spare-equip', smat: 'btn-sell-low-mats' };

  /* ---------- 仙途 ---------- */
  const rec = $('tab-records');
  let rc = $('rc54'), hold = $('rc54h'), ov = $('ov54');
  if (!rc) { rc = document.createElement('div'); rc.id = 'rc54';
  hold = document.createElement('div'); hold.id = 'rc54h'; hold.style.display = 'none';
  if (rec) { rec.insertBefore(rc, rec.firstChild); rec.appendChild(hold); } }
  if (!ov) { ov = document.createElement('div'); ov.id = 'ov54'; ov.className = 'h'; ov.innerHTML = '<div class="pn ink53"><div class="hd"><b></b><button data-a54="x">✕</button></div><div class="bd"></div></div>'; document.body.appendChild(ov); }
  const pb = ov.querySelector('.bd'); let cur = [];
  function shut() { cur.forEach(e => hold.appendChild(e)); cur = []; pb.querySelectorAll('.fb13').forEach(x => x.remove()); ov.classList.add('h'); }
  ov.addEventListener('click', e => { if (e.target === ov) shut(); });
  const blk = id => { const x = $(id); if (!x) return null; let e = x; while (e.parentNode && e.parentNode !== rec && e.parentNode !== hold && e.parentNode !== pb) e = e.parentNode; return e.parentNode ? e : null; };
  const BLK = { daily: () => [blk('daily-quests-list')], ach: () => [blk('achievements-list')], dao: () => [blk('dao-shop-list')], path: () => [$('ext-root')] };
  const TT = { daily: '每日修仙課業', ach: '仙道里程碑成就', dao: '太虛道心閣', path: '道途錄・統計設定' };
  function openB(k) {
    shut(); const L = (BLK[k] ? BLK[k]() : []).filter(Boolean); if (!L.length) return;
    ov.querySelector('.hd b').textContent = TT[k]; L.forEach(e => { pb.appendChild(e); e.classList.remove('f13c'); e.querySelectorAll('details').forEach(d => d.open = true); }); cur = L; ov.classList.remove('h');
    try { if (k === 'ach' && typeof renderAchievements === 'function') renderAchievements(); if (k === 'daily' && typeof renderDailyQuests === 'function') renderDailyQuests(); if (k === 'path' && typeof renderExt === 'function') renderExt(true); } catch (e) { }
  }
  function hasBtn(id) { const l = $(id); return !!(l && [...l.querySelectorAll('button')].some(b => !b.disabled && /領取|領/.test(b.textContent))); }
  const tile = (k, ic, nm, sub, attrs, dot) => `<button ${attrs}><i class="sl">${ic}</i><b>${nm}</b><small>${sub || ''}</small>${dot ? '<i class="rd"></i>' : ''}</button>`;
  let rsig = '';
  function rRender() {
    if (!rec || rec.classList.contains('hidden')) return;
    const dex = $('m6-rec'); let dsb = '', tsb = '';
    if (dex) { const b = dex.querySelectorAll('.sb'); dsb = b[0] ? b[0].textContent : ''; tsb = b[1] ? b[1].textContent : ''; }
    const dq = (() => { try { const p = state.dailyProgress || {}; return DAILY_QUESTS_DATA.filter(q => (p[q.id] || 0) >= q.target).length + '/' + DAILY_QUESTS_DATA.length; } catch (e) { return ''; } })();
    const ach = (() => { try { const c = state.achievementsClaimed || {}; return Object.keys(c).length + '/' + ACHIEVEMENTS_DATA.length; } catch (e) { return ''; } })();
    const h = `<div class="tt">仙途<span>${state.name || '道友'}的修行紀錄</span></div><div class="gr">
${tile('dex', '鑑', '萬象圖鑑', dsb, 'data-m6="2"')}${tile('title', '號', '稱號', tsb, 'data-m6="3"')}${tile('ach', '碑', '里程碑', ach, 'data-a54="ach"', hasBtn('achievements-list'))}
${tile('daily', '課', '每日課業', dq, 'data-a54="daily"', hasBtn('daily-quests-list'))}${tile('path', '途', '道途錄', '劇情回顧', 'data-a54="path"')}${tile('dao', '心', '道心閣', '轉世遺澤', 'data-a54="dao"')}
${tile('stat', '計', '遊玩統計', '紀錄・省電', 'data-x5="mn.stat"')}${tile('save', '存', '存檔管理', '匯出・還原', 'data-x5="mn.save"')}${tile('story', '卷', '劇情', '章節回顧', 'data-a54="story"')}</div>`;
    if (h !== rsig) {
      const keep = {}; rc.querySelectorAll('[data-m6]').forEach(b => { keep[b.dataset.m6] = { x5: b.dataset.x5, k: b.dataset.k, dot: !!b.querySelector('.x5-dot') }; });
      rsig = h; rc.innerHTML = h;
      rc.querySelectorAll('[data-m6]').forEach(b => { const o = keep[b.dataset.m6]; if (!o) return; if (o.x5) b.dataset.x5 = o.x5; if (o.k) b.dataset.k = o.k; if (o.dot) b.insertAdjacentHTML('beforeend', '<i class="x5-dot"></i>'); });
    }
  }
  document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('[data-a54]'); if (!a) return;
    const k = a.dataset.a54;
    if (k === 'x') { shut(); return; }
    if (ID[k]) { const b = $(ID[k]); if (b) b.click(); setTimeout(() => { pg.dataset.s = ''; layout(); }, 80); return; }
    if (k === 'story') { const b = $('btn-story28'); if (b) b.click(); return; }
    openB(k);
  });
  [inv, rec].forEach(x => { if (x) new MutationObserver(() => { try { pg.dataset.s = ''; layout(); rRender(); } catch (e) { } }).observe(x, { attributes: true, attributeFilter: ['class'] }); });
  window.RC54 = { alert: () => hasBtn('achievements-list') || hasBtn('daily-quests-list') || !!(window.CX15 && CX15.alert()) };
  setInterval(() => { try { layout(); rRender(); markX5(); } catch (e) { } }, 900);
  setTimeout(() => { try { layout(); rRender(); markX5(); } catch (e) { } }, 400);
  window.addEventListener('resize', () => { pg.dataset.s = ''; layout(); });
})();

