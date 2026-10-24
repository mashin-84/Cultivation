/* ==========================================================================
   6. CORE GAMEPLAY ACTIONS (FIX-B1, B2, B3, B4, B8, B10, OPT-O3, O6)
   ========================================================================== */
// 1. 手動吐納聚氣 (OPT-O3: 納入悟性加成)
function tapCultivate(e) {
  audio.init();
  audio.playQiChime();

  const stats = calculateTotalStats();
  const isCrit = Math.random() * 100 < stats.crit;
  const baseGain = stats.qiRate * (TAP_QI_RATE_MULT + 0.1 * (state.insightLevel || 1));   // v109 悟性越高,一次點擊抵越多秒吐納
  const insightBonus = (state.insightLevel || 1) * TAP_INSIGHT_PER_LV;
  const gain = isCrit ? Math.floor((baseGain + insightBonus) * 2) : Math.floor(baseGain + insightBonus);
  
  state.qi += gain;
  state.totalCultivatedQi = (state.totalCultivatedQi || 0) + gain;

  // 每日任務計數
  if (state.dailyProgress) {
    state.dailyProgress.quest_tap = (state.dailyProgress.quest_tap || 0) + 1;
  }

  // 新手引導前進 (OPT-O9)
  if (state.tutorialStep === 0) {
    state.tutorialStep = 1;
  }

  // 漂浮數字特效
  const btn = document.getElementById('btn-tap-cultivate');
  if (btn) {
    const rect = btn.getBoundingClientRect();
    const floater = document.createElement('div');
    floater.className = 'float-text ' + (isCrit ? 'text-amber-400 font-black text-sm' : 'text-teal-300 font-bold text-xs');
    floater.innerText = isCrit ? `頓悟暴擊 +${formatNum(gain)} 修為！` : `+${formatNum(gain)} 修為`;
    const x = rect.left + rect.width / 2 + (Math.random() * 40 - 20);
    const y = rect.top - 10;
    floater.style.left = `${x}px`;
    floater.style.top = `${y}px`;
    document.body.appendChild(floater);
    setTimeout(() => floater.remove(), 800);
  }

  updateTopBar();
}

// OPT-O3: 升級元神悟性
function upgradeInsight() {
  const cost = Math.floor(100 * Math.pow(1.6, Math.max(0, state.insightLevel - 1)));
  if (state.stones < cost) {
    showToast('靈石不足，無法開竅通神！');
    return;
  }
  state.stones -= cost;
  state.insightLevel = (state.insightLevel || 1) + 1;
  audio.playFanfare();
  showToast(`元神開竅！悟性提升至 Lv.${state.insightLevel}！每次點擊收益大增！`);
  updateTopBar();
  saveGame();
}

// 2. 突破與渡天劫 (FIX-B1, B2)
function checkAndTriggerBreakthrough() {
  let info = getRealmInfo();
  if (state.qi < info.maxQi) return;

  if (state.subRealm >= info.realm.subMax) {
    if (!REALM_DATA[state.realmIdx + 1]) { showDaoEnding(); return; } // 大羅金仙:證道終局
    openTribulationModal();
    return;
  }

  // FIX: 溢出修為保留,並一次連破所有能破的小層(大境界頂層需渡劫,停在該處)
  audio.init();
  audio.playFanfare();
  // 一次只升一層:餘息(儲備)全數保留,留待下一次突破
  state.qi -= info.maxQi;
  state.subRealm += 1;
  state.pillTox = 0;
  info = getRealmInfo();
  QG.sync();
  showToast(`突破成功！已進階至【${info.realm.name}第${state.subRealm}層】！經脈拓寬,丹毒盡消。`);
  updateTopBar();
  renderProfile();
  saveGame();
}

