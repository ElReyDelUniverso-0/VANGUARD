import type { Metadata } from "next";
import { Moderacion } from "@/components/creadores/moderacion";

export const metadata: Metadata = { title: "Moderación · La Forja", robots: { index: false, follow: false } };

export default function ModeracionPage() {
  return (
    <main className="min-h-screen bg-[#06080c]">
      <Moderacion />
    </main>
  );
}
