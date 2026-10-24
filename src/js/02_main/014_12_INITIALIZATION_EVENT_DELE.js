/* ==========================================================================
   12. INITIALIZATION & EVENT DELEGATION (OPT-O10)
   ========================================================================== */
window.addEventListener('load', () => {
  window.__LOADED112 = true;   // v112 從這裡起才允許存檔(loadGame 為同步,不會被其他計時器插隊)
  loadGame();
  window._wasAuto = !!state.autoExplore;
  state.autoExplore = false; // 重新載入後自動歷練預設關閉(計時器不會自行恢復)
  state.pendingEvents = Array.isArray(state.pendingEvents) ? state.pendingEvents : [];
  audio.enabled = state.soundEnabled;
  const soundIcon = document.getElementById('sound-icon');
  if (soundIcon) soundIcon.innerText = state.soundEnabled ? '🔔 音效:開' : '🔕 音效:關';

  initQiCanvas();
  checkOfflineGains();
  updateTopBar();
  updateAutoExploreBtn();
  renderAutoStatusBar();
  renderTechniques();
  renderTalents();
  renderInventory();
  renderCrafting();
  renderMarket();
  renderProfile();

  // 靜態按鈕事件綁定
  document.getElementById('btn-tap-cultivate')?.addEventListener('click', tapCultivate);
  document.getElementById('btn-trigger-breakthrough')?.addEventListener('click', checkAndTriggerBreakthrough);
  document.getElementById('btn-upgrade-array')?.addEventListener('click', upgradeArray);
  document.getElementById('btn-upgrade-insight')?.addEventListener('click', upgradeInsight);
  document.getElementById('btn-harvest-garden')?.addEventListener('click', harvestGarden);
  document.getElementById('btn-wash-root')?.addEventListener('click', washRoot);

  // 天劫相關按鈕
  document.getElementById('btn-use-trib-pill')?.addEventListener('click', toggleTribPill);
  document.getElementById('btn-start-tribulation')?.addEventListener('click', executeTribulation);
  document.getElementById('btn-cancel-tribulation')?.addEventListener('click', () => {
    document.getElementById('modal-tribulation')?.classList.add('hidden');
  });
  document.getElementById('btn-demon-tribulation')?.addEventListener('click', triggerDemonTribulation);

  // 道號修改
  document.getElementById('btn-edit-name')?.addEventListener('click', () => {
    const input = document.getElementById('input-new-name');
    if (input) input.value = state.name;
    document.getElementById('modal-edit-name')?.classList.remove('hidden');
  });
  document.getElementById('btn-confirm-name')?.addEventListener('click', () => {
    const input = document.getElementById('input-new-name');
    const val = input ? input.value.trim().slice(0, 12) : '';
    if (val) {
      state.name = escapeHtml(val);
      updateTopBar();
      saveGame();
    }
    document.getElementById('modal-edit-name')?.classList.add('hidden');
  });
  document.getElementById('btn-cancel-name')?.addEventListener('click', () => {
    document.getElementById('modal-edit-name')?.classList.add('hidden');
  });

  // 仙經指引彈窗
  document.getElementById('btn-show-help')?.addEventListener('click', () => {
    document.getElementById('modal-help')?.classList.remove('hidden');
  });
  document.getElementById('btn-close-help')?.addEventListener('click', () => {
    document.getElementById('modal-help')?.classList.add('hidden');
  });

  // 離線彈窗關閉
  document.getElementById('btn-close-offline')?.addEventListener('click', () => {
    document.getElementById('modal-offline')?.classList.add('hidden');
    updateTopBar();
    saveGame();
  });

  // 音效切換 (同步按鈕文字與狀態)
  document.getElementById('btn-sound-toggle')?.addEventListener('click', () => {
    state.soundEnabled = !state.soundEnabled;
    audio.enabled = state.soundEnabled;
    const soundIcon = document.getElementById('sound-icon');
    if (soundIcon) soundIcon.innerText = state.soundEnabled ? '🔔 音效:開' : '🔕 音效:關';
    saveGame();
  });

  // 新手引導跳過
  document.getElementById('btn-skip-tutorial')?.addEventListener('click', () => {
    state.tutorialStep = 99;
    document.getElementById('tutorial-guide-banner')?.classList.add('hidden');
    saveGame();
  });

  // 導航欄分頁切換 (支援6個分頁)
  const tabButtons = document.querySelectorAll('.nav-tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => {
        b.classList.remove('text-amber-400', 'font-bold');
        b.classList.add('text-slate-400');
      });
      btn.classList.add('text-amber-400', 'font-bold');
      btn.classList.remove('text-slate-400');

      const target = btn.getAttribute('data-tab');
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));
      const targetEl = document.getElementById(target);
      if (targetEl) targetEl.classList.remove('hidden');

      // 切換分頁時重新渲染對應模組
      if (target === 'tab-techniques') { renderTechniques(); renderTalents(); }
      if (target === 'tab-crafting') renderCrafting();
      if (target === 'tab-inventory') renderInventory();
      if (target === 'tab-records') renderProfile();
      if (target === 'tab-adventure') autoStopReason = '';
      renderAutoStatusBar();
    });
  });

  // 丹器子分頁切換
  document.getElementById('subtab-alchemy-btn')?.addEventListener('click', () => {
    document.getElementById('subtab-alchemy-btn').className = "flex-1 py-2 font-serif-tc font-bold text-amber-400 border-b-2 border-amber-400";
    document.getElementById('subtab-forge-btn').className = "flex-1 py-2 font-serif-tc text-slate-400 border-b-2 border-transparent hover:text-slate-200";
    document.getElementById('subtab-alchemy-content')?.classList.remove('hidden');
    document.getElementById('subtab-forge-content')?.classList.add('hidden');
  });
  document.getElementById('subtab-forge-btn')?.addEventListener('click', () => {
    document.getElementById('subtab-forge-btn').className = "flex-1 py-2 font-serif-tc font-bold text-cyan-400 border-b-2 border-cyan-400";
    document.getElementById('subtab-alchemy-btn').className = "flex-1 py-2 font-serif-tc text-slate-400 border-b-2 border-transparent hover:text-slate-200";
    document.getElementById('subtab-forge-content')?.classList.remove('hidden');
    document.getElementById('subtab-alchemy-content')?.classList.add('hidden');
  });

  // 功法與天賦子分頁切換 (OPT-O7)
  document.getElementById('subtab-tech-list-btn')?.addEventListener('click', () => {
    document.getElementById('subtab-tech-list-btn').className = "flex-1 py-2 font-serif-tc font-bold text-amber-400 border-b-2 border-amber-400";
    document.getElementById('subtab-talents-btn').className = "flex-1 py-2 font-serif-tc text-slate-400 border-b-2 border-transparent hover:text-slate-200";
    document.getElementById('subtab-tech-content')?.classList.remove('hidden');
    document.getElementById('subtab-talents-content')?.classList.add('hidden');
  });
  document.getElementById('subtab-talents-btn')?.addEventListener('click', () => {
    document.getElementById('subtab-talents-btn').className = "flex-1 py-2 font-serif-tc font-bold text-teal-400 border-b-2 border-teal-400";
    document.getElementById('subtab-tech-list-btn').className = "flex-1 py-2 font-serif-tc text-slate-400 border-b-2 border-transparent hover:text-slate-200";
    document.getElementById('subtab-talents-content')?.classList.remove('hidden');
    document.getElementById('subtab-tech-content')?.classList.add('hidden');
    renderTalents();
  });

  // 歷練相關
  document.getElementById('btn-step-explore')?.addEventListener('click', stepAdventure);
  document.getElementById('select-adventure-area')?.addEventListener('change', (e) => {
    state.currentArea = parseInt(e.target.value, 10);
    state.exploreStep = 1;
    // 切換區域時停止自動歷練 (FIX-B6)
    stopAutoExplore('');
    const area = AREAS_DATA[state.currentArea];
    document.getElementById('current-area-title').innerText = `${area.name} (${REALM_DATA[area.realmReq]?.name || ''})`;
    document.getElementById('current-area-desc').innerText = area.desc;
    document.getElementById('explore-progress-text').innerText = `層數 1 / ${area.maxSteps}`;
    document.getElementById('explore-progress-fill').style.width = `${(1 / area.maxSteps) * 100}%`;
    logAdventure(`進入新秘境：【${area.name}】。`);
    updateAreaMilestoneText();
  });

  // 自動歷練開關 (FIX-B6)
  document.getElementById('btn-pending-events')?.addEventListener('click', openNextPendingEvent);
  // 奇遇結果視窗按鈕
  document.getElementById('btn-event-result-close')?.addEventListener('click', () => {
    document.getElementById('modal-event-result')?.classList.add('hidden');
    renderAutoStatusBar();
  });
  document.getElementById('btn-event-result-next')?.addEventListener('click', () => {
    document.getElementById('modal-event-result')?.classList.add('hidden');
    openNextPendingEvent();
  });
  document.getElementById('btn-event-result-battle')?.addEventListener('click', () => {
    document.getElementById('modal-event-result')?.classList.add('hidden');
    if (currentBattle) { showToast('戰鬥正酣，妖禽混入戰團！'); return; }
    // 戰鬥畫面位於歷練分頁,迎戰時才切過去
    if (!isOnAdventureTab()) goToTab('tab-adventure');
    if (eventResultArea) startMonsterBattle(eventResultArea, false);
  });
  document.getElementById('auto-explore-status-text')?.addEventListener('click', () => {
    document.querySelector('.nav-tab-btn[data-tab="tab-adventure"]')?.click();
  });
  document.getElementById('btn-auto-explore')?.addEventListener('click', () => {
    if (state.autoExplore) {
      const _sum = autoSummaryText();
      stopAutoExplore('');
      if (_sum) showToast(_sum);
    } else {
      state.autoExplore = true;
      autoStopReason = '';
      autoStatusMsg = '出發探索…';
      autoStats = { wins: 0, stones: 0, items: {} };
      if (autoExploreInterval) clearInterval(autoExploreInterval);
      autoExploreInterval = setInterval(stepAdventure, 1500);
      updateAutoExploreBtn();
      renderAutoStatusBar();
    }
  });

  // 戰鬥操作
  document.getElementById('btn-battle-attack')?.addEventListener('click', () => playerBattleAttack(false));
  document.getElementById('btn-battle-skill')?.addEventListener('click', () => playerBattleAttack(true));
  document.getElementById('btn-battle-heal')?.addEventListener('click', playerBattleHeal);
  document.getElementById('btn-battle-flee')?.addEventListener('click', playerBattleFlee);
  document.getElementById('btn-battle-auto-toggle')?.addEventListener('click', toggleAutoBattle);
  document.getElementById('btn-battle-speed')?.addEventListener('click', toggleBattleSpeed);

  // 戰鬥結算彈窗關閉
  document.getElementById('btn-close-battle-result')?.addEventListener('click', () => {
    clearTimeout(battleResultTimer);
    document.getElementById('modal-battle-result')?.classList.add('hidden');
  });

  // 清空歷練日誌
  document.getElementById('btn-clear-log')?.addEventListener('click', () => {
    const box = document.getElementById('adventure-log-box');
    if (box) box.innerHTML = '<div class="text-slate-500 italic">歷練神遊紀事已清空。</div>';
  });

  // 儲物袋一鍵功能
  document.getElementById('btn-auto-equip-best')?.addEventListener('click', autoEquipBest);
  document.getElementById('btn-sell-low-mats')?.addEventListener('click', sellLowTierMaterials);
  document.getElementById('btn-use-all-pills')?.addEventListener('click', useAllPills);
  document.getElementById('btn-sell-spare-equip')?.addEventListener('click', sellSpareEquipment);
  document.getElementById('btn-enhance-equipped')?.addEventListener('click', () => {
    document.getElementById('modal-enhance-gear')?.classList.remove('hidden');
    updateEnhanceModalLabels();
  });
  document.getElementById('btn-close-enhance')?.addEventListener('click', () => {
    document.getElementById('modal-enhance-gear')?.classList.add('hidden');
  });

  // 強化彈窗三個按鈕
  document.getElementById('btn-enhance-weapon')?.addEventListener('click', () => { enhanceEquippedGear('weapon'); updateEnhanceModalLabels(); });
  document.getElementById('btn-enhance-armor')?.addEventListener('click', () => { enhanceEquippedGear('armor'); updateEnhanceModalLabels(); });
  document.getElementById('btn-enhance-artifact')?.addEventListener('click', () => { enhanceEquippedGear('artifact'); updateEnhanceModalLabels(); });

  function updateEnhanceModalLabels() {
    state.enhance = state.enhance || { weapon: 0, armor: 0, artifact: 0 };
    const wepLabel = document.getElementById('enhance-weapon-label');
    const armLabel = document.getElementById('enhance-armor-label');
    const artLabel = document.getElementById('enhance-artifact-label');
    const wepItem = state.equipment.weapon ? ITEMS[state.equipment.weapon]?.name : '無武器';
    const armItem = state.equipment.armor ? ITEMS[state.equipment.armor]?.name : '無道袍';
    const artItem = state.equipment.artifact ? ITEMS[state.equipment.artifact]?.name : '無法寶';
    if (wepLabel) wepLabel.innerText = `⚔️ ${wepItem} (+${state.enhance.weapon || 0})`;
    if (armLabel) armLabel.innerText = `🥋 ${armItem} (+${state.enhance.armor || 0})`;
    if (artLabel) artLabel.innerText = `💍 ${artItem} (+${state.enhance.artifact || 0})`;
  }

  // 存檔匯出與匯入 (OPT-O10)
  document.getElementById('btn-manual-save')?.addEventListener('click', () => {
    saveGame();
    showToast('仙途道痕已保存至識海！');
  });
  document.getElementById('btn-export-save')?.addEventListener('click', () => openSaveModal('export'));
  document.getElementById('btn-import-save')?.addEventListener('click', () => openSaveModal('import'));
  document.getElementById('btn-action-save-modal')?.addEventListener('click', handleSaveModalAction);
  document.getElementById('btn-close-save-modal')?.addEventListener('click', () => {
    document.getElementById('modal-save-export-import')?.classList.add('hidden');
  });
  document.getElementById('btn-cancel-save-modal')?.addEventListener('click', () => {
    document.getElementById('modal-save-export-import')?.classList.add('hidden');
  });

  // 主動與坐化轉世 (OPT-O8)
  document.getElementById('btn-manual-reincarnate')?.addEventListener('click', triggerLifespanEnd);
  document.getElementById('btn-confirm-reincarnate')?.addEventListener('click', executeReincarnation);
  document.getElementById('btn-ascend-continue')?.addEventListener('click', closeCinematic);
  document.getElementById('btn-ascend-reincarnate')?.addEventListener('click', endingReincarnate);
  document.getElementById('modal-ascension')?.addEventListener('click', (e) => {
    if (e.target.closest('button')) return;
    revealCinematicEnd();
  });

  // 散功重修
  const resetModal = document.getElementById('modal-reset-confirm');
  document.getElementById('btn-reset-game')?.addEventListener('click', () => {
    if (resetModal) resetModal.classList.remove('hidden');
  });
  document.getElementById('btn-cancel-reset')?.addEventListener('click', () => {
    if (resetModal) resetModal.classList.add('hidden');
  });
  document.getElementById('btn-confirm-reset')?.addEventListener('click', () => {
    if (resetModal) resetModal.classList.add('hidden');
    try {
      localStorage.removeItem('XIUXIAN_SAVE_V2');
      localStorage.removeItem('XIUXIAN_SAVE_DATA_V1');
    } catch (e) {}
    state = JSON.parse(JSON.stringify(defaultState));
    updateTopBar();
    renderTechniques();
    renderInventory();
    renderCrafting();
    renderMarket();
    renderProfile();
    renderTalents();
    showToast('道友徹底散功，重歸凡塵！');
  });

  // 洗靈根防呆確認 (FIX-B10)
  document.getElementById('btn-confirm-replace-root')?.addEventListener('click', () => {
    document.getElementById('modal-wash-root-confirm')?.classList.add('hidden');
    if (pendingRoot) {
      state.stones -= (window._pendingRootCost || 100);
      applyNewRoot(pendingRoot);
      showToast('已確認替換新靈根資質！');
      pendingRoot = null;
    }
  });
  document.getElementById('btn-cancel-replace-root')?.addEventListener('click', () => {
    document.getElementById('modal-wash-root-confirm')?.classList.add('hidden');
    pendingRoot = null;
    showToast('已保留原先五行資質。');
  });

  // 重新整理坊市
  document.getElementById('btn-refresh-market')?.addEventListener('click', () => {
    audio.playQiChime();
    renderMarket();
    showToast('萬寶閣貨架已重新整理！');
  });

  // =========================================================================
  // OPT-O10: 事件委派監聽 (全域容器委派，徹底消除所有 inline onclick)
  // =========================================================================
  document.getElementById('techniques-list')?.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const action = btn.getAttribute('data-action');
    const id = btn.getAttribute('data-id');
    if (action === 'learn-tech') learnTechnique(id);
    if (action === 'upgrade-tech') upgradeTechnique(id);
  });

  document.getElementById('talents-list')?.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action="upgrade-talent"]');
    if (!btn) return;
    const id = btn.getAttribute('data-id');
    if (id) upgradeTalent(id);
  });

  document.getElementById('inventory-grid')?.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const action = btn.getAttribute('data-action');
    const id = btn.getAttribute('data-id');
    if (action === 'use-item') useItem(id);
    if (action === 'use-item-all') useItem(id, true);
    if (action === 'sell-equip') sellEquipItem(id);
    if (action === 'equip-item') equipItem(id);
    if (action === 'sell-single-item') sellSingleItem(id);
  });

  document.getElementById('alchemy-recipes-list')?.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action="craft-alchemy"], button[data-action="craft-alchemy-all"]');
    if (!btn) return;
    const idx = parseInt(btn.getAttribute('data-index'), 10);
    if (!isNaN(idx)) craftAlchemy(idx, btn.getAttribute('data-action') === 'craft-alchemy-all');
  });

  document.getElementById('forge-recipes-list')?.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action="craft-forge"]');
    if (!btn) return;
    const idx = parseInt(btn.getAttribute('data-index'), 10);
    if (!isNaN(idx)) craftForge(idx);
  });

  document.getElementById('market-items-list')?.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action="buy-market-item"]');
    if (!btn) return;
    const idx = parseInt(btn.getAttribute('data-index'), 10);
    if (!isNaN(idx)) buyMarketItem(idx);
  });

  document.getElementById('daily-quests-list')?.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action="claim-daily"]');
    if (!btn) return;
    const id = btn.getAttribute('data-id');
    if (id) claimDailyQuest(id);
  });

  document.getElementById('dao-shop-list')?.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action="buy-dao-upgrade"]');
    if (!btn) return;
    const id = btn.getAttribute('data-id');
    if (id) buyDaoUpgrade(id);
  });

  document.getElementById('achievements-list')?.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action="claim-ach"]');
    if (!btn) return;
    const id = btn.getAttribute('data-id');
    if (id) claimAchievement(id);
  });
});

  
