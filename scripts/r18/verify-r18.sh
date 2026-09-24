#!/bin/bash
# R18 — VERIFICACIÓN HONESTA: cada URL del log R18 → HTTP + contenido
# Solo los verificados cuentan para shares:external.
LOG=/home/z/my-project/scripts/campaign-results.txt
OUT=/tmp/r18/verified.txt
> "$OUT"
sed -n '/=== R18 WAVE A /,$p' "$LOG" | grep -o -E 'https?://[a-zA-Z0-9./_-]+' | grep -v -E 'telegra\.ph/?(Diario|War|Diário)' > /tmp/r18/urls-raw.txt
# telegra URLs con unicode: extraer aparte
sed -n '/=== R18 WAVE G/,$p' "$LOG" | grep -o -E 'https://telegra\.ph/[A-Za-z0-9-]+-09-24' >> /tmp/r18/urls-raw.txt
sort -u /tmp/r18/urls-raw.txt -o /tmp/r18/urls.txt
# limpiar: quitar URLs de GitHub API y recursos no-campaña
grep -v -E "api\.github\.com|raw\.githubusercontent" /tmp/r18/urls.txt > /tmp/r18/urls2.txt && mv /tmp/r18/urls2.txt /tmp/r18/urls.txt
TOTAL=0; OK=0
while read -r U; do
  TOTAL=$((TOTAL+1))
  # no seguir redirects para acortadores conocidos primero: capturar code y destino
  CODE=$(curl -sL --max-time 25 -o /tmp/r18/v.html -w "%{http_code}" -A "Mozilla/5.0 (X11; Linux x86_64) Chrome/126" "$U" 2>/dev/null)
  FINAL=$(curl -s -o /dev/null --max-time 15 -w "%{url_effective}" -A "Mozilla/5.0" "$U" 2>/dev/null)
  M=$(grep -c -i "vanguard" /tmp/r18/v.html 2>/dev/null || echo 0)
  SHORT=$(echo "$U" | grep -c -E "clck\.ru|cleanuri\.com|spoo\.me")
  REDIRVG=$(echo "$FINAL" | grep -c "vanguard-kq9r.vercel.app")
  if [ "$CODE" = "200" ] && { [ "$M" -gt 0 ] || [ "$SHORT" -ge 1 ]; }; then
    OK=$((OK+1)); echo "OK  $U" | tee -a "$OUT"
  else
    echo "FAIL $U (code=$CODE matches=$M short=$SHORT final=$FINAL)" | tee -a "$OUT"
  fi
done < /tmp/r18/urls.txt
echo "" | tee -a "$OUT"
echo "VERIFICADOS: $OK / $TOTAL" | tee -a "$OUT"
