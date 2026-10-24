/* ===== v10.0:戰鬥整併 —— 移除即時戰場;回合制舞台換上戰場美術;流派心法/本命絕學在回合制生效;輔修試煉・秘境親征改為回合制 ===== */
(function () {
  const $ = id => document.getElementById(id), X = window.X5, S9 = window.SCH19, fmt = n => formatNum(n), R = () => state.realmIdx || 0;
  const GA = (typeof GEN_AR !== 'undefined') ? GEN_AR : null, bgs = GA && GA.bg ? GA.bg : [];
  const fxSrc = n => (GA && GA.fx) ? GA.fx['fx' + String(n).padStart(2, '0')] : null;
  try { bgs.forEach(s => { const i = new Image(); i.src = s; }); if (GA && GA.fx) Object.keys(GA.fx).forEach(k => { const i = new Image(); i.src = GA.fx[k]; }); } catch (e) { }
  const st = document.createElement('style');
  st.textContent = `.bs{background-size:cover!important;background-position:center!important}
.bs-moon{display:none}
.bs-spr{width:100%;height:100%;object-fit:contain;mix-blend-mode:screen;transform-origin:50% 55%;animation:bsp26 calc(.65s/var(--sp)) ease-out forwards;pointer-events:none}
.bs-spr.big{transform:scale(1.5)}
@keyframes bsp26{0%{transform:scale(.35) rotate(var(--rot,0deg));opacity:0}25%{opacity:1}100%{transform:scale(1.25) rotate(var(--rot,0deg));opacity:0}}
button[data-ult26]{grid-column:span 2;border-color:#f59e0b!important;background:linear-gradient(135deg,#78350f,#1e1b4b)!important;color:#fef3c7!important;letter-spacing:1px}
button[data-ult26]:disabled{opacity:.5;filter:grayscale(.5)}`;
  document.head.appendChild(st);

  