"use client";

import React from "react";
import ScrollAnimationExample from "@/components/animations/examples/ScrollAnimationExample";

/**
 * Page for demonstrating scroll-based animations
 */
export default function ScrollAnimations() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f2e9f0] to-[#d8c1d1]">
      <ScrollAnimationExample />
    </main>
  );
}
