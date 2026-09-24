#!/bin/bash
# VANGUARD — VERIFICACIÓN RONDA 15 (honesta: GET + búsqueda de contenido real)
# Parseo del código HTTP con python (rsplit) — inmune a '|' dentro del HTML.
LOG=/home/z/my-project/scripts/campaign-results.txt
echo "=== VERIFICACIÓN RONDA 15b $(date -u +"%Y-%m-%dT%H:%M:%SZ") ===" >> "$LOG"

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

verify "Telegraph-ES" "https://telegra.ph/Faltan-6-jugadores-para-que-TODOS-cobren-1500-monedas-la-meta-comunitaria-de-VANGUARD-09-24" "VANGUARD|1\.500|monedas"
verify "Telegraph-EN" "https://telegra.ph/6-players-away-from-EVERYONE-getting-1500-coins-VANGUARD-community-goal-09-24" "VANGUARD|1,500|coins"
verify "Telegraph-PT" "https://telegra.ph/Faltam-6-jogadores-para-TODOS-ganharem-1500-moedas-meta-comunitária-do-VANGUARD-09-24" "VANGUARD|1\.500|moedas"
verify "paste.rs" "https://paste.rs/F3fl8" "OBJETIVO MUNDIAL|vanguard"
verify "rentry-ES" "https://rentry.co/vho9bfa3" "OBJETIVO MUNDIAL|meta"
verify "rentry-EN" "https://rentry.co/qutyxaio" "COMMUNITY GOAL|VANGUARD"
echo "=== FIN VERIFICACIÓN 15b ===" >> "$LOG"
