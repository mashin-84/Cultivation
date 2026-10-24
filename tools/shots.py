#!/usr/bin/env python3
"""截圖:用存檔開遊戲,依序執行步驟並截圖。python3 tools/shots.py 遊戲.html 存檔.txt 輸出資料夾"""
import sys, os, json, base64
from playwright.sync_api import sync_playwright
HTML, SAVE, OUT = sys.argv[1:4]; os.makedirs(OUT, exist_ok=True)
sv = json.loads(base64.b64decode(open(SAVE, encoding='utf-8').read().strip()).decode('utf-8'))
STEPS = [
 ('洞府', "goToTab('tab-abode')"), ('人物', "goToTab('tab-techniques')"), ('歷練', "goToTab('tab-adventure')"),
 ('丹器', "goToTab('tab-crafting')"), ('行囊', "goToTab('tab-inventory')"), ('仙途', "goToTab('tab-records')"),
 ('流派', "goToTab('tab-techniques');document.querySelector('#ch51 [data-m6=\"0\"]').click()"),
 ('裝備卡', "X5.close&&0;document.querySelectorAll('[data-x5=\"close\"]').forEach(b=>b.offsetParent&&b.click());goToTab('tab-techniques');document.querySelector('[data-s51]').click()"),
 ('靈田', "document.querySelectorAll('[data-a51=\"close\"]').forEach(b=>b.offsetParent&&b.click());goToTab('tab-abode');document.querySelector('[data-h44=\"gd\"]').click()"),
 ('戰鬥', "document.querySelectorAll('[data-a53=\"x\"]').forEach(b=>b.offsetParent&&b.click());goToTab('tab-adventure');state.currentArea=4;startMonsterBattle(AREAS_DATA[4])"),
 ('心魔', "endBattle();state.tower.floor=100;stepTower()"),
]
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 412, 'height': 915})
    pg.add_init_script("if(!sessionStorage.s){sessionStorage.s=1;localStorage.clear();localStorage.setItem('XIUXIAN_SAVE_V2',%s)}" % json.dumps(json.dumps(sv, ensure_ascii=False)))
    pg.goto('file://' + os.path.abspath(HTML)); pg.wait_for_timeout(2500)
    pg.evaluate("()=>{document.getElementById('title34')?.click();try{audio.enabled=false}catch(e){}}"); pg.wait_for_timeout(1200)
    pg.evaluate("()=>{document.querySelectorAll('button').forEach(b=>{if(/收納靈氣出關/.test(b.textContent))b.click()})}"); pg.wait_for_timeout(500)
    for n, js in STEPS:
        try: pg.evaluate("()=>{%s}" % js)
        except Exception as e: print(n, 'ERR', str(e)[:120])
        pg.wait_for_timeout(1300); pg.screenshot(path=os.path.join(OUT, n + '.png'))
    b.close()
print('ok')
