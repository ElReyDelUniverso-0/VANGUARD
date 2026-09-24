#!/bin/bash
# Ronda 22 — verificación estricta (page: 200+grep vanguard.world | short: location | dedupe vs R20/R21)
R=/home/z/my-project/scripts/r22
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"
OUT="$R/verified.tsv"; : > "$OUT"
PREV=$(cat /home/z/my-project/scripts/r20/verified.tsv /home/z/my-project/scripts/r21/verified.tsv 2>/dev/null | cut -f3)

verpage(){
  local N="$1" P="$2" V="$3"
  if echo "$PREV" | grep -qF "$P"; then echo "⏭️  $N duplicado (ya contado antes)"; return; fi
  local C=$(curl -sL -A "$UA" --max-time 30 -o /tmp/v22body -w '%{http_code}' "$V" 2>/dev/null)
  if [ "$C" = "200" ] && grep -q "vanguard.world" /tmp/v22body 2>/dev/null; then
    printf '%s\tOK\t%s\n' "$N" "$P" >> "$OUT"; echo "✅ $N"
  else
    echo "❌ $N (http-$C)"
  fi
}
vershort(){
  local N="$1" P="$2"
  if echo "$PREV" | grep -qF "$P"; then echo "⏭️  $N duplicado"; return; fi
  if curl -sIL -A "$UA" --max-time 30 "$P" 2>/dev/null | grep -i '^location:' | grep -q "vanguard.world"; then
    printf '%s\tOK\t%s\n' "$N" "$P" >> "$OUT"; echo "✅ $N (redirect -> vanguard.world)"
  else
    echo "❌ $N no redirect"
  fi
}

echo "== VERIFICACIÓN RONDA 22 =="
verpage ghpages-ronda22  "https://elreydeluniverso-0.github.io/VANGUARD/ronda22.html"      "https://elreydeluniverso-0.github.io/VANGUARD/ronda22.html"
verpage ghpages-radar    "https://elreydeluniverso-0.github.io/VANGUARD/radar-militar.html" "https://elreydeluniverso-0.github.io/VANGUARD/radar-militar.html"
verpage ghpages-iss      "https://elreydeluniverso-0.github.io/VANGUARD/senal-iss.html"     "https://elreydeluniverso-0.github.io/VANGUARD/senal-iss.html"
verpage gh-issue-13      "https://github.com/ElReyDelUniverso-0/VANGUARD/issues/13"         "https://github.com/ElReyDelUniverso-0/VANGUARD/issues/13"
verpage gh-discussion-14 "https://github.com/ElReyDelUniverso-0/VANGUARD/discussions/14"    "https://github.com/ElReyDelUniverso-0/VANGUARD/discussions/14"
verpage hedgedoc-r22     "https://hedgedoc.envs.net/9UDvhGqjS9SAFwKJwro_Sg"                 "https://hedgedoc.envs.net/9UDvhGqjS9SAFwKJwro_Sg/download"
verpage nixnet-r22       "https://pad.nixnet.services/94TZKtVrQ8-MbosNWKS96g"               "https://pad.nixnet.services/94TZKtVrQ8-MbosNWKS96g/download"
verpage x0at-r22         "https://x0.at/OUFD.txt"                                           "https://x0.at/OUFD.txt"
verpage pasters-r22      "https://paste.rs/xwVJY"                                           "https://paste.rs/xwVJY"
verpage hstsh-r22        "https://hst.sh/lirutecuqe"                                        "https://hst.sh/raw/lirutecuqe"
vershort spoo-r22        "https://spoo.me/QMlnHU"
echo "---- VERIFICADOS R22 ----"
cat "$OUT"
echo "TOTAL: $(grep -c OK "$OUT")"
