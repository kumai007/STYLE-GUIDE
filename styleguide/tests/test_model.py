import sys, tempfile, unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import model as M


def guide():
    g = M.empty_guide()
    g["categories"][0]["rules"].append({"id": "r-a", "text": "Contrast high.", "source": "user", "evidence": []})
    g["categories"][1]["rules"].append({"id": "r-b", "text": "Dread, not jump scares.", "source": "refs",
                                        "evidence": [{"clip": "c1", "prod": "p", "src": "s", "sf_in": 1, "sf_out": 9, "label": "v1 00:00"}]})
    g["rulebook"].append({"id": "b-a", "text": "Font is VCR.", "since": "2026-11-08", "from": "user"})
    g["learnings"].append({"id": "l-a", "date": "2026-11-08", "text": "Shorter title holds.", "status": "open", "target": ""})
    return g


class Validate(unittest.TestCase):
    def test_ok(self):
        self.assertEqual(M.validate(guide()), [])

    def test_categories_fixed(self):
        g = guide(); g["categories"].pop()
        self.assertTrue(M.validate(g))
        g = guide(); g["categories"][0], g["categories"][1] = g["categories"][1], g["categories"][0]
        self.assertTrue(M.validate(g))

    def test_duplicate_id(self):
        g = guide(); g["rulebook"][0]["id"] = "r-a"
        self.assertTrue(any("duplicate" in e for e in M.validate(g)))

    def test_empty_text_bad_source_bad_frames(self):
        for f in (lambda g: g["categories"][0]["rules"][0].update(text="  "),
                  lambda g: g["categories"][0]["rules"][0].update(source="me"),
                  lambda g: g["categories"][1]["rules"][0]["evidence"][0].update(sf_in=10)):
            g = guide(); f(g); self.assertTrue(M.validate(g))


class TitleMedia(unittest.TestCase):
    def test_title_and_media_valid_and_rendered(self):
        g = guide(); r = g["categories"][0]["rules"][0]
        r["title"] = "Crushed blacks"; r["media"] = [{"file": "0123456789abcdef.png", "kind": "image", "name": "shot 1.png"},
                                                     {"file": "fedcba9876543210.mp4", "kind": "video", "name": "ex.mp4"}]
        b = g["rulebook"][0]; b["title"] = "Font"; b["media"] = [{"file": "aaaaaaaaaaaaaaaa.jpg", "kind": "image", "name": "f.jpg"}]
        b["evidence"] = [{"clip": "c1", "sf_in": 1, "sf_out": 2, "label": "v1"}]
        self.assertEqual(M.validate(g), [])
        md = M.render_md(g)
        self.assertIn("- **Crushed blacks**: Contrast high.", md)
        self.assertIn("[shot 1.png](media/0123456789abcdef.png)", md)
        self.assertIn("1. **Font**: Font is VCR.", md); self.assertIn("media/aaaaaaaaaaaaaaaa.jpg", md)

    def test_bad_media_rejected(self):
        for m in ({"file": "../x.png", "kind": "image", "name": "x"}, {"file": "0123456789abcdef.exe", "kind": "image", "name": "x"},
                  {"file": "0123456789abcdef.png", "kind": "video", "name": "x"}, "nope"):
            g = guide(); g["categories"][0]["rules"][0]["media"] = [m]
            self.assertTrue(M.validate(g), m)
        g = guide(); g["categories"][0]["rules"][0]["title"] = 5
        self.assertTrue(M.validate(g))
        g = guide(); g["rulebook"][0]["evidence"] = [{"clip": "c1", "sf_in": 5, "sf_out": 1}]
        self.assertTrue(M.validate(g))


class TitleOps(unittest.TestCase):
    def test_edit_ops_set_title(self):
        g, ch = M.apply_ops(guide(), [{"op": "edit_rule", "id": "r-a", "title": "Crush", "text": "Contrast high."},
                                      {"op": "edit_rulebook", "id": "b-a", "title": "Font", "text": "Font is VCR."},
                                      {"op": "add_rule", "cat": "lighting", "title": "Shadow", "text": "Half shadow."}])
        self.assertEqual(g["categories"][0]["rules"][0]["title"], "Crush"); self.assertEqual(g["rulebook"][0]["title"], "Font")
        self.assertEqual(M.cat(g, "lighting")["rules"][-1]["title"], "Shadow"); self.assertEqual(len(ch), 3)


