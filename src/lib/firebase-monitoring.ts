import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  getDoc,
  doc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";

export interface FirebaseOperationResult {
  success: boolean;
  message: string;
  data?: any;
}

export interface CurrentTaskData {
  id: string;
  name: string;
  startedAt: any;
  type: "task" | "subtask";
  path: string;
  parentTask?: string;
}

export interface TaskUpdateCallback {
  (result: FirebaseOperationResult & { currentTask?: CurrentTaskData }): void;
}

// Test Firestore connection
export async function testFirestoreConnection(): Promise<FirebaseOperationResult> {
  try {
    const docRef = await addDoc(collection(db, "test"), {
      message: "Hello from Firebase Firestore!",
      timestamp: serverTimestamp(),
      testData: {
        number: Math.floor(Math.random() * 1000),
        boolean: true,
        array: ["test", "data", "array"],
      },
    });

    return {
      success: true,
      message: `✅ Success! Document created with ID: ${docRef.id}`,
      data: { documentId: docRef.id },
    };
  } catch (error) {
    console.error("Error adding document: ", error);
    return {
      success: false,
      message: `❌ Error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

// Find the current in-progress task for today
export async function findCurrentInProgressTask(): Promise<FirebaseOperationResult> {
  try {
    const today = new Date();
    const todayDate = today.toISOString().split("T")[0];

    const tasksRef = collection(db, "Dailies", todayDate, "tasks");
    const tasksSnapshot = await getDocs(tasksRef);

    const inProgressTasks: CurrentTaskData[] = [];

    // Check each task and its subtasks
    for (const taskDoc of tasksSnapshot.docs) {
      const taskData = taskDoc.data();

      // Check if main task is IN_PROGRESS
      if (taskData.status === "IN_PROGRESS" && taskData.startedAt) {
        inProgressTasks.push({
          id: taskDoc.id,
          name: taskData.name,
          startedAt: taskData.startedAt,
          type: "task",
          path: `Dailies/${todayDate}/tasks/${taskDoc.id}`,
        });
      }

      // Check subtasks if they exist
      if (taskData.subtasks && Array.isArray(taskData.subtasks)) {
        for (let i = 0; i < taskData.subtasks.length; i++) {
          const subtask = taskData.subtasks[i];
          if (subtask.status === "IN_PROGRESS" && subtask.startedAt) {
            inProgressTasks.push({
              id: `${taskDoc.id}_subtask_${i}`,
              name: subtask.name,
              startedAt: subtask.startedAt,
              type: "subtask",
              path: `Dailies/${todayDate}/tasks/${taskDoc.id}/subtasks/${i}`,
              parentTask: taskData.name,
            });
          }
        }
      }
    }

    // If no IN_PROGRESS tasks found
    if (inProgressTasks.length === 0) {
      return {
        success: true,
        message: "📋 No tasks currently in progress for today.",
        data: null,
      };
    }

    // If only one IN_PROGRESS task
    if (inProgressTasks.length === 1) {
      const task = inProgressTasks[0];
      const displayName =
        task.type === "subtask"
          ? `${task.parentTask} → ${task.name}`
          : task.name;

      return {
        success: true,
        message: `🎯 Current task in progress: "${displayName}"`,
        data: {
          task: task,
          reference: task.path,
        },
      };
    }

    // If multiple IN_PROGRESS tasks, find the one with most recent startedAt
    const mostRecentTask = inProgressTasks.reduce((latest, current) => {
      const latestTime = latest.startedAt.toDate
        ? latest.startedAt.toDate()
        : latest.startedAt;
      const currentTime = current.startedAt.toDate
        ? current.startedAt.toDate()
        : current.startedAt;

      return currentTime > latestTime ? current : latest;
    });

    const displayName =
      mostRecentTask.type === "subtask"
        ? `${mostRecentTask.parentTask} → ${mostRecentTask.name}`
        : mostRecentTask.name;

    return {
      success: true,
      message: `🎯 Current task in progress: "${displayName}" (most recently started among ${inProgressTasks.length} active tasks)`,
      data: {
        task: mostRecentTask,
        reference: mostRecentTask.path,
        totalInProgress: inProgressTasks.length,
      },
    };
  } catch (error) {
    console.error("Error finding current in progress task: ", error);
    return {
      success: false,
      message: `❌ Error finding current in progress task: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

// Helper function to check if a specific task has been completed
async function checkTaskCompletionStatus(
  taskPath: string,
  taskType: "task" | "subtask",
  targetDate?: string
): Promise<{ isCompleted: boolean; taskData?: any }> {
  try {
    const today = targetDate || new Date().toISOString().split("T")[0];
    
    if (taskType === "task") {
      // Extract task ID from path: "Dailies/2024-01-01/tasks/taskId"
      const taskId = taskPath.split("/").pop();
      if (!taskId) return { isCompleted: false };
      
      const taskDocRef = doc(db, "Dailies", today, "tasks", taskId);
      const taskSnapshot = await getDoc(taskDocRef);
      
      if (taskSnapshot.exists()) {
        const taskData = taskSnapshot.data();
        return { 
          isCompleted: taskData.status === "COMPLETED",
          taskData 
        };
      }
    } else if (taskType === "subtask") {
      // Extract from path: "Dailies/2024-01-01/tasks/taskId/subtasks/0"
      const pathParts = taskPath.split("/");
      const taskId = pathParts[3];
      const subtaskIndex = parseInt(pathParts[5]);
      
      if (!taskId || isNaN(subtaskIndex)) return { isCompleted: false };
      
      const taskDocRef = doc(db, "Dailies", today, "tasks", taskId);
      const taskSnapshot = await getDoc(taskDocRef);
      
      if (taskSnapshot.exists()) {
        const taskData = taskSnapshot.data();
        if (taskData.subtasks && taskData.subtasks[subtaskIndex]) {
          const subtaskData = taskData.subtasks[subtaskIndex];
          return { 
            isCompleted: subtaskData.status === "COMPLETED",
            taskData: subtaskData 
          };
        }
      }
    }
    
    return { isCompleted: false };
  } catch (error) {
    console.error("Error checking task completion status:", error);
    return { isCompleted: false };
  }
}

// Real-time monitoring for task changes and in-progress task updates
export function monitorCurrentInProgressTask(
  onTaskUpdate: TaskUpdateCallback,
  targetDate?: string
): Unsubscribe {
  const today = targetDate || new Date().toISOString().split("T")[0];
  const tasksRef = collection(db, "Dailies", today, "tasks");

  let lastInProgressTask: CurrentTaskData | null = null;

  // Set up the onSnapshot listener
  const unsubscribe = onSnapshot(
    tasksRef,
    async (snapshot) => {
      try {
        // Get current in-progress task after any change
        const currentResult = await findCurrentInProgressTask();

        if (!currentResult.success) {
          onTaskUpdate({
            success: false,
            message: "❌ Error monitoring tasks: " + currentResult.message,
          });
          return;
        }

        const currentInProgressTask = currentResult.data
          ?.task as CurrentTaskData | null;
        const currentTaskId = currentInProgressTask?.id || null;
        const lastTaskId = lastInProgressTask?.id || null;

        // Check if the current in-progress task has changed
        const hasChanged = lastTaskId !== currentTaskId;

        if (hasChanged) {
          let changeType: string;
          let message: string;

          // If there was a previous task and now there's no current task
          if (lastInProgressTask && !currentInProgressTask) {
            // Check if the previous task was completed
            const completionCheck = await checkTaskCompletionStatus(
              lastInProgressTask.path,
              lastInProgressTask.type,
              today
            );

            if (completionCheck.isCompleted) {
              changeType = "completed";
              const lastDisplayName =
                lastInProgressTask.type === "subtask"
                  ? `${lastInProgressTask.parentTask} → ${lastInProgressTask.name}`
                  : lastInProgressTask.name;
              
              message = `✅ Task completed: "${lastDisplayName}"`;
            } else {
              changeType = "stopped";
              message = "📋 No task currently in progress";
            }

            onTaskUpdate({
              success: true,
              message,
              data: {
                task: null,
                reference: null,
                changeType,
                previousTask: lastInProgressTask,
                wasCompleted: completionCheck.isCompleted,
              },
              currentTask: undefined,
            });
          }
          // If there's a new current task
          else if (currentInProgressTask) {
            const displayName =
              currentInProgressTask.type === "subtask"
                ? `${currentInProgressTask.parentTask} → ${currentInProgressTask.name}`
                : currentInProgressTask.name;

            // Determine change type
            if (!lastInProgressTask) {
              changeType = "started";
              message = `🎯 Task started: "${displayName}"`;
            } else {
              // Check if previous task was completed
              const completionCheck = await checkTaskCompletionStatus(
                lastInProgressTask.path,
                lastInProgressTask.type,
                today
              );

              if (completionCheck.isCompleted) {
                changeType = "completed_and_started";
                const lastDisplayName =
                  lastInProgressTask.type === "subtask"
                    ? `${lastInProgressTask.parentTask} → ${lastInProgressTask.name}`
                    : lastInProgressTask.name;
                
                message = `🔄 Task completed: "${lastDisplayName}" → Started: "${displayName}"`;
              } else {
                changeType = "switched";
                message = `🔄 Task switched to: "${displayName}"`;
              }
            }

            onTaskUpdate({
              success: true,
              message,
              data: {
                task: currentInProgressTask,
                reference: currentInProgressTask.path,
                changeType,
                previousTask: lastInProgressTask,
                wasCompleted: lastInProgressTask ? (await checkTaskCompletionStatus(
                  lastInProgressTask.path,
                  lastInProgressTask.type,
                  today
                )).isCompleted : false,
              },
              currentTask: currentInProgressTask,
            });
          }

          // Update tracking variable
          lastInProgressTask = currentInProgressTask;
        }
      } catch (error) {
        console.error("Error in task monitor: ", error);
        onTaskUpdate({
          success: false,
          message: `❌ Error monitoring tasks: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        });
      }
    },
    (error) => {
      console.error("Error in onSnapshot: ", error);
      onTaskUpdate({
        success: false,
        message: `❌ Snapshot error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
    }
  );

  return unsubscribe;
}

// Helper function to start monitoring with a promise-based initial load
export async function startTaskMonitoring(
  onTaskUpdate: TaskUpdateCallback,
  targetDate?: string
): Promise<{
  unsubscribe: Unsubscribe;
  initialTask: FirebaseOperationResult;
}> {
  try {
    // Get the initial current task
    const initialResult = await findCurrentInProgressTask();

    // Start monitoring for changes
    const unsubscribe = monitorCurrentInProgressTask(onTaskUpdate, targetDate);

    return {
      unsubscribe,
      initialTask: initialResult,
    };
  } catch (error) {
    console.error("Error starting task monitoring: ", error);
    return {
      unsubscribe: () => {}, // dummy unsubscribe function
      initialTask: {
        success: false,
        message: `❌ Error starting monitoring: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
    };
  }
}

// Helper function to get all dates between startDate and endDate
function getDateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(d.toISOString().split("T")[0]);
  }

  return dates;
}

// Helper function to convert Firestore timestamp to milliseconds
function timestampToMs(timestamp: any): number {
  if (!timestamp) return 0;
  if (timestamp.toDate) {
    return timestamp.toDate().getTime();
  }
  if (timestamp instanceof Date) {
    return timestamp.getTime();
  }
  // If it's already a number or string that can be parsed
  return new Date(timestamp).getTime();
}

// 1. Get total completed tasks (Mellows) in timeframe
export async function getTotalMellowsInTimeframe(
  startDate: string,
  endDate: string
): Promise<FirebaseOperationResult> {
  try {
    console.log(`🔍 [getTotalMellowsInTimeframe] Searching from ${startDate} to ${endDate}`);
    
    const dates = getDateRange(startDate, endDate);
    console.log(`📅 [getTotalMellowsInTimeframe] Checking dates:`, dates);
    
    let totalCompleted = 0;

    for (const date of dates) {
      console.log(`📊 [getTotalMellowsInTimeframe] Checking date: ${date}`);
      
      try {
        // Query tasks for this date
        const tasksRef = collection(db, "Dailies", date, "tasks");
        const tasksSnapshot = await getDocs(tasksRef);
        
        console.log(`📋 [getTotalMellowsInTimeframe] Found ${tasksSnapshot.size} tasks for ${date}`);

        for (const taskDoc of tasksSnapshot.docs) {
          const taskData = taskDoc.data();
          console.log(`🔍 [getTotalMellowsInTimeframe] Task: "${taskData.name}", Status: ${taskData.status}`);

          // Count completed main task - no timestamp filtering, just status
          if (taskData.status === "COMPLETED") {
            console.log(`✅ [getTotalMellowsInTimeframe] +1 for completed main task: "${taskData.name}"`);
            totalCompleted++;
          }

          // Count completed subtasks - no timestamp filtering, just status
          if (taskData.subtasks && Array.isArray(taskData.subtasks)) {
            console.log(`📝 [getTotalMellowsInTimeframe] Checking ${taskData.subtasks.length} subtasks for task: "${taskData.name}"`);
            
            for (const subtask of taskData.subtasks) {
              console.log(`  🔍 [getTotalMellowsInTimeframe] Subtask: "${subtask.name}", Status: ${subtask.status}`);
              
              if (subtask.status === "COMPLETED") {
                console.log(`  ✅ [getTotalMellowsInTimeframe] +1 for completed subtask: "${subtask.name}"`);
                totalCompleted++;
              }
            }
          }
        }
      } catch (dateError) {
        console.log(`⚠️ [getTotalMellowsInTimeframe] No data found for date ${date} (normal if no tasks exist)`);
        // Continue to next date - it's normal if no tasks exist for a date
      }
    }

    console.log(`🎯 [getTotalMellowsInTimeframe] FINAL TOTAL: ${totalCompleted} completed tasks`);

    return {
      success: true,
      message: `✅ Found ${totalCompleted} completed tasks in timeframe ${startDate} to ${endDate}`,
      data: { totalCompleted, startDate, endDate },
    };
  } catch (error) {
    console.error("Error getting total mellows in timeframe: ", error);
    return {
      success: false,
      message: `❌ Error getting total mellows: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

// 2. Get total focus time (in milliseconds) for completed tasks
export async function getTotalFocusTime(
  startDate: string,
  endDate: string
): Promise<FirebaseOperationResult> {
  try {
    console.log(`⏱️ [getTotalFocusTime] Calculating focus time from ${startDate} to ${endDate}`);
    
    const dates = getDateRange(startDate, endDate);
    console.log(`📅 [getTotalFocusTime] Checking dates:`, dates);
    
    let totalFocusTimeMs = 0;

    for (const date of dates) {
      console.log(`📊 [getTotalFocusTime] Checking date: ${date}`);
      
      try {
        const tasksRef = collection(db, "Dailies", date, "tasks");
        const tasksSnapshot = await getDocs(tasksRef);
        
        console.log(`📋 [getTotalFocusTime] Found ${tasksSnapshot.size} tasks for ${date}`);

        for (const taskDoc of tasksSnapshot.docs) {
          const taskData = taskDoc.data();
          console.log(`🔍 [getTotalFocusTime] Task: "${taskData.name}", Status: ${taskData.status}`);

          // Calculate focus time for completed main task
          if (taskData.status === "COMPLETED" && taskData.completedAt && taskData.startedAt) {
            const startedAt = timestampToMs(taskData.startedAt);
            const completedAt = timestampToMs(taskData.completedAt);
            const focusTimeMs = completedAt - startedAt;
            
            console.log(`  ⏱️ [getTotalFocusTime] Main task "${taskData.name}": ${Math.round(focusTimeMs/1000/60)} minutes`);
            totalFocusTimeMs += focusTimeMs;
          }

          // Calculate focus time for completed subtasks
          if (taskData.subtasks && Array.isArray(taskData.subtasks)) {
            console.log(`📝 [getTotalFocusTime] Checking ${taskData.subtasks.length} subtasks for task: "${taskData.name}"`);
            
            for (const subtask of taskData.subtasks) {
              console.log(`  🔍 [getTotalFocusTime] Subtask: "${subtask.name}", Status: ${subtask.status}`);
              
              if (subtask.status === "COMPLETED" && subtask.completedAt && subtask.startedAt) {
                const startedAt = timestampToMs(subtask.startedAt);
                const completedAt = timestampToMs(subtask.completedAt);
                const focusTimeMs = completedAt - startedAt;
                
                console.log(`    ⏱️ [getTotalFocusTime] Subtask "${subtask.name}": ${Math.round(focusTimeMs/1000/60)} minutes`);
                totalFocusTimeMs += focusTimeMs;
              }
            }
          }
        }
      } catch (dateError) {
        console.log(`⚠️ [getTotalFocusTime] No data found for date ${date} (normal if no tasks exist)`);
      }
    }

    // Convert to readable formats
    const totalFocusTimeSeconds = Math.round(totalFocusTimeMs / 1000);
    const totalFocusTimeMinutes = Math.round(totalFocusTimeSeconds / 60);
    const totalFocusTimeHours = Math.round((totalFocusTimeMinutes / 60) * 100) / 100; // 2 decimal places

    console.log(`🎯 [getTotalFocusTime] FINAL TOTAL: ${totalFocusTimeHours} hours (${totalFocusTimeMinutes} minutes)`);

    return {
      success: true,
      message: `✅ Total focus time: ${totalFocusTimeHours} hours (${totalFocusTimeMinutes} minutes)`,
      data: {
        totalFocusTimeMs,
        totalFocusTimeSeconds,
        totalFocusTimeMinutes,
        totalFocusTimeHours,
        startDate,
        endDate,
      },
    };
  } catch (error) {
    console.error("Error getting total focus time: ", error);
    return {
      success: false,
      message: `❌ Error getting total focus time: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

// 3. Get average duration for completed tasks
export async function getAverageDuration(
  startDate: string,
  endDate: string
): Promise<FirebaseOperationResult> {
  try {
    const dates = getDateRange(startDate, endDate);
    let totalDurationMs = 0;
    let completedTasksCount = 0;

    for (const date of dates) {
      const tasksRef = collection(db, "Dailies", date, "tasks");
      const tasksSnapshot = await getDocs(tasksRef);

      for (const taskDoc of tasksSnapshot.docs) {
        const taskData = taskDoc.data();

        // Check main task
        if (
          taskData.status === "COMPLETED" &&
          taskData.completedAt &&
          taskData.startedAt
        ) {
          const completedAt = timestampToMs(taskData.completedAt);
          const startMs = new Date(startDate).getTime();
          const endMs = new Date(endDate).getTime() + 24 * 60 * 60 * 1000 - 1;

          if (completedAt >= startMs && completedAt <= endMs) {
            const startedAt = timestampToMs(taskData.startedAt);
            totalDurationMs += completedAt - startedAt;
            completedTasksCount++;
          }
        }

        // Check subtasks (stored as array field, not subcollection)
        if (taskData.subtasks && Array.isArray(taskData.subtasks)) {
          for (const subtask of taskData.subtasks) {
            if (
              subtask.status === "COMPLETED" &&
              subtask.completedAt &&
              subtask.startedAt
            ) {
              const completedAt = timestampToMs(subtask.completedAt);
              const startMs = new Date(startDate).getTime();
              const endMs = new Date(endDate).getTime() + 24 * 60 * 60 * 1000 - 1;

              if (completedAt >= startMs && completedAt <= endMs) {
                const startedAt = timestampToMs(subtask.startedAt);
                totalDurationMs += completedAt - startedAt;
                completedTasksCount++;
              }
            }
          }
        }
      }
    }

    if (completedTasksCount === 0) {
      return {
        success: true,
        message: `📊 No completed tasks found in timeframe ${startDate} to ${endDate}`,
        data: {
          averageDurationMs: 0,
          averageDurationMinutes: 0,
          averageDurationHours: 0,
          completedTasksCount: 0,
          startDate,
          endDate,
        },
      };
    }

    const averageDurationMs = totalDurationMs / completedTasksCount;
    const averageDurationMinutes =
      Math.round((averageDurationMs / 1000 / 60) * 100) / 100;
    const averageDurationHours =
      Math.round((averageDurationMinutes / 60) * 100) / 100;

    return {
      success: true,
      message: `✅ Average task duration: ${averageDurationHours} hours (${averageDurationMinutes} minutes) across ${completedTasksCount} tasks`,
      data: {
        averageDurationMs,
        averageDurationMinutes,
        averageDurationHours,
        completedTasksCount,
        startDate,
        endDate,
      },
    };
  } catch (error) {
    console.error("Error getting average duration: ", error);
    return {
      success: false,
      message: `❌ Error getting average duration: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

// 4. Get time distribution by project
export async function getTimeDistributionByProject(
  startDate: string,
  endDate: string
): Promise<FirebaseOperationResult> {
  try {
    const dates = getDateRange(startDate, endDate);
    const projectDistribution: { [projectRef: string]: number } = {};

    for (const date of dates) {
      const tasksRef = collection(db, "Dailies", date, "tasks");
      const tasksSnapshot = await getDocs(tasksRef);

      for (const taskDoc of tasksSnapshot.docs) {
        const taskData = taskDoc.data();

        // Check main task
        if (
          taskData.status === "COMPLETED" &&
          taskData.completedAt &&
          taskData.startedAt
        ) {
          const completedAt = timestampToMs(taskData.completedAt);
          const startMs = new Date(startDate).getTime();
          const endMs = new Date(endDate).getTime() + 24 * 60 * 60 * 1000 - 1;

          if (completedAt >= startMs && completedAt <= endMs) {
            const startedAt = timestampToMs(taskData.startedAt);
            const duration = completedAt - startedAt;
            const project = taskData.projectRef || "No Project";

            if (!projectDistribution[project]) {
              projectDistribution[project] = 0;
            }
            projectDistribution[project] += duration;
          }
        }

        // Check subtasks (they inherit project from parent task)
        if (taskData.subtasks && Array.isArray(taskData.subtasks)) {
          for (const subtask of taskData.subtasks) {
            if (
              subtask.status === "COMPLETED" &&
              subtask.completedAt &&
              subtask.startedAt
            ) {
              const completedAt = timestampToMs(subtask.completedAt);
              const startMs = new Date(startDate).getTime();
              const endMs = new Date(endDate).getTime() + 24 * 60 * 60 * 1000 - 1;

              if (completedAt >= startMs && completedAt <= endMs) {
                const startedAt = timestampToMs(subtask.startedAt);
                const duration = completedAt - startedAt;
                const project = taskData.projectRef || "No Project"; // Inherit from parent task

                if (!projectDistribution[project]) {
                  projectDistribution[project] = 0;
                }
                projectDistribution[project] += duration;
              }
            }
          }
        }
      }
    }

    // Convert to array format for graph visualization and add readable time formats
    const distributionArray = Object.entries(projectDistribution)
      .map(([project, timeMs]) => ({
        project,
        timeMs,
        timeMinutes: Math.round((timeMs / 1000 / 60) * 100) / 100,
        timeHours: Math.round((timeMs / 1000 / 60 / 60) * 100) / 100,
      }))
      .sort((a, b) => b.timeMs - a.timeMs); // Sort by time spent (highest first)

    const totalTimeMs = Object.values(projectDistribution).reduce(
      (sum, time) => sum + time,
      0
    );
    const totalTimeHours =
      Math.round((totalTimeMs / 1000 / 60 / 60) * 100) / 100;

    return {
      success: true,
      message: `✅ Time distribution across ${distributionArray.length} projects (${totalTimeHours} total hours)`,
      data: {
        distributionArray,
        distributionObject: projectDistribution,
        totalTimeMs,
        totalTimeHours,
        startDate,
        endDate,
      },
    };
  } catch (error) {
    console.error("Error getting time distribution by project: ", error);
    return {
      success: false,
      message: `❌ Error getting time distribution: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
} 