
/* ===== v48:終局難度(天地增厚・輪迴階梯・加成收斂)+ 裝備對比 A➔B + 突破預覽 ===== */
(function(){
  const $=id=>document.getElementById(id);
  const fm=v=>typeof formatNum==='function'?formatNum(Math.floor(v)):String(Math.floor(v));
/* --- 觸控熱區 ≥44px(只加大熱區/最小高度,不改版面) --- */
  const st=document.createElement('style');
  st.textContent=`#btn-trigger-breakthrough,#btn-upgrade-array,#btn-upgrade-insight,#btn-auto-equip-best,#btn-use-heal,#btn-auto-pill,#btn-step-explore,#btn-auto-explore,#btn-speed-out,#btn-clear-log,#btn-use-all-pills,#btn-sell-spare-equip,#btn-sell-low-mats,#subtab-alchemy-btn,#subtab-forge-btn,#x32-mk-btn,#x32-asub-d,#x32-asub-a,.x5-btn,.inv13-chips button,#pc44 button,#btn-look14{min-height:44px}
#btn-edit-name,#btn-story28,#btn-menu25,#btn-events-batch,#btn-pending-events{position:relative}
#btn-edit-name::after,#btn-story28::after,#btn-menu25::after,#btn-events-batch::after,#btn-pending-events::after{content:'';position:absolute;left:-6px;right:-6px;top:-7px;bottom:-7px}
#btn-edit-name::after{left:-12px;right:-12px}
.tap-effect.rounded-full,.tap-effect.rounded[class*="px-3"],#tab-records>button,#tab-records .w-full{min-height:44px}`;
  document.head.appendChild(st);
  /* --- 裝備對比:以實際總屬性前後差計算(含強化、套裝、器紋) --- */
  function totals(){ X5.bust(); const s=calculateTotalStats(); return {cp:s.combatPower,atk:s.atk,def:s.def,hp:s.hp}; }
  const up='#86efac', dn='#f87171', eq='#94a3b8';
  const row=(nm,a,b)=>{ const d=b-a, c=d>0?up:d<0?dn:eq, sg=d>0?'+':d<0?'-':''; return `<div style="flex:1 1 100%;display:flex;justify-content:space-between;gap:8px;font-size:12px"><span style="color:#cbd5e1">${nm}</span><span style="color:#e2e8f0">${fm(a)} ➔ <b style="color:${c}">${fm(b)}</b> <span style="color:${c}">${d===0?'±0':'('+sg+fm(Math.abs(d))+')'}</span></span></div>`; };
  window.cmp48=function(it,cur){
    try{
      const slot=it.slot; if(!slot) return '';
      const A=totals(), old=(state.equipment||{})[slot]; let B;
      state.equipment[slot]=it.id; try{ B=totals(); } finally { state.equipment[slot]=old; X5.bust(); }
      const head=cur?`<div style="flex:1 1 100%;font-size:11px;color:#94a3b8">與現穿【${cur.name}】相比</div>`:`<div style="flex:1 1 100%;font-size:11px;color:#94a3b8">此欄位尚未穿戴</div>`;
      return head+row('戰力',A.cp,B.cp)+row('攻擊',A.atk,B.atk)+row('防禦',A.def,B.def)+row('氣血',A.hp,B.hp);
    }catch(e){ try{X5.bust();}catch(_){} return ''; }
  };
  /* --- 突破預覽 --- */
  function bkInit(){
    const d=$('breakthrough-desc'); if(!d||$('bk48')) return;
    const b=document.createElement('div'); b.id='bk48'; b.style.cssText='margin:-4px 0 8px;padding:7px 9px;border-radius:8px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);font-size:11px;line-height:1.7;color:#cbd5e1';
    d.insertAdjacentElement('afterend',b);
  }
  function bkUpdate(){
    try{
      if(document.hidden||!(document.getElementById('tab-abode')||{}).offsetParent) return;   /* v168 效能:不在洞府頁不算 */
      bkInit(); const b=$('bk48'); if(!b||!b.offsetParent&&b.style.display!=='none'&&!document.getElementById('tab-abode').offsetParent) return;
      const r=state.realmIdx, sub=state.subRealm, R=REALM_DATA[r]; if(!R||!REALM_DATA[r+1]&&sub>=R.subMax){ b.style.display='none'; return; }
      const major=sub>=R.subMax, nr=major?r+1:r, ns=major?1:sub+1;
      const A=totals(); const o={r:state.realmIdx,s:state.subRealm}; let B;
      state.realmIdx=nr; state.subRealm=ns; try{ B=totals(); } finally { state.realmIdx=o.r; state.subRealm=o.s; X5.bust(); }
      let h=`<div style="color:#fcd34d;font-weight:700;margin-bottom:2px">突破後預覽</div>`;
      h+=row('戰力',A.cp,B.cp)+row('氣血',A.hp,B.hp)+row('攻擊',A.atk,B.atk);
      if(major){ const L0=R.maxLifespan, L1=REALM_DATA[nr].maxLifespan; h+=row('壽元上限',L0,L1); try{ const c=getTribulationChance(); h+=`<div style="display:flex;justify-content:space-between"><span>渡劫成功率</span><b style="color:#fcd34d">${c.totalChance}%</b></div>`; }catch(e){} }
      b.style.display='block'; b.innerHTML=h;
    }catch(e){ try{X5.bust();}catch(_){} }
  }
  setInterval(bkUpdate,2500); setTimeout(bkUpdate,1200);
  /* --- 終局難度:天地增厚(方案二)+ 輪迴階梯(方案三) --- */
  const SC={on:false,kh:1,ka:1,cm:1,idx:-1};
  window.SC48=SC;
  function scaleArea(area){
    try{
      const idx=AREAS_DATA.findIndex(a=>a.id===area.id); SC.on=false; SC.idx=idx;
      if(idx<0) return area;
      const cyc=Math.min(5,state.reincarnationCount|0), cm=1+.05*cyc;   /* v168 周目怪物加成 20%→5% */
      let kh=1,ka=1;
      if(state.realmIdx>=5 && idx>=Math.min(7,state.realmIdx-1)){
        const rec=(CAL9&&CAL9.REC&&CAL9.REC[idx])||0, cp=calculateTotalStats().combatPower;
        if(rec>0){ const r=cp/rec; if(r>1.2){ kh=Math.min(6,Math.pow(r/1.2,.85));   /* v168 原 3.8 次方:越強打怪越慢,改成增幅低於戰力增幅 */ ka=Math.min(3,Math.pow(r/1.2,.45)); } }
      }
      SC.kh=kh; SC.ka=ka; SC.cm=cm; SC.on=(kh>1.05||cyc>0);
      if(!SC.on) return area;
      return Object.assign({},area,{monsters:area.monsters.map(m=>{ const hb=m.isBoss?Math.max(1,kh*.5):kh; return Object.assign({},m,{hp:Math.floor(m.hp*hb*cm),atk:Math.floor(m.atk*ka*cm)}); })});
    }catch(e){ return area; }
  }
  const _smb=startMonsterBattle;
  startMonsterBattle=function(area,forceBoss){ if(area&&typeof area.id==='number'&&area.id<90) area=scaleArea(area); return _smb.call(this,area,forceBoss); };
  /* 區域建議戰力列補一行說明 */
  function note(){
    const el=$('area-rec9'); if(!el) return; let n=$('area-sc48'); if(!n){ n=document.createElement('div'); n.id='area-sc48'; n.style.cssText='font-size:11px;color:#a5b4fc;margin-top:2px'; el.insertAdjacentElement('afterend',n); }
    try{
      const idx=state.currentArea||0, cyc=Math.min(5,state.reincarnationCount|0); let t='';
      if(state.realmIdx>=5 && idx>=Math.min(7,state.realmIdx-1)){ const rec=(CAL9.REC||[])[idx]||0, cp=calculateTotalStats().combatPower; if(rec>0&&cp/rec>1.2) t='天地增厚:此境妖魔感應道行,氣血與殺伐隨之增強。'; }
      if(cyc>0) t+=(t?' ':'')+`第${cyc+1}世:天地規則更嚴,妖魔再增 ${cyc*20}%。`;
      n.textContent=t; n.style.display=t?'block':'none';
    }catch(e){}
  }
  setInterval(note,2000);
})();
