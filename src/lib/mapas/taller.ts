// ═══════════════════════════════════════════════════════════════════
// v436.5 · EL TALLER DE MAPAS — crear mapas 2D/3D con información
//
// El Dueño: «necesita herramientas para crear mapas 3D 2D interactivos con
// informaciones, o sea crearlos dentro de Vanguard, exportarlos o lo contrario,
// exportar por Vanguard, publicar maps».
//
// Aquí no hay servidor ni cuenta: un mapa es un DOCUMENTO de texto (puntos y
// trazos con su nombre, su nota y su fuente). Se guarda en el aparato, se
// exporta a GeoJSON para cualquier SIG, a JSON para volver a abrirlo aquí y a
// un HTML autónomo que se abre solo —sin Vanguard, sin internet— con el mismo
// planeta y las mismas fichas.
//
// Y no hay mapas falsos: un mapa sin puntos se declara vacío, y toda cifra que
// pinta la cuenta quien la escribe, con su fuente al lado.
// ═══════════════════════════════════════════════════════════════════

export type TipoPunto = "punto" | "base" | "frente" | "energia" | "exclusion";

export type Punto = {
  id: string;
  lat: number;
  lng: number;
  nombre: string;
  tipo: TipoPunto;
  /** qué es y por qué está ahí, en una línea */
  nota: string;
  /** de dónde sale el dato; vacío = «sin fuente declarada» */
  fuente: string;
};

export type Trazo = {
  id: string;
  nombre: string;
  color: string;
  /** secuencia [lat, lng]: una ruta, un oleoducto, una frontera dibujada a mano */
  puntos: [number, number][];
};

export type DocumentoMapa = {
  version: 1;
  id: string;
  nombre: string;
  lema: string;
  autor: string;
  actualizado: string;
  puntos: Punto[];
  trazos: Trazo[];
};

export const CLAVE = "vx436-mapas:v1";
export const MAX_MAPAS = 20;

export const TIPOS: { id: TipoPunto; nombre: string; color: string }[] = [
  { id: "punto", nombre: "Punto", color: "#FF9F45" },
  { id: "base", nombre: "Base", color: "#4ADE80" },
  { id: "frente", nombre: "Frente", color: "#F43F5E" },
  { id: "energia", nombre: "Energía", color: "#38BDF8" },
  { id: "exclusion", nombre: "Zona de exclusión", color: "#A78BFA" },
];

export const COLOR_TRAZO = "#FFD166";

export function colorDeTipo(tipo: TipoPunto): string {
  return TIPOS.find((t) => t.id === tipo)?.color ?? "#FF9F45";
}

export function nuevoId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

export function documentoVacio(): DocumentoMapa {
  return {
    version: 1,
    id: nuevoId(),
    nombre: "Mapa sin nombre",
    lema: "",
    autor: "",
    actualizado: new Date().toISOString(),
    puntos: [],
    trazos: [],
  };
}

const numero = (v: unknown, min: number, max: number): number | null => {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
  if (!Number.isFinite(n) || n < min || n > max) return null;
  return n;
};

const texto = (v: unknown, max: number): string =>
  typeof v === "string" ? v.slice(0, max) : "";

