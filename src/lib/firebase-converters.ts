// filepath: src/lib/firebase-converters.ts
import { Timestamp } from 'firebase/firestore';
import type { 
  Daily, 
  Task, 
  Project, 
  DailyClient, 
  TaskClient, 
  ProjectClient 
} from '../types/schema';

/**
 * Converters to transform Firestore Timestamp objects to JavaScript Date objects
 * for easier client-side handling
 */

export const convertDailyToClient = (daily: Daily): DailyClient => ({
  date: daily.date.toDate(),
  cardScannedAt: daily.cardScannedAt?.toDate() || null,
  createdAt: daily.createdAt.toDate(),
  updatedAt: daily.updatedAt.toDate()
});

export const convertTaskToClient = (task: Task): TaskClient => ({
  name: task.name,
  status: task.status,
  plannedAt: task.plannedAt?.toDate() || null,
  startedAt: task.startedAt?.toDate() || null,
  completedAt: task.completedAt?.toDate() || null,
  order: task.order,
  projectRef: task.projectRef
});

export const convertProjectToClient = (project: Project): ProjectClient => ({
  name: project.name,
  color: project.color,
  description: project.description,
  createdAt: project.createdAt.toDate()
});

/**
 * Converters to transform client Date objects back to Firestore Timestamp objects
 */

export const convertDailyFromClient = (daily: DailyClient): Daily => ({
  date: Timestamp.fromDate(daily.date),
  cardScannedAt: daily.cardScannedAt ? Timestamp.fromDate(daily.cardScannedAt) : null,
  createdAt: Timestamp.fromDate(daily.createdAt),
  updatedAt: Timestamp.fromDate(daily.updatedAt)
});

export const convertTaskFromClient = (task: TaskClient): Task => ({
  name: task.name,
  status: task.status,
  plannedAt: task.plannedAt ? Timestamp.fromDate(task.plannedAt) : null,
  startedAt: task.startedAt ? Timestamp.fromDate(task.startedAt) : null,
  completedAt: task.completedAt ? Timestamp.fromDate(task.completedAt) : null,
  order: task.order,
  projectRef: task.projectRef
});

export const convertProjectFromClient = (project: ProjectClient): Project => ({
  name: project.name,
  color: project.color,
  description: project.description,
  createdAt: Timestamp.fromDate(project.createdAt)
});

/**
 * Utility functions for common date operations
 */

export const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

export const formatDateForDisplay = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatTimeForDisplay = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getTaskDuration = (task: TaskClient): number | null => {
  if (!task.startedAt || !task.completedAt) return null;
  return task.completedAt.getTime() - task.startedAt.getTime();
};

export const formatDuration = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
};
