/* ===== v98 存檔防護提示 ===== */
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
