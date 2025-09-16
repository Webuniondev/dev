import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Proxy tunnel pour Sentry afin d'éviter les blocages réseau/extension
export async function POST(req: NextRequest) {
  const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) {
    return new NextResponse("Missing SENTRY_DSN", { status: 500 });
  }

  const origin = new URL(dsn).origin;
  const envelope = await req.text();
  const target = `${origin}/api/${new URL(dsn).pathname.split("/").pop()}/envelope/`;

  const res = await fetch(target, {
    method: "POST",
    headers: { "Content-Type": "application/x-sentry-envelope" },
    body: envelope,
    // Important pour Next.js edge/node
    cache: "no-store",
  });

  return new NextResponse(null, { status: res.status });
}




