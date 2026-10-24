#!/usr/bin/env python3
"""版面轉換追蹤:載入遊戲並記錄每次 DOM 結構變動(新增/搬移/隱藏/改寫)是哪個 src 檔第幾行做的。
用法:python3 tools/trace_dom.py 遊戲.html 存檔.txt 輸出.json
(遊戲.html 必須是由目前 src/ 打包出來的,行號才對得上)
"""
import sys, os, re, json, base64, collections
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); SRC = os.path.join(ROOT, 'src')
HTML, SAVE, OUT = sys.argv[1:4]

# ---- 行號對照:輸出 HTML 的第 N 行 → src 檔案與該檔行號 ----
def rd(p): return open(p, encoding='utf-8', newline='').read()
shell = rd(os.path.join(SRC, 'index.html'))
segs, line = [], 1
pos = 0
for m in re.finditer(r'@@INC:([^@]+)@@', shell):
    pre = shell[pos:m.start()]; line += pre.count('\n'); rel = m.group(1)
    files = [os.path.join(rel, f) for f in sorted(os.listdir(os.path.join(SRC, rel))) if f.endswith('.js')] if rel.endswith('/') else [rel]
    for f in files:
        txt = rd(os.path.join(SRC, f)); n = txt.count('\n')
        segs.append((line, line + n, f)); line += n
    pos = m.end()
def where(ln):
    for a, b, f in segs:
        if a <= ln <= b: return f, ln - a + 1
    return 'index.html', ln

INIT = r"""(() => {
  const LOG = window.__TR = []; let on = true; window.__TRon = v => on = v;
  const desc = n => { if (!n || n.nodeType !== 1) return n && n.nodeType === 3 ? '#text' : String(n); return n.tagName.toLowerCase() + (n.id ? '#' + n.id : '') + (n.className && typeof n.className === 'string' ? '.' + n.className.trim().split(/\s+/).slice(0, 2).join('.') : ''); };
  const frame = () => { const s = new Error().stack.split('\n').slice(2); for (const l of s) { const m = l.match(/(?:file|http)[^)]*?:(\d+):(\d+)\)?$/); if (m) return +m[1] + ':' + m[2]; } return '?'; };
  const inBody = n => n && n.isConnected && document.body && document.body.contains(n) && !(n.closest && n.closest('#battle-stage'));
  const rec = (op, tgt, extra) => { if (!on || !inBody(tgt)) return; LOG.push([op, desc(tgt), extra || '', frame()]); };
  const wrap = (proto, name, op, fn) => { const o = proto[name]; proto[name] = function () { try { fn.call(this, op, arguments); } catch (e) {} return o.apply(this, arguments); }; };
  const moved = (n) => n && n.nodeType === 1 && n.isConnected ? 'MOVE ' + desc(n) : 'NEW ' + desc(n);
  wrap(Node.prototype, 'appendChild', 'append', function (op, a) { rec(op, this, moved(a[0])); });
  wrap(Node.prototype, 'insertBefore', 'insertBefore', function (op, a) { rec(op, this, moved(a[0])); });
  wrap(Node.prototype, 'removeChild', 'remove', function (op, a) { rec(op, this, desc(a[0])); });
  ['append', 'prepend', 'before', 'after', 'replaceWith'].forEach(k => wrap(Element.prototype, k, k, function (op, a) { rec(op, this, [...a].map(moved).join(',')); }));
  wrap(Element.prototype, 'remove', 'removeSelf', function (op) { rec(op, this, ''); });
  wrap(Element.prototype, 'insertAdjacentHTML', 'adjHTML', function (op, a) { rec(op, this, a[0] + ' ' + String(a[1]).slice(0, 60)); });
  wrap(Element.prototype, 'insertAdjacentElement', 'adjEl', function (op, a) { rec(op, this, a[0] + ' ' + moved(a[1])); });
  const ih = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
  Object.defineProperty(Element.prototype, 'innerHTML', { set(v) { try { if (/<(div|section|button|nav|span)\b/.test(v)) rec('innerHTML', this, String(v).replace(/data:image[^"')]+/g, 'IMG').slice(0, 60)); } catch (e) {} ih.set.call(this, v); }, get() { return ih.get.call(this); } });
  const ca = DOMTokenList.prototype.add, cr = DOMTokenList.prototype.remove, ct = DOMTokenList.prototype.toggle;
  DOMTokenList.prototype.add = function (...a) { if (a.includes('hidden') && this.__el) rec('hide', this.__el, ''); return ca.apply(this, a); };
  const cl = Object.getOwnPropertyDescriptor(Element.prototype, 'classList');
  Object.defineProperty(Element.prototype, 'classList', { get() { const l = cl.get.call(this); l.__el = this; return l; } });
  const sd = Object.getOwnPropertyDescriptor(CSSStyleDeclaration.prototype, 'display');
})();"""

sv = json.loads(base64.b64decode(open(SAVE, encoding='utf-8').read().strip()).decode('utf-8'))
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 412, 'height': 915})
    pg.add_init_script("if(!sessionStorage.s){sessionStorage.s=1;localStorage.clear();localStorage.setItem('XIUXIAN_SAVE_V2',%s)}" % json.dumps(json.dumps(sv, ensure_ascii=False)))
    pg.add_init_script(INIT)
    pg.goto('file://' + os.path.abspath(HTML)); pg.wait_for_timeout(3000)
    load_log = pg.evaluate("()=>{const l=__TR.splice(0);return l}")
    pg.evaluate("()=>document.getElementById('title34')?.click()"); pg.wait_for_timeout(800); pg.evaluate("()=>__TR.splice(0)")
    tab_logs = {}
    for t in ['tab-techniques', 'tab-adventure', 'tab-crafting', 'tab-inventory', 'tab-records', 'tab-abode']:
        pg.evaluate("t=>goToTab(t)", t); pg.wait_for_timeout(1500)
        tab_logs[t] = pg.evaluate("()=>__TR.splice(0)")
    b.close()

def agg(log):
    c = collections.Counter()
    for op, tgt, extra, fr in log:
        try: ln = int(fr.split(':')[0]); f, l = where(ln)
        except Exception: f, l = '?', 0
        c[(f, l, op, tgt, extra[:70])] += 1
    return [dict(file=f, line=l, op=op, target=t, detail=e, n=n) for (f, l, op, t, e), n in sorted(c.items())]
res = {'load': agg(load_log), 'tabs': {k: agg(v) for k, v in tab_logs.items()}}
json.dump(res, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
byf = collections.Counter(r['file'] for r in res['load'])
print('載入期間結構變動(去重後)', len(res['load']), '筆;各檔案:')
for f, n in byf.most_common(): print('  %4d  %s' % (n, f))
for k, v in res['tabs'].items(): print('切到', k, ':', len(v), '筆')
