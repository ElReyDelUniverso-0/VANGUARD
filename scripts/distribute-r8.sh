#!/bin/bash
# VANGUARD v42.2 — RONDA 8: LISTA "8 cosas gratis que puedes hacer HOY"
# Canales verificados r1-r7 (incluye TotalPing recuperado con -L).
# Solo cuenta 2xx/3xx con confirmación real del servicio.
BASE="https://vanguard-kq9r.vercel.app"
LOG=/home/z/my-project/scripts/campaign-results.txt
echo "=== RONDA 8 $(date -u +"%Y-%m-%dT%H:%M:%SZ") ===" >> "$LOG"

# 1) Telegraph: cuenta anónima nueva — ángulo lista
TA=$(curl -s --max-time 25 "https://api.telegra.ph/createAccount?short_name=vanguardops&author_name=VANGUARD" -o /tmp/tg8acc.json -w "%{http_code}")
TOK=$(python3 -c "import json;d=json.load(open('/tmp/tg8acc.json'));print(d.get('result',{}).get('access_token',''))" 2>/dev/null)
echo "[Telegraph-account] $TA token:${#TOK}chars" | tee -a "$LOG"
if [ -n "$TOK" ]; then
R=$(curl -s --max-time 25 -X POST "https://api.telegra.ph/createPage" \
  -H "Content-Type: application/json" \
  -d '{
    "access_token": "'"$TOK"'",
    "title": "8 cosas gratis que puedes hacer HOY en VANGUARD (desde el móvil, sin registro)",
    "author_name": "VANGUARD",
    "author_url": "https://vanguard-kq9r.vercel.app",
    "content": [
      {"tag":"p","children":["1. VER LA GUERRA DEL MUNDO EN VIVO — noticias de conflictos actualizadas al minuto, con imágenes y fuente."]},
      {"tag":"p","children":["2. GIRAR EL GLOBO 3D MILITAR — aviones, tanques e infantería sobre el mapa del planeta, con zoom táctil."]},
      {"tag":"p","children":["3. JUGAR GUERRA GLOBAL MULTIJUGADOR — conquista territorios por rondas contra otros comandantes."]},
      {"tag":"p","children":["4. DUELO DE PAÍSES ¿QUIÉN GANA? — República Dominicana vs Haití, India vs Pakistán: PIB, gasto militar y población de datos oficiales."]},
      {"tag":"p","children":["5. VER HURACANES Y VOLCANES ACTIVOS — eventos reales de NASA EONET sobre el globo, más el cinturón de auroras de NOAA."]},
      {"tag":"p","children":["6. SEGUIR LA EEI EN DIRECTO — la Estación Espacial Internacional cruzando el cielo, posición real cada 6 segundos."]},
      {"tag":"p","children":["7. GANAR EL QUIZ DE GEOGRAFÍA — desafío GEO con récord personal y ranking de gasto militar."]},
      {"tag":"p","children":["8. VER CUÁNTA GENTE ESTÁ EN LÍNEA — contador verde con presencia real: gente activa ahora mismo, no bots."]},
      {"tag":"p","children":["Bonus: entras y la página sale EN TU IDIOMA (8 idiomas). Gratis, sin instalar nada: "]},
      {"tag":"a","attrs":{"href":"https://vanguard-kq9r.vercel.app/?ref=VGD-TELE8"},"children":["vanguard-kq9r.vercel.app — toma el mando"]}
    ],
    "return_content": false
  }' -o /tmp/tg8.json -w "%{http_code}")
URL=$(python3 -c "import json;d=json.load(open('/tmp/tg8.json'));print(d.get('result',{}).get('url',''))" 2>/dev/null)
echo "[Telegraph-r8] $R -> $URL" | tee -a "$LOG"
else
echo "[Telegraph-r8] SKIP sin token" | tee -a "$LOG"
fi

# 2) paste.rs
P=$(curl -s --max-time 25 -X POST "https://paste.rs/" --data-binary @- <<'EOF' -w "|%{http_code}")
VANGUARD — 8 COSAS GRATIS QUE PUEDES HACER HOY (móvil, sin registro)

1. Guerra del mundo en vivo (noticias al minuto)
2. Globo 3D militar: aviones, tanques, tropas
3. Guerra multijugador por rondas
4. Duelo de países ¿QUIÉN GANA? (datos Banco Mundial)
5. Huracanes/volcanes NASA + auroras NOAA
6. EEI en directo (posición real cada 6s)
7. Quiz de geografía con récord
8. Contador de gente EN LÍNEA ahora mismo

ENTRAR: https://vanguard-kq9r.vercel.app/?ref=VGD-PASTE8
Noticias: https://vanguard-kq9r.vercel.app/guerra-hoy
EOF
PP8=$(echo "$P" | rev | cut -d'|' -f1 | rev); PU8=$(echo "$P" | sed 's/|[0-9]*$//')
echo "[paste.rs-r8] $PP8 -> $PU8" | tee -a "$LOG"

# 3) IndexNow API central
R=$(curl -s -o /dev/null -w "%{http_code}" --max-time 30 \
  -X POST "https://api.indexnow.org/indexnow" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d '{"host":"vanguard-kq9r.vercel.app","key":"074b8db50cc83f0689a2211e3ff94db1","keyLocation":"https://vanguard-kq9r.vercel.app/074b8db50cc83f0689a2211e3ff94db1.txt","urlList":["'$BASE'/?ref=VGD-INR8","'$BASE'/guerra-hoy"]}')
echo "[IndexNow-r8] $R" | tee -a "$LOG"

# 4) Ping-o-Matic + Twingly
R=$(curl -s -o /dev/null -w "%{http_code}" --max-time 25 "https://pingomatic.com/ping/?title=VANGUARD%208%20cosas%20gratis&blogurl=$BASE&rssurl=$BASE/feed.xml&chk_weblogscom=on&chk_blogs=on&chk_feedburner=on")
echo "[PingOMatic-r8] $R" | tee -a "$LOG"
R=$(curl -s -o /dev/null -w "%{http_code}" --max-time 25 -X POST "https://ping.twingly.com/" -H "Content-Type: text/xml" -d '<methodCall><methodName>weblogUpdates.ping</methodName><params><param><value>VANGUARD 8 cosas gratis</value></param><param><value>'$BASE'</value></param><param><value>'$BASE/feed.xml'</value></param></params></methodCall>')
echo "[Twingly-r8] $R" | tee -a "$LOG"

# 5) WebSub x2
R=$(curl -s -o /dev/null -w "%{http_code}" --max-time 25 -X POST "https://pubsubhubbub.appspot.com/" -d "hub.mode=publish&hub.url=$BASE/feed.xml")
echo "[WebSub-PubSubHubbub-r8] $R" | tee -a "$LOG"
R=$(curl -s -o /dev/null -w "%{http_code}" --max-time 25 -X POST "https://hub.superfeedr.com/" -d "hub.mode=publish&hub.url=$BASE/feed.xml")
echo "[WebSub-Superfeedr-r8] $R" | tee -a "$LOG"

# 6) TotalPing (verificado r7 con -L)
R=$(curl -sL -o /dev/null -w "%{http_code}" --max-time 30 "http://www.totalping.com/?p=tp&title=VANGUARD&url=$BASE&rss=$BASE/feed.xml&chk=1")
echo "[TotalPing-r8] $R" | tee -a "$LOG"

echo "=== FIN RONDA 8 ===" >> "$LOG"
