// lm_cases.mjs - cases 2-21 extras (2026-11-23). CaseTitle = lm_v2 TitleType (typewriter "CASE N" + title, VCR OSD Mono, plate
// still) under its own name, so a case part can load lm_pro (whose TitleType = fade cards) and still have the typed title screen.
import { TitleType } from './lm_v2.mjs';

export const CaseTitle = {
  name: 'CaseTitle',
  html: (p, ctx) => TitleType.html(p, ctx).split('data-dev="TitleType"').join('data-dev="CaseTitle"'),
  render: TitleType.render,
};

export default [CaseTitle];
