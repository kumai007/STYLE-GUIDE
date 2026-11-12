cd "C:/Users/ayush/Videos/CLAUDE/PROJECT/graphics/hyperframes"
node tools/hf-case-render.mjs NocturnCaseCard out/camping8/case-one.mp4 --props props/camping8/case-one.json
node tools/render-overlay.mjs TitleCard out/camping8/title.mov --props props/camping8/title.json
node tools/hf-case-render.mjs NocturnVcr out/camping8/vcr-gunma.mov --props props/camping8/vcr-gunma.json
node tools/hf-case-render.mjs NocturnVcr out/camping8/vcr-c1.mov --props props/camping8/vcr-c1.json
node tools/render-overlay.mjs Emphasis out/camping8/callout-31cm.mov --props props/camping8/callout.json
