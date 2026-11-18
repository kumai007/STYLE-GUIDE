"""Strip background music from a raw's audio (owner 2 Nov: "remove bg music of raw … might be copyright music").
usage: _tools/.audvenv/bin/python _tools/rawclean.py <clip.mp4|audio> <out.wav> [--force]
1. An AudioSet classifier (AST) scores "Music" per 1 s window.
2. Demucs (htdemucs) splits the audio; where music is detected the output is the vocals stem (voices, screams, shouts) plus the
   drums stem at -10 dB (impacts, crashes) — no bass/other (melody, chords). Elsewhere the original sound is kept (wind, roar,
   crowd). Joins crossfade over 0.25 s. --force = treat the whole clip as music.
Prints the windows that were cleaned. Use the out.wav as the raw's audio in the case (never the original clip audio)."""
import sys, subprocess, tempfile, os
import numpy as np, soundfile as sf, torch

src, out = sys.argv[1], sys.argv[2]
force = "--force" in sys.argv
SR = 44100
tmp = tempfile.mkdtemp()
wav = os.path.join(tmp, "a.wav")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-vn", "-ac", "2", "-ar", str(SR), wav], check=True)
x, _ = sf.read(wav, dtype="float32")
if x.ndim == 1: x = np.stack([x, x], 1)
n = len(x); secs = int(np.ceil(n / SR))
dev = "cuda" if torch.cuda.is_available() else "mps" if torch.backends.mps.is_available() else "cpu"

# 1. music score per second
if force:
    music = np.ones(secs, bool)
else:
    from transformers import ASTFeatureExtractor, ASTForAudioClassification
    import librosa
    name = "MIT/ast-finetuned-audioset-10-10-0.4593"
    fe = ASTFeatureExtractor.from_pretrained(name); m = ASTForAudioClassification.from_pretrained(name).eval()
    mi = [i for i, l in m.config.id2label.items() if l in ("Music", "Musical instrument", "Pop music", "Electronic music", "Song", "Singing")]
    mono = librosa.resample(x.mean(1), orig_sr=SR, target_sr=16000)
    m = m.to(dev); score = np.zeros(secs)
    segs = [mono[max(0, (s - 1) * 16000):(s + 2) * 16000] for s in range(secs)]  # 3 s context centred on each second
    segs = [g if len(g) >= 4000 else np.zeros(4000, np.float32) for g in segs]
    with torch.no_grad():
        for b in range(0, secs, 16):
            inp = fe(segs[b:b + 16], sampling_rate=16000, return_tensors="pt", padding="max_length")
            p = torch.sigmoid(m(input_values=inp["input_values"].to(dev)).logits).cpu().numpy()
            score[b:b + 16] = p[:, mi].max(1)
    music = score > 0.25
    music = np.convolve(music.astype(float), np.ones(3), "same") > 0  # pad 1 s each side
if not music.any():
    sf.write(out, x, SR); print(f"{src}: no music detected, original kept"); sys.exit()

# 2. separate
from demucs.pretrained import get_model
from demucs.apply import apply_model
dm = get_model("htdemucs").to(dev).eval()
wt = torch.tensor(x.T)[None].to(dev)
ref = wt.mean(1, keepdim=True); mu, sd = ref.mean(), ref.std() + 1e-8
with torch.no_grad():
    st = apply_model(dm, (wt - mu) / sd, device=dev, split=True, overlap=0.25)[0] * sd + mu
stems = dict(zip(dm.sources, st.cpu().numpy()))
clean = (stems["vocals"] + stems["drums"] * 10 ** (-10 / 20)).T[:n]

# 3. mix: original where no music, clean where music, 0.25 s crossfades
g = np.repeat(music.astype(np.float32), SR)[:n]
k = int(0.25 * SR); g = np.convolve(g, np.ones(k) / k, "same")[:, None]
y = x * (1 - g) + clean * g
sf.write(out, np.clip(y, -1, 1), SR)
win = [s for s in range(secs) if music[s]]
print(f"{src}: music removed in {len(win)} s of {secs} s: {win[:12]}{'…' if len(win) > 12 else ''}")
