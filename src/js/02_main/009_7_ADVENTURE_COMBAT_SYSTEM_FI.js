/* ==========================================================================
   7. ADVENTURE & COMBAT SYSTEM (FIX-B6, B7, B9, B10, OPT-O4, O5)
   ========================================================================== */
let currentBattle = null;
let autoExploreInterval = null;
let autoStatusMsg = '';
let autoStopReason = '';
let battleResultTimer = null;
let autoStats = { wins: 0, stones: 0, items: {} }; // 本輪自動歷練累計戰果
let demonReturnTab = 'tab-abode'; // 心魔試煉結束後要回到的分頁
let eventResultArea = null;

function currentTabId() {
  const p = [...document.querySelectorAll('.tab-panel')].find(el => !el.classList.contains('hidden'));
  return p ? p.id : 'tab-abode';
}
function goToTab(id) {
  document.querySelector(`.nav-tab-btn[data-tab="${id}"]`)?.click();
}
// 奇遇相關視窗(選擇/結果)是否開著;開著時歷練暫停,避免被打斷
function eventModalOpen() {
  return ['modal-event-choice', 'modal-event-result'].some(id => {
    const el = document.getElementById(id);
    return !!el && !el.classList.contains('hidden');
  });
}
function autoSummaryText() {
  if (!autoStats.wins) return '';
  const items = Object.entries(autoStats.items).map(([n, c]) => `${n}×${c}`).join(' ');
  return `本輪自動歷練:勝 ${autoStats.wins} 場,靈石 +${formatNum(autoStats.stones)}${items ? ',掉落 ' + items : ''}`;
}
function autoStatusLine() {
  const parts = [];
  if (autoStats.wins) parts.push(`勝${autoStats.wins}場 💎+${formatNum(autoStats.stones)}`);
  parts.push(autoStatusMsg || '探索中…');
  return '🧭 自動歷練中｜' + parts.join('｜');
}

// 是否停留在歷練分頁
function isOnAdventureTab() {
  const el = document.getElementById('tab-adventure');
  return !!el && !el.classList.contains('hidden');
}
// 自動歷練中且人在別的分頁 = 靜默模式(不跳窗,只更新頂部狀態列)
function isQuietAuto() {
  return !!state.autoExplore && !isOnAdventureTab();
}
function adventureNotice(msg) {
  if (state.autoExplore) setAutoStatus(msg); // 自動歷練中一律不跳提示,改寫入狀態列
  else showToast(msg);
}
function setAutoStatus(msg) {
  if (msg) autoStatusMsg = msg;
  renderAutoStatusBar();
}
function stopAutoExplore(reason) {
  if (autoExploreInterval) {
    clearInterval(autoExploreInterval);
    autoExploreInterval = null;
  }
  state.autoExplore = false;
  autoStopReason = reason || '';
  updateAutoExploreBtn();
  if (reason && !isQuietAuto() && isOnAdventureTab()) showToast(reason);
  renderAutoStatusBar();
}
function renderAutoStatusBar() {
  const bar = document.getElementById('auto-explore-status-bar');
  if (!bar) return;
  const textEl = document.getElementById('auto-explore-status-text');
  const evBtn = document.getElementById('btn-pending-events');
  const pending = (state.pendingEvents || []).length;
  const onTab = isOnAdventureTab();
  let text = '';
  if (state.autoExplore) text = autoStatusLine();
  else if (!onTab && autoStopReason) text = `🧭 ${autoStopReason}`;
  textEl.innerText = text;
  textEl.classList.toggle('hidden', !text);
  evBtn.classList.toggle('hidden', pending === 0);
  evBtn.innerText = `📜 奇遇簿 (${pending})`;
  bar.classList.toggle('hidden', !text && pending === 0);
}
let battleLock = false; // FIX-B7: 出招鎖定，杜絕競態連點
let battleAutoTimer = null;
let skillCooldown = 0; // 技能回合冷卻

function logAdventure(text) {
  const box = document.getElementById('adventure-log-box');
  if (!box) return;
  const row = document.createElement('div');
  row.innerHTML = `<span class="text-slate-500 font-mono">[${new Date().toLocaleTimeString()}]</span> ${text}`;
  box.appendChild(row);
  // OPT-O5: 日誌保留最多 100 行
  while (box.children.length > 100) {
    box.removeChild(box.firstChild);
  }
  box.scrollTop = box.scrollHeight;
}

