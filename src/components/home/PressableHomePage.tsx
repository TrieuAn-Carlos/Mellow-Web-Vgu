"use client";

import React, { useRef } from "react";
import { useRouter } from "next/navigation";
import anime from "animejs/lib/anime.es.js";

export const PressableHomePage: React.FC = () => {
  const router = useRouter();
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pressStartRef = useRef<number | null>(null);
  const animationRef = useRef<anime.AnimeInstance | null>(null);
  const progressIndicatorRef = useRef<HTMLDivElement>(null);

  const handlePressStart = () => {
    pressStartRef.current = Date.now();

    // Start the visual feedback animation
    if (progressIndicatorRef.current) {
      animationRef.current = anime({
        targets: progressIndicatorRef.current,
        width: "100%",
        duration: 2000,
        easing: "linear",
        // Reset width to 0 on begin to handle subsequent presses
        begin: (anim) => {
          if (progressIndicatorRef.current) {
            progressIndicatorRef.current.style.width = "0%";
          }
        },
      });
      animationRef.current.play();
    }

    // Set a timer for the long press action
    pressTimerRef.current = setTimeout(() => {
      console.log("Long press detected! Navigating to /stats");
      router.push("/stats");
      pressTimerRef.current = null; // Clear ref after firing
    }, 2000);
  };

  const handlePressEnd = () => {
    // If timer is still active, it means long press didn't happen
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;

      const pressDuration = Date.now() - (pressStartRef.current || Date.now());

      console.log(`Press ended. Duration: ${pressDuration}ms`);

      // Short press logic
      // We add a small threshold to avoid accidental "slip" clicks navigating.
      if (pressDuration > 100) {
        console.log("Short press detected! Navigating to /time");
        router.push("/time");
      } else {
        console.log(`Press too short, ignoring. Duration: ${pressDuration}ms`);
      }
    }

    // Reverse the animation visually
    anime({
      targets: progressIndicatorRef.current,
      width: "0%",
      duration: 300,
      easing: "easeOutExpo",
    });
  };

  const handleLeave = () => {
    // If the cursor leaves the button, cancel the press action
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;

      anime({
        targets: progressIndicatorRef.current,
        width: "0%",
        duration: 300,
        easing: "easeOutExpo",
      });
      console.log("Press cancelled (cursor left).");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white font-sans">
      <div className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-bold mb-3">Press & Hold</h1>
        <p className="text-lg text-slate-400">
          Short press for Time, long press (2s) for Stats.
        </p>
      </div>

      <div
        className="relative w-60 h-60 sm:w-72 sm:h-72 bg-indigo-600 rounded-full flex items-center justify-center select-none cursor-pointer shadow-2xl shadow-indigo-500/30 transition-transform duration-200 ease-in-out transform hover:scale-105 active:scale-95"
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onMouseLeave={handleLeave}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
      >
        <div className="absolute inset-0 rounded-full overflow-hidden z-0">
          <div
            ref={progressIndicatorRef}
            className="absolute top-0 left-0 h-full bg-indigo-400 bg-opacity-75"
            style={{ width: "0%" }}
          ></div>
        </div>
        <span className="relative z-10 text-3xl font-bold tracking-wider">
          HOLD
        </span>
      </div>

      <div className="mt-12 text-center text-slate-500">
        <p>Try holding the button down.</p>
        <p>A progress bar will fill up.</p>
        <p>
          Release before it's full to go to one page, or let it complete for
          another.
        </p>
      </div>
    </div>
  );
};

export default PressableHomePage;
