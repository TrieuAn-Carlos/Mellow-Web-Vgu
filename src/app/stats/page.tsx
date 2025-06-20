"use client";

import React, { useState, useCallback, useEffect } from "react";
import Header from "@/components/stats/Header";
import StatCard from "@/components/stats/StatCard";
import TimeDistributionCard from "@/components/stats/TimeDistributionCard";
import { CloudIcon } from "@/components/stats/icons/CloudIcon";
import { useStatsData } from "@/hooks/useStatsData";
import type { ViewMode } from "@/types/stats";

const StatsPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("day");
  const [contentKey, setContentKey] = useState(0); // Key to trigger re-animation

  // Fetch real stats data from Firebase
  const {
    totalMellows,
    totalFocusTimeHours,
    averageDurationMinutes,
    timeDistribution,
    isLoading,
    error,
  } = useStatsData(currentDate, viewMode);

  // Update contentKey to re-trigger animations when date or view mode changes
  useEffect(() => {
    setContentKey((prevKey) => prevKey + 1);
  }, [currentDate, viewMode]);

  const handlePeriodChange = useCallback(
    (direction: "prev" | "next") => {
      setCurrentDate((prevDate) => {
        const newDate = new Date(prevDate);
        const increment = direction === "next" ? 1 : -1;

        switch (viewMode) {
          case "day":
            newDate.setDate(newDate.getDate() + increment);
            break;
          case "week":
            newDate.setDate(newDate.getDate() + 7 * increment);
            break;
          case "month":
            const originalDay = newDate.getDate();
            newDate.setMonth(newDate.getMonth() + increment, 1);
            const daysInNewMonth = new Date(
              newDate.getFullYear(),
              newDate.getMonth() + 1,
              0
            ).getDate();
            newDate.setDate(Math.min(originalDay, daysInNewMonth));
            break;
          case "year":
            newDate.setFullYear(newDate.getFullYear() + increment);
            break;
        }
        return newDate;
      });
    },
    [viewMode]
  );

  const handlePrevPeriod = useCallback(
    () => handlePeriodChange("prev"),
    [handlePeriodChange]
  );
  const handleNextPeriod = useCallback(
    () => handlePeriodChange("next"),
    [handlePeriodChange]
  );

  const formatNumber = (num: number) => num.toLocaleString();

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 sm:p-6 lg:p-8 flex flex-col">
        <Header
          currentDate={currentDate}
          viewMode={viewMode}
          onViewModeChange={(newMode) => {
            setViewMode(newMode);
          }}
          onPrevPeriod={handlePrevPeriod}
          onNextPeriod={handleNextPeriod}
        />

        <main className="mt-6 sm:mt-8 flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-lg text-gray-300">Loading your stats...</p>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 sm:p-6 lg:p-8 flex flex-col">
        <Header
          currentDate={currentDate}
          viewMode={viewMode}
          onViewModeChange={(newMode) => {
            setViewMode(newMode);
          }}
          onPrevPeriod={handlePrevPeriod}
          onNextPeriod={handleNextPeriod}
        />

        <main className="mt-6 sm:mt-8 flex-grow flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-red-300 mb-2">
                Error Loading Stats
              </h3>
              <p className="text-red-200 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-3 sm:p-4 lg:p-6 flex flex-col">
      <Header
        currentDate={currentDate}
        viewMode={viewMode}
        onViewModeChange={(newMode) => {
          setViewMode(newMode);
        }}
        onPrevPeriod={handlePrevPeriod}
        onNextPeriod={handleNextPeriod}
      />

      <main
        key={contentKey}
        className="mt-4 sm:mt-6 flex-grow flex flex-col space-y-4 sm:space-y-6"
      >
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <StatCard
            title="Total Mellows Collected"
            value={formatNumber(totalMellows)}
            icon={
              <CloudIcon className="w-8 h-8 sm:w-10 sm:h-10 text-pink-300" />
            }
            className="animate-fadeInUp"
          />
          <StatCard
            title="Total Focus Time"
            value={Math.round(totalFocusTimeHours).toString()}
            unit="Hrs."
            className="animate-fadeInUp"
          />
          <StatCard
            title="Avg Duration"
            value={Math.round(averageDurationMinutes).toString()}
            unit="min."
            className="animate-fadeInUp"
          />
          <StatCard
            title="Top Time of the Day"
            value="7AM - 10AM"
            className="animate-fadeInUp"
          />
        </div>

        {/* Time Distribution Section */}
        <div className="w-full">
          <TimeDistributionCard
            data={
              timeDistribution.length > 0
                ? timeDistribution
                : [
                    {
                      category: "No Data Available",
                      percentage: 100,
                      duration: "0m",
                      color: "bg-gray-500",
                    },
                  ]
            }
            className="animate-fadeInUp"
          />
        </div>

        {/* Firebase Connection Status */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400">
            Connected to Firebase • Project: mellow-4401e •
            <a
              href="/firebase-test"
              className="text-blue-400 hover:text-blue-300 ml-1"
            >
              Test Connection
            </a>
          </p>
        </div>
      </main>
    </div>
  );
};

export default StatsPage;
