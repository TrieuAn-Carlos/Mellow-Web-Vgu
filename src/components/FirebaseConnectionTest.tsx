"use client";

import { useState } from "react";
import {
  testFirestoreConnection,
  type FirebaseOperationResult,
} from "@/lib/firebase-monitoring";

export default function FirebaseConnectionTest() {
  const [result, setResult] = useState<FirebaseOperationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTestConnection = async () => {
    setLoading(true);
    setResult(null);

    try {
      const testResult = await testFirestoreConnection();
      setResult(testResult);
    } catch (error) {
      setResult({
        success: false,
        message: `❌ Connection test failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-800">
        Firebase Connection Test
      </h2>

      <button
        onClick={handleTestConnection}
        disabled={loading}
        className={`w-full py-2 px-4 rounded-md font-medium ${
          loading
            ? "bg-gray-400 cursor-not-allowed text-gray-600"
            : "bg-blue-500 hover:bg-blue-600 text-white"
        } transition-colors`}
      >
        {loading ? "Testing Connection..." : "Test Firebase Connection"}
      </button>

      {result && (
        <div
          className={`mt-4 p-4 rounded-md ${
            result.success
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          <p
            className={`text-sm ${
              result.success ? "text-green-800" : "text-red-800"
            }`}
          >
            {result.message}
          </p>

          {result.success && result.data && (
            <div className="mt-2 text-xs text-gray-600">
              <p>
                <strong>Document ID:</strong> {result.data.documentId}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        <p>
          <strong>Firebase Project:</strong> mellow-4401e
        </p>
        <p>
          <strong>Database:</strong> Firestore
        </p>
      </div>
    </div>
  );
}
