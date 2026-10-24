/* ===== v9.1:洞府功能入口整併(hub) ===== */
(function () {
  const $ = id => document.getElementById(id), X = window.X5, fmt = n => formatNum(n), R = () => state.realmIdx || 0;
  const st = document.createElement('style');
  st.textContent = `#cx15,#xr18,#sa19{display:none!important}
.hub19{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.hub19 button{position:relative;display:flex;flex-direction:column;align-items:center;gap:1px;padding:9px 2px 7px;border-radius:12px;background:#0f172a;border:1px solid #334155;color:#e2e8f0}
.hub19 .ic{font-size:22px;line-height:26px}.hub19 .nm{font-size:12px;font-weight:800;color:#fde68a}.hub19 .sb{font-size:10px;color:#94a3b8;max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hub19 button.a1{border-color:#b45309;background:linear-gradient(160deg,#451a03,#0f172a)}.hub19 button.a2{border-color:#be123c;background:linear-gradient(160deg,#4c0519,#0f172a)}.hub19 button.a3{border-color:#4f46e5;background:linear-gradient(160deg,#1e1b4b,#0f172a)}
.hub19 button.lk{opacity:.5}.hub19 button.sm{padding:6px 2px 5px}.hub19 button.sm .ic{font-size:18px;line-height:22px}.hub19 button.sm .nm{font-size:11px;color:#cbd5e1}`;
  document.head.appendChild(st);
  const T = [
    ['sc.open', 'a1', '🏯', '流派'], ['xj.open', 'a3', '🎐', '天機悟道'],
    ['cx.dex', 'sm', '📚', '圖鑑'], ['cx.title', 'sm', '🏅', '稱號'], ['cx.stat', 'sm', '📈', '統計'],
    ['mg.open', 'sm', '🦴', '煉體', 'body'], ['mg.open', 'sm', '💠', '法寶', 'treasure'], ['mg.open', 'sm', '🐾', '靈寵', 'pet']
  ];
  function mount() {
    if ($('hub19')) return; const g = $('garden15'); if (!g) return;
    const d = document.createElement('div'); d.id = 'hub19'; d.className = 'hub19';
    d.innerHTML = T.map(t => `<button class="${t[1]}" data-x5="${t[0]}"${t[4] ? ' data-k="' + t[4] + '"' : ''}><span class="ic">${t[2]}</span><span class="nm">${t[3]}</span><span class="sb"></span></button>`).join('');
    g.parentNode.insertBefore(d, g);
  }
  function upd() {
    mount(); const d = $('hub19'); if (!d) return; const bs = d.children, S = window.SCH19 ? SCH19.SCH() : {}, cx = $('cx15') ? $('cx15').querySelectorAll('button') : [];
    const set = (i, sub, lk, dot) => {
      const b = bs[i]; if (!b) return; const e = b.querySelector('.sb'); if (e.textContent !== sub) e.textContent = sub; b.classList.toggle('lk', !!lk);
      const has = !!b.querySelector('.x5-dot'); if (dot && !has) b.insertAdjacentHTML('beforeend', '<i class="x5-dot"></i>'); else if (!dot && has) b.querySelector('.x5-dot').remove();
    };
    const sc = window.SCH19 && S.main ? SCH19.SC[S.main] : null;
    const skl = !(R() >= 1 && window.UNLOCK9 && UNLOCK9.on('school')), xkl = !(R() >= 4 && window.UNLOCK9 && UNLOCK9.on('xian'));
    set(0, skl ? (R() < 1 ? '築基開放' : '隨劇情') : sc ? `${sc.n}${S.sub ? '+' + SCH19.SC[S.sub].n : ''}・☯${fmt(S.dao || 0)}` : '尚未擇定', skl, !skl && !S.main);
    set(1, xkl ? (R() < 4 ? '化神開放' : '隨劇情') : `🌸${fmt(state.xian || 0)}`, xkl, false);
    set(2, `${X.dexPct ? X.dexPct() : 0}%`, false, !!(cx[0] && cx[0].querySelector('.x5-dot')));
    set(3, `${Object.keys((state.titles && state.titles.got) || {}).length} 個`, false, !!(cx[1] && cx[1].querySelector('.x5-dot')));
    set(4, '紀錄・設定', false, false);
    const U9 = window.UNLOCK9; [['body', 5], ['treasure', 6], ['pet', 7]].forEach(([k, i]) => set(i, U9 && !U9.on(k) ? ((window.sysReached && sysReached(k)) ? '隨劇情' : ((U9.U.find(u => u.k === k) || {}).hint || '未開')) : '', U9 && !U9.on(k), false));
  }
  setTimeout(upd, 1300); setInterval(upd, 1500);
})();


