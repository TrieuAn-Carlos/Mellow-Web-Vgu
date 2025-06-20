"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Animation orchestrator context type
type AnimationContextType = {
  isInitialized: boolean;
  triggerAnimation: (id: string) => void;
  registerAnimation: (id: string, delay?: number) => void;
  animationState: Record<string, boolean>;
};

// Create the context with default values
const AnimationContext = createContext<AnimationContextType>({
  isInitialized: false,
  triggerAnimation: () => {},
  registerAnimation: () => {},
  animationState: {},
});

// Hook to use animation context
export const useAnimation = () => useContext(AnimationContext);

interface AnimationOrchestratorProps {
  children: ReactNode;
  autoInit?: boolean;
  initDelay?: number;
}

/**
 * A component that orchestrates animations across the landing page
 * Allows for sequencing animations and controlling when they start
 */
export const AnimationOrchestrator: React.FC<AnimationOrchestratorProps> = ({
  children,
  autoInit = true,
  initDelay = 100,
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [animationState, setAnimationState] = useState<Record<string, boolean>>({});
  const [registeredAnimations, setRegisteredAnimations] = useState<Record<string, number>>({});

  // Initialize animations with optional delay
  useEffect(() => {
    if (autoInit) {
      const timer = setTimeout(() => {
        setIsInitialized(true);
      }, initDelay);
      
      return () => clearTimeout(timer);
    }
  }, [autoInit, initDelay]);

  // Trigger animations when initialized
  useEffect(() => {
    if (isInitialized) {
      // Sort animations by delay
      const sortedAnimations = Object.entries(registeredAnimations)
        .sort(([, delayA], [, delayB]) => delayA - delayB);
      
      // Trigger animations in sequence
      sortedAnimations.forEach(([id, delay]) => {
        setTimeout(() => {
          setAnimationState(prev => ({
            ...prev,
            [id]: true
          }));
        }, delay);
      });
    }
  }, [isInitialized, registeredAnimations]);

  // Register a new animation with the orchestrator
  const registerAnimation = (id: string, delay = 0) => {
    setRegisteredAnimations(prev => ({
      ...prev,
      [id]: delay
    }));
  };

  // Manually trigger a specific animation
  const triggerAnimation = (id: string) => {
    setAnimationState(prev => ({
      ...prev,
      [id]: true
    }));
  };

  // Context value
  const contextValue = {
    isInitialized,
    triggerAnimation,
    registerAnimation,
    animationState,
  };

  return (
    <AnimationContext.Provider value={contextValue}>
      {children}
    </AnimationContext.Provider>
  );
};

export default AnimationOrchestrator;
