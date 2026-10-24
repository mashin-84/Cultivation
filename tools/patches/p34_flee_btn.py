#!/usr/bin/env python3
"""最終版105:戰鬥「靈狐遁術」按鈕超出畫面 → 消耗說明改成按鈕內第二行小字,三顆按鈕等寬"""
import os
SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src')
def sub(path, old, new):
    p = os.path.join(SRC, path); s = open(p, encoding='utf-8', newline='').read()
    assert s.count(old) == 1, (path, old[:50]); open(p, 'w', encoding='utf-8', newline='').write(s.replace(old, new))
sub('index.html', '<i class="ii ui ii-tab_wind"></i> 靈狐遁術 (扣5%靈石)', '<i class="ii ui ii-tab_wind"></i> 靈狐遁術<span class="f105">扣 5% 靈石</span>')
sub('js/18_v12_2_介面重整・階段三_淺色水墨底・洞府一屏・歷練.js', "#battle-modal .grid:has(#btn-battle-attack){grid-template-columns:repeat(3,1fr)!important}",
    "#battle-modal .grid:has(#btn-battle-attack){grid-template-columns:repeat(3,minmax(0,1fr))!important}\n#btn-battle-flee{min-width:0!important;line-height:1.15!important}\n#btn-battle-flee .f105{display:block;font-size:9px;opacity:.7;font-weight:400;margin-top:1px}")
print('p34 ok')
