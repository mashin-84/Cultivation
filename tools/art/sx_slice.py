#!/usr/bin/env python3
"""神通特效表切圖(最終版197):4x3 格,洋紅底去背(含去色溢),裁到內容,縮到最長邊 <=380,輸出 src/assets/SX192/名稱.webp
用法:python3 tools/art/sx_slice.py 表1.jpg 表2.jpg 表3.jpg"""
import sys, numpy as np
from PIL import Image
NAMES = [
 ['fire1','fire2','fire3','ghost','iceburst','icespike','iceshell','snowflake','mist','bubbles','psplash','bloodcres'],
 ['bolt1','bolt2','bolt3','arcs','flash','crescent','slashthin','claws','sword','bigsword','swords5','boom'],
 ['crack','rocks','dust','vortex','formation','fistburst','stars','rings','bloodsplash','orb','shock','voidslash']]
def key(im, soft=False):
    a = np.asarray(im.convert('RGB')).astype(np.float32); R, G, B = a[..., 0], a[..., 1], a[..., 2]
    mn = np.minimum(R, B); s = mn - G
    bg = (np.clip((s - 95) / 110, 0, 1) * np.clip((mn - 170) / 60, 0, 1)) if soft else (np.clip((s - 30) / 60, 0, 1) * np.clip((mn - 130) / 50, 0, 1))   # soft:淡紫發光物(束縛鎖環)用寬鬆門檻      # 越像洋紅越透明
    al = 1 - bg
    # 去色溢:半透明處把洋紅成分扣回
    sp = np.clip(s * (1 - al) * .5, 0, 255); a[..., 0] = np.clip(R - sp, 0, 255); a[..., 2] = np.clip(B - sp, 0, 255)
    out = np.dstack([a, al * 255]).astype(np.uint8); return Image.fromarray(out, 'RGBA')
for si, path in enumerate(sys.argv[1:4]):
    im = Image.open(path); W, H = im.size; cw, ch = W / 4, H / 3
    for k, nm in enumerate(NAMES[si]):
        r, c = divmod(k, 4); cell = im.crop((int(c * cw), int(r * ch), int((c + 1) * cw), int((r + 1) * ch)))
        t = key(cell, nm == 'rings'); bb = t.getchannel('A').point(lambda v: 255 if v > 14 else 0).getbbox()
        if not bb: print('空格', nm); continue
        t = t.crop((max(0, bb[0] - 2), max(0, bb[1] - 2), min(t.width, bb[2] + 2), min(t.height, bb[3] + 2)))
        k2 = 380 / max(t.size)
        if k2 < 1: t = t.resize((round(t.width * k2), round(t.height * k2)), Image.LANCZOS)
        if nm == 'iceshell':   # 冰封外殼:中間變很透明,只留外緣與高光,才看得到裡面的怪物
            from PIL import ImageFilter
            al = t.getchannel('A'); inner = al.filter(ImageFilter.MinFilter(41)).filter(ImageFilter.GaussianBlur(10))
            al2 = Image.eval(inner, lambda v: 255 - int(v * .78)); al = Image.fromarray((np.asarray(al).astype(np.float32) * np.asarray(al2).astype(np.float32) / 255).astype(np.uint8)); t.putalpha(al)
        t.save(f'src/assets/SX192/{nm}.webp', 'WEBP', quality=88, method=4); print(nm, t.size)
