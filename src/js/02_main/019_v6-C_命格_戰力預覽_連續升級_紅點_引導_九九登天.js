/* ===== v6-C:命格(戰力預覽/連續升級)、紅點、引導、九九登天塔、備份、明細 ===== */
function cpNow() { return calculateTotalStats().combatPower; }
function cpTxt(c0, c1) { return `戰力 ${formatNum(c0)} → ${formatNum(c1)} <span class="text-emerald-300">(${c1 >= c0 ? '+' : ''}${formatNum(c1 - c0)})</span>`; }
function bodyUnl() { return (state.realmIdx || 0) >= REALM_DATA.length - 1; }   /* v109 大羅金仙:煉體無上限 */
function bodyCap() { return bodyUnl() ? 1e9 : ((state.realmIdx || 0) + 1) * 5; }
function bodyPlan() { let b = state.body || 0, s = state.stones, n = 0, cost = 0; const cap = bodyCap(); while (b < cap) { const c = Math.floor(150 * Math.pow(1.3, b)); if (s < c) break; s -= c; cost += c; b++; n++; } return { n, cost }; }
function petPlan(id) { const o = (state.pets || {})[id]; if (!o) return { n: 0, cost: 0 }; let lv = o.lv, s = state.stones, n = 0, cost = 0; while (lv < petCap()) { const c = petUpCost(lv); if (s < c) break; s -= c; cost += c; lv++; n++; } return { n, cost }; }
function cpBody(n) { const b0 = state.body || 0, c0 = cpNow(); state.body = b0 + n; const c1 = cpNow(); state.body = b0; return [c0, c1]; }
function cpPet(id, n) { const o = state.pets[id], l0 = o.lv, c0 = cpNow(); o.lv = l0 + n; const c1 = cpNow(); o.lv = l0; return [c0, c1]; }
function extParts() {
  const P = { body: { hpP: 0, atkP: 0, defP: 0 }, treasure: { hpP: 0, atkP: 0, defP: 0, qiP: 0, crit: 0, n: 0 }, set: 0, pet: { hpP: 0, atkP: 0, defP: 0, qiP: 0, name: '' } };
  const b = state.body || 0; P.body.hpP = b * .03; P.body.defP = b * .02; P.body.atkP = b * .005;
  TREASURES.forEach(t => { if ((state.treasures || {})[t.id]) { P.treasure.n++; ['hpP', 'atkP', 'defP', 'qiP', 'crit'].forEach(k => P.treasure[k] += t[k] || 0); } });
  P.set = setBonus(P.treasure.n); P.pill = pillPerm();
  const p = state.pets && state.pets[state.activePet], pd = PETS.find(x => x.id === state.activePet);
  if (p && pd) { ['hpP', 'atkP', 'defP', 'qiP'].forEach(k => P.pet[k] += (pd[k] || 0) * p.lv); P.pet.name = `${pd.n} Lv.${p.lv}`; }
  return P;
}
function renderMingBody() {
  const b = state.body || 0, cap = bodyCap(), s = stageIdx(b), I = STAGE_INFO[s], cost = bodyCost(), can = b < cap && state.stones >= cost, plan = bodyPlan();
  const lo = s < 5 ? s * 8 : 40 + Math.floor((b - 40) / 8) * 8, hi = lo + 8, prog = Math.min(100, Math.max(0, ((b - lo) / (hi - lo)) * 100));
  const [c0, c1] = cpBody(1), pv = b < cap ? `<div class="text-[11px] text-slate-300 mt-1">錘鍊一次:${cpTxt(c0, c1)}</div>` : '';
  let h = `<div class="rounded-xl border border-slate-700 bg-gradient-to-b from-slate-900 to-slate-950 p-3 text-center">
    <div class="w-32 h-32 mx-auto glw" style="--c:${I.c1}">${bodyArt(s)}</div>
    <div class="font-serif-tc font-black text-amber-200 text-base mt-1">${I.n} · 第 ${b} 重</div>
    <div class="text-[11px] text-slate-400">${I.d}</div>
    <div class="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800 mt-2"><div class="h-full rounded-full" style="width:${prog}%;background:linear-gradient(90deg,${I.c2},${I.c1})"></div></div>
    <div class="grid grid-cols-3 gap-1 text-[11px] mt-2"><div class="bg-slate-900 rounded p-1 text-emerald-300">氣血<br>+${b * 3}%</div><div class="bg-slate-900 rounded p-1 text-sky-300">防禦<br>+${b * 2}%</div><div class="bg-slate-900 rounded p-1 text-rose-300">攻擊<br>+${(b * .5).toFixed(1)}%</div></div>
    ${pv}<div class="mt-2 space-x-2">${eBtn('body-up', '', b >= cap ? `需突破境界(上限 ${cap} 重)` : `🔨 錘鍊(${formatNum(cost)} 靈石)`, can)}${b < cap ? eBtn('body-max', '', plan.n > 1 ? `連續錘鍊 ×${plan.n}` : '連續錘鍊', plan.n > 1, 'bg-gradient-to-r from-orange-600 to-red-500 text-white') : ''}</div>
    ${plan.n > 1 ? `<div class="text-[10px] text-slate-500 mt-1">連續錘鍊 ×${plan.n}:共 ${formatNum(plan.cost)} 靈石</div>` : ''}
    <div class="text-[10px] text-slate-500 mt-1">${bodyUnl() ? '已至大羅金仙,肉身錘鍊再無上限,唯每重所耗靈石倍增。轉世後需重新錘鍊。' : '每個大境界可多煉 5 重,轉世後需重新錘鍊。'}</div></div><div class="grid grid-cols-3 gap-2 mt-2">`;
  STAGE_INFO.forEach((st, i) => {
    const on = b >= i * 8;
    h += `<div class="rounded-lg border p-1.5 text-center ${on ? 'border-amber-500/50 bg-slate-900' : 'border-slate-800 bg-slate-950 opacity-60'}"><div class="w-12 h-12 mx-auto ${on ? '' : 'grayscale'}">${bodyArt(i)}</div><div class="text-[11px] font-bold ${on ? 'text-amber-200' : 'text-slate-500'}">${st.n}</div><div class="text-[10px] text-slate-500">${i * 8}${i === 5 ? '+' : '~' + (i * 8 + 7)} 重</div></div>`;
  });
  return h + '</div>';
}
function renderMingPet() {
  const eggs = state.eggs || 0, ap = state.pets && state.pets[state.activePet], apd = PETS.find(x => x.id === state.activePet), cap = petCap();
  let h = `<div class="rounded-xl border border-slate-700 bg-gradient-to-b from-slate-900 to-slate-950 p-3 text-center">`;
  if (ap && apd) {
    const cost = petUpCost(ap.lv), c1 = PET_ART[apd.id][0], plan = petPlan(apd.id), [p0, p1] = ap.lv < cap ? cpPet(apd.id, 1) : [0, 0];
    h += `<div class="w-28 h-28 mx-auto fl glw" style="--c:${c1}">${pArt(apd)}</div><div class="font-serif-tc font-black text-amber-200 text-base mt-1">${apd.n} · Lv.${ap.lv}</div>
      <div class="text-[11px] text-emerald-300">${petDesc(apd, ap.lv)}</div>
      <div class="text-[11px] text-rose-300">協同出擊:每次出手後追加 ${Math.round((apd.s + .01 * ap.lv) * 100)}% 攻擊傷害</div>
      ${ap.lv < cap ? `<div class="text-[11px] text-slate-300 mt-1">升一級:${cpTxt(p0, p1)}</div>` : ''}
      <div class="mt-2 space-x-2">${eBtn('pet-up', apd.id, ap.lv >= cap ? `已達上限 Lv.${cap}(境界提升可再升)` : `<i class="ii ui ii-c138_up"></i> 餵養升級(${formatNum(cost)} 靈石)`, ap.lv < cap && state.stones >= cost)}${ap.lv < cap ? eBtn('pet-max', apd.id, plan.n > 1 ? `連續升級 ×${plan.n}` : '連續升級', plan.n > 1, 'bg-gradient-to-r from-orange-600 to-red-500 text-white') : ''}</div>`;
  } else h += `<div class="text-slate-500 text-xs py-6">尚無出戰靈寵,孵化靈寵蛋獲得第一位夥伴。</div>`;
  h += `</div><div class="rounded-xl border border-slate-700 bg-slate-900 p-3 mt-2 flex items-center space-x-3"><div class="w-16 h-16 ${eggs > 0 ? 'wob' : 'grayscale opacity-60'}">${eggArt()}</div>
    <div class="flex-1"><div class="text-xs font-bold text-amber-200">靈寵蛋 × ${eggs}</div><div class="text-[10px] text-slate-500">來源:妖魔掉落(Boss 較高)、境界突破、離線歷練、九九登天塔。孵到重複靈寵則該寵 +1 級。</div></div>${eBtn('pet-hatch', '', '孵化', eggs > 0, 'bg-gradient-to-r from-pink-600 to-rose-500 text-white')}</div>
    <div class="grid grid-cols-2 gap-2 mt-2">`;
  PETS.forEach(p => {
    const o = (state.pets || {})[p.id], act = state.activePet === p.id;
    h += `<div class="rounded-xl border p-2 text-center ${act ? 'border-amber-400 bg-slate-900' : o ? 'border-slate-600 bg-slate-900' : 'border-slate-800 bg-slate-950'}"><div class="relative w-14 h-14 mx-auto">${pArt(p, !o)}${o ? '' : '<div class="absolute inset-0 flex items-center justify-center text-slate-400 text-xl font-bold">?</div>'}</div>
      <div class="text-xs font-bold mt-1 ${o ? 'text-amber-200' : 'text-slate-500'}">${o ? `${p.n} Lv.${o.lv}` : '未孵化'}</div>
      <div class="text-[10px] ${o ? 'text-emerald-300' : 'text-slate-600'}">${o ? petDesc(p, o.lv) : '???'}</div>
      ${o ? `<div class="mt-1">${eBtn('pet-act', p.id, act ? '出戰中' : '出戰', !act, 'bg-slate-700 text-amber-300')}</div>` : ''}</div>`;
  });
  return h + '</div>';
}
function redFlags() {
  const f = {}, ap = state.pets && state.pets[state.activePet];
  f.body = (state.body || 0) < bodyCap() && state.stones >= bodyCost();
  f.treasure = Object.keys(state.treasures || {}).length > ((state.uiSeen || {}).treas || 0) || canSynth();
  f.pet = (state.eggs || 0) > 0 || !!(ap && ap.lv < petCap() && state.stones >= petUpCost(ap.lv));
  f['tab-ming'] = f.body || f.treasure || f.pet;
  f['tab-techniques'] = skAnyAlert() || f.body || !!(window.CH51 && CH51.alert());
  f['tab-adventure'] = (state.pendingEvents || []).length > 0 || wbReady();
  f['tab-abode'] = !!(window.AB53 && AB53.alert()) || f.body || f.treasure || f.pet;
  f['tab-records'] = !!(window.RC54 && RC54.alert());
  f['tab-crafting'] = !!(window.CR52 && CR52.alert && CR52.alert());
  f['tab-inventory'] = Object.keys(state.inventory || {}).some(k => k.startsWith('wbox_') && state.inventory[k] > 0);
  // —— 擴充步驟(原為 2 層包裝)——
  XT.flags85Garden && XT.flags85Garden(f);   // v8.5 靈田可收成 → 洞府紅點(034)
  XT.flags87Secret && XT.flags87Secret(f);   // v8.7 秘境派遣完成 → 歷練紅點(036)
  return f;
}
function updateRedDots() {
  const f = redFlags();
  document.querySelectorAll('.nav-tab-btn').forEach(b => {
    const t = b.getAttribute('data-tab'); let d = b.querySelector('.rd');
    if (!d) { d = document.createElement('span'); d.className = 'rd'; b.appendChild(d); b.style.position = 'relative'; }
    d.style.display = f[t] ? 'block' : 'none';
  });
  const sb = document.getElementById('subtab-skills-btn'); if (sb) sb.dataset.dot = skAnyAlert() ? '1' : '';
}
function renderExt(force) {
  const root = document.getElementById('ming-root');
  if (root && root.offsetParent) {
    if (mingTab === 'treasure') { state.uiSeen = state.uiSeen || {}; state.uiSeen.treas = Object.keys(state.treasures || {}).length; }
    const X = extStats(), F = redFlags(), costs = [state.stones >= bodyCost(), ...PETS.map(p => { const o = (state.pets || {})[p.id]; return o ? state.stones >= petUpCost(o.lv) : 0; })];
    const sig = JSON.stringify([mingTab, state.body, state.treasures, state.pets, state.activePet, state.eggs, state.realmIdx, costs, F.treasure, state.tfrag, state.daoPoints, tFilter, state.pillUse]);
    if (force || sig !== _mingSig) {
      _mingSig = sig;
      const tabs = [['body', '🦴 煉體'], ['treasure', '💠 法寶'], ['pet', '🐾 靈寵']].map(([k, n]) => `<button data-act="ming-tab" data-id="${k}" class="relative flex-1 py-1.5 rounded-lg text-xs font-bold ${mingTab === k ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'}">${n}${F[k] && mingTab !== k ? '<span class="rd" style="display:block;right:10%;top:3px"></span>' : ''}</button>`).join('');
      const sum = `<div class="grid grid-cols-5 gap-1 text-center text-[10px] mb-2"><div class="bg-slate-900 rounded p-1 text-emerald-300">氣血<br>+${pct(X.hpP)}%</div><div class="bg-slate-900 rounded p-1 text-rose-300">攻擊<br>+${pct(X.atkP)}%</div><div class="bg-slate-900 rounded p-1 text-sky-300">防禦<br>+${pct(X.defP)}%</div><div class="bg-slate-900 rounded p-1 text-teal-300">吐納<br>+${pct(X.qiP)}%</div><div class="bg-slate-900 rounded p-1 text-amber-300">戰力<br>${formatNum(cpNow())}</div></div>`;
      const page = mingTab === 'body' ? renderMingBody() : mingTab === 'treasure' ? renderMingTreasure() : renderMingPet();
      document.getElementById('ming-content').innerHTML = `<div class="flex space-x-1 mb-2">${tabs}</div>${sum}${page}`;
    }
  }
  const st = document.getElementById('ext-story');
  if (st && st.offsetParent) {
    const btn = (k) => `<button data-act="story-play" data-id="${k}" class="tap-effect px-2 py-1 rounded text-xs bg-amber-600/80 text-white">重溫</button>`;
    st.innerHTML = STORIES.filter(s => (state.storySeen || {})[s.k] && !s.skip).map(s => `<div class="flex justify-between text-xs py-0.5"><span>${s.icon} ${s.title}</span>${btn(s.k)}</div>`).join('') || '<div class="text-[11px] text-slate-500">境界突破時會解鎖劇情。</div>';
  }
  renderSkills(force); renderBreakdown(); renderBackupBox(); renderRootLocks();
}
function extAct(a, id) {
  state.pets = state.pets || {};
  if (a === 'ming-tab') { mingTab = id; renderExt(true); return; }
  if (a === 'body-up') { const c = bodyCost(); if (state.stones < c || (state.body || 0) >= bodyCap()) return; state.stones -= c; state.body = (state.body || 0) + 1; showToast('錘鍊肉身,筋骨更勝往昔!'); }
  else if (a === 'body-max') { const p = bodyPlan(); if (p.n < 1) return; state.stones -= p.cost; state.body = (state.body || 0) + p.n; audio.playFanfare(); showToast(`連續錘鍊 ${p.n} 重,耗費 ${formatNum(p.cost)} 靈石!`); }
  else if (a === 'pet-hatch') { if ((state.eggs || 0) < 1) return; state.eggs--; const p = PETS[Math.floor(Math.random() * PETS.length)];
    if (state.pets[p.id]) { state.pets[p.id].lv = Math.min(petCap(), state.pets[p.id].lv + 1); showToast(`${p.n} 再度現世,靈寵升級!`); }
    else { state.pets[p.id] = { lv: 1 }; if (!state.activePet) state.activePet = p.id; showToast(`孵出靈寵【${p.i}${p.n}】!`); } }
  else if (a === 'pet-up') { const o = state.pets[id]; if (!o) return; const c = petUpCost(o.lv); if (state.stones < c || o.lv >= petCap()) return; state.stones -= c; o.lv++; }
  else if (a === 'pet-max') { const o = state.pets[id], p = petPlan(id); if (!o || p.n < 1) return; state.stones -= p.cost; o.lv += p.n; audio.playFanfare(); showToast(`靈寵連升 ${p.n} 級!`); }
  else if (a === 'pet-act') { if (state.pets[id]) state.activePet = id; }
  else if (a === 'story-play') { const s = STORIES.find(x => x.k === id); if (s) playCinematic({ icon: s.icon, title: s.title, lines: s.lines, continueText: '合上道途錄' }); return; }
  else if (a === 'backup-restore') { restoreBackup(id); return; }
  else if (a === 'backup-export') { openSaveModal('export'); return; }
  updateTopBar(); renderProfile(); renderExt(true); saveGame();
}
/* ---------- 引導(新功能) ---------- */
function updateTutorialBanner() {
  const banner = document.getElementById('tutorial-guide-banner'), textEl = document.getElementById('tutorial-guide-text');
  if (!banner || !textEl) return;
  let text = '';
  if ((state.tutorialStep || 0) < 4) {
    text = ['第 1 步：點擊洞府中的【吐納聚氣】按鈕累積靈氣修為！', '第 2 步：累積靈石，升級下方的【聚靈法陣】以提升自動吐納速度！', '第 3 步：點擊底部導航前往【歷練】探索第一個秘境【青雲後山】！', '第 4 步：前往【丹器】開啟神農鼎煉製第一枚【聚氣丹】！'][state.tutorialStep] || '';
  } else {
    const t = state.tut2 || {};
    if (!t.sk) text = '✨ 新功能：前往【人物】→「修行」→「⚡神通」學習並裝備更多神通，自由搭配戰鬥！';
    else if (!t.ming) text = '✨ 新功能：洞府的【煉體台】可煉體,【靈獸園】可孵化靈寵,【藏寶閣】可收集法寶！';
  }
  banner.classList.toggle('hidden', !text); textEl.innerText = text;
}
function markTut2(k) { state.tut2 = state.tut2 || {}; if (!state.tut2[k]) { state.tut2[k] = true; updateTutorialBanner(); } }
/* ---------- 屬性明細 ---------- */
function renderBreakdown() {
  const el = document.getElementById('stat-breakdown'); if (!el || !el.offsetParent) return;
  const st = calculateTotalStats(), P = extParts(), row = (n, v) => `<div class="flex justify-between"><span class="text-slate-400">${n}</span><span class="text-slate-200">${v}</span></div>`, f = o => [o.hpP && `氣血+${pct(o.hpP)}%`, o.atkP && `攻擊+${pct(o.atkP)}%`, o.defP && `防禦+${pct(o.defP)}%`, o.qiP && `吐納+${pct(o.qiP)}%`, o.crit && `會心率+${o.crit}`].filter(Boolean).join(' ') || '—';
  el.innerHTML = row('煉體', f(P.body)) + row(`法寶(${P.treasure.n}/8)`, f(P.treasure)) + row('法寶套裝', P.set ? `全屬性+${pct(P.set)}%` : '—') + row('靈寵' + (P.pet.name ? `(${P.pet.name})` : ''), f(P.pet)) + row('永久丹藥', P.pill.hp + P.pill.atk + P.pill.def ? `氣血+${pct(P.pill.hp)}% 攻擊+${pct(P.pill.atk)}% 防禦+${pct(P.pill.def)}%` : '—') + row('功法共鳴', st.isResonanceActive ? '全屬性+5%' : '未激活')
    + `<div class="border-t border-slate-800 mt-1 pt-1">` + row('氣血', formatNum(st.hp)) + row('攻擊', formatNum(st.atk)) + row('防禦', formatNum(st.def)) + row('會心率', Math.round(st.crit * 10) / 10 + '%') + row('吐納', formatNum(st.qiRate) + '/秒') + row('戰力', formatNum(st.combatPower)) + '</div>';
}
/* ---------- 存檔保護 ---------- */
function backupTick() {
  try {
    if (window.LOADFAIL98 || window.ORPHAN98) return;   /* v98:讀檔異常時不覆蓋舊備份 */
    const now = Date.now(), last = +localStorage.getItem('XIUXIAN_BAK_TS') || 0;
    if (now - last < 5 * 60 * 1000) return;
    const cur = localStorage.getItem('XIUXIAN_SAVE_V2'); if (!cur) return;
    const b1 = localStorage.getItem('XIUXIAN_SAVE_BAK1');
    if (b1 && now - last > 30 * 60 * 1000) localStorage.setItem('XIUXIAN_SAVE_BAK2', b1);
    localStorage.setItem('XIUXIAN_SAVE_BAK1', cur); localStorage.setItem('XIUXIAN_BAK_TS', String(now));
  } catch (e) { /* 空間不足時略過 */ }
}
function bakInfo(k) { try { const r = localStorage.getItem(k); if (!r) return null; const o = JSON.parse(r); return { t: o.lastSave || 0, realm: REALM_DATA[o.realmIdx || 0]?.name || '' }; } catch (e) { return null; } }
function restoreBackup(k) {
  const key = k === 'r' ? 'XIUXIAN_SAVE_RESCUE' : k === '2' ? 'XIUXIAN_SAVE_BAK2' : 'XIUXIAN_SAVE_BAK1', raw = localStorage.getItem(key); if (!raw) { showToast('找不到備份。'); return; }
  if (!window.confirm('確定要還原此備份?目前進度會被覆蓋(建議先匯出目前存檔)。')) return;
  try { localStorage.setItem('XIUXIAN_SAVE_V2', raw); location.reload(); } catch (e) { showToast('還原失敗。'); }
}
let _bkSig = '';
function renderBackupBox() {
  const el = document.getElementById('backup-box'); if (!el || !el.offsetParent) return;
  const days = state.lastExport ? Math.floor((Date.now() - state.lastExport) / 86400000) : null, b1 = bakInfo('XIUXIAN_SAVE_BAK1'), b2 = bakInfo('XIUXIAN_SAVE_BAK2');
  const sig = JSON.stringify([days, b1, b2, window._persisted]); if (sig === _bkSig) return; _bkSig = sig;
  const fmt = b => b ? new Date(b.t).toLocaleString('zh-TW', { hour12: false }) + `(${b.realm})` : '無';
  el.innerHTML = `<div class="text-[11px] ${days === null || days >= 3 ? 'text-rose-300' : 'text-emerald-300'}">${days === null ? '⚠️ 尚未匯出過存檔代碼,清除瀏覽器資料會永久遺失進度!' : days >= 3 ? `⚠️ 已 ${days} 天未匯出存檔,建議立即匯出。` : `✅ 最近匯出:${days === 0 ? '今天' : days + ' 天前'}`}</div>
    <div class="text-[10px] text-slate-500">瀏覽器持久儲存:${window._persisted ? '已啟用' : '未啟用(部分瀏覽器不支援)'};遊戲每 5 分鐘自動留一份備份。</div>
    <div class="grid grid-cols-3 gap-1.5 mt-1">${eBtn('backup-export', '', '📤 立即匯出', true)}${eBtn('backup-restore', '1', '還原備份A', !!b1, 'bg-slate-700 text-amber-200')}${eBtn('backup-restore', '2', '還原備份B', !!b2, 'bg-slate-700 text-amber-200')}</div>
    <div class="text-[10px] text-slate-500">備份A:${fmt(b1)}<br>備份B:${fmt(b2)}</div>${localStorage.getItem('XIUXIAN_SAVE_RESCUE') ? `<div class="mt-1">${eBtn('backup-restore', 'r', '還原救援存檔(讀檔失敗時保留的原始資料)', true, 'bg-slate-700 text-amber-200')}</div>` : ''}`;
}
/* ---------- 九九登天塔 ---------- */
const TOWER_MON = [['天兵統領', '💂', 'metal'], ['星宿魔將', '🌟', 'wood'], ['劫雲幻影', '☁️', 'water'], ['虛空魔靈', '👻', 'fire'], ['鎮塔神獸', '🐲', 'earth'], ['混沌妖尊', '👹', 'fire'], ['九幽鬼帝', '💀', 'water'], ['雷劫元靈', '⚡', 'metal']];
/* 九九登天塔:99 層守塔 + 第 100 層心魔。怪物為「絕對數值」,隨層數成長,不再按你的當前數值換算 */
const TWP = { C1: 140000, C99: 39200000, p: 1, kh0: 8, kh1: 450, kf0: .05, kf1: .435, bossH: 1.4, bossF: 1.2, xmH: 1.3, xmF: 1.3, ra: 3.41, rh: 9.4, rd: .82 };
const TW_BOSS = f => f < 100 && f % 9 === 0;
function twRef(f) {
  const t = (Math.min(f, 99) - 1) / 98, C = Math.exp(Math.log(TWP.C1) + (Math.log(TWP.C99) - Math.log(TWP.C1)) * Math.pow(t, TWP.p)), a = C / TWP.ra;
  return { t, a, h: a * TWP.rh, d: a * TWP.rd };
}
function towerMonster(f, st) {
  const xm = f >= 100, boss = TW_BOSS(f), R = twRef(f), tpl = TOWER_MON[(f + (boss ? 3 : 0)) % TOWER_MON.length];
  const atkForHit = (hpP, defP, frac) => { const t = hpP * frac; return Math.floor((t + Math.sqrt(t * t + 4 * t * defP)) / 2); };
  const kh = TWP.kh0 * Math.pow(TWP.kh1 / TWP.kh0, R.t) * (boss ? TWP.bossH : 1) * (xm ? TWP.xmH : 1);
  const kf = (TWP.kf0 + (TWP.kf1 - TWP.kf0) * R.t) * (boss ? TWP.bossF : 1) * (xm ? TWP.xmF : 1);
  return { id: 'tw_' + f, name: xm ? '心魔·' + (state.name || '本心') : (boss ? '守塔·' : '') + tpl[0], emoji: xm ? '👤' : tpl[1], element: xm ? 'fire' : tpl[2], skillName: xm ? '照見本心' : (boss ? '天罰塔威' : ''), hp: Math.floor(R.a * kh), atk: atkForHit(R.h, R.d, kf), def: Math.floor(R.a * .3), isBoss: boss || xm, drops: [] };
}
function stepTower() {
  const st = calculateTotalStats(); if (hpGate(st)) return;
  state.tower = state.tower || { floor: 1, best: 0 };
  const f = Math.max(1, Math.min(100, state.tower.floor)), mon = towerMonster(f, st);
  startMonsterBattle({ id: 99, name: '九九登天塔', maxSteps: 9999, element: 'earth', monsters: [mon] }, mon.isBoss);
  if (currentBattle) { currentBattle.isTower = true; currentBattle.floor = f; }
}
// towerWin:原為 4 層包裝,依原安裝順序(內→外)組合:
//   towerWin85       v8.5 圖鑑(034)
//   towerWin86       v8.6 器紋石(035)
//   towerWin88       v8.8 仙緣(037)
//   towerWin130      v13.0 塔壁刻字(068)
function towerWin() { return XT.chain(this, arguments, towerWinCore, [XT.towerWin85, XT.towerWin86, XT.towerWin88, XT.towerWin130]); }
function towerWinCore() {
  const B = currentBattle, f = B.floor, m = B.monster, T = state.tower, ai = Math.min(Math.max(state.realmIdx, 5), 7), items = [];
  const was = !!T.done && f === 100, bossF = TW_BOSS(f) || f === 100;
  const base = ((AREAS_DATA[ai].monsters.find(x => !x.isBoss) || {}).drops || []).find(d => d.item === 'stone');
  const stones = Math.floor((base ? base.count : 1000) * 0.6 * (1 + f * 0.12) * (bossF ? 3 : 1));
  state.stones += stones;
  if (!was) {
    if (f % 5 === 0) { state.eggs = (state.eggs || 0) + 1; items.push('🥚靈寵蛋'); }
    if (bossF) { if (f > T.best) { const dp = 3 + Math.floor(f / 9) * 2; state.daoPoints = (state.daoPoints || 0) + dp; items.push(`道心點×${dp}`); } addItem('pill_3', 1); items.push('渡劫丹'); }
    { const tt = TREASURES.find(x => x.how === 'tower' && x.floor === f); if (tt && grantTreasure(tt.id, true)) items.push(`法寶【${tt.n}】`);
      const fr = 2 + Math.floor(f / 9); state.tfrag = (state.tfrag || 0) + fr; items.push(`🧩殘片×${fr}`);
      if (bossF) { const gid = `eg_${EQUIP_SLOTS[Math.floor(Math.random() * 7)]}_${Math.min(7, state.realmIdx || 0)}`; state.inventory[gid] = (state.inventory[gid] || 0) + 1; items.push(ITEMS[gid].name); } }
  }
  if (f === 100 && !T.done) { T.done = true; state.daoPoints = (state.daoPoints || 0) + 20; state.tfrag = (state.tfrag || 0) + 20; addItem('pill_3', 2); items.push('道心點×20', '🧩殘片×20', '渡劫丹×2', '〔稱號・鎮塔人〕'); }
  T.best = Math.max(T.best, f); T.floor = f >= 100 ? 100 : f + 1;
  logAdventure(`<span class="text-amber-300 font-bold">🗼 登上九九登天塔第 ${f} 層!靈石 +${formatNum(stones)}${items.length ? '、' + items.join('、') : ''}</span>`);
  showBattleResultModal(true, m.name, stones, items); endBattle(); updateTopBar(); renderInventory(); saveGame();
}
function towerLose() {
  const f = currentBattle.floor, m = currentBattle.monster, T = state.tower;
  if (!T.done) T.floor = f >= 100 ? 91 : Math.max(1, Math.floor((f - 1) / 9) * 9 + 1);
  state.hp = Math.max(1, Math.floor(calculateTotalStats().hp * 0.5));
  logAdventure(`<span class="text-rose-400 font-bold">💀 於九九登天塔第 ${f} 層敗退${T.done ? '。' : `,退回第 ${T.floor} 層。`}</span>`);
  showBattleResultModal(false, m.name, 0, []); endBattle();
  if (state.autoExplore) stopAutoExplore('試煉敗退,已停止自動歷練。');
  updateTopBar(); saveGame();
}
/* ---------- 地圖(含九九登天塔) ---------- */
function renderMap() {
  const sm = document.getElementById('stage-map'), rs = document.getElementById('region-strip');
  if (!sm || !rs || !sm.offsetParent) return;
  const tower = !!(state.towerMode && towerOK()), T = state.tower || { floor: 1, best: 0 };
  const sig = [state.currentArea, state.exploreStep, state.realmIdx, state.autoExplore ? 1 : 0, JSON.stringify(state.areaFirstClear || {}), currentBattle ? 1 : 0, tower ? 1 : 0, T.floor, T.best, state.ascended ? 1 : 0].join('|');
  if (sig === _mapSig) return; _mapSig = sig;
  const ai = state.currentArea || 0, area = AREAS_DATA[ai]; if (!area) return;
  let strip = AREAS_DATA.map((a, i) => {
    const lock = state.realmIdx < a.realmReq, cleared = !!(state.areaFirstClear || {})[a.id], cur = !tower && i === ai, pal = ELEM_PAL[a.element] || ELEM_PAL.metal;
    return `<button data-area="${i}" class="shrink-0 w-[74px] rounded-xl border p-1.5 text-center ${cur ? 'border-amber-400 ring-1 ring-amber-400/60' : 'border-slate-700'} ${lock ? 'opacity-55' : ''}" style="background:linear-gradient(160deg,${pal[0]},#020617)">
      <div class="text-2xl leading-none">${AREA_ICON[i] || '🗺️'}</div><div class="text-[10px] font-bold text-amber-100 mt-1 leading-tight">${a.name}</div>
      <div class="text-[9px] text-slate-300">${REALM_DATA[a.realmReq]?.name || ''}</div><div class="text-[10px]">${lock ? '🔒' : cleared ? '✅' : cur ? '📍' : '⚔️'}</div></button>`;
  }).join('');
  strip += `<button data-tower="1" class="shrink-0 w-[74px] rounded-xl border p-1.5 text-center ${tower ? 'border-amber-400 ring-1 ring-amber-400/60' : 'border-slate-700'} ${towerOK() ? '' : 'opacity-55'}" style="background:linear-gradient(160deg,#3b0764,#020617)"><div class="text-2xl leading-none">🗼</div><div class="text-[10px] font-bold text-amber-100 mt-1 leading-tight">九九登天塔</div><div class="text-[9px] text-slate-300">隨劇情開啟</div><div class="text-[10px]">${towerOK() ? (tower ? '📍' : '第' + T.best + '層') : '🔒'}</div></button>`;
  rs.innerHTML = strip;
  const key = tower ? 'T' : ai;
  if (_mapArea !== key) { _mapArea = key; const el = rs.querySelector(tower ? '[data-tower]' : `[data-area="${ai}"]`); if (el && rs.scrollTo) rs.scrollTo({ left: Math.max(0, el.offsetLeft - 120), behavior: 'auto' }); }
  if (tower) {
    let s = `<svg viewBox="0 0 360 176" class="w-full" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="twbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b0764"/><stop offset="1" stop-color="#020617"/></linearGradient></defs><rect width="360" height="176" rx="12" fill="url(#twbg)"/>`;
    for (let k = 0; k < 14; k++) s += `<circle cx="${(k * 53 + 17) % 350}" cy="${(k * 29 + 11) % 100}" r="${k % 3 ? 1 : 1.6}" fill="#fff" opacity=".6"/>`;
    if (window.FUR68 && FUR68.tw) s += `<image href="${FUR68.tw}" x="136" y="4" width="88" height="170" preserveAspectRatio="xMidYMax meet"/>`; else for (let i = 0; i < 7; i++) { const w = 150 - i * 15, y = 150 - i * 19, lit = Math.floor(((T.floor - 1) % 9) * 7 / 9) >= (6 - i) ; s += `<path d="M${180 - w / 2} ${y} h${w} l-6 -16 h${-(w - 12)}z" fill="${lit ? '#7c3aed' : '#312e81'}" stroke="#a78bfa" stroke-width="1"/><rect x="${180 - 6}" y="${y - 12}" width="12" height="8" rx="2" fill="${lit ? '#fde047' : '#1e1b4b'}"/>`; }
    s += `${window.FUR68 && FUR68.tw ? '' : '<path d="M180 20 l-10 14 h20z" fill="#a78bfa"/><text x="180" y="14" text-anchor="middle" font-size="14">🧘</text>'}<text x="40" y="60" font-size="12" fill="#c4b5fd">目前</text><text x="40" y="84" font-size="26" font-weight="900" fill="#fde68a">第${T.floor}層</text><text x="300" y="60" text-anchor="middle" font-size="12" fill="#c4b5fd">最高紀錄</text><text x="300" y="84" text-anchor="middle" font-size="24" font-weight="900" fill="#fde68a">${T.best}</text></svg>`;
    sm.innerHTML = s + `<div class="text-[11px] px-1 mt-1 text-slate-300">🗼 九九歸一:塔共九十九層,每九層有一尊守塔 Boss,第一百層是你自己的心魔。怪物按層數固定成長,養成越足,登得越高;每 5 層送靈寵蛋,守塔 Boss 送渡劫丹與道心點(首次)。敗退只退回本九層起點,不損失靈石;通關第一百層有大獎。</div>`;
    return;
  }
  const n = area.maxSteps, cur = Math.min(state.exploreStep || 1, n), pal = ELEM_PAL[area.element] || ELEM_PAL.metal, boss = area.monsters.find(m => m.isBoss) || {};
  let s = `<svg viewBox="0 0 360 176" class="w-full" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="mapbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${pal[1]}"/><stop offset="1" stop-color="#020617"/></linearGradient></defs><rect width="360" height="176" rx="12" fill="url(#mapbg)"/>`;
  for (let k = 0; k < 9; k++) { const x = 18 + k * 40 + ((ai * 37 + k * 53) % 18), h = 16 + ((ai * 11 + k * 29) % 18), y = 88 + ((k * 17 + ai) % 6); s += `<path d="M${x - h * .8} ${y + h * .5} L${x} ${y - h * .5} L${x + h * .8} ${y + h * .5}z" fill="${pal[2]}" opacity=".13"/>`; }
  s += `<path d="${stagePath(n, n)}" stroke="#3b2f22" stroke-opacity=".42" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="${stagePath(n, n)}" stroke="#f5ecd6" stroke-opacity=".85" stroke-width="2.5" stroke-dasharray="2 6" fill="none" stroke-linecap="round"/>`;
  if (cur > 1) s += `<path d="${stagePath(cur, n)}" stroke="#fbbf24" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  const IC = window.IC138, im = (k, x, y, w, ex) => `<image href="${IC[k]}" x="${x - w / 2}" y="${y - w / 2}" width="${w}" height="${w}" preserveAspectRatio="xMidYMid meet"${ex || ''}/>`;
  if (IC) {
    const bsrc = (window.MONART26 && MONART26(boss)) || '';
    for (let i = 1; i <= n; i++) {
      const p = stagePos(i, n), isB = i === n, done = i < cur, now = i === cur;
      s += '<g>';
      if (isB) {
        if (now) s += im('n_cur', p.x, p.y, 46);
        if (bsrc) s += `<clipPath id="bc19"><circle cx="${p.x}" cy="${p.y}" r="14.5"/></clipPath><circle cx="${p.x}" cy="${p.y}" r="15" fill="#f3ead6"/><image href="${bsrc}" x="${p.x - 17}" y="${p.y - 15}" width="34" height="34" clip-path="url(#bc19)" preserveAspectRatio="xMidYMin slice"/>`;
        else s += im('n_boss', p.x, p.y, 30);
        s += im('bossring', p.x, p.y, 40);
      } else if (i === 1) { if (now) s += im('n_cur', p.x, p.y, 34); s += im('camp', p.x, p.y - 2, 34); }
      else {
        s += im(now ? 'n_cur' : done ? 'n_done' : 'n_idle', p.x, p.y, now ? 32 : 27);
        if (i === 5) s += im('flag', p.x + 6, p.y - 12, 26);
        else if (!done) s += `<text x="${p.x}" y="${p.y + 4}" text-anchor="middle" font-size="11" font-weight="800" fill="#3b2f22" stroke="#f5efe0" stroke-width="2.5" paint-order="stroke">${i}</text>`;
      }
      if (now) s += `<g>${im(state.gender === 'f' ? 'me_f' : 'me_m', p.x, p.y - 27, 32)}<animateTransform attributeName="transform" type="translate" values="0 0;0 -4;0 0" dur="1.2s" repeatCount="indefinite"/></g>`;
      s += '</g>';
    }
  } else
  for (let i = 1; i <= n; i++) {
    const p = stagePos(i, n), isB = i === n, special = i === 1 ? '⛺' : isB ? (boss.emoji || '👹') : (i === 5 ? '🚩' : ''), done = i < cur, now = i === cur, r = isB ? 17 : 13;
    const fill = now ? '#b45309' : done ? '#065f46' : isB ? '#4c0519' : '#1e293b', stroke = now ? '#fcd34d' : done ? '#34d399' : isB ? '#fb7185' : '#475569';
    s += `<g><circle cx="${p.x}" cy="${p.y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${now ? 3 : 2}">${now ? `<animate attributeName="stroke-opacity" values="1;.3;1" dur="1.4s" repeatCount="indefinite"/>` : ''}</circle>`;
    s += special ? `<text x="${p.x}" y="${p.y + 5}" text-anchor="middle" font-size="${isB ? 17 : 14}">${special}</text>` : `<text x="${p.x}" y="${p.y + 4}" text-anchor="middle" font-size="11" font-weight="700" fill="${done ? '#a7f3d0' : '#cbd5e1'}">${done ? '✓' : i}</text>`;
    if (now) s += `<text x="${p.x}" y="${p.y - 20}" text-anchor="middle" font-size="16">🧘<animateTransform attributeName="transform" type="translate" values="0 0;0 -4;0 0" dur="1.2s" repeatCount="indefinite"/></text>`;
    s += '</g>';
  }
  s += '</svg>';
  const claimed = !!(state.areaFirstClear || {})[area.id];
  sm.innerHTML = s + `<div class="flex justify-between text-[11px] px-1 mt-1"><span class="text-amber-200 font-bold">${AREA_ICON[ai] || ''} ${area.name} · 第 ${cur} / ${n} 關</span><span class="text-slate-400">境主:${boss.name || '?'}${claimed ? ' ✅' : ''}</span></div>`;
}
/* ---------- 載入 ---------- */
function injectStageCss() {
  if (document.getElementById('stage-css')) return;
  const st = document.createElement('style'); st.id = 'stage-css';
  st.textContent = `.rd{position:absolute;top:2px;right:16%;width:9px;height:9px;border-radius:50%;background:#ef4444;box-shadow:0 0 6px #ef4444;display:none;pointer-events:none}
.bs{position:relative;height:178px;border-radius:12px;overflow:hidden;border:1px solid #334155;--sp:1;--dx:120px}
.bs-moon{position:absolute;right:12%;top:10px;width:34px;height:34px;border-radius:50%;opacity:.35;filter:blur(1px)}
.bs-floor{position:absolute;left:0;right:0;bottom:0;height:46px;background:linear-gradient(180deg,rgba(15,23,42,.1),#020617 90%);border-top:1px solid rgba(148,163,184,.15)}
.bs-u{position:absolute;bottom:26px;transform-origin:50% 100%}.bs-pl{left:14%;width:64px}.bs-pl svg{display:block}
.bs-pet{position:absolute;left:3%;bottom:70px;width:34px;height:34px;animation:fl 2s ease-in-out infinite}
.bs-mo{right:13%;text-align:center}.bs-memo{font-size:58px;line-height:1;filter:drop-shadow(0 6px 4px rgba(0,0,0,.5))}.bs-mo.boss .bs-memo{font-size:78px}
.bs-st{position:absolute;left:50%;transform:translateX(-50%);top:-16px;white-space:nowrap;font-size:11px;font-weight:700;color:#fde68a;text-shadow:0 1px 2px #000}
.bs-fx{position:absolute;inset:0;pointer-events:none}.bs-e{position:absolute;inset:0}
.bs-e.onm{inset:auto;right:9%;bottom:20px;width:96px;height:110px}.bs-e.onp{inset:auto;left:10%;bottom:20px;width:90px;height:100px}
.bs-num{position:absolute;font-weight:900;font-size:17px;text-shadow:0 2px 3px #000;animation:bsf calc(1s/var(--sp)) ease-out forwards}
.bs-num.dmg{color:#fff}.bs-num.crit{color:#fde047;font-size:24px}.bs-num.pet{color:#f9a8d4}.bs-num.burn{color:#fb923c}.bs-num.heal{color:#4ade80}.bs-num.pdmg{color:#f87171}.bs-num.abs{color:#cbd5e1;font-size:13px}.bs-num.info{color:#c4b5fd;font-size:14px}
@keyframes bsf{0%{transform:translateY(0) scale(.6);opacity:0}15%{transform:translateY(-6px) scale(1.15);opacity:1}100%{transform:translateY(-44px) scale(1);opacity:0}}
.bs-pl.atk{animation:bsl calc(.56s/var(--sp)) ease-in-out}
@keyframes bsl{0%{transform:translateX(0)}35%{transform:translateX(calc(var(--dx)*.9))}62%{transform:translateX(calc(var(--dx)*.9))}100%{transform:translateX(0)}}
.bs-pl.atk .bs-sword{animation:bsw calc(.56s/var(--sp)) ease-in-out;transform-box:fill-box;transform-origin:50% 100%}
@keyframes bsw{0%{transform:rotate(0)}30%{transform:rotate(-40deg)}55%{transform:rotate(55deg)}100%{transform:rotate(0)}}
.bs-pl.cast{animation:bsc calc(.7s/var(--sp)) ease-in-out}@keyframes bsc{0%,100%{transform:translateY(0)}40%{transform:translateY(-14px)}}
.bs-pl.phit{animation:bsh calc(.36s/var(--sp))}.bs-pl.phit svg{filter:drop-shadow(0 0 6px #ef4444) brightness(1.6)}
@keyframes bsh{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}60%{transform:translateX(5px)}}
.bs-mo.hit{animation:bsh calc(.38s/var(--sp))}.bs-mo.hit .bs-memo{filter:brightness(2.4) drop-shadow(0 6px 4px rgba(0,0,0,.5))}
.bs-mo.matk{animation:bsm calc(.52s/var(--sp)) ease-in-out}
@keyframes bsm{0%{transform:translateX(0)}35%{transform:translateX(calc(var(--dx)*-.85)) scale(1.12)}62%{transform:translateX(calc(var(--dx)*-.85)) scale(1.12)}100%{transform:translateX(0)}}
.bs-mo.die{animation:bsd calc(.5s/var(--sp)) forwards}@keyframes bsd{to{opacity:0;transform:scale(.4) rotate(25deg) translateY(20px)}}
.bs-mo.frozen .bs-memo{filter:drop-shadow(0 0 8px #38bdf8) saturate(.4) hue-rotate(160deg)}.bs-mo.burning .bs-memo{filter:drop-shadow(0 0 8px #f97316)}
.bs-pl.shielded::after{content:'';position:absolute;left:-12px;right:-12px;top:6px;bottom:-4px;border-radius:50%;border:2px solid rgba(251,191,36,.8);box-shadow:0 0 14px rgba(251,191,36,.6) inset,0 0 10px rgba(251,191,36,.5)}
.bs-pl.raged svg{filter:drop-shadow(0 0 7px #ef4444)}
.bs-pet.pa{animation:bspa calc(.62s/var(--sp)) ease-in-out}
@keyframes bspa{0%{transform:translate(0,0)}40%{transform:translate(calc(var(--dx)*1.45),20px) scale(1.2)}70%{transform:translate(calc(var(--dx)*1.45),20px) scale(1.2)}100%{transform:translate(0,0)}}
.bs-slash{position:absolute;left:-10px;right:-10px;top:45%;height:7px;border-radius:50%;background:linear-gradient(90deg,transparent,#fff,transparent);transform:rotate(var(--r,-35deg)) scaleX(0);animation:bss calc(.34s/var(--sp)) ease-out forwards;box-shadow:0 0 10px #fff}
.bs-slash.g{background:linear-gradient(90deg,transparent,#86efac,transparent);box-shadow:0 0 10px #4ade80}.bs-slash.r{background:linear-gradient(90deg,transparent,#fb7185,transparent);box-shadow:0 0 10px #ef4444}
@keyframes bss{0%{transform:rotate(var(--r,-35deg)) scaleX(0);opacity:1}60%{transform:rotate(var(--r,-35deg)) scaleX(1);opacity:1}100%{transform:rotate(var(--r,-35deg)) scaleX(1.1);opacity:0}}
.bs-burst{position:absolute;left:50%;top:40%;font-size:48px;transform:translate(-50%,-50%) scale(.3);animation:bsb calc(.5s/var(--sp)) ease-out forwards}.bs-burst.ice{filter:drop-shadow(0 0 8px #38bdf8)}
@keyframes bsb{60%{transform:translate(-50%,-50%) scale(1.4);opacity:1}100%{transform:translate(-50%,-50%) scale(1.7);opacity:0}}
.bs-bolt{position:absolute;left:50%;top:-80px;width:12px;height:200px;margin-left:-6px;background:linear-gradient(180deg,#fff,#fde047 60%,transparent);clip-path:polygon(50% 0,100% 28%,62% 38%,100% 70%,40% 60%,60% 100%,0 55%,38% 45%,0 20%);animation:bsbo calc(.4s/var(--sp)) ease-out forwards;filter:drop-shadow(0 0 8px #fde047)}
.bs-bolt.big{width:30px;margin-left:-15px;background:linear-gradient(180deg,#fff,#7dd3fc 60%,transparent)}
@keyframes bsbo{0%{opacity:0;transform:scaleY(.2)}25%{opacity:1;transform:scaleY(1)}100%{opacity:0}}
.bs-sword-drop{position:absolute;top:-30px;font-size:22px;animation:bsdr calc(.4s/var(--sp)) ease-in forwards}@keyframes bsdr{from{transform:translateY(-10px)}to{transform:translateY(115px);opacity:.2}}
.bs-crack{position:absolute;left:0;right:0;bottom:0;height:10px;background:#1c1917;clip-path:polygon(0 50%,15% 0,30% 70%,50% 10%,70% 80%,85% 20%,100% 50%,85% 100%,50% 60%,15% 100%);animation:bsx calc(.6s/var(--sp)) forwards}@keyframes bsx{0%{transform:scaleX(.2)}40%{transform:scaleX(1)}100%{opacity:0}}
.bs-vortex{position:absolute;left:50%;top:45%;width:20px;height:20px;border-radius:50%;margin:-10px;background:radial-gradient(circle,#0f172a,#7c3aed 60%,transparent 70%);animation:bsv calc(.6s/var(--sp)) ease-out forwards}@keyframes bsv{to{transform:scale(7);opacity:0}}
.bs-ring{position:absolute;inset:0;border-radius:50%;border:3px solid;animation:bsr calc(.8s/var(--sp)) ease-out forwards}@keyframes bsr{0%{transform:scale(.4);opacity:1}100%{transform:scale(1.3);opacity:0}}
.bs-plus{position:absolute;bottom:10px;color:#4ade80;font-size:16px;font-weight:900;animation:bsp calc(1s/var(--sp)) ease-out forwards}@keyframes bsp{0%{transform:translateY(0);opacity:0}20%{opacity:1}100%{transform:translateY(-70px);opacity:0}}
.bs-proj{position:absolute;left:24%;bottom:60px;font-size:30px;animation:bspj calc(.45s/var(--sp)) ease-in forwards}@keyframes bspj{from{transform:translateX(0)}to{transform:translateX(calc(var(--dx)*1.35))}}
.bs.shake{animation:bsk calc(.4s/var(--sp))}@keyframes bsk{0%,100%{transform:translate(0,0)}20%{transform:translate(-5px,3px)}40%{transform:translate(5px,-3px)}60%{transform:translate(-4px,-2px)}80%{transform:translate(3px,3px)}}
.bs.flash::after{content:'';position:absolute;inset:0;background:#fff;opacity:0;animation:bsfl calc(.4s/var(--sp))}@keyframes bsfl{0%{opacity:.7}100%{opacity:0}}
#subtab-skills-btn[data-dot="1"]::after{content:'●';color:#ef4444;margin-left:3px;font-size:10px}`;
  document.head.appendChild(st);
}
window.addEventListener('load', () => {
  injectStageCss(); injectExtCss();
  setInterval(renderExt, 1500); setInterval(renderMap, 400); setInterval(storyCheck, 3000);
  setTimeout(() => { renderExt(true); renderMap(); }, 300);
  // 神通子頁籤
  const tb = document.getElementById('subtab-talents-btn');
  if (tb && !document.getElementById('subtab-skills-btn')) {
    tb.parentElement.insertAdjacentHTML('beforeend', '<button id="subtab-skills-btn" class="flex-1 py-2 font-serif-tc text-slate-400 border-b-2 border-transparent hover:text-slate-200">⚡ 神通</button>');
    document.getElementById('subtab-talents-content')?.insertAdjacentHTML('afterend', '<div id="subtab-skills-content" class="hidden space-y-2"><div id="skills-panel"></div></div>');
  }
  const btns = { tech: 'subtab-tech-list-btn', talents: 'subtab-talents-btn', skills: 'subtab-skills-btn' }, conts = { tech: 'subtab-tech-content', talents: 'subtab-talents-content', skills: 'subtab-skills-content' };
  const act = { tech: 'amber', talents: 'teal', skills: 'amber' };
  const showSub = k => {
    Object.keys(btns).forEach(x => { const b = document.getElementById(btns[x]); if (b) b.className = `flex-1 py-2 font-serif-tc ${x === k ? `font-bold text-${act[x]}-400 border-b-2 border-${act[x]}-400` : 'text-slate-400 border-b-2 border-transparent hover:text-slate-200'}`; document.getElementById(conts[x])?.classList.toggle('hidden', x !== k); });
    if (k === 'skills') { markTut2('sk'); renderSkills(true); }
  };
  Object.keys(btns).forEach(k => document.getElementById(btns[k])?.addEventListener('click', () => showSub(k)));
  document.getElementById('skills-panel')?.addEventListener('click', e => { const b = e.target.closest('button[data-skact],button[data-act]'); if (!b || b.disabled) return; if (b.dataset.skact) skAct(b.dataset.skact, b.dataset.id); else skAct(b.dataset.act, b.dataset.id); });
  // 戰鬥神通按鈕
  document.getElementById('battle-skill-bar')?.addEventListener('click', e => { const b = e.target.closest('button[data-skbtn]'); if (b && !b.disabled) playerBattleAttack(b.dataset.skbtn); });
  // 氣血列
  document.getElementById('btn-use-heal')?.addEventListener('click', () => usePillOutside(false));
  document.getElementById('btn-auto-pill')?.addEventListener('click', () => { state.autoPill = state.autoPill === false; renderHpBar(); saveGame(); });
  // 地圖
  const clickAct = e => { const b = e.target.closest('button[data-act]'); if (b && !b.disabled) extAct(b.dataset.act, b.dataset.id); };
  document.getElementById('ming-root')?.addEventListener('click', clickAct);
  document.getElementById('ext-root')?.addEventListener('click', clickAct);
  document.getElementById('region-strip')?.addEventListener('click', e => {
    if (currentBattle) { showToast('戰鬥正酣,無法移動!'); return; }
    const t = e.target.closest('button[data-tower]');
    if (t) {
      if (!towerOK()) { showToast('塔影尚未入你神識——化神期後,隨劇情開啟'); return; }
      if (state.towerMode) return;
      stopAutoExplore(''); state.towerMode = true; _mapSig = ''; renderMap(); return;
    }
    const b = e.target.closest('button[data-area]'); if (!b) return;
    const i = +b.dataset.area, a = AREAS_DATA[i];
    if (state.realmIdx < a.realmReq) { showToast(`需達到【${REALM_DATA[a.realmReq].name}】方可涉足`); return; }
    if (i === state.currentArea && !state.towerMode) return;
    state.towerMode = false;
    const sel = document.getElementById('select-adventure-area'); sel.value = String(i); sel.dispatchEvent(new Event('change'));
    _mapSig = ''; renderMap();
  });
  document.querySelectorAll('.nav-tab-btn').forEach(b => b.addEventListener('click', () => {
    if (b.getAttribute('data-tab') === 'tab-ming') markTut2('ming');
    setTimeout(() => { renderExt(true); _mapSig = ''; renderMap(); renderHpBar(); updateRedDots(); }, 50);
  }));
  // 離線後繼續歷練
  const cb = document.getElementById('btn-close-offline');
  if (cb) {
    if (!document.getElementById('btn-offline-resume')) cb.insertAdjacentHTML('beforebegin', '<button id="btn-offline-resume" class="hidden w-full py-2 mb-2 bg-gradient-to-r from-amber-600 to-amber-500 text-white font-bold text-xs rounded-lg shadow">⚔️ 出關並繼續自動歷練</button>');
    document.getElementById('btn-offline-resume').addEventListener('click', () => {
      document.getElementById('modal-offline')?.classList.add('hidden');
      if (!state.autoExplore) document.getElementById('btn-auto-explore')?.click();
    });
  }
  try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist().then(p => { window._persisted = !!p; }); } catch (e) { /* ignore */ }
  setInterval(() => { renderHpBar(); updateRedDots(); }, 700);
  setTimeout(() => { updateTutorialBanner(); renderHpBar(); updateRedDots(); if ((state.realmIdx || 0) >= 1 && !state.lastExport) showToast('💾 提醒:尚未備份過存檔,建議到【仙途】→「存檔管理」下載存檔檔案。'); else if ((state.realmIdx || 0) >= 1 && Date.now() - state.lastExport > 7 * 86400000) showToast('💾 提醒:已超過 7 天沒有備份存檔,建議到【仙途】→「存檔管理」下載存檔檔案。'); }, 1200);
});


window.addEventListener('load', () => { setTimeout(() => {
  const ok = true; /* v16.2: 樣式已內嵌,不再依賴 CDN */
  if (!ok) { const d = document.createElement('div'); d.style.cssText = 'position:fixed;left:0;right:0;top:0;z-index:9999;background:#7f1d1d;color:#fff;font-size:12px;padding:6px;text-align:center'; d.textContent = '⚠️ 樣式庫(Tailwind CDN)載入失敗,畫面可能錯亂。請確認網路後重新整理(存檔不受影響)。'; document.body.appendChild(d); }
}, 2500); });

