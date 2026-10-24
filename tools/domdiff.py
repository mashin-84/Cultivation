#!/usr/bin/env python3
"""等價性測試:固定時鐘與亂數,依序操作,逐步擷取整頁 DOM 與關鍵函式回傳值。
用法:python3 tools/domdiff.py A.html B.html [存檔.txt|new] [輸出資料夾]
兩份 HTML 跑完全相同的步驟,比對每一步的快照,列出不同處。
"""
import sys, os, json, base64, re, difflib
from playwright.sync_api import sync_playwright

A, B = sys.argv[1], sys.argv[2]
sys.argv = [x for x in sys.argv if x != '--full'] + (['--full'] if '--full' in sys.argv else [])
SAVE = sys.argv[3] if len(sys.argv) > 3 else 'new'
OUT = sys.argv[4] if len(sys.argv) > 4 else '/tmp/claude-0/domdiff'
os.makedirs(OUT, exist_ok=True)
T0 = 1793000000000  # 固定時間

raw = None
if SAVE != 'new':
    sv = json.loads(base64.b64decode(open(SAVE, encoding='utf-8').read().strip()).decode('utf-8'))
    sv['lastSave'] = T0
    raw = json.dumps(sv, ensure_ascii=False)

INIT = """(() => {
  let s = 12345; Math.random = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x80000000; };
  if (!sessionStorage.getItem('dd')) { sessionStorage.setItem('dd', '1'); localStorage.clear(); %s }
})();""" % ("localStorage.setItem('XIUXIAN_SAVE_V2', %s);" % json.dumps(raw) if raw else '')

SNAP = r"""() => {
  const r = {};
  const J = f => { try { return JSON.parse(JSON.stringify(f())); } catch (e) { return 'ERR ' + e; } };
  r.stats = J(() => calculateTotalStats());
  r.flags = J(() => redFlags());
  r.dom = (() => { const c = document.body.cloneNode(true); c.querySelectorAll('[style]').forEach(e => e.setAttribute('style', e.style.cssText)); c.querySelectorAll('*').forEach(e => { const at = [...e.attributes].map(a => [a.name, a.value]).sort((x, y) => x[0] < y[0] ? -1 : 1); at.forEach(([k]) => e.removeAttribute(k)); at.forEach(([k, v]) => e.setAttribute(k, v)); }); c.querySelectorAll('[class]').forEach(e => { const v = [...e.classList].sort().join(' '); if (v) e.setAttribute('class', v); else e.removeAttribute('class'); }); return c.innerHTML; })()  /* 正規化:樣式字串、class 排序 */.replace(/<script\b[\s\S]*?<\/script>/g, '').replace(/data:image\/\w+;base64,[A-Za-z0-9+\/=]+/g, 'IMG').replace(/<style\b[\s\S]*?<\/style>/g, '').replace(/<!--[\s\S]*?-->/g, '').replace(/>\s+</g, '><').replace(/^\s+|\s+$/g, '');   // 忽略註解與標籤間空白
  r.dom = r.dom.replace(/<i class="lk-sp"[^>]*><\/i>/g, '');
  r.dom = r.dom.replace(/<div class="dk"[^>]*><img[^>]*><\/div>/g, '');   // 飄落裝飾:同上   // 飄浮粒子:數量隨影格時序不定,不納入比對
  r.dom = r.dom.replace(/<i class="ii\b[^"]*"[^>]*><\/i>/g, '').replace(/[\p{Extended_Pictographic}\uFE0F\uE001-\uE008]/gu, '');   // emoji→圖示轉換器執行時機不定:兩者都去掉
  return r;
}"""

