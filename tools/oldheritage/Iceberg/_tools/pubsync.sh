#!/bin/bash
# pubsync.sh <KEY | pub dir>: (re)build a per-case public dir as a HARD-LINK tree (Windows).
# Why: Remotion cannot copy symlinks/junctions in --public-dir on Windows without Developer Mode (EPERM).
# Hard links are normal files to Remotion, need no admin and use no extra disk space. Same drive only (falls back to a copy).
# Sources are listed in <pub>/.src as "name<TAB>path" (written by newcase.sh). Deleting a hard link never touches the original.
set -e
I=C:/Users/ayush/Videos/CLAUDE/STYLEG~1/tools/oldheritage/Iceberg; E=$I/_engine
case "$1" in */*) P="$1";; *) P=$E/pubs/$1;; esac
[ -f "$P/.src" ] || { echo "pubsync: no $P/.src (run newcase.sh first)"; exit 1; }
cd "$P"
for x in * ; do  # old junctions (from earlier Windows setup): remove the link only
  [ -e "$x" ] || continue
  if [ -L "$x" ] || powershell -NoProfile -c "exit [int]!((Get-Item -LiteralPath '$(cygpath -w "$P/$x")' -Force).LinkType -eq 'Junction')" ; then
    MSYS_NO_PATHCONV=1 cmd /c rmdir "$(cygpath -w "$P/$x")" >/dev/null 2>&1 || rm -f "$x"
  fi
done
find . -mindepth 1 -maxdepth 1 ! -name '.src' -exec rm -rf {} +
while IFS=$'\t' read -r name src; do
  [ -n "$name" ] && [ -e "$src" ] || { [ -n "$name" ] && echo "pubsync: missing $src"; continue; }
  cp -rl "$src" "$name" 2>/dev/null || cp -r "$src" "$name"
done < .src
