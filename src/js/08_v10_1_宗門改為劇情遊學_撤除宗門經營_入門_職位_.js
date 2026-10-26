
/* ===== v10.1:宗門改為劇情遊學 —— 撤除宗門經營(入門/職位/任務/出師),每個大境界一次遊學機緣:擇一宗門、過守山長老試煉、得獨門功法與信物 ===== */
(function () {
  const A = window.ST28, SE = window.SECT9; if (!A || !SE) return;
  const { bg, say, nar, set, ch } = A; const S = say, N = nar;
  const st = document.createElement('style'); st.textContent = '#seg25{display:none!important}.nav-tab-btn[data-tab="tab-sect"]{display:none!important}'; document.head.appendChild(st);
  /* 舊存檔:仍掛單中的宗門直接結束(已學功法與已得信物保留) */
  function clearOld() { if (state.sect) { state.sect = null; try { saveGame(); } catch (e) { } } }
  setTimeout(clearOld, 1500);
  const inGrad = r => Object.keys(state.sectGrad || {}).some(id => { const x = SE.SECTS.find(t => t.id === id); return x && x.r === r; });
  function grant(id) {
    const s = SE.SECTS.find(x => x.id === id); if (!s) return;
    if (!state.sectGrad || typeof state.sectGrad !== 'object') state.sectGrad = {};
    if (!state.sectSk || typeof state.sectSk !== 'object') state.sectSk = {};
    const cap = 1 + Math.floor((state.realmIdx || 0) / 2), eqn = Object.keys(state.sectSk).filter(k => state.sectSk[k] && state.sectSk[k].eq).length;
    state.sectGrad[id] = 1; if (!state.sectSk[id]) state.sectSk[id] = { eq: eqn < cap };
    const tid = 'st_' + id; if (ITEMS[tid]) state.inventory[tid] = (state.inventory[tid] || 0) + 1;
    state.sect = null;
    try { saveGame(); renderInventory(); updateTopBar(); } catch (e) { }
    try { showToast(`🏯 習得【${s.sk.n}】,獲得信物【${s.tr.n}】`); } catch (e) { }
  }
  window.YX43 = { grant };
  const IMM = r => r >= 5;
  const INTRO = [
    ['練氣四層,腰間的青雲令牌,在某個清晨微微發燙。', '山下的坊市傳來消息:幾家宗門同時開了山門,收各派遊學的客卿。'],
    ['築基之後,你第一次持令牌獨自下山。', '各家宗門的山門前,都掛出了「客卿入山」的木牌。看的是令牌,收的是本事。'],
    ['金丹初成,青雲令牌的黑檀木面上,多了一道淺淺的金紋。', '幾家以丹、以劍、以佛法立宗的大派,遣人送來了請帖。'],
    ['元嬰出竅,神識一掃便是十里。令牌在你掌心,沉得像一座山。', '雷崖、劍閣、天機、北冥——幾家大宗的守山長老,都在等著看青雲宗的人。'],
    ['化神之境,舊日的青雲令牌,竟還有人認得。', '太虛、玄冥、萬法……幾家隱世大宗,為你開了一道側門。'],
    ['仙界亦有宗門。你的仙籍,是那塊青雲令牌在天門轉來的。', '凌霄、瑤光、九幽、蓬萊,諸仙門都願收一位下界飛升的客卿——只是他們的試煉,不留情面。'],
    ['玄仙境界,三界之中能教你的人,已經不多了。', '瑤池、弱水、蟠桃、觀潮、噬魂——幾家古老的仙宗,仍守著不外傳的法門。'],
    ['金仙之境,你離「一念」只差最後幾步。', '混沌、星辰、輪迴、劍冢、魔殿——最後一批願意開門的宗門,都在等你。']
  ];
  for (let r = 0; r <= 7; r++) {
    const list = SE.SECTS.filter(x => x.r === r); if (!list.length) continue;
    const need = r === 0 ? 4 : 2;
    const opts = list.map(x => ({
      t: `${x.n}——習《${x.sk.n.replace(/[《》]/g, '')}》`, e: {},
      get info() { let a = '', b = ''; try { a = window.X5.fxText(x.sk.E); b = window.X5.fxText(x.P); } catch (e) { } return `<span style="display:block;font-weight:500;font-size:11.5px;line-height:1.55;color:#cbd5e1;margin-top:3px;text-align:left">【${x.al === 'z' ? '正道' : x.al === 'x' ? '邪派' : '中立'}】${x.sk.d}<br>功法效果:${a}<br>入門被動:${b}<br>信物:${x.tr.n}</span>`; },
      r: [
        N(`你持青雲令牌,叩響了【${x.n}】的山門。${x.d}`),
        S('弟子', '', `青雲宗的客卿?……請。守山長老在演武場等你。`),
        N(`演武場上,一位長老負手而立。他不看你的令牌,只看你的手。`),
        A.fight({ name: `${x.n}守山長老`, emoji: '🧙', label: `${x.n}・遊學試煉`, tier: r, target: 1.5, skill: '鎮山之威', noskip: 1 }),
        set({ fn: () => grant(x.id) }),
        N(`長老收劍,點了點頭:「${x.sk.n},本門不傳之秘。今日傳你,出了這道門,別辱沒了它。」`),
        N(`他又遞來一物——【${x.tr.n}】。${x.tr.d}`),
        N(`〔已習得宗門功法【${x.sk.n}】並獲得信物【${x.tr.n}】。宗門功法可在洞府【山門】裝備。〕`)
      ]
    }));
    A.add({
      id: 'yx.' + r, ch: Math.min(8, r + 1), title: `${['練氣', '築基', '金丹', '元嬰', '化神', '真仙', '玄仙', '金仙'][r]}・遊學`, opt: true, auto: true, after: r === 0 ? 's.sect' : undefined,
      at: () => (state.realmIdx || 0) === r && (state.subRealm || 1) >= need && !inGrad(r),
      beats: [
        bg(IMM(r) ? 'gate_xian' : 'gate'),
        N(INTRO[r][0]), N(INTRO[r][1]),
        S('墨塵', 'kind', r < 5 ? '去吧。一個境界,只挑一家。挑你缺的,不是挑你喜歡的。' : '(令牌上,隱約還留著一縷熟悉的酒氣)'),
        ch('s', 'yx' + r, opts, '持青雲令牌,擇一宗門前往遊學(每個境界只能擇一家,選定後不可更改,請看清功法再選)')
      ]
    });
  }
})();
