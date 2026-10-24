#!/usr/bin/env python3
"""最終版113:重要戰鬥第一步 —— 獨立戰鬥介面 + 回合制 QTE + Boss 階段演出
- 新模組 js/35_v113_重要戰鬥.js(BF113):普攻=時機條、神通=依序點光點、敵方蓄力大招=縮圈格擋、本命絕學=按住蓄力
  Boss 血量 66%/33% 進入新階段(過場對白、攻擊提升、蓄力更頻繁);自動模式(QTE 一律「不錯」)
  敵人強度依玩家當下實力計算(偏挑戰:不靠 QTE 約五五波)
- 劇情戰(TB26.story)改走新介面;劇情總覽看過的劇情戰加「⚔ 重戰」(不影響劇情與獎勵)
- 第一場專屬台詞/階段:外門大比・顧青衍
"""
import os, glob
HERE = os.path.dirname(os.path.abspath(__file__)); SRC = os.path.join(HERE, '..', '..', 'src')
def sub(path, old, new):
    p = glob.glob(os.path.join(SRC, path))[0]; s = open(p, encoding='utf-8', newline='').read()
    assert s.count(old) == 1, (path, old[:60], s.count(old)); open(p, 'w', encoding='utf-8', newline='').write(s.replace(old, new))
sub('index.html', '@@INC:js/34_v112_進度保險.js@@', '@@INC:js/34_v112_進度保險.js@@\n@@INC:js/35_v113_重要戰鬥.js@@')
js = os.path.join(SRC, 'js', '35_v113_重要戰鬥.js'); assert not os.path.exists(js)
body = open(os.path.join(HERE, 'p48_bf.js'), encoding='utf-8').read()
body = body.replace("})();\n", """  /* ---------- 接上劇情戰 ---------- */
  if (window.TB26 && TB26.story) {
    const o = TB26.story;
    TB26.story = function (cfg) {
      if (!cfg || cfg.kind && cfg.kind !== 'story') return o.apply(this, arguments);
      try { if (currentBattle && window.HO43) HO43.yieldBattle(); if (state.autoExplore) stopAutoExplore(''); } catch (e) { }
      window.BF113.start(Object.assign({}, cfg)).then(win => { try { saveGame(); updateTopBar(); } catch (e) { } setTimeout(() => { try { cfg.onEnd && cfg.onEnd(win); } catch (e) { } }, 200); });
      return true;
    };
  }
})();
""", 1) if body.rstrip().endswith('})();') else body
assert 'TB26.story = function' in body
open(js, 'w', encoding='utf-8', newline='').write(body)
# 音樂:重要戰鬥用天劫曲
sub('js/26_v96_背景音樂.js', "  function target() {\n", "  function target() {\n    if (window.BF113 && BF113.on) return [BF113.bgm(), true];   /* v113 重要戰鬥 */\n")
# 返回鍵:戰鬥中不處理
sub('js/33_v111_返回鍵.js', "  function onBack() {\n", "  function onBack() {\n    if (window.BF113 && BF113.on) { trap(); return; }   /* v113 重要戰鬥中不處理 */\n")
# 劇情總覽:重戰
F = 'js/02_main/055_*.js'
sub(F, '${sn ? `<button class="x5-btn gy" data-x5="st28.play" data-id="${n.id}">重看</button>`',
       '${sn && fightOf(n) ? `<button class="x5-btn am" data-x5="st28.refight" data-id="${n.id}" style="margin-right:4px">⚔ 重戰</button>` : \'\'}${sn ? `<button class="x5-btn gy" data-x5="st28.play" data-id="${n.id}">重看</button>`')
sub(F, "  X.act('st28.play', t => {", """  /* v113 重戰:找出節點裡的劇情戰設定 */
  function fightOf(n) { let f = null; const walk = x => { if (f || !x || typeof x !== 'object') return; if (x.fight && typeof x.fight === 'object' && x.fight.name) { f = x.fight; return; } (Array.isArray(x) ? x : Object.values(x)).forEach(walk); }; walk(n.beats); return f; }
  X.act('st28.refight', t => { const n = BY[t.dataset.id], f = n && fightOf(n); if (!f || !window.BF113 || run) return; if (currentBattle && !(window.HO43 && HO43.yieldBattle())) { try { showToast('戰鬥中無法重戰。'); } catch (e) { } return; } X.close('st28'); BF113.start(Object.assign({}, f, { rematch: true })).then(() => { try { X.open('st28'); } catch (e) { } }); });
  X.act('st28.play', t => {""")
print('p48 ok')
