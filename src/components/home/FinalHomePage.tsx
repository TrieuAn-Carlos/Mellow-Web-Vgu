"use client";

import React, { useState, useEffect, useRef } from "react";
import { AnimatedCloudContainer } from "./AnimatedCloudContainer";
import { useCompletedTasksStream } from "../../hooks/useCompletedTasksStream";
import anime from "animejs";

export const FinalHomePage: React.FC = () => {
  const [droppedClouds, setDroppedClouds] = useState<string[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const celebrationTimer = useRef<NodeJS.Timeout | null>(null);
  const pinkCloudRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  const newlyCompletedTaskIds = useCompletedTasksStream(today);

  // Effect to handle newly completed tasks from the real-time hook
  useEffect(() => {
    if (newlyCompletedTaskIds.length > 0) {
      setDroppedClouds((prev) => [...prev, ...newlyCompletedTaskIds]);
      setShowCelebration(true);

      if (celebrationTimer.current) {
        clearTimeout(celebrationTimer.current);
      }
      celebrationTimer.current = setTimeout(() => {
        setShowCelebration(false);
      }, 3000);

      // Bubble animation
      if (bubbleRef.current) {
        anime({
          targets: bubbleRef.current,
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0],
          duration: 600,
          easing: "easeInOutQuad",
        });
      }
    }
  }, [newlyCompletedTaskIds]);

  // Animate elements on mount
  useEffect(() => {
    // Animate pink cloud floating
    if (pinkCloudRef.current) {
      anime({
        targets: pinkCloudRef.current,
        translateY: [
          { value: "-=8", duration: 4000 },
          { value: "+=8", duration: 4000 },
        ],
        translateX: [
          { value: "-=5", duration: 5000 },
          { value: "+=5", duration: 5000 },
        ],
        rotate: [
          { value: "-=3", duration: 6000 },
          { value: "+=3", duration: 6000 },
        ],
        loop: true,
        easing: "easeInOutSine",
        direction: "alternate",
      });
    }

    // Animate speech bubble floating
    if (bubbleRef.current) {
      anime({
        targets: bubbleRef.current,
        translateY: [
          { value: "-=6", duration: 3000 },
          { value: "+=6", duration: 3000 },
        ],
        loop: true,
        easing: "easeInOutSine",
        direction: "alternate",
      });
    }

    // Animate step indicators on mount
    anime({
      targets: ".step-indicator",
      scale: [0, 1],
      opacity: [0, 1],
      translateY: [-20, 0],
      duration: 800,
      delay: anime.stagger(200),
      easing: "easeOutElastic(1, .8)",
    });

    // Animate main title
    anime({
      targets: ".main-title",
      opacity: [0, 1],
      translateY: [30, 0],
      duration: 1000,
      delay: 600,
      easing: "easeOutQuad",
    });

    // Animate background clouds
    anime({
      targets: ".bg-cloud",
      opacity: [0, 0.3],
      scale: [0.8, 1],
      duration: 1500,
      delay: anime.stagger(300),
      easing: "easeOutQuad",
    });
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-blue-50 to-white overflow-hidden">
      {/* Pink Cloud Background */}
      <div
        ref={pinkCloudRef}
        className="absolute top-8 left-1/2 transform -translate-x-1/2 z-10"
      >
        <img
          src="/MellowPinkHome.svg"
          alt="Pink Cloud"
          className="w-32 h-32 opacity-90 drop-shadow-lg"
        />
      </div>

      {/* Step Indicators */}
      <div className="relative z-20 pt-6">
        <div className="flex justify-center space-x-8 mb-8">
          {/* Step 1 - Active */}
          <div className="flex flex-col items-center step-indicator">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold bg-blue-500 text-white shadow-lg scale-110 transition-all duration-300 ease-in-out hover:shadow-xl">
              1
            </div>
            <span className="mt-2 text-sm font-medium text-blue-600">
              Step 1
            </span>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center step-indicator">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold bg-gray-200 text-gray-600 hover:bg-gray-300 transition-all duration-300 ease-in-out">
              2
            </div>
            <span className="mt-2 text-sm font-medium text-gray-500">
              Step 2
            </span>
          </div>

          {/* Step 4 */}
          <div className="flex flex-col items-center step-indicator">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold bg-gray-200 text-gray-600 hover:bg-gray-300 transition-all duration-300 ease-in-out">
              4
            </div>
            <span className="mt-2 text-sm font-medium text-gray-500">
              Step 4
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 text-center">
          {/* Greeting Message */}
          <div className="mb-8">
            <h1 className="main-title text-2xl font-semibold text-gray-800 mb-4 opacity-0">
              It's a brand new day today 😄
            </h1>
          </div>

          {/* Task Bubble */}
          <div className="flex justify-center mb-12">
            <div ref={bubbleRef} className="relative">
              <div className="bg-blue-500 text-white px-6 py-4 rounded-2xl shadow-lg max-w-sm relative">
                <p className="text-center font-medium">
                  I have a total of 5 tasks today
                </p>

                {/* Bubble Tail */}
                <div className="absolute bottom-0 left-8 transform translate-y-full">
                  <div className="w-0 h-0 border-l-4 border-r-4 border-t-8 border-l-transparent border-r-transparent border-t-blue-500"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Animated Cloud Container */}
          <AnimatedCloudContainer droppedClouds={droppedClouds} />
        </div>
      </div>

      {/* Background decorative clouds */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <img
          src="/cloud1.svg"
          alt="Background Cloud"
          className="bg-cloud absolute top-1/4 left-4 w-24 h-16 opacity-0"
        />
        <img
          src="/cloud2.svg"
          alt="Background Cloud"
          className="bg-cloud absolute top-1/3 right-8 w-20 h-14 opacity-0"
        />
        <img
          src="/cloud3.svg"
          alt="Background Cloud"
          className="bg-cloud absolute bottom-1/4 left-8 w-18 h-12 opacity-0"
        />
        <img
          src="/cloud1.svg"
          alt="Background Cloud"
          className="bg-cloud absolute bottom-1/3 right-1/4 w-16 h-12 opacity-0"
        />
      </div>

      {/* Celebration Message */}
      {showCelebration && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-30 animate-fade-in-down">
          <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
            🎉 Great job! Keep going!
          </div>
        </div>
      )}
    </div>
  );
};
