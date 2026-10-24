from PIL import Image
import numpy as np
from scipy import ndimage
D='/home/claude/rf/src/assets/GEN2/'
b3=np.array(Image.open(D+'B3.webp').convert('RGBA')).astype(float)
b4=np.array(Image.open(D+'B4.webp').convert('RGBA')).astype(float)
bg3=np.array([204,208,213.]);bg4=np.array([229,197,244.])
d3=np.linalg.norm(b3[...,:3]-bg3,axis=2);L=b3[...,:3].mean(2)
line=ndimage.binary_dilation(L<150,iterations=2)
bgl=((d3<14)|(b3[...,3]<250))&~line
lab,_=ndimage.label(bgl);H,W=bgl.shape
edge=set(lab[0,:])|set(lab[:H-6,0])|set(lab[:H-6,W-1])|set(lab[H-1,:6])|set(lab[H-1,W-6:]); edge.discard(0)
bgm=np.isin(lab,list(edge))
for _ in range(3): bgm=bgm|(ndimage.binary_dilation(bgm)&(d3<14))
fig=~bgm
R,B=b4[...,0],b4[...,2]; f4=(R-B>45)&(b4[...,3]>200)
L4=b4[...,:3].mean(2)[f4]; C4=b4[...,:3][f4]
lut=np.full((256,3),np.nan)
for v in range(256):
    m=np.abs(L4-v)<8
    if m.sum()>5: lut[v]=C4[m].mean(0)
x=np.arange(256)
for c in range(3):
    ok=~np.isnan(lut[:,c]);lut[:,c]=np.interp(x,x[ok],lut[ok,c])
mx=int(L4.max())
for v in range(mx,256):
    t=(v-mx)/(256-mx); lut[v]=lut[mx-1]*(1-t)+np.array([255,247,220])*t
a=ndimage.gaussian_filter(fig.astype(float),0.6)[...,None]
bgc=bg4+(b3[...,:3]-bg3)
out=b3.copy(); out[...,:3]=a*lut[L.clip(0,255).astype(int)]+(1-a)*bgc
Image.fromarray(out.clip(0,255).astype('uint8')).save('/tmp/claude-0/B4new.png')
ims=[Image.open(D+'B%d.webp'%i).convert('RGBA') for i in (3,4)]+[Image.open('/tmp/claude-0/B4new.png'),Image.open(D+'B6.webp').convert('RGBA')]
o=Image.new('RGB',(4*266,256),'white')
for i,im in enumerate(ims): im=im.resize((256,256));o.paste(im,(i*266,0),im)
o.save('/tmp/claude-0/B4cmp.png')
