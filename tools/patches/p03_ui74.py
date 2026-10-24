#!/usr/bin/env python3
"""最終版74:介面統一(按鈕換生成圖)+ 九九登天塔第100層心魔專屬立繪
- src/css/04_ui74.css:圖片變數、圖示按鈕(印章/仙途/洞府/行囊/更衣/箭頭/關閉/吐納)、按鈕底圖樣式
- src/js/23_v74_介面統一・心魔.js:依按鈕原本顏色判定用途→套底圖、前置小圖示;心魔立繪與出手/受擊姿勢
- 018 的 fx.setup 包裝鏈加入 XT.fxSetup74
"""
import os, glob
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src')
A = sorted(os.path.basename(f)[:-5] for f in glob.glob(os.path.join(ROOT, 'assets', 'UI74', '*.webp')))
ICONS = [a for a in A if a.startswith('ic_')]
SKINS = [a for a in A if a.startswith('sk_')]
XM = [a for a in A if a.startswith('xm_')]
U = lambda k: 'url(data:image/webp;base64,@@IMG:UI74/%s@@)' % k

css = ['/* ===== v74 介面統一:按鈕全面換成生成圖(圖示按鈕+按鈕底圖) ===== */',
       ':root{' + ''.join('--%s:%s;' % (a.replace('_', '-'), U(a)) for a in ICONS + SKINS) + '}']
# ---------- 圖示按鈕:木框圓環 + 插畫圖示 ----------
seal_sel = ['#ch51 .xl button i.sl51', '#rc54 .gr button i.sl', '#ab53r .sb53 i:not(.rd)', 'button.sealb']
css.append(','.join(seal_sel) + '{font-size:0!important;color:transparent!important;background:var(--ic74) center/70% no-repeat,var(--sk-ring-s) center/100% no-repeat,radial-gradient(circle,#fffaf0 0 62%,transparent 64%)!important;box-shadow:0 2px 5px rgba(60,40,15,.18)!important;text-shadow:none!important}')
MAP = {
    '#ch51 .xl button[data-k="tech"] i.sl51': 'tech', '#ch51 .xl button[data-k="tal"] i.sl51': 'tal',
    '#ch51 .xl button[data-k="sk"] i.sl51': 'sk', '#ch51 .xl button[data-m6="0"] i.sl51': 'sch',
    '#ch51 .xl button[data-m6="5"] i.sl51': 'body', '#ch51 .xl button[data-m6="1"] i.sl51': 'sec',
    '#ch51 .xl button[data-k="root"] i.sl51': 'root', 'button.sealb[data-l14="open"]': 'look',
    '#rc54 .gr button[data-m6="2"] i.sl': 'dex', '#rc54 .gr button[data-m6="3"] i.sl': 'title',
    '#rc54 .gr button[data-a54="ach"] i.sl': 'mile', '#rc54 .gr button[data-a54="daily"] i.sl': 'daily',
    '#rc54 .gr button[data-a54="path"] i.sl': 'path', '#rc54 .gr button[data-a54="dao"] i.sl': 'dao',
    '#rc54 .gr button[data-x5="mn.stat"] i.sl': 'stat', '#rc54 .gr button[data-x5="mn.save"] i.sl': 'save',
    '#rc54 .gr button[data-a54="story"] i.sl': 'story',
    '#ab53r .sb53[data-a53="arr"] i:not(.rd)': 'arr', '#ab53r .sb53[data-a53="ins"] i:not(.rd)': 'ins',
}
for sel, k in MAP.items(): css.append('%s{--ic74:var(--ic-%s)}' % (sel, k))
# 吐納聚氣:大玉環 + 圖示,文字移到下緣
css.append('#ab53r #btn-tap-cultivate,#btn-tap-cultivate{background:var(--ic-tuna) center 30%/54% no-repeat,var(--sk-ring-l) center/104% no-repeat,radial-gradient(circle,#fffaf0 0 60%,transparent 62%)!important;color:#7a2a1e!important;box-shadow:0 3px 8px rgba(60,40,15,.22)!important;border:0!important;justify-content:flex-end!important;padding-bottom:13px!important;text-shadow:0 0 3px #fffaf0,0 0 2px #fffaf0}')
css.append('#btn-tap-cultivate .ii,#btn-tap-cultivate img,#btn-tap-cultivate .text-xl{display:none!important}')
css.append('#ab53r #btn-tap-cultivate span{font-size:11px!important;line-height:1.15!important;color:#7a2a1e!important;background:rgba(255,250,238,.88)!important;border-radius:6px!important;padding:0 5px!important;margin:0!important;box-shadow:none!important;text-shadow:none!important;opacity:1!important;font-weight:800!important}')
css.append('#ab53r #btn-tap-cultivate span+span{font-size:9.5px!important;margin-top:1px!important;color:#9a4a2a!important}')
# ---------- 箭頭、關閉:只留圖示 ----------
css.append('[data-sk74="x"],[data-sk74="al"],[data-sk74="ar"]{font-size:0!important;color:transparent!important;background:var(--ic74) center/62% no-repeat!important;border:0!important;box-shadow:none!important;text-shadow:none!important}')
css.append('[data-sk74="x"]{--ic74:var(--ic-close)}[data-sk74="al"]{--ic74:var(--ic-left);background-size:78%!important}[data-sk74="ar"]{--ic74:var(--ic-right);background-size:78%!important}')
# ---------- 按鈕底圖(九宮格:只拉伸中段;兩端雲紋可微微凸出按鈕外) ----------
SK = {'p': ('btn-p', '21%', '#fff7ea', '0 1px 2px rgba(110,20,20,.55)'),
      'w': ('btn-w', '21%', '#4b2f1d', '0 1px 0 rgba(255,245,225,.6)'),
      'j': ('btn-j', '21%', '#173f37', '0 1px 0 rgba(255,255,255,.5)'),
      'g': ('btn-g', '18%', '#5a3a0c', '0 1px 0 rgba(255,250,235,.7)'),
      'm': ('btn-m', '21%', '#fff', '0 1px 2px rgba(60,30,90,.55)'),
      'ton': ('tab-on', '12%', '#fff7ea', '0 1px 2px rgba(110,20,20,.5)'),
      'toff': ('tab-off', '12%', '#6b5640', 'none'),
      'con': ('chip-on', '45%', '#fff7ea', '0 1px 2px rgba(110,20,20,.5)'),
      'coff': ('chip-off', '45%', '#6b5640', 'none'),
      'ban': ('banner', '8%', '#5a4330', 'none')}
