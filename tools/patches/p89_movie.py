# v174:動畫過場播放器(MOV174)+ 雷劫接上影片 tribulation.mp4
def rep(f, old, new, n=1):
    s = open(f, encoding='utf8').read(); c = s.count(old); assert c == n, (f, old[:50], c)
    open(f, 'w', encoding='utf8').write(s.replace(old, new)); print(f.split('/')[-1], '比對', c, '次')
f44 = 'src/js/44_v174_動畫過場.js'
rep(f44, "v.volume = Math.max(0, Math.min(1, (window.audio && audio.volume) || .8)); v.muted = !!(window.audio && audio.enabled === false);",
         "const A = typeof audio !== 'undefined' ? audio : null; v.volume = Math.max(0, Math.min(1, (A && A.volume) || .8)); v.muted = !!(A && A.enabled === false);")
rep('src/index.html', "@@INC:js/43_v172_生死交鋒.js@@\n", "@@INC:js/43_v172_生死交鋒.js@@\n@@INC:js/44_v174_動畫過場.js@@\n")
rep('build.py', "def build(site=False):", """def movmap():   # 網站版動畫清單 {名稱: 雜湊}
    d = os.path.join(SRC, 'pwa', 'movie')
    if not os.path.isdir(d): return {}
    return {f[:-4]: hashlib.md5(open(os.path.join(d, f), 'rb').read()).hexdigest()[:8] for f in sorted(os.listdir(d)) if f.endswith('.mp4')}

def build(site=False):""")
rep('build.py', "    html = html.replace('@@SFXMAP@@', json.dumps(sfxmap() if site else {}))",
    "    html = html.replace('@@SFXMAP@@', json.dumps(sfxmap() if site else {}))\n    html = html.replace('@@MOVMAP@@', json.dumps(movmap() if site else {}))")
rep('build.py', "    urls += ['sfx/%s.mp3?v=%s' % kv for kv in sfxmap().items()]",
    "    urls += ['sfx/%s.mp3?v=%s' % kv for kv in sfxmap().items()]\n    urls += ['movie/%s.mp4?v=%s' % kv for kv in movmap().items()]")
f40 = 'src/js/40_v160_雷劫過場.js'
rep(f40, "    busy = true; window.THU160.on = true;\n",
    "    busy = true; window.THU160.on = true;\n    let mv = false; try { mv = window.MOV174 ? await MOV174.play('tribulation') : false; } catch (e) { }   /* v174 有雷劫動畫就先播,三重雷的程式演出略過 */\n")
rep(f40, "    await sleep(1900); tt.classList.remove('on'); await sleep(350);\n    for (let i = 0; i < 3; i++) {",
    "    if (!mv) { await sleep(1900); tt.classList.remove('on'); await sleep(350); } else { tt.classList.remove('on'); bar.style.width = '16%'; }\n    for (let i = 0; i < (mv ? 0 : 3); i++) {")
