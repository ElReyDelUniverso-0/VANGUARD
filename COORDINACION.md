# COORDINACIÓN AGENT 1 ↔ AGENT 2 — VANGUARD

> Documento vivo de coordinación. Si vas a tocar una parte de Vanguard,
> mira primero aquí quién la está trabajando y qué contratos ya existen.
> Última actualización: v219.0 (Agent 2).

## Quién es quién

| Agente | Rol | Responsabilidad |
| --- | --- | --- |
| **Agent 1** | Producto / UX | Visión, referencias, flujos de usuario, experiencia de funciones. |
| **Agent 2** | Sistemas / Implementación | Ejecución técnica, datos, integraciones, arquitectura, rendimiento, seguridad, verificación. |

## El sistema hoy (examen verificado, no suposiciones)

- **Stack**: Next.js 16 + TypeScript + Tailwind 4 + Prisma **SQLite** (`db/custom.db`, viaja en el repo). Despliegue: Vercel (app viva `vanguard-kq9r.vercel.app`).
- **Datos reales**: 1.877 cables (GDELT + 18 medios RSS) con `externalId` único, `conflictTag` (teatro), `sourceCountry` (ISO-2), `tacticalTag`, `publishedAt`. Escuchas oficiales ONU/OMS/ReliefWeb en el modo espía. Sin servicios de pago.
- **Núcleo (v218)**: registro de 19 módulos (`src/lib/nucleo/registro.ts`), entidades con id estable `vg:<tipo>:<clave>` (`tipos.ts`), frontera de datos pública/privada (`fuentes.ts`), búsqueda global con 8 proveedores públicos (`busqueda.ts`), fichas de entidad (`relaciones.ts`), página `/nucleo` indexable, muros por objeto (ley v211). Pruebas: `scripts/pruebas-nucleo.mjs` (25 casos).
- **Voces y comunidad (v217)**: `/audios` con grabador, selector de 6 voces, parte de guerra que explica (`src/lib/emisor-guerra.ts`), cuentas reales (`Account`).

## Contratos estables — no romper

1. **Id de entidad**: `vg:<tipo>:<clave>` — 9 tipos: `pais, region, acontecimiento, documento, fuente, mapa, analisis, simulacion, noticia`. La fórmula vive SOLO en `src/lib/nucleo/tipos.ts::idEntidad()`. Jamás se recicla una clave.
2. **Frontera de datos**: las fuentes privadas (`fnt:cuentas, fnt:jugadores, fnt:telemetria, fnt:conversacion`) NO tienen proveedor de búsqueda ni API. Guarda en `busqueda.ts` + vigilada por pruebas.
3. **Fichas**: `fichaEntidad(id)` (server) es la única puerta de metadatos+enlaces de una entidad. La sirven `/nucleo?id=` y `/api/nucleo/entidad`.
4. **Enlaces contextuales**: puros (`enlacesDeRegion/Pais/Cable`) montan los chips «CONECTA CON EL NÚCLEO» en `/conflicto/[tag]` y `/noticia/[id]` sin tocar su lógica.
5. **Muros**: toda API nueva usa el muro por objeto (ley v211) y valida/limita en el SERVIDOR.

## Reparto de trabajo (evitar pisarnos)

| Zona | Dueño | Nota |
| --- | --- | --- |
| `src/lib/nucleo/**`, `prisma/schema.prisma`, APIs `/api/nucleo/**` | **Agent 2** | Agent 1 propone cambios de contrato aquí antes de tocar. |
| Páginas server (`/nucleo`, `/conflicto/[tag]`, `/noticia/[id]`, `/mundo`, `/espia`, `/traductor`) | Agent 2 estructura, Agent 1 experiencia | Los chips/enlaces del núcleo son del Agent 2; el resto de la página puede ajustar Agent 1 sin editar la lib. |
| Catálogos editoriales (`teatros.ts`, `atlas-data.ts`, `expedientes-datos.ts`, `oscura-data.ts`) | Ambos, con PR/review | Agent 1 añade contenido, Agent 2 cuida que el núcleo lo consuma. |
| UX de funciones nuevas (copy, layout, flujos) | **Agent 1** | Agent 2 deja los datos y puertas listas. |
| Juego/cuentas/moneda (`Player`, `Account`, missions) | Agent 2 | Solo rankings agregados son públicos. |

## Reglas de juego

- `git fetch` ANTES de tocar; push SIEMPRE al terminar la ronda (nunca dejar trabajo local sin empujar).
- Colisión de número de versión: la ronda anterior queda, la nueva sube (v219, v220…).
- Una ronda = tareas pequeñas y completas, con pruebas y verificación viva (`curl "?qa=$RANDOM"`).
- `db/custom.db` es SQLite de un solo escritor: backup en `media/rescate-db-*/` antes de tocar schema, NUNCA dos servidores escribiendo a la vez.
- QA mínimo por ronda: `npx tsc --noEmit` (filtrando ^examples/|^skills/), eslint de tocados, `npm run build` EXIT 0, pruebas del núcleo.
- Datos ficticios PROHIBIDOS: si una fuente no responde, «SIN SEÑAL» honesto. Demo = etiquetada como demo.

## Registro de integraciones cruzadas

- v219: Agent 2 añade el eslabón **noticia ↔ acontecimiento** (`Acontecimiento` + `NoticiaAcontecimiento` en Prisma; cables pasan de `vg:acontecimiento:<id>` a `vg:noticia:<id>`; 9 acontecimientos sembrados desde los teatros con fechas históricas públicas). Los chips de `/noticia` ganan «EL ACONTECIMIENTO ▸» sin tocar la página. Si Agent 1 está rediseñando `/noticia` o `/nucleo`, avisar aquí.
- v223: Agent 2 añade la fuente pública **fnt:indicadores** (Banco Mundial, CC BY 4.0 — atribución preservada, enlace al original): la ficha `vg:pais` de las naciones del eslabón MAPAS gana el bloque «INDICADORES REALES» (población, PIB, gasto militar, migración — con año del dato). `/api/nucleo/entidad` sirve el campo `indicadores` (aditivo, consumidores viejos intactos). La cadena del mandato queda: mapa → acontecimiento → país → indicadores → fuente. Si Agent 1 rediseña `/nucleo` o las fichas, el bloque es server-rendered en `page.tsx` (Ficha) — avisar aquí.
