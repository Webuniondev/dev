"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export type Category = {
  key: string;
  label: string;
  description?: string | null;
};

export type SectorWithCategories = {
  key: string;
  label: string;
  description?: string | null;
  categories: Category[];
};

type Props = {
  sectors: SectorWithCategories[];
  variant?: "home" | "all"; // home: populaires + bouton; all: toutes les catégories directement
  showHeading?: boolean;
  padding?: "normal" | "compact"; // contrôle vertical container
};

export const CategoriesBrowser: React.FC<Props> = ({
  sectors,
  variant = "home",
  showHeading = true,
  padding = "normal",
}) => {
  const [showAll, setShowAll] = React.useState(variant === "all");
  const [openSectorKey, setOpenSectorKey] = React.useState<string | null>(null);

  const popularSectors = React.useMemo(() => sectors.slice(0, 4), [sectors]);

  // Variantes de couleurs pour l'effet glass
  const glassBase =
    "backdrop-blur-md supports-[backdrop-filter]:bg-white/30 bg-white/20 border shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5";
  const colorVariants = [
    "bg-gradient-to-br from-indigo-500/10 to-sky-500/10 border-indigo-400/30",
    "bg-gradient-to-br from-rose-500/10 to-orange-500/10 border-rose-400/30",
    "bg-gradient-to-br from-emerald-500/10 to-lime-500/10 border-emerald-400/30",
    "bg-gradient-to-br from-amber-500/10 to-pink-500/10 border-amber-400/30",
    "bg-gradient-to-br from-fuchsia-500/10 to-purple-500/10 border-fuchsia-400/30",
    "bg-gradient-to-br from-sky-500/10 to-cyan-500/10 border-sky-400/30",
  ];

  const handleDiscoverAll = () => {
    setShowAll(true);
    // Scroll doux vers la grille complète
    const el = document.getElementById("all-categories-grid");
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const openDialog = (sectorKey: string) => setOpenSectorKey(sectorKey);
  const closeDialog = () => setOpenSectorKey(null);

  const findSector = (key: string | null) => sectors.find((s) => s.key === key);
  const currentSector = findSector(openSectorKey ?? null);

  const headingId = variant === "home" ? "categories-populaires" : "toutes-categories";

  const containerPadding = padding === "compact" ? "py-6 sm:py-8" : "py-10 sm:py-14";

  return (
    <section aria-labelledby={headingId} className="bg-white">
      <div className={`container mx-auto max-w-screen-xl px-4 sm:px-6 ${containerPadding}`}>
        {showHeading ? (
          <h2
            id={headingId}
            className="font-caveat text-3xl sm:text-4xl font-bold tracking-tight text-center"
          >
            <span className="inline-block">
              {variant === "home" ? "Catégories populaires" : "Toutes les catégories"}
              <span aria-hidden className="block mx-auto mt-2 w-1/2">
                <svg className="w-full h-[4px]" viewBox="0 0 100 4" preserveAspectRatio="none">
                  <path
                    d="M0 2 Q 25 0 50 2 T 100 2"
                    stroke="black"
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </span>
          </h2>
        ) : null}

        {/* Populaires: 4 max (uniquement en page d'accueil) */}
        {variant === "home" ? (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {popularSectors.map((sector, idx) => (
              <Card
                key={sector.key}
                className={`h-full ${glassBase} ${colorVariants[idx % colorVariants.length]}`}
              >
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">{sector.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {sector.categories.slice(0, 4).map((cat) => (
                      <li key={cat.key} className="truncate">
                        {cat.label}
                      </li>
                    ))}
                  </ul>
                  {sector.categories.length > 4 ? (
                    <button
                      type="button"
                      className="mt-2 text-xs font-medium text-primary hover:underline"
                      onClick={() => openDialog(sector.key)}
                    >
                      + {sector.categories.length - 4} autres
                    </button>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}

        {/* Bouton Découvrir tous nos services */}
        {variant === "home" ? (
          <div className="mt-6 sm:mt-8 text-center">
            <a href="/services">
              <Button size="lg" asChild>
                <span>Découvrir tous nos services</span>
              </Button>
            </a>
          </div>
        ) : null}

        {/* Toutes les catégories (affichées après clic) */}
        {showAll ? (
          <div id="all-categories-grid" className="mt-10 sm:mt-12">
            <h3 className="sr-only">Toutes les catégories</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {sectors.map((sector, idx) => {
                const extraCount = Math.max(0, sector.categories.length - 4);
                return (
                  <Card
                    key={sector.key}
                    className={`h-full ${glassBase} ${colorVariants[idx % colorVariants.length]}`}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold">{sector.label}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {sector.categories.slice(0, 4).map((cat) => (
                          <li key={cat.key} className="truncate">
                            {cat.label}
                          </li>
                        ))}
                      </ul>
                      {extraCount > 0 ? (
                        <Button
                          variant="ghost"
                          className="mt-3 h-8 px-2 text-xs"
                          onClick={() => openDialog(sector.key)}
                        >
                          + {extraCount} autres
                        </Button>
                      ) : null}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* Dialog shadcn: services d'une catégorie (secteur) */}
        <Dialog open={!!openSectorKey} onOpenChange={(o) => (!o ? closeDialog() : null)}>
          <DialogContent className="max-w-lg sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {currentSector ? `Services — ${currentSector.label}` : "Services"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentSector?.categories.map((cat) => (
                <div
                  key={cat.key}
                  className="rounded-md border p-3 text-sm hover:bg-muted/50 cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onClick={closeDialog}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") closeDialog();
                  }}
                >
                  {cat.label}
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default CategoriesBrowser;
