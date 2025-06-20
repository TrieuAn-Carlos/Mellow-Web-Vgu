"use client";

import React, { useState, useEffect } from "react";
import { CloudContainer } from "./CloudContainer";
import { TaskBubble } from "./TaskBubble";
import { StepIndicator } from "./StepIndicator";
import { useDaily, useTasks } from "@/hooks/useFirestore";
import { formatDateForDocId } from "@/lib/firebase-collections";

export const HomePage: React.FC = () => {
  const today = formatDateForDocId(new Date());
  const { data: daily, loading: dailyLoading } = useDaily(today);
  const { data: tasks, loading: tasksLoading } = useTasks(today);

  const [completedTasks, setCompletedTasks] = useState<number>(0);
  const [droppedClouds, setDroppedClouds] = useState<string[]>([]);

  useEffect(() => {
    if (tasks) {
      const completed = tasks.filter(
        (task) => task.status === "COMPLETED"
      ).length;

      // Check for new completions to trigger cloud drops
      if (completed > completedTasks) {
        const newClouds = Array.from(
          { length: completed - completedTasks },
          (_, i) => `cloud-${Date.now()}-${i}`
        );
        setDroppedClouds((prev) => [...prev, ...newClouds]);
      }

      setCompletedTasks(completed);
    }
  }, [tasks, completedTasks]);

  const totalTasks = tasks?.length || 0;

  if (dailyLoading || tasksLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
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
          <StepIndicator step={1} active />
          <StepIndicator step={2} />
          <StepIndicator step={4} />
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 text-center">
          {/* Greeting Message */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-800 mb-4">
              It's a brand new day today 😄
            </h1>
          </div>

          {/* Task Bubble */}
          <div className="flex justify-center mb-12">
            <TaskBubble totalTasks={totalTasks} />
          </div>

          {/* Cloud Container for Animations */}
          <CloudContainer droppedClouds={droppedClouds} />
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
  );
};
