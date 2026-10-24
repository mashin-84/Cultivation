#!/usr/bin/env python3
"""最終版81:劇情立繪統一「半身入鏡」
每張立繪記錄頭頂、下巴、臉的水平中心(佔圖片的比例),顯示時依此縮放與定位:
頭部大小一致(立繪區高度的 1/4)、頭頂對齊、臉的位置一致,腰部以下被對話框擋住;立繪區底緣裁切。
白澤、戰書(非人物)維持原本整張顯示。
"""
import glob, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src')
p = glob.glob(os.path.join(ROOT, 'js', '02_main', '055_*.js'))[0]
t = open(p, encoding='utf-8', newline='').read()
def rep(old, new):
    global t; assert t.count(old) == 1, old[:60]; t = t.replace(old, new)
PF = '{"gu_a":[0.02,0.12,0.412],"lr_a":[0.03,0.15,0.404],"tl_a":[0.02,0.13,0.55],"yh_a":[0.03,0.15,0.476],"仙人_a":[0.06,0.16,0.51],"仙衛統領_a":[0.09,0.19,0.51],"師弟_a":[0.02,0.17,0.489],"弟子_a":[0.03,0.13,0.461],"心魔_a":[0.02,0.14,0.48],"散修_a":[0.08,0.18,0.562],"村民_a":[0.02,0.14,0.549],"管事_a":[0.04,0.18,0.466],"老仙_a":[0.02,0.11,0.492],"趙莽_a":[0.02,0.14,0.488],"魔將_a":[0.03,0.14,0.514],"魔道長老_a":[0.03,0.15,0.351],"mo_cold":[0.03,0.25,0.531],"mo_kind":[0.02,0.29,0.498],"mo_sad":[0.02,0.29,0.479],"q_a":[0.05,0.22,0.434],"situ_a":[0.09,0.27,0.462],"su_cry":[0.04,0.28,0.45],"su_happy":[0.04,0.27,0.497],"su_worry":[0.04,0.27,0.489],"tian_a":[0.06,0.21,0.473],"xg_a":[0.09,0.23,0.505],"ye_f_cold":[0.03,0.23,0.472],"ye_f_smile":[0.03,0.23,0.47],"ye_m_cold":[0.04,0.25,0.48],"ye_m_smile":[0.04,0.25,0.481]}'
rep("""    setTimeout(() => { p.innerHTML = src ? `<img src="${src}" alt="" draggable="false">` : placeholder(w); p.classList.add('on'); }, run && run.pk ? 120 : 0);""",
    """    setTimeout(() => { p.innerHTML = src ? `<img src="${src}" alt="" draggable="false">` : placeholder(w); if (src) frameP(p.querySelector('img'), src); p.classList.add('on'); }, run && run.pk ? 120 : 0);""")
rep("""  function dimPortrait(on) {""",
    """  /* v81:半身入鏡——依頭頂/下巴/臉中心統一頭部大小與位置 */
  const PF = """ + PF + """;
  function frameP(img, src) {
    const k = Object.keys(ART28.ch).find(x => ART28.ch[x] === src), f = PF[k], p = $('st28p'); if (!img || !f || !p) return;
    const go = () => { const H = p.clientHeight, W = p.clientWidth; if (!H || !img.naturalHeight) return;
      const ih = H / 4.0 / (f[1] - f[0]), iw = ih * img.naturalWidth / img.naturalHeight;
      img.classList.add('pf81'); img.style.height = ih + 'px'; img.style.width = iw + 'px'; img.style.top = (H * .11 - f[0] * ih) + 'px'; img.style.left = (W * .42 - f[2] * iw) + 'px'; };
    if (img.complete) go(); else img.onload = go;
  }
  ST.frameP = frameP;
  function dimPortrait(on) {""")
rep("#st28 .st-p img,#st28 .st-p svg{", "#st28 .st-p{clip-path:inset(-100% -100% 0 -100%)}#st28 .st-p img.pf81{position:absolute;max-width:none;max-height:none}#st28 .st-p img,#st28 .st-p svg{")
open(p, 'w', encoding='utf-8', newline='').write(t)
print('p10 ok')
