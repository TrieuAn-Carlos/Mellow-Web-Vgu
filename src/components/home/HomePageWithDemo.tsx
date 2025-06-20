"use client";

import React, { useState } from "react";
import { HomePage } from "./HomePage";
import { TaskDemo } from "./TaskDemo";

export const HomePageWithDemo: React.FC = () => {
  const [droppedClouds, setDroppedClouds] = useState<string[]>([]);

  const handleTaskComplete = () => {
    const newCloudId = `demo-cloud-${Date.now()}`;
    setDroppedClouds((prev) => [...prev, newCloudId]);
  };

  return (
    <div className="relative">
      {/* Main Home Page */}
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white relative overflow-hidden">
        {/* Pink Cloud Background */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-10">
          <img
            src="/MellowPinkHome.svg"
            alt="Pink Cloud"
            className="w-32 h-32 opacity-80"
          />
        </div>

        {/* Step Indicators */}
        <div className="relative z-20 pt-6">
          <div className="flex justify-center space-x-8 mb-8">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold bg-blue-500 text-white shadow-lg scale-110 transition-all duration-300 ease-in-out">
                1
              </div>
              <span className="mt-2 text-sm font-medium text-blue-600">
                Step 1
              </span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold bg-gray-200 text-gray-600 hover:bg-gray-300 transition-all duration-300 ease-in-out">
                2
              </div>
              <span className="mt-2 text-sm font-medium text-gray-500">
                Step 2
              </span>
            </div>
            <div className="flex flex-col items-center">
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
              <h1 className="text-2xl font-semibold text-gray-800 mb-4">
                It's a brand new day today 😄
              </h1>
            </div>

            {/* Task Bubble with Demo Task Count */}
            <div className="flex justify-center mb-12">
              <div className="relative">
                <div className="bg-blue-500 text-white px-6 py-4 rounded-2xl shadow-lg max-w-sm relative animate-float">
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

            {/* Cloud Container for Animations */}
            <div
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ minHeight: "600px" }}
            >
              <div className="clouds-container">
                {droppedClouds.map((cloudId, index) => (
                  <div
                    key={cloudId}
                    className={`cloud-item cloud-${cloudId}`}
                    style={{
                      position: "absolute",
                      left:
                        Math.random() *
                        (typeof window !== "undefined"
                          ? window.innerWidth - 200
                          : 800),
                      top: -100,
                      pointerEvents: "auto",
                      cursor: "grab",
                      transition: "transform 0.2s ease",
                    }}
                  >
                    <img
                      src={`/cloud${(index % 3) + 1}.svg`}
                      alt={`Draggable Cloud ${index + 1}`}
                      className="w-20 h-16 drop-shadow-lg hover:scale-105"
                      draggable={false}
                    />
                  </div>
                ))}
              </div>
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
      </div>

      {/* Task Demo Panel */}
      <TaskDemo onTaskComplete={handleTaskComplete} />

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .cloud-item {
          animation: cloudDrop 2s ease-out forwards,
            cloudFloat 4s ease-in-out infinite 2s;
        }

        @keyframes cloudDrop {
          from {
            transform: translateY(-100px);
          }
          to {
            transform: translateY(200px);
          }
        }

        @keyframes cloudFloat {
          0%,
          100% {
            transform: translateY(200px) translateX(0px);
          }
          25% {
            transform: translateY(180px) translateX(10px);
          }
          50% {
            transform: translateY(220px) translateX(-5px);
          }
          75% {
            transform: translateY(190px) translateX(8px);
          }
        }

        .cloud-item:hover {
          transform: scale(1.1) !important;
          cursor: grabbing;
        }
      `}</style>
    </div>
  );
};
