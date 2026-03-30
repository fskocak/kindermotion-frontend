"use client";

import { useEffect, useRef } from "react";

import { useAuthStore } from "@/store/auth.store";

export function AuthBootstrapper() {
  const bootstrapAuth = useAuthStore((state) => state.bootstrapAuth);
  const hasBootstrappedRef = useRef(false);

  useEffect(() => {
    if (hasBootstrappedRef.current) {
      return;
    }

    hasBootstrappedRef.current = true;
    void bootstrapAuth();
  }, [bootstrapAuth]);

  return null;
}
