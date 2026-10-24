#!/usr/bin/env python3
"""最終版98:存檔防護
1. 讀檔失敗時不再默默開新局後蓋掉原存檔:原始資料另存「救援存檔」(XIUXIAN_SAVE_RESCUE),自動備份 A/B 暫停輪替,並提示玩家
2. 開啟時主存檔不見、但自動備份還在 → 跳出「發現備份,要還原嗎?」
3. 存檔保護區新增「還原救援存檔」
"""
import glob, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src')
def F(p): g = glob.glob(os.path.join(ROOT, 'js', '02_main', p + '_*.js')); assert len(g) == 1, p; return g[0]
def rep(pre, old, new):
    p = F(pre); t = open(p, encoding='utf-8', newline='').read(); assert t.count(old) == 1, (pre, old[:60])
    open(p, 'w', encoding='utf-8', newline='').write(t.replace(old, new))
rep('003', """  } catch (e) {
    console.warn('Storage load failed, using default:', e);
    state = JSON.parse(JSON.stringify(defaultState));
  }
}""", """  } catch (e) {
    console.warn('Storage load failed, using default:', e);
    try { const raw = localStorage.getItem('XIUXIAN_SAVE_V2'); if (raw && !localStorage.getItem('XIUXIAN_SAVE_RESCUE')) localStorage.setItem('XIUXIAN_SAVE_RESCUE', raw); } catch (x) { }
    window.LOADFAIL98 = true;   /* v98:保留原始資料,暫停備份輪替 */
    state = JSON.parse(JSON.stringify(defaultState));
  }
  /* v98:主存檔不見但備份還在 → 開啟後詢問還原 */
  try { if (!localStorage.getItem('XIUXIAN_SAVE_V2') && (localStorage.getItem('XIUXIAN_SAVE_BAK1') || localStorage.getItem('XIUXIAN_SAVE_BAK2'))) window.ORPHAN98 = true; } catch (x) { }
}""")
rep('019', "    const now = Date.now(), last = +localStorage.getItem('XIUXIAN_BAK_TS') || 0;",
    "    if (window.LOADFAIL98 || window.ORPHAN98) return;   /* v98:讀檔異常時不覆蓋舊備份 */\n    const now = Date.now(), last = +localStorage.getItem('XIUXIAN_BAK_TS') || 0;")
rep('019', "  const key = k === '2' ? 'XIUXIAN_SAVE_BAK2' : 'XIUXIAN_SAVE_BAK1', raw = localStorage.getItem(key);",
    "  const key = k === 'r' ? 'XIUXIAN_SAVE_RESCUE' : k === '2' ? 'XIUXIAN_SAVE_BAK2' : 'XIUXIAN_SAVE_BAK1', raw = localStorage.getItem(key);")
rep('019', "    <div class=\"text-[10px] text-slate-500\">備份A:${fmt(b1)}<br>備份B:${fmt(b2)}</div>`;",
    "    <div class=\"text-[10px] text-slate-500\">備份A:${fmt(b1)}<br>備份B:${fmt(b2)}</div>${localStorage.getItem('XIUXIAN_SAVE_RESCUE') ? `<div class=\"mt-1\">${eBtn('backup-restore', 'r', '還原救援存檔(讀檔失敗時保留的原始資料)', true, 'bg-slate-700 text-amber-200')}</div>` : ''}`;")
js = os.path.join(ROOT, 'js', '27_v98_存檔防護.js'); assert not os.path.exists(js)
open(js, 'w', encoding='utf-8', newline='').write(r"""/* ===== v98 存檔防護提示 ===== */
(() => {
  function ask() {
    if (window.LOADFAIL98) { showToast('⚠️ 存檔讀取失敗,原始資料已保留。請到【仙途】→存檔管理→存檔保護「還原救援存檔」。'); return; }
    if (!window.ORPHAN98) return;
    const b = (k => { try { const o = JSON.parse(localStorage.getItem(k)); return o && { k, t: o.lastSave || 0, r: (REALM_DATA[o.realmIdx || 0] || {}).name || '', n: o.name || '' }; } catch (e) { return null; } });
    const c = [b('XIUXIAN_SAVE_BAK1'), b('XIUXIAN_SAVE_BAK2')].filter(Boolean).sort((x, y) => y.t - x.t)[0]; if (!c) return;
    const d = new Date(c.t).toLocaleString('zh-TW', { hour12: false });
    if (window.confirm(`發現先前的自動備份:\n${c.n ? c.n + '・' : ''}${c.r}(${d})\n\n要還原這份進度嗎?`)) { try { localStorage.setItem('XIUXIAN_SAVE_V2', localStorage.getItem(c.k)); location.reload(); } catch (e) { } }
    else window.ORPHAN98 = false;
  }
  setTimeout(ask, 1500);
})();
""")
p = os.path.join(ROOT, 'index.html'); s = open(p, encoding='utf-8', newline='').read()
old = '@@INC:js/26_v96_背景音樂.js@@'; assert s.count(old) == 1
s = s.replace(old, old + '\n@@INC:js/27_v98_存檔防護.js@@'); open(p, 'w', encoding='utf-8', newline='').write(s)
print('p27 ok')
