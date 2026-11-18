"""Download a case cut sheet's RAW sources with yt-dlp, one at a time, and verify each file.

The tag -> URL map is the sheet itself: every `[TAG] <url>` line under a `## CASE` heading. By default each tag's
whole video is fetched (you need it whole: transcribe it, scan it for burned-in cards, find B-roll). --sections fetches
only the cue ranges (+/- --pad) instead, re-cut on exact frames, and records each piece's source offset.

Machine rules (memory: yt-dlp / TikTok):
  * yt-dlp is updated first (pip, `yt-dlp[default]` = with the EJS challenge solver); --no-update skips it.
  * NEVER in parallel: YouTube's bot check locks the whole IP. Downloads run sequentially with --sleep-requests 2 and
    --sleep-between seconds between videos. On a bot-check / 429 the run STOPS; wait ~5 minutes, rerun (files already
    present are skipped).
  * Format: H.264 + AAC first (Premiere-safe); fallback any <=1080p, transcoded to H.264/AAC. Never accept the
    progressive 360p fallback: width/height are ffprobed and anything under 720p fails.
  * "challenge solving failed" -> one retry with --remote-components ejs:github.
  * TikTok is geo-blocked from this IP (redirects to /in/about); skipped unless --allow-tiktok (VPN up).

Usage:
    python fetch_sources.py SHEET.md|job.json -o OUT_DIR [--dry-run] [--tags A,B] [--sections --pad 5 --cues cue_01]
                            [--sleep-between 45] [--cookies FILE] [--no-update] [--allow-tiktok]
Writes OUT_DIR/<TAG>.mp4 (or <TAG>_<in>-<out>.mp4 with --sections) and OUT_DIR/fetch.json.
"""
from __future__ import annotations
import argparse, json, re, subprocess, sys, time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from cutsheet import parse, CutSheetError  # noqa: E402

FMT_AVC = "bv*[vcodec^=avc1][height<=1080][ext=mp4]+ba[ext=m4a]"
FMT_ANY = "bv*[height<=1080]+ba"
FMT_HLS = "bv*[protocol^=m3u8][vcodec^=avc1][height<=1080]+ba[protocol^=m3u8]/b[protocol^=m3u8][height<=1080][height>=720]"
QUIET = ["--no-progress", "--no-warnings", "--no-playlist", "--sleep-requests", "2", "--retries", "3"]
BLOCKED = re.compile(r"not a bot|Sign in to confirm|HTTP Error 429|Too Many Requests", re.I)
CHALLENGE = re.compile(r"challenge solving failed", re.I)
SECRET = re.compile(r"(?i)\b(sig|signature|key|token|cookies?|auth\w*)=([^&\s\"']+)")


def redact(s: str) -> str:
    return SECRET.sub(lambda m: f"{m.group(1)}=REDACTED", s)


def last_error(out: str) -> str:
    lines = [l.strip() for l in out.splitlines() if l.strip()]
    errs = [l for l in lines if "ERROR" in l or BLOCKED.search(l)]
    return redact((errs or lines or [""])[-1])[:240]


def probe(path: Path) -> dict | None:
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries",
                        "format=duration:stream=codec_type,codec_name,width,height,avg_frame_rate", "-of", "json", str(path)],
                       capture_output=True, text=True)
    if r.returncode: return None
    d = json.loads(r.stdout or "{}"); st = d.get("streams", [])
    v = next((s for s in st if s.get("codec_type") == "video"), None)
    a = next((s for s in st if s.get("codec_type") == "audio"), None)
    if not v: return None
    n, _, den = (v.get("avg_frame_rate") or "0/1").partition("/")
    return {"duration": round(float(d.get("format", {}).get("duration", 0)), 3), "width": v.get("width"),
            "height": v.get("height"), "fps": round(float(n) / float(den or 1), 5) if float(den or 1) else None,
            "vcodec": v.get("codec_name"), "acodec": a.get("codec_name") if a else None}


