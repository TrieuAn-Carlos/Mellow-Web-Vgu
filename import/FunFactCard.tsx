import React from 'react';

interface FunFactCardProps {
  factText: string;
  className?: string;
  style?: React.CSSProperties;
}

const FunFactCard: React.FC<FunFactCardProps> = ({ factText, className, style }) => {
  return (
    <div 
      className={`bg-slate-800 p-6 rounded-xl shadow-lg h-full flex flex-col items-center justify-center text-center ${className || ''}`}
      style={style}
    >
      <div className="text-4xl text-slate-600 font-serif -mb-2">“</div>
      <p className="text-base sm:text-lg text-slate-200 my-4 leading-relaxed">
        {factText}
      </p>
      <div className="text-4xl text-slate-600 font-serif -mt-2">”</div>
    </div>
  );
};

export default FunFactCard;