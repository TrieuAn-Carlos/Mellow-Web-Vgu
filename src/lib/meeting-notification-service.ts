import type { Task } from '../types/schema';

interface ScheduledNotification {
  id: string;
  taskId: string;
  timeoutId: NodeJS.Timeout;
  meetingTime: Date;
  taskName: string;
}

class MeetingNotificationService {
  private scheduledNotifications: Map<string, ScheduledNotification> = new Map();
  private notificationPermissionGranted: boolean = false;

  constructor() {
    this.initializeNotifications();
  }

  /**
   * Initialize notification permissions
   */
  private async initializeNotifications(): Promise<void> {
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        console.log('🔔 [MeetingNotifications] Requesting notification permission');
        const permission = await Notification.requestPermission();
        this.notificationPermissionGranted = permission === 'granted';
        
        if (this.notificationPermissionGranted) {
          console.log('✅ [MeetingNotifications] Notification permission granted');
        } else {
          console.log('❌ [MeetingNotifications] Notification permission denied');
        }
      } else if (Notification.permission === 'granted') {
        this.notificationPermissionGranted = true;
        console.log('✅ [MeetingNotifications] Notification permission already granted');
      } else {
        console.log('❌ [MeetingNotifications] Notification permission already denied');
      }
    } else {
      console.log('❌ [MeetingNotifications] Notifications not supported in this browser');
    }
  }

  /**
   * Process tasks and schedule notifications for meetings
   */
  public processTasksForMeetingNotifications(tasks: Task[]): void {
    console.log('🔔 [MeetingNotifications] ===== PROCESSING MEETING NOTIFICATIONS =====');
    console.log('🔔 [MeetingNotifications] Processing', tasks.length, 'total tasks for meeting notifications');

    // Filter tasks that are meetings with meeting times
    const meetingTasks = tasks.filter(task => {
      if (task.status !== 'MEETING') return false;
      
      // For MEETING tasks, check if they have startedAt (the meeting time)
      // For other tasks, check plannedAt (fallback)
      const meetingTimestamp = task.status === 'MEETING' ? task.startedAt : task.plannedAt;
      return !!meetingTimestamp;
    });

    console.log('📅 [MeetingNotifications] Found', meetingTasks.length, 'meeting tasks with valid timestamps');
    
    if (meetingTasks.length > 0) {
      console.log('📅 [MeetingNotifications] Meeting tasks details:');
      meetingTasks.forEach((task, index) => {
        const meetingTimestamp = task.status === 'MEETING' ? task.startedAt : task.plannedAt;
        const meetingTime = meetingTimestamp?.toDate();
        const now = new Date();
        const timeUntilMeeting = meetingTime ? meetingTime.getTime() - now.getTime() : 0;
        
        console.log(`📅 [MeetingNotifications]   ${index + 1}. "${task.name}"`);
        console.log(`📅 [MeetingNotifications]      - ID: ${task.id}`);
        console.log(`📅 [MeetingNotifications]      - Meeting Time: ${meetingTime?.toLocaleString() || 'N/A'}`);
        console.log(`📅 [MeetingNotifications]      - Time Until Meeting: ${Math.round(timeUntilMeeting / 1000 / 60)} minutes`);
        console.log(`📅 [MeetingNotifications]      - Using Field: ${task.status === 'MEETING' ? 'startedAt' : 'plannedAt'}`);
      });
    } else {
      console.log('📅 [MeetingNotifications] No meeting tasks found with valid timestamps');
    }

    // Get current task IDs for cleanup
    const currentMeetingTaskIds = new Set(meetingTasks.map(task => task.id));
    console.log('🔄 [MeetingNotifications] Current meeting task IDs:', Array.from(currentMeetingTaskIds));

    // Remove notifications for tasks that are no longer meetings or have been removed
    const notificationsToRemove: string[] = [];
    for (const [notificationId, scheduledNotification] of this.scheduledNotifications) {
      if (!currentMeetingTaskIds.has(scheduledNotification.taskId)) {
        console.log('🗑️ [MeetingNotifications] Marking notification for removal - task no longer exists or is not a meeting:', {
          notificationId,
          taskId: scheduledNotification.taskId,
          taskName: scheduledNotification.taskName
        });
        notificationsToRemove.push(notificationId);
      }
    }

    // Actually remove the notifications
    notificationsToRemove.forEach(notificationId => {
      const scheduledNotification = this.scheduledNotifications.get(notificationId);
      if (scheduledNotification) {
        console.log('🗑️ [MeetingNotifications] Removing notification:', scheduledNotification.taskName);
        clearTimeout(scheduledNotification.timeoutId);
        this.scheduledNotifications.delete(notificationId);
      }
    });

    console.log('📊 [MeetingNotifications] Currently scheduled notifications:', this.scheduledNotifications.size);

    // Schedule notifications for meeting tasks
    console.log('⏰ [MeetingNotifications] Scheduling notifications for', meetingTasks.length, 'meeting tasks...');
    meetingTasks.forEach((task, index) => {
      console.log(`⏰ [MeetingNotifications] Processing meeting task ${index + 1}/${meetingTasks.length}: "${task.name}"`);
      this.scheduleMeetingNotification(task);
    });

    console.log('🔔 [MeetingNotifications] ===== MEETING NOTIFICATION PROCESSING COMPLETE =====');
    console.log('📊 [MeetingNotifications] Final state - Total scheduled notifications:', this.scheduledNotifications.size);
  }

  /**
   * Schedule a notification for a specific meeting task
   */
  private scheduleMeetingNotification(task: Task): void {
    console.log('🎯 [MeetingNotifications] === SCHEDULING NOTIFICATION FOR TASK ===');
    console.log('🎯 [MeetingNotifications] Task:', { id: task.id, name: task.name, status: task.status });
    
    // For MEETING tasks, use startedAt field for the meeting time
    const meetingTimestamp = task.status === 'MEETING' ? task.startedAt : task.plannedAt;
    const fieldUsed = task.status === 'MEETING' ? 'startedAt' : 'plannedAt';
    
    console.log('🎯 [MeetingNotifications] Using field:', fieldUsed);
    console.log('🎯 [MeetingNotifications] Timestamp:', meetingTimestamp);
    
    if (!meetingTimestamp) {
      console.log('❌ [MeetingNotifications] Cannot schedule notification - missing meeting timestamp in', fieldUsed, 'field');
      return;
    }
    
    if (!this.notificationPermissionGranted) {
      console.log('❌ [MeetingNotifications] Cannot schedule notification - notification permission not granted');
      return;
    }

    const meetingTime = meetingTimestamp.toDate();
    const notificationTime = new Date(meetingTime.getTime() - 5 * 60 * 1000); // 5 minutes before
    const now = new Date();
    const notificationId = `meeting-${task.id}`;

    console.log('🎯 [MeetingNotifications] Timing details:', {
      now: now.toLocaleString(),
      meetingTime: meetingTime.toLocaleString(),
      notificationTime: notificationTime.toLocaleString(),
      notificationId
    });

    // Check if this notification is already scheduled
    if (this.scheduledNotifications.has(notificationId)) {
      const existing = this.scheduledNotifications.get(notificationId)!;
      
      console.log('🔍 [MeetingNotifications] Found existing notification:', {
        existingMeetingTime: existing.meetingTime.toLocaleString(),
        newMeetingTime: meetingTime.toLocaleString(),
        timeChanged: existing.meetingTime.getTime() !== meetingTime.getTime()
      });
      
      // If the meeting time hasn't changed, don't reschedule
      if (existing.meetingTime.getTime() === meetingTime.getTime()) {
        console.log('⏸️ [MeetingNotifications] Notification already scheduled with same time for:', task.name);
        return;
      }
      
      // Meeting time changed, cancel existing and schedule new
      console.log('🔄 [MeetingNotifications] Meeting time changed, rescheduling notification for:', task.name);
      console.log('🔄 [MeetingNotifications] Old time:', existing.meetingTime.toLocaleString());
      console.log('🔄 [MeetingNotifications] New time:', meetingTime.toLocaleString());
      clearTimeout(existing.timeoutId);
      this.scheduledNotifications.delete(notificationId);
    }

    // Check if notification time has already passed
    if (notificationTime <= now) {
      console.log('⏰ [MeetingNotifications] Notification time has already passed for:', task.name);
      console.log('⏰ [MeetingNotifications] Notification was scheduled for:', notificationTime.toLocaleString());
      console.log('⏰ [MeetingNotifications] Current time:', now.toLocaleString());
      return;
    }

    // Check if meeting time has already passed
    if (meetingTime <= now) {
      console.log('⏰ [MeetingNotifications] Meeting time has already passed for:', task.name);
      console.log('⏰ [MeetingNotifications] Meeting was scheduled for:', meetingTime.toLocaleString());
      console.log('⏰ [MeetingNotifications] Current time:', now.toLocaleString());
      return;
    }

    const timeUntilNotification = notificationTime.getTime() - now.getTime();
    const minutesUntilNotification = Math.round(timeUntilNotification / 1000 / 60);
    const secondsUntilNotification = Math.round(timeUntilNotification / 1000);
    
    console.log('⏰ [MeetingNotifications] Notification timing calculation:', {
      taskName: task.name,
      meetingTime: meetingTime.toLocaleString(),
      notificationTime: notificationTime.toLocaleString(),
      timeUntilNotification: {
        milliseconds: timeUntilNotification,
        seconds: secondsUntilNotification,
        minutes: minutesUntilNotification
      }
    });

    // Schedule the notification
    console.log('⚡ [MeetingNotifications] Creating timeout for notification...');
    const timeoutId = setTimeout(() => {
      console.log('🔔 [MeetingNotifications] === NOTIFICATION TRIGGERED ===');
      console.log('🔔 [MeetingNotifications] Meeting notification firing for:', task.name);
      this.showMeetingNotification(task, meetingTime);
      this.scheduledNotifications.delete(notificationId);
      console.log('🔔 [MeetingNotifications] Notification completed and removed from schedule');
    }, timeUntilNotification);

    // Store the scheduled notification
    this.scheduledNotifications.set(notificationId, {
      id: notificationId,
      taskId: task.id,
      timeoutId,
      meetingTime,
      taskName: task.name
    });

    console.log('✅ [MeetingNotifications] NOTIFICATION SUCCESSFULLY SCHEDULED!');
    console.log('✅ [MeetingNotifications] Task:', task.name);
    console.log('✅ [MeetingNotifications] Will fire in:', minutesUntilNotification, 'minutes (' + secondsUntilNotification + ' seconds)');
    console.log('✅ [MeetingNotifications] Meeting time:', meetingTime.toLocaleString());
    console.log('✅ [MeetingNotifications] Notification time:', notificationTime.toLocaleString());
    console.log('🎯 [MeetingNotifications] === NOTIFICATION SCHEDULING COMPLETE ===');
  }

  /**
   * Show the actual notification
   */
  private showMeetingNotification(task: Task, meetingTime: Date): void {
    console.log('🔔 [MeetingNotifications] === SHOWING MEETING NOTIFICATION ===');
    console.log('🔔 [MeetingNotifications] Task:', { id: task.id, name: task.name });
    console.log('🔔 [MeetingNotifications] Meeting time:', meetingTime.toLocaleString());
    
    if (!this.notificationPermissionGranted) {
      console.log('❌ [MeetingNotifications] Cannot show notification - permission not granted');
      console.log('❌ [MeetingNotifications] Current permission status:', Notification.permission);
      return;
    }

    const timeString = meetingTime.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    const notificationTitle = `Meeting in 5 minutes`;
    const notificationBody = `"${task.name}" is scheduled at ${timeString}`;
    const notificationTag = `meeting-${task.id}`;
    
    console.log('🔔 [MeetingNotifications] Notification details:', {
      title: notificationTitle,
      body: notificationBody,
      tag: notificationTag,
      timeString
    });

    console.log('🔔 [MeetingNotifications] Creating browser notification...');

    try {
      const notification = new Notification(notificationTitle, {
        body: notificationBody,
        icon: '/favicon.ico', // You can customize this icon
        tag: notificationTag, // Prevents duplicate notifications
        requireInteraction: true, // Keeps notification visible until user interacts
        badge: '/favicon.ico',
      });

      console.log('✅ [MeetingNotifications] Browser notification created successfully');

      // Optional: Handle notification click
      notification.onclick = () => {
        console.log('🖱️ [MeetingNotifications] Notification clicked for:', task.name);
        console.log('🖱️ [MeetingNotifications] Bringing window to focus...');
        
        // Focus the window if it's not already focused
        if (window) {
          window.focus();
        }
        
        // You could navigate to a specific page or open a meeting link here
        // For example: window.open(meetingLink, '_blank');
        
        console.log('🖱️ [MeetingNotifications] Closing notification...');
        notification.close();
      };

      notification.onerror = (error) => {
        console.error('❌ [MeetingNotifications] Notification error:', error);
      };

      notification.onshow = () => {
        console.log('👁️ [MeetingNotifications] Notification is now visible to user');
      };

      notification.onclose = () => {
        console.log('🚪 [MeetingNotifications] Notification closed');
      };

      // Auto-close notification after 10 seconds if user doesn't interact
      console.log('⏲️ [MeetingNotifications] Setting auto-close timer for 10 seconds...');
      setTimeout(() => {
        console.log('⏲️ [MeetingNotifications] Auto-closing notification after 10 seconds');
        notification.close();
      }, 10000);

    } catch (error) {
      console.error('❌ [MeetingNotifications] Error creating notification:', error);
    }

    console.log('🔔 [MeetingNotifications] === NOTIFICATION DISPLAY COMPLETE ===');
  }

  /**
   * Get information about currently scheduled notifications
   */
  public getScheduledNotifications(): Array<{
    taskName: string;
    meetingTime: Date;
    notificationTime: Date;
  }> {
    return Array.from(this.scheduledNotifications.values()).map(notification => ({
      taskName: notification.taskName,
      meetingTime: notification.meetingTime,
      notificationTime: new Date(notification.meetingTime.getTime() - 5 * 60 * 1000)
    }));
  }

  /**
   * Cancel all scheduled notifications (useful for cleanup)
   */
  public cancelAllNotifications(): void {
    console.log('🗑️ [MeetingNotifications] Cancelling all scheduled notifications');
    
    for (const [notificationId, scheduledNotification] of this.scheduledNotifications) {
      clearTimeout(scheduledNotification.timeoutId);
    }
    
    this.scheduledNotifications.clear();
  }

  /**
   * Get notification permission status
   */
  public isNotificationPermissionGranted(): boolean {
    return this.notificationPermissionGranted;
  }

  /**
   * Manually request notification permission (useful for settings page)
   */
  public async requestNotificationPermission(): Promise<boolean> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      this.notificationPermissionGranted = permission === 'granted';
      return this.notificationPermissionGranted;
    }
    return false;
  }
}

// Create a singleton instance
export const meetingNotificationService = new MeetingNotificationService();

// Export the class for testing purposes
export { MeetingNotificationService }; 