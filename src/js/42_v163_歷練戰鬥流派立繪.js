/* ===== v163 一般歷練戰鬥的主角圖:依外觀與流派改用背影動作圖(BP114);v164 站位改成主角左下、敵人右上 =====
   待機=1、出手=2、受擊=6;沒有該流派圖的外觀退回該外觀劍修圖,再退回原本的側身圖。 ===== */
(() => {
  const ORIG = { S0: GEN3.S0, S1: GEN3.S1, S2: GEN3.S2 };
  const N = { S0: 1, S1: 2, S2: 6 };
  let sig = '';
  function sch() { try { const m = (state.realmIdx || 0) >= 1 && window.SCH19 ? SCH19.SCH().main : ''; return m && m !== 'sword' ? m : ''; } catch (e) { return ''; } }
  function key(n) {
    const B = window.BP114 || {}, g = state.gender === 'f' ? 'F_' : 'M_', lk = state.look || 'o1', s = sch();
    return (s && B[g + lk + '_' + s + '_' + n]) || B[g + lk + '_' + n] || B[g + 'o1_' + n] || '';
  }
  function apply() {
    if (!state.gender) return;
    const s = [state.gender, state.look, sch()].join('|'); if (s === sig) return; sig = s;
    Object.keys(N).forEach(k => { const src = key(N[k]); if (src) { GEN3[k] = src; const i = new Image(); i.src = src; } else if (ORIG[k]) GEN3[k] = ORIG[k]; });
    const im = document.getElementById('bs-ps'); if (im && !(typeof currentBattle !== 'undefined' && currentBattle && im.getAttribute('src') !== ORIG.S0 && im.getAttribute('src') !== GEN3.S0)) im.src = GEN3.S0;
  }
  /* 033 換性別時會把 GEN3 重設回側身圖 → 重新套用 */
  setInterval(() => { try { if (GEN3.S0 !== key(1)) sig = ''; apply(); } catch (e) { } }, 800);
  const st = document.createElement('style');
  /* v164 站位:主角左下(背影朝右上)、敵人右上,與重要戰鬥同樣的遠近感;出手時往右上撲 */
  st.textContent = `.bs-pl .bs-ps,.bs-pl .bs-ps.f14{height:138px}
#battle-stage .bs-pl{left:4%!important;bottom:2px!important;z-index:4}
#battle-stage .bs-mo{right:6%!important;bottom:40%!important;z-index:2}
#battle-stage .bs-mo .bs-mi{transform:scale(.78);transform-origin:50% 100%}
#battle-stage .bs-pet{left:3%!important;bottom:auto!important;top:6%!important;z-index:3}
.bs-pl.atk{animation-name:bsl164!important}
@keyframes bsl164{0%{transform:translate(0,0)}35%{transform:translate(calc(var(--dx)*.85),calc(var(--dy,60px)*-1)) scale(.82)}62%{transform:translate(calc(var(--dx)*.85),calc(var(--dy,60px)*-1)) scale(.82)}100%{transform:translate(0,0)}}`;
  setInterval(() => { const s = document.getElementById('battle-stage'); if (s && s.clientHeight) s.style.setProperty('--dy', Math.round(s.clientHeight * .36) + 'px'); }, 1000);
  document.head.appendChild(st);
  setTimeout(apply, 600);
})();
