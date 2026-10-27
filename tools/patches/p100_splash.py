# 最終版190:進遊戲先顯示宣傳圖(點擊螢幕繼續),再進標題頁
f = 'src/index.html'; t = open(f, encoding='utf8').read()
a = '<div id="title34" class="ld"'
assert t.count(a) == 1
S = ('<style>#sp190{position:fixed;inset:0;z-index:100001;background:linear-gradient(#b7d2e7,#f8efe6);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:opacity .7s;-webkit-tap-highlight-color:transparent}'
     '#sp190 img{max-width:100%;max-height:100%;object-fit:contain;display:block;pointer-events:none;-webkit-user-select:none;user-select:none}'
     '#sp190 .h{position:absolute;left:50%;bottom:calc(8px + env(safe-area-inset-bottom));transform:translateX(-50%);font-size:12px;color:#475569;background:rgba(255,255,255,.75);padding:3px 14px;border-radius:999px;letter-spacing:2px;white-space:nowrap;animation:sp190b 1.8s ease-in-out infinite}'
     '@keyframes sp190b{50%{opacity:.35}}#sp190.out{opacity:0;pointer-events:none}</style>'
     '<div id="sp190" role="button" tabindex="0" aria-label="點擊螢幕繼續"><img alt="一念飛仙" src="data:image/webp;base64,@@IMG:css/sp190@@"><div class="h">點擊螢幕繼續</div></div>'
     '<script>/* v190 開場宣傳圖 */(function(){var s=document.getElementById("sp190");if(!s)return;var g=0;function go(e){if(g)return;g=1;if(e)e.stopPropagation();s.classList.add("out");setTimeout(function(){try{s.remove();}catch(x){}},750);}'
     's.addEventListener("click",go);s.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" ")go(e);});})();</script>\n')
t = t.replace(a, S + a)
open(f, 'w', encoding='utf8').write(t); print('OK')
