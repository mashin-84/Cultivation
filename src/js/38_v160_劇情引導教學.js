/* ===== v160 劇情引導教學:劇情講到哪個系統,就帶玩家親手按一次那個按鈕 =====
   用法:劇情節拍 { guide: '鍵' }(對話暫停,做完回到劇情);系統由 sysUnlock 開啟時,自動排入 'u_系統鍵' 的教學。
   每個教學只會跑一次(state.tut160);重看劇情時略過。找不到目標按鈕的步驟自動跳過,不會卡住。 */
(() => {
  const $ = id => document.getElementById(id), X = window.X5;
  const NM = { mo: '墨塵', su: '蘇棠', ba: '白澤', gu: '顧青衍', tl: '鐵老', gs: '管事', ye: '夜無咎' };
  const nav = (t, s) => ({ el: `[data-n25="${t}"]`, tap: 1, t: s });
  const sub = (k, s) => ({ el: `[data-a51=sec][data-k=${k}]`, tap: 1, t: s });
  const back = s => ({ el: '[data-a51=back]', tap: 1, t: s, opt: 1 });
  const mid = s => ({ el: null, t: s });
  const shut = { fn: () => closeSheets() };
  /* ---------- 教學內容(文字用說話者的口吻) ---------- */
  const D = {
    /* 第一章・山門贈物(墨塵) */
    c1_arr: { w: 'mo', s: [
      { tab: 'tab-abode', el: '[data-a53=arr]', tap: 1, t: '地上這圈陣紋,就是聚靈陣。點它看看。' },
      { el: '#btn-upgrade-array', tap: 1, t: '餵它靈石,陣就升一階,吞吐便多一分。先升一階——你睡著了,它也替你吐納。' },
      { el: '#ov53 [data-a53=x]', tap: 1, t: '好,收起來。往後靈石寬裕了,記得回來餵它。', opt: 1 }] },
    c1_bag: { w: 'mo', s: [
      nav('tab-inventory', '儲物袋在這一頁。'),
      { el: '[data-c13=all]', t: '藥草、礦石、衣物、兵刃,撿到什麼都收在袋裡。點一樣東西,能看它的用途與出處。' },
      { el: '[data-a54=pill]', t: '聚氣丹從這裡服。丹只補到氣海滿為止;同一層連著吃會積丹毒,藥力越來越弱,破境時才洗得乾淨。' }] },
    c1_look: { w: 'mo', s: [
      nav('tab-techniques', '這一頁是你自己:身上穿的、手上拿的,都在這。'),
      { el: '[data-l14=open]', t: '想換件衣裳,點「更衣」。庫房的舊衣不多,往後你走得越遠,能挑的越多。' }] },
    c1_book: { w: 'mo', s: [
      nav('tab-records', '青雲玉冊收在這一頁。'),
      { el: '[data-a54=path]', t: '走過的路、見過的妖獸藥材、旁人給你的名號,玉冊都替你記著。忘了規矩,右上角設定裡有《諸天太上仙經》。' }] },
    c1_tap: { w: 'mo', s: [
      { tab: 'tab-abode', el: '#btn-tap-cultivate', tap: 1, t: '坐下。心神一動,便是一息——點這裡,吐納。' }] },
    /* 第一章・測靈根(墨塵) */
    c1_root: { w: 'mo', s: [
      nav('tab-techniques', '靈根長在你身上,自然記在你這一頁。'),
      sub('root', '點「靈根」。'),
      back('五行高低都在這。靈泉洗髓也在這頁:中意的那一行先鎖住再洗,鎖得越多越貴。看完按返回。')] },
    c1_tech: { w: 'mo', s: [
      sub('tech', '心法收在「功法」裡。'),
      { el: '[data-action="upgrade-tech"]', tap: 1, t: '《太乙聚氣訣》再悟一重,吐納就快一分。靈石砸下去,不虧。', opt: 1 },
      back('別的心法也在這兒,拿靈石換悟。湊夠三門,還有道法共鳴。回去吧。')] },
    c1_brk: { w: 'mo', s: [
      { tab: 'tab-abode', el: '#btn-trigger-breakthrough', t: '氣海盈滿時,這張突破卡會亮起來。點它,便能破境。' }] },
    /* 第一章・入門試煉(管事) */
    c1_skill: { w: 'gs', s: [
      nav('tab-techniques', '劍訣領了,去看看你的神通欄。'),
      sub('sk', '點「神通」。'),
      back('《青雲劍訣》已經裝上。打得越多越熟,熟練度滿了,拿靈石來領悟升級——出手更快,威力更強。')] },
    /* 第一章・任務堂(管事) */
    c1_daily: { w: 'gs', s: [
      nav('tab-records', '每日課業貼在任務堂,你在「仙途」這頁就看得到。'),
      { el: '[data-a54=daily]', t: '每天三張,子時換新。做完了來領賞。' }] },
    c1_heal: { w: 'gs', s: [
      nav('tab-adventure', '歷練在這一頁。'),
      { el: '#btn-auto-pill', t: '開著「自動療傷」,氣血見底時會自己吃回春丹。丹藥隨身備著,別等快倒了才想起來。' }] },
    /* 系統開啟後的教學 */
    u_sect: { w: 'mo', s: [
      { tab: 'tab-abode', el: '[data-x5="sm44.open"]', t: '山門在這。每踏進一個新的大境界,站穩了,就能持令牌下山遊學。' }] },
    u_alch: { w: 'mo', s: [
      nav('tab-crafting', '丹房就在「丹器」這一頁。'),
      { el: '[data-c52=alch]', tap: 1, t: '神農鼎在「煉丹」。', opt: 1 },
      { el: '[data-ca52]', tap: 1, t: '凝露靈草夠了。點火,先煉一爐聚氣丹。' },
      { tab: 'tab-abode', el: '[data-h44=gd]', tap: 1, t: '靈草不只靠歷練撿。洞府外那幾塊田,如今也能種了——點進去。' },
      { el: '[data-x5="gd.sow"]', tap: 1, t: '不知道種什麼,就照想煉的丹來種,省心。' },
      { el: '[data-x5="gd.sowg"][data-id="pill_1"]', tap: 1, t: '先種凝露靈草,聚氣丹用得上。熟了記得回來收。' }, shut] },
    u_forge: { w: 'tl', s: [
      nav('tab-crafting', '我那爐子,在「丹器」這頁。'),
      { el: '[data-c52=forge]', tap: 1, t: '切到「煉器」。' },
      { el: '[data-cf52]', tap: 1, t: '寒鐵石夠了。錘下去——鍛你的第一柄劍。' },
      nav('tab-techniques', '鍛出來比身上好的,自己會穿上。去看看。'),
      { el: '[data-enhall]', t: '拿靈材往上砸,就是強化;這顆鈕一次砸到底。打不過的時候,先回來看看裝備。' }] },
    u_talent: { w: 'ba', s: [
      nav('tab-techniques', '(打了個哈欠)樹影在你這一頁。'),
      sub('tal', '點「天賦」。'),
      back('道心點夠了,就喚醒一枚。花哪一枚,你自己想。本座睡了。')] },
    u_school: { w: 'mo', s: [
      nav('tab-techniques', '路該擇了。'),
      { el: '[data-x5="sc.open"]', tap: 1, t: '點「流派」。' },
      mid('劍、法、體、丹,擇一條做本命——按「擇為本命」。想改道要費時費靈石,別三天兩頭換。'), shut] },
    u_secret: { w: 'su', s: [
      nav('tab-adventure', '走,去歷練頁!'),
      { el: '#x32-asub-d', t: '「每日秘境」就是靈潮衝開的小洞天,每天換三處。遣神識進去就行,離線了它也替你探!' }] },
    u_body: { w: 'mo', s: [
      { tab: 'tab-abode', el: '[data-x5="mg.open"][data-k="body"]', tap: 1, t: '煉體台在洞府。點它。' },
      mid('拿靈石錘鍊筋骨,氣血、防禦、攻擊都會長。每過一個大境界,能多練五重。'), shut] },
    u_sub: { w: 'gu', s: [
      nav('tab-techniques', '輔修的事,在你的流派頁。'),
      { el: '[data-x5="sc.open"]', tap: 1, t: '點「流派」。' },
      mid('每一派都有一道試煉。過了,那一派就能當輔修,兩條路一起走。'), shut] },
    u_heart: { w: 'ba', s: [
      nav('tab-records', '(難得正經)道心閣在「仙途」。'),
      { el: '[data-a54=dao]', t: '這一世攢下的東西,有些能帶到下一世。在這裡兌換。' }] },
    u_avatar: { w: 'mo', s: [
      nav('tab-adventure', '元嬰出竅,能分身了。'),
      { el: '#x32-asub-d', t: '每日秘境裡,可以遣化身代你去探。人不必到,收穫照拿。' }] },
    u_pet: { w: 'ba', s: [
      { tab: 'tab-abode', el: '[data-x5="mg.open"][data-k="pet"]', tap: 1, t: '靈獸園在洞府。那顆蛋,放進去孵。' },
      mid('孵出來的靈寵會陪你出戰。餵牠靈石,牠就長。(哼)別指望牠比本座聰明。'), shut] },
    u_tower: { w: 'su', s: [
      nav('tab-adventure', '塔!在歷練頁!'),
      { el: '[data-tower]', t: '九九登天塔,一百層,每九層有塔主。打不上去就先回來養一養,塔不會跑!' }] },
    u_treasure: { w: 'ba', s: [
      { tab: 'tab-abode', el: '[data-x5="mg.open"][data-k="treasure"]', tap: 1, t: '藏寶閣在洞府。點進去。' },
      mid('殘片集齊了,就能重煉法寶。法寶的加成跟裝備疊在一起。'), shut] },
    u_xian: { w: 'mo', s: [
      nav('tab-techniques', '神識的事,在你這一頁。'),
      { el: '[data-x5="xj.open"]', tap: 1, t: '點「天機」。' },
      mid('神識、天機閣、道果都在這裡。仙緣要省著用,用在刀口上。'), shut] },
    u_jie: { w: 'mo', s: [
      nav('tab-techniques', '劫印在天機裡。'),
      { el: '[data-x5="xj.open"]', tap: 1, t: '點「天機」。' },
      mid('九重劫可以反覆演練,每天有次數。過一重,便強一分。'), shut] }
  };
  /* ---------- 工具 ---------- */
  const T = () => { if (!state.tut160 || typeof state.tut160 !== 'object') state.tut160 = {}; return state.tut160; };
  const isDone = k => !!T()[k];
  const vis = e => { if (!e) return false; const r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.display !== 'none' && s.visibility !== 'hidden'; };
  const find = sel => { if (!sel) return null; try { return [...document.querySelectorAll(sel)].find(vis) || null; } catch (e) { return null; } };
  function closeSheets() { try { ['#ov53 [data-a53=x]', '#ov54 [data-a54=x]'].forEach(s => { const x = document.querySelector(s); if (x && vis(x)) x.click(); }); } catch (e) { } try { document.querySelectorAll('[id^=x5s-]').forEach(e => { if (vis(e) && X && X.close) X.close(e.id.slice(4)); }); } catch (e) { } }
  const fmt = t => String(t).replace(/\{N\}/g, state.name || '你');
  function face(w) { const A = (window.ART28 && ART28.ch) || {}; const k = Object.keys(A).find(x => x.indexOf(w + '_') === 0 && !/_(sad|cold|angry)$/.test(x)) || Object.keys(A).find(x => x.indexOf(w + '_') === 0); return k ? A[k] : ''; }
  /* ---------- 畫面 ---------- */
  const st = document.createElement('style');
  st.textContent = `#tut160{position:fixed;inset:0;z-index:2147483000;pointer-events:none;font-family:inherit}
#tut160 .b{position:fixed;background:rgba(24,18,10,.62);pointer-events:auto}
#tut160 .r{position:fixed;border:2px solid #f5c542;border-radius:12px;box-shadow:0 0 0 3px rgba(245,197,66,.25),0 0 18px 4px rgba(245,197,66,.55);pointer-events:none;animation:tut160p 1.2s ease-in-out infinite}
@keyframes tut160p{50%{box-shadow:0 0 0 6px rgba(245,197,66,.15),0 0 26px 8px rgba(245,197,66,.75)}}
#tut160 .bb{position:fixed;left:12px;right:12px;pointer-events:auto;display:flex;gap:10px;align-items:flex-start;background:linear-gradient(180deg,#fffaf0,#f3e8d2);border:1.5px solid #c9a96b;border-radius:14px;padding:10px 12px;box-shadow:0 8px 24px rgba(0,0,0,.35);color:#2a241c}
#tut160 .av{flex:none;width:52px;height:52px;border-radius:50%;background:#e8dcc2 center 12%/cover no-repeat;border:2px solid #c9a96b}
#tut160 .tx{flex:1;min-width:0}#tut160 .nm{font-weight:900;font-size:13px;color:#8a5a12;margin-bottom:2px}
#tut160 .t{font-size:14px;line-height:1.55}#tut160 .ok{margin-top:8px;float:right;min-height:40px;padding:6px 18px;border-radius:10px;font-weight:900;font-size:14px;background:#b45309;color:#fff;border:1px solid #f59e0b}
#tut160 .hint{font-size:11px;color:#9a7b4c;margin-top:4px}`;
  document.head.appendChild(st);
  let cur = null, raf = 0;
  function ui() {
    let o = $('tut160'); if (o) return o;
    o = document.createElement('div'); o.id = 'tut160';
    o.innerHTML = '<div class="b" data-p="t"></div><div class="b" data-p="b"></div><div class="b" data-p="l"></div><div class="b" data-p="r"></div><div class="r"></div><div class="bb"><div class="av"></div><div class="tx"><div class="nm"></div><div class="t"></div><div class="hint"></div><button class="ok">知道了</button></div></div>';
    document.body.appendChild(o);
    const okH = e => { e.stopPropagation(); e.preventDefault(); if (cur && !cur.tap && !cur.okd) { cur.okd = 1; adv(); } };
    o.querySelector('.ok').addEventListener('pointerup', okH); o.querySelector('.ok').addEventListener('click', okH);
    return o;
  }
  function place() {
    if (!cur) return; const o = ui(), W = innerWidth, H = innerHeight, bb = o.querySelector('.bb'), ring = o.querySelector('.r');
    const P = o.querySelectorAll('.b'); let r = null;
    if (cur.el) { if (!document.contains(cur.el) || !vis(cur.el)) { const e = find(cur.sel); if (e) cur.el = e; } if (cur.el && vis(cur.el)) r = cur.el.getBoundingClientRect(); }
    if (r) {
      const p = 6, x0 = Math.max(0, r.left - p), y0 = Math.max(0, r.top - p), x1 = Math.min(W, r.right + p), y1 = Math.min(H, r.bottom + p);
      cur.hole = [x0, y0, x1, y1];
      const S = (e, l, t, w, h) => { e.style.left = l + 'px'; e.style.top = t + 'px'; e.style.width = Math.max(0, w) + 'px'; e.style.height = Math.max(0, h) + 'px'; };
      P[0].style.background = ''; S(P[0], 0, 0, W, y0); S(P[1], 0, y1, W, H - y1); S(P[2], 0, y0, x0, y1 - y0); S(P[3], x1, y0, W - x1, y1 - y0);
      S(ring, x0, y0, x1 - x0, y1 - y0); ring.style.display = '';
      const below = (y0 + y1) / 2 < H * .5; bb.style.top = below ? Math.min(H - 170, y1 + 12) + 'px' : ''; bb.style.bottom = below ? '' : Math.min(H - 170, H - y0 + 12) + 'px';
    } else {
      cur.hole = null; P[0].style.cssText = `left:0;top:0;width:${W}px;height:${H}px;background:rgba(24,18,10,.35)`; [1, 2, 3].forEach(i => { P[i].style.width = '0px'; P[i].style.height = '0px'; });
      ring.style.display = 'none'; bb.style.top = ''; bb.style.bottom = '96px';
    }
    raf = requestAnimationFrame(place);
  }
  function show(step) {
    const o = ui(); o.style.display = '';
    const w = cur.w; o.querySelector('.av').style.backgroundImage = face(w) ? `url("${face(w)}")` : 'none';
    o.querySelector('.av').style.display = face(w) ? '' : 'none';
    o.querySelector('.nm').textContent = NM[w] || '';
    o.querySelector('.t').textContent = fmt(step.t || '');
    o.querySelector('.hint').textContent = cur.tap ? '點亮起來的地方' : '';
    o.querySelector('.ok').style.display = cur.tap ? 'none' : '';
    cancelAnimationFrame(raf); place();
  }
  /* 依序執行步驟;找不到按鈕就等一下,再找不到就略過 */
  function go() {
    if (!cur) return;
    const step = cur.steps[cur.i]; if (!step) return end();
    if (step.fn) { try { step.fn(); } catch (e) { } cur.i++; return setTimeout(go, 150); }
    if (step.tab) { const nb = document.querySelector(`[data-n25="${step.tab}"]`); if (nb && !nb.classList.contains('on')) nb.click(); }
    cur.sel = step.el; cur.tap = !!step.tap && !!step.el; cur.el = null; cur.pend = false; cur.okd = 0;
    if (!step.el) { show(step); return; }
    let tries = 0;
    (function look() {
      if (!cur) return; const e = find(step.el);
      if (e) { cur.el = e; try { e.scrollIntoView({ block: 'center', behavior: 'instant' }); } catch (er) { } show(step); return; }
      if (++tries > 25) { cur.i++; return go(); }
      setTimeout(look, 100);
    })();
  }
  function adv() { if (!cur) return; cur.i++; cur.el = null; cur.hole = null; setTimeout(go, 60); }
  function end() {
    const c = cur; cur = null; cancelAnimationFrame(raf); const o = $('tut160'); if (o) o.style.display = 'none';
    if (!c) return; T()[c.k] = 1; try { saveGame(); } catch (e) { } try { updateTopBar(); } catch (e) { }
    if (c.cb) setTimeout(c.cb, 120);
  }
  /* 點在亮起的範圍內 → 讓那顆按鈕照常運作,稍後進下一步;點在暗處 → 被遮罩擋下 */
  const inHole = ev => { const h = cur && cur.hole; if (!h) return false; const p = ev.touches ? ev.touches[0] : ev; if (!p) return false; return p.clientX >= h[0] && p.clientX <= h[2] && p.clientY >= h[1] && p.clientY <= h[3]; };
  document.addEventListener('pointerdown', ev => { if (cur && cur.tap && inHole(ev)) cur.pend = true; }, true);
  document.addEventListener('click', ev => {
    if (!cur || !cur.tap || !(cur.pend || inHole(ev))) return;
    cur.pend = false; const k = cur.i, o = $('tut160');
    /* 萬一點到的是遮罩本身(版面剛好在變動),把這一下轉交給底下真正的按鈕 */
    if (o && o.contains(ev.target) && inHole(ev)) {
      ev.stopPropagation(); ev.preventDefault(); o.style.display = 'none';
      const real = document.elementFromPoint(ev.clientX, ev.clientY); o.style.display = '';
      if (real && !o.contains(real)) { try { real.click(); } catch (e) { } }
    }
    setTimeout(() => { if (cur && cur.i === k) adv(); }, 380);
  }, true);
  /* ---------- 對外 ---------- */
  function run(k, cb) {
    const d = D[k]; if (!d || cur || isDone(k)) return false;
    closeSheets();   /* v166 先收起開著的面板(例如從道心閣轉世時道心閣還開著) */
    cur = { k, w: d.w, steps: d.s.slice(), i: 0, cb }; go(); return true;
  }
  /* 系統開啟後排隊:等劇情、戰鬥畫面、彈窗都收起來再開始 */
  const Q = [];
  const free = () => {
    if (cur || !state.gender || $('title34')) return false;
    if (window.ST28 && ST28.busy && ST28.busy()) return false;
    if ((window.BF113 && BF113.on) || (window.THU160 && THU160.on)) return false;
    return ![...document.querySelectorAll('[id^=modal-]')].some(e => !e.classList.contains('hidden') && vis(e));
  };
  setInterval(() => { if (!Q.length || !free()) return; const k = Q.shift(); if (!run(k)) return; }, 1000);
  const queue = k => { if (D[k] && !isDone(k) && !Q.includes(k)) Q.push(k); };
  { const o = window.sysUnlock; if (typeof o === 'function') window.sysUnlock = function (k) { const had = !!(state.un9 && state.un9[k]); const r = o.apply(this, arguments); if (!had && state.un9 && state.un9[k]) queue('u_' + k); return r; }; }
  window.TUT160 = { run, queue, done: isDone, busy: () => !!cur, D, cur: () => cur && { k: cur.k, i: cur.i, tap: cur.tap, hole: cur.hole, t: (cur.steps[cur.i] || {}).t } };
})();
