import React from "react";
import Link from "next/link";
import { MellowLogo } from "../icons/MellowLogo";
import FadeIn from "../animations/FadeIn";
import FloatingElement from "../animations/FloatingElement";
import TextAnimation from "../animations/TextAnimation";
import SimpleTextAnimation from "../animations/SimpleTextAnimation";
import AnimatedButton from "../animations/AnimatedButton";

interface HeroSectionProps {
  onCtaClick?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onCtaClick }) => {
  return (
    <section className="relative w-full h-full flex flex-col items-center justify-center text-center p-5 transform translate-y-[-80px] scale-[0.8]">      <FadeIn delay={100} duration={800}>
        <FloatingElement 
          preset="logoFloat" 
          delay={1000} 
          customParams={{ smoothStart: true, delayStart: true }}
        >
          <MellowLogo className="w-[146px] h-[121px] mb-10" />
        </FloatingElement>
      </FadeIn>
      
      <FadeIn delay={300} duration={800}>          <SimpleTextAnimation 
          delay={1100} 
          floatDelay={1000} // Increased delay for smoother transition
          className="text-[#544350] text-[clamp(45px,6.25vw,87px)] font-semibold leading-[1.1] mb-5 max-w-[1000px]"
        >
          Where tasks breathe,
          <br />
          not scream.
        </SimpleTextAnimation>
      </FadeIn>

      <FadeIn delay={500} duration={800}>
        <SimpleTextAnimation 
          delay={1300}
          floatDelay={1200} // Increased delay for smoother transition
          className="text-[#998794] text-[clamp(22px,3.1vw,44px)] font-normal mb-10 max-w-[875px] leading-[1.3]"
        >
          A task system that lives in both worlds,
          <br />
          so you can focus on what matters most.
        </SimpleTextAnimation>
      </FadeIn>

      <FadeIn delay={700} duration={800}>
        {onCtaClick ? (
          <AnimatedButton
            onClick={onCtaClick}
            floatDelay={1500}
            className="bg-gradient-to-b from-[#af68fd] to-[#7144c6] rounded-[12px] text-white text-[27px] font-bold py-[22px] px-[40px] cursor-pointer md:text-[22px] md:py-[17px] md:px-[35px]"
          >
            Bridge The Gap
          </AnimatedButton>
        ) : (
          <Link href="/home">
            <AnimatedButton
              floatDelay={1500}
              className="bg-gradient-to-b from-[#af68fd] to-[#7144c6] rounded-[12px] text-white text-[27px] font-bold py-[22px] px-[40px] cursor-pointer md:text-[22px] md:py-[17px] md:px-[35px]"
            >
              Bridge The Gap
            </AnimatedButton>
          </Link>
        )}
      </FadeIn>
    </section>
  );
};

export default HeroSection;
