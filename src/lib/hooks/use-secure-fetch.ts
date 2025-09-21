"use client";

import { useCallback } from "react";

/**
 * Hook pour effectuer des requêtes sécurisées vers les API routes
 */
export function useSecureFetch() {
  const secureFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    try {
      // Ajouter les headers de sécurité automatiquement
      const secureHeaders = {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest", // Header anti-CSRF
        ...options.headers,
      };

      // Fusionner les options
      const secureOptions: RequestInit = {
        ...options,
        headers: secureHeaders,
      };

      // Effectuer la requête
      const response = await fetch(url, secureOptions);

      // Vérifier si la réponse existe
      if (!response) {
        throw new Error("Aucune réponse du serveur");
      }

      // Vérifier le statut de la réponse
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP Error: ${response.status}`);
      }

      return response;
    } catch (error) {
      // Si c'est déjà notre erreur, la relancer
      if (error instanceof Error) {
        throw error;
      }
      // Sinon, créer une erreur générique
      throw new Error("Erreur lors de la requête");
    }
  }, []);

  const secureGet = useCallback(
    async (url: string) => {
      return secureFetch(url, { method: "GET" });
    },
    [secureFetch],
  );

  const securePost = useCallback(
    async (url: string, data: unknown) => {
      return secureFetch(url, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    [secureFetch],
  );

  const securePut = useCallback(
    async (url: string, data: unknown) => {
      return secureFetch(url, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    [secureFetch],
  );

  const securePatch = useCallback(
    async (url: string, data: unknown) => {
      return secureFetch(url, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    [secureFetch],
  );

  const secureDelete = useCallback(
    async (url: string) => {
      return secureFetch(url, { method: "DELETE" });
    },
    [secureFetch],
  );

  return {
    secureFetch,
    secureGet,
    securePost,
    securePut,
    securePatch,
    secureDelete,
  };
}

/**
 * Hook pour récupérer les départements de manière sécurisée
 */
export function useDepartments() {
  const { secureGet } = useSecureFetch();

  const fetchDepartments = useCallback(async () => {
    const response = await secureGet("/api/departments");
    return response.json();
  }, [secureGet]);

  return { fetchDepartments };
}
