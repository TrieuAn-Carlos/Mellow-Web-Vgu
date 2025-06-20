"use client";
import React from 'react';
import { ScrollReveal } from '../ScrollReveal';
import { MellowLogo } from '../../icons/MellowLogo';

/**
 * Example component showing how to use ScrollReveal animations
 */
const ScrollAnimationExample = () => {
  return (
    <div className="flex flex-col items-center py-20 space-y-24 min-h-[200vh]">
      {/* First section - visible immediately */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Scroll Animation Examples</h2>
        <p className="text-lg text-gray-600 max-w-lg mx-auto">
          Scroll down to see different animation effects triggered by scrolling
        </p>
      </div>

      {/* Fade in example */}
      <ScrollReveal 
        type="fade" 
        delay={100} 
        duration={800}
        threshold={0.3}
        className="w-full max-w-lg p-8 bg-white rounded-lg shadow-md"
      >
        <h3 className="text-2xl font-semibold mb-4 text-[#544350]">Simple Fade In</h3>
        <p className="text-gray-600">
          This element fades in when it enters the viewport. The animation starts
          when 30% of the element is visible in the viewport.
        </p>
      </ScrollReveal>

      {/* Float animation with logo */}
      <ScrollReveal
        type="float"
        delay={200}
        duration={700}
        preset="logoFloat"
        className="flex justify-center"
      >
        <MellowLogo className="w-[146px] h-[121px]" />
      </ScrollReveal>

      {/* Text animation with typewriter effect */}
      <ScrollReveal
        type="text"
        textAnimationType="typewriter"
        delay={100}
        className="text-2xl font-semibold text-[#544350] text-center"
      >
        Typewriter text animation on scroll
      </ScrollReveal>

      {/* Simple text with HTML tags */}
      <ScrollReveal
        type="simpleText"
        delay={200}
        floatDelay={800}
        className="text-3xl font-bold text-[#544350] text-center max-w-2xl"
      >
        Animated text with<br/>line breaks preserved
      </ScrollReveal>

      {/* Button animation */}
      <ScrollReveal
        type="button"
        delay={300}
      >
        <button className="bg-gradient-to-b from-[#af68fd] to-[#7144c6] rounded-[12px] text-white text-[20px] font-bold py-4 px-8">
          Animated Button
        </button>
      </ScrollReveal>

      {/* Custom animation with anime.js parameters */}
      <ScrollReveal
        type="custom"
        delay={200}
        duration={1200}
        customParams={{
          translateX: ['-100px', '0px'],
          rotate: ['45deg', '0deg'],
          easing: 'easeOutElastic(1, .6)'
        }}
        className="w-64 h-64 bg-gradient-to-br from-[#af68fd] to-[#7144c6] rounded-lg flex items-center justify-center"
      >
        <span className="text-white text-xl font-bold">Custom Animation</span>
      </ScrollReveal>
    </div>
  );
};

export default ScrollAnimationExample;
