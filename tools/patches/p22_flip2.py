#!/usr/bin/env python3
"""最終版93:敵人朝向第二輪逐張複查(原則:敵人在右邊,一律面向左邊的主角)
A45(劇情戰/遊學守山長老/天劫/秘境):新增 sr7 yx0 yx3 yx4(原有 gu j1 j3 j4 jy_demon sr3 sr4 sr5 yx1 yx2 yx6 yx7)
GEN3(歷練妖獸):新增 K7;M13 原本就朝左,取消翻轉
P_mon(劇情敵人):顧青衍 原本就朝左,取消翻轉
"""
import glob, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src')
def F(p):
    g = glob.glob(os.path.join(ROOT, 'js', '02_main', p + '_*.js')) or glob.glob(os.path.join(ROOT, 'js', p + '_*.js')); assert len(g) == 1, p; return g[0]
def rep(pre, old, new):
    p = F(pre); t = open(p, encoding='utf-8', newline='').read(); assert t.count(old) == 1, (pre, old[:50])
    open(p, 'w', encoding='utf-8', newline='').write(t.replace(old, new))
rep('11', "['gu','j1','j3','j4','jy_demon','sr3','sr4','sr5','yx1','yx2','yx6','yx7']", "['gu','j1','j3','j4','jy_demon','sr3','sr4','sr5','sr7','yx0','yx1','yx2','yx3','yx4','yx6','yx7']")
rep('026', "['K1', 'M06', 'M07', 'M10', 'M13', 'W8']", "['K1', 'K7', 'M06', 'M07', 'M10', 'W8']")
rep('076', "['仙衛統領', '司徒衡', '執法長老・司徒衡', '顧青衍']", "['仙衛統領', '司徒衡', '執法長老・司徒衡']")
print('p22 ok')
