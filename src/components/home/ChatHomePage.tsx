"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import anime from "animejs/lib/anime.es.js";
import type { Cloud, Task } from "../../types/schema";
import { useMeetingNotifications } from "../../hooks/useMeetingNotifications";
import { getTasksForDate } from "../../lib/firebase-collections";
import { HoverTaskChatBubble } from "./HoverTaskChatBubble";
import { HomeContextMenu } from "./HomeContextMenu";
import { AutoStartOverlay } from "./AutoStartOverlay";
import {
  saveHomeAccessTime,
  setupAutoStartMonitoring,
  AutoStartResult,
  AutoStartCallback,
} from "../../lib/auto-start-service";

// SVG component for the cloud, to allow animating its parts
const MellowPinkCloud = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="118"
    height="98"
    viewBox="0 0 118 98"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M48.5901 33.2729C57.0271 43.4606 55.6079 58.559 45.4202 66.9961C35.2325 75.4331 20.1341 74.0139 11.697 63.8262C3.25996 53.6385 4.67916 38.5401 14.8669 30.103C25.0546 21.6659 40.153 23.0851 48.5901 33.2729Z"
      fill="#EBC8E0"
    />
    <path
      d="M75.824 49.687C84.2611 59.8747 82.8419 74.9731 72.6542 83.4101C62.4664 91.8472 47.3681 90.428 38.931 80.2403C30.4939 70.0525 31.9131 54.9542 42.1009 46.5171C52.2886 38.08 67.387 39.4992 75.824 49.687Z"
      fill="#EBC8E0"
    />
    <path
      d="M78.1662 17.6374C86.6032 27.8251 85.184 42.9235 74.9963 51.3605C64.8086 59.7976 49.7102 58.3784 41.2731 48.1907C32.8361 38.0029 34.2553 22.9046 44.443 14.4675C54.6307 6.03043 69.7291 7.44962 78.1662 17.6374Z"
      fill="#EBC8E0"
    />
    <path
      d="M105.427 39.1196C113.864 49.3074 112.445 64.4058 102.258 72.8428C92.0698 81.2799 76.9714 79.8607 68.5343 69.673C60.0973 59.4852 61.5165 44.3868 71.7042 35.9498C81.8919 27.5127 96.9903 28.9319 105.427 39.1196Z"
      fill="#EBC8E0"
    />
    {/* Eyes with IDs for animation */}
    <path
      id="cloud-eye-left"
      d="M51.4907 33.1399L48.8837 49.0193"
      stroke="white"
      strokeWidth="7"
      strokeLinecap="round"
    />
    <path
      id="cloud-eye-right"
      d="M70.3069 36.229L67.6999 52.1084"
      stroke="white"
      strokeWidth="7"
      strokeLinecap="round"
    />
  </svg>
);

