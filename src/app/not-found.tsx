import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-3 p-8 text-center">
      <h1 className="text-3xl font-semibold">Page introuvable</h1>
      <p className="text-muted-foreground">La ressource demandée n’existe pas ou a été déplacée.</p>
      <Link
        href="/"
        className="rounded-md border bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
      >
        Retour à l’accueil
      </Link>
    </div>
  );
}
