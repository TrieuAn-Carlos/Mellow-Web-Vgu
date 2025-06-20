"use client";

import React, { useEffect, useRef } from "react";
import anime from "animejs/lib/anime.es.js";

interface AnimeScatteredProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  scale?: number;
}

export const AnimeScattered: React.FC<AnimeScatteredProps> = ({
  children,
  delay = 0,
  duration = 800,
  className = "",
  scale = 1,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && scale > 0) {
      const cards =
        containerRef.current.querySelectorAll<HTMLElement>(".task-card");

      // Clean up any existing drag listeners first
      cards.forEach((card) => {
        if ((card as any)._dragCleanup) {
          (card as any)._dragCleanup();
          (card as any)._dragListenersAdded = false;
        }
      });

      // Store original positions and rotations
      const cardData = Array.from(cards).map((card) => {
        const style = window.getComputedStyle(card);
        const transform = style.transform;

        // Extract rotation from the transform matrix
        let rotation = 0;
        if (transform && transform !== "none") {
          const values = transform.split("(")[1].split(")")[0].split(",");
          const a = parseFloat(values[0]);
          const b = parseFloat(values[1]);
          rotation = Math.round(Math.atan2(b, a) * (180 / Math.PI));
        }

        // Get position from inline styles (set by ScatteredCardsLayout)
        const left = parseFloat(card.style.left) || 0;
        const top = parseFloat(card.style.top) || 0;

        return {
          element: card,
          originalX: left,
          originalY: top,
          originalRotation: rotation,
        };
      });

      // Only run initial animation if this is the first time (not a scale change)
      const isInitialRun = !cards[0] || !(cards[0] as any)._hasAnimated;

      if (isInitialRun) {
        // Set initial animation state
        anime.set(cards, {
          opacity: 0,
          scale: 0.5,
        });

        // Animate in with stagger
        anime({
          targets: Array.from(cards),
          opacity: 1,
          scale: 1,
          duration: duration,
          delay: anime.stagger(50, { start: delay }),
          easing: "easeOutElastic(1, .8)",
          complete: function () {
            // Mark cards as animated
            cards.forEach((card) => {
              (card as any)._hasAnimated = true;
            });
            // Add drag functionality after animation completes
            addDragFunctionality();
          },
        });
      } else {
        // Skip animation, just add drag functionality for scale changes
        addDragFunctionality();
      }

      function addDragFunctionality() {
        cardData.forEach(
          ({ element, originalX, originalY, originalRotation }) => {
            const cardElement = element as HTMLElement;

            let isDragging = false;
            let startX = 0;
            let startY = 0;

            const onMouseDown = (e: MouseEvent) => {
              e.preventDefault();
              isDragging = true;
              startX = e.clientX;
              startY = e.clientY;

              cardElement.style.cursor = "grabbing";
              cardElement.style.zIndex = "1000";

              // Stop any ongoing animations
              anime.remove(cardElement);

              document.addEventListener("mousemove", onMouseMove);
              document.addEventListener("mouseup", onMouseUp);
              document.addEventListener("mouseleave", onMouseUp);
            };

            const onMouseMove = (e: MouseEvent) => {
              if (!isDragging) return;

              // Calculate movement in viewport coordinates, then convert to container coordinates
              const deltaX = (e.clientX - startX) / scale;
              const deltaY = (e.clientY - startY) / scale;

              // Apply transform directly using anime.set for immediate response
              anime.set(cardElement, {
                translateX: deltaX,
                translateY: deltaY,
                scale: 1.05,
                rotate: originalRotation,
              });
            };

            const onMouseUp = () => {
              if (!isDragging) return;

              isDragging = false;
              cardElement.style.cursor = "grab";
              cardElement.style.zIndex = "auto";

              // Animate back to original position with elastic easing
              anime({
                targets: cardElement,
                translateX: 0,
                translateY: 0,
                scale: 1,
                rotate: originalRotation,
                duration: 800,
                easing: "easeOutElastic(1, .6)",
                complete: () => {
                  // Reset transform to only rotation (the original state)
                  cardElement.style.transform = `rotate(${originalRotation}deg)`;
                },
              });

              document.removeEventListener("mousemove", onMouseMove);
              document.removeEventListener("mouseup", onMouseUp);
              document.removeEventListener("mouseleave", onMouseUp);
            };

            // Set initial cursor
            cardElement.style.cursor = "grab";
            cardElement.addEventListener("mousedown", onMouseDown);

            // Cleanup function to remove event listeners
            const cleanup = () => {
              cardElement.removeEventListener("mousedown", onMouseDown);
              document.removeEventListener("mousemove", onMouseMove);
              document.removeEventListener("mouseup", onMouseUp);
              document.removeEventListener("mouseleave", onMouseUp);
            };

            // Store cleanup function
            (cardElement as any)._dragCleanup = cleanup;
          }
        );
      }
    }

    // Cleanup function for the useEffect
    return () => {
      if (containerRef.current) {
        const cards =
          containerRef.current.querySelectorAll<HTMLElement>(".task-card");
        cards.forEach((card) => {
          if ((card as any)._dragCleanup) {
            (card as any)._dragCleanup();
          }
        });
      }
    };
  }, [children, delay, duration, scale]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
};
