/* ===== v9.8:介面整理 —— ①頂部壓縮/指引膠囊/⚙設定 ②命格入洞府 ③新導覽列(8→6)與仙途分頁 ④統一質感 ===== */
(function () {
  const $ = id => document.getElementById(id), X = window.X5;
  const css = document.createElement('style'); css.id = 'ui25css';
  css.textContent = `
/* ---------- 頂部 ---------- */
#game-app>header{padding:6px 10px 6px!important;background:linear-gradient(180deg,rgba(2,6,23,.98),rgba(8,14,30,.94))!important;border-bottom:1px solid rgba(180,83,9,.35)!important}
#game-app>header>div:first-child{margin-bottom:5px!important;gap:6px;flex-wrap:nowrap}
#game-app>header>div:first-child>div:first-child{min-width:0;flex:1}
#player-realm-badge{white-space:nowrap;font-size:12px!important;padding:2px 9px!important;line-height:1.4;letter-spacing:.5px}
#player-name-display{white-space:nowrap;font-size:15px!important;max-width:96px;overflow:hidden;text-overflow:ellipsis}
#btn-sound-toggle,#btn-show-help{display:none!important}
#btn-menu25{width:36px;height:32px;min-height:32px!important;border-radius:10px;background:#111c33;border:1px solid #2b3a58;color:#cbd5e1;font-size:16px;line-height:1;flex:none}
#btn-menu25:active{transform:scale(.94)}
#game-app>header .res25{display:flex!important;justify-content:space-between;align-items:center;gap:4px!important;padding:5px 9px!important;background:rgba(15,23,42,.85)!important;border:1px solid #1f2a44!important;border-radius:11px!important}
#game-app>header .res25>div{white-space:nowrap;gap:3px!important;display:flex;align-items:center}
#game-app>header .res25 .lb25{font-size:14px;line-height:1}
#game-app>header .res25 .ii{width:16px;height:16px}
#game-app>header .res25 span.font-mono{font-size:13px!important}
.qi25{margin-top:5px!important}
.qi25 .row25{display:flex;justify-content:space-between;align-items:baseline;font-size:11.5px!important;color:#94a3b8;margin-bottom:2px!important}
.qi25 .bar25{height:7px!important;padding:1px!important;border-radius:6px!important}
#tutorial-guide-banner{margin-top:5px!important;padding:3px 6px 3px 8px!important;border-radius:10px!important;flex-wrap:nowrap}
#tutorial-guide-banner>div:first-child{min-width:0;flex:1;overflow:hidden}
#tutorial-guide-banner .animate-bounce{animation:none!important}
#tutorial-guide-text{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0;cursor:pointer}
#tutorial-guide-banner button{min-height:26px!important;white-space:nowrap}
/* ---------- 新導覽列 ---------- */
#game-app>nav:not(#nav25){display:none!important}
#nav25{flex:none;display:grid;grid-template-columns:repeat(6,1fr);background:rgba(2,6,23,.98);border-top:1px solid #1f2a44;padding:4px 2px calc(4px + env(safe-area-inset-bottom))}
#nav25 button{position:relative;display:flex;flex-direction:column;align-items:center;gap:2px;padding:3px 0 2px;color:#8a97ad;font-size:12px;font-weight:700;min-height:58px;font-family:'Noto Serif TC',serif;letter-spacing:1px}
#nav25 button img{width:35px;height:35px;object-fit:cover;opacity:.72;filter:saturate(.7);transition:.2s}
#nav25 button img.c{border-radius:50%}#nav25 button img.s{border-radius:26%}
#nav25 button.on{color:#fbbf24}
#nav25 button.on img{opacity:1;filter:none;box-shadow:0 0 0 1.5px #f59e0b,0 0 9px rgba(245,158,11,.55)}
#nav25 button.lk{opacity:.5}
#nav25 .dot25{position:absolute;top:3px;right:calc(50% - 25px);width:9px;height:9px;border-radius:5px;background:#ef4444;box-shadow:0 0 6px #ef4444;display:none}
#seg25{display:none;gap:6px;margin:0 0 8px}
#seg25.on{display:flex}
#seg25 button{flex:1;padding:8px 4px;border-radius:12px;background:#0f172a;border:1px solid #26334f;color:#94a3b8;font-weight:800;font-size:13.5px;position:relative}
#seg25 button.on{background:linear-gradient(160deg,#92400e,#451a03);border-color:#f59e0b;color:#fde68a}
#seg25 button.lk{opacity:.55}
/* ---------- 統一質感 ---------- */
:root{--c25-bg:#0b1324;--c25-bd:#243352;--c25-r:14px}
.tab-panel>.bg-slate-900,.tab-panel>div.rounded-xl,.tab-panel>.rounded-2xl,.tab-panel>.bg-slate-800{border-radius:var(--c25-r)!important}
.tab-panel .bg-slate-900.border{border-color:var(--c25-bd)!important}
.tab-panel{padding-bottom:14px}
.tab-panel button:not(.x5-btn){-webkit-tap-highlight-color:transparent}
.tab-panel button:active,.x5-btn:active{transform:scale(.97)}
.tab-panel h2,.tab-panel h3{letter-spacing:1px}
.hub19{gap:7px!important;grid-template-columns:repeat(6,1fr)!important}.hub19 button.a1,.hub19 button.a3{grid-column:span 3}.hub19 button.sm{grid-column:span 2}.hub19 button{border-radius:14px!important;border-color:var(--c25-bd)}
.hub19 button.sm{padding:7px 2px 6px!important}
.x5-card,.x5-cd{border-radius:14px!important}
.x5-btn{border-radius:11px!important;letter-spacing:.5px}
#x5s-mn .x5-bd{padding:10px 12px 18px}
/* ---------- 命格面板 ---------- */
#x5s-ming .x5-bd{padding:8px 10px 20px}
.sa19r{align-items:center}.sa19r button{height:44px!important;min-height:0!important;font-size:13px!important;padding:0 10px!important}
`;
  document.head.appendChild(css);

  