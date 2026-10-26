# v176:開場動畫(opening.mp4)+ 播放器字幕;選完男女姓名 → 開場動畫 → 1.1
import glob
def rep(f, old, new, n=1):
    s = open(f, encoding='utf8').read(); c = s.count(old); assert c == n, (f, old[:50], c)
    open(f, 'w', encoding='utf8').write(s.replace(old, new)); print(f.split('/')[-1], '比對', c, '次')
f44 = 'src/js/44_v174_動畫過場.js'
# 字幕表:時間用「影片長度的比例」,換片不用重算
rep(f44, "  const ok = n => !!MAP[n] && /^https?:$/.test(location.protocol);\n",
"""  const ok = n => !!MAP[n] && /^https?:$/.test(location.protocol);
  /* v176 字幕:[開始比例, 結束比例, 文字] */
  const SUBS = {
    opening: [[.03, .23, '天地有靈,萬物皆可修。'], [.28, .48, '凡人求長生,修士爭機緣。'], [.53, .73, '傳說九天之上有一道天門——<br>過門者,即為仙。'], [.78, .97, '而這個故事,<br>始於一個無名的小村。']]
  };
  let on = false;
""")
rep(f44, "  function play(n) {\n    if (!ok(n)) return Promise.resolve(false);\n    return new Promise(res => {",
         "  function play(n) {\n    if (!ok(n)) return Promise.resolve(false);\n    on = true;\n    return new Promise(res0 => {\n      const res = r => { on = false; res0(r); };")
rep(f44, "+ '<div style=\"position:absolute;right:14px;",
         "+ '<div class=\"sub\" style=\"position:absolute;left:8%;right:8%;bottom:22%;text-align:center;color:#fff8e6;font-size:20px;line-height:1.7;letter-spacing:3px;font-family:serif;text-shadow:0 0 8px #000,0 2px 4px #000;opacity:0;transition:opacity .6s;pointer-events:none\"></div>'\n        + '<div style=\"position:absolute;right:14px;")
rep(f44, "      v.onended = fin;",
"""      const sb = o.querySelector('.sub'), SL = SUBS[n] || []; let si = -1;
      v.ontimeupdate = () => { if (!SL.length || !v.duration) return; const f = v.currentTime / v.duration, i = SL.findIndex(x => f >= x[0] && f < x[1]); if (i === si) return; si = i; if (i < 0) sb.style.opacity = '0'; else { sb.innerHTML = SL[i][2]; sb.style.opacity = '1'; } };
      v.onended = fin;""")
rep(f44, "  return { play, has: ok };", "  return { play, has: ok, on: () => on };")
f = glob.glob('src/js/02_main/055_*.js')[0]
# 動畫播放中不自動播劇情
rep(f, "(window.THU160 && THU160.on)) return true;", "(window.THU160 && THU160.on) || (window.MOV174 && MOV174.on())) return true;")
# 新開局:第一章第一段之前先播開場動畫(只播一次)
rep(f, "!(backlog >= 2 && Date.now() - lastEndT < BACKLOG_GAP)) { play(m.id); return; }",
       "!(backlog >= 2 && Date.now() - lastEndT < BACKLOG_GAP)) {\n      if (m.id === '1.1' && !state.op176 && window.MOV174 && MOV174.has('opening')) { state.op176 = 1; MOV174.play('opening').then(() => play('1.1')); return; }   /* v176 開場動畫 */\n      play(m.id); return; }")
# 劇情總覽:重看開場動畫
rep(f, "    if (window.SJ172) h += SJ172.card();   /* v172 生死交鋒預告 */\n",
       "    if (window.SJ172) h += SJ172.card();   /* v172 生死交鋒預告 */\n    if (window.MOV174 && MOV174.has('opening')) h += `<div class=\"x5-row\" style=\"margin-bottom:8px\"><button class=\"x5-btn gy\" data-x5=\"st28.op\">🎬 重看開場動畫</button></div>`;   /* v176 */\n")
rep(f, "  X.act('st28.play', t => {", "  X.act('st28.op', () => { if (run) return; X.close('st28'); MOV174.play('opening'); });   /* v176 */\n  X.act('st28.play', t => {")