export const ChatHomePage: React.FC = () => {
  // Router để navigate sang trang timer
  const router = useRouter();

  // --- INTEGRATION START ---
  // Memoize `today` so it doesn't trigger the hook on every render
  const today = useMemo(() => {
    const d = new Date();
    console.log(
      "✅ [ChatHomePage] Creating new Date object for the hook:",
      d.toISOString()
    );
    return d;
  }, []);

  // 1. Get real-time completed task IDs and meeting notifications from our enhanced hook.
  const {
    newlyCompletedTaskIds,
    scheduledMeetings,
    notificationPermissionGranted,
    requestNotificationPermission,
  } = useMeetingNotifications(today);

  console.log("🏠 [ChatHomePage] Hook returned:", {
    newlyCompletedTaskIds,
    scheduledMeetingsCount: scheduledMeetings.length,
    notificationPermissionGranted,
  });
  // --- INTEGRATION END ---

  const [completedTasks, setCompletedTasks] = useState<number>(0);
  const [clouds, setClouds] = useState<Cloud[]>([]);
  const animationRefs = useRef<{ [key: string]: anime.AnimeInstance }>({});
  const animationFrameIdRef = useRef<number | null>(null);
  const lastCompletedCountRef = useRef<number>(0);
  const [draggedCloud, setDraggedCloud] = useState<{
    id: string;
    startX: number;
    startY: number;
    initialTx: number;
    initialTy: number;
  } | null>(null);

  // Long press state
  const [isLongPressing, setIsLongPressing] = useState(false);
  const [longPressProgress, setLongPressProgress] = useState(0);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const longPressStartRef = useRef<number | null>(null);
  const longPressAnimationRef = useRef<anime.AnimeInstance | null>(null);

  // Dynamic message state
  const [currentMessage, setCurrentMessage] = useState<string>(
    "Please complete task to collect mellow ☁️"
  );
  const [tasks, setTasks] = useState<Task[]>([]);
  const messageTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-start state
  const [showAutoStartOverlay, setShowAutoStartOverlay] = useState(false);
  const [autoStartTaskName, setAutoStartTaskName] = useState<
    string | undefined
  >();
  const autoStartUnsubscribeRef = useRef<(() => void) | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const positioningParentRef = useRef<HTMLDivElement>(null);
  const cloudRef = useRef<HTMLDivElement>(null);
  const chatBubbleRef = useRef<HTMLDivElement>(null);
  const thoughtBubble1Ref = useRef<HTMLDivElement>(null);
  const thoughtBubble2Ref = useRef<HTMLDivElement>(null);
  const lastCloudRatioRef = useRef<number | null>(null);

  // Function to handle auto-start when triggered
  const handleAutoStart: AutoStartCallback = (result: AutoStartResult) => {
    console.log("🚀 [AUTO-START] Auto-start callback triggered:", result);

    if (result.shouldAutoStart) {
      console.log(
        "✅ [AUTO-START] Triggering auto-start for:",
        result.taskName
      );
      setAutoStartTaskName(result.taskName);
      setShowAutoStartOverlay(true);
    } else {
      console.log("❌ [AUTO-START] Auto-start not triggered:", result.reason);
    }
  };

  // Function to fetch current tasks
  const fetchTasks = async () => {
    try {
      const today = new Date();
      console.log(
        "📋 [ChatHomePage] Fetching tasks for date:",
        today.toISOString().split("T")[0]
      );
      const fetchedTasks = await getTasksForDate(today);
      console.log(
        "📋 [ChatHomePage] Fetched tasks:",
        fetchedTasks.length,
        "tasks:",
        fetchedTasks
      );
      setTasks(fetchedTasks);

      // Force regenerate message immediately after tasks are set
      // This ensures we update the message right away instead of waiting for useEffect
      // Removed timeout for immediate message update to reduce delay
      console.log(
        "🚀 [ChatHomePage] Force regenerating message after task load"
      );
      generateRandomMessage();

      if (fetchedTasks.length > 0) {
        console.log(
          "🎯 [ChatHomePage] Tasks loaded, will generate new message"
        );

        // Auto-start monitoring will be handled by useEffect below
      } else {
        console.log("📭 [ChatHomePage] No tasks found for today");
      }
    } catch (error) {
      console.error("❌ [ChatHomePage] Error fetching tasks:", error);
      setTasks([]); // Ensure we have a clean empty state on error
    }
  };

  // Function to calculate appropriate font size based on message length
  const calculateFontSize = (message: string) => {
    const baseSize = 5; // 5xl = text-5xl
    const longThreshold = 50; // Characters
    const veryLongThreshold = 80; // Characters

    if (message.length > veryLongThreshold) {
      return `text-3xl`; // Reduce by 2 sizes for very long text
    } else if (message.length > longThreshold) {
      return `text-4xl`; // Reduce by 1 size for long text
    }
    return `text-5xl`; // Default size
  };

  // Function to generate random message based on current task state
  const generateRandomMessage = () => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "COMPLETED").length;
    const inProgressTasks = tasks
      .filter((t) => t.status === "IN_PROGRESS")
      .sort((a, b) => {
        // Sort by startedAt to get most recent IN_PROGRESS task
        const aTime = a.startedAt?.toMillis() || 0;
        const bTime = b.startedAt?.toMillis() || 0;
        return bTime - aTime; // Most recent first
      });

    console.log(
      "💬 [ChatHomePage] generateRandomMessage - totalTasks:",
      totalTasks,
      "tasks array length:",
      tasks.length,
      "current message:",
      currentMessage
    );

    const messages = [
      "Please complete task to collect mellow",
      "Try clicking the cloud above!",
      "There are mellows waiting for you!",
      "Let's work on {taskName}!",
    ];

    // Only add task count message if we actually have tasks data loaded
    if (totalTasks > 0) {
      messages.unshift(`I have a total of ${totalTasks} tasks today`);
    } else {
      // Add alternative messages when no tasks are loaded yet or no tasks exist
      messages.push("Ready to start your productive day! 🌟");
      messages.push("Let's create some tasks to get started!");
    }

    // If there's a recent IN_PROGRESS task, add it to potential messages
    if (inProgressTasks.length > 0) {
      const recentTask = inProgressTasks[0];
      messages.push(`Let's work on "${recentTask.name}"!`);
    }

    // Randomly select a message
    const randomIndex = Math.floor(Math.random() * messages.length);
    let selectedMessage = messages[randomIndex] || "Ready to start your day!";

    // Handle template replacement for {taskName}
    if (selectedMessage.includes("{taskName}")) {
      if (inProgressTasks.length > 0) {
        const recentTask = inProgressTasks[0];
        selectedMessage = selectedMessage.replace(
          "{taskName}",
          `"${recentTask.name}"`
        );
      } else {
        // If no in-progress tasks, replace with a generic message
        selectedMessage = "Ready to start working!";
      }
    }

    console.log("💬 [ChatHomePage] Generated message:", selectedMessage);
    setCurrentMessage(selectedMessage);
  };

  // Function để navigate sang timer khi click vào cloud
  const handleCloudClick = () => {
    console.log("☁️ Cloud clicked! Navigating to timer...");
    router.push("/time");
  };

  // Long press functions
  const startLongPress = (e: React.MouseEvent | React.TouchEvent) => {
    // Only handle left mouse button for long press
    if ("button" in e && e.button !== 0) {
      return; // Not left click, ignore
    }

    // Check if we're clicking on a cloud
    const target = e.target as HTMLElement;
    if (
      target.closest("[data-cloud-id]") ||
      target.closest(".cursor-grab") ||
      target.closest(".cursor-grabbing")
    ) {
      return; // Don't start long press on draggable clouds
    }

    e.preventDefault();

    // Get cursor position
    let clientX, clientY;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    setCursorPosition({ x: clientX, y: clientY });
    setIsLongPressing(true);
    setLongPressProgress(0);
    longPressStartRef.current = Date.now();

    // Animate progress
    longPressAnimationRef.current = anime({
      targets: { progress: 0 },
      progress: 100,
      duration: 1200,
      easing: "linear",
      update: function (anim) {
        setLongPressProgress(Number(anim.animations[0].currentValue));
      },
      complete: function () {
        console.log("Long press completed! Navigating to /stats");
        router.push("/stats");
        endLongPress();
      },
    });

    // Set timer as backup
    longPressTimerRef.current = setTimeout(() => {
      console.log("Long press timer completed! Navigating to /stats");
      router.push("/stats");
      endLongPress();
    }, 1200);
  };

  const endLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (longPressAnimationRef.current) {
      longPressAnimationRef.current.pause();
    }

    const pressDuration =
      Date.now() - (longPressStartRef.current || Date.now());

    if (isLongPressing && pressDuration >= 500 && pressDuration < 1200) {
      console.log("Short press detected! Navigating to /time");
      router.push("/time");
    }

    setIsLongPressing(false);
    setLongPressProgress(0);

    // Animate progress back to 0
    anime({
      targets: { progress: longPressProgress },
      progress: 0,
      duration: 300,
      easing: "easeOutExpo",
      update: function (anim) {
        setLongPressProgress(Number(anim.animations[0].currentValue));
      },
    });
  };

  // Function to start the random message timer
  const startMessageTimer = () => {
    if (messageTimerRef.current) {
      clearInterval(messageTimerRef.current);
    }

    const getRandomInterval = () => {
      // Random interval between 18-30 seconds (18000-30000 ms)
      return Math.floor(Math.random() * (30000 - 18000 + 1)) + 18000;
    };

    const scheduleNextMessage = () => {
      const interval = getRandomInterval();
      console.log(
        `⏰ [ChatHomePage] Next message change in ${interval / 1000} seconds`
      );

      messageTimerRef.current = setTimeout(() => {
        generateRandomMessage();
        scheduleNextMessage(); // Schedule the next one
      }, interval);
    };

    scheduleNextMessage();
  };

  // Available cloud types matching your SVG files
  const availableCloudTypes = [1, 2, 3, 5, 6]; // img_group_1.svg, img_group_2.svg, img_group_3.svg, img_group_5.svg, img_group_6.svg

  // MOVED: Define handleTaskComplete function BEFORE the useEffect that uses it
  const handleTaskComplete = (taskId?: string) => {
    console.log(
      "☁️ [ChatHomePage] handleTaskComplete called for taskId:",
      taskId
    );
    // Use taskId in key generation to ensure uniqueness, fallback to timestamp + random
    const uniqueId = taskId
      ? `${taskId}-${Date.now()}`
      : `cloud-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newCloudId = `cloud-${uniqueId}`;
    // Randomly select from available cloud types
    const randomIndex = Math.floor(Math.random() * availableCloudTypes.length);
    const cloudType = availableCloudTypes[randomIndex];

    console.log(
      "🎨 [ChatHomePage] Creating cloud with ID:",
      newCloudId,
      "type:",
      cloudType,
      "for task:",
      taskId
    );

    // Ensure new clouds don't spawn too close to the last one, using ratios
    const minDistance = 250; // Minimum horizontal distance in pixels
    let newXRatio;
    let attempts = 0; // Prevent infinite loops
    do {
      const randomX = Math.random() * (window.innerWidth - 200) + 100;
      newXRatio = randomX / window.innerWidth;
      attempts++;
    } while (
      lastCloudRatioRef.current !== null &&
      Math.abs(newXRatio - lastCloudRatioRef.current) * window.innerWidth <
        minDistance &&
      attempts < 50
    );
    lastCloudRatioRef.current = newXRatio;

    const newCloud: Cloud = {
      id: newCloudId,
      type: cloudType,
      xRatio: newXRatio,
      y: -100, // Start above screen
      isFalling: true, // It starts by falling
      isInitialFall: true, // This is the initial fall
    };

    console.log("📦 [ChatHomePage] Adding cloud to state:", newCloud);
    setClouds((prev) => [...prev, newCloud]);
    setCompletedTasks((prev) => prev + 1);

    // Animate cloud dropping down to "ground" (bottom of page) - NO FLOATING AFTER
    setTimeout(() => {
      console.log(
        "🎬 [ChatHomePage] Starting animation for cloud:",
        newCloudId
      );
      const cloudElement = document.querySelector(
        `[data-cloud-id="${newCloudId}"]`
      );
      console.log("🔍 [ChatHomePage] Found cloud element:", !!cloudElement);

      if (cloudElement && containerRef.current) {
        console.log(
          "✅ [ChatHomePage] Both cloud element and container found, starting animation"
        );
        const groundContainer = containerRef.current;
        const cloudHeight = cloudElement.firstElementChild?.clientHeight || 96;
        const finalGroundLevel = groundContainer.clientHeight - cloudHeight;

        const anim = anime({
          targets: cloudElement,
          translateY: [0, finalGroundLevel - newCloud.y], // Adjust for the initial 'y' position
          translateX: {
            value: (Math.random() - 0.5) * 60,
            duration: 3000,
            easing: "easeInOutSine",
          },
          rotate: {
            value: (Math.random() - 0.5) * 40,
            duration: 4500,
            easing: "easeInOutSine",
          },
          scale: 1, // End at full size
          opacity: [
            { value: 1, duration: 500, easing: "easeOutSine" }, // Fade in
          ],
          duration: 9000,
          easing: "easeInCubic",
          complete: () => {
            console.log(
              "🏁 [ChatHomePage] Animation completed for cloud:",
              newCloudId
            );
            // Animation finished, cloud is no longer falling
            setClouds((prev) =>
              prev.map((c) =>
                c.id === newCloudId
                  ? { ...c, isFalling: false, isInitialFall: false }
                  : c
              )
            );
          },
        });
        animationRefs.current[newCloudId] = anim;
        console.log("🎭 [ChatHomePage] Animation instance created and stored");
      } else {
        console.error(
          "❌ [ChatHomePage] Failed to find cloud element or container for animation"
        );
      }
    }, 16); // Reduced from 100ms to 16ms (1 animation frame) for faster response
  };

  // --- INTEGRATION START ---
  // 2. Create an effect that listens to the hook and triggers the EXISTING animation logic.
  useEffect(() => {
    console.log(
      "🔄 [ChatHomePage] useEffect triggered with newlyCompletedTaskIds:",
      newlyCompletedTaskIds
    );
    if (newlyCompletedTaskIds.length > 0) {
      console.log(
        "🚀 [ChatHomePage] Processing",
        newlyCompletedTaskIds.length,
        "newly completed tasks"
      );
      // For each newly completed task, trigger the original cloud drop animation.
      newlyCompletedTaskIds.forEach((taskId: string, index: number) => {
        console.log(
          `☁️ [ChatHomePage] Calling handleTaskComplete for task ${index + 1}/${
            newlyCompletedTaskIds.length
          }:`,
          taskId
        );
        handleTaskComplete(taskId);
      });

      // Removed redundant fetchTasks() call to reduce delay
      // Real-time listener already provides latest data
      // fetchTasks();
      // Optionally, add a celebration message logic here if needed.
    } else {
      console.log("📭 [ChatHomePage] No newly completed tasks to process");
    }
  }, [newlyCompletedTaskIds]); // Dependency array is correct.
  // --- INTEGRATION END ---

  // Effect to regenerate message when tasks change
  useEffect(() => {
    console.log(
      "🔄 [ChatHomePage] useEffect tasks changed, tasks.length:",
      tasks.length
    );
    // Always generate message when tasks change (whether 0 or more)
    // This ensures we show appropriate messages for both empty and populated task lists
    generateRandomMessage();
  }, [tasks]);

  const animateFallAfterDrag = (cloudId: string) => {
    const cloudElement = document.querySelector(`[data-cloud-id="${cloudId}"]`);
    const cloud = clouds.find((c) => c.id === cloudId);
    const container = containerRef.current;

    if (!cloudElement || !container || !cloud) return;

    const cloudHeight = cloudElement.firstElementChild?.clientHeight || 96;
    const finalGroundLevel = container.clientHeight - cloudHeight;

    // First, update the state with the new ratio.
    const finalTx = parseFloat(
      (anime.get(cloudElement, "translateX", "px") as string) || "0"
    );
    const containerWidth = container.clientWidth;
    const initialPixelX = cloud.xRatio * containerWidth;
    const finalPixelX = initialPixelX + finalTx;
    let newXRatio = finalPixelX / containerWidth;
    newXRatio = Math.max(0, Math.min(1, newXRatio)); // Clamp ratio

    setClouds((prev) =>
      prev.map((c) =>
        c.id === cloudId
          ? { ...c, xRatio: newXRatio, isFalling: true, isInitialFall: false }
          : c
      )
    );

    // Immediately reset the transform. The new `left` property will handle the position.
    // The element's position is now based on the new ratio, so translateX should be 0.
    anime.set(cloudElement, { translateX: 0 });

    const fallDistance = finalGroundLevel - cloud.y - finalTx;
    const duration = Math.max(
      500,
      (fallDistance / container.clientHeight) * 2500 // Faster fall
    );

    const anim = anime({
      targets: cloudElement,
      translateY: finalGroundLevel - cloud.y,
      translateX: [
        {
          value: (Math.random() - 0.5) * 80,
          duration: duration / 2,
          easing: "easeInOutSine",
        },
        {
          value: (Math.random() - 0.5) * 160,
          duration: duration / 2,
          easing: "easeInOutSine",
        },
      ],
      rotate: [
        { value: `${(Math.random() - 0.5) * 60}deg`, duration: duration },
      ],
      duration: duration,
      easing: "easeInQuad",
      complete: () => {
        // Animation finished, cloud is no longer falling
        setClouds((prev) =>
          prev.map((c) =>
            c.id === cloudId
              ? { ...c, isFalling: false, isInitialFall: false }
              : c
          )
        );
      },
    });
    animationRefs.current[cloudId] = anim;
  };

  // Adjust cloud positions on window resize
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || clouds.length === 0) return;
      const groundContainer = containerRef.current;

      const visibleBottom =
        groundContainer.scrollTop + groundContainer.clientHeight;

      clouds.forEach((cloud) => {
        const cloudElement = document.querySelector(
          `[data-cloud-id="${cloud.id}"]`
        );

        // We only want to adjust clouds that have already "landed".
        // A simple way to check is to see if they have a significant translateY value.
        // The initial fall animation is controlled by handleTaskComplete.
        const currentTy = parseFloat(
          anime.get(cloudElement, "translateY", "px") as string
        );

        if (cloudElement && currentTy > 0) {
          const cloudHeight =
            cloudElement.firstElementChild?.clientHeight || 96;
          const finalGroundLevel = visibleBottom - cloudHeight;

          anime({
            targets: cloudElement,
            translateY: finalGroundLevel - cloud.y,
            duration: 500,
            easing: "easeOutQuint",
          });
        }
      });
    };

    let timeoutId: NodeJS.Timeout;
    const debouncedHandler = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 250);
    };

    window.addEventListener("resize", debouncedHandler);

    return () => {
      window.removeEventListener("resize", debouncedHandler);
      clearTimeout(timeoutId);
    };
  }, [clouds]);

  // Traditional anime.js drag handling
  useEffect(() => {
    if (!draggedCloud) return;

    const cloudElement = document.querySelector(
      `[data-cloud-id="${draggedCloud.id}"]`
    );
    if (!cloudElement) return;

    let latestMouseEvent: { clientX: number; clientY: number } | null = null;

    const animationLoop = () => {
      if (latestMouseEvent) {
        const deltaX = latestMouseEvent.clientX - draggedCloud.startX;
        const deltaY = latestMouseEvent.clientY - draggedCloud.startY;

        anime.set(cloudElement, {
          translateX: draggedCloud.initialTx + deltaX,
          translateY: draggedCloud.initialTy + deltaY,
        });
      }
      animationFrameIdRef.current = requestAnimationFrame(animationLoop);
    };

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      latestMouseEvent = e;
    };

    const handleMouseUp = () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }

      if (cloudElement) {
        cloudElement.classList.remove("cursor-grabbing");
        cloudElement.classList.add("cursor-grab");
      }

      animateFallAfterDrag(draggedCloud.id);
      setDraggedCloud(null);
    };

    // Start animation loop
    animationFrameIdRef.current = requestAnimationFrame(animationLoop);

    window.addEventListener("mousemove", handleMouseMove, { passive: false });
    window.addEventListener("mouseup", handleMouseUp, { once: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
    };
  }, [draggedCloud]);

  useEffect(() => {
    const cloudEl = cloudRef.current;
    const chatBubbleEl = chatBubbleRef.current;
    const bubble1El = thoughtBubble1Ref.current;
    const bubble2El = thoughtBubble2Ref.current;
    const parentEl = positioningParentRef.current;

    if (!cloudEl || !chatBubbleEl || !bubble1El || !bubble2El || !parentEl) {
      return;
    }

    // --- Mouse Tracking & Eye Following ---
    let mouseX = window.innerWidth / 2;
    const handleMouseMoveForEyes = (event: MouseEvent) => {
      mouseX = event.clientX;
    };
    window.addEventListener("mousemove", handleMouseMoveForEyes);

    const clamp = (value: number, min: number, max: number) =>
      Math.min(Math.max(value, min), max);

    let currentEyeTranslateX = 0; // The current, smoothed X position of the eyes
    const easingFactor = 0.08; // How quickly the eyes catch up to the cursor

    const eyeFollowAnimation = anime({
      targets: ["#cloud-eye-left", "#cloud-eye-right"],
      loop: true,
      easing: "linear",
      duration: Infinity,
      update: () => {
        const cloudRect = cloudEl.getBoundingClientRect();
        const cloudCenterX = cloudRect.left + cloudRect.width / 2;
        const dx = mouseX - cloudCenterX;

        // Calculate the target position
        const influence = 0.03;
        let targetTranslateX = dx * influence;
        const maxShift = 3.5; // Max pixels to shift left or right
        targetTranslateX = clamp(targetTranslateX, -maxShift, maxShift);

        // Smoothly move the current position towards the target
        currentEyeTranslateX +=
          (targetTranslateX - currentEyeTranslateX) * easingFactor;

        anime.set(["#cloud-eye-left", "#cloud-eye-right"], {
          translateX: currentEyeTranslateX,
        });
      },
    });

    // Gentle floating animation for the pink cloud
    const cloudAnimation = anime({
      targets: cloudEl,
      translateX: {
        value: "+=20",
        duration: 4000,
        easing: "easeInOutSine",
      },
      translateY: {
        value: "+=10",
        duration: 3000,
        easing: "easeInOutSine",
      },
      rotate: {
        value: "+=3",
        duration: 5000,
        easing: "easeInOutSine",
      },
      direction: "alternate",
      loop: true,
    });

    // Blinking animation using path morphing
    const blinkAnimation = () => {
      anime({
        targets: ["#cloud-eye-left", "#cloud-eye-right"],
        d: function (el: HTMLElement, i: number) {
          const paths =
            i === 0 // Left eye
              ? [
                  "M51.4907 33.1399L48.8837 49.0193", // Open
                  "M50.1872 40.0796L50.1872 42.0796", // Squinted (:)
                  "M51.4907 33.1399L48.8837 49.0193", // Open
                ]
              : [
                  "M70.3069 36.229L67.6999 52.1084", // Open
                  "M69.0034 43.1687L69.0034 45.1687", // Squinted (:)
                  "M70.3069 36.229L67.6999 52.1084", // Open
                ];
          return paths;
        },
        duration: 400,
        easing: "easeInOutQuad",
        delay: anime.random(2000, 5000), // Random delay between 2-5 seconds
        complete: blinkAnimation, // Loop the animation
      });
    };
    blinkAnimation(); // Start the blinking

    const updateThoughtBubbles = () => {
      const cloudRect = cloudEl.getBoundingClientRect();
      const chatBubbleRect = chatBubbleEl.getBoundingClientRect();
      const parentRect = parentEl.getBoundingClientRect();

      if (!parentRect) return;

      // Center of the cloud, relative to the new parent
      const cloudX = cloudRect.left - parentRect.left + cloudRect.width / 2;
      const cloudY = cloudRect.top - parentRect.top + cloudRect.height / 2;

      // Define the source point on the top-right of the chat bubble, relative to the new parent
      const sourceX = chatBubbleRect.right - parentRect.left - 46; // Adjusted to be more to the right
      const sourceY = chatBubbleRect.top - parentRect.top + 20; // Move downwards from the top edge

      const dx = cloudX - sourceX;
      const dy = cloudY - sourceY;
      const angle = Math.atan2(dy, dx);

      // Position bubbles along the line from chat bubble to cloud, with more spacing
      const dist1 = 35; // Distance for the first bubble
      const dist2 = 80; // Distance for the second bubble, increased for more spacing

      const bubble1X =
        sourceX + Math.cos(angle) * dist1 - bubble1El.offsetWidth / 2;
      const bubble1Y =
        sourceY + Math.sin(angle) * dist1 - bubble1El.offsetHeight / 2;
      const bubble2X =
        sourceX + Math.cos(angle) * dist2 - bubble2El.offsetWidth / 2;
      const bubble2Y =
        sourceY + Math.sin(angle) * dist2 - bubble2El.offsetHeight / 2;

      // Use anime.set to position bubbles
      anime.set(bubble1El, {
        translateX: bubble1X,
        translateY: bubble1Y,
      });
      anime.set(bubble2El, {
        translateX: bubble2X,
        translateY: bubble2Y,
      });
    };

    const thoughtBubbleAnimation = anime({
      targets: {}, // Empty target, we only use the update callback
      loop: true,
      easing: "linear",
      duration: Infinity,
      update: updateThoughtBubbles,
    });

    // Handle resize to keep thought bubbles positioned correctly
    const handleResize = () => {
      updateThoughtBubbles();
    };

    window.addEventListener("resize", handleResize);
    // Initial call
    handleResize();

    return () => {
      window.removeEventListener("mousemove", handleMouseMoveForEyes);
      window.removeEventListener("resize", handleResize);
      eyeFollowAnimation.pause();
      cloudAnimation.pause();
      // We don't pause blinkAnimation as it's self-looping and will be garbage collected
      thoughtBubbleAnimation.pause();
    };
  }, []);

  // Save home access time when component mounts
  useEffect(() => {
    console.log("🏠 [ChatHomePage] Component mounted, saving home access time");
    saveHomeAccessTime();
  }, []);

  // Setup auto-start monitoring with onSnapshot
  useEffect(() => {
    console.log("🚀 [AUTO-START] Setting up real-time monitoring...");

    const unsubscribe = setupAutoStartMonitoring(handleAutoStart);
    autoStartUnsubscribeRef.current = unsubscribe;

    return () => {
      console.log("🛑 [AUTO-START] Cleaning up auto-start monitoring");
      if (autoStartUnsubscribeRef.current) {
        autoStartUnsubscribeRef.current();
        autoStartUnsubscribeRef.current = null;
      }
    };
  }, []);

  // Initialize tasks and message timer
  useEffect(() => {
    const initializeHomePage = async () => {
      console.log("🚀 [ChatHomePage] Initializing home page...");
      await fetchTasks();
      startMessageTimer();
    };

    initializeHomePage();

    return () => {
      if (messageTimerRef.current) {
        clearInterval(messageTimerRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* Auto-start overlay */}
      <AutoStartOverlay
        isVisible={showAutoStartOverlay}
        taskName={autoStartTaskName}
        onTransitionComplete={() => {
          setShowAutoStartOverlay(false);
          setAutoStartTaskName(undefined);
          // Tự động chuyển sang trang time sau khi overlay hoàn thành
          router.push("/time");
        }}
      />
      <HomeContextMenu>
        <div
          ref={containerRef}
          className="h-screen max-h-screen bg-gradient-to-br from-[#faf6f8] to-[#f0e8ed] flex flex-col items-center justify-center p-4 md:p-8 lg:p-12 relative overflow-hidden"
          style={{ height: "100vh", maxHeight: "100vh" }}
          onMouseDown={(e) => {
            // Don't start long press if clicking on interactive elements
            const target = e.target as HTMLElement;
            if (
              target.closest(".bg-blue-500") ||
              target.closest("[data-interactive]")
            ) {
              return;
            }
            startLongPress(e);
          }}
          onMouseUp={endLongPress}
          onMouseLeave={endLongPress}
          onTouchStart={startLongPress}
          onTouchEnd={endLongPress}
        >
          {/* Chat Container with responsive sizing */}
          <div className="max-w-full md:max-w-4xl lg:max-w-5xl xl:max-w-6xl w-full space-y-8 md:space-y-12 lg:space-y-16">
            {/* First Chat Bubble - White with greeting */}
            <div className="flex justify-start">
              <div ref={positioningParentRef} className="relative">
                {/* Pink cloud with responsive sizing - Click to go to Timer */}
                <div
                  ref={cloudRef}
                  className="absolute -top-32 -right-24 md:-top-40 md:-right-28 lg:-top-50 lg:-right-35 z-10 cursor-pointer hover:scale-110 transition-transform duration-300"
                  onClick={handleCloudClick}
                  title="Click để đi đến Timer! ⏰"
                >
                  <MellowPinkCloud className="w-32 h-24 md:w-40 md:h-30 lg:w-48 lg:h-36 opacity-90 drop-shadow-lg hover:opacity-100" />
                </div>

                {/* Thought Bubbles - responsive */}
                <div
                  ref={thoughtBubble1Ref}
                  className="absolute w-8 h-8 md:w-10 md:h-10 rounded-full bg-white border-2 border-gray-300 z-0"
                ></div>
                <div
                  ref={thoughtBubble2Ref}
                  className="absolute w-4 h-4 md:w-6 md:h-6 rounded-full bg-white border-2 border-gray-300 z-0"
                ></div>

                {/* White chat bubble with responsive sizing */}
                <div
                  ref={chatBubbleRef}
                  className="relative bg-white border-2 border-gray-300 rounded-[3rem] px-8 py-8 md:px-16 md:py-12 lg:px-24 lg:py-20 shadow-2xl max-w-[90vw] md:max-w-4xl lg:max-w-6xl z-10"
                >
                  <p className="text-gray-800 text-3xl md:text-4xl lg:text-5xl font-bold text-center leading-tight">
                    It's a brand new day today 🥺
                  </p>
                </div>
              </div>
            </div>

            {/* Second Chat Bubble - Blue with hover functionality */}
            <HoverTaskChatBubble
              currentMessage={currentMessage}
              calculateFontSize={calculateFontSize}
              tasks={tasks}
            />

            {/* Meeting Notifications Status */}
            {(scheduledMeetings.length > 0 ||
              !notificationPermissionGranted) && (
              <div className="flex justify-center mt-4">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl px-6 py-4 shadow-lg max-w-md">
                  {!notificationPermissionGranted && (
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-yellow-600">🔔</span>
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          Enable Meeting Notifications
                        </p>
                        <button
                          onClick={requestNotificationPermission}
                          className="text-xs text-blue-600 hover:text-blue-800 underline"
                        >
                          Grant Permission
                        </button>
                      </div>
                    </div>
                  )}

                  {scheduledMeetings.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-green-600">📅</span>
                        <p className="text-sm font-medium text-gray-700">
                          {scheduledMeetings.length} meeting
                          {scheduledMeetings.length !== 1 ? "s" : ""} scheduled
                        </p>
                      </div>
                      {scheduledMeetings.slice(0, 3).map((meeting, index) => (
                        <div key={index} className="text-xs text-gray-600 pl-6">
                          • {meeting.taskName} at{" "}
                          {meeting.meetingTime.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      ))}
                      {scheduledMeetings.length > 3 && (
                        <div className="text-xs text-gray-500 pl-6">
                          ... and {scheduledMeetings.length - 3} more
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Animated Dropping Clouds Container */}
          <div className="absolute inset-0 pointer-events-none z-20">
            {clouds.map((cloud) => (
              <div
                key={cloud.id}
                className="absolute"
                style={{
                  left: `${cloud.xRatio * 100}%`,
                  top: `${cloud.y}px`,
                }}
              >
                <div
                  data-cloud-id={cloud.id}
                  className="cursor-grab pointer-events-auto"
                  style={{
                    opacity: cloud.isInitialFall ? 0 : 1,
                    transform: "scale(0.1) translateX(-50%)",
                  }}
                  onMouseDown={(e) => {
                    if (cloud.isInitialFall) return; // Prevent drag during initial fall

                    const cloudElement = e.currentTarget;

                    if (animationRefs.current[cloud.id]) {
                      animationRefs.current[cloud.id].pause();
                    }

                    cloudElement.classList.add("cursor-grabbing");
                    cloudElement.classList.remove("cursor-grab");

                    // Get current transform values
                    const initialTx = parseFloat(
                      (anime.get(cloudElement, "translateX", "px") as string) ||
                        "0"
                    );
                    const initialTy = parseFloat(
                      (anime.get(cloudElement, "translateY", "px") as string) ||
                        "0"
                    );

                    setDraggedCloud({
                      id: cloud.id,
                      startX: e.clientX,
                      startY: e.clientY,
                      initialTx: initialTx,
                      initialTy: initialTy,
                    });
                  }}
                >
                  <img
                    src={`/img_group_${cloud.type}.svg`}
                    alt={`Dropping Cloud ${cloud.type}`}
                    className="w-32 h-24 drop-shadow-lg"
                    draggable={false}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Long Press Progress Indicator */}
          {isLongPressing && (
            <div
              className="fixed pointer-events-none z-50"
              style={{
                left: cursorPosition.x - 20,
                top: cursorPosition.y - 20,
              }}
            >
              <div className="relative w-10 h-10">
                {/* iPad-style cursor circle */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    backgroundColor: `rgba(0, 0, 0, ${
                      0.1 + (longPressProgress / 100) * 0.5
                    })`,
                    transform: `scale(${
                      0.8 + (longPressProgress / 100) * 0.4
                    })`,
                    transition: "transform 0.1s ease-out",
                  }}
                />
              </div>
            </div>
          )}

          {/* Background particles for extra effect */}
          <div className="absolute inset-0 pointer-events-none z-0">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-pink-200 rounded-full opacity-20 animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.5}s`,
                }}
              />
            ))}
          </div>
        </div>
      </HomeContextMenu>
    </>
  );
};
