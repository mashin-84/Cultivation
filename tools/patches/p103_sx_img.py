p='src/js/45_v192_神通特效.js'; t=open(p,encoding='utf8').read()
def rep(a,b):
    global t; assert t.count(a)==1,(t.count(a),a[:50]); t=t.replace(a,b)
names='arcs bigsword bloodcres bloodsplash bolt1 bolt2 bolt3 boom bubbles claws crack crescent dust fire1 fire2 fire3 fistburst flash formation ghost iceburst iceshell icespike mist orb psplash rings rocks shock slashthin snowflake stars sword swords5 voidslash vortex'.split()
imgmap='const IMG = {'+', '.join(f'{n}: "data:image/webp;base64,@@IMG:SX192/{n}@@"' for n in names)+'};\n  const im = n => `<img src="${IMG[n]}" draggable="false" alt="">`;\n'
rep("  const CSS = `\n", "  "+imgmap+"  const CSS = `\n")
css='''.sx-e img{display:block;width:100%;height:100%;object-fit:contain;pointer-events:none}
.sx-pop{animation:sxPop calc(var(--t,.6s)*var(--sxd,1)) ease-out forwards}
@keyframes sxPop{0%{transform:scale(.3) rotate(var(--r0,0deg));opacity:0}18%{opacity:1}65%{opacity:1}100%{transform:scale(1.12) rotate(var(--r1,0deg));opacity:0}}
.sx-fire{left:-16%;width:132%;bottom:-6%;height:72%;transform-origin:50% 100%;animation:sxFi calc(.95s*var(--sxd,1)) ease-out forwards}
.sx-fire img{object-position:50% 100%}
@keyframes sxFi{0%{transform:scaleY(.15) scaleX(.8);opacity:0}22%{transform:scaleY(1);opacity:1}70%{transform:scaleY(1.06);opacity:1}100%{transform:scaleY(.8) translateY(-8%);opacity:0}}
.sx-up{animation:sxUp calc(var(--t,1s)*var(--sxd,1)) ease-out forwards}
@keyframes sxUp{0%{transform:translateY(12%) scale(.5);opacity:0}25%{opacity:.95}100%{transform:translateY(-30%) scale(1.15);opacity:0}}
.sx-fl2{animation:sxFall calc(.8s*var(--sxd,1)) cubic-bezier(.2,.6,.5,1) forwards}
@keyframes sxFall{0%{transform:translateY(-120%) scale(.6);opacity:0}25%{opacity:1}100%{transform:translateY(0) scale(1);opacity:1}}
.sx-vi{left:50%;top:50%;width:150%;height:150%;margin:-75% 0 0 -75%;animation:sxVort calc(.85s*var(--sxd,1)) ease-in-out forwards}
.sx-shell{left:-8%;top:-6%;width:116%;height:110%;transform-origin:50% 100%;animation:sxIceIn calc(.3s*var(--sxd,1)) cubic-bezier(.2,1.4,.4,1) both}
.sx-shell img{object-fit:fill}
.sx-stI{left:50%;top:-30%;width:70%;height:34%;margin-left:-35%;animation:sxSway 1.6s ease-in-out infinite alternate}
@keyframes sxSway{from{transform:translateX(-7%) rotate(-5deg)}to{transform:translateX(7%) rotate(5deg)}}
.sx-ringI{left:-6%;top:30%;width:112%;height:46%;animation:sxBob 1.5s ease-in-out infinite alternate}
@keyframes sxBob{from{transform:translateY(-8%) scale(.96);opacity:.7}to{transform:translateY(8%) scale(1.03);opacity:1}}
.sx-orbi{left:40%;top:40%;width:10%;height:10%;animation:sxOrb calc(.8s*var(--sxd,1)) ease-in forwards}
'''
rep("/* 持續狀態 */\n", css+"/* 持續狀態 */\n")
js='''  /* v197 改用生成圖(動畫沿用);上面程式繪製的函式留作後備 */
  const pop = (a, n, st, life, t, r0, r1) => E(a, im(n), 'sx-pop', `${st || ''}--t:${t || .6}s;--r0:${r0 || 0}deg;--r1:${r1 || 0}deg`, life || 700);
  const mid = 'left:-15%;top:-12%;width:130%;height:124%;';
  Object.assign(FX, {
    slash(a, o) { pop(a, 'crescent', `left:-10%;top:-8%;width:120%;height:116%;`, 650, .5, R(-14, 14), R(-6, 6)); glow(a, '#e0f2fe', .9); },
    flow(a, o) { const i = o.i || 0; pop(a, 'slashthin', `left:-12%;top:-10%;width:124%;height:120%;`, 600, .45, -35 + (i % 3) * 35, -35 + (i % 3) * 35); },
    fire(a, o) {
      sil(a, o.ghost ? 'rgba(56,189,248,.5)' : 'rgba(239,68,68,.5)', 'sx-flash');
      E(a, im(o.ghost ? 'ghost' : 'fire' + (1 + Math.floor(Math.random() * 3))), 'sx-fire', '', 1000);
    },
    ice(a, o) {
      glow(a, '#7dd3fc', 1.1); pop(a, 'iceburst', mid, 750, .65, -20, 20); pop(a, 'snowflake', 'left:5%;top:5%;width:60%;height:60%;', 800, .75, 0, 90);
      if (o.big) E(a, im('icespike'), 'sx-up', `left:-20%;width:140%;height:90%;bottom:-6%;--t:1.1s`, 1200);
    },
    thunder(a, o) {
      const small = o.small || o.n > 1;
      E(a, im(small ? 'bolt1' : 'bolt2'), 'sx-bolt', `left:${small ? R(30, 46).toFixed(0) : 30}%;width:${small ? 26 : 42}%`, 560);
      glow(a, '#93c5fd', 1.2); sflash(a, '#bfdbfe'); pop(a, 'arcs', mid, 650, .5, R(-10, 10), 0);
    },
    god(a, o) {
      E(a, im('bolt3'), 'sx-bolt', 'left:-10%;width:120%', 700); glow(a, '#dbeafe', 1.7); sflash(a, '#fff');
      pop(a, 'boom', 'left:-20%;top:-10%;width:140%;height:120%;', 750, .7, 0, 0); E(a, im('shock'), 'sx-pop', 'left:-25%;width:150%;height:34%;bottom:-6%;--t:.7s', 800);
    },
    swords(a, o) {
      const i = o.i || 0; E(a, im('sword'), 'sx-sword', `left:${(14 + (i * 19) % 64)}%;--r:${R(-12, 12).toFixed(0)}deg`, 800);
      setTimeout(() => { try { if (a.isConnected) glow(a, '#e0f2fe', .8); } catch (e) { } }, 230 / spd(a._h));
    },
    bigsword(a, o) {
      E(a, im('bigsword'), 'sx-bs', '', 1000);
      setTimeout(() => { try { if (a.isConnected) { glow(a, '#fde68a', 1.9); sflash(a, '#fffbe0'); pop(a, 'swords5', 'left:-20%;top:-15%;width:140%;height:130%;', 700, .6, 0, 0); } } catch (e) { } }, 300 / spd(a._h));
    },
    quake(a, o) {
      E(a, im('crack'), 'sx-pop', 'left:-30%;width:160%;height:40%;bottom:-10%;--t:1s', 1000);
      E(a, im('dust'), 'sx-up', 'left:-20%;width:140%;height:55%;bottom:-8%;--t:.95s', 1000); E(a, im('rocks'), 'sx-up', 'left:-10%;width:120%;height:90%;bottom:0;--t:.9s', 950);
      glow(a, '#fbbf24', .9);
    },
    fist(a, o) { pop(a, 'fistburst', 'left:-15%;top:5%;width:130%;height:90%;', 600, .5, 0, 0); FX.quake(a, o); ring(a, '#fbbf24'); },
    void(a, o) {
      E(a, im('vortex'), 'sx-vi', '', 900);
      setTimeout(() => { try { if (!a.isConnected) return; pop(a, 'voidslash', 'left:-15%;top:-12%;width:130%;height:124%;', 650, .55, 0, 0); glow(a, '#a78bfa', 1.4); sflash(a, '#c4b5fd'); } catch (e) { } }, 520 / spd(a._h));
      if (o.rune) E(a, im('formation'), 'sx-form', 'filter:hue-rotate(250deg)', 1000);
    },
    blood(a, o) {
      pop(a, 'claws', mid, 750, .65, 0, 0); pop(a, 'bloodsplash', 'left:-5%;top:10%;width:110%;height:90%;', 900, .8, 0, 0); pop(a, 'bloodcres', mid, 700, .55, -10, 10);
      glow(a, '#ef4444', 1);
      if (o.drain) for (let k = 0; k < 5; k++) E(a, im('orb'), 'sx-orbi', `${dly(a, 120 + k * 80)}top:${R(25, 55).toFixed(0)}%`, 1100 + k * 80);
    },
    poison(a, o) {
      E(a, im('mist'), 'sx-up', 'left:-20%;width:140%;height:90%;bottom:0;--t:1.1s', 1100); E(a, im('bubbles'), 'sx-up', 'left:-10%;width:120%;height:100%;bottom:0;--t:1.3s', 1300);
      pop(a, 'psplash', mid, 900, .8, 0, 0); glow(a, '#84cc16', 1.1);
    },
    formation(a, o) {
      E(a, im('formation'), 'sx-form', '', 1000); glow(a, '#fde68a', 1.3);
      setTimeout(() => { try { if (a.isConnected) FX.fire(a, {}); } catch (e) { } }, 330 / spd(a._h));
    }
  });
  Object.assign(NODE, {
    freeze() {
      let h = `<div class="sx-e sx-shell">${im('iceshell')}</div>`;
      for (let k = 0; k < 5; k++) h += `<i class="sx-e sx-tw" style="--x:${R(8, 80).toFixed(0)}%;--y:${R(8, 80).toFixed(0)}%;--d:-${(k * .22).toFixed(2)}s"></i>`; return h;
    },
    dizzy: () => `<div class="sx-e sx-stI">${im('stars')}</div>`,
    bind: () => `<div class="sx-e sx-ringI">${im('rings')}</div>`
  });
'''
rep("  function setSlot(", js+"  function setSlot(")
open(p,'w',encoding='utf8').write(t)
# (後續微調直接改 src:雷柱 bottom:12%/高250%、暈眩星星加大)
