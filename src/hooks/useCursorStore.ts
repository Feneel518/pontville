"use client";

import { ReactNode } from "react";
import { create } from "zustand";

export type CursorType = "default" | "hover" | "label" | "weekly";

type Store = {
  type: CursorType;
  label: ReactNode;
  setCursor: ({ type, label }: { type: CursorType; label: ReactNode }) => void;
};

const useCursorStore = create<Store>((set) => ({
  type: "default",
  label: null,
  setCursor: ({ type, label }) => set({ type, label }),
}));

export default useCursorStore;
