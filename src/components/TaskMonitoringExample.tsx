"use client";

import { useState, useEffect } from "react";
import {
  findCurrentInProgressTask,
  startTaskMonitoring,
  type CurrentTaskData,
  type FirebaseOperationResult,
  type TaskUpdateCallback,
} from "@/lib/firebase-monitoring";

export default function TaskMonitoringExample() {
  const [currentTask, setCurrentTask] = useState<CurrentTaskData | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [unsubscribe, setUnsubscribe] = useState<(() => void) | null>(null);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)]);
  };

  const handleFindCurrentTask = async () => {
    addLog("🔍 Finding current in-progress task...");
    try {
      const result = await findCurrentInProgressTask();
      addLog(result.message);

      if (result.success && result.data?.task) {
        setCurrentTask(result.data.task);
      } else {
        setCurrentTask(null);
      }
    } catch (error) {
      addLog(
        `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  const handleStartMonitoring = async () => {
    if (isMonitoring && unsubscribe) {
      // Stop monitoring
      unsubscribe();
      setIsMonitoring(false);
      setUnsubscribe(null);
      addLog("🛑 Stopped task monitoring");
      return;
    }

    addLog("🎯 Starting task monitoring...");

    const onTaskUpdate: TaskUpdateCallback = (result) => {
      addLog(result.message);
      if (result.currentTask) {
        setCurrentTask(result.currentTask);
      } else if (result.currentTask === undefined) {
        setCurrentTask(null);
      }
    };

    try {
      const { unsubscribe: unsubscribeFn, initialTask } =
        await startTaskMonitoring(onTaskUpdate);

      addLog(initialTask.message);
      if (initialTask.success && initialTask.data?.task) {
        setCurrentTask(initialTask.data.task);
      }

      setIsMonitoring(true);
      setUnsubscribe(() => unsubscribeFn);
    } catch (error) {
      addLog(
        `❌ Error starting monitoring: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [unsubscribe]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Task Monitoring Demo
        </h2>

        {/* Control Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={handleFindCurrentTask}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
          >
            Find Current Task
          </button>

          <button
            onClick={handleStartMonitoring}
            className={`px-4 py-2 rounded-md transition-colors ${
              isMonitoring
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-green-500 hover:bg-green-600 text-white"
            }`}
          >
            {isMonitoring ? "Stop Monitoring" : "Start Real-time Monitoring"}
          </button>
        </div>

        {/* Current Task Display */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Current Task
          </h3>
          {currentTask ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
                <span className="font-medium text-gray-800">
                  {currentTask.type === "subtask"
                    ? `${currentTask.parentTask} → ${currentTask.name}`
                    : currentTask.name}
                </span>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  <strong>Type:</strong> {currentTask.type}
                </p>
                <p>
                  <strong>Path:</strong> {currentTask.path}
                </p>
                <p>
                  <strong>Started:</strong>{" "}
                  {currentTask.startedAt?.toDate
                    ? currentTask.startedAt.toDate().toLocaleString()
                    : new Date(currentTask.startedAt).toLocaleString()}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-gray-500">
              <span className="inline-block w-3 h-3 bg-gray-400 rounded-full"></span>
              <span>No task currently in progress</span>
            </div>
          )}
        </div>

        {/* Monitoring Status */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                isMonitoring ? "bg-green-500 animate-pulse" : "bg-gray-400"
              }`}
            ></div>
            <span className="font-medium text-blue-800">
              {isMonitoring
                ? "Real-time monitoring active"
                : "Monitoring stopped"}
            </span>
          </div>
          {isMonitoring && (
            <p className="text-sm text-blue-600 mt-1">
              Watching for task changes in real-time...
            </p>
          )}
        </div>
      </div>

      {/* Activity Log */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Activity Log</h3>
        <div className="bg-black rounded-lg p-4 max-h-64 overflow-y-auto">
          {logs.length > 0 ? (
            <div className="space-y-1 font-mono text-sm">
              {logs.map((log, index) => (
                <div key={index} className="text-green-400">
                  {log}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">
              No activity yet. Click a button to start!
            </p>
          )}
        </div>
        {logs.length > 0 && (
          <button
            onClick={() => setLogs([])}
            className="mt-3 text-sm text-gray-500 hover:text-gray-700"
          >
            Clear Log
          </button>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-800 mb-2">How to Test</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>
            1. <strong>Find Current Task:</strong> Searches for any IN_PROGRESS
            tasks in today's collection
          </li>
          <li>
            2. <strong>Start Monitoring:</strong> Sets up real-time listening
            for task status changes
          </li>
          <li>
            3. <strong>Test with Firestore:</strong> Create tasks in the
            Dailies/{new Date().toISOString().split("T")[0]}/tasks collection
          </li>
          <li>
            4. <strong>Watch Updates:</strong> Change task status to
            'IN_PROGRESS' or 'COMPLETED' to see real-time updates
          </li>
        </ul>
      </div>
    </div>
  );
}
