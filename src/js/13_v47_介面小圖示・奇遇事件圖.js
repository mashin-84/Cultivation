
/* ===== v47:介面小圖示・奇遇事件圖 ===== */
(function(){
  const A=window.A47, U=window.A45||{}, L=window.A46||{};
  const src={}; Object.keys(A).forEach(k=>src['a47_'+k]=A[k]);
  src.a47_ui_set=U.ui_set; src.a47_ui_look=U.ui_look; src.a47_ui_adv=U.ui_adv; src.a47_ui_map=U.ui_map; src.a47_ui_shield=U.ui_shield;
  const st=document.createElement('style');
  st.textContent=Object.keys(src).filter(k=>src[k]).map(k=>`.ii-${k}{background-image:url(${src[k]})}`).join('')+'.ii-a47_ev_eagle,.ii-a47_ev_feather,.ii-a47_ev_stone,.ii-a47_ev_sword,.ii-a47_ev_ink,.ii-a47_ev_poison,.ii-a47_ev_sage,.ii-a47_ev_go{border-radius:10px}';
  document.head.appendChild(st);
})();
