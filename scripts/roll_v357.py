#!/usr/bin/env python3
# v357.0 EL PULSO FIRME — roller de la ley v312 (cuatro patrones):
# solo los VALORES de los asertos ruedan; mensajes históricos y nombres
# de pines quedan intactos (memoria de la casa).
import re

RUTA = "scripts/pruebas-nucleo.mjs"
with open(RUTA, "r", encoding="utf-8") as f:
    txt = f.read()

pares = [
    (".includes('APP_VERSION = \"v356.0\"')", ".includes('APP_VERSION = \"v357.0\"')"),
    ('.includes("EL RIVAL ANUNCIADO")', '.includes("EL PULSO FIRME")'),
    ('.includes("v356.0")', '.includes("v357.0")'),
    ('.startsWith("v356")', '.startsWith("v357")'),
]
total = 0
for viejo, nuevo in pares:
    n = txt.count(viejo)
    txt = txt.replace(viejo, nuevo)
    total += n
    print(f"{n:4d} × {viejo}")

with open(RUTA, "w", encoding="utf-8") as f:
    f.write(txt)
print(f"TOTAL rodado: {total}")

# verificación: cero restos de valores v356 en asertos, nombres intactos
restos = len(re.findall(r'\.includes\("v356\.0"\)|\.startsWith\("v356"\)|APP_VERSION = "v356\.0"', txt))
nombres = txt.count("verificar(\"EL RIVAL ANUNCIADO")
print(f"restos de v356 en asertos: {restos} (esperado 0)")
print(f"nombres de pines EL RIVAL ANUNCIADO intactos: {nombres} (esperado 2)")
