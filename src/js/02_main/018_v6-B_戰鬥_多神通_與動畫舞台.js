/* ===== v6-B:戰鬥(多神通)與動畫舞台 ===== */
let skillCds = {}, _stageBid = null, _skBarSig = '';
const COUNTER_MAP = { wood: 'metal', earth: 'wood', water: 'earth', fire: 'water', metal: 'fire' };
const PLAYER_SVG = '<svg viewBox="0 0 64 90" width="64" height="90" xmlns="http://www.w3.org/2000/svg"><ellipse cx="32" cy="86" rx="17" ry="3.2" fill="#000" opacity=".4"/><path d="M19 42 Q32 35 45 42 L49 80 Q32 87 15 80 Z" fill="#e2e8f0"/><path d="M21 46 L43 46 L44 54 L20 54Z" fill="#14b8a6"/><path d="M26 54 L30 82 M38 54 L34 82" stroke="#94a3b8" stroke-width="1.2"/><circle cx="32" cy="27" r="10" fill="#fde2c8"/><path d="M21 25 Q22 10 32 12 Q42 10 43 25 Q38 17 32 19 Q26 17 21 25Z" fill="#1e293b"/><circle cx="32" cy="9" r="4.2" fill="#1e293b"/><rect x="30" y="4" width="4" height="3" rx="1" fill="#fbbf24"/><circle cx="28" cy="28" r="1.3" fill="#0f172a"/><circle cx="36" cy="28" r="1.3" fill="#0f172a"/><path d="M29 33 q3 2 6 0" stroke="#b45309" stroke-width="1" fill="none"/><g class="bs-sword"><path d="M42 50 L56 38" stroke="#fde2c8" stroke-width="4.5" stroke-linecap="round"/><rect x="55" y="6" width="3.4" height="36" rx="1.2" fill="#e2e8f0" stroke="#94a3b8" stroke-width=".6"/><rect x="51" y="40" width="11" height="3" rx="1" fill="#fbbf24"/><path d="M56.7 6 l0 -3" stroke="#e2e8f0" stroke-width="2"/></g></svg>';
function stageEl(id) { return document.getElementById(id); }
function stageOn() { const s = stageEl('battle-stage'); return (s && s.offsetParent && !isQuietAuto()) ? s : null; }
const fx = {
  pulse(el, cls, ms) { if (!el) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); setTimeout(() => el.classList.remove(cls), ms / (state.battleSpeed || 1) + 60); },
  setup() {
    const st = stageEl('battle-stage'), B = currentBattle; if (!st || !B) return;
    const m = B.monster, area = AREAS_DATA[state.currentArea] || {}, pal = ELEM_PAL[m.isDemon ? 'fire' : (B.isTower ? 'earth' : area.element)] || ELEM_PAL.metal;
    st.style.background = `linear-gradient(180deg,${pal[1]} 0%,#0b1220 64%,#050810 100%)`;
    st.style.setProperty('--sp', state.battleSpeed || 1);
    st.style.setProperty('--dx', Math.round((st.clientWidth || 300) * 0.4) + 'px');
    const pet = state.pets && state.pets[state.activePet] && PETS.find(x => x.id === state.activePet);
    st.innerHTML = `<div class="bs-moon" style="background:${pal[2]}"></div><div class="bs-floor"></div>
      <div id="bs-p" class="bs-u bs-pl">${PLAYER_SVG}<div id="bs-pst" class="bs-st"></div></div>
      <div id="bs-pet" class="bs-pet">${pet ? pArt(pet) : ''}</div>
      <div id="bs-m" class="bs-u bs-mo ${m.isBoss ? 'boss' : ''}"><div class="bs-memo">${m.emoji || '🐺'}</div><div id="bs-mst" class="bs-st"></div></div>
      <div id="bs-fx" class="bs-fx"></div>`;
    this.status();
  },
  status() {
    const B = currentBattle; if (!B || !stageOn()) return;
    const p = stageEl('bs-pst'), m = stageEl('bs-mst'), pl = stageEl('bs-p');
    if (p) p.innerText = [B.shield > 0 ? `🛡${formatNum(B.shield)}` : '', B.buff && B.buff.turns > 0 ? `💢×${B.buff.turns}` : ''].filter(Boolean).join(' ');
    if (m) m.innerText = [B.dot && B.dot.turns > 0 ? `🔥×${B.dot.turns}` : '', B.stun > 0 ? '💫' : ''].filter(Boolean).join(' ');
    if (pl) { pl.classList.toggle('shielded', B.shield > 0); pl.classList.toggle('raged', !!(B.buff && B.buff.turns > 0)); }
    const mo = stageEl('bs-m'); if (mo) { mo.classList.toggle('frozen', B.stun > 0); mo.classList.toggle('burning', !!(B.dot && B.dot.turns > 0)); }
  },
  num(text, cls, side) {
    const f = stageEl('bs-fx'); if (!f || !stageOn()) return;
    const d = document.createElement('div'); d.className = 'bs-num ' + cls; d.innerText = text;
    d.style.left = (side === 'p' ? 16 + Math.random() * 10 : 62 + Math.random() * 14) + '%'; d.style.top = (side === 'p' ? 28 : 18 + Math.random() * 12) + '%';
    f.appendChild(d); setTimeout(() => d.remove(), 1000 / (state.battleSpeed || 1) + 80);
  },
  spawn(html, ms, cls) {
    const f = stageEl('bs-fx'); if (!f || !stageOn()) return;
    const d = document.createElement('div'); d.className = 'bs-e ' + (cls || ''); d.innerHTML = html; f.appendChild(d);
    setTimeout(() => d.remove(), ms / (state.battleSpeed || 1) + 80);
  },
  playerAct(sk) {
    if (!stageOn()) return; const st = stageEl('battle-stage'); st.style.setProperty('--sp', state.battleSpeed || 1);
    const isHit = !sk || ['atk', 'burn', 'stun', 'drain'].includes(sk.type), key = sk ? sk.fx : 'slash';
    if (isHit) { this.pulse(stageEl('bs-p'), 'atk', 560); }
    else { this.pulse(stageEl('bs-p'), 'cast', 700); }
    if (key === 'guard' || key === 'chaos') this.spawn('<div class="bs-ring" style="border-color:#fbbf24"></div>', 800, 'onp');
    if (key === 'heal') for (let i = 0; i < 6; i++) this.spawn(`<span style="left:${10 + i * 8}%;animation-delay:${i * 90}ms" class="bs-plus">✚</span>`, 1100, 'onp');
    if (key === 'rage') this.spawn('<div class="bs-ring" style="border-color:#ef4444;box-shadow:0 0 18px #ef4444"></div>', 900, 'onp');
    if (key === 'fire') this.spawn('<div class="bs-proj">🔥</div>', 520);
    if (key === 'ice') this.spawn('<div class="bs-proj">❄️</div>', 520);
    if (key === 'blood') this.spawn('<div class="bs-proj">🩸</div>', 520);
  },
  hit(d, crit, key, i) {
    if (!stageOn()) return;
    const mo = stageEl('bs-m'); this.pulse(mo, 'hit', 380);
    const map = {
      slash: '<div class="bs-slash"></div>', flow: `<div class="bs-slash g" style="--r:${-40 + (i % 3) * 38}deg"></div>`,
      fire: '<div class="bs-burst">🔥</div>', ice: '<div class="bs-burst ice">❄️</div>', blood: '<div class="bs-slash r"></div>',
      thunder: '<div class="bs-bolt"></div>', god: '<div class="bs-bolt big"></div>', swords: `<div class="bs-sword-drop" style="left:${40 + (i * 11) % 36}%">🗡️</div>`,
      quake: '<div class="bs-crack"></div>', void: '<div class="bs-vortex"></div>', pet: '<div class="bs-burst">✨</div>'
    };
    this.spawn(map[key] || map.slash, 650, 'onm');
    if (key === 'thunder' || key === 'god' || key === 'quake' || key === 'void') this.pulse(stageEl('battle-stage'), key === 'quake' ? 'shake' : 'flash', 420);
    this.num((crit ? '💥' : '') + formatNum(d), crit ? 'crit' : (key === 'pet' ? 'pet' : 'dmg'), 'm');
  },
  monsterAtk(special) {
    if (!stageOn()) return; this.pulse(stageEl('bs-m'), 'matk', 520);
    if (special) this.spawn('<div class="bs-burst" style="filter:hue-rotate(260deg)">💢</div>', 600, 'onp');
  },
  playerHit() { if (!stageOn()) return; this.pulse(stageEl('bs-p'), 'phit', 360); this.spawn('<div class="bs-slash r" style="--r:30deg"></div>', 500, 'onp'); },
  petStrike() { if (!stageOn()) return; this.pulse(stageEl('bs-pet'), 'pa', 620); },
  stunned() { if (stageOn()) this.num('定身!', 'info', 'm'); },
  die() { if (stageOn()) stageEl('bs-m')?.classList.add('die'); }
};
// fx 的 setup/playerAct/playerHit:原為多層包裝,依原安裝順序(內→外)組合
//   setup:     fxSetup76 v7.6 生成圖背景/立繪/妖魔(026)、fxSetup82 v8.2 女修立繪(033)、fxSetup100 v10.0 戰場背景(050)、
//              fxSetup170 v17.0 劇情敵人立繪(076)、fxSetup45 v45 怪物生成圖(script 11)、fxSetup74 v74 塔頂心魔立繪(script 23)
//   playerAct: fxAct76 v7.6 出手姿勢(026)、fxAct100 v10.0 技能特效貼圖(050)、fxAct102 v10.2 技能名橫幅(053)
//   playerHit: fxHit76 v7.6 受擊姿勢(026)、fxHit100 v10.0 受擊特效(050)
fx._core = { setup: fx.setup, playerAct: fx.playerAct, playerHit: fx.playerHit };
fx.setup = function () { return XT.chain(this, arguments, fx._core.setup, [XT.fxSetup76, XT.fxSetup82, XT.fxSetup100, XT.fxSetup170, XT.fxSetup45, XT.fxSetup74]); };
fx.playerAct = function () { return XT.chain(this, arguments, fx._core.playerAct, [XT.fxAct76, XT.fxAct100, XT.fxAct102]); };
fx.playerHit = function () { return XT.chain(this, arguments, fx._core.playerHit, [XT.fxHit76, XT.fxHit100]); };
function battleSetup() {
  const B = currentBattle; skillCds = {}; B.timers = []; B.shield = 0; B.buff = null; B.dot = null; B.stun = 0; _skBarSig = '';
  fx.setup();
}
function bT(fn, ms) {
  const B = currentBattle; if (!B) return; const bid = B.id;
  const h = setTimeout(() => { if (!currentBattle || currentBattle.id !== bid) return; fn(); }, ms);
  (B.timers = B.timers || []).push(h);
}
function renderSkillBar() {
  const bar = document.getElementById('battle-skill-bar'); if (!bar || !currentBattle) return;
  const S = skState(), slots = skSlots();
  const sig = JSON.stringify([S.equipped.slice(0, slots), skillCds, battleLock, S.learned]);
  if (sig === _skBarSig) return; _skBarSig = sig;
  let h = '';
  S.equipped.slice(0, slots).forEach(id => {
    if (!id || !S.learned[id]) return;
    const sk = SK_BY_ID[id], cd = skillCds[id] || 0, c = skCalc(sk, S.learned[id].lv), on = cd <= 0 && !battleLock, col = sk.el ? SK_EL_COLOR[sk.el] : '#c4b5fd';
    h += `<button data-skbtn="${id}" ${on ? '' : 'disabled'} class="tap-effect py-1.5 px-1 rounded border text-xs font-bold flex items-center justify-center space-x-1 ${on ? 'bg-slate-900 text-amber-100' : 'bg-slate-900 text-slate-500 opacity-60'}" style="border-color:${col}"><span class="w-6 h-6 inline-block ic108">${skArt(id, !on && cd > 0)}${cd > 0 ? `<span class="cd108">${cd}</span>` : ''}</span><span class="nm108">${sk.name}</span></button>`;
  });
  bar.innerHTML = h || '<div class="col-span-2 text-center text-[11px] text-slate-500">尚未裝備神通,請至人物→修行→神通配置</div>';
}
function updateBattleUI() {
  if (!currentBattle) return;
  const B = currentBattle, m = B.monster;
  if (_stageBid !== B.id) { _stageBid = B.id; battleSetup(); }
  const stg = stageEl('battle-stage'); if (stg) stg.style.setProperty('--sp', state.battleSpeed || 1);
  document.getElementById('battle-round-counter').innerText = `第 ${B.round} 回合`;
  const mPct = Math.max(0, Math.floor((m.curHp / m.hp) * 100));
  document.getElementById('monster-hp-text').innerText = `${formatNum(m.curHp)}/${formatNum(m.hp)}`;
  document.getElementById('monster-hp-fill').style.width = `${mPct}%`;
  const pPct = Math.max(0, Math.floor((B.playerHp / B.playerMaxHp) * 100));
  document.getElementById('player-battle-hp-text').innerText = `${formatNum(B.playerHp)}/${formatNum(B.playerMaxHp)}${B.shield > 0 ? ` 🛡${formatNum(B.shield)}` : ''}`;
  document.getElementById('player-battle-hp-fill').style.width = `${pPct}%`;
  renderSkillBar();
  const atkBtn = document.getElementById('btn-battle-attack'); if (atkBtn) atkBtn.disabled = battleLock;
  const healBtn = document.getElementById('btn-battle-heal'); if (healBtn) healBtn.disabled = battleLock;
}
function playerBattleAttack(arg) {
  let id = null;
  if (typeof arg === 'string') id = arg;
  else if (arg === true) id = skState().equipped.slice(0, skSlots()).find(x => x && skState().learned[x]) || null;
  playerAct(id);
}
// playerAct:原為 3 層包裝,依原安裝順序(內→外)組合:
//   playerAct100     v10.0 流派心法/本命絕學(051)
//   playerAct102     v10.2 流派神通未生效擋下(054)
//   playerAct101     v10.1 神通/絕學演出後才出手(script 07)
function playerAct(id) { return XT.chain(this, arguments, playerActCore, [XT.playerAct100, XT.playerAct102, XT.playerAct101]); }
function playerActCore(id) {
  if (!currentBattle || battleLock) return;
  const B = currentBattle, m = B.monster, S = skState(), sk = id ? SK_BY_ID[id] : null;
  if (sk && !S.learned[id]) return;
  if (sk && (skillCds[id] || 0) > 0) { showToast(`【${sk.name}】冷卻中!`); return; }
  audio.init(); if (!isQuietAuto() && !SFX.play(sk ? 'sfx_skill' : 'sfx_hit')) audio.playSlash();
  battleLock = true; updateBattleUI();
  const stats = calculateTotalStats(), sp = state.battleSpeed || 1, lv = sk ? S.learned[id].lv : 0, c = sk ? skCalc(sk, lv) : null;
  const buffMult = (B.buff && B.buff.turns > 0) ? 1 + B.buff.pct : 1, atk = Math.floor(stats.atk * buffMult);
  const base = Math.max(1, Math.floor((atk * atk) / (atk + m.def)));
  // 五行:靈根克制或神通屬性克制各 +25%,兩者並存 +40%
  const root = state.root || { metal: 35, wood: 45, water: 55, fire: 60, earth: 30 }, cEl = COUNTER_MAP[m.element];
  const rootC = cEl && (root[cEl] || 0) >= 60, skC = sk && sk.el && cEl === sk.el;
  const em = (rootC && skC) ? 1.4 : (rootC || skC) ? 1.25 : 1, et = em > 1 ? ` (五行相剋+${Math.round((em - 1) * 100)}%！)` : '';
  let mults = [];
  if (!sk) mults = [1]; else if (sk.type === 'atk') mults = Array(c.hits).fill(c.mult); else if (c.mult) mults = [c.mult];
  const hits = mults.map(x => { const crit = Math.random() * 100 < stats.crit; return { d: Math.max(1, Math.floor(base * x * em * (window.sectDmgMult ? sectDmgMult(sk) : 1) * (crit ? (window.sectCritMult ? sectCritMult() : 1.5) : 1))), crit }; });
  const total = hits.reduce((a, h) => a + h.d, 0), name = sk ? `【${sk.name}】` : '仙劍普攻';
  if (window.sectLS) { const _ls = sectLS(); if (_ls > 0) B.playerHp = Math.min(B.playerMaxHp, B.playerHp + Math.floor(total * _ls)); }
  fx.playerAct(sk);
  const windup = 260 / sp, gap = 180 / sp, key = sk ? sk.fx : 'slash';
  if (hits.length) logAdventure(`🗡️ 道友施展${name}，對【${m.name}】${hits.length > 1 ? `連擊 ${hits.length} 次，` : ''}造成 ${formatNum(total)} 點傷害${et}${hits.some(h => h.crit) ? ' (會心一擊！)' : ''}！`);
  else logAdventure(`✨ 道友施展${name}！`);
  if (sk) { skillCds[id] = c.cd; skGainExp(id); }
  hits.forEach((h, i) => bT(() => { m.curHp = Math.max(0, m.curHp - h.d); fx.hit(h.d, h.crit, key, i); updateBattleUI(); }, windup + i * gap));
  const castEnd = hits.length ? windup + (hits.length - 1) * gap + 160 / sp : 380 / sp;
  bT(() => {
    // 附加效果
    if (sk) {
      if (sk.type === 'burn') { B.dot = { dmg: Math.max(1, Math.floor(base * c.dot)), turns: c.turns }; logAdventure(`🔥 【${m.name}】身中業火，${c.turns} 回合內持續灼燒！`); }
      else if (sk.type === 'stun') { const resist = m.isBoss && Math.random() < 0.4; if (resist) { fx.num('抵抗', 'info', 'm'); logAdventure(`🛡️ 【${m.name}】魔威濃重，抵抗了控制！`); } else { B.stun = m.isBoss ? Math.min(1, c.stun) : c.stun; fx.stunned(); logAdventure(`💫 【${m.name}】被定身 ${B.stun} 回合！`); } }
      else if (sk.type === 'shield') { B.shield = Math.max(B.shield || 0, Math.floor(B.playerMaxHp * c.pct)); fx.num('+🛡' + formatNum(B.shield), 'heal', 'p'); logAdventure(`🛡️ 護體靈光籠罩全身，獲得 ${formatNum(B.shield)} 點護盾。`); }
      else if (sk.type === 'heal') { const h = Math.floor(B.playerMaxHp * c.pct); B.playerHp = Math.min(B.playerMaxHp, B.playerHp + h); fx.num('+' + formatNum(h), 'heal', 'p'); logAdventure(`🌿 生機湧現，恢復 ${formatNum(h)} 點氣血。`); }
      else if (sk.type === 'drain') { const h = Math.floor(total * c.steal); B.playerHp = Math.min(B.playerMaxHp, B.playerHp + h); fx.num('+' + formatNum(h), 'heal', 'p'); logAdventure(`🩸 吸取精血，恢復 ${formatNum(h)} 點氣血。`); }
      else if (sk.type === 'buff') { B.buff = { pct: c.pct, turns: c.turns }; logAdventure(`💢 戰意沸騰！攻擊提升 ${p100(c.pct)}%，持續 ${c.turns} 回合。`); }
    }
    // 靈寵協同
    const pd = petStrike();
    if (pd) { fx.petStrike(); bT(() => { m.curHp = Math.max(0, m.curHp - pd); fx.hit(pd, false, 'pet', 0); updateBattleUI(); }, 180 / sp); }
    bT(() => {
      fx.status(); updateBattleUI();
      if (m.curHp <= 0) { fx.die(); bT(() => { battleLock = false; winBattle(); }, 320 / sp); return; }
      bT(monsterCounterAttack, 220 / sp);
    }, pd ? 400 / sp : 60 / sp);
  }, castEnd);
}
function monsterCounterAttack() {
  if (!currentBattle) { battleLock = false; return; }
  const B = currentBattle, m = B.monster, sp = state.battleSpeed || 1, stats = calculateTotalStats();
  const finish = () => {
    B.round++;
    Object.keys(skillCds).forEach(k => { if (skillCds[k] > 0) skillCds[k]--; });
    if (B.buff && B.buff.turns > 0) { B.buff.turns--; if (B.buff.turns <= 0) B.buff = null; }
    battleLock = false; fx.status(); updateBattleUI();
    if (B.playerHp <= 0) loseBattle();
    else if (state.autoBattle || state.autoExplore) scheduleAutoBattleTurn();
  };
  if (B.dot && B.dot.turns > 0) {
    const d = B.dot.dmg; B.dot.turns--; m.curHp = Math.max(0, m.curHp - d); if (B.dot.turns <= 0) B.dot = null;
    logAdventure(`🔥 業火灼燒【${m.name}】，造成 ${formatNum(d)} 點傷害。`); fx.num(formatNum(d), 'burn', 'm'); fx.pulse(stageEl('bs-m'), 'hit', 380); updateBattleUI();
    if (m.curHp <= 0) { fx.die(); bT(() => { battleLock = false; winBattle(); }, 320 / sp); return; }
  }
  if (B.stun > 0) { B.stun--; logAdventure(`💫 【${m.name}】動彈不得，錯失行動！`); fx.num('無法行動', 'info', 'm'); bT(finish, 420 / sp); return; }
  let mDmg = Math.max(1, Math.floor((m.atk * m.atk) / (m.atk + stats.def)));
  if (window.sectDodge && Math.random() < sectDodge()) { mDmg = 0; fx.num('閃避', 'info', 'p'); }
  { const _root = state.root || {}, _c = COUNTER_MAP[m.element]; if (_c && (_root[_c] || 0) >= 60) mDmg = Math.max(1, Math.floor(mDmg * 0.85)); }
  const special = Math.random() < 0.35 && m.skillName;
  if (special) mDmg = Math.floor(mDmg * 1.4);
  fx.monsterAtk(special);
  bT(() => {
    let dmg = mDmg, absorbed = 0;
    if (B.shield > 0) { absorbed = Math.min(B.shield, dmg); B.shield -= absorbed; dmg -= absorbed; fx.num('吸收 ' + formatNum(absorbed), 'abs', 'p'); }
    B.playerHp = Math.max(0, B.playerHp - dmg);
    if (dmg > 0) { fx.num('-' + formatNum(dmg), 'pdmg', 'p'); fx.playerHit(); if (!isQuietAuto()) SFX.play('sfx_hurt'); }
    logAdventure(special ? `🩸 【${m.name}】發動妖魔絕技【${m.skillName}】，造成 ${formatNum(dmg)} 點傷害${absorbed ? `(護盾吸收 ${formatNum(absorbed)})` : ''}！` : `🩸 【${m.name}】兇狠揮爪撕咬，造成 ${formatNum(dmg)} 點傷害${absorbed ? `(護盾吸收 ${formatNum(absorbed)})` : ''}！`);
    updateBattleUI(); bT(finish, 260 / sp);
  }, 280 / sp);
}
function chooseAutoAction() {
  const B = currentBattle, m = B.monster, S = skState();
  const ready = id => id && S.learned[id] && !(skillCds[id] > 0);
  const eq = S.equipped.slice(0, skSlots()).filter(ready);
  const hp = B.playerHp / B.playerMaxHp, mp = m.curHp / m.hp, pick = t => eq.find(id => SK_BY_ID[id].type === t);
  if (hp < 0.45) { const h = pick('heal'); if (h) return h; }
  if (hp < 0.4 && (state.inventory['pill_4'] || 0) > 0) return 'PILL';
  if (!(B.shield > 0) && (m.isBoss || hp < 0.7)) { const g = pick('shield'); if (g) return g; }
  if (!(B.buff && B.buff.turns > 0) && mp > 0.4) { const b = pick('buff'); if (b) return b; }
  if (!(B.stun > 0) && mp > 0.35 && (m.isBoss || hp < 0.8)) { const s = pick('stun'); if (s) return s; }
  if (!(B.dot && B.dot.turns > 0) && mp > 0.4) { const f = pick('burn'); if (f) return f; }
  if (hp < 0.6) { const d = pick('drain'); if (d) return d; }
  const dm = eq.filter(id => ['atk', 'burn', 'stun', 'drain'].includes(SK_BY_ID[id].type)).sort((a, b) => skScore(b) - skScore(a));
  return dm.length ? dm[0] : null;
}
function scheduleAutoBattleTurn() {
  if (!currentBattle || battleLock) return;
  const sp = state.battleSpeed || 1; clearTimeout(battleAutoTimer);
  battleAutoTimer = setTimeout(() => {
    if (!currentBattle || battleLock) return;
    const a = chooseAutoAction();
    if (a === 'PILL') playerBattleHeal(); else playerAct(a);
  }, 450 / sp);
}

