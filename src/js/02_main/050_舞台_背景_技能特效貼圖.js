/* ============ 舞台:背景 + 技能特效貼圖 ============ */
  const spr = (n, rot, cls) => `<img class="bs-spr ${cls || ''}" alt="" draggable="false" src="${fxSrc(n)}" style="--rot:${rot || 0}deg">`;
  const hasFx = () => !!(GA && GA.fx && fxSrc(1));
  XT.fxSetup100 = _setup => function () {
    _setup.apply(this, arguments);
    const stg = stageEl('battle-stage'); if (!stg || !currentBattle || !bgs.length) return;
    const i = Math.floor(Math.random() * bgs.length), B9 = currentBattle, G9 = window.GEN3 || (typeof GEN3 !== 'undefined' ? GEN3 : {}); let u9 = bgs[i];
    if (B9.isTower && G9.T) u9 = G9.T; else if (!B9.special && !B9.tb26 && !B9.isJie && !B9.isWB && G9['A' + (state.currentArea || 0)]) u9 = G9['A' + (state.currentArea || 0)];
    stg.style.backgroundImage = `linear-gradient(180deg,rgba(2,6,23,.05),rgba(2,6,23,.25)),url(${u9})`; stg.style.backgroundSize = 'cover'; stg.style.backgroundPosition = 'center'; stg.style.backgroundColor = '#0b1220';
  };
  const _sp = fx.spawn;
  fx.spawn = function (html) { if (fx._mute && /bs-ring|bs-plus/.test(html)) return; return _sp.apply(this, arguments); };
  const _hit = fx.hit;
  fx.hit = function (d, crit, key, i) {
    if (!hasFx() || !stageOn()) return _hit.apply(this, arguments);
    this.pulse(stageEl('bs-m'), 'hit', 380);
    const M = { slash: [1], flow: [2, -40 + (i % 3) * 38], fire: [3], ice: [4], blood: [9], thunder: [5], god: [5, 0, 16], swords: [2, 70], quake: [15], void: [8], pet: [11] };
    const e = M[key] || M.slash;
    this.spawn(spr(e[0], e[1]), 650, 'onm'); if (e[2]) this.spawn(spr(e[2]), 650, 'onm'); if (crit) this.spawn(spr(11, 0, 'big'), 600, 'onm');
    if (key === 'thunder' || key === 'god' || key === 'quake' || key === 'void') this.pulse(stageEl('battle-stage'), key === 'quake' ? 'shake' : 'flash', 420);
    this.num((crit ? '💥' : '') + formatNum(d), crit ? 'crit' : (key === 'pet' ? 'pet' : 'dmg'), 'm');
  };
  XT.fxAct100 = _pa => function (sk) {
    fx._mute = hasFx(); try { _pa.apply(this, arguments); } finally { fx._mute = false; }
    if (!hasFx() || !stageOn()) return; const key = sk ? sk.fx : 'slash';
    if (key === 'guard' || key === 'chaos') this.spawn(spr(6), 900, 'onp'); if (key === 'rage') this.spawn(spr(10), 900, 'onp'); if (key === 'heal') this.spawn(spr(7), 1000, 'onp');
  };
  XT.fxHit100 = _ph => function () { _ph.apply(this, arguments); if (hasFx() && stageOn()) this.spawn(spr(12), 520, 'onp'); };

  