
/* ===== v10.0:介面整理 —— 同類功能歸到同一頁 ===== */
(function () {
  const $ = id => document.getElementById(id), X = window.X5;
  if (!X) return;
  const st = document.createElement('style');
  st.textContent = `#hub19,#sk19{display:none!important}
  .hub19.m6row{display:grid;grid-template-columns:repeat(3,1fr)!important;gap:6px!important}
  .hub19.m6row.c2{grid-template-columns:repeat(2,1fr)!important}
  .hub19.m6row button{grid-column:auto!important}
  .m6row button{padding:7px 2px 6px!important}
  #m6-forge{background:#0f172a;border:1px solid #334155;border-radius:12px;padding:10px}
  #m6-forge .t{font-weight:800;color:#fcd34d;font-size:13px}
  #m6-forge .d{font-size:10px;color:#94a3b8;margin:2px 0 6px}
  #m6-forge .bt{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
  #m6-forge .bt button{margin:0!important}
  #m6-daily{display:flex;gap:6px;margin-top:6px}
  #m6-daily button{flex:1;padding:7px 4px;border-radius:10px;background:#0f172a;border:1px solid #334155;color:#fde68a;font-size:11px;font-weight:800}
  #sv6-root .h{font-weight:800;color:#fcd34d;font-size:13px;margin:4px 0 6px}
  #sv6-root>*{margin-bottom:10px}
  #m6-reinc{width:100%;margin-top:8px}`;
  document.head.appendChild(st);

  /* —— 由洞府舊九宮格(隱藏)同步出新入口:索引對應 hub19 的按鈕順序 —— */
  const SRC = { 0: ['🏯', '流派', 'a1'], 1: ['🎐', '天機悟道', 'a3'], 2: ['📚', '圖鑑', ''], 3: ['🏅', '稱號', ''], 5: ['🦴', '煉體', 'a2'], 6: ['💠', '法寶', 'a3'], 7: ['🐾', '靈寵', 'a1'] };
  function mkRow(id, idx, two) {
    const d = document.createElement('div');
    d.id = id; d.className = 'hub19 m6row' + (two ? ' c2' : '');
    d.innerHTML = idx.map(i => `<button class="${SRC[i][2]}" data-m6="${i}"><span class="ic">${SRC[i][0]}</span><span class="nm">${SRC[i][1]}</span><span class="sb"></span></button>`).join('');
    return d;
  }
  function syncRows() {
    const hub = $('hub19'); if (!hub) return;
    document.querySelectorAll('[data-m6]').forEach(b => {
      const src = hub.children[+b.dataset.m6]; if (!src) return;
      if (!b.dataset.x5) { b.dataset.x5 = src.dataset.x5; if (src.dataset.k) b.dataset.k = src.dataset.k; }
      const a = src.querySelector('.sb'), e = b.querySelector('.sb');
      if (a && e && e.textContent !== a.textContent) e.textContent = a.textContent;
      b.classList.toggle('lk', src.classList.contains('lk'));
      const dot = !!src.querySelector('.x5-dot'), has = !!b.querySelector('.x5-dot');
      if (dot && !has) b.insertAdjacentHTML('beforeend', '<i class="x5-dot"></i>'); else if (!dot && has) b.querySelector('.x5-dot').remove();
    });
  }
  const after = (ref, el) => { if (ref && ref.parentNode) ref.parentNode.insertBefore(el, ref.nextSibling); };
  const kids = el => el ? [...el.children].filter(c => !c.classList.contains('fb13')) : [];

  /* —— 存檔管理(⚙)—— */
  X.sheet('sv6', '💾 存檔管理', b => { const r = $('sv6-root'); if (r && r.parentNode !== b) b.appendChild(r); });
  X.act('mn.save', () => { X.close('mn'); X.open('sv6'); });
  X.act('mn.stat', () => { X.close('mn'); X.open('stat'); });
  X.act('m6.sr', () => { try { goToTab('tab-adventure'); } catch (e) { } setTimeout(() => { const b = $('x32-asub-d'); if (b) b.click(); }, 160); });
  X.act('m6.sect', () => { const b = document.querySelector('[data-g25="tab-sect"]'); if (b) b.click(); else try { goToTab('tab-sect'); } catch (e) { } });

  function arrange() {
    /* 功法:流派・煉體・天機悟道,放在靈根卡下方 */
    const tech = $('tab-techniques');
    if (tech && !$('m6-tech')) { const k0 = kids(tech)[0]; if (k0) after(k0, mkRow('m6-tech', [0, 5, 1])); }
    /* 儲物:法寶・靈寵,放在穿戴卡下方 */
    const inv = $('tab-inventory');
    if (inv && !$('m6-inv')) { const k0 = kids(inv)[0]; if (k0) after(k0, mkRow('m6-inv', [6, 7], true)); }
    /* 仙途:圖鑑・稱號,放進命盤卡;每日捷徑放進每日課業卡 */
    const rec = $('tab-records');
    if (rec) {
      const card = kids(rec)[0];
      if (card && !$('m6-rec')) { const r = mkRow('m6-rec', [2, 3], true); r.style.marginTop = '8px'; card.appendChild(r); }
      const dq = $('daily-quests-list');
      if (dq && !$('m6-daily')) { const d = document.createElement('div'); d.id = 'm6-daily'; d.innerHTML = '<button data-x5="m6.sr">🗺 每日秘境(歷練)</button>'; after(dq, d); }
    }
    /* 丹器・煉器室:強化、器紋、熔爐 */
    const fc = $('subtab-forge-content');
    if (fc) {
      let box = $('m6-forge');
      if (!box) { box = document.createElement('div'); box.id = 'm6-forge'; box.innerHTML = '<div class="t">🔨 乾坤熔爐</div><div class="d">用不到的材料可投入熔爐煉化。裝備的強化與器紋,請到【人物】點選裝備。</div><div id="m6-aff"></div><div class="bt" id="m6-fbt"></div>'; after(fc.children[0], box); }
      const aff = $('aff16'), ma = $('m6-aff'); if (aff && ma && aff.parentNode !== ma) ma.appendChild(aff);
      const bt = $('m6-fbt');
      ['btn-enhance-all', 'btn-enhance-equipped', 'btn-furnace'].forEach(id => { const e = $(id); if (e && bt && e.parentNode !== bt) { const p = e.parentNode; bt.appendChild(e); if (p && p.id !== 'm6-fbt' && !p.children.length && p.classList.contains('border-t')) p.style.display = 'none'; } });
    }
    /* 存檔類 → ⚙ 存檔管理 */
    let root = $('sv6-root');
    if (!root) { root = document.createElement('div'); root.id = 'sv6-root'; const host = $('x5b-sv6'); if (host) host.appendChild(root); }
    const sv = $('btn-manual-save'); let panel = sv; while (panel && panel.parentNode && panel.parentNode.id !== 'tab-records' && panel.parentNode.id !== 'sv6-root') panel = panel.parentNode; if (panel && !panel.parentNode) panel = null;
    if (panel && panel.parentNode !== root) {
      const bar = panel.previousElementSibling; if (bar && bar.classList.contains('fb13')) bar.remove();
      panel.classList.remove('f13c', 'hidden'); root.insertBefore(panel, root.firstChild);
    }
    const bk = $('backup-box'), bkd = bk && bk.closest('details'); if (bkd && bkd.parentNode !== root) root.appendChild(bkd);
    const wb = $('btn-wb-test'), wbd = wb && wb.closest('details'); if (wbd && wbd.parentNode !== root) root.appendChild(wbd);
    const s15 = $('stat15'), s15d = s15 && s15.closest('details'); if (s15d) s15d.style.display = 'none';
    /* 主動轉世 → 太虛道心閣(轉世) */
    const re = $('btn-manual-reincarnate'), shop = $('dao-shop-list');
    if (re && shop && re.parentNode !== shop.parentNode) { re.id = 'btn-manual-reincarnate'; re.classList.add('m6r'); re.style.width = '100%'; re.style.marginTop = '8px'; shop.parentNode.appendChild(re); }
    syncRows();
  }
  arrange();
  let n = 0; const fast = setInterval(() => { arrange(); if (++n > 12) clearInterval(fast); }, 800);
  setInterval(arrange, 1500);
  window.UI6 = { arrange };
})();
