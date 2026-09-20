"use client";

// v13 — BIBLIOTECA SECRETA: documentos desclasificados por nivel de acceso.
// PÚBLICO (libre) · RESTRINGIDO (1.000) · CONFIDENCIAL (5.000) · SECRETO
// (15.000) · ULTRA SECRETO (solo élite: nivel 8+). Desbloqueo permanente.

import { useState, useEffect } from "react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { BookLock, Lock, LockOpen, ShieldAlert, FileKey2, Crown } from "lucide-react";
import { useGameStore } from "@/lib/game-store";

type Level = "PUBLICO" | "RESTRINGIDO" | "CONFIDENCIAL" | "SECRETO" | "ULTRA";

interface Doc {
  id: string;
  title: string;
  level: Level;
  cost: number;
  year: string;
  image: string;
  excerpt: string;
  body: string[];
}

const DOCS: Doc[] = [
  {
    id: "doc-tape", title: "Cinta perdida: la noche en que casi estalla todo", level: "PUBLICO", cost: 0, year: "1962",
    image: "/assets/wiki/war-fria.jpg",
    excerpt: "Transcripción parcial de la reunión del comité ejecutivo durante la Crisis de los Misiles.",
    body: [
      "13 de octubre de 1962. En la sala queda constancia de que un capitán de submarino soviético creyó que la guerra había comenzado. Dos de los tres oficiales autorizaron el lanzamiento del torpedo nuclear; el tercero, Vasilí Arkhipov, se negó.",
      "El documento confirma que la flota estadounidense no sabía que los B-59 llevaban armas nucleares tácticas. Un solo voto evitó el intercambio nuclear. La historia del mundo dependió de un 'no'.",
      "Nota del archivista: la cinta completa permanece sellada. Este extracto se publicó en 2002 tras la conferencia de La Habana.",
    ],
  },
  {
    id: "doc-map", title: "Cartografía estratégica de puntos ciegos del radar", level: "PUBLICO", cost: 0, year: "2023",
    image: "/assets/osint/jet-patrol.png",
    excerpt: "Cómo los contrabandistas y los drones explotan valles y corredores con cobertura radar mínima.",
    body: [
      "El análisis OSINT identifica 14 corredores naturales donde la cobertura radar civil deja huecos de 40-120km, concentrados en zonas montañosas y sobre bahías con tráfico aéreo denso.",
      "Estos mismos corredores explican rutas históricas de contrabando, migración irregular y, desde 2022, los perfiles de vuelo de drones de larga distancia.",
      "Uso educativo: documento construido exclusivamente con datos abiertos de aviación civil y mapas públicos.",
    ],
  },
  {
    id: "doc-pipeline", title: "Las arterias invisibles: quién controla la energía", level: "PUBLICO", cost: 0, year: "2024",
    image: "/assets/real/missile-1.jpg",
    excerpt: "Mapa vivo de oleoductos y gasoductos que sostienen (o asfixian) economías enteras.",
    body: [
      "El 62% del gas natural transportado por mar pasa por tres estrechos: Ormuz, Malaca y Bab el-Mandeb. Un bloqueo simultáneo de dos de ellos es el escenario de pesadilla de los mercados.",
      "Los oleoductos terrestres alternativos solo cubren el 23% de la capacidad marítima. Por eso cada crisis regional dispara el precio de la energía en horas.",
    ],
  },
  {
    id: "doc-gold", title: "El oro que desapareció en 1945 (expediente Yamashita)", level: "RESTRINGIDO", cost: 1000, year: "1945-1990",
    image: "/assets/wiki/war-ww2.jpg",
    excerpt: "Rastreo documental de los tesoros confiscados por Japón y su destino tras la guerra.",
    body: [
      "Entre 1942 y 1945, el Imperio japonés trasladó reservas de oro confiscadas en el sudeste asiático a redes de cuevas en Filipinas. La operación dejó 175 sitios documentados; menos de 40 fueron localizados.",
      "El expediente recopila testimonios de ingenieros militares, mapas desclasificados del CIC de Manila y los tres juicios por la propiedad del mayor hallazgo (1988).",
      "Conclusión del archivista: al menos 60 sitios permanecen sin abrir. El valor estimado actual supera los 40.000M USD.",
    ],
  },
  {
    id: "doc-eco", title: "Manual de guerra económica: sanciones que sí funcionan", level: "RESTRINGIDO", cost: 1000, year: "2014-2024",
    image: "/assets/wiki/leader-putin.jpg",
    excerpt: "Diez años de datos sobre qué sanciones cambiaron conductas y cuáles solo cambiaron rutas.",
    body: [
      "Efectividad medida: las sanciones sectoriales reducen PIB objetivo 0.8-2.4% anual, pero desvían comercio hacia terceros países en 9-18 meses. Las sanciones a individuos casi nunca alteran políticas.",
      "Caso de estudio: el desvío de crudo ruso a flota sombra costó a Moscú 12-15% del valor de exportación, pero mantuvo el volumen. La 'efectividad' depende de qué se mida: ingresos o volumen.",
    ],
  },
  {
    id: "doc-u2", title: "Proyecto GENETRIX: globos espía sobre el bloqueo del Este", level: "CONFIDENCIAL", cost: 5000, year: "1955-1958",
    image: "/assets/real/radar-1.jpg",
    excerpt: "El programa que lanzó 516 globos cámara sobre la URSS — y su papel oculto en el programa U-2.",
    body: [
      "GENETRIX lanzó globos de reconocimiento a 15.000m desde Turquía y Alemania. La cobertura de prensa lo presentó como 'investigación meteorológica'. Solo 44 cámaras fueron recuperadas, pero produjeron 13.800 fotografías útiles.",
      "El verdadero objetivo era calibrar la respuesta soviética de interceptación: los datos de radar obtenidos definieron el perfil de vuelo del U-2 presentado 8 meses después.",
    ],
  },
  {
    id: "doc-wagner", title: "Anatomía de un levantamiento fallido: junio de 2023", level: "CONFIDENCIAL", cost: 5000, year: "2023",
    image: "/assets/real/tanks-1.jpg",
    excerpt: "Cronología minuto a minuto de la marcha sobre Moscú construida con tráfico, radios y satélites.",
    body: [
      "La columna avanzó 780km en 24 horas sin encontrar resistencia orgánica. Las imágenes satelitales muestran que las unidades regulares recibieron orden de NO interponerse hasta las 14:00 del día siguiente.",
      "Los interceptos de radio revelan que el punto de quiebre fue la pérdida del apoyo del 2º Cuerpo de Ejército. La 'amnistía' ya estaba negociada 6 horas antes del anuncio público en televisión.",
    ],
  },
  {
    id: "doc-enigma", title: "Ultra: la máquina que acortó la guerra 2 años", level: "SECRETO", cost: 15000, year: "1939-1945",
    image: "/assets/wiki/war-ww1.jpg",
    excerpt: "Cómo Bletchley Park descifró Enigma, y qué se inventó para ocultar que lo sabían todo.",
    body: [
      "El descifrado sistemático de Enigma naval a partir de mayo de 1941 dio a los Aliados lectura casi continua del tráfico de submarinos. Para proteger la fuente, el Alto Mando fabricó explicaciones: 'sobrevuelos fortuitos' y una red ficticia de espías llamada 'Boniface'.",
      "Los bombardeos a convoyes wolfpack solo se autorizaban cuando existía un avistamiento 'verosímil' que cubriera la fuente real. Se dejó hundir objetivos secundarios para no alertar: el precio de leer el correo del enemigo era permitir que algunas batallas se perdieran.",
    ],
  },
  {
    id: "doc-deep", title: "Dossier CROSSROADS: lo que hay bajo el permafrost", level: "SECRETO", cost: 15000, year: "1950-2024",
    image: "/assets/real/desert-1.jpg",
    excerpt: "Instalaciones enterradas de la Guerra Fría que el deshielo está exponiendo en 2020s.",
    body: [
      "El deshielo del permafrost ártico está exponiendo estructuras selladas desde los años 50: búnkeres de radar, depósitos de combustible radiactivo y al menos 3 sitios de pruebas biológicas sin levantamiento de acta.",
      "El dossier evalúa 11 sitios en Rusia, Canadá y Alaska. Cuatro presentan 'riesgo de contaminación activa'. Las misiones de inspección conjuntas están bloqueadas desde 2022 por el congelamiento de la cooperación ártica.",
    ],
  },
  {
    id: "doc-black", title: "BLACKSTAR: el programa que no existió", level: "ULTRA", cost: 0, year: "1963-1986",
    image: "/assets/osint/night-convoy.png",
    excerpt: "Satélite hipotético de inspección orbital — acceso solo para el 1% con mayor experiencia.",
    body: [
      "Los fragmentos de presupuesto desclasificados muestran partidas de 1963-1986 sin programa asociado: 4.200M USD en valores constantes. La hipótesis dominante apunta a un vehículo de inspección orbital tripulado, cancelado antes del primer vuelo.",
      "Tres hangares en el complejo de pruebas siguen sin aparecer en imágenes satelitales con resolución comercial. Dos de ellos aparecen en fotografías CORONA de 1968 con estructuras de 90m.",
      "Este nivel de archivo solo se abre a operadores con nivel 8 o superior. Si estás leyendo esto, ya lo sabes demasiado.",
    ],
  },
];

