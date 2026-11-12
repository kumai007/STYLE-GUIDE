/* gm.js - exact ports of remotion@4.0.529 random(), Easing.bezier(), clamped interpolate() with perceptual-scale. */
(function () {
  var GM = (window.GM = {});
  function mulberry32(a) {
    var t = (a + 0x6d2b79f5) | 0;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  function hashCode(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) { hash = (hash << 5) - hash + str.charCodeAt(i); hash |= 0; }
    return hash;
  }
  GM.random = function (seed) { return mulberry32(hashCode(String(seed))); };

  // Easing.bezier (bezier-easing, as bundled in remotion)
  var N = 11, STEP = 1 / (N - 1);
  function A(a1, a2) { return 1 - 3 * a2 + 3 * a1; }
  function B(a1, a2) { return 3 * a2 - 6 * a1; }
  function C(a1) { return 3 * a1; }
  function cb(t, a1, a2) { return ((A(a1, a2) * t + B(a1, a2)) * t + C(a1)) * t; }
  function slope(t, a1, a2) { return 3 * A(a1, a2) * t * t + 2 * B(a1, a2) * t + C(a1); }
  GM.bezier = function (x1, y1, x2, y2) {
    var s = new Float32Array(N);
    if (x1 !== y1 || x2 !== y2) for (var i = 0; i < N; ++i) s[i] = cb(i * STEP, x1, x2);
    function tForX(x) {
      var start = 0, cur = 1, last = N - 1;
      for (; cur !== last && s[cur] <= x; ++cur) start += STEP;
      --cur;
      var dist = (x - s[cur]) / (s[cur + 1] - s[cur]);
      var guess = start + dist * STEP;
      var sl = slope(guess, x1, x2);
      if (sl >= 0.001) {
        for (var k = 0; k < 4; ++k) {
          var cs = slope(guess, x1, x2);
          if (cs === 0) return guess;
          guess -= (cb(guess, x1, x2) - x) / cs;
        }
        return guess;
      }
      if (sl === 0) return guess;
      var a = start, b = start + STEP, ct, cx, j = 0;
      do { ct = a + (b - a) / 2; cx = cb(ct, x1, x2) - x; if (cx > 0) b = ct; else a = ct; } while (Math.abs(cx) > 1e-7 && ++j < 10);
      return ct;
    }
    return function (x) {
      if (x1 === y1 && x2 === y2) return x;
      if (x === 0) return 0;
      if (x === 1) return 1;
      return cb(tForX(x), y1, y2);
    };
  };
  GM.linear = function (t) { return t; };
  GM.outQuad = function (t) { return 1 - (1 - t) * (1 - t); };

  var toArea = function (s) { return s === 0 ? 0 : Math.sign(s) * s * s; };
  var fromArea = function (a) { return a === 0 ? 0 : Math.sign(a) * Math.sqrt(Math.abs(a)); };
  // interpolate(x, inR, outR, easing fn|array, perceptual) with clamp extrapolation
  GM.interp = function (x, inR, outR, easing, perceptual) {
    if (x <= inR[0]) return outR[0];
    if (x >= inR[inR.length - 1]) return outR[outR.length - 1];
    var i = 1;
    for (; i < inR.length - 1; ++i) if (inR[i] >= x) break;
    i -= 1;
    var lo = outR[i], hi = outR[i + 1];
    if (lo === hi) return lo;
    var t = (x - inR[i]) / (inR[i + 1] - inR[i]);
    if (easing) t = (Array.isArray(easing) ? easing[i] : easing)(t);
    if (perceptual) { var al = toArea(lo), ah = toArea(hi); return fromArea(t * (ah - al) + al); }
    return t * (hi - lo) + lo;
  };
})();
