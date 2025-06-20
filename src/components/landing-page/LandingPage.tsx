import React, { useCallback } from "react";
import { useRouter } from "next/navigation";
import { HeroSection, Notepad } from "./";
import dynamic from "next/dynamic";
import AnimationOrchestrator from "../animations/AnimationOrchestrator";

// Use dynamic import with no SSR to avoid hydration issues with anime.js
const CloudsAnimation = dynamic(() => import("../animations/CloudsAnimation"), {
  ssr: false,
});

export const LandingPage: React.FC = () => {
  const router = useRouter();

  const handleCtaClick = useCallback(() => {
    router.push("/home");
  }, [router]);

  return (
    <AnimationOrchestrator autoInit={true} initDelay={200}>
      <main className="w-[100vw] h-[100vh] bg-gradient-to-b from-[#f2e9f0] to-[#d8c1d1] relative overflow-hidden">
        <CloudsAnimation />
        <HeroSection onCtaClick={handleCtaClick} />
      </main>
    </AnimationOrchestrator>
  );
};

export default LandingPage;
