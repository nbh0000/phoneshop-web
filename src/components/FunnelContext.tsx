"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { FunnelPreset } from "@/types";
import { FunnelModal } from "./funnel/FunnelModal";

interface Ctx {
  open: (preset?: FunnelPreset) => void;
  close: () => void;
}
const FunnelCtx = createContext<Ctx | null>(null);

export function FunnelProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ open: boolean; preset: FunnelPreset; key: number }>({
    open: false,
    preset: {},
    key: 0,
  });

  const open = useCallback((preset: FunnelPreset = {}) => {
    setState((s) => ({ open: true, preset, key: s.key + 1 }));
  }, []);
  const close = useCallback(() => setState((s) => ({ ...s, open: false })), []);
  const value = useMemo(() => ({ open, close }), [open, close]);

  return (
    <FunnelCtx.Provider value={value}>
      {children}
      {state.open && <FunnelModal key={state.key} preset={state.preset} onClose={close} />}
    </FunnelCtx.Provider>
  );
}

export function useFunnel() {
  const ctx = useContext(FunnelCtx);
  if (!ctx) throw new Error("useFunnel must be used within FunnelProvider");
  return ctx;
}
