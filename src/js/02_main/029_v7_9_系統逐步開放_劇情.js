/* ===== v7.9 系統逐步開放 + 劇情 ===== */
(function () {
  const R = () => state.realmIdx || 0, S = () => state.subRealm || 1;
  const U = [
    { k: 'alch', name: '煉丹閣', hint: '練氣第5層', ok: () => R() >= 1 || (R() === 0 && S() >= 5), icon: '⚗️', title: '山中奇緣・丹火初燃',
      lines: ['後山採藥歸來，途經斷崖，見一老道盤坐昏迷，丹袋散落一地。', '你以靈氣護住他的心脈，守了三日三夜。', '老道醒轉，撫鬚而笑：「小友心性純良。老夫雲遊丹士，無以為報，便傳你一爐丹火、數張丹方。」', '【煉丹閣】已開啟——洞府煉製頁，可用靈草煉製丹藥。'], rew: [['herb_1', 5]], rewT: ['凝露靈草 ×5'] },
    { k: 'forge', name: '煉器室', hint: '築基期', ok: () => R() >= 1, icon: '🔨', title: '鐵匠遺爐・煉器入門',
      lines: ['築基之後，神識外放，你在坊市盡頭聽見叮噹錘聲。', '一位獨臂老匠守著殘爐，見你靈根不俗，擲來一柄舊錘：「能讓寒鐵聽話的，才配稱修士。」', '你學會了引地火、淬靈材之法。', '【煉器室】與裝備【強化】已開啟。'], rew: [['ore_1', 4]], rewT: ['寒鐵石 ×4'] },
    { k: 'talent', name: '先天天賦樹', hint: '築基第3層', ok: () => R() >= 2 || (R() === 1 && S() >= 3), icon: '🌿', title: '先天悟道・天賦初啟',
      lines: ['築基第三層，你於打坐之際，識海忽現一株靈樹虛影。', '枝頭點點星光，似是你與生俱來的天賦，正等著被喚醒。', '【先天天賦樹】已開啟——人物頁「修行」。'], rew: [], rewT: [] },
    { k: 'body', name: '煉體', hint: '金丹期', ok: () => R() >= 2, icon: '🦴', title: '鍛體殘卷・筋骨重鑄',
      lines: ['金丹既成，真元反哺肉身。你在焚天火穴外撿到一卷焦黃殘頁，上書《九轉鍛體訣》。', '字跡之間，藏著以天地靈氣淬煉筋骨的法門——肉身，亦可成道。', '【煉體】已開啟——洞府【煉體台】。'], rew: [], rewT: [] },
    { k: 'pet', name: '靈寵', hint: '元嬰期', ok: () => R() >= 3, icon: '🐾', title: '靈寵緣起・殘卵有靈',
      lines: ['元嬰出竅遊歷，你在雷崖石縫發現一枚溫熱的殘卵，隱隱與你神魂相應。', '天地萬物皆有靈，願與你並肩的，何止一人。', '【靈寵】已開啟，並贈靈寵蛋 ×1。'], eggs: 1, rewT: ['靈寵蛋 ×1'] },
    { k: 'treasure', name: '法寶', hint: '化神期', ok: () => R() >= 4, icon: '💠', title: '殘片有靈・法寶現世',
      lines: ['化神之境，神識可觸天地至理。縹緲仙宮外，一片殘玉嗡然共鳴。', '古仙遺寶散落凡界——集齊殘片，可重煉上古法寶。', '【法寶】已開啟，贈法寶殘片 ×10。'], tfrag: 10, rewT: ['法寶殘片 ×10'] },
    { k: 'tower', name: '九九登天塔', hint: '化神期', ok: () => R() >= 4, icon: '🗼', title: '雲外塔影', lines: ['x'], rew: [], rewT: [] }
  ];
  const BY = Object.fromEntries(U.map(u => [u.k, u]));
  /* 道途錄收錄 */
  U.forEach(u => { if (!STORIES.find(s => s.k === 'x' + u.k)) STORIES.push({ k: 'x' + u.k, icon: u.icon, title: u.title, lines: u.lines, skip: false }); });
  const on = k => !!(state.un9 && state.un9[k]);
  /* 鎖定目標 */
  const T = [
    ['.nav-tab-btn[data-tab="tab-crafting"]', 'alch'], ['.nav-tab-btn[data-tab="tab-ming"]', 'body'],
    ['#subtab-alchemy-btn', 'alch'], ['#subtab-forge-btn', 'forge'], ['#subtab-talents-btn', 'talent'],
    ['[data-act="ming-tab"][data-id="body"]', 'body'], ['[data-act="ming-tab"][data-id="pet"]', 'pet'], ['[data-act="ming-tab"][data-id="treasure"]', 'treasure'],
    ['#btn-enhance-equipped', 'forge'], ['[data-enhall]', 'forge'], ['[data-tower]', 'tower'], ['[data-x5="af.open"]', 'forge'], ['[data-x5="fn.open"]', 'forge']
  ];
  document.addEventListener('click', e => {
    const t = e.target && e.target.closest ? e.target : null; if (!t) return;
    for (const [sel, k] of T) { const el = t.closest(sel); if (el && !on(k)) { e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); showToast(window.sysLockMsg ? sysLockMsg(k, BY[k]) : `【${BY[k].name}】尚未開啟:${BY[k].hint}可開`); return; } }
  }, true);
  const st = document.createElement('style');
  st.textContent = '.lock9{opacity:.48}.nav-tab-btn.lock9{position:relative}.nav-tab-btn .lk9{position:absolute;top:0;right:20%;width:15px;height:15px;margin:0;opacity:1}.lk9{filter:drop-shadow(0 0 2px #000)}';
  document.head.appendChild(st);
  function decorate() {
    T.forEach(([sel, k]) => document.querySelectorAll(sel).forEach(el => {
      const lock = !on(k), has = el.querySelector(':scope > .lk9');
      if (lock && !has) { el.classList.add('lock9'); const i = document.createElement('i'); i.className = 'ii ui ii-u_lock lk9'; el.insertBefore(i, el.firstChild); }
      else if (!lock && has) { el.classList.remove('lock9'); has.remove(); }
    }));
  }
  let sch = false; const mo = new MutationObserver(() => { if (!sch) { sch = true; requestAnimationFrame(() => { sch = false; decorate(); }); } });
  mo.observe(document.body, { childList: true, subtree: true });
  /* 開放判定與劇情佇列 */
  const Q = [];
  function canPlay() {
    const hid = id => { const m = document.getElementById(id); return !m || m.classList.contains('hidden'); };
    return !currentBattle && !(document.getElementById('st28') && document.getElementById('st28').classList.contains('on')) && hid('modal-ascension') && hid('modal-tribulation') && !document.getElementById('pw9') && hid('battle-modal');
  }
  function play(u) {
    (u.rew || []).forEach(([id, n]) => { state.inventory[id] = (state.inventory[id] || 0) + n; });
    if (u.eggs) state.eggs = (state.eggs || 0) + u.eggs;
    if (u.tfrag) state.tfrag = (state.tfrag || 0) + u.tfrag;
    state.storySeen = state.storySeen || {}; state.storySeen['x' + u.k] = true;
    playCinematic({ icon: u.icon, title: u.title, lines: u.lines, rewards: (u.rewT || []).length ? u.rewT : [`解鎖【${u.name}】`], continueText: '繼續修行' });
    try { renderInventory(); } catch (e) { }
    saveGame();
  }
  function tick() {
    if (!state.un9 || typeof state.un9 !== 'object') state.un9 = {};
    if (!state.un9init) { U.forEach(u => { if (u.ok()) state.un9[u.k] = 1; }); state.un9init = 1; saveGame(); decorate(); return; }
    U.forEach(u => { if (!state.un9[u.k] && u.ok()) { state.un9[u.k] = 1; Q.push(u); } });
    if (Q.length && canPlay()) play(Q.shift());
    decorate();
  }
  XT.topBar79Unlock = function () { try { tick(); } catch (e) { } };   // 由 updateTopBar 呼叫
  window.UNLOCK9 = { U, on, tick, decorate };
})();


