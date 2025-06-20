import { TaskClient, ProjectClient } from '@/types/schema';

export const mockProjects: (ProjectClient & { id: string })[] = [
  {
    id: 'proj1',
    name: 'German Learning',
    color: '#FFEC75',
    description: 'Daily German language practice and study',
    createdAt: new Date('2024-01-15')
  },
  {
    id: 'proj2',
    name: 'Fitness & Health',
    color: '#4ECDC4',
    description: 'Physical exercise and wellness activities',
    createdAt: new Date('2024-01-10')
  },
  {
    id: 'proj3',
    name: 'Work Projects',
    color: '#FF6B6B',
    description: 'Professional tasks and development',
    createdAt: new Date('2024-01-12')
  },
  {
    id: 'proj4',
    name: 'Personal Growth',
    color: '#A8E6CF',
    description: 'Self-improvement and learning',
    createdAt: new Date('2024-01-08')
  },
  {
    id: 'proj5',
    name: 'Creative Projects',
    color: '#DDA0DD',
    description: 'Art, music, and creative endeavors',
    createdAt: new Date('2024-01-20')
  }
];

const now = new Date();
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

export const mockTasks: (TaskClient & { id: string })[] = [
  {
    id: 'task1',
    name: 'German for 30 minutes',
    status: 'COMPLETED',
    plannedAt: new Date(today.getTime() + 9 * 60 * 60 * 1000),
    startedAt: new Date(today.getTime() + 9 * 60 * 60 * 1000),
    completedAt: new Date(today.getTime() + 9.5 * 60 * 60 * 1000),
    order: 1,
    projectRef: 'proj1'
  },
  {
    id: 'task2',
    name: 'German for 30 minutes',
    status: 'COMPLETED',
    plannedAt: new Date(today.getTime() + 7 * 60 * 60 * 1000),
    startedAt: new Date(today.getTime() + 7 * 60 * 60 * 1000),
    completedAt: new Date(today.getTime() + 7.5 * 60 * 60 * 1000),
    order: 2,
    projectRef: 'proj1'
  },
  {
    id: 'task3',
    name: 'German for 30 minutes',
    status: 'IN_PROGRESS',
    plannedAt: new Date(today.getTime() + 10 * 60 * 60 * 1000),
    startedAt: new Date(today.getTime() + 10 * 60 * 60 * 1000),
    completedAt: null,
    order: 3,
    projectRef: 'proj1'
  },
  {
    id: 'task4',
    name: 'German for 30 minutes',
    status: 'NOT_STARTED',
    plannedAt: new Date(today.getTime() + 14 * 60 * 60 * 1000),
    startedAt: null,
    completedAt: null,
    order: 4,
    projectRef: 'proj1'
  },
  {
    id: 'task5',
    name: 'German for 30 minutes',
    status: 'NOT_STARTED',
    plannedAt: new Date(today.getTime() + 16 * 60 * 60 * 1000),
    startedAt: null,
    completedAt: null,
    order: 5,
    projectRef: 'proj1'
  },
  {
    id: 'task6',
    name: 'German for 30 minutes',
    status: 'COMPLETED',
    plannedAt: new Date(today.getTime() + 8 * 60 * 60 * 1000),
    startedAt: new Date(today.getTime() + 8 * 60 * 60 * 1000),
    completedAt: new Date(today.getTime() + 8.5 * 60 * 60 * 1000),
    order: 6,
    projectRef: 'proj1'
  },
  {
    id: 'task7',
    name: 'German for 30 minutes',
    status: 'IN_PROGRESS',
    plannedAt: new Date(today.getTime() + 18 * 60 * 60 * 1000),
    startedAt: new Date(today.getTime() + 18 * 60 * 60 * 1000),
    completedAt: null,
    order: 7,
    projectRef: 'proj1'
  },
  {
    id: 'task8',
    name: 'German for 30 minutes',
    status: 'NOT_STARTED',
    plannedAt: new Date(today.getTime() + 15 * 60 * 60 * 1000),
    startedAt: null,
    completedAt: null,
    order: 8,
    projectRef: 'proj1'
  },
  {
    id: 'task9',
    name: 'German for 30 minutes',
    status: 'NOT_STARTED',
    plannedAt: new Date(today.getTime() + 20 * 60 * 60 * 1000),
    startedAt: null,
    completedAt: null,
    order: 9,
    projectRef: 'proj1'
  },
  {
    id: 'task10',
    name: 'German for 30 minutes',
    status: 'NOT_STARTED',
    plannedAt: new Date(today.getTime() + 22 * 60 * 60 * 1000),
    startedAt: null,
    completedAt: null,
    order: 10,
    projectRef: 'proj1'
  }
];

export const getMockTasksForToday = () => {
  return mockTasks;
};

export const getMockProjects = () => {
  return mockProjects;
};

export const getMockTaskStats = () => {
  const totalTasks = mockTasks.length;
  const completedTasks = mockTasks.filter(task => task.status === 'COMPLETED').length;
  const inProgressTasks = mockTasks.filter(task => task.status === 'IN_PROGRESS').length;
  const notStartedTasks = mockTasks.filter(task => task.status === 'NOT_STARTED').length;

  return {
    total: totalTasks,
    completed: completedTasks,
    inProgress: inProgressTasks,
    notStarted: notStartedTasks,
    completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  };
}; 