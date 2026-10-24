/* ===== 修為丹:只能服到氣海圓滿;同層連服積丹毒,藥力遞減;突破或洗髓丹清除 ===== */
/* v109 修為丹按境界上限百分比 */
const QIP_TIER = t => t === 'pill_1' ? 0 : t === 'pill_6' ? 5 : /^yq_\d$/.test(t) ? +t.slice(3) : -1;
function qiPillVal(key) {
  const t = QIP_TIER(key); if (t < 0) return (ITEMS[key] && ITEMS[key].val) || 0;
  const cur = Math.min(7, state.realmIdx || 0), d = t - cur, pct = d >= 0 ? Math.min(.2, .12 * Math.pow(1.5, d)) : .12 * Math.pow(.4, -d);
  return Math.floor(getRealmInfo().maxQi * pct);
}
function pillEff() { const k = state.pillTox || 0; return k < TOX_FREE ? 1 : Math.pow(0.5, k - TOX_FREE + 1); }
let _pillPend = null;
function qiPillUse(key, all, quiet) {
  const item = ITEMS[key]; if (!item || !(state.inventory[key] > 0)) return 0;
  QG.govern();
  const info = getRealmInfo();
  if (state.qi >= info.maxQi - 0.5) {
    if (!quiet) showToast('氣海已盈,丹力無處容身。〔突破之後,經脈拓寬方可再服〕');
    return 0;
  }
  if (!all && !quiet) {
    const room = info.maxQi - state.qi, eff = pillEff(), raw = qiPillVal(key) * eff, add = Math.min(room, raw);
    if (eff < 1 || raw - add > raw * 0.3) {
      const now = Date.now();
      if (!_pillPend || _pillPend.key !== key || now - _pillPend.t > 4500) {
        _pillPend = { key, t: now };
        showToast(`〔藥力預覽〕可補修為 ${formatNum(add)}(藥力 ${Math.round(eff * 100)}%${raw - add > 0.5 ? ',溢出 ' + formatNum(raw - add) + ' 將散去' : ''})。再點一次確認服用。`);
        return 0;
      }
    }
    _pillPend = null;
  }
  const n = all ? state.inventory[key] : 1;
  let used = 0, got = 0, stop = '';
  for (let i = 0; i < n; i++) {
    const room = info.maxQi - state.qi;
    if (room <= 0.5) { stop = 'full'; break; }
    const eff = pillEff();
    if (all && eff < 0.25) { stop = 'tox'; break; }
    const add = Math.min(room, qiPillVal(key) * eff);
    state.qi += add; state.totalCultivatedQi = (state.totalCultivatedQi || 0) + add;
    got += add; used++; state.pillTox = (state.pillTox || 0) + 1;
  }
  QG.sync();
  if (used <= 0) { if (!quiet && stop === 'tox') showToast('丹毒深重,藥力所剩無幾。〔突破之後丹毒盡消〕'); return 0; }
  state.inventory[key] -= used; if (state.inventory[key] <= 0) delete state.inventory[key];
  if (quiet) return used;
  let msg = `服用${item.name} ×${used},修為增加 ${formatNum(got)} 點!`;
  if (stop === 'full') msg += ' 氣海圓滿。'; else if (stop === 'tox') msg += ' 丹毒漸深,已停服。';
  else if (pillEff() < 1) msg += `(丹毒:下一顆藥力 ${Math.round(pillEff() * 100)}%)`;
  showToast(msg); audio.playQiChime(); renderInventory(); updateTopBar(); saveGame();
  return used;
}
function useItem(key, all = false, quiet = false) {
  if (!state.inventory[key] || state.inventory[key] <= 0) return 0;
  const item = ITEMS[key];
  if (!item) return 0;
  if (key === 'pill_1' || key === 'pill_6') return qiPillUse(key, all, quiet);
  const n = all ? state.inventory[key] : 1;
  let msg = '';

  if (key === 'pill_1' || key === 'pill_6') {
    const gain = (item.val || 500) * n;
    state.inventory[key] -= n;
    state.qi += gain;
    state.totalCultivatedQi = (state.totalCultivatedQi || 0) + gain;
    msg = `服用${item.name} ×${n}，修為增加 ${formatNum(gain)} 點！`;
  } else if (key === 'pill_2') {
    const gain = (item.val || 5) * n;
    state.inventory[key] -= n;
    state.permQiRate += gain;
    msg = `服下洗髓丹 ×${n}，體內濁氣盡褪，吐納速度永久+${gain}/秒！`;
  } else if (key === 'pill_5') {
    const gain = (item.val || 30) * n;
    state.inventory[key] -= n;
    state.maxAge += gain;
    msg = `逆天奪壽！服下延壽丹 ×${n}，壽元上限增延 +${gain} 歲！`;
  } else {
    return 0;
  }

  if (state.inventory[key] <= 0) delete state.inventory[key];
  if (quiet) return n;
  showToast(msg);
  audio.playQiChime();
  renderInventory();
  updateTopBar();
  saveGame();
  return n;
}

