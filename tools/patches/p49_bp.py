#!/usr/bin/env python3
"""最終版115:重要戰鬥主角改用背面戰鬥動作(新手服男女各 9 動作,其他外觀暫用新手服)+ 各動作特效
1 待機 2 普攻(突進+劍弧) 3 攻擊神通(飛劍) 4 輔助神通(護體/回春/戰意光環) 5 格擋 6 受擊 7 本命蓄力(流派色光暈) 8 本命爆發(躍起+爆光) 9 勝利收劍
"""
import os
SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src')
p = os.path.join(SRC, 'index.html'); s = open(p, encoding='utf-8', newline='').read()
old = '@@INC:js/35_v113_重要戰鬥.js@@'; assert s.count(old) == 1
s = s.replace(old, '@@INC:js/34b_v115_主角戰鬥動作.js@@\n' + old); open(p, 'w', encoding='utf-8', newline='').write(s)
keys = [f'{g}_o1_{i}' for g in 'FM' for i in range(1, 10)]
for k in keys: assert os.path.exists(os.path.join(SRC, 'assets', 'BP', k + '.webp')), k
js = os.path.join(SRC, 'js', '34b_v115_主角戰鬥動作.js'); assert not os.path.exists(js)
open(js, 'w', encoding='utf-8', newline='').write('/* v115 主角背面戰鬥動作圖(重要戰鬥用) */\nwindow.BP114 = {' + ', '.join(f'"{k}": "data:image/webp;base64,@@IMG:BP/{k}@@"' for k in keys) + '};\n')
print('p49 ok')
