/* ===== v7-B:裝備欄/強化、靈根鎖定洗髓、煉丹爐/鍛造台 ===== */
const enhCap = () => Math.min(30, 10 + 2 * (state.realmIdx || 0));
const enhMult = e => 1 + .10 * Math.min(e, 10) + .06 * Math.max(0, e - 10);
const gearScore = it => (it.atk || 0) * 2 + (it.def || 0) * 1.5 + (it.hp || 0) * .3;
function enhCost(cur) { return { stone: Math.floor((cur + 1) * 80 * Math.pow(1.3, Math.max(0, cur - 8))), oreKey: cur < 5 ? 'ore_1' : cur < 10 ? 'ore_2' : cur < 20 ? 'ore_3' : 'ore_4', ore: Math.floor(cur / 2) + 1 }; }
function enhChance(cur) { return cur < 9 ? Math.max(40, 100 - cur * 7) : Math.max(20, 40 - (cur - 9) * 2); }
enhanceEquippedGear = function (slot, quiet) {
  const id = state.equipment[slot];
  if (!id || !ITEMS[id]) { if (!quiet) showToast('該部位並未穿戴裝備,無法強化!'); return 'noitem'; }
  state.enhance = state.enhance || {}; const cur = state.enhance[slot] || 0;
  if (cur >= enhCap()) { if (!quiet) showToast(cur >= 30 ? '已達 +30 極境!' : `目前境界最高強化 +${enhCap()},突破境界可再提升上限。`); return 'cap'; }
  const c = enhCost(cur);
  if (state.stones < c.stone) { if (!quiet) showToast(`靈石不足,強化需 ${formatNum(c.stone)} 靈石!`); return 'poor'; }
  if ((state.inventory[c.oreKey] || 0) < c.ore) { if (!quiet) showToast(`材料不足,需【${ITEMS[c.oreKey].name} ×${c.ore}】!`); return 'poor'; }
  state.stones -= c.stone; state.inventory[c.oreKey] -= c.ore; if (state.inventory[c.oreKey] <= 0) delete state.inventory[c.oreKey];
  const ok = Math.random() * 100 <= enhChance(cur);
  if (ok) { state.enhance[slot] = cur + 1; if (!quiet) { audio.playFanfare(); showToast(`🔥 天工造化!【${ITEMS[id].name}】強化至 +${cur + 1}!`); } }
  else if (!quiet) { audio.playSlash(); showToast(`火候稍遜,強化失敗!寶器未損,仍為 +${cur}。`); }
  if (!quiet) { renderInventory(); updateTopBar(); renderProfile(); saveGame(); }
  return ok ? 'ok' : 'fail';
};
function enhanceMany(slot) {
  let ok = 0, fail = 0, last = '';
  for (let i = 0; i < 60; i++) { last = enhanceEquippedGear(slot, true); if (last === 'ok') ok++; else if (last === 'fail') fail++; else break; }
  renderInventory(); updateTopBar(); renderProfile(); saveGame();
  const why = last === 'cap' ? '已達上限' : last === 'poor' ? '材料或靈石不足' : '';
  if (ok + fail) { audio.playFanfare(); showToast(`連續強化:成功 ${ok} 次、失敗 ${fail} 次${why ? '(' + why + ')' : ''}`); } else showToast(why ? why : '無法強化');
}
function cpIfEnh(slot) {
  state.enhance = state.enhance || {}; const e0 = state.enhance[slot] || 0, c0 = calculateTotalStats().combatPower;
  state.enhance[slot] = e0 + 1; const c1 = calculateTotalStats().combatPower; state.enhance[slot] = e0; return [c0, c1];
}
function equipHost() {
  let h = document.getElementById('equip-grid');
  if (!h) { const w = document.getElementById('slot-weapon'); if (!w) return null; h = w.parentElement; h.id = 'equip-grid'; h.className = 'grid grid-cols-4 gap-1.5 text-center text-[10px]'; }
  return h;
}
function renderEquipSlots() {
  const h = equipHost(); if (!h) return;
  h.innerHTML = EQUIP_SLOTS.map(slot => {
    const si = SLOT_INFO[slot], id = state.equipment[slot], it = id && ITEMS[id], e = (state.enhance || {})[slot] || 0;
    if (!it) return `<button data-eslot="${slot}" class="tap-effect bg-slate-950 p-1.5 rounded-lg border border-dashed border-slate-700 flex flex-col items-center"><span class="text-slate-500">${si.i} ${si.n}</span><span class="text-slate-600 mt-1">空</span><span class="text-slate-700">-</span></button>`;
    const m = enhMult(e), st = [it.atk && `攻${Math.floor(it.atk * m)}`, it.def && `防${Math.floor(it.def * m)}`, it.hp && `血${Math.floor(it.hp * m)}`].filter(Boolean).join(' ');
    return `<button data-eslot="${slot}" class="tap-effect bg-slate-950 p-1.5 rounded-lg border flex flex-col items-center" style="border-color:${Q_COL[it.quality] || '#475569'}77"><span class="text-slate-500">${si.i} ${si.n}</span><span class="font-bold mt-0.5 leading-tight" style="color:${Q_COL[it.quality] || '#e2e8f0'}">${it.name}</span><span class="text-amber-300 font-mono">${e ? '+' + e : '+0'}</span><span class="text-slate-400">${st || '-'}</span></button>`;
  }).join('');
  const b = document.getElementById('btn-enhance-equipped'); if (b) b.innerText = `🔨 強化裝備(目前上限 +${enhCap()})`;
}
function renderEnhModal() {
  const box = document.getElementById('enh-rows'); if (!box) return;
  box.innerHTML = '<button data-enhall="1" class="tap-effect w-full mb-1 py-1.5 rounded bg-gradient-to-r from-orange-700 to-amber-600 text-white font-bold text-xs">⚡ 全部強化(平均提升所有裝備,直到資源用盡)</button>' + EQUIP_SLOTS.map(slot => {
    const si = SLOT_INFO[slot], id = state.equipment[slot], it = id && ITEMS[id], e = (state.enhance || {})[slot] || 0;
    if (!it) return `<div class="flex justify-between items-center py-1 border-b border-slate-800/60 text-slate-600"><span>${si.i} ${si.n}:未穿戴</span></div>`;
    let info, can = false;
    if (e >= enhCap()) info = `<span class="text-amber-300">已達上限 +${enhCap()}</span>`;
    else {
      const c = enhCost(e), [c0, c1] = cpIfEnh(slot), okS = state.stones >= c.stone, okO = (state.inventory[c.oreKey] || 0) >= c.ore; can = okS && okO;
      info = `<span class="${okS ? 'text-slate-400' : 'text-rose-400'}">${formatNum(c.stone)}靈石</span> <span class="${okO ? 'text-slate-400' : 'text-rose-400'}">${ITEMS[c.oreKey].name}×${c.ore}</span> · 成功 ${enhChance(e)}%<br><span class="text-emerald-300">戰力 ${formatNum(c0)} → ${formatNum(c1)} (+${formatNum(c1 - c0)})</span>`;
    }
    return `<div class="flex justify-between items-center py-1.5 border-b border-slate-800/60"><div class="min-w-0"><div class="font-bold" style="color:${Q_COL[it.quality]}">${si.i} ${it.name} <span class="text-amber-300 font-mono">+${e}</span></div><div class="text-[10px] leading-snug">${info}</div></div><div class="flex flex-col gap-1 shrink-0 ml-2"><button data-enh="${slot}" ${can ? '' : 'disabled'} class="tap-effect px-2 py-1 rounded text-[11px] font-bold ${can ? 'bg-amber-600 text-slate-950' : 'bg-slate-800 text-slate-500'}">強化</button><button data-enhx="${slot}" ${can ? '' : 'disabled'} class="tap-effect px-2 py-0.5 rounded text-[10px] ${can ? 'bg-amber-900 text-amber-100' : 'bg-slate-800 text-slate-600'}">連續</button></div></div>`;
  }).join('');
}
/* ---------- 靈根:單項鎖定洗髓 ---------- */
const ROOT_KEYS = ['metal', 'wood', 'water', 'fire', 'earth'], ROOT_CN = { metal: '金', wood: '木', water: '水', fire: '火', earth: '土' };
const rootLocked = () => { state.rootLock = state.rootLock || {}; return ROOT_KEYS.filter(k => state.rootLock[k]); };
const rootCost = () => 100 * Math.pow(2, rootLocked().length);
function renderRootLocks() {
  const L = rootLocked();
  ROOT_KEYS.forEach(k => {
    const v = document.getElementById('root-val-' + k); if (!v) return; const cell = v.parentElement, on = !!state.rootLock[k];
    if (v.innerText !== String(state.root[k])) v.innerText = state.root[k]; // 修正:讀檔後顯示值要與實際靈根同步
    cell.dataset.rk = k; cell.style.cursor = 'pointer'; cell.style.position = 'relative';
    cell.style.outline = on ? '2px solid #fbbf24' : 'none'; cell.style.background = on ? '#3b2a05' : '';
    let tag = cell.querySelector('.rl'); if (!tag) { tag = document.createElement('div'); tag.className = 'rl text-[10px]'; cell.appendChild(tag); }
    tag.innerText = on ? '🔒保留' : '🔓可洗'; tag.style.color = on ? '#fbbf24' : '#64748b';
  });
  { const g = document.getElementById('root-grade-text'), avg = ROOT_KEYS.reduce((a, k) => a + state.root[k], 0) / 5; if (g) g.innerText = `靈根資質:五行均值 ${avg.toFixed(1)} (吐納速度 +${Math.floor((avg / 10) * 3)}%)`; }
  const b = document.getElementById('btn-wash-root'); if (b) b.innerText = `靈泉洗髓 (${formatNum(rootCost())}靈石)`;
  const host = document.getElementById('root-val-metal')?.parentElement?.parentElement;
  if (host) { let hint = document.getElementById('root-lock-hint'); if (!hint) { hint = document.createElement('p'); hint.id = 'root-lock-hint'; hint.className = 'text-[11px] text-slate-400 mt-2'; host.after(hint); }
    hint.innerHTML = `💡 點選單項靈根可<b class="text-amber-300">鎖定保留</b>,只洗未鎖定的;鎖得越多越貴(目前鎖 ${L.length} 項:每鎖 1 項費用 ×2)。`; }
}
function toggleRootLock(k) {
  state.rootLock = state.rootLock || {};
  if (!state.rootLock[k] && rootLocked().length >= 4) { showToast('最多鎖定四項,否則無從洗髓。'); return; }
  state.rootLock[k] = !state.rootLock[k]; renderRootLocks(); saveGame();
}
washRoot = function () {
  const cost = rootCost();
  if (state.stones < cost) { showToast(`靈石不足,需 ${formatNum(cost)} 靈石引靈泉洗髓!`); return; }
  const lock = state.rootLock || {}, nr = Object.assign({}, state.root);
  ROOT_KEYS.forEach(k => { if (!lock[k]) nr[k] = Math.floor(Math.random() * 50 + 30); });
  const sum = r => ROOT_KEYS.reduce((a, k) => a + r[k], 0), oldT = sum(state.root), newT = sum(nr);
  const diff = ROOT_KEYS.filter(k => !lock[k]).map(k => `${ROOT_CN[k]} ${state.root[k]}→${nr[k]}`).join('、');
  if (newT < oldT) {
    pendingRoot = nr; window._pendingRootCost = cost;
    const m = document.getElementById('modal-wash-root-confirm'), d = document.getElementById('wash-root-confirm-desc');
    if (m && d) { d.innerText = `本次洗髓(${diff})五行總合為 ${newT},低於原先 ${oldT}!確定替換?(花費 ${formatNum(cost)} 靈石)`; m.classList.remove('hidden'); }
  } else { state.stones -= cost; applyNewRoot(nr); showToast(`靈泉淬骨!(${diff})總質 ${oldT} → ${newT}`); }
};
const _applyNewRoot0 = applyNewRoot;
applyNewRoot = function (r) { _applyNewRoot0(r); renderRootLocks(); updateRedDots && updateRedDots(); };
/* ---------- 煉丹爐 / 鍛造台動畫 ---------- */
const ALCH_SVG = `<svg viewBox="0 0 320 150" class="w-full block" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="cs-br" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fcd34d"/><stop offset=".5" stop-color="#b45309"/><stop offset="1" stop-color="#78350f"/></linearGradient><radialGradient id="cs-gl"><stop offset="0" stop-color="#fff7ae" stop-opacity=".95"/><stop offset="1" stop-color="#f59e0b" stop-opacity="0"/></radialGradient></defs>
<ellipse cx="160" cy="140" rx="96" ry="7" fill="#000" opacity=".4"/>
<g class="cs-ring"><circle cx="160" cy="76" r="64" fill="none" stroke="#fbbf24" stroke-width="1.5" stroke-dasharray="5 7" opacity=".55"/><circle cx="160" cy="76" r="52" fill="none" stroke="#fde68a" stroke-width="1" stroke-dasharray="2 9" opacity=".5"/><text x="160" y="8" text-anchor="middle" font-size="10" fill="#fbbf24" opacity=".7">乾　坤　震　巽</text></g>
<circle class="cs-glow" cx="160" cy="76" r="70" fill="url(#cs-gl)" opacity="0"/>
<g class="cs-fire"><path class="cs-fl" d="M128 138 q-8 -22 6 -34 q2 14 12 12 q-4 12 -2 22z" fill="#f97316"/><path class="cs-fl f2" d="M150 138 q-10 -30 10 -46 q4 18 14 16 q-2 14 0 30z" fill="#fb923c"/><path class="cs-fl f3" d="M176 138 q-4 -20 12 -30 q4 12 10 12 q-4 10 -2 18z" fill="#f97316"/><path class="cs-fl f2" d="M156 138 q-2 -16 6 -24 q5 10 8 24z" fill="#fde047"/></g>
<g class="cs-ding"><path d="M122 46 q38 -28 76 0z" fill="url(#cs-br)"/><circle cx="160" cy="22" r="5" fill="#fde68a"/>
<rect x="104" y="52" width="14" height="22" rx="6" fill="none" stroke="#b45309" stroke-width="4"/><rect x="202" y="52" width="14" height="22" rx="6" fill="none" stroke="#b45309" stroke-width="4"/>
<path d="M112 46 h96 q8 42 -16 62 q-32 12 -64 0 q-24 -20 -16 -62z" fill="url(#cs-br)" stroke="#78350f" stroke-width="2"/>
<path d="M126 108 l-8 22 M194 108 l8 22 M160 112 v20" stroke="#92400e" stroke-width="7" stroke-linecap="round"/>
<text x="160" y="86" text-anchor="middle" font-size="30" font-weight="900" fill="#451a03" opacity=".75" font-family="serif">丹</text></g>
<g class="cs-smoke"><circle class="cs-sm" cx="150" cy="20" r="6" fill="#cbd5e1"/><circle class="cs-sm s2" cx="166" cy="20" r="8" fill="#cbd5e1"/><circle class="cs-sm s3" cx="158" cy="20" r="5" fill="#e2e8f0"/></g></svg>`;
const FORGE_SVG = `<svg viewBox="0 0 320 150" class="w-full block" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="cs-ir" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#94a3b8"/><stop offset="1" stop-color="#334155"/></linearGradient><radialGradient id="cs-gl2"><stop offset="0" stop-color="#fff7ae" stop-opacity=".95"/><stop offset="1" stop-color="#f97316" stop-opacity="0"/></radialGradient></defs>
<rect x="10" y="40" width="64" height="96" rx="8" fill="#292524" stroke="#57534e" stroke-width="2"/><path class="cs-fl" d="M24 128 q-6 -26 8 -40 q2 14 12 12 q-2 14 0 28z" fill="#f97316"/><path class="cs-fl f2" d="M44 128 q-8 -34 10 -50 q4 18 12 16 q-2 16 0 34z" fill="#fb923c"/><path class="cs-fl f3" d="M34 128 q-2 -14 6 -22 q4 10 6 22z" fill="#fde047"/><rect x="10" y="30" width="64" height="12" rx="4" fill="#44403c"/>
<ellipse cx="170" cy="140" rx="86" ry="7" fill="#000" opacity=".4"/>
<circle class="cs-glow" cx="170" cy="92" r="60" fill="url(#cs-gl2)" opacity="0"/>
<g class="cs-inkg"><path d="M112 138 h116 l-10 -26 h-96z" fill="url(#cs-ir)" stroke="#0f172a" stroke-width="2"/><path d="M100 96 h140 q-6 18 -30 18 h-80 q-24 0 -30 -18z" fill="url(#cs-ir)" stroke="#0f172a" stroke-width="2"/><path d="M100 96 l-26 4 l26 10z" fill="#64748b"/>
<rect class="cs-ingot" x="146" y="84" width="48" height="12" rx="3" fill="#f97316"/></g>
<g class="cs-hammer"><rect x="236" y="14" width="10" height="70" rx="4" fill="#92400e" transform="rotate(-24 241 80)"/><rect x="208" y="6" width="48" height="22" rx="4" fill="#64748b" stroke="#0f172a" stroke-width="2" transform="rotate(-24 241 80)"/></g></svg>`;
function ensureCraftScenes() {
  const css = `<style id="cs-css">.cs-scene{position:relative;border-radius:12px;overflow:hidden;border:1px solid rgba(180,83,9,.5);background:radial-gradient(ellipse at 50% 120%,#7c2d12 0,#1c1917 55%,#0c0a09 100%)}
.cs-scene.forge{border-color:rgba(8,145,178,.5);background:radial-gradient(ellipse at 20% 100%,#7c2d12 0,#1e293b 50%,#020617 100%)}
.cs-ring{transform-origin:160px 76px;animation:csr 16s linear infinite}.cs-run .cs-ring{animation-duration:1.1s}@keyframes csr{to{transform:rotate(360deg)}}
.cs-fl{transform-box:fill-box;transform-origin:50% 100%;animation:csf .7s ease-in-out infinite alternate}.cs-fl.f2{animation-duration:.5s}.cs-fl.f3{animation-duration:.9s}
@keyframes csf{from{transform:scaleY(.75) scaleX(1.05)}to{transform:scaleY(1.2) scaleX(.9)}}
.cs-run .cs-fl{animation-duration:.14s;filter:brightness(1.4) drop-shadow(0 0 6px #fde047)}
.cs-run .cs-ding{animation:csk .09s linear infinite}@keyframes csk{0%,100%{transform:translate(0,0)}33%{transform:translate(-1.5px,1px)}66%{transform:translate(1.5px,-1px)}}
.cs-sm{opacity:0;animation:css 3.2s ease-out infinite}.cs-sm.s2{animation-delay:1s}.cs-sm.s3{animation-delay:2s}@keyframes css{0%{transform:translateY(0) scale(.5);opacity:.5}100%{transform:translateY(-34px) scale(2);opacity:0}}
.cs-glow{transition:opacity .25s}.cs-burst .cs-glow{opacity:1}.cs-ingot{animation:csi 1.6s ease-in-out infinite alternate}@keyframes csi{from{fill:#ea580c}to{fill:#fdba74}}
.cs-hammer{transform-box:view-box;transform-origin:241px 80px}.cs-run .cs-hammer{animation:csh .28s ease-in infinite}@keyframes csh{0%{transform:rotate(-8deg)}50%{transform:rotate(-34deg)}100%{transform:rotate(14deg)}}
.cs-res{position:absolute;left:50%;top:46%;transform:translate(-50%,-50%) scale(.2);opacity:0;text-align:center;pointer-events:none}.cs-res .ic{font-size:54px;filter:drop-shadow(0 0 14px #fde047)}.cs-res .nm{font-size:12px;font-weight:700;color:#fde68a;text-shadow:0 1px 3px #000}
.cs-res.show{animation:csres 1.5s ease-out forwards}@keyframes csres{0%{opacity:0;transform:translate(-50%,-30%) scale(.2)}25%{opacity:1;transform:translate(-50%,-60%) scale(1.25)}70%{opacity:1;transform:translate(-50%,-80%) scale(1)}100%{opacity:0;transform:translate(-50%,-110%) scale(1)}}
.cs-stat{position:absolute;left:8px;bottom:6px;font-size:10px;color:#fbbf24;opacity:.85}</style>`;
  if (!document.getElementById('cs-css')) document.head.insertAdjacentHTML('beforeend', css);
  [['alch', 'subtab-alchemy-content', ALCH_SVG, '紫金八卦神農鼎 · 火候正盛', ''], ['forge', 'subtab-forge-content', FORGE_SVG, '地火玄冥天機爐 · 百鍊成器', 'forge']].forEach(([k, host, svg, cap, cls]) => {
    if (document.getElementById('cs-' + k)) return; const h = document.getElementById(host); if (!h) return;
    h.insertAdjacentHTML('afterbegin', `<div id="cs-${k}" class="cs-scene ${cls}">${svg}<div class="cs-stat">${cap}</div><div class="cs-res"><div class="ic"></div><div class="nm"></div></div></div>`);
  });
}
function playCraftFx(kind, icon, name, n, icons) {
  const sc = document.getElementById('cs-' + kind); if (!sc || !sc.offsetParent) return;
  sc.classList.remove('cs-burst'); sc.classList.add('cs-run');
  const W = sc.clientWidth || 320, H = sc.clientHeight || 150, cx = W * .5, cy = H * .55;
  const fly = (txt, x0, y0, x1, y1, dur, delay) => { const e = document.createElement('span'); e.innerHTML = txt; e.style.cssText = `position:absolute;left:${x0}px;top:${y0}px;font-size:20px;pointer-events:none`; sc.appendChild(e); const a = e.animate([{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: `translate(${x1 - x0}px,${y1 - y0}px) scale(.3)`, opacity: .1 }], { duration: dur, delay, easing: 'ease-in', fill: 'both' }); a.onfinish = () => e.remove(); };
  if (kind === 'alch') { const ic = (icons && icons.length ? icons : ['🌿']); for (let i = 0; i < 6; i++) fly(ic[i % ic.length], Math.random() < .5 ? 6 : W - 30, 10 + Math.random() * H * .5, cx - 10, cy - 10, 650, i * 90); }
  else { [300, 580, 860].forEach(t => setTimeout(() => { sc.classList.add('cs-burst'); setTimeout(() => sc.classList.remove('cs-burst'), 90); for (let i = 0; i < 9; i++) fly(['✦', '·', '✧'][i % 3], W * .53, H * .58, W * .53 + (Math.random() - .5) * 150, H * .58 - 20 - Math.random() * 60, 420, 0); }, t)); }
  setTimeout(() => {
    sc.classList.add('cs-burst'); const r = sc.querySelector('.cs-res'); r.querySelector('.ic').innerHTML = icon; r.querySelector('.nm').textContent = (kind === 'alch' ? '丹成 · ' : '器成 · ') + name + (n > 1 ? ' ×' + n : '');
    r.classList.remove('show'); void r.offsetWidth; r.classList.add('show');
  }, kind === 'alch' ? 800 : 1000);
  setTimeout(() => { sc.classList.remove('cs-run', 'cs-burst'); }, 2200);
}
const _craftAlchemy0 = craftAlchemy;
craftAlchemy = function (idx, all) {
  const rec = ALCHEMY_RECIPES[idx], b = state.inventory[rec.giveId] || 0;
  _craftAlchemy0(idx, all);
  const d = (state.inventory[rec.giveId] || 0) - b;
  if (d > 0) { playCraftFx('alch', ITEMS[rec.giveId].icon, rec.name, d, rec.need.map(n => ITEMS[n.item].icon)); renderCrafting(); }
};
craftForge = function (idx) {
  const rec = FORGE_RECIPES[idx];
  if (!rec.need.every(n => (state.inventory[n.item] || 0) >= n.count)) { showToast('靈礦材料不足,無法鍛器!'); return; }
  rec.need.forEach(n => { state.inventory[n.item] -= n.count; if (state.inventory[n.item] <= 0) delete state.inventory[n.item]; });
  state.inventory[rec.giveItem] = (state.inventory[rec.giveItem] || 0) + 1;
  const it = ITEMS[rec.giveItem], cur = state.equipment[it.slot];
  audio.playFanfare();
  if (!cur || !ITEMS[cur] || gearScore(it) > gearScore(ITEMS[cur])) { showToast(`天降神光!鍛造出【${it.name}】並自動穿戴!`); equipItem(rec.giveItem); }
  else showToast(`鍛造出【${it.name}】(不及身上裝備,已存入儲物袋)。`);
  playCraftFx('forge', it.icon, it.name, 1);
  renderCrafting(); renderInventory(); updateTopBar(); renderProfile(); saveGame();
};
const CU = { kind: 'all', slot: 'all', allA: false, allF: false };
const ALCH_KIND = { all: '全部', qi: '修為丹', perm: '淬體丹', skill: '神通丹', heal: '療傷' };
const chip = (attr, key, label, on) => `<button data-${attr}="${key}" class="tap-effect px-2 py-1 rounded-full text-[10px] border ${on ? 'bg-amber-600 text-white border-amber-400' : 'bg-slate-900 text-slate-400 border-slate-700'}">${label}</button>`;
renderCrafting = function () {
  ensureCraftScenes();
  const rt = state.realmIdx || 0;
  const A = document.getElementById('alchemy-recipes-list');
  if (A) {
    let h = `<div class="flex flex-wrap gap-1.5 mb-1">${Object.keys(ALCH_KIND).map(k => chip('cu', k, ALCH_KIND[k], CU.kind === k)).join('')}${chip('cua', '1', CU.allA ? '✔顯示全部階' : '顯示全部階', CU.allA)}</div>`, shown = 0;
    ALCHEMY_RECIPES.forEach((rec, idx) => {
      const can = rec.need.every(n => (state.inventory[n.item] || 0) >= n.count);
      if (CU.kind !== 'all' && rec.kind !== CU.kind) return;
      if (!CU.allA && !can && rec.tier > rt + 1) return;
      shown++; const batch = maxAlchemyBatch(rec);
      const needStr = rec.need.map(n => { const have = state.inventory[n.item] || 0; return `<span class="${have >= n.count ? 'text-slate-400' : 'text-rose-400'}">${ITEMS[n.item].icon}${n.name} ${have}/${n.count}</span>`; }).join(' · ');
      h += `<div class="bg-slate-950 p-2.5 rounded-lg border ${can ? 'border-amber-700/60' : 'border-slate-800'} flex items-center justify-between text-xs"><div class="min-w-0"><div class="font-serif-tc font-bold text-amber-300 text-sm">${ITEMS[rec.giveId].icon} ${rec.name} <span class="text-[10px] text-slate-500">${TIER_NAME[rec.tier]}${(state.inventory[rec.giveId] || 0) ? ' · 持有 ' + state.inventory[rec.giveId] : ''}</span></div><div class="text-[11px] text-slate-400">${rec.desc}</div><div class="text-[10px] mt-1">${needStr}</div></div><div class="flex flex-col items-stretch gap-1 flex-shrink-0 ml-2"><button data-action="craft-alchemy" data-index="${idx}" ${can ? '' : 'disabled'} class="tap-effect px-3 py-1.5 rounded text-xs font-bold ${can ? 'bg-amber-600 text-slate-950 shadow' : 'bg-slate-800 text-slate-500'}">煉製</button>${batch > 1 ? `<button data-action="craft-alchemy-all" data-index="${idx}" class="tap-effect px-3 py-1 rounded text-[11px] font-bold bg-amber-800 text-amber-100">全煉 ×${batch}</button>` : ''}</div></div>`;
    });
    if (!shown) h += '<div class="text-[11px] text-slate-500 p-3 text-center">此分類尚無可見的丹方(提升境界或勾選「顯示全部階」)。</div>';
    A.innerHTML = h;
  }
  const F = document.getElementById('forge-recipes-list');
  if (F) {
    let h = `<div class="flex flex-wrap gap-1.5 mb-1">${chip('cf', 'all', '全部', CU.slot === 'all')}${EQUIP_SLOTS.map(s => chip('cf', s, SLOT_INFO[s].i + SLOT_INFO[s].n, CU.slot === s)).join('')}${chip('cfa', '1', CU.allF ? '✔顯示全部階' : '顯示全部階', CU.allF)}</div>`, shown = 0;
    FORGE_RECIPES.forEach((rec, idx) => {
      if (CU.slot !== 'all' && rec.slot !== CU.slot) return;
      const can = rec.need.every(n => (state.inventory[n.item] || 0) >= n.count), it = ITEMS[rec.giveItem];
      if (!CU.allF && !can && (rec.tier > rt + 1 || rec.tier < rt - 1)) return;
      shown++;
      const cur = state.equipment[it.slot] && ITEMS[state.equipment[it.slot]], diff = cur ? gearScore(it) - gearScore(cur) : null;
      const cmp = diff === null ? '<span class="text-sky-300">新欄位</span>' : diff > 0 ? `<span class="text-emerald-300">▲ 勝過身上 ${Math.round(diff / Math.max(1, gearScore(cur)) * 100)}%</span>` : '<span class="text-slate-500">▼ 不及身上</span>';
      const st = [it.atk && `攻+${it.atk}`, it.def && `防+${it.def}`, it.hp && `氣血+${it.hp}`].filter(Boolean).join(' ');
      const needStr = rec.need.map(n => { const have = state.inventory[n.item] || 0; return `<span class="${have >= n.count ? 'text-slate-400' : 'text-rose-400'}">${ITEMS[n.item].icon}${n.name} ${have}/${n.count}</span>`; }).join(' · ');
      h += `<div class="bg-slate-950 p-2.5 rounded-lg border ${can ? 'border-cyan-700/60' : 'border-slate-800'} flex items-center justify-between text-xs"><div class="min-w-0"><div class="font-serif-tc font-bold text-sm" style="color:${Q_COL[it.quality] || '#67e8f9'}">${it.icon} ${rec.name}</div><div class="text-[11px] text-slate-400">${SLOT_INFO[it.slot] ? SLOT_INFO[it.slot].n : ''} · ${rec.desc && rec.desc.startsWith('【') ? rec.desc : ''} ${st} ${cmp}</div><div class="text-[10px] mt-1">${needStr}</div></div><div><button data-action="craft-forge" data-index="${idx}" ${can ? '' : 'disabled'} class="tap-effect px-3 py-1.5 rounded text-xs font-bold ${can ? 'bg-cyan-600 text-slate-950 shadow' : 'bg-slate-800 text-slate-500'}">鍛造</button></div></div>`;
    });
    if (!shown) h += '<div class="text-[11px] text-slate-500 p-3 text-center">此部位暫無可見的圖紙(切換部位或勾選「顯示全部階」)。</div>';
    F.innerHTML = h;
  }
};

