/* ============ 頂部整理 ============ */
  function headerInit() {
    const h = document.querySelector('#game-app>header'); if (!h || h.dataset.ui25) return; h.dataset.ui25 = 1;
    /* ⚙ 選單按鈕 */
    const snd = $('btn-sound-toggle'); if (snd && !$('btn-menu25')) { const b = document.createElement('button'); b.id = 'btn-menu25'; b.dataset.x5 = 'mn.open'; b.setAttribute('aria-label', '設定'); b.textContent = '⚙'; snd.parentElement.appendChild(b); }
    /* 資源列:只留圖示 */
    const grid = h.querySelector('.grid.grid-cols-3'); if (grid) {
      grid.classList.add('res25');
      [['res-spirit-stones', '💎', '靈石'], ['res-lifespan', '⏳', '壽元'], ['res-combat-power', '⚡', '戰力']].forEach(([id, ic, nm]) => { const v = $(id); if (!v) return; const lb = v.previousElementSibling; if (lb) { lb.className = 'lb25'; lb.title = nm; lb.textContent = ic; } v.parentElement.title = nm; });
    }
    /* 修為進度 */
    const qt = $('qi-progress-text'); if (qt) { const wrap = qt.parentElement.parentElement; wrap.classList.add('qi25'); qt.parentElement.classList.add('row25'); const bar = $('qi-progress-fill') && $('qi-progress-fill').parentElement; if (bar) bar.classList.add('bar25'); }
  }
  headerInit(); setTimeout(headerInit, 600); setTimeout(headerInit, 2000);
  /* 修行指引:膠囊(點文字開清單) */
  document.addEventListener('click', e => { if (e.target.closest && e.target.closest('#tutorial-guide-banner') && !e.target.closest('button')) X.open('guide'); });

  