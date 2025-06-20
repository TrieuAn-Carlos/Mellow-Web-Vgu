"use client";

import { useEffect, useRef } from 'react';
import anime from 'animejs/lib/anime.es.js';
import { AnimationPreset, addRandomness } from './AnimationUtils';

interface UseAnimeProps {
  preset: AnimationPreset;
  shouldAnimate?: boolean;
  addVariance?: boolean;
  customParams?: Partial<anime.AnimeParams>;
  dependencies?: any[];
}

/**
 * Custom hook for applying anime.js animations to React components
 * 
 * @param preset - Animation preset from AnimationUtils
 * @param shouldAnimate - Flag to control animation (default: true)
 * @param addVariance - Add random variance to animation params (default: false)
 * @param customParams - Override or extend animation parameters
 * @param dependencies - Additional dependencies for the useEffect
 * @returns React ref to attach to the element
 */
export const useAnime = <T extends HTMLElement>({
  preset,
  shouldAnimate = true,
  addVariance = false,
  customParams = {},
  dependencies = []
}: UseAnimeProps) => {
  const elementRef = useRef<T>(null);
  const animeRef = useRef<anime.AnimeInstance | null>(null);
    useEffect(() => {
    // Don't animate if shouldAnimate is false or element doesn't exist
    if (!shouldAnimate || !elementRef.current) return;
    
    // Apply animation preset with optional randomness
    let animationPreset = addVariance ? addRandomness(preset) : {...preset};
    
    // For smoother transitions, modify the animation parameters
    if (customParams?.smoothStart && animationPreset.translateY) {
      // Start from current position (0) and then animate to target positions
      const targetY = animationPreset.translateY[1];
      animationPreset.translateY = ['0px', targetY];
      
      // Also smooth rotation start if present
      if (animationPreset.rotate) {
        animationPreset.rotate = ['0deg', animationPreset.rotate[1]];
      }
    }
    
    // Make sure animation starts with a delay to let fadeIn complete
    if (customParams?.delayStart && !animationPreset.delay) {
      animationPreset.delay = 100;
    }
    
    // Create the animation instance with easing that starts slowly
    animeRef.current = anime({
      targets: elementRef.current,
      ...animationPreset,
      ...customParams,
      easing: customParams.easing || animationPreset.easing || 'easeOutSine',
      autoplay: true
    });
    
    // Cleanup function to stop animation when component unmounts
    return () => {
      if (animeRef.current) {
        animeRef.current.pause();
      }
    };
  }, [shouldAnimate, preset, addVariance, customParams, ...dependencies]);
  
  return elementRef;
};

export default useAnime;
