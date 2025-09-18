import type { CspDirectives } from "@next-safe/middleware";
import { chainMatch, csp, isPageRequest } from "@next-safe/middleware";

const isDev = process.env.NODE_ENV !== "production";

// Extraire l'origine du DSN Sentry pour l'autoriser dans connect-src
const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN || "";
let sentryOrigin: string | undefined;
try {
  if (sentryDsn) {
    sentryOrigin = new URL(sentryDsn).origin;
  }
} catch {}

// Autoriser également l'origine Supabase si définie
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
let supabaseOrigin: string | undefined;
try {
  if (supabaseUrl) {
    supabaseOrigin = new URL(supabaseUrl).origin;
  }
} catch {}

const DIRECTIVES_DEV = {
  "base-uri": ["self"],
  "default-src": ["self"],
  "script-src": ["self", "unsafe-inline", "unsafe-eval"],
  "style-src": ["self", "unsafe-inline"],
  // Autoriser images externes en dev (dont Supabase)
  "img-src": ["self", "data:", "blob:", "https:", ...(supabaseOrigin ? [supabaseOrigin] : [])],
  "font-src": ["self", "data:"],
  "connect-src": [
    "self",
    "ws:",
    "wss:",
    "localhost:*",
    "https:",
    ...(sentryOrigin ? [sentryOrigin] : []),
    ...(supabaseOrigin ? [supabaseOrigin] : []),
  ],
  "frame-ancestors": ["self"],
  "frame-src": ["self"],
  "object-src": ["none"],
};

const DIRECTIVES_PROD = {
  "base-uri": ["self"],
  "default-src": ["self"],
  "script-src": [
    "self",
    // Autoriser les scripts inline de Next.js pour l'hydratation
    "unsafe-inline",
    // CDNs Vercel pour Next.js
    "https://va.vercel-scripts.com",
    "https://vitals.vercel-insights.com",
  ],
  "style-src": [
    "self",
    // Autoriser les styles inline pour Tailwind et composants
    "unsafe-inline",
  ],
  // Autoriser images externes (dont Supabase) de manière contrôlée
  "img-src": ["self", "data:", "blob:", "https:", ...(supabaseOrigin ? [supabaseOrigin] : [])],
  "font-src": ["self", "data:", "https:"],
  "connect-src": [
    "self",
    "https:",
    // Analytics Vercel
    "https://vitals.vercel-insights.com",
    ...(sentryOrigin ? [sentryOrigin] : []),
    ...(supabaseOrigin ? [supabaseOrigin] : []),
  ],
  "frame-ancestors": ["self"],
  "frame-src": ["self"],
  "object-src": ["none"],
};

const directives = isDev ? DIRECTIVES_DEV : DIRECTIVES_PROD;

export default chainMatch(isPageRequest)(
  csp({ directives: directives as unknown as CspDirectives, reportOnly: false }),
);

export const config = { matcher: "/:path*" };
