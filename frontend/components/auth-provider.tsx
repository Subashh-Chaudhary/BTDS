'use client';

import { useAuthStore } from "@/lib/store/auth.store";
import { useEffect } from "react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return children;
}