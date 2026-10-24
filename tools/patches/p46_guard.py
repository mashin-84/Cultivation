#!/usr/bin/env python3
"""最終版112:進度保險(玩家不必自己備份)
- IndexedDB 自動復原點:每 10 分鐘/境界變動/關閉時存一份,保留最近 8 份 + 最高境界那份;轉世前另存「輪迴前」
- 開啟時若進度比之前低(且之後沒有玩家親手按輪迴/重開/匯入/還原)→ 詢問是否還原
- 存檔保護區列出復原點,可一鍵還原;另記錄轉世/還原事件(含觸發來源)供診斷
"""
import os
SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src')
p = os.path.join(SRC, 'index.html'); s = open(p, encoding='utf-8', newline='').read()
old = '@@INC:js/33_v111_返回鍵.js@@'; assert s.count(old) == 1
open(p, 'w', encoding='utf-8', newline='').write(s.replace(old, old + '\n@@INC:js/34_v112_進度保險.js@@'))
js = os.path.join(SRC, 'js', '34_v112_進度保險.js'); assert not os.path.exists(js)
open(js, 'w', encoding='utf-8', newline='').write(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'p46_guard.js'), encoding='utf-8').read())
print('p46 ok')
