"use client";

import { useState, useEffect } from "react";
import SplashScreen from "@/components/SplashScreen";

export function AppInitializer({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null; // Or a basic loader, but null is fine to avoid flash
  }

  if (showSplash) {
    return <SplashScreen onFinished={() => setShowSplash(false)} />;
  }

  return <>{children}</>;
}
