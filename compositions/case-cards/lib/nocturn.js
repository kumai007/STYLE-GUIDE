/* Nocturn Beats shared pieces (Stakes, Lineup): palette, handheld drift, film grain (6 seeds cycled by frame), the Plate. Needs cc.js. */
(function () {
  var palette = { charcoal: "#0C0F0D", forest: "#14211A", bone: "#E9E6E8", greyGreen: "#8A9A8C", amber: "#C8903F", red: "#AC4151", highlightRed: "#C00524" };
  function drift(f, fps, a) {
    a = a === undefined ? 1 : a; var t = f / fps;
    return [a * (5 * Math.sin(t * 0.9) + 2 * Math.sin(t * 2.3)), a * (4 * Math.sin(t * 0.7 + 1) + 1.5 * Math.sin(t * 1.9))];
  }
  // appends the grain svg to parent; returns setSeed(f)
  function grain(parent, amount) {
    var s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    s.setAttribute("width", 1920); s.setAttribute("height", 1080);
    s.style.cssText = "position:absolute;left:0;top:0;opacity:" + (amount === undefined ? 0.1 : amount) + ";mix-blend-mode:overlay";
    s.innerHTML = '<filter id="grainf"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="1" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(#grainf)"/>';
    parent.appendChild(s); var t = s.querySelector("feTurbulence");
    return function (f) { t.setAttribute("seed", (Math.floor(f + 1e-6) % 6) + 1); };
  }
  // useCard: in/out opacity and 0..1 progress
  function card(f, fps, frames) {
    var o = CC.fade(f, frames, Math.max(Math.min(0.4 * fps, frames / 3), 1e-3));
    return { o: frames <= 1 ? 1 : o, p: CC.tween(f, [0, Math.max(frames - 1, 1)], [0, 1], CC.ease.sine) };
  }
  CC.nocturn = { palette: palette, drift: drift, grain: grain, card: card };
})();
