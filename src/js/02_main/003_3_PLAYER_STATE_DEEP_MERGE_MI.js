/* ==========================================================================
   3. PLAYER STATE, DEEP MERGE & MIGRATION (FIX-B5, FIX-B8, OPT-O8)
   ========================================================================== */
const SAVE_VERSION = 2; // FIX-B5
const AGE_TICK_SECONDS = 600; // FIX-B8: 600秒真實時間 = 1歲

const defaultState = {
  saveVersion: SAVE_VERSION,
  name: '',
  realmIdx: 0,
  subRealm: 1,
  qi: 0,
  stones: 120,
  age: 18,
  maxAge: 100,
  ageTimer: 0, // 累計秒數
  root: { metal: 35, wood: 45, water: 55, fire: 60, earth: 30 },
  arrayLevel: 1,
  insightLevel: 1, // OPT-O3: 悟性等級
  baseQiRate: 5,
  bonusQiRate: 0,
  permQiRate: 0,
  techniques: [
    { id: 'tech_1', level: 1, learned: true } // FIX-B5: 只存進度
  ],
  talents: {}, // OPT-O7: { talent_1: 1, ... }
  talFix: false, sectGift: false, guide: { done: {}, skip: {}, hide: false, v: 0 }, // v9.2
  daoPoints: 0, // OPT-O8: 轉世道心點
  daoUpgrades: {}, // OPT-O8: { dao_qi: 1, ... }
  reincarnationCount: 0, // OPT-O8
  totalCultivatedQi: 0,
  tribCount: 0,
  tribFailStreak: 0, // FIX-B1: 天劫失敗保底次數
  demonDefeated: false, // OPT-O3: 心魔劫狀態
  ascended: false, // 是否已飛升仙界
  ascensionCount: 0, // 累計飛升次數(轉世後保留)
  body: 0, // 煉體層數
  treasures: {}, // 法寶 {id:true}
  pets: {}, // 靈寵 {id:{lv}}
  activePet: null,
  eggs: 0,
  hp: null, // v6: 當前氣血(null=滿)
  autoPill: true,
  skills: { learned: { sk_sword: { lv: 1, exp: 0 } }, equipped: ['sk_sword', null, null, null] },
  tower: { floor: 1, best: 0 },
  towerMode: false,
  tut2: { sk: false, ming: false },
  uiSeen: { treas: 0 },
  lastExport: 0,
  tfrag: 0, // v7 法寶殘片
  calib9: 0, // v7.8 戰力曲線校準旗標
  un9: {}, un9init: 0, // v7.9 系統開放
  align: 0, sect: null, sectGrad: {}, sectSk: {}, // v8.0 宗門
  gender: null, look: 'o1', wardrobe: ['o1'], lookSeen: ['o1'], // v8.2 形象
  st15: {}, garden: { plots: [], lv: 0, auto: true }, dex: { m: {}, i: {}, c: {} }, titles: { got: {}, eq: null, seen: {} }, lite: false, // v8.5 靈田/圖鑑/稱號/統計
  aff: {}, affBuy: { d: '', n: 0 }, // v8.6 器紋
  sr: { d: 0, runs: {}, streak: 0, full: 0, last: 0 }, // v8.7 秘境
  xian: 0, xianTot: 0, shen: {}, guo: {}, jie: {}, xshop: {}, // v8.8 天機悟道
  sch: { main: null, sub: null, nodes: {}, dao: 0, daoTot: 0, sw: 0, rc: 0, trial: {}, ar: {} }, // v9.0 流派/戰場
  furnace: { on: false, mode: 'rn', keep: 30, tot: 0, rn: 0, st: 0, qi: 0, d: '', n: 0, rem: 0 }, // v9.6 乾坤熔爐
  bossMode: 'ask', // v9.7 境主/天地異種 戰鬥方式
  story27: { ch: 1, flags: {}, key: {}, picks: {}, score: { t: 0, r: 0, y: 0 }, bond: { mo: 0, su: 0, ye: 0, ba: 0 }, seen: {}, log: [], ending: null, cycle: 1, spd: 1, auto: false }, // v11.0 主線劇情
  tPend: [], // v13.1 首通法寶暫存(法寶解鎖後補發)
  pillUse: { hp: 0, atk: 0, def: 0 }, // v7 永久丹藥已服數
  rootLock: {}, // v7 靈根鎖定
  wb: { lv: 0, cur: null }, // v7 天地異種
  storySeen: {},
  soundEnabled: true,
  soundVolume: 50,
  inventory: {
    'herb_1': 4,
    'ore_1': 2,
    'pill_1': 1
  },
  equipment: {
    weapon: null,    // FIX-B4: 只存 itemId 字串
    armor: null,
    helm: null, boots: null, artifact: null, pendant: null, ring: null // v7 七欄
  },
  enhance: {
    weapon: 0, armor: 0, helm: 0, boots: 0, artifact: 0, pendant: 0, ring: 0
  },
  currentArea: 0,
  exploreStep: 1,
  areaFirstClear: {},
  dailyDate: '',
  dailyProgress: { quest_tap: 0, quest_explore: 0, quest_alchemy: 0 },
  dailyClaimed: { quest_tap: false, quest_explore: false, quest_alchemy: false },
  achievementsClaimed: {},
  tutorialStep: 0,
  autoExplore: false,
  pendingEvents: [],
  autoBattle: true,
  battleSpeed: 1,
  bossCooldownUntil: 0,
  pillTox: 0,
  lastSave: Date.now()
};

