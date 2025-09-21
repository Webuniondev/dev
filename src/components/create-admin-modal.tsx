"use client";

import { useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useSecureFetch } from "@/lib/hooks/use-secure-fetch";

interface CreateAdminModalProps {
  onAdminCreated?: () => void;
  trigger?: React.ReactNode;
}

export function CreateAdminModal({ onAdminCreated, trigger }: CreateAdminModalProps) {
  const { securePost } = useSecureFetch();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    phone_number: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await securePost("/api/admin/create-admin", formData);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la création");
      }

      const result = await response.json();
      setSuccess(result.message);

      // Réinitialiser le formulaire
      setFormData({
        email: "",
        password: "",
        first_name: "",
        last_name: "",
        phone_number: "",
      });

      // Notifier le parent et fermer la modal après un délai
      setTimeout(() => {
        onAdminCreated?.();
        setIsOpen(false);
        setSuccess(null);
      }, 2000);
    } catch (err) {
      console.error("Erreur création admin:", err);
      setError(err instanceof Error ? err.message : "Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Effacer les messages d'erreur/succès quand l'utilisateur modifie le formulaire
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const defaultTrigger = (
    <button className="px-4 py-2 text-white rounded text-sm" style={{ backgroundColor: "#0f0f0f" }}>
      ➕ Créer un admin
    </button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent
        className="sm:max-w-md"
        style={{ backgroundColor: "#181818", border: "1px solid #374151" }}
      >
        <DialogHeader>
          <DialogTitle className="text-white">Créer un administrateur</DialogTitle>
        </DialogHeader>

        <Card className="border-0" style={{ backgroundColor: "transparent" }}>
          <CardContent className="p-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nom et prénom */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Prénom *</label>
                  <input
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={(e) => handleInputChange("first_name", e.target.value)}
                    className="w-full px-3 py-2 rounded text-white placeholder-gray-400 border border-gray-600 focus:border-gray-400 focus:outline-none"
                    style={{ backgroundColor: "#0f0f0f" }}
                    placeholder="Jean"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Nom *</label>
                  <input
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={(e) => handleInputChange("last_name", e.target.value)}
                    className="w-full px-3 py-2 rounded text-white placeholder-gray-400 border border-gray-600 focus:border-gray-400 focus:outline-none"
                    style={{ backgroundColor: "#0f0f0f" }}
                    placeholder="Dupont"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm text-gray-300 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full px-3 py-2 rounded text-white placeholder-gray-400 border border-gray-600 focus:border-gray-400 focus:outline-none"
                  style={{ backgroundColor: "#0f0f0f" }}
                  placeholder="admin@ourspace.fr"
                />
              </div>

              {/* Mot de passe */}
              <div>
                <label className="block text-sm text-gray-300 mb-1">Mot de passe *</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className="w-full px-3 py-2 rounded text-white placeholder-gray-400 border border-gray-600 focus:border-gray-400 focus:outline-none"
                  style={{ backgroundColor: "#0f0f0f" }}
                  placeholder="Minimum 8 caractères"
                  minLength={8}
                />
              </div>

              {/* Téléphone (optionnel) */}
              <div>
                <label className="block text-sm text-gray-300 mb-1">Téléphone</label>
                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => handleInputChange("phone_number", e.target.value)}
                  className="w-full px-3 py-2 rounded text-white placeholder-gray-400 border border-gray-600 focus:border-gray-400 focus:outline-none"
                  style={{ backgroundColor: "#0f0f0f" }}
                  placeholder="+33 1 23 45 67 89"
                />
              </div>

              {/* Messages */}
              {error && (
                <div className="p-3 rounded border border-red-500/50 bg-red-500/10">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {success && (
                <div className="p-3 rounded border border-green-500/50 bg-green-500/10">
                  <p className="text-green-400 text-sm">{success}</p>
                </div>
              )}

              {/* Boutons */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white border border-gray-600 rounded"
                  disabled={loading}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-white rounded disabled:opacity-50"
                  style={{ backgroundColor: "#0f0f0f" }}
                >
                  {loading ? "Création..." : "Créer l'admin"}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
