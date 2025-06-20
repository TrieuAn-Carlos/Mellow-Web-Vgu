import React from "react";
import FadeIn from "../animations/FadeIn";
import FloatingElement from "../animations/FloatingElement";

export const Notepad = () => {
  return (
    <FadeIn
      delay={900}
      duration={1000}
      className="absolute left-[10%] z-15 
        md:left-[15%] md:scale-75
        sm:left-[7%] sm:scale-50 sm:block"
      style={{
        bottom: "-30%",
      }}
    >
      <FloatingElement
        preset="cardFloat"
        delay={1900}
        customParams={{
          translateY: ["-8px", "8px"],
          rotate: ["-11deg", "-9deg"],
        }}
      >
        <div
          className="w-[750px] h-[1016px] transform rotate-[-11deg] filter drop-shadow-[0_10px_40px_rgba(63,59,59,0.25)] relative 
          md:w-[480px] md:h-[650px] sm:w-[320px] sm:h-[430px] transition-all duration-500 hover:rotate-[-7deg]"
          style={
            {
              // Responsive bottom positioning using CSS media queries
            }
          }
        >
          {/* Using the actual kardhome.svg - now with proper aspect ratio! */}
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

export default Notepad;
