// ============================================================
// v402.6 LOS NUEVE MÓDULOS — LA PORTADA DEL MÓDULO (/modulo/[id])
// Cada módulo tiene su propia portada con el uniforme de la casa: héroe de
// PortadaSala, sus salas como tarjetas (HubModulo) y la puerta a los demás
// módulos. No hay contenido nuevo: solo las salas que ya existían, a la vista.
// ============================================================
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PortadaSala } from "@/components/vanguard/portada-sala";
import { HubModulo } from "@/components/portada/hub-modulo";
import { ModulosRejilla } from "@/components/portada/modulos-rejilla";
import { MODULOS, MODULOS_PUBLICOS } from "@/components/portada/modulos";

export const dynamicParams = false;

export function generateStaticParams() {
  return MODULOS.map((m) => ({ id: m.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const m = MODULOS.find((x) => x.id === id);
  if (!m) return {};
  const salas = m.pestanas.map((p) => p.label).join(", ");
  return {
    title: `${m.nombre} — ${m.lema}`,
    description: `${m.gancho} Salas: ${salas}.`,
    alternates: { canonical: `/modulo/${m.id}` },
    openGraph: { title: `${m.nombre} · VANGUARD`, description: m.gancho, images: [m.img] },
  };
}

export default async function PortadaModulo({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const m = MODULOS.find((x) => x.id === id);
  if (!m) notFound();
  const n = MODULOS_PUBLICOS.findIndex((x) => x.id === m.id) + 1;
  const vivos = m.pestanas.filter((p) => p.vivo).length;
  const primera = m.pestanas[0];

  return (
    <main className="vx vx-modulo">
      <PortadaSala
        imagen={m.img}
        alt={`Ilustración del módulo ${m.nombre} de Vanguard`}
        volanta={n > 0 ? `Módulo ${String(n).padStart(2, "0")} de ${MODULOS_PUBLICOS.length}` : "Módulo de la casa"}
        titulo={m.nombre}
        sumario={`${m.lema}. ${m.gancho}`}
        cifras={[
          { valor: m.pestanas.length, etiqueta: "Salas", nota: "en este módulo" },
          ...(vivos > 0 ? [{ valor: vivos, etiqueta: "En vivo", nota: "se actualizan solas" }] : []),
          { valor: MODULOS_PUBLICOS.length, etiqueta: "Módulos", nota: "en toda la casa" },
        ]}
      />

      <div className="vx-wrap vx-modulo-cta">
        <Link href={primera.href} className="vx-btn">
          Entrar a {primera.label} <span aria-hidden>→</span>
        </Link>
        <Link href="/modulos" className="vx-btn vx-btn-sec">
          Ver todos los módulos
        </Link>
      </div>

      <HubModulo modulo={m.id} titulo={`Las salas de ${m.nombre}`} sello={`Módulo · ${m.nombre} · ${m.pestanas.length} salas`} />

      <section className="vx-sec" aria-label="Otros módulos">
        <div className="vx-wrap">
          <div className="vx-sec-h">
            <div>
              <span className="vx-sello">Sigue explorando</span>
              <h2>Otros módulos de Vanguard</h2>
            </div>
          </div>
          <ModulosRejilla excepto={m.id} compacta />
        </div>
      </section>
    </main>
  );
}
