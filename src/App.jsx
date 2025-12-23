import React from 'react';
import Hero from './components/Hero';
import ProjectGrid from './components/ProjectGrid';
import BentoGrid from './components/BentoGrid';
import ExperienceTimeline from './components/ExperienceTimeline';

function App() {
  return (
    <div className="min-h-screen bg-[var(--bg-dark)] text-white">
      <main>
        <Hero />
        <ProjectGrid />
        <ExperienceTimeline />
        <BentoGrid />
      </main>
      
      <footer className="py-8 text-center text-gray-500 text-sm border-t border-white/10 glass-card mx-4 mb-4 mt-20">
        <p>© {new Date().getFullYear()} Jose Eduardo Rojas Jimenez. Built with React & Vite.</p>
        <div className="flex justify-center gap-4 mt-4">
          <a href="https://github.com/jxoesneon" className="hover:text-neon-blue transition-colors">GitHub</a>
          <a href="https://www.linkedin.com/in/jose-eduardo-rojas-jiménez-0a8284b1/" className="hover:text-neon-blue transition-colors">LinkedIn</a>
        </div>
      </footer>
    </div>
  );
}

export default App;
