# v185:Gemini 第三輪(散功清備份並重載、影片防重入、影片時背景音樂靜音、輪迴保留教學/開場紀錄、離線資源文字)
import glob
def rep(f, old, new):
    s = open(f, encoding='utf8').read(); c = s.count(old); assert c == 1, (f, old[:50], c)
    open(f, 'w', encoding='utf8').write(s.replace(old, new)); print(f.split('/')[-1], '比對 1 次')
G = lambda p: glob.glob(p)[0]
rep(G('src/js/02_main/014_*.js'), "    state = JSON.parse(JSON.stringify(defaultState));\n    updateTopBar();\n    renderTechniques();",
"""    state = JSON.parse(JSON.stringify(defaultState));
    /* v185 散功:先存一份空白檔,再清掉所有備份與 IndexedDB 復原點,重新載入乾淨頁面(避免被當成遺失而跳還原) */
    try { saveGame(); } catch (e) { }
    try { ['XIUXIAN_SAVE_BAK1', 'XIUXIAN_SAVE_BAK2', 'XIUXIAN_SAVE_RESCUE'].forEach(k => localStorage.removeItem(k)); } catch (e) { }
    try { indexedDB.deleteDatabase('yinian'); } catch (e) { }
    setTimeout(() => { try { location.reload(); } catch (e) { } }, 500);
    updateTopBar();
    renderTechniques();""")
rep('src/js/44_v174_動畫過場.js', "    if (!ok(n)) return Promise.resolve(false);\n    on = true;", "    if (on || !ok(n)) return Promise.resolve(false);   /* v185 防重入 */\n    on = true;")
rep('src/js/26_v96_背景音樂.js', "    if (!enabled()) { Object.keys(tracks).forEach(stop);", "    if (!enabled() || (window.MOV174 && MOV174.on())) { Object.keys(tracks).forEach(stop);   /* v185 影片播放時背景音樂淡出 */")
rep(G('src/js/02_main/010_*.js'), "  const preserved = {\n    saveVersion: SAVE_VERSION,\n", "  const preserved = {\n    saveVersion: SAVE_VERSION,\n    tut160: state.tut160, op176: state.op176,   /* v185 教學與開場片看過紀錄跨周目保留 */\n")
f41 = 'src/js/41_v160_介面與紅點.js'; s = open(f41, encoding='utf8').read(); assert s.count('張圖') == 1; open(f41, 'w', encoding='utf8').write(s.replace('張圖', '項資源')); print('41 比對 1 次')
