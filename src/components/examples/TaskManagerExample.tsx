// filepath: src/components/examples/TaskManagerExample.tsx
'use client';

import React, { useState } from 'react';
import { 
  useTasks, 
  useProjects, 
  useTaskStats,
  createTask,
  createProject,
  updateTaskStatus,
  startTask,
  completeTask,
  createDaily
} from '../../lib/firebase-schema';

import type { TaskStatus } from '../../types/schema';

/**
 * Example component demonstrating Firebase schema usage
 * This shows how to integrate the Firebase utilities with React components
 */
export const TaskManagerExample: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [newTaskName, setNewTaskName] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');

  // Use custom hooks for real-time data
  const { tasks, loading: tasksLoading, error: tasksError } = useTasks(selectedDate);
  const { projects, loading: projectsLoading, error: projectsError } = useProjects();
  const { stats, loading: statsLoading } = useTaskStats(selectedDate);

  // Handler functions
  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    
    try {
      await createProject({
        name: newProjectName,
        color: '#' + Math.floor(Math.random()*16777215).toString(16), // Random color
        description: `Project: ${newProjectName}`
      });
      setNewProjectName('');
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const handleCreateTask = async () => {
    if (!newTaskName.trim() || !selectedProjectId) return;
    
    try {
      // Ensure daily exists
      await createDaily(selectedDate);
      
      await createTask(selectedDate, {
        name: newTaskName,
        status: 'NOT_STARTED',
        plannedAt: null,
        projectRef: `Projects/${selectedProjectId}`
      });
      setNewTaskName('');
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleTaskStatusChange = async (taskId: string, status: TaskStatus) => {
    try {
      if (status === 'IN_PROGRESS') {
        await startTask(selectedDate, taskId);
      } else if (status === 'COMPLETED') {
        await completeTask(selectedDate, taskId);
      } else {
        await updateTaskStatus(selectedDate, taskId, status);
      }
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'NOT_STARTED': return 'bg-gray-100 text-gray-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (tasksLoading || projectsLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading task manager...</div>
      </div>
    );
  }

  if (tasksError || projectsError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-red-800 font-semibold">Error</h3>
        <p className="text-red-600">{tasksError || projectsError}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Task Manager Example</h1>
        
        {/* Date Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Date
          </label>
          <input
            type="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="border border-gray-300 rounded-md px-3 py-2"
          />
        </div>

        {/* Task Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-800">{stats.inProgress}</div>
            <div className="text-sm text-blue-600">In Progress</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-800">{stats.completed}</div>
            <div className="text-sm text-green-600">Completed</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-gray-800">{stats.notStarted}</div>
            <div className="text-sm text-gray-600">Not Started</div>
          </div>
        </div>

        {/* Create Project */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-3">Create New Project</h3>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Project name"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2"
            />
            <button
              onClick={handleCreateProject}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Create Project
            </button>
          </div>
        </div>

        {/* Create Task */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-3">Create New Task</h3>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Task name"
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2"
            />
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">Select Project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleCreateTask}
              disabled={!newTaskName.trim() || !selectedProjectId}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              Create Task
            </button>
          </div>
        </div>

        {/* Projects List */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Projects</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {projects.map((project) => (
              <div key={project.id} className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: project.color }}
                  />
                  <h4 className="font-semibold">{project.name}</h4>
                </div>
                <p className="text-sm text-gray-600">{project.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks List */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Tasks for {selectedDate.toDateString()}</h3>
          {tasks.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No tasks for this date</p>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">{task.name}</h4>
                      <p className="text-sm text-gray-600">
                        Project: {task.projectRef.split('/')[1]}
                      </p>
                      {task.plannedAt && (
                        <p className="text-sm text-gray-500">
                          Planned: {task.plannedAt.toLocaleTimeString()}
                        </p>
                      )}
                      {task.startedAt && (
                        <p className="text-sm text-gray-500">
                          Started: {task.startedAt.toLocaleTimeString()}
                        </p>
                      )}
                      {task.completedAt && (
                        <p className="text-sm text-gray-500">
                          Completed: {task.completedAt.toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                      <select
                        value={task.status}
                        onChange={(e) => handleTaskStatusChange(task.id, e.target.value as TaskStatus)}
                        className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                      >
                        <option value="NOT_STARTED">Not Started</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
