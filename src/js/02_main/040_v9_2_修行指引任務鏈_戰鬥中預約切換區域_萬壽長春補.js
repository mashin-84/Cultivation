/* ===== v9.2:修行指引任務鏈 · 戰鬥中預約切換區域 · 萬壽長春補發 ===== */
(function () {
  const $ = id => document.getElementById(id), X = window.X5, R = () => state.realmIdx || 0;
  /* ---------- 修行指引 ---------- */
  const GD9 = () => { if (!state.guide || typeof state.guide !== 'object') state.guide = {}; const g = state.guide; if (!g.done) g.done = {}; if (!g.skip || Object.keys(g.skip).length) g.skip = {};   /* v79:不再提供略過,舊存檔的略過項目恢復 */ if (typeof g.v !== 'number') g.v = 0; return g; };
  const aff = () => { const a = state.aff || {}; return Object.keys(a).some(k => a[k] && a[k].L && a[k].L.length); };
  const gt = (tab, fn) => () => { try { goToTab(tab); } catch (e) { } if (fn) setTimeout(fn, 150); };
  const STEPS = [
    { id: 'sk', ic: '⚡', n: '學習神通', d: '前往【人物】→「修行」→「神通」學習第二門神通', av: () => true, dn: () => !!(state.tut2 && state.tut2.sk) || Object.keys(skState().learned).length >= 2, go: gt('tab-techniques', () => { const b = $('subtab-skills-btn'); if (b) b.click(); }), rw: { m: 2 } },
    { id: 'ming', ic: '🦴', n: '命格修行', d: '到洞府【煉體台】錘鍊肉身,【靈獸園】孵化靈寵', av: () => !!(window.UNLOCK9 && UNLOCK9.on('body')), dn: () => !!(state.tut2 && state.tut2.ming), go: gt('tab-ming'), rw: { m: 2 } },
    { id: 'garden', ic: '🌱', n: '靈田播種', d: '洞府靈田:點「一鍵播種」選想煉的丹藥', av: () => true, dn: () => X.ST().plant >= 1, go: gt('tab-abode', () => X.open('sow')), rw: { m: 2 } },
    { id: 'sect', ic: '🏛️', n: '拜入宗門', d: '前往【宗門】入門,領見面禮與每日任務', av: () => false, dn: () => !!state.sect || Object.keys(state.sectGrad || {}).length > 0, go: gt('tab-sect'), rw: { m: 3, items: { pill_1: 2 } } },
    { id: 'sch', ic: '🏯', n: '擇定流派', d: '白澤、墨塵指點過了:選劍/法/體/丹為本命流派', av: () => !!(window.UNLOCK9 && UNLOCK9.on('school')), dn: () => !!(window.SCH19 && SCH19.main()), go: () => X.open('school'), rw: { m: 3, items: { rn_1: 2 } } },
    { id: 'sr', ic: '🚪', n: '每日秘境', d: '前往【歷練】,完成一次每日秘境', av: () => !!(window.UNLOCK9 && UNLOCK9.on('secret')), dn: () => X.ST().sr >= 1, go: gt('tab-adventure'), rw: { m: 3 } },
    { id: 'aff', ic: '🔮', n: '認識器紋', d: '到【人物】點一件裝備,在裝備卡上開啟「器紋」', av: () => !!(window.UNLOCK9 && UNLOCK9.on('forge')), dn: aff, go: gt('tab-techniques', () => { try { AFF16.openSlot('weapon'); } catch (e) { } }), rw: { m: 3, items: { rn_1: 3 } } },
    { id: 'dex', ic: '📚', n: '翻閱圖鑑', d: '圖鑑收集達 10%,領取里程碑獎勵', av: () => R() >= 1, dn: () => (X.dexPct ? X.dexPct() : 0) >= 10, go: () => X.open('dex'), rw: { m: 2 } },
    { id: 'sub', ic: '🌓', n: '輔修試煉', d: '通過一派試煉,兼修第二流派', av: () => !!(window.UNLOCK9 && UNLOCK9.on('sub')), dn: () => !!(window.SCH19 && SCH19.sub()), go: () => X.open('school'), rw: { m: 4, items: { rn_1: 3 } } },
    { id: 'xian', ic: '🎐', n: '天機悟道', d: '化神期:開啟天機悟道,到「九重劫」渡過第一重風劫,或用仙緣提升神識、道果', av: () => !!(window.UNLOCK9 && UNLOCK9.on('xian')), dn: () => (state.xianTot || 0) > 0 || !!(state.jie && state.jie.cleared > 0) || Object.values(state.shen || {}).some(v => v > 0) || Object.values(state.guo || {}).some(v => v > 0), go: () => X.open('xian'), rw: { m: 5, xian: 5 } }
  ];
  const reward = s => { const t = Math.max(1, X.tier()), o = { stones: X.sb(t) * (s.rw.m || 1) }; if (s.rw.items) o.items = s.rw.items; if (s.rw.xian) o.xian = s.rw.xian; return o; };
  const nextStep = () => { const g = GD9(); return STEPS.find(s => s.av() && !g.done[s.id] && !g.skip[s.id]); };
  function scan() {
    if ((state.tutorialStep || 0) < 4) return; const g = GD9(); let changed = false, got = [];
    const silent = g.v === 0 && (R() >= 1 || (state.reincarnationCount || 0) > 0); if (g.v === 0) g.v = 1;
    STEPS.forEach(s => { if (g.done[s.id] || !s.av()) return; let ok = false; try { ok = s.dn(); } catch (e) { } if (!ok) return; g.done[s.id] = 1; changed = true; if (!silent) { const L = X.give(reward(s), true); got.push(`${s.ic}${s.n}:${L.join('、')}`); } });
    if (got.length) { audio.playFanfare(); got.forEach(t => showToast('📖 指引達成 ' + t)); try { updateTopBar(); renderInventory(); } catch (e) { } }
    if (changed) saveGame();
    const sig = JSON.stringify([STEPS.map(s => s.av() ? 1 : 0), g.done, g.skip]); if (sig !== scan.sig) { scan.sig = sig; updateTutorialBanner(); X.refresh('guide'); }
  }
  const addGo = () => {
    if (!$('tut-go')) { const sk = $('btn-skip-tutorial'); if (sk) { sk.insertAdjacentHTML('beforebegin', '<span style="display:flex;gap:4px;flex:none;margin-left:4px"><button id="tut-go" data-x5="gd9.go" style="font-size:10px;font-weight:800;padding:2px 8px;border-radius:6px;background:#b45309;color:#fff;border:1px solid #f59e0b">前往</button><button id="tut-list" data-x5="gd9.list" style="font-size:11px;padding:1px 6px;border-radius:6px;background:#1e293b;border:1px solid #475569">清單</button></span>'); sk.textContent = '略過'; sk.style.whiteSpace = 'nowrap'; sk.style.flex = 'none'; sk.style.fontSize = '10px'; sk.style.padding = '2px 6px'; } }
  };
  const _utb = updateTutorialBanner;
  updateTutorialBanner = function () {
    if (state.tutorialStep === 1 && (state.arrayLevel || 1) > 1) state.tutorialStep = 2;   /* v92:先升過聚靈陣也算完成第 2 步 */
    if ((state.tutorialStep || 0) < 4) { const r = _utb.apply(this, arguments); addGo(); if ((state.tutorialStep || 0) === 3 && window.UNLOCK9 && !UNLOCK9.on('alch')) { const tx = $('tutorial-guide-text'); if (tx) tx.innerText = '第 4 步：修煉至【練氣第5層】開啟煉丹閣,再到【丹器】煉製第一枚【聚氣丹】!'; } const g = $('tut-go'); if (g && g.parentElement) g.parentElement.style.display = 'flex'; return r; }
    const banner = $('tutorial-guide-banner'), textEl = $('tutorial-guide-text'); if (!banner || !textEl) return;
    if (!$('tut-go')) { const sk = $('btn-skip-tutorial'); if (sk) { sk.insertAdjacentHTML('beforebegin', '<span style="display:flex;gap:4px;flex:none;margin-left:4px"><button id="tut-go" data-x5="gd9.go" style="font-size:10px;font-weight:800;padding:2px 8px;border-radius:6px;background:#b45309;color:#fff;border:1px solid #f59e0b">前往</button><button id="tut-list" data-x5="gd9.list" style="font-size:11px;padding:1px 6px;border-radius:6px;background:#1e293b;border:1px solid #475569">清單</button></span>'); sk.textContent = '略過'; sk.style.whiteSpace = 'nowrap'; sk.style.flex = 'none'; sk.style.fontSize = '10px'; sk.style.padding = '2px 6px'; } }
    const g = GD9(), n = nextStep(), av = STEPS.filter(s => s.av()), dn = av.filter(s => g.done[s.id] || g.skip[s.id]).length;
    if (!n) { banner.classList.add('hidden'); return; }
    banner.classList.remove('hidden'); textEl.textContent = `${dn}/${av.length} ${n.ic} ${n.d}`;
  };
  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('#btn-skip-tutorial'); if (!b || (state.tutorialStep || 0) < 4) return;
    e.stopImmediatePropagation(); e.preventDefault(); const n = nextStep(); if (n) { GD9().skip[n.id] = 1; saveGame(); scan.sig = ''; scan(); }
  }, true);
  X.act('gd9.go', () => {
    const ts = state.tutorialStep || 0;
    if (ts === 3 && window.UNLOCK9 && !UNLOCK9.on('alch')) { try { showToast('【煉丹閣】練氣第5層開啟——先到洞府吐納修煉吧。'); goToTab('tab-abode'); } catch (e) { } return; }
    if (ts < 4) { const t = ['tab-abode', 'tab-abode', 'tab-adventure', 'tab-crafting'][ts]; try { goToTab(t); } catch (e) { } return; }   /* 新手四步:依步驟前往對應分頁 */
    const n = nextStep(); if (n) n.go();
  });
  X.act('gd9.list', () => X.open('guide'));
  X.act('gd9.step', t => { const s = STEPS.find(x => x.id === t.dataset.id); if (s) { X.close('guide'); s.go(); } });
  X.act('gd9.skipall', () => { const g = GD9(); STEPS.forEach(s => { if (!g.done[s.id]) g.skip[s.id] = 1; }); saveGame(); scan.sig = ''; scan(); });
  X.act('gd9.unskip', () => { const g = GD9(); g.skip = {}; saveGame(); scan.sig = ''; scan(); });
  X.sheet('guide', '📖 修行指引', b => {
    const g = GD9(); let h = '<div class="x5-sub" style="margin-bottom:8px">依序完成可領小獎勵;沒開放的項目到達境界後自動出現。完成會自動偵測,不必手動確認。</div>';
    STEPS.forEach(s => {
      const av = s.av(), dn = g.done[s.id], sk = g.skip[s.id], rw = reward(s);
      h += `<div class="x5-cd" style="margin-bottom:6px;display:flex;align-items:center;gap:8px;${av ? '' : 'opacity:.4'}"><div style="font-size:22px;width:30px;text-align:center">${dn ? '✅' : s.ic}</div><div style="flex:1;min-width:0"><b style="color:${dn ? '#4ade80' : '#fcd34d'}">${s.n}</b>${sk && !dn ? ' <span class="x5-sub">(已略過)</span>' : ''}<div class="x5-sub">${av ? s.d : '🔒 境界到達後開放'}</div>${dn ? '' : `<div class="x5-sub" style="color:#a5b4fc">獎勵:${X.fxText ? '' : ''}💎${formatNum(rw.stones)}${s.rw.items ? '、' + Object.keys(s.rw.items).map(k => ITEMS[k] ? ITEMS[k].name + '×' + s.rw.items[k] : '').join('、') : ''}${s.rw.xian ? '、🌸仙緣×' + s.rw.xian : ''}</div>`}</div>${av && !dn ? `<button class="x5-btn" data-x5="gd9.step" data-id="${s.id}">前往</button>` : ''}</div>`;
    });
    b.innerHTML = h;
  });
  /* ---------- 戰鬥中預約切換區域 ---------- */
  let pend = null;
  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('#region-strip button[data-area]'); if (!b || !currentBattle) return;
    e.stopImmediatePropagation(); e.preventDefault();
    const i = +b.dataset.area, a = AREAS_DATA[i]; if (!a) return;
    if (state.realmIdx < a.realmReq) { showToast(`需達到【${REALM_DATA[a.realmReq].name}】方可涉足`); return; }
    if (pend === i) { pend = null; showToast('已取消預約。'); decorate(); return; }
    if (i === state.currentArea && !state.towerMode) { pend = null; showToast('已在此地歷練。'); decorate(); return; }
    pend = i; showToast(`⏩ 已預約:本場戰鬥結束後前往【${a.name}】`); decorate();
  }, true);
  function decorate() {
    document.querySelectorAll('#region-strip button[data-area]').forEach(b => { const on = pend !== null && +b.dataset.area === pend && currentBattle; b.style.outline = on ? '2px dashed #38bdf8' : ''; b.style.outlineOffset = on ? '1px' : ''; });
    if (pend !== null && !currentBattle) pend = null;
  }
  function applyPending() {
    if (pend === null) return; const i = pend; pend = null; const wasAuto = !!state.autoExplore, sel = $('select-adventure-area'); if (!sel || !AREAS_DATA[i] || state.realmIdx < AREAS_DATA[i].realmReq) return;
    state.towerMode = false; sel.value = String(i); sel.dispatchEvent(new Event('change')); try { _mapSig = ''; renderMap(); } catch (e) { }
    showToast(`已前往【${AREAS_DATA[i].name}】`);
    if (wasAuto) setTimeout(() => { if (!state.autoExplore && !currentBattle) { const ab = $('btn-auto-explore'); if (ab) ab.click(); } }, 400);
    decorate();
  }
  { XT.endBattle92 = _eb => function () { const r = _eb.apply(this, arguments); if (pend !== null) setTimeout(applyPending, 0); return r; }; }
  /* ---------- 萬壽長春補發(舊版天賦未套用壽元) ---------- */
  function talFix() {
    if (state.talFix) return; state.talFix = true; const l = (state.talents || {}).talent_5 || 0;
    if (l > 0) { state.maxAge += 100 * Math.min(l, 3); showToast(`🌿 【萬壽長春】修正:壽元上限補發 +${100 * Math.min(l, 3)} 歲`); }
    saveGame();
  }
  function tick() { try { talFix(); scan(); decorate(); } catch (e) { console.warn('x20', e); } }
  setTimeout(tick, 1500); setInterval(tick, 1500);
})();


