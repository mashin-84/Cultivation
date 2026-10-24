/* ===== v7.1:一鍵功能(奇遇一鍵完成 / 神通一鍵領悟 / 裝備全部強化) ===== */
/* ---- 神通一鍵領悟 ---- */
function skAllCounts() {
  const S = skState();
  const learn = SKILLS.filter(s => !S.learned[s.id] && state.realmIdx >= s.realm && state.stones >= s.cost).length;
  const up = SKILLS.filter(s => S.learned[s.id] && skCanUp(s.id) && state.stones >= skUpCost(s, S.learned[s.id].lv)).length;
  return { learn, up };
}
function skAll() {
  const S = skState(), got = [], ups = [];
  SKILLS.filter(s => !S.learned[s.id] && state.realmIdx >= s.realm).sort((a, b) => a.cost - b.cost).forEach(sk => {
    if (state.stones < sk.cost) return;
    state.stones -= sk.cost; S.learned[sk.id] = { lv: 1, exp: 0 };
    const i = S.equipped.slice(0, skSlots()).findIndex(x => !x); if (i >= 0) S.equipped[i] = sk.id;
    got.push(sk.name);
  });
  SKILLS.forEach(sk => {
    const e = S.learned[sk.id]; if (!e || !skCanUp(sk.id)) return;
    const c = skUpCost(sk, e.lv); if (state.stones < c) return;
    state.stones -= c; e.lv++; e.exp = 0; ups.push(`${sk.name}Lv.${e.lv}`);
  });
  if (!got.length && !ups.length) { showToast('目前沒有可領悟或可升級的神通(靈石、境界或熟練度不足)。'); return; }
  audio.playFanfare();
  showToast(`一鍵領悟:${got.length ? '新學 ' + got.join('、') : ''}${got.length && ups.length ? ';' : ''}${ups.length ? '升級 ' + ups.join('、') : ''}`);
  updateTopBar(); renderSkills(true); saveGame();
}
// (原「一鍵領悟」按鈕包裝已移除:v10.2 的 renderSkills 自帶此按鈕)
/* ---- 裝備:全部強化 ---- */
function enhanceAll() {
  const dead = new Set(); let ok = 0, fail = 0, cnt = {};
  for (let i = 0; i < 400; i++) {
    const cand = EQUIP_SLOTS.filter(s => !dead.has(s) && state.equipment[s] && ITEMS[state.equipment[s]]).sort((a, b) => ((state.enhance || {})[a] || 0) - ((state.enhance || {})[b] || 0));
    if (!cand.length) break;
    const s = cand[0], r = enhanceEquippedGear(s, true);
    if (r === 'ok') { ok++; cnt[s] = (cnt[s] || 0) + 1; } else if (r === 'fail') fail++; else dead.add(s);
  }
  renderInventory(); updateTopBar(); renderProfile(); saveGame(); if (typeof renderEnhModal === 'function') renderEnhModal();
  if (!ok && !fail) { showToast('沒有可強化的裝備(未穿戴、已達上限,或靈石/靈礦不足)。'); return; }
  audio.playFanfare();
  showToast(`全部強化:成功 ${ok} 次、失敗 ${fail} 次 — ${Object.keys(cnt).map(k => SLOT_INFO[k].n + '+' + cnt[k]).join('、') || '無提升'}`);
}
/* ---- 奇遇:一鍵完成 ---- */
function ensureEvBatchModal() {
  if (document.getElementById('modal-ev-batch')) return;
  document.body.insertAdjacentHTML('beforeend', `<div id="modal-ev-batch" class="fixed inset-0 z-50 bg-black/85 hidden flex items-center justify-center p-4"><div class="bg-slate-900 border border-amber-500/60 rounded-xl p-4 w-full max-w-sm space-y-3"><h3 id="evb-title" class="font-serif-tc font-black text-amber-300 text-center">📜 一鍵處理奇遇簿</h3><div id="evb-body" class="text-xs space-y-1 max-h-[55vh] overflow-y-auto"></div><div id="evb-actions" class="flex gap-2"></div></div></div>`);
}
function openEvBatch() {
  const n = (state.pendingEvents || []).length; if (!n) return;
  if (eventModalOpen()) { showToast('請先處理目前開啟的奇遇視窗。'); return; }
  ensureEvBatchModal();
  document.getElementById('evb-title').textContent = `📜 一鍵處理奇遇簿(${n} 件)`;
  document.getElementById('evb-body').innerHTML = '<div class="text-slate-300">選擇處理方式,將依序為每件奇遇自動做出同一種選擇(涉及取捨的「道途抉擇」須親自決定,不會被一併處理):</div><div class="text-emerald-300">🛡️ 穩健:全選保底選項,幾乎無風險。</div><div class="text-rose-300">⚔️ 冒險:全選高風險高報酬選項,可能失敗或損失資源。</div><div class="text-slate-500">(需要戰鬥的奇遇會直接略過,不會交戰)</div>';
  document.getElementById('evb-actions').innerHTML = '<button data-evb="B" class="tap-effect flex-1 py-2 rounded bg-emerald-700 text-white font-bold text-xs">🛡️ 全部穩健</button><button data-evb="A" class="tap-effect flex-1 py-2 rounded bg-rose-700 text-white font-bold text-xs">⚔️ 全部冒險</button><button data-evb="x" class="tap-effect px-3 py-2 rounded bg-slate-800 text-slate-300 text-xs">取消</button>';
  document.getElementById('modal-ev-batch').classList.remove('hidden');
}
function resolveAllEvents(mode) {
  const list = [...(state.pendingEvents || [])], lines = []; let good = 0, bad = 0;
  list.forEach(entry => {
    state.pendingEvents = (state.pendingEvents || []).filter(e => e !== entry);
    const ev = CHOICE_EVENTS[entry.idx]; if (!ev) return;
    if (ev.isAl) { state.pendingEvents.push(entry); return; }
    const area = AREAS_DATA[entry.areaId] || AREAS_DATA[state.currentArea] || AREAS_DATA[0];
    let res = null; try { res = (mode === 'A' ? ev.actionA : ev.actionB)(area); } catch (e) { res = null; }
    res = res || { ok: null, icon: '🏮', title: '機緣已逝', gains: [] };
    if (res.ok === true) good++; else if (res.ok === false) bad++;
    lines.push(`<div class="rounded border px-2 py-1 ${res.ok === false ? 'border-rose-700/60 bg-rose-950/30' : 'border-amber-700/50 bg-slate-950'}"><div class="font-bold ${res.ok === false ? 'text-rose-300' : 'text-amber-200'}">${ev.icon} ${ev.title} → ${res.title || ''}${res.battle ? '(已避開交戰)' : ''}</div>${(res.gains || []).length ? `<div class="text-slate-300">${res.gains.join(' ・ ')}</div>` : ''}</div>`);
  });
  updateTopBar(); renderInventory(); renderAutoStatusBar(); saveGame(); audio.playFanfare();
  document.getElementById('evb-title').textContent = `✅ 已處理 ${list.length - (state.pendingEvents || []).filter(e => list.includes(e)).length} 件奇遇(${mode === 'A' ? '冒險' : '穩健'})`;
  document.getElementById('evb-body').innerHTML = `<div class="text-slate-300 mb-1">順遂 ${good} 件、受挫 ${bad} 件</div>${lines.join('')}`;
  document.getElementById('evb-actions').innerHTML = '<button data-evb="x" class="tap-effect w-full py-2 rounded bg-amber-600 text-slate-950 font-bold text-xs">收下機緣</button>';
}
const _renderAutoStatusBar0 = renderAutoStatusBar;
renderAutoStatusBar = function () {
  _renderAutoStatusBar0();
  const bar = document.getElementById('auto-explore-status-bar'), ev = document.getElementById('btn-pending-events'); if (!bar || !ev) return;
  let b = document.getElementById('btn-events-batch');
  if (!b) { ev.insertAdjacentHTML('beforebegin', '<button id="btn-events-batch" class="hidden shrink-0 ml-auto px-2 py-0.5 rounded bg-emerald-600 text-white font-bold border border-emerald-300">⚡一鍵完成</button>'); b = document.getElementById('btn-events-batch'); ev.classList.remove('ml-auto'); }
  b.classList.toggle('hidden', (state.pendingEvents || []).length === 0);
};
window.addEventListener('load', () => {
  ensureEvBatchModal(); renderAutoStatusBar();
  document.body.addEventListener('click', e => {
    let b;
    if ((b = e.target.closest('#btn-events-batch'))) { openEvBatch(); return; }
    if ((b = e.target.closest('[data-evb]'))) { const k = b.dataset.evb; if (k === 'x') document.getElementById('modal-ev-batch').classList.add('hidden'); else resolveAllEvents(k); return; }
    if ((b = e.target.closest('[data-skall]')) && !b.disabled) { skAll(); return; }
    if ((b = e.target.closest('[data-enhall]')) && !b.disabled) { enhanceAll(); return; }
  });
  const xr = document.getElementById('ext-root');
  if (xr && !document.getElementById('btn-wb-test')) xr.insertAdjacentHTML('beforeend', '<details class="bg-slate-900 p-3 rounded-xl border border-slate-800"><summary class="font-serif-tc font-bold text-fuchsia-300 text-xs">🌋 天地異種 體驗</summary><div class="mt-2 space-y-1.5 text-[11px] text-slate-400">天地異種 平時機率極低(每步 0.3%)。想先看看長什麼樣、怎麼打,可以點下方按鈕召喚一隻(不會增加 Boss 等級計數;擊敗仍會得到真的寶箱)。<button id="btn-wb-test" class="tap-effect w-full py-1.5 rounded bg-fuchsia-700 text-white font-bold text-xs">🌋 召喚天地異種(體驗用)</button></div></details>');
  document.getElementById('btn-wb-test')?.addEventListener('click', () => { if ((state.realmIdx || 0) < 0) return; if (currentBattle) { showToast('戰鬥中無法召喚。'); return; } goToTab('tab-adventure'); wbSpawn(true); });
  state.autoBattle = true; // v7.2:戰鬥一律自動
  const ae = document.getElementById('btn-auto-explore');
  if (ae) {
    if (!document.getElementById('btn-speed-out')) ae.insertAdjacentHTML('afterend', '<button id="btn-speed-out" class="tap-effect col-span-2 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-serif-tc text-xs rounded-lg border border-slate-700"></button>');
    const sb = document.getElementById('btn-speed-out'), upd = () => { sb.innerText = `⏩ 倍速 ${state.battleSpeed || 1}x`; };
    upd(); sb.addEventListener('click', () => { toggleBattleSpeed(); upd(); saveGame(); });
  }
  const eb = document.getElementById('btn-enhance-equipped');
  if (eb && !document.getElementById('btn-enhance-all')) eb.insertAdjacentHTML('beforebegin', '<button id="btn-enhance-all" data-enhall="1" class="text-xs px-2.5 py-1 mr-1.5 bg-gradient-to-r from-orange-700 to-amber-600 text-white rounded border border-amber-400 font-bold">⚡ 全部強化</button>');
});

