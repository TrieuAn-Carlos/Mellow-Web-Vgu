"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { TaskCard } from "./TaskCard";
import { AnimeScattered } from "./animations/AnimeScattered";
import { TaskClient, ProjectClient } from "@/types/schema";
import anime from "animejs";

interface ScatteredCardsLayoutProps {
  tasks: (TaskClient & { id: string })[];
  projects: (ProjectClient & { id: string })[];
  onTaskActiveChange?: (taskId: string, isActive: boolean) => void;
}

interface CardLayout {
  x: number;
  y: number;
  rotation: number;
}

interface DragState {
  isDragging: boolean;
  draggedTask: (TaskClient & { id: string }) | null;
  startPosition: { x: number; y: number };
  currentPosition: { x: number; y: number };
  isInDropZone: boolean;
}

// The base dimensions of the canvas where the fixed layout is defined.
const BASE_WIDTH = 1600;
const BASE_HEIGHT = 1200;

// A precise, fixed layout based on the Figma image, positioned within the base canvas.
const fixedLayout: CardLayout[] = [
  { x: 657, y: 242, rotation: -4 }, // Top Center
  { x: 362, y: 322, rotation: 3 }, // Top Left
  { x: 941, y: 334, rotation: 7 }, // Top Right
  { x: 343, y: 508, rotation: 3 }, // Mid Left
  { x: 662, y: 448, rotation: 2 }, // Center Card
  { x: 976, y: 542, rotation: -6 }, // Mid Right
  { x: 362, y: 709, rotation: 5 }, // Bottom Left
  { x: 676, y: 655, rotation: -5 }, // Bottom Center (behind)
  { x: 1008, y: 735, rotation: 12 }, // Bottom Right
  { x: 668, y: 842, rotation: -8 }, // Very Bottom Center
];

const CARD_WIDTH = 290;
const CARD_HEIGHT = 170;
const DROP_ZONE_THRESHOLD = 0.3; // 30% from the right

