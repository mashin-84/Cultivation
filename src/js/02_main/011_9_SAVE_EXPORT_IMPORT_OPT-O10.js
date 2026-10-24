/* ==========================================================================
   9. SAVE EXPORT & IMPORT (OPT-O10)
   ========================================================================== */
let saveModalMode = 'export';
function openSaveModal(mode) {
  saveModalMode = mode;
  const modal = document.getElementById('modal-save-export-import');
  const titleEl = document.getElementById('save-modal-title');
  const textarea = document.getElementById('save-data-textarea');
  const actionBtn = document.getElementById('btn-action-save-modal');
  if (!modal || !textarea) return;

  if (mode === 'export') {
    titleEl.innerText = '📤 匯出存檔代碼';
    actionBtn.innerText = '複製存檔代碼';
    // Base64 編碼
    state.lastExport = Date.now();
    const rawStr = JSON.stringify(state);
    const b64 = btoa(unescape(encodeURIComponent(rawStr)));
    textarea.value = b64;
    textarea.readOnly = true;
  } else {
    titleEl.innerText = '📥 匯入存檔代碼';
    actionBtn.innerText = '確認覆蓋匯入';
    textarea.value = '';
    textarea.placeholder = '請貼上先前匯出的 Base64 存檔代碼...';
    textarea.readOnly = false;
  }
  modal.classList.remove('hidden');
}

function handleSaveModalAction() {
  const textarea = document.getElementById('save-data-textarea');
  const modal = document.getElementById('modal-save-export-import');

  if (saveModalMode === 'export') {
    if (textarea) {
      textarea.select();
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(textarea.value);
        } else {
          document.execCommand('copy');
        }
        showToast('存檔代碼已成功複製到剪貼簿！');
      } catch (e) {
        showToast('複製失敗，請手動全選複製。');
      }
    }
  } else {
    const val = (textarea?.value || '').trim();
    if (!val) {
      showToast('請先貼上存檔代碼！');
      return;
    }
    try {
      const jsonStr = decodeURIComponent(escape(atob(val)));
      const parsed = JSON.parse(jsonStr);
      state = migrateSave(parsed);
      saveGame();
      updateTopBar();
      renderTechniques();
      renderInventory();
      renderCrafting();
      renderMarket();
      renderProfile();
      renderTalents();
      showToast('存檔匯入成功！仙途進度已同步更新！');
      if (modal) modal.classList.add('hidden');
    } catch (e) {
      showToast('存檔格式無效或已損壞，無法載入！');
    }
  }
}

