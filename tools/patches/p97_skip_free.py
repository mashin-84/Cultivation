# 最終版187:引導後恢復劇情正常播放;男女不限、換流派改純靈石(無冷卻)
import glob
def P(pat, pairs):
    f = glob.glob('src/js/' + pat)[0]; t = open(f, encoding='utf8').read()
    for a, b in pairs:
        n = t.count(a); assert n == 1, (f, a[:40], n); t = t.replace(a, b)
    open(f, 'w', encoding='utf8').write(t); print('OK', f, len(pairs))
P('02_main/055_v11_0*.js', [(
"function doGuide(k) {\n    run.fighting = true; run.choosing = false; clearTimeout(timer); clearInterval(typeT); $('st28cs').innerHTML = '';\n    $('st28').classList.remove('on');",
"function doGuide(k) {\n    run.fighting = true; run.choosing = false; run.skip = false; syncBtns(); clearTimeout(timer); clearInterval(typeT); $('st28cs').innerHTML = '';   /* v187:跳過只作用到引導前,回來後恢復正常 */\n    $('st28').classList.remove('on');")])
P('02_main/038_v9_0-A*.js', [
 ("const free = () => { if (window.FREE143) return true; const s = SCH(); return !s.main || s.rc !== rcNow(); };   /* FREE143:測試期間換流派免費、無冷卻 */",
  "const free = () => { const s = SCH(); return !s.main || s.rc !== rcNow(); };   /* v187:首次與新一世免費,其餘只收靈石 */"),
 ("const cdLeft = () => free() ? 0 : Math.max(0, SCH().sw + CDMS - Date.now());",
  "const cdLeft = () => 0;   /* v187:取消換道冷卻,改以靈石限制 */"),
 ("const c = s.sub && !window.FREE143 ? Math.floor(swCost() / 2) : 0;",
  "const c = s.sub ? Math.floor(swCost() / 2) : 0;"),
 ("'換道需靈石;輔修於金丹期開放。'",
  "`換本命流派需靈石 ${fmt(swCost())}${s.sub ? `;換輔修需 ${fmt(Math.floor(swCost() / 2))}` : ';輔修於金丹期開放'}。`"),
])
P('02_main/033_v8_2*.js', [(
 "const lockG14 = () => !window.FREE143 && !!(state.story27 && state.story27.seen && state.story27.seen['1.1']);",
 "const lockG14 = () => false;   /* v187:男女隨時可換 */")])
P('02_main/000_*.js', [(
 "window.FREE143 = true;   /* 測試期間:換流派、換道體不受限制;恢復限制改成 false */",
 "window.FREE143 = false;   /* v187 起已無作用:男女隨時可換,換流派只收靈石(038) */")])
