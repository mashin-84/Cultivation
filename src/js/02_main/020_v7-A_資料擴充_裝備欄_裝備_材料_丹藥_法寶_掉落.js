/* ===== v7-A:資料擴充(裝備欄/裝備/材料/丹藥/法寶/掉落) ===== */
const TIER_NAME = ['青雲', '萬妖', '焚天', '雷崖', '縹緲', '九重天', '太虛', '混沌'];
const EQUIP_SLOTS = ['weapon', 'armor', 'helm', 'boots', 'artifact', 'pendant', 'ring'];
const SLOT_INFO = {
  weapon: { n: '武器', i: '⚔️', base: '飛劍', w: [1, .1, .6], f: .7 },
  armor: { n: '道袍', i: '🥋', base: '道袍', w: [.1, .6, 5], f: .7 },
  helm: { n: '道冠', i: '👑', base: '道冠', w: [.15, .5, 3.5], f: .45 },
  boots: { n: '雲履', i: '👢', base: '雲履', w: [.3, .35, 2.5], f: .45 },
  artifact: { n: '法器', i: '🔮', base: '法器', w: [.4, .35, 3.5], f: .7 },
  pendant: { n: '玉佩', i: '📿', base: '玉佩', w: [.25, .25, 4], f: .45 },
  ring: { n: '指環', i: '💍', base: '指環', w: [.5, .2, 2], f: .45 }
};
const TIER_PRE = ['青鋼', '玄鐵', '赤陽', '紫霄', '流霞', '九天', '瑤光', '混沌'];
const TIER_B = [40, 90, 170, 300, 460, 640, 960, 1500];
const TIER_Q = ['common', 'uncommon', 'rare', 'rare', 'epic', 'epic', 'immortal', 'immortal'];
const Q_COL = { common: '#e2e8f0', uncommon: '#34d399', rare: '#38bdf8', epic: '#fbbf24', immortal: '#67e8f9', mythic: '#f0abfc' };
const Q_NAME = { common: '凡品', uncommon: '良品', rare: '上品', epic: '極品', immortal: '仙品', mythic: '古仙遺品' };
EQUIP_SLOTS.forEach(slot => {
  const si = SLOT_INFO[slot];
  for (let t = 0; t < 8; t++) {
    const B = TIER_B[t] * si.f, st = { atk: Math.floor(B * si.w[0]), def: Math.floor(B * si.w[1]), hp: Math.floor(B * si.w[2]) };
    const nm = TIER_PRE[t] + si.base;
    ITEMS[`eg_${slot}_${t}`] = { id: `eg_${slot}_${t}`, name: nm, icon: si.i, type: 'equipment', slot, quality: TIER_Q[t], tier: t, ...st, price: Math.floor(TIER_B[t] * 2.2), desc: `${TIER_NAME[t]}一帶煉成的${si.n}。` };
    ITEMS[`ex_${slot}_${t}`] = { id: `ex_${slot}_${t}`, name: `古仙·${nm}`, icon: si.i, type: 'equipment', slot, quality: 'mythic', tier: t, atk: Math.floor(st.atk * 1.7), def: Math.floor(st.def * 1.7), hp: Math.floor(st.hp * 1.7), price: Math.floor(TIER_B[t] * 8), desc: `天地異種 寶箱開出的古仙遺物,遠勝同階${si.n}。` };
  }
});
/* ---- 新材料(每個區域 2 種) ---- */
const NEW_MATS = [
  ['青藤果', '🍇', '妖狼牙', '🦷'], ['幽谷蘭', '🪻', '幽蛟鱗', '🐲'], ['火蓮子', '🪷', '烈焰羽', '🪶'], ['雷霆花', '🌼', '雷鷹爪', '🦅'],
  ['雲霓草', '☁️', '仙鶴翎', '🕊️'], ['天闕靈芝', '🍄', '神龍鱗', '🐉'], ['瑤池蓮心', '🌺', '玉髓精', '💎'], ['混沌息壤', '🌑', '混沌精魄', '🔮']
];
NEW_MATS.forEach((m, t) => {
  const pr = Math.floor(8 * Math.pow(2.1, t));
  ITEMS[`hb_${t}`] = { id: `hb_${t}`, name: m[0], icon: m[1], type: 'material', price: pr, desc: `${TIER_NAME[t]}特產靈材,可煉${t ? '修為丹' : '悟道丹'}與各類丹藥。` };
  ITEMS[`bp_${t}`] = { id: `bp_${t}`, name: m[2], icon: m[3], type: 'material', price: pr, desc: `${TIER_NAME[t]}妖獸身上取得的材料,可煉丹藥與鍛造${TIER_PRE[t]}系列裝備。` };
});
/* ---- 新丹藥 ---- */
const YQ_VAL = [0, 6000, 40000, 200000, 1000000, 3600000, 7000000, 14000000];
const YQ_NAME = ['', '培元丹', '凝神丹', '化嬰丹', '悟道丹', '仙元丹', '玄元丹', '金霞丹'];
for (let t = 1; t < 8; t++) ITEMS[`yq_${t}`] = { id: `yq_${t}`, name: YQ_NAME[t], icon: '💊', type: 'consumable', price: Math.floor(YQ_VAL[t] / 40), val: YQ_VAL[t], desc: `第 ${t} 階修為丹:${TIER_NAME[t]}服用增加修為上限 12%,境界越高藥效越弱(只能服到圓滿;同層連服積丹毒)。` };
ITEMS.pp_hp = { id: 'pp_hp', name: '築骨丹', icon: '🟢', type: 'consumable', price: 900, desc: '服用後氣血永久 +1%(最多服用 20 枚)。' };
ITEMS.pp_atk = { id: 'pp_atk', name: '煉罡丹', icon: '🔴', type: 'consumable', price: 1500, desc: '服用後攻擊永久 +1%(最多服用 20 枚)。' };
ITEMS.pp_def = { id: 'pp_def', name: '玄甲丹', icon: '🔵', type: 'consumable', price: 2400, desc: '服用後防禦永久 +1%(最多服用 20 枚)。' };
ITEMS.sp_1 = { id: 'sp_1', name: '悟劍丹', icon: '📙', type: 'consumable', price: 300, desc: '服用後,已裝備神通各增加 6 點熟練度。' };
ITEMS.sp_3 = { id: 'sp_3', name: '通玄丹', icon: '📗', type: 'consumable', price: 3000, desc: '服用後,已裝備神通各增加 14 點熟練度。' };
ITEMS.sp_5 = { id: 'sp_5', name: '天機丹', icon: '📘', type: 'consumable', price: 30000, desc: '服用後,已裝備神通各增加 30 點熟練度。' };
const SP_EXP = { sp_1: 6, sp_3: 14, sp_5: 30 }, PP_KEY = { pp_hp: 'hp', pp_atk: 'atk', pp_def: 'def' }, PP_MAX = 20;
for (let t = 0; t < 8; t++) ITEMS[`wbox_${t}`] = { id: `wbox_${t}`, name: `古仙遺匣·${TIER_NAME[t]}`, icon: '🎁', type: 'chest', tier: t, quality: 'mythic', price: 0, desc: `天地異種 掉落的${TIER_NAME[t]}級寶箱,可開出符合境界的超稀有寶物。` };
const pillPerm = () => { const u = state.pillUse || {}; return { hp: (u.hp || 0) * .01, atk: (u.atk || 0) * .01, def: (u.def || 0) * .01 }; };
const _useItem0 = useItem;
useItem = function (key, all = false, quiet = false) {
  const it = ITEMS[key]; if (!it || !(state.inventory[key] > 0)) return _useItem0(key, all, quiet);
  if (key.startsWith('yq_')) return qiPillUse(key, all, quiet);
  let n = all ? state.inventory[key] : 1, msg = '';
  if (key.startsWith('yq_')) {
    const gain = it.val * n; state.inventory[key] -= n; state.qi += gain; state.totalCultivatedQi = (state.totalCultivatedQi || 0) + gain;
    msg = `服用${it.name} ×${n},修為增加 ${formatNum(gain)} 點!`;
  } else if (PP_KEY[key]) {
    state.pillUse = state.pillUse || { hp: 0, atk: 0, def: 0 }; const k = PP_KEY[key], room = PP_MAX - (state.pillUse[k] || 0);
    if (room <= 0) { if (!quiet) showToast(`${it.name}藥力已達上限(${PP_MAX} 枚)。`); return 0; }
    n = Math.min(n, room); state.inventory[key] -= n; state.pillUse[k] = (state.pillUse[k] || 0) + n;
    msg = `服下${it.name} ×${n},永久 +${n}%!(${state.pillUse[k]}/${PP_MAX})`;
  } else if (SP_EXP[key]) {
    const sk = skState(), eq = sk.equipped.filter(Boolean); let any = false;
    const per = SP_EXP[key];
    n = 1;
    eq.forEach(id => { const e = sk.learned[id]; if (!e) return; const need = skExpNeed(e.lv); if (e.exp < need) { e.exp = Math.min(need, e.exp + per); any = true; } });
    if (!any) { if (!quiet) showToast('已裝備的神通熟練度都已滿(或尚未裝備神通)。'); return 0; }
    state.inventory[key] -= 1; msg = `服下${it.name},已裝備神通熟練度大增!`;
  } else return _useItem0(key, all, quiet);
  if (state.inventory[key] <= 0) delete state.inventory[key];
  if (quiet) return n;
  showToast(msg); audio.playQiChime(); renderInventory(); updateTopBar(); saveGame(); return n;
};
/* ---- 配方 ---- */
const REC_TIER = { pill_1: 0, pill_4: 0, pill_2: 1, pill_3: 1, pill_5: 2, pill_6: 5, forge_1: 0, forge_2: 0, forge_3: 2, forge_4: 2, forge_5: 5, forge_6: 5, forge_7: 6 };
ALCHEMY_RECIPES.forEach(r => { r.tier = REC_TIER[r.id] || 0; r.kind = r.id === 'pill_2' || r.id === 'pill_5' ? 'perm' : r.id === 'pill_4' ? 'heal' : 'qi'; });
FORGE_RECIPES.forEach(r => { r.tier = REC_TIER[r.id] || 0; });
const nd = (id, c) => ({ item: id, name: ITEMS[id].name, count: c });
for (let t = 1; t < 8; t++) ALCHEMY_RECIPES.push({ id: `yq_${t}`, name: YQ_NAME[t], tier: t, kind: 'qi', need: [nd(`hb_${t}`, 5), nd(`bp_${t}`, 2)], giveId: `yq_${t}`, desc: `${TIER_NAME[t]}靈材凝練的丹藥,同階服用增加當前境界修為上限的 12%。` });
ALCHEMY_RECIPES.push(
  { id: 'pp_hp', name: '築骨丹', tier: 2, kind: 'perm', need: [nd('hb_2', 3), nd('bp_2', 2), nd('herb_4', 1)], giveId: 'pp_hp', desc: '氣血永久 +1%(最多 20 枚)。' },
  { id: 'pp_atk', name: '煉罡丹', tier: 3, kind: 'perm', need: [nd('hb_3', 3), nd('bp_3', 2), nd('ore_3', 1)], giveId: 'pp_atk', desc: '攻擊永久 +1%(最多 20 枚)。' },
  { id: 'pp_def', name: '玄甲丹', tier: 4, kind: 'perm', need: [nd('hb_4', 3), nd('bp_4', 2), nd('herb_2', 2)], giveId: 'pp_def', desc: '防禦永久 +1%(最多 20 枚)。' },
  { id: 'sp_1', name: '悟劍丹', tier: 1, kind: 'skill', need: [nd('hb_1', 2), nd('bp_1', 2)], giveId: 'sp_1', desc: '已裝備神通熟練度各 +6。' },
  { id: 'sp_3', name: '通玄丹', tier: 3, kind: 'skill', need: [nd('hb_3', 2), nd('bp_3', 2), nd('herb_3', 1)], giveId: 'sp_3', desc: '已裝備神通熟練度各 +14。' },
  { id: 'sp_5', name: '天機丹', tier: 5, kind: 'skill', need: [nd('hb_5', 2), nd('bp_5', 2), nd('herb_5', 1)], giveId: 'sp_5', desc: '已裝備神通熟練度各 +30。' }
);
const TIER_ORE = ['ore_1', 'ore_1', 'ore_2', 'ore_3', 'ore_3', 'ore_4', 'ore_4', 'ore_4'];
EQUIP_SLOTS.forEach(slot => { for (let t = 0; t < 8; t++) {
  const id = `eg_${slot}_${t}`, it = ITEMS[id], need = [nd(TIER_ORE[t], 3 + t), nd(`bp_${t}`, 2 + Math.floor(t / 2))];
  if (t >= 2) need.push(nd(`hb_${t}`, 1));
  FORGE_RECIPES.push({ id: 'forge_' + id, name: it.name, slot, tier: t, giveItem: id, need, desc: `【${TIER_NAME[t]}·${Q_NAME[it.quality]}】` });
} });
/* ---- 區域掉落 ---- */
AREAS_DATA.forEach((a, t) => a.monsters.forEach(m => {
  m.drops = m.drops || [];
  m.drops.push({ item: `hb_${t}`, chance: m.isBoss ? 1 : .5 }, { item: `bp_${t}`, chance: m.isBoss ? 1 : .5 });
}));
/* ---- 法寶擴充至 32 件 ---- */
const T_SRC_NAME = { clear: '秘境首通', frag: '殘片合成', tower: '九九登天塔', wb: '天地異種寶箱', dao: '道心閣兌換' };
const NEW_T = [
  ['乾元鼎', '🏺', { hpP: .03, qiP: .02 }], ['太乙拂塵', '🪭', { atkP: .03 }], ['玄武甲片', '🐢', { defP: .04 }], ['離火幡', '🚩', { atkP: .03, crit: 1 }],
  ['坎水珠', '💧', { hpP: .04 }], ['巽風羽扇', '🪽', { atkP: .035 }], ['艮山印', '⛰️', { defP: .045 }], ['兌澤鈴', '🔔', { hpP: .03, defP: .02 }],
  ['震雷鼓', '🥁', { atkP: .04, crit: 2 }], ['坤元盤', '🧭', { hpP: .04, defP: .03 }]
].map((x, k) => ({ id: 't' + (8 + k), n: x[0], i: x[1], ...x[2], src: 99, how: 'frag', cost: 15 + 5 * k }));
[['登塔令', '🎫', { hpP: .04, atkP: .03 }], ['鎮塔碑', '🪦', { defP: .06 }], ['破虛梭', '🪡', { atkP: .06, crit: 3 }], ['九轉燈', '🏮', { hpP: .07, qiP: .04 }], ['星河盤', '🌌', { atkP: .05, defP: .05, hpP: .05 }], ['天塔核心', '💠', { atkP: .08, defP: .08, hpP: .08 }]]
  .forEach((x, k) => NEW_T.push({ id: 't' + (18 + k), n: x[0], i: x[1], ...x[2], src: 99, how: 'tower', floor: [18, 36, 54, 72, 90, 100][k] }));
