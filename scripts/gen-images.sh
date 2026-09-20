#!/bin/bash
# Vanguard asset generation: OSINT gallery photos + CCTV devastation feeds
set -u
OUT=/home/z/my-project/public/assets
mkdir -p "$OUT/osint" "$OUT/cctv"

gen() {
  local prompt="$1"; local out="$2"; local size="$3"
  if [ -s "$out" ]; then echo "SKIP $out"; return; fi
  z-ai image -p "$prompt" -o "$out" -s "$size" && echo "OK $out" || echo "FAIL $out"
}

# ============ OSINT GALLERY (aerial/satellite recon style, 1152x864) ============
gen "Aerial surveillance photograph of destroyed electrical substation in winter landscape, smoke rising from transformers, drone reconaissance view, grey overcast sky, high resolution military satellite imagery, muted desaturated colors, documentary style" "$OUT/osint/ukraine-substation.png" "1152x864"
gen "Aerial view of trench network in snowy battlefield, drone surveillance photo, military fortifications and craters in frozen farmland, grey winter light, high detail reconaissance imagery" "$OUT/osint/ukraine-trench.png" "1152x864"
gen "Aerial drone photograph of destroyed residential buildings in dense urban district, collapsed concrete structures, rubble and dust, reconnaissance imagery, desaturated colors, documentary evidence photo" "$OUT/osint/gaza-urban.png" "1152x864"
gen "Aerial photograph of humanitarian aid convoy trucks lined on desert road, surveillance view from above, sand colored trucks in queue, dusty landscape, reconaissance imagery" "$OUT/osint/gaza-convoy.png" "1152x864"
gen "Aerial surveillance photo of burning oil refinery tanks at night, orange flames and thick black smoke columns, reconaissance drone imagery, dark industrial landscape" "$OUT/osint/refinery-fire.png" "1152x864"
gen "Satellite reconaissance view of dam reservoir and river delta, strategic infrastructure from above, blue water engineering structures, satellite imagery style" "$OUT/osint/infra-dam.png" "1152x864"
gen "Aerial photo of military naval destroyer ship at sea, surveillance aircraft view, grey warship wake in dark ocean, overcast, military reconaissance imagery" "$OUT/osint/naval-ship.png" "1152x864"
gen "Drone photograph of border wall checkpoint at dusk with watchtower, surveillance view of desert frontier, vehicles queued at gate, reconaissance imagery, muted tones" "$OUT/osint/border-check.png" "1152x864"
gen "Aerial view of refugee camp with rows of white tents, humanitarian surveillance photo, dusty plain, drone reconaissance imagery, documentary style" "$OUT/osint/refugee-camp.png" "1152x864"
gen "Aerial photo of destroyed bridge collapsed over river, war damage from above, broken concrete spans in water, reconaissance drone imagery, grey muted colors" "$OUT/osint/bridge-collapsed.png" "1152x864"
gen "Surveillance aircraft photo of fighter jet in flight seen from above, military aircraft on patrol, clouds below, aerial reconaissance imagery" "$OUT/osint/jet-patrol.png" "1152x864"
gen "Night vision aerial photo of military vehicle convoy moving on desert highway, green tinted night surveillance imagery, headlights in darkness, drone reconaissance" "$OUT/osint/night-convoy.png" "1152x864"

# ============ CCTV FEEDS (security camera devastation footage, 1344x768) ============
gen "Security CCTV camera footage of destroyed city street with collapsed buildings and smoke, wide angle surveillance view from above pole, grainy camera footage, desaturated war zone, slight fisheye distortion" "$OUT/cctv/street-devastation.png" "1344x768"
gen "CCTV surveillance footage of burning warehouse with fire and thick smoke at night, security camera wide angle view, grainy low light footage, industrial zone" "$OUT/cctv/warehouse-fire.png" "1344x768"
gen "Security camera view of crater on highway road after explosion, CCTV wide angle from pole, damaged asphalt and debris, grainy surveillance footage, daylight" "$OUT/cctv/road-crater.png" "1344x768"
gen "CCTV night vision green tinted footage of urban street with abandoned burning vehicles, security surveillance camera view, grainy infrared image, city at war" "$OUT/cctv/night-street.png" "1344x768"
gen "Security camera footage of damaged harbor dock with cranes and smoke over water, CCTV surveillance wide view, grainy industrial port, overcast day" "$OUT/cctv/harbor-smoke.png" "1344x768"
gen "CCTV surveillance footage of military tanks column moving through main square of city, wide angle security camera from building, grainy footage, grey sky" "$OUT/cctv/tanks-square.png" "1344x768"
gen "Security camera view of bridge with collapsed section over canal, CCTV from riverside pole, wide angle surveillance, grainy footage, dusk light" "$OUT/cctv/bridge-cctv.png" "1344x768"
gen "CCTV footage of border crossing gate with sandbags and guard post, surveillance camera wide angle, desert frontier, grainy daylight footage" "$OUT/cctv/border-cctv.png" "1344x768"
gen "Security camera view of power plant cooling towers with smoke damage, CCTV surveillance grainy footage, industrial zone at dawn, wide angle from fence" "$OUT/cctv/power-plant.png" "1344x768"
gen "CCTV infrared night vision footage of convoy trucks passing checkpoint barrier, green tinted surveillance image, grainy security camera, night" "$OUT/cctv/checkpoint-night.png" "1344x768"

echo "ALL_DONE"
