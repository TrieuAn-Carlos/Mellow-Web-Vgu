// filepath: src/hooks/useFirestore.ts
import { useState, useEffect } from 'react';
import { 
  getDocs, 
  onSnapshot, 
  query, 
  orderBy,
  Unsubscribe 
} from 'firebase/firestore';

import {
  getDaily,
  getTasks,
  getProjects,
  getTasksByProject,
  getTasksByStatus
} from '../lib/firebase-operations';

import {
  getTasksCollection,
  projectsCollection
} from '../lib/firebase-collections';

import {
  convertDailyToClient,
  convertTaskToClient,
  convertProjectToClient
} from '../lib/firebase-converters';

import type { 
  Daily, 
  Task, 
  Project, 
  DailyClient, 
  TaskClient, 
  ProjectClient,
  TaskStatus 
} from '../types/schema';

/**
 * Custom hooks for Firestore operations with real-time updates
 */

export const useDaily = (date: Date) => {
  const [daily, setDaily] = useState<DailyClient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const mockDaily: DailyClient = {
      date: date,
      cardScannedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setDaily(mockDaily);
    setLoading(false);
  }, [date]);

  // useEffect(() => {
  //   const fetchDaily = async () => {
  //     try {
  //       setLoading(true);
  //       const dailyData = await getDaily(date);
  //       setDaily(dailyData ? convertDailyToClient(dailyData) : null);
  //     } catch (err) {
  //       setError(err instanceof Error ? err.message : 'Failed to fetch daily');
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchDaily();
  // }, [date]);

  return { daily, loading, error };
};

const mockTasks: (TaskClient & { id: string })[] = [
  {
    id: 'task-1',
    name: 'Design the homepage UI',
    status: 'COMPLETED',
    plannedAt: new Date(),
    startedAt: new Date(),
    completedAt: new Date(),
    order: 1,
    projectRef: 'project-1',
    isActive: false,
    elapsedSeconds: 3600,
    hasSubtasks: false,
  },
  {
    id: 'task-2',
    name: 'Develop the landing page',
    status: 'IN_PROGRESS',
    plannedAt: new Date(),
    startedAt: new Date(),
    completedAt: null,
    order: 2,
    projectRef: 'project-1',
    isActive: true,
    elapsedSeconds: 1800,
    hasSubtasks: true,
  },
  {
    id: 'task-3',
    name: 'Setup the CI/CD pipeline',
    status: 'NOT_STARTED',
    plannedAt: null,
    startedAt: null,
    completedAt: null,
    order: 3,
    projectRef: 'project-2',
    isActive: false,
    elapsedSeconds: 0,
    hasSubtasks: false,
  },
];

export const useTasks = (date: Date) => {
  const [tasks, setTasks] = useState<(TaskClient & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setTasks(mockTasks);
    setLoading(false);
  }, [date]);

  // useEffect(() => {
  //   const dateId = date.toISOString().split('T')[0];
  //   const tasksCollection = getTasksCollection(dateId);
  //   const q = query(tasksCollection, orderBy('order', 'asc'));

  //   const unsubscribe: Unsubscribe = onSnapshot(
  //     q,
  //     (snapshot) => {
  //       try {
  //         const tasksData = snapshot.docs.map(doc => ({
  //           id: doc.id,
  //           ...convertTaskToClient(doc.data() as Task)
  //         }));
  //         setTasks(tasksData);
  //         setLoading(false);
  //       } catch (err) {
  //         setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
  //         setLoading(false);
  //       }
  //     },
  //     (err) => {
  //       setError(err.message);
  //       setLoading(false);
  //     }
  //   );

  //   return () => unsubscribe();
  // }, [date]);

  return { tasks, loading, error };
};

const mockProjects: (ProjectClient & { id: string })[] = [
    { id: 'project-1', name: 'Mellow App', color: '#FFB6C1', description: 'A project for a wellness app.', createdAt: new Date() },
    { id: 'project-2', name: 'Portfolio Website', color: '#87CEEB', description: 'Personal portfolio page.', createdAt: new Date() },
];

export const useProjects = () => {
  const [projects, setProjects] = useState<(ProjectClient & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setProjects(mockProjects);
    setLoading(false);
  }, []);

  // useEffect(() => {
  //   const q = query(projectsCollection, orderBy('createdAt', 'desc'));

  //   const unsubscribe: Unsubscribe = onSnapshot(
  //     q,
  //     (snapshot) => {
  //       try {
  //         const projectsData = snapshot.docs.map(doc => ({
  //           id: doc.id,
  //           ...convertProjectToClient(doc.data() as Project)
  //         }));
  //         setProjects(projectsData);
  //         setLoading(false);
  //       } catch (err) {
  //         setError(err instanceof Error ? err.message : 'Failed to fetch projects');
  //         setLoading(false);
  //       }
  //     },
  //     (err) => {
  //       setError(err.message);
  //       setLoading(false);
  //     }
  //   );

  //   return () => unsubscribe();
  // }, []);

  return { projects, loading, error };
};

export const useTasksByProject = (date: Date, projectRef: string) => {
  const [tasks, setTasks] = useState<(TaskClient & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const filteredTasks = mockTasks.filter(t => t.projectRef === projectRef);
    setTasks(filteredTasks);
    setLoading(false);
  }, [date, projectRef]);

  // useEffect(() => {
  //   const fetchTasks = async () => {
  //     try {
  //       setLoading(true);
  //       const tasksData = await getTasksByProject(date, projectRef);
  //       const clientTasks = tasksData.map(task => ({
  //         id: task.id,
  //         ...convertTaskToClient(task)
  //       }));
  //       setTasks(clientTasks);
  //     } catch (err) {
  //       setError(err instanceof Error ? err.message : 'Failed to fetch tasks by project');
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchTasks();
  // }, [date, projectRef]);

  return { tasks, loading, error };
};

export const useTasksByStatus = (date: Date, status: TaskStatus) => {
  const [tasks, setTasks] = useState<(TaskClient & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const filteredTasks = mockTasks.filter(t => t.status === status);
    setTasks(filteredTasks);
    setLoading(false);
  }, [date, status]);

  // useEffect(() => {
  //   const fetchTasks = async () => {
  //     try {
  //       setLoading(true);
  //       const tasksData = await getTasksByStatus(date, status);
  //       const clientTasks = tasksData.map(task => ({
  //         id: task.id,
  //         ...convertTaskToClient(task)
  //       }));
  //       setTasks(clientTasks);
  //     } catch (err) {
  //       setError(err instanceof Error ? err.message : 'Failed to fetch tasks by status');
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchTasks();
  // }, [date, status]);

  return { tasks, loading, error };
};

/**
 * Utility hook for real-time task count by status
 */
export const useTaskStats = (date: Date) => {
  const { tasks, loading, error } = useTasks(date);

  const stats = {
    total: tasks.length,
    notStarted: tasks.filter(t => t.status === 'NOT_STARTED').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    completed: tasks.filter(t => t.status === 'COMPLETED').length,
    cancelled: tasks.filter(t => t.status === 'CANCELLED').length
  };

  return { stats, loading, error };
};
