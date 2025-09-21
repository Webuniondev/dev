"use client";

import * as React from "react";

import { DualSearch } from "./dual-search";

export const HeroSearch: React.FC = () => {
  const handleSearch = (data: { service: string; location: string }) => {
    // TODO: Implémenter la logique de recherche
    console.log("Recherche hero:", data);

    // Pour l'instant, on peut rediriger vers une page de résultats
    // ou ouvrir une modale, etc.

    // Exemple de redirection (à adapter selon vos besoins)
    // const searchParams = new URLSearchParams({
    //   service: data.service,
    //   location: data.location,
    // });
    // window.location.href = `/recherche?${searchParams.toString()}`;
  };

  return <DualSearch id="hero-search" variant="hero" onSubmit={handleSearch} />;
};
