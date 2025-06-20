"use client";

import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { AnimationPreset, animationPresets } from './AnimationUtils';
import FadeIn from './FadeIn';
import FloatingElement from './FloatingElement';
import TextAnimation from './TextAnimation';
import SimpleTextAnimation from './SimpleTextAnimation';
import AnimatedButton from './AnimatedButton';
import anime from 'animejs/lib/anime.es.js';

export type ScrollRevealType = 'fade' | 'float' | 'text' | 'simpleText' | 'button' | 'custom';

interface ScrollRevealProps {
  children: ReactNode;
  type?: ScrollRevealType;
  threshold?: number; // Visibility threshold (0-1)
  rootMargin?: string; // Margin around the root
  triggerOnce?: boolean; // Whether to trigger only once
  delay?: number; // Delay after entering viewport
  duration?: number; // Animation duration
  className?: string;
  preset?: keyof typeof animationPresets | AnimationPreset;
  customParams?: any;
  textAnimationType?: 'fadeIn' | 'typewriter' | 'wavy' | 'highlight';
  splitBy?: 'letter' | 'word' | 'none';
  floatDelay?: number;
  floatEnabled?: boolean;
  debug?: boolean; // Show debug outline
}

/**
 * A component that reveals its children with animations when scrolled into view
 * Uses IntersectionObserver to detect when the element is visible
 */
const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  type = 'fade',
  threshold = 0.1,
  rootMargin = '0px',
  triggerOnce = true,
  delay = 0,
  duration = 800,
  className = '',
  preset = 'cloudFloat',
  customParams = {},
  textAnimationType = 'fadeIn',
  splitBy = 'none',
  floatDelay = 0,
  floatEnabled = true,
  debug = false
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        const shouldAnimate = entry.isIntersecting && (!triggerOnce || !hasAnimated.current);
        
        if (shouldAnimate) {
          setIsVisible(true);
          if (triggerOnce) {
            hasAnimated.current = true;
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [threshold, rootMargin, triggerOnce]);

  // Custom animation implementation
  const CustomAnimation = () => {
    const customRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
      if (isVisible && customRef.current) {
        setTimeout(() => {
          anime({
            targets: customRef.current,
            ...customParams,
            opacity: [0, 1],
            translateY: customParams.translateY || ['20px', '0px'],
            duration: duration,
            easing: customParams.easing || 'easeOutCubic',
          });
        }, delay);
      }
    }, [isVisible]);

    return (
      <div 
        ref={customRef} 
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

  // Render different animation types based on the type prop
  const renderContent = () => {
    if (!isVisible) {
      return (
        <div 
          className={className} 
          style={{ 
            opacity: 0,
            visibility: 'hidden'
          }}
        >
          {children}
        </div>
      );
    }

    switch (type) {
      case 'fade':
        return (
          <FadeIn 
            delay={delay} 
            duration={duration}
            className={className}
          >
            {children}
          </FadeIn>
        );

      case 'float':
        return (
          <FadeIn 
            delay={delay} 
            duration={duration}
            className={className}
            float={true}
            floatPreset={typeof preset === 'string' ? preset : 'cloudFloat'}
          >
            {children}
          </FadeIn>
        );

      case 'text':
        return (
          <TextAnimation
            delay={delay}
            duration={duration}
            className={className}
            type={textAnimationType}
            splitBy={splitBy}
          >
            {children}
          </TextAnimation>
        );

      case 'simpleText':
        return (
          <SimpleTextAnimation
            delay={delay}
            floatDelay={floatDelay}
            floatEnabled={floatEnabled}
            className={className}
          >
            {children}
          </SimpleTextAnimation>
        );

      case 'button':
        // Handle button case - if children is a button or has onClick
        if (React.isValidElement(children)) {
          return (
            <AnimatedButton
              {...(children.props as any)}
              className={`${className} ${children.props.className || ''}`}
              floatDelay={delay + duration}
            >
              {children.props.children}
            </AnimatedButton>
          );
        }
        
        // Fallback to simple AnimatedButton
        return (
          <AnimatedButton
            floatDelay={delay + duration}
            className={className}
          >
            {children}
          </AnimatedButton>
        );

      case 'custom':
        return <CustomAnimation />;

      default:
        return (
          <FadeIn 
            delay={delay} 
            duration={duration}
            className={className}
          >
            {children}
          </FadeIn>
        );
    }
  };

  return (
    <div 
      ref={elementRef}
      className={debug ? 'debug-outline' : ''}
      style={debug ? {
        outline: '1px solid red',
        outlineOffset: '3px'
      } : {}}
    >
      {renderContent()}
    </div>
  );
};

export default ScrollReveal;
