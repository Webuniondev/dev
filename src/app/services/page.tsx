import type { Metadata } from "next";

import { SiteHeader } from "@/components/site-header";
import CategoriesBrowserServer from "@/components/categories-browser-server";

export const metadata: Metadata = {
  title: "Tous nos services – Ourspace",
  description: "Parcourez toutes les catégories de services, organisées par secteur.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <div className="min-h-dvh flex flex-col">
      <SiteHeader />
      <main className="flex-1 bg-white">
        <section className="bg-white">
          <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 py-6 sm:py-8">
            <h1 className="font-caveat text-4xl sm:text-5xl font-bold tracking-tight text-center">
              Tous nos services
            </h1>
            <p className="mt-2 text-center text-muted-foreground">
              Retrouvez l’ensemble des catégories, classées par secteur.
            </p>
          </div>
        </section>
        {/* Grille complète (toutes les catégories) */}
        <CategoriesBrowserServer variant="all" showHeading={false} padding="compact" />
      </main>
    </div>
  );
}
