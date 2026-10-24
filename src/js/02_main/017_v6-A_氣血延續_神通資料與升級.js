/* ===== v6-A:氣血延續 / 神通資料與升級 ===== */
/* ---------- 氣血系統(戰鬥之間延續,自動服藥、調息) ---------- */
function curHp(st) { st = st || calculateTotalStats(); return state.hp == null || !Number.isFinite(state.hp) ? st.hp : Math.max(1, Math.min(st.hp, state.hp)); }
function setHp(v, st) { st = st || calculateTotalStats(); state.hp = Math.max(1, Math.min(st.hp, Math.floor(v))); }
function pillHeal(st) { return Math.max(ITEMS['pill_4']?.val || 200, Math.floor((st || calculateTotalStats()).hp * 0.3)); }
function usePillOutside(auto) {
  if ((state.inventory['pill_4'] || 0) <= 0) { if (!auto) showToast('儲物袋內沒有回春丹!'); return false; }
  const st = calculateTotalStats();
  if (curHp(st) >= st.hp) { if (!auto) showToast('氣血已滿,無需服藥。'); return false; }
  state.inventory['pill_4']--; if (state.inventory['pill_4'] <= 0) delete state.inventory['pill_4'];
  const h = pillHeal(st); setHp(curHp(st) + h, st);
  logAdventure(`💊 ${auto ? '自動' : ''}吞服回春丹,氣血恢復 ${formatNum(h)} 點。`);
  if (!auto) { showToast(`吞服回春丹,氣血恢復 ${formatNum(h)} 點`); audio.playQiChime(); }
  renderInventory(); renderHpBar();
  return true;
}
function regenHp(dt) {
  if (currentBattle || state.hp == null) return;
  const st = calculateTotalStats();
  if (!Number.isFinite(state.hp) || state.hp >= st.hp) { state.hp = null; return; }
  state.hp = Math.min(st.hp, state.hp + st.hp * 0.012 * dt);
}
// 探索前的氣血關卡:回傳 true 表示本步被擋下
function hpGate(st) {
  if (state.autoExplore && state.autoPill !== false && curHp(st) < st.hp * 0.45) usePillOutside(true);
  const h = curHp(st);
  if (h < st.hp * 0.3) {
    const need = Math.ceil((st.hp * 0.45 - h) / (st.hp * 0.012));
    if (state.autoExplore) adventureNotice(`🧘 氣血僅剩 ${Math.floor(h / st.hp * 100)}%,調息中…約 ${need} 秒後繼續`);
    else showToast(`氣血過低(${Math.floor(h / st.hp * 100)}%),請服藥或調息約 ${need} 秒再出發`);
    return true;
  }
  return false;
}
function renderHpBar() {
  const f = document.getElementById('hp-fill'); if (!f) return;
  const st = calculateTotalStats(), h = curHp(st), p = Math.max(0, Math.min(100, h / st.hp * 100));
  f.style.width = p + '%'; f.style.background = p < 30 ? '#ef4444' : p < 60 ? '#f59e0b' : '#10b981';
  document.getElementById('hp-text').innerText = `氣血 ${formatNum(h)} / ${formatNum(st.hp)}${currentBattle ? '(戰鬥中)' : h < st.hp ? '(調息中)' : ''}`;
  const n = state.inventory['pill_4'] || 0, b = document.getElementById('btn-use-heal'); if (b) b.innerText = `💊 療傷藥 ×${n}`;
  const a = document.getElementById('btn-auto-pill'); if (a) a.innerText = `自動療傷:${state.autoPill === false ? '關' : '開'}`;
}
/* ---------- 神通 ---------- */
const SKILLS = [
  { id: 'sk_sword', name: '青雲劍訣', el: 'metal', type: 'atk', hits: 1, mult: 1.8, cd: 3, realm: 0, cost: 0, fx: 'slash', lore: '青雲宗入門劍訣,一劍凌空,清越如鳴。' },
  { id: 'sk_flow', name: '流雲劍影', el: 'wood', type: 'atk', hits: 3, mult: 0.75, cd: 4, realm: 0, cost: 400, fx: 'flow', lore: '劍隨雲走,三影連環,專破輕甲。' },
  { id: 'sk_fire', name: '烈焰焚天', el: 'fire', type: 'burn', mult: 1.3, dot: 0.35, turns: 3, cd: 4, realm: 1, cost: 2500, fx: 'fire', lore: '地火入劍,敵人身中業火,數回合不熄。' },
  { id: 'sk_ice', name: '玄冰封印', el: 'water', type: 'stun', mult: 1.2, stun: 1, cd: 5, realm: 1, cost: 2500, fx: 'ice', lore: '寒氣凝霜,冰封敵身,使其失去一次行動。(Boss 有機率抵抗)' },
  { id: 'sk_guard', name: '金剛護體', el: 'earth', type: 'shield', pct: 0.35, cd: 5, realm: 1, cost: 2000, fx: 'guard', lore: '金剛不壞之氣,化為護盾吸收傷害。' },
  { id: 'sk_heal', name: '回春訣', el: 'wood', type: 'heal', pct: 0.25, cd: 5, realm: 1, cost: 2000, fx: 'heal', lore: '草木生機入體,戰鬥中回復氣血。' },
  { id: 'sk_thunder', name: '天雷訣', el: 'metal', type: 'atk', hits: 1, mult: 2.8, cd: 5, realm: 2, cost: 12000, fx: 'thunder', lore: '引九天雷霆入劍,一擊轟頂。' },
  { id: 'sk_blood', name: '噬血魔功', el: 'fire', type: 'drain', mult: 1.7, steal: 0.5, cd: 4, realm: 2, cost: 12000, fx: 'blood', lore: '魔功噬血,傷敵同時奪其精氣回補自身。' },
  { id: 'sk_rage', name: '戰意沸騰', el: null, type: 'buff', pct: 0.45, turns: 3, cd: 6, realm: 2, cost: 10000, fx: 'rage', lore: '氣血翻湧,數回合內攻擊大幅提升。' },
  { id: 'sk_swords', name: '萬劍歸宗', el: 'metal', type: 'atk', hits: 5, mult: 0.7, cd: 6, realm: 3, cost: 60000, fx: 'swords', lore: '萬劍齊落,漫天劍雨。' },
  { id: 'sk_quake', name: '地裂山崩', el: 'earth', type: 'stun', mult: 2.0, stun: 1, cd: 6, realm: 3, cost: 60000, fx: 'quake', lore: '撼動大地,震暈敵人並造成重擊。' },
  { id: 'sk_god', name: '九天神雷', el: 'water', type: 'atk', hits: 1, mult: 4.8, cd: 8, realm: 4, cost: 250000, fx: 'god', lore: '召九天神雷降世,威能驚天。' },
  { id: 'sk_void', name: '太上忘情', el: null, type: 'stun', mult: 3.5, stun: 2, cd: 9, realm: 5, cost: 1200000, fx: 'void', lore: '仙人絕學,忘情一劍,可使敵人定身兩回合。(Boss 至多一回合)' },
  { id: 'sk_chaos', name: '混元護體', el: 'earth', type: 'shield', pct: 0.6, cd: 7, realm: 6, cost: 1200000, fx: 'chaos', lore: '混元無極之氣,化為近乎無敵的護罩。' }
];
const SK_BY_ID = {}; SKILLS.forEach(s => SK_BY_ID[s.id] = s);
const SK_EL = { metal: '金', wood: '木', water: '水', fire: '火', earth: '土' };
const SK_EL_COLOR = { metal: '#e2e8f0', wood: '#4ade80', water: '#38bdf8', fire: '#fb923c', earth: '#fbbf24' };
const SK_TYPE = { atk: '攻擊', burn: '灼燒', stun: '控制', shield: '護體', heal: '療傷', drain: '吸血', buff: '增益' };
const SK_ART = {
  sk_sword: ['#e2e8f0', '#64748b', '<path d="M14 50 L46 12" stroke="url(#G)" stroke-width="5" stroke-linecap="round"/><path d="M10 54 l8 -3 l-3 -8z" fill="#fbbf24"/><path d="M42 8 q10 2 14 12" stroke="#fff" stroke-width="2" fill="none" opacity=".6"/>'],
  sk_flow: ['#86efac', '#15803d', '<path d="M8 44 q20 -6 48 -26" stroke="url(#G)" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M8 54 q22 -6 48 -26" stroke="url(#G)" stroke-width="3.5" fill="none" stroke-linecap="round" opacity=".8"/><path d="M14 34 q18 -4 40 -22" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".7"/>'],
  sk_fire: ['#fb923c', '#b91c1c', '<path d="M32 6 c8 10 16 16 10 28 c-3 6 -6 3 -6 -3 c-7 3 -16 -3 -9 -15 c2 -4 4 -6 5 -10z" fill="url(#G)"/><path d="M32 24 c4 7 8 10 5 17 c-5 3 -11 -3 -5 -17z" fill="#fde047"/><path d="M18 58 h28" stroke="#7f1d1d" stroke-width="3"/>'],
  sk_ice: ['#bae6fd', '#0369a1', '<path d="M32 6 v52 M10 19 l44 26 M54 19 l-44 26" stroke="url(#G)" stroke-width="4" stroke-linecap="round"/><path d="M26 10 l6 6 l6 -6 M26 54 l6 -6 l6 6" stroke="#fff" stroke-width="2.5" fill="none"/><circle cx="32" cy="32" r="5" fill="#fff"/>'],
  sk_guard: ['#fde68a', '#a16207', '<path d="M32 6 L54 14 v18 c0 14 -10 22 -22 26 c-12 -4 -22 -12 -22 -26 v-18z" fill="url(#G)"/><path d="M32 14 v38 M18 28 h28" stroke="#78350f" stroke-width="3" opacity=".6"/>'],
  sk_heal: ['#86efac', '#047857', '<path d="M32 58 c-18 -10 -22 -26 -12 -38 c6 -6 12 -4 12 4 c0 -8 6 -10 12 -4 c10 12 6 28 -12 38z" fill="url(#G)"/><path d="M32 24 v18 M23 33 h18" stroke="#fff" stroke-width="4" stroke-linecap="round"/>'],
  sk_thunder: ['#fde047', '#a16207', '<path d="M36 4 L16 36 h12 l-4 24 L48 26 H35z" fill="url(#G)" stroke="#fff" stroke-width="1.5"/>'],
  sk_blood: ['#fb7185', '#7f1d1d', '<path d="M32 6 c10 14 18 22 18 34 a18 18 0 0 1 -36 0 c0 -12 8 -20 18 -34z" fill="url(#G)"/><path d="M24 40 q4 8 12 6" stroke="#fff" stroke-width="3" fill="none" opacity=".6"/><path d="M26 46 l3 8 l3 -8 M34 46 l3 8 l3 -8" stroke="#fff" stroke-width="2" fill="none"/>'],
  sk_rage: ['#f87171', '#991b1b', '<circle cx="32" cy="32" r="14" fill="url(#G)"/><path d="M32 2 l4 12 l12 -6 l-6 12 l12 4 l-12 4 l6 12 l-12 -6 l-4 12 l-4 -12 l-12 6 l6 -12 l-12 -4 l12 -4 l-6 -12 l12 6z" fill="#fbbf24" opacity=".75"/><circle cx="32" cy="32" r="8" fill="#fff" opacity=".7"/>'],
  sk_swords: ['#c7d2fe', '#4338ca', '<g stroke="url(#G)" stroke-width="3.5" stroke-linecap="round"><path d="M32 6 v34"/><path d="M16 12 l6 30"/><path d="M48 12 l-6 30"/><path d="M6 22 l12 26"/><path d="M58 22 l-12 26"/></g><path d="M20 52 h24" stroke="#fbbf24" stroke-width="4"/>'],
  sk_quake: ['#fcd34d', '#78350f', '<path d="M4 52 l14 -22 l8 10 l10 -26 l10 22 l6 -8 l8 24z" fill="url(#G)"/><path d="M32 40 l-6 8 l8 4 l-4 8" stroke="#1c1917" stroke-width="3" fill="none"/>'],
  sk_god: ['#7dd3fc', '#1e3a8a', '<path d="M12 28 a10 10 0 0 1 4 -18 a12 12 0 0 1 24 -2 a10 10 0 0 1 12 18z" fill="url(#G)"/><path d="M34 26 L22 46 h9 l-3 14 L44 38 h-9z" fill="#fde047" stroke="#fff" stroke-width="1.2"/>'],
  sk_void: ['#c4b5fd', '#4c1d95', '<circle cx="32" cy="32" r="22" fill="#0f172a" stroke="url(#G)" stroke-width="3"/><path d="M32 10 a22 22 0 0 1 0 44 a11 11 0 0 1 0 -22 a11 11 0 0 0 0 -22z" fill="url(#G)"/><circle cx="32" cy="21" r="3" fill="#0f172a"/><circle cx="32" cy="43" r="3" fill="#fff"/>'],
  sk_chaos: ['#fde68a', '#92400e', '<circle cx="32" cy="32" r="26" fill="none" stroke="url(#G)" stroke-width="3" stroke-dasharray="6 4"/><circle cx="32" cy="32" r="18" fill="none" stroke="url(#G)" stroke-width="4"/><circle cx="32" cy="32" r="9" fill="url(#G)"/><path d="M32 4 v8 M32 52 v8 M4 32 h8 M52 32 h8" stroke="#fff" stroke-width="2.5"/>']
};
function skArt(id, lock) { const a = SK_ART[id]; return lock ? art(a[2], '#475569', '#1e293b') : art(a[2], a[0], a[1]); }
function skState() {
  if (!state.skills || !state.skills.learned) state.skills = { learned: { sk_sword: { lv: 1, exp: 0 } }, equipped: ['sk_sword', null, null, null] };
  if (!Array.isArray(state.skills.equipped)) state.skills.equipped = ['sk_sword', null, null, null];
  while (state.skills.equipped.length < 4) state.skills.equipped.push(null);
  return state.skills;
}
function skSlots() { return 2 + ((state.realmIdx || 0) >= 2 ? 1 : 0) + ((state.realmIdx || 0) >= 4 ? 1 : 0); }
function skCap() { return Math.min(10, 3 + (state.realmIdx || 0)); }
function skExpNeed(lv) { return 8 + lv * 4; }
function skUpCost(sk, lv) { return Math.floor(Math.max(300, sk.cost * 0.5) * Math.pow(1.55, lv - 1)); }
function skCalc(sk, lv) {
  lv = lv || 1; const g = 1 + 0.10 * (lv - 1), big = lv >= 10, ext = big ? 1.35 : 1, o = { lv, cd: Math.max(1, sk.cd - (lv >= 5 ? 1 : 0)) };
  if (sk.type === 'atk') { o.hits = sk.hits; o.mult = sk.mult * g * ext; }
  else if (sk.type === 'burn') { o.mult = sk.mult * g * ext; o.dot = sk.dot * g * ext; o.turns = sk.turns + (big ? 1 : 0); }
  else if (sk.type === 'stun') { o.mult = sk.mult * g * ext; o.stun = sk.stun + (big ? 1 : 0); }
  else if (sk.type === 'drain') { o.mult = sk.mult * g * ext; o.steal = Math.min(0.9, sk.steal + 0.02 * (lv - 1) + (big ? 0.1 : 0)); }
  else if (sk.type === 'shield' || sk.type === 'heal') { o.pct = Math.min(0.9, sk.pct * (1 + 0.08 * (lv - 1)) * ext); }
  else if (sk.type === 'buff') { o.pct = sk.pct * (1 + 0.06 * (lv - 1)) * (big ? 1.2 : 1); o.turns = sk.turns + (big ? 1 : 0); }
  return o;
}
const p100 = v => Math.round(v * 100);
function skHead(sk, lv) {
  const c = skCalc(sk, lv);
  switch (sk.type) {
    case 'atk': return c.hits > 1 ? `${c.hits}連擊 每擊${p100(c.mult)}%` : `傷害 ${p100(c.mult)}%`;
    case 'burn': return `傷害 ${p100(c.mult)}% + 灼燒 ${p100(c.dot)}%×${c.turns}回`;
    case 'stun': return `傷害 ${p100(c.mult)}% + 定身${c.stun}回`;
    case 'drain': return `傷害 ${p100(c.mult)}% + 吸血${p100(c.steal)}%`;
    case 'shield': return `護盾 氣血${p100(c.pct)}%`;
    case 'heal': return `回復 氣血${p100(c.pct)}%`;
    case 'buff': return `攻擊 +${p100(c.pct)}% ${c.turns}回`;
  }
  return '';
}
function skScore(id) { const sk = SK_BY_ID[id], c = skCalc(sk, (skState().learned[id] || {}).lv || 1); return (c.hits || 1) * (c.mult || 0) * (sk.type === 'drain' ? 1.2 : 1) * (sk.type === 'stun' ? 1.15 : 1) * (sk.type === 'burn' ? 1.2 : 1) / 1; }
function skGainExp(id) {
  const e = skState().learned[id]; if (!e) return;
  const need = skExpNeed(e.lv);
  if (e.exp < need) { e.exp++; if (e.exp >= need && e.lv < skCap() && e.lv < 10) showToast(`【${SK_BY_ID[id].name}】熟練度已滿,可前往功法→神通領悟升級!`); }
}
let _skSig = '', skView = 'learned';
function skCanUp(id) { const e = skState().learned[id]; if (!e) return false; const sk = SK_BY_ID[id]; return e.lv < 10 && e.lv < skCap() && e.exp >= skExpNeed(e.lv) && state.stones >= skUpCost(sk, e.lv); }
function skAnyAlert() {
  const S = skState();
  if (SKILLS.some(s => S.learned[s.id] && skCanUp(s.id))) return true;
  if (SKILLS.some(s => !S.learned[s.id] && state.realmIdx >= s.realm && state.stones >= s.cost)) return true;
  const free = S.equipped.slice(0, skSlots()).some(x => !x);
  return free && SKILLS.some(s => S.learned[s.id] && !S.equipped.includes(s.id));
}
// 神通面板:實作在 v10.2 功法整併(054,XT.skills)。原 v6-A 版與 v7.1「一鍵領悟」包裝已被它完整取代,重構時移除。
function renderSkills(force) { XT.skills && XT.skills(force); }
function skAct(a, id) {
  const S = skState();
  if (a === 'view') { skView = id; renderSkills(true); return; }
  const sk = SK_BY_ID[id]; if (!sk && a !== 'view') return;
  if (a === 'skill-learn') {
    if (S.learned[id] || state.realmIdx < sk.realm || state.stones < sk.cost) return;
    state.stones -= sk.cost; S.learned[id] = { lv: 1, exp: 0 };
    const i = S.equipped.slice(0, skSlots()).findIndex(x => !x); if (i >= 0) S.equipped[i] = id;
    audio.playFanfare(); showToast(`領悟神通【${sk.name}】!${i >= 0 ? '已自動裝備' : ''}`);
  } else if (a === 'equip') {
    if (!S.learned[id] || S.equipped.slice(0, skSlots()).includes(id)) return;
    const i = S.equipped.slice(0, skSlots()).findIndex(x => !x);
    if (i < 0) { showToast('神通欄位已滿,請先卸下一個。'); return; }
    S.equipped[i] = id;
  } else if (a === 'unequip') { const i = S.equipped.indexOf(id); if (i >= 0) S.equipped[i] = null; }
  else if (a === 'skill-up') {
    const e = S.learned[id]; if (!skCanUp(id)) return;
    state.stones -= skUpCost(sk, e.lv); e.lv++; e.exp = 0; audio.playFanfare();
    showToast(e.lv === 10 ? `【${sk.name}】臻至大成!` : e.lv === 5 ? `【${sk.name}】小成!冷卻 -1` : `【${sk.name}】領悟至 Lv.${e.lv}`);
  }
  updateTopBar(); renderSkills(true); saveGame();
}

