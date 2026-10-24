#!/usr/bin/env python3
"""最終版123:標題畫面讀取條 —— 跟著實際載入進度跑(圖片/字型/存檔),讀完存檔才出現「點擊畫面,踏入仙途」,之前點畫面沒反應
避免讀檔完成前點進遊戲而跳出建角畫面、填完後改掉原本存檔的名字與性別。
"""
import os
SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src')
def sub(rel, old, new):
    p = os.path.join(SRC, rel); s = open(p, encoding='utf-8', newline='').read()
    assert s.count(old) == 1, (rel, old[:50]); open(p, 'w', encoding='utf-8', newline='').write(s.replace(old, new))
sub('index.html', '<div id="title34" role="button" tabindex="0" aria-label="點擊進入遊戲">', '<div id="title34" class="ld" role="button" tabindex="0" aria-label="點擊進入遊戲">')
sub('index.html', '<div class="t34-go">點擊畫面,踏入仙途</div>', '<div class="t34-ld"><div class="bar"><i></i></div><div class="tx">凝神聚氣…</div></div><div class="t34-go">點擊畫面,踏入仙途</div>')
p = os.path.join(SRC, 'css', '02_title34-css.css'); s = open(p, encoding='utf-8', newline='').read()
s += """
/* v123 讀取條:讀完存檔前不可點 */
#title34.ld .t34-go{display:none}
.t34-ld{position:relative;z-index:2;margin-bottom:calc(9% + env(safe-area-inset-bottom));width:62%;max-width:300px;text-align:center;transition:opacity .5s}
#title34:not(.ld) .t34-ld{display:none}
.t34-ld .bar{position:relative;height:6px;border-radius:3px;background:rgba(138,75,28,.18);overflow:hidden;box-shadow:0 0 8px rgba(255,255,255,.8)}
.t34-ld .bar i{position:absolute;left:0;top:0;bottom:0;width:0;border-radius:3px;background:linear-gradient(90deg,rgba(60,32,12,.15),#5b3412 70%,#2a1608);transition:width .35s ease-out}
.t34-ld .tx{margin-top:8px;font-size:12px;letter-spacing:.3em;padding-left:.3em;color:#8a4b1c;text-shadow:0 0 10px rgba(255,255,255,.95)}
"""
open(p, 'w', encoding='utf-8', newline='').write(s)
sub('js/03_title34_標題畫面點擊進入.js', """  let gone = false;
  function go() { if (gone) return; gone = true;""", """  let gone = false, ready = false;
  /* v123 讀取條:實際載入進度(圖片)+ 讀檔完成才可進入 */
  const bar = t.querySelector('.t34-ld .bar i'), tx = t.querySelector('.t34-ld .tx'), t0 = Date.now(); let shown = 0;
  const TX = ['凝神聚氣…', '感應天地靈氣…', '開啟洞府…'];
  function prog() {
    if (ready) return;
    const im = [...document.images], done = im.filter(i => i.complete).length, p = im.length ? done / im.length : 0;
    const tp = Math.min(.92, Math.max(p * .9, Math.min(.6, (Date.now() - t0) / 4000)));   /* 圖片進度為主,時間緩慢補位,讀檔完成前最多 92% */
    shown = Math.max(shown, tp); if (bar) bar.style.width = (shown * 100) + '%'; if (tx) tx.textContent = TX[Math.min(2, Math.floor(shown * 3))] + ' ' + Math.floor(shown * 100) + '%';
    setTimeout(prog, 120);
  }
  prog();
  window.addEventListener('load', () => setTimeout(() => {   /* 014 的 load 監聽(讀檔)在後面註冊;延後一拍確保已讀完存檔 */
    if (!window.__LOADED112) return; ready = true; if (bar) bar.style.width = '100%'; if (tx) tx.textContent = '靈台清明 100%';
    setTimeout(() => t.classList.remove('ld'), 350);
  }, 0));
  function go() { if (gone || !ready) return; gone = true;""")
print('p52 ok')
# (續)讀取條程式移到 js/03b_v123_標題讀取條.js,以 inline script 緊接在標題畫面標記之後執行;03 的 go() 改看 window.T123.ready