class Ops(unittest.TestCase):
    def test_each_op(self):
        g, ch = M.apply_ops(guide(), [
            {"op": "add_rule", "cat": "lighting", "text": "Low key."},
            {"op": "edit_rule", "id": "r-a", "text": "Very high contrast."},
            {"op": "delete_rule", "id": "r-b"},
            {"op": "set_summary", "cat": "typography", "text": "VCR everywhere."},
            {"op": "add_rulebook", "text": "Only four transitions."},
            {"op": "edit_rulebook", "id": "b-a", "text": "Font is VCR OSD Mono."},
            {"op": "add_evidence", "id": "r-a", "clip": "c2", "prod": "p", "src": "s", "sf_in": 5, "sf_out": 6, "label": "x"},
        ])
        self.assertEqual(M.validate(g), [])
        light = M.cat(g, "lighting")["rules"]
        self.assertEqual(light[0]["text"], "Low key."); self.assertEqual(light[0]["source"], "refs")
        self.assertEqual(M.find_rule(g, "r-a")[1]["text"], "Very high contrast.")
        self.assertIsNone(M.find_rule(g, "r-b"))
        self.assertEqual(M.cat(g, "typography")["summary"], "VCR everywhere.")
        self.assertEqual(len(g["rulebook"]), 2)
        self.assertTrue(any("rule book" in c.lower() for c in ch))
        g, _ = M.apply_ops(g, [{"op": "remove_evidence", "id": "r-a", "clip": "c2"}, {"op": "delete_rulebook", "id": "b-a"}])
        self.assertEqual(M.find_rule(g, "r-a")[1]["evidence"], []); self.assertEqual(len(g["rulebook"]), 1)

    def test_original_untouched_and_errors(self):
        g0 = guide()
        for bad in ({"op": "nope"}, {"op": "edit_rule", "id": "zz", "text": "x"}, {"op": "add_rule", "cat": "nocat", "text": "x"},
                    {"op": "delete_rulebook", "id": "zz"}, {"op": "add_rule", "cat": "lighting", "text": ""}):
            with self.assertRaises(M.OpError): M.apply_ops(g0, [bad])
        self.assertEqual(g0, guide())


class Promote(unittest.TestCase):
    def test_to_guide_and_rulebook(self):
        g = M.promote(guide(), "l-a", "guide", "editing-rhythm")
        r = M.cat(g, "editing-rhythm")["rules"][-1]
        self.assertEqual(r["text"], "Shorter title holds."); self.assertEqual(g["learnings"][0]["status"], "guide")
        self.assertEqual(g["learnings"][0]["target"], r["id"])
        g = guide(); g = M.promote(g, "l-a", "rulebook")
        self.assertEqual(g["rulebook"][-1]["from"], "learning:l-a"); self.assertEqual(g["learnings"][0]["status"], "rulebook")
        with self.assertRaises(M.OpError): M.promote(g, "l-a", "rulebook")      # already promoted


class Render(unittest.TestCase):
    def test_order_and_markers(self):
        md = M.render_md(guide())
        self.assertTrue(md.startswith("<!-- GENERATED"))
        i_rb, i_cat, i_learn = md.index("## Rule book"), md.index("## 1. Overall aesthetic"), md.index("## Open learnings")
        self.assertLess(i_rb, i_cat); self.assertLess(i_cat, i_learn)
        self.assertIn("Contrast high. *(set by you)*", md)
        self.assertIn("v1 00:00", md)
        self.assertIn("## 12. Storytelling", md)


class Save(unittest.TestCase):
    def test_keeps_20_backups_and_writes_md(self):
        with tempfile.TemporaryDirectory() as d:
            d = Path(d); p, h, md = d / "g.json", d / "hist", d / "G.md"
            g = guide(); M.save(g, p, h, md)
            for i in range(25):
                g = M.load(p); g["categories"][0]["summary"] = f"s{i}"; M.save(g, p, h, md)
            self.assertEqual(len(list(h.glob("rev*.json"))), 20)
            self.assertEqual(M.load(p)["rev"], 26)
            self.assertIn("s24", md.read_text(encoding="utf-8"))

    def test_prune_keeps_update_snapshots(self):
        with tempfile.TemporaryDirectory() as d:
            d = Path(d); p, h, md = d / "g.json", d / "hist", d / "G.md"
            M.save(guide(), p, h, md); (h / "before-u-1.json").write_text("{}", encoding="utf-8")
            for i in range(25): M.save(M.load(p), p, h, md)
            self.assertTrue((h / "before-u-1.json").exists())

    def test_invalid_not_written(self):
        with tempfile.TemporaryDirectory() as d:
            d = Path(d); p = d / "g.json"; M.save(guide(), p, d / "h", d / "G.md")
            g = M.load(p); g["categories"].pop()
            with self.assertRaises(M.OpError): M.save(g, p, d / "h", d / "G.md")
            self.assertEqual(len(M.load(p)["categories"]), 12)


