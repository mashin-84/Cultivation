#!/usr/bin/env python3
"""最終版79:
1. 雲紋按鈕(朱/檀/青玉/金/紫)不再黏在一起:雲紋畫在按鈕框內(不往外伸)、大小隨字級固定(不再依出現時量測,避免時大時小)、
   並排左右各留 3px、文字不換行
2. 修行指引列:拿掉「略過」「清單」,只留「前往」;點指引列任何地方(按鈕以外)開啟指引清單
3. 指引清單拿掉「全部略過」「恢復略過項目」;舊存檔已略過的項目自動恢復(存檔格式不變)
"""
import glob, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src')
def F(p):
    g = glob.glob(os.path.join(ROOT, 'js', '02_main', p + '_*.js')) or glob.glob(os.path.join(ROOT, 'js', p + '_*.js')); assert len(g) == 1, p; return g[0]
def rep(path, old, new):
    t = open(path, encoding='utf-8', newline='').read(); assert t.count(old) == 1, (path, t.count(old), old[:70])
    open(path, 'w', encoding='utf-8', newline='').write(t.replace(old, new))

css = os.path.join(ROOT, 'css', '04_ui74.css')
t = open(css, encoding='utf-8', newline='').read(); assert '/* v79 */' not in t
S = ','.join('body:not(#z74) [data-sk74="%s"]' % k for k in 'pwjgm')
W = ','.join('body:not(#z74) .w-full[data-sk74="%s"]' % k for k in 'pwjgm')
t += "/* v79 */\n" + S + "{--o74:0px!important;--e74:2em!important;padding-left:.9em!important;padding-right:.9em!important;white-space:nowrap!important;margin-left:3px!important;margin-right:3px!important}\n" + W + "{width:calc(100% - 6px)!important}\n"
t += "body:not(#z74) #btn-skip-tutorial,body:not(#z74) #tut-list{display:none!important}\nbody:not(#z74) #tutorial-guide-banner{cursor:pointer}\n"
open(css, 'w', encoding='utf-8', newline='').write(t)

# 點整條指引列開清單(原本只有文字、且新手四步之後才行)
rep(F('045'), "document.addEventListener('click', e => { if (e.target.closest && e.target.closest('#tutorial-guide-text') && (state.tutorialStep || 0) >= 4) X.open('guide'); });",
    "document.addEventListener('click', e => { if (e.target.closest && e.target.closest('#tutorial-guide-banner') && !e.target.closest('button')) X.open('guide'); });")
p = F('040')
rep(p, "if (!g.skip) g.skip = {};", "if (!g.skip || Object.keys(g.skip).length) g.skip = {};   /* v79:不再提供略過,舊存檔的略過項目恢復 */")
rep(p, "    h += `<div class=\"x5-row\" style=\"margin-top:8px\"><button class=\"x5-btn gy\" data-x5=\"gd9.skipall\" style=\"flex:1\">全部略過</button><button class=\"x5-btn gy\" data-x5=\"gd9.unskip\" style=\"flex:1\">恢復略過項目</button></div>`;\n", "")
print('p09 ok')
