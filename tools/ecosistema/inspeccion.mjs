/** Supervisión externa y no destructiva. Sin cookies, datos personales ni mutaciones. */
import { performance } from 'node:perf_hooks';

export const COMPROBACIONES = Object.freeze([
  { id: 'portada', tipo: 'pagina', url: 'https://vanguard-kq9r.vercel.app/', limiteMs: 8000 },
  { id: 'mapas', tipo: 'pagina', url: 'https://vanguard-kq9r.vercel.app/mapas', limiteMs: 8000 },
  { id: 'memoria', tipo: 'pagina', url: 'https://vanguard-kq9r.vercel.app/memoria', limiteMs: 8000 },
  { id: 'mercado', tipo: 'pagina', url: 'https://vanguard-kq9r.vercel.app/mercado', limiteMs: 8000 },
  { id: 'visita', tipo: 'pagina', url: 'https://vanguard-kq9r.vercel.app/visita', limiteMs: 8000 },
  { id: 'salud', tipo: 'salud', url: 'https://vanguard-kq9r.vercel.app/api/health', limiteMs: 8000 },
  { id: 'sitemap', tipo: 'sitemap', url: 'https://vanguard-kq9r.vercel.app/sitemap.xml', limiteMs: 8000 },
  { id: 'banco-mundial', tipo: 'banco', url: 'https://api.worldbank.org/v2/country/DOM/indicator/IT.NET.USER.ZS?format=json&per_page=2', limiteMs: 10000 },
]);

export function validar(tipo, body) {
  if (tipo === 'pagina') return /<html\b/i.test(body) ? null : 'La respuesta no parece HTML';
  if (tipo === 'sitemap') return /<(?:sitemapindex|urlset)\b/i.test(body) ? null : 'Sitemap sin raíz reconocida';
  if (tipo === 'salud') {
    try { const d = JSON.parse(body); return d.ok !== true ? 'Latido inválido' : d.db !== 'up' ? `Base de datos: ${String(d.db)}` : null; }
    catch { return 'Latido no es JSON válido'; }
  }
  if (tipo === 'banco') {
    try { const d = JSON.parse(body); return Array.isArray(d) && Array.isArray(d[1]) && d[1].some(x => x && x.value != null && x.date) ? null : 'Fuente sin observaciones válidas'; }
    catch { return 'Fuente no es JSON válido'; }
  }
  return 'Tipo no reconocido';
}

export async function comprobar(item, { fetchImpl = fetch, timeoutMs = 12000, intentos = 2, esperar = ms => new Promise(r => setTimeout(r, ms)) } = {}) {
  const inicio = performance.now(); let ultimo = 'Sin respuesta', codigo = null, realizadas = 0;
  for (let i = 0; i < intentos; i++) {
    realizadas++;
    try {
      const r = await fetchImpl(item.url, { signal: AbortSignal.timeout(timeoutMs), headers: { 'User-Agent': 'Vanguard-Supervision/1.0', 'Accept': 'text/html, application/json, application/xml, */*' }, redirect: 'follow' });
      codigo = r.status;
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const body = await r.text();
      const problema = validar(item.tipo, body);
      if (problema) throw new Error(problema);
      const ms = Math.round(performance.now() - inicio);
      return { id: item.id, tipo: item.tipo, estado: ms > item.limiteMs ? 'lento' : 'ok', codigo, ms, intentos: realizadas };
    } catch (e) {
      ultimo = e?.name === 'TimeoutError' ? 'Tiempo agotado' : (e instanceof Error ? e.message : 'Error desconocido');
      if (i + 1 < intentos) await esperar(500);
    }
  }
  return { id: item.id, tipo: item.tipo, estado: 'error', codigo, ms: Math.round(performance.now() - inicio), intentos: realizadas, detalle: ultimo };
}

export async function inspeccionar(items = COMPROBACIONES, opciones = {}) {
  const resultados = [];
  // Límite explícito: tres peticiones simultáneas, ninguna URL de usuario.
  for (let i = 0; i < items.length; i += 3) resultados.push(...await Promise.all(items.slice(i, i + 3).map(x => comprobar(x, opciones))));
  return { version: 1, realizadoEn: new Date().toISOString(), resultados };
}
