import os
SRC=os.path.join(os.path.dirname(__file__),'..','..','src')
p=os.path.join(SRC,'index.html'); s=open(p,encoding='utf-8',newline='').read()
a='@@INC:js/34c_v122_絕學特寫.js@@\n'; assert s.count(a)==1
if '34d_v124' not in s: s=s.replace(a,a+'@@INC:js/34d_v124_戰鬥半身.js@@\n'); open(p,'w',encoding='utf-8',newline='').write(s)
keys=['F_n','F_h','M_n','M_h']
open(os.path.join(SRC,'js','34d_v124_戰鬥半身.js'),'w',encoding='utf-8',newline='').write('/* v124 選招面板主角半身(n=戰意 h=負傷) */\nwindow.CP124 = {'+', '.join(f'"{k}": "data:image/webp;base64,@@IMG:CP/{k}@@"' for k in keys)+'};\n')
