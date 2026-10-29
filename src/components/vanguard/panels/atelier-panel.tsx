"use client";

// ============================================================
// v126.0 LA CASA · ATELIER — LA SALA DONDE LA CASA SE CUIDA
// Las cinco leyes del lujo, vivas y tocables:
//   1 · MODO GALERÍA — espacio negativo: la obra respira sola
//   2 · MATERIALES — seis acabados finos con su textura en vivo
//   3 · EDICIÓN LIMITADA — unidades numeradas y cuenta atrás real
//   4 · ARTESANÍA — TU serie única grabada, con grano propio
//   5 · NARRATIVA — la historia de la Casa, horas de forja y firma
// ============================================================
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { IlustracionViva } from "@/components/vanguard/ilustraciones-vivas";
import { useLuxe } from "@/lib/luxe-store";
import {
  ACABADOS,
  acabadoDe,
  edicionVigente,
  cuentaAtras,
  unidadDeSerie,
  granoDeSerie,
  HISTORIA,
  horasDeForja,
  FIRMA_CASA,
} from "@/lib/luxe";
import { BITACORA } from "@/lib/bitacora";
import { cn, q2 } from "@/lib/utils";
import { sfx } from "@/lib/sound";
import { useSala3DContenido, type FilaContenido3D } from "@/components/vanguard/use-sala3d-contenido";
import {
  Gem, Hammer, ScrollText, Hourglass, Images, Sparkles, Feather, Check, Minimize2,
} from "lucide-react";

