#!/usr/bin/env python3
"""介面盤點:用存檔開遊戲,逐一打開各頁面/彈窗,截圖並記錄所有可見按鈕的樣式。
用法:python3 tools/uiscan.py 遊戲.html 存檔.txt 輸出資料夾
"""
import sys, os, json, base64
from playwright.sync_api import sync_playwright
HTML, SAVE, OUT = sys.argv[1:4]
os.makedirs(OUT, exist_ok=True)
sv = json.loads(base64.b64decode(open(SAVE, encoding='utf-8').read().strip()).decode('utf-8'))

COLLECT = r"""() => {
  const out = [];
  const sel = 'button,[role=button],[data-a51],[data-a53],[data-a54],[data-h44],[data-x5],[data-m6],[data-c13],[data-ca52],[data-cf52],[data-caa52],[data-skact],[data-x32c],.tap-effect';
  document.querySelectorAll(sel).forEach(e => {
    const r = e.getBoundingClientRect(); if (r.width < 6 || r.height < 6 || r.bottom < 0 || r.top > innerHeight) return;
    const s = getComputedStyle(e); if (s.visibility === 'hidden' || +s.opacity === 0) return;
    let p = e, vis = true; while (p) { const ps = getComputedStyle(p); if (ps.display === 'none') { vis = false; break; } p = p.parentElement; } if (!vis) return;
    const img = !!e.querySelector('img,.ii,i[class*=ii-],svg') || /url\(/.test(s.backgroundImage);
    out.push({ t: (e.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 14), c: (e.className && e.className.baseVal === undefined ? e.className : '').toString().slice(0, 60),
      a: [...e.attributes].filter(x => x.name.startsWith('data-')).map(x => x.name + '=' + x.value).join(' ').slice(0, 50),
      bg: s.backgroundColor, bgi: s.backgroundImage === 'none' ? '' : s.backgroundImage.slice(0, 30), br: s.borderRadius, w: Math.round(r.width), h: Math.round(r.height), img });
  });
  return out;
}"""

