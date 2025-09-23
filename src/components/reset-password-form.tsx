"use client";

import { Lock } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ResetPasswordFormProps {
  onSubmit: (formData: FormData) => void;
}

export function ResetPasswordForm({ onSubmit }: ResetPasswordFormProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Critères de validation du mot de passe
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  const isPasswordValid = hasMinLength && hasUppercase && hasNumber;
  const doPasswordsMatch = password === confirmPassword && password.length > 0;
  const isFormValid = isPasswordValid && doPasswordsMatch;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password" className="text-white">
          Nouveau mot de passe
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="Au moins 8 caractères"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
        />
        {password.length > 0 && !isPasswordValid && (
          <div className="text-red-400 text-xs space-y-1 font-inter">
            {!hasMinLength && <p>• Au moins 8 caractères requis</p>}
            {!hasUppercase && <p>• Au moins une majuscule requise</p>}
            {!hasNumber && <p>• Au moins un chiffre requis</p>}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-white">
          Confirmer le mot de passe
        </Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="Répétez le mot de passe"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
        />
        {confirmPassword.length > 0 && !doPasswordsMatch && (
          <p className="text-red-400 text-xs font-inter">Les mots de passe ne correspondent pas</p>
        )}
        {confirmPassword.length > 0 && doPasswordsMatch && isPasswordValid && (
          <p className="text-green-400 text-xs font-inter">✓ Les mots de passe correspondent</p>
        )}
      </div>

      <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-3 mt-4">
        <div className="flex items-start gap-2">
          <Lock className="size-4 text-blue-400 mt-0.5 shrink-0" />
          <div className="text-xs text-blue-300 font-inter">
            <p className="font-medium mb-1">Conseils pour un mot de passe sécurisé :</p>
            <ul className="list-disc list-inside space-y-0.5 text-blue-300/80">
              <li className={hasMinLength ? "text-green-400" : ""}>
                Au moins 8 caractères {hasMinLength && "✓"}
              </li>
              <li className={hasUppercase ? "text-green-400" : ""}>
                Au moins une majuscule {hasUppercase && "✓"}
              </li>
              <li className={hasNumber ? "text-green-400" : ""}>
                Au moins un chiffre {hasNumber && "✓"}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        disabled={!isFormValid || isSubmitting}
        className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Lock className="size-4 mr-2" />
        {isSubmitting ? "Mise à jour..." : "Mettre à jour le mot de passe"}
      </Button>

      {!isFormValid && password.length > 0 && confirmPassword.length > 0 && (
        <p className="text-center text-xs text-white/60 font-inter">
          {!isPasswordValid
            ? "Le mot de passe ne respecte pas tous les critères"
            : "Les mots de passe doivent être identiques"}
        </p>
      )}
    </form>
  );
}
