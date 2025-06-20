"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  getProjects,
  addProject,
  getTasksForDate,
  addTask,
  updateTask,
  deleteTask,
  getSubtasks,
  addSubtask,
  updateSubtask,
  deleteSubtask,
} from "../lib/firebase-collections";
import type {
  Project,
  Task,
  TaskStatus,
  CreateTask,
  CreateProject,
  TaskClient,
} from "../types/schema";
import { Timestamp } from "firebase/firestore";

interface TaskForm {
  name: string;
  status: TaskStatus;
  plannedAt: string;
  startedAt: string;
  completedAt: string;
  projectRef: string;
  parentTaskId?: string;
  subtaskId?: string;
}

const getTodayString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const isTimestamp = (value: any): value is Timestamp => {
  return value && typeof value.toDate === "function";
};

export const AdminTaskManager: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<TaskClient[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [loading, setLoading] = useState({ page: true, tasks: false });
  const [error, setError] = useState<string | null>(null);

  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>(
    {}
  );

  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTask, setEditingTask] = useState<string | null>(null);

  const getNowForHTMLInput = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const [taskForm, setTaskForm] = useState<TaskForm>({
    name: "",
    status: "NOT_STARTED",
    plannedAt: "",
    startedAt: "",
    completedAt: "",
    projectRef: "",
  });

  const fetchProjects = useCallback(async () => {
    try {
      const data = await getProjects();
      setProjects(data);
      if (data.length > 0 && !taskForm.projectRef) {
        setTaskForm((prev) => ({ ...prev, projectRef: data[0].id }));
      }
    } catch (e: any) {
      setError("Failed to fetch projects");
    }
  }, [taskForm.projectRef]);

  const fetchTasksForDate = useCallback(async (date: string) => {
    setLoading((prev) => ({ ...prev, tasks: true }));
    setError(null);
    try {
      const correctedDate = new Date(date + "T00:00:00");
      const fetchedTasks = await getTasksForDate(correctedDate);

      const tasksWithSubtasks: TaskClient[] = fetchedTasks.map((task) => {
        let subtasks: TaskClient[] = [];
        if (task.subtasks && task.subtasks.length > 0) {
          subtasks = task.subtasks.map((sub) => ({
            ...sub,
            plannedAt: isTimestamp(sub.plannedAt)
              ? sub.plannedAt.toDate()
              : null,
            startedAt: isTimestamp(sub.startedAt)
              ? sub.startedAt.toDate()
              : null,
            completedAt: isTimestamp(sub.completedAt)
              ? sub.completedAt.toDate()
              : null,
            subtasks: undefined, // Subtasks don't have nested subtasks
          }));
        }
        return {
          ...task,
          plannedAt: isTimestamp(task.plannedAt)
            ? task.plannedAt.toDate()
            : null,
          startedAt: isTimestamp(task.startedAt)
            ? task.startedAt.toDate()
            : null,
          completedAt: isTimestamp(task.completedAt)
            ? task.completedAt.toDate()
            : null,
          subtasks,
        };
      });

      setTasks(tasksWithSubtasks);
    } catch (e: any) {
      setError(`Failed to fetch tasks for ${date}`);
    } finally {
      setLoading((prev) => ({ ...prev, tasks: false }));
    }
  }, []);

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading((prev) => ({ ...prev, page: true }));
      await Promise.all([fetchProjects(), fetchTasksForDate(selectedDate)]);
      setLoading((prev) => ({ ...prev, page: false }));
    };
    loadInitialData();
  }, [fetchProjects, fetchTasksForDate, selectedDate]);

  const getProjectByName = (projectRef: string) => {
    // projectRef contains the actual project name, not the document ID
    return projects.find((p) => p.name === projectRef);
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case "NOT_STARTED":
        return "bg-slate-200 text-slate-900 border-slate-400 font-bold";
      case "IN_PROGRESS":
        return "bg-blue-200 text-blue-900 border-blue-400 font-bold";
      case "COMPLETED":
        return "bg-emerald-200 text-emerald-900 border-emerald-400 font-bold";
      case "CANCELLED":
        return "bg-red-200 text-red-900 border-red-400 font-bold";
      default:
        return "bg-slate-200 text-slate-900 border-slate-400 font-bold";
    }
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case "NOT_STARTED":
        return "⭕";
      case "IN_PROGRESS":
        return "⏳";
      case "COMPLETED":
        return "✅";
      case "CANCELLED":
        return "❌";
      default:
        return "⭕";
    }
  };

  const findParentTask = (subtaskId: string) => {
    return tasks.find((task) =>
      task.subtasks?.some((sub) => sub.id === subtaskId)
    );
  };

  const toggleExpandTask = (taskId: string) => {
    setExpandedTasks((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const resetForm = () => {
    setTaskForm({
      name: "",
      status: "NOT_STARTED",
      plannedAt: "",
      startedAt: "",
      completedAt: "",
      projectRef: projects.length > 0 ? projects[0].id : "",
    });
    setEditingTask(null);
    setIsAddingTask(false);
  };

  const handleAddSubtaskClick = (parentTaskId: string) => {
    resetForm();
    const parentProjectRef =
      tasks.find((t) => t.id === parentTaskId)?.projectRef || "";
    setTaskForm({
      name: "",
      status: "NOT_STARTED",
      plannedAt: "",
      startedAt: "",
      completedAt: "",
      projectRef: parentProjectRef,
      parentTaskId,
    });
    setIsAddingTask(true);
  };

  const handleEditClick = (task: TaskClient, parentTaskId?: string) => {
    setTaskForm({
      name: task.name,
      status: task.status,
      plannedAt: task.plannedAt
        ? new Date(task.plannedAt).toISOString().slice(0, 16)
        : "",
      startedAt: task.startedAt
        ? new Date(task.startedAt).toISOString().slice(0, 16)
        : "",
      completedAt: task.completedAt
        ? new Date(task.completedAt).toISOString().slice(0, 16)
        : "",
      projectRef: parentTaskId
        ? findParentTask(task.id)?.projectRef || ""
        : task.projectRef,
      parentTaskId: parentTaskId,
      subtaskId: parentTaskId ? task.id : undefined,
    });
    setEditingTask(task.id);
    setIsAddingTask(true);
  };

  const handleDeleteClick = async (taskId: string, parentTaskId?: string) => {
    if (
      !window.confirm(
        `Are you sure you want to delete this ${
          parentTaskId ? "subtask" : "task"
        }?`
      )
    )
      return;

    if (parentTaskId) {
      // Deleting a subtask
      const originalTasks = tasks;
      const newTasks = tasks.map((t) => {
        if (t.id === parentTaskId) {
          return {
            ...t,
            subtasks: t.subtasks?.filter((st) => st.id !== taskId),
          };
        }
        return t;
      });
      setTasks(newTasks);
      try {
        await deleteSubtask(new Date(selectedDate), parentTaskId, taskId);
      } catch (e) {
        setError("Failed to delete subtask");
        setTasks(originalTasks);
      }
    } else {
      // Deleting a main task
      const originalTasks = tasks;
      setTasks(tasks.filter((t) => t.id !== taskId));
      try {
        await deleteTask(new Date(selectedDate), taskId);
      } catch (e) {
        setError("Failed to delete task");
        setTasks(originalTasks);
      }
    }
  };

  const handleDeleteAllTasks = async () => {
    if (tasks.length === 0) {
      alert("No tasks to delete for this date.");
      return;
    }

    const confirmMessage = `Are you sure you want to delete ALL ${tasks.length} tasks for ${selectedDate}? This action cannot be undone.`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    // Second confirmation for safety
    if (
      !window.confirm(
        "This will permanently delete all tasks. Are you absolutely sure?"
      )
    ) {
      return;
    }

    setLoading((prev) => ({ ...prev, tasks: true }));

    // Store original tasks for rollback if needed
    const originalTasks = tasks;

    // Optimistically update UI
    setTasks([]);

    try {
      // Delete all main tasks (this should cascade delete subtasks)
      const deletePromises = originalTasks.map((task) =>
        deleteTask(new Date(selectedDate), task.id)
      );

      await Promise.all(deletePromises);

      // Refresh the task list to make sure everything is clean
      await fetchTasksForDate(selectedDate);
    } catch (e: any) {
      setError(`Failed to delete all tasks: ${e.message}`);
      // Rollback the UI change
      setTasks(originalTasks);
    } finally {
      setLoading((prev) => ({ ...prev, tasks: false }));
    }
  };

  const handleSetPlannedAtNow = () => {
    setTaskForm((prev) => ({ ...prev, plannedAt: getNowForHTMLInput() }));
  };

  const handleSetStartedAtNow = () => {
    setTaskForm((prev) => ({ ...prev, startedAt: getNowForHTMLInput() }));
  };

  const handleSetCompletedAtNow = () => {
    setTaskForm((prev) => ({ ...prev, completedAt: getNowForHTMLInput() }));
  };

  const handleStatusChange = (newStatus: TaskStatus) => {
    const updates: Partial<TaskForm> = { status: newStatus };

    // Auto-set completedAt when status becomes COMPLETED
    if (newStatus === "COMPLETED" && !taskForm.completedAt) {
      updates.completedAt = getNowForHTMLInput();
    }

    // Auto-set startedAt when status becomes IN_PROGRESS
    if (newStatus === "IN_PROGRESS" && !taskForm.startedAt) {
      updates.startedAt = getNowForHTMLInput();
    }

    setTaskForm((prev) => ({ ...prev, ...updates }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading((prev) => ({ ...prev, tasks: true }));

    try {
      const {
        name,
        status,
        plannedAt,
        startedAt,
        completedAt,
        projectRef,
        parentTaskId,
        subtaskId,
      } = taskForm;

      if (editingTask) {
        // --- LOGIC FOR UPDATING ---
        const isSub = !!(subtaskId && parentTaskId);
        const taskList = isSub
          ? tasks.find((t) => t.id === parentTaskId)?.subtasks
          : tasks;
        const originalTask = taskList?.find(
          (t) => t.id === (isSub ? subtaskId : editingTask)
        );

        if (!originalTask) {
          throw new Error("Task to update not found!");
        }

        const updates: Partial<Task> = { name, status, projectRef };
        updates.plannedAt = plannedAt
          ? Timestamp.fromDate(new Date(plannedAt))
          : null;
        updates.startedAt = startedAt
          ? Timestamp.fromDate(new Date(startedAt))
          : null;
        updates.completedAt = completedAt
          ? Timestamp.fromDate(new Date(completedAt))
          : null;

        if (subtaskId && parentTaskId) {
          await updateSubtask(
            new Date(selectedDate),
            parentTaskId,
            subtaskId,
            updates
          );
        } else {
          await updateTask(new Date(selectedDate), editingTask, updates);
        }
      } else {
        // --- LOGIC FOR CREATING ---
        const dataForNewTask: CreateTask = {
          name,
          status,
          projectRef,
          order: 0, // Will be properly set by the backend or another function if needed
          plannedAt: plannedAt ? Timestamp.fromDate(new Date(plannedAt)) : null,
        };

        // Create initial task/subtask
        let newId: string;
        if (parentTaskId) {
          const parentTask = tasks.find((t) => t.id === parentTaskId);
          dataForNewTask.order = parentTask?.subtasks?.length || 0;
          newId = await addSubtask(
            new Date(selectedDate),
            parentTaskId,
            dataForNewTask
          );
        } else {
          dataForNewTask.order = tasks.length;
          newId = await addTask(new Date(selectedDate), dataForNewTask);
        }

        // Update timestamps if provided
        const timestampUpdates: Partial<Task> = {};
        if (startedAt) {
          timestampUpdates.startedAt = Timestamp.fromDate(new Date(startedAt));
        }
        if (completedAt) {
          timestampUpdates.completedAt = Timestamp.fromDate(
            new Date(completedAt)
          );
        }

        if (Object.keys(timestampUpdates).length > 0) {
          if (parentTaskId) {
            await updateSubtask(
              new Date(selectedDate),
              parentTaskId,
              newId,
              timestampUpdates
            );
          } else {
            await updateTask(new Date(selectedDate), newId, timestampUpdates);
          }
        }
      }

      await fetchTasksForDate(selectedDate);
    } catch (e: any) {
      setError(`Operation failed: ${e.message}`);
    } finally {
      resetForm();
      setLoading((prev) => ({ ...prev, tasks: false }));
    }
  };

  const handleAddProject = async (
    projectName: string,
    projectColor: string
  ) => {
    if (!projectName.trim()) return;
    try {
      await addProject({
        name: projectName,
        color: projectColor,
        description: "",
      });
      await fetchProjects(); // Re-fetch projects to update the list
    } catch (e) {
      setError("Failed to add project");
    }
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    fetchTasksForDate(date);
  };

  const formatDateTime = (date: Date | null) => {
    if (!date) return "N/A";
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(date));
  };

  const getTotalStats = () => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "COMPLETED").length;
    return { totalTasks, completedTasks };
  };

  const renderTaskRow = (task: TaskClient, isSubtask: boolean) => {
    const project = isSubtask ? null : getProjectByName(task.projectRef);
    return (
      <React.Fragment key={task.id}>
        <tr
          className={
            isSubtask
              ? "bg-slate-50 hover:bg-slate-100 border-l-4 border-indigo-200"
              : "bg-white hover:bg-slate-50"
          }
        >
          <td
            className={`p-3 text-sm text-slate-700 whitespace-nowrap ${
              isSubtask ? "pl-20" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              {!isSubtask && task.subtasks && task.subtasks.length > 0 && (
                <button
                  onClick={() => toggleExpandTask(task.id)}
                  className="p-2 rounded-full hover:bg-slate-200 transition-colors flex-shrink-0"
                  title={
                    expandedTasks[task.id]
                      ? "Collapse subtasks"
                      : "Expand subtasks"
                  }
                >
                  <svg
                    className={`w-5 h-5 transition-transform duration-200 ${
                      expandedTasks[task.id] ? "rotate-90" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    ></path>
                  </svg>
                </button>
              )}
              {!isSubtask && (!task.subtasks || task.subtasks.length === 0) && (
                <div className="w-9 h-9"></div> // Placeholder for alignment
              )}
              {isSubtask && (
                <div className="flex items-center text-slate-400 mr-2">
                  <span className="text-lg font-mono">└─</span>
                </div>
              )}
              <div>
                <p
                  className={`font-semibold ${
                    isSubtask ? "text-slate-600" : "text-slate-800"
                  }`}
                >
                  {isSubtask && "↳ "}
                  {task.name}
                </p>
                <p className="text-xs text-slate-500">
                  ID: {task.id}
                  {!isSubtask && task.subtasks && task.subtasks.length > 0 && (
                    <span className="ml-2 text-indigo-600 font-medium">
                      ({task.subtasks.length} subtask
                      {task.subtasks.length !== 1 ? "s" : ""})
                    </span>
                  )}
                </p>
              </div>
            </div>
          </td>
          <td className="p-3 text-sm text-slate-700 whitespace-nowrap">
            {isSubtask ? (
              <span className="text-slate-400 italic text-xs">↳ Subtask</span>
            ) : (
              project?.name || "N/A"
            )}
          </td>
          <td className="p-3 text-sm text-slate-700 whitespace-nowrap">
            <div
              className={`px-3 py-1 text-xs rounded-full border ${getStatusColor(
                task.status
              )}`}
            >
              {getStatusIcon(task.status)} {task.status.replace("_", " ")}
            </div>
          </td>
          <td className="p-3 text-sm text-slate-700 whitespace-nowrap">
            {formatDateTime(task.plannedAt)}
          </td>
          <td className="p-3 text-sm text-slate-700 whitespace-nowrap">
            {formatDateTime(task.startedAt)}
          </td>
          <td className="p-3 text-sm text-slate-700 whitespace-nowrap">
            {formatDateTime(task.completedAt)}
          </td>
          <td className="p-3 text-sm text-slate-700 whitespace-nowrap text-right">
            <button
              onClick={() =>
                handleEditClick(
                  task,
                  isSubtask ? findParentTask(task.id)?.id : undefined
                )
              }
              className="text-blue-600 hover:text-blue-900 mr-4 text-xs font-medium"
            >
              Edit
            </button>
            <button
              onClick={() =>
                handleDeleteClick(
                  task.id,
                  isSubtask ? findParentTask(task.id)?.id : undefined
                )
              }
              className="text-red-600 hover:text-red-900 text-xs font-medium"
            >
              Delete
            </button>
            {!isSubtask && (
              <button
                onClick={() => handleAddSubtaskClick(task.id)}
                className="text-green-600 hover:text-green-900 ml-4 text-xs font-medium"
              >
                + Subtask
              </button>
            )}
          </td>
        </tr>
        {!isSubtask &&
          expandedTasks[task.id] &&
          task.subtasks?.map((subtask) => renderTaskRow(subtask, true))}
      </React.Fragment>
    );
  };

  if (loading.page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-700">
            Loading Admin Panel...
          </div>
          <div className="animate-spin text-4xl mt-4">⚙️</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-100 text-slate-800 min-h-screen font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-wrap justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
              Admin Task Manager
            </h1>
            <p className="text-slate-500 mt-1">
              Manage your daily tasks and projects.
            </p>
          </div>
          <div className="flex items-center gap-2 p-3 bg-white rounded-lg shadow-sm border border-slate-200">
            <div className="text-center">
              <div className="font-bold text-2xl text-slate-800">
                {getTotalStats().totalTasks}
              </div>
              <div className="text-sm text-slate-500">Total Tasks</div>
            </div>
            <div className="border-l border-slate-200 h-10 mx-3"></div>
            <div className="text-center">
              <div className="font-bold text-2xl text-emerald-600">
                {getTotalStats().completedTasks}
              </div>
              <div className="text-sm text-slate-500">Completed</div>
            </div>
          </div>
          {error && (
            <div className="w-full p-3 bg-red-100 text-red-800 border border-red-300 rounded-lg">
              {error}
            </div>
          )}
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <label
                    htmlFor="date-picker"
                    className="font-bold text-slate-700 text-lg"
                  >
                    Date:
                  </label>
                  <input
                    type="date"
                    id="date-picker"
                    value={selectedDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDeleteAllTasks}
                    disabled={loading.tasks || tasks.length === 0}
                    className={`px-5 py-2 rounded-lg font-bold text-white transition-all duration-300 shadow-md ${
                      loading.tasks || tasks.length === 0
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    🗑️ Delete All Tasks ({tasks.length})
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingTask(!isAddingTask);
                      setEditingTask(null);
                    }}
                    className={`px-5 py-2 rounded-lg font-bold text-white transition-all duration-300 shadow-md ${
                      isAddingTask
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-indigo-600 hover:bg-indigo-700"
                    }`}
                  >
                    {isAddingTask ? "Cancel" : "Add Task"}
                  </button>
                </div>
              </div>
              {isAddingTask && (
                <form onSubmit={handleSubmit} className="mt-4">
                  <div className="flex flex-wrap justify-between items-center gap-4">
                    <div className="w-full">
                      <label
                        htmlFor="task-name"
                        className="font-bold text-slate-700 text-lg"
                      >
                        Task Name:
                      </label>
                      <input
                        type="text"
                        id="task-name"
                        value={taskForm.name}
                        onChange={(e) =>
                          setTaskForm({ ...taskForm, name: e.target.value })
                        }
                        className="p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition"
                      />
                    </div>
                    <div className="w-full">
                      <label
                        htmlFor="task-status"
                        className="font-bold text-slate-700 text-lg"
                      >
                        Status:
                      </label>
                      <select
                        id="task-status"
                        value={taskForm.status}
                        onChange={(e) =>
                          handleStatusChange(e.target.value as TaskStatus)
                        }
                        className="p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition"
                      >
                        <option value="NOT_STARTED">Not Started</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </div>
                    <div className="w-full">
                      <label
                        htmlFor="task-planned-at"
                        className="font-bold text-slate-700 text-lg"
                      >
                        Planned At:
                      </label>
                      <div className="flex items-center">
                        <input
                          id="planned-at"
                          type="datetime-local"
                          value={taskForm.plannedAt}
                          onChange={(e) =>
                            setTaskForm({
                              ...taskForm,
                              plannedAt: e.target.value,
                            })
                          }
                          className="w-full p-2 border border-slate-300 rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={handleSetPlannedAtNow}
                          className="ml-2 px-3 py-2 text-sm font-semibold text-white bg-indigo-500 rounded-lg hover:bg-indigo-600"
                        >
                          Now
                        </button>
                      </div>
                    </div>
                    <div className="w-full">
                      <label
                        htmlFor="task-started-at"
                        className="font-bold text-slate-700 text-lg"
                      >
                        Started At:
                      </label>
                      <div className="flex items-center">
                        <input
                          id="started-at"
                          type="datetime-local"
                          value={taskForm.startedAt}
                          onChange={(e) =>
                            setTaskForm({
                              ...taskForm,
                              startedAt: e.target.value,
                            })
                          }
                          className="w-full p-2 border border-slate-300 rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={handleSetStartedAtNow}
                          className="ml-2 px-3 py-2 text-sm font-semibold text-white bg-green-500 rounded-lg hover:bg-green-600"
                        >
                          Now
                        </button>
                      </div>
                    </div>
                    <div className="w-full">
                      <label
                        htmlFor="task-completed-at"
                        className="font-bold text-slate-700 text-lg"
                      >
                        Completed At:
                      </label>
                      <div className="flex items-center">
                        <input
                          id="completed-at"
                          type="datetime-local"
                          value={taskForm.completedAt}
                          onChange={(e) =>
                            setTaskForm({
                              ...taskForm,
                              completedAt: e.target.value,
                            })
                          }
                          className="w-full p-2 border border-slate-300 rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={handleSetCompletedAtNow}
                          className="ml-2 px-3 py-2 text-sm font-semibold text-white bg-emerald-500 rounded-lg hover:bg-emerald-600"
                        >
                          Now
                        </button>
                      </div>
                    </div>
                    <div className="w-full">
                      <label
                        htmlFor="task-project-ref"
                        className="font-bold text-slate-700 text-lg"
                      >
                        Project:
                      </label>
                      <select
                        id="task-project-ref"
                        value={taskForm.projectRef}
                        onChange={(e) =>
                          setTaskForm({
                            ...taskForm,
                            projectRef: e.target.value,
                          })
                        }
                        className="p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition"
                      >
                        {projects.map((project) => (
                          <option key={project.id} value={project.id}>
                            {project.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="w-full">
                      <label
                        htmlFor="task-parent-task-id"
                        className="font-bold text-slate-700 text-lg"
                      >
                        Parent Task:
                      </label>
                      <select
                        id="task-parent-task-id"
                        value={taskForm.parentTaskId}
                        onChange={(e) =>
                          setTaskForm({
                            ...taskForm,
                            parentTaskId: e.target.value,
                          })
                        }
                        className="p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition"
                      >
                        <option value="">None</option>
                        {tasks.map((task) => (
                          <option key={task.id} value={task.id}>
                            {task.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="w-full">
                      <label
                        htmlFor="task-subtask-id"
                        className="font-bold text-slate-700 text-lg"
                      >
                        Subtask:
                      </label>
                      <select
                        id="task-subtask-id"
                        value={taskForm.subtaskId}
                        onChange={(e) =>
                          setTaskForm({
                            ...taskForm,
                            subtaskId: e.target.value,
                          })
                        }
                        className="p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition"
                      >
                        <option value="">None</option>
                        {taskForm.parentTaskId &&
                          tasks.map((task) => (
                            <option key={task.id} value={task.id}>
                              {task.name}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div className="w-full">
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-lg font-bold text-white transition-all duration-300 shadow-md bg-indigo-600 hover:bg-indigo-700"
                      >
                        {editingTask ? "Update Task" : "Add Task"}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h2 className="text-2xl font-bold mb-4">Task List</h2>
              <table className="w-full table-auto">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-slate-700">
                      Task
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-slate-700">
                      Project
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-slate-700">
                      Status
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-slate-700">
                      Planned At
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-slate-700">
                      Started At
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-slate-700">
                      Completed At
                    </th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-slate-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>{tasks.map((task) => renderTaskRow(task, false))}</tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
