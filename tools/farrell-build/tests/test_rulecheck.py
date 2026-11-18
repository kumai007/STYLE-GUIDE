# Tests for rulecheck.py: run it on small fake EDLs, one broken rule per test.
# Run: cd tools/farrell-build && python -m unittest discover -s tests
import os, subprocess, sys, tempfile, unittest
from pathlib import Path

KIT = Path(__file__).resolve().parents[1]
FPS = 30000 / 1001
HALF = 18 / FPS            # half of a 2H (36 f) blend


def shot(id, a, b, kind="raw", tin="cut", hh=0, caps=()):
    return {"id": id, "a": a, "b": b, "kind": kind, "tin": tin, "tout": "cut",
            "hh": hh, "th": 0, "caps": list(caps)}


def event(keys, t0, t1, **kw):
    return {"kind": "shot", "keys": list(keys), "t0": t0, "t1": t1, "ent": "up", **kw}


# Valid base: two cut shots (changes at 0, 10, 20) and one 4 s comment with 3 s of plain footage each side.
BASE_SHOTS = [shot("01", 0, 10, caps=[(1, 3, "x")]), shot("02", 10, 20, kind="src")]
BASE_EVENTS = [event(["c1"], 3, 7)]
CARDS = {"c1": {"t": "hi"}, "c2": {"t": "yo"}}


class RuleCheck(unittest.TestCase):
    def run_check(self, shots=BASE_SHOTS, events=BASE_EVENTS, extra="", text=None):
        with tempfile.TemporaryDirectory() as d:
            Path(d, "fake_edl.py").write_text(
                f"H = 18\nSHOTS = {shots!r}\nEVENTS = {events!r}\nCARDS = {CARDS!r}\n{extra}\n", encoding="utf-8")
            Path(d, "text.py").write_text(f"TEXT = {text or {}!r}\n", encoding="utf-8")
            env = dict(os.environ, PYTHONPATH=d)
            r = subprocess.run([sys.executable, "rulecheck.py", "fake_edl", str(Path(d, "text.py"))],
                               cwd=KIT, env=env, capture_output=True, text=True, timeout=60)
        return r.returncode, r.stdout + r.stderr

    def assertFails(self, needle, **kw):
        code, out = self.run_check(**kw)
        self.assertEqual(code, 1, out)
        self.assertIn(needle, out)

    def assertPasses(self, **kw):
        code, out = self.run_check(**kw)
        self.assertEqual(code, 0, out)
        self.assertIn("rulecheck: OK", out)
        return out

    def test_valid_edl_passes(self):
        self.assertPasses()

    # --- shots
    def test_narration_shot_under_3s_fails(self):
        self.assertFails("shot 02 solo", shots=[BASE_SHOTS[0], shot("02", 10, 12.8, kind="src")])

    def test_narration_shot_exactly_3s_passes(self):
        self.assertPasses(shots=[BASE_SHOTS[0], shot("02", 10, 13, kind="src")])

    def test_blend_counts_against_solo_time(self):
        # 3.3 s shot, but a dissolve in eats 0.6 s -> 2.7 s solo
        self.assertFails("shot 02 solo", shots=[BASE_SHOTS[0], shot("02", 10, 13.3, kind="src", tin="dis", hh=18)])

    def test_raw_shot_has_no_solo_rule_but_total_floor(self):
        self.assertPasses(shots=[BASE_SHOTS[0], shot("02", 10, 12.6)])
        self.assertFails("shot 02 total", shots=[BASE_SHOTS[0], shot("02", 10, 12.4)])

    # --- captions
    def test_caption_too_short_fails(self):
        self.assertFails("caption 01", shots=[shot("01", 0, 10, caps=[(1, 1.5, "x")]), BASE_SHOTS[1]])

    def test_caption_too_long_fails(self):
        self.assertFails("caption 01", shots=[shot("01", 0, 10, caps=[(1, 8.5, "x")]), BASE_SHOTS[1]])

    def test_onscreen_caption_may_be_long(self):
        self.assertPasses(shots=[shot("01", 0, 10, caps=[(1, 8.5, "x")]), BASE_SHOTS[1]], extra="ONSCREEN_CAPS = {'01'}")

    # --- comments
    def test_comment_under_3_5s_fails(self):
        self.assertFails("comment ['c1'] on", events=[event(["c1"], 3, 6.4)])

    def test_reading_time_is_a_warning_only(self):
        out = self.assertPasses(text={"c1": "x" * 100})   # TEXT override from the text file: needs 7.67 s, has 4 s
        self.assertIn("warn comment ['c1']", out)

    def test_short_card_text_gives_no_warning(self):
        self.assertNotIn("warn", self.assertPasses())

    def test_thread_must_not_grow(self):
        self.assertFails("thread", events=[event(["c1", "c2"], 3, 7, morph=4.0)])

    def test_exit_motion_inside_fade_fails(self):
        shots = [BASE_SHOTS[0], shot("02", 10, 20, kind="src", tin="dis", hh=18)]
        self.assertFails("exit", shots=shots, events=[event(["c1"], 3, 10)])
        self.assertFails("inside fade into 02", shots=shots, events=[event(["c1"], 3, 10)])

    def test_xout_on_fade_window_passes(self):
        shots = [BASE_SHOTS[0], shot("02", 10, 20, kind="src", tin="dis", hh=18)]
        self.assertPasses(shots=shots, events=[event(["c1"], 3, 10 + HALF, xout=(10 - HALF, 10 + HALF))])

    def test_xin_not_on_fade_window_fails(self):
        self.assertFails("is not a fade window", events=[event(["c1"], 3, 7, xin=(2.0, 3.0))])

    # --- plain footage next to an overlay: 0 s or >= 3 s
    def test_enter_too_soon_after_change_fails(self):
        self.assertFails("enters", events=[event(["c1"], 2, 7)])

    def test_leave_too_soon_before_change_fails(self):
        self.assertFails("leaves", events=[event(["c1"], 3, 8)])

    def test_handoff_overlap_rules(self):
        self.assertPasses(events=[event(["c1"], 3, 7), event(["c2"], 6.5, 17)])
        self.assertFails("handoff overlap", events=[event(["c1"], 3, 7), event(["c2"], 6.8, 17)])

    # --- usage
    def test_missing_edl_argument_errors(self):
        r = subprocess.run([sys.executable, "rulecheck.py"], cwd=KIT, capture_output=True, text=True, timeout=60)
        self.assertNotEqual(r.returncode, 0)

    @unittest.skipUnless((KIT / "edl6.py").exists() and (KIT / "final6.py").exists(), "no edl6/final6")
    def test_current_edl6_passes(self):
        r = subprocess.run([sys.executable, "rulecheck.py", "edl6", "final6.py"], cwd=KIT,
                           capture_output=True, text=True, timeout=120)
        self.assertEqual(r.returncode, 0, r.stdout[-2000:] + r.stderr[-2000:])


if __name__ == "__main__":
    unittest.main()
