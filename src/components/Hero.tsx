import React from "react";

const Hero: React.FC = () => {
  return (
    <section className="text-center py-16">
      <h1 className="text-5xl font-bold mb-4">
        Where tasks breathe, not scream.
      </h1>
      <p className="text-xl mb-8">
        A task system that lives in both worlds, so you can focus on what
        matters most.
      </p>
      <button className="bg-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors">
        Bridge The Gap
      </button>
    </section>
  );
};

export default Hero;
