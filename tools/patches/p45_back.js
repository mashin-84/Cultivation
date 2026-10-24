/* ===== v111 手機返回鍵 = 遊戲返回鍵 ===== */
(() => {
  const SEL = '.x5-ov,#ov51,#ov53,#ov54,#sheet13,.lk14-ov,[id^="modal-"],#pw9';
  const shown = e => !e.classList.contains('hidden') && !e.classList.contains('h') && !e.classList.contains('x5-h') && (e.id !== 'sheet13' || e.classList.contains('on')) && getComputedStyle(e).display !== 'none' && getComputedStyle(e).visibility !== 'hidden';
  const vis = e => !!(e && e.offsetParent !== null && getComputedStyle(e).display !== 'none');
  const CLOSE_TXT = /^(×|✕|✖|X|關閉|返回|收起|取消|先不用|知道了|確定|好|收下|離開)$/;
  let armed = 0, trapped = false;
  function trap() { try { history.pushState({ yn111: 1 }, ''); trapped = true; } catch (e) { } }
  function topOverlay() {
    let best = null, bz = -1;
    document.querySelectorAll(SEL).forEach(e => { if (!shown(e)) return; const z = parseInt(getComputedStyle(e).zIndex, 10) || 0; if (z >= bz) { bz = z; best = e; } });
    return best;
  }
  function closeOv(e) {
    if (e.classList.contains('x5-ov') && e.id && e.id.indexOf('x5s-') === 0) { X5.close(e.id.slice(4)); return true; }
    if (e.id === 'modal-tribulation') { const pb = document.getElementById('trib-process-box'); if (pb && !pb.classList.contains('hidden')) return true; }   /* 渡劫進行中:不打斷 */
    const btns = [...e.querySelectorAll('button,[role="button"]')].filter(b => vis(b) && !b.disabled);
    const x = btns.find(b => /close|cancel|dismiss/i.test(b.id || '')) || btns.find(b => /(^|[\s-])(x|close|cls)([\s-]|$)/i.test(b.className) || /\.x$|\.close$/.test(b.dataset.x5 || '') || b.getAttribute('aria-label') === 'close')
      || btns.find(b => CLOSE_TXT.test((b.textContent || '').trim()));
    if (x) { x.click(); return true; }
    e.dispatchEvent(new MouseEvent('click', { bubbles: true }));   /* 點背景關閉 */
    return !shown(e) || true;
  }
  function onBack() {
    /* 劇情播放、標題/建角畫面:不處理 */
    const st = document.getElementById('st28');
    if (window.ST28 && ST28.busy() && st && getComputedStyle(st).display !== 'none') { trap(); return; }
    const t34 = document.getElementById('title34'); if (t34 && vis(t34)) { trap(); return; }
    const ov = topOverlay();
    if (ov) { closeOv(ov); armed = 0; trap(); return; }
    const cur = (document.querySelector('.tab-panel:not(.hidden)') || {}).id;
    if (cur && cur !== 'tab-abode') { const b = document.querySelector('[data-n25="tab-abode"]'); if (b) b.click(); else try { goToTab('tab-abode'); } catch (e) { } armed = 0; trap(); return; }
    if (armed && Date.now() - armed < 2000) { armed = 0; trapped = false; try { history.back(); } catch (e) { } return; }   /* 第二次:真的離開 */
    armed = Date.now(); trapped = false; showToast('再按一次返回鍵離開遊戲');
    setTimeout(() => { if (armed && Date.now() - armed >= 1900) { armed = 0; if (!trapped) trap(); } }, 2000);
  }
  window.addEventListener('popstate', () => { try { onBack(); } catch (e) { trap(); } });
  trap();
  window.BACK111 = { onBack };
})();
