# Cómo entra un área nueva en VANGUARD

*Documento de integración para los 22 departamentos del plan (y para los que vengan).*
*v414.0 · Arquitectura maestra (IA 1).*

La casa tiene autoridad repartida: cada departamento manda en su materia. Lo que **no** se
negocia es la arquitectura común, porque veintiún criterios distintos ya han roto plataformas
más grandes que esta. Estas ocho piezas son el contrato. No son consejos: `scripts/pruebas-arquitectura.mjs`
comprueba las que se pueden comprobar desde el árbol y dice en voz alta las que no.

---

## Las ocho piezas

| # | Pieza | Qué tiene que existir | Quién lo comprueba |
|---|---|---|---|
| 1 | **Puerta canónica** | Una ruta pública que representa el área. Las demás son alias vivos, no competidoras en el índice. | `src/app/<área>/page.tsx` + censo |
| 2 | **Registro** | Entrada en un registro (Núcleo o el del área) con id, ruta y permisos. La página lee del registro. | `src/lib/nucleo/registro.ts` |
| 3 | **Origen del dato** | Cada número con fuente, licencia, fecha de captura y límites. Sin dato → «sin dato». | `src/lib/datos/catalogo.ts` |
| 4 | **Contrato de máquina** | Si sirve datos, `/api/…` con `{ok, api, version, datos|error, meta}` y entrada en el catálogo. | `src/lib/api/catalogo.ts` |
| 5 | **Ida y vuelta** | El área enlaza a las existentes y pide el enlace de vuelta. Cero páginas huérfanas. | `src/lib/arquitectura/grafo.json` |
| 6 | **Límites escritos** | Lo que no se sabe, no se mide o no se puede sostener, se dice antes de que lo descubra el visitante. | revisión humana |
| 7 | **Prueba ejecutable** | Al menos una comprobación en `scripts/` que falle si su registro miente. | esa prueba |
| 8 | **Constancia** | Versión, bitácora, bandeja de mejoras y worklog: donde miran las otras IA. | esos ficheros |

Un área que solo tiene interfaz **no** está hecha. La casa no marca como completado lo que no
funciona: si una pieza es una pantalla sin motor detrás, cuenta como «sin construir» en
`/arquitectura`.

---

## El camino corto (lo que se hace, en orden)

1. **Mira antes de escribir.** `curl "https://<dominio>/api/sistema/arquitectura?seccion=todo"`
   te da el censo, las áreas con más tráfico, los huecos y el estado de tu departamento. Si tu
   área ya existe parcialmente, no la dupliques: extiéndela.
2. **Declara la puerta** en `src/lib/nucleo/registro.ts` (id `mod:tu-area`, ruta real, permiso,
   dependencias `mod:`/`fnt:` que **ya existan**). El registro se escribe antes que la página.
3. **Si traes datos**, añade tu modelo a `src/lib/datos/catalogo.ts` con procedencia, licencia,
   captura, caché y límites. Si el dato es de otro, se enlaza y se cita; no se copia.
4. **Si sirves datos a máquinas**, escribe `src/app/api/<área>/route.ts` con
   `conManejo` + `ok`/`fallo` + `muro` + `cacheable` (ver `src/lib/sistema/contrato.ts`), y
   regístralo en `src/lib/api/catalogo.ts` (documentado si el contrato está revisado;
   inventariado si existe y aún no).
5. **Conecta**: enlaces de entrada desde las salas existentes y de vuelta desde la tuya. El
   censo cuenta referencias; una página con 0 se publica como huérfana.
6. **Escribe la prueba** en `scripts/pruebas-<área>.mjs`: que falle si tu registro apunta a una
   ruta que no existe o si un dato publicado no tiene fuente.
7. **Deja constancia** en `src/lib/version.ts`, `src/lib/bitacora.ts`,
   `agent-ctx/improvement-inbox.md` y `worklog.md`.
8. **Publica**: rama → PR → squash → esperar despliegue → **verificar en producción**
   (los previews de Vercel dan 302 y no valen como prueba).

---

## Dónde escribe cada departamento

La regla es simple: **un área, una carpeta**. El motor en `src/lib/<área>/`, las piezas de
interfaz en `src/components/<área>/`, la puerta en `src/app/<área>/`. Nada de motores dentro de
una página: la página lee del registro.

