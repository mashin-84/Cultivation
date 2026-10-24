#!/usr/bin/env python3
"""最終版88:劇情立繪大小改用「臉」來統一(原本用目測的頭頂/下巴,誤差大,顧青衍等人偏大)
臉的範圍(髮際到下巴)以膚色自動偵測,偵測不準的(戴帽、光環、鬍鬚遮下巴、看不到臉)人工校正。
顯示:臉高 = 立繪區高度的 1/5.6,臉頂在立繪區 20% 高處,臉中心在立繪區寬度 42%。
另:顧青衍戰鬥圖(朝右)也翻轉。
"""
import glob, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src')
p = glob.glob(os.path.join(ROOT, 'js', '02_main', '055_*.js'))[0]; t = open(p, encoding='utf-8', newline='').read()
t, n = re.subn(r"const PF = \{.*?\};", lambda m: 'const PF = {"gu_a":[0.1,0.225,0.357],"lr_a":[0.06,0.174,0.41],"tl_a":[0.05,0.15,0.536],"yh_a":[0.086,0.19,0.454],"仙人_a":[0.095,0.175,0.51],"仙衛統領_a":[0.17,0.26,0.533],"師弟_a":[0.096,0.221,0.482],"弟子_a":[0.094,0.176,0.426],"心魔_a":[0.04,0.13,0.48],"散修_a":[0.085,0.175,0.5],"村民_a":[0.075,0.165,0.541],"管事_a":[0.1,0.21,0.469],"老仙_a":[0.04,0.135,0.48],"趙莽_a":[0.091,0.17,0.488],"魔將_a":[0.107,0.188,0.569],"魔道長老_a":[0.095,0.18,0.295],"mo_cold":[0.166,0.284,0.494],"mo_kind":[0.152,0.287,0.473],"mo_sad":[0.169,0.294,0.448],"q_a":[0.11,0.22,0.43],"situ_a":[0.122,0.231,0.448],"su_cry":[0.105,0.298,0.445],"su_happy":[0.094,0.281,0.494],"su_worry":[0.102,0.294,0.488],"tian_a":[0.08,0.25,0.464],"xg_a":[0.125,0.237,0.493],"ye_f_cold":[0.123,0.263,0.398],"ye_f_smile":[0.122,0.263,0.398],"ye_m_cold":[0.123,0.264,0.407],"ye_m_smile":[0.123,0.264,0.409]};', t, count=1, flags=re.S); assert n == 1
old = "const ih = H / 4.0 / (f[1] - f[0]), iw = ih * img.naturalWidth / img.naturalHeight;"; assert t.count(old) == 1
t = t.replace(old, "const ih = H / 5.6 / (f[1] - f[0]), iw = ih * img.naturalWidth / img.naturalHeight;")
old = "img.style.top = (H * .11 - f[0] * ih) + 'px';"; assert t.count(old) == 1
t = t.replace(old, "img.style.top = (H * .2 - f[0] * ih) + 'px';")
open(p, 'w', encoding='utf-8', newline='').write(t)
q = glob.glob(os.path.join(ROOT, 'js', '11_*.js'))[0]; u = open(q, encoding='utf-8', newline='').read()
old = "['j1','j3','j4','jy_demon','sr3','sr4','sr5','yx1','yx2','yx6','yx7']"; assert u.count(old) == 1
u = u.replace(old, "['gu','j1','j3','j4','jy_demon','sr3','sr4','sr5','yx1','yx2','yx6','yx7']"); open(q, 'w', encoding='utf-8', newline='').write(u)
print('p17 ok')
