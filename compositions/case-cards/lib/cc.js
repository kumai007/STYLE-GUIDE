/* case-cards shared runtime: Remotion's motion vocabulary (easing, tween, typeOn, random) as pure functions of a frame
   number, plus the clock that drives a card's render(f) from the HyperFrames timeline. Everything is a function of f. */
(function () {
  // cubic-bezier, verbatim from Remotion's bezier.js (facebook/react-native) so eased values match to the last digit
  function bezier(mX1, mY1, mX2, mY2) {
    var N = 11, step = 1 / (N - 1), S = new Float32Array(N);
    var A = function (a1, a2) { return 1 - 3 * a2 + 3 * a1; }, B = function (a1, a2) { return 3 * a2 - 6 * a1; }, C = function (a1) { return 3 * a1; };
    var calc = function (t, a1, a2) { return ((A(a1, a2) * t + B(a1, a2)) * t + C(a1)) * t; };
    var slope = function (t, a1, a2) { return 3 * A(a1, a2) * t * t + 2 * B(a1, a2) * t + C(a1); };
    if (mX1 !== mY1 || mX2 !== mY2) for (var i = 0; i < N; ++i) S[i] = calc(i * step, mX1, mX2);
    function getT(x) {
      var start = 0, cur = 1, last = N - 1;
      for (; cur !== last && S[cur] <= x; ++cur) start += step;
      --cur;
      var g = start + ((x - S[cur]) / (S[cur + 1] - S[cur])) * step, sl = slope(g, mX1, mX2);
      if (sl >= 0.001) { for (var k = 0; k < 4; ++k) { var s2 = slope(g, mX1, mX2); if (s2 === 0) return g; g -= (calc(g, mX1, mX2) - x) / s2; } return g; }
      if (sl === 0) return g;
      var a = start, b = start + step, cx, ct, n = 0;
      do { ct = a + (b - a) / 2; cx = calc(ct, mX1, mX2) - x; if (cx > 0) b = ct; else a = ct; } while (Math.abs(cx) > 1e-7 && ++n < 10);
      return ct;
    }
    return function (x) {
      var cx = Math.min(1, Math.max(0, x));
      if (mX1 === mY1 && mX2 === mY2) return cx;
      if (cx === 0) return 0; if (cx === 1) return 1;
      return calc(getT(cx), mY1, mY2);
    };
  }
  var ease = {
    enter: bezier(0.16, 1, 0.3, 1), measured: bezier(0.15, 0.75, 0.35, 1), ui: bezier(0.25, 0.46, 0.45, 0.94),
    morph: bezier(0.65, 0, 0.35, 1), exit: bezier(0.5, 0, 0.75, 0), sine: bezier(0.37, 0, 0.63, 1), clock: function (t) { return t; },
  };
  // Remotion interpolate(f, at, to, {clamp both, easing per segment})
  function tween(f, at, to, easing) {
    var n = at.length, i = 1;
    if (f <= at[0]) return to[0];
    if (f >= at[n - 1]) return to[n - 1];
    while (i < n - 1 && f > at[i]) i++;
    var t = (f - at[i - 1]) / (at[i] - at[i - 1]);
    return to[i - 1] + (to[i] - to[i - 1]) * easing(t);
  }
  function mix(p, at, to) { return tween(p, at, to, function (t) { return t; }); }
  function fade(f, frames, fin, fout) {
    if (fout === undefined) fout = fin;
    return Math.min(fin > 0 ? tween(f, [0, fin], [0, 1], ease.ui) : 1, fout > 0 ? tween(f, [frames - fout, frames], [1, 0], ease.ui) : 1);
  }
  function typeOn(f, start, n, perChar) { return Math.floor(Math.max(0, Math.min(n, ((f - start) / Math.max(n * perChar, 1)) * n))); }
  function random(seed) { // Remotion's random(string)
    var h = 0; for (var i = 0; i < seed.length; i++) { h = (h << 5) - h + seed.charCodeAt(i); h |= 0; }
    var t = h + 0x6d2b79f5; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  var list = function (v, d) { return Array.isArray(v) ? v : d; };
  var str = function (v, d) { return typeof v === 'string' ? v : (d === undefined ? '' : d); };
  var num = function (v, d) { return typeof v === 'number' && isFinite(v) ? v : d; };
  var $ = function (id) { return document.getElementById(id); };

  // props: the composition's declared variables (keys = Remotion prop names). Old durationInFrames-style keys are accepted.
  function props(defaults) {
    var v = {}, got = (window.__hyperframes && window.__hyperframes.getVariables && window.__hyperframes.getVariables()) || {};
    for (var k in defaults) v[k] = got[k] !== undefined && got[k] !== null ? got[k] : defaults[k];
    if (got.frames === undefined && got.durationInFrames !== undefined) v.frames = got.durationInFrames;
    if (got.data && typeof got.data === 'string') { try { v.data = JSON.parse(got.data); } catch (e) {} }
    return v;
  }
  // drive render(f) from the paused timeline: a GSAP tween on a proxy whose setter draws frame f. f is snapped to 1e-6 so
  // floor()-based steps (typing, grain seeds) land on the integer frame the renderer asked for.
  function clock(id, fps, frames, render) {
    var cur = 0, proxy = {};
    Object.defineProperty(proxy, 'f', { get: function () { return cur; }, set: function (v) { cur = v; render(Math.round(v * 1e6) / 1e6); } });
    var tl = gsap.timeline({ paused: true });
    tl.to(proxy, { f: frames, duration: frames / fps, ease: 'none' }, 0);
    window.__timelines = window.__timelines || {};
    window.__timelines[id] = tl;
    render(0);
    return tl;
  }
  window.CC = { bezier: bezier, ease: ease, tween: tween, mix: mix, fade: fade, typeOn: typeOn, random: random, list: list, str: str, num: num, $: $, props: props, clock: clock };
})();
