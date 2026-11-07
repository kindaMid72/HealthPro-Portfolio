"use client";

import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  const id = setInterval(onChange, 15_000);
  return () => clearInterval(id);
}

/**
 * Current epoch minute; `null` during SSR and hydration.
 * ISR HTML is unaware of "today", so time-dependent display appears after mount.
 */
export function useNowMinute(): number | null {
  return useSyncExternalStore(
    subscribe,
    () => Math.floor(Date.now() / 60_000),
    () => null,
  );
}
