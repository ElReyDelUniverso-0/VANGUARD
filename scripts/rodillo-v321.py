#!/usr/bin/env python3
# Rodillo v320.0 → v321.0 para scripts/pruebas-nucleo.mjs
# Ley v312: solo cambian los VALORES dentro de afirmar()/includes()/startsWith()
# — los mensajes históricos quedan intactos (la memoria de la casa).
RUTA = "scripts/pruebas-nucleo.mjs"
src = open(RUTA, encoding="utf-8").read()
original = src

# 1) La fuente única de versión (valor de la aserción, mensaje intacto)
src = src.replace('APP_VERSION = "v320.0"', 'APP_VERSION = "v321.0"')

# 2) El codename en la fuente única y en el home (valor, mensaje intacto)
src = src.replace('version.includes("LA RED COMPLETA")', 'version.includes("LA PANTALLA EN EL ANILLO")')
src = src.replace('r.texto.includes("LA RED COMPLETA")', 'r.texto.includes("LA PANTALLA EN EL ANILLO")')

# 3) La versión en el home (valor, mensaje intacto)
src = src.replace('r.texto.includes("v320.0")', 'r.texto.includes("v321.0")')

# 4) El health firma la ronda
src = src.replace('startsWith("v320")', 'startsWith("v321")')

open(RUTA, "w", encoding="utf-8").write(src)

cambiado = sum(1 for a, b in zip(original.splitlines(), src.splitlines()) if a != b)
print(f"líneas cambiadas: {cambiado}")
restos = [l for l in src.splitlines() if "v320.0" in l and "afirmar" in l and "no es" not in l and "no viaja" not in l]
print("restos de aserción v320:", len(restos))
for l in restos[:3]:
    print("  ", l.strip()[:120])