// FIX-B6 & OPT-O4: 歷練探索狀態機與 8 種隨機事件
function stepAdventure() {
  if (eventModalOpen()) return; // 奇遇進行中,歷練暫停
  if (!currentBattle && window.ST28 && ST28.pend && ST28.pend()) return; // v188 突破劇情待播,先不開下一場
  if (currentBattle) {
    if (!state.autoExplore) adventureNotice('戰鬥正酣，無法脫離戰場！');
    return;
  }

  const stats = calculateTotalStats();
  const area = AREAS_DATA[state.currentArea];
  if (!area) return;

  if (state.towerMode && towerOK()) { stepTower(); return; }
  if (wbRoll()) return; // v7: 天地異種 現身
  if (state.realmIdx < area.realmReq) {
    stopAutoExplore(`此地兇險，需達到【${REALM_DATA[area.realmReq].name}】方可涉足！`);
    if (!state.autoExplore && !autoStopReason) adventureNotice('此地兇險，境界不足！');
    return;
  }

  // v6: 氣血延續、自動服藥與調息
  if (hpGate(stats)) return;

  // 每日任務計數 (OPT-O9)
  if (state.dailyProgress) {
    state.dailyProgress.quest_explore = (state.dailyProgress.quest_explore || 0) + 1;
  }
  // FIX: 引導第3步(歷練)完成判定
  if (state.tutorialStep === 2) {
    state.tutorialStep = 3;
    updateTutorialBanner();
  }

  state.exploreStep = (state.exploreStep || 1) + 1;

  // 層數里程碑與通關結算 (OPT-O4)
  if (state.exploreStep > area.maxSteps) {
    state.exploreStep = 1;
    handleAreaClear(area);
  } else if (state.exploreStep === 5) {
    // 5層里程碑獎勵
    const r = area.milestoneReward;
    if (r) {
      state.stones += r.stones || 50;
      const _extra = [];
      Object.keys(r).forEach(k => {
        if (k !== 'stones' && ITEMS[k]) { addItem(k, r[k]); _extra.push(`${ITEMS[k].name}×${r[k]}`); }
      });
      logAdventure(`<span class="text-amber-400 font-bold">🚩 探索至第5層！獲取中途補給：靈石 +${r.stones}${_extra.length ? '、' + _extra.join('、') : ''}！</span>`);
      renderInventory();
    }
  }

  document.getElementById('explore-progress-text').innerText = `層數 ${state.exploreStep} / ${area.maxSteps}`;
  document.getElementById('explore-progress-fill').style.width = `${(state.exploreStep / area.maxSteps) * 100}%`;

  // 若為 Boss 層，必定遭遇境主 Boss
  if (state.exploreStep === area.maxSteps) {
    // 檢查 Boss 挑戰冷卻 (FIX-B9)
    if (Date.now() < (state.bossCooldownUntil || 0)) {
      const waitSec = Math.ceil((state.bossCooldownUntil - Date.now()) / 1000);
      adventureNotice(`境主魔威浩蕩，需調息凝神 ${waitSec} 秒後方可再戰！`);
      logAdventure(`⏳ 境主巢穴煞氣瀰漫，尚需調息 ${waitSec} 秒。`);
      return;
    }
    startMonsterBattle(area, true);
    return;
  }

  // OPT-O4: 8 種豐富化隨機事件抽取
  const eventRoll = Math.random();
  if (eventRoll < 0.42) {
    // 1. 遭遇妖魔戰鬥 (38%)
    startMonsterBattle(area, false);
  } else if (eventRoll < 0.58) {
    // 2. 採獲天材地寶 (14%)
    const foundStone = Math.floor(Math.random() * 25 + 15);
    state.stones += foundStone;
    const herbKey = area.id >= 2 ? 'herb_2' : 'herb_1';
    state.inventory[herbKey] = (state.inventory[herbKey] || 0) + 1;
    logAdventure(`🌿 於古樹崖壁採得【${ITEMS[herbKey].name} x1】與採集了 ${foundStone} 枚靈石。`);
    adventureNotice(`收穫靈草與 ${foundStone} 靈石！`);
    renderInventory();
    updateTopBar();
  } else if (eventRoll < 0.63) {
    // 3. 仙家機緣二選一選擇題 (5%,獎勵大幅提高)
    triggerEventChoice(area);
  } else if (eventRoll < 0.73) {
    // 4. 殘破法陣陷阱 (10%)
    const evadeRoll = Math.random();
    if (evadeRoll < 0.6) {
      logAdventure(`💨 踏入古修士殘破陷阱！道友身法如風，輕盈避過禁制陣法。`);
      adventureNotice('敏捷避開陣法陷阱！');
    } else {
      const dmg = Math.floor(stats.hp * 0.12);
      state.hp = Math.max(1, curHp(stats) - dmg);
      logAdventure(`<span class="text-rose-400">⚡ 不慎觸發蝕骨殘陣，遭受地火反噬，氣血受創 -${dmg}！</span>`);
      adventureNotice(`踩中陷阱，損失氣血 ${dmg}！`);
    }
  } else if (eventRoll < 0.81) {
    // 5. 神秘雲遊黑市商人 (8%)
    const discountOffer = MARKET_OFFERS[Math.floor(Math.random() * MARKET_OFFERS.length)];
    const discCost = Math.floor(discountOffer.cost * 0.7);
    if (state.stones >= discCost) {
      state.stones -= discCost;
      state.inventory[discountOffer.give.item] = (state.inventory[discountOffer.give.item] || 0) + discountOffer.give.count;
      logAdventure(` 偶遇雲遊散仙，以七折特惠 ${discCost} 靈石購得【${discountOffer.name}】！`);
      adventureNotice(`黑市奇遇：特價購得材料！`);
      renderInventory();
      updateTopBar();
    } else {
      logAdventure(` 偶遇雲遊散仙兜售靈藥，可惜袋中靈石不足...`);
    }
  } else if (eventRoll < 0.89) {
    // 6. 瑤池萬年靈泉 (8%)
    logAdventure(`<span class="text-teal-300">💧 步入山間無瑕靈泉，泉水沁人心脾，周身傷勢盡復，氣血回滿！</span>`);
    adventureNotice('飲下靈泉，氣血完全恢復！');
  } else if (eventRoll < 0.95) {
    // 7. 遺跡寶箱 (6%)
    const chestStones = Math.floor(Math.random() * 80 + 50);
    state.stones += chestStones;
    const oreKey = area.id >= 2 ? 'ore_2' : 'ore_1';
    state.inventory[oreKey] = (state.inventory[oreKey] || 0) + 1;
    logAdventure(`🎁 開啟古修士遺跡鐵箱，獲得 ${chestStones} 靈石與【${ITEMS[oreKey].name} x1】！`);
    adventureNotice(`開啟寶箱獲 ${chestStones} 靈石！`);
    renderInventory();
    updateTopBar();
  } else {
    // 8. 劍痕道碑頓悟 (4%)
    const qiBonus = Math.floor(stats.qiRate * 12 + 80);
    state.qi += qiBonus;
    state.totalCultivatedQi = (state.totalCultivatedQi || 0) + qiBonus;
    logAdventure(`🪨 參悟石壁上遠古劍痕，神識開朗，大有所獲！修為 +${formatNum(qiBonus)}！`);
    adventureNotice(`頓悟劍意，修為 +${formatNum(qiBonus)}！`);
    updateTopBar();
  }
}

