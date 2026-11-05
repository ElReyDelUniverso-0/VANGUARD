#!/bin/bash
# Censo vivo de las líneas derivadas del archivo (calibración v310)
set -u
PORT=3496
BASE="http://localhost:$PORT"
cd /home/z/my-project
PORT=$PORT NODE_ENV=production bun .next/standalone/server.js > /tmp/srv-censo.log 2>&1 &
SRVPID=$!
for i in $(seq 1 25); do sleep 1; curl -s -o /dev/null "$BASE/api/health" && break; done
for sala in /servicios /conflictos /rostros /guerra-hoy; do
  echo "── $sala ──"
  curl -s "$BASE$sala" | rg -o 'El pulso[^<]{0,90}|El tablero de los conflictos[^<]{0,90}|Ucrania · [0-9]+|CIA · [0-9]+|ASIS[^<]{0,20}|CNI[^<]{0,20}|Donald J\. Trump[^<]{0,16}|[A-Z]+ ×[0-9]+|cables del archivo|titulares?' | sort -u | head -14
done
kill "$SRVPID" 2>/dev/null; sleep 1; kill -9 "$SRVPID" 2>/dev/null
echo "CENSO VIVO FIN"
