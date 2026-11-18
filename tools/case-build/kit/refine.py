"""Energy-refined cue edges. args: file prev_end first_s last_e next_s (use - for none)"""
import subprocess, sys, numpy as np
def env(f, a, b, hop=0.02):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{a:.3f}", "-to", f"{b:.3f}", "-i", f, "-af", "highpass=f=250,lowpass=f=3500",
                          "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], capture_output=True).stdout
    x = np.frombuffer(raw, np.int16).astype(float) / 32768; n = int(16000 * hop); k = len(x) // n
    return 20 * np.log10(np.sqrt((x[:k * n].reshape(k, n) ** 2).mean(1)) + 1e-9)
def refine(f, pv, fs, le, nx):
    a = (pv if pv is not None else fs - 3) - 0.5; b = (nx if nx is not None else le + 2.5) + 0.5
    e = env(f, a, b); t = a + np.arange(len(e)) * 0.02
    floor = np.percentile(e, 10); thr = floor + 12
    lo = pv if pv is not None else fs - 1.0
    on = next((t[i] for i in range(len(e)) if t[i] >= lo and e[i] >= thr and e[i:i+5].mean() >= thr - 3), fs)
    hi = (nx - 0.05) if nx is not None else le + 1.5
    off = next((t[i] + 0.02 for i in range(len(e) - 1, -1, -1) if t[i] <= hi and t[i] >= le - 1.5 and e[i] >= thr and e[max(0,i-4):i+1].mean() >= thr - 3), le)
    vin = max(on - 0.3, (pv + 0.05) if pv is not None else -1)
    vout = min(off + 0.4, (nx - 0.08) if nx is not None else 1e9)
    return floor, on, off, vin, vout
if __name__ == "__main__":
    f = sys.argv[1]; v = [None if s == "-" else float(s) for s in sys.argv[2:6]]
    fl, on, off, vin, vout = refine(f, *v)
    print(f"floor {fl:.0f}dB onset {on:.2f} offset {off:.2f} -> in {vin:.2f} out {vout:.2f} ({vout-vin:.2f}s)")
