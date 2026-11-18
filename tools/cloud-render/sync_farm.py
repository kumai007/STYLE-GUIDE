"""Keep the PUBLIC repo kumai007/STYLE-GUIDE up to date with this folder (render farm video; was STYLE guide) (owner 2026-11-16).
Runs every 15 min (Windows task "RenderFarmSync"). Steps:
 1. copy the text/code files of this folder (CLAUDE.md, docs/, styleguide/, tools/) into guide/ (the repo clone)
    (no media, no files > 1 MB, no .env, no node_modules/caches/backups, no farm clones);
 2. scan for keys/tokens: if one is found, NOTHING is pushed (see .farm_sync.log);
 3. commit + push guide/ when something changed.
Renders run on DeZAYU/case-farm (tools/case-farm), not here.
Usage: pythonw -I -X utf8 sync_farm.py [--dry]      Turn off: schtasks /Delete /TN RenderFarmSync /F
Never prints the token."""
import os, re, sys, time, base64, shutil, subprocess
NOWIN = {'creationflags': 0x08000000} if os.name == 'nt' else {}   # no console window per child (owner 2026-11-18: pop-ups)
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
MIR = os.path.join(HERE, 'guide'); LOG = os.path.join(HERE, '.farm_sync.log')
REPO, ACCOUNT = 'kumai007/STYLE-GUIDE', 'kumai007'
TOP = ['CLAUDE.md', 'docs', 'styleguide', 'tools']
KEEP = {'README.md', 'LICENSE', '.gitignore', '.gitattributes'}   # repo-level files the sync never touches
EXT = {'.md', '.json', '.py', '.yml', '.yaml', '.txt', '.cmd', '.bat', '.ps1', '.js', '.mjs', '.ts', '.tsx', '.css', '.html', '.toml', '.cfg', '.ini', '.example', '.sh'}
SKIPD = {'.git', 'node_modules', '__pycache__', '.cache', '.venv', 'venv', 'farm', 'repo', 'guide', 'case-farm', 'pages', 'out', 'renders', 'farm_out'}
SKIPF = {'farm.local.json'}
SKIPP = {'styleguide/gx-admixdd/hf-engine/media', 'docs/knowledge/notes'}   # notes = raw project notes: private (2026-11-18)             # media roots (2026-11-16); junctions are never followed
SECRET = re.compile(rb'(gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,}|(?<![A-Za-z0-9])sk-[A-Za-z0-9_-]{20,}|AKIA[0-9A-Z]{16}'
                    rb'|AIza[0-9A-Za-z_-]{35}|xox[abpr]-[A-Za-z0-9-]{10,}|-----BEGIN [A-Z ]*PRIVATE KEY-----'
                    rb'|(?<![A-Za-z0-9])sk_[A-Za-z0-9]{32,}|ya29\.[0-9A-Za-z_-]{20,}|(?<![A-Za-z0-9])1//0[0-9A-Za-z_-]{30,}'
                    rb'|"(?:access_token|refresh_token|client_secret)"\s*:\s*"[^"\s]{16,}"|Bearer\s+[A-Za-z0-9._~+/-]{30,})')


def log(*a):
    try:
        if os.path.exists(LOG) and os.path.getsize(LOG) > 200_000: os.replace(LOG, LOG + '.old')
        with open(LOG, 'a', encoding='utf-8') as f: f.write(time.strftime('%Y-%m-%d %H:%M:%S ') + ' '.join(map(str, a)) + '\n')
    except OSError: pass
    if sys.stdout: print(*a, flush=True)


def wanted(root=ROOT):
    out = {}
    for t in TOP:
        s = os.path.join(root, t)
        if os.path.isfile(s): out[t] = s; continue
        for r, ds, fs in os.walk(s):
            ds[:] = [d for d in ds if d not in SKIPD and not d.startswith(('_backup', '.')) and not os.path.isjunction(os.path.join(r, d))
                     and os.path.relpath(os.path.join(r, d), root).replace('\\', '/') not in SKIPP]
            for f in fs:
                p = os.path.join(r, f); e = os.path.splitext(f)[1].lower()
                if f.startswith('.env') and not f.endswith('.example'): continue
                if f in SKIPF or e not in EXT or '.bak' in f or os.path.getsize(p) > 1_000_000: continue
                out[os.path.relpath(p, root).replace('\\', '/')] = p
    return out


