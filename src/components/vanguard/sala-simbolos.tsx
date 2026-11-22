"use client";

// ═══════════════════════════════════════════════════════════════════
// v442.0 · LA SALA DE LOS SÍMBOLOS (/simbolos)
//
// La casa decorada con sus signos y los signos con vida. Aquí se ven:
//   ① el gran ojo de Vanguard, vivo;
//   ② los cuatro módulos, con el humor que les da la casa;
//   ③ las salas, cada una con su PROPIO signo (la fábrica de signos lo
//      compone desde el href: dos salas nunca comparten signo);
//   ④ los cuatro humores, provocados a mano para que se entienda el
//      lenguaje de un solo vistazo.
// ═══════════════════════════════════════════════════════════════════

import Link from "next/link";
import { MODULOS_PUBLICOS, entradaDe } from "@/components/portada/modulos";
import { SigiloVivo, SimboloVivo, useEstadoVivo } from "./simbolos-vivos";
import { ESTADOS_VIDA, type EstadoVida } from "@/lib/simbolos-vivos/modelo";
import { useT } from "@/lib/i18n";

const SALAS_MUESTRA = [
  "/en-vivo",
  "/cronica",
  "/mundo",
  "/mapas",
  "/conocimiento",
  "/lingua",
  "/motores",
  "/zona-cero",
  "/cuaderno",
  "/mercado",
  "/rostros",
  "/guerra-hoy",
];

function FichaViva({ id, nombre, href }: { id: string; nombre: string; href?: string }) {
  const estado = useEstadoVivo(id);
  const { t } = useT();
  const cuerpo = (
    <>
      <SigiloVivo id={id} tam={40} />
      <b>{nombre}</b>
      <em>{t(`simbolos.estado.${estado}`)}</em>
    </>
  );
  if (!href) return <div className="vxs-ficha" data-estado={estado}>{cuerpo}</div>;
  return (
    <Link href={href} className="vxs-ficha" data-estado={estado}>
      {cuerpo}
    </Link>
  );
}

export function SalaSimbolos() {
  const { t } = useT();
  const granOjo = useEstadoVivo("vanguard");

  return (
    <div className="vx-wrap">
      {/* ① el gran ojo */}
      <section className="vxs-cab" id="simbolos-gran-ojo" aria-label={t("simbolos.granojo")}>
        <span className="vx-sello">{t("simbolos.sello")}</span>
        <h1>{t("simbolos.titulo")}</h1>
        <p>{t("simbolos.sumario")}</p>
        <div className="vxs-estados" style={{ gridTemplateColumns: "auto 1fr", alignItems: "center", maxWidth: 560 }}>
          <SimboloVivo id="vanguard" tam={120} estado={granOjo} />
          <p style={{ textAlign: "left" }}>
            {t("simbolos.granojoTxt", { estado: t(`simbolos.estado.${granOjo}`) })}
          </p>
        </div>
      </section>

      {/* ② los cuatro módulos, vivos */}
      <section aria-label={t("simbolos.modulos")} style={{ paddingTop: 26 }}>
        <h2 style={{ fontFamily: "var(--vx-marca)", fontSize: 13, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--vx-gold)" }}>
          {t("simbolos.modulos")}
        </h2>
        <div className="vxs-rejilla">
          {MODULOS_PUBLICOS.map((m) => (
            <FichaViva key={m.id} id={m.id} nombre={m.corto} href={entradaDe(m)} />
          ))}
        </div>
      </section>

      {/* ③ las salas, cada una con su signo */}
      <section aria-label={t("simbolos.salas")} style={{ paddingTop: 26 }}>
        <h2 style={{ fontFamily: "var(--vx-marca)", fontSize: 13, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--vx-gold)" }}>
          {t("simbolos.salas")}
        </h2>
        <div className="vxs-rejilla">
          {SALAS_MUESTRA.map((href) => (
            <FichaViva key={href} id={href} nombre={href.replace(/^\//, "").replaceAll("/", " · ") || "portada"} href={href} />
          ))}
        </div>
      </section>

      {/* ④ los cuatro humores, provocados */}
      <section id="simbolos-estados" aria-label={t("simbolos.estados")} style={{ paddingTop: 26 }}>
        <h2 style={{ fontFamily: "var(--vx-marca)", fontSize: 13, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--vx-gold)" }}>
          {t("simbolos.estados")}
        </h2>
        <div className="vxs-estados">
          {ESTADOS_VIDA.map((e: EstadoVida) => (
            <div key={e} className="vxs-estado" data-estado={e}>
              <SimboloVivo id="vanguard" tam={54} estado={e} />
              <b>{t(`simbolos.estado.${e}`)}</b>
              <p>{t(`simbolos.estado.${e}Txt`)}</p>
            </div>
          ))}
        </div>
      </section>

      <p className="vxs-cab" style={{ paddingBottom: 40 }}>
        <Link href="/orden" style={{ color: "var(--vx-gold)" }}>
          ← {t("simbolos.volver")}
        </Link>
      </p>
    </div>
  );
}