[['世界樹種', '🌱', { hpP: .08, qiP: .06 }], ['弒神戟', '🔱', { atkP: .09, crit: 4 }], ['天道殘卷', '📜', { qiP: .10, atkP: .04 }], ['太古龍珠', '🐲', { hpP: .09, defP: .09, atkP: .05 }]]
  .forEach((x, k) => NEW_T.push({ id: 't' + (24 + k), n: x[0], i: x[1], ...x[2], src: 99, how: 'wb' }));
[['輪迴盞', '🍶', { qiP: .05, hpP: .04 }, 3], ['因果線', '🧵', { crit: 3, atkP: .04 }, 5], ['忘川水', '🌊', { defP: .06, hpP: .06 }, 8], ['道心石', '🪨', { atkP: .06, defP: .06, hpP: .06, qiP: .06 }, 12]]
  .forEach((x, k) => NEW_T.push({ id: 't' + (28 + k), n: x[0], i: x[1], ...x[2], src: 99, how: 'dao', cost: x[3] }));
TREASURES.forEach((t, i) => { t.how = 'clear'; });
NEW_T.forEach(t => TREASURES.push(t));
const T_SHAPES = [
  '<circle cx="32" cy="32" r="20" fill="url(#G)"/><circle cx="25" cy="25" r="5" fill="#fff" opacity=".6"/><path d="M12 54 h40" stroke="#fbbf24" stroke-width="3"/>',
  '<path d="M32 8 c-12 0 -16 10 -16 22 v10 h32 v-10 c0 -12 -4 -22 -16 -22z" fill="url(#G)"/><circle cx="32" cy="46" r="4" fill="#fff"/><path d="M28 6 h8" stroke="#fbbf24" stroke-width="3"/>',
  '<path d="M32 54 L8 22 a30 30 0 0 1 48 0z" fill="url(#G)"/><path d="M32 54 L20 20 M32 54 L32 16 M32 54 L44 20" stroke="#fff" stroke-width="1.5" opacity=".6"/>',
  '<path d="M14 26 h36 l-4 18 a14 14 0 0 1 -28 0z" fill="url(#G)"/><path d="M18 52 l-4 8 M46 52 l4 8" stroke="#fbbf24" stroke-width="3"/><path d="M20 22 h24" stroke="#fff" stroke-width="3" opacity=".7"/>',
  '<rect x="14" y="10" width="36" height="44" rx="4" fill="url(#G)"/><path d="M20 20 h24 M20 28 h24 M20 36 h16" stroke="#fff" stroke-width="2.5" opacity=".7"/><rect x="10" y="8" width="44" height="5" rx="2" fill="#fbbf24"/>',
  '<circle cx="32" cy="32" r="22" fill="none" stroke="url(#G)" stroke-width="5"/><circle cx="32" cy="32" r="12" fill="url(#G)"/><path d="M32 6 v8 M32 50 v8 M6 32 h8 M50 32 h8" stroke="#fff" stroke-width="2.5"/>',
  '<path d="M32 6 v54" stroke="#fbbf24" stroke-width="3"/><path d="M32 10 c14 2 18 12 12 22 c-4 -6 -8 -8 -12 -8z" fill="url(#G)"/><path d="M32 18 c-10 0 -14 8 -10 16 c4 -4 6 -6 10 -6z" fill="url(#G)" opacity=".8"/>',
  '<path d="M32 6 l7 17 l18 2 l-14 12 l5 18 l-16 -10 l-16 10 l5 -18 l-14 -12 l18 -2z" fill="url(#G)"/><circle cx="32" cy="32" r="5" fill="#fff" opacity=".8"/>'
];
const T_PAL = [['#fde68a', '#b45309'], ['#7dd3fc', '#1d4ed8'], ['#86efac', '#15803d'], ['#f9a8d4', '#be185d'], ['#c4b5fd', '#6d28d9'], ['#fca5a5', '#b91c1c'], ['#a5f3fc', '#0e7490'], ['#e2e8f0', '#475569']];
NEW_T.forEach((t, j) => { const p = T_PAL[(j * 3) % 8]; TREASURE_ART[t.id] = [p[0], p[1], T_SHAPES[j % 8]]; });
function setBonus(n) { return n >= 32 ? .42 : n >= 28 ? .36 : n >= 24 ? .31 : n >= 20 ? .26 : n >= 16 ? .22 : n >= 12 ? .18 : n >= 8 ? .15 : n >= 4 ? .05 : 0; }
const SET_STEPS = [4, 8, 12, 16, 20, 24, 28, 32];
/* ---- 掉落擴充:裝備與法寶殘片 ---- */
const _extOnWin0 = extOnWin;
extOnWin = function (m, items) {
  _extOnWin0(m, items);
  const t = Math.min(7, Math.max(0, state.currentArea || 0));
  if (Math.random() < (m.isBoss ? .18 : .03)) {
    const slot = EQUIP_SLOTS[Math.floor(Math.random() * EQUIP_SLOTS.length)], id = `eg_${slot}_${t}`;
    state.inventory[id] = (state.inventory[id] || 0) + 1; items.push(ITEMS[id].name);
  }
  if (treOK() && Math.random() < (m.isBoss ? .45 : .07)) { const n = m.isBoss ? 2 + Math.floor(Math.random() * 3) : 1; state.tfrag = (state.tfrag || 0) + n; items.push(`🧩法寶殘片×${n}`); }
};

