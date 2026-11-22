# Ecosistema vivo — supervisión inicial

Esta entrega añade un inspector externo, de solo lectura, sin reemplazar `/estado`, `/api/health`, `/api/sistema/diagnostico`, el sistema de noticias ni los cron existentes. No cambia datos ni código en producción y no ejecuta acciones de recuperación.

## Qué comprueba

Portada, mapas, memoria, mercado, visita, sitemap, el latido (incluye el campo `db`) y la disponibilidad y estructura de una respuesta del Banco Mundial. HTTP 200 por sí solo no implica que la base esté sana. Límite de tres solicitudes simultáneas, 12 s por intento, dos intentos y 500 ms de espera. La clasificación lenta usa el tiempo total, incluidos reintentos; es una señal de degradación, no un percentil de rendimiento. No recopila datos personales ni usa cookies. El catálogo de URLs es fijo para evitar SSRF.

## Ejecución y registros

`node --test tests/ecosistema/inspeccion.test.mjs` y `node tools/ecosistema/ejecutar.mjs`. El segundo genera `informes-ecosistema/salud.json` y termina con código 1 si hay errores o lentitud. No hay tarea programada ni alertas activadas en esta entrega. Se preparó por separado un flujo de GitHub Actions, pero su publicación requiere permiso para workflows y su primera ejecución debe verificarse. El informe local no es persistencia compartida.

## Límites importantes

La base en Vercel puede ser una copia SQLite efímera por instancia: `db:up` demuestra una consulta, no persistencia, backups, consistencia entre instancias ni capacidad real de escritura. No se han implementado aún actualización automática por departamento, ingesta persistente, inventario integral de incidencias, pruebas de navegador programadas, centro administrativo con permisos, alertas externas ni recomendaciones. Este inspector no verifica todos los módulos, enlaces, imágenes, flujos autenticados o JS; sus ocho comprobaciones tienen alcance explícito. El proveedor Banco Mundial puede fallar o ralentizarse independientemente de Vanguard. No confundir una fuente externa lenta con la caída de la plataforma.

## Recuperación

Ante error consultar el artefacto y repetir manualmente; comprobar `/estado` y `/api/health`. Si el inspector da falsos positivos, detener cualquier ejecución manual del inspector sin tocar el sitio. Revertir el commit de esta entrega con un PR revisado; no ejecuta migraciones ni borra datos. Antes de introducir retención de datos o tareas que escriban, usar una base persistente, backups probados, permisos mínimos, control de concurrencia y aprobación del propietario.

## Seguridad urgente

La autenticación existente en `src/lib/auth-server.ts` tiene valores de reserva visibles en código si no se configuran `AUTH_SECRET` y `OWNER_PASSWORD`. Verificar de forma segura que existen secretos únicos y rotar los comprometidos; no convertir una pantalla en administración segura apoyándose en esos valores de reserva. Un token de GitHub compartido en conversación debe revocarse. No copiar secretos en informes, logs o commits.
