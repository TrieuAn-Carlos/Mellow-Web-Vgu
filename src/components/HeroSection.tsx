import React from 'react';
import Link from 'next/link';
import { MellowLogo } from './icons/MellowLogo';
import FadeIn from './animations/FadeIn';

interface HeroSectionProps {
  onCtaClick?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onCtaClick }) => {
  return (    <section className="relative w-full h-full flex flex-col items-center justify-center text-center p-5 transform translate-y-[-80px] scale-[0.8] font-['SF_Pro_Rounded']">
      <FadeIn delay={100} duration={800}>
        <MellowLogo className="w-[117px] h-[97px] mb-10" />
      </FadeIn>

      <FadeIn delay={300} duration={800}>
        <h1 className="text-[#544350] font-['SF_Pro_Rounded'] text-[clamp(36px,5vw,70px)] font-semibold leading-[1.1] mb-5 max-w-[800px]">
          Where tasks breathe,<br />
          not scream.
        </h1>
      </FadeIn>

      <FadeIn delay={500} duration={800}>
        <p className="text-[#998794] font-['SF_Pro_Rounded'] text-[clamp(18px,2.5vw,35px)] font-normal mb-10 max-w-[700px] leading-[1.3]">
          A task system that lives in both worlds,<br />
          so you can focus on what matters most.
        </p>
      </FadeIn>

      <FadeIn delay={700} duration={800}>
        {onCtaClick ? (
          <button 
            className="bg-gradient-to-b from-[#af68fd] to-[#7144c6] rounded-[10px] text-white font-['SF_Pro_Display'] text-[22px] font-bold py-[18px] px-[32px] cursor-pointer transition-all duration-300 ease-in-out shadow-[0_4px_15px_rgba(113,68,198,0.3)] hover:transform hover:-translate-y-[2px] hover:shadow-[0_6px_20px_rgba(113,68,198,0.4)] md:text-[18px] md:py-[14px] md:px-[28px]"
            onClick={onCtaClick}
          >
            Bridge The Gap
          </button>
        ) : (
          <Link href="/home">
            <button className="bg-gradient-to-b from-[#af68fd] to-[#7144c6] rounded-[10px] text-white font-['SF_Pro_Display'] text-[22px] font-bold py-[18px] px-[32px] cursor-pointer transition-all duration-300 ease-in-out shadow-[0_4px_15px_rgba(113,68,198,0.3)] hover:transform hover:-translate-y-[2px] hover:shadow-[0_6px_20px_rgba(113,68,198,0.4)] md:text-[18px] md:py-[14px] md:px-[28px]">
              Bridge The Gap
            </button>
          </Link>
        )}
      </FadeIn>
    </section>
  );
};

export default HeroSection;