let usePillInTrib = false;
function openTribulationModal(keepDemon = false) {
  const nextRealm = REALM_DATA[state.realmIdx + 1];
  if (!nextRealm) {
    showToast('已證道大羅，位列仙途之巔！');
    return;
  }
  if (!keepDemon) { usePillInTrib = false; state.demonDefeated = false; } // 心魔試煉歸來時保留加成與渡劫丹選擇

  const modal = document.getElementById('modal-tribulation');
  if (!modal) return;
  modal.classList.remove('hidden');

  if (state.realmIdx === 4) {
    document.getElementById('trib-realm-name').innerText = `引動飛升雷劫：衝擊【${nextRealm.name}】`;
    document.getElementById('trib-lore').innerText = `九九重雷劫雲遮天蔽日，天門隱現！此劫一過，便可破碎虛空、飛升仙界，位列仙班。成敗在此一舉！`;
  } else {
    document.getElementById('trib-realm-name').innerText = `引動天劫：衝擊【${nextRealm.name}】`;
    document.getElementById('trib-lore').innerText = `九天罡風呼嘯，紫霄天劫凝聚！修仙逆天求道，欲踏入${nextRealm.name}，需硬抗天雷伐體！`;
  }

  // FIX-B1: 使用 getTribulationChance() 統一成功率顯示
  updateTribulationModalChances();

  document.getElementById('trib-actions-group').classList.remove('hidden');
  document.getElementById('trib-process-box').classList.add('hidden');
  document.getElementById('trib-progress-bar').style.width = '0%';

  // 渡劫丹狀態檢查 (FIX-B2: 開啟不扣丹)
  const pillBtn = document.getElementById('btn-use-trib-pill');
  if (pillBtn) {
    const pillCount = state.inventory['pill_3'] || 0;
    if (pillCount > 0) {
      pillBtn.disabled = false;
      pillBtn.className = "tap-effect w-full py-2 rounded bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 text-xs border border-emerald-600";
      pillBtn.innerText = `💊 使用渡劫丹 (+20% 成功率且失敗修為損失減半) [剩餘:${pillCount}]`;
    } else {
      pillBtn.disabled = true;
      pillBtn.className = "w-full py-2 rounded bg-slate-800 text-slate-500 text-xs border border-slate-700 cursor-not-allowed";
      pillBtn.innerText = `💊 暫無渡劫丹 (可在丹閣煉製或坊市購買)`;
    }
  }

  // OPT-O3: 心魔試煉按鈕 (築基以上可選)
  const demonBtn = document.getElementById('btn-demon-tribulation');
  const demonRow = document.getElementById('trib-demon-row');
  if (demonBtn && demonRow) {
    if (state.realmIdx >= 1) {
      demonBtn.classList.remove('hidden');
      demonRow.classList.remove('hidden');
      if (state.demonDefeated) {
        demonBtn.innerText = '✅ 心魔已斬 (天劫成功率 +15%)';
        demonBtn.disabled = true;
      } else {
        demonBtn.innerText = '👁️ 引動心魔試煉 (勝則天劫成功率額外+15%)';
        demonBtn.disabled = false;
      }
    } else {
      demonBtn.classList.add('hidden');
      demonRow.classList.add('hidden');
    }
  }

  // 心魔歸來:渡劫丹若已選用,按鈕維持選取外觀
  if (keepDemon && usePillInTrib && (state.inventory['pill_3'] || 0) > 0) {
    const _pb = document.getElementById('btn-use-trib-pill');
    if (_pb) _pb.className = "tap-effect w-full py-2 rounded bg-emerald-600 text-white text-xs font-bold border border-emerald-300 shadow";
  }

  startTribulationCanvas();
}

// FIX-B1: 更新渡劫視窗的各項機率文字
function updateTribulationModalChances() {
  const c = getTribulationChance();
  const baseEl = document.getElementById('trib-base-chance');
  const rootEl = document.getElementById('trib-bonus-chance');
  const pillEl = document.getElementById('trib-pill-chance');
  const streakEl = document.getElementById('trib-streak-chance');
  const demonEl = document.getElementById('trib-demon-chance');
  const totalEl = document.getElementById('trib-total-chance');

  if (baseEl) baseEl.innerText = `${c.baseChance}%`;
  if (rootEl) rootEl.innerText = `+${c.rootBonus}%`;
  if (pillEl) pillEl.innerText = `+${c.pillBonus}%`;
  if (streakEl) streakEl.innerText = `+${c.streakBonus}%`;
  if (demonEl) demonEl.innerText = `+${c.demonBonus}%`;
  if (totalEl) totalEl.innerText = `${c.totalChance}%`;
}

