#!/bin/bash
# Vanguard v9 — genera 6 MP4 NUEVOS (V-019..V-024) a partir de las FOTOS REALES
# descargadas de la web (public/assets/real/*.jpg) con efecto Ken Burns + overlay REC.
# Salida: public/videos/V-0XX.mp4 (h264 yuv420p, 1280x720, 24fps)
set -u
OUT=/home/z/my-project/public/videos
FONT=/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf
R=/home/z/my-project/public/assets/real
mkdir -p "$OUT"

# id | imagen real | segundos | movimiento (0 zoom-in, 1 pan-der, 2 pan-izq, 3 zoom-out)
MANIFEST=(
  "V-019|$R/tanks-2.jpg|30|0"
  "V-020|$R/jet-1.jpg|26|1"
  "V-021|$R/drone-1.jpg|24|0"
  "V-022|$R/ship-1.jpg|28|2"
  "V-023|$R/city-2.jpg|22|3"
  "V-024|$R/fire-1.jpg|20|1"
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
  if [ ! -s "$IMG" ]; then echo "SKIP $ID (falta $IMG)"; continue; fi
  if [ -s "$OUT/$ID.mp4" ]; then echo "SKIP $ID (ya existe)"; continue; fi
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
echo "--- nuevos videos:"
ls -la "$OUT" | grep -E "V-01[9]|V-02[0-4]"