/** Un documento venido de fuera (archivo, JSON pegado) se valida campo a campo. */
export function normalizar(entrada: unknown): DocumentoMapa | null {
  if (!entrada || typeof entrada !== "object") return null;
  const d = entrada as Record<string, unknown>;
  const puntosBrutos = Array.isArray(d.puntos) ? d.puntos : [];
  const puntos: Punto[] = [];
  for (const p of puntosBrutos.slice(0, 500)) {
    const q = p as Record<string, unknown>;
    const lat = numero(q.lat, -90, 90);
    const lng = numero(q.lng, -180, 180);
    if (lat === null || lng === null) continue;
    const tipo = TIPOS.some((t) => t.id === q.tipo) ? (q.tipo as TipoPunto) : "punto";
    puntos.push({
      id: texto(q.id, 40) || nuevoId(),
      lat,
      lng,
      nombre: texto(q.nombre, 120) || `Punto ${puntos.length + 1}`,
      tipo,
      nota: texto(q.nota, 600),
      fuente: texto(q.fuente, 240),
    });
  }
  const trazosBrutos = Array.isArray(d.trazos) ? d.trazos : [];
  const trazos: Trazo[] = [];
  for (const t of trazosBrutos.slice(0, 100)) {
    const q = t as Record<string, unknown>;
    const lista = Array.isArray(q.puntos) ? q.puntos : [];
    const coords: [number, number][] = [];
    for (const par of lista.slice(0, 500)) {
      if (!Array.isArray(par) || par.length < 2) continue;
      const lat = numero(par[0], -90, 90);
      const lng = numero(par[1], -180, 180);
      if (lat === null || lng === null) continue;
      coords.push([lat, lng]);
    }
    if (coords.length < 2) continue;
    trazos.push({
      id: texto(q.id, 40) || nuevoId(),
      nombre: texto(q.nombre, 120) || `Trazo ${trazos.length + 1}`,
      color: /^#[0-9a-fA-F]{6}$/.test(String(q.color ?? "")) ? String(q.color) : COLOR_TRAZO,
      puntos: coords,
    });
  }
  return {
    version: 1,
    id: texto(d.id, 40) || nuevoId(),
    nombre: texto(d.nombre, 120) || "Mapa sin nombre",
    lema: texto(d.lema, 240),
    autor: texto(d.autor, 80),
    actualizado: texto(d.actualizado, 40) || new Date().toISOString(),
    puntos,
    trazos,
  };
}

// ── PLANTILLAS: empezar con el mapa ya vivo ─────────────────────────
//
// Un taller vacío no dice «wow», dice «y ahora qué». Estas tres plantillas
// ponen el mapa a funcionar en un toque. Lo que llevan dentro son LUGARES y
// sus coordenadas (Natural Earth 110m): ni una cifra que no se pueda
// comprobar, y cada punto declara de dónde sale su posición. La nota cuenta
// qué es el sitio; si alguien le añade un dato, tendrá que añadir su fuente.

export type Plantilla = {
  id: string;
  nombre: string;
  lema: string;
  puntos: Omit<Punto, "id">[];
  trazos: { nombre: string; color: string; puntos: [number, number][] }[];
};

const COORD = "Coordenadas del lugar (Natural Earth 110m)";

