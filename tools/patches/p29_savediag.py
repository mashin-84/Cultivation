#!/usr/bin/env python3
"""最終版100:存檔診斷 + 第二份存檔(IndexedDB)
- 每次存檔時(4 秒內合併一次,切到背景時也會寫)另存一份到 IndexedDB;開啟時若主存檔不見而 IndexedDB 還有,詢問是否還原
- 每次開啟記錄一筆「開啟紀錄」(時間、有無存檔、有無備份、是否 App 模式),最多 20 筆
- 存檔保護區顯示診斷資訊:網址、App 模式、持久儲存、使用空間、各份存檔時間、最近開啟紀錄
"""
import os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src')
p = os.path.join(ROOT, 'index.html'); s = open(p, encoding='utf-8', newline='').read()
old = '<div id="backup-box" class="mt-2 space-y-1"></div>'; assert s.count(old) == 1
s = s.replace(old, old + '<div id="diag100" class="mt-2"></div>')
old = '@@INC:js/27_v98_存檔防護.js@@'; assert s.count(old) == 1
s = s.replace(old, old + '\n@@INC:js/28_v100_存檔診斷.js@@'); open(p, 'w', encoding='utf-8', newline='').write(s)
js = os.path.join(ROOT, 'js', '28_v100_存檔診斷.js'); assert not os.path.exists(js)
open(js, 'w', encoding='utf-8', newline='').write(r"""/* ===== v100 存檔診斷 + IndexedDB 第二份存檔 ===== */
(() => {
  const K = 'XIUXIAN_SAVE_V2', LOG = 'XIUXIAN_OPENLOG';
  const ls = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const info = raw => { try { const o = JSON.parse(raw); return o ? { t: o.lastSave || 0, r: (REALM_DATA[o.realmIdx || 0] || {}).name || '', n: o.name || '' } : null; } catch (e) { return null; } };
  const standalone = () => !!((window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone);
  /* IndexedDB */
  function db() { return new Promise((ok, no) => { try { const r = indexedDB.open('yinian', 1); r.onupgradeneeded = () => r.result.createObjectStore('kv'); r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error); } catch (e) { no(e); } }); }
  async function idbGet(k) { const d = await db(); return new Promise(ok => { const q = d.transaction('kv').objectStore('kv').get(k); q.onsuccess = () => ok(q.result || null); q.onerror = () => ok(null); }); }
  async function idbSet(k, v) { const d = await db(); return new Promise(ok => { const t = d.transaction('kv', 'readwrite'); t.objectStore('kv').put(v, k); t.oncomplete = () => ok(true); t.onerror = () => ok(false); }); }
  /* 開啟紀錄(在任何存檔寫入前記錄) */
  const had = !!ls(K), hadBak = !!(ls('XIUXIAN_SAVE_BAK1') || ls('XIUXIAN_SAVE_BAK2'));
  try { const L = JSON.parse(ls(LOG) || '[]'); L.unshift({ t: Date.now(), s: had ? 1 : 0, b: hadBak ? 1 : 0, a: standalone() ? 1 : 0 }); localStorage.setItem(LOG, JSON.stringify(L.slice(0, 20))); } catch (e) { }
  /* 存檔時順便寫一份到 IndexedDB(20 秒節流;讀檔異常時不寫,避免蓋掉) */
  let idbT = 0;
  const ok100 = () => !window.LOADFAIL98 && !window.ORPHAN98 && !window.IDBORPHAN100;
  const mirror = () => { idbT = 0; try { if (!ok100()) return; const raw = ls(K); if (raw) idbSet('save', raw).then(() => { window.IDB100 = info(raw); }).catch(() => { }); } catch (e) { } };
  const _sg = saveGame;
  saveGame = function () { const r = _sg.apply(this, arguments); if (!idbT) idbT = setTimeout(mirror, 4000); return r; };
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') mirror(); });
  window.addEventListener('pagehide', mirror);
  /* 主存檔不見、localStorage 也沒備份,但 IndexedDB 還有 → 詢問還原 */
  idbGet('save').then(raw => {
    window.IDB100 = raw ? info(raw) : null;
    if (had || hadBak || !raw) return;
    const c = info(raw); if (!c || !c.t) return;
    window.IDBORPHAN100 = true;
    setTimeout(() => {
      if (window.confirm(`在第二份存檔中找到先前的進度:\n${c.n ? c.n + '・' : ''}${c.r}(${new Date(c.t).toLocaleString('zh-TW', { hour12: false })})\n\n要還原這份進度嗎?`)) { try { localStorage.setItem(K, raw); location.reload(); } catch (e) { } }
      else window.IDBORPHAN100 = false;
    }, 1800);
  }).catch(() => { });
  try { navigator.storage && navigator.storage.persist && navigator.storage.persist().then(p => { window._persisted = !!p; }); } catch (e) { }
  /* 診斷資訊 */
  async function render() {
    const el = document.getElementById('diag100'); if (!el || !el.offsetParent) return;
    let est = ''; try { const e = await navigator.storage.estimate(); est = (e.usage / 1048576).toFixed(1) + ' MB / ' + (e.quota / 1048576).toFixed(0) + ' MB'; } catch (e) { }
    let per = ''; try { per = (await navigator.storage.persisted()) ? '已啟用' : '未啟用'; } catch (e) { per = '不支援'; }
    const f = c => c ? `${c.r}・${new Date(c.t).toLocaleString('zh-TW', { hour12: false })}` : '無';
    let L = []; try { L = JSON.parse(ls(LOG) || '[]'); } catch (e) { }
    const h = `<div style="font-size:10px;line-height:1.6;color:#6b5f4f;border-top:1px dashed #c9b994;padding-top:6px">
<b style="color:#8a5a12">存檔診斷(遇到存檔不見時,請截圖這一段)</b><br>
網址:${location.origin + location.pathname}<br>開啟方式:${standalone() ? 'App(主畫面)' : '瀏覽器分頁'}・持久儲存:${per}・使用:${est}<br>
主存檔:${f(info(ls(K)))}<br>第二份存檔:${f(window.IDB100)}<br>
最近開啟:${L.slice(0, 6).map(x => `${new Date(x.t).toLocaleString('zh-TW', { hour12: false, month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })} ${x.s ? '有檔' : '<b style="color:#b91c1c">無檔</b>'}${x.b ? '' : '・無備份'}${x.a ? '' : '・分頁'}`).join('<br>')}</div>`;
    if (el.dataset.h !== h) { el.dataset.h = h; el.innerHTML = h; }
  }
  setInterval(() => { render().catch(() => { }); }, 1500);
})();
""")
print('p29 ok')