// FIX-B1 & FIX-B2: 切換使用渡劫丹 (不扣除，只標記)
function toggleTribPill() {
  if ((state.inventory['pill_3'] || 0) <= 0) {
    showToast('儲物袋內並無渡劫丹！');
    return;
  }
  usePillInTrib = !usePillInTrib;
  const pillBtn = document.getElementById('btn-use-trib-pill');
  if (pillBtn) {
    if (usePillInTrib) {
      pillBtn.className = "tap-effect w-full py-2 rounded bg-emerald-600 text-white text-xs font-bold border border-emerald-300 shadow";
    } else {
      pillBtn.className = "tap-effect w-full py-2 rounded bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 text-xs border border-emerald-600";
    }
  }
  updateTribulationModalChances();
}

// OPT-O3: 心魔試煉戰鬥
function triggerDemonTribulation() {
  if (currentBattle && !(window.HO43 && HO43.yieldBattle())) { showToast('戰鬥中，無法引動心魔！'); return; }
  if (state.demonDefeated) { showToast('心魔已斬，無需再戰！'); return; }
  const stats = calculateTotalStats();
  const modal = document.getElementById('modal-tribulation');
  if (modal) modal.classList.add('hidden');
  // 戰鬥畫面在「歷練」分頁內,先切過去才看得到(結束後會自動回到原分頁)
  demonReturnTab = currentTabId();
  if (demonReturnTab === 'tab-adventure') demonReturnTab = 'tab-abode';
  goToTab('tab-adventure');

  // 心魔具有與玩家相當的屬性
  const demonMonster = {
    id: 'mind_demon',
    name: `${state.name}之元神心魔`,
    emoji: '👁️',
    element: 'fire',
    skillName: '心魔噬魂',
    skillDesc: '直擊道心識海，無視部分防禦',
    hp: Math.floor(stats.hp * 0.9),
    atk: Math.floor(stats.atk * 0.85),
    def: Math.floor(stats.def * 0.75),
    isBoss: true,
    isDemon: true,
    drops: [{ item: 'stone', count: 100 }]
  };

  currentBattle = {
    id: Date.now() + Math.random(),
    monster: { ...demonMonster, curHp: demonMonster.hp },
    playerHp: stats.hp,
    playerMaxHp: stats.hp,
    round: 1,
    isDemonTrib: true
  };

  document.getElementById('explore-panel').classList.add('hidden');
  const battleModal = document.getElementById('battle-modal');
  battleModal.classList.remove('hidden');

  document.getElementById('monster-name').innerText = demonMonster.name;
  document.getElementById('monster-avatar').innerText = demonMonster.emoji;
  document.getElementById('monster-element-badge').innerText = '心魔';
  document.getElementById('monster-skill-badge').innerText = `技能：${demonMonster.skillName}`;
  updateBattleUI();
  logAdventure(`<span class="text-purple-400 font-bold">👁️ 識海翻騰，心魔現形！戰勝心魔可獲天道庇佑 (+15% 渡劫成功率)！</span>`);
  showToast('識海翻騰，心魔現形！');
  if (state.autoBattle) scheduleAutoBattleTurn();
}

// 心魔試煉收尾:勝 / 敗 / 遁逃 都回到原分頁並重開天劫視窗(保留渡劫丹選擇與心魔加成)
function finishDemonBattle(outcome) {
  endBattle();
  if (outcome === 'win') {
    state.demonDefeated = true;
    audio.playFanfare();
    showToast('心魔已斬！心境澄明，天劫成功率額外 +15%！');
    logAdventure(`<span class="text-amber-400 font-bold">✨ 心魔劫破除！渡劫成功率額外大幅提升 +15%！</span>`);
  } else if (outcome === 'lose') {
    state.demonDefeated = false;
    const lostQi = Math.floor(Math.min(state.qi, getRealmInfo().maxQi) * 0.10);
    state.qi = Math.max(0, state.qi - lostQi);
    audio.playSlash();
    showToast(`心魔難斬，神識受創，損失修為 ${lostQi}。可再度挑戰。`);
    logAdventure(`<span class="text-rose-400">👁️ 道心動搖，被心魔反噬，損失 ${lostQi} 點修為。</span>`);
  } else {
    state.demonDefeated = false;
    showToast('你收斂心神退出識海，心魔暫且退去。');
    logAdventure('👁️ 你收斂心神退出識海，心魔試煉中止。');
  }
  goToTab(demonReturnTab || 'tab-abode');
  openTribulationModal(true);
  updateTopBar();
  saveGame();
}

