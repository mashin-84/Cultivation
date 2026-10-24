/* ==========================================================================
   5. UI RENDERERS (OPT-O2, OPT-O7, OPT-O8, OPT-O9, OPT-O10)
   ========================================================================== */
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function showToast(msg) {
  const toast = document.getElementById('game-toast');
  if (!toast) return;
  toast.innerText = msg;
  toast.classList.remove('opacity-0');
  toast.classList.add('opacity-100');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove('opacity-100');
    toast.classList.add('opacity-0');
  }, 1800);
}

// 歷練區「首通獎勵」狀態:未領取顯示獎勵內容,已領取顯示 ✅
function updateAreaMilestoneText() {
  const el = document.getElementById('area-milestone-text');
  if (!el) return;
  const area = AREAS_DATA[state.currentArea];
  if (!area || !area.firstClearReward) { el.innerText = ''; return; }
  const claimed = !!(state.areaFirstClear && state.areaFirstClear[area.id]);
  if (claimed) {
    el.innerText = '✅ 首通獎勵已領取';
    el.className = 'text-emerald-400';
  } else {
    const r = area.firstClearReward;
    const eq = r.equip && ITEMS[r.equip] ? ` +【${ITEMS[r.equip].name}】` : '';
    el.innerText = `🎁 首通獎勵：靈石 ${formatNum(r.stones || 0)}${eq}`;
    el.className = 'text-amber-400';
  }
}

