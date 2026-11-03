# EL NÚCLEO DE VANGUARD — guía del sistema central

> v219.0 · El corazón que conecta los módulos sin acoplarlos.
> Ley de la casa: **todo conectado, nada aislado; nada privado, nada inventado.**

## Qué es

El Núcleo es la capa compartida del ecosistema Vanguard. Cualquier módulo
(página, API o feature) se registra aquí y obtiene, sin tocar a los demás:

1. **Presencia en el censo** — `/nucleo` lo lista con su categoría, ruta,
   permisos, estado y dependencias (descubrimiento sin saturar la interfaz).
2. **Presencia en la búsqueda global** — si su fuente es pública, un proveedor
   responde en `/api/nucleo/busqueda`.
3. **Entidades con id estable** — fórmula única `vg:<tipo>:<clave>` que sirve
   para relacionar y enlazar páginas entre sí.
4. **Enlaces contextuales** — chips «CONECTA CON EL NÚCLEO» server-rendered en
   las páginas relacionadas.

## Archivos del núcleo

| Archivo | Qué vive ahí |
| --- | --- |
| `tipos.ts` | Los 9 tipos de entidad, la fórmula de id `vg:…`, tipos de relación y `normalizar()`. |
| `registro.ts` | `MODULOS_NUCLEO`: el censo de módulos + consultas puras (por id, por ruta, dependencias). |
| `fuentes.ts` | `FUENTES_PUBLICAS` / `FUENTES_PRIVADAS` + el contrato `ProveedorBusqueda` / `ResultadoNucleo`. |
| `busqueda.ts` | El motor server-only: 9 proveedores públicos en paralelo, guarda de frontera, fallo honesto. |
| `acontecimientos.ts` | **v219 EL HISTORIADOR**: la semilla de los 9 acontecimientos reales (fecha histórica pública), la siembra idempotente con enlaces `regla:teatro` y las consultas de cronología. |
| `relaciones.ts` | Geografía real país↔teatro, `enlacesDeRegion/Pais/Cable/Modulo` y `fichaEntidad(id)`. |
| `../api/nucleo/*` | Las 4 APIs: `busqueda?q=`, `entidad?id=`, `modulos`, `acontecimientos` — todas con muro (ley v211). |
| `../../app/nucleo/page.tsx` | El salón central: censo, mapa de entidades, búsqueda, ficha de entidad (`?id=`), frontera de datos. |
| `../../../scripts/pruebas-nucleo.mjs` | Las pruebas: censo, búsqueda, relaciones, historiador, navegación, muro. |

## El eslabón NOTICIA ↔ ACONTECIMIENTO (v219)

Una **noticia** (`vg:noticia:<id>`, la tabla `NewsItem`) es una FUENTE de
información. Un **acontecimiento** (`vg:acontecimiento:<slug>`, la tabla
`Acontecimiento`) es el HECHO real que reúne varias noticias. Reglas:

- Los acontecimientos sembrados son hechos históricos públicos (con fecha
  `ocurridoDesde`); las noticias llevan su fecha de `publishedAt` — nunca se
  confunden el momento del hecho con el de su publicación.
- La tabla `NoticiaAcontecimiento` guarda cada asociación con su `metodo`
  (`regla:teatro` | `manual`): la procedencia de la asociación no se destruye
  nunca, y la atribución original de cada cable (su `source`) queda intacta.
- La siembra corre IDEMPOTENTE en el arranque del servidor
  (`instrumentation-node.ts`) y re-enlaza los cables nuevos del sync.
- Un cable sin acontecimiento asociado simplemente no lleva el chip
  «PARTE DE» — no se fuerza ninguna relación.

## CÓMO AÑADIR UN MÓDULO NUEVO (4 pasos, sin tocar todo el sistema)

### Paso 1 — Regístralo en el censo (`registro.ts`)

```ts
{
  id: "mod:mi-modulo",              // prefijo mod: + slug estable, jamás se recicla
  nombre: "MI MÓDULO",
  lema: "Una línea que lo explique",
  descripcion: "Qué hace de verdad y con qué datos reales",
  categoria: "MUNDO",               // REDACCION | MUNDO | SIMULACION | COMUNIDAD | SISTEMA
  ruta: "/mi-modulo",               // la puerta real que YA existe en src/app/
  permiso: "publico",               // publico | cuenta | dueno (se juzga en el servidor)
  estado: "VIVO",                   // VIVO | BETA | PLAN (honestidad)
  dependencias: ["fnt:cables"],     // módulos (mod:) y fuentes (fnt:) de los que vive
  alias: "términos extra de búsqueda",
  idEntidadComo: "vg:mapa:mi-modulo", // SOLO si el módulo es un mapa o una simulación
}
```

