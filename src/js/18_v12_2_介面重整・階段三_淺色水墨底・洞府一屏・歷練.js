
/* ===== v12.2 介面重整・階段三:淺色水墨底・洞府一屏・歷練一屏・紅點 ===== */
(function () {
  const $ = id => document.getElementById(id);
  const on = k => { try { return window.UNLOCK9 && UNLOCK9.on ? !!UNLOCK9.on(k) : true; } catch (e) { return true; } };
  const css = document.createElement('style');
  const TX = '.text-slate-100,.text-slate-200,.text-slate-300';
  const TX2 = '.text-slate-400,.text-slate-500,.text-slate-600';
  const nb = s => s.split(',').map(x => `.ink53 ${x}:not(button):not(button *)`).join(',');
  css.textContent = `
#game-app>main{background:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300' preserveAspectRatio='none'><path d='M0 230 Q60 170 130 210 T260 190 T400 200 V300 H0Z' fill='%23544a3c' opacity='.06'/></svg>") bottom/100% 40% no-repeat fixed,radial-gradient(ellipse at 50% 20%,#f6f0e2,#e9dfc8 70%,#ddd0b2)!important}
.ink53{color:#2a241c}
.ink53 .bg-slate-900:not(button),.ink53 .bg-slate-950:not(button),.ink53 .bg-slate-800:not(button),.ink53 [class*="bg-slate-900/"]:not(button),.ink53 [class*="bg-slate-950/"]:not(button),.ink53 [class*="bg-slate-800/"]:not(button){background:rgba(255,252,244,.72)!important}
.ink53 [class*="from-slate"]:not(button),.ink53 [class*="from-indigo-9"],.ink53 [class*="from-purple-9"]{background:linear-gradient(160deg,#fbf7ee,#ece2cb)!important}
.ink53 [class*="border-slate"],.ink53 [class*="border-amber-9"],.ink53 [class*="border-red-9"]{border-color:#d6c9ab!important}
.ink53 .x5-card{background:rgba(255,252,244,.72)!important;border-color:#d6c9ab!important;color:#2a241c!important}
${nb(TX)}{color:#2a241c!important}
${nb(TX2)},.ink53 .x5-sub{color:#6b5f4f!important}
${nb('.text-amber-200,.text-amber-300,.text-amber-400,.text-yellow-300,.text-yellow-400,.text-orange-300')}{color:#8a5a12!important}
${nb('.text-emerald-300,.text-emerald-400,.text-green-300,.text-green-400,.text-jade-400')}{color:#2f7a3e!important}
${nb('.text-rose-300,.text-rose-400,.text-red-300,.text-red-400')}{color:#a3352b!important}
${nb('.text-sky-300,.text-sky-400,.text-cyan-300,.text-cyan-400,.text-blue-300')}{color:#2f6fa8!important}
${nb('.text-teal-300,.text-teal-400')}{color:#2f7a6e!important}
${nb('.text-purple-300,.text-purple-400,.text-violet-300,.text-fuchsia-300,.text-indigo-300,.text-pink-300')}{color:#6b3fa0!important}
.ink53 .font-serif-tc{font-family:'Noto Serif TC',serif}
.ink53 #battle-stage,.ink53 #battle-stage *{color:revert}
/* —— 洞府 —— */
#tab-abode>.relative.w-full:first-child{display:none!important}
#tab-abode .x32-duo,#tab-abode #garden15,#ab53h{display:none!important}
#hub44{margin-bottom:8px;border-color:#cdbf9f!important;box-shadow:0 2px 8px rgba(80,60,20,.25)}
#breakthrough-card{padding:10px 12px!important}
#breakthrough-card #breakthrough-desc{margin-bottom:6px!important}
#ab53r{display:flex;align-items:center;justify-content:space-around;gap:6px;margin-top:10px}
#ab53r .sb53{position:relative;display:flex;flex-direction:column;align-items:center;gap:3px;background:none;border:0;padding:0;width:80px}
#ab53r .sb53 i{width:54px;height:54px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-style:normal;font-weight:900;font-size:18px;color:#f3ead6;background:radial-gradient(circle at 40% 35%,#4a4036,#17130e);box-shadow:0 0 0 2px #efe6d2,0 0 0 3.5px #3a3128,0 3px 6px rgba(40,30,10,.3);font-family:'Noto Serif TC',serif}
#ab53r .sb53 span{font-size:11px;color:#6b5f4f}
#ab53r .sb53 .rd{position:absolute;top:0;right:14px;width:10px;height:10px;border-radius:50%;background:#d13b2f;box-shadow:0 0 0 2px #f6efe0}
#ab53r #btn-tap-cultivate{width:96px!important;height:96px!important;border-radius:50%!important;padding:0!important;display:flex!important;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(circle at 40% 35%,#b23a2e,#6e1a14)!important;color:#fbf1dc!important;box-shadow:0 0 0 3px #efe6d2,0 0 0 5px #6e1a14,0 6px 14px rgba(110,26,20,.35)!important;border:0!important;font-family:'Noto Serif TC',serif;font-size:13px!important;line-height:1.2}
#ab53r #btn-tap-cultivate *{color:#fbf1dc!important;font-size:12px!important}
#ov53{position:fixed;inset:0;z-index:72;background:rgba(30,24,16,.55);display:flex;align-items:flex-end;justify-content:center}
#ov53.h{display:none}
#ov53 .pn{width:100%;max-width:448px;max-height:86dvh;overflow-y:auto;border-radius:16px 16px 0 0;padding:12px 14px 20px;color:#2a241c;background:radial-gradient(ellipse at 50% 0,#fbf8ef,#efe6d2 70%,#e5d9bd);box-shadow:0 -6px 24px rgba(0,0,0,.35)}
#ov53 .hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
#ov53 .hd b{font-family:'Noto Serif TC',serif;font-size:16px;font-weight:900}
#ov53 .hd button{width:30px;height:30px;border-radius:50%;border:1px solid #b9a98c;color:#6b5f4f}
/* —— 歷練 —— */
#tab-adventure>.relative.w-full.h-36{height:74px!important;margin-bottom:6px!important}
#tab-adventure #current-area-desc{display:none}
#tab-adventure #current-area-title{font-size:15px!important}
#tab-adventure #area-rec9,#tab-adventure #area-sc48{font-size:10.5px!important}
#tab-adventure:has(#battle-modal:not(.hidden))>.relative.w-full.h-36,#tab-adventure:has(#battle-modal:not(.hidden)) #x32-asub{display:none!important}
#x32-asub{margin-bottom:6px!important}#x32-asub button{min-height:36px!important;padding:4px!important}
#explore-panel{background:transparent!important;border:0!important;padding:0!important;box-shadow:none!important}
#explore-panel>div:first-child:not(#region-strip){display:none}
#region-strip{padding-bottom:4px!important}
#region-strip button{width:64px!important;padding:3px!important}
#region-strip button .text-2xl{font-size:18px!important}
#region-strip button .text-\\[9px\\]{display:none}
#region-strip button .mt-1{margin-top:1px!important}
#x32-asub button{min-height:32px!important}
#stage-map:has(#tw49)>svg{max-height:120px!important}
#stage-map:has(#tw49)>.text-\\[11px\\]{display:none!important}
#hp-row{padding:2px 0!important;margin:4px 0!important}
#hp-row button{min-height:34px!important;padding:2px 8px!important;font-size:11px!important}

#stage-map>.text-\\[11px\\]{font-size:10.5px!important;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
#tw49{font-size:10.5px!important;line-height:1.45!important;padding:4px 8px!important}
#explore-panel .grid.grid-cols-2:has(#btn-step-explore){grid-template-columns:1fr 1fr 1fr!important;padding-top:4px!important}
#btn-speed-out{grid-column:auto!important}
#btn-step-explore,#btn-auto-explore,#btn-speed-out{min-height:42px!important;padding:4px!important;font-size:12px!important}
#adventure-log-box{height:40px!important}
#tab-adventure .bg-slate-950:has(#adventure-log-box)>div:first-child{margin-bottom:2px!important;min-height:0!important}
#tab-adventure .bg-slate-950:has(#adventure-log-box)>div:first-child button{min-height:26px!important;padding:0 6px!important}
#tab-adventure .bg-slate-950:has(#adventure-log-box)>div:first-child>span{font-size:11px!important}
#hp-row{flex-wrap:nowrap!important;gap:4px}#hp-row>span:first-child{display:none}#hp-row #hp-text{font-size:10px!important;white-space:nowrap}
#hp-row>div{min-width:40px}#hp-row button{white-space:nowrap}
#tab-adventure>.relative.w-full.h-36{height:auto!important;min-height:54px}
#tab-adventure:has(#battle-modal:not(.hidden)) .bg-slate-950:has(#adventure-log-box){display:none!important}
#tab-adventure>.relative.w-full.h-36 .z-10{padding:6px 10px!important}
#stage-map>svg{max-height:170px!important}
#explore-panel .space-y-3>*+*,#explore-panel>*+*{margin-top:4px!important}
#tab-adventure .bg-slate-950:has(#adventure-log-box){padding:6px 8px!important}
#monster-avatar{display:none!important}
#battle-modal{padding:8px!important}
#battle-modal .grid:has(#btn-battle-attack){grid-template-columns:repeat(3,minmax(0,1fr))!important}
#btn-battle-flee{min-width:0!important;line-height:1.15!important}
#btn-battle-flee .f105{display:block;font-size:9px;opacity:.7;font-weight:400;margin-top:1px}
#btn-battle-attack{grid-column:auto!important}
#battle-skill-bar{grid-template-columns:repeat(3,minmax(0,1fr))!important}
#battle-skill-bar>button{min-width:0!important;max-width:100%!important;overflow:hidden}
#battle-skill-bar .nm108{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#battle-skill-bar .ic108{position:relative;flex:none}
#battle-skill-bar .cd108{position:absolute;right:-6px;top:-6px;min-width:16px;height:16px;padding:0 3px;border-radius:8px;background:#5b4a36;color:#fff;font-size:10px;font-weight:800;line-height:16px;text-align:center;box-shadow:0 0 0 1.5px #fff}
`;
  document.head.appendChild(css);
  ['tab-abode', 'tab-adventure', 'tab-techniques', 'tab-crafting', 'tab-inventory', 'tab-records'].forEach(id => { const e = $(id); if (e) e.classList.add('ink53'); });

  /* ---------- 洞府 ---------- */
  const ab = $('tab-abode');
  let hold = $('ab53h'); if (!hold) { hold = document.createElement('div'); hold.id = 'ab53h'; if (ab) ab.appendChild(hold); }
  let ov = $('ov53'); if (!ov) { ov = document.createElement('div'); ov.id = 'ov53'; ov.className = 'h'; ov.innerHTML = '<div class="pn"><div class="hd"><b></b><button data-a53="x">✕</button></div><div class="bd"></div></div>'; ov.querySelector('.pn').classList.add('ink53'); document.body.appendChild(ov); }
  const pb = ov.querySelector('.bd'); let cur = null;
  function shut() { if (cur) hold.appendChild(cur); cur = null; ov.classList.add('h'); }
  ov.addEventListener('click', e => { if (e.target === ov) shut(); });
  function topOf(btn) { let x = btn; while (x && x.parentNode && !(x.parentNode.classList && x.parentNode.classList.contains('x32-duo')) && x.parentNode !== hold && x.parentNode !== pb && x.parentNode !== ab) x = x.parentNode; return x && x.parentNode ? x : null; }
  function cards() { const a = $('btn-upgrade-array'), i = $('btn-upgrade-insight'); return { arr: a && topOf(a), ins: i && topOf(i) }; }
  function openP(k) {
    shut(); let el = null, t = '';
    if (k === 'arr') { el = cards().arr; t = '聚靈法陣'; }
    else if (k === 'ins') { el = cards().ins; t = '元神悟性'; }
    else if (k === 'gd') { el = $('garden15'); t = '洞府靈田'; }
    if (!el) return;
    cur = el; el.dataset.p53 = '1'; ov.querySelector('.hd b').textContent = t; pb.appendChild(el); ov.classList.remove('h');
    if (k === 'gd') { try { localStorage.setItem('gd19fold', '0'); } catch (x) { } el.classList.remove('gd-fold'); }
  }
  /* 熱點:靈田改開彈窗 */
  document.addEventListener('click', e => {
    const g = e.target.closest && e.target.closest('#hub44 [data-h44="gd"]'); if (!g) return;
    e.stopPropagation(); e.stopImmediatePropagation(); e.preventDefault();
    if (!on('alch') || !$('garden15')) { showToast('【靈田】尚未開啟:煉丹開放後可用。'); return; }
    openP('gd');
  }, true);
  function arrange() {
    if (!ab) return;
    const hub = $('hub44'), bk = $('breakthrough-card');
    if (hub && bk && hub.nextElementSibling !== bk && hub.parentNode === ab) ab.insertBefore(hub, bk);
    let r = $('ab53r');
    if (!r && bk) { r = document.createElement('div'); r.id = 'ab53r'; r.innerHTML = '<button class="sb53" data-a53="arr"><i>聚</i><span>聚靈陣</span></button><span id="ab53t"></span><button class="sb53" data-a53="ins"><i>悟</i><span>悟性</span></button>'; bk.parentNode.insertBefore(r, bk.nextSibling); }
    const tap = $('btn-tap-cultivate'), slot = $('ab53t');
    if (tap && slot && tap.parentNode !== r) { r.replaceChild(tap, slot); }
    const c = cards(); [c.arr, c.ins].forEach(x => { if (x && !x.dataset.p53 && x.parentNode !== hold && x !== cur) hold.appendChild(x); });
    const gd = $('garden15'); if (gd && gd !== cur && gd.parentNode !== hold) hold.appendChild(gd);
    /* 等級與紅點 */
    if (r) {
      const set = (k, lv, okb) => { const b = r.querySelector(`[data-a53="${k}"]`); if (!b) return; const sp = b.querySelector('span'); const tx = (k === 'arr' ? '聚靈陣' : '悟性') + ' Lv.' + (lv || 0); if (sp.textContent !== tx) sp.textContent = tx; const has = !!b.querySelector('.rd'); if (okb && !has) b.insertAdjacentHTML('beforeend', '<i class="rd"></i>'); else if (!okb && has) b.querySelector('.rd').remove(); };
      const ba = $('btn-upgrade-array'), bi = $('btn-upgrade-insight');
      set('arr', state.arrayLevel, !!(ba && !ba.disabled)); set('ins', state.insightLevel, !!(bi && !bi.disabled));
    }
  }
  document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('[data-a53]'); if (!a) return;
    if (a.dataset.a53 === 'x') { shut(); return; } openP(a.dataset.a53);
  });
  window.AB53 = {
    alert: () => { try { const s = $('breakthrough-status-badge'), t = s ? s.textContent : ''; const g = document.querySelector('#hub44 [data-s="gd"]'); return /可突破/.test(t) || /可收/.test(g ? g.textContent : ''); } catch (e) { return false; } }
  };
  setInterval(() => { try { arrange(); } catch (e) { } }, 800); setTimeout(arrange, 300);
})();

