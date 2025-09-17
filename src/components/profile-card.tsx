import { supabaseServer } from "@/lib/supabase/server";

export async function ProfileCard() {
  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("user_profile")
    .select("last_name, first_name, address, postal_code, city, phone_number, role_key")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <section className="w-full max-w-xl rounded-xl border p-4">
      <h2 className="text-lg font-semibold mb-2">Votre profil</h2>
      {profile ? (
        <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-muted-foreground">Nom</dt>
            <dd className="font-medium">{profile.last_name}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Prénom</dt>
            <dd className="font-medium">{profile.first_name}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Rôle</dt>
            <dd className="font-medium">{profile.role_key}</dd>
          </div>
          {profile.address ? (
            <div className="sm:col-span-2">
              <dt className="text-sm text-muted-foreground">Adresse</dt>
              <dd className="font-medium">{profile.address}</dd>
            </div>
          ) : null}
          <div>
            <dt className="text-sm text-muted-foreground">Code postal</dt>
            <dd className="font-medium">{profile.postal_code ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Ville</dt>
            <dd className="font-medium">{profile.city ?? "—"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm text-muted-foreground">Téléphone</dt>
            <dd className="font-medium">{profile.phone_number ?? "—"}</dd>
          </div>
        </dl>
      ) : (
        <p className="text-sm text-muted-foreground">Aucun profil pour le moment.</p>
      )}
    </section>
  );
}


