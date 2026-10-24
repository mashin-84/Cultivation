#!/usr/bin/env python3
"""凍結版面:把「載入後的最終結構」直接寫進 src/index.html,省去執行時的建立/搬移。
用法:python3 tools/freeze.py
原則(只凍結結構,不凍結狀態):
  - 位置:取載入完成後的最終位置(建立、搬移的結果)
  - 原始標記的元素:屬性/文字以「原始值」為底;腳本建立的元素:以「剛插入那一刻」為底
  - 載入後再被修改的屬性:新開局與存檔兩種狀態都一樣 → 視為與狀態無關,直接凍結;不一樣 → 用底值,交給執行時照舊處理
  - 只存在於新開局的具名元素不凍結(交給執行時依狀態建立)
  - 不凍結:script/style、標題、道號視窗、腳本建立的畫布、洞府立繪舞台內容、紅點/鎖頭/換膚等會自動補上的裝飾
  - 圖片:原始標記與 KEEP 名單保留為圖片標記,其餘清空(由程式填入,避免同一張圖存兩份)
"""
import os, re, json, base64, shutil, subprocess
from html.parser import HTMLParser
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); SRC = os.path.join(ROOT, 'src')
KEEP_IMG = ['#btn-menu25 img', 'img.nvi', 'img.n46', '[data-o]']
EMPTY = ['#lk-stage14', '#bk48']
DECOR = 'i.i74,i.lk9,i.x5-dot,span.rd:not([data-o]),i.rd:not([data-o]),i.rd14'
SAVE = os.path.join(ROOT, 'baseline', 'save_v71.txt')

def rd(p): return open(p, encoding='utf-8', newline='').read()
lines = rd(os.path.join(SRC, 'index.html')).split('\n')
s = next(i for i, l in enumerate(lines) if '<!-- Mobile Container Wrapper' in l or '凍結版面' in l)
e = next(i for i, l in enumerate(lines) if '<!-- Main Game JavaScript Bundle -->' in l)
mark = '\n'.join(lines[s:e])

# ---- 原始標記:編號,記錄原始屬性與純文字 ----
VOID = {'br', 'img', 'input', 'meta', 'link', 'hr', 'source', 'path', 'circle', 'rect', 'line', 'stop', 'ellipse', 'polygon', 'polyline', 'use', 'image'}
class P(HTMLParser):
    def __init__(s): super().__init__(convert_charrefs=True); s.n = 0; s.info = {}; s.stack = []
    def _new(s, attrs):
        s.info[s.n] = {'attrs': attrs, 'kids': 0, 'text': ''}
        if s.stack: s.info[s.stack[-1]]['kids'] += 1
    def handle_starttag(s, tag, attrs):
        s._new(attrs)
        if tag not in VOID: s.stack.append(s.n)
        s.n += 1
    def handle_startendtag(s, tag, attrs): s._new(attrs); s.n += 1
    def handle_endtag(s, tag):
        if tag not in VOID and s.stack: s.stack.pop()
    def handle_data(s, d):
        if s.stack: s.info[s.stack[-1]]['text'] += d
p = P(); p.feed(mark)
cnt = [0]
def tagit(m):
    i = cnt[0]; cnt[0] += 1; return m.group(0) + ' data-o="%d"' % i
inst = re.sub(r'<(?!/|!)[a-zA-Z][a-zA-Z0-9-]*', tagit, mark)
assert cnt[0] == p.n
info = {str(i): [sorted([k, '' if v is None else v] for k, v in x['attrs']), x['text'] if x['kids'] == 0 else None] for i, x in p.info.items()}

tmp = '/tmp/claude-0/freeze_src'
shutil.rmtree(tmp, ignore_errors=True); shutil.copytree(ROOT, tmp, ignore=shutil.ignore_patterns('dist', 'art74', 'baseline'))
open(os.path.join(tmp, 'src', 'index.html'), 'w', encoding='utf-8', newline='').write('\n'.join(lines[:s] + [inst] + lines[e:]))
subprocess.run(['python3', os.path.join(tmp, 'build.py'), os.path.join(tmp, 'f.html')], check=True, capture_output=True)

