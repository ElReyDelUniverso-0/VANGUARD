import { NextResponse } from "next/server";
import { execFile } from "child_process";

// Vanguard v12 — API proxy de WIKIPEDIA (integracion real, sin API key).
// GET /api/wiki?q=Segunda%20Guerra%20Mundial
// Nota del sandbox: Wikipedia bloquea la huella TLS de node (403), pero curl
// pasa sin problema -> se usa curl con fallback a fetch.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  if (!q) return NextResponse.json({ error: "Falta el parametro q" }, { status: 400 });
  const target = `https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(q.replace(/ /g, "_"))}?redirect=true`;

  const viaCurl = () => new Promise<string | null>((resolve) => {
    execFile("curl", ["-s", "--max-time", "8", "-A", "VANGUARD-App/12.0 (educational app; contact: local)", "-H", "Accept: application/json", target], { timeout: 9000 }, (err, stdout) => {
      resolve(err ? null : (stdout || null));
    });
  });

  try {
    let raw = await viaCurl();
    if (!raw) {
      const res = await fetch(target, { headers: { "User-Agent": "VANGUARD-App/12.0 (educational app)", Accept: "application/json" }, signal: AbortSignal.timeout(7000) });
      if (!res.ok) return NextResponse.json({ error: `Wikipedia respondio ${res.status}` }, { status: 502 });
      raw = await res.text();
    }
    const j = JSON.parse(raw);
    if (j.type && String(j.type).includes("error")) {
      return NextResponse.json({ error: "Pagina no encontrada en Wikipedia" }, { status: 404 });
    }
    return NextResponse.json({
      title: j.title ?? q,
      extract: j.extract ?? "",
      thumbnail: j.thumbnail?.source,
      url: j.content_urls?.desktop?.page,
      wikiBase: j.wikibase_item,
    });
  } catch {
    return NextResponse.json({ error: "Sin conexion con Wikipedia" }, { status: 504 });
  }
}
