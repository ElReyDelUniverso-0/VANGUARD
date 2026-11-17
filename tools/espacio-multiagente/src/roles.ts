/** ESPACIO MULTIAGENTE VANGUARD · Registro curado de especialistas (auditados, con funciones delimitadas).
 *  Cada rol declara: función, herramientas existentes que puede usar, límites que NO cruza y a quién escala. */
export type RolId =
  | "coordinacion" | "portada" | "noticias" | "mapa3d" | "datos"
  | "juego" | "seguridad" | "telegram" | "seo" | "qa";

export interface Rol {
  id: RolId;
  nombre: string;
  resumen: string;          // una línea
  responsabilidad: string[];
  herramientas: string[];   // EXISTENTES: nada inventado
  limites: string[];        // lo que NO toca
  escala: RolId[];          // con quién colabora / a quién escala
  estado: "activo" | "pendiente";  // si hay agente real o es rol disponible
}

export const ROLES: Rol[] = [
  {
    id: "coordinacion", nombre: "Coordinación", estado: "activo",
    resumen: "Contrata, asigna, reconcilia y pregunta antes de que nadie toque producción.",
    responsabilidad: ["Descomponer misiones en tareas", "Asignar roles", "Resolver conflictos de alcance", "Publicar informes y pendientes"],
    herramientas: ["git", "Vercel (deploy/estado, solo lectura tras autorización)", "docs/ (ARCHITECTURE, MASTER_PLAN, BACKLOG)", "informes"],
    limites: ["No implementa dentro de salas de otros roles", "No publica en producción sin orden del dueño"],
    escala: ["qa", "seguridad"],
  },
  {
    id: "portada", nombre: "Portada y experiencia visual", estado: "activo",
    resumen: "Portada, cabecera, barra móvil, carcasa/piel y accesibilidad visual.",
    responsabilidad: ["Auditar y mejorar la experiencia visual", "Accesibilidad (foco, ARIA, teclado, contraste)", "Claridad y densidad de tarjetas y titulares"],
    herramientas: ["git", "pnpm/npm", "tsc --noEmit", "eslint", "vitest/tests aislados", "pa11y (si existe)", "portada.css/piel.css/.vx"],
    limites: ["No toca backend/API/Prisma", "No inventa datos ni imágenes", "No sustituye salas por maquetas"],
    escala: ["qa", "noticias"],
  },
  {
    id: "noticias", nombre: "Noticias e ingestión", estado: "activo",
    resumen: "Cable vivo: RSS/GDELT → /lectura, imágenes reales, fechas y fuentes.",
    responsabilidad: ["Dedupe de cables", "Clasificación por país/región/categoría", "Noticias en el mapa (Misión 003)", "Enlaces a fuente siempre presentes"],
    herramientas: ["src/lib/portada/notas.ts", "src/lib/portada/clasificar.ts", "prisma NewsItem (solo lectura)", "cron yt-dlp?: no", "tests aislados (noticias-revolucion)"],
    limites: ["No inventa notas ni coordenadas", "No desduplica a costa de perder la fuente", "No llama a medios que bloquean bots sin respetar robots"],
    escala: ["portada", "seo"],
  },
  {
    id: "mapa3d", nombre: "Mapa 3D y mundo", estado: "pendiente",
    resumen: "Globo, capas de conflicto, marcadores, cámara y rendimiento three.js.",
    responsabilidad: ["Mapa 3D: /mundo, /ver-guerra, /zona-cero, /vanguard2", "Capas de inteligencia", "Marcadores de noticias sobre el globo"],
    herramientas: ["three 0.185", "react-three-fiber (si la casa lo usa)", "mapas SVG existentes", "pruebas visuales/Lighthouse"],
    limites: ["No toca datos ni textos fuera de su capa", "No degrada FPS ni peso del paquete", "No toca juego"],
    escala: ["datos", "qa"],
  },
  {
    id: "datos", nombre: "Datos vivos y Núcleo", estado: "activo",
    resumen: "RSS, GDELT, USGS, GDACS, Banco Mundial; relaciones del Núcleo.",
    responsabilidad: ["Indicadores /pulso-mundial", "Centinela, /cruce", "Núcleo: nota↔conflicto↔actores↔historia"],
    herramientas: ["prisma", "src/lib/nucleo", "feeds públicos con licencia preservada", "cron/ingest pipelines (arquitectura)"],
    limites: ["Nada de datos inventados", "Respeta licencias y atribuciones", "No añade Prisma en cliente; solo servidor"],
    escala: ["noticias", "seguridad"],
  },
  {
    id: "juego", nombre: "Juego e identidad", estado: "pendiente",
    resumen: "Cuartel, misiones, ELO, gemas, racha y perfiles.",
    responsabilidad: ["Multijugador 1v1", "Economía de gemas", "Misiones (READ_BRIEFING, OPEN_MAP…)", "Carnet de agente"],
    herramientas: ["prisma (Player, Mission, CoinTransaction…)", "Zustand", "API routes del juego", "Muligplayer existente"],
    limites: ["El juego no tapa la información", "No toca portada", "Sin pay-to-win sin decisión del dueño"],
    escala: ["qa", "seguridad"],
  },
  {
    id: "seguridad", nombre: "Seguridad y accesos", estado: "activo",
    resumen: "Secrets, auth, headers, exposición, incidentes.",
    responsabilidad: ["AUTH_SECRET/OWNER_PASSWORD y reserva híbrida", "CSP, X-Frame-Options, nosniff", "Auditoría de rutas y datos", "Revisión de permisos del dueño"],
    herramientas: ["src/lib/auth-server.ts", "next.config.ts headers()", "Vercel env vars (con autorización)", "bun.lock/auditoría de deps"],
    limites: ["No exfiltra secrets", "No desactiva protecciones sin plan", "No publica cambios sin verificación"],
    escala: ["coordinacion"],
  },
  {
    id: "telegram", nombre: "Telegram y avisos", estado: "activo",
    resumen: "Bot/webhook de avisos del dueño (fases 1–2 ya en parche).",
    responsabilidad: ["Fase 1: comandos del dueño (validación, sesión, origen)", "Fase 2: envío en texto plano, límite, configuración"],
    herramientas: ["patches/vanguard-telegram-fases-1-2-v405.patch", "Node 20 + tests aislados (6 casos OK)"],
    limites: ["No habilita el bot sin AUTH_SECRET y OWNER_PASSWORD en Vercel", "No expone IDs/secrets en logs", "No publica sin autorización"],
    escala: ["seguridad", "coordinacion"],
  },
  {
    id: "seo", nombre: "SEO y descubribilidad", estado: "pendiente",
    resumen: "robots, sitemap, canónicos, OpenGraph, indexación.",
    responsabilidad: ["/api/health y huella pública", "IndexNow, sitemap, noindex correcto", "OG/canonical por ruta"],
    herramientas: ["next-sitemap/sitemap.ts", "robots.txt", "fetch HEAD a producción", "Google Search Console (si hay acceso)"],
    limites: ["No indexa salas de juego ni privadas", "Canonical siempre a vanguard-kq9r", "No toca contenido"],
    escala: ["noticias", "portada"],
  },
  {
    id: "qa", nombre: "QA y verificación", estado: "activo",
    resumen: "Pruebas antes de cualquier publicación: build, teclado, móvil, 404.",
    responsabilidad: ["next build / tsc / eslint", "Pruebas aisladas y en navegador", "Verificación post-deploy en /api/health"],
    herramientas: ["npm scripts (build, test)", "jsdom + tsc", "Vercel deployments estado", "captura visual manual"],
    limites: ["No dice «hecho» sin probar", "No arregla por su cuenta; reporta", "No aprueba publicación"],
    escala: ["coordinacion"],
  },
];

export function rolPorId(id: string): Rol | undefined {
  return ROLES.find((r) => r.id === id);
}
