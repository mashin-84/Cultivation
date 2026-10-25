/* ===== v163 一般歷練戰鬥的主角圖:依外觀與流派,改用重要戰鬥的背影動作圖(BP114)
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
  st.textContent = '.bs-pl .bs-ps,.bs-pl .bs-ps.f14{height:132px}';
  document.head.appendChild(st);
  setTimeout(apply, 600);
})();
