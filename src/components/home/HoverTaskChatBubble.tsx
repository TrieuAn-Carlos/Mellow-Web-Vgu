"use client";

import React, { useState, useEffect, useRef } from "react";
import { getTasksForDate } from "../../lib/firebase-collections";
import type { Task } from "../../types/schema";

interface HoverTaskChatBubbleProps {
  currentMessage: string;
  calculateFontSize: (message: string) => string;
  tasks: Task[];
}

export const HoverTaskChatBubble: React.FC<HoverTaskChatBubbleProps> = ({
  currentMessage,
  calculateFontSize,
  tasks,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [displayMessage, setDisplayMessage] = useState(currentMessage);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMouseInsideRef = useRef(false);

  // Calculate total tasks for hover message
  const totalTasks = tasks.length;
  const hoverMessage = `I have a total of ${totalTasks} tasks today`;

  // Clear any pending timeouts
  const clearHoverTimeout = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  // Improved hover handlers with better state management
  const handleMouseEnter = () => {
    isMouseInsideRef.current = true;
    clearHoverTimeout();

    // Only change state if we're not already hovered
    if (!isHovered) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    isMouseInsideRef.current = false;
    clearHoverTimeout();

    // Add a longer delay to prevent flicker when moving cursor within bubble area
    hoverTimeoutRef.current = setTimeout(() => {
      // Double check that mouse is still outside before changing state
      if (!isMouseInsideRef.current && isHovered) {
        setIsHovered(false);
      }
    }, 200);
  };

  // Update display message based on hover state
  useEffect(() => {
    if (isHovered) {
      setDisplayMessage(hoverMessage);
    } else {
      setDisplayMessage(currentMessage);
    }
  }, [isHovered, hoverMessage, currentMessage]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      clearHoverTimeout();
    };
  }, []);

  return (
    <div className="flex justify-end" style={{ marginRight: "1%" }}>
      <div
        className="relative"
        data-interactive
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        // Add pointer events to ensure proper mouse tracking
        style={{ pointerEvents: "auto" }}
      >
        {/* Blue chat bubble with hover effect */}
        <div
          className="bg-blue-500 rounded-[3rem] px-8 py-8 md:px-16 md:py-12 lg:px-24 lg:py-20 shadow-2xl max-w-[90vw] md:max-w-4xl lg:max-w-6xl transition-all duration-300 ease-in-out hover:shadow-3xl cursor-pointer"
          // Prevent event propagation to parent elements
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
        >
          <p
            className={`text-white ${calculateFontSize(
              displayMessage
            )} font-bold opacity-95 leading-tight text-center break-words transition-all duration-300 ease-in-out`}
          >
            {displayMessage}
          </p>
        </div>

        {/* Blue thought bubbles - made non-interactive to prevent hover conflicts */}
        <div className="absolute -bottom-4 -right-6 w-5 h-5 md:w-6 md:h-6 bg-blue-500 rounded-full shadow-lg border-2 border-white transition-all duration-300 ease-in-out pointer-events-none"></div>
        <div className="absolute -bottom-7 -right-10 w-3 h-3 md:w-4 md:h-4 bg-blue-500 rounded-full shadow-md border border-white transition-all duration-300 ease-in-out pointer-events-none"></div>
      </div>
    </div>
  );
};
