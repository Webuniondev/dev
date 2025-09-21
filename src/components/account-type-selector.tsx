"use client";

import { ArrowRight, Briefcase, User } from "lucide-react";

interface AccountTypeSelectorProps {
  onSelect: (type: "user" | "pro") => void;
}

export function AccountTypeSelector({ onSelect }: AccountTypeSelectorProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          Quel type de compte souhaitez-vous créer ?
        </h2>
        <p className="text-white/70 text-sm">
          Choisissez le type de compte qui correspond à vos besoins
        </p>
      </div>

      <div className="grid gap-4">
        {/* Compte utilisateur */}
        <button
          onClick={() => onSelect("user")}
          className="group w-full p-6 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 transition-all duration-200 text-left"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-500/20 text-blue-400">
                <User className="size-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Particulier</h3>
                <p className="text-white/60 text-sm">
                  Je recherche des professionnels pour mes projets
                </p>
              </div>
            </div>
            <ArrowRight className="size-5 text-white/40 group-hover:text-white/70 transition-colors" />
          </div>
        </button>

        {/* Compte professionnel */}
        <button
          onClick={() => onSelect("pro")}
          className="group w-full p-6 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 transition-all duration-200 text-left"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-500/20 text-purple-400">
                <Briefcase className="size-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Professionnel</h3>
                <p className="text-white/60 text-sm">Je propose mes services et expertise</p>
              </div>
            </div>
            <ArrowRight className="size-5 text-white/40 group-hover:text-white/70 transition-colors" />
          </div>
        </button>
      </div>

      <div className="text-center text-white/50 text-xs">
        Vous pourrez modifier ce choix plus tard dans votre profil
      </div>
    </div>
  );
}
