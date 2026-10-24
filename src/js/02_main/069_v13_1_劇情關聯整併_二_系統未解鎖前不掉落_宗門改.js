/* ===== v13.1 劇情關聯整併(二):系統未解鎖前不掉落、宗門改客卿遊學、靈寵撞名 ===== */
(function () {
  window.petOK = function () { return !!(window.UNLOCK9 && UNLOCK9.on('pet')); };
  window.treOK = function () { return !!(window.UNLOCK9 && UNLOCK9.on('treasure')); };

  /* 區域首通法寶:法寶系統解鎖前先暫存,解鎖後一次補發 */
  { const o = extOnClear; extOnClear = function (area) {
    if (!treOK()) { try { state.tPend = state.tPend || []; const id = 't' + area.id; if (state.tPend.indexOf(id) < 0) state.tPend.push(id); } catch (e) { } return; }
    return o.apply(this, arguments);
  }; }
  { XT.topBar131Tre = function () {   // 由 updateTopBar 呼叫
    try {
      if (treOK() && state.tPend && state.tPend.length) {
        const L = state.tPend.splice(0); let n = 0; L.forEach(id => { if (grantTreasure(id, true)) n++; });
        if (n) { showToast(`💠 先前首通秘境所得的 ${n} 件法寶,隨殘玉共鳴一併歸入。`); saveGame(); }
      }
    } catch (e) { }
  }; }

  /* 宗門:改為「持青雲令牌下山遊學、掛單客卿」 */
  try {
    const u = UNLOCK9.U.find(x => x.k === 'sect');
    if (u) {
      const L = ['你修至練氣三層,一縷靈氣已能在體內自行流轉。',
        '墨塵晃著酒葫蘆,往你手裡塞了一枚青雲令牌:「井底之蛙成不了仙。山下各派開門收客,你拿著這塊牌子去掛單遊學,學人家的長處——別忘了回家。」',
        '各路宗門正邪不一、門庭各異。你以青雲弟子的身分掛單其門下,修至長老、通過出師試煉,便可帶走獨門功法與寶物,再訪下一家。',
        '底部【宗門】分頁已開啟。入門後可於任務堂接任務、藏經閣習功法、藏寶閣兌寶物。'];
      u.title = '青雲令牌・下山遊學'; u.lines.length = 0; L.forEach(x => u.lines.push(x));
      const st = STORIES.find(x => x.k === 'xsect'); if (st) { st.title = u.title; st.lines = u.lines; }
    }
  } catch (e) { }
})();


