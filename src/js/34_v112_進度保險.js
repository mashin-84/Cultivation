/* ===== v112 進度保險:自動復原點 + 進度倒退偵測(玩家不必自己備份) ===== */
(() => {
  const K = 'XIUXIAN_SAVE_V2', INT = 'XIUXIAN_INTENT', EV = 'XIUXIAN_EVLOG', MAX = 8, GAP = 10 * 60e3;
  const ls = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const lv = o => o ? (o.realm || 0) * 100 + (o.sub || 1) : -1;   /* o = meta() 物件 */
  const meta = raw => { try { const o = JSON.parse(raw); return o ? { realm: o.realmIdx || 0, sub: o.subRealm || 1, name: o.name || '', t: o.lastSave || Date.now(), cyc: (o.story27 && o.story27.cycle) || 1 } : null; } catch (e) { return null; } };
  const rname = m => { const R = REALM_DATA[m.realm] || {}; return R.name + (R.subMax > 1 ? `第${m.sub}層` : ''); };
  const fmtT = t => new Date(t).toLocaleString('zh-TW', { hour12: false, month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  /* 事件紀錄(診斷用) */
  function ev(type, extra) { try { const L = JSON.parse(ls(EV) || '[]'); L.unshift(Object.assign({ t: Date.now(), type, r: state.realmIdx, s: state.subRealm }, extra || {})); localStorage.setItem(EV, JSON.stringify(L.slice(0, 30))); } catch (e) { } }
  /* IndexedDB */
  function db() { return new Promise((ok, no) => { try { const r = indexedDB.open('yinian', 1); r.onupgradeneeded = () => r.result.createObjectStore('kv'); r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error); } catch (e) { no(e); } }); }
  async function get(k) { const d = await db(); return new Promise(ok => { const q = d.transaction('kv').objectStore('kv').get(k); q.onsuccess = () => ok(q.result || null); q.onerror = () => ok(null); }); }
  async function put(k, v) { const d = await db(); return new Promise(ok => { const t = d.transaction('kv', 'readwrite'); t.objectStore('kv').put(v, k); t.oncomplete = () => ok(true); t.onerror = () => ok(false); }); }
  let snaps = [], ready = false, asking = false, restoring = false, trustedAt = 0;
  /* 復原點:每 10 分鐘(或境界變動時)存一份;保留最近 8 份,另外永遠保留「最高境界」那份 */
  async function snap(tag) {
    if (!ready || asking || window.LOADFAIL98 || window.ORPHAN98 || window.IDBORPHAN100) return;
    const raw = ls(K), m = meta(raw); if (!m) return;
    const last = snaps[0];
    if (!tag && last && Date.now() - last.at < GAP && last.realm === m.realm && last.sub === m.sub) return;
    snaps.unshift(Object.assign(m, { at: Date.now(), tag: tag || '', raw }));
    const best = snaps.reduce((a, s) => lv(s) > lv(a) ? s : a, snaps[0]);
    snaps = snaps.slice(0, MAX); if (!snaps.includes(best)) snaps.push(best);
    await put('snaps', snaps);
  }
  /* 玩家親手按下的「會讓進度歸零」動作 → 記為有意(不提示) */
  const intent = why => { try { localStorage.setItem(INT, String(Date.now())); } catch (e) { } ev('intent', { why }); };
  document.addEventListener('click', e => {
    if (!e.isTrusted) return;
    const b = e.target.closest && e.target.closest('#btn-confirm-reincarnate,#btn-confirm-reset'); if (!b) return;
    trustedAt = Date.now(); intent(b.id === 'btn-confirm-reset' ? 'reset' : 'reincarnate');
  }, true);
  /* 存檔被 saveGame 以外的方式寫入(匯入存檔、還原備份)= 玩家有意 */
  let inSave = false;
  { const o = saveGame; saveGame = function () { inSave = true; try { return o.apply(this, arguments); } finally { inSave = false; } }; }
  { const o = Storage.prototype.setItem; Storage.prototype.setItem = function (k, v) { if (k === K && this === window.localStorage && !inSave && !restoring) { try { localStorage.setItem(INT, String(Date.now())); } catch (e) { } } return o.apply(this, arguments); }; }
  /* 轉世:先存一份「轉世前」復原點,並記錄是誰觸發的 */
  { const o = executeReincarnation; executeReincarnation = function () {
    try { snap('輪迴前'); } catch (e) { }
    ev('reincarnate', { stack: String(new Error().stack || '').split('\n').slice(2, 6).join(' | ').slice(0, 300) });
    const r = o.apply(this, arguments);
    if (Date.now() - trustedAt < 5000) intent('reincarnate-done');   /* 玩家親手確認的轉世:「輪迴前」復原點不算倒退 */
    return r;
  }; }
  function restore(s) { restoring = true; try { localStorage.setItem(K, s.raw); localStorage.setItem(INT, String(Date.now())); } catch (e) { } restoring = false; ev('restore', { to: s.realm }); location.reload(); }
  /* 開啟時檢查:目前進度比最高復原點低,且之後沒有玩家親手的輪迴/重開/匯入 → 詢問還原 */
  async function check() {
    snaps = (await get('snaps')) || []; ready = true;
    const cur = meta(ls(K)); if (!cur || !snaps.length) { snap(); return; }
    const it = +(ls(INT) || 0), ack = +(ls('XIUXIAN_ACK112') || 0), after = snaps.filter(s => s.at > Math.max(it, ack));
    const best = after.reduce((a, s) => !a || lv(s) > lv(a) ? s : a, null);
    if (best && lv(cur) < lv(best) && best.realm > cur.realm) {
      asking = true; ev('regress', { from: best.realm, to: cur.realm });
      setTimeout(() => {
        const ok = window.confirm(`偵測到進度倒退:\n目前 ${rname(cur)},但 ${fmtT(best.at)} 時是【${rname(best)}】。\n\n要還原到【${rname(best)}】嗎?`);
        asking = false;
        if (ok) restore(best); else { try { localStorage.setItem('XIUXIAN_ACK112', String(Date.now())); } catch (e) { } snap(); }
      }, 1500);
      return;
    }
    snap();
  }
  setTimeout(() => { check().catch(() => { ready = true; }); }, 1200);
  setInterval(() => { snap().catch(() => { }); }, 60e3);
  window.addEventListener('pagehide', () => { snap().catch(() => { }); });
  /* 存檔保護區:列出復原點 */
  window.GUARD112 = { snaps: () => snaps, restore: i => { const s = snaps[i]; if (s && window.confirm(`還原到【${rname(s)}】(${fmtT(s.at)})?目前進度會被取代。`)) restore(s); }, ev };
  setInterval(() => {
    const box = document.getElementById('diag100'); if (!box || !box.offsetParent) return;
    let el = document.getElementById('rp112'); if (!el) { el = document.createElement('div'); el.id = 'rp112'; box.parentNode.insertBefore(el, box); }
    const seen = new Set(), list = snaps.map((s, i) => [s, i]).filter(([s]) => { const k = s.realm + '-' + s.sub + '-' + s.cyc; if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 5);
    const h = `<div style="border-top:1px dashed #c9b994;margin-top:8px;padding-top:6px;font-size:11px;color:#6b5f4f"><b style="color:#8a5a12">自動復原點</b>(遊戲自動保存,不必手動備份)` +
      (list.length ? list.map(([s, i]) => `<div style="display:flex;align-items:center;gap:6px;margin-top:4px"><span style="flex:1">${rname(s)}${s.cyc > 1 ? `・第${s.cyc}周目` : ''}${s.tag ? `・<b>${s.tag}</b>` : ''}<br><span style="font-size:10px;opacity:.75">${fmtT(s.at)}</span></span><button data-rp112="${i}" style="padding:4px 10px;border-radius:8px;border:1px solid #b07d1a;background:#f6e7c1;color:#6e3a0c;font-weight:800;font-size:11px">還原</button></div>`).join('') : '<div style="margin-top:4px">尚無(遊戲開著時每 10 分鐘自動建立)</div>') + '</div>';
    if (el.dataset.h !== h) { el.dataset.h = h; el.innerHTML = h; }
  }, 1500);
  document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-rp112]'); if (b) GUARD112.restore(+b.dataset.rp112); });
})();
