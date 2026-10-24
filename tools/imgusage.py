#!/usr/bin/env python3
"""圖片使用盤點:用存檔與新開局跑過各分頁、所有面板、各種戰鬥,記錄「實際被畫出來/載入過」的內嵌圖片,
對照 src/assets 列出從未出現過的圖(=候選未使用,仍需人工確認取用邏輯)。
用法:python3 tools/imgusage.py 遊戲.html 存檔.txt 輸出.json"""
import sys, os, json, base64, glob, re
from playwright.sync_api import sync_playwright
HTML, SAVE, OUT = sys.argv[1:4]
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KEY = {}
for p in glob.glob(os.path.join(ROOT, 'src/assets/*/*.webp')):
    b = base64.b64encode(open(p, 'rb').read()).decode()
    KEY[b[:80] + '|' + str(len(b))] = os.path.relpath(p, os.path.join(ROOT, 'src/assets'))[:-5]
INIT = r"""(()=>{const U=window.__U=new Set();const fp=s=>{if(typeof s!=='string')return;let i=s.indexOf('base64,');while(i>=0){let j=i+7,k=j;while(k<s.length&&/[A-Za-z0-9+\/=]/.test(s[k]))k++;U.add(s.slice(j,j+80)+'|'+(k-j));i=s.indexOf('base64,',k)}};window.__fp=fp;
const d=Object.getOwnPropertyDescriptor(HTMLImageElement.prototype,'src');Object.defineProperty(HTMLImageElement.prototype,'src',{set(v){fp(v);d.set.call(this,v)},get(){return d.get.call(this)}});
const sa=Element.prototype.setAttribute;Element.prototype.setAttribute=function(n,v){if(/src|href/.test(n))fp(String(v));return sa.apply(this,arguments)};
const di=CanvasRenderingContext2D.prototype.drawImage;CanvasRenderingContext2D.prototype.drawImage=function(im){try{fp(im.src||'')}catch(e){}return di.apply(this,arguments)};
window.__scan=()=>{const P=['backgroundImage','borderImageSource','maskImage','webkitMaskImage','listStyleImage','content'];document.querySelectorAll('*').forEach(e=>{if(e.src)fp(e.src);if(e.tagName==='image')fp(e.getAttribute('href')||e.getAttribute('xlink:href'));for(const ps of [null,'::before','::after']){const cs=getComputedStyle(e,ps);for(const k of P){const v=cs[k];if(v&&v.length>20&&v.indexOf('base64')>=0)fp(v)}}});return U.size}})();"""
STEPS = []
def S(js): STEPS.append(js)
S("()=>{document.getElementById('title34')?.click()}")
for t in ['tab-abode','tab-techniques','tab-adventure','tab-crafting','tab-inventory','tab-records']: S("()=>goToTab('%s')" % t)
CL = "()=>{document.querySelectorAll('[data-x5=close],[data-a53=x],[data-a54=x],[data-a51=close],[data-a51=back],[data-l14=x],.lk14-x').forEach(b=>b.offsetParent&&b.click());document.querySelectorAll('.x5-ov').forEach(m=>m.classList.add('x5-h'))}"
# 每個分頁上所有可點的按鈕都點一次(會開面板),點完關閉
CLICKALL = """async (t)=>{goToTab(t);await new Promise(r=>setTimeout(r,300));const sel='#'+t+' button, #'+t+' [data-x5], #'+t+' [data-a51], #'+t+' [data-a53], #'+t+' [data-a54], #'+t+' [data-m6], #'+t+' [data-c52], #ch51 button, #pc44 button, #cr52 button, #iv54 button, #rc54 button, #hub44 button';
const bad=/重置|重新開局|轉世|洗髓|出售|賣|熔|刪除|匯入|reset|sell/;const L=[...document.querySelectorAll(sel)].filter(b=>!bad.test(b.textContent||''));const n=Math.min(L.length,80);
for(let i=0;i<n;i++){const b=L[i];if(!b.isConnected)continue;try{b.click()}catch(e){}await new Promise(r=>setTimeout(r,120));__scan();document.querySelectorAll('[data-x5=close],[data-a53=x],[data-a54=x],[data-a51=back],[data-l14=x]').forEach(x=>x.offsetParent&&x.click());}return n}"""
BATTLES = ["state.currentArea=%d;startMonsterBattle(AREAS_DATA[%d])" % (i, i) for i in range(0, 12)] + ["startMonsterBattle(AREAS_DATA[6],true)", "state.tower.floor=54;stepTower()", "state.tower.floor=99;stepTower()", "wbSpawn(true);wbChallenge()", "startJie49(1)", "triggerDemonTribulation()"]
def run(save):
    used = set()
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page(viewport={'width': 412, 'height': 915})
        sv = None if save == 'new' else base64.b64decode(open(save, encoding='utf-8').read().strip()).decode('utf-8')
        pg.add_init_script("if(!sessionStorage.s){sessionStorage.s=1;localStorage.clear();%s}" % ("" if sv is None else "localStorage.setItem('XIUXIAN_SAVE_V2',%s)" % json.dumps(sv)))
        pg.add_init_script(INIT); pg.goto('file://' + os.path.abspath(HTML)); pg.wait_for_timeout(3500)
        pg.evaluate("()=>__scan()")
        for js in STEPS:
            try: pg.evaluate(js); pg.wait_for_timeout(700); pg.evaluate("()=>__scan()")
            except Exception as e: print('step err', str(e)[:100])
        for t in ['tab-abode','tab-techniques','tab-adventure','tab-crafting','tab-inventory','tab-records']:
            try: print(t, pg.evaluate(CLICKALL, t)); pg.evaluate(CL)
            except Exception as e: print('click err', str(e)[:100])
        try: print('sheets', pg.evaluate("""async()=>{const ids=[...document.querySelectorAll('[id^=x5s-]')].map(e=>e.id.slice(4));for(const id of ids){try{X5.open(id)}catch(e){}await new Promise(r=>setTimeout(r,150));__scan();document.querySelectorAll('.x5-ov').forEach(m=>m.classList.add('x5-h'))}return ids.length}"""))
        except Exception as e: print('sheet err', str(e)[:100])
        for bt in BATTLES:
            try:
                pg.evaluate("()=>{try{if(currentBattle){currentBattle=null}}catch(e){}; %s}" % bt); pg.wait_for_timeout(1500); pg.evaluate("()=>__scan()")
                pg.evaluate("()=>{try{currentBattle&&(currentBattle.monster.curHp=1)}catch(e){}}"); pg.wait_for_timeout(2500); pg.evaluate("()=>__scan()")
            except Exception as e: print('battle err', bt, str(e)[:100])
        used = set(pg.evaluate("()=>[...__U]")); b.close()
    return used
used = set()
for s in [SAVE, 'new']: used |= run(s)
names = {KEY[u] for u in used if u in KEY}
allk = sorted(KEY.values()); un = [k for k in allk if k not in names]
sz = lambda k: os.path.getsize(os.path.join(ROOT, 'src/assets', k + '.webp'))
json.dump({'used': sorted(names), 'unused': un}, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
print('圖片總數', len(allk), '用到', len(names), '未見', len(un), '未見大小 %d KB' % (sum(map(sz, un)) // 1024))
import collections
c = collections.defaultdict(lambda: [0, 0])
for k in un: t = k.split('/')[0]; c[t][0] += 1; c[t][1] += sz(k)
for t, (n, s) in sorted(c.items(), key=lambda x: -x[1][1]): print('  %-14s %3d 張 %5d KB' % (t, n, s // 1024))