css.append('[data-sk74]:not([data-sk74="x"]):not([data-sk74="al"]):not([data-sk74="ar"]){background:transparent!important;background-image:none!important;border-width:0!important;border-style:solid!important;border-color:transparent!important;border-radius:0!important;box-shadow:none!important;border-image-repeat:stretch!important;border-image-width:0 var(--e74,28px)!important;border-image-outset:0 var(--o74,0px)!important;font-weight:700!important;outline:0}')
for k, (img, sl, col, sh) in SK.items():
    css.append('[data-sk74="%s"]{border-image-source:var(--sk-%s)!important;border-image-slice:0 %s fill!important;color:%s!important;text-shadow:%s!important}' % (k, img, sl, col, sh))
css.append('[data-sk74="p"] *,[data-sk74="m"] *,[data-sk74="ton"] *,[data-sk74="con"] *{color:inherit!important}')
css.append('[data-sk74="w"] *,[data-sk74="j"] *,[data-sk74="g"] *,[data-sk74="toff"] *,[data-sk74="coff"] *{color:inherit!important}')
css.append('[data-sk74]:disabled,[data-sk74].opacity-50,[data-sk74].cursor-not-allowed{filter:grayscale(.85) brightness(1.04);opacity:.72}')
css.append('[data-sk74]:not(:disabled):active{transform:translateY(1px) scale(.98)}')
# 前置小圖示
css.append('i.i74{display:inline-block;flex:none;width:1.45em;height:1.45em;background:var(--i74) center/contain no-repeat;vertical-align:-.38em;margin-right:.2em;font-style:normal}')
css.append('[data-sk74] i.i74{filter:drop-shadow(0 1px 1px rgba(60,30,10,.25))}')
css.append('[data-i74] .ii,[data-i74] img{display:none!important}')
# ---------- 九九登天塔第100層心魔 ----------
css.append('.bs-mi.xm74{height:130px;max-width:none;animation:xm74 2.6s ease-in-out infinite alternate}')
css.append('@keyframes xm74{from{filter:drop-shadow(0 0 4px rgba(110,40,170,.75)) drop-shadow(0 4px 3px rgba(0,0,0,.5))}to{filter:drop-shadow(0 0 11px rgba(140,40,190,.95)) drop-shadow(0 0 3px rgba(190,30,60,.6)) drop-shadow(0 4px 3px rgba(0,0,0,.5))}}')
def boost(rule):
    if rule.startswith((':root', '@', '/*')): return rule
    sel, body = rule.split('{', 1)
    return ','.join('body:not(#z74) ' + x.strip() for x in sel.split(',')) + '{' + body
