/* ===== v82 彈窗層級:後打開的視窗一律在最上層 ===== */
(() => {
  const SEL = '.x5-ov,#ov51,#ov53,#ov54,#sheet13,.lk14-ov,[id^="modal-"],#pw9';
  let z = 80; const was = new WeakMap();
  const shown = e => !e.classList.contains('hidden') && !e.classList.contains('h') && !e.classList.contains('x5-h') && (e.id !== 'sheet13' || e.classList.contains('on')) && getComputedStyle(e).display !== 'none';
  const check = e => { const v = shown(e); if (v && !was.get(e)) e.style.zIndex = String(++z); was.set(e, v); };
  const scan = () => document.querySelectorAll(SEL).forEach(check);
  new MutationObserver(recs => {
    let full = false;
    for (const r of recs) {
      if (r.type === 'attributes') { const t = r.target; if (t.matches && t.matches(SEL)) check(t); }
      else if ([...r.addedNodes].some(n => n.nodeType === 1 && (n.matches(SEL) || n.querySelector(SEL)))) full = true;
    }
    if (full) scan();
  }).observe(document.body, { attributes: true, attributeFilter: ['class', 'style'], subtree: true, childList: true });
  scan();
  const st = document.createElement('style'); st.textContent = '#game-toast{z-index:99990!important}'; document.head.appendChild(st);
})();
