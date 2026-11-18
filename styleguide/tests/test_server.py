import json, os, shutil, subprocess, sys, tempfile, threading, time, unittest, urllib.error, urllib.request
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
import model as M
import server as S

BOARD = {"nodes": [{"id": "cX", "type": "clip", "parent": "v1", "src": "farrell-01-internet-archive/01_reference/source/x.mp4",
                    "fps": [30000, 1001], "sf_in": 10, "sf_out": 40, "title": "T", "note": "N", "tags": ["claude", "page-3d"]}]}


class Base(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(); d = Path(self.tmp.name)
        (d / "board.json").write_text(json.dumps(BOARD), encoding="utf-8")
        g = M.empty_guide(); g["categories"][0]["rules"].append({"id": "r-a", "text": "Contrast.", "source": "user", "evidence": []})
        M.save(g, d / "farrell.json", d / "history", d / "G.md")
        os.environ["STYLEGUIDE_CLAUDE_CMD"] = str(HERE / "fake_claude.py"); os.environ["FAKE_MODE"] = "ok"
        os.environ["STYLEGUIDE_TIMEOUT"] = "20"
        self.app = S.App(d, d / "G.md", d / "board.json")
        self.srv = S.make_server(0, self.app); self.port = self.srv.server_address[1]
        threading.Thread(target=self.srv.serve_forever, daemon=True).start(); self.d = d

    def tearDown(self):
        self.srv.shutdown(); self.srv.server_close(); self.tmp.cleanup()

    def req(self, path, body=None):
        r = urllib.request.Request(f"http://127.0.0.1:{self.port}{path}", data=None if body is None else json.dumps(body).encode(),
                                   headers={"Content-Type": "application/json"}, method="GET" if body is None else "POST")
        try:
            with urllib.request.urlopen(r, timeout=30) as f:
                return f.status, f.read()
        except urllib.error.HTTPError as e:
            return e.code, e.read()

    def guide(self):
        return json.loads(self.req("/api/guide")[1])

    def upload(self, data, name, ctype):
        r = urllib.request.Request(f"http://127.0.0.1:{self.port}/api/media", data=data, method="POST",
                                   headers={"Content-Type": ctype, "X-Name": urllib.request.quote(name)})
        try:
            with urllib.request.urlopen(r, timeout=30) as f:
                return f.status, json.loads(f.read())
        except urllib.error.HTTPError as e:
            return e.code, json.loads(e.read())

    def wait(self, uid):
        for _ in range(200):
            u = json.loads(self.req(f"/api/update?id={uid}")[1])
            if u["status"] != "running": return u
            time.sleep(0.1)
        self.fail("run never finished")


class Guide(Base):
    def test_get_save_md(self):
        g = self.guide(); g["categories"][2]["summary"] = "Teal shadows."
        s, b = self.req("/api/guide", g); self.assertEqual(s, 200)
        self.assertEqual(json.loads(b)["rev"], g["rev"] + 1)
        self.assertIn("Teal shadows.", (self.d / "G.md").read_text(encoding="utf-8"))

    def test_stale_rev_409(self):
        g = self.guide(); self.req("/api/guide", g)
        s, _ = self.req("/api/guide", g); self.assertEqual(s, 409)

    def test_invalid_400_nothing_written(self):
        g = self.guide(); g["categories"].pop()
        self.assertEqual(self.req("/api/guide", g)[0], 400); self.assertEqual(len(self.guide()["categories"]), 12)

    def test_client_cannot_overwrite_update_log(self):
        g = self.guide(); g["updates"] = [{"id": "u-fake"}]; self.req("/api/guide", g)
        self.assertEqual(self.guide()["updates"], [])

    def test_promote(self):
        g = self.guide(); g["learnings"].append({"id": "l-1", "date": "d", "text": "Hold titles 2 s.", "status": "open", "target": ""})
        self.req("/api/guide", g)
        s, b = self.req("/api/promote", {"id": "l-1", "to": "rulebook"}); self.assertEqual(s, 200)
        self.assertEqual(self.guide()["rulebook"][-1]["text"], "Hold titles 2 s.")

    def test_clip_lookup_and_404(self):
        s, b = self.req("/api/clip?id=cX"); self.assertEqual(s, 200)
        c = json.loads(b); self.assertEqual((c["sf_in"], c["sf_out"], c["fps"]), (10, 40, [30000, 1001]))
        self.assertEqual(self.req("/api/clip?id=nope")[0], 404)
        self.assertEqual(self.req("/poster?clip=nope")[0], 404)

    def test_static(self):
        s, b = self.req("/"); self.assertEqual(s, 200); self.assertIn(b"FARRELL", b)


class Update(Base):
    def test_ok_then_undo(self):
        rev0 = self.guide()["rev"]
        s, b = self.req("/api/update", {"note": "faces in shadow"}); self.assertEqual(s, 200)
        u = self.wait(json.loads(b)["id"]); self.assertEqual(u["status"], "done", u)
        g = self.guide()
        self.assertEqual(M.cat(g, "lighting")["rules"][-1]["text"], "Faces half in shadow.")
        self.assertEqual(g["learnings"][-1]["text"], "Keep faces half in shadow."); self.assertGreater(g["rev"], rev0)
        s, _ = self.req("/api/undo", {"id": u["id"]}); self.assertEqual(s, 200)
        g = self.guide(); self.assertEqual(M.cat(g, "lighting")["rules"], []); self.assertEqual(g["learnings"], [])
        self.assertEqual(next(x for x in g["updates"] if x["id"] == u["id"])["status"], "undone")

    def test_fenced_ok(self):
        os.environ["FAKE_MODE"] = "fenced"
        u = self.wait(json.loads(self.req("/api/update", {"note": "x"})[1])["id"]); self.assertEqual(u["status"], "done", u)

    def test_junk_and_badop_fail_unchanged(self):
        for mode in ("junk", "badop"):
            os.environ["FAKE_MODE"] = mode; before = self.guide()
            u = self.wait(json.loads(self.req("/api/update", {"note": "x"})[1])["id"])
            self.assertEqual(u["status"], "failed"); self.assertTrue(u["error"])
            after = self.guide(); self.assertEqual(after["categories"], before["categories"]); self.assertEqual(after["learnings"], before["learnings"])

    def test_cli_failure_shows_reason(self):
        os.environ["FAKE_MODE"] = "authfail"
        u = self.wait(json.loads(self.req("/api/update", {"note": "x"})[1])["id"])
        self.assertEqual(u["status"], "failed")
        self.assertIn("OAuth session expired", u["error"]); self.assertIn("claude auth login", u["error"])

    def test_one_at_a_time_and_timeout(self):
        os.environ["FAKE_MODE"] = "sleep"; os.environ["STYLEGUIDE_TIMEOUT"] = "2"
        uid = json.loads(self.req("/api/update", {"note": "x"})[1])["id"]
        self.assertEqual(self.req("/api/update", {"note": "y"})[0], 409)
        u = self.wait(uid); self.assertEqual(u["status"], "failed"); self.assertIn("timed out", u["error"])

    def test_empty_note_400(self):
        self.assertEqual(self.req("/api/update", {"note": "  "})[0], 400)

    def test_restart_marks_running_failed(self):
        g = M.load(self.d / "farrell.json"); g["updates"].append({"id": "u-old", "date": "d", "note": "n", "status": "running"})
        M.save(g, self.d / "farrell.json", self.d / "history", self.d / "G.md")
        S.App(self.d, self.d / "G.md", self.d / "board.json")
        u = next(x for x in M.load(self.d / "farrell.json")["updates"] if x["id"] == "u-old")
        self.assertEqual(u["status"], "failed"); self.assertIn("restarted", u["error"])


PNG = bytes.fromhex("89504e470d0a1a0a0000000d4948445200000001000000010806000000""1f15c4890000000d49444154789c6360000002000154a24f5d0000000049454e44ae426082")


class Media(Base):
    def test_upload_serve_and_refuse(self):
        code, m = self.upload(PNG, "shot 1.png", "image/png")
        self.assertEqual(code, 200, m); self.assertEqual((m["kind"], m["name"]), ("image", "shot 1.png"))
        self.assertRegex(m["file"], r"^[0-9a-f]{16}\.png$")
        self.assertEqual(self.req("/media/" + m["file"]), (200, PNG))
        self.assertEqual(self.upload(b"MZ", "evil.exe", "application/octet-stream")[0], 400)
        self.assertEqual(self.upload(b"", "empty.png", "image/png")[0], 400)
        self.assertEqual(self.req("/media/..%2Ffarrell.json")[0], 404)
        self.assertEqual(self.req("/media/0123456789abcdef.png")[0], 404)

    def test_clip_list(self):
        cl = json.loads(self.req("/api/clips")[1])
        self.assertEqual([c["id"] for c in cl], ["cX"]); self.assertTrue(cl[0]["label"].startswith("v01"))

    def test_clip_label_falls_back_when_untitled(self):
        n = {"id": "cY", "src": "farrell-03-x/a.mp4", "title": "", "note": "Glitch page\nmore"}
        self.assertEqual(S.clip_label(n), "v03 · Glitch page")
        self.assertEqual(S.clip_label({**n, "note": ""}), "v03 · cY")

    def test_rule_with_media_saves_and_renders(self):
        _, m = self.upload(PNG, "a.png", "image/png"); g = self.guide()
        r = g["categories"][0]["rules"][0]; r["title"] = "Crush"; r["media"] = [m]
        self.assertEqual(self.req("/api/guide", g)[0], 200)
        self.assertIn("**Crush**: Contrast.", (self.d / "G.md").read_text(encoding="utf-8"))

    def test_learn_needs_media_and_known_id(self):
        self.assertEqual(self.req("/api/learn", {"id": "r-nope"})[0], 400)
        self.assertEqual(self.req("/api/learn", {"id": "r-a"})[0], 400)       # no media, no clips yet

    @unittest.skipUnless(shutil.which("ffmpeg"), "needs ffmpeg")
    def test_learn_reads_screenshots_and_video_frames(self):
        vid = self.d / "v.mp4"
        subprocess.run(["ffmpeg", "-hide_banner", "-nostdin", "-y", "-f", "lavfi", "-i", "testsrc=size=160x90:rate=10:duration=2",
                        "-pix_fmt", "yuv420p", str(vid)], capture_output=True, check=True)
        _, m1 = self.upload(PNG, "a.png", "image/png"); _, m2 = self.upload(vid.read_bytes(), "clip.mp4", "video/mp4")
        self.assertEqual(m2["kind"], "video")
        g = self.guide(); g["categories"][0]["rules"][0]["media"] = [m1, m2]; self.req("/api/guide", g)
        os.environ["FAKE_MODE"] = "learn"
        code, b = self.req("/api/learn", {"id": "r-a"}); self.assertEqual(code, 200, b)
        u = self.wait(json.loads(b)["id"]); self.assertEqual(u["status"], "done", u)
        self.assertTrue(u["note"].startswith("Learn from"), u["note"])
        g = self.guide(); r = g["categories"][0]["rules"][0]
        self.assertEqual((r["title"], r["text"]), ("Learned title", "Learned text.")); self.assertEqual(len(r["media"]), 2)
        self.assertEqual(g["learnings"][-1]["text"], "The example shows crushed blacks.")
        self.assertTrue(list((self.d / "media" / "frames").rglob("*.jpg")))
        # undo puts the rule back
        self.req("/api/undo", {"id": u["id"]}); self.assertEqual(self.guide()["categories"][0]["rules"][0]["text"], "Contrast.")


class Graphics(Base):
    def test_save_learn_and_undo(self):
        g = self.guide(); g["graphics"].append({"id": "g-a", "title": "Map card", "text": "Real map.", "use": "VO names a place.", "source": "user", "evidence": []})
        self.assertEqual(self.req("/api/guide", g)[0], 200)
        self.assertIn("| Map card | VO names a place. |", (self.d / "G.md").read_text(encoding="utf-8"))
        self.assertEqual(self.req("/api/learn", {"id": "g-a"})[0], 400)          # no examples yet
        _, m1 = self.upload(PNG, "a.png", "image/png"); _, m2 = self.upload(PNG, "b.png", "image/png")
        g = self.guide(); g["graphics"][0]["media"] = [m1, m2]; self.req("/api/guide", g)
        os.environ["FAKE_MODE"] = "learn"
        code, b = self.req("/api/learn", {"id": "g-a"}); self.assertEqual(code, 200, b)
        u = self.wait(json.loads(b)["id"]); self.assertEqual(u["status"], "done", u)
        x = self.guide()["graphics"][0]
        self.assertEqual((x["title"], x["text"], x["use"]), ("Learned title", "Learned text.", "VO names a place."))
        self.req("/api/undo", {"id": u["id"]}); self.assertEqual(self.guide()["graphics"][0]["text"], "Real map.")


if __name__ == "__main__":
    unittest.main()
