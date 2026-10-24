
/* ===== v12.1 介面重整・階段二:丹器頁(單爐・淺色水墨) ===== */
(function () {
  const $ = id => document.getElementById(id);
  const fm = n => (typeof formatNum === 'function' ? formatNum(Math.floor(n)) : String(Math.floor(n)));
  const on = k => { try { return window.UNLOCK9 && UNLOCK9.on ? !!UNLOCK9.on(k) : true; } catch (e) { return true; } };
  const icoH = i => i && /</.test(i) ? i : `<span class="em">${i || '📦'}</span>`;
  const QC = { common: '#6b6458', uncommon: '#3f7d4e', rare: '#2f6fa8', epic: '#7a3fa0', immortal: '#b07d1a', mythic: '#b0362c' };
  const t = $('tab-crafting'); if (!t) return;
  const CR = { m: 'alch', kind: 'all', slot: 'all', allA: false, allF: false, sel: { alch: null, forge: null } };
  const KIND = [['all', '全部'], ['qi', '修為'], ['perm', '淬體'], ['skill', '神通'], ['heal', '療傷']];
  const css = document.createElement('style');
  css.textContent = `
#cr52{--ink:#2a241c;--ink2:#6b5f4f;--seal:#9e2b25;position:relative;display:flex;flex-direction:column;gap:6px;padding:8px 10px 10px;border-radius:14px;overflow:hidden;color:var(--ink);font-family:'Noto Serif TC',serif;
 background:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 200' preserveAspectRatio='none'><path d='M0 150 Q70 95 140 135 T270 115 T400 130 V200 H0Z' fill='%23544a3c' opacity='.08'/></svg>") bottom/100% 38% no-repeat,radial-gradient(ellipse at 50% 40%,#faf6ec,#efe6d2 62%,#e2d5b8);box-shadow:inset 0 0 0 1px #cdbf9f,inset 0 0 40px rgba(120,100,60,.18)}
#tab-crafting:not([data-x32c="mk"])>:not(#cr52){display:none!important}
#tab-crafting[data-x32c="mk"]>:not(#cr52):not(.x32-mkcard){display:none!important}
#tab-crafting[data-x32c="mk"] #cr52 .bd{display:none!important}
#tab-crafting[data-x32c="mk"] #cr52{height:auto!important;margin-bottom:8px}
#cr52 .seg{display:flex;gap:6px}
#cr52 .seg button{flex:1;min-height:36px;border-radius:18px;border:1px solid #b9a98c;background:rgba(255,252,244,.6);color:var(--ink2);font-weight:800;font-size:13px;letter-spacing:2px;position:relative}
#cr52 .seg button.on{background:linear-gradient(180deg,#3a3229,#211c16);color:#f3ead6;border-color:#211c16}
#cr52 .seg button.lk{opacity:.45}
#cr52 .bd{flex:1;min-height:0;display:flex;flex-direction:column;gap:6px}
#cr52 .chips{display:flex;gap:4px;overflow-x:auto;scrollbar-width:none;flex:none}
#cr52 .chips::-webkit-scrollbar{display:none}
#cr52 .chips button{flex:none;padding:3px 10px;border-radius:12px;font-size:11px;border:1px solid #c9b994;color:var(--ink2);background:rgba(255,252,244,.55)}
#cr52 .chips button.on{background:#9e2b25;color:#fbf4e4;border-color:#9e2b25}
#cr52 .strip{display:flex;gap:6px;overflow-x:auto;scroll-snap-type:x proximity;padding:4px 2px 2px;flex:none;scrollbar-width:none}
#cr52 .strip::-webkit-scrollbar{display:none}
#cr52 .rc{flex:none;width:62px;scroll-snap-align:center;display:flex;flex-direction:column;align-items:center;gap:2px;background:none;border:0;padding:0;position:relative}
#cr52 .rc .bx{width:52px;height:52px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:26px;background:linear-gradient(160deg,#fbf7ee,#e9dfc9);box-shadow:inset 0 0 0 1.5px var(--q,#b9a98c),0 2px 4px rgba(80,60,20,.15)}
#cr52 .rc .bx .ii{width:42px;height:42px}
#cr52 .rc.no .bx{opacity:.5;filter:grayscale(.7)}
#cr52 .rc.on .bx{box-shadow:inset 0 0 0 2.5px #9e2b25,0 0 0 2px #f3ead6,0 0 10px rgba(158,43,37,.45)}
#cr52 .rc .nm{font-size:10.5px;color:var(--ink2);max-width:62px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#cr52 .rc .ct{position:absolute;top:-2px;right:2px;font-size:10px;font-weight:900;color:#fff;background:#9e2b25;border-radius:8px;padding:0 4px;line-height:15px}
#cr52 .rc .up{position:absolute;top:-2px;left:2px;font-size:10px;font-weight:900;color:#fff;background:#2f7a3e;border-radius:8px;padding:0 4px;line-height:15px}
#cr52 .fur{flex:1;min-height:0;position:relative;display:flex;align-items:flex-end;justify-content:center;touch-action:pan-y}
#cr52 .fur svg.ding{height:100%;max-height:260px;width:auto;max-width:92%}
#cr52 .fur .pd{position:absolute;left:50%;top:6%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;animation:fl52 3s ease-in-out infinite}
#cr52 .fur .pd .bx{width:62px;height:62px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:34px;background:radial-gradient(circle,#fffaf0 30%,rgba(255,240,200,0) 72%)}
#cr52 .fur .pd .bx .ii{width:52px;height:52px}
#cr52 .fur .ar{position:absolute;top:44%;width:34px;height:34px;border-radius:50%;background:rgba(43,38,32,.82);color:#f3ead6;font-weight:900;font-size:18px}
#cr52 .fur .ar.l{left:0}#cr52 .fur .ar.r{right:0}
@keyframes fl52{0%,100%{transform:translate(-50%,0)}50%{transform:translate(-50%,-6px)}}
#cr52 .flame{animation:fm52 1.2s ease-in-out infinite;transform-origin:100px 150px}
@keyframes fm52{0%,100%{opacity:.75;transform:scaleY(1)}50%{opacity:1;transform:scaleY(1.12)}}
#cr52 .inf{text-align:center;line-height:1.35;flex:none}
#cr52 .inf b{font-size:16px;font-weight:900}
#cr52 .inf .tg{font-size:10.5px;color:var(--ink2);margin-left:4px}
#cr52 .inf div{font-size:11.5px;color:var(--ink2)}
#cr52 .mats{display:flex;justify-content:center;gap:8px;flex-wrap:wrap;flex:none}
#cr52 .mats span{display:flex;align-items:center;gap:3px;padding:3px 8px;border-radius:12px;background:rgba(255,252,244,.75);border:1px solid #d6c9ab;font-size:11.5px}
#cr52 .mats span .ii,#cr52 .mats span .em{width:20px;height:20px;font-size:15px}
#cr52 .mats span.no{color:#a3352b;border-color:#d9a79f}
#cr52 .bts{display:flex;gap:8px;align-items:center;flex:none}
#cr52 .bts button{flex:1;min-height:42px;border-radius:21px;background:linear-gradient(180deg,#3a3229,#211c16);color:#f3ead6;font-weight:900;font-size:14px;letter-spacing:2px;box-shadow:0 2px 4px rgba(40,30,10,.3)}
#cr52 .bts button.pr{background:linear-gradient(180deg,#b23a2e,#7e1f18)}
#cr52 .bts button:disabled{opacity:.4}
#cr52 .bts button.sm{flex:none;width:42px;padding:0;font-size:13px;letter-spacing:0;border-radius:50%}
#cr52 .emp{flex:1;display:flex;align-items:center;justify-content:center;color:var(--ink2);font-size:12px;text-align:center}
`;
  document.head.appendChild(css);
  let root = $('cr52'); if (!root) { root = document.createElement('div'); root.id = 'cr52'; t.insertBefore(root, t.firstChild); }
  const DING = `<svg class="ding" viewBox="0 0 200 175" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="dg52" cx="45%" cy="35%" r="70%"><stop offset="0" stop-color="#6b5d4b"/><stop offset=".55" stop-color="#3a3128"/><stop offset="1" stop-color="#1c1712"/></radialGradient><radialGradient id="fl52" cx="50%" cy="80%" r="60%"><stop offset="0" stop-color="#ffd27a"/><stop offset=".5" stop-color="#e2582c" stop-opacity=".85"/><stop offset="1" stop-color="#b3261e" stop-opacity="0"/></radialGradient></defs>
<path d="M70 30 q-8 -14 4 -24 M100 26 q10 -14 -2 -24 M130 30 q8 -12 -4 -22" stroke="#7d7060" stroke-width="2" fill="none" opacity=".45" stroke-linecap="round"/>
<ellipse class="flame" cx="100" cy="150" rx="46" ry="20" fill="url(#fl52)"/>
<path d="M58 132 l-10 34 M100 138 l0 30 M142 132 l10 34" stroke="#2a241c" stroke-width="7" stroke-linecap="round"/>
<path d="M40 62 q0 74 60 76 q60 -2 60 -76 z" fill="url(#dg52)" stroke="#1c1712" stroke-width="2.5"/>
<path d="M52 82 q48 16 96 0" stroke="#c9a85a" stroke-width="2" fill="none" opacity=".7"/><path d="M60 104 q40 12 80 0" stroke="#c9a85a" stroke-width="1.5" fill="none" opacity=".5"/>
<ellipse cx="100" cy="62" rx="62" ry="12" fill="#2a241c" stroke="#1c1712" stroke-width="2"/><ellipse cx="100" cy="61" rx="52" ry="7" fill="#120e0a"/>
<path d="M36 60 q-14 -2 -14 -18 q0 -10 10 -10 M164 60 q14 -2 14 -18 q0 -10 -10 -10" stroke="#2a241c" stroke-width="6" fill="none" stroke-linecap="round"/>
<circle cx="100" cy="96" r="9" fill="none" stroke="#c9a85a" stroke-width="1.6" opacity=".8"/><path d="M100 87 a4.5 4.5 0 0 1 0 9 a4.5 4.5 0 0 0 0 9" fill="none" stroke="#c9a85a" stroke-width="1.4" opacity=".8"/></svg>`;
  const FORGE = `<svg class="ding" viewBox="0 0 200 175" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="fg52" cx="50%" cy="70%" r="60%"><stop offset="0" stop-color="#ffe08a"/><stop offset=".45" stop-color="#ef6a2c"/><stop offset="1" stop-color="#7a1b12"/></radialGradient><linearGradient id="fb52" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a4e40"/><stop offset="1" stop-color="#211c16"/></linearGradient></defs>
<path d="M86 24 q-8 -12 2 -20 M112 22 q8 -12 -2 -20" stroke="#7d7060" stroke-width="2" fill="none" opacity=".45" stroke-linecap="round"/>
<rect x="78" y="22" width="44" height="22" rx="3" fill="#2a241c"/>
<path d="M44 168 L52 52 q48 -14 96 0 L156 168 z" fill="url(#fb52)" stroke="#1c1712" stroke-width="2.5"/>
<path d="M74 168 L74 118 q26 -30 52 0 L126 168 z" fill="#140f0b"/>
<path class="flame" d="M80 168 q-2 -26 20 -40 q22 14 20 40 z" fill="url(#fg52)"/>
<path d="M56 74 h88 M54 96 h92" stroke="#c9a85a" stroke-width="1.6" opacity=".55"/>
<circle cx="100" cy="64" r="6" fill="none" stroke="#c9a85a" stroke-width="1.5" opacity=".8"/></svg>`;
  function fit() {
    const nav = $('nav25') || document.querySelector('nav'); const top = (e => { let s = 0, p = e.parentElement; while (p) { s += p.scrollTop || 0; p = p.parentElement; } return e.getBoundingClientRect().top + s; })(root);
    const nh = nav ? nav.getBoundingClientRect().height : 64; const h = Math.max(540, Math.floor(window.innerHeight - Math.max(0, top) - nh - 10));
    if (t.getAttribute('data-x32c') === 'mk') { root.style.height = ''; return; }
    if (root.style.height !== h + 'px') root.style.height = h + 'px';
  }
  const can = r => r.need.every(n => ((state.inventory || {})[n.item] || 0) >= n.count);
  const batch = r => Math.min(...r.need.map(n => Math.floor(((state.inventory || {})[n.item] || 0) / n.count)));
  function listA() {
    const rt = state.realmIdx || 0, L = [];
    ALCHEMY_RECIPES.forEach((r, i) => { if (CR.kind !== 'all' && r.kind !== CR.kind) return; if (!CR.allA && !can(r) && (r.tier || 0) > rt + 1) return; L.push(i); });
    return L;
  }
  function listF() {
    const rt = state.realmIdx || 0, L = [];
    FORGE_RECIPES.forEach((r, i) => { if (CR.slot !== 'all' && r.slot !== CR.slot) return; if (!CR.allF && !can(r) && ((r.tier || 0) > rt + 1 || (r.tier || 0) < rt - 1)) return; L.push(i); });
    return L;
  }
  const gs = it => (typeof gearScore === 'function' ? gearScore(it) : (it.atk || 0) * 2 + (it.def || 0) * 1.5 + (it.hp || 0) * .3);
  function fBetter(r) { const it = ITEMS[r.giveItem], c = state.equipment[it.slot] && ITEMS[state.equipment[it.slot]]; return !c || gs(it) > gs(c); }
  let sig = '';
  function render(force) {
    if (t.classList.contains('hidden') && !force) return;
    fit();
    const forgeOn = on('forge'), m = CR.m === 'forge' && forgeOn ? 'forge' : 'alch', mk = t.getAttribute('data-x32c') === 'mk';
    let h = `<div class="seg"><button data-c52="alch" class="${!mk && m === 'alch' ? 'on' : ''}">煉丹</button><button data-c52="forge" class="${!mk && m === 'forge' ? 'on' : ''} ${forgeOn ? '' : 'lk'}">煉器</button><button data-c52="mk" class="${mk ? 'on' : ''}">坊市</button></div><div class="bd">`;
    const L = m === 'alch' ? listA() : listF(), R = m === 'alch' ? ALCHEMY_RECIPES : FORGE_RECIPES;
    if (m === 'alch') h += `<div class="chips">${KIND.map(([k, n]) => `<button data-k52="${k}" class="${CR.kind === k ? 'on' : ''}">${n}</button>`).join('')}<button data-ta52="1" class="${CR.allA ? 'on' : ''}">全部階</button></div>`;
    else h += `<div class="chips"><button data-s52="all" class="${CR.slot === 'all' ? 'on' : ''}">全部</button>${EQUIP_SLOTS.map(s => `<button data-s52="${s}" class="${CR.slot === s ? 'on' : ''}">${SLOT_INFO[s].n}</button>`).join('')}<button data-ta52="1" class="${CR.allF ? 'on' : ''}">全部階</button></div>`;
    let sel = CR.sel[m]; if (sel == null || L.indexOf(sel) < 0) { sel = L.find(i => can(R[i])); if (sel == null) sel = L[0]; CR.sel[m] = sel; }
    h += `<div class="strip">${L.map(i => {
      const r = R[i], it = ITEMS[m === 'alch' ? r.giveId : r.giveItem] || {}, c = can(r), b = m === 'alch' ? batch(r) : 0;
      return `<button class="rc ${c ? '' : 'no'} ${i === sel ? 'on' : ''}" data-r52="${i}"><span class="bx" style="--q:${QC[it.quality] || '#b9a98c'}">${icoH(it.icon)}</span><span class="nm">${r.name}</span>${m === 'alch' && b > 0 ? `<span class="ct">${b > 99 ? '99+' : b}</span>` : ''}${m === 'forge' && c && fBetter(r) ? '<span class="up">▲</span>' : ''}</button>`;
    }).join('')}</div>`;
    if (sel == null) h += `<div class="emp">此分類暫無可見的${m === 'alch' ? '丹方' : '圖紙'}<br>(提升境界或點「全部階」)</div>`;
    else {
      const r = R[sel], it = ITEMS[m === 'alch' ? r.giveId : r.giveItem] || {}, own = (state.inventory || {})[m === 'alch' ? r.giveId : r.giveItem] || 0;
      h += `<div class="fur" data-sw52="1"><button class="ar l" data-n52="-1">‹</button>${window.FUR68 ? `<img class="ding f68" src="${m === 'alch' ? FUR68.a : FUR68.f}" alt="" draggable="false">` : (m === 'alch' ? DING : FORGE)}<div class="pd"><span class="bx">${icoH(it.icon)}</span></div><button class="ar r" data-n52="1">›</button></div>`;
      let sub = '';
      if (m === 'alch') sub = r.desc || it.desc || '';
      else {
        const cur = state.equipment[it.slot] && ITEMS[state.equipment[it.slot]], d = cur ? gs(it) - gs(cur) : null;
        const st = [it.atk && `攻擊+${fm(it.atk)}`, it.def && `防禦+${fm(it.def)}`, it.hp && `氣血+${fm(it.hp)}`].filter(Boolean).join(' ');
        sub = `${SLOT_INFO[it.slot] ? SLOT_INFO[it.slot].n : ''}・${st}　${d === null ? '<span style="color:#2f6fa8">此部位未穿戴</span>' : d > 0 ? `<span style="color:#2f7a3e;font-weight:800">▲ 勝過身上 ${Math.round(d / Math.max(1, gs(cur)) * 100)}%</span>` : '<span>▼ 不及身上</span>'}`;
      }
      h += `<div class="inf"><b style="color:${QC[it.quality] || 'var(--ink)'}">${r.name}</b><span class="tg">${typeof TIER_NAME !== 'undefined' && r.tier != null ? TIER_NAME[r.tier] : ''}${own ? `・持有 ${own}` : ''}</span><div>${sub}</div></div>`;
      h += `<div class="mats">${r.need.map(n => { const hv = (state.inventory || {})[n.item] || 0, I = ITEMS[n.item] || {}; return `<span class="${hv >= n.count ? '' : 'no'}">${icoH(I.icon)}${n.name || I.name} ${fm(hv)}/${n.count}</span>`; }).join('')}</div>`;
      if (m === 'alch') { const b = batch(r); h += `<div class="bts"><button class="pr" data-ca52="${sel}" ${b >= 1 ? '' : 'disabled'}>煉 丹</button><button data-caa52="${sel}" ${b > 1 ? '' : 'disabled'}>全煉 ×${Math.max(0, b)}</button></div>`; }
      else h += `<div class="bts"><button class="pr" data-cf52="${sel}" ${can(r) ? '' : 'disabled'}>鍛 造</button><button class="sm" data-x5="fn.open" title="乾坤熔爐">熔</button></div>`;
    }
    h += '</div>';
    if (h !== sig || force) {
      const st = root.querySelector('.strip'), sl = st ? st.scrollLeft : 0;
      const keep = [], cnt = {}; root.querySelectorAll('*').forEach(e => { const c = e.className; if (typeof c !== 'string') return; const k = cnt[c] = (cnt[c] || 0) + 1; if (e.scrollLeft > 0) keep.push([c, k, e.scrollLeft]); });   /* v109 記住每一排橫向捲動(以 class + 第幾個 對應) */
      sig = h; root.innerHTML = h;
      if (keep.length) { const c2 = {}, want = {}; keep.forEach(([c, k, x]) => { want[c + '|' + k] = x; }); root.querySelectorAll('*').forEach(e => { const c = e.className; if (typeof c !== 'string') return; const k = c2[c] = (c2[c] || 0) + 1, x = want[c + '|' + k]; if (x) e.scrollLeft = x; }); }
      const s2 = root.querySelector('.strip'); if (s2) { s2.scrollLeft = sl; const on1 = s2.querySelector('.rc.on'); if (on1 && force === 'center') on1.scrollIntoView({ inline: 'center', block: 'nearest' }); }
    }
  }
  document.addEventListener('click', e => {
    const x = e.target.closest && e.target.closest('#cr52 [data-c52],#cr52 [data-k52],#cr52 [data-s52],#cr52 [data-ta52],#cr52 [data-r52],#cr52 [data-n52]'); if (!x) {
      const a = e.target.closest && e.target.closest('#cr52 [data-ca52],#cr52 [data-caa52],#cr52 [data-cf52]'); if (!a || a.disabled) return;
      try { if (a.dataset.cf52 != null) { if (!on('forge')) return; craftForge(+a.dataset.cf52); } else craftAlchemy(+(a.dataset.ca52 ?? a.dataset.caa52), a.dataset.caa52 != null); } catch (er) { console.warn(er); }
      setTimeout(() => render(true), 60); return;
    }
    const d = x.dataset;
    if (d.c52) {
      if (d.c52 === 'mk') { t.setAttribute('data-x32c', 'mk'); render(true); return; }
      if (d.c52 === 'forge' && !on('forge')) { showToast(window.sysLockMsg ? sysLockMsg('forge') : '築基期開啟煉器室。'); return; }
      t.removeAttribute('data-x32c'); CR.m = d.c52; render('center'); return;
    }
    if (d.k52) { CR.kind = d.k52; render(true); return; }
    if (d.s52) { CR.slot = d.s52; render(true); return; }
    if (d.ta52) { if (CR.m === 'forge') CR.allF = !CR.allF; else CR.allA = !CR.allA; render(true); return; }
    if (d.r52) { CR.sel[CR.m === 'forge' && on('forge') ? 'forge' : 'alch'] = +d.r52; render(true); return; }
    if (d.n52) { step(+d.n52); return; }
  });
  function step(k) {
    const m = CR.m === 'forge' && on('forge') ? 'forge' : 'alch', L = m === 'alch' ? listA() : listF(); if (!L.length) return;
    const i = Math.max(0, L.indexOf(CR.sel[m])); CR.sel[m] = L[(i + k + L.length) % L.length]; render('center');
  }
  let tx = null;
  root.addEventListener('touchstart', e => { const f = e.target.closest && e.target.closest('[data-sw52]'); tx = f ? e.touches[0].clientX : null; }, { passive: true });
  root.addEventListener('touchend', e => { if (tx == null) return; const dx = e.changedTouches[0].clientX - tx; tx = null; if (Math.abs(dx) > 45) step(dx < 0 ? 1 : -1); }, { passive: true });
  new MutationObserver(() => render(true)).observe(t, { attributes: true, attributeFilter: ['class'] });
  window.addEventListener('resize', () => render(true));
  setInterval(() => { try { render(); } catch (e) { } }, 1200);
  setTimeout(() => render(true), 800);
  window.CR52 = { render, alert: () => { try { return on('forge') && FORGE_RECIPES.some(r => can(r) && fBetter(r)); } catch (e) { return false; } } };
})();

