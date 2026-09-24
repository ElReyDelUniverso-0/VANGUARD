#!/bin/bash
# Ronda 20 — Verificación estricta de TODOS los candidatos
R=/home/z/my-project/scripts/r20
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"
CAND="$R/candidates.tsv"
OUT="$R/verified.tsv"
: > "$OUT"

# name|kind|page|verify
cat > "$CAND" <<'EOF'
indexnow-generic	api	https://api.indexnow.org/indexnow?url=https%3A%2F%2Fvanguard.world&key=074b8db50cc83f0689a2211e3ff94db1	
github-issue-8	page	https://github.com/ElReyDelUniverso-0/VANGUARD/issues/8	https://api.github.com/repos/ElReyDelUniverso-0/VANGUARD/issues/8
hedgedoc-envs	page	https://hedgedoc.envs.net/oJnCUVY-STOsqmnbBC6pTA	https://hedgedoc.envs.net/oJnCUVY-STOsqmnbBC6pTA/download
hedgedoc-nixnet	page	https://pad.nixnet.services/2zKPevkYSbmNIa74mxm62w	https://pad.nixnet.services/2zKPevkYSbmNIa74mxm62w/download
tmpfiles	page	https://tmpfiles.org/wnweE1ywK5Bo/promo-r20.txt	https://tmpfiles.org/dl/wnweE1ywK5Bo/promo-r20.txt
x0at	page	https://x0.at/SAkb.txt	https://x0.at/SAkb.txt
shrib	page	https://shrib.com/vanguard-ronda20	https://shrib.com/vanguard-ronda20?t=txt
pasters	page	https://paste.rs/oW6g5	https://paste.rs/oW6g5
hstsh	page	https://hst.sh/anosulekag	https://hst.sh/raw/anosulekag
cnets	page	https://paste.c-net.org/EmptyPaste	https://paste.c-net.org/EmptyPaste
clckru	short	https://clck.ru/3W5aqt	https://clck.ru/3W5aqt
spooshort	short	https://spoo.me/9Cxm0J	https://spoo.me/9Cxm0J
EOF

while IFS=$'\t' read -r NAME KIND PAGE VERIFY; do
  case "$KIND" in
    page)
      CODE=$(curl -sL -A "$UA" --max-time 30 -o /tmp/v20body -w '%{http_code}' "$VERIFY" 2>/dev/null)
      if [ "$CODE" = "200" ] && grep -q "vanguard.world" /tmp/v20body 2>/dev/null; then
        printf '%s\tOK\t%s\n' "$NAME" "$PAGE" >> "$OUT"
        echo "✅ $NAME (page 200 + link)"
      else
        # fallback: probar la propia pagina
        CODE2=$(curl -sL -A "$UA" --max-time 30 -o /tmp/v20body2 -w '%{http_code}' "$PAGE" 2>/dev/null)
        if [ "$CODE2" = "200" ] && grep -q "vanguard.world" /tmp/v20body2 2>/dev/null; then
          printf '%s\tOK\t%s\n' "$NAME" "$PAGE" >> "$OUT"
          echo "✅ $NAME (page fallback 200 + link)"
        else
          printf '%s\tFAIL\tcode=%s/%s\n' "$NAME" "$CODE" "$CODE2" >> "$OUT"
          echo "❌ $NAME code=$CODE/$CODE2"
        fi
      fi
      ;;
    short)
      if curl -sIL -A "$UA" --max-time 30 "$VERIFY" 2>/dev/null | grep -i '^location:' | grep -q "vanguard.world"; then
        printf '%s\tOK\t%s\n' "$NAME" "$PAGE" >> "$OUT"
        echo "✅ $NAME (redirect -> vanguard.world)"
      else
        printf '%s\tFAIL\tno-redirect\n' "$NAME" >> "$OUT"
        echo "❌ $NAME no redirect"
      fi
      ;;
    api)
      CODE=$(curl -s -o /dev/null -w '%{http_code}' -A "$UA" --max-time 30 "$PAGE" 2>/dev/null)
      case "$CODE" in
        200|202) printf '%s\tOK\t%s\n' "$NAME" "$PAGE" >> "$OUT"; echo "✅ $NAME (api http-$CODE)";;
        *) printf '%s\tFAIL\thttp-%s\n' "$NAME" "$CODE" >> "$OUT"; echo "❌ $NAME http-$CODE";;
      esac
      ;;
  esac
done < "$CAND"

echo "---- VERIFICADOS ----"
grep -c "OK" "$OUT" 2>/dev/null || true
cat "$OUT"
