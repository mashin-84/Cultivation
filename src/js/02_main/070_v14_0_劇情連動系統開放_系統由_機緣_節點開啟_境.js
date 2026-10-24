/* ===== v14.0 劇情連動系統開放:系統由「機緣」節點開啟(境界為前提,劇情為鑰匙) ===== */
(function () {
  const U9 = window.UNLOCK9; if (!U9) return;
  const on = k => !!(state.un9 && state.un9[k]);
  const R = () => state.realmIdx || 0, S = () => state.subRealm || 1;
  /* 各系統的境界門檻 [大境界, 小層];劇情節點亦用同樣門檻,兩者一致 */
  const RQ = { sect: [0, 3], alch: [0, 5], forge: [1, 1], talent: [1, 3], school: [1, 4], secret: [1, 5], rift: [1, 5], body: [2, 1], sub: [2, 2], heart: [3, 1], avatar: [3, 2], pet: [3, 2], tower: [4, 1], treasure: [4, 1], xian: [4, 2], jie: [4, 6] };
  const NAME = { school: ['流派', '築基第4層'], sub: ['輔修', '金丹第2層'], secret: ['每日秘境', '築基第5層'], rift: ['天地異種', '築基第5層'], heart: ['太虛道心閣', '元嬰期'], avatar: ['化身', '元嬰第2層'], xian: ['天機悟道', '化神第2層'], jie: ['九重劫', '化神第6層'] };
  /* 原有系統:不再由境界自動觸發過場,改由劇情節點開啟 */
  U9.U.forEach(u => { u.ok = () => false; u.rq = RQ[u.k]; });
  Object.keys(NAME).forEach(k => { if (!U9.U.find(u => u.k === k)) U9.U.push({ k, name: NAME[k][0], hint: NAME[k][1], icon: '✨', ok: () => false, rq: RQ[k], title: NAME[k][0], lines: [], rew: [], rewT: [] }); });
  const reached = k => { const q = RQ[k]; return !q || R() > q[0] || (R() === q[0] && S() >= q[1]); };
  /* 鎖定提示:境界到了、劇情未到,提示去讀劇情 */
  window.sysLockMsg = function (k, u) {
    u = u || U9.U.find(x => x.k === k) || { name: k, hint: '' };
    return reached(k) ? `【${u.name}】機緣未到——點右上 📖 繼續劇情,時機一到便會開啟。` : `【${u.name}】尚未開啟:${u.hint}可開`;
  };
  window.sysOn = on; window.sysReached = reached;
  /* 開啟系統(由機緣節點 fn 呼叫) */
  window.sysUnlock = function (k, o) {
    o = o || {}; state.un9 = state.un9 || {}; if (state.un9[k]) return;
    state.un9[k] = 1; state.storySeen = state.storySeen || {}; state.storySeen['x' + k] = true;
    (o.items || []).forEach(([id, n]) => { state.inventory[id] = (state.inventory[id] || 0) + n; });
    if (o.eggs) state.eggs = (state.eggs || 0) + o.eggs;
    if (o.tfrag) state.tfrag = (state.tfrag || 0) + o.tfrag;
    const u = U9.U.find(x => x.k === k) || { name: k };
    try { showToast(`✨ 【${u.name}】已開啟${o.rt ? '(' + o.rt + ')' : ''}`); } catch (e) { }
    try { renderInventory(); } catch (e) { }
    try { U9.decorate(); } catch (e) { }
    try { updateTopBar(); } catch (e) { }
    try { saveGame(); } catch (e) { }
  };
  /* 新增系統的入口攔截(舊系統已在 UNLOCK9 的 T 清單內) */
  const T2 = [['[data-x5="xj.open"]', 'xian'], ['[data-x5="sc.open"]', 'school']];
  document.addEventListener('click', e => {
    const t = e.target && e.target.closest ? e.target : null; if (!t) return;
    for (const [sel, k] of T2) { if (!k) continue; const el = t.closest(sel); if (el && !on(k)) { e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); try { showToast(sysLockMsg(k)); } catch (er) { } return; } }
  }, true);
  /* 天地異種:機緣未到不現身 */
  { const o = window.wbRoll; if (typeof o === 'function') wbRoll = function () { if (!on('rift')) return false; return o.apply(this, arguments); }; }
  /* 太虛道心閣:機緣未到不得兌換 */
  { const o = window.buyDaoUpgrade; if (typeof o === 'function') buyDaoUpgrade = function () { if (!on('heart')) { try { showToast('【太虛道心閣】灰珠深處尚未開啟——元嬰期後,隨劇情開啟。'); } catch (e) { } return; } return o.apply(this, arguments); }; }
  /* 試煉塔 */
  window.towerOK = function () { return on('tower'); };
  /* 道途錄收錄:把舊過場的長文換成與新劇情對應的簡述 */
  const REC = {
    alch: ['後山丹房・丹火初燃', ['練氣五層,墨塵領你推開後山積塵的舊丹房,紫金八卦的「神農」丹鼎靜靜蹲在石台上。', '他留下幾張被酒漬暈開的丹方,說:炸了爐,不許哭。', '【煉丹閣】已開啟。']],
    forge: ['器堂遺爐・煉器入門', ['築基之後,你在外門器堂聽見叮噹錘聲。獨臂老匠擲來一柄舊錘,教你強化、銘紋,與那座熄不了的舊熔爐。', '【煉器室】、裝備【強化】、【器紋】、【乾坤熔爐】已開啟。']],
    talent: ['先天道紋・天賦初啟', ['築基第三層,灰珠喚醒了識海裡那株光禿禿的樹影。白澤說:這叫先天道紋,每逢大境界,灰珠會替你記下一縷道心,澆在樹根上。', '【先天天賦樹】已開啟。']],
    body: ['九轉鍛體訣・筋骨重鑄', ['金丹之後,墨塵把一卷焚天火穴撿來的焦黃殘頁拍進你手裡:肉身,亦可成道。', '【煉體】已開啟。']],
    pet: ['雷崖殘卵・靈寵緣起', ['備戰的夜裡,白澤聞到雷崖石縫裡有同族的氣味。你捧起一枚將被雷劈熟的殘卵。', '【靈寵】已開啟,並贈靈寵蛋 ×1。']],
    treasure: ['殘玉共鳴・古仙遺寶', ['縹緲仙宮的殘垣下,一片殘玉嗡然共鳴。白澤說:這是古仙遺寶,他們走得匆忙,帶不走的,散落凡間。', '【法寶】已開啟,並贈法寶殘片 ×10。']],
    tower: ['雲外塔影・九九登天塔', ['化神之後,神識望見雲外一座塔影。門楣只有一行字:「後來者,登此塔,不為成仙,只為問己。」', '【九九登天塔】已開啟。']],
    sect: ['青雲令牌・下山遊學', ['練氣三層,墨塵塞給你一枚青雲令牌:井底之蛙成不了仙,下山去掛單各家,學人家的長處——別忘了根在哪。', '【宗門】已開啟。']]
  };
  U9.U.forEach(u => { const r = REC[u.k]; if (!r) return; u.title = r[0]; u.lines.length = 0; r[1].forEach(x => u.lines.push(x)); const st = (typeof STORIES !== 'undefined') && STORIES.find(x => x.k === 'x' + u.k); if (st) { st.title = r[0]; st.lines = u.lines; } });
})();


