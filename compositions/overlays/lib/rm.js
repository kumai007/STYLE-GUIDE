/*
 * rm.js - Remotion math for the overlays family (exact ports, no approximation).
 * spring(), interpolate() (clamp), envelope(), enter(), drift(), rand() are the
 * source functions from templates/src/presets/nocturnfx/anim.ts and remotion@4.0.529.
 * Every overlay is a pure function of the frame number; RM.mount() drives that
 * function from the paused GSAP timeline, so any seek reproduces any frame.
 */
(function () {
  var RM = (window.RM = {});

  // remotion/dist/cjs/spring/spring-utils.js (stepped one frame at a time, as Remotion does)
  function advance(a, now, cfg) {
    var dt = Math.min(now - a.last, 64);
    var c = cfg.damping, m = cfg.mass, k = cfg.stiffness;
    var v0 = -a.velocity, x0 = a.to - a.current;
    var zeta = c / (2 * Math.sqrt(k * m));
    var w0 = Math.sqrt(k / m);
    var w1 = w0 * Math.sqrt(1 - Math.pow(zeta, 2));
    var t = dt / 1000;
    var sin1 = Math.sin(w1 * t), cos1 = Math.cos(w1 * t);
    var env = Math.exp(-zeta * w0 * t);
    var f1 = env * (sin1 * ((v0 + zeta * w0 * x0) / w1) + x0 * cos1);
    var udPos = a.to - f1;
    var udVel = zeta * w0 * f1 - env * (cos1 * (v0 + zeta * w0 * x0) - w1 * x0 * sin1);
    var cenv = Math.exp(-w0 * t);
    var cdPos = a.to - cenv * (x0 + (v0 + w0 * x0) * t);
    var cdVel = cenv * (v0 * (t * w0 - 1) + t * x0 * w0 * w0);
    return { to: a.to, last: now, current: zeta < 1 ? udPos : cdPos, velocity: zeta < 1 ? udVel : cdVel };
  }
  RM.spring = function (frame, fps, cfg) {
    var a = { last: 0, current: 0, to: 1, velocity: 0 };
    var fc = Math.max(0, frame);
    for (var f = 0; f <= Math.floor(fc); f++) a = advance(a, (f / fps) * 1000, cfg);
    var rest = fc % 1;
    if (rest > 0) a = advance(a, (fc / fps) * 1000, cfg);
    return a.current;
  };

  // interpolate with extrapolateLeft/Right = "clamp", linear (optionally eased per segment)
  RM.interp = function (x, inR, outR, easing) {
    if (x <= inR[0]) return outR[0];
    if (x >= inR[inR.length - 1]) return outR[outR.length - 1];
    var i = 1;
    for (; i < inR.length - 1; i++) if (inR[i] >= x) break;
    i -= 1;
    var t = (x - inR[i]) / (inR[i + 1] - inR[i]);
    if (easing) t = (Array.isArray(easing) ? easing[i] : easing)(t);
    return t * (outR[i + 1] - outR[i]) + outR[i];
  };

  RM.envelope = function (frame, dur, fadeIn, fadeOut) {
    return RM.interp(frame, [0, fadeIn, Math.max(dur - fadeOut, fadeIn + 1), dur], [0, 1, 1, 0]);
  };
  RM.enter = function (frame, fps, delay) {
    return RM.spring(frame - (delay || 0), fps, { damping: 200, mass: 0.6, stiffness: 110 });
  };
  RM.drift = function (frame, dur, amount) {
    return 1 + (frame / Math.max(dur, 1)) * (amount === undefined ? 0.015 : amount);
  };
  RM.rand = function (seed) {
    var x = Math.sin(seed * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  };

  /*
   * RM.mount({ id, fps, defaultFrames, apply(frame, P, dur) })
   * P = variables (defaults merged with --variables); durationInFrames sets the length.
   * The root's data-duration is rewritten from the variable before the timeline is registered.
   */
  RM.vars = function () {
    try { return (window.__hyperframes && window.__hyperframes.getVariables && window.__hyperframes.getVariables()) || {}; }
    catch (e) { return {}; }
  };
  RM.mount = function (o) {
    var P = RM.vars();
    var dur = Number(P.durationInFrames);
    if (!(dur > 0)) dur = o.defaultFrames;
    dur = Math.round(dur);
    var root = document.querySelector('[data-composition-id="' + o.id + '"]');
    root.setAttribute('data-duration', String(dur / o.fps));
    if (o.init) o.init(P, dur);
    var tl = gsap.timeline({ paused: true });
    tl.set({}, {}, dur / o.fps);
    function draw() {
      var f = Math.round(tl.time() * o.fps);
      o.apply(Math.min(Math.max(f, 0), dur - 1), P, dur);
    }
    tl.eventCallback('onUpdate', draw);
    draw();
    window.__timelines = window.__timelines || {};
    window.__timelines[o.id] = tl;
  };
})();
