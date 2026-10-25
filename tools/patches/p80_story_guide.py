#!/usr/bin/env python3
"""v160 劇情引擎:新增 {guide:'鍵'} 節拍(暫停對話、交給 TUT160 帶玩家實際操作,做完再回到劇情);
blocked() 改以實際可見判斷(fixed 彈窗的 offsetParent 一律是 null,原判斷無效),並在教學進行中不插播劇情。"""
import os
R = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
f = os.path.join(R, 'src/js/02_main/055_v11_0_主線劇情引擎_對話畫面_三層選擇_回顧_章末.js')
t = open(f, encoding='utf-8').read()
def rep(old, new):
    global t
    assert t.count(old) == 1, old[:70]; t = t.replace(old, new)
rep("      if (b.fight) { if (run.replay) continue; return doFight(b.fight); }",
    "      if (b.fight) { if (run.replay) continue; return doFight(b.fight); }\n      if (b.guide) { if (run.replay || !window.TUT160 || TUT160.done(b.guide)) continue; return doGuide(b.guide); }")
rep("  function showFightLose(cfg) {",
    """  /* v160 劇情引導:暫離對話畫面,讓玩家親手按一次對應的按鈕 */
  function doGuide(k) {
    run.fighting = true; run.choosing = false; clearTimeout(timer); clearInterval(typeT); $('st28cs').innerHTML = '';
    $('st28').classList.remove('on');
    let back = false; const done = () => { if (back || !run) return; back = true; run.fighting = false; $('st28').classList.add('on'); next(); };
    try { if (!TUT160.run(k, done)) done(); } catch (e) { done(); }
  }
  function showFightLose(cfg) {""")
rep("    if (run || currentBattle) return true;\n    return ['modal-ascension', 'modal-tribulation', 'modal-offline', 'modal-death-reincarnate', 'modal-event-choice', 'modal-event-result', 'modal-battle-result', 'modal-gender14'].some(id => { const e = $(id); return e && !e.classList.contains('hidden') && e.offsetParent !== null; });",
    "    if (run || currentBattle || (window.TUT160 && TUT160.busy()) || (window.BF113 && BF113.on) || (window.THU160 && THU160.on)) return true;\n    return ['modal-ascension', 'modal-tribulation', 'modal-offline', 'modal-death-reincarnate', 'modal-event-choice', 'modal-event-result', 'modal-battle-result', 'modal-gender14', 'title34'].some(id => { const e = $(id); return e && !e.classList.contains('hidden') && getComputedStyle(e).display !== 'none' && e.getBoundingClientRect().height > 0; });")
open(f, 'w', encoding='utf-8').write(t); print('OK')
