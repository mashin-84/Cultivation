#!/usr/bin/env python3
"""最終版108(續):全敵人方向再檢一次,補翻 M08(赤羽靈鷹類)、W5(巨型飛蟲)"""
import os, glob
p = glob.glob(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src', 'js', '02_main', '026_*.js'))[0]
s = open(p, encoding='utf-8', newline='').read(); old = "['K1', 'K7', 'M06', 'M07', 'M10', 'W8']"; assert s.count(old) == 1
open(p, 'w', encoding='utf-8', newline='').write(s.replace(old, "['K1', 'K7', 'M06', 'M07', 'M08', 'M10', 'W5', 'W8']")); print('p38 ok')
