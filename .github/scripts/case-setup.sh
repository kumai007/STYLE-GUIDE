#!/usr/bin/env bash
# Prepares one cloud machine for a case build. Used by .github/workflows/case-build.yml.
# Case files are NOT in this repo. They come from the private Drive folder gdrive:_cloud-jobs/<JOB>.
# Needs env: JOB, RCLONE_CONFIG_TEXT. Output: ./job (case folder), ffmpeg + rclone on PATH.
set -euo pipefail

# 1. FFmpeg: static Linux build (new version, close to the laptop's), not the old apt one.
curl -fsSL -o /tmp/ff.tar.xz https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-linux64-gpl.tar.xz
mkdir -p /tmp/ff && tar -xf /tmp/ff.tar.xz -C /tmp/ff --strip-components=1
sudo cp /tmp/ff/bin/ffmpeg /tmp/ff/bin/ffprobe /usr/local/bin/
ffmpeg -version | head -1

# 2. rclone (pinned official .deb).
curl -fsSL -o /tmp/rclone.deb https://downloads.rclone.org/v1.76.0/rclone-v1.76.0-linux-amd64.deb
sudo dpkg -i /tmp/rclone.deb > /dev/null

# 3. rclone config from the secret: written only on this temporary machine, never printed.
if [ -z "${RCLONE_CONFIG_TEXT:-}" ]; then echo "::error::Secret RCLONE_CONFIG is missing."; exit 1; fi
mkdir -p ~/.config/rclone
printf '%s\n' "$RCLONE_CONFIG_TEXT" > ~/.config/rclone/rclone.conf
chmod 600 ~/.config/rclone/rclone.conf

# 4. Download the case folder and the fonts from Drive.
rclone copy "gdrive:_cloud-jobs/$JOB" job --transfers 8
mkdir -p job/renders   # output folder (not uploaded, so make it here)
rclone copy gdrive:_cloud-jobs/fonts fonts
du -sh job

# 5. The scripts use Windows font paths. Point them at the downloaded fonts (this copy only).
sed -i "s#C:/Windows/Fonts/#$PWD/fonts/#g" job/build/gfx.py
