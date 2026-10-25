#!/usr/bin/env python3
"""第一章妖潮夜:小孩背影(3x2 共 6 格)、小孩半身(2x2)、墨塵半身+絕學特寫(1x2)切圖
用法:
  python3 tools/art/c1_slice.py kid M 男童表.jpg      → src/assets/C1/kid_M_{1..6}.webp(畫布同主角背影,腳底對齊)
  python3 tools/art/c1_slice.py kid F 女童表.jpg
  python3 tools/art/c1_slice.py kidcp 半身表.jpg     → C1/kidcp_{M|F}_{n|h}.webp
  python3 tools/art/c1_slice.py mocp 墨塵半身表.jpg   → C1/mocp_n.webp、C1/mouc.webp
背景用「取樣四角顏色的距離」去背(Gemini 有時給偏粉的洋紅,不能只認純 #FF00FF)。
"""
import sys, os
import numpy as np
from PIL import Image
from scipy import ndimage
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src', 'assets')
OUT = os.path.join(ROOT, 'C1'); os.makedirs(OUT, exist_ok=True)


def keyd(path):
    a = np.array(Image.open(path).convert('RGB')).astype(float); H, W = a.shape[:2]
    cs = [a[4:40, 4:40], a[4:40, -40:-4], a[-40:-4, 4:40], a[-40:-4, -40:-4]]
    bg = np.median(np.concatenate([c.reshape(-1, 3) for c in cs]), 0)
    d = np.linalg.norm(a - bg, axis=2)
    al = np.clip((d - 28) / 50, 0, 1)
    m = (al > 0) & (al < 1)                                          # 半透明邊緣:把背景色從像素裡扣掉
    a[m] = np.clip((a[m] - (1 - al[m])[:, None] * bg) / np.maximum(al[m], .2)[:, None], 0, 255)
    al = ndimage.grey_erosion(al, size=(2, 2)) * .5 + al * .5; al[al < .05] = 0
    return np.dstack([a, al * 255]).astype(np.uint8)


def cells(r, rows, cols):
    H, W = r.shape[:2]; out = []
    for i in range(rows * cols):
        y0, x0 = (i // cols) * H // rows, (i % cols) * W // cols
        c = r[y0:y0 + H // rows, x0:x0 + W // cols].copy()
        lab, n = ndimage.label(ndimage.binary_dilation(c[..., 3] > 40, iterations=3))
        if n:
            sz = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1)); keep = [j + 1 for j, s in enumerate(sz) if s > 1500]
            c[..., 3] = (c[..., 3] * np.isin(lab, keep)).astype(np.uint8)
        ys, xs = np.nonzero(c[..., 3] > 20); out.append(c[ys.min():ys.max() + 1, xs.min():xs.max() + 1])
    return out


def kid(g, path):
    ref = np.array(Image.open(os.path.join(ROOT, 'BP', 'M_o1_1.webp')))
    H, W = ref.shape[:2]; foot = np.nonzero(ref[..., 3] > 40)[0].max(); adult = foot - np.nonzero(ref[..., 3] > 40)[0].min()
    ps = cells(keyd(path), 2, 3)
    s = adult * .80 / ps[0].shape[0]                                 # 十二歲:約大人身高八成
    tips = {}
    for n, p in enumerate(ps, 1):
        sc = min(s, (foot - 4) / p.shape[0])
        im = Image.fromarray(p); im = im.resize((round(im.width * sc), round(im.height * sc)), Image.LANCZOS)
        ox = W // 2 - im.width // 2 - 60; oy = foot - im.height + 1
        can = Image.new('RGBA', (W, H)); can.alpha_composite(im, (ox, max(0, oy)))
        can.save(os.path.join(OUT, f'kid_{g}_{n}.webp'), quality=90, method=6)
        if n == 2:
            cy, cx = np.nonzero(np.array(can)[..., 3] > 40); k = np.argmax(cx - cy * .6); tips[n] = [round(cx[k] / W, 3), round(cy[k] / H, 3)]
    print('kid', g, 'TIPS', tips)


def save_h(p, name, h):
    im = Image.fromarray(p); im = im.resize((round(im.width * h / im.height), h), Image.LANCZOS)
    im.save(os.path.join(OUT, name + '.webp'), quality=90, method=6); print(name, im.size)


if __name__ == '__main__':
    m = sys.argv[1]
    if m == 'kid': kid(sys.argv[2], sys.argv[3])
    elif m == 'kidcp':
        ps = cells(keyd(sys.argv[2]), 2, 2)
        for p, nm in zip(ps, ['M_n', 'M_h', 'F_n', 'F_h']): save_h(p, 'kidcp_' + nm, 700)
    elif m == 'mocp':
        ps = cells(keyd(sys.argv[2]), 1, 2)
        save_h(ps[0], 'mocp_n', 700); save_h(ps[1], 'mouc', 760)
