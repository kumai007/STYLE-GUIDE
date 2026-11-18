"""tsheet.py DIR OUTPREFIX [cols] [cellw] - labelled contact sheets (filename stem = seconds), 36 per sheet."""
import sys, glob, os
from PIL import Image, ImageDraw, ImageFont
d, pre = sys.argv[1], sys.argv[2]; C = int(sys.argv[3]) if len(sys.argv) > 3 else 6; CW = int(sys.argv[4]) if len(sys.argv) > 4 else 280
fs = sorted(glob.glob(os.path.join(d, "*.jpg"))); per = C * C; f = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 18)
for k in range(0, len(fs), per):
    grp = fs[k:k + per]; ch = int(CW * 9 / 16); R = (len(grp) + C - 1) // C
    sh = Image.new("RGB", (C * CW, R * ch))
    for i, p in enumerate(grp):
        im = Image.open(p).convert("RGB").resize((CW, ch)); dr = ImageDraw.Draw(im); t = os.path.splitext(os.path.basename(p))[0]
        dr.rectangle((0, 0, 62, 22), fill=(0, 0, 0)); dr.text((3, 1), str(int(t)), font=f, fill=(255, 255, 0))
        sh.paste(im, ((i % C) * CW, (i // C) * ch))
    out = f"{pre}_{k // per + 1}.jpg"; sh.save(out, quality=82); print(out, sh.size)
