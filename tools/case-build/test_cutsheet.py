"""Regression tests for cutsheet.py (run: python -m pytest tools/case-build/test_cutsheet.py)."""
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).parent))
from cutsheet import CutSheetError, parse  # noqa: E402

SHEET = """# T

## INTRO

[SOA] <https://www.youtube.com/watch?v=aaaaaaaaaaa>

▶ RAW · [SOA] 1:34–1:39 · "line" · ~5s · cold open

Intro words.

## CASE 01 · Name · Place

[MPD] <https://www.youtube.com/watch?v=bbbbbbbbbbb>

Case words.

▶ RAW · [MPD] 0:00–0:07 · [visual: lobby] · ~7s · silent
"""


def test_intro_sources_allowed():
    job = parse(SHEET)
    assert job["sources"]["SOA"]["case_id"] == "intro"
    assert job["intro_tags"] == ["SOA"]
    assert job["cases"][0]["tags"] == ["MPD"]
    assert [b["case_id"] for b in job["blocks"] if b["kind"] == "raw"] == ["intro", "case_01"]


def test_source_before_any_section_still_rejected():
    with pytest.raises(CutSheetError):
        parse("# T\n\n[X] <https://www.youtube.com/watch?v=ccccccccccc>\n")


def test_visual_cue_parsed():
    raw = [b for b in parse(SHEET)["blocks"] if b["kind"] == "raw"]
    assert raw[0]["quote"] == "line" and raw[0]["visual"] is False
    assert raw[1]["quote"] == "lobby" and raw[1]["visual"] is True and raw[1]["end"] == 7
