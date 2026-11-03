// ============================================================
// VANGUARD v170.0 — MECÁNICAS DE SALAS
// Motores compactos: conquista, duelo, casos, apuestas, arcade,
// idle-imperio, nación, verificación, tribunal, retos, misiones.
// Estado serializable → localStorage. Puro en entrada/salida.
// ============================================================

export interface ContextoMecanica {
  mon: number;
  likesDados: number;
  salasVisitadas: number;
  partidasJugadas: number;
  racha: number;
  precioCripto: number | null;
}

export interface ResultadoAccion {
  estado: Record<string, unknown>;
  deltaMon: number;
  deltaXp: number;
  mensaje: string;
  sonido: "exito" | "fallo" | "click" | null;
  partidaJugada?: boolean;
}

const azar = (n: number): number => Math.floor(Math.random() * n);
const azarEntre = (a: number, b: number): number => a + azar(b - a + 1);

// ── MUNDO DE GUERRA ──────────────────────────────────────────
export const TERRITORIOS = [
  "ARCHIPIÉLAGO NORTE", "CORDILLERA ROJA", "DELTA DE HIERRO", "MESETA CENTRAL",
  "COSTA ESMERALDA", "FRONTERA HELADA", "BOSQUE PROFUNDO", "DESIERTO DE SAL",
  "ESTRECHO DEL VIENTO", "VALLE NEGRO", "PENÍNSULA LARGA", "ALTIPLANO FINAL",
];

export function territorioDefensa(i: number): number {
  return 30 + ((i * 37) % 55);
}

export function estadoGuerra(): Record<string, unknown> {
  return {
    mios: [0, 4],
    log: ["La campaña comienza. Dos provincias juran lealtad a tu bandera."],
    ofensivas: 0,
    victoria: false,
  };
}

// ── SIMULADOR DE COMBATE ─────────────────────────────────────
export function estadoCombate(): Record<string, unknown> {
  return { hpJugador: 100, hpEnemigo: 100, turno: 1, terminado: false, log: ["El rival entra al círculo. No piensa mostrarte piedad."] };
}

// ── DIVISIÓN DETECTIVE ───────────────────────────────────────
export const CASOS: { titulo: string; lugar: string; sospechosos: { nombre: string; pista: string }[]; culpable: number }[] = [
  {
    titulo: "EL CABLE INTERCEPTADO", lugar: "Transbordador del Estrecho",
    sospechosos: [
      { nombre: "EL CORRESPONSAL", pista: "Subió a bordo 40 min antes del zarpe. Su cámara tenía fotos del puente de mando." },
      { nombre: "LA INGENIERA DE SALA", pista: "Acceso técnico legítimo a la sala de comunicaciones. Firma electrónica coincide con el equipo." },
      { nombre: "EL STEWARD JEFFE", pista: "Conoce cada camarote. Su horario lo sitúa lejos de la antena en el momento clave." },
    ],
    culpable: 1,
  },
  {
    titulo: "EL ARCHIVO QUE DESAPARECIÓ", lugar: "Sótano de la Biblioteca Nacional",
    sospechosos: [
      { nombre: "EL ARCHIVISTA MAYOR", pista: "Único con las tres llaves. Su registro de entradas tiene un hueco de 11 minutos." },
      { nombre: "LA RESTAURADORA", pista: "Trabaja con guantes y solventes. Su ficha de acceso muestra salidas siempre a la misma hora." },
      { nombre: "EL BECARIO DE TURNO", pista: "Primera semana. No conoce los pasillos: las cámaras lo muestran perdido dos veces." },
    ],
    culpable: 0,
  },
  {
    titulo: "SEÑAL FANTASMA EN LA BOLSA", lugar: "Distrito Financiero",
    sospechosos: [
      { nombre: "EL ANALISTA CUANT", pista: "Sus algoritmos movieron el volumen, pero su historial no cruza con la hora del pico fantasma." },
      { nombre: "EL OPERADOR DE RED", pista: "Controla el cable troncal. El pico nació exactamente en su segmento, dos veces seguidas." },
      { nombre: "LA AUDITORA EXTERNA", pista: "Llegó tras el primer pico. No tiene acceso físico ni credenciales de trading." },
    ],
    culpable: 1,
  },
];

