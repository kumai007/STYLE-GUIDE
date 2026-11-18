import json, sys, unittest
from pathlib import Path
SG = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(SG)); sys.path.insert(0, str(SG / "tools"))
import model as M
import load_seed as LS

NODES = [{"id": "c1", "src": "farrell-03-tv-news/x.mp4", "sf_in": 10, "sf_out": 40, "title": "Red '1991' title"}]


class Build(unittest.TestCase):
    def test_build_resolves_clips(self):
        g = LS.build({"categories": {"typography": {"summary": "VCR.", "rules": [{"text": "Use VCR.", "source": "user", "evidence": ["c1"]}]}},
                      "rulebook": ["Never skip."]}, NODES, {"learnings": [{"id": "l-1", "text": "x", "status": "open", "date": "d"}], "updates": []})
        self.assertEqual(M.validate(g), [])
        ev = M.cat(g, "typography")["rules"][0]["evidence"][0]
        self.assertEqual((ev["sf_in"], ev["sf_out"]), (10, 40)); self.assertTrue(ev["label"].startswith("v03"))
        self.assertEqual(len(g["learnings"]), 1); self.assertEqual(g["rulebook"][0]["text"], "Never skip.")

    def test_unknown_clip_and_cat(self):
        with self.assertRaises(M.OpError): LS.build({"categories": {"typography": {"rules": [{"text": "a", "evidence": ["nope"]}]}}}, NODES)
        with self.assertRaises(M.OpError): LS.build({"categories": {"nope": {}}}, NODES)

    def test_real_seed_is_valid(self):
        seed = SG / "farrell" / "seed.json"
        if not seed.exists(): self.skipTest("no seed.json")
        nodes = json.loads((SG.parent / "productions" / "_boards" / "farrell.json").read_text(encoding="utf-8"))["nodes"]
        g = LS.build(json.loads(seed.read_text(encoding="utf-8")), nodes)
        self.assertEqual(M.validate(g), [])
        self.assertTrue(all(c["summary"] and c["rules"] for c in g["categories"]), "every category needs a summary and rules")


if __name__ == "__main__":
    unittest.main()
