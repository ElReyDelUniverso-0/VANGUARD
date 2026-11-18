import type { Metadata } from "next";
import { Obra } from "@/components/creadores/obra";

// noindex mientras la base de producción no sea permanente: una obra puede
// desaparecer al reiniciarse el servidor y Google no debe indexar páginas que mueren.
export const metadata: Metadata = { title: "Obra · La Forja", robots: { index: false, follow: true } };

export default async function ObraPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <main className="min-h-screen bg-[#06080c]">
      <Obra id={id.slice(0, 40)} />
    </main>
  );
}
