#!/usr/bin/env python3
"""最終版89:劇情立繪站在左邊,臉/身體朝左(看向畫面外)的改為左右翻轉,一律面向畫面中間
翻轉:顧青衍、獨臂老匠、玉衡長老、仙衛統領、心魔、墨塵×3、神秘人、夜無咎(男女)×4;其餘正面或已朝右者不動
"""
import glob, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src')
p = glob.glob(os.path.join(ROOT, 'js', '02_main', '055_*.js'))[0]; t = open(p, encoding='utf-8', newline='').read()
def rep(old, new):
    global t; assert t.count(old) == 1, old[:60]; t = t.replace(old, new)
rep("const k = Object.keys(ART28.ch).find(x => ART28.ch[x] === src), f = PF[k], p = $('st28p'); if (!img || !f || !p) return;",
    "const k = Object.keys(ART28.ch).find(x => ART28.ch[x] === src), f = PF[k], p = $('st28p'); if (!img || !f || !p) return;\n    const fl = PFL.includes(k); img.classList.toggle('fl89', fl); const cx = fl ? 1 - f[2] : f[2];")
rep("img.style.left = (W * .42 - f[2] * iw) + 'px';", "img.style.left = (W * .42 - cx * iw) + 'px';")
rep("  function frameP(img, src) {", "  const PFL = ['gu_a', 'tl_a', 'yh_a', '仙衛統領_a', '心魔_a', 'mo_cold', 'mo_kind', 'mo_sad', 'q_a', 'ye_f_cold', 'ye_f_smile', 'ye_m_cold', 'ye_m_smile'];   /* v89:朝左者翻轉 */\n  function frameP(img, src) {")
rep("#st28 .st-p img.pf81{position:absolute;max-width:none;max-height:none}", "#st28 .st-p img.pf81{position:absolute;max-width:none;max-height:none}#st28 .st-p img.pf81.fl89{scale:-1 1}")
open(p, 'w', encoding='utf-8', newline='').write(t)
print('p18 ok')
