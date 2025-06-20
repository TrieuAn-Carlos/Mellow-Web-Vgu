// --- Type Definitions based on schema.txt ---
export type Project = {
  id: string;
  name: string;
  color: string;
  description: string;
};

export type TaskStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type Task = {
  id: string;
  name: string;
  status: TaskStatus;
  order: number;
  projectRef: string; // Corresponds to Project id
  plannedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
};

// The key is the date string 'YYYY-MM-DD'
export type Dailies = {
  [date: string]: Task[];
};

const getTodayString = () => new Date().toISOString().split("T")[0];

// --- In-memory "database" ---
// This object will persist in memory on the server during development
let projects: Project[] = [
  { id: "family", name: "Family Stuff", color: "#FFBB33", description: "Calls, events, and family things" },
  { id: "work", name: "Work", color: "#33B5E5", description: "All work-related tasks" },
  { id: "self-care", name: "Self-Care", color: "#99CC00", description: "Exercise, reading, meditation" },
];

let dailies: Dailies = {
  [getTodayString()]: [
    { id: "task-1", name: "Call Grandma", status: "NOT_STARTED", order: 1, projectRef: "family", plannedAt: null, startedAt: null, completedAt: null },
    { id: "task-2", name: "Finish Q3 report", status: "IN_PROGRESS", order: 2, projectRef: "work", plannedAt: null, startedAt: new Date().toISOString(), completedAt: null },
  ],
  "2023-11-20": [
    { id: "task-4", name: "Review PRs", status: "COMPLETED", order: 1, projectRef: "work", plannedAt: null, startedAt: null, completedAt: null },
  ]
};

// --- Database Access Functions ---
export const mockDb = {
  getProjects: () => {
    return projects;
  },
  addProject: (project: Omit<Project, 'id'>) => {
    const newProject: Project = {
      ...project,
      id: project.name.toLowerCase().replace(/\s+/g, '-'),
    };
    projects.push(newProject);
    return newProject;
  },
  getDailiesForDate: (date: string) => {
    return dailies[date] || [];
  },
  addTaskToDate: (date: string, task: Omit<Task, 'id' | 'order'>) => {
    if (!dailies[date]) {
      dailies[date] = [];
    }
    const newOrder = dailies[date].length > 0 ? Math.max(...dailies[date].map(t => t.order)) + 1 : 1;
    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}`,
      order: newOrder,
    };
    dailies[date].push(newTask);
    dailies[date].sort((a,b) => a.order - b.order);
    return newTask;
  },
  updateTask: (date: string, taskId: string, updates: Partial<Task>) => {
    if (!dailies[date]) return null;
    const taskIndex = dailies[date].findIndex(t => t.id === taskId);
    if (taskIndex === -1) return null;
    
    dailies[date][taskIndex] = { ...dailies[date][taskIndex], ...updates };
    return dailies[date][taskIndex];
  },
  deleteTask: (date: string, taskId: string) => {
    if (!dailies[date]) return false;
    const initialLength = dailies[date].length;
    dailies[date] = dailies[date].filter(t => t.id !== taskId);
    return dailies[date].length < initialLength;
  },
  reset: () => {
    // This is for the admin panel's reset button
    projects = [
      { id: "family", name: "Family Stuff", color: "#FFBB33", description: "Calls, events, and family things" },
      { id: "work", name: "Work", color: "#33B5E5", description: "All work-related tasks" },
      { id: "self-care", name: "Self-Care", color: "#99CC00", description: "Exercise, reading, meditation" },
    ];
    dailies = {
      [getTodayString()]: [
        { id: "task-1", name: "Call Grandma", status: "NOT_STARTED", order: 1, projectRef: "family", plannedAt: null, startedAt: null, completedAt: null },
        { id: "task-2", name: "Finish Q3 report", status: "IN_PROGRESS", order: 2, projectRef: "work", plannedAt: null, startedAt: new Date().toISOString(), completedAt: null },
      ]
    };
    return { projects, dailies };
  }
}; 