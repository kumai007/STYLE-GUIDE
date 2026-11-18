"""Lint HyperFrames case files before a render. usage: python lint_cases.py <cases dir> [--fix]

Checks (each one cost a re-build in coc2h-vol1, 2026-11-17/18):
  BLUR_T  page name/face boxes filtered with `b[1] >= A.T` drop boxes that straddle the art cut T, so part of a private
          name shows unblurred. Keep them and clip to T. --fix rewrites the filter.
Exit 1 if any finding is left."""
import glob, os, re, sys

OLD = re.compile(r"\.filter\(\(b\) => b && (\(!A \|\| )?b\[1\] >= A\.T\)?\)\.map\(")
NEW = ".filter((b) => b && (!A || b[3] > A.T)).map((b) => (A ? [b[0], Math.max(b[1], A.T), b[2], b[3]] : b)).map("


def lint_text(s):
    return [('BLUR_T', s[:m.start()].count('\n') + 1) for m in OLD.finditer(s)]


def fix_text(s):
    return OLD.sub(NEW, s)


def main():
    d, fix = sys.argv[1], '--fix' in sys.argv
    left = 0
    for f in sorted(glob.glob(os.path.join(d, 'coc_*.mjs')) + sorted(glob.glob(os.path.join(d, 'case*.mjs')))):
        s = open(f, encoding='utf-8').read(); found = lint_text(s)
        if found and fix: open(f, 'w', encoding='utf-8').write(fix_text(s)); print(f'FIXED {os.path.basename(f)} {found}'); continue
        for k, ln in found: print(f'{k} {os.path.basename(f)}:{ln}'); left += 1
    print('findings', left); sys.exit(1 if left else 0)


if __name__ == '__main__':
    main()
