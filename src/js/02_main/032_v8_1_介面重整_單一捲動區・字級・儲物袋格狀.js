/* ===== v8.1 介面重整:單一捲動區・字級・儲物袋格狀 ===== */
(function () {
  const css = `
html,body{height:100%;overflow:hidden;overscroll-behavior:none}
body{min-height:0!important;display:block!important;padding-bottom:0!important}
#game-app{height:100vh;height:100dvh;min-height:0!important;overflow:hidden}
#game-app>header{position:relative!important;flex:none}
#game-app>main{flex:1 1 auto!important;min-height:0;overflow-y:auto!important;overflow-x:hidden;overscroll-behavior-y:contain;-webkit-overflow-scrolling:touch;padding-bottom:16px!important;touch-action:pan-y;scroll-behavior:auto}
#game-app>nav{position:relative!important;flex:none;width:100%;max-width:none!important;margin:0!important;left:auto!important;right:auto!important;bottom:auto!important;padding-bottom:env(safe-area-inset-bottom,0px)}
.overflow-y-auto,.overflow-auto,#adventure-log-box{overscroll-behavior:contain}
#region-strip{touch-action:pan-x pan-y;overscroll-behavior-x:contain}
.text-\\[9px\\]{font-size:11.5px!important}
.text-\\[10px\\]{font-size:12.5px!important}
.text-\\[11px\\]{font-size:13px!important}
.text-xs{font-size:13.5px!important;line-height:1.5!important}
.text-sm{font-size:15px!important;line-height:1.55!important}
.text-base{font-size:16px!important}
.text-lg{font-size:18px!important}
#game-app>header{padding:6px 10px!important}
#game-app>header button{min-height:32px}
#game-app>header .mb-1\\.5{margin-bottom:4px!important}
#game-app>header .mt-1\\.5{margin-top:4px!important}
.nav-tab-btn{min-height:52px}
/* 壓縮大圖與固定高度捲動 */
#tab-abode>div:first-child{height:190px!important}
#tab-adventure>div:first-child{height:92px!important}
#cs-alch,.cs-scene{height:140px!important;aspect-ratio:auto!important;width:100%!important}.cs-scene svg{height:100%!important;width:100%!important}
.mb-ban{height:84px!important;aspect-ratio:auto!important;width:100%!important}.mb-ban img{width:100%!important;height:100%!important;object-fit:cover;object-position:center 40%}
#ming-content .w-32.h-32{width:100px!important;height:100px!important}
#adventure-log-box{height:132px!important;overflow:hidden!important}
#hp-row{flex-wrap:wrap;row-gap:6px;column-gap:8px}#hp-row>span:first-child{order:1}#hp-row>#hp-text{order:2;margin-left:auto}#hp-row>div{order:3;flex:1 1 100%}#hp-row button{order:4;flex:1 1 38%}#subtab-talents-btn,#subtab-tech-list-btn,#subtab-skills-btn,#subtab-alchemy-btn,#subtab-forge-btn{white-space:nowrap}
[id^="modal-"]>div{max-height:92vh;max-height:92dvh;overflow-y:auto;overscroll-behavior:contain}
#adventure-log-box{cursor:pointer}
/* 可收合區塊 */
.fb13{display:flex;align-items:center;justify-content:space-between;width:100%;min-height:46px;padding:0 14px;border-radius:12px;border:1px solid #334155;background:linear-gradient(160deg,#111a2e,#0b1220);color:#fcd34d;font-weight:800;font-size:15px;margin:0}
.fb13 .sm{color:#94a3b8;font-weight:600;font-size:13px;margin-left:8px;text-align:right;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.fb13 .cv{color:#94a3b8;margin-left:8px;font-size:13px}
.fb13.open{border-color:#92400e99}
.f13c{display:none!important}
/* 裝備欄 */
.eq13-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}
.eq13{display:flex;flex-direction:column;align-items:center;gap:1px;padding:6px 2px 5px;border-radius:10px;border:1.5px solid #334155;background:#0b1220;min-height:84px;min-width:0}
.eq13.em{border-style:dashed;opacity:.75}
.eq13 .ii{width:34px;height:34px}
.eq13 .n{font-size:12px;font-weight:700;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:0 2px}
.eq13 .s{font-size:11.5px;color:#94a3b8;white-space:nowrap}
.eq13 .e{font-size:11.5px;color:#fbbf24;font-weight:800}
/* 儲物袋 */
.inv13-chips{display:flex;gap:6px;overflow-x:auto;padding:2px 0 6px;touch-action:pan-x pan-y}
.inv13-chips button{flex:none;padding:6px 14px;border-radius:99px;border:1px solid #475569;background:#0f172a;color:#94a3b8;font-weight:700;font-size:13.5px;min-height:36px}
.inv13-chips button.on{background:#78350f;color:#fde68a;border-color:#f59e0b}
.inv13-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.inv13-cell{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:3px;padding:8px 2px 6px;border-radius:12px;border:1.5px solid #334155;background:linear-gradient(160deg,#111a2e,#0b1220);color:#e2e8f0;min-height:92px}
.inv13-cell:active{transform:scale(.95)}
.inv13-cell .ii{width:46px;height:46px}
.inv13-cell .nm{font-size:12px;line-height:1.25;text-align:center;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;width:100%;padding:0 2px}
.inv13-cell .ct{position:absolute;right:5px;top:3px;font-size:12px;font-weight:800;color:#fde68a;text-shadow:0 1px 2px #000}
.inv13-cell .ic13{font-size:34px;line-height:46px}
.inv13-empty{grid-column:1/-1;text-align:center;color:#64748b;font-size:13.5px;padding:18px 0}
#sheet13{position:fixed;inset:0;z-index:65;display:none;background:rgba(2,6,23,.72)}
#sheet13.on{display:block}
#sheet13 .pn{position:absolute;left:50%;transform:translateX(-50%);bottom:0;width:100%;max-width:448px;max-height:78dvh;overflow-y:auto;overscroll-behavior:contain;background:linear-gradient(180deg,#131c30,#0b1220);border:1px solid #92400e88;border-bottom:0;border-radius:18px 18px 0 0;padding:16px 16px calc(16px + env(safe-area-inset-bottom,0px));animation:sh13 .18s ease-out}
@keyframes sh13{from{transform:translate(-50%,40px);opacity:.4}to{transform:translate(-50%,0);opacity:1}}
#sheet13 .hd{display:flex;gap:12px;align-items:center;margin-bottom:10px}
#sheet13 .hd .ii{width:64px;height:64px}
#sheet13 .hd .ic13{font-size:48px;line-height:64px;width:64px;text-align:center}
#sheet13 .ttl{font-weight:900;font-size:17px}
#sheet13 .sub{color:#94a3b8;font-size:13px;margin-top:2px}
#sheet13 .ds{color:#cbd5e1;font-size:14px;line-height:1.6;margin:8px 0}
#sheet13 .st{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0}
#sheet13 .st span{padding:3px 10px;border-radius:99px;background:#1e293b;font-size:13px}
#sheet13 .up{color:#4ade80}#sheet13 .dn{color:#f87171}
#sheet13 .bt{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap}
#sheet13 .bt button{flex:1 1 40%;min-height:46px;border-radius:12px;border:0;font-weight:800;font-size:15px;background:#334155;color:#e2e8f0}
#sheet13 .bt button.pri{background:#d97706;color:#1c1917}
#sheet13 .bt button.sky{background:#0284c7;color:#fff}
#sheet13 .bt button.x{flex:0 0 100%;background:transparent;color:#94a3b8;border:1px solid #334155}
`;
  const st = document.createElement('style'); st.id = 'ui13css'; st.textContent = css; document.head.appendChild(st);
  const $ = id => document.getElementById(id);
  const fmt = n => (typeof formatNum === 'function' ? formatNum(n) : String(n));
  /* 切換分頁時回到頂端 */
  document.querySelectorAll('.nav-tab-btn').forEach(b => b.addEventListener('click', () => { const m = document.querySelector('#game-app>main'); if (m) m.scrollTop = 0; }));
  /* ---------- 通用底部面板 ---------- */
  let sheet = $('sheet13'); if (!sheet) { sheet = document.createElement('div'); sheet.id = 'sheet13'; sheet.innerHTML = '<div class="pn"></div>'; document.body.appendChild(sheet); }
  const panel = sheet.firstChild;
  const openSheet = html => { panel.innerHTML = html; sheet.classList.add('on'); panel.scrollTop = 0; };
  const closeSheet = () => { sheet.classList.remove('on'); INV.sel = null; };
  window.SHEET13 = { open: openSheet, close: closeSheet, panel };
  sheet.addEventListener('click', e => { if (e.target === sheet) closeSheet(); });
  /* ---------- 裝備欄(精簡) ---------- */
  renderEquipSlots = function () {
    const h = equipHost(); if (!h) return; h.className = 'eq13-grid';
    h.innerHTML = EQUIP_SLOTS.map(slot => {
      const si = SLOT_INFO[slot], id = state.equipment[slot], it = id && ITEMS[id], e = (state.enhance || {})[slot] || 0;
      if (!it) return `<button data-eslot="${slot}" class="eq13 em tap-effect">${si.i}<span class="n" style="color:#64748b">${si.n}</span><span class="s">未穿戴</span></button>`;
      const m = enhMult(e), st = [it.atk && `攻${fmt(Math.floor(it.atk * m))}`, it.def && `防${fmt(Math.floor(it.def * m))}`, it.hp && `血${fmt(Math.floor(it.hp * m))}`].filter(Boolean)[0] || '';
      return `<button data-eslot="${slot}" class="eq13 tap-effect" style="border-color:${(Q_COL[it.quality] || '#475569')}99">${it.icon || si.i}<span class="n" style="color:${Q_COL[it.quality] || '#e2e8f0'}">${it.name}</span><span class="e">+${e}</span><span class="s">${st}</span></button>`;
    }).join('');
    const b = document.getElementById('btn-enhance-equipped'); if (b) b.innerText = `🔨 強化裝備(目前上限 +${enhCap()})`;
  };
  /* ---------- 儲物袋 ---------- */
  const INV = { cat: 'all', sel: null };
  const CATS = [['all', '全部'], ['equip', '裝備'], ['pill', '丹藥'], ['mat', '材料'], ['other', '其他']];
  const catOf = it => it.type === 'equipment' ? 'equip' : (it.type === 'consumable' || it.type === 'special' || it.type === 'battle_heal') ? 'pill' : it.type === 'material' ? 'mat' : 'other';
  const QN = { common: '凡品', uncommon: '良品', rare: '上品', epic: '極品', immortal: '仙品', mythic: '古仙遺品' };
  const qcol = it => (typeof Q_COL !== 'undefined' && Q_COL[it.quality]) || '#e2e8f0';
  const ico = it => it.icon && /</.test(it.icon) ? it.icon : `<span class="ic13">${it.icon || '📦'}</span>`;
  XT.inv81Grid = function () {   // 由 renderInventory 在原本體(裝備欄、容量、相關連動)之後呼叫
    const grid = $('inventory-grid'); if (!grid) return;
    grid.className = 'inv13-grid'; grid.innerHTML = '';
    let chips = $('inv13-chips');
    if (!chips) { chips = document.createElement('div'); chips.id = 'inv13-chips'; chips.className = 'inv13-chips'; grid.insertAdjacentElement('beforebegin', chips); }
    const all = Object.entries(state.inventory || {}).filter(([k, n]) => n > 0 && ITEMS[k]);
    const cnt = c => all.filter(([k]) => c === 'all' || catOf(ITEMS[k]) === c).length;
    chips.innerHTML = CATS.map(([k, n]) => `<button data-c13="${k}" class="${INV.cat === k ? 'on' : ''}">${n} ${cnt(k)}</button>`).join('');
    const QO = { mythic: 0, immortal: 1, epic: 2, rare: 3, uncommon: 4, common: 5 };
    const L = all.filter(([k]) => INV.cat === 'all' || catOf(ITEMS[k]) === INV.cat).sort((a, b) => (QO[ITEMS[a[0]].quality] ?? 9) - (QO[ITEMS[b[0]].quality] ?? 9) || (ITEMS[b[0]].tier || 0) - (ITEMS[a[0]].tier || 0));
    if (!L.length) grid.innerHTML = `<div class="inv13-empty">${all.length ? '此分類暫無物品' : '儲物袋內空空如也,快去歷練探索吧!'}</div>`;
    L.forEach(([k, n]) => { const it = ITEMS[k]; const b = document.createElement('button'); b.dataset.i13 = k; b.className = 'inv13-cell'; b.style.borderColor = qcol(it) + '88'; b.innerHTML = `${ico(it)}<span class="nm" style="color:${qcol(it)}">${it.name}</span>${n > 1 ? `<span class="ct">×${n > 999 ? '999+' : n}</span>` : ''}`; grid.appendChild(b); });
    if (INV.sel) showItem(INV.sel);
  };
  function showItem(k) {
    const it = ITEMS[k], n = state.inventory[k] || 0;
    if (!it || n <= 0) { closeSheet(); return; }
    INV.sel = k;
    let stats = '', btn = '';
    if (it.type === 'equipment') {
      const cur = ITEMS[(state.equipment || {})[it.slot]] || null, d = (a) => { const v = (it[a] || 0) - (cur ? (cur[a] || 0) : 0); return v ? `<span class="${v > 0 ? 'up' : 'dn'}">${v > 0 ? '▲' : '▼'}${Math.abs(v)}</span>` : ''; };
      stats = (window.cmp48 ? cmp48(it, cur) : '') || (['atk:攻擊', 'def:防禦', 'hp:氣血'].map(s => { const [a, nm] = s.split(':'); return it[a] ? `<span>${nm} +${fmt(it[a])} ${cur ? d(a) : ''}</span>` : ''; }).join('') + (cur ? `<span style="color:#94a3b8">現穿:${cur.name}</span>` : '<span style="color:#94a3b8">此欄位尚未穿戴</span>'));
      btn = `<button class="sky" data-s13="equip">穿戴</button><button data-s13="sell1">賣出 ${fmt(it.price || 5)}</button>`;
    } else if (it.type === 'consumable') { btn = `<button class="pri" data-s13="use">服用</button>${n > 1 ? '<button class="pri" data-s13="useall" style="background:#b45309">全部服用</button>' : ''}`; }
    else if (it.type === 'chest') btn = `<button class="pri" data-s13="chest">開啟</button>`;
    else if (it.type === 'special' && k === 'pill_3') btn = '<div class="sub" style="flex:1 1 100%">渡劫時於天劫視窗使用</div>';
    else if (it.type === 'battle_heal') btn = '<div class="sub" style="flex:1 1 100%">戰鬥中可於戰鬥畫面使用</div>';
    if (it.type === 'material' || (it.type !== 'equipment' && it.price && it.type !== 'chest' && it.type !== 'special' && it.type !== 'battle_heal')) { const p = it.price || 5; btn += `<button data-s13="sell1">賣 1 件 ${fmt(p)}</button>${n > 1 ? `<button data-s13="sellall">全部賣出 ${fmt(p * n)}</button>` : ''}`; }
    openSheet(`<div class="hd">${ico(it)}<div><div class="ttl" style="color:${qcol(it)}">${it.name}</div><div class="sub">${QN[it.quality] || ''}${it.tier != null && it.type === 'equipment' ? ' ・ ' + ((typeof TIER_NAME !== 'undefined' && TIER_NAME[it.tier]) || '') : ''} ・ 持有 ×${n}</div></div></div>${stats ? `<div class="st">${stats}</div>` : ''}<div class="ds">${it.desc || ''}</div><div class="bt">${btn}<button class="x" data-s13="close">關閉</button></div>`);
  }
  document.addEventListener('click', e => {
    const c = e.target.closest && e.target.closest('[data-c13]'); if (c) { INV.cat = c.dataset.c13; renderInventory(); return; }
    const i = e.target.closest && e.target.closest('[data-i13]'); if (i) { showItem(i.dataset.i13); return; }
    const s = e.target.closest && e.target.closest('#sheet13 [data-s13]'); if (!s) return;
    const k = INV.sel, a = s.dataset.s13, it = ITEMS[k]; if (a === 'close') { closeSheet(); return; } if (!it) return;
    if (a === 'use') useItem(k); else if (a === 'useall') useItem(k, true); else if (a === 'equip') { equipItem(k); } else if (a === 'chest') { closeSheet(); openChest(k); return; }
    else if (a === 'sell1') { it.type === 'equipment' ? sellEquipItem(k) : sellSingleItem(k); } else if (a === 'sellall') { const n = state.inventory[k] || 0; for (let j = 0; j < n; j++) sellSingleItem(k); }
    renderInventory(); if (a === 'equip') closeSheet();
  });
  /* ---------- 可收合區塊 ---------- */
  let FS = {}; try { FS = JSON.parse(localStorage.getItem('fold13') || '{}') || {}; } catch (e) { FS = {}; }
  const saveFS = () => { try { localStorage.setItem('fold13', JSON.stringify(FS)); } catch (e) { } };
  const kids = el => el ? [...el.children].filter(c => !c.classList.contains('fb13')) : [];
  const rootSum = () => { const r = state.root || {}; return `金${r.metal || 0} 木${r.wood || 0} 水${r.water || 0} 火${r.fire || 0} 土${r.earth || 0}`; };
  const FOLDS = [
    ['root', '先天五行靈根', () => kids($('tab-techniques'))[0], false, rootSum],
    ['alchdesc', '丹鼎說明', () => kids($('subtab-alchemy-content'))[1], false],
    ['rec_path', '道途錄', () => $('ext-root'), false],
    ['rec_heart', '太虛道心閣(轉世)', () => kids($('tab-records'))[3], false],
    ['rec_ach', '仙道里程碑成就', () => kids($('tab-records'))[4], false],
    ['rec_save', '存檔與天道管理', () => kids($('tab-records'))[5], false]
  ];
  const isOpen = (k, d) => (k in FS ? !!FS[k] : d);
  function applyFolds() {
    FOLDS.forEach(([k, title, find, def, sum]) => {
      const el = find(); if (!el) return;
      let bar = el.previousElementSibling && el.previousElementSibling.dataset && el.previousElementSibling.dataset.f13 === k ? el.previousElementSibling : null;
      if (!bar) { bar = document.createElement('button'); bar.className = 'fb13'; bar.dataset.f13 = k; el.insertAdjacentElement('beforebegin', bar); }
      const o = isOpen(k, def); el.classList.toggle('f13c', !o); bar.classList.toggle('open', o);
      let sm = ''; try { sm = o ? '' : (sum ? sum() : ''); } catch (e) { }
      const html = `<span>${title}</span><span class="sm">${sm}</span><span class="cv">${o ? '▾' : '▸'}</span>`; if (bar.innerHTML !== html) bar.innerHTML = html;
    });
  }
  document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('.fb13'); if (!b) return; const k = b.dataset.f13, f = FOLDS.find(x => x[0] === k); FS[k] = !isOpen(k, f ? f[3] : true); saveFS(); applyFolds(); });
  document.querySelectorAll('.nav-tab-btn').forEach(b => b.addEventListener('click', () => setTimeout(applyFolds, 90)));
  setTimeout(applyFolds, 700); setInterval(applyFolds, 3000);
  /* 歷練紀事:點擊展開完整內容 */
  function logHint() { const box = $('adventure-log-box'); if (!box) return; const card = box.parentElement; if (!card || card.querySelector('[data-log13]')) return; const clr = [...card.querySelectorAll('button')].find(b => /清空/.test(b.textContent)); if (!clr) return; const b = document.createElement('button'); b.dataset.log13 = '1'; b.textContent = '展開全部'; b.style.cssText = 'font-size:13px;color:#fcd34d;margin-right:12px;min-height:32px;background:none;border:0'; clr.insertAdjacentElement('beforebegin', b); }
  document.addEventListener('click', e => { if (!(e.target.closest && (e.target.closest('[data-log13]') || e.target.closest('#adventure-log-box')))) return; const box = $('adventure-log-box'); if (!box) return; openSheet(`<div class="ttl" style="color:#fcd34d;margin-bottom:8px">歷練神遊紀事</div><div style="font-size:14px;line-height:1.7;color:#cbd5e1;max-height:60dvh;overflow-y:auto;overscroll-behavior:contain">${box.innerHTML}</div><div class="bt"><button class="x" data-s13="close">關閉</button></div>`); const inner = panel.querySelector('div[style*="max-height:60dvh"]'); if (inner) inner.scrollTop = inner.scrollHeight; });
  setInterval(logHint, 2000); setTimeout(logHint, 800);
  window.UI13 = { applyFolds, FS };
  if (document.getElementById('inventory-grid')) renderInventory();
})();


