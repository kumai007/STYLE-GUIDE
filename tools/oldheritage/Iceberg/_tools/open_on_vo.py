#!/usr/bin/env python3
"""open_on_vo.py [KEY ...]   (DC01..DC20, IN01..IN25; default all)

Countdown cases open number -> first VO line (owner, 14 Nov 2026: "disturbing dose has number and start with VO"). Per case:
  1. out/<KEY>.mp4 is kept as out/<KEY>_titled.mp4 (title card / cold-open raw included), and the master is rebuilt from it
     without the head: cut at the first VO Sequence (CUT below = the first VO `from` in the case code; the take's first word is
     0.02-0.16 s in; the 10 f glitch on that cut is replaced by a 5 f hold of the first clean frame), re-encoded (x264 crf 16, yuvj420p, AAC 44.1 kHz 256k, 40 ms fade-in; the music bed already fades in
     from that point in the code).
  2. media/_t_in.mp4 = the footage that leads INTO the case's first shot (same source, the 2.5 s before its `from`, at its rate,
     cropped to its first camera key), or a freeze when there is no earlier footage / the first shot is a still or device
     (freeze of the trimmed master's first clean frame); build/CASEnn/transition.json points make_transitions.py at it.
Then: make_transitions.py DC|IN --force, assemble.sh.
"""
import json, os, subprocess, sys

I = "C:/Users/ayush/Videos/CLAUDE/STYLE guide/tools/oldheritage/Iceberg"
VIDS = {"DC": "05_Dashcam", "IN": "07_Incidents"}
CUT = {"IN01": 16.5}  # all the others: title 0-4, VO from 4.0
# IN01: music (Music 3 from 6.0 s at 12.5) is at full level at 16.5 -> 1 s fade-in; fitted on the music-only stretch 14.2-16.4
MUSIC_FIX = {"IN01": (f"{I}/_engine/public/music/Music 3.mp3", 6.0 + 16.5 - 12.5, 14.2, 16.4)}
# first shot under the first VO line: ("cam", src rel. to CASEnn, from, rate, s, x, y) or ("freeze",)
FZ = ("freeze",)
FIRST = {
    "DC01": FZ, "DC02": FZ, "DC03": FZ, "DC04": ("cam", "graded/main.mp4", 0.0, 0.7, 1.0, .5, .5), "DC05": FZ,
    "DC06": ("cam", "graded/front.mp4", 0.0, 1, 1.04, .5, .5), "DC07": ("cam", "graded/c2.mp4", 22.9, 1, 1.05, .5, .5), "DC08": FZ,
    "DC09": ("cam", "graded/road.mp4", 40.0, 1, 1.05, .5, .5), "DC10": FZ,
    "DC11": ("cam", "graded/main.mp4", 0.0, 0.5, 1.12, .5, .55), "DC12": ("cam", "graded/main.mp4", 1.0, 1, 1.05, .5, .55),
    "DC13": ("cam", "graded/main.mp4", 18.0, 1, 1.0, .5, .5), "DC14": ("cam", "graded/main.mp4", 0.0, 0.5, 1.12, .5, .45),
    "DC15": ("cam", "graded/main169.mp4", 86.0, 1, 1.45, .66, .5), "DC16": ("cam", "graded/main.mp4", 0.0, 1, 1.06, .5, .4),
    "DC17": FZ, "DC18": ("cam", "graded/main.mp4", 2.0, 1, 1.22, .5, .38), "DC19": ("cam", "graded/main.mp4", 4.2, 0.15, 1.3, .4, .45),
    "DC20": FZ,
    "IN01": ("cam", "graded/a.mp4", 40.0, 1, 1.06, .5, .5), "IN02": ("cam", "graded/m.mp4", 14.5, 1, 1.05, .5, .5),
    "IN03": FZ, "IN04": FZ, "IN05": FZ, "IN06": ("cam", "graded/main.mp4", 0.3, 1, 1.12, .5, .6), "IN07": FZ,
    "IN08": ("cam", "graded/wA.mp4", 2.0, 1, 1.08, .5, .45), "IN09": ("cam", "graded/main.mp4", 22.0, 1, 1.3, .42, .45),
    "IN10": ("cam", "graded/a2.mp4", 8.0, 1, 1.05, .4, .45), "IN11": ("cam", "graded/main.mp4", 4.0, 1, 1.12, .5, .6),
    "IN12": FZ, "IN13": ("cam", "graded/main.mp4", 43.5, 1, 1.1, .5, .5), "IN14": ("cam", "graded/a.mp4", 20.0, 1, 1.25, .4, .4),
    "IN15": ("cam", "graded/main.mp4", 290.0, 1, 1.15, .5, .55), "IN16": FZ, "IN17": ("cam", "graded/main.mp4", 1.0, 1, 1.08, .5, .55),
    "IN18": ("cam", "graded/seg.mp4", 16.0, 1, 1.05, .5, .5), "IN19": FZ, "IN20": FZ,
    "IN21": ("cam", "graded/main.mp4", 431.8, 1, 1.2, .45, .4), "IN22": ("cam", "graded/main.mp4", 0.3, 1, 1.0, .5, .5),
    "IN23": ("cam", "graded/main.mp4", 131.2, 1, 1.04, .5, .5), "IN24": ("cam", "graded/main.mp4", 102.3, 1, 1.18, .5, .42),
    "IN25": ("cam", "graded/main.mp4", 10.0, 1, 1.05, .5, .45),
}
LEAD, TAIL = 2.5, 0.9


