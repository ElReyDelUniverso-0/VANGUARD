# VANGUARD CORE — los servicios compartidos de la casa

*v407.0 · Documento para los otros equipos (y para las otras IA).*

Este documento explica **lo que ya existe** en `src/lib/sistema`, `src/lib/api`,
`src/lib/datos` y `src/lib/nucleo`, y cómo usarlo sin romper nada. Todo lo que
aquí se describe está implementado y comprobado por
`scripts/pruebas-plataforma.mjs`.

---

## 1. El contrato de respuesta (`src/lib/sistema/contrato.ts`)

Toda respuesta NUEVA de la API tiene la misma forma:

```json
{
  "ok": true,
  "api": "1",
  "version": "v407.0",
  "datos": { },
  "meta": { "ts": "…", "ms": 12, "instancia": "a1b2c3", "cache": { "hits": 3 } }
}
```

Y todo error:

```json
{ "ok": false, "api": "1", "version": "v407.0",
  "error": { "codigo": "VALIDACION", "mensaje": "Falta «q».", "detalle": { "campo": "q" } },
  "meta": { … } }
```

- `api` es la versión de la **interfaz**; `version` es la del producto. No se
  confunden y no se mezclan.
- Los códigos de error son seis y están cerrados: `VALIDACION` (400),
  `NO_ENCONTRADO` (404), `MURO` (429), `PERMISO` (403), `PROVEEDOR` (502),
  `INTERNO` (500). Un cliente puede programar contra ellos.
- Nunca viaja un stack ni una consulta. El `detalle` se recorta con
  `limpiarDetalle()` (12 claves, cadenas de 200 caracteres).

**Cómo se escribe un endpoint nuevo:**

```ts
import { ok, fallo, conManejo, validar } from "@/lib/sistema/contrato";
import { muro, claveCliente } from "@/lib/fortaleza";

export const dynamic = "force-dynamic";

export const GET = conManejo("/api/mi-cosa", async (req, t0) => {
  const veredicto = muro(`mi-cosa:${claveCliente(req)}`, 30, 60_000);
  if (!veredicto.permitido) return fallo("MURO", `Espera ${veredicto.espera} s.`, undefined, { t0 });

  const q = validar.texto(new URL(req.url).searchParams.get("q"), "q", { max: 120, min: 2 });
  return ok({ q }, { t0 });
});
```

`conManejo` hace tres cosas por ti: cronometra, anota en el registro de
actividad y traduce cualquier excepción al contrato. **Los endpoints antiguos no
se han tocado**: siguen con su envoltorio y funcionan igual. Migrarlos es una
decisión aparte y se hace uno a uno.

---

## 2. El catálogo de endpoints (`src/lib/api/catalogo.ts`)

Dos niveles, y la diferencia importa:

| Nivel | Qué promete | Cuántos |
|---|---|---|
| `ENDPOINTS_DOCUMENTADOS` | Contrato revisado a mano: método, parámetros reales, forma de respuesta, muro | ver `/api/sistema/endpoints` |
| `RUTAS_INVENTARIADAS` | La ruta existe (lo comprueba la prueba). **Su contrato no está verificado** | el resto |

Reglas que la prueba vigila:
1. Ningún endpoint documentado puede apuntar a una ruta que no exista.
2. Ningún endpoint de `src/app/api` puede quedarse sin inventariar.
3. No puede haber rutas repetidas entre las dos listas.

Si añades un endpoint y no lo registras, **la prueba falla**. Es a propósito.

---

## 3. El catálogo de datos (`src/lib/datos/catalogo.ts`)

Cada modelo declara: dónde vive, cuánto volumen tiene, sus campos, la
procedencia con licencia y fecha de captura, con qué otros modelos se une y por
qué clave, cada cuánto se actualiza, qué caché admite, dónde se ve y —lo más
importante— **qué NO dice**.

Los modelos actuales: `dato:pais`, `dato:ficha-pais`, `dato:poligono`,
`dato:indicador`, `dato:cable`, `dato:acontecimiento`, `dato:punto`,
`dato:persona`, `dato:moneda`, `dato:guerra-historica`, `dato:simulacion`,
`dato:documento`.

Se consume en tres sitios: `/datos` (personas), `/api/sistema/datos` (máquinas)
y el diagnóstico (que falla si un modelo no declara procedencia o límites).

---

## 4. Caché (`src/lib/sistema/cache.ts`)

```ts
const { valor, cacheado } = await memo("clave", 300_000, () => calcularCaro());
```

- TTL obligatorio. Sin TTL no se cachea.
- Anti-estampida: dos peticiones simultáneas comparten la misma promesa.
- Si el cálculo falla, **no se guarda nada**.
- **Es por proceso**: Vercel levanta varias instancias y ninguna comparte esta
  caché. Se declara así en `/api/sistema/actividad` y en `/sistema`. No la uses
  para nada que deba ser consistente entre instancias.

