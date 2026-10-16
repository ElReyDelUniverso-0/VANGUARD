# AGENTS.md — DOSSIER DE TRASPASO PARA IA COMPAÑERA
# VANGUARD — Proyecto del usuario "ElReyDelUniverso-0"
# Lee este archivo COMPLETO antes de tocar nada. Es tu contrato de trabajo.

Última actualización: 2026-10-17 · Versión actual del proyecto: **v120.0 GRAN SALTO 3D**

---

## 1. QUÉ ES VANGUARD

VANGUARD es una experiencia-web de noticias del futuro (año 2100): periodismo,
guerra en vivo, mapas, máquina del tiempo, música original y una estética
técnico-militar única. Todo se genera EN VIVO con código (cero imágenes, cero
assets externos). El usuario es el dueño y director creativo absoluto.

- Repo GitHub: `https://github.com/ElReyDelUniverso-0/VANGUARD.git` (rama `main`)
- App: Next.js 16 (App Router) + TypeScript + Tailwind 4 + shadcn/ui + Prisma (SQLite)
- Idioma del proyecto: español (la UI cubre 8 idiomas vía i18n)

## 2. LAS 3 LEYES INVIOLABLES

1. **LEE `src/lib/regla-oro.ts` ANTES DE PROGRAMAR.** Contiene las 82 reglas de
   oro del proyecto. Son vinculantes. Si tu cambio viola una regla, está prohibido.
2. **NUNCA pierdas la esencia.** Vanguard es Vanguard: estética propio-futurista,
   música original, tono periodístico 2100. No lo conviertas en otra cosa.
3. **TODO en español primero**, y TODA cadena nueva de UI debe existir en los
   8 idiomas del sistema i18n (`src/lib/i18n.ts`). Un idioma olvidado = bug.

## 3. LÍNEAS ROJAS (no negociables)

- **Rendimiento 60 FPS**: nada de animaciones que rompan el hilo principal.
- **Cero enlaces externos**: Vanguard no manda al usuario a otras páginas;
  todo se vive DENTRO de Vanguard (navegación por pestañas/paquetes internos).
- **Cero imágenes**: todo lo visual es código 3D/canvas/CSS en tiempo real.
- **Música 100 % original** (generada por código, sin licencias).
- **Todo en tiempo real**: datos, relojes, ciclos día/noche, noticias.
- **3D personalizable**: las escenas 3D aceptan preferencias del usuario.

## 4. STACK Y COMANDOS

```bash
# Gestor: SOLO bun (nunca npm/pnpm/yarn)
bun install
bun run dev          # desarrollo en puerto 3000 (mata procesos viejos antes)
bun run build        # prisma generate && next build (standalone)
bun run db:push      # sincroniza el esquema Prisma (acepta pérdida de datos)
bun run lint

# ANTES de levantar el dev server:
pkill -f "next dev" 2>/dev/null; sleep 1   # evita choques de puerto
```

- Base de datos: SQLite en `db/custom.db` (config en `.env` → `DATABASE_URL`).
- Variables de ejemplo en `.env.example`. No hay secretos en el código.

## 5. MAPA DE ARQUITECTURA (lo esencial)

```
src/
  app/
    page.tsx            Portada (mega-menú cinematográfico)
    clasico/            Modo clásico de lectura
    guerra-hoy/         Guerra en vivo (hoy)
    ver-guerra/         Visor de guerra
    mision/             Modo misión
    zona-cero/          Zona Cero
    api/                Rutas API internas
    layout.tsx          Layout raíz (capas globales: retención, login diario)
    manifest.ts / sitemap.ts / feed.xml   SEO
  components/vanguard/  ~91 componentes (corazón de la app)
    tab-nav.tsx         Navegación de 12 SECTIONS arrastrables (orden persistente)
    mega-menu.tsx       Portada cinematográfica + covers de sección
    retention-layer.tsx Capa global de retención (temporada, combo, cofres)
    daily-login-modal   Racha diaria + monedas
  lib/
    regla-oro.ts        LAS 82 REGLAS DE ORO (léelo primero)
    version.ts          APP_VERSION / APP_CODENAME (fuente única de versión)
    bitacora.ts         Registro de versiones (añade la tuya al publicar)
    i18n.ts             8 idiomas — toda cadena nueva va aquí
    game-store.ts       Economía: coins / gemas / XP / inventario
    retention.ts        Motor de retención v55 (temporada 30 días, combos)
    agente-nucleo.ts / mente-data.ts / wikiguerra-data.ts / social-data.ts
```