STATES = [
    ('洞府', "goToTab('tab-abode')"), ('洞府_聚', "goToTab('tab-abode');document.querySelector('[data-a53=\"arr\"]')?.click()"),
    ('洞府_悟', "document.querySelector('[data-a53=\"ins\"]')?.click()"),
    ('人物', "goToTab('tab-techniques')"),
]
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 412, 'height': 915})
    pg.add_init_script("if(!sessionStorage.s){sessionStorage.s=1;localStorage.clear();localStorage.setItem('XIUXIAN_SAVE_V2',%s)}" % json.dumps(json.dumps(sv, ensure_ascii=False)))
    pg.goto('file://' + os.path.abspath(HTML)); pg.wait_for_timeout(2500)
    pg.evaluate("()=>{document.getElementById('title34')?.click();try{audio.enabled=false}catch(e){}}"); pg.wait_for_timeout(1200)
    res = {}
    def snap(name):
        pg.wait_for_timeout(700); print(name, pg.evaluate("()=>[state.realmIdx, !!document.getElementById('modal-gender14')]"), flush=True); pg.screenshot(path=os.path.join(OUT, name + '.png')); res[name] = pg.evaluate(COLLECT)
    def closeall():
        pg.evaluate("""()=>{document.querySelectorAll('[data-a53="x"],[data-a54="x"],[data-a51="back"],[data-a51="close"],.x5-x,[data-x5$=".close"]').forEach(e=>{if(e.offsetParent)e.click()});
          try{X5.close&&Object.keys(X5).length}catch(e){} document.querySelectorAll('[id^=modal-]').forEach(m=>m.classList.add('hidden'));
          document.querySelectorAll('.x5-sheet.on,.sheet13.on,#ov51.on,#ov53.on,#ov54.on').forEach(m=>m.classList.remove('on'));}""")
        pg.wait_for_timeout(400)
    tabs = [('洞府', 'tab-abode'), ('人物', 'tab-techniques'), ('歷練', 'tab-adventure'), ('丹器', 'tab-crafting'), ('行囊', 'tab-inventory'), ('仙途', 'tab-records')]
    for n, t in tabs:
        pg.evaluate("id=>goToTab(id)", t); snap(n)
    # 洞府彈窗
    for k in ['arr', 'ins']:
        pg.evaluate("id=>goToTab(id)", 'tab-abode'); pg.evaluate("k=>document.querySelector('[data-a53=\"'+k+'\"]')?.click()", k); snap('洞府_' + k); closeall()
    hs = pg.evaluate("()=>[...document.querySelectorAll('[data-h44]')].map(e=>e.dataset.h44)")
    for k in hs:
        pg.evaluate("id=>goToTab(id)", 'tab-abode'); pg.evaluate("k=>document.querySelector('[data-h44=\"'+k+'\"]')?.click()", k); snap('洞府_h_' + k); closeall()
    # 人物
    for k in pg.evaluate("()=>{goToTab('tab-techniques');return [...document.querySelectorAll('[data-a51=\"sec\"]')].map(e=>e.dataset.k)}"):
        pg.evaluate("id=>goToTab(id)", 'tab-techniques'); pg.evaluate("k=>document.querySelector('[data-a51=\"sec\"][data-k=\"'+k+'\"]')?.click()", k); snap('人物_sec_' + k); closeall()
    for k in pg.evaluate("()=>{goToTab('tab-techniques');return [...document.querySelectorAll('#ch51 [data-m6]')].map(e=>e.dataset.m6)}"):
        pg.evaluate("id=>goToTab(id)", 'tab-techniques'); pg.evaluate("k=>document.querySelector('#ch51 [data-m6=\"'+k+'\"]')?.click()", k); snap('人物_m6_' + k); closeall()
    for a in ['attr', 'aff', 'auto']:
        pg.evaluate("id=>goToTab(id)", 'tab-techniques'); pg.evaluate("a=>document.querySelector('[data-a51=\"'+a+'\"]')?.click()", a); snap('人物_' + a); closeall()
    pg.evaluate("id=>goToTab(id)", 'tab-techniques'); pg.evaluate("()=>document.querySelector('[data-l14=\"open\"]')?.click()"); snap('人物_更衣'); closeall()
    pg.evaluate("id=>goToTab(id)", 'tab-techniques'); pg.evaluate("()=>document.querySelector('[data-s51]')?.click()"); snap('人物_裝備卡'); closeall()
    # 仙途
    for k in pg.evaluate("()=>{goToTab('tab-records');return [...document.querySelectorAll('[data-a54]')].map(e=>e.dataset.a54).filter(k=>k!=='x')}"):
        pg.evaluate("id=>goToTab(id)", 'tab-records'); pg.evaluate("k=>document.querySelector('[data-a54=\"'+k+'\"]')?.click()", k); snap('仙途_' + k); closeall()
    # 歷練 / 丹器 / 行囊
    pg.evaluate("id=>goToTab(id)", 'tab-adventure'); pg.evaluate("()=>{[...document.querySelectorAll('#tab-adventure button')].find(b=>/每日秘境/.test(b.innerText))?.click()}"); snap('歷練_秘境'); closeall()
    pg.evaluate("()=>{goToTab('tab-adventure');state.currentArea=4;startMonsterBattle(AREAS_DATA[4]);}"); snap('歷練_戰鬥')
    pg.evaluate("()=>{try{currentBattle.monster.curHp=1}catch(e){}}"); pg.wait_for_timeout(6000); snap('歷練_戰後'); closeall()
    for k in ['煉器', '坊市']:
        pg.evaluate("id=>goToTab(id)", 'tab-crafting'); pg.evaluate("k=>{[...document.querySelectorAll('#cr52 button,#cr52 [data-x32c]')].find(b=>b.innerText.trim()===k)?.click()}", k); snap('丹器_' + k); closeall()
    for k in ['服丹', '賣裝', '賣材']:
        pg.evaluate("id=>goToTab(id)", 'tab-inventory'); pg.evaluate("k=>{[...document.querySelectorAll('#tab-inventory button')].find(b=>b.innerText.trim()===k)?.click()}", k); snap('行囊_' + k); closeall()
    pg.evaluate("id=>goToTab(id)", 'tab-inventory'); pg.evaluate("()=>document.querySelector('.inv13-cell')?.click()"); snap('行囊_物品'); closeall()
    # 頂部
    for i, n in enumerate(['頂部_左鈕', '頂部_右鈕']):
        pg.evaluate("i=>{const bs=[...document.querySelectorAll('header button, #game-app button')].filter(b=>{const r=b.getBoundingClientRect();return r.top<60&&r.left>250});bs[i]?.click()}", i); snap(n); closeall()
    b.close()
json.dump(res, open(os.path.join(OUT, 'buttons.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
print('states', len(res))