### Paso 2 — Si publica datos, declara su fuente (`fuentes.ts` + `busqueda.ts`)

Añade la fuente a `FUENTES_PUBLICAS` (o a `FUENTES_PRIVADAS` si contiene datos
de personas: entonces **no** lleva proveedor y la búsqueda jamás la consulta).
Si es pública, crea su proveedor en `PROVEEDORES` (busqueda.ts):

```ts
{
  fuente: fuentePublica("fnt:mi-fuente"),
  async buscar(q, limite) {
    // pregunta SOLO a tus datos reales; devuelve ResultadoNucleo[]
    return misDatos.filter(/*…*/).slice(0, limite).map((x) => ({
      entidad: { id: idEntidad("documento", x.id), tipo: "documento", nombre: x.titulo },
      titulo: x.titulo,
      subtitulo: "MI MÓDULO · …",
      ruta: "/nucleo?id=…",        // un destino que EXISTE
      origen: "fnt:mi-fuente",
    }));
  },
}
```

Reglas del contrato: `q` llega normalizado (minúsculas, sin acentos); nada de
datos ficticios; si tu fuente falla, devuelve `[]` o deja que `Promise.allSettled`
la marque como fallo — jamás se inventa relleno.

### Paso 3 — Si produce entidades y conexiones (`tipos.ts` + `relaciones.ts`)

- Crea ids con `idEntidad(tipo, clave)` — nunca concatenes a mano.
- Si tu módulo conecta con teatros/países, añade sus enlaces en
  `enlacesDeRegion` / `enlacesDePais` o crea `enlacesDeMiModulo()` y móntalos
  en tu página con `<EnlacesNucleo enlaces={…} />` (server, cero JS).

### Paso 4 — Demuéstralo (`scripts/pruebas-nucleo.mjs`)

Añade su caso al script de pruebas (que existe, no lo reinventes):

```js
await verificar("mi módulo en el censo", async () => {
  const j = await pedirJson("/api/nucleo/modulos");
  afirmar(j.modulos.some((m) => m.id === "mod:mi-modulo"), "no está en el censo");
});
```

Y pásalo: `node scripts/pruebas-nucleo.mjs http://localhost:3000`.
El script verifica por defecto: censo íntegro (ids únicos, rutas reales,
dependencias existentes), búsqueda con resultados reales y sin fuentes
privadas, fichas de entidad con enlaces que responden 200, navegación
(/nucleo, sitemap) y muro anti-ráfaga.

## Seguridad y fiabilidad (lo que JAMÁS se rompe)

- **Autorización en el servidor.** El permiso del censo se juzga en server
  (`permiso` + sesiones v15/v204); el client solo lo MUESTRA, nunca lo decide.
- **Frontera de fuentes.** `esFuentePublica()` es una guarda dura: un proveedor
  sin fuente pública declarada ni siquiera arranca. Las privadas
  (`fnt:cuentas`, `fnt:jugadores`, `fnt:telemetria`, `fnt:conversacion`) no
  tienen proveedor y por tanto no existen para la búsqueda.
- **Sin ejecución de código aportado por usuarios.** El núcleo jamás evalúa
  contenido de usuarios; los audios viven como bytes en MediaFile y se sirven
  por `/api/media/[id]`, nunca como código.
- **Sin secretos en el núcleo.** Nada de claves aquí: las credenciales viven en
  variables de entorno (`DATABASE_URL`, …) como el resto de la casa.
- **Sin datos ficticios.** Cada cifra de `/nucleo` sale de un `count()` real o
  de un catálogo real; si la BD falla, la cifra es 0 y se declara el fallo.

## Compatibilidad

El Núcleo no mueve ni renombra nada: todas las rutas de la casa siguen igual.
`/nucleo` añade una capa de descubrimiento (censo + búsqueda + fichas) y las
páginas existentes ganan los chips contextuales. Si algún día una ruta cambia,
regístrala con su ruta nueva y deja redirección en `next.config` — el id
estable `mod:…` no se recicla jamás.
