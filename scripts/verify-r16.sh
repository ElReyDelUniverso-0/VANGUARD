#!/bin/bash
# VANGUARD — VERIFICACIÓN RONDA 16 (honesta: GET + búsqueda de contenido real)
LOG=/home/z/my-project/scripts/campaign-results.txt
echo "=== VERIFICACIÓN RONDA 16 $(date -u +"%Y-%m-%dT%H:%M:%SZ") ===" >> "$LOG"

verify() { # $1 nombre, $2 url, $3 patrón
  local out code matches st
  out=$(curl -sL --max-time 30 -w "|%{http_code}" "$2")
  code=$(echo "$out" | python3 -c "import sys;s=sys.stdin.read();print(s.rsplit('|',1)[1].strip() if '|' in s else 'NOBAR')" 2>/dev/null)
  matches=$(echo "$out" | rg -c -i "$3" 2>/dev/null || echo 0)
  st=OK
  [ "$code" != "200" ] && st="FAIL(code $code)"
  [ "$matches" = "0" ] && st="FAIL(sin contenido)"
  echo "[verify-$1] $st http=$code matches=$matches $2" | tee -a "$LOG"
}

verify "Telegraph-ES" "https://telegra.ph/La-página-de-guerra-más-completa-del-planeta-NASA-en-vivo-divisas-en-crisis-y-83-secciones-09-24" "VANGUARD|NASA|83"
verify "Telegraph-EN" "https://telegra.ph/The-most-complete-war-page-on-the-planet-NASA-live-crisis-currencies-and-83-sections-09-24" "VANGUARD|NASA|sections"
verify "Telegraph-PT" "https://telegra.ph/A-página-de-guerra-mais-completa-do-planeta-NASA-ao-vivo-moedas-em-crise-e-83-seções-09-24" "VANGUARD|NASA|seções"
verify "paste.rs" "https://paste.rs/PfKXa" "NASA|VANGUARD"
verify "rentry-ES" "https://rentry.co/4of38nmv" "NASA|PLANETA"
verify "rentry-EN" "https://rentry.co/b8w3o8cq" "NASA|VANGUARD"
echo "=== FIN VERIFICACIÓN 16 ===" >> "$LOG"
