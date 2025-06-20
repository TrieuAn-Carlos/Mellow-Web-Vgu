// Animation utility functions for the Mellow app
import anime, { AnimeParams } from 'animejs/lib/anime.es.js';

// Animation presets object with typed parameters
export interface AnimationPreset {
  translateY?: [string, string];
  translateX?: [string, string];
  rotate?: [string, string];
  scale?: [number, number];
  opacity?: [number, number];
  duration: number;
  easing: string;
  direction: 'alternate' | 'normal' | 'reverse';
  loop?: boolean | number;
  delay?: number;
  endDelay?: number;
}

// Animation presets
export const animationPresets = {
  // Cloud-like gentle floating motion
  cloudFloat: {
    translateY: ['-15px', '15px'],
    rotate: ['-1deg', '1deg'],
    duration: 4000,
    easing: 'easeInOutSine',
    direction: 'alternate',
    loop: true,
  },
  
  // Subtle hover effect for buttons
  buttonFloat: {
    translateY: ['-5px', '0px'],
    scale: [1, 1.05],
    duration: 2000,
    easing: 'easeInOutQuad',
    direction: 'alternate',
    loop: true,
  },
  
  // Text emphasis animation
  textFloat: {
    translateY: ['-8px', '8px'],
    rotate: ['-0.3deg', '0.3deg'],
    duration: 5000,
    easing: 'easeInOutSine',
    direction: 'alternate',
    loop: true,
  },
  
  // Card element floating
  cardFloat: {
    translateY: ['-10px', '10px'],
    translateX: ['-5px', '5px'],
    rotate: ['-1deg', '1deg'],
    duration: 6000,
    easing: 'easeInOutQuad',
    direction: 'alternate',
    loop: true,
  },
  
  // Logo subtle animation
  logoFloat: {
    translateY: ['-10px', '10px'],
    rotate: ['-0.5deg', '0.5deg'],
    scale: [1, 1.03],
    duration: 3500,
    easing: 'easeInOutSine',
    direction: 'alternate',
    loop: true,
  },
};

// Animation factory function that creates an anime.js animation instance
export const createAnimation = (
  targets: HTMLElement | HTMLElement[],
  preset: AnimationPreset,
  customParams: Partial<AnimeParams> = {}
): anime.AnimeInstance => {
  // Combine preset with custom parameters
  const animationParams: AnimeParams = {
    targets,
    ...preset,
    ...customParams,
    autoplay: true,
  };
  
  return anime(animationParams);
};

// Generate a random number within a range
export const randomInRange = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

// Add randomness to animation parameters
export const addRandomness = (
  preset: AnimationPreset, 
  durationVariance = 1000,
  delayVariance = 500
): AnimationPreset => {
  const randomizedPreset = { ...preset };
  
  // Add randomness to duration
  randomizedPreset.duration += randomInRange(-durationVariance, durationVariance);
  
  // Add random delay if not specified
  if (!randomizedPreset.delay) {
    randomizedPreset.delay = randomInRange(0, delayVariance);
  }
  
  return randomizedPreset;
};
