import { NextRequest } from "next/server";

/**
 * Vérifie si la requête provient d'une source autorisée
 */
export function validateApiRequest(request: NextRequest): { isValid: boolean; error?: string } {
  // 1. Vérifier que ce n'est pas une requête GET directe depuis le navigateur
  if (request.method === "GET") {
    const userAgent = request.headers.get("user-agent") || "";
    const referer = request.headers.get("referer") || "";

    // Détecter les navigateurs populaires dans l'User-Agent
    const browserPatterns = [/Mozilla/, /Chrome/, /Safari/, /Firefox/, /Edge/, /Opera/];

    const isBrowser = browserPatterns.some((pattern) => pattern.test(userAgent));

    // Si c'est un navigateur ET qu'il n'y a pas de referer de notre domaine
    if (isBrowser && !referer.includes(process.env.NEXT_PUBLIC_SITE_URL || "localhost")) {
      return {
        isValid: false,
        error: "Accès direct non autorisé",
      };
    }
  }

  // 2. Vérifier la présence d'un header personnalisé (pour les requêtes fetch)
  const customHeader = request.headers.get("x-requested-with");
  if (!customHeader || customHeader !== "XMLHttpRequest") {
    return {
      isValid: false,
      error: "Header de sécurité manquant",
    };
  }

  // 3. Vérifier l'origine pour les requêtes POST/PUT/DELETE
  if (["POST", "PUT", "DELETE", "PATCH"].includes(request.method)) {
    const origin = request.headers.get("origin");
    const allowedOrigins = [
      process.env.NEXT_PUBLIC_SITE_URL,
      "http://localhost:3000",
      "https://localhost:3000",
    ].filter(Boolean);

    if (!origin || !allowedOrigins.some((allowed) => origin.startsWith(allowed as string))) {
      return {
        isValid: false,
        error: "Origine non autorisée",
      };
    }
  }

  return { isValid: true };
}

/**
 * Middleware de protection pour les routes API
 */
export function withApiProtection(
  handler: (request: NextRequest, context?: unknown) => Promise<Response>,
) {
  return async (request: NextRequest, context?: unknown) => {
    const validation = validateApiRequest(request);

    if (!validation.isValid) {
      return new Response(JSON.stringify({ error: validation.error }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    return handler(request, context);
  };
}

/**
 * Génère un token CSRF simple pour les formulaires
 */
export function generateCSRFToken(): string {
  return crypto.getRandomValues(new Uint32Array(4)).join("-");
}

/**
 * Vérifie un token CSRF
 */
export function validateCSRFToken(token: string, sessionToken: string): boolean {
  return token === sessionToken && token.length > 10;
}
