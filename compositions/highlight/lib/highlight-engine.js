/* Highlight engine: port of templates/src/presets/highlights
 * (contexts, resolve, framing, motion, Highlights, Plate, HighlightBar).
 * Pure functions of the frame number. No Math.random, no clocks.
 * Loaded by Highlight.html as <script src="lib/highlight-engine.js">.
 */
(function (global) {
  "use strict";
  var FPS = 30, HOLD_SECONDS = 1.5;

  // ---- contexts.ts / schema.ts looks ------------------------------------------------
  var COMMENT = { highlightColor: "#a30c1d", wipeBaseSeconds: 1.15, wipePxPerSecond: 460, backgroundColor: "#0f0f0f" };
  var NEWS = { highlightColor: "#efc416", wipeBaseSeconds: 0.4, wipePxPerSecond: 1000, focusInSeconds: 0.35, focusInBlurPx: 22, backgroundColor: "#eef1f5" };
  var CONTEXTS = {
    comment: { marker: { dark: COMMENT.highlightColor, light: "#ff9b9b" }, wipeBaseSeconds: COMMENT.wipeBaseSeconds, wipePxPerSecond: COMMENT.wipePxPerSecond, focusInSeconds: 0, focusInBlurPx: 0, motionIntensity: 1 },
    website: { marker: { dark: "#8a6a00", light: NEWS.highlightColor }, wipeBaseSeconds: NEWS.wipeBaseSeconds, wipePxPerSecond: NEWS.wipePxPerSecond, focusInSeconds: NEWS.focusInSeconds, focusInBlurPx: NEWS.focusInBlurPx, motionIntensity: 0.6 },
    document: { marker: { dark: "#8a6a00", light: NEWS.highlightColor }, wipeBaseSeconds: 0.6, wipePxPerSecond: 800, focusInSeconds: 0.35, focusInBlurPx: 14, motionIntensity: 0.45 }
  };
  var PAGE_BACKGROUND = { dark: COMMENT.backgroundColor, light: NEWS.backgroundColor };
  var CAMERA = {
    motionPreset: null, motionIntensity: 1, perspective: 2000,
    rotateX: 0, rotateY: -6, rotateZ: -1.35, startScale: 1, endScale: 1.09, panX: 0, panY: 0,
    focusX: null, focusY: null, focusRadiusX: 62, focusRadiusY: 48, focusSoftness: 45,
    blurPx: 0, glow: 0, barRadius: 0, bloom: 0, vignette: 0, lens: 0, grain: 0,
    cropDriftX: 0, cropDriftY: 0
  };

  // ---- resolve.ts ---------------------------------------------------------------------
  function resolveHighlight(p) {
    var c = CONTEXTS[p.context];
    if (!c) throw new Error("Highlight: unknown context " + p.context);
    var kind = p.page === "auto" ? (p.pageKind || "dark") : p.page;
    var marker = c.marker[kind];
    var r = Object.assign({}, CAMERA, {
      motionSeed: p.motionSeed == null ? null : p.motionSeed,
      motionIntensity: c.motionIntensity,
      image: p.image,
      imageWidth: p.imageWidth == null ? null : p.imageWidth,
      imageHeight: p.imageHeight == null ? null : p.imageHeight,
      crop: p.crop || null,
      durationInSeconds: p.durationInSeconds == null ? null : p.durationInSeconds,
      blendMode: kind === "dark" ? "screen" : "multiply",
      backgroundColor: p.pageColor || PAGE_BACKGROUND[kind],
      wipeBaseSeconds: c.wipeBaseSeconds, wipePxPerSecond: c.wipePxPerSecond,
      focusInSeconds: c.focusInSeconds, focusInBlurPx: c.focusInBlurPx,
      highlights: (p.highlights || []).map(function (h) {
        return Object.assign({}, h, { durationInSeconds: h.durationInSeconds == null ? null : h.durationInSeconds, color: h.color || marker });
      })
    });
    return Object.assign(r, p.overrides || {});
  }

  // Remotion calculateMetadata: automatic length = last wipe + HOLD (min 3 s).
  function resolveLength(p) {
    var c = CONTEXTS[p.context];
    var fps = p.fps || FPS;
    var crop = p.crop || null;
    var plateWidth = 1920 / (crop ? crop.w : 1);
    var ends = (p.highlights || []).map(function (h) {
      return h.startInSeconds + (h.durationInSeconds == null ? c.wipeBaseSeconds + (h.w * plateWidth) / c.wipePxPerSecond : h.durationInSeconds);
    });
    var seconds = p.durationInSeconds != null ? p.durationInSeconds : Math.max.apply(null, [3].concat(ends)) + HOLD_SECONDS;
    var frames = p.durationInFrames != null ? p.durationInFrames : Math.round(seconds * fps);
    return { fps: fps, frames: frames };
  }

  // ---- motion.ts (Remotion random() = mulberry32(hashCode(str))) -----------------------
  function mulberry32(a) { var t = (a + 0x6d2b79f5) | 0; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }
  function hashCode(str) { var hash = 0; for (var i = 0; i < str.length; i++) { hash = (hash << 5) - hash + str.charCodeAt(i); hash |= 0; } return hash; }
  function random(seed) { return mulberry32(hashCode(seed)); }
  var NAMES = ["push-in", "pull-back", "drift-left", "drift-right", "tilt-reveal", "corner-sweep", "rise", "settle"];
  var PRESETS = {
    "push-in": { rotateX: [0, 0], rotateY: [-6, -6], rotateZ: [-1.35, -1.35], scale: [1, 1.09], panX: [0, 0], panY: [0, 0], perspective: 2000 },
    "pull-back": { rotateX: [0, 0], rotateY: [-7, -4], rotateZ: [-1.6, -1], scale: [1.12, 1], panX: [0, 0], panY: [0, 0], perspective: 2000 },
    "drift-left": { rotateX: [1, -1], rotateY: [-8, -2], rotateZ: [-1.8, -0.8], scale: [1.02, 1.1], panX: [0.02, -0.02], panY: [0, 0], perspective: 1800 },
    "drift-right": { rotateX: [-1, 1], rotateY: [2, 8], rotateZ: [1.8, 0.8], scale: [1.02, 1.1], panX: [-0.02, 0.02], panY: [0, 0], perspective: 1800 },
    "tilt-reveal": { rotateX: [4, -1], rotateY: [-5, -5], rotateZ: [-1.2, -1.2], scale: [1.04, 1.1], panX: [0, 0], panY: [-0.02, 0.015], perspective: 1500 },
    "corner-sweep": { rotateX: [3, -2.5], rotateY: [-9, -3], rotateZ: [-2.2, -0.6], scale: [1.03, 1.12], panX: [0.025, -0.02], panY: [0.02, -0.015], perspective: 1600 },
    rise: { rotateX: [-2, 2], rotateY: [-6.5, -5], rotateZ: [-1.4, -1.4], scale: [1.05, 1.11], panX: [0, 0], panY: [0.035, -0.03], perspective: 2200 },
    settle: { rotateX: [0.5, 0], rotateY: [-5, -6.5], rotateZ: [-1, -1.4], scale: [1, 1.04], panX: [0, 0], panY: [0, 0], perspective: 2400 }
  };
  var clamp = function (v, lo, hi) { return Math.min(hi, Math.max(lo, v)); };
  function randomMotion(seed, intensity) {
    var r = function (salt) { return random(seed + "::" + salt); };
    var name = NAMES[Math.floor(r("preset") * NAMES.length) % NAMES.length];
    var base = PRESETS[name];
    var j = function (salt, amount) { return (r(salt) * 2 - 1) * amount * intensity; };
    var pair = function (ab, salt, amount, lo, hi) { return [clamp(ab[0] * intensity + j(salt + "0", amount), lo, hi), clamp(ab[1] * intensity + j(salt + "1", amount), lo, hi)]; };
    var mirror = r("mirror") < 0.35 ? -1 : 1;
    var mirrored = function (ab) { return [ab[0] * mirror, ab[1] * mirror]; };
    var scaleAmount = 1 + (base.scale[1] - base.scale[0]) * intensity;
    return {
      rotateX: pair(base.rotateX, "rx", 1.5, -6, 6),
      rotateY: pair(mirrored(base.rotateY), "ry", 2, -11, 11),
      rotateZ: pair(mirrored(base.rotateZ), "rz", 0.6, -3, 3),
      scale: [clamp(base.scale[0] + j("s0", 0.02), 0.98, 1.2), clamp(base.scale[0] * scaleAmount + j("s1", 0.02), 0.98, 1.25)],
      panX: pair(base.panX, "px", 0.01, -0.035, 0.035),
      panY: pair(base.panY, "py", 0.008, -0.03, 0.03),
      perspective: Math.round(base.perspective + j("persp", 350))
    };
  }
  function overscanFor(m) {
    var maxAbs = function (p) { return Math.max(Math.abs(p[0]), Math.abs(p[1])); };
    var maxPan = Math.max(maxAbs(m.panX), maxAbs(m.panY));
    return 1.06 + maxAbs(m.rotateY) / 100 + maxAbs(m.rotateX) / 110 + maxAbs(m.rotateZ) / 40 + maxPan * 1.6;
  }

  // ---- framing.ts ----------------------------------------------------------------------
  function expandCrop(c, f) { return { x: c.x + c.w / 2 - (c.w * f) / 2, y: c.y + c.h / 2 - (c.h * f) / 2, w: c.w * f, h: c.h * f }; }
  function layoutPlate(crop, iw, ih, fw, fh) {
    var scale = Math.max(fw / (crop.w * iw), fh / (crop.h * ih));
    return { plateWidth: scale * iw, plateHeight: scale * ih, left: fw / 2 - scale * (crop.x + crop.w / 2) * iw, top: fh / 2 - scale * (crop.y + crop.h / 2) * ih };
  }

  // ---- Easing.bezier -------------------------------------------------------------------
  function bezier(x1, y1, x2, y2) {
    return function (x) {
      if (x <= 0) return 0;
      if (x >= 1) return 1;
      var lo = 0, hi = 1, t = x;
      for (var i = 0; i < 50; i++) {
        t = (lo + hi) / 2;
        var bx = 3 * (1 - t) * (1 - t) * t * x1 + 3 * (1 - t) * t * t * x2 + t * t * t;
        if (bx < x) lo = t; else hi = t;
      }
      return 3 * (1 - t) * (1 - t) * t * y1 + 3 * (1 - t) * t * t * y2 + t * t * t;
    };
  }
  var clamp01 = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };

  // ---- page measurement (HighlightTemplate.measurePage); fallback when props are not pinned --
  function measurePage(img) {
    var cv = document.createElement("canvas");
    cv.width = cv.height = 64;
    var g = cv.getContext("2d");
    g.drawImage(img, 0, 0, 64, 64);
    var d = g.getImageData(0, 0, 64, 64).data, s = 0;
    for (var i = 0; i < d.length; i += 4) s += 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
    var count = {};
    for (var k = 0; k < 64; k++) {
      var pts = [[k, 0], [k, 63], [0, k], [63, k]];
      for (var q = 0; q < 4; q++) {
        var o = (pts[q][1] * 64 + pts[q][0]) * 4;
        var key = [d[o], d[o + 1], d[o + 2]].map(function (v) { return Math.min(255, Math.round(v / 4) * 4).toString(16).padStart(2, "0"); }).join("");
        count[key] = (count[key] || 0) + 1;
      }
    }
    var best = Object.keys(count).sort(function (a, b) { return count[b] - count[a]; })[0];
    return { kind: s / (d.length / 4) / 255 < 0.45 ? "dark" : "light", color: "#" + best };
  }

  global.HighlightEngine = {
    FPS: FPS, resolveHighlight: resolveHighlight, resolveLength: resolveLength, randomMotion: randomMotion,
    PRESETS: PRESETS, overscanFor: overscanFor, expandCrop: expandCrop, layoutPlate: layoutPlate,
    bezier: bezier, clamp01: clamp01, measurePage: measurePage
  };
})(window);