export function AtelierPanel() {
  const luxe = useLuxe();
  const [ahora, setAhora] = useState<Date | null>(null);

  // reloj de la edición: arranca neutro (SSR-safe) y late cada 30s
  useEffect(() => {
    const id = requestAnimationFrame(() => setAhora(new Date()));
    const iv = setInterval(() => setAhora(new Date()), 30_000);
    return () => { cancelAnimationFrame(id); clearInterval(iv); };
  }, []);

  const edicion = useMemo(() => edicionVigente(ahora ?? new Date(0)), [ahora]);
  const acabado = acabadoDe(luxe.acabado);
  const grano = useMemo(() => granoDeSerie(luxe.serie ?? ""), [luxe.serie]);
  const unidad = useMemo(
    () => (luxe.serie ? unidadDeSerie(luxe.serie, edicion) : null),
    [luxe.serie, edicion]
  );
  const restantes = Math.max(0, edicion.total - edicion.reclamadas);
  const forjaFecha = useMemo(
    () => (luxe.forjaISO ? new Date(luxe.forjaISO).toLocaleDateString("es", { day: "numeric", month: "long", year: "numeric" }) : "—"),
    [luxe.forjaISO]
  );
  const horas = horasDeForja(BITACORA.length);

  const elegirAcabado = (id: string) => {
    luxe.setAcabado(id);
    sfx.campana(); // Ley 2: la casa suena a lujo en cada gesto
  };

  // v168: PARIDAD 2D→3D — las cinco leyes vivas del atelier suben a la sala.
  // Offset del oyente: 5 filas de cabecera y después los ACABADOS («elegir acabado»)
  const filas3D = useMemo<FilaContenido3D[]>(() => {
    const filas: FilaContenido3D[] = [
      { t: `ACABADO VIGENTE: ${acabado.nombre.toUpperCase()}`, color: "#D4AF37", d: `${acabado.material} · toca cada acabado y la casa entera cambia de piel en vivo` },
      {
        t: `EDICIÓN LIMITADA: ${edicion.nombre.toUpperCase()}`,
        v: unidad ? `Nº ${String(unidad).padStart(4, "0")}` : "—",
        p: Math.round((edicion.reclamadas / edicion.total) * 100),
        color: "#D4AF37",
        d: `«${edicion.lema}» · quedan ${restantes.toLocaleString("es")} de ${edicion.total.toLocaleString("es")} piezas · cierra en ${ahora ? cuentaAtras(edicion.hasta, ahora) : "—"}`,
      },
      {
        t: `TU SERIE: ${luxe.serie ? luxe.serie : "FORJANDO…"}`,
        color: "#F5C542",
        d: luxe.serie ? `grabada el ${forjaFecha} · grano Nº ${grano.semilla % 9973} · pieza única que no se repite ni se vende` : "tu placa se graba al cruzar la puerta de la Casa",
      },
      { t: `MODO GALERÍA: ${luxe.galeria ? "ABIERTO" : "CERRADO"}`, color: "#7AB8FF", d: "Ley del espacio negativo: retira avisos, contadores y adornos en TODAS las salas", a: "alternar galería" },
      { t: `${horas.toLocaleString("es")} HORAS DE FORJA`, v: `${BITACORA.length} ENTREGAS`, color: "#D4AF37", d: FIRMA_CASA.lema },
    ];
    for (const acab of ACABADOS) {
      filas.push({
        t: acab.nombre,
        v: acab.material.toUpperCase(),
        color: luxe.acabado === acab.id ? "#3DDC84" : "#7AB8FF",
        d: `${acab.desc} · la luz responde: el brillo de los títulos de la Casa cambia con él`,
        a: "elegir acabado",
      });
    }
    return filas;
  }, [luxe, acabado, edicion, unidad, grano, restantes, forjaFecha, horas, ahora]);
  useSala3DContenido("atelier", "EL ATELIER", "#D4AF37", "La sala donde la Casa se cuida: materia, escasez, artesanía e historia", filas3D);

  // v168: las acciones ejecutan los MISMOS handlers que los botones 2D
  useEffect(() => {
    const onAccion = (e: Event) => {
      const det = (e as CustomEvent<{ tab: string; accion: string; idx: number }>).detail;
      if (det?.tab !== "atelier") return;
      if (det.accion === "elegir acabado") {
        const acab = ACABADOS[det.idx - 5];
        if (acab) elegirAcabado(acab.id);
        return;
      }
      if (det.accion === "alternar galería") { luxe.setGaleria(!luxe.galeria); sfx.campana(); }
    };
    window.addEventListener("vg:sala3d-accion", onAccion);
    return () => window.removeEventListener("vg:sala3d-accion", onAccion);
  }, [luxe]);

  return (
    <div className="space-y-4">
      <PanelHeader
        title="EL ATELIER"
        subtitle="La sala donde la Casa se cuida: materia, escasez, artesanía e historia"
        icon={<Gem className="w-4 h-4" />}
        color="amber"
      />

      {/* HÉROE — la gema de la Casa */}
      <div className="hud-panel p-5 relative overflow-hidden vg-mat-vidrio">
        <div className="flex items-center gap-5 flex-wrap">
          <IlustracionViva tipo="gema" ancho={150} className="shrink-0" />
          <div className="min-w-0 flex-1">
            <h3 className="font-caviar text-xl tracking-wide text-foreground">
              Casa <span style={{ color: "var(--vg-sello, #D4AF37)" }}>VANGUARD</span>
            </h3>
            <p className="text-[11px] text-muted-foreground leading-relaxed mt-1.5">
              Cinco leyes sostienen esta casa: el espacio que sobra es tan valioso como la obra;
              la materia se siente antes de verse; lo exclusivo se numera; lo artesanal nunca se
              repite; y toda pieza lleva su historia.{" "}
              <span className="text-foreground">Nada aquí grita. Todo dura.</span>
            </p>
          </div>
        </div>
      </div>

      {/* LEY 2 + 4 — EL ARMARIO DE ACABADOS */}
      <div className="hud-panel p-4">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-foreground flex items-center gap-2 mb-1">
          <Hammer className="w-3.5 h-3.5" style={{ color: "var(--vg-sello, #D4AF37)" }} /> EL ARMARIO DE ACABADOS
        </p>
        <p className="text-[10px] text-muted-foreground leading-relaxed mb-3">
          Ley de la materia: toca cada acabado y la casa entera cambia de piel en vivo — con su
          campana de salón. El acabado se nota en el brillo de los títulos de la Casa y en este
          atelier.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {ACABADOS.map((a) => {
            const activo = luxe.acabado === a.id;
            return (
              <button
                key={a.id}
                onClick={() => elegirAcabado(a.id)}
                className={cn(
                  "text-left p-3 rounded border transition-all group relative overflow-hidden",
                  activo ? "border-foreground/60" : "border-border hover:border-foreground/30"
                )}
                style={activo ? { boxShadow: `0 0 22px -8px ${a.hex}`, borderColor: a.hex } : undefined}
              >
                {/* muestra de material */}
                <span
                  className={cn("vg-mat block w-full h-9 rounded mb-2", `vg-mat-${a.textura}`)}
                  style={{ ["--vg-mat" as string]: a.hex }}
                  aria-hidden
                />
                <span className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] font-bold tracking-wider text-foreground">{a.nombre}</span>
                  {activo && <Check className="w-3.5 h-3.5" style={{ color: a.hex }} />}
                </span>
                <span className="block text-[9px] uppercase tracking-wider text-muted-foreground mt-0.5">{a.material}</span>
                <span className="block text-[9px] text-muted-foreground leading-relaxed mt-1">{a.desc}</span>
                {/* brillo al pasar (Ley 2: la luz responde) */}
                <span className="vg-sheen" aria-hidden />
              </button>
            );
          })}
        </div>
        <p className="font-mono text-[9px] text-muted-foreground mt-3">
          acabado vigente: <span style={{ color: acabado.hex }} className="font-bold">{acabado.nombre}</span> · {acabado.material.toLowerCase()}
        </p>
      </div>

      {/* LEY 3 + 4 — LA PLACA: EDICIÓN LIMITADA + TU SERIE */}
      <div className="grid md:grid-cols-[1.2fr_1fr] gap-4">
        {/* la edición */}
        <div className="hud-panel p-4 vg-mat-vidrio relative overflow-hidden">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-foreground flex items-center gap-2 mb-1">
            <Hourglass className="w-3.5 h-3.5" style={{ color: "var(--vg-sello, #D4AF37)" }} /> EDICIÓN LIMITADA VIGENTE
          </p>
          <p className="font-caviar text-lg text-foreground mt-1">{edicion.nombre}</p>
          <p className="text-[10px] text-muted-foreground italic leading-relaxed mt-0.5">«{edicion.lema}»</p>

          <div className="flex items-end gap-4 mt-3 flex-wrap">
            <div>
              <p className="font-mono text-[8px] uppercase tracking-widest text-muted-foreground">tu unidad</p>
              <p className="font-caviar text-2xl leading-none" style={{ color: "var(--vg-sello, #D4AF37)" }}>
                {unidad ? `Nº ${String(unidad).padStart(4, "0")}` : "—"}
              </p>
            </div>
            <div>
              <p className="font-mono text-[8px] uppercase tracking-widest text-muted-foreground">de un total de</p>
              <p className="font-mono text-sm font-bold text-foreground">{edicion.total.toLocaleString("es")} piezas</p>
            </div>
            <div>
              <p className="font-mono text-[8px] uppercase tracking-widest text-muted-foreground">quedan libres</p>
              <p className="font-mono text-sm font-bold text-foreground">{restantes.toLocaleString("es")}</p>
            </div>
          </div>

          {/* barra de escasez */}
          <div className="h-1.5 rounded bg-border/60 overflow-hidden mt-3">
            <div
              className="h-full rounded vg-mat-pulido"
              style={{
                width: `${Math.min(100, (edicion.reclamadas / edicion.total) * 100).toFixed(1)}%`,
                background: "var(--vg-sello, #D4AF37)",
              }}
            />
          </div>
          <p className="font-mono text-[9px] text-muted-foreground mt-2">
            cierra en <span className="text-foreground font-bold">{ahora ? cuentaAtras(edicion.hasta, ahora) : "—"}</span> con el cambio de estación · cada estación del planeta tiene su propia edición y ninguna vuelve
          </p>
        </div>

        {/* tu serie grabada */}
        <div className="hud-panel p-4 relative overflow-hidden">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-foreground flex items-center gap-2 mb-3">
            <Feather className="w-3.5 h-3.5" style={{ color: "var(--vg-sello, #D4AF37)" }} /> TU PLACA DE SERIE
          </p>
          {luxe.serie ? (
            <div className="text-center py-3 vg-grabado rounded border border-border/60" style={{ ["--vg-grano-giro" as string]: `${grano.giro}deg` }}>
              <p className="font-mono text-[8px] uppercase tracking-[0.3em] text-muted-foreground">hecho a mano · pieza única</p>
              <p className="font-caviar text-xl tracking-wider mt-1.5" style={{ color: "var(--vg-sello, #D4AF37)" }}>
                {luxe.serie}
              </p>
              <p className="text-[9px] text-muted-foreground mt-1.5">
                grabada el {forjaFecha} · grano Nº {grano.semilla % 9973}
              </p>
              <p className="text-[9px] text-muted-foreground mt-0.5">
                esta serie no se repite ni se vende: es tuya desde que cruzaste la puerta
              </p>
            </div>
          ) : (
            <p className="text-[10px] text-muted-foreground">forjando tu placa…</p>
          )}
          <p className="text-[9px] text-muted-foreground leading-relaxed mt-3">
            Ley de la artesanía: en la Casa no hay dos piezas iguales. Tu serie vive grabada también
            en la cabecera de la casa — pequeña, como deben ser las cosas bien hechas.
          </p>
        </div>
      </div>

      {/* LEY 1 — MODO GALERÍA */}
      <div className="hud-panel p-4">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-foreground flex items-center gap-2 mb-1">
          <Images className="w-3.5 h-3.5 text-cyan-hud" /> MODO GALERÍA — EL ESPACIO QUE SOBRA
        </p>
        <p className="text-[10px] text-muted-foreground leading-relaxed mb-3">
          Ley del espacio negativo: en una galería, cada obra merece su muro vacío. Actívalo y la
          Casa retira avisos, contadores y adornos; el aire se ensancha y queda solo lo que viniste
          a ver.
        </p>
        <button
          onClick={() => { luxe.setGaleria(!luxe.galeria); sfx.campana(); }}
          className={cn(
            "flex items-center gap-3 p-3 rounded border transition-all w-full text-left",
            luxe.galeria ? "border-cyan-hud bg-cyan-hud/10" : "border-border hover:border-foreground/30"
          )}
        >
          <Minimize2 className={cn("w-4 h-4 shrink-0", luxe.galeria ? "text-cyan-hud" : "text-muted-foreground")} />
          <span className="flex-1">
            <span className="block font-mono text-[10px] font-bold tracking-wider text-foreground">
              MODO GALERÍA — <span className={luxe.galeria ? "text-cyan-hud" : "text-muted-foreground"}>{luxe.galeria ? "ABIERTO (la casa descansa)" : "CERRADO (casa completa)"}</span>
            </span>
            <span className="block text-[9px] text-muted-foreground mt-0.5">
              silencia la franja de estadísticas, los avisos de retención, los banderines y rivales — en TODAS las salas
            </span>
          </span>
          <span
            className={cn("w-10 h-5 rounded-full border transition-all relative shrink-0", luxe.galeria ? "border-cyan-hud bg-cyan-hud/30" : "border-border")}
            aria-hidden
          >
            <span
              className="absolute top-0.5 w-3.5 h-3.5 rounded-full transition-all"
              style={{ left: luxe.galeria ? "22px" : "3px", background: luxe.galeria ? "var(--vg-sello, #D4AF37)" : "var(--muted-foreground)" }}
            />
          </span>
        </button>
      </div>

      {/* LEY 5 — LA HISTORIA DE LA CASA */}
      <div className="hud-panel p-4">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-foreground flex items-center gap-2 mb-1">
          <ScrollText className="w-3.5 h-3.5" style={{ color: "var(--vg-sello, #D4AF37)" }} /> LA HISTORIA DE LA CASA
        </p>
        <p className="text-[10px] text-muted-foreground leading-relaxed mb-4">
          Ninguna pieza exclusiva se vende por sus funciones: se cuenta. Estas son las eras por las
          que pasó la Casa — {horas.toLocaleString("es")} horas de taller acumuladas en{" "}
          {BITACORA.length} entregas oficiales.
        </p>
        <div className="space-y-3">
          {HISTORIA.map((c, i) => (
            <motion.div
              key={c.titulo}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: q2(i * 0.06) }}
              className="relative pl-6 border-l border-border/70 pb-1"
            >
              <span
                className="absolute -left-[5px] top-1 w-2.5 h-2.5 rotate-45 border"
                style={{ borderColor: "var(--vg-sello, #D4AF37)", background: i === HISTORIA.length - 1 ? "var(--vg-sello, #D4AF37)" : "transparent" }}
                aria-hidden
              />
              <p className="font-mono text-[8px] uppercase tracking-[0.25em] text-muted-foreground">{c.era}</p>
              <p className="font-caviar text-sm text-foreground mt-0.5">{c.titulo}</p>
              <p className="text-[10px] text-muted-foreground leading-relaxed mt-1">{c.texto}</p>
            </motion.div>
          ))}
        </div>

        {/* la firma */}
        <div className="mt-4 pt-3 border-t border-border/60 text-center">
          <Sparkles className="w-3.5 h-3.5 mx-auto mb-1.5" style={{ color: "var(--vg-sello, #D4AF37)" }} />
          <p className="font-caviar text-sm text-foreground">{FIRMA_CASA.lema}</p>
          <p className="text-[9px] text-muted-foreground mt-1">
            forjada por {FIRMA_CASA.fundador} · dirigida por {FIRMA_CASA.director}
          </p>
        </div>
      </div>
    </div>
  );
}