// FIX-B2: 開始渡劫時才真正扣除渡劫丹
function executeTribulation() {
  audio.init();
  document.getElementById('trib-actions-group').classList.add('hidden');
  document.getElementById('trib-process-box').classList.remove('hidden');

  // FIX-B2: 按下開始渡劫時才扣除渡劫丹
  if (usePillInTrib && (state.inventory['pill_3'] || 0) > 0) {
    state.inventory['pill_3']--;
    showToast('已吞服渡劫丹，藥力護持周身！');
  }

  const strikeText = document.getElementById('trib-strike-text');
  const progressBar = document.getElementById('trib-progress-bar');
  const appEl = document.getElementById('game-app');

  let stage = 1;
  function strike() {
    if (!SFX.play('sfx_thunder')) audio.playThunder();
    triggerLightningFlash();
    if (appEl) {
      appEl.classList.add('shake');
      setTimeout(() => appEl.classList.remove('shake'), 300);
    }

    if (stage === 1) {
      if (strikeText) strikeText.innerText = "⚡ 第一重玄雷劈落！護體罡氣激盪！";
      if (progressBar) progressBar.style.width = "33%";
      stage = 2;
      setTimeout(strike, 1100);
    } else if (stage === 2) {
      if (strikeText) strikeText.innerText = "⚡⚡ 第二重煞火雷降世！血肉經脈重塑！";
      if (progressBar) progressBar.style.width = "66%";
      stage = 3;
      setTimeout(strike, 1100);
    } else if (stage === 3) {
      if (strikeText) strikeText.innerText = "⚡⚡⚡ 第三重九霄紫極神雷灌頂！";
      if (progressBar) progressBar.style.width = "100%";
      setTimeout(resolveTribulationOutcome, 1200);
    }
  }
  setTimeout(strike, 350);
}

// FIX-B1, B2: 渡劫判定與懲罰
function resolveTribulationOutcome() {
  const chanceInfo = getTribulationChance();
  const roll = Math.random() * 100;
  const modal = document.getElementById('modal-tribulation');
  if (modal) modal.classList.add('hidden');

  state.tribCount = (state.tribCount || 0) + 1;

  if (roll <= chanceInfo.totalChance) {
    // FIX-B1: 成功後保底次數歸零
    state.tribFailStreak = 0;
    state.demonDefeated = false;
    audio.playFanfare();

    const _carryQi = Math.max(0, state.qi - getRealmInfo().maxQi); // FIX: 渡劫成功保留溢出修為
    state.realmIdx += 1;
    state.subRealm = 1;
    state.qi = Math.min(_carryQi, Math.floor(getRealmInfo().maxQi * 0.99)); state.pillTox = 0; QG.sync();
    state.maxAge += state.realmIdx >= 5 ? 800 : 150; // 仙界壽元成長更多
    state.stones += state.realmIdx >= 5 ? 3000 : 300;
    state.daoPoints = (state.daoPoints || 0) + 1; // OPT-O7: 突破大境界獲得1天賦道心點

    const newRealmName = REALM_DATA[state.realmIdx].name;
    showToast(`🎉 金鱗化龍！恭喜道友成功渡劫，晉階【${newRealmName}】！天賦道心點+1！`);
    logAdventure(`<span class="text-amber-400 font-bold">【天劫吉兆】道友歷經九死一生，渡過神雷大劫，晉升【${newRealmName}】，壽元大增，獲天賦道心點+1！</span>`);
    if (state.realmIdx === 5 && !state.ascended) startAscension(); // 化神→真仙:飛升儀式
  } else {
    // FIX-B1: 失敗後連續失敗計數 +1
    state.tribFailStreak = (state.tribFailStreak || 0) + 1;
    state.demonDefeated = false;
    audio.playSlash();

    // FIX-B2: 有渡劫丹修為損失減半 (由 30% 降為 15%)
    const penaltyPct = usePillInTrib ? 0.15 : 0.30;
    const penalty = Math.floor(Math.min(state.qi, getRealmInfo().maxQi) * penaltyPct);
    state.qi = Math.max(0, state.qi - penalty);

    const pillNote = usePillInTrib ? '（因服用了渡劫丹，神藥庇護使修為損失減半！）' : '';
    showToast(`天雷浩瀚！突破失敗，損耗部分修為，留得肉身！${pillNote}`);
    logAdventure(`<span class="text-rose-400">【渡劫受阻】天威難測，道友氣海震盪，損耗了 ${penalty} 點修為${pillNote}。保底機率累積+5%。</span>`);
  }

  updateTopBar();
  renderInventory();
  renderProfile();
  renderTalents();
  saveGame();
}

