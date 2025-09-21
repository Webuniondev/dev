"use client";

import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSecureFetch } from "@/lib/hooks/use-secure-fetch";

interface UserRegistrationFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

interface Department {
  code: string;
  name: string;
}

export function UserRegistrationForm({ onBack, onSuccess }: UserRegistrationFormProps) {
  const { securePost, secureGet } = useSecureFetch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);

  // Charger les départements
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await secureGet("/api/departments");
        if (response.ok) {
          const data = await response.json();
          setDepartments(data.departments || []);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des départements:", error);
      }
    };

    fetchDepartments();
  }, [secureGet]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const userData = {
      account_type: "user" as const,
      email: formData.get("email"),
      password: formData.get("password"),
      first_name: formData.get("first_name"),
      last_name: formData.get("last_name"),
      phone_number: formData.get("phone_number"),
      address: formData.get("address"),
      city: formData.get("city"),
      department_code: formData.get("department_code"),
    };

    try {
      const response = await securePost("/api/register", userData);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de l'inscription");
      }

      onSuccess();
    } catch (err) {
      console.error("Erreur inscription:", err);
      setError(err instanceof Error ? err.message : "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
          <ArrowLeft className="size-4 text-white" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-white">Inscription Particulier</h2>
          <p className="text-white/60 text-sm">Créez votre compte utilisateur</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nom et prénom */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="first_name" className="text-white">
              Prénom *
            </Label>
            <Input
              id="first_name"
              name="first_name"
              type="text"
              required
              autoComplete="given-name"
              placeholder="Jean"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="last_name" className="text-white">
              Nom *
            </Label>
            <Input
              id="last_name"
              name="last_name"
              type="text"
              required
              autoComplete="family-name"
              placeholder="Dupont"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1">
          <Label htmlFor="email" className="text-white">
            Email *
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="vous@domaine.com"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
          />
        </div>

        {/* Mot de passe */}
        <div className="space-y-1">
          <Label htmlFor="password" className="text-white">
            Mot de passe *
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="new-password"
            placeholder="Minimum 8 caractères"
            minLength={8}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
          />
        </div>

        {/* Téléphone (optionnel) */}
        <div className="space-y-1">
          <Label htmlFor="phone_number" className="text-white">
            Téléphone
          </Label>
          <Input
            id="phone_number"
            name="phone_number"
            type="tel"
            autoComplete="tel"
            placeholder="+33 1 23 45 67 89"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
          />
        </div>

        {/* Adresse */}
        <div className="space-y-1">
          <Label htmlFor="address" className="text-white">
            Adresse
          </Label>
          <Input
            id="address"
            name="address"
            type="text"
            autoComplete="street-address"
            placeholder="123 rue de la République"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
          />
        </div>

        {/* Ville et département */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="city" className="text-white">
              Ville
            </Label>
            <Input
              id="city"
              name="city"
              type="text"
              autoComplete="address-level2"
              placeholder="Paris"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="department_code" className="text-white">
              Département
            </Label>
            <select
              id="department_code"
              name="department_code"
              className="w-full px-3 py-2 rounded-md bg-white/10 border border-white/20 text-white focus:border-white/40 focus:outline-none"
            >
              <option value="" className="bg-gray-800">
                Sélectionnez votre département
              </option>
              {departments.map((dept) => (
                <option key={dept.code} value={dept.code} className="bg-gray-800">
                  {dept.code} - {dept.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="p-3 rounded-lg border border-red-500/50 bg-red-500/10">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Bouton d'inscription */}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Création du compte..." : "Créer mon compte"}
        </Button>
      </form>

      <div className="text-center text-white/50 text-xs">
        En vous inscrivant, vous acceptez nos conditions d&apos;utilisation
      </div>
    </div>
  );
}
