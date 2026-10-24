/* ===== v11.0:主線劇情內容(第1~3章) ===== */
(function () {
  const A = window.ST28; if (!A) return;
  const { bg, say, nar, fx, set, ch, ifF, clr, R, E } = A;
  const S = say, N = nar;
  const AGE = n => set({ fn: () => { try { if ((state.age || 0) < n) { state.age = n; state.ageTimer = 0; } } catch (e) { } } });
  const need = (a, b) => ({ b: a, f: b });
  