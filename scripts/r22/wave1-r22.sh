#!/bin/bash
# Ronda 22 — rentry retry + notehub + cl1p + paste.ubuntu + gh-pages pulso.html + Discussion R22
R=/home/z/my-project/scripts/r22
RES="$R/results.tsv"
: > "$RES"
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"
TOKEN=$(cat /home/z/my-project/.ghtoken | tr -d '[:space:]')
add(){ printf '%s\t%s\t%s\t%s\t%s\n' "$1" "$2" "$3" "$4" "$5" >> "$RES"; }

echo "== 1) rentry.co (parse correcto) =="
B=$(curl -s -A "$UA" --max-time 25 -d "edit_code=vanguard-r22-x9" --data-urlencode "text=⚔️ VANGUARD v51.0 PULSO MUNDIAL — juego de guerra GRATIS en tu navegador. Intel REAL en vivo: satélite ISS (27.500 km/h), radar aéreo militar sobre Mar Negro, Oriente Medio y Taiwán, y señales espaciales. Sin descargas, sin registro.

👉 Juega: https://vanguard.world

Misión comunitaria: 300 enlaces compartidos. Recompensa: 5000 monedas + 50 gemas + 800 XP." https://rentry.co/ 2>/dev/null)
RU=$(echo "$B" | grep -oP 'https://rentry\.co/[a-z0-9]{4,}' | grep -v static | grep -v '.css\|.js\|theme' | head -1)
if [ -n "$RU" ]; then add rentry page "$RU" "$RU" "form"; else add rentry fail "" "" "$(echo "$B" | grep -oP 'rentry\.co/[a-z0-9]+' | head -3 | tr '\n' ' ')"; fi

echo "== 2) notehub.org =="
B=$(curl -s -i -A "$UA" --max-time 25 -H "Content-Type: text/plain" --data-binary "⚔️ VANGUARD v51.0 PULSO MUNDIAL — juego de guerra GRATIS en tu navegador. Satélite ISS en vivo + radar aéreo militar (Mar Negro, Oriente Medio, Taiwán) + señales espaciales reales. Sin descargas: https://vanguard.world — Misión 300 enlaces." https://notehub.org/api/v3/note 2>/dev/null)
LOC=$(echo "$B" | grep -i '^location:' | awk '{print $2}' | tr -d '\r' | head -1)
[ -n "$LOC" ] && LOC="https://notehub.org$LOC"
case "$LOC" in https://notehub.org/*) add notehub page "$LOC" "$LOC";; *) add notehub fail "" "" "$(echo "$B" | head -c 80)";; esac

echo "== 3) cl1p.net =="
curl -s -A "$UA" --max-time 25 -d "content=⚔️ VANGUARD v51.0 PULSO MUNDIAL — juego de guerra GRATIS en tu navegador. Satélite ISS en vivo + radar aéreo militar + señales espaciales. Juega: https://vanguard.world — Misión 300 enlaces." "https://cl1p.net/vanguard-ronda22" -o /dev/null 2>/dev/null
sleep 1
V=$(curl -s -A "$UA" --max-time 20 "https://cl1p.net/vanguard-ronda22" 2>/dev/null | grep -c "vanguard.world")
if [ "${V:-0}" -ge 1 ]; then add cl1p page "https://cl1p.net/vanguard-ronda22" "https://cl1p.net/vanguard-ronda22" "post"; else add cl1p fail "" "" "verify-$V"; fi

echo "== 4) paste.ubuntu.com (lodgeit) =="
python3 - > "$R/lod.json" <<'PYEOF'
import json
c = "VANGUARD v51.0 PULSO MUNDIAL — juego de guerra GRATIS en tu navegador. Satélite ISS en vivo (27.500 km/h), radar aéreo militar (Mar Negro, Oriente Medio, Taiwán) y señales espaciales reales. Sin descargas, sin registro: https://vanguard.world — Misión comunitaria 300 enlaces: 5000 monedas + 50 gemas + 800 XP."
print(json.dumps({"jsonrpc": "2.0", "method": "paste.create", "id": 1, "params": {"language": "text", "code": c, "private": False}}))
PYEOF
J=$(curl -s -A "$UA" --max-time 20 -H "Content-Type: application/json" --data-binary @"$R/lod.json" "https://paste.ubuntu.com/jsonrpc" 2>/dev/null | head -c 300)
ID=$(echo "$J" | grep -oP '"paste_id"\s*:\s*"\K[^"]+' | head -1)
if [ -n "$ID" ]; then add ubuntu-paste page "https://paste.ubuntu.com/p/$ID/read/" "https://paste.ubuntu.com/p/$ID/read/"; else add ubuntu-paste fail "" "" "$(echo $J | head -c 80)"; fi

echo "== 5) gh-pages pulso.html (v51 promo) =="
python3 - > "$R/page22.json" <<'PYEOF'
import base64, json
html = """<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>VANGUARD v51.0 — Satélite ISS y radar aéreo militar en vivo</title>
<meta name="description" content="Intel real en vivo en el juego de guerra gratuito: ISS, radar aéreo ADS-B, aviones militares y señales espaciales. Sin registros, sin API keys.">
</head><body style="font-family:sans-serif;background:#0a0e14;color:#e6edf3;max-width:640px;margin:0 auto;padding:24px">
<h1>🛰️ VANGUARD v51.0 — PULSO MUNDIAL</h1>
<p>La actualización con <b>inteligencia REAL en vivo</b>, integrada con APIs públicas gratuitas (sin claves):</p>
<ul>
<li>Satélite ISS en vivo: posición real, 417 km de altura, 27.500 km/h</li>
<li>Radar aéreo ADS-B: Mar Negro (frontera de la guerra — espacio aéreo ucraniano cerrado desde 2022), Oriente Medio y Estrecho de Taiwán</li>
<li>Aviones militares detectados por callsign y tipo, marcados en rojo</li>
<li>Señales espaciales: lanzamientos y satélites reales</li>
</ul>
<p><a href="https://vanguard.world" style="color:#4dd0ff;font-size:20px">👉 Juega gratis en vanguard.world</a></p>
<p>Ronda 22 de la misión comunitaria: meta 300 enlaces. Cada publicación cuenta.</p>
</body></html>"""
data = {"message": "Ronda 22 — pagina Pulso (v51 promo)", "content": base64.b64encode(html.encode()).decode(), "branch": "gh-pages"}
print(json.dumps(data))
PYEOF
J=$(curl -s --max-time 30 -X PUT -H "Authorization: Bearer $TOKEN" -H "Accept: application/vnd.github+json" --data-binary @"$R/page22.json" "https://api.github.com/repos/ElReyDelUniverso-0/VANGUARD/contents/pulso.html" 2>/dev/null)
[ -n "$(echo "$J" | grep -o '"sha"')" ] && add ghpages-pulso page "https://elreydeluniverso-0.github.io/VANGUARD/pulso.html" "https://elreydeluniverso-0.github.io/VANGUARD/pulso.html" "put-api" || add ghpages-pulso fail "" "" "$(echo $J | head -c 80)"

echo "== 6) GitHub Discussion Ronda 22 =="
python3 - "$TOKEN" > /dev/null <<'PYEOF'
import json, sys
tok = sys.argv[1]
body = ("Ronda 22 de difusion.\n\n"
        "🛰️ VANGUARD v51.0 PULSO MUNDIAL: intel REAL en vivo en el juego de guerra gratuito — satelite ISS, radar aereo militar "
        "(Mar Negro, Oriente Medio, Taiwan) y senales espaciales. Todo con APIs publicas gratuitas, sin claves.\n\n"
        "Juega: https://vanguard.world\n\nMision 300 enlaces: cada publicacion en un sitio nuevo cuenta.")
q = {"query": "mutation($input: CreateDiscussionInput!) { createDiscussion(input: $input) { discussion { url } } }",
     "variables": {"input": {"repositoryId": "R_kgDOUYlUjA", "categoryId": "DIC_kwDOUYlUjM4DGUTg",
                             "title": "Ronda 22 — satélite y radar militar en vivo", "body": body}}}
open('/home/z/my-project/scripts/r22/disc.json', 'w').write(json.dumps(q))
PYEOF
J=$(curl -s --max-time 30 -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" --data-binary @"$R/disc.json" https://api.github.com/graphql 2>/dev/null)
U=$(echo "$J" | grep -oP 'https://github\.com/[^"]*/discussions/[0-9]+' | head -1)
if [ -n "$U" ]; then add gh-discussion-r22 page "$U" "$U" "graphql"; else add gh-discussion-r22 fail "" "" "$(echo $J | head -c 120)"; fi

echo "---- RESULTADOS R22 ----"
cat "$RES"
