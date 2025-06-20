// filepath: src/lib/firebase-operations.ts
import { 
  addDoc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  serverTimestamp 
} from 'firebase/firestore';

import {
  dailiesCollection,
  projectsCollection,
  getDailyDoc,
  getProjectDoc,
  getTasksCollection,
  getTaskDoc,
  formatDateForDocId,
  createDayTimestamp
} from './firebase-collections';

import type { 
  Daily, 
  Task, 
  Project, 
  CreateDaily, 
  CreateTask, 
  CreateProject,
  TaskStatus 
} from '../types/schema';

/**
 * DAILY OPERATIONS
 */

export const createDaily = async (date: Date, cardScannedAt?: Date): Promise<void> => {
  const dateId = formatDateForDocId(date);
  const dailyData: Daily = {
    date: createDayTimestamp(date),
    cardScannedAt: cardScannedAt ? Timestamp.fromDate(cardScannedAt) : null,
    createdAt: serverTimestamp() as Timestamp,
    updatedAt: serverTimestamp() as Timestamp
  };

  await setDoc(getDailyDoc(dateId), dailyData);
};

export const getDaily = async (date: Date): Promise<Daily | null> => {
  const dateId = formatDateForDocId(date);
  const docSnap = await getDoc(getDailyDoc(dateId));
  return docSnap.exists() ? docSnap.data() : null;
};

export const updateDaily = async (date: Date, updates: Partial<Daily>): Promise<void> => {
  const dateId = formatDateForDocId(date);
  await updateDoc(getDailyDoc(dateId), {
    ...updates,
    updatedAt: serverTimestamp()
  });
};

export const updateCardScannedAt = async (date: Date, scannedAt: Date): Promise<void> => {
  await updateDaily(date, {
    cardScannedAt: Timestamp.fromDate(scannedAt)
  });
};

/**
 * TASK OPERATIONS
 */

export const createTask = async (
  date: Date, 
  taskData: Omit<CreateTask, 'order'>
): Promise<string> => {
  const dateId = formatDateForDocId(date);
  const tasksCollection = getTasksCollection(dateId);
  
  // Get current task count to set order
  const existingTasks = await getDocs(tasksCollection);
  const order = existingTasks.size + 1;

  const task: Omit<Task, 'startedAt' | 'completedAt'> = {
    ...taskData,
    order,
    startedAt: null,
    completedAt: null
  };

  const docRef = await addDoc(tasksCollection, task);
  return docRef.id;
};

export const getTask = async (date: Date, taskId: string): Promise<Task | null> => {
  const dateId = formatDateForDocId(date);
  const docSnap = await getDoc(getTaskDoc(dateId, taskId));
  return docSnap.exists() ? docSnap.data() : null;
};

export const getTasks = async (date: Date): Promise<(Task & { id: string })[]> => {
  const dateId = formatDateForDocId(date);
  const tasksCollection = getTasksCollection(dateId);
  const q = query(tasksCollection, orderBy('order', 'asc'));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const updateTask = async (
  date: Date, 
  taskId: string, 
  updates: Partial<Task>
): Promise<void> => {
  const dateId = formatDateForDocId(date);
  await updateDoc(getTaskDoc(dateId, taskId), updates);
};

export const startTask = async (date: Date, taskId: string): Promise<void> => {
  await updateTask(date, taskId, {
    status: 'IN_PROGRESS',
    startedAt: serverTimestamp() as Timestamp,
  });
};

export const completeTask = async (date: Date, taskId: string): Promise<void> => {
  await updateTask(date, taskId, {
    status: 'COMPLETED',
    completedAt: serverTimestamp() as Timestamp,
  });
};

export const updateTaskStatus = async (
  date: Date, 
  taskId: string, 
  status: TaskStatus
): Promise<void> => {
  const updates: Partial<Task> = { status };
  
  if (status === 'IN_PROGRESS' && !(await getTask(date, taskId))?.startedAt) {
    updates.startedAt = serverTimestamp() as Timestamp;
  }
  
  if (status === 'COMPLETED') {
    updates.completedAt = serverTimestamp() as Timestamp;
  }
  
  // This will now call the enhanced updateTask which adds statusUpdatedAt
  await updateTask(date, taskId, updates);
};

export const deleteTask = async (date: Date, taskId: string): Promise<void> => {
  const dateId = formatDateForDocId(date);
  await deleteDoc(getTaskDoc(dateId, taskId));
};

export const reorderTasks = async (
  date: Date, 
  taskUpdates: { id: string; order: number }[]
): Promise<void> => {
  const dateId = formatDateForDocId(date);
  
  const updatePromises = taskUpdates.map(({ id, order }) =>
    updateDoc(getTaskDoc(dateId, id), { order })
  );
  
  await Promise.all(updatePromises);
};

/**
 * PROJECT OPERATIONS
 */

export const createProject = async (projectData: CreateProject): Promise<string> => {
  const project: Project = {
    ...projectData,
    createdAt: serverTimestamp() as Timestamp
  };

  const docRef = await addDoc(projectsCollection, project);
  return docRef.id;
};

export const getProject = async (projectId: string): Promise<Project | null> => {
  const docSnap = await getDoc(getProjectDoc(projectId));
  return docSnap.exists() ? docSnap.data() : null;
};

export const getProjects = async (): Promise<(Project & { id: string })[]> => {
  const q = query(projectsCollection, orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const updateProject = async (
  projectId: string, 
  updates: Partial<Project>
): Promise<void> => {
  await updateDoc(getProjectDoc(projectId), updates);
};

export const deleteProject = async (projectId: string): Promise<void> => {
  await deleteDoc(getProjectDoc(projectId));
};

/**
 * QUERY OPERATIONS
 */

export const getTasksByProject = async (
  date: Date, 
  projectRef: string
): Promise<(Task & { id: string })[]> => {
  const dateId = formatDateForDocId(date);
  const tasksCollection = getTasksCollection(dateId);
  const q = query(
    tasksCollection, 
    where('projectRef', '==', projectRef),
    orderBy('order', 'asc')
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const getTasksByStatus = async (
  date: Date, 
  status: TaskStatus
): Promise<(Task & { id: string })[]> => {
  const dateId = formatDateForDocId(date);
  const tasksCollection = getTasksCollection(dateId);
  const q = query(
    tasksCollection, 
    where('status', '==', status),
    orderBy('order', 'asc')
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};
