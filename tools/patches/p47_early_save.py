#!/usr/bin/env python3
"""最終版112:找到存檔消失的真正原因並修正
原因:遊戲在網頁「全部載入完成」(load 事件)才讀檔;網站版圖片改成獨立檔後,載入要等圖片,
這段空檔裡稱號檢查等定時器已經在跑,用「預設的空白進度」判定拿到稱號 → 呼叫 saveGame →
把真正的存檔蓋掉。手機上(尤其剛開 App、網路慢)最容易發生。
修正:讀檔完成前,saveGame 一律不寫入。
"""
import os, glob
SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src')
def sub(path, old, new):
    p = glob.glob(os.path.join(SRC, path))[0]; s = open(p, encoding='utf-8', newline='').read()
    assert s.count(old) == 1, (path, old[:60]); open(p, 'w', encoding='utf-8', newline='').write(s.replace(old, new))
sub('js/02_main/003_*.js', "function saveGame() {\n  state.lastSave = Date.now();",
    "function saveGame() {\n  if (!window.__LOADED112) return;   // v112 讀檔完成前不准寫入(避免空白進度蓋掉存檔)\n  state.lastSave = Date.now();")
sub('js/02_main/014_*.js', "window.addEventListener('load', () => {\n  loadGame();",
    "window.addEventListener('load', () => {\n  window.__LOADED112 = true;   // v112 從這裡起才允許存檔(loadGame 為同步,不會被其他計時器插隊)\n  loadGame();")
print('p47 ok')
