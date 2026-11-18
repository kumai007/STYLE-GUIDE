"""brightest-blob track: track.py clip.mp4 x0 x1 y0 y1 [step]  -> local-frame centroid of top pixels inside ROI (fractions)"""
import subprocess, sys, numpy as np
clip=sys.argv[1]; x0,x1,y0,y1=map(float,sys.argv[2:6]); step=int(sys.argv[6]) if len(sys.argv)>6 else 6
W,H=384,216
raw=subprocess.run(["ffmpeg","-nostdin","-v","error","-i",clip,"-vf",f"scale={W}:{H},format=gray,gblur=sigma=2","-f","rawvideo","-"],capture_output=True).stdout
fr=np.frombuffer(raw,np.uint8).reshape(-1,H,W)
a,b,c,d=int(x0*W),int(x1*W),int(y0*H),int(y1*H)
for i in range(0,len(fr),step):
    r=fr[i,c:d,a:b].astype(float); t=np.percentile(r,99.7); ys,xs=np.nonzero(r>=t)
    print(i, round((xs.mean()+a)/W,3), round((ys.mean()+c)/H,3), int(r.max()), int(np.median(r)))
