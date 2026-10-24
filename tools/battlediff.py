#!/usr/bin/env python3
"""戰鬥等價性測試:固定時鐘與亂數,兩份 HTML 各打同一組戰鬥(勝/敗/各種特殊戰),每場結束後比對
完整 state、畫面 DOM、戰報。每個情境都重新載入頁面(互不影響)。
用法:python3 tools/battlediff.py A.html B.html [存檔.txt] [情境名…]
"""
import sys, os, json, base64, re, difflib
from playwright.sync_api import sync_playwright

A, B = sys.argv[1], sys.argv[2]
SAVE = sys.argv[3] if len(sys.argv) > 3 else os.path.join(os.path.dirname(__file__), '..', 'baseline', 'save_v71.txt')
ONLY = sys.argv[4:]
T0 = 1793000000000
sv = json.loads(base64.b64decode(open(SAVE, encoding='utf-8').read().strip()).decode('utf-8'))
sv['lastSave'] = T0

WIN = "currentBattle && (currentBattle.monster.curHp = 1);"
LOSE = "currentBattle && (currentBattle.playerHp = 1, currentBattle.monster.atk *= 1e6, currentBattle.monster.curHp = currentBattle.monster.hp = 1e18);"
# (名稱, 開戰前設定, 開戰, 開戰後調整)
SC = [
    ('area_win',   "state.currentArea=4;", "startMonsterBattle(AREAS_DATA[state.currentArea])", WIN),
    ('area_lose',  "state.currentArea=4;", "startMonsterBattle(AREAS_DATA[state.currentArea])", LOSE),
    ('area_fight', "state.currentArea=2;", "startMonsterBattle(AREAS_DATA[state.currentArea])", ""),
    ('boss_win',   "state.currentArea=6;", "startMonsterBattle(AREAS_DATA[state.currentArea], true)", WIN),
    ('high_fight', "state.currentArea=7;", "startMonsterBattle(AREAS_DATA[state.currentArea])", ""),
    ('tower_win',  "state.tower.floor=45;", "stepTower()", WIN),
    ('tower_boss', "state.tower.floor=54;", "stepTower()", WIN),
    ('tower_lose', "state.tower.floor=60;", "stepTower()", LOSE),
    ('wb_win',     "", "wbSpawn(true); wbChallenge()", WIN),
    ('wb_lose',    "", "wbSpawn(true); wbChallenge()", LOSE),
    ('jie_win',    "", "startJie49(1)", WIN),
    ('jie_lose',   "", "startJie49(2)", LOSE),
    ('story_win',  "", "TB26.story({tier:5,name:'試劍人',emoji:'⚔️',label:'試劍',onEnd:()=>{}})", WIN),
    ('story_lose', "", "TB26.story({tier:5,name:'試劍人',emoji:'⚔️',label:'試劍',onEnd:()=>{}})", LOSE),
    ('demon_win',  "", "triggerDemonTribulation()", WIN),
    ('demon_lose', "", "triggerDemonTribulation()", LOSE),
    ('flee',       "state.currentArea=4;", "startMonsterBattle(AREAS_DATA[state.currentArea])", "playerBattleFlee();"),
]
if ONLY: SC = [s for s in SC if s[0] in ONLY]

INIT = """(() => {
  let s = 12345, s2 = 999, inRaf = 0; window.__seed = v => { s = v; };
  /* 影格動畫(rAF)的觸發次數不保證一致,給它獨立的亂數流,避免擾動遊戲邏輯的亂數順序 */
  const raf = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = cb => raf(t => { inRaf++; try { return cb(t); } finally { inRaf--; } });
  Math.random = () => { if (inRaf) { s2 = (s2 * 1103515245 + 12345) & 0x7fffffff; return s2 / 0x80000000; } s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x80000000; };
  localStorage.clear(); localStorage.setItem('XIUXIAN_SAVE_V2', %s);
})();""" % json.dumps(json.dumps(sv, ensure_ascii=False))

