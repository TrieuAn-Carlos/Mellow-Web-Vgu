import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, unit, icon, className, style }) => {
  return (
    <div 
      className={`bg-slate-800 p-6 rounded-xl shadow-lg flex flex-col justify-between h-full ${className || ''}`}
      style={style}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <span className="text-3xl sm:text-4xl font-bold text-white">
            {value}
            {unit && <span className="text-2xl sm:text-3xl"> {unit}</span>}
          </span>
        </div>
        {icon && <div className="ml-4 flex-shrink-0">{icon}</div>}
      </div>
      <p className="text-sm text-slate-400 mt-2">{title}</p>
    </div>
  );
};

export default StatCard;