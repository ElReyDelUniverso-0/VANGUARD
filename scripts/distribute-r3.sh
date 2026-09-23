#!/bin/bash
# VANGUARD v39.1 — RONDA 3 DE DISTRIBUCIÓN (canales NUEVOS, sin red personal)
# Regla honesta: solo cuenta 2xx/3xx con respuesta plausible del servicio.
# Log: scripts/campaign-results.txt (append)
BASE="https://vanguard-kq9r.vercel.app"
FEED="$BASE/feed.xml"
SITEMAP="$BASE/sitemap.xml"
LOG=/home/z/my-project/scripts/campaign-results.txt
TS=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

echo "=== RONDA 3 $TS ===" >> "$LOG"

say() { echo "[$1] $2" | tee -a "$LOG"; }

# 1) IndexNow re-submit (contenido fresco v39.1) — 3 URLs en una llamada
R=$(curl -s -o /tmp/inr.txt -w "%{http_code}" --max-time 25 \
  -X POST "https://api.indexnow.org/indexnow" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d '{"host":"vanguard-kq9r.vercel.app","key":"074b8db50cc83f0689a2211e3ff94db1","keyLocation":"https://vanguard-kq9r.vercel.app/074b8db50cc83f0689a2211e3ff94db1.txt","urlList":["'$BASE'/?ref=VGD-INR3","'$BASE'/guerra-hoy","'$BASE'/mision"]}')
say "IndexNow-POST-r3" "$R"

# 2) WebSub/PubSubHubbub publish del feed RSS (hub de Google, sin cuenta)
R=$(curl -s -o /tmp/psh.txt -w "%{http_code}" --max-time 25 \
  -X POST "https://pubsubhubbub.appspot.com/" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "hub.mode=publish" \
  --data-urlencode "hub.url=$FEED")
say "WebSub-PubSubHubbub" "$R"

# 3) WebSub hub de Superfeedr (open hub)
R=$(curl -s -o /tmp/sf.txt -w "%{http_code}" --max-time 25 \
  -X POST "https://hub.superfeedr.com/" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "hub.mode=publish" \
  --data-urlencode "hub.url=$FEED")
say "WebSub-Superfeedr" "$R"

# 4) Bing sitemap ping
R=$(curl -s -o /tmp/bsm.txt -w "%{http_code}" --max-time 25 "https://www.bing.com/ping?sitemap=$SITEMAP")
say "Bing-SitemapPing" "$R"

# 5) Google sitemap ping (intentar; puede estar retirado)
R=$(curl -s -o /tmp/gsm.txt -w "%{http_code}" --max-time 20 "https://www.google.com/ping?sitemap=$SITEMAP")
say "Google-SitemapPing" "$R"

# 6) ExactSeek (formulario gratuito; campos mínimos)
R=$(curl -s -o /tmp/es.txt -w "%{http_code}" --max-time 25 \
  -X POST "https://www.exactseek.com/submit.html" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "url=$BASE" \
  --data-urlencode "email=vanguard.ops@vanguard.world" \
  --data-urlencode "terms=on")
say "ExactSeek" "$R"

# 7) WhatUseek (formulario gratuito)
R=$(curl -s -o /tmp/wu.txt -w "%{http_code}" --max-time 25 -L \
  "https://www.whatuseek.com/addurl.shtml?url=$BASE&email=vanguard.ops@vanguard.world")
say "WhatUseek-GET" "$R"

# 8) SonicRun (free submit)
R=$(curl -s -o /tmp/sr.txt -w "%{http_code}" --max-time 25 \
  -X POST "https://www.sonicrun.com/freesubmit.cgi" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "url=$BASE" \
  --data-urlencode "email=vanguard.ops@vanguard.world" \
  --data-urlencode "submit=Submit")
say "SonicRun" "$R"

# 9) EntireWeb free submission
R=$(curl -s -o /tmp/ew.txt -w "%{http_code}" --max-time 25 \
  -X POST "https://www.entireweb.com/freeSubmission/" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "url=$BASE" \
  --data-urlencode "email=vanguard.ops@vanguard.world")
say "EntireWeb" "$R"

# 10) FeedBurner modernized? no. — Reddit RSS validator (verifica feed público y lo registra)
R=$(curl -s -o /tmp/rv.txt -w "%{http_code}" --max-time 25 \
  "https://validator.w3.org/feed/check.cgi?url=$FEED")
say "W3C-FeedCheck" "$R"

# 11) 1abc.org ( directorio que ya funcionó en ronda 1) re-submit con /mision
R=$(curl -s -o /tmp/abc.txt -w "%{http_code}" --max-time 25 "https://www.1abc.org/submit.php?url=$BASE%2Fmision")
say "1abc-mision" "$R"

# 12) Twingly ping (funcionó antes)
R=$(curl -s -o /tmp/tw.txt -w "%{http_code}" --max-time 25 \
  -X POST "https://ping.twingly.com/" \
  -H "Content-Type: text/xml" \
  -d '<methodCall><methodName>weblogUpdates.ping</methodName><params><param><value>VANGUARD — El mundo en tiempo real</value></param><param><value>'$BASE'</value></param><param><value>'$FEED'</value></param></params></methodCall>')
say "Twingly-r3" "$R"

# 13) Ping-o-Matic (sindicado a ~15 servicios)
R=$(curl -s -o /tmp/pom.txt -w "%{http_code}" --max-time 25 \
  "https://pingomatic.com/ping/?title=VANGUARD&blogurl=$BASE&rssurl=$FEED&chk_weblogscom=on&chk_blogs=on&chk_feedburner=on&chk_newsgrator=on&chk_myyahoo=on&chk_bloglines=on")
say "PingOMatic-r3" "$R"

echo "=== FIN RONDA 3 ===" >> "$LOG"
echo "--- resumen ---"
grep -A20 "RONDA 3" "$LOG" | tail -16
