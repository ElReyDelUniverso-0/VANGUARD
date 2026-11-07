#!/usr/bin/env python3
# RODILLO v364 → v365 (ley v312): solo los VALORES de las aserciones caminan —
# los nombres de pines y los mensajes históricos quedan como memoria.
# Patrones (solo en líneas con `afirmar(`):
#   "v364.0"          → "v365.0"
#   startsWith("v364") → startsWith("v365")
#   "LA BIBLIOTECA DEL MUNDO" (valor de aserción) → "LA ARMERÍA DEL MUNDO"
import re, sys

P = "scripts/pruebas-nucleo.mjs"
s = open(P, encoding="utf-8").read()
lines = s.split("\n")
out, cambios = [], 0
for i, ln in enumerate(lines, 1):
    if "afirmar(" in ln:
        new = ln
        new = new.replace('"v364.0"', '"v365.0"')
        new = new.replace('startsWith("v364")', 'startsWith("v365")')
        new = new.replace('"LA BIBLIOTECA DEL MUNDO"', '"LA ARMERÍA DEL MUNDO"')
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
quedan = [l for l in open(P, encoding="utf-8") if "verificar(" in l and "LA BIBLIOTECA DEL MUNDO" in l]
print(f"pines históricos con nombre LA BIBLIOTECA DEL MUNDO intactos: {len(quedan)} (esperado 2)")
