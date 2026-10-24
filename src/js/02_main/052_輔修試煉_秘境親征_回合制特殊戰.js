/* ============ 輔修試煉 / 秘境親征:回合制特殊戰 ============ */
  function margin(m, pHp) {
    const s = calculateTotalStats(), atk = s.atk, crit = 1 + Math.min(1, s.crit / 100) * ((window.sectCritMult ? sectCritMult() : 1.5) - 1);
    const dP = Math.max(1, atk * atk / (atk + (m.def || 0))) * crit * 1.4 * (window.sectDmgMult ? sectDmgMult(null) : 1);
    const dM = Math.max(1, (m.atk * m.atk) / (m.atk + s.def)) * 1.14 * (1 - (window.sectDodge ? Math.min(.5, sectDodge()) : 0));
    return Math.max(.05, (pHp / dM) / (Math.max(1, m.hp) / dP));
  }
  let last = null;
  function launch(cfg) {
    if (currentBattle && !(window.HO43 && HO43.yieldBattle())) { showToast('戰鬥中無法開啟。'); return false; }
    const A = AREAS_DATA[Math.min(7, Math.max(0, cfg.tier))], b = A.monsters.find(x => x.isBoss) || A.monsters[A.monsters.length - 1];
    const mon = Object.assign({}, b, { name: cfg.name, emoji: cfg.emoji, isBoss: true, drops: [], skillName: cfg.skill || '鎮守之力' });
    { /* v10.1:依道友實際輸出定氣血(約 8 回合普攻),再調攻擊使勝算落在目標附近 */
      const s0 = calculateTotalStats(), a0 = s0.atk, cr = 1 + Math.min(1, s0.crit / 100) * ((window.sectCritMult ? sectCritMult() : 1.5) - 1);
      mon.def = Math.min(mon.def, Math.floor(a0 * .6));
      const dP = Math.max(1, a0 * a0 / (a0 + (mon.def || 0))) * cr * 1.4 * (window.sectDmgMult ? sectDmgMult(null) : 1);
      mon.hp = Math.max(10, Math.floor(dP * 8));
      for (let k = 0; k < 60; k++) { const r = margin(mon, curHp(calculateTotalStats())) / cfg.target; if (r >= .95 && r <= 1.4) break; mon.atk = Math.max(1, Math.floor(mon.atk * (r < .95 ? Math.max(.5, r) : Math.min(1.6, r)))); }
    }
    ['arena', 'school', 'srrep', 'tbr'].forEach(k => { try { X.close(k); } catch (e) { } });
    try { if (state.autoExplore) { if (window.HO43) HO43.mark(cfg); stopAutoExplore(''); } } catch (e) { }
    try { goToTab('tab-adventure'); } catch (e) { }
    last = cfg; startMonsterBattle({ id: 'tb26', name: cfg.label, maxSteps: 10, realmReq: 0, monsters: [mon] }, true);
    if (!currentBattle) return false; currentBattle.special = true; currentBattle.tb26 = cfg; return true;
  }
  function startTrial(sc) {
    const d = S9 && S9.SC[sc]; if (!d) return;
    if (!(R() >= 2 && window.UNLOCK9 && UNLOCK9.on('sub'))) { showToast(window.sysLockMsg ? sysLockMsg('sub') : '金丹期方可挑戰輔修試煉。'); return; } if (S9.trialDone(sc)) { showToast('此試煉已通過。'); return; }
    launch({ kind: 'trial', sc, tier: Math.min(7, Math.max(2, X.tier())), name: `${d.trial}守關者`, emoji: d.tic || '🗻', label: d.trial, target: 1.5, skill: '試煉之威' });
  }
  function startSecret(key) {
    const SR = window.SR17; if (!SR) return; const df = SR.defs().find(x => x.key === key); if (!df) { showToast('此秘境已過期。'); return; }
    if (state.sr && state.sr.runs && state.sr.runs[key]) { showToast('此秘境今日已處理。'); return; }
    const tp = SR.TPL[df.ti];
    launch({ kind: 'secret', key, d: df.d, tier: SR.TIER(), name: `${tp.n}守關者`, emoji: tp.ic, label: `${tp.ic}${tp.n}`, target: [2, 1.6, 1.3][df.d] || 1.6, skill: '秘境凶威' });
  }
  /* 結算 */
  let RS = null;
  X.sheet('tbr', () => RS ? (RS.win ? '🏆 ' : '💀 ') + RS.title : '戰報', b => {
    if (!RS) { b.innerHTML = ''; return; }
    b.innerHTML = `<div style="text-align:center;line-height:1.7;margin-bottom:8px">${RS.sub}</div>${RS.lines.length ? `<div class="x5-cd" style="margin-bottom:10px"><b style="color:#fcd34d">戰利品</b>${RS.lines.map(x => `<div>${x}</div>`).join('')}</div>` : ''}<div class="x5-row">${RS.btns}</div>`;
  });
  function tbWin(B) {
    const c = B.tb26, lines = []; let title, sub, btns; if (!isQuietAuto()) audio.playFanfare();
    if (B.playerHp > 0) state.hp = Math.max(1, Math.floor(B.playerHp)); endBattle();
    if (c.kind === 'story') { try { saveGame(); updateTopBar(); } catch (e) { } setTimeout(() => c.onEnd(true), 350); return; }
    if (c.kind === 'trial') {
      S9.SCH().trial[c.sc] = 1; X.give({ stones: X.sb(c.tier) * 20, tfrag: 3, items: { rn_1: 2 } }, true).forEach(x => lines.push(x)); S9.gainDao(40); lines.push('☯ 道行 +40'); X.dirty();
      title = '試煉通過!'; sub = `你已可兼修【${S9.SC[c.sc].n}】。`; btns = `<button class="x5-btn am" data-x5="tb.school" style="flex:1">前往流派</button><button class="x5-btn gy" data-x5="tb.close" style="flex:1">離開</button>`;
    } else {
      window.SR17.arenaDone(c.key, true); S9.gainDao(10 + 10 * c.d); lines.push(`☯ 道行 +${10 + 10 * c.d}`);
      title = '親征大捷!'; sub = '戰報已備好,領取後獲得 ×1.5 親征戰利品。'; btns = `<button class="x5-btn am" data-x5="tb.claim" data-k="${c.key}" style="flex:1">📜 領取戰報</button>`;
    }
    RS = { win: true, title, sub, lines, btns }; saveGame(); try { updateTopBar(); renderInventory(); } catch (e) { } X.open('tbr');
  }
  function tbLose(B) {
    const c = B.tb26; state.hp = Math.max(1, Math.floor(calculateTotalStats().hp * .5)); endBattle();
    if (c.kind === 'story') { try { saveGame(); updateTopBar(); } catch (e) { } setTimeout(() => c.onEnd(false), 350); return; }
    RS = { win: false, title: c.kind === 'trial' ? '試煉失敗' : '功敗垂成', sub: c.kind === 'trial' ? '休整後再來挑戰吧。(無任何損失)' : '今日秘境尚未完成,可再次親征,或改派遣前往。(無任何損失)', lines: [], btns: `<button class="x5-btn am" data-x5="tb.again" style="flex:1">再戰一次</button><button class="x5-btn gy" data-x5="tb.close" style="flex:1">離開</button>` };
    saveGame(); try { updateTopBar(); } catch (e) { } X.open('tbr');
  }
  X.act('tb.close', () => X.close('tbr'));
  X.act('tb.school', () => { X.close('tbr'); X.open('school'); });
  X.act('tb.claim', t => { X.close('tbr'); if (window.SR17) SR17.claim(t.dataset.k); });
  X.act('tb.again', () => { X.close('tbr'); if (!last) return; if (last.kind === 'trial') startTrial(last.sc); else startSecret(last.key); });
  { XT.winBattle100 = _w => function () {
    const B = currentBattle; if (B && B.tb26) return tbWin(B);
    if (B && main() === 'pill' && B.playerHp > 0) B.playerHp = Math.min(B.playerMaxHp, B.playerHp + Math.floor(B.playerMaxHp * .05));
    return _w.apply(this, arguments);
  }; }
  { XT.loseBattle100 = _l => function () { const B = currentBattle; if (B && B.tb26) { if (window.effects && 0) return; return tbLose(B); } return _l.apply(this, arguments); }; }
  { const _f = playerBattleFlee; playerBattleFlee = function () { const B = currentBattle; if (B && B.tb26) { if (battleLock) return; endBattle(); if (B.tb26.kind === 'story') { setTimeout(() => B.tb26.onEnd(false), 350); return; } showToast('撤出戰鬥,無任何損失。'); return; } return _f.apply(this, arguments); }; }
  /* 戰場移除後的補償:天地異種 擊殺額外給靈寵蛋(元嬰起)與仙緣(化神起) */
  { XT.wbWin100 = _wbw => function () {
    const r = _wbw.apply(this, arguments), o = {}; if (R() >= 3) o.eggs = 1; if (R() >= 4) o.xian = (R() - 3) * 3;
    if (o.eggs || o.xian) { const L = X.give(o, true); logAdventure('🎁 天地異種 遺澤:' + L.join('、')); try { showToast('🎁 天地異種 遺澤:' + L.join('、')); } catch (e) { } }
    return r;
  }; }

  