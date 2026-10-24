/* ===== v9.6:破局建議(卡關時列出最划算的提升途徑)· 乾坤熔爐(多餘材料煉化) ===== */
(function () {
  const $ = id => document.getElementById(id), X = window.X5, fmt = n => formatNum(n);
  const st = document.createElement('style');
  st.textContent = `.bk-row{display:flex;gap:8px;align-items:center;background:#0f172a;border:1px solid #1e293b;border-radius:10px;padding:8px;margin-bottom:6px}
.bk-row .ic{font-size:22px;width:30px;text-align:center;flex:none}.bk-row .mid{flex:1;min-width:0}.bk-row .nm{font-weight:800;color:#fde68a;font-size:13px}
.bk-row .g{color:#4ade80;font-weight:800}.bk-row.no{opacity:.62}.bk-no{font-size:10px;color:#f87171}
.fn-tabs{display:flex;gap:4px;margin:6px 0}.fn-tabs button{flex:1;padding:7px 2px;border-radius:8px;background:#1e293b;color:#94a3b8;font-size:12px;font-weight:700;border:1px solid #334155}.fn-tabs button.on{background:#b45309;color:#fff;border-color:#f59e0b}`;
  document.head.appendChild(st);

  