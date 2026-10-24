
(function () {
  const t = document.getElementById('title34'); if (!t) return;
  let gone = false;
  function go() { if (gone || (window.T123 && !T123.ready)) return; gone = true; try { audio.init(); } catch (e) { } t.classList.add('out'); setTimeout(() => { try { t.remove(); } catch (e) { } }, 1450); }
  t.addEventListener('click', go);
  t.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') go(); });
})();