css = [boost(r) if not r.startswith('@keyframes') else r for r in css]
open(os.path.join(ROOT, 'css', '04_ui74.css'), 'w', encoding='utf-8', newline='').write('\n'.join(css) + '\n')

# ---------- JS 模組 ----------
xmj = '{' + ','.join('%s:"data:image/webp;base64,@@IMG:UI74/%s@@"' % (a, a) for a in XM) + '}'
js = r'''/* ===== v74 介面統一(按鈕換生成圖)・九九登天塔第100層心魔立繪 ===== */
(function () {
  /* ---------- 明確指定:選擇器 → 底圖種類(p 朱紅主要 / w 檀木次要 / j 青玉確認 / g 金色特殊 / m 紫晶道心),可附前置圖示 ---------- */
  const EXPL = [
    ['#btn-trigger-breakthrough', 'g', 'brk'], ['[data-enhall]', 'p', 'enhall'], ['#ch51 [data-a51="auto"]', 'w', 'autoeq'],
    ['[data-x5="af.open"],#ch51 [data-a51="aff"]', 'w', 'aff'], ['[data-a51="enh"]', 'p'], ['[data-a51="enhm"]', 'w'], ['button.eqb', 'w'],
    ['[data-ca52]', 'p', 'alch'], ['[data-caa52]', 'w'], ['#btn-step-explore', 'j', 'next'], ['#btn-auto-explore', 'w', 'auto'],
    ['#btn-speed-out', 'w', 'speed'], ['[data-a54="pill"]', 'coff', 'pill'], ['[data-a54="seq"]', 'coff', 'sellg'],
    ['[data-a54="smat"]', 'coff', 'sellm'], ['#ch51 [data-a51="attr"]', 'coff'], ['.lk14-eq', 'w'],
  ];
  const PRE = { '[data-c52="alch"]': 'alch', '[data-c52="forge"]': 'forge', '[data-c52="mk"]': 'market' };
  const TABS = '[data-c52],[data-x32a],[data-x5$=".tab"],[data-act="ming-tab"],[data-l14="g"],[id^="subtab-"]';
  const CHIPS = '[data-k52],[data-c13],.sk27c button';
  const EXCL = '#nav25 *,#nav25,.inv13-cell,.rc,.sl,.h44,[data-area],.gd-t,[data-r52],[data-s51],[data-l14="gp"],.sealb,#ch51 .xl button,#rc54 .gr button,#ab53r .sb53,#btn-tap-cultivate,[data-x5="st28.hub"],#title34 *,#st28 *,#modal-gender14 *,#btn-edit-name,[data-skbtn] img';
  const isX = t => /^[✕×✖]$/.test(t);

  function rgbs(el) {
    const s = getComputedStyle(el), out = [];
    const m = s.backgroundColor.match(/rgba?\(([^)]+)\)/); if (m) { const v = m[1].split(',').map(Number); if ((v[3] ?? 1) > .25) out.push(v); }
    if (!out.length) { const g = s.backgroundImage.match(/rgba?\([^)]+\)/); if (g) { const v = g[0].replace(/rgba?\(|\)/g, '').split(',').map(Number); if ((v[3] ?? 1) > .25) out.push(v); } }
    return out[0] || null;
  }
  function fam(v) {
    if (!v) return null;
    let [r, g, b] = v.map(x => x / 255); const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
    const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1)); let h = 0;
    if (d) h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h = (h * 60 + 360) % 360;
    if (l > .82 && s < .6) return 'light';
    if (s < .22 || l < .17) return 'w';
    if (h >= 340 || h < 14) return 'p';
    if (h < 55) return 'g';
    if (h < 200) return 'j';
    if (h < 245) return 'w';
    return 'm';
  }
  function decide(el) {
    for (const [sel, t, ic] of EXPL) if (el.matches(sel)) return [t, ic];
    const txt = (el.textContent || '').trim();
    if (el.matches('[data-x5="close"],[data-a53="x"],[data-a54="x"],[data-a51="close"]') || (isX(txt) && !el.querySelector('img'))) return ['x'];
    if (el.matches('.ar.l,[data-a51="prev"]') || (txt === '‹' && !el.children.length)) return ['al'];
    if (el.matches('.ar.r,[data-a51="next"]') || (txt === '›' && !el.children.length)) return ['ar'];
    if (el.closest(EXCL)) return [null];
    if (!txt && el.querySelector('img,.ii,svg')) return [null];
    const r = el.getBoundingClientRect(); if (r.height > 60 || r.height < 18 || r.width < 30) return [null];
    if ([...el.querySelectorAll('img')].some(i => i.getBoundingClientRect().height > 26)) return [null];
    const pre = Object.keys(PRE).find(s => el.matches(s));
    if (el.matches(TABS) || el.matches(CHIPS)) {
      const chip = el.matches(CHIPS); let on = el.classList.contains('on');
      if (!on && !el.parentElement.querySelector(':scope > .on')) { const f = fam(rgbs(el)); on = !!f && f !== 'light' && f !== 'w'; }
      return [chip ? (on ? 'con' : 'coff') : (on ? 'ton' : 'toff'), pre && PRE[pre]];
    }
    const f = fam(rgbs(el)); if (!f) return [null];
    if (f === 'light') return ['coff'];
    return [f];
  }
  function apply(el) {
    const key = el.className + '|' + el.disabled;
    if (el.dataset.sk74k === key && (el.dataset.sk74 || el.dataset.sk74n)) { icon(el); return; }
    el.removeAttribute('data-sk74'); el.removeAttribute('data-sk74n');
    const [t, ic] = decide(el); el.dataset.sk74k = key;
    if (!t) { el.dataset.sk74n = '1'; return; }
    el.dataset.sk74 = t; if (ic) el.dataset.i74 = ic; else delete el.dataset.i74;
    size(el); icon(el);
  }
  function size(el) {
    const r = el.getBoundingClientRect(), t = el.dataset.sk74; if (!r.height) return;
    const k = { p: .95, w: .95, j: .95, g: .85, m: .95, ton: .5, toff: .5, con: .95, coff: .95, ban: .25 }[t]; if (!k) return;
    el.style.setProperty('--e74', Math.round(Math.min(r.height * k, r.width * .42)) + 'px');
    el.style.setProperty('--o74', (/^[pwjgm]$/.test(t) ? Math.round(Math.min(r.height * .28, 10)) : 0) + 'px');
  }
  function icon(el) {
    const ic = el.dataset.i74; if (!ic) return;
    const f = el.firstElementChild;
    if (f && f.classList.contains('i74')) { if (f.dataset.k !== ic) { f.dataset.k = ic; f.style.setProperty('--i74', `var(--ic-${ic})`); } return; }
    el.querySelectorAll(':scope > i.i74').forEach(x => x.remove());
    const i = document.createElement('i'); i.className = 'i74'; i.dataset.k = ic; i.style.setProperty('--i74', `var(--ic-${ic})`); el.insertBefore(i, el.firstChild);
  }
  let busy = false, last = 0, timer = 0;
  function pass() {
    timer = 0; if (busy) return; busy = true; last = Date.now();
    try { document.querySelectorAll('button,.x5-btn').forEach(el => { if (el.offsetParent || el.getClientRects().length) apply(el); }); } catch (e) { console.warn('ui74', e); }
    busy = false;
  }
  function sched() { if (timer) return; const w = Math.max(0, 200 - (Date.now() - last)); timer = setTimeout(() => requestAnimationFrame(pass), w); }

  /* ---------- 九九登天塔第100層心魔:專屬立繪(依道體),出手/受擊換姿勢 ---------- */
  const XM = ''' + xmj + r''';
  const xm = p => XM['xm_' + (state.gender === 'f' ? 'f' : 'm') + p];
  const isXM = B => !!(B && B.monster && B.monster.id === 'tw_100');
  XT.fxSetup74 = next => function () {
    next.apply(this, arguments);
    try { if (!isXM(currentBattle)) return; const me = document.querySelector('#battle-stage .bs-memo'); if (me) me.innerHTML = `<img class="bs-mi xm74" src="${xm(0)}" alt="" draggable="false">`; } catch (e) { }
  };
  let poseT = 0;
  function pose(p, ms) {
    const im = document.querySelector('#battle-stage .bs-mi.xm74'); if (!im) return;
    im.src = xm(p); clearTimeout(poseT); poseT = setTimeout(() => { const i2 = document.querySelector('#battle-stage .bs-mi.xm74'); if (i2) i2.src = xm(0); }, ms / (state.battleSpeed || 1));
  }

  const mo = new MutationObserver(recs => {
    for (const r of recs) {
      if (r.type === 'attributes' && r.target.id === 'bs-m' && isXM(currentBattle)) {
        const c = r.target.classList;
        if (c.contains('matk') && !(r.oldValue || '').includes('matk')) pose(1, 600);
        else if (c.contains('hit') && !(r.oldValue || '').includes('hit')) pose(2, 380);
      }
    }
    sched();
  });
  function start() { mo.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'disabled'], attributeOldValue: true }); pass(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  window.addEventListener('resize', () => { document.querySelectorAll('[data-sk74]').forEach(size); });
  window.UI74 = { pass, decide };
})();
'''
open(os.path.join(ROOT, 'js', '23_v74_介面統一・心魔.js'), 'w', encoding='utf-8', newline='').write(js)

