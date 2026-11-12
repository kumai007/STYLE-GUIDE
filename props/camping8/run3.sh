cd "C:/Users/ayush/Videos/CLAUDE/PROJECT/graphics/hyperframes"
node tools/place-map-render.mjs props/camping8/map-gunma.json --comp nocturn-map --out out/camping8/map-gunma.mp4 --quiet
node tools/place-map-render.mjs props/camping8/map-lochlomond.json --comp nocturn-map --out out/camping8/map-lochlomond.mp4 --quiet
for k in c1-02:200 c1-01:215 c1-04:275 c1-06:150 c1-07:375; do node props/camping8/rc-render.mjs props/camping8/rc-${k%%:*}.json out/camping8/comment-${k%%:*}.mov ${k##*:}; done
