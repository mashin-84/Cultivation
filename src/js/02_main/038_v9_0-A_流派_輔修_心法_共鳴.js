/* ===== v9.0-A:流派 · 輔修 · 心法 · 共鳴 ===== */
(function () {
  const $ = id => document.getElementById(id), fmt = n => formatNum(n), X = window.X5;
  const R = () => state.realmIdx || 0;
  const schOK = () => R() >= 1 && !!(window.UNLOCK9 ? UNLOCK9.on('school') : true), subOK = () => R() >= 2 && !!(window.UNLOCK9 ? UNLOCK9.on('sub') : true);
  const SCH = () => {
    if (!state.sch || typeof state.sch !== 'object') state.sch = {}; const s = state.sch;
    if (!s.nodes || typeof s.nodes !== 'object') s.nodes = {}; if (!s.trial || typeof s.trial !== 'object') s.trial = {}; if (!s.ar || typeof s.ar !== 'object') s.ar = {};
    ['dao', 'daoTot', 'sw', 'rc'].forEach(k => { if (typeof s[k] !== 'number' || !isFinite(s[k])) s[k] = 0; });
    if (s.main === undefined) s.main = null; if (s.sub === undefined) s.sub = null; return s;
  };
  X.EN.acd = '神通冷卻縮短'; X.EN.aspd = '閃避';
  /* ---------- 流派資料 ---------- */
  const SC = {
    sword: {
      n: '劍修', ic: '🏹', col: '#e2e8f0', bg: '#334155', title: '一劍破萬法', core: { crit: 6, critD: .25, atkP: .03 },
      coreD: '【劍意】會心率 +6%、會心傷害 +25%、攻擊 +3%。戰鬥:每第 5 次出手化為劍氣貫穿(傷害 ×1.8)。',
      ult: { n: '劍氣縱橫', ic: '🌬️', cd: 14, d: '斬出劍氣,造成 3 倍攻擊傷害。(戰鬥中施放,冷卻 5 回合)' },
      trial: '劍冢試煉', tic: '🗻', lore: '一劍在手,萬法皆破。劍修攻伐無雙,以會心與連擊壓制一切。',
      nodes: [['劍心通明', '會心率提升', { crit: .8 }], ['破甲劍訣', '攻擊提升', { atkP: .015 }], ['輕身劍步', '閃避提升', { dodge: .02 }], ['劍氣護體', '防禦提升', { defP: .012 }],
        ['劍意凝實', '會心傷害提升', { critD: .04 }], ['御劍之術', '神通傷害提升', { skAll: .03 }], ['一劍破萬法', '總傷害提升', { dmg: .02 }], ['劍氣縱橫', '神通冷卻縮短', { acd: .04 }],
        ['人劍合一', '攻擊與會心提升', { atkP: .02, crit: .5 }], ['萬劍朝宗', '神通傷害提升', { skAll: .04 }], ['劍心不滅', '吸血與氣血提升', { ls: .01, hpP: .015 }], ['太乙劍罡', '總傷害與會心傷害提升', { dmg: .03, critD: .05 }]]
    },
    magic: {
      n: '法修', ic: '🎇', col: '#c4b5fd', bg: '#4c1d95', title: '五行歸一', core: { skAll: .2, qiP: .05 },
      coreD: '【法力】神通傷害 +20%、吐納 +5%。戰鬥:每施展神通,追射 3 枚靈球(共 +120% 攻擊傷害)。',
      ult: { n: '五行法陣', ic: '🔯', cd: 15, d: '展開法陣:造成 1.5 倍傷害、灼燒 3 回合並定身 1 回合(Boss 有機率抵抗)。(冷卻 6 回合)' },
      trial: '靈池試煉', tic: '🏞️', lore: '引天地靈氣為己用,法修神通浩蕩,以神通傷害與冷卻取勝。',
      nodes: [['靈力充盈', '吐納與神通傷害', { qiP: .02, skAll: .01 }], ['五行精通', '神通傷害提升', { skAll: .02 }], ['靈絲法袍', '防禦提升', { defP: .012 }], ['靜心凝神', '神通冷卻縮短', { acd: .03 }],
        ['術法精純', '神通傷害提升', { skAll: .03 }], ['天地借力', '攻擊與總傷害', { atkP: .015, dmg: .01 }], ['靈氣護罩', '氣血提升', { hpP: .02 }], ['術法瞬發', '神通冷卻縮短', { acd: .04 }],
        ['元素共鳴', '神通傷害提升', { skAll: .04 }], ['法則領悟', '總傷害提升', { dmg: .03 }], ['洞天福地', '吐納與靈石', { qiP: .03, stoneP: .01 }], ['大衍歸一', '神通傷害與冷卻', { skAll: .03, acd: .03 }]]
    },
    body: {
      n: '體修', ic: '💪', col: '#fbbf24', bg: '#78350f', title: '金身不壞', core: { hpP: .15, defP: .12, ls: .02 },
      coreD: '【金身】氣血 +15%、防禦 +12%、吸血 +2%。戰鬥:開戰獲得氣血 15% 護盾;首次氣血低於 30% 再獲得一次護盾。',
      ult: { n: '金身怒目', ic: '🪬', cd: 16, d: '激發金身:獲得氣血 40% 護盾,並造成 2 倍攻擊傷害。(冷卻 6 回合)' },
      trial: '鍛骨試煉', tic: '⚒️', lore: '以肉身成聖,體修皮糙肉厚,越戰越勇,以氣血與防禦立於不敗。',
      nodes: [['鐵骨錚錚', '氣血提升', { hpP: .02 }], ['金鐘罩', '防禦提升', { defP: .02 }], ['氣血如虹', '氣血與吸血', { hpP: .015, ls: .004 }], ['步步為營', '閃避提升', { dodge: .015 }],
        ['不動明王', '防禦提升', { defP: .025 }], ['龍象之力', '攻擊與氣血', { atkP: .015, hpP: .015 }], ['以傷換傷', '總傷害與吸血', { dmg: .015, ls: .006 }], ['煉體訣', '氣血提升', { hpP: .03 }],
        ['金身不壞', '防禦與氣血', { defP: .03, hpP: .02 }], ['血脈覺醒', '吸血與攻擊', { ls: .01, atkP: .02 }], ['萬法不侵', '閃避與防禦', { dodge: .015, defP: .02 }], ['戰神體魄', '氣血與總傷害', { hpP: .03, dmg: .02 }]]
    },
    pill: {
      n: '丹修', ic: '🏺', col: '#86efac', bg: '#14532d', title: '丹道通玄', core: { qiP: .2, stoneP: .1, hpP: .08, ls: .01 },
      coreD: '【丹火】吐納 +20%、靈石 +10%、氣血 +8%、吸血 +1%。戰鬥:每回合回復 2% 氣血,戰勝後再回復 5%。',
      ult: { n: '丹爐煉化', ic: '♨️', cd: 15, d: '當場煉丹:回復 30% 氣血,攻擊提升 25%(3 回合)。(冷卻 6 回合)' },
      trial: '丹鼎試煉', tic: '🍲', lore: '以丹入道,丹修吐納迅猛、財源廣進,戰鬥中亦可源源不絕自癒。',
      nodes: [['藥香縈繞', '吐納提升', { qiP: .025 }], ['丹火溫養', '氣血與靈石', { hpP: .015, stoneP: .01 }], ['辨藥識草', '掉落與靈石', { dropP: .01, stoneP: .01 }], ['回春妙手', '吸血與氣血', { ls: .005, hpP: .01 }],
        ['丹元凝練', '吐納與氣血', { qiP: .03, hpP: .015 }], ['丹毒反噬', '總傷害與攻擊', { dmg: .015, atkP: .012 }], ['煉丹宗師', '靈石與掉落', { stoneP: .03, dropP: .015 }], ['丹香護體', '防禦與閃避', { defP: .02, dodge: .005 }],
        ['九轉金丹', '氣血與吐納', { hpP: .03, qiP: .03 }], ['以丹入道', '神通傷害與攻擊', { skAll: .025, atkP: .015 }], ['點石成金', '靈石與掉落', { stoneP: .04, dropP: .02 }], ['靈丹妙藥', '吸血與氣血', { ls: .01, hpP: .02 }]]
    }
  };
  const SK = ['sword', 'magic', 'body', 'pill'];
  const RES = {
    'sword+magic': ['劍法雙絕', { skAll: .08, crit: 4 }], 'body+sword': ['劍體同修', { atkP: .05, defP: .05 }], 'pill+sword': ['劍丹合一', { ls: .02, critD: .12 }],
    'body+magic': ['法體並進', { dmg: .05, hpP: .05 }], 'magic+pill': ['法丹相濟', { qiP: .12, skAll: .06 }], 'body+pill': ['體丹相生', { hpP: .08, ls: .015, stoneP: .04 }]
  };
  const resKey = (a, b) => [a, b].sort().join('+');
  const tierOf = i => Math.floor(i / 4) + 1;
  const nCost = (i, L) => 8 * tierOf(i) * L;
  const nodeLv = (sc, i) => SCH().nodes[sc + i] || 0;
  const total = sc => { let n = 0; for (let i = 0; i < 12; i++) n += nodeLv(sc, i); return n; };
  const add = (E, o, k) => { for (const a in o) E[a] = (E[a] || 0) + o[a] * k; };
  function fxOf(sc, k) { const E = {}, d = SC[sc]; add(E, d.core, k); for (let i = 0; i < 12; i++) { const L = nodeLv(sc, i); if (L) add(E, d.nodes[i][2], L * k); } return E; }
  X.reg('流派', () => {
    const s = SCH(), E = {}; if (R() < 1) return E;
    if (s.main) add(E, fxOf(s.main, 1), 1);
    if (s.sub && R() >= 2) { add(E, fxOf(s.sub, .45), 1); if (s.main) { const r = RES[resKey(s.main, s.sub)]; if (r) add(E, r[1], 1); } }
    return E;
  });
  const gainDao = n => { if (R() < 1 || !n) return; const s = SCH(); s.dao += Math.floor(n); s.daoTot += Math.floor(n); };
  /* ---------- 抉擇 ---------- */
  const CDMS = 12 * 3600 * 1000;
  const rcNow = () => state.reincarnationCount || 0;
  const free = () => { if (window.FREE143) return true; const s = SCH(); return !s.main || s.rc !== rcNow(); };   /* FREE143:測試期間換流派免費、無冷卻 */
  const swCost = () => X.sb(X.tier()) * 30;
  const cdLeft = () => free() ? 0 : Math.max(0, SCH().sw + CDMS - Date.now());
  const hm = ms => { const m = Math.ceil(ms / 60000); return m >= 60 ? `${Math.floor(m / 60)}時${m % 60}分` : `${m}分`; };
  function pickMain(sc) {
    const s = SCH(); if (!schOK()) { showToast(window.sysLockMsg ? sysLockMsg('school') : '築基期方可選定流派。'); return; } if (s.main === sc) return;
    const f = free(), c = f ? 0 : swCost();
    if (!f && cdLeft() > 0) { showToast(`道基未穩,尚需 ${hm(cdLeft())} 方可再換流派。`); return; }
    if (state.stones < c) { showToast(`靈石不足,換道需 ${fmt(c)}。`); return; }
    state.stones -= c; if (s.sub === sc) s.sub = null; s.main = sc; s.sw = Date.now(); s.rc = rcNow();
    X.dirty(); audio.playFanfare(); showToast(`已擇【${SC[sc].n}】為本命流派!`); saveGame(); updateTopBar(); render();
  }
  function pickSub(sc) {
    const s = SCH(); if (!subOK()) { showToast(window.sysLockMsg ? sysLockMsg('sub') : '金丹期方可兼修第二流派。'); return; } if (!s.main || s.main === sc || s.sub === sc) return;
    if (!s.trial[sc]) { showToast(`須先通過【${SC[sc].trial}】。`); return; }
    const c = s.sub && !window.FREE143 ? Math.floor(swCost() / 2) : 0;
    if (s.sub && cdLeft() > 0 && !free()) { showToast(`道基未穩,尚需 ${hm(cdLeft())}。`); return; }
    if (state.stones < c) { showToast(`靈石不足,換修需 ${fmt(c)}。`); return; }
    state.stones -= c; s.sub = sc; if (c) s.sw = Date.now(); X.dirty(); audio.playFanfare(); showToast(`已兼修【${SC[sc].n}】。`); saveGame(); updateTopBar(); render();
  }
  function upNode(sc, i) {
    const s = SCH(), L = nodeLv(sc, i); if (L >= 3) return; if (R() < tierOf(i)) { showToast('境界不足。'); return; }
    const c = nCost(i, L + 1); if (s.dao < c) { showToast(`道行不足,需 ${c}。`); return; }
    s.dao -= c; s.nodes[sc + i] = L + 1; X.dirty(); saveGame(); render();
  }
  window.SC38 = { alert: () => { try { if (!schOK()) return false; const s = SCH(); return [s.main, s.sub].filter(Boolean).some(sc => SC[sc] && SC[sc].nodes.some((nd, i) => { const L = nodeLv(sc, i); return L < 3 && R() >= tierOf(i) && s.dao >= nCost(i, L + 1); })); } catch (e) { return false; } } };   /* v108 流派紅點 */
  /* ---------- 介面 ---------- */
  let tab = 'pick', view = null;
  const fxLine = o => X.fxText(o);
  function render() { X.refresh('school'); rbtn(); }
  X.sheet('school', () => { const s = SCH(); return `🏯 流派心法 <span style="font-size:12px;color:#fcd34d;font-weight:700">☯ 道行 ${fmt(s.dao)}</span>`; }, b => {
    const s = SCH(); if (!view) view = s.main || 'sword';
    let h = `<div class="x5-tabs"><button class="${tab === 'pick' ? 'on' : ''}" data-x5="sc.tab" data-k="pick">流派</button><button class="${tab === 'node' ? 'on' : ''}" data-x5="sc.tab" data-k="node">心法</button><button class="${tab === 'res' ? 'on' : ''}" data-x5="sc.tab" data-k="res">共鳴</button></div>`;
    if (tab === 'pick') {
      h += `<div class="x5-sub" style="margin-bottom:6px">墨塵曾說:「劍、法、體、丹,修道不止一途,擇其一而深,方能入道。」</div>`;
      h += `<div class="x5-sub" style="margin-bottom:8px">${free() ? '<b style="color:#4ade80">現在可免費選擇本命流派。</b>' : cdLeft() > 0 ? `換道冷卻 <b style="color:#f87171">${hm(cdLeft())}</b>` : '換道需靈石;輔修於金丹期開放。'}</div>`;
      SK.forEach(sc => {
        const d = SC[sc], isM = s.main === sc, isS = s.sub === sc;
        let btns = '';
        if (!isM) btns += `<button class="x5-btn ${!schOK() ? 'gy' : 'am'}" data-x5="sc.main" data-k="${sc}" ${!schOK() ? 'disabled' : ''}>${s.main ? `改為本命${free() ? '' : '・💎' + fmt(swCost())}` : '擇為本命'}</button>`;
        if (!isM && !isS) btns += !subOK() ? '<button class="x5-btn gy" disabled>🔒 輔修(金丹)</button>' : !s.main ? '' : s.trial[sc] ? `<button class="x5-btn" data-x5="sc.sub" data-k="${sc}">兼修${s.sub ? '・💎' + fmt(Math.floor(swCost() / 2)) : ''}</button>` : `<button class="x5-btn x5rd" data-x5="sc.trial" data-k="${sc}">⚔ ${d.trial}</button>`;
        if (isS) btns += `<button class="x5-btn gy" data-x5="sc.unsub">放棄輔修</button>`;
        h += `<div class="x5-cd" style="margin-bottom:8px;border-color:${isM ? '#f59e0b' : isS ? '#14b8a6' : '#1e293b'}">
<div class="x5-row"><div class="sc-ic" style="background:${d.bg}">${d.ic}</div><div style="flex:1;min-width:0"><div><b style="color:${d.col};font-size:14px">${d.n}</b> <span class="x5-sub">${d.title}</span>${isM ? '<span style="display:inline-block;padding:0 5px;border-radius:4px;background:#9e2b25;color:#fbf4e4;font-size:10.5px;font-weight:800;margin-left:4px">本命</span>' : isS ? '<span style="display:inline-block;padding:0 5px;border-radius:4px;background:#2f7a6e;color:#fbf4e4;font-size:10.5px;font-weight:800;margin-left:4px">輔修</span>' : ''}</div><div class="x5-sub">${d.lore}</div></div></div>
<details class="sc-dt"><summary>效果詳情・心法 ${total(sc)}/36</summary><p>${d.coreD}</p><p style="color:#fcd34d">${d.ult.ic} ${d.ult.n}:<span style="color:#cbd5e1">${d.ult.d}</span></p></details>
<div class="x5-row" style="margin-top:8px;flex-wrap:wrap">${btns}</div></div>`;
      });
    } else if (tab === 'node') {
      h += `<div class="x5-row" style="margin-bottom:8px;flex-wrap:wrap">${SK.map(sc => `<button class="x5-btn ${view === sc ? 'am' : 'gy'}" data-x5="sc.view" data-k="${sc}">${SC[sc].ic}${SC[sc].n}${s.main === sc ? '・本' : s.sub === sc ? '・輔' : ''}</button>`).join('')}</div>`;
      const d = SC[view], eff = s.main === view ? '本命(100%)' : s.sub === view ? '輔修(45%)' : '未選定(不生效)';
      h += `<div class="x5-sub" style="margin-bottom:4px">${d.n}心法 ${total(view)}/36・<b>${eff}</b>(道行投入不因換派損失)</div>`;
      for (let t = 1; t <= 3; t++) {
        h += `<div style="font-weight:800;color:#fcd34d;margin:8px 0 4px">${['', '初階・築基', '中階・金丹', '高階・元嬰'][t]}${R() < t ? ' 🔒' : ''}</div>`;
        for (let j = 0; j < 4; j++) {
          const i = (t - 1) * 4 + j, nd = d.nodes[i], L = nodeLv(view, i), c = L >= 3 ? 0 : nCost(i, L + 1), can = L < 3 && R() >= t && s.dao >= c;
          h += `<div class="x5-cd" style="margin-bottom:4px;padding:6px 8px;display:flex;align-items:center;gap:8px;${R() < t ? 'opacity:.5' : ''}"><div style="flex:1"><b>${nd[0]}</b> <span style="color:#fbbf24">${'●'.repeat(L)}${'○'.repeat(3 - L)}</span><div class="x5-sub">${nd[1]}:${fxLine(nd[2])}/層</div></div>${L >= 3 ? '<span style="color:#4ade80;font-weight:700">圓滿</span>' : `<button class="x5-btn ${can ? 'am' : 'gy'}" data-x5="sc.up" data-k="${view}" data-i="${i}" ${can ? '' : 'disabled'}>☯${c}</button>`}</div>`;
        }
      }
    } else {
      h += `<div class="x5-sub" style="margin-bottom:6px">本命+輔修的搭配觸發共鳴(金丹期)。</div>`;
      Object.keys(RES).forEach(k => {
        const [a, b2] = k.split('+'), on = s.main && s.sub && resKey(s.main, s.sub) === k;
        h += `<div class="x5-cd" style="margin-bottom:6px;border-color:${on ? '#f59e0b' : '#1e293b'}"><b style="color:${on ? '#fbbf24' : '#cbd5e1'}">${SC[a].ic}${SC[b2].ic} ${RES[k][0]}</b> ${on ? '<span style="color:#4ade80">【生效中】</span>' : ''}<div class="x5-sub">${SC[a].n} + ${SC[b2].n}:${fxLine(RES[k][1])}</div></div>`;
      });
    }
    b.innerHTML = h;
  });
  X.act('sc.tab', t => { tab = t.dataset.k; render(); });
  X.act('sc.view', t => { view = t.dataset.k; render(); });
  X.act('sc.main', t => pickMain(t.dataset.k));
  X.act('sc.sub', t => pickSub(t.dataset.k));
  X.act('sc.unsub', () => { SCH().sub = null; X.dirty(); saveGame(); render(); });
  X.act('sc.up', t => upNode(t.dataset.k, +t.dataset.i));
  X.act('sc.trial', t => { if (window.TB26) { X.close('school'); TB26.startTrial(t.dataset.k); } });
  X.act('sc.open', () => X.open('school'));
  /* ---------- 入口列 ---------- */
  function mount() {
    if (!$('sa19css')) { const st = document.createElement('style'); st.id = 'sa19css'; st.textContent = '.sa19r{display:flex;gap:6px}.sa19r button{flex:1;padding:6px 4px;border-radius:10px;background:linear-gradient(135deg,#7f1d1d,#0f172a);border:1px solid #f87171;color:#fee2e2;font-weight:800;font-size:11px;position:relative}.sa19r button.lk{opacity:.55;background:#0f172a;border-color:#334155;color:#94a3b8}.sc-ic{width:42px;height:42px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:26px;flex:none}.sc-dt{margin-top:6px;font-size:11px;color:#cbd5e1}.sc-dt summary{color:#94a3b8;cursor:pointer;padding:2px 0}.sc-dt p{margin:4px 0 0}.sa19r button.sa19s{background:linear-gradient(135deg,#713f12,#0f172a);border-color:#f59e0b;color:#fef3c7}'; document.head.appendChild(st); }
    const row = () => { const d = document.createElement('div'); d.className = 'sa19r'; d.innerHTML = '<button class="sa19s" data-x5="sc.open"></button>'; return d; };
    if (!$('sa19b')) { const t = $('tab-adventure'); if (t) { const d = row(); d.id = 'sa19b'; t.insertBefore(d, t.firstChild); } }
  }
  function rbtn() {
    const s = SCH(), lk = !schOK(), h = lk ? ('🔒 流派(' + (R() < 1 ? '築基' : '隨劇情') + '開放)') : s.main ? `${SC[s.main].ic} ${SC[s.main].n}${s.sub ? '·' + SC[s.sub].n : ''}・☯${fmt(s.dao)}` : '🏯 擇定流派';
    const dot = !lk && !s.main, t = '';
    document.querySelectorAll('.sa19s').forEach(b => {
      if (b.dataset.h !== h) { b.dataset.h = h; b.textContent = h; b.classList.toggle('lk', lk); }
      if (!!b.querySelector('.x5-dot') !== dot) { if (dot) b.insertAdjacentHTML('beforeend', '<i class="x5-dot"></i>'); else b.querySelector('.x5-dot').remove(); }
    });
    document.querySelectorAll('.sa19a').forEach(a => { if (a.dataset.h !== t) { a.dataset.h = t; a.textContent = t; } });
  }
  let asked = false;
  function mountSk() {
    const sp = $('skills-panel'); if (!sp || $('sk19')) return;
    const d = document.createElement('div'); d.id = 'sk19'; d.style.cssText = 'margin-bottom:8px'; d.innerHTML = '<button data-x5="sc.open" style="width:100%;padding:9px;border-radius:10px;background:linear-gradient(135deg,#713f12,#0f172a);border:1px solid #f59e0b;color:#fef3c7;font-weight:800;font-size:12px"></button>'; sp.parentNode.insertBefore(d, sp);
  }
  function tick() {
    mount(); mountSk(); rbtn(); const s = SCH(); const kb = document.querySelector('#sk19 button');
    if (kb) { const t = !schOK() ? '🔒 流派心法(' + (R() < 1 ? '築基' : '隨劇情') + '開放)' : s.main ? `${SC[s.main].ic} 流派心法・${SC[s.main].n}${s.sub ? '+' + SC[s.sub].n : ''}・☯ 道行 ${fmt(s.dao)}` : '🏯 擇定流派(神通更強)'; if (kb.textContent !== t) kb.textContent = t; }
    if (!asked && schOK() && !s.main && state.tutorialDone && !currentBattle && !document.hidden) { asked = true; tab = 'pick'; X.open('school'); }
  }
  setTimeout(tick, 1100); setInterval(tick, 1500);
  /* ---------- 道行來源:歷練擊殺 ---------- */
  XT.winBattle90 = _wb => function () {
    const B = currentBattle, m = B && B.monster, normal = !!B && !B.isDemonTrib && !B.isWB && !B.isTower && !B.isSect && !B.special;
    const r = _wb.apply(this, arguments); if (normal && m) gainDao(m.isBoss ? 4 : 1); return r;
  };
  /* ---------- 稱號 ---------- */
  SK.forEach(sc => X.addTitle('t_sc_' + sc, SC[sc].title, `${SC[sc].n}心法修滿 36 層`, () => [total(sc), 36], { atkP: .03, hpP: .03 }, SC[sc].col));
  X.addTitle('t_sc2', '雙道合璧', '同時擁有本命與輔修流派', () => [(SCH().main ? 1 : 0) + (SCH().sub ? 1 : 0), 2], { dmg: .03, qiP: .05 }, '#2dd4bf');
  X.reTBY && X.reTBY();
  window.SCH19 = { SC, SK, SCH, fxOf, gainDao, main: () => SCH().main, sub: () => SCH().sub, trialDone: sc => !!SCH().trial[sc], refresh: render, RES, resKey };
})();


