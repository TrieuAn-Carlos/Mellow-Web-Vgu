"use client";

import React, { useState } from "react";
import {
  createProject,
  createTask,
  createDaily,
} from "@/lib/firebase-operations";

export const SampleDataSeeder: React.FC = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [message, setMessage] = useState("");

  const sampleProjects = [
    {
      name: "Language Learning",
      color: "#FF6B6B",
      description: "German language study and practice",
    },
    {
      name: "Fitness & Health",
      color: "#4ECDC4",
      description: "Daily exercise and wellness activities",
    },
    {
      name: "Work Tasks",
      color: "#45B7D1",
      description: "Professional development and work projects",
    },
    {
      name: "Personal Development",
      color: "#96CEB4",
      description: "Self-improvement and learning activities",
    },
  ];

  const sampleTasks = [
    {
      name: "German vocabulary practice",
      project: "Language Learning",
      status: "IN_PROGRESS" as const,
    },
    {
      name: "German grammar exercises",
      project: "Language Learning",
      status: "NOT_STARTED" as const,
    },
    {
      name: "Watch German documentary",
      project: "Language Learning",
      status: "COMPLETED" as const,
    },
    {
      name: "Morning workout routine",
      project: "Fitness & Health",
      status: "COMPLETED" as const,
    },
    {
      name: "Plan weekly meals",
      project: "Fitness & Health",
      status: "NOT_STARTED" as const,
    },
    {
      name: "Review project proposals",
      project: "Work Tasks",
      status: "IN_PROGRESS" as const,
    },
    {
      name: "Team meeting preparation",
      project: "Work Tasks",
      status: "NOT_STARTED" as const,
    },
    {
      name: "Read psychology article",
      project: "Personal Development",
      status: "NOT_STARTED" as const,
    },
    {
      name: "Practice meditation",
      project: "Personal Development",
      status: "COMPLETED" as const,
    },
    {
      name: "Journal writing",
      project: "Personal Development",
      status: "NOT_STARTED" as const,
    },
  ];

  const seedSampleData = async () => {
    setIsSeeding(true);
    setMessage("");

    try {
      // Create projects first
      const projectRefs: { [key: string]: string } = {};

      for (const project of sampleProjects) {
        const projectRef = await createProject(project);
        projectRefs[project.name] = projectRef;
        setMessage((prev) => prev + `✓ Created project: ${project.name}\n`);
      }

      // Create today's daily record
      const today = new Date();
      await createDaily({
        date: today,
        cardScannedAt: null,
      });
      setMessage((prev) => prev + `✓ Created daily record for today\n`);

      // Create tasks
      for (let i = 0; i < sampleTasks.length; i++) {
        const task = sampleTasks[i];
        const now = new Date();

        const taskData = {
          name: task.name,
          status: task.status,
          plannedAt: null,
          order: i + 1,
          projectRef: projectRefs[task.project],
        };

        // Add timestamps for completed and in-progress tasks
        if (task.status === "COMPLETED") {
          const startTime = new Date(
            now.getTime() - Math.random() * 120 * 60 * 1000
          ); // Started 0-2 hours ago
          const endTime = new Date(
            startTime.getTime() + Math.random() * 60 * 60 * 1000
          ); // Took 0-1 hour
          (taskData as any).startedAt = startTime;
          (taskData as any).completedAt = endTime;
        } else if (task.status === "IN_PROGRESS") {
          const startTime = new Date(
            now.getTime() - Math.random() * 60 * 60 * 1000
          ); // Started 0-1 hour ago
          (taskData as any).startedAt = startTime;
        }

        await createTask(today, taskData);
        setMessage((prev) => prev + `✓ Created task: ${task.name}\n`);
      }

      setMessage(
        (prev) =>
          prev +
          `\n🎉 Successfully seeded sample data! Refresh the page to see your tasks.`
      );
    } catch (error) {
      console.error("Error seeding data:", error);
      setMessage(
        `❌ Error seeding data: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-md">
        <h3 className="font-semibold text-gray-800 mb-2">
          🧪 Development Helper
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Seed sample tasks and projects to test the home page layout.
        </p>

        <button
          onClick={seedSampleData}
          disabled={isSeeding}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-3"
        >
          {isSeeding ? "Seeding Data..." : "Seed Sample Data"}
        </button>

        {message && (
          <div className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto">
            <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
              {message}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
