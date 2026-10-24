#!/usr/bin/env python3
"""最終版138:圖示補完(IC138)。歷練地圖路線改用生成圖(石盤、營地、旗、主角、首領框);熔爐/靈田/靈寵/劇情回顧/逃離的 emoji 改圖"""
import os
R = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
def rep(p, old, new, n=1):
    p = os.path.join(R, p); s = open(p, encoding='utf-8', newline='').read()
    assert s.count(old) == n, (p, old[:50], s.count(old)); open(p, 'w', encoding='utf-8', newline='').write(s.replace(old, new))
IC = lambda k, c='ui': f'<i class="ii {c} ii-c138_{k}"></i>'
rep('src/index.html', '@@INC:js/36_v137_材料取得途徑.js@@', '@@INC:js/36_v137_材料取得途徑.js@@\n@@INC:js/37_v138_圖示補完.js@@')
# 首領圖對外
rep('src/js/02_main/026_v7_6_地圖_戰鬥背景_角色_妖魔_神通改用生成圖.js', '  // 戰鬥場景', "  window.MONART26 = m => { try { const k = monKey(m); return k && G[k] ? G[k] : ''; } catch (e) { return ''; } };\n  // 戰鬥場景")
# 地圖路線
M = 'src/js/02_main/019_v6-C_命格_戰力預覽_連續升級_紅點_引導_九九登天.js'
rep(M, '''stroke="#0f172a" stroke-opacity=".75" stroke-width="11" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="${stagePath(n, n)}" stroke="#64748b" stroke-width="3" stroke-dasharray="2 6"''',
       '''stroke="#3b2f22" stroke-opacity=".42" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="${stagePath(n, n)}" stroke="#f5ecd6" stroke-opacity=".85" stroke-width="2.5" stroke-dasharray="2 6"''')
old_loop_start = '''  for (let i = 1; i <= n; i++) {
    const p = stagePos(i, n), isB = i === n, special'''
new_loop = '''  const IC = window.IC138, im = (k, x, y, w, ex) => `<image href="${IC[k]}" x="${x - w / 2}" y="${y - w / 2}" width="${w}" height="${w}" preserveAspectRatio="xMidYMid meet"${ex || ''}/>`;
  if (IC) {
    const bsrc = (window.MONART26 && MONART26(boss)) || '';
    for (let i = 1; i <= n; i++) {
      const p = stagePos(i, n), isB = i === n, done = i < cur, now = i === cur;
      s += '<g>';
      if (isB) {
        if (now) s += im('n_cur', p.x, p.y, 46);
        if (bsrc) s += `<clipPath id="bc19"><circle cx="${p.x}" cy="${p.y}" r="14.5"/></clipPath><circle cx="${p.x}" cy="${p.y}" r="15" fill="#f3ead6"/><image href="${bsrc}" x="${p.x - 17}" y="${p.y - 15}" width="34" height="34" clip-path="url(#bc19)" preserveAspectRatio="xMidYMin slice"/>`;
        else s += im('n_boss', p.x, p.y, 30);
        s += im('bossring', p.x, p.y, 40);
      } else if (i === 1) { if (now) s += im('n_cur', p.x, p.y, 34); s += im('camp', p.x, p.y - 2, 34); }
      else {
        s += im(now ? 'n_cur' : done ? 'n_done' : 'n_idle', p.x, p.y, now ? 32 : 27);
        if (i === 5) s += im('flag', p.x + 6, p.y - 12, 26);
        else if (!done) s += `<text x="${p.x}" y="${p.y + 4}" text-anchor="middle" font-size="11" font-weight="800" fill="#3b2f22" stroke="#f5efe0" stroke-width="2.5" paint-order="stroke">${i}</text>`;
      }
      if (now) s += `<g>${im(state.gender === 'f' ? 'me_f' : 'me_m', p.x, p.y - 27, 32)}<animateTransform attributeName="transform" type="translate" values="0 0;0 -4;0 0" dur="1.2s" repeatCount="indefinite"/></g>`;
      s += '</g>';
    }
  } else
  for (let i = 1; i <= n; i++) {
    const p = stagePos(i, n), isB = i === n, special'''
rep(M, old_loop_start, new_loop)
# 零星 emoji
I = lambda k: IC(k)
rep('src/js/02_main/043_乾坤熔爐.js', "f.on ? '✅ 自動煉化:開' : '⬜ 自動煉化:關'", f"f.on ? '{I('chk1')} 自動煉化:開' : '{I('chk0')} 自動煉化:關'")
rep('src/js/02_main/034_v8_5_共用核心_X5_洞府靈田_圖鑑_稱號_遊玩統計.js', "''}>⬆ 田力(", "''}>" + I('up') + " 田力(")
rep(M, "`⬆ 餵養升級(", "`" + I('up') + " 餵養升級(")
rep('src/js/02_main/055_v11_0_主線劇情引擎_對話畫面_三層選擇_回顧_章末.js', '<p style="color:#fcd34d">▶ ${esc(l.t)}</p>', '<p style="color:#fcd34d">' + I('play') + ' ${esc(l.t)}</p>')
for f in ('src/js/35_v113_重要戰鬥.js', 'tools/patches/p48_bf.js'):
    rep(f, '<button id="bf-run" class="auto run">🏃 逃離</button>', '<button id="bf-run" class="auto run">逃離</button>')
    rep(f, "b.textContent = '🏃 逃離';", "b.textContent = '逃離';", 2)
print('p60 ok')
