#!/usr/bin/env python3
"""凍結前置:載入時建立的容器改為「已存在就沿用,不存在才建立並放置」(沿用時不重填內容、不重新放置)。
人物 pc44/ch51/bk51/ov51、仙途 rec44/rc54/ov54、洞府 hub44/ab53h/ov53、丹器 cr52、行囊 iv54、通用面板 sheet13;
匿名暫存容器補 id:仙途暫存區 rc54h。
"""
import glob, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src', 'js')
def F(p):
    g = glob.glob(os.path.join(ROOT, '02_main', p + '_*.js')) or glob.glob(os.path.join(ROOT, p + '_*.js')); assert len(g) == 1, p; return g[0]
def rep(pre, old, new):
    p = F(pre); t = open(p, encoding='utf-8', newline='').read(); assert t.count(old) == 1, (pre, t.count(old), old[:70])
    open(p, 'w', encoding='utf-8', newline='').write(t.replace(old, new))

# ---- 10:人物頁 pc44、仙途 rec44、洞府 hub44 ----
rep('10', "  const bar = document.createElement('div'); bar.id = 'pc44';\n  bar.innerHTML = `",
          "  let bar = $('pc44'); if (!bar) { bar = document.createElement('div'); bar.id = 'pc44';\n  bar.innerHTML = `")
rep('10', "</div><div id=\"pc44-ov\"><div id=\"pc44-hd\"></div></div>`;\n  tec.parentNode.insertBefore(bar, tec);\n",
          "</div><div id=\"pc44-ov\"><div id=\"pc44-hd\"></div></div>`;\n  tec.parentNode.insertBefore(bar, tec); }\n")
rep('10', "    const box = document.createElement('div'); box.id = 'rec44'; box.innerHTML = '<div class=\"t\">圖鑑・稱號</div>';\n    if (rec) box.appendChild(rec);\n    recT.insertBefore(box, recT.firstChild);\n",
          "    let box = $('rec44'); if (!box) { box = document.createElement('div'); box.id = 'rec44'; box.innerHTML = '<div class=\"t\">圖鑑・稱號</div>';\n    if (rec) box.appendChild(rec);\n    recT.insertBefore(box, recT.firstChild); }\n")
rep('10', "  const hub = document.createElement('div'); hub.id = 'hub44';\n  hub.innerHTML = `",
          "  let hub = $('hub44'); if (!hub) { hub = document.createElement('div'); hub.id = 'hub44';\n  hub.innerHTML = `")
rep('10', "  if (bk) bk.parentNode.insertBefore(hub, bk.nextSibling); else abode.appendChild(hub);\n",
          "  if (bk) bk.parentNode.insertBefore(hub, bk.nextSibling); else abode.appendChild(hub); }\n")
# ---- 16:人物 ch51/bk51/ov51 ----
rep('16', "  const ch = document.createElement('div'); ch.id = 'ch51';\n  const bk = document.createElement('div'); bk.id = 'bk51'; bk.innerHTML = '<button data-a51=\"back\">← 返回人物</button><b></b>';\n  tec.parentNode.insertBefore(ch, tec); tec.parentNode.insertBefore(bk, tec);\n  const ov = document.createElement('div'); ov.id = 'ov51'; ov.className = 'h'; ov.innerHTML = '<div class=\"pn\"></div>'; document.body.appendChild(ov);\n",
          "  let ch = $('ch51'), bk = $('bk51'), ov = $('ov51');\n  if (!ch) { ch = document.createElement('div'); ch.id = 'ch51';\n  bk = document.createElement('div'); bk.id = 'bk51'; bk.innerHTML = '<button data-a51=\"back\">← 返回人物</button><b></b>';\n  tec.parentNode.insertBefore(ch, tec); tec.parentNode.insertBefore(bk, tec); }\n  if (!ov) { ov = document.createElement('div'); ov.id = 'ov51'; ov.className = 'h'; ov.innerHTML = '<div class=\"pn\"></div>'; document.body.appendChild(ov); }\n")
# ---- 17:丹器 cr52 ----
rep('17', "  const root = document.createElement('div'); root.id = 'cr52'; t.insertBefore(root, t.firstChild);\n",
          "  let root = $('cr52'); if (!root) { root = document.createElement('div'); root.id = 'cr52'; t.insertBefore(root, t.firstChild); }\n")
# ---- 18:洞府 ab53h/ov53 ----
rep('18', "  const hold = document.createElement('div'); hold.id = 'ab53h'; if (ab) ab.appendChild(hold);\n",
          "  let hold = $('ab53h'); if (!hold) { hold = document.createElement('div'); hold.id = 'ab53h'; if (ab) ab.appendChild(hold); }\n")
