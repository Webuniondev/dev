"use client";

import { Toaster } from "sonner";

export function ToasterSonner() {
  return (
    <Toaster
      position="bottom-right"
      expand
      toastOptions={{
        duration: 3000,
        style: {
          background: "#0F172B",
          color: "white",
          fontFamily: "var(--font-inter), ui-sans-serif, system-ui, -apple-system",
        },
      }}
    />
  );
}


