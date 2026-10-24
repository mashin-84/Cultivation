/* ===== v74 介面統一(按鈕換生成圖)・九九登天塔第100層心魔立繪 ===== */
(function () {
  /* ---------- 明確指定:選擇器 → 底圖種類(p 朱紅主要 / w 檀木次要 / j 青玉確認 / g 金色特殊 / m 紫晶道心),可附前置圖示 ---------- */
  const EXPL = [
    ['#btn-trigger-breakthrough', 'g', 'brk'], ['[data-enhall]', 'p', 'enhall'], ['#ch51 [data-a51="auto"]', 'w', 'autoeq'],
    ['[data-x5="af.open"],#ch51 [data-a51="aff"]', 'w', 'aff'], ['[data-a51="enh"]', 'p'], ['[data-a51="enhm"]', 'w'], ['button.eqb', 'w'],
    ['[data-ca52]', 'p', 'alch'], ['[data-caa52]', 'w'], ['#btn-step-explore', 'j', 'next'], ['#btn-auto-explore', 'w', 'auto'],
    ['#btn-speed-out', 'w', 'speed'], ['[data-a54="pill"]', 'coff', 'pill'], ['[data-a54="seq"]', 'coff', 'sellg'],
    ['[data-a54="smat"]', 'coff', 'sellm'], ['#ch51 [data-a51="attr"]', 'coff'], ['.lk14-eq', 'w'],
  ];
  const PRE = { '[data-c52="alch"]': 'alch', '[data-c52="forge"]': 'forge', '[data-c52="mk"]': 'market' };
  const TABS = '[data-c52],[data-x32a],[data-x5$=".tab"],[data-act="ming-tab"],[data-l14="g"],[id^="subtab-"]';
  const CHIPS = '[data-k52],[data-c13],.sk27c button';
  const EXCL = '#bf113 *,#nav25 *,#nav25,.inv13-cell,.rc,.sl,.h44,[data-area],.gd-t,[data-r52],[data-s51],[data-l14="gp"],.sealb,#ch51 .xl button,#rc54 .gr button,#ab53r .sb53,#btn-tap-cultivate,[data-x5="st28.hub"],#title34 *,#st28 *,#modal-gender14 *,#btn-edit-name,[data-skbtn] img';
  const isX = t => /^[✕×✖]$/.test(t);

  function rgbs(el) {
    const s = getComputedStyle(el), out = [];
    const m = s.backgroundColor.match(/rgba?\(([^)]+)\)/); if (m) { const v = m[1].split(',').map(Number); if ((v[3] ?? 1) > .25) out.push(v); }
    if (!out.length) { const g = s.backgroundImage.match(/rgba?\([^)]+\)/); if (g) { const v = g[0].replace(/rgba?\(|\)/g, '').split(',').map(Number); if ((v[3] ?? 1) > .25) out.push(v); } }
    return out[0] || null;
  }
  function fam(v) {
    if (!v) return null;
    let [r, g, b] = v.map(x => x / 255); const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
    const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1)); let h = 0;
    if (d) h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h = (h * 60 + 360) % 360;
    if (l > .82 && s < .6) return 'light';
    if (s < .22 || l < .17) return 'w';
    if (h >= 340 || h < 14) return 'p';
    if (h < 55) return 'g';
    if (h < 200) return 'j';
    if (h < 245) return 'w';
    return 'm';
  }
  function decide(el) {
    for (const [sel, t, ic] of EXPL) if (el.matches(sel)) return [t, ic];
    const txt = (el.textContent || '').trim();
    if (el.matches('[data-x5="close"],[data-a53="x"],[data-a54="x"],[data-a51="close"]') || (isX(txt) && !el.querySelector('img'))) return ['x'];
    if (el.matches('.ar.l,[data-a51="prev"]') || (txt === '‹' && !el.children.length)) return ['al'];
    if (el.matches('.ar.r,[data-a51="next"]') || (txt === '›' && !el.children.length)) return ['ar'];
    if (el.closest(EXCL)) return [null];
    if (!txt && el.querySelector('img,.ii,svg')) return [null];
    const r = el.getBoundingClientRect(); if (r.height > 60 || r.height < 18 || r.width < 30) return [null];
    if ([...el.querySelectorAll('img')].some(i => i.getBoundingClientRect().height > 26)) return [null];
    const pre = Object.keys(PRE).find(s => el.matches(s));
    if (el.matches(TABS) || el.matches(CHIPS)) {
      const chip = el.matches(CHIPS); let on = el.classList.contains('on');
      if (!on && !el.parentElement.querySelector(':scope > .on')) { const f = fam(rgbs(el)); on = !!f && f !== 'light' && f !== 'w'; }
      return [chip ? (on ? 'con' : 'coff') : (on ? 'ton' : 'toff'), pre && PRE[pre]];
    }
    const f = fam(rgbs(el)); if (!f) return [null];
    if (f === 'light') return ['coff'];
    return [f];
  }
  function apply(el) {
    const key = el.className + '|' + el.disabled;
    if (el.dataset.sk74k === key && (el.dataset.sk74 || el.dataset.sk74n)) { icon(el); return; }
    el.removeAttribute('data-sk74'); el.removeAttribute('data-sk74n');
    const [t, ic] = decide(el); el.dataset.sk74k = key;
    if (!t) { el.dataset.sk74n = '1'; return; }
    el.dataset.sk74 = t; if (ic) el.dataset.i74 = ic; else delete el.dataset.i74;
    size(el); icon(el);
  }
  function size(el) {
    const r = el.getBoundingClientRect(), t = el.dataset.sk74; if (!r.height) return;
    const k = { p: .95, w: .95, j: .95, g: .85, m: .95, ton: .5, toff: .5, con: .95, coff: .95, ban: .25 }[t]; if (!k) return;
    el.style.setProperty('--e74', Math.round(Math.min(r.height * k, r.width * .42)) + 'px');
    el.style.setProperty('--o74', (/^[pwjgm]$/.test(t) ? Math.round(Math.min(r.height * .28, 10)) : 0) + 'px');
  }
  function icon(el) {
    const ic = el.dataset.i74; if (!ic) return;
    const f = el.firstElementChild;
    if (f && f.classList.contains('i74')) { if (f.dataset.k !== ic) { f.dataset.k = ic; f.style.setProperty('--i74', `var(--ic-${ic})`); } return; }
    el.querySelectorAll(':scope > i.i74').forEach(x => x.remove());
    const i = document.createElement('i'); i.className = 'i74'; i.dataset.k = ic; i.style.setProperty('--i74', `var(--ic-${ic})`); el.insertBefore(i, el.firstChild);
  }
  let busy = false, last = 0, timer = 0;
  function pass() {
    timer = 0; if (busy) return; busy = true; last = Date.now();
    try { document.querySelectorAll('button,.x5-btn').forEach(el => { if (el.offsetParent || el.getClientRects().length) apply(el); }); } catch (e) { console.warn('ui74', e); }
    busy = false;
  }
  function sched() { if (timer) return; const w = Math.max(0, 200 - (Date.now() - last)); timer = setTimeout(() => requestAnimationFrame(pass), w); }

  /* ---------- 九九登天塔第100層心魔:專屬立繪(依道體),出手/受擊換姿勢 ---------- */
  const XM = {xm_f0:"data:image/webp;base64,@@IMG:UI74/xm_f0@@",xm_f1:"data:image/webp;base64,@@IMG:UI74/xm_f1@@",xm_f2:"data:image/webp;base64,@@IMG:UI74/xm_f2@@",xm_m0:"data:image/webp;base64,@@IMG:UI74/xm_m0@@",xm_m1:"data:image/webp;base64,@@IMG:UI74/xm_m1@@",xm_m2:"data:image/webp;base64,@@IMG:UI74/xm_m2@@"};
  const xm = p => XM['xm_' + (state.gender === 'f' ? 'f' : 'm') + p];
  const isXM = B => !!(B && B.monster && B.monster.id === 'tw_100');
  XT.fxSetup74 = next => function () {
    next.apply(this, arguments);
    try { if (!isXM(currentBattle)) return; const me = document.querySelector('#battle-stage .bs-memo'); if (me) me.innerHTML = `<img class="bs-mi xm74" src="${xm(0)}" alt="" draggable="false">`; } catch (e) { }
  };
  let poseT = 0;
  function pose(p, ms) {
    const im = document.querySelector('#battle-stage .bs-mi.xm74'); if (!im) return;
    im.src = xm(p); clearTimeout(poseT); poseT = setTimeout(() => { const i2 = document.querySelector('#battle-stage .bs-mi.xm74'); if (i2) i2.src = xm(0); }, ms / (state.battleSpeed || 1));
  }

  const mo = new MutationObserver(recs => {
    for (const r of recs) {
      if (r.type === 'attributes' && r.target.id === 'bs-m' && isXM(currentBattle)) {
        const c = r.target.classList;
        if (c.contains('matk') && !(r.oldValue || '').includes('matk')) pose(1, 600);
        else if (c.contains('hit') && !(r.oldValue || '').includes('hit')) pose(2, 380);
      }
    }
    /* 戰鬥舞台內的特效變動不需重算;其餘變動在重繪前立即套用,避免舊樣式閃現 */
    if (recs.some(r => { const n = r.target.nodeType === 1 ? r.target : r.target.parentElement; return !(n && n.closest && n.closest('#battle-stage')); })) pass();
  });
  function start() { mo.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'disabled'], attributeOldValue: true }); pass(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  window.addEventListener('resize', () => { document.querySelectorAll('[data-sk74]').forEach(size); });
  window.UI74 = { pass, decide };
})();