// FIX-B11: 快取更新，避免無謂重複操作 DOM
let prevTopBarCache = {};
function updateTopBar() {
  try { QG.govern(); } catch (e) { }
  const info = getRealmInfo();
  const stats = calculateTotalStats();

  const nameEl = document.getElementById('player-name-display');
  const realmEl = document.getElementById('player-realm-badge');
  const stonesEl = document.getElementById('res-spirit-stones');
  const lifespanEl = document.getElementById('res-lifespan');
  const powerEl = document.getElementById('res-combat-power');
  const qiRateEl = document.getElementById('qi-rate-text');
  const qiProgText = document.getElementById('qi-progress-text');
  const qiProgFill = document.getElementById('qi-progress-fill');

  if (nameEl) nameEl.innerText = escapeHtml(state.name);
  updateAreaMilestoneText();
  if (realmEl) realmEl.innerText = (state.realmIdx >= 5 ? '☁️ ' : '') + info.title;
  document.body.classList.toggle('immortal-realm', state.realmIdx >= 5);
  if (stonesEl) stonesEl.innerText = formatNum(state.stones);
  if (lifespanEl) lifespanEl.innerText = `${state.age}/${state.maxAge}歲`;
  if (powerEl) powerEl.innerText = formatNum(stats.combatPower);
  if (qiRateEl) qiRateEl.innerText = state.qi >= info.maxQi * QI_RESERVE_MULT - 1 ? '氣海滿溢' : (state.qi >= info.maxQi ? `+${formatNum(Math.floor(stats.qiRate * QI_OVERFLOW_RATE))}/秒↓` : `+${formatNum(stats.qiRate)}/秒`);

  const pct = Math.min(100, Math.floor((state.qi / info.maxQi) * 100));
  if (qiProgText) qiProgText.innerText = state.qi > info.maxQi ? `${formatNum(info.maxQi)} / ${formatNum(info.maxQi)} (圓滿・餘息 +${Math.floor((state.qi / info.maxQi - 1) * 100)}%)` : `${formatNum(state.qi)} / ${formatNum(info.maxQi)} (${pct}%)`;
  if (qiProgFill) qiProgFill.style.width = `${pct}%`;

  // 洞府突破按鈕狀態
  const btnBreakthrough = document.getElementById('btn-trigger-breakthrough');
  const badgeBreakthrough = document.getElementById('breakthrough-status-badge');
  const titleBreakthrough = document.getElementById('breakthrough-title');
  const descBreakthrough = document.getElementById('breakthrough-desc');

  if (btnBreakthrough && badgeBreakthrough && titleBreakthrough && descBreakthrough) {
    if (state.qi >= info.maxQi) {
      btnBreakthrough.disabled = false;
      btnBreakthrough.className = "w-full py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-serif-tc font-black text-sm border border-amber-300 shadow-lg shadow-amber-500/30 cursor-pointer animate-pulse";
      badgeBreakthrough.className = "px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40";
      badgeBreakthrough.innerText = "修為圓滿！可突破";

      if (state.subRealm >= info.realm.subMax) {
        if (!REALM_DATA[state.realmIdx + 1]) {
          titleBreakthrough.innerText = '證道大羅：道果圓滿';
          descBreakthrough.innerText = '億劫修行，終見大道。點擊可回望你的證道之路，並選擇輪迴再修。';
        } else if (state.realmIdx === 4) {
          titleBreakthrough.innerText = `飛升雷劫：破碎虛空，飛升仙界`;
          descBreakthrough.innerText = '凡界修行圓滿，九九重雷劫即將降臨！渡劫成功便可飛升仙界，開啟全新的仙途。';
        } else {
          titleBreakthrough.innerText = `渡天劫：進階【${REALM_DATA[state.realmIdx + 1].name}】`;
          descBreakthrough.innerText = "大境界圓滿，九天神雷即將降臨！渡劫成功將脫胎換骨，失敗可使用渡劫丹護持。";
        }
      } else {
        titleBreakthrough.innerText = `衝擊小境：${info.realm.name}第${state.subRealm + 1}層`;
        descBreakthrough.innerText = "氣海已盈,新氣只在經脈外圍打轉(吸收減半)。突破則缸身拓寬,餘息盡數保留,丹毒盡消。";
      }
    } else {
      btnBreakthrough.disabled = true;
      btnBreakthrough.className = "w-full py-2.5 rounded-lg bg-slate-800 text-slate-500 font-serif-tc font-bold text-sm border border-slate-700 cursor-not-allowed";
      badgeBreakthrough.className = "px-2 py-0.5 rounded text-[11px] font-bold bg-slate-800 text-slate-400 border border-slate-700";
      badgeBreakthrough.innerText = "修為蓄力中";
      titleBreakthrough.innerText = `修煉中：${info.title}`;
      descBreakthrough.innerText = "打坐修煉，聚氣凝神。當前氣海修為圓滿時，即可運轉心法突破桎梏。";
    }
  }

  // 聚靈陣資訊
  const arrayCost = Math.floor(50 * Math.pow(1.5, Math.max(0, state.arrayLevel - 1)));
  const arrayLvlBadge = document.getElementById('array-level-badge');
  const arrayQiBonus = document.getElementById('array-qi-bonus');
  const arrayCostText = document.getElementById('array-cost-text');
  if (arrayLvlBadge) arrayLvlBadge.innerText = `陣法 Lv.${state.arrayLevel}`;
  if (arrayQiBonus) arrayQiBonus.innerText = `+${state.arrayLevel * 4}/秒・吐納 +${2 * Math.max(0, state.arrayLevel - 1)}%`;
  if (arrayCostText) arrayCostText.innerText = `${formatNum(arrayCost)} 靈石`;

  // 悟性等級資訊
  const insightCost = Math.floor(100 * Math.pow(1.6, Math.max(0, state.insightLevel - 1)));
  const insightBadge = document.getElementById('insight-level-badge');
  const insightBonus = document.getElementById('insight-bonus-text');
  const insightCostText = document.getElementById('insight-cost-text');
  if (insightBadge) insightBadge.innerText = `悟性 Lv.${state.insightLevel}`;
  if (insightBonus) insightBonus.innerText = `約 ${(TAP_QI_RATE_MULT + 0.1 * state.insightLevel).toFixed(1)} 秒吐納 +${state.insightLevel * TAP_INSIGHT_PER_LV}`;
  if (insightCostText) insightCostText.innerText = `${formatNum(insightCost)} 靈石`;

  // 新手引導步驟檢測 (OPT-O9)
  updateTutorialBanner();

  // —— 擴充步驟(原為 5 層包裝,依原安裝順序)——
  XT.topBar78Hook && XT.topBar78Hook();      // v7.8 戰力回饋・突破見證(028)
  XT.topBar78Gate && XT.topBar78Gate();      // v7.8 突破卡:被境界見證擋住時改顯示提示(028)
  XT.topBar79Unlock && XT.topBar79Unlock();  // v7.9 系統逐步開放(029)
  XT.topBar80Sect && XT.topBar80Sect();      // v8.0 宗門卡・導覽鎖(031)
  XT.topBar131Tre && XT.topBar131Tre();      // v13.1 首通秘境法寶補發(069)
}

