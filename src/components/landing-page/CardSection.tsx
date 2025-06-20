import React from "react";
import Image from "next/image";
import FadeIn from "../animations/FadeIn";
import FloatingElement from "../animations/FloatingElement";

interface CardSectionProps {
  className?: string;
}

export const CardSection: React.FC<CardSectionProps> = ({ className = "" }) => {
  return (
    <FadeIn
      delay={700}
      duration={1000}
      className={`absolute left-[15%] bottom-[25%] z-20 transform rotate-[12deg] 
        md:left-[5%] md:bottom-[15%] md:scale-75
        sm:left-[5%] sm:bottom-[10%] sm:scale-50 sm:block ${className}`}
    >
      <FloatingElement
        preset="cardFloat"
        delay={1700}
        customParams={{
          translateY: ["-8px", "8px"],
          translateX: ["-5px", "5px"],
          rotate: ["12deg", "14deg"],
        }}
      >
        <div
          className="w-[350px] h-auto filter drop-shadow-[0_8px_32px_rgba(63,59,59,0.3)] relative 
          md:w-[280px] sm:w-[200px] transition-all duration-500 hover:rotate-[12deg]"
        >
          <Image
            src="/kardhome.svg"
            alt="Task Card"
            width={350}
            height={220}
            className="rounded-xl"
            priority
          />
        </div>
      </FloatingElement>
    </FadeIn>
  );
};

export default CardSection;
