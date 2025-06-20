import React from 'react';

type CheckboxType = 'empty' | 'half-filled' | 'completed' | 'crosshair' | 'bullet';

interface TaskItemProps {
  text: string;
  type: CheckboxType;
  completed?: boolean;
}

export const TaskCheckbox = ({ type }: { type: CheckboxType }) => {
  if (type === 'bullet') {
    return (
      <div className="w-[19px] h-[19px] flex items-center justify-center text-[#c7c7c7] text-base mr-[15px] flex-shrink-0">
        •
      </div>
    );
  }

  return (
    <div 
      className={`
        w-[19px] h-[19px] rounded-full mr-[15px] flex-shrink-0 relative
        ${type === 'empty' ? 'border border-[#c7c7c7]' : ''}
        ${type === 'half-filled' ? 'bg-gradient-to-r from-[#858181] from-50% to-transparent to-50% border border-[#858181]' : ''}
        ${type === 'completed' ? 'bg-[#858181] border border-[#858181]' : ''}
        ${type === 'crosshair' ? 'border border-[#c7c7c7]' : ''}
      `}
    >
      {type === 'completed' && (
        <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-xs font-bold">
          ✓
        </span>
      )}
      
      {type === 'crosshair' && (
        <>
          <span className="absolute top-1/2 left-1/2 w-2 h-[1px] bg-[#c7c7c7] transform -translate-x-1/2 -translate-y-1/2"></span>
          <span className="absolute top-1/2 left-1/2 w-[1px] h-2 bg-[#c7c7c7] transform -translate-x-1/2 -translate-y-1/2"></span>
        </>
      )}
    </div>
  );
};

export const TaskItem = ({ text, type, completed = false }: TaskItemProps) => {
  return (
    <div className="flex items-center mb-[5px] relative">
      <TaskCheckbox type={type} />
      <span className={`font-['Sue_Ellen_Francisco'] text-2xl flex-1 ${completed ? 'line-through text-[#858181]' : 'text-black'}`}>
        {text}
      </span>
      <div className="absolute bottom-[-2px] left-[34px] right-0 h-[1px] bg-[#c7c7c7]"></div>
    </div>
  );
};

export default TaskItem;
