# VANGUARD DISCOVERY SYSTEM · v435.2

> Orden del Dueño, textual: *«crear una guía interactiva para nuevos visitantes;
> incorporar explicaciones breves en los módulos; añadir ejemplos de lo que puede
> hacer cada herramienta; facilitar el descubrimiento de módulos; crear una
> sección de novedades y funciones destacadas; permitir que el usuario descubra
> Vanguard sin sentirse perdido; **sin eliminar la libertad de explorar por su
> cuenta**».*

Las siete cosas, hechas. Y la última —la libertad— no es una nota al pie: es la
regla que ordena todas las demás. Aquí no hay tour obligatorio, ni modal que
secuestre la pantalla, ni muro de bienvenida. Hay un mapa que se abre si lo
abres, y que se calla si lo cierras.

---

## 1 · El núcleo (lógica pura, sin React)

### `src/lib/descubrimiento/fichas.ts` — las 95 puertas, explicadas

Una ficha por puerta **real**. Las 92 salas del `ARBOL` de
`src/lib/operacion/orden.ts` más cuatro puertas que existen y no estaban en el
árbol (`/descubrir`, `/buscar`, `/orden`, `/zona-cero/mesa`), metidas por
`PUERTAS_EXTRA`.

```ts
type Ficha = {
  ruta: string;          // la puerta
  nombre: string;        // cómo se llama
  que: string;           // UNA línea: qué es esto
  ejemplos: string[];    // 3 cosas CONCRETAS que puedes hacer aquí
  primerPaso: string;    // por dónde se empieza, en una frase
  nivel: "sin prisa" | "a fondo";
  division: string; divisionNombre: string; codigo: string;
};
```

- `CURADOS`: ejemplos escritos a mano para las ~25 salas insignia (guerra-hoy,
  mapas, mundos, zona-cero, academia, cuaderno, radio, memoria…).
- `ejemplosDe()`: para el resto, los ejemplos se **derivan** del catálogo real
  (`txt` y `gancho` de `modulos.ts`), nunca se inventan.
- `fichaDe(ruta)`: exacta y, si no, el prefijo más largo que exista
  (`/mundos/do` → ficha de `/mundos`). Ruta inexistente → `null`, y la UI
  confiesa «esta sala no tiene ficha todavía» en vez de fingir.
- `porDivision()`: un grupo por división, con D-0 «La puerta» delante (v436.0 fusionó módulos: hoy son **5**, y el hub ya no escribe el número a mano).
- `PUERTAS_DE_ENTRADA`: las 8 puertas que sirven para entrar por primera vez.
- `TOTAL_FICHAS` = **95**.

### `src/lib/descubrimiento/guias.ts` — cuatro caminos con minutos

| id | título | pasos | minutos | recorrido |
|---|---|---|---|---|
| `primeros-pasos` | Los primeros 5 minutos | 5 | 7 | `/guerra-hoy` → `/en-vivo` → `/mapas` → `/buscar` → `/descubrir` |
| `entender-el-mundo` | Entender el mundo | 5 | — | `/conflictos` → `/mundos` → `/zona-cero` → `/teatro-3d` → `/zona-cero/mesa` |
| `jugar-y-subir` | Jugar y subir | 3 | — | `/academia` → `/mi-universo` → `/novedades` |
| `de-vuelta` | De vuelta | 3 | — | `/novedades` → `/cronica` → `/orden` |

Cada paso: `n`, `titulo`, `porque`, `ruta`, `min`, `prueba`. Helpers: `pasoDe`
(acota índices fuera de rango), `totalPasos`, `guiaSugerida`, `GUIA_POR_ID`.
Todas las rutas están verificadas contra el catálogo por la prueba.

### `src/lib/descubrimiento/progreso.ts` — la memoria del aparato

`localStorage["vg:descubrimiento:v1"]` + evento `vg:descubrimiento` para que la
burbuja y el hub se enteren sin recargar. Reglas, todas probadas:

- la portada `/` **no** cuenta como sala descubierta;
- volver atrás no resta nada (solo se avanza);
- el 100 % exige **todas** las fichas;
- un almacén sucio (JSON roto, rutas desconocidas, porcentajes imposibles) se
  **sanea** al leer, no se borra;