let state = JSON.parse(JSON.stringify(defaultState));

// FIX-B5: 深度合併工具函式
function deepMerge(target, source) {
  if (typeof target !== 'object' || target === null) return source;
  if (typeof source !== 'object' || source === null) return target;
  const output = Array.isArray(target) ? [...target] : Object.assign({}, target);
  for (const key of Object.keys(source)) {
    const sVal = source[key];
    const tVal = target[key];
    if (sVal === null) {
      // FIX: 存檔中的 null(例如卸下的裝備)必須能覆蓋預設值,但預設為物件時保留預設結構
      if (tVal === null || typeof tVal !== 'object') output[key] = null;
    } else if (sVal !== undefined) {
      if (typeof sVal === 'object' && !Array.isArray(sVal)) {
        output[key] = deepMerge(tVal || {}, sVal);
      } else {
        output[key] = sVal;
      }
    }
  }
  return output;
}

// FIX-B5: 存檔版本遷移
function migrateSave(parsed) {
  if (!parsed || typeof parsed !== 'object') return JSON.parse(JSON.stringify(defaultState));

  // 若為舊版 V1 (無 saveVersion 或 saveVersion < 2)
  if (!parsed.saveVersion || parsed.saveVersion < 2) {
    console.log('Migrating save from V1 to V2...');
    parsed.saveVersion = 2;
    // 遷移裝備：舊版為物件，轉為 itemId 字串
    if (parsed.equipment) {
      ['weapon', 'armor', 'artifact'].forEach(slot => {
        if (parsed.equipment[slot] && typeof parsed.equipment[slot] === 'object') {
          const oldName = parsed.equipment[slot].name || '';
          if (oldName.includes('青鋒')) parsed.equipment[slot] = 'equip_sword_1';
          else if (oldName.includes('道袍')) parsed.equipment[slot] = 'equip_armor_1';
          else if (oldName.includes('赤陽')) parsed.equipment[slot] = 'equip_sword_2';
          else if (oldName.includes('戒') || oldName.includes('令')) parsed.equipment[slot] = 'equip_art_1';
          else parsed.equipment[slot] = null;
        }
      });
    }
    // 遷移功法：舊版存了完整物件，簡化為 { id, level, learned }
    if (Array.isArray(parsed.techniques)) {
      parsed.techniques = parsed.techniques.map(t => ({
        id: t.id || 'tech_1',
        level: Number.isFinite(t.level) ? Math.max(0, t.level) : 1,
        learned: Boolean(t.learned)
      }));
    }
  }

  // 深度合併預設值
  let merged = deepMerge(defaultState, parsed);

  // 防呆檢查：NaN、小於0校正
  ['qi', 'stones', 'age', 'maxAge', 'realmIdx', 'subRealm', 'arrayLevel', 'insightLevel'].forEach(key => {
    if (!Number.isFinite(merged[key]) || merged[key] < 0) {
      merged[key] = defaultState[key];
    }
  });

  if (merged.realmIdx >= 5) merged.ascended = true; // 舊存檔相容

  return merged;
}

function saveGame() {
  if (!window.__LOADED112) return;   // v112 讀檔完成前不准寫入(避免空白進度蓋掉存檔)
  state.lastSave = Date.now();
  try {
    localStorage.setItem('XIUXIAN_SAVE_V2', JSON.stringify(state));
    backupTick();
  } catch (e) {
    console.warn('Storage save failed:', e);
  }
}

function loadGame() {
  try {
    let raw = localStorage.getItem('XIUXIAN_SAVE_V2');
    if (!raw) {
      // 嘗試讀取舊版 V1
      raw = localStorage.getItem('XIUXIAN_SAVE_DATA_V1');
    }
    if (raw) {
      const parsed = JSON.parse(raw);
      state = migrateSave(parsed);
    }
  } catch (e) {
    console.warn('Storage load failed, using default:', e);
    try { const raw = localStorage.getItem('XIUXIAN_SAVE_V2'); if (raw && !localStorage.getItem('XIUXIAN_SAVE_RESCUE')) localStorage.setItem('XIUXIAN_SAVE_RESCUE', raw); } catch (x) { }
    window.LOADFAIL98 = true;   /* v98:保留原始資料,暫停備份輪替 */
    state = JSON.parse(JSON.stringify(defaultState));
  }
  /* v98:主存檔不見但備份還在 → 開啟後詢問還原 */
  try { if (!localStorage.getItem('XIUXIAN_SAVE_V2') && (localStorage.getItem('XIUXIAN_SAVE_BAK1') || localStorage.getItem('XIUXIAN_SAVE_BAK2'))) window.ORPHAN98 = true; } catch (x) { }
}