export const PLANTILLAS: Plantilla[] = [
  {
    id: "estrechos",
    nombre: "Los tres estrechos",
    lema: "Los pasos de agua donde se aprieta el comercio del mundo",
    puntos: [
      { lat: 26.5667, lng: 56.25, nombre: "Estrecho de Ormuz", tipo: "exclusion", nota: "Entre el golfo Pérsico y el golfo de Omán.", fuente: COORD },
      { lat: 12.5833, lng: 43.3333, nombre: "Bab el-Mandeb", tipo: "exclusion", nota: "Puerta sur del mar Rojo: entre Yibuti y Yemen.", fuente: COORD },
      { lat: 1.4333, lng: 102.8833, nombre: "Estrecho de Malaca", tipo: "exclusion", nota: "Entre la península malaya y Sumatra.", fuente: COORD },
      { lat: -8.65, lng: 115.2167, nombre: "Canal de Bali", tipo: "punto", nota: "Alternativa al sur del archipiélago.", fuente: COORD },
    ],
    trazos: [
      { nombre: "Golfo → Asia oriental", color: "#FFD166", puntos: [[26.5667, 56.25], [12.5833, 43.3333], [5.0, 80.0], [1.4333, 102.8833], [-8.65, 115.2167]] },
    ],
  },
  {
    id: "puertos",
    nombre: "Los grandes puertos",
    lema: "Las puertas del comercio marítimo",
    puntos: [
      { lat: 51.9244, lng: 4.4777, nombre: "Róterdam", tipo: "base", nota: "Desembocadura del Rin, puerta de Europa.", fuente: COORD },
      { lat: 1.2644, lng: 103.8222, nombre: "Singapur", tipo: "base", nota: "Ciudad-Estado y paso obligado del estrecho.", fuente: COORD },
      { lat: 31.2304, lng: 121.4737, nombre: "Shanghái", tipo: "base", nota: "Delta del Yangtsé.", fuente: COORD },
      { lat: 33.7405, lng: -118.2775, nombre: "Los Ángeles", tipo: "base", nota: "Puerta del Pacífico americano.", fuente: COORD },
      { lat: 25.2048, lng: 55.2708, nombre: "Dubái", tipo: "base", nota: "Golfo Pérsico, escala entre Asia y Europa.", fuente: COORD },
      { lat: -23.9608, lng: -46.3336, nombre: "Santos", tipo: "base", nota: "El gran puerto de Sudamérica.", fuente: COORD },
    ],
    trazos: [
      { nombre: "Europa → Asia", color: "#38BDF8", puntos: [[51.9244, 4.4777], [36.0, -5.6], [31.3, 32.3], [12.5833, 43.3333], [1.2644, 103.8222], [31.2304, 121.4737]] },
    ],
  },
  {
    id: "cinturon",
    nombre: "El cinturón de fuego",
    lema: "El borde del Pacífico donde tiembla la corteza",
    puntos: [
      { lat: 35.6762, lng: 139.6503, nombre: "Tokio", tipo: "frente", nota: "Varias placas se encuentran bajo la bahía.", fuente: COORD },
      { lat: -33.4489, lng: -70.6693, nombre: "Santiago", tipo: "frente", nota: "Borde de la placa de Nazca.", fuente: COORD },
      { lat: 19.4326, lng: -99.1332, nombre: "Ciudad de México", tipo: "frente", nota: "Valle sobre antiguos lagos y volcanes.", fuente: COORD },
      { lat: -6.2088, lng: 106.8456, nombre: "Yakarta", tipo: "frente", nota: "Arco volcánico de Java.", fuente: COORD },
      { lat: 61.2181, lng: -149.9003, nombre: "Anchorage", tipo: "frente", nota: "Subducción de la placa del Pacífico.", fuente: COORD },
      { lat: 14.5995, lng: 120.9842, nombre: "Manila", tipo: "frente", nota: "Fosa de Manila y arco de Luzón.", fuente: COORD },
    ],
    trazos: [
      { nombre: "Borde del Pacífico", color: "#F43F5E", puntos: [[61.2181, -149.9003], [35.6762, 139.6503], [14.5995, 120.9842], [-6.2088, 106.8456], [-33.4489, -70.6693], [19.4326, -99.1332]] },
    ],
  },
];

export function desdePlantilla(id: string): DocumentoMapa | null {
  const p = PLANTILLAS.find((x) => x.id === id);
  if (!p) return null;
  return {
    version: 1,
    id: nuevoId(),
    nombre: p.nombre,
    lema: p.lema,
    autor: "",
    actualizado: new Date().toISOString(),
    puntos: p.puntos.map((q) => ({ ...q, id: nuevoId() })),
    trazos: p.trazos.map((t) => ({ ...t, id: nuevoId() })),
  };
}

// ── El almacén del aparato: ni cuenta ni servidor ───────────────────

export function leerLista(): DocumentoMapa[] {
  if (typeof window === "undefined") return [];
  try {
    const crudo = window.localStorage.getItem(CLAVE);
    if (!crudo) return [];
    const datos = JSON.parse(crudo) as unknown;
    if (!Array.isArray(datos)) return [];
    return datos.map(normalizar).filter((d): d is DocumentoMapa => !!d);
  } catch {
    return [];
  }
}

export function escribirLista(lista: DocumentoMapa[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CLAVE, JSON.stringify(lista.slice(0, MAX_MAPAS)));
  } catch {
    /* sin espacio o sin permiso: el mapa vive en memoria hasta que se exporte */
  }
}

export function guardarDocumento(doc: DocumentoMapa): DocumentoMapa[] {
  const lista = leerLista().filter((d) => d.id !== doc.id);
  const actualizado: DocumentoMapa = { ...doc, actualizado: new Date().toISOString() };
  const nueva = [actualizado, ...lista].slice(0, MAX_MAPAS);
  escribirLista(nueva);
  return nueva;
}

export function borrarDocumento(id: string): DocumentoMapa[] {
  const nueva = leerLista().filter((d) => d.id !== id);
  escribirLista(nueva);
  return nueva;
}

