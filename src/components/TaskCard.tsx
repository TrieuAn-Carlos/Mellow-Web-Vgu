"use client";

import React from "react";
import Image from "next/image";
import { TaskClient, ProjectClient } from "@/types/schema";

interface TaskCardProps {
  task: TaskClient & { id: string };
  project?: ProjectClient & { id: string };
  style?: React.CSSProperties;
  className?: string;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  project,
  style = {},
  className = "",
}) => {
  const getStatusIcon = () => {
    switch (task.status) {
      case "COMPLETED":
        return "✓";
      case "IN_PROGRESS":
        return "⏱";
      case "NOT_STARTED":
        return "○";
      case "CANCELLED":
        return "✗";
      default:
        return "○";
    }
  };

  const getStatusColor = () => {
    switch (task.status) {
      case "COMPLETED":
        return "#22c55e";
      case "IN_PROGRESS":
        return "#f59e0b";
      case "NOT_STARTED":
        return "#6b7280";
      case "CANCELLED":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const formatDuration = () => {
    if (task.startedAt && task.completedAt) {
      const duration = task.completedAt.getTime() - task.startedAt.getTime();
      const minutes = Math.floor(duration / (1000 * 60));
      if (minutes < 60) {
        return `${minutes}m`;
      } else {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours}h ${remainingMinutes}m`;
      }
    }
    return "5m"; // Default duration for display
  };

  const getProjectName = () => {
    return project?.name || "General";
  };

  return (
    <div
      className={`task-card ${className}`}
      style={{
        ...style,
        position: "absolute",
        width: "290px",
        height: "170px",
        background: "linear-gradient(135deg, #FFF7B5 0%, #FFEC75 100%)",
        borderRadius: "16px",
        border: "1px solid rgba(0, 0, 0, 0.04)",
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.08)",
        padding: "20px",
        cursor: "grab",
        fontFamily:
          "'SF Pro Rounded', -apple-system, BlinkMacSystemFont, sans-serif",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        color: "#333",
        willChange: "transform, opacity",
      }}
    >
      {/* Header section with title and status */}
      <div className="flex items-start justify-between">
        <h3
          className="text-xl font-bold leading-tight text-gray-800"
          style={{
            fontWeight: 700,
            lineHeight: "1.3",
            maxWidth: "85%",
          }}
        >
          {task.name}
        </h3>

        {/* Status indicator - refined half-moon design */}
        <div
          className="flex-shrink-0"
          style={{
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            border: "2px solid #666",
            backgroundColor:
              task.status === "COMPLETED" ? "#666" : "transparent",
            opacity: 0.7,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {task.status === "IN_PROGRESS" && (
            <div
              style={{
                position: "absolute",
                top: "0",
                left: "0",
                width: "50%",
                height: "100%",
                backgroundColor: "#666",
              }}
            />
          )}
          {task.status === "COMPLETED" && (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                color: "white",
                fontSize: "10px",
                fontWeight: "bold",
              }}
            >
              ✓
            </div>
          )}
        </div>
      </div>

      {/* Bottom section with duration and project */}
      <div className="flex items-center justify-start gap-4">
        {/* Duration with clock icon */}
        <div className="flex items-center gap-2">
          <Image
            src="/clock.svg"
            alt="Duration"
            width={12}
            height={12}
            style={{ opacity: 0.7 }}
          />
          <span
            className="text-sm font-medium text-gray-600"
            style={{ fontSize: "14px", fontWeight: 500 }}
          >
            {formatDuration()}
          </span>
        </div>

        {/* Project with file icon */}
        <div className="flex items-center gap-2">
          <Image
            src="/file02.svg"
            alt="Project"
            width={13}
            height={10}
            style={{ opacity: 0.7 }}
          />
          <span
            className="text-sm font-medium text-gray-600"
            style={{ fontSize: "14px", fontWeight: 500 }}
          >
            {getProjectName()}
          </span>
        </div>
      </div>
    </div>
  );
};
