/* ==========================================================================
   8. LIFESPAN, DEATH & REINCARNATION (FIX-B8, OPT-O8)
   ========================================================================== */
function checkLifespan(dt) {
  state.ageTimer = (state.ageTimer || 0) + dt;
  if (state.ageTimer >= AGE_TICK_SECONDS) {
    const years = Math.floor(state.ageTimer / AGE_TICK_SECONDS);
    state.age += years;
    state.ageTimer %= AGE_TICK_SECONDS;
  }

  // FIX-B8: 壽元耗盡坐化判定
  if (state.age >= state.maxAge) {
    triggerLifespanEnd();
  }
}

function triggerLifespanEnd() {
  // 終止戰鬥與歷練
  if (currentBattle) endBattle();
  stopAutoExplore('壽元耗盡，歷練中止。');

  // 結算道心點數 (OPT-O8)
  const realmGain = state.realmIdx * 5 + state.subRealm;
  const qiGain = Math.floor(Math.log10(Math.max(10, state.totalCultivatedQi || 10)));
  const totalGain = Math.max(1, realmGain + qiGain);

  const modal = document.getElementById('modal-death-reincarnate');
  const prevRealmEl = document.getElementById('reincarnate-prev-realm');
  const totalQiEl = document.getElementById('reincarnate-total-qi');
  const gainDaoEl = document.getElementById('reincarnate-gain-dao');

  const _rt = document.getElementById('reincarnate-modal-title');
  if (_rt) _rt.innerText = '道軀坐化 · 輪迴轉世';
  if (prevRealmEl) prevRealmEl.innerText = getRealmInfo().title;
  if (totalQiEl) totalQiEl.innerText = formatNum(state.totalCultivatedQi || 0);
  if (gainDaoEl) gainDaoEl.innerText = `+${totalGain} 點`;

  state._pendingDaoGain = totalGain;
  if (modal) modal.classList.remove('hidden');
}

// OPT-O8: 執行轉世重生
function executeReincarnation() {
  const gain = state._pendingDaoGain || Math.max(1, state.realmIdx * 5 + state.subRealm);
  state.daoPoints = (state.daoPoints || 0) + gain;
  state.reincarnationCount = (state.reincarnationCount || 0) + 1;

  // 初始起始靈石加成 (道心閣)
  const initStones = 120 + ((state.daoUpgrades && state.daoUpgrades['dao_stone']) ? 200 * state.daoUpgrades['dao_stone'] : 0);

  // 重置境界與修為，保留成就、道心點、道心閣升級
  const preserved = {
    saveVersion: SAVE_VERSION,
    tut160: state.tut160, op176: state.op176,   /* v185 教學與開場片看過紀錄跨周目保留 */
    name: state.name,
    daoPoints: state.daoPoints,
    daoUpgrades: state.daoUpgrades || {},
    reincarnationCount: state.reincarnationCount,
    ascensionCount: state.ascensionCount || 0,
    treasures: state.treasures || {},
    pets: state.pets || {},
    activePet: state.activePet || null,
    eggs: state.eggs || 0,
    tfrag: state.tfrag || 0,
    wb: state.wb || { lv: 0, cur: null },
    tower: state.tower || { floor: 1, best: 0 },
    tut2: state.tut2 || { sk: false, ming: false },
    uiSeen: state.uiSeen || { treas: 0 },
    lastExport: state.lastExport || 0,
    autoPill: state.autoPill !== false,
    storySeen: state.storySeen || {},
    un9: state.un9 || {},
    align: state.align || 0,
    sectGrad: state.sectGrad || {},
    sectSk: state.sectSk || {},
    gender: state.gender || null,
    look: state.look || 'o1',
    wardrobe: state.wardrobe || ['o1'],
    lookSeen: state.lookSeen || ['o1'],
    dex: state.dex || { m: {}, i: {}, c: {} },
    titles: state.titles || { got: {}, eq: null, seen: {} },
    st15: state.st15 || {},
    lite: !!state.lite,
    xian: state.xian || 0,
    xianTot: state.xianTot || 0,
    shen: state.shen || {},
    guo: state.guo || {},
    jie: state.jie || {},
    sch: state.sch || {},
    guide: state.guide || { done: {}, skip: {}, hide: false, v: 1 },
    story27: state.story27 || JSON.parse(JSON.stringify(defaultState.story27)),
    furnace: state.furnace || {},
    bossMode: state.bossMode || 'ask',
    un9init: state.un9init || 0,
    achievementsClaimed: state.achievementsClaimed || {},
    soundEnabled: state.soundEnabled,
    soundVolume: state.soundVolume,
    stones: initStones
  };

  state = Object.assign({}, JSON.parse(JSON.stringify(defaultState)), preserved);
  
  const modal = document.getElementById('modal-death-reincarnate');
  if (modal) modal.classList.add('hidden');

  audio.playFanfare();
  showToast(`真靈轉世成功！獲得道心點 +${gain}！重臨人間！`);
  logAdventure(`<span class="text-purple-400 font-bold">☯ 道友歷劫坐化，真靈不滅，輪迴轉生！獲取道心點 +${gain}！</span>`);

  updateTopBar();
  renderTechniques();
  renderInventory();
  renderCrafting();
  renderMarket();
  renderProfile();
  renderTalents();
  saveGame();
}