// ===== 飛升與終局演出 =====
let cinematicTimers = [];
let cinematicCfg = null;
function playCinematic(cfg) {
  const modal = document.getElementById('modal-ascension');
  if (!modal) return;
  cinematicCfg = cfg;
  cinematicTimers.forEach(clearTimeout);
  cinematicTimers = [];
  document.getElementById('ascend-icon').innerText = cfg.icon;
  document.getElementById('ascend-title').innerText = cfg.title;
  document.getElementById('ascend-lines').innerHTML = cfg.lines.map(t => `<p class="ascend-line">${t}</p>`).join('');
  const rewardsEl = document.getElementById('ascend-rewards');
  rewardsEl.innerHTML = (cfg.rewards || []).map(r => `<div>${r}</div>`).join('');
  rewardsEl.classList.add('hidden');
  document.getElementById('ascend-actions').classList.add('hidden');
  document.getElementById('ascend-skip-hint').classList.remove('hidden');
  document.getElementById('btn-ascend-continue').innerText = cfg.continueText || '繼續';
  document.getElementById('btn-ascend-reincarnate').classList.toggle('hidden', !cfg.reincarnate);
  modal.classList.remove('hidden');
  audio.playFanfare();
  const lines = document.querySelectorAll('#ascend-lines .ascend-line');
  lines.forEach((el, i) => cinematicTimers.push(setTimeout(() => el.classList.add('show'), 600 + i * 1500)));
  cinematicTimers.push(setTimeout(revealCinematicEnd, 600 + lines.length * 1500 + 500));
}
function revealCinematicEnd() {
  cinematicTimers.forEach(clearTimeout);
  cinematicTimers = [];
  document.querySelectorAll('#ascend-lines .ascend-line').forEach(el => el.classList.add('show'));
  if (cinematicCfg && cinematicCfg.rewards && cinematicCfg.rewards.length) document.getElementById('ascend-rewards').classList.remove('hidden');
  document.getElementById('ascend-actions').classList.remove('hidden');
  document.getElementById('ascend-skip-hint').classList.add('hidden');
}
function closeCinematic() {
  document.getElementById('modal-ascension')?.classList.add('hidden');
  cinematicTimers.forEach(clearTimeout);
  cinematicTimers = [];
  updateTopBar();
  renderProfile();
  renderInventory();
  renderTechniques();
  renderCrafting();
  renderTalents();
  saveGame();
}

// 飛升:化神→真仙境渡劫成功後觸發(只會觸發一次,轉世後可再次飛升)
function startAscension() {
  state.ascended = true;
  state.ascensionCount = (state.ascensionCount || 0) + 1;
  state.maxAge += 1000;
  state.stones += 20000;
  addItem('pill_3', 3);
  logAdventure(`<span class="text-cyan-300 font-bold">☁️ 【飛升成仙】九九雷劫盡渡，破碎虛空，踏入仙界！仙途自此開啟。</span>`);
  playCinematic({
    icon: '🌌',
    title: '飛升成仙',
    lines: [
      '九九重雷劫盡，天門於頭頂豁然洞開。',
      '凡塵肉身化作萬點流光，你踏著金階，破碎虛空而上。',
      '雲海之上，九重天闕若隱若現——這裡，是仙界。',
      '凡界的道途已盡，而仙途，才剛剛開始。'
    ],
    rewards: [
      '🌟 壽元上限 +1000 歲',
      '💎 靈石 +20,000　⚡ 渡劫丹 ×3',
      '🗺️ 解鎖仙界歷練：九重天闕、太虛瑤池、混沌天淵',
      '🌀 仙界靈氣濃郁，吐納速度大幅提升',
      '🔥 新功法《太上忘情錄》《九天誅仙劍經》與仙器鍛造開放'
    ],
    continueText: '踏入仙界'
  });
}

