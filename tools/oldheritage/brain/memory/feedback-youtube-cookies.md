---
name: feedback-youtube-cookies
description: Owner 13 Nov 2026 allowed his Chrome cookies for yt-dlp when YouTube bot-checks the Mac; ~/Downloads/cookies.txt is expired
metadata:
  type: feedback
---

13 Nov 2026, during the YouTube "confirm you're not a bot" block: "use my cookies".

**Why:** downloads for the Iceberg/Old Heritage builds stalled for hours without them.
**How to apply:** yt-dlp `--cookies-from-browser chrome` (works; ~/Downloads/cookies.txt from Oct is expired, keep it, never delete);
pace downloads (≥15 s apart) to avoid re-triggering the block. Related: [[feedback-iceberg-download-permission]].
