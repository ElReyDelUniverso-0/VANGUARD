# VIDA · v422.3 — la capa que le da pulso a la casa

> Mandato del Dueño: *«más hermoso, colorido, dopamínico; interactivo; que se sienta de otro mundo; cambiar lo aburrido, la letra, el menú; un algoritmo de impresiones; que se sienta que hay personas reales dentro.»*
> Y después: *«míralo, mejóralo, supera lo que hiciste, hazlo 100 veces mejor, púlalo.»*

## Qué es

`VIDA` es una **capa de identidad** montada encima de lo que ya existe. No reescribe ninguna hoja anterior ni ningún componente de otro agente: cambia **color, letra, luz y movimiento**. Cero geometría (ni anchos, ni rejillas, ni posiciones de las salas), para que ninguna sala se rompa.

| Archivo | Qué hace |
|---|---|
| `src/app/vida.css` | La identidad: paleta, Inter, aurora con paralaje, grano, foco, cabecera de cristal, pestañas, tarjetas 3D, órbita, ruleta, progreso, cortina. **Se importa la ÚLTIMA** en `layout.tsx`. |
| `src/components/vida/aurora.tsx` | Cinco orbes con **paralaje al puntero** (una variable CSS por frame) y foco de luz. Se apaga en táctil, con menos movimiento y en `/vanguard2`. |
| `src/components/vida/cortina.tsx` | Arranque en **tres tiempos**: marca desenfocada → lema → módulos reales parpadeando → línea que se llena. Una vez por sesión, 1,7 s, se quita con un toque/tecla/rueda. |
| `src/components/vida/orbita.tsx` | **El menú 2**: botón magnético con anillo cónico, velo que desenfoca, **buscador en vivo**, dos grupos, flechas y Esc (foco devuelto), y **cada puerta anota su impresión**. |
| `src/components/vida/para-ti.tsx` | **El carril 2**: tarjetas con inclinación 3D y luz que sigue al ratón, **ruleta «Sorpréndeme»**, medidor vivo, «Ver doce», «Borrar lo aprendido». |
| `src/components/vida/progreso.tsx` | Línea de luz con el avance de lectura + aparición al desplazar (solo si monta; sin JS todo se ve). |
| `src/lib/vida/algoritmo.ts` | **El motor**: puntuación, decaimiento, ruleta, resumen. Puro, determinista y explicable. |
| `src/lib/vida/senal.ts` | **La memoria central**: una sola clave, tolerante a basura. La usan el carril y el menú. |
| `scripts/pruebas-vida.mjs` | **28 pruebas** (`node scripts/pruebas-vida.mjs`). |

## El algoritmo de impresiones

| Señal | Puntos | Qué significa |
|---|---|---|
| Favorito declarado (`vg171-favoritos`) | **+8,0** | lo fijaste tú con la estrella |
| Impresiones propias (`vg195-atajos-usage` + `vx421-vida-vistos`) | **+2,2 × min(aperturas, 8)** | vuelves mucho por aquí |
| Afinidad de grupo | **+1,4 × min(aperturas del grupo, 6)** | cerca de lo que más abres |
| Novedad | **+3,0 × (1 − decaimiento)** | nunca abierto = 3 · hace un rato = 0 · hace un mes ≈ 3 |
| Repetición reciente | **−4,0 × decaimiento** | no repetir lo de hace un momento |

- **Decaimiento:** vida media de 3 días. El olvido es **simétrico**: lo que hace un mes que no abres vuelve a ser «nuevo» y deja de estar penalizado.
- **Determinista:** mismas señales → mismo orden (desempate por hash FNV-1a). El servidor pinta un orden estable y el aparato lo personaliza al hidratar: sin saltos.
- **Explicable:** cada fila lleva `razon` y `detalle` con los cinco sumandos.
- **La ruleta** (`elegirSorprendente`) es la sorpresa **con memoria**: nunca lo que ya estás viendo, nunca lo abierto en la última hora, primero lo que nunca tocaste, reproducible con la misma semilla.

## Honestidad sobre los datos

- Todo se calcula **en el aparato**. No hay perfil en servidor, ni analítica: **nada sale del dispositivo**.
- `vg195-atajos-usage` está indexado por **pestaña del cuartel**, no por ruta: en la práctica mandan la afinidad de grupo y las impresiones propias. El motor acepta las dos formas por si cambia.
- Si mañana se enciende la nube, este módulo sigue decidiendo; solo cambia de dónde lee.

## Accesibilidad y rendimiento

- Respeta los **tres niveles** de la casa (`data-vg-anim`) **y** `prefers-reduced-motion`: con «desactivadas» o con menos movimiento no hay aurora animada, ni cortina, ni foco, ni inclinación, ni entradas escalonadas.
- La aurora anima solo `transform`/`opacity`; el grano es un SVG en línea de **220 bytes** (cero peticiones).
- El botón orbital sube por encima de la barra de pestañas en móvil (`z-index: 61`, `bottom: 72px + safe-area`).
- La aparición al desplazar **solo se activa si el script monta** (`.vida-mira`), con red de seguridad a 1,5 s: nada se queda invisible.
- **Cero bytes nuevos de fuente:** Inter ya viajaba en `--font-inter` desde la v400.0.

## Cómo verificar

```bash
node scripts/pruebas-vida.mjs          # 28 pasan · 0 fallan
```

En producción: la portada debe traer `vida-progreso`, `vida-aurora`, `vida-orbita`, `vida-ruleta` y las seis tarjetas; `/vanguard2` **no** debe traer órbita, aurora ni cortina.
