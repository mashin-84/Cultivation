
/* ===== v10.1:靈田專產珍稀靈草・奇遇少而精 ===== */
(function () {
  const X = window.X5, R = () => state.realmIdx || 0;
  /* ---------- 靈田 ---------- */
  const RARE = { herb_3: 1, herb_4: 1, herb_5: 1 };
  window.GDX43 = RARE;
  window.GDM43 = id => (1 + .5 * R()) * (RARE[id] ? 1.5 : 1);
  /* 天雷竹・龍血果・蟠桃仙露:歷練中一般妖魔不再掉落(境主首殺仍會給),改由靈田專產 */
  AREAS_DATA.forEach(a => a.monsters.forEach(m => { if (m.isBoss || !m.drops) return; m.drops = m.drops.filter(d => !RARE[d.item]); }));
  ['herb_3', 'herb_4', 'herb_5'].forEach(k => { if (ITEMS[k] && ITEMS[k].desc && ITEMS[k].desc.indexOf('靈田') < 0) ITEMS[k].desc += '(多半只能在洞府靈田種出)'; });

  /* ---------- 奇遇:次數減半,成功時另得珍品 ---------- */
  const _te = triggerEventChoice;
  triggerEventChoice = function (area) {
    if (Math.random() < .5) { try { const st = Math.floor(30 * (1 + R() * 1.5)); state.stones += st; logAdventure(`🍃 林間拾得散落靈石 ${st} 枚。`); } catch (e) { } return; }
    return _te.apply(this, arguments);
  };
  function treasure() {
    const r = R(), o = {}, roll = Math.random();
    if (r >= 4 && roll < .2) o.xian = 2 + r;
    else if (r >= 3 && roll < .4) o.eggs = 1;
    else if (r >= 4 && roll < .6) o.tfrag = 3 + r;
    else if (r >= 1 && roll < .8) o.items = { rn_1: 1 + Math.floor(r / 2) };
    else o.items = { [r >= 5 ? 'herb_5' : r >= 2 ? 'herb_4' : 'herb_3']: 1 + Math.floor(r / 3) };
    return o;
  }
  CHOICE_EVENTS.forEach(ev => {
    ['actionA', 'actionB'].forEach(k => {
      const f = ev[k]; if (typeof f !== 'function' || f._w43) return;
      const g = function () { const res = f.apply(this, arguments); try { if (res && res.ok !== false && Math.random() < (k === 'actionA' ? .75 : .45)) { const L = X.give(treasure(), true); if (L.length) { res.gains = (res.gains || []).concat(L.map(x => '🎁 ' + x)); logAdventure('🎁 奇遇珍品:' + L.join('、')); } } } catch (e) { } return res; };
      g._w43 = 1; ev[k] = g;
    });
  });

  /* ---------- 角色小連環奇遇 ---------- */
  const EV = () => { if (!state.ev43 || typeof state.ev43 !== 'object') state.ev43 = { ba: 0, baR: -1, su: 0, suR: -1 }; return state.ev43; };
  const seen = id => !!(state.story27 && state.story27.seen && state.story27.seen[id]);
  const bond = (k, d) => { try { const b = state.story27.bond; b[k] = Math.max(0, Math.min(30, (b[k] || 0) + d)); } catch (e) { } };
  const BA = [
    ['白澤忽然停下腳步,鼻尖一抽一抽:「這附近……有東西在發光。本座聞得到。」', '跟著白澤走', '牠在一處山壁前刨了半天,刨出一塊溫熱的殘玉:「線索!還沒完,繼續找!」'],
    ['白澤又嗅到了那股氣味,尾巴翹得老高:「就在前面!這次是真的!」', '讓白澤帶路', '你們在一棵枯樹的樹洞裡,找到半張殘破的地圖。白澤得意地抖了抖毛。'],
    ['地圖的盡頭,是一處被藤蔓封死的石窟。白澤蹲在洞口,回頭看你:「本座聞到了,是好東西。」', '劈開藤蔓,進洞', null]
  ];
  const baEv = {
    icon: '🐾', title: '白澤嗅寶', ch43: 'ba',
    get desc() { return BA[Math.min(2, EV().ba)][0]; },
    get choiceA() { return BA[Math.min(2, EV().ba)][1]; },
    choiceB: '揉揉牠的腦袋,先趕路',
    actionA: () => {
      const e = EV(), i = Math.min(2, e.ba);
      if (i < 2) { e.ba = i + 1; const L = X.give({ stones: Math.floor(200 * (1 + R() * 1.5)) }, true); bond('ba', 1); return { ok: true, icon: '🐾', title: '線索', story: BA[i][2] + `(白澤嗅寶 ${e.ba}/3)`, gains: L }; }
      e.ba = 0; e.baR = R(); bond('ba', 2);
      const o = { tfrag: 8 + R() * 2, eggs: 1, stones: Math.floor(1500 * (1 + R() * 1.5)) }; if (R() >= 4) o.xian = 3 + R();
      const L = X.give(o, true);
      return { ok: true, icon: '✨', title: '洞中寶藏', story: '洞裡是一位不知名古修的遺府,石台上散落著幾片法寶殘玉,還有一枚尚有餘溫的獸卵。白澤一屁股坐在寶物堆上:「本座就說吧!」', gains: L };
    },
    actionB: () => ({ ok: null, icon: '🐾', title: '改日再說', story: '白澤哼了一聲,卻還是乖乖跟上:「下回你可別後悔。」', gains: [] })
  };
  const suHerb = () => R() >= 1 ? 'herb_3' : 'herb_2';
  const suEv = {
    icon: '🌸', title: '蘇棠的託付', ch43: 'su',
    get desc() { const h = ITEMS[suHerb()].name; return `蘇棠傳來一封飛書:「宗門裡一位師妹練功傷了經脈,丹房缺一味【${h}】。聽說你洞府的靈田種得出來……能勻我兩株嗎?」`; },
    get choiceA() { return `送去【${ITEMS[suHerb()].name}】×2`; },
    choiceB: '回信婉拒',
    actionA: () => {
      const e = EV(), h = suHerb();
      if ((state.inventory[h] || 0) < 2) return { ok: null, icon: '🌱', title: '藥材不足', story: `你翻遍儲物袋,【${ITEMS[h].name}】不足兩株。只好回信:等靈田收成了,一定送去。`, gains: [] };
      state.inventory[h] -= 2; if (state.inventory[h] <= 0) delete state.inventory[h];
      e.suR = R(); bond('su', 1);
      const L = X.give({ items: { rn_1: 2 + R(), pill_4: 3 }, stones: Math.floor(600 * (1 + R() * 1.5)) }, true);
      return { ok: true, icon: '🌸', title: '回禮', story: '幾日後,蘇棠的回信夾著一包謝禮,信末畫了個歪歪扭扭的笑臉:「師妹好多了!這些是我攢的,別嫌棄。」', gains: [`💞 蘇棠羈絆 +1`, ...L] };
    },
    actionB: () => ({ ok: null, icon: '🌸', title: '婉拒', story: '你回信說明近來不便。蘇棠回了一句「沒關係!」,字跡卻比平時潦草了些。', gains: [] })
  };
  CHOICE_EVENTS.push(baEv, suEv);
  const iBA = CHOICE_EVENTS.length - 2, iSU = CHOICE_EVENTS.length - 1;
  const okBA = () => seen('2.3') && EV().baR !== R();
  const okSU = () => seen('1.4') && EV().suR !== R() && !!(state.garden || (window.UNLOCK9 && UNLOCK9.on('alch')));
  const _p = window.pickEventIdx;
  window.pickEventIdx = function () {
    if (Math.random() < .3) { const c = []; if (okBA()) c.push(iBA); if (okSU()) c.push(iSU); if (c.length) return c[Math.floor(Math.random() * c.length)]; }
    for (let i = 0; i < 12; i++) { const k = _p ? _p.apply(this, arguments) : Math.floor(Math.random() * CHOICE_EVENTS.length); if (k !== iBA && k !== iSU) return k; }
    return 0;
  };
})();
