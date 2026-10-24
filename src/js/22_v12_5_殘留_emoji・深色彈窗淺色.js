
/* ===== v12.5 殘留 emoji・深色彈窗淺色 ===== */
(function(){
  const G=window.GEN3||(typeof GEN3!=='undefined'?GEN3:{});
  let css='.ar70{display:inline-block;width:1.4em;height:1.4em;border-radius:5px;background:center/cover no-repeat;vertical-align:-.3em;box-shadow:0 0 0 1px rgba(80,60,20,.25)}';
  for(let i=0;i<8;i++) if(G['A'+i]) css+=`.ar70[data-ai="${i}"]{background-image:url(${G['A'+i]})}`;
  css+=`
[id^=modal-]:not(#modal-gender14)>div{background:radial-gradient(ellipse at 50% 0,#fbf8ef,#efe6d2 70%,#e5d9bd)!important;border-color:#cdbf9f!important;color:#2a241c!important}
[id^=modal-]:not(#modal-gender14){background:rgba(30,24,16,.55)!important}
[id^=modal-]:not(#modal-gender14)>div .bg-slate-900,[id^=modal-]:not(#modal-gender14)>div .bg-slate-950,[id^=modal-]:not(#modal-gender14)>div .bg-slate-800,[id^=modal-]:not(#modal-gender14)>div [class*="bg-slate-9"],[id^=modal-]:not(#modal-gender14)>div [class*="bg-black"]{background:rgba(255,252,244,.75)!important}
[id^=modal-]:not(#modal-gender14) [class*="border-slate"],[id^=modal-]:not(#modal-gender14) [class*="border-amber-9"],[id^=modal-]:not(#modal-gender14) [class*="border-red-9"],[id^=modal-]:not(#modal-gender14) [class*="border-purple-9"]{border-color:#d6c9ab!important}
#modal-tribulation canvas{border-radius:10px}`;
  const st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);
  document.querySelectorAll('[id^=modal-]').forEach(m=>{ if(m.id!=='modal-gender14'&&m.firstElementChild) m.firstElementChild.classList.add('ink53'); });
})();
