/* ===== v96/v97 背景音樂(少切換、重要時刻才切) ===== */
(() => {
  const VOL = .38, FADE = 1500, XF = 3, DWELL = 3000, HOLD = 5000;
  const STORY = { battle: 'weiju', demon: 'weiju', night: 'weiju', ruin: 'weiju', village_fire: 'weiju', void: 'weiju', grave: 'libie', dream: 'libie' };
  let cur = null, storyMood = 'wenqing', failed = {}, pend = null, pendT = 0, holdT = 0, holdTrack = null, lastB = null;
  const tracks = {};
  const fileOK = () => !/^(file|content)/.test(location.protocol);
  function el(name, pre) { const a = new Audio('music/' + name + '.webm'); a.preload = pre ? 'auto' : 'metadata'; a.volume = 0; a.addEventListener('error', () => { failed[name] = 1; }); return a; }
  function tr(name) { return tracks[name] || (tracks[name] = { a: el(name, true), b: null, on: null, last: 0 }); }
  function ramp(a, to, ms) {
    clearInterval(a._r); const from = a.volume, t0 = performance.now();
    a._r = setInterval(() => { const k = Math.min(1, (performance.now() - t0) / ms); a.volume = Math.max(0, Math.min(1, from + (to - from) * k)); if (k >= 1) { clearInterval(a._r); if (to === 0) a.pause(); } }, 50);
  }
  let blurred = false;   /* v168 切到別的 App 時有些手機只發 blur、不發 visibilitychange */
  const enabled = () => typeof state !== 'undefined' && state.bgmOn !== false && !document.hidden && document.visibilityState === 'visible' && !blurred && fileOK();
  const tabNow = () => (document.querySelector('.tab-panel:not(.hidden)') || {}).id;
  function battleKind(B) {
    const m = B.monster || {}, id = String(m.id || '');
    if (m.isBoss || B.isJie || /^jie_/.test(id) || id === 'mind_demon' || id === 'tw_100') return 'tianjie';
    if (B.isTower || B.isWB || B.tb26 || /守山長老|守關者/.test(m.name || '')) return 'zhandou';
    return null;
  }
  function bannerText(B, k) {
    const m = B.monster || {}, id = String(m.id || ''), nm = m.name || '';
    if (id === 'mind_demon' || id === 'tw_100') return ['心魔現', nm];
    if (B.isJie || /^jie_/.test(id)) return ['天劫降臨', nm];
    if (k === 'tianjie') return [B.isTower ? '登天塔・鎮守' : '境主', nm];
    if (B.isWB) return ['天地異種', nm];
    if (B.isTower) return ['九九登天塔', nm];
    return ['生死交鋒', nm];
  }
  function banner(t) {
    const st = document.getElementById('battle-stage'); if (!st) return;
    let b = document.getElementById('bn97'); if (!b) { b = document.createElement('div'); b.id = 'bn97'; }
    st.appendChild(b); b.innerHTML = `<b>${t[0]}</b><span>${t[1]}</span>`; b.classList.remove('go'); void b.offsetWidth; b.classList.add('go');
  }
  /* 決定目標曲:回傳 [曲名, 是否立即] */
  function target() {
    if (window.BF113 && BF113.on) return [BF113.bgm(), true];   /* v113 重要戰鬥 */
    if (window.THU160 && THU160.on) return ['tianjie', true];   /* v160 雷劫過場 */
    const st = document.getElementById('st28');
    if (st && window.ST28 && ST28.busy() && getComputedStyle(st).display !== 'none') return [storyMood, true];
    const tab = tabNow(), B = typeof currentBattle !== 'undefined' ? currentBattle : null;
    if (tab === 'tab-adventure') {
      const k = B && B.monster ? battleKind(B) : null;
      if (k) { holdTrack = k; holdT = Date.now() + HOLD; if (B !== lastB) { lastB = B; if (cur !== k) banner(bannerText(B, k)); } return [k, true]; }
      if (holdTrack && Date.now() < holdT) return [holdTrack, true];
      return ['lilian', false];
    }
    holdTrack = null;
    return ['dongfu', false];
  }
  function play(name) {
    if (failed[name]) return; const T = tr(name);
    if (!T.on) T.on = T.a;
    const a = T.on;
    if (/tianjie|zhandou/.test(name) && Date.now() - T.last > 60000) { a.currentTime = 0; a._xf = 0; }
    if (a.paused) a.play().catch(() => { });
    ramp(a, VOL, FADE);
  }
  function stop(name) { const T = tracks[name]; if (!T) return; T.last = Date.now(); [T.a, T.b].forEach(a => a && !a.paused && ramp(a, 0, FADE)); }
  function sync(force) {
    if (!enabled()) { Object.keys(tracks).forEach(stop); cur = null; pend = null; return; }
    const [want, now] = target();
    if (want === cur && !force) { pend = null; }
    else if (now || !cur || force || /tianjie|zhandou|wenqing|libie|weiju/.test(cur)) { switchTo(want); }   /* 從戰鬥/劇情回來:延續期已過,直接回區域曲 */
    else { if (pend !== want) { pend = want; pendT = Date.now(); } else if (Date.now() - pendT >= DWELL) switchTo(want); }
    const T = tracks[cur]; if (!T || !T.on) return;
    const a = T.on;
    if (a.duration && a.currentTime > a.duration - XF - .3 && !a._xf) {
      a._xf = 1; if (!T.b) T.b = el(cur, true);
      const nb = a === T.a ? T.b : T.a; nb._xf = 0; nb.currentTime = 0; nb.volume = 0; nb.play().catch(() => { }); ramp(nb, VOL, XF * 1000); ramp(a, 0, XF * 1000); T.on = nb;
    }
  }
  function switchTo(w) { if (cur && cur !== w) stop(cur); cur = w; pend = null; play(cur); }
  /* 預載常用兩首 */
  if (fileOK()) { tr('dongfu'); tr('lilian'); }
  setInterval(() => { try { sync(); } catch (e) { } }, 300);
  /* v110 離開畫面:立即停止(不靠淡出,背景計時器會被凍結) */
  function hush() {
    Object.keys(tracks).forEach(n => { const T = tracks[n]; [T.a, T.b].forEach(a => { if (a) { clearInterval(a._r); a.volume = 0; a.pause(); } }); });
    cur = null; pend = null;
    try { if (audio && audio.ctx && audio.ctx.state === 'running') audio.ctx.suspend(); } catch (e) { }
  }
  function wake() { try { if (audio && audio.ctx && audio.ctx.state === 'suspended') audio.ctx.resume(); } catch (e) { } try { sync(true); } catch (e) { } }
  document.addEventListener('visibilitychange', () => { if (document.hidden) hush(); else wake(); });
  window.addEventListener('blur', () => { blurred = true; hush(); });
  window.addEventListener('focus', () => { blurred = false; if (!document.hidden) wake(); });
  /* 保險:任何時候發現畫面不在前景,但還有音樂在播,就立刻停 */
  setInterval(() => { if ((document.hidden || blurred || document.visibilityState !== 'visible') && Object.keys(tracks).some(n => { const T = tracks[n]; return [T.a, T.b].some(a => a && !a.paused); })) hush(); }, 1000);
  window.addEventListener('pagehide', hush);
  document.addEventListener('freeze', hush);
  window.addEventListener('pageshow', () => { if (!document.hidden) wake(); });
  const css = document.createElement('style');
  css.textContent = '#battle-stage #bn97{position:absolute;left:0;right:0;top:3%;z-index:60;pointer-events:none;text-align:center;opacity:0;padding:6px 0 7px;background:linear-gradient(90deg,transparent,rgba(16,8,4,.85) 18%,rgba(16,8,4,.85) 82%,transparent)}#battle-stage #bn97 b{display:block;font-family:"Noto Serif TC",serif!important;font-size:24px!important;font-weight:900!important;letter-spacing:.3em;padding-left:.3em;color:#fff3d0!important;text-shadow:0 0 10px #d97706,0 2px 4px #000!important;line-height:1.2}#battle-stage #bn97 span{display:block;margin-top:2px;font-size:12px!important;letter-spacing:.15em;color:#fcd34d!important;text-shadow:0 1px 3px #000!important}#battle-stage #bn97.go{animation:bn97 1.4s ease-out forwards}@keyframes bn97{0%{opacity:0;transform:scaleX(.6)}14%{opacity:1;transform:none}78%{opacity:1}100%{opacity:0}}';
  document.head.appendChild(css);
  window.BGM96 = { sync, story(bg) { storyMood = STORY[bg] || 'wenqing'; }, cur: () => cur };
})();
