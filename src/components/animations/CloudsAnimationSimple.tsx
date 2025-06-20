"use client";

import React from 'react';
import Image from 'next/image';

// Define props interface
interface CloudProps {
  className?: string;
  src: string;
  width?: number;
  height?: number;
  animationDelay?: string;
}

// CSS-based Cloud component
const Cloud: React.FC<CloudProps> = ({ 
  className = '', 
  src, 
  width = 150, 
  height = 80,
  animationDelay = '0s'
}) => {
  return (
    <div 
      className={`absolute z-0 pointer-events-none ${className}`}
      style={{ 
        animationDelay,
        width: `${width}px`,
        height: `${height}px`,
        animation: `float 6s ease-in-out infinite ${animationDelay}`
      }}
    >
      <Image src={src} width={width} height={height} alt="Cloud" />
    </div>
  );
};

// CloudsAnimationSimple component
const CloudsAnimationSimple: React.FC = () => {
  return (
    <>
      <style global jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-15px) rotate(1deg);
          }
          100% {
            transform: translateY(0) rotate(0deg);
          }
        }
      `}</style>
      <Cloud src="/cloud1.svg" className="top-[10%] left-[10%]" width={120} height={60} animationDelay="0s" />
      <Cloud src="/cloud2.svg" className="top-[20%] left-[30%]" width={100} height={50} animationDelay="1.2s" />
      <Cloud src="/cloud3.svg" className="top-[15%] right-[20%]" width={140} height={70} animationDelay="0.8s" />
      <Cloud src="/cloud1.svg" className="top-[30%] right-[10%]" width={110} height={55} animationDelay="2.3s" />
      <Cloud src="/cloud2.svg" className="bottom-[30%] left-[15%]" width={130} height={65} animationDelay="1.5s" />
      <Cloud src="/cloud3.svg" className="bottom-[20%] right-[25%]" width={90} height={45} animationDelay="0.5s" />
    </>
  );
};

export default CloudsAnimationSimple;
