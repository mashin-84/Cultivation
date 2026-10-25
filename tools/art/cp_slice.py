#!/usr/bin/env python3
"""選招半身(流派版)切圖:洋紅底 3x2 共 6 格 → src/assets/CP/{性別}_{外觀}_{magic|body|pill}_{n|h}.webp(高 700)
用法:python3 tools/art/cp_slice.py M o1 半身表.jpg [--flip 格號,…] [--preview 預覽.png]
順序:上排正常、下排負傷;左→右 法修、體修、丹修(格號 0–5,左→右、上→下)。
分格:先找連通區塊;大區塊(人物)依中心點歸格,小區塊(脫手的符、丹爐、飄帶)歸到最近的人物。
每格裁到人物外框不留邊;--flip 的格子切完左右翻轉(Gemini 偶爾畫成朝左)。
"""
import sys, os, argparse
import numpy as np
from PIL import Image
from scipy import ndimage
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from bp_slice import key

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src', 'assets', 'CP')
NAMES = ['magic_n', 'body_n', 'pill_n', 'magic_h', 'body_h', 'pill_h']


def cells_of(r):
    H, W = r.shape[:2]
    lab, n = ndimage.label(ndimage.binary_dilation(r[..., 3] > 60, iterations=3))
    sl = ndimage.find_objects(lab)
    size = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1))
    big = [i for i in range(n) if size[i] > H * W * .02]
    figs = {}
    for i in big:
        s = sl[i]; cy, cx = (s[0].start + s[0].stop) / 2, (s[1].start + s[1].stop) / 2
        c = min(1, int(cy / (H / 2))) * 3 + min(2, int(cx / (W / 3)))
        figs.setdefault(c, []).append(i)
    assert sorted(figs) == list(range(6)), f'人物格數不對:{sorted(figs)}(缺格或兩人黏在一起)'
    masks = {c: np.isin(lab, [i + 1 for i in v]) for c, v in figs.items()}
    box = {c: (min(sl[i][0].start for i in v), max(sl[i][0].stop for i in v), min(sl[i][1].start for i in v), max(sl[i][1].stop for i in v)) for c, v in figs.items()}
    for i in range(n):
        if i in big or size[i] < 400: continue
        s = sl[i]
        def d(c):
            y0, y1, x0, x1 = box[c]
            return max(0, x0 - s[1].stop, s[1].start - x1) + max(0, y0 - s[0].stop, s[0].start - y1)
        c = min(range(6), key=d); masks[c] |= lab == i + 1
    return masks


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('g'); ap.add_argument('look'); ap.add_argument('sheet')
    ap.add_argument('--flip', default=''); ap.add_argument('--preview'); ap.add_argument('--dry', action='store_true')
    a = ap.parse_args()
    flips = {int(x) for x in a.flip.split(',') if x}
    r = key(a.sheet); masks = cells_of(r); outs = []
    for c in range(6):
        m = masks[c] & (r[..., 3] > 20); ys, xs = np.nonzero(m)
        p = r[ys.min():ys.max() + 1, xs.min():xs.max() + 1].copy()
        p[..., 3] = (p[..., 3] * masks[c][ys.min():ys.max() + 1, xs.min():xs.max() + 1]).astype(np.uint8)
        im = Image.fromarray(p)
        if c in flips: im = im.transpose(Image.FLIP_LEFT_RIGHT)
        im = im.resize((round(im.width * 700 / im.height), 700), Image.LANCZOS); outs.append(im)
        k = f'{a.g}_{a.look}_{NAMES[c]}'
        if not a.dry: im.save(os.path.join(ROOT, k + '.webp'), quality=90, method=6)
        print(k, im.size)
    if a.preview:
        W = sum(i.width for i in outs); pv = Image.new('RGB', (W, 700), (90, 160, 90)); x = 0
        for i in outs: pv.paste(i, (x, 0), i); x += i.width
        pv.resize((W // 3, 233)).save(a.preview)


if __name__ == '__main__':
    main()
