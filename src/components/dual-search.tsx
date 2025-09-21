"use client";

import { MapPin, Search } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

type DualSearchProps = {
  /** Style du composant : "hero" pour la page d'accueil, "sticky" pour la barre fixe */
  variant?: "hero" | "sticky";
  /** Classes CSS supplémentaires */
  className?: string;
  /** ID pour l'élément (utile pour l'intersection observer) */
  id?: string;
  /** Callback lors de la soumission du formulaire */
  onSubmit?: (data: { service: string; location: string }) => void;
};

export const DualSearch: React.FC<DualSearchProps> = ({
  variant = "hero",
  className,
  id,
  onSubmit,
}) => {
  const [service, setService] = React.useState("");
  const [location, setLocation] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.({ service, location });
  };

  const isHero = variant === "hero";
  const isSticky = variant === "sticky";

  return (
    <div id={id} className={cn("w-full", className)}>
      <form onSubmit={handleSubmit} className="w-full">
        {/* Layout mobile : vertical stack */}
        <div className="flex flex-col gap-3 sm:hidden">
          {/* Champ service */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              inputMode="search"
              placeholder="Quel service recherchez-vous ?"
              value={service}
              onChange={(e) => setService(e.target.value)}
              className={cn(
                "w-full pl-10 pr-4 rounded-md border text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                isHero && "h-12 bg-white/90 backdrop-blur",
                isSticky && "h-11 bg-white/95"
              )}
            />
          </div>
          
          {/* Champ localisation */}
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              inputMode="text"
              placeholder="Où ?"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={cn(
                "w-full pl-10 pr-4 rounded-md border text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                isHero && "h-12 bg-white/90 backdrop-blur",
                isSticky && "h-11 bg-white/95"
              )}
            />
          </div>
          
          {/* Bouton recherche */}
          <button
            type="submit"
            className={cn(
              "w-full rounded-md bg-primary text-primary-foreground font-medium transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
              isHero && "h-12 text-base",
              isSticky && "h-11 text-sm"
            )}
          >
            Rechercher
          </button>
        </div>

        {/* Layout tablette et desktop : horizontal */}
        <div className="hidden sm:flex items-center gap-2 lg:gap-3">
          {/* Champ service - plus large */}
          <div className="relative flex-1 lg:flex-[2]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              inputMode="search"
              placeholder="Quel service recherchez-vous ?"
              value={service}
              onChange={(e) => setService(e.target.value)}
              className={cn(
                "w-full pl-10 pr-4 rounded-md border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                isHero && "h-14 text-base bg-white/90 backdrop-blur",
                isSticky && "h-12 text-sm bg-white/95"
              )}
            />
          </div>
          
          {/* Champ localisation - plus petit */}
          <div className="relative flex-1 min-w-[200px]">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              inputMode="text"
              placeholder="Ville, code postal..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={cn(
                "w-full pl-10 pr-4 rounded-md border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                isHero && "h-14 text-base bg-white/90 backdrop-blur",
                isSticky && "h-12 text-sm bg-white/95"
              )}
            />
          </div>
          
          {/* Bouton recherche */}
          <button
            type="submit"
            className={cn(
              "rounded-md bg-primary text-primary-foreground font-medium transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 whitespace-nowrap",
              isHero && "h-14 px-8 text-base",
              isSticky && "h-12 px-6 text-sm"
            )}
          >
            Rechercher
          </button>
        </div>
      </form>
      
      {/* Suggestions */}
      <div className={cn(
        "mt-2 text-muted-foreground text-left w-full",
        isHero && "pl-1 sm:pl-2 text-xs sm:text-sm",
        isSticky && "pl-1 sm:pl-2 text-xs"
      )}>
        <span className="hidden sm:inline">Suggestions: </span>
        <span className="sm:hidden">Ex: </span>
        plombier, électricien, photographe, coach sportif…
      </div>
    </div>
  );
};
