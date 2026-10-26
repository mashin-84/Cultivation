# v182:動畫回顧(劇情總覽按鈕 → 影片清單,只列已經歷過的)
import glob
def rep(f, old, new):
    s = open(f, encoding='utf8').read(); c = s.count(old); assert c == 1, (old[:50], c)
    open(f, 'w', encoding='utf8').write(s.replace(old, new)); print(f.split('/')[-1], '比對 1 次')
f = glob.glob('src/js/02_main/055_*.js')[0]
rep(f, """h += `<div class="x5-row" style="margin-bottom:8px"><button class="x5-btn gy" data-x5="st28.op">🎬 重看開場動畫</button></div>`;""",
       """h += `<div class="x5-row" style="margin-bottom:8px"><button class="x5-btn am" data-x5="st28.mvl">🎬 動畫回顧</button></div>`;""")
rep(f, "  X.act('st28.op', () => {",
"""  /* v182 動畫回顧:只列已經歷過的(避免劇透) */
  const MVL = [['opening', '開場・一念而已', () => true], ['n_1.2', '妖潮夜', () => seen('1.2')], ['tribulation', '雷劫(男)', () => (state.realmIdx || 0) >= 1], ['tribulation_f', '雷劫(女)', () => (state.realmIdx || 0) >= 1],
    ['n_4.4', '正魔大戰', () => seen('4.4')], ['n_5.7', '飛升', () => seen('5.7')], ['gate_obey', '天門前・歸位', () => flag('k4_obey')], ['cut_gate', '斬天門', () => flag('k4_smash')],
    ['n_8.3', '天道之戰', () => seen('8.3')], ['end_fly', '結局・飛仙', () => !!SD().endings.fly], ['end_slay', '結局・弒天', () => !!SD().endings.slay], ['end_one', '結局・歸一', () => !!SD().endings.one]];
  X.sheet('mvl182', () => '🎬 動畫回顧', b => {
    let h = '<div class="x5-sub" style="margin-bottom:8px">經歷過的動畫可在此重看;未經歷的以 ？？？ 表示。</div>';
    MVL.filter(m => MOV174.has(m[0])).forEach(m => { const ok = safe(m[2]); h += `<div class="x5-row" style="margin-top:6px;gap:8px"><div style="flex:1;min-width:0">${ok ? m[1] : '？？？'}</div>${ok ? `<button class="x5-btn am" data-x5="st28.mv" data-id="${m[0]}">播放</button>` : ''}</div>`; });
    b.innerHTML = h;
  });
  X.act('st28.mvl', () => { if (run) return; X.open('mvl182'); });
  X.act('st28.mv', t => { if (run) return; MOV174.play(t.dataset.id); });
  X.act('st28.op', () => {""")
