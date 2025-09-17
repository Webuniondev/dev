"use client";

import { create } from "zustand";

type CounterState = {
  count: number;
  increment: (by?: number) => void;
  decrement: (by?: number) => void;
  reset: () => void;
};

export const useCounterStore = create<CounterState>((set) => ({
  count: 0,
  increment: (by = 1) => set((state) => ({ count: state.count + by })),
  decrement: (by = 1) => set((state) => ({ count: Math.max(0, state.count - by) })),
  reset: () => set({ count: 0 }),
}));
