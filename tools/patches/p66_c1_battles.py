#!/usr/bin/env python3
"""最終版145:第一章〈妖潮夜〉兩場劇情戰(重要戰鬥畫面 + 教學)
- c1kid:孩童(依性別)持鋤對妖狼,只有「揮鋤」+ 格擋;第 5 回合被撲倒(劇情殺,不出現敗北畫面)
- c1mo:墨塵對妖狼,普攻 + 4 神通 + 酒葫蘆 + 本命絕學「一劍青雲」;依序引導 普攻 → 神通 → 喝酒 → 絕學
引擎掛鉤:B.A(角色:pose/tip/半身/特寫/普攻名)、B.G(引導:允許的按鈕+提示)、B.A.* 腳本函式
圖:src/assets/C1/(kid_{M|F}_{1..6}、kidcp_*、mocp_n、mouc)、BP/M_mc_{1..9}"""
import os
R = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
def rep(s, old, new, f, n=1):
    assert s.count(old) == n, (f, old[:70], s.count(old)); return s.replace(old, new)
# ---------- 圖檔登記 ----------
keys = [f'kid_{g}_{i}' for g in 'MF' for i in range(1, 7)] + [f'kidcp_{g}_{h}' for g in 'MF' for h in 'nh'] + ['mocp_n', 'mouc']
for k in keys: assert os.path.exists(os.path.join(R, 'src/assets/C1', k + '.webp')), k
for i in range(1, 10): assert os.path.exists(os.path.join(R, f'src/assets/BP/M_mc_{i}.webp'))
p = os.path.join(R, 'src/js/34b_v115_主角戰鬥動作.js'); s = open(p, encoding='utf-8', newline='').read()
s = rep(s, '"talisman": "data:image/webp;base64,@@IMG:BP/talisman@@"', '"talisman": "data:image/webp;base64,@@IMG:BP/talisman@@", ' + ', '.join(f'"M_mc_{i}": "data:image/webp;base64,@@IMG:BP/M_mc_{i}@@"' for i in range(1, 10)), p)
s += 'window.C1IMG = {' + ', '.join(f'"{k}": "data:image/webp;base64,@@IMG:C1/{k}@@"' for k in keys) + '};\n'
open(p, 'w', encoding='utf-8', newline='').write(s)

E = []
# 角色覆寫
E.append(("  const pose = n => BPX[pkey(n)] || '';", "  const pose = n => (B && B.A && B.A.pose && B.A.pose(n)) || BPX[pkey(n)] || '';"))
E.append(("  const tip = n => { const g", "  const tip = n => { if (B && B.A && B.A.tip) return B.A.tip(n); const g"))
E.append(("  const STY = () => { const k", "  const STY = () => { if (B && B.A) return 'sword'; const k"))
E.append(("  const ATKN = () => ({", "  const ATKN = () => (B && B.A && B.A.atk) || ({"))
E.append(("      const lk = state.look || 'o1', src = CP[", "      const lk = state.look || 'o1', src = (B.A && B.A.cp && B.A.cp(h)) || CP["))
E.append(("      const src = UCUT[g", "      const src = (B.A && B.A.uc) || UCUT[g"))
E.append(("  const ULTC = { '劍氣縱橫': '#bfe3ff',", "  const ULTC = { '一劍青雲': '#d9f3ff', '劍氣縱橫': '#bfe3ff',"))
# 選招面板:引導鎖按鈕、酒葫蘆取代回春丹
E.append(("    const pl = (state.inventory.pill_4 || 0); rs += row('pill',",
"""    if (B.A && B.A.wine) rs += row('pill', 'data-bf="wine"', (ITEMS.pill_4 && ITEMS.pill_4.icon) || '<b>🍶</b>', '酒葫蘆', '仰頭灌一口・回復 50% 氣血', 0, lock || B.A.wineUsed);
    if (!B.A) { const pl = (state.inventory.pill_4 || 0); rs += row('pill',"""))
E.append(("    if (box.dataset.h !== rs) { box.dataset.h = rs; box.innerHTML = rs; }\n    return;",
"""    }
    if (B.G) { const al = B.G.allow || []; rs = rs.replace(/<button class="row ([a-z]+)" data-bf="([a-z]+)"([^>]*)>/g, (m, c, k, rest) => al.includes(k) ? `<button class="row ${c} gd" data-bf="${k}"${rest}>` : `<button class="row ${c} lk" data-bf="${k}"${rest.replace(/ disabled/, '')} disabled>`); }
    if (box.dataset.h !== rs) { box.dataset.h = rs; box.innerHTML = rs; }
    const tp = $('bf-gtip'); if (tp) { const t = B.G && !B.busy && !B.over ? B.G.tip || '' : ''; tp.textContent = t; tp.classList.toggle('on', !!t); }
    return;"""))