SNAP = r"""() => {
  const st = JSON.parse(JSON.stringify(state));
  let dom = (() => { const c = document.body.cloneNode(true); c.querySelectorAll('[style]').forEach(e => e.setAttribute('style', e.style.cssText)); c.querySelectorAll('*').forEach(e => { const at = [...e.attributes].map(a => [a.name, a.value]).sort((x, y) => x[0] < y[0] ? -1 : 1); at.forEach(([k]) => e.removeAttribute(k)); at.forEach(([k, v]) => e.setAttribute(k, v)); }); c.querySelectorAll('[class]').forEach(e => { const v = [...e.classList].sort().join(' '); if (v) e.setAttribute('class', v); else e.removeAttribute('class'); }); return c.innerHTML; })()  /* 正規化:樣式字串、class 排序 */.replace(/<script\b[\s\S]*?<\/script>/g, '').replace(/data:image\/\w+;base64,[A-Za-z0-9+\/=]+/g, 'IMG').replace(/<style\b[\s\S]*?<\/style>/g, '').replace(/<!--[\s\S]*?-->/g, '').replace(/>\s+</g, '><').replace(/^\s+|\s+$/g, '');   // 忽略註解與標籤間空白
  dom = dom.replace(/<i class="lk-sp"[^>]*><\/i>/g, '').replace(/<div class="dk"[^>]*><img[^>]*><\/div>/g, '');
  dom = dom.replace(/<i class="ii\b[^"]*"[^>]*><\/i>/g, '').replace(/[\p{Extended_Pictographic}️-]/gu, '');
  return { st, dom, inBattle: !!currentBattle };
}"""

def run(html, sc):
    name, pre, start, adj = sc
    errs = []
    if True:
        b = BR.new_context(viewport={'width': 412, 'height': 915}); pg = b.new_page()
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.clock.install(time=T0); pg.clock.pause_at(T0 + 1000)
        pg.add_init_script(INIT)
        pg.goto('file://' + os.path.abspath(html)); pg.clock.run_for(3000)
        pg.evaluate("() => { document.getElementById('title34')?.click(); try { audio.enabled = false; } catch (e) {} state.autoBattle = true; state.autoExplore = false; }")
        pg.clock.run_for(1500)
        pg.evaluate("() => { %s }" % pre)
        pg.evaluate("() => { __seed(777); %s; %s; if (currentBattle) scheduleAutoBattleTurn(); }" % (start, adj))
        started = pg.evaluate("() => !!currentBattle")
        for i in range(240):
            pg.clock.run_for(1000)
            if not pg.evaluate("() => !!currentBattle"): break
        pg.clock.run_for(4000)
        r = pg.evaluate(SNAP); r['started'] = started; r['errs'] = errs
        b.close()
    return r

def show(x, y):
    xa = re.sub(r'>', '>\n', x).split('\n'); ya = re.sub(r'>', '>\n', y).split('\n')
    return '\n'.join(l[:220] for l in list(difflib.unified_diff(xa, ya, lineterm='', n=0))[:24])

bad = 0
PW = sync_playwright().start(); BR = PW.chromium.launch()
for sc in SC:
    ra, rb = run(A, sc), run(B, sc)
    ok = True
    msgs = []
    if ra['st'] != rb['st']:
        ok = False
        ks = sorted(k for k in set(ra['st']) | set(rb['st']) if ra['st'].get(k) != rb['st'].get(k))
        msgs.append('state 不同欄位: %s' % ks[:12])
        for k in ks[:3]: msgs.append('  %s: A=%s | B=%s' % (k, json.dumps(ra['st'].get(k), ensure_ascii=False)[:150], json.dumps(rb['st'].get(k), ensure_ascii=False)[:150]))
    if ra['dom'] != rb['dom']: ok = False; msgs.append('DOM 不同:\n' + show(ra['dom'], rb['dom']))
    if ra['errs'] != rb['errs']: ok = False; msgs.append('錯誤 A=%s B=%s' % (ra['errs'][:2], rb['errs'][:2]))
    tag = '' if ra['started'] else '(未開戰)'
    tag += '(仍在戰鬥)' if ra['inBattle'] else ''
    print(('✓' if ok else '✗'), sc[0], tag, ('錯誤:%s' % ra['errs'][:1]) if ra['errs'] else '')
    for m in msgs: print('   ', m)
    bad += not ok
print('情境', len(SC), '不一致', bad)
sys.exit(1 if bad else 0)
