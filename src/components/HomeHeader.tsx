"use client";

import React from "react";
import { MellowLogo } from "@/components/icons/MellowLogo";

interface HomeHeaderProps {
  date: Date;
  taskCount: number;
  completedCount: number;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({
  date,
  taskCount,
  completedCount,
}) => {
  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getProgressPercentage = () => {
    if (taskCount === 0) return 0;
    return Math.round((completedCount / taskCount) * 100);
  };

  return (
    <header className="w-full bg-white/80 backdrop-blur-sm border-b border-gray-200/50 px-6 py-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          {/* Left side - Logo and greeting */}
          <div className="flex items-center gap-4">
            <MellowLogo className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-semibold text-gray-800 font-['SF_Pro_Display']">
                {getGreeting()}
              </h1>
              <p className="text-sm text-gray-600 font-['SF_Pro_Display']">
                {formatDate(date)}
              </p>
            </div>
          </div>

          {/* Right side - Task stats */}
          <div className="flex items-center gap-6">
            {/* Progress indicator */}
            {taskCount > 0 && (
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12">
                  <svg
                    className="w-12 h-12 transform -rotate-90"
                    viewBox="0 0 36 36"
                  >
                    <path
                      d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                      stroke="#e5e7eb"
                      strokeWidth="2"
                      fill="none"
                    />
                    <path
                      d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                      stroke="#22c55e"
                      strokeWidth="2"
                      strokeDasharray={`${getProgressPercentage()}, 100`}
                      fill="none"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-semibold text-gray-700">
                      {getProgressPercentage()}%
                    </span>
                  </div>
                </div>
                <div className="text-sm">
                  <div className="font-semibold text-gray-800">
                    {completedCount}/{taskCount} tasks
                  </div>
                  <div className="text-gray-500">completed</div>
                </div>
              </div>
            )}

            {/* Quick stats */}
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">
                  {taskCount}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">
                  Total
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {completedCount}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">
                  Done
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-orange-600">
                  {taskCount - completedCount}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">
                  Left
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