# ---------- 殼:加入 style 與 script;fx.setup 鏈加入 XT.fxSetup74 ----------
p = os.path.join(ROOT, 'index.html'); t = open(p, encoding='utf-8', newline='').read()
old = '<script>@@INC:js/22_v12_5_殘留_emoji・深色彈窗淺色.js@@</script>\n'
assert t.count(old) == 1 and 'ui74' not in t
t = t.replace(old, old + '<style id="ui74">@@INC:css/04_ui74.css@@</style>\n<script>@@INC:js/23_v74_介面統一・心魔.js@@</script>\n')
open(p, 'w', encoding='utf-8', newline='').write(t)
p = glob.glob(os.path.join(ROOT, 'js', '02_main', '018_*.js'))[0]; t = open(p, encoding='utf-8', newline='').read()
old = 'XT.fxSetup170, XT.fxSetup45]); };'
assert t.count(old) == 1
t = t.replace(old, 'XT.fxSetup170, XT.fxSetup45, XT.fxSetup74]); };')
t = t.replace('fxSetup45 v45 怪物生成圖(script 11)\n', 'fxSetup45 v45 怪物生成圖(script 11)、fxSetup74 v74 塔頂心魔立繪(script 23)\n', 1)
open(p, 'w', encoding='utf-8', newline='').write(t)
print('p03 ok', len(ICONS), len(SKINS), len(XM))
