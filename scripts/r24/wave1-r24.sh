#!/bin/bash
# Ronda 24 — Wave A: 2 paginas gh-pages nuevas + Issue + Discussion | Wave B: 5 pastes nuevos
R=/home/z/my-project/scripts/r24
P="$R/promo-r24.txt"
RES="$R/results.tsv"
: > "$RES"
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"
TOKEN=$(cat /home/z/my-project/.ghtoken | tr -d '[:space:]')
add(){ printf '%s\t%s\t%s\t%s\t%s\n' "$1" "$2" "$3" "$4" "$5" >> "$RES"; }

echo "== A1) gh-pages mision-300.html =="
python3 - > "$R/pagemision.json" <<PYEOF
import base64, json
html = """<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Misión 300 enlaces — toda la comunidad gana | VANGUARD</title>
<meta name="description" content="Misión comunitaria de VANGUARD: al llegar a 300 enlaces compartidos, todos los jugadores ganan 5000 monedas, 50 gemas y 800 XP.">
</head><body style="font-family:sans-serif;background:#0a0e14;color:#e6edf3;max-width:640px;margin:0 auto;padding:24px">
<h1>🎁 MISIÓN 300 — VANGUARD</h1>
<p>VANGUARD es un juego de guerra GRATIS que corre en tu navegador: mapa 3D del mundo real, mercado bursátil en vivo, radar de aviones militares reales, detective multijugador y mucho más. Sin descargas, sin registro.</p>
<h2>La misión</h2>
<p>Cuando la comunidad comparta <b>300 enlaces</b> del juego en sitios distintos, TODOS los jugadores reciben:</p>
<ul>
<li>💰 5000 monedas</li>
<li>💎 50 gemas</li>
<li>⭐ 800 XP</li>
</ul>
<h2>Cómo ayudas</h2>
<ul>
<li>Comparte https://vanguard.world en un sitio nuevo (foro, paste, red social, blog)</li>
<li>Cada sitio distinto cuenta una vez</li>
<li>Tu código de invitado VGD-AGENTE paga +100 monedas por cada 3 invitados</li>
</ul>
<p><a href="https://vanguard.world" style="color:#ffd54f;font-size:20px">👉 Jugar gratis en vanguard.world</a></p>
</body></html>"""
data = {"message": "Ronda 24 — pagina mision 300", "content": base64.b64encode(html.encode()).decode(), "branch": "gh-pages"}
print(json.dumps(data))
PYEOF
J=$(curl -s --max-time 30 -X PUT -H "Authorization: Bearer $TOKEN" -H "Accept: application/vnd.github+json" --data-binary @"$R/pagemision.json" "https://api.github.com/repos/ElReyDelUniverso-0/VANGUARD/contents/mision-300.html" 2>/dev/null)
[ -n "$(echo "$J" | grep -o '"sha"')" ] && add ghpages-mision page "https://elreydeluniverso-0.github.io/VANGUARD/mision-300.html" "https://elreydeluniverso-0.github.io/VANGUARD/mision-300.html" || add ghpages-mision fail "" "" "$(echo $J | head -c 100)"

echo "== A2) gh-pages juega-ya.html =="
python3 - > "$R/pagejuega.json" <<PYEOF
import base64, json
html = """<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Juega YA — juego de guerra gratis en tu navegador | VANGUARD</title>
<meta name="description" content="Entra y juega en 10 segundos: mapa 3D del mundo real, radar militar en vivo, mercado bursátil y detective multijugador. Gratis, sin registro.">
</head><body style="font-family:sans-serif;background:#0a0e14;color:#e6edf3;max-width:640px;margin:0 auto;padding:24px;text-align:center">
<h1>⚔️ JUEGA YA</h1>
<p style="font-size:18px">Juego de guerra GRATIS en tu navegador.<br>Sin descargas · Sin registro · Entras y juegas en 10 segundos</p>
<p style="font-size:18px">🗺️ Mapa 3D del mundo real — 24 territorios<br>🛰️ ISS y radar militar EN VIVO<br>📈 Mercado bursátil y apuestas<br>🕵️ Detective multijugador con engaños y juicio<br>🚁 Minijuegos 3D de drones</p>
<p><a href="https://vanguard.world" style="color:#4dd0ff;font-size:24px">👉 ENTRAR A VANGUARD.WORLD</a></p>
<p style="color:#9aa7b3">Gratis para siempre · Funciona en el móvil</p>
</body></html>"""
data = {"message": "Ronda 24 — pagina juega ya", "content": base64.b64encode(html.encode()).decode(), "branch": "gh-pages"}
print(json.dumps(data))
PYEOF
J=$(curl -s --max-time 30 -X PUT -H "Authorization: Bearer $TOKEN" -H "Accept: application/vnd.github+json" --data-binary @"$R/pagejuega.json" "https://api.github.com/repos/ElReyDelUniverso-0/VANGUARD/contents/juega-ya.html" 2>/dev/null)
[ -n "$(echo "$J" | grep -o '"sha"')" ] && add ghpages-juega page "https://elreydeluniverso-0.github.io/VANGUARD/juega-ya.html" "https://elreydeluniverso-0.github.io/VANGUARD/juega-ya.html" || add ghpages-juega fail "" "" "$(echo $J | head -c 100)"

