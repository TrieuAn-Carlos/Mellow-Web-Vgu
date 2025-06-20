import React from "react";
import type { TimeDistributionItemData } from "@/types/stats";

interface TimeDistributionItemProps {
  item: TimeDistributionItemData;
}

const TimeDistributionItem: React.FC<TimeDistributionItemProps> = ({
  item,
}) => {
  return (
    <div className="flex items-center space-x-3 sm:space-x-4 my-3.5">
      <div className="w-10 sm:w-12 text-xs sm:text-sm font-medium text-slate-300 flex-shrink-0 text-left">
        {item.percentage}%
      </div>
      <div className="flex-grow h-5 sm:h-6 bg-slate-700 rounded-full overflow-hidden shadow-inner">
        <div
          className={`${item.color} h-full rounded-full`}
          style={{ width: `${item.percentage}%` }}
          aria-valuenow={item.percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          role="progressbar"
          aria-label={`${item.category} ${item.percentage}%`}
        ></div>
      </div>
      <div className="w-20 sm:w-28 text-right flex-shrink-0">
        <div
          className="text-xs sm:text-sm font-semibold text-white truncate"
          title={item.category}
        >
          {item.category}
        </div>
        <div className="text-xxs sm:text-xs text-slate-400">
          {item.duration}
        </div>
      </div>
    </div>
  );
};

interface TimeDistributionCardProps {
  data: TimeDistributionItemData[];
  className?: string;
  style?: React.CSSProperties;
}

const TimeDistributionCard: React.FC<TimeDistributionCardProps> = ({
  data,
  className,
  style,
}) => {
  return (
    <div
      className={`bg-slate-800 p-6 rounded-xl shadow-lg h-full ${
        className || ""
      }`}
      style={style}
    >
      <h2 className="text-lg font-semibold text-white mb-4">
        Time Distribution
      </h2>
      <div>
        {data.map((item, index) => (
          <TimeDistributionItem key={index} item={item} />
        ))}
      </div>
    </div>
  );
};

export default TimeDistributionCard;
