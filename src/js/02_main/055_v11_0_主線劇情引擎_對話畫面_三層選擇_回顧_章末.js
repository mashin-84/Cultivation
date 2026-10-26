/* ===== v11.0:主線劇情引擎(對話畫面 / 三層選擇 / 回顧 / 章末門檻) ===== */
(function () {
  const $ = id => document.getElementById(id), X = window.X5;
  window.ART28 = window.ART28 || { bg: {}, ch: {} };
  /* ---------- 存檔 ---------- */
  const DEF = () => ({ ch: 1, flags: {}, key: {}, picks: {}, score: { t: 0, r: 0, y: 0 }, bond: { mo: 0, su: 0, ye: 0, ba: 0 }, seen: {}, log: [], ending: null, endings: {}, loops: 0, cycle: 1, spd: 1, auto: false });
  function SD() {
    if (!state.story27 || typeof state.story27 !== 'object') state.story27 = DEF();
    const s = state.story27, d = DEF();
    Object.keys(d).forEach(k => { if (s[k] === undefined || s[k] === null || (d[k] && typeof d[k] === 'object' && !Array.isArray(d[k]) && typeof s[k] !== 'object')) s[k] = d[k]; });
    if (!Array.isArray(s.log)) s.log = [];
    ['score', 'bond'].forEach(k => Object.keys(d[k]).forEach(j => { if (typeof s[k][j] !== 'number') s[k][j] = 0; }));
    return s;
  }
  /* ---------- 人物 ---------- */
  const WHO = {
    N: { n: () => state.name || '你', c: '#fbbf24', ic: '🙂' },
    mo: { n: '墨塵', c: '#a5b4fc', ic: '墨' }, su: { n: '蘇棠', c: '#86efac', ic: '棠' },
    ye: { n: '夜無咎', c: '#d8b4fe', ic: '夜' }, ba: { n: '白澤', c: '#fde68a', ic: '澤' },
    tian: { n: '祂', c: '#e2e8f0', ic: '天' }, q: { n: '？？？', c: '#94a3b8', ic: '？' },
    gu: { n: '顧青衍', c: '#bae6fd', ic: '衍' }, yh: { n: '玉衡長老', c: '#94a3b8', ic: '衡' }, lr: { n: '老人', c: '#d6b48a', ic: '老' }, tl: { n: '鐵老', c: '#fdba74', ic: '鐵' }, situ: { n: '司徒衡', c: '#fca5a5', ic: '衡' }, xg: { n: '仙官', c: '#93c5fd', ic: '官' }
  };
  const yeG = () => state.gender === 'f' ? 'm' : 'f';
  const fmt = t => String(t).replace(/\{age\}/g, Math.floor(state.age || 18)).replace(/\{N\}/g, state.name || '你').replace(/\{ta\}/g, state.gender === 'f' ? '他' : '她').replace(/\{Ta\}/g, state.gender === 'f' ? '他' : '她');
  const nameOf = w => WHO[w] ? (typeof WHO[w].n === 'function' ? WHO[w].n() : WHO[w].n) : w;
  const colOf = w => WHO[w] ? WHO[w].c : '#cbd5e1';
  /* ---------- 背景預設(無圖時) ---------- */
  const BGP = {
    village_dusk: 'linear-gradient(180deg,#3b2a4a 0%,#b45f3a 48%,#4a2f2a 100%)', village_fire: 'linear-gradient(180deg,#120707 0%,#7a1d12 55%,#2a0a06 100%)',
    gate: 'linear-gradient(180deg,#27425a 0%,#5d8a96 50%,#1c2d3d 100%)', forest: 'linear-gradient(180deg,#0f2a1e 0%,#2f5a3d 55%,#0b1a12 100%)',
    hall: 'linear-gradient(180deg,#2a2236 0%,#6b4c3a 60%,#1d1520 100%)', ruin: 'linear-gradient(180deg,#1b1b24 0%,#4b4452 55%,#15121a 100%)',
    night: 'linear-gradient(180deg,#070b1a 0%,#1d2a52 60%,#0a0f20 100%)', demon: 'linear-gradient(180deg,#1a0b26 0%,#4a1a5e 55%,#12051a 100%)',
    battle: 'linear-gradient(180deg,#2a1210 0%,#7a4030 55%,#150a08 100%)', grave: 'linear-gradient(180deg,#14181f 0%,#3a4655 55%,#0d1016 100%)',
    void: 'linear-gradient(180deg,#05050f 0%,#2a1f55 55%,#06040f 100%)', sky: 'linear-gradient(180deg,#5a8fc9 0%,#cfe6f5 55%,#8fb3d6 100%)',
    dream: 'linear-gradient(180deg,#e9e4f2 0%,#b9a9d9 55%,#6f5c9e 100%)', tree: 'linear-gradient(180deg,#9ad0e8 0%,#e7f2d5 55%,#6fa56a 100%)', black: '#000'
  };
  /* ---------- 劇情資料 ---------- */
  const NODES = [], BY = {};
  const ST = window.ST28 = {
    nodes: NODES, by: BY, S: SD, busy: () => !!run,
    add(n) { NODES.push(n); BY[n.id] = n; },
    bg: n => ({ bg: n }), say: (w, f, t) => ({ say: w, face: f || '', t }), nar: t => ({ nar: t }), fx: n => ({ fx: n }), set: e => ({ set: e }),
    ch: (type, id, opts, head) => ({ ch: type, id, opts, head }), ifF: (c, a, b) => ({ if: c, a: a || [], b: b || [] }), clr: () => ({ clr: 1 }), fight: cfg => ({ fight: cfg }), ti: (big, sub) => ({ ti: [big, sub || ''] }), edg: id => ({ edg: id }),
    R: (r, sub) => Object.assign(() => (state.realmIdx || 0) > r || ((state.realmIdx || 0) === r && (state.subRealm || 1) >= (sub || 1)), { _rq: [r, sub || 1, 0] }),
    E: r => Object.assign(() => { if ((state.realmIdx || 0) > r) return true; if ((state.realmIdx || 0) < r) return false; const i = getRealmInfo(); return (state.subRealm || 1) >= i.realm.subMax && state.qi >= i.maxQi * 0.999; }, { _rq: [r, 99, 1] })
  };
  const CHN = ['', '凡心', '同門', '舊債', '抉擇', '師恩', '天門', '舊夢', '一念'];
  const CHR = [0, 0, 1, 2, 3, 4, 5, 6, 7];
  const ROUTE = { t: '順天', r: '逆天', y: '超脫' };
  const ENM = { fly: '飛仙', slay: '弒天', one: '歸一' };
  /* ---------- 狀態查詢 ---------- */
  const flag = f => !!SD().flags[f];
  const seen = id => !!SD().seen[id];
  const mainNodes = () => NODES.filter(n => !n.opt);
  function nextMain() { return mainNodes().find(n => !seen(n.id)) || null; }
  function eligible() {
    const out = [], m = nextMain();
    if (m && safe(m.at)) out.push(m);
    NODES.filter(n => n.opt && !seen(n.id) && (!n.after || seen(n.after)) && safe(n.at)).forEach(n => out.push(n));
    return out;
  }
  function safe(f) { try { return !f || f(); } catch (e) { return false; } }
  /* 章末門檻:現有境界對應章節的章末節點尚未看 */
  function gateNode() {
    const r = state.realmIdx || 0;
    return NODES.find(n => n.end && !n.post && CHR[n.ch] === r && !seen(n.id)) || null;
  }
  /* v173 大境界突破前必看:該境界(含之前)尚未看過的支線/機緣/遊學,只列現在就能看的(避免卡死) */
  const realmOf = n => { const q = n.at && n.at._rq, y = n.at && n.at._yx; return y ? y[0] : q ? q[0] : null; };
  const canNow = n => !seen(n.id) && safe(n.at) && (!n.after || seen(n.after)) && (n.opt || nextMain() === n);
  function reqList() {
    const r = state.realmIdx || 0;
    return NODES.filter(n => n.opt && n.id !== 's.cycle' && !seen(n.id) && realmOf(n) != null && realmOf(n) <= r)
      .sort((a, b) => realmOf(a) - realmOf(b)).filter(canNow);
  }
  ST.req = reqList;
  /* 鎖住的劇情:往前追到現在就能看的那一段 */
  function goTo(n, d) {
    if (!n || (d || 0) > 12 || seen(n.id) || !safe(n.at)) return null;   /* 境界未到:只寫條件,不給前往 */
    if (canNow(n)) return n;
    if (n.after && !seen(n.after)) return goTo(BY[n.after], (d || 0) + 1);
    if (!n.opt) { const m = nextMain(); if (m && m !== n) return goTo(m, (d || 0) + 1); }
    return null;
  }
  /* ---------- 效果 ---------- */
  const rs = n => Math.floor(n * 60 * Math.pow(5, state.realmIdx || 0));
  function apply(e, cid, type) {
    if (!e) return;
    const s = SD();
    if (e.b) Object.keys(e.b).forEach(k => { s.bond[k] = Math.max(0, Math.min(30, (s.bond[k] || 0) + e.b[k])); });
    if (e.f) [].concat(e.f).forEach(f => { s.flags[f] = 1; });
    if (e.sc) { s.score[e.sc] = (s.score[e.sc] || 0) + 1; if (type === 'k') s.key[cid] = e.sc; }
    if (e.st) { try { X.give({ stones: rs(e.st) }, true); } catch (er) { state.stones += rs(e.st); } }
    if (e.fn) try { e.fn(s); } catch (er) { }
  }
  /* ---------- 介面 ---------- */
  const CSS = `
#st28{position:fixed;inset:0;z-index:100000;background:#000;color:#f1f5f9;font-family:'Noto Serif TC',serif;display:none;overflow:hidden;-webkit-user-select:none;user-select:none;touch-action:manipulation}
#st28.on{display:block}
#st28 .st-stage{position:absolute;inset:0}
#st28 .st-stage.shake{animation:st28shake .5s}
@keyframes st28shake{0%,100%{transform:translate(0,0)}15%{transform:translate(-9px,4px)}30%{transform:translate(8px,-5px)}45%{transform:translate(-6px,-3px)}60%{transform:translate(5px,5px)}80%{transform:translate(-3px,2px)}}
#st28 .st-bg{position:absolute;inset:0;background-size:cover;background-position:center;transition:opacity .8s;opacity:0}
#st28 .st-bg.on{opacity:1}
#st28 .st-fog{position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse 80% 40% at 20% 70%,rgba(255,255,255,.10),transparent 70%),radial-gradient(ellipse 70% 35% at 85% 55%,rgba(255,255,255,.08),transparent 70%);animation:st28fog 18s ease-in-out infinite alternate}
@keyframes st28fog{from{transform:translateX(-4%)}to{transform:translateX(5%)}}
#st28 .st-shade{position:absolute;inset:0;pointer-events:none;background:linear-gradient(to top,rgba(2,6,23,.88) 0%,rgba(2,6,23,.35) 32%,transparent 55%),linear-gradient(to bottom,rgba(2,6,23,.55),transparent 18%)}
#st28 .st-p{position:absolute;left:-3%;bottom:150px;height:60%;width:78%;display:flex;align-items:flex-end;justify-content:flex-start;pointer-events:none;transition:opacity .35s,filter .35s,transform .35s;opacity:0;transform:translateX(-18px)}
#st28 .st-p.on{opacity:1;transform:none}
#st28 .st-p.dim{filter:brightness(.55) saturate(.8)}
#st28 .st-p{clip-path:inset(-100% -100% 0 -100%)}#st28 .st-p img.pf81{position:absolute;max-width:none;max-height:none}#st28 .st-p img.pf81.fl89{scale:-1 1}#st28 .st-p img,#st28 .st-p svg{max-height:100%;max-width:100%;object-fit:contain;object-position:left bottom;filter:drop-shadow(0 6px 14px rgba(0,0,0,.6))}
#st28 .st-top{position:absolute;left:0;right:0;top:0;padding:calc(10px + env(safe-area-inset-top)) 10px 0;display:flex;align-items:center;gap:6px;z-index:5}
#st28 .st-ch{flex:1;min-width:0;font-size:12.5px;color:#fde68a;letter-spacing:1px;text-shadow:0 1px 4px #000;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#st28 .st-top button{height:30px;padding:0 10px;border-radius:15px;background:rgba(15,23,42,.72);border:1px solid rgba(148,163,184,.4);color:#e2e8f0;font-size:12px;font-weight:800}
#st28 .st-top button.on{background:#d97706;border-color:#fbbf24;color:#fff}
#st28 .st-box{position:absolute;left:10px;right:10px;bottom:calc(12px + env(safe-area-inset-bottom));min-height:136px;border-radius:16px;background:rgba(8,12,26,.86);border:1px solid rgba(251,191,36,.38);box-shadow:0 0 22px rgba(0,0,0,.55);backdrop-filter:blur(4px);padding:22px 14px 22px;z-index:4}
#st28 .st-nm{position:absolute;left:12px;top:-15px;padding:3px 14px;border-radius:12px;font-size:14px;font-weight:900;letter-spacing:2px;background:#0b1324;border:1px solid currentColor;display:none}
#st28 .st-tx{font-size:16.5px;line-height:1.8;min-height:86px;white-space:pre-wrap;word-break:break-all;color:#f1f5f9}
#st28 .st-tx.nar{color:#cbd5e1;font-style:italic}
#st28 .st-tx.tip{color:#94a3b8;font-style:normal;font-size:13px}
#st28 .st-nx{position:absolute;right:14px;bottom:6px;color:#fbbf24;font-size:16px;animation:st28bl 1s infinite}
@keyframes st28bl{50%{opacity:.2}}
#st28 .st-cs{position:absolute;left:12px;right:12px;bottom:calc(168px + env(safe-area-inset-bottom));display:flex;flex-direction:column;gap:8px;z-index:6}
#st28 .st-cs button{width:100%;padding:11px 12px;border-radius:12px;font-size:15px;font-weight:700;text-align:left;background:rgba(15,23,42,.94);border:1px solid #475569;color:#f1f5f9;line-height:1.5}
#st28 .st-cs button:active{transform:scale(.98)}
#st28 .st-cs button.m{border-color:#38bdf8;box-shadow:0 0 8px rgba(56,189,248,.25)}
#st28 .st-cs button.k{border-color:#f59e0b;background:linear-gradient(135deg,rgba(120,53,15,.95),rgba(15,23,42,.96));box-shadow:0 0 14px rgba(245,158,11,.45);color:#fef3c7}
#st28 .st-cs .st-kh{align-self:center;padding:4px 16px;border-radius:14px;background:#92400e;border:1px solid #fbbf24;color:#fff;font-size:13px;font-weight:900;letter-spacing:3px;box-shadow:0 0 12px rgba(245,158,11,.6)}
#st28 .st-cs .st-ph{align-self:center;font-size:13px;color:#fde68a;text-shadow:0 1px 4px #000;text-align:center;line-height:1.5}
#st28 .st-cs .st-row{display:flex;gap:8px}
#st28 .st-cs .st-row button{text-align:center}
#st28 .st-fl{position:absolute;inset:0;background:#fff;opacity:0;pointer-events:none;z-index:7}
#st28 .st-fl.go{animation:st28fl .9s}
@keyframes st28fl{0%{opacity:.95}100%{opacity:0}}
#st28 .st-dk{position:absolute;inset:0;background:#000;opacity:0;pointer-events:none;transition:opacity .8s;z-index:3}
#st28 .st-dk.on{opacity:.55}
#st28 .st-fl.red{background:#b91c1c}
#st28 .st-bd{position:absolute;left:50%;top:104px;transform:translateX(-50%);z-index:8;padding:5px 16px;border-radius:14px;background:rgba(15,23,42,.9);border:1px solid #fbbf24;color:#fde68a;font-size:13px;font-weight:800;opacity:0;pointer-events:none;transition:opacity .4s}
#st28 .st-bd.on{opacity:1}
#st28 .st-lg{position:absolute;inset:0;background:rgba(2,6,23,.94);z-index:9;display:none;flex-direction:column;padding:calc(12px + env(safe-area-inset-top)) 14px calc(12px + env(safe-area-inset-bottom))}
#st28 .st-lg.on{display:flex}
#st28 .st-lg h3{color:#fcd34d;font-size:16px;font-weight:900;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center}
#st28 .st-lg h3 button{height:30px;padding:0 12px;border-radius:15px;background:#1e293b;border:1px solid #475569;color:#e2e8f0;font-size:12px}
#st28 .st-lb{flex:1;overflow-y:auto;font-size:14px;line-height:1.7}
#st28 .st-lb p{margin:0 0 8px}
#st28 .st-lb b{margin-right:6px}
#st28 .st-cf{position:absolute;inset:0;background:rgba(2,6,23,.8);z-index:10;display:none;align-items:center;justify-content:center;padding:30px}
#st28 .st-cf.on{display:flex}
#st28 .st-cf div{width:100%;border-radius:16px;background:#0f172a;border:1px solid #f59e0b;padding:18px;text-align:center}
#st28 .st-cf p{margin:0 0 14px;font-size:15px;color:#fde68a}
#st28 .st-cf button{margin:0 5px;padding:8px 20px;border-radius:12px;background:#1e293b;border:1px solid #475569;color:#fff;font-weight:800}
#st28 .st-cf button.y{background:#d97706;border-color:#fbbf24}
#st28 .st-ti{position:absolute;inset:0;z-index:8;background:rgba(0,0,0,.93);display:none;flex-direction:column;align-items:center;justify-content:center;gap:16px;text-align:center;padding:30px}
#st28 .st-ti.on{display:flex;animation:st28tin 1.4s}
@keyframes st28tin{from{opacity:0}to{opacity:1}}
#st28 .st-ti .a{font-size:44px;font-weight:900;letter-spacing:12px;color:#fde68a;text-shadow:0 0 24px rgba(251,191,36,.75)}
#st28 .st-ti .b{font-size:15px;color:#cbd5e1;line-height:1.9;letter-spacing:2px;white-space:pre-wrap}
#btn-story28{width:36px;height:32px;min-height:32px!important;border-radius:10px;background:#111c33;border:1px solid #2b3a58;color:#fcd34d;font-size:15px;line-height:1;flex:none;position:relative}
#btn-story28.dot::after{content:'';position:absolute;top:-3px;right:-3px;width:10px;height:10px;border-radius:5px;background:#ef4444;box-shadow:0 0 6px #ef4444}
#btn-story28.pulse{animation:st28pu 1.4s infinite}
@keyframes st28pu{50%{box-shadow:0 0 12px #fbbf24;border-color:#fbbf24}}
`;
  const st = document.createElement('style'); st.id = 'st28css'; st.textContent = CSS; document.head.appendChild(st);
  let UI = null;
  function ensureUI() {
    if (UI) return UI;
    const d = document.createElement('div'); d.id = 'st28';
    d.innerHTML = `<div class="st-stage"><div class="st-bg" id="st28b0"></div><div class="st-bg" id="st28b1"></div><div class="st-fog"></div><div class="st-shade"></div><div class="st-p" id="st28p"></div><div class="st-dk" id="st28dk"></div></div>
<div class="st-top"><div class="st-ch" id="st28ch"></div><button data-s28="auto">自動</button><button data-s28="skip">跳過</button><button data-s28="log">回顧</button><button data-s28="exit">✕</button></div>
<div class="st-bd" id="st28bd"></div><div class="st-cs" id="st28cs"></div>
<div class="st-box" id="st28box"><div class="st-nm" id="st28nm"></div><div class="st-tx" id="st28tx"></div><div class="st-nx" id="st28nx">▼</div></div>
<div class="st-ti" id="st28ti"></div><div class="st-fl" id="st28fl"></div>
<div class="st-lg" id="st28lg"><h3><span>📜 劇情回顧</span><button data-s28="logx">關閉</button></h3><div class="st-lb" id="st28lb"></div></div>
<div class="st-cf" id="st28cf"><div><p>離開這段劇情?<br><span style="font-size:12px;color:#94a3b8">下次會從這段劇情的開頭重新開始,選擇不會保留。</span></p><button class="y" data-s28="exitok">離開</button><button data-s28="exitno">繼續看</button></div></div>`;
    document.body.appendChild(d);
    d.addEventListener('click', onClick);
    UI = d; return d;
  }
  /* ---------- 執行 ---------- */
  let run = null, bgSlot = 0, timer = null, typeT = null;
  function play(id, o) {
    if (window.MOV174 && !(o && o._mv) && MOV174.has('n_' + id)) { MOV174.play('n_' + id).then(() => play(id, Object.assign({}, o, { _mv: 1 }))); return; }   /* v179 節點開頭動畫 n_節點id */
    const n = BY[id]; if (!n || run) return false;
    o = o || {}; ensureUI();
    const s = SD();
    run = { n, q: (n.beats || []).slice(), replay: !!(s.seen[id]) || !!o.replay, then: o.then, typing: false, skip: false, auto: !!s.auto, cur: null, choosing: false, full: '', lines: 0 };
    $('st28').classList.add('on'); $('st28cs').innerHTML = '';
    $('st28ch').innerHTML = `第${'零一二三四五六七八'[n.ch] || n.ch}章・${CHN[n.ch] || ''}<div style="font-size:11px;color:#cbd5e1;opacity:.85">${n.title}</div>`;
    $('st28p').className = 'st-p'; $('st28p').innerHTML = '';
    $('st28dk').classList.remove('on');
    syncBtns();
    next();
    return true;
  }
  function syncBtns() {
    if (!run) return;
    const a = document.querySelector('#st28 [data-s28=auto]'), k = document.querySelector('#st28 [data-s28=skip]');
    if (a) a.classList.toggle('on', run.auto); if (k) k.classList.toggle('on', run.skip);
  }
  const BGV = { night: 'brightness(.42) saturate(.8) hue-rotate(190deg)', storm: 'brightness(.52) saturate(.55) hue-rotate(200deg) contrast(1.2)', warm: 'sepia(.35) brightness(.9) saturate(1.15)', ruin: 'grayscale(.7) brightness(.62) contrast(1.08)', dim: 'brightness(.5) saturate(.75)' };
  function setBg(full) {
    const pr = String(full).split(':'), name = pr[0], vr = pr[1];
    try { window.BGM96 && BGM96.story(name); } catch (e) { }
    const url = ART28.bg[name], el = $('st28b' + (bgSlot ^ 1)), old = $('st28b' + bgSlot);
    el.style.cssText = '';
    if (url) { el.style.backgroundImage = `url(${url})`; } else { el.style.background = BGP[name] || BGP.night; }
    if (vr && BGV[vr]) el.style.filter = BGV[vr];
    el.classList.add('on'); old.classList.remove('on'); bgSlot ^= 1;
    $('st28p').className = 'st-p'; $('st28p').innerHTML = ''; if (run) run.pk = '';
  }
  function fxDo(n) {
    const stg = document.querySelector('#st28 .st-stage'), fl = $('st28fl');
    if (n === 'shake') { stg.classList.remove('shake'); void stg.offsetWidth; stg.classList.add('shake'); }
    else if (n === 'flash' || n === 'red') { fl.classList.remove('go', 'red'); void fl.offsetWidth; if (n === 'red') fl.classList.add('red'); fl.classList.add('go'); }
    else if (n === 'dark') $('st28dk').classList.add('on');
    else if (n === 'light') $('st28dk').classList.remove('on');
  }
  /* 立繪 */
  function portraitSrc(w, face) {
    const A = ART28.ch;
    if (w === 'ye') { const g = yeG(); return A[`ye_${g}_${face}`] || A[`ye_${g}_cold`] || A[`ye_${g}_smile`] || null; }
    const k = w + '_' + face; if (A[k]) return A[k];
    const any = Object.keys(A).find(x => x.indexOf(w + '_') === 0); return any ? A[any] : null;
  }
  function placeholder(w) {
    const c = colOf(w), ic = (WHO[w] || {}).ic || '？';
    return `<svg viewBox="0 0 200 270" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="s28g${w}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c}" stop-opacity=".92"/><stop offset="1" stop-color="${c}" stop-opacity=".35"/></linearGradient></defs><path d="M6 270 C6 196 56 168 100 168 C144 168 194 196 194 270Z" fill="url(#s28g${w})"/><rect x="86" y="140" width="28" height="34" rx="10" fill="url(#s28g${w})"/><circle cx="100" cy="100" r="50" fill="url(#s28g${w})"/><path d="M52 96 C52 52 148 52 148 96 C130 74 70 74 52 96Z" fill="#0b1324" opacity=".55"/><g transform="translate(100 218)"><rect x="-25" y="-27" width="50" height="50" rx="6" fill="#9f1d1d" fill-opacity=".9" stroke="#fde68a" stroke-opacity=".55" stroke-width="2"/><text y="11" font-size="32" font-weight="900" fill="#fde68a" text-anchor="middle" font-family="'Noto Serif TC',serif">${ic}</text></g></svg>`;
  }
  function showPortrait(w, face, dim) {
    const p = $('st28p'); if (!p) return;
    const key = w + '|' + (face || '') + '|' + yeG();
    if (run && run.pk === key) { p.classList.toggle('dim', !!dim); return; }
    const src = portraitSrc(w, face);
    p.classList.remove('on'); p.classList.toggle('dim', !!dim);
    setTimeout(() => { p.innerHTML = src ? `<img src="${src}" alt="" draggable="false">` : placeholder(w); if (src) frameP(p.querySelector('img'), src); p.classList.add('on'); }, run && run.pk ? 120 : 0);
    if (run) run.pk = key;
  }
  /* v81:半身入鏡——依頭頂/下巴/臉中心統一頭部大小與位置 */
  const PF = {"gu_a":[0.1,0.225,0.357],"lr_a":[0.06,0.174,0.41],"tl_a":[0.05,0.15,0.536],"yh_a":[0.086,0.19,0.454],"仙人_a":[0.095,0.175,0.51],"仙衛統領_a":[0.17,0.26,0.533],"師弟_a":[0.096,0.221,0.482],"弟子_a":[0.094,0.176,0.426],"心魔_a":[0.04,0.13,0.48],"散修_a":[0.085,0.175,0.5],"村民_a":[0.075,0.165,0.541],"管事_a":[0.1,0.21,0.469],"老仙_a":[0.04,0.135,0.48],"趙莽_a":[0.091,0.17,0.488],"魔將_a":[0.107,0.188,0.569],"魔道長老_a":[0.095,0.18,0.295],"mo_cold":[0.166,0.284,0.494],"mo_kind":[0.152,0.287,0.473],"mo_sad":[0.169,0.294,0.448],"q_a":[0.11,0.22,0.43],"situ_a":[0.122,0.231,0.448],"su_cry":[0.105,0.298,0.445],"su_happy":[0.094,0.281,0.494],"su_worry":[0.102,0.294,0.488],"tian_a":[0.08,0.25,0.464],"xg_a":[0.125,0.237,0.493],"ye_f_cold":[0.123,0.263,0.398],"ye_f_smile":[0.122,0.263,0.398],"ye_m_cold":[0.123,0.264,0.407],"ye_m_smile":[0.123,0.264,0.409]};
  const PFL = ['gu_a', 'tl_a', 'yh_a', '仙衛統領_a', '心魔_a', 'mo_cold', 'mo_kind', 'mo_sad', 'q_a', 'ye_f_cold', 'ye_f_smile', 'ye_m_cold', 'ye_m_smile'];   /* v89:朝左者翻轉 */
  function frameP(img, src) {
    const k = Object.keys(ART28.ch).find(x => ART28.ch[x] === src), f = PF[k], p = $('st28p'); if (!img || !f || !p) return;
    const fl = PFL.includes(k); img.classList.toggle('fl89', fl); const cx = fl ? 1 - f[2] : f[2];
    const go = () => { const H = p.clientHeight, W = p.clientWidth; if (!H || !img.naturalHeight) return;
      const ih = H / 5.6 / (f[1] - f[0]), iw = ih * img.naturalWidth / img.naturalHeight;
      img.classList.add('pf81'); img.style.height = ih + 'px'; img.style.width = iw + 'px'; img.style.top = (H * .2 - f[0] * ih) + 'px'; img.style.left = (W * .42 - cx * iw) + 'px'; };
    if (img.complete) go(); else img.onload = go;
  }
  ST.frameP = frameP;
  function dimPortrait(on) { const p = $('st28p'); if (p) p.classList.toggle('dim', !!on); }
  /* 取下一個會暫停的 beat */
  function next() {
    if (!run) return;
    clearTimeout(timer); $('st28cs').innerHTML = ''; run.choosing = false;
    for (let guard = 0; guard < 500; guard++) {
      const b = run.q.shift();
      if (!b) { return finish(); }
      if (b.bg) { setBg(b.bg); continue; }
      if (b.fx) { fxDo(b.fx); continue; }
      if (b.clr) { $('st28p').className = 'st-p'; $('st28p').innerHTML = ''; run.pk = ''; continue; }
      if (b.set) { if (!run.replay) apply(b.set); continue; }
      if (b.mov) { if (!run.replay && window.MOV174 && MOV174.has(b.mov)) { MOV174.play(b.mov).then(() => next()); return; } continue; }   /* v180 劇情中途動畫 */
      if (b.edg) { if (!run.replay) { const s = SD(); s.ending = b.edg; s.endings[b.edg] = s.cycle || 1; flash('📜 結局已記錄:' + (ENM[b.edg] || b.edg)); } if (window.MOV174 && MOV174.has('end_' + b.edg)) { MOV174.play('end_' + b.edg).then(() => next()); return; } continue; }   /* v179 結局動畫 end_fly/slay/one */
      if (b.ti) return showTitle(b.ti);
      if (b.fight) { if (run.replay) continue; return doFight(b.fight); }
      if (b.guide) { if (run.replay || !window.TUT160 || TUT160.done(b.guide)) continue; return doGuide(b.guide); }
      if (b.if !== undefined) {
        let ok = false; try { ok = typeof b.if === 'function' ? !!b.if(SD()) : !!SD().flags[b.if]; } catch (e) { }
        run.q.unshift(...(ok ? b.a : b.b)); continue;
      }
      if (b.ch) return showChoice(b);
      if (b.say !== undefined || b.nar !== undefined) return showLine(b);
    }
    finish();
  }
  /* 劇情中的實際回合制戰鬥(TB26 特殊戰,依玩家戰力縮放;敗北可重試或以劇情帶過) */
  function doFight(cfg) {
    if (!window.TB26 || !TB26.story) { next(); return; }
    run.fighting = true; run.choosing = false; clearTimeout(timer); clearInterval(typeT); $('st28cs').innerHTML = '';
    $('st28').classList.remove('on');
    const done = win => {
      if (!run) return; run.fighting = false; $('st28').classList.add('on');
      if (win) { if (!cfg.script) flash('⚔ 戰鬥勝利'); next(); } else showFightLose(cfg);
    };
    let ok = false; try { ok = TB26.story(Object.assign({}, cfg, { onEnd: done })); } catch (e) { ok = false; }
    if (!ok) done(true);
  }
  /* v160 劇情引導:暫離對話畫面,讓玩家親手按一次對應的按鈕 */
  function doGuide(k) {
    run.fighting = true; run.choosing = false; clearTimeout(timer); clearInterval(typeT); $('st28cs').innerHTML = '';
    $('st28').classList.remove('on');
    let back = false; const done = () => { if (back || !run) return; back = true; run.fighting = false; $('st28').classList.add('on'); next(); };
    try { if (!TUT160.run(k, done)) done(); } catch (e) { done(); }
  }
  function showFightLose(cfg) {
    run.choosing = true; run.cur = { fightCfg: cfg }; $('st28nx').style.visibility = 'hidden';
    $('st28cs').innerHTML = `<div class="st-ph">戰局未定……(戰鬥中的損失不會保留)</div><button data-s28="fretry">⚔ 再戰一次</button>${cfg.noskip ? '<button data-s28="exitok">改日再來</button>' : '<button data-s28="fskip">以劇情帶過(視為險勝)</button>'}`;
  }
  function showTitle(t) {
    const e = $('st28ti'); e.innerHTML = `<div class="a">${esc(fmt(t[0]))}</div><div class="b">${esc(fmt(t[1]))}</div>`;
    e.classList.add('on'); run.choosing = false; run.titling = true; clearTimeout(timer); $('st28cs').innerHTML = ''; run.skip = false; syncBtns();
    if (run.auto) timer = setTimeout(hideTitle, 3200);
  }
  function hideTitle() { const e = $('st28ti'); if (!e || !e.classList.contains('on')) return; e.classList.remove('on'); if (run) { run.titling = false; next(); } }
  /* v95:說話者音色 */
  let VOICE95 = 'nar';
  function voiceOf(w, name) {
    if (w === 'tian' || /心魔|魔將|魔道/.test(name || '')) return 'dark';
    if (w === 'su' || w === 'ba' || /村民|師弟/.test(name || '') || (w === 'ye' && yeG() === 'f')) return 'high';
    if (['lr', 'tl', 'yh', 'situ'].includes(w) || /長老|老|管事|統領|仙人/.test(name || '')) return 'low';
    return 'mid';
  }
  function showLine(b) {
    const nar = b.nar !== undefined, w = ({ '墨塵': 'mo', '蘇棠': 'su', '夜無咎': 'ye', '白澤': 'ba', '祂': 'tian', '司徒衡': 'situ', '仙官': 'xg', '顧青衍': 'gu', '玉衡長老': 'yh', '老人': 'lr', '老匠': 'tl' })[b.say] || b.say, name = nar ? '' : nameOf(w), text = fmt(nar ? b.nar : b.t);
    const nm = $('st28nm'), tx = $('st28tx');
    VOICE95 = nar ? 'nar' : voiceOf(w, name);
    if (nar) { nm.style.display = 'none'; dimPortrait(true); }
    else {
      nm.style.display = 'block'; nm.textContent = name; nm.style.color = colOf(w);
      if (w === 'N' || (!WHO[w] && !portraitSrc(w, b.face))) dimPortrait(true);
      else showPortrait(w, b.face, false);
    }
    tx.className = 'st-tx' + (nar ? ' nar' : '') + (nar && text.charAt(0) === '〔' ? ' tip' : '');
    log(name, text);
    run.full = text; run.pos = 0; run.typing = true; $('st28nx').style.visibility = 'hidden';
    clearInterval(typeT);
    const spd = SD().spd || 1, per = run.skip ? 1 : Math.max(8, 34 / spd), chars = [...text];
    tx.textContent = '';
    if (run.skip) { tx.textContent = text; typeDone(); return; }
    let i = 0, tc = 0; const PUN = /[\s,.!?;:、,。!?;:…「」『』()()—~〜]/;
    typeT = setInterval(() => { i++; tx.textContent = chars.slice(0, i).join(''); const ch = chars[i - 1]; if (PUN.test(ch)) tc = 0; else if (tc++ % 3 === 0 && state.typeSnd !== false && SD().spd !== 3) { try { audio.playType(VOICE95); } catch (e) { } } if (i >= chars.length) { clearInterval(typeT); typeDone(); } }, per);
  }
  function typeDone() {
    if (!run) return;
    clearInterval(typeT); run.typing = false; $('st28tx').textContent = run.full; $('st28nx').style.visibility = 'visible';
    if (run.skip) { timer = setTimeout(next, 60); }
    else if (run.auto) { timer = setTimeout(next, 900 + run.full.length * 55 / (SD().spd || 1)); }
  }
  function log(w, t) {
    if (!run || run.replay) return; const s = SD(); s.log.push({ w, t }); if (s.log.length > 200) s.log.splice(0, s.log.length - 200);
  }
  /* 選擇 */
  function showChoice(b) {
    run.skip = false; syncBtns(); run.choosing = true; clearInterval(typeT);
    const box = $('st28cs'), s = SD(), type = b.ch, opts = b.opts;
    const prev = s.picks[b.id];
    if (run.replay) {
      const i = prev !== undefined ? prev : 0; return choose(b, i, true);
    }
    $('st28nx').style.visibility = 'hidden';
    const head = type === 'k' ? '<div class="st-kh">⚑ 命運抉擇</div>' : '';
    const ph = b.head ? `<div class="st-ph">${fmt(b.head)}</div>` : '';
    const lk = o => { try { return o.lock ? (o.lock(s) || '') : ''; } catch (e) { return ''; } };
    /* v169 第二周目起,命運抉擇標出道心傾向(第一周目保留懸念) */
    const RTC = { t: '#b45309', r: '#b91c1c', y: '#6d28d9' };
    const rt = o => (type === 'k' && (s.cycle || 1) > 1 && o.e && o.e.sc && ROUTE[o.e.sc]) ? `<div style="font-size:12px;font-weight:800;color:${RTC[o.e.sc] || '#8a5a12'};margin-top:3px">〔${ROUTE[o.e.sc]}〕</div>` : '';
    const hint = o => { const h = lk(o); return h && (s.cycle || 1) > 1 ? h + `〔超脫 ${s.score.y}/3・蘇棠羈絆 ${s.bond.su}/12〕` : h; };
    box.innerHTML = ph + head + opts.map((o, i) => { const h = hint(o); return h ? `<button class="${type} lk" data-s28="lock" data-i="${i}" style="opacity:.55;filter:grayscale(.8)">🔒 ${fmt(o.t)}<div style="font-size:12px;font-weight:600;color:#fca5a5;margin-top:3px">${esc(h)}</div></button>` : `<button class="${type}" data-s28="pick" data-i="${i}">${fmt(o.t)}${o.info || ''}${rt(o)}</button>`; }).join('');
    run.cur = b;
  }
  function choose(b, i, silent) {
    const o = b.opts[i]; if (!o) return;
    $('st28cs').innerHTML = '';
    if (!run.replay) {
      const s = SD(); s.picks[b.id] = i;
      apply(o.e, b.id, b.ch);
      if (b.ch === 'm' && o.e && o.e.b) {
        const nm = Object.keys(o.e.b).map(k => (o.e.b[k] > 0 ? '💞 ' : '💔 ') + nameOf(k)).join('、');
        flash(nm);
      } else if (b.ch === 'k' && o.e && o.e.sc) flash('命運已定:' + ROUTE[o.e.sc] + '之路');
      log('▶', fmt(o.t));
    }
    run.q.unshift(...(o.r || []));
    run.cur = null;
    next();
  }
  function flash(t) { const e = $('st28bd'); if (!e) return; e.textContent = t; e.classList.add('on'); setTimeout(() => e.classList.remove('on'), 1800); }
  function finish() {
    if (!run) return;
    const n = run.n, replay = run.replay, then = run.then; clearTimeout(timer); clearInterval(typeT); lastEndT = Date.now(); lastWasPost = !!n.post;
    if (!replay) {
      const s = SD(); s.seen[n.id] = 1; if (n.end) s.ch = Math.max(s.ch, n.ch + 1);
      if (n.rw) { try { X.give(typeof n.rw === 'function' ? n.rw() : n.rw, true); } catch (e) { } }
      if (n.fn) try { n.fn(s); } catch (e) { }
      try { saveGame(); } catch (e) { }
    }
    run = null; { const t = $('st28ti'); if (t) t.classList.remove('on'); }
    const el = $('st28'); el.classList.remove('on'); $('st28cs').innerHTML = '';
    if (!replay && n.end) { try { showToast(`📖 第${'零一二三四五六七八'[n.ch]}章「${CHN[n.ch]}」完結`); } catch (e) { } }
    try { updateTopBar(); } catch (e) { }
    badge();
    if (then) setTimeout(then, 200);
    else if (!replay) setTimeout(chain, 300);
  }
  /* 連續節點(序章)自動接續 */
  function chain() {
    if (run) return; const m = nextMain();
    if (m && m.chain && safe(m.at)) play(m.id);
  }
  /* ---------- 點擊 ---------- */
  function onClick(e) {
    const b = e.target.closest('[data-s28]');
    if (b) {
      const a = b.dataset.s28;
      if (a === 'fretry') { const c = run && run.cur; if (c && c.fightCfg) doFight(c.fightCfg); return; }
      if (a === 'fskip') { if (run) { run.choosing = false; run.cur = null; next(); } return; }
      if (a === 'lock') { flash('此路尚未開啟'); return; }
      if (a === 'pick') { const c = run && run.cur; if (!c) return; const i = +b.dataset.i;
        if (c.ch === 'k') return confirmK(c, i);
        return choose(c, i); }
      if (a === 'kok') { const c = run && run.cur; if (c) choose(c, +b.dataset.i); return; }
      if (a === 'kno') { const c = run && run.cur; if (c) { run.cur = null; showChoice(c); } return; }
      if (a === 'auto') { run.auto = !run.auto; SD().auto = run.auto; syncBtns(); if (run.auto && !run.typing && !run.choosing) timer = setTimeout(next, 500); else if (!run.auto) clearTimeout(timer); return; }
      if (a === 'skip') { run.skip = !run.skip; syncBtns(); if (run.skip) { if (run.typing) { $('st28tx').textContent = run.full; typeDone(); } else if (!run.choosing) { clearTimeout(timer); timer = setTimeout(next, 60); } } return; }
      if (a === 'log') { showLog(); return; }
      if (a === 'logx') { $('st28lg').classList.remove('on'); if (!run) $('st28').classList.remove('on'); return; }
      if (a === 'exit') { $('st28cf').classList.add('on'); return; }
      if (a === 'exitno') { $('st28cf').classList.remove('on'); return; }
      if (a === 'exitok') { $('st28cf').classList.remove('on'); abort(); return; }
      return;
    }
    if (run && run.titling) { hideTitle(); return; }
    if (!run || run.choosing || run.fighting || $('st28lg').classList.contains('on') || $('st28cf').classList.contains('on')) return;
    if (run.typing) { clearInterval(typeT); typeDone(); } else { clearTimeout(timer); next(); }
  }
  function confirmK(c, i) {
    const o = c.opts[i], box = $('st28cs'); run.cur = c;
    box.innerHTML = `<div class="st-kh">⚑ 命運抉擇</div><div class="st-ph">你選擇了:<br><b>${fmt(o.t)}</b><br>此選擇將影響天地命運,確定嗎?</div><div class="st-row"><button class="k" data-s28="kok" data-i="${i}">確定</button><button data-s28="kno">再想想</button></div>`;
  }
  function abort() { clearTimeout(timer); clearInterval(typeT); const _t = run && run.n && run.n.post && run.then; if (run && run.n && !run.replay) declined[run.n.id] = 1; lastEndT = Date.now(); lastWasPost = !!(run && run.n && run.n.post); run = null; if (_t) setTimeout(_t, 200); { const t = $('st28ti'); if (t) t.classList.remove('on'); } $('st28').classList.remove('on'); $('st28cs').innerHTML = ''; badge(); }
  function showLog() {
    const s = SD(), lb = $('st28lb');
    lb.innerHTML = s.log.slice(-120).map(l => l.w === '▶' ? `<p style="color:#fcd34d"><i class="ii ui ii-c138_play"></i> ${esc(l.t)}</p>` : `<p>${l.w ? `<b style="color:#a5b4fc">${esc(l.w)}</b>` : ''}${esc(l.t)}</p>`).join('') || '<p style="color:#94a3b8">尚無紀錄。</p>';
    $('st28lg').classList.add('on'); lb.scrollTop = lb.scrollHeight;
  }
  const esc = t => String(t).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  /* ---------- 觸發與標記 ---------- */
  let notified = {};
  /* 自動劇情節流:同一時間只放一段;支線/系統劇情需間隔且玩家在場;婉拒的不重放 */
  const declined = {}; let lastEndT = 0, lastWasPost = false, lastTouch = Date.now();
  const early = () => (state.realmIdx || 0) <= 1;   /* v168 練氣・築基期突破快,劇情間隔縮短 */
  let POST_GAP = 90000, OPT_GAP = 100000, PRESENT = 60000, BACKLOG_GAP = 60000;
  setInterval(() => { const e = early(); POST_GAP = e ? 10000 : 90000; OPT_GAP = e ? 10000 : 100000; BACKLOG_GAP = e ? 10000 : 60000; }, 2000);
  ['pointerdown', 'touchstart', 'click', 'keydown'].forEach(ev => document.addEventListener(ev, () => { lastTouch = Date.now(); }, true));
  function blocked() {
    if (run || currentBattle || (window.TUT160 && TUT160.busy()) || (window.BF113 && BF113.on) || (window.THU160 && THU160.on) || (window.MOV174 && MOV174.on())) return true;
    return ['modal-ascension', 'modal-tribulation', 'modal-offline', 'modal-death-reincarnate', 'modal-event-choice', 'modal-event-result', 'modal-battle-result', 'modal-gender14', 'title34'].some(id => { const e = $(id); return e && !e.classList.contains('hidden') && getComputedStyle(e).display !== 'none' && e.getBoundingClientRect().height > 0; });
  }
  function badge() {
    const b = $('btn-story28'); if (!b) return;
    const el = eligible(); b.classList.toggle('dot', el.length > 0); b.classList.toggle('pulse', el.length > 0);
  }
  function scan() {
    ensureBtn();
    if (!NODES.length) return;
    badge();
    if (blocked() || !state.gender) return;
    const m = nextMain();
    const backlog = (() => { let c = 0; for (const x of mainNodes()) { if (seen(x.id) || x.end || x.post) continue; if (safe(x.at)) c++; else break; } return c; })();
    if (m && m.auto && !declined[m.id] && safe(m.at) && !(lastWasPost && Date.now() - lastEndT < POST_GAP) && !(backlog >= 2 && Date.now() - lastEndT < BACKLOG_GAP)) {
      if (m.id === '1.1' && !state.op176 && window.MOV174 && MOV174.has('opening')) { state.op176 = 1; MOV174.play('opening').then(() => play('1.1')); return; }   /* v176 開場動畫 */
      play(m.id); return; }
    /* 機緣節點(opt+auto):系統開放的劇情,條件齊備即自動演出;系統已開(讀檔/新周目)則靜默略過 */
    { const oa = NODES.find(n => n.opt && n.auto && !declined[n.id] && !seen(n.id) && (!n.after || seen(n.after)) && safe(n.at));
      if (oa) { if ((oa.sys && window.UNLOCK9 && UNLOCK9.on(oa.sys)) || (oa.cyc && (SD().cycle || 1) > 1)) { SD().seen[oa.id] = 1; try { saveGame(); } catch (e) { } } else if (Date.now() - lastEndT >= OPT_GAP && Date.now() - lastTouch < PRESENT) { play(oa.id); return; } } }
    eligible().forEach(n => { if (!notified[n.id]) { notified[n.id] = 1; try { showToast(`📖 劇情待觀:${n.title}(點右上 📖)`); } catch (e) { } } });
  }
  function ensureBtn() {
    if ($('btn-story28')) return;
    const m = $('btn-menu25'); if (!m) return;
    const b = document.createElement('button'); b.id = 'btn-story28'; b.dataset.x5 = 'st28.hub'; b.setAttribute('aria-label', '劇情'); b.textContent = '📖';
    m.parentElement.insertBefore(b, m);
  }
  setInterval(scan, 1500); setTimeout(scan, 1800);
  /* 章末門檻:嘗試渡劫前先觀看章末劇情 */
  { const o = openTribulationModal; openTribulationModal = function () {
    const g = gateNode(); const args = arguments, self = this;
    { const i = state.realmIdx || 0, ar = AREAS_DATA[i];
      if (ar && REALM_DATA[i + 1] && (state.subRealm || 1) >= REALM_DATA[i].subMax && !(state.areaFirstClear && state.areaFirstClear[ar.id])) return o.apply(this, arguments); } /* 境主未斬:交給原本的提示 */
    { const m = nextMain();   /* 依序補完:任何更早的主線未看完,先播它,再回來渡劫 */
      if (m && !m.post && CHR[m.ch] <= (state.realmIdx || 0)) {
        if (safe(m.at)) {
          const left = mainNodes().filter(x => !x.post && !seen(x.id) && CHR[x.ch] <= (state.realmIdx || 0) && safe(x.at)).length;
          if (left <= 2) { play(m.id, { then: () => openTribulationModal.apply(self, args) }); }
          else { play(m.id, { then: () => { try { showToast('📖 尚有前塵未了,再按一次渡劫繼續。'); } catch (e) { } } }); }
          return; }
        try { showToast('📖 仙途上尚有未了的前塵,需先完成本章劇情。'); } catch (e) { } return; } }
    { const L = reqList();   /* v173 本境界(含之前)的支線/機緣/遊學要先看完 */
      if (L.length) { play(L[0].id, { then: () => { const k = reqList().length; try { showToast(k ? `📖 突破前還有 ${k} 段劇情未看,再按一次渡劫繼續。` : '📖 前塵已了,再按一次渡劫。'); } catch (e) { } } }); return; } }
    if (g && safe(g.at)) { play(g.id, { then: () => (g.id === '8.6' ? daoLuo() : o.apply(self, args)) }); return; }
    if (g) { try { showToast('📖 仙途上尚有未了的前塵,需先完成本章劇情。'); } catch (e) { } return; }
    if ((state.realmIdx || 0) === 7 && seen('8.6')) { daoLuo(); return; }   /* 終章已演過:不再二次渡劫 */
    return o.apply(this, arguments);
  }; }
  /* 8.6 之後:一念成道,直接晉階大羅(不再有第二次天劫與舊版證道結局) */
  function daoLuo() {
    if ((state.realmIdx || 0) >= 8) return;
    const carry = Math.max(0, state.qi - getRealmInfo().maxQi);
    state.tribCount = (state.tribCount || 0) + 1; state.tribFailStreak = 0; state.demonDefeated = false;
    state.realmIdx = 8; state.subRealm = 1; state.qi = carry; state.maxAge += 800; state.stones += 3000; state.daoPoints = (state.daoPoints || 0) + 1;
    try { const m = document.getElementById('modal-tribulation'); if (m) m.classList.add('hidden'); } catch (e) { }
    try { showToast('☯ 一念成道,晉階【' + REALM_DATA[8].name + '】。仙途已至盡頭,可點右上 📖 開啟輪迴再修。'); logAdventure('<span class="text-amber-400 font-bold">【一念成道】前塵已了,道友晉階' + REALM_DATA[8].name + ',天賦道心點+1。</span>'); } catch (e) { }
    try { updateTopBar(); renderInventory(); renderProfile(); renderTalents(); saveGame(); } catch (e) { }
  }
  { const o = showDaoEnding; let last = 0; showDaoEnding = function () {
    if (SD().ending) { const t = Date.now(); if (t - last > 60000) { last = t; try { showToast('☯ 大羅圓滿,仙途已至盡頭。想再走一遍,可點右上 📖 開啟輪迴再修。'); } catch (e) { } } return; }
    return o.apply(this, arguments);
  }; }
  /* 化神→真仙:渡劫成功後才播 5.7(墨塵擋雷),再接原本的飛升儀式 */
  { const o = startAscension; startAscension = function () {
    const a = arguments, self = this, n = BY['5.7'];
    if (n && !seen('5.7') && !run) { play('5.7', { then: () => o.apply(self, a) }); return; }
    return o.apply(this, arguments);
  }; }
  /* 序章覆蓋原本的開場過場 */
  { const o = storyCheck; storyCheck = function () { if (run) return; if (NODES.length) { state.storySeen = state.storySeen || {}; state.storySeen.p0 = true; } return o.apply(this, arguments); }; }
  /* v109 未開啟原因 */
  function lockWhy(n) {
    const q = n.at && n.at._rq, rn = r => (REALM_DATA[r] || {}).name || '';
    const realmOk = !n.at || safe(n.at);
    const y = n.at && n.at._yx;
    if (!realmOk && y) return `${rn(y[0])}${y[1] > 1 ? `第 ${y[1]} 層` : ''}後開啟`;
    if (!realmOk && !q) { const W = { '1.4b': '在洞府打坐修煉片刻後開啟', '5.1': '看完〈神識通天〉後開啟', '5.7': '飛升時開啟', 's.cycle': '看完結局後開啟' }; if (W[n.id]) return W[n.id]; }
    if (!realmOk && q) return q[2] ? `${rn(q[0])}圓滿後開啟` : `${rn(q[0])}${q[1] > 1 && (REALM_DATA[q[0]] || {}).subMax > 1 ? `第 ${q[1]} 層` : ''}後開啟`;
    if (n.after && !seen(n.after)) return BY[n.after] && (seen(BY[n.after].id) || canNow(BY[n.after]) || goTo(BY[n.after])) ? `看完〈${BY[n.after].title}〉後開啟` : '看完前一段劇情後開啟';
    if (!n.opt) { const m = nextMain(); if (m && m.id !== n.id) return '依序看完前面的主線後開啟'; }
    return realmOk ? '條件達成後開啟' : '特定條件達成後開啟';
  }
  /* ---------- 劇情總覽 ---------- */
  const hubTitle = () => '📖 一念飛仙・劇情';
  X.sheet('st28', hubTitle, b => {
    const s = SD(), el = eligible(), ids = new Set(el.map(n => n.id));
    const chs = [...new Set(NODES.map(n => n.ch))].sort((a, b) => a - b);
    let h = `<div class="x5-sub" style="margin-bottom:8px">主線依境界推進。章末劇情須看完才能渡劫突破;其餘劇情可隨時觀看,也可重看已讀。</div>`;
    h += `<div class="x5-row" style="margin-bottom:8px;flex-wrap:wrap;gap:6px"><button class="x5-btn ${s.auto ? 'am' : 'gy'}" data-x5="st28.auto">自動播放:${s.auto ? '開' : '關'}</button><button class="x5-btn gy" data-x5="st28.spd">文字速度:${['慢', '正常', '快'][[0.7, 1, 1.6].indexOf(s.spd) < 0 ? 1 : [0.7, 1, 1.6].indexOf(s.spd)]}</button></div>`;
    { const L = reqList(), nx = REALM_DATA[(state.realmIdx || 0) + 1];   /* v173 突破前必看 */
      if (L.length && nx) h += `<div class="x5-cd" style="margin-bottom:8px"><b style="color:#fcd34d;font-size:14px">📖 突破【${nx.name}】前還需看完 ${L.length} 段</b>` + L.map(n => `<div class="x5-row" style="margin-top:6px;gap:8px"><div style="flex:1;min-width:0">${n.sys ? '<span class="x5-sub">[機緣]</span> ' : '<span class="x5-sub">[支線]</span> '}${n.title}</div><button class="x5-btn am" data-x5="st28.play" data-id="${n.id}">觀看</button></div>`).join('') + `</div>`; }
    if (window.SJ172) h += SJ172.card();   /* v172 生死交鋒預告 */
    if (window.MOV174 && MOV174.has('opening')) h += `<div class="x5-row" style="margin-bottom:8px"><button class="x5-btn gy" data-x5="st28.op">🎬 重看開場動畫</button></div>`;   /* v176 */
    const _top = h.length;
    chs.forEach(c => {
      const list0 = NODES.filter(n => n.ch === c); let lk = [-1, 0];   /* v109 依開啟境界排序;沒有境界資訊者沿用前一節的位置 */
      const list = list0.map((n, i) => { const q = n.at && n.at._rq; if (q) lk = [q[0], q[1]]; return { n, k: lk, i }; }).sort((a, b) => a.k[0] - b.k[0] || a.k[1] - b.k[1] || a.i - b.i).map(x => x.n), done = list.filter(n => s.seen[n.id]).length;
      h += `<div class="x5-cd" style="margin-bottom:8px"><b style="color:#fcd34d;font-size:14px">第${'零一二三四五六七八'[c]}章・${CHN[c]}</b> <span class="x5-sub">${done}/${list.length}</span>`;
      list.forEach(n => {
        const sn = !!s.seen[n.id], ok = ids.has(n.id);
        h += `<div class="x5-row" style="margin-top:6px;gap:8px"><div style="flex:1;min-width:0"><span style="color:${sn ? '#86efac' : ok ? '#fbbf24' : '#64748b'}">${sn ? '✔' : ok ? '▶' : '🔒'}</span> ${n.sys ? '<span class="x5-sub">[機緣]</span> ' : n.opt ? '<span class="x5-sub">[支線]</span> ' : ''}${sn || ok ? n.title : '？？？'}${!sn && !ok ? `<div class="x5-sub" style="margin-top:2px">🔒 ${lockWhy(n)}</div>` : ''}</div>${sn && fightOf(n) ? `<button class="x5-btn am" data-x5="st28.refight" data-id="${n.id}" style="margin-right:4px">⚔ 重戰</button>` : ''}${sn ? `<button class="x5-btn gy" data-x5="st28.play" data-id="${n.id}">重看</button>` : ok ? `<button class="x5-btn am" data-x5="st28.play" data-id="${n.id}">觀看</button>` : (() => { const g = goTo(n); return g && g !== n ? `<button class="x5-btn am" data-x5="st28.play" data-id="${g.id}">前往</button>` : ''; })()}</div>`;
      });
      h += '</div>';
    });
    { const _e0 = h.length; const EN = { fly: ['飛仙', '你接下天位,改寫了收割的規則。'], slay: ['弒天', '天道崩塌,新的時代開始了。'], one: ['歸一', '散道入凡,天地自成其道。'] };
      h += `<div class="x5-cd" style="margin-bottom:8px"><b style="color:#fcd34d">📜 結局收藏</b> <span class="x5-sub">${Object.keys(s.endings).length}/3・第 ${s.cycle || 1} 周目</span>` + ['fly', 'slay', 'one'].map(k => `<div class="x5-row" style="margin-top:6px"><div style="flex:1">${s.endings[k] ? `<span style="color:#86efac">✔</span> ${EN[k][0]} <span class="x5-sub">${EN[k][1]}(第${s.endings[k]}周目)</span>` : '<span style="color:#64748b">🔒 ？？？</span>'}</div></div>`).join('') + '</div>';
      const NB = { mo: '墨塵', su: '蘇棠', ye: '夜無咎', ba: '白澤' }, bl = Object.keys(NB).filter(k => (s.bond[k] || 0) > 0);
      if (bl.length) h += `<div class="x5-cd" style="margin-bottom:8px"><b style="color:#fcd34d">💞 羈絆</b>${bl.map(k => `<div class="x5-row" style="margin-top:4px"><span style="width:56px">${NB[k]}</span><div style="flex:1;height:6px;border-radius:3px;background:#1e293b"><div style="width:${Math.round(s.bond[k] / 30 * 100)}%;height:100%;border-radius:3px;background:#f472b6"></div></div><span class="x5-sub" style="width:34px;text-align:right">${s.bond[k]}</span></div>`).join('')}</div>`;
      if (s.ending) h += `<div class="x5-cd" style="margin-bottom:8px"><b style="color:#c4b5fd">🔄 輪迴再修</b><div class="x5-sub" style="margin:4px 0 8px">從第一章重新開始新的一世:圖鑑、稱號、結局收藏與道心點保留;每一周目吐納 +30%(至多 +90%),突破所需修為不變,妖魔每世強 5%。已看過的劇情可按「跳過」,關鍵抉擇可重新選擇。</div><button class="x5-btn ${cyc.arm ? 'am' : 'gy'}" data-x5="st28.cycle">${cyc.arm ? '再按一次,確認輪迴' : '開啟新周目'}</button></div>`; h = h.slice(0, _top) + h.slice(_e0) + h.slice(_top, _e0); }
    const keys = Object.keys(s.key).sort();
    if (keys.length) h += `<div class="x5-cd" style="margin-bottom:8px"><b style="color:#fcd34d">⚑ 命運抉擇記錄</b>${keys.map(k => `<div class="x5-sub" style="margin-top:4px">${k.toUpperCase()}:${ROUTE[s.key[k]]}之路</div>`).join('')}</div>`;
    h += `<button class="x5-btn gy" data-x5="st28.log" style="width:100%">📜 劇情回顧(最近對話)</button>`;
    b.innerHTML = h;
  });
  const cyc = { arm: false, t: 0 };
  X.act('st28.cycle', () => {
    const s = SD(); if (!s.ending) { try { showToast('主線未了,真靈不可輕離此世。'); } catch (e) { } return; }
    if (!cyc.arm) { cyc.arm = true; clearTimeout(cyc.t); cyc.t = setTimeout(() => { cyc.arm = false; try { X.refresh('st28'); } catch (e) { } }, 4000); X.refresh('st28'); return; }
    cyc.arm = false; X.close('st28'); const at8 = (state.realmIdx || 0) >= 8; triggerLifespanEnd();
    if (at8) { state._pendingDaoGain = (state._pendingDaoGain || 0) + 30; try { const g = document.getElementById('reincarnate-gain-dao'); if (g) g.innerText = `+${state._pendingDaoGain} 點`; } catch (e) { } }
  });
  X.act('st28.hub', () => X.open('st28'));
  X.act('st28.auto', () => { const s = SD(); s.auto = !s.auto; X.refresh('st28'); saveGame(); });
  X.act('st28.spd', () => { const s = SD(), a = [0.7, 1, 1.6], i = a.indexOf(s.spd); s.spd = a[(i + 1) % 3]; X.refresh('st28'); saveGame(); });
  /* v113 重戰:找出節點裡的劇情戰設定 */
  function fightOf(n) { let f = null; const walk = x => { if (f || !x || typeof x !== 'object') return; if (x.fight && typeof x.fight === 'object' && x.fight.name) { f = x.fight; return; } (Array.isArray(x) ? x : Object.values(x)).forEach(walk); }; walk(n.beats); return f; }
  X.act('st28.refight', t => { const n = BY[t.dataset.id], f = n && fightOf(n); if (!f || !window.BF113 || run) return; if (currentBattle && !(window.HO43 && HO43.yieldBattle())) { try { showToast('戰鬥中無法重戰。'); } catch (e) { } return; } X.close('st28'); BF113.start(Object.assign({}, f, { rematch: true })).then(() => { try { X.open('st28'); } catch (e) { } }); });
  X.act('st28.op', () => { if (run) return; X.close('st28'); MOV174.play('opening'); });   /* v176 */
  X.act('st28.play', t => { const id = t.dataset.id, n = BY[id]; if (!n) return; if (blocked() && !run) { try { showToast('目前無法觀看劇情。'); } catch (e) { } return; } X.close('st28'); play(id); });
  X.act('st28.log', () => { X.close('st28'); ensureUI(); $('st28').classList.add('on'); showLog(); });
  /* 主線未了不會坐化;結局後坐化/輪迴 = 新周目 */
  { const o = triggerLifespanEnd; triggerLifespanEnd = function () {
    if (!SD().ending) { if (state.age >= state.maxAge) { state.age = Math.max(0, Math.floor((state.maxAge || 100) * 0.6)); state.ageTimer = 0; try { showToast('📖 一念珠護住了你的真靈,壽元回溯——主線未了,不得輕離此世。'); updateTopBar(); } catch (e) { } } else { try { showToast('主線未了,真靈不可輕離此世。'); } catch (e) { } } return; }
    return o.apply(this, arguments);
  }; }
  { const o = executeReincarnation; executeReincarnation = function () {
    const old = JSON.parse(JSON.stringify(SD())), done = !!old.ending;
    const r = o.apply(this, arguments);
    if (done) {
      const d = DEF(); d.endings = old.endings || {}; d.loops = (old.loops || 0) + 1; d.cycle = (old.cycle || 1) + 1; d.spd = old.spd; d.auto = old.auto;
      state.story27 = d; state.gender = null; notified = {}; try { saveGame(); badge(); showToast(`🔄 第 ${d.cycle} 周目開始。前塵如夢,這一世,你想走哪條路?`); } catch (e) { }
    }
    return r;
  }; }
  window.STORY28 = { play, SD, eligible, gateNode, nextMain, seen, flag, ensureUI, get run() { return run; } };
})();


window.ART28 = window.ART28 || { bg: {}, ch: {} };