// 一鍵服用:背包內所有可直接服用的丹藥(聚氣丹/洗髓丹/延壽丹),渡劫丹與回春丹不動
function useAllPills() {
  const keys = ['pill_1', 'pill_6', 'pill_2', 'pill_5'].filter(k => (state.inventory[k] || 0) > 0);
  if (keys.length === 0) { showToast('儲物袋內沒有可服用的丹藥。'); return; }
  const parts = [];
  keys.forEach(k => {
    const n = useItem(k, true, true);
    if (n) parts.push(`${ITEMS[k].name}×${n}`);
  });
  showToast(parts.length ? `一鍵服用:${parts.join('、')}` : '氣海已盈或丹毒深重,暫無可服之丹。〔突破後再服〕');
  audio.playQiChime();
  renderInventory();
  updateTopBar();
  saveGame();
}

// FIX-B4: 裝備替換機制 (舊裝備回背包、背包扣減、只存 itemId 字串)
function equipItem(key) {
  const item = ITEMS[key];
  if (!item || item.type !== 'equipment' || !item.slot) return;
  if (!state.inventory[key] || state.inventory[key] <= 0) {
    showToast('儲物袋內並無此裝備！');
    return;
  }

  const slot = item.slot;
  const oldItemId = state.equipment[slot];

  // 扣除穿戴的裝備
  state.inventory[key]--;
  if (state.inventory[key] <= 0) delete state.inventory[key];

  // 換下的舊裝備放回背包
  if (oldItemId && ITEMS[oldItemId]) {
    state.inventory[oldItemId] = (state.inventory[oldItemId] || 0) + 1;
    showToast(`換下了【${ITEMS[oldItemId].name}】，已收入儲物袋。`);
  }

  state.equipment[slot] = key;
  showToast(`成功穿戴【${item.name}】！`);
  audio.playFanfare();

  renderInventory();
  updateTopBar();
  renderProfile();
  saveGame();
}

// OPT-O6: 一鍵穿戴最強裝備
function autoEquipBest() {
  const slots = EQUIP_SLOTS;
  let anyEquipped = false;

  slots.forEach(slot => {
    let bestKey = null;
    let bestScore = -1;

    // 先評估目前穿戴的
    const curId = state.equipment[slot];
    if (curId && ITEMS[curId]) {
      const curItem = ITEMS[curId];
      bestScore = (curItem.atk || 0) * 2 + (curItem.def || 0) * 1.5 + (curItem.hp || 0) * 0.3;
    }

    // 檢查背包中同部位的物品
    Object.keys(state.inventory || {}).forEach(key => {
      const item = ITEMS[key];
      if (item && item.type === 'equipment' && item.slot === slot && state.inventory[key] > 0) {
        const score = (item.atk || 0) * 2 + (item.def || 0) * 1.5 + (item.hp || 0) * 0.3;
        if (score > bestScore) {
          bestScore = score;
          bestKey = key;
        }
      }
    });

    if (bestKey) {
      equipItem(bestKey);
      anyEquipped = true;
    }
  });

  if (anyEquipped) {
    showToast('已為道友一鍵換上最合適的神兵寶甲！');
  } else {
    showToast('儲物袋內暫無比當前更強的裝備。');
  }
}

// OPT-O6: 一鍵出售低階多餘材料 (保留5個自用)
function sellLowTierMaterials() {
  let gainedStones = 0;
  ['herb_1', 'ore_1'].forEach(matId => {
    const cur = state.inventory[matId] || 0;
    if (cur > 5) {
      const toSell = cur - 5;
      const price = ITEMS[matId]?.price || 10;
      state.inventory[matId] = 5;
      gainedStones += toSell * price;
    }
  });

  if (gainedStones > 0) {
    state.stones += gainedStones;
    audio.playQiChime();
    showToast(`出售了多餘的低階靈草靈礦，獲得靈石 +${gainedStones}！`);
    renderInventory();
    updateTopBar();
    saveGame();
  } else {
    showToast('儲物袋內並無超過 5 份的多餘低階材料。');
  }
}

function sellSingleItem(key) {
  if (!state.inventory[key] || state.inventory[key] <= 0) return;
  const item = ITEMS[key];
  const price = item?.price || 5;
  state.inventory[key]--;
  if (state.inventory[key] <= 0) delete state.inventory[key];
  state.stones += price;
  audio.playQiChime();
  showToast(`出售了【${item?.name || key}】，獲得靈石 +${price}！`);
  renderInventory();
  updateTopBar();
  saveGame();
}

