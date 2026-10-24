
window.FUR68={a:"data:image/webp;base64,@@IMG:FUR68/a@@",f:"data:image/webp;base64,@@IMG:FUR68/f@@",tw:"data:image/webp;base64,@@IMG:FUR68/tw@@"};
(function(){
  const bg={ch:"data:image/webp;base64,@@IMG:FUR68_bg/ch@@",cr:"data:image/webp;base64,@@IMG:FUR68_bg/cr@@",iv:"data:image/webp;base64,@@IMG:FUR68_bg/iv@@",rc:"data:image/webp;base64,@@IMG:FUR68_bg/rc@@"};
  const veil='linear-gradient(rgba(250,246,236,.42),rgba(250,246,236,.5))';
  const st=document.createElement('style');
  st.textContent=`#ch51{background:${veil},url(${bg.ch}) center bottom/cover!important}
#cr52{background:${veil},url(${bg.cr}) center/cover!important}
#iv54{background:linear-gradient(rgba(250,246,236,.6),rgba(250,246,236,.66)),url(${bg.iv}) center/cover!important}
#rc54{background:${veil},url(${bg.rc}) center/cover!important}
#cr52 .fur img.f68{height:100%;max-height:290px;width:auto;max-width:86%;object-fit:contain;filter:drop-shadow(0 6px 8px rgba(80,50,20,.25));animation:f68 2.6s ease-in-out infinite}
@keyframes f68{0%,100%{filter:drop-shadow(0 6px 8px rgba(80,50,20,.25)) brightness(1)}50%{filter:drop-shadow(0 6px 12px rgba(230,120,40,.45)) brightness(1.04)}}
#cr52 .fur .pd{top:2%!important}`;
  document.head.appendChild(st);
  try{ if(window.CR52) CR52.render(true); window._mapSig=''; if(typeof renderMap==='function') renderMap(); }catch(e){}
})();
