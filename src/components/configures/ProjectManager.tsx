"use client";

import React, { useState } from "react";
import type { Project, CreateProject } from "../../types/schema";
import {
  createProject,
  updateProject,
  deleteProject,
} from "../../lib/firebase-operations";
import { Timestamp } from "firebase/firestore";

interface ProjectManagerProps {
  projects: Project[];
  onProjectsUpdate: (projects: Project[]) => void;
}

const PREDEFINED_COLORS = [
  "#3B82F6", // Blue
  "#EF4444", // Red
  "#10B981", // Green
  "#F59E0B", // Amber
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#84CC16", // Lime
  "#F97316", // Orange
  "#6366F1", // Indigo
];

export const ProjectManager: React.FC<ProjectManagerProps> = ({
  projects,
  onProjectsUpdate,
}) => {
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [newProjectColor, setNewProjectColor] = useState(PREDEFINED_COLORS[0]);
  const [loading, setLoading] = useState(false);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [editingData, setEditingData] = useState({
    name: "",
    description: "",
    color: "",
  });

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;

    setLoading(true);
    try {
      const projectData: CreateProject = {
        name: newProjectName.trim(),
        description: newProjectDescription.trim(),
        color: newProjectColor,
      };

      const projectId = await createProject(projectData);

      const newProject: Project = {
        ...projectData,
        id: projectId,
        createdAt: Timestamp.now(),
      };

      onProjectsUpdate([newProject, ...projects]);
      setNewProjectName("");
      setNewProjectDescription("");
      setNewProjectColor(PREDEFINED_COLORS[0]);
    } catch (error) {
      console.error("Error creating project:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProject = async (projectId: string) => {
    if (!editingData.name.trim()) return;

    setLoading(true);
    try {
      const updates = {
        name: editingData.name.trim(),
        description: editingData.description.trim(),
        color: editingData.color,
      };

      await updateProject(projectId, updates);

      const updatedProjects = projects.map((project) =>
        project.id === projectId ? { ...project, ...updates } : project
      );
      onProjectsUpdate(updatedProjects);
      setEditingProject(null);
      setEditingData({ name: "", description: "", color: "" });
    } catch (error) {
      console.error("Error updating project:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this project? This action cannot be undone."
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      await deleteProject(projectId);
      onProjectsUpdate(projects.filter((project) => project.id !== projectId));
    } catch (error) {
      console.error("Error deleting project:", error);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (project: Project) => {
    setEditingProject(project.id);
    setEditingData({
      name: project.name,
      description: project.description,
      color: project.color,
    });
  };

  const cancelEditing = () => {
    setEditingProject(null);
    setEditingData({ name: "", description: "", color: "" });
  };

  return (
    <div className="space-y-8">
      {/* Add New Project */}
      <div className="bg-gray-800/90 backdrop-blur-md rounded-xl p-8 shadow-xl border border-gray-700/30 hover:shadow-2xl transition-all duration-500">
        <h2 className="text-xl font-semibold text-white mb-6">
          Add New Project
        </h2>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Project name..."
              className="flex-1 px-5 py-4 bg-gray-700/80 backdrop-blur-sm text-white rounded-xl border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:bg-gray-600/90 transition-all duration-300 placeholder-gray-400"
            />
            <div className="flex items-center gap-3">
              <span className="text-gray-300 text-sm font-medium">Color:</span>
              <div className="flex gap-2">
                {PREDEFINED_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewProjectColor(color)}
                    className={`w-12 h-12 rounded-xl border-2 transition-all duration-300 ${
                      newProjectColor === color
                        ? "border-white scale-110 shadow-xl"
                        : "border-gray-500/60 hover:border-gray-300/80 hover:scale-105"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
          <textarea
            value={newProjectDescription}
            onChange={(e) => setNewProjectDescription(e.target.value)}
            placeholder="Project description (optional)..."
            rows={3}
            className="w-full px-5 py-4 bg-gray-700/80 backdrop-blur-sm text-white rounded-xl border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:bg-gray-600/90 resize-none transition-all duration-300 placeholder-gray-400"
          />
          <button
            onClick={handleCreateProject}
            disabled={loading || !newProjectName.trim()}
            className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 font-medium hover:shadow-xl disabled:hover:shadow-none"
          >
            {loading ? "Creating..." : "Create Project"}
          </button>
        </div>
      </div>

      {/* Projects List */}
      <div className="bg-gray-800/90 backdrop-blur-md rounded-xl p-8 shadow-xl border border-gray-700/30 hover:shadow-2xl transition-all duration-500">
        <h2 className="text-xl font-semibold text-white mb-6">
          Projects ({projects.length})
        </h2>
        {projects.length === 0 ? (
          <p className="text-gray-400 text-center py-12">
            No projects created yet
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-gray-700/60 backdrop-blur-sm rounded-xl p-6 border border-gray-600/40 hover:border-gray-500/60 hover:bg-gray-600/80 transition-all duration-300 hover:shadow-xl"
              >
                {editingProject === project.id ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={editingData.name}
                      onChange={(e) =>
                        setEditingData({ ...editingData, name: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-600/90 backdrop-blur-sm text-white rounded-xl border border-gray-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500 hover:bg-gray-600 transition-all duration-200"
                    />
                    <textarea
                      value={editingData.description}
                      onChange={(e) =>
                        setEditingData({
                          ...editingData,
                          description: e.target.value,
                        })
                      }
                      rows={2}
                      className="w-full px-4 py-3 bg-gray-600/90 backdrop-blur-sm text-white rounded-xl border border-gray-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none hover:bg-gray-600 transition-all duration-200 placeholder-gray-400"
                    />
                    <div className="flex flex-wrap gap-2">
                      {PREDEFINED_COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={() =>
                            setEditingData({ ...editingData, color })
                          }
                          className={`w-10 h-10 rounded-xl border-2 transition-all duration-300 ${
                            editingData.color === color
                              ? "border-white scale-110 shadow-xl"
                              : "border-gray-500/60 hover:border-gray-300/80 hover:scale-105"
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleUpdateProject(project.id)}
                        className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 text-sm font-medium"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-200 text-sm font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span
                          className="w-6 h-6 rounded-xl flex-shrink-0 shadow-lg"
                          style={{ backgroundColor: project.color }}
                        ></span>
                        <h3 className="font-medium text-white leading-tight">
                          {project.name}
                        </h3>
                      </div>
                    </div>

                    {project.description && (
                      <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                        {project.description}
                      </p>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={() => startEditing(project)}
                        className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 text-sm font-medium flex items-center justify-center gap-2"
                        title="Delete project"
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
                        Delete
                      </button>
                    </div>
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
