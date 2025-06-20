import { useState, useEffect, useRef } from 'react';
import { onTasksUpdate } from '../lib/firebase-services';
import type { Task } from '../types/schema';

/**
 * A hook that uses a real-time listener to report newly completed task IDs for a given date.
 *
 * @param date The date to watch for completed tasks.
 * @returns An array of task IDs that have been newly completed since the last update.
 *          The array is cleared after being read.
 */
export const useCompletedTasksStream = (date: Date): string[] => {
  const [newlyCompletedTaskIds, setNewlyCompletedTaskIds] = useState<string[]>([]);
  const previousTasks = useRef<Map<string, Task>>(new Map());

  useEffect(() => {
    console.log('🔧 [useCompletedTasksStream] Setting up listener for date:', date.toISOString().split('T')[0]);
    
    // Set up the real-time listener
    const unsubscribe = onTasksUpdate(date, (currentTasks: Task[]) => {
      console.log('📡 [useCompletedTasksStream] Received tasks update:', currentTasks.length, 'tasks');
      console.log('📋 [useCompletedTasksStream] Current tasks:', currentTasks.map(t => ({ id: t.id, name: t.name, status: t.status })));
      
      const newIds: string[] = [];

      // On the first run, populate the previousTasks map AND return all currently completed tasks
      if (previousTasks.current.size === 0) {
        console.log('🏁 [useCompletedTasksStream] First run - initializing previous tasks');
        
        // Find all currently completed tasks and add them to newIds
        const alreadyCompletedTasks = currentTasks.filter(task => task.status === 'COMPLETED');
        const alreadyCompletedIds = alreadyCompletedTasks.map(task => task.id);
        
        console.log('🎯 [useCompletedTasksStream] Found', alreadyCompletedIds.length, 'already completed tasks on first run:', alreadyCompletedIds);
        
        // Populate the baseline for future comparisons
        currentTasks.forEach(task => previousTasks.current.set(task.id, task));
        console.log('💾 [useCompletedTasksStream] Stored', previousTasks.current.size, 'tasks as baseline');
        
        // Return all already completed task IDs to trigger animations
        if (alreadyCompletedIds.length > 0) {
          console.log('🚀 [useCompletedTasksStream] Setting already completed task IDs on first run:', alreadyCompletedIds);
          setNewlyCompletedTaskIds(alreadyCompletedIds);
        }
        
        return;
      }

      console.log('📊 [useCompletedTasksStream] Previous tasks count:', previousTasks.current.size);
      console.log('📊 [useCompletedTasksStream] Current tasks count:', currentTasks.length);

      console.log('🔍 [useCompletedTasksStream] Comparing with previous state...');
      
      // On subsequent updates, compare new state with previous state
      currentTasks.forEach(currentTask => {
        const previousTask = previousTasks.current.get(currentTask.id);

        // Check if the task is new or if its status changed to COMPLETED
        if (
          (!previousTask && currentTask.status === 'COMPLETED') ||
          (previousTask && previousTask.status !== 'COMPLETED' && currentTask.status === 'COMPLETED')
        ) {
          console.log('✅ [useCompletedTasksStream] Found newly completed task:', currentTask.id, currentTask.name);
          newIds.push(currentTask.id);
        }
      });

      console.log('🎯 [useCompletedTasksStream] New completed task IDs:', newIds);

      // Update the state with newly completed task IDs
      if (newIds.length > 0) {
        console.log('🚀 [useCompletedTasksStream] Setting new completed task IDs:', newIds);
        setNewlyCompletedTaskIds(ids => [...ids, ...newIds]);
      } else {
        console.log('📭 [useCompletedTasksStream] No new completed tasks found');
      }

      // Update the reference for the next comparison
      previousTasks.current.clear();
      currentTasks.forEach(task => previousTasks.current.set(task.id, task));
      console.log('💾 [useCompletedTasksStream] Updated baseline with', currentTasks.length, 'tasks');
    });

    // Cleanup listener on component unmount
    return () => {
      console.log('🧹 [useCompletedTasksStream] Cleaning up listener');
      unsubscribe();
      // Don't clear previousTasks.current here - we want to preserve it across re-renders
    };
  }, [date]);

  // This effect will clear the list after the component has re-rendered with the new IDs
  useEffect(() => {
    if (newlyCompletedTaskIds.length > 0) {
      console.log('⏰ [useCompletedTasksStream] Will clear IDs immediately:', newlyCompletedTaskIds);
      // Use immediate clear instead of 50ms timeout to reduce delay
      const timer = setTimeout(() => {
        console.log('🧹 [useCompletedTasksStream] Clearing processed IDs');
        setNewlyCompletedTaskIds([]);
      }, 0); // Changed from 50ms to 0ms for immediate processing
      return () => clearTimeout(timer);
    }
  }, [newlyCompletedTaskIds]);

  console.log('📤 [useCompletedTasksStream] Returning IDs:', newlyCompletedTaskIds);
  return newlyCompletedTaskIds;
}; 