export function resumen(doc: DocumentoMapa): { puntos: number; trazos: number; sinFuente: number } {
  return {
    puntos: doc.puntos.length,
    trazos: doc.trazos.length,
    sinFuente: doc.puntos.filter((p) => !p.fuente.trim()).length,
  };
}

// ── Exportar: GeoJSON, JSON propio y HTML autónomo ──────────────────

export function aGeoJSON(doc: DocumentoMapa): string {
  const puntos = doc.puntos.map((p) => ({
    type: "Feature" as const,
    geometry: { type: "Point" as const, coordinates: [p.lng, p.lat] },
    properties: { nombre: p.nombre, tipo: p.tipo, nota: p.nota, fuente: p.fuente, mapa: doc.nombre },
  }));
  const trazos = doc.trazos.map((t) => ({
    type: "Feature" as const,
    geometry: { type: "LineString" as const, coordinates: t.puntos.map(([lat, lng]) => [lng, lat]) },
    properties: { nombre: t.nombre, mapa: doc.nombre },
  }));
  return JSON.stringify(
    { type: "FeatureCollection", name: doc.nombre, features: [...puntos, ...trazos] },
    null,
    2
  );
}

export function aJSON(doc: DocumentoMapa): string {
  return JSON.stringify(doc, null, 2);
}

/** Acepta lo que exporta este taller y también un GeoJSON hecho fuera. */
export function desdeTexto(crudo: string): DocumentoMapa | null {
  let datos: unknown;
  try {
    datos = JSON.parse(crudo);
  } catch {
    return null;
  }
  const propio = normalizar(datos);
  if (propio && (propio.puntos.length > 0 || propio.trazos.length > 0)) return propio;
  const obj = datos as Record<string, unknown>;
  if (obj && obj.type === "FeatureCollection" && Array.isArray(obj.features)) {
    const doc = documentoVacio();
    doc.nombre = texto(obj.name, 120) || "Mapa importado";
    doc.autor = "importado";
    for (const f of (obj.features as unknown[]).slice(0, 500)) {
      const feat = f as Record<string, unknown>;
      const geo = (feat.geometry ?? {}) as Record<string, unknown>;
      const props = (feat.properties ?? {}) as Record<string, unknown>;
      if (geo.type === "Point" && Array.isArray(geo.coordinates)) {
        const lng = numero(geo.coordinates[0], -180, 180);
        const lat = numero(geo.coordinates[1], -90, 90);
        if (lat === null || lng === null) continue;
        doc.puntos.push({
          id: nuevoId(),
          lat,
          lng,
          nombre: texto(props.nombre ?? props.name ?? props.title, 120) || `Punto ${doc.puntos.length + 1}`,
          tipo: "punto",
          nota: texto(props.nota ?? props.description, 600),
          fuente: texto(props.fuente ?? props.source, 240),
        });
      } else if (geo.type === "LineString" && Array.isArray(geo.coordinates)) {
        const coords: [number, number][] = [];
        for (const par of geo.coordinates as unknown[]) {
          if (!Array.isArray(par)) continue;
          const lng = numero(par[0], -180, 180);
          const lat = numero(par[1], -90, 90);
          if (lat === null || lng === null) continue;
          coords.push([lat, lng]);
        }
        if (coords.length >= 2) {
          doc.trazos.push({
            id: nuevoId(),
            nombre: texto(props.nombre ?? props.name, 120) || `Trazo ${doc.trazos.length + 1}`,
            color: COLOR_TRAZO,
            puntos: coords,
          });
        }
      }
    }
    return doc.puntos.length > 0 || doc.trazos.length > 0 ? doc : null;
  }
  return null;
}

const escapar = (t: string): string =>
  t
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/**
 * El HTML autónomo: el mismo planeta, los mismos puntos y las mismas fichas en
 * UN archivo. Se abre sin Vanguard, sin internet y sin JavaScript.
 * `proyectar` lo pone quien llama (la proyección es la misma del mapa de la casa,
 * así el punto no se mueve al cambiar de sitio).
 */
