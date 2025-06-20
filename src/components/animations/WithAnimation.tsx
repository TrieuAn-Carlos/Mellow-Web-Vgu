"use client";

import React from 'react';
import FloatingElement from './FloatingElement';
import TextAnimation from './TextAnimation';
import AnimatedButton from './AnimatedButton';
import { AnimationPreset, animationPresets } from './AnimationUtils';

export type AnimationType = 'float' | 'text' | 'button' | 'none';

interface WithAnimationProps {
  type?: AnimationType;
  children: React.ReactNode;
  id?: string;
  delay?: number;
  className?: string;
  preset?: keyof typeof animationPresets | AnimationPreset;
  customParams?: any;
  textAnimationType?: 'fadeIn' | 'typewriter' | 'wavy' | 'highlight';
  splitBy?: 'letter' | 'word' | 'none';
  waitForOrchestrator?: boolean;
}

/**
 * A HOC that adds animations to any component
 * Makes it easy to apply different types of animations consistently
 */
export const WithAnimation: React.FC<WithAnimationProps> = ({
  type = 'float',
  children,
  id,
  delay = 0,
  className = '',
  preset,
  customParams,
  textAnimationType = 'fadeIn',
  splitBy = 'none',
  waitForOrchestrator = false
}) => {
  // Apply different animation based on type
  switch (type) {
    case 'float':
      return (
        <FloatingElement
          preset={preset || 'cloudFloat'}
          delay={delay}
          className={className}
          customParams={customParams}
          id={id}
          waitForOrchestrator={waitForOrchestrator}
        >
          {children}
        </FloatingElement>
      );
      
    case 'text':
      return (
        <TextAnimation
          delay={delay}
          className={className}
          type={textAnimationType}
          splitBy={splitBy}
          id={id}
          waitForOrchestrator={waitForOrchestrator}
        >
          {children}
        </TextAnimation>
      );
      
    case 'button':
      // We handle the button case differently as it expects onClick and other props
      // This is a workaround for a common case, but not comprehensive
      if (React.isValidElement(children)) {
        return (
          <AnimatedButton
            {...(children.props as any)}
            className={`${className} ${children.props.className || ''}`}
            floatDelay={delay}
            id={id}
            waitForOrchestrator={waitForOrchestrator}
          >
            {children.props.children}
          </AnimatedButton>
        );
      }
      
      // Fallback if not a valid React element
      return (
        <AnimatedButton
          className={className}
          floatDelay={delay}
          id={id}
          waitForOrchestrator={waitForOrchestrator}
        >
          {children}
        </AnimatedButton>
      );
      
    case 'none':
    default:
      return <div className={className}>{children}</div>;
  }
};

export default WithAnimation;
