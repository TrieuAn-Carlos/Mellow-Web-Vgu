"use client";

import React, { useEffect, useState } from "react";
import MellowLogo from "./icons/MellowLogo";

const SplashScreen = ({ onFinished }: { onFinished: () => void }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 2500); // Start exit animation after 2.5 seconds

    const finishTimer = setTimeout(() => {
      onFinished();
    }, 3000); // Finish after 3 seconds

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinished]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-white transition-opacity duration-500 ${
        isExiting ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className={isExiting ? "animate-none" : "animate-pulse"}>
        <MellowLogo className="w-24 h-24 drop-shadow-lg" />
      </div>
    </div>
  );
};

export default SplashScreen;
