import { chainMatch, isPageRequest, csp } from "@next-safe/middleware";
import type { CspDirectives } from "@next-safe/middleware";

const isDev = process.env.NODE_ENV !== "production";

// Extraire l'origine du DSN Sentry pour l'autoriser dans connect-src
const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN || "";
let sentryOrigin: string | undefined;
try {
  if (sentryDsn) {
    sentryOrigin = new URL(sentryDsn).origin;
  }
} catch {}

const DIRECTIVES_DEV = {
  "base-uri": ["self"],
  "default-src": ["self"],
  "script-src": ["self", "unsafe-inline", "unsafe-eval"],
  "style-src": ["self", "unsafe-inline"],
  "img-src": ["self", "data:", "blob:"],
  "font-src": ["self", "data:"],
  "connect-src": [
    "self",
    "ws:",
    "wss:",
    "localhost:*",
    "https:",
    ...(sentryOrigin ? [sentryOrigin] : []),
  ],
  "frame-ancestors": ["self"],
  "frame-src": ["self"],
  "object-src": ["none"],
};

const DIRECTIVES_PROD = {
  "base-uri": ["self"],
  "default-src": ["self"],
  "script-src": ["self"],
  "style-src": ["self"],
  "img-src": ["self", "data:", "blob:"],
  "font-src": ["self", "data:"],
  "connect-src": ["self", ...(sentryOrigin ? [sentryOrigin] : [])],
  "frame-ancestors": ["self"],
  "frame-src": ["self"],
  "object-src": ["none"],
};

const directives = isDev ? DIRECTIVES_DEV : DIRECTIVES_PROD;

export default chainMatch(isPageRequest)(
  csp({ directives: directives as unknown as CspDirectives, reportOnly: false })
);

export const config = { matcher: "/:path*" };

