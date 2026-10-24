/* ===== 擴充:煉體 / 法寶 / 靈寵 / 劇情 / 離線歷練 ===== */
const EXT_STAGES = ['煉皮', '煉肉', '煉筋', '煉骨', '煉髓', '煉血'];
const TREASURES = [
  { id: 't0', n: '青雲玉佩', i: '📿', hpP: .03, src: 0 }, { id: 't1', n: '幽谷妖丹', i: '🔮', atkP: .03, src: 1 },
  { id: 't2', n: '玄龜護心鏡', i: '🪞', defP: .04, src: 2 }, { id: 't3', n: '赤焰靈珠', i: '🔥', atkP: .04, crit: 2, src: 3 },
  { id: 't4', n: '縹緲仙羅', i: '🧣', hpP: .05, qiP: .03, src: 4 }, { id: 't5', n: '九重天印', i: '🏯', atkP: .05, defP: .05, src: 5 },
  { id: 't6', n: '瑤池蓮臺', i: '🪷', hpP: .08, qiP: .05, src: 6 }, { id: 't7', n: '混沌鍾', i: '🔔', atkP: .08, defP: .08, crit: 3, src: 7 }
];
const PETS = [
  { id: 'p0', n: '靈狐', i: '🦊', atkP: .004, s: .10 }, { id: 'p1', n: '玄龜', i: '🐢', defP: .006, hpP: .004, s: .06 },
  { id: 'p2', n: '火鳳雛', i: '🐦', atkP: .006, s: .14 }, { id: 'p3', n: '青鸞', i: '🦚', hpP: .006, qiP: .003, s: .10 },
  { id: 'p4', n: '瑞獸雲鹿', i: '🦌', hpP: .004, defP: .004, atkP: .003, s: .12 }
];
const STORIES = [
  { k: 'p0', icon: '🏔️', title: '序·青雲入道', lines: ['凡塵一夢，你於青雲宗後山睜眼。', '天地靈氣如絲，繞指而生。', '一念起，仙路始。'] },
  { k: 'r1', icon: '🏛️', title: '築基·道基初成', lines: ['靈氣化液，沉入丹田，百骸通透。', '你終於明白，何謂「脫胎換骨」。'] },
  { k: 'r2', icon: '🟡', title: '金丹·九轉凝丹', lines: ['丹田之中，一輪金丹緩緩轉動。', '壽數百載已是起點，你的目光望向更遠的天。'] },
  { k: 'r3', icon: '👶', title: '元嬰·神遊太虛', lines: ['元嬰出竅，山河萬里盡在掌中。', '世人仰望的巔峰，不過是你腳下的一階。'] },
  { k: 'r4', icon: '🌠', title: '化神·神融造化', lines: ['五行在身，造化在心。', '凡界之頂近在咫尺——頭頂那道天門，已隱隱震動。'] },
  { k: 'r5', icon: '🌌', title: '羽化·仙界初臨', lines: ['（已於飛升演出中度過）'], skip: true },
  { k: 'r6', icon: '🌀', title: '玄仙·道法自然', lines: ['你參悟玄妙，言出而法隨。', '仙界之大，方知「仙」亦不過是途中一站。'] },
  { k: 'r7', icon: '✨', title: '金仙·萬劫不磨', lines: ['金身不朽，萬劫難侵。', '大羅之門，已在霧後輕輕開啟。'] },
  { k: 'r8', icon: '☯️', title: '大羅·一念成道', lines: ['一念飛仙，飛的原是自己的心。', '（終局之後，仙途仍可繼續。）'] }
];
function extStats() {
  const X = { hpP: 0, atkP: 0, defP: 0, qiP: 0, crit: 0 };
  const b = state.body || 0; X.hpP += b * .03; X.defP += b * .02; X.atkP += b * .005;
  let n = 0;
  TREASURES.forEach(t => { if ((state.treasures || {})[t.id]) { n++; ['hpP', 'atkP', 'defP', 'qiP', 'crit'].forEach(k => X[k] += t[k] || 0); } });
  const sb = setBonus(n); X.hpP += sb; X.atkP += sb; X.defP += sb;
  const pp = pillPerm(); X.hpP += pp.hp; X.atkP += pp.atk; X.defP += pp.def;
  const p = state.pets && state.pets[state.activePet], pd = PETS.find(x => x.id === state.activePet);
  if (p && pd) ['hpP', 'atkP', 'defP', 'qiP'].forEach(k => X[k] += (pd[k] || 0) * p.lv);
  return X;
}
function petCap() { return Math.min(30, 5 + (state.realmIdx || 0) * 4); }
function petStrike() {
  const p = state.pets && state.pets[state.activePet], pd = PETS.find(x => x.id === state.activePet);
  if (!p || !pd) return 0;
  const d = Math.max(1, Math.floor(calculateTotalStats().atk * (pd.s + .01 * p.lv)));
  logAdventure(`${pd.i} 【${pd.n}】協同出擊，追加 ${d} 點傷害！`);
  return d;
}
function grantTreasure(id, quiet) {
  state.treasures = state.treasures || {};
  const t = TREASURES.find(x => x.id === id); if (!t || state.treasures[id]) return false;
  state.treasures[id] = true;
  if (!quiet) { showToast(`獲得法寶【${t.i}${t.n}】！`); logAdventure(`<span class="text-amber-300 font-bold">💠 獲得法寶【${t.n}】！</span>`); }
  return true;
}
function extOnClear(area) { grantTreasure('t' + area.id); }
function extOnWin(m, items) {
  if (petOK() && Math.random() < (m.isBoss ? .15 : .04)) { state.eggs = (state.eggs || 0) + 1; items.push('🥚靈寵蛋'); }
  if (treOK() && m.isBoss && Math.random() < .10) {
    const pool = TREASURES.filter(t => t.src <= (state.currentArea || 0) && !(state.treasures || {})[t.id]);
    if (pool.length) { const t = pool[Math.floor(Math.random() * pool.length)]; if (grantTreasure(t.id)) items.push(t.n); }
  }
}
function offlineAdventure(sec) {
  const area = AREAS_DATA[state.currentArea];
  if (!area || state.realmIdx < area.realmReq) return null;
  const ms = area.monsters.filter(m => !m.isBoss); if (!ms.length) return null;
  const st = calculateTotalStats(), sp = state.battleSpeed || 1, cr = 1 + Math.min(st.crit, 100) / 200;
  let wr = 0, fs = 0;
  ms.forEach(m => {
    const d = Math.max(1, st.atk * st.atk / (st.atk + m.def)) * cr, turns = Math.ceil(m.hp / d);
    const loss = (m.atk * m.atk / (m.atk + st.def)) * 1.1 * turns;
    wr += Math.min(1, st.hp * .7 / loss) / ms.length; fs += (3 + turns * 1.5) / sp / ms.length;
  });
  if (wr < .15) return null;
  const steps = sec * .5 / (1.5 + .42 * fs), fights = Math.floor(steps * .42 * wr), n = fights / ms.length;
  let stones = steps * .14 * 27; const raw = {}, items = {};
  const herb = area.id >= 2 ? 'herb_2' : 'herb_1'; raw[herb] = steps * .14;
  const bonus = state.daoUpgrades?.['dao_drop'] ? 1.15 : 1;
  ms.forEach(m => (m.drops || []).forEach(d => { if (d.item === 'stone') stones += d.count * n; else raw[d.item] = (raw[d.item] || 0) + n * (d.chance || .5) * bonus; }));
  Object.keys(raw).forEach(k => { const c = Math.floor(raw[k]) + (Math.random() < raw[k] % 1 ? 1 : 0); if (c > 0 && ITEMS[k]) { addItem(k, c); items[ITEMS[k].name] = c; } });
  const eggs = petOK() ? Math.floor(fights * .04) : 0; if (eggs) { state.eggs = (state.eggs || 0) + eggs; items['靈寵蛋'] = eggs; }
  return { fights, stones: Math.floor(stones), items };
}
function bodyCost() { return Math.floor(150 * Math.pow(1.3, state.body || 0)); }