export function estadoDetective(): Record<string, unknown> {
  const idx = azar(CASOS.length);
  return { casoIdx: idx, pistasReveladas: 0, resuelto: false, acierto: null, casosResueltos: 0 };
}

// ── CENTINELA: verificación ──────────────────────────────────
export const TITULARES: { titular: string; real: boolean; fuenteReal?: string }[] = [
  { titular: "La primera transmisión por internet fue «LO»: el sistema se cayó antes de terminar LOGIN.", real: true, fuenteReal: "UCLA, 1969" },
  { titular: "El Monte Everest es más alto de lo que era hace un siglo por el empuje tectónico continuo.", real: true, fuenteReal: "Geodesia moderna" },
  { titular: "Norway legalizó la jornada de 4 horas en todo el sector privado desde 2019.", real: false },
  { titular: "Los octópodos tienen tres corazones y sangre azul por la hemocianina.", real: true, fuenteReal: "Biología marina" },
  { titular: "El zumbador UVB-76 emite desde 1973 y nadie ha reclamado oficialmente su propiedad.", real: true, fuenteReal: "Archivo radiofónico" },
  { titular: "Las abejas no pueden ver el color rojo, pero sí la luz ultravioleta.", real: true, fuenteReal: "Entomología" },
  { titular: "Suiza prohibió los Minaretes nuevos por referéndum popular en 2009.", real: true, fuenteReal: "Referéndum federal" },
  { titular: "La Gran Muralla China es visible a simple vista desde la Luna.", real: false },
  { titular: "Bananas crecen en hierbas gigantes, no en árboles.", real: true, fuenteReal: "Botánica" },
  { titular: "El pelo humano crece más rápido en verano por biología, no por cortes.", real: false },
];

export function estadoCentinela(): Record<string, unknown> {
  return { idx: azar(TITULARES.length), respondido: null, aciertos: 0, fallos: 0, rachaVerificacion: 0 };
}

// ── TRIBUNAL ─────────────────────────────────────────────────
export const CASOS_TRIBUNAL: { caso: string; desc: string; culpable: boolean; resolucion: string }[] = [
  { caso: "EL CONTRATO DE LA MINA", desc: "Una empresa firmó extracción en territorio comunal con permiso firmado por un gobernador saliente, dos días después de perder las elecciones.", culpable: true, resolucion: "El tribunal anuló el permiso: autoridad caducada y consulta previa omitida." },
  { caso: "LA BALSA DEL FARO", desc: "Pescadores cruzaron aguas jurisdiccionales sin bandera y fueron interceptados. Alegaban emergencia: su motor se apagó a la deriva.", culpable: false, resolucion: "Absueltos: la convención de rescate marítimo ampara la entrada por emergencia documentada." },
  { caso: "EL ALGORITMO DEL CRÉDITO", desc: "Un banco denegó crédito masivamente a un distrito usando un modelo sin auditoría pública. Los datos de entrada eran historiales sesgados.", culpable: true, resolucion: "Sanción por discriminación algorítmica: obligación de auditoría externa y publicación de variables." },
  { caso: "EL SATÉLITE DESVIADO", desc: "Una agencia movió un satélite de observación sobre territorio de un país sin tratado de sobre vuelo para «tareas científicas».", culpable: false, resolucion: "Desestimado: la observación orbital sin restricción treaty es práctica internacional consolidada." },
  { caso: "EL ARCHIVO DE SALUD", desc: "Un gobierno vendió datos anonimizados de pacientes a una aseguradora. La anonimización era reversible con datos públicos.", culpable: true, resolucion: "Condena por reidentificación previsible: los datos volvieron a ser considerados personales." },
  { caso: "EL BARCO DE GRANO", desc: "Un carguero con bandera de conveniencia abandonó su tripulación sin sueldo en puerto extranjero durante 8 meses.", culpable: true, resolucion: "Embargo del buque: la bandera de conveniencia no exime obligaciones laborales del armador." },
];