// OPT-O9: 新手引導更新


// OPT-O7: 渲染功法清單 (支援10重、功法共鳴、事件委派無inline onclick)
function renderTechniques() {
  const container = document.getElementById('techniques-list');
  if (!container) return;
  container.innerHTML = '';
  let learnedCount = 0;

  TECHNIQUES_DATA.forEach(def => {
    const userTech = (state.techniques || []).find(t => t.id === def.id);
    const learned = userTech && userTech.learned;
    const curLevel = userTech ? (userTech.level || 0) : 0;
    if (learned) learnedCount++;

    const card = document.createElement('div');
    card.className = "bg-slate-900 border border-slate-800 p-2.5 rounded-lg flex items-center justify-between text-xs";

    let bonusLabel = '';
    const mult = curLevel > 0 ? curLevel : 1;
    if (def.bonusType === 'qiRate') bonusLabel = `吐納 +${def.bonusVal * mult}/秒`;
    if (def.bonusType === 'atk') bonusLabel = `攻擊 +${def.bonusVal * mult}`;
    if (def.bonusType === 'def') bonusLabel = `防禦 +${def.bonusVal * mult}`;
    if (def.bonusType === 'hp') bonusLabel = `氣血 +${def.bonusVal * mult}`;
    if (def.bonusType === 'crit') bonusLabel = `會心率 +${def.bonusVal * mult}%`;

    let actionBtn = '';
    if (!learned) {
      actionBtn = `<button data-action="learn-tech" data-id="${def.id}" class="tap-effect px-3 py-1 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded text-xs">參悟 (${def.cost}靈石)</button>`;
    } else if (curLevel < def.maxLevel) {
      // OPT-O7: 指數升級費用
      const upCost = Math.floor(def.cost * Math.pow(1.6, curLevel));
      actionBtn = `<button data-action="upgrade-tech" data-id="${def.id}" class="tap-effect px-2.5 py-1 bg-jade-700 hover:bg-jade-600 text-white rounded text-xs">修煉至第${curLevel + 1}重 (${formatNum(upCost)}靈石)</button>`;
    } else {
      actionBtn = `<span class="text-amber-400 font-bold text-xs">大成圓滿 (10重)</span>`;
    }

    card.innerHTML = `
      <div>
        <div class="flex items-center space-x-1.5">
          <span class="font-serif-tc font-bold text-amber-200 text-sm">${def.name}</span>
          <span class="text-[10px] px-1.5 py-0.2 rounded ${learned ? 'bg-jade-950 text-jade-300 border border-jade-700' : 'bg-slate-800 text-slate-400'}">
            ${learned ? `第${curLevel}/${def.maxLevel}重` : '未參悟'}
          </span>
        </div>
        <div class="text-[11px] text-slate-400 mt-0.5">${def.desc}</div>
        <div class="text-[11px] text-jade-400 font-semibold mt-0.5">${bonusLabel}</div>
      </div>
      <div>${actionBtn}</div>
    `;
    container.appendChild(card);
  });

  const learnedCountEl = document.getElementById('learned-tech-count');
  if (learnedCountEl) learnedCountEl.innerText = learnedCount;

  // 功法共鳴更新 (OPT-O7)
  const isResonance = learnedCount >= 3;
  const resBadge = document.getElementById('tech-resonance-status');
  const resText = document.getElementById('tech-resonance-text');
  if (resBadge && resText) {
    if (isResonance) {
      resBadge.className = "text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse";
      resBadge.innerText = "已激活 (全屬性+5%)";
      resText.className = "text-amber-300 font-semibold";
      resText.innerText = "道法互通，觸發天道共鳴！全屬性提升 5%！";
    } else {
      resBadge.className = "text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-500";
      resBadge.innerText = "未激活";
      resText.className = "text-slate-400";
      resText.innerText = `需參悟至少 3 門功法激活 (+5% 全屬性，當前: ${learnedCount}/3)`;
    }
  }
}

