#!/usr/bin/env python3
"""最終版141:重要戰鬥站位:敵人往右(left 38%→47%)、主角往左(27%→19%);出招位移都是依兩者實際位置即時換算,不必另調"""
import os
R = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
for f in ('src/js/35_v113_重要戰鬥.js', 'tools/patches/p48_bf.js'):
    p = os.path.join(R, f); s = open(p, encoding='utf-8', newline='').read()
    for o, n in (('#bf-ei{left:38%;width:56%;', '#bf-ei{left:47%;width:53%;'), ('#bf-pi{left:27%;', '#bf-pi{left:19%;')):
        assert s.count(o) == 1, (f, o); s = s.replace(o, n)
    open(p, 'w', encoding='utf-8', newline='').write(s)
print('p63 ok')
