#!/usr/bin/env python3
# RODILLO v365 → v366 (ley v312): solo los VALORES de las aserciones caminan —
# los nombres de pines y los mensajes históricos quedan como memoria.
# Patrones (solo en líneas con `afirmar(`):
#   "v365.0"          → "v366.0"
#   startsWith("v365") → startsWith("v366")
#   "LA ARMERÍA DEL MUNDO" (valor de aserción) → "EL IMÁN"
import re, sys

P = "scripts/pruebas-nucleo.mjs"
s = open(P, encoding="utf-8").read()
lines = s.split("\n")
out, cambios = [], 0
for i, ln in enumerate(lines, 1):
    if "afirmar(" in ln:
        new = ln
        new = new.replace('"v365.0"', '"v366.0"')
        new = new.replace('startsWith("v365")', 'startsWith("v366")')
        new = new.replace('"LA ARMERÍA DEL MUNDO"', '"EL IMÁN"')
        if new != ln:
            cambios += 1
            print(f"L{i}: {ln.strip()[:110]}")
            print(f"    → {new.strip()[:110]}")
        out.append(new)
    else:
        out.append(ln)
open(P, "w", encoding="utf-8").write("\n".join(out))
print(f"\n{cambios} aserciones rodadas (solo valores).")
# verificación: ningún pin title con el codename viejo fue tocado
quedan = [l for l in open(P, encoding="utf-8") if "verificar(" in l and "LA ARMERÍA DEL MUNDO" in l]
print(f"pines históricos con nombre LA ARMERÍA DEL MUNDO intactos: {len(quedan)} (esperado 2)")