def to_h264(path: Path) -> None:
    tmp = path.with_name(path.stem + ".h264.tmp.mp4")
    subprocess.run(["ffmpeg", "-hide_banner", "-v", "error", "-y", "-i", str(path), "-map", "0:v:0", "-map", "0:a:0?",
                    "-c:v", "libx264", "-crf", "18", "-preset", "medium", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "320k",
                    "-movflags", "+faststart", str(tmp)], check=True)
    tmp.replace(path)


def ytdlp(url: str, out_tmpl: str, fmt: str, cookies: str | None, extra: list, timeout: float) -> tuple:
    cmd = ["yt-dlp", *QUIET, "-f", fmt, "--merge-output-format", "mp4", "-o", out_tmpl,
           *(["--cookies", cookies] if cookies else []), *extra, url]
    p = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, errors="replace")
    try:
        out, _ = p.communicate(timeout=timeout)
    except subprocess.TimeoutExpired:   # yt-dlp.exe -> python -> ffmpeg: kill the whole tree, not just the launcher
        if sys.platform == "win32": subprocess.run(["taskkill", "/T", "/F", "/PID", str(p.pid)], capture_output=True)
        else: p.kill()
        out, _ = p.communicate()
        return 124, (out or "") + f"\nERROR: yt-dlp timed out after {int(timeout)} s"
    return p.returncode, out or ""


def fetch_one(url: str, dest: Path, cookies: str | None, section: tuple | None) -> dict:
    """dest = final .mp4. Tries H.264 then any format; one EJS retry on a challenge failure."""
    extra = (["--download-sections", f"*{section[0]:.3f}-{section[1]:.3f}", "--force-keyframes-at-cuts"] if section else [])
    out = ""
    # Sections: DASH ranges hung in ffmpeg on this machine (2026-10-20: 15 min stuck at -ss); HLS segments are the route.
    fmts = (FMT_HLS, FMT_AVC) if section else (FMT_AVC, FMT_ANY)
    timeout = 600 if section else 5400
    for fmt in fmts:
        for ejs in ([], ["--remote-components", "ejs:github"]):
            if ejs and not CHALLENGE.search(out): continue
            code, out = ytdlp(url, str(dest.with_suffix(".%(ext)s")), fmt, cookies, extra + ejs, timeout)
            if BLOCKED.search(out) and not dest.exists():
                return {"status": "blocked", "msg": last_error(out)}
            info = probe(dest) if dest.exists() else None   # a non-zero exit can still leave a good file (memory)
            if info: break
        if info: break
    if not info: return {"status": "failed", "msg": last_error(out)}
    if info["vcodec"] != "h264" or (info["acodec"] and info["acodec"] != "aac"):
        to_h264(dest); info = probe(dest); info["transcoded"] = True
    if (info["height"] or 0) < 720 and (info["width"] or 0) < 720:
        return {"status": "low-res", "msg": f"{info['width']}x{info['height']} - refusing a sub-720p fallback", **info}
    return {"status": "ok", **info}


