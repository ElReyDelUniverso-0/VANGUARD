#!/bin/bash
# RONDA 18 — WAVE D2: acortadores operativos nuevos (clck.ru, cleanuri, spoo.me)
LOG=/home/z/my-project/scripts/campaign-results.txt
B="https://vanguard-kq9r.vercel.app"
echo "=== R18 WAVE D2 $(date -u +"%Y-%m-%dT%H:%M:%SZ") ===" >> "$LOG"

clck() { # $1=suffix label
  U=$(curl -s --max-time 15 "https://clck.ru/--?url=$(python3 -c "import urllib.parse;print(urllib.parse.quote('$B/?ref=VGD-R18-$1',safe=''))")" | tr -d '[:space:]')
  echo "[clck.ru] $1 → $U" | tee -a "$LOG"
}
clck "mision200" ; clck "es" ; clck "en" ; clck "pt"

clean() {
  U=$(curl -s --max-time 15 -X POST https://cleanuri.com/api/v1/shorten -d "url=$(python3 -c "import urllib.parse;print(urllib.parse.quote('$B$1',safe=''))")" | python3 -c "import json,sys;print(json.load(sys.stdin).get('result_url','ERR')[:80])" 2>/dev/null)
  echo "[cleanuri] $1 → $U" | tee -a "$LOG"
}
clean "/guerra-hoy/?ref=VGD-R18-cu2"
clean "/?ref=VGD-R18-cu3"
clean "/mision/?ref=VGD-R18-cu4"

spoo() {
  U=$(curl -s --max-time 15 -X POST https://spoo.me/ -H "Accept: application/json" -d "url=$B$1" | python3 -c "import json,sys;print(json.load(sys.stdin).get('short_url','ERR')[:80])" 2>/dev/null)
  echo "[spoo.me] $1 → $U" | tee -a "$LOG"
}
spoo "/?ref=VGD-R18-sp2"
spoo "/guerra-hoy/?ref=VGD-R18-sp3"
spoo "/mision/?ref=VGD-R18-sp4"
echo "=== R18 WAVE D2 FIN ===" >> "$LOG"
