
/* ===== v11.0:介面重整 —— 人物頁(概覽/修行)・洞府場景熱點・行囊瘦身・仙途收斂 ===== */
(function () {
  const $ = id => document.getElementById(id), X = window.X5; if (!X) return;
  const R = () => state.realmIdx || 0;
  const st = document.createElement('style');
  st.textContent = `
  #tab-techniques.pc-ov>*{display:none!important}
  #pc44.xl #pc44-ov{display:none}
  #pc44{margin-bottom:10px}
  #pc44 .seg{display:flex;gap:6px;margin-bottom:8px}
  #pc44 .seg button{flex:1;padding:8px 4px;border-radius:10px;border:1px solid #334155;background:#0f172a;color:#94a3b8;font-weight:800;font-size:13px}
  #pc44 .seg button.on{background:linear-gradient(135deg,#b45309,#f59e0b);color:#fff;border-color:#fbbf24}
  #pc44-ov>*{margin-bottom:10px}
  #pc44-hd{display:flex;align-items:center;gap:10px;background:linear-gradient(135deg,#0f172a,#1e1b4b);border:1px solid #334155;border-radius:12px;padding:10px 12px}
  #pc44-hd .nm{font-weight:900;color:#fde68a;font-size:15px}
  #pc44-hd .sb{font-size:11px;color:#94a3b8;margin-top:2px}
  #pc44-hd .cp{margin-left:auto;text-align:right;font-size:10px;color:#94a3b8}
  #pc44-hd .cp b{display:block;font-size:16px;color:#fbbf24}
  #pc44-hd button{padding:5px 9px;border-radius:9px;border:1px solid #6366f1;background:#312e81;color:#e0e7ff;font-size:11px;font-weight:800}
  #m6-inv{display:none!important}
  #m6-tech [data-m6="5"]{display:none!important}
  #m6-tech{grid-template-columns:repeat(2,1fr)!important}
  #hub44{position:relative;width:100%;aspect-ratio:1/.9;border-radius:14px;overflow:hidden;border:1px solid #334155;background:linear-gradient(180deg,#172033 0%,#10283a 34%,#123227 68%,#0a1c15 100%)}
  #hub44 .ph{position:absolute;left:8px;bottom:5px;font-size:9px;color:#475569;pointer-events:none}
  #hub44 .h44{position:absolute;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;border-radius:12px;border:1px solid rgba(255,255,255,.28);color:#fff;padding:0;box-shadow:0 3px 10px rgba(0,0,0,.45)}
  #hub44 .h44 .ic{font-family:'Noto Serif TC','Songti TC',serif;font-weight:900;font-size:26px;line-height:1;text-shadow:0 2px 4px rgba(0,0,0,.6)}
  #hub44 .h44 .nm{font-size:12px;font-weight:800;text-shadow:0 1px 3px rgba(0,0,0,.7)}
  #hub44 [data-m6] .sb{display:none}
  #hub44 .h44 .sb2{font-size:10px;color:#e2e8f0;opacity:.9;min-height:12px}
  #hub44 .h44.lkd{filter:grayscale(.85) brightness(.55)}
  #hub44 .h44.lk{opacity:1!important}
  #hub44 .h44 .sb{font-size:10px;color:#e2e8f0;opacity:.9;min-height:12px}
  #hub44 .h44 .x5-dot{position:absolute;right:5px;top:5px}
  #hub44 .h44:active{transform:scale(.97)}
  #hub44 .a{background:linear-gradient(135deg,#7c2d12,#c2410c)}
  #hub44 .b{background:linear-gradient(135deg,#1e3a8a,#3b82f6)}
  #hub44 .c{background:linear-gradient(135deg,#581c87,#a855f7)}
  #hub44 .d{background:linear-gradient(135deg,#14532d,#22c55e)}
  #hub44 .e{background:linear-gradient(135deg,#713f12,#ca8a04)}
  #rec44{background:#0f172a;border:1px solid #1e293b;border-radius:12px;padding:12px}
  #rec44 .t{font-weight:800;color:#fcd34d;font-size:12px;border-bottom:1px solid #1e293b;padding-bottom:6px;margin-bottom:8px}
  #sm44-b .rw{border:1px solid #334155;background:#0f172a;border-radius:10px;padding:8px 10px;margin-bottom:6px}
  #sm44-b .rw .h{display:flex;justify-content:space-between;font-size:12px;font-weight:800;color:#fde68a}
  #sm44-b .rw .h i{font-style:normal;font-size:10px;color:#94a3b8;font-weight:600}
  #sm44-b .rw .s{font-size:11px;color:#cbd5e1;margin-top:3px;line-height:1.5}
  #sm44-b .rw.ok{border-color:#0d9488}
  #sm44-b .rw.go{border-color:#f59e0b;background:#1c1409}
  #sm44-b .eqb{margin-top:6px;padding:5px 10px;border-radius:8px;border:1px solid #475569;background:#1e293b;color:#e2e8f0;font-size:11px;font-weight:800}
  #sm44-b .eqb.on{background:#0f766e;border-color:#2dd4bf}`;
  document.head.appendChild(st);

  /* ---------- 導覽列改名 ---------- */
  const rn = (tab, txt) => { const sp = document.querySelector(`.nav-tab-btn[data-tab="${tab}"] span:last-child`); if (sp) sp.textContent = txt; };
  rn('tab-techniques', '人物'); rn('tab-inventory', '行囊');

  /* ---------- 人物頁 ---------- */
  const tec = $('tab-techniques'); let mode = 'ov';
  let bar = $('pc44'); if (!bar) { bar = document.createElement('div'); bar.id = 'pc44';
  bar.innerHTML = `<div class="seg"><button data-pc44="ov">概覽</button><button data-pc44="xl">修行</button></div><div id="pc44-ov"><div id="pc44-hd"></div></div>`;
  tec.parentNode.insertBefore(bar, tec); }
  const syncVis = () => { bar.style.display = tec.classList.contains('hidden') ? 'none' : ''; };
  new MutationObserver(syncVis).observe(tec, { attributes: true, attributeFilter: ['class'] }); syncVis();
  const ov = $('pc44-ov');
  function setMode(m) { mode = m; tec.classList.toggle('pc-ov', m === 'ov'); bar.classList.toggle('xl', m === 'xl'); bar.querySelectorAll('[data-pc44]').forEach(b => b.classList.toggle('on', b.dataset.pc44 === m)); try { if (m === 'ov') { renderEquipSlots(); renderHd(); } } catch (e) { } }
  bar.addEventListener('click', e => { const b = e.target.closest('[data-pc44]'); if (b) setMode(b.dataset.pc44); });
  window.PC44 = { mode: setMode };
  function renderHd() {
    const h = $('pc44-hd'); if (!h) return;
    let cp = 0, sc = '';
    try { cp = calculateTotalStats().combatPower; } catch (e) { }
    try { const S = window.SCH19 && SCH19.SCH(); if (S && S.main) sc = '本命' + SCH19.SC[S.main].n + (S.sub ? '・輔修' + SCH19.SC[S.sub].n : ''); } catch (e) { }
    const rl = (typeof REALM_DATA !== 'undefined' && REALM_DATA[R()]) ? REALM_DATA[R()].name : '';
    const html = `<div><div class="nm">${state.name || '道友'}</div><div class="sb">${rl}${sc ? '・' + sc : ''}</div></div><div class="cp">戰力<b>${formatNum(cp)}</b></div><button data-l14="open">更衣</button>`;
    if (h.dataset.s !== html) { h.dataset.s = html; h.innerHTML = html; }
  }
  /* 裝備、屬性搬進人物頁概覽 */
  const eg = $('equip-grid'), eqCard = eg && eg.parentElement;
  if (eqCard) ov.appendChild(eqCard);
  let moved = false;
  function moveStats() {
    if (moved) return;
    const rec = $('m6-rec'), sm = $('stat-max-hp'); if (!sm) return;
    const card = sm.closest('.bg-gradient-to-br'); if (!card) return;
    moved = true;
    const recT = $('tab-records');
    let box = $('rec44'); if (!box) { box = document.createElement('div'); box.id = 'rec44'; box.innerHTML = '<div class="t">圖鑑・稱號</div>';
    if (rec) box.appendChild(rec);
    recT.insertBefore(box, recT.firstChild); }
    ov.appendChild(card);
    const bd = $('stat-breakdown'), det = bd && bd.closest('details'); if (det) ov.appendChild(det);
    renderHd();
  }
  moveStats();
  const mt = setInterval(() => { moveStats(); if (moved) clearInterval(mt); }, 300); setTimeout(() => clearInterval(mt), 12000);
  setInterval(() => { if (mode === 'ov' && tec && !tec.classList.contains('hidden')) renderHd(); }, 1000);
  setMode('ov');

  /* ---------- 洞府場景(色塊佔位,之後換成場景圖) ---------- */
  const abode = $('tab-abode'), bk = $('breakthrough-card');
  let hub = $('hub44'); if (!hub) { hub = document.createElement('div'); hub.id = 'hub44';
  hub.innerHTML = `
    <button class="h44 e" data-x5="sm44.open" style="left:47%;top:1%;width:38%;height:33%"><span class="ic">門</span><span class="nm">山門</span><span class="sb" data-s="sm"></span></button>
    <button class="h44 a" data-m6="5" style="left:1%;top:41%;width:32%;height:25%"><span class="ic">煉</span><span class="nm">煉體台</span><span class="sb"></span><span class="sb2" data-u="煉體"></span></button>
    <button class="h44 c" data-m6="6" style="left:38%;top:34%;width:29%;height:29%"><span class="ic">寶</span><span class="nm">藏寶閣</span><span class="sb"></span><span class="sb2" data-u="法寶"></span></button>
    <button class="h44 b" data-m6="7" style="left:68%;top:38%;width:31%;height:28%"><span class="ic">獸</span><span class="nm">靈獸園</span><span class="sb"></span><span class="sb2" data-u="靈寵"></span></button>
    <button class="h44 d" data-h44="gd" style="left:4%;top:68%;width:92%;height:30%"><span class="ic">田</span><span class="nm">洞府靈田</span><span class="sb" data-s="gd"></span></button>
    `;
  if (bk) bk.parentNode.insertBefore(hub, bk.nextSibling); else abode.appendChild(hub); }
  hub.addEventListener('click', e => {
    const b = e.target.closest('[data-h44="gd"]'); if (!b) return;
    const g = $('garden15'); if (!g || !g.offsetParent) { showToast('【靈田】尚未開啟:煉丹開放後可用。'); return; }
    const body = g.querySelector('.gd-g');
    if (body && !body.offsetParent) { const t = g.querySelector('.t'); if (t) t.click(); }
    setTimeout(() => g.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  });
  /* 山門:遊學紀錄與宗門功法裝備 */
  const SE = () => window.SECT9, capEq = () => 1 + Math.floor(R() / 2);
  const needSub = r => r === 0 ? 4 : 2;
  const RN = r => (typeof REALM_DATA !== 'undefined' && REALM_DATA[r]) ? REALM_DATA[r].name : '境界' + r;
  const yxAvail = () => { try { const r = R(); if (r > 7) return false; const id = 'yx.' + r, nd = (Array.isArray(ST28.nodes) ? ST28.nodes : Object.values(ST28.nodes)).find(x => x.id === id); const seen = state.story27 && state.story27.seen && state.story27.seen[id]; return !!nd && !seen && !!nd.at && !!nd.at(); } catch (e) { return false; } };
  X.sheet('sm44', '🏯 山門', b => {
    const E = SE(); if (!E) { b.innerHTML = '<div class="x5-sub">尚無宗門資料。</div>'; return; }
    const grad = state.sectGrad || {}, sk = state.sectSk || {}, cur = R();
    let h = `<div class="x5-sub" style="margin-bottom:8px">青雲令牌的遊學機緣:每個大境界站穩後可擇一宗門,通過守山長老的試煉,習得其獨門功法並得信物。</div><div id="sm44-b">`;
    for (let r = 0; r <= 7; r++) {
      const got = E.SECTS.filter(x => x.r === r && grad[x.id]);
      if (got.length) { h += got.map(x => `<div class="rw ok"><div class="h"><span>${x.n}</span><i>${RN(r)}</i></div><div class="s">功法《${x.sk.n.replace(/[《》]/g, '')}》・信物 ${x.tr.n}</div></div>`).join(''); }
      else if (r === cur) h += `<div class="rw ${yxAvail() ? 'go' : ''}"><div class="h"><span>${RN(r)}・遊學</span><i>${yxAvail() ? '機緣已到' : '尚未開啟'}</i></div><div class="s">${yxAvail() ? '機緣已到,稍候便會有人來請。' : `${r === 0 ? '練氣' : RN(r)}第 ${needSub(r)} 層後觸發。`}</div></div>`;
      else if (r < cur) h += `<div class="rw"><div class="h"><span>${RN(r)}・遊學</span><i>未成行</i></div><div class="s">當時未遊學,此機緣已過。</div></div>`;
      else h += `<div class="rw" style="opacity:.55"><div class="h"><span>${RN(r)}・遊學</span><i>未到</i></div></div>`;
    }
    const ids = Object.keys(sk).filter(k => E.SECTS.some(x => x.id === k));
    const eqn = ids.filter(k => sk[k].eq).length;
    h += `<div class="x5-sub" style="margin:10px 0 6px">已學宗門功法・裝備欄 <b>${eqn}/${capEq()}</b>(隨境界增加)</div><div id="sm44-s">`;
    if (!ids.length) h += '<div class="x5-sub">尚未習得任何宗門功法。</div>';
    ids.forEach(id => {
      const x = E.SECTS.find(t => t.id === id), on = sk[id].eq; let fx = ''; try { fx = X.fxText(x.sk.E) || ''; } catch (e) { }
      h += `<div class="rw ${on ? 'ok' : ''}"><div class="h"><span>${sk45(x.id)}${x.sk.n}</span><i>${x.n}</i></div><div class="s">${x.sk.d}${fx ? '<br>' + fx : ''}</div><button class="eqb ${on ? 'on' : ''}" data-x5="sm44.eq" data-k="${id}">${on ? '已裝備(點此卸下)' : '裝備'}</button></div>`;
    });
    b.innerHTML = h + '</div></div>';
  });
  X.act('sm44.open', () => X.open('sm44'));
  X.act('sm44.eq', t => {
    const id = t.dataset.k, e = (state.sectSk || {})[id]; if (!e) return;
    const n = Object.keys(state.sectSk).filter(k => state.sectSk[k] && state.sectSk[k].eq).length;
    if (!e.eq && n >= capEq()) { showToast(`功法欄已滿(上限 ${capEq()})`); return; }
    e.eq = !e.eq; try { saveGame(); updateTopBar(); } catch (x) { } X.refresh('sm44');
  });
  /* 場景徽記 */
  function hubBadge() {
    const g = $('garden15'), gs = hub.querySelector('[data-s="gd"]');
    if (gs) { const m = g && (g.querySelector('.t') || {}).innerText; const k = m && m.match(/(\d+)\s*塊可收/); const v = g ? (k ? `${k[1]} 塊可收` : '生長中') : '尚未開啟'; if (gs.textContent !== v) gs.textContent = v; }
    const sm = hub.querySelector('[data-s="sm"]'), btn = hub.querySelector('[data-x5="sm44.open"]');
    if (sm) { const a = yxAvail(), v = a ? '遊學機緣!' : ''; if (sm.textContent !== v) sm.textContent = v; const has = !!btn.querySelector('.x5-dot'); if (a && !has) btn.insertAdjacentHTML('beforeend', '<i class="x5-dot"></i>'); else if (!a && has) btn.querySelector('.x5-dot').remove(); }
  }
  function hubLock() {
    hub.querySelectorAll('[data-u]').forEach(sp => {
      const U = window.UNLOCK9 && UNLOCK9.U && UNLOCK9.U.find(x => x.name === sp.dataset.u), btn = sp.closest('.h44');
      let on = true; try { on = !U || UNLOCK9.on(U.k); } catch (e) { }
      btn.classList.toggle('lkd', !on);
      const v = on ? '' : ((U && U.hint) || '') + '開放'; if (sp.textContent !== v) sp.textContent = v;
    });
  }
  setInterval(() => { hubBadge(); hubLock(); }, 1200); setTimeout(hubLock, 500); setTimeout(hubBadge, 400);
})();