export function estadoTribunal(): Record<string, unknown> {
  return { idx: azar(CASOS_TRIBUNAL.length), votado: null, aciertos: 0, votos: 0 };
}

// ── TALLER: reto del día ─────────────────────────────────────
export const RETOS = [
  "DISEÑA EL ESCUDO DE TU NACIÓN: tres símbolos, uno debe ser un sonido.",
  "ESCRIBE EL PRIMER CABLE DE UN SERVICIO QUE NO EXISTE AÚN (80 caracteres).",
  "REINVENTA UNA BANDERA SIN COLORES: solo formas y campo.",
  "NOMBRA UNA OPERACIÓN REAL: verbo + objeto + hora. Estilo desclasificado.",
  "TRAZA LA RUTA DE UN MENSAJE QUE CRUZA TRES MARES SIN SER LEÍDO.",
  "INVENTA UN CODINAME PARA UNA CIUDAD ENTERA. Justifícalo en una frase.",
];

export function estadoTaller(): Record<string, unknown> {
  return { retoIdx: azar(RETOS.length), completado: false, fecha: new Date().toISOString().slice(0, 10) };
}

// ── IMPERIO idle ─────────────────────────────────────────────
export function estadoImperio(): Record<string, unknown> {
  return { fundado: false, nombre: "", oro: 0, ciencia: 0, reclutas: 0, granjas: 0, tsUltimo: Date.now(), pendienteOro: 0 };
}

// ── MI PAÍS ──────────────────────────────────────────────────
export function estadoMipais(): Record<string, unknown> {
  return { proclamado: false, nombre: "", gobierno: "", poblacion: 1_000_000, pib: 12_000, ejercito: 5_000, decretos: 0 };
}

// ── BETNACIÓN ────────────────────────────────────────────────
export function estadoBetnacion(): Record<string, unknown> {
  return { apuesta: null, historial: [] as string[], ganadas: 0, perdidas: 0 };
}

// ── ARCADE ───────────────────────────────────────────────────
export function estadoArcade(): Record<string, unknown> {
  return { record: 0, partidas: 0 };
}

// ── GANANCIAS ────────────────────────────────────────────────
export function estadoGanancias(): Record<string, unknown> {
  return { reclamadas: [] as string[] };
}

// ── OJO DE DIOS / MENTE ──────────────────────────────────────
export function estadoOjodios(): Record<string, unknown> {
  return { frenteIdx: 0 };
}
export function estadoMente(): Record<string, unknown> {
  return { pensamientoIdx: 0 };
}

export function estadoInicialMecanica(salaId: string): Record<string, unknown> {
  switch (salaId) {
    case "guerra": return estadoGuerra();
    case "combate": return estadoCombate();
    case "detective": return estadoDetective();
    case "centinela": return estadoCentinela();
    case "tribunal": return estadoTribunal();
    case "taller": return estadoTaller();
    case "imperio": return estadoImperio();
    case "mipais": return estadoMipais();
    case "betnacion": return estadoBetnacion();
    case "arcade": return estadoArcade();
    case "ganancias": return estadoGanancias();
    case "ojodios": return estadoOjodios();
    case "mente": return estadoMente();
    default: return {};
  }
}

