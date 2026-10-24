/* ===== 氣海調節器:儲備上限 3 倍、圓滿後吸收減半(所有修為來源統一處理) ===== */
const QI_RESERVE_MULT = 3, QI_OVERFLOW_RATE = 0.5, TOX_FREE = 3;
const QG = (function () {
  let ref = null, last = 0;
  function govern() {
    if (ref !== state) { ref = state; last = state.qi; return; }
    const cur = state.qi; if (!Number.isFinite(cur)) return;
    const d = cur - last;
    if (d > 0) {
      const max = getRealmInfo().maxQi, cap = max * QI_RESERVE_MULT;
      const full = Math.min(d, Math.max(0, max - last));
      let v = last + full + (d - full) * QI_OVERFLOW_RATE;
      v = Math.min(v, Math.max(cap, last));
      state.qi = v;
    }
    last = state.qi;
  }
  function sync() { ref = state; last = state.qi; }
  return { govern, sync };
})();
setInterval(() => { try { QG.govern(); } catch (e) { } }, 300);
// 手動吐納收益 = 被動吐納速度 x 倍數 + 悟性等級 x 固定值
const TAP_QI_RATE_MULT = 0.6;
const TAP_INSIGHT_PER_LV = 3;

function getRealmInfo() {
  const realm = REALM_DATA[state.realmIdx] || REALM_DATA[0];
  // OPT-O3: 漸進指數需求公式
  const maxQi = Math.floor(realm.baseQi * (QI_NEED_MULT[state.realmIdx] || 1) * Math.pow(realm.subMax === 6 ? SUB6_GROW : 1.35, Math.max(0, state.subRealm - 1)) * Math.pow(1.25, Math.min(8, (state.story27 && state.story27.loops) || 0)));
  let title = realm.name;
  if (realm.subMax > 1) {
    title += `第${state.subRealm}層`;
  }
  return { realm, maxQi, title };
}

// FIX-B1: 唯一天劫成功率計算公式
function getTribulationChance() {
  const baseChance = 55;
  const root = state.root || { metal: 35, wood: 45, water: 55, fire: 60, earth: 30 };
  const avgRoot = (root.metal + root.wood + root.water + root.fire + root.earth) / 5;
  // 靈根每10點 +2%，上限 +20%
  const rootBonus = Math.min(20, Math.floor((avgRoot / 10) * 2));
  const pillBonus = usePillInTrib ? 20 : 0;
  // 天劫失敗保底：每次連續失敗 +5%，上限 +20%
  const streakBonus = Math.min(20, (state.tribFailStreak || 0) * 5);
  // OPT-O3: 心魔試煉獲勝加成 +15%
  const demonBonus = state.demonDefeated ? 15 : 0;

  const totalChance = Math.min(95, baseChance + rootBonus + pillBonus + streakBonus + demonBonus);
  return { baseChance, rootBonus, pillBonus, streakBonus, demonBonus, totalChance };
}