const GEN_AR={"bg": ["data:image/webp;base64,@@IMG:GEN_AR/bg@@", "data:image/webp;base64,@@IMG:GEN_AR/bg_1@@", "data:image/webp;base64,@@IMG:GEN_AR/bg_2@@", "data:image/webp;base64,@@IMG:GEN_AR/bg_3@@", "data:image/webp;base64,@@IMG:GEN_AR/bg_4@@"], "fx": {"fx01": "data:image/webp;base64,@@IMG:GEN_AR_fx/fx01@@", "fx02": "data:image/webp;base64,@@IMG:GEN_AR_fx/fx02@@", "fx03": "data:image/webp;base64,@@IMG:GEN_AR_fx/fx03@@", "fx04": "data:image/webp;base64,@@IMG:GEN_AR_fx/fx04@@", "fx05": "data:image/webp;base64,@@IMG:GEN_AR_fx/fx05@@", "fx06": "data:image/webp;base64,@@IMG:GEN_AR_fx/fx06@@", "fx07": "data:image/webp;base64,@@IMG:GEN_AR_fx/fx07@@", "fx08": "data:image/webp;base64,@@IMG:GEN_AR_fx/fx08@@", "fx09": "data:image/webp;base64,@@IMG:GEN_AR_fx/fx09@@", "fx10": "data:image/webp;base64,@@IMG:GEN_AR_fx/fx10@@", "fx11": "data:image/webp;base64,@@IMG:GEN_AR_fx/fx11@@", "fx12": "data:image/webp;base64,@@IMG:GEN_AR_fx/fx12@@", "fx13": "data:image/webp;base64,@@IMG:GEN_AR_fx/fx13@@", "fx14": "data:image/webp;base64,@@IMG:GEN_AR_fx/fx14@@", "fx15": "data:image/webp;base64,@@IMG:GEN_AR_fx/fx15@@", "fx16": "data:image/webp;base64,@@IMG:GEN_AR_fx/fx16@@"}};


