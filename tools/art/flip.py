#!/usr/bin/env python3
"""左右翻轉已切好的背影動作(腰部 x 對齊原位):python3 tools/art/flip.py M_o5_body_7 M_o5_pill_4"""
import sys, numpy as np
from PIL import Image
P = __import__('os').path.join(__import__('os').path.dirname(__file__), '..', '..', 'src', 'assets', 'BP', '')
def waist(al):
    h = np.nonzero(al)[0].max() + 1; return np.median(np.nonzero(al[int(h * .45):int(h * .6)])[1])
for k in sys.argv[1:]:
    f = P + k + '.webp'; a = np.array(Image.open(f)); w0 = waist(a[..., 3] > 40)
    b = a[:, ::-1].copy(); dx = int(round(w0 - waist(b[..., 3] > 40)))
    ys, xs = np.nonzero(b[..., 3] > 40); W = b.shape[1]; dx = min(max(dx, 2 - xs.min()), W - 3 - xs.max())
    c = np.zeros_like(b)
    if dx >= 0: c[:, dx:] = b[:, :W - dx]
    else: c[:, :W + dx] = b[:, -dx:]
    Image.fromarray(c).save(f, quality=90, method=6); print('flipped', k)