// 出售背包裝備(單件,穿戴中的不在背包內所以不會被賣)
function sellEquipItem(key) {
  const item = ITEMS[key];
  if (!item || item.type !== 'equipment') return;
  if (!state.inventory[key] || state.inventory[key] <= 0) return;
  const price = item.price || 5;
  state.inventory[key]--;
  if (state.inventory[key] <= 0) delete state.inventory[key];
  state.stones += price;
  audio.playQiChime();
  showToast(`出售了【${item.name}】，獲得靈石 +${price}！`);
  renderInventory();
  updateTopBar();
  saveGame();
}

// 一鍵出售多餘裝備:每個部位只保留「比身上更強的最強那一件」,其餘全賣
function sellSpareEquipment() {
  const score = it => (it.atk || 0) * 2 + (it.def || 0) * 1.5 + (it.hp || 0) * 0.3;
  let gained = 0, sold = 0;
  EQUIP_SLOTS.forEach(slot => {
    const eqId = state.equipment[slot];
    const eqScore = eqId && ITEMS[eqId] ? score(ITEMS[eqId]) : -1;
    let keepKey = null, keepScore = eqScore;
    Object.keys(state.inventory || {}).forEach(k => {
      const it = ITEMS[k];
      if (it && it.type === 'equipment' && it.slot === slot && state.inventory[k] > 0 && score(it) > keepScore) {
        keepScore = score(it); keepKey = k;
      }
    });
    Object.keys(state.inventory || {}).forEach(k => {
      const it = ITEMS[k];
      if (!it || it.type !== 'equipment' || it.slot !== slot) return;
      const have = state.inventory[k] || 0;
      const sell = k === keepKey ? have - 1 : have;
      if (sell > 0) {
        state.inventory[k] -= sell;
        if (state.inventory[k] <= 0) delete state.inventory[k];
        gained += sell * (it.price || 5);
        sold += sell;
      }
    });
  });
  if (sold === 0) { showToast('沒有多餘的裝備可出售。'); return; }
  state.stones += gained;
  audio.playQiChime();
  showToast(`出售多餘裝備 ${sold} 件，獲得靈石 +${formatNum(gained)}！(已保留比身上更強的一件)`);
  renderInventory();
  updateTopBar();
  saveGame();
}

// OPT-O6: 裝備強化邏輯 (+0 ~ +10)
function enhanceEquippedGear(slot) {
  const itemId = state.equipment[slot];
  if (!itemId || !ITEMS[itemId]) {
    showToast('該部位並未穿戴裝備，無法強化！');
    return;
  }
  state.enhance = state.enhance || { weapon: 0, armor: 0, artifact: 0 };
  const curEnh = state.enhance[slot] || 0;
  if (curEnh >= 10) {
    showToast('該裝備已達 +10 圓滿強化境界！');
    return;
  }

  const stoneCost = (curEnh + 1) * 80;
  const oreKey = curEnh >= 5 ? 'ore_2' : 'ore_1';
  const oreName = ITEMS[oreKey].name;
  const oreCost = Math.floor(curEnh / 2) + 1;

  if (state.stones < stoneCost) {
    showToast(`靈石不足，強化需 ${stoneCost} 靈石！`);
    return;
  }
  if ((state.inventory[oreKey] || 0) < oreCost) {
    showToast(`材料不足，強化需【${oreName} x${oreCost}】！`);
    return;
  }

  state.stones -= stoneCost;
  state.inventory[oreKey] -= oreCost;
  if (state.inventory[oreKey] <= 0) delete state.inventory[oreKey];

  const successChance = Math.max(40, 100 - curEnh * 7); // +0: 100%, +1: 93%, ..., 最低 40%
  const roll = Math.random() * 100;
  if (roll <= successChance) {
    state.enhance[slot] = curEnh + 1;
    audio.playFanfare();
    showToast(`🔥 天工造化！【${ITEMS[itemId].name}】成功強化至 +${state.enhance[slot]}！`);
  } else {
    audio.playSlash();
    showToast(`火候稍遜，強化失敗！萬幸寶器未損，強化等級保持在 +${curEnh}。`);
  }

  renderInventory();
  updateTopBar();
  renderProfile();
  saveGame();
}

// 煉丹與鍛造 (FIX-B4: 鍛造品進入背包)
// 該配方以目前材料最多可煉幾爐
function maxAlchemyBatch(rec) {
  return Math.min(...rec.need.map(n => Math.floor((state.inventory[n.item] || 0) / n.count)));
}

