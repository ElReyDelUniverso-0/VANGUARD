// ═══════════════════════════════════════════════════════════════════
// v444.0 · /mundo-muerto — EL MUNDO MUERTO
// Un esqueleto humano completo en 3D (238 huesos con nombre anatómico)
// donde cada región guarda un módulo crudo sobre lo que mata: trata de
// personas, rutas de órganos, depredadores, pena de muerte, periodistas
// asesinados, sobredosis, suicidio, trabajo, feminicidios, aire tóxico,
// muerte materna, carreteras y migrantes. Cifras reales con fuente.
// Estática: el Worker no renderiza nada en cada visita.
// ═══════════════════════════════════════════════════════════════════
import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/site";
import { MODULOS, modulosLigeros } from "@/lib/mundo-muerto/modulos";
import { Esqueleto3D } from "@/components/mundo-muerto/esqueleto-3d";
import { RelojMuerte } from "@/components/mundo-muerto/reloj-muerte";
import "@/components/mundo-muerto/mundo-muerto.css";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "El Mundo Muerto: el esqueleto de lo que nos mata | VANGUARD",
  description:
    "Un esqueleto humano en 3D con trece módulos repartidos por sus huesos: trata de personas, rutas de órganos, depredadores y registros públicos, pena de muerte, periodistas asesinados, sobredosis, suicidio, muertes en el trabajo, feminicidios, aire tóxico, muerte materna, carreteras y migrantes. Cifras reales, cada una con su fuente.",
  alternates: { canonical: `${SITE_URL}/mundo-muerto` },
  openGraph: {
    title: "El Mundo Muerto · VANGUARD",
    description: "Trece módulos crudos dentro de un esqueleto en 3D. Cifras reales de muerte, con su fuente.",
    url: `${SITE_URL}/mundo-muerto`,
    images: [{ url: `${SITE_URL}/imagenes-reales/mundo-muerto.jpg` }],
  },
};

export default function MundoMuertoPage() {
  const ligeros = modulosLigeros();
  const celdas = MODULOS.filter((m) => (m.anual ?? 0) >= 50000)
    .sort((a, b) => (b.anual ?? 0) - (a.anual ?? 0))
    .map((m) => ({ id: m.id, nombre: m.nombre, color: m.color, anual: m.anual! }));

  return (
    <main className="mm">
      <div className="mm-caja">
        <nav className="mm-migas" aria-label="Migas">
          <Link href="/">Vanguard</Link>
          <span>·</span>
          <span>El Mundo Muerto</span>
        </nav>

        <header>
          <p className="mm-volanta">El Mundo Muerto · 13 módulos crudos</p>
          <h1 className="mm-titulo">
            El esqueleto de <em>lo que nos mata</em>
          </h1>
          <p className="mm-sub">
            Un esqueleto humano completo, hueso a hueso. En cada región vive un módulo sobre una forma de morir que el mundo prefiere no mirar: la trata,
            las rutas de órganos, los depredadores, el patíbulo, la carretera, el mar. Gíralo, toca un hueso y entra. Todas las cifras son reales y llevan su
            fuente; lo que una cifra no mide, se dice.
          </p>
          <p className="mm-aviso">
            <b>Contenido duro.</b> Cifras de muerte, sin imágenes de víctimas. Si necesitas ayuda ahora: 9-1-1.
          </p>
        </header>

        <Esqueleto3D modulos={ligeros} />

        <section className="mm-reloj" aria-labelledby="mm-reloj-t">
          <h2 id="mm-reloj-t">Desde que entraste al esqueleto</h2>
          <p>
            El ritmo medio que dan las fuentes: la cifra anual repartida en los segundos del año. No es un contador en vivo de muertes reales, porque nadie
            lo tiene; es lo que esas cifras significan mientras lees.
          </p>
          <RelojMuerte celdas={celdas} />
        </section>

        <section className="mm-seccion" aria-labelledby="mm-lamina-t">
          <h2 id="mm-lamina-t">La lámina: un módulo por hueso</h2>
          <p className="mm-nota">De la cabeza a los pies, en el orden del cuerpo.</p>
          <div className="mm-lamina">
            {MODULOS.map((m, i) => (
              <Link key={m.id} href={`/mundo-muerto/${m.id}`} className="mm-tarjeta" style={{ "--c": m.color } as React.CSSProperties}>
                <span className="mm-tarjeta-n">{String(i + 1).padStart(2, "0")}</span>
                <p className="mm-tarjeta-hueso">{m.hueso}</p>
                <h3>{m.nombre}</h3>
                <p className="mm-tarjeta-cifra">{m.cifra}</p>
                <p className="mm-tarjeta-unidad">{m.unidad}</p>
              </Link>
            ))}
          </div>
        </section>

        <footer className="mm-pie">
          <p>
            <b>Cómo está hecho.</b> El esqueleto es el modelo «Full adult skeleton, standing» de Innerscene, de dominio público (CC0): 238 huesos con su nombre
            anatómico, comprimido para la web (≈2,5 MB). Cada hueso pertenece a una región, y cada región a un módulo. Las cifras salen de la OMS, la OIT, la
            OIM, la UNODC, ONU Mujeres, Amnistía Internacional, el CPJ, NCMEC y otras fuentes citadas en cada ficha, revisadas el 14 de noviembre de 2026.
          </p>
          <p>
            «Depredadores cerca» no publica nombres ni direcciones: remite a los registros oficiales que existen y a sus condiciones de uso. Usar esos datos
            para acosar a alguien es delito.
          </p>
        </footer>
      </div>
    </main>
  );
}
