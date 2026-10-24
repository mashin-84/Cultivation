
/* ===== v49:屬性統一顯示・道果即時刷新・九九登天塔回合預估 ===== */
(function(){
  const $=id=>document.getElementById(id);
  const p1=v=>Math.round(v*10)/10;
  function upd49(){
    try{
      const st=calculateTotalStats(), c=st.crit, e=$('stat-crit');
      if(e) e.innerText=p1(c)+'%'+(c>100?'(上限100%)':'');
      const set=(id,t)=>{const el=$(id); if(el&&el.innerText!==t) el.innerText=t;};
      set('stat-critd',Math.round((window.sectCritMult?sectCritMult():1.5)*100)+'%');
      set('stat-ls',p1((window.sectLS?sectLS():0)*100)+'%');
      set('stat-dodge',p1((window.sectDodge?sectDodge():0)*100)+'%');
      const dm=window.sectDmgMult?sectDmgMult(null):1;
      set('stat-dmg','+'+p1((dm-1)*100)+'%');
      set('stat-skall','+'+p1((window.sectDmgMult?sectDmgMult({})/dm-1:0)*100)+'%');
    }catch(e){}
  }
  { const _rp=renderProfile; renderProfile=function(){ const r=_rp.apply(this,arguments); upd49(); return r; }; }
  setInterval(()=>{ const t=$('tab-records')||$('stat-crit'); if(t&&t.offsetParent!==null) upd49(); },1500);
  /* 九九登天塔:預估回合 */
  function est(f){
    const st=calculateTotalStats(), mon=towerMonster(f,st), atk=st.atk, base=Math.max(1,Math.floor(atk*atk/(atk+mon.def)));
    const S=skState(), sks=S.equipped.slice(0,skSlots()).filter(id=>id&&S.learned[id]).map(id=>{const sk=SK_BY_ID[id],c=skCalc(sk,S.learned[id].lv);return{sk,x:sk.type==='atk'?(c.hits||1)*(c.mult||0):(c.mult||0),cd:sk.cd||1,t:0};}).filter(o=>o.x>0).sort((a,b)=>b.x-a.x);
    let tot=0; const N=12;
    for(let i=0;i<N;i++){ const pick=sks.find(o=>o.t<=0); if(pick){tot+=pick.x;} else tot+=1; sks.forEach(o=>{ if(o===pick) o.t=o.cd-1; else o.t--; }); }
    const cf=1+Math.min(1,st.crit/100)*((window.sectCritMult?sectCritMult():1.5)-1), dm=window.sectDmgMult?sectDmgMult(sks[0]&&sks[0].sk):1;
    const dpr=Math.max(1,base*(tot/N)*cf*dm*2.4);
    return {r:Math.max(1,Math.ceil(mon.hp/dpr)), boss:mon.isBoss};
  }
  function twHint(){
    try{
      if(!(state.towerMode&&typeof towerOK==='function'&&towerOK())) return; const sm=$('stage-map'); if(!sm||!sm.offsetParent) return;
      const T=state.tower||{floor:1}, f=T.floor; const a=est(f); const nb=f>=100?100:Math.min(99,Math.ceil(f/9)*9); const b=(nb!==f)?est(nb):null; const fin=(f<99)?est(100):null;
      const lv=e=>e.r<=10?['#2f7a3e','穩']:e.r<=20?['#8a5a12','吃力']:['#a3352b','危險'];
      const row=(l,e)=>{const [c,w]=lv(e); return `${l}:約 <b style="color:${c}">${e.r}</b> 回合擊敗(<span style="color:${c}">${w}</span>)`;};
      let h=`<b style="color:#6b3fa0">預估</b> `+row(`第${f}層${f>=100?'(心魔)':a.boss?'(守塔Boss)':''}`,a);
      if(b) h+=`<br>`+row(`下一個守塔Boss 第${nb}層`,b);
      if(fin) h+=`<br>`+row('第100層・心魔',fin);
      h+=`<br><span style="color:#6b5f4f">粗估:10 回合內穩、20 回合內吃力、更久危險。不含五行相剋與臨場運氣;想打得快,先升神通等級、換更好的裝備。</span>`;
      let d=$('tw49'); if(!d||d.parentNode!==sm){ d=document.createElement('div'); d.id='tw49'; d.style.cssText='font-size:11px;line-height:1.6;color:#2a241c;margin:4px 4px 0;padding:6px 8px;border-radius:8px;background:rgba(255,252,244,.7);border:1px solid #d6c9ab'; sm.appendChild(d); }
      if(d.innerHTML!==h) d.innerHTML=h;
    }catch(e){}
  }
  setInterval(twHint,2000);
  const st=document.createElement('style'); st.textContent='[data-s28="pick"] span{white-space:normal}'; document.head.appendChild(st);
})();
