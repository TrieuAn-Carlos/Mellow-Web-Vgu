/**
 * Jest tests for Firebase schema implementation
 * These tests validate the schema structure and utility functions
 */

import { Timestamp } from 'firebase/firestore';
import {
  formatDateForDocId,
  createDayTimestamp,
  getDailiesCollectionRef,
  getTasksCollectionRef,
  getProjectsCollectionRef
} from '../firebase-collections';

import {
  convertDailyToClient,
  convertTaskToClient,
  convertProjectToClient,
  getTaskDuration,
  formatDuration
} from '../firebase-converters';

import type { Daily, Task, Project, TaskStatus } from '../../types/schema';

describe('Firebase Schema Tests', () => {
  describe('Date Utilities', () => {
    test('formatDateForDocId should format date correctly', () => {
      const testDate = new Date('2025-05-11T14:30:00Z');
      const result = formatDateForDocId(testDate);
      expect(result).toBe('2025-05-11');
    });

    test('createDayTimestamp should create timestamp at start of day', () => {
      const testDate = new Date('2025-05-11T14:30:00Z');
      const timestamp = createDayTimestamp(testDate);
      const resultDate = timestamp.toDate();
      
      expect(resultDate.getUTCFullYear()).toBe(2025);
      expect(resultDate.getUTCMonth()).toBe(4); // Month is 0-based
      expect(resultDate.getUTCDate()).toBe(11);
      expect(resultDate.getUTCHours()).toBe(0);
      expect(resultDate.getUTCMinutes()).toBe(0);
      expect(resultDate.getUTCSeconds()).toBe(0);
      expect(resultDate.getUTCMilliseconds()).toBe(0);
    });
  });

  describe('Data Converters', () => {
    test('convertDailyToClient should convert Timestamps to Dates', () => {
      const firestoreDaily: Daily = {
        date: Timestamp.fromDate(new Date('2025-05-11T00:00:00Z')),
        cardScannedAt: Timestamp.fromDate(new Date('2025-05-11T14:25:00Z'))
      };

      const clientDaily = convertDailyToClient(firestoreDaily);
      
      expect(clientDaily.date).toBeInstanceOf(Date);
      expect(clientDaily.cardScannedAt).toBeInstanceOf(Date);
      expect(clientDaily.date.toISOString()).toBe('2025-05-11T00:00:00.000Z');
      expect(clientDaily.cardScannedAt.toISOString()).toBe('2025-05-11T14:25:00.000Z');
    });

    test('convertTaskToClient should handle all task fields correctly', () => {
      const firestoreTask: Task = {
        name: 'Test Task',
        status: 'IN_PROGRESS',
        plannedAt: Timestamp.fromDate(new Date('2025-05-11T14:30:00Z')),
        startedAt: Timestamp.fromDate(new Date('2025-05-11T14:35:00Z')),
        completedAt: null,
        projectRef: 'Projects/test-project'
      };

      const clientTask = convertTaskToClient(firestoreTask);
      
      expect(clientTask.name).toBe('Test Task');
      expect(clientTask.status).toBe('IN_PROGRESS');
      expect(clientTask.plannedAt).toBeInstanceOf(Date);
      expect(clientTask.startedAt).toBeInstanceOf(Date);
      expect(clientTask.completedAt).toBeNull();
      expect(clientTask.projectRef).toBe('Projects/test-project');
    });

    test('convertProjectToClient should convert project data', () => {
      const firestoreProject: Project = {
        name: 'Test Project',
        color: '#FFBB33',
        description: 'Test description'
      };

      const clientProject = convertProjectToClient(firestoreProject);
      
      expect(clientProject).toEqual(firestoreProject);
    });
  });

  describe('Task Duration Calculations', () => {
    test('getTaskDuration should calculate duration correctly', () => {
      const startTime = new Date('2025-05-11T14:30:00Z');
      const endTime = new Date('2025-05-11T15:45:00Z');
      
      const task = {
        name: 'Test Task',
        status: 'COMPLETED' as TaskStatus,
        plannedAt: startTime,
        startedAt: startTime,
        completedAt: endTime,
        projectRef: 'Projects/test'
      };

      const duration = getTaskDuration(task);
      expect(duration).toBe(75); // 1 hour 15 minutes = 75 minutes
    });

    test('getTaskDuration should return null for incomplete tasks', () => {
      const task = {
        name: 'Test Task',
        status: 'IN_PROGRESS' as TaskStatus,
        plannedAt: new Date(),
        startedAt: new Date(),
        completedAt: null,
        projectRef: 'Projects/test'
      };

      const duration = getTaskDuration(task);
      expect(duration).toBeNull();
    });

    test('formatDuration should format minutes correctly', () => {
      expect(formatDuration(30)).toBe('30m');
      expect(formatDuration(60)).toBe('1h 0m');
      expect(formatDuration(75)).toBe('1h 15m');
      expect(formatDuration(125)).toBe('2h 5m');
    });
  });

  describe('Type Safety', () => {
    test('TaskStatus enum should include all valid values', () => {
      const validStatuses: TaskStatus[] = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
      
      // This test ensures the TaskStatus type accepts all expected values
      validStatuses.forEach(status => {
        expect(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).toContain(status);
      });
    });

    test('Daily schema should match expected structure', () => {
      const daily: Daily = {
        date: Timestamp.fromDate(new Date()),
        cardScannedAt: Timestamp.fromDate(new Date())
      };

      expect(daily).toHaveProperty('date');
      expect(daily).toHaveProperty('cardScannedAt');
      expect(daily.date).toBeInstanceOf(Timestamp);
      expect(daily.cardScannedAt).toBeInstanceOf(Timestamp);
    });

    test('Task schema should match expected structure', () => {
      const task: Task = {
        name: 'Test Task',
        status: 'NOT_STARTED',
        plannedAt: null,
        startedAt: null,
        completedAt: null,
        projectRef: 'Projects/test'
      };

      expect(task).toHaveProperty('name');
      expect(task).toHaveProperty('status');
      expect(task).toHaveProperty('plannedAt');
      expect(task).toHaveProperty('startedAt');
      expect(task).toHaveProperty('completedAt');
      expect(task).toHaveProperty('projectRef');
    });

    test('Project schema should match expected structure', () => {
      const project: Project = {
        name: 'Test Project',
        color: '#FFBB33',
        description: 'Test description'
      };

      expect(project).toHaveProperty('name');
      expect(project).toHaveProperty('color');
      expect(project).toHaveProperty('description');
    });
  });

  describe('Collection References', () => {
    test('collection reference functions should be defined', () => {
      expect(getDailiesCollectionRef).toBeDefined();
      expect(getTasksCollectionRef).toBeDefined();
      expect(getProjectsCollectionRef).toBeDefined();
    });
  });
});

