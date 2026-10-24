/* =====================  乾坤熔爐  ===================== */
  const FV = () => {
    const f = state.furnace = (state.furnace && typeof state.furnace === 'object') ? state.furnace : {};
    if (f.mode !== 'rn' && f.mode !== 'st' && f.mode !== 'qi') f.mode = 'rn'; if (typeof f.keep !== 'number') f.keep = 30; f.on = !!f.on; if (typeof f.d !== 'string') f.d = '';
    ['tot', 'rn', 'st', 'qi', 'n', 'rem'].forEach(k => { if (typeof f[k] !== 'number') f[k] = 0; }); return f;
  };
  const RV = 500, RN_DAY = 40, QI_K = 20, ST_K = 1.5;
  const isMat = k => { const it = ITEMS[k]; return !!it && it.type === 'material' && k !== 'rn_1' && it.price > 0; };
  function preview() {
    const f = FV(), inv = state.inventory || {}; let cnt = 0, val = 0, kinds = 0;
    Object.keys(inv).forEach(k => { if (!isMat(k)) return; const n = inv[k] - f.keep; if (n > 0) { cnt += n; val += n * price(k); kinds++; } });
    return { cnt, val, kinds };
  }
  const todayS = () => new Date().toDateString();
  function smelt(auto) {
    const f = FV(), inv = state.inventory; let cnt = 0, val = 0;
    Object.keys(inv).forEach(k => { if (!isMat(k)) return; const n = inv[k] - f.keep; if (n <= 0) return; cnt += n; val += n * price(k); inv[k] -= n; if (inv[k] <= 0) delete inv[k]; });
    if (!cnt) return null;
    if (f.d !== todayS()) { f.d = todayS(); f.n = 0; }
    let msg = '', o = { st: 0, rn: 0, qi: 0 };
    if (f.mode === 'qi') { o.qi = Math.floor(val * QI_K); state.qi += o.qi; state.totalCultivatedQi = (state.totalCultivatedQi || 0) + o.qi; f.qi += o.qi; msg = `修為 +${fmt(o.qi)}`; }
    else if (f.mode === 'st') { o.st = Math.floor(val * ST_K); state.stones += o.st; f.st += o.st; msg = `靈石 +${fmt(o.st)}`; }
    else {
      const tot = val + (f.rem || 0), want = Math.floor(tot / RV), left = Math.max(0, RN_DAY - f.n), give = Math.min(want, left), rest = tot - want * RV, over = (want - give) * RV;
      f.rem = rest; if (give > 0) { state.inventory.rn_1 = (state.inventory.rn_1 || 0) + give; f.n += give; f.rn += give; o.rn = give; }
      if (over > 0) { o.st = Math.floor(over * ST_K); state.stones += o.st; f.st += o.st; }
      msg = (give ? `器紋石 +${give}` : '') + (give && o.st ? '、' : '') + (o.st ? `靈石 +${fmt(o.st)}(今日器紋石已達 ${RN_DAY} 上限)` : '') || '餘韻積蓄中';
    }
    f.tot += cnt; return { cnt, msg, o };
  }
  X.sheet('fn', '⚗️ 乾坤熔爐', b => {
    const f = FV(), p = preview(), MODE = { rn: ['🪨 器紋石', '重洗器紋用;每日最多 ' + RN_DAY + ' 枚,超出改發靈石'], st: ['💎 靈石', '價值 ×1.5,比直接賣多 50%'], qi: ['✨ 修為', '價值 ×' + QI_K + ' 點修為,直接增加'] };
    const yld = f.mode === 'qi' ? `修為 +${fmt(Math.floor(p.val * QI_K))}` : f.mode === 'st' ? `靈石 +${fmt(Math.floor(p.val * ST_K))}` : `器紋石 約 +${Math.floor((p.val + f.rem) / RV)}`;
    let h = `<div class="x5-sub" style="margin-bottom:6px">器堂老匠留下的舊熔爐,爐火至今未熄。把儲物袋裡「超出保留量」的靈草、靈礦、妖獸材料投入熔爐,依價值煉化成想要的資源。保留量以內的材料不動,煉丹、鍛造、強化照常夠用。</div>
<div class="x5-card"><div class="x5-sub">煉化成</div><div class="fn-tabs">${['rn', 'st', 'qi'].map(m => `<button data-x5="fn.mode" data-m="${m}" class="${f.mode === m ? 'on' : ''}">${MODE[m][0]}</button>`).join('')}</div><div class="x5-sub">${MODE[f.mode][1]}</div>
<div class="x5-sub" style="margin-top:8px">每種材料保留</div><div class="fn-tabs">${[10, 30, 60, 100].map(k => `<button data-x5="fn.keep" data-k="${k}" class="${f.keep === k ? 'on' : ''}">${k} 份</button>`).join('')}</div></div>
<div class="x5-card" style="margin-top:8px"><div class="x5-row" style="justify-content:space-between"><span>目前可煉化</span><b style="color:#fde68a">${fmt(p.cnt)} 件(${p.kinds} 種)</b></div><div class="x5-sub" style="margin-top:2px">預計獲得:<b style="color:#4ade80">${p.cnt ? yld : '—'}</b></div>
<div class="x5-row" style="margin-top:8px"><button class="x5-btn am" data-x5="fn.go" style="flex:1" ${p.cnt ? '' : 'disabled'}>🔥 立即煉化</button><button class="x5-btn ${f.on ? '' : 'gy'}" data-x5="fn.auto" style="flex:1">${f.on ? '✅ 自動煉化:開' : '⬜ 自動煉化:關'}</button></div>
<div class="x5-sub" style="margin-top:6px">自動煉化開啟後,熔爐每隔數秒會把超出保留量的材料自動煉掉,儲物袋不再被雜物塞滿。</div></div>
<div class="x5-sub" style="margin-top:8px">累計煉化 ${fmt(f.tot)} 件:器紋石 ${fmt(f.rn)}・靈石 ${fmt(f.st)}・修為 ${fmt(f.qi)}${f.d === todayS() ? `・今日器紋石 ${f.n}/${RN_DAY}` : ''}</div>`;
    b.innerHTML = h;
  });
  const after = () => { try { updateTopBar(); renderInventory(); } catch (e) { } saveGame(); X.refresh('fn'); };
  X.act('fn.open', () => X.open('fn'));
  X.act('fn.mode', t => { FV().mode = t.dataset.m; saveGame(); X.refresh('fn'); });
  X.act('fn.keep', t => { FV().keep = +t.dataset.k; saveGame(); X.refresh('fn'); });
  X.act('fn.auto', () => { const f = FV(); f.on = !f.on; saveGame(); X.refresh('fn'); showToast(f.on ? '乾坤熔爐開始自動煉化多餘材料。' : '已關閉自動煉化。'); });
  X.act('fn.go', () => { const r = smelt(false); if (!r) { showToast('沒有超出保留量的材料。'); return; } try { audio.playFanfare(); } catch (e) { } showToast(`⚗️ 煉化 ${fmt(r.cnt)} 件材料:${r.msg}`); after(); });
  let lastMsg = 0;
  setInterval(() => {
    try {
      const f = FV(); if (!f.on || !state.inventory) return; const r = smelt(true); if (!r) return;
      try { updateTopBar(); renderInventory(); } catch (e) { } saveGame(); X.refresh('fn');
      if (Date.now() - lastMsg > 90000) { lastMsg = Date.now(); showToast(`⚗️ 乾坤熔爐自動煉化 ${fmt(r.cnt)} 件:${r.msg}`); }
    } catch (e) { }
  }, 6000);
  /* 儲物頁入口 */
  function mountBtn() {
    const a = $('btn-sell-low-mats'); if (!a || $('btn-furnace')) return;
    a.insertAdjacentHTML('afterend', '<button id="btn-furnace" data-x5="fn.open" class="tap-effect px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-orange-300 border border-orange-900">⚗️ 乾坤熔爐</button>');
  }
  mountBtn(); setTimeout(mountBtn, 1200);
  window.BK23 = { cands };
})();


