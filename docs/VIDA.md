# VIDA · v421.9 — la capa que le da pulso a la casa

> Mandato del Dueño: *«más hermoso, colorido, dopamínico; interactivo; que se sienta de otro mundo; cambiar lo aburrido, la letra, el menú; un algoritmo de impresiones; que se sienta que hay personas reales dentro.»*

## Qué es

`VIDA` es una **capa de identidad** montada encima de lo que ya existe. No reescribe ninguna hoja anterior ni ningún componente de otro agente: cambia **color, letra, luz y movimiento**. Cero geometría (ni anchos, ni rejillas, ni posiciones de las salas), para que ninguna sala se rompa.

| Archivo | Qué hace |
|---|---|
| `src/app/vida.css` | La identidad: paleta, tipografía, aurora, foco, cabecera y barra de pestañas, tarjetas, menú orbital, cortina, aparición al desplazar. **Se importa la ÚLTIMA** en `layout.tsx`: a igual especificidad gana, sin un solo `!important` contra nadie. |
| `src/components/vida/aurora.tsx` | Cuatro orbes de luz que respiran (solo `transform`/`opacity`) y un foco que sigue al puntero con `requestAnimationFrame`. En táctil no hay foco; con menos movimiento, no se monta el seguimiento. |
| `src/components/vida/cortina.tsx` | Arranque tipo tráiler: 1,7 s, una vez por **sesión** (`sessionStorage`), se quita con un toque, una tecla o la rueda. No se renderiza en servidor. |
| `src/components/vida/orbita.tsx` | **El menú nuevo.** Botón flotante que despliega los módulos reales con su color y entrada escalonada. Cierra con Esc, con un toque fuera o al elegir. `aria-expanded` real. No aparece en `/vanguard2` (ahí manda el 3D). |
| `src/components/vida/para-ti.tsx` | **El carril personalizado.** Tu tarjeta (avatar con degradado estable, inicial, nombre de `/api/auth/me`) y seis puertas ordenadas por tus impresiones, cada una con su razón escrita. |
| `src/lib/vida/algoritmo.ts` | **El motor de impresiones.** Puro, sin DOM, determinista y explicable. |
| `scripts/pruebas-vida.mjs` | 20 pruebas del motor (`node scripts/pruebas-vida.mjs`). |

## El algoritmo de impresiones

Puntúa cada puerta sobre 0–30 puntos, todo sumable y auditable:

| Señal | Puntos | Qué significa |
|---|---|---|
| Favorito declarado (`vg171-favoritos`) | **+8,0** | lo fijaste tú con la estrella |
| Impresiones propias (`vg195-atajos-usage` + `vx421-vida-vistos`) | **+2,2 × min(aperturas, 8)** | vuelves mucho por aquí |
| Afinidad de grupo | **+1,4 × min(aperturas del grupo, 6)** | cerca de lo que más abres |
| Novedad | **+3,0 × (1 − decaimiento)** | nunca abierto = 3 · hace un rato = 0 · hace un mes ≈ 3 |
| Repetición reciente | **−4,0 × decaimiento** | no repetir lo de hace un momento |

- **Decaimiento:** vida media de **3 días** (`0,5 ^ (edad / 3 días)`). El olvido es **simétrico**: lo que hace un mes que no abres vuelve a ser «nuevo» y deja de estar penalizado. Nada queda castigado para siempre (lo detectó una prueba que falló: se corrigió el modelo, no la prueba).
- **Determinista:** mismas señales → mismo orden. El desempate es por hash FNV-1a del id, así que dos cargas seguidas no bailan.
- **Explicable:** cada fila lleva `razon` («lo fijaste tú», «vuelves mucho por aquí», «lo abriste hace un momento», «hace tiempo que no entras», «nunca lo has abierto») y `detalle` con los cinco sumandos.

### Honestidad sobre los datos

- Todo se calcula **en el aparato**. No hay perfil en servidor, ni cuenta, ni analítica: **nada sale del dispositivo**.
- El servidor pinta un orden de arranque **estable** (sin `Date.now()`), y el aparato lo personaliza al hidratar: sin saltos ni parpadeos de hidratación.
- Si mañana se enciende la nube, este módulo sigue decidiendo; solo cambia de dónde lee.
- Las señales reales de la casa se leen con tolerancia: `vg195-atajos-usage` está indexado por `TabKey` (pestañas del cuartel), no por ruta, así que en la práctica manda la afinidad de grupo y las impresiones propias. Se dice aquí para no prometer lo que no es.

## Accesibilidad y rendimiento

- Respeta los **tres niveles** de la casa (`data-vg-anim`: completas / reducidas / desactivadas) **y** `prefers-reduced-motion`: con «desactivadas» o con menos movimiento, no hay aurora animada, ni cortina, ni foco, ni entradas escalonadas.
- La aurora solo anima `transform` y `opacity` (nada que obligue a repintar el texto encima); en móvil baja el `blur` y la opacidad.
- El botón orbital sube por encima de la barra de pestañas en móvil (`z-index: 61`, `bottom: 72px + safe-area`) para no taparla ni robarle el toque.
- La cortina no se gasta si la pestaña está en segundo plano (prefetch de Google) ni si el sistema pide menos movimiento.
- **Cero bytes nuevos de fuente:** Inter ya viajaba en `--font-inter` desde la v400.0; esta capa solo la usa.

## Cómo verificar

```bash
node scripts/pruebas-vida.mjs          # 20 pasan · 0 fallan
```

En producción, tras el build: en la portada debe aparecer la sección **«Sección 00 · Para ti»** con seis tarjetas, y el botón orbital abajo a la derecha (no en `/vanguard2`). Con «animaciones desactivadas» en Ajustes, la cortina desaparece y la aurora queda quieta.
