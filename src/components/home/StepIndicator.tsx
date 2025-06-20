import React from "react";

interface StepIndicatorProps {
  step: number;
  active?: boolean;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  step,
  active = false,
}) => {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`
          w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold
          transition-all duration-300 ease-in-out
          ${
            active
              ? "bg-blue-500 text-white shadow-lg scale-110"
              : "bg-gray-200 text-gray-600 hover:bg-gray-300"
          }
        `}
      >
        {step}
      </div>
      <span
        className={`mt-2 text-sm font-medium ${
          active ? "text-blue-600" : "text-gray-500"
        }`}
      >
        Step {step}
      </span>
    </div>
  );
};