describe('Schema Validation Examples', () => {
  test('should validate example data structure', () => {
    const exampleDaily = {
      date: new Date('2025-05-11'),
      cardScannedAt: new Date('2025-05-11T14:25:00Z'),
    };

    const exampleTasks = [
      {
        name: 'Call Grandma',
        status: 'NOT_STARTED' as TaskStatus,
        plannedAt: new Date('2025-05-11T14:30:00Z'),
        projectRef: 'Projects/family'
      },
      {
        name: 'Review presentation slides',
        status: 'IN_PROGRESS' as TaskStatus,
        plannedAt: null,
        projectRef: 'Projects/work'
      }
    ];

    const exampleProjects = [
      {
        name: 'Family Stuff',
        color: '#FFBB33',
        description: 'Calls, events, and family things'
      },
      {
        name: 'Work Projects',
        color: '#4285F4',
        description: 'Professional tasks and meetings'
      }
    ];

    // Validate structure
    expect(exampleDaily).toHaveProperty('date');
    expect(exampleDaily).toHaveProperty('cardScannedAt');
    
    exampleTasks.forEach(task => {
      expect(task).toHaveProperty('name');
      expect(task).toHaveProperty('status');
      expect(task).toHaveProperty('plannedAt');
      expect(task).toHaveProperty('projectRef');
      expect(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).toContain(task.status);
    });

    exampleProjects.forEach(project => {
      expect(project).toHaveProperty('name');
      expect(project).toHaveProperty('color');
      expect(project).toHaveProperty('description');
    });
  });
});
