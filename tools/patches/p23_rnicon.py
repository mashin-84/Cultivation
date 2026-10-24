#!/usr/bin/env python3
"""最終版94:器紋石在行囊格子裡特別小(它的圖示帶了「1 個字大小」的內嵌尺寸)→ 在格子裡與其他物品同大"""
import os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src')
css = os.path.join(ROOT, 'css', '04_ui74.css'); t = open(css, encoding='utf-8', newline='').read(); assert '/* v94 */' not in t
t += "/* v94 */\n.inv13-cell .a45i{width:46px!important;height:46px!important;vertical-align:middle!important;display:inline-block}\n"
open(css, 'w', encoding='utf-8', newline='').write(t); print('p23 ok')
