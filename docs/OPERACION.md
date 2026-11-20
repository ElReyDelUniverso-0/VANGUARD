# OPERACIÓN · v431.2 — la casa pasa a sistema clasificado

> Mandato del Dueño: *«cambia toda la estética de Vanguard completamente: sea secreta, militar, de gobierno, seria… y también sin piedad. Y todos los módulos, en uno solo.»*

## Qué hace esta capa

`src/app/operacion.css` se importa **después de todo** (también después de `vida.css`): es la última palabra estética. **No cambia ni un texto de contenido, ni una ruta, ni un comportamiento.** Cambia cómo se ve y cómo se siente.

### 1 · El repintado se hace por tokens, no a martillazos

La casa ya tenía sus tokens centrales (`--vx-*`). Reescribiéndolos, **cambia la portada entera de una vez** sin tocar las 6.700 líneas de nadie:

| Token | Antes | Ahora | Por qué |
|---|---|---|---|
| `--vx-bg` | `#06080c` | `#050607` | negro de sala cerrada |
| `--vx-card` | `#0d1118` | `#0b0e10` | cartón de expediente |
| `--vx-gold` (acento) | `#e8c56a` (dorado) | `#dfe7ea` (**acero**) | un documento oficial no brilla en oro |
| `--vx-red` | `#ff3b30` | `#d81f26` | rojo de sello, no de neón |
| `--vx-cyan` | `#38bdf8` | `#7f9aa6` | acero frío |
| `--vx-r` (radio) | `6px` | **`0px`** | papel de expediente: sin esquinas |

Y los de VIDA (`--vida-1…5`) pasan a acero, ámbar de advertencia, rojo de sello, caqui de archivo y verde de autorizado.

### 2 · El fondo deja de ser un arcoíris

Fuera la aurora de colores. Entra:

- **retícula de sector** de 64 px (rejilla de mapa),
- **barrido de radar** cada 9 s (una línea que sube, muy tenue),
- **grano documental** y **viñeta** de sala oscura,
- un foco de puntero casi invisible (una mira, no una luz de discoteca).

### 3 · La voz: expediente, no revista

- Titulares en **mayúsculas** con **regla roja** delante.
- Fechas, cifras, códigos y etiquetas en **monoespaciada**.
- Movimiento **seco**: `steps()`, cero rebotes, cero `cubic-bezier` elástico.

### 4 · «Todos los módulos en uno» → la Terminal de mando

El menú (antes órbita) pasa a ser **una sola estructura con una sola numeración**:

- **M-01 … M-10** los módulos de la casa.
- **T-01 … T-04** tu lado (Mi universo, La arquitectura, tu mesa, El ecosistema).
- Grupos: **ORDEN DE BATALLA** y **PERSONAL**. Un solo cuerpo, un solo registro.

El comportamiento no cambia: buscador, flechas, Esc, `/`, recientes con su hora, estrellas marcadas.

> **Si lo que querías era lo contrario** —separar los módulos en vez de unificarlos— se revierte en un cambio de una línea: cada módulo vuelve a su grupo. Dímelo y lo hago.

### 5 · El resto de la casa

| Antes | Ahora |
|---|---|
| Cortina con degradado de colores | **Protocolo de acceso**: «SISTEMA CLASIFICADO · ACCESO AUTORIZADO», línea roja que se llena en 20 pasos |
| «Hola, invitado» | **«OPERADOR: INVITADO»** con cursor de terminal |
| Tarjetas con inclinación 3D y neón | **Fichas de expediente**: cuadradas, hairline, hover con barra roja (sin inclinación) |
| Estrella dorada brillante | **Sello rojo** que se estampa |
| Barra de progreso arcoíris | **Línea roja** de instrumento |
| — | **Sello de clasificación**: franja de peligro de 3 px arriba + «CONFIDENCIAL · SECTOR 05 · hh:mm:ssZ» (oculto en móvil y en `/vanguard2`) |

## Lo que NO se toca

- Rutas, textos de contenido, datos, ni el comportamiento de ninguna sala.
- Los componentes de otros agentes: se repintan **solo** por tokens y por clase propia.
- La casa inmersiva `/vanguard2`: sin franja, sin sello, sin terminal (el 3D manda).
- Accesibilidad: todo sigue respetando `data-vg-anim` (completas / reducidas / desactivadas) y `prefers-reduced-motion`.

## Cómo verificarlo

```bash
node scripts/pruebas-vida.mjs   # 35 pasan · 0 fallan (el motor no cambió)
```

En producción: la hoja `operacion.css` debe servirse **después** de `vida.css`; la portada debe traer `op-franja`, `op-sello` y la terminal con códigos `M-01`.
