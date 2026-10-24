/* ===== v108 洞府場景熱點紅點 ===== */
(() => {
  const st = document.createElement('style');
  st.textContent = '#hub44 .h44 .nm{position:relative}#hub44 .h44 .nm>i.rd{display:block!important;position:absolute;top:-4px;right:-4px;width:10px;height:10px;border-radius:50%;background:#d13b2f;box-shadow:0 0 0 2px #f6efe0}';
  document.head.appendChild(st);
  function tick() {
    const hub = document.getElementById('hub44'); if (!hub || !hub.offsetParent) return;
    let f = {}; try { f = redFlags(); } catch (e) { }
    const gd = hub.querySelector('[data-s="gd"]');
    const want = { '5': f.body, '6': f.treasure, '7': f.pet, gd: /可收/.test(gd ? gd.textContent : '') };
    hub.querySelectorAll('.h44').forEach(b => {
      const k = b.dataset.m6 || b.dataset.h44, nm = b.querySelector('.nm'); if (!nm || !(k in want)) return;
      let d = nm.querySelector(':scope>i.rd');
      if (want[k] && !d) { d = document.createElement('i'); d.className = 'rd'; nm.appendChild(d); }
      else if (!want[k] && d) d.remove();
    });
  }
  setInterval(tick, 800); setTimeout(tick, 400);
})();
