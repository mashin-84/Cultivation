/* ===== v10.2:功法整併(共通/流派/宗門)+ 流派專屬神通 ===== */
(function () {
  const $ = id => document.getElementById(id), X = window.X5;
  const R = () => state.realmIdx || 0;
  const sch = () => (window.SCH19 ? SCH19.SCH() : {});
  /* ---------- 一、流派專屬神通(每派 4 門) ---------- */
  const G = (a, b, p) => [a, b, p];
  const SCS = [
    /* 劍修 */
    { id: 'sc_sw1', sch: 'sword', name: '飛劍連環', el: 'metal', type: 'atk', hits: 4, mult: 0.62, cd: 3, realm: 1, cost: 3000, fx: 'flow', lore: '祭出飛劍,四劍連環,首尾相銜。',
      art: G('#e2e8f0', '#475569', '<g stroke="url(#G)" stroke-width="3.5" stroke-linecap="round"><path d="M10 52 L30 12"/><path d="M20 56 L40 16"/><path d="M30 58 L50 18"/><path d="M40 58 L56 26"/></g>') },
    { id: 'sc_sw2', sch: 'sword', name: '破甲劍訣', el: 'metal', type: 'atk', hits: 1, mult: 2.9, cd: 5, realm: 2, cost: 15000, fx: 'slash', rd: 'fresh', rdD: '敵氣血高於六成時,傷害 +40%(搶攻)', lore: '劍出無回,專破重甲。',
      art: G('#fef3c7', '#b45309', '<path d="M12 54 L50 10" stroke="url(#G)" stroke-width="6" stroke-linecap="round"/><path d="M34 14 l16 -4 l-4 16" fill="none" stroke="#fff" stroke-width="2.5"/><path d="M8 58 l10 -4 l-4 -10z" fill="#fbbf24"/>') },
    { id: 'sc_sw3', sch: 'sword', name: '劍意通明', el: null, type: 'buff', pct: 0.36, turns: 4, cd: 7, realm: 3, cost: 70000, fx: 'rage', lore: '劍心澄明,四回合內劍勢大增。',
      art: G('#bae6fd', '#1d4ed8', '<circle cx="32" cy="32" r="12" fill="url(#G)"/><path d="M32 4 v14 M32 46 v14 M4 32 h14 M46 32 h14 M12 12 l10 10 M42 42 l10 10 M52 12 l-10 10 M22 42 l-10 10" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>') },
    { id: 'sc_sw4', sch: 'sword', name: '人劍合一', el: 'metal', type: 'atk', hits: 1, mult: 6.2, cd: 8, realm: 4, cost: 300000, fx: 'god', rd: 'exec', rdD: '敵氣血低於四成時,傷害 +50%(斬將)', lore: '人即是劍,劍即是人,一劍斬落天地。',
      art: G('#fde68a', '#991b1b', '<path d="M32 4 L38 40 H26z" fill="url(#G)"/><path d="M18 42 h28 M32 42 v16" stroke="#fbbf24" stroke-width="4" stroke-linecap="round"/><circle cx="32" cy="22" r="4" fill="#fff"/>') },
    /* 法修 */
    { id: 'sc_mg1', sch: 'magic', name: '五雷正法', el: null, type: 'atk', hits: 3, mult: 0.85, cd: 3, realm: 1, cost: 3000, fx: 'thunder', rd: 'ctl', rdD: '敵人被定身或灼燒時,傷害 +25%', lore: '五雷轟頂,三道雷光連降。',
      art: G('#fde047', '#7c2d12', '<path d="M22 4 L10 32 h9 l-3 22 L34 24 h-9z" fill="url(#G)"/><path d="M46 8 L38 28 h7 l-2 18 L56 22 h-7z" fill="url(#G)" opacity=".8"/>') },
    { id: 'sc_mg2', sch: 'magic', name: '九幽冥火', el: 'fire', type: 'burn', mult: 1.1, dot: 0.5, turns: 4, cd: 5, realm: 2, cost: 15000, fx: 'fire', lore: '九幽冥火附體,四回合燒魂煉魄。',
      art: G('#a5f3fc', '#4c1d95', '<path d="M32 6 c9 10 17 16 10 30 c-3 6 -6 3 -6 -3 c-8 3 -17 -3 -9 -16 c2 -4 4 -6 5 -11z" fill="url(#G)"/><path d="M32 26 c4 7 8 10 5 16 c-5 3 -11 -3 -5 -16z" fill="#e0f2fe"/>') },
    { id: 'sc_mg3', sch: 'magic', name: '絕對冰域', el: 'water', type: 'stun', mult: 1.6, stun: 1, cd: 6, realm: 3, cost: 70000, fx: 'ice', lore: '展開冰域,萬物凍結。(Boss 有機率抵抗)',
      art: G('#e0f2fe', '#0c4a6e', '<circle cx="32" cy="32" r="22" fill="none" stroke="url(#G)" stroke-width="3" stroke-dasharray="4 3"/><path d="M32 8 v48 M11 20 l42 24 M53 20 l-42 24" stroke="url(#G)" stroke-width="3.5" stroke-linecap="round"/>') },
    { id: 'sc_mg4', sch: 'magic', name: '天地大衍', el: null, type: 'atk', hits: 6, mult: 0.8, cd: 8, realm: 4, cost: 300000, fx: 'void', rd: 'ctl', rdD: '敵人被定身或灼燒時,傷害 +25%', lore: '演化天地五行,六道神光齊出。',
      art: G('#ddd6fe', '#312e81', '<circle cx="32" cy="32" r="22" fill="#0f172a" stroke="url(#G)" stroke-width="3"/><path d="M32 10 a22 22 0 0 1 0 44 a11 11 0 0 1 0 -22 a11 11 0 0 0 0 -22z" fill="url(#G)"/><circle cx="32" cy="21" r="3" fill="#0f172a"/><circle cx="32" cy="43" r="3" fill="#fff"/>') },
    /* 體修 */
    { id: 'sc_bd1', sch: 'body', name: '金鐘罩', el: 'earth', type: 'shield', pct: 0.4, cd: 5, realm: 1, cost: 3000, fx: 'guard', lore: '運起金鐘罩,罡氣護體。',
      art: G('#fde68a', '#a16207', '<path d="M32 6 c14 0 22 12 22 26 v18 h-44 v-18 c0 -14 8 -26 22 -26z" fill="url(#G)"/><path d="M32 6 v44 M16 30 h32" stroke="#78350f" stroke-width="3" opacity=".6"/>') },
    { id: 'sc_bd2', sch: 'body', name: '碎岩拳', el: 'earth', type: 'atk', hits: 1, mult: 2.4, cd: 4, realm: 2, cost: 15000, fx: 'quake', rd: 'shield', rdD: '自身有護盾時,傷害 +50%', lore: '拳出如山,碎岩裂石。',
      art: G('#fcd34d', '#78350f', '<path d="M14 36 q0 -16 16 -18 q14 -2 18 10 q4 14 -10 20 h-14z" fill="url(#G)"/><path d="M26 22 v12 M34 22 v12 M42 26 v10" stroke="#78350f" stroke-width="2.5"/>') },
    { id: 'sc_bd3', sch: 'body', name: '浴血戰身', el: 'fire', type: 'drain', mult: 1.9, steal: 0.6, cd: 5, realm: 3, cost: 70000, fx: 'blood', rd: 'low', rdD: '自身氣血低於五成時,傷害 +30%', lore: '以血養身,越傷越勇。',
      art: G('#fb7185', '#7f1d1d', '<path d="M32 6 c10 14 18 22 18 34 a18 18 0 0 1 -36 0 c0 -12 8 -20 18 -34z" fill="url(#G)"/><path d="M22 38 h20 M32 28 v20" stroke="#fff" stroke-width="3" opacity=".7"/>') },
    { id: 'sc_bd4', sch: 'body', name: '不動明王', el: 'earth', type: 'shield', pct: 0.75, cd: 8, realm: 4, cost: 300000, fx: 'chaos', lore: '金身怒目,明王不動,天雷難傷。',
      art: G('#fef3c7', '#b45309', '<circle cx="32" cy="22" r="12" fill="url(#G)"/><path d="M12 58 c0 -18 8 -26 20 -26 s20 8 20 26z" fill="url(#G)"/><path d="M26 20 h4 M34 20 h4 M28 28 q4 3 8 0" stroke="#78350f" stroke-width="2.2" fill="none"/>') },
    /* 丹修 */
    { id: 'sc_pl1', sch: 'pill', name: '回春丹', el: 'wood', type: 'heal', pct: 0.3, cd: 4, realm: 1, cost: 3000, fx: 'heal', lore: '現煉回春丹,入口即化,生機盎然。',
      art: G('#bbf7d0', '#15803d', '<circle cx="32" cy="34" r="16" fill="url(#G)"/><path d="M32 24 v20 M22 34 h20" stroke="#fff" stroke-width="4" stroke-linecap="round"/><path d="M24 12 q8 -6 16 0" stroke="#86efac" stroke-width="3" fill="none"/>') },
    { id: 'sc_pl2', sch: 'pill', name: '丹毒噬魂', el: 'wood', type: 'burn', mult: 0.9, dot: 0.55, turns: 4, cd: 5, realm: 2, cost: 15000, fx: 'blood', lore: '以丹毒入敵,四回合蝕骨噬魂。',
      art: G('#d9f99d', '#365314', '<circle cx="32" cy="36" r="16" fill="url(#G)"/><circle cx="26" cy="32" r="3" fill="#1a2e05"/><circle cx="38" cy="32" r="3" fill="#1a2e05"/><path d="M26 44 h12" stroke="#1a2e05" stroke-width="3"/><path d="M32 6 c6 6 8 10 0 14 c-8 -4 -6 -8 0 -14z" fill="#a3e635"/>') },
    { id: 'sc_pl3', sch: 'pill', name: '九轉還魂', el: 'wood', type: 'heal', pct: 0.55, cd: 7, realm: 3, cost: 70000, fx: 'heal', lore: '九轉金丹,起死回生。',
      art: G('#fde68a', '#15803d', '<circle cx="32" cy="32" r="20" fill="none" stroke="url(#G)" stroke-width="4" stroke-dasharray="8 4"/><circle cx="32" cy="32" r="11" fill="url(#G)"/><path d="M32 26 v12 M26 32 h12" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/>') },
    { id: 'sc_pl4', sch: 'pill', name: '丹火焚心', el: 'fire', type: 'buff', pct: 0.5, turns: 4, cd: 7, realm: 4, cost: 300000, fx: 'rage', lore: '以丹火淬鍊己身,四回合戰力暴漲。',
      art: G('#fdba74', '#9a3412', '<path d="M18 52 h28 l-4 -14 h-20z" fill="#475569"/><path d="M32 8 c8 10 14 16 8 26 c-3 4 -6 2 -6 -2 c-6 3 -14 -3 -8 -12 c2 -4 4 -6 6 -12z" fill="url(#G)"/><path d="M32 24 c3 6 6 8 4 12 c-4 2 -8 -2 -4 -12z" fill="#fef08a"/>') }
  ];
  SCS.forEach(s => {
    if (SK_BY_ID[s.id]) return;
    const a = s.art; delete s.art; SKILLS.push(s); SK_BY_ID[s.id] = s; SK_ART[s.id] = a;
  });
  const SCN = { sword: '劍修', magic: '法修', body: '體修', pill: '丹修' }, SCI = { sword: '🏹', magic: '🎇', body: '💪', pill: '🏺' };
  const active = sk => { if (!sk || !sk.sch) return true; const s = sch(); return s.main === sk.sch || s.sub === sk.sch; };
  const lockWhy = sk => `需擇${SCN[sk.sch]}為本命或輔修`;
  /* 專屬神通:本命 +12% / 輔修 +4%,並依流派觸發條件加成 */
  { const o = window.sectDmgMult;
    window.sectDmgMult = function (sk) {
      let m = o ? o.apply(this, arguments) : 1;
      if (sk && sk.sch) {
        const s = sch(), B = currentBattle; m *= s.main === sk.sch ? 1.12 : s.sub === sk.sch ? 1.04 : 1;
        if (B && B.monster && sk.rd) {
          const mo = B.monster, hp = mo.curHp / mo.hp;
          if (sk.rd === 'fresh' && hp > 0.6) m *= 1.4;
          else if (sk.rd === 'exec' && hp < 0.4) m *= 1.5;
          else if (sk.rd === 'ctl' && (B.stun > 0 || (B.dot && B.dot.turns > 0))) m *= 1.25;
          else if (sk.rd === 'shield' && B.shield > 0) m *= 1.5;
          else if (sk.rd === 'low' && B.playerHp / B.playerMaxHp < 0.5) m *= 1.3;
        }
      }
      return m;
    };
  }
  /* 非本命/輔修流派的神通:戰鬥中不可施放,自動戰鬥亦跳過 */
  { XT.playerAct102 = o => function (id) { const sk = id && SK_BY_ID[id]; if (sk && sk.sch && !active(sk)) { showToast(`【${sk.name}】${lockWhy(sk)}方可施展。`); return; } return o.apply(this, arguments); }; }
  { const o = chooseAutoAction; chooseAutoAction = function () {
    const S = skState(), bad = S.equipped.filter(id => id && SK_BY_ID[id] && SK_BY_ID[id].sch && !active(SK_BY_ID[id])), bak = {};
    bad.forEach(id => { bak[id] = skillCds[id]; skillCds[id] = 999; });
    try { return o.apply(this, arguments); } finally { bad.forEach(id => { if (bak[id] === undefined) delete skillCds[id]; else skillCds[id] = bak[id]; }); }
  }; }
  /* 學習/裝備把關 */
  { const o = skAct; skAct = function (a, id) { const sk = SK_BY_ID[id]; if ((a === 'skill-learn' || a === 'equip') && sk && sk.sch && !active(sk)) { showToast(lockWhy(sk) + '。'); return; } return o.apply(this, arguments); }; }
  skAllCounts = function () {
    const S = skState(), ok = s => active(s);
    return { learn: SKILLS.filter(s => ok(s) && !S.learned[s.id] && R() >= s.realm && state.stones >= s.cost).length, up: SKILLS.filter(s => S.learned[s.id] && skCanUp(s.id)).length };
  };
  { const o = skAll; skAll = function () {
    /* 暫時隱藏未生效流派的神通,避免一鍵領悟誤學 */
    const hid = SKILLS.filter(s => s.sch && !active(s) && !skState().learned[s.id]), keep = hid.map(s => s.realm);
    hid.forEach(s => { s.realm = 99; });
    try { return o.apply(this, arguments); } finally { hid.forEach((s, i) => { s.realm = keep[i]; }); }
  }; }
  skAnyAlert = function () {
    const S = skState();
    if (SKILLS.some(s => S.learned[s.id] && skCanUp(s.id))) return true;
    if (SKILLS.some(s => active(s) && !S.learned[s.id] && R() >= s.realm && state.stones >= s.cost)) return true;
    const free = S.equipped.slice(0, skSlots()).some(x => !x);
    return free && SKILLS.some(s => active(s) && S.learned[s.id] && !S.equipped.includes(s.id));
  };
  /* 心法說明補充 */
  if (window.SCH19) Object.keys(SCH19.SC).forEach(k => { const c = SCH19.SC[k]; if (c.coreD && !/專屬神通/.test(c.coreD)) c.coreD += ' 本命流派的專屬神通傷害 +12%。'; });

  /* ---------- 二、功法整併:神通分頁 → 共通 / 流派 / 宗門 ---------- */
  const css = document.createElement('style'); css.id = 'x27css';
  css.textContent = '#sk19{display:none!important}.sk27c{display:flex;gap:5px;margin-top:8px}.sk27c button{flex:1;padding:6px 2px;border-radius:9px;font-size:12px;font-weight:800;background:#1e293b;color:#94a3b8;border:1px solid #26334f}.sk27c button.on{background:#d97706;color:#fff;border-color:#f59e0b}.sk27h{border:1px solid #334155;background:#0f172a;border-radius:12px;padding:8px 10px;font-size:11.5px;color:#cbd5e1;margin-top:8px;line-height:1.5}.sk27h b{color:#fcd34d}.sk27h button{margin-top:6px;width:100%;padding:7px;border-radius:9px;font-weight:800;font-size:12px;background:linear-gradient(135deg,#713f12,#0f172a);border:1px solid #f59e0b;color:#fef3c7}.sk27g{font-size:11px;font-weight:800;color:#fcd34d;margin:10px 2px 2px}.sk27t{font-size:10px;padding:1px 5px;border-radius:6px;margin-left:4px;font-weight:800}';
  document.head.appendChild(css);
  const VIEWS = [['learned', '已學'], ['common', '共通'], ['school', '流派'], ['sect', '宗門'], ['all', '全部']];
  let sig27 = '';
  function card(sk, S, slots, cap) {
    const e = S.learned[sk.id], lv = e ? e.lv : 1, eq = S.equipped.slice(0, slots).includes(sk.id), c = skCalc(sk, lv), elc = sk.el ? SK_EL_COLOR[sk.el] : '#c4b5fd';
    const off = !active(sk), locked = !e && R() < sk.realm;
    let btns = '', exp = '';
    if (!e) btns = off ? `<button disabled class="px-2 py-1 rounded text-xs bg-slate-800 text-slate-500">🔒 ${lockWhy(sk)}</button>` : locked ? `<button disabled class="px-2 py-1 rounded text-xs bg-slate-800 text-slate-500">🔒 需${REALM_DATA[sk.realm].name}</button>` : eBtn('skill-learn', sk.id, `學習(${formatNum(sk.cost)} 靈石)`, state.stones >= sk.cost);
    else {
      btns += off ? `<span class="text-[11px] text-slate-500">${lockWhy(sk)}方可裝備</span> ` : `<button data-skact="${eq ? 'unequip' : 'equip'}" data-id="${sk.id}" class="tap-effect px-2.5 py-1 rounded text-xs font-bold ${eq ? 'bg-slate-700 text-amber-300' : 'bg-gradient-to-r from-teal-600 to-teal-500 text-white'}">${eq ? '卸下' : '裝備'}</button> `;
      const need = skExpNeed(lv), cost = skUpCost(sk, lv);
      if (lv >= 10) btns += `<span class="text-[11px] text-amber-300 font-bold">✨ 大成圓滿</span>`;
      else if (lv >= cap) btns += `<span class="text-[11px] text-slate-400">需提升境界以突破 Lv.${lv + 1}</span>`;
      else if (e.exp < need) btns += `<span class="text-[11px] text-slate-400">熟練中(施放累積)</span>`;
      else btns += eBtn('skill-up', sk.id, `領悟 Lv.${lv + 1}(${formatNum(cost)} 靈石)`, state.stones >= cost);
      exp = `<div class="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800 mt-1"><div class="h-full rounded-full" style="width:${Math.min(100, e.exp / need * 100)}%;background:${elc}"></div></div><div class="text-[10px] text-slate-500">熟練度 ${e.exp}/${need}</div>`;
    }
    const next = e && lv < 10 && lv < cap ? `<div class="text-[10px] text-emerald-300">下一級:${skHead(sk, lv + 1)}</div>` : '';
    const tag = sk.sch ? `<span class="sk27t" style="background:#422006;color:#fcd34d">${SCI[sk.sch]}${SCN[sk.sch]}專屬</span>` : '';
    const rd = sk.rdD ? `<div class="text-[10px] text-amber-300">◆ ${sk.rdD}</div>` : '';
    return `<div class="rounded-xl border p-2.5 flex space-x-2.5 ${eq ? 'border-amber-500/50' : 'border-slate-800'} ${locked || off ? 'opacity-60' : ''} bg-slate-900"><div class="w-14 h-14 shrink-0 relative">${skArt(sk.id, !e)}${!e ? '<div class="absolute inset-0 flex items-center justify-center text-slate-300 font-bold text-lg">?</div>' : ''}</div><div class="flex-1 min-w-0">
      <div class="flex items-center justify-between"><span class="font-serif-tc font-bold text-sm ${e ? 'text-amber-200' : 'text-slate-400'}">${sk.name}${tag}${e ? ` <span class="text-[11px] text-slate-400">Lv.${lv}</span>` : ''}</span><span class="text-[10px]" style="color:${elc}">${sk.el ? SK_EL[sk.el] + '系' : '無屬性'}·${SK_TYPE[sk.type]}·冷卻${c.cd}</span></div>
      <div class="text-[11px] text-emerald-300">${skHead(sk, lv)}</div><div class="text-[10px] text-slate-500">${sk.lore}</div>${rd}${next}
      <div class="text-[10px] ${lv >= 5 && e ? 'text-amber-300' : 'text-slate-600'}">${lv >= 5 && e ? '✅' : '▫'} Lv5 小成:冷卻-1　${lv >= 10 && e ? '✅' : '▫'} Lv10 大成:效果強化</div>${exp}<div class="mt-1.5 space-x-1">${btns}</div></div></div>`;
  }
  function schoolHead() {
    const s = sch(), lk = !(R() >= 1 && window.UNLOCK9 && UNLOCK9.on('school'));
    const t = lk ? '流派隨劇情開放(築基期後)' : s.main ? `本命 <b>${SCI[s.main]}${SCN[s.main]}</b>${s.sub ? `・輔修 <b>${SCI[s.sub]}${SCN[s.sub]}</b>` : ''}・☯ 道行 ${formatNum(s.dao || 0)}` : '尚未擇定本命流派';
    return `<div class="sk27h">${t}<br><span style="color:#94a3b8">每個流派有 4 門專屬神通,只有本命(+12% 傷害)或輔修(+4%)流派的可學習與施展。</span><button data-x5="sc.open">${s.main ? '🏯 開啟流派心法・換派・試煉' : '🏯 擇定流派'}</button></div>`;
  }
  function sectBlock() {
    const SE = window.SECT9; if (!SE) return '';
    const ids = Object.keys(state.sectSk || {}).filter(k => SE.SECTS.some(x => x.id === k));
    const cap = 1 + Math.floor(R() / 2), eqn = ids.filter(k => state.sectSk[k].eq).length;
    let h = `<div class="sk27h">宗門功法為被動加成,裝備欄 <b>${eqn}/${cap}</b>(隨境界增加)<br><span style="color:#94a3b8">每個大境界站穩後(練氣第四層、其後各境第二層),會有一次持青雲令牌遊學的機緣。裝備與遊學紀錄可在洞府【山門】查看。</span></div>`;
    if (!ids.length) return h + '<div class="text-[11px] text-slate-500 mt-2 px-1">尚未習得任何宗門功法。</div>';
    h += '<div class="space-y-2 mt-2">';
    ids.forEach(id => {
      const s = SE.SECTS.find(x => x.id === id), e = state.sectSk[id];
      h += `<div class="rounded-xl border p-2.5 ${e.eq ? 'border-amber-500/50' : 'border-slate-800'} bg-slate-900"><div class="flex items-center justify-between"><span class="font-serif-tc font-bold text-sm text-amber-200">${sk45(s.id)}${s.sk.n}<span class="sk27t" style="background:#1e3a5f;color:#93c5fd">🏛${s.n}</span></span><button data-x27="seq" data-id="${id}" class="tap-effect px-2.5 py-1 rounded text-xs font-bold ${e.eq ? 'bg-slate-700 text-amber-300' : 'bg-gradient-to-r from-teal-600 to-teal-500 text-white'}">${e.eq ? '卸下' : '裝備'}</button></div><div class="text-[11px] text-emerald-300">${X.fxText(s.sk.E)}</div><div class="text-[10px] text-slate-500">${s.sk.d}</div></div>`;
    });
    return h + '</div>';
  }
  XT.skills = function (force) {   // renderSkills 的唯一實作
    const root = $('skills-panel'); if (!root || !root.offsetParent) return;
    const S = skState(), slots = skSlots(), cap = skCap(), sc = sch(), view = VIEWS.some(v => v[0] === skView) ? skView : 'learned';
    const sig = JSON.stringify([S, slots, cap, view, sc.main, sc.sub, R(), state.sectSk, state.sect && state.sect.id, SKILLS.map(s => (R() >= s.realm && state.stones >= s.cost ? 1 : 0) + '' + (S.learned[s.id] ? (state.stones >= skUpCost(s, S.learned[s.id].lv) ? 1 : 0) : 0))]);
    if (!force && sig === sig27 && root.querySelector('.sk27c')) return; sig27 = sig;
    const c = skAllCounts(), on = c.learn + c.up > 0;
    let h = `<button data-skall="1" ${on ? '' : 'disabled'} class="tap-effect w-full mb-2 py-2 rounded-lg font-bold text-xs ${on ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-slate-950 shadow' : 'bg-slate-800 text-slate-500'}">${on ? `⚡ 一鍵領悟(可新學 ${c.learn} 門、可升級 ${c.up} 門)` : '⚡ 一鍵領悟(暫無可學/可升級)'}</button>`;
    h += `<div class="rounded-xl border border-slate-700 bg-slate-900 p-3"><div class="flex justify-between text-xs"><span class="font-serif-tc font-bold text-amber-300">⚡ 神通欄位 ${slots}/4</span><span class="text-slate-400">等級上限 Lv.${cap}</span></div><div class="grid grid-cols-4 gap-1.5 mt-2">`;
    for (let i = 0; i < 4; i++) {
      const id = S.equipped[i], open = i < slots, sk = id && SK_BY_ID[id];
      if (!open) h += `<div class="rounded-lg border border-slate-800 bg-slate-950 p-1 text-center opacity-50"><div class="text-xl">🔒</div><div class="text-[9px] text-slate-500">${i === 2 ? '金丹開啟' : '化神開啟'}</div></div>`;
      else if (sk && S.learned[id]) h += `<button data-skact="unequip" data-id="${id}" class="rounded-lg border ${active(sk) ? 'border-amber-500/50' : 'border-red-900'} bg-slate-950 p-1 text-center"><div class="w-9 h-9 mx-auto">${skArt(id)}</div><div class="text-[10px] text-amber-200 leading-tight">${sk.name}</div><div class="text-[9px] ${active(sk) ? 'text-slate-400' : 'text-red-400'}">${active(sk) ? 'Lv.' + S.learned[id].lv + ' · 點擊卸下' : '流派未生效'}</div></button>`;
      else h += `<div class="rounded-lg border border-dashed border-slate-700 bg-slate-950 p-1 text-center"><div class="text-xl text-slate-600">＋</div><div class="text-[9px] text-slate-500">空欄位</div></div>`;
    }
    h += `</div><div class="text-[10px] text-slate-500 mt-2">戰鬥時依欄位順序顯示按鈕;自動戰鬥會依局勢自動選擇(血低→療傷、Boss→護盾/控制、其餘→最強輸出)。每次施放 +1 熟練度,熟練度滿後花靈石領悟升級;Lv5「小成」冷卻 -1,Lv10「大成」效果強化。</div></div>`;
    h += `<div class="sk27c">${VIEWS.map(([k, n]) => `<button data-skact="view" data-id="${k}" class="${view === k ? 'on' : ''}">${n}</button>`).join('')}</div>`;
    if (view === 'sect') h += sectBlock();
    else {
      let list, extra = '';
      if (view === 'common') list = SKILLS.filter(s => !s.sch);
      else if (view === 'school') { extra = schoolHead(); list = SKILLS.filter(s => s.sch).sort((a, b) => (active(b) - active(a)) || ((sc.main === b.sch) - (sc.main === a.sch))); }
      else if (view === 'all') list = SKILLS.slice();
      else list = SKILLS.filter(s => S.learned[s.id]);
      h += extra;
      if (!list.length) h += '<div class="text-[11px] text-slate-500 mt-3 text-center">尚無已學神通。</div>';
      let last = null;
      h += '<div class="space-y-2 mt-2">' + list.map(sk => {
        let g = '';
        if (view === 'school' && sk.sch !== last) { last = sk.sch; g = `<div class="sk27g">${SCI[sk.sch]} ${SCN[sk.sch]}${sc.main === sk.sch ? '・本命' : sc.sub === sk.sch ? '・輔修' : '・未選定'}</div>`; }
        return g + card(sk, S, slots, cap);
      }).join('') + '</div>';
    }
    root.innerHTML = h;
  };
  /* 宗門區按鈕 */
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-x27]'); if (!b || !$('skills-panel') || !$('skills-panel').contains(b)) return;
    if (b.dataset.x27 === 'seq') { if (window.SECT9) { SECT9.toggleEq(b.dataset.id); renderSkills(true); } }
    else if (b.dataset.x27 === 'sect') { if (window.SECT9) SECT9.open(); }
  });
  /* 流派入口:切到神通頁的流派分區 */
  setTimeout(() => { try { if (skView === 'learned' || !skView) skView = 'learned'; renderSkills(true); } catch (e) { } }, 1300);
  window.SK27 = { SCS, active };
})();


