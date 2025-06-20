import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import StatCard from './components/StatCard';
import TimeDistributionCard from './components/TimeDistributionCard';
import FunFactCard from './components/FunFactCard';
import { CloudIcon } from './components/icons/CloudIcon';
import type { TimeDistributionItemData, ViewMode } from './types';

const App: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [contentKey, setContentKey] = useState(0); // Key to trigger re-animation

  // Update contentKey to re-trigger animations when date or view mode changes
  useEffect(() => {
    setContentKey(prevKey => prevKey + 1);
  }, [currentDate, viewMode]);

  const handlePeriodChange = useCallback((direction: 'prev' | 'next') => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      const increment = direction === 'next' ? 1 : -1;

      switch (viewMode) {
        case 'day':
          newDate.setDate(newDate.getDate() + increment);
          break;
        case 'week':
          newDate.setDate(newDate.getDate() + (7 * increment));
          break;
        case 'month':
          const originalDay = newDate.getDate();
          newDate.setMonth(newDate.getMonth() + increment, 1);
          const daysInNewMonth = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0).getDate();
          newDate.setDate(Math.min(originalDay, daysInNewMonth));
          break;
        case 'year':
          newDate.setFullYear(newDate.getFullYear() + increment);
          break;
      }
      return newDate;
    });
  }, [viewMode]);

  const handlePrevPeriod = useCallback(() => handlePeriodChange('prev'), [handlePeriodChange]);
  const handleNextPeriod = useCallback(() => handlePeriodChange('next'), [handlePeriodChange]);

  const timeDistributionData: TimeDistributionItemData[] = [
    { category: 'German', percentage: 50, duration: '4h', color: 'bg-rose-500' },
    { category: 'Maths!!!', percentage: 30, duration: '2h24m', color: 'bg-teal-500' },
    { category: 'Note Taking', percentage: 19, duration: '1h31m', color: 'bg-fuchsia-500' },
    { category: 'AloT', percentage: 1, duration: '3m', color: 'bg-sky-500' },
  ];
  
  const formatNumber = (num: number) => num.toLocaleString();

  return (
    <div className="min-h-screen text-white p-4 sm:p-6 lg:p-8 flex flex-col">
      <Header 
        currentDate={currentDate} 
        viewMode={viewMode}
        onViewModeChange={(newMode) => {
          setViewMode(newMode);
        }}
        onPrevPeriod={handlePrevPeriod} 
        onNextPeriod={handleNextPeriod} 
      />

      <main key={contentKey} className="mt-6 sm:mt-8 flex-grow flex flex-col space-y-6 sm:space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Mellows Collected" 
            value={formatNumber(27)} 
            icon={<CloudIcon className="w-12 h-12 text-pink-300" />}
            className="animate-fadeInUp"
          />
          <StatCard 
            title="Total Focus Time" 
            value="172"
            unit="Hrs."
            className="animate-fadeInUp"
          />
          <StatCard 
            title="Avg Duration" 
            value="45"
            unit="min."
            className="animate-fadeInUp"
          />
          <StatCard 
            title="Top Time of the Day" 
            value="7AM - 10AM"
            className="animate-fadeInUp"
          />
        </div>

        {/* Lower Section Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TimeDistributionCard 
              data={timeDistributionData} 
              className="animate-fadeInUp"
            />
          </div>
          <div className="lg:col-span-1">
            <FunFactCard 
              factText="You've focused enough time to watch The Dark Knight 10 times." 
              className="animate-fadeInUp"
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
