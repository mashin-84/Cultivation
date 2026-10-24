#!/usr/bin/env python3
"""最終版103:黑市散修(jy_rogue)戰鬥圖翻面,改為面向左"""
import os
p = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src', 'js', '11_v45_生成圖接線_怪物・宗門功法_信物・效果圖示・器紋.js')
s = open(p, encoding='utf-8', newline='').read(); old = "'jy_demon','sr3'"; assert s.count(old) == 1
open(p, 'w', encoding='utf-8', newline='').write(s.replace(old, "'jy_demon','jy_rogue','sr3'")); print('p32 ok')