# QTE 前的教學提示(各一次)
E.append(("    setPose(1); const q = await qTiming('⚔ ' + ATKN()[0]);", "    setPose(1); if (B.A && B.A.once) await B.A.once('atk'); const q = await qTiming('⚔ ' + ATKN()[0]);"))
E.append(("    const n = Math.max(3, Math.min(5, (c.hits || 1) + 2)), r = await qPoints(", "    if (B.A && B.A.once) await B.A.once('skill'); const n = Math.max(3, Math.min(5, (c.hits || 1) + 2)), r = await qPoints("))
E.append(("    const q = await qHold(`${B.ult.ic} ${B.ult.n}`)", "    if (B.A && B.A.once) await B.A.once('hold'); const q = await qHold(`${B.ult.ic} ${B.ult.n}`)"))
E.append(("      q = await qRing(`⚠ ${nm}`);", "      if (B.A && B.A.once) await B.A.once('block'); q = await qRing(`⚠ ${nm}`);"))
# 數值掛鉤
E.append(("    await dealE(base(ultM(B) * f) * (ucr ? critM() : 1) * ultDm(B), 5, ucr);", "    await dealE(B.A && B.A.ultKill ? B.e.hp * 1.5 + 10 : base(ultM(B) * f) * (ucr ? critM() : 1) * ultDm(B), 5, ucr);"))
E.append(("B.e.hp = Math.max(0, B.e.hp - v); impact(", "B.e.hp = Math.max(B.A && B.A.efloor ? B.A.efloor() : 0, B.e.hp - v); impact("))
E.append(("      B.p.hp = Math.max(0, B.p.hp - dmg); hitFx('p');", "      B.p.hp = Math.max(B.A && B.A.pfloor ? B.A.pfloor() : 0, B.p.hp - dmg); hitFx('p');"))
E.append(("    if (!E.charge && E.cnt % every === every - 1) { E.charge = 1; }", "    if (B.A && B.A.charge) E.charge = B.A.charge(E.cnt) ? 1 : 0; else if (!E.charge && E.cnt % every === every - 1) { E.charge = 1; }"))
E.append(("    let dmg, q = null;\n    if (E.charge) {", "    let dmg, q = null;\n    if (B.A && B.A.enemy) { const r = await B.A.enemy(); if (r) return; }\n    if (E.charge) {"))
# 行動
E.append(("else if (a[0] === 'pill') { await doPill(); }", "else if (a[0] === 'pill') { await doPill(); } else if (a[0] === 'wine') await doWine();"))
E.append(("      if (a[0] !== 'pill') await petHit();", "      if (a[0] !== 'pill' && !B.A) await petHit();\n      if (B.A && B.A.after) B.A.after(a);"))
E.append(("      await sleep(300); await enemyTurn();", "      if (B.A && B.A.final && await B.A.final()) return;\n      await sleep(300); await enemyTurn();"))
E.append(("else if (k === 'pill') act(['pill']);", "else if (k === 'pill') act(['pill']); else if (k === 'wine') act(['wine']);"))
E.append(("  async function doPill() {", """  async function doWine() {
    B.A.wineUsed = 1; setPose(4, 1000); sfx('sfx_skill'); await sleep(450); fxAura('hl');
    const h = Math.floor(B.p.max * .5); B.p.hp = Math.min(B.p.max, B.p.hp + h); num('p', '+' + fm(h), 'hl'); log(`墨塵仰頭灌了一口酒,恢復 ${fm(h)} 氣血。`); ui(); await sleep(500);
  }
  async function doPill() {"""))
E.append(("  async function phaseCheck() {\n", "  async function phaseCheck() {\n    if (B.A) return;   /* 劇情戰腳本不走階段過場 */\n"))
# 開場:套用腳本
E.append(("    ui(); log('');\n", "    if (cfg.script && SCR[cfg.script]) SCR[cfg.script](cfg); root.classList.toggle('scr', !!B.A); $('bf-pi').src = pose(1) || playerArt();\n    ui(); log('');\n"))
E.append(("    goBurst(); log('輪到道友出手。'); ui();", "    goBurst(); log(B.A && B.A.who ? `輪到${B.A.who}出手。` : '輪到道友出手。'); ui(); if (B.A && B.A.start) await B.A.start();"))
# 提示框 DOM / CSS
E.append(("#bf-auto{", """#bf113.scr #bf-auto,#bf113.scr #bf-run,#bf113.scr #bf-auto2{display:none!important}
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
#bf-auto{"""))
E.append(('<div id="bf-cmd">', '<div id="bf-tap"><div class="bx"><div class="tx"></div><div class="nx">點一下繼續 ▸</div></div></div><div id="bf-cmd"><div id="bf-gtip"></div>'))
# 腳本本體
E.append(("  let resolver = null;", r"""  /* ---------- v145 劇情戰腳本 ---------- */
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
  let resolver = null;"""))
