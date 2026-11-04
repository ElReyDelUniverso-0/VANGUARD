// v236.0 EL GLOSARIO — LA FUENTE ÚNICA del glosario táctico de emergencia.
// Nació enterrado dentro de /api/traductor (v94.0) como el «vía 3»: si el
// núcleo IA alguna vez queda sin conexión, el traductor NUNCA calla —
// sustituye los términos geopolíticos es↔en con este inventario local y
// lo declara con la nota «Traducido con el glosario táctico local».
//
// v236.0 lo saca a la luz (patrón v233 LA BALANZA: la maquinaria
// editorial se muestra y se discute): la página /traductor lo renderiza
// COMPLETO desde esta única fuente — la API y la vitrina leen el MISMO
// objeto, cero divergencias, cero conteo escrito a mano.
//
// Dirección: la clave es el término ES, el valor su traducción EN.
// viaGlosario() lo recorre del término más largo al más corto para no
// partir compuestos («alto el fuego» antes que «fuego»).

export const GLOSARIO_TACTICO: Record<string, string> = {
  "alto el fuego": "ceasefire", "alto al fuego": "ceasefire", guerra: "war", paz: "peace",
  frontera: "border", frente: "front", batalla: "battle", ejército: "army",
  flota: "fleet", submarino: "submarine", portaviones: "aircraft carrier",
  misil: "missile", misiles: "missiles", dron: "drone", drones: "drones",
  sanción: "sanction", sanciones: "sanctions", embargo: "embargo",
  refugiados: "refugees", refugiado: "refugee", evacuación: "evacuation",
  negociación: "negotiation", tratado: "treaty", cumbre: "summit",
  espionaje: "espionage", inteligencia: "intelligence", satélite: "satellite",
  petróleo: "oil", trigo: "wheat", grano: "grain",
  convoy: "convoy", ataque: "attack", defensa: "defense", aliado: "ally",
  aliados: "allies", diplomacia: "diplomacy", embajada: "embassy",
  estrecho: "strait", canal: "canal", puerto: "port",
  seguridad: "security", amenaza: "threat", crisis: "crisis", conflicto: "conflict",
  operador: "operator", comandante: "commandant", informes: "reports",
  "armas nucleares": "nuclear weapons", nuclear: "nuclear",
};

/** Los pares es→en en el orden del inventario (la vitrina los muestra tal cual). */
export function paresGlosario(): { es: string; en: string }[] {
  return Object.entries(GLOSARIO_TACTICO).map(([es, en]) => ({ es, en }));
}
