#!/usr/bin/env python3
"""按鈕檢查:逛各分頁、點開各面板,列出「文字超出按鈕」或「兩顆按鈕重疊」的雲紋按鈕。
用法:python3 tools/btncheck.py 遊戲.html 存檔.txt(或 new)"""
import sys, os, json, base64
from playwright.sync_api import sync_playwright
HTML, SAVE = sys.argv[1:3]
CHK = r"""()=>{const out=[];const L=[...document.querySelectorAll('[data-sk74]')].filter(b=>b.offsetParent&&/^[pwjgm]$/.test(b.dataset.sk74));
const nm=b=>(b.id?'#'+b.id:'')+' '+(b.textContent||'').trim().slice(0,14);
L.forEach(b=>{if(b.scrollWidth>b.clientWidth+2)out.push('超出 '+nm(b)+' '+b.scrollWidth+'>'+b.clientWidth)});
for(let i=0;i<L.length;i++)for(let j=i+1;j<L.length;j++){const a=L[i].getBoundingClientRect(),c=L[j].getBoundingClientRect();const ox=Math.min(a.right,c.right)-Math.max(a.left,c.left),oy=Math.min(a.bottom,c.bottom)-Math.max(a.top,c.top);const P=x=>x.parentElement,G=x=>x.parentElement&&x.parentElement.parentElement;if(ox>1&&oy>1&&(P(L[i])===P(L[j])||G(L[i])===G(L[j])))out.push('重疊 '+nm(L[i])+' / '+nm(L[j]))}
return out}"""
sv = None if SAVE == 'new' else base64.b64decode(open(SAVE, encoding='utf-8').read().strip()).decode()
res = set()
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 412, 'height': 915})
    pg.add_init_script("if(!sessionStorage.s){sessionStorage.s=1;localStorage.clear();%s}" % ("" if sv is None else "localStorage.setItem('XIUXIAN_SAVE_V2',%s)" % json.dumps(sv)))
    pg.goto('file://' + os.path.abspath(HTML)); pg.wait_for_timeout(3500)
    pg.evaluate("()=>{document.getElementById('title34')?.click();document.querySelectorAll('#modal-gender14').forEach(e=>e.style.display='none')}"); pg.wait_for_timeout(1000)
    def chk(tag):
        for r in pg.evaluate(CHK): res.add(tag + ' | ' + r)
    for t in ['tab-abode', 'tab-techniques', 'tab-adventure', 'tab-crafting', 'tab-inventory', 'tab-records']:
        pg.evaluate("t=>goToTab(t)", t); pg.wait_for_timeout(900); chk(t)
        n = pg.evaluate("t=>{const s='#'+t+' button,#ch51 button,#cr52 button,#iv54 button,#rc54 button,#hub44 button,#pc44 button';return [...document.querySelectorAll(s)].filter(b=>b.offsetParent).length}", t)
        for i in range(min(n, 40)):
            try:
                pg.evaluate("([t,i])=>{const bad=/重置|重新開局|轉世|洗髓|出售|賣|熔|刪除|匯入|散功/;const s='#'+t+' button,#ch51 button,#cr52 button,#iv54 button,#rc54 button,#hub44 button,#pc44 button';const L=[...document.querySelectorAll(s)].filter(b=>b.offsetParent);const b=L[i];if(b&&!bad.test(b.textContent))b.click()}", [t, i]); pg.wait_for_timeout(250)
                chk(t + '#%d' % i)
                pg.evaluate("()=>{document.querySelectorAll('[data-x5=close],[data-a53=x],[data-a54=x],[data-a51=back],[data-l14=x]').forEach(x=>x.offsetParent&&x.click());document.querySelectorAll('.x5-ov').forEach(m=>m.classList.add('x5-h'))}")
            except Exception as e: pass
    pg.evaluate("()=>goToTab('tab-abode')")
    for sid in pg.evaluate("()=>[...document.querySelectorAll('[id^=x5s-]')].map(e=>e.id.slice(4))"):
        try: pg.evaluate("id=>X5.open(id)", sid); pg.wait_for_timeout(200); chk('sheet ' + sid); pg.evaluate("()=>document.querySelectorAll('.x5-ov').forEach(m=>m.classList.add('x5-h'))")
        except Exception: pass
    b.close()
import re
agg = {}
for r in res: k = r.split(' | ', 1)[1]; agg.setdefault(k, r.split(' | ')[0])
for k, v in sorted(agg.items()): print(k, '  @', v)
print('共', len(agg))
