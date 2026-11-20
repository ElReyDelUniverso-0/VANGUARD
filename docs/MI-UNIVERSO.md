# MY UNIVERSE · el espacio personal

`/mi-universo` · v421.8 · agente 05

Un espacio configurable donde cada persona organiza **su** experiencia dentro de
Vanguard: añade módulos reales, los arrastra, cambia su tamaño, los agrupa en
zonas propias, crea espacios independientes, cambia de distribución y de tema,
guarda copias y vuelve atrás.

No es un dashboard: no hay widgets inventados ni paneles flotantes. Cada pieza
es la **puerta** de una sala que ya existe.

---

## 1. De dónde salen las piezas (cero copias)

| fuente | qué aporta |
|---|---|
| `src/components/portada/modulos.ts` | los 9 módulos y sus pestañas: las salas reales |
| `src/lib/navegacion/espacios.ts` | los 11 espacios de trabajo, sus herramientas y su color |

`src/lib/mi-universo/catalogo.ts` los cruza, quita rutas repetidas y expone el
catálogo. **Ningún `href` está escrito a mano**: si una sala desaparece del
registro, desaparece de la paleta; si aparece una nueva, entra sola. Una pieza
sin ficha (un trazado viejo) se dibuja como «puerta retirada» y se puede quitar
sin miedo — el módulo, si existe, sigue en la casa.

## 2. Persistencia: lo que se investigó y lo que se decidió

Esto es lo importante del proyecto, así que va con las medidas delante.

**Lo que hay** (inspeccionado el 2026-11-20):

- Autenticación **real**: cookie `vg_session` firmada con HMAC-SHA256
  (`src/lib/auth-server.ts`), modelo `Account` en Prisma y las rutas
  `/api/auth/{register,login,logout,me,save}`.
- **Pero la base no es durable.** `src/lib/db.ts` sirve SQLite comprometida en
  el repositorio y, como el sistema de archivos del lambda en Vercel es de solo
  lectura, **copia la base a `/tmp`** — y `/tmp` es por instancia: cada arranque
  en frío vuelve al archivo del repo. El `saveJson` de las cuentas vive ahí.
- `DATABASE_URL` existe en producción, pero el cliente Prisma solo acepta
  rutas `file:`; el esquema generado es SQLite. No hay base remota en juego.

**Lo que se hizo con eso:** el espacio se guarda **en este dispositivo**, con
una clave por cuenta:

```
vx421-my-universo:PRUEBAMU045822
vx421-my-universo:INVITADO
```

- Dos cuentas en el mismo navegador **no se mezclan**.
- Un invitado que se registra **reclama** su espacio: se copia a la clave de su
  cuenta solo si la cuenta todavía no tiene uno. Nunca se sobrescribe.
- **Exportar / Importar** (JSON) es la forma real de llevar el espacio a otro
  aparato. La importación pasa por el mismo validador que el guardado local.

**Nada en la interfaz dice «en la nube»**, porque no lo está. El botón de la
barra dice *Este dispositivo* y abre un panel que explica por qué.

`/api/mi-universo` existe para decir la verdad y para preparar el día que haya
base durable:

- `GET` → `{ autenticado, usuario, nube, motivo, detalle }` (capacidad real).
- `PUT` → **409** con el motivo mientras no haya base durable. Preferimos un
  rechazo honesto a un `200` que no guarda nada.

### Cómo se enciende la nube (cuando se quiera)

1. Base durable de verdad (Postgres/Supabase) y `prisma/schema.prisma` con ese
   proveedor — `prisma/schema.supabase.prisma` ya existe como punto de partida.
2. Modelo de espacios personales (`username` + `json` + `actualizado`), aplicado
   al esquema.
3. `MI_UNIVERSO_NUBE=1` en Vercel. Ese flag junto a una base remota es lo que
   `durabilidad()` exige para responder `nube: true`.

Hasta entonces el camino honesto es dispositivo + archivo.

## 3. El motor (`src/lib/mi-universo/modelo.ts`)

Lógica pura, sin React ni DOM, para poder probarla entera en node.

- **Parrilla** de 6, 8 o 12 columnas y filas de 104 px; cada pieza ocupa
  `ancho × alto` celdas con posición explícita.
