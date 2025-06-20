"use client";

import React, { useState } from "react";
import type { Task, Project, TaskStatus, CreateTask } from "../../types/schema";
import {
  addTask,
  updateTask,
  deleteTask,
  addSubtask,
  updateSubtask,
  deleteSubtask,
} from "../../lib/firebase-collections";
import { updateProject } from "../../lib/firebase-operations";
import { Timestamp } from "firebase/firestore";

interface TaskManagerProps {
  tasks: Task[];
  projects: Project[];
  date: Date;
  onTasksUpdate: (tasks: Task[]) => void;
}

export const TaskManager: React.FC<TaskManagerProps> = ({
  tasks,
  projects,
  date,
  onTasksUpdate,
}) => {
  const [loading, setLoading] = useState(false);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  // Subtask states
  const [addingSubtaskTo, setAddingSubtaskTo] = useState<string | null>(null);
  const [newSubtaskName, setNewSubtaskName] = useState("");
  const [editingSubtask, setEditingSubtask] = useState<string | null>(null);
  const [editingSubtaskName, setEditingSubtaskName] = useState("");
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [editingProjectName, setEditingProjectName] = useState("");

  // Click handling states
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isTripleClicking, setIsTripleClicking] = useState(false);

  const handleCreateSubtask = async (parentTaskId: string) => {
    if (!newSubtaskName.trim()) return;

    setLoading(true);
    try {
      const parentTask = tasks.find((t) => t.id === parentTaskId);
      if (!parentTask) return;

      const subtaskData: CreateTask = {
        name: newSubtaskName.trim(),
        status: "NOT_STARTED" as TaskStatus,
        plannedAt: null,
        order: (parentTask.subtasks?.length || 0) + 1,
        projectRef: parentTask.projectRef,
        elapsedSeconds: 0,
        isActive: false,
      };

      const subtaskId = await addSubtask(date, parentTaskId, subtaskData);

      const newSubtask: Task = {
        ...subtaskData,
        id: subtaskId,
        startedAt: null,
        completedAt: null,
        subtasks: [],
      };

      const updatedTasks = tasks.map((task) =>
        task.id === parentTaskId
          ? { ...task, subtasks: [...(task.subtasks || []), newSubtask] }
          : task
      );

      onTasksUpdate(updatedTasks);
      setNewSubtaskName("");
      setAddingSubtaskTo(null);
    } catch (error) {
      console.error("Error creating subtask:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTaskStatus = async (
    taskId: string,
    status: TaskStatus,
    isSubtask = false,
    parentTaskId?: string
  ) => {
    setLoading(true);
    try {
      const updates: Partial<Task> = { status };
      if (status === "COMPLETED") {
        updates.completedAt = Timestamp.now();
      }

      if (isSubtask && parentTaskId) {
        await updateSubtask(date, parentTaskId, taskId, updates);

        const updatedTasks = tasks.map((task) =>
          task.id === parentTaskId
            ? {
                ...task,
                subtasks:
                  task.subtasks?.map((subtask) =>
                    subtask.id === taskId ? { ...subtask, ...updates } : subtask
                  ) || [],
              }
            : task
        );
        onTasksUpdate(updatedTasks);
      } else {
        await updateTask(date, taskId, updates);

        const updatedTasks = tasks.map((task) =>
          task.id === taskId ? { ...task, ...updates } : task
        );
        onTasksUpdate(updatedTasks);
      }
    } catch (error) {
      console.error("Error updating task status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (
    taskId: string,
    isSubtask = false,
    parentTaskId?: string
  ) => {
    setLoading(true);
    try {
      if (isSubtask && parentTaskId) {
        await deleteSubtask(date, parentTaskId, taskId);

        const updatedTasks = tasks.map((task) =>
          task.id === parentTaskId
            ? {
                ...task,
                subtasks:
                  task.subtasks?.filter((subtask) => subtask.id !== taskId) ||
                  [],
              }
            : task
        );
        onTasksUpdate(updatedTasks);
      } else {
        await deleteTask(date, taskId);
        onTasksUpdate(tasks.filter((task) => task.id !== taskId));
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTaskName = async (
    taskId: string,
    isSubtask = false,
    parentTaskId?: string
  ) => {
    const nameToUse = isSubtask ? editingSubtaskName : editingName;
    if (!nameToUse.trim()) return;

    setLoading(true);
    try {
      if (isSubtask && parentTaskId) {
        await updateSubtask(date, parentTaskId, taskId, {
          name: nameToUse.trim(),
        });

        const updatedTasks = tasks.map((task) =>
          task.id === parentTaskId
            ? {
                ...task,
                subtasks:
                  task.subtasks?.map((subtask) =>
                    subtask.id === taskId
                      ? { ...subtask, name: nameToUse.trim() }
                      : subtask
                  ) || [],
              }
            : task
        );
        onTasksUpdate(updatedTasks);
        setEditingSubtask(null);
        setEditingSubtaskName("");
      } else {
        await updateTask(date, taskId, { name: nameToUse.trim() });

        const updatedTasks = tasks.map((task) =>
          task.id === taskId ? { ...task, name: nameToUse.trim() } : task
        );
        onTasksUpdate(updatedTasks);
        setEditingTask(null);
        setEditingName("");
      }
    } catch (error) {
      console.error("Error updating task name:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProjectName = async (projectId: string) => {
    if (!editingProjectName.trim()) return;

    setLoading(true);
    try {
      await updateProject(projectId, { name: editingProjectName.trim() });

      setEditingProject(null);
      setEditingProjectName("");

      // Note: Project name will be updated when parent refreshes projects
      console.log(
        `Project ${projectId} name updated to: ${editingProjectName.trim()}`
      );
    } catch (error) {
      console.error("Error updating project name:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTripleClick = (taskId: string) => {
    setIsTripleClicking(true);
    setAddingSubtaskTo(taskId);

    // Clear any pending double-click
    if (clickTimeout) {
      clearTimeout(clickTimeout);
      setClickTimeout(null);
    }

    // Reset triple-clicking state after a delay
    setTimeout(() => {
      setIsTripleClicking(false);
    }, 500);
  };

  const handleDoubleClickWithDelay = (callback: () => void) => {
    // If already triple-clicking, ignore double-click
    if (isTripleClicking) {
      return;
    }

    // Clear any existing timeout
    if (clickTimeout) {
      clearTimeout(clickTimeout);
    }

    // Set a small delay to check if triple-click follows
    const timeout = setTimeout(() => {
      // Only execute if not triple-clicking
      if (!isTripleClicking) {
        callback();
      }
      setClickTimeout(null);
    }, 200); // 200ms delay to detect triple-click

    setClickTimeout(timeout);
  };

  const getProjectByName = (projectRef: string) => {
    if (!projectRef) return null;

    // projectRef contains the actual project name, not the document ID
    // This matches the implementation in AdminTaskManager
    return projects.find((p) => p.name === projectRef) || null;
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case "NOT_STARTED":
        return "bg-gray-500";
      case "IN_PROGRESS":
        return "bg-yellow-500";
      case "COMPLETED":
        return "bg-green-500";
      case "CANCELLED":
        return "bg-red-500";
      case "MEETING":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: TaskStatus) => {
    switch (status) {
      case "NOT_STARTED":
        return "Not Started";
      case "IN_PROGRESS":
        return "In Progress";
      case "COMPLETED":
        return "Completed";
      case "CANCELLED":
        return "Cancelled";
      case "MEETING":
        return "Meeting";
      default:
        return "Unknown";
    }
  };

  const renderTask = (task: Task, isSubtask = false, parentTaskId?: string) => {
    const project = getProjectByName(task.projectRef);
    const taskKey = isSubtask ? `${parentTaskId}-${task.id}` : task.id;

    // Debug logging
    if (!isSubtask) {
      console.log(
        `[TaskManager] Task: ${task.name}, ProjectRef: ${task.projectRef}, Found Project:`,
        project
      );
      console.log(
        `[TaskManager] Available Projects:`,
        projects.map((p) => ({ id: p.id, name: p.name }))
      );
    }

    return (
      <div
        key={taskKey}
        className={`bg-gray-700/60 backdrop-blur-sm rounded-xl p-6 border border-gray-600/40 hover:border-gray-500/60 hover:bg-gray-600/80 transition-all duration-300 hover:shadow-xl ${
          isSubtask ? "ml-8 mr-0" : ""
        }`}
        onClick={(e) => {
          if (!isSubtask && e.detail === 3) {
            e.preventDefault();
            handleTripleClick(task.id);
          }
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {(isSubtask ? editingSubtask : editingTask) === task.id ? (
              <div className="flex gap-3">
                <input
                  type="text"
                  value={isSubtask ? editingSubtaskName : editingName}
                  onChange={(e) =>
                    isSubtask
                      ? setEditingSubtaskName(e.target.value)
                      : setEditingName(e.target.value)
                  }
                  className="flex-1 px-4 py-3 bg-gray-600/90 backdrop-blur-sm text-white rounded-xl border border-gray-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500 hover:bg-gray-600 transition-all duration-200"
                />
                <button
                  onClick={() =>
                    handleEditTaskName(task.id, isSubtask, parentTaskId)
                  }
                  className="px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 font-medium"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    if (isSubtask) {
                      setEditingSubtask(null);
                      setEditingSubtaskName("");
                    } else {
                      setEditingTask(null);
                      setEditingName("");
                    }
                  }}
                  className="px-4 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex-1">
                <div>
                  <div className="flex items-center gap-2">
                    {isSubtask && (
                      <span className="text-gray-400 text-sm">└</span>
                    )}
                    <h3
                      className="font-medium text-white cursor-pointer hover:text-blue-400 transition-colors duration-200"
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        handleDoubleClickWithDelay(() => {
                          if (isSubtask) {
                            setEditingSubtask(task.id);
                            setEditingSubtaskName(task.name);
                          } else {
                            setEditingTask(task.id);
                            setEditingName(task.name);
                          }
                        });
                      }}
                    >
                      {task.name}
                    </h3>
                  </div>

                  {/* Project Information - Simple and small display */}
                  {project ? (
                    <div
                      className={`mt-1 flex items-center gap-1 text-xs text-gray-400 ${
                        isSubtask ? "ml-6" : ""
                      }`}
                    >
                      <span
                        className="inline-block w-2 h-2 rounded-full"
                        style={{ backgroundColor: project.color }}
                      ></span>
                      <span>{project.name}</span>
                    </div>
                  ) : (
                    <div
                      className={`mt-1 text-xs text-gray-500 ${
                        isSubtask ? "ml-6" : ""
                      }`}
                    >
                      📋 No project assigned
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 ml-6">
            {/* Status Badge */}
            <span
              className={`px-4 py-2 text-xs font-medium text-white rounded-xl ${getStatusColor(
                task.status
              )}`}
            >
              {getStatusText(task.status)}
            </span>

            {/* Status Actions */}
            <div className="flex gap-2">
              {task.status !== "COMPLETED" && (
                <button
                  onClick={() =>
                    handleUpdateTaskStatus(
                      task.id,
                      "COMPLETED",
                      isSubtask,
                      parentTaskId
                    )
                  }
                  className="px-4 py-2 text-xs bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 font-medium"
                >
                  Complete
                </button>
              )}
              {task.status === "NOT_STARTED" && (
                <button
                  onClick={() =>
                    handleUpdateTaskStatus(
                      task.id,
                      "IN_PROGRESS",
                      isSubtask,
                      parentTaskId
                    )
                  }
                  className="px-4 py-2 text-xs bg-yellow-600 text-white rounded-xl hover:bg-yellow-700 transition-all duration-200 font-medium"
                >
                  Start
                </button>
              )}
              <button
                onClick={() =>
                  handleDeleteTask(task.id, isSubtask, parentTaskId)
                }
                className="p-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 flex items-center justify-center"
                title="Delete task"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18 6L17.1991 18.0129C17.129 19.065 17.0939 19.5911 16.8667 19.99C16.6666 20.3412 16.3648 20.6235 16.0011 20.7998C15.588 21 15.0607 21 14.0062 21H9.99377C8.93927 21 8.41202 21 7.99889 20.7998C7.63517 20.6235 7.33339 20.3412 7.13332 19.99C6.90607 19.5911 6.871 19.065 6.80086 18.0129L6 6M4 6H20M16 6L15.7294 5.18807C15.4671 4.40125 15.3359 4.00784 15.0927 3.71698C14.8779 3.46013 14.6021 3.26132 14.2905 3.13878C13.9376 3 13.523 3 12.6936 3H11.3064C10.477 3 10.0624 3 9.70951 3.13878C9.39792 3.26132 9.12208 3.46013 8.90729 3.71698C8.66405 4.00784 8.53292 4.40125 8.27064 5.18807L8 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Add Subtask Form (triggered by triple click) */}
        {!isSubtask && addingSubtaskTo === task.id && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex gap-3 ml-8">
              <input
                type="text"
                value={newSubtaskName}
                onChange={(e) => setNewSubtaskName(e.target.value)}
                placeholder="Subtask name..."
                className="flex-1 px-4 py-2 bg-gray-600/90 backdrop-blur-sm text-white rounded-xl border border-gray-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500 hover:bg-gray-600 transition-all duration-200 placeholder-gray-400"
                autoFocus
              />
              <button
                onClick={() => handleCreateSubtask(task.id)}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium text-sm"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setAddingSubtaskTo(null);
                  setNewSubtaskName("");
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-200 font-medium text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Tasks List */}
      <div className="bg-gray-800/90 backdrop-blur-md rounded-xl p-8 shadow-xl border border-gray-700/30 hover:shadow-2xl transition-all duration-500">
        <h2 className="text-xl font-semibold text-white mb-6">
          Today's Tasks ({tasks.length})
        </h2>
        {tasks.length === 0 ? (
          <p className="text-gray-400 text-center py-12 bg-gradient-to-r from-gray-400 to-gray-500 bg-clip-text text-transparent">
            No tasks for today
          </p>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div key={task.id}>
                {/* Main Task */}
                {renderTask(task)}

                {/* Subtasks */}
                {task.subtasks && task.subtasks.length > 0 && (
                  <div className="space-y-3 mt-3">
                    {task.subtasks.map((subtask) =>
                      renderTask(subtask, true, task.id)
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