- `modoLibre` solo es verdadero con `true` real, no con `"true"` ni `1`;
- `reiniciar` deja el aparato como el primer día.

`recomendar` / `recomendarVarias` priorizan lo no visitado y, dentro de eso, lo
de nivel «sin prisa». `avisosApagados` silencia el aviso automático.

### `src/lib/descubrimiento/destacados.ts` — lo último, con puerta

Ocho versiones reales: **v435.2, v434.2, v434.1, v433.0, v431.6, v420.0,
v417.0, v405.12**, cada una con `que` (qué trajo), `ruta` (que **existe**,
comprobado) y `prueba` (qué tocar). `ultimosDestacados(n)`.

---

## 2 · Las dos capas de interfaz

### `src/components/descubrimiento/descubrimiento.tsx` + `.css` — el lanzador

Montado en `src/app/layout.tsx` junto a `PuertaMundos`. Una burbuja de **42 px**
abajo a la izquierda: pequeña a propósito —el orbe ya vive en el centro bajo y
aprendió a moverse— y nunca encima de lo pulsable. Panel de 360 px con tres
caras:

1. **Esta sala** — la ficha de donde estás, con su ejemplo.
2. **Guías** — las cuatro, con el paso en curso.
3. **Tu progreso** — porcentaje, barra, «modo libre» y «reiniciar».

Reglas de convivencia:

- el aviso automático se abre **una vez**, y solo a quien lleva **menos del
  30 %** descubierto, y **jamás** en `/`, `/descubrir`, `/entrar`, `/vanguard2`,
  `/vertigo`, `/offline`, `/cortina`, `/trailer` (ni en las salas de pantalla
  completa, donde ni se monta);
- `Escape` cierra; `prefers-reduced-motion` respetado; en móvil ocupa el ancho;
- exporta `BotonEmpezarGuia` y `SinFicha` para que cualquier sala pueda ofrecer
  su propia guía sin duplicar código.

### `/descubrir` — el mapa entero

`src/app/descubrir/page.tsx` (servidor: `metadata`, portada con foto real y
cuatro cifras reales) + `descubrir-cliente.tsx`, en cuatro bloques:

1. **Empezar** — la guía sugerida en una tarjeta y las cuatro guías con sus
   pasos pulsables (marcar como hecho, retomar).
2. **Todas las salas** — buscador (nombre, ruta, qué es, ejemplos) + filtros por
   todas las divisiones + fichas desplegables con sus ejemplos + puertas de
   entrada + **sorpresa** («llévame a algo que no conozco»).
3. **Lo nuevo** — los ocho destacados con su versión y su botón.
4. **Tu progreso** — porcentaje, barra, modo libre, reiniciar, y una nota que
   dice dónde vive todo: *en este aparato*.

### La banda de `/orden`

El índice de las 92 salas gana arriba una banda que lleva a la guía: quien
aterriza en `/orden` no debería comerse la casa entera de golpe. Va en el flujo,
no flota, no tapa.

---

## 3 · Lo que **no** se hizo, a propósito

- **No** se reescribió ninguna sala: las fichas *describen*, no sustituyen.
- **No** hay motor paralelo: los datos salen de `orden.ts`, `modulos.ts`,
  `novedades` y `espacios.ts`. `/novedades` y `help-panel.tsx` siguen siendo
  suyos y se enlazan, no se clonan.
- **No** hay voz nueva: la guía es escrita y visual (`MenteGlobal` está
  desmontada desde v434.2; la voz vuelve cuando haya clave).
- **No** hay nada simulado: ni un contador, ni una racha, ni una cifra que no
  salga del catálogo.

---

## 4 · Cómo comprobarlo

```bash
npx tsx tools/descubrimiento/probar.mts     # 47 comprobaciones, 0 fallos
```

La prueba cubre: existencia de las 95 fichas y de cada ruta de cada guía y de
cada destacado; la derivación de ejemplos; el prefijo más largo (`/mundos/do`);
la ruta inexistente → `null`; el número de divisiones que haya; que la portada no cuente; que
volver atrás no reste; el saneado del almacén sucio; `modoLibre` estricto; el
orden de los destacados por versión (comparación numérica, no alfabética).

En vivo: **`/descubrir`** (mapa completo) y la burbuja de abajo a la izquierda
en cualquier sala.
