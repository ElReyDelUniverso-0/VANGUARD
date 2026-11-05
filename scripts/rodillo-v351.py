#!/usr/bin/env python3
# Rodillo v350.0 → v351.0 para scripts/pruebas-nucleo.mjs
# Ley v312: solo cambian los VALORES dentro de afirmar()/includes()/startsWith()
# — los mensajes históricos quedan intactos (la memoria de la casa).
RUTA = "scripts/pruebas-nucleo.mjs"
src = open(RUTA, encoding="utf-8").read()
original = src

# 1) La fuente única de versión (valor de la aserción, mensaje intacto)
n1 = src.count('APP_VERSION = "v350.0"')
src = src.replace('APP_VERSION = "v350.0"', 'APP_VERSION = "v351.0"')

# 2) El codename en la fuente única y en el home (valor, mensaje intacto)
n2a = src.count('version.includes("EL FANTASMA DE LA MESA")')
src = src.replace('version.includes("EL FANTASMA DE LA MESA")', 'version.includes("LA FIEBRE QUE DESPIERTA")')
n2b = src.count('r.texto.includes("EL FANTASMA DE LA MESA")')
src = src.replace('r.texto.includes("EL FANTASMA DE LA MESA")', 'r.texto.includes("LA FIEBRE QUE DESPIERTA")')

# 3) La versión en el home (valor, mensaje intacto)
n3 = src.count('r.texto.includes("v350.0")')
src = src.replace('r.texto.includes("v350.0")', 'r.texto.includes("v351.0")')

# 4) El health firma la ronda
n4 = src.count('startsWith("v350")')
src = src.replace('startsWith("v350")', 'startsWith("v351")')

open(RUTA, "w", encoding="utf-8").write(src)

print(f"1) APP_VERSION: {n1}")
print(f"2) codename version/texto: {n2a}/{n2b}")
print(f"3) home v350.0: {n3}")
print(f"4) startsWith v350: {n4}")
print(f"total asertos rodados: {n1 + n2a + n2b + n3 + n4}")
restos = [l for l in src.splitlines() if 'startsWith("v350")' in l or 'includes("v350.0")' in l or ('EL FANTASMA DE LA MESA' in l and "afirmar" in l and "version.includes" not in l and "r.texto.includes" not in l)]
print("restos sin rodar:", len(restos))
for l in restos[:4]:
    print("  ", l.strip()[:130])