// 證道大羅:仙途終點,可留在仙界或輪迴再修(獲得額外道心點)
function showDaoEnding() {
  playCinematic({
    icon: '☯️',
    title: '證道大羅',
    lines: [
      '億萬劫火焚盡最後一縷執念，你於混沌盡頭睜開雙眼。',
      '天地初開、萬物歸墟，皆在你一念之間。',
      '「一念飛仙」——原來，這一念，便是道。',
      '前路已盡，亦是無盡。你可留於仙界逍遙，亦可再入輪迴，重走一遍這條通天大道。'
    ],
    rewards: ['☯️ 輪迴再修將獲得額外道心點 +30', '🏆 道果圓滿，可至「成就」領取證道賞賜'],
    continueText: '🌸 留在仙界逍遙',
    reincarnate: true
  });
}

function endingReincarnate() {
  document.getElementById('modal-ascension')?.classList.add('hidden');
  triggerLifespanEnd();
  state._pendingDaoGain = (state._pendingDaoGain || 0) + 30;
  const t = document.getElementById('reincarnate-modal-title');
  if (t) t.innerText = '證道大羅 · 輪迴再修';
  const g = document.getElementById('reincarnate-gain-dao');
  if (g) g.innerText = `+${state._pendingDaoGain} 點`;
}

// 3. 升級聚靈陣 (OPT-O3: 指數費用成長)
function upgradeArray() {
  const cost = Math.floor(50 * Math.pow(1.5, Math.max(0, state.arrayLevel - 1)));
  if (state.stones < cost) {
    showToast('靈石不足，無法升級法陣！');
    return;
  }
  state.stones -= cost;
  state.arrayLevel += 1;
  showToast(`聚靈陣晉升為 Lv.${state.arrayLevel}！靈氣增長提升！`);
  
  if (state.tutorialStep === 1) {
    state.tutorialStep = 2; // OPT-O9
  }

  updateTopBar();
  saveGame();
}

// 採摘洞府靈田
function harvestGarden() {
  audio.init();
  audio.playQiChime();
  const herbRoll = Math.random();
  let msg = '';
  if (herbRoll < 0.55) {
    state.inventory['herb_1'] = (state.inventory['herb_1'] || 0) + 2;
    msg = '採得【凝露靈草 x2】！';
  } else if (herbRoll < 0.85) {
    state.inventory['herb_2'] = (state.inventory['herb_2'] || 0) + 1;
    msg = '幸逢祥瑞，採得珍貴【洗髓花 x1】！';
  } else {
    state.inventory['herb_3'] = (state.inventory['herb_3'] || 0) + 1;
    msg = '靈田驚現靈雷之兆，採得【天雷竹 x1】！';
  }
  showToast(msg);
  renderInventory();
  saveGame();
}

// 4. 參悟與升級功法 (OPT-O7: 最多10重，指數費用)
function learnTechnique(id) {
  const def = TECHNIQUES_DATA.find(d => d.id === id);
  if (!def) return;
  if (state.stones < def.cost) {
    showToast('靈石不足，無法參悟！');
    return;
  }
  state.stones -= def.cost;

  let userTech = (state.techniques || []).find(t => t.id === id);
  if (!userTech) {
    userTech = { id: id, level: 1, learned: true };
    state.techniques.push(userTech);
  } else {
    userTech.learned = true;
    userTech.level = 1;
  }

  showToast(`成功參悟${def.name}！道法大進！`);
  audio.playFanfare();
  renderTechniques();
  updateTopBar();
  saveGame();
}

function upgradeTechnique(id) {
  const def = TECHNIQUES_DATA.find(d => d.id === id);
  const userTech = (state.techniques || []).find(t => t.id === id);
  if (!def || !userTech || !userTech.learned) return;

  const upCost = Math.floor(def.cost * Math.pow(1.6, userTech.level));
  if (state.stones < upCost) {
    showToast('靈石不足，無法重修升重！');
    return;
  }
  state.stones -= upCost;
  userTech.level += 1;
  showToast(`${def.name}精進至第${userTech.level}重！`);
  audio.playFanfare();
  renderTechniques();
  updateTopBar();
  saveGame();
}

// 5. 物品使用、穿戴與一鍵功能 (FIX-B3, FIX-B4, OPT-O6)
// 服用丹藥:all=true 時整疊一次服完;quiet=true 供一鍵服用全部使用(不重繪、不提示,由呼叫端統一處理)
