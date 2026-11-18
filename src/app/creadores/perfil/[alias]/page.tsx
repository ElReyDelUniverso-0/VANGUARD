import type { Metadata } from "next";
import { PerfilCreador } from "@/components/creadores/perfil";

export async function generateMetadata({ params }: { params: Promise<{ alias: string }> }): Promise<Metadata> {
  const { alias } = await params;
  const a = alias.toUpperCase().replace(/[^A-Z0-9_]/g, "").slice(0, 16);
  return { title: `${a} · Creador en La Forja`, robots: { index: false, follow: true } };
}

export default async function PerfilCreadorPage({ params }: { params: Promise<{ alias: string }> }) {
  const { alias } = await params;
  return (
    <main className="min-h-screen bg-[#06080c]">
      <PerfilCreador alias={alias.toUpperCase().replace(/[^A-Z0-9_]/g, "").slice(0, 16)} />
    </main>
  );
}
