"use client";

import { MapPin, Search } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";
import { useSecureFetch } from "@/lib/hooks/use-secure-fetch";

type DualSearchProps = {
  /** Style du composant : "hero" pour la page d'accueil, "sticky" pour la barre fixe */
  variant?: "hero" | "sticky";
  /** Classes CSS supplémentaires */
  className?: string;
  /** ID pour l'élément (utile pour l'intersection observer) */
  id?: string;
  /** Callback lors de la soumission du formulaire */
  onSubmit?: (data: {
    service: string;
    location: string;
    sectorKey?: string | null;
    categoryKey?: string | null;
  }) => void;
};

export const DualSearch: React.FC<DualSearchProps> = ({
  variant = "hero",
  className,
  id,
  onSubmit,
}) => {
  const [service, setService] = React.useState("");
  const [location, setLocation] = React.useState("");
  const { secureGet } = useSecureFetch();

  // Chargement paresseux des données nécessaires à l'autocomplétion
  type ServiceSuggestion = { key: string; label: string; sectorLabel?: string | null };
  type SectorSuggestion = { key: string; label: string };
  type LocationSuggestion = { code: string; name: string };

  const [services, setServices] = React.useState<ServiceSuggestion[]>([]);
  const [sectors, setSectors] = React.useState<SectorSuggestion[]>([]);
  const [locations, setLocations] = React.useState<LocationSuggestion[]>([]);
  const [dataLoaded, setDataLoaded] = React.useState(false);
  const [isLoadingData, setIsLoadingData] = React.useState(false);

  const [selectedSectorKey, setSelectedSectorKey] = React.useState<string | null>(null);
  const [selectedCategoryKey, setSelectedCategoryKey] = React.useState<string | null>(null);

  const normalize = (value: string) =>
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "");

  const ensureDataLoaded = React.useCallback(async () => {
    if (dataLoaded || isLoadingData) return;
    try {
      setIsLoadingData(true);
      const [proDataRes, departmentsRes] = await Promise.all([
        secureGet("/api/pro-data"),
        secureGet("/api/departments"),
      ]);
      const proData = await proDataRes.json();
      const departments = await departmentsRes.json();
      const flatServices: ServiceSuggestion[] = (proData?.sectors || []).flatMap(
        (s: { label: string; categories?: Array<{ key: string; label: string }> }) =>
          (s.categories || []).map((c) => ({ key: c.key, label: c.label, sectorLabel: s.label })),
      );
      const sectorList: SectorSuggestion[] = (proData?.sectors || []).map(
        (s: { key: string; label: string }) => ({ key: s.key, label: s.label }),
      );
      const depts: LocationSuggestion[] = (departments?.departments || []).map(
        (d: { code: string; name: string }) => ({ code: d.code, name: d.name }),
      );
      setServices(flatServices);
      setSectors(sectorList);
      setLocations(depts);
      setDataLoaded(true);
    } catch {
      // En cas d'erreur, on laisse les suggestions vides sans bloquer l'UI
      setDataLoaded(true);
    } finally {
      setIsLoadingData(false);
    }
  }, [dataLoaded, isLoadingData, secureGet]);

  // États pour les menus d'autocomplétion
  const [serviceOpen, setServiceOpen] = React.useState(false);
  const [locationOpen, setLocationOpen] = React.useState(false);
  const [serviceActiveIndex, setServiceActiveIndex] = React.useState<number>(-1);
  const [locationActiveIndex, setLocationActiveIndex] = React.useState<number>(-1);

  // Filtrage avec mémoïsation
  const filteredCategories = React.useMemo(() => {
    if (!service) return [] as SectorSuggestion[];
    const q = normalize(service);
    return sectors.filter((s) => normalize(s.label).includes(q)).slice(0, 6);
  }, [service, sectors]);

  const filteredServices = React.useMemo(() => {
    if (!service) return [] as ServiceSuggestion[];
    const q = normalize(service);
    return services.filter((s) => normalize(s.label).includes(q)).slice(0, 8);
  }, [service, services]);

  type CombinedItem =
    | { type: "category"; key: string; label: string }
    | { type: "service"; key: string; label: string; meta?: string };

  const combinedServiceItems: CombinedItem[] = React.useMemo(() => {
    const cats: CombinedItem[] = filteredCategories.map((c) => ({
      type: "category",
      key: c.key,
      label: c.label,
    }));
    const svcs: CombinedItem[] = filteredServices.map((s) => ({
      type: "service",
      key: s.key,
      label: s.label,
      meta: s.sectorLabel ?? undefined,
    }));
    return [...cats, ...svcs];
  }, [filteredCategories, filteredServices]);

  const filteredLocations = React.useMemo(() => {
    if (!location) return [] as LocationSuggestion[];
    const q = normalize(location);
    return locations
      .filter((l) => normalize(l.name).includes(q) || normalize(l.code).includes(q))
      .slice(0, 8);
  }, [location, locations]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.({
      service,
      location,
      sectorKey: selectedSectorKey ?? undefined,
      categoryKey: selectedCategoryKey ?? undefined,
    });
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
              onChange={(e) => {
                setService(e.target.value);
                setServiceOpen(true);
              }}
              onFocus={() => {
                setServiceOpen(true);
                ensureDataLoaded();
              }}
              onBlur={() => setTimeout(() => setServiceOpen(false), 120)}
              aria-autocomplete="list"
              aria-expanded={serviceOpen}
              aria-controls="service-listbox"
              className={cn(
                "w-full pl-10 pr-4 rounded-md border text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                isHero && "h-12 bg-white/90 backdrop-blur",
                isSticky && "h-11 bg-white/95",
              )}
              onKeyDown={(e) => {
                if (!serviceOpen) return;
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setServiceActiveIndex((i) => Math.min(i + 1, combinedServiceItems.length - 1));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setServiceActiveIndex((i) => Math.max(i - 1, 0));
                } else if (e.key === "Enter") {
                  if (serviceActiveIndex >= 0 && combinedServiceItems[serviceActiveIndex]) {
                    e.preventDefault();
                    const item = combinedServiceItems[serviceActiveIndex];
                    setService(item.label);
                    if (item.type === "category") {
                      setSelectedSectorKey(item.key);
                      setSelectedCategoryKey(null);
                    } else {
                      setSelectedCategoryKey(item.key);
                      setSelectedSectorKey(null);
                    }
                    setServiceOpen(false);
                  }
                } else if (e.key === "Escape") {
                  setServiceOpen(false);
                }
              }}
            />
            {serviceOpen && (service || isLoadingData) ? (
              <div
                id="service-listbox"
                role="listbox"
                className="absolute left-0 right-0 top-full mt-1 z-50 max-h-64 overflow-auto rounded-md border bg-white shadow-lg"
              >
                {isLoadingData ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">Chargement…</div>
                ) : combinedServiceItems.length ? (
                  <>
                    {filteredCategories.length ? (
                      <div className="px-3 py-1.5 text-[11px] uppercase tracking-wide bg-slate-50 text-slate-600 border-y dark:bg-slate-900/30 dark:text-slate-300">
                        Catégories
                      </div>
                    ) : null}
                    {filteredCategories.map((c, idx) => (
                      <div
                        key={`cat-${c.key}`}
                        role="option"
                        aria-selected={idx === serviceActiveIndex}
                        className={cn(
                          "px-3 py-2 text-sm cursor-pointer hover:bg-accent",
                          idx === serviceActiveIndex && "bg-accent",
                        )}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setService(c.label);
                          setSelectedSectorKey(c.key);
                          setSelectedCategoryKey(null);
                          setServiceOpen(false);
                        }}
                        onMouseEnter={() => setServiceActiveIndex(idx)}
                      >
                        <span className="font-medium">{c.label}</span>
                      </div>
                    ))}
                    {filteredServices.length ? (
                      <div className="px-3 py-1.5 text-[11px] uppercase tracking-wide bg-slate-50 text-slate-600 border-y dark:bg-slate-900/30 dark:text-slate-300">
                        Services
                      </div>
                    ) : null}
                    {filteredServices.map((s, idx) => {
                      const listIndex = filteredCategories.length + idx;
                      return (
                        <div
                          key={`svc-${s.key}`}
                          role="option"
                          aria-selected={listIndex === serviceActiveIndex}
                          className={cn(
                            "px-3 py-2 text-sm cursor-pointer hover:bg-accent",
                            listIndex === serviceActiveIndex && "bg-accent",
                          )}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setService(s.label);
                            setSelectedCategoryKey(s.key);
                            setSelectedSectorKey(null);
                            setServiceOpen(false);
                          }}
                          onMouseEnter={() => setServiceActiveIndex(listIndex)}
                        >
                          <span className="font-medium">{s.label}</span>
                          {s.sectorLabel ? (
                            <span className="ml-1 text-muted-foreground">— {s.sectorLabel}</span>
                          ) : null}
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <div className="px-3 py-2 text-sm text-muted-foreground">Aucun résultat</div>
                )}
              </div>
            ) : null}
          </div>

          {/* Champ localisation */}
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              inputMode="text"
              placeholder="Où ?"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setLocationOpen(true);
              }}
              onFocus={() => {
                setLocationOpen(true);
                ensureDataLoaded();
              }}
              onBlur={() => setTimeout(() => setLocationOpen(false), 120)}
              aria-autocomplete="list"
              aria-expanded={locationOpen}
              aria-controls="location-listbox"
              className={cn(
                "w-full pl-10 pr-4 rounded-md border text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                isHero && "h-12 bg-white/90 backdrop-blur",
                isSticky && "h-11 bg-white/95",
              )}
              onKeyDown={(e) => {
                if (!locationOpen) return;
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setLocationActiveIndex((i) => Math.min(i + 1, filteredLocations.length - 1));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setLocationActiveIndex((i) => Math.max(i - 1, 0));
                } else if (e.key === "Enter") {
                  if (locationActiveIndex >= 0 && filteredLocations[locationActiveIndex]) {
                    e.preventDefault();
                    const sel = filteredLocations[locationActiveIndex];
                    setLocation(`${sel.name} (${sel.code})`);
                    setLocationOpen(false);
                  }
                } else if (e.key === "Escape") {
                  setLocationOpen(false);
                }
              }}
            />
            {locationOpen && (location || isLoadingData) ? (
              <div
                id="location-listbox"
                role="listbox"
                className="absolute left-0 right-0 top-full mt-1 z-50 max-h-64 overflow-auto rounded-md border bg-white shadow-lg"
              >
                {isLoadingData ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">Chargement…</div>
                ) : filteredLocations.length ? (
                  filteredLocations.map((l, idx) => (
                    <div
                      key={`${l.code}-${l.name}`}
                      role="option"
                      aria-selected={idx === locationActiveIndex}
                      className={cn(
                        "px-3 py-2 text-sm cursor-pointer hover:bg-accent",
                        idx === locationActiveIndex && "bg-accent",
                      )}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setLocation(`${l.name} (${l.code})`);
                        setLocationOpen(false);
                      }}
                      onMouseEnter={() => setLocationActiveIndex(idx)}
                    >
                      <span className="font-medium">{l.name}</span>
                      <span className="ml-1 text-muted-foreground">• {l.code}</span>
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm text-muted-foreground">Aucun résultat</div>
                )}
              </div>
            ) : null}
          </div>

          {/* Bouton recherche */}
          <button
            type="submit"
            className={cn(
              "w-full rounded-md bg-primary text-primary-foreground font-medium transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
              isHero && "h-12 text-base",
              isSticky && "h-11 text-sm",
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
              onChange={(e) => {
                setService(e.target.value);
                setServiceOpen(true);
              }}
              onFocus={() => {
                setServiceOpen(true);
                ensureDataLoaded();
              }}
              onBlur={() => setTimeout(() => setServiceOpen(false), 120)}
              aria-autocomplete="list"
              aria-expanded={serviceOpen}
              aria-controls="service-listbox-desktop"
              className={cn(
                "w-full pl-10 pr-4 rounded-md border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                isHero && "h-14 text-base bg-white/90 backdrop-blur",
                isSticky && "h-12 text-sm bg-white/95",
              )}
              onKeyDown={(e) => {
                if (!serviceOpen) return;
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setServiceActiveIndex((i) => Math.min(i + 1, combinedServiceItems.length - 1));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setServiceActiveIndex((i) => Math.max(i - 1, 0));
                } else if (e.key === "Enter") {
                  if (serviceActiveIndex >= 0 && combinedServiceItems[serviceActiveIndex]) {
                    e.preventDefault();
                    const item = combinedServiceItems[serviceActiveIndex];
                    setService(item.label);
                    if (item.type === "category") {
                      setSelectedSectorKey(item.key);
                      setSelectedCategoryKey(null);
                    } else {
                      setSelectedCategoryKey(item.key);
                      setSelectedSectorKey(null);
                    }
                    setServiceOpen(false);
                  }
                } else if (e.key === "Escape") {
                  setServiceOpen(false);
                }
              }}
            />
            {serviceOpen && (service || isLoadingData) ? (
              <div
                id="service-listbox-desktop"
                role="listbox"
                className="absolute left-0 right-0 top-full mt-1 z-50 max-h-72 overflow-auto rounded-md border bg-white shadow-lg"
              >
                {isLoadingData ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">Chargement…</div>
                ) : combinedServiceItems.length ? (
                  <>
                    {filteredCategories.length ? (
                      <div className="px-3 py-1.5 text-[11px] uppercase tracking-wide bg-slate-50 text-slate-600 border-y dark:bg-slate-900/30 dark:text-slate-300">
                        Catégories
                      </div>
                    ) : null}
                    {filteredCategories.map((c, idx) => (
                      <div
                        key={`cat-${c.key}`}
                        role="option"
                        aria-selected={idx === serviceActiveIndex}
                        className={cn(
                          "px-3 py-2 text-sm cursor-pointer hover:bg-accent",
                          idx === serviceActiveIndex && "bg-accent",
                        )}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setService(c.label);
                          setSelectedSectorKey(c.key);
                          setSelectedCategoryKey(null);
                          setServiceOpen(false);
                        }}
                        onMouseEnter={() => setServiceActiveIndex(idx)}
                      >
                        <span className="font-medium">{c.label}</span>
                      </div>
                    ))}
                    {filteredServices.length ? (
                      <div className="px-3 py-1.5 text-[11px] uppercase tracking-wide bg-slate-50 text-slate-600 border-y dark:bg-slate-900/30 dark:text-slate-300">
                        Services
                      </div>
                    ) : null}
                    {filteredServices.map((s, idx) => {
                      const listIndex = filteredCategories.length + idx;
                      return (
                        <div
                          key={`svc-${s.key}`}
                          role="option"
                          aria-selected={listIndex === serviceActiveIndex}
                          className={cn(
                            "px-3 py-2 text-sm cursor-pointer hover:bg-accent",
                            listIndex === serviceActiveIndex && "bg-accent",
                          )}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setService(s.label);
                            setSelectedCategoryKey(s.key);
                            setSelectedSectorKey(null);
                            setServiceOpen(false);
                          }}
                          onMouseEnter={() => setServiceActiveIndex(listIndex)}
                        >
                          <span className="font-medium">{s.label}</span>
                          {s.sectorLabel ? (
                            <span className="ml-1 text-muted-foreground">— {s.sectorLabel}</span>
                          ) : null}
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <div className="px-3 py-2 text-sm text-muted-foreground">Aucun résultat</div>
                )}
              </div>
            ) : null}
          </div>

          {/* Champ localisation - plus petit */}
          <div className="relative flex-1 min-w-[200px]">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              inputMode="text"
              placeholder="Ville, code postal..."
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setLocationOpen(true);
              }}
              onFocus={() => {
                setLocationOpen(true);
                ensureDataLoaded();
              }}
              onBlur={() => setTimeout(() => setLocationOpen(false), 120)}
              aria-autocomplete="list"
              aria-expanded={locationOpen}
              aria-controls="location-listbox-desktop"
              className={cn(
                "w-full pl-10 pr-4 rounded-md border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                isHero && "h-14 text-base bg-white/90 backdrop-blur",
                isSticky && "h-12 text-sm bg-white/95",
              )}
              onKeyDown={(e) => {
                if (!locationOpen) return;
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setLocationActiveIndex((i) => Math.min(i + 1, filteredLocations.length - 1));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setLocationActiveIndex((i) => Math.max(i - 1, 0));
                } else if (e.key === "Enter") {
                  if (locationActiveIndex >= 0 && filteredLocations[locationActiveIndex]) {
                    e.preventDefault();
                    const sel = filteredLocations[locationActiveIndex];
                    setLocation(`${sel.name} (${sel.code})`);
                    setLocationOpen(false);
                  }
                } else if (e.key === "Escape") {
                  setLocationOpen(false);
                }
              }}
            />
            {locationOpen && (location || isLoadingData) ? (
              <div
                id="location-listbox-desktop"
                role="listbox"
                className="absolute left-0 right-0 top-full mt-1 z-50 max-h-72 overflow-auto rounded-md border bg-white shadow-lg"
              >
                {isLoadingData ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">Chargement…</div>
                ) : filteredLocations.length ? (
                  filteredLocations.map((l, idx) => (
                    <div
                      key={`${l.code}-${l.name}`}
                      role="option"
                      aria-selected={idx === locationActiveIndex}
                      className={cn(
                        "px-3 py-2 text-sm cursor-pointer hover:bg-accent",
                        idx === locationActiveIndex && "bg-accent",
                      )}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setLocation(`${l.name} (${l.code})`);
                        setLocationOpen(false);
                      }}
                      onMouseEnter={() => setLocationActiveIndex(idx)}
                    >
                      <span className="font-medium">{l.name}</span>
                      <span className="ml-1 text-muted-foreground">• {l.code}</span>
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm text-muted-foreground">Aucun résultat</div>
                )}
              </div>
            ) : null}
          </div>

          {/* Bouton recherche */}
          <button
            type="submit"
            className={cn(
              "rounded-md bg-primary text-primary-foreground font-medium transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 whitespace-nowrap",
              isHero && "h-14 px-8 text-base",
              isSticky && "h-12 px-6 text-sm",
            )}
          >
            Rechercher
          </button>
        </div>
      </form>

      {/* Suggestions */}
      <div
        className={cn(
          "mt-2 text-muted-foreground text-left w-full",
          isHero && "pl-1 sm:pl-2 text-xs sm:text-sm",
          isSticky && "pl-1 sm:pl-2 text-xs",
        )}
      >
        <span className="hidden sm:inline">Suggestions: </span>
        <span className="sm:hidden">Ex: </span>
        plombier, électricien, photographe, coach sportif…
      </div>
    </div>
  );
};
