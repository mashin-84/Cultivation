
/* ===== v10.1:神通與本命絕學演出 —— 每次施放都有完整動畫(自動戰鬥亦然,隨倍速加快;看不到戰場時略過) ===== */
(function () {
  const ULTN = { sword: ['劍氣縱橫', '#e0f2fe', '#38bdf8'], magic: ['五行法陣', '#e9d5ff', '#a855f7'], body: ['金身怒目', '#fef3c7', '#f59e0b'], pill: ['丹爐煉化', '#fee2e2', '#ef4444'] };
  const st = document.createElement('style');
  st.textContent = `
  .ca43{position:absolute;inset:0;z-index:9;pointer-events:none;overflow:hidden;border-radius:inherit}
  .ca43 .vl{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 55%,rgba(0,0,0,.25),rgba(0,0,0,.82));animation:ca43v var(--d) ease-out forwards}
  .ca43 .br{position:absolute;left:-30%;right:-30%;top:34%;height:34%;background:linear-gradient(90deg,transparent 0%,var(--c2) 18%,var(--c1) 50%,var(--c2) 82%,transparent 100%);opacity:.0;transform:skewY(-8deg) scaleX(0);filter:blur(1px);animation:ca43b var(--d) cubic-bezier(.2,.8,.2,1) forwards;mix-blend-mode:screen}
  .ca43 .pt{position:absolute;left:-4%;bottom:0;height:96%;opacity:0;transform:translateX(-40%);filter:drop-shadow(0 0 14px var(--c2));animation:ca43p var(--d) cubic-bezier(.2,.8,.2,1) forwards}
  .ca43 .nm{position:absolute;left:30%;right:0;top:50%;transform:translateY(-50%);text-align:center;white-space:nowrap;font-family:'Noto Serif TC','Songti TC',serif;font-weight:900;font-size:44px;letter-spacing:8px;color:var(--c1);text-shadow:0 0 10px var(--c2),0 0 26px var(--c2),0 3px 0 #000;opacity:0;animation:ca43n var(--d) cubic-bezier(.2,.8,.2,1) forwards}
  .ca43 .ink{position:absolute;right:2%;top:12%;width:46%;height:76%;background:radial-gradient(circle at 60% 40%,rgba(0,0,0,.55) 0 18%,transparent 19%),radial-gradient(circle at 30% 70%,rgba(0,0,0,.45) 0 9%,transparent 10%),radial-gradient(circle at 80% 80%,rgba(0,0,0,.4) 0 6%,transparent 7%);opacity:0;animation:ca43i var(--d) ease-out forwards}
  .ca43 .fl{position:absolute;inset:0;background:var(--c1);opacity:0;animation:ca43f var(--d) ease-out forwards}
  @keyframes ca43v{0%{opacity:0}10%{opacity:1}85%{opacity:1}100%{opacity:0}}
  @keyframes ca43b{0%{opacity:0;transform:skewY(-8deg) scaleX(0)}18%{opacity:.85;transform:skewY(-8deg) scaleX(1)}80%{opacity:.6}100%{opacity:0;transform:skewY(-8deg) scaleX(1.1)}}
  @keyframes ca43p{0%{opacity:0;transform:translateX(-40%)}16%{opacity:1;transform:translateX(0)}80%{opacity:1;transform:translateX(4%)}100%{opacity:0;transform:translateX(10%)}}
  @keyframes ca43n{0%{opacity:0;transform:translateY(-50%) scale(1.9)}26%{opacity:1;transform:translateY(-50%) scale(1)}84%{opacity:1}100%{opacity:0;transform:translateY(-50%) scale(1.05)}}
  @keyframes ca43i{0%,20%{opacity:0;transform:scale(.6)}32%{opacity:1;transform:scale(1)}85%{opacity:.9}100%{opacity:0}}
  @keyframes ca43f{0%,86%{opacity:0}90%{opacity:.75}100%{opacity:0}}
  .sk43{position:absolute;inset:0;z-index:8;pointer-events:none;display:flex;align-items:flex-start;justify-content:center;padding-top:6%}
  .sk43 .rg{position:absolute;top:22%;width:46%;aspect-ratio:1;border-radius:50%;border:3px solid var(--c);box-shadow:0 0 22px var(--c),inset 0 0 22px var(--c);opacity:0;animation:sk43r var(--d) ease-out forwards}
  .sk43 .tx{position:relative;font-family:'Noto Serif TC','Songti TC',serif;font-weight:900;font-size:19px;letter-spacing:4px;color:#fff;padding:3px 16px;border-radius:999px;background:rgba(15,12,8,.42);text-shadow:0 0 6px var(--c),0 1px 0 #000;opacity:0;animation:sk43t var(--d) cubic-bezier(.2,.8,.2,1) forwards}
  .sk43 .gl{position:absolute;inset:0;background:radial-gradient(circle at 50% 50%,var(--c) 0,transparent 55%);opacity:0;animation:sk43g var(--d) ease-out forwards;mix-blend-mode:screen}
  @keyframes sk43r{0%{opacity:0;transform:scale(.2)}30%{opacity:.95}100%{opacity:0;transform:scale(1.5)}}
  @keyframes sk43t{0%{opacity:0;transform:scale(1.7)}25%{opacity:1;transform:scale(1)}80%{opacity:1}100%{opacity:0;transform:translateY(-8px)}}
  @keyframes sk43g{0%{opacity:0}25%{opacity:.45}100%{opacity:0}}
  .shk43{animation:shk43 .42s linear}
  @keyframes shk43{0%,100%{transform:none}20%{transform:translate(-5px,3px)}40%{transform:translate(5px,-3px)}60%{transform:translate(-4px,-2px)}80%{transform:translate(3px,2px)}}
  #battle-skill-bar [data-ult26]:not([disabled]){border-color:#f59e0b!important;color:#fde68a!important;background:linear-gradient(135deg,#78350f,#1e1b4b)!important;animation:ult43 1.4s ease-in-out infinite}
  @keyframes ult43{0%,100%{box-shadow:0 0 0 rgba(245,158,11,0)}50%{box-shadow:0 0 14px rgba(245,158,11,.85)}}`;
  document.head.appendChild(st);
  const sp = () => state.battleSpeed || 1;
  const visible = () => { try { return !document.hidden && !!stageOn(); } catch (e) { return false; } };
  function overlay(cls, html, vars, ms) {
    const stg = document.getElementById('battle-stage'); if (!stg) return;
    if (getComputedStyle(stg).position === 'static') stg.style.position = 'relative';
    const d = document.createElement('div'); d.className = cls; Object.keys(vars).forEach(k => d.style.setProperty(k, vars[k])); d.innerHTML = html; stg.appendChild(d);
    setTimeout(() => d.remove(), ms + 80);
  }
  function shake(ms) { const stg = document.getElementById('battle-stage'); if (!stg) return; stg.classList.remove('shk43'); void stg.offsetWidth; stg.classList.add('shk43'); setTimeout(() => stg.classList.remove('shk43'), ms); }
  function ultCutin(ms) {
    const sc = (window.SCH19 && SCH19.SCH().main) || 'sword', U = ULTN[sc] || ULTN.sword;
    const ps = document.getElementById('bs-ps'), src = ps && ps.getAttribute('src');
    overlay('ca43', `<div class="vl"></div><div class="br"></div>${src ? `<img class="pt" src="${src}" alt="">` : ''}<div class="ink"></div><div class="nm">${U[0]}</div><div class="fl"></div>`, { '--d': ms + 'ms', '--c1': U[1], '--c2': U[2] }, ms);
    setTimeout(() => shake(420), ms * .3);
  }
  function skillFx(sk, ms) {
    const c = (sk.el && typeof SK_EL_COLOR !== 'undefined' && SK_EL_COLOR[sk.el]) || '#c4b5fd';
    overlay('sk43', `<div class="gl"></div><div class="rg"></div><div class="tx">${sk.name}</div>`, { '--d': ms + 'ms', '--c': c }, ms);
  }
  /* 出手前先演出,演完才真正出招;自動戰鬥同樣等演出結束 */
  XT.playerAct101 = _pa => function (id) {
    const B = currentBattle;
    if (!B || battleLock || !id || B._anim43 || !visible()) return _pa.apply(this, arguments);
    const isUlt = id === 'ULT26', sk = !isUlt && typeof SK_BY_ID !== 'undefined' ? SK_BY_ID[id] : null;
    if (!isUlt && !sk) return _pa.apply(this, arguments);
    if (isUlt && ((skillCds.ULT26 || 0) > 0)) return _pa.apply(this, arguments);
    if (sk && ((skillCds[id] || 0) > 0 || !(skState().learned || {})[id])) return _pa.apply(this, arguments);
    const ms = Math.round((isUlt ? 1500 : 650) / sp()), self = this, args = arguments;
    battleLock = true; B._anim43 = 1; try { updateBattleUI(); } catch (e) { }
    if (isUlt) ultCutin(ms); else skillFx(sk, ms);
    setTimeout(() => {
      if (currentBattle !== B) return;
      battleLock = false;
      try { _pa.apply(self, args); } finally { B._anim43 = 0; }
    }, isUlt ? Math.round(ms * .82) : Math.round(ms * .55));
  };
  /* 演出讓每場戰鬥變長:一般歷練勝利的靈石與材料加成,讓每小時收入大致不變(練氣・築基 ×1.3,其後 ×2) */
  XT.winBattle101 = _wb => function () {
    const B = currentBattle;
    const normal = B && !B.special && !B.tb26 && !B.isSect && !B.isWB && !B.isTower && !B.isDemonTrib && !B.isJie && !B.isBoss && AREAS_DATA[state.currentArea];
    const s0 = state.stones, inv0 = Object.assign({}, state.inventory);
    const r = _wb.apply(this, arguments);
    if (normal) {
      try {
        const f = (state.currentArea || 0) >= 2 ? 1 : .3;
        const ds = state.stones - s0; if (ds > 0) state.stones += Math.floor(ds * f);
        Object.keys(state.inventory).forEach(k => { const d = state.inventory[k] - (inv0[k] || 0); if (d > 0 && ITEMS[k] && ITEMS[k].type === 'material') { const x = Math.floor(d * f + (Math.random() < (d * f) % 1 ? 1 : 0)); if (x > 0) state.inventory[k] += x; } });
      } catch (e) { }
    }
    return r;
  };
})();
