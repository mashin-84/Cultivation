#!/usr/bin/env python3
"""最終版75:修正一屏頁面隨捲動縮放、歷練塔圖忽大忽小、人物立繪下半透明
1. 人物(16)/丹器(17)/行囊(19)的高度計算:top 改為「扣掉捲動量」的版面位置,捲動時不再重算出不同高度
2. 歷練塔圖:固定 120px(原本出現回合預估時才從 170 縮到 120,預估區塊重畫時會跳動)
3. 人物立繪:漸隱遮罩只留最下緣一點(原本 78% 以下漸透明,手機上蓋到裙襬與腳)
"""
import glob, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src')
def F(p): g = glob.glob(os.path.join(ROOT, 'js', p + '_*.js')); assert len(g) == 1, p; return g[0]
def rep(path, old, new, cnt=1):
    t = open(path, encoding='utf-8', newline='').read(); assert t.count(old) == cnt, (path, t.count(old), old[:60])
    open(path, 'w', encoding='utf-8', newline='').write(t.replace(old, new))

# 版面位置:元素頂端 + 所在捲動區已捲動的量(=不受捲動影響)
ST = "(e => { let s = 0, p = e.parentElement; while (p) { s += p.scrollTop || 0; p = p.parentElement; } return e.getBoundingClientRect().top + s; })"
rep(F('16'), 'const top = ch.getBoundingClientRect().top;', 'const top = %s(ch);' % ST)
rep(F('17'), 'const top = root.getBoundingClientRect().top;', 'const top = %s(root);' % ST)
rep(F('19'), 'const top = el.getBoundingClientRect().top;', 'const top = %s(el);' % ST)
# 立繪遮罩
rep(F('16'), '-webkit-mask-image:linear-gradient(#000 78%,transparent);mask-image:linear-gradient(#000 78%,transparent)',
    '-webkit-mask-image:linear-gradient(#000 95%,transparent);mask-image:linear-gradient(#000 95%,transparent)')
# 塔圖固定高度(寫在 v74 樣式表,權重較高)
css = os.path.join(ROOT, 'css', '04_ui74.css')
t = open(css, encoding='utf-8', newline='').read(); assert 'twbg' not in t
t += 'body:not(#z74) #stage-map>svg:has(#twbg){max-height:120px!important}\n'
open(css, 'w', encoding='utf-8', newline='').write(t)
print('p04 ok')
