"use client";

import { ChevronUp } from "lucide-react";
import * as React from "react";

type BackToTopProps = {
  targetId: string;
};

export const BackToTop: React.FC<BackToTopProps> = ({ targetId }) => {
  const [visible, setVisible] = React.useState<boolean>(false);

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
      className={`fixed right-5 bottom-5 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-black text-white shadow-lg transition-all focus-visible:ring-2 focus-visible:ring-black/20 hover:bg-black/90 ${
        visible ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 translate-y-2"
      }`}
    >
      <ChevronUp className="size-6" aria-hidden />
    </button>
  );
};
