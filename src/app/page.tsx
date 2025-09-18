//

import { Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { CursorNudge } from "@/components/cursor-nudge";
import { SiteHeader } from "@/components/site-header";
import { MovingBorderButton } from "@/components/ui/moving-border";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";

export default function Home() {
  return (
    <div className="min-h-dvh flex flex-col">
      <SiteHeader />
      <main className="flex-1 p-0">
        {/* Hero full-bleed (pleine largeur), sans marge ni padding top */}
        <section className="relative overflow-hidden w-full">
          <div className="relative min-h-[480px] sm:min-h-[630px]">
        <Image
              src="/close-up-portrait-cheerful-cute-stylishattractive-trendy-girl-making-binoculars-with-fingers-isol.jpg"
              alt="Jeune femme curieuse faisant des jumelles avec ses doigts"
              fill
          priority
              sizes="100vw"
              className="object-cover object-left"
            />
            {/* Voile dégradé pour lisibilité côté droit */}
            <div className="absolute inset-0 bg-gradient-to-l from-white/95 via-white/70 to-transparent" />

            {/* Contenu aligné à droite */}
            <div className="relative z-10 flex h-full items-center">
              <div className="ml-auto w-full sm:max-w-[640px] lg:max-w-[1280px] pl-6 sm:pl-10 lg:pl-16 pr-10 sm:pr-20 lg:pr-28 py-10 sm:py-14">
                <div className="font-caveat font-bold text-4xl sm:text-6xl leading-tight">
                  <TypewriterEffectSmooth
                    words={[
                      { text: "Trouvez le " },
                      { text: "pro idéal", className: "underline decoration-[#0F172B] decoration-4 underline-offset-4" },
                      { text: ", au bon endroit, au bon moment." },
                    ]}
                  />
        </div>
                <p className="mt-4 text-muted-foreground text-base sm:text-lg leading-relaxed">
                  OURSPACE centralise tous les métiers et activités professionnelles. Décrivez votre besoin, notre
                  recherche assistée par IA vous propose les meilleurs pros, adaptés à votre contexte, votre zone et
                  votre budget.
                </p>

                {/* Barre de recherche (UX only) */}
                <div className="mt-6 sm:mt-8">
                  <form className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <input
                      type="text"
                      inputMode="search"
                      placeholder="Ex. Plombier à Lyon, Photographe mariage, Coach sportif..."
                      className="w-full h-12 sm:h-14 rounded-md border px-4 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 bg-white/90 backdrop-blur"
                    />
                    <button
                      type="button"
                      className="h-12 sm:h-14 rounded-md bg-primary text-primary-foreground px-6 sm:px-8 text-sm sm:text-base"
                    >
                      Rechercher
                    </button>
                  </form>
                  <div className="mt-2 pl-1 sm:pl-2 text-xs sm:text-sm text-muted-foreground text-left w-full">
                    Suggestions: plombier, électricien, web designer…
                  </div>
                </div>
                

                <div className="mt-16 sm:mt-20 flex justify-end">
                  <div className="relative flex flex-col items-center">
                    <MovingBorderButton
                      borderRadius="1.25rem"
                      className="font-caveat font-extrabold text-2xl sm:text-3xl px-8 sm:px-10 min-w-[16rem] gap-3"
                      aria-label="Rejoindre 12 840 pros"
                      as={Link}
                      href="/register"
                    >
                      <Users className="size-6" aria-hidden />
                      <span>Rejoindre 12 840 pros</span>
                    </MovingBorderButton>
                    {/* Curseur animé qui entre par la droite et pointe le CTA */}
                    <CursorNudge className="absolute -right-6 -bottom-2 sm:-right-8 sm:-bottom-3" />
                    <p className="mt-2 text-xs sm:text-sm text-slate-700 text-center w-full">
                      Sans engagement • Inscription en 2 minutes
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
