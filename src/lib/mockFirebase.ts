import { TaskClient, ProjectClient } from "@/types/schema";

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock database storage key
const STORAGE_KEY = 'mock_firebase_data';

interface MockFirebaseData {
  tasks: Record<string, (TaskClient & { id: string })>;
  projects: Record<string, (ProjectClient & { id: string })>;
  dailies: Record<string, { date: Date; cardScannedAt: Date | null; createdAt: Date; updatedAt: Date }>;
}

// Initial mock data
const initialProjects: (ProjectClient & { id: string })[] = [
  {
    id: "family",
    name: "Family Stuff", 
    color: "#FFBB33",
    description: "Calls, events, and family things",
    createdAt: new Date("2025-01-10T09:00:00Z"),
  },
  {
    id: "work",
    name: "Work Tasks",
    color: "#3B82F6", 
    description: "Professional and career-related tasks",
    createdAt: new Date("2025-01-10T09:00:00Z"),
  },
  {
    id: "learning",
    name: "Learning",
    color: "#10B981",
    description: "Education and skill development", 
    createdAt: new Date("2025-01-10T09:00:00Z"),
  },
  {
    id: "health",
    name: "Health & Fitness",
    color: "#EF4444",
    description: "Exercise, medical, and wellness tasks",
    createdAt: new Date("2025-01-10T09:00:00Z"),
  },
];

const initialTasks: (TaskClient & { id: string })[] = [
  {
    id: "task1",
    name: "German for 30 minutes",
    status: "NOT_STARTED",
    plannedAt: new Date("2025-01-15T14:30:00Z"),
    startedAt: null,
    completedAt: null,
    order: 1,
    projectRef: "learning",
    isActive: false,
    elapsedSeconds: 0,
  },
  {
    id: "task2", 
    name: "Call Grandma",
    status: "IN_PROGRESS",
    plannedAt: new Date("2025-01-15T16:00:00Z"),
    startedAt: new Date("2025-01-15T16:05:00Z"),
    completedAt: null,
    order: 2,
    projectRef: "family",
    isActive: false,
    elapsedSeconds: 0,
  },
  {
    id: "task3",
    name: "Review quarterly reports", 
    status: "COMPLETED",
    plannedAt: new Date("2025-01-15T10:00:00Z"),
    startedAt: new Date("2025-01-15T10:00:00Z"),
    completedAt: new Date("2025-01-15T11:30:00Z"),
    order: 3,
    projectRef: "work",
    isActive: false,
    elapsedSeconds: 5400, // 1.5 hours = 90 minutes = 5400 seconds
  },
  {
    id: "task4",
    name: "Morning jog",
    status: "COMPLETED", 
    plannedAt: new Date("2025-01-15T07:00:00Z"),
    startedAt: new Date("2025-01-15T07:05:00Z"),
    completedAt: new Date("2025-01-15T07:45:00Z"),
    order: 4,
    projectRef: "health",
    isActive: false,
    elapsedSeconds: 2400, // 40 minutes = 2400 seconds
  },
  {
    id: "task5",
    name: "French for 30 minutes",
    status: "NOT_STARTED",
    plannedAt: new Date("2025-01-15T18:00:00Z"),
    startedAt: null,
    completedAt: null,
    order: 5,
    projectRef: "learning",
    isActive: false,
    elapsedSeconds: 0,
  },
  {
    id: "task6",
    name: "Team meeting",
    status: "NOT_STARTED",
    plannedAt: new Date("2025-01-15T15:00:00Z"),
    startedAt: null,
    completedAt: null,
    order: 6,
    projectRef: "work",
    isActive: false,
    elapsedSeconds: 0,
  },
  {
    id: "task7",
    name: "Buy groceries",
    status: "NOT_STARTED",
    plannedAt: new Date("2025-01-15T17:00:00Z"),
    startedAt: null,
    completedAt: null,
    order: 7,
    projectRef: "family",
    isActive: false,
    elapsedSeconds: 0,
  },
  {
    id: "task8",
    name: "Workout session",
    status: "NOT_STARTED",
    plannedAt: new Date("2025-01-15T19:00:00Z"),
    startedAt: null,
    completedAt: null,
    order: 8,
    projectRef: "health",
    isActive: false,
    elapsedSeconds: 0,
  },
];

