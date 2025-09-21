"use client";

import { MousePointerClick } from "lucide-react";
import { motion } from "motion/react";

type Props = { className?: string };

export function CursorNudge({ className }: Props) {
  return (
    <motion.div
      initial={{ x: 80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
      className={className}
      aria-hidden
    >
      <MousePointerClick className="size-7 sm:size-9 text-[#0F172B] rotate-6" />
    </motion.div>
  );
}
