import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
const API = "https://de1.api.radio-browser.info/json";

export async function GET(req: NextRequest) {
  const kind = req.nextUrl.searchParams.get("kind") ?? "stations";
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 9000);
  try {
    const url = new URL(kind === "countries" ? `${API}/countries` : `${API}/stations/search`);
    if (kind === "countries") {
      url.searchParams.set("order", "stationcount");
      url.searchParams.set("reverse", "true");
    } else {
      const country = (req.nextUrl.searchParams.get("country") ?? "").toUpperCase();
      const tag = (req.nextUrl.searchParams.get("tag") ?? "").slice(0, 40).trim();
      const name = (req.nextUrl.searchParams.get("q") ?? "").slice(0, 60).trim();
      if (!/^[A-Z]{2}$/.test(country)) return NextResponse.json({ error: "Elige un país." }, { status: 400 });
      url.searchParams.set("countrycode", country);
      url.searchParams.set("limit", "36");
      url.searchParams.set("hidebroken", "true");
      url.searchParams.set("order", "clickcount");
      url.searchParams.set("reverse", "true");
      if (tag) url.searchParams.set("tag", tag);
      if (name) url.searchParams.set("name", name);
    }
    const response = await fetch(url, {
      signal: controller.signal,
      cache: "no-store",
      headers: { "User-Agent": "VanguardRadio/1.0 (global station discovery)" },
    });
    if (!response.ok) return NextResponse.json({ error: "El directorio global de radios no respondió." }, { status: 502 });
    const data = await response.json();
    if (kind === "countries") {
      const countries = (Array.isArray(data) ? data : []).filter((x: { iso_3166_1?: string; stationcount?: number }) => /^[A-Z]{2}$/.test(x.iso_3166_1 ?? "") && Number(x.stationcount) > 0);
      return NextResponse.json(countries, { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } });
    }
    const stations = (Array.isArray(data) ? data : []).map((x: Record<string, unknown>) => ({
      id: String(x.stationuuid ?? ""), name: String(x.name ?? "").trim(),
      country: String(x.country ?? ""), language: String(x.language ?? ""),
      codec: String(x.codec ?? ""), bitrate: Number(x.bitrate ?? 0),
      url: String(x.url_resolved ?? x.url ?? ""), homepage: String(x.homepage ?? ""),
      tags: String(x.tags ?? "").split(",").slice(0, 6).join(", "),
    })).filter((x: { id: string; name: string; url: string }) => x.id && x.name && /^https?:\/\//i.test(x.url));
    return NextResponse.json(stations, { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=1800" } });
  } catch {
    return NextResponse.json({ error: "No pude contactar el directorio de emisoras ahora mismo." }, { status: 504 });
  } finally {
    clearTimeout(timer);
  }
}