// 處理通關與首通獎勵 (OPT-O4)
function handleAreaClear(area) {
  state.areaFirstClear = state.areaFirstClear || {};
  let clearMsg = `✨ 成功通關【${area.name}】！獲得通關靈石賞賜 +120！`;
  state.stones += 120;

  if (!state.areaFirstClear[area.id]) {
    state.areaFirstClear[area.id] = true;
    const fReward = area.firstClearReward;
    if (fReward) {
      state.stones += fReward.stones || 300;
      if (fReward.equip && ITEMS[fReward.equip]) {
        state.inventory[fReward.equip] = (state.inventory[fReward.equip] || 0) + 1;
        clearMsg += ` 首次通關額外奉送【${ITEMS[fReward.equip].name}】與 ${fReward.stones} 靈石！`;
      }
    }
    audio.playFanfare();
  }
  logAdventure(`<span class="text-amber-400 font-bold">${clearMsg}</span>`);
  extOnClear(area);
  adventureNotice('秘境通關，收穫豐厚！');
  renderInventory();
  updateTopBar();
}

// OPT-O4: 仙家機緣二選一 (機率降低、單次獎勵大幅提高;可存入奇遇簿稍後處理)
function eventRewardMult() {
  return 1 + state.realmIdx * 1.5;
}
function addItem(id, n) {
  state.inventory[id] = (state.inventory[id] || 0) + n;
}
const CHOICE_EVENTS = [
  {
    icon: '🏛️',
    title: '古仙洞窟遺址',
    desc: '前方黑風陣陣，但隱有霞光透出。似乎是一處上古修士遺府，但也可能有護府靈獸。',
    choiceA: '冒險深入探索 (55%成功，大量獎勵)',
    choiceB: '洞口採集後退去 (穩健保底)',
    actionA: () => {
      if (Math.random() < 0.55) {
        const st = Math.floor(600 * eventRewardMult());
        state.stones += st;
        addItem('herb_2', 3);
        addItem('pill_1', 2);
        logAdventure(`✨ 探秘成功！於古仙遺府深處尋得【洗髓花 x3】【聚氣丹 x2】與 ${st} 靈石！`);
        return { ok: true, icon: '✨', title: '探秘大成功',
          story: '你斂息凝神，踏入洞府深處。石壁上陣紋忽明忽暗，一座殘破丹房靜臥於霞光之中，爐內尚存一絲餘溫。',
          gains: [`💎 靈石 +${formatNum(st)}`, '🌸 洗髓花 ×3', '💊 聚氣丹 ×2'] };
      }
      const lost = Math.floor(state.stones * 0.05);
      state.stones -= lost;
      logAdventure(`⚠️ 洞窟深處毒障爆發，道友狼狽脫困，遺失 ${lost} 靈石！`);
      return { ok: false, icon: '', title: '毒障迷途',
        story: '洞窟深處毒障驟起，墨綠煙霧纏上經脈。你咬牙燃元硬衝出洞，袖中卻不知何時少了些靈石。',
        gains: [`💎 靈石 −${formatNum(lost)}`] };
    },
    actionB: () => {
      const st = Math.floor(160 * eventRewardMult());
      state.stones += st;
      logAdventure(`🍃 道友審時度勢，採得洞口靈石 ${st} 枚安然離去。`);
      return { ok: true, icon: '🍃', title: '見好就收',
        story: '你不貪不躁，只在洞口拾取散落的靈石便悄然退去。富貴險中求，亦有人懂得見好就收。',
        gains: [`💎 靈石 +${formatNum(st)}`] };
    }
  },
  {
    icon: '🍎',
    title: '奇異靈果樹',
    desc: '一株通體瑩紅的靈樹生長於峭壁之上，結有異香撲鼻的朱果，但樹旁盤伏著兇煞妖禽。',
    choiceA: '施展隱匿身法強摘 (70%成功，失敗將遭遇妖禽)',
    choiceB: '引開妖禽伺機奪取 (穩健保底)',
    actionA: () => {
      if (Math.random() < 0.7) {
        addItem('herb_1', 6);
        addItem('herb_2', 2);
        addItem('pill_1', 1);
        logAdventure(`🍎 身法通神！成功摘取【凝露靈草 x6】【洗髓花 x2】並煉化朱果得【聚氣丹 x1】！`);
        return { ok: true, icon: '🍎', title: '妙手摘果',
          story: '你身形如煙，掠過妖禽頭頂，一把摘下滿枝朱果。果香未散，兇禽尚在夢中。',
          gains: ['🌿 凝露靈草 ×6', '🌸 洗髓花 ×2', '💊 聚氣丹 ×1'] };
      }
      logAdventure(`🦅 妖禽驚覺，怒而撲殺！`);
      return { ok: false, battle: true, icon: '', title: '驚動妖禽',
        story: '枝葉輕響，盤伏的妖禽倏然睜眼，赤瞳如血，利爪撲面而來。一場惡戰，已是在所難免。',
        gains: [] };
    },
    actionB: () => {
      const st = Math.floor(220 * eventRewardMult());
      state.stones += st;
      addItem('herb_1', 2);
      logAdventure(`調虎離山成功，摸走巢穴靈石 ${st} 枚與【凝露靈草 x2】！`);
      return { ok: true, icon: '', title: '調虎離山',
        story: '你擲出一枚靈石，引得妖禽追逐而去，轉身便摸進巢穴，滿載而歸。',
        gains: [`💎 靈石 +${formatNum(st)}`, '🌿 凝露靈草 ×2'] };
    }
  },
  {
    icon: '📜',
    title: '上古傳承石碑',
    desc: '荒野深處矗立一方殘碑，碑面劍痕縱橫，隱約有玄奧道韻流轉。',
    choiceA: '靜坐參悟碑文 (60%成功，大量修為)',
    choiceB: '拓印碑文轉賣 (穩健保底)',
    actionA: () => {
      if (Math.random() < 0.6) {
        const stats = calculateTotalStats();
        const qi = Math.floor(stats.qiRate * 60 + 300);
        const st = Math.floor(300 * eventRewardMult());
        state.qi += qi;
        state.totalCultivatedQi = (state.totalCultivatedQi || 0) + qi;
        state.stones += st;
        logAdventure(`📜 參透碑文奧義，修為 +${formatNum(qi)}，並於碑下拾得 ${st} 靈石！`);
        return { ok: true, icon: '', title: '頓悟碑文',
          story: '你盤膝而坐，劍痕在識海中緩緩流轉，忽有一線靈光劈開迷霧。睜眼時，天地似乎都清晰了幾分。',
          gains: [`✨ 修為 +${formatNum(qi)}`, `💎 靈石 +${formatNum(st)}`] };
      }
      const lost = Math.floor(state.stones * 0.05);
      state.stones -= lost;
      logAdventure(`💫 神識被碑中劍意反震，頭痛欲裂，損失 ${lost} 靈石靜養。`);
      return { ok: false, icon: '', title: '劍意反震',
        story: '碑中殘存的劍意驟然反噬，識海如遭雷擊。你踉蹌退開，只得花些靈石調息靜養。',
        gains: [`💎 靈石 −${formatNum(lost)}`] };
    },
    actionB: () => {
      const st = Math.floor(200 * eventRewardMult());
      state.stones += st;
      logAdventure(` 拓印碑文賣予坊市散修，得 ${st} 靈石。`);
      return { ok: true, icon: '', title: '拓碑換財',
        story: '你小心拓下碑文，轉手賣給坊市的好古散修，也算物盡其用。',
        gains: [`💎 靈石 +${formatNum(st)}`] };
    }
  }
];

