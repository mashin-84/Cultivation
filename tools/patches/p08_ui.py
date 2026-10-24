#!/usr/bin/env python3
"""最終版78:
1. 洞府未開放建築:原本深色方框遮罩 → 建築褪成黑白+一層薄霧(邊緣柔和淡出),名牌前加鎖,「幾期開放」字改深色加淺底
2. 頂部修行指引膠囊:原本深褐底配暗金字看不清 → 改淺色宣紙底、深褐字(與其他淺色卡片一致)
"""
import os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src')
css = os.path.join(ROOT, 'css', '04_ui74.css')
t = open(css, encoding='utf-8', newline='').read(); assert '/* v78 */' not in t
t += """/* v78 */
body:not(#z74) #hub44 .h44.lkd{background:none!important;filter:none!important;border:0!important;box-shadow:none!important;isolation:isolate}
body:not(#z74) #hub44 .h44.lkd::after{content:'';position:absolute;inset:0;z-index:-1;pointer-events:none;border-radius:22px;background:radial-gradient(ellipse at center,rgba(250,246,236,.42) 30%,rgba(250,246,236,.18) 62%,rgba(250,246,236,0) 80%);-webkit-backdrop-filter:grayscale(1) brightness(1.08) contrast(.82);backdrop-filter:grayscale(1) brightness(1.08) contrast(.82);-webkit-mask-image:radial-gradient(ellipse at center,#000 55%,transparent 82%);mask-image:radial-gradient(ellipse at center,#000 55%,transparent 82%)}
body:not(#z74) #hub44 .h44.lkd .nm::before{content:'';display:inline-block;width:10px;height:12px;margin:0 4px -1px 0;background:no-repeat center/contain url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 12'%3E%3Cpath d='M2.5 5V3.5a2.5 2.5 0 0 1 5 0V5' fill='none' stroke='%23fde68a' stroke-width='1.4'/%3E%3Crect x='1' y='5' width='8' height='6.5' rx='1.3' fill='%23fde68a'/%3E%3C/svg%3E")}
body:not(#z74) #hub44 .h44.lkd .sb,body:not(#z74) #hub44 .h44.lkd .sb2{color:#4b3a26!important;text-shadow:none!important;opacity:1!important;font-weight:700}
body:not(#z74) #hub44 .h44.lkd .sb:not(:empty),body:not(#z74) #hub44 .h44.lkd .sb2:not(:empty){background:rgba(250,246,236,.88);border-radius:8px;padding:0 7px;margin-top:2px}
body:not(#z74) #tutorial-guide-banner{background:linear-gradient(160deg,#fbf7ee,#ece2cb)!important;border:1px solid rgba(180,120,40,.45)!important;box-shadow:0 1px 3px rgba(90,60,20,.12)}
body:not(#z74) #tutorial-guide-banner>div:first-child,body:not(#z74) #tutorial-guide-banner>div:first-child *:not(i){color:#5a3a12!important;text-shadow:none!important}
"""
open(css, 'w', encoding='utf-8', newline='').write(t)
print('p08 ok')