---

## 5. Registro de actividad (`src/lib/sistema/actividad.ts`)

```ts
anotar("aviso", "mi.evento", { ms: 42, endpoint: "/api/mi-cosa" });
```

Anillo de 200 eventos **por instancia**, sin IPs ni cuerpos de petición. Se lee
en `/api/sistema/actividad`. Nunca lanza: la telemetría no puede tumbar una
petición. **No es un sistema de auditoría.**

---

## 6. Permisos (`src/lib/sistema/permisos.ts`)

El censo ya declara `publico | cuenta | dueno` por módulo. Este módulo lo
convierte en decisión:

```ts
puedeVer("mod:torre", { autenticado: true }); // true
exigir("mod:cuenta", sesion);                  // lanza PERMISO si no hay sesión
modulosPermitidos(sesion);                      // índice filtrado en servidor
```

Solo se importa desde código de servidor. La autenticación existente **no se ha
tocado**: esto es la capa de decisión, no un reemplazo.

---

## 7. Extensiones (`src/lib/sistema/extensiones.ts`)

Seis puntos: `censo`, `enlaces`, `busqueda`, `datos`, `permisos`, `diagnostico`.
Un descriptor (`ExtensionNucleo`) declara id `ext:…`, semver, autor, módulo,
puntos, dependencias **que ya existan** y el nombre de su prueba.
`validarExtension()` lo rechaza si miente; `/api/sistema/extensiones` publica el
contrato y un ejemplo inválido para que se vean los errores.

**Lo que no es:** no hay cargador de plugins en caliente ni `eval` de código
ajeno. El código de una extensión se despliega con la casa (Next lo compila).

---

## 8. Consulta estructurada y motor de relaciones

- `src/lib/nucleo/consulta.ts` — `interpretarConsulta("¿qué pasa en Ucrania?")`
  devuelve país (`ua`), tipo (`noticia`), teatro, ventana y **las pistas** de por
  qué lo entendió así. Determinista: reglas + índice del nexo. Sin proveedor.
- `src/lib/nucleo/recomendaciones.ts` — `recomendar({ ruta, pais, tipo })`
  devuelve hasta N pasos con su motivo y su peso, desde cuatro fuentes
  (relación explícita, familia, modelo de dato, nexo). Los mismos datos producen
  siempre la misma recomendación.

---

## 9. IA: sin proveedor, y se dice

`src/lib/ia/proveedor.ts` comprueba la PRESENCIA de credenciales (`OPENAI_API_KEY`,
`ANTHROPIC_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`, `GROQ_API_KEY`,
`MISTRAL_API_KEY`) sin leer su valor, y declara `implementado: false` para todas:
**no hay ningún cliente escrito y no se simula ninguna conexión**. Lo que sí
funciona sin proveedor está listado en `/api/sistema/ia`: consulta estructurada,
explicación de datos, relaciones, búsqueda, resumen de estado y ayuda contextual
en simuladores.

---

## 10. Diagnóstico (`src/lib/sistema/diagnostico.ts`)

`GET /api/sistema/diagnostico` (y también `?profundo=1`) ejecuta comprobaciones
reales sobre estructuras vivas y devuelve cada una con su tiempo:

`version` · `censo` · `permisos` · `datos` · `api` · `extensiones` · `motor` ·
`cache` · `actividad` · (`bd` solo en profundo, con reloj de 3,5 s).

Si algo falla, `/sistema` lo enseña en rojo. El diagnóstico nunca lanza: una
comprobación rota se anota como fallo y las demás siguen.

---

## 11. Pruebas

```bash
node scripts/pruebas-plataforma.mjs                        # parte A (offline)
node scripts/pruebas-plataforma.mjs https://tu-dominio     # A + B (vivo)
node scripts/pruebas-nucleo.mjs https://tu-dominio         # el núcleo de siempre
```

La parte A vigila que los catálogos cuadren con la realidad del repositorio. La
parte B comprueba el contrato en producción, el diagnóstico, la consulta
estructurada, el estado de la IA y que el muro responda 429.

---

## 12. Reglas para no romper la casa

1. **Aditivo primero.** Nada se cierra ni se renombra; los endpoints viejos se
   quedan como están.
2. **Lo que se declara, se prueba.** Catálogo de datos, endpoints y extensiones
   tienen una prueba que los compara con el repositorio.
3. **Lo que no se sabe, se dice.** «Sin dato», «no verificado», «configurado pero
   no implementado». Nunca un número inventado ni una promesa vacía.
4. **Caché y actividad son por instancia.** No construyas consistencia encima de
   ellas.
5. **Nada de credenciales.** El catálogo y los estados IA publican nombres de
   variables, jamás valores.
