import { HelpCircle } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function SiteFooter() {
  return (
    <footer className="w-full border-t bg-black text-white py-[20px]">
      <div className="container mx-auto flex items-center justify-between px-4 sm:px-6">
        {/* Nom de l'entreprise à gauche */}
        <div className="flex items-center">
          <span className="text-lg font-archivo-black">OURSPACE</span>
        </div>

        {/* Centre - Tous les liens avec espacement uniforme */}
        <div className="hidden sm:flex items-center gap-12">
          {/* Politique de confidentialité */}
          <Link
            href="/politique-confidentialite"
            className="text-white/80 hover:text-white transition-colors text-sm"
          >
            Politique de confidentialité
          </Link>

          {/* Mentions légales */}
          <Link
            href="/mentions-legales"
            className="text-white/80 hover:text-white transition-colors text-sm"
          >
            Mentions légales
          </Link>

          {/* FAQ */}
          <Link href="/faq" className="text-white/80 hover:text-white transition-colors text-sm">
            FAQ
          </Link>

          {/* Tarifs */}
          <Link href="/tarifs" className="text-white/80 hover:text-white transition-colors text-sm">
            Tarifs
          </Link>
        </div>

        {/* Bouton centre d'aide à droite */}
        <Button
          variant="outline"
          size="sm"
          asChild
          className="border-white bg-white text-black hover:bg-white/90 hover:text-black"
        >
          <Link href="/centre-aide" className="flex items-center gap-2">
            <HelpCircle className="size-4" />
            <span className="hidden sm:inline">Centre d&apos;aide</span>
          </Link>
        </Button>
      </div>

      {/* Version mobile pour tous les liens */}
      <div className="sm:hidden border-t border-white/10">
        <div className="container mx-auto px-4 py-[20px]">
          <div className="grid grid-cols-2 gap-4 text-xs text-white/80">
            {/* Colonne gauche - Liens légaux */}
            <div className="flex flex-col items-center gap-2">
              <Link
                href="/politique-confidentialite"
                className="hover:text-white transition-colors"
              >
                Politique de confidentialité
              </Link>
              <Link href="/mentions-legales" className="hover:text-white transition-colors">
                Mentions légales
              </Link>
            </div>

            {/* Colonne droite - FAQ et Tarifs */}
            <div className="flex flex-col items-center gap-2">
              <Link href="/faq" className="hover:text-white transition-colors">
                FAQ
              </Link>
              <Link href="/tarifs" className="hover:text-white transition-colors">
                TARIFS
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
