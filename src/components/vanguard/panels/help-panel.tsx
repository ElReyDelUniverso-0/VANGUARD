"use client";

import { useState } from "react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { HelpCircle, BookOpen, Gamepad2, Trophy, Coins, Target, Newspaper, Map, Brain, Layers, Zap, Users, Bell, Flame, ChevronRight, ChevronDown, Lightbulb, Rocket, Award, Video, Castle, TrendingUp, Bomb, MessageCircle, Crosshair, Fingerprint, Satellite } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useT } from "@/lib/i18n";

interface GuideSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  tips: string[];
}

const SECTIONS: GuideSection[] = [
  {
    id: "getting-started",
    title: "Primeros pasos",
    icon: <Rocket className="w-4 h-4 text-amber" />,
    color: "amber",
    description: "Bienvenido a VANGUARD. Tu objetivo como operador es analizar conflictos globales, completar misiones y escalar rangos.",
    tips: [
      "Empieza por el Briefing diario para ver el resumen automatico de la situacion global",
      "Reclama tu bono de conexion diaria para mantener tu racha activa",
      "Completa misiones diarias para ganar monedas y XP rapidamente",
      "Usa el teclado: teclas 1-9 para navegar entre pestañas, flechas ←→ para moverte secuencialmente",
    ],
  },
  {
    id: "economy",
    title: "Economia y monedas",
    icon: <Coins className="w-4 h-4 text-amber" />,
    color: "amber",
    description: "El sistema economico se basa en monedas (comun) y gemas (premium). Ambas se ganan jugando.",
    tips: [
      "Monedas: se ganan con misiones, quizzes, mini-game, predicciones acertadas y recompensas semanales",
      "Gemas: mas raras, se ganan en logros especiales, retos diarios y recompensas semanales de fin de semana",
      "Gasta monedas en la tienda: avatares, briefings bloqueados, boosts 2x",
      "Gasta gemas en boosts 2x (XP o monedas por 24h) y cosméticos HUD (rojo/cian)",
      "Usa el boost 2x antes de una sesion larga para maximizar ganancias",
    ],
  },
  {
    id: "missions",
    title: "Misiones y retos",
    icon: <Target className="w-4 h-4 text-red-hud" />,
    color: "red",
    description: "Las misiones son objetivos que se completan automaticamente al usar las features de la app.",
    tips: [
      "Misiones diarias: 8 objetivos que se reinician cada dia (leer briefings, ver noticias, etc.)",
      "Misiones semanales: 4 objetivos mas grandes con mejores recompensas",
      "Misiones de historia: 3 capitulos que te guian por los conflictos principales",
      "Retos diarios: 8 mini-objetitos rotativos con tracking automatico",
      "Reclama las recompensas manualmente cuando completes una mision",
    ],
  },
  {
    id: "conflicts",
    title: "Mapa de conflictos",
    icon: <Map className="w-4 h-4 text-amber" />,
    color: "amber",
    description: "El mapa muestra 25 frentes de guerra activos en tiempo real con niveles de alerta.",
    tips: [
      "Niveles: CRITICO (rojo), TENSION (ambar), INESTABILIDAD (violeta), VIGILANCIA (cian)",
      "Click en un marcador para ver facciones, bajas, impacto civil y situacion humanitaria",
      "Activa/desactiva capas: Frentes, Fotos OSINT, vista Satelital",
      "Visitar frentes cuenta para misiones de exploracion",
    ],
  },
  {
    id: "entertainment",
    title: "Entretenimiento",
    icon: <Gamepad2 className="w-4 h-4 text-red-hud" />,
    color: "red",
    description: "Mini-juego y quiz para entretenimiento mientras aprendes geopolitica.",
    tips: [
      "Quiz: 40 preguntas geopoliticas con explicaciones. Acertar da monedas + XP",
      "Mini-game Threat Assessment: 60s para clasificar amenazas (hostil +10, neutral +5, civil -15)",
      "Combos: racha de 5 = x2, racha de 10 = x3 en el mini-game",
      "Tu puntuacion del mini-game cuenta para torneos semanales",
    ],
  },
  {
    id: "cameras",
    title: "Red de camaras e ingresos",
    icon: <Video className="w-4 h-4 text-cyan-hud" />,
    color: "cyan",
    description: "Compra camaras de vigilancia, despliegalas donde quieras y cobra intel 24/7 viendo devastaciones en vivo.",
    tips: [
      "Arsenal: 5 modelos (GUARD-100, TERMICA 300, 4K TACTICA, PANORAMICA 360-X y ENLACE ORBITAL V-9)",
      "Despliegue: elige un modelo, pulsa DESPLEGAR y haz click en cualquier punto del mapa mundial",
      "Rentabilidad: cada camara genera monedas por minuto segun los frentes cercanos y su intensidad",
      "En vivo: pulsa VER EN VIVO para vigilar la camara; cada 7s puede captarse una devastacion con recompensa",
      "Capacidad: el intel pendiente se acumula hasta el tope del modelo, recolecta con COBRAR TODO",
      "PASE ELITE: ingresos x2, gemas diarias y 15% de descuento en todas las camaras",
    ],
  },
  {
    id: "social",
    title: "Social y torneos",
    icon: <Users className="w-4 h-4 text-cyan-hud" />,
    color: "cyan",
    description: "Compite con otros operadores y mantente al dia con notificaciones.",
    tips: [
      "Torneos: 3 torneos semanales (Quiz, Mini-game, XP) con leaderboard en tiempo real",
      "Amigos: 6 aliados mock con stats comparables. Modo comparar para ver tu progreso vs el mejor",
      "Notificaciones: alertas automaticas de logros desbloqueados, eventos y sistema",
      "Logros: 20 hitos a largo plazo con recompensas permanentes (rarity comun a legendario)",
    ],
  },
  {
    id: "progression",
    title: "Progresion y rangos",
    icon: <Trophy className="w-4 h-4 text-amber" />,
    color: "amber",
    description: "Sube de nivel ganando XP para desbloquear rangos militares.",
    tips: [
      "Rangos: RECLUTA → CABO → SARGENTO → TENIENTE → CAPITAN → MAYOR → CORONEL → GENERAL → MARISCAL",
      "Cada nivel da 50 monedas bonus automaticamente",
      "Racha diaria: bonus creciente (dia 1: +40, dia 7: +100, etc.)",
      "Calendario de racha: visualiza 30 dias de actividad con recompensas",
      "Estadisticas: grafico de evolucion de XP y monedas en los ultimos 7 dias",
    ],
  },
  {
    id: "war-world",
    title: "Mundo de Guerra (mini-juego)",
    icon: <Castle className="w-4 h-4 text-red-hud" />,
    color: "red",
    description: "Conquista estilo tablero sobre el mapa mundial real: 24 territorios, 3 IA enemigas y combate por rondas.",
    tips: [
      "Elige tu nacion de origen: tu capital empieza con 12 tropas y las 3 IA se reparten el resto del planeta",
      "Cada ronda recibes refuerzos: 1 tropa por cada 2 territorios + bonus si controlas un continente completo",
      "Fase refuerzos: haz click en tus territorios para desplegar (o usa DESPLEGAR TODO)",
      "Fase ataque: selecciona un territorio tuyo con 2+ tropas y luego un vecino enemigo; la defensa tiene ligera ventaja",
      "Cada captura: +5 monedas y +3 XP. Conquistar los 24 territorios: +500 monedas, +250 XP y +3 gemas",
      "La partida se guarda sola: puedes cerrar y volver cuando quieras",
    ],
  },
  {
    id: "market",
    title: "Bolsa geopolitica",
    icon: <TrendingUp className="w-4 h-4 text-green-hud" />,
    color: "green",
    description: "Exchange de paises estilo cripto, igualito: velas OHLC por temporalidad, libro de ordenes, operaciones en vivo, ordenes limite, inversion rapida y cesta multi-pais.",
    tips: [
      "34 paises-cripto (USDX, CNYN, ARGB, IRNR...) con volatilidad y tendencia propias",
      "MODO RAPIDO: elige monto (50/100/500/2K/5K o slider) y COMPRAR AHORA — 1 toque; VENDER TODO cierra la posicion",
      "CESTA MULTI-PAIS: toca el + de varios paises (o presets Top potencias/Emergentes/Frontera) e invierte un monto repartido en 1 click, con comparador de lineas",
      "Los precios se actualizan cada 1 segundo; velas de 1m a 1D con volumen, o modo linea",
      "Libro de ordenes con profundidad y feed de operaciones en vivo tick a tick",
      "Ordenes LIMITE en modo AVANZADO: se arman y se ejecutan solas cuando el precio cruza tu precio",
      "Comision taker 0.5% por operacion; marcar estrella guarda el pais en FAVORITAS",
      "Eventos cada ~40-70s (sanciones, OPEP, cobre) que sacuden varios paises a la vez",
    ],
  },
  {
    id: "drone-strike",
    title: "Dron Strike 3D (v10)",
    icon: <Crosshair className="w-4 h-4 text-red-hud" />,
    color: "red",
    description: "Minijuego 3D de ataque con dron: campana de 4 dificultades con medallas, sonido de combate y ranking global registrado en la base de datos.",
    tips: [
      "WASD/flechas o arrastra el dedo para moverte; ESPACIO o boton DISPARAR lanza misiles (con sonido)",
      "Campana: RECLUTA 75s, VETERANO 60s, ELITE 50s y LEYENDA 45s — cuanto mas duro, mas convoys y menos tiempo",
      "Botin multiplicado: x1.00 RECLUTA, x1.15 VETERANO, x1.35 ELITE (+1 gema), x1.65 LEYENDA (+2 gemas)",
      "Medallas de campana: 500 pts en RECLUTA, 1200 en VETERANO, 2200 en ELITE, 3200 en LEYENDA — se guardan en tu dispositivo",
      "Cada mision se sube al RANKING GLOBAL (top 20): puntaje, aciertos y dificultad; compite por el puesto #1",
      "Sonido de combate: lanzamiento, estallido y confirmacion que sube de tono con el combo (se puede silenciar en Ajustes)",
    ],
  },
  {
    id: "detective-v11",
    title: "Archivos Nación: Detective multijugador (v11)",
    icon: <Fingerprint className="w-4 h-4 text-violet-hud" />,
    color: "violet",
    description: "Deducción social en vivo por salas (una por país): eres detective en casos de guerras y tratados, con pistas, interrogatorios y un instigador infiltrado que lo miente todo.",
    tips: [
      "6 casos historicos: ¿quién armó la II Guerra Mundial?, el disparo de Sarajevo, el silencio de Pearl Harbor, el pacto secreto, la trampa de Versalles y el combustible del Pacífico",
      "Pagas una fianza al entrar (100-220 mon) con 5 acciones: registrar ubicaciones y interrogar sospechosos llena el tablero compartido",
      "ENGAÑO: un instigador infiltrado conoce al culpable, planta una pista falsa anónima y desvía los votos — desconfía de pistas de fiabilidad BAJA",
      "Deliberación y JUICIO: la sala vota acusar a un sospechoso; los bots también investigan y votan según las pruebas encontradas",
      "Aciertas con la mayoría: x2.5 fianza + 2 gemas. Votas bien cuando la mayoría falla: x2 + 1 gema. Fallas: pierdes la fianza",
      "Si te toca ser INSTIGADOR: planta tu pista falsa, desvía sospechas y vota por un inocente — si escapan, x3 fianza + 5 gemas",
      "Cada caso termina con el recap de LO REAL: la historia verdadera detrás del caso (guerras y tratados de verdad)",
    ],
  },
  {
    id: "threat-maps",
    title: "Mapas de amenaza",
    icon: <Bomb className="w-4 h-4 text-red-hud" />,
    color: "red",
    description: "El mapa global ahora tiene modos dedicados: Global, Terrorismo, Carteles y Bandas, con redes y rutas animadas.",
    tips: [
      "TERRORISMO: guerra global yihadista con rutas de afiliacion (Jorasan, Sahel-Cuerno, celulas en Europa)",
      "CARTELES: narcotrafico con ruta de fentanilo, corredor de cocaina y puente Africa-Europa",
      "BANDAS: pandillas y crimen urbano con red G9-CV y trafico de armas",
      "Cada modo filtra el mapa, recolorea marcadores y muestra stats de amenaza del modo",
      "Click en cualquier zona para ver facciones, bajas y situacion humanitaria",
    ],
  },
  {
    id: "social-v7",
    title: "Salas sociales y contenido propio (v7)",
    icon: <MessageCircle className="w-4 h-4 text-violet-hud" />,
    color: "violet",
    description: "Chat en vivo por salas tematicas y publicacion de contenido REAL: tus videos, tus fotos y tus encuestas, con recompensas en gemas.",
    tips: [
      "SALAS SOCIALES (sección SOCIAL): chat en tiempo real en 8 salas; se ve quien esta en linea y la comunidad conversa sin parar",
      "PUBLICAR VIDEO (GlobalVision): sube un MP4 real (max 90 MB), miniatura automatica y +50 GEMAS por emision",
      "Tus videos aparecen primero en el feed con badge TU VIDEO, con vistas y likes que crecen en vivo; filtra con MI CANAL",
      "CREAR ENCUESTA (Encuestas): tu pregunta con 2-4 opciones; la comunidad vota en directo (+10 monedas, +1 gema)",
      "PUBLICAR FOTO (Galeria OSINT): sube tu foto con titulo (+15 monedas, +5 XP) y encuentra el filtro Mis fotos",
      "MULTIJUGADOR (Comando): partida global en vivo contra otros operadores y 2 IA; capturar territorio paga +2 gemas y dominar el mundo +25 gemas",
    ],
  },
  {
    id: "ganancias-v8",
    title: "Centro de Ganancias (v8)",
    icon: <Zap className="w-4 h-4 text-amber" />,
    color: "amber",
    description: "La sala de maquinas que hace volver cada dia: ruleta diaria, cajones de suministros, airdrop horario y el Pase Vanguard de temporada.",
    tips: [
      "RULETA DIARIA (Comando > GANANCIAS): 1 giro gratis al dia con premios de 30 a 250 monedas, gemas y XP; giros extra a 5 gemas",
      "CAJONES DE SUMINISTROS: abre cajones COMUN (250 mon), ELITE (900 mon) y LEGENDARIA (60 gemas) con botin aleatorio y chance de BOOST x2",
      "Los cajones GRATIS se ganan: dominio mundial en Mundo de Guerra da +1 LEGENDARIA, y los niveles del Pase otorgan cajones",
      "AIRDROP HORARIO: cada hora hay 30 monedas + 2 gemas esperandote en el Centro de Ganancias",
      "PASE VANGUARD: 12 niveles mensuales con recompensas GRATIS y ELITE; ganas PX capturando territorios, girando la ruleta, abriendo cajones, apostando y haciendo staking",
      "Cada mes arranca una temporada nueva y el PX de pase se reinicia — no dejes recompensas sin reclamar",
    ],
  },
  {
    id: "staking-v8",
    title: "Staking y alertas del mercado (v8)",
    icon: <TrendingUp className="w-4 h-4 text-green-hud" />,
    color: "green",
    description: "Tu bolsa de paises ahora paga renta pasiva y te avisa cuando el precio se mueve.",
    tips: [
      "STAKING SOBERANO (Bolsa, abajo): apuesta monedas en un pais-cripto y gana APY diario del 6% al 24% segun el pais",
      "Los intereses se acumulan en VIVO cada segundo: reclámalos cuando quieras sin perder el principal",
      "RETIRAR TODO te devuelve principal + intereses acumulados y cierra la posicion",
      "ALERTAS DE PRECIO: crea hasta 8 alertas (sube sobre / baja bajo) y la app te avisa con toast al cruzarse el precio",
      "Cada pais tiene su propio APY determinista — compara antes de apostar",
    ],
  },
  {
    id: "parley-v8",
    title: "Parley militar y ranking (v8)",
    icon: <Target className="w-4 h-4 text-red-hud" />,
    color: "red",
    description: "Apuestas de guerra nivel 2: combinar selecciones para multiplicar cuotas, y un ranking global que nunca duerme.",
    tips: [
      "PARLEY MILITAR (Apuestas de guerra): marca 2-4 guerras con '+ al parley', elige el bando de cada una y apuesta una sola vez",
      "Cuota combinada = producto de cuotas x 0.95 (margen de la casa); TODOS los picks deben ganar para cobrar",
      "Un parley de 4 cuotas puede multiplicar tu apuesta por 10 o mas — y también puede dejarte en cero",
      "APUESTA GRATIS DIARIA: 50 monedas de bono cada dia en el panel de apuestas",
      "Tu registro de apostador muestra apuestas, ganadas, % de acierto y neto acumulado",
      "RANKING GLOBAL (Progreso): 3 tablas (Operadores XP, Conquistadores, Traders P/L) con 15 rivales que se mueven cada dia",
    ],
  },
  {
    id: "shortcuts",
    title: "Atajos y tips",
    icon: <Lightbulb className="w-4 h-4 text-amber" />,
    color: "amber",
    description: "Atajos de teclado y tips para usar la app mas eficiente.",
    tips: [
      "Teclas 1-9: navega a las primeras 9 pestañas (0 = decima)",
      "Flechas ←→: navegacion secuencial entre pestañas",
      "Hover en el ticker LIVE: pausa el scroll para leer mejor",
      "Busqueda en Briefings y Galeria: filtra por titulo, contenido o pais",
      "Exporta tu progreso desde Ajustes → Copia de seguridad (backup JSON)",
      "Click en el icono de sonido en el header para silenciar/activar efectos",
    ],
  },
  {
    id: "pulso",
    title: "Pulso Mundial (intel real)",
    icon: <Satellite className="w-4 h-4 text-cyan" />,
    color: "cyan",
    description: "Datos REALES en vivo sin registro: satélite ISS, aviones sobre zonas de conflicto y señales espaciales.",
    tips: [
      "ESCANEA +5 monedas cada 60s: actualiza satélite, radar aéreo y señales a la vez",
      "La ISS se mueve ~27500 km/h: mira su posición en el mini mapa mundial",
      "Los aviones con sello MILITAR (RCH, FORTE, NATO...) se destacan en rojo",
      "Radar aéreo en 3 zonas calientes: Ucrania/Mar Negro, Oriente Medio y Mar de China",
      "Las señales espaciales enlazan a fuentes reales (abiertas en pestaña nueva)",
    ],
  },
];

