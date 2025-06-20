import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  doc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Unsubscribe,
  getDoc,
  limit,
} from "firebase/firestore";
import { db } from "./firebase";
import { getTasksCollection, formatDateForDocId, getSubtasksCollection } from "./firebase-collections";
import { Task } from "../types/schema";

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

/**
 * Tests if the Firestore database connection works.
 * It tries to create a test document in a "test" collection and returns a result indicating success or failure.
 */
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

/**
 * Finds the most recent task (or subtask) that's in progress for today.
 * This function now queries Firestore directly for IN_PROGRESS tasks,
 * ordering them by 'startedAt' descending and taking only the latest one.
 */
export async function findCurrentInProgressTask(): Promise<FirebaseOperationResult> {
  try {
    const todayDate = formatDateForDocId(new Date());
    const tasksRef = getTasksCollection(todayDate);
    
    console.log(`[FIREBASE] Searching for IN_PROGRESS tasks in collection: Dailies/${todayDate}/tasks`);

    // Query for the most recent IN_PROGRESS task.
    const q = query(
      tasksRef,
      where("status", "==", "IN_PROGRESS"),
      orderBy("startedAt", "desc"),
      limit(1)
    );

    console.log(`[FIREBASE] Executing query: where("status", "==", "IN_PROGRESS"), orderBy("startedAt", "desc"), limit(1)`);
    const querySnapshot = await getDocs(q);
    console.log(`[FIREBASE] Query returned ${querySnapshot.docs.length} documents`);

    if (querySnapshot.empty) {
      console.log(`[FIREBASE] No IN_PROGRESS tasks found for today (${todayDate})`);
      return {
        success: true,
        message: "📋 No tasks currently in progress for today.",
        data: null,
      };
    }

    const mostRecentTaskDoc = querySnapshot.docs[0];
    const taskData = mostRecentTaskDoc.data();
    
    console.log(`[FIREBASE] Found task document:`, {
      id: mostRecentTaskDoc.id,
      name: taskData.name,
      status: taskData.status,
      startedAt: taskData.startedAt,
      hasStartedAt: !!taskData.startedAt
    });

    // Although we query for one, let's build a proper CurrentTaskData object.
    // This can be expanded to check for in-progress subtasks within this task if the model requires.
    const mostRecentTask: CurrentTaskData = {
      id: mostRecentTaskDoc.id,
      name: taskData.name,
      startedAt: taskData.startedAt,
      type: "task", // Assuming main task for now
      path: `Dailies/${todayDate}/tasks/${mostRecentTaskDoc.id}`,
    };
    
    console.log(`[FIREBASE] Created CurrentTaskData object:`, mostRecentTask);
    
    const displayName = mostRecentTask.name;

    return {
      success: true,
      message: `🎯 Current task in progress: "${displayName}"`,
      data: {
        task: mostRecentTask,
        reference: mostRecentTask.path,
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

/**
 * Sets up a real-time listener for changes to today's tasks.
 * Whenever the task data changes in Firestore, it re-runs `findCurrentInProgressTask`
 * and calls your callback (`onTaskUpdate`) with the updated info if the current in-progress task has changed.
 */
export function monitorCurrentInProgressTask(
  onTaskUpdate: TaskUpdateCallback,
  targetDate?: string
): Unsubscribe {
  const today = targetDate || formatDateForDocId(new Date());
  const tasksRef = getTasksCollection(today);

  let lastInProgressTaskId: string | null = null;
  let lastInProgressTaskPath: string | null = null;

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
        const currentTaskPath = currentInProgressTask?.path || null;

        // Check if the current in-progress task has changed
        const hasChanged =
          lastInProgressTaskId !== currentTaskId ||
          lastInProgressTaskPath !== currentTaskPath;

        if (hasChanged) {
          // Update tracking variables
          lastInProgressTaskId = currentTaskId;
          lastInProgressTaskPath = currentTaskPath;

          // Notify about the change
          if (currentInProgressTask) {
            const displayName =
              currentInProgressTask.type === "subtask"
                ? `${currentInProgressTask.parentTask} → ${currentInProgressTask.name}`
                : currentInProgressTask.name;

            onTaskUpdate({
              success: true,
              message: `🔄 In-progress task updated: "${displayName}"`,
              data: {
                task: currentInProgressTask,
                reference: currentInProgressTask.path,
                changeType:
                  lastInProgressTaskId === null ? "started" : "switched",
              },
              currentTask: currentInProgressTask,
            });
          } else {
            onTaskUpdate({
              success: true,
              message: "📋 No task currently in progress",
              data: {
                task: null,
                reference: null,
                changeType: "stopped",
              },
              currentTask: undefined,
            });
          }
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

/**
 * Initializes task monitoring with both an initial snapshot of the current in-progress task
 * and a real-time listener for updates.
 * @returns An `unsubscribe` function and the initial task result.
 */
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

/**
 * Helper function.
 * Generates an array of date strings (`YYYY-MM-DD`) for every day between a `startDate` and `endDate` (inclusive).
 * @internal
 */
function getDateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(formatDateForDocId(d));
  }

  return dates;
}

/**
 * Helper function.
 * Converts a Firestore timestamp (or date object, or date string) into milliseconds since the Unix epoch.
 * @internal
 */
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

/**
 * Calculates the total number of completed tasks ("Mellows") between two dates.
 * Counts both completed parent tasks and subtasks, checking that `completedAt` falls within the date range.
 */
export async function getTotalMellowsInTimeframe(
  startDate: string,
  endDate: string
): Promise<FirebaseOperationResult> {
  try {
    const dates = getDateRange(startDate, endDate);
    let totalCompleted = 0;

    for (const date of dates) {
      // Query tasks for this date
      const tasksRef = collection(db, "Dailies", date, "tasks");
      const tasksSnapshot = await getDocs(tasksRef);

      for (const taskDoc of tasksSnapshot.docs) {
        const taskData = taskDoc.data();

        // Check main task
        if (taskData.status === "COMPLETED" && taskData.completedAt) {
          const completedAt = timestampToMs(taskData.completedAt);
          const startMs = new Date(startDate).getTime();
          const endMs = new Date(endDate).getTime() + 24 * 60 * 60 * 1000 - 1; // End of day

          if (completedAt >= startMs && completedAt <= endMs) {
            totalCompleted++;
          }
        }

        // Check subtasks if they exist
        if (taskData.hasSubtasks) {
          const subtasksRef = collection(
            db,
            "Dailies",
            date,
            "tasks",
            taskDoc.id,
            "subtasks"
          );
          const subtasksSnapshot = await getDocs(subtasksRef);

          for (const subtaskDoc of subtasksSnapshot.docs) {
            const subtaskData = subtaskDoc.data();

            if (subtaskData.status === "COMPLETED" && subtaskData.completedAt) {
              const completedAt = timestampToMs(subtaskData.completedAt);
              const startMs = new Date(startDate).getTime();
              const endMs =
                new Date(endDate).getTime() + 24 * 60 * 60 * 1000 - 1;

              if (completedAt >= startMs && completedAt <= endMs) {
                totalCompleted++;
              }
            }
          }
        }
      }
    }

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

/**
 * Computes the total focus time (in ms, seconds, minutes, hours) for all completed tasks
 * and subtasks in the specified date range.
 * Focus time = `completedAt - startedAt` for each completed task/subtask.
 */
export async function getTotalFocusTime(
  startDate: string,
  endDate: string
): Promise<FirebaseOperationResult> {
  try {
    const dates = getDateRange(startDate, endDate);
    let totalFocusTimeMs = 0;

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
            totalFocusTimeMs += completedAt - startedAt;
          }
        }

        // Check subtasks
        if (taskData.hasSubtasks) {
          const subtasksRef = collection(
            db,
            "Dailies",
            date,
            "tasks",
            taskDoc.id,
            "subtasks"
          );
          const subtasksSnapshot = await getDocs(subtasksRef);

          for (const subtaskDoc of subtasksSnapshot.docs) {
            const subtaskData = subtaskDoc.data();

            if (
              subtaskData.status === "COMPLETED" &&
              subtaskData.completedAt &&
              subtaskData.startedAt
            ) {
              const completedAt = timestampToMs(subtaskData.completedAt);
              const startMs = new Date(startDate).getTime();
              const endMs =
                new Date(endDate).getTime() + 24 * 60 * 60 * 1000 - 1;

              if (completedAt >= startMs && completedAt <= endMs) {
                const startedAt = timestampToMs(subtaskData.startedAt);
                totalFocusTimeMs += completedAt - startedAt;
              }
            }
          }
        }
      }
    }

    // Convert to more readable formats
    const totalFocusTimeSeconds = Math.round(totalFocusTimeMs / 1000);
    const totalFocusTimeMinutes = Math.round(totalFocusTimeSeconds / 60);
    const totalFocusTimeHours =
      Math.round((totalFocusTimeMinutes / 60) * 100) / 100; // 2 decimal places

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

/**
 * Calculates the average duration (in ms, minutes, hours) for completed tasks and subtasks in the specified timeframe.
 * Average is computed only for tasks/subtasks with both `startedAt` and `completedAt`.
 */
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

        // Check subtasks
        if (taskData.hasSubtasks) {
          const subtasksRef = collection(
            db,
            "Dailies",
            date,
            "tasks",
            taskDoc.id,
            "subtasks"
          );
          const subtasksSnapshot = await getDocs(subtasksRef);

          for (const subtaskDoc of subtasksSnapshot.docs) {
            const subtaskData = subtaskDoc.data();

            if (
              subtaskData.status === "COMPLETED" &&
              subtaskData.completedAt &&
              subtaskData.startedAt
            ) {
              const completedAt = timestampToMs(subtaskData.completedAt);
              const startMs = new Date(startDate).getTime();
              const endMs =
                new Date(endDate).getTime() + 24 * 60 * 60 * 1000 - 1;

              if (completedAt >= startMs && completedAt <= endMs) {
                const startedAt = timestampToMs(subtaskData.startedAt);
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

/**
 * Determines how your focus time is distributed across different projects over the date range.
 * Sums up duration for completed tasks (and their subtasks) by their `projectRef`, returning totals per project.
 */
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
        if (taskData.hasSubtasks) {
          const subtasksRef = collection(
            db,
            "Dailies",
            date,
            "tasks",
            taskDoc.id,
            "subtasks"
          );
          const subtasksSnapshot = await getDocs(subtasksRef);

          for (const subtaskDoc of subtasksSnapshot.docs) {
            const subtaskData = subtaskDoc.data();

            if (
              subtaskData.status === "COMPLETED" &&
              subtaskData.completedAt &&
              subtaskData.startedAt
            ) {
              const completedAt = timestampToMs(subtaskData.completedAt);
              const startMs = new Date(startDate).getTime();
              const endMs =
                new Date(endDate).getTime() + 24 * 60 * 60 * 1000 - 1;

              if (completedAt >= startMs && completedAt <= endMs) {
                const startedAt = timestampToMs(subtaskData.startedAt);
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

/**
 * Sets up a real-time listener for tasks on a specific date.
 *
 * @param date The date to listen for task changes on.
 * @param callback A function to be called with the updated tasks array whenever changes occur.
 * @returns A function to unsubscribe from the listener.
 */
export const onTasksUpdate = (
  date: Date,
  callback: (tasks: Task[]) => void
) => {
  const dateId = formatDateForDocId(date);
  console.log('🔗 [onTasksUpdate] Setting up listener for dateId:', dateId);
  
  const tasksCollectionRef = getTasksCollection(dateId);
  const q = query(tasksCollectionRef, orderBy("order"));

  const unsubscribe = onSnapshot(
    q,
    { includeMetadataChanges: false }, // Options parameter for reducing unnecessary triggers
    (querySnapshot) => {
      console.log('📡 [onTasksUpdate] Snapshot received with', querySnapshot.docs.length, 'docs');
      
      const tasks = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        // Overwrite any 'id' field in the data with the actual document ID
        const task = {
          ...data,
          id: doc.id,
        } as Task;
        
        console.log('📄 [onTasksUpdate] Task:', task.id, task.name, 'status:', task.status);
        return task;
      });
      
      console.log('🚀 [onTasksUpdate] Calling callback with', tasks.length, 'tasks');
      callback(tasks);
    },
    (error) => {
      console.error('❌ [onTasksUpdate] Error listening to tasks for date', dateId, ':', error);
      // Optionally, you could have a more robust error handling callback
    }
  );

  console.log('✅ [onTasksUpdate] Listener setup complete');
  return unsubscribe;
}; 