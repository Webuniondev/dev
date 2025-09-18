"use client";

import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/lib/store/auth";
import { supabaseBrowser } from "@/lib/supabase/client";

type AvatarUploaderProps = {
  initialUrl?: string | null;
};

export function AvatarUploader({ initialUrl }: AvatarUploaderProps) {
  const userId = useAuthStore((s) => s.userId);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialUrl ?? null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const inputEl = e.currentTarget;
    const file = inputEl.files?.[0];
    if (!file || !userId) return;
    setIsUploading(true);
    try {
      const supabase = supabaseBrowser();
      const path = `${userId}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, {
        upsert: true,
        cacheControl: "3600",
        contentType: file.type,
      });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const publicUrl = data.publicUrl;
      setPreviewUrl(publicUrl);

      // Update profile with new avatar URL (PATCH partiel)
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar_url: publicUrl }),
      });

      // Hydrater le store pour mise à jour instantanée (sidebar/header)
      useAuthStore.getState().setAuth({
        userId,
        email: useAuthStore.getState().email,
        roleKey: useAuthStore.getState().roleKey,
        displayName: useAuthStore.getState().displayName ?? null,
        avatarUrl: publicUrl,
      });
    } catch (err) {
      console.error("Avatar upload failed", err);
      alert("Échec de l’upload de l’avatar");
    } finally {
      setIsUploading(false);
      // cleanup input (ne pas utiliser l'event après await)
      if (inputRef.current) {
        inputRef.current.value = "";
      } else {
        inputEl.value = "";
      }
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        {/* Simple preview */}
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="Avatar" className="size-16 rounded-full border" />
        ) : (
          <div className="size-16 rounded-full border bg-slate-100" />
        )}
        <div className="space-y-1">
          <Label htmlFor="avatar">Image de profil</Label>
          <Input
            ref={inputRef}
            id="avatar"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </div>
      </div>
      <div />
    </div>
  );
}