export function HelpPanel() {
  const [expandedId, setExpandedId] = useState<string | null>("getting-started");
  const { t } = useT();

  return (
    <div className="space-y-3">
      <PanelHeader
        title="Centro de ayuda"
        subtitle="Guia completa de features y tips"
        icon={<HelpCircle className="w-4 h-4 text-amber" />}
        color="amber"
        right={
          <div className="text-[10px] font-mono text-muted-foreground">
            {SECTIONS.length} secciones
          </div>
        }
      />

      {/* Quick start banner */}
      <div className="hud-corner p-4 bg-gradient-to-r from-amber-hud/20 to-transparent border-amber-hud">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 hud-corner flex items-center justify-center bg-amber-hud glow-amber flex-shrink-0">
            <Rocket className="w-5 h-5 text-amber" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-mono font-bold text-amber mb-1">Inicio rapido</div>
            <p className="text-xs text-muted-foreground">
              Eres nuevo aqui? Sigue estos 3 pasos: 1) Reclama tu bono diario en el modal de reconexion. 2) Visita el Briefing diario para ver el resumen global. 3) Completa misiones diarias para ganar tus primeras monedas.
            </p>
            {/* v33: relanzar el manual del comandante en cualquier momento */}
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("vanguard:open-tutorial"))}
              className="mt-2.5 flex items-center gap-1.5 px-3 py-1.5 border border-amber-hud bg-amber-hud/20 text-amber text-[10px] font-mono font-bold uppercase tracking-widest hover:bg-amber-hud/40 active:scale-95 transition-all"
            >
              <Rocket className="w-3 h-3" /> {t("tutorial.replay")}
            </button>
          </div>
        </div>
      </div>

      {/* Sections accordion */}
      <div className="space-y-2">
        {SECTIONS.map((section) => {
          const isExpanded = expandedId === section.id;
          return (
            <motion.div
              key={section.id}
              layout
              className="hud-corner overflow-hidden"
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : section.id)}
                className="w-full p-3 flex items-center gap-3 hover:bg-secondary/40 transition-colors text-left"
              >
                <div className="w-8 h-8 hud-corner flex items-center justify-center bg-secondary flex-shrink-0">
                  {section.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-mono font-bold text-foreground">{section.title}</div>
                  <div className="text-[10px] text-muted-foreground line-clamp-1">{section.description}</div>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-amber flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                )}
              </button>
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-3 pt-0 space-y-2">
                      <div className="text-xs text-muted-foreground mb-2 pl-11">{section.description}</div>
                      <ul className="space-y-1.5 pl-11">
                        {section.tips.map((tip, i) => (
                          <li key={i} className="text-xs text-foreground flex items-start gap-2">
                            <span className="text-amber font-mono font-bold flex-shrink-0 mt-0.5">
                              {i + 1}.
                            </span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Quick links */}
      <div className="hud-corner p-3 bg-secondary/30">
        <div className="text-[10px] font-mono text-muted-foreground uppercase mb-2 flex items-center gap-1">
          <BookOpen className="w-3 h-3 text-amber" /> Enlaces rapidos
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <QuickLink icon={<Target className="w-3 h-3" />} label="Misiones" tab="misiones" />
          <QuickLink icon={<Coins className="w-3 h-3" />} label="Tienda" tab="tienda" />
          <QuickLink icon={<Trophy className="w-3 h-3" />} label="Logros" tab="logros" />
          <QuickLink icon={<Gamepad2 className="w-3 h-3" />} label="Mini-game" tab="minijuego" />
        </div>
      </div>

      {/* Version info */}
      <div className="hud-corner p-3 bg-secondary/30 flex items-center justify-between text-[10px] font-mono">
        <div className="flex items-center gap-2">
          <Award className="w-3 h-3 text-amber" />
          <span className="text-muted-foreground">VANGUARD v7.0.0 · Documentacion completa</span>
        </div>
        <span className="text-amber">22 features · 33 conflictos · 4 mapas de amenaza · MUNDO DE GUERRA · mercado en vivo</span>
      </div>
    </div>
  );
}

function QuickLink({ icon, label, tab }: { icon: React.ReactNode; label: string; tab: string }) {
  return (
    <button
      onClick={() => {
        const btn = document.querySelector(`[data-tab="${tab}"]`) as HTMLElement;
        if (btn) btn.click();
      }}
      className="flex items-center gap-1.5 p-2 hud-corner bg-secondary/40 hover:bg-amber-hud/30 transition-colors text-[10px] font-mono uppercase text-muted-foreground hover:text-amber"
    >
      {icon}
      {label}
    </button>
  );
}
