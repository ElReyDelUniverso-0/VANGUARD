# v431.0 · LA MENTE CON MANOS — informe al Dueño

**Fecha:** 2026-11-12 · **Estado:** desplegado en producción (`https://vanguard-kq9r.vercel.app`)
**Commit:** `feec5f6` (primera ola) + esta segunda ola (memoria visible, atajos, viaje asistido, sala con puertas)
**Pruebas:** `npx tsx tools/mente/probar.mts` → **29 comprobaciones, 0 fallos**. `tsc` acotado a los 11 ficheros de la mente → **0 errores**.

---

## 1. Lo que pediste y lo que hay

| Lo que pediste | Lo que hay ahora | Dónde se comprueba |
|---|---|---|
| Que sea muy inteligente | Motor de dos pasos: piensa en JSON, el servidor **ejecuta** contra los catálogos reales de la casa y luego cierra la respuesta con los resultados delante. Si el modelo contesta en prosa y no cumple el protocolo, **se usa su prosa** en vez de tirarla. | `src/lib/mente/agente.ts` |
| Que cree cosas | Acción `crear` con seis tipos (documento, plan, tabla, código, lista, informe) en markdown. Se copian o se descargan como `.md`. En modo casa crea **esqueletos editables** con la plantilla del tipo pedido. | `panel-mente.tsx`, cajón de artefactos |
| Hablar con ella cuando quiera | Panel global en **todas** las páginas (⌘J / Ctrl+J, botón ◈, o `vg:mente:abrir` desde cualquier pieza). Fuera solo en `/vanguard2`, `/vertigo`, `/offline` y `/entrar`. | `components/mente/mente-global.tsx` |
| Que dirija a lugares dentro | **271 lugares con ruta real.** Cuando la orden es directa («llévame…», «abre…», «muéstrame…») el panel **te lleva solo**, con 1,4 s de margen y un botón «quedarme aquí». Cuando es una pregunta («¿dónde veo las divisas?») contesta y ofrece las puertas, sin arrastrarte. | `pideIr()` + `dirigir` en la respuesta |

## 2. Cómo se habla con ella

- **⌘J / Ctrl+J** en cualquier sala, o el botón **◈ LA MENTE** de la esquina.
- **Enter** envía; **Mayús+Enter** salta línea; **Alt+1…9** abre la enésima puerta de la última respuesta.
- **Escape** cierra. El panel se detiene con «detener» (cancela de verdad la petición).
- Todo lo suyo (conversación, artefactos, memoria) vive **en tu aparato** (`vg:mente:*:v1`), nada en servidores.

## 3. Qué sabe la casa (números reales, no estimaciones)

`GET /api/mente/estado` en producción responde:

```
{"ok":true,"version":"v431.0","motor":"nube","sabe":{"lugares":271,"areas":11,"salas":156}}
```

Llama «nube» **solo** cuando el gateway de la casa contestó de verdad. Si no contesta, dice `casa` y el panel enseña el aviso de modo casa: te lleva a los sitios y te deja esqueletos, y **no finge** conversación.

## 4. Prueba en producción (literal, esta sesión)

```
POST https://vanguard-kq9r.vercel.app/api/mente/chat?json=1
{"mensaje":"llevame al mapa, quiero ver los paises"}

→ respuesta: "Te llevo a la sala de mapas. Allí podrás ver los países y sus datos."
  enlaces: /mapas · /cuartel?sala=mapa · /cuartel?sala=pulsos
  ia: true · motor: "nube" · ms: 10977
  pasos: leyendo la casa · pensando · «Voy a la sala de mapas» · encontrando el sitio ·
         cerrando la respuesta · listo
```

`/api/mente/estado` y la portada sirven `v431.0` y `LA MENTE CON MANOS`: el despliegue está vivo, no es el de antes.

## 5. Lo que se arregló de camino

1. **La sala del cuartel tiraba lo que recibía.** `/api/mente` ya devolvía `enlaces` y `artefactos` y el panel de la sala `mente` los ignoraba. Ahora pinta las puertas y los artefactos (copiar/`.md`). También su chat pasó a usar **el mismo motor** que el panel global: antes era una sola llamada sin ojos.
2. **`lib/ia/proveedor.ts` mentía sobre la casa.** Decía «ningún cliente está implementado» mientras `ia-gateway.ts` llevaba ocho versiones llamando a un modelo. Corregido: el núcleo se declara implementado; los proveedores externos siguen honestamente sin cliente.
3. **La versión.** `APP_VERSION` pasa a `v431.0 · LA MENTE CON MANOS`.

## 6. Lo que NO está hecho (sin adornos)

- **Streaming token a token.** Los pasos llegan en vivo por SSE, pero el texto sale de golpe al final. Hacerlo bien exige que el gateway emita tokens; hoy no lo hace de forma fiable.
- **Voz:** «escuchar» usa `speechSynthesis` del navegador, no la boca propia de la casa (`lib/voz/decir`). Funciona, pero no es la voz de VANGUARD.
- **La casa con más RAM.** `/cuartel` entero no se pudo levantar con `next dev` en este entorno (memoria del sandbox), así que la sala se verificó por tipos y por la ruta de API, **no** con un navegador delante.
- **Trabajo perdido del AGENTE 01** (núcleo de navegación): sigue sin reponerse; no lo mezclé con esta misión.

## 7. Cómo se comprueba mañana

```bash
npx tsx tools/mente/probar.mts        # 29 comprobaciones, sin red ni credenciales
curl -s https://vanguard-kq9r.vercel.app/api/mente/estado
curl -s -X POST 'https://vanguard-kq9r.vercel.app/api/mente/chat?json=1' \
  -H 'content-type: application/json' -d '{"mensaje":"llévame al mapa"}'
```

La suite no usa mocks: llama al motor real con presupuesto mínimo (1 s), así que si el motor se rompe, se rompe la prueba.
