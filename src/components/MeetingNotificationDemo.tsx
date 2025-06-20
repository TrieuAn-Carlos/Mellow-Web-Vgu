"use client";

import React, { useState, useEffect } from "react";
import { Timestamp } from "firebase/firestore";
import { addTask } from "../lib/firebase-collections";
import { meetingNotificationService } from "../lib/meeting-notification-service";
import type { CreateTask } from "../types/schema";

export const MeetingNotificationDemo: React.FC = () => {
  const [meetingName, setMeetingName] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [lastCreatedMeeting, setLastCreatedMeeting] = useState<string | null>(
    null
  );

  // Add state for scheduled notifications
  const [scheduledNotifications, setScheduledNotifications] = useState<
    Array<{
      taskName: string;
      meetingTime: Date;
      notificationTime: Date;
    }>
  >([]);

  // Add state for permission status
  const [isPermissionGranted, setIsPermissionGranted] = useState(
    meetingNotificationService.isNotificationPermissionGranted()
  );

  // Function to refresh notifications
  const refreshNotifications = () => {
    const notifications =
      meetingNotificationService.getScheduledNotifications();
    setScheduledNotifications(notifications);
    setIsPermissionGranted(
      meetingNotificationService.isNotificationPermissionGranted()
    );
  };

  // Load notifications on component mount
  useEffect(() => {
    refreshNotifications();
  }, []);

  const createTestMeeting = async () => {
    if (!meetingName || !meetingTime) {
      alert("Please enter both meeting name and time");
      return;
    }

    setIsCreating(true);
    try {
      const meetingDateTime = new Date(meetingTime);

      if (meetingDateTime <= new Date()) {
        alert("Please select a future time for the meeting");
        setIsCreating(false);
        return;
      }

      const today = new Date();
      const taskToCreate: CreateTask = {
        name: meetingName,
        status: "MEETING",
        plannedAt: Timestamp.fromDate(meetingDateTime),
        order: Date.now(), // Simple ordering
        projectRef: "meetings", // Default project for meetings
        subtasks: [],
      };

      await addTask(today, taskToCreate);

      // Manually trigger notification processing for the new task
      // Since we just created the task, we need to simulate what the real-time listener would do
      const newTask: any = {
        id: `temp-${Date.now()}`, // Temporary ID since we don't have the real one yet
        name: taskToCreate.name,
        status: taskToCreate.status,
        plannedAt: taskToCreate.plannedAt!,
        startedAt: null,
        completedAt: null,
        order: taskToCreate.order,
        projectRef: taskToCreate.projectRef,
        isActive: false,
        elapsedSeconds: 0,
        subtasks: taskToCreate.subtasks || [],
      };

      // Process the new task for notifications
      meetingNotificationService.processTasksForMeetingNotifications([newTask]);

      // Refresh the notifications display
      refreshNotifications();

      setLastCreatedMeeting(
        `"${meetingName}" at ${meetingDateTime.toLocaleString()}`
      );
      setMeetingName("");
      setMeetingTime("");

      console.log("✅ Meeting created successfully:", taskToCreate);
    } catch (error) {
      console.error("❌ Error creating meeting:", error);
      alert("Error creating meeting. Check console for details.");
    } finally {
      setIsCreating(false);
    }
  };

  const requestPermission = async () => {
    const granted =
      await meetingNotificationService.requestNotificationPermission();
    if (granted) {
      alert("✅ Notification permission granted!");
      setIsPermissionGranted(true);
    } else {
      alert("❌ Notification permission denied.");
      setIsPermissionGranted(false);
    }
  };

  const cancelAllNotifications = () => {
    meetingNotificationService.cancelAllNotifications();
    alert("🗑️ All notifications cancelled");
    refreshNotifications(); // Refresh to show empty list
  };

  // Get current date-time for the input (minimum value)
  const getCurrentDateTime = () => {
    const now = new Date();
    // Format for datetime-local input
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Get a time 10 minutes from now as default
  const getDefaultMeetingTime = () => {
    const tenMinutesFromNow = new Date(Date.now() + 10 * 60 * 1000);
    const year = tenMinutesFromNow.getFullYear();
    const month = String(tenMinutesFromNow.getMonth() + 1).padStart(2, "0");
    const day = String(tenMinutesFromNow.getDate()).padStart(2, "0");
    const hours = String(tenMinutesFromNow.getHours()).padStart(2, "0");
    const minutes = String(tenMinutesFromNow.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        🔔 Meeting Notification Demo
      </h2>

      {/* Permission Status */}
      <div className="mb-6 p-4 rounded-lg bg-gray-50">
        <h3 className="font-semibold mb-2">Notification Permission</h3>
        <div className="flex items-center justify-between">
          <span
            className={`px-3 py-1 rounded-full text-sm ${
              isPermissionGranted
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {isPermissionGranted ? "✅ Granted" : "❌ Not Granted"}
          </span>
          {!isPermissionGranted && (
            <button
              onClick={requestPermission}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Request Permission
            </button>
          )}
        </div>
      </div>

      {/* Create Meeting */}
      <div className="mb-6 p-4 border rounded-lg">
        <h3 className="font-semibold mb-4">Create Test Meeting</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meeting Name
            </label>
            <input
              type="text"
              value={meetingName}
              onChange={(e) => setMeetingName(e.target.value)}
              placeholder="e.g., Team Standup, Client Review"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meeting Time
            </label>
            <input
              type="datetime-local"
              value={meetingTime}
              onChange={(e) => setMeetingTime(e.target.value)}
              min={getCurrentDateTime()}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setMeetingTime(getDefaultMeetingTime())}
              className="mt-1 text-sm text-blue-600 hover:text-blue-800"
            >
              Set to 10 minutes from now
            </button>
          </div>

          <button
            onClick={createTestMeeting}
            disabled={isCreating || !meetingName || !meetingTime}
            className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isCreating ? "Creating..." : "Create Meeting"}
          </button>
        </div>

        {lastCreatedMeeting && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">
              ✅ Successfully created meeting: {lastCreatedMeeting}
            </p>
          </div>
        )}
      </div>

      {/* Scheduled Notifications */}
      <div className="mb-6 p-4 border rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Scheduled Notifications</h3>
          {scheduledNotifications.length > 0 && (
            <button
              onClick={cancelAllNotifications}
              className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
            >
              Cancel All
            </button>
          )}
        </div>

        {scheduledNotifications.length === 0 ? (
          <p className="text-gray-500 text-sm">No notifications scheduled</p>
        ) : (
          <div className="space-y-2">
            {scheduledNotifications.map((notification, index) => (
              <div
                key={index}
                className="p-3 bg-blue-50 border border-blue-200 rounded"
              >
                <div className="font-medium text-blue-900">
                  {notification.taskName}
                </div>
                <div className="text-sm text-blue-700">
                  Meeting: {notification.meetingTime.toLocaleString()}
                </div>
                <div className="text-sm text-blue-600">
                  Notification: {notification.notificationTime.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold text-yellow-800 mb-2">How it works:</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>1. Grant notification permission if not already granted</li>
          <li>2. Create a test meeting with a future time</li>
          <li>
            3. The system will automatically schedule a notification 5 minutes
            before the meeting
          </li>
          <li>4. You'll see the scheduled notification in the list above</li>
          <li>
            5. The notification will pop up 5 minutes before the meeting time
          </li>
        </ul>
      </div>
    </div>
  );
};
