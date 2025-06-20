import { useState, useEffect, useRef } from 'react';
import { onTasksUpdate } from '../lib/firebase-services';
import { meetingNotificationService } from '../lib/meeting-notification-service';
import type { Task } from '../types/schema';

interface MeetingNotificationState {
  scheduledMeetings: Array<{
    taskName: string;
    meetingTime: Date;
    notificationTime: Date;
  }>;
  notificationPermissionGranted: boolean;
  lastProcessedCount: number;
}

/**
 * A hook that combines task completion monitoring with meeting notification scheduling.
 * 
 * This hook:
 * 1. Sets up a real-time listener for task changes
 * 2. Processes tasks to find meetings and schedule notifications 5 minutes before
 * 3. Returns both newly completed task IDs and meeting notification status
 *
 * @param date The date to watch for task changes and meetings
 * @returns Object containing newly completed task IDs and meeting notification info
 */
export const useMeetingNotifications = (date: Date) => {
  // State for completed tasks (from existing functionality)
  const [newlyCompletedTaskIds, setNewlyCompletedTaskIds] = useState<string[]>([]);
  const previousTasks = useRef<Map<string, Task>>(new Map());

  // State for meeting notifications
  const [meetingNotificationState, setMeetingNotificationState] = useState<MeetingNotificationState>({
    scheduledMeetings: [],
    notificationPermissionGranted: meetingNotificationService.isNotificationPermissionGranted(),
    lastProcessedCount: 0
  });

  useEffect(() => {
    console.log('🔧 [useMeetingNotifications] Setting up combined listener for date:', date.toISOString().split('T')[0]);
    
    // Set up the real-time listener
    const unsubscribe = onTasksUpdate(date, (currentTasks: Task[]) => {
      console.log('📡 [useMeetingNotifications] Received tasks update:', currentTasks.length, 'tasks');
      console.log('📋 [useMeetingNotifications] Current tasks:', currentTasks.map(t => ({ 
        id: t.id, 
        name: t.name, 
        status: t.status,
        plannedAt: t.plannedAt ? t.plannedAt.toDate().toLocaleString() : null
      })));
      
      // --- EXISTING COMPLETED TASK LOGIC ---
      const newCompletedIds: string[] = [];

      // On the first run, populate the previousTasks map AND return all currently completed tasks
      if (previousTasks.current.size === 0) {
        console.log('🏁 [useMeetingNotifications] First run - initializing previous tasks');
        
        // Find all currently completed tasks and add them to newIds
        const alreadyCompletedTasks = currentTasks.filter(task => task.status === 'COMPLETED');
        const alreadyCompletedIds = alreadyCompletedTasks.map(task => task.id);
        
        console.log('🎯 [useMeetingNotifications] Found', alreadyCompletedIds.length, 'already completed tasks on first run:', alreadyCompletedIds);
        
        // Populate the baseline for future comparisons
        currentTasks.forEach(task => previousTasks.current.set(task.id, task));
        console.log('💾 [useMeetingNotifications] Stored', previousTasks.current.size, 'tasks as baseline');
        
        // Return all already completed task IDs to trigger animations
        if (alreadyCompletedIds.length > 0) {
          console.log('🚀 [useMeetingNotifications] Setting already completed task IDs on first run:', alreadyCompletedIds);
          setNewlyCompletedTaskIds(alreadyCompletedIds);
        }
      } else {
        console.log('📊 [useMeetingNotifications] Previous tasks count:', previousTasks.current.size);
        console.log('📊 [useMeetingNotifications] Current tasks count:', currentTasks.length);

        console.log('🔍 [useMeetingNotifications] Comparing with previous state...');
        
        // On subsequent updates, compare new state with previous state
        currentTasks.forEach(currentTask => {
          const previousTask = previousTasks.current.get(currentTask.id);

          // Check if the task is new or if its status changed to COMPLETED
          if (
            (!previousTask && currentTask.status === 'COMPLETED') ||
            (previousTask && previousTask.status !== 'COMPLETED' && currentTask.status === 'COMPLETED')
          ) {
            console.log('✅ [useMeetingNotifications] Found newly completed task:', currentTask.id, currentTask.name);
            newCompletedIds.push(currentTask.id);
          }
        });

        console.log('🎯 [useMeetingNotifications] New completed task IDs:', newCompletedIds);

        // Update the state with newly completed task IDs
        if (newCompletedIds.length > 0) {
          console.log('🚀 [useMeetingNotifications] Setting new completed task IDs:', newCompletedIds);
          setNewlyCompletedTaskIds(ids => [...ids, ...newCompletedIds]);
        } else {
          console.log('📭 [useMeetingNotifications] No new completed tasks found');
        }

        // Update the reference for the next comparison
        previousTasks.current.clear();
        currentTasks.forEach(task => previousTasks.current.set(task.id, task));
        console.log('💾 [useMeetingNotifications] Updated baseline with', currentTasks.length, 'tasks');
      }

      // --- NEW MEETING NOTIFICATION LOGIC ---
      console.log('🔔 [useMeetingNotifications] Processing tasks for meeting notifications...');
      
      // Process tasks for meeting notifications
      meetingNotificationService.processTasksForMeetingNotifications(currentTasks);
      
      // Update meeting notification state
      const scheduledMeetings = meetingNotificationService.getScheduledNotifications();
      const notificationPermissionGranted = meetingNotificationService.isNotificationPermissionGranted();
      
      setMeetingNotificationState({
        scheduledMeetings,
        notificationPermissionGranted,
        lastProcessedCount: currentTasks.length
      });

      console.log('📅 [useMeetingNotifications] Updated meeting state:', {
        scheduledMeetingsCount: scheduledMeetings.length,
        notificationPermissionGranted,
        meetings: scheduledMeetings.map(m => ({
          name: m.taskName,
          meetingTime: m.meetingTime.toLocaleString(),
          notificationTime: m.notificationTime.toLocaleString()
        }))
      });
    });

    // Cleanup listener on component unmount
    return () => {
      console.log('🧹 [useMeetingNotifications] Cleaning up listener');
      unsubscribe();
      // Don't clear previousTasks.current here - we want to preserve it across re-renders
    };
  }, [date]);

  // This effect will clear the completed task list after the component has re-rendered with the new IDs
  useEffect(() => {
    if (newlyCompletedTaskIds.length > 0) {
      console.log('⏰ [useMeetingNotifications] Will clear completed task IDs immediately:', newlyCompletedTaskIds);
      // Use immediate clear for immediate processing
      const timer = setTimeout(() => {
        console.log('🧹 [useMeetingNotifications] Clearing processed completed task IDs');
        setNewlyCompletedTaskIds([]);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [newlyCompletedTaskIds]);

  // Cleanup function for when the component unmounts
  useEffect(() => {
    return () => {
      console.log('🧹 [useMeetingNotifications] Component unmounting, cleaning up notifications');
      meetingNotificationService.cancelAllNotifications();
    };
  }, []);

  console.log('📤 [useMeetingNotifications] Returning state:', {
    newlyCompletedTaskIds,
    scheduledMeetingsCount: meetingNotificationState.scheduledMeetings.length,
    notificationPermissionGranted: meetingNotificationState.notificationPermissionGranted
  });

  return {
    // Existing functionality
    newlyCompletedTaskIds,
    
    // New meeting notification functionality
    scheduledMeetings: meetingNotificationState.scheduledMeetings,
    notificationPermissionGranted: meetingNotificationState.notificationPermissionGranted,
    lastProcessedCount: meetingNotificationState.lastProcessedCount,
    
    // Utility functions
    requestNotificationPermission: () => meetingNotificationService.requestNotificationPermission(),
    cancelAllNotifications: () => meetingNotificationService.cancelAllNotifications(),
    getScheduledNotifications: () => meetingNotificationService.getScheduledNotifications()
  };
}; 