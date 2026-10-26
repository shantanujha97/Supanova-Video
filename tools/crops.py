from PIL import Image, ImageDraw
import os
S=3  # source scale
A='assets'
def load(n): return Image.open(f'{A}/src_{n}.png').convert('RGBA')
def rmask(size, r):
    m=Image.new('L', size, 0); ImageDraw.Draw(m).rounded_rectangle([0,0,size[0]-1,size[1]-1], r, fill=255); return m
def crop(n, rect, out, r=0, pad=0):
    im=load(n); x,y,w,h=rect
    box=(round((x-pad)*S), round((y-pad)*S), round((x+w+pad)*S), round((y+h+pad)*S))
    c=im.crop(box)
    if r: 
        m=rmask(c.size, r*S); a=c.split()[3]; from PIL import ImageChops; c.putalpha(ImageChops.multiply(a,m))
    c.save(f'{A}/{out}.png'); print(out, c.size)
# full-screen layers: keep 3x for close-up ones, 2x for the rest (JPEG, no alpha)
def full(n, out, scale):
    im=load(n).convert('RGB')
    if scale!=3: im=im.resize((im.width*scale//3, im.height*scale//3), Image.LANCZOS)
    im.save(f'{A}/{out}.jpg', quality=93); print(out, im.size)
full('dash_base','dash_base',3)
full('send_bg','send_bg',2)
for k in ['st2','st3','st4','sw1','sw2','sw3']: full(k,k,2)
full('swap_base','swap_base',3)
full('ref_bg','ref_bg',2)
# element crops (world/design coords @1x)
for i,(L,x) in enumerate([('send',308),('receive',517.75),('deposit',727.5),('swap',937.25)]):
    crop('dash_btns',(x,264,193.75,38),f'btn_{L}',r=12)
crop('send_empty',(495,175,450,482),'modal_empty',r=12)
crop('send_full',(489,194,450,482),'modal_full',r=12)
crop('swap_full',(495,196,450,436),'swap_card',r=24)
crop('swap_full',(702,319,36,36),'flip',r=18)
crop('ref_popup',(525,183,390,397),'popup',r=16)
for L,x in [('twitter',541),('whatsapp',638.333),('telegram',735.667),('email',833)]:
    crop('ref_tiles',(x+4,350,58,57),f'tile_{L}',r=12)
