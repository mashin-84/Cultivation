import os
SRC=os.path.join(os.path.dirname(__file__),'..','..','src')
p=os.path.join(SRC,'index.html'); s=open(p,encoding='utf-8',newline='').read()
a='@@INC:js/34d_v124_戰鬥半身.js@@\n'; assert s.count(a)==1
if '34e_v124' not in s: s=s.replace(a,a+'@@INC:js/34e_v124_QTE圖.js@@\n'); open(p,'w',encoding='utf-8',newline='').write(s)
keys=['dot','tg','ring','hold','holdring','burst','zone','needle','track','sh','sh2']
open(os.path.join(SRC,'js','34e_v124_QTE圖.js'),'w',encoding='utf-8',newline='').write('/* v124 QTE 按鈕美術 */\nwindow.QT124 = {'+', '.join(f'"{k}": "data:image/webp;base64,@@IMG:QT/{k}@@"' for k in keys)+'};\n')
