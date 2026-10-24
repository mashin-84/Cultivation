
/* ===== v12.0 介面重整・階段一:人物頁(淺色水墨)・裝備整合 ===== */
(function () {
  const $ = id => document.getElementById(id);
  const fm = n => (typeof formatNum === 'function' ? formatNum(Math.floor(n)) : String(Math.floor(n)));
  const on = k => { try { return window.UNLOCK9 && UNLOCK9.on ? !!UNLOCK9.on(k) : !!(state.un9 && state.un9[k]); } catch (e) { return true; } };
  const QN = { common: '凡品', uncommon: '良品', rare: '上品', epic: '極品', immortal: '仙品', mythic: '古仙遺品' };
  const QC = { common: '#6b6458', uncommon: '#3f7d4e', rare: '#2f6fa8', epic: '#7a3fa0', immortal: '#b07d1a', mythic: '#b0362c' };
  const qc = it => QC[it && it.quality] || '#4a4135';
  const LEFT = ['weapon', 'helm', 'armor', 'boots'], RIGHT = ['artifact', 'pendant', 'ring'], ORDER = LEFT.concat(RIGHT);
  const score = it => (it.atk || 0) * 2 + (it.def || 0) * 1.5 + (it.hp || 0) * .3;
  const icoH = (it, fb) => { const i = it ? it.icon : fb; return i && /</.test(i) ? i : `<span class="em">${i || '📦'}</span>`; };
  const curIt = sl => { const id = (state.equipment || {})[sl]; return id && ITEMS[id] ? ITEMS[id] : null; };
  const enhOf = sl => ((state.enhance || {})[sl]) || 0;
  function better(sl) {
    const cur = curIt(sl), bs = cur ? score(cur) : -1, inv = state.inventory || {}; let best = null, b = bs;
    Object.keys(inv).forEach(k => { const it = ITEMS[k]; if (it && it.type === 'equipment' && it.slot === sl && inv[k] > 0 && score(it) > b) { b = score(it); best = k; } });
    return best;
  }
  function canEnh(sl) {
    if (!on('forge') || !curIt(sl)) return false; const e = enhOf(sl); if (e >= enhCap()) return false;
    const c = enhCost(e); return state.stones >= c.stone && ((state.inventory || {})[c.oreKey] || 0) >= c.ore;
  }
  const slotDot = sl => !!better(sl) || canEnh(sl);
  const xDot = { sch: () => !!(window.SC38 && SC38.alert()), body: () => { try { return (state.body || 0) < bodyCap() && state.stones >= bodyCost(); } catch (e) { return false; } }, xian: () => !!(window.XJ37 && XJ37.alert()) };   /* v108 */
  window.CH51 = { alert: () => { try { return ORDER.some(slotDot) || techDot() || talDot() || xDot.sch() || xDot.body() || xDot.xian(); } catch (e) { return false; } } };

  /* ---------- 樣式 ---------- */
  const css = document.createElement('style');
  css.textContent = `
#ch51,#bk51,#ov51 .pn{--pp:#f1ead9;--ink:#2a241c;--ink2:#6b5f4f;--seal:#9e2b25;--gold:#8a6a22;--ln:#b9a98c}
#ch51{position:relative;display:flex;flex-direction:column;gap:6px;margin:0 0 6px;padding:10px 10px 8px;border-radius:14px;overflow:hidden;color:var(--ink);font-family:'Noto Serif TC',serif;
 background:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 200' preserveAspectRatio='none'><path d='M0 140 Q50 80 105 125 T215 100 T330 120 T400 95 V200 H0Z' fill='%23544a3c' opacity='.09'/><path d='M0 172 Q85 128 165 160 T305 146 T400 156 V200 H0Z' fill='%23544a3c' opacity='.13'/></svg>") bottom/100% 42% no-repeat,radial-gradient(ellipse at 50% 28%,#faf6ec,#efe6d2 62%,#e2d5b8);box-shadow:inset 0 0 0 1px #cdbf9f,inset 0 0 40px rgba(120,100,60,.18)}
#ch51 .hd{display:flex;align-items:center;gap:8px}
#ch51 .hd .nm b{display:block;font-size:17px;font-weight:900;letter-spacing:1px}
#ch51 .hd .nm span{font-size:11px;color:var(--ink2)}
#ch51 .hd .cp{margin-left:auto;text-align:right;line-height:1.1}
#ch51 .hd .cp span{font-size:10px;color:var(--ink2);letter-spacing:2px}
#ch51 .hd .cp b{display:block;font-size:19px;font-weight:900;color:var(--seal)}
#ch51 .sealb{flex:none;width:40px;height:40px;border-radius:50%;background:radial-gradient(circle at 40% 35%,#4a4036,#1f1a14);color:#f3ead6;font-weight:900;font-size:12px;box-shadow:0 0 0 2px #e9dfc8,0 0 0 3px #3a3128;position:relative}
#ch51 .stg{flex:1;min-height:0;display:grid;grid-template-columns:66px 1fr 66px;gap:4px;position:relative}
#ch51 .art{position:relative;min-height:0;display:flex;align-items:flex-end;justify-content:center}
#ch51 .art img{max-width:118%;max-height:100%;object-fit:contain;-webkit-mask-image:linear-gradient(#000 95%,transparent);mask-image:linear-gradient(#000 95%,transparent);filter:drop-shadow(0 6px 10px rgba(60,40,10,.25))}
#ch51 .col{display:flex;flex-direction:column;justify-content:space-around;gap:4px;z-index:1}
#ch51 .sl{position:relative;width:64px;display:flex;flex-direction:column;align-items:center;gap:1px;background:none;border:0;padding:0}
#ch51 .sl .bx{position:relative;width:54px;height:54px;border-radius:10px;background:linear-gradient(160deg,#fbf7ee,#e9dfc9);box-shadow:inset 0 0 0 1.5px var(--q,#b9a98c),0 2px 4px rgba(80,60,20,.18);display:flex;align-items:center;justify-content:center;font-size:26px;overflow:hidden}
#ch51 .sl .bx .ii,#ch51 .sl .bx img{width:44px;height:44px}
#ch51 .sl.em .bx{opacity:.45;filter:grayscale(1)}
#ch51 .sl .lv{position:absolute;right:2px;bottom:1px;font-size:10px;font-weight:900;color:#fff;background:rgba(42,36,28,.72);border-radius:6px;padding:0 3px;line-height:14px}
#ch51 .sl .nm{font-size:10.5px;color:var(--ink2);max-width:64px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#ch51 .rd,#bk51 .rd{position:absolute;top:-2px;right:2px;width:10px;height:10px;border-radius:50%;background:#d13b2f;box-shadow:0 0 0 2px #f6efe0}
#ch51 .sts{display:grid;grid-template-columns:repeat(4,1fr) auto;gap:4px;align-items:stretch}
#ch51 .sts>div{background:rgba(255,252,244,.72);border:1px solid #d6c9ab;border-radius:9px;padding:4px 2px;text-align:center;line-height:1.15}
#ch51 .sts>div span{display:block;font-size:10px;color:var(--ink2)}
#ch51 .sts>div b{font-size:13px;font-weight:900}
#ch51 .sts button{border-radius:9px;padding:0 9px;background:#2b2620;color:#f3ead6;font-weight:800;font-size:11px;writing-mode:horizontal-tb}
#ch51 .acts{display:flex;gap:6px}
#ch51 .acts button{flex:1;position:relative;min-height:38px;border-radius:19px;background:linear-gradient(180deg,#3a3229,#211c16);color:#f3ead6;font-weight:800;font-size:12.5px;letter-spacing:1px;box-shadow:0 2px 4px rgba(40,30,10,.3)}
#ch51 .acts button.pr{background:linear-gradient(180deg,#b23a2e,#7e1f18)}
#ch51 .xl{display:flex;justify-content:space-between;gap:4px;padding-top:2px}
#ch51 .xl button{position:relative;display:flex;flex-direction:column;align-items:center;gap:2px;background:none;border:0;padding:0;flex:1}
#ch51 .xl button i.sl51{width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-style:normal;font-weight:900;font-size:15px;color:#f3ead6;background:radial-gradient(circle at 40% 35%,#4a4036,#17130e);box-shadow:0 0 0 2px #efe6d2,0 0 0 3.5px #3a3128,0 3px 6px rgba(40,30,10,.3);font-family:'Noto Serif TC',serif}
#ch51 .xl button span{font-size:10px;color:var(--ink2)}
#ch51 .xl button.lk{opacity:.4}
#ch51 .xl .x5-dot,#ch51 .xl .rd{top:-1px;right:calc(50% - 24px)}
#pc44{display:none!important}
#bk51{display:flex;align-items:center;gap:8px;margin:0 0 8px;padding:8px 10px;border-radius:12px;background:linear-gradient(180deg,#f6f0e2,#e9dfc7);color:var(--ink);box-shadow:inset 0 0 0 1px #cdbf9f}
#bk51 button{padding:6px 12px;border-radius:16px;background:#2b2620;color:#f3ead6;font-weight:800;font-size:12px}
#bk51 b{font-family:'Noto Serif TC',serif;font-size:15px}
#ov51{position:fixed;inset:0;z-index:72;background:rgba(30,24,16,.55);display:flex;align-items:flex-end;justify-content:center}
#ov51.h{display:none}
#ov51 .pn{width:100%;max-width:448px;max-height:86dvh;overflow-y:auto;border-radius:16px 16px 0 0;padding:12px 14px 20px;color:var(--ink);background:radial-gradient(ellipse at 50% 0,#fbf8ef,#efe6d2 70%,#e5d9bd);box-shadow:0 -6px 24px rgba(0,0,0,.35);font-size:12.5px}
#ov51 .t{display:flex;align-items:center;gap:8px;margin-bottom:8px}
#ov51 .t .bx{width:46px;height:46px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:24px;background:linear-gradient(160deg,#fbf7ee,#e9dfc9);box-shadow:inset 0 0 0 1.5px var(--q,#b9a98c)}
#ov51 .t .bx .ii{width:38px;height:38px}
#ov51 .t .nm{flex:1;min-width:0}
#ov51 .t .nm b{font-size:15px;font-weight:900;font-family:'Noto Serif TC',serif}
#ov51 .t .nm div{font-size:11px;color:var(--ink2)}
#ov51 .ar{width:34px;height:34px;border-radius:50%;background:#2b2620;color:#f3ead6;font-weight:900}
#ov51 .x{width:30px;height:30px;border-radius:50%;background:transparent;border:1px solid #b9a98c;color:var(--ink2)}
#ov51 .cd{background:rgba(255,252,244,.75);border:1px solid #d6c9ab;border-radius:10px;padding:8px 10px;margin-bottom:8px}
#ov51 .cd h4{font-weight:900;font-size:12.5px;margin-bottom:4px;color:var(--seal);font-family:'Noto Serif TC',serif}
#ov51 .row{display:flex;align-items:center;justify-content:space-between;gap:8px}
#ov51 .sub{font-size:11px;color:var(--ink2)}
#ov51 .bt{display:flex;gap:6px;margin-top:6px}
#ov51 .bt button,#ov51 .eqb{flex:1;min-height:36px;border-radius:18px;background:linear-gradient(180deg,#3a3229,#211c16);color:#f3ead6;font-weight:800;font-size:12px}
#ov51 .bt button.pr{background:linear-gradient(180deg,#b23a2e,#7e1f18)}
#ov51 button:disabled{opacity:.4}
#ov51 .eqr{display:flex;align-items:center;gap:8px;padding:5px 0;border-top:1px dashed #d6c9ab}
#ov51 .eqr .em,#ov51 .eqr .ii{width:28px;height:28px;font-size:20px;flex:none}
#ov51 .eqb{flex:none;min-height:30px;padding:0 12px}
#ov51 .up{color:#2f7a3e;font-weight:800}#ov51 .dn{color:#a3352b;font-weight:800}
#ov51 .afl{display:flex;justify-content:space-between;padding:2px 0}
#att51 .bg-gradient-to-br{background:none!important;border:0!important;padding:0!important}
#att51 *{color:var(--ink)!important;border-color:#d6c9ab!important}
#att51 .text-slate-400,#att51 .text-slate-500,#att51 .text-slate-300{color:var(--ink2)!important}
#att51 div,#att51 details,#att51 section{background:transparent!important;box-shadow:none!important}
#att51 details{border:1px solid #d6c9ab!important;border-radius:10px;padding:6px 8px!important;margin-top:8px}
#att51 summary{font-weight:800;color:var(--seal)!important;margin-top:6px}
#m6-forge #btn-enhance-all,#m6-forge #btn-enhance-equipped,#m6-forge #aff16{display:none!important}
`;
  document.head.appendChild(css);

  /* ---------- 結構 ---------- */
  const tec = $('tab-techniques'); if (!tec) return;
  let ch = $('ch51'), bk = $('bk51'), ov = $('ov51');
  if (!ch) { ch = document.createElement('div'); ch.id = 'ch51';
  bk = document.createElement('div'); bk.id = 'bk51'; bk.innerHTML = '<button data-a51="back">← 返回人物</button><b></b>';
  tec.parentNode.insertBefore(ch, tec); tec.parentNode.insertBefore(bk, tec); }
  if (!ov) { ov = document.createElement('div'); ov.id = 'ov51'; ov.className = 'h'; ov.innerHTML = '<div class="pn"></div>'; document.body.appendChild(ov); }
  const pn = ov.firstChild;
  const isOv = () => tec.classList.contains('pc-ov');
  const shown = () => !tec.classList.contains('hidden');
  const SECN = { tech: '功法', tal: '天賦', sk: '神通', root: '靈根' };
  function vis() {
    const s = shown(), o = isOv();
    ch.style.display = s && o ? '' : 'none';
    bk.style.display = s && !o ? '' : 'none';
    const sec = tec.dataset.sec51 || ''; const t = bk.querySelector('b'); const nm = sec ? SECN[sec] : '修行'; if (t.textContent !== nm) t.textContent = nm;
    if (s && o) fit();
  }
  new MutationObserver(vis).observe(tec, { attributes: true, attributeFilter: ['class'] });
  function fit() {
    const nav = $('nav25') || document.querySelector('nav'); const top = (e => { let s = 0, p = e.parentElement; while (p) { s += p.scrollTop || 0; p = p.parentElement; } return e.getBoundingClientRect().top + s; })(ch);
    const nh = nav ? nav.getBoundingClientRect().height : 64; const h = Math.max(520, Math.floor(window.innerHeight - Math.max(0, top) - nh - 10));
    if (ch.style.height !== h + 'px') ch.style.height = h + 'px';
  }
  window.addEventListener('resize', () => { if (ch.style.display !== 'none') fit(); });

  /* ---------- 修行分區 ---------- */
  function mark() {
    const kids = [...tec.children];
    const rootBtn = $('btn-wash-root'); const rc = rootBtn && kids.find(k => k.contains(rootBtn)); if (rc) rc.dataset.p51 = 'root';
    const sb = $('subtab-tech-list-btn'); const bar = sb && kids.find(k => k.contains(sb)); if (bar) bar.dataset.p51 = 'bar';
    const rs = $('tech-resonance-badge'); if (rs) rs.dataset.p51 = 'tech';
    [['subtab-tech-content', 'tech'], ['subtab-talents-content', 'tal'], ['subtab-skills-content', 'sk']].forEach(([id, k]) => { const e = $(id); if (e) e.dataset.p51 = k; });
    const m6 = $('m6-tech'); if (m6) m6.dataset.p51 = 'm6';
    kids.forEach(k => { if (k.classList.contains('fb13')) k.dataset.p51 = 'fold'; });
  }
  function applySec() {
    mark(); const sec = tec.dataset.sec51 || '';
    [...tec.querySelectorAll('[data-p51]')].forEach(el => {
      if (!sec) { el.style.removeProperty('display'); return; }
      const k = el.dataset.p51; if (k === sec) el.style.setProperty('display', 'block', 'important'); else el.style.setProperty('display', 'none', 'important');
    });
    vis();
  }
  const SUBBTN = { tech: 'subtab-tech-list-btn', tal: 'subtab-talents-btn', sk: 'subtab-skills-btn' };
  let quiet = false;
  function openSec(sec) {
    if (sec === 'tal' && !on('talent')) { showToast(window.sysLockMsg ? sysLockMsg('talent') : '築基第 3 層開啟先天天賦樹。'); return; }
    tec.dataset.sec51 = sec; try { PC44.mode('xl'); } catch (e) { tec.classList.remove('pc-ov'); }
    const b = SUBBTN[sec] && $(SUBBTN[sec]); if (b) { quiet = true; b.click(); quiet = false; }
    applySec(); const m = document.querySelector('#game-app>main'); if (m) m.scrollTop = 0;
  }
  function back() { delete tec.dataset.sec51; applySec(); try { PC44.mode('ov'); } catch (e) { tec.classList.add('pc-ov'); } render(true); const m = document.querySelector('#game-app>main'); if (m) m.scrollTop = 0; }
  document.addEventListener('click', e => {
    const t = e.target.closest && e.target.closest('#subtab-tech-list-btn,#subtab-talents-btn,#subtab-skills-btn'); if (!t || quiet) return;
    const k = t.id === 'subtab-tech-list-btn' ? 'tech' : t.id === 'subtab-talents-btn' ? 'tal' : 'sk';
    setTimeout(() => { if (!isOv()) { tec.dataset.sec51 = k; applySec(); } }, 0);
  });
  document.addEventListener('click', e => {
    const n = e.target.closest && e.target.closest('[data-n25="tab-techniques"],.nav-tab-btn[data-tab="tab-techniques"]'); if (!n) return;
    setTimeout(() => { if (tec.dataset.sec51 || !isOv()) back(); }, 30);
  });

  /* ---------- 主畫面 ---------- */
  let sig = '';
  const lookSrc = () => { try { const g = state.gender === 'f' ? 'F_' : 'M_'; return LOOK_IMG[g + (state.look || 'o1')] || LOOK_IMG[g + 'o1'] || LOOK_IMG.M_o1; } catch (e) { return ''; } };
  function slotH(sl) {
    const it = curIt(sl), si = SLOT_INFO[sl], e = enhOf(sl), dot = slotDot(sl);
    if (!it) return `<button class="sl em" data-s51="${sl}"><span class="bx">${si.i}</span><span class="nm">${si.n}</span>${dot ? '<i class="rd"></i>' : ''}</button>`;
    return `<button class="sl" data-s51="${sl}"><span class="bx" style="--q:${qc(it)}">${icoH(it, si.i)}${e ? `<span class="lv">+${e}</span>` : ''}</span><span class="nm" style="color:${qc(it)}">${it.name}</span>${dot ? '<i class="rd"></i>' : ''}</button>`;
  }
  function xlBtn(lbl, sub, attrs, extra) { return `<button ${attrs}><i class="sl51">${lbl}</i><span>${sub}</span>${extra || ''}</button>`; }
  function talDot() { try { return on('talent') && (state.daoPoints || 0) > 0 && TALENTS_DATA.some(t => ((state.talents || {})[t.id] || 0) < t.maxLevel && (state.daoPoints || 0) >= t.cost); } catch (e) { return false; } }
  function techDot() { try { return TECHNIQUES_DATA.some(d => { const u = (state.techniques || []).find(t => t.id === d.id); return (state.realmIdx || 0) >= d.realmReq && (!u || u.level < d.maxLevel) && state.stones >= d.cost * (u ? u.level + 1 : 1); }); } catch (e) { return false; } }
  function render(force) {
    if (ch.style.display === 'none' && !force) return;
    let st; try { st = calculateTotalStats(); } catch (e) { return; }
    let sc = ''; try { const S = window.SCH19 && SCH19.SCH(); if (S && S.main) sc = SCH19.SC[S.main].n + (S.sub ? '・' + SCH19.SC[S.sub].n : ''); } catch (e) { }
    const rl = (typeof getRealmInfo === 'function' ? getRealmInfo().title : '') || '';
    const skd = (() => { try { return skAnyAlert(); } catch (e) { return false; } })();
    const crit = Math.round(st.crit * 10) / 10;
    const h = `<div class="hd"><div class="nm"><b>${state.name || '道友'}</b><span>${rl}${sc ? '・' + sc : ''}</span></div><div class="cp"><span>戰力</span><b>${fm(st.combatPower)}</b></div><button class="sealb" data-l14="open">更衣</button></div>
<div class="stg"><div class="col">${LEFT.map(slotH).join('')}</div><div class="art">${lookSrc() ? `<img src="${lookSrc()}" alt="">` : ''}</div><div class="col">${RIGHT.map(slotH).join('')}</div></div>
<div class="sts"><div><span>氣血</span><b>${fm(st.hp)}</b></div><div><span>攻擊</span><b>${fm(st.atk)}</b></div><div><span>防禦</span><b>${fm(st.def)}</b></div><div><span>會心率</span><b>${crit}%</b></div><button data-a51="attr">詳細<br>屬性</button></div>
<div class="acts"><button data-a51="auto">一鍵換裝${ORDER.some(better) ? '<i class="rd"></i>' : ''}</button><button class="pr" data-enhall="1">一鍵強化${ORDER.some(canEnh) ? '<i class="rd"></i>' : ''}</button><button data-x5="af.open">器紋・套裝</button></div>
<div class="xl">${xlBtn('功', '功法', 'data-a51="sec" data-k="tech"', techDot() ? '<i class="rd"></i>' : '')}${xlBtn('賦', '天賦', `data-a51="sec" data-k="tal" class="${on('talent') ? '' : 'lk'}"`, talDot() ? '<i class="rd"></i>' : '')}${xlBtn('通', '神通', 'data-a51="sec" data-k="sk"', skd ? '<i class="rd"></i>' : '')}${xlBtn('派', '流派', 'data-m6="0"', xDot.sch() ? '<i class="rd"></i>' : '')}${xlBtn('體', '煉體', 'data-m6="5"', xDot.body() ? '<i class="rd"></i>' : '')}${xlBtn('機', '天機', 'data-m6="1"', xDot.xian() ? '<i class="rd"></i>' : '')}${xlBtn('根', '靈根', 'data-a51="sec" data-k="root"')}</div>`;
    if (h !== sig) {
      // 保留 data-m6 按鈕上同步過來的 data-x5 / lk / 紅點
      const keep = {}; ch.querySelectorAll('[data-m6]').forEach(b => { keep[b.dataset.m6] = { x5: b.dataset.x5, k: b.dataset.k, lk: b.classList.contains('lk'), dot: !!b.querySelector('.x5-dot') }; });
      sig = h; ch.innerHTML = h;
      ch.querySelectorAll('[data-m6]').forEach(b => { const o = keep[b.dataset.m6]; if (!o) return; if (o.x5) b.dataset.x5 = o.x5; if (o.k) b.dataset.k = o.k; b.classList.toggle('lk', o.lk); if (o.dot) b.insertAdjacentHTML('beforeend', '<i class="x5-dot"></i>'); });
    }
  }
  setInterval(() => { try { vis(); render(); } catch (e) { } }, 1000);

  /* ---------- 彈窗 ---------- */
  let mode = null, cur = 'weapon';
  const close = () => { ov.classList.add('h'); mode = null; render(true); };
  ov.addEventListener('click', e => { if (e.target === ov) close(); });
  function openAttr() {
    mode = 'attr';
    let box = $('att51'); if (!box) { box = document.createElement('div'); box.id = 'att51'; }
    pn.innerHTML = '<div class="t"><div class="nm"><b>詳細屬性</b><div>所有加成來源與最終數值</div></div><button class="x" data-a51="close">✕</button></div>';
    pn.appendChild(box);
    const sm = $('stat-max-hp'), card = sm && sm.closest('.bg-gradient-to-br'); if (card && card.parentNode !== box) box.appendChild(card);
    const bd = $('stat-breakdown'), det = bd && bd.closest('details'); if (det && det.parentNode !== box) { box.appendChild(det); det.open = true; }
    ov.classList.remove('h'); pn.scrollTop = 0;
    try { renderProfile(); renderBreakdown(); } catch (e) { }
  }
  function statLine(it, e) {
    const m = enhMult(e || 0);
    return [['atk', '攻擊'], ['def', '防禦'], ['hp', '氣血']].filter(([k]) => it[k]).map(([k, n]) => `${n} <b>${fm(it[k] * m)}</b>`).join('　') || '—';
  }
  function openEq(sl) {
    mode = 'eq'; cur = sl;
    const it = curIt(sl), si = SLOT_INFO[sl], e = enhOf(sl), forge = on('forge');
    const idx = ORDER.indexOf(sl);
    let h = `<div class="t"><button class="ar" data-a51="prev">‹</button><span class="bx" style="--q:${qc(it)}">${icoH(it, si.i)}</span><div class="nm"><b style="color:${qc(it)}">${it ? it.name : si.n + '(未穿戴)'}${it && e ? ` +${e}` : ''}</b><div>${si.n}${it ? `・${QN[it.quality] || ''}${it.tier != null && typeof TIER_NAME !== 'undefined' ? '・' + TIER_NAME[Math.min(7, it.tier)] + '階' : ''}` : ''}　${idx + 1}/${ORDER.length}</div></div><button class="ar" data-a51="next">›</button><button class="x" data-a51="close">✕</button></div>`;
    if (it) {
      h += `<div class="cd"><h4>屬性</h4><div>${statLine(it, e)}</div>${e ? `<div class="sub">含強化 +${e}(×${enhMult(e).toFixed(2)})</div>` : ''}</div>`;
      if (!forge) h += `<div class="cd"><h4>強化・器紋</h4><div class="sub">築基期後,隨劇情開啟強化與器紋。</div></div>`;
      else {
        const cap = enhCap();
        if (e >= cap) h += `<div class="cd"><h4>強化</h4><div class="sub">已達目前上限 +${cap}(境界提升後上限增加)。</div></div>`;
        else {
          const c = enhCost(e), okS = state.stones >= c.stone, okO = ((state.inventory || {})[c.oreKey] || 0) >= c.ore; let cp = '';
          try { const [a, b] = cpIfEnh(sl); cp = `戰力 ${fm(a)} → <span class="up">${fm(b)}</span>`; } catch (x) { }
          h += `<div class="cd"><h4>強化 +${e} → +${e + 1}</h4><div class="row"><span>成功率 <b>${enhChance(e)}%</b></span><span class="sub">上限 +${cap}</span></div><div class="sub"><span class="${okS ? '' : 'dn'}">靈石 ${fm(c.stone)}</span>・<span class="${okO ? '' : 'dn'}">${ITEMS[c.oreKey].name} ×${c.ore}(持有 ${(state.inventory || {})[c.oreKey] || 0})</span></div><div class="sub">${cp}</div><div class="bt"><button class="pr" data-a51="enh" ${okS && okO ? '' : 'disabled'}>強化一次</button><button data-a51="enhm" ${okS && okO ? '' : 'disabled'}>連續強化</button></div></div>`;
        }
        let L = []; try { L = AFF16.lines(sl); } catch (x) { }
        const capA = (() => { try { return AFF16.capOf(sl); } catch (x) { return 0; } })();
        h += `<div class="cd"><h4>器紋 ${L.length}/${capA}</h4>${L.length ? L.map(l => `<div class="afl"><span>${l.l ? '🔒 ' : ''}${X5.fxText({ [l.k]: l.v })}</span></div>`).join('') : '<div class="sub">尚無器紋。</div>'}<div class="sub">強化 +5、+10 各多解鎖一條。</div><div class="bt"><button data-a51="aff">洗練器紋</button></div></div>`;
      }
    }
    const inv = state.inventory || {}, cands = Object.keys(inv).filter(k => { const x = ITEMS[k]; return x && x.type === 'equipment' && x.slot === sl && inv[k] > 0; }).sort((a, b) => score(ITEMS[b]) - score(ITEMS[a]));
    h += `<div class="cd"><h4>更換(儲物袋 ${cands.length} 件)</h4>`;
    if (!cands.length) h += '<div class="sub">儲物袋沒有這個部位的裝備。</div>';
    else cands.slice(0, 8).forEach(k => {
      const x = ITEMS[k], d = it ? score(x) - score(it) : score(x), pct = it && score(it) > 0 ? Math.round(d / score(it) * 100) : null;
      h += `<div class="eqr">${icoH(x, si.i)}<div style="flex:1;min-width:0"><div style="font-weight:800;color:${qc(x)}">${x.name}${inv[k] > 1 ? ` ×${inv[k]}` : ''}</div><div class="sub">${statLine(x, 0)}${pct != null ? `　<span class="${d >= 0 ? 'up' : 'dn'}">${d >= 0 ? '▲' : '▼'}${Math.abs(pct)}%</span>` : ''}</div></div><button class="eqb" data-a51="eq" data-k="${k}">穿戴</button></div>`;
    });
    h += '</div>';
    pn.innerHTML = h; ov.classList.remove('h');
  }
  document.addEventListener('click', e => {
    const s = e.target.closest && e.target.closest('#ch51 [data-s51]'); if (s) { openEq(s.dataset.s51); return; }
    const a = e.target.closest && e.target.closest('[data-a51]'); if (!a) return;
    const k = a.dataset.a51;
    if (k === 'back') { back(); return; }
    if (k === 'sec') { openSec(a.dataset.k); return; }
    if (k === 'attr') { openAttr(); return; }
    if (k === 'auto') { try { autoEquipBest(); } catch (x) { } render(true); return; }
    if (k === 'close') { close(); return; }
    if (k === 'prev' || k === 'next') { const i = ORDER.indexOf(cur); openEq(ORDER[(i + (k === 'next' ? 1 : ORDER.length - 1)) % ORDER.length]); return; }
    if (k === 'enh') { try { enhanceEquippedGear(cur); } catch (x) { } openEq(cur); return; }
    if (k === 'enhm') { try { enhanceMany(cur); } catch (x) { } openEq(cur); return; }
    if (k === 'aff') { close(); try { AFF16.openSlot(cur); } catch (x) { } return; }
    if (k === 'eq') { try { equipItem(a.dataset.k); } catch (x) { } try { renderInventory(); updateTopBar(); renderProfile(); } catch (x) { } openEq(cur); return; }
  });
  setTimeout(() => { try { PC44.mode('ov'); } catch (e) { } mark(); vis(); render(true); }, 900);
})();