# ---- 記錄腳本建立元素「剛插入時」的屬性 ----
HOOK = r"""(() => {
  const REC = window.__C0 = new WeakMap();
  const snap = e => [[...e.attributes].filter(a => a.name !== 'data-o').map(a => [a.name, a.name === 'style' ? e.style.cssText : a.value]).sort(), e.children.length ? null : e.textContent];
  const scan = r => { if (!r || r.nodeType !== 1 || !r.isConnected) return; const all = [r, ...r.querySelectorAll('*')]; for (const x of all) if (!x.hasAttribute('data-o') && !REC.has(x)) REC.set(x, snap(x)); };
  const W = (proto, name, after) => { const o = proto[name]; proto[name] = function (...a) { const r = o.apply(this, a); try { after.call(this, a); } catch (e) {} return r; }; };
  W(Node.prototype, 'appendChild', function (a) { scan(a[0]); }); W(Node.prototype, 'insertBefore', function (a) { scan(a[0]); });
  ['append', 'prepend', 'before', 'after', 'replaceWith'].forEach(k => W(Element.prototype, k, function (a) { a.forEach(scan); if (k === 'append' || k === 'prepend') scan(this); }));
  W(Element.prototype, 'insertAdjacentElement', function (a) { scan(a[1]); });
  W(Element.prototype, 'insertAdjacentHTML', function (a) { scan(/^(beforebegin|afterend)$/i.test(a[0]) ? this.parentElement : this); });
  const ih = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
  Object.defineProperty(Element.prototype, 'innerHTML', { set(v) { ih.set.call(this, v); try { scan(this); } catch (e) {} }, get() { return ih.get.call(this); } });
})();"""

COMMON = r"""
  const STT = /^(on|lk|lkd|rdy|hidden|h|show|open|lock9)$/;
  const sig = x => x.tagName + '.' + [...x.classList].filter(c => !STT.test(c)).sort().join('.');
  const key = x => { const path = []; let y = x; while (y && y !== document.body && !y.id && !y.hasAttribute('data-o')) { const p = y.parentElement; const sg = sig(y); let n = 0; for (const c of p.children) { if (c === y) break; if (sig(c) === sg) n++; } path.unshift(sg + '#' + n); y = p; } return (y && y !== document.body ? (y.hasAttribute('data-o') ? 'o' + y.getAttribute('data-o') : 'i' + y.id) : 'B') + '/' + path.join('/'); };
  const cur = x => [[...x.attributes].filter(a => !/^data-(o|c0|fzk|sk74|sk74n|sk74k|i74)$/.test(a.name)).map(a => [a.name, a.name === 'style' ? x.style.cssText.replace(/--[eo]74:[^;]*;?\s*/g, '').trim() : a.value]).sort(), x.querySelector('[data-o]') ? null : x.textContent];
"""
CAP = r"""() => {""" + COMMON + r"""
  const r = { ids: [...document.querySelectorAll('[id]')].map(e => e.id), el: {} };
  document.body.querySelectorAll('*').forEach(x => { if (!x.closest('script,style')) r.el[key(x)] = cur(x); });
  return r; }"""