// OPT-O7: 渲染天賦樹
function renderTalents() {
  const container = document.getElementById('talents-list');
  if (!container) return;
  container.innerHTML = '';
  const talents = state.talents || {};
  const curDao = state.daoPoints || 0;

  const daoTabEl = document.getElementById('talents-daopoints-tab');
  const daoDisplayEl = document.getElementById('talents-dao-points');
  if (daoTabEl) daoTabEl.innerText = curDao;
  if (daoDisplayEl) daoDisplayEl.innerText = curDao;

  TALENTS_DATA.forEach(tal => {
    const lvl = talents[tal.id] || 0;
    const nc = talCost(tal, lvl), canUpgrade = curDao >= nc && lvl < tal.maxLevel;
    const card = document.createElement('div');
    card.className = "bg-slate-900 border border-slate-800 p-2 rounded-lg flex items-center justify-between text-xs";

    let btnHtml = '';
    if (lvl >= tal.maxLevel) {
      btnHtml = `<span class="text-amber-400 font-bold text-xs">已圓滿</span>`;
    } else {
      btnHtml = `<button data-action="upgrade-talent" data-id="${tal.id}" ${canUpgrade ? '' : 'disabled'} class="tap-effect px-2.5 py-1 rounded text-xs font-bold ${canUpgrade ? 'bg-amber-600 hover:bg-amber-500 text-slate-950 shadow' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}">提升 (${nc}道心點)</button>`;
    }

    card.innerHTML = `
      <div>
        <div class="flex items-center space-x-1.5">
          <span class="font-bold text-teal-300">${tal.name}</span>
          <span class="text-[10px] px-1 py-0.2 rounded bg-slate-800 text-slate-400">Lv.${lvl}/${tal.maxLevel}</span>
        </div>
        <div class="text-[10px] text-slate-400 mt-0.5">${tal.desc}</div><div class="text-[10px] text-teal-500/80">前3級滿效;4級起每級效果 30%,費用遞增</div>
      </div>
      <div>${btnHtml}</div>
    `;
    container.appendChild(card);
  });
}

