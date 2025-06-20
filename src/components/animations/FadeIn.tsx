"use client";

import React, { useEffect, useRef } from "react";
import anime from "animejs/lib/anime.es.js";
import FloatingElement from "./FloatingElement";
import { AnimationPreset, animationPresets } from "./AnimationUtils";

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  float?: boolean;
  floatPreset?: keyof typeof animationPresets | AnimationPreset;
  style?: React.CSSProperties;
}

export const FadeIn: React.FC<FadeInProps> = ({
  children,
  delay = 0,
  duration = 500,
  className = "",
  float = false,
  floatPreset = "textFloat",
  style = {},
}) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (elementRef.current) {
      // Create the fade-in animation
      anime({
        targets: elementRef.current,
        opacity: [0, 1],
        translateY: ["20px", "0px"],
        duration: duration,
        easing: "easeOutCubic",
        delay: delay,
      });
    }
  }, [delay, duration]);
  // If float is enabled, wrap with FloatingElement for additional cloud-like animation
  if (float) {
    return (
      <div
        ref={elementRef}
        className={`${className}`}
        style={{
          opacity: 0,
          animationFillMode: "both",
          ...style,
        }}
      >
        <FloatingElement
          preset={floatPreset}
          delay={delay + duration + 200} // Start floating after fade-in completes with extra delay for smoothness
          customParams={{
            smoothStart: true, // Enable smooth start transition
            delayStart: true, // Add slight delay to ensure proper starting position
          }}
        >
          {children}
        </FloatingElement>
      </div>
    );
  }

  // Basic fade-in without floating
  return (
    <div
      ref={elementRef}
      className={`${className}`}
      style={{
        opacity: 0,
        animationFillMode: "both",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default FadeIn;
