// ═══════════════════════════════════════════════════════════════════
// v442.0 · /simbolos — LA SALA DE LOS SÍMBOLOS
// La casa decorada con sus signos y los signos con vida: chispas de «?»
// en lo que nunca se ha entrado, el signo de la ira donde queda una tarea
// a medias, y temblor, energía, cambio de posición y ojos que miran a los
// lados cuando al módulo le pasa algo.
// ═══════════════════════════════════════════════════════════════════
import type { Metadata } from "next";
import { PortadaSala } from "@/components/vanguard/portada-sala";
import { SalaSimbolos } from "@/components/vanguard/sala-simbolos";

export const metadata: Metadata = {
  title: "La sala de los símbolos — los signos vivos de Vanguard",
  description:
    "Los símbolos únicos de Vanguard y su vida: chispas de interrogación en las salas que nunca has entrado, el signo de la ira donde dejaste una tarea a medias, y temblor, energía y ojos que miran a los lados cuando un módulo despierta.",
  alternates: { canonical: "/simbolos" },
};

export default function SimbolosPage() {
  return (
    <main className="min-h-screen bg-[#05060b] text-foreground">
      <PortadaSala
        ruta="/simbolos"
        imagen="/imagenes-reales/control.jpg"
        alt="Centralita oscura con luces rojas y notas sobre la mesa, como la sala de mando de los símbolos"
        volanta="IDENTIDAD · LOS SIGNOS DE LA CASA"
        titulo="La sala de los símbolos"
        sumario="Cada módulo y cada sala tiene un signo propio, dibujado por código y único. Y el signo vive: respira, echa chispas de interrogación, echa el signo de la ira o despierta con energía y con los ojos mirando a los lados."
        puntos={[
          { titulo: "Chispas de «?»", texto: "Lo que nunca has entrado — o lo que acaba de actualizarse — pregunta con signos de interrogación que saltan alrededor del signo." },
          { titulo: "El signo de la ira", texto: "Si dejaste una tarea empezada dentro de un módulo, su signo tiembla, se tiñe de rojo y echa el rayo de la ira." },
          { titulo: "Fuego importante", texto: "Cuando la casa tiene algo que decir, el signo tiembla suave, echa un anillo de energía, cambia de posición y los ojos de Vanguard miran a los lados." },
          { titulo: "Calma", texto: "Y cuando no pasa nada, el signo respira: lento, quieto, sin ruido. Hasta que vuelva a pasar algo." },
        ]}
        anclas={[
          { etiqueta: "El gran ojo", href: "#simbolos-gran-ojo" },
          { etiqueta: "Los cuatro humores", href: "#simbolos-estados" },
        ]}
        acento="#FFC94D"
        nota="Los signos los dibuja el código en el momento (cero imágenes, cero fuentes de iconos). Su humor sale de la casa real: tus visitas, tus retos del día y el pulso de Vanguard."
      />
      <SalaSimbolos />
    </main>
  );
}
