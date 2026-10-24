#!/usr/bin/env python3
"""事件監聽比對:兩份 HTML 載入並逛過各分頁後,列出「掛在哪個元素、什麼事件、哪段函式」的監聽器,找出只在一邊有的。
用法:python3 tools/listeners.py A.html B.html 存檔.txt(或 new 測新開局)"""
import sys, json, base64, collections
from playwright.sync_api import sync_playwright
A, B, SAVE = sys.argv[1:4]
INIT = r"""(()=>{const L=window.__LS=[];const o=EventTarget.prototype.addEventListener;
EventTarget.prototype.addEventListener=function(t,f,opt){try{L.push([this,t,String(f).slice(0,160)])}catch(e){}return o.apply(this,arguments)};
['MutationObserver','ResizeObserver','IntersectionObserver'].forEach(K=>{const C=window[K];if(!C)return;const ob=C.prototype.observe;C.prototype.observe=function(n){try{L.push([n,K,String(this.__cb||'').slice(0,160)])}catch(e){}return ob.apply(this,arguments)};window[K]=function(cb,o){const r=new C(cb,o);r.__cb=cb;return r};window[K].prototype=C.prototype});
const D=['onclick','onchange','oninput','ontoggle','onpointerdown','onscroll'];
window.__desc=n=>{if(n===window)return'window';if(n===document)return'document';if(!n||!n.tagName)return String(n);let s=n.tagName.toLowerCase()+(n.id?'#'+n.id:'');if(!n.id){let p=n.parentElement,c=0;while(p&&!p.id&&c<6){p=p.parentElement;c++}s+=' in '+(p&&p.id?'#'+p.id:'?')+' '+[...n.classList].sort().join('.')}return s};
window.__dump=()=>{const r=L.filter(([n])=>n===window||n===document||(n.isConnected)).map(([n,t,f])=>__desc(n)+' | '+t+' | '+f);
document.querySelectorAll('*').forEach(n=>D.forEach(k=>{if(n[k])r.push(__desc(n)+' | '+k+' | '+String(n[k]).slice(0,160))}));return r}})();"""
sv = None if SAVE == 'new' else json.loads(base64.b64decode(open(SAVE, encoding='utf-8').read().strip()).decode('utf-8'))
def run(H):
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page(viewport={'width': 412, 'height': 915})
        pg.add_init_script("if(!sessionStorage.s){sessionStorage.s=1;localStorage.clear();%s}" % ("" if sv is None else "localStorage.setItem('XIUXIAN_SAVE_V2',%s)" % json.dumps(json.dumps(sv, ensure_ascii=False))))
        pg.add_init_script(INIT); pg.goto('file://' + __import__('os').path.abspath(H)); pg.wait_for_timeout(3500)
        pg.evaluate("()=>document.getElementById('title34')?.click()"); pg.wait_for_timeout(800)
        for t in ['tab-techniques', 'tab-adventure', 'tab-crafting', 'tab-inventory', 'tab-records', 'tab-abode']:
            pg.evaluate("t=>goToTab(t)", t); pg.wait_for_timeout(1200)
        r = pg.evaluate("()=>__dump()"); b.close(); return collections.Counter(r)
ca, cb = run(A), run(B)
only_a = ca - cb; only_b = cb - ca
print('A 監聽', sum(ca.values()), ' B 監聽', sum(cb.values()))
for k, n in only_a.items(): print('只在A', n, k)
for k, n in only_b.items(): print('只在B', n, k)