rep('18', "  const ov = document.createElement('div'); ov.id = 'ov53'; ov.className = 'h'; ov.innerHTML = '<div class=\"pn\"><div class=\"hd\"><b></b><button data-a53=\"x\">✕</button></div><div class=\"bd\"></div></div>'; ov.querySelector('.pn').classList.add('ink53'); document.body.appendChild(ov);\n",
          "  let ov = $('ov53'); if (!ov) { ov = document.createElement('div'); ov.id = 'ov53'; ov.className = 'h'; ov.innerHTML = '<div class=\"pn\"><div class=\"hd\"><b></b><button data-a53=\"x\">✕</button></div><div class=\"bd\"></div></div>'; ov.querySelector('.pn').classList.add('ink53'); document.body.appendChild(ov); }\n")
# ---- 19:行囊 iv54、仙途 rc54/rc54h/ov54 ----
rep('19', "  const iv = document.createElement('div'); iv.id = 'iv54';\n  iv.innerHTML = '",
          "  let iv = $('iv54'); if (!iv) { iv = document.createElement('div'); iv.id = 'iv54';\n  iv.innerHTML = '")
rep('19', "<div class=\"chh\"></div><div class=\"pg\"></div><div class=\"dots\"></div>';\n  if (inv) inv.insertBefore(iv, inv.firstChild);\n",
          "<div class=\"chh\"></div><div class=\"pg\"></div><div class=\"dots\"></div>';\n  if (inv) inv.insertBefore(iv, inv.firstChild); }\n")
rep('19', "  const rc = document.createElement('div'); rc.id = 'rc54';\n  const hold = document.createElement('div'); hold.style.display = 'none';\n  if (rec) { rec.insertBefore(rc, rec.firstChild); rec.appendChild(hold); }\n  const ov = document.createElement('div'); ov.id = 'ov54'; ov.className = 'h'; ov.innerHTML = '<div class=\"pn ink53\"><div class=\"hd\"><b></b><button data-a54=\"x\">✕</button></div><div class=\"bd\"></div></div>'; document.body.appendChild(ov);\n",
          "  let rc = $('rc54'), hold = $('rc54h'), ov = $('ov54');\n  if (!rc) { rc = document.createElement('div'); rc.id = 'rc54';\n  hold = document.createElement('div'); hold.id = 'rc54h'; hold.style.display = 'none';\n  if (rec) { rec.insertBefore(rc, rec.firstChild); rec.appendChild(hold); } }\n  if (!ov) { ov = document.createElement('div'); ov.id = 'ov54'; ov.className = 'h'; ov.innerHTML = '<div class=\"pn ink53\"><div class=\"hd\"><b></b><button data-a54=\"x\">✕</button></div><div class=\"bd\"></div></div>'; document.body.appendChild(ov); }\n")
# ---- 032:通用面板 sheet13 ----
rep('032', "  const sheet = document.createElement('div'); sheet.id = 'sheet13'; sheet.innerHTML = '<div class=\"pn\"></div>'; document.body.appendChild(sheet);\n",
           "  let sheet = $('sheet13'); if (!sheet) { sheet = document.createElement('div'); sheet.id = 'sheet13'; sheet.innerHTML = '<div class=\"pn\"></div>'; document.body.appendChild(sheet); }\n")
# ---- 034:遊玩統計舊摺疊區 stat15(已隱藏;沿用時仍掛上展開即重繪) ----
rep('034', "    if (root && !$('stat15')) {\n      const d = document.createElement('details'); d.className = 'bg-slate-900 p-3 rounded-xl border border-slate-800';\n      d.innerHTML = '<summary class=\"font-serif-tc font-bold text-amber-300 text-xs\"><i class=\"ii ui ii-a47_stat\"></i> 遊玩統計與設定</summary><div id=\"stat15\" class=\"mt-2\"></div>';\n      root.insertBefore(d, root.firstChild); d.addEventListener('toggle', () => { if (d.open) renderStat(); });\n    }\n",
           "    let s15 = $('stat15');\n    if (root && !s15) {\n      const d = document.createElement('details'); d.className = 'bg-slate-900 p-3 rounded-xl border border-slate-800';\n      d.innerHTML = '<summary class=\"font-serif-tc font-bold text-amber-300 text-xs\"><i class=\"ii ui ii-a47_stat\"></i> 遊玩統計與設定</summary><div id=\"stat15\" class=\"mt-2\"></div>';\n      root.insertBefore(d, root.firstChild); s15 = $('stat15');\n    }\n    const d15 = s15 && s15.closest('details'); if (d15 && !d15.__t15) { d15.__t15 = 1; d15.addEventListener('toggle', () => { if (d15.open) renderStat(); }); }\n")
print('p06 ok')
