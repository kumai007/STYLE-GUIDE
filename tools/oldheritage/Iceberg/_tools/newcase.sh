#!/bin/bash
# newcase.sh <VID> <NN>   VID = TOR ND TP WP DC BD IN ZO AM FF ; NN = 01..30, 00 = intro, 99 = outro
# Creates: build/CASEnn (assets graded media out), an isolated public dir _engine/pubs/<KEY>, a stub case file and its own entry,
# so each case bundles and renders alone (one case's broken code never breaks another's render).
set -e
VID=$1; NN=$2; KEY=$VID$NN
I=C:/Users/ayush/Videos/CLAUDE/STYLEG~1/tools/oldheritage/Iceberg; E=$I/_engine
case $VID in TOR) D=$I/03_Tornado;; ND) D=$I/01_Natural_Disasters;; TP) D=$I/02_Theme_Park;; WP) D=$I/04_Workplace;; DC) D=$I/05_Dashcam;; BD) D=$I/06_Before_Disasters;; IN) D=$I/07_Incidents;; ZO) D=$I/08_Zoo;; AM) D=$I/09_Amusement_Iceberg;; FF) D=$I/10_Fast_Food_Iceberg;; DC) D=$I/05_Dashcam;; BD) D=$I/06_Before_Disasters;; IN) D=$I/07_Incidents;; ZO) D=$I/08_Zoo;; AM) D=$I/09_Amusement_Iceberg;; FF) D=$I/10_Fast_Food_Iceberg;; *) echo bad VID; exit 1;; esac
B=$D/build/CASE$NN; mkdir -p $B/{assets,media,graded,out,shots,maps}
P=$E/pubs/$KEY; mkdir -p $P
# Windows: the public dir is a hard-link tree built by pubsync.sh from .src (Remotion cannot copy links on Windows)
mkdir -p $D/vo/raw
{ for x in fonts ic ic3 ice3 kit n2 n2fx sfx sfx_n2 music vignette.png; do printf '%s\t%s\n' $x $E/public/$x; done
  printf 'vor\t%s\ncase\t%s\n' $D/vo/raw $B; } > $P/.src
bash $I/_tools/pubsync.sh $P
[ -f $E/src/cases/$KEY.tsx ] || cat > $E/src/cases/$KEY.tsx <<EOT
import React from "react";
import { AbsoluteFill } from "remotion";
export const DUR = 90;
export const Comp: React.FC = () => <AbsoluteFill style={{ background: "#000" }} />;
EOT
cat > $E/src/entries/$KEY.tsx <<EOT
import React from "react";
import { Composition, registerRoot } from "remotion";
import { Comp, DUR } from "../cases/$KEY";
registerRoot(() => <Composition id="$KEY" component={Comp} durationInFrames={DUR} fps={30} width={1920} height={1080} />);
EOT
echo "case $KEY: build=$B public=$P code=$E/src/cases/$KEY.tsx  (static paths: case/..., vor/CASE$NN.mp3, sfx_n2/..., music/...)"
