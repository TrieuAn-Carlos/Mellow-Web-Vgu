"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AutoStartOverlayProps {
  isVisible: boolean;
  taskName?: string;
  onTransitionComplete?: () => void;
}

export const AutoStartOverlay: React.FC<AutoStartOverlayProps> = ({
  isVisible,
  taskName,
  onTransitionComplete,
}) => {
  const router = useRouter();
  const [opacity, setOpacity] = useState(0);
  const [showMessage, setShowMessage] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isVisible) {
      // Start fade in with slight delay for smoother transition
      setTimeout(() => {
        setOpacity(1);
        setShowMessage(true);
      }, 100);

      // Animate progress bar
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 1; // Increment by 2% every 60ms = 3000ms total
        });
      }, 60);

      // Navigate to timer after longer delay for better visual feedback
      const navigationTimer = setTimeout(() => {
        // Start fade out before navigation
        setOpacity(0);
        setTimeout(() => {
          onTransitionComplete?.();
        }, 500); // Additional 500ms for fade out
      }, 5000); // Increased from 1500ms to 5000ms

      return () => {
        clearTimeout(navigationTimer);
        clearInterval(progressInterval);
      };
    }
  }, [isVisible, onTransitionComplete]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-500 ease-in-out"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.95)",
        opacity: opacity,
      }}
    >
      <div className="text-center px-6 max-w-md">
        {/* Auto-start icon/indicator */}
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        </div>

        {/* Main message */}
        <div
          className={`transition-all duration-700 ${
            showMessage
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4"
          }`}
        >
          <h2 className="text-2xl font-bold text-white mb-3">
            Auto-starting timer...
          </h2>

          {taskName && (
            <p className="text-lg text-gray-300 mb-4">
              Resuming:{" "}
              <span className="text-green-400 font-medium">"{taskName}"</span>
            </p>
          )}

          {/* Progress bar */}
          <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-75 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <p className="text-sm text-gray-400">
            Preparing your workspace... {Math.round(progress)}%
          </p>
        </div>
      </div>
    </div>
  );
};
