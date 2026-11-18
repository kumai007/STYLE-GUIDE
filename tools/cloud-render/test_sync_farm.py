"""Regression test for the key scanner in sync_farm.py.
Run: python -I tools/cloud-render/test_sync_farm.py
Bug 2026-11-14: a news URL with 'achinsk-oil-...' matched 'sk-...' and blocked every sync."""
import os, sys, unittest
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import tempfile
from sync_farm import SECRET, wanted

FAKE = ("s" + "k-") + "A1b2C3d4E5f6G7h8J9k0LmNo"          # built at run time so this file never trips the scanner


class SecretScan(unittest.TestCase):
    def test_word_ending_in_sk_is_not_a_key(self):
        url = b"https://www.example.com/2014/06/17/rosneft-halts-achinsk-oil-refinery-after-blast"
        self.assertIsNone(SECRET.search(url))

    def test_real_looking_key_is_caught(self):
        for pre in (b"", b" ", b"=", b'"', b"key: "):
            self.assertIsNotNone(SECRET.search(pre + FAKE.encode()), pre)


class Wanted(unittest.TestCase):
    """2026-11-16: the guide repo clone (guide/), the case-farm clone and its local config must never be mirrored."""
    def test_skips_clones_and_local_config(self):
        with tempfile.TemporaryDirectory() as d:
            for rel in ("CLAUDE.md", "tools/a.py", "tools/cloud-render/guide/CLAUDE.md",
                        "tools/case-farm/farm.sh", "tools/x/farm.local.json", "tools/x/.env"):
                p = os.path.join(d, rel); os.makedirs(os.path.dirname(p), exist_ok=True)
                open(p, "w").write("x")
            self.assertEqual(sorted(wanted(d)), ["CLAUDE.md", "tools/a.py"])

    def test_skips_hf_engine_media_and_junctions(self):
        """2026-11-16: hf-engine/media (moved from engine/public) and junctions to it are never mirrored."""
        with tempfile.TemporaryDirectory() as d:
            for rel in ("styleguide/gx-admixdd/hf-engine/build.mjs", "styleguide/gx-admixdd/hf-engine/media/case12/a.json"):
                p = os.path.join(d, rel); os.makedirs(os.path.dirname(p), exist_ok=True)
                open(p, "w").write("x")
            j = os.path.join(d, "styleguide/gx-admixdd/hf-engine/parts/case12/assets")
            os.makedirs(j)
            if os.name == "nt":
                import subprocess
                subprocess.run(["cmd", "/c", "mklink", "/J", os.path.normpath(os.path.join(j, "media")),
                                os.path.normpath(os.path.join(d, "styleguide/gx-admixdd/hf-engine/media/case12"))],
                               capture_output=True, check=True)
            self.assertEqual(sorted(wanted(d)), ["styleguide/gx-admixdd/hf-engine/build.mjs"])


if __name__ == "__main__":
    unittest.main()


def test_repo_level_files_are_never_removed(tmp_path, monkeypatch):
    """Review 2026-11-18: mirrored() listed LICENSE/.gitignore/.github, so the sync deleted them from the public repo."""
    import sync_farm as sf
    for f in ('README.md', 'LICENSE', '.gitignore', '.github/workflows/x.yml', 'docs/a.md'):
        p = tmp_path / f; p.parent.mkdir(parents=True, exist_ok=True); p.write_text('x')
    monkeypatch.setattr(sf, 'MIR', str(tmp_path))
    assert sf.mirrored() == {'docs/a.md'}


def test_more_key_shapes_block_the_sync():
    import sync_farm as sf
    for t in [b'sk_' + b'a1' * 20, b'ya29.' + b'A' * 30, b'"refresh_token": "' + b'x' * 30 + b'"', b'Authorization: Bearer ' + b'q' * 40]:
        assert sf.SECRET.search(t), t
    for t in [b'sk_test', b'a Bearer token', b'"access_token": ""']:
        assert not sf.SECRET.search(t), t
