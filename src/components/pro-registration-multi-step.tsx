"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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

interface ProRegistrationMultiStepProps {
  onBack: () => void;
  onSuccess: () => void;
}

const steps = [
  {
    id: "email",
    title: "Email",
    description: "Vérification de disponibilité",
  },
  {
    id: "personal",
    title: "Informations personnelles",
    description: "Nom, adresse et contact",
  },
  {
    id: "professional",
    title: "Activité professionnelle",
    description: "Secteur et spécialité",
  },
  {
    id: "password",
    title: "Sécurité",
    description: "Création du mot de passe",
  },
];

export function ProRegistrationMultiStep({ onBack, onSuccess }: ProRegistrationMultiStepProps) {
  const { secureGet, securePost } = useSecureFetch();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Données externes
  const [sectors, setSectors] = useState<ProSector[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  // Données du formulaire
  const [formData, setFormData] = useState({
    // Étape 1: Email
    email: "",

    // Étape 2: Personnel + Localisation
    first_name: "",
    last_name: "",
    phone_number: "",
    address: "",
    city: "",
    department_code: "",

    // Étape 3: Professionnel
    sector_key: "",
    category_key: "",
    business_name: "",
    description: "",
    experience_years: "",

    // Étape 4: Mot de passe
    password: "",
    confirmPassword: "",
  });

  // États pour la validation
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  // Charger les données nécessaires
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

  // Catégories disponibles basées sur le secteur sélectionné
  const availableCategories = sectors.find((s) => s.key === formData.sector_key)?.categories || [];

  // Réinitialiser la catégorie quand le secteur change
  useEffect(() => {
    if (formData.sector_key) {
      setFormData((prev) => ({ ...prev, category_key: "" }));
    }
  }, [formData.sector_key]);

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Reset email validation when email changes
    if (field === "email") {
      setEmailAvailable(null);
    }

    // Validate password in real-time
    if (field === "password" || field === "confirmPassword") {
      validatePassword(
        field === "password" ? value : formData.password,
        field === "confirmPassword" ? value : formData.confirmPassword,
      );
    }
  };

  // Vérification de disponibilité email
  const checkEmailAvailability = useCallback(async (email: string) => {
    if (!email || !email.includes("@")) return;

    setEmailChecking(true);
    try {
      const response = await securePost("/api/check-email", { email });
      const data = await response.json();
      setEmailAvailable(data.available);
    } catch (error) {
      console.error("Erreur vérification email:", error);
      setEmailAvailable(null);
    } finally {
      setEmailChecking(false);
    }
  }, [securePost]);

  // Validation du mot de passe
  const validatePassword = (password: string, confirmPassword: string) => {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push("Le mot de passe doit contenir au moins 8 caractères");
    }

    if (!/\d/.test(password)) {
      errors.push("Le mot de passe doit contenir au moins un chiffre");
    }

    if (password && confirmPassword && password !== confirmPassword) {
      errors.push("Les mots de passe ne correspondent pas");
    }

    setPasswordErrors(errors);
    return errors.length === 0;
  };

  // Plus de vérification automatique: on vérifie au clic sur "Suivant"

  const nextStep = () => {
    if (currentStep === 1) {
      // vérifier l'email uniquement ici
      if (!formData.email || emailChecking) return;
      checkEmailAvailability(formData.email).then(() => {
        if (emailAvailable === true) {
          setCurrentStep((prev) => prev + 1);
        }
      });
      return;
    }
    if (currentStep < steps.length) setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const proData = {
      account_type: "pro" as const,
      email: formData.email,
      password: formData.password,
      first_name: formData.first_name,
      last_name: formData.last_name,
      phone_number: formData.phone_number || "",
      sector_key: formData.sector_key,
      category_key: formData.category_key,
      business_name: formData.business_name || "",
      description: formData.description || "",
      experience_years: formData.experience_years ? Number(formData.experience_years) : undefined,
      address: formData.address || "",
      city: formData.city || "",
      department_code: formData.department_code || "",
    };

    try {
      const response = await securePost("/api/register", proData);

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

  const isStepValid = () => {
    switch (currentStep) {
      case 1: // Email
        return formData.email && emailAvailable === true && !emailChecking;
      case 2: // Personnel + Localisation
        return formData.first_name && formData.last_name;
      case 3: // Professionnel
        return formData.sector_key && formData.category_key;
      case 4: // Mot de passe
        return formData.password && formData.confirmPassword && passwordErrors.length === 0;
      default:
        return false;
    }
  };

  if (loadingData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
            <ArrowLeft className="size-4 text-white" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-white">Inscription Professionnelle</h2>
            <p className="text-white/60 text-sm">Chargement des données...</p>
          </div>
        </div>
        <div className="text-center text-white/60">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          <p className="mt-2">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-white">Inscription Professionnelle</h2>
        <p className="text-white/60 text-sm">Créez votre compte professionnel</p>
      </div>

      {/* Barre de progression */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-white/70 mb-2">
          <span>
            Étape {currentStep} sur {steps.length}
          </span>
          <span>{Math.round((currentStep / steps.length) * 100)}%</span>
        </div>
        <Progress value={(currentStep / steps.length) * 100} className="w-full" />
      </div>

      {/* Contenu de l'étape */}
      <div className="space-y-4">
        {currentStep === 1 && (
          <>
            <h3 className="text-lg font-semibold text-white mb-4">Adresse email</h3>

            {/* Email avec validation */}
            <div className="space-y-1">
              <Label htmlFor="email" className="text-white">
                Email professionnel *
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData("email", e.target.value)}
                  placeholder="contact@votreentreprise.com"
                  aria-describedby="email-help"
                  aria-invalid={emailAvailable === false}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
                {emailChecking && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  </div>
                )}
              </div>

              {/* Messages de validation email */}
              {formData.email && !emailChecking && emailAvailable === false && (
                <p id="email-help" className="text-red-400 text-sm">Cette adresse email est déjà utilisée</p>
              )}
              {formData.email && !emailChecking && emailAvailable === true && (
                <p id="email-help" className="text-green-400 text-sm">✓ Adresse email disponible</p>
              )}
            </div>
          </>
        )}

        {currentStep === 2 && (
          <>
            <h3 className="text-lg font-semibold text-white mb-4">Informations personnelles</h3>

            {/* Nom et prénom */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="first_name" className="text-white">
                  Prénom *
                </Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => updateFormData("first_name", e.target.value)}
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
                  value={formData.last_name}
                  onChange={(e) => updateFormData("last_name", e.target.value)}
                  placeholder="Dupont"
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
                value={formData.address}
                onChange={(e) => updateFormData("address", e.target.value)}
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
                  value={formData.city}
                  onChange={(e) => updateFormData("city", e.target.value)}
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
                  value={formData.department_code}
                  onChange={(e) => updateFormData("department_code", e.target.value)}
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

            {/* Téléphone */}
            <div className="space-y-1">
              <Label htmlFor="phone_number" className="text-white">
                Téléphone professionnel
              </Label>
              <Input
                id="phone_number"
                type="tel"
                value={formData.phone_number}
                onChange={(e) => updateFormData("phone_number", e.target.value)}
                placeholder="+33 1 23 45 67 89"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </div>
          </>
        )}

        {currentStep === 3 && (
          <>
            <h3 className="text-lg font-semibold text-white mb-4">Activité professionnelle</h3>

            {/* Secteur d'activité */}
            <div className="space-y-1">
              <Label htmlFor="sector" className="text-white">
                Secteur d&apos;activité *
              </Label>
              <select
                id="sector"
                value={formData.sector_key}
                onChange={(e) => updateFormData("sector_key", e.target.value)}
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

            {/* Catégorie */}
            <div className="space-y-1">
              <Label htmlFor="category" className="text-white">
                Spécialité *
              </Label>
              <select
                id="category"
                value={formData.category_key}
                onChange={(e) => updateFormData("category_key", e.target.value)}
                disabled={!formData.sector_key}
                className="w-full px-3 py-2 rounded-md bg-white/10 border border-white/20 text-white focus:border-white/40 focus:outline-none disabled:opacity-50"
              >
                <option value="" className="bg-gray-800">
                  {formData.sector_key
                    ? "Sélectionnez une spécialité"
                    : "Choisissez d'abord un secteur"}
                </option>
                {availableCategories.map((category) => (
                  <option key={category.key} value={category.key} className="bg-gray-800">
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Nom de l'entreprise */}
            <div className="space-y-1">
              <Label htmlFor="business_name" className="text-white">
                Nom de l&apos;entreprise
              </Label>
              <Input
                id="business_name"
                value={formData.business_name}
                onChange={(e) => updateFormData("business_name", e.target.value)}
                placeholder="Votre entreprise"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </div>

            {/* Années d'expérience et description */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="experience_years" className="text-white">
                  Années d&apos;expérience
                </Label>
                <Input
                  id="experience_years"
                  type="number"
                  min="0"
                  max="50"
                  value={formData.experience_years}
                  onChange={(e) => updateFormData("experience_years", e.target.value)}
                  placeholder="5"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="description" className="text-white">
                  Description courte
                </Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateFormData("description", e.target.value)}
                  placeholder="Ex: Plombier chauffagiste"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </div>
            </div>
          </>
        )}

        {currentStep === 4 && (
          <>
            <h3 className="text-lg font-semibold text-white mb-4">Sécurité de votre compte</h3>

            {/* Mot de passe */}
            <div className="space-y-1">
              <Label htmlFor="password" className="text-white">
                Mot de passe *
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => updateFormData("password", e.target.value)}
                placeholder="Minimum 7 caractères avec 1 chiffre"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </div>

            {/* Confirmation mot de passe */}
            <div className="space-y-1">
              <Label htmlFor="confirmPassword" className="text-white">
                Confirmez le mot de passe *
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => updateFormData("confirmPassword", e.target.value)}
                placeholder="Saisissez à nouveau votre mot de passe"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </div>

            {/* Messages de validation du mot de passe */}
            {formData.password && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  {formData.password.length >= 7 ? (
                    <span className="text-green-400">✓</span>
                  ) : (
                    <span className="text-red-400">✗</span>
                  )}
                  <span
                    className={formData.password.length >= 7 ? "text-green-400" : "text-white/70"}
                  >
                    Au moins 7 caractères
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {/\d/.test(formData.password) ? (
                    <span className="text-green-400">✓</span>
                  ) : (
                    <span className="text-red-400">✗</span>
                  )}
                  <span
                    className={/\d/.test(formData.password) ? "text-green-400" : "text-white/70"}
                  >
                    Au moins 1 chiffre
                  </span>
                </div>
                {formData.confirmPassword && (
                  <div className="flex items-center gap-2 text-sm">
                    {formData.password === formData.confirmPassword ? (
                      <span className="text-green-400">✓</span>
                    ) : (
                      <span className="text-red-400">✗</span>
                    )}
                    <span
                      className={
                        formData.password === formData.confirmPassword
                          ? "text-green-400"
                          : "text-white/70"
                      }
                    >
                      Les mots de passe correspondent
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Messages d'erreur */}
            {passwordErrors.length > 0 && (
              <div className="space-y-1">
                {passwordErrors.map((error, index) => (
                  <p key={index} className="text-red-400 text-sm">
                    {error}
                  </p>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="p-3 rounded-lg border border-red-500/50 bg-red-500/10">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Boutons de navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={currentStep === 1 ? onBack : prevStep}
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          <ArrowLeft className="size-4 mr-2" />
          {currentStep === 1 ? "Choisir un autre type" : "Précédent"}
        </Button>

        {currentStep < steps.length ? (
          <Button
            onClick={nextStep}
            disabled={!isStepValid()}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Suivant
            <ArrowRight className="size-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={loading || !isStepValid()}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {loading ? "Création du compte..." : "Créer mon compte professionnel"}
          </Button>
        )}
      </div>
    </div>
  );
}
