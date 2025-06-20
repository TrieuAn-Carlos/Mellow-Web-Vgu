import React from "react";
import FadeIn from "../animations/FadeIn";
import FloatingElement from "../animations/FloatingElement";

interface NoteCardProps {
  className?: string;
}

export const NoteCard: React.FC<NoteCardProps> = ({ className = "" }) => {
  return (
    <FadeIn delay={1000} duration={1000} className={className}>
      <FloatingElement
        preset="cardFloat"
        delay={2000}
        customParams={{
          translateY: ["-10px", "10px"],
          translateX: ["-7px", "7px"],
          rotate: ["-8deg", "-6deg"],
        }}
      >
        <div
          className="filter drop-shadow-[0_10px_40px_rgba(63,59,59,0.25)] transition-all duration-500 hover:scale-105
            md:w-[800px] md:h-[600px] sm:w-[600px] sm:h-[450px]"
          style={{
            width: "1000px",
            height: "750px",
            transform: "rotate(-8deg)",
          }}
        >
          {/* Using your actual kardhome.svg */}
          <img
            src="/kardhome.svg"
            alt="Handwritten notepad with today's tasks"
            className="w-full h-full object-contain"
          />
        </div>
      </FloatingElement>
    </FadeIn>
  );
};

export default NoteCard;