- **Acomodo**: toda mutación termina en `acomodar`, que reordena (favoritos
  primero, luego fila y columna) y recoloca en el primer hueco. **Dos piezas no
  pueden solaparse nunca.**
- **Mover**: arrastrar sobre otra pieza las **intercambia**; no expulsa ni
  duplica. Arrastrar al hueco libre de una zona la muda.
- **Tamaños**: ancho y alto se ajustan con botones (funciona en móvil, donde el
  arrastre HTML5 no existe).
- **Zonas**: crear, renombrar y quitar. Quitar una zona **muda** sus piezas a la
  primera; no borra nada.
- **Distribuciones**: mando, mosaico, lectura, torre. Reordenan el mismo
  contenido; no cambian lo que hay.
- **Temas**: obsidiana, abisal, ámbar, jade (acento, fondo, tinta y borde).
- **Espacios independientes**: cada uno con su parrilla, zonas y tema; el
  último no se puede borrar.
- **Copias**: hasta 20 instantáneas con etiqueta y fecha; recuperar restaura el
  trazado exacto.
- **Validación**: todo lo que entra de fuera (archivo, localStorage) se recorta
  —columnas imposibles, anchos fuera de rango, zonas fantasma, ids repetidos— y
  se reacomoda. Un JSON roto **no** puede romper el espacio: se rechaza y no se
  toca nada.

## 4. Integración con la navegación (sin tocar al agente 03)

`src/lib/navegacion/espacios.ts` declara en su cabecera la regla ③:

> «Un espacio nuevo (o una herramienta nueva) es una entrada más en estas
> listas: ni la barra, ni la sala /navegacion, ni el buscador se tocan.»

Pues exactamente eso: **una entrada** (`mi-universo`) en las herramientas del
espacio `miespacio` y su ruta en `detecta.rutas`. No se ha modificado la barra
adaptativa, ni `hoja-espacios.tsx`, ni `/navegacion`, ni ningún componente del
agente 03. `/espacio` (la mesa de proyectos, v405.11) sigue intacta y My
Universe la incluye como pieza de su propio catálogo: son dos salas del mismo
espacio, no dos versiones de lo mismo.

## 5. Archivos

```
src/lib/mi-universo/modelo.ts        motor puro (parrilla, zonas, copias, validación)
src/lib/mi-universo/catalogo.ts      catálogo derivado de los registros reales
src/lib/mi-universo/almacen.ts       guardado local por cuenta + exportar/importar
src/app/api/mi-universo/route.ts     capacidad real del servidor (no finge)
src/app/mi-universo/page.tsx         portada de sala + arranque
src/app/mi-universo/universo-cliente.tsx  parrilla, paleta, barra y paneles
src/components/mi-universo/pieza-tarjeta.tsx  la pieza (puerta), arrastrable
scripts/pruebas-mi-universo.mjs      16 pruebas del motor
```

## 6. Pruebas

```bash
node scripts/pruebas-mi-universo.mjs
```

Cubre: nacer un espacio válido · añadir sin duplicar · mover sobre pieza
ocupada (intercambio) · mover entre zonas · redimensionar con límites ·
quitar acceso sin tocar el resto · favoritos primero · zonas sin perder piezas ·
las cuatro distribuciones · restaurar original · instantánea guardar/romper/
recuperar · espacios independientes (nunca a cero) · serializar ↔ deserializar
idéntico · basura rechazada · importación recortada · resumen correcto.

**Medido:** 16 pasan · 0 fallan.

## 7. Límites conocidos (dichos, no escondidos)

- El guardado vive en el navegador: **otro aparato no lo ve** salvo que exportes
  e importes. Es la consecuencia directa de que la base sea efímera.
- El arrastre es HTML5: en pantallas táctiles se usan los botones de tamaño y las
  acciones de la pieza, que hacen lo mismo.
- El límite práctico de `localStorage` (~5 MB) no se va a rozar: un espacio con
  60 piezas ocupa unos pocos KB.
- Las piezas son puertas, no incrustaciones: no hay iframes de las salas (sería
  otra copia de la herramienta y multiplicaría el peso).
