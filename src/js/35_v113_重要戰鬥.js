/* ===== v113 重要戰鬥:獨立戰鬥介面 + 回合制 QTE + Boss 階段演出 ===== */
(() => {
  const $ = id => document.getElementById(id);
  const fm = n => formatNum(Math.max(0, Math.floor(n)));
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const rnd = (a, b) => a + Math.random() * (b - a);
  /* ---------- 各場戰鬥資料(台詞、階段、立繪);沒列到的用通用版 ---------- */
  const BFD = {
    '顧青衍': { pt: 'gu_a', bg: 'hall', T: 9, title: '外門大比・決賽', charge: ['劍意凝聚', '青雲劍訣・極'],
      intro: '聽說你是長老親自帶回來的?讓我看看,「親自」二字值多少。',
      p2: '……有點意思。那這一劍,你接得住嗎?', p3: '我走劍修,一條路走到黑。今天,我不會輸!',
      win: '……我輸了。下次,我一定贏回來。', lose: '這就是長老看中的人?太讓人失望了。' },
    '天道': { bg: 'void', T: 11, margin: .5, title: '天道之戰・終局', art: () => (window.A45 && A45.j8) ? { src: A45.j8, flip: false } : null, charge: ['天規降臨', '無情天罰', '萬法歸寂'],
      intro: '凡心不足以擋天。你,也是我的一部分。',
      p2: '……你竟能傷我。那便,讓你看看三千年的孤寂。', p3: '取代我,斬斷我,或者——再試一次吧,一念。',
      win: '……原來,被人打醒,是這種感覺。', lose: '回去吧。等你想清楚了,再來。' }
  };
  const PT = { '顧青衍': 'gu_a', '司徒衡': 'situ_a', '執法長老・司徒衡': 'situ_a', '九幽魔將': '魔將_a', '仙衛統領': '仙衛統領_a', '黑市散修': '散修_a' };
  const FL = ['gu', 'jy_demon', 'jy_rogue'];
  const ULT = { sword: { k: 'sword', n: '劍氣縱橫', ic: '🌬️', cd: 5, f: 1.6, fl: 5 }, magic: { k: 'magic', n: '五行法陣', ic: '🔯', cd: 6, f: 1.6, fl: 5 }, body: { k: 'body', n: '金身怒目', ic: '🪬', cd: 6, f: 1.6, fl: 5 }, pill: { k: 'pill', n: '丹爐煉化', ic: '♨️', cd: 6, f: 1, fl: 3 } };
  const ULTD = { sword: '純粹的劍氣,一擊貫穿。', magic: '法陣灼燒敵人 3 回合,並定身 1 回合(有 40% 機率被抵抗)。', body: '激發金身,獲得氣血 40% 的護盾。', pill: '當場煉丹:回復 30% 氣血,攻擊提升 25%(3 回合)。' };
  const ultBestOf = X => { let m = 0, by = null; (X.sk || []).forEach(k => { if (k.c && k.c.mult) { const v = k.c.mult * (k.sk.type === 'atk' ? (k.c.hits || 1) : 1); if (v > m) { m = v; by = k.sk; } } }); return { m, by }; };
  /* v126 本命絕學倍率:最強攻擊神通總倍率 ×1.6(保底 5) */
  const ultM = X => { const u = X.ult || {}, f = u.f || 1.6; return Math.max(u.fl || 5, ultBestOf(X).m * f); };
  /* 增傷:比照最強攻擊神通吃到的流派/宗門/神通加成 */
  const ultDm = X => { let m = 0; if (window.sectDmgMult) (X.sk || []).forEach(k => { if (k.c && k.c.mult) m = Math.max(m, sectDmgMult(k.sk)); }); return m || ((window.sectDmgMult ? sectDmgMult(null) : 1) * 1.12); };
  const ultOf = () => { try { const m = (state.realmIdx || 0) >= 1 && window.SCH19 ? SCH19.SCH().main : null; return m && ULT[m] ? ULT[m] : null; } catch (e) { return null; } };
  function enemyArt(name, id, tier) {
    try { let k = window.art45 && art45({ monster: { name, id: id || '' } }); if (!k && /守山長老$/.test(name || '') && tier != null) k = 'yx' + Math.min(7, Math.max(0, tier | 0)); if (k && window.A45 && A45[k]) return { src: A45[k], flip: FL.includes(k) }; } catch (e) { }
    return null;
  }
  /* v114 主角背面戰鬥動作:1 待機 2 普攻 3 攻擊神通 4 輔助神通 5 格擋 6 受擊 7 蓄力 8 爆發 9 勝利(其他外觀暫用新手服) */
  const BPX = window.BP114 || {};
  /* v142 主流派(練氣期尚未分流派 → 劍修)。流派圖只在「該外觀有該流派圖」時使用,否則沿用該外觀的劍修圖 */
  const SCM = () => { try { const m = (state.realmIdx || 0) >= 1 && window.SCH19 ? SCH19.SCH().main : ''; return m && m !== 'sword' ? m : ''; } catch (e) { return ''; } };
  const pkey = n => { const g = state.gender === 'f' ? 'F_' : 'M_', lk = state.look || 'o1', sc = SCM(); if (sc && BPX[g + lk + '_' + sc + '_' + n]) return g + lk + '_' + sc + '_' + n; return BPX[g + lk + '_' + n] ? g + lk + '_' + n : g + 'o1_' + n; };
  const STY = () => { if (B && B.A) return 'sword'; const k = pkey(2); return /_magic_/.test(k) ? 'magic' : /_body_/.test(k) ? 'body' : /_pill_/.test(k) ? 'pill' : 'sword'; };
  const pose = n => (B && B.A && B.A.pose && B.A.pose(n)) || BPX[pkey(n)] || '';
  const ATKN = () => (B && B.A && B.A.atk) || ({ sword: ['仙劍普攻', '看準時機・最多三連斬'], magic: ['飛符術', '看準時機・最多三張連發'], body: ['崩山拳', '看準時機・最多三連擊'], pill: ['丹爐撞擊', '看準時機・最多三連擊'] })[STY()];
  /* 各出招動作的「劍尖附近」在圖框內的位置(由圖自動量出;其他外觀暫用新手服的值) */
  const TIPS = { F_o1_2: [.906, .191], F_o1_3: [.776, .413], F_o1_8: [.965, .038], M_o1_2: [.82, .533], M_o1_3: [.702, .144], M_o1_8: [.966, .053], M_o2_2: [.942, .207], M_o2_3: [.584, .263], M_o2_8: [.998, .107], M_o3_2: [.949, .198], M_o3_3: [.618, .257], M_o3_8: [.998, .098], M_o4_2: [.949, .199], M_o4_3: [.588, .257], M_o4_8: [.998, .095], M_o5_2: [.948, .199], M_o5_3: [.619, .26], M_o5_8: [.998, .097], F_o1_magic_2: [.8, .149], F_o1_magic_3: [.652, .173], F_o1_magic_8: [.739, .065], F_o1_body_2: [.741, .293], F_o1_body_3: [.744, .299], F_o1_body_8: [.739, .412], F_o1_pill_2: [.848, .387], F_o1_pill_3: [.753, .262], F_o1_pill_8: [.871, .198], M_o2_magic_2: [.825, .18], M_o2_magic_3: [.593, .155], M_o2_magic_8: [.783, .293], M_o2_body_2: [.764, .266], M_o2_body_3: [.707, .245], M_o2_body_8: [.713, .45], M_o2_pill_2: [.82, .346], M_o2_pill_3: [.756, .224], M_o2_pill_8: [.85, .254], F_o2_magic_2: [.862, .174], F_o2_magic_3: [.832, .04], F_o2_magic_8: [.778, .097], F_o2_body_2: [.743, .238], F_o2_body_3: [.744, .198], F_o2_body_8: [.706, .35], F_o2_pill_2: [.775, .323], F_o2_pill_3: [.768, .177], F_o2_pill_8: [.813, .211], M_o3_magic_2: [.87, .227], M_o3_magic_3: [.699, .092], M_o3_magic_8: [.748, .04], M_o3_body_2: [.766, .264], M_o3_body_3: [.73, .204], M_o3_body_8: [.712, .35], M_o3_pill_2: [.882, .318], M_o3_pill_3: [.702, .205], M_o3_pill_8: [.886, .221], F_o3_magic_2: [.836, .189], F_o3_magic_3: [.648, .073], F_o3_magic_8: [.744, .022], F_o3_body_2: [.743, .269], F_o3_body_3: [.755, .196], F_o3_body_8: [.685, .35], F_o3_pill_2: [.763, .317], F_o3_pill_3: [.759, .207], F_o3_pill_8: [.82, .192], M_o4_magic_2: [.854, .204], M_o4_magic_3: [.68, .123], M_o4_magic_8: [.757, .027], M_o4_body_2: [.787, .29], M_o4_body_3: [.721, .22], M_o4_body_8: [.596, .039], M_o4_pill_2: [.827, .364], M_o4_pill_3: [.776, .267], M_o4_pill_8: [.824, .183], F_o4_magic_2: [.817, .229], F_o4_magic_3: [.661, .132], F_o4_magic_8: [.714, .06], F_o4_body_2: [.747, .251], F_o4_body_3: [.768, .225], F_o4_body_8: [.572, .031], F_o4_pill_2: [.799, .35], F_o4_pill_3: [.786, .223], F_o4_pill_8: [.812, .189], M_o1_magic_2: [.798, .232], M_o1_magic_3: [.763, .143], M_o1_magic_8: [.825, .051], M_o1_body_2: [.77, .235], M_o1_body_3: [.727, .199], M_o1_body_8: [.716, .386], M_o1_pill_2: [.795, .322], M_o1_pill_3: [.729, .202], M_o1_pill_8: [.835, .245], F_o2_2: [.969, .167], F_o2_3: [.546, .39], F_o2_8: [.421, .208], F_o3_2: [.968, .167], F_o3_3: [.548, .39], F_o3_8: [.421, .208], F_o4_2: [.967, .168], F_o4_3: [.546, .39], F_o4_8: [.421, .208], F_o5_2: [.981, .168], F_o5_3: [.548, .39], F_o5_8: [.421, .208] };
  const tip = n => { if (B && B.A && B.A.tip) return B.A.tip(n); const g = state.gender === 'f' ? 'F_' : 'M_'; return TIPS[pkey(n)] || TIPS[g + (state.look || 'o1') + '_' + n] || TIPS[g + 'o1_' + n] || [.6, .35]; };
  const ULTC = { '一劍青雲': '#d9f3ff', '劍氣縱橫': '#bfe3ff', '五行法陣': '#c4b5fd', '金身怒目': '#fcd34d', '丹爐煉化': '#fb923c' };
  let poseT = 0;
  function setPose(n, back, lift) {
    const i = $('bf-pi'); if (!i) return; const s = pose(n); if (!s) return;
    i.src = s; i.style.translate = lift ? `0 ${-lift}%` : ''; clearTimeout(poseT);
    if (back) poseT = setTimeout(() => { if (B && !B.over) { i.src = pose(1); i.style.translate = ''; } }, back);
  }
  const center = id => { const e = $(id), s = $('bf-stg'); if (!e || !s) return [0, 0]; const r = e.getBoundingClientRect(), q = s.getBoundingClientRect(); return [r.left - q.left + r.width / 2, r.top - q.top + r.height * .45]; };
  function fxEl(cls, x, y, css) { const d = document.createElement('div'); d.className = 'bfx ' + cls; d.style.left = x + 'px'; d.style.top = y + 'px'; if (css) Object.assign(d.style, css); $('bf-stg').appendChild(d); return d; }
  function fxArc(col) { const [x, y] = center('bf-ei'); const d = fxEl('fx-arc', x, y, { '--c': col || '#dff1ff' }); setTimeout(() => d.remove(), 450); }
  /* v142 流派特效 */
  function handAt(n) { const p = $('bf-pi'), s = $('bf-stg'); const r = p.getBoundingClientRect(), q = s.getBoundingClientRect(), t = tip(n); return [r.left - q.left + r.width * t[0], r.top - q.top + r.height * t[1]]; }
  function fxTal(col, from, to, ms, delay) {
    return new Promise(res => setTimeout(() => {
      const [sx, sy] = from, [ex, ey] = to, d = fxEl('fx-tal', sx, sy, { '--c': col || '#fde68a', backgroundImage: `url(${BPX.talisman || ''})` });
      const a = d.animate([{ transform: 'translate(0,0) rotate(-20deg) scale(.7)', opacity: 1 }, { transform: `translate(${ex - sx}px,${ey - sy}px) rotate(${340 + Math.random() * 60}deg) scale(1.05)`, opacity: 1 }], { duration: ms || 300, easing: 'cubic-bezier(.4,0,.8,.6)' });
      a.onfinish = () => { d.remove(); res(); };
    }, delay || 0));
  }
  function fxSky(col, big) {
    const [x, y] = center('bf-ei'), d = fxEl('fx-sky' + (big ? ' big' : ''), x, 0, { '--c': col || '#c4b5fd', height: y + 'px' });
    setTimeout(() => { d.remove(); fxArc(col); }, big ? 520 : 380);
  }
  function fxPill() { const [x, y] = center('bf-pi'); const d = fxEl('fx-aura bf', x, y - 40); setTimeout(() => d.remove(), 800); num('p', '服丹', 'tx'); }
  async function swallow() { setPose(4); fxPill(); sfx('sfx_skill'); await sleep(520); }
  function fxBolt(col, n) {
    const p = $('bf-pi'), s = $('bf-stg'); if (!p || !s) return; const r = p.getBoundingClientRect(), q = s.getBoundingClientRect();
    const tp = tip(3), sx = r.left - q.left + r.width * tp[0], sy = r.top - q.top + r.height * tp[1], [ex, ey] = center('bf-ei'), a = Math.atan2(ey - sy, ex - sx) * 180 / Math.PI;
    for (let k = 0; k < (n || 1); k++) setTimeout(() => { const d = fxEl('fx-bolt', sx, sy, { '--c': col || '#bfe3ff' }); d.animate([{ transform: `translate(0,0) rotate(${a}deg) scaleX(.4)`, opacity: 1 }, { transform: `translate(${ex - sx}px,${ey - sy + (k % 2 ? 14 : -14)}px) rotate(${a}deg) scaleX(1)`, opacity: .9 }], { duration: 260, easing: 'ease-in' }).onfinish = () => { d.remove(); fxArc(col); }; }, k * 110);
  }
  function fxAura(cls) { const [x, y] = center('bf-pi'); const d = fxEl('fx-aura ' + cls, x, y); setTimeout(() => d.remove(), 900); }
  function fxBurst(col) { const [x, y] = center('bf-ei'); const d = fxEl('fx-burst', x, y, { '--c': col }); const f = fxEl('fx-flash', 0, 0, { '--c': col }); setTimeout(() => { d.remove(); f.remove(); }, 900); }
  const playerArt = () => { try { const g = state.gender === 'f' ? 'F_' : 'M_'; return (window.LOOK_IMG && LOOK_IMG[g + (state.look || 'o1')]) || GEN3.S0; } catch (e) { return ''; } };
  const sfx = (n, fb) => { try { if (!(window.SFX && SFX.play(n))) fb && fb(); } catch (e) { } };
  /* ---------- 樣式 ---------- */
  const st = document.createElement('style');
  st.textContent = `
#bf113{position:fixed;inset:0;z-index:99970;display:none;flex-direction:column;color:#f6efe0;font-family:inherit;background:#0f0b08 center/cover no-repeat;user-select:none;-webkit-user-select:none;touch-action:manipulation;overflow:hidden;overflow:clip}
#bf113.on{display:flex}
#bf113::before{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(8,5,3,.55),rgba(8,5,3,.15) 35%,rgba(8,5,3,.35) 62%,rgba(8,5,3,.92));pointer-events:none}
#bf113>*{position:relative}
#bf113 .tp{padding:calc(env(safe-area-inset-top,0px) + 10px) 14px 6px}
#bf113 .tp .nm{display:flex;align-items:baseline;gap:8px;font-weight:900;font-size:17px;letter-spacing:2px;text-shadow:0 2px 6px #000}
#bf113 .tp .nm small{font-size:11px;font-weight:600;letter-spacing:1px;opacity:.8}
#bf113 .tp .st{margin-left:auto;font-size:11px;font-weight:800;color:#fbbf24}
.bf-bar{position:relative;height:12px;border-radius:7px;background:rgba(0,0,0,.55);border:1px solid rgba(255,255,255,.25);overflow:hidden;margin-top:5px}
.bf-bar i{position:absolute;left:0;top:0;bottom:0;border-radius:7px;transition:width .35s}
.bf-bar b{position:absolute;top:0;bottom:0;width:2px;background:rgba(255,255,255,.7)}
.bf-bar .lag{background:rgba(255,255,255,.35);transition:width .9s .25s}
#bf-eh i.v{background:linear-gradient(90deg,#7f1d1d,#dc2626,#f87171)}
#bf-ph i.v{background:linear-gradient(90deg,#065f46,#10b981,#6ee7b7)}
#bf-ph i.sh{background:rgba(147,197,253,.65)}
.bf-hpt{display:flex;justify-content:space-between;font-size:11px;margin-top:2px;opacity:.9}
#bf113 .stg{flex:1;min-height:0;position:relative;overflow:hidden;overflow:clip}
#bf113,#bf113 *{-webkit-touch-callout:none}
#bf113 .stg img{position:absolute;object-fit:contain;object-position:bottom;filter:drop-shadow(0 6px 10px rgba(0,0,0,.6));transition:transform .18s;pointer-events:none;-webkit-user-drag:none}
/* 站位(參考 Pokémon GO 對戰):主角在前景左下、背對鏡頭;敵人在場地中後方 */
#bf-gd{position:absolute;left:41%;width:50%;height:8%;bottom:39%;border-radius:50%;background:radial-gradient(ellipse,rgba(0,0,0,.5),rgba(0,0,0,.15) 60%,transparent 72%);box-shadow:0 0 0 2px rgba(255,255,255,.18) inset}
#bf-ei{left:47%;width:53%;height:44%;bottom:42%;z-index:1}
#bf-pi{left:19%;width:auto!important;max-width:none!important;height:92%;bottom:-20%;z-index:2;transform:translateX(-50%);transform-origin:0% 100%;transition:translate .18s ease-out}
#bf-pi.chg{filter:drop-shadow(0 0 10px var(--uc,#bfe3ff)) drop-shadow(0 0 22px var(--uc,#bfe3ff));animation:bfChg .5s infinite alternate}
@keyframes bfChg{from{filter:drop-shadow(0 0 6px var(--uc,#bfe3ff))}to{filter:drop-shadow(0 0 18px var(--uc,#bfe3ff)) drop-shadow(0 0 30px var(--uc,#bfe3ff))}}
.bfx{position:absolute;pointer-events:none;z-index:20}
#bf-ucut{position:absolute;inset:0;z-index:55;overflow:hidden;background:rgba(0,0,0,.35);animation:ucIn .15s}
#bf-ucut.out{animation:ucOut .25s forwards}
@keyframes ucIn{from{opacity:0}}@keyframes ucOut{to{opacity:0}}
#bf-ucut .band{position:absolute;left:-10%;right:-10%;top:30%;height:34%;transform:skewY(-9deg);background:linear-gradient(90deg,rgba(10,6,3,.95),rgba(30,20,10,.92) 55%,color-mix(in srgb,var(--uc) 45%,#000));border-top:3px solid var(--uc);border-bottom:3px solid var(--uc);box-shadow:0 0 30px var(--uc);animation:ucBand .3s cubic-bezier(.2,.9,.3,1)}
@keyframes ucBand{from{transform:skewY(-9deg) scaleY(0)}to{transform:skewY(-9deg) scaleY(1)}}
#bf-ucut .lines{position:absolute;inset:0;background:repeating-linear-gradient(90deg,transparent 0 22px,rgba(255,255,255,.18) 22px 24px);animation:ucLines .5s linear infinite;opacity:.8}
@keyframes ucLines{from{background-position:0 0}to{background-position:-240px 0}}
#bf-ucut img{position:absolute;left:-16%;top:20%;height:44%;max-width:none;filter:drop-shadow(0 0 16px var(--uc));-webkit-mask-image:linear-gradient(to bottom,#000 72%,transparent 98%);mask-image:linear-gradient(to bottom,#000 72%,transparent 98%);animation:ucImg 1.5s cubic-bezier(.15,.9,.3,1) forwards}
@keyframes ucImg{0%{transform:translateX(-60%);opacity:0}18%{transform:translateX(0);opacity:1}100%{transform:translateX(6%)}}
#bf-ucut .tx{position:absolute;right:5%;top:50%;text-align:right;transform:skewY(-9deg);animation:ucTx 1.5s cubic-bezier(.15,.9,.3,1) forwards}
@keyframes ucTx{0%{transform:skewY(-9deg) translateX(70%);opacity:0}22%{transform:skewY(-9deg) translateX(0);opacity:1}100%{transform:skewY(-9deg) translateX(-5%)}}
#bf-ucut .s{font-size:13px;font-weight:800;letter-spacing:6px;color:var(--uc)}
#bf-ucut .n{font-size:40px;line-height:1.1;font-weight:900;letter-spacing:6px;font-family:'Noto Serif TC',serif;color:#fff;text-shadow:0 0 18px var(--uc),2px 2px 0 #000,-2px 2px 0 #000}
#bf-ucut .fl{position:absolute;inset:0;background:#fff;animation:ucFl .35s ease-out forwards;pointer-events:none}
@keyframes ucFl{from{opacity:.8}to{opacity:0}}
.fx-star{width:200px;height:200px;margin:-100px 0 0 -100px;background:radial-gradient(circle,#fff 0 22%,var(--c) 38%,transparent 62%);clip-path:polygon(50% 0,58% 36%,100% 30%,64% 52%,88% 96%,50% 68%,12% 96%,36% 52%,0 30%,42% 36%);animation:fxStar .36s ease-out forwards}
@keyframes fxStar{from{transform:scale(.3);opacity:1}to{transform:scale(1.3);opacity:0}}
.fx-hitflash{width:260px;height:260px;margin:-130px 0 0 -130px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.95),color-mix(in srgb,var(--c) 60%,transparent) 40%,transparent 70%);animation:fxHF .26s ease-out forwards}
@keyframes fxHF{from{transform:scale(.5);opacity:1}to{transform:scale(1.2);opacity:0}}
.fx-shard{width:10px;height:22px;margin:-11px 0 0 -5px;background:linear-gradient(#fff,var(--c));clip-path:polygon(50% 0,100% 100%,0 100%)}
.fx-speed{left:0!important;top:0!important;width:100%;height:100%;background:repeating-conic-gradient(from 0deg at 62% 38%,rgba(255,255,255,.55) 0 1.2deg,transparent 1.2deg 9deg);-webkit-mask:radial-gradient(circle at 62% 38%,transparent 18%,#000 60%);mask:radial-gradient(circle at 62% 38%,transparent 18%,#000 60%);animation:fxSpd .7s ease-out forwards}
@keyframes fxSpd{from{opacity:1}to{opacity:0}}
.fx-go{font-size:118px;line-height:1;font-weight:900;font-family:'Noto Serif TC','Songti TC',serif;color:#fde68a;text-shadow:3px 3px 0 #7c2d12,-3px 3px 0 #7c2d12,3px -3px 0 #7c2d12,-3px -3px 0 #7c2d12,0 8px 0 #7c2d12,0 0 34px #f59e0b;white-space:nowrap;transform:translate(-50%,-50%);animation:fxGo 1.2s cubic-bezier(.2,1.5,.4,1) forwards;z-index:46}
@keyframes fxGo{0%{transform:translate(-50%,-50%) scale(3);opacity:0}20%{transform:translate(-50%,-50%) scale(1);opacity:1}75%{opacity:1}100%{transform:translate(-50%,-50%) scale(1.1);opacity:0}}
.fx-goring{width:120px;height:120px;margin:-60px 0 0 -60px;border-radius:50%;border:6px solid #fff;animation:fxGoR .9s .15s ease-out forwards;opacity:0;z-index:45}
@keyframes fxGoR{from{transform:scale(.5);opacity:1}to{transform:scale(5);opacity:0}}
.fx-arc{width:190px;height:190px;margin:-95px 0 0 -95px;border-radius:50%;border-top:9px solid var(--c);filter:drop-shadow(0 0 10px var(--c));animation:fxArc .4s ease-out forwards}
@keyframes fxArc{from{transform:rotate(-70deg) scale(.6);opacity:1}to{transform:rotate(50deg) scale(1.15);opacity:0}}
.fx-tal{width:30px;height:52px;margin:-26px 0 0 -15px;background:center/contain no-repeat;filter:drop-shadow(0 0 6px var(--c)) drop-shadow(0 0 2px #fff)}
.fx-sky{top:0!important;width:64px;margin-left:-32px;transform-origin:50% 0;background:linear-gradient(90deg,transparent,color-mix(in srgb,var(--c) 55%,transparent) 30%,#fff 47%,#fff 53%,color-mix(in srgb,var(--c) 55%,transparent) 70%,transparent);-webkit-mask-image:linear-gradient(180deg,transparent,#000 35%,#000 92%,transparent);mask-image:linear-gradient(180deg,transparent,#000 35%,#000 92%,transparent);filter:blur(1.5px) drop-shadow(0 0 12px var(--c));mix-blend-mode:screen;animation:fxSky .38s ease-in forwards}
.fx-sky.big{width:150px;margin-left:-75px;animation-duration:.52s}
@keyframes fxSky{0%{transform:scaleY(0);opacity:1}55%{transform:scaleY(1);opacity:1}100%{transform:scaleY(1);opacity:0}}
.fx-bolt{width:110px;height:7px;margin:-3px 0 0 0;transform-origin:left center;border-radius:4px;background:linear-gradient(90deg,transparent,var(--c) 45%,#fff);box-shadow:0 0 12px var(--c)}
.fx-aura{width:220px;height:220px;margin:-110px 0 0 -110px;border-radius:50%;animation:fxAura .9s ease-out forwards}
.fx-aura.sh{border:4px solid rgba(147,197,253,.9);background:radial-gradient(circle,rgba(147,197,253,.05) 55%,rgba(147,197,253,.35))}
.fx-aura.hl{background:radial-gradient(circle,rgba(110,231,183,.55),transparent 65%)}
.fx-aura.bf{background:radial-gradient(circle,rgba(248,113,113,.55),transparent 65%)}
@keyframes fxAura{from{transform:scale(.4);opacity:0}30%{opacity:1}to{transform:scale(1.25);opacity:0}}
.fx-burst{width:300px;height:300px;margin:-150px 0 0 -150px;border-radius:50%;background:radial-gradient(circle,#fff 0,var(--c) 25%,transparent 65%);animation:fxBurst .8s ease-out forwards}
@keyframes fxBurst{from{transform:scale(.2);opacity:1}to{transform:scale(2.2);opacity:0}}
.fx-flash{left:0!important;top:0!important;width:100%;height:100%;background:var(--c);mix-blend-mode:screen;animation:fxFlash .6s ease-out forwards}
@keyframes fxFlash{from{opacity:.75}to{opacity:0}}
#bf-ei.bffl{transform:scaleX(-1)}
#bf-ei.hit{animation:bfHit .35s}#bf-ei.bffl.hit{animation:bfHitF .35s}
#bf-pi.hit{animation:bfHit .35s}
#bf-ei.charge{filter:drop-shadow(0 0 14px #f97316) drop-shadow(0 0 4px #fde68a)}
@keyframes bfHit{0%,100%{translate:0}25%{translate:12px}50%{translate:-8px}75%{translate:5px}}
@keyframes bfHitF{0%,100%{translate:0}25%{translate:12px}50%{translate:-8px}75%{translate:5px}}
#bf113.shake{animation:bfShake .4s}
@keyframes bfShake{0%,100%{transform:none}20%{transform:translate(-6px,3px)}40%{transform:translate(6px,-3px)}60%{transform:translate(-4px,2px)}80%{transform:translate(3px,-1px)}}
.bf-num{position:absolute;font-weight:900;font-size:26px;text-shadow:0 2px 4px #000,0 0 10px rgba(0,0,0,.6);pointer-events:none;animation:bfNum 1s forwards;white-space:nowrap}
.bf-num.cr{font-size:34px;color:#fde047}.bf-num.hl{color:#6ee7b7}.bf-num.pd{color:#fca5a5}.bf-num.tx{font-size:22px;color:#fff}
@keyframes bfNum{0%{opacity:0;transform:translate(-50%,10px) scale(.7)}15%{opacity:1;transform:translate(-50%,-4px) scale(1.15)}30%{transform:translate(-50%,-10px) scale(1)}100%{opacity:0;transform:translate(-50%,-60px)}}
#bf-log{min-height:20px;text-align:center;font-size:12px;padding:2px 12px;text-shadow:0 1px 3px #000}
#bf113 .bt{padding:6px 10px calc(env(safe-area-inset-bottom,0px) + 8px);background:linear-gradient(180deg,rgba(14,9,5,.75),rgba(14,9,5,.95));z-index:41}
#bf-cmd{position:absolute;left:0;right:0;bottom:46px;height:auto;max-height:72%;z-index:40;display:flex;gap:4px;padding:36px 10px 8px;background:linear-gradient(180deg,rgba(14,9,5,0),rgba(14,9,5,.86) 12%,rgba(14,9,5,.97));transform:translateY(120%);transition:transform .34s cubic-bezier(.3,.9,.3,1);pointer-events:none}
#bf113.cmd #bf-cmd{transform:none;pointer-events:auto}
#bf113 .stg::after{content:'';position:absolute;inset:0;background:rgba(6,4,2,.62);opacity:0;transition:opacity .3s;z-index:6;pointer-events:none}
#bf113.cmd .stg::after{opacity:1}
#bf113.cmd #bf-log{opacity:0}
#bf113.cmd #bf-pi{opacity:0;transition:opacity .2s}
#bf-cmd .pt{width:40%;position:relative;flex:none;overflow:hidden;margin:-36px 0 -8px -10px;border-radius:0 14px 0 0}
#bf-cmd .pt img.cp{inset:0;width:100%;height:100%;object-fit:cover;object-position:82% 0}
#bf-cmd .pt img{position:absolute;top:4px;left:-76%;width:200%;height:auto;max-width:none;-webkit-mask-image:linear-gradient(to bottom,#000 70%,transparent);mask-image:linear-gradient(to bottom,#000 70%,transparent);filter:drop-shadow(0 0 10px rgba(0,0,0,.6));pointer-events:none}
#bf-cmd .pt img.hurt{filter:drop-shadow(0 0 10px rgba(220,38,38,.7)) saturate(.8)}
#bf-cmd .ls{flex:1;min-width:0;overflow:visible;overscroll-behavior:contain;padding:2px 2px 4px}
#bf-acts{display:flex!important;flex-direction:column;gap:5px;height:auto!important;margin:0!important}
#bf-acts .row{display:flex;align-items:center;gap:8px;width:100%;padding:4px 8px;border-radius:10px;text-align:left;color:#f6efe0;background:linear-gradient(90deg,rgba(255,244,214,.16),rgba(255,244,214,.05));border:1px solid rgba(214,181,106,.6);box-shadow:0 2px 6px rgba(0,0,0,.4)}
#bf-acts .row .ic{width:30px;height:30px;flex:none;border-radius:8px;overflow:hidden;display:flex;align-items:center;justify-content:center;background:#2a1a0c;font-size:20px}
#bf-acts .row .ic img,#bf-acts .row .ic svg{width:100%;height:100%;object-fit:cover}
#bf-acts .row .t{flex:1;min-width:0;display:flex;flex-direction:column}
#bf-acts .row .n{font-weight:900;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#bf-acts .row .n em{font-style:normal;font-weight:800;margin-left:3px;color:#fca5a5}
#bf-acts .row .d{font-size:10px;opacity:.75;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#bf-acts .row.atk{border-color:rgba(248,113,113,.8);background:linear-gradient(90deg,rgba(185,28,28,.45),rgba(185,28,28,.1))}
#bf-acts .row.ult{position:relative;overflow:hidden;padding:8px 10px;border:2px solid #fde68a;background:linear-gradient(100deg,#78350f,#b45309 35%,#f59e0b 50%,#b45309 65%,#78350f);background-size:220% 100%;animation:bfFlow 2.4s linear infinite;box-shadow:0 0 16px rgba(245,158,11,.75)}
#bf-acts .row.ult .ic{width:40px;height:40px;font-size:26px;background:radial-gradient(circle,#fff7cc,#f59e0b);animation:bfPulse 1.2s ease-in-out infinite}
#bf-acts .row.ult .n{font-size:16px;color:#fff;text-shadow:0 0 8px #f59e0b,0 1px 2px #000}
#bf-acts .row.ult::after{content:'';position:absolute;top:0;bottom:0;width:40%;left:-50%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.5),transparent);transform:skewX(-20deg);animation:bfShine 2.2s ease-in-out infinite}
@keyframes bfFlow{from{background-position:0 0}to{background-position:220% 0}}
@keyframes bfPulse{0%,100%{box-shadow:0 0 4px #fde68a}50%{box-shadow:0 0 16px #fde68a}}
@keyframes bfShine{0%{left:-50%}60%,100%{left:130%}}
#bf-acts .row[disabled]{filter:grayscale(1);opacity:.5;animation:none;box-shadow:none}
#bf-acts .row[disabled]::after,#bf-acts .row[disabled] .ic{animation:none}
#bf-acts .row:active:not([disabled]){transform:scale(.97)}
#bf-cmd .auto,#bf-auto2{position:absolute;right:10px;top:2px;padding:4px 12px;border-radius:12px;font-size:11px;font-weight:800;border:1px solid rgba(255,255,255,.4);background:rgba(0,0,0,.5);color:#f6efe0;z-index:2}
#bf-auto2{top:auto;bottom:62px;z-index:42}
#bf-cmd .auto.run{right:auto;left:auto;right:86px}
#bf-cmd .auto.run.ask{background:#b91c1c;border-color:#fca5a5;color:#fff}
#bf-cmd .auto.on,#bf-auto2.on{background:#f59e0b;color:#3b2510;border-color:#fde68a}
#bf-acts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin-top:8px}
#bf-acts button{position:relative;min-width:0;padding:9px 4px;border-radius:12px;font-weight:900;font-size:13px;color:#3b2510;background:linear-gradient(180deg,#fbf1d8,#e8d1a0);border:1px solid #b07d1a;box-shadow:0 3px 0 #8a5a12;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#bf-acts button.atk{background:linear-gradient(180deg,#f87171,#b91c1c);color:#fff;border-color:#7f1d1d;box-shadow:0 3px 0 #7f1d1d}
#bf-acts button.ult{grid-column:span 2;background:linear-gradient(180deg,#fde68a,#f59e0b);border-color:#92400e;box-shadow:0 3px 0 #92400e}
#bf-acts button[disabled]{filter:grayscale(.85);opacity:.55;box-shadow:none}
#bf-acts button .cd{position:absolute;right:5px;top:3px;font-size:10px;background:#3b2510;color:#fff;border-radius:8px;padding:0 5px}
#bf-acts button:active:not([disabled]){transform:translateY(2px);box-shadow:none}
.bf-row{display:flex;align-items:center;gap:8px;font-size:11px}
/* v121 操作盤:右下大普攻鍵,神通圓鈕環繞,本命絕學金色大鈕;左側丹藥、自動 */
#bf-acts{display:block!important;position:relative;height:178px;margin-top:6px}
#bf-acts .b{position:absolute;display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:50%;padding:0!important;font-weight:900;color:#fff;background:radial-gradient(circle at 35% 30%,#4a3a2a,#1f150c);border:2px solid #d6b56a;box-shadow:0 4px 10px rgba(0,0,0,.6),inset 0 0 10px rgba(253,230,138,.25);overflow:visible;white-space:normal}
#bf-acts .b .ic{width:70%;height:70%;border-radius:50%;overflow:hidden;display:flex;align-items:center;justify-content:center}
#bf-acts .b .ic img,#bf-acts .b .ic svg{width:100%;height:100%;object-fit:cover}
#bf-acts .b .lb{position:absolute;bottom:-15px;left:50%;transform:translateX(-50%);font-size:10px;font-weight:800;white-space:nowrap;color:#f6efe0;text-shadow:0 1px 2px #000}
#bf-acts .b.atk{width:86px;height:86px;right:6px;bottom:18px;background:radial-gradient(circle at 35% 30%,#f87171,#991b1b);border-color:#fecaca;font-size:30px;font-family:'Noto Serif TC',serif}
#bf-acts .b.atk small{font-size:10px;font-family:inherit;margin-top:-2px}
#bf-acts .b.sk{width:56px;height:56px}
#bf-acts .b.ult{width:72px;height:72px;background:radial-gradient(circle at 35% 30%,#fde68a,#b45309);border-color:#fff7cc;color:#3b2510;font-size:24px;font-family:'Noto Serif TC',serif;animation:bfUlt 1.4s infinite}
@keyframes bfUlt{0%,100%{box-shadow:0 0 6px #fbbf24,0 4px 10px rgba(0,0,0,.6)}50%{box-shadow:0 0 22px #fbbf24,0 4px 10px rgba(0,0,0,.6)}}
#bf-acts .b.sm{width:46px;height:46px;font-size:18px}
#bf-acts .b[disabled]{filter:grayscale(.9) brightness(.7);animation:none}
#bf-acts .b .cd{position:absolute;inset:0;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:900;color:#fff;background:rgba(0,0,0,.45);text-shadow:0 1px 3px #000}
#bf-acts .b:active:not([disabled]){transform:scale(.92)}
#bf-acts .auto{position:absolute;left:4px;top:4px;padding:5px 12px;border-radius:12px;font-size:11px;font-weight:800;border:1px solid rgba(255,255,255,.4);background:rgba(0,0,0,.4);color:#f6efe0}
#bf-acts .auto.on{background:#f59e0b;color:#3b2510;border-color:#fde68a}
#bf113.scr #bf-auto,#bf113.scr #bf-run,#bf113.scr #bf-auto2{display:none!important}
#bf-acts .row.lk{opacity:.32;filter:grayscale(.8)}
#bf-acts .row.gd{box-shadow:0 0 0 2px #fde68a,0 0 14px rgba(253,230,138,.85);animation:bfGd 1s ease-in-out infinite alternate}
@keyframes bfGd{from{box-shadow:0 0 0 2px #fde68a,0 0 6px rgba(253,230,138,.5)}to{box-shadow:0 0 0 3px #fff3c4,0 0 18px rgba(253,230,138,1)}}
#bf-gtip{position:absolute;left:50%;transform:translateX(-50%);bottom:calc(100% + 8px);width:min(92%,380px);padding:8px 12px;border-radius:12px;background:rgba(255,250,235,.96);color:#3b2a14;font-size:13px;font-weight:700;line-height:1.5;text-align:center;box-shadow:0 4px 16px rgba(0,0,0,.4);display:none;pointer-events:none;z-index:5}
#bf-gtip.on{display:block}
#bf-tap{position:absolute;inset:0;z-index:60;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.45)}
#bf-tap.on{display:flex}
#bf-tap .bx{width:min(86%,360px);padding:16px 18px 12px;border-radius:14px;background:radial-gradient(ellipse at 50% 0,#fbf8ef,#efe6d2 70%,#e5d9bd);color:#2a241c;box-shadow:0 8px 30px rgba(0,0,0,.5);font-size:14.5px;line-height:1.7}
#bf-tap .bx b{color:#9e2b25}
#bf-tap .bx .nx{margin-top:8px;text-align:right;font-size:12px;color:#8a7a62}
#bf-auto{margin-left:auto;padding:4px 10px;border-radius:9px;font-weight:800;font-size:11px;border:1px solid rgba(255,255,255,.4);background:rgba(0,0,0,.35);color:#f6efe0}
#bf-auto.on{background:#f59e0b;color:#3b2510;border-color:#fde68a}
/* QTE */
#bf-q{position:absolute;inset:0;z-index:30;display:none;touch-action:none}
#bf-q.on{display:block}
.bf-qhint{position:absolute;left:0;right:0;top:8%;text-align:center;font-weight:900;font-size:16px;text-shadow:0 2px 6px #000;letter-spacing:2px}
.bf-track{position:absolute;left:12%;right:12%;top:46%;height:40px;z-index:0}
.bf-track::before{content:'';position:absolute;left:-10.3%;width:120.6%;top:-73.6%;height:242%;background:var(--qt-track) center/100% 100% no-repeat;z-index:-1;filter:drop-shadow(0 4px 8px rgba(0,0,0,.6))}
.bf-track .g{position:absolute;top:4%;bottom:4%;background:var(--qt-zone) center/100% 100% no-repeat}
.bf-track .p{position:absolute;top:22%;bottom:22%;border-radius:12px;background:linear-gradient(90deg,#fde68a,#f59e0b,#fde68a);box-shadow:0 0 8px #fde68a}
.bf-track .n{position:absolute;top:-62%;height:170%;width:26px;margin-left:-13px;background:var(--qt-needle) center/contain no-repeat;filter:drop-shadow(0 0 4px #fff)}
.bf-dot{position:absolute;width:84px;height:84px;margin:-42px 0 0 -42px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:30px;color:#1f4d3a;text-shadow:0 1px 0 #fff,0 0 6px #fff;background:var(--qt-dot) center/contain no-repeat;filter:drop-shadow(0 3px 8px rgba(0,0,0,.6)) drop-shadow(0 0 10px rgba(253,230,138,.7));animation:bfPop .25s}
.bf-dot.done{animation:bfGone .3s forwards}
@keyframes bfPop{from{transform:scale(.2);opacity:0}to{transform:none;opacity:1}}
@keyframes bfGone{to{transform:scale(1.8);opacity:0}}
.bf-time{position:absolute;left:10%;right:10%;bottom:6%;height:6px;border-radius:3px;background:rgba(255,255,255,.2);overflow:hidden}.bf-time i{position:absolute;inset:0;background:#fbbf24;transform-origin:left}
.bf-tg{position:absolute;left:26%;top:66%;width:104px;height:104px;margin:-52px 0 0 -52px;border-radius:50%;background:var(--qt-sh) center/100% 100% no-repeat;filter:drop-shadow(0 3px 8px rgba(0,0,0,.6))}
.bf-tg.pf{background:none;filter:drop-shadow(0 0 12px #fff6c8) brightness(1.08);animation:bfTgPf .16s ease-out}
.bf-tg.pf::before{content:'';position:absolute;inset:-26.3px;background:var(--qt-sh2) center/contain no-repeat}
@keyframes bfTgPf{from{transform:scale(1.18)}to{transform:scale(1)}}
.bf-tg.brk{animation:bfTgBrk .3s ease-out forwards}
@keyframes bfTgBrk{0%{transform:translateX(0)}25%{transform:translateX(-7px)}50%{transform:translateX(6px)}75%{transform:translateX(-3px)}100%{transform:none;filter:grayscale(1) brightness(.6)}}
.bf-ring{position:absolute;left:26%;top:66%;width:104px;height:104px;margin:-52px 0 0 -52px;border-radius:50%;box-sizing:border-box;border:3px solid #ff4d4d;box-shadow:0 0 10px #ef4444,inset 0 0 6px rgba(239,68,68,.6);pointer-events:none}
.bf-ring.brk{animation:bfRingBrk .3s ease-out forwards}
@keyframes bfRingBrk{to{opacity:0;border-style:dashed;filter:blur(1px)}}
.bf-hold{position:absolute;left:50%;top:56%;width:200px;height:200px;margin:-100px 0 0 -100px;border-radius:50%;display:flex;align-items:center;justify-content:center}
.bf-hold::before{content:'';position:absolute;inset:4px;border-radius:50%;background:conic-gradient(#fbbf24 var(--v,0%),rgba(0,0,0,.55) 0);-webkit-mask:radial-gradient(circle,transparent 78px,#000 79px);mask:radial-gradient(circle,transparent 78px,#000 79px)}
.bf-hold::after{content:'';position:absolute;inset:0;background:var(--qt-holdring) center/contain no-repeat;pointer-events:none;filter:drop-shadow(0 0 8px rgba(0,0,0,.6))}
.bf-hold span{position:relative;z-index:3;width:160px;height:160px;font-size:18px!important;border-radius:50%;background:var(--qt-hold) center/contain no-repeat;color:#3b2510;text-shadow:0 0 6px #fff,0 0 3px #fff;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:15px;text-align:center;line-height:1.3}
.bf-hold .z{position:absolute;z-index:2;inset:-3px;border-radius:50%;background:conic-gradient(transparent 0 306deg,rgba(253,224,71,.85) 306deg 352deg,transparent 352deg);pointer-events:none;-webkit-mask:radial-gradient(circle,transparent 82px,#000 83px);mask:radial-gradient(circle,transparent 82px,#000 83px)}
.bf-res{position:absolute;left:50%;top:40%;transform:translateX(-50%);font-weight:900;font-size:34px;letter-spacing:4px;text-shadow:0 0 12px #000,0 2px 0 #000;animation:bfNum 1.1s forwards;pointer-events:none;z-index:40}
.bf-res.pf{color:#fde047}
.bf-res .bu{position:absolute;left:50%;top:50%;width:260px;height:260px;margin:-130px 0 0 -130px;background:var(--qt-burst) center/contain no-repeat;z-index:-1;animation:bfBurst .7s ease-out forwards}
@keyframes bfBurst{from{transform:scale(.3) rotate(0);opacity:1}to{transform:scale(1.3) rotate(25deg);opacity:0}}.bf-res.gd{color:#6ee7b7}.bf-res.ms{color:#fca5a5}
/* 過場 */
#bf-cut{position:absolute;inset:0;z-index:50;display:none;align-items:flex-end;background:rgba(0,0,0,.55)}
#bf-cut.on{display:flex}
#bf-cut img{position:absolute;bottom:20%;right:-4%;height:72%;max-width:80%;object-fit:contain;animation:bfIn .45s ease-out;filter:drop-shadow(0 0 20px rgba(0,0,0,.8))}
#bf-cut img.l{right:auto;left:-4%;animation-name:bfInL}
@keyframes bfIn{from{transform:translateX(40%);opacity:0}to{transform:none;opacity:1}}
@keyframes bfInL{from{transform:translateX(-40%);opacity:0}to{transform:none;opacity:1}}
#bf-cut .cap{position:relative;width:100%;padding:16px 18px 30px;background:linear-gradient(0deg,rgba(10,6,3,.95),rgba(10,6,3,.75) 70%,transparent)}
#bf-cut .big{font-size:30px;font-weight:900;letter-spacing:6px;color:#fde68a;text-shadow:0 2px 8px #000}
#bf-cut .sub{font-size:12px;opacity:.8;letter-spacing:2px}
#bf-cut .say{margin-top:8px;font-size:15px;line-height:1.6}
#bf-cut .tap{position:absolute;right:16px;bottom:10px;font-size:11px;opacity:.6}
#bf-sk{position:absolute;left:0;right:0;top:34%;z-index:45;text-align:center;font-size:34px;font-weight:900;letter-spacing:8px;color:#fff;text-shadow:0 0 16px #f59e0b,0 2px 0 #000;pointer-events:none;opacity:0}
#bf-sk.go{animation:bfSk 1s forwards}
@keyframes bfSk{0%{opacity:0;transform:scale(1.6)}20%{opacity:1;transform:scale(1)}75%{opacity:1}100%{opacity:0}}
#bf-end{position:absolute;inset:0;z-index:60;display:none;flex-direction:column;align-items:center;justify-content:center;gap:12px;background:rgba(0,0,0,.72)}
#bf-end.on{display:flex}
#bf-end .stamp{font-size:96px;font-weight:900;line-height:1;animation:bfStamp .5s cubic-bezier(.2,1.6,.4,1)}
#bf-end .stamp.w{color:#fde68a;text-shadow:0 0 30px #f59e0b}#bf-end .stamp.l{color:#fca5a5;text-shadow:0 0 30px #7f1d1d}
@keyframes bfStamp{from{transform:scale(3);opacity:0}to{transform:none;opacity:1}}
#bf-end .say{max-width:82%;text-align:center;font-size:14px;line-height:1.6}
#bf-end .bts{display:flex;gap:10px;margin-top:6px}
#bf-end button{padding:10px 22px;border-radius:12px;font-weight:900;color:#3b2510;background:linear-gradient(180deg,#fbf1d8,#e8d1a0);border:1px solid #b07d1a}
`;
  document.head.appendChild(st);
  /* ---------- 介面骨架 ---------- */
  const root = document.createElement('div'); root.id = 'bf113';
  try { const Q = window.QT124 || {}; Object.keys(Q).forEach(k => root.style.setProperty('--qt-' + k, `url(${Q[k]})`)); } catch (e) { }
  root.innerHTML = `<div class="tp"><div class="nm"><span id="bf-en"></span><small id="bf-el"></small><span class="st" id="bf-es"></span></div>
<div class="bf-bar" id="bf-eh"><i class="lag"></i><i class="v"></i></div><div class="bf-hpt"><span id="bf-ph2"></span><span id="bf-et"></span></div></div>
<div class="stg" id="bf-stg"><div id="bf-gd"></div><img id="bf-ei" alt="" draggable="false"><img id="bf-pi" alt="" draggable="false"><div id="bf-sk"></div><div id="bf-q"></div></div>
<div id="bf-log"></div>
<div id="bf-tap"><div class="bx"><div class="tx"></div><div class="nx">點一下繼續 ▸</div></div></div><div id="bf-cmd"><div id="bf-gtip"></div><div class="pt"><img id="bf-cp" alt="" draggable="false"></div><div class="ls"><div id="bf-acts"></div></div><button id="bf-auto" class="auto">自動:關</button><button id="bf-run" class="auto run">逃離</button></div>
<button id="bf-auto2" class="auto on">自動:開</button>
<div class="bt"><div class="bf-row"><b>道友</b><span id="bf-pt"></span></div>
<div class="bf-bar" id="bf-ph"><i class="lag"></i><i class="v"></i><i class="sh"></i></div></div>
<div id="bf-cut"><img alt=""><div class="cap"><div class="sub"></div><div class="big"></div><div class="say"></div><div class="tap">點擊繼續</div></div></div>
<div id="bf-end"></div>`;
  document.body.appendChild(root);
  root.addEventListener('contextmenu', e => e.preventDefault());   /* 長按不跳出「下載圖片」選單 */
  root.addEventListener('selectstart', e => e.preventDefault());
  /* ---------- 狀態 ---------- */
  let B = null;
  const on = () => !!B;
  const setBar = (id, v, sh) => { const b = $(id); if (!b) return; const w = Math.max(0, Math.min(100, v * 100)) + '%'; b.querySelector('.v').style.width = w; b.querySelector('.lag').style.width = w; const s = b.querySelector('.sh'); if (s) s.style.width = Math.min(100, (sh || 0) * 100) + '%'; };
  function ui() {
    if (!B) return;
    setBar('bf-eh', B.e.hp / B.e.max); setBar('bf-ph', B.p.hp / B.p.max, B.p.sh / B.p.max);
    $('bf-et').textContent = `${fm(B.e.hp)} / ${fm(B.e.max)}`; $('bf-pt').textContent = `${fm(B.p.hp)} / ${fm(B.p.max)}${B.p.sh > 0 ? `(🛡${fm(B.p.sh)})` : ''}`;
    $('bf-ph2').textContent = ['', '', '第二階段', '最終階段'][B.phase] || '';
    const s = []; if (B.e.charge) s.push('⚠ 蓄力中'); if (B.e.stun) s.push('💫 暈眩'); if (B.e.dot) s.push('🔥 灼燒'); if (B.p.buff) s.push('💢 戰意');
    $('bf-es').textContent = s.join(' '); $('bf-ei').classList.toggle('charge', !!B.e.charge);
    acts(); cmdUi();
  }
  function acts() {
    const box = $('bf-acts'); if (!box || !B) return; const lock = B.busy || B.auto;
    /* v124 選招面板:本命絕學(大格)→ 普攻 → 神通 → 回春丹 */
    const DS = k => { const c = k.c, t = k.sk.type; return t === 'atk' ? ((c.hits || 1) > 1 ? `${c.hits} 連擊` : '強力一擊') : { burn: '灼燒・持續傷害', stun: '暈眩・打斷蓄力', shield: '護盾', heal: '回血', drain: '吸血', buff: '提升攻擊' }[t] || ''; };
    const row = (cls, attr, ic, n, d, cd, dis) => `<button class="row ${cls}" ${attr} ${dis ? 'disabled' : ''}><span class="ic">${ic}</span><span class="t"><span class="n">${n}${cd > 0 ? `<em>(${cd})</em>` : ''}</span><span class="d">${d}</span></span></button>`;
    let rs = '';
    if (B.ult) { const cd = B.cd.ULT || 0; rs += row('ult', 'data-bf="ult"', `<b>${B.ult.ic}</b>`, `本命絕學・${B.ult.n}`, cd > 0 ? `尚需 ${cd} 回合` : '按住蓄力,全力一擊', cd, lock || cd > 0); }
    rs += row('atk', 'data-bf="atk"', '<b>⚔</b>', ATKN()[0], ATKN()[1], 0, lock);
    B.sk.forEach((k, i) => { const cd = B.cd[k.id] || 0; let ic = ''; try { ic = skArt(k.id, false); } catch (e) { } rs += row('sk', `data-bf="sk" data-i="${i}"`, ic, k.sk.name, DS(k), cd, lock || cd > 0); });
    if (B.A && B.A.wine) rs += row('pill', 'data-bf="wine"', (ITEMS.pill_4 && ITEMS.pill_4.icon) || '<b>🍶</b>', '酒葫蘆', '仰頭灌一口・回復 50% 氣血', 0, lock || B.A.wineUsed);
    if (!B.A) { const pl = (state.inventory.pill_4 || 0); rs += row('pill', 'data-bf="pill"', '<b>💊</b>', `回春丹 ×${pl > 99 ? '99+' : pl}`, `回復 35% 氣血・本場還能服 ${2 - B.pillUsed} 顆`, 0, lock || !pl || B.pillUsed >= 2);
    }
    if (B.G) { const al = B.G.allow || []; rs = rs.replace(/<button class="row ([a-z]+)" data-bf="([a-z]+)"([^>]*)>/g, (m, c, k, rest) => al.includes(k) ? `<button class="row ${c} gd" data-bf="${k}"${rest}>` : `<button class="row ${c} lk" data-bf="${k}"${rest.replace(/ disabled/, '')} disabled>`); }
    if (box.dataset.h !== rs) { box.dataset.h = rs; box.innerHTML = rs; }
    const tp = $('bf-gtip'); if (tp) { const t = B.G && !B.busy && !B.over ? B.G.tip || '' : ''; tp.textContent = t; tp.classList.toggle('on', !!t); }
    return;
    const W = box.clientWidth || 390, H = 178, AX = W - 6 - 43, AY = H - 18 - 43;   /* 普攻鍵中心 */
    const at = (dx, dy, sz) => `left:${AX + dx - sz / 2}px;top:${AY + dy - sz / 2}px`;
    const SP = [[-104, 4], [-90, -62], [-34, -104], [-166, -34]];
    let h = `<button id="bf-auto" class="auto ${B.auto ? 'on' : ''}">自動:${B.auto ? '開' : '關'}</button>`;
    h += `<button class="b atk" data-bf="atk" ${lock ? 'disabled' : ''}>攻<small>普攻</small></button>`;
    B.sk.slice(0, 4).forEach((k, i) => { const cd = B.cd[k.id] || 0, p = SP[i]; let ic = ''; try { ic = skArt(k.id, false); } catch (e) { }
      h += `<button class="b sk" data-bf="sk" data-i="${i}" style="${at(p[0], p[1], 56)}" ${lock || cd > 0 ? 'disabled' : ''}><span class="ic">${ic}</span><span class="lb">${k.sk.name}</span>${cd > 0 ? `<span class="cd">${cd}</span>` : ''}</button>`; });
    if (B.ult) { const cd = B.cd.ULT || 0; h += `<button class="b ult" data-bf="ult" style="${at(-236, 2, 72)}" ${lock || cd > 0 ? 'disabled' : ''}>絕<span class="lb">${B.ult.n}</span>${cd > 0 ? `<span class="cd">${cd}</span>` : ''}</button>`; }
    const pills = (state.inventory.pill_4 || 0);
    h += `<button class="b sm" data-bf="pill" style="left:8px;top:${H - 70}px" ${lock || !pills || B.pillUsed >= 2 ? 'disabled' : ''}>💊<span class="lb">回春丹 ${pills > 99 ? '99+' : pills}</span></button>`;
    if (box.dataset.h !== h) { box.dataset.h = h; box.innerHTML = h; }
  }
  /* 選招面板升降、主角上半身(表情隨血量)、自動鈕 */
  function cmdUi() {
    const up = !!B && !B.busy && !B.auto && !B.over; root.classList.toggle('cmd', up);
    const a2 = $('bf-auto2'); if (a2) a2.style.display = B && B.auto && !B.over ? '' : 'none';
    const a1 = $('bf-auto'); if (a1) { a1.textContent = '自動:' + (B && B.auto ? '開' : '關'); a1.classList.toggle('on', !!(B && B.auto)); }
    const bt = root.querySelector('.bt'), cm = $('bf-cmd'); if (bt && cm) cm.style.bottom = bt.offsetHeight + 'px';
    const cp = $('bf-cp'); if (cp && B) { const g = state.gender === 'f' ? 'F' : 'M', h = B.p.hp / B.p.max < .3 ? 'h' : 'n', CP = window.CP124 || {}, U = window.UC121 || {};
      const lk = state.look || 'o1', src = (B.A && B.A.cp && B.A.cp(h)) || CP[g + '_' + lk + '_' + h] || CP[g + '_' + lk + '_n'] || CP[g + '_' + h] || CP[g + '_n'] || U[g + '_sword'] || playerArt(); if (cp.getAttribute('src') !== src) cp.src = src; cp.classList.toggle('cp', !!(CP[g + '_' + h] || CP[g + '_n'])); cp.classList.toggle('hurt', h === 'h' && !CP[g + '_h']); }
  }
  const log = t => { const l = $('bf-log'); if (l) l.innerHTML = t; };
  function num(who, txt, cls) {
    const stg = $('bf-stg'), img = $(who === 'e' ? 'bf-ei' : 'bf-pi'); if (!stg || !img) return;
    const r = img.getBoundingClientRect(), s = stg.getBoundingClientRect(), d = document.createElement('div');
    d.className = 'bf-num ' + (cls || ''); d.textContent = txt;
    d.style.left = (r.left - s.left + r.width / 2 + rnd(-24, 24)) + 'px'; d.style.top = (r.top - s.top + r.height * rnd(.15, .4)) + 'px';
    stg.appendChild(d); setTimeout(() => d.remove(), 1050);
  }
  /* v116 突進:主角衝到敵人面前出招,再退回原位(往場內走會變小,有遠近感) */
  function vec(k) { const [px, py] = center('bf-pi'), [ex, ey] = center('bf-ei'); return [(ex - px) * k, (ey - py) * k]; }
  /* 突進目標:讓主角身上的出招點(fx,fy:圖框內比例)縮放後正好落在敵人身上;frac<1 只走一部分 */
  function aim(fx, fy, sc, frac) {
    const i = $('bf-pi'), s = $('bf-stg'); const r = i.getBoundingClientRect(), q = s.getBoundingClientRect();
    const L = r.left - q.left, Tp = r.top - q.top, w = r.width, h = r.height, ox = L + w / 2, oy = Tp + h;   /* 縮放中心 = 腳底中央(transform-origin 0% 100%,配合 translateX(-50%)),位移與縮放同步 → 直線往右上 */
    const px = L + fx * w, py = Tp + fy * h, [ex, ey] = center('bf-ei');
    /* 一律往右上直線:若劍尖本來就在敵人右邊,改用較小的縮放(往場內走得更遠),讓腳步不必往左退 */
    if (px - ox > 1 && ex - ox > 0) sc = Math.max(.3, Math.min(sc, (ex - ox) / (px - ox) * .97));
    let dx = (ex - ox - sc * (px - ox)) * frac, dy = (ey - oy - sc * (py - oy)) * frac;
    if (dy > 0) dy = 0; dx = Math.max(dx, -dy * .3);   /* 至少帶一點往右的斜度 */
    return [dx, dy, sc];
  }
  function go(k, sc, ms, lift, pt) {
    const i = $('bf-pi'); if (!i) return Promise.resolve(); const v = pt ? aim(pt[0], pt[1], sc, k) : vec(k), dx = v[0], dy = v[1]; if (v[2]) sc = v[2];
    i.style.transition = 'none';
    const a = i.animate([{ translate: '0 0', scale: '1' }, { translate: `${dx}px ${dy - (lift || 0)}px`, scale: String(sc) }], { duration: ms || 200, easing: 'cubic-bezier(.3,.0,.4,1)', fill: 'forwards' });
    i._mv = a; return a.finished.catch(() => { });
  }
  /* v139 絕學突刺:劍尖落在敵人身上(腳站在敵人左下約 1/3 畫面寬) */
  /* 目標位移/縮放(須在原位、未位移時量) */
  function thrustT(t) {
    const i = $('bf-pi'), s = $('bf-stg'); if (!i || !s) return null;
    const r = i.getBoundingClientRect(), q = s.getBoundingClientRect(), L = r.left - q.left, Tp = r.top - q.top, w = r.width, h = r.height, ox = L + w / 2, oy = Tp + h;
    const px = L + t[0] * w, py = Tp + t[1] * h, [ex, ey] = center('bf-ei');
    let sc = px - ox > 1 ? (q.width * .34) / (px - ox) : .62; sc = Math.max(.3, Math.min(.85, sc));
    return { dx: ex - ox - sc * (px - ox), dy: ey - oy - sc * (py - oy), sc, H: q.height };
  }
  /* 由目前位置移到 to = {dx,dy,sc} */
  function mvTo(to, ms, ease) {
    const i = $('bf-pi'); if (!i || !to) return Promise.resolve();
    let from = { translate: '0px 0px', scale: '1' };
    if (i._mv) { const kf = i._mv.effect.getKeyframes(), l = kf[kf.length - 1]; from = { translate: l.translate, scale: String(l.scale) }; i._mv.cancel(); }
    i.style.transition = 'none';
    const a = i.animate([from, { translate: `${to.dx}px ${to.dy}px`, scale: String(to.sc) }], { duration: ms, easing: ease || 'cubic-bezier(.3,.0,.4,1)', fill: 'forwards' });
    i._mv = a; return a.finished.catch(() => { });
  }
  function thrust(t, ms) { return mvTo(thrustT(t), ms || 220); }
  function back(ms) {
    const i = $('bf-pi'); if (!i || !i._mv) return Promise.resolve(); const kf = i._mv.effect.getKeyframes(), last = kf[kf.length - 1]; i._mv.cancel();
    const a = i.animate([{ translate: last.translate, scale: last.scale }, { translate: '0 0', scale: '1' }], { duration: ms || 260, easing: 'ease-out' }); i._mv = null;
    return a.finished.catch(() => { }).then(() => { i.style.transition = ''; });
  }
  async function eLunge(big) {
    const e = $('bf-ei'); if (!e) return; const [px, py] = center('bf-pi'), [ex, ey] = center('bf-ei'), k = big ? .55 : .35;
    await e.animate([{ translate: '0 0', scale: '1' }, { translate: `${(px - ex) * k}px ${(py - ey) * k}px`, scale: big ? '1.35' : '1.18' }], { duration: big ? 240 : 180, easing: 'ease-in', fill: 'forwards' }).finished.catch(() => { });
    setTimeout(() => { e.getAnimations().forEach(a => a.cancel()); e.animate([{ translate: `${(px - ex) * k}px ${(py - ey) * k}px`, scale: big ? '1.35' : '1.18' }, { translate: '0 0', scale: '1' }], { duration: 300, easing: 'ease-out' }); }, big ? 220 : 120);
  }
  /* v117 命中特效(參考 Pokémon GO):星芒爆光、敵人閃白並被擊退、放射速度線、碎片飛散、命中停頓 */
  function impact(col, big) {
    const [x, y] = center('bf-ei'), j = () => rnd(-28, 28);
    const st = fxEl('fx-star', x + j(), y + j(), { '--c': col }); st.style.rotate = rnd(0, 90) + 'deg'; if (big) st.style.scale = '1.5'; setTimeout(() => st.remove(), 380);
    const fl = fxEl('fx-hitflash', x, y, { '--c': col }); setTimeout(() => fl.remove(), 260);
    for (let k = 0; k < (big ? 9 : 5); k++) { const d = fxEl('fx-shard', x, y, { '--c': col }), a = rnd(0, Math.PI * 2), r = rnd(60, big ? 170 : 120); d.animate([{ transform: 'translate(0,0) rotate(0)', opacity: 1 }, { transform: `translate(${Math.cos(a) * r}px,${Math.sin(a) * r}px) rotate(${rnd(-300, 300)}deg)`, opacity: 0 }], { duration: 420, easing: 'ease-out' }).onfinish = () => d.remove(); }
    const e = $('bf-ei'); if (e) { e.animate([{ filter: 'brightness(3.2) saturate(.2)' }, { filter: 'brightness(1)' }], { duration: 180 }); e.animate([{ translate: '0 0' }, { translate: `${big ? 26 : 14}px ${big ? -16 : -8}px` }, { translate: '0 0' }], { duration: 220, easing: 'ease-out', composite: 'add' }); }
    if (big) shake();
  }
  function speed(col) { const d = fxEl('fx-speed', 0, 0, { '--c': col || '#fff' }); setTimeout(() => d.remove(), 700); }
  function goBurst() { const s = $('bf-stg'); if (!s) return; const d = fxEl('fx-go', s.clientWidth / 2, s.clientHeight * .4); d.textContent = '戰'; const r = fxEl('fx-goring', s.clientWidth / 2, s.clientHeight * .4); sfx('sfx_boss', () => { try { audio.playThunder(); } catch (e) { } }); setTimeout(() => { d.remove(); r.remove(); }, 1300); }
  function impactP(col) { const [x, y] = center('bf-pi'); const st = fxEl('fx-star', x + 30, y - 20, { '--c': col }); setTimeout(() => st.remove(), 380); }
  /* v121 本命絕學過場:斜切光帶 + 主角特寫 + 招式大字(之後換成專屬特寫圖) */
  const UCUT = window.UC121 || {};
  function ultCut() {
    return new Promise(res => {
      const g = state.gender === 'f' ? 'F' : 'M', sch = (() => { try { return SCH19.SCH().main; } catch (e) { return ''; } })();
      const src = (B.A && B.A.uc) || UCUT[g + '_' + (state.look || 'o1') + '_' + sch] || UCUT[g + '_' + sch] || UCUT[g] || playerArt(), uc = ULTC[B.ult.n] || '#bfe3ff';
      const d = document.createElement('div'); d.id = 'bf-ucut'; d.style.setProperty('--uc', uc);
      d.innerHTML = `<div class="band"><div class="lines"></div></div><img src="${src}" alt=""><div class="tx"><div class="s">本命絕學</div><div class="n">${B.ult.n}</div></div><div class="fl"></div>`;
      root.appendChild(d); sfx('sfx_skill');
      let done = false; const end = () => { if (done) return; done = true; d.classList.add('out'); setTimeout(() => d.remove(), 260); res(); };
      d.addEventListener('click', end); setTimeout(end, B.auto ? 1100 : 1500);
    });
  }
  function i114lunge() { const i = $('bf-pi'); if (!i) return; i.animate([{ translate: '0 0' }, { translate: '6% -3%' }, { translate: '0 0' }], { duration: 420, easing: 'ease-out' }); }
  function hitFx(who) { const i = $(who === 'e' ? 'bf-ei' : 'bf-pi'); if (!i) return; i.classList.remove('hit'); void i.offsetWidth; i.classList.add('hit'); }
  function shake() { root.classList.remove('shake'); void root.offsetWidth; root.classList.add('shake'); }
  function result(q) { const t = { pf: '完美!', gd: '不錯', ms: '失誤' }[q]; const d = document.createElement('div'); d.className = 'bf-res ' + q; d.textContent = t; if (q === 'pf') { const u = document.createElement('i'); u.className = 'bu'; d.appendChild(u); } $('bf-stg').appendChild(d); setTimeout(() => d.remove(), 1100); }
  function skName(t) { const e = $('bf-sk'); e.textContent = t; e.classList.remove('go'); void e.offsetWidth; e.classList.add('go'); }
  /* 過場(立繪+台詞),點擊或時間到結束 */
  function cut(o) {
    return new Promise(res => {
      const c = $('bf-cut'), img = c.querySelector('img');
      if (o.img) { img.src = o.img; img.style.display = ''; img.className = o.left ? 'l' : ''; img.style.transform = o.flip ? 'scaleX(-1)' : ''; } else img.style.display = 'none';
      c.querySelector('.sub').textContent = o.sub || ''; c.querySelector('.big').textContent = o.big || ''; c.querySelector('.say').textContent = o.say || '';
      c.classList.add('on'); let done = false;
      const end = () => { if (done) return; done = true; c.classList.remove('on'); c.removeEventListener('click', end); res(); };
      c.addEventListener('click', end); setTimeout(end, o.ms || (B && B.auto ? 1600 : 4500));
    });
  }
  /* ---------- QTE ---------- */
  const Q = () => $('bf-q');
  function qOpen(html) { const q = Q(); q.innerHTML = html; q.classList.add('on'); return q; }
  function qClose() { const q = Q(); q.classList.remove('on'); q.innerHTML = ''; q.onpointerdown = q.onpointerup = null; }
  /* 1. 時機條:指針來回,點在金色區 */
  function qTiming(hint, speed) {
    if (B.auto) return Promise.resolve('gd');
    return new Promise(res => {
      const pz = rnd(.38, .62), pw = .11 + (B.ease || 0) * .03, gw = .30;
      const q = qOpen(`<div class="bf-qhint">${hint}<br><span style="font-size:11px;opacity:.8">指針到金色區時點擊</span></div><div class="bf-track"><div class="g" style="left:${(pz - gw / 2) * 100}%;width:${gw * 100}%"></div><div class="p" style="left:${(pz - pw / 2) * 100}%;width:${pw * 100}%"></div><div class="n"></div></div>`);
      const n = q.querySelector('.n'), t0 = performance.now(), per = 1150 / (speed || 1); let done = false, x = 0;
      const step = () => { if (done) return; const t = (performance.now() - t0) / per; x = Math.abs((t % 2) - 1); x = 1 - x; n.style.left = (x * 100) + '%'; if (performance.now() - t0 > 4200) fin('ms'); else requestAnimationFrame(step); };
      const fin = r => { if (done) return; done = true; qClose(); result(r); res(r); };
      q.onpointerdown = () => fin(Math.abs(x - pz) <= pw / 2 ? 'pf' : Math.abs(x - pz) <= gw / 2 ? 'gd' : 'ms');
      requestAnimationFrame(step);
    });
  }
  /* 2. 光點:依序點掉,回傳命中比例 */
  function qPoints(hint, n) {
    if (B.auto) return Promise.resolve(.6);
    return new Promise(res => {
      const q = qOpen(`<div class="bf-qhint">${hint}<br><span style="font-size:11px;opacity:.8">依序點擊光點</span></div><div class="bf-time"><i></i></div>`);
      const ms = 900 + n * 520, t0 = performance.now(); let k = 0, done = false; const pts = [];
      for (let i = 0; i < n; i++) { let x, y, ok, g = 0; do { x = rnd(14, 86); y = rnd(26, 82); ok = pts.every(p => Math.hypot((p[0] - x) * 4, (p[1] - y) * 6) > 90); } while (!ok && ++g < 40); pts.push([x, y]); }
      const show = () => { if (k >= n) return; const d = document.createElement('div'); d.className = 'bf-dot'; d.textContent = k + 1; d.style.left = pts[k][0] + '%'; d.style.top = pts[k][1] + '%'; d.dataset.k = k; q.appendChild(d); };
      show(); if (n > 1) { const d2 = document.createElement('div'); d2.className = 'bf-dot'; d2.style.opacity = '.45'; d2.textContent = 2; d2.style.left = pts[1][0] + '%'; d2.style.top = pts[1][1] + '%'; d2.dataset.pre = 1; q.appendChild(d2); }
      const bar = q.querySelector('.bf-time i');
      const fin = () => { if (done) return; done = true; setTimeout(() => { qClose(); const r = k / n; result(r >= 1 ? 'pf' : r >= .5 ? 'gd' : 'ms'); res(r); }, 120); };
      const tick = () => { if (done) return; const f = 1 - (performance.now() - t0) / ms; bar.style.transform = `scaleX(${Math.max(0, f)})`; if (f <= 0) fin(); else requestAnimationFrame(tick); };
      q.onpointerdown = e => {
        const d = e.target.closest && e.target.closest('.bf-dot:not(.done):not([data-pre])'); if (!d || +d.dataset.k !== k) return;
        d.classList.add('done'); sfx('sfx_hit'); k++; q.querySelectorAll('[data-pre]').forEach(x => x.remove());
        if (k >= n) return fin(); show();
        if (k + 1 < n) { const d2 = document.createElement('div'); d2.className = 'bf-dot'; d2.style.opacity = '.45'; d2.textContent = k + 2; d2.style.left = pts[k + 1][0] + '%'; d2.style.top = pts[k + 1][1] + '%'; d2.dataset.pre = 1; q.appendChild(d2); }
      };
      requestAnimationFrame(tick);
    });
  }
  /* 3. 縮圈:敵方大招,圈縮到剛好重疊時點擊 */
  /* 敵人撲來:在 ms 毫秒時剛好碰到主角(與縮圈重疊同一刻) */
  function eApproach(ms) {
    const e = $('bf-ei'); if (!e) return; const [px, py] = center('bf-pi'), [ex, ey] = center('bf-ei'), k = .62;
    e.getAnimations().forEach(a => a.cancel());
    e._ap = e.animate([{ translate: '0 0', scale: '1' }, { translate: `${(px - ex) * k * .15}px ${(py - ey) * k * .15}px`, scale: '1.05', offset: .35 }, { translate: `${(px - ex) * k}px ${(py - ey) * k}px`, scale: '1.45' }], { duration: ms, easing: 'ease-in', fill: 'forwards' });
  }
  function eReturn(bounce) {
    const e = $('bf-ei'); if (!e || !e._ap) return; const kf = e._ap.effect.getKeyframes(), last = kf[kf.length - 1]; e._ap.cancel(); e._ap = null;
    e.animate(bounce ? [{ translate: last.translate, scale: last.scale }, { translate: '0 -6%', scale: '1.1', offset: .4 }, { translate: '0 0', scale: '1' }] : [{ translate: last.translate, scale: last.scale }, { translate: '0 0', scale: '1' }], { duration: bounce ? 420 : 320, easing: 'ease-out' });
  }
  function qRing(hint) {
    const dur = (B.phase >= 3 ? 950 : 1150), contact = dur * (2 / 2.4);
    if (B.auto) { eApproach(contact); return sleep(contact).then(() => 'gd'); }
    eApproach(contact);
    return new Promise(res => {
      const q = qOpen(`<div class="bf-qhint" style="color:#fca5a5">${hint}<br><span style="font-size:11px;opacity:.85">紅線貼住護盾邊緣、護盾發光的瞬間點擊</span></div><div class="bf-tg"></div><div class="bf-ring"></div>`);
      const ring = q.querySelector('.bf-ring'), tg = q.querySelector('.bf-tg'), t0 = performance.now(); let done = false, s = 3;
      const step = () => { if (done) return; const f = (performance.now() - t0) / dur; s = 3 - 2.4 * f; ring.style.transform = `scale(${Math.max(.2, s)})`; tg.classList.toggle('pf', Math.abs(s - 1) <= .12); if (s < .68) fin('ms', 1); else requestAnimationFrame(step); };
      const fin = (r, late) => { if (done) return; done = true; if (late) { ring.style.transform = 'scale(.68)'; ring.classList.add('brk'); tg.classList.remove('pf'); tg.classList.add('brk'); setTimeout(qClose, 300); } else qClose(); result(r); const wait = Math.max(0, contact - (performance.now() - t0)); setTimeout(() => res(r), r === 'ms' ? wait : 0); };
      q.onpointerdown = () => fin(Math.abs(s - 1) <= .12 ? 'pf' : Math.abs(s - 1) <= .32 ? 'gd' : 'ms');
      requestAnimationFrame(step);
    });
  }
  /* 4. 蓄力:按住,在金色區放開 */
  function qHold(hint) {
    if (B.auto) return Promise.resolve('gd');
    return new Promise(res => {
      const q = qOpen(`<div class="bf-qhint">${hint}<br><span style="font-size:11px;opacity:.8">按住蓄力,在金色區放開</span></div><div class="bf-hold"><div class="z"></div><span>按住<br>蓄力</span></div>`);
      const h = q.querySelector('.bf-hold'); let t0 = 0, v = 0, done = false, holding = false; const T = 1300, tStart = performance.now();
      const step = () => { if (done) return; if (holding) { const f = (performance.now() - t0) / T; v = f <= 1 ? f : Math.max(0, 1 - (f - 1) * 3); h.style.setProperty('--v', (v * 100) + '%'); if (f > 1.4) fin(); } else if (performance.now() - tStart > 6000) fin(); requestAnimationFrame(step); };
      const fin = () => { if (done) return; done = true; const pv = v * 360; const r = pv >= 306 && pv <= 352 ? 'pf' : v >= .6 ? 'gd' : 'ms'; qClose(); result(r); res(r); };
      q.onpointerdown = e => { if (holding) return; holding = true; t0 = performance.now(); h.querySelector('span').innerHTML = '蓄力中'; };
      q.onpointerup = () => { if (holding) fin(); };
      requestAnimationFrame(step);
    });
  }
  /* ---------- 數值 ---------- */
  function build(cfg) {
    const s = calculateTotalStats(), d = BFD[cfg.name] || {};
    const S = skState(), slots = skSlots(), sk = S.equipped.slice(0, slots).filter(id => id && S.learned[id] && SK_BY_ID[id]).map(id => ({ id, sk: SK_BY_ID[id], c: skCalc(SK_BY_ID[id], S.learned[id].lv) }));
    const art = cfg.art || (d.art && d.art()) || enemyArt(cfg.name, cfg.id, cfg.tier != null ? cfg.tier : state.realmIdx) || {};
    const X0 = { cfg, d, s, e: { name: cfg.name, hp: 1, max: 1, atk: 1, def: Math.floor(s.atk * .5), el: cfg.element || null, charge: 0, stun: 0, dot: null, cnt: 0, art }, p: { hp: s.hp, max: s.hp, sh: 0, buff: null },
      sk, cd: {}, ult: ultOf(), pillUsed: 0, phase: 1, turn: 0, busy: false, auto: false, ease: 0 };
    calibrate(X0, cfg.turns || d.T || 10, cfg.winRate != null ? cfg.winRate : (cfg.margin != null ? cfg.margin : (d.margin != null ? d.margin : .55)));
    if (cfg.efrac != null && cfg.efrac > 0 && cfg.efrac < 1) X0.e.max = Math.max(X0.e.hp, Math.floor(X0.e.hp / cfg.efrac));
    if (cfg.pfrac != null) X0.p.hp = Math.max(1, Math.floor(X0.p.max * Math.min(1, Math.max(.01, cfg.pfrac))));
    if (cfg.auto) X0.auto = true;
    return X0;
  }
  /* ---------- 難度校準:用「自動」打法模擬整場,調到自動約五五波;手動 QTE 打得好會輕鬆得多 ---------- */
  const crAvgOf = s => 1 + Math.min(1, s.crit / 100) * ((window.sectCritMult ? sectCritMult() : 1.5) - 1);
  function baseOf(X, mult, buff) { const a = Math.floor(X.s.atk * (buff ? 1 + buff.pct : 1)); let dmg = Math.max(1, a * a / (a + X.e.def)) * mult; const root = state.root || {}, cEl = X.e.el && COUNTER_MAP[X.e.el]; if (cEl && (root[cEl] || 0) >= 60) dmg *= 1.25; return dmg; }
  function petD(X) { try { const p = state.pets && state.pets[state.activePet], pd = PETS.find(x => x.id === state.activePet); return p && pd ? X.s.atk * (pd.s + .01 * p.lv) * .8 : 0; } catch (e) { return 0; } }
  function sim(X, ehp, eatk, maxT, Q) {
    Q = Q || { a: 1, r: .6, b: .45, u: 1 };
    const S = { php: X.p.max, sh: 0, buff: null, cd: {}, cnt: 0, ch: 0, stun: 0, dot: null, eh: ehp, ph: 1 }, cr = crAvgOf(X.s), dg = window.sectDodge ? sectDodge() : 0;
    const dM = Math.max(1, eatk * eatk / (eatk + X.s.def)), pet = petD(X);
    for (let t = 0; t < (maxT || 80); t++) {
      /* 玩家(同 autoPick) */
      let a = null;
      if (X.ult && !(S.cd.ULT > 0)) a = ['ult'];
      if (!a && S.php / X.p.max < .35) { const hi = X.sk.findIndex(k => k.sk.type === 'heal' && !(S.cd[k.id] > 0)); if (hi >= 0) a = ['sk', hi]; }
      if (!a && S.ch) { const si = X.sk.findIndex(k => k.sk.type === 'shield' && !(S.cd[k.id] > 0)); if (si >= 0) a = ['sk', si]; }
      if (!a) { let best = -1, bv = 0; X.sk.forEach((k, i) => { if (S.cd[k.id] > 0) return; const v = k.sk.type === 'buff' ? (S.buff ? 0 : 2) : (k.c.mult || 0) * (k.c.hits || 1); if (v > bv) { bv = v; best = i; } }); a = best >= 0 ? ['sk', best] : ['atk']; }
      let dmg = 0;
      if (a[0] === 'atk') dmg = baseOf(X, Q.a, S.buff) * cr * (window.sectDmgMult ? sectDmgMult(null) : 1);
      else if (a[0] === 'ult') { S.cd.ULT = X.ult.cd + 1; dmg = baseOf(X, ultM(X) * Q.u, S.buff) * cr * ultDm(X); const uk = X.ult.k;
        if (uk === 'magic') { S.dot = { d: baseOf(X, .35, S.buff), t: 3 }; if (Math.random() < .6) { S.stun = 1; S.ch = 0; } }
        else if (uk === 'body') S.sh = Math.max(S.sh, X.p.max * .4);
        else if (uk === 'pill') { S.php = Math.min(X.p.max, S.php + X.p.max * .3); S.buff = { pct: .25, turns: 4 }; } }
      else { const k = X.sk[a[1]], c = k.c, ty = k.sk.type; S.cd[k.id] = c.cd + 1;
        if (ty === 'shield') S.sh = Math.max(S.sh, X.p.max * c.pct); else if (ty === 'heal') S.php = Math.min(X.p.max, S.php + X.p.max * c.pct); else if (ty === 'buff') S.buff = { pct: c.pct, turns: c.turns + 1 };
        else { const f = .45 + .85 * Q.r; dmg = baseOf(X, c.mult * (ty === 'atk' ? c.hits : 1) * f, S.buff) * cr * (window.sectDmgMult ? sectDmgMult(k.sk) : 1);
          if (ty === 'burn') S.dot = { d: baseOf(X, c.dot * f, S.buff), t: c.turns }; else if (ty === 'stun' && Math.random() < .5) { S.stun = 1; S.ch = 0; } else if (ty === 'drain') S.php = Math.min(X.p.max, S.php + dmg * c.steal); } }
      S.eh -= dmg * rnd(.85, 1.15) + pet; if (S.eh <= 0) return { win: true, r: S.php / X.p.max, t };
      const rr = S.eh / ehp; S.ph = rr <= .33 ? 3 : rr <= .66 ? 2 : S.ph;
      /* 敵方 */
      if (S.dot && S.dot.t > 0) { S.eh -= S.dot.d; if (--S.dot.t <= 0) S.dot = null; if (S.eh <= 0) return { win: true, r: S.php / X.p.max, t }; }
      if (S.stun) S.stun = 0;
      else { const m = 1 + .12 * (S.ph - 1); let inc;
        if (S.ch) { S.ch = 0; inc = dM * 2.4 * m * Q.b; } else inc = Math.random() < dg ? 0 : dM * m * rnd(.9, 1.1);
        S.cnt++; const every = S.ph >= 3 ? 2 : 3; if (S.cnt % every === every - 1) S.ch = 1;
        const ab = Math.min(S.sh, inc); S.sh -= ab; S.php -= inc - ab; if (S.php <= 0) return { win: false, r: S.eh / ehp, t }; }
      Object.keys(S.cd).forEach(k => { if (S.cd[k] > 0) S.cd[k]--; }); if (S.buff && --S.buff.turns <= 0) S.buff = null;
    }
    return { win: false, r: 1, t: 99 };
  }
  function calibrate(X, T, margin) {
    /* 1. 敵方氣血 = 自動打法 T 回合的總輸出 */
    /* 用二分找「剛好 T 回合打完」的氣血 */
    let lo = 1, hi = 1e300;
    { let h = baseOf(X, 1, null) * T; for (let i = 0; i < 200 && sim(X, h, 1, T).win; i++) h *= 1.6; hi = h; lo = h / 1.6; }
    for (let i = 0; i < 40; i++) { const mid = (lo + hi) / 2; if (sim(X, mid, 1, T).win) lo = mid; else hi = mid; }
    const ehp = Math.floor(lo);
    /* 2. 敵方攻擊:讓「自動」勝率約為 margin(預設 55%);手動 QTE 打得好幾乎必勝,失誤多則容易輸 */
    const atkOf = k => { const dM = X.p.max / T * k, df = X.s.def; return (dM + Math.sqrt(dM * dM + 4 * dM * df)) / 2; };
    const score = k => { let w = 0; for (let i = 0; i < 48; i++) if (sim(X, ehp, atkOf(k)).win) w++; return w / 48; };
    let a = .05, b = 20; for (let i = 0; i < 26; i++) { const m = Math.sqrt(a * b); if (score(m) > margin) a = m; else b = m; }
    X.e.hp = X.e.max = Math.max(10, ehp); X.e.atk = Math.max(1, Math.floor(atkOf(Math.sqrt(a * b))));
  }
  function base(mult) { return baseOf(B, mult, B.p.buff); }
  async function dealE(total, hits, crit, key) {
    hits = Math.max(1, hits); const per = total / hits;
    for (let i = 0; i < hits; i++) {
      const v = Math.floor(per * rnd(.92, 1.08)); B.e.hp = Math.max(B.A && B.A.efloor ? B.A.efloor() : 0, B.e.hp - v); impact(B.fxc || '#ffffff', crit); num('e', fm(v), crit ? 'cr' : '');
      sfx(crit ? 'sfx_crit' : 'sfx_hit', () => audio.playSlash()); ui(); await sleep(70); await sleep(hits > 1 ? 120 : 200);
      if (B.e.hp <= 0) break;
    }
  }
  const critRoll = q => q === 'pf' || Math.random() * 100 < B.s.crit;
  const critM = () => window.sectCritMult ? sectCritMult() : 1.5;
  /* ---------- 玩家行動 ---------- */
  async function doAtk() {
    setPose(1); if (B.A && B.A.once) await B.A.once('atk'); const q = await qTiming('⚔ ' + ATKN()[0]);
    const m = q === 'pf' ? 1.5 : q === 'gd' ? 1 : .55, cr = critRoll(q), n = q === 'pf' ? 3 : q === 'gd' ? 2 : 1;
    { const L = { sword: ['劍光如虹,三連斬命中要害!', '道友連斬兩劍。', '劍勢一偏,只削到衣角。'], magic: ['三張符咒接連炸開,張張命中!', '兩張符咒破空而去。', '符咒偏了準頭,只擦過一角。'], body: ['拳如崩山,三連擊結結實實打中!', '兩拳接連轟出。', '拳勢落空,只擦過衣角。'], pill: ['丹爐連砸三記,砸得對手踉蹌!', '丹爐砸中兩下。', '丹爐只擦過對手。'] }[STY()]; log(q === 'pf' ? L[0] : q === 'gd' ? L[1] : L[2]); }
    const tot = base(m) * (cr ? critM() : 1) * (window.sectDmgMult ? sectDmgMult(null) : 1); B.fxc = q === 'pf' ? '#fff3b0' : '#ffffff';
    if (STY() === 'magic') {   /* 法修:原地連甩符咒 */
      for (let k = 0; k < n && B.e.hp > 0; k++) {
        setPose(2); await fxTal(q === 'pf' ? '#fff3b0' : '#fde68a', handAt(2), center('bf-ei'), k ? 230 : 300); fxArc('#fde68a');
        await dealE(tot / n, 1, cr && k === n - 1); setPose(1); await sleep(k === n - 1 ? 160 : 60);
      }
      return;
    }
    for (let k = 0; k < n && B.e.hp > 0; k++) {   /* 每一斬:衝上去 → 命中 → 退回(像 Pokémon GO 連打) */
      setPose(2); await go(1, .62, k ? 120 : 170, 0, tip(2)); fxArc(q === 'pf' ? '#fff7cc' : '#dff1ff');
      await dealE(tot / n, 1, cr && k === n - 1);
      setPose(1); await back(k === n - 1 ? 240 : 110);
    }
  }
  async function doSkill(i) {
    const k = B.sk[i]; if (!k || (B.cd[k.id] || 0) > 0) return; const sk = k.sk, c = k.c;
    B.cd[k.id] = c.cd + 1; skName(sk.name); sfx('sfx_skill');
    const dm = window.sectDmgMult ? sectDmgMult(sk) : 1;
    if (sk.type === 'shield' || sk.type === 'heal' || sk.type === 'buff') {
      const q = await qTiming(`✨ ${sk.name}`, .85), f = q === 'pf' ? 1.35 : q === 'gd' ? 1 : .65;
      setPose(4, 900); fxAura(sk.type === 'shield' ? 'sh' : sk.type === 'heal' ? 'hl' : 'bf'); if (STY() === 'pill') num('p', '服丹', 'tx');
      if (sk.type === 'shield') { B.p.sh = Math.max(B.p.sh, Math.floor(B.p.max * c.pct * f)); num('p', '🛡' + fm(B.p.sh), 'hl'); log(`護體靈光籠罩全身,護盾 ${fm(B.p.sh)}。`); }
      else if (sk.type === 'heal') { const h = Math.floor(B.p.max * c.pct * f); B.p.hp = Math.min(B.p.max, B.p.hp + h); num('p', '+' + fm(h), 'hl'); log(`生機湧現,恢復 ${fm(h)} 氣血。`); }
      else { B.p.buff = { pct: c.pct * f, turns: c.turns + 1 }; num('p', '攻↑', 'tx'); log(`戰意沸騰!攻擊提升 ${Math.round(c.pct * f * 100)}%。`); }
      ui(); await sleep(400); return;
    }
    if (B.A && B.A.once) await B.A.once('skill'); const n = Math.max(3, Math.min(5, (c.hits || 1) + 2)), r = await qPoints(`✨ ${sk.name}`, n), f = .45 + .85 * r;
    B.fxc = sk.el && window.SK_EL_COLOR ? SK_EL_COLOR[sk.el] : '#bfe3ff'; const sty = STY(), nb = Math.min(3, sk.type === 'atk' ? c.hits : 1);
    if (sty === 'pill') await swallow();
    if (sty === 'magic') { setPose(3); setTimeout(() => { if (B && !B.over) setPose(1); }, 1000); for (let j = 0; j < nb; j++) setTimeout(() => fxSky(B.fxc), 140 + j * 150); await sleep(420); }
    else { go(.22, .9, 160); setPose(3); setTimeout(() => { if (B && !B.over) { setPose(1); back(240); } }, 900); fxBolt(B.fxc, nb); await sleep(280); }
    const hits = sk.type === 'atk' ? c.hits : 1, cr = r >= 1 || Math.random() * 100 < B.s.crit;
    const total = base(c.mult * (sk.type === 'atk' ? c.hits : 1) * f) * (cr ? critM() : 1) * dm;
    log(`施展【${sk.name}】${r >= 1 ? ',法訣圓滿!' : ''}`);
    await dealE(total, hits, cr);
    if (sk.type === 'burn') { B.e.dot = { dmg: Math.floor(base(c.dot) * f), turns: c.turns }; log(`【${B.e.name}】身中業火!`); }
    else if (sk.type === 'stun') { if (Math.random() < (r >= 1 ? .85 : .5)) { B.e.stun = 1; B.e.charge = 0; num('e', '暈眩', 'tx'); log(`【${B.e.name}】被定住了!`); } else { num('e', '抵抗', 'tx'); } }
    else if (sk.type === 'drain') { const h = Math.floor(total * c.steal); B.p.hp = Math.min(B.p.max, B.p.hp + h); num('p', '+' + fm(h), 'hl'); }
    ui();
  }
  async function doUlt() {
    if (!B.ult || (B.cd.ULT || 0) > 0) return; B.cd.ULT = B.ult.cd + 1;
    await ultCut();
    const sty = STY(); if (sty === 'pill') await swallow();
    const uc = ULTC[B.ult.n] || '#bfe3ff', pi = $('bf-pi'); pi.style.setProperty('--uc', uc); setPose(7); pi.classList.add('chg');
    if (B.A && B.A.once) await B.A.once('hold'); const q = await qHold(`${B.ult.ic} ${B.ult.n}`), f = q === 'pf' ? 1.6 : q === 'gd' ? 1 : .55;
    pi.classList.remove('chg'); B.fxc = uc;
    if (sty === 'magic') {   /* 法修:原地舉符,群符飛起 → 天降轟擊 */
      setPose(8); { const fl = fxEl('fx-flash', 0, 0, { '--c': uc }); setTimeout(() => fl.remove(), 900); } speed(uc); sfx('sfx_ult'); skName(B.ult.n);
      const [hx, hy] = handAt(8), [ex, ey] = center('bf-ei');
      await Promise.all([0, 1, 2, 3, 4].map(j => fxTal(uc, [hx + (j - 2) * 22, hy], [ex + (j - 2) * 34, Math.max(20, ey - 150 - (j % 2) * 30)], 380, j * 60)));
      fxSky(uc, true); await sleep(200); fxBurst(uc); shake();
    } else {
    const T = thrustT(tip(2));
    /* 爆發:躍出約一半距離並騰空 */
    setPose(8); if (T) await mvTo({ dx: T.dx * .45, dy: T.dy * .45 - T.H * .07, sc: 1 + (T.sc - 1) * .5 }, 200, 'cubic-bezier(.2,.8,.3,1)');
    { const fl = fxEl('fx-flash', 0, 0, { '--c': uc }); setTimeout(() => fl.remove(), 900); } speed(uc); sfx('sfx_ult'); skName(B.ult.n);
    await sleep(250);
    /* 突刺:劍尖命中 */
    setPose(2); if (T) await mvTo(T, 150, 'cubic-bezier(.5,0,.9,.6)');
    fxBurst(uc); shake();
    }
    const ucr = q === 'pf' || Math.random() * 100 < B.s.crit;
    await dealE(B.A && B.A.ultKill ? B.e.hp * 1.5 + 10 : base(ultM(B) * f) * (ucr ? critM() : 1) * ultDm(B), 5, ucr);
    setPose(1); await back(320);
    const uk = !B.A && B.ult.k;
    if (uk === 'magic' && B.e.hp > 0) { B.e.dot = { dmg: Math.max(1, Math.floor(base(.35))), turns: 3 }; num('e', '灼燒', 'tx'); await sleep(250); if (Math.random() < .6) { B.e.stun = 1; B.e.charge = 0; num('e', '定身', 'tx'); } else num('e', '抵抗', 'tx'); }
    else if (uk === 'body') { B.p.sh = Math.max(B.p.sh, Math.floor(B.p.max * .4)); fxAura('sh'); num('p', '🛡' + fm(B.p.sh), 'hl'); }
    else if (uk === 'pill') { const h = Math.floor(B.p.max * .3); B.p.hp = Math.min(B.p.max, B.p.hp + h); B.p.buff = { pct: .25, turns: 4 }; fxAura('hl'); num('p', '+' + fm(h), 'hl'); await sleep(250); num('p', '攻↑', 'tx'); }
    ui();
    log(q === 'pf' ? '本命絕學全力爆發!' : `本命絕學【${B.ult.n}】!` + (uk ? ULTD[uk].replace(/。$/, '') + '。' : ''));
  }
  async function doWine() {
    B.A.wineUsed = 1; setPose(4, 1000); sfx('sfx_skill'); await sleep(450); fxAura('hl');
    const h = Math.floor(B.p.max * .5); B.p.hp = Math.min(B.p.max, B.p.hp + h); num('p', '+' + fm(h), 'hl'); log(`墨塵仰頭灌了一口酒,恢復 ${fm(h)} 氣血。`); ui(); await sleep(500);
  }
  async function doPill() {
    if (!(state.inventory.pill_4 > 0) || B.pillUsed >= 2) return; B.pillUsed++;
    state.inventory.pill_4--; if (state.inventory.pill_4 <= 0) delete state.inventory.pill_4;
    const h = Math.floor(B.p.max * .35); B.p.hp = Math.min(B.p.max, B.p.hp + h); num('p', '+' + fm(h), 'hl'); log(`服下回春丹,恢復 ${fm(h)} 氣血。(本場還可服 ${2 - B.pillUsed} 顆)`); ui(); await sleep(450);
  }
  async function petHit() {
    try { const p = state.pets && state.pets[state.activePet], pd = PETS.find(x => x.id === state.activePet); if (!p || !pd || B.e.hp <= 0) return;
      const v = Math.floor(B.s.atk * (pd.s + .01 * p.lv) * .8); B.e.hp = Math.max(0, B.e.hp - v); num('e', `${pd.i}${fm(v)}`, ''); ui(); await sleep(280); } catch (e) { }
  }
  /* ---------- 敵方行動 ---------- */
  async function enemyTurn() {
    const E = B.e;
    if (E.dot && E.dot.turns > 0) { E.hp = Math.max(0, E.hp - E.dot.dmg); num('e', '🔥' + fm(E.dot.dmg), 'pd'); E.dot.turns--; if (!E.dot.turns) E.dot = null; ui(); await sleep(350); if (E.hp <= 0) return; }
    if (E.stun) { E.stun = 0; log(`【${E.name}】動彈不得!`); ui(); await sleep(500); return; }
    const atkM = 1 + .12 * (B.phase - 1);
    let dmg, q = null;
    if (B.A && B.A.enemy) { const r = await B.A.enemy(); if (r) return; }
    if (E.charge) {
      E.charge = 0; const nm = (B.d.charge && B.d.charge[1]) || '必殺一擊';
      skName(nm); log(`【${E.name}】施展【${nm}】!`); await sleep(400);
      if (B.A && B.A.once) await B.A.once('block'); q = await qRing(`⚠ ${nm}`); setPose(q === 'ms' ? 6 : 5, 800); if (q !== 'ms') { fxAura('sh'); impactP('#bfe3ff'); } eReturn(q !== 'ms');
      dmg = B.dM() * 2.4 * atkM * (q === 'pf' ? 0 : q === 'gd' ? .45 : 1);
    } else {
      dmg = B.dM() * atkM * rnd(.9, 1.1); await eLunge(false);
      if (window.sectDodge && Math.random() < sectDodge()) { num('p', '閃避', 'tx'); dmg = 0; }
    }
    E.cnt++;
    const every = B.phase >= 3 ? 2 : 3;
    if (B.A && B.A.charge) E.charge = B.A.charge(E.cnt) ? 1 : 0; else if (!E.charge && E.cnt % every === every - 1) { E.charge = 1; }
    if (q === 'pf') { num('p', '完美格擋', 'hl'); log('看準時機,完全化解!'); sfx('sfx_click'); }
    if (dmg > 0) {
      dmg = Math.floor(dmg); let ab = 0; if (B.p.sh > 0) { ab = Math.min(B.p.sh, dmg); B.p.sh -= ab; dmg -= ab; }
      B.p.hp = Math.max(B.A && B.A.pfloor ? B.A.pfloor() : 0, B.p.hp - dmg); hitFx('p'); if (!q) setPose(6, 600); num('p', '-' + fm(dmg) + (ab ? `(🛡${fm(ab)})` : ''), 'pd'); sfx('sfx_hurt');
      if (q) shake(); if (!q) log(`【${E.name}】出手,造成 ${fm(dmg)} 傷害。`);
    }
    if (E.charge) { log(`⚠【${E.name}】正在蓄力(${(B.d.charge && B.d.charge[0]) || '凝聚殺機'})……下回合小心!`); }
    ui(); await sleep(450);
  }
  /* ---------- 階段 ---------- */
  async function phaseCheck() {
    if (B.A) return;   /* 劇情戰腳本不走階段過場 */
    const r = B.e.hp / B.e.max, np = r <= .33 ? 3 : r <= .66 ? 2 : 1;
    if (np > B.phase && B.e.hp > 0) {
      B.phase = np; const say = np === 3 ? (B.d.p3 || '……還沒完!') : (B.d.p2 || '有點本事,那就來真的吧。');
      await cut({ img: B.pt || B.e.art.src, flip: !B.pt && B.e.art.flip, sub: np === 3 ? '最終階段' : '第二階段', big: B.e.name, say });
      log(`【${B.e.name}】氣勢暴漲!`); ui();
    }
  }
  /* ---------- 主流程 ---------- */
  function autoPick() {
    if (B.ult && !(B.cd.ULT > 0)) return ['ult'];
    if (B.p.hp / B.p.max < .35) { const hi = B.sk.findIndex(k => k.sk.type === 'heal' && !(B.cd[k.id] > 0)); if (hi >= 0) return ['sk', hi]; if (state.inventory.pill_4 > 0 && B.pillUsed < 2) return ['pill']; }
    if (B.e.charge) { const si = B.sk.findIndex(k => k.sk.type === 'shield' && !(B.cd[k.id] > 0)); if (si >= 0) return ['sk', si]; }
    let best = -1, bv = 0; B.sk.forEach((k, i) => { if (B.cd[k.id] > 0) return; const v = k.sk.type === 'buff' ? (B.p.buff ? 0 : 2) : (k.c.mult || 0) * (k.c.hits || 1); if (v > bv) { bv = v; best = i; } });
    return best >= 0 ? ['sk', best] : ['atk'];
  }
  async function act(a) {
    if (!B || B.busy) return; B.busy = true; ui();
    try {
      if (a[0] === 'atk') await doAtk(); else if (a[0] === 'sk') await doSkill(a[1]); else if (a[0] === 'ult') await doUlt(); else if (a[0] === 'pill') { await doPill(); } else if (a[0] === 'wine') await doWine();
      if (a[0] !== 'pill' && !B.A) await petHit();
      if (B.A && B.A.after) B.A.after(a);
      if (B.e.hp <= 0) return end(true);
      await phaseCheck();
      if (B.A && B.A.final && await B.A.final()) return;
      await sleep(300); await enemyTurn();
      if (B.e.hp <= 0) return end(true);
      if (B.p.hp <= 0) return end(false);
      Object.keys(B.cd).forEach(k => { if (B.cd[k] > 0) B.cd[k]--; });
      if (B.p.buff && --B.p.buff.turns <= 0) B.p.buff = null;
      B.turn++;
    } finally { if (B) { B.busy = false; ui(); if (B.auto && !B.over) setTimeout(() => { if (B && B.auto && !B.busy && !B.over) act(autoPick()); }, 500); } }
  }
  async function end(win) {
    if (!B || B.over) return; B.over = true; B.busy = true; qClose();
    const E = B.e, d = B.d; await sleep(400);
    if (win) { setPose(9); sfx('sfx_win', () => audio.playFanfare()); $('bf-ei').style.transition = 'opacity 1s'; $('bf-ei').style.opacity = '.15'; }
    else sfx('sfx_lose');
    const box = $('bf-end');
    box.innerHTML = `<div class="stamp ${win ? 'w' : 'l'}">${win ? '勝' : '敗'}</div><div class="say">${B.pt || E.art.src ? `【${E.name}】` : ''}${win ? (d.win || '敗了……') : (d.lose || '不過如此。')}</div>
      <div class="say" style="font-size:11px;opacity:.75">${B.cfg.rematch ? '(重戰:不影響劇情與獎勵)' : ''}</div><div class="bts">${win ? '<button data-bfe="ok">繼續</button>' : (B.cfg.engine ? '<button data-bfe="ok">離開</button>' : '<button data-bfe="retry">⚔ 再戰一次</button><button data-bfe="ok">離開</button>')}</div>`;
    box.classList.add('on');
  }
  /* ---------- v145 劇情戰腳本 ---------- */
  function tapTip(html) {
    return new Promise(res => { const t = $('bf-tap'); if (!t) { res(); return; } t.querySelector('.tx').innerHTML = html; t.classList.add('on');
      const go = () => { t.classList.remove('on'); t.removeEventListener('pointerup', go); res(); }; setTimeout(() => t.addEventListener('pointerup', go), 350); });
  }
  const wolfArt = () => { try { const m = AREAS_DATA[0].monsters.find(x => x.id === 'm_0_3'); const s = window.MONART26 && MONART26(m); return s ? { src: s, flip: false } : null; } catch (e) { return null; } };
  const SCR = {
    c1kid(cfg) {
      const C = window.C1IMG || {}, g = state.gender === 'f' ? 'F' : 'M', K = n => C[`kid_${g}_${n}`];
      const MAP = { 1: 1, 2: 2, 3: 2, 4: 1, 5: 3, 6: 4, 7: 1, 8: 2, 9: 1, down: 5 };
      const seen = {};
      B.s = { atk: 30, def: 10, crit: 0, hp: 60 }; B.p = { hp: 60, max: 60, sh: 0, buff: null }; B.sk = []; B.ult = null; B.cd = {};
      Object.assign(B.e, { name: '妖狼', hp: 420, max: 420, atk: 14, def: 10, el: null, charge: 0, stun: 0, dot: null, cnt: 0 });
      const wa = wolfArt(); if (wa) { B.e.art = wa; const ei = $('bf-ei'); ei.src = wa.src; ei.style.display = ''; ei.classList.remove('bffl'); }
      B.d = { intro: '(低吼著逼近,口涎滴在焦土上)' }; B.dM = () => 9; B.pt = null;
      B.G = { allow: ['atk'], tip: '點【揮鋤】還手!' };
      B.A = {
        who: '你', atk: ['揮鋤', '看準時機・用盡全力砸下去'],
        pose: n => K(n === 1 && B.p.hp / B.p.max < .4 ? 6 : MAP[n] || 1),
        tip: n => [.64, .23],
        cp: h => C[`kidcp_${g}_${h}`],
        pfloor: () => (B.turn >= 3 ? 4 : 12),
        charge: cnt => cnt === 1 || cnt === 3,
        async start() { await tapTip('妖狼盯上了你。<br>握緊鋤頭——點下方的<b>【揮鋤】</b>還手!'); },
        async once(k) {
          if (seen[k]) return; seen[k] = 1;
          if (k === 'atk') await tapTip('指針會來回擺動,<b>擺到金色區時點一下</b>。<br>點得越準,打得越多下。');
          if (k === 'block') await tapTip('妖狼撲過來了!<br>紅線縮到<b>護盾邊緣、護盾發光</b>的瞬間點擊,就能格擋,少受傷害。');
        },
        after() { B.G.tip = B.e.charge ? '妖狼正在蓄力,下一擊很重!先出手,牠撲來時記得<b>格擋</b>。'.replace(/<\/?b>/g, '') : '點【揮鋤】繼續還手!'; },
        async final() {
          if (B.turn < 4) return false;
          B.G = null; ui(); await sleep(350); log('妖狼猛地人立而起——'); skName('撲殺'); await sleep(500);
          await eLunge(true); setPose('down'); hitFx('p'); shake(); sfx('sfx_hurt'); B.p.hp = 1; num('p', '被撲倒', 'pd'); ui();
          await sleep(1500); B.over = true; close(true); return true;
        }
      };
    },
    c1mo(cfg) {
      const C = window.C1IMG || {}, MP = n => BPX['M_mc_' + n];
      const mk = (id, name, type, el, c) => ({ id, sk: { id, name, type, el }, c: Object.assign({ cd: 2, hits: 1, mult: 1 }, c) });
      B.s = { atk: 200, def: 120, crit: 15, hp: 1000 }; B.p = { hp: 1000, max: 1000, sh: 0, buff: null }; B.cd = { ULT: 0 };
      B.sk = [mk('sk_sword', '青雲劍氣', 'atk', 'metal', { mult: 2.4 }), mk('sc_sw1', '醉劍・連環', 'atk', 'metal', { mult: .9, hits: 3 }), mk('sk_void', '拂袖', 'stun', null, { mult: 1.2 }), mk('sk_guard', '醉仙步', 'shield', null, { pct: .35 })];
      B.ult = { n: '一劍青雲', ic: '🌬️', cd: 99 };
      Object.assign(B.e, { name: '妖狼', hp: 2000, max: 2000, atk: 60, def: 100, el: null, charge: 0, stun: 0, dot: null, cnt: 0 });
      const wa = wolfArt(); if (wa) { B.e.art = wa; const ei = $('bf-ei'); ei.src = wa.src; ei.style.display = ''; ei.classList.remove('bffl'); }
      B.d = { intro: '(青狼弓起背脊,喉中滾出低沉的咆哮)', win: '(哀嚎一聲,轟然倒地)' }; B.dM = () => 45; B.pt = null;
      const T = { 2: [.971, .117], 3: [.356, .105], 8: [.717, .042] };
      let step = 0; const seen = {};
      const TIP = ['墨塵擋在你身前。先用【普攻】。', '神通威力更大,各有效果:連擊、暈眩、護盾。挑一個用用看。', '墨塵被咬了一口——點【酒葫蘆】喝一口緩緩。', '妖狼也撐不住了。最後,【本命絕學】!'];
      const AL = [['atk'], ['sk'], ['wine'], ['ult']];
      const setStep = s => { step = s; B.G = { allow: AL[s], tip: TIP[s] }; };
      setStep(0);
      B.A = {
        who: '墨塵', atk: ['青雲劍・普攻', '看準時機・最多三連斬'], wine: 1, wineUsed: 0, ultKill: 1,
        pose: n => MP(n === 'down' ? 6 : n) || MP(1),
        tip: n => T[n] || [.6, .35],
        cp: () => C.mocp_n, uc: C.mouc,
        efloor: () => step < 3 ? Math.floor(B.e.max * .2) : 0,
        charge: () => false,
        async start() { await tapTip('<b>墨塵</b>擋在你身前,輪到他出手了。<br>跟著提示,看看真正的修士怎麼戰鬥。'); },
        async once(k) {
          if (seen[k]) return; seen[k] = 1;
          if (k === 'skill') await tapTip('神通會出現幾個光點,<b>依序點掉</b>。<br>點得越完整,威力越大。');
          if (k === 'hold') await tapTip('本命絕學:<b>按住</b>蓄力,圈子轉到<b>金色區時放開</b>。<br>全力一擊!');
        },
        after(a) { if (step === 0 && a[0] === 'atk') setStep(1); else if (step === 1 && a[0] === 'sk') setStep(2); else if (step === 2 && a[0] === 'wine') { B.cd.ULT = 0; setStep(3); } },
        async enemy() {
          if (step === 2 && !B.A.bit) {   /* 用完神通後:妖狼拚死一咬,逼出喝酒 */
            B.A.bit = 1; skName('拚死一咬'); log('妖狼拚死撲上來,狠狠咬中墨塵!'); await sleep(350); await eLunge(true);
            const dmg = Math.floor(B.p.max * .55); B.p.sh = 0; B.p.hp = Math.max(1, B.p.hp - dmg); hitFx('p'); setPose(6, 700); shake(); num('p', '-' + fm(dmg), 'pd'); sfx('sfx_hurt'); ui(); await sleep(500); return true;
          }
          if (step === 3) { log('妖狼伏低身子,喘著粗氣。'); ui(); await sleep(400); return true; }
          return false;
        }
      };
    }
  };
  let resolver = null;
  function close(win) {
    try { window.BF113.last = B ? { win: !!win, run: !!B.ran, efrac: Math.max(0, B.e.hp) / B.e.max, pfrac: Math.max(0, B.p.hp) / B.p.max } : { win: !!win }; } catch (e) { }
    const r = resolver; resolver = null; root.classList.remove('on'); $('bf-end').classList.remove('on'); qClose(); B = null; window.BF113.on = false;
    try { BGM96 && BGM96.sync(true); } catch (e) { }
    if (r) r(win);
  }
  async function begin(cfg) {
    B = build(cfg); window.BF113.on = true; B.pt = (window.ART28 && ART28.ch[(B.d.pt || PT[cfg.name])]) || null; if (B.pt) B.e.art = { src: B.pt, flip: false, hi: 1 };
    B.dM = () => { const a = B.e.atk; return Math.max(1, a * a / (a + B.s.def)); };
    const bgk = B.d.bg || cfg.bg;
    root.style.backgroundImage = `url("${cfg.bgSrc || (bgk && window.ART28 && ART28.bg[bgk]) || (GEN3 && (GEN3['A' + Math.min(7, state.realmIdx || 0)] || GEN3.A0))}")`;
    $('bf-en').textContent = cfg.name; $('bf-el').textContent = cfg.label || B.d.title || '';
    $('bf-pi').src = pose(1) || playerArt(); const ei = $('bf-ei'); ei.style.opacity = ''; ei.style.transition = '';
    if (B.e.art.src) { ei.src = B.e.art.src; ei.style.display = ''; ei.classList.toggle('bffl', !!B.e.art.flip); } else ei.style.display = 'none';
    $('bf-end').classList.remove('on'); root.classList.add('on'); try { BGM96 && BGM96.sync(true); } catch (e) { }
    if (cfg.script && SCR[cfg.script]) SCR[cfg.script](cfg); root.classList.toggle('scr', !!B.A); $('bf-pi').src = pose(1) || playerArt();
    ui(); log('');
    await cut({ img: B.pt || B.e.art.src, flip: !B.pt && B.e.art.flip, sub: cfg.label || B.d.title || '', big: cfg.name, say: B.d.intro || cfg.intro || '來吧!' });
    goBurst(); log(B.A && B.A.who ? `輪到${B.A.who}出手。` : '輪到道友出手。'); ui(); if (B.A && B.A.start) await B.A.start();
    if (B && B.auto && !B.busy && !B.over) setTimeout(() => { if (B && B.auto && !B.busy && !B.over) act(autoPick()); }, 600);
  }
  root.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b || !B) return;
    if (b.id === 'bf-run') { if (!B || B.busy || B.over) return; if (!b.classList.contains('ask')) { b.classList.add('ask'); b.textContent = '再按一次確定逃離'; clearTimeout(b._t); b._t = setTimeout(() => { b.classList.remove('ask'); b.textContent = '逃離'; }, 2500); return; } b.classList.remove('ask'); b.textContent = '逃離'; B.over = true; B.ran = true; if (!B.cfg.engine) { try { showToast('暫且退避,改日再戰。'); } catch (e) { } } close(false); return; }
    if (b.id === 'bf-auto' || b.id === 'bf-auto2') { B.auto = !B.auto; ui(); if (B.auto && !B.busy && !B.over) act(autoPick()); return; }
    if (b.dataset.bfe === 'ok') { const w = B.e.hp <= 0; close(w); return; }
    if (b.dataset.bfe === 'retry') { const cfg = B.cfg; B = null; begin(cfg); return; }
    if (b.disabled || B.busy || B.auto) return;
    const k = b.dataset.bf; if (k === 'atk') act(['atk']); else if (k === 'sk') act(['sk', +b.dataset.i]); else if (k === 'ult') act(['ult']); else if (k === 'pill') act(['pill']); else if (k === 'wine') act(['wine']);
  });
  window.BF113 = {
    on: false, BFD,
    start(cfg) { return new Promise(res => { if (B) { res(false); return; } resolver = res; begin(cfg); }); },
    bgm: () => 'tianjie',
    ultInfo() {
      const u = ultOf(); if (!u) return null;
      const S = skState(), slots = skSlots(), sk = S.equipped.slice(0, slots).filter(id => id && S.learned[id] && SK_BY_ID[id]).map(id => ({ id, sk: SK_BY_ID[id], c: skCalc(SK_BY_ID[id], S.learned[id].lv) }));
      const X = { sk, ult: u }, b = ultBestOf(X);
      return { k: u.k, n: u.n, ic: u.ic, cd: u.cd, f: u.f, fl: u.fl, mult: ultM(X), from: b.by ? b.by.name : '', desc: ULTD[u.k] };
    },
    dbg: { build: c => build(c), sim: (X, h, a, t, q) => sim(X, h, a, t, q) }
  };
  /* ---------- v125 接上其他重要戰(塔主・九重劫・心魔・天地異種・秘境/輔修守關者) ---------- */
  {
    const winRateOf = r => { if (!(r > 0)) return .5; const p = 1 / (1 + Math.pow(1 / r, 4)); return Math.min(.97, Math.max(.02, p)); };
    const G3 = () => (typeof GEN3 !== 'undefined' && GEN3) || window.GEN3 || {};
    const towerArt = m => { const nm = String(m.name || '').replace(/^守塔·/, ''); const ti = (typeof TOWER_MON !== 'undefined' ? TOWER_MON : []).findIndex(t => t[0] === nm); const s = ti >= 0 && G3()['K' + (ti + 1)]; return s ? { src: s, flip: false } : null; };
    const wbArt = m => { const nm = String(m.name || '').replace(/^Lv\.\d+\s*/, ''); const wi = (typeof WB_POOL !== 'undefined' ? WB_POOL : []).findIndex(p => p[0] === nm); const s = wi >= 0 && G3()['W' + (wi + 1)]; return s ? { src: s, flip: false } : null; };
    const mindArt = () => (window.A45 && A45.mind) ? { src: A45.mind, flip: false } : null;
    function kindOf(Bt) {
      if (!Bt || Bt.bf113 || !Bt.monster) return null; const m = Bt.monster, id = String(m.id || '');
      if (Bt.tb26) return Bt.tb26.kind === 'story' ? null : 'tb26';
      if (Bt.isDemonTrib) return 'demon';
      if (Bt.isJie) return 'jie';
      if (Bt.isWB) return 'wb';
      if (Bt.isTower && (m.isBoss || id === 'tw_100')) return 'tower';
      return null;
    }
    function cfgOf(k, Bt) {
      const m = Bt.monster, s = calculateTotalStats();
      let r = 1; try { r = TB26.margin(Object.assign({}, m, { hp: Math.max(1, m.curHp != null ? m.curHp : m.hp) }), s.hp); } catch (e) { }
      const c = { name: m.name, label: '', engine: k, winRate: winRateOf(r), pfrac: Bt.playerMaxHp ? Bt.playerHp / Bt.playerMaxHp : 1, element: m.element || null, turns: 9 };
      if (k === 'tower') { const f = Bt.floor || 0; c.label = `九九登天塔・第 ${f} 層`; c.bgSrc = G3().T || ''; c.art = id100(m) ? mindArt() : towerArt(m); c.intro = id100(m) ? '你登得越高,我便越強……我,就是你。' : '登塔者,先過我這一關!'; c.auto = !!state.autoExplore; c.id = id100(m) ? 'mind_demon' : ''; }
      else if (k === 'jie') { c.id = m.id; c.label = '九重劫'; c.intro = '天威浩蕩,劫雷將至——受死!'; c.turns = 10; }
      else if (k === 'demon') { c.id = 'mind_demon'; c.label = '渡劫・心魔'; c.intro = '我即是你,你的貪嗔痴,都在這裡。'; c.art = mindArt(); c.pfrac = 1; }
      else if (k === 'wb') { const w = window.wbState ? wbState().cur : null; c.label = `天地異種${w ? `・第 ${w.tries}/${typeof WB_TRIES !== 'undefined' ? WB_TRIES : 3} 次挑戰` : ''}`; c.art = wbArt(m); c.intro = '(震耳欲聾的咆哮)'; c.efrac = w && w.maxHp ? Math.max(.02, Math.min(1, (m.curHp || w.hp) / w.maxHp)) : 1; c.turns = 10; }
      else if (k === 'tb26') { const t = Bt.tb26; c.label = t.label || ''; c.tier = t.tier; c.intro = t.kind === 'trial' ? '想兼修此道?先接我三招!' : '擅闖秘境者,死!'; }
      return c;
    }
    const id100 = m => String(m.id || '') === 'tw_100';
    function engage(k) {
      const Bt = currentBattle; if (!Bt || Bt.bf113) return; Bt.bf113 = k; battleLock = true;
      try { clearTimeout(battleAutoTimer); } catch (e) { }
      const cfg = cfgOf(k, Bt);
      window.BF113.start(cfg).then(win => {
        const L = window.BF113.last || {}; if (currentBattle !== Bt) return;
        battleLock = false;
        if (L.run) {
          if (k === 'demon') { try { finishDemonBattle('flee'); } catch (e) { endBattle(); } }
          else if (k === 'wb') { Bt.monster.curHp = Math.max(1, Math.floor((L.efrac != null ? L.efrac : 1) * ((wbState().cur || {}).maxHp || Bt.monster.hp))); wbLose(true); }
          else { endBattle(); if (k === 'tower' && state.autoExplore) { try { stopAutoExplore('已撤出守塔之戰。'); } catch (e) { } } showToast('撤出戰鬥,無任何損失。'); }
          return;
        }
        if (win) { Bt.playerHp = Math.max(1, Math.floor((L.pfrac || .01) * Bt.playerMaxHp)); Bt.monster.curHp = 0; winBattle(); }
        else {
          if (k === 'wb') { const c = wbState().cur; Bt.monster.curHp = Math.max(1, Math.floor((L.efrac != null ? L.efrac : 1) * ((c && c.maxHp) || Bt.monster.hp))); }
          Bt.playerHp = 0; loseBattle();
        }
      });
    }
    const check = () => { try { const k = kindOf(currentBattle); if (k) engage(k); } catch (e) { console.error(e); } };
    { const o = startMonsterBattle; startMonsterBattle = function () { const r = o.apply(this, arguments); setTimeout(check, 0); return r; }; }
    if (typeof triggerDemonTribulation === 'function') { const o = triggerDemonTribulation; triggerDemonTribulation = function () { const r = o.apply(this, arguments); setTimeout(check, 0); return r; }; }
    { const o = scheduleAutoBattleTurn; scheduleAutoBattleTurn = function () { if (currentBattle && currentBattle.bf113) return; return o.apply(this, arguments); }; }
  }
  /* ---------- 接上劇情戰 ---------- */
  if (window.TB26 && TB26.story) {
    const o = TB26.story;
    TB26.story = function (cfg) {
      if (!cfg || cfg.kind && cfg.kind !== 'story') return o.apply(this, arguments);
      try { if (currentBattle && window.HO43) HO43.yieldBattle(); if (state.autoExplore) stopAutoExplore(''); } catch (e) { }
      window.BF113.start(Object.assign({}, cfg)).then(win => { try { saveGame(); updateTopBar(); } catch (e) { } setTimeout(() => { try { cfg.onEnd && cfg.onEnd(win); } catch (e) { } }, 200); });
      return true;
    };
  }
})();
