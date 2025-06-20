"use client";

import React, { useEffect, useRef, useState } from "react";
import anime from "animejs";

interface CloudContainerProps {
  droppedClouds: string[];
}

interface CloudPosition {
  id: string;
  x: number;
  y: number;
  cloudType: number;
  isDragging: boolean;
}

export const CloudContainer: React.FC<CloudContainerProps> = ({
  droppedClouds,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [clouds, setClouds] = useState<CloudPosition[]>([]);
  const [draggedCloud, setDraggedCloud] = useState<string | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Cloud SVG paths
  const cloudSvgs = ["/cloud1.svg", "/cloud2.svg", "/cloud3.svg"];

  useEffect(() => {
    // Add new clouds when tasks are completed
    droppedClouds.forEach((cloudId) => {
      if (!clouds.find((cloud) => cloud.id === cloudId)) {
        const newCloud: CloudPosition = {
          id: cloudId,
          x: Math.random() * (window.innerWidth - 200),
          y: -100, // Start above screen
          cloudType: Math.floor(Math.random() * 3),
          isDragging: false,
        };

        setClouds((prev) => [...prev, newCloud]);

        // Animate cloud dropping down
        setTimeout(() => {
          anime({
            targets: `[data-cloud-id="${cloudId}"]`,
            translateY: Math.random() * 300 + 200,
            duration: 2000,
            easing: "easeOutBounce",
            complete: () => {
              // Start floating animation after drop
              startFloatingAnimation(cloudId);
            },
          });
        }, 100);
      }
    });
  }, [droppedClouds, clouds]);

  const startFloatingAnimation = (cloudId: string) => {
    anime({
      targets: `[data-cloud-id="${cloudId}"]`,
      translateY: [
        { value: "-=20", duration: 2000 },
        { value: "+=20", duration: 2000 },
      ],
      translateX: [
        { value: "+=10", duration: 3000 },
        { value: "-=10", duration: 3000 },
      ],
      loop: true,
      easing: "easeInOutSine",
      direction: "alternate",
    });
  };

  const handleMouseDown = (e: React.MouseEvent, cloudId: string) => {
    e.preventDefault();
    setDraggedCloud(cloudId);

    const rect = e.currentTarget.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    // Stop floating animation during drag
    anime.remove(`[data-cloud-id="${cloudId}"]`);

    // Update cloud dragging state
    setClouds((prev) =>
      prev.map((cloud) =>
        cloud.id === cloudId ? { ...cloud, isDragging: true } : cloud
      )
    );
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedCloud) return;

    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    const newX = e.clientX - containerRect.left - dragOffset.current.x;
    const newY = e.clientY - containerRect.top - dragOffset.current.y;

    setClouds((prev) =>
      prev.map((cloud) =>
        cloud.id === draggedCloud
          ? {
              ...cloud,
              x: Math.max(0, Math.min(newX, containerRect.width - 100)),
              y: Math.max(0, Math.min(newY, containerRect.height - 60)),
            }
          : cloud
      )
    );
  };

  const handleMouseUp = () => {
    if (draggedCloud) {
      // Resume floating animation
      startFloatingAnimation(draggedCloud);

      setClouds((prev) =>
        prev.map((cloud) =>
          cloud.id === draggedCloud ? { ...cloud, isDragging: false } : cloud
        )
      );

      setDraggedCloud(null);
    }
  };

  useEffect(() => {
    if (draggedCloud) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        const containerRect = containerRef.current?.getBoundingClientRect();
        if (!containerRect) return;

        const newX = e.clientX - containerRect.left - dragOffset.current.x;
        const newY = e.clientY - containerRect.top - dragOffset.current.y;

        setClouds((prev) =>
          prev.map((cloud) =>
            cloud.id === draggedCloud
              ? {
                  ...cloud,
                  x: Math.max(0, Math.min(newX, containerRect.width - 100)),
                  y: Math.max(0, Math.min(newY, containerRect.height - 60)),
                }
              : cloud
          )
        );
      };

      const handleGlobalMouseUp = () => {
        if (draggedCloud) {
          startFloatingAnimation(draggedCloud);
          setClouds((prev) =>
            prev.map((cloud) =>
              cloud.id === draggedCloud
                ? { ...cloud, isDragging: false }
                : cloud
            )
          );
          setDraggedCloud(null);
        }
      };

      document.addEventListener("mousemove", handleGlobalMouseMove);
      document.addEventListener("mouseup", handleGlobalMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleGlobalMouseMove);
        document.removeEventListener("mouseup", handleGlobalMouseUp);
      };
    }
  }, [draggedCloud]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ minHeight: "600px" }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {clouds.map((cloud) => (
        <div
          key={cloud.id}
          data-cloud-id={cloud.id}
          className={`absolute pointer-events-auto cursor-grab transition-transform ${
            cloud.isDragging ? "cursor-grabbing scale-110" : "hover:scale-105"
          }`}
          style={{
            left: cloud.x,
            top: cloud.y,
            transform: "translate(0, 0)", // AnimeJS will handle transforms
          }}
          onMouseDown={(e) => handleMouseDown(e, cloud.id)}
        >
          <img
            src={cloudSvgs[cloud.cloudType]}
            alt={`Draggable Cloud ${cloud.cloudType + 1}`}
            className="w-20 h-16 drop-shadow-lg"
            draggable={false}
          />
        </div>
      ))}
    </div>
  );
};
