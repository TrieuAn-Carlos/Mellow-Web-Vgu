"use client";

import React, { ReactNode, useEffect, useState } from 'react';
import useAnime from './useAnime';
import { AnimationPreset, animationPresets } from './AnimationUtils';
import { useAnimation } from './AnimationOrchestrator';

interface FloatingElementProps {
  children: ReactNode;
  preset?: keyof typeof animationPresets | AnimationPreset;
  addVariance?: boolean;
  className?: string;
  delay?: number;
  customParams?: Partial<anime.AnimeParams>;
  disable?: boolean;
  id?: string;
  waitForOrchestrator?: boolean;
}

/**
 * A wrapper component that applies floating animations to its children
 * using anime.js and our animation presets
 */
export const FloatingElement: React.FC<FloatingElementProps> = ({
  children,
  preset = 'cloudFloat',
  addVariance = true,
  className = '',
  delay,
  customParams = {},
  disable = false,
  id,
  waitForOrchestrator = false
}) => {
  const { isInitialized, registerAnimation, animationState } = useAnimation();
  const [shouldAnimate, setShouldAnimate] = useState(!waitForOrchestrator);
  
  // Register with orchestrator if ID is provided
  useEffect(() => {
    if (id && waitForOrchestrator) {
      registerAnimation(id, delay || 0);
    }
  }, [id, delay, registerAnimation, waitForOrchestrator]);
  
  // Start animation when orchestrator triggers it
  useEffect(() => {
    if (waitForOrchestrator && id) {
      if (animationState[id]) {
        setShouldAnimate(true);
      }
    }
  }, [animationState, id, waitForOrchestrator]);
  
  // Start animation when orchestrator is initialized (if not waiting for specific ID)
  useEffect(() => {
    if (waitForOrchestrator && !id && isInitialized) {
      setShouldAnimate(true);
    }
  }, [isInitialized, id, waitForOrchestrator]);
  
  // Determine which preset to use
  const animationPreset = typeof preset === 'string' 
    ? { ...animationPresets[preset] }
    : preset;
    
  // Apply delay if provided
  if (delay !== undefined) {
    animationPreset.delay = delay;
  }
  // Create reference with animation hook
  const elementRef = useAnime<HTMLDivElement>({
    preset: animationPreset,
    shouldAnimate: shouldAnimate && !disable,
    addVariance,
    customParams: {
      // Enable smooth transition to prevent jumping
      smoothStart: true,
      // Slight delay start to ensure smooth transition
      delayStart: true,
      ...customParams
    }
  });

  return (
    <div 
      ref={elementRef}
      className={className}
    >
      {children}
    </div>
  );
};

export default FloatingElement;
