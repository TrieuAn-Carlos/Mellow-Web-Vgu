"use client";

import React from 'react';
import Image from 'next/image';
import FloatingElement from './FloatingElement';
import { animationPresets } from './AnimationUtils';

// Define props interface
interface CloudProps {
  className?: string;
  src: string;
  width?: number;
  height?: number;
  delay?: number;
}

// Cloud component
export const Cloud: React.FC<CloudProps> = ({ 
  className = '', 
  src, 
  width = 150, 
  height = 80,
  delay = 0
}) => {
  return (
    <FloatingElement 
      preset="cloudFloat"
      delay={delay}
      addVariance={true}
      className={`absolute z-0 pointer-events-none ${className}`}
    >
      <Image src={src} width={width} height={height} alt="Cloud" />
    </FloatingElement>
  );
};

// CloudsAnimation component
const CloudsAnimation: React.FC = () => {
  return (
    <>
      <Cloud src="/cloud1.svg" className="top-[10%] left-[10%]" width={120} height={60} delay={0} />
      <Cloud src="/cloud2.svg" className="top-[20%] left-[30%]" width={100} height={50} delay={200} />
      <Cloud src="/cloud3.svg" className="top-[15%] right-[20%]" width={140} height={70} delay={400} />
      <Cloud src="/cloud1.svg" className="top-[30%] right-[10%]" width={110} height={55} delay={600} />
      <Cloud src="/cloud2.svg" className="bottom-[30%] left-[15%]" width={130} height={65} delay={800} />
      <Cloud src="/cloud3.svg" className="bottom-[20%] right-[25%]" width={90} height={45} delay={1000} />
    </>
  );
};

export default CloudsAnimation;