export const ScatteredCardsLayout: React.FC<ScatteredCardsLayoutProps> = ({
  tasks,
  projects,
  onTaskActiveChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedTask: null,
    startPosition: { x: 0, y: 0 },
    currentPosition: { x: 0, y: 0 },
    isInDropZone: false,
  });

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect;
        setContainerSize({ width, height });
      }
    });
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  const scale = containerSize.width > 0 ? containerSize.width / BASE_WIDTH : 0;
  const scaledContentHeight = BASE_HEIGHT * scale;
  const topOffset = (containerSize.height - scaledContentHeight) / 2;

  // Memoize task calculations to optimize re-renders
  const taskStates = useMemo(() => {
    const sortedTasks = [...tasks].sort((a, b) => a.order - b.order);
    const hasActiveTask = sortedTasks.some((task) => task.isActive);
    const activeTask = sortedTasks.find((task) => task.isActive);
    const inactiveTasks = sortedTasks.filter((task) => !task.isActive);

    return {
      sortedTasks,
      hasActiveTask,
      activeTask,
      inactiveTasks,
    };
  }, [tasks]);

  const { sortedTasks, hasActiveTask, activeTask, inactiveTasks } = taskStates;

  const getProjectForTask = (task: TaskClient & { id: string }) => {
    return projects.find((project) => project.id === task.projectRef);
  };

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, task: TaskClient & { id: string }) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setDragState({
        isDragging: true,
        draggedTask: task,
        startPosition: { x, y },
        currentPosition: { x, y },
        isInDropZone: false,
      });

      // Animation handled by layout changes
    },
    []
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragState.isDragging || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Check if in drop zone - lower area only
      let isInDropZone = false;
      if (hasActiveTask) {
        // Right 35% AND bottom 60% area
        isInDropZone = x > rect.width * 0.65 && y > rect.height * 0.4;
      } else {
        // Right 30% AND bottom 60% area
        isInDropZone = x > rect.width * 0.7 && y > rect.height * 0.4;
      }

      setDragState((prev) => ({
        ...prev,
        currentPosition: { x, y },
        isInDropZone,
      }));
    },
    [dragState.isDragging, hasActiveTask]
  );

  const handleMouseUp = useCallback(() => {
    if (!dragState.isDragging || !dragState.draggedTask) return;

    // If dropped in the zone, set task as active
    if (dragState.isInDropZone && onTaskActiveChange) {
      onTaskActiveChange(dragState.draggedTask.id, true);
    }

    // Layout changes handle positioning

    setDragState({
      isDragging: false,
      draggedTask: null,
      startPosition: { x: 0, y: 0 },
      currentPosition: { x: 0, y: 0 },
      isInDropZone: false,
    });
  }, [
    dragState.isDragging,
    dragState.draggedTask,
    dragState.isInDropZone,
    onTaskActiveChange,
  ]);

  // Set up global mouse events
  useEffect(() => {
    if (dragState.isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [dragState.isDragging, handleMouseMove, handleMouseUp]);

  // Effect to log layout changes
  useEffect(() => {
    console.log("🎯 Layout State Change:", {
      hasActiveTask,
      activeTaskName: activeTask?.name,
      layoutType: hasActiveTask ? "SPLIT" : "SCATTERED",
      totalTasks: sortedTasks.length,
      inactiveTasks: inactiveTasks.length,
    });
  }, [
    hasActiveTask,
    activeTask?.name,
    sortedTasks.length,
    inactiveTasks.length,
  ]);

  // Debug logging
  console.log("🔄 Component re-render:", {
    totalTasks: sortedTasks.length,
    hasActiveTask,
    activeTaskName: activeTask?.name,
    inactiveTasks: inactiveTasks.length,
    containerSize,
    scale,
  });

  if (!tasks || tasks.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-gray-500">No tasks to display.</p>
      </div>
    );
  }

  // When no active task, render full scattered layout
  if (!hasActiveTask) {
    return (
      <div
        key="scattered-layout"
        ref={containerRef}
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          background: "#fefbfc",
        }}
      >
        {/* Invisible Drop Zone - only show when dragging and in zone */}
        {dragState.isDragging && dragState.isInDropZone && (
          <div
            style={{
              position: "absolute",
              top: "40%", // Lower zone - start at 40% from top
              right: 0,
              width: "30%",
              height: "60%",
              backgroundColor: "rgba(59, 130, 246, 0.15)",
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.3s ease",
              borderRadius: "12px 0 0 12px",
            }}
          >
            <div
              style={{
                color: "#1e40af",
                fontSize: "24px",
                fontWeight: "bold",
                textAlign: "center",
                textShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              Drop to
              <br />
              Start Timer
            </div>
          </div>
        )}

        {containerSize.width > 0 && (
          <div
            ref={cardsContainerRef}
            style={{
              position: "absolute",
              top: `${topOffset}px`,
              left: "0px",
              width: `${BASE_WIDTH}px`,
              height: `${BASE_HEIGHT}px`,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              willChange: "transform",
              overflow: "hidden",
            }}
          >
            <AnimeScattered delay={0} duration={400} scale={scale}>
              {sortedTasks.slice(0, 10).map((task, index) => {
                const pos = fixedLayout[index];
                if (!pos) return null;

                const isDraggedCard = dragState.draggedTask?.id === task.id;

                return (
                  <div
                    key={`scattered-${task.id}`}
                    data-task-id={task.id}
                    onMouseDown={(e) => handleMouseDown(e, task)}
                    style={{
                      position: "absolute",
                      left: `${pos.x}px`,
                      top: `${pos.y}px`,
                      transform: isDraggedCard
                        ? `rotate(${pos.rotation}deg) translate(${
                            dragState.currentPosition.x -
                            dragState.startPosition.x
                          }px, ${
                            dragState.currentPosition.y -
                            dragState.startPosition.y
                          }px) scale(1.05)`
                        : `rotate(${pos.rotation}deg) scale(1)`,
                      transition: isDraggedCard
                        ? "none"
                        : "transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                      zIndex: isDraggedCard ? 1001 : 1,
                      cursor: isDraggedCard ? "grabbing" : "grab",
                      willChange: "transform",
                    }}
                  >
                    <TaskCard
                      task={task}
                      project={getProjectForTask(task)}
                      style={{
                        position: "relative",
                        border: "1px solid rgba(0, 0, 0, 0.04)",
                        boxShadow: isDraggedCard
                          ? "0 20px 40px rgba(0,0,0,0.2)"
                          : "0 8px 25px rgba(0,0,0,0.12)",
                        transition:
                          "all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                        pointerEvents: isDraggedCard ? "none" : "auto",
                        opacity: 1,
                      }}
                    />
                  </div>
                );
              })}
            </AnimeScattered>
          </div>
        )}
      </div>
    );
  }

  // When has active task, render left/right layout
  return (
    <div
      key="split-layout"
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: "#fefbfc", // Màu hồng nhạt trắng hơn
        display: "flex",
      }}
    >
      {/* Left Section - Inactive Tasks */}
      <div
        style={{
          flex: "0 0 65%",
          height: "100%",
          position: "relative",
          transition: "all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        }}
      >
        {/* Invisible Drop Zone - only show confirm when dragging and in zone */}
        {dragState.isDragging && !hasActiveTask && dragState.isInDropZone && (
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "30%",
              height: "100%",
              backgroundColor: "rgba(59, 130, 246, 0.15)",
              // borderLeft: removed - no dashed border
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
            }}
          >
            <div
              style={{
                color: "#1e40af",
                fontSize: "24px",
                fontWeight: "bold",
                textAlign: "center",
                textShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              Drop to
              <br />
              Start Timer
            </div>
          </div>
        )}

        {containerSize.width > 0 && (
          <div
            ref={cardsContainerRef}
            style={{
              position: "absolute",
              top: `${topOffset}px`,
              left: "0px",
              width: `${BASE_WIDTH}px`,
              height: `${BASE_HEIGHT}px`,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              willChange: "transform",
              overflow: "hidden", // Prevent cards from going outside bounds
            }}
          >
            <AnimeScattered delay={0} duration={400} scale={scale}>
              {(hasActiveTask ? inactiveTasks : sortedTasks)
                .slice(0, 10)
                .map((task, index) => {
                  const pos = fixedLayout[index];
                  if (!pos) return null;

                  const isDraggedCard = dragState.draggedTask?.id === task.id;

                  // When there's an active task, compress cards to left side and make smaller
                  const leftCompression = hasActiveTask ? 0.6 : 1; // Compress to 60% of width
                  const cardScale = hasActiveTask ? 0.8 : 1; // Make cards 80% size when inactive

                  const adjustedX = pos.x * leftCompression;
                  const adjustedY = pos.y;

                  return (
                    <div
                      key={`split-${task.id}`}
                      data-task-id={task.id}
                      onMouseDown={(e) => handleMouseDown(e, task)}
                      style={{
                        position: "absolute",
                        left: `${adjustedX}px`,
                        top: `${adjustedY}px`,
                        transform: isDraggedCard
                          ? `rotate(${pos.rotation}deg) translate(${
                              dragState.currentPosition.x -
                              dragState.startPosition.x
                            }px, ${
                              dragState.currentPosition.y -
                              dragState.startPosition.y
                            }px) scale(1.05)`
                          : `rotate(${pos.rotation}deg) scale(${cardScale})`,
                        transition: isDraggedCard
                          ? "none"
                          : "transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                        zIndex: isDraggedCard ? 1001 : 1,
                        cursor: isDraggedCard ? "grabbing" : "grab",
                        willChange: "transform",
                      }}
                    >
                      <TaskCard
                        task={task}
                        project={getProjectForTask(task)}
                        style={{
                          position: "relative",
                          border: "1px solid rgba(0, 0, 0, 0.04)",
                          boxShadow: isDraggedCard
                            ? "0 20px 40px rgba(0,0,0,0.2)"
                            : hasActiveTask
                            ? "0 4px 12px rgba(0,0,0,0.1)"
                            : undefined,
                          transition:
                            "all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                          pointerEvents: isDraggedCard ? "none" : "auto",
                          opacity: hasActiveTask ? 0.85 : 1,
                        }}
                      />
                    </div>
                  );
                })}
            </AnimeScattered>
          </div>
        )}
      </div>

      {/* Right Section - Active Task */}
      {hasActiveTask && (
        <div
          style={{
            flex: "0 0 35%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            // borderLeft: removed - no dashed border
            backgroundColor:
              dragState.isDragging && dragState.isInDropZone
                ? "rgba(59, 130, 246, 0.15)"
                : "#fefbfc", // Same as main background
            transition: "background-color 0.2s ease",
          }}
        >
          {/* Drop overlay when dragging over active area */}
          {dragState.isDragging && dragState.isInDropZone && (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                color: "#1e40af",
                fontSize: "18px",
                fontWeight: "bold",
                textAlign: "center",
                textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                zIndex: 1001,
              }}
            >
              Replace Active
              <br />
              Task
            </div>
          )}
          <div
            className="active-task-container"
            style={{
              position: "relative",
              transform: "rotate(-2deg)",
              animation: "activeTaskPulse 2s ease-in-out infinite",
            }}
          >
            <TaskCard
              task={activeTask!}
              project={getProjectForTask(activeTask!)}
              style={{
                position: "relative",
                border: "3px solid #22c55e",
                boxShadow: "0 15px 35px rgba(34, 197, 94, 0.3)",
                opacity: 1,
                transform: "scale(1.1)", // Make active task 10% larger
              }}
            />
          </div>
        </div>
      )}

      {/* CSS for active task animation */}
      <style jsx>{`
        @keyframes activeTaskPulse {
          0%,
          100% {
            transform: rotate(-2deg) scale(1);
          }
          50% {
            transform: rotate(-2deg) scale(1.02);
          }
        }
      `}</style>
    </div>
  );
};
