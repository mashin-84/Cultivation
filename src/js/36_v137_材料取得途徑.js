/* ===== v137 材料取得途徑:任何畫面點材料 → 列出在哪裡取得,一鍵前往 =====
   - 歷練掉落直接讀 AREAS_DATA(改掉率、改區域會自動跟著變)
   - 其他系統(靈田、每日秘境、坊市、熔爐…)依各自程式的產出規則列出;尚未隨劇情開啟的系統不顯示
   - 點擊辨識:畫面上「只含一種材料名稱的短文字」視為該材料(煉丹/煉器配方的材料格、戰利品、紀錄…);
     本身就是按鈕的(例如坊市購買)不攔截,以免擋掉原本功能。行囊則在物品視窗加「取得途徑」鈕。 */
(() => {
  const $ = id => document.getElementById(id);
  const ON = k => { try { return !!(window.UNLOCK9 && UNLOCK9.on(k)); } catch (e) { return false; } };
  const R = () => state.realmIdx || 0;
  const RN = r => (REALM_DATA[r] && REALM_DATA[r].name) || '';
  const T7 = () => Math.min(7, Math.max(0, R()));
  const pct = c => c >= 1 ? '必定掉落' : `掉率 ${Math.round(c * 1000) / 10}%`;
  const isMat = id => !!(ITEMS[id] && ITEMS[id].type === 'material');
  const goTab = t => { try { goToTab(t); } catch (e) { const b = document.querySelector(`.nav-tab-btn[data-tab="${t}"]`); if (b) b.click(); } };
  const clickSel = s => { const b = document.querySelector(s); if (b) { b.click(); return true; } return false; };

  /* ---------- 途徑資料 ---------- */
  function areaRows(id) {
    const out = [];
    (AREAS_DATA || []).forEach((a, ai) => {
      let best = 0, who = '', n = 0;
      (a.monsters || []).forEach(m => (m.drops || []).forEach(d => {
        if ((d.item || d.id) !== id) return; const c = d.chance == null ? 1 : d.chance; n++;
        if (c > best) { best = c; who = m.name; }
      }));
      if (n) out.push({ k: 'area', area: ai, lock: R() < a.realmReq ? `需${RN(a.realmReq)}` : '', score: best,
        t: `⚔️ 歷練・${a.name}`, s: `${who}${n > 1 ? ` 等 ${n} 種妖獸` : ''}・${pct(best)}` });
    });
    return out;
  }
  const topArea = () => { let i = 0; (AREAS_DATA || []).forEach((a, ai) => { if (R() >= a.realmReq) i = ai; }); return i; };
  function sysRows(id) {
    const out = [], t = T7(), add = o => out.push(Object.assign({ score: 0 }, o));
    /* 歷練途中奇遇(009:天材地寶/遺跡寶箱,依區域給初階藥材與礦石) */
    if (id === 'herb_1' || id === 'ore_1') add({ k: 'area', area: Math.min(1, topArea()), score: .01, t: '⚔️ 歷練途中・奇遇採集', s: `青雲後山、萬妖幽谷途中偶得(${id === 'herb_1' ? '天材地寶' : '遺跡寶箱'})` });
    if (id === 'herb_2' || id === 'ore_2') { const ok = (AREAS_DATA[2] && R() >= AREAS_DATA[2].realmReq); add({ k: 'area', area: ok ? 2 : 0, lock: ok ? '' : `需${RN(AREAS_DATA[2] ? AREAS_DATA[2].realmReq : 2)}`, score: .01, t: '⚔️ 歷練途中・奇遇採集', s: `焚天火穴以後的區域途中偶得(${id === 'herb_2' ? '天材地寶' : '遺跡寶箱'})` }); }
    if (id === 'rn_1') add({ k: 'area', area: topArea(), score: .035, t: '⚔️ 歷練・任何區域', s: '擊敗妖獸 3.5%、區域首領 22% 掉落' });
    /* 洞府靈田(034 CROPS) */
    if (ON('alch') && window.X5 && X5.CROPS) {
      const c = X5.CROPS.find(x => x.id === id);
      if (c) add({ k: 'go', go: 'garden', lock: R() < c.r ? `需${RN(c.r)}` : '', score: .5, t: '🌾 洞府靈田・種植', s: `約 ${c.mins} 分鐘一熟,每塊田收 ${c.y[0]}~${c.y[1]} 個` });
      if (['herb_3', 'herb_4', 'herb_5'].includes(id)) add({ k: 'go', go: 'garden', score: .02, t: '🌾 洞府靈田・珍稀收成', s: '收成時偶有珍稀靈草' });
    }
    /* 每日秘境派遣(036:秘境階 = 目前境界,至少 1) */
    if (ON('secret')) {
      const st = Math.min(7, Math.max(1, R())), hv = st >= 5 ? 'herb_5' : st >= 2 ? 'herb_4' : 'herb_' + (st + 1), ov = st >= 5 ? 'ore_4' : st >= 3 ? 'ore_3' : st >= 2 ? 'ore_2' : 'ore_1';
      if (id === 'hb_' + st) add({ k: 'go', go: 'secret', score: .3, t: '🚪 每日秘境・派遣', s: '每處秘境都產(藥靈谷翻倍)' });
      if (id === 'bp_' + st) add({ k: 'go', go: 'secret', score: .3, t: '🚪 每日秘境・派遣', s: '每處秘境都產(妖獸巢穴翻倍)' });
      /* 特定秘境今日不一定開(每日隨機三處) */
      let today = null; try { today = SR17.defs().map(d => SR17.TPL[d.ti].id); } catch (e) { }
      const tp = (tid, nm, s) => { const off = today && !today.includes(tid); add({ k: 'go', go: 'secret', score: off ? .02 : .3, lock: off ? '今日未開' : '', t: `🚪 每日秘境・${nm}`, s: off ? `${s}(每日 0 點換新秘境)` : s }); };
      if (id === hv) tp('herb', '藥靈谷', '派遣至藥靈谷可得');
      if (id === ov) tp('mine', '玄晶礦脈', '派遣至玄晶礦脈可得');
      if (id === 'rn_1') { tp('ruin', '上古遺府', '派遣至上古遺府可得'); add({ k: 'go', go: 'secret', score: .15, t: '🚪 每日秘境・三境圓滿', s: '當日三處秘境全數完成的額外獎勵' }); }
    }
    /* 萬寶坊市(111:依目前境界隨機上架) */
    if (ON('alch')) {
      const pool = ['hb_' + t, (typeof TIER_ORE !== 'undefined' ? TIER_ORE[t] : ''), 'herb_1', 'bp_' + t, 'herb_2', 'herb_3', 'rn_1', 'tox_mat'];
      if (pool.includes(id)) add({ k: 'go', go: 'market', score: id === 'tox_mat' ? .9 : .05, t: '🏮 萬寶坊市・購買', s: id === 'tox_mat' ? '只在坊市販售,隨機上架(可刷新貨架)' : '隨機上架,可花靈石刷新貨架' });
    }
    if (id === 'rn_1') {
      if (ON('forge')) add({ k: 'go', go: 'aff', score: .2, t: '🪨 裝備器紋・靈石購買', s: '每日限量購買' });
      if (ON('forge')) add({ k: 'go', go: 'furnace', score: .1, t: '🔥 乾坤熔爐・熔煉', s: '熔掉多餘材料換器紋石' });
      if (ON('xian')) add({ k: 'go', go: 'xian', score: .1, t: '✨ 天機閣・仙緣兌換', s: '以仙緣兌換,每期限量' });
      if (ON('tower')) add({ k: 'go', go: 'tower', score: .1, t: '🗼 九九登天塔', s: '每 5 層與每 9 層塔主拾得' });
      if (ON('rift')) add({ k: 'note', score: .1, t: '🐉 天地異種', s: '擊敗後遺落 ×6(歷練中隨機出現)' });
      if (ON('jie')) add({ k: 'note', score: .05, t: '⚡ 九重劫', s: '渡劫成功獎勵' });
    }
    if (ON('rift') && (id === 'hb_' + t || id === 'bp_' + t)) add({ k: 'note', score: .05, t: '🐉 天地異種・寶箱', s: '擊敗後寶箱可能開出(歷練中隨機出現)' });
    return out;
  }
  function rows(id) {
    const L = areaRows(id).concat(sysRows(id));
    L.sort((a, b) => (!!a.lock - !!b.lock) || (b.score - a.score) || ((a.area || 0) - (b.area || 0)));
    const i = L.findIndex(r => !r.lock && r.k !== 'note'); if (i >= 0) L[i].rec = 1;
    return L;
  }

  /* ---------- 視窗 ---------- */
  const S = { id: '', need: 0 };
  const css = document.createElement('style');
  css.textContent = `
#x5s-src .m37h{display:flex;gap:12px;align-items:center;margin-bottom:8px}
#x5s-src .m37h .ic{width:56px;height:56px;flex:none;display:flex;align-items:center;justify-content:center;font-size:40px}
#x5s-src .m37h .ic>*{width:56px!important;height:56px!important;font-size:40px}
#x5s-src .m37n{font-weight:900;font-size:17px;font-family:'Noto Serif TC',serif}
#x5s-src .m37c{font-size:13px;margin-top:2px;opacity:.85}
#x5s-src .m37c b.no{color:#dc2626}
#x5s-src .m37d{font-size:12.5px;line-height:1.55;opacity:.8;margin:2px 0 10px}
#x5s-src .m37r{display:flex;align-items:center;gap:8px;padding:9px 10px;border-radius:10px;margin-bottom:7px;border:1px solid rgba(120,100,70,.28);background:rgba(255,252,244,.6)}
#x5s-src .m37r.rec{border-color:#d97706;box-shadow:0 0 0 1px rgba(217,119,6,.35) inset;background:rgba(254,243,199,.7)}
#x5s-src .m37r.lk{opacity:.5}
#x5s-src .m37r .tx{flex:1;min-width:0}
#x5s-src .m37r .t{font-weight:800;font-size:13.5px}
#x5s-src .m37r .s{font-size:12px;opacity:.75;margin-top:1px}
#x5s-src .m37r .tag{display:inline-block;margin-left:6px;padding:0 6px;border-radius:99px;background:#d97706;color:#fff;font-size:10.5px;font-weight:800;vertical-align:1px}
#x5s-src .m37r .x5-btn{flex:none;min-width:58px}
#x5s-src .m37r .lt{flex:none;font-size:12px;font-weight:700;color:#8a7a62}
#x5s-src .m37e{text-align:center;opacity:.7;padding:14px 0;font-size:13px}
.m37tap{cursor:pointer}`;
  document.head.appendChild(css);
  if (window.X5) X5.sheet('src', '🔎 取得途徑', b => {
    const id = S.id, it = ITEMS[id]; if (!it) { b.innerHTML = ''; return; }
    const have = (state.inventory || {})[id] || 0, lack = Math.max(0, S.need - have);
    const ic = it.icon && /</.test(it.icon) ? it.icon : `<span>${it.icon || '📦'}</span>`;
    let h = `<div class="m37h"><div class="ic">${ic}</div><div><div class="m37n">${it.name}</div><div class="m37c">持有 <b>${formatNum(have)}</b>${S.need ? `・需要 ${formatNum(S.need)}${lack ? `・<b class="no">還差 ${formatNum(lack)}</b>` : '・已足夠'}` : ''}</div></div></div>`;
    if (it.desc) h += `<div class="m37d">${it.desc}</div>`;
    const L = rows(id);
    if (!L.length) h += '<div class="m37e">目前沒有已開啟的取得途徑。</div>';
    L.forEach((r, i) => {
      const act = r.lock ? `<span class="lt">${r.lock}</span>` : r.k === 'note' ? '' : `<button class="x5-btn ${r.rec ? 'am' : ''}" data-x5="m37.go" data-i="${i}">前往</button>`;
      h += `<div class="m37r${r.rec ? ' rec' : ''}${r.lock ? ' lk' : ''}"><div class="tx"><div class="t">${r.t}${r.rec ? '<span class="tag">推薦</span>' : ''}</div><div class="s">${r.s}</div></div>${act}</div>`;
    });
    b.innerHTML = h; b._rows = L;
  });
  function open(id, need) {
    if (!isMat(id) || !window.X5) return false;
    S.id = id; S.need = need || 0;
    try { const sh = $('sheet13'); if (sh && sh.classList.contains('on')) sh.classList.remove('on'); } catch (e) { }
    X5.open('src'); return true;
  }

  /* ---------- 前往 ---------- */
  let pend = null, pendT = 0;
  function switchArea(i) {
    const a = AREAS_DATA[i]; if (!a) return;
    const sel = $('select-adventure-area');
    if (state.towerMode || i !== state.currentArea) { state.towerMode = false; if (sel) { sel.value = String(i); sel.dispatchEvent(new Event('change')); } try { _mapSig = ''; renderMap(); } catch (e) { } }
    setTimeout(() => { if (!state.autoExplore && !currentBattle) { const ab = $('btn-auto-explore'); if (ab) ab.click(); } }, 250);
    showToast(`前往【${a.name}】自動歷練`);
  }
  function goArea(i) {
    goTab('tab-adventure'); clickSel('[data-x32a="main"]');
    const busy = currentBattle || (window.BF113 && BF113.on);
    if (!busy) { switchArea(i); return; }
    pend = i; showToast(`本場戰鬥結束後前往【${AREAS_DATA[i].name}】自動歷練`);
    clearInterval(pendT); pendT = setInterval(() => { if (pend === null) { clearInterval(pendT); return; } if (!currentBattle && !(window.BF113 && BF113.on)) { const j = pend; pend = null; clearInterval(pendT); setTimeout(() => switchArea(j), 300); } }, 500);
  }
  const GO = {
    garden: () => { goTab('tab-abode'); setTimeout(() => clickSel('[data-h44="gd"]'), 150); },
    secret: () => { goTab('tab-adventure'); setTimeout(() => clickSel('#x32-asub-d') || clickSel('[data-x5="m6.sr"]'), 150); },
    market: () => { goTab('tab-crafting'); setTimeout(() => clickSel('[data-c52="mk"]') || clickSel('#x32-mk-btn'), 150); },
    furnace: () => { clickSel('#btn-furnace') || clickSel('[data-x5="fn.open"]'); },
    aff: () => { clickSel('[data-x5="af.open"]'); },
    xian: () => { clickSel('[data-x5="xj.open"]'); },
    tower: () => { goTab('tab-adventure'); clickSel('[data-x32a="main"]'); setTimeout(() => clickSel('button[data-tower]'), 150); }
  };
  if (window.X5) X5.act('m37.go', t => {
    const b = $('x5b-src'), r = b && b._rows && b._rows[+t.dataset.i]; if (!r || r.lock) return;
    X5.close('src');
    if (r.k === 'area') goArea(r.area); else if (GO[r.go]) GO[r.go]();
  });

  /* ---------- 點擊辨識 ---------- */
  let NAMES = null;
  const names = () => NAMES || (NAMES = Object.values(ITEMS).filter(i => i.type === 'material' && i.name).map(i => [i.name, i.id]).sort((a, b) => b[0].length - a[0].length));
  const SKIP = '#x5s-src,[data-i13],#st28,#st28cs,.toast,#toast-container,input,textarea,select,#bf113,#bf-root';
  const num = s => { const m = /^\s*([\d,]+)\s*$/.exec(s || ''); return m ? +m[1].replace(/,/g, '') : NaN; };
  function hit(t) {
    let el = t;
    for (let k = 0; el && el !== document.body && k < 4; k++, el = el.parentElement) {
      const tx = (el.textContent || '').trim(); if (!tx) continue; if (tx.length > 30) return null;
      const f = names().filter(([n]) => tx.includes(n)); if (f.length > 1) return null;
      if (f.length === 1) return { el, id: f[0][1], tx };
    }
    return null;
  }
  document.addEventListener('click', e => {
    const t = e.target; if (!t || !t.closest || t.closest(SKIP)) return;
    const h = hit(t); if (!h) return;
    const btn = h.el.closest('button,a,[data-mk111],[role="button"]');
    if (btn === h.el || (btn && h.el.contains(btn))) return;       /* 本身就是按鈕(購買、選擇等)→ 不攔 */
    if (btn) { const bt = (btn.textContent || '').trim(); if (bt.length <= h.tx.length + 4) return; }
    let need = 0; const m = /([\d,]+)\s*\/\s*([\d,]+)\s*$/.exec(h.tx); if (m) { const a = num(m[1]), b = num(m[2]); if (b > 0 && a >= 0) need = b; }
    if (!open(h.id, need)) return;
    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
  }, true);
  /* 讓可點的材料格看得出能點 */
  function mark() {
    document.querySelectorAll('.mats span:not(.m37tap)').forEach(s => s.classList.add('m37tap'));
  }
  setInterval(mark, 1500);

  /* ---------- 行囊物品視窗:材料加「取得途徑」 ---------- */
  {
    const mo = new MutationObserver(() => {
      const sh = $('sheet13'); if (!sh || !sh.classList.contains('on')) return;
      const pn = sh.querySelector('.pn'); if (!pn || pn.querySelector('[data-x5="m37.inv"]')) return;
      const nm = pn.querySelector('.ttl'); if (!nm) return; const f = names().find(([n]) => nm.textContent.trim() === n); if (!f) return;
      const row = pn.querySelector('.bt,.btns,.acts') || pn.lastElementChild; const b = document.createElement('button');
      b.className = 'x5-btn am'; b.dataset.x5 = 'm37.inv'; b.dataset.id = f[1]; b.textContent = '🔎 取得途徑'; b.style.cssText = 'margin:8px 0 0;width:100%';
      (row && row.parentNode === pn ? pn.insertBefore(b, row) : pn.appendChild(b));
    });
    const hook = () => { const sh = $('sheet13'); if (sh) mo.observe(sh, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] }); else setTimeout(hook, 1000); };
    hook();
    if (window.X5) X5.act('m37.inv', t => open(t.dataset.id, 0));
  }
  window.MAT37 = { open, rows };
})();
