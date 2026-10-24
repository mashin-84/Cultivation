#!/usr/bin/env python3
"""最終版76:開啟時不再先閃舊介面、切分頁時按鈕不再閃
1. 標題畫面(#title34 的樣式與元素)搬到 <body> 最前面:檔案邊讀邊畫時,第一個畫出來的就是標題畫面
   (點擊進入的程式仍在原處,讀完後才能點)
2. v74 按鈕換膚:原本在 DOM 變動後延遲約 0.2 秒才套底圖 → 改為在變動的同一輪(瀏覽器重繪前)立即套用;
   只在戰鬥舞台內的特效變動時略過,避免戰鬥中頻繁重算
"""
import os, glob
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src')
p = os.path.join(ROOT, 'index.html'); t = open(p, encoding='utf-8', newline='').read()
lines = t.split('\n')
i_css = [i for i, l in enumerate(lines) if l.startswith('<style id="title34-css">')]
i_div = [i for i, l in enumerate(lines) if l.startswith('<div id="title34"')]
i_body = [i for i, l in enumerate(lines) if l.startswith('<body ')]
assert len(i_css) == len(i_div) == len(i_body) == 1 and i_div[0] == i_css[0] + 1
blk = lines[i_css[0]:i_div[0] + 1]
del lines[i_css[0]:i_div[0] + 1]
b = i_body[0]
lines[b + 1:b + 1] = blk
open(p, 'w', encoding='utf-8', newline='').write('\n'.join(lines))

p = glob.glob(os.path.join(ROOT, 'js', '23_*.js'))[0]; t = open(p, encoding='utf-8', newline='').read()
old = """      }
    }
    sched();
  });"""
new = """      }
    }
    /* 戰鬥舞台內的特效變動不需重算;其餘變動在重繪前立即套用,避免舊樣式閃現 */
    if (recs.some(r => { const n = r.target.nodeType === 1 ? r.target : r.target.parentElement; return !(n && n.closest && n.closest('#battle-stage')); })) pass();
  });"""
assert t.count(old) == 1; t = t.replace(old, new)
open(p, 'w', encoding='utf-8', newline='').write(t)
print('p05 ok')