## 6. PROTOCOLO OBLIGATORIO DE TRABAJO

1. **Lee `worklog.md` (raíz del repo) antes de empezar**: ahí está todo el
   historial de decisiones de versiones anteriores (v1 → v78). No repitas
   trabajo, no rompas decisiones ya tomadas.
2. **Después de CADA tarea**, añade al FINAL de `worklog.md` una sección:
   ```markdown
   ---
   Task ID: <n o id corto>
   Agent: <tu nombre/identificador>
   Task: <qué te pidieron>

   Work Log:
   - <pasos concretos>

   Stage Summary:
   - <resultados, decisiones, artefactos>
   ```
3. **Commit atómico por tarea** + push a `main` (el remoto ya tiene credenciales
   embebidas en `.git/config` de este entorno; si clonas fresco, usa el token
   del archivo CREDENCIALES-GITHUB.md que acompaña a este paquete).
4. **Sube la versión en `src/lib/version.ts`** (v79.0, v80.0…) + añade entrada
   en `bitacora.ts` + registra el codename temático de la versión.
5. **Nunca dejes la rama en rojo**: si compilaba antes de tu cambio, debe
   compilar después (`bun run build` es el juez).

## 7. BACKLOG CONFIRMADO — «GRAN SALTO 3D» (aprobado por el dueño) — EJECUTADO en v120.0 (ciudad héroe, letras 3D, BD reparada, +20 canales, +8 cables); resto de puntos ya vivía desde v110-v119

El dueño lo confirmó varias veces ("Si a todo", "Sigue"). Pendiente de ejecutar:

1. **Auditoría línea a línea** de `tab-nav.tsx` y `mega-menu.tsx`; listar
   secciones rotas.
2. **Reparar secciones muertas**: `noticias` (sin portada, no carga),
   `Modo Dios`, `cámaras de seguridad`.
3. **Configurar las actualizaciones históricas** que nunca se aplicaron.
4. **Todo plano → 3D en vivo**: eliminar dependencia de imágenes en TODO el
   producto; Portada = escena 3D en tiempo real, estilo año 2100.
5. **Ciudad del inicio procedural**: rota regiones/edificios 3D de vez en cuando.
6. **Ciclo día/noche en TIEMPO REAL** en la ciudad del inicio (sol/luna según
   reloj real del visitante).
7. **Mejorar las letras 3D** (tipografía volumétrica, más Vanguard).
8. **Cero saltos externos**: toda navegación vive dentro de Vanguard.
9. **Más noticieros**: más canales, más noticias, más de todo (8 idiomas).
10. **Interfaz más fluida**: transiciones suaves, 60 FPS, movilidad pulida.
11. **Máquina del tiempo realista**: mucho más detalle, sensación real.
12. **Mejorar los mapas** de Vanguard + más información.
13. **Página experimental** nueva (laboratorio 3D).
14. **Personalización 3D**: el visitante ajusta las escenas.
15. **Agente de mejora autónomo**: bucle sin dueño: limpiar pendientes →
    mejorar → expandir → añadir funcionalidades → sin errores.
16. **Bump a v79.0** con codename + bitácora + 8 idiomas.

## 8. CÓMO VERIFICAR TU TRABAJO

- `bun run build` debe pasar limpio.
- `bun run lint` sin errores nuevos.
- Recorre la app en el puerto 3000: Portada, cada sección, móvil y escritorio.
- Comprueba los 8 idiomas si tocaste textos.
- 60 FPS: si introduces animación, que sea transform/opacity (GPU), nunca
  layout thrashing.

## 9. REGLAS DE CONVIVENCIA ENTRE IAs

- El dueño habla español con faltas de ortografía: interpreta la intención,
  no la letra. Confirma con hechos, no con preguntas infinitas.
- El dueño ya aprueba los planes grandes: ejecuta e informa, no tortures con
  más preguntas.
- Si una petición nueva choca con las 82 reglas, gana la regla; explícalo
  después en el worklog.
- Trabaja como compañero, no como invitado: deja el repo mejor de como lo
  encontraste y documenta TODO.