const LOOK_IMG={"M_o2": "data:image/webp;base64,@@IMG:LOOK_IMG/M_o2@@","M_o3": "data:image/webp;base64,@@IMG:LOOK_IMG/M_o3@@","M_o4": "data:image/webp;base64,@@IMG:LOOK_IMG/M_o4@@","M_o5": "data:image/webp;base64,@@IMG:LOOK_IMG/M_o5@@","F_o2": "data:image/webp;base64,@@IMG:LOOK_IMG/F_o2@@","F_o3": "data:image/webp;base64,@@IMG:LOOK_IMG/F_o3@@","F_o4": "data:image/webp;base64,@@IMG:LOOK_IMG/F_o4@@","F_o5": "data:image/webp;base64,@@IMG:LOOK_IMG/F_o5@@", "F_S0": "data:image/webp;base64,@@IMG:LOOK_IMG/F_S0@@", "F_S1": "data:image/webp;base64,@@IMG:LOOK_IMG/F_S1@@", "F_S2": "data:image/webp;base64,@@IMG:LOOK_IMG/F_S2@@", "F_o1": "data:image/webp;base64,@@IMG:LOOK_IMG/F_o1@@", "M_o1": "data:image/webp;base64,@@IMG:LOOK_IMG/M_o1@@"};

