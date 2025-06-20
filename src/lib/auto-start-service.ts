import { Timestamp } from 'firebase/firestore';
import { monitorCurrentInProgressTask } from './firebase-services';
import { getSettings } from './settings-service';
import type { CurrentTaskData } from './firebase-services';

export interface AutoStartResult {
  shouldAutoStart: boolean;
  taskName?: string;
  startedAt?: Date;
  reason?: string;
}

export interface AutoStartCallback {
  (result: AutoStartResult): void;
}

const HOME_ACCESS_TIME_KEY = 'homeAccessTime';

// Lưu thời gian truy cập trang home
export function saveHomeAccessTime(): number {
  const now = Date.now();
  localStorage.setItem(HOME_ACCESS_TIME_KEY, now.toString());
  console.log('[AUTO-START] Home access time saved:', new Date(now).toISOString());
  return now;
}

// Lấy thời gian truy cập home đã lưu
export function getHomeAccessTime(): number | null {
  const saved = localStorage.getItem(HOME_ACCESS_TIME_KEY);
  return saved ? parseInt(saved, 10) : null;
}

// Hàm chính để setup onSnapshot monitoring với auto-start
export function setupAutoStartMonitoring(onAutoStart: AutoStartCallback): () => void {
  console.log('[AUTO-START] Setting up onSnapshot monitoring...');

  // Setup onSnapshot listener
  const unsubscribe = monitorCurrentInProgressTask(async (result) => {
    if (!result.success) {
      console.log('[AUTO-START] Firebase monitoring error:', result.message);
      return;
    }

    // Kiểm tra xem có task IN_PROGRESS không
    if (!result.currentTask) {
      console.log('[AUTO-START] No IN_PROGRESS task found');
      return;
    }

    const task = result.currentTask as CurrentTaskData;
    console.log('[AUTO-START] Found IN_PROGRESS task:', task.name);

    try {
      // 1. Kiểm tra AutoStart có được bật không
      const settings = await getSettings();
      if (!settings.AutoStart) {
        console.log('[AUTO-START] AutoStart disabled in settings');
        return;
      }

      // 2. Lấy thời gian truy cập home
      const homeAccessTime = getHomeAccessTime();
      if (!homeAccessTime) {
        console.log('[AUTO-START] No home access time found');
        return;
      }

      // 3. Kiểm tra startedAt của task
      if (!task.startedAt) {
        console.log('[AUTO-START] Task has no startedAt timestamp');
        return;
      }

      // 4. So sánh thời gian startedAt với thời gian truy cập home
      let taskStartedAtMs: number;
      
      // Xử lý Timestamp theo đúng schema
      if (task.startedAt && typeof task.startedAt.toMillis === 'function') {
        taskStartedAtMs = task.startedAt.toMillis();
      } else if (task.startedAt instanceof Date) {
        taskStartedAtMs = task.startedAt.getTime();
      } else {
        console.log('[AUTO-START] Invalid startedAt format');
        return;
      }

      console.log('[AUTO-START] Comparing times:');
      console.log('  - Home access time:', new Date(homeAccessTime).toISOString());
      console.log('  - Task started time:', new Date(taskStartedAtMs).toISOString());

      // 5. Nếu task được start SAU khi truy cập home -> Auto-start
      if (taskStartedAtMs > homeAccessTime) {
        console.log('[AUTO-START] Task started after home access - triggering auto-start');
        
        onAutoStart({
          shouldAutoStart: true,
          taskName: task.name,
          startedAt: new Date(taskStartedAtMs),
          reason: `Task "${task.name}" was started after home access`
        });
      } else {
        console.log('[AUTO-START] Task started before home access - no auto-start needed');
      }

    } catch (error) {
      console.error('[AUTO-START] Error in auto-start logic:', error);
    }
  });

  return unsubscribe;
}

// Hàm tiện ích để kiểm tra auto-start một lần (không dùng onSnapshot)
export async function checkAutoStartOnce(): Promise<AutoStartResult> {
  try {
    console.log('[AUTO-START] Performing one-time auto-start check...');

    // 1. Kiểm tra AutoStart có được bật không
    const settings = await getSettings();
    if (!settings.AutoStart) {
      return {
        shouldAutoStart: false,
        reason: 'AutoStart is disabled in settings'
      };
    }

    // 2. Lấy thời gian truy cập home
    const homeAccessTime = getHomeAccessTime();
    if (!homeAccessTime) {
      return {
        shouldAutoStart: false,
        reason: 'No home access time found'
      };
    }

    return {
      shouldAutoStart: false,
      reason: 'One-time check completed - use setupAutoStartMonitoring for real-time detection'
    };

  } catch (error) {
    console.error('[AUTO-START] Error in one-time check:', error);
    return {
      shouldAutoStart: false,
      reason: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
} 