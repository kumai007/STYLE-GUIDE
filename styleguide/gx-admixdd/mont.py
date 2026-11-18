import sys,glob
from PIL import Image,ImageDraw
d,start,n,out=sys.argv[1],int(sys.argv[2]),int(sys.argv[3]),sys.argv[4]
step=float(sys.argv[5]) if len(sys.argv)>5 else 10
fs=sorted(glob.glob(d+'/f*.jpg'))[start:start+n]
cols=4;w=480;h=270
rows=(len(fs)+cols-1)//cols
im=Image.new('RGB',(cols*w,rows*h))
dr=ImageDraw.Draw(im)
for i,f in enumerate(fs):
    t=Image.open(f).resize((w,h));x=(i%cols)*w;y=(i//cols)*h
    im.paste(t,(x,y));k=(start+i)*step
    dr.rectangle([x,y,x+90,y+16],fill=(0,0,0));dr.text((x+3,y+2),"%d:%02d"%(k//60,k%60),fill=(255,255,0))
im.save(out)
