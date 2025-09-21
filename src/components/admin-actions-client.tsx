"use client";

import { CreateAdminModal } from "@/components/create-admin-modal";

export function AdminActionsClient() {
  const handleAdminCreated = () => {
    // Rafraîchir la page après création d'un admin
    window.location.reload();
  };

  return (
    <CreateAdminModal
      onAdminCreated={handleAdminCreated}
      trigger={
        <button
          className="w-full px-4 py-2 text-white rounded-md"
          style={{ backgroundColor: "#0f0f0f" }}
        >
          ➕ Créer un utilisateur admin
        </button>
      }
    />
  );
}
