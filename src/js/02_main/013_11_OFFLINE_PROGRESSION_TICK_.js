/* ==========================================================================
   11. OFFLINE PROGRESSION & TICK LOOP (FIX-B8, B11, OPT-O3)
   ========================================================================== */
function checkOfflineGains() {
  const now = Date.now();
  const elapsedMs = now - (state.lastSave || now);
  const elapsedSec = Math.floor(elapsedMs / 1000);

  if (elapsedSec >= 30) {
    const stats = calculateTotalStats();
    // 離線上限8小時 (28800秒) + 神遊太虛加成 (OPT-O8)
    const extraHours = (state.daoUpgrades && state.daoUpgrades['dao_offline']) ? state.daoUpgrades['dao_offline'] * 2 : 0;
    const maxOfflineSec = (8 + extraHours) * 3600;
    const effectiveSec = Math.min(elapsedSec, maxOfflineSec);

    const gainQi = effectiveSec * stats.qiRate;
    // OPT-O3: 靈石收益與歷練區域掛鉤
    const areaLvl = (state.currentArea || 0) + 1;
    const stoneRate = 0.05 + areaLvl * 0.05;
    let gainStones = Math.floor(effectiveSec * stoneRate);
    let advTxt = '';
    if (state.autoExplore || window._wasAuto) {
      const a = offlineAdventure(effectiveSec);
      if (a) {
        gainStones = Math.max(gainStones, a.stones);
        const it = Object.entries(a.items).map(([n, c]) => `${n}×${c}`).join('、');
        advTxt = ` 離線歷練斬妖約 ${formatNum(a.fights)} 場${it ? ',獲得 ' + it : ''}。`;
      }
    }
    window._offResume = !!advTxt;
    state.hp = null;
    window._wasAuto = false;

    QG.govern();
    const _qiBefore = state.qi;
    state.qi += gainQi;
    QG.govern();
    const gainQiAct = Math.max(0, state.qi - _qiBefore);
    state.totalCultivatedQi = (state.totalCultivatedQi || 0) + gainQiAct;
    state.stones += gainStones;

    // FIX-B8: 離線壽元增加
    const offlineYears = Math.floor(effectiveSec / AGE_TICK_SECONDS);
    state.age += offlineYears;

    // OPT-O3: 離線自動煉丹 (若有凝露靈草，最多煉製5顆聚氣丹)
    let craftedPills = 0;
    while (craftedPills < 5 && (state.inventory['herb_1'] || 0) >= 2) {
      state.inventory['herb_1'] -= 2;
      state.inventory['pill_1'] = (state.inventory['pill_1'] || 0) + 1;
      craftedPills++;
    }

    const minutes = Math.floor(effectiveSec / 60);
    const descEl = document.getElementById('offline-desc');
    const qiEl = document.getElementById('offline-gain-qi');
    const stonesEl = document.getElementById('offline-gain-stones');
    const pillsRow = document.getElementById('offline-pills-row');
    const pillsEl = document.getElementById('offline-gain-pills');

    if (descEl) descEl.innerText = `道友閉關打坐了 ${minutes} 分鐘，元神遊歷太虛，洞府靈脈吐納不息！壽元增長了 ${offlineYears} 歲。${gainQiAct < gainQi * 0.98 ? '氣海已盈,溢出的靈氣未能盡納。' : ''}${advTxt}`;
    if (qiEl) qiEl.innerText = `+${formatNum(gainQiAct)}`;
    if (stonesEl) stonesEl.innerText = `+${formatNum(gainStones)}`;
    if (pillsEl && pillsRow) {
      if (craftedPills > 0) {
        pillsRow.classList.remove('hidden');
        pillsEl.innerText = `+${craftedPills} 顆`;
      } else {
        pillsRow.classList.add('hidden');
      }
    }

    document.getElementById('modal-offline').classList.remove('hidden');
    { const _rb = document.getElementById('btn-offline-resume'); if (_rb) _rb.classList.toggle('hidden', !window._offResume); }
    // 檢查壽元是否耗盡
    if (state.age >= state.maxAge) {
      triggerLifespanEnd();
    }
  }
}

// FIX-B11: 基於時間差的平滑收益主循環
let lastTickTime = Date.now();
function gameTick() {
  const now = Date.now();
  const dt = Math.min(10, Math.max(0.1, (now - lastTickTime) / 1000)); // 秒差
  lastTickTime = now;

  const stats = calculateTotalStats();
  const qiGain = stats.qiRate * dt;
  state.qi += qiGain;
  state.totalCultivatedQi = (state.totalCultivatedQi || 0) + qiGain;

  // FIX-B8: 壽元推進
  checkLifespan(dt);
  regenHp(dt);

  updateTopBar();
}

setInterval(gameTick, 1000);
setInterval(saveGame, 10000);

// FIX-B11: 監聽視窗可見性變更
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    lastTickTime = Date.now();
    checkOfflineGains();
    updateTopBar();
    initQiCanvas(); // 恢復粒子動畫
  }
});

