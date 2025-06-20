"use client";

import React, { useEffect, useRef } from 'react';
import anime from 'animejs/lib/anime.es.js';
import { useAnimation } from './AnimationOrchestrator';

interface SimpleTextAnimationProps {
  children: React.ReactNode;
  id?: string;
  delay?: number;
  duration?: number;
  className?: string;
  floatDelay?: number;
  floatEnabled?: boolean;
}

/**
 * A simplified text animation component that preserves HTML structure
 * and adds a nice fade in effect followed by a gentle floating animation
 */
export const SimpleTextAnimation: React.FC<SimpleTextAnimationProps> = ({
  children,
  id,
  delay = 0,
  duration = 800,
  className = '',
  floatDelay = 0,
  floatEnabled = true
}) => {
  const { isInitialized } = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);
    // Animation effect
  useEffect(() => {
    if (!containerRef.current || hasAnimated.current) return;
    
    const container = containerRef.current;
    
    // First animate the entire container with fade in
    anime({
      targets: container,
      opacity: [0, 1],
      translateY: ['20px', '0px'],
      duration: duration,
      easing: 'easeOutCubic',
      delay: delay,
      complete: () => {
        // After fade in, add floating effect if enabled
        if (floatEnabled) {
          // Start with the current position after fadeIn
          const currentY = parseFloat(getComputedStyle(container).transform.split(',')[5]) || 0;
          
          setTimeout(() => {
            anime({
              targets: container,
              // Start from current position to avoid the "jump"
              translateY: [currentY, currentY - 8, currentY + 8],
              rotate: ['0deg', '-0.3deg', '0.3deg'],
              duration: 5000,
              easing: 'easeInOutSine',
              direction: 'alternate',
              loop: true
            });
          }, floatDelay);
        }
      }
    });
    
    hasAnimated.current = true;
  }, [delay, duration, floatDelay, floatEnabled]);
  
  return (
    <div 
      ref={containerRef} 
      className={className}
      style={{ 
        opacity: 0, 
        position: 'relative'
      }}
    >
      {children}
    </div>
  );
};

export default SimpleTextAnimation;
