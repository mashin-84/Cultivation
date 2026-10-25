#!/usr/bin/env python3
"""v160 道號道體視窗:讀檔完成(__LOADED112)後才檢查,避免載入慢時對已有存檔誤跳。"""
import os
R = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
f = os.path.join(R, 'src/js/02_main/033_v8_2_性別_形象換裝_洞府立繪微動_女修戰鬥立繪.js')
t = open(f, encoding='utf-8').read()
OLD = "    if (!state.gender) { if (!$('modal-gender14')) showGender(); }"
NEW = "    if (!window.__LOADED112) return;   /* v160:讀檔完成前不判斷(載入慢時 state 還是預設值) */\n    if (!state.gender) { if (!$('modal-gender14')) showGender(); }\n    else { if ($('modal-gender14') && state.name) $('modal-gender14').remove(); if (appliedG !== state.gender) applySprites(); }"
OLD2 = "    else if (appliedG !== state.gender) applySprites();\n"
assert t.count(OLD) == 1; open(f, 'w', encoding='utf-8').write(t.replace(OLD + '\n' + OLD2, NEW + '\n')); print('OK')