function triggerEventChoice(area) {
  const idx = window.pickEventIdx ? pickEventIdx() : Math.floor(Math.random() * CHOICE_EVENTS.length);
  const modalOpen = eventModalOpen();
  // 自動歷練中、不在歷練分頁、或已有奇遇視窗開著 → 存入奇遇簿
  if (state.autoExplore || !isOnAdventureTab() || modalOpen) {
    state.pendingEvents = state.pendingEvents || [];
    if (state.pendingEvents.length >= 30) state.pendingEvents.shift();
    state.pendingEvents.push({ idx, areaId: state.currentArea, t: Date.now() });
    const title = CHOICE_EVENTS[idx].title;
    logAdventure(`<span class="text-amber-300">📜 遇見奇遇【${title}】，已收入奇遇簿，稍後再處理。</span>`);
    adventureNotice(`📜 遇見奇遇【${title}】，已收入奇遇簿`);
    renderAutoStatusBar();
    saveGame();
    return;
  }
  presentChoiceEvent(idx, state.currentArea, null);
}

// 顯示奇遇選擇視窗;entry 為奇遇簿中的項目(選擇後才從簿中移除)
function presentChoiceEvent(idx, areaId, entry) {
  const modal = document.getElementById('modal-event-choice');
  const iconEl = document.getElementById('event-choice-icon');
  const titleEl = document.getElementById('event-choice-title');
  const descEl = document.getElementById('event-choice-desc');
  const btnA = document.getElementById('btn-event-choice-a');
  const btnB = document.getElementById('btn-event-choice-b');
  if (!modal || !btnA || !btnB) return;
  const ev = CHOICE_EVENTS[idx];
  if (!ev) {
    if (entry) state.pendingEvents = (state.pendingEvents || []).filter(e => e !== entry);
    renderAutoStatusBar();
    return;
  }
  const area = AREAS_DATA[areaId] || AREAS_DATA[state.currentArea] || AREAS_DATA[0];

  if (iconEl) iconEl.innerText = ev.icon || '🏮';
  titleEl.innerText = ev.title;
  descEl.innerText = ev.desc;
  btnA.innerText = ev.choiceA;
  btnB.innerText = ev.choiceB;
  btnA.disabled = false;
  btnB.disabled = false;

  const resolve = (action) => {
    btnA.disabled = true;
    btnB.disabled = true;
    modal.classList.add('hidden');
    if (entry) state.pendingEvents = (state.pendingEvents || []).filter(e => e !== entry);
    const res = action(area) || { ok: null, icon: '🏮', title: '機緣已逝', story: '', gains: [] };
    updateTopBar();
    renderInventory();
    renderAutoStatusBar();
    saveGame();
    showEventResult(res, area);
  };
  btnA.onclick = () => resolve(ev.actionA);
  btnB.onclick = () => resolve(ev.actionB);
  modal.classList.remove('hidden');
}

