#!/bin/bash
# VANGUARD — AGENTE AUTOMÁTICO DE PROMOCIÓN (sin nadie tocando nada)
# Instalado en GitHub Actions: corre SOLO cada 12h (workflow auto-promo.yml).
# Repite los canales ya verificados manualmente (r1-r8), solo 2xx/3xx reales:
#   IndexNow (api central) + Ping-o-Matic + Twingly + WebSub x2 + TotalPing
# Sin tokens, sin secretos, sin cuentas: todos los canales son keyless.
# El código de ref es único por corrida (VGD-AGENT<run>) para medir en el
# ranking de /mision cuántas visitas trae el agente.
BASE="https://vanguard-kq9r.vercel.app"
KEY="074b8db50cc83f0689a2211e3ff94db1"
RUN="VGD-AGENT${GITHUB_RUN_NUMBER:-$(date +%j)}"
echo "=== AGENTE AUTO $(date -u +"%Y-%m-%dT%H:%M:%SZ") run=${RUN} ==="

FAIL=0

# 1) IndexNow (API central, verificado r1-r8)
R=$(curl -s -o /dev/null -w "%{http_code}" --max-time 30 \
  -X POST "https://api.indexnow.org/indexnow" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d '{"host":"vanguard-kq9r.vercel.app","key":"'"$KEY"'","keyLocation":"'"$BASE"'/'"$KEY"'.txt","urlList":["'$BASE'/?ref='"$RUN"'","'$BASE'/guerra-hoy"]}')
echo "[IndexNow] $R"; [ "$R" = "200" ] || FAIL=1

# 2) Ping-o-Matic (sindica a ~15 servicios)
R=$(curl -s -o /dev/null -w "%{http_code}" --max-time 30 "https://pingomatic.com/ping/?title=VANGUARD%20guerra%20en%20vivo&blogurl=$BASE&rssurl=$BASE/feed.xml&chk_weblogscom=on&chk_blogs=on&chk_feedburner=on")
echo "[PingOMatic] $R"; [ "$R" = "200" ] || FAIL=1

# 3) Twingly
R=$(curl -s -o /dev/null -w "%{http_code}" --max-time 30 -X POST "https://ping.twingly.com/" -H "Content-Type: text/xml" -d '<methodCall><methodName>weblogUpdates.ping</methodName><params><param><value>VANGUARD guerra en vivo</value></param><param><value>'$BASE'</value></param><param><value>'$BASE/feed.xml'</value></param></params></methodCall>')
echo "[Twingly] $R"; [ "$R" = "200" ] || FAIL=1

# 4) WebSub x2 hubs (publicación real del feed RSS)
R=$(curl -s -o /dev/null -w "%{http_code}" --max-time 30 -X POST "https://pubsubhubbub.appspot.com/" -d "hub.mode=publish&hub.url=$BASE/feed.xml")
echo "[WebSub-PubSubHubbub] $R"; [ "$R" = "204" ] || FAIL=1
R=$(curl -s -o /dev/null -w "%{http_code}" --max-time 30 -X POST "https://hub.superfeedr.com/" -d "hub.mode=publish&hub.url=$BASE/feed.xml")
echo "[WebSub-Superfeedr] $R"; [ "$R" = "204" ] || FAIL=1

# 5) TotalPing (verificado r7 con -L)
R=$(curl -sL -o /dev/null -w "%{http_code}" --max-time 30 "http://www.totalping.com/?p=tp&title=VANGUARD&url=$BASE&rss=$BASE/feed.xml&chk=1")
echo "[TotalPing] $R"; [ "$R" = "200" ] || FAIL=1

echo "=== AGENTE AUTO FIN (FAIL=$FAIL) ==="
exit 0
