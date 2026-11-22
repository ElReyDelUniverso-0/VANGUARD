"use client";

// ═══════════════════════════════════════════════════════════════════
// v442.0 · LA FRANJA DE LOS SÍMBOLOS (portada)
// Los cuatro módulos de la casa con su signo único y VIVO: cada signo
// respira, echa chispas de «?» si nunca entraste, echa el signo de la
// ira si dejó una tarea a medias, o despierta con energía y con los
// ojos mirando a los lados cuando la casa tiene algo que decir.
// ═══════════════════════════════════════════════════════════════════

import Link from "next/link";
import { MODULOS_PUBLICOS, entradaDe } from "./modulos";
import { SigiloVivo, useEstadoVivo } from "@/components/vanguard/simbolos-vivos";
import { useT } from "@/lib/i18n";

function SignoModulo({ id, nombre, href }: { id: string; nombre: string; href: string }) {
  const estado = useEstadoVivo(id);
  const { t } = useT();
  return (
    <Link href={href} className="vxp-signo" data-estado={estado}>
      <SigiloVivo id={id} tam={46} />
      <b>{nombre}</b>
      <em>{t(`simbolos.estado.${estado}`)}</em>
    </Link>
  );
}

export function SignosPortada() {
  const { t } = useT();
  return (
    <section id="simbolos" className="vx-sec vxp-ancla" aria-label={t("simbolos.portada.titulo")}>
      <div className="vx-sec-h">
        <div>
          <span className="vx-sello">{t("simbolos.sello")}</span>
          <h2>{t("simbolos.portada.titulo")}</h2>
          <p>{t("simbolos.portada.sub")}</p>
        </div>
        <Link href="/simbolos">{t("simbolos.portada.cta")} →</Link>
      </div>
      <div className="vxp-signos">
        {MODULOS_PUBLICOS.map((m) => (
          <SignoModulo key={m.id} id={m.id} nombre={m.corto} href={entradaDe(m)} />
        ))}
      </div>
    </section>
  );
}
