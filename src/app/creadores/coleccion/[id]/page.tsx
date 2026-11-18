import type { Metadata } from "next";
import { Coleccion } from "@/components/creadores/coleccion";

export const metadata: Metadata = { title: "Colección · La Forja", robots: { index: false, follow: true } };

export default async function ColeccionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <main className="min-h-screen bg-[#06080c]">
      <Coleccion id={id.slice(0, 20)} />
    </main>
  );
}
