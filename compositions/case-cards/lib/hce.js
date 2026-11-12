/* HCE evidence-file pieces (Remotion templates/src/case/hce/Base.tsx), as HTML-string builders + per-frame updaters.
   Needs cc.js. Each builder returns { html, set(...) }; set() is called from render(f) after the html is in the DOM. */
(function () {
  var C = { black: "#000000", charcoal: "#0E1013", ink: "#15191E", slate: "#5D7085", steel: "#8E979F", paper: "#DCD7CB",
            amber: "#C1904E", red: "#8F3E38", signal: "#B5483D" };
  var M = { fadeIn: 0.7, reveal: 1.3, wipe: 1.4, draw: 1.8, stagger: 0.6, pushPctPerSec: 0.6, lead: 0.2 };
  var T = { grain: 0.07, contour: 0.08, vignette: 0.45, halftone: 0.16, paper: 0.32 };
  var GRADE = { doc: "saturate(0.55) brightness(0.62) contrast(1.08)", evidence: "saturate(0.72) brightness(0.86) contrast(1.05)" };
  var FONT = { condensed: "font-family:'HCE Roboto',sans-serif;font-stretch:75%;font-variation-settings:'wdth' 75;",
               body: "font-family:'HCE Roboto',sans-serif;font-stretch:100%;font-variation-settings:'wdth' 100;",
               mono: "font-family:'HCE Mono',monospace;font-variant-numeric:tabular-nums;" };
  (function () { // fonts (paths resolve against the composition document, i.e. the hyperframes project root)
    var s = document.createElement("style");
    s.textContent = "@font-face{font-family:'HCE Roboto';src:url('assets/case-cards/fonts/roboto-variable.ttf');font-weight:100 900;font-stretch:75% 100%}" +
      "@font-face{font-family:'HCE Mono';src:url('assets/case-cards/fonts/jetbrains-mono-400.ttf');font-weight:400}";
    document.head.appendChild(s);
  })();
  var uid = 0, $ = CC.$;
  var esc = function (t) { return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); };
  var ABS = "position:absolute;left:0;top:0;right:0;bottom:0;";
  var AF = ABS + "display:flex;flex-direction:column;";

  function useCard(f, fps, frames) {
    var o = CC.fade(f, frames, Math.max(Math.min(M.fadeIn * fps, frames / 3), 1e-3));
    return { o: frames <= 1 ? 1 : o, p: CC.tween(f, [0, Math.max(frames - 1, 1)], [0, 1], CC.ease.sine) };
  }
  function grain(amount) { // 6 seeds (k+11) on twos; one filter per seed, the rect switches between them
    var id = "hg" + (uid++), d = "";
    if (amount === undefined) amount = T.grain;
    for (var k = 0; k < 6; k++) d += '<filter id="' + id + "_" + k + '"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="' + (k + 11) + '" stitchTiles="stitch"/></filter>';
    return { html: '<svg width="1920" height="1080" style="position:absolute;inset:0;opacity:' + amount + ';mix-blend-mode:overlay">' + d +
                   '<rect id="' + id + '" width="100%" height="100%" filter="url(#' + id + '_0)"/></svg>',
             set: function (f) { $(id).setAttribute("filter", "url(#" + id + "_" + (Math.floor(f / 2) % 6) + ")"); } };
  }
  function contourPath(cx, cy, r, k) {
    var pts = [];
    for (var i = 0; i < 48; i++) {
      var a = (i / 48) * Math.PI * 2, w = 1 + 0.12 * Math.sin(3 * a + k) + 0.07 * Math.sin(5 * a + 2 * k) + 0.04 * Math.cos(7 * a + k);
      pts.push((cx + Math.cos(a) * r * 1.5 * w).toFixed(1) + " " + (cy + Math.sin(a) * r * w).toFixed(1));
    }
    return "M " + pts.join(" L ") + " Z";
  }
  function contours(amount) {
    var s = "";
    [[420, 300, 0.4], [1500, 760, 1.7], [1180, 210, 2.9]].forEach(function (c) {
      for (var i = 0; i < 9; i++) s += '<path d="' + contourPath(c[0], c[1], 40 + i * 46, c[2] + i * 0.35) + '" fill="none" stroke="' + C.steel + '" stroke-width="1.2"/>';
    });
    return '<svg width="1920" height="1080" style="position:absolute;inset:0;opacity:' + (amount === undefined ? T.contour : amount) + '">' + s + "</svg>";
  }
  function vignette(amount) {
    return '<div style="' + AF + "background:radial-gradient(ellipse 80% 75% at 50% 50%, rgba(0,0,0,0) 45%, rgba(0,0,0," + (amount === undefined ? T.vignette : amount) + ') 100%)"></div>';
  }
  function halftone(amount, size) {
    if (amount === undefined) amount = T.halftone; if (size === undefined) size = 6;
    var id = "hdot" + size + "_" + (uid++);
    return '<svg width="100%" height="100%" style="position:absolute;inset:0;opacity:' + amount + ';mix-blend-mode:multiply"><defs><pattern id="' + id +
      '" width="' + size + '" height="' + size + '" patternUnits="userSpaceOnUse" patternTransform="rotate(15)"><circle cx="' + size / 2 + '" cy="' + size / 2 +
      '" r="' + size * 0.36 + '" fill="#000"/></pattern></defs><rect width="100%" height="100%" fill="url(#' + id + ')"/></svg>';
  }
  function paper(amount) {
    var id = "hp" + (uid++);
    return '<svg width="100%" height="100%" style="position:absolute;inset:0;opacity:' + (amount === undefined ? T.paper : amount) + ';mix-blend-mode:soft-light">' +
      '<filter id="' + id + 'a"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" seed="5" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>' +
      '<filter id="' + id + 'b"><feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="2" seed="9"/><feColorMatrix type="saturate" values="0"/></filter>' +
      '<rect width="100%" height="100%" filter="url(#' + id + 'a)"/><rect width="100%" height="100%" filter="url(#' + id + 'b)" opacity="0.6"/></svg>';
  }
  function cropMarks(inset, color) {
    var id = "hcm" + (uid++), L = 30, g = 10, s = "";
    if (inset === undefined) inset = 54; color = color || C.steel;
    [[inset, inset, 1, 1], [1920 - inset, inset, -1, 1], [inset, 1080 - inset, 1, -1], [1920 - inset, 1080 - inset, -1, -1]].forEach(function (c) {
      var x = c[0], y = c[1], dx = c[2], dy = c[3];
      s += '<path d="M ' + (x - dx * g) + " " + y + " L " + (x + dx * L) + " " + y + " M " + x + " " + (y - dy * g) + " L " + x + " " + (y + dy * L) + '" stroke="' + color + '" stroke-width="1.2" fill="none"/>';
    });
    return { html: '<svg id="' + id + '" width="1920" height="1080" style="position:absolute;inset:0;opacity:0.7">' + s + "</svg>",
             set: function (o) { $(id).style.opacity = String(0.7 * o); } };
  }
  // the case's frame under a beat (Plate): charcoal, graded cover image pushed round origin (or contours), dots, veil, floor, paper, vignette, grain
  function plate(image, o) {
    o = o || {};
    var id = "hpl" + (uid++), dim = o.dim === undefined ? 0.7 : o.dim, flat = o.flat === undefined ? 0.15 : o.flat, blur = o.blur || 0;
    var origin = o.origin || "50% 50%", grade = o.grade || GRADE.doc, g = grain();
    var html = '<div style="' + AF + "background-color:" + C.charcoal + '">' +
      (image ? '<img id="' + id + '" src="' + esc(image) + '" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transform-origin:' + origin +
               ";filter:" + grade + (blur ? " blur(" + blur + "px)" : "") + '"/>' + halftone() : contours()) +
      '<div style="' + AF + "background:" + C.charcoal + ";opacity:" + flat + '"></div>' +
      '<div style="' + AF + "background:radial-gradient(ellipse 125% 90% at 0% 100%, rgba(14,16,19," + dim + ") 0%, rgba(14,16,19," + dim * 0.5 + ') 50%, rgba(14,16,19,0) 100%)"></div>' +
      paper() + vignette() + g.html + "</div>";
    return { html: html, set: function (f, p, fps, frames) {
      if (image) $(id).style.transform = "scale(" + ((1.02 + blur * 0.004) * (1 + (M.pushPctPerSec / 100) * (frames / fps) * p)).toFixed(5) + ")";
      g.set(f);
    } };
  }
  // an evidence print; q 0..1 (already ease.enter)
  function print(src, w, h, o) {
    o = o || {};
    var id = "hpr" + (uid++), B = Math.round(Math.max(10, w * 0.035)), cap = o.caption, pos = o.pos || "50% 40%", zoom = o.zoom || 1, rot = o.rot || 0;
    var html = '<div id="' + id + '" style="position:relative;width:' + (w + 2 * B) + "px;box-sizing:border-box;padding:" + B + "px " + B + "px " + (cap ? B * 0.7 : B) +
      "px;background:" + C.paper + ';box-shadow:0 34px 70px rgba(0,0,0,0.7), 0 3px 8px rgba(0,0,0,0.5)">' +
      '<div style="position:relative;width:' + w + "px;height:" + h + "px;overflow:hidden;background:" + C.ink + '">' +
      '<img src="' + esc(src) + '" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:' + pos + ";transform:scale(" + zoom.toFixed(5) +
      ");transform-origin:" + pos + ';filter:saturate(0.5) contrast(1.12) brightness(0.88)"/>' + halftone(0.2, 4) + vignette(0.3) + "</div>" +
      (cap ? '<div style="' + FONT.mono + "font-size:" + Math.max(12, Math.min(22, w / 14, w / (0.72 * cap.length))) + "px;letter-spacing:0.1em;color:" + C.ink + ";margin-top:" + B * 0.7 +
             'px;white-space:nowrap;overflow:hidden">' + esc(cap.toUpperCase()) + "</div>" : "") + paper(0.55) + "</div>";
    return { html: html, B: B, set: function (q) {
      var e = $(id);
      e.style.opacity = String(Math.min(1, q * 1.6));
      e.style.transform = "translateY(" + ((1 - q) * 24).toFixed(2) + "px) rotate(" + (rot + (1 - q) * 2.5).toFixed(3) + "deg) scale(" + (1.03 - 0.03 * q).toFixed(4) + ")";
    } };
  }
  function title(text, size, o) {
    o = o || {};
    return '<div style="' + FONT.condensed + "font-weight:" + (o.weight || 600) + ";font-size:" + (size || 64) + "px;line-height:1;letter-spacing:" + (o.spacing === undefined ? 0.06 : o.spacing) +
      "em;color:" + (o.color || C.paper) + ';white-space:nowrap">' + esc(String(text).toUpperCase()) + "</div>";
  }
  // Rise: wrapper (outerStyle) > inner settling with p (already ease.measured)
  function rise(inner, outerStyle) {
    var id = "hr" + (uid++);
    return { html: '<div style="padding-bottom:0.08em;' + (outerStyle || "") + '"><div id="' + id + '">' + inner + "</div></div>",
             set: function (p) { var e = $(id).style; e.opacity = String(Math.min(1, p * 1.25)); e.transform = "translateY(" + ((1 - p) * 14).toFixed(2) + "px)";
                                  e.filter = p < 0.995 ? "blur(" + ((1 - p) * 6).toFixed(2) + "px)" : "none"; } };
  }
  function heading(text, size, mark) {
    return rise('<div style="display:flex;align-items:center;gap:16px"><div style="width:12px;height:12px;background:' + (mark || C.amber) + ';flex:none"></div>' + title(text, size || 60) + "</div>");
  }
  CC.hce = { C: C, M: M, T: T, GRADE: GRADE, FONT: FONT, AF: AF, esc: esc, useCard: useCard, grain: grain, contours: contours, vignette: vignette, halftone: halftone,
             paper: paper, cropMarks: cropMarks, plate: plate, print: print, title: title, rise: rise, heading: heading };
})();