JS = r"""([info, KEEP, EMPTY, DECOR, other]) => {""" + COMMON + r"""
  /* 先在實際頁面上標好每個元素的比對鍵與底值,再複製 */
  document.body.querySelectorAll('*').forEach(x => { if (x.closest('script,style')) return; x.setAttribute('data-fzk', key(x)); if (!x.hasAttribute('data-o') && window.__C0.has(x)) x.setAttribute('data-c0', JSON.stringify(window.__C0.get(x))); });
  const c = document.body.cloneNode(true);
  c.querySelectorAll('script,style,#title34,#modal-gender14,canvas:not([data-o]),' + DECOR).forEach(e => e.remove());
  EMPTY.forEach(s => c.querySelectorAll(s).forEach(e => { e.innerHTML = ''; }));
  const sid = new Set(other.ids); c.querySelectorAll('[id]:not([data-o])').forEach(e => { if (!sid.has(e.id)) e.remove(); });
  /* 腳本建立、但存檔狀態不存在的元素(依位置比對)不凍結 */
  c.querySelectorAll('[data-c0]').forEach(e => { if (e.isConnected !== false && !(e.getAttribute('data-fzk') in other.el)) e.remove(); });
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  c.querySelectorAll('*').forEach(x => {
    const k = x.getAttribute('data-fzk'); const base = x.hasAttribute('data-o') ? info[x.getAttribute('data-o')] : (x.hasAttribute('data-c0') ? JSON.parse(x.getAttribute('data-c0')) : null);
    x.removeAttribute('data-fzk'); x.removeAttribute('data-c0');
    const N = cur(x), S = other.el[k];
    if (!base || (S && same(N, S))) return;
    const n = Object.fromEntries(N[0]), s = S ? Object.fromEntries(S[0]) : {}, o = Object.fromEntries(base[0]);
    for (const a of new Set([...Object.keys(n), ...Object.keys(s), ...Object.keys(o)])) {
      if (a === 'class') {
        const A = new Set((n[a] || '').split(/\s+/).filter(Boolean)), B = new Set((s[a] || '').split(/\s+/).filter(Boolean)), C = new Set((o[a] || '').split(/\s+/).filter(Boolean));
        const keep = [...new Set([...A, ...B, ...C])].filter(t => (A.has(t) && B.has(t)) || (A.has(t) !== B.has(t) && C.has(t)));
        if (keep.length) x.setAttribute('class', keep.join(' ')); else x.removeAttribute('class');
      } else if (a in n && a in s && n[a] === s[a]) x.setAttribute(a, n[a]);
      else if (a in o) x.setAttribute(a, o[a]); else x.removeAttribute(a);
    }
    if (base[1] !== null && N[1] !== null && S && S[1] !== N[1]) x.textContent = base[1];   // 原為純文字、兩狀態文字不同 → 還原原始文字(連同腳本塞入的小圖示)
  });
  c.querySelectorAll(KEEP.join(',')).forEach(e => e.setAttribute('data-keepimg', '1'));
  c.querySelectorAll('[data-sk74],[data-sk74n],[data-sk74k],[data-i74]').forEach(e => { ['data-sk74','data-sk74n','data-sk74k','data-i74'].forEach(a => e.removeAttribute(a)); e.style.removeProperty('--e74'); e.style.removeProperty('--o74'); if (!e.getAttribute('style')) e.removeAttribute('style'); });
  return c.innerHTML;
}"""
sv = json.loads(base64.b64decode(open(SAVE, encoding='utf-8').read().strip()).decode('utf-8'))
with sync_playwright() as pw:
    b = pw.chromium.launch()
    pg = b.new_page(viewport={'width': 412, 'height': 915}); pg.add_init_script(HOOK)
    pg.add_init_script("if(!sessionStorage.s){sessionStorage.s=1;localStorage.clear();localStorage.setItem('XIUXIAN_SAVE_V2',%s)}" % json.dumps(json.dumps(sv, ensure_ascii=False)))
    pg.goto('file://' + os.path.join(tmp, 'f.html')); pg.wait_for_timeout(4000)
    other = pg.evaluate(CAP); pg.close()
    pg = b.new_page(viewport={'width': 412, 'height': 915}); pg.add_init_script(HOOK)
    pg.goto('file://' + os.path.join(tmp, 'f.html')); pg.wait_for_timeout(4000)
    body = pg.evaluate(JS, [info, KEEP_IMG, EMPTY, DECOR, other]); b.close()

man = json.load(open(os.path.join(SRC, 'assets', 'manifest.json'), encoding='utf-8'))
idx = {base64.b64encode(open(os.path.join(SRC, 'assets', m['id'] + '.webp'), 'rb').read()).decode(): m['id'] for m in man}
def img_sub(m):
    tag = m.group(0)
    return re.sub(r'data:image/[a-z]+;base64,([A-Za-z0-9+/=]+)', lambda mm: ('data:image/webp;base64,@@IMG:%s@@' % idx[mm.group(1)]) if ('data-keepimg' in tag and mm.group(1) in idx) else '', tag)
body = re.sub(r'<[^>]*data:image/[a-z]+;base64,[^>]*>', img_sub, body)
body = body.replace(' data-keepimg="1"', '')
body = re.sub(r'url\((?:&quot;|")?\)', 'none', body)
body = re.sub(r' data-o="\d+"', '', body)
assert 'base64,' not in body.replace('base64,@@IMG', '')
out = lines[:s] + ['<!-- ===== 凍結版面(最終版77 起):由 tools/freeze.py 擷取載入後的最終結構 ===== -->', body.strip()] + lines[e:]
open(os.path.join(SRC, 'index.html'), 'w', encoding='utf-8', newline='').write('\n'.join(out))
print('凍結完成:原始元素 %d 個,標記 %d 字' % (p.n, len(body)))
