/* ===== v192 神通命中特效與持續狀態(全程式繪製,一般歷練與重要戰鬥共用) =====
   SX192.hit(h, 神通id, fx鍵, {i,n,crit})   h='n' 一般歷練舞台(#bs-m) / 'b' 重要戰鬥(#bf-ei)
   SX192.sync(h, {dot,stun})                 持續狀態:dot=burn|ghost|poison  stun=freeze|dizzy|bind
   SX192.tick(h, 神通id)                      灼燒/中毒每回合跳字時的火苗/氣泡
   效果疊在敵人圖上:每次依敵人圖目前位置貼齊(rAF 追蹤),不改動原本的敵人圖與動畫。 */
(function () {
  const $ = id => document.getElementById(id), R = (a, b) => a + Math.random() * (b - a);
  const CSS = `
.sx-L{position:absolute;left:0;top:0;right:0;bottom:0;pointer-events:none;z-index:7;overflow:visible}
.sx-a{position:absolute;pointer-events:none;overflow:visible}
.sx-s,.sx-sd,.sx-ss{position:absolute;left:0;top:0;width:100%;height:100%;overflow:visible}
.sx-e{position:absolute;pointer-events:none}.sx-e svg{display:block;width:100%;height:100%;overflow:visible}
.sx-glow{left:50%;top:50%;width:150%;height:150%;margin:-75% 0 0 -75%;border-radius:50%;background:radial-gradient(circle,#fff 0,var(--c) 30%,transparent 68%);mix-blend-mode:screen;animation:sxGlow calc(.55s*var(--sxd,1)) ease-out forwards}
@keyframes sxGlow{from{transform:scale(.25);opacity:1}to{transform:scale(var(--s,1.15));opacity:0}}
.sx-sf{position:absolute;left:0;top:0;right:0;bottom:0;background:var(--c);mix-blend-mode:screen;animation:sxSf calc(.34s*var(--sxd,1)) ease-out forwards}
@keyframes sxSf{from{opacity:.45}to{opacity:0}}
.sx-sp{left:50%;top:50%;width:5px;height:5px;margin:-2px;border-radius:50%;background:var(--c);box-shadow:0 0 7px var(--c);animation:sxSp calc(.7s*var(--sxd,1)) cubic-bezier(.1,.7,.4,1) forwards}
@keyframes sxSp{to{transform:translate(var(--dx),var(--dy));opacity:0}}
.sx-in{left:50%;top:50%;width:5px;height:5px;margin:-2px;border-radius:50%;background:var(--c);box-shadow:0 0 7px var(--c);animation:sxIn calc(.6s*var(--sxd,1)) ease-in forwards}
@keyframes sxIn{from{transform:translate(var(--dx),var(--dy));opacity:0}30%{opacity:1}to{transform:translate(0,0);opacity:0}}
.sx-rise{width:27%;height:44%;transform-origin:50% 100%;animation:sxRise calc(.8s*var(--sxd,1)) ease-out forwards;opacity:0}
@keyframes sxRise{0%{transform:translateY(8%) scale(.4);opacity:0}18%{opacity:1}100%{transform:translateY(-70%) scale(calc(var(--s,1)*1.25),calc(var(--s,1)*1.5));opacity:0}}
.sx-ring{left:50%;bottom:-4%;width:130%;height:36%;margin-left:-65%;border:3px solid var(--c);border-radius:50%;box-shadow:0 0 10px var(--c),inset 0 0 8px var(--c);animation:sxRing calc(.6s*var(--sxd,1)) ease-out forwards}
@keyframes sxRing{from{transform:scale(.2);opacity:1}to{transform:scale(1.35);opacity:0}}
.sx-star{left:50%;top:50%;width:120%;aspect-ratio:1;margin:-60% 0 0 -60%;animation:sxStar calc(.6s*var(--sxd,1)) ease-out forwards;filter:drop-shadow(0 0 5px #7dd3fc)}
@keyframes sxStar{from{transform:scale(.2) rotate(-30deg);opacity:1}60%{opacity:1}to{transform:scale(1.15) rotate(30deg);opacity:0}}
.sx-sh{left:50%;top:50%;width:9%;height:22%;margin:-11% 0 0 -4.5%;animation:sxSh calc(.75s*var(--sxd,1)) cubic-bezier(.1,.7,.4,1) forwards;filter:drop-shadow(0 0 3px #bae6fd)}
@keyframes sxSh{from{transform:translate(0,0) rotate(var(--r0,0deg));opacity:1}to{transform:translate(var(--dx),var(--dy)) rotate(var(--r));opacity:0}}
.sx-spk{width:10%;height:62%;bottom:-6%;transform-origin:50% 100%;animation:sxSpk calc(1s*var(--sxd,1)) ease-out forwards;filter:drop-shadow(0 0 4px #7dd3fc)}
@keyframes sxSpk{0%{transform:scaleY(0)}22%{transform:scaleY(1)}75%{transform:scaleY(1);opacity:1}100%{transform:scaleY(1.04);opacity:0}}
.sx-bolt{bottom:35%;height:270%;transform-origin:50% 100%;animation:sxBolt calc(.5s*var(--sxd,1)) linear forwards;filter:drop-shadow(0 0 6px #60a5fa)}
@keyframes sxBolt{0%{opacity:0}6%{opacity:1}18%{opacity:.3}30%{opacity:1}100%{opacity:0}}
.sx-arc{width:30%;height:30%;animation:sxArc calc(.5s*var(--sxd,1)) steps(2,end) forwards;filter:drop-shadow(0 0 3px #93c5fd)}
@keyframes sxArc{0%{opacity:1}40%{opacity:.2}60%{opacity:1}100%{opacity:0}}
.sx-sword{width:12%;height:52%;bottom:18%;transform-origin:50% 100%;animation:sxDrop calc(.75s*var(--sxd,1)) forwards;filter:drop-shadow(0 0 4px #e0f2fe)}
@keyframes sxDrop{0%{transform:translateY(-340%) rotate(var(--r,0deg));opacity:0}16%{opacity:1}32%{transform:translateY(0) rotate(var(--r,0deg))}78%{transform:translateY(0) rotate(var(--r,0deg));opacity:1}100%{transform:translateY(2%) rotate(var(--r,0deg));opacity:0}}
.sx-bs{left:50%;width:64%;height:215%;margin-left:-32%;bottom:10%;transform-origin:50% 100%;animation:sxBig calc(.95s*var(--sxd,1)) forwards;filter:drop-shadow(0 0 10px #fde68a) drop-shadow(0 0 4px #fff)}
@keyframes sxBig{0%{transform:translateY(-130%) scale(.85);opacity:0}14%{opacity:1}30%{transform:translateY(0) scale(1)}78%{transform:translateY(0);opacity:1}100%{transform:translateY(3%);opacity:0}}
.sx-crack{left:-30%;width:160%;bottom:-10%;height:38%}
.sx-crack polyline{stroke-dasharray:200;stroke-dashoffset:200;animation:sxDraw calc(.3s*var(--sxd,1)) ease-out forwards}
.sx-crack{animation:sxFadeL calc(1s*var(--sxd,1)) forwards}
@keyframes sxDraw{to{stroke-dashoffset:0}}
@keyframes sxFadeL{0%,70%{opacity:1}100%{opacity:0}}
.sx-rock{width:9%;height:11%;left:var(--x);bottom:6%;animation:sxRock calc(.85s*var(--sxd,1)) cubic-bezier(.3,.6,.5,1) forwards}
@keyframes sxRock{0%{transform:translate(0,0) rotate(0);opacity:1}42%{transform:translate(calc(var(--dx)*.6),var(--up)) rotate(120deg)}100%{transform:translate(var(--dx),30%) rotate(260deg);opacity:0}}
.sx-dust{width:46%;height:30%;left:var(--x);bottom:-6%;border-radius:50%;background:radial-gradient(circle,rgba(214,190,150,.8),rgba(160,130,90,0) 70%);animation:sxDust calc(.9s*var(--sxd,1)) ease-out forwards}
@keyframes sxDust{from{transform:scale(.3);opacity:.9}to{transform:scale(1.5) translateY(-30%);opacity:0}}
.sx-vort{left:50%;top:50%;width:150%;aspect-ratio:1;margin:-75% 0 0 -75%;border-radius:50%;background:radial-gradient(circle,#000 0,#000 18%,#4c1d95 40%,transparent 70%),conic-gradient(from 0deg,transparent,#a78bfa,transparent,#7c3aed,transparent,#c4b5fd,transparent);-webkit-mask:radial-gradient(circle,#000 30%,transparent 70%);mask:radial-gradient(circle,#000 30%,transparent 70%);animation:sxVort calc(.85s*var(--sxd,1)) ease-in-out forwards}
@keyframes sxVort{0%{transform:scale(1.9) rotate(0);opacity:0}25%{opacity:1}100%{transform:scale(.25) rotate(540deg);opacity:0}}
.sx-slash{left:-10%;top:-5%;width:120%;height:110%}
.sx-slash path{stroke-dasharray:100;stroke-dashoffset:100;animation:sxDraw2 calc(.22s*var(--sxd,1)) ease-out forwards}
.sx-slash{animation:sxFadeS calc(.55s*var(--sxd,1)) forwards}
@keyframes sxDraw2{to{stroke-dashoffset:0}}
@keyframes sxFadeS{0%,55%{opacity:1}100%{opacity:0}}
.sx-drop{left:50%;top:45%;width:6px;height:9px;margin:-4px;border-radius:50% 50% 50% 50%/60% 60% 40% 40%;background:#dc2626;animation:sxDrp calc(.8s*var(--sxd,1)) ease-in forwards}
@keyframes sxDrp{0%{transform:translate(0,0);opacity:1}45%{transform:translate(calc(var(--dx)*.7),var(--up))}100%{transform:translate(var(--dx),70%);opacity:0}}
.sx-orb{left:40%;top:40%;width:9px;height:9px;border-radius:50%;background:radial-gradient(circle,#fecaca,#dc2626);box-shadow:0 0 8px #ef4444;animation:sxOrb calc(.8s*var(--sxd,1)) ease-in forwards}
@keyframes sxOrb{from{transform:translate(0,0);opacity:1}to{transform:translate(-230%,70%);opacity:0}}
.sx-cloud{width:50%;height:42%;left:var(--x);top:var(--y);border-radius:50%;background:radial-gradient(circle,#bef264,#16a34a 55%,transparent 72%);filter:blur(2px);animation:sxCloud calc(.9s*var(--sxd,1)) ease-out forwards}
@keyframes sxCloud{from{transform:scale(.3);opacity:.9}to{transform:scale(1.4);opacity:0}}
.sx-bub{width:var(--z);aspect-ratio:1;left:var(--x);bottom:var(--b,10%);border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff,#a3e635 40%,#15803d);opacity:.85;animation:sxBub calc(var(--t,1.1s)*var(--sxd,1)) ease-out forwards}
@keyframes sxBub{from{transform:translateY(0) scale(.5);opacity:.95}to{transform:translateY(-130%) scale(1.1);opacity:0}}
.sx-form{left:50%;top:50%;width:175%;aspect-ratio:1;margin:-87% 0 0 -87%;animation:sxForm calc(.95s*var(--sxd,1)) ease-out forwards;filter:drop-shadow(0 0 6px #fde68a)}
@keyframes sxForm{0%{transform:scale(.3) rotate(-120deg);opacity:0}25%{opacity:1}75%{opacity:1}100%{transform:scale(1.1) rotate(0);opacity:0}}
.sx-fist{left:50%;top:44%;width:42%;aspect-ratio:1;margin:-21% 0 0 -21%;border-radius:50%;background:radial-gradient(circle,#fff,#fde68a 35%,rgba(251,191,36,0) 70%);animation:sxGlow calc(.4s*var(--sxd,1)) ease-out forwards;--s:1.9}
/* 持續狀態 */
.sx-sil{left:0;top:0;width:100%;height:100%;background:var(--c);-webkit-mask-size:100% 100%;mask-size:100% 100%;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat}
.sx-sil.sx-flash{animation:sxSilF calc(.55s*var(--sxd,1)) ease-out forwards}
@keyframes sxSilF{0%{opacity:0}18%{opacity:1}100%{opacity:0}}
.sx-sil.sx-pul{animation:sxSilP 1.3s ease-in-out infinite alternate}
@keyframes sxSilP{from{opacity:.55}to{opacity:1}}
.sx-fring{left:-14%;top:30%;width:128%;height:34%;border-radius:50%;border:3px solid var(--c);box-shadow:0 0 9px var(--c),inset 0 0 7px var(--c);opacity:0;animation:sxFR calc(.6s*var(--sxd,1)) ease-out forwards}
@keyframes sxFR{0%{transform:translateY(95%) scale(.7);opacity:0}20%{opacity:1}100%{transform:translateY(-120%) scale(1.05);opacity:0}}
.sx-frow{left:-8%;width:116%;bottom:-3%;height:62%;transform-origin:50% 100%;animation:sxRow calc(.8s*var(--sxd,1)) ease-out forwards}
@keyframes sxRow{0%{transform:scaleY(.05);opacity:0}25%{transform:scaleY(1);opacity:1}65%{transform:scaleY(1.06,1.12);opacity:1}100%{transform:scaleY(.7);opacity:0}}
.sx-bg{left:-5%;top:78%;width:110%;height:30%;border-radius:50%;background:radial-gradient(ellipse at 50% 50%,var(--c),transparent 70%);mix-blend-mode:screen;animation:sxBg 1s ease-in-out infinite alternate}
@keyframes sxBg{from{opacity:.35}to{opacity:.8}}
.sx-fl{width:15%;height:19%;bottom:-3%;left:var(--x);transform-origin:50% 100%;animation:sxFlick calc(var(--t,.5s)*1) ease-in-out infinite alternate;animation-delay:var(--d,0s)}
@keyframes sxFlick{from{transform:scale(.97,.95) skewX(-1.2deg)}to{transform:scale(1.02,1.05) skewX(1.2deg)}}
.sx-em{width:4px;height:4px;border-radius:50%;background:var(--c);box-shadow:0 0 6px var(--c);left:var(--x);bottom:6%;animation:sxEm var(--t,1.4s) ease-out infinite;animation-delay:var(--d,0s)}
@keyframes sxEm{from{transform:translateY(0);opacity:0}15%{opacity:1}to{transform:translateY(-34px);opacity:0}}
.sx-tint{left:-6%;top:-4%;width:112%;height:108%;border-radius:36%;background:rgba(125,211,252,.26);mix-blend-mode:screen}
.sx-ice{left:-12%;top:-10%;width:124%;height:114%;transform-origin:50% 100%;animation:sxIceIn calc(.3s*var(--sxd,1)) cubic-bezier(.2,1.4,.4,1) both;filter:drop-shadow(0 0 7px #7dd3fc)}
@keyframes sxIceIn{from{transform:scale(.5);opacity:0}to{transform:scale(1);opacity:1}}
.sx-tw{width:12px;height:12px;left:var(--x);top:var(--y);background:#fff;clip-path:polygon(50% 0,60% 40%,100% 50%,60% 60%,50% 100%,40% 60%,0 50%,40% 40%);animation:sxTw 1.1s ease-in-out infinite;animation-delay:var(--d,0s)}
@keyframes sxTw{0%,100%{transform:scale(.2);opacity:0}50%{transform:scale(1);opacity:1}}
.sx-dz{left:50%;top:-4%;width:0;height:0}
.sx-dz i{position:absolute;left:-9px;top:-9px;width:18px;height:18px;background:#fde047;clip-path:polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%);filter:drop-shadow(0 0 3px #f59e0b);animation:sxOrbit 1.3s linear infinite;animation-delay:var(--d)}
@keyframes sxOrbit{from{transform:rotate(0) translateX(38px) scaleY(.5) rotate(0)}to{transform:rotate(360deg) translateX(38px) scaleY(.5) rotate(-360deg)}}
.sx-bd i{position:absolute;left:-10%;width:120%;height:22%;border:3px dashed #c4b5fd;border-radius:50%;box-shadow:0 0 9px #a78bfa,inset 0 0 6px #a78bfa;top:var(--y);animation:sxBd 1.5s ease-in-out infinite alternate;animation-delay:var(--d)}
@keyframes sxBd{from{transform:translateY(-14%) rotate(-8deg);opacity:.6}to{transform:translateY(14%) rotate(8deg);opacity:1}}
.sx-out{animation:sxOut .25s forwards!important}@keyframes sxOut{to{opacity:0}}
`;
  const DEFS = `<svg id="sx-defs" width="0" height="0" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true"><defs>
<linearGradient id="sxF" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#dc2626"/><stop offset=".45" stop-color="#f97316"/><stop offset="1" stop-color="#f59e0b"/></linearGradient>
<linearGradient id="sxG" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#1e3a8a"/><stop offset=".45" stop-color="#2563eb"/><stop offset="1" stop-color="#22d3ee"/></linearGradient>
<linearGradient id="sxI" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f0f9ff"/><stop offset=".5" stop-color="#7dd3fc"/><stop offset="1" stop-color="#38bdf8"/></linearGradient>
<linearGradient id="sxIb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e0f2fe" stop-opacity=".4"/><stop offset="1" stop-color="#38bdf8" stop-opacity=".2"/></linearGradient>
<linearGradient id="sxS" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#bae6fd" stop-opacity="0"/><stop offset=".5" stop-color="#fff"/><stop offset="1" stop-color="#e0f2fe" stop-opacity=".2"/></linearGradient>
<linearGradient id="sxR" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7f1d1d" stop-opacity="0"/><stop offset=".55" stop-color="#ef4444"/><stop offset="1" stop-color="#fecaca"/></linearGradient>
<linearGradient id="sxW" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#94a3b8"/><stop offset=".5" stop-color="#f8fafc"/><stop offset="1" stop-color="#94a3b8"/></linearGradient>
</defs></svg>`;
  const FP = 'M20 1C21 13 35 19 35 36 35 50 28 58 20 58 12 58 5 50 5 36 5 27 11 25 14 13 16 17 19 11 20 1Z';
  const flame = g => `<svg viewBox="0 0 40 60"><path d="${FP}" fill="url(#${g})"/></svg>`;
  /* 一排參差尖銳的火舌(中間高、兩側低,內有鏤空縫),每次形狀略有不同 */
  function flameRow(g) {
    const n = 7, W = 100 / n; let d = '';
    for (let k = 0; k < n; k++) {
      const c = (k + .5) * W, mid = 1 - Math.abs(k - (n - 1) / 2) / ((n - 1) / 2) * .55, h = (88 * mid) * R(.78, 1.05), w = W * R(1.5, 1.9), l = R(-W * .45, W * .45);
      d += `M${(c - w / 2).toFixed(1)} 100Q${(c - w * .5).toFixed(1)} ${(100 - h * .5).toFixed(1)} ${(c + l).toFixed(1)} ${(100 - h).toFixed(1)}Q${(c + w * .1 + l * .3).toFixed(1)} ${(100 - h * .45).toFixed(1)} ${(c + w / 2).toFixed(1)} 100Z`;
      d += `M${(c - w * .16).toFixed(1)} 97Q${(c - w * .2).toFixed(1)} ${(100 - h * .35).toFixed(1)} ${(c + l * .6).toFixed(1)} ${(100 - h * .62).toFixed(1)}Q${(c + w * .06).toFixed(1)} ${(100 - h * .3).toFixed(1)} ${(c + w * .16).toFixed(1)} 97Z`;
    }
    return `<svg viewBox="0 0 100 100" preserveAspectRatio="none"><path d="${d}" fill="url(#${g})" fill-rule="evenodd"/></svg>`;
  }
  const STAR = `<svg viewBox="-50 -50 100 100"><path d="M0-46V46M-40-23L40 23M-40 23L40-23" stroke="#e0f2fe" stroke-width="5" stroke-linecap="round" fill="none"/><circle r="8" fill="#fff"/></svg>`;
  const SHARD = `<svg viewBox="0 0 20 44"><polygon points="10,0 20,36 10,44 0,36" fill="url(#sxI)" stroke="#fff" stroke-width="1.5"/></svg>`;
  const SWORD = `<svg viewBox="0 0 16 80"><polygon points="8,80 3,24 13,24" fill="url(#sxW)" stroke="#94a3b8" stroke-width=".8"/><rect x="0" y="20" width="16" height="4" rx="1" fill="#fbbf24"/><rect x="6" y="5" width="4" height="15" fill="#78350f"/><circle cx="8" cy="3.5" r="3" fill="#fbbf24"/></svg>`;
  const ROCK = `<svg viewBox="0 0 20 20"><polygon points="3,16 6,5 13,2 18,10 15,18" fill="#78716c" stroke="#44403c" stroke-width="1.5"/></svg>`;
  const pl = p => p.map(a => a[0].toFixed(1) + ',' + a[1].toFixed(1)).join(' ');
  function boltPts() { const p = [[50, 0]]; let x = 50; for (let y = 9; y < 98; y += R(7, 12)) { x = Math.max(18, Math.min(82, x + R(-15, 15))); p.push([x, y]); } p.push([50 + R(-5, 5), 100]); return p; }
  function boltSvg(thick) {
    const p = boltPts(), k = Math.floor(p.length / 2), b = [p[k]]; let bx = p[k][0], by = p[k][1]; const dir = Math.random() < .5 ? -1 : 1;
    for (let j = 0; j < 3; j++) { bx = Math.max(4, Math.min(96, bx + dir * R(8, 16))); by += R(7, 12); b.push([bx, by]); }
    const s = (pts, w, c, o) => `<polyline points="${pl(pts)}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke" opacity="${o}"/>`;
    const t = thick || 1;
    return `<svg viewBox="0 0 100 100" preserveAspectRatio="none">${s(p, 13 * t, '#60a5fa', .3)}${s(p, 7 * t, '#93c5fd', .75)}${s(p, 2.6 * t, '#fff', 1)}${s(b, 5 * t, '#93c5fd', .6)}${s(b, 1.8 * t, '#fff', 1)}</svg>`;
  }
  function arcSvg() { const p = []; let x = 0, y = R(8, 22); for (let k = 0; k < 6; k++) { p.push([x, y]); x += 5; y = R(4, 26); } return `<svg viewBox="0 0 30 30"><polyline points="${pl(p)}" fill="none" stroke="#e0f2fe" stroke-width="1.6" stroke-linejoin="round"/></svg>`; }
  function crackSvg() {
    let h = ''; for (let k = 0; k < 4; k++) { const p = [[50, 2]]; let x = 50, y = 2; const dir = [-1.5, -.5, .5, 1.5][k]; for (let j = 0; j < 5; j++) { x += dir * R(6, 11); y = Math.min(34, y + R(4, 8)); p.push([x, y]); } h += `<polyline points="${pl(p)}" pathLength="200" fill="none" stroke="#3b1d08" stroke-width="3.4" stroke-linejoin="round" vector-effect="non-scaling-stroke"/><polyline points="${pl(p)}" pathLength="200" fill="none" stroke="#fbbf24" stroke-width="1.2" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>`; }
    return `<svg viewBox="0 0 100 40" preserveAspectRatio="none">${h}</svg>`;
  }
  function pentagram(c) { const v = []; for (let k = 0; k < 5; k++) { const a = (-90 + 72 * k) * Math.PI / 180; v.push([Math.cos(a) * 36, Math.sin(a) * 36]); } const o = [0, 2, 4, 1, 3, 0].map(k => v[k]); const dots = ['#f8fafc', '#4ade80', '#38bdf8', '#fb923c', '#fbbf24']; return `<svg viewBox="-50 -50 100 100"><circle r="44" fill="none" stroke="#fde68a" stroke-width="2" stroke-dasharray="6 4"/><circle r="30" fill="rgba(253,230,138,.14)" stroke="#fde68a" stroke-width="1"/><polyline points="${pl(o)}" fill="none" stroke="#fde68a" stroke-width="2.2" stroke-linejoin="round"/>${v.map((q, k) => `<circle cx="${q[0].toFixed(1)}" cy="${q[1].toFixed(1)}" r="6" fill="${dots[k]}" stroke="#fff" stroke-width="1.2"/>`).join('')}</svg>`; }

  /* ---------- 版面:效果層貼齊敵人圖 ---------- */
  const hostOf = h => h === 'n' ? $('bs-fx') : $('bf-stg');
  function rectOf(h) {
    if (h === 'b') {
      const e = $('bf-ei'); if (!e) return null; const r = e.getBoundingClientRect(); let w = r.width, hh = r.height; const nw = e.naturalWidth, nh = e.naturalHeight;
      if (nw && nh) { const k = Math.min(r.width / nw, r.height / nh); w = nw * k; hh = nh * k; }
      return { l: r.left + (r.width - w) / 2, t: r.top + r.height - hh, w, h: hh };
    }
    const m = $('bs-m'); if (!m) return null; const s = m.querySelector('img.bs-mi') || m.querySelector('.bs-memo') || m, r = s.getBoundingClientRect();
    return { l: r.left, t: r.top, w: r.width, h: r.height };
  }
  const busy = a => a.children.length > 2 || a._sd.children.length > 0 || a._ss.children.length > 0;
  function place(a) {
    const r = rectOf(a._h), L = a.parentNode; if (!r || !L || !r.w) return; const hr = L.getBoundingClientRect();
    a.style.left = (r.l - hr.left) + 'px'; a.style.top = (r.t - hr.top) + 'px'; a.style.width = r.w + 'px'; a.style.height = r.h + 'px';
  }
  function loop(a) { if (a._raf) return; const f = () => { a._raf = 0; if (!a.isConnected) return; place(a); if (busy(a)) a._raf = requestAnimationFrame(f); }; a._raf = requestAnimationFrame(f); }
  const spd = h => h === 'n' ? Math.max(.5, (window.state && state.battleSpeed) || 1) : 1;
  function anchor(h) {
    const host = hostOf(h); if (!host) return null;
    let L = host.querySelector(':scope > .sx-L'); if (!L) { L = document.createElement('div'); L.className = 'sx-L'; host.appendChild(L); }
    L.style.setProperty('--sxd', 1 / spd(h));
    let a = L.querySelector(':scope > .sx-a');
    if (!a) {
      a = document.createElement('div'); a.className = 'sx-a'; a._h = h; a._st = { dot: null, stun: null };
      a._sd = document.createElement('div'); a._sd.className = 'sx-sd'; a._ss = document.createElement('div'); a._ss.className = 'sx-ss';
      a.appendChild(a._sd); a.appendChild(a._ss); L.appendChild(a);
    }
    place(a); loop(a); return a;
  }
  function E(a, html, cls, st, life, par) {
    const d = document.createElement('div'); d.className = 'sx-e ' + cls; if (st) d.style.cssText = st; d.innerHTML = html; (par || a).appendChild(d);
    setTimeout(() => { try { d.remove(); } catch (e) { } }, life / spd(a._h)); return d;
  }
  /* 依敵人圖輪廓套一層半透明顏色(剪影);鏡像的敵人圖同步鏡像 */
  function sil(a, col, cls, ms) {
    const el = a._h === 'b' ? $('bf-ei') : ($('bs-m') && ($('bs-m').querySelector('img.bs-mi') || $('bs-m').querySelector('.bs-memo'))); if (!el) return null;
    const src = el.currentSrc || el.src; let fl = false; try { fl = new DOMMatrix(getComputedStyle(el).transform).a < 0; } catch (e) { }
    const d = document.createElement('div'); d.className = 'sx-e sx-sil ' + (cls || ''); const u = src ? `url("${src}")` : '';
    d.style.cssText = `--c:${col};${u ? `-webkit-mask-image:${u};mask-image:${u};` : 'border-radius:40%;'}${fl ? 'transform:scaleX(-1);' : ''}`;
    a.insertBefore(d, a._sd); if (ms) setTimeout(() => { try { d.remove(); } catch (e) { } }, ms / spd(a._h)); return d;
  }
  const dly = (a, ms) => `animation-delay:${(ms / 1000 / spd(a._h)).toFixed(3)}s;`;
  const glow = (a, c, s) => E(a, '', 'sx-glow', `--c:${c};--s:${s || 1.15}`, 650);
  const sflash = (a, c) => E(a, '', 'sx-sf', `--c:${c}`, 400, a.parentNode);
  const ring = (a, c, ms) => E(a, '', 'sx-ring', `--c:${c};${dly(a, ms || 0)}`, 700 + (ms || 0));
  function sparks(a, c, n, inward) { for (let k = 0; k < n; k++) { const an = R(0, 6.28), d = R(30, 80); E(a, '', inward ? 'sx-in' : 'sx-sp', `--c:${c};--dx:${(Math.cos(an) * d).toFixed(0)}px;--dy:${(Math.sin(an) * d - (inward ? 0 : 20)).toFixed(0)}px`, 800); } }
  function shards(a, n) { for (let k = 0; k < n; k++) { const an = R(0, 6.28), d = R(40, 95); E(a, SHARD, 'sx-sh', `--dx:${(Math.cos(an) * d).toFixed(0)}px;--dy:${(Math.sin(an) * d - 15).toFixed(0)}px;--r0:${R(-40, 40).toFixed(0)}deg;--r:${R(-300, 300).toFixed(0)}deg`, 850); } }

  /* ---------- 命中特效 ---------- */
  const FX = {
    slash(a, o) { const r = R(-14, 14); E(a, `<svg viewBox="0 0 100 100"><path d="M6 88Q54 -2 96 12" fill="none" stroke="url(#sxS)" stroke-width="6" stroke-linecap="round" pathLength="100"/></svg>`, 'sx-slash', `transform:rotate(${r}deg)`, 600); glow(a, '#e0f2fe', .9); },
    flow(a, o) { const i = o.i || 0; E(a, `<svg viewBox="0 0 100 100"><path d="M8 80Q50 10 92 30" fill="none" stroke="url(#sxS)" stroke-width="4" stroke-linecap="round" pathLength="100"/></svg>`, 'sx-slash', `transform:rotate(${-40 + (i % 3) * 38}deg)`, 600); },
    fire(a, o) {
      sil(a, o.ghost ? 'rgba(56,189,248,.5)' : 'rgba(239,68,68,.5)', 'sx-flash');
      E(a, flameRow(o.ghost ? 'sxG' : 'sxF'), 'sx-frow', '', 1000);
    },
    ice(a, o) {
      glow(a, '#7dd3fc', 1.2); E(a, STAR, 'sx-star', '', 700); shards(a, o.big ? 12 : 8);
      if (o.big) { for (let k = 0; k < 5; k++) E(a, SHARD, 'sx-spk', `left:${(6 + k * 19).toFixed(0)}%;height:${R(46, 78).toFixed(0)}%;${dly(a, k * 50)}`, 1100); }
    },
    thunder(a, o) {
      const small = o.small || o.n > 1; E(a, boltSvg(small ? .75 : 1), 'sx-bolt', `left:${(small ? R(24, 42) : 28).toFixed(0)}%;width:${small ? 36 : 44}%`, 560);
      glow(a, '#93c5fd', 1.2); sflash(a, '#bfdbfe');
      for (let k = 0; k < 5; k++) E(a, arcSvg(), 'sx-arc', `left:${R(-10, 70).toFixed(0)}%;top:${R(5, 70).toFixed(0)}%;${dly(a, k * 40)}`, 650);
    },
    god(a, o) {
      [[4, 36], [32, 40], [60, 36]].forEach((q, k) => E(a, boltSvg(1.3), 'sx-bolt', `left:${q[0]}%;width:${q[1]}%;${dly(a, k * 70)}`, 700));
      glow(a, '#dbeafe', 1.7); sflash(a, '#fff'); ring(a, '#93c5fd'); ring(a, '#fff', 120);
      for (let k = 0; k < 8; k++) E(a, arcSvg(), 'sx-arc', `left:${R(-15, 75).toFixed(0)}%;top:${R(0, 75).toFixed(0)}%;${dly(a, k * 45)}`, 700);
    },
    swords(a, o) {
      const i = o.i || 0; E(a, SWORD, 'sx-sword', `left:${(14 + (i * 19) % 64)}%;--r:${R(-12, 12).toFixed(0)}deg`, 800);
      setTimeout(() => { try { if (a.isConnected) glow(a, '#e0f2fe', .8); } catch (e) { } }, 230 / spd(a._h));
    },
    bigsword(a, o) {
      E(a, `<svg viewBox="0 0 16 80" preserveAspectRatio="none"><polygon points="8,80 2,22 14,22" fill="url(#sxW)" stroke="#fde68a" stroke-width=".7"/><rect x="-1" y="18" width="18" height="4.5" rx="1" fill="#f59e0b"/><rect x="6" y="4" width="4" height="14" fill="#78350f"/><circle cx="8" cy="3" r="3" fill="#f59e0b"/></svg>`, 'sx-bs', '', 1000);
      setTimeout(() => { try { if (a.isConnected) { glow(a, '#fde68a', 1.9); sflash(a, '#fffbe0'); ring(a, '#fde68a'); sparks(a, '#fde68a', 10); } } catch (e) { } }, 300 / spd(a._h));
    },
    quake(a, o) {
      E(a, crackSvg(), 'sx-crack', '', 1000);
      for (let k = 0; k < 3; k++) E(a, '', 'sx-dust', `--x:${(k * 26 - 4)}%;${dly(a, k * 60)}`, 1000);
      for (let k = 0; k < 7; k++) E(a, ROCK, 'sx-rock', `--x:${R(10, 80).toFixed(0)}%;--dx:${R(-50, 50).toFixed(0)}px;--up:${R(-90, -40).toFixed(0)}px;${dly(a, k * 25)}`, 950);
      glow(a, '#fbbf24', .9);
    },
    fist(a, o) { E(a, '', 'sx-fist', '', 450); FX.quake(a, o); ring(a, '#fbbf24'); },
    void(a, o) {
      E(a, '', 'sx-vort', '', 900); sparks(a, '#c4b5fd', 12, true);
      setTimeout(() => { try { if (!a.isConnected) return; E(a, `<svg viewBox="0 0 100 100"><path d="M0 100L100 0" stroke="#fff" stroke-width="3" fill="none" pathLength="100"/></svg>`, 'sx-slash', 'left:-10%;top:-10%;width:120%;height:120%', 600); glow(a, '#a78bfa', 1.4); sflash(a, '#c4b5fd'); } catch (e) { } }, 520 / spd(a._h));
      if (o.rune) E(a, pentagram(), 'sx-form', '', 1000);
    },
    blood(a, o) {
      [[-25, 0], [18, 80], [-62, 150]].forEach(q => E(a, `<svg viewBox="0 0 100 100"><path d="M8 82Q50 -8 92 22" fill="none" stroke="url(#sxR)" stroke-width="7" stroke-linecap="round" pathLength="100"/></svg>`, 'sx-slash', `transform:rotate(${q[0]}deg);${dly(a, q[1])}`, 750 + q[1]));
      glow(a, '#ef4444', 1); for (let k = 0; k < 9; k++) E(a, '', 'sx-drop', `--dx:${R(-60, 60).toFixed(0)}px;--up:${R(-50, -15).toFixed(0)}px;${dly(a, k * 20)}`, 900);
      if (o.drain) for (let k = 0; k < 5; k++) E(a, '', 'sx-orb', `${dly(a, 120 + k * 80)}top:${R(25, 55).toFixed(0)}%`, 1100 + k * 80);
    },
    poison(a, o) {
      for (let k = 0; k < 3; k++) E(a, '', 'sx-cloud', `--x:${(8 + k * 24)}%;--y:${R(15, 40).toFixed(0)}%;${dly(a, k * 70)}`, 1100);
      for (let k = 0; k < 9; k++) E(a, '', 'sx-bub', `--x:${R(8, 78).toFixed(0)}%;--z:${R(6, 14).toFixed(0)}%;--b:${R(5, 40).toFixed(0)}%;${dly(a, k * 50)}`, 1300);
      glow(a, '#84cc16', 1.1);
    },
    formation(a, o) {
      E(a, pentagram(), 'sx-form', '', 1000); glow(a, '#fde68a', 1.3);
      setTimeout(() => { try { if (a.isConnected) FX.fire(a, {}); } catch (e) { } }, 330 / spd(a._h));
    }
  };
  /* 神通 id → 特效;沒有 id 時依 fx 鍵 */
  const SPEC = {
    sk_sword: ['slash'], sc_sw2: ['slash'], sk_flow: ['flow'], sc_sw1: ['flow'], sc_sw4: ['bigsword'], sk_swords: ['swords'],
    sk_fire: ['fire'], sc_mg2: ['fire', { ghost: 1 }], sk_ice: ['ice'], sc_mg3: ['ice', { big: 1 }],
    sk_thunder: ['thunder'], sc_mg1: ['thunder', { small: 1 }], sk_god: ['god'], sc_mg4: ['void', { rune: 1 }], sk_void: ['void'],
    sk_quake: ['quake'], sc_bd2: ['fist'], sk_blood: ['blood', { drain: 1 }], sc_bd3: ['blood', { drain: 1 }], sc_pl2: ['poison'],
    ult_sword: ['bigsword'], ult_magic: ['formation'], ult_body: ['fist'], ult_pill: ['fire']
  };
  const BYKEY = { slash: ['slash'], flow: ['flow'], fire: ['fire'], ice: ['ice'], blood: ['blood'], thunder: ['thunder'], god: ['god'], swords: ['swords'], quake: ['quake'], void: ['void'] };
  const DOTK = { sk_fire: 'burn', sc_mg2: 'ghost', sc_pl2: 'poison', ult_magic: 'burn' };
  const STUNK = { sk_ice: 'freeze', sc_mg3: 'freeze', sk_quake: 'dizzy', sk_void: 'bind', ult_magic: 'bind' };

  /* ---------- 持續狀態 ---------- */
  function flames(g, c) {
    let h = `<i class="sx-e sx-bg" style="--c:${c}"></i>`;
    for (let k = 0; k < 6; k++) h += `<div class="sx-e sx-fl" style="--x:${(6 + k * 15)}%;--t:${(.38 + (k % 3) * .1).toFixed(2)}s;--d:-${(k * .13).toFixed(2)}s">${flame(g)}</div>`;
    for (let k = 0; k < 5; k++) h += `<i class="sx-e sx-em" style="--c:${g === 'sxG' ? '#67e8f9' : '#fbbf24'};--x:${(10 + k * 17)}%;--t:${(1.1 + k * .15).toFixed(2)}s;--d:-${(k * .3).toFixed(2)}s"></i>`;
    return h;
  }
  const NODE = {
    burn: a => { sil(a, 'rgba(239,68,68,.30)', 'sx-pul', 0); return ''; },
    ghost: a => { sil(a, 'rgba(56,189,248,.30)', 'sx-pul', 0); return ''; },
    poison: a => { sil(a, 'rgba(132,204,22,.34)', 'sx-pul', 0); return ''; },
    freeze() {
      let h = `<i class="sx-e sx-tint"></i><svg class="sx-e sx-ice" viewBox="0 0 100 100" preserveAspectRatio="none"><polygon points="6,22 18,8 34,16 50,2 66,16 82,8 94,22 98,60 94,92 80,98 20,98 6,92 2,60" fill="url(#sxIb)" stroke="#e0f2fe" stroke-width="2.6" stroke-linejoin="round" vector-effect="non-scaling-stroke"/><path d="M14 32L32 18M70 42L86 30M22 74L36 62M60 84L74 76" stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity=".8" vector-effect="non-scaling-stroke"/><path d="M52 6L46 30L56 46L48 70" stroke="#bae6fd" stroke-width="1.4" fill="none" opacity=".8" vector-effect="non-scaling-stroke"/></svg>`;
      for (let k = 0; k < 5; k++) h += `<i class="sx-e sx-tw" style="--x:${R(8, 80).toFixed(0)}%;--y:${R(8, 80).toFixed(0)}%;--d:-${(k * .22).toFixed(2)}s"></i>`; return h;
    },
    dizzy: () => `<div class="sx-e sx-dz"><i style="--d:0s"></i><i style="--d:-.43s"></i><i style="--d:-.86s"></i></div>`,
    bind: () => `<div class="sx-e sx-bd" style="left:0;top:0;width:100%;height:100%"><i style="--y:18%;--d:0s"></i><i style="--y:46%;--d:-.5s"></i><i style="--y:72%;--d:-1s"></i></div>`
  };
  function setSlot(a, slot, kind) {
    const box = slot === 'dot' ? a._sd : a._ss, old = a._st[slot]; if (old === kind) return; a._st[slot] = kind;
    if (old === 'freeze') { shards(a, 10); glow(a, '#bae6fd', 1.3); }
    if (box.children.length) { const kids = [...box.children]; kids.forEach(k => k.classList.add('sx-out')); setTimeout(() => kids.forEach(k => { try { k.remove(); } catch (e) { } }), 260); }
    if (kind && NODE[kind]) { const w = document.createElement('div'); w.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%'; if (kind === 'burn' || kind === 'ghost' || kind === 'poison') { const s = sil(a, kind === 'burn' ? 'rgba(239,68,68,.30)' : kind === 'ghost' ? 'rgba(56,189,248,.30)' : 'rgba(132,204,22,.34)', 'sx-pul', 0); if (s) { box.appendChild(s); } } else { w.innerHTML = NODE[kind](a); box.appendChild(w); } }
    loop(a);
  }

  window.SX192 = {
    cur: null,
    hit(h, id, key, o) {
      o = o || {}; const sp = SPEC[id] || BYKEY[key || id]; if (!sp) return;
      if (/^ult_/.test(id) && o.i > 0) return;
      if (h === 'n' && (sp[0] === 'slash' || sp[0] === 'flow')) return;   /* 一般歷練的普攻/劍訣本來就有斬擊圖,不重複 */
      const a = anchor(h); if (!a || !FX[sp[0]]) return; if (a.children.length > 60) return;
      FX[sp[0]](a, Object.assign({}, sp[1], o));
    },
    sync(h, st) { st = st || {}; const host = hostOf(h); if (!host) return; if (!(st.dot || st.stun) && !host.querySelector(':scope > .sx-L > .sx-a')) return; const a = anchor(h); if (!a) return; setSlot(a, 'dot', st.dot || null); setSlot(a, 'stun', st.stun || null); },
    tick(h, id) { const k = DOTK[id] || 'burn', a = anchor(h); if (!a) return; sil(a, k === 'poison' ? 'rgba(132,204,22,.75)' : k === 'ghost' ? 'rgba(56,189,248,.75)' : 'rgba(239,68,68,.8)', 'sx-flash'); },
    stOf(o, dotFx, stunFx) { if (!o) return {}; return { dot: o.dot && o.dot.turns > 0 ? (DOTK[dotFx] || 'burn') : null, stun: o.stun > 0 ? (STUNK[stunFx] || 'dizzy') : null }; }
  };

  /* ---------- 啟動:樣式、共用定義、一般歷練掛鉤 ---------- */
  function boot() {
    if (!document.getElementById('sx192-css')) { const s = document.createElement('style'); s.id = 'sx192-css'; s.textContent = CSS; document.head.appendChild(s); }
    if (!document.getElementById('sx-defs')) document.body.insertAdjacentHTML('beforeend', DEFS);
  }
  if (document.body) boot(); else document.addEventListener('DOMContentLoaded', boot);
  try {
    if (typeof fx !== 'undefined' && fx.hit && fx.status && fx.num && fx.playerAct) {
      const _pa = fx.playerAct; fx.playerAct = function (sk) { fx._sk = sk ? sk.id : null; return _pa.apply(this, arguments); };
      const _hit = fx.hit; fx.hit = function (d, crit, key, i) { const r = _hit.apply(this, arguments); try { if (key !== 'pet' && stageOn()) SX192.hit('n', fx._sk, key, { i, crit }); } catch (e) { } return r; };
      const _st = fx.status; fx.status = function () { const r = _st.apply(this, arguments); try { const B = currentBattle; if (B && stageOn()) SX192.sync('n', SX192.stOf(B, B.dotFx, B.stunFx)); } catch (e) { } return r; };
      const _num = fx.num; fx.num = function (t, cls, side) { if (cls === 'burn' && side === 'm') { try { if (stageOn()) SX192.tick('n', currentBattle && currentBattle.dotFx); } catch (e) { } } return _num.apply(this, arguments); };
    }
  } catch (e) { }
})();
