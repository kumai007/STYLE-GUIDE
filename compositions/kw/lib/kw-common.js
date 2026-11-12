/* Shared helpers for the kw family (ports of the Remotion kw presets).
   Pure functions of time. Loaded synchronously with a plain <script src>. */
(function () {
  var NTSC = 30000 / 1001;

  /* Remotion Easing.bezier(x1,y1,x2,y2): cubic-bezier solved for x, same maths as CSS. */
  function bezier(x1, y1, x2, y2) {
    function A(a, b) { return 1 - 3 * b + 3 * a; }
    function B(a, b) { return 3 * b - 6 * a; }
    function C(a) { return 3 * a; }
    function calc(t, a, b) { return ((A(a, b) * t + B(a, b)) * t + C(a)) * t; }
    function slope(t, a, b) { return 3 * A(a, b) * t * t + 2 * B(a, b) * t + C(a); }
    function getT(x) {
      var t = x, i, s, d;
      for (i = 0; i < 8; i++) {
        s = slope(t, x1, x2);
        if (s === 0) return t;
        d = calc(t, x1, x2) - x;
        t -= d / s;
      }
      var lo = 0, hi = 1;
      t = x;
      for (i = 0; i < 60; i++) {
        d = calc(t, x1, x2) - x;
        if (Math.abs(d) < 1e-9) return t;
        if (d > 0) hi = t; else lo = t;
        t = (lo + hi) / 2;
      }
      return t;
    }
    return function (x) {
      if (x <= 0) return 0;
      if (x >= 1) return 1;
      return calc(getT(x), y1, y2);
    };
  }

  /* Variables come from data-composition-variables defaults, overridden by --variables.
     `frames` is the length: variable durationInFrames (Remotion key) or `frames`. */
  function lengthInFrames(v, fallback) {
    var n = Number(v.durationInFrames != null ? v.durationInFrames : v.frames);
    return n > 0 ? n : fallback;
  }

  /* Remotion staticFile("highlights/kw-c1-figure.png") -> assets/kw/kw-c1-figure.png */
  function kwAsset(p) {
    p = String(p || "");
    if (/^assets\//.test(p)) return p;
    return "assets/kw/" + p.split("/").pop();
  }

  window.KW = { NTSC: NTSC, bezier: bezier, lengthInFrames: lengthInFrames, kwAsset: kwAsset };
})();
