/* ============ 流派:回合制中的心法加成與本命絕學 ============ */
  const main = () => (R() >= 1 && S9) ? S9.SCH().main : null;
  const ULT = { sword: { n: '劍氣縱橫', ic: '🌬️', cd: 5 }, magic: { n: '五行法陣', ic: '🔯', cd: 6 }, body: { n: '金身怒目', ic: '🪬', cd: 6 }, pill: { n: '丹爐煉化', ic: '♨️', cd: 6 } };
  const baseDmg = B => { const s = calculateTotalStats(), atk = Math.floor(s.atk * ((B.buff && B.buff.turns > 0) ? 1 + B.buff.pct : 1)); return Math.max(1, Math.floor(atk * atk / (atk + B.monster.def))); };
  /* 劍修:每第 5 次出手 ×1.8 */
  { const o = window.sectDmgMult; window.sectDmgMult = function () { let m = o ? o.apply(this, arguments) : 1; if (currentBattle && currentBattle.swProc) m *= 1.8; return m; }; }
  /* 體修:開戰護盾;低血再得一次 */
  { const _bs = battleSetup; battleSetup = function () { _bs.apply(this, arguments); const B = currentBattle; if (B && main() === 'body') { B.shield = Math.floor(B.playerMaxHp * .15); B.bodyLow = false; try { fx.status(); } catch (e) { } } }; }
  { const _u = updateBattleUI; updateBattleUI = function () { const B = currentBattle; if (B && main() === 'body' && !B.bodyLow && B.playerHp > 0 && B.playerHp / B.playerMaxHp < .3) { B.bodyLow = true; B.shield = Math.max(B.shield || 0, Math.floor(B.playerMaxHp * .15)); try { fx.num('+🛡' + fmt(B.shield), 'heal', 'p'); } catch (e) { } logAdventure('🪬 金身護體,氣血垂危之際再凝護盾!'); } return _u.apply(this, arguments); }; }
  /* 出手前後的加成:冷卻縮短、丹火回春、法修靈球、劍氣貫穿 */
  { XT.playerAct100 = _p => function (id) {
    const B = currentBattle; if (!B || battleLock) return;
    if (id === 'ULT26') return ult(B);
    const sk = id ? SK_BY_ID[id] : null; if (sk && (!skState().learned[id] || (skillCds[id] || 0) > 0)) return _p.apply(this, arguments);
    const sc = main(), sp = state.battleSpeed || 1, m = B.monster;
    const acd = (X.E && X.E().acd) || 0; if (acd > 0) Object.keys(skillCds).forEach(k => { if (skillCds[k] > 1 && Math.random() < Math.min(.5, acd * 2)) skillCds[k]--; });
    if (sc === 'pill' && B.playerHp > 0) { const h = Math.floor(B.playerMaxHp * .02); if (h > 0) { B.playerHp = Math.min(B.playerMaxHp, B.playerHp + h); try { fx.num('+' + fmt(h), 'heal', 'p'); } catch (e) { } } }
    B.swProc = false; if (sc === 'sword') { B.swN = (B.swN || 0) + 1; B.swProc = (B.swN % 5 === 0); }
    const proc = B.swProc;
    const r = _p.apply(this, arguments);
    B.swProc = false;
    if (proc) { logAdventure('🌬️ 劍意凝聚,這一擊化為劍氣貫穿(傷害 ×1.8)!'); try { fx.num('劍氣貫穿', 'info', 'p'); } catch (e) { } }
    if (sc === 'magic' && sk) bT(() => {
      const d = Math.floor(baseDmg(B) * 1.2); if (d <= 0 || m.curHp <= 0) return; m.curHp = Math.max(0, m.curHp - d); fx.hit(d, false, 'pet', 0); logAdventure(`🔮 三枚靈球追射,再造成 ${fmt(d)} 點傷害。`); updateBattleUI();
    }, 300 / sp);
    return r;
  }; }
  /* 本命絕學 */
  function ultBest() { let best = { m: 0, sk: null }; try { const S = skState(); S.equipped.slice(0, skSlots()).forEach(id => { if (!id || !S.learned[id]) return; const sk = SK_BY_ID[id]; if (!sk) return; const c = skCalc(sk, S.learned[id].lv); const x = sk.type === 'atk' ? (c.hits || 1) * (c.mult || 0) : (c.mult || 0); if (x > best.m) best = { m: x, sk }; }); } catch (e) { } return best; }
  function ult(B) {
    const sc = main(), U = ULT[sc]; if (!U) return;
    if ((skillCds.ULT26 || 0) > 0) { showToast(`【${U.n}】冷卻中!`); return; }
    battleLock = true; updateBattleUI(); audio.init(); if (!isQuietAuto() && !SFX.play('sfx_ult')) audio.playSlash();
    const m = B.monster, sp = state.battleSpeed || 1, base = baseDmg(B), bs = ultBest(), dm = window.sectDmgMult ? sectDmgMult(bs.sk) : 1;
    skillCds.ULT26 = U.cd; fx.pulse(stageEl('bs-p'), 'cast', 700); fx.banner(`${U.ic} ${U.n}`, '#f59e0b'); logAdventure(`${U.ic} 道友祭出本命絕學【${U.n}】!`);
    const hit = (x, k) => { const cr = Math.random() * 100 < calculateTotalStats().crit, d = Math.max(1, Math.floor(base * x * dm * (cr ? (window.sectCritMult ? sectCritMult() : 1.5) : 1))); m.curHp = Math.max(0, m.curHp - d); fx.hit(d, cr, k, 0); logAdventure(`💥 【${U.n}】造成 ${fmt(d)} 點傷害!${cr ? '(會心一擊!)' : ''}`); return d; };
    bT(() => {
      if (sc === 'sword') hit(Math.max(3, bs.m * 1.6), 'god');
      else if (sc === 'magic') {
        const d = hit(Math.max(1.5, bs.m * 1.6), 'void'); B.dot = { dmg: Math.max(1, Math.floor(base * .35)), turns: 3 }; logAdventure(`🔥 【${m.name}】被法陣灼燒,3 回合內持續受創!`);
        const resist = m.isBoss && Math.random() < .4; if (resist) { fx.num('抵抗', 'info', 'm'); } else { B.stun = 1; fx.stunned(); }
      } else if (sc === 'body') { hit(Math.max(2, bs.m * 1.6), 'quake'); B.shield = Math.max(B.shield || 0, Math.floor(B.playerMaxHp * .4)); fx.num('+🛡' + fmt(B.shield), 'heal', 'p'); logAdventure(`🛡️ 金身怒目,獲得 ${fmt(B.shield)} 點護盾。`); }
      else if (sc === 'pill') { hit(Math.max(1, bs.m), 'god'); const h = Math.floor(B.playerMaxHp * .3); B.playerHp = Math.min(B.playerMaxHp, B.playerHp + h); B.buff = { pct: .25, turns: 3 }; fx.num('+' + fmt(h), 'heal', 'p'); fx.spawn && hasFx() && fx.spawn(spr(7), 1000, 'onp'); logAdventure(`♨️ 丹爐煉化,恢復 ${fmt(h)} 點氣血,攻擊提升 25%(3 回合)。`); }
      fx.status(); updateBattleUI();
    }, 320 / sp);
    bT(() => {
      fx.status(); updateBattleUI();
      if (m.curHp <= 0) { fx.die(); bT(() => { battleLock = false; winBattle(); }, 320 / sp); return; }
      bT(monsterCounterAttack, 220 / sp);
    }, 900 / sp);
  }
  { const _r = renderSkillBar; renderSkillBar = function () {
    _r.apply(this, arguments); const bar = $('battle-skill-bar'); if (!bar || !currentBattle) return;
    const U = ULT[main()]; let b = bar.querySelector('[data-ult26]');
    if (!U) { if (b) b.remove(); return; }
    const cd = skillCds.ULT26 || 0, on = cd <= 0 && !battleLock;
    if (!b) { b = document.createElement('button'); b.setAttribute('data-ult26', '1'); b.setAttribute('data-skbtn', 'ULT26'); b.className = 'tap-effect py-1.5 px-1 rounded border text-xs font-bold'; bar.appendChild(b); }
    b.disabled = !on; const t = `${U.ic} 本命絕學・${U.n}${cd > 0 ? `(${cd})` : ''}`; if (b.textContent !== t) b.textContent = t;
  }; }
  { const _c = chooseAutoAction; chooseAutoAction = function () {
    const B = currentBattle, sc = main();
    if (B && sc && ULT[sc] && !(skillCds.ULT26 > 0)) { const hp = B.playerHp / B.playerMaxHp, mp = B.monster.curHp / B.monster.hp; if (sc === 'pill' ? hp < .55 : sc === 'body' ? hp < .7 : (B.monster.isBoss || mp > .5)) return 'ULT26'; }
    return _c.apply(this, arguments);
  }; }

  