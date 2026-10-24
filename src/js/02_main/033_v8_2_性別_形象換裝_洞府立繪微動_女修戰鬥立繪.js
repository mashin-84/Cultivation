/* ===== v8.2:性別 · 形象換裝 · 洞府立繪微動 · 女修戰鬥立繪 ===== */
(function () {
  const $ = id => document.getElementById(id);
  const IMG = (typeof LOOK_IMG !== 'undefined') ? LOOK_IMG : {};
  const pre = g => (g === 'f' ? 'F_' : 'M_');
  const art = (g, id) => IMG[pre(g) + id] || null;
  /* ---------- 外觀資料 ---------- */
  const OUT = [
    { id: 'o1', name: '青雲道袍', sub: '初入道門', col: '#94a3b8', cond: () => true, tip: '初始外觀' },
    { id: 'o2', name: '素白宗門服', sub: '遊學客卿', col: '#38bdf8', cond: s => !!s.sect || Object.keys(s.sectGrad || {}).length > 0, tip: '加入任一宗門' },
    { id: 'o3', name: '墨羽玄袍', sub: '逆天而行', col: '#a78bfa', cond: s => ((s.story27 && s.story27.score && s.story27.score.r) || 0) >= 3, tip: '逆天而行(劇情逆天抉擇 ≥ 3)' },
    { id: 'o4', name: '赤霞法衣', sub: '金丹華服', col: '#fb923c', cond: s => (s.realmIdx || 0) >= 2, tip: '修至金丹期' },
    { id: 'o5', name: '紫電雲裳', sub: '飛升仙袍', col: '#f0abfc', cond: s => !!s.ascended || (s.realmIdx || 0) >= 5, tip: '飛升仙界' }
  ];
  const OBY = {}; OUT.forEach(o => OBY[o.id] = o);
  const avail = id => !!(art('f', id) || art('m', id));
  const GN = { m: '男修', f: '女修' };
  /* ---------- 存檔欄位保險 ---------- */
  function init() {
    if (state.gender !== 'm' && state.gender !== 'f') state.gender = null;
    if (!Array.isArray(state.wardrobe)) state.wardrobe = ['o1'];
    if (!state.wardrobe.includes('o1')) state.wardrobe.unshift('o1');
    if (!Array.isArray(state.lookSeen)) state.lookSeen = state.wardrobe.slice();
    if (typeof state.look !== 'string' || !OBY[state.look] || !state.wardrobe.includes(state.look)) state.look = 'o1';
  }
  const curImg = () => art(state.gender || 'm', state.look) || art(state.gender || 'm', 'o1') || art('m', 'o1');
  /* ---------- 戰鬥立繪依性別切換 ---------- */
  const MS = { S0: GEN3.S0, S1: GEN3.S1, S2: GEN3.S2 };
  let appliedG = '#';
  function applySprites() {
    const f = state.gender === 'f';
    ['S0', 'S1', 'S2'].forEach(k => { const src = (f && IMG['F_' + k]) || MS[k]; GEN3[k] = src; const i = new Image(); i.src = src; });
    appliedG = state.gender;
    const im = $('bs-ps'); if (im) { im.src = GEN3.S0; im.classList.toggle('f14', f); }
  }
  XT.fxSetup82 = _fs => function () { _fs.apply(this, arguments); const im = $('bs-ps'); if (im) { im.src = GEN3.S0; im.classList.toggle('f14', state.gender === 'f'); } };
  /* ---------- 樣式 ---------- */
  const st = document.createElement('style');
  st.textContent = `
.bs-pl .bs-ps.f14{height:128px}
#tab-abode>div:first-child{height:clamp(380px,60dvh,470px)!important}
#tab-abode>div:first-child>img{opacity:.9!important}
.lk14-hide{display:none!important}
.lk-stage{position:absolute;left:0;right:0;top:44px;bottom:116px;display:flex;justify-content:center;align-items:flex-end;z-index:5;pointer-events:none}
.lkf{position:relative;height:100%;transform-origin:50% 100%;animation:lkBreath 6s ease-in-out infinite;will-change:transform}
.lkf img{display:block;height:100%;width:auto;max-width:none;user-select:none;-webkit-user-drag:none;filter:drop-shadow(0 6px 10px rgba(2,6,23,.55))}
.lkf img.lk-t{clip-path:inset(0 0 50% 0)}
.lkf img.lk-b{position:absolute;left:0;top:0;width:100%;height:100%;clip-path:inset(49.6% 0 0 0);transform-origin:50% 50%;animation:lkHem 4.6s ease-in-out infinite;will-change:transform}
.dk-l{position:absolute;inset:0;pointer-events:none;overflow:visible}
.dk{position:absolute;translate:-50% -50%;pointer-events:none}
.dk img{display:block;width:100%;height:auto;max-width:none;user-select:none;-webkit-user-drag:none}
@keyframes dkSway{0%,100%{transform:rotate(var(--a0,-4deg))}50%{transform:rotate(var(--a1,4deg)) translateY(calc(var(--u,3px)*-1.2))}}
@keyframes dkSpin{to{transform:rotate(360deg)}}
@keyframes dkDrift{0%,100%{transform:translateX(calc(var(--u,3px)*-3));opacity:.25}50%{transform:translateX(calc(var(--u,3px)*3));opacity:.6}}
@keyframes dkBob{0%,100%{transform:translateY(0)}50%{transform:translateY(calc(var(--u,3px)*-2.4))}}
@keyframes dkTw{0%,100%{opacity:.1;transform:scale(.55)}50%{opacity:1;transform:scale(1.15)}}
@keyframes dkFall{0%{transform:translate(0,calc(var(--u,3px)*-8));opacity:0}8%{opacity:.95}85%{opacity:.9}100%{transform:translate(var(--dx,12px),calc(var(--u,3px)*108));opacity:0}}
@keyframes dkFlut{0%,100%{transform:rotate(-38deg) scaleX(1)}50%{transform:rotate(42deg) scaleX(.7)}}
@keyframes dkFlyR{0%{transform:translateX(calc(var(--sw,360px)*-.2));opacity:0}2%{opacity:1}22%{transform:translateX(calc(var(--sw,360px)*1.15));opacity:1}23%,100%{transform:translateX(calc(var(--sw,360px)*1.15));opacity:0}}
@keyframes dkFlyL{0%{transform:translateX(calc(var(--sw,360px)*1.15));opacity:0}2%{opacity:1}22%{transform:translateX(calc(var(--sw,360px)*-.2));opacity:1}23%,100%{transform:translateX(calc(var(--sw,360px)*-.2));opacity:0}}
@media (prefers-reduced-motion:reduce){.dk,.dk img{animation:none!important}}
.lkw{position:relative;height:100%;aspect-ratio:.6}
.lkw-cv{position:absolute;left:-6%;top:-6%;width:112%;height:112%;pointer-events:none;filter:drop-shadow(0 6px 10px rgba(2,6,23,.55))}
.lk14-ovl{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#e2e8f0;font-weight:800;font-size:15px;text-shadow:0 2px 6px #000;z-index:9;pointer-events:none}
.lk-sh{position:absolute;left:12%;right:12%;bottom:-6px;height:16px;background:radial-gradient(ellipse at 50% 50%,rgba(2,6,23,.6),transparent 70%);z-index:-1}
.lk-mist{position:absolute;left:-30%;width:160%;bottom:-6px;height:46%;background:radial-gradient(ellipse at 50% 100%,rgba(203,213,225,.22),rgba(203,213,225,0) 68%);animation:lkMist 15s ease-in-out infinite alternate;z-index:-2}
.lk-mist.b{height:34%;opacity:.8;animation-duration:21s;animation-direction:alternate-reverse}
.lk-sp{position:absolute;bottom:14%;width:5px;height:5px;border-radius:50%;background:radial-gradient(circle,#fff8c4,#fbbf24 55%,transparent 72%);opacity:0;animation:lkRise 7s linear infinite;z-index:3}
@keyframes lkBreath{0%,100%{transform:scale(1,1) rotate(-.25deg)}50%{transform:scale(1.004,1.011) rotate(.3deg)}}
@keyframes lkHem{0%,100%{transform:skewX(-1.3deg) scaleX(1)}50%{transform:skewX(1.3deg) scaleX(1.006)}}
@keyframes lkMist{0%{transform:translateX(-7%)}100%{transform:translateX(7%)}}
@keyframes lkRise{0%{transform:translate(0,0) scale(.6);opacity:0}15%{opacity:.95}100%{transform:translate(var(--dx,10px),-150px) scale(1.1);opacity:0}}
@media (prefers-reduced-motion:reduce){.lkf,.lkf img.lk-b,.lk-mist,.lk-sp{animation:none!important}}
.lk-chip{position:absolute;z-index:30;top:10px;font-weight:800;font-size:13px;color:#fde68a;background:rgba(2,6,23,.62);border:1px solid #92400e99;border-radius:999px;padding:6px 12px;backdrop-filter:blur(4px)}
#btn-look14{right:10px;min-height:36px;display:flex;align-items:center;gap:4px}
.rd14{position:absolute;top:-3px;right:-3px;width:11px;height:11px;border-radius:50%;background:#ef4444;border:2px solid #0f172a}
/* 更衣彈窗 */
.lk14-ov{position:fixed;inset:0;z-index:70;background:rgba(2,6,23,.88);display:flex;align-items:flex-end;justify-content:center}
.lk14-pn{width:100%;max-width:520px;background:linear-gradient(180deg,#0f1a2e,#0a1120);border:1px solid #92400e88;border-bottom:0;border-radius:18px 18px 0 0;padding:12px 14px 16px;max-height:94dvh;overflow-y:auto;overscroll-behavior:contain;color:#e2e8f0}
.lk14-hd{display:flex;align-items:center;justify-content:space-between;font-weight:900;font-size:17px;color:#fcd34d;margin-bottom:6px}
.lk14-hd button{min-width:40px;min-height:40px;font-size:18px;color:#94a3b8;background:none;border:0}
.lk14-pv{position:relative;height:min(34dvh,290px);border-radius:14px;overflow:hidden;background:linear-gradient(180deg,#1e293b,#0b1220);border:1px solid #334155}
.lk14-pv .lk-stage{top:8px;bottom:8px}
.lk14-nm{text-align:center;font-weight:900;font-size:16px;margin-top:8px;color:#f8fafc}
.lk14-sc{text-align:center;font-size:13px;color:#94a3b8;margin-top:2px}
.lk14-gd{display:flex;align-items:center;gap:8px;margin:10px 0 6px;font-size:14px;font-weight:800;color:#fcd34d}
.lk14-gd button{flex:1;min-height:42px;border-radius:10px;border:1px solid #334155;background:#111a2e;color:#cbd5e1;font-weight:800;font-size:15px}
.lk14-gd button.on{border-color:#f59e0b;color:#fcd34d;background:#2a1d08}
.lk14-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:6px}
.lk14-cd{position:relative;border-radius:12px;border:2px solid #334155;background:#0b1220;padding:4px;text-align:center;color:#e2e8f0;min-height:0}
.lk14-cd.sel{box-shadow:0 0 0 2px #fbbf24}
.lk14-th{height:104px;border-radius:8px;background-color:#14213a;background-image:linear-gradient(160deg,#1a2a46,#0c1424);background-repeat:no-repeat;background-size:230% auto;background-position:50% 6%;display:flex;align-items:center;justify-content:center;font-size:13px;color:#64748b}
.lk14-cd.lk .lk14-th[style]{filter:grayscale(1) brightness(.45)}
.lk14-cd .n{font-weight:800;font-size:13px;margin-top:4px;line-height:1.25}
.lk14-cd .s{font-size:11.5px;color:#94a3b8;line-height:1.3;min-height:15px}
.lk14-cd .b{position:absolute;top:6px;left:6px;font-size:11px;font-weight:800;background:rgba(2,6,23,.8);border-radius:6px;padding:1px 5px;color:#fde68a}
.lk14-eq{width:100%;min-height:46px;margin-top:10px;border-radius:12px;border:1px solid #f59e0b;background:linear-gradient(90deg,#b45309,#d97706);color:#0b1220;font-weight:900;font-size:16px}
.lk14-eq[disabled]{background:#1e293b;border-color:#334155;color:#94a3b8}
.lk14-tp{font-size:12.5px;color:#94a3b8;text-align:center;margin-top:8px;line-height:1.5}
/* 擇定道體 */
.gd14{position:fixed;inset:0;z-index:90;background:radial-gradient(ellipse at 50% 20%,#1b2a44,#070b14 70%);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px;overflow-y:auto;overscroll-behavior:contain}
.gd14 h2{font-weight:900;font-size:24px;color:#fcd34d;letter-spacing:.2em;margin:0}
.gd14 p{font-size:13.5px;color:#94a3b8;margin:6px 0 12px;text-align:center;line-height:1.6;max-width:360px}
.gd14-row{display:flex;gap:10px;width:100%;max-width:420px}
.gd14-cd{flex:1;border-radius:16px;border:2px solid #334155;background:linear-gradient(180deg,#111a2e,#0b1220);padding:8px 6px 10px;text-align:center;color:#e2e8f0;display:flex;flex-direction:column;align-items:center}
.gd14-cd.on{border-color:#fbbf24;box-shadow:0 0 18px #f59e0b55}
.gd14-cd .im{height:min(40dvh,330px);width:100%;display:flex;justify-content:center;align-items:flex-end}
.gd14-cd img{height:100%;width:auto;max-width:100%;object-fit:contain}
.gd14-cd b{margin-top:8px;font-size:18px;font-weight:900;color:#fcd34d}
.gd14-nm{width:100%;max-width:420px;margin-top:12px;display:flex;align-items:center;gap:10px;border:1px solid #334155;border-radius:12px;background:#0b1220;padding:6px 12px}.gd14-nm label{color:#fcd34d;font-weight:900;letter-spacing:.2em;font-size:14px;white-space:nowrap}.gd14-nm input{flex:1;min-width:0;background:transparent;border:0;outline:0;color:#fde68a;font-size:17px;font-weight:700;padding:8px 0;letter-spacing:.1em}.gd14-nm input::placeholder{color:#64748b;font-weight:400;letter-spacing:0}.gd14-ok{margin-top:14px;width:100%;max-width:420px;min-height:50px;border-radius:14px;border:1px solid #f59e0b;background:linear-gradient(90deg,#b45309,#d97706);color:#0b1220;font-weight:900;font-size:17px}
.gd14-ok[disabled]{background:#1e293b;border-color:#334155;color:#64748b}
`;
  document.head.appendChild(st);
  /* ---------- 立繪元件:WebGL 網格形變(髮絲/袖/衣襬分區擺動),不支援時退回 CSS 版 ---------- */
  const GX = 24, GY = 36, PAD = 0.06;
  const VS = 'attribute vec2 a_uv;attribute float a_w;uniform float u_t;uniform float u_a;varying vec2 v_uv;void main(){float ph=a_uv.y*3.2+a_uv.x*2.1;float dx=sin(u_t*1.5+ph)+.5*sin(u_t*2.7+ph*1.8);float dy=.4*sin(u_t*1.2+ph*1.4+1.0);vec2 p=a_uv+vec2(dx,dy*.35)*u_a*a_w;vec2 q=(p+vec2(' + PAD + '))/(1.0+' + (2 * PAD) + ');gl_Position=vec4(q.x*2.0-1.0,1.0-q.y*2.0,0.0,1.0);v_uv=a_uv;}';
  const FS = 'precision mediump float;varying vec2 v_uv;uniform sampler2D u_tex;void main(){gl_FragColor=texture2D(u_tex,v_uv);}';
  const ss = (a, b, t) => { t = Math.min(1, Math.max(0, (t - a) / (b - a))); return t * t * (3 - 2 * t); };
  let GLOK = true;
  const insts = new Set();
  function calcWeights(im) {
    const sw = 96, sh = Math.max(16, Math.round(96 * im.height / im.width)), c = document.createElement('canvas'); c.width = sw; c.height = sh;
    const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(im, 0, 0, sw, sh);
    let d = null; try { d = x.getImageData(0, 0, sw, sh).data; } catch (e) { }
    const asp = im.width / im.height, N = sw * sh, skin = new Uint8Array(N);
    let sx = 0, sa = 0;
    if (d) for (let y = 0; y < sh; y++) for (let xx = 0; xx < sw; xx++) {
      const k = (y * sw + xx) * 4, r = d[k], g = d[k + 1], b = d[k + 2], a = d[k + 3];
      if (y >= sh * .22 && y < sh * .52) { sx += xx * a; sa += a; }
      if (a > 200 && r > 150 && r - b > 18 && r >= g && g > b && r - g < 75 && g > 105) skin[y * sw + xx] = 1;
    }
    const cx = sa ? sx / sa / sw : .5;
    // 臉:頭部區域(上 30%)最大的膚色團;找不到就用幾何預設
    let fx = 0, fy = 0, fn = 0, minx = 1e9, maxx = -1, miny = 1e9, maxy = -1;
    for (let y = 0; y < sh * .3; y++) for (let xx = 0; xx < sw; xx++) if (skin[y * sw + xx]) { fx += xx; fy += y; fn++; minx = Math.min(minx, xx); maxx = Math.max(maxx, xx); miny = Math.min(miny, y); maxy = Math.max(maxy, y); }
    let fcx, fcy, fr;
    if (fn > 12) { fcx = fx / fn; fcy = fy / fn; fr = Math.max(maxx - minx, maxy - miny) * 0.95 + 3; }
    else { fcx = cx * sw; fcy = sh * .09; fr = sw * .12; }
    // 保護遮罩:臉(圓)＋其他膚色(手)
    const pm = new Float32Array(N);
    for (let y = 0; y < sh; y++) for (let xx = 0; xx < sw; xx++) {
      const i = y * sw + xx, dd = Math.hypot(xx - fcx, (y - fcy) * 0.9);
      if (dd < fr) pm[i] = 1;
    }
    const hand = new Uint8Array(N);
    for (let y = 0; y < sh; y++) for (let xx = 0; xx < sw; xx++) if (skin[y * sw + xx] && Math.hypot(xx - fcx, y - fcy) > fr * 1.1) hand[y * sw + xx] = 1;
    const R = 5;
    for (let y = 0; y < sh; y++) for (let xx = 0; xx < sw; xx++) if (hand[y * sw + xx]) {
      for (let yy = Math.max(0, y - R); yy <= Math.min(sh - 1, y + R); yy++) for (let x2 = Math.max(0, xx - R); x2 <= Math.min(sw - 1, xx + R); x2++) {
        const q = 1 - Math.hypot(x2 - xx, yy - y) / (R + 1); if (q > pm[yy * sw + x2]) pm[yy * sw + x2] = Math.min(1, q * 1.6);
      }
    }
    const W1 = GX + 1, w = new Float32Array(W1 * (GY + 1));
    for (let j = 0; j <= GY; j++) for (let i = 0; i <= GX; i++) {
      const x0 = i / GX, y0 = j / GY, dx = Math.abs(x0 - cx) * asp;
      const side = ss(.085, .27, dx) * ss(.12, .3, y0) * .9;
      const hair = y0 < .45 ? ss(.05, .15, dx) * (1 - ss(.3, .45, y0)) * .8 : 0;
      const hem = ss(.5, .74, y0) * (1 - ss(.80, .90, y0)) * (.25 + .75 * ss(.03, .2, dx)) * .75;
      let v = Math.max(side, hair, hem) * (1 - ss(.78, .88, y0));
      const px = Math.min(sw - 1, Math.round(x0 * (sw - 1))), py = Math.min(sh - 1, Math.round(y0 * (sh - 1)));
      let p = 0; for (let yy = Math.max(0, py - 2); yy <= Math.min(sh - 1, py + 2); yy++) for (let x2 = Math.max(0, px - 2); x2 <= Math.min(sw - 1, px + 2); x2++) p = Math.max(p, pm[yy * sw + x2]);
      w[j * W1 + i] = v * (1 - Math.min(1, p));
    }
    // 平滑權重,避免相鄰頂點位移差太大造成扭曲
    for (let pass = 0; pass < 2; pass++) {
      const t = w.slice();
      for (let j = 0; j <= GY; j++) for (let i = 0; i <= GX; i++) {
        let sum = 0, cnt = 0;
        for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) { const jj = j + dj, ii = i + di; if (jj < 0 || jj > GY || ii < 0 || ii > GX) continue; sum += t[jj * W1 + ii]; cnt++; }
        w[j * W1 + i] = Math.min(t[j * W1 + i], sum / cnt) * .5 + sum / cnt * .5;
      }
    }
    return w;
  }
  function makeWarp(host) {
    if (!GLOK) return null;
    const cv = document.createElement('canvas'), gl = cv.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false });
    if (!gl) { GLOK = false; return null; }
    const sh = (t, src) => { const o = gl.createShader(t); gl.shaderSource(o, src); gl.compileShader(o); return gl.getShaderParameter(o, gl.COMPILE_STATUS) ? o : null; };
    const vs = sh(gl.VERTEX_SHADER, VS), fs = sh(gl.FRAGMENT_SHADER, FS), pg = gl.createProgram();
    if (!vs || !fs) { GLOK = false; return null; }
    gl.attachShader(pg, vs); gl.attachShader(pg, fs); gl.linkProgram(pg);
    if (!gl.getProgramParameter(pg, gl.LINK_STATUS)) { GLOK = false; return null; }
    gl.useProgram(pg);
    const uv = new Float32Array((GX + 1) * (GY + 1) * 2), idx = new Uint16Array(GX * GY * 6);
    for (let j = 0; j <= GY; j++) for (let i = 0; i <= GX; i++) { const k = (j * (GX + 1) + i) * 2; uv[k] = i / GX; uv[k + 1] = j / GY; }
    let n = 0; for (let j = 0; j < GY; j++) for (let i = 0; i < GX; i++) { const a = j * (GX + 1) + i, b = a + 1, c = a + GX + 1, d = c + 1; idx[n++] = a; idx[n++] = b; idx[n++] = c; idx[n++] = b; idx[n++] = d; idx[n++] = c; }
    const bu = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bu); gl.bufferData(gl.ARRAY_BUFFER, uv, gl.STATIC_DRAW);
    const lu = gl.getAttribLocation(pg, 'a_uv'); gl.enableVertexAttribArray(lu); gl.vertexAttribPointer(lu, 2, gl.FLOAT, false, 0, 0);
    const bw = gl.createBuffer(), lw = gl.getAttribLocation(pg, 'a_w'); gl.bindBuffer(gl.ARRAY_BUFFER, bw); gl.bufferData(gl.ARRAY_BUFFER, (GX + 1) * (GY + 1) * 4, gl.DYNAMIC_DRAW); gl.enableVertexAttribArray(lw); gl.vertexAttribPointer(lw, 1, gl.FLOAT, false, 0, 0);
    const bi = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bi); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
    const tex = gl.createTexture(), uT = gl.getUniformLocation(pg, 'u_t'), uA = gl.getUniformLocation(pg, 'u_a');
    cv.className = 'lkw-cv'; host.appendChild(cv);
    const inst = {
      cv, host, gl, ready: false, src: '',
      setImage(src) {
        if (src === inst.src) return; inst.src = src;
        const im = new Image(); im.onload = () => {
          if (inst.src !== src) return;
          const H = Math.min(im.height, 760), W = Math.round(im.width * H / im.height), oc = document.createElement('canvas'); oc.width = W; oc.height = H;
          const ox = oc.getContext('2d'); ox.imageSmoothingQuality = 'high'; ox.drawImage(im, 0, 0, W, H);
          gl.bindTexture(gl.TEXTURE_2D, tex); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, oc);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          gl.bindBuffer(gl.ARRAY_BUFFER, bw); gl.bufferSubData(gl.ARRAY_BUFFER, 0, calcWeights(im));
          host.style.aspectRatio = im.width + ' / ' + im.height; inst.ready = true;
        }; im.src = src;
      },
      draw(t) {
        if (!inst.ready) return;
        const d = Math.min(window.devicePixelRatio || 1, 2.5), w = Math.round(cv.clientWidth * d), h = Math.round(cv.clientHeight * d);
        if (!w || !h) return;
        if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
        gl.viewport(0, 0, w, h); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(pg); gl.bindTexture(gl.TEXTURE_2D, tex); gl.uniform1f(uT, t); gl.uniform1f(uA, 0.018);
        gl.bindBuffer(gl.ARRAY_BUFFER, bu); gl.vertexAttribPointer(lu, 2, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, bw); gl.vertexAttribPointer(lw, 1, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bi); gl.drawElements(gl.TRIANGLES, GX * GY * 6, gl.UNSIGNED_SHORT, 0);
      }
    };
    cv.addEventListener('webglcontextlost', e => { e.preventDefault(); insts.delete(inst); GLOK = false; if (host._stg) { host._stg._w = null; host._stg._src = ''; } });
    insts.add(inst); return inst;
  }
  let lastT = 0;
  function loop(ts) {
    requestAnimationFrame(loop);
    if (document.hidden || ts - lastT < 30) return; lastT = ts;
    insts.forEach(i => { if (!i.cv.isConnected) { insts.delete(i); try { const g = i.gl; const x = g && g.getExtension('WEBGL_lose_context'); x && x.loseContext(); } catch (e) { } return; } if (i.cv.offsetParent) i.draw(ts / 1000); });
  }
  requestAnimationFrame(loop);
  function sparks() { let sp = ''; for (let i = 0; i < 12; i++) sp += `<i class="lk-sp" style="left:${8 + Math.random() * 84}%;--dx:${Math.round(-18 + Math.random() * 36)}px;animation-delay:${(Math.random() * 7).toFixed(2)}s;animation-duration:${(5.5 + Math.random() * 3.5).toFixed(2)}s"></i>`; return sp; }
  function figure(src) { return `<div class="lkf"><i class="lk-mist"></i><i class="lk-mist b"></i><i class="lk-sh"></i><img class="lk-t" src="${src}" alt="" draggable="false"><img class="lk-b" src="${src}" alt="" draggable="false">${sparks()}</div>`; }
  /* ---------- 飄浮裝飾(靈鳥/絲帶/落葉/靈氣/光環/星芒):素材表切件,CSS 獨立動畫 ---------- */
  const DECO = (typeof DECO_IMG !== 'undefined') ? DECO_IMG : {};
  const decoSet = () => DECO[state.look] || DECO.base || null;
  const SPEC = [
    { l: 'b', k: 'ring', x: 50, y: 45, w: 98, op: .42, ia: 'dkSpin 140s linear infinite' },
    { l: 'b', k: 'swirl_a', x: 22, y: 60, w: 58, op: .46, ia: 'dkSway 15s ease-in-out infinite', v: '--a0:-10deg;--a1:10deg' },
    { l: 'b', k: 'swirl_b', x: 79, y: 36, w: 46, op: .4, ia: 'dkSway 18s ease-in-out -6s infinite', v: '--a0:8deg;--a1:-8deg' },
    { l: 'b', k: 'wisp_a', x: 76, y: 82, w: 50, op: .45, ia: 'dkDrift 12s ease-in-out infinite' },
    { l: 'b', k: 'wisp_b', x: 20, y: 90, w: 48, op: .4, ia: 'dkDrift 16s ease-in-out -5s infinite' },
    { l: 'b', k: 'ribbon_teal', x: 20, y: 24, w: 56, op: .82, ia: 'dkSway 8s ease-in-out infinite', v: '--a0:-5deg;--a1:5deg', o: '0% 50%' },
    { l: 'b', k: 'crane', x: 0, y: 15, w: 15, wa: 'dkFlyR 50s linear 4s infinite', ia: 'dkBob 2.4s ease-in-out infinite' },
    { l: 'b', k: 'sparrow', x: 0, y: 30, w: 10, wa: 'dkFlyL 68s linear 22s infinite', ia: 'dkBob 1.8s ease-in-out infinite' },
    { l: 'f', k: 'ribbon_gold', x: 82, y: 68, w: 52, op: .82, ia: 'dkSway 9s ease-in-out -3s infinite', v: '--a0:6deg;--a1:-6deg', o: '100% 50%' },
    { l: 'f', k: 'ribbon_white', x: 17, y: 78, w: 50, op: .72, ia: 'dkSway 10s ease-in-out -5s infinite', v: '--a0:-6deg;--a1:6deg', o: '0% 50%' },
    { l: 'f', k: 'talisman', x: 88, y: 22, w: 9, ia: 'dkBob 5s ease-in-out infinite' }
  ];
  const SPK = ['spark_a', 'spark_b', 'spark_c', 'spark_d', 'spark_e'], LEAF = ['leaf_teal', 'petal_pink', 'leaf_brown', 'flower', 'petal_gold', 'leaf_s1', 'leaf_s2', 'leaf_s3', 'petal_pink'];
  function decoHTML(layer) {
    const set = decoSet(); if (!set) return '';
    let h = '';
    const put = (it) => {
      const src = set[it.k]; if (!src) return;
      h += `<div class="dk" style="left:${it.x}%;top:${it.y}%;width:calc(var(--u)*${it.w});${it.op != null ? 'opacity:' + it.op + ';' : ''}${it.wa ? 'animation:' + it.wa + ';' : ''}${it.ws || ''}"><img src="${src}" alt="" draggable="false" style="${it.ia ? 'animation:' + it.ia + ';' : ''}${it.o ? 'transform-origin:' + it.o + ';' : ''}${it.v || ''}"></div>`;
    };
    SPEC.filter(i => i.l === layer).forEach(put);
    if (layer === 'f') {
      for (let i = 0; i < 9; i++) put({ k: LEAF[i], x: 6 + (i * 10.5 + Math.random() * 6) % 90, y: 0, w: 5.5 + Math.random() * 3.5, wa: `dkFall ${(10 + Math.random() * 6).toFixed(1)}s linear ${(-Math.random() * 14).toFixed(1)}s infinite`, ws: `--dx:${Math.round(-30 + Math.random() * 60)}px;`, ia: `dkFlut ${(2.2 + Math.random() * 2).toFixed(1)}s ease-in-out infinite` });
      for (let i = 0; i < 8; i++) put({ k: SPK[i % 5], x: 10 + Math.random() * 80, y: 10 + Math.random() * 78, w: 2.6 + Math.random() * 3.2, ia: `dkTw ${(2.6 + Math.random() * 2.6).toFixed(1)}s ease-in-out ${(-Math.random() * 5).toFixed(1)}s infinite` });
    }
    return `<div class="dk-l">${h}</div>`;
  }
  const RO = (typeof ResizeObserver !== 'undefined') ? new ResizeObserver(es => es.forEach(e => { const t = e.target; t.style.setProperty('--u', (e.contentRect.height / 100) + 'px'); t.style.setProperty('--sw', e.contentRect.width + 'px'); })) : null;
  function sizeVars(stg) { const r = stg.getBoundingClientRect(); stg.style.setProperty('--u', ((r.height || 300) / 100) + 'px'); stg.style.setProperty('--sw', (r.width || 360) + 'px'); if (RO && !stg._ro) { stg._ro = 1; RO.observe(stg); } }
  function mountStage(stg, src) {
    if (!stg) return;
    if (!src) { stg.innerHTML = ''; stg._w = null; stg._src = ''; return; }
    const dk = decoSet() ? 'd' : 'n';
    if (stg._dk && stg._dk !== dk) { stg._w = null; stg._src = ''; stg.innerHTML = ''; }
    stg._dk = dk; sizeVars(stg);
    if (stg._src === src && (stg._w || stg.firstChild)) return;
    if (!stg._w && GLOK && !stg.querySelector('.lkw')) {
      stg.innerHTML = `${decoHTML('b')}<div class="lkf"><i class="lk-mist"></i><i class="lk-mist b"></i><i class="lk-sh"></i><div class="lkw"></div>${sparks()}</div>${decoHTML('f')}`;
      const host = stg.querySelector('.lkw'); host._stg = stg; stg._w = makeWarp(host);
      if (!stg._w) { stg.innerHTML = ''; }
    }
    if (stg._w) { stg._w.setImage(src); stg._src = src; }
    else { stg.innerHTML = decoHTML('b') + figure(src) + decoHTML('f'); stg._src = src; }
  }
  /* ---------- 洞府立繪 ---------- */
  let sig = '';
  function hasNew() { init(); return state.wardrobe.some(id => !state.lookSeen.includes(id)); }
  function renderBanner() {
    const ban = document.querySelector('#tab-abode>div:first-child'); if (!ban) return;
    let stg = $('lk-stage14');
    if (!stg) {
      stg = document.createElement('div'); stg.id = 'lk-stage14'; stg.className = 'lk-stage';
      const bd = document.createElement('button'); bd.id = 'btn-look14'; bd.className = 'lk-chip tap-effect'; bd.dataset.l14 = 'open';
      ban.appendChild(stg); ban.appendChild(bd);
    }
    const src = curImg(), s = [state.gender, state.look, !!src].join('|');
    if (s !== sig) { sig = s; mountStage(stg, src); }
    const bd = $('btn-look14'); if (bd) { const h = '👘 更衣' + (hasNew() ? '<i class="rd14"></i>' : ''); if (bd.dataset.h !== h) { bd.dataset.h = h; bd.innerHTML = h; } }
  }
  /* ---------- 解鎖檢查 ---------- */
  function check() {
    init(); let got = null;
    OUT.forEach(o => { if (!state.wardrobe.includes(o.id) && avail(o.id) && o.cond(state)) { state.wardrobe.push(o.id); got = o; } });
    if (got) { try { showToast('👘 獲得新外觀:' + got.name); } catch (e) { } saveGame(); }
  }
  /* ---------- 擇定道體 ---------- */
  let pick = null;
  function showGender() {
    if ($('modal-gender14')) return;
    pick = null;
    const d = document.createElement('div'); d.id = 'modal-gender14'; d.className = 'gd14';
    const card = g => `<div class="gd14-cd" data-l14="gp" data-g="${g}"><div class="im"><img src="${art(g, 'o1') || ''}" alt="" draggable="false"></div><b>${GN[g]}</b></div>`;
    d.innerHTML = `<h2>道號與道體</h2><p>踏入仙途之前,先為自己取一個道號,再擇定道體。<br>道號會出現在故事裡,日後可點標題列的 ✎ 修改。道體不影響資質,只決定外觀與立繪,一經擇定,輪迴之前不可更改。</p><div class="gd14-row">${card('m')}${card('f')}</div><div class="gd14-nm"><label for="gd14-name">道號</label><input id="gd14-name" maxlength="8" placeholder="為自己取個道號(最多 8 字)" autocomplete="off" autocapitalize="off" spellcheck="false" value="${cleanName(state.name)}"></div><button class="gd14-ok" data-l14="gok" disabled>踏入仙途</button>`;
    document.body.appendChild(d); gdSync();
    return;
    document.body.appendChild(d);
  }
  const cleanName = v => String(v || '').replace(/[<>&"'`\\]/g, '').replace(/\s+/g, '').slice(0, 8);
  function gdSync() {
    const d = $('modal-gender14'); if (!d) return; const inp = d.querySelector('#gd14-name');
    d.querySelector('.gd14-ok').disabled = !(pick && inp && cleanName(inp.value));
  }
  document.addEventListener('input', e => { if (e.target && e.target.id === 'gd14-name') gdSync(); });
  function onPick(g) {
    pick = g; const d = $('modal-gender14'); if (!d) return;
    d.querySelectorAll('.gd14-cd').forEach(c => c.classList.toggle('on', c.dataset.g === g));
    gdSync();
  }
  function onOk() {
    if (!pick) return; const inp = $('gd14-name'), nm = cleanName(inp && inp.value);
    if (!nm) { try { showToast('請先為自己取個道號。'); } catch (er) { } if (inp) inp.focus(); return; }
    init(); state.name = nm; state.gender = pick; if (!art(pick, state.look)) state.look = 'o1';
    applySprites(); saveGame(); const d = $('modal-gender14'); if (d) d.remove(); sig = ''; renderBanner();
    try { showToast('道號「' + nm + '」・道體已定:' + GN[pick]); } catch (e) { } try { updateTopBar(); } catch (e) { }
  }
  /* ---------- 更衣彈窗 ---------- */
  let sel = null;
  function ensureModal() {
    let m = $('modal-look14');
    if (!m) {
      m = document.createElement('div'); m.id = 'modal-look14'; m.className = 'lk14-ov lk14-hide';
      m.innerHTML = '<div class="lk14-pn"><div class="lk14-hd"><span>更衣 · 形象</span><button data-l14="close" aria-label="關閉">✕</button></div><div class="lk14-pv"><div class="lk-stage" id="lk14-pvs"></div><div id="lk14-ovl" class="lk14-ovl lk14-hide"></div></div><div id="lk14-dyn"></div></div>';
      document.body.appendChild(m);
    }
    return m;
  }
  function openLook() {
    init(); check(); sel = state.look; const m = ensureModal();
    m.classList.remove('lk14-hide'); state.lookSeen = state.wardrobe.slice(); renderLook(); renderBanner();
  }
  function closeLook() { const m = $('modal-look14'); if (m) m.classList.add('lk14-hide'); }
  const lockG14 = () => !!(state.story27 && state.story27.seen && state.story27.seen['1.1']);
  function renderLook() {
    const m = ensureModal(); init();
    const g = state.gender || 'm', o = OBY[sel] || OUT[0], own = state.wardrobe.includes(o.id), a = art(g, o.id);
    const cards = OUT.filter(x => avail(x.id)).map(x => {
      const has = state.wardrobe.includes(x.id), im = art(g, x.id), on = state.look === x.id;
      const th = im ? `<div class="lk14-th" style="background-image:url('${im}')"></div>` : `<div class="lk14-th">${avail(x.id) ? '本性別待繪' : '繪製中'}</div>`;
      return `<div class="lk14-cd ${has ? '' : 'lk'} ${sel === x.id ? 'sel' : ''}" data-l14="sel" data-id="${x.id}" style="border-color:${has ? x.col : '#334155'}">${on ? '<span class="b">已穿</span>' : (has ? '' : '<span class="b">鎖</span>')}${th}<div class="n" style="color:${has ? x.col : '#94a3b8'}">${x.name}</div><div class="s">${has ? '已解鎖' : x.tip}</div></div>`;
    }).join('');
    let btn;
    if (state.look === o.id) btn = '<button class="lk14-eq" disabled>穿戴中</button>';
    else if (!own) btn = `<button class="lk14-eq" disabled>${avail(o.id) ? '解鎖條件:' + o.tip : '外觀繪製中,敬請期待'}</button>`;
    else if (!a) btn = '<button class="lk14-eq" disabled>此道體尚無該外觀</button>';
    else btn = '<button class="lk14-eq" data-l14="equip">穿戴</button>';
    const stg = $('lk14-pvs'), ov = $('lk14-ovl');
    mountStage(stg, a || curImg()); stg.style.opacity = a ? '1' : '.28'; stg.style.filter = a ? '' : 'grayscale(.7)';
    ov.classList.toggle('lk14-hide', !!a); ov.textContent = avail(o.id) ? '此道體尚無該外觀' : '外觀繪製中 · 敬請期待';
    $('lk14-dyn').innerHTML = `<div class="lk14-nm" style="color:${o.col}">${o.name}<span style="color:#94a3b8;font-weight:600;font-size:13px"> · ${o.sub}</span></div><div class="lk14-sc">${own ? '已解鎖' : '解鎖條件:' + o.tip}</div><div class="lk14-gd" ${lockG14() ? 'style="opacity:.55"' : ''}><span>道體</span><button class="${g === 'm' ? 'on' : ''}" data-l14="g" data-g="m">男修</button><button class="${g === 'f' ? 'on' : ''}" data-l14="g" data-g="f">女修</button></div>${lockG14() ? '<div class="lk14-tp" style="margin:-4px 0 6px">道體已隨這一世的故事定下,輪迴後可重擇。</div>' : ''}<div class="lk14-grid">${cards}</div>${btn}`;
  }
  /* ---------- 事件 ---------- */
  document.addEventListener('click', e => {
    const t = e.target.closest && e.target.closest('[data-l14]'); if (t) {
      const a = t.dataset.l14;
      if (a === 'open') openLook();
      else if (a === 'close') closeLook();
      else if (a === 'sel') { sel = t.dataset.id; renderLook(); }
      else if (a === 'g') { if (lockG14()) { try { showToast('道體已隨這一世的故事定下,輪迴之後方可重擇。'); } catch (er) { } return; } if (state.gender !== t.dataset.g) { state.gender = t.dataset.g; if (!art(state.gender, state.look)) state.look = 'o1'; if (!art(state.gender, sel)) sel = state.look; applySprites(); saveGame(); sig = ''; renderBanner(); } renderLook(); }
      else if (a === 'equip') { if (state.wardrobe.includes(sel) && art(state.gender || 'm', sel)) { state.look = sel; saveGame(); sig = ''; renderBanner(); renderLook(); try { showToast('已更換外觀:' + OBY[sel].name); } catch (er) { } } }
      else if (a === 'gp') onPick(t.dataset.g);
      else if (a === 'gok') onOk();
      return;
    }
    if (e.target && e.target.id === 'modal-look14') closeLook();
  });
  /* ---------- 啟動與輪詢 ---------- */
  function tick() {
    init();
    if (!state.gender) { if (!$('modal-gender14')) showGender(); }
    else if (appliedG !== state.gender) applySprites();
    check(); renderBanner();
  }
  applySprites();
  setTimeout(tick, 500); setInterval(tick, 1500);
  window.LOOK14 = { open: openLook, close: closeLook, check, render: renderBanner, OUT, insts, calcWeights, GX, GY };
})();