// ============================================================
// PROCESADOR DE ACCIONES — cada acción devuelve nuevo estado +
// recompensas + mensaje. El handler del botón 2D llama aquí.
// ============================================================
export function procesarAccionMecanica(
  salaId: string,
  accion: string,
  estado: Record<string, unknown>,
  ctx: ContextoMecanica
): ResultadoAccion {
  const ok = (estado: Record<string, unknown>, deltaMon: number, deltaXp: number, mensaje: string, sonido: "exito" | "fallo" | "click" | null, partidaJugada = false): ResultadoAccion =>
    ({ estado, deltaMon, deltaXp, mensaje, sonido, partidaJugada });

  const [comando, arg1, arg2] = accion.split(":");

  switch (salaId) {
    // ── GUERRA ──
    case "guerra": {
      if (comando === "conquistar") {
        const idx = Number(arg1);
        const mios = estado.mios as number[];
        if (mios.includes(idx)) return ok(estado, 0, 0, "Esa provincia ya ondea tu bandera.", null);
        if (ctx.mon < 10) return ok(estado, 0, 0, "Sin munición: necesitas 10 mon ◉ por ofensiva.", "fallo");
        const defensa = territorioDefensa(idx);
        const golpe = azarEntre(20, 100) + (estado.ofensivas as number) * 3;
        const log = [...(estado.log as string[])];
        if (golpe > defensa) {
          const nuevosMios = [...mios, idx];
          const victoriaTotal = nuevosMios.length >= TERRITORIOS.length;
          log.unshift(
            victoriaTotal
              ? `VICTORIA TOTAL: ${TERRITORIOS[idx]} cae. El mapa entero es tuyo.`
              : `${TERRITORIOS[idx]} conquistada (golpe ${golpe} vs defensa ${defensa}).`
          );
          return ok(
            { ...estado, mios: nuevosMios, log, ofensivas: (estado.ofensivas as number) + 1, victoria: victoriaTotal },
            -10 + (victoriaTotal ? 80 : 18),
            victoriaTotal ? 40 : 10,
            victoriaTotal ? "CAMPAÑA COMPLETA. El mundo entero conoce tu nombre." : `Conquista confirmada: ${TERRITORIOS[idx]}`,
            "exito",
            true
          );
        }
        log.unshift(`Ofensiva rechazada en ${TERRITORIOS[idx]} (golpe ${golpe} vs defensa ${defensa}).`);
        return ok({ ...estado, log, ofensivas: (estado.ofensivas as number) + 1 }, -10, 2, "La defensa resistió. Regroupa y vuelve.", "fallo", true);
      }
      if (comando === "reiniciar") return ok(estadoGuerra(), 0, 0, "Nueva campaña. El mapa se limpia.", "click");
      break;
    }

    // ── COMBATE ──
    case "combate": {
      if (comando === "atacar" && !(estado.terminado as boolean)) {
        const dano = azarEntre(12, 26);
        const hpEnemigo = Math.max(0, (estado.hpEnemigo as number) - dano);
        const log = [...(estado.log as string[])];
        let hpJugador = estado.hpJugador as number;
        let mensaje = `Golpe directo: -${dano} al rival.`;
        let sonido: ResultadoAccion["sonido"] = "click";
        let deltaMon = 0;
        let deltaXp = 5;
        let terminado = false;
        if (hpEnemigo <= 0) {
          terminado = true;
          mensaje = "RIVAL DERROTADO. El círculo te aclama: +30 mon ◉.";
          deltaMon = 30;
          deltaXp = 25;
          sonido = "exito";
          log.unshift("El rival cae. Victoria limpia.");
        } else {
          const danoRecibido = azarEntre(8, 20);
          hpJugador = Math.max(0, hpJugador - danoRecibido);
          log.unshift(`Turno ${(estado.turno as number) + 1}: -${dano} al rival / -${danoRecibido} para ti.`);
          if (hpJugador <= 0) {
            terminado = true;
            mensaje = "DERROTA. El simulador te levanta del suelo: +5 mon por el aprendizaje.";
            deltaMon = 5;
            deltaXp = 8;
            sonido = "fallo";
            log.unshift("Tu barra llega a cero. La máquina no celebra.");
          }
        }
        return ok(
          { ...estado, hpJugador, hpEnemigo, terminado, turno: (estado.turno as number) + 1, log: log.slice(0, 6) },
          deltaMon,
          deltaXp,
          mensaje,
          sonido,
          terminado
        );
      }
      if (comando === "defender" && !(estado.terminado as boolean)) {
        const dano = Math.floor(azarEntre(8, 20) / 2);
        const hpJugador = Math.max(0, (estado.hpJugador as number) - dano + 4);
        const log = [`Guarda alta: solo -${dano} y recuperas 4 HP.`, ...(estado.log as string[])].slice(0, 6);
        let terminado = hpJugador <= 0;
        return ok(
          { ...estado, hpJugador, terminado, turno: (estado.turno as number) + 1, log },
          0,
          2,
          terminado ? "La guardia no fue suficiente. Derrota." : "Defensa sólida. Respira y sigue.",
          terminado ? "fallo" : "click",
          terminado
        );
      }
      if (comando === "reiniciar") return ok(estadoCombate(), 0, 0, "Nuevo duelo preparado.", "click");
      break;
    }

    // ── DETECTIVE ──
    case "detective": {
      const caso = CASOS[estado.casoIdx as number];
      if (comando === "pista") {
        const reveladas = Math.min((estado.pistasReveladas as number) + 1, caso.sospechosos.length);
        return ok({ ...estado, pistasReveladas: reveladas }, 0, 1, reveladas === caso.sospechosos.length ? "Todas las pistas sobre la mesa. Decide." : "Pista añadida al expediente.", "click");
      }
      if (comando === "acusar") {
        const idx = Number(arg1);
        const acierto = idx === caso.culpable;
        return ok(
          { ...estado, resuelto: true, acierto, casosResueltos: (estado.casosResueltos as number) + (acierto ? 1 : 0) },
          acierto ? 30 : -10,
          acierto ? 25 : 6,
          acierto
            ? `CULPABLE CONFIRMADO: ${caso.sospechosos[idx].nombre} confiesa bajo el peso de las pistas. +30 mon ◉`
            : `Falso culpable: ${caso.sospechosos[idx].nombre} tenía coartada verificable. El caso se enfría (-10 mon).`,
          acierto ? "exito" : "fallo",
          true
        );
      }
      if (comando === "nuevo") {
        let nuevoIdx = azar(CASOS.length);
        if (nuevoIdx === estado.casoIdx) nuevoIdx = (nuevoIdx + 1) % CASOS.length;
        return ok({ ...estado, casoIdx: nuevoIdx, pistasReveladas: 0, resuelto: false, acierto: null }, 0, 0, "Nuevo expediente abierto sobre tu mesa.", "click");
      }
      break;
    }

    // ── CENTINELA ──
    case "centinela": {
      if (comando === "verificar") {
        const titular = TITULARES[estado.idx as number];
        const respuesta = arg1 === "real";
        const acierto = respuesta === titular.real;
        return ok(
          {
            ...estado,
            respondido: respuesta,
            aciertos: (estado.aciertos as number) + (acierto ? 1 : 0),
            fallos: (estado.fallos as number) + (acierto ? 0 : 1),
            rachaVerificacion: acierto ? (estado.rachaVerificacion as number) + 1 : 0,
          },
          acierto ? 8 : -5,
          acierto ? 6 : 2,
          acierto
            ? titular.real
              ? `VERIFICADO REAL (${titular.fuenteReal}). +8 mon ◉`
              : "DETECTASTE LA FALSA. Tu criterio afila. +8 mon ◉"
            : titular.real
              ? `Era REAL (${titular.fuenteReal}). El titular verdadero te engañó. -5 mon`
              : "Era FALSA, fabricada por la casa. Cuidado con el titular perfecto. -5 mon",
          acierto ? "exito" : "fallo"
        );
      }
      if (comando === "siguiente") {
        let nuevo = azar(TITULARES.length);
        if (nuevo === estado.idx) nuevo = (nuevo + 1) % TITULARES.length;
        return ok({ ...estado, idx: nuevo, respondido: null }, 0, 0, "Siguiente titular en la mesa de verificación.", "click");
      }
      break;
    }

    // ── TRIBUNAL ──
    case "tribunal": {
      if (comando === "votar") {
        const caso = CASOS_TRIBUNAL[estado.idx as number];
        const votoCulpable = arg1 === "culpable";
        const acierto = votoCulpable === caso.culpable;
        return ok(
          { ...estado, votado: arg1, aciertos: (estado.aciertos as number) + (acierto ? 1 : 0), votos: (estado.votos as number) + 1 },
          acierto ? 10 : 3,
          acierto ? 8 : 4,
          acierto ? `Tu voto coincide con la resolución documentada: ${caso.resolucion} +10 mon ◉` : `Resolución real: ${caso.resolucion} Tu criterio suma experiencia igual (+3 mon).`,
          acierto ? "exito" : "click",
          true
        );
      }
      if (comando === "siguiente") {
        let nuevo = azar(CASOS_TRIBUNAL.length);
        if (nuevo === estado.idx) nuevo = (nuevo + 1) % CASOS_TRIBUNAL.length;
        return ok({ ...estado, idx: nuevo, votado: null }, 0, 0, "Nuevo caso entra a la sala.", "click");
      }
      break;
    }

    // ── TALLER ──
    case "taller": {
      if (comando === "aceptar") return ok({ ...estado, aceptado: true }, 0, 2, "Reto aceptado. El taller espera.", "click");
      if (comando === "cumplir") {
        if (estado.completado) return ok(estado, 0, 0, "El reto del día ya está cumplido. Vuelve mañana.", "click");
        const nuevoIdx = (azar(RETOS.length) + 1) % RETOS.length;
        return ok({ ...estado, completado: true, retoIdx: nuevoIdx, fecha: new Date().toISOString().slice(0, 10) }, 20, 15, "RETRO CUMPLIDO. El taller paga: +20 mon ◉, +15 XP.", "exito");
      }
      if (comando === "otro") return ok({ ...estado, retoIdx: (azar(RETOS.length) + 1) % RETOS.length, completado: false, aceptado: false }, 0, 0, "Otro reto forjado en el taller.", "click");
      break;
    }

    // ── IMPERIO ──
    case "imperio": {
      if (comando === "fundar") {
        const nombre = (arg1 || "NUEVO IMPERIO").slice(0, 24).toUpperCase();
        return ok({ ...estadoImperio(), fundado: true, nombre, tsUltimo: Date.now() }, 0, 15, `EL IMPERIO ${nombre} HA SIDO FUNDADO. +15 XP`, "exito");
      }
      if (comando === "tick") {
        if (!estado.fundado) return ok(estado, 0, 0, "", null);
        const ahora = Date.now();
        const seg = Math.min((ahora - (estado.tsUltimo as number)) / 1000, 3600);
        const multiplicador = 1 + (estado.granjas as number) * 0.5;
        const pendienteOro = (estado.pendienteOro as number) + seg * 0.4 * (estado.reclutas as number + 1) * multiplicador;
        const ciencia = (estado.ciencia as number) + seg * 0.2 * multiplicador;
        return ok({ ...estado, pendienteOro, ciencia, tsUltimo: ahora }, 0, 0, "", null);
      }
      if (comando === "cobrar") {
        const pendiente = Math.floor(estado.pendienteOro as number);
        if (pendiente < 1) return ok(estado, 0, 0, "El tesoro está vacío aún. Los impuestos maduran con el tiempo.", "click");
        return ok({ ...estado, pendienteOro: (estado.pendienteOro as number) - pendiente, oro: (estado.oro as number) + pendiente }, 0, Math.floor(pendiente / 10), `Cobraste ${pendiente} de oro del tesoro imperial.`, "exito");
      }
      if (comando === "reclutar") {
        if (ctx.mon < 20) return ok(estado, 0, 0, "Un recluta cuesta 20 mon ◉. Sin fondos, sin filas.", "fallo");
        return ok({ ...estado, reclutas: (estado.reclutas as number) + 1 }, -20, 5, "Nuevo guerrero en las filas del imperio. Producción +1.", "exito");
      }
      if (comando === "construir") {
        if (ctx.mon < 40) return ok(estado, 0, 0, "Una granja imperial cuesta 40 mon ◉.", "fallo");
        return ok({ ...estado, granjas: (estado.granjas as number) + 1 }, -40, 8, "Granja construida: producción +50%.", "exito");
      }
      break;
    }

    // ── MI PAÍS ──
    case "mipais": {
      if (comando === "proclamar") {
        const nombre = (arg1 || "NUEVA TIERRA").slice(0, 22).toUpperCase();
        const gobierno = arg2 === "parlamento" ? "DEMOCRACIA PARLAMENTARIA" : arg2 === "consejo" ? "CONSEJO POPULAR" : "REPÚBLICA EJECUTIVA";
        return ok({ ...estadoMipais(), proclamado: true, nombre, gobierno }, 0, 20, `¡${nombre} PROCLAMADA! Gobierno: ${gobierno}. +20 XP`, "exito");
      }
      if (comando === "decreto" && estado.proclamado) {
        const tipo = arg1;
        let poblacion = estado.poblacion as number;
        let pib = estado.pib as number;
        let ejercito = estado.ejercito as number;
        let mensaje = "";
        if (tipo === "educacion") { poblacion += 45_000; pib += 800; mensaje = "Escuelas abiertas: población +45k, PIB +800."; }
        else if (tipo === "defensa") { ejercito += 2_500; pib -= 300; mensaje = "Cuartels activos: ejército +2.5k, PIB -300."; }
        else { pib += 1_500; poblacion -= 10_000; mensaje = "Zonas francas firmadas: PIB +1.5k, población -10k."; }
        return ok({ ...estado, poblacion, pib, ejercito, decretos: (estado.decretos as number) + 1 }, 3, 4, `${mensaje} El tesoro paga el decreto: +3 mon ◉.`, "exito");
      }
      break;
    }

    // ── BETNACIÓN ──
    case "betnacion": {
      if (comando === "apostar") {
        if (estado.apuesta) return ok(estado, 0, 0, "Ya tienes una boleta en juego. Espera la resolución.", "click");
        const monto = Math.min(Number(arg2) || 10, ctx.mon);
        if (monto < 5) return ok(estado, 0, 0, "Apuesta mínima: 5 mon ◉.", "fallo");
        if (ctx.mon < monto) return ok(estado, 0, 0, "Saldo insuficiente para esa boleta.", "fallo");
        const direccion = arg1 === "baja" ? "baja" : "sube";
        return ok(
          { ...estado, apuesta: { direccion, monto, precio: ctx.precioCripto ?? azarEntre(60000, 70000), ts: Date.now() } },
          -monto,
          2,
          ctx.precioCripto
            ? `Boleta activa: ${monto} mon ◉ a que BTC ${direccion === "sube" ? "SUBE" : "BAJA"} desde $${ctx.precioCripto.toLocaleString("en-US")}. Resolución en 60 s con precio real.`
            : `Boleta activa: ${monto} mon ◉ a que BTC ${direccion === "sube" ? "SUBE" : "BAJA"}. Sin precio en vivo: resuelve el destino (60 s).`,
          "click"
        );
      }
      if (comando === "resolver") {
        const apuesta = estado.apuesta as { direccion: string; monto: number; precio: number; ts: number } | null;
        if (!apuesta) return ok(estado, 0, 0, "", null);
        const transcurrido = (Date.now() - apuesta.ts) / 1000;
        if (transcurrido < 60) return ok(estado, 0, 0, `La boleta se resuelve en ${Math.ceil(60 - transcurrido)} s.`, "click");
        const precioAhora = ctx.precioCripto ?? apuesta.precio * (Math.random() < 0.5 ? 1.001 : 0.999);
        const subio = precioAhora >= apuesta.precio;
        const gano = (apuesta.direccion === "sube") === subio;
        const historial = [`${gano ? "GANADA" : "PERDIDA"} · ${apuesta.direccion.toUpperCase()} · $${apuesta.precio.toLocaleString("en-US")} → $${precioAhora.toLocaleString("en-US")}`, ...(estado.historial as string[])].slice(0, 6);
        return ok(
          { ...estado, apuesta: null, historial, ganadas: (estado.ganadas as number) + (gano ? 1 : 0), perdidas: (estado.perdidas as number) + (gano ? 0 : 1) },
          gano ? apuesta.monto * 2 : 0,
          gano ? 10 : 3,
          gano
            ? `BOLETA GANADA: BTC ${subio ? "subió" : "bajó"} como firmaste. +${apuesta.monto * 2} mon ◉`
            : `Boleta perdida: BTC ${subio ? "subió" : "bajó"} en tu contra. La casa no llora.`,
          gano ? "exito" : "fallo"
        );
      }
      break;
    }

    // ── ARCADE ──
    case "arcade": {
      if (comando === "fin") {
        const puntos = Math.max(0, Number(arg1) || 0);
        const record = Math.max(estado.record as number, puntos);
        const mon = Math.floor(puntos / 8);
        return ok({ ...estado, record, partidas: (estado.partidas as number) + 1 }, mon, Math.floor(puntos / 6), puntos > (estado.record as number) ? `¡NUEVO RÉCORD: ${puntos} puntos! +${mon} mon ◉` : `Partida cerrada: ${puntos} puntos. +${mon} mon ◉`, "exito", true);
      }
      break;
    }

    // ── GANANCIAS ──
    case "ganancias": {
      if (comando === "reclamar") {
        const reclamadas = estado.reclamadas as string[];
        if (reclamadas.includes(arg1)) return ok(estado, 0, 0, "Esa misión ya fue cobrada hoy.", "click");
        const misiones: Record<string, { cond: boolean; mon: number; xp: number; nombre: string }> = {
          explorador: { cond: ctx.salasVisitadas >= 5, mon: 15, xp: 10, nombre: "EXPLORADOR (5 salas visitadas)" },
          curador: { cond: ctx.likesDados >= 3, mon: 10, xp: 8, nombre: "CURADOR (3 likes al feed)" },
          gladiador: { cond: ctx.partidasJugadas >= 1, mon: 20, xp: 12, nombre: "GLADIADOR (1 partida jugada)" },
          racha: { cond: ctx.racha >= 3, mon: 25, xp: 15, nombre: "CONSTANTE (racha de 3 días)" },
        };
        const m = misiones[arg1];
        if (!m) return ok(estado, 0, 0, "", null);
        if (!m.cond) return ok(estado, 0, 0, `Misión ${m.nombre} aún no cumplida. La red te está mirando.`, "fallo");
        return ok({ ...estado, reclamadas: [...reclamadas, arg1] }, m.mon, m.xp, `MISIÓN CUMPLIDA: ${m.nombre} → +${m.mon} mon ◉, +${m.xp} XP`, "exito");
      }
      break;
    }

    // ── OJO DE DIOS / MENTE ──
    case "ojodios": {
      if (comando === "volar") return ok({ ...estado, frenteIdx: Number(arg1) || 0 }, 0, 1, "El Ojo vuela al frente seleccionado.", "click");
      break;
    }
    case "mente": {
      if (comando === "pensar") return ok({ ...estado, pensamientoIdx: (estado.pensamientoIdx as number) + 1 }, 0, 1, "La mente gira otra vuelta.", "click");
      break;
    }
  }

  return ok(estado, 0, 0, "Esa acción no está en el protocolo de esta sala.", "click");
}
