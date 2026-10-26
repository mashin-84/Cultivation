/* ===== v160 雷劫過場:大境界天劫改成全畫面演出(程式特效;之後可換生成圖) =====
   原本的天劫小卡保留,只用來看成功率、選擇是否服渡劫丹;按下「運功硬抗天劫」後進入本過場,三重雷劈完才擲骰判定成敗。 */
(() => {
  const $ = id => document.getElementById(id);
  const css = document.createElement('style');
  css.textContent = `#thu160{position:fixed;inset:0;z-index:2147482000;overflow:hidden;background:#0b0d16 center/cover no-repeat;touch-action:none;user-select:none;-webkit-user-select:none}
#thu160 .tint{position:absolute;inset:0;background:linear-gradient(180deg,rgba(10,10,24,.92) 0%,rgba(18,16,40,.7) 45%,rgba(8,8,16,.85) 100%);transition:background 1.2s}
#thu160 .cl{position:absolute;left:-30%;width:160%;height:46%;top:-12%;background:radial-gradient(ellipse at 30% 60%,rgba(60,58,96,.95),transparent 55%),radial-gradient(ellipse at 70% 50%,rgba(40,38,70,.95),transparent 60%),radial-gradient(ellipse at 50% 30%,rgba(90,86,140,.7),transparent 55%);filter:blur(6px);animation:thu160c 9s linear infinite}
#thu160 .cl.b{top:-4%;opacity:.7;animation-duration:13s;animation-direction:reverse}
@keyframes thu160c{from{transform:translateX(-6%) rotate(0)}50%{transform:translateX(6%) rotate(1deg)}to{transform:translateX(-6%) rotate(0)}}
#thu160 .eye{position:absolute;left:50%;top:14%;width:120px;height:120px;margin-left:-60px;border-radius:50%;background:radial-gradient(circle,rgba(190,170,255,.55),rgba(120,100,220,.15) 45%,transparent 70%);animation:thu160e 2.4s ease-in-out infinite}
@keyframes thu160e{50%{transform:scale(1.25);opacity:.75}}
#thu160 .pc{position:absolute;left:50%;bottom:9%;height:46%;transform:translateX(-50%);filter:drop-shadow(0 0 0 rgba(255,255,255,0));transition:filter .25s}
#thu160 .pc.lit{filter:drop-shadow(0 0 14px rgba(200,220,255,.95)) brightness(1.6)}
#thu160 .pc.gold{filter:drop-shadow(0 0 22px rgba(255,214,102,.95)) brightness(1.15)}
#thu160 .aura{position:absolute;left:50%;bottom:7%;width:70%;height:52%;transform:translateX(-50%);border-radius:50%;background:radial-gradient(ellipse at 50% 70%,rgba(140,200,255,.35),transparent 65%);opacity:0;transition:opacity .4s}
#thu160 .aura.on{opacity:1}#thu160 .aura.gold{background:radial-gradient(ellipse at 50% 70%,rgba(255,214,102,.55),transparent 65%);opacity:1}
#thu160 svg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
#thu160 .fl{position:absolute;inset:0;background:#eef2ff;opacity:0;pointer-events:none}
#thu160 .fl.go{animation:thu160f .55s ease-out}
@keyframes thu160f{0%{opacity:.95}100%{opacity:0}}
#thu160.shk{animation:thu160s .35s linear}
@keyframes thu160s{20%{transform:translate(-7px,4px)}40%{transform:translate(6px,-5px)}60%{transform:translate(-4px,3px)}80%{transform:translate(3px,-2px)}}
#thu160 .tt{position:absolute;left:0;right:0;top:40%;text-align:center;color:#f5f3ff;font-weight:900;font-size:26px;letter-spacing:.18em;text-shadow:0 0 12px rgba(160,140,255,.9),0 2px 4px #000;opacity:0;transition:opacity .35s}
#thu160 .tt.on{opacity:1}#thu160 .tt small{display:block;font-size:13px;letter-spacing:.05em;font-weight:700;margin-top:6px;color:#ddd6fe}
#thu160 .bar{position:absolute;left:12%;right:12%;bottom:5%;height:10px;border-radius:6px;background:rgba(255,255,255,.12);border:1px solid rgba(200,210,255,.4);overflow:hidden}
#thu160 .bar i{display:block;height:100%;width:100%;background:linear-gradient(90deg,#93c5fd,#e0e7ff);transition:width .5s}
#thu160 .bl{position:absolute;left:12%;bottom:calc(5% + 14px);color:#c7d2fe;font-size:12px;font-weight:800}
#thu160 .end{position:absolute;left:0;right:0;bottom:12%;text-align:center;opacity:0;transition:opacity .5s;pointer-events:none}
#thu160 .end.on{opacity:1;pointer-events:auto}
#thu160 .end b{display:block;font-size:30px;letter-spacing:.2em;color:#fde68a;text-shadow:0 0 16px rgba(253,230,138,.9),0 2px 4px #000}
#thu160 .end b.f{color:#fca5a5;text-shadow:0 0 14px rgba(239,68,68,.8),0 2px 4px #000}
#thu160 .end p{margin:8px 24px 14px;color:#f1f5f9;font-size:14px;line-height:1.55;text-shadow:0 1px 3px #000}
#thu160 .end button{min-height:46px;padding:0 34px;border-radius:12px;font-weight:900;font-size:15px;background:linear-gradient(180deg,#f59e0b,#b45309);color:#fff;border:1px solid #fde68a}
#thu160 .col{position:absolute;left:50%;top:0;bottom:0;width:38%;transform:translateX(-50%);background:linear-gradient(180deg,rgba(255,236,170,0),rgba(255,236,170,.55) 40%,rgba(255,214,102,.75));filter:blur(8px);opacity:0;transition:opacity 1s}
#thu160 .col.on{opacity:1}`;
  document.head.appendChild(css);
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const NAMES = [['第一重・玄雷', '護體罡氣激盪'], ['第二重・煞火雷', '血肉經脈重塑'], ['第三重・九霄紫極神雷', '灌頂而下,生死一線']];
  function poseKey(n) {
    const B = window.BP114 || {}, g = state.gender === 'f' ? 'F_' : 'M_', lk = state.look || 'o1';
    let sc = ''; try { const m = (state.realmIdx || 0) >= 1 && window.SCH19 ? SCH19.SCH().main : ''; sc = m && m !== 'sword' ? m : ''; } catch (e) { }
    return (sc && B[g + lk + '_' + sc + '_' + n]) || B[g + lk + '_' + n] || B[g + 'o1_' + n] || '';
  }
  function bolt(svg, tx, ty) {
    const W = innerWidth; let x = tx + (Math.random() - .5) * W * .5, y = -10, pts = [[x, y]];
    const steps = 9; for (let i = 1; i <= steps; i++) { const f = i / steps; x = x + (tx - x) * (.35 + f * .4) + (Math.random() - .5) * 60 * (1 - f); y = ty * f; pts.push([x, y]); }
    const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
    svg.innerHTML = `<path d="${d}" stroke="#c4b5fd" stroke-width="14" fill="none" opacity=".35" stroke-linejoin="round"/><path d="${d}" stroke="#eef2ff" stroke-width="4" fill="none" stroke-linejoin="round"/>`;
    svg.animate([{ opacity: 1 }, { opacity: 1, offset: .5 }, { opacity: 0 }], { duration: 520 }); setTimeout(() => { svg.innerHTML = ''; }, 520);
  }
  let busy = false;
  async function play() {
    busy = true; window.THU160.on = true;
    let mv = false; try { mv = window.MOV174 ? await MOV174.play(state.gender === 'f' && MOV174.has('tribulation_f') ? 'tribulation_f' : 'tribulation') : false; } catch (e) { }   /* v174 有雷劫動畫就先播,三重雷的程式演出略過 */
    const realm = state.realmIdx || 0, next = (REALM_DATA[realm + 1] || {}).name || '下一境界';
    let bgSrc = ''; try { const G = window.GEN3 || (typeof GEN3 !== 'undefined' ? GEN3 : {}); bgSrc = G['A' + Math.min(7, realm)] || G.A0 || ''; } catch (e) { }
    const o = document.createElement('div'); o.id = 'thu160';
    o.innerHTML = `<div class="tint"></div><div class="cl"></div><div class="cl b"></div><div class="eye"></div><div class="col"></div><div class="aura"></div><img class="pc" alt="" draggable="false"><svg></svg><div class="fl"></div><div class="tt"></div><div class="bl">護體罡氣</div><div class="bar"><i></i></div><div class="end"><b></b><p></p><button>繼續</button></div>`;
    if (bgSrc) o.style.backgroundImage = `url("${bgSrc}")`;
    document.body.appendChild(o);
    const pc = o.querySelector('.pc'), svg = o.querySelector('svg'), fl = o.querySelector('.fl'), tt = o.querySelector('.tt'), bar = o.querySelector('.bar i'), aura = o.querySelector('.aura');
    pc.src = poseKey(1) || (typeof playerArt === 'function' ? playerArt() : '');
    tt.innerHTML = `天劫降臨<small>欲踏入【${next}】,須硬抗三重天雷</small>`; tt.classList.add('on');
    if (!mv) { await sleep(1900); tt.classList.remove('on'); await sleep(350); } else { tt.classList.remove('on'); bar.style.width = '16%'; }
    for (let i = 0; i < (mv ? 0 : 3); i++) {
      tt.innerHTML = `${NAMES[i][0]}<small>${NAMES[i][1]}</small>`; tt.classList.add('on');
      pc.src = poseKey(5) || pc.src; aura.classList.add('on');
      await sleep(700);
      const r = pc.getBoundingClientRect(); bolt(svg, r.left + r.width / 2, r.top + r.height * .18);
      try { if (!(window.SFX && SFX.play('sfx_thunder'))) audio.playThunder(); } catch (e) { }
      fl.classList.remove('go'); void fl.offsetWidth; fl.classList.add('go');
      o.classList.remove('shk'); void o.offsetWidth; o.classList.add('shk');
      pc.classList.add('lit'); pc.src = poseKey(6) || pc.src;
      bar.style.width = (100 - (i + 1) * 28) + '%';
      await sleep(260); pc.classList.remove('lit');
      await sleep(620); pc.src = poseKey(5) || pc.src; tt.classList.remove('on');
      await sleep(320);
    }
    /* 三重雷過後才判定 */
    const r0 = state.realmIdx;
    try { resolveTribulationOutcome(); } catch (e) { }
    const ok = state.realmIdx > r0, end = o.querySelector('.end'), eb = end.querySelector('b'), ep = end.querySelector('p');
    if (ok) {
      o.querySelector('.col').classList.add('on'); aura.className = 'aura gold'; pc.classList.add('gold'); pc.src = poseKey(9) || poseKey(1) || pc.src;
      o.querySelector('.tint').style.background = 'linear-gradient(180deg,rgba(60,48,20,.55),rgba(20,18,30,.5) 55%,rgba(10,10,16,.75))';
      bar.style.width = '100%'; bar.style.background = 'linear-gradient(90deg,#fde68a,#f59e0b)';
      eb.textContent = '渡劫功成'; eb.className = '';
      ep.textContent = `雷雲散盡,天光灑落。你踏入了【${REALM_DATA[state.realmIdx].name}】。`;
      try { if (window.SFX) SFX.play('sfx_win'); } catch (e) { }
    } else {
      aura.classList.remove('on'); pc.src = poseKey(6) || pc.src; bar.style.width = '6%';
      eb.textContent = '天雷浩瀚'; eb.className = 'f';
      ep.textContent = '第三重雷劈散了凝聚的真元。肉身尚在——調息之後,還能再來。(連續失敗會提高下次的成功率)';
      try { if (window.SFX) SFX.play('sfx_lose'); } catch (e) { }
    }
    end.classList.add('on');
    await new Promise(res => { end.querySelector('button').onclick = res; });
    o.style.transition = 'opacity .4s'; o.style.opacity = '0'; await sleep(420); o.remove();
    busy = false; window.THU160.on = false;
    try { updateTopBar(); } catch (e) { }
  }
  /* 取代原本按下「運功硬抗天劫」後的小卡演出 */
  executeTribulation = function () {
    if (busy) return;
    try { audio.init(); } catch (e) { }
    state.trib160 = { r: state.realmIdx || 0, pill: !!(usePillInTrib && (state.inventory['pill_3'] || 0) > 0) };   /* 劇情裡的雷劫依實際是否服丹 */
    if (usePillInTrib && (state.inventory['pill_3'] || 0) > 0) { state.inventory['pill_3']--; try { showToast('已吞服渡劫丹,藥力護持周身!'); } catch (e) { } }
    const m = $('modal-tribulation'); if (m) m.classList.add('hidden');
    play();
  };
  window.THU160 = { on: false, play };
})();
