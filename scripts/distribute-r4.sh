#!/bin/bash
# VANGUARD v40.0 — RONDA 4: artículos públicos nuevos (Telegraph) con keywords
# + re-ping de motores que funcionaron en rondas anteriores.
# Solo cuenta 2xx/3xx verificable.
BASE="https://vanguard-kq9r.vercel.app"
LOG=/home/z/my-project/scripts/campaign-results.txt
echo "=== RONDA 4 $(date -u +"%Y-%m-%dT%H:%M:%SZ") ===" >> "$LOG"

# 1) Artículo Telegraph NUEVO con keywords de geopolítica (el r1 ya probó que funciona)
R=$(curl -s --max-time 25 -X POST "https://api.telegra.ph/createPage" \
  -H "Content-Type: application/json" \
  -d '{
    "access_token": "c3f8a2e69b70d0f5a41c4b2f8d",
    "title": "Geopolítica en vivo gratis: mapa de guerra 3D, gasto militar y sismos",
    "author_name": "VANGUARD",
    "author_url": "https://vanguard-kq9r.vercel.app",
    "content": [
      {"tag":"p","children":["VANGUARD lanza su nueva sección de GEOPOLÍTICA EN VIVO con datos reales y gratuitos:"]},
      {"tag":"p","children":["— Gasto militar de todos los países (% del PIB, Banco Mundial)","— PIB y población oficiales por país","— Sismos M4.5+ de las últimas 24 horas (USGS)","— Los temas que el mundo más mira en Wikipedia","— La Estación Espacial Internacional en vivo sobre tu cabeza","— Fichas de país con fronteras terrestres y vecinos"]},
      {"tag":"p","children":["Todo gratis, sin instalar nada, en el navegador del móvil: "]},
      {"tag":"a","attrs":{"href":"https://vanguard-kq9r.vercel.app"},"children":["vanguard-kq9r.vercel.app — entrar al mando"]},
      {"tag":"p","children":["Y las noticias de guerra reales 24/7 están en "]},
      {"tag":"a","attrs":{"href":"https://vanguard-kq9r.vercel.app/guerra-hoy"},"children":["la página de guerra de hoy"]}
    ],
    "return_content": false
  }' -o /tmp/tg4.json -w "%{http_code}")
URL=$(python3 -c "import json;d=json.load(open('/tmp/tg4.json'));print(d.get('result',{}).get('url',''))" 2>/dev/null)
echo "[Telegraph-geopolitica] $R -> $URL" | tee -a "$LOG"

# 2) paste.rs nuevo (funcionó en Task 48)
P=$(curl -s --max-time 25 -X POST "https://paste.rs/" --data-binary @- <<'EOF' -w "|%{http_code}")
VANGUARD — GEOPOLÍTICA EN VIVO (gratis, sin API key, sin instalar)

Datos reales del planeta en tu móvil:
* Gasto militar % PIB de 200+ países (Banco Mundial, datos oficiales)
* PIB y población por país
* Sismos M4.5+ últimas 24h (USGS)
* Top de Wikipedia: lo que el mundo mira ahora
* EEI en vivo: dónde vuela la Estación Espacial ahora mismo
* Fichas de país: capital, ingreso, vecinos, fronteras

Además: mapa de guerra 3D, noticias de guerra reales 24/7 y multijugador mundial.
ENTRAR: https://vanguard-kq9r.vercel.app
Geopolítica: https://vanguard-kq9r.vercel.app (menú INTELIGENCIA > GEO)
Noticias: https://vanguard-kq9r.vercel.app/guerra-hoy
EOF
PPID4=$(echo "$P" | rev | cut -d'|' -f1 | rev); PU4=$(echo "$P" | sed 's/|[0-9]*$//')
echo "[paste.rs-geo] $PPID4 -> $PU4" | tee -a "$LOG"

# 3) IndexNow con /api/geo y contenido fresco v40
R=$(curl -s -o /dev/null -w "%{http_code}" --max-time 25 \
  -X POST "https://api.indexnow.org/indexnow" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d '{"host":"vanguard-kq9r.vercel.app","key":"074b8db50cc83f0689a2211e3ff94db1","keyLocation":"https://vanguard-kq9r.vercel.app/074b8db50cc83f0689a2211e3ff94db1.txt","urlList":["'$BASE'/?ref=VGD-INR4","'$BASE'/guerra-hoy"]}')
echo "[IndexNow-r4] $R" | tee -a "$LOG"

# 4) Twingly + Ping-o-Matic re-ping (v40 fresco)
R=$(curl -s -o /dev/null -w "%{http_code}" --max-time 25 "https://pingomatic.com/ping/?title=VANGUARD%20Geopolitica%20en%20vivo&blogurl=$BASE&rssurl=$BASE/feed.xml&chk_weblogscom=on&chk_blogs=on&chk_feedburner=on")
echo "[PingOMatic-r4] $R" | tee -a "$LOG"
R=$(curl -s -o /dev/null -w "%{http_code}" --max-time 25 -X POST "https://ping.twingly.com/" -H "Content-Type: text/xml" -d '<methodCall><methodName>weblogUpdates.ping</methodName><params><param><value>VANGUARD Geopolitica en vivo</value></param><param><value>'$BASE'</value></param><param><value>'$BASE/feed.xml'</value></param></params></methodCall>')
echo "[Twingly-r4] $R" | tee -a "$LOG"

# 5) WebSub re-publish
R=$(curl -s -o /dev/null -w "%{http_code}" --max-time 25 -X POST "https://pubsubhubbub.appspot.com/" -H "Content-Type: application/x-www-form-urlencoded" --data-urlencode "hub.mode=publish" --data-urlencode "hub.url=$BASE/feed.xml")
echo "[WebSub-r4] $R" | tee -a "$LOG"

echo "=== FIN RONDA 4 ===" >> "$LOG"
