// ============================================================
// VANGUARD v170.0 — FILAS POR SALA
// Une tres fuentes en el lenguaje universal de Fila:
//   API    → datos en vivo (con badge honesto si cae a SIMULADO)
//   SIM    → estado de mecánica → filas + acciones
//   ARCHIVO→ contenido de la red
// ============================================================

import type { Fila, Sala } from "./tipos";
import { filasBiblioteca, filasCarteles, filasEspectro, filasRedMundial, filasRostros } from "./contenido";
import { CASOS, CASOS_TRIBUNAL, RETOS, TERRITORIOS, TITULARES, territorioDefensa } from "./mecanicas";

const azar = (n: number): number => Math.floor(Math.random() * n);

export interface DatosApi {
  sismos?: { enVivo: boolean; fuente: string; sismos: { id: string; lugar: string; magnitud: number; profundidadKm: number; haceMin: number; tsunami: boolean }[] };
  clima?: { enVivo: boolean; fuente: string; climas: { ciudad: string; tempC: number; vientoKmh: number; condicion: string }[] };
  cripto?: { enVivo: boolean; fuente: string; criptos: { id: string; simbolo: string; nombre: string; precioUsd: number; cambio24h: number }[] };
  planeta?: { enVivo: boolean; fuente: string; eventos: { id: string; titulo: string; categoria: string; fecha: string }[] };
  curiosidad?: { enVivo: boolean; fuente: string; curiosidades: { fuente: string; tipo: string; texto: string }[] };
}

export interface ContextoFilas {
  estado: Record<string, unknown>;
  mon: number;
  likesDados: number;
  salasVisitadas: number;
  partidasJugadas: number;
  racha: number;
  xp: number;
  rangoNombre: string;
  salasExploradas: number;
  totalSalas: number;
}

const MON = "mon ◉";

function colorMag(m: number): string {
  if (m >= 6) return "text-red-400";
  if (m >= 5) return "text-orange-300";
  return "text-amber-200";
}