// 奇遇結果視窗:先短暫「天機推演」營造懸念,再揭曉結果(任何分頁都可顯示,不會強制切頁)
let eventResultTimer = null;
function showEventResult(res, area) {
  const modal = document.getElementById('modal-event-result');
  if (!modal) return;
  eventResultArea = area || null;
  const card = document.getElementById('event-result-card');
  const iconEl = document.getElementById('event-result-icon');
  const titleEl = document.getElementById('event-result-title');
  const storyEl = document.getElementById('event-result-story');
  const gainsEl = document.getElementById('event-result-gains');
  const actionsEl = document.getElementById('event-result-actions');
  const btnBattle = document.getElementById('btn-event-result-battle');
  const btnNext = document.getElementById('btn-event-result-next');
  const btnClose = document.getElementById('btn-event-result-close');

  // 階段一:懸念
  iconEl.innerText = '🌀';
  iconEl.className = 'text-5xl animate-spin-slow';
  titleEl.innerText = '天機推演中…';
  titleEl.className = 'font-serif-tc font-bold text-slate-300 text-base animate-pulse';
  storyEl.innerText = '';
  gainsEl.classList.add('hidden');
  actionsEl.classList.add('hidden');
  card.className = 'bg-slate-900 border-2 border-slate-600 rounded-xl p-4 w-full max-w-xs text-center space-y-3';
  modal.classList.remove('hidden');

  // 階段二:揭曉
  clearTimeout(eventResultTimer);
  eventResultTimer = setTimeout(() => {
    const tone = res.ok === true ? 'amber' : (res.ok === false ? 'rose' : 'slate');
    const palette = {
      amber: ['border-amber-400/80 shadow-lg shadow-amber-500/20', 'text-amber-300'],
      rose: ['border-rose-500/70 shadow-lg shadow-rose-500/20', 'text-rose-300'],
      slate: ['border-slate-500', 'text-slate-200']
    }[tone];
    card.className = `bg-slate-900 border-2 ${palette[0]} rounded-xl p-4 w-full max-w-xs text-center space-y-3`;
    iconEl.innerText = res.icon || '🏮';
    iconEl.className = 'text-5xl float-anim';
    titleEl.innerText = res.title || '機緣';
    titleEl.className = `font-serif-tc font-black ${palette[1]} text-lg`;
    storyEl.innerText = res.story || '';
    if (res.gains && res.gains.length) {
      gainsEl.innerHTML = res.gains.map(g => `<div class="${res.ok === false ? 'text-rose-300' : 'text-amber-200'} font-semibold">${g}</div>`).join('');
      gainsEl.classList.remove('hidden');
    } else {
      gainsEl.classList.add('hidden');
    }
    const pending = (state.pendingEvents || []).length;
    btnBattle.classList.toggle('hidden', !res.battle);
    btnClose.classList.toggle('hidden', !!res.battle);
    btnNext.classList.toggle('hidden', !(pending > 0 && !res.battle));
    btnNext.innerText = `📜 處理下一個奇遇 (剩 ${pending})`;
    actionsEl.classList.remove('hidden');
    if (res.ok === true) audio.playFanfare();
    else if (res.ok === false) audio.playSlash();
  }, 900);
}

