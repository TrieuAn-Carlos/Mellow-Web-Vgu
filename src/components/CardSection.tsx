import React from 'react';
import Image from 'next/image';
import FadeIn from './animations/FadeIn';

interface CardSectionProps {
  className?: string;
}

export const CardSection: React.FC<CardSectionProps> = ({ className = '' }) => {
  return (
    <FadeIn delay={700} duration={1000} className={`absolute right-[5%] bottom-[-10%] z-10 transform rotate-[12deg] md:right-[2%] md:bottom-[-5%] sm:hidden ${className}`}>
      <div className="w-[350px] h-auto filter drop-shadow-[0_8px_32px_rgba(63,59,59,0.3)] relative md:w-[280px] transition-all duration-500 hover:rotate-[8deg]">
        <Image 
          src="/kardhome.svg" 
          alt="Task Card" 
          width={350} 
          height={220}
          className="rounded-xl"
        />
      </div>
    </FadeIn>
  );
};

export default CardSection;