| # | Departamento | Motor | Puerta | Datos que declara |
|---|---|---|---|---|
| 1 | Arquitectura maestra | `src/lib/arquitectura/` | `/arquitectura` | censo, grafo |
| 2 | Redacción editorial | `src/lib/editorial/` | `/editorial` | `dato:documento` |
| 3 | Enciclopedia mundial | `src/lib/mundos/` | `/mundos` | `dato:pais`, `dato:ficha-pais` |
| 4 | Atlas histórico | `src/lib/historia/` | `/historia` | `dato:acontecimiento` |
| 5 | Ciencia y descubrimiento | `src/lib/ciencia/` | `/ciencia` | por declarar |
| 6 | Tecnología y futuro | `src/lib/tecnologia/` | `/tecnologia` | por declarar |
| 7 | Economía y datos | `src/lib/economia/` | `/economia` | `dato:indicador`, `dato:moneda` |
| 8 | Sociedad y cultura | `src/lib/sociedad/` | `/sociedad` | por declarar |
| 9 | Planeta y medioambiente | `src/lib/planeta/` | `/demografia` · `/regiones` | `dato:poligono` |
| 10 | Cartografía global | `src/lib/mapas/` | `/mapas` | `dato:poligono`, `dato:punto` |
| 11 | Simulaciones educativas | `src/lib/labs/` | `/labs` | `dato:simulacion` |
| 12 | Estudio de visualización | `src/components/datos/` | `*` (piezas) | — |
| 13 | Documental y multimedia | `src/lib/audios/` · `src/components/` | `/audios` · `/galeria` | — |
| 14 | Academia | `src/lib/academia/` | `/academia` | — |
| 15 | Motor de explicaciones | `src/lib/explicar/` | `/explicar` | reutiliza |
| 16 | Investigación y actualidad | `src/lib/investigacion/` | `/investigacion` | `dato:cable` |
| 17 | Fuentes y verificación | `src/lib/fuentes/` | `/calidad` | procedencia |
| 18 | Buscador y descubrimiento | `src/lib/busqueda/` | `/buscar` | — |
| 19 | Distribución social | `src/lib/distribucion/` | `/creadores` | — |
| 20 | Comunidad | `src/lib/comunidad/` | `/comunidad` | — |
| 21 | Auditoría de crecimiento | `src/lib/metricas/` | `/estado` | por declarar |
| 22 | Experiencia e integración | `src/components/vanguard/` | `/navegacion` | — |

*Las rutas marcadas con `*` no son puertas nuevas: son piezas que otras páginas montan.*

---

## Las cinco formas de romper la casa (y cómo evitarlas)

1. **Duplicar una puerta que ya existe.** Antes de crear `/mi-area`, mira el censo y
   `/directorio`. Si tu tema ya tiene sala, se extiende; no se abre otra.
2. **Servir datos sin procedencia.** Un gráfico con números sin fuente es una promesa que no se
   puede cumplir. `dato:` o no se publica.
3. **Inventar un endpoint que no existe** o cambiar la forma de uno vivo sin subir su versión.
   El contrato manda: `api` es la versión de la interfaz; `version`, la del producto.
4. **Cerrar una ruta para «reordenar».** La evolución es aditiva: fusionar aquí es declarar la
   puerta canónica, no borrar las demás.
5. **Dejar la página huérfana.** Una sala sin enlace de entrada es una sala que nadie encuentra:
   el censo la publica como hueco y la entrega no se considera cerrada.

---

## Cómo consultarlo sin leer el código

```bash
curl "https://<dominio>/api/sistema/arquitectura"                       # resumen
curl "https://<dominio>/api/sistema/arquitectura?seccion=grafo"          # áreas y peso
curl "https://<dominio>/api/sistema/arquitectura?seccion=huecos"         # lo que falta
curl "https://<dominio>/api/sistema/arquitectura?seccion=piezas"         # el contrato
curl "https://<dominio>/api/sistema/arquitectura?seccion=departamentos"  # los 22, con su estado
```

Y para regenerar el mapa cuando cambie el árbol:

```bash
node tools/arquitectura/censar.mjs    # censo del árbol (páginas, rutas, referencias)
node tools/arquitectura/grafo.mjs     # grafo de áreas y dependencias
node scripts/pruebas-arquitectura.mjs # que los dos mapas sigan diciendo la verdad
```
