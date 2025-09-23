"use client";

import { ArrowRight } from "lucide-react";
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
  const [showAll] = React.useState(variant === "all");
  const [openSectorKey, setOpenSectorKey] = React.useState<string | null>(null);

  const popularSectors = React.useMemo(() => sectors.slice(0, 4), [sectors]);

  // Variantes de couleurs pour l'effet glass (ultra sophistiqué avec opacités variables)
  const glassBase =
    "relative isolate overflow-hidden backdrop-blur-2xl backdrop-saturate-200 supports-[backdrop-filter]:bg-white/8 bg-white/15 border border-white/30 ring-1 ring-inset ring-white/20 shadow-[0_10px_40px_rgba(0,0,0,0.15)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.25)] transition-all duration-500 hover:-translate-y-1 hover:scale-[1.02] before:absolute before:inset-0 before:rounded-[inherit] before:bg-gradient-to-br before:from-white/60 before:via-white/20 before:to-transparent before:opacity-30 before:content-[''] after:pointer-events-none after:absolute after:top-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-transparent after:via-white/70 after:to-transparent after:opacity-80 after:content-['']";
  const colorVariants = [
    "bg-gradient-to-br from-indigo-500/8 to-sky-500/12 border-indigo-400/40 hover:from-indigo-500/12 hover:to-sky-500/16",
    "bg-gradient-to-br from-rose-500/8 to-orange-500/12 border-rose-400/40 hover:from-rose-500/12 hover:to-orange-500/16",
    "bg-gradient-to-br from-emerald-500/8 to-lime-500/12 border-emerald-400/40 hover:from-emerald-500/12 hover:to-lime-500/16",
    "bg-gradient-to-br from-amber-500/8 to-pink-500/12 border-amber-400/40 hover:from-amber-500/12 hover:to-pink-500/16",
    "bg-gradient-to-br from-fuchsia-500/8 to-purple-500/12 border-fuchsia-400/40 hover:from-fuchsia-500/12 hover:to-purple-500/16",
    "bg-gradient-to-br from-sky-500/8 to-cyan-500/12 border-sky-400/40 hover:from-sky-500/12 hover:to-cyan-500/16",
  ];

  // const handleDiscoverAll = () => {
  //   setShowAll(true);
  //   // Scroll doux vers la grille complète
  //   const el = document.getElementById("all-categories-grid");
  //   el?.scrollIntoView({ behavior: "smooth", block: "start" });
  // };

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
                  <ul className="text-sm text-[#262E40] space-y-1 font-inter">
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
            <Button
              asChild
              variant="ghost"
              className="rounded-full group relative isolate overflow-hidden h-12 sm:h-14 px-6 sm:px-10 text-base sm:text-lg backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-white/15 bg-white/20 border border-white/20 ring-1 ring-inset ring-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.18)] transition-all duration-300 before:absolute before:inset-0 before:rounded-[inherit] before:bg-gradient-to-br before:from-white/70 before:to-transparent before:opacity-20 before:content-['']"
            >
              <a
                href="/services"
                className="inline-flex items-center gap-2 pr-6 transition-all duration-200 group-hover:pr-8"
              >
                <span>Découvrir tous nos services</span>
                <span className="inline-flex w-0 overflow-hidden transition-[width] duration-200 ease-out group-hover:w-5">
                  <ArrowRight
                    aria-hidden
                    className="size-5 -translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
                  />
                </span>
              </a>
            </Button>
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
                      <ul className="text-sm text-[#262E40] space-y-1 font-inter">
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
                  className="rounded-md border p-3 text-sm hover:bg-muted/50 cursor-pointer font-inter text-[#262E40]"
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
