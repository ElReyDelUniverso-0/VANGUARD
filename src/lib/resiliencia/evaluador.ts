// ═══════════════════════════════════════════════════════════════════
// v420.1 · MISIÓN 09 · LA HERRAMIENTA — «COMMUNITY RESILIENCE»
//
// Evaluador EDUCATIVO de preparación comunitaria sobre seis categorías.
// Lógica pura: sin React, sin red, sin base de datos, determinista y por
// tanto comprobable (scripts/pruebas-resiliencia.mjs).
//
// TRES COSAS QUE ESTE MOTOR NO HACE, Y NO PUEDE HACER:
//  ① No certifica. El resultado es orientativo: ni sello, ni rango
//     oficial, ni «tu barrio es seguro».
//  ② No emite alertas ni declara emergencias.
//  ③ No guarda nada fuera de este navegador: las respuestas viven en
//     localStorage del dispositivo y se pueden borrar con un botón.
//
// Escala de cada ítem: 0 aún no · 1 en pañales · 2 en marcha · 3 sólido.
// Puntuación de categoría: proporción sobre el máximo, en 0-100, y la
// puntuación global es la MEDIA DE CATEGORÍAS (no la suma): así un barrio
// fuerte en cinco cosas y roto en una no sale «aprobado».
// ═══════════════════════════════════════════════════════════════════

export type CategoriaId =
  | "informacion"
  | "servicios"
  | "educacion"
  | "inclusion"
  | "continuidad"
  | "recuperacion";

export interface Categoria {
  id: CategoriaId;
  nombre: string;
  /** qué mira esta categoría */
  mira: string;
  /** por qué está en el evaluador */
  porque: string;
  icono: string;
}

export interface Item {
  id: string;
  categoria: CategoriaId;
  pregunta: string;
  /** qué se está valorando realmente (para no confundir la pregunta) */
  ayuda: string;
  /** a qué sección del centro lleva la mejora */
  ruta: string;
  etiquetaRuta: string;
}

export type Respuesta = 0 | 1 | 2 | 3;

export const ESCALA: { valor: Respuesta; etiqueta: string; texto: string }[] = [
  { valor: 0, etiqueta: "Aún no", texto: "No existe, o no se ha hecho nunca." },
  { valor: 1, etiqueta: "En pañales", texto: "Se habló de ello, existe en papel o a medias." },
  { valor: 2, etiqueta: "En marcha", texto: "Funciona, con huecos conocidos y sin ensayar del todo." },
  { valor: 3, etiqueta: "Sólido", texto: "Funciona, está ensayado, se revisa y todo el mundo sabe qué hacer." },
];

export const CATEGORIAS: Categoria[] = [
  {
    id: "informacion",
    nombre: "Información y comunicación",
    mira: "Si el aviso llega, si se entiende y si la comunidad sabe con qué canal hablar.",
    porque: "La alerta que no llega a tiempo o no se cree no salva vidas; es el primer eslabón de toda la cadena.",
    icono: "radio",
  },
  {
    id: "servicios",
    nombre: "Acceso a servicios",
    mira: "Agua, energía, salud, saneamiento, transporte y comunicaciones en las primeras 72 horas.",
    porque: "Sin agua potable, sin luz para la medicación y sin atención sanitaria, la emergencia se convierte en crisis prolongada.",
    icono: "droplets",
  },
  {
    id: "educacion",
    nombre: "Educación preventiva",
    mira: "Qué sabe y qué practica la gente: escuelas, simulacros, planes y formación.",
    porque: "La preparación es memoria muscular: lo que la comunidad ensaya es lo que hace el día que suena la alarma.",
    icono: "graduation-cap",
  },
  {
    id: "inclusion",
    nombre: "Inclusión de personas vulnerables",
    mira: "Cómo se identifica, se acompaña y se evacúa a quien lo tiene más difícil.",
    porque: "El desastre no es democrático: mata donde ya había fragilidad. Una comunidad que deja a alguien dentro no está preparada.",
    icono: "users",
  },
  {
    id: "continuidad",
    nombre: "Continuidad de servicios esenciales",
    mira: "Qué hace falta para que la vida no se pare: suministros, atención, negocio local, datos.",
    porque: "La recuperación empieza la primera noche; si la escuela, el ambulatorio y el panadero no abren, la comunidad se va.",
    icono: "refresh-cw",
  },
  {
    id: "recuperacion",
    nombre: "Recuperación comunitaria",
    mira: "Volver, reparar, apoyar, documentar y aprender para no repetir el daño.",
    porque: "Es la fase que decide cuántos años tarda la comunidad en volver a ser ella misma y si el riesgo queda igual o menor.",
    icono: "sprout",
  },
];

