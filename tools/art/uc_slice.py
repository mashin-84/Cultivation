#!/usr/bin/env python3
"""本命特寫 + 選招半身切圖:洋紅底 3x2 共 6 格 →
   src/assets/UC/{性別}_{外觀}_{sword,magic,body,pill}.webp(高 760)、src/assets/CP/{性別}_{外觀}_{n,h}.webp(高 700)
用法:python3 tools/art/uc_slice.py F o2 特寫表.jpg
順序(左→右、上→下):劍修絕學、法修絕學、體修絕學、丹修絕學、戰意、負傷。比照原本 UC/CP:裁到人物外框,不留邊。
"""
import sys, os
import numpy as np
from PIL import Image
from scipy import ndimage
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from bp_slice import key

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src', 'assets')
NAMES = [('UC', 'sword', 760), ('UC', 'magic', 760), ('UC', 'body', 760), ('UC', 'pill', 760), ('CP', 'n', 700), ('CP', 'h', 700)]


def main():
    g, look, sheet = sys.argv[1:4]
    r = key(sheet); H, W = r.shape[:2]
    lab, n = ndimage.label(ndimage.binary_dilation(r[..., 3] > 30, iterations=2))
    cells = [np.zeros((H, W), bool) for _ in range(6)]
    for i, sl in enumerate(ndimage.find_objects(lab), 1):     # 每塊依重心歸到 3x2 格
        m = lab == i
        if m.sum() < 40: continue
        cy, cx = ndimage.center_of_mass(m)
        cells[min(int(cy / (H / 2)), 1) * 3 + min(int(cx / (W / 3)), 2)] |= m
    for c, (d, nm, th) in zip(cells, NAMES):
        ys, xs = np.nonzero(c & (r[..., 3] > 20)); assert len(ys) > 5000, nm
        p = r[ys.min():ys.max() + 1, xs.min():xs.max() + 1].copy()
        p[..., 3] = (p[..., 3] * c[ys.min():ys.max() + 1, xs.min():xs.max() + 1]).astype(np.uint8)
        im = Image.fromarray(p); im = im.resize((round(im.width * th / im.height), th), Image.LANCZOS)
        out = os.path.join(ROOT, d, f'{g}_{look}_{nm}.webp'); im.save(out, quality=90, method=6)
        print(d, f'{g}_{look}_{nm}', im.size)


if __name__ == '__main__':
    main()