// OPT-O2, FIX-B3, FIX-B4, OPT-O6: 渲染須彌儲物袋 (物品查表渲染，無一長串 if-else)
function renderInventory() {
  (() => { // 原本體(內含提前 return,以箭頭函式包住,確保下方擴充步驟照舊執行)
  const grid = document.getElementById('inventory-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const inventoryEntries = Object.entries(state.inventory || {}).filter(([_, count]) => count > 0);
  const distinctItemCount = inventoryEntries.length;

  const capEl = document.getElementById('inventory-capacity');
  if (capEl) {
    capEl.innerText = `格數: ${distinctItemCount}/120`;
    capEl.className = distinctItemCount >= 120 ? "text-rose-400 font-mono font-bold text-[11px]" : "text-slate-400 font-mono text-[11px]";
  }

  if (distinctItemCount === 0) {
    grid.innerHTML = '<div class="text-xs text-slate-500 italic p-3 text-center">儲物袋內空空如也，快去歷練探索吧！</div>';
  } else {
    inventoryEntries.forEach(([key, count]) => {
      const item = ITEMS[key];
      if (!item) return;

      const row = document.createElement('div');
      row.className = "flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800 text-xs";

      // 品質顏色
      let colorClass = 'text-slate-200';
      if (item.quality === 'uncommon') colorClass = 'text-emerald-400';
      if (item.quality === 'rare') colorClass = 'text-sky-400';
      if (item.quality === 'epic') colorClass = 'text-amber-400';
      if (item.quality === 'immortal') colorClass = 'text-cyan-300';
      if (item.quality === 'mythic') colorClass = 'text-fuchsia-300';

      let actionBtn = '';
      if (item.type === 'consumable') {
        actionBtn = `<button data-action="use-item" data-id="${key}" class="tap-effect px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded text-[11px]">服用</button>`;
        if (count > 1) actionBtn += `<button data-action="use-item-all" data-id="${key}" class="tap-effect ml-1 px-2 py-1 bg-amber-800 hover:bg-amber-700 text-amber-100 font-bold rounded text-[11px]">全服</button>`;
      } else if (item.type === 'special' && key === 'pill_3') {
        actionBtn = `<span class="text-[10px] text-amber-400 font-semibold">天劫時使用</span>`;
      } else if (item.type === 'battle_heal') {
        actionBtn = `<span class="text-[10px] text-emerald-400 font-semibold">戰鬥時可用</span>`;
      } else if (item.type === 'chest') {
        actionBtn = `<button data-action="open-chest" data-id="${key}" class="tap-effect px-2.5 py-1 bg-amber-600 text-slate-950 font-bold rounded text-[11px]">開啟</button>`;
      } else if (item.type === 'equipment') {
        actionBtn = `<button data-action="equip-item" data-id="${key}" class="tap-effect px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded text-[11px]">穿戴</button>` +
          `<button data-action="sell-equip" data-id="${key}" class="tap-effect ml-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] border border-slate-700">賣${item.price || 5}</button>`;
      } else {
        actionBtn = `<button data-action="sell-single-item" data-id="${key}" class="text-[10px] text-slate-400 hover:text-amber-300">出售(${item.price}靈石)</button>`;
      }

      // 裝備屬性標註 (FIX-B3)
      let statDesc = item.desc;
      if (item.type === 'equipment') {
        const statsArr = [];
        if (item.atk) statsArr.push(`攻+${item.atk}`);
        if (item.def) statsArr.push(`防+${item.def}`);
        if (item.hp) statsArr.push(`氣血+${item.hp}`);
        statDesc = `【${statsArr.join(' ')}】 ${item.desc}`;
      }

      row.innerHTML = `
        <div>
          <div class="font-bold ${colorClass}">
            <span>${item.icon || '📦'} ${item.name}</span>
            <span class="font-mono text-amber-400 ml-1">x${count}</span>
          </div>
          <div class="text-[10px] text-slate-400 mt-0.5">${statDesc}</div>
        </div>
        <div class="ml-2 flex-shrink-0">${actionBtn}</div>
      `;
      grid.appendChild(row);
    });
  }

  renderEquipSlots(); // v7: 七欄裝備顯示
  })();
  // —— 擴充步驟(原為 2 層包裝)——
  XT.inv81Grid && XT.inv81Grid();   // v8.1 儲物袋改格狀+分類籤(032)
  XT.inv54Page && XT.inv54Page();   // v12.3 行囊格子分頁重排(script 19)
}

function renderCrafting() {
  // Alchemy
  const alchContainer = document.getElementById('alchemy-recipes-list');
  if (alchContainer) {
    alchContainer.innerHTML = '';
    ALCHEMY_RECIPES.forEach((rec, idx) => {
      const canCraft = rec.need.every(n => (state.inventory[n.item] || 0) >= n.count);
      const card = document.createElement('div');
      card.className = "bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between text-xs";
      const needStr = rec.need.map(n => `${n.name} (${state.inventory[n.item] || 0}/${n.count})`).join('、');
      card.innerHTML = `
        <div>
          <div class="font-serif-tc font-bold text-amber-300 text-sm">${rec.name}</div>
          <div class="text-[11px] text-slate-400">${rec.desc}</div>
          <div class="text-[10px] text-slate-500 mt-1">需材料：${needStr}</div>
        </div>
        <div class="flex flex-col items-stretch gap-1 flex-shrink-0 ml-2">
          <button data-action="craft-alchemy" data-index="${idx}" ${canCraft ? '' : 'disabled'} class="tap-effect px-3 py-1.5 rounded text-xs font-bold ${canCraft ? 'bg-amber-600 hover:bg-amber-500 text-slate-950 cursor-pointer shadow' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}">
            煉製
          </button>
          ${maxAlchemyBatch(rec) > 1 ? `<button data-action="craft-alchemy-all" data-index="${idx}" class="tap-effect px-3 py-1 rounded text-[11px] font-bold bg-amber-800 hover:bg-amber-700 text-amber-100">全煉 ×${maxAlchemyBatch(rec)}</button>` : ''}
        </div>
      `;
      alchContainer.appendChild(card);
    });
  }

  // Forge
  const forgeContainer = document.getElementById('forge-recipes-list');
  if (forgeContainer) {
    forgeContainer.innerHTML = '';
    FORGE_RECIPES.forEach((rec, idx) => {
      const canForge = rec.need.every(n => (state.inventory[n.item] || 0) >= n.count);
      const card = document.createElement('div');
      card.className = "bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between text-xs";
      const needStr = rec.need.map(n => `${n.name} (${state.inventory[n.item] || 0}/${n.count})`).join('、');
      card.innerHTML = `
        <div>
          <div class="font-serif-tc font-bold text-cyan-300 text-sm">${rec.name}</div>
          <div class="text-[11px] text-slate-400">${rec.desc}</div>
          <div class="text-[10px] text-slate-500 mt-1">需材料：${needStr}</div>
        </div>
        <div>
          <button data-action="craft-forge" data-index="${idx}" ${canForge ? '' : 'disabled'} class="tap-effect px-3 py-1.5 rounded text-xs font-bold ${canForge ? 'bg-cyan-600 hover:bg-cyan-500 text-slate-950 cursor-pointer shadow' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}">
            鍛造
          </button>
        </div>
      `;
      forgeContainer.appendChild(card);
    });
  }
}

// OPT-O2: 坊市商品渲染 (集中式單一清單)
function renderMarket() {
  const container = document.getElementById('market-items-list');
  if (!container) return;
  container.innerHTML = '';

  MARKET_OFFERS.forEach((offer, idx) => {
    const canBuy = state.stones >= offer.cost;
    const row = document.createElement('div');
    row.className = "flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800 text-xs";
    row.innerHTML = `
      <div>
        <span class="font-bold text-amber-200">${offer.name}</span>
        <span class="text-amber-400 font-mono text-[11px] ml-2">💎 ${offer.cost} 靈石</span>
      </div>
      <button data-action="buy-market-item" data-index="${idx}" ${canBuy ? '' : 'disabled'} class="tap-effect px-2.5 py-1 rounded text-xs font-bold ${canBuy ? 'bg-amber-600 hover:bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}">
        購買
      </button>
    `;
    container.appendChild(row);
  });
}

// OPT-O8 & O9: 渲染仙途命盤、成就、每日任務、轉世道心閣
function renderProfile() {
  const stats = calculateTotalStats();
  const maxHpEl = document.getElementById('stat-max-hp');
  const atkEl = document.getElementById('stat-atk');
  const defEl = document.getElementById('stat-def');
  const critEl = document.getElementById('stat-crit');
  const qirateEl = document.getElementById('stat-qirate');
  const tribCountEl = document.getElementById('stat-trib-count');

  if (maxHpEl) maxHpEl.innerText = formatNum(stats.hp);
  if (atkEl) atkEl.innerText = formatNum(stats.atk);
  if (defEl) defEl.innerText = formatNum(stats.def);
  if (critEl) critEl.innerText = `${stats.crit}%`;
  if (qirateEl) qirateEl.innerText = `+${formatNum(stats.qiRate)}/秒`;
  if (tribCountEl) tribCountEl.innerText = `${state.tribCount} 次`;

  // 每日任務渲染 (OPT-O9)
  renderDailyQuests();

  // 轉世道心閣渲染 (OPT-O8)
  renderDaoShop();

  // 成就清單渲染
  renderAchievements();
}

function renderDailyQuests() {
  const container = document.getElementById('daily-quests-list');
  if (!container) return;
  container.innerHTML = '';

  const todayStr = new Date().toDateString();
  if (state.dailyDate !== todayStr) {
    state.dailyDate = todayStr;
    state.dailyProgress = { quest_tap: 0, quest_explore: 0, quest_alchemy: 0 };
    state.dailyClaimed = { quest_tap: false, quest_explore: false, quest_alchemy: false };
  }

  DAILY_QUESTS_DATA.forEach(q => {
    const curVal = (state.dailyProgress && state.dailyProgress[q.id]) || 0;
    const isDone = curVal >= q.target;
    const isClaimed = state.dailyClaimed && state.dailyClaimed[q.id];

    let actionBtn = '';
    if (isClaimed) {
      actionBtn = `<span class="text-[10px] text-slate-500 font-semibold">已領取</span>`;
    } else if (isDone) {
      actionBtn = `<button data-action="claim-daily" data-id="${q.id}" class="tap-effect px-2 py-0.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] rounded shadow animate-pulse">領取賞賜</button>`;
    } else {
      actionBtn = `<span class="text-[10px] text-slate-400 font-mono">${curVal}/${q.target}</span>`;
    }

    const row = document.createElement('div');
    row.className = "flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800 text-xs";
    row.innerHTML = `
      <div>
        <div class="font-bold text-slate-200">${q.name}</div>
        <div class="text-[10px] text-slate-400">${q.desc}</div>
      </div>
      <div>${actionBtn}</div>
    `;
    container.appendChild(row);
  });
}

function renderDaoShop() {
  const container = document.getElementById('dao-shop-list');
  const daoDisplay = document.getElementById('dao-points-records-display');
  if (daoDisplay) daoDisplay.innerText = state.daoPoints || 0;
  if (!container) return;
  container.innerHTML = '';

  const daoUpgrades = state.daoUpgrades || {};
  DAO_SHOP_ITEMS.forEach(item => {
    const curLevel = daoUpgrades[item.id] || 0;
    const canBuy = (state.daoPoints || 0) >= item.cost;
    const row = document.createElement('div');
    row.className = "flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800 text-xs";
    row.innerHTML = `
      <div>
        <div class="font-bold text-purple-300">${item.name} <span class="text-[10px] text-slate-400">(重數:${curLevel})</span></div>
        <div class="text-[10px] text-slate-400">${item.desc}</div>
      </div>
      <button data-action="buy-dao-upgrade" data-id="${item.id}" ${canBuy ? '' : 'disabled'} class="tap-effect px-2.5 py-1 rounded text-[11px] font-bold ${canBuy ? 'bg-purple-700 hover:bg-purple-600 text-white' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}">
        悟道 (${item.cost}道心點)
      </button>
    `;
    container.appendChild(row);
  });
}

function renderAchievements() {
  const container = document.getElementById('achievements-list');
  if (!container) return;
  container.innerHTML = '';

  state.achievementsClaimed = state.achievementsClaimed || {};

  ACHIEVEMENTS_DATA.forEach(ach => {
    const isCompleted = ach.check(state);
    const isClaimed = state.achievementsClaimed[ach.id];

    let actionText = '';
    if (isClaimed) {
      actionText = '<span class="text-[10px] text-slate-500">已領取</span>';
    } else if (isCompleted) {
      actionText = `<button data-action="claim-ach" data-id="${ach.id}" class="tap-effect px-2 py-0.5 bg-amber-500 text-slate-950 font-bold text-[10px] rounded shadow">領取賞賜 (+${ach.rewardStones}靈石)</button>`;
    } else {
      actionText = '<span class="text-[10px] text-slate-600">未達成</span>';
    }

    const row = document.createElement('div');
    row.className = "flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800 text-xs";
    row.innerHTML = `
      <div>
        <div class="font-bold ${isCompleted ? 'text-amber-300' : 'text-slate-400'}">${ach.title}</div>
        <div class="text-[10px] text-slate-500">${ach.desc}</div>
      </div>
      <div>${actionText}</div>
    `;
    container.appendChild(row);
  });
}


