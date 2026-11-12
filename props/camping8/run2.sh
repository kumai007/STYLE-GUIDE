cd "C:/Users/ayush/Videos/CLAUDE/PROJECT/graphics/hyperframes"
node tools/place-map-render.mjs props/camping8/map-gunma.json --comp nocturn-map --out out/camping8/map-gunma.mp4 --quiet
node tools/place-map-render.mjs props/camping8/map-lochlomond.json --comp nocturn-map --out out/camping8/map-lochlomond.mp4 --quiet
node props/camping8/rc-render.mjs props/camping8/rc-c1-ken-sept.json out/camping8/comment-c1-ken-sept.mov 100
