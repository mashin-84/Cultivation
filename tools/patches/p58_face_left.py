#!/usr/bin/env python3
"""最終版136:敵人一律面向左。
- 圖檔左右翻轉:A45/yx3(守山長老・第 4 區)、GEN3/W1(九尾天狐)、GEN3/W8(滅世火鳳)(此腳本只改程式,圖已另外翻好)
- 一般戰鬥的翻轉清單拿掉 K1、K7、W5、W8、M08:v125b 換成面向左的新圖後,這幾張再翻就變成面向右"""
import os
R = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
p = os.path.join(R, 'src/js/02_main/026_v7_6_地圖_戰鬥背景_角色_妖魔_神通改用生成圖.js')
s = open(p, encoding='utf-8', newline='').read()
old = "['K1', 'K7', 'M06', 'M07', 'M08', 'M10', 'W5', 'W8'].includes(mk)"
assert s.count(old) == 1
open(p, 'w', encoding='utf-8', newline='').write(s.replace(old, "['M06', 'M07', 'M10'].includes(mk)"))
print('p58 ok')
