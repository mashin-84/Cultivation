#!/usr/bin/env python3
"""主角戰鬥背影切圖:洋紅底動作表(3x3 共 9 格)→ src/assets/BP/{性別}_{外觀}_{1..9}.webp
用法:python3 tools/art/bp_slice.py M o2 主表.jpg [補圖.jpg 4,7]
  補圖:同一角色的補畫,依左→右、上→下順序取代指定動作編號(大小以「補圖第一格≈主表第 9 格勝利站姿」換算)。
對齊方式比照新手服 o1:畫布同尺寸、腳底同高、腰部 x 與 o1 同動作一致(放不下時往內收,不裁切)。
輸出 TIPS(出招動作 2/3/8 的劍尖或指尖位置)供 35_v113_重要戰鬥.js 與 tools/patches/p48_bf.js 使用。
"""
import sys, os
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
BP = os.path.join(ROOT, 'src', 'assets', 'BP')


def key(path):
    a = np.array(Image.open(path).convert('RGB')).astype(float)
    R, G, B = a[..., 0], a[..., 1], a[..., 2]
    m = np.minimum(R, B) - G                      # 洋紅強度
    al = np.clip((150 - m) / 90, 0, 1)
    sp = np.clip(m, 0, None)
    k = np.where(al < 1, 1.0, np.clip(sp / 80, 0, 1))   # 去洋紅溢色
    a[..., 0] -= sp * k * .9 * np.where(R >= B, 1, R / np.maximum(B, 1))
    a[..., 2] -= sp * k * .9 * np.where(B >= R, 1, B / np.maximum(R, 1))
    al = ndimage.grey_erosion(al, size=(2, 2)) * .5 + al * .5
    al[al < .04] = 0
    return np.dstack([np.clip(a, 0, 255), al * 255]).astype(np.uint8)


def pieces(path, n=9):
    """依格線分配:每個區塊依中心點歸到 3x3(n=9)或 1xN 的格子,同一格的區塊合併(脫手的道具也算進去)"""
    r = key(path); H, W = r.shape[:2]
    lab, _ = ndimage.label(ndimage.binary_dilation(r[..., 3] > 60, iterations=4))
    sl = ndimage.find_objects(lab)
    cells = {}
    for i, s in enumerate(sl, 1):
        if not s or (lab[s] == i).sum() < 1500: continue
        cy, cx = (s[0].start + s[0].stop) / 2, (s[1].start + s[1].stop) / 2
        c = (min(2, int(cy / (H / 3))), min(2, int(cx / (W / 3)))) if n == 9 else (0, min(n - 1, int(cx / (W / n))))
        cells.setdefault(c, []).append(i)
    out = []
    for c in sorted(cells):
        ids = cells[c]; m = np.isin(lab, ids); ys, xs = np.nonzero(m)
        y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
        p = r[y0:y1, x0:x1].copy(); p[..., 3] = (p[..., 3] * m[y0:y1, x0:x1]).astype(np.uint8); out.append(p)
    return out


def main():
    g, look, sheet = sys.argv[1], sys.argv[2], sys.argv[3]
    ref = [np.array(Image.open(os.path.join(BP, f'{g}_o1_{i}.webp'))) for i in range(1, 10)]
    H, W = ref[0].shape[:2]
    foot = max(np.nonzero(r[..., 3] > 40)[0].max() for r in ref)
    def waist(al):
        h = np.nonzero(al)[0].max() + 1
        return np.median(np.nonzero(al[int(h * .45):int(h * .6)])[1])
    refw = [waist(r[..., 3] > 40) for r in ref]
    refh = foot - np.nonzero(ref[0][..., 3] > 40)[0].min()      # o1 待機身高
    mp = pieces(sheet, 9); assert len(mp) == 9, f'主表找到 {len(mp)} 格,應為 9'
    rh = np.median([foot - np.nonzero(r[..., 3] > 40)[0].min() for r in ref])
    s_main = rh / np.median([x.shape[0] for x in mp])   # 整組中位身高對齊新手服劍修
    use = {n: (mp[n - 1], s_main) for n in range(1, 10)}
    if len(sys.argv) > 4:
        nums = [int(x) for x in sys.argv[5].split(',')]; sp = pieces(sys.argv[4], len(nums))
        assert len(sp) == len(nums), f'補圖找到 {len(sp)} 格,應為 {len(nums)}'
        s_sup = s_main * mp[8].shape[0] / sp[0].shape[0]
        for n, p in zip(nums, sp): use[n] = (p, s_sup)
    tips = {}
    for n, (p, s) in use.items():
        s = min(s, (foot - 4) / p.shape[0])                     # 單格放不下(舉手、騰空)才單獨縮
        im = Image.fromarray(p); im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
        al = np.array(im)[..., 3] > 40; ys, xs = np.nonzero(al)
        x0, x1 = xs.min(), xs.max()
        ox = int(round(refw[n - 1] - waist(al)))
        ox = min(max(ox, 2 - x0), W - 3 - x1)                     # 放不下就往內收
        oy = foot - ys.max()
        assert oy + ys.min() >= 0, f'動作 {n} 太高,超出畫框'
        can = Image.new('RGBA', (W, H)); can.alpha_composite(im, (max(ox, 0), max(oy, 0)), (max(-ox, 0), max(-oy, 0)))
        can.save(os.path.join(BP, f'{g}_{look}_{n}.webp'), quality=90, method=6)
        cy, cx = np.nonzero(np.array(can)[..., 3] > 40)
        if n in (2, 3, 8):
            if n == 2: k = np.argmax(cx - cy * .6)
            elif n == 3 and '_' in look: k = np.argmax(cx - cy * .6)      # 流派:手掌/拳頭/丹爐在右上
            elif n == 3:
                top = cy < cy.min() + 120; lft, rgt = cx[top].min(), cx[top].max()
                al2 = np.array(can)[..., 3] > 40                       # 劍尖那端較細:比較兩端 40px 內的像素量
                band = al2[cy.min():cy.min() + 120]
                k = np.argmin(np.where(top, cx, 9999)) if band[:, lft:lft + 40].sum() < band[:, rgt - 39:rgt + 1].sum() else np.argmax(np.where(top, cx, -1))
            else: k = np.argmax(cx)
            tips[f'{g}_{look}_{n}'] = [round(cx[k] / W, 3), round(cy[k] / H, 3)]
        print(f'{g}_{look}_{n}', 'x', cx.min(), cx.max(), 'y', cy.min(), cy.max())
    print('TIPS', tips)


if __name__ == '__main__':
    main()
