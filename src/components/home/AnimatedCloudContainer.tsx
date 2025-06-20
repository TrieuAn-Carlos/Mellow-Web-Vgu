"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import anime from "animejs";

interface AnimatedCloudContainerProps {
  droppedClouds: string[];
}

interface CloudState {
  id: string;
  x: number;
  y: number;
  cloudType: number;
  isDragging: boolean;
  animationInstance?: anime.AnimeInstance;
}

export const AnimatedCloudContainer: React.FC<AnimatedCloudContainerProps> = ({
  droppedClouds,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [clouds, setClouds] = useState<CloudState[]>([]);
  const [draggedCloud, setDraggedCloud] = useState<string | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const cloudAnimations = useRef<Map<string, anime.AnimeInstance>>(new Map());

  const cloudSvgs = ["/cloud1.svg", "/cloud2.svg", "/cloud3.svg"];

  // Function to create floating animation
  const createFloatingAnimation = useCallback((cloudId: string) => {
    const element = document.querySelector(
      `[data-cloud-id="${cloudId}"]`
    ) as HTMLElement;
    if (!element) return null;

    const animation = anime({
      targets: element,
      translateY: [
        { value: "-=15", duration: 2000 },
        { value: "+=15", duration: 2000 },
      ],
      translateX: [
        { value: "+=8", duration: 2500 },
        { value: "-=8", duration: 2500 },
      ],
      rotate: [
        { value: "-=2", duration: 3000 },
        { value: "+=2", duration: 3000 },
      ],
      loop: true,
      easing: "easeInOutSine",
      direction: "alternate",
      autoplay: true,
    });

    cloudAnimations.current.set(cloudId, animation);
    return animation;
  }, []);

  // Function to create cloud drop animation
  const createDropAnimation = useCallback(
    (cloudId: string, finalY: number) => {
      const element = document.querySelector(
        `[data-cloud-id="${cloudId}"]`
      ) as HTMLElement;
      if (!element) return;

      anime({
        targets: element,
        translateY: finalY,
        scale: [0.5, 1.2, 1],
        rotate: "+=360",
        duration: 2000,
        easing: "easeOutBounce",
        complete: () => {
          createFloatingAnimation(cloudId);
        },
      });
    },
    [createFloatingAnimation]
  );

  // Add new clouds when tasks are completed
  useEffect(() => {
    // A set of cloud IDs that are already in the state, for quick lookups.
    const existingCloudIds = new Set(clouds.map((c) => c.id));

    droppedClouds.forEach((cloudId) => {
      // Only process new cloud IDs that are not already in our state.
      if (!existingCloudIds.has(cloudId)) {
        const containerWidth =
          containerRef.current?.clientWidth || window.innerWidth;
        const newCloud: CloudState = {
          id: cloudId,
          x: Math.random() * (containerWidth - 100),
          y: -100,
          cloudType: Math.floor(Math.random() * 3),
          isDragging: false,
        };

        // Use functional update to add the new cloud.
        // This avoids needing `clouds` in the dependency array.
        setClouds((prevClouds) => [...prevClouds, newCloud]);

        // Trigger drop animation after a short delay to allow the element to render.
        setTimeout(() => {
          const finalY = Math.random() * 200 + 150;
          createDropAnimation(cloudId, finalY);
        }, 100);
      }
    });
  }, [droppedClouds, createDropAnimation]); // Corrected dependency array

  // Handle mouse down for dragging
  const handleMouseDown = useCallback(
    (e: React.MouseEvent, cloudId: string) => {
      e.preventDefault();
      setDraggedCloud(cloudId);

      const rect = e.currentTarget.getBoundingClientRect();
      dragOffset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };

      // Stop floating animation during drag
      const animation = cloudAnimations.current.get(cloudId);
      if (animation) {
        animation.pause();
      }

      setClouds((prev) =>
        prev.map((cloud) =>
          cloud.id === cloudId ? { ...cloud, isDragging: true } : cloud
        )
      );
    },
    []
  );

  // Handle mouse move for dragging
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!draggedCloud || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newX = e.clientX - containerRect.left - dragOffset.current.x;
      const newY = e.clientY - containerRect.top - dragOffset.current.y;

      // Update cloud position
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

      // Update element position directly for smooth dragging
      const element = document.querySelector(
        `[data-cloud-id="${draggedCloud}"]`
      ) as HTMLElement;
      if (element) {
        element.style.left = `${Math.max(
          0,
          Math.min(newX, containerRect.width - 100)
        )}px`;
        element.style.top = `${Math.max(
          0,
          Math.min(newY, containerRect.height - 60)
        )}px`;
      }
    },
    [draggedCloud]
  );

  // Handle mouse up for dragging
  const handleMouseUp = useCallback(() => {
    if (draggedCloud) {
      // Resume floating animation
      createFloatingAnimation(draggedCloud);

      setClouds((prev) =>
        prev.map((cloud) =>
          cloud.id === draggedCloud ? { ...cloud, isDragging: false } : cloud
        )
      );

      setDraggedCloud(null);
    }
  }, [draggedCloud, createFloatingAnimation]);

  // Set up global mouse events for dragging
  useEffect(() => {
    if (draggedCloud) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [draggedCloud, handleMouseMove, handleMouseUp]);

  // Cleanup animations on unmount
  useEffect(() => {
    return () => {
      cloudAnimations.current.forEach((animation) => {
        animation.pause();
      });
      cloudAnimations.current.clear();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ minHeight: "600px" }}
    >
      {clouds.map((cloud) => (
        <div
          key={cloud.id}
          data-cloud-id={cloud.id}
          className={`absolute pointer-events-auto transition-transform duration-200 ${
            cloud.isDragging
              ? "cursor-grabbing scale-110 z-50"
              : "cursor-grab hover:scale-105 z-20"
          }`}
          style={{
            left: cloud.x,
            top: cloud.y,
            willChange: "transform",
          }}
          onMouseDown={(e) => handleMouseDown(e, cloud.id)}
        >
          <img
            src={cloudSvgs[cloud.cloudType]}
            alt={`Interactive Cloud ${cloud.cloudType + 1}`}
            className="w-20 h-16 drop-shadow-lg select-none"
            draggable={false}
          />
        </div>
      ))}
    </div>
  );
};
