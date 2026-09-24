#!/bin/bash
# Ronda 20 — Wave H: top-ups con recetas probadas de R19 (nueva pagina/URL en plataforma conocida)
R=/home/z/my-project/scripts/r20
P="$R/promo-r20.txt"
RES="$R/resultsH.tsv"
: > "$RES"
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"
VW="https://vanguard.world"
add(){ printf '%s\t%s\t%s\t%s\t%s\n' "$1" "$2" "$3" "$4" "$5" >> "$RES"; }

echo "== H1/H2) telegra.ph cuenta nueva + 2 paginas (JSON) =="
ACC=$(curl -s --max-time 25 -H "Content-Type: application/json" -d '{"short_name":"VanguardR20","author_name":"VANGUARD Mision 300","author_url":"https://vanguard.world"}' https://api.telegraph.org/createAccount 2>/dev/null)
TK=$(echo "$ACC" | grep -oP '"access_token"\s*:\s*"\K[^"]+' | head -1)
echo "token: ${TK:0:8}..."
if [ -n "$TK" ]; then
  printf '{"access_token":"%s"}' "$TK" > /tmp/tg20acc.json
  for LANG in es en; do
    python3 - "$TK" "$LANG" <<'PYEOF'
import json, sys
tk, lang = sys.argv[1], sys.argv[2]
title = "VANGUARD — Juego de guerra GRATIS en tu navegador" if lang == "es" else "VANGUARD — Free browser war game"
if lang == "es":
    content = [
        {"tag":"p","children":["⚔️ VANGUARD es un juego de guerra GRATIS que corre directo en tu navegador. Sin descargas, sin registro: entras y juegas en 10 segundos."]},
        {"tag":"p","children":["🌍 Mapa 3D del mundo real con 24 territorios, mercado bursátil en vivo, apuestas deportivas, detective multijugador con engaños y juicio, minijuegos 3D de drones, conquistas históricas explicadas en 3D y mucho más."]},
        {"tag":"p","children":["🎁 Misión comunitaria: cada enlace compartido suma. Al llegar a la meta de 300 enlaces toda la comunidad gana 5000 monedas + 50 gemas + 800 XP."]},
        {"tag":"p","children":["👉 Juega ahora: https://vanguard.world"]}
    ]
else:
    content = [
        {"tag":"p","children":["⚔️ VANGUARD is a FREE browser war game. No downloads, no signup — start playing in 10 seconds."]},
        {"tag":"p","children":["🌍 Real-world 3D globe, live stock market, sports betting, multiplayer detective with deception, 3D drone minigame and more."]},
        {"tag":"p","children":["👉 Play now: https://vanguard.world"]}
    ]
print(json.dumps({"access_token": tk, "title": title, "author_name": "VANGUARD", "author_url": "https://vanguard.world", "content": content, "return_content": False}))
PYEOF
    J=$(curl -s --max-time 25 -H "Content-Type: application/json" --data-binary @- https://api.telegraph.org/createPage < "$R/tg-$LANG.json" 2>/dev/null)
    :
  done 2>/dev/null
  # (rehacer con archivos por idioma)
  for LANG in es en; do
    if [ -f "/tmp/tg20_$LANG.out" ]; then U=$(grep -oP '"url"\s*:\s*"\Khttps://telegra\.ph/[^"]+' /tmp/tg20_$LANG.out | head -1); fi
    :
  done
else
  add telegra.ph fail "" "" "$(echo $ACC | head -c 100)"
fi

# telegra.ph: bucle limpio
if [ -n "$TK" ]; then
  for LANG in es en; do
    python3 - "$TK" "$LANG" > "$R/tg-$LANG.json" <<'PYEOF'
import json, sys
tk, lang = sys.argv[1], sys.argv[2]
if lang == "es":
    title = "VANGUARD — Juego de guerra GRATIS en tu navegador"
    content = [
        {"tag":"p","children":["⚔️ VANGUARD es un juego de guerra GRATIS que corre directo en tu navegador. Sin descargas, sin registro: entras y juegas en 10 segundos."]},
        {"tag":"p","children":["🌍 Mapa 3D del mundo real con 24 territorios, mercado bursátil en vivo, apuestas deportivas, detective multijugador con engaños y juicio, minijuegos 3D de drones y conquistas históricas en 3D."]},
        {"tag":"p","children":["🎁 Misión comunitaria: cada enlace compartido suma. Al llegar a 300 enlaces toda la comunidad gana 5000 monedas + 50 gemas + 800 XP."]},
        {"tag":"p","children":["👉 Juega ahora: https://vanguard.world"]}
    ]
else:
    title = "VANGUARD — Free browser war game"
    content = [
        {"tag":"p","children":["⚔️ VANGUARD is a FREE browser war game. No downloads, no signup — start playing in 10 seconds."]},
        {"tag":"p","children":["🌍 Real-world 3D globe, live stock market, sports betting, multiplayer detective with deception, 3D drone minigame."]},
        {"tag":"p","children":["👉 Play now: https://vanguard.world"]}
    ]
print(json.dumps({"access_token": tk, "title": title, "author_name": "VANGUARD", "author_url": "https://vanguard.world", "content": content, "return_content": False}))
PYEOF
    J=$(curl -s --max-time 25 -H "Content-Type: application/json" --data-binary @"$R/tg-$LANG.json" https://api.telegraph.org/createPage 2>/dev/null)
    U=$(echo "$J" | grep -oP '"url"\s*:\s*"\Khttps://telegra\.ph/[^"]+' | head -1)
    if [ -n "$U" ]; then add "telegra.ph-$LANG" page "$U" "$U" "json"; else add "telegra.ph-$LANG" fail "" "" "$(echo $J | head -c 100)"; fi
  done
fi

echo "== H3) paste.rs =="
U=$(curl -s --max-time 25 --data-binary @"$P" https://paste.rs 2>/dev/null | head -c 200 | tr -d '[:space:]')
case "$U" in https://paste.rs/*) add paste.rs page "$U" "$U";; *) add paste.rs fail "" "" "$U";; esac

echo "== H4) hst.sh =="
python3 -c "
import json
print(json.dumps({'content': open('/home/z/my-project/scripts/r20/promo-r20.txt').read()}))
" > "$R/hst.json"
J=$(curl -s -A "$UA" --max-time 25 -H "Content-Type: application/json" --data-binary @"$R/hst.json" https://hst.sh/documents 2>/dev/null | head -c 200)
K=$(echo "$J" | grep -oP '"key"\s*:\s*"\K[^"]+' | head -1)
if [ -n "$K" ]; then add hst.sh page "https://hst.sh/$K" "https://hst.sh/raw/$K" "haste"; else add hst.sh fail "" "" "$(echo $J | head -c 80)"; fi

echo "== H5) paste.c-net.org =="
U=$(curl -s -A "$UA" --max-time 25 --data-binary @"$P" https://paste.c-net.org/ 2>/dev/null | head -c 200 | tr -d '[:space:]')
case "$U" in https://paste.c-net.org/*) add paste.c-net page "$U" "$U";; *) add paste.c-net fail "" "" "$U";; esac

echo "== H6) clck.ru =="
U=$(curl -s -A "$UA" --max-time 20 "https://clck.ru/--?url=$VW" 2>/dev/null | head -c 200 | tr -d '[:space:]')
case "$U" in https://clck.ru/*) add clck.ru short "$U" "$U";; *) add clck.ru fail "" "" "$U";; esac

echo "== H7) spoo.me =="
J=$(curl -s -A "$UA" --max-time 20 -H "Accept: application/json" -d "url=$VW" https://spoo.me/ 2>/dev/null | head -c 300)
S=$(echo "$J" | grep -oP '"short_url"\s*:\s*"\K[^"]+' | head -1 | sed 's|^http://|https://|')
if [ -n "$S" ]; then add spoo.me short "$S" "$S"; else add spoo.me fail "" "" "$(echo $J | head -c 80)"; fi

echo "---- RESULTADOS H ----"
cat "$RES"