def merged_ranges(cues: list, pad: float) -> list:
    rs = sorted((max(0.0, c["start"] - pad), c["end"] + pad) for c in cues)
    out = []
    for a, b in rs:
        if out and a <= out[-1][1]: out[-1][1] = max(out[-1][1], b)
        else: out.append([a, b])
    return [tuple(r) for r in out]


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description="Fetch a cut sheet's RAW sources with yt-dlp, sequentially.")
    ap.add_argument("sheet", help="cut sheet .md or a job.json from cutsheet.py parse")
    ap.add_argument("-o", "--out", required=True)
    ap.add_argument("--dry-run", action="store_true"); ap.add_argument("--tags", help="comma list, default all")
    ap.add_argument("--sections", action="store_true", help="fetch only the cue ranges instead of whole videos")
    ap.add_argument("--cues", help="with --sections: only these cue ids (comma list, e.g. cue_01,cue_07)")
    ap.add_argument("--pad", type=float, default=5.0, help="seconds around each cue with --sections (default 5)")
    ap.add_argument("--sleep-between", type=float, default=45.0, help="seconds between videos (default 45)")
    ap.add_argument("--cookies", help="Netscape cookies.txt (normally not needed; never printed)")
    ap.add_argument("--no-update", action="store_true"); ap.add_argument("--allow-tiktok", action="store_true")
    a = ap.parse_args(argv)
    src = Path(a.sheet)
    try:
        job = json.loads(src.read_text(encoding="utf-8")) if src.suffix == ".json" else parse(src.read_text(encoding="utf-8"))
    except CutSheetError as e:
        print(f"cut sheet error: {e}", file=sys.stderr); return 1
    want = [t.strip() for t in a.tags.split(",")] if a.tags else list(job["sources"])
    unknown = [t for t in want if t not in job["sources"]]
    if unknown: print(f"unknown tags: {unknown}; sheet has {list(job['sources'])}", file=sys.stderr); return 1
    cues = [b for b in job["blocks"] if b["kind"] == "raw"]
    if a.cues:
        keep = {c.strip() for c in a.cues.split(",")}; cues = [c for c in cues if c["id"] in keep]
        if a.sections and not a.tags: want = [t for t in want if any(c["tag"] == t for c in cues)]
    plan = []
    for tag in want:
        url = job["sources"][tag]["url"]
        if a.sections:
            for r in merged_ranges([c for c in cues if c["tag"] == tag], a.pad):
                plan.append((tag, url, r, f"{tag}_{int(r[0])}-{int(r[1] + 0.999)}.mp4"))
        else:
            plan.append((tag, url, None, f"{tag}.mp4"))
    out = Path(a.out)
    for tag, url, r, name in plan:
        span = f"  {r[0]:.1f}-{r[1]:.1f}s" if r else "  whole"
        note = "  SKIP: TikTok geo-blocked (needs VPN, then --allow-tiktok)" if "tiktok.com" in url and not a.allow_tiktok else ""
        have = "  present" if (out / name).exists() else ""
        print(f"[{tag}] {url}{span} -> {name}{have}{note}")
    if a.dry_run:
        print(f"dry run: {len(plan)} download(s), sequential, {a.sleep_between:.0f}s apart"); return 0
    out.mkdir(parents=True, exist_ok=True)
    if not a.no_update:
        subprocess.run([sys.executable, "-m", "pip", "install", "-q", "-U", "yt-dlp[default]"], capture_output=True)
    ver = subprocess.run(["yt-dlp", "--version"], capture_output=True, text=True).stdout.strip()
    print(f"yt-dlp {ver}")
    man_path = out / "fetch.json"
    man = json.loads(man_path.read_text(encoding="utf-8")) if man_path.exists() else {}
    first = True; bad = 0
    for i, (tag, url, r, name) in enumerate(plan):
        dest = out / name
        if "tiktok.com" in url and not a.allow_tiktok:
            res = {"status": "skipped", "msg": "TikTok geo-blocked from this IP; connect the VPN and pass --allow-tiktok"}
        elif dest.exists() and (info := probe(dest)):
            res = {"status": "present", **info}
        else:
            if not first: time.sleep(a.sleep_between)
            first = False
            res = fetch_one(url, dest, a.cookies, r)
        res.update({"tag": tag, "url": url, "path": str(dest.resolve()), "source_offset": r[0] if r else 0.0})
        man[name] = res
        man_path.write_text(json.dumps(man, indent=1), encoding="utf-8")
        dims = f"{res.get('width')}x{res.get('height')} {res.get('fps')}fps {res.get('duration')}s" if res.get("width") else res.get("msg", "")
        print(f"[{tag}] {name}: {res['status']}  {dims}")
        if res["status"] == "blocked":
            print(f"STOPPED: YouTube bot check. Do not retry at once (it is IP-wide). Wait ~300 s, then rerun; "
                  f"{len(plan) - i - 1} download(s) not attempted.", file=sys.stderr)
            return 3
        if res["status"] not in ("ok", "present", "skipped"): bad += 1
    print(f"manifest: {man_path}")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
