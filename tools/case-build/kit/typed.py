"""Typed VCR fact as an alpha overlay (same type, position and 0.06 s/char cadence as the satdive map lines).
usage: python typed.py "TEXT" DUR OUT.mov   -> ProRes 4444 yuva444p10le, 1920x1080, 29.97, picture only; fades out over the last 0.3 s."""
import os, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont
W, H, FPS = 1920, 1080, 30000 / 1001
text, dur, out = sys.argv[1], float(sys.argv[2]), sys.argv[3]
f = ImageFont.truetype(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "editor-v5", "MASTER_TEMPLATES", "public", "fonts", "VCR_OSD_MONO.ttf"), 46)  # same face as satdive
enc = subprocess.Popen(["ffmpeg", "-hide_banner", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgba", "-s", f"{W}x{H}", "-r", "30000/1001",
                        "-i", "-", "-c:v", "prores_ks", "-profile:v", "4444", "-pix_fmt", "yuva444p10le", "-an", out], stdin=subprocess.PIPE)
cache = {}
for fi in range(round(dur * FPS)):
    u = fi / FPS; n = min(int(u / 0.06) + 1, len(text)); k = min(1.0, max(0.0, (dur - u) / 0.3))
    if (n, k) not in cache:
        im = Image.new("RGBA", (W, H), (0, 0, 0, 0)); l, t, r, b = f.getbbox(text[:n]); y = H - 170 - (b - t + 8) / 2
        sh = Image.new("RGBA", (W, H), (0, 0, 0, 0)); ImageDraw.Draw(sh).text((88 - l, y + 4 - t + 3), text[:n], font=f, fill=(0, 0, 0, 200))
        im = Image.alpha_composite(im, sh.filter(ImageFilter.GaussianBlur(3)))
        ImageDraw.Draw(im).text((88 - l, y + 4 - t), text[:n], font=f, fill=(240, 240, 240, 255))
        a = np.asarray(im).copy(); a[..., 3] = (a[..., 3] * k).astype(np.uint8); cache[(n, k)] = a.tobytes()
    enc.stdin.write(cache[(n, k)])
enc.stdin.close(); sys.exit(enc.wait())
