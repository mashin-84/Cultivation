#!/usr/bin/env python3
"""最終版137:材料取得途徑(src/js/36_v137_材料取得途徑.js)。接入 index.html;靈田作物表 CROPS 對外公開為 X5.CROPS"""
import os
R = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
def rep(p, old, new):
    p = os.path.join(R, p); s = open(p, encoding='utf-8', newline='').read()
    assert s.count(old) == 1, (p, s.count(old)); open(p, 'w', encoding='utf-8', newline='').write(s.replace(old, new))
rep('src/index.html', '@@INC:js/35_v113_重要戰鬥.js@@', '@@INC:js/35_v113_重要戰鬥.js@@\n@@INC:js/36_v137_材料取得途徑.js@@')
rep('src/js/02_main/034_v8_5_共用核心_X5_洞府靈田_圖鑑_稱號_遊玩統計.js', '  const CROPS = [];', '  const CROPS = X5.CROPS = [];')
print('p59 ok')
