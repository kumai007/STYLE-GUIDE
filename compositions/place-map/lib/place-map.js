/* PlaceMap engine for HyperFrames: port of templates/src/case/map/PlaceMap.tsx + themes.ts (Remotion).
   Everything visible is a pure function of the time t (seconds): frame f = t * fps.
   Usage (composition file): PlaceMapPort.mount({ defaultTheme: "geo" }) after the markup exists. */
(function () {
  "use strict";

  // ---- themes.ts, values copied verbatim ----------------------------------------------------------------------------
  var FONT_VCR = "'VCR OSD Mono', monospace";
  var FONT_CARD = "'Nocturn Inter', sans-serif";
  var FONT_SERIF = "Georgia, 'Times New Roman', serif";
  var glowless = "drop-shadow(0 0 0 rgba(0,0,0,0))";
  var THEMES = {
    horror: {
      sea: "#000000", land: "#0c0c0d", landStroke: "rgba(255,255,255,0.16)",
      region: "#18181b", regionStroke: "rgba(255,255,255,0.42)",
      regionTint: "rgba(150,12,20,0.22)", regionTintStroke: "rgba(255,48,48,0.5)",
      area: "rgba(235,25,35,0.85)", areaStroke: "#ff3030", areaGlow: "drop-shadow(0 0 6px rgba(255,40,40,0.8))",
      glow: ["rgba(255,30,40,0.55)", "rgba(255,30,40,0.22)", "rgba(255,30,40,0)"],
      ring: "rgba(230,20,30,0.28)", ringStroke: "#ff3030", dot: "#ff3030", pulse: 0.06,
      name: { font: FONT_VCR, size: 84, color: "#ffffff", spacing: 8, upper: true,
              shadow: "0 0 10px rgba(255,255,255,0.45), 0 2px 12px rgba(0,0,0,0.9)" },
      sub: { color: "#9a9a9a", size: 40 },
      vignette: "radial-gradient(ellipse 78% 72% at 50% 50%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.3) 100%)"
    },
    geo: {
      sea: "#8ec9e8", land: "#f4f0e4", landStroke: "rgba(70,96,110,0.55)",
      region: "#dcebc9", regionStroke: "rgba(52,92,64,0.8)",
      regionTint: "rgba(255,120,30,0.16)", regionTintStroke: "rgba(230,90,20,0.7)",
      area: "rgba(240,80,30,0.9)", areaStroke: "#ffffff", areaGlow: "drop-shadow(0 2px 6px rgba(0,0,0,0.35))",
      glow: ["rgba(255,110,40,0.45)", "rgba(255,110,40,0.16)", "rgba(255,110,40,0)"],
      ring: "rgba(240,80,30,0.35)", ringStroke: "#f0501e", dot: "#f0501e", pulse: 0,
      name: { font: FONT_CARD, size: 72, color: "#16324a", spacing: 2, upper: true, shadow: "none",
              plate: { bg: "#ffffff", padX: 40, padY: 22, radius: 14, shadow: "0 10px 30px rgba(10,40,70,0.28)" } },
      sub: { color: "#2b5874", size: 34 },
      vignette: "radial-gradient(ellipse 85% 80% at 50% 50%, rgba(0,0,0,0) 55%, rgba(20,50,80,0.18) 100%)"
    },
    atlas: {
      sea: "#c4d2c8", land: "#efe2c4", landStroke: "rgba(96,66,36,0.6)",
      region: "#e6cf9f", regionStroke: "rgba(96,58,26,0.9)",
      regionTint: "rgba(140,30,20,0.12)", regionTintStroke: "rgba(140,30,20,0.6)",
      area: "rgba(140,30,22,0.85)", areaStroke: "#5a160e", areaGlow: glowless,
      glow: ["rgba(140,30,22,0.30)", "rgba(140,30,22,0.10)", "rgba(140,30,22,0)"],
      ring: "rgba(140,30,22,0.12)", ringStroke: "#8c1e16", dot: "#8c1e16", pulse: 0,
      name: { font: FONT_SERIF, size: 80, color: "#3a2412", spacing: 6, upper: true,
              shadow: "0 1px 0 rgba(255,245,220,0.8)" },
      sub: { color: "#6b4a2a", size: 38 },
      vignette: "radial-gradient(ellipse 80% 75% at 50% 50%, rgba(0,0,0,0) 45%, rgba(70,40,10,0.35) 100%)"
    },
    news: {
      sea: "#d3dae2", land: "#ffffff", landStroke: "rgba(60,70,80,0.35)",
      region: "#f3f4f6", regionStroke: "rgba(40,48,56,0.7)",
      regionTint: "rgba(214,40,40,0.05)", regionTintStroke: "rgba(214,40,40,0.55)",
      area: "rgba(214,40,40,0.92)", areaStroke: "#9e1414", areaGlow: glowless,
      glow: ["rgba(214,40,40,0.30)", "rgba(214,40,40,0.10)", "rgba(214,40,40,0)"],
      ring: "rgba(214,40,40,0.12)", ringStroke: "#d62828", dot: "#d62828", pulse: 0,
      name: { font: FONT_CARD, size: 64, color: "#ffffff", spacing: 3, upper: true, shadow: "none",
              plate: { bg: "#d62828", padX: 34, padY: 18, radius: 4, shadow: "0 8px 24px rgba(0,0,0,0.22)" } },
      sub: { color: "#3b4450", size: 32 },
      vignette: null
    }
  };
  function mapTheme(name) { return THEMES[name] || THEMES.horror; }   // unknown/missing -> horror, as themes.ts

  // ---- motion.ts: Easing.bezier (gre/bezier-easing, as Remotion) + tween/fade --------------------------------------
  function bezier(x1, y1, x2, y2) {
    var N = 4, MIN_SLOPE = 0.001, PREC = 1e-7, MAXIT = 10, SIZE = 11, STEP = 1 / (SIZE - 1);
    var A = function (a1, a2) { return 1 - 3 * a2 + 3 * a1; };
    var B = function (a1, a2) { return 3 * a2 - 6 * a1; };
    var C = function (a1) { return 3 * a1; };
    var calc = function (t, a1, a2) { return ((A(a1, a2) * t + B(a1, a2)) * t + C(a1)) * t; };
    var slope = function (t, a1, a2) { return 3 * A(a1, a2) * t * t + 2 * B(a1, a2) * t + C(a1); };
    var table = [];
    for (var i = 0; i < SIZE; ++i) table.push(calc(i * STEP, x1, x2));
    function newton(x, guess) {
      for (var i = 0; i < N; ++i) {
        var s = slope(guess, x1, x2);
        if (s === 0) return guess;
        guess -= (calc(guess, x1, x2) - x) / s;
      }
      return guess;
    }
    function subdivide(x, a, b) {
      var cx, ct, i = 0;
      do { ct = a + (b - a) / 2; cx = calc(ct, x1, x2) - x; if (cx > 0) b = ct; else a = ct; }
      while (Math.abs(cx) > PREC && ++i < MAXIT);
      return ct;
    }
    function getT(x) {
      var start = 0, cur = 1, last = SIZE - 1;
      for (; cur !== last && table[cur] <= x; ++cur) start += STEP;
      --cur;
      var dist = (x - table[cur]) / (table[cur + 1] - table[cur]);
      var guess = start + dist * STEP;
      var s = slope(guess, x1, x2);
      if (s >= MIN_SLOPE) return newton(x, guess);
      if (s === 0) return guess;
      return subdivide(x, start, start + STEP);
    }
    return function (x) {
      if (x1 === y1 && x2 === y2) return x;
      if (x === 0) return 0;
      if (x === 1) return 1;
      return calc(getT(x), y1, y2);
    };
  }
  var ease = {
    enter: bezier(0.16, 1, 0.3, 1),
    ui: bezier(0.25, 0.46, 0.45, 0.94),
    sine: bezier(0.37, 0, 0.63, 1)
  };
  function tween(f, a, b, easing) {          // one segment [a0,a1] -> [b0,b1], eased, clamped
    var u = a[1] === a[0] ? (f >= a[1] ? 1 : 0) : (f - a[0]) / (a[1] - a[0]);
    u = Math.min(1, Math.max(0, u));
    return b[0] + (b[1] - b[0]) * easing(u);
  }
  function fade(f, frames, fin) {             // fadeOut = fadeIn
    return Math.min(fin > 0 ? tween(f, [0, fin], [0, 1], ease.ui) : 1,
                    fin > 0 ? tween(f, [frames - fin, frames], [1, 0], ease.ui) : 1);
  }

  // ---- PlaceMap.tsx ------------------------------------------------------------------------------------------------
  var RING = 46;
  var EMPTY = { w: 1920, h: 1080, land: [], region: "", area: "", spot: [960, 540], v0: [0, 0, 1920, 1080], v1: [0, 0, 1920, 1080] };

  function mount(opts) {
    var V = (window.__hyperframes && window.__hyperframes.getVariables && window.__hyperframes.getVariables()) || {};
    // hyperframes@0.8.210 cannot read --variables-file / --variables <file> (its JSON reader is passed undefined io
    // functions) and a map is ~400 KB, far over the Windows command-line limit. Workaround: variable mapSrc names a
    // props file inside the project (e.g. props/place-map/meteora-geo.json) and it is read here with one synchronous
    // local request. Its keys are the base; a variable that differs from its declared default wins over it.
    if (V.mapSrc) {
      var doc = null;
      try {
        var xhr = new XMLHttpRequest(); xhr.open("GET", String(V.mapSrc), false); xhr.send(null);
        doc = JSON.parse(xhr.responseText);
      } catch (err) { throw new Error("place-map: cannot read mapSrc " + V.mapSrc + ": " + err); }
      var defs = opts.defaults || {};
      var merged = Object.assign({}, doc);
      Object.keys(V).forEach(function (k) {
        if (k !== "mapSrc" && (!(k in defs) || V[k] !== defs[k] || !(k in doc))) merged[k] = V[k];
      });
      V = merged;
    }
    var fps = Number(V.fps) || 30;
    var frames = Number(V.frames != null ? V.frames : V.durationInFrames) || 180;   // old key accepted
    var themeName = V.theme || (V.data && V.data.theme) || opts.defaultTheme;
    var t = mapTheme(themeName);
    var m = V.map && typeof V.map === "object" ? V.map : EMPTY;
    var text = V.text != null ? String(V.text) : "";
    var sub = V.sub != null ? String(V.sub) : "";

    var $ = function (id) { return document.getElementById(id); };
    var NS = "http://www.w3.org/2000/svg";
    var fadeEl = $("pm-fade"), svg = $("pm-svg"), labelEl = $("pm-label"), vigEl = $("pm-vig");
    var land = m.land.join("");

    // theme -> paint
    fadeEl.style.backgroundColor = t.sea;
    var set = function (el, o) { for (var k in o) el.setAttribute(k, o[k]); return el; };
    var mk = function (tag, a) { return set(document.createElementNS(NS, tag), a); };
    var defs = mk("defs", {});
    var cp = mk("clipPath", { id: "pm-land" });
    cp.appendChild(mk("path", { d: land, "clip-rule": "evenodd" }));
    var rg = mk("radialGradient", { id: "pm-glow" });
    ["0%", "60%", "100%"].forEach(function (o, i) { rg.appendChild(mk("stop", { offset: o, "stop-color": t.glow[i] })); });
    defs.appendChild(cp); defs.appendChild(rg); svg.appendChild(defs);
    var nse = { "vector-effect": "non-scaling-stroke", "stroke-linejoin": "round" };
    svg.appendChild(mk("path", Object.assign({ d: land, fill: t.land, "fill-rule": "evenodd", stroke: t.landStroke, "stroke-width": 1 }, nse)));
    var tint = null;
    if (m.region) {
      svg.appendChild(mk("path", Object.assign({ d: m.region, "clip-path": "url(#pm-land)", fill: t.region, "fill-rule": "evenodd", stroke: t.regionStroke, "stroke-width": 1.6 }, nse)));
      tint = mk("path", Object.assign({ d: m.region, "clip-path": "url(#pm-land)", fill: t.regionTint, "fill-rule": "evenodd", stroke: t.regionTintStroke, "stroke-width": 1.4 }, nse));
      svg.appendChild(tint);
    }
    var g = mk("g", {});
    if (m.area) {
      var ar = mk("path", Object.assign({ d: m.area, fill: t.area, "fill-rule": "evenodd", stroke: t.areaStroke, "stroke-width": 3 }, nse));
      ar.style.filter = t.areaGlow; g.appendChild(ar);
    }
    var glow = mk("circle", { cx: m.spot[0], cy: m.spot[1], r: RING, fill: "url(#pm-glow)" });
    var ring = mk("circle", Object.assign({ cx: m.spot[0], cy: m.spot[1], r: RING * 0.62, fill: t.ring, stroke: t.ringStroke, "stroke-width": 2.5 },
                                          { "vector-effect": "non-scaling-stroke" }));
    ring.style.filter = "drop-shadow(0 0 8px " + (t.pulse ? "rgba(255,40,40,0.9)" : "rgba(0,0,0,0.25)") + ")";
    g.appendChild(glow); g.appendChild(ring);
    var dot = null;
    if (!m.area) { dot = mk("circle", { cx: m.spot[0], cy: m.spot[1], r: 7, fill: t.dot }); g.appendChild(dot); }
    svg.appendChild(g);

    // name + sub
    var nm = $("pm-name"), sb = $("pm-sub"), n = t.name;
    nm.textContent = n.upper ? text.toUpperCase() : text;
    nm.style.cssText = "font-family:" + n.font + ";font-size:" + n.size + "px;line-height:1;color:" + n.color +
      ";letter-spacing:" + n.spacing + "px;text-shadow:" + n.shadow + ";white-space:nowrap;" +
      (n.plate ? "background:" + n.plate.bg + ";padding:" + n.plate.padY + "px " + n.plate.padX + "px;border-radius:" +
        n.plate.radius + "px;box-shadow:" + n.plate.shadow + ";" : "");
    if (sub) {
      sb.textContent = n.upper ? sub.toUpperCase() : sub;
      sb.style.cssText = "margin-top:22px;font-family:" + n.font + ";font-size:" + t.sub.size + "px;line-height:1;color:" + t.sub.color +
        ";letter-spacing:" + Math.max(2, n.spacing - 2) + "px;white-space:nowrap;text-shadow:" +
        (n.plate ? "none" : "0 2px 10px rgba(0,0,0,0.9)") + ";";
    } else { sb.parentNode.removeChild(sb); }
    if (t.vignette) vigEl.style.background = t.vignette; else vigEl.style.display = "none";

    // motion: pure function of t
    function renderAt(sec) {
      var f = sec * fps;
      var o = fade(f, frames, 0.4 * fps);
      var hi = tween(f, [0.5 * fps, 1.3 * fps], [0, 1], ease.ui);
      var name = tween(f, [0.8 * fps, 1.6 * fps], [0, 1], ease.enter);
      var p = tween(f, [0, Math.max(frames - 1, 1)], [0, 1], ease.sine);
      var w0 = m.v0[2], w1 = m.v1[2];
      var w = w0 * Math.pow(w1 / w0, p);
      var q = w0 === w1 ? p : (w0 - w) / (w0 - w1);
      var cx = m.v0[0] + m.v0[2] / 2 + (m.v1[0] + m.v1[2] / 2 - m.v0[0] - m.v0[2] / 2) * q;
      var cy = m.v0[1] + m.v0[3] / 2 + (m.v1[1] + m.v1[3] / 2 - m.v0[1] - m.v0[3] / 2) * q;
      var h = w * m.h / m.w, px = w / 1920;
      svg.setAttribute("viewBox", (cx - w / 2) + " " + (cy - h / 2) + " " + w + " " + h);
      fadeEl.style.opacity = o;
      labelEl.style.opacity = name;
      if (tint) tint.setAttribute("opacity", hi);
      g.setAttribute("opacity", hi);
      glow.setAttribute("r", RING * px * (1 + t.pulse * Math.sin(f / fps * Math.PI * 1.6)));
      ring.setAttribute("r", RING * 0.62 * px);
      if (dot) dot.setAttribute("r", 7 * px);
    }

    var tl = gsap.timeline({ paused: true });
    var proxy = { s: 0 };
    tl.fromTo(proxy, { s: 0 }, { s: frames / fps, duration: frames / fps, ease: "none", onUpdate: function () { renderAt(proxy.s); } }, 0);
    window.addEventListener("hf-seek", function (e) { if (e && e.detail && typeof e.detail.time === "number") renderAt(e.detail.time); });
    renderAt(0);
    return tl;
  }

  window.PlaceMapPort = { mount: mount, THEMES: THEMES, ease: ease };
})();
