#!/usr/bin/env python3
"""最終版87:戰鬥中朝右(背對主角)的敵人圖左右翻轉,一律面向左邊的主角
逐張檢查 76 張敵人圖,朝右的共 23 張:
A45:j1 j3 j4 jy_demon sr3 sr4 sr5 yx1 yx2 yx6 yx7(遊學守山長老等)
劇情戰 P_mon:仙衛統領 司徒衡 執法長老・司徒衡 顧青衍
一般怪 GEN3:K1 M06 M07 M10 M13 W8
"""
import glob, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src')
def F(p):
    g = glob.glob(os.path.join(ROOT, 'js', '02_main', p + '_*.js')) or glob.glob(os.path.join(ROOT, 'js', p + '_*.js')); assert len(g) == 1, p; return g[0]
def rep(pre, old, new):
    p = F(pre); t = open(p, encoding='utf-8', newline='').read(); assert t.count(old) == 1, (pre, t.count(old), old[:70])
    open(p, 'w', encoding='utf-8', newline='').write(t.replace(old, new))
rep('026', "    if (me && mk) me.innerHTML = `<img class=\"bs-mi ${mk[0].toLowerCase()}\" src=\"${G[mk]}\" alt=\"\" draggable=\"false\">`;",
    "    if (me && mk) me.innerHTML = `<img class=\"bs-mi ${mk[0].toLowerCase()}${['K1', 'M06', 'M07', 'M10', 'M13', 'W8'].includes(mk) ? ' fl87' : ''}\" src=\"${G[mk]}\" alt=\"\" draggable=\"false\">`;")
rep('11', "      if(me) me.innerHTML=`<img class=\"bs-mi a45\" src=\"${A[k]}\" alt=\"\" draggable=\"false\">`; }catch(e){}",
    "      if(me) me.innerHTML=`<img class=\"bs-mi a45${['j1','j3','j4','jy_demon','sr3','sr4','sr5','yx1','yx2','yx6','yx7'].includes(k)?' fl87':''}\" src=\"${A[k]}\" alt=\"\" draggable=\"false\">`; }catch(e){}")
rep('076', "      if (me) me.innerHTML = `<img class=\"bs-mi k\" src=\"${u}\" alt=\"\" draggable=\"false\">`;",
    "      if (me) me.innerHTML = `<img class=\"bs-mi k${['仙衛統領', '司徒衡', '執法長老・司徒衡', '顧青衍'].includes(B.monster.name) ? ' fl87' : ''}\" src=\"${u}\" alt=\"\" draggable=\"false\">`;")
css = os.path.join(ROOT, 'css', '04_ui74.css'); t = open(css, encoding='utf-8', newline='').read(); assert '/* v87 */' not in t
t += "/* v87 */\n#battle-stage .bs-mi.fl87{scale:-1 1}\n"; open(css, 'w', encoding='utf-8', newline='').write(t)
print('p16 ok')
