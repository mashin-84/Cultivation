/* ===== v5:命格(煉體/法寶/靈寵)獨立介面 + 關卡地圖 ===== */
let _artN = 0;
function art(inner, c1, c2, extra) {
  const n = ++_artN;
  const body = inner.replace(/#G\b/g, '#g' + n);
  return `<svg viewBox="0 0 64 64" class="w-full h-full ${extra || ''}" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="b${n}"><stop offset="0" stop-color="${c1}" stop-opacity=".5"/><stop offset="1" stop-color="${c1}" stop-opacity="0"/></radialGradient><linearGradient id="g${n}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><circle cx="32" cy="32" r="31" fill="url(#b${n})"/>${body}</svg>`;
}
const STAGE_INFO = [
  { n: '煉皮', d: '皮如牛革,刀劍難傷', c1: '#fcd34d', c2: '#b45309' },
  { n: '煉肉', d: '血肉如銅,氣力倍增', c1: '#fb7185', c2: '#9f1239' },
  { n: '煉筋', d: '筋韌如龍,柔而不折', c1: '#fbbf24', c2: '#c2410c' },
  { n: '煉骨', d: '骨似白玉,堅不可摧', c1: '#f1f5f9', c2: '#94a3b8' },
  { n: '煉髓', d: '髓生紫電,百脈貫通', c1: '#67e8f9', c2: '#0e7490' },
  { n: '煉血', d: '血如汞漿,不朽之軀', c1: '#f87171', c2: '#7f1d1d' }
];
function stageIdx(b) { return Math.min(5, Math.floor((b || 0) / 8)); }
function bodyArt(s) {
  const I = STAGE_INFO[s]; let x = '';
  x += '<circle cx="32" cy="34" r="25" fill="none" stroke="url(#G)" stroke-width="1.5" stroke-dasharray="3 4" opacity=".6"/>';
  x += '<circle cx="32" cy="17" r="7" fill="url(#G)"/><path d="M19 57 v-17 q0 -11 13 -11 t13 11 v17z" fill="url(#G)"/>';
  if (s >= 1) x += '<path d="M24 36 q8 6 16 0 M25 44 q7 5 14 0" stroke="#fff" stroke-width="1.6" fill="none" opacity=".55"/>';
  if (s >= 2) x += '<path d="M22 32 l-5 12 M42 32 l5 12 M32 30 v24" stroke="#fff" stroke-width="1.4" opacity=".6"/>';
  if (s >= 3) x += '<path d="M27 35 h10 M27 40 h10 M28 45 h8" stroke="#0f172a" stroke-width="1.6" opacity=".6"/>';
  if (s >= 4) x += '<circle cx="32" cy="40" r="4" fill="#fff" opacity=".85"/>';
  if (s >= 5) x += '<path d="M32 2 c4 6 9 8 8 14 c-4 -2 -6 -1 -8 2 c-2 -3 -4 -4 -8 -2 c-1 -6 4 -8 8 -14z" fill="#f87171" opacity=".85"/>';
  return art(x, I.c1, I.c2);
}
const TREASURE_ART = {
  t0: ['#6ee7b7', '#047857', '<circle cx="32" cy="38" r="16" fill="url(#G)" stroke="#d1fae5" stroke-width="1.5"/><circle cx="32" cy="38" r="5.5" fill="#0f172a" stroke="#a7f3d0"/><path d="M32 22 V9 M32 9 q-6 -3 -10 2" stroke="#fbbf24" fill="none" stroke-width="1.6"/><path d="M24 32 q4 -6 12 -4" stroke="#fff" fill="none" opacity=".5"/><path d="M32 54 v7" stroke="#f87171" stroke-width="3"/>'],
  t1: ['#c4b5fd', '#6d28d9', '<circle cx="32" cy="34" r="16" fill="url(#G)"/><path d="M19 34 q6 -10 13 0 t13 0" stroke="#fff" opacity=".55" fill="none" stroke-width="2"/><circle cx="26" cy="27" r="4" fill="#fff" opacity=".45"/><path d="M32 6 v6 M29 9 h6 M50 16 v5 M47.5 18.5 h5" stroke="#fde68a" stroke-width="1.6"/>'],
  t2: ['#5eead4', '#115e59', '<circle cx="32" cy="32" r="19" fill="#1e293b" stroke="url(#G)" stroke-width="4"/><path d="M32 17 l12 7 v14 l-12 7 l-12 -7 v-14z" fill="url(#G)" opacity=".9"/><path d="M32 17 v28 M20 24 l24 14 M44 24 l-24 14" stroke="#0f172a" stroke-width="1" opacity=".6"/>'],
  t3: ['#fb923c', '#b91c1c', '<circle cx="32" cy="42" r="14" fill="url(#G)"/><path d="M32 8 c6 8 12 12 8 20 c-2 4 -4 2 -4 -2 c-4 2 -10 -2 -6 -10 c1 -3 2 -5 2 -8z" fill="#fb923c"/><path d="M32 17 c3 5 6 7 4 12 c-3 2 -7 -2 -4 -12z" fill="#fde047"/><circle cx="27" cy="38" r="3.5" fill="#fff" opacity=".5"/>'],
  t4: ['#f9a8d4', '#7c3aed', '<path d="M6 22 q13 -14 26 0 t26 0 v8 q-13 -14 -26 0 t-26 0z" fill="url(#G)"/><path d="M8 42 q13 -14 26 0 t22 0" stroke="url(#G)" stroke-width="5" fill="none" opacity=".85"/><path d="M12 52 q10 -8 20 0 t20 0" stroke="#fff" stroke-width="1.5" fill="none" opacity=".5"/>'],
  t5: ['#fde68a', '#b45309', '<rect x="14" y="36" width="36" height="17" rx="2" fill="url(#G)"/><rect x="19" y="27" width="26" height="10" rx="2" fill="url(#G)" opacity=".85"/><rect x="24" y="20" width="16" height="8" rx="2" fill="url(#G)" opacity=".7"/><path d="M32 6 l5 7 h-10z" fill="#fff" opacity=".8"/><path d="M21 44 h22 M26 49 h12" stroke="#fff" opacity=".5" stroke-width="1.5"/>'],
  t6: ['#f9a8d4', '#be185d', '<g fill="url(#G)"><ellipse cx="32" cy="32" rx="5.5" ry="15"/><ellipse cx="32" cy="32" rx="5.5" ry="15" transform="rotate(-38 32 46)"/><ellipse cx="32" cy="32" rx="5.5" ry="15" transform="rotate(38 32 46)"/><ellipse cx="32" cy="32" rx="5" ry="14" transform="rotate(-72 32 46)" opacity=".8"/><ellipse cx="32" cy="32" rx="5" ry="14" transform="rotate(72 32 46)" opacity=".8"/></g><ellipse cx="32" cy="48" rx="19" ry="4.5" fill="#0e7490" opacity=".75"/>'],
  t7: ['#a5b4fc', '#312e81', '<path d="M32 10 c-4 0 -6 3 -6 7 c-6 4 -10 12 -10 22 h32 c0 -10 -4 -18 -10 -22 c0 -4 -2 -7 -6 -7z" fill="url(#G)"/><rect x="13" y="39" width="38" height="5" rx="2" fill="#fde68a"/><circle cx="32" cy="50" r="3.5" fill="#fff" opacity=".85"/><path d="M26 28 q6 -6 12 0 q-6 6 -12 0z" stroke="#fff" opacity=".6" fill="none"/>']
};
const PET_ART = {
  p0: ['#fdba74', '#c2410c', '<path d="M12 12 l11 13 h18 l11 -13 l2 24 c0 13 -11 21 -22 21 s-22 -8 -22 -21z" fill="url(#G)"/><path d="M32 57 c-9 0 -13 -6 -15 -12 c7 4 23 4 30 0 c-2 6 -6 12 -15 12z" fill="#fff"/><circle cx="24" cy="36" r="2.2" fill="#0f172a"/><circle cx="40" cy="36" r="2.2" fill="#0f172a"/><path d="M30 45 h4 l-2 3z" fill="#0f172a"/><path d="M32 27 l1.5 3 3 .5 -2.2 2 .6 3 -2.9 -1.6 -2.9 1.6 .6 -3 -2.2 -2 3 -.5z" fill="#fde68a"/>'],
  p1: ['#86efac', '#166534', '<path d="M9 42 a23 19 0 0 1 46 0z" fill="url(#G)"/><path d="M15 36 h34 M21 28 l-5 14 M43 28 l5 14 M32 24 v18 M24 42 l8 -9 l8 9" stroke="#0f172a" opacity=".45" fill="none"/><circle cx="55" cy="38" r="6" fill="#bbf7d0"/><circle cx="57" cy="36" r="1.3" fill="#0f172a"/><rect x="14" y="42" width="9" height="9" rx="3" fill="#bbf7d0"/><rect x="38" y="42" width="9" height="9" rx="3" fill="#bbf7d0"/>'],
  p2: ['#fb923c', '#b91c1c', '<path d="M26 10 c-2 6 2 8 0 13 M32 6 c-2 6 4 8 2 15 M38 10 c0 6 4 6 2 13" stroke="#fbbf24" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="32" cy="38" r="17" fill="url(#G)"/><path d="M10 36 q-4 12 6 18 q2 -10 4 -14z M54 36 q4 12 -6 18 q-2 -10 -4 -14z" fill="#f97316"/><circle cx="26" cy="34" r="2.3" fill="#0f172a"/><circle cx="38" cy="34" r="2.3" fill="#0f172a"/><path d="M29 40 h6 l-3 6z" fill="#fde047"/>'],
  p3: ['#67e8f9', '#0e7490', '<path d="M20 61 c4 -20 8 -22 12 -26 c4 4 8 6 12 26 c-4 -8 -8 -10 -12 -12 c-4 2 -8 4 -12 12z" fill="url(#G)" opacity=".7"/><ellipse cx="32" cy="27" rx="12" ry="13" fill="url(#G)"/><path d="M32 6 c-3 4 -3 6 0 9 c3 -3 3 -5 0 -9z" fill="#fde68a"/><path d="M20 23 q-9 -3 -11 6 q8 0 13 -3z M44 23 q9 -3 11 6 q-8 0 -13 -3z" fill="#a5f3fc"/><circle cx="28" cy="26" r="2" fill="#0f172a"/><circle cx="36" cy="26" r="2" fill="#0f172a"/><path d="M30 32 h4 l-2 5z" fill="#fbbf24"/>'],
  p4: ['#e2e8f0', '#6366f1', '<path d="M17 10 q-6 9 -2 19 M47 10 q6 9 2 19" stroke="#fde68a" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M15 27 q0 -11 17 -11 t17 11 q2 19 -17 30 q-19 -11 -17 -30z" fill="url(#G)"/><path d="M19 33 q-8 4 -6 15 M45 33 q8 4 6 15" stroke="#c7d2fe" opacity=".8" fill="none" stroke-width="3"/><circle cx="26" cy="33" r="2.2" fill="#0f172a"/><circle cx="38" cy="33" r="2.2" fill="#0f172a"/><circle cx="32" cy="24" r="2.2" fill="#fde047"/><path d="M29 45 q3 3 6 0" stroke="#0f172a" fill="none"/>']
};
function tArt(t, lock) { const a = TREASURE_ART[t.id]; return lock ? art(a[2], '#475569', '#1e293b') : art(a[2], a[0], a[1]); }
function pArt(p, lock) { const a = PET_ART[p.id]; return lock ? art(a[2], '#475569', '#1e293b') : art(a[2], a[0], a[1]); }
function eggArt() { return art('<ellipse cx="32" cy="36" rx="15" ry="19" fill="url(#G)"/><circle cx="26" cy="30" r="2.5" fill="#fff" opacity=".5"/><circle cx="38" cy="40" r="3" fill="#fff" opacity=".35"/><path d="M18 40 l5 -4 l5 4 l5 -4 l5 4 l5 -4" stroke="#fff" fill="none" opacity=".6"/>', '#fde68a', '#d97706'); }
const pct = v => (v * 100).toFixed(v * 100 % 1 ? 1 : 0);
function treasureDesc(t) { return [t.hpP && `氣血+${pct(t.hpP)}%`, t.atkP && `攻擊+${pct(t.atkP)}%`, t.defP && `防禦+${pct(t.defP)}%`, t.qiP && `吐納+${pct(t.qiP)}%`, t.crit && `會心率+${t.crit}`].filter(Boolean).join(' '); }
function petDesc(p, lv) { return [p.hpP && `氣血+${pct(p.hpP * lv)}%`, p.atkP && `攻擊+${pct(p.atkP * lv)}%`, p.defP && `防禦+${pct(p.defP * lv)}%`, p.qiP && `吐納+${pct(p.qiP * lv)}%`].filter(Boolean).join(' '); }
function petUpCost(lv) { return Math.floor(300 * Math.pow(1.7, lv - 1)); }
let mingTab = 'body', _mingSig = '';
function injectExtCss() {
  if (document.getElementById('ext-css')) return;
  const st = document.createElement('style'); st.id = 'ext-css';
  st.textContent = '@keyframes fl{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}.fl{animation:fl 2.4s ease-in-out infinite}@keyframes wob{0%,100%{transform:rotate(-7deg)}50%{transform:rotate(7deg)}}.wob{animation:wob 1.1s ease-in-out infinite}@keyframes glw{0%,100%{filter:drop-shadow(0 0 3px var(--c))}50%{filter:drop-shadow(0 0 10px var(--c))}}.glw{animation:glw 2.4s ease-in-out infinite}';
  document.head.appendChild(st);
}
function eBtn(a, id, txt, on, cls) {
  return `<button data-act="${a}" data-id="${id || ''}" ${on ? '' : 'disabled'} class="tap-effect px-3 py-1.5 rounded-lg text-xs font-bold ${on ? (cls || 'bg-gradient-to-r from-amber-600 to-amber-500 text-white') : 'bg-slate-800 text-slate-500'}">${txt}</button>`;
}

function renderMingTreasure() {
  const own = TREASURES.filter(t => (state.treasures || {})[t.id]).length;
  let h = `<div class="rounded-xl border border-slate-700 bg-slate-900 p-3"><div class="flex justify-between text-xs"><span class="font-serif-tc font-bold text-amber-300">💠 法寶收藏 ${own} / 8</span><span class="text-slate-400">套裝加成</span></div>
    <div class="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800 mt-2"><div class="h-full bg-gradient-to-r from-amber-600 to-yellow-300" style="width:${own / 8 * 100}%"></div></div>
    <div class="flex justify-between text-[11px] mt-1.5"><span class="${own >= 4 ? 'text-emerald-300' : 'text-slate-500'}">${own >= 4 ? '✅' : '🔒'} 集 4 件:全屬性 +5%</span><span class="${own >= 8 ? 'text-emerald-300' : 'text-slate-500'}">${own >= 8 ? '✅' : '🔒'} 集滿:全屬性 +15%</span></div>
    <div class="text-[10px] text-slate-500 mt-1">首通各秘境必得對應法寶;Boss 有機率掉落已解鎖區域的法寶。轉世後保留。</div></div><div class="grid grid-cols-2 gap-2 mt-2">`;
  TREASURES.forEach(t => {
    const o = (state.treasures || {})[t.id];
    h += `<div class="rounded-xl border p-2 text-center ${o ? 'border-amber-500/60 bg-slate-900' : 'border-slate-800 bg-slate-950'}"><div class="relative w-16 h-16 mx-auto ${o ? 'glw' : ''}" style="--c:${TREASURE_ART[t.id][0]}">${tArt(t, !o)}${o ? '' : '<div class="absolute inset-0 flex items-center justify-center text-slate-400 text-xl font-bold">?</div>'}</div>
      <div class="text-xs font-bold mt-1 ${o ? 'text-amber-200' : 'text-slate-500'}">${o ? t.n : '未得之寶'}</div>
      <div class="text-[10px] ${o ? 'text-emerald-300' : 'text-slate-600'}">${o ? treasureDesc(t) : '???'}</div>
      <div class="text-[10px] text-slate-500">來源:通關【${AREAS_DATA[t.src].name}】</div></div>`;
  });
  return h + '</div>';
}



function storyCheck() {
  if (currentBattle) return;
  if (['modal-ascension', 'modal-tribulation', 'modal-offline', 'modal-death-reincarnate', 'modal-event-choice', 'modal-event-result', 'modal-battle-result'].some(id => { const e = document.getElementById(id); return e && !e.classList.contains('hidden'); })) return;
  state.storySeen = state.storySeen || {};
  for (const s of STORIES) {
    const need = s.k === 'p0' ? true : (state.realmIdx || 0) >= +s.k.slice(1);
    if (!need || state.storySeen[s.k]) continue;
    state.storySeen[s.k] = true;
    if (s.skip || s.k !== 'p0') continue;   /* 舊境界過場停用:改由主線劇情與突破演出承接 */
    if (s.k !== 'p0') { state.eggs = (state.eggs || 0) + 1; }
    playCinematic({ icon: s.icon, title: s.title, lines: s.lines, rewards: s.k === 'p0' ? [] : ['🥚 靈寵蛋 ×1'], continueText: '繼續修行' });
    saveGame(); return;
  }
}

/* ---------- 關卡地圖 ---------- */
const AREA_ICON = ['🏔️', '🌫️', '🌋', '⚡', '🏯', '☁️', '🌊', '🌀'].map((e, i) => `<i class="ar70" data-ai="${i}"></i>`);
const ELEM_PAL = { wood: ['#14532d', '#166534', '#4ade80'], water: ['#0c4a6e', '#075985', '#38bdf8'], fire: ['#7f1d1d', '#9a3412', '#fb923c'], metal: ['#334155', '#475569', '#e2e8f0'], earth: ['#78350f', '#92400e', '#fbbf24'] };
let _mapSig = '', _mapArea = -1;
function stagePos(i, n) {
  const per = Math.ceil(n / 2), x0 = 34, x1 = 326, dx = per > 1 ? (x1 - x0) / (per - 1) : 0;
  return i <= per ? { x: x0 + (i - 1) * dx, y: 46 } : { x: x1 - (i - per - 1) * dx, y: 132 };
}
function stagePath(k, n) {
  const per = Math.ceil(n / 2); let d = '';
  for (let i = 1; i <= k; i++) {
    const p = stagePos(i, n);
    if (i === 1) d += `M${p.x} ${p.y}`;
    else if (i === per + 1) { const q = stagePos(per, n); d += ` C${q.x + 40} ${q.y}, ${p.x + 40} ${p.y}, ${p.x} ${p.y}`; }
    else d += ` L${p.x} ${p.y}`;
  }
  return d;
}


