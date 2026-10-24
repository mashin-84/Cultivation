/* ===== v17.0:美術接入 —— 劇情背景/立繪(Gemini 生成)、劇情戰敵人、功法圖示 ===== */
(function () {
  const P = {"bg":{"village_dusk":"data:image/webp;base64,@@IMG:P_bg/village_dusk@@","village_fire":"data:image/webp;base64,@@IMG:P_bg/village_fire@@","tree":"data:image/webp;base64,@@IMG:P_bg/tree@@","forest":"data:image/webp;base64,@@IMG:P_bg/forest@@","gate":"data:image/webp;base64,@@IMG:P_bg/gate@@","hall":"data:image/webp;base64,@@IMG:P_bg/hall@@","night":"data:image/webp;base64,@@IMG:P_bg/night@@","grave":"data:image/webp;base64,@@IMG:P_bg/grave@@","ruin":"data:image/webp;base64,@@IMG:P_bg/ruin@@","battle":"data:image/webp;base64,@@IMG:P_bg/battle@@","demon":"data:image/webp;base64,@@IMG:P_bg/demon@@","dream":"data:image/webp;base64,@@IMG:P_bg/dream@@","void":"data:image/webp;base64,@@IMG:P_bg/void@@","sky":"data:image/webp;base64,@@IMG:P_bg/sky@@","hall_xian":"data:image/webp;base64,@@IMG:P_bg/hall_xian@@","gate_xian":"data:image/webp;base64,@@IMG:P_bg/gate_xian@@"},"ch":{"mo_kind":"data:image/webp;base64,@@IMG:P_ch/mo_kind@@","mo_cold":"data:image/webp;base64,@@IMG:P_ch/mo_cold@@","mo_sad":"data:image/webp;base64,@@IMG:P_ch/mo_sad@@","su_happy":"data:image/webp;base64,@@IMG:P_ch/su_happy@@","su_worry":"data:image/webp;base64,@@IMG:P_ch/su_worry@@","su_cry":"data:image/webp;base64,@@IMG:P_ch/su_cry@@","ye_m_cold":"data:image/webp;base64,@@IMG:P_ch/ye_m_cold@@","ye_m_smile":"data:image/webp;base64,@@IMG:P_ch/ye_m_smile@@","ye_f_cold":"data:image/webp;base64,@@IMG:P_ch/ye_f_cold@@","ye_f_smile":"data:image/webp;base64,@@IMG:P_ch/ye_f_smile@@","ba_cute":"data:image/webp;base64,@@IMG:P_ch/ba_cute@@","ba_eat":"data:image/webp;base64,@@IMG:P_ch/ba_eat@@","tian_a":"data:image/webp;base64,@@IMG:P_ch/tian_a@@","q_a":"data:image/webp;base64,@@IMG:P_ch/q_a@@","situ_a":"data:image/webp;base64,@@IMG:P_ch/situ_a@@","xg_a":"data:image/webp;base64,@@IMG:P_ch/xg_a@@"},"mon":{"司徒衡":"data:image/webp;base64,@@IMG:P_mon/司徒衡@@","執法長老・司徒衡":"data:image/webp;base64,@@IMG:P_mon/執法長老・司徒衡@@","鎮界神將":"data:image/webp;base64,@@IMG:P_mon/鎮界神將@@","仙衛統領":"data:image/webp;base64,@@IMG:P_mon/仙衛統領@@","九幽魔將":"data:image/webp;base64,@@IMG:P_mon/九幽魔將@@"},"tech":{"n34_tech_1":"data:image/webp;base64,@@IMG:P_tech/n34_tech_1@@","n34_tech_2":"data:image/webp;base64,@@IMG:P_tech/n34_tech_2@@","n34_tech_3":"data:image/webp;base64,@@IMG:P_tech/n34_tech_3@@","n34_tech_4":"data:image/webp;base64,@@IMG:P_tech/n34_tech_4@@","n34_tech_5":"data:image/webp;base64,@@IMG:P_tech/n34_tech_5@@","n34_tech_6":"data:image/webp;base64,@@IMG:P_tech/n34_tech_6@@","n34_tech_7":"data:image/webp;base64,@@IMG:P_tech/n34_tech_7@@"}};
  window.ART28 = window.ART28 || { bg: {}, ch: {} };
  Object.assign(ART28.bg, P.bg); Object.assign(ART28.ch, P.ch); Object.assign(ART28.ch,{'弟子_a':'data:image/webp;base64,@@IMG:ART28_ch/弟子_a@@','管事_a':'data:image/webp;base64,@@IMG:ART28_ch/管事_a@@','魔道長老_a':'data:image/webp;base64,@@IMG:ART28_ch/魔道長老_a@@','趙莽_a':'data:image/webp;base64,@@IMG:ART28_ch/趙莽_a@@','心魔_a':'data:image/webp;base64,@@IMG:ART28_ch/心魔_a@@','散修_a':'data:image/webp;base64,@@IMG:ART28_ch/散修_a@@','老仙_a':'data:image/webp;base64,@@IMG:ART28_ch/老仙_a@@','仙人_a':'data:image/webp;base64,@@IMG:ART28_ch/仙人_a@@','村民_a':'data:image/webp;base64,@@IMG:ART28_ch/村民_a@@','師弟_a':'data:image/webp;base64,@@IMG:ART28_ch/師弟_a@@','魔將_a':'data:image/webp;base64,@@IMG:ART28_ch/魔將_a@@','仙衛統領_a':'data:image/webp;base64,@@IMG:ART28_ch/仙衛統領_a@@','戰書_a':'data:image/webp;base64,@@IMG:ART28_ch/戰書_a@@'}); Object.assign(ART28.ch, {gu_a:'data:image/webp;base64,@@IMG:ART28_ch/gu_a@@',yh_a:'data:image/webp;base64,@@IMG:ART28_ch/yh_a@@',lr_a:'data:image/webp;base64,@@IMG:ART28_ch/lr_a@@',tl_a:'data:image/webp;base64,@@IMG:ART28_ch/tl_a@@'}); P.mon['顧青衍']='data:image/webp;base64,@@IMG:P_mon/顧青衍@@';
  /* 劇情戰的敵人:戰鬥場景用圖(其餘仍用原有怪物圖或 emoji) */
  XT.fxSetup170 = _s => function () {
    _s.apply(this, arguments);
    try {
      const B = currentBattle; if (!B || !B.monster) return;
      const u = P.mon[B.monster.name]; if (!u) return;
      const s = document.getElementById('battle-stage'), me = s && s.querySelector('.bs-memo');
      if (me) me.innerHTML = `<img class="bs-mi k${['仙衛統領', '司徒衡', '執法長老・司徒衡'].includes(B.monster.name) ? ' fl87' : ''}" src="${u}" alt="" draggable="false">`;
    } catch (e) { }
  };
  /* 功法卡片圖示 */
  const st = document.createElement('style');
  st.textContent = '.ii-t34{display:inline-block;width:2.3em;height:2.3em;background:center/contain no-repeat;vertical-align:-.8em;margin-right:.35em;flex:none}.ii-t34.gray{filter:grayscale(1) opacity(.55)}' +
    Object.keys(P.tech).map(k => `.ii-${k}{background-image:url(${P.tech[k]})}`).join('');
  document.head.appendChild(st);
  const decoTech = () => {
    const box = document.getElementById('techniques-list'); if (!box) return;
    TECHNIQUES_DATA.forEach(def => {
      const k = 'n34_' + def.id; if (!P.tech[k]) return;
      box.querySelectorAll('span.font-serif-tc').forEach(sp => {
        if (sp.textContent.trim() !== def.name || sp.previousElementSibling && sp.previousElementSibling.classList.contains('ii-t34')) return;
        const u = (state.techniques || []).find(t => t.id === def.id), i = document.createElement('i');
        i.className = 'ii-t34 ii-' + k + (u && u.learned ? '' : ' gray'); sp.parentNode.insertBefore(i, sp);
      });
    });
  };
  const _rt = renderTechniques;
  renderTechniques = function () { const r = _rt.apply(this, arguments); try { decoTech(); } catch (e) { } return r; };
})();

