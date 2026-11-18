import sys, unittest
from pathlib import Path
import numpy as np
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "tools"))
import measure as MS


class Metrics(unittest.TestCase):
    def test_flat_frame(self):
        m = MS.frame_metrics(np.full((90, 160, 3), 120, np.uint8))
        self.assertAlmostEqual(m["vignette"], 1.0, places=3); self.assertLess(m["grain"], 1e-3)
        self.assertAlmostEqual(m["sat"], 0.0); self.assertFalse(m["dark"])

    def test_dark_black_vignette_grain(self):
        self.assertTrue(MS.frame_metrics(np.full((90, 160, 3), 20, np.uint8))["dark"])
        self.assertTrue(MS.frame_metrics(np.zeros((90, 160, 3), np.uint8))["black"])
        f = np.full((90, 160, 3), 150, np.uint8); f[:9] = f[-9:] = 30; f[:, :16] = f[:, -16:] = 30
        self.assertLess(MS.frame_metrics(f)["vignette"], 0.5)
        noisy = np.random.default_rng(1).integers(0, 255, (90, 160, 3)).astype(np.uint8)
        self.assertGreater(MS.frame_metrics(noisy)["grain"], 20)

    def test_tint_and_summary(self):
        f = np.zeros((90, 160, 3), np.uint8); f[..., 2] = 200   # pure blue
        self.assertLess(MS.frame_metrics(f)["tint_rb"], -100)
        s = MS.summarise([MS.frame_metrics(np.full((90, 160, 3), v, np.uint8)) for v in (10, 100, 200)])
        self.assertEqual(s["frames"], 3); self.assertAlmostEqual(s["dark_share"], 1 / 3, places=3)

    def test_category(self):
        self.assertEqual(MS.category(["claude", "motion graphic", "page-3d"]), "page-3d")
        self.assertEqual(MS.category(["claude"]), "untagged")


if __name__ == "__main__":
    unittest.main()
