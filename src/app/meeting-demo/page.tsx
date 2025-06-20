"use client";

import { MeetingNotificationDemo } from "../../components/MeetingNotificationDemo";

export default function MeetingDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Meeting Notification System
          </h1>
          <p className="text-gray-600">
            Test the automatic meeting notification feature with native web APIs
          </p>
        </div>

        <MeetingNotificationDemo />

        <div className="mt-8 text-center">
          <a
            href="/home"
            className="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
