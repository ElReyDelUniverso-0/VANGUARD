#!/bin/bash
# VANGUARD v42.0 — RONDA 6: TU IDIOMA, TU GUERRA (auto-idioma + gente EN VIVO)
# Canales ya verificados en r1-r5 + Telegraph con cuenta anónima nueva.
# Solo cuenta 2xx/3xx con confirmación real del servicio.
BASE="https://vanguard-kq9r.vercel.app"
LOG=/home/z/my-project/scripts/campaign-results.txt
echo "=== RONDA 6 $(date -u +"%Y-%m-%dT%H:%M:%SZ") ===" >> "$LOG"

# 1) Telegraph: cuenta anónima nueva (los tokens viejos mueren solos)
TA=$(curl -s --max-time 25 "https://api.telegra.ph/createAccount?short_name=vanguardops&author_name=VANGUARD" -o /tmp/tg6acc.json -w "%{http_code}")
TOK=$(python3 -c "import json;d=json.load(open('/tmp/tg6acc.json'));print(d.get('result',{}).get('access_token',''))" 2>/dev/null)
echo "[Telegraph-account] $TA token:${#TOK}chars" | tee -a "$LOG"
if [ -n "$TOK" ]; then
R=$(curl -s --max-time 25 -X POST "https://api.telegra.ph/createPage" \
  -H "Content-Type: application/json" \
  -d '{
    "access_token": "'"$TOK"'",
    "title": "VANGUARD ahora detecta TU IDIOMA al entrar y muestra cuánta gente está EN VIVO (gratis)",
    "author_name": "VANGUARD",
    "author_url": "https://vanguard-kq9r.vercel.app",
    "content": [
      {"tag":"p","children":["Novedades de VANGUARD, la plataforma de conflictos mundiales gratis para móvil:"]},
      {"tag":"p","children":["— IDIOMA AUTOMÁTICO: entras y la página sale en el idioma de tu navegador (español, inglés, portugués, francés, alemán, italiano, ruso y chino). Si prefieres otro idioma, lo cambias con un toque y se recuerda para siempre."]},
      {"tag":"p","children":["— GENTE EN VIVO: un contador verde muestra cuántos guerreros están EN LÍNEA ahora mismo — no visitas acumuladas: personas activas en este instante."]},
      {"tag":"p","children":["— Y todo lo anterior sigue: globo 3D militar con aviones y tanques, huracanes y volcanes de NASA, auroras de NOAA, sismos USGS, la EEI en directo, geopolítica del Banco Mundial con duelo ¿QUIÉN GANA? y quiz, guerra global multijugador, noticias 24/7."]},
      {"tag":"p","children":["Abre el mando desde el móvil, sin registro y sin instalar nada: "]},
      {"tag":"a","attrs":{"href":"https://vanguard-kq9r.vercel.app/?ref=VGD-TELE6"},"children":["vanguard-kq9r.vercel.app — TU IDIOMA, TU GUERRA"]},
      {"tag":"p","children":["Noticias de guerra en vivo: https://vanguard-kq9r.vercel.app/guerra-hoy"]}
    ],
    "return_content": false
  }' -o /tmp/tg6.json -w "%{http_code}")
URL=$(python3 -c "import json;d=json.load(open('/tmp/tg6.json'));print(d.get('result',{}).get('url',''))" 2>/dev/null)
echo "[Telegraph-v42] $R -> $URL" | tee -a "$LOG"
else
echo "[Telegraph-v42] SKIP sin token" | tee -a "$LOG"
fi

# 2) paste.rs (verificado r1/r4/r5)
P=$(curl -s --max-time 25 -X POST "https://paste.rs/" --data-binary @- <<'EOF' -w "|%{http_code}")
VANGUARD v42 — TU IDIOMA, TU GUERRA (gratis, móvil, sin registro)

Novedad 1 — IDIOMA AUTOMÁTICO: entras y la página sale en tu idioma
(es, en, pt, fr, de, it, ru, zh). Se recuerda si lo cambias.
Novedad 2 — GENTE EN VIVO: contador verde de guerreros activos AHORA
(no visitas acumuladas: presencia real, latidos cada 30 seg).

Y además: globo 3D militar, huracanes/volcanes NASA, auroras NOAA,
sismos USGS, EEI en directo, geopolítica Banco Mundial, duelo ¿QUIÉN
GANA?, quiz GEO y guerra multijugador por rondas.

ENTRAR: https://vanguard-kq9r.vercel.app/?ref=VGD-PASTE6
Noticias 24/7: https://vanguard-kq9r.vercel.app/guerra-hoy
EOF
PP6=$(echo "$P" | rev | cut -d'|' -f1 | rev); PU6=$(echo "$P" | sed 's/|[0-9]*$//')
echo "[paste.rs-v42] $PP6 -> $PU6" | tee -a "$LOG"

# 3) IndexNow (verificado r1-r5)
R=$(curl -s -o /dev/null -w "%{http_code}" --max-time 25 \
  -X POST "https://api.indexnow.org/indexnow" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d '{"host":"vanguard-kq9r.vercel.app","key":"074b8db50cc83f0689a2211e3ff94db1","keyLocation":"https://vanguard-kq9r.vercel.app/074b8db50cc83f0689a2211e3ff94db1.txt","urlList":["'$BASE'/?ref=VGD-INR6","'$BASE'/guerra-hoy"]}')
echo "[IndexNow-r6] $R" | tee -a "$LOG"

# 4) Ping-o-Matic (verificado r1-r5)
R=$(curl -s -o /dev/null -w "%{http_code}" --max-time 25 "https://pingomatic.com/ping/?title=VANGUARD%20Tu%20idioma%20tu%20guerra&blogurl=$BASE&rssurl=$BASE/feed.xml&chk_weblogscom=on&chk_blogs=on&chk_feedburner=on")
echo "[PingOMatic-r6] $R" | tee -a "$LOG"

# 5) Twingly (verificado r1-r5)
R=$(curl -s -o /dev/null -w "%{http_code}" --max-time 25 -X POST "https://ping.twingly.com/" -H "Content-Type: text/xml" -d '<methodCall><methodName>weblogUpdates.ping</methodName><params><param><value>VANGUARD Tu idioma tu guerra</value></param><param><value>'$BASE'</value></param><param><value>'$BASE/feed.xml'</value></param></params></methodCall>')
echo "[Twingly-r6] $R" | tee -a "$LOG"

# 6) WebSub x2 hubs (verificado r3-r5)
R=$(curl -s -o /dev/null -w "%{http_code}" --max-time 25 -X POST "https://pubsubhubbub.appspot.com/" -d "hub.mode=publish&hub.url=$BASE/feed.xml")
echo "[WebSub-PubSubHubbub-r6] $R" | tee -a "$LOG"
R=$(curl -s -o /dev/null -w "%{http_code}" --max-time 25 -X POST "https://hub.superfeedr.com/" -d "hub.mode=publish&hub.url=$BASE/feed.xml")
echo "[WebSub-Superfeedr-r6] $R" | tee -a "$LOG"

echo "=== FIN RONDA 6 ===" >> "$LOG"
