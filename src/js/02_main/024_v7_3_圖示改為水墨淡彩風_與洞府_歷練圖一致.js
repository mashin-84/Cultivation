/* ===== v7.3:圖示改為水墨淡彩風(與洞府/歷練圖一致) ===== */
const INK_DEFS = `<svg id="ink-defs" width="0" height="0" style="position:absolute;pointer-events:none" aria-hidden="true"><defs>
<filter id="iw-ink" x="-15%" y="-15%" width="130%" height="130%"><feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" xChannelSelector="R" yChannelSelector="G" result="d"/><feMorphology in="d" operator="dilate" radius="0.55" result="dil"/><feFlood flood-color="#1b2a2f" flood-opacity=".9"/><feComposite in2="dil" operator="in" result="ol"/><feGaussianBlur in="d" stdDeviation="0.3" result="sf"/><feMerge><feMergeNode in="ol"/><feMergeNode in="sf"/></feMerge></filter>
<filter id="iw-rough" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="9" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="1.8" xChannelSelector="R" yChannelSelector="G"/></filter>
<filter id="iw-soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="0.9"/></filter>
<filter id="iw-grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="1" seed="2" result="t"/><feColorMatrix in="t" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1.6 0 0 0 -0.35" result="a"/><feComposite in="a" in2="SourceGraphic" operator="in"/></filter>
</defs></svg>`;
function ensureInkDefs() { if (!document.getElementById('ink-defs') && document.body) document.body.insertAdjacentHTML('afterbegin', INK_DEFS); }
function hexMix(h, to, t) {
  const p = x => [1, 3, 5].map(i => parseInt(x.slice(i, i + 2), 16));
  if (!/^#[0-9a-f]{6}$/i.test(h) || !/^#[0-9a-f]{6}$/i.test(to)) return h;
  const a = p(h), b = p(to); return '#' + a.map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, '0')).join('');
}
art = function (inner, c1, c2, extra) {
  ensureInkDefs();
  const n = ++_artN, body = inner.replace(/#G\b/g, '#g' + n), lock = c1 === '#475569';
  const a = hexMix(c1, '#2c4348', .22), b = hexMix(c2, '#16262b', .12), paper = lock ? ['#aeb7b6', '#808d8c'] : ['#f6f8f1', '#cbd8cf'];
  return `<svg viewBox="0 0 64 64" class="w-full h-full ${extra || ''}" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g${n}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient><radialGradient id="p${n}" cx=".4" cy=".32" r=".85"><stop offset="0" stop-color="${paper[0]}"/><stop offset="1" stop-color="${paper[1]}"/></radialGradient><clipPath id="c${n}"><circle cx="32" cy="32" r="30"/></clipPath></defs>`
    + `<circle cx="32" cy="32" r="30.5" fill="url(#p${n})" filter="url(#iw-rough)"/>`
    + `<g clip-path="url(#c${n})"><path d="M-2 52 L9 38 L17 46 L28 31 L38 47 L48 39 L66 53 V66 H-2z" fill="#6c8780" opacity=".3" filter="url(#iw-soft)"/><path d="M-2 45 C10 35 20 53 34 45 S54 40 66 49" stroke="#e0b64f" stroke-width="1.8" fill="none" opacity=".65" filter="url(#iw-soft)"/><circle cx="32" cy="32" r="30" fill="#000" opacity=".16" filter="url(#iw-grain)"/></g>`
    + `<g filter="url(#iw-ink)">${body}</g>`
    + `<circle cx="32" cy="32" r="30.3" fill="none" stroke="#24363b" stroke-opacity=".6" stroke-width=".9" filter="url(#iw-rough)"/></svg>`;
};
window.addEventListener('load', () => {
  ensureInkDefs();
  const im = [...document.images].find(i => i.src && i.src.startsWith('data:image') && i.naturalWidth > i.naturalHeight);
  if (im) document.documentElement.style.setProperty('--mist', `url("${im.src}")`);
  const st = document.createElement('style');
  st.textContent = `.cs-scene{aspect-ratio:16/8.6;background:#1c2a2d center/cover no-repeat!important;border-color:rgba(120,150,145,.55)!important}
#cs-alch{background-image:url("${GEN_IMG.alch}")!important}#cs-forge{background-image:url("${GEN_IMG.forge}")!important}
.cs-scene>svg{display:none}
.cs-scene::after{content:"";position:absolute;inset:0;background:radial-gradient(circle at 50% 55%,rgba(253,224,71,.5),transparent 62%);opacity:0;transition:opacity .25s;pointer-events:none}
.cs-scene.cs-burst::after{opacity:1}
.cs-scene.cs-run{animation:cspulse .45s ease-in-out infinite alternate}@keyframes cspulse{from{filter:brightness(1) saturate(1)}to{filter:brightness(1.28) saturate(1.2)}}
.cs-stat{background:linear-gradient(transparent,rgba(8,16,18,.82));left:0!important;right:0;bottom:0!important;padding:14px 10px 5px;font-size:11px!important;color:#f3d98b!important;text-shadow:0 1px 3px #000;font-weight:700}
.cs-res .nm{color:#fde68a!important;text-shadow:0 0 6px #000,0 0 3px #000!important}
.nav-tab-btn .nvi{width:30px;height:30px;object-fit:cover;opacity:.8;filter:saturate(.75);transition:.2s}
.nav-tab-btn .nvi.rd-c{border-radius:50%}.nav-tab-btn .nvi.rd-s{border-radius:26%}
.nav-tab-btn.text-amber-400 .nvi{opacity:1;filter:none;box-shadow:0 0 0 1.5px #f59e0b,0 0 8px rgba(245,158,11,.55)}
.mb-ban{position:relative;border-radius:12px;overflow:hidden;margin-bottom:8px;aspect-ratio:16/7;border:1px solid rgba(120,150,145,.5)}
.mb-ban img{width:100%;height:100%;object-fit:cover;display:block}
.mb-ban div{position:absolute;left:0;right:0;bottom:0;padding:16px 10px 5px;background:linear-gradient(transparent,rgba(8,16,18,.85));font-size:11px;font-weight:700;color:#f3d98b;text-shadow:0 1px 3px #000}`;
  document.head.appendChild(st);
  setTimeout(() => { try { renderExt(true); renderCrafting(); renderEquipSlots(); } catch (e) { /* ignore */ } }, 400);
});

(function () {
  const NAV = { 'tab-abode': ['t_abode', 's'], 'tab-techniques': ['t_tech', 'c'], 'tab-adventure': ['t_adv', 's'], 'tab-crafting': ['t_craft', 'c'], 'tab-ming': ['t_ming', 's'], 'tab-inventory': ['t_inv', 'c'], 'tab-records': ['t_rec', 's'] };
  function navIcons() {
    document.querySelectorAll('.nav-tab-btn').forEach(b => {
      const m = NAV[b.getAttribute('data-tab')]; if (!m || b.querySelector('.nvi')) return;
      const sp = b.querySelector('span'); if (!sp) return;
      const im = document.createElement('img'); im.src = GEN_IMG[m[0]]; im.className = 'nvi rd-' + m[1]; im.alt = ''; im.draggable = false;
      sp.replaceWith(im);
    });
  }
  const BAN = { body: ['body', '洞天瀑下 · 淬鍊肉身'], treasure: ['treasure', '諸天法寶 · 靈光懸空'], pet: ['pet', '山林靈寵 · 結伴同行'] };
  const ban = k => `<div class="mb-ban"><img src="${GEN_IMG[BAN[k][0]]}" alt=""><div>${BAN[k][1]}</div></div>`;
  const _b0 = renderMingBody, _t0 = renderMingTreasure, _p0 = renderMingPet;
  renderMingBody = function () { return ban('body') + _b0(); };
  renderMingTreasure = function () { return ban('treasure') + _t0(); };
  renderMingPet = function () { return ban('pet') + _p0(); };
  const go = () => { navIcons(); setTimeout(() => { try { renderExt(true); renderCrafting(); } catch (e) { /* ignore */ } }, 300); };
  if (document.readyState === 'complete') go(); else window.addEventListener('load', go);
})();

