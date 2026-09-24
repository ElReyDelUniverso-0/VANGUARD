#!/bin/bash
# Ronda 21 — verificación estricta + issue v51.0
R=/home/z/my-project/scripts/r21
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"
TOKEN=$(cat /home/z/my-project/.ghtoken | tr -d '[:space:]')
OUT="$R/verified.tsv"; : > "$OUT"

echo "== Issue #10 (v51.0) =="
python3 - > "$R/issue10.json" <<'PYEOF'
import json
body = ("Novedades v51.0 PULSO MUNDIAL (intel real en vivo, sin API keys):\n\n"
        "- Satelite ISS en vivo: posicion, altitud y velocidad reales (~27.500 km/h)\n"
        "- Radar aereo en vivo sobre 3 zonas calientes: Mar Negro (frontera de la guerra), Oriente Medio y Estrecho de Taiwan\n"
        "- Deteccion de aviones militares por callsign y tipo\n"
        "- Senales espaciales: lanzamientos y satelites (fuente real)\n"
        "- ESCANEAR: +5 monedas cada 60s\n\n"
        "Ronda 21 de difusion — mision comunitaria 300 enlaces.\n\nJuega gratis: https://vanguard.world")
print(json.dumps({"title": "v51.0 PULSO MUNDIAL — intel real en vivo (Ronda 21)", "body": body}))
PYEOF
J=$(curl -s --max-time 30 -X POST -H "Authorization: Bearer $TOKEN" -H "Accept: application/vnd.github+json" --data-binary @"$R/issue10.json" https://api.github.com/repos/ElReyDelUniverso-0/VANGUARD/issues 2>/dev/null)
IU=$(echo "$J" | grep -oP '"html_url"\s*:\s*"\K[^"]*issues/[0-9]+' | head -1)
echo "issue: $IU"

verifica(){
  local N="$1" P="$2"
  C=$(curl -sL -A "$UA" --max-time 30 -o /tmp/v21body -w '%{http_code}' "$P" 2>/dev/null)
  if [ "$C" = "200" ] && grep -q "vanguard.world" /tmp/v21body 2>/dev/null; then
    printf '%s\tOK\t%s\n' "$N" "$P" >> "$OUT"; echo "✅ $N"
  else
    printf '%s\tFAIL\t%s\n' "$N" "$P" >> "$OUT"; echo "❌ $N (http-$C)"
  fi
}

verifica ghpages-ronda21 "https://elreydeluniverso-0.github.io/VANGUARD/ronda21.html"
[ -n "$IU" ] && verifica gh-issue-10 "$IU"
verifica gh-discussion-r21 "https://github.com/ElReyDelUniverso-0/VANGUARD/discussions/9"

echo "---- VERIFICADOS R21 ----"
cat "$OUT"
