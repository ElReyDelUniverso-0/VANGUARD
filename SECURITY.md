# SECURITY — el blindaje de la casa

Política de seguridad, deudas declaradas y protocolo de cura de VANGUARD.
Complementa a `AUDITORIA-SEGURIDAD.md` (la auditoría v204 línea a línea), al
Buscador de Llaves (`npm run escudo`) y a la sala pública **[/escudo](https://vanguard-kq9r.vercel.app/escudo)**.

## Versiones con soporte

| Rama | Estado |
|------|--------|
| `main` (v362.0+) | con soporte — todo parche nace aquí y viaja a producción por deploy automático |

## Cómo reportar una vulnerabilidad

1. Abre un **GitHub Issue** con la etiqueta `seguridad` y el detalle mínimo:
   archivo, línea y una descripción del impacto. **No publiques la llave ni
   el exploit completo** — márcala con `[REDACTADO]` y describe los pasos en
   prosa.
2. El Dueño revisa y la cura entra como commit atómico en `main` (la ley de
   la casa: si compilaba antes del cambio, debe compilar después).
3. Si quieres crédito por el hallazgo, dilo en el issue: la casa agradece en
   público.

Nada de dividir el reporte en redes o discusiones externas: todo vive dentro
del repo.

## Las deudas declaradas HOY

El Buscador de Llaves mantiene este inventario vivo y enmascarado
(`npm run escudo` · `npm run escudo-env`):

| # | Deuda | Dónde | Estado |
|---|-------|-------|--------|
| 1 | Token JWT de la gateway Z.ai (reserva única) | `src/lib/zai-token.ts` | ACTIVA — el token se lee PRIMERO del entorno (`ZAI_TOKEN`); el literal quemado queda como último recurso mientras la rotación en Vercel cierra. Las 3 copias viejas (neurona, ia-gateway, zai-server) ya importan la fuente única |
| 2 | `AUTH_SECRET` de reserva | `src/lib/auth-server.ts` | DECLARADA — la v204 la rotó; la reserva vive para que producción no caiga si el entorno no define la variable |
| 3 | `OWNER_PASSWORD` de reserva | `src/lib/auth-server.ts` | DECLARADA — ídem; definir ambas en Vercel y purgar los literales cierra la deuda |
| 4 | Clave IndexNow | `src/app/api/agent-ping/route.ts` | NO ES SECRETO — pública por diseño (verificación de propiedad del sitio) |

## El protocolo de cura (del Buscador de Llaves)

1. **REVOCAR** la llave en su servicio, ya.
2. **GIRAR**: definir la nueva SOLO como variable de entorno (Vercel →
   Settings → Environment Variables), nunca en el código.
3. **PURGAR** el histórico si ya viajó al repo (`git filter-repo`).
4. Si era falsa alarma, añadirla a `PERMITIDOS` del script **con motivo
   escrito**.

## Paso a paso de la rotación activa (`ZAI_TOKEN`)

1. Rota la credencial en su origen y define `ZAI_TOKEN` en Vercel
   (producción + preview + desarrollo).
2. Redeploy y verifica las salas vivas: NEURONA, MENTE y CONSEJO responden.
3. `npm run escudo` seguirá contando 1 hallazgo: el literal de reserva de
   `src/lib/zai-token.ts` (el seguro de vida de producción mientras el
   entorno no garantiza la variable).
4. Cuando el entorno garantiza la variable, **borra el literal** de
   `zai-token.ts` → el hallazgo muere y el escudo cierra la deuda. Hazlo
   también para las reservas de `auth-server.ts` (`AUTH_SECRET`,
   `OWNER_PASSWORD`) y la lista `PERMITIDOS` queda vacía.

## Los muros de la fortaleza

`src/lib/fortaleza.ts` (`muro()` + `claveCliente()`) — anti-flood por IP,
en memoria, con castigo progresivo. Los mismos muros para todas las puertas:

| Puerta | Muro |
|--------|------|
| `PATCH /api/denuncias/[id]` | 20 acciones/min |
| likes de memes | 40/min |
| votos de embajadores | 20/min |
| acciones de streams en vivo | 40/min |
| `GET /api/escudo` (la mirada web) | 6/min — la mirada ejecuta un proceso que recorre el árbol completo: caro |
| búsqueda del Núcleo | 30/min · entidad: 60/min |

## La guardia automática

- `npm run escudo` — 10 familias de secretos + 2 genéricos de reserva;
  exit 1 con hallazgos nuevos; salida siempre enmascarada.
- `npm run escudo-env` — el inventario del aire: variables usadas sin
  declarar, declaradas sin uso y reservas hardcodeadas.
- Cabeceras de acero (`next.config.ts`, v102 CIUDADELA): X-Frame-Options,
  X-Content-Type-Options, Referrer-Policy, Permissions-Policy.
- Sesiones: cookies firmadas HMAC-SHA256, comparación en tiempo constante,
  lockout progresivo en el login (v204).
- Sin CSP por decisión documentada (auditoría v204, hallazgo 10): el riesgo
  de romper la casa (globo 3D, workers, SDK de voz) supera la cura — se
  revisará por fases.