// 購買道心閣永久升級 (OPT-O8)
function buyDaoUpgrade(id) {
  const item = DAO_SHOP_ITEMS.find(d => d.id === id);
  if (!item) return;
  if ((state.daoPoints || 0) < item.cost) {
    showToast('道心點數不足！');
    return;
  }
  state.daoPoints -= item.cost;
  state.daoUpgrades = state.daoUpgrades || {};
  state.daoUpgrades[id] = (state.daoUpgrades[id] || 0) + 1;

  audio.playFanfare();
  showToast(`悟道有成！獲得永久仙道遺澤【${item.name}】！`);
  renderProfile();
  updateTopBar();
  saveGame();
}

// 領取每日任務賞賜 (OPT-O9)
function claimDailyQuest(id) {
  const quest = DAILY_QUESTS_DATA.find(q => q.id === id);
  if (!quest) return;
  const progress = (state.dailyProgress && state.dailyProgress[id]) || 0;
  if (progress < quest.target) return;
  if (state.dailyClaimed && state.dailyClaimed[id]) return;

  state.dailyClaimed = state.dailyClaimed || {};
  state.dailyClaimed[id] = true;

  if (quest.reward.stones) state.stones += quest.reward.stones;
  if (quest.reward.qi) state.qi += quest.reward.qi;
  if (quest.reward.item) {
    state.inventory[quest.reward.item] = (state.inventory[quest.reward.item] || 0) + (quest.reward.count || 1);
  }

  audio.playFanfare();
  showToast(`領取課業賞賜成功！獲得靈石 +${quest.reward.stones || 0}！`);
  renderDailyQuests();
  updateTopBar();
  renderInventory();
  saveGame();
}

// 領取成就賞賜 (OPT-O9)
function claimAchievement(id) {
  const ach = ACHIEVEMENTS_DATA.find(a => a.id === id);
  if (!ach) return;
  state.achievementsClaimed = state.achievementsClaimed || {};
  if (state.achievementsClaimed[id]) return;
  if (!ach.check(state)) return;

  state.achievementsClaimed[id] = true;
  state.stones += ach.rewardStones;
  audio.playFanfare();
  showToast(`達成里程碑！獲得靈石 +${ach.rewardStones}！`);
  renderAchievements();
  updateTopBar();
  saveGame();
}

// 升級天賦節點 (OPT-O7)
function upgradeTalent(id) {
  const tal = TALENTS_DATA.find(t => t.id === id);
  if (!tal) return;
  state.talents = state.talents || {};
  const curLvl = state.talents[id] || 0;
  if (curLvl >= tal.maxLevel) {
    showToast('該天賦已修煉至極限！');
    return;
  }
  const nc = talCost(tal, curLvl);
  if ((state.daoPoints || 0) < nc) {
    showToast('天賦道心點不足！');
    return;
  }
  state.daoPoints -= nc;
  state.talents[id] = curLvl + 1;
  state.talFix = true;
  if (tal.stat === 'maxAge') state.maxAge += curLvl < 3 ? tal.val : Math.round(tal.val * 0.3);
  audio.playFanfare();
  showToast(`天賦【${tal.name}】精進至第${state.talents[id]}重！`);
  renderTalents();
  updateTopBar();
  renderProfile();
  saveGame();
}

