# 🔐 AUDITORÍA DE SEGURIDAD — v204.0 EL ESCUDO

**Fecha:** 2026-10-30 · **Alcance:** repositorio completo (558 archivos TS, 73 rutas API, dependencias, histórico de git) · **Mandato del Dueño:** «busca errores de código, debilidades que tiene Vanguard en ataques cibernéticos, busca API keys».

---

## 1. Resumen ejecutivo

| # | Hallazgo | Gravedad | Estado |
|---|----------|----------|--------|
| 1 | Clave de administrador pública (`VANGUARD-2026`) en servidor **y** cliente | 🔴 CRÍTICA | ✅ Corregida |
| 2 | IDOR: borrado de contenido ajeno con `?author=` (nombre público) | 🔴 CRÍTICA | ✅ Corregida |
| 3 | `db/custom.db` + backup con hashes de contraseñas publicados en GitHub | 🔴 CRÍTICA | ✅ Corregida |
| 4 | `AUTH_SECRET` y `OWNER_PASSWORD` de reserva quemados en el histórico | 🔴 ALTA | ✅ Rotados |
| 5 | Webhook de Telegram sin verificación de secreto (bot suplantable) | 🟠 MEDIA | ✅ Corregida |
| 6 | Muros anti-flood ausentes en votos/likes/verificaciones (granja de monedas) | 🟠 MEDIA | ✅ Corregida |
| 7 | JSON-LD sin escapar `</script>` (XSS potencial desde titulares externos) | 🟠 MEDIA | ✅ Corregida |
| 8 | 26 vulnerabilidades en dependencias (2 críticas, 16 altas) | 🟡 BAJA-MEDIA | ✅ → 7 (0 críticas) |
| 9 | Firma de sesión comparada sin tiempo constante; cookie sin `secure` | 🟡 BAJA | ✅ Corregida |
| 10 | Sin CSP (Content-Security-Policy) | 🟡 BAJA | 📋 Documentada (no aplicada: riesgo de romper la casa) |

**Lo que se buscó y estaba LIMPIO:** sin API keys hardcodeadas en el código (ghp_/sk-/AKIA/bot tokens: 0 resultados), sin inyección SQL real (`$executeRawUnsafe` solo interpola `Number()` validados o `Date.now()`; el resto usa tagged templates parametrizados), sin `eval`/`new Function`, sin SSRF (ninguna ruta hace `fetch` a una URL del usuario), sin subidas de archivos al servidor (los "uploads" son data-URL en localStorage, ley v27), `callsign` del radar es dato simulado local (no entrada del usuario), cabeceras v102 correctas (X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy), `.env` jamás viajó al repo (gitignore v27 + histórico verificado), login con lockout progresivo y registro con muro por IP intactos.

---

## 2. Detalle de hallazgos y curas

### ① Clave de administrador pública — CRÍTICA
`ADMIN_KEY = "VANGUARD-2026"` estaba en `src/app/api/contrib/[id]/route.ts` **y también en el panel cliente** (`contribuidores-panel.tsx`), donde se mostraba en pantalla («Demo: la clave es VANGUARD-2026»). Cualquier visitante podía aprobar/rechazar contribuciones, otorgar badges y regalar hasta +1000 monedas por acción.

**Cura (fail-closed):** la clave se retira del cliente; el servidor solo acepta ① sesión del DUEÑO (`isOwner`) o ② `VANGUARD_ADMIN_KEY` de variables de entorno, comparada con SHA-256 (sin fuga de tiempo). Con la sesión DUEÑO el panel se abre solo; sin ninguna de las dos, la puerta queda cerrada.

### ② IDOR de borrado de contenido — CRÍTICA
`DELETE /api/ugc/[id]?author=X` confiaba en un parámetro autodeclarado. El autor es público en la interfaz → cualquiera podía borrar a otros.

**Cura:** permiso `tk` = HMAC-SHA256 (`firmaBorrado`) que el servidor entrega al publicar (campo `tk` de la respuesta) y el autor guarda en su `localStorage` (`vg-del-<id>`). También valen la sesión del autor firmado (juegos) o la del DUEÑO. El parámetro `author` se retiró.

### ③ Base de datos con credenciales en GitHub — CRÍTICA
La SQLite viaja en el repo por diseño (v183.1: en Vercel se copia a `/tmp` para que la BD despierte), pero llevaba la tabla `Account` con 4 hashes scrypt (DUENO + 3 pruebas) y un `custom.db.backup-20261026` doble.