export function filasDeSala(sala: Sala, api: DatosApi, ctx: ContextoFilas): Fila[] {
  const { estado } = ctx;

  switch (sala.id) {
    // ═══════════ API ═══════════
    case "sismo": {
      const d = api.sismos;
      if (!d) return [{ tipo: "texto", titulo: "CONECTANDO CON USGS…", cuerpo: "El radar sísmico está sincronizando con la red global." }];
      return [
        d.enVivo
          ? { tipo: "stat", etiqueta: "FUENTE", valor: "USGS · EN VIVO", detalle: "Magnitud 4.5+ últimas 24 h", color: "text-emerald-300" }
          : { tipo: "stat", etiqueta: "FUENTE", valor: "MODO SIMULADO", detalle: "USGS no responde; estos son eventos de la red", color: "text-amber-300" },
        ...d.sismos.slice(0, 8).map((s) => ({
          tipo: "lista" as const,
          titulo: `M ${s.magnitud.toFixed(1)} — hace ${s.haceMin} min`,
          items: [{ principal: s.lugar, secundario: `Profundidad ${s.profundidadKm} km${s.tsunami ? " · ALERTA TSUNAMI" : ""}`, color: colorMag(s.magnitud) }],
        })),
      ];
    }

    case "meteo": {
      const d = api.clima;
      if (!d) return [{ tipo: "texto", titulo: "CONECTANDO CON OPEN-METEO…", cuerpo: "Sincronizando 8 estaciones del planeta." }];
      return [
        d.enVivo
          ? { tipo: "stat", etiqueta: "FUENTE", valor: "OPEN-METEO · EN VIVO", detalle: "8 ciudades vigiladas", color: "text-emerald-300" }
          : { tipo: "stat", etiqueta: "FUENTE", valor: "MODO SIMULADO", detalle: "Sin señal exterior", color: "text-amber-300" },
        ...d.climas.map((c) => ({
          tipo: "lista" as const,
          titulo: `${c.ciudad} — ${c.tempC}°C`,
          items: [{ principal: c.condicion, secundario: `Viento ${c.vientoKmh} km/h`, color: c.tempC > 28 ? "text-red-300" : c.tempC < 10 ? "text-cyan-300" : "text-emerald-300" }],
        })),
      ];
    }

    case "cripto": {
      const d = api.cripto;
      if (!d) return [{ tipo: "texto", titulo: "CONECTANDO CON COINGECKO…", cuerpo: "El mercado late; la sala sincroniza." }];
      return [
        d.enVivo
          ? { tipo: "stat", etiqueta: "FUENTE", valor: "COINGECKO · EN VIVO", detalle: "Precio spot + cambio 24 h", color: "text-emerald-300" }
          : { tipo: "stat", etiqueta: "FUENTE", valor: "MODO SIMULADO", detalle: "Precio orientativo de la red", color: "text-amber-300" },
        ...d.criptos.map((c) => ({
          tipo: "lista" as const,
          titulo: `${c.simbolo} — $${c.precioUsd < 1 ? c.precioUsd.toFixed(4) : c.precioUsd.toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
          items: [{
            principal: c.nombre,
            secundario: `24 h: ${c.cambio24h >= 0 ? "+" : ""}${c.cambio24h.toFixed(2)}%`,
            color: c.cambio24h >= 0 ? "text-emerald-300" : "text-red-300",
          }],
        })),
      ];
    }

    case "planeta": {
      const d = api.planeta;
      if (!d) return [{ tipo: "texto", titulo: "CONECTANDO CON NASA EONET…", cuerpo: "El satélite ajusta su órbita." }];
      return [
        d.enVivo
          ? { tipo: "stat", etiqueta: "FUENTE", valor: "NASA EONET · EN VIVO", detalle: "Eventos naturales últimos 10 días", color: "text-emerald-300" }
          : { tipo: "stat", etiqueta: "FUENTE", valor: "MODO SIMULADO", detalle: "Eventos de archivo de la red", color: "text-amber-300" },
        ...d.eventos.slice(0, 8).map((e) => ({
          tipo: "lista" as const,
          titulo: e.titulo,
          items: [{ principal: `${e.categoria}${e.fecha ? ` · ${e.fecha}` : ""}`, color: "text-cyan-300" }],
        })),
      ];
    }

    case "curiosidades": {
      const d = api.curiosidad;
      if (!d) return [{ tipo: "texto", titulo: "ABRIENDO WIKIPEDIA…", cuerpo: "Buscando lo que pasó un día como hoy." }];
      return [
        { tipo: "stat", etiqueta: "FUENTE", valor: d.enVivo ? "WIKIPEDIA · EN VIVO" : "MODO SIMULADO", detalle: `Efemérides del ${new Date().getDate()}/${new Date().getMonth() + 1}`, color: d.enVivo ? "text-emerald-300" : "text-amber-300" },
        ...d.curiosidades.slice(0, 7).map((c) => ({
          tipo: "lista" as const,
          titulo: c.fuente,
          items: [{ principal: c.texto, color: "text-violet-300" }],
        })),
      ];
    }

    case "pulso": {
      const partes: Fila[] = [];
      if (api.sismos) partes.push({ tipo: "stat", etiqueta: "SISMOS 24H", valor: String(api.sismos.sismos.length), detalle: api.sismos.enVivo ? "USGS en vivo" : "simulado", color: "text-emerald-300" });
      if (api.cripto) {
        const btc = api.cripto.criptos.find((c) => c.simbolo === "BTC");
        partes.push({ tipo: "stat", etiqueta: "BTC/USD", valor: btc ? `$${btc.precioUsd.toLocaleString("en-US", { maximumFractionDigits: 0 })}` : "—", detalle: btc ? `${btc.cambio24h >= 0 ? "+" : ""}${btc.cambio24h.toFixed(2)}% 24h` : undefined, color: btc && btc.cambio24h >= 0 ? "text-emerald-300" : "text-red-300" });
      }
      if (api.planeta) partes.push({ tipo: "stat", etiqueta: "EVENTOS NATURALES", valor: String(api.planeta.eventos.length), detalle: "NASA EONET", color: "text-cyan-300" });
      if (api.clima) {
        const maxTemp = Math.max(...api.clima.climas.map((c) => c.tempC));
        partes.push({ tipo: "stat", etiqueta: "CALOR MÁXIMO HOY", valor: `${maxTemp}°C`, detalle: "Entre las 8 ciudades vigiladas", color: "text-amber-300" });
      }
      if (api.curiosidad) partes.push({ tipo: "stat", etiqueta: "EFEMÉRIDES DEL DÍA", valor: String(api.curiosidad.curiosidades.length), detalle: "Wikipedia", color: "text-violet-300" });
      return [
        ...partes,
        { tipo: "texto", titulo: "LECTURA HORIZONTAL", cuerpo: "Índice compuesto del estado del mundo a partir de todas las fuentes activas de la red. Si todos los sensores están en verde, el día es operable; si alguno arde, empieza por ahí." },
      ];
    }

    // ═══════════ SIM ═══════════
    case "guerra": {
      const mios = estado.mios as number[];
      const log = (estado.log as string[]) ?? [];
      return [
        { tipo: "stat", etiqueta: "PROVINCIAS", valor: `${mios.length} / ${TERRITORIOS.length}`, detalle: "Bajo tu bandera", color: "text-red-300" },
        { tipo: "stat", etiqueta: "OFENSIVAS", valor: String(estado.ofensivas ?? 0), detalle: "Cada una cuesta 10 " + MON, color: "text-amber-300" },
        ...(estado.victoria ? [{ tipo: "stat" as const, etiqueta: "ESTADO", valor: "VICTORIA TOTAL", detalle: "El mapa completo es tuyo", color: "text-emerald-300" }] : []),
        { tipo: "accion", etiqueta: estado.victoria ? "INICIAR NUEVA CAMPAÑA" : "LANZAR OFENSIVA SORPRESA", accion: estado.victoria ? "reiniciar" : `conquistar:${azar(12)}`, nota: "10 mon ◉ · dado + moral acumulada vs defensa" },
        ...TERRITORIOS.map((t, i) => ({
          tipo: "accion" as const,
          etiqueta: `${mios.includes(i) ? "⚑" : "◦"} ${t}`,
          accion: mios.includes(i) ? "sin_op" : `conquistar:${i}`,
          nota: mios.includes(i) ? "tuya" : `defensa ${territorioDefensa(i)} · 10 ${MON}`,
        })),
        ...log.slice(0, 4).map((l) => ({ tipo: "texto" as const, titulo: "DIARIO DE GUERRA", cuerpo: l })),
      ];
    }

    case "combate": {
      const terminado = estado.terminado as boolean;
      return [
        { tipo: "progreso", etiqueta: "TU VIDA", valor: estado.hpJugador as number, detalle: `${estado.hpJugador}/100`, color: (estado.hpJugador as number) > 40 ? "text-emerald-300" : "text-red-400" },
        { tipo: "progreso", etiqueta: "RIVAL", valor: estado.hpEnemigo as number, detalle: `${estado.hpEnemigo}/100`, color: "text-red-300" },
        ...(terminado
          ? [{ tipo: "accion" as const, etiqueta: "NUEVO DUELO", accion: "reiniciar", nota: "el círculo se limpia" }]
          : [
              { tipo: "accion" as const, etiqueta: "ATACAR", accion: "atacar", nota: "daño 12-26 · recibe respuesta" },
              { tipo: "accion" as const, etiqueta: "DEFENDER", accion: "defender", nota: "mitad de daño +4 HP" },
            ]),
        ...((estado.log as string[]) ?? []).slice(0, 4).map((l) => ({ tipo: "texto" as const, titulo: `TURNO`, cuerpo: l })),
      ];
    }

    case "detective": {
      const caso = CASOS[estado.casoIdx as number];
      if (!caso) return [];
      const reveladas = estado.pistasReveladas as number;
      const filas: Fila[] = [
        { tipo: "stat", etiqueta: "EXPEDIENTE", valor: caso.titulo, detalle: caso.lugar, color: "text-violet-300" },
        { tipo: "stat", etiqueta: "CASOS RESUELTOS", valor: String(estado.casosResueltos ?? 0), color: "text-emerald-300" },
        { tipo: "accion", etiqueta: "EXAMINAR ESCENA (+1 PISTA)", accion: "pista", nota: "gratis, pero cada pista reduce el mérito" },
      ];
      for (let i = 0; i < reveladas; i++) {
        filas.push({ tipo: "lista", titulo: `PISTA ${i + 1}: ${caso.sospechosos[i].nombre}`, items: [{ principal: caso.sospechosos[i].pista, color: "text-violet-300" }] });
      }
      if (reveladas === 0) filas.push({ tipo: "texto", titulo: "SIN PISTAS AÚN", cuerpo: "Tres sospechosos. Cero certezas. Examina la escena antes de acusar." });
      if (!estado.resuelto) {
        caso.sospechosos.forEach((s, i) => {
          filas.push({ tipo: "accion", etiqueta: `ACUSAR A ${s.nombre}`, accion: `acusar:${i}`, nota: "acierto +30 mon ◉ · error -10 mon" });
        });
      } else {
        filas.push({ tipo: "stat", etiqueta: "RESOLUCIÓN", valor: estado.acierto ? "CULPABLE CONFIRMADO" : "ACUSACIÓN FALLIDA", detalle: `El culpable era: ${caso.sospechosos[caso.culpable].nombre}`, color: estado.acierto ? "text-emerald-300" : "text-red-300" });
        filas.push({ tipo: "accion", etiqueta: "ABRIR NUEVO CASO", accion: "nuevo" });
      }
      return filas;
    }

    case "centinela": {
      const t = TITULARES[estado.idx as number];
      const respondido = estado.respondido as string | null;
      const filas: Fila[] = [
        { tipo: "stat", etiqueta: "MESA DE VERIFICACIÓN", valor: "TITULAR EN MESA", detalle: "Real o fabricado por la casa", color: "text-cyan-300" },
        { tipo: "lista", titulo: "«" + t.titular + "»", items: [{ principal: "Vótalo: real o falso", color: "text-cyan-300" }] },
        { tipo: "stat", etiqueta: "MARCA PERSONAL", valor: `${estado.aciertos} ✓ / ${estado.fallos} ✗`, detalle: `racha ${estado.rachaVerificacion}`, color: "text-emerald-300" },
      ];
      if (respondido === null) {
        filas.push({ tipo: "accion", etiqueta: "ES REAL", accion: "verificar:real", nota: "+8 mon ◉ si aciertas" });
        filas.push({ tipo: "accion", etiqueta: "ES FALSO", accion: "verificar:falso", nota: "+8 mon ◉ si aciertas" });
      } else {
        filas.push({ tipo: "stat", etiqueta: "VEREDICTO", valor: t.real ? "ERA REAL" : "ERA FALSO", detalle: t.real ? `Fuente: ${t.fuenteReal}` : "Fabricado por la casa para entrenar tu ojo", color: t.real ? "text-emerald-300" : "text-red-300" });
        filas.push({ tipo: "accion", etiqueta: "SIGUIENTE TITULAR", accion: "siguiente" });
      }
      return filas;
    }

    case "tribunal": {
      const c = CASOS_TRIBUNAL[estado.idx as number];
      const votado = estado.votado as string | null;
      const filas: Fila[] = [
        { tipo: "stat", etiqueta: "CASO EN SALA", valor: c.caso, color: "text-cyan-300" },
        { tipo: "texto", titulo: "LOS HECHOS", cuerpo: c.desc },
        { tipo: "stat", etiqueta: "TU HISTORIAL", valor: `${estado.aciertos} aciertos / ${estado.votos} votos`, color: "text-emerald-300" },
      ];
      if (!votado) {
        filas.push({ tipo: "accion", etiqueta: "VOTO: CULPABLE", accion: "votar:culpable", nota: "+10 mon ◉ si aciertas" });
        filas.push({ tipo: "accion", etiqueta: "VOTO: INOCENTE", accion: "votar:inocente", nota: "+10 mon ◉ si aciertas" });
      } else {
        filas.push({ tipo: "stat", etiqueta: "RESOLUCIÓN DOCUMENTADA", valor: c.culpable ? "CULPABLE" : "INOCENTE", detalle: c.resolucion, color: "text-emerald-300" });
        filas.push({ tipo: "accion", etiqueta: "SIGUIENTE CASO", accion: "siguiente" });
      }
      return filas;
    }

    case "taller": {
      return [
        { tipo: "stat", etiqueta: "RETO DEL DÍA", valor: RETOS[estado.retoIdx as number], color: "text-red-300" },
        ...(estado.completado
          ? [{ tipo: "stat" as const, etiqueta: "ESTADO", valor: "CUMPLIDO ✓", detalle: "El taller ya te pagó hoy", color: "text-emerald-300" }]
          : [
              { tipo: "accion" as const, etiqueta: "ACEPTAR EL RETO", accion: "aceptar" },
              { tipo: "accion" as const, etiqueta: "MARCAR COMO CUMPLIDO", accion: "cumplir", nota: "+20 mon ◉ · +15 XP" },
            ]),
        { tipo: "accion", etiqueta: "PEDIR OTRO RETO", accion: "otro", nota: "el taller forja uno nuevo" },
        { tipo: "texto", titulo: "LA FÁBRICA", cuerpo: "El Taller es la fábrica de contenido de la red: cada día forja un reto creativo distinto para mantener la mente del agente en movimiento. Cumplir retos alimenta tu XP y alimenta al algoritmo: los creadores constantes ven salas nuevas antes que nadie." },
      ];
    }

    case "imperio": {
      if (!estado.fundado) {
        return [
          { tipo: "texto", titulo: "FUNDACIÓN PENDIENTE", cuerpo: "El mapa tiene un hueco con tu nombre. Nombra tu imperio y comienza a producir: los reclutas generan oro, las granjas multiplican, la ciencia se acumula sola." },
          { tipo: "accion", etiqueta: "FUNDAR «IMPERIO AURUM»", accion: "fundar:AURUM", nota: "gratis · +15 XP" },
          { tipo: "accion", etiqueta: "FUNDAR «NUEVA ESPARTA»", accion: "fundar:NUEVA ESPARTA", nota: "gratis · +15 XP" },
        ];
      }
      return [
        { tipo: "stat", etiqueta: "IMPERIO", valor: estado.nombre as string, color: "text-amber-300" },
        { tipo: "stat", etiqueta: "TESORO PENDIENTE", valor: `${Math.floor(estado.pendienteOro as number)} oro`, detalle: "producción por segundo: 0.4 × (1 + reclutas) × granjas", color: "text-amber-300" },
        { tipo: "stat", etiqueta: "CIENCIA", valor: Math.floor(estado.ciencia as number) + "", color: "text-violet-300" },
        { tipo: "stat", etiqueta: "EJÉRCITO / GRANJAS", valor: `${estado.reclutas} / ${estado.granjas}`, color: "text-red-300" },
        { tipo: "accion", etiqueta: "COBRAR IMPUESTOS", accion: "cobrar", nota: "convierte el tesoro pendiente en mon ◉" },
        { tipo: "accion", etiqueta: "RECLUTAR GUERRERO (20 " + MON + ")", accion: "reclutar", nota: "producción +1" },
        { tipo: "accion", etiqueta: "CONSTRUIR GRANJA (40 " + MON + ")", accion: "construir", nota: "producción +50%" },
      ];
    }

    case "mipais": {
      if (!estado.proclamado) {
        return [
          { tipo: "texto", titulo: "PROCLAMACIÓN PENDIENTE", cuerpo: "Un país empieza con un nombre y un gobierno. Elige la forma del poder: cada una tiene la misma aritmética, pero distinto himno." },
          { tipo: "accion", etiqueta: "PROCLAMAR «ESPERANZA» · PARLAMENTO", accion: "proclamar:ESPERANZA:parlamento", nota: "+20 XP" },
          { tipo: "accion", etiqueta: "PROCLAMAR «LIBERTAD» · CONSEJO", accion: "proclamar:LIBERTAD:consejo", nota: "+20 XP" },
          { tipo: "accion", etiqueta: "PROCLAMAR «HORIZONTE» · REPÚBLICA", accion: "proclamar:HORIZONTE:republica", nota: "+20 XP" },
        ];
      }
      return [
        { tipo: "stat", etiqueta: "NACIÓN", valor: `${estado.nombre} · ${estado.gobierno}`, color: "text-red-300" },
        { tipo: "stat", etiqueta: "POBLACIÓN", valor: (estado.poblacion as number).toLocaleString("en-US"), color: "text-emerald-300" },
        { tipo: "stat", etiqueta: "PIB (M$)", valor: (estado.pib as number).toLocaleString("en-US"), color: "text-amber-300" },
        { tipo: "stat", etiqueta: "EJÉRCITO", valor: (estado.ejercito as number).toLocaleString("en-US"), color: "text-red-300" },
        { tipo: "stat", etiqueta: "DECRETOS FIRMADOS", valor: String(estado.decretos), color: "text-violet-300" },
        { tipo: "accion", etiqueta: "DECRETO: ESCUELAS", accion: "decreto:educacion", nota: "población y PIB suben · +3 mon ◉" },
        { tipo: "accion", etiqueta: "DECRETO: CUARTELS", accion: "decreto:defensa", nota: "ejército sube, PIB baja · +3 mon ◉" },
        { tipo: "accion", etiqueta: "DECRETO: ZONAS FRANCAS", accion: "decreto:economia", nota: "PIB sube, población baja · +3 mon ◉" },
      ];
    }

    case "betnacion": {
      const apuesta = estado.apuesta as { direccion: string; monto: number; precio: number; ts: number } | null;
      const restante = apuesta ? Math.max(0, Math.ceil(60 - (Date.now() - apuesta.ts) / 1000)) : 0;
      const filas: Fila[] = [
        { tipo: "stat", etiqueta: "SALDO", valor: `${ctx.mon} ${MON}`, color: "text-amber-300" },
      ];
      if (api.cripto) {
        const btc = api.cripto.criptos.find((c) => c.simbolo === "BTC");
        if (btc) filas.push({ tipo: "stat", etiqueta: "BTC EN VIVO", valor: `$${btc.precioUsd.toLocaleString("en-US", { maximumFractionDigits: 0 })}`, detalle: `${btc.cambio24h >= 0 ? "+" : ""}${btc.cambio24h.toFixed(2)}% 24h · CoinGecko`, color: btc.cambio24h >= 0 ? "text-emerald-300" : "text-red-300" });
      }
      if (apuesta) {
        filas.push({ tipo: "stat", etiqueta: "BOLETA ACTIVA", valor: `${apuesta.monto} ${MON} → ${apuesta.direccion.toUpperCase()}`, detalle: `desde $${apuesta.precio.toLocaleString("en-US")} · resolución en ${restante} s`, color: "text-amber-300" });
        if (restante === 0) filas.push({ tipo: "accion", etiqueta: "RESOLVER BOLETA AHORA", accion: "resolver" });
      } else {
        filas.push({ tipo: "accion", etiqueta: "APOSTAR 10 A QUE BTC SUBE", accion: "apostar:sube:10", nota: "resolución en 60 s con precio real" });
        filas.push({ tipo: "accion", etiqueta: "APOSTAR 10 A QUE BTC BAJA", accion: "apostar:baja:10", nota: "resolución en 60 s con precio real" });
        filas.push({ tipo: "accion", etiqueta: "APOSTAR 25 A QUE BTC SUBE", accion: "apostar:sube:25", nota: "cuota x2" });
      }
      if (!apuesta) {
        for (const h of (estado.historial as string[]).slice(0, 4)) {
          filas.push({ tipo: "lista", titulo: h, items: [{ principal: "BETNACIÓN · resolución automática", color: "text-amber-300" }] });
        }
      }
      filas.push({ tipo: "stat", etiqueta: "TUS BOLETAS", valor: `${estado.ganadas} ganadas / ${estado.perdidas} perdidas`, color: "text-amber-300" });
      return filas;
    }

    case "arcade": {
      return [
        { tipo: "stat", etiqueta: "RÉCORD LOCAL", valor: `${estado.record} puntos`, detalle: `${estado.partidas} partidas jugadas`, color: "text-red-300" },
      ];
    }

    case "ganancias": {
      const reclamadas = (estado.reclamadas as string[]) ?? [];
      const misiones: { id: string; nombre: string; cond: boolean; detalle: string; mon: number }[] = [
        { id: "explorador", nombre: "EXPLORADOR", cond: ctx.salasVisitadas >= 5, detalle: `Visita 5 salas distintas (${Math.min(ctx.salasVisitadas, 5)}/5)`, mon: 15 },
        { id: "curador", nombre: "CURADOR", cond: ctx.likesDados >= 3, detalle: `Da 3 likes en el feed (${Math.min(ctx.likesDados, 3)}/3)`, mon: 10 },
        { id: "gladiador", nombre: "GLADIADOR", cond: ctx.partidasJugadas >= 1, detalle: "Juega una partida en cualquier sala de juego", mon: 20 },
        { id: "racha", nombre: "CONSTANTE", cond: ctx.racha >= 3, detalle: `Mantén una racha de 3 días (hoy: ${ctx.racha})`, mon: 25 },
      ];
      return [
        { tipo: "stat", etiqueta: "RACHA ACTUAL", valor: `${ctx.racha} día${ctx.racha === 1 ? "" : "s"}`, detalle: "Entra cada día para no romperla", color: "text-amber-300" },
        { tipo: "stat", etiqueta: "SALDO", valor: `${ctx.mon} ${MON}`, color: "text-emerald-300" },
        ...misiones.map((m) =>
          reclamadas.includes(m.id)
            ? ({ tipo: "lista" as const, titulo: `✓ ${m.nombre} — COBRADA`, items: [{ principal: m.detalle, color: "text-emerald-300" }] })
            : ({ tipo: "accion" as const, etiqueta: `MISIÓN: ${m.nombre} (+${m.mon} ${MON})`, accion: `reclamar:${m.id}`, nota: m.cond ? "¡lista para cobrar!" : m.detalle })
        ),
        { tipo: "texto", titulo: "CÓMO FUNCIONA", cuerpo: "El Centro de Ganancias paga por los mismos comportamientos que alimentan al algoritmo: explorar, reaccionar, jugar y volver. Tu racha se rompe si faltas 48 horas; la red premia la constancia, no la intensidad." },
      ];
    }

    case "ojodios": {
      const FRENTES = [
        { nombre: "ESTRECHO DE ORMUZ", intensidad: 72, nota: "Tráfico naval tensionado; tres portaaviones en la zona." },
        { nombre: "DONBAS ORIENTAL", intensidad: 85, nota: "Artillería pesada activa; frente estático con bajas diarias." },
        { nombre: "MAR DE CHINA MERIDIONAL", intensidad: 64, nota: "Incidentes de escolta cerca de arrecifes reclamados." },
        { nombre: "SAHEL", intensidad: 58, nota: "Columnas irregulares; golpes de estado en cadena." },
      ];
      const idx = (estado.frenteIdx as number) % FRENTES.length;
      const frente = FRENTES[idx];
      return [
        { tipo: "progreso", etiqueta: `INTENSIDAD · ${frente.nombre}`, valor: frente.intensidad, detalle: frente.nota, color: frente.intensidad > 70 ? "text-red-400" : "text-amber-300" },
        ...FRENTES.map((f, i) => ({ tipo: "accion" as const, etiqueta: `VOLAR AL FRENTE: ${f.nombre}`, accion: `volar:${i}`, nota: i === idx ? "◄ vista actual" : `intensidad ${f.intensidad}` })),
        { tipo: "texto", titulo: "LA VISIÓN OMNISCIENTE", cuerpo: "El Ojo de Dios agrega señales de todas las salas de la red sobre un solo mapa mental de tensión. No predice: ordena. La lectura correcta del presente es la única ventaja real." },
      ];
    }

    case "mente": {
      const pensamientos = [
        `Has explorado ${ctx.salasExploradas} de ${ctx.totalSalas} salas. ${ctx.salasExploradas < 8 ? "El algoritmo te está mostrando novedad pura porque aún no tiene hábitos que leer." : `Tu categoría dominante es clara; espera más de eso en el feed.`}`,
        `Tu rango actual es ${ctx.rangoNombre} con ${ctx.xp} XP. Cada sala nueva da +8 XP: la exploración es el camino corto de rango.`,
        ctx.likesDados >= 3
          ? `Ya diste ${ctx.likesDados} likes: la afinidad de tu feed se está endureciendo. Buen momento para un «no me interesa» que lo afine más.`
          : "Dale likes a lo que te guste: el feed aprende 3 veces más rápido de un like que de una vista.",
        ctx.racha > 1
          ? `Racha de ${ctx.racha} días. El algoritmo premia la constancia con exploración fresca cada mañana.`
          : "Sin racha activa todavía: entra mañana y empieza la cadena. El bonus diario paga 5 mon ◉ solo por aparecer.",
        "El algoritmo no vende tu atención a nadie: todas las señales viven en tu dispositivo. El feed es tuyo, literal.",
      ];
      const idx = (estado.pensamientoIdx as number) % pensamientos.length;
      return [
        { tipo: "texto", titulo: "PENSAMIENTO ACTUAL", cuerpo: pensamientos[idx] },
        { tipo: "accion", etiqueta: "HACER GIRAR LA MENTE", accion: "pensar", nota: "otra reflexión del cerebro central" },
        { tipo: "stat", etiqueta: "SEÑALES RECOGIDAS", valor: `${ctx.salasVisitadas} salas · ${ctx.likesDados} likes`, color: "text-violet-300" },
      ];
    }

    // ═══════════ ARCHIVO ═══════════
    case "redmundial": return filasRedMundial();
    case "biblioteca": return filasBiblioteca();
    case "rostros": return filasRostros();
    case "espectro": return filasEspectro();
    case "carteles": return filasCarteles();

    default:
      return [{ tipo: "texto", titulo: sala.nombre, cuerpo: sala.descripcion }];
  }
}
