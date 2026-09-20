#!/bin/bash
# Vanguard v6.2 — genera los MP4 reales de GlobalVision a partir de las
# imagenes locales (CCTV/OSINT/TV) con efecto Ken Burns + overlay REC.
# Salida: public/videos/V-XXX.mp4  (~15-75s cada uno, h264 yuv420p)
set -u
OUT=/home/z/my-project/public/videos
FONT=/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf
A=/home/z/my-project/public/assets
mkdir -p "$OUT"

# id | imagen | segundos | movimiento (0 zoom-in, 1 pan-der, 2 pan-izq, 3 zoom-out)
MANIFEST=(
  "V-001|$A/cctv/tanks-square.png|14|0"
  "V-002|$A/tv/rocket-launch.png|45|1"
  "V-003|$A/tv/summit.png|38|2"
  "V-004|$A/tv/fleet.png|42|1"
  "V-005|$A/tv/drone-swarm.png|40|0"
  "V-006|$A/tv/border-wall.png|48|3"
  "V-007|$A/tv/parade.png|18|2"
  "V-008|$A/osint/night-convoy.png|40|1"
  "V-009|$A/osint/ukraine-trench.png|45|0"
  "V-010|$A/cctv/border-cctv.png|14|1"
  "V-011|$A/tv/city-skyline.png|36|2"
  "V-012|$A/osint/jet-patrol.png|42|0"
  "V-013|$A/osint/infra-dam.png|14|3"
  "V-014|$A/osint/refinery-fire.png|22|1"
  "V-015|$A/osint/refugee-camp.png|46|2"
  "V-016|$A/osint/bridge-collapsed.png|40|3"
  "V-017|$A/cctv/road-crater.png|44|1"
  "V-018|$A/tv/protest.png|38|0"
)

motion_for() {
  case "$1" in
    0) echo "zoompan=z='min(zoom+0.0012,1.18)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=\$D:s=1280x720:fps=24" ;;
    1) echo "zoompan=z='1.12':x='(iw-iw/zoom)*on/\$D':y='ih/2-(ih/zoom/2)':d=\$D:s=1280x720:fps=24" ;;
    2) echo "zoompan=z='1.12':x='(iw-iw/zoom)*(1-on/\$D)':y='ih/2-(ih/zoom/2)':d=\$D:s=1280x720:fps=24" ;;
    3) echo "zoompan=z='if(eq(on,0),1.18,max(zoom-0.0012,1.0))':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=\$D:s=1280x720:fps=24" ;;
  esac
}

for row in "${MANIFEST[@]}"; do
  IFS='|' read -r ID IMG SECS MODE <<< "$row"
  D=$(( SECS * 24 ))
  VF=$(motion_for "$MODE" | sed "s/\$D/$D/g")
  VF="$VF,drawtext=fontfile=$FONT:text='REC %{pts\:hms}':fontcolor=white:fontsize=22:box=1:boxcolor=black@0.55:boxborderw=8:x=24:y=24"
  VF="$VF,drawtext=fontfile=$FONT:text='VANGUARD\\/GlobalVision 4K-OSINT':fontcolor=white@0.75:fontsize=16:box=1:boxcolor=black@0.45:boxborderw=6:x=w-tw-24:y=h-th-20"
  ffmpeg -y -loglevel error -loop 1 -i "$IMG" \
    -vf "$VF" \
    -t "$SECS" -r 24 -c:v libx264 -preset veryfast -crf 29 -pix_fmt yuv420p \
    -movflags +faststart "$OUT/$ID.mp4"
  echo "OK $ID ($SECS s)"
done
echo "--- total:"
du -sh "$OUT"