// 從奇遇簿取出第一個奇遇處理(不切換分頁,結果視窗直接蓋在目前畫面上)
function openNextPendingEvent() {
  const list = state.pendingEvents || [];
  if (list.length === 0) return;
  if (eventModalOpen()) return;
  const entry = list[0];
  presentChoiceEvent(entry.idx, entry.areaId, entry);
}

// FIX-B7 & B10: 開始戰鬥 (綁定五行、專屬技能與 battleId)
function startMonsterBattle(area, forceBoss = false) {
  if (currentBattle) return; // FIX: 避免戰鬥中被覆蓋
  audio.init();
  const isBossStep = forceBoss || state.exploreStep === area.maxSteps;
  let monster = null;

  if (isBossStep) {
    monster = area.monsters.find(m => m.isBoss) || area.monsters[0];
  } else {
    const regular = area.monsters.filter(m => !m.isBoss);
    monster = regular[Math.floor(Math.random() * regular.length)];
  }

  const stats = calculateTotalStats();
  skillCooldown = 0;
  battleLock = false; // FIX-B7: 初始化鎖定旗標

  currentBattle = {
    id: Date.now() + Math.random(), // FIX-B7: 唯一戰鬥ID防競態
    monster: { ...monster, curHp: monster.hp },
    playerHp: curHp(stats),
    playerMaxHp: stats.hp,
    round: 1,
    counterTimeout: null
  };

  document.getElementById('explore-panel').classList.add('hidden');
  const battleModal = document.getElementById('battle-modal');
  battleModal.classList.remove('hidden');

  document.getElementById('monster-name').innerText = monster.name + (monster.isBoss ? ' (境主魔王)' : '');
  document.getElementById('monster-avatar').innerText = monster.emoji || (monster.isBoss ? '👹' : '🐺');
  
  // 五行元素標籤 (B10)
  const elemMap = { metal: '金', wood: '木', water: '水', fire: '火', earth: '土' };
  document.getElementById('monster-element-badge').innerText = elemMap[monster.element] || '無';
  document.getElementById('monster-skill-badge').innerText = `技能：${monster.skillName || '普通撕咬'}`;

  updateBattleUI();
  logAdventure(`<span class="text-rose-400 font-bold">⚠️ 遭遇【${monster.name}】(屬性:${elemMap[monster.element] || '無'})！拔劍迎戰！</span>`);

  // 若開啟了自動戰鬥(或自動歷練中)，排定自動戰鬥時程 (OPT-O5)
  if (state.autoBattle || state.autoExplore) {
    scheduleAutoBattleTurn();
  }
}



// FIX-B7, FIX-B10, OPT-O3: 玩家出招 (非線性傷害公式、五行相剋、battleLock防競態)


// 怪物出招


// OPT-O5: 排定自動戰鬥回合


function playerBattleHeal() {
  if (!currentBattle || battleLock) return;
  if ((state.inventory['pill_4'] || 0) <= 0) {
    showToast('儲物袋內沒有回春丹！');
    return;
  }
  state.inventory['pill_4']--;
  if (state.inventory['pill_4'] <= 0) delete state.inventory['pill_4'];

  const healAmount = pillHeal();
  currentBattle.playerHp = Math.min(currentBattle.playerMaxHp, currentBattle.playerHp + healAmount);
  audio.playQiChime();
  showToast(`吞服回春丹，氣血充盈恢復 ${healAmount} 點！`);
  logAdventure(`💊 吞服回春妙丹，體內生機蓬勃，氣血恢復 ${healAmount} 點。`);
  updateBattleUI();
  renderInventory();

  // 若在自動戰鬥中，繼續下一動
  if (state.autoBattle) {
    scheduleAutoBattleTurn();
  }
}

// FIX-B9: 逃跑懲罰機制 (扣5%靈石，30%機率失敗被怪物先手反擊)
function playerBattleFlee() {
  if (!currentBattle || battleLock) return;
  const lostStones = Math.floor(state.stones * 0.05);
  state.stones = Math.max(0, state.stones - lostStones);

  const failChance = 0.30;
  if (Math.random() < failChance) {
    logAdventure(`<span class="text-rose-400">⚠️ 靈狐遁術施展被阻！遭【${currentBattle.monster.name}】攔截突襲！</span>`);
    showToast('遁術失敗，遭受反擊！');
    battleLock = true;
    const speed = state.battleSpeed || 1;
    setTimeout(() => {
      monsterCounterAttack();
    }, 300 / speed);
  } else {
    showToast(`施展靈狐遁術，損耗 ${lostStones} 靈石脫身！`);
    logAdventure(`💨 施展遁術飄然退走，損耗了 ${lostStones} 靈石。`);
    if (currentBattle && currentBattle.isDemonTrib) { finishDemonBattle('flee'); return; }
    if (currentBattle && currentBattle.isWB) { wbLose(true); return; }
    endBattle();
  }
}