for f in ('src/js/35_v113_重要戰鬥.js', 'tools/patches/p48_bf.js'):
    p = os.path.join(R, f); s = open(p, encoding='utf-8', newline='').read()
    for o, n in E: s = rep(s, o, n, f)
    open(p, 'w', encoding='utf-8', newline='').write(s)

# ---------- 劇情 1.2 ----------
p = os.path.join(R, 'src/js/02_main/057_第_1_章・凡心.js'); s = open(p, encoding='utf-8', newline='').read()
old = """        { t: '躲進柴房,抱緊珠子。', e: { f: 'c1_hide' }, r: [
          N('你縮在柴堆後面,聽著外面的慘叫,手心全是冷汗。你恨自己的膽小——但你活了下來。')
        ] },
        { t: '抄起鋤頭,衝出去幫忙。', e: { f: 'c1_fight' }, r: [
          S('N', '', '別怕!都到我後面來!'),
          N('你揮著鋤頭,打退了一隻撲向孩子的妖物,卻被第二隻狠狠撞飛。')
        ] }
      ]),
      fx('flash'),
      N('一道青光自天而降。'),
      S('墨塵', 'kind', '嘖,今晚的酒,怕是喝不成了。'),
      N('一名腰懸酒葫蘆的青衣道人落在村口,衣袖一揮,數隻妖物如落葉般倒地。'),
      S('墨塵', 'kind', '小娃兒,還站得起來嗎?'),"""
new = """        { t: '躲進柴房,抱緊珠子。', e: { f: 'c1_hide' }, r: [
          N('你縮在柴堆後面,聽著外面的慘叫,手心全是冷汗。'),
          N('「砰」的一聲,柴房的木門被撞開了。一顆青灰色的狼頭探進來,鼻翼翕動,一下一下嗅著你的氣味。'),
          N('無處可逃了。你抓起靠在門邊的鋤頭。')
        ] },
        { t: '抄起鋤頭,衝出去幫忙。', e: { f: 'c1_fight' }, r: [
          S('N', '', '別怕!都到我後面來!'),
          N('你揮著鋤頭,打退了一隻撲向孩子的妖物。'),
          N('下一刻,一頭比牛犢還大的青狼從火光裡踱出來,綠幽幽的眼睛盯上了你。')
        ] }
      ]),
      A.fight({ name: '妖狼', emoji: '🐺', label: '妖潮夜', tier: 0, target: 1, script: 'c1kid' }),
      N('妖狼一爪把你掀翻在地。腥臭的熱氣撲到臉上,你連握緊鋤頭的力氣都沒有了。'),
      fx('flash'),
      N('一道青光自天而降。'),
      S('墨塵', 'kind', '嘖,今晚的酒,怕是喝不成了。'),
      N('一名腰懸酒葫蘆的青衣道人落在你身前,隨手一劍,把妖狼逼退了三丈。'),
      S('墨塵', 'kind', '小娃兒,躲到我身後去。看好了。'),
      A.fight({ name: '妖狼', emoji: '🐺', label: '妖潮夜・青衣道人', tier: 0, target: 1, script: 'c1mo' }),
      N('青狼哀嚎著倒下。墨塵衣袖一揮,村中其餘的妖物如落葉般倒地。'),
      S('墨塵', 'kind', '小娃兒,還站得起來嗎?'),"""
s = rep(s, old, new, p); open(p, 'w', encoding='utf-8', newline='').write(s)
# 劇情戰結束:腳本戰不顯示「戰鬥勝利」
p = os.path.join(R, 'src/js/02_main/055_v11_0_主線劇情引擎_對話畫面_三層選擇_回顧_章末.js'); s = open(p, encoding='utf-8', newline='').read()
s = rep(s, "      if (win) { flash('⚔ 戰鬥勝利'); next(); } else showFightLose(cfg);", "      if (win) { if (!cfg.script) flash('⚔ 戰鬥勝利'); next(); } else showFightLose(cfg);", p)
s = rep(s, "    if (!run || run.choosing || $('st28lg')", "    if (!run || run.choosing || run.fighting || $('st28lg')", p)
open(p, 'w', encoding='utf-8', newline='').write(s)
print('p66 ok')
