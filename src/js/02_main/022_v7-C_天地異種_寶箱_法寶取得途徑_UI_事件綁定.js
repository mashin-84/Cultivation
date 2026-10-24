/* ===== v7-C:天地異種/寶箱、法寶取得途徑 UI、事件綁定 ===== */
const WB_POOL = [['九尾天狐', '🦊'], ['墮天魔龍', '🐲'], ['噬星巨獸', '🦣'], ['幽冥鬼帝', '👹'], ['虛空魔蟲', '🪲'], ['太古饕餮', '🦁'], ['血月妖皇', '🦇'], ['滅世火鳳', '🔥']];
const WB_RATE = .003, WB_TRIES = 3;
function wbState() { if (!state.wb || typeof state.wb !== 'object') state.wb = { lv: 0, cur: null }; return state.wb; }
function wbStats(c) {
  const area = AREAS_DATA[c.tier], base = area.monsters.find(m => m.isBoss) || area.monsters[area.monsters.length - 1];
  return { hp: Math.floor(base.hp * 2.5 * (1 + .12 * (c.lv - 1))), atk: Math.floor(base.atk * 1.15 * (1 + .06 * (c.lv - 1))), def: Math.floor(base.def * 1.2), stone: (base.drops.find(d => d.item === 'stone') || { count: 1000 }).count };
}
function wbReady() { const c = wbState().cur; return !!c && Date.now() >= c.cdUntil && !currentBattle; }
function wbRoll() {
  const w = wbState(); if (w.cur || (state.realmIdx || 0) < 1 || Math.random() >= WB_RATE) return false;
  wbSpawn(); return true;
}
function wbSpawn(test) {
  const w = wbState(); if (w.cur) { showWbModal(); return; } const lvNow = test ? w.lv + 1 : ++w.lv;
  const p = WB_POOL[Math.floor(Math.random() * WB_POOL.length)], els = ['metal', 'wood', 'water', 'fire', 'earth'], t = Math.min(7, state.realmIdx || 0);
  const c = { lv: lvNow, tier: t, name: p[0], emoji: p[1], el: els[Math.floor(Math.random() * 5)], tries: 0, cdUntil: 0 };
  c.maxHp = wbStats(c).hp; c.hp = c.maxHp; w.cur = c;
  if (state.autoExplore) stopAutoExplore('天地異種 現身!自動歷練已暫停。');
  logAdventure(`<span class="text-fuchsia-300 font-bold">🌋 天地震動!靈潮失衡,上古凶獸現世——天地異種【Lv.${c.lv} ${c.name}】降臨!(共 ${WB_TRIES} 次挑戰機會)</span>`);
  audio.playFanfare(); renderWbCard(true); showWbModal(); saveGame();
}
function wbBar(c) { const p = Math.max(0, Math.min(100, c.hp / c.maxHp * 100)); return `<div class="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800"><div class="h-full rounded-full" style="width:${p}%;background:linear-gradient(90deg,#a21caf,#f43f5e)"></div></div><div class="text-[10px] text-slate-400 text-right font-mono">${formatNum(c.hp)} / ${formatNum(c.maxHp)}</div>`; }
function wbInfoHtml(c) {
  const left = WB_TRIES - c.tries, cd = Math.max(0, Math.ceil((c.cdUntil - Date.now()) / 1000)), st = wbStats(c);
  return `<div class="flex items-center space-x-3"><div class="text-5xl">${c.emoji}</div><div class="flex-1 min-w-0"><div class="font-serif-tc font-black text-fuchsia-200">Lv.${c.lv} ${c.name} <span class="text-[10px] text-slate-400">(${SK_EL[c.el]}系)</span></div><div class="text-[10px] text-slate-400">攻 ${formatNum(st.atk)} · 防 ${formatNum(st.def)} · 剩餘挑戰 ${left}/${WB_TRIES} 次</div>${wbBar(c)}</div></div>${cd > 0 ? `<div class="text-[11px] text-amber-300 mt-1">⏳ 調息冷卻中:${Math.floor(cd / 60)}分${cd % 60}秒(傷勢未癒,Boss 亦在回復)</div>` : '<div class="text-[11px] text-emerald-300 mt-1">✅ 可以挑戰</div>'}`;
}
let _wbSig = '';
function renderWbCard(force) {
  let card = document.getElementById('wb-card');
  if (!card) { const a = document.getElementById('hp-row'); if (!a) return; card = document.createElement('div'); card.id = 'wb-card'; card.className = 'hidden rounded-xl border border-fuchsia-500/60 bg-gradient-to-br from-fuchsia-950/70 to-slate-950 p-2.5 text-xs space-y-1.5'; a.before(card); }
  const c = wbState().cur, boxes = Object.keys(state.inventory || {}).filter(k => k.startsWith('wbox_') && state.inventory[k] > 0);
  const sig = JSON.stringify([c && [c.lv, c.tries, c.hp, Math.ceil((c.cdUntil - Date.now()) / 1000)], boxes.map(k => k + state.inventory[k]), !!currentBattle]);
  if (!force && sig === _wbSig) return; _wbSig = sig;
  if (!c && !boxes.length) { card.classList.add('hidden'); return; }
  card.classList.remove('hidden');
  let h = '';
  if (c) { const ok = wbReady(); h += `<div class="font-bold text-fuchsia-300 text-[11px]">🌋 天地異種 現身</div>${wbInfoHtml(c)}<div class="flex gap-2"><button data-wb="fight" ${ok ? '' : 'disabled'} class="tap-effect flex-1 py-1.5 rounded font-bold ${ok ? 'bg-fuchsia-600 text-white' : 'bg-slate-800 text-slate-500'}">⚔️ 挑戰(第 ${c.tries + 1} 次)</button><button data-wb="leave" class="tap-effect px-3 py-1.5 rounded bg-slate-800 text-slate-400 border border-slate-700">放棄</button></div>`; }
  if (boxes.length) h += `<div class="flex items-center justify-between"><span class="text-amber-200">🎁 持有 ${boxes.map(k => `${ITEMS[k].name}×${state.inventory[k]}`).join('、')}</span><button data-chest="${boxes[0]}" class="tap-effect px-3 py-1 rounded bg-amber-600 text-slate-950 font-bold">開啟</button></div>`;
  card.innerHTML = h;
}
function ensureWbModal() {
  if (document.getElementById('modal-wb')) return;
  document.body.insertAdjacentHTML('beforeend', `<div id="modal-wb" class="fixed inset-0 z-50 bg-black/85 hidden flex items-center justify-center p-4"><div class="bg-slate-900 border border-fuchsia-500/70 rounded-xl p-4 w-full max-w-xs space-y-3"><h3 class="font-serif-tc font-black text-fuchsia-300 text-center">🌋 天地異種 降臨</h3><div id="wb-modal-body" class="text-xs"></div><p class="text-[11px] text-slate-400">共三次挑戰機會,失敗會進入冷卻,Boss 受的傷害會保留(並回復部分);三次皆敗則 Boss 離去。擊敗可得<b class="text-amber-300">古仙遺匣</b>。</p><div class="flex gap-2"><button data-wb="fight-modal" class="tap-effect flex-1 py-2 rounded bg-fuchsia-600 text-white font-bold text-xs">立刻迎戰</button><button data-wb="close" class="tap-effect flex-1 py-2 rounded bg-slate-800 text-slate-300 text-xs">稍後再戰</button></div></div></div>`);
}
function showWbModal() { ensureWbModal(); const c = wbState().cur; if (!c) return; document.getElementById('wb-modal-body').innerHTML = wbInfoHtml(c); document.getElementById('modal-wb').classList.remove('hidden'); }
function wbChallenge() {
  const w = wbState(), c = w.cur; if (!c) return;
  if (currentBattle) { showToast('戰鬥正酣!'); return; }
  if (Date.now() < c.cdUntil) { showToast('尚在冷卻中,請稍候。'); return; }
  const st = calculateTotalStats(); if (curHp(st) < st.hp * .3) { showToast('氣血過低,先服藥調息再戰!'); return; }
  document.getElementById('modal-wb')?.classList.add('hidden');
  goToTab('tab-adventure'); if (state.autoExplore) stopAutoExplore('');
  const s = wbStats(c), mon = { id: 'wb' + c.lv, name: `Lv.${c.lv} ${c.name}`, emoji: c.emoji, element: c.el, skillName: '滅世威壓', skillDesc: '天地異種 的恐怖威壓', hp: s.hp, atk: s.atk, def: s.def, isBoss: true, drops: [] };
  c.tries++;
  startMonsterBattle({ id: 98, name: '天地異種', maxSteps: 99, element: c.el, monsters: [mon] }, true);
  if (currentBattle) { currentBattle.isWB = true; currentBattle.monster.curHp = c.hp; updateBattleUI(); logAdventure(`<span class="text-fuchsia-300">⚔️ 挑戰天地異種【${c.name}】(第 ${c.tries}/${WB_TRIES} 次)</span>`); }
  else c.tries--;
  renderWbCard(true);
}
// wbWin:原為 4 層包裝,依原安裝順序(內→外)組合:
//   wbWin85          v8.5 統計/圖鑑(034)
//   wbWin86          v8.6 器紋石(035)
//   wbWin88          v8.8 仙緣(037)
//   wbWin100         v10.0 靈寵蛋/仙緣遺澤(052)
function wbWin() { return XT.chain(this, arguments, wbWinCore, [XT.wbWin85, XT.wbWin86, XT.wbWin88, XT.wbWin100]); }
function wbWinCore() {
  const w = wbState(), c = w.cur, B = currentBattle, s = wbStats(c), boxId = `wbox_${c.tier}`, stones = s.stone * 5;
  state.stones += stones; state.inventory[boxId] = (state.inventory[boxId] || 0) + 1;
  logAdventure(`<span class="text-fuchsia-300 font-bold">🏆 擊敗天地異種【Lv.${c.lv} ${c.name}】!獲得${ITEMS[boxId].name}!</span>`);
  w.cur = null; showBattleResultModal(true, B.monster.name, stones, [ITEMS[boxId].name]); endBattle();
  renderWbCard(true); renderInventory(); updateTopBar(); saveGame();
}
function wbLose(flee) {
  const w = wbState(), c = w.cur, B = currentBattle; if (!c) { endBattle(); return; }
  c.hp = Math.max(1, Math.min(c.maxHp, Math.floor(B.monster.curHp + c.maxHp * .25)));
  state.hp = Math.max(1, Math.floor(calculateTotalStats().hp * .5));
  let msg;
  if (c.tries >= WB_TRIES) { w.cur = null; msg = `三次挑戰皆敗,天地異種【${c.name}】揚長而去……`; }
  else { c.cdUntil = Date.now() + c.tries * 90000; msg = `挑戰失利!需調息 ${Math.floor(c.tries * 1.5 * 10) / 10} 分鐘後方可再戰(剩餘 ${WB_TRIES - c.tries} 次機會)。`; }
  logAdventure(`<span class="text-rose-400 font-bold">💀 ${msg}</span>`);
  showBattleResultModal(false, B.monster.name, 0, []); endBattle();
  if (state.autoExplore) stopAutoExplore('天地異種 之戰結束。');
  renderWbCard(true); updateTopBar(); saveGame();
}
function wbLeave() { const c = wbState().cur; if (!c) return; if (!window.confirm(`確定放棄【${c.name}】嗎?Boss 將離去且不可再挑戰。`)) return; wbState().cur = null; document.getElementById('modal-wb')?.classList.add('hidden'); renderWbCard(true); saveGame(); }
/* ---- 寶箱 ---- */
const pick = a => a[Math.floor(Math.random() * a.length)];
function chestLoot(t) {
  const out = [], give = (id, n, tag) => { state.inventory[id] = (state.inventory[id] || 0) + n; out.push({ ic: ITEMS[id].icon, nm: ITEMS[id].name + (n > 1 ? ' ×' + n : ''), q: ITEMS[id].quality || 'epic', tag }); };
  const area = AREAS_DATA[t], bossM = area.monsters.find(m => m.isBoss) || area.monsters[0], stoneBase = (bossM.drops.find(d => d.item === 'stone') || { count: 1000 }).count;
  const r = Math.random();
  if (r < .35) give(`ex_${pick(EQUIP_SLOTS)}_${t}`, 1, '古仙遺物');
  else if (r < .60) {
    const own = state.treasures || {}, p1 = TREASURES.filter(x => x.how === 'wb' && !own[x.id]), p2 = TREASURES.filter(x => (x.how === 'frag' || x.how === 'tower' || x.how === 'clear') && !own[x.id]);
    const pool = p1.length ? p1 : p2;
    if (pool.length && treOK()) { const x = pick(pool); grantTreasure(x.id, true); out.push({ ic: x.i, nm: `法寶【${x.n}】`, q: 'mythic', tag: '稀世法寶' }); }
    else give('pp_hp', 2, '稀世丹藥');
  } else if (r < .80) {
    const ks = ['pp_hp', 'pp_atk', 'pp_def'].filter(k => ((state.pillUse || {})[PP_KEY[k]] || 0) + (state.inventory[k] || 0) < PP_MAX);
    if (ks.length) give(pick(ks), 1 + Math.floor(Math.random() * 2), '稀世丹藥'); else give(t >= 1 ? `yq_${t}` : 'pill_1', 3, '丹藥');
  } else if (r < .90 && petOK()) { state.eggs = (state.eggs || 0) + 2; out.push({ ic: '🥚', nm: '靈寵蛋 ×2', q: 'rare', tag: '靈寵' }); }
  else give(t >= 1 ? `yq_${t}` : 'pill_1', 2 + Math.ceil(t / 2), '大批丹藥');
  const minors = 2 + Math.floor(wbState().lv / 8);
  for (let i = 0; i < minors; i++) {
    const k = Math.floor(Math.random() * 6);
    if (k === 0) { const s = stoneBase * (3 + Math.floor(Math.random() * 4)); state.stones += s; out.push({ ic: '💎', nm: `靈石 ×${formatNum(s)}`, q: 'uncommon' }); }
    else if (k === 1 && treOK()) { const n = 8 + Math.floor(Math.random() * 11); state.tfrag = (state.tfrag || 0) + n; out.push({ ic: '🧩', nm: `法寶殘片 ×${n}`, q: 'rare' }); }
    else if (k === 2) give('pill_3', 1);
    else if (k === 3) { give(`hb_${t}`, 4); give(`bp_${t}`, 4); }
    else if (k === 4) give(TIER_ORE[t], 6);
    else { const sp = t >= 5 ? 'sp_5' : t >= 3 ? 'sp_3' : 'sp_1'; give(sp, 1); }
  }
  if (ITEMS.pill_dt) { const r3 = Math.random(); give('pill_dt', r3 < .03 ? 3 : r3 < .18 ? 2 : 1, '解毒聖藥'); }   /* v111 */
  return out;
}
function openChest(key) {
  if (!(state.inventory[key] > 0)) return; const it = ITEMS[key]; if (!it || it.type !== 'chest') return;
  state.inventory[key]--; if (state.inventory[key] <= 0) delete state.inventory[key];
  const loot = chestLoot(it.tier); audio.playFanfare();
  if (!document.getElementById('modal-chest')) {
    document.head.insertAdjacentHTML('beforeend', '<style>.ch-box{font-size:64px;display:inline-block;animation:chs .9s ease-in-out}@keyframes chs{0%,100%{transform:rotate(0)}15%{transform:rotate(-14deg)}30%{transform:rotate(12deg)}45%{transform:rotate(-10deg) scale(1.15)}60%{transform:rotate(8deg) scale(1.2)}85%{transform:scale(1.5);opacity:.9}}.ch-it{opacity:0;animation:chi .5s ease-out forwards}@keyframes chi{from{opacity:0;transform:translateY(12px) scale(.9)}to{opacity:1;transform:none}}</style>');
    document.body.insertAdjacentHTML('beforeend', '<div id="modal-chest" class="fixed inset-0 z-[60] bg-black/85 hidden flex items-center justify-center p-4"><div class="bg-slate-900 border border-amber-400/70 rounded-xl p-4 w-full max-w-xs space-y-2 text-center"><div id="ch-title" class="font-serif-tc font-black text-amber-300"></div><div id="ch-icon" class="ch-box">🎁</div><div id="ch-list" class="space-y-1 text-left text-xs"></div><button data-chest="close" class="tap-effect w-full py-2 rounded bg-amber-600 text-slate-950 font-bold text-xs">收下寶物</button></div></div>');
  }
  document.getElementById('ch-title').textContent = it.name; const ic = document.getElementById('ch-icon'); ic.innerHTML = (typeof ICO !== 'undefined' ? ICO.chest(it.id) : '🎁'); ic.style.animation = 'none'; void ic.offsetWidth; ic.style.animation = '';
  document.getElementById('ch-list').innerHTML = loot.map((x, i) => `<div class="ch-it flex items-center justify-between bg-slate-950 border rounded px-2 py-1" style="animation-delay:${.9 + i * .22}s;border-color:${Q_COL[x.q] || '#475569'}88"><span style="color:${Q_COL[x.q] || '#e2e8f0'}">${x.ic} ${x.nm}</span>${x.tag ? `<span class="text-[10px] text-fuchsia-300">${x.tag}</span>` : ''}</div>`).join('');
  document.getElementById('modal-chest').classList.remove('hidden');
  renderInventory(); updateTopBar(); renderProfile(); renderWbCard(true); renderEquipSlots(); saveGame();
}
/* ---- 法寶頁(32 件 + 取得途徑) ---- */
let tFilter = 'all';
const T_FILT = { all: '全部', clear: '秘境首通', frag: '殘片合成', tower: '九九登天塔', wb: '天地異種', dao: '道心閣' };
function canSynth() { return TREASURES.some(t => t.how === 'frag' && !(state.treasures || {})[t.id] && (state.tfrag || 0) >= t.cost) || TREASURES.some(t => t.how === 'dao' && !(state.treasures || {})[t.id] && (state.daoPoints || 0) >= t.cost); }
renderMingTreasure = function () {
  const own = TREASURES.filter(t => (state.treasures || {})[t.id]).length, total = TREASURES.length, sb = setBonus(own);
  const nxt = SET_STEPS.find(s => s > own);
  let h = `<div class="rounded-xl border border-slate-700 bg-slate-900 p-3"><div class="flex justify-between text-xs"><span class="font-serif-tc font-bold text-amber-300">💠 法寶收藏 ${own} / ${total}</span><span class="text-emerald-300">套裝:全屬性 +${Math.round(sb * 100)}%</span></div>
    <div class="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800 mt-2"><div class="h-full bg-gradient-to-r from-amber-600 to-yellow-300" style="width:${own / total * 100}%"></div></div>
    <div class="grid grid-cols-4 gap-1 text-[10px] mt-1.5">${SET_STEPS.map(s => `<div class="rounded text-center py-0.5 ${own >= s ? 'bg-emerald-900/60 text-emerald-300' : 'bg-slate-950 text-slate-500'}">${s}件 +${Math.round(setBonus(s) * 100)}%</div>`).join('')}</div>
    <div class="flex justify-between text-[11px] mt-2"><span class="text-sky-300">🧩 法寶殘片 ${state.tfrag || 0}</span><span class="text-purple-300">☯ 道心點 ${state.daoPoints || 0}</span>${nxt ? `<span class="text-slate-400">再收 ${nxt - own} 件 → ${Math.round(setBonus(nxt) * 100)}%</span>` : ''}</div>
    <div class="text-[10px] text-slate-500 mt-1">殘片來源:妖魔掉落(Boss 多)、九九登天塔每層、天地異種 寶箱。轉世後法寶與殘片皆保留。</div>
    <div class="flex flex-wrap gap-1.5 mt-2">${Object.keys(T_FILT).map(k => chip('tf', k, T_FILT[k], tFilter === k)).join('')}</div></div><div class="grid grid-cols-2 gap-2 mt-2">`;
  TREASURES.forEach(t => {
    if (tFilter !== 'all' && t.how !== tFilter) return;
    const o = (state.treasures || {})[t.id], A = TREASURE_ART[t.id];
    let src, act = '';
    if (t.how === 'clear') src = `通關【${AREAS_DATA[t.src].name}】`;
    else if (t.how === 'frag') { src = `殘片合成(${t.cost} 片)`; act = o ? '' : eBtn('t-synth', t.id, `合成 ${state.tfrag || 0}/${t.cost}`, (state.tfrag || 0) >= t.cost, 'bg-gradient-to-r from-sky-600 to-cyan-500 text-white'); }
    else if (t.how === 'tower') src = `九九登天塔第 ${t.floor} 層(目前最高 ${(state.tower || {}).best || 0})`;
    else if (t.how === 'wb') src = '天地異種 寶箱稀有掉落';
    else { src = `道心閣兌換(${t.cost} 道心點)`; act = o ? '' : eBtn('t-buy', t.id, `兌換 ${state.daoPoints || 0}/${t.cost}`, (state.daoPoints || 0) >= t.cost, 'bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white'); }
    h += `<div class="rounded-xl border p-2 text-center ${o ? 'border-amber-500/60 bg-slate-900' : 'border-slate-800 bg-slate-950'}"><div class="relative w-14 h-14 mx-auto ${o ? 'glw' : ''}" style="--c:${A[0]}">${tArt(t, !o)}${o ? '' : '<div class="absolute inset-0 flex items-center justify-center text-slate-400 text-lg font-bold">?</div>'}</div>
      <div class="text-xs font-bold mt-1 ${o ? 'text-amber-200' : 'text-slate-500'}">${o ? t.n : (t.how === 'frag' || t.how === 'dao' ? t.n : '未得之寶')}</div>
      <div class="text-[10px] ${o ? 'text-emerald-300' : 'text-slate-600'}">${o || t.how === 'frag' || t.how === 'dao' ? treasureDesc(t) : '???'}</div>
      <div class="text-[10px] text-slate-500">${src}</div>${act ? `<div class="mt-1">${act}</div>` : ''}</div>`;
  });
  return h + '</div>';
};
const _extAct1 = extAct;
extAct = function (a, id) {
  if (a === 't-synth' || a === 't-buy') {
    const t = TREASURES.find(x => x.id === id); if (!t || (state.treasures || {})[id]) return;
    if (a === 't-synth') { if ((state.tfrag || 0) < t.cost) return; state.tfrag -= t.cost; } else { if ((state.daoPoints || 0) < t.cost) return; state.daoPoints -= t.cost; }
    grantTreasure(id); audio.playFanfare(); updateTopBar(); renderProfile(); renderExt(true); saveGame(); return;
  }
  if (a === 't-filter') { tFilter = id; renderExt(true); return; }
  _extAct1(a, id);
};
/* ---- 事件綁定 ---- */
window.addEventListener('load', () => {
  const body = document.body;
  ensureWbModal(); ensureCraftScenes(); renderRootLocks(); renderEquipSlots(); renderCrafting(); renderWbCard(true);
  body.addEventListener('click', e => {
    const q = s => e.target.closest(s);
    let b;
    if ((b = q('[data-eslot]'))) { document.getElementById('modal-enhance-gear')?.classList.remove('hidden'); renderEnhModal(); return; }
    if ((b = q('[data-enh]')) && !b.disabled) { enhanceEquippedGear(b.dataset.enh); renderEnhModal(); return; }
    if ((b = q('[data-enhx]')) && !b.disabled) { enhanceMany(b.dataset.enhx); renderEnhModal(); return; }
    if ((b = q('[data-cu]'))) { CU.kind = b.dataset.cu; renderCrafting(); return; }
    if ((b = q('[data-cua]'))) { CU.allA = !CU.allA; renderCrafting(); return; }
    if ((b = q('[data-cf]'))) { CU.slot = b.dataset.cf; renderCrafting(); return; }
    if ((b = q('[data-cfa]'))) { CU.allF = !CU.allF; renderCrafting(); return; }
    if ((b = q('[data-tf]'))) { tFilter = b.dataset.tf; renderExt(true); return; }
    if ((b = q('[data-rk]'))) { toggleRootLock(b.dataset.rk); return; }
    if ((b = q('[data-wb]')) && !b.disabled) { const k = b.dataset.wb; if (k === 'fight' || k === 'fight-modal') wbChallenge(); else if (k === 'leave') wbLeave(); else if (k === 'close') document.getElementById('modal-wb')?.classList.add('hidden'); return; }
    if ((b = q('[data-chest]'))) { if (b.dataset.chest === 'close') document.getElementById('modal-chest')?.classList.add('hidden'); else openChest(b.dataset.chest); return; }
    if ((b = q('button[data-action="open-chest"]'))) { openChest(b.dataset.id); return; }
  });
  document.getElementById('btn-enhance-equipped')?.addEventListener('click', renderEnhModal);
  setInterval(() => { renderWbCard(); if (document.getElementById('modal-wb') && !document.getElementById('modal-wb').classList.contains('hidden')) { const c = wbState().cur; if (c) document.getElementById('wb-modal-body').innerHTML = wbInfoHtml(c); } }, 1000);
});

