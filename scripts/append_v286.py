#!/usr/bin/env python3
# append_v285.py — crónica de la ronda v285.0 en worklog.md.
# CASO ESPECIAL: la entrada v286 ya vive en worklog.md — fue escrita
# durante la resolución de la COLISIÓN en vuelo (el stash pop trajo
# los dos trabajos y la crónica de la v285 se redactó renumerada
# dentro de los conflictos, conservando v284 (tablero) y v285 (globo) del paralelo).
# Este script VERIFICA que la entrada está (idempotente); no duplica.

with open("worklog.md", encoding="utf-8") as f:
    s = f.read()

ok_titulo = "## v286.0 LOS ROSTROS DEL PODER" in s
ok_colision = "LA COLISIÓN DOBLE Y SU PROTOCOLO" in s
ok_v284 = "## v284.0 EL TABLERO DE LOS CONFLICTOS" in s
ok_orden = s.index("## v284.0 EL TABLERO") < s.index("## v286.0 LOS ROSTROS")  # la crónica v285 del paralelo llega con su commit docs

print(f"titulo v286: {ok_titulo} · seccion colision: {ok_colision} · v284 del paralelo intacta: {ok_v284} · orden v284<v285: {ok_orden}")
raise SystemExit(0 if (ok_titulo and ok_colision and ok_v284 and ok_orden) else 1)
