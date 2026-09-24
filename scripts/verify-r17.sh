#!/bin/bash
# VANGUARD — VERIFICACIÓN RONDA 17 (honesta: GET + búsqueda de contenido real)
# Uso: verify-r17.sh <URL-TG-ES> <URL-TG-EN> <URL-TG-PT> <URL-PASTE> <URL-REN-ES> <URL-REN-EN>
LOG=/home/z/my-project/scripts/campaign-results.txt
echo "=== VERIFICACIÓN RONDA 17 $(date -u +"%Y-%m-%dT%H:%M:%SZ") ===" >> "$LOG"

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

verify "Telegraph-ES" "$1" "VANGUARD|EXPLORADOR|SORPR"
verify "Telegraph-EN" "$2" "VANGUARD|Explorer|coins"
verify "Telegraph-PT" "$3" "VANGUARD|EXPLORADOR|moedas"
verify "paste.rs" "$4" "EXPLORADOR|VANGUARD"
verify "rentry-ES" "$5" "EXPLORADOR|SORPR"
verify "rentry-EN" "$6" "EXPLORER|SURPRISE"
echo "=== FIN VERIFICACIÓN 17 ===" >> "$LOG"
