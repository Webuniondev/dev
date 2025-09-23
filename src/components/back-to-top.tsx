"use client";

import { ChevronUp } from "lucide-react";
import * as React from "react";

type BackToTopProps = {
  targetId: string;
  footerSelector?: string; // par défaut le <footer> public
};

export const BackToTop: React.FC<BackToTopProps> = ({ targetId, footerSelector = "footer" }) => {
  const [visible, setVisible] = React.useState<boolean>(false);
  const [bottomOffset, setBottomOffset] = React.useState<number>(20); // en px

  React.useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setVisible(!entry.isIntersecting);
      },
      { threshold: 0.01 },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [targetId]);

  // Maintenir le bouton au-dessus du footer
  React.useEffect(() => {
    const updateOffset = () => {
      const footer = document.querySelector(footerSelector) as HTMLElement | null;
      if (!footer) {
        setBottomOffset(20);
        return;
      }
      const viewportH = window.innerHeight;
      const rect = footer.getBoundingClientRect();
      const base = 20; // bottom-5 ~ 20px
      const gap = 16; // espace souhaité au-dessus du footer
      if (rect.top < viewportH) {
        const overlap = viewportH - rect.top; // combien le footer entre dans le viewport
        setBottomOffset(Math.max(base, overlap + gap));
      } else {
        setBottomOffset(base);
      }
    };

    updateOffset();
    window.addEventListener("scroll", updateOffset, { passive: true });
    window.addEventListener("resize", updateOffset);
    return () => {
      window.removeEventListener("scroll", updateOffset);
      window.removeEventListener("resize", updateOffset);
    };
  }, [footerSelector]);

  const handleClick: () => void = () => {
    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      window.scrollTo(0, 0);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Remonter en haut de la page"
      className={`fixed right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-black text-white shadow-lg transition-all focus-visible:ring-2 focus-visible:ring-black/20 hover:bg-black/90 ${
        visible ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 translate-y-2"
      }`}
      style={{ bottom: bottomOffset }}
    >
      <ChevronUp className="size-6" aria-hidden />
    </button>
  );
};
