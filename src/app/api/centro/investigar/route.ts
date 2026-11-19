import { NextRequest, NextResponse } from "next/server";
import { claveCliente, muro, sanitizarLinea } from "@/lib/fortaleza";
import { buscarFuentes, pasajesDe, fuentesVivas } from "@/lib/centro/corpus";
import { investigar } from "@/lib/centro/sintesis";
import { contradiccionesEntre, idfDe, puntuar, terminos } from "@/lib/centro/texto";
import type { Contradiccion, Documento, Fuente, Pasaje } from "@/lib/centro/tipos";

// v419.1 · LA CÁMARA DE INTELIGENCIA — paso 2: investigar con las fuentes elegidas.
//
// Recibe la pregunta y los ids de las fuentes que el operador marcó (más, si
// quiere, sus propios documentos ya extraídos en el navegador —la BD viva de
// Vercel es efímera, así que el documento viaja con la petición y no se guarda
// en servidor).
//
// Devuelve una Investigación con hechos / interpretaciones / no confirmado,
// citas validadas, contradicciones entre fuentes, vacíos y bibliografía real.
//
// POST { pregunta, fuentes: string[], documentos?: Documento[], sinModelo?: boolean }

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_DOCS = 3;
const MAX_CHARS_DOC = 160_000;

function pasajesDeDocumento(
  pregunta: string,
  docs: Documento[]
): { fuentes: Fuente[]; pasajes: Pasaje[] } {
  const fuentes: Fuente[] = [];
  const pasajes: Pasaje[] = [];
  const q = terminos(pregunta);
  const idf = idfDe(docs.flatMap((d) => d.trozos.map((t) => t.texto)));

  for (const doc of docs) {
    fuentes.push({
      id: doc.id,
      via: "documento",
      titulo: doc.nombre,
      resumen: `Documento del operador · ${doc.caracteres.toLocaleString("es-ES")} caracteres · ${doc.paginas} pág.`,
      ruta: "",
      emisor: "Documento del operador",
      fecha: undefined,
    });
    const mejores = doc.trozos
      .map((t) => ({ t, s: puntuar(q, t.texto, idf) }))
      .sort((a, b) => b.s - a.s)
      .slice(0, 4);
    // si la pregunta no toca el documento, al menos va su arranque
    const elegidos = mejores.some((m) => m.s > 0) ? mejores : doc.trozos.slice(0, 2).map((t) => ({ t, s: 0 }));
    for (const { t } of elegidos) {
      pasajes.push({ fuenteId: doc.id, n: t.n, texto: t.texto, donde: `pág. ${t.pagina} · trozo ${t.n + 1}` });
    }
  }
  return { fuentes, pasajes };
}

