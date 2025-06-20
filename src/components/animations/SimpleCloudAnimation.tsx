"use client";

import React from 'react';
import Image from 'next/image';

// Pure JS inline styles cloud animation without any external libraries
const SimpleCloud = ({ 
  className = '', 
  src,
  width = 150, 
  height = 80,
  delay = 0
}) => {
  const keyframesStyle = `
    @keyframes float {
      0% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-15px) rotate(1deg); }
      100% { transform: translateY(0px) rotate(0deg); }
    }
  `;

  return (
    <div 
      className={`absolute z-0 pointer-events-none ${className}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        animation: `float 6s ease-in-out infinite`,
        animationDelay: `${delay}s`
      }}
    >
      <Image src={src} width={width} height={height} alt="Cloud" />
    </div>
  );
};

const SimpleCloudAnimation = () => {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(1deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
      `}} />
      <SimpleCloud src="/cloud1.svg" className="top-[10%] left-[10%]" width={120} height={60} delay={0} />
      <SimpleCloud src="/cloud2.svg" className="top-[20%] left-[30%]" width={100} height={50} delay={1.2} />
      <SimpleCloud src="/cloud3.svg" className="top-[15%] right-[20%]" width={140} height={70} delay={0.8} />
      <SimpleCloud src="/cloud1.svg" className="top-[30%] right-[10%]" width={110} height={55} delay={2.3} />
      <SimpleCloud src="/cloud2.svg" className="bottom-[30%] left-[15%]" width={130} height={65} delay={1.5} />
      <SimpleCloud src="/cloud3.svg" className="bottom-[20%] right-[25%]" width={90} height={45} delay={0.5} />
    </>
  );
};

export default SimpleCloudAnimation;
