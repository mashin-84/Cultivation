#!/usr/bin/env python3
"""最終版92:新手指引第 2 步卡住
原因:第 2 步(升級聚靈陣)只在「第 1 步完成之後」升級才算;若先升級了聚靈陣、才去點吐納,
指引會停在第 2 步,要再升一級(且靈石可能不夠)才會前進。
修正:指引顯示時檢查實際狀態——聚靈陣已高於 Lv.1 就直接視為完成第 2 步(已卡住的存檔一打開也會自動前進)。
"""
import glob, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src')
p = glob.glob(os.path.join(ROOT, 'js', '02_main', '040_*.js'))[0]; t = open(p, encoding='utf-8', newline='').read()
old = "    if ((state.tutorialStep || 0) < 4) { const r = _utb.apply(this, arguments);"
assert t.count(old) == 1
t = t.replace(old, "    if (state.tutorialStep === 1 && (state.arrayLevel || 1) > 1) state.tutorialStep = 2;   /* v92:先升過聚靈陣也算完成第 2 步 */\n" + old)
open(p, 'w', encoding='utf-8', newline='').write(t)
print('p21 ok')