export const ITEMS: Item[] = [
  // ── INFORMACIÓN Y COMUNICACIÓN ─────────────────────────────────
  { id: "i1", categoria: "informacion", pregunta: "¿La comunidad sabe qué autoridad emite las alertas y por qué canal llegan?", ayuda: "No es tener redes sociales: es que cualquiera sepa a quién creer y dónde mirar cuando empiece a pasar.", ruta: "/resiliencia/proteccion-civil", etiquetaRuta: "Cómo se leen los avisos" },
  { id: "i2", categoria: "informacion", pregunta: "¿Hay un sistema de aviso vecinal que funcione sin luz, sin internet y sin batería en el móvil?", ayuda: "Puerta a puerta, silbato, radio, cartel en el portal: la última milla es humana.", ruta: "/resiliencia/comunicacion", etiquetaRuta: "Canales que no fallan" },
  { id: "i3", categoria: "informacion", pregunta: "¿El aviso llega en los idiomas que se hablan en el barrio y en formatos accesibles (texto grande, lengua de señas, audio)?", ayuda: "Un aviso que solo entiende una parte de la población es un aviso fallido.", ruta: "/resiliencia/accesibilidad", etiquetaRuta: "Comunicación accesible" },
  { id: "i4", categoria: "informacion", pregunta: "¿La comunidad tiene reglas escritas contra los bulos y un canal único de información contrastada?", ayuda: "En el grupo de mensajería se decide en dos minutos si la ayuda llega ordenada o en caos.", ruta: "/resiliencia/comunicacion", etiquetaRuta: "Reglas del canal" },
  // ── ACCESO A SERVICIOS ─────────────────────────────────────────
  { id: "s1", categoria: "servicios", pregunta: "¿Hay reserva de agua potable para 72 horas por persona en los hogares y en el punto comunitario?", ayuda: "Cuatro litros por persona y día es la referencia; en calor y con enfermos, más.", ruta: "/resiliencia/listas", etiquetaRuta: "Mochila y reservas" },
  { id: "s2", categoria: "servicios", pregunta: "¿Se sabe qué hogares dependen de electricidad para un aparato vital y están registrados en la compañía?", ayuda: "Respirador, oxígeno, bomba de insulina, nevera con medicación: se avisa antes, no durante.", ruta: "/resiliencia/servicios", etiquetaRuta: "Cortes de luz y agua" },
  { id: "s3", categoria: "servicios", pregunta: "¿Existe un punto de atención sanitaria o de primeros auxilios accesible, con botiquín y alguien formado?", ayuda: "La ambulancia tarda; la gasa, el torniquete y la mano que sabe usarlos están a dos minutos.", ruta: "/resiliencia/listas", etiquetaRuta: "Lista de barrio" },
  { id: "s4", categoria: "servicios", pregunta: "¿Hay una ruta de salida y una alternativa, y se sabe cómo se mueve quien no tiene coche?", ayuda: "Sin transporte, sin carretera y sin ascensor, la evacuación es solo para algunos.", ruta: "/resiliencia/prevencion", etiquetaRuta: "Prevención en el barrio" },
  // ── EDUCACIÓN PREVENTIVA ───────────────────────────────────────
  { id: "e1", categoria: "educacion", pregunta: "¿Los centros escolares de la zona tienen plan de emergencia y hacen al menos dos simulacros al año?", ayuda: "Los niños llevan el plan a casa: es el canal de formación más barato que existe.", ruta: "/resiliencia/listas", etiquetaRuta: "Lista de escuela" },
  { id: "e2", categoria: "educacion", pregunta: "¿La comunidad conoce los peligros concretos de su territorio y su historial (dónde entró el agua, qué calle se cortó)?", ayuda: "El mapa del riesgo local vale más que un manual genérico.", ruta: "/resiliencia/peligros", etiquetaRuta: "Fichas de peligros" },
  { id: "e3", categoria: "educacion", pregunta: "¿Se ha ensayado alguna vez una evacuación nocturna o con una salida cortada?", ayuda: "El simulacro cómodo no revela el fallo; el incómodo sí.", ruta: "/resiliencia/prevencion", etiquetaRuta: "Simulacro medido" },
  { id: "e4", categoria: "educacion", pregunta: "¿La gente sabe cómo se cortan el gas, el agua y la luz de su propia casa y de los espacios comunes?", ayuda: "Es la acción más rentable del mundo y la que más se ignora.", ruta: "/resiliencia/familia", etiquetaRuta: "Plan familiar" },
  // ── INCLUSIÓN ──────────────────────────────────────────────────
  { id: "n1", categoria: "inclusion", pregunta: "¿Existe un registro (con consentimiento) de hogares que necesitan apoyo para evacuar?", ayuda: "Movilidad reducida, encamados, personas que viven solas, aparatos eléctricos.", ruta: "/resiliencia/accesibilidad", etiquetaRuta: "Registro y acompañamiento" },
  { id: "n2", categoria: "inclusion", pregunta: "¿Cada persona identificada tiene asignada una persona o turno concreto que la avisa y la acompaña?", ayuda: "Sin nombre y sin turno, «ya lo cuidamos entre todos» no cuida a nadie.", ruta: "/resiliencia/accesibilidad", etiquetaRuta: "Sistema de compañeros" },
  { id: "n3", categoria: "inclusion", pregunta: "¿El albergue o punto de apoyo admite animales de asistencia, tiene toma de corriente, nevera para medicación y un rincón de calma?", ayuda: "Cuatro detalles que deciden si la gente acepta evacuar o se queda en casa.", ruta: "/resiliencia/accesibilidad", etiquetaRuta: "Refugio inclusivo" },
  { id: "n4", categoria: "inclusion", pregunta: "¿Se cuenta con las personas con discapacidad y mayores en el diseño del plan, y no solo para recibirlo?", ayuda: "«Nada sobre nosotros sin nosotros»: es la regla que separa el plan útil del folleto.", ruta: "/resiliencia/guias", etiquetaRuta: "Guías por emergencia" },
  // ── CONTINUIDAD ────────────────────────────────────────────────
  { id: "c1", categoria: "continuidad", pregunta: "¿Cada hogar tiene plan familiar escrito (dos puntos de encuentro, contacto fuera de la zona, quién recoge a los niños)?", ayuda: "El plan que no está escrito no existe el día que hace falta.", ruta: "/resiliencia/familia", etiquetaRuta: "Continuidad familiar" },
  { id: "c2", categoria: "continuidad", pregunta: "¿Los comercios y servicios locales tienen copia de seguridad, seguro y un plan de arranque a 48 horas?", ayuda: "Si el tejido económico no se levanta, la comunidad se disuelve.", ruta: "/resiliencia/prevencion", etiquetaRuta: "Continuidad en el trabajo" },
  { id: "c3", categoria: "continuidad", pregunta: "¿Los documentos críticos de la comunidad (padrón de apoyos, planos, llaves, actas) están duplicados fuera del edificio?", ayuda: "El incendio y la inundación se llevan el archivador: la copia es barata.", ruta: "/resiliencia/listas", etiquetaRuta: "Documentos" },
  { id: "c4", categoria: "continuidad", pregunta: "¿Hay reservas compartidas de lo aburrido y decisivo: agua, combustible, herramientas, generador, cocina, lona?", ayuda: "Una comunidad con recursos comunes pasa la primera semana sin depender de nadie.", ruta: "/resiliencia/listas", etiquetaRuta: "Lista de barrio" },
  // ── RECUPERACIÓN ───────────────────────────────────────────────
  { id: "r1", categoria: "recuperacion", pregunta: "¿Se sabe cómo documentar y denunciar los daños para que el seguro y las ayudas no se pierdan?", ayuda: "Plazos, fotos fechadas e informes: la parte del desastre que se gana con papel.", ruta: "/resiliencia/recuperacion", etiquetaRuta: "Registro de daños" },
  { id: "r2", categoria: "recuperacion", pregunta: "¿Hay alguien formado en primeros auxilios psicológicos y un cauce para derivar a quien lo necesite?", ayuda: "Mirar, escuchar, ayudar: la mitad del daño de después se atiende sin ser especialista.", ruta: "/resiliencia/biblioteca", etiquetaRuta: "Primeros auxilios psicológicos" },
  { id: "r3", categoria: "recuperacion", pregunta: "¿Existe un mecanismo de coordinación vecinal con tareas, turnos y un responsable por semana?", ayuda: "La solidaridad sin organización se agota en tres semanas.", ruta: "/resiliencia/comunicacion", etiquetaRuta: "Ayuda mutua" },
  { id: "r4", categoria: "recuperacion", pregunta: "¿Se prevé que lo reparado quede MEJOR que antes (drenaje, cota, materiales, no volver a construir en el mismo risco)?", ayuda: "Reconstruir igual es programar el siguiente desastre: es la cuarta prioridad de Sendai.", ruta: "/resiliencia/recuperacion", etiquetaRuta: "Reconstruir mejor" },
];