def sh(*c):
    subprocess.run(list(c), check=True)


def place(s, x, y, W=1920, H=1080):  # DC01_kit placeOf
    w, h = W * s, H * s
    return min(0, max(W - w, W / 2 - x * w)), min(0, max(H - h, H / 2 - y * h)), w, h


def run(key):
    vid, nn = key[:2], int(key[2:])
    cdir = f"{I}/{VIDS[vid]}/build/CASE{nn:02d}"
    out, titled = f"{cdir}/out/{key}.mp4", f"{cdir}/out/{key}_titled.mp4"
    if not os.path.exists(titled):
        os.rename(out, titled)
    cut = CUT.get(key, 4.0)
    fr = round(cut * 30)
    tmp = f"{cdir}/out/{key}_trim_tmp.mp4"
    # picture: from the cut, but the code's own 10 f glitch on the cut (frames cut-5..cut+4) is replaced by a 5 f hold of the first
    # clean frame (cut+5), so the case starts clean straight after the number transition
    vf = f"[0:v]trim=start_frame={fr + 5},setpts=PTS-STARTPTS,tpad=start=5:start_mode=clone[v]"
    ain = ["-i", titled]
    af = f"[0:a]atrim=start={cut},asetpts=PTS-STARTPTS,afade=t=in:d=0.04[a]"
    if key in MUSIC_FIX:  # the music bed is at full level at the cut: fade it in over 1 s (least-squares subtraction, _headfix.py)
        sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
        import numpy as np, _headfix as hf
        mf, moff, fit_a, fit_b = MUSIC_FIX[key]
        whole = hf.dec(titled, cut, 600)
        n_real = int(float(subprocess.run(["ffprobe", "-v", "error", "-select_streams", "a", "-show_entries", "stream=duration", "-of",
                                           "csv=p=0", titled], capture_output=True, text=True).stdout) * hf.SR - cut * hf.SR)
        whole = whole[:n_real]
        a = hf.dec(titled, fit_a, fit_b - fit_a); m = hf.dec(mf, moff + fit_a - cut, fit_b - fit_a)
        best = None
        for L in range(-200, 201):
            mm = np.roll(m, L, axis=0); g = (a * mm).sum() / (mm * mm).sum(); r = ((a - g * mm) ** 2).sum()
            if best is None or r < best[2]: best = (L, g, r)
        L, g, r = best
        n = int(1.2 * hf.SR)
        mm = np.roll(hf.dec(mf, moff, 1.2 + 0.1)[:n], L, axis=0)
        ramp = np.clip(np.arange(n) / hf.SR / 1.0, 0, 1)
        whole[:n] -= g * mm * (1 - ramp)[:, None]
        wav = f"{cdir}/out/{key}_head_tmp.wav"
        import wave
        pcm = (np.clip(whole, -1, 1) * 32767).astype("<i2").tobytes()
        with wave.open(wav, "wb") as w:
            w.setnchannels(2); w.setsampwidth(2); w.setframerate(hf.SR); w.writeframes(pcm)
        print(f"{key}: music fade-in, fit lag {L / hf.SR * 1000:+.2f} ms gain {20 * np.log10(g):.1f} dB null {10 * np.log10((a ** 2).sum() / r):.1f} dB")
        ain = ["-i", wav]
        af = "[1:a]afade=t=in:d=0.04[a]"
    sh("ffmpeg", "-v", "error", "-y", "-i", titled, *(ain if key in MUSIC_FIX else []), "-filter_complex", vf + ";" + af,
       "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-crf", "16", "-preset", "medium", "-pix_fmt", "yuvj420p", "-r", "30",
       "-c:a", "aac", "-ar", "44100", "-b:a", "256k", "-movflags", "+faststart", tmp)
    if key in MUSIC_FIX:
        os.remove(wav)
    os.replace(tmp, out)
    # lead-in footage for the number transition
    os.makedirs(f"{cdir}/media", exist_ok=True)
    tin = f"{cdir}/media/_t_in.mp4"
    spec = FIRST[key]
    dur = LEAD + TAIL
    if spec[0] == "freeze":
        # first clean frame of the trimmed case (the code's own 10 f glitch on the cut ends 5 f in)
        sh("ffmpeg", "-v", "error", "-y", "-i", out, "-vf", "select=eq(n\\,0)", "-frames:v", "1", "-q:v", "1", f"{cdir}/media/_t_in.png")
        sh("ffmpeg", "-v", "error", "-y", "-loop", "1", "-framerate", "30", "-i", f"{cdir}/media/_t_in.png", "-t", f"{dur}",
           "-vf", "format=yuv420p", "-c:v", "libx264", "-crf", "12", "-preset", "fast", tin)
        why = "freeze of the case's first clean frame"
    else:
        _, src, t, rate, s, x, y = spec
        a = t - LEAD * rate
        pad = max(0.0, -a) / rate  # output seconds of frozen first frame when the shot starts near the file's head
        a = max(0.0, a)
        left, top, w, h = place(s, x, y)
        w, h = int(round(w / 2) * 2), int(round(h / 2) * 2)
        vf = (f"trim=start={a:.3f}:duration={(TAIL + LEAD) * rate:.3f},setpts=(PTS-STARTPTS)/{rate},fps=30,"
              f"tpad=start_duration={pad:.3f}:start_mode=clone,scale={w}:{h},crop=1920:1080:{int(-left)}:{int(-top)},format=yuv420p")
        sh("ffmpeg", "-v", "error", "-y", "-i", f"{cdir}/{src}", "-an", "-vf", vf, "-t", f"{dur}", "-c:v", "libx264", "-crf", "12",
           "-preset", "fast", tin)
        why = f"{src} {t - LEAD * rate:.2f}-{t:.2f} s at {rate}x (+{pad:.2f} s freeze), cam s{s} x{x} y{y}"
    json.dump({"src": "media/_t_in.mp4", "from": 0, "note": f"open_on_vo.py: leads into the first VO shot: {why}"},
              open(f"{cdir}/transition.json", "w"), indent=1)
    d = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", out],
                             capture_output=True, text=True).stdout)
    return f"{key}: cut {cut:.2f} s -> {d:.2f} s; in = {why}"


if __name__ == "__main__":
    keys = sys.argv[1:] or sorted(FIRST)
    for k in keys:
        try:
            print(run(k), flush=True)
        except subprocess.CalledProcessError as e:
            print(f"{k}: FAILED {e}", flush=True)
