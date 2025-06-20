"use client";

import React, { useEffect, useRef } from 'react';
import anime from 'animejs/lib/anime.es.js';
import { useAnimation } from './AnimationOrchestrator';

interface TextAnimationProps {
  children: React.ReactNode;
  id?: string;
  delay?: number;
  duration?: number;
  className?: string;
  staggerDelay?: number;
  type?: 'fadeIn' | 'typewriter' | 'wavy' | 'highlight';
  highlightColor?: string;
  waitForOrchestrator?: boolean;
  splitBy?: 'letter' | 'word' | 'none';
}

/**
 * A component that applies advanced text animations
 * Can split text into words or letters for more complex animations
 */
export const TextAnimation: React.FC<TextAnimationProps> = ({
  children,
  id,
  delay = 0,
  duration = 800,
  className = '',
  staggerDelay = 30,
  type = 'fadeIn',
  highlightColor = 'rgba(175, 104, 253, 0.3)',
  waitForOrchestrator = false,
  splitBy = 'none'
}) => {
  const { isInitialized, registerAnimation, animationState } = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);
  
  // Register with orchestrator if ID is provided
  useEffect(() => {
    if (id && waitForOrchestrator) {
      registerAnimation(id, delay || 0);
    }
  }, [id, delay, registerAnimation, waitForOrchestrator]);
  
  // Animation effect
  useEffect(() => {
    // Check if should animate based on orchestrator
    const shouldAnimate = id && waitForOrchestrator 
      ? animationState[id] 
      : waitForOrchestrator 
        ? isInitialized 
        : true;
    
    if (!shouldAnimate || !containerRef.current || hasAnimated.current) return;
    
    const container = containerRef.current;
    let targets: HTMLElement[] = [];
      // Split text content if needed
    if (splitBy !== 'none' && type !== 'typewriter') {
      // Store original HTML elements like <br>
      const originalHTML = container.innerHTML;
      const preservedElements = [];
      
      // Find and preserve HTML elements
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = originalHTML;
      
      const walkNodes = (node, callback) => {
        if (node.nodeType === Node.TEXT_NODE) {
          callback(node);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          if (node.tagName === 'BR') {
            preservedElements.push({ type: 'BR', position: preservedElements.length });
          } else {
            Array.from(node.childNodes).forEach(child => walkNodes(child, callback));
          }
        }
      };
      
      // Extract text content while preserving structure
      let allText = '';
      walkNodes(tempDiv, (textNode) => {
        allText += textNode.textContent;
      });

      // Clear container temporarily
      container.innerHTML = '';
      
      // Process text based on split mode
      if (splitBy === 'letter') {
        // Split by letter
        let charIndex = 0;
        allText.split('').forEach(letter => {
          // Check if we need to insert a preserved element
          preservedElements.forEach(el => {
            if (el.position === charIndex) {
              if (el.type === 'BR') {
                container.appendChild(document.createElement('br'));
              }
            }
          });
          
          const span = document.createElement('span');
          span.innerText = letter === ' ' ? '\u00A0' : letter; // Use non-breaking space for spaces
          span.style.display = 'inline-block';
          container.appendChild(span);
          charIndex++;
        });
      } else if (splitBy === 'word') {
        // For word splitting, handle line breaks separately
        const lines = originalHTML.split(/<br\s*\/?>|<br>/i);
        
        lines.forEach((line, lineIndex) => {
          // For each line, process the text
          const tempElement = document.createElement('div');
          tempElement.innerHTML = line;
          const lineText = tempElement.textContent || '';
          
          // Split words in this line
          lineText.split(/\s+/).filter(Boolean).forEach((word, index, array) => {
            const span = document.createElement('span');
            span.innerText = word;
            span.style.display = 'inline-block';
            container.appendChild(span);
            
            // Add space after word (except last word)
            if (index < array.length - 1) {
              const space = document.createElement('span');
              space.innerHTML = '&nbsp;';
              space.style.display = 'inline-block';
              container.appendChild(space);
            }
          });
          
          // Add back the line break if this isn't the last line
          if (lineIndex < lines.length - 1) {
            container.appendChild(document.createElement('br'));
          }
        });
      }
      
      // Get all spans as targets
      targets = Array.from(container.querySelectorAll('span'));
    } else {
      targets = [container];
    }
    
    // Configure animation based on type
    let animation: anime.AnimeInstance;
    
    switch (type) {
      case 'fadeIn':
        animation = anime({
          targets,
          opacity: [0, 1],
          translateY: ['10px', '0px'],
          duration,
          delay: (el, i) => delay + (i * staggerDelay),
          easing: 'easeOutCubic',
        });
        break;
        
      case 'wavy':
        targets.forEach((target, i) => {
          anime({
            targets: target,
            translateY: ['4px', '-4px'],
            duration: 1200 + (i % 3) * 300,
            delay: delay + (i * staggerDelay),
            easing: 'easeInOutSine',
            direction: 'alternate',
            loop: true
          });
        });
        break;
        
      case 'highlight':
        animation = anime({
          targets,
          backgroundColor: [
            'rgba(255, 255, 255, 0)', 
            highlightColor,
            highlightColor,
            'rgba(255, 255, 255, 0)'
          ],
          duration: duration * 1.5,
          delay: (el, i) => delay + (i * staggerDelay * 3),
          easing: 'easeInOutQuad',
          complete: () => {
            // Remove background after animation
            targets.forEach(el => {
              el.style.backgroundColor = '';
            });
          }
        });
        break;
        
      case 'typewriter':
        // For typewriter, we need a different approach
        if (container.textContent) {
          const text = container.textContent;
          container.textContent = '';
          container.style.opacity = '1';
          
          let i = 0;
          const typeTimer = setInterval(() => {
            if (i < text.length) {
              container.textContent += text.charAt(i);
              i++;
            } else {
              clearInterval(typeTimer);
            }
          }, staggerDelay);
        }
        break;
    }
    
    hasAnimated.current = true;
  }, [
    animationState, 
    delay, 
    duration, 
    highlightColor, 
    id, 
    isInitialized, 
    splitBy, 
    staggerDelay, 
    type, 
    waitForOrchestrator
  ]);
  
  return (
    <div 
      ref={containerRef} 
      className={className}
      style={{ 
        opacity: type !== 'typewriter' ? 0 : 1, 
        position: 'relative'
      }}
    >
      {children}
    </div>
  );
};

export default TextAnimation;
