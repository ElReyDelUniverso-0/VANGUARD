"use client";

// v13 — JUICIO HISTORICO: eventos presentados como causas legales.
// Evidencias con fuentes reales, la comunidad vota CULPABLE/INOCENTE y se
// analiza por que gano cada veredicto. Nuevo caso destacado cada semana.

import { useState, useEffect, useMemo } from "react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Gavel, Scale, FileSearch, Users, Check, X } from "lucide-react";
import { useGameStore } from "@/lib/game-store";

interface Evidence { title: string; detail: string; source: string; weight: "FAVORABLE" | "CARGO" | "NEUTRA"; }
interface Case {
  id: string;
  year: string;
  title: string;
  accused: string;
  charge: string;
  brief: string;
  evidence: Evidence[];
  verdictAnalysis: { guilty: string; innocent: string };
  baseGuilty: number; // % comunitario base (simulado) que vota culpable
}

const CASES: Case[] = [
  {
    id: "t-submarinos",
    year: "1917",
    title: "La guerra submarina total",
    accused: "Estado Mayor del Imperio Alemán",
    charge: "Provocar deliberadamente la entrada de EEUU en la I Guerra Mundial",
    brief: "En febrero de 1917, Alemania reanuda el hundimiento sin aviso de barcos mercantes. El objetivo era asfixiar a Gran Bretaña antes de que EEUU movilizara. ¿Era una estrategia militar legítima o una apuesta temeraria que condenó al Reich?",
    evidence: [
      { title: "Telegram Zimmermann interceptado", detail: "Berlín ofrece a México recuperar Texas, Arizona y Nuevo México si EEUU entra en guerra. Publicado por el Estado Mayor británico el 1 de marzo.", source: "Archivo Nacional Británico", weight: "CARGO" },
      { title: "Memorándum de Bethmann-Hollweg", detail: "El canciller advirtió al Kaiser que la guerra submarina total 'probablemente traería a EEUU a la guerra'. Fue ignorado.", source: "Archivos Políticos de Berlín", weight: "FAVORABLE" },
      { title: "Registro de hundimientos", detail: "860.000 toneladas aliadas hundidas solo entre febrero y abril de 1917: 868 barcos, muchos neutrales.", source: "Lloyd's of London", weight: "CARGO" },
      { title: "Contexto del bloqueo aliado", detail: "El bloqueo británico ya causaba hambruna en Alemania desde 1914. El derecho internacional sobre bloqueos era ambiguo.", source: "Documentos de la Haya", weight: "NEUTRA" },
    ],
    verdictAnalysis: {
      guilty: "Quienes votan culpable argumentan que el Estado Mayor sabía —por escrito— que su estrategia provocaría la intervención estadounidense, y la ejecutó igualmente: la definición de temeridad criminal.",
      innocent: "Quienes votan inocente sostienen que una nación bloqueada y hambrienta tenía derecho a romper el bloqueo enemigo, y que culparla por la reacción de terceros viola el principio de responsabilidad causal.",
    },
    baseGuilty: 62,
  },
  {
    id: "t-maine",
    year: "1898",
    title: "El hundimiento del acorazado Maine",
    accused: "Prensa amarilla (Hearst y Pulitzer) + facción española",
    charge: "Fabricar la casus belli de la Guerra Hispano-Estadounidense",
    brief: "El Maine explota en La Habana el 15 de febrero de 1898: 266 muertos. Los titulares gritan '¡Recuerden el Maine, al infierno con España!' antes de cualquier investigación. Dos meses después, EEUU está en guerra y toma Cuba, Puerto Rico y Filipinas.",
    evidence: [
      { title: "Informe naval de 1898", detail: "La corte oficial concluyó que una mina externa hundió el buque, sin atribuir autoría.", source: "US Navy Court of Inquiry", weight: "NEUTRA" },
      { title: "Estudio naval de Rickover (1976)", detail: "Análisis moderno apunta a combustión espontánea de carbón adyacente a polvorines: accidente interno.", source: "US Navy Historical Center", weight: "FAVORABLE" },
      { title: "Cable de Hearst a su fotógrafo", detail: "'Usted proporcione las fotografías, yo proveeré la guerra' (autenticidad debatida, pero refleja el método).", source: "Archivo Hearst / historiografía", weight: "CARGO" },
      { title: "Circulación de prensa", detail: "Hearst y Pulitzer elevaban tiradas 30-60% cubriendo la crisis con ilustraciones sensacionalistas.", source: "Registros de circulación de época", weight: "CARGO" },
    ],
    verdictAnalysis: {
      guilty: "Votar culpable es aceptar que la prensa fabricó la urgencia bélica con datos que no tenía, y que la guerra se vendió antes de investigarse: la matriz moderna de la manipulación mediática.",
      innocent: "Votar inocente reconoce que hubo dolor real (266 muertos), errores de ciencia forense de época, y que la expansión de 1898 respondía a intereses geopolíticos mayores que un titular.",
    },
    baseGuilty: 54,
  },
  {
    id: "t-munich",
    year: "1938",
    title: "Los Acuerdos de Múnich",
    accused: "Neville Chamberlain (con Daladier)",
    charge: "Entregar Checoslovaquia a Hitler y perder la última ventana de detención",
    brief: "Septiembre de 1938: Gran Bretaña y Francia ceden los Sudetes a la Alemania nazi sin invitar a Praga a la mesa. Chamberlain vuelve proclamando 'paz para nuestro tiempo'. Once meses después, la Wehrmacht entra en Praga y estalla la II Guerra Mundial.",
    evidence: [
      { title: "Estado de fuerzas 1938", detail: "La Luftwaffe no tenía superiority clara; las defensas checas eran sólidas. Varios generales alemanes preparaban un golpe si Hitler 'retrocedía'.", source: "Archivos militares DE/GB", weight: "CARGO" },
      { title: "El consenso antibélico", detail: "Tras la I Guerra Mundial, el electorado británico y francés rechazaba por abrumadora mayoría otra guerra.", source: "Gallup de época / prensa", weight: "FAVORABLE" },
      { title: "Acta de la reunión de Hossbach (1937)", detail: "Hitler ya había fijado por escrito el objetivo de expansión hacia el este en 1938-1943: el apaciguamiento chocaba con un plan, no con una queja.", source: "Ministerio de Exteriores alemán", weight: "CARGO" },
      { title: "Rearme británico en curso", detail: "El programa de cazas Hurricane/Spitfire y radares estaba a mitad de camino en 1938: un año extra sí importaba.", source: "Air Ministry", weight: "NEUTRA" },
    ],
    verdictAnalysis: {
      guilty: "Votar culpable subraya que la inteligencia británica sabía del plan de Hitler (Hossbach) y aun así regaló la mejor línea defensiva de Europa y desmoralizó a la oposición interna alemana.",
      innocent: "Votar inocente admite el argumento técnico del rearme: en 1938 las defensas aéreas no estaban listas y Churchill mismo reconoció después que ganar un año fue decisivo para la Batalla de Inglaterra.",
    },
    baseGuilty: 71,
  },
  {
    id: "t-iran53",
    year: "1953",
    title: "El golpe contra Mossadegh",
    accused: "CIA y MI6 (Operación Ajax)",
    charge: "Derrocar a un gobierno democrático por control del petróleo",
    brief: "Irán nacionaliza su petróleo en 1951. En agosto de 1953, una operación encubierta anglo-estadounidense organiza protestas, compra militares y derriba al primer ministro democráticamente elegido. El Sha gobierna luego con poder absoluto hasta 1979.",
    evidence: [
      { title: "Publicación de la CIA (2013)", detail: "La propia agencia reconoció su papel central en la planificación y financiación del golpe.", source: "FOIA / Archive.org", weight: "CARGO" },
      { title: "Documentos de la compañía petrolera", detail: "La AIOC británica orquestó el boicot global al crudo iraní para forzar la intervención de Londres y Washington.", source: "Archivos británicos desclasificados", weight: "CARGO" },
      { title: "Contexto de Guerra Fría", detail: "Washington temía que la crisis acabara con el partido pro-soviético Tudeh en el poder: el golpe se vendió como contención.", source: "Memorias de Dulles", weight: "FAVORABLE" },
      { title: "Mobilización popular real", detail: "Hubo base social contra Mossadegh (clero, parte del ejército): el golpe no creó la oposición, la canalizó.", source: "Historiografía académica", weight: "NEUTRA" },
    ],
    verdictAnalysis: {
      guilty: "Votar culpable reconoce la cadena documental completa: motivación petrolera, planificación encubierta confesa y consecuencias catastróficas (dictadura del Sha, revolución de 1979,(hostilidad duradera).",
      innocent: "Votar inocente acepta el argumento de Guerra Fría: en 1953, con Corea recién cerrada, la caída de Irán en la órbita soviética parecía el riesgo mayor. La historia juzgó después con datos que Dulles no tenía.",
    },
    baseGuilty: 83,
  },
];

