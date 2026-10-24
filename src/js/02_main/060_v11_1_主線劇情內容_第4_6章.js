/* ===== v11.1:主線劇情內容(第4~6章) ===== */
(function () {
  const A = window.ST28; if (!A) return;
  const { bg, say, nar, fx, set, ch, ifF, clr, R, E } = A;
  const S = say, N = nar;
  const AGE = n => set({ fn: () => { try { if ((state.age || 0) < n) { state.age = n; state.ageTimer = 0; } } catch (e) { } } });
  const MS = () => (window.state && state.sch && state.sch.main) || 'sword';
  const sch4 = (a, b, c, d) => ifF(() => MS() === 'sword', a, [ifF(() => MS() === 'magic', b, [ifF(() => MS() === 'body', c, d)])]);
  