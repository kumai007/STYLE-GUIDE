// lm_cases.mjs - cases 2-21 extras (2026-11-23). CaseTitle = lm_v2 TitleType (typewriter "CASE N" + title, VCR OSD Mono, plate
// still) under its own name, so a case part can load lm_pro (whose TitleType = fade cards) and still have the typed title screen.
import { TitleType } from './lm_v2.mjs';

export const CaseTitle = {
  name: 'CaseTitle',
  // long titles: shrink the second line so it fits 1760 px (VCR mono advance ~0.65 em incl. 0.05 em spacing)
  html: (p, ctx) => {
    const b = String(p.b || ''), fs = Math.min(64, Math.floor(1760 / (Math.max(1, b.length) * 0.66)));
    return TitleType.html(p, ctx).split('data-dev="TitleType"').join('data-dev="CaseTitle"').replace('font:400 64px/1', `font:400 ${fs}px/1`);
  },
  render: TitleType.render,
};

export default [CaseTitle];
