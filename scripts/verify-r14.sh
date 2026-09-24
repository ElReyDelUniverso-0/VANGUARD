#!/bin/bash
# Ronda 14 — verificación honesta
LOG=/home/z/my-project/scripts/campaign-results.txt
echo "--- VERIFICACION R14 $(date -u +%H:%M:%SZ) ---" >> "$LOG"

verify() {
  C=$(curl -sL --max-time 25 -o /tmp/v14.html -w "%{http_code}" "$2" -H "User-Agent: Mozilla/5.0")
  M=$(rg -c -i "$3" /tmp/v14.html 2>/dev/null || echo 0)
  echo "[verify $1] HTTP $C matches $M $( [ "$C" = 200 ] && [ "$M" -ge 1 ] && echo OK || echo FAIL )" | tee -a "$LOG"
}

verify "tele14-ES" "https://telegra.ph/El-contador-lleva-tu-nombre-entra-ahora-y-sé-parte-del-RÉCORD-de-VANGUARD-09-24" "RÉCORD|Banco Mundial|VANGUARD"
verify "tele14-EN" "https://telegra.ph/The-counter-has-your-name-in-it-join-now-and-be-part-of-the-VANGUARD-RECORD-09-24" "RECORD|World Bank|VANGUARD"
verify "tele14-PT" "https://telegra.ph/O-contador-tem-o-seu-nome-entre-agora-e-faça-parte-do-RECORDE-do-VANGUARD-09-24" "RECORDE|Banco Mundial|VANGUARD"
verify "paste14"   "https://paste.rs/CGXJk" "RÉCORD|BOTÍN REAL"
verify "rentry14-ES" "https://rentry.co/vxaoeu86" "RÉCORD|Banco Mundial"
verify "rentry14-EN" "https://rentry.co/efinop9c" "RECORD|World Bank"