const GEN5={"sb_gate": "data:image/webp;base64,@@IMG:GEN5/sb_gate@@", "sb_hall": "data:image/webp;base64,@@IMG:GEN5/sb_hall@@", "sb_task": "data:image/webp;base64,@@IMG:GEN5/sb_task@@", "sb_lib": "data:image/webp;base64,@@IMG:GEN5/sb_lib@@", "sb_shop": "data:image/webp;base64,@@IMG:GEN5/sb_shop@@", "sb_arena": "data:image/webp;base64,@@IMG:GEN5/sb_arena@@", "sb_z": "data:image/webp;base64,@@IMG:GEN5/sb_z@@", "sb_n": "data:image/webp;base64,@@IMG:GEN5/sb_n@@", "sb_x": "data:image/webp;base64,@@IMG:GEN5/sb_x@@", "sb_r0": "data:image/webp;base64,@@IMG:GEN5/sb_r0@@", "sb_r1": "data:image/webp;base64,@@IMG:GEN5/sb_r1@@", "sb_r2": "data:image/webp;base64,@@IMG:GEN5/sb_r2@@", "sb_r3": "data:image/webp;base64,@@IMG:GEN5/sb_r3@@", "sb_grad": "data:image/webp;base64,@@IMG:GEN5/sb_grad@@", "sb_ct": "data:image/webp;base64,@@IMG:GEN5/sb_ct@@", "sb_leave": "data:image/webp;base64,@@IMG:GEN5/sb_leave@@", "sc_qy": "data:image/webp;base64,@@IMG:GEN5/sc_qy@@", "sc_bc": "data:image/webp;base64,@@IMG:GEN5/sc_bc@@", "sc_tj": "data:image/webp;base64,@@IMG:GEN5/sc_tj@@", "sc_sx": "data:image/webp;base64,@@IMG:GEN5/sc_sx@@", "sc_xs": "data:image/webp;base64,@@IMG:GEN5/sc_xs@@", "sc_ws": "data:image/webp;base64,@@IMG:GEN5/sc_ws@@", "sc_ym": "data:image/webp;base64,@@IMG:GEN5/sc_ym@@", "sc_lx": "data:image/webp;base64,@@IMG:GEN5/sc_lx@@", "sc_zj": "data:image/webp;base64,@@IMG:GEN5/sc_zj@@", "sc_cy": "data:image/webp;base64,@@IMG:GEN5/sc_cy@@", "sc_dd": "data:image/webp;base64,@@IMG:GEN5/sc_dd@@", "sc_jg": "data:image/webp;base64,@@IMG:GEN5/sc_jg@@", "sc_fx": "data:image/webp;base64,@@IMG:GEN5/sc_fx@@", "sc_yc": "data:image/webp;base64,@@IMG:GEN5/sc_yc@@", "sc_rs": "data:image/webp;base64,@@IMG:GEN5/sc_rs@@", "sc_pt": "data:image/webp;base64,@@IMG:GEN5/sc_pt@@", "sc_gc": "data:image/webp;base64,@@IMG:GEN5/sc_gc@@", "sc_sh": "data:image/webp;base64,@@IMG:GEN5/sc_sh@@", "sc_hd": "data:image/webp;base64,@@IMG:GEN5/sc_hd@@", "sc_xc": "data:image/webp;base64,@@IMG:GEN5/sc_xc@@", "sc_lh": "data:image/webp;base64,@@IMG:GEN5/sc_lh@@", "sc_tc": "data:image/webp;base64,@@IMG:GEN5/sc_tc@@", "sc_ms": "data:image/webp;base64,@@IMG:GEN5/sc_ms@@", "sc_dl": "data:image/webp;base64,@@IMG:GEN5/sc_dl@@", "sc_nd": "data:image/webp;base64,@@IMG:GEN5/sc_nd@@", "sc_dz": "data:image/webp;base64,@@IMG:GEN5/sc_dz@@", "sc_zx": "data:image/webp;base64,@@IMG:GEN5/sc_zx@@", "sc_tb": "data:image/webp;base64,@@IMG:GEN5/sc_tb@@", "sc_tj2": "data:image/webp;base64,@@IMG:GEN5/sc_tj2@@", "sc_by": "data:image/webp;base64,@@IMG:GEN5/sc_by@@", "sc_tx": "data:image/webp;base64,@@IMG:GEN5/sc_tx@@", "sc_xm": "data:image/webp;base64,@@IMG:GEN5/sc_xm@@", "sc_wf": "data:image/webp;base64,@@IMG:GEN5/sc_wf@@", "sc_ds": "data:image/webp;base64,@@IMG:GEN5/sc_ds@@", "sc_xy": "data:image/webp;base64,@@IMG:GEN5/sc_xy@@", "sc_lx2": "data:image/webp;base64,@@IMG:GEN5/sc_lx2@@", "sc_yg": "data:image/webp;base64,@@IMG:GEN5/sc_yg@@", "sc_jy": "data:image/webp;base64,@@IMG:GEN5/sc_jy@@", "sc_pl": "data:image/webp;base64,@@IMG:GEN5/sc_pl@@"};