class MockFirebaseService {
  private data: MockFirebaseData = {
    tasks: {},
    projects: {},
    dailies: {}
  };
  private listeners: Map<string, ((data: any) => void)[]> = new Map();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    // Check if we're on client-side (localStorage is available)
    if (typeof window === 'undefined') {
      // Server-side: use defaults
      this.initializeWithDefaults();
      return;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedData = JSON.parse(stored);
        // Convert date strings back to Date objects
        this.data = {
          tasks: Object.fromEntries(
            Object.entries(parsedData.tasks || {}).map(([id, task]: [string, any]) => [
              id,
              {
                ...task,
                plannedAt: task.plannedAt ? new Date(task.plannedAt) : null,
                startedAt: task.startedAt ? new Date(task.startedAt) : null,
                completedAt: task.completedAt ? new Date(task.completedAt) : null,
              }
            ])
          ),
          projects: Object.fromEntries(
            Object.entries(parsedData.projects || {}).map(([id, project]: [string, any]) => [
              id,
              {
                ...project,
                createdAt: new Date(project.createdAt),
              }
            ])
          ),
          dailies: Object.fromEntries(
            Object.entries(parsedData.dailies || {}).map(([id, daily]: [string, any]) => [
              id,
              {
                ...daily,
                date: new Date(daily.date),
                cardScannedAt: daily.cardScannedAt ? new Date(daily.cardScannedAt) : null,
                createdAt: new Date(daily.createdAt),
                updatedAt: new Date(daily.updatedAt),
              }
            ])
          ),
        };
      } else {
        this.initializeWithDefaults();
      }
    } catch (error) {
      console.warn('Failed to load from storage, using defaults:', error);
      this.initializeWithDefaults();
    }
  }

  private initializeWithDefaults() {
    this.data = {
      tasks: Object.fromEntries(initialTasks.map(task => [task.id, task])),
      projects: Object.fromEntries(initialProjects.map(project => [project.id, project])),
      dailies: {},
    };
    this.saveToStorage();
  }

  private saveToStorage() {
    // Check if we're on client-side (localStorage is available)
    if (typeof window === 'undefined') {
      return; // Skip saving on server-side
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (error) {
      console.warn('Failed to save to storage:', error);
    }
  }

  private notifyListeners(collection: string, data: any) {
    const collectionListeners = this.listeners.get(collection) || [];
    collectionListeners.forEach(callback => callback(data));
  }

  // Simulate Firebase onSnapshot
  onSnapshot(collection: string, callback: (data: any) => void) {
    if (!this.listeners.has(collection)) {
      this.listeners.set(collection, []);
    }
    this.listeners.get(collection)!.push(callback);

    // Initial data emission
    if (collection === 'tasks') {
      callback(Object.values(this.data.tasks));
    } else if (collection === 'projects') {
      callback(Object.values(this.data.projects));
    }

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(collection) || [];
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }

  // Task operations
  async getTasks(date?: string): Promise<(TaskClient & { id: string })[]> {
    await delay(300 + Math.random() * 500); // Simulate network delay
    
    if (Math.random() < 0.05) { // 5% chance of error
      throw new Error('Network error: Failed to fetch tasks');
    }

    return Object.values(this.data.tasks);
  }

  async createTask(task: Omit<TaskClient & { id: string }, 'id'>): Promise<TaskClient & { id: string }> {
    await delay(200 + Math.random() * 300);
    
    if (Math.random() < 0.05) {
      throw new Error('Network error: Failed to create task');
    }

    const id = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newTask = { ...task, id };
    
    this.data.tasks[id] = newTask;
    this.saveToStorage();
    this.notifyListeners('tasks', Object.values(this.data.tasks));
    
    return newTask;
  }

  async updateTask(taskId: string, updates: Partial<TaskClient>): Promise<void> {
    await delay(150 + Math.random() * 250);
    
    if (Math.random() < 0.05) {
      throw new Error('Network error: Failed to update task');
    }

    if (!this.data.tasks[taskId]) {
      throw new Error('Task not found');
    }

    this.data.tasks[taskId] = { ...this.data.tasks[taskId], ...updates };
    this.saveToStorage();
    this.notifyListeners('tasks', Object.values(this.data.tasks));
  }

  async deleteTask(taskId: string): Promise<void> {
    await delay(100 + Math.random() * 200);
    
    if (Math.random() < 0.05) {
      throw new Error('Network error: Failed to delete task');
    }

    if (!this.data.tasks[taskId]) {
      throw new Error('Task not found');
    }

    delete this.data.tasks[taskId];
    this.saveToStorage();
    this.notifyListeners('tasks', Object.values(this.data.tasks));
  }

  async setTaskActive(taskId: string, isActive: boolean): Promise<void> {
    await delay(100 + Math.random() * 200);
    
    if (Math.random() < 0.05) {
      throw new Error('Network error: Failed to update task active status');
    }

    if (!this.data.tasks[taskId]) {
      throw new Error('Task not found');
    }

    if (isActive) {
      // Find currently active task
      const currentActiveTask = Object.values(this.data.tasks).find(task => task.isActive);
      const newActiveTask = this.data.tasks[taskId];
      
      // If there's a currently active task and it's different from the new one
      if (currentActiveTask && currentActiveTask.id !== taskId) {
        // Pause the current active task - accumulate elapsed time
        if (currentActiveTask.startedAt && !currentActiveTask.completedAt) {
          const now = new Date();
          const sessionTime = Math.floor((now.getTime() - currentActiveTask.startedAt.getTime()) / 1000);
          currentActiveTask.elapsedSeconds += sessionTime;
        }
        
        // Deactivate the old task and pause its timer
        currentActiveTask.isActive = false;
        currentActiveTask.status = 'NOT_STARTED'; // Paused state
        currentActiveTask.startedAt = null; // Clear start time for paused task
      }
      
      // Reorder: move new active task to position 1, shift others down
      const newActiveOrder = newActiveTask.order;
      Object.values(this.data.tasks).forEach(task => {
        if (task.id !== taskId && task.order < newActiveOrder) {
          task.order += 1; // Shift down tasks that were before the new active task
        }
      });
      newActiveTask.order = 1; // Active task gets position 1
      
      // Deactivate all other tasks
      Object.values(this.data.tasks).forEach(task => {
        if (task.id !== taskId) {
          task.isActive = false;
        }
      });
      
      // Activate the new task and start/resume timer
      newActiveTask.isActive = true;
      newActiveTask.status = 'IN_PROGRESS';
      newActiveTask.startedAt = new Date(); // Fresh start time for current session
      newActiveTask.completedAt = null;
    } else {
      // Pause the task - accumulate elapsed time
      const task = this.data.tasks[taskId];
      if (task.startedAt && !task.completedAt) {
        const now = new Date();
        const sessionTime = Math.floor((now.getTime() - task.startedAt.getTime()) / 1000);
        task.elapsedSeconds += sessionTime;
      }
      
      // Deactivate the task
      task.isActive = false;
      task.status = 'NOT_STARTED'; // Paused state
      task.startedAt = null; // Clear start time for paused task
    }

    this.saveToStorage();
    this.notifyListeners('tasks', Object.values(this.data.tasks));
  }

  // Project operations
  async getProjects(): Promise<(ProjectClient & { id: string })[]> {
    await delay(200 + Math.random() * 300);
    
    if (Math.random() < 0.03) {
      throw new Error('Network error: Failed to fetch projects');
    }

    return Object.values(this.data.projects);
  }

  async createProject(project: Omit<ProjectClient & { id: string }, 'id'>): Promise<ProjectClient & { id: string }> {
    await delay(200 + Math.random() * 300);
    
    if (Math.random() < 0.05) {
      throw new Error('Network error: Failed to create project');
    }

    const id = `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newProject = { ...project, id };
    
    this.data.projects[id] = newProject;
    this.saveToStorage();
    this.notifyListeners('projects', Object.values(this.data.projects));
    
    return newProject;
  }

  // Batch operations
  async batchUpdate(operations: Array<{
    type: 'create' | 'update' | 'delete';
    collection: 'tasks' | 'projects';
    id?: string;
    data?: any;
  }>): Promise<void> {
    await delay(300 + Math.random() * 500);
    
    if (Math.random() < 0.08) {
      throw new Error('Network error: Batch operation failed');
    }

    for (const op of operations) {
      switch (op.type) {
        case 'create':
          if (op.collection === 'tasks') {
            const id = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            this.data.tasks[id] = { ...op.data, id };
          }
          break;
        case 'update':
          if (op.collection === 'tasks' && op.id) {
            this.data.tasks[op.id] = { ...this.data.tasks[op.id], ...op.data };
          }
          break;
        case 'delete':
          if (op.collection === 'tasks' && op.id) {
            delete this.data.tasks[op.id];
          }
          break;
      }
    }

    this.saveToStorage();
    this.notifyListeners('tasks', Object.values(this.data.tasks));
    this.notifyListeners('projects', Object.values(this.data.projects));
  }

  // Simulate connection status
  isOnline(): boolean {
    return Math.random() > 0.02; // 98% uptime
  }

  // Clear all data (for testing)
  async clearAllData(): Promise<void> {
    await delay(100);
    this.data = { tasks: {}, projects: {}, dailies: {} };
    this.saveToStorage();
    this.notifyListeners('tasks', []);
    this.notifyListeners('projects', []);
  }

  // Reset to initial data
  async resetToDefaults(): Promise<void> {
    await delay(200);
    this.initializeWithDefaults();
    this.notifyListeners('tasks', Object.values(this.data.tasks));
    this.notifyListeners('projects', Object.values(this.data.projects));
  }
}

// Export singleton instance
export const mockFirebase = new MockFirebaseService();

// Export types
export type { MockFirebaseData }; 