// all=true:把材料煉到用完為止(只針對該配方,不影響其他配方共用材料的取捨)
function craftAlchemy(idx, all = false) {
  const rec = ALCHEMY_RECIPES[idx];
  const batch = maxAlchemyBatch(rec);
  if (batch < 1) {
    showToast('靈草藥材不足，無法開爐！');
    return;
  }
  const times = all ? batch : 1;

  rec.need.forEach(n => {
    state.inventory[n.item] -= n.count * times;
    if (state.inventory[n.item] <= 0) delete state.inventory[n.item];
  });

  state.inventory[rec.giveId] = (state.inventory[rec.giveId] || 0) + times;
  audio.playFanfare();
  showToast(times > 1 ? `連開 ${times} 爐，功成！煉出【${rec.name}】×${times}！` : `開爐功成！煉出了一枚【${rec.name}】！`);

  // 每日任務計數
  if (state.dailyProgress) {
    state.dailyProgress.quest_alchemy = (state.dailyProgress.quest_alchemy || 0) + times;
  }
  if (state.tutorialStep === 3) {
    state.tutorialStep = 4; // OPT-O9
  }

  renderCrafting();
  renderInventory();
  saveGame();
}

function craftForge(idx) {
  const rec = FORGE_RECIPES[idx];
  const canForge = rec.need.every(n => (state.inventory[n.item] || 0) >= n.count);
  if (!canForge) {
    showToast('靈礦材料不足，無法鍛器！');
    return;
  }

  rec.need.forEach(n => {
    state.inventory[n.item] -= n.count;
    if (state.inventory[n.item] <= 0) delete state.inventory[n.item];
  });

  // FIX-B4: 鍛造出裝備放入背包
  state.inventory[rec.giveItem] = (state.inventory[rec.giveItem] || 0) + 1;
  audio.playFanfare();
  showToast(`天降神光！鍛造出【${rec.name}】，已存入儲物袋！`);

  // 自動穿戴並妥善收回舊裝備
  equipItem(rec.giveItem);

  renderCrafting();
  renderInventory();
  updateTopBar();
  renderProfile();
  saveGame();
}

function buyMarketItem(idx) {
  const offer = MARKET_OFFERS[idx];
  if (!offer) return;
  if (state.stones < offer.cost) {
    showToast('靈石不足！');
    return;
  }
  state.stones -= offer.cost;
  state.inventory[offer.give.item] = (state.inventory[offer.give.item] || 0) + offer.give.count;
  audio.playQiChime();
  showToast(`購得【${offer.name}】！`);
  renderMarket();
  renderInventory();
  updateTopBar();
  saveGame();
}

// FIX-B10: 洗靈根保底機制
let pendingRoot = null;
function washRoot() {
  if (state.stones < 100) {
    showToast('靈石不足，需100靈石引靈泉洗髓！');
    return;
  }

  const oldTotal = state.root.metal + state.root.wood + state.root.water + state.root.fire + state.root.earth;
  const newRoot = {
    metal: Math.floor(Math.random() * 50 + 30),
    wood: Math.floor(Math.random() * 50 + 30),
    water: Math.floor(Math.random() * 50 + 30),
    fire: Math.floor(Math.random() * 50 + 30),
    earth: Math.floor(Math.random() * 50 + 30)
  };
  const newTotal = newRoot.metal + newRoot.wood + newRoot.water + newRoot.fire + newRoot.earth;

  if (newTotal < oldTotal) {
    pendingRoot = newRoot;
    const confirmModal = document.getElementById('modal-wash-root-confirm');
    const descEl = document.getElementById('wash-root-confirm-desc');
    if (confirmModal && descEl) {
      descEl.innerText = `本次洗髓五行總合為 ${newTotal} 點，低於原先資質 (${oldTotal} 點)！是否確定要替換？`;
      confirmModal.classList.remove('hidden');
    }
  } else {
    state.stones -= 100;
    applyNewRoot(newRoot);
    showToast(`靈泉淬骨！五行靈根總質提升至 ${newTotal} 點！`);
  }
}

function applyNewRoot(newRoot) {
  state.root = newRoot;
  document.getElementById('root-val-metal').innerText = state.root.metal;
  document.getElementById('root-val-wood').innerText = state.root.wood;
  document.getElementById('root-val-water').innerText = state.root.water;
  document.getElementById('root-val-fire').innerText = state.root.fire;
  document.getElementById('root-val-earth').innerText = state.root.earth;

  const avg = (state.root.metal + state.root.wood + state.root.water + state.root.fire + state.root.earth) / 5;
  const bonusPct = Math.floor((avg / 10) * 3);
  document.getElementById('root-grade-text').innerText = `靈根資質：五行均值 ${avg.toFixed(1)} (吐納速度 +${bonusPct}%)`;

  audio.playFanfare();
  updateTopBar();
  saveGame();
}


