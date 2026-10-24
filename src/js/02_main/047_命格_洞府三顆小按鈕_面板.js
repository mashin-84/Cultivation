/* ============ 命格 → 洞府三顆小按鈕 + 面板 ============ */
  const MG = { body: ['🦴', '煉體'], treasure: ['💠', '法寶'], pet: ['🐾', '靈寵'] };
  X.sheet('ming', () => { const k = (typeof mingTab !== 'undefined' && MG[mingTab]) ? mingTab : 'body'; return `${MG[k][0]} 命格・${MG[k][1]}`; }, b => {
    const r = $('ming-root'); if (r && r.parentNode !== b) { r.classList.remove('hidden'); b.appendChild(r); }
  });
  function openMing(k) {
    k = MG[k] ? k : 'body';
    const U = (window.UNLOCK9 && UNLOCK9.U) || [], u = U.find(x => x.k === k);
    if (window.UNLOCK9 && !UNLOCK9.on(k)) { showToast(window.sysLockMsg ? sysLockMsg(k, u) : `【${(u && u.name) || MG[k][1]}】尚未開啟:${(u && u.hint) || ''}可開`); return; }
    mingTab = k; X.open('ming'); try { markTut2('ming'); } catch (e) { } try { renderExt(true); } catch (e) { }
  }
  window.openMing25 = openMing;
  X.act('mg.open', t => openMing(t.dataset.k));
  /* 讓舊程式的「前往命格分頁」改開面板 */
  { const _g = goToTab; goToTab = function (id) { if (id === 'tab-ming') { _g('tab-techniques'); setTimeout(() => openMing('body'), 80); return; } return _g.apply(this, arguments); }; }

  