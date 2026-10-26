# v184:影片改「跳過」鍵＋暫停確認;雷劫有影片且成功 → 直接回遊戲(不出成功卡)
def rep(f, old, new):
    s = open(f, encoding='utf8').read(); c = s.count(old); assert c == 1, (old[:50], c)
    open(f, 'w', encoding='utf8').write(s.replace(old, new)); print(f.split('/')[-1], '比對 1 次')
f44 = 'src/js/44_v174_動畫過場.js'
rep(f44, """+ '<div style="position:absolute;right:14px;bottom:calc(14px + env(safe-area-inset-bottom));color:rgba(255,255,255,.75);font-size:13px;letter-spacing:2px;text-shadow:0 1px 3px #000;pointer-events:none">點擊跳過</div>';""",
"""+ '<button class="skp" style="position:absolute;right:14px;top:calc(14px + env(safe-area-inset-top));padding:6px 16px;border-radius:18px;border:1px solid rgba(255,255,255,.5);background:rgba(0,0,0,.35);color:#fff;font-size:14px;letter-spacing:2px">跳過 ▸▸</button>'
        + '<div class="cf" style="position:absolute;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.55)"><div style="background:#fbf7ee;color:#3b2f22;border-radius:14px;padding:20px 22px;text-align:center;min-width:220px;box-shadow:0 6px 24px rgba(0,0,0,.4)"><div style="font-size:17px;margin-bottom:16px">要跳過這段動畫嗎?</div><div style="display:flex;gap:12px;justify-content:center"><button class="no" style="padding:8px 18px;border-radius:10px;border:1px solid #b9a888;background:#fff;color:#3b2f22;font-size:15px">繼續觀看</button><button class="yes" style="padding:8px 18px;border-radius:10px;border:none;background:#b8452f;color:#fff;font-size:15px">跳過</button></div></div></div>';""")
rep(f44, "v.onended = fin; v.onerror = fin; o.onclick = () => { played = true; fin(); };",
"""v.onended = fin; v.onerror = fin;
      const cf = o.querySelector('.cf');   /* v184 跳過要確認:按跳過 → 暫停並詢問 */
      o.querySelector('.skp').onclick = e => { e.stopPropagation(); try { v.pause(); } catch (x) { } cf.style.display = 'flex'; };
      cf.querySelector('.no').onclick = e => { e.stopPropagation(); cf.style.display = 'none'; v.play().catch(() => { }); };
      cf.querySelector('.yes').onclick = e => { e.stopPropagation(); played = true; fin(); };""")
f40 = 'src/js/40_v160_雷劫過場.js'
rep(f40, "    end.classList.add('on');\n    await new Promise(res => { end.querySelector('button').onclick = res; });",
"""    if (mv && ok) {   /* v184 有雷劫動畫且成功:不出成功卡,直接回遊戲 */
      o.remove(); busy = false; window.THU160.on = false;
      try { showToast(`渡劫功成!踏入【${REALM_DATA[state.realmIdx].name}】`); updateTopBar(); } catch (e) { }
      return;
    }
    end.classList.add('on');
    await new Promise(res => { end.querySelector('button').onclick = res; });""")
