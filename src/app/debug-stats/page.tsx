"use client";

import { useState } from "react";
import {
  getTotalMellowsInTimeframe,
  getTotalFocusTime,
} from "@/lib/firebase-monitoring";

export default function DebugStatsPage() {
  const [mellowsResult, setMellowsResult] = useState<any>(null);
  const [focusTimeResult, setFocusTimeResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testMellows = async (testDate: string) => {
    setLoading(true);
    try {
      console.log("🧪 Testing mellows for date:", testDate);
      const result = await getTotalMellowsInTimeframe(testDate, testDate);
      console.log("🧪 Mellows result:", result);
      setMellowsResult(result);
    } catch (error) {
      console.error("🧪 Mellows error:", error);
      setMellowsResult({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  const testFocusTime = async (testDate: string) => {
    setLoading(true);
    try {
      console.log("🧪 Testing focus time for date:", testDate);
      const result = await getTotalFocusTime(testDate, testDate);
      console.log("🧪 Focus time result:", result);
      setFocusTimeResult(result);
    } catch (error) {
      console.error("🧪 Focus time error:", error);
      setFocusTimeResult({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  const testBoth = async (testDate: string) => {
    setLoading(true);
    try {
      console.log("🧪 Testing both functions for date:", testDate);

      const [mellowsRes, focusRes] = await Promise.all([
        getTotalMellowsInTimeframe(testDate, testDate),
        getTotalFocusTime(testDate, testDate),
      ]);

      setMellowsResult(mellowsRes);
      setFocusTimeResult(focusRes);

      console.log("🧪 Both results:", {
        mellows: mellowsRes,
        focusTime: focusRes,
      });
    } catch (error) {
      console.error("🧪 Both error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setMellowsResult({ error: errorMessage });
      setFocusTimeResult({ error: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">🔧 Debug Stats Integration</h1>

      <div className="space-y-6 mb-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Test Functions:</h2>
          <div className="grid grid-cols-2 gap-4">
            {/* Test Mellows */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">
                🎯 Test Total Mellows
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => testMellows(today)}
                  className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors"
                  disabled={loading}
                >
                  Test Today ({today})
                </button>
                <button
                  onClick={() => testMellows("2025-06-19")}
                  className="w-full bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition-colors"
                  disabled={loading}
                >
                  Test 2025-06-19 (Firebase Data)
                </button>
              </div>
            </div>

            {/* Test Focus Time */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">⏱️ Test Focus Time</h3>
              <div className="space-y-2">
                <button
                  onClick={() => testFocusTime(today)}
                  className="w-full bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded transition-colors"
                  disabled={loading}
                >
                  Test Today ({today})
                </button>
                <button
                  onClick={() => testFocusTime("2025-06-19")}
                  className="w-full bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded transition-colors"
                  disabled={loading}
                >
                  Test 2025-06-19 (Firebase Data)
                </button>
              </div>
            </div>
          </div>

          {/* Test Both */}
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-3">
              🚀 Test Both Functions:
            </h3>
            <div className="flex gap-4">
              <button
                onClick={() => testBoth(today)}
                className="bg-orange-600 hover:bg-orange-700 px-6 py-2 rounded transition-colors"
                disabled={loading}
              >
                Test Both Today ({today})
              </button>
              <button
                onClick={() => testBoth("2025-06-19")}
                className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded transition-colors"
                disabled={loading}
              >
                Test Both 2025-06-19
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="text-yellow-400 text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto mb-2"></div>
          <div className="text-lg">Loading...</div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mellows Result */}
        {mellowsResult && (
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">
              🎯 Total Mellows Result:
            </h3>
            <pre className="text-sm overflow-auto bg-gray-900 p-4 rounded border">
              {JSON.stringify(mellowsResult, null, 2)}
            </pre>
          </div>
        )}

        {/* Focus Time Result */}
        {focusTimeResult && (
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">
              ⏱️ Focus Time Result:
            </h3>
            <pre className="text-sm overflow-auto bg-gray-900 p-4 rounded border">
              {JSON.stringify(focusTimeResult, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div className="mt-8 bg-gray-800 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">📊 Algorithm Summary:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="font-semibold mb-2 text-blue-300">
              🎯 Total Mellows Algorithm:
            </h4>
            <ul className="list-disc list-inside space-y-1 text-gray-300">
              <li>Query all tasks in date range from Firebase</li>
              <li>Count main tasks with status = "COMPLETED"</li>
              <li>Count subtasks with status = "COMPLETED"</li>
              <li>Return total count (mellows collected)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-purple-300">
              ⏱️ Total Focus Time Algorithm:
            </h4>
            <ul className="list-disc list-inside space-y-1 text-gray-300">
              <li>Query all completed tasks in date range</li>
              <li>
                For each completed task: calculate (completedAt - startedAt)
              </li>
              <li>
                For each completed subtask: calculate (completedAt - startedAt)
              </li>
              <li>Sum all focus times together</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-900 rounded border-l-4 border-yellow-500">
          <h4 className="font-semibold mb-2 text-yellow-300">
            🔍 Console Debugging:
          </h4>
          <p className="text-sm text-gray-400">
            Check the browser console (F12) for detailed step-by-step logging
            from both functions. You'll see exactly which tasks are found, their
            statuses, and how calculations are performed.
          </p>
        </div>
      </div>
    </div>
  );
}