// 戰鬥勝利結算 (OPT-O5)
// winBattle:原為 6 層包裝,依原安裝順序(內→外)組合:
//   winBattle80      v8.0 宗門加成(031)
//   winBattle85      v8.5 統計/圖鑑/X5 靈石(034)
//   winBattle88      v8.8 九重劫勝利接手(037)
//   winBattle90      v9.0 流派道行(038)
//   winBattle100     v10.0 特殊戰接手・丹修回血(052)
//   winBattle101     v10.1 一般戰靈石/材料加成(script 07)
function winBattle() { return XT.chain(this, arguments, winBattleCore, [XT.winBattle80, XT.winBattle85, XT.winBattle88, XT.winBattle90, XT.winBattle100, XT.winBattle101]); }
function winBattleCore() {
  if (!isQuietAuto()) audio.playFanfare();
  const m = currentBattle.monster;
  logAdventure(`<span class="text-jade-400 font-bold">🏆 成功斬滅【${m.name}】！斬妖衛道，仙名遠播！</span>`);

  // 心魔劫判定
  if (currentBattle.isDemonTrib) {
    finishDemonBattle('win');
    return;
  }

  if (currentBattle.isWB) { wbWin(); return; }
  if (currentBattle.isTower) { towerWin(); return; }
  let gainedStones = 0;
  const gainedItems = [];
  const daoBonus = state.daoUpgrades?.['dao_drop'] ? 0.15 : 0; // OPT-O8

  if (m.drops) {
    m.drops.forEach(d => {
      if (d.item === 'stone') {
        gainedStones += d.count;
      } else {
        const dropRate = (d.chance || 0.5) * (1 + daoBonus);
        if (Math.random() <= dropRate) {
          state.inventory[d.item] = (state.inventory[d.item] || 0) + 1;
          gainedItems.push(ITEMS[d.item]?.name || d.item);
        }
      }
    });
  }
  state.stones += gainedStones;
  extOnWin(m, gainedItems);

  // OPT-O5: 彈出戰利品結算視窗
  showBattleResultModal(true, m.name, gainedStones, gainedItems);
  endBattle();
  updateTopBar();
  renderInventory();
  saveGame();

  // 自動歷練由 autoExploreInterval 統一推進,此處不另開計時(避免一次連走兩步)
}

// FIX-B9: 戰鬥失敗懲罰機制 (扣10%靈石、15%修為、重置層數、Boss冷卻)
// loseBattle:原為 5 層包裝,依原安裝順序(內→外)組合:
//   loseBattle80     v8.0 輪迴復生・宗門試煉(031)
//   loseBattle85     v8.5 死亡統計(034)
//   loseBattle88     v8.8 九重劫敗退接手(037)
//   loseBattle100    v10.0 特殊戰敗退接手(052)
//   loseBattle101    v10.1 自動歷練戰敗退關(script 05)
function loseBattle() { return XT.chain(this, arguments, loseBattleCore, [XT.loseBattle80, XT.loseBattle85, XT.loseBattle88, XT.loseBattle100, XT.loseBattle101]); }
function loseBattleCore() {
  if (currentBattle && currentBattle.isDemonTrib) { finishDemonBattle('lose'); return; }
  if (currentBattle && currentBattle.isWB) { wbLose(false); return; }
  if (currentBattle && currentBattle.isTower) { towerLose(); return; }
  state.hp = Math.max(1, Math.floor(calculateTotalStats().hp * 0.5));
  if (!isQuietAuto()) audio.playSlash();
  const lostStones = Math.floor(state.stones * 0.10);
  const lostQi = Math.floor(Math.min(state.qi, getRealmInfo().maxQi) * 0.15);
  state.stones = Math.max(0, state.stones - lostStones);
  state.qi = Math.max(0, state.qi - lostQi);
  state.exploreStep = 1;

  if (currentBattle && currentBattle.monster && currentBattle.monster.isBoss) {
    state.bossCooldownUntil = Date.now() + 10000; // 10秒冷卻
  }

  adventureNotice(`力竭不敵！損失靈石 ${lostStones}、修為 ${lostQi}，遁回洞府！`);
  logAdventure(`<span class="text-rose-500 font-bold">💀 道友重傷力竭，燃燒真元遁回洞府！損失 ${lostStones} 靈石與 ${lostQi} 點修為。</span>`);

  showBattleResultModal(false, currentBattle?.monster?.name || '妖魔', 0, []);
  endBattle();
  if (state.autoExplore) stopAutoExplore('戰敗，自動歷練已停止，請調整裝備後再出發。');
  updateTopBar();
  saveGame();
}