function calculateTotalStats() {
  const realmMult = 1 + state.realmIdx * 1.2 + (state.subRealm - 1) * ((REALM_DATA[state.realmIdx] || {}).subMax === 6 ? 0.06 : 0.15);
  let hp = Math.floor(180 * realmMult);
  let atk = Math.floor(20 * realmMult);
  let def = Math.floor(10 * realmMult);
  let crit = 5;

  // 基礎吐納計算
  let rawQiRate = state.baseQiRate + (state.arrayLevel * 4) + state.permQiRate + (state.realmIdx * 15);

  // 功法加成 (OPT-O7: 最多10重)
  let learnedCount = 0;
  (state.techniques || []).forEach(t => {
    if (t.learned && t.level > 0) {
      learnedCount++;
      const defData = TECHNIQUES_DATA.find(d => d.id === t.id);
      if (defData) {
        if (defData.bonusType === 'qiRate') rawQiRate += defData.bonusVal * t.level;
        if (defData.bonusType === 'atk') atk += defData.bonusVal * t.level;
        if (defData.bonusType === 'def') def += defData.bonusVal * t.level;
        if (defData.bonusType === 'hp') hp += defData.bonusVal * t.level;
        if (defData.bonusType === 'crit') crit += defData.bonusVal * t.level;
      }
    }
  });

  // OPT-O7: 功法共鳴 (>=3門 +5% 全屬性)
  const isResonanceActive = learnedCount >= 3;
  const resMult = isResonanceActive ? 1.05 : 1.0;
  atk = Math.floor(atk * resMult);
  def = Math.floor(def * resMult);
  hp = Math.floor(hp * resMult);
  rawQiRate = Math.floor(rawQiRate * resMult);
  rawQiRate = Math.floor(rawQiRate * (1 + 0.02 * Math.max(0, (state.arrayLevel || 1) - 1)));   // v109 聚靈陣每級吐納 +2%

  // 裝備加成 (FIX-B3, FIX-B4, OPT-O6: 品質與強化)
  EQUIP_SLOTS.forEach(slot => {
    const itemId = state.equipment[slot];
    if (itemId && ITEMS[itemId]) {
      const item = ITEMS[itemId];
      const enh = (state.enhance && state.enhance[slot]) || 0;
      const enhM = enhMult(enh); // v7: +10%/級(至+10),之後 +6%/級
      atk += Math.floor((item.atk || 0) * enhM);
      def += Math.floor((item.def || 0) * enhM);
      hp += Math.floor((item.hp || 0) * enhM);
    }
  });

  // 天賦樹加成 (OPT-O7)
  const talents = state.talents || {};
  TALENTS_DATA.forEach(tal => {
    const lvl = talEff(talents[tal.id] || 0);
    if (lvl > 0) {
      if (tal.stat === 'hp') hp = Math.floor(hp * (1 + tal.mult * lvl));
      if (tal.stat === 'atk') atk = Math.floor(atk * (1 + tal.mult * lvl));
      if (tal.stat === 'def') def = Math.floor(def * (1 + tal.mult * lvl));
      if (tal.stat === 'crit') crit += tal.val * lvl;
      if (tal.stat === 'qiRate') rawQiRate = Math.floor(rawQiRate * (1 + tal.mult * lvl));
    }
  });

  // 轉世道心加成 (OPT-O8)
  const daoUpgrades = state.daoUpgrades || {};
  if (daoUpgrades['dao_qi']) {
    const _dq = daoUpgrades['dao_qi']; rawQiRate = Math.floor(rawQiRate * (1 + 0.15 * (_dq <= 4 ? _dq : 4 + (_dq - 4) * 0.3))); // v12.0:混沌道體 4 級後每級效果 30%
  }
  { const _lp = (state.story27 && state.story27.loops) || 0; if (_lp) rawQiRate = Math.floor(rawQiRate * (1 + Math.min(0.15, 0.05 * _lp))); // 周目永久加成
  }

  // 仙界靈氣加成(飛升後)
  rawQiRate = Math.floor(rawQiRate * (IMMORTAL_QI_MULT[state.realmIdx] || 1));

  // FIX-B10: 靈根平均加成吐納 (每10點 +3%)
  const root = state.root || { metal: 35, wood: 45, water: 55, fire: 60, earth: 30 };
  const avgRoot = (root.metal + root.wood + root.water + root.fire + root.earth) / 5;
  const rootQiMult = 1 + (avgRoot / 10) * 0.03;
  const X = extStats();
  hp = Math.floor(hp * (1 + X.hpP)); atk = Math.floor(atk * (1 + X.atkP)); def = Math.floor(def * (1 + X.defP)); crit += X.crit;
  const qiRate = Math.max(1, Math.floor(rawQiRate * rootQiMult * (1 + X.qiP)));

  // OPT-O3: 戰力評估公式
  const combatPower = Math.floor(atk * (1 + crit * 0.005) * 1.0 + def * 1.2 + hp * 0.1);

  const s = { hp, atk, def, crit, qiRate, combatPower, isResonanceActive };
  // —— 擴充步驟(原為 3 層包裝,依原安裝順序;各步驟直接修改 s)——
  XT.stats78Realm && XT.stats78Realm(s);   // v7.8 境界乘數(028)
  XT.stats80Sect && XT.stats80Sect(s);     // v8.0 宗門功法加成(031)
  XT.stats85X5 && XT.stats85X5(s);         // v8.5 X5 共用加成:圖鑑/稱號/器紋/流派…(034)
  return s;
}


