#!/usr/bin/env python3
"""最終版108(續):洞府場景熱點紅點
- 煉體台(可錘鍊)、藏寶閣(新法寶/可合成)、靈獸園(有蛋可孵/可升級)、洞府靈田(可收成)標籤右上角出現紅點
- 底部「洞府」紅點也把這三項算進去;「行囊」不再因法寶/靈寵亮紅點(那兩項不在行囊裡,找不到紅點)
"""
import os, glob
SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src')
def sub(path, old, new, n=1):
    p = glob.glob(os.path.join(SRC, path))[0]; s = open(p, encoding='utf-8', newline='').read()
    assert s.count(old) == n, (path, old[:60], s.count(old)); open(p, 'w', encoding='utf-8', newline='').write(s.replace(old, new))
sub('js/02_main/019_*.js', "  f['tab-abode'] = !!(window.AB53 && AB53.alert());", "  f['tab-abode'] = !!(window.AB53 && AB53.alert()) || f.body || f.treasure || f.pet;")
sub('js/02_main/019_*.js', "k.startsWith('wbox_') && state.inventory[k] > 0) || f.treasure || f.pet;", "k.startsWith('wbox_') && state.inventory[k] > 0);")
sub('index.html', '@@INC:js/30_v106_文字圖示修正.js@@', '@@INC:js/30_v106_文字圖示修正.js@@\n@@INC:js/31_v108_洞府紅點.js@@')
js = os.path.join(SRC, 'js', '31_v108_洞府紅點.js'); assert not os.path.exists(js)
open(js, 'w', encoding='utf-8', newline='').write(r"""/* ===== v108 洞府場景熱點紅點 ===== */
(() => {
  const st = document.createElement('style');
  st.textContent = '#hub44 .h44 .nm{position:relative}#hub44 .h44 .nm>i.rd{display:block!important;position:absolute;top:-4px;right:-4px;width:10px;height:10px;border-radius:50%;background:#d13b2f;box-shadow:0 0 0 2px #f6efe0}';
  document.head.appendChild(st);
  function tick() {
    const hub = document.getElementById('hub44'); if (!hub || !hub.offsetParent) return;
    let f = {}; try { f = redFlags(); } catch (e) { }
    const gd = hub.querySelector('[data-s="gd"]');
    const want = { '5': f.body, '6': f.treasure, '7': f.pet, gd: /可收/.test(gd ? gd.textContent : '') };
    hub.querySelectorAll('.h44').forEach(b => {
      const k = b.dataset.m6 || b.dataset.h44, nm = b.querySelector('.nm'); if (!nm || !(k in want)) return;
      let d = nm.querySelector(':scope>i.rd');
      if (want[k] && !d) { d = document.createElement('i'); d.className = 'rd'; nm.appendChild(d); }
      else if (!want[k] && d) d.remove();
    });
  }
  setInterval(tick, 800); setTimeout(tick, 400);
})();
""")
print('p37 ok')
