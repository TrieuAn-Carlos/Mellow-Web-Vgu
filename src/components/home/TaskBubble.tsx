import React from "react";

interface TaskBubbleProps {
  totalTasks: number;
}

export const TaskBubble: React.FC<TaskBubbleProps> = ({ totalTasks }) => {
  return (
    <div className="relative animate-float">
      {/* Speech Bubble */}
      <div className="bg-blue-500 text-white px-6 py-4 rounded-2xl shadow-lg max-w-sm relative">
        <p className="text-center font-medium">
          I have a total of {totalTasks} tasks today
        </p>

        {/* Bubble Tail */}
        <div className="absolute bottom-0 left-8 transform translate-y-full">
          <div className="w-0 h-0 border-l-4 border-r-4 border-t-8 border-l-transparent border-r-transparent border-t-blue-500"></div>
        </div>
      </div>
    </div>
  );
};
