import { CategoriesBrowser, type Category } from "@/components/categories-browser";
import { supabaseServer } from "@/lib/supabase/server";

export default async function CategoriesBrowserServer({
  variant = "home",
  showHeading = true,
  padding = "normal",
}: {
  variant?: "home" | "all";
  showHeading?: boolean;
  padding?: "normal" | "compact";
}) {
  const supabase = await supabaseServer({ readOnly: true });

  const { data: sectors, error } = await supabase
    .from("pro_sector")
    .select(
      `
      key,
      label,
      description,
      pro_category:pro_category (
        key,
        label,
        description
      )
    `,
    )
    .order("label");

  if (error) {
    // Affiche une section vide en cas d'erreur pour ne pas bloquer l'accueil
    return null;
  }

  const formatted =
    sectors?.map((s) => ({
      key: s.key as string,
      label: s.label as string,
      description: s.description as string | null,
      categories: ((s as { pro_category?: Category[] }).pro_category || []) as Category[],
    })) || [];

  if (!formatted.length) return null;

  return (
    <CategoriesBrowser
      sectors={formatted}
      variant={variant}
      showHeading={showHeading}
      padding={padding}
    />
  );
}
