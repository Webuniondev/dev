"use client";

import type { EmblaOptionsType } from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";
import * as React from "react";

type Testimonial = {
  id: string;
  company?: string;
  quote: string;
  authorName: string;
  authorTitle?: string;
};

type Props = {
  items: Testimonial[];
  options?: EmblaOptionsType;
  autoPlayDelayMs?: number;
};

export const TestimonialsCarousel: React.FC<Props> = ({
  items,
  options,
  autoPlayDelayMs = 4000,
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    loop: true,
    dragFree: false,
    containScroll: "trimSnaps",
    ...options,
  });

  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const timerRef = React.useRef<number | null>(null);

  const play = React.useCallback(() => {
    if (!emblaApi) return;
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      if (!emblaApi) return;
      if (emblaApi.canScrollNext()) emblaApi.scrollNext();
      else emblaApi.scrollTo(0);
    }, autoPlayDelayMs);
  }, [emblaApi, autoPlayDelayMs]);

  const stop = React.useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  React.useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
      play();
    };

    emblaApi.on("select", onSelect);
    emblaApi.on("pointerDown", stop);
    emblaApi.on("settle", play);
    onSelect();

    return () => stop();
  }, [emblaApi, play, stop]);

  return (
    <div
      className="relative"
      onMouseEnter={stop}
      onMouseLeave={play}
      onFocusCapture={stop}
      onBlurCapture={play}
    >
      {/* Masque de dégradé aux bords gauche/droite */}
      <div
        ref={emblaRef}
        className="overflow-hidden [--mask:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)] [mask-image:var(--mask)] [-webkit-mask-image:var(--mask)]"
      >
        <div className="flex gap-6">
          {items.map((item, idx) => {
            const isActive = idx === selectedIndex;
            return (
              <div
                key={item.id}
                className="min-w-0 flex-[0_0_82%] sm:flex-[0_0_70%] lg:flex-[0_0_60%]"
              >
                <article
                  className={
                    "h-full rounded-2xl border bg-white/80 text-slate-900 backdrop-blur " +
                    "dark:bg-slate-900/60 dark:text-slate-100 " +
                    "transition-transform duration-500 ease-out " +
                    (isActive ? "scale-100" : "scale-[0.96] opacity-80")
                  }
                >
                  <div className="px-6 sm:px-10 py-8 sm:py-10 text-center">
                    {item.company ? (
                      <div className="mb-4 text-lg sm:text-xl font-semibold opacity-90">
                        {item.company}
                      </div>
                    ) : null}
                    <p className="mx-auto max-w-3xl text-sm sm:text-base leading-relaxed">
                      {item.quote}
                    </p>
                    <div className="mt-6 flex items-center justify-center gap-3 text-left">
                      <div className="size-9 rounded-full bg-gradient-to-br from-slate-300 to-slate-200 dark:from-slate-700 dark:to-slate-600" />
                      <div>
                        <div className="text-sm font-semibold">{item.authorName}</div>
                        {item.authorTitle ? (
                          <div className="text-xs text-muted-foreground">{item.authorTitle}</div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </article>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TestimonialsCarousel;