class Graphics(unittest.TestCase):
    def add(self, g, **kw):
        op = {"op": "add_graphic", "title": "Map card", "text": "Real map, slow push.", "use": "VO names a place.", **kw}
        return M.apply_ops(g, [op])

    def test_add_edit_delete_and_validate(self):
        g, ch = self.add(guide(), kind="map", avoid="Place does not matter.")
        x = g["graphics"][-1]; self.assertTrue(x["id"].startswith("g-")); self.assertEqual((x["kind"], x["source"]), ("map", "refs"))
        self.assertEqual(M.validate(g), []); self.assertIn("Motion graphics", ch[0])
        g, _ = M.apply_ops(g, [{"op": "edit_graphic", "id": x["id"], "use": "VO names a route.", "avoid": ""}])
        y = M.find_graphic(g, x["id"]); self.assertEqual(y["use"], "VO names a route."); self.assertNotIn("avoid", y)
        g, _ = M.apply_ops(g, [{"op": "add_evidence", "id": x["id"], "clip": "c9", "sf_in": 1, "sf_out": 5, "label": "v1"}])
        self.assertEqual(M.find_graphic(g, x["id"])["evidence"][-1]["clip"], "c9")
        g, _ = M.apply_ops(g, [{"op": "delete_graphic", "id": x["id"]}]); self.assertEqual(g["graphics"], [])

    def test_bad_ops_and_bad_data(self):
        for op in ({"op": "add_graphic", "title": "T", "text": "x"},                      # no use
                   {"op": "add_graphic", "title": " ", "text": "x", "use": "u"},
                   {"op": "add_graphic", "title": "T", "text": "x", "use": 5},
                   {"op": "edit_graphic", "id": "g-nope", "text": "x"}):
            with self.assertRaises(M.OpError): M.apply_ops(guide(), [op])
        g, _ = self.add(guide()); g["graphics"][0]["source"] = "robot"; g["graphics"][0]["use"] = ["x"]
        self.assertEqual(len(M.validate(g)), 2)

    def test_old_guide_without_graphics_still_valid_and_renders(self):
        g = guide(); g.pop("graphics", None); g.pop("graphics_summary", None)
        self.assertEqual(M.validate(g), []); self.assertIn("(no motion graphics yet)", M.render_md(g))

    def test_render_table_before_learnings(self):
        g, _ = self.add(guide(), avoid="Pipe | in text.")
        g, _ = M.apply_ops(g, [{"op": "set_graphics_summary", "text": "Only real artifacts."}])
        md = M.render_md(g)
        self.assertLess(md.index("## Motion graphics"), md.index("Open learnings"))
        self.assertIn("Only real artifacts.", md); self.assertIn("| Map card | VO names a place. | Pipe / in text. |", md)

    def test_why_situation_fit_set_clear_and_group(self):
        g, _ = self.add(guide(), title="Old card", situation=M.SITUATIONS[2], fit="no: bright look")
        g, _ = M.apply_ops(g, [{"op": "add_graphic", "title": "Page", "text": "t", "use": "u", "situation": M.SITUATIONS[0], "fit": "adapt: font"},
                               {"op": "add_graphic", "title": "Good map", "text": "t", "use": "u", "why": "Shows where.",
                                "situation": M.SITUATIONS[2], "fit": "yes"}])
        self.assertEqual(M.validate(g), [])
        self.assertEqual([x["title"] for x in M.sorted_graphics(g["graphics"])], ["Page", "Good map", "Old card"])
        md = M.render_md(g)
        self.assertIn("| Narration does | Graphic | Use it when | Why | Not when | Fits Farrell |", md)
        self.assertIn(f"| {M.SITUATIONS[2]} | Good map | u | Shows where. | - | yes |", md)
        self.assertIn("|  | Old card |", md)                       # same situation: heading cell left empty
        x = g["graphics"][-1]
        g, _ = M.apply_ops(g, [{"op": "edit_graphic", "id": x["id"], "why": "", "fit": "", "situation": ""}])
        y = M.find_graphic(g, x["id"])
        for k in ("why", "fit", "situation"): self.assertNotIn(k, y)
        with self.assertRaises(M.OpError): M.apply_ops(g, [{"op": "edit_graphic", "id": x["id"], "why": 3}])

    def test_page_lists_same_situations(self):
        js = (Path(__file__).resolve().parents[1] / "app.js").read_text(encoding="utf-8")
        for s in M.SITUATIONS: self.assertIn(f'"{s}"', js)


if __name__ == "__main__":
    unittest.main()
