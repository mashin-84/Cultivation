/* ===== v15.0 清爽重整(ext32):純版面——不動存檔與數值,舊 id 皆保留(隱藏而非刪除) ===== */
(function () {
  const $ = id => document.getElementById(id);
  const css = `
/* —— 頂部狀態列:緊湊 —— */
header.sticky{padding-top:5px!important;padding-bottom:5px!important}
header.sticky>div:first-child{margin-bottom:3px!important}
header.sticky>div:first-child *{white-space:nowrap}
header #player-name-display{max-width:78px;overflow:hidden;text-overflow:ellipsis}
header .grid.grid-cols-3{padding:2px 6px!important}
header .qi25,header .mt-1\\.5:has(#qi-progress-fill){margin-top:3px!important}
header .flex.justify-between.mb-0\\.5{margin-bottom:1px!important}
#tutorial-guide-banner,#auto-explore-status-bar{margin-top:3px!important;padding-top:3px!important;padding-bottom:3px!important}
/* —— 洞府 —— */
#tab-abode>div:first-child{height:372px!important;min-height:0!important}
#tab-abode .lk-stage{top:34px!important;bottom:98px!important}
#breakthrough-card{padding:10px 12px!important}
#breakthrough-card>div:first-child{margin-bottom:4px!important}
#breakthrough-desc{margin-bottom:6px!important;font-size:11px!important;line-height:1.35!important}
#btn-trigger-breakthrough{padding-top:7px!important;padding-bottom:7px!important}
.x32-duo{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.x32-duo>div{padding:8px!important;margin:0!important;min-width:0}
.x32-duo>div>div:first-child{flex-wrap:wrap;gap:2px;padding-bottom:4px!important}
.x32-duo>div>div:nth-child(2){flex-direction:column;align-items:stretch!important;gap:6px}
.x32-duo button{width:100%;padding-left:4px!important;padding-right:4px!important}
.hub19{gap:6px!important}
.hub19 button{padding:5px 2px 4px!important}
.hub19 .ic{font-size:18px!important;line-height:20px!important}
.hub19 button.sm .ic{font-size:16px!important;line-height:18px!important}
/* —— 歷練:子頁籤 —— */
#sa19b{display:none!important}
#x32-asub{display:flex;gap:6px;margin-bottom:8px}
#x32-asub button{flex:1;padding:8px 4px;border-radius:12px;border:1px solid #334155;background:#0f172a;color:#94a3b8;font-weight:800;font-size:12px}
#x32-asub button.on{color:#fde68a;border-color:#b45309;background:linear-gradient(160deg,#451a03,#0f172a)}
#tab-adventure[data-x32="main"] #sr17{display:none!important}
#tab-adventure[data-x32="daily"] .x32-m{display:none!important}
#adventure-log-box{height:84px!important}
/* —— 功法 —— */
#tech-resonance-badge{padding:4px 8px!important;font-size:10px!important}
#tech-resonance-badge *{line-height:1.2}
#tech-resonance-badge{gap:6px}#tech-resonance-badge>div{white-space:normal;flex:1 1 auto;min-width:0}#tech-resonance-badge #tech-resonance-status{white-space:nowrap;flex:none}
/* —— 丹器:坊市獨立子頁籤 —— */
#x32-mk-btn{flex:1;padding:8px 0;font-weight:700;color:#94a3b8;border-bottom:2px solid transparent}
#tab-crafting[data-x32c="mk"] #x32-mk-btn{color:#fbbf24;border-bottom-color:#fbbf24}
#tab-crafting[data-x32c="mk"] #subtab-alchemy-btn,#tab-crafting[data-x32c="mk"] #subtab-forge-btn{color:#94a3b8!important;border-bottom-color:transparent!important}
#tab-crafting[data-x32c="mk"] #subtab-alchemy-content,#tab-crafting[data-x32c="mk"] #subtab-forge-content{display:none!important}
#tab-crafting:not([data-x32c="mk"]) .x32-mkcard{display:none!important}
`;
  if (!$('x32-css')) { const st = document.createElement('style'); st.id = 'x32-css'; st.textContent = css; document.head.appendChild(st); }
  /* 洞府:聚靈陣與悟性並排 */
  function duo() {
    const t = $('tab-abode'); if (!t || t.querySelector('.x32-duo')) return;
    const kids = [...t.children];
    const a = kids.find(c => c.textContent.includes('聚靈法陣') && c.querySelector('#btn-upgrade-array'));
    const b = kids.find(c => c.textContent.includes('元神悟性') && c.querySelector('#btn-upgrade-insight'));
    if (!a || !b) return;
    const w = document.createElement('div'); w.className = 'x32-duo';
    t.insertBefore(w, a); w.appendChild(a); w.appendChild(b);
  }
  /* 歷練:主線秘境 | 每日秘境 */
  let asub = 'main';
  function adv() {
    const t = $('tab-adventure'); if (!t) return;
    let bar = $('x32-asub');
    if (!bar) {
      bar = document.createElement('div'); bar.id = 'x32-asub';
      bar.innerHTML = '<button data-x32a="main" class="on">⚔️ 歷練推圖</button><button data-x32a="daily" id="x32-asub-d">🚪 每日秘境</button>';
      t.insertBefore(bar, t.firstChild);
    }
    t.setAttribute('data-x32', asub);
    [...t.children].forEach(c => { if (c !== bar && c.id !== 'sr17' && c.id !== 'battle-modal') c.classList.add('x32-m'); });
    bar.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.x32a === asub));
    const sr = $('sr17'), d = $('x32-asub-d');
    if (sr && d) { const m = (sr.textContent || '').match(/今日\s*(\d+)\s*\/\s*(\d+)/); d.textContent = '🚪 每日秘境' + (m ? '(' + m[1] + '/' + m[2] + ')' : ''); }
  }
  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('[data-x32a]'); if (!b) return;
    asub = b.dataset.x32a; adv();
    try { if (asub === 'daily' && window.X5 && X5.render) X5.render(); } catch (er) { }
  });
  /* 新手引導「每日秘境」步驟:前往時直接落在秘境子頁 */
  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('#tutorial-guide-banner button'); if (!b) return;
    const bn = $('tutorial-guide-banner'); if (bn && /秘境/.test(bn.textContent || '') && b.id !== 'btn-skip-tutorial') { asub = 'daily'; setTimeout(adv, 0); }
  }, true);
  /* 丹器:煉丹 | 煉器 | 坊市 */
  function craft() {
    const t = $('tab-crafting'); if (!t) return;
    const a = $('subtab-alchemy-btn'), f = $('subtab-forge-btn'), list = $('market-items-list');
    if (!a || !f || !list) return;
    let bt = $('x32-mk-btn'); if (!bt || !bt.__b77) {
      if (!bt) { bt = document.createElement('button'); bt.id = 'x32-mk-btn'; bt.className = 'font-serif-tc'; bt.textContent = '🏮 萬寶坊市';
      f.parentNode.appendChild(bt); } bt.__b77 = 1;
      bt.addEventListener('click', () => { t.setAttribute('data-x32c', 'mk'); });
      [a, f].forEach(x => x.addEventListener('click', () => { t.removeAttribute('data-x32c'); }, true));
    }
    const card = list.closest('.rounded-xl'); if (card && card.parentNode === t) card.classList.add('x32-mkcard');
    else if (card) { let c = card; while (c && c.parentNode !== t) c = c.parentNode; if (c) c.classList.add('x32-mkcard'); }
  }
  function run() { try { duo(); adv(); craft(); } catch (e) { } }
  run(); setTimeout(run, 600); setInterval(run, 1500);
})();


