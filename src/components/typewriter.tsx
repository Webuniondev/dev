"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Word = { text: string; className?: string };

type Props = {
  words: Word[];
  className?: string;
  cursorClassName?: string;
  msPerChar?: number;
  holdMs?: number;
};

// Simple typewriter effect inspired by Aceternity UI Typewriter Effect
// Reference: https://ui.aceternity.com/components/typewriter-effect
export function Typewriter({
  words,
  className,
  cursorClassName,
  msPerChar = 28,
  holdMs = 650,
}: Props) {
  const [index, setIndex] = useState(0); // current word index
  const [count, setCount] = useState(0); // characters revealed in current word
  const [showCursor, setShowCursor] = useState(true);
  const timerRef = useRef<number | null>(null);

  const current = words[index] ?? { text: "" };

  const previousNodes = useMemo(() => {
    return words.slice(0, index).map((w, i) => (
      <span key={`prev-${i}`} className={w.className}>
        {w.text}{" "}
      </span>
    ));
  }, [index, words]);

  useEffect(() => {
    // typing loop for current word
    if (count < current.text.length) {
      timerRef.current = window.setTimeout(() => setCount((c) => c + 1), msPerChar);
      return () => {
        if (timerRef.current) window.clearTimeout(timerRef.current);
      };
    }
    // when a word is complete, proceed immediately to the next word (holdMs can delay if set)
    const t = window.setTimeout(() => {
      if (index < words.length - 1) {
        setIndex((i) => i + 1);
        setCount(0);
      } else {
        setShowCursor(false);
      }
    }, holdMs);
    return () => window.clearTimeout(t);
  }, [count, current.text.length, holdMs, index, msPerChar, words.length]);

  const cursor = showCursor ? (
    <span
      className={cursorClassName ?? "ml-0.5 inline-block w-px bg-foreground animate-pulse"}
      aria-hidden
    />
  ) : null;

  return (
    <div className={className} aria-label={words.map((w) => w.text).join(" ")}>
      {/* Accessible full text for SEO via aria-label */}
      {previousNodes}
      <span className={current.className}>{current.text.slice(0, count)}</span>
      {cursor}
    </div>
  );
}
