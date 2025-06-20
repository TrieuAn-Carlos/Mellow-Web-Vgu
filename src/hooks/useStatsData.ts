'use client';

import { useState, useEffect } from 'react';
import {
  getTotalMellowsInTimeframe,
  getTotalFocusTime,
  getAverageDuration,
  getTimeDistributionByProject,
  type FirebaseOperationResult
} from '@/lib/firebase-monitoring';
import type { ViewMode, TimeDistributionItemData } from '@/types/stats';

export interface StatsData {
  totalMellows: number;
  totalFocusTimeHours: number;
  averageDurationMinutes: number;
  timeDistribution: TimeDistributionItemData[];
  isLoading: boolean;
  error: string | null;
}

// Helper function to get date range based on current date and view mode
function getDateRange(currentDate: Date, viewMode: ViewMode): { startDate: string; endDate: string } {
  const today = new Date(currentDate);
  let startDate: Date;
  let endDate: Date;

  switch (viewMode) {
    case 'day':
      startDate = new Date(today);
      endDate = new Date(today);
      break;
    case 'week':
      startDate = new Date(today);
      startDate.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6); // End of week (Saturday)
      break;
    case 'month':
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      break;
    case 'year':
      startDate = new Date(today.getFullYear(), 0, 1);
      endDate = new Date(today.getFullYear(), 11, 31);
      break;
    default:
      startDate = new Date(today);
      endDate = new Date(today);
  }

  const result = {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };

  console.log(`📅 [useStatsData] Current date: ${currentDate.toISOString().split('T')[0]}, View mode: ${viewMode}`);
  console.log(`📅 [useStatsData] Date range: ${result.startDate} to ${result.endDate}`);

  return result;
}

// Helper function to convert project distribution to UI format
function formatProjectDistribution(distributionArray: any[]): TimeDistributionItemData[] {
  if (!distributionArray || distributionArray.length === 0) {
    return [];
  }

  const totalTime = distributionArray.reduce((sum, item) => sum + item.timeMs, 0);
  
  const colors = [
    'bg-rose-500',
    'bg-teal-500',
    'bg-fuchsia-500',
    'bg-sky-500',
    'bg-emerald-500',
    'bg-orange-500',
    'bg-purple-500',
    'bg-cyan-500'
  ];

  return distributionArray.map((item, index) => {
    const percentage = totalTime > 0 ? Math.round((item.timeMs / totalTime) * 100) : 0;
    const hours = Math.floor(item.timeHours);
    const minutes = Math.round((item.timeHours - hours) * 60);
    const duration = hours > 0 ? `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}` : `${minutes}m`;
    
    return {
      category: item.project === 'No Project' ? 'Personal Tasks' : item.project,
      percentage,
      duration,
      color: colors[index % colors.length]
    };
  });
}

export function useStatsData(currentDate: Date, viewMode: ViewMode): StatsData {
  const [data, setData] = useState<StatsData>({
    totalMellows: 0,
    totalFocusTimeHours: 0,
    averageDurationMinutes: 0,
    timeDistribution: [],
    isLoading: true,
    error: null
  });

  useEffect(() => {
    let isMounted = true;

    const fetchStatsData = async () => {
      try {
        setData(prev => ({ ...prev, isLoading: true, error: null }));
        
        const { startDate, endDate } = getDateRange(currentDate, viewMode);

        // Fetch all stats data in parallel for better performance
        const [
          mellowsResult,
          focusTimeResult,
          avgDurationResult,
          distributionResult
        ] = await Promise.all([
          getTotalMellowsInTimeframe(startDate, endDate),
          getTotalFocusTime(startDate, endDate),
          getAverageDuration(startDate, endDate),
          getTimeDistributionByProject(startDate, endDate)
        ]);

        if (!isMounted) return;

        // Check for any errors
        const results = [mellowsResult, focusTimeResult, avgDurationResult, distributionResult];
        const hasError = results.some(result => !result.success);
        
        if (hasError) {
          const errorMessages = results
            .filter(result => !result.success)
            .map(result => result.message)
            .join('; ');
          
          setData(prev => ({
            ...prev,
            isLoading: false,
            error: `Error fetching stats: ${errorMessages}`
          }));
          return;
        }

        // Process successful results
        const totalMellows = mellowsResult.success ? mellowsResult.data?.totalCompleted || 0 : 0;
        const totalFocusTimeHours = focusTimeResult.success ? focusTimeResult.data?.totalFocusTimeHours || 0 : 0;
        const averageDurationMinutes = avgDurationResult.success ? avgDurationResult.data?.averageDurationMinutes || 0 : 0;
        const timeDistribution = distributionResult.success 
          ? formatProjectDistribution(distributionResult.data?.distributionArray || [])
          : [];

        setData({
          totalMellows,
          totalFocusTimeHours,
          averageDurationMinutes,
          timeDistribution,
          isLoading: false,
          error: null
        });

      } catch (error) {
        if (isMounted) {
          console.error('Error fetching stats data:', error);
          setData(prev => ({
            ...prev,
            isLoading: false,
            error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`
          }));
        }
      }
    };

    fetchStatsData();

    return () => {
      isMounted = false;
    };
  }, [currentDate, viewMode]);

  return data;
} 