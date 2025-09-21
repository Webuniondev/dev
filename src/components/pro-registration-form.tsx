"use client";

import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSecureFetch } from "@/lib/hooks/use-secure-fetch";

interface ProSector {
  key: string;
  label: string;
  description?: string;
  categories: ProCategory[];
}

interface ProCategory {
  key: string;
  label: string;
  description?: string;
}

interface Department {
  code: string;
  name: string;
}

interface ProRegistrationFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

export function ProRegistrationForm({ onBack, onSuccess }: ProRegistrationFormProps) {
  const { secureGet, securePost } = useSecureFetch();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sectors, setSectors] = useState<ProSector[]>([]);
  const [selectedSector, setSelectedSector] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [departments, setDepartments] = useState<Department[]>([]);

  // Charger les secteurs/catégories et départements
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [proResponse, deptResponse] = await Promise.all([
          secureGet("/api/pro-data"),
          secureGet("/api/departments"),
        ]);

        if (proResponse.ok) {
          const proData = await proResponse.json();
          setSectors(proData.sectors || []);
        } else {
          throw new Error("Erreur lors du chargement des secteurs");
        }

        if (deptResponse.ok) {
          const deptData = await deptResponse.json();
          setDepartments(deptData.departments || []);
        }
      } catch (err) {
        console.error("Erreur chargement données:", err);
        setError("Impossible de charger les données nécessaires");
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [secureGet]);

  // Réinitialiser la catégorie quand le secteur change
  useEffect(() => {
    setSelectedCategory("");
  }, [selectedSector]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const proData = {
      account_type: "pro" as const,
      email: formData.get("email"),
      password: formData.get("password"),
      first_name: formData.get("first_name"),
      last_name: formData.get("last_name"),
      phone_number: formData.get("phone_number"),
      sector_key: selectedSector,
      category_key: selectedCategory,
      business_name: formData.get("business_name"),
      description: formData.get("description"),
      experience_years: formData.get("experience_years")
        ? Number(formData.get("experience_years"))
        : undefined,
      address: formData.get("address"),
      city: formData.get("city"),
      department_code: formData.get("department_code"),
    };

    try {
      const response = await securePost("/api/register", proData);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de l'inscription");
      }

      onSuccess();
    } catch (err) {
      console.error("Erreur inscription PRO:", err);
      setError(err instanceof Error ? err.message : "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  const currentSector = sectors.find((s) => s.key === selectedSector);
  const availableCategories = currentSector?.categories || [];

  if (loadingData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
            <ArrowLeft className="size-4 text-white" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-white">Inscription Professionnel</h2>
            <p className="text-white/60 text-sm">Chargement...</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <span className="ml-2 text-white/70">Chargement des secteurs...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
          <ArrowLeft className="size-4 text-white" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-white">Inscription Professionnel</h2>
          <p className="text-white/60 text-sm">Créez votre compte professionnel</p>
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
            Email professionnel *
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="contact@votreentreprise.com"
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

        {/* Secteur et catégorie */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="sector" className="text-white">
              Secteur d&apos;activité *
            </Label>
            <select
              id="sector"
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-md bg-white/10 border border-white/20 text-white focus:border-white/40 focus:outline-none"
            >
              <option value="" className="bg-gray-800">
                Sélectionnez un secteur
              </option>
              {sectors.map((sector) => (
                <option key={sector.key} value={sector.key} className="bg-gray-800">
                  {sector.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="category" className="text-white">
              Spécialité *
            </Label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              required
              disabled={!selectedSector}
              className="w-full px-3 py-2 rounded-md bg-white/10 border border-white/20 text-white focus:border-white/40 focus:outline-none disabled:opacity-50"
            >
              <option value="" className="bg-gray-800">
                {selectedSector ? "Sélectionnez une spécialité" : "Choisissez d'abord un secteur"}
              </option>
              {availableCategories.map((category) => (
                <option key={category.key} value={category.key} className="bg-gray-800">
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Nom de l'entreprise */}
        <div className="space-y-1">
          <Label htmlFor="business_name" className="text-white">
            Nom de l&apos;entreprise
          </Label>
          <Input
            id="business_name"
            name="business_name"
            type="text"
            autoComplete="organization"
            placeholder="Votre entreprise"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
          />
        </div>

        {/* Téléphone et expérience */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="phone_number" className="text-white">
              Téléphone professionnel
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

          <div className="space-y-1">
            <Label htmlFor="experience_years" className="text-white">
              Années d&apos;expérience
            </Label>
            <Input
              id="experience_years"
              name="experience_years"
              type="number"
              min="0"
              max="50"
              placeholder="5"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
          </div>
        </div>

        {/* Adresse */}
        <div className="space-y-1">
          <Label htmlFor="address" className="text-white">
            Adresse professionnelle
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

        {/* Description */}
        <div className="space-y-1">
          <Label htmlFor="description" className="text-white">
            Description de votre activité
          </Label>
          <textarea
            id="description"
            name="description"
            rows={3}
            placeholder="Décrivez brièvement vos services..."
            className="w-full px-3 py-2 rounded-md bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:outline-none resize-none"
          />
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="p-3 rounded-lg border border-red-500/50 bg-red-500/10">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Bouton d'inscription */}
        <Button
          type="submit"
          className="w-full"
          disabled={loading || !selectedSector || !selectedCategory}
        >
          {loading ? "Création du compte..." : "Créer mon compte professionnel"}
        </Button>
      </form>

      <div className="text-center text-white/50 text-xs">
        En vous inscrivant, vous acceptez nos conditions d&apos;utilisation
      </div>
    </div>
  );
}
