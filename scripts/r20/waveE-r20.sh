#!/bin/bash
# Ronda 20 — Wave E: tmpfiles/catbox/x0.at/shrib + shorts yip/qps/uto/sid + frama -L + GitHub retry
R=/home/z/my-project/scripts/r20
P="$R/promo-r20.txt"
RES="$R/resultsE.tsv"
: > "$RES"
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"
VW="https://vanguard.world"
add(){ printf '%s\t%s\t%s\t%s\t%s\n' "$1" "$2" "$3" "$4" "$5" >> "$RES"; }

echo "== E1) tmpfiles.org =="
J=$(curl -s -A "$UA" --max-time 30 -F "file=@$P" https://tmpfiles.org/api/v1/upload 2>/dev/null | head -c 400)
U=$(echo "$J" | grep -oP '"url"\s*:\s*"\Khttps[^"]+' | head -1)
if [ -n "$U" ]; then
  PV=$(echo "$U" | sed 's|tmpfiles.org/|tmpfiles.org/dl/|')
  add tmpfiles.org page "$U" "$PV" "api"
else add tmpfiles.org fail "" "" "$(echo $J|head -c 80)"; fi

echo "== E2) catbox.moe =="
U=$(curl -s -A "$UA" --max-time 30 -F "reqtype=fileupload" -F "fileToUpload=@$P;type=text/plain" https://catbox.moe/user/api.php 2>/dev/null | head -c 200 | tr -d '[:space:]')
case "$U" in https://files.catbox.moe/*) add catbox page "$U" "$U";; *) add catbox fail "" "" "$U";; esac

echo "== E3) litterbox.catbox.moe (72h) =="
U=$(curl -s -A "$UA" --max-time 30 -F "reqtype=fileupload" -F "time=72h" -F "fileToUpload=@$P;type=text/plain" https://litterbox.catbox.me/resources/internals/api.php 2>/dev/null | head -c 200 | tr -d '[:space:]')
case "$U" in https://litter.catbox.moe/*) add litterbox page "$U" "$U";; *) add litterbox fail "" "" "$U";; esac

echo "== E4) x0.at =="
U=$(curl -s -A "$UA" --max-time 30 -F "file=@$P;type=text/plain" https://x0.at 2>/dev/null | head -c 200 | tr -d '[:space:]')
case "$U" in https://x0.at/*|http://x0.at/*) add x0.at page "$U" "$U";; *) add x0.at fail "" "" "$U";; esac

echo "== E5) shrib.com (PUT) =="
U=$(curl -s -A "$UA" --max-time 25 -T "$P" "https://shrib.com/vanguard-ronda20?t=pci" 2>/dev/null | head -c 300)
grep -q "shrib" <<<"$U" && add shrib page "https://shrib.com/vanguard-ronda20" "https://shrib.com/vanguard-ronda20?t=txt" "put" || add shrib fail "" "" "$(echo $U|head -c 80)"

echo "== E6) yip.su =="
U=$(curl -s -A "$UA" --max-time 20 -d "url=$VW" https://yip.su/ 2>/dev/null | head -c 200)
S=$(echo "$U" | grep -oP 'https?://yip\.su/[a-zA-Z0-9]+' | head -1)
if [ -n "$S" ]; then add yip.su short "$S" "$S"; else add yip.su fail "" "" "$(echo $U|head -c 80)"; fi

echo "== E7) qps.ru =="
U=$(curl -s -A "$UA" --max-time 20 "https://qps.ru/?url=$VW" 2>/dev/null | head -c 200)
S=$(echo "$U" | grep -oP 'https?://qps\.ru/[a-zA-Z0-9]+' | head -1)
if [ -n "$S" ]; then add qps.ru short "$S" "$S"; else add qps.ru fail "" "" "$(echo $U|head -c 80)"; fi

echo "== E8) u.to =="
B=$(curl -s -L -A "$UA" --max-time 20 -d "url=$VW" -d "submit=Shorten" https://u.to/ 2>/dev/null | head -c 4000)
S=$(echo "$B" | grep -oP 'https?://u\.to/[a-zA-Z0-9_]+' | head -1)
if [ -n "$S" ]; then add u.to short "$S" "$S"; else add u.to fail "" "" "$(echo $B|head -c 60)"; fi

echo "== E9) s.id =="
J=$(curl -s -A "$UA" --max-time 20 -H "Content-Type: application/json" -d '{"url":"https://vanguard.world"}' https://s.id/api/shorten 2>/dev/null | head -c 300)
S=$(echo "$J" | grep -oP '"(short|url|link)"\s*:\s*"\Khttps[^"]+' | head -1)
if [ -n "$S" ]; then add s.id short "$S" "$S"; else add s.id fail "" "" "$(echo $J|head -c 80)"; fi

echo "== E10) frama.link con -L =="
J=$(curl -s -L -A "$UA" --max-time 20 -d "url=$VW" -d "lstu_format=json" https://frama.link/a 2>/dev/null | head -c 400)
S=$(echo "$J" | grep -oP '"short"\s*:\s*"\Khttps[^"]+' | head -1)
if [ -n "$S" ]; then add frama.link short "$S" "$S" "json-L"; else add frama.link fail "" "" "$(echo $J|head -c 80)"; fi

echo "== E11) GitHub Issue (token restaurado) =="
TOKEN=$(cat /home/z/my-project/.ghtoken | tr -d '[:space:]')
J=$(curl -s --max-time 30 -X POST -H "Authorization: Bearer $TOKEN" -H "Accept: application/vnd.github+json" --data-binary @"$R/issue.json" https://api.github.com/repos/ElReyDelUniverso-0/VANGUARD/issues 2>/dev/null)
NU=$(echo "$J" | grep -oP '"html_url"\s*:\s*"\K[^"]*issues/[0-9]+' | head -1)
if [ -n "$NU" ]; then add github-issue page "$NU" "$NU" "api"; else add github-issue fail "" "" "$(echo $J | head -c 120)"; fi

echo "== E12) GitHub Wiki (token restaurado) =="
rm -rf "$R/wiki20"
if git clone --quiet "https://ElReyDelUniverso-0:${TOKEN}@github.com/ElReyDelUniverso-0/VANGUARD.wiki.git" "$R/wiki20" 2>"$R/wiki-clone.err"; then
  cat > "$R/wiki20/Mision-300.md" <<EOF
# ⚔️ VANGUARD — Mision 300 enlaces

$(cat "$P")

## Juega ahora
**https://vanguard.world**

Pagina de la comunidad para la meta de 300 enlaces compartidos. Cada enlace cuenta.
EOF
  cd "$R/wiki20" && git add . && git -c user.email=vanguard@vanguard.world -c user.name=VANGUARD commit -qm "Mision 300 — Ronda 20" && git push -q origin master 2>/dev/null || git push -q origin main
  cd /home/z/my-project
  add github-wiki page "https://github.com/ElReyDelUniverso-0/VANGUARD/wiki/Mision-300" "https://github.com/ElReyDelUniverso-0/VANGUARD/wiki/Mision-300" "push"
else
  add github-wiki fail "" "" "$(head -c 120 $R/wiki-clone.err 2>/dev/null)"
fi

echo "---- RESULTADOS E ----"
cat "$RES"
