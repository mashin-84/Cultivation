/* ============ 戰鬥可讀性(v10.2):技能名橫幅・近三行戰報・倍速上限 2x・大字傷害 ============ */
  { const c = document.createElement('style'); c.textContent = `.bs-ban{position:absolute;left:0;right:0;top:8px;text-align:center;z-index:6;pointer-events:none;font-family:'Noto Serif TC',serif;font-weight:900;font-size:19px;letter-spacing:3px;color:#fde68a;text-shadow:0 2px 6px #000,0 0 14px var(--bc,#f59e0b);animation:bsb26 1.15s ease-out forwards}
@keyframes bsb26{0%{opacity:0;transform:translateY(-10px) scale(.88)}14%{opacity:1;transform:none}78%{opacity:1}100%{opacity:0;transform:translateY(-4px)}}
#blog26{margin-top:4px;padding:5px 8px;border-radius:8px;background:rgba(2,6,23,.75);border:1px solid #1e293b;font-size:11px;line-height:1.55;color:#94a3b8;min-height:52px}
#blog26 div{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#blog26 div:last-child{color:#fde68a;font-weight:700}
.bs-num{font-size:21px!important}.bs-num.crit{font-size:30px!important}.bs-num{animation-duration:calc(1.35s/var(--sp))!important}`; document.head.appendChild(c); }
  fx.banner = function (name, col) {
    const stg = stageEl('battle-stage'); if (!stg || !stageOn()) return; stg.querySelectorAll('.bs-ban').forEach(x => x.remove());
    const d = document.createElement('div'); d.className = 'bs-ban'; d.style.setProperty('--bc', col || '#f59e0b'); d.textContent = name; stg.appendChild(d); setTimeout(() => d.remove(), 1250);
  };
  fx.num = function (text, cls, side) {
    const f = stageEl('bs-fx'); if (!f || !stageOn()) return;
    const d = document.createElement('div'); d.className = 'bs-num ' + cls; d.innerText = text;
    d.style.left = (side === 'p' ? 16 + Math.random() * 10 : 58 + Math.random() * 16) + '%'; d.style.top = (side === 'p' ? 24 : 12 + Math.random() * 14) + '%';
    f.appendChild(d); setTimeout(() => d.remove(), 1350 / (state.battleSpeed || 1) + 100);
  };
  { XT.fxAct102 = _pa2 => function (sk) { _pa2.apply(this, arguments); if (sk && sk.name) this.banner(sk.name, sk.el ? SK_EL_COLOR[sk.el] : '#c4b5fd'); }; }
  function ensureLog() { if ($('blog26')) return; const stg = $('battle-stage'); if (stg) stg.insertAdjacentHTML('afterend', '<div id="blog26"></div>'); }
  function renderLog() { const b = $('blog26'); if (!b) return; const B = currentBattle, L = (B && B.bl) || []; b.innerHTML = L.slice(-3).map(x => `<div>${x}</div>`).join('') || '<div>戰鬥開始…</div>'; }
  { const _la = logAdventure; logAdventure = function (t) { const r = _la.apply(this, arguments); try { const B = currentBattle; if (B) { ensureLog(); (B.bl = B.bl || []).push(String(t).replace(/<[^>]+>/g, '').slice(0, 60)); if (B.bl.length > 8) B.bl.shift(); renderLog(); } } catch (e) { } return r; }; }
  { const _bs2 = battleSetup; battleSetup = function () { _bs2.apply(this, arguments); ensureLog(); if (currentBattle) currentBattle.bl = []; renderLog(); if ((state.battleSpeed || 1) > 2) state.battleSpeed = 2; }; }
  const SPD = [1, 1.5, 2], spdTxt = () => `${state.battleSpeed || 1}x`;
  function syncSpd() { const a = $('btn-battle-speed'); if (a) a.innerText = `倍速: ${spdTxt()}`; const b = $('btn-speed-out'); if (b) b.innerText = `⏩ 倍速 ${spdTxt()}`; }
  toggleBattleSpeed = function () { let i = SPD.indexOf(state.battleSpeed || 1); if (i < 0) i = 0; state.battleSpeed = SPD[(i + 1) % SPD.length]; syncSpd(); };
  setTimeout(() => { if ((state.battleSpeed || 1) > 2 || SPD.indexOf(state.battleSpeed || 1) < 0) state.battleSpeed = Math.min(2, state.battleSpeed || 1); syncSpd(); }, 900);
  setInterval(syncSpd, 1500);

  /* 主線劇情用特殊戰:滿血開打,勝/敗/撤退都回呼 cfg.onEnd(win) */
  function story(cfg) { try { state.hp = calculateTotalStats().hp; } catch (e) { } return launch(Object.assign({ kind: 'story', target: 1.8 }, cfg)); }
  window.TB26 = { startTrial, startSecret, margin, story };
})();


