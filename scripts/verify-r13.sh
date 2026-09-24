#!/bin/bash
# Ronda 13 — verificación honesta: GET a cada enlace + contar matches del contenido
LOG=/home/z/my-project/scripts/campaign-results.txt
echo "--- VERIFICACION R13 $(date -u +%H:%M:%SZ) ---" >> "$LOG"

U1="https://telegra.ph/Los-ejércitos-del-planeta-en-cifras-REALES--ahora-dentro-de-VANGUARD-09-24"
U2="https://telegra.ph/Who-really-pays-for-war-Real-World-Bank-data-now-inside-VANGUARD-09-24"
U3="https://telegra.ph/Quem-gasta-mais-com-guerra-Dados-REAIS-do-Banco-Mundial-dentro-do-VANGUARD-09-24"
U4="https://paste.rs/CLta5"
U5="https://rentry.co/sdi3ggyx"
U6="https://rentry.co/hhc9e7y3"

verify() { # $1 nombre, $2 url, $3 patron
  C=$(curl -sL --max-time 25 -o /tmp/v13.html -w "%{http_code}" "$2" -H "User-Agent: Mozilla/5.0")
  M=$(rg -c -i "$3" /tmp/v13.html 2>/dev/null || echo 0)
  echo "[verify $1] HTTP $C matches $M $( [ "$C" = 200 ] && [ "$M" -ge 1 ] && echo OK || echo FAIL )" | tee -a "$LOG"
}

verify "tele13-ES" "$U1" "997|Banco Mundial|VANGUARD"
verify "tele13-EN" "$U2" "997|World Bank|VANGUARD"
verify "tele13-PT" "$U3" "997|Banco Mundial|VANGUARD"
verify "paste13"   "$U4" "PODER MILITAR|997"
verify "rentry13-ES" "$U5" "997|Banco Mundial"
verify "rentry13-EN" "$U6" "997|World Bank"
