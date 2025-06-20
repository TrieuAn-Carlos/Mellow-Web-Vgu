"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TaskManager } from "../../components/configures/TaskManager";
import { ProjectManager } from "../../components/configures/ProjectManager";
import { ArrowLeftIcon } from "../../components/configures/icons/ArrowLeftIcon";
import type { Task, Project } from "../../types/schema";
import { getTasksForDate } from "../../lib/firebase-collections";
import { getProjects } from "../../lib/firebase-operations";
import {
  getSettings,
  saveSettings,
  AppSettings,
} from "../../lib/settings-service";

// Use the AppSettings type from the service
type SettingsState = AppSettings;

interface TogglePillProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  description?: string;
}

const TogglePill: React.FC<TogglePillProps> = ({
  label,
  value,
  onChange,
  description,
}) => {
  return (
    <div className="bg-gray-800/80 backdrop-blur-md rounded-xl shadow-xl border border-gray-700/40 p-6 mb-4 hover:border-gray-600/60 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1">{label}</h3>
          {description && (
            <p className="text-sm text-gray-400">{description}</p>
          )}
        </div>
        <div className="ml-6">
          <button
            onClick={() => onChange(!value)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800 ${
              value ? "bg-green-600" : "bg-gray-600"
            }`}
            role="switch"
            aria-checked={value}
            aria-label={`Toggle ${label}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                value ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

interface SettingsManagerProps {
  settings: SettingsState;
  onAutoStartChange: (value: boolean) => void;
  onCflowChange: (value: boolean) => void;
}

const SettingsManager: React.FC<SettingsManagerProps> = ({
  settings,
  onAutoStartChange,
  onCflowChange,
}) => {
  return (
    <div className="bg-gray-800/80 backdrop-blur-md rounded-xl shadow-xl border border-gray-700/40">
      {/* Header */}
      <div className="border-b border-gray-700/40 px-6 py-4">
        <h2 className="text-xl font-bold text-white">Settings</h2>
        <p className="text-gray-400 text-sm mt-1">
          Configure your application preferences
        </p>
      </div>

      {/* Settings Content */}
      <div className="p-6 space-y-6">
        <TogglePill
          label="Auto Start"
          value={settings.AutoStart}
          onChange={onAutoStartChange}
          description="Automatically start the application when the system boots"
        />

        <TogglePill
          label="Continuous Flow"
          value={settings.Cflow}
          onChange={onCflowChange}
          description="Enable continuous task flow without interruptions"
        />
      </div>
    </div>
  );
};

export default function ConfigureTasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [settings, setSettings] = useState<SettingsState>({
    AutoStart: false,
    Cflow: false,
  });
  const [activeTab, setActiveTab] = useState<"tasks" | "projects" | "settings">(
    "tasks"
  );

  // Get today's date
  const today = new Date();

  const handleBackClick = () => {
    router.push("/home");
  };

  // Load initial data including settings
  useEffect(() => {
    const loadData = async () => {
      try {
        const [todayTasks, allProjects, appSettings] = await Promise.all([
          getTasksForDate(today),
          getProjects(),
          getSettings(),
        ]);
        setTasks(todayTasks);
        setProjects(allProjects);
        setSettings(appSettings);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();
  }, []);

  const handleTasksUpdate = (updatedTasks: Task[]) => {
    setTasks(updatedTasks);
  };

  const handleProjectsUpdate = (updatedProjects: Project[]) => {
    setProjects(updatedProjects);
  };

  const handleAutoStartChange = async (value: boolean) => {
    const newSettings = { ...settings, AutoStart: value };
    setSettings(newSettings);

    try {
      await saveSettings(newSettings);
    } catch (error) {
      console.error("Error saving AutoStart setting:", error);
    }
  };

  const handleCflowChange = async (value: boolean) => {
    const newSettings = { ...settings, Cflow: value };
    setSettings(newSettings);

    try {
      await saveSettings(newSettings);
    } catch (error) {
      console.error("Error saving Cflow setting:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 p-6">
      {/* Back Button - Top Left Corner */}
      <button
        onClick={handleBackClick}
        aria-label="Go back to home"
        className="fixed top-6 left-6 z-10 p-2 text-slate-300 hover:text-white transition-colors rounded-full hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
      >
        <ArrowLeftIcon className="w-6 h-6" />
      </button>

      <div className="max-w-7xl mx-auto flex gap-6">
        {/* Left Sidebar - Table of Contents */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-gray-800/80 backdrop-blur-md rounded-xl shadow-xl border border-gray-700/40 p-4 sticky top-6">
            <h3 className="text-lg font-semibold text-white mb-4">Contents</h3>
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab("tasks")}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 font-medium ${
                  activeTab === "tasks"
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-gray-300 hover:text-white hover:bg-gray-700/80"
                }`}
              >
                📋 Today's Tasks
              </button>
              <button
                onClick={() => setActiveTab("projects")}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 font-medium ${
                  activeTab === "projects"
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-gray-300 hover:text-white hover:bg-gray-700/80"
                }`}
              >
                🗂️ Projects
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 font-medium ${
                  activeTab === "settings"
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-gray-300 hover:text-white hover:bg-gray-700/80"
                }`}
              >
                ⚙️ Settings
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 transition-all duration-300 ease-in-out">
          {activeTab === "tasks" ? (
            <TaskManager
              tasks={tasks}
              projects={projects}
              date={today}
              onTasksUpdate={handleTasksUpdate}
            />
          ) : activeTab === "projects" ? (
            <ProjectManager
              projects={projects}
              onProjectsUpdate={handleProjectsUpdate}
            />
          ) : (
            <SettingsManager
              settings={settings}
              onAutoStartChange={handleAutoStartChange}
              onCflowChange={handleCflowChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}