**Cura:** tabla `Account` PURGADA + `VACUUM` (scripts/purgar_cuentas_db.py), backup eliminado del repo, regla `db/*.backup-*` en `.gitignore`. La cuenta DUEÑO se recrea sola en el arranque (`ensureOwnerAccount`); las cuentas de prueba se re-registran. El progreso real siempre vivió en localStorage (ley v27) — nada de jugadores se pierde.

### ④ Secretos de reserva quemados — ALTA
Quien leyera el repo podía: forjar cookies de sesión (`AUTH_SECRET` público) y entrar como DUEÑO (`OWNER_PASSWORD` público).

**Cura:** ambos rotados a valores nuevos. Si `OWNER_PASSWORD` existe en el entorno, la contraseña del DUEÑO se resincroniza sola en el arranque. Aviso en consola si el servidor arranca sin `AUTH_SECRET`.

### ⑤ Webhook de Telegram — MEDIA
`/api/telegram/webhook` aceptaba JSON de cualquiera: un desconocido podía hacer pasar comandos por Telegram.

**Cura:** si `TELEGRAM_WEBHOOK_SECRET` está definido, se exige el header `X-Telegram-Bot-Api-Secret-Token` (configurar el webhook con `&secret_token=...`). Sin la variable, comportamiento actual intacto (compatibilidad).

### ⑥ Muros anti-flood — MEDIA
Solo 6 rutas tenían `muro()`. Likes de memes, interacciones UGC, verificaciones de noticias (**pagaban +10 monedas por acierto**), votos de embajadores, denuncias y acciones de directos eran explotables con un guion.

**Cura:** muros por IP — UGC interacciones 40/min · borrado 10/min · memes 40/min · verificaciones 20/min · embajadores 20/min · denuncias 20/min · directos 40/min · moderación 10/min.

### ⑦ XSS vía JSON-LD — MEDIA
`JSON.stringify` no escapa `<`. Un titular de fuente externa con `</script>` podía romper el `<script type="application/ld+json">` e inyectar código.

**Cura:** `src/lib/jsonld-seguro.ts` (`jsonLdSeguro()` escapa `\u003c`) aplicado en las 6 incrustaciones: layout, guerra-hoy, ver-guerra (×2), zona-cero, noticia/[id].

### ⑧ Dependencias — BAJA-MEDIA
`npm audit`: 26 vulnerabilidades (2 críticas: next Image-Optimizer self-hosted — no aplica en Vercel; next-auth — **dependencia muerta, nunca importada**).

**Cura:** `npm audit fix` (seguras) + desinstalación de `next-auth` → **7 restantes (0 críticas)**, todas transitivas de librerías 3D/IA (sharp/libvips, @huggingface/transformers, prismjs) sin superficie real en producción.

### ⑨ Hardening de sesión — BAJA
Firma de sesión ahora con `timingSafeEqual`; cookie `vg_session` con `secure: true` en producción (httpOnly + sameSite=lax ya existían).

### ⑩ Pendiente documentado — CSP
No se aplicó Content-Security-Policy: la casa carga estilos/scripts inline deliberados (cortina, salvavidas, JSON-LD) y un CSP estricto la rompería. Recomendado: empezar en modo report-only en una versión futura.

---

## 3. Acción del DUEÑO (2 minutos, véncela de raíz)

En **Vercel → tu proyecto → Settings → Environment Variables**, define:

| Variable | Valor sugerido |
|----------|----------------|
| `AUTH_SECRET` | cadena larga aleatoria (p. ej. 40+ caracteres) |
| `OWNER_PASSWORD` | tu contraseña de DUEÑO definitiva |
| `VANGUARD_ADMIN_KEY` | tu clave de moderación (opcional si entras con sesión DUEÑO) |
| `TELEGRAM_WEBHOOK_SECRET` | solo si usas el bot |

Tras guardar, haz **Redeploy**. Hecho esto, ni los valores de reserva del código ni los del histórico servirán a nadie.

## 4. QA de esta versión

`tsc --noEmit` 0 errores · `next build` EXIT 0 · 73 rutas API compiladas · login/registro/cloud-save intactos · borrado UGC exige tk/sesión · muros activos en 9 rutas · JSON-LD escapado · health reporta v204.0 EL ESCUDO · leyes v125 (no-cache HTML) y v199 (caché media) intactas.
