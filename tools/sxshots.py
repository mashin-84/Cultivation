#!/usr/bin/env python3
"""神通特效截圖(最終版192):在假舞台上逐格播 SX192 特效,輸出聯絡表。
用法:python3 tools/sxshots.py n:sk_fire,b:ult_sword,n:st_burn,b:st_+freeze 輸出.png
  n=一般歷練舞台(#bs-m) b=重要戰鬥(#bf-ei);神通 id 見 45_v192 的 SPEC;st_燃燒種類 或 st_+暈眩種類 = 持續狀態
  需先 python3 build.py dist/v197.html(路徑寫在下面 goto)。怪物圖用 src/assets/GEN3/K2.webp。"""
import asyncio, sys, io
from playwright.async_api import async_playwright
from PIL import Image, ImageDraw
EFF = sys.argv[1].split(',')   # 例: n:sk_fire,n:sk_ice,b:ult_sword
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={'width':420,'height':320})
        await pg.goto('file:///home/claude/rf/dist/v197.html'); await pg.wait_for_timeout(3500)
        await pg.evaluate('''()=>{
          document.querySelectorAll('#title34,#sp190').forEach(e=>e.remove());
          document.body.innerHTML='';
          document.body.insertAdjacentHTML('beforeend', `<style>body{background:#111!important;margin:0}</style>
          <div id="stg" style="position:fixed;left:10px;top:10px;width:400px;height:300px;background:linear-gradient(#45506a,#1b2236);overflow:hidden">
            <div id="bs-fx" style="position:absolute;inset:0"></div>
            <div id="bs-m" style="position:absolute;right:30%;bottom:40px"><img class="bs-mi m" id="mi" style="height:110px;display:block"></div>
          </div>`);
          const src=Object.values(window.GEN3||{}).find(v=>typeof v==='string'&&v.startsWith('data:image')); document.getElementById('mi').src=src;
          boot192&&boot192();
        }''') if False else None
        await pg.evaluate('''()=>{
          document.querySelectorAll('#title34,#sp190,#bf113').forEach(e=>e.remove());
          const src='file:///home/claude/rf/src/assets/GEN3/K2.webp';
          document.body.insertAdjacentHTML('beforeend', `<div id="stg" style="position:fixed;left:10px;top:10px;width:400px;height:300px;background:linear-gradient(#45506a,#1b2236);overflow:hidden;z-index:999999">
            <div id="bs-fx" style="position:absolute;left:0;top:0;right:0;bottom:0"></div>
            <div id="bs-m" style="position:absolute;right:30%;bottom:40px"><img class="bs-mi m" id="mi" style="height:110px;display:block" src="${src}"></div>
            <div id="bf-stg" style="position:absolute;left:0;top:0;right:0;bottom:0;display:none"><img id="bf-ei" style="position:absolute;left:47%;width:53%;height:44%;bottom:42%;object-fit:contain;object-position:bottom" src="${src}"></div></div>`);
        }''')
        await pg.wait_for_timeout(600)
        frames_all=[]
        for e in EFF:
            h, k = e.split(':')[0], e.split(':')[1]
            await pg.evaluate(f'''()=>{{const b=document.getElementById('bf-stg'),n=document.getElementById('bs-m'); b.style.display='{ 'block' if h=='b' else 'none'}'; n.style.display='{ 'none' if h=='b' else 'block'}'; }}''')
            await pg.wait_for_timeout(100)
            row=[]
            if k.startswith('st_'):
                dot,stun=(k[3:].split('+')+['',''])[:2] if '+' in k else ((k[3:],''))
                await pg.evaluate(f"SX192.sync('{h}',{{dot:{repr(dot) if dot else 'null'},stun:{repr(stun) if stun else 'null'}}})")
                for t in [150,500,1000]:
                    await pg.wait_for_timeout(t if not row else 400); row.append(Image.open(io.BytesIO(await pg.screenshot(clip={'x':10,'y':10,'width':400,'height':300}))))
                await pg.evaluate(f"SX192.sync('{h}',{{}})")
                await pg.wait_for_timeout(500)
            else:
                nn = 5 if k in('sk_swords',) else 1
                await pg.evaluate(f"()=>{{ for(let i=0;i<{nn};i++) setTimeout(()=>SX192.hit('{h}','{k}',null,{{i,n:{nn}}}), i*120); }}")
                for t in [60,90,120,160,220,300]:
                    await pg.wait_for_timeout(t); row.append(Image.open(io.BytesIO(await pg.screenshot(clip={'x':10,'y':10,'width':400,'height':300}))))
                await pg.wait_for_timeout(1400)
            frames_all.append((e,row))
        W=260;H=195
        sheet=Image.new('RGB',(W*6,H*len(frames_all)),'black'); d=ImageDraw.Draw(sheet)
        for r,(e,row) in enumerate(frames_all):
            for c,im in enumerate(row): sheet.paste(im.resize((W,H)),(c*W,r*H))
            d.text((4,r*H+4),e,fill='yellow')
        sheet.save(sys.argv[2]); print('saved')
        await b.close()
asyncio.run(main())