export async function POST(req: NextRequest) {
  const ip = claveCliente(req);
  const v = muro(`centro-investigar:${ip}`, 12, 60_000, 120_000);
  if (!v.permitido) {
    return NextResponse.json(
      { ok: false, error: `La Cámara está ocupada (12 investigaciones por minuto). Vuelve en ${v.espera} s.` },
      { status: 429 }
    );
  }

  let cuerpo: {
    pregunta?: unknown;
    fuentes?: unknown;
    documentos?: unknown;
    sinModelo?: unknown;
  } = {};
  try {
    cuerpo = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Cuerpo inválido" }, { status: 400 });
  }

  const pregunta = sanitizarLinea(cuerpo.pregunta, 400);
  if (pregunta.length < 3) {
    return NextResponse.json({ ok: false, error: "Falta la pregunta." }, { status: 400 });
  }

  const ids = Array.isArray(cuerpo.fuentes) ? (cuerpo.fuentes as unknown[]).map(String).slice(0, 16) : [];
  const avisos: string[] = [];

  // ① fuentes del corpus de la casa
  let fuentes: Fuente[] = buscarFuentes(pregunta, { limite: 14 })
    .filter((f) => ids.includes(f.id))
    .map(({ puntos: _p, muestra: _m, pasajesN: _n, ...f }) => f);

  if (!fuentes.length && !ids.length) {
    return NextResponse.json({ ok: false, error: "No marcaste ninguna fuente. Selecciona al menos una." }, { status: 400 });
  }

  // ② fuentes vivas del núcleo (noticias, teatros) que el operador pueda haber marcado
  const marcadasVivas = ids.filter((id) => id.startsWith("nucleo:"));
  if (marcadasVivas.length) {
    const vivas = await fuentesVivas(pregunta, 8);
    fuentes = [...fuentes, ...vivas.filter((f) => marcadasVivas.includes(f.id)).map(({ puntos: _p, muestra: _m, pasajesN: _n, ...f }) => f)];
  }

  // ③ documentos del operador
  let pasajesDocs: Pasaje[] = [];
  let fuentesDocs: Fuente[] = [];
  const docsEntrada = Array.isArray(cuerpo.documentos) ? (cuerpo.documentos as Documento[]).slice(0, MAX_DOCS) : [];
  if (docsEntrada.length) {
    const limpios = docsEntrada.filter(
      (d) => d && typeof d.texto === "string" && Array.isArray(d.trozos) && d.id.startsWith("doc:")
    );
    const recortados = limpios.map((d) => ({ ...d, texto: d.texto.slice(0, MAX_CHARS_DOC) }));
    const r = pasajesDeDocumento(pregunta, recortados);
    fuentesDocs = r.fuentes;
    pasajesDocs = r.pasajes;
    fuentes = [...fuentes, ...fuentesDocs];
  }

  if (!fuentes.length) {
    const sugeridas = buscarFuentes(pregunta, { limite: 6 });
    return NextResponse.json(
      {
        ok: false,
        error: "Ninguna de las fuentes marcadas existe o habla del asunto. Vuelve a buscar.",
        sugeridas: sugeridas.map((s) => ({ id: s.id, titulo: s.titulo, ruta: s.ruta })),
      },
      { status: 409 }
    );
  }

  // ④ pasajes citables de cada fuente
  const idsCasa = fuentes.filter((f) => f.via !== "documento").map((f) => f.id);
  const pasajes: Pasaje[] = [...pasajesDe(idsCasa, pregunta, 3, 20), ...pasajesDocs];

  if (!pasajes.length) avisos.push("Las fuentes elegidas existen pero no tienen pasajes utilizables para esta pregunta.");

  // ⑤ contradicciones entre TODO el material (casa + documentos)
  const paraContrastar = [
    ...fuentes
      .filter((f) => f.via !== "documento")
      .map((f) => ({
        id: f.id,
        nombre: f.titulo,
        trozos: pasajes.filter((p) => p.fuenteId === f.id).map((p) => ({ texto: p.texto, pagina: p.n })),
      }))
      .filter((x) => x.trozos.length >= 1),
    ...docsEntrada.map((d) => ({
      id: d.id,
      nombre: d.nombre,
      trozos: (d.trozos ?? []).slice(0, 40).map((t) => ({ texto: t.texto, pagina: t.pagina })),
    })),
  ];
  let contradicciones: Contradiccion[] = [];
  if (paraContrastar.length >= 2) {
    try {
      contradicciones = contradiccionesEntre(paraContrastar);
    } catch {
      avisos.push("El contraste de fuentes falló; el resto del análisis sigue siendo válido.");
    }
  }

  // ⑥ temas vecinos reales de la casa (explorador)
  const relacionados = buscarFuentes(pregunta, { limite: 20 })
    .filter((f) => !ids.includes(f.id))
    .slice(0, 6)
    .map((f) => ({
      titulo: f.titulo,
      ruta: f.ruta,
      porque: `Trata ${f.via === "pais" ? "la ficha del país" : f.via === "dossier" ? "el mismo eje sistémico" : "el mismo asunto"} — ${f.pasajesN} pasajes afines a tu pregunta.`,
    }));

  const investigacion = await investigar({
    pregunta,
    fuentes,
    pasajes,
    contradicciones,
    relacionados,
    sinModelo: cuerpo.sinModelo === true,
  });

  if (avisos.length) investigacion.avisos = [...investigacion.avisos, ...avisos];

  return NextResponse.json({ ok: true, investigacion });
}