def known_secrets():
    """values from local .env files and key env vars: they must never appear in the public repo"""
    vals = [os.environ.get('EPIDEMIC_SOUND_API_KEY', '')]
    for r, ds, fs in os.walk(os.path.join(ROOT, 'tools')):
        ds[:] = [d for d in ds if d not in SKIPD]
        for f in fs:
            if f.startswith('.env') and not f.endswith('.example'):
                for l in open(os.path.join(r, f), encoding='utf-8', errors='ignore'):
                    if '=' in l and not l.lstrip().startswith('#') and re.search(r'KEY|TOKEN|SECRET|PASS|AUTH|COOKIE', l.split('=', 1)[0], re.I):
                        vals.append(l.split('=', 1)[1].strip().strip('"\''))
    return [v.encode() for v in vals if len(v) >= 12]


def mirrored():
    """files now in the clone (not .git, not KEEP)"""
    out = set()
    for r, ds, fs in os.walk(MIR):
        ds[:] = [d for d in ds if d not in ('.git', '.github')]   # repo-level folders are never removed
        out |= {os.path.relpath(os.path.join(r, f), MIR).replace('\\', '/') for f in fs}
    return out - KEEP


def main(dry):
    if not os.path.isdir(os.path.join(MIR, '.git')): log('NO CLONE: git clone https://github.com/' + REPO + '.git guide'); return 3
    W = wanted(); bad = []; ks = known_secrets()
    for r, p in W.items():
        b = open(p, 'rb').read()
        if SECRET.search(b) or any(k in b for k in ks): bad.append(r)
    if bad: log('BLOCKED: key/token found, nothing pushed. Fix or exclude:', *bad); return 2
    old = mirrored(); n = 0
    for r, p in W.items():
        d = os.path.join(MIR, r)
        if not os.path.exists(d) or open(d, 'rb').read() != open(p, 'rb').read():
            n += 1
            if not dry: os.makedirs(os.path.dirname(d), exist_ok=True); shutil.copyfile(p, d)
    gone = old - set(W)
    for r in gone:
        if not dry: os.remove(os.path.join(MIR, r))                  # only inside our own clone
    log(f'guide: {len(W)} files, {n} changed, {len(gone)} removed' + (' (dry)' if dry else ''))
    if dry: return 0
    g = lambda *a, **k: subprocess.run(['git', '-C', MIR, *a], capture_output=True, text=True, **NOWIN, **k)
    r = g('add', '-A')
    if r.returncode: log('ADD FAILED: ' + r.stderr[-300:]); return 1
    st = g('status', '--porcelain')
    if st.returncode: log('STATUS FAILED: ' + st.stderr[-300:]); return 1
    if not st.stdout.strip(): log('no change'); return 0
    r = g('-c', 'user.name=kumai007', '-c', 'user.email=kumai007@users.noreply.github.com',
          'commit', '-q', '-m', 'sync: render farm video ' + time.strftime('%Y-%m-%d %H:%M'))
    if r.returncode: log('COMMIT FAILED: ' + r.stderr[-300:]); return 1
    tok = subprocess.run(['gh', 'auth', 'token', '--user', ACCOUNT, '--hostname', 'github.com'], capture_output=True, text=True, **NOWIN).stdout.strip()
    if not tok: log('PUSH SKIPPED: no gh token for ' + ACCOUNT + ' (run: gh auth login)'); return 1
    hdr = 'AUTHORIZATION: basic ' + base64.b64encode(f'x-access-token:{tok}'.encode()).decode()
    env = dict(os.environ, GIT_CONFIG_COUNT='1', GIT_CONFIG_KEY_0='http.https://github.com/.extraheader', GIT_CONFIG_VALUE_0=hdr)
    r = g('push', '-q', 'origin', 'HEAD:main', env=env)
    log('pushed' if r.returncode == 0 else 'PUSH FAILED: ' + r.stderr.replace(tok, '***')[-300:])
    return r.returncode


if __name__ == '__main__':
    sys.exit(main('--dry' in sys.argv))
