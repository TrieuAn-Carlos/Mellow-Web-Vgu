"use client";

import React, { useState } from "react";

export const SimpleHomePage: React.FC = () => {
  const [completedTasks, setCompletedTasks] = useState<number>(0);
  const [clouds, setClouds] = useState<string[]>([]);

  const handleTaskComplete = () => {
    const newCloud = `cloud-${Date.now()}`;
    setClouds((prev) => [...prev, newCloud]);
    setCompletedTasks((prev) => prev + 1);
  };

  const resetTasks = () => {
    setClouds([]);
    setCompletedTasks(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white relative overflow-hidden">
      {/* Pink Cloud Background */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 animate-cloud-float">
        <img
          src="/MellowPinkHome.svg"
          alt="Pink Cloud"
          className="w-28 h-28 opacity-85 drop-shadow-lg"
        />
      </div>

      {/* Step Indicators */}
      <div className="relative z-20 pt-6">
        <div className="flex justify-center space-x-12 mb-12">
          {/* Step 1 - Active */}
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-base font-bold bg-blue-500 text-white shadow-xl">
              1
            </div>
            <span className="mt-3 text-sm font-medium text-blue-600">
              Step 1
            </span>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-base font-bold bg-gray-200 text-gray-600">
              2
            </div>
            <span className="mt-3 text-sm font-medium text-gray-500">
              Step 2
            </span>
          </div>

          {/* Step 4 */}
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-base font-bold bg-gray-200 text-gray-600">
              4
            </div>
            <span className="mt-3 text-sm font-medium text-gray-500">
              Step 4
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 text-center">
          {/* Greeting Message */}
          <div className="mb-10">
            <h1 className="text-2xl font-semibold text-gray-800">
              It's a brand new day today 😄
            </h1>
          </div>

          {/* Task Bubble */}
          <div className="flex justify-center mb-12">
            <div className="relative animate-float">
              <div className="bg-blue-500 text-white px-8 py-5 rounded-3xl shadow-lg max-w-md relative">
                <p className="text-center font-medium text-lg">
                  I have a total of 5 tasks today
                </p>

                {/* Bubble Tail */}
                <div className="absolute bottom-0 left-12 transform translate-y-full">
                  <div className="w-0 h-0 border-l-6 border-r-6 border-t-10 border-l-transparent border-r-transparent border-t-blue-500"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Dropped Clouds */}
          <div className="relative">
            {clouds.map((cloudId, index) => (
              <div
                key={cloudId}
                className="absolute animate-cloud-float"
                style={{
                  left: `${20 + index * 100}px`,
                  top: `${50 + index * 30}px`,
                  animationDelay: `${index * 0.5}s`,
                }}
              >
                <img
                  src={`/cloud${(index % 3) + 1}.svg`}
                  alt={`Cloud ${index + 1}`}
                  className="w-16 h-12 drop-shadow-lg cursor-pointer hover:scale-110 transition-transform"
                  draggable
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Background decorative clouds */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <img
          src="/cloud1.svg"
          alt="Background Cloud"
          className="absolute top-1/4 left-4 w-24 h-16 opacity-30 animate-pulse"
        />
        <img
          src="/cloud2.svg"
          alt="Background Cloud"
          className="absolute top-1/3 right-8 w-20 h-14 opacity-25 animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <img
          src="/cloud3.svg"
          alt="Background Cloud"
          className="absolute bottom-1/4 left-8 w-18 h-12 opacity-20 animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Task Demo Panel */}
      <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg max-w-sm z-50">
        <div className="mb-4">
          <h3 className="font-semibold text-gray-800 mb-2">
            Task Demo ({completedTasks}/5 completed)
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            Complete tasks to see clouds! 🌥️
          </p>
        </div>

        <div className="space-y-2 mb-4">
          {[
            "Morning Exercise",
            "Read a Book",
            "Call Family",
            "Work on Project",
            "Evening Walk",
          ].map((task, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-2 rounded transition-colors ${
                index < completedTasks
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              <span
                className={`text-sm ${
                  index < completedTasks ? "line-through" : ""
                }`}
              >
                {task}
              </span>
              {index >= completedTasks && (
                <button
                  onClick={handleTaskComplete}
                  className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                >
                  ✓
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={resetTasks}
          className="w-full px-3 py-2 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors"
        >
          Reset All Tasks
        </button>
      </div>

      {/* Celebration Message */}
      {clouds.length > 0 && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-30">
          <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-bounce">
            🎉 Great job! {clouds.length} cloud{clouds.length > 1 ? "s" : ""}{" "}
            collected!
          </div>
        </div>
      )}
    </div>
  );
};
