#!/usr/bin/env python3
"""最終版110:切到背景(縮小、切 App、鎖螢幕)時音樂/音效立即停止
原本切背景是用淡出,但手機在背景會凍結計時器,淡出跑不完,音樂就一直播。
改為:離開畫面立刻暫停所有背景音樂並暫停 Web Audio(音效、雷雨背景音);回到畫面再恢復。
"""
import os
p = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src', 'js', '26_v96_背景音樂.js')
s = open(p, encoding='utf-8', newline='').read()
old = "  document.addEventListener('visibilitychange', () => { try { sync(); } catch (e) { } });"
new = """  /* v110 離開畫面:立即停止(不靠淡出,背景計時器會被凍結) */
  function hush() {
    Object.keys(tracks).forEach(n => { const T = tracks[n]; [T.a, T.b].forEach(a => { if (a) { clearInterval(a._r); a.volume = 0; a.pause(); } }); });
    cur = null; pend = null;
    try { if (audio && audio.ctx && audio.ctx.state === 'running') audio.ctx.suspend(); } catch (e) { }
  }
  function wake() { try { if (audio && audio.ctx && audio.ctx.state === 'suspended') audio.ctx.resume(); } catch (e) { } try { sync(true); } catch (e) { } }
  document.addEventListener('visibilitychange', () => { if (document.hidden) hush(); else wake(); });
  window.addEventListener('pagehide', hush);
  document.addEventListener('freeze', hush);
  window.addEventListener('pageshow', () => { if (!document.hidden) wake(); });"""
assert s.count(old) == 1; open(p, 'w', encoding='utf-8', newline='').write(s.replace(old, new)); print('p44 ok')
