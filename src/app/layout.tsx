import "./globals.css";

import type { Metadata } from "next";
import { Caveat, Geist, Geist_Mono, Inter } from "next/font/google";

import { AuthGateway } from "@/components/auth-gateway";
import { AuthWelcomeListener } from "@/components/auth-welcome-listener";
import { ToasterSonner } from "@/components/sonner-toaster";
import { supabaseServer } from "@/lib/supabase/server";

import { AppProviders } from "./providers";
import { SentryInit } from "./sentry-init";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Ourspace – Trouvez le pro idéal, au bon endroit, au bon moment",
    template: "%s | Ourspace",
  },
  description:
    "Ourspace met en relation particuliers et professionnels. Recherchez, comparez, et contactez le bon pro en quelques minutes dans toute la France.",
  keywords: ["professionnel", "artisan", "service", "devis", "mise en relation", "france"],
  authors: [{ name: "Ourspace" }],
  creator: "Ourspace",
  publisher: "Ourspace",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://ourspace.fr"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "/",
    title: "Ourspace – Trouvez le pro idéal",
    description:
      "Recherchez, comparez et contactez des professionnels de confiance partout en France.",
    siteName: "Ourspace",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ourspace – Trouvez le pro idéal",
    description:
      "Recherchez, comparez et contactez des professionnels de confiance partout en France.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${caveat.variable} font-sans antialiased`}
      >
        <SentryInit />
        <AppProviders>
          <UserSnapshot>{children}</UserSnapshot>
        </AppProviders>
        <ToasterSonner />
        {/* Déclenchement client au SIGNED_IN */}
        <AuthWelcomeListener />
      </body>
    </html>
  );
}

async function UserSnapshot({ children }: { children: React.ReactNode }) {
  const supabase = await supabaseServer({ readOnly: true });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let roleKey: "user" | "pro" | "admin" | null = null;
  let displayName: string | null = null;
  let avatarUrl: string | null = null;
  if (user) {
    const { data: prof } = await supabase
      .from("user_profile")
      .select("role_key, first_name, last_name, avatar_url")
      .eq("user_id", user.id)
      .maybeSingle();
    roleKey = (prof?.role_key as "user" | "pro" | "admin" | null) ?? null;
    displayName = `${prof?.first_name ?? ""} ${prof?.last_name ?? ""}`.trim() || null;
    avatarUrl = prof?.avatar_url ?? user.user_metadata?.avatar_url ?? null;
  }

  return (
    <>
      {/* Hydrate Zustand auth store on client */}
      <AuthGateway
        userId={user?.id ?? null}
        email={user?.email ?? null}
        roleKey={roleKey}
        displayName={displayName ?? user?.user_metadata?.full_name ?? null}
        avatarUrl={avatarUrl ?? null}
      />
      {children}
    </>
  );
}
