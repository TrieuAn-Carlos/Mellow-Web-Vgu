// filepath: src/lib/firebase-collections.ts
import { 
  collection, 
  doc, 
  CollectionReference, 
  DocumentReference,
  Timestamp,
  getDocs,
  query,
  orderBy,
  updateDoc,
  writeBatch,
  addDoc,
  deleteDoc,
  getDoc
} from 'firebase/firestore';
import { db } from './firebase';
import type { Daily, Task, Project, TaskStatus, CreateTask, CreateProject } from '../types/schema';

/**
 * Collection references for type-safe Firestore operations
 */

// Main collections
export const dailiesCollection = collection(db, 'Dailies') as CollectionReference<Daily>;
export const projectsCollection = collection(db, 'Projects') as CollectionReference<Project>;

// Helper functions for document references
export const getDailyDoc = (dateId: string) => 
  doc(dailiesCollection, dateId) as DocumentReference<Daily>;

export const getProjectDoc = (projectId: string) => 
  doc(projectsCollection, projectId) as DocumentReference<Project>;

// Helper function for tasks subcollection
export const getTasksCollection = (dateId: string) => 
  collection(getDailyDoc(dateId), 'tasks') as CollectionReference<Task>;

export const getTaskDoc = (dateId: string, taskId: string) => 
  doc(getTasksCollection(dateId), taskId) as DocumentReference<Task>;

// Helper function for subtasks subcollection
export const getSubtasksCollection = (dateId: string, taskId: string) =>
  collection(getTaskDoc(dateId, taskId), 'subtasks') as CollectionReference<Task>;

/**
 * Fetches all tasks for a given date, ordered by the 'order' field.
 * @param date The date for which to fetch tasks.
 * @returns A promise that resolves to an array of tasks.
 */
export const getTasksForDate = async (date: Date): Promise<Task[]> => {
  const dateId = formatDateForDocId(date);
  const tasksCollectionRef = getTasksCollection(dateId);
  const q = query(tasksCollectionRef, orderBy('order'));
  
  try {
    const querySnapshot = await getDocs(q);
    const tasks = await Promise.all(
      querySnapshot.docs.map(async (doc) => {
        const taskData = {
          ...doc.data(),
          id: doc.id,
        } as Task;

        // Fetch subtasks from the subcollection
        try {
          const subtasksCollectionRef = getSubtasksCollection(dateId, doc.id);
          const subtasksQuery = query(subtasksCollectionRef, orderBy('order'));
          const subtasksSnapshot = await getDocs(subtasksQuery);
          
          const subtasks = subtasksSnapshot.docs.map(subtaskDoc => ({
            ...subtaskDoc.data(),
            id: subtaskDoc.id,
          } as Task));

          // Add subtasks array to task data for compatibility
          taskData.subtasks = subtasks;
        } catch (subtaskError) {
          console.error(`Error fetching subtasks for task ${doc.id}:`, subtaskError);
          taskData.subtasks = [];
        }

        return taskData;
      })
    );
    return tasks;
  } catch (error) {
    console.error(`Error fetching tasks for date ${dateId}:`, error);
    return []; // Return an empty array on error
  }
};

/**
 * Updates the status of a specific task.
 * @param date The date of the task's daily document.
 * @param taskId The ID of the task to update.
 * @param status The new status to set.
 */
export const updateTaskStatus = async (date: Date, taskId: string, status: TaskStatus): Promise<void> => {
  const dateId = formatDateForDocId(date);
  const taskRef = getTaskDoc(dateId, taskId);
  
  const updateData: { status: TaskStatus; completedAt?: Timestamp } = { status };
  if (status === 'COMPLETED') {
    updateData.completedAt = Timestamp.now();
  }

  try {
    await updateDoc(taskRef, updateData);
  } catch (error) {
    console.error(`Error updating task ${taskId} to status ${status}:`, error);
    throw error; // Re-throw to be handled by the caller
  }
};

/**
 * Resets the status of all tasks for a given date to 'NOT_STARTED'.
 * @param date The date for which to reset tasks.
 */
export const resetAllTasksForDate = async (date: Date): Promise<void> => {
  const dateId = formatDateForDocId(date);
  const tasksCollectionRef = getTasksCollection(dateId);
  
  try {
    const querySnapshot = await getDocs(tasksCollectionRef);
    const batch = writeBatch(db);

    querySnapshot.forEach(doc => {
      batch.update(doc.ref, { status: 'NOT_STARTED', completedAt: null });
    });

    await batch.commit();
  } catch (error) {
    console.error(`Error resetting tasks for date ${dateId}:`, error);
    throw error;
  }
};

/**
 * Utility functions for date formatting
 */

/**
 * Creates a YYYY-MM-DD string from a Date object based on the user's local timezone,
 * not UTC. This is crucial for matching document IDs like '2025-06-20'.
 * @param date The local date.
 * @returns A string in YYYY-MM-DD format.
 */
const getLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const formatDateForDocId = (date: Date): string => {
  // OLD: return date.toISOString().split('T')[0]; // This converted to UTC, causing timezone bugs.
  // NEW: Use a helper that respects the local date.
  return getLocalDateString(date);
};

export const createDayTimestamp = (date: Date): Timestamp => {
  // Create timestamp for start of day (00:00:00Z)
  const dayStart = new Date(date);
  dayStart.setUTCHours(0, 0, 0, 0);
  return Timestamp.fromDate(dayStart);
};

/**
 * Collection paths as constants
 */
export const COLLECTION_PATHS = {
  DAILIES: 'Dailies',
  TASKS: 'tasks', // subcollection name
  PROJECTS: 'Projects'
} as const;

/**
 * Fetches all projects.
 * @returns A promise that resolves to an array of projects.
 */
