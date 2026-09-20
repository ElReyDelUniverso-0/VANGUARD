#!/bin/bash
# Vanguard v5: GLOBALVISION video thumbnails (broadcast/TV-news style stills, 16:9)
set -u
OUT=/home/z/my-project/public/assets/tv
mkdir -p "$OUT"

gen() {
  local prompt="$1"; local out="$2"
  if [ -s "$out" ]; then echo "SKIP $out"; return; fi
  z-ai image -p "$prompt" -o "$out" -s "1344x768" && echo "OK $out" || echo "FAIL $out"
}

# ============ GLOBALVISION VIDEO THUMBNAILS (broadcast documentary style) ============
gen "Television broadcast still of massive military parade with tanks and missile launchers moving down grand avenue, crowds waving flags, news camera wide shot, dramatic evening light, documentary broadcast frame" "$OUT/parade.png"
gen "News footage still of rocket launch at night, bright exhaust plume lighting up launch pad, television broadcast frame with dramatic orange glow, distant silo, documentary style" "$OUT/rocket-launch.png"
gen "Television news still of diplomatic summit hall with long table and many national flags behind delegates, wide broadcast camera shot, formal lighting, documentary frame" "$OUT/summit.png"
gen "Broadcast footage of naval fleet exercise at sea, aircraft carrier and destroyers in formation seen from helicopter camera, ocean spray, news documentary frame, overcast sky" "$OUT/fleet.png"
gen "Television documentary still of massive city skyline at dusk with anti-aircraft searchlight beams crossing the sky, broadcast camera wide shot, cinematic amber tones" "$OUT/city-skyline.png"
gen "News broadcast still of border wall construction with cranes and concrete segments, workers and vehicles, television documentary camera shot, dusty daylight" "$OUT/border-wall.png"
gen "Television footage of huge protest crowd filling city square with banners and smoke flares, elevated news camera angle, dramatic dusk light, broadcast documentary frame" "$OUT/protest.png"
gen "Broadcast still of drone swarm flying in formation over desert test range at golden hour, television documentary camera, dramatic sky, military technology demonstration" "$OUT/drone-swarm.png"

echo "ALL_DONE"
