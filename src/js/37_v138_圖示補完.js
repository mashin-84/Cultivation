/* ===== v138 圖示補完:歷練地圖路線、兩個缺圖物品、重要戰鬥按鈕、零星 emoji、改名鉛筆 ===== */
window.IC138 = {"camp": "data:image/webp;base64,@@IMG:IC138/camp@@", "flag": "data:image/webp;base64,@@IMG:IC138/flag@@", "me_m": "data:image/webp;base64,@@IMG:IC138/me_m@@", "me_f": "data:image/webp;base64,@@IMG:IC138/me_f@@", "bossring": "data:image/webp;base64,@@IMG:IC138/bossring@@", "n_idle": "data:image/webp;base64,@@IMG:IC138/n_idle@@", "n_cur": "data:image/webp;base64,@@IMG:IC138/n_cur@@", "n_done": "data:image/webp;base64,@@IMG:IC138/n_done@@", "n_lock": "data:image/webp;base64,@@IMG:IC138/n_lock@@", "n_boss": "data:image/webp;base64,@@IMG:IC138/n_boss@@", "tox_mat": "data:image/webp;base64,@@IMG:IC138/tox_mat@@", "pill_dt": "data:image/webp;base64,@@IMG:IC138/pill_dt@@", "flee": "data:image/webp;base64,@@IMG:IC138/flee@@", "auto": "data:image/webp;base64,@@IMG:IC138/auto@@", "up": "data:image/webp;base64,@@IMG:IC138/up@@", "chk0": "data:image/webp;base64,@@IMG:IC138/chk0@@", "chk1": "data:image/webp;base64,@@IMG:IC138/chk1@@", "chapter": "data:image/webp;base64,@@IMG:IC138/chapter@@", "play": "data:image/webp;base64,@@IMG:IC138/play@@", "brush": "data:image/webp;base64,@@IMG:IC138/brush@@"};
(() => {
  const I = window.IC138, $ = id => document.getElementById(id);
  let css = Object.keys(I).map(k => `.ii-c138_${k}{background-image:url(${I[k]})}`).join('');
  css += `
#bf-run,#bf-auto{background:transparent!important;border-style:solid!important;border-color:transparent!important;border-width:0!important;border-radius:0!important;box-shadow:none!important;
  border-image-source:var(--sk-btn-w)!important;border-image-slice:0 21% fill!important;border-image-width:0 1.6em!important;border-image-outset:0!important;border-image-repeat:stretch!important;color:#4b2f1d!important;text-shadow:0 1px 0 rgba(255,245,225,.6);padding:6px 1.15em!important;display:inline-flex;align-items:center;gap:3px}
#bf-auto.on{border-image-source:var(--sk-btn-g)!important;border-image-slice:0 18% fill!important;color:#5a3a0c!important}
#bf-run::before,#bf-auto::before{content:'';width:1.35em;height:1.35em;background:center/contain no-repeat;flex:none}
#bf-run::before{background-image:url(${I.flee})}#bf-auto::before{background-image:url(${I.auto})}
#btn-edit-name .ii{width:1.25em;height:1.25em;vertical-align:-.3em}`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  const ic = (k, cls) => `<i class="ii${cls ? ' ' + cls : ''} ii-c138_${k}"></i>`;
  /* 缺圖物品 */
  ['tox_mat', 'pill_dt'].forEach(k => { const it = ITEMS[k]; if (it) { if (!it._ico) it._ico = it.icon; it.icon = ic(k); } });
  /* 道途錄章節圖示 */
  const story = () => { try { (STORIES || []).forEach(s => { if (!/^<i /.test(s.icon || '')) s.icon = ic('chapter', 'ui'); }); } catch (e) { } };
  /* 改名鉛筆 → 毛筆 */
  const pen = () => { const b = $('btn-edit-name'); if (b && !b.querySelector('.ii-c138_brush')) b.innerHTML = ic('brush', 'ui'); };
  const tick = () => { story(); pen(); };
  tick(); setInterval(tick, 2000);
  try { _mapSig = ''; renderMap(); } catch (e) { }
})();
