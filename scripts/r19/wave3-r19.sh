#!/bin/bash
# VANGUARD — Ronda 19 OLA 3: correcciones (spoo.me http, pastemyst pasties,
# telegraph debug), nuevos intentos (shrtco.de, paste.c-net.org), verificación
# Wayback real + Pages github.io.
T="$(cat /home/z/my-project/.ghtoken)"
B="https://vanguard.world"
LOG=/home/z/my-project/scripts/r19/wave3.log
echo "=== R19 WAVE 3 $(date -u +"%Y-%m-%dT%H:%M:%SZ") ===" > "$LOG"
q() { python3 -c "import json,sys;print(json.load(sys.stdin).get('$1',''))" 2>/dev/null; }

# ---------- spoo.me ×2 (ya creados en wave2; verificar que resuelven) ----------
for u in "http://spoo.me/QjRqY7" "http://spoo.me/Owqbt0"; do
  L=$(curl -s -o /dev/null -w "%{http_code} %{redirect_url}" --max-time 15 "$u")
  case "$L" in *"vanguard.world"*) echo "[OK] spoo-verify $u → $L" >> "$LOG";; *) echo "[ERR] spoo-verify $u ($L)" >> "$LOG";; esac
done
# uno nuevo por si acaso
U=$(curl -s --max-time 15 -X POST https://spoo.me/ -H "Accept: application/json" -d "url=$B/?ref=VGD-R19-s3" | q short_url)
case "$U" in *spoo.me/*) echo "[OK] spoo-r19-3 → $U" >> "$LOG";; *) echo "[ERR] spoo-r19-3 ($U)" >> "$LOG";; esac

# ---------- pastemyst con formato correcto (pasties) ----------
R=$(curl -s --max-time 20 -X POST "https://paste.myst.rs/api/v2/paste" -H "Content-Type: application/json" \
  --data "$(python3 -c "import json;print(json.dumps({'title':'VANGUARD v50 RED GLOBAL','pasties':[{'language':'plaintext','code':'VANGUARD — juego de guerra mundial gratuito en el navegador, sin registro ni descargas. Misión 300 enlaces: 5.000 monedas + 50 gemas para todos. 83 secciones que pagan monedas, noticias en vivo, multijugador, mapa 3D. https://vanguard.world'}]}))")")
P=$(echo "$R" | q id)
[ -n "$P" ] && echo "[OK] pastemyst → https://paste.myst.rs/$P" >> "$LOG" || echo "[ERR] pastemyst: $(echo "$R" | head -c 100)" >> "$LOG"

# ---------- Telegraph: debug cuenta ----------
ls -la /tmp/tg19acc.json >> "$LOG" 2>&1
TOK=$(python3 -c "import json;d=json.load(open('/tmp/tg19acc.json'));print(d.get('result',{}).get('access_token',''))" 2>/dev/null)
if [ -z "$TOK" ]; then
  curl -s --max-time 20 "https://api.telegra.ph/createAccount?short_name=VANGUARD&author_name=VanguardPress" > /tmp/tg19acc.json
  TOK=$(python3 -c "import json;d=json.load(open('/tmp/tg19acc.json'));print(d.get('result',{}).get('access_token',''))" 2>/dev/null)
fi
echo "telegraph-token-len: ${#TOK}" >> "$LOG"
tgpost() { # $1 título, $2 texto → escribe URL en stdout
  local FILE=/tmp/r19_tg_$$.json
  python3 - "$1" "$2" "$TOK" > "$FILE" <<'PYEOF'
import json, sys
title, text, tok = sys.argv[1], sys.argv[2], sys.argv[3]
print(json.dumps({"access_token": tok, "title": title, "author_name": "VanguardPress",
                  "content": [{"tag": "p", "children": [text]}], "return_content": False}))
PYEOF
  curl -s --max-time 25 -X POST "https://api.telegra.ph/createPage" -H "Content-Type: application/json" --data @"$FILE" \
    | python3 -c "import json,sys;d=json.load(sys.stdin);print((d.get('result') or {}).get('url') or ('ERR:'+str(d)[:100]))" 2>/dev/null
  rm -f "$FILE"
}
U=$(tgpost "VANGUARD v50 RED GLOBAL — misión 300 enlaces (ES)" "El juego de guerra mundial GRATIS en tu navegador superó los 200 enlaces publicados por la comunidad. Nueva misión: 300 enlaces = 5.000 monedas + 50 gemas para TODOS. Explorador de 83 secciones que paga, noticias en vivo de 5 fuentes, mapa 3D, multijugador. JUEGA: https://vanguard.world")
case "$U" in https://telegra.ph/*) echo "[OK] telegraph-es → $U" >> "$LOG";; *) echo "[ERR] telegraph-es ($U)" >> "$LOG";; esac
U=$(tgpost "VANGUARD v50 GLOBAL NETWORK — 300-link mission (EN)" "The free browser world-war strategy game passed 200 community links. New mission: 300 = 5,000 coins + 50 gems for EVERYONE. 83-section explorer that pays coins, live news from 5 sources, 3D globe, multiplayer. PLAY: https://vanguard.world")
case "$U" in https://telegra.ph/*) echo "[OK] telegraph-en → $U" >> "$LOG";; *) echo "[ERR] telegraph-en ($U)" >> "$LOG";; esac

# ---------- shrtco.de ----------
R=$(curl -s --max-time 20 -X POST "https://api.shrtco.de/v2/shorten?url=$(python3 -c "import urllib.parse;print(urllib.parse.quote('$B/?ref=VGD-R19-sh1',safe=''))")")
U=$(echo "$R" | python3 -c "import json,sys;d=json.load(sys.stdin);print((d.get('result') or {}).get('full_short_link',''))" 2>/dev/null)
case "$U" in *shrtco.de/*) echo "[OK] shrtcode → $U" >> "$LOG";; *) echo "[ERR] shrtcode: $(echo "$R" | head -c 80)" >> "$LOG";; esac

# ---------- paste.c-net.org ----------
U=$(curl -s --max-time 20 -X POST "https://paste.c-net.org/" --data-binary "VANGUARD v50 RED GLOBAL — free browser war game. Mission 300 links: 5,000 coins + 50 gems for everyone. 83 sections, live news, multiplayer, 3D globe. https://vanguard.world" -w "%{redirect_url}")
case "$U" in *paste.c-net.org*) echo "[OK] cnet → $U" >> "$LOG";; *) echo "[ERR] cnet ($U)" >> "$LOG";; esac

# ---------- Wayback: verificar snapshot real de hoy ----------
for tgt in "$B" "$B/guerra-hoy"; do
  U=$(curl -s -o /dev/null -w "%{http_code} %{redirect_url}" --max-time 40 "https://web.archive.org/web/2/$tgt")
  TS=$(echo "$U" | grep -o "web.archive.org/web/[0-9]*" | head -1 | grep -o "[0-9]\{14\}")
  echo "$U" | grep -q "^200" && [ -n "$TS" ] && echo "[OK] wayback-snapshot $tgt → ts=$TS" >> "$LOG" || echo "[ERR] wayback-snapshot $tgt ($U)" >> "$LOG"
done

# ---------- Pages github.io mision300 (build tarda ~1 min) ----------
C=$(curl -s -o /tmp/r19_pg.html -w "%{http_code}" --max-time 20 "https://elreydeluniverso-0.github.io/VANGUARD/mision300.html")
grep -qi "vanguard.world" /tmp/r19_pg.html 2>/dev/null && [ "$C" = "200" ] && echo "[OK] pages-m300-live HTTP $C" >> "$LOG" || echo "[PENDING] pages-m300-live HTTP $C (re-verificar en verify final)" >> "$LOG"

echo "=== R19 WAVE 3 FIN ===" >> "$LOG"
cat "$LOG"
