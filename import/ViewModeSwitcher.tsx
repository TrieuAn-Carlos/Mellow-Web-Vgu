import React from 'react';
import type { ViewMode } from '../types';

interface ViewModeSwitcherProps {
  currentViewMode: ViewMode;
  onViewModeChange: (viewMode: ViewMode) => void;
}

const viewModes: { id: ViewMode; label: string }[] = [
  { id: 'day', label: 'Day' },
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
  { id: 'year', label: 'Year' },
];

const ViewModeSwitcher: React.FC<ViewModeSwitcherProps> = ({ currentViewMode, onViewModeChange }) => {
  return (
    <div className="bg-slate-700 rounded-full p-1 flex items-center space-x-1 shadow" role="tablist" aria-label="Select time period view">
      {viewModes.map((mode) => (
        <button
          key={mode.id}
          onClick={() => onViewModeChange(mode.id)}
          className={`py-1.5 px-3 sm:px-4 rounded-full text-xs sm:text-sm font-medium transition-all duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800
            ${currentViewMode === mode.id 
              ? 'bg-white text-slate-900 shadow-md' 
              : 'text-slate-300 hover:bg-slate-600 hover:text-white'
            }`}
          role="tab"
          aria-selected={currentViewMode === mode.id}
          aria-controls={`data-panel-${mode.id}`} 
          id={`tab-${mode.id}`}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
};

export default ViewModeSwitcher;