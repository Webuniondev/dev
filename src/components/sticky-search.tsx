"use client";

import * as React from "react";

import { DualSearch } from "./dual-search";

type StickySearchProps = {
  targetId: string;
};

export const StickySearch: React.FC<StickySearchProps> = ({ targetId }) => {
  const [isVisible, setIsVisible] = React.useState<boolean>(false);

  React.useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setIsVisible(!entry.isIntersecting);
      },
      {
        root: null,
        threshold: 0.01,
      },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [targetId]);

  const handleSearch = (data: { service: string; location: string }) => {
    // TODO: Implémenter la logique de recherche
    console.log("Recherche:", data);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-16 left-0 right-0 z-40 border-b bg-white/90 backdrop-blur">
      <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 py-2">
        <DualSearch variant="sticky" onSubmit={handleSearch} />
      </div>
    </div>
  );
};
