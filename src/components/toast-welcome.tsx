"use client";

import { useEffect, useRef } from "react";

import { useAuthStore } from "@/lib/store/auth";

export function ToastWelcome() {
  const displayName = useAuthStore((s) => s.displayName);
  const hasShown = useRef(false);

  useEffect(() => {
    if (hasShown.current) return;
    if (!displayName) return;
    hasShown.current = true;
    const div = document.createElement("div");
    div.textContent = `Bonjour ${displayName}!`;
    div.style.position = "fixed";
    div.style.right = "16px";
    div.style.bottom = "16px";
    div.style.background = "#22c55e"; // green-500
    div.style.color = "white";
    div.style.padding = "8px 12px";
    div.style.borderRadius = "8px";
    div.style.boxShadow = "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)";
    div.style.zIndex = "9999";
    document.body.appendChild(div);
    const t = setTimeout(() => {
      div.remove();
    }, 3000);
    return () => clearTimeout(t);
  }, [displayName]);

  return null;
}