const DECO_IMG={"base": {"crane": "data:image/webp;base64,@@IMG:DECO_IMG_base/crane@@", "flower": "data:image/webp;base64,@@IMG:DECO_IMG_base/flower@@", "leaf_brown": "data:image/webp;base64,@@IMG:DECO_IMG_base/leaf_brown@@", "leaf_s1": "data:image/webp;base64,@@IMG:DECO_IMG_base/leaf_s1@@", "leaf_s2": "data:image/webp;base64,@@IMG:DECO_IMG_base/leaf_s2@@", "leaf_s3": "data:image/webp;base64,@@IMG:DECO_IMG_base/leaf_s3@@", "leaf_teal": "data:image/webp;base64,@@IMG:DECO_IMG_base/leaf_teal@@", "petal_gold": "data:image/webp;base64,@@IMG:DECO_IMG_base/petal_gold@@", "petal_pink": "data:image/webp;base64,@@IMG:DECO_IMG_base/petal_pink@@", "ribbon_gold": "data:image/webp;base64,@@IMG:DECO_IMG_base/ribbon_gold@@", "ribbon_teal": "data:image/webp;base64,@@IMG:DECO_IMG_base/ribbon_teal@@", "ribbon_white": "data:image/webp;base64,@@IMG:DECO_IMG_base/ribbon_white@@", "ring": "data:image/webp;base64,@@IMG:DECO_IMG_base/ring@@", "spark_a": "data:image/webp;base64,@@IMG:DECO_IMG_base/spark_a@@", "spark_b": "data:image/webp;base64,@@IMG:DECO_IMG_base/spark_b@@", "spark_c": "data:image/webp;base64,@@IMG:DECO_IMG_base/spark_c@@", "spark_d": "data:image/webp;base64,@@IMG:DECO_IMG_base/spark_d@@", "spark_e": "data:image/webp;base64,@@IMG:DECO_IMG_base/spark_e@@", "sparrow": "data:image/webp;base64,@@IMG:DECO_IMG_base/sparrow@@", "swirl_a": "data:image/webp;base64,@@IMG:DECO_IMG_base/swirl_a@@", "swirl_b": "data:image/webp;base64,@@IMG:DECO_IMG_base/swirl_b@@", "talisman": "data:image/webp;base64,@@IMG:DECO_IMG_base/talisman@@", "wisp_a": "data:image/webp;base64,@@IMG:DECO_IMG_base/wisp_a@@", "wisp_b": "data:image/webp;base64,@@IMG:DECO_IMG_base/wisp_b@@"}};