export function aHTML(
  doc: DocumentoMapa,
  geografia: { landPath: string; borderPath: string; graticulePath: string },
  proyectar: (lat: number, lng: number) => { x: number; y: number }
): string {
  const W = 1000;
  const H = 500;
  const marcas = doc.puntos
    .map((p) => {
      const { x, y } = proyectar(p.lat, p.lng);
      const c = colorDeTipo(p.tipo);
      return `<g><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.5" fill="${c}" stroke="#05070a" stroke-width="1.4"/>` +
        `<title>${escapar(p.nombre)}${p.nota ? " — " + escapar(p.nota) : ""}</title></g>`;
    })
    .join("");
  const lineas = doc.trazos
    .map((t) => {
      const d = t.puntos
        .map(([lat, lng], i) => {
          const { x, y } = proyectar(lat, lng);
          return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join(" ");
      return `<path d="${d}" fill="none" stroke="${t.color}" stroke-width="2" stroke-dasharray="6 4"/>`;
    })
    .join("");
  const fichas = doc.puntos
    .map(
      (p, i) =>
        `<li><b>${i + 1}. ${escapar(p.nombre)}</b> <span class="c">${p.lat.toFixed(3)}, ${p.lng.toFixed(3)}</span>` +
        `${p.nota ? `<br>${escapar(p.nota)}` : ""}` +
        `${p.fuente ? `<br><i>Fuente: ${escapar(p.fuente)}</i>` : `<br><i>Sin fuente declarada.</i>`}</li>`
    )
    .join("");
  return `<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapar(doc.nombre)} — mapa hecho en Vanguard</title>
<style>
  :root { color-scheme: dark; }
  body { margin:0; background:#05070a; color:#e6e9ef; font-family: ui-sans-serif, system-ui, "Segoe UI", Arial, sans-serif; }
  header { padding:18px 22px 10px; border-bottom:1px solid #1b2430; }
  h1 { margin:0 0 4px; font-size:20px; letter-spacing:.02em; }
  .lema { margin:0; color:#9aa7b8; font-size:13px; }
  .autor { margin:6px 0 0; color:#6d7a8c; font-size:11px; font-family:ui-monospace, monospace; text-transform:uppercase; letter-spacing:.14em; }
  svg { display:block; width:100%; height:auto; background:#070c12; }
  .tierra { fill:#121a24; stroke:#28394d; stroke-width:.5; }
  .reticula { fill:none; stroke:#1c2733; stroke-width:.5; }
  ol { margin:0; padding:16px 22px 40px; max-width:760px; }
  li { margin:0 0 10px; font-size:13px; line-height:1.45; color:#c8d2e0; }
  li b { color:#fff; }
  .c { font-family:ui-monospace, monospace; font-size:10px; color:#6d7a8c; }
  i { color:#8b98aa; }
  footer { padding:12px 22px 30px; color:#5b6878; font-size:11px; }
</style></head><body>
<header>
  <h1>${escapar(doc.nombre)}</h1>
  <p class="lema">${escapar(doc.lema || "Sin lema.")}</p>
  <p class="autor">${doc.puntos.length} puntos · ${doc.trazos.length} trazos${doc.autor ? " · " + escapar(doc.autor) : ""} · hecho en el Taller de Mapas de Vanguard</p>
</header>
<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${escapar(doc.nombre)}">
  <path class="reticula" d="${geografia.graticulePath}"/>
  <path class="tierra" d="${geografia.landPath}"/>
  <path fill="none" stroke="#33475e" stroke-width=".5" d="${geografia.borderPath}"/>
  ${lineas}
  ${marcas}
</svg>
<ol>${fichas || "<li>Este mapa no tiene puntos todavía.</li>"}</ol>
<footer>Archivo autónomo: no necesita Vanguard ni conexión. Los datos son los que escribió su autor; la geografía es Natural Earth.</footer>
</body></html>`;
}

export function descargar(nombreArchivo: string, contenido: string, tipo: string): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([contenido], { type: `${tipo};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombreArchivo;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function nombreDeArchivo(doc: DocumentoMapa, extension: string): string {
  const limpio = doc.nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "mapa";
  return `${limpio}.${extension}`;
}