export const RESPUESTA_MINIMA = 12;

export interface PuntuacionCategoria {
  id: CategoriaId;
  nombre: string;
  respondidos: number;
  total: number;
  /** 0-100; null si no hay ninguna respuesta en la categoría */
  puntos: number | null;
  nivel: number; // índice de banda
  etiquetas: string[]; // nombres de banda por si se quiere pintar
  mejoras: { pregunta: string; ruta: string; etiquetaRuta: string }[];
}

export interface ResultadoEvaluacion {
  valido: boolean;
  motivo: string | null;
  respondidos: number;
  totalItems: number;
  /** media de las categorías respondidas; null si no se puede calcular */
  puntos: number | null;
  banda: { nombre: string; texto: string; color: string } | null;
  /** índice de banda — el idioma traduce por índice, nunca buscando el nombre */
  nivel: number;
  categorias: PuntuacionCategoria[];
  /** las tres categorías con peor nota: por dónde empezar */
  prioridades: PuntuacionCategoria[];
  aviso: string;
}

export const BANDAS = [
  { min: 0, nombre: "Punto de partida", texto: "Hay más cosas por hacer que hechas. Es normal, y es el mejor momento para empezar: una sola tarde de plan familiar sube más la nota que cualquier compra.", color: "#f87171" },
  { min: 35, nombre: "En construcción", texto: "Existe una base, pero depende de la buena voluntad de cuatro personas. Convierte lo informal en escrito y ensayado.", color: "#fbbf24" },
  { min: 60, nombre: "Preparado con huecos", texto: "La comunidad responde bien en lo que ya practicó y falla en lo que nadie escribió. Ataca los huecos uno por uno.", color: "#a3e635" },
  { min: 80, nombre: "Comunidad preparada", texto: "Buena preparación, con la advertencia de siempre: esto es orientativo y el riesgo cambia con cada obra, cada lluvia y cada generación.", color: "#34d399" },
];

