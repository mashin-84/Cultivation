/* ===== v90 存檔檔案匯出/匯入 ===== */
(() => {
  const $ = id => document.getElementById(id);
  const code = () => btoa(unescape(encodeURIComponent(JSON.stringify(state))));
  function fname() {
    const d = new Date(), z = n => String(n).padStart(2, '0');
    let rn = ''; try { rn = getRealmInfo().realm.name || ''; } catch (e) { }
    return `一念飛仙存檔_${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}_${z(d.getHours())}${z(d.getMinutes())}${rn ? '_' + rn : ''}.txt`;
  }
  function download() {
    try {
      saveGame(); state.lastExport = Date.now(); const txt = code(); saveGame();
      const url = URL.createObjectURL(new Blob([txt], { type: 'text/plain' })), a = document.createElement('a');
      a.href = url; a.download = fname(); document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      showToast('💾 存檔檔案已下載,請到手機「下載」資料夾查看。');
    } catch (e) { showToast('下載失敗,請改用「匯出存檔代碼」。'); }
  }
  function pick() { const i = $('inp-load-file'); if (i) { i.value = ''; i.click(); } }
  function loaded(f) {
    if (!f) return; const r = new FileReader();
    r.onload = () => {
      const txt = String(r.result || '').replace(/\s+/g, '');
      try { JSON.parse(decodeURIComponent(escape(atob(txt)))); } catch (e) { showToast('這不是有效的存檔檔案。'); return; }
      openSaveModal('import'); const ta = $('save-data-textarea'); if (ta) ta.value = txt;
      showToast('已讀取存檔檔案,確認無誤請按「確認覆蓋匯入」。');
    };
    r.onerror = () => showToast('讀取檔案失敗。'); r.readAsText(f);
  }
  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('#btn-save-file,#btn-load-file'); if (!b) return;
    if (b.id === 'btn-save-file') download(); else pick();
  });
  document.addEventListener('change', e => { if (e.target && e.target.id === 'inp-load-file') loaded(e.target.files && e.target.files[0]); });
  window.SV90 = { download, fname };
})();
