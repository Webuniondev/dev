import { NextRequest } from "next/server";

/**
 * Vérifie si la requête provient d'une source autorisée
 */
export function validateApiRequest(request: NextRequest): { isValid: boolean; error?: string } {
  // 1. Vérifier que ce n'est pas une requête GET directe depuis le navigateur
  if (request.method === "GET") {
    const userAgent = request.headers.get("user-agent") || "";
    const referer = request.headers.get("referer") || "";
    const currentOrigin = request.nextUrl.origin;

    // Détecter les navigateurs populaires dans l'User-Agent
    const browserPatterns = [/Mozilla/, /Chrome/, /Safari/, /Firefox/, /Edge/, /Opera/];
    const isBrowser = browserPatterns.some((pattern) => pattern.test(userAgent));

  const vercelPreview = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "";
  const allowedOrigins = [currentOrigin, process.env.NEXT_PUBLIC_SITE_URL || "", vercelPreview, "http://localhost", "https://localhost"].filter(Boolean);

    const isAllowedReferer = allowedOrigins.some((origin) => referer.startsWith(origin));

    // Si c'est un navigateur ET que le referer ne correspond pas à l'origine courante/autorisé
    if (isBrowser && !isAllowedReferer) {
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
    const origin = request.headers.get("origin") || "";
    const currentOrigin = request.nextUrl.origin;
    const vercelPreview = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "";
    const allowedOrigins = [currentOrigin, process.env.NEXT_PUBLIC_SITE_URL || "", vercelPreview, "http://localhost:3000", "https://localhost:3000"].filter(Boolean);

    if (!allowedOrigins.some((allowed) => origin.startsWith(allowed))) {
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
