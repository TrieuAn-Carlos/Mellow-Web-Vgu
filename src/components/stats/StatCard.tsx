import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  unit,
  icon,
  className,
  style,
}) => {
  return (
    <div
      className={`bg-slate-800/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 hover:bg-slate-800/90 ${
        className || ""
      }`}
      style={style}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex flex-col">
          <div className="flex items-baseline">
            <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-none">
              {value}
            </span>
            {unit && (
              <span className="text-lg sm:text-xl lg:text-2xl text-slate-300 ml-1">
                {unit}
              </span>
            )}
          </div>
        </div>
        {icon && <div className="flex-shrink-0 opacity-80">{icon}</div>}
      </div>
      <p className="text-xs sm:text-sm text-slate-400 leading-tight">{title}</p>
    </div>
  );
};

export default StatCard;