export const getProjects = async (): Promise<Project[]> => {
  try {
    const querySnapshot = await getDocs(projectsCollection);
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
    } as Project));
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
};

/**
 * Adds a new project to the Projects collection.
 * @param projectData The data for the new project.
 * @returns A promise that resolves to the new project document reference.
 */
export const addProject = async (projectData: CreateProject) => {
  const dataWithTimestamp = {
    ...projectData,
    createdAt: Timestamp.now()
  };
  try {
    const docRef = await addDoc(projectsCollection, dataWithTimestamp);
    return docRef;
  } catch (error) {
    console.error("Error adding project:", error);
    throw error;
  }
};

/**
 * Adds a new task to a specific daily document.
 * @param date The date of the daily document.
 * @param taskData The data for the new task.
 * @returns A promise that resolves to the new task document reference.
 */
export const addTask = async (date: Date, taskData: CreateTask): Promise<string> => {
  const dateId = formatDateForDocId(date);
  const docRef = await addDoc(getTasksCollection(dateId), taskData);
  return docRef.id;
};

/**
 * Updates a specific task.
 * @param date The date of the task's daily document.
 * @param taskId The ID of the task to update.
 * @param updates The fields to update.
 */
export const updateTask = async (date: Date, taskId: string, updates: Partial<Task>) => {
  const dateId = formatDateForDocId(date);
  const taskRef = getTaskDoc(dateId, taskId);
  try {
    await updateDoc(taskRef, updates);
  } catch (error) {
    console.error(`Error updating task ${taskId}:`, error);
    throw error;
  }
};

/**
 * Deletes a specific task.
 * @param date The date of the task's daily document.
 * @param taskId The ID of the task to delete.
 */
export const deleteTask = async (date: Date, taskId: string) => {
  const dateId = formatDateForDocId(date);
  const taskRef = getTaskDoc(dateId, taskId);
  try {
    await deleteDoc(taskRef);
  } catch (error) {
    console.error(`Error deleting task ${taskId}:`, error);
    throw error;
  }
};

/**
 * Fetches all subtasks for a given task from the task document field.
 * @param date The date of the parent task's daily document.
 * @param taskId The ID of the parent task.
 * @returns A promise that resolves to an array of subtasks.
 */
export const getSubtasks = async (date: Date, taskId: string): Promise<Task[]> => {
  const dateId = formatDateForDocId(date);
  const taskRef = getTaskDoc(dateId, taskId);
  
  try {
    const taskDoc = await getDoc(taskRef);
    if (!taskDoc.exists()) {
      return [];
    }
    
    const taskData = taskDoc.data() as Task;
    const subtasks = taskData.subtasks || [];
    
    return subtasks;
  } catch (error) {
    console.error(`Error fetching subtasks for task ${taskId}:`, error);
    return [];
  }
};

/**
 * Adds a new subtask to a specific parent task's subtasks field.
 * @param date The date of the parent task's daily document.
 * @param taskId The ID of the parent task.
 * @param subtaskData The data for the new subtask.
 */
export const addSubtask = async (date: Date, taskId: string, subtaskData: CreateTask): Promise<string> => {
  const dateId = formatDateForDocId(date);
  const subtasksRef = getSubtasksCollection(dateId, taskId);
  const docRef = await addDoc(subtasksRef, subtaskData);
  return docRef.id;
};

/**
 * Updates a specific subtask in the parent task's subtasks field.
 * @param date The date of the parent task's daily document.
 * @param taskId The ID of the parent task.
 * @param subtaskId The ID of the subtask to update.
 * @param updates The fields to update.
 */
export const updateSubtask = async (date: Date, taskId: string, subtaskId: string, updates: Partial<Task>) => {
  const dateId = formatDateForDocId(date);
  const parentTaskRef = getTaskDoc(dateId, taskId);
  
  try {
    // Get current task document
    const taskDoc = await getDoc(parentTaskRef);
    if (!taskDoc.exists()) {
      throw new Error(`Task ${taskId} does not exist`);
    }
    
    const taskData = taskDoc.data() as Task;
    const currentSubtasks = taskData.subtasks || [];
    
    // Find and update the specific subtask
    const updatedSubtasks = currentSubtasks.map(subtask => {
      if (subtask.id === subtaskId) {
        return { ...subtask, ...updates };
      }
      return subtask;
    });
    
    // Update parent task with modified subtasks array
    await updateDoc(parentTaskRef, { subtasks: updatedSubtasks });
    

  } catch (error) {
    console.error(`Error updating subtask ${subtaskId}:`, error);
    throw error;
  }
};

/**
 * Deletes a specific subtask from the parent task's subtasks field.
 * @param date The date of the parent task's daily document.
 * @param taskId The ID of the parent task.
 * @param subtaskId The ID of the subtask to delete.
 */
export const deleteSubtask = async (date: Date, taskId: string, subtaskId: string) => {
  const dateId = formatDateForDocId(date);
  const parentTaskRef = getTaskDoc(dateId, taskId);
  
  try {
    // Get current task document
    const taskDoc = await getDoc(parentTaskRef);
    if (!taskDoc.exists()) {
      throw new Error(`Task ${taskId} does not exist`);
    }
    
    const taskData = taskDoc.data() as Task;
    const currentSubtasks = taskData.subtasks || [];
    
    // Remove the specific subtask
    const updatedSubtasks = currentSubtasks.filter(subtask => subtask.id !== subtaskId);
    
    // Update parent task with filtered subtasks array
    await updateDoc(parentTaskRef, { 
      subtasks: updatedSubtasks,
    });
    
  } catch (error) {
    console.error(`Error deleting subtask ${subtaskId}:`, error);
    throw error;
  }
};
