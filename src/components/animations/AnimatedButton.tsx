"use client";

import React, { ReactNode, useState, useEffect } from 'react';
import anime from 'animejs/lib/anime.es.js';
import FloatingElement from './FloatingElement';
import { useAnimation } from './AnimationOrchestrator';

interface AnimatedButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  hoverScale?: number;
  hoverY?: number;
  floatEnabled?: boolean;
  floatDelay?: number;
  id?: string;
  waitForOrchestrator?: boolean;
  hoverShadowColor?: string;
  initialShadowColor?: string;
}

/**
 * A button component with built-in animations for floating effect and hover states
 */
export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  onClick,
  className = '',
  hoverScale = 1.05,
  hoverY = -5,
  floatEnabled = true,
  floatDelay = 0,
  id,
  waitForOrchestrator = false,
  hoverShadowColor = 'rgba(113,68,198,0.5)',
  initialShadowColor = 'rgba(113,68,198,0.3)'
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { isInitialized, registerAnimation, animationState } = useAnimation();
  const [shouldAnimate, setShouldAnimate] = useState(!waitForOrchestrator);
  
  // Register with orchestrator if ID is provided
  useEffect(() => {
    if (id && waitForOrchestrator) {
      registerAnimation(id, floatDelay || 0);
    }
  }, [id, floatDelay, registerAnimation, waitForOrchestrator]);
  
  // Start animation when orchestrator triggers it
  useEffect(() => {
    if (waitForOrchestrator) {
      if ((id && animationState[id]) || (!id && isInitialized)) {
        setShouldAnimate(true);
      }
    }
  }, [animationState, id, isInitialized, waitForOrchestrator]);
  
  // Button component with event handlers
  const ButtonComponent = (
    <button
      className={`relative ${className}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: isHovered ? `translateY(${hoverY}px) scale(${hoverScale})` : 'translateY(0) scale(1)',
        boxShadow: isHovered 
          ? `0 8px 20px ${hoverShadowColor}` 
          : `0 4px 15px ${initialShadowColor}`,
        transition: 'transform 0.3s ease, box-shadow 0.3s ease'
      }}
    >
      {children}
    </button>
  );
    // Apply floating animation if enabled
  if (floatEnabled && shouldAnimate) {
    return (
      <FloatingElement 
        preset="buttonFloat" 
        delay={floatDelay}
        customParams={{
          scale: [1, 1.02],
          translateY: ['0px', '-2px', '2px'], // Start from neutral position
          duration: 3000,
          easing: 'easeInOutSine',
          smoothStart: true,
          delayStart: true
        }}
      >
        {ButtonComponent}
      </FloatingElement>
    );
  }
  
  // Return button without floating animation
  return ButtonComponent;
};

export default AnimatedButton;
