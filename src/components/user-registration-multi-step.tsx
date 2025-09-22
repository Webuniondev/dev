"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useSecureFetch } from "@/lib/hooks/use-secure-fetch";

interface Department {
  code: string;
  name: string;
}

interface UserRegistrationMultiStepProps {
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
    description: "Nom, adresse et mot de passe",
  },
];

export function UserRegistrationMultiStep({ onBack, onSuccess }: UserRegistrationMultiStepProps) {
  const { securePost, secureGet } = useSecureFetch();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);

  // Données du formulaire
  const [formData, setFormData] = useState({
    // Étape 1: Email
    email: "",

    // Étape 2: Personnel + Localisation + Mot de passe
    first_name: "",
    last_name: "",
    phone_number: "",
    address: "",
    city: "",
    department_code: "",
    password: "",
    confirmPassword: "",
  });

  // États pour la validation
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

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
      } finally {
        setLoadingData(false);
      }
    };

    fetchDepartments();
  }, [secureGet]);

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
  const checkEmailAvailability = useCallback(
    async (email: string) => {
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
    },
    [securePost],
  );

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

  // Vérification automatique de l'email (debounce) pour activer le bouton "Suivant"
  useEffect(() => {
    if (!formData.email) {
      setEmailAvailable(null);
      return;
    }
    const t = setTimeout(() => {
      checkEmailAvailability(formData.email);
    }, 400);
    return () => clearTimeout(t);
  }, [formData.email, checkEmailAvailability]);

  const nextStep = () => {
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

    const userData = {
      account_type: "user" as const,
      email: formData.email,
      password: formData.password,
      first_name: formData.first_name,
      last_name: formData.last_name,
      phone_number: formData.phone_number || "",
      address: formData.address || "",
      city: formData.city || "",
      department_code: formData.department_code || "",
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

  const isStepValid = () => {
    switch (currentStep) {
      case 1: // Email
        return formData.email && emailAvailable === true && !emailChecking;
      case 2: // Personnel + Mot de passe
        return (
          formData.first_name &&
          formData.last_name &&
          formData.password &&
          formData.confirmPassword &&
          passwordErrors.length === 0
        );
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
            <h2 className="text-xl font-bold text-white">Inscription Particulier</h2>
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
        <h2 className="text-xl font-bold text-white">Inscription Particulier</h2>
        <p className="text-white/60 text-sm">Créez votre compte utilisateur</p>
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
                Adresse email *
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData("email", e.target.value)}
                  placeholder="vous@domaine.com"
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
                <p id="email-help" className="text-red-400 text-sm">
                  Cette adresse email est déjà utilisée
                </p>
              )}
              {formData.email && !emailChecking && emailAvailable === true && (
                <p id="email-help" className="text-green-400 text-sm">
                  ✓ Adresse email disponible
                </p>
              )}
            </div>
          </>
        )}

        {currentStep === 2 && (
          <>
            <h3 className="text-lg font-semibold text-white mb-4">Vos informations</h3>

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

            {/* Téléphone */}
            <div className="space-y-1">
              <Label htmlFor="phone_number" className="text-white">
                Téléphone
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

            {/* Adresse et ville */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="address" className="text-white">
                  Adresse
                </Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => updateFormData("address", e.target.value)}
                  placeholder="123 rue de la République"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </div>
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
            </div>

            {/* Département */}
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

            {/* Mots de passe */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="password" className="text-white">
                  Mot de passe *
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => updateFormData("password", e.target.value)}
                  placeholder="8 caractères + 1 chiffre"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="confirmPassword" className="text-white">
                  Confirmez le mot de passe *
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => updateFormData("confirmPassword", e.target.value)}
                  placeholder="Confirmez votre mot de passe"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </div>
            </div>

            {/* Validation mot de passe */}
            {formData.password && (
              <div className="bg-white/5 p-3 rounded-lg space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  {formData.password.length >= 7 ? (
                    <span className="text-green-400">✓</span>
                  ) : (
                    <span className="text-red-400">✗</span>
                  )}
                  <span
                    className={formData.password.length >= 7 ? "text-green-400" : "text-white/70"}
                  >
                    7 caractères minimum
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
                      Mots de passe identiques
                    </span>
                  </div>
                )}
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
            {loading ? "Création du compte..." : "Créer mon compte"}
          </Button>
        )}
      </div>

      <div className="text-center text-white/50 text-xs">
        En vous inscrivant, vous acceptez nos conditions d&apos;utilisation
      </div>
    </div>
  );
}