echo "== A3) Issue Ronda 24 =="
python3 - > "$R/issue24.json" <<'PYEOF'
import json
body = ("Ronda 24 de difusion de la comunidad.\n\n"
        "Progreso: 261/300 enlaces (87%). Recompensa al llegar: 5000 monedas + 50 gemas + 800 XP para todos.\n\n"
        "Paginas nuevas de esta ronda:\n"
        "- mision-300.html: la mision comunitaria explicada\n"
        "- juega-ya.html: landing directa para nuevos jugadores\n\n"
        "Juega gratis: https://vanguard.world")
print(json.dumps({"title": "Ronda 24 — 87% de la mision 300", "body": body}))
PYEOF
J=$(curl -s --max-time 30 -X POST -H "Authorization: Bearer $TOKEN" -H "Accept: application/vnd.github+json" --data-binary @"$R/issue24.json" https://api.github.com/repos/ElReyDelUniverso-0/VANGUARD/issues 2>/dev/null)
IU=$(echo "$J" | grep -oP '"html_url"\s*:\s*"\K[^"]*issues/[0-9]+' | head -1)
[ -n "$IU" ] && add gh-issue-r24 page "$IU" "$IU" || add gh-issue-r24 fail "" "" "$(echo $J | head -c 100)"

echo "== A4) Discussion Ronda 24 =="
python3 - "$TOKEN" > "$R/disc24.json" <<'PYEOF'
import json, sys
tok = sys.argv[1]
body = ("Ronda 24 de difusion de la comunidad.\n\n"
        "Vamos 261/300 enlaces (87%). Al llegar a 300: 5000 monedas + 50 gemas + 800 XP para TODOS.\n\n"
        "Paginas nuevas:\n"
        "- Mision 300 explicada: elreydeluniverso-0.github.io/VANGUARD/mision-300.html\n"
        "- Landing juega-ya: elreydeluniverso-0.github.io/VANGUARD/juega-ya.html\n"
        "- Radar militar en vivo: Mar Negro, Oriente Medio, Taiwan\n"
        "- ISS en vivo + ESCANEA (+5 monedas cada 60s)\n\n"
        "Juega gratis, sin registro: https://vanguard.world")
q = {"query": "mutation($input: CreateDiscussionInput!) { createDiscussion(input: $input) { discussion { url } } }",
     "variables": {"input": {"repositoryId": "R_kgDOUYlUjA", "categoryId": "DIC_kwDOUYlUjM4DGUTg", "title": "🎁 Ronda 24 — 87% de la mision 300 enlaces", "body": body}}}
print(json.dumps(q))
PYEOF
J=$(curl -s --max-time 30 -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" --data-binary @"$R/disc24.json" https://api.github.com/graphql 2>/dev/null)
U=$(echo "$J" | grep -oP 'https://github\.com/[^"]*/discussions/[0-9]+' | head -1)
[ -n "$U" ] && add gh-discussion-r24 page "$U" "$U" || add gh-discussion-r24 fail "" "" "$(echo $J | head -c 120)"

echo "== B1) hedgedoc.envs.net (nuevo ID) =="
LOC=$(curl -s -A "$UA" --max-time 25 -H "Content-Type: text/plain" --data-binary @"$P" -o /dev/null -w '%{redirect_url}' "https://hedgedoc.envs.net/new" 2>/dev/null)
case "$LOC" in https://hedgedoc.envs.net/*) add hedgedoc-r24 page "$LOC" "${LOC}/download";; *) add hedgedoc-r24 fail "" "" "$(echo $LOC | head -c 60)";; esac

echo "== B2) pad.nixnet.services (nuevo ID) =="
LOC=$(curl -s -A "$UA" --max-time 25 -H "Content-Type: text/plain" --data-binary @"$P" -o /dev/null -w '%{redirect_url}' "https://pad.nixnet.services/new" 2>/dev/null)
case "$LOC" in https://pad.nixnet.services/*) add nixnet-r24 page "$LOC" "${LOC}/download";; *) add nixnet-r24 fail "" "" "$(echo $LOC | head -c 60)";; esac

echo "== B3) x0.at (nuevo ID) =="
U=$(curl -s -A "$UA" --max-time 30 -F "file=@$P;type=text/plain" https://x0.at 2>/dev/null | head -c 200 | tr -d '[:space:]')
case "$U" in https://x0.at/*|http://x0.at/*) add x0at-r24 page "$U" "$U";; *) add x0at-r24 fail "" "" "$U";; esac

echo "== B4) paste.rs (nuevo ID) =="
U=$(curl -s --max-time 25 --data-binary @"$P" https://paste.rs 2>/dev/null | head -c 200 | tr -d '[:space:]')
case "$U" in https://paste.rs/*) add pasters-r24 page "$U" "$U";; *) add pasters-r24 fail "" "" "$U";; esac

echo "== B5) hst.sh (nuevo ID) =="
python3 -c "
import json
print(json.dumps({'content': open('/home/z/my-project/scripts/r24/promo-r24.txt').read()}))
" > "$R/hst24.json"
J=$(curl -s -A "$UA" --max-time 25 -H "Content-Type: application/json" --data-binary @"$R/hst24.json" https://hst.sh/documents 2>/dev/null | head -c 200)
K=$(echo "$J" | grep -oP '"key"\s*:\s*"\K[^"]+' | head -1)
[ -n "$K" ] && add hstsh-r24 page "https://hst.sh/$K" "https://hst.sh/raw/$K" || add hstsh-r24 fail "" "" "$(echo $J | head -c 80)"

echo "---- RESULTADOS WAVE A+B ----"
cat "$RES"
