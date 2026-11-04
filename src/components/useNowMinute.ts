"use client";

import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  const id = setInterval(onChange, 15_000);
  return () => clearInterval(id);
}

/**
 * Menit-sejak-epoch saat ini; `null` di server dan saat hidrasi.
 * HTML ISR tidak tahu "hari ini", jadi tampilan bergantung waktu baru muncul setelah mount.
 */
export function useNowMinute(): number | null {
  return useSyncExternalStore(
    subscribe,
    () => Math.floor(Date.now() / 60_000),
    () => null,
  );
}
