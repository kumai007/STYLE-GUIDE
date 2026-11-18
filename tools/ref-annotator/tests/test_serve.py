"""Board server checks. Run: cd tools/ref-annotator && python -m unittest discover -s tests"""
import json, os, shutil, subprocess, sys, tempfile, threading, time, unittest, urllib.error, urllib.request, uuid
from pathlib import Path

TMP = tempfile.TemporaryDirectory()
os.environ["PVS_ROOT"] = TMP.name          # must be set before serve is imported
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import serve as B  # noqa: E402


def make_source():
    src = Path(TMP.name) / "demo" / "01_reference" / "source"
    if (src / "a.mp4").exists():
        return
    src.mkdir(parents=True, exist_ok=True)
    subprocess.run(["ffmpeg", "-hide_banner", "-nostdin", "-y", "-f", "lavfi", "-i", "testsrc=size=160x90:rate=10:duration=2",
                    "-pix_fmt", "yuv420p", str(src / "a.mp4")], capture_output=True, check=True)


def post(url, body):
    r = urllib.request.Request(url, data=json.dumps(body).encode(), headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(r, timeout=60) as resp:
        return resp.status, resp.read()


def unpack(raw):
    n = int.from_bytes(raw[:4], "big"); head = json.loads(raw[4:4 + n]); return head, raw[4 + n:]


@unittest.skipUnless(shutil.which("ffmpeg"), "needs ffmpeg")
class Poster(unittest.TestCase):
    """Symptom: a board with hundreds of clips lagged on load; every poster was sent with no-cache and
    re-downloaded on every load and every reload. Posters are fixed by source + frame, so they must be cacheable."""

    @classmethod
    def setUpClass(cls):
        make_source()
        cls.srv = B.ThreadingHTTPServer(("127.0.0.1", 0), B.H)
        threading.Thread(target=cls.srv.serve_forever, daemon=True).start()
        cls.url = f"http://127.0.0.1:{cls.srv.server_address[1]}/poster?v=demo%2F01_reference%2Fsource%2Fa.mp4&f=5"

    @classmethod
    def tearDownClass(cls):
        cls.srv.shutdown(); cls.srv.server_close()

    def get(self, headers=None):
        try:
            with urllib.request.urlopen(urllib.request.Request(self.url, headers=headers or {}), timeout=60) as r:
                return r.status, dict(r.headers), r.read()
        except urllib.error.HTTPError as e:
            return e.code, dict(e.headers), e.read()

    def test_poster_is_cacheable(self):
        code, h, body = self.get()
        self.assertEqual(code, 200); self.assertTrue(body.startswith(b"\xff\xd8"), "not a jpeg")
        self.assertIn("max-age=", h["Cache-Control"]); self.assertNotIn("no-cache", h["Cache-Control"])
        self.assertTrue(h.get("ETag"))

    def test_revalidation_returns_304_without_body(self):
        etag = self.get()[1]["ETag"]
        code, _, body = self.get({"If-None-Match": etag})
        self.assertEqual((code, body), (304, b""))
        self.assertEqual(self.get({"If-None-Match": '"other"'})[0], 200)


@unittest.skipUnless(shutil.which("ffmpeg"), "needs ffmpeg")
class Thumbs(unittest.TestCase):
    """A 100k-clip board cannot load 100k 480px posters: it asks for 64x36 thumbs + mean colours in batches."""

    @classmethod
    def setUpClass(cls):
        make_source(); cls.srv = B.ThreadingHTTPServer(("127.0.0.1", 0), B.H)
        threading.Thread(target=cls.srv.serve_forever, daemon=True).start()
        cls.url = f"http://127.0.0.1:{cls.srv.server_address[1]}/api/thumbs"

    @classmethod
    def tearDownClass(cls):
        cls.srv.shutdown(); cls.srv.server_close()

    def wait(self, body):
        for _ in range(150):                      # a miss is made in the background
            head, data = unpack(post(self.url, body)[1])
            if not head[0].get("miss"):
                break
            time.sleep(0.1)
        return head, data

    def test_thumbs_miss_then_hit(self):
        key = {"v": "demo/01_reference/source/a.mp4", "f": 7}
        code, raw = post(self.url, {"keys": [key]}); head, _ = unpack(raw)
        self.assertEqual(code, 200); self.assertEqual(head[0]["k"], 0)
        head, data = self.wait({"keys": [key]})
        h = head[0]; jpg = data[h["off"]:h["off"] + h["len"]]
        self.assertTrue(jpg.startswith(b"\xff\xd8")); self.assertEqual(len(h["c"]), 3)

    def test_colors_only_sends_no_bytes(self):
        head, data = self.wait({"keys": [{"v": "demo/01_reference/source/a.mp4", "f": 3}], "colors": True})
        self.assertIn("c", head[0]); self.assertNotIn("len", head[0]); self.assertEqual(data, b"")

    def test_bad_key_is_a_miss_not_a_crash(self):
        head, _ = unpack(post(self.url, {"keys": [{"v": "../etc/passwd", "f": 1}, {"v": "nope/x.mp4", "f": 1}, "x"]})[1])
        self.assertTrue(all(h.get("miss") for h in head)); self.assertEqual([h["k"] for h in head], [0, 1, 2])

    def test_too_many_keys_refused(self):
        with self.assertRaises(urllib.error.HTTPError) as e:
            post(self.url, {"keys": [{"v": "a", "f": 1}] * 257})
        self.assertEqual(e.exception.code, 400)


class Patch(unittest.TestCase):
    """Saving a 100k-clip board must not re-send and re-write 95 MB per edit: a patch carries only what changed."""

    @classmethod
    def setUpClass(cls):
        (Path(TMP.name) / "_boards").mkdir(exist_ok=True)
        cls.srv = B.ThreadingHTTPServer(("127.0.0.1", 0), B.H)
        threading.Thread(target=cls.srv.serve_forever, daemon=True).start()
        cls.base = f"http://127.0.0.1:{cls.srv.server_address[1]}"

    @classmethod
    def tearDownClass(cls):
        B.flush_all(); cls.srv.shutdown(); cls.srv.server_close()

    def setUp(self):
        self.name = "p" + uuid.uuid4().hex[:8]
        b = {"sync": False, "rev": 1, "nodes": [{"id": "n1", "type": "point", "x": 0, "y": 0}, {"id": "n2", "type": "point", "x": 9, "y": 9}],
             "edges": [{"id": "e1", "from": "n1", "to": "n2", "kind": "user"}], "view": {"x": 0, "y": 0, "z": 1}}
        B.board_file(self.name).write_text(json.dumps(b), encoding="utf-8")

    def get(self, p):
        with urllib.request.urlopen(self.base + p, timeout=30) as r:
            return json.loads(r.read())

    def patch(self, body):
        return json.loads(post(f"{self.base}/api/board/patch?b={self.name}", body)[1])

    def disk(self):
        return json.loads(B.board_file(self.name).read_text(encoding="utf-8"))

    def test_upsert_delete_and_rev(self):
        r = self.patch({"rev": 1, "upsert": {"nodes": [{"id": "n3", "type": "point", "x": 1, "y": 1},
                                                       {"id": "n1", "type": "point", "x": 5, "y": 5, "note": "hi"}]},
                        "del": {"nodes": ["n2"], "edges": ["e1"]}})
        self.assertEqual(r["rev"], 2); B.flush_all(); d = self.disk()
        self.assertEqual(sorted(n["id"] for n in d["nodes"]), ["n1", "n3"]); self.assertEqual(d["edges"], [])
        self.assertEqual(next(n for n in d["nodes"] if n["id"] == "n1")["note"], "hi"); self.assertEqual(d["rev"], 2)

    def test_stale_rev_is_409(self):
        with self.assertRaises(urllib.error.HTTPError) as e:
            post(f"{self.base}/api/board/patch?b={self.name}", {"rev": 7, "upsert": {"nodes": []}})
        self.assertEqual(e.exception.code, 409)

    def test_rev_and_get_after_patch_see_change(self):
        self.patch({"rev": 1, "view": {"x": 3, "y": 4, "z": 0.5}})
        self.assertEqual(self.get(f"/api/rev?b={self.name}")["rev"], 2)       # before the 2 s flush
        self.assertEqual(self.get(f"/api/board?b={self.name}")["view"]["z"], 0.5)

    def test_outside_write_is_picked_up(self):
        self.patch({"rev": 1, "view": {"x": 1, "y": 1, "z": 1}}); B.flush_all()
        d = self.disk(); d["rev"] = 9; d["nodes"].append({"id": "n9", "type": "point", "x": 0, "y": 0})
        time.sleep(0.05); B.board_file(self.name).write_text(json.dumps(d), encoding="utf-8")
        self.assertEqual(self.get(f"/api/rev?b={self.name}")["rev"], 9)
        r = self.patch({"rev": 9, "upsert": {"nodes": [{"id": "n8", "type": "point", "x": 0, "y": 0}]}}); B.flush_all()
        self.assertEqual(r["rev"], 10); self.assertTrue({"n8", "n9"} <= {n["id"] for n in self.disk()["nodes"]})

    def test_full_post_after_patch(self):
        self.patch({"rev": 1, "view": {"x": 1, "y": 1, "z": 1}})
        b = self.get(f"/api/board?b={self.name}"); b["nodes"].append({"id": "n7", "type": "point", "x": 0, "y": 0})
        r = json.loads(post(f"{self.base}/api/board?b={self.name}", b)[1]); self.assertEqual(r["rev"], 3)
        self.assertIn("n7", {n["id"] for n in self.disk()["nodes"]})
        self.assertEqual(self.patch({"rev": 3, "view": {"x": 0, "y": 0, "z": 2}})["rev"], 4)   # cache dropped, re-read

    def test_flush_all_writes_pending(self):
        self.patch({"rev": 1, "upsert": {"nodes": [{"id": "n5", "type": "point", "x": 0, "y": 0}]}})
        self.assertNotIn("n5", {n["id"] for n in self.disk()["nodes"]}); B.flush_all()
        self.assertIn("n5", {n["id"] for n in self.disk()["nodes"]})

    def test_timer_flushes_within_3s(self):
        self.patch({"rev": 1, "upsert": {"nodes": [{"id": "n6", "type": "point", "x": 0, "y": 0}]}})
        for _ in range(30):
            if "n6" in {n["id"] for n in self.disk()["nodes"]}:
                break
            time.sleep(0.1)
        self.assertIn("n6", {n["id"] for n in self.disk()["nodes"]})

    def test_bad_id_refused(self):
        for body in ({"rev": 1, "upsert": {"nodes": [{"id": "../x"}]}}, {"rev": 1, "del": {"nodes": [5]}},
                     {"rev": 1, "upsert": {"nodes": [{"id": "ok", "src": "../../etc/x.mp4"}]}}):
            with self.assertRaises(urllib.error.HTTPError) as e:
                post(f"{self.base}/api/board/patch?b={self.name}", body)
            self.assertIn(e.exception.code, (400, 403))
        self.assertEqual(self.disk()["rev"], 1)

    def test_sync_false_board_is_not_mirrored(self):
        self.assertTrue(B.board_skipped(B.board_file(self.name)))


if __name__ == "__main__":
    unittest.main()
