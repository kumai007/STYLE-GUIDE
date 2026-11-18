"""Build motion-lab.html from src.html: embed the VCR OSD Mono font and the assets/*.jpg stills (base64)."""
import base64, pathlib
here = pathlib.Path(__file__).parent
font = pathlib.Path(r"C:\Users\ayush\Videos\CLAUDE\PROJECT\graphics\hyperframes\assets\case-cards\fonts\vcr-osd-mono.ttf")
src = (here / "src.html").read_text(encoding="utf-8")
assert src.count("__VCR__") == 1
assert src.count("__IMG__") == 1
imgs = "".join(
    f"--im-{p.stem}:url(data:image/jpeg;base64,{base64.b64encode(p.read_bytes()).decode()});"
    for p in sorted((here / "assets").glob("*.jpg"))
)
out = src.replace("__VCR__", base64.b64encode(font.read_bytes()).decode()).replace("__IMG__", imgs)
(here / "motion-lab.html").write_text(out, encoding="utf-8")
print("motion-lab.html", len(out.encode()), "bytes")
