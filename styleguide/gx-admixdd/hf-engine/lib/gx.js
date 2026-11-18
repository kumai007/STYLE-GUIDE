// gx.js - exact ports of the Remotion 4.0.532 math the gx engine uses + the per-frame HF runtime.
// UMD: window.GX in the page, module.exports in node (build.mjs uses the same math for timing).
(function (root) {
  'use strict';
  var FPS = 60;
  // ---- remotion random(seed): string -> mulberry32(hashCode), number -> mulberry32(seed * 1e10)
  function mulberry32(a) {
    var t = a + 0x6d2b79f5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  function hashCode(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) { hash = (hash << 5) - hash + str.charCodeAt(i); hash |= 0; }
    return hash;
  }
  function random(seed) {
    // remotion: random(null) = Math.random(); not ported (renders must be deterministic)
    if (typeof seed === 'string') return mulberry32(hashCode(seed));
    if (typeof seed === 'number') return mulberry32(seed * 10000000000);
    throw new Error('random: seed must be string or number');
  }
  // ---- remotion Easing.bezier (dist/cjs/bezier.js, verbatim algorithm, Float32Array sample table)
  function bezier(mX1, mY1, mX2, mY2) {
    var NI = 4, NMS = 0.001, SP = 0.0000001, SMI = 10, N = 11, step = 1.0 / (N - 1.0);
    function A(a1, a2) { return 1.0 - 3.0 * a2 + 3.0 * a1; }
    function B(a1, a2) { return 3.0 * a2 - 6.0 * a1; }
    function C(a1) { return 3.0 * a1; }
    function calc(t, a1, a2) { return ((A(a1, a2) * t + B(a1, a2)) * t + C(a1)) * t; }
    function slope(t, a1, a2) { return 3.0 * A(a1, a2) * t * t + 2.0 * B(a1, a2) * t + C(a1); }
    var sv = new Float32Array(N);
    if (mX1 !== mY1 || mX2 !== mY2) for (var i = 0; i < N; ++i) sv[i] = calc(i * step, mX1, mX2);
    function getTForX(aX) {
      var start = 0.0, cur = 1, last = N - 1;
      for (; cur !== last && sv[cur] <= aX; ++cur) start += step;
      --cur;
      var dist = (aX - sv[cur]) / (sv[cur + 1] - sv[cur]);
      var g = start + dist * step;
      var s0 = slope(g, mX1, mX2);
      if (s0 >= NMS) {
        for (var k = 0; k < NI; ++k) { var sl = slope(g, mX1, mX2); if (sl === 0.0) return g; g -= (calc(g, mX1, mX2) - aX) / sl; }
        return g;
      }
      if (s0 === 0.0) return g;
      var aA = start, aB = start + step, cT, cX, it = 0;
      do { cT = aA + (aB - aA) / 2.0; cX = calc(cT, mX1, mX2) - aX; if (cX > 0.0) aB = cT; else aA = cT; } while (Math.abs(cX) > SP && ++it < SMI);
      return cT;
    }
    return function (x) {
      var cx = Math.min(1, Math.max(0, x));
      if (mX1 === mY1 && mX2 === mY2) return cx;
      if (cx === 0) return 0;
      if (cx === 1) return 1;
      return calc(getTForX(cx), mY1, mY2);
    };
  }
  var Easing = {
    linear: function (t) { return t; },
    cubic: function (t) { return t * t * t; },
    bezier: bezier,
    inOut: function (e) { return function (t) { return t < 0.5 ? e(t * 2) / 2 : 1 - e((1 - t) * 2) / 2; }; },
  };
  // ---- remotion interpolate (numeric; dist/cjs/interpolate.js interpolateNumber + interpolateFunction): findRange segment,
  // clamp / extend / identity / wrap per side, easing function or per-segment array. Checked against remotion 4.0.532: its
  // multi-segment "extend right" loop only runs for easings flagged remotionShouldExtendRight (Easing.spring with allowTail),
  // which the gx engine never uses -> for every gx call the result is identical. posterize / string outputs not ported (unused).
  function interpolate(input, inR, outR, o) {
    o = o || {};
    if (inR.length === 1) return outR[0];
    var L = o.extrapolateLeft || 'extend', R = o.extrapolateRight || 'extend';
    var i = 1;
    for (; i < inR.length - 1; ++i) if (inR[i] >= input) break;
    var r = i - 1, inMin = inR[r], inMax = inR[r + 1], outMin = outR[r], outMax = outR[r + 1];
    var easing = Array.isArray(o.easing) ? o.easing[r] : o.easing || Easing.linear;
    var v = input;
    if (v < inMin) { if (L === 'identity') return v; if (L === 'clamp') v = inMin; else if (L === 'wrap') v = (((v - inMin) % (inMax - inMin)) + (inMax - inMin)) % (inMax - inMin) + inMin; }
    if (v > inMax) { if (R === 'identity') return v; if (R === 'clamp') v = inMax; else if (R === 'wrap') v = (((v - inMin) % (inMax - inMin)) + (inMax - inMin)) % (inMax - inMin) + inMin; }
    if (outMin === outMax) return outMin;
    v = (v - inMin) / (inMax - inMin);
    v = easing(v);
    return v * (outMax - outMin) + outMin;
  }
  // ---- Motion.tsx
  var EASE = bezier(0.45, 0, 0.25, 1);
  var EASE_IO = Easing.inOut(Easing.cubic);
  function ease(x, inR, outR, e) { return interpolate(x, inR, outR, { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e || EASE }); }
  function drift(x) { var c = Math.min(1, Math.max(0, x)); return 0.35 * c + 0.65 * EASE(c); }
  function moveCss(kind, p, dur, o) {
    o = o || {};
    if (kind === 'none') return 'none';
    var q = drift(p), rate = o.rate == null ? 0.015 : o.rate;
    if (kind === 'push') return 'scale(' + (1 + rate * dur * q).toFixed(5) + ')';
    if (kind === 'pull') return 'scale(' + (1 + rate * dur * (1 - q)).toFixed(5) + ')';
    var deg = Math.min(6, Math.abs(o.deg == null ? 3 : o.deg));
    var a = (2 * q - 1) * deg;
    var s = (1 + 0.013 * deg) * (1 + rate * 0.4 * dur * q);
    var rot = kind === 'tiltL' ? 'rotateY(' + (-a).toFixed(4) + 'deg)' : kind === 'tiltR' ? 'rotateY(' + a.toFixed(4) + 'deg)'
      : kind === 'tiltUp' ? 'rotateX(' + a.toFixed(4) + 'deg)' : 'rotateX(' + (-a).toFixed(4) + 'deg)';
    return 'perspective(' + (o.persp || 2000) + 'px) ' + rot + ' scale(' + s.toFixed(5) + ')';
  }
  var F = function (t) { return Math.round(t * FPS); };

  // ---- runtime (browser only): shots = [data-shot] wrappers with data-s/data-e (frames); devices = [data-dev] inside them.
  var shots = null, devs = {};
  function init(doc) {
    shots = [].slice.call(doc.querySelectorAll('[data-shot]')).map(function (el) {
      return {
        el: el, s: +el.dataset.s, e: +el.dataset.e,
        d: [].slice.call(el.querySelectorAll('[data-dev]')).map(function (d) { return { el: d, dev: d.dataset.dev, p: JSON.parse(d.dataset.p || '{}') }; }),
      };
    });
  }
  function render(t) {
    if (!shots) init(document);
    var frame = Math.round(t * FPS);
    for (var i = 0; i < shots.length; i++) {
      var sh = shots[i], on = frame >= sh.s && frame < sh.e;
      sh.el.style.display = on ? '' : 'none';
      if (!on) continue;
      var f = frame - sh.s, S = { len: sh.e - sh.s, dur: (sh.e - sh.s) / FPS, frame: frame };
      for (var k = 0; k < sh.d.length; k++) { var d = sh.d[k]; devs[d.dev](d.el, f, d.p, GX, S); }
    }
  }
  var GX = {
    FPS: FPS, F: F, random: random, bezier: bezier, Easing: Easing, interpolate: interpolate,
    EASE: EASE, EASE_IO: EASE_IO, ease: ease, drift: drift, moveCss: moveCss,
    devs: devs, init: init, render: render,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = GX;
  else root.GX = GX;
})(typeof window !== 'undefined' ? window : globalThis);
