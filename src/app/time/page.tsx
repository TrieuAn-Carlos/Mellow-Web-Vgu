"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  monitorCurrentInProgressTask,
  CurrentTaskData,
} from "@/lib/firebase-services";
import { getSettings, AppSettings } from "@/lib/settings-service";

const MAX_SECONDS = 24 * 60 * 60; // 24 hours

export default function TimerPage() {
  const router = useRouter();
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTask, setCurrentTask] = useState<CurrentTaskData | null>(null);
  const [startTime, setStartTime] = useState(Date.now());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [lastTaskStartTime, setLastTaskStartTime] = useState<number | null>(
    null
  );
  const [taskName, setTaskName] = useState("");
  const [settings, setSettings] = useState<AppSettings>({
    AutoStart: false,
    Cflow: false,
  });

  const handleSwitchTask = (newTask: CurrentTaskData) => {
    console.log(`[SWITCHING] Checking task: "${newTask.name}"`);

    // Check if this is the same task by comparing name and startTime
    const isSameTask =
      currentTask &&
      currentTask.name === newTask.name &&
      currentTask.startedAt?.toMillis() === newTask.startedAt?.toMillis();

    if (isSameTask) {
      console.log(`[SWITCHING] Same task detected, keeping timer`);
      // Just update the task reference without resetting timer
      setCurrentTask(newTask);
      setTaskName(newTask.name);
      return;
    }

    console.log(`[SWITCHING] New task detected: "${newTask.name}"`);
    setIsTransitioning(true);

    // Task switching behavior: reset timer to 00:00 and start with new task
    console.log(`[SWITCHING] Task switch detected - resetting timer to 00:00`);
    setSeconds(0);
    setStartTime(Date.now());
    setIsRunning(true);

    setCurrentTask(newTask);
    setTaskName(newTask.name);
    if (newTask.startedAt) {
      setLastTaskStartTime(newTask.startedAt.toMillis());
    }
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const handleInitialTask = (task: CurrentTaskData) => {
    console.log(`[INITIAL] First task detected: "${task.name}"`);
    setCurrentTask(task);
    setTaskName(task.name);

    // When no task was previously running, always start timer at 00:00
    console.log(`[INITIAL] No previous task - starting timer at 00:00`);
    setSeconds(0);
    setStartTime(Date.now());
    setIsRunning(true);
  };

  // Load settings from Firebase
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const appSettings = await getSettings();
        setSettings(appSettings);
        console.log(`[SETTINGS] Loaded settings:`, appSettings);
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    };

    loadSettings();
  }, []);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && seconds < MAX_SECONDS) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          const newSeconds = prev + 1;
          return newSeconds >= MAX_SECONDS ? MAX_SECONDS : newSeconds;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, seconds]);

  // Real-time clock
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(clockInterval);
  }, []);

  // Effect for real-time monitoring of task changes using onSnapshot
  useEffect(() => {
    console.log(
      `[${new Date().toLocaleTimeString()}] Setting up real-time task monitoring...`
    );

    // Set up real-time monitoring using onSnapshot
    const unsubscribe = monitorCurrentInProgressTask((result) => {
      if (result.success && result.currentTask) {
        const mostRecentTask = result.currentTask as CurrentTaskData;
        const taskStartedAt = mostRecentTask.startedAt;

        if (taskStartedAt) {
          const newTimestamp = taskStartedAt.toMillis();
          console.log(
            `[REAL-TIME] Found task: "${mostRecentTask.name}" (Started at: ${newTimestamp})`
          );

          setLastTaskStartTime((prevTimestamp) => {
            console.log(
              `[REAL-TIME] Comparing timestamps. New: ${newTimestamp}, Previous: ${prevTimestamp}`
            );
            if (prevTimestamp === null) {
              console.log("[REAL-TIME] First task detected.");
              handleInitialTask(mostRecentTask);
              return newTimestamp;
            }

            if (newTimestamp > prevTimestamp) {
              console.log("[REAL-TIME] New task found. Triggering switch.");
              handleSwitchTask(mostRecentTask);
              return newTimestamp;
            }

            console.log("[REAL-TIME] No newer task found. No changes.");
            return prevTimestamp;
          });
        } else {
          console.log(
            `[REAL-TIME] Found task "${mostRecentTask.name}" but it has no start time.`
          );
        }
      } else {
        console.log("[REAL-TIME] No 'IN_PROGRESS' task found in the backend.");

        // Handle task completion: if we had a current task but now there's none
        if (currentTask) {
          console.log(`[REAL-TIME] Task completion detected - pausing timer`);
          // Pause the timer when task is completed (don't reset seconds)
          setIsRunning(false);
          setCurrentTask(null);
          setTaskName("Task Completed");
          setLastTaskStartTime(null);
        }
      }
    });

    // Cleanup function to unsubscribe from the real-time listener
    return () => {
      console.log("Cleaning up real-time task monitoring.");
      unsubscribe();
    };
  }, [settings, currentTask]); // Include currentTask to track completion

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        event.preventDefault();
        setIsRunning((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  // Format time display with proper centering
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    return {
      hours: hours > 0 ? hours.toString().padStart(2, "0") : null,
      minutes: minutes.toString().padStart(2, "0"),
      seconds: secs.toString().padStart(2, "0"),
      display:
        hours > 0
          ? `${hours.toString().padStart(2, "0")}:${minutes
              .toString()
              .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
          : `${minutes.toString().padStart(2, "0")}:${secs
              .toString()
              .padStart(2, "0")}`,
    };
  };

  const getTaskDisplayName = (task: CurrentTaskData | null) => {
    if (!task) return "No Active Task";

    return task.type === "subtask"
      ? `${task.parentTask} → ${task.name}`
      : task.name;
  };

  const formatClock = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Function to calculate text width based on character count
  const calculateTextWidth = (text: string) => {
    const textLength = text.length;

    return {
      textLength,
      maxWidth: textLength >= 36 ? "750px" : "900px",
    };
  };

  // Memoized values to prevent re-computation
  const memoizedTaskText = React.useMemo(() => {
    return taskName || getTaskDisplayName(currentTask) || "No Active Task";
  }, [taskName, currentTask]);

  const memoizedTextWidth = React.useMemo(() => {
    return calculateTextWidth(memoizedTaskText);
  }, [memoizedTaskText]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 relative overflow-hidden">
      {/* Close button */}
      <button
        onClick={() => router.push("/home")}
        className="absolute top-6 right-6 p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-full transition-all duration-200 z-50 cursor-pointer active:scale-95 active:bg-gray-700/50"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* Real-time clock at top */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-10">
        <div
          className="text-4xl md:text-5xl font-normal text-gray-500 opacity-60"
          style={{
            fontSize: "clamp(2rem, 5vw, 3rem)",
            textShadow: "0 0 20px rgba(255, 255, 255, 0.05)",
          }}
        >
          {formatClock(currentTime)}
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-white p-8">
        {/* Timer display */}
        <div className="text-center mb-12">
          {(() => {
            const timeData = formatTime(seconds);
            const hasHours = timeData.hours !== null;

            return (
              <div
                className={`text-[15.6rem] md:text-[18.2rem] font-semibold mb-4 tracking-tight leading-[1.1] transition-all duration-500 ${
                  isTransitioning
                    ? "scale-95 opacity-70"
                    : isRunning
                    ? "scale-100 opacity-100 text-gray-200"
                    : "scale-100 opacity-40 text-gray-500"
                }`}
                style={{
                  textShadow: isRunning
                    ? "0 0 30px rgba(255, 255, 255, 0.1)"
                    : "0 0 10px rgba(255, 255, 255, 0.05)",
                  fontSize: "clamp(10.4rem, 19.5vw, 18.2rem)",
                }}
              >
                {hasHours ? (
                  <div className="flex items-center justify-center">
                    <span className="text-center">
                      {timeData.hours}:{timeData.minutes}:{timeData.seconds}
                    </span>
                  </div>
                ) : (
                  <span>
                    {timeData.minutes}:{timeData.seconds}
                  </span>
                )}
              </div>
            );
          })()}

          {/* Task name */}
          <div
            className={`text-4xl md:text-5xl font-normal leading-[1.3] transition-all duration-500 ${
              isTransitioning
                ? "scale-95 opacity-50 translate-y-2 text-gray-400"
                : isRunning
                ? "scale-100 opacity-100 translate-y-0 text-gray-400"
                : "scale-100 opacity-60 translate-y-0 text-gray-600"
            }`}
            style={{
              fontSize: "clamp(1.95rem, 5.2vw, 3.25rem)",
              maxWidth: memoizedTextWidth.maxWidth,
            }}
          >
            {memoizedTaskText}
          </div>

          {/* Transition indicator */}
          {isTransitioning && (
            <div className="mt-6 animate-pulse">
              <div className="inline-flex items-center space-x-2 text-blue-400 text-sm">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                <span>Switching to new task...</span>
                <div
                  className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls at bottom */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="text-center text-gray-500">
          <p className="text-sm">
            Press{" "}
            <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">SPACE</kbd>{" "}
            to {isRunning ? "pause" : "resume"}
          </p>
        </div>
      </div>
    </div>
  );
}
