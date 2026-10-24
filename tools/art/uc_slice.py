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
    # 依 3x2 格線切(相鄰格的人物常互相碰到,不能靠連通區塊分)
    cells = []
    for i in range(6):
        y0, x0 = (i // 3) * H // 2, (i % 3) * W // 3
        c = np.zeros((H, W), bool); c[y0:y0 + H // 2, x0:x0 + W // 3] = True; cells.append(c)
    for c, (d, nm, th) in zip(cells, NAMES):
        ys, xs = np.nonzero(c & (r[..., 3] > 20)); assert len(ys) > 5000, nm
        p = r[ys.min():ys.max() + 1, xs.min():xs.max() + 1].copy()
        p[..., 3] = (p[..., 3] * c[ys.min():ys.max() + 1, xs.min():xs.max() + 1]).astype(np.uint8)
        im = Image.fromarray(p); im = im.resize((round(im.width * th / im.height), th), Image.LANCZOS)
        out = os.path.join(ROOT, d, f'{g}_{look}_{nm}.webp'); im.save(out, quality=90, method=6)
        print(d, f'{g}_{look}_{nm}', im.size)


if __name__ == '__main__':
    main()
