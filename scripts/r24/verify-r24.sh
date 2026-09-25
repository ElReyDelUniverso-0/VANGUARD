#!/bin/bash
# Ronda 24 — verificación estricta: pages (200+grep) | shorts (Location=destino correcto + cuerpo final grep)
R=/home/z/my-project/scripts/r24
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"
OUT="$R/verified.tsv"; : > "$OUT"
# Dedupe: R20 + R21 + los 11 de R23
PREV=$(cat /home/z/my-project/scripts/r20/verified.tsv /home/z/my-project/scripts/r21/verified.tsv 2>/dev/null | cut -f3)
PREV="$PREV
https://elreydeluniverso-0.github.io/VANGUARD/ronda22.html
https://elreydeluniverso-0.github.io/VANGUARD/radar-militar.html
https://elreydeluniverso-0.github.io/VANGUARD/senal-iss.html
https://github.com/ElReyDelUniverso-0/VANGUARD/issues/13
https://github.com/ElReyDelUniverso-0/VANGUARD/discussions/14
https://hedgedoc.envs.net/9UDvhGqjS9SAFwKJwro_Sg
https://pad.nixnet.services/94TZKtVrQ8-MbosNWKS96g
https://x0.at/OUFD.txt
https://paste.rs/xwVJY
https://hst.sh/lirutecuqe
https://spoo.me/QMlnHU"

dup(){ echo "$PREV" | grep -qiF "$1"; }

verpage(){
  local N="$1" P="$2"
  dup "$P" && { echo "⏭️  $N dup"; return; }
  local C=$(curl -sL -A "$UA" --max-time 30 -o /tmp/v24b -w '%{http_code}' "$P" 2>/dev/null)
  if [ "$C" != "200" ]; then sleep 35; C=$(curl -sL -A "$UA" --max-time 30 -o /tmp/v24b -w '%{http_code}' "$P" 2>/dev/null); fi
  if [ "$C" = "200" ] && grep -q "vanguard.world" /tmp/v24b 2>/dev/null; then
    printf '%s\tOK\t%s\n' "$N" "$P" >> "$OUT"; echo "✅ $N"
  else echo "❌ $N (http-$C)"; fi
}
vershort(){
  local N="$1" S="$2" FRAG="$3"
  dup "$S" && { echo "⏭️  $N dup"; return; }
  local L=$(curl -sI -A "$UA" --max-time 25 "$S" 2>/dev/null | grep -i '^location:' | tr -d '\r' | head -1)
  local C=$(curl -sL -A "$UA" --max-time 30 -o /tmp/v24s -w '%{http_code}' "$S" 2>/dev/null)
  if [ "$C" = "200" ] && grep -q "vanguard.world" /tmp/v24s 2>/dev/null && echo "$L" | grep -qF "$FRAG"; then
    printf '%s\tOK\t%s\n' "$N" "$S" >> "$OUT"; echo "✅ $N -> $L"
  else echo "❌ $N (http-$C loc:$(echo $L | head -c 60))"; fi
}

echo "== PAGES =="
verpage ghpages-mision   "https://elreydeluniverso-0.github.io/VANGUARD/mision-300.html"
verpage ghpages-juega    "https://elreydeluniverso-0.github.io/VANGUARD/juega-ya.html"
verpage gh-issue-15      "https://github.com/ElReyDelUniverso-0/VANGUARD/issues/15"
verpage gh-discussion-16 "https://github.com/ElReyDelUniverso-0/VANGUARD/discussions/16"
verpage hedgedoc-r24     "https://hedgedoc.envs.net/jAFdcNsbRqySXB_Se4pQ-A/download"
verpage nixnet-r24       "https://pad.nixnet.services/dM7WY4efQ2GLUcTitB7-pQ/download"
verpage x0at-r24         "https://x0.at/dzXd.txt"
verpage pasters-r24      "https://paste.rs/hTw4k"
verpage hstsh-r24        "https://hst.sh/raw/ujolasetiw"

echo "== SHORTS =="
vershort tinyurl-ronda21       "https://tinyurl.com/2583qkqj" "ronda21.html"
vershort tinyurl-ronda22       "https://tinyurl.com/28s9m4oc" "ronda22.html"
vershort tinyurl-radar         "https://tinyurl.com/279syyn6" "radar-militar.html"
vershort tinyurl-iss           "https://tinyurl.com/2y8ur9p7" "senal-iss.html"
vershort tinyurl-pulso         "https://tinyurl.com/24vmzu4u" "pulso.html"
vershort tinyurl-mision        "https://tinyurl.com/293w4sp6" "mision-300.html"
vershort tinyurl-juega         "https://tinyurl.com/275wndxr" "juega-ya.html"
vershort clck-ronda21          "https://clck.ru/3W5dzg" "ronda21.html"
vershort clck-ronda22          "https://clck.ru/3W5dzh" "ronda22.html"
vershort clck-radar            "https://clck.ru/3W5dzj" "radar-militar.html"
vershort clck-iss              "https://clck.ru/3W5dzk" "senal-iss.html"
vershort clck-pulso            "https://clck.ru/3W5dzm" "pulso.html"
vershort clck-mision           "https://clck.ru/3W5dzp" "mision-300.html"
vershort clck-juega            "https://clck.ru/3W5dzq" "juega-ya.html"
vershort spoo-ronda21          "https://spoo.me/VKkgDZ" "ronda21.html"
vershort spoo-ronda22          "https://spoo.me/9cVZT9" "ronda22.html"
vershort spoo-radar            "https://spoo.me/FoIBtS" "radar-militar.html"
vershort spoo-iss              "https://spoo.me/XRXo8h" "senal-iss.html"
vershort spoo-pulso            "https://spoo.me/ilFCsv" "pulso.html"
vershort spoo-mision           "https://spoo.me/vIsCBQ" "mision-300.html"
vershort spoo-juega            "https://spoo.me/MYdqVQ" "juega-ya.html"

echo "---- VERIFICADOS R24 ----"
cat "$OUT"
echo "TOTAL: $(grep -c OK "$OUT")"