// endBattle:原為 2 層包裝,依原安裝順序(內→外)組合:
//   endBattle92      v9.2 戰鬥中預約切換區域(040)
//   endBattle101     v10.1 戰鬥接續詢問(script 06)
function endBattle() { return XT.chain(this, arguments, endBattleCore, [XT.endBattle92, XT.endBattle101]); }
function endBattleCore() {
  if (currentBattle && currentBattle.counterTimeout) {
    clearTimeout(currentBattle.counterTimeout);
  }
  if (currentBattle && currentBattle.timers) { currentBattle.timers.forEach(t => clearTimeout(t)); currentBattle.timers = []; }
  if (currentBattle && !currentBattle.isDemonTrib && currentBattle.playerHp > 0) state.hp = Math.max(1, Math.floor(currentBattle.playerHp));
  _stageBid = null;
  clearTimeout(battleAutoTimer);
  currentBattle = null;
  battleLock = false;

  document.getElementById('battle-modal').classList.add('hidden');
  document.getElementById('explore-panel').classList.remove('hidden');
}

// OPT-O5: 戰利品結算彈窗
function showBattleResultModal(isWin, monsterName, stones, items) {
  const modal = document.getElementById('modal-battle-result');
  const iconEl = document.getElementById('battle-result-icon');
  const titleEl = document.getElementById('battle-result-title');
  const descEl = document.getElementById('battle-result-desc');
  const lootBox = document.getElementById('battle-result-loot-box');
  if (!modal || !lootBox) return;

  // 自動歷練中的勝利:不跳窗,累計到頂部狀態列(不論在哪個分頁);戰敗才彈窗告知
  if (isWin ? !!state.autoExplore : isQuietAuto()) {
    if (isWin) {
      autoStats.wins++;
      autoStats.stones += stones;
      items.forEach(n => { autoStats.items[n] = (autoStats.items[n] || 0) + 1; });
      setAutoStatus(`斬滅【${monsterName}】`);
    } else {
      setAutoStatus(`不敵【${monsterName}】`);
    }
    return;
  }

  if (isWin) {
    iconEl.innerText = '🏆';
    titleEl.innerText = '戰鬥大捷！';
    descEl.innerText = `斬除【${monsterName}】，繳獲戰利品：`;
    let html = `<div class="flex justify-between text-amber-300 font-bold"><span>搜獲靈石：</span><span>+${stones}</span></div>`;
    if (items.length > 0) {
      html += `<div class="text-slate-300 mt-1 font-semibold">掉落戰利品：</div>`;
      items.forEach(it => {
        html += `<div class="text-emerald-400">🎁 ${it} x1</div>`;
      });
    } else {
      html += `<div class="text-slate-500 italic">妖魔身無長物，未掉落珍品。</div>`;
    }
    lootBox.innerHTML = html;
  } else {
    iconEl.innerText = '💀';
    titleEl.innerText = '戰鬥失利！';
    descEl.innerText = `不敵【${monsterName}】，燃燒真元血遁脫險！`;
    lootBox.innerHTML = `<div class="text-rose-400">已退回洞府調息。秘境探索層數重置回第 1 層。</div>`;
  }

  modal.classList.remove('hidden');
  // FIX: 數秒後自動關閉,避免卡在畫面上
  clearTimeout(battleResultTimer);
  battleResultTimer = setTimeout(() => modal.classList.add('hidden'), isWin ? 2500 : 3500);
}

// OPT-O5: 切換自動戰鬥
function toggleAutoBattle() {
  state.autoBattle = !state.autoBattle;
  const btn = document.getElementById('btn-battle-auto-toggle');
  if (btn) {
    btn.innerText = state.autoBattle ? '自動: 開' : '自動: 關';
    btn.className = state.autoBattle ? "px-2 py-0.5 rounded bg-amber-600 text-[10px] text-slate-950 font-bold border border-amber-300" : "px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 border border-slate-700";
  }
  if (state.autoBattle && currentBattle && !battleLock) {
    scheduleAutoBattleTurn();
  }
}

// OPT-O5: 切換戰鬥倍速 (1x / 2x / 3x)
function toggleBattleSpeed() {
  const speeds = [1, 2, 3];
  let curIdx = speeds.indexOf(state.battleSpeed || 1);
  curIdx = (curIdx + 1) % speeds.length;
  state.battleSpeed = speeds[curIdx];
  const btn = document.getElementById('btn-battle-speed');
  if (btn) btn.innerText = `倍速: ${state.battleSpeed}x`;
}

function updateAutoExploreBtn() {
  const btn = document.getElementById('btn-auto-explore');
  if (!btn) return;
  if (state.autoExplore) {
    btn.innerText = "自動歷練: 開";
    btn.className = "tap-effect py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-serif-tc font-bold text-xs rounded-lg border border-amber-300 shadow";
  } else {
    btn.innerText = "自動歷練: 關";
    btn.className = "tap-effect py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-serif-tc font-semibold text-xs rounded-lg border border-slate-700";
  }
}