const GEN_IMG={"alch": "data:image/webp;base64,@@IMG:GEN_IMG/alch@@", "forge": "data:image/webp;base64,@@IMG:GEN_IMG/forge@@", "body": "data:image/webp;base64,@@IMG:GEN_IMG/body@@", "treasure": "data:image/webp;base64,@@IMG:GEN_IMG/treasure@@", "pet": "data:image/webp;base64,@@IMG:GEN_IMG/pet@@", "t_abode": "data:image/webp;base64,@@IMG:GEN_IMG/t_abode@@", "t_tech": "data:image/webp;base64,@@IMG:GEN_IMG/t_tech@@", "t_adv": "data:image/webp;base64,@@IMG:GEN_IMG/t_adv@@", "t_craft": "data:image/webp;base64,@@IMG:GEN_IMG/t_craft@@", "t_ming": "data:image/webp;base64,@@IMG:GEN_IMG/t_ming@@", "t_inv": "data:image/webp;base64,@@IMG:GEN_IMG/t_inv@@", "t_rec": "data:image/webp;base64,@@IMG:GEN_IMG/t_rec@@"};

const GEN2={"B1": "data:image/webp;base64,@@IMG:GEN2/B1@@", "B2": "data:image/webp;base64,@@IMG:GEN2/B2@@", "B3": "data:image/webp;base64,@@IMG:GEN2/B3@@", "B4": "data:image/webp;base64,@@IMG:GEN2/B4@@", "B5": "data:image/webp;base64,@@IMG:GEN2/B5@@", "B6": "data:image/webp;base64,@@IMG:GEN2/B6@@", "P0": "data:image/webp;base64,@@IMG:GEN2/P0@@", "P1": "data:image/webp;base64,@@IMG:GEN2/P1@@", "P2": "data:image/webp;base64,@@IMG:GEN2/P2@@", "P3": "data:image/webp;base64,@@IMG:GEN2/P3@@", "P4": "data:image/webp;base64,@@IMG:GEN2/P4@@", "P5": "data:image/webp;base64,@@IMG:GEN2/P5@@", "t0": "data:image/webp;base64,@@IMG:GEN2/t0@@", "t1": "data:image/webp;base64,@@IMG:GEN2/t1@@", "t2": "data:image/webp;base64,@@IMG:GEN2/t2@@", "t3": "data:image/webp;base64,@@IMG:GEN2/t3@@", "t4": "data:image/webp;base64,@@IMG:GEN2/t4@@", "t5": "data:image/webp;base64,@@IMG:GEN2/t5@@", "t6": "data:image/webp;base64,@@IMG:GEN2/t6@@", "t7": "data:image/webp;base64,@@IMG:GEN2/t7@@", "t8": "data:image/webp;base64,@@IMG:GEN2/t8@@", "t9": "data:image/webp;base64,@@IMG:GEN2/t9@@", "t10": "data:image/webp;base64,@@IMG:GEN2/t10@@", "t11": "data:image/webp;base64,@@IMG:GEN2/t11@@", "t12": "data:image/webp;base64,@@IMG:GEN2/t12@@", "t13": "data:image/webp;base64,@@IMG:GEN2/t13@@", "t14": "data:image/webp;base64,@@IMG:GEN2/t14@@", "t15": "data:image/webp;base64,@@IMG:GEN2/t15@@", "t16": "data:image/webp;base64,@@IMG:GEN2/t16@@", "t17": "data:image/webp;base64,@@IMG:GEN2/t17@@", "t18": "data:image/webp;base64,@@IMG:GEN2/t18@@", "t19": "data:image/webp;base64,@@IMG:GEN2/t19@@", "t20": "data:image/webp;base64,@@IMG:GEN2/t20@@", "t21": "data:image/webp;base64,@@IMG:GEN2/t21@@", "t22": "data:image/webp;base64,@@IMG:GEN2/t22@@", "t23": "data:image/webp;base64,@@IMG:GEN2/t23@@", "t24": "data:image/webp;base64,@@IMG:GEN2/t24@@", "t25": "data:image/webp;base64,@@IMG:GEN2/t25@@", "t26": "data:image/webp;base64,@@IMG:GEN2/t26@@", "t27": "data:image/webp;base64,@@IMG:GEN2/t27@@", "t28": "data:image/webp;base64,@@IMG:GEN2/t28@@", "t29": "data:image/webp;base64,@@IMG:GEN2/t29@@", "t30": "data:image/webp;base64,@@IMG:GEN2/t30@@", "t31": "data:image/webp;base64,@@IMG:GEN2/t31@@"};