STEPS = [
    ('load', "() => { const t = document.getElementById('title34'); t && t.click(); try { audio.enabled = false; } catch (e) {} }"),
    ('topbar', "() => { updateTopBar(); }"),
    ('tab-abode', "() => goToTab('tab-abode')"),
    ('tab-techniques', "() => goToTab('tab-techniques')"),
    ('skills', "() => { goToTab('tab-techniques'); const b = document.querySelector('[data-a51=\"sec\"][data-k=\"sk\"]'); if (b) b.click(); renderSkills(true); }"),
    ('skills-all', "() => { const b = document.querySelector('[data-skact=\"view\"][data-id=\"all\"]'); if (b) b.click(); renderSkills(true); if (!document.querySelector('#skills-panel .sk27c')) throw new Error('神通面板未開啟'); }"),
    ('skills-school', "() => { const b = document.querySelector('[data-skact=\"view\"][data-id=\"school\"]'); if (b) b.click(); renderSkills(true); }"),
    ('skills-sect', "() => { const b = document.querySelector('[data-skact=\"view\"][data-id=\"sect\"]'); if (b) b.click(); renderSkills(true); }"),
    ('tab-adventure', "() => goToTab('tab-adventure')"),
    ('tab-crafting', "() => goToTab('tab-crafting')"),
    ('tab-inventory', "() => { goToTab('tab-inventory'); renderInventory(); }"),
    ('inv-cat', "() => { const b = document.querySelectorAll('[data-c13]')[2]; if (b) b.click(); renderInventory(); }"),
    ('tab-records', "() => goToTab('tab-records')"),
    ('tick', "() => { goToTab('tab-abode'); }"),
]
CL = "document.querySelectorAll('[data-x5=close],[data-a53=x],[data-a54=x],[data-a51=close],[data-a51=back],[data-l14=x],.lk14-x').forEach(b => b.offsetParent && b.click()); document.querySelectorAll('#sheet13.on').forEach(x => x.classList.remove('on'));"
def click(tab, sel): return "() => { %s goToTab('%s'); const b = document.querySelector(%s); if (b) b.click(); }" % (CL, tab, json.dumps(sel))
if '--full' in sys.argv:
    for k in ['tech', 'tal', 'sk', 'root']: STEPS.append(('人物印章' + k, click('tab-techniques', '#ch51 [data-a51="sec"][data-k="%s"]' % k)))
    for k in ['0', '5', '1']: STEPS.append(('人物m6' + k, click('tab-techniques', '#ch51 [data-m6="%s"]' % k)))
    for a in ['attr', 'auto']: STEPS.append(('人物' + a, click('tab-techniques', '[data-a51="%s"]' % a)))
    STEPS += [('器紋', click('tab-techniques', '[data-x5="af.open"]')), ('裝備卡', click('tab-techniques', '[data-s51]')), ('更衣', click('tab-techniques', '[data-l14="open"]'))]
    for k in ['[data-m6="2"]', '[data-m6="3"]', '[data-a54="ach"]', '[data-a54="daily"]', '[data-a54="path"]', '[data-a54="dao"]', '[data-x5="mn.stat"]', '[data-x5="mn.save"]', '[data-a54="story"]']: STEPS.append(('仙途' + k, click('tab-records', '#rc54 ' + k)))
    for k in ['[data-a53="arr"]', '[data-a53="ins"]', '[data-h44="gd"]', '[data-x5="sm44.open"]', '[data-m6="5"].h44', '[data-m6="6"].h44', '[data-m6="7"].h44']: STEPS.append(('洞府' + k, click('tab-abode', k)))
    for k in ['[data-x32a="daily"]', '[data-x32a="main"]']: STEPS.append(('歷練' + k, click('tab-adventure', k)))
    for k in ['[data-c52="forge"]', '[data-c52="mk"]', '[data-c52="alch"]', '[data-k52="qi"]']: STEPS.append(('丹器' + k, click('tab-crafting', k)))
    for k in ['[data-a54="pill"]', '.inv13-cell']: STEPS.append(('行囊' + k, click('tab-inventory', k)))
    STEPS += [('選單', click('tab-abode', '#btn-menu25')), ('劇情鈕', click('tab-abode', '#btn-story28')), ('收尾', "() => { %s goToTab('tab-abode'); }" % CL)]

def run(html):
    res, errs = [], []
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page(viewport={'width': 412, 'height': 915})
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.clock.install(time=T0)
        pg.clock.pause_at(T0 + 1000)   # 暫停真實時間流動,只靠 run_for 推進
        pg.add_init_script(INIT)
        pg.goto('file://' + os.path.abspath(html))
        pg.clock.run_for(3000)
        for name, js in STEPS:
            pg.evaluate(js); pg.clock.run_for(name == 'tick' and 5000 or 1200)
            res.append((name, pg.evaluate(SNAP)))
        b.close()
    return res, errs

ra, ea = run(A); rb, eb = run(B)
bad = 0
for (n, x), (_, y) in zip(ra, rb):
    for k in ('stats', 'flags', 'dom'):
        if x[k] != y[k]:
            bad += 1
            print('✗', n, k)
            if k == 'dom':
                xa = re.sub(r'>', '>\n', x[k]).split('\n'); ya = re.sub(r'>', '>\n', y[k]).split('\n')
                d = list(difflib.unified_diff(xa, ya, lineterm='', n=0))
                print('\n'.join(l[:200] for l in d[:30]))
            else:
                print('  A', json.dumps(x[k], ensure_ascii=False)[:300]); print('  B', json.dumps(y[k], ensure_ascii=False)[:300])
print('pageerrors A', ea[:3]); print('pageerrors B', eb[:3])
print('步驟', len(ra), '差異', bad, '→', '完全一致' if not bad and ea == eb else '有差異')
sys.exit(1 if bad or ea != eb else 0)
