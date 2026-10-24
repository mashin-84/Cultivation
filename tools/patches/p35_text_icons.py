#!/usr/bin/env python3
"""最終版106:純文字位置出現圖示原始碼(例如提示列顯示 <i class="a45i …"></i>)
物品圖示是 HTML(<i class="ii …"> / <i class="a45i …">),被放進 innerText 的地方就會變亂碼。
全域修正:
- 監看畫面上新出現的文字,遇到圖示原始碼就換成真正的圖示(提示列、狀態列、任何 innerText 都適用)
- 瀏覽器原生對話框(alert/confirm/prompt)無法顯示圖示,直接拿掉圖示原始碼
"""
import os
SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src')
p = os.path.join(SRC, 'index.html'); s = open(p, encoding='utf-8', newline='').read()
old = '@@INC:js/29_v101_音效.js@@'; assert s.count(old) == 1
s = s.replace(old, old + '\n@@INC:js/30_v106_文字圖示修正.js@@'); open(p, 'w', encoding='utf-8', newline='').write(s)
js = os.path.join(SRC, 'js', '30_v106_文字圖示修正.js'); assert not os.path.exists(js)
open(js, 'w', encoding='utf-8', newline='').write(r"""/* ===== v106 文字中的圖示原始碼 → 真正圖示 ===== */
(() => {
  /* 只認遊戲自己的圖示標籤:<i class="ii…|a45i…" style="…"></i>,屬性內不得有引號或角括號 */
  const RE = /<i class="(?:ii|a45i)\b[^"<>]*"(?: style="[^"<>]*")?><\/i>/g, HINT = '<i class="';
  const SKIP = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, INPUT: 1 };
  function fixText(t) {
    const v = t.nodeValue; if (!v || v.indexOf(HINT) < 0 || !t.parentNode || SKIP[t.parentNode.nodeName]) return;
    RE.lastIndex = 0; if (!RE.test(v)) return; RE.lastIndex = 0;
    const f = document.createDocumentFragment(); let last = 0, m;
    while ((m = RE.exec(v))) {
      if (m.index > last) f.appendChild(document.createTextNode(v.slice(last, m.index)));
      const tp = document.createElement('template'); tp.innerHTML = m[0]; f.appendChild(tp.content);
      last = m.index + m[0].length;
    }
    if (last < v.length) f.appendChild(document.createTextNode(v.slice(last)));
    t.parentNode.replaceChild(f, t);
  }
  function scan(n) {
    if (n.nodeType === 3) return fixText(n);
    if (n.nodeType !== 1 || SKIP[n.nodeName] || (n.textContent || '').indexOf(HINT) < 0) return;
    const w = document.createTreeWalker(n, NodeFilter.SHOW_TEXT), list = []; let t;
    while ((t = w.nextNode())) if (t.nodeValue.indexOf(HINT) >= 0) list.push(t);
    list.forEach(fixText);
  }
  new MutationObserver(ms => { for (const m of ms) { if (m.type === 'characterData') fixText(m.target); else m.addedNodes.forEach(scan); } })
    .observe(document.body, { childList: true, subtree: true, characterData: true });
  scan(document.body);
  /* 原生對話框:拿掉圖示原始碼 */
  const strip = x => typeof x === 'string' ? x.replace(RE, '').replace(/ {2,}/g, ' ') : x;
  ['alert', 'confirm', 'prompt'].forEach(k => { const o = window[k]; if (typeof o === 'function') window[k] = function (a, ...r) { return o.call(window, strip(a), ...r); }; });
  window.ICONTXT106 = { strip };
})();
""")
print('p35 ok')
