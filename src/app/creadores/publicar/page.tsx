import type { Metadata } from "next";
import { Suspense } from "react";
import { Publicar } from "@/components/creadores/publicar";

export const metadata: Metadata = {
  title: "Publicar en La Forja",
  robots: { index: false, follow: true },
  alternates: { canonical: "/creadores/publicar" },
};

export default function PublicarPage() {
  return (
    <main className="min-h-screen bg-[#06080c]">
      <Suspense fallback={null}>
        <Publicar />
      </Suspense>
    </main>
  );
}
