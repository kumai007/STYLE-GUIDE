"""head audio fix for open_on_vo.py: remove the title->VO glitch SFX (and, for IN01, give the music bed a 1 s fade-in) from the
trimmed master audio by least-squares subtraction of the known source signals (gain + lag fitted on the master itself)."""
import subprocess, numpy as np
SR = 44100


def dec(f, ss, t, sr=SR):
    pre = max(0.0, -ss)
    a = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{max(0.0, ss):.4f}", "-i", f, "-t", f"{t - pre:.4f}", "-ac", "2", "-ar", str(sr),
                        "-f", "f32le", "-"], capture_output=True, check=True).stdout
    x = np.frombuffer(a, np.float32).reshape(-1, 2).astype(np.float64)
    x = np.concatenate([np.zeros((int(round(pre * sr)), 2)), x])
    n = int(round(t * sr))
    return np.pad(x, ((0, max(0, n - len(x))), (0, 0)))[:n]


def fit(x, s, w, lags):
    """best lag (samples) and gain for x ~ g * w * s(shifted); returns (lag, g, residual reduction dB)"""
    best = None
    for L in lags:
        sh = np.roll(s, L, axis=0)
        if L > 0: sh[:L] = 0
        elif L < 0: sh[L:] = 0
        m = sh * w[:, None]
        den = (m * m).sum()
        if den <= 0: continue
        g = (x * m).sum() / den
        r = ((x - g * m) ** 2).sum()
        if best is None or r < best[3]:
            best = (L, g, m, r)
    L, g, m, r = best
    red = 10 * np.log10(((x ** 2).sum() + 1e-12) / (r + 1e-12))
    return L, g, m, red


def fix(audio, comps, W=1.6):
    """audio: (n,2) trimmed master audio at SR; comps: list of (file, offset_s at t=0, kind) kind 'remove' | 'fadein1'"""
    n = int(W * SR)
    x = audio[:n].copy()
    rep = []
    for f, off, kind in comps:
        s = dec(f, off, W + 0.1)[:n]
        t = np.arange(n) / SR
        if kind == "remove":
            w = np.ones(n)
            want = np.zeros(n)
        else:  # music fade-in 0 -> 1 over the first second
            w = np.ones(n)
            want = np.clip(t / 1.0, 0, 1)
        L, g, m, red = fit(x, s, w, range(-1500, 1501, 5))
        L2, g2, m2, red2 = fit(x, s, w, range(L - 6, L + 7))
        x = x - g2 * m2 * (1 - want)[:, None]
        rep.append(f"{f.split('/')[-1]} lag {L2 / SR * 1000:+.1f} ms gain {20 * np.log10(abs(g2) + 1e-12):.1f} dB fit {red2:.1f} dB")
    out = audio.copy()
    out[:n] = x
    return out, rep