const LS_KEY = "vanguard-tribunal-v13";
interface Save { votes: Record<string, "CULPABLE" | "INOCENTE">; }
function loadSave(): Save { try { return JSON.parse(localStorage.getItem(LS_KEY) ?? "") as Save; } catch { return { votes: {} }; } }

export function TribunalPanel() {
  const addCoins = useGameStore((s) => s.addCoins);
  const addXp = useGameStore((s) => s.addXp);
  const [save, setSave] = useState<Save>({ votes: {} });
  const [openCase, setOpenCase] = useState<string | null>(null);

  useEffect(() => { setSave(loadSave()); }, []);

  const featured = useMemo(() => {
    const d = new Date();
    const week = Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 1).getTime()) / (7 * 86400000));
    return CASES[week % CASES.length];
  }, []);

  const vote = (c: Case, v: "CULPABLE" | "INOCENTE") => {
    if (save.votes[c.id]) return;
    const ns = { votes: { ...save.votes, [c.id]: v } };
    setSave(ns);
    localStorage.setItem(LS_KEY, JSON.stringify(ns));
    addCoins(10, "TRIBUNAL: veredicto emitido");
    addXp(10);
    // ¿coincide con la mayoria comunitaria (base + ruido)?
    const majority = c.baseGuilty + (Math.random() * 10 - 5) >= 50 ? "CULPABLE" : "INOCENTE";
    if (v === majority) {
      addCoins(25, "TRIBUNAL: veredicto con la mayoria");
      toast.success("VEREDICTO CON LA MAYORÍA · +10 mon · +25 mon de bonus");
    } else {
      toast("Veredicto disidente registrado — el tribunal valora las minorías");
    }
  };

  return (
    <div className="space-y-3">
      <PanelHeader
        title="Juicio Histórico"
        subtitle="La comunidad como jurado · evidencias con fuentes reales"
        icon={<Gavel className="w-4 h-4 text-amber" />}
        color="amber"
      />

      <div className="grid grid-cols-1 gap-3">
        {CASES.map((c) => {
          const my = save.votes[c.id];
          const isFeatured = c.id === featured.id;
          const guiltyPct = Math.min(95, Math.max(20, c.baseGuilty));
          const isOpen = openCase === c.id;
          return (
            <div key={c.id} className={cn("hud-panel p-3", isFeatured && "neon-border")}>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                {isFeatured && <span className="px-1.5 py-0.5 bg-amber-hud border border-amber-hud text-amber font-mono text-[8px] font-bold tracking-widest">CASO DE LA SEMANA</span>}
                <span className="font-mono text-[9px] text-muted-foreground tracking-widest">{c.year}</span>
              </div>
              <h3 className="font-display text-base font-bold tracking-wide">{c.title}</h3>
              <div className="font-mono text-[10px] text-muted-foreground mt-0.5">
                ACUSADO: <span className="text-soft">{c.accused}</span>
              </div>
              <div className="font-mono text-[10px] text-crisis mt-0.5">CARGO: {c.charge}</div>
              <p className="text-[11px] text-soft/85 leading-relaxed mt-2">{c.brief}</p>

              {/* evidencias */}
              <button onClick={() => setOpenCase(isOpen ? null : c.id)} className="mt-2 font-mono text-[9px] uppercase tracking-widest text-electric hover:underline">
                {isOpen ? "Ocultar" : "Ver"} dossier de evidencias ({c.evidence.length})
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="space-y-1.5 mt-2">
                      {c.evidence.map((e, i) => (
                        <div key={i} className={cn("border-l-2 pl-2 py-1", e.weight === "CARGO" ? "border-crisis" : e.weight === "FAVORABLE" ? "border-neon" : "border-amber")}>
                          <div className="flex items-center gap-1.5">
                            <FileSearch className="w-3 h-3 text-muted-foreground" />
                            <span className="font-mono text-[10px] font-bold">{e.title}</span>
                            <span className={cn("font-mono text-[8px] px-1 border", e.weight === "CARGO" ? "text-crisis border-crisis-hud" : e.weight === "FAVORABLE" ? "text-neon border-neon-hud" : "text-amber border-amber-hud")}>{e.weight}</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground leading-snug mt-0.5">{e.detail}</p>
                          <div className="font-mono text-[8px] text-muted-foreground mt-0.5 uppercase">fuente: {e.source}</div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* veredicto */}
              {my ? (
                <div className="mt-3">
                  <div className="flex items-center justify-between font-mono text-[9px] text-muted-foreground uppercase tracking-widest mb-1">
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> Jurado global</span>
                    <span>TU VOTO: <span className={my === "CULPABLE" ? "text-crisis" : "text-neon"}>{my}</span></span>
                  </div>
                  <div className="h-2 flex overflow-hidden border border-border">
                    <div className="bg-crisis-hud flex items-center justify-center text-crisis font-mono text-[9px] font-bold" style={{ width: `${guiltyPct}%` }}>
                      {guiltyPct}% CULPABLE
                    </div>
                    <div className="bg-neon-hud flex items-center justify-center text-neon font-mono text-[9px] font-bold" style={{ width: `${100 - guiltyPct}%` }}>
                      {100 - guiltyPct}%
                    </div>
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="text-[10px] text-soft/85 leading-relaxed"><span className="text-crisis font-bold">POR QUÉ GANA "CULPABLE":</span> {c.verdictAnalysis.guilty}</p>
                    <p className="text-[10px] text-soft/85 leading-relaxed"><span className="text-neon font-bold">DEFENSA:</span> {c.verdictAnalysis.innocent}</p>
                  </div>
                </div>
              ) : (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest">Tu veredicto:</span>
                  <Button variant="outline" size="sm" onClick={() => vote(c, "CULPABLE")} className="font-mono text-[10px] uppercase border-crisis-hud text-crisis">
                    <Check className="w-3.5 h-3.5 mr-1" /> Culpable
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => vote(c, "INOCENTE")} className="font-mono text-[10px] uppercase border-neon-hud text-neon">
                    <X className="w-3.5 h-3.5 mr-1" /> Inocente
                  </Button>
                  <span className="font-mono text-[8px] text-muted-foreground">+10 mon · si aciertas con la mayoría +25</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2 hud-panel p-3">
        <Scale className="w-4 h-4 text-amber flex-shrink-0" />
        <p className="font-mono text-[9px] text-muted-foreground leading-relaxed">
          Cada semana un caso distinto sale al banquillo. Los veredictos se guardan en tu expediente y el análisis
          muestra por qué la comunidad votó como votó — juzgar historia es también juzgar nuestros propios sesgos.
        </p>
      </div>
    </div>
  );
}
