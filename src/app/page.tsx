//

import { ArrowDown, ArrowRight, Quote, Users } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { BackToTop } from "@/components/back-to-top";
import { CursorNudge } from "@/components/cursor-nudge";
import { HeroSearch } from "@/components/hero-search";
import { SiteHeader } from "@/components/site-header";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import CategoriesBrowserServer from "@/components/categories-browser-server";
import { MovingBorderButton } from "@/components/ui/moving-border";
import TestimonialsCarousel from "@/components/testimonials-carousel";

import { StickySearch } from "../components/sticky-search";

export const metadata: Metadata = {
  title: "Ourspace – Trouvez le pro idéal, au bon endroit, au bon moment",
  description:
    "Ourspace met en relation particuliers et professionnels. Recherchez, comparez, et contactez le bon pro en quelques minutes.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Ourspace – Trouvez le pro idéal",
    description:
      "Recherchez, comparez et contactez des professionnels de confiance partout en France.",
    url: "/",
    siteName: "Ourspace",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ourspace – Trouvez le pro idéal",
    description:
      "Recherchez, comparez et contactez des professionnels de confiance partout en France.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Home() {
  return (
    <div className="min-h-dvh flex flex-col">
      <SiteHeader />
      <StickySearch targetId="hero-search" />
      <main className="flex-1 p-0">
        {/* Hero full-bleed (pleine largeur), sans marge ni padding top */}
        <section className="relative overflow-hidden w-full">
          <div className="relative min-h-[480px] sm:min-h-[630px]">
            <span
              id="top-sentinel"
              className="absolute inset-x-0 top-0 h-px w-px overflow-hidden"
              aria-hidden
            />
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
                <h1 className="font-caveat font-bold text-4xl sm:text-6xl leading-tight">
                  <span>Trouvez le </span>
                  <span className="underline decoration-[#0F172B] decoration-4 underline-offset-4">
                    pro idéal
                  </span>
                  <span>, au bon endroit, au bon moment.</span>
                </h1>
                <p className="mt-4 text-muted-foreground text-base sm:text-lg leading-relaxed">
                  Exprimez votre besoin ou recherchez directement un service. Nous nous chargeons de
                  vous proposer les meilleurs professionnels, adaptés à vos besoins.
                </p>

                {/* Barre de recherche à double facteur */}
                <div className="mt-6 sm:mt-8">
                  <HeroSearch />
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
          {/* Shape divider collé en bas du hero */}
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-10">
            <svg
              className="block w-full h-10 sm:h-16 text-white drop-shadow-md"
              viewBox="0 0 1440 80"
              preserveAspectRatio="none"
            >
              <path
                d="M0 32l48 10.7C96 53 192 75 288 74.7 384 75 480 53 576 42.7 672 32 768 32 864 42.7 960 53 1056 75 1152 74.7 1248 75 1344 53 1392 42.7L1440 32V80H0z"
                fill="currentColor"
              />
            </svg>
          </div>
        </section>
        <BackToTop targetId="top-sentinel" />
        {/* JSON-LD SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Ourspace",
              url: process.env.NEXT_PUBLIC_SITE_URL || "https://ourspace.fr",
              potentialAction: {
                "@type": "SearchAction",
                target: `${process.env.NEXT_PUBLIC_SITE_URL || "https://ourspace.fr"}/recherche?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Ourspace",
              url: process.env.NEXT_PUBLIC_SITE_URL || "https://ourspace.fr",
              logo: `${process.env.NEXT_PUBLIC_SITE_URL || "https://ourspace.fr"}/android-chrome-512x512.png`,
              description:
                "Plateforme de mise en relation entre particuliers et professionnels en France",
              "@id": `${process.env.NEXT_PUBLIC_SITE_URL || "https://ourspace.fr"}/#organization`,
            }),
          }}
        />

        {/* Catégories populaires - placé juste après le Hero */}
        <CategoriesBrowserServer variant="home" showHeading />

        {/* Parcours en 3 étapes */}
        <section aria-labelledby="etapes" className="bg-white">
          <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 py-10 sm:py-14">
            <h2
              id="etapes"
              className="font-caveat text-3xl sm:text-4xl font-bold tracking-tight text-center"
            >
              <span className="inline-block">
                Comment ça marche ?
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
            {/* Mobile: vertical cards with arrows */}
            <div className="sm:hidden mt-6 flex flex-col items-stretch gap-3">
              <BackgroundGradient radiusClass="rounded-none">
                <div className="bg-white p-5 h-36">
                  <h3 className="font-caveat text-2xl font-bold inline-block">
                    <span className="inline-block">
                      Recherchez
                      <span aria-hidden className="block mt-1 w-1/2">
                        <svg
                          className="w-full h-[3px]"
                          viewBox="0 0 100 3"
                          preserveAspectRatio="none"
                        >
                          <path
                            d="M0 1.5 Q 25 0.2 50 1.5 T 100 1.5"
                            stroke="black"
                            strokeWidth="3"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </span>
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Expliquez votre projet en 60 secondes.
                  </p>
                </div>
              </BackgroundGradient>
              <div className="flex justify-center py-1" aria-hidden>
                <ArrowDown className="text-black size-7 sm:size-8" />
              </div>
              <BackgroundGradient radiusClass="rounded-none">
                <div className="bg-white p-5 h-36">
                  <h3 className="font-caveat text-2xl font-bold inline-block">
                    <span className="inline-block">
                      Comparez
                      <span aria-hidden className="block mt-1 w-1/2">
                        <svg
                          className="w-full h-[3px]"
                          viewBox="0 0 100 3"
                          preserveAspectRatio="none"
                        >
                          <path
                            d="M0 1.5 Q 25 0.2 50 1.5 T 100 1.5"
                            stroke="black"
                            strokeWidth="3"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </span>
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Recevez des propositions adaptées et comparez les avis.
                  </p>
                </div>
              </BackgroundGradient>
              <div className="flex justify-center py-1" aria-hidden>
                <ArrowDown className="text-black size-7 sm:size-8" />
              </div>
              <BackgroundGradient radiusClass="rounded-none">
                <div className="bg-white p-5 h-36">
                  <h3 className="font-caveat text-2xl font-bold inline-block">
                    <span className="inline-block">
                      Contactez
                      <span aria-hidden className="block mt-1 w-1/2">
                        <svg
                          className="w-full h-[3px]"
                          viewBox="0 0 100 3"
                          preserveAspectRatio="none"
                        >
                          <path
                            d="M0 1.5 Q 25 0.2 50 1.5 T 100 1.5"
                            stroke="black"
                            strokeWidth="3"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </span>
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Choisissez le pro et échangez directement.
                  </p>
                </div>
              </BackgroundGradient>
            </div>
            {/* Desktop: horizontal cards with arrows */}
            <div className="hidden sm:grid mt-8 grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-4">
              <BackgroundGradient radiusClass="rounded-none">
                <div className="bg-white p-6 h-40">
                  <h3 className="font-caveat text-3xl font-bold inline-block">
                    <span className="inline-block">
                      Recherchez
                      <span aria-hidden className="block mt-1 w-1/2">
                        <svg
                          className="w-full h-[3px]"
                          viewBox="0 0 100 3"
                          preserveAspectRatio="none"
                        >
                          <path
                            d="M0 1.5 Q 25 0.2 50 1.5 T 100 1.5"
                            stroke="black"
                            strokeWidth="3"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </span>
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Expliquez votre projet en 60 secondes.
                  </p>
                </div>
              </BackgroundGradient>
              <div className="flex justify-center" aria-hidden>
                <ArrowRight className="text-black size-7 sm:size-8" />
              </div>
              <BackgroundGradient radiusClass="rounded-none">
                <div className="bg-white p-6 h-40">
                  <h3 className="font-caveat text-3xl font-bold inline-block">
                    <span className="inline-block">
                      Comparez
                      <span aria-hidden className="block mt-1 w-1/2">
                        <svg
                          className="w-full h-[3px]"
                          viewBox="0 0 100 3"
                          preserveAspectRatio="none"
                        >
                          <path
                            d="M0 1.5 Q 25 0.2 50 1.5 T 100 1.5"
                            stroke="black"
                            strokeWidth="3"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </span>
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Recevez des propositions adaptées et comparez les avis.
                  </p>
                </div>
              </BackgroundGradient>
              <div className="flex justify-center" aria-hidden>
                <ArrowRight className="text-black size-7 sm:size-8" />
              </div>
              <BackgroundGradient radiusClass="rounded-none">
                <div className="bg-white p-6 h-40">
                  <h3 className="font-caveat text-3xl font-bold inline-block">
                    <span className="inline-block">
                      Contactez
                      <span aria-hidden className="block mt-1 w-1/2">
                        <svg
                          className="w-full h-[3px]"
                          viewBox="0 0 100 3"
                          preserveAspectRatio="none"
                        >
                          <path
                            d="M0 1.5 Q 25 0.2 50 1.5 T 100 1.5"
                            stroke="black"
                            strokeWidth="3"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </span>
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Choisissez le pro et échangez directement.
                  </p>
                </div>
              </BackgroundGradient>
            </div>
            {/* Accroche sous les cartes - rapprochée */}
            <p className="mt-2 sm:mt-3 text-center text-sm sm:text-base text-muted-foreground font-inter">
              La simplicité pensée pour vous. Nous trouvons, vous choisissez.
            </p>
          </div>
        </section>
        {/* Avis clients - carrousel Embla */}
        <section aria-labelledby="testimonials" className="bg-white">
          <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 py-10 sm:py-14">
            <h2
              id="testimonials"
              className="font-caveat text-3xl sm:text-4xl font-bold tracking-tight text-center"
            >
              Ils nous font confiance
            </h2>
            <div className="mt-8">
              <TestimonialsCarousel
                autoPlayDelayMs={4500}
                items={[
                  {
                    id: "pubmatic",
                    company: "PubMatic",
                    quote:
                      "We've come a long way with Supernova. Over the past two years, they've made tremendous improvements—especially with collaborative features like commenting and review.",
                    authorName: "Dev Pradhan",
                    authorTitle: "Senior UX Designer",
                  },
                  {
                    id: "ourspace-1",
                    company: "Ourspace",
                    quote:
                      "Trouvé un plombier sérieux en 2h, parfait ! Notre expérience s'améliore de mois en mois.",
                    authorName: "Sophie",
                    authorTitle: "Lyon",
                  },
                  {
                    id: "ourspace-2",
                    company: "Ourspace",
                    quote:
                      "Devis clair et rapide, très satisfait. Le suivi client est excellent.",
                    authorName: "Karim",
                    authorTitle: "Paris",
                  },
                  {
                    id: "ourspace-3",
                    company: "Ourspace",
                    quote:
                      "Photographe au top pour notre mariage. La plateforme est simple et efficace.",
                    authorName: "Laura",
                    authorTitle: "Bordeaux",
                  },
                ]}
              />
            </div>
          </div>
        </section>

        
      </main>
    </div>
  );
}
