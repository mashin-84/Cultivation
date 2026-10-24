#!/usr/bin/env python3
"""最終版108(續):神通全部冷卻時按鈕撐出畫面
- 神通列三欄固定等寬(minmax(0,1fr)),按鈕不再被文字撐寬
- 冷卻回合改成神通圖示右上角的小圓標,名稱完整顯示
"""
import os, glob
SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src')
def sub(path, old, new, n=1):
    p = glob.glob(os.path.join(SRC, path))[0]; s = open(p, encoding='utf-8', newline='').read()
    assert s.count(old) == n, (path, old[:60], s.count(old)); open(p, 'w', encoding='utf-8', newline='').write(s.replace(old, new))
sub('js/02_main/018_*.js', "<span>${sk.name}${cd > 0 ? `(${cd})` : ''}</span></button>`;",
    "<span class=\"nm108\">${sk.name}</span></button>`;")
sub('js/02_main/018_*.js', '<span class="w-6 h-6 inline-block">${skArt(id, !on && cd > 0)}</span>', '<span class="w-6 h-6 inline-block ic108">${skArt(id, !on && cd > 0)}${cd > 0 ? `<span class="cd108">${cd}</span>` : \'\'}</span>')
sub('js/18_v12_2_*.js', "#battle-skill-bar{grid-template-columns:repeat(3,1fr)!important}",
    "#battle-skill-bar{grid-template-columns:repeat(3,minmax(0,1fr))!important}\n#battle-skill-bar>button{min-width:0!important;max-width:100%!important;overflow:hidden}\n#battle-skill-bar .nm108{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n#battle-skill-bar .ic108{position:relative;flex:none}\n#battle-skill-bar .cd108{position:absolute;right:-6px;top:-6px;min-width:16px;height:16px;padding:0 3px;border-radius:8px;background:#5b4a36;color:#fff;font-size:10px;font-weight:800;line-height:16px;text-align:center;box-shadow:0 0 0 1.5px #fff}")
print('p39 ok')
