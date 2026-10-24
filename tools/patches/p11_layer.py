#!/usr/bin/env python3
"""最終版82:彈窗層級——後打開的視窗一律顯示在最上層
原因:洞府/仙途/人物的大面板(z 72)比 X5 面板(70)、原生彈窗(50~80)、通用面板(65)還高,
從大面板裡再開的視窗(如靈田「一鍵播種」、存檔管理「匯出」)會被壓在後面。
做法:監看各種彈窗,從隱藏變成顯示的那一刻給它目前最大的層級;提示訊息(toast)永遠在最上面。
"""
import os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src')
js = os.path.join(ROOT, 'js', '24_v82_彈窗層級.js')
assert not os.path.exists(js)
open(js, 'w', encoding='utf-8', newline='').write(r"""/* ===== v82 彈窗層級:後打開的視窗一律在最上層 ===== */
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
""")
p = os.path.join(ROOT, 'index.html'); t = open(p, encoding='utf-8', newline='').read()
old = '@@INC:js/23_v74_介面統一・心魔.js@@'; assert t.count(old) == 1
t = t.replace(old, old + '\n@@INC:js/24_v82_彈窗層級.js@@'); open(p, 'w', encoding='utf-8', newline='').write(t)
print('p11 ok')
