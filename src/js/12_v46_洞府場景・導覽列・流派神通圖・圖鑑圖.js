
/* ===== v46:洞府場景・導覽列・流派神通圖・圖鑑圖 ===== */
(function(){
  const A=window.A46, G=GEN3;
  const st=document.createElement('style');
  st.textContent=`#hub44{background-size:cover!important;background-position:center!important}
#hub44 .h44{background:rgba(0,0,0,0)!important;border:1px solid rgba(255,255,255,0);box-shadow:none!important;justify-content:flex-end;padding-bottom:3px}
#hub44 .h44 .ic{display:none}
#hub44 .h44 .nm{background:rgba(2,6,23,.72);padding:1px 9px;border-radius:9px;border:1px solid rgba(251,191,36,.35);color:#fde68a}
#hub44 .h44 .sb,#hub44 .h44 .sb2{text-shadow:0 1px 3px #000,0 0 6px #000;color:#f1f5f9}
#hub44 .h44.lkd{background:rgba(2,6,23,.58)!important;filter:none;border-radius:14px}
#hub44 .h44:active{background:rgba(255,255,255,.12)!important}
#nav25 button img.n46{object-fit:contain;border-radius:0;width:38px;height:38px}
#nav25 button.on img.n46{box-shadow:none;filter:drop-shadow(0 0 5px #f59e0b)}
.cx-i .ic .gi,.cx-i .ic .dx46{width:44px;height:44px;object-fit:contain;display:block;margin:0 auto;border-radius:10px}`;
  document.head.appendChild(st);
  const hub=document.getElementById('hub44'); if(hub) hub.style.background=`url("${A.scene}") center/cover`;
  /* 神通圖 */
  const _sk=skArt; skArt=function(id,lock){ if(A[id]) return `<img class="gi ${lock?'gl':''}" src="${A[id]}" alt="" draggable="false">`; return _sk.apply(this,arguments); };
  /* 圖鑑 */
  let MONK=null;
  function build(){ MONK={}; let mi=0; AREAS_DATA.forEach(a=>a.monsters.forEach(m=>{ mi++; MONK[m.id]='M'+String(mi).padStart(2,'0'); })); TOWER_MON.forEach((t,i)=>MONK['twn_'+t[0]]='K'+(i+1)); WB_POOL.forEach((p,i)=>MONK['wb_'+p[0]]='W'+(i+1)); }
  window.dx46=m=>{ try{ if(!MONK) build(); const k=MONK[m.id]; return k&&G[k]?`<img class="dx46" src="${G[k]}" alt="" draggable="false">`:m.e; }catch(e){ return m.e; } };
  window.col46=(kind,o)=>{ try{ if(kind==='t'&&typeof tArt==='function') return tArt(o,false)||''; if(kind==='p'&&typeof pArt==='function') return pArt(o,false)||''; if(kind==='s') return skArt(o.id,false)||''; }catch(e){} return ''; };
})();