const LEVEL_META: Record<Level, { label: string; chip: string; ring: string }> = {
  PUBLICO: { label: "PÚBLICO", chip: "text-neon border-neon-hud bg-neon-hud", ring: "border-neon-hud" },
  RESTRINGIDO: { label: "RESTRINGIDO", chip: "text-amber border-amber-hud bg-amber-hud", ring: "border-amber-hud" },
  CONFIDENCIAL: { label: "CONFIDENCIAL", chip: "text-electric border-electric-hud bg-electric-hud", ring: "border-electric-hud" },
  SECRETO: { label: "SECRETO", chip: "text-crisis border-crisis-hud bg-crisis-hud", ring: "border-crisis-hud" },
  ULTRA: { label: "ULTRA SECRETO", chip: "text-violet-hud border-violet-hud bg-violet-hud", ring: "border-violet-hud" },
};

const LS_KEY = "vanguard-library-v13";

export function SecretLibraryPanel() {
  const { spendCoins, addXp, level } = useGameStore();
  const [unlocked, setUnlocked] = useState<string[]>([]);
  const [open, setOpen] = useState<Doc | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        setUnlocked(JSON.parse(localStorage.getItem(LS_KEY) ?? "[]") as string[]);
      } catch { /* noop */ }
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const unlock = (d: Doc) => {
    if (unlocked.includes(d.id)) { setOpen(d); return; }
    if (d.level === "ULTRA") {
      if (level < 8) { toast.error("ACCESO DENEGADO · ULTRA SECRETO requiere nivel 8+ (el 1% superior)"); return; }
    } else if (d.cost > 0) {
      if (!spendCoins(d.cost, `BIBLIOTECA: desclasificar ${d.title}`)) {
        toast.error(`Necesitas ${d.cost.toLocaleString()} mon para desclasificar este expediente`);
        return;
      }
    }
    const next = [...unlocked, d.id];
    setUnlocked(next);
    localStorage.setItem(LS_KEY, JSON.stringify(next));
    addXp(50);
    setOpen(d);
    toast.success(`EXPEDIENTE DESCLASIFICADO · +50 xp`, { description: d.title });
  };

  return (
    <div className="space-y-3">
      <PanelHeader
        title="Biblioteca Secreta"
        subtitle="Documentos desclasificados por nivel de acceso"
        icon={<BookLock className="w-4 h-4 text-amber" />}
        color="amber"
        right={
          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
            {unlocked.length}/{DOCS.length} desclasificados
          </span>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {DOCS.map((d) => {
          const meta = LEVEL_META[d.level];
          const isUnlocked = unlocked.includes(d.id);
          const ultraLocked = d.level === "ULTRA" && level < 8;
          return (
            <motion.div
              key={d.id}
              whileHover={{ y: -2 }}
              className={cn("hud-panel p-3 flex gap-3", isUnlocked ? meta.ring : "opacity-90")}
            >
              {/* miniatura */}
              <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden border border-border">
                <img src={d.image} alt={d.title} className="w-full h-full object-cover" loading="lazy" />
                {!isUnlocked && (
                  <div className="absolute inset-0 bg-black/75 flex items-center justify-center">
                    {ultraLocked ? <Crown className="w-5 h-5 text-violet-hud" /> : <Lock className="w-5 h-5 text-amber" />}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={cn("px-1 py-0.5 border font-mono text-[8px] font-bold tracking-widest", meta.chip)}>{meta.label}</span>
                  <span className="font-mono text-[8px] text-muted-foreground">{d.year}</span>
                </div>
                <div className="font-tech text-sm font-bold leading-tight mb-1">{d.title}</div>
                <p className={cn("text-[10px] text-muted-foreground leading-snug line-clamp-2", !isUnlocked && "blur-[2px] select-none")}>
                  {d.excerpt}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => unlock(d)}
                    className={cn(
                      "font-mono text-[9px] uppercase tracking-widest",
                      isUnlocked ? "border-neon-hud text-neon" : ultraLocked ? "border-violet-hud text-violet-hud" : "border-amber-hud text-amber"
                    )}
                  >
                    {isUnlocked ? (<><LockOpen className="w-3 h-3 mr-1" /> Leer</>)
                      : ultraLocked ? (<><Crown className="w-3 h-3 mr-1" /> Nivel 8+</>)
                      : d.cost > 0 ? (<><FileKey2 className="w-3 h-3 mr-1" /> Desclasificar · {d.cost.toLocaleString()}</>)
                      : (<><LockOpen className="w-3 h-3 mr-1" /> Abrir</>)}
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* LECTOR */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/70 flex items-center justify-center p-3"
            onClick={() => setOpen(null)}
          >
            <motion.div
              initial={{ scale: 0.96, y: 14 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.97, opacity: 0 }}
              className="hud-panel neon-border w-full max-w-2xl max-h-[85vh] overflow-y-auto thin-scroll"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-40">
                <img src={open.image} alt={open.title} className="w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                <div className="absolute bottom-2 left-4 right-4">
                  <span className={cn("px-1.5 py-0.5 border font-mono text-[8px] font-bold tracking-widest", LEVEL_META[open.level].chip)}>
                    {LEVEL_META[open.level].label}
                  </span>
                  <h3 className="font-display text-lg font-black tracking-wide mt-1">{open.title}</h3>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                  <ShieldAlert className="w-3 h-3" /> Expediente {open.id.toUpperCase()} · fecha {open.year} · copia de lectura única
                </div>
                {open.body.map((p, i) => (
                  <p key={i} className="text-xs leading-relaxed text-soft/90">{p}</p>
                ))}
                <div className="pt-2 border-t border-border font-mono text-[8px] text-muted-foreground uppercase tracking-widest">
                  Contenido con fines educativos y de entretenimiento · mezcla de hechos públicos con dramatización
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
