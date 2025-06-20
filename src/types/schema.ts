// filepath: src/types/schema.ts
import { Timestamp } from 'firebase/firestore';

/**
 * Task status enumeration
 */
export type TaskStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'MEETING';

/**
 * Daily document structure
 * Document ID: YYYY-MM-DD format
 */
export interface Daily {
  /** Strongly-typed timestamp for the calendar day */
  date: Timestamp;
  
  /** If a card was scanned that day, when it happened */
  cardScannedAt: Timestamp | null;
  
  /** Metadata for audit/ordering */
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Task subcollection document structure
 * Path: Dailies/{date}/tasks/{taskId}
 */
export interface Task {
  /** Document ID */
  id: string;

  /** Basic task info */
  name: string;
  
  /** Normalized status enum – even if paused, stays IN_PROGRESS until COMPLETED */
  status: TaskStatus;
  
  /** Optional planned time */
  plannedAt: Timestamp | null;
  
  /** When the user first started the task */
  startedAt: Timestamp | null;
  
  /** When they finished it */
  completedAt: Timestamp | null;
  
  /** Keep a simple "order" field for drag-and-drop */
  order: number;
  
  /** Link back to the project document */
  projectRef: string;
  
  /** Whether this task is set as active */
  isActive: boolean;
  
  /** Total elapsed time in seconds (for pause/resume functionality) */
  elapsedSeconds: number;

  /** Array of subtasks stored as field (not subcollection) */
  subtasks?: Task[];
}

/**
 * Project document structure
 */
export interface Project {
  /** Document ID */
  id: string;

  /** Project name */
  name: string;
  
  /** Project color (hex color code) */
  color: string;
  
  /** Project description */
  description: string;
  
  /** When the project was created */
  createdAt: Timestamp;
}

/**
 * Client-side representation with string dates for easier handling
 */
export interface DailyClient extends Omit<Daily, 'date' | 'cardScannedAt' | 'createdAt' | 'updatedAt'> {
  date: Date;
  cardScannedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskClient extends Omit<Task, 'plannedAt' | 'startedAt' | 'completedAt' | 'subtasks'> {
  id: string;
  plannedAt: Date | null;
  startedAt: Date | null;
  completedAt: Date | null;
  subtasks?: TaskClient[];
}

export interface ProjectClient extends Omit<Project, 'createdAt'> {
  createdAt: Date;
}

/**
 * Utility type for creating new documents (without metadata)
 */
export type CreateDaily = Omit<Daily, 'createdAt' | 'updatedAt'>;
export type CreateTask = Omit<Task, 'startedAt' | 'completedAt' | 'id' | 'elapsedSeconds' | 'isActive'>;
export type CreateProject = Omit<Project, 'createdAt' | 'id'>;

/**
 * Interface for the visual cloud elements in the UI
 */
export interface Cloud {
  id: string;
  type: number;
  xRatio: number; 
  y: number;
  isFalling: boolean;
  isInitialFall: boolean;
}
