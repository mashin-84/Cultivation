
/* ===== v10.1:戰力曲線重校(依實測「正常培養」角色):區域怪物、關卡梯度、建議戰力、自動歷練撤退 ===== */
(function () {
  const K = [[1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1], [3.511, 9.149, 3.173, 4.228, 8.844, 2.699], [4.686, 15.036, 3.058, 4.728, 13.423, 2.227], [8.494, 34.445, 4.002, 7.482, 24.109, 2.478], [10.42, 41.571, 4.78, 9.119, 30.369, 3.371], [7.31, 36.36, 4.534, 8.043, 31.87, 3.155], [6.575, 38.039, 4.507, 6.849, 32.499, 2.964]];
  /* 區域怪物:攻防血分開校正(只做一次);練氣・築基兩區不動 */
  AREAS_DATA.forEach((a, i) => {
    if (a._k43) return; a._k43 = 1; const k = K[i]; if (!k) return;
    a.monsters.forEach(m => { const b = m.isBoss ? 3 : 0; m.hp = Math.floor(m.hp * k[b]); m.atk = Math.floor(m.atk * k[b + 1]); m.def = Math.floor(m.def * k[b + 2]); });
  });
  /* 建議戰力:以同一套戰力公式重算 */
  if (typeof CAL9 !== 'undefined' && CAL9.REC) { const R = [0, 1450, 20100, 84300, 280000, 945000, 2780000, 8170000]; R.forEach((v, i) => CAL9.REC[i] = v); }
  /* 關卡梯度:同一區域越往深處越強(第1關 ×0.85 → 第9關 ×1.13);境主不受影響 */
  const _smb = startMonsterBattle;
  startMonsterBattle = function (area, forceBoss) {
    const r = _smb.apply(this, arguments);
    try {
      const B = currentBattle;
      if (B && !B._st43 && area && AREAS_DATA[area.id] === area && !forceBoss && B.monster && !B.monster.isBoss) {
        B._st43 = 1; const st = Math.max(1, Math.min(area.maxSteps - 1, state.exploreStep || 1)), f = .85 + .035 * (st - 1);
        const m = B.monster; m.hp = Math.max(1, Math.floor(m.hp * f)); m.curHp = m.hp; m.atk = Math.max(1, Math.floor(m.atk * f));
        try { updateBattleUI(); } catch (e) { }
      }
    } catch (e) { }
    return r;
  };
  /* 自動歷練戰敗:不再損失靈石修為、不中斷;退回兩關、記住卡關處,戰力明顯提升或 20 分鐘後再試 */
  XT.loseBattle101 = _lb => function () {
    const B = currentBattle;
    const normal = B && !B.isDemonTrib && !B.isWB && !B.isTower && !B.isSect && !B.special && !B.tb26 && !B.isJie && !B.revived;
    if (!(normal && state.autoExplore)) return _lb.apply(this, arguments);
    const area = AREAS_DATA[state.currentArea], st = state.exploreStep || 1, boss = !!(B.monster && B.monster.isBoss);
    state.hp = Math.max(1, Math.floor(calculateTotalStats().hp * .5));
    state.cap43 = { a: state.currentArea, step: st, cp: calculateTotalStats().combatPower, t: Date.now() };
    state.exploreStep = Math.max(1, st - 2);
    if (boss) state.bossCooldownUntil = Date.now() + 10000;
    try { logAdventure(`<span class="text-rose-400 font-bold">💢 不敵【${B.monster.name}】,道友且戰且退,退回第 ${state.exploreStep} 關休整再戰。(自動歷練中戰敗不損失靈石與修為)</span>`); } catch (e) { }
    try { adventureNotice(`💢 第 ${st} 關受挫,退回第 ${state.exploreStep} 關;戰力提升後會再挑戰`); } catch (e) { }
    try { endBattle(); } catch (e) { }
    try { updateTopBar(); saveGame(); } catch (e) { }
    try { if (state.autoExplore && typeof scheduleAutoExplore === 'function') scheduleAutoExplore(); } catch (e) { }
  };
  const _sa = stepAdventure;
  stepAdventure = function () {
    const c = state.cap43;
    if (c) {
      const now = calculateTotalStats().combatPower;
      if (c.a !== state.currentArea || now >= c.cp * 1.08 || Date.now() - c.t > 20 * 60000 || !state.autoExplore) { if (c.a === state.currentArea && state.autoExplore) { try { logAdventure('<span class="text-amber-300">⚔ 道友整頓完畢,再次往深處挑戰!</span>'); } catch (e) { } } state.cap43 = null; }
      else if ((state.exploreStep || 1) + 1 >= c.step && !currentBattle) state.exploreStep = Math.max(1, c.step - 3);
    }
    return _sa.apply(this, arguments);
  };
})();