export const AVISO_RESULTADO =
  "Resultado orientativo. Esta autoevaluación educativa no es una certificación, no sustituye al plan oficial de protección civil de tu país ni a la valoración de un técnico, y no emite ninguna alerta sobre una situación en curso.";

function banda(indice: number) {
  return BANDAS[Math.max(0, Math.min(BANDAS.length - 1, indice))];
}

function nivelDe(puntos: number | null): number {
  if (puntos === null) return 0;
  let n = 0;
  for (let i = 0; i < BANDAS.length; i++) if (puntos >= BANDAS[i].min) n = i;
  return n;
}

/**
 * Evalúa las respuestas. `respuestas` = { idDelItem: 0|1|2|3 }.
 * Es pura: la misma entrada da siempre la misma salida, y se puede probar.
 */
export function evaluarComunidad(respuestas: Record<string, number>): ResultadoEvaluacion {
  const categorias: PuntuacionCategoria[] = CATEGORIAS.map((c) => {
    const items = ITEMS.filter((i) => i.categoria === c.id);
    let suma = 0;
    let respondidos = 0;
    const mejoras: PuntuacionCategoria["mejoras"] = [];
    for (const it of items) {
      const v = respuestas[it.id];
      if (typeof v !== "number") continue;
      respondidos += 1;
      const val = Math.max(0, Math.min(3, Math.round(v))) as Respuesta;
      suma += val;
      if (val < 3) mejoras.push({ pregunta: it.pregunta, ruta: it.ruta, etiquetaRuta: it.etiquetaRuta });
    }
    const max = items.length * 3;
    const puntos = respondidos === 0 ? null : Math.round((suma / max) * 100);
    return {
      id: c.id,
      nombre: c.nombre,
      respondidos,
      total: items.length,
      puntos,
      nivel: nivelDe(puntos),
      etiquetas: BANDAS.map((b) => b.nombre),
      mejoras: mejoras.slice(0, 3),
    };
  });

  const respondidos = categorias.reduce((t, c) => t + c.respondidos, 0);
  const conNota = categorias.filter((c) => c.puntos !== null);

  if (respondidos < RESPUESTA_MINIMA) {
    return {
      valido: false,
      motivo: `Faltan respuestas: hay ${respondidos} de ${ITEMS.length} ítems y el resultado orientativo exige al menos ${RESPUESTA_MINIMA}. Responde por lo menos una pregunta de cada categoría.`,
      respondidos,
      totalItems: ITEMS.length,
      puntos: null,
      banda: null,
      nivel: 0,
      categorias,
      prioridades: [],
      aviso: AVISO_RESULTADO,
    };
  }

  const puntos = Math.round(conNota.reduce((t, c) => t + (c.puntos ?? 0), 0) / conNota.length);
  const orden = [...categorias].sort((a, b) => (a.puntos ?? 0) - (b.puntos ?? 0));

  return {
    valido: true,
    motivo: null,
    respondidos,
    totalItems: ITEMS.length,
    puntos,
    banda: banda(nivelDe(puntos)),
    nivel: nivelDe(puntos),
    categorias,
    prioridades: orden.slice(0, 3),
    aviso: AVISO_RESULTADO,
  };
}

/** Lo que la herramienta no puede prometer, escrito una sola vez. */
export const LIMITES = [
  "Es una fotografía de lo que TÚ percibes de tu comunidad, no una auditoría.",
  "No compara tu barrio con el de al lado: las preguntas se responden con contextos distintos.",
  "No genera un documento oficial ni se envía a ninguna autoridad.",
  "No dice si hay un riesgo activo ahora: para eso está tu protección civil y los datos vivos de la casa.",
